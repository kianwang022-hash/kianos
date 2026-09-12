import fs from 'node:fs';
import path from 'node:path';
import { loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEARNING_ROOT = path.join(repoRoot, 'content/politics/learning/history');
const REGIONS = path.join(repoRoot, 'content/politics/source/politics_unified_regions.v1.jsonl');
const NODE_SHARDS = path.join(repoRoot, 'content/politics/source/nodes/shards');

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(JSON.parse);
}
function asList(value) { return Array.isArray(value) ? value.map(String).filter(Boolean) : (value ? [String(value)] : []); }
function uniq(values) { return [...new Set(values.filter(Boolean))]; }

const regionRows = readJsonl(REGIONS).filter((row) => row?.status === 'canonical' && row?.subject === 'HISTORY');
const regionByUnit = new Map(regionRows.map((row) => [String(row.natural_unit_id), row]));
const shardCache = new Map();

function shardPathForNode(nodeId) {
  const id = String(nodeId || '');
  if (id.startsWith('POL27-CF-HISTORY-')) {
    const chapter = id.match(/-C(\d{2})(?:-|$)/)?.[1];
    return chapter ? path.join(NODE_SHARDS, 'pol27-cf', 'history', `c${chapter}.json`) : '';
  }
  if (id.startsWith('POL27-SY-HISTORY-')) {
    const page = id.match(/-P(\d{3})(?:-|$)/)?.[1];
    return page ? path.join(NODE_SHARDS, 'pol27-sy', 'history', `p${page}.json`) : '';
  }
  return '';
}

function nodeRow(nodeId) {
  const file = shardPathForNode(nodeId);
  if (!file || !fs.existsSync(file)) return null;
  if (!shardCache.has(file)) shardCache.set(file, readJson(file));
  return shardCache.get(file)?.[nodeId] || null;
}

function ownerRoots(refs) {
  const values = uniq(asList(refs));
  const kRoots = values.filter((id) => /-K\d+$/i.test(id));
  if (kRoots.length) return kRoots;
  return values.filter((id) => !values.some((other) => other !== id && id.startsWith(`${other}-`)));
}

function stageSignals(unit) {
  const listSignals = [
    ...asList(unit?.cause_layers),
    ...asList(unit?.what_to_hold),
    ...asList(unit?.major_boundaries),
    ...asList(unit?.boundaries),
    ...asList(unit?.gains),
    ...asList(unit?.failure_causes),
    ...asList(unit?.conditions)
  ];
  const scalarSignals = [
    unit?.cause,
    unit?.process,
    unit?.turning_point,
    unit?.evaluation,
    unit?.historical_role,
    unit?.stage_shift,
    unit?.program,
    unit?.relation,
    unit?.next
  ];
  return [...listSignals, ...scalarSignals].filter(Boolean).length;
}

function chapterShapeProblems(raw) {
  const problems = [];
  const orientation = raw?.chapter_orientation || {};
  const compression = raw?.chapter_compression || {};
  if (!String(orientation?.core_problem || '').trim()) problems.push('MISSING_CHAPTER_CORE_PROBLEM');
  if (!asList(orientation?.stage_story).length) problems.push('MISSING_CHAPTER_STAGE_STORY');
  const compressionSignal = asList(compression?.timeline).length
    + asList(compression?.reconstruction_chain).length
    + Number(Boolean(String(compression?.causal_chain || compression?.historical_direction || '').trim()));
  if (!compressionSignal) problems.push('MISSING_CHAPTER_COMPRESSION_CHAIN');
  if (!String(compression?.review_prompt || '').trim()) problems.push('MISSING_CHAPTER_REVIEW_PROMPT');
  return problems;
}

const blockers = [];
const reviewQueue = [];
const chapters = [];
const allUnitIds = new Set();

for (const name of fs.readdirSync(LEARNING_ROOT).filter((file) => /^ch\d+\.json$/i.test(file)).sort()) {
  const chapterCode = path.basename(name, '.json').toLowerCase();
  const raw = readJson(path.join(LEARNING_ROOT, name));
  const current = loadPoliticsChapterCurrent('history', chapterCode);
  const declared = asList(raw?.source_bindings?.natural_unit_ids);
  const projected = asList(raw?.units).map((unit) => String(unit?.natural_unit_id || '')).filter(Boolean);
  const chapterSuyi = new Set(asList(raw?.source_bindings?.suyi_refs));
  const currentRepresented = new Set(current.units.flatMap((unit) => asList(unit?.representedNaturalUnitIds)));

  if (declared.length !== projected.length || declared.some((id) => !projected.includes(id))) {
    blockers.push({ chapter: chapterCode, code: 'UNIT_DECLARATION_PROJECTION_MISMATCH', declared, projected });
  }
  for (const code of chapterShapeProblems(raw)) blockers.push({ chapter: chapterCode, code });

  const chapterReport = {
    chapter: chapterCode,
    title: raw?.teaching_title || current.title,
    units: [],
    blockerCount: 0,
    reviewCount: 0
  };

  for (const unit of asList(raw?.units)) {
    const unitId = String(unit?.natural_unit_id || '');
    if (!unitId) continue;
    allUnitIds.add(unitId);
    const region = regionByUnit.get(unitId) || null;
    const priority = String(region?.chat_decision?.priority || 'UNKNOWN');
    const sourceRefs = asList(region?.chengfeng_refs);
    const suyiRefs = asList(region?.suyi_refs);
    const sourceOwners = ownerRoots(sourceRefs);
    const sourceMissing = sourceRefs.filter((id) => !nodeRow(id));
    const suyiMissing = suyiRefs.filter((id) => !nodeRow(id));
    const rootReview = sourceOwners
      .map((id) => ({ id, status: String(nodeRow(id)?.verification_status || '') }))
      .filter((row) => row.status && row.status !== 'source_bound_cross_engine_ocr');
    const currentUnit = current.units.find((candidate) => asList(candidate?.representedNaturalUnitIds).includes(unitId));
    const signals = stageSignals(unit);
    const localBlockers = [];
    const localReview = [];

    if (!region) localBlockers.push('MISSING_CANONICAL_REGION');
    if (!sourceRefs.length) localBlockers.push('NO_CHENGFENG_SOURCE_REFS');
    if (sourceMissing.length) localBlockers.push(`UNRESOLVED_CHENGFENG:${sourceMissing.join(',')}`);
    if (suyiMissing.length) localBlockers.push(`UNRESOLVED_SUYI:${suyiMissing.join(',')}`);
    if (!currentRepresented.has(unitId) || !currentUnit) localBlockers.push('NOT_REPRESENTED_IN_CURRENT_LEARNER_PROJECTION');
    if (currentUnit && sourceRefs.length && !currentUnit.sourceNodes?.length) localBlockers.push('SOURCE_NOT_RENDERABLE');
    if (!String(unit?.stage_question || '').trim()) localBlockers.push('MISSING_STAGE_QUESTION');
    if (!signals) localBlockers.push('MISSING_STAGE_CAUSE_TURNING_POINT_EVALUATION_SIGNAL');

    if ((priority === 'P0' || priority === 'P1') && signals < 2) localReview.push('HIGH_PRIORITY_HISTORY_PROJECTION_THIN');
    if (rootReview.length) localReview.push(`SOURCE_ROOT_REVIEW:${rootReview.map((row) => `${row.id}:${row.status}`).join('|')}`);
    if (suyiRefs.length) localReview.push(`SUYI_DELTA_REVIEW:${suyiRefs.length}`);
    for (const ref of suyiRefs) if (!chapterSuyi.has(ref)) localReview.push(`SUYI_BINDING_DRIFT:${ref}`);

    for (const code of localBlockers) blockers.push({ chapter: chapterCode, unit_id: unitId, priority, code });
    for (const code of uniq(localReview)) reviewQueue.push({ chapter: chapterCode, unit_id: unitId, priority, code });

    chapterReport.units.push({
      unit_id: unitId,
      title: unit?.title || region?.title || '',
      priority,
      source_ref_count: sourceRefs.length,
      source_owner_count: sourceOwners.length,
      suyi_ref_count: suyiRefs.length,
      stage_signal_count: signals,
      blocker_count: localBlockers.length,
      review_count: uniq(localReview).length
    });
    chapterReport.blockerCount += localBlockers.length;
    chapterReport.reviewCount += uniq(localReview).length;
  }
  chapters.push(chapterReport);
}

const regionIds = new Set(regionRows.map((row) => String(row.natural_unit_id)));
const orphanCanonicalRegions = [...regionIds].filter((id) => !allUnitIds.has(id));
for (const unitId of orphanCanonicalRegions) {
  reviewQueue.push({
    chapter: unitId.match(/-C(\d{2})/)?.[1] ? `ch${unitId.match(/-C(\d{2})/)[1]}` : 'unknown',
    unit_id: unitId,
    priority: regionByUnit.get(unitId)?.chat_decision?.priority || 'UNKNOWN',
    code: 'CANONICAL_REGION_NOT_TOP_LEVEL_PROJECTION'
  });
}

const severity = { P0: 0, P1: 1, P2: 2, UNKNOWN: 3 };
reviewQueue.sort((a, b) => (severity[a.priority] ?? 9) - (severity[b.priority] ?? 9) || a.chapter.localeCompare(b.chapter) || a.unit_id.localeCompare(b.unit_id));

const compact = {
  status: blockers.length ? 'BLOCKED' : reviewQueue.length ? 'PASS_WITH_REVIEW_QUEUE' : 'PASS',
  scope: 'HISTORY_ALL_CHAPTERS_CONTENT',
  teaching_shape: 'CHRONOLOGY_STAGE_TURNING_POINT_CAUSE_EVALUATION',
  chapter_count: chapters.length,
  projected_unit_count: allUnitIds.size,
  canonical_region_count: regionRows.length,
  blocker_count: blockers.length,
  review_count: reviewQueue.length,
  p0_review_count: reviewQueue.filter((row) => row.priority === 'P0').length,
  p1_review_count: reviewQueue.filter((row) => row.priority === 'P1').length,
  chapters: chapters.map((chapter) => ({
    chapter: chapter.chapter,
    title: chapter.title,
    units: chapter.units.length,
    blockers: chapter.blockerCount,
    reviews: chapter.reviewCount
  })),
  blockers,
  review_queue: reviewQueue
};

console.log('POLITICS_HISTORY_CONTENT_AUDIT');
console.log(JSON.stringify(compact, null, 2));
if (blockers.length) process.exit(2);
