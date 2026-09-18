import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(read(relativePath));
const exists = (relativePath) => fs.existsSync(path.join(repoRoot, relativePath));
const fail = (message) => { throw new Error(`XIZONG_PRODUCTION_PROTOCOL_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

const assetStandard = read('LEARNING_ASSET_STANDARD.md');
const acceptance = read('LEARNING_ACCEPTANCE.md');
const explanationReadme = read('content/xizong/explanations/README.md');
const explanationManifest = readJson('content/xizong/explanations/manifest.json');
const questionManifest = readJson('content/xizong/questions/manifest.json');

assert(
  assetStandard.includes('Builder self-review ≠ fresh independent L acceptance.'),
  'learning-asset-standard-lost-fresh-independent-L-rule'
);
assert(
  acceptance.includes('Evidence required for substantial reconstructed Learning'),
  'learning-acceptance-lost-adversarial-evidence-rule'
);
assert(
  assetStandard.includes('Adversarial Knowledge reconstruction'),
  'learning-asset-standard-lost-knowledge-falsification-rule'
);
assert(
  acceptance.includes('Evidence required for materially reconstructed Knowledge'),
  'learning-acceptance-lost-knowledge-falsification-evidence'
);
assert(
  assetStandard.includes('Content closure readback before Presentation'),
  'learning-asset-standard-lost-content-closure-rule'
);
assert(
  acceptance.includes('Pre-P condition: realized Content must be closed'),
  'learning-acceptance-lost-pre-p-content-closure'
);

assert(
  !/Process rules are governed by\s+`learning\/xizong\/question-explanation-process\.md`/i.test(explanationReadme),
  'explanation-readme-active-pointer-still-retired'
);
assert(
  explanationReadme.includes('3,750 / 3,750'),
  'explanation-readme-coverage-not-current'
);
assert(
  explanationReadme.includes('FAST_OWNER'),
  'explanation-readme-lost-adaptive-depth-rule'
);

const processInterface = String(explanationManifest.process_interface || '');
const [processPath] = processInterface.split('#');
assert(processPath === 'content/xizong/explanations/README.md', 'explanation-process-owner-not-current-readme');
assert(exists(processPath), 'explanation-process-owner-missing');

const questionCount = Number(questionManifest?.stable_identity?.question_count || 0);
const approvedCount = Number(explanationManifest?.canonical_storage?.approved_explanation_count || 0);
const coverageCount = Number(explanationManifest?.coverage?.approved_explanations || 0);
assert(questionCount > 0, 'question-truth-count-missing');
assert(approvedCount === questionCount, `explanation-count-vs-question-truth:${approvedCount}/${questionCount}`);
assert(coverageCount === approvedCount, `explanation-coverage-vs-canonical:${coverageCount}/${approvedCount}`);

const policy = explanationManifest.production_policy || {};
assert(policy.depth === 'ADAPTIVE_SUFFICIENCY', 'explanation-production-depth-policy-missing');
assert(policy.fast_owner_is_debt_by_default === false, 'fast-owner-debt-policy-regressed');
assert(policy.uniform_deep_enrichment_required === false, 'uniform-deep-enrichment-regressed');
assert(policy.continuation === 'EVIDENCE_AND_VALUE_DRIVEN', 'explanation-continuation-policy-regressed');
assert(explanationManifest?.coverage?.next_unreviewed_question_id === null, 'explanation-linear-cursor-returned');
assert(
  explanationManifest?.cycle_reset?.status === 'CURRENT_FULL_OBJECT_COVERAGE_ADAPTIVE_DEPTH',
  'explanation-cycle-status-not-adaptive-full-coverage'
);
assert(
  explanationManifest?.cycle_reset?.continuation === 'EVIDENCE_AND_VALUE_DRIVEN_NO_LINEAR_CURSOR',
  'explanation-cycle-continuation-regressed'
);

const shardRows = explanationManifest?.canonical_storage?.shards || [];
assert(Array.isArray(shardRows) && shardRows.length > 0, 'explanation-shards-missing');
assert(
  new Set(shardRows.map((row) => row.path)).size === shardRows.length,
  'explanation-shard-path-duplicate'
);

const seen = new Set();
let total = 0;
let fastOwner = 0;
let withCorrectOptionReason = 0;
let withDistractors = 0;
let withCommonFailure = 0;
let withTransfer = 0;

for (const shardMeta of shardRows) {
  const relativePath = path.posix.join('content/xizong/explanations', shardMeta.path);
  assert(exists(relativePath), `explanation-shard-missing:${shardMeta.path}`);
  const rows = readJson(relativePath);
  assert(Array.isArray(rows), `explanation-shard-not-array:${shardMeta.path}`);
  assert(rows.length === Number(shardMeta.record_count), `explanation-shard-count:${shardMeta.path}`);

  for (const row of rows) {
    const id = String(row?.question_id || '');
    assert(/^xizong-official-\d{4}-n\d{3}$/.test(id), `explanation-question-id-invalid:${id || '<missing>'}`);
    assert(!seen.has(id), `explanation-question-id-duplicate:${id}`);
    seen.add(id);
    total += 1;

    assert(row?.truth_gate === 'PASS', `explanation-truth-gate:${id}`);
    assert(row?.explanation_status === 'APPROVED', `explanation-status:${id}`);
    assert(String(row?.exam_target || '').trim(), `explanation-exam-target-missing:${id}`);
    assert(String(row?.decision_axis || '').trim(), `explanation-decision-axis-missing:${id}`);

    if (row?.review?.format === 'FAST_OWNER') fastOwner += 1;
    if (String(row?.correct_option_reason || '').trim()) withCorrectOptionReason += 1;
    if (Array.isArray(row?.valuable_distractors) && row.valuable_distractors.length) withDistractors += 1;
    if (String(row?.common_failure_node || '').trim()) withCommonFailure += 1;
    if (String(row?.transfer_rule || '').trim()) withTransfer += 1;
  }
}

assert(total === approvedCount, `explanation-actual-count:${total}/${approvedCount}`);
assert(seen.size === questionCount, `explanation-id-coverage:${seen.size}/${questionCount}`);

console.log(JSON.stringify({
  schema: 'kianos.xizong.production-protocol-integrity.v1',
  pass: true,
  learning: {
    substantial_learning_requires_adversarial_and_fresh_independent_acceptance: true
  },
  explanations: {
    total,
    fast_owner: fastOwner,
    with_correct_option_reason: withCorrectOptionReason,
    with_valuable_distractors: withDistractors,
    with_common_failure_node: withCommonFailure,
    with_transfer_rule: withTransfer,
    production_depth: policy.depth,
    continuation: policy.continuation
  }
}, null, 2));
