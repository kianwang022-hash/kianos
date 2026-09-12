import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const fail = (message) => { throw new Error(`A3_SOURCE_ACCEPTANCE_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const pad3 = (value) => String(value).padStart(3, '0');

const OWNER_PATH = 'content/xizong/knowledge/learner/a3-urinary-question-scope.json';
const LEARNING_PATH = 'content/xizong/knowledge/learner/a3-urinary-learning.json';
const QUESTION_ROOT = 'content/xizong/questions';
const EXPECTED_QUESTION_TRUTH_HASH = '0abc1a3cadbb41b36808fe86ff58c21ede6f4297312e9fb4c2da62b865ef2c82';
const EXPECTED_A3_HASH = 'bd8082bf9b82d00411f5d3dcaa09f56626c0c08b688e108f728f7da6e2f9b84e';

function expandNumberSpec(spec) {
  const values = [];
  for (const rawToken of String(spec || '').split(',')) {
    const token = rawToken.trim();
    if (!token) continue;
    const range = token.match(/^(\d+)-(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      assert(Number.isInteger(start) && Number.isInteger(end) && start >= 1 && end >= start, `bad-range:${token}`);
      for (let value = start; value <= end; value += 1) values.push(value);
      continue;
    }
    assert(/^\d+$/.test(token), `bad-token:${token}`);
    values.push(Number(token));
  }
  return values;
}

function expandScopeIds(scope) {
  const specs = scope?.id_expansion?.question_number_spec_by_year;
  assert(specs && typeof specs === 'object', 'spec-missing');
  const ids = [];
  for (const year of Object.keys(specs).sort()) {
    assert(/^\d{4}$/.test(year), `bad-year:${year}`);
    for (const number of expandNumberSpec(specs[year])) ids.push(`xizong-official-${year}-n${pad3(number)}`);
  }
  return ids;
}

function inventoryHash(ids) {
  return sha256(`${[...ids].sort().join('\n')}\n`);
}

function routeForId(questionId) {
  const match = questionId.match(/^xizong-official-(\d{4})-n(\d{3})$/);
  assert(match, `bad-id:${questionId}`);
  const year = match[1];
  const number = Number(match[2]);
  const start = Math.floor((number - 1) / 25) * 25 + 1;
  const end = start + 24;
  return `shards/${year}/q${pad3(start)}-${pad3(end)}.json`;
}

const owner = readJson(OWNER_PATH);
assert(owner.schema === 'kianos.xizong.system_question_scope.v2', `owner-schema:${owner.schema}`);
assert(owner.status === 'CURRENT', `owner-status:${owner.status}`);
assert(owner.authority === 'CHAT_APPROVED_CURRENT_RECONSTRUCTION', `authority:${owner.authority}`);
assert(owner?.system?.system_id === 'urinary' && owner?.system?.canonical_id === 'A3', 'owner-identity');
assert(owner.role === 'FIRST_PASS_SYSTEM_OFFICIAL_QUESTION_SCOPE_ONLY', `owner-role:${owner.role}`);

const ids = expandScopeIds(owner);
assert(ids.length === 243, `expanded-count:${ids.length}`);
assert(Number(owner.question_count) === 243, `declared-count:${owner.question_count}`);
assert(new Set(ids).size === 243, 'duplicate-question-id');
assert(inventoryHash(ids) === EXPECTED_A3_HASH, 'inventory-hash');
assert(owner.question_id_inventory_sha256 === EXPECTED_A3_HASH, 'declared-inventory-hash');
assert(Object.values(owner.year_counts || {}).reduce((sum, value) => sum + Number(value), 0) === 243, 'year-count-total');
for (const [year, spec] of Object.entries(owner?.id_expansion?.question_number_spec_by_year || {})) {
  assert(expandNumberSpec(spec).length === Number(owner.year_counts?.[year]), `year-count:${year}`);
}

const manifest = readJson(`${QUESTION_ROOT}/manifest.json`);
assert(Number(manifest?.stable_identity?.question_count) === 3750, `question-truth-count:${manifest?.stable_identity?.question_count}`);
assert(manifest?.stable_identity?.immutable_question_ids === true, 'question-truth-ids-not-immutable');
assert(manifest?.stable_identity?.inventory_sha256 === EXPECTED_QUESTION_TRUTH_HASH, `question-truth-hash:${manifest?.stable_identity?.inventory_sha256}`);
assert(owner?.recovery?.current_question_truth_identity_check?.current_question_id_inventory_sha256 === EXPECTED_QUESTION_TRUTH_HASH, 'owner-question-truth-hash');

const shardCache = new Map();
for (const questionId of ids) {
  const shard = routeForId(questionId);
  if (!shardCache.has(shard)) shardCache.set(shard, readJson(`${QUESTION_ROOT}/${shard}`));
  const truth = shardCache.get(shard)?.[questionId];
  assert(truth && truth.question_id === questionId, `orphan:${questionId}`);
  assert(truth?.provenance?.annual_source?.source_question_id === questionId, `source-id-mismatch:${questionId}`);
}

const learning = readJson(LEARNING_PATH);
assert(learning.status === 'SYSTEM_BELOW_K_CLOSED', `learning-status:${learning.status}`);
assert(learning.system_id === 'urinary' && learning.canonical_id === 'A3', 'learning-identity');
assert(Number(learning?.identity?.stable_block_count) === 14, `block-count:${learning?.identity?.stable_block_count}`);
assert(Number(learning?.identity?.stable_kp_count) === 257, `kp-count:${learning?.identity?.stable_kp_count}`);
assert(Number(learning?.identity?.logic_group_count) === 75, `logic-group-count:${learning?.identity?.logic_group_count}`);
const blockIds = Object.keys(learning.blocks || {}).sort();
const expectedBlockIds = Array.from({ length: 14 }, (_, index) => `urinary-b${pad3(index + 1).slice(-2)}`);
assert(JSON.stringify(blockIds) === JSON.stringify(expectedBlockIds), `block-identity:${blockIds.join(',')}`);
for (const blockId of blockIds) {
  assert(String(learning.blocks?.[blockId]?.stop_line || '').trim().length > 0, `stop-line-missing:${blockId}`);
}
assert(JSON.stringify(owner?.recovery?.accepted_a3_boundary?.block_ids || []) === JSON.stringify(expectedBlockIds), 'owner-block-boundary');

const historical = owner?.recovery?.historical_membership_evidence;
assert(historical?.role === 'RECONCILIATION_CANDIDATE_NOT_RUNTIME_AUTHORITY', 'historical-evidence-role');
assert(Number(historical?.candidate_question_count) === 243, 'historical-candidate-count');
assert(historical?.candidate_runtime_sorted_inventory_sha256 === EXPECTED_A3_HASH, 'historical-candidate-hash');
const range = owner?.recovery?.historical_range_and_qa_evidence?.range_config;
assert(range?.schema === 'hlk_official_system_range_config_v1', 'range-schema');
assert(range?.system_id === 'urinary', 'range-system');
assert(Number(range?.official_question_count) === 243, 'range-count');
assert(range?.manifest_declared_sha256 === 'fbfb9123f5bb4dd02e6f7590d56fadbc1a9683a45cb6eb53262226c962b515db', 'range-hash');
assert(range?.all_14_current_block_ids_covered === true, 'range-block-coverage');
const qa = owner?.recovery?.historical_range_and_qa_evidence?.qa_receipt;
assert(qa?.status === 'HEART_LUNG_KIDNEY_QUESTION_RELATION_LAYER_READY_FOR_APPLY', 'qa-status');
for (const check of ['INPUT_SHA_GATE','CANONICAL_3750_UNIQUE_2005_2026','SYSTEM_RANGE_COUNT_GATE','SYSTEM_RANGE_TOTAL_978','FIRST_PASS_ROUTE_COMPLETE','FIRST_PASS_ONE_ROUTE_PER_CANONICAL_ID','NO_OWNERSHIP_VIOLATION','NO_SOURCE_GAP_VIOLATION','CANONICAL_CONTENT_UNCHANGED']) {
  assert(qa?.required_true_checks?.includes(check), `qa-check-not-recorded:${check}`);
}
const index = owner?.recovery?.historical_range_and_qa_evidence?.historical_index_locator;
assert(index?.raw_byte_rehash_status === 'UNAVAILABLE_SOURCE_TRANSPORT_403', 'historical-index-transport-status');
assert(index?.used_as_exact_current_authority === false, 'historical-index-false-authentication');

const criteria = owner?.recovery?.ownership_criteria;
assert(Array.isArray(criteria?.include) && criteria.include.length >= 4, 'include-criteria-incomplete');
assert(Array.isArray(criteria?.exclude) && criteria.exclude.length >= 4, 'exclude-criteria-incomplete');
const adjudication = owner?.recovery?.adjudication;
assert(Array.isArray(adjudication?.unresolved_membership_ambiguities) && adjudication.unresolved_membership_ambiguities.length === 0, 'unresolved-membership-ambiguity');
assert(Array.isArray(adjudication?.delta_vs_recovered_243_candidate?.added_ids) && adjudication.delta_vs_recovered_243_candidate.added_ids.length === 0, 'unexpected-added-delta');
assert(Array.isArray(adjudication?.delta_vs_recovered_243_candidate?.removed_ids) && adjudication.delta_vs_recovered_243_candidate.removed_ids.length === 0, 'unexpected-removed-delta');
assert(Number(adjudication?.delta_vs_recovered_243_candidate?.count_delta) === 0, 'count-delta');

assert(owner?.boundaries?.system_membership_only === true, 'system-membership-boundary');
assert(owner?.boundaries?.question_block_mapping_asserted === false, 'question-block-inference');
assert(owner?.boundaries?.question_logic_group_mapping_asserted === false, 'question-logic-group-inference');
assert(owner?.boundaries?.question_kp_mapping_asserted === false, 'question-kp-inference');
assert(owner?.boundaries?.learner_progress_asserted === false, 'learner-progress-manufactured');
assert(owner?.boundaries?.historical_raw_bytes_claimed_rehashed === false, 'historical-raw-byte-overclaim');

console.log([
  'A3 Source scope acceptance PASS',
  'System=A3/urinary',
  `Questions=${ids.length}`,
  `Inventory=${inventoryHash(ids)}`,
  `QuestionTruth=${manifest.stable_identity.inventory_sha256}`,
  `ShardsLoaded=${shardCache.size}`,
  'CurrentTruthOrphans=0',
  'UnresolvedMembershipAmbiguities=0',
  'QuestionToKPInference=0',
  'HistoricalRawByteRehash=NOT_CLAIMED'
].join(' | '));
