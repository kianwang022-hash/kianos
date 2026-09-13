import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEARNING_ROOT = path.join(repoRoot, 'content/politics/learning/mao');
const REGIONS = path.join(repoRoot, 'content/politics/source/politics_unified_regions.v1.jsonl');
const NODE_SHARDS = path.join(repoRoot, 'content/politics/source/nodes/shards');
const NODE_MANIFEST = path.join(repoRoot, 'content/politics/source/nodes/manifest.json');
const SOURCE_REVIEW = path.join(LEARNING_ROOT, 'source-review.json');
const SEMANTIC_REVIEW = path.join(LEARNING_ROOT, 'semantic-review.json');

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(JSON.parse);
}
function asList(value) { return Array.isArray(value) ? value.filter(Boolean) : (value ? [value] : []); }
function uniq(values) { return [...new Set(values.filter(Boolean))]; }
function textOf(value) { return JSON.stringify(value ?? ''); }
function unitsOf(raw) { return raw?.units ? asList(raw.units) : asList(raw?.unit); }

const blockers = [];
const chapters = [];
const representedUnits = new Set();
const representedRegions = new Set();
const nodeManifest = readJson(NODE_MANIFEST);
const sourceReview = readJson(SOURCE_REVIEW);
const semanticReview = readJson(SEMANTIC_REVIEW);
const regionRows = readJsonl(REGIONS).filter((row) => row?.status === 'canonical' && row?.subject === 'MAO');
const regionById = new Map(regionRows.map((row) => [String(row.unified_region_id), row]));
const shardCache = new Map();

function shardPathForNode(nodeId) {
  const id = String(nodeId || '');
  const cf = id.match(/^POL27-CF-MAO-C(\d{2})/);
  if (cf) return path.join(NODE_SHARDS, 'pol27-cf', 'mao', `c${cf[1]}.json`);
  const sy = id.match(/^POL27-SY-MAO-P(\d{3})/);
  if (sy) return path.join(NODE_SHARDS, 'pol27-sy', 'mao', `p${sy[1]}.json`);
  return '';
}

function nodeExists(nodeId) {
  const file = shardPathForNode(nodeId);
  if (!file || !fs.existsSync(file)) return false;
  if (!shardCache.has(file)) shardCache.set(file, readJson(file));
  return Boolean(shardCache.get(file)?.[nodeId]);
}

function representedIds(unit) {
  return uniq([String(unit?.natural_unit_id || ''), ...asList(unit?.embedded_natural_unit_ids)]);
}

function supportRows(raw) {
  const support = raw?.content_support || {};
  return [
    ...asList(support.active_structures),
    ...asList(support.active_precision),
    ...asList(support.active_boundaries),
    ...asList(support.attribute_support),
    ...asList(support.role_support),
    ...asList(support.identity_support)
  ];
}

function sourceRefsFrom(raw) {
  return uniq([
    ...supportRows(raw).flatMap((row) => asList(row?.source_refs)),
    ...asList(raw?.source_bindings?.suyi_refs)
  ]);
}

function hasAll(haystack, needles) {
  return needles.every((needle) => haystack.includes(needle));
}

const requiredSentinels = {
  ch00: ['根本途径', '马克思主义基本原理同中国具体实际相结合', '中华优秀传统文化', '习近平新时代中国特色社会主义思想'],
  ch01: ['中国革命和建设', '实事求是', '群众路线', '独立自主', '第一个重大理论成果'],
  ch02: ['帝国主义', '封建主义', '官僚资本主义', '农村包围城市', '统一战线', '武装斗争', '党的建设'],
  ch03: ['一化三改', '合作', '国家资本主义', '1956', '社会主义基本制度'],
  ch04: ['论十大关系', '调动一切积极因素', '社会主义社会基本矛盾', '中国工业化道路'],
  ch05: ['邓小平理论', '三个代表', '科学发展观', '习近平新时代中国特色社会主义思想', '跨世纪发展'],
  ch06: ['解放生产力', '共同富裕', '一个中心', '四项基本原则', '改革开放', '社会主义市场经济'],
  ch07: ['先进生产力', '先进文化', '最广大人民', '发展是党执政兴国的第一要务', '改革是动力', '稳定是前提'],
  ch08: ['第一要义', '推动经济社会发展', '核心立场', '以人为本', '基本要求', '全面协调可持续', '根本方法', '统筹兼顾', '生态文明', '党的建设科学化']
};

for (let index = 0; index <= 8; index += 1) {
  const code = `ch${String(index).padStart(2, '0')}`;
  const file = path.join(LEARNING_ROOT, `${code}.json`);
  if (!fs.existsSync(file)) {
    blockers.push({ chapter: code, code: 'MISSING_CHAPTER_FILE' });
    continue;
  }

  const raw = readJson(file);
  const declaredUnits = asList(raw?.source_bindings?.natural_unit_ids).map(String);
  const projectedUnits = uniq(unitsOf(raw).flatMap(representedIds));
  const declaredRegions = asList(raw?.source_bindings?.region_ids).map(String);
  const refs = sourceRefsFrom(raw);
  const local = [];

  if (raw?.subject !== 'MAO') local.push('SUBJECT_NOT_MAO');
  if (raw?.canonical_mainline !== 'CHENGFENG') local.push('MAINLINE_NOT_CHENGFENG');
  if (!String(raw?.chapter_orientation?.real_problem || '').trim()) local.push('MISSING_REAL_PROBLEM');
  if (!String(raw?.chapter_orientation?.core_answer || '').trim()) local.push('MISSING_CORE_ANSWER');
  if (!String(raw?.chapter_compression?.reconstruction || '').trim()) local.push('MISSING_COMPRESSION');
  if (!String(raw?.chapter_compression?.review_prompt || '').trim()) local.push('MISSING_REVIEW_PROMPT');
  if (!raw?.content_support || !supportRows(raw).length) local.push('MISSING_CONTENT_SUPPORT');
  if (!unitsOf(raw).length) local.push('MISSING_LEARNER_UNIT');

  if (declaredUnits.length !== projectedUnits.length || declaredUnits.some((id) => !projectedUnits.includes(id)) || projectedUnits.some((id) => !declaredUnits.includes(id))) {
    local.push(`UNIT_DECLARATION_PROJECTION_MISMATCH:${declaredUnits.length}/${projectedUnits.length}`);
  }
  for (const id of declaredUnits) representedUnits.add(id);

  for (const regionId of declaredRegions) {
    representedRegions.add(regionId);
    if (!regionById.has(regionId)) local.push(`UNRESOLVED_CANONICAL_REGION:${regionId}`);
  }

  for (const ref of refs) {
    if (!nodeExists(ref)) local.push(`UNRESOLVED_CONTENT_SOURCE_REF:${ref}`);
  }

  for (const unit of unitsOf(raw)) {
    if (!String(unit?.stage_question || '').trim()) local.push(`THIN_UNIT:${unit?.natural_unit_id || 'UNKNOWN'}:stage_question`);
    const answerText = String(unit?.answer || asList(unit?.answers).join(' ') || '').trim();
    if (!answerText) local.push(`THIN_UNIT:${unit?.natural_unit_id || 'UNKNOWN'}:answer`);
    if (!String(unit?.boundary || '').trim()) local.push(`THIN_UNIT:${unit?.natural_unit_id || 'UNKNOWN'}:boundary`);
    if (!String(unit?.next || '').trim()) local.push(`THIN_UNIT:${unit?.natural_unit_id || 'UNKNOWN'}:next`);
  }

  const serialized = textOf(raw);
  if (!hasAll(serialized, requiredSentinels[code] || [])) local.push('MISSING_HIGH_VALUE_SEMANTIC_SENTINEL');

  for (const problem of uniq(local)) blockers.push({ chapter: code, code: problem });
  chapters.push({
    chapter: code,
    unit_count: unitsOf(raw).length,
    represented_unit_count: projectedUnits.length,
    content_source_ref_count: refs.length,
    blocker_count: uniq(local).length
  });
}

const canonicalUnitIds = new Set(regionRows.map((row) => String(row.natural_unit_id)));
for (const id of canonicalUnitIds) {
  if (!representedUnits.has(id)) blockers.push({ chapter: 'subject', code: `CANONICAL_UNIT_NOT_REPRESENTED:${id}` });
}
for (const id of representedUnits) {
  if (!canonicalUnitIds.has(id)) blockers.push({ chapter: 'subject', code: `PROJECTED_UNIT_NOT_CANONICAL:${id}` });
}
for (const row of regionRows) {
  if (!representedRegions.has(String(row.unified_region_id))) blockers.push({ chapter: 'subject', code: `CANONICAL_REGION_NOT_DECLARED:${row.unified_region_id}` });
  if (String(row?.chat_decision?.priority || '') !== 'P0') blockers.push({ chapter: 'subject', code: `MAO_CANONICAL_REGION_NOT_P0:${row.unified_region_id}` });
}

if (canonicalUnitIds.size !== 18) blockers.push({ chapter: 'subject', code: `CANONICAL_UNIT_COUNT_DRIFT:${canonicalUnitIds.size}` });
if (semanticReview?.status !== 'CURRENT_MAINLINE_SCAN_COMPLETE') blockers.push({ chapter: 'subject', code: 'SEMANTIC_REVIEW_NOT_COMPLETE' });
if (semanticReview?.summary?.chapter_count !== 9 || semanticReview?.summary?.repair_count !== 9 || semanticReview?.summary?.keep_count !== 0 || semanticReview?.summary?.blocked_count !== 0) {
  blockers.push({ chapter: 'subject', code: 'SEMANTIC_REVIEW_SUMMARY_MISMATCH' });
}
if (sourceReview?.status !== 'CURRENT_REVIEW_COMPLETE') blockers.push({ chapter: 'subject', code: 'SOURCE_REVIEW_NOT_COMPLETE' });
if (sourceReview?.review_snapshot?.node_registry_canonical_row_digest_sha256 !== nodeManifest?.canonical_row_digest_sha256) {
  blockers.push({ chapter: 'subject', code: 'SOURCE_REVIEW_SNAPSHOT_STALE' });
}

const report = {
  status: blockers.length ? 'BLOCKED' : 'PASS',
  scope: 'MAO_C00_TO_C08_FRESH_CONTENT_CLOSURE',
  teaching_shape: 'HISTORICAL_PROBLEM_TO_THEORY_RESPONSE_WITH_POSITIONING_BOUNDARIES',
  chapter_count: chapters.length,
  canonical_region_count: regionRows.length,
  canonical_natural_unit_count: canonicalUnitIds.size,
  canonical_p0_region_count: regionRows.filter((row) => String(row?.chat_decision?.priority || '') === 'P0').length,
  source_review_snapshot_valid: sourceReview?.review_snapshot?.node_registry_canonical_row_digest_sha256 === nodeManifest?.canonical_row_digest_sha256,
  semantic_review_complete: semanticReview?.status === 'CURRENT_MAINLINE_SCAN_COMPLETE',
  blocker_count: blockers.length,
  chapters,
  blocker_sample: blockers.slice(0, 30)
};

console.log('POLITICS_MAO_CONTENT_AUDIT');
console.log(JSON.stringify(report, null, 2));
if (blockers.length) process.exit(2);
