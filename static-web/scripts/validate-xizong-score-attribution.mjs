import assert from 'node:assert/strict';
import { loadXizongQuestionsByIds } from '../src/lib/xizongQuestions.mjs';
import {
  normalizeXizongOfficialScoreEvidence,
  summarizeXizongScoreAttribution
} from '../src/lib/xizongScoreAttribution.mjs';
import { recordXizongQuestionAttempt } from '../src/lib/xizongQuestionAttempts.mjs';

const [q005, q041] = loadXizongQuestionsByIds([
  'xizong-official-2025-n005',
  'xizong-official-2025-n041'
]);
assert.equal(q005.points, 1.5, '2025 n005 point projection');
assert.equal(q041.points, 2, '2025 n041 point projection');

const reviewedKp = {
  review_status: 'REVIEWED',
  source_system_id: 'circulation',
  system_id: 'circulation',
  block_id: 'circulation-b01',
  target_status: 'RESOLVED_KP',
  logic_group_id: 'circulation-b01-lg01',
  primary_canonical_kp_id: 'A1-B01-KP01',
  primary_runtime_kp_id: 'circulation-b01-kp01',
  supporting_canonical_kp_ids: ['A1-B01-KP02','A1-B01-KP03'],
  supporting_runtime_kp_ids: ['circulation-b01-kp02','circulation-b01-kp03']
};

const recorded = recordXizongQuestionAttempt({}, {
  question: {
    questionId: 'xizong-official-2025-n050',
    year: 2025,
    number: 50,
    questionType: 'A',
    correctAnswer: 'B',
    points: 2,
    sourceKind: 'OFFICIAL_EXAM',
    scoringRole: 'OFFICIAL_EVIDENCE',
    relation: {
      reviewStatus: 'REVIEWED',
      sourceSystemId: 'circulation',
      systemId: 'circulation',
      blockId: 'circulation-b01',
      targetStatus: 'RESOLVED_KP',
      resolvedLogicGroupId: 'circulation-b01-lg01',
      primaryKpId: 'A1-B01-KP01',
      primaryRuntimeKpId: 'circulation-b01-kp01',
      supportingKpIds: ['A1-B01-KP02'],
      supportingRuntimeKpIds: ['circulation-b01-kp02']
    }
  },
  status: 'wrong',
  selected: ['A'],
  context: {
    systemId: 'circulation',
    canonicalId: 'A1',
    scopeHash: 'scope-fixture',
    questionInventoryHash: 'inventory-fixture',
    questions: [],
    attemptContext: 'TARGETED_PRACTICE',
    resultVisibility: 'immediate',
    studyPhase: 'SECOND_PASS',
    queueMode: 'EXPLICIT_SET'
  },
  holdoutYears: []
}, {
  now: '2026-09-20T00:50:00.000Z',
  makeId: () => 'attempt-record-fixture'
});
const recordedEvent = recorded.attemptHistory.at(-1);
assert.equal(recordedEvent.points_possible, 2, 'attempt did not freeze point value');
assert.equal(recordedEvent.reviewed_relation.review_status, 'REVIEWED', 'attempt did not freeze reviewed relation');
assert.equal(recordedEvent.reviewed_relation.primary_runtime_kp_id, 'circulation-b01-kp01', 'attempt relation owner drift');
assert.deepEqual(recordedEvent.reviewed_relation.supporting_runtime_kp_ids, ['circulation-b01-kp02'], 'attempt support snapshot');

const reviewedBlock = {
  review_status: 'REVIEWED',
  source_system_id: 'circulation',
  system_id: 'circulation',
  block_id: 'circulation-b02',
  target_status: 'BLOCK_ONLY',
  logic_group_id: '',
  primary_canonical_kp_id: 'A1-B02-KP01',
  primary_runtime_kp_id: '',
  supporting_canonical_kp_ids: [],
  supporting_runtime_kp_ids: []
};

const history = [
  {
    type: 'QUESTION_ATTEMPT',
    attempt_id: 'a1',
    attempt_index: 1,
    question_id: 'xizong-official-2025-n005',
    question_source: 'OFFICIAL_EXAM',
    scoring_role: 'OFFICIAL_EVIDENCE',
    status: 'wrong',
    points_possible: 1.5,
    reviewed_relation: reviewedKp,
    year: 2025,
    number: 5,
    context: 'SYSTEM_SWEEP',
    study_phase: 'FIRST_PASS',
    submitted_at: '2026-09-20T01:00:00.000Z'
  },
  {
    type: 'QUESTION_ATTEMPT',
    attempt_id: 'a2',
    attempt_index: 2,
    question_id: 'xizong-official-2025-n005',
    question_source: 'OFFICIAL_EXAM',
    scoring_role: 'OFFICIAL_EVIDENCE',
    status: 'stable',
    points_possible: 1.5,
    reviewed_relation: reviewedKp,
    year: 2025,
    number: 5,
    context: 'TARGETED_PRACTICE',
    study_phase: 'SECOND_PASS',
    submitted_at: '2026-09-20T02:00:00.000Z'
  },
  {
    type: 'QUESTION_ATTEMPT',
    attempt_id: 'b1',
    attempt_index: 1,
    question_id: 'xizong-official-2025-n041',
    question_source: 'OFFICIAL_EXAM',
    scoring_role: 'OFFICIAL_EVIDENCE',
    status: 'uncertain',
    points_possible: 2,
    reviewed_relation: reviewedBlock,
    year: 2025,
    number: 41,
    context: 'SYSTEM_SWEEP',
    study_phase: 'FIRST_PASS',
    submitted_at: '2026-09-20T01:10:00.000Z'
  },
  {
    type: 'QUESTION_ATTEMPT',
    attempt_id: 'c1',
    attempt_index: 1,
    question_id: 'xizong-official-2024-n010',
    question_source: 'OFFICIAL_EXAM',
    scoring_role: 'OFFICIAL_EVIDENCE',
    status: 'wrong',
    points_possible: 1.5,
    reviewed_relation: null,
    year: 2024,
    number: 10,
    context: 'PAPER',
    study_phase: 'LATE_REVIEW',
    submitted_at: '2026-09-20T01:20:00.000Z'
  },
  {
    type: 'QUESTION_ATTEMPT',
    attempt_id: 'd1',
    attempt_index: 2,
    question_id: 'xizong-official-2025-n050',
    question_source: 'OFFICIAL_EXAM',
    scoring_role: 'OFFICIAL_EVIDENCE',
    status: 'wrong',
    points_possible: 2,
    reviewed_relation: reviewedKp,
    year: 2025,
    number: 50,
    context: 'TARGETED_PRACTICE',
    study_phase: 'SECOND_PASS',
    submitted_at: '2026-09-20T01:30:00.000Z'
  },
  {
    type: 'QUESTION_ATTEMPT',
    attempt_id: 'ai1',
    attempt_index: 1,
    question_id: 'xizong-ai-probe:circulation-b01-kp01-001',
    question_source: 'AI_TRANSFER_PROBE',
    scoring_role: 'TRANSFER_ONLY',
    status: 'wrong',
    points_possible: null,
    reviewed_relation: reviewedKp,
    year: null,
    number: 1,
    context: 'TARGETED_PRACTICE',
    study_phase: 'SECOND_PASS',
    submitted_at: '2026-09-20T01:40:00.000Z'
  }
];

assert.equal(normalizeXizongOfficialScoreEvidence(history.at(-1)), null, 'AI probe leaked into official score evidence');

const result = summarizeXizongScoreAttribution(history);
assert.equal(result.schema, 'kianos.xizong.score-attribution.v1');
assert.equal(result.totals.official_question_identities, 4, 'latest-per-question identity count');
assert.equal(result.totals.stable_points, 1.5, 'repeat stable did not replace old wrong');
assert.equal(result.totals.uncertain_points, 2, 'uncertain point weight');
assert.equal(result.totals.wrong_points, 3.5, 'wrong point weight');
assert.equal(result.totals.unmapped_points, 1.5, 'unmapped point weight');
assert.equal(result.totals.reuse_wrong_points, 2, 'reuse wrong split');
assert.equal(result.totals.first_attempt_wrong_points, 1.5, 'first-attempt wrong split');

const kp = result.targets.find((row) => row.owner_kind === 'KP' && row.owner_id === 'circulation-b01-kp01');
assert.ok(kp, 'primary KP bucket missing');
assert.equal(kp.stable_points, 1.5, 'stable repeated official question not attributed to primary KP');
assert.equal(kp.wrong_points, 2, 'supporting KPs duplicated the 2-point question');
assert.deepEqual(kp.supporting_runtime_kp_ids.sort(), ['circulation-b01-kp02','circulation-b01-kp03']);
assert.equal(kp.reuse_wrong_points, 2, 'reuse wrong not preserved');

const block = result.targets.find((row) => row.owner_kind === 'BLOCK' && row.owner_id === 'circulation-b02');
assert.ok(block, 'reviewed block-only mapping lost');
assert.equal(block.uncertain_points, 2, 'block-only uncertain points');

const unknown = result.targets.find((row) => row.owner_kind === 'UNKNOWN');
assert.ok(unknown, 'unmapped bucket missing');
assert.equal(unknown.wrong_points, 1.5, 'unmapped points were guessed into a knowledge owner');

assert.equal(result.rows.some((row) => row.question_id.startsWith('xizong-ai-probe:')), false, 'AI probe included in rows');
assert.equal(result.semantics.includes('NOT_PREDICTED_SCORE_GAIN'), true, 'prediction boundary missing');

console.log(JSON.stringify({
  ok: true,
  schema: result.schema,
  official_projection_points: {
    '2025-n005': q005.points,
    '2025-n041': q041.points
  },
  totals: result.totals,
  primary_owner_no_double_count: true,
  reuse_vs_first_attempt_preserved: true,
  ai_probe_excluded: true,
  unmapped_fail_closed: true
}, null, 2));
console.log('PASS Xizong score attribution: official point weight + reviewed primary owner + no double count + no AI score pollution');
