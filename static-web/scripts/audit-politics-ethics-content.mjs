import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEARNING_ROOT = path.join(repoRoot, 'content/politics/learning/ethics-law');
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

const blockers = [];
const chapters = [];
const representedUnits = new Set();
const representedRegions = new Set();
const nodeManifest = readJson(NODE_MANIFEST);
const sourceReview = readJson(SOURCE_REVIEW);
const semanticReview = readJson(SEMANTIC_REVIEW);
const regionRows = readJsonl(REGIONS).filter((row) => row?.status === 'canonical' && row?.subject === 'ETHICS');
const regionById = new Map(regionRows.map((row) => [String(row.unified_region_id), row]));
const shardCache = new Map();

function shardPathForNode(nodeId) {
  const id = String(nodeId || '');
  const cf = id.match(/^POL27-CF-ETHICS-C(\d{2})/);
  if (cf) return path.join(NODE_SHARDS, 'pol27-cf', 'ethics', `c${cf[1]}.json`);
  const sy = id.match(/^POL27-SY-ETHICS-P(\d{3})/);
  if (sy) return path.join(NODE_SHARDS, 'pol27-sy', 'ethics', `p${sy[1]}.json`);
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
  return uniq(supportRows(raw).flatMap((row) => asList(row?.source_refs)));
}

function hasAll(haystack, needles) {
  return needles.every((needle) => haystack.includes(needle));
}

const requiredSentinels = {
  ch00: ['思想指引', '价值基础', '制度支撑', '法律保障'],
  ch01: ['个人利益与社会利益', '客观规律', '拜金主义', '享乐主义', '极端个人主义'],
  ch02: ['超越性', '实践性', '时代性', '执着性', '支撑性', '多样性', '对立统一'],
  ch03: ['伟大创造精神', '伟大奋斗精神', '伟大团结精神', '伟大梦想精神', '爱国主义', '改革创新', '爱党', '爱社会主义'],
  ch04: ['富强', '民主', '文明', '和谐', '自由', '平等', '公正', '法治', '爱国', '敬业', '诚信', '友善', '先进性', '人民性', '真实性'],
  ch05: ['劳动', '客观条件', '主观条件', '为人民服务', '集体主义', '遵纪守法', '奉献', '友爱', '互助', '进步'],
  ch06: ['习近平法治思想', '中国特色社会主义法治道路', '总抓手', '建设法治中国', '科学立法', '严格执法', '公正司法', '全民守法', '1954', '1982', '法律至上', '权力制约', '公平正义', '权利保障', '程序正当', '相互依存']
};

for (let index = 0; index <= 6; index += 1) {
  const code = `ch${String(index).padStart(2, '0')}`;
  const file = path.join(LEARNING_ROOT, `${code}.json`);
  if (!fs.existsSync(file)) {
    blockers.push({ chapter: code, code: 'MISSING_CHAPTER_FILE' });
    continue;
  }
  const raw = readJson(file);
  const declaredUnits = asList(raw?.source_bindings?.natural_unit_ids);
  const projectedUnits = uniq(asList(raw?.units).flatMap(representedIds));
  const declaredRegions = asList(raw?.source_bindings?.region_ids);
  const refs = sourceRefsFrom(raw);
  const local = [];

  if (raw?.subject !== 'ETHICS') local.push('SUBJECT_NOT_ETHICS');
  if (raw?.canonical_mainline !== 'CHENGFENG') local.push('MAINLINE_NOT_CHENGFENG');
  if (!String(raw?.chapter_orientation?.core_problem || '').trim()) local.push('MISSING_CORE_PROBLEM');
  if (!String(raw?.chapter_orientation?.core_answer || '').trim()) local.push('MISSING_CORE_ANSWER');
  if (!String(raw?.chapter_compression?.reconstruction || '').trim()) local.push('MISSING_COMPRESSION');
  if (!String(raw?.chapter_compression?.review_prompt || '').trim()) local.push('MISSING_REVIEW_PROMPT');
  if (!raw?.content_support || !supportRows(raw).length) local.push('MISSING_CONTENT_SUPPORT');

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

  for (const unit of asList(raw?.units)) {
    for (const key of ['concept_question', 'answer', 'boundary', 'application']) {
      if (!String(unit?.[key] || '').trim()) local.push(`THIN_UNIT:${unit?.natural_unit_id || 'UNKNOWN'}:${key}`);
    }
  }

  const serialized = textOf(raw);
  if (!hasAll(serialized, requiredSentinels[code] || [])) local.push('MISSING_HIGH_VALUE_SEMANTIC_SENTINEL');

  for (const problem of uniq(local)) blockers.push({ chapter: code, code: problem });
  chapters.push({
    chapter: code,
    unit_count: asList(raw?.units).length,
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
}

if (semanticReview?.status !== 'CURRENT_MAINLINE_SCAN_COMPLETE') blockers.push({ chapter: 'subject', code: 'SEMANTIC_REVIEW_NOT_COMPLETE' });
if (semanticReview?.summary?.chapter_count !== 7 || semanticReview?.summary?.repair_count !== 7 || semanticReview?.summary?.blocked_count !== 0) {
  blockers.push({ chapter: 'subject', code: 'SEMANTIC_REVIEW_SUMMARY_MISMATCH' });
}
if (sourceReview?.status !== 'CURRENT_REVIEW_COMPLETE') blockers.push({ chapter: 'subject', code: 'SOURCE_REVIEW_NOT_COMPLETE' });
if (sourceReview?.review_snapshot?.node_registry_canonical_row_digest_sha256 !== nodeManifest?.canonical_row_digest_sha256) {
  blockers.push({ chapter: 'subject', code: 'SOURCE_REVIEW_SNAPSHOT_STALE' });
}

const p0p1Rows = regionRows.filter((row) => ['P0', 'P1'].includes(String(row?.chat_decision?.priority || '')));
for (const row of p0p1Rows) {
  if (!representedUnits.has(String(row.natural_unit_id))) blockers.push({ chapter: 'subject', code: `P0_P1_UNIT_NOT_REPRESENTED:${row.natural_unit_id}` });
}

const report = {
  status: blockers.length ? 'BLOCKED' : 'PASS',
  scope: 'ETHICS_C00_TO_C06_CONTENT_CLOSURE',
  teaching_shape: 'CONCEPT_BOUNDARY_NORMATIVE_JUDGMENT_IDENTITY_AND_SITUATIONAL_APPLICATION',
  chapter_count: chapters.length,
  canonical_region_count: regionRows.length,
  canonical_natural_unit_count: canonicalUnitIds.size,
  p0_p1_region_count: p0p1Rows.length,
  source_review_snapshot_valid: sourceReview?.review_snapshot?.node_registry_canonical_row_digest_sha256 === nodeManifest?.canonical_row_digest_sha256,
  semantic_review_complete: semanticReview?.status === 'CURRENT_MAINLINE_SCAN_COMPLETE',
  blocker_count: blockers.length,
  chapters,
  blocker_sample: blockers.slice(0, 20)
};

console.log('POLITICS_ETHICS_CONTENT_AUDIT');
console.log(JSON.stringify(report, null, 2));
if (blockers.length) process.exit(2);
