import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadXizongSystemQuestionSweep } from '../src/lib/xizongQuestions.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const fail = (message) => { throw new Error(`A3_SOURCE_ACCEPTANCE_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const pad3 = (value) => String(value).padStart(3, '0');

const OWNER_PATH = 'content/xizong/knowledge/learner/a3-urinary-question-scope.json';
const LEARNING_PATH = 'content/xizong/knowledge/learner/a3-urinary-learning.json';
const SYSTEM_PATH = 'content/xizong/knowledge/systems/a3-urinary/system.json';
const EXPECTED_QUESTION_TRUTH_HASH = '0abc1a3cadbb41b36808fe86ff58c21ede6f4297312e9fb4c2da62b865ef2c82';
const EXPECTED_A3_CURRENT_HASH = '92685b073b9cbf00f67a61442872c1fea4ccf01fe50987e12e4ca646c90751c5';
const EXPECTED_A3_RECOVERED_243_HASH = 'bd8082bf9b82d00411f5d3dcaa09f56626c0c08b688e108f728f7da6e2f9b84e';
const PHASE = String(process.env.A3_SOURCE_PHASE || 'all').trim().toLowerCase();
const shouldRun = (phase) => PHASE === 'all' || PHASE === phase;
assert(['all', 'owner', 'truth', 'boundary'].includes(PHASE), `unknown-phase:${PHASE}`);

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

const owner = readJson(OWNER_PATH);
const ids = expandScopeIds(owner);

if (shouldRun('owner')) {
  assert(owner.schema === 'kianos.xizong.system_question_scope.v2', `owner-schema:${owner.schema}`);
  assert(owner.status === 'CURRENT', `owner-status:${owner.status}`);
  assert(owner.authority === 'CHAT_APPROVED_CURRENT_RECONSTRUCTION_WITH_CROSS_SYSTEM_OWNER_REPAIR', `authority:${owner.authority}`);
  assert(owner?.system?.system_id === 'urinary' && owner?.system?.canonical_id === 'A3', 'owner-identity');
  assert(owner.role === 'FIRST_PASS_SYSTEM_OFFICIAL_QUESTION_SCOPE_ONLY', `owner-role:${owner.role}`);
  assert(ids.length === 244, `expanded-count:${ids.length}`);
  assert(Number(owner.question_count) === 244, `declared-count:${owner.question_count}`);
  assert(new Set(ids).size === 244, 'duplicate-question-id');
  assert(inventoryHash(ids) === EXPECTED_A3_CURRENT_HASH, 'inventory-hash');
  assert(owner.question_id_inventory_sha256 === EXPECTED_A3_CURRENT_HASH, 'declared-inventory-hash');
  assert(Object.values(owner.year_counts || {}).reduce((sum, value) => sum + Number(value), 0) === 244, 'year-count-total');
  for (const [year, spec] of Object.entries(owner?.id_expansion?.question_number_spec_by_year || {})) {
    assert(expandNumberSpec(spec).length === Number(owner.year_counts?.[year]), `year-count:${year}`);
  }
  assert(owner?.recovery?.current_question_truth_identity_check?.current_question_id_inventory_sha256 === EXPECTED_QUESTION_TRUTH_HASH, 'owner-question-truth-hash');
  assert(Number(owner?.runtime_validation?.require_exact_question_count) === 244, 'runtime-validation-count');
  assert(owner?.runtime_validation?.require_sorted_inventory_sha256 === EXPECTED_A3_CURRENT_HASH, 'runtime-validation-hash');
  console.log(`A3 Source owner PASS | Questions=${ids.length} | Inventory=${inventoryHash(ids)}`);
}

if (shouldRun('truth')) {
  // S must not depend on K acceptance. Confirm only stable A3 identity here;
  // whether System-level K is working or later CHAT_APPROVED is irrelevant to S.
  const systemRecord = readJson(SYSTEM_PATH);
  assert(systemRecord?.system_id === 'urinary' && systemRecord?.canonical_id === 'A3', 'system-identity');

  const sourceIdentity = {
    systemId: owner.system.system_id,
    canonicalId: owner.system.canonical_id,
    title: owner.system.title
  };
  const sweep = loadXizongSystemQuestionSweep(sourceIdentity);
  assert(sweep, 'runtime-sweep-missing');
  assert(sweep.questionCount === 244, `runtime-count:${sweep.questionCount}`);
  assert(sweep.questions.length === 244, `runtime-loaded-count:${sweep.questions.length}`);
  assert(new Set(sweep.questions.map((question) => question.questionId)).size === 244, 'runtime-question-id-duplicate');
  assert(sweep.questionInventoryHash === EXPECTED_A3_CURRENT_HASH, `runtime-inventory-hash:${sweep.questionInventoryHash}`);
  assert(sweep.scopePath === OWNER_PATH, `runtime-owner-path:${sweep.scopePath}`);
  console.log(`A3 Current Question Truth PASS | Questions=${sweep.questionCount} | Scope=${sweep.scopePath} | KGateDependency=0`);
}

if (shouldRun('boundary')) {
  const learning = readJson(LEARNING_PATH);
  assert(learning.system_id === 'urinary' && learning.canonical_id === 'A3', 'learning-identity');
  assert(Number(learning?.identity?.stable_block_count) === 14, `block-count:${learning?.identity?.stable_block_count}`);
  assert(Number(learning?.identity?.stable_kp_count) === 257, `kp-count:${learning?.identity?.stable_kp_count}`);
  assert(Number(learning?.identity?.logic_group_count) === 75, `logic-group-count:${learning?.identity?.logic_group_count}`);
  const blockIds = Object.keys(learning.blocks || {}).sort();
  const expectedBlockIds = Array.from({ length: 14 }, (_, index) => `urinary-b${String(index + 1).padStart(2, '0')}`);
  assert(JSON.stringify(blockIds) === JSON.stringify(expectedBlockIds), `block-identity:${blockIds.join(',')}`);
  for (const blockId of blockIds) {
    assert(String(learning.blocks?.[blockId]?.stop_line || '').trim().length > 0, `stop-line-missing:${blockId}`);
  }
  assert(JSON.stringify(owner?.recovery?.accepted_a3_boundary?.block_ids || []) === JSON.stringify(expectedBlockIds), 'owner-block-boundary');

  const historical = owner?.recovery?.historical_membership_evidence;
  assert(historical?.role === 'RECONCILIATION_CANDIDATE_NOT_RUNTIME_AUTHORITY', 'historical-evidence-role');
  assert(Number(historical?.candidate_question_count) === 243, 'historical-candidate-count');
  assert(historical?.candidate_runtime_sorted_inventory_sha256 === EXPECTED_A3_RECOVERED_243_HASH, 'historical-candidate-hash');

  const range = owner?.recovery?.historical_range_and_qa_evidence?.range_config;
  assert(range?.schema === 'hlk_official_system_range_config_v1', 'range-schema');
  assert(range?.system_id === 'urinary', 'range-system');
  assert(Number(range?.official_question_count) === 243, 'range-count');
  assert(range?.all_14_current_block_ids_covered === true, 'range-block-coverage');

  const qa = owner?.recovery?.historical_range_and_qa_evidence?.qa_receipt;
  assert(qa?.status === 'HEART_LUNG_KIDNEY_QUESTION_RELATION_LAYER_READY_FOR_APPLY', 'qa-status');
  for (const check of ['SYSTEM_RANGE_COUNT_GATE','FIRST_PASS_ONE_ROUTE_PER_CANONICAL_ID','NO_OWNERSHIP_VIOLATION','NO_SOURCE_GAP_VIOLATION','CANONICAL_CONTENT_UNCHANGED']) {
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

  const crossSystemRepair = owner?.recovery?.cross_system_owner_repair;
  assert(Array.isArray(crossSystemRepair?.added_ids) && crossSystemRepair.added_ids.length === 1 && crossSystemRepair.added_ids[0] === 'xizong-official-2022-n032', 'cross-system-repair-id');
  assert(Number(crossSystemRepair?.previous_count) === 243, 'cross-system-repair-previous-count');
  assert(Number(crossSystemRepair?.current_count) === 244, 'cross-system-repair-current-count');
  assert(Number(crossSystemRepair?.overlap_after_repair) === 0, 'cross-system-repair-overlap');

  assert(owner?.boundaries?.system_membership_only === true, 'system-membership-boundary');
  assert(owner?.boundaries?.question_block_mapping_asserted === false, 'question-block-inference');
  assert(owner?.boundaries?.question_logic_group_mapping_asserted === false, 'question-logic-group-inference');
  assert(owner?.boundaries?.question_kp_mapping_asserted === false, 'question-kp-inference');
  assert(owner?.boundaries?.learner_progress_asserted === false, 'learner-progress-manufactured');
  assert(owner?.boundaries?.historical_raw_bytes_claimed_rehashed === false, 'historical-raw-byte-overclaim');
  console.log('A3 boundary/provenance PASS | Blocks=14 | KP=257 | LogicGroups=75 | Ambiguities=0');
}

if (PHASE === 'all') {
  console.log('A3 Source scope acceptance PASS | System=A3/urinary | QuestionToKPInference=0 | HistoricalRawByteRehash=NOT_CLAIMED');
}
