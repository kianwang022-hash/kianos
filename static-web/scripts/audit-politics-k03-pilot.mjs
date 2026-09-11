import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const K03_UNIT_ID = 'POL27-CF-MARX-C02-K03';
const K03_REGION_ID = 'POL27-REGION-PILOT-MARX-REG-01';
const PARENT_UNIT_ID = 'POL27-CF-MARX-C02-S01';
const EXPECTED_K03_QUESTION_COUNT = 15;
const EXPECTED_K03_NODE_COUNT = 4;
const EXPECTED_K03_NODE_EDGE_COUNT = 16;
const EXPECTED_MULTI_NODE_QUESTIONS = ['X1000-MARX-M-048'];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function readJsonl(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(JSON.parse);
}

function fail(message) {
  console.error(`POLITICS_K03_PILOT_AUDIT_FAIL: ${message}`);
  process.exitCode = 1;
}

function sourceQuestionId(canonicalId) {
  const match = String(canonicalId || '').match(/^X1000-([A-Z]+)-([SM])-(\d{3})$/i);
  if (!match) return String(canonicalId || '');
  const subject = match[1].toLowerCase();
  const kind = match[2].toUpperCase() === 'S' ? 'single' : 'multiple';
  return `xiao_2027_${subject}_${kind}_${match[3]}`;
}

function questionRowId(row) {
  for (const key of ['question_id', 'asset_id', 'id', 'stable_id', 'source_id']) {
    if (typeof row?.[key] === 'string' && row[key]) return row[key];
  }
  return '';
}

function sameSet(a, b) {
  const aa = [...new Set(a)].sort();
  const bb = [...new Set(b)].sort();
  return aa.length === bb.length && aa.every((value, index) => value === bb[index]);
}

const regions = readJsonl('content/politics/source/politics_unified_regions.v1.jsonl');
const ownerMatches = regions.filter((row) => row?.natural_unit_id === K03_UNIT_ID || row?.unified_region_id === K03_REGION_ID);
const exactOwnerMatches = ownerMatches.filter((row) => row?.natural_unit_id === K03_UNIT_ID && row?.unified_region_id === K03_REGION_ID);

if (exactOwnerMatches.length !== 1) {
  fail(`expected exactly one authoritative K03 owner row, found ${exactOwnerMatches.length}`);
}

const owner = exactOwnerMatches[0] || null;
const ownerQuestionIds = [...new Set((owner?.xiao_question_refs || []).map(String).filter(Boolean))];
if (owner && owner?.frozen_pilot !== true) fail('authoritative K03 owner must remain frozen_pilot=true');
if (owner && ownerQuestionIds.length !== EXPECTED_K03_QUESTION_COUNT) {
  fail(`expected ${EXPECTED_K03_QUESTION_COUNT} K03 questions, found ${ownerQuestionIds.length}`);
}

const parent = regions.find((row) => row?.natural_unit_id === PARENT_UNIT_ID) || null;
const parentQuestionIds = new Set((parent?.xiao_question_refs || []).map(String));
const sharedWithParentRegion = ownerQuestionIds.filter((id) => parentQuestionIds.has(id));
const k03OnlyRelativeToParentRegion = ownerQuestionIds.filter((id) => !parentQuestionIds.has(id));

const questionRows = readJsonl('content/politics/source/xiao_2027_questions.jsonl');
const sourceQuestionIds = new Set(questionRows.map(questionRowId).filter(Boolean));
const missingQuestionRows = ownerQuestionIds.filter((id) => !sourceQuestionIds.has(sourceQuestionId(id)));
if (missingQuestionRows.length) fail(`unresolved Xiao1000 rows: ${missingQuestionRows.join(', ')}`);

const repairProjection = readJson('content/politics/learning/marxism/ch02.repair.json');
const evidence = repairProjection?.k03_question_node_evidence || null;
if (!evidence) fail('missing k03_question_node_evidence projection');
if (evidence?.natural_unit_id !== K03_UNIT_ID) fail('K03 evidence natural_unit_id mismatch');
if (evidence?.runtime_region !== K03_REGION_ID) fail('K03 evidence runtime_region mismatch');

const nodeProjection = Array.isArray(evidence?.node_projection) ? evidence.node_projection : [];
const questionEdges = Array.isArray(evidence?.question_edges) ? evidence.question_edges : [];
const mappedQuestionIds = questionEdges.map((row) => String(row?.question_id || '')).filter(Boolean);
if (!sameSet(mappedQuestionIds, ownerQuestionIds)) {
  fail(`15/15 mapping mismatch: owner=${ownerQuestionIds.length}, mapped=${new Set(mappedQuestionIds).size}`);
}

const nodeIds = nodeProjection.map((row) => String(row?.node_id || '')).filter(Boolean);
const expectedNodeIds = Array.from({ length: EXPECTED_K03_NODE_COUNT }, (_, index) =>
  `${K03_UNIT_ID}-N${String(index + 1).padStart(2, '0')}`);
if (!sameSet(nodeIds, expectedNodeIds)) {
  fail(`expected exact K03 nodes ${expectedNodeIds.join(', ')}, got ${nodeIds.join(', ')}`);
}

const flattenedHits = questionEdges.flatMap((row) =>
  (Array.isArray(row?.current_unit_hits) ? row.current_unit_hits : []).map((hit) => ({
    question_id: row.question_id,
    node_id: String(hit?.node_id || ''),
    locator: String(hit?.chengfeng_crosswalk_locator || '')
  })));
if (flattenedHits.length !== EXPECTED_K03_NODE_EDGE_COUNT) {
  fail(`expected ${EXPECTED_K03_NODE_EDGE_COUNT} K03 node edges, found ${flattenedHits.length}`);
}
for (const hit of flattenedHits) {
  if (!expectedNodeIds.includes(hit.node_id)) fail(`out-of-scope K03 node edge: ${hit.question_id} -> ${hit.node_id}`);
  if (!/【考点3】/.test(hit.locator)) fail(`K03 hit lacks Chengfeng 考点3 locator: ${hit.question_id} -> ${hit.locator}`);
}

const representedNodes = [...new Set(flattenedHits.map((hit) => hit.node_id))];
if (!sameSet(representedNodes, expectedNodeIds)) fail('not all four K03 nodes are represented by question evidence');

const multiNodeQuestions = questionEdges
  .filter((row) => new Set((row?.current_unit_hits || []).map((hit) => hit?.node_id).filter(Boolean)).size > 1)
  .map((row) => row.question_id);
if (!sameSet(multiNodeQuestions, EXPECTED_MULTI_NODE_QUESTIONS)) {
  fail(`unexpected multi-node K03 questions: ${multiNodeQuestions.join(', ')}`);
}

const gate = evidence?.unit_return_gate || {};
if (gate?.coverage_state !== 'QUESTION_NODE_MAPPING_READY') fail('Unit Return coverage gate is not ready');
if (gate?.learner_state !== 'PENDING_ATTEMPT_EVIDENCE') fail('learner mastery must remain pending before real K03 attempts');
if (gate?.emit_mastery_states !== false) fail('mapping evidence must not emit STABLE/REPAIR/UNCERTAIN before attempts');

const coverage = evidence?.coverage || {};
if (coverage?.owner_question_count !== EXPECTED_K03_QUESTION_COUNT) fail('coverage owner_question_count mismatch');
if (coverage?.mapped_question_count !== EXPECTED_K03_QUESTION_COUNT) fail('coverage mapped_question_count mismatch');
if (coverage?.node_count !== EXPECTED_K03_NODE_COUNT) fail('coverage node_count mismatch');
if (coverage?.node_edge_count !== EXPECTED_K03_NODE_EDGE_COUNT) fail('coverage node_edge_count mismatch');

console.log('POLITICS_K03_PILOT_AUDIT');
console.log(JSON.stringify({
  status: process.exitCode ? 'FAIL' : 'PASS',
  owner: {
    naturalUnitId: owner?.natural_unit_id || null,
    regionId: owner?.unified_region_id || null,
    frozenPilot: owner?.frozen_pilot === true,
    questionCount: ownerQuestionIds.length,
    questionIds: ownerQuestionIds
  },
  questionNodeEvidence: {
    mappedQuestionCount: new Set(mappedQuestionIds).size,
    nodeCount: representedNodes.length,
    nodeEdgeCount: flattenedHits.length,
    multiNodeQuestions,
    learnerState: gate?.learner_state || null,
    emitsMasteryStates: gate?.emit_mastery_states === true
  },
  parentRegionOverlap: {
    parentNaturalUnitId: parent?.natural_unit_id || null,
    sharedCount: sharedWithParentRegion.length,
    sharedQuestionIds: sharedWithParentRegion,
    k03OnlyCount: k03OnlyRelativeToParentRegion.length
  },
  resolvedQuestionRows: ownerQuestionIds.length - missingQuestionRows.length,
  missingQuestionRows
}));
