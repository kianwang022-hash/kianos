import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEARNING_ROOT = 'content/politics/learning/marxism';
const REGIONS = 'content/politics/source/politics_unified_regions.v1.jsonl';

function absolute(relativePath) { return path.join(repoRoot, relativePath); }
function asList(value) { return Array.isArray(value) ? value.map(String).filter(Boolean) : (value ? [String(value)] : []); }
function readJson(relativePath) { return JSON.parse(fs.readFileSync(absolute(relativePath), 'utf8')); }
function readJsonl(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(JSON.parse);
}

let cache;
function buildIndex() {
  if (cache) return cache;

  const orderedUnitIds = [];
  const seenUnits = new Set();
  const chapterFiles = fs.readdirSync(absolute(LEARNING_ROOT))
    .filter((name) => /^ch\d+\.json$/i.test(name))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  for (const name of chapterFiles) {
    const chapter = readJson(`${LEARNING_ROOT}/${name}`);
    const units = Array.isArray(chapter?.unit_projections) ? chapter.unit_projections : [];
    for (const unit of units) {
      const ids = [String(unit?.natural_unit_id || ''), ...asList(unit?.embedded_natural_unit_ids)].filter(Boolean);
      for (const id of ids) {
        if (seenUnits.has(id)) continue;
        seenUnits.add(id);
        orderedUnitIds.push(id);
      }
    }
  }

  const regions = new Map();
  for (const row of readJsonl(REGIONS)) {
    if (row?.status !== 'canonical' || row?.subject !== 'MARX' || !row?.natural_unit_id) continue;
    regions.set(String(row.natural_unit_id), row);
  }

  const ownerByQuestion = new Map();
  const questionsByOwner = new Map();
  const missingRegions = [];
  for (const unitId of orderedUnitIds) {
    const row = regions.get(unitId);
    if (!row) {
      missingRegions.push(unitId);
      continue;
    }
    for (const questionId of asList(row?.xiao_question_refs)) ownerByQuestion.set(questionId, unitId);
  }

  for (const [questionId, ownerId] of ownerByQuestion.entries()) {
    if (!questionsByOwner.has(ownerId)) questionsByOwner.set(ownerId, []);
    questionsByOwner.get(ownerId).push(questionId);
  }
  for (const questions of questionsByOwner.values()) questions.sort();

  cache = { orderedUnitIds, regions, ownerByQuestion, questionsByOwner, missingRegions };
  return cache;
}

function unitIds(unit) {
  return new Set([String(unit?.unitId || ''), ...asList(unit?.representedNaturalUnitIds)].filter(Boolean));
}

export function marxismFirstReadyOwnerForQuestion(questionId) {
  return buildIndex().ownerByQuestion.get(String(questionId || '')) || '';
}

export function applyMarxismGlobalFirstReady(chapter, subject) {
  if (subject !== 'marxism') return chapter;
  const index = buildIndex();
  const units = (chapter?.units || []).map((unit) => {
    const represented = unitIds(unit);
    const questions = (unit?.questions || []).filter((question) => {
      const owner = index.ownerByQuestion.get(String(question?.id || ''));
      return Boolean(owner && represented.has(owner));
    });
    return {
      ...unit,
      questions,
      questionRefCount: questions.length,
      unresolvedQuestionIds: [],
      formalFirstReadyOwnerIds: [...represented].filter((id) => index.orderedUnitIds.includes(id))
    };
  });

  return {
    ...chapter,
    units,
    projectionMode: chapter?.projectionMode
      ? `${chapter.projectionMode}+MARXISM_GLOBAL_LAST_NECESSARY_OWNER`
      : 'MARXISM_GLOBAL_LAST_NECESSARY_OWNER'
  };
}

export function marxismFirstReadyDiagnostics() {
  const index = buildIndex();
  return {
    orderedUnitIds: [...index.orderedUnitIds],
    missingRegions: [...index.missingRegions],
    questionCount: index.ownerByQuestion.size,
    counts: Object.fromEntries(index.orderedUnitIds.map((id) => [id, index.questionsByOwner.get(id)?.length || 0]))
  };
}
