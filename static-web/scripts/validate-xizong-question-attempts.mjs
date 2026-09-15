// Acceptance probe for one-runtime, append-preserved multi-pass question evidence.
import assert from 'node:assert/strict';
import {
  ensureXizongQuestionSweepState,
  recordXizongQuestionAttempt,
  startNextXizongQuestionRound,
  nextXizongStudyPhase
} from '../src/lib/xizongQuestionAttempts.mjs';

let idCounter = 0;
const makeId = (prefix) => `${prefix}-test-${++idCounter}`;
const context = {
  systemId: 'respiratory',
  canonicalId: 'A2',
  scopeHash: 'scope-hash',
  questionInventoryHash: 'inventory-hash',
  holdoutYears: [2025],
  questions: [
    { questionId: 'q1', year: 2024, number: 1, questionType: 'A1', correctAnswer: 'A' },
    { questionId: 'q2', year: 2024, number: 2, questionType: 'A1', correctAnswer: 'B' }
  ]
};

const legacy = {
  results: {
    q1: { status: 'uncertain', selected: ['A'], correctAnswer: 'A', updatedAt: '2026-09-01T00:00:00.000Z' }
  }
};

let state = ensureXizongQuestionSweepState(legacy, context, {
  now: '2026-09-15T00:00:00.000Z',
  makeId
});
assert.equal(state.round.studyPhase, 'FIRST_PASS');
assert.equal(state.round.ordinal, 1);
assert.equal(state.attemptHistory.length, 1);
assert.equal(state.attemptHistory[0].type, 'QUESTION_ATTEMPT');
assert.equal(state.attemptHistory[0].evidence_origin, 'BOOTSTRAP_EXISTING_RESULT');
assert.equal(state.attemptHistory[0].question_id, 'q1');
assert.equal(state.attemptHistory[0].study_phase, 'FIRST_PASS');
assert.equal(state.attemptHistory[0].attempt_index, 1);
assert.equal(state.attemptHistory[0].submitted_at, '2026-09-01T00:00:00.000Z');
assert.equal(state.results.q1.attemptId, state.attemptHistory[0].attempt_id);

const onceBootstrapped = JSON.stringify(state.attemptHistory);
state = ensureXizongQuestionSweepState(state, context, {
  now: '2026-09-15T00:01:00.000Z',
  makeId
});
assert.equal(JSON.stringify(state.attemptHistory), onceBootstrapped, 'reload duplicated bootstrap attempt');

state = recordXizongQuestionAttempt(state, {
  question: context.questions[1],
  status: 'wrong',
  selected: ['C'],
  context,
  holdoutYears: context.holdoutYears
}, {
  now: '2026-09-15T00:02:00.000Z',
  makeId
});
assert.equal(state.attemptHistory.length, 2);
assert.equal(state.attemptHistory[1].evidence_origin, 'USER_QUESTION_ATTEMPT');
assert.equal(state.attemptHistory[1].question_id, 'q2');
assert.equal(state.attemptHistory[1].attempt_index, 1);
assert.equal(state.attemptHistory[1].study_phase, 'FIRST_PASS');
assert.deepEqual(state.attemptHistory[1].holdout_years, [2025]);
assert.equal(state.attemptHistory[1].scope_hash, 'scope-hash');
assert.equal(state.attemptHistory[1].question_inventory_hash, 'inventory-hash');

assert.throws(() => recordXizongQuestionAttempt(state, {
  question: context.questions[1],
  status: 'stable',
  selected: ['B'],
  context,
  holdoutYears: context.holdoutYears
}, { now: '2026-09-15T00:03:00.000Z', makeId }), /ALREADY_COMPLETED_IN_ROUND/);

const firstRoundHistory = JSON.stringify(state.attemptHistory);
state = startNextXizongQuestionRound(state, ['q1', 'q2'], {
  now: '2026-09-15T01:00:00.000Z',
  makeId
});
assert.equal(state.round.studyPhase, 'SECOND_PASS');
assert.equal(state.round.ordinal, 2);
assert.deepEqual(state.results, {});
assert.equal(JSON.stringify(state.attemptHistory), firstRoundHistory, 'next round rewrote attempt history');

state = recordXizongQuestionAttempt(state, {
  question: context.questions[0],
  status: 'stable',
  selected: ['A'],
  context,
  holdoutYears: context.holdoutYears
}, {
  now: '2026-09-15T01:01:00.000Z',
  makeId
});
const q1Attempts = state.attemptHistory.filter((event) => event.question_id === 'q1');
assert.equal(q1Attempts.length, 2);
assert.equal(q1Attempts[0].evidence_origin, 'BOOTSTRAP_EXISTING_RESULT');
assert.equal(q1Attempts[0].study_phase, 'FIRST_PASS');
assert.equal(q1Attempts[1].evidence_origin, 'USER_QUESTION_ATTEMPT');
assert.equal(q1Attempts[1].study_phase, 'SECOND_PASS');
assert.equal(q1Attempts[1].attempt_index, 2);
assert.equal(state.results.q1.studyPhase, 'SECOND_PASS');
assert.equal(state.results.q1.roundId, state.round.id);

assert.throws(() => startNextXizongQuestionRound(state, ['q1', 'q2'], {
  now: '2026-09-15T01:02:00.000Z',
  makeId
}), /ROUND_INCOMPLETE/);

state = recordXizongQuestionAttempt(state, {
  question: context.questions[1],
  status: 'stable',
  selected: ['B'],
  context,
  holdoutYears: context.holdoutYears
}, {
  now: '2026-09-15T01:03:00.000Z',
  makeId
});
state = startNextXizongQuestionRound(state, ['q1', 'q2'], {
  now: '2026-09-15T02:00:00.000Z',
  makeId
});
assert.equal(state.round.studyPhase, 'LATE_REVIEW');
assert.equal(state.round.ordinal, 3);
assert.equal(nextXizongStudyPhase('LATE_REVIEW'), 'LATE_REVIEW');

console.log([
  'Xizong Question Attempt model PASS',
  'LegacyBootstrap=preserved+idempotent',
  'CurrentResults=round-scoped',
  'AttemptHistory=append-preserved',
  'SameQuestion=FIRST_PASS→SECOND_PASS',
  'RepairSemantics=separate-by-design',
  'LateReview=repeatable',
  'WholePaper=NOT_CLAIMED'
].join(' | '));
