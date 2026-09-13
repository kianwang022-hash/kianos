import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEARNING_ROOT = path.join(repoRoot, 'content/politics/learning/xi');
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
const regionRows = readJsonl(REGIONS).filter((row) => row?.status === 'canonical' && row?.subject === 'XI');
const regionById = new Map(regionRows.map((row) => [String(row.unified_region_id), row]));
const shardCache = new Map();

function shardPathForNode(nodeId) {
  const id = String(nodeId || '');
  const cf = id.match(/^POL27-CF-XI-C(\d{2})/);
  if (cf) return path.join(NODE_SHARDS, 'pol27-cf', 'xi', `c${cf[1]}.json`);
  const sy = id.match(/^POL27-SY-XI-P(\d{3})/);
  if (sy) return path.join(NODE_SHARDS, 'pol27-sy', 'xi', `p${sy[1]}.json`);
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

function unitAnswerText(unit) {
  const direct = String(unit?.answer || asList(unit?.answers).join(' ') || '').trim();
  if (direct) return direct;
  const hierarchy = unit?.hierarchy;
  if (Array.isArray(hierarchy) && hierarchy.length) return textOf(hierarchy);
  if (hierarchy && typeof hierarchy === 'object' && Object.keys(hierarchy).length) return textOf(hierarchy);
  return '';
}

function unitBoundaryText(unit) {
  return String(
    unit?.boundary
    || unit?.hierarchy?.not_role
    || unit?.hierarchy?.parallel_boundary
    || ''
  ).trim();
}

const requiredSentinels = {
  ch00: ['十个明确', '十四个坚持', '十三个方面成就', '人民至上', '两个结合'],
  ch01: ['实现途径', '行动指南', '根本保障', '精神力量', '三个意味着'],
  ch02: ['国家富强', '民族振兴', '人民幸福', '人口规模巨大的现代化', '坚持和加强党的全面领导', '顶层设计与实践探索', '活力与秩序'],
  ch03: ['最本质的特征', '最大优势', '最高政治领导力量', '根本保证'],
  ch04: ['人民立场', '群众路线', '生命线', '共同富裕'],
  ch05: ['关键一招', '全面深化改革总目标', '制度建设', '经济体制改革'],
  ch06: ['社会主义基本经济制度', '创新', '协调', '绿色', '开放', '共享', '高质量发展', '新质生产力'],
  ch07: ['基础性、战略性支撑', '第一资源', '第一生产力', '第一动力', '立德树人'],
  ch08: ['全过程人民民主', '根本政治制度', '基本政治制度', '人民政协'],
  ch09: ['深刻革命', '唯一正确道路', '共同推进', '一体建设'],
  ch10: ['连续性', '创新性', '统一性', '包容性', '和平性', '创造性转化'],
  ch11: ['民生之源', '最大的民生', '共建共治共享'],
  ch12: ['绿水青山就是金山银山', '保护生产力', '美丽中国'],
  ch13: ['人民安全为宗旨', '政治安全为根本', '经济安全为基础', '促进国际安全为依托'],
  ch14: ['听党指挥', '能打胜仗', '作风优良', '军委主席负责制'],
  ch15: ['最早针对台湾', '香港和澳门', '中央全面管治权', '九二共识'],
  ch16: ['服务民族复兴', '促进人类进步', '外交为民', '人类命运共同体', '持久和平的世界'],
  ch17: ['鲜明主题', '党要管党、从严治党', '政治建设的首要任务', '最大威胁', '第二个答案', '最大的优势']
};

for (let index = 0; index <= 17; index += 1) {
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

  if (raw?.subject !== 'XI') local.push('SUBJECT_NOT_XI');
  if (raw?.canonical_mainline !== 'CHENGFENG') local.push('MAINLINE_NOT_CHENGFENG');
  if (!String(raw?.chapter_orientation?.role_in_subject || '').trim()) local.push('MISSING_ROLE_IN_SUBJECT');
  if (!String(raw?.chapter_orientation?.core_problem || '').trim()) local.push('MISSING_CORE_PROBLEM');
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
    if (!String(unit?.role_question || '').trim()) local.push(`THIN_UNIT:${unit?.natural_unit_id || 'UNKNOWN'}:role_question`);
    if (!unitAnswerText(unit)) local.push(`THIN_UNIT:${unit?.natural_unit_id || 'UNKNOWN'}:answer_or_hierarchy`);
    if (!unitBoundaryText(unit)) local.push(`THIN_UNIT:${unit?.natural_unit_id || 'UNKNOWN'}:boundary_or_not_role`);
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
  const priority = String(row?.chat_decision?.priority || '');
  if (!priority && row?.frozen_pilot === true) continue;
  if (!['P0', 'P1', 'P2'].includes(priority)) blockers.push({ chapter: 'subject', code: `UNKNOWN_PRIORITY:${row.unified_region_id}:${priority || 'EMPTY'}` });
  if (priority === 'P2' && row?.p2_provisional !== true) blockers.push({ chapter: 'subject', code: `P2_NOT_PROVISIONAL:${row.unified_region_id}` });
}

if (canonicalUnitIds.size !== 60) blockers.push({ chapter: 'subject', code: `CANONICAL_UNIT_COUNT_DRIFT:${canonicalUnitIds.size}` });
if (semanticReview?.status !== 'CURRENT_MAINLINE_SCAN_COMPLETE') blockers.push({ chapter: 'subject', code: 'SEMANTIC_REVIEW_NOT_COMPLETE' });
if (semanticReview?.summary?.chapter_count !== 18 || semanticReview?.summary?.repair_count !== 18 || semanticReview?.summary?.keep_count !== 0 || semanticReview?.summary?.blocked_count !== 0) {
  blockers.push({ chapter: 'subject', code: 'SEMANTIC_REVIEW_SUMMARY_MISMATCH' });
}
if (sourceReview?.status !== 'CURRENT_REVIEW_COMPLETE') blockers.push({ chapter: 'subject', code: 'SOURCE_REVIEW_NOT_COMPLETE' });
if (sourceReview?.review_snapshot?.node_registry_canonical_row_digest_sha256 !== nodeManifest?.canonical_row_digest_sha256) {
  blockers.push({ chapter: 'subject', code: 'SOURCE_REVIEW_SNAPSHOT_STALE' });
}

const priorityCounts = {
  P0: regionRows.filter((row) => String(row?.chat_decision?.priority || '') === 'P0').length,
  P1: regionRows.filter((row) => String(row?.chat_decision?.priority || '') === 'P1').length,
  P2: regionRows.filter((row) => String(row?.chat_decision?.priority || '') === 'P2').length,
  FROZEN_PILOT: regionRows.filter((row) => row?.frozen_pilot === true && !String(row?.chat_decision?.priority || '')).length
};
if (!priorityCounts.P0 || !priorityCounts.P1 || !priorityCounts.P2) blockers.push({ chapter: 'subject', code: `PRIORITY_SHAPE_DRIFT:${JSON.stringify(priorityCounts)}` });
if (Object.values(priorityCounts).reduce((sum, value) => sum + value, 0) !== regionRows.length) {
  blockers.push({ chapter: 'subject', code: `PRIORITY_ACCOUNTING_DRIFT:${JSON.stringify(priorityCounts)}` });
}

const report = {
  status: blockers.length ? 'BLOCKED' : 'PASS',
  scope: 'XI_C00_TO_C17_FRESH_CONTENT_CLOSURE',
  teaching_shape: 'HIERARCHY_ROLE_GOAL_PRINCIPLE_PATH_WITH_CONFUSABLE_FORMULATION_BOUNDARIES',
  chapter_count: chapters.length,
  canonical_region_count: regionRows.length,
  canonical_natural_unit_count: canonicalUnitIds.size,
  canonical_priority_counts: priorityCounts,
  source_review_snapshot_valid: sourceReview?.review_snapshot?.node_registry_canonical_row_digest_sha256 === nodeManifest?.canonical_row_digest_sha256,
  semantic_review_complete: semanticReview?.status === 'CURRENT_MAINLINE_SCAN_COMPLETE',
  blocker_count: blockers.length,
  chapters,
  blocker_sample: blockers.slice(0, 40)
};

console.log('POLITICS_XI_CONTENT_AUDIT');
console.log(JSON.stringify(report, null, 2));
if (blockers.length) process.exit(2);
