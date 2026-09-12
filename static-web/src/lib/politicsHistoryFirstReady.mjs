import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEARNING_ROOT = 'content/politics/learning/history';
const REGIONS = 'content/politics/source/politics_unified_regions.v1.jsonl';

function absolute(relativePath) { return path.join(repoRoot, relativePath); }
function asList(value) { return Array.isArray(value) ? value.map(String).filter(Boolean) : (value ? [String(value)] : []); }
function uniq(values) { return [...new Set(values.filter(Boolean))]; }
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

  const orderedCanonicalUnitIds = [];
  const learnerGroups = [];
  const seenUnits = new Set();
  const chapterFiles = fs.readdirSync(absolute(LEARNING_ROOT))
    .filter((name) => /^ch\d+\.json$/i.test(name))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  for (const name of chapterFiles) {
    const chapter = readJson(`${LEARNING_ROOT}/${name}`);
    const units = Array.isArray(chapter?.units) ? chapter.units : [];
    for (const unit of units) {
      const represented = uniq([
        String(unit?.natural_unit_id || ''),
        ...asList(unit?.embedded_natural_unit_ids)
      ]);
      if (!represented.length) continue;
      learnerGroups.push({
        chapter: path.basename(name, '.json').toLowerCase(),
        learnerUnitId: represented[0],
        representedNaturalUnitIds: represented
      });
      for (const id of represented) {
        if (seenUnits.has(id)) continue;
        seenUnits.add(id);
        orderedCanonicalUnitIds.push(id);
      }
    }
  }

  const regions = new Map();
  for (const row of readJsonl(REGIONS)) {
    if (row?.status !== 'canonical' || row?.subject !== 'HISTORY' || !row?.natural_unit_id) continue;
    regions.set(String(row.natural_unit_id), row);
  }

  const missingRegions = orderedCanonicalUnitIds.filter((id) => !regions.has(id));
  const unrepresentedRegions = [...regions.keys()].filter((id) => !seenUnits.has(id));

  // Iterating in learner order means a later canonical owner overwrites an earlier one.
  // The surviving owner is therefore the last Natural Unit whose knowledge is required by the question.
  const ownerByQuestion = new Map();
  for (const unitId of orderedCanonicalUnitIds) {
    const row = regions.get(unitId);
    if (!row) continue;
    for (const questionId of asList(row?.xiao_question_refs)) ownerByQuestion.set(questionId, unitId);
  }

  const questionsByOwner = new Map();
  for (const [questionId, ownerId] of ownerByQuestion.entries()) {
    if (!questionsByOwner.has(ownerId)) questionsByOwner.set(ownerId, []);
    questionsByOwner.get(ownerId).push(questionId);
  }
  for (const values of questionsByOwner.values()) values.sort();

  const learnerGroupByCanonicalOwner = new Map();
  for (const group of learnerGroups) {
    for (const id of group.representedNaturalUnitIds) learnerGroupByCanonicalOwner.set(id, group.learnerUnitId);
  }

  const countsByLearnerUnit = new Map();
  for (const ownerId of ownerByQuestion.values()) {
    const learnerUnitId = learnerGroupByCanonicalOwner.get(ownerId) || ownerId;
    countsByLearnerUnit.set(learnerUnitId, (countsByLearnerUnit.get(learnerUnitId) || 0) + 1);
  }

  cache = {
    orderedCanonicalUnitIds,
    learnerGroups,
    regions,
    ownerByQuestion,
    questionsByOwner,
    learnerGroupByCanonicalOwner,
    countsByLearnerUnit,
    missingRegions,
    unrepresentedRegions
  };
  return cache;
}

function representedIds(unit) {
  return new Set([
    String(unit?.unitId || ''),
    ...asList(unit?.representedNaturalUnitIds)
  ].filter(Boolean));
}

export function historyFirstReadyOwnerForQuestion(questionId) {
  return buildIndex().ownerByQuestion.get(String(questionId || '')) || '';
}

export function applyHistoryGlobalFirstReady(chapter, subject) {
  if (subject !== 'history') return chapter;
  const index = buildIndex();
  const units = (chapter?.units || []).map((unit) => {
    const represented = representedIds(unit);
    const questions = (unit?.questions || []).filter((question) => {
      const owner = index.ownerByQuestion.get(String(question?.id || ''));
      return Boolean(owner && represented.has(owner));
    });
    return {
      ...unit,
      questions,
      questionRefCount: questions.length,
      unresolvedQuestionIds: [],
      formalHistoryFirstReadyOwnerIds: [...represented].filter((id) => index.orderedCanonicalUnitIds.includes(id))
    };
  });

  return {
    ...chapter,
    units,
    projectionMode: chapter?.projectionMode
      ? `${chapter.projectionMode}+HISTORY_GLOBAL_LAST_NECESSARY_OWNER`
      : 'HISTORY_GLOBAL_LAST_NECESSARY_OWNER'
  };
}

export function historyFirstReadyDiagnostics() {
  const index = buildIndex();
  return {
    orderedCanonicalUnitIds: [...index.orderedCanonicalUnitIds],
    learnerGroups: index.learnerGroups.map((group) => ({ ...group, representedNaturalUnitIds: [...group.representedNaturalUnitIds] })),
    missingRegions: [...index.missingRegions],
    unrepresentedRegions: [...index.unrepresentedRegions],
    questionCount: index.ownerByQuestion.size,
    countsByCanonicalOwner: Object.fromEntries(index.orderedCanonicalUnitIds.map((id) => [id, index.questionsByOwner.get(id)?.length || 0])),
    countsByLearnerUnit: Object.fromEntries(index.learnerGroups.map((group) => [group.learnerUnitId, index.countsByLearnerUnit.get(group.learnerUnitId) || 0]))
  };
}
