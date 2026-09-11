import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const REGIONS = 'content/politics/source/politics_unified_regions.v1.jsonl';

function absolute(relativePath) { return path.join(repoRoot, relativePath); }
function exists(relativePath) { return fs.existsSync(absolute(relativePath)); }
function readJson(relativePath) { return JSON.parse(fs.readFileSync(absolute(relativePath), 'utf8')); }
function asList(value) { return Array.isArray(value) ? value : (value == null ? [] : [value]); }

function readJsonl(relativePath) {
  if (!exists(relativePath)) return [];
  return fs.readFileSync(absolute(relativePath), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(JSON.parse);
}

function sidecarPath(chapterSourcePath, kind) {
  return String(chapterSourcePath || '').replace(/\.json$/i, `.${kind}.json`);
}

let ownershipCache;
function questionOwnershipIndex() {
  if (ownershipCache) return ownershipCache;
  const byQuestion = new Map();
  for (const row of readJsonl(REGIONS)) {
    if (row?.status && row.status !== 'canonical') continue;
    for (const questionId of asList(row?.xiao_question_refs).map(String).filter(Boolean)) {
      if (!byQuestion.has(questionId)) byQuestion.set(questionId, []);
      byQuestion.get(questionId).push(row);
    }
  }
  ownershipCache = byQuestion;
  return ownershipCache;
}

function ownerHit(row) {
  return {
    kind: 'CURRENT_UNIT_OWNERSHIP',
    natural_unit_id: String(row?.natural_unit_id || ''),
    region_id: String(row?.unified_region_id || ''),
    title: String(row?.title || ''),
    chengfeng_refs: asList(row?.chengfeng_refs).map(String).filter(Boolean),
    source_basis: 'CURRENT_POLITICS_UNIFIED_REGIONS'
  };
}

function noteHit(value, kind) {
  if (typeof value === 'string') {
    return { kind, note: value, source_basis: 'APPROVED_REPAIR_PROJECTION' };
  }
  if (!value || typeof value !== 'object') return null;
  return {
    kind,
    ...value,
    source_basis: String(value.source_basis || 'APPROVED_REPAIR_PROJECTION')
  };
}

function dedupeHits(hits) {
  const seen = new Set();
  return hits.filter(Boolean).filter((hit) => {
    const key = [hit.kind, hit.natural_unit_id, hit.region_id, hit.note, hit.title, hit.source_basis].map((v) => String(v || '')).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function repairForQuestion(questionId, currentUnitIds, repairProjection) {
  const projected = repairProjection?.repairs?.[questionId] || null;
  const owners = questionOwnershipIndex().get(questionId) || [];
  const current = [];
  const cross = [];
  const currentSet = new Set(currentUnitIds);

  for (const row of owners) {
    const hit = ownerHit(row);
    if (currentSet.has(hit.natural_unit_id)) current.push(hit);
    else cross.push(hit);
  }

  for (const hit of asList(projected?.current_unit_hits)) current.push(noteHit(hit, 'CURRENT_UNIT_SEMANTIC_HIT'));
  for (const hit of asList(projected?.cross_unit_hits)) cross.push(noteHit(hit, 'CROSS_UNIT_SEMANTIC_HIT'));

  if (!projected && !current.length && !cross.length) return null;
  return {
    ...(projected || {}),
    current_unit_hits: dedupeHits(current),
    cross_unit_hits: dedupeHits(cross),
    source_priority: repairProjection?.source_priority || [],
    semantic_authority_rule: String(repairProjection?.semantic_authority_rule || '')
  };
}

export function enrichPoliticsChapterCurrent(chapter) {
  if (!chapter?.sourcePath) return chapter;

  const repairPath = sidecarPath(chapter.sourcePath, 'repair');
  const memoryPath = sidecarPath(chapter.sourcePath, 'memory');
  const repairProjection = exists(repairPath) ? readJson(repairPath) : null;
  const memoryProjection = exists(memoryPath) ? readJson(memoryPath) : null;

  if (!repairProjection && !memoryProjection) return chapter;

  const units = (chapter.units || []).map((unit) => {
    const currentUnitIds = asList(unit.representedNaturalUnitIds).map(String).filter(Boolean);
    const questions = (unit.questions || []).map((question) => ({
      ...question,
      repair: repairForQuestion(question.id, currentUnitIds, repairProjection)
    }));
    return { ...unit, questions };
  });

  return {
    ...chapter,
    units,
    repairProjection,
    repairProjectionPath: repairProjection ? repairPath : '',
    memoryProjection,
    memoryProjectionPath: memoryProjection ? memoryPath : ''
  };
}
