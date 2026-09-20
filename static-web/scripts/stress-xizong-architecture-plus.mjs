import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import fs from 'node:fs';
import path from 'node:path';

import {
  appendMemoryEvidence,
  completeRepairTask,
  createXizongMemoryState,
  releaseBlockMemory,
  setRepairTasks,
  activeRepairTasks,
  todayMemoryQueue,
  xizongRetentionState
} from '../src/lib/xizongMemoryModel.mjs';
import {
  normalizeXizongInlinePracticeQuestions,
  validateXizongInlinePracticeQuestionBindings
} from '../src/lib/xizongSessionInstruction.mjs';
import { recordXizongQuestionAttempt } from '../src/lib/xizongQuestionAttempts.mjs';
import { collectXizongRetainedEvidence } from '../src/lib/xizongRetainedPractice.mjs';
import { summarizeXizongScoreAttribution } from '../src/lib/xizongScoreAttribution.mjs';

const DAY = 86400000;
const T0 = Date.parse('2026-09-20T08:00:00.000Z');

function cardsForBlock(blockId, sourceHash, start, count) {
  return Array.from({ length: count }, (_, offset) => {
    const n = start + offset + 1;
    return {
      id: `core:${blockId}-kp${String(n).padStart(4, '0')}`,
      blockId,
      kpId: `${blockId}-kp${String(n).padStart(4, '0')}`,
      systemId: 'stress',
      canonicalId: 'STRESS',
      blockLabel: blockId,
      blockTitle: `Stress ${blockId}`,
      displayId: `KP${String(n).padStart(4, '0')}`,
      title: `Stress KP ${n}`,
      promptCanonical: `Recall stress KP ${n}`,
      coreHtml: `<p>Stress ${n}</p>`,
      sourceHash
    };
  });
}

function buildMemory(cardCount, blockCount = 8) {
  let state = createXizongMemoryState();
  let cursor = 0;
  for (let block = 0; block < blockCount; block += 1) {
    const remaining = cardCount - cursor;
    if (remaining <= 0) break;
    const count = Math.ceil(remaining / (blockCount - block));
    const blockId = `stress-b${String(block + 1).padStart(2, '0')}`;
    const sourceHash = `stress-source-${blockId}-v1`;
    state = releaseBlockMemory(state, {
      blockId,
      systemId: 'stress',
      canonicalId: 'STRESS',
      blockLabel: `B${block + 1}`,
      blockTitle: `Stress block ${block + 1}`,
      sourceHash,
      coreCards: cardsForBlock(blockId, sourceHash, cursor, count),
      precisionCards: []
    }, T0);
    cursor += count;
  }
  return state;
}

function allCardIds(state) {
  return Object.keys(state.cards).sort();
}

function addEvidence(state, cardId, rating, at, origin = 'ARCH_PLUS_STRESS') {
  return appendMemoryEvidence(state, { cardId, rating, origin }, at);
}

function assertUniqueQueue(queue, label) {
  const ids = queue.map((row) => row.id);
  assert.equal(new Set(ids).size, ids.length, `${label}:duplicate-due-identity`);
}

function expectThrows(fn, pattern, label) {
  let thrown = false;
  try { fn(); }
  catch (error) {
    thrown = pattern.test(String(error));
  }
  assert.equal(thrown, true, label);
}

// ---------------------------------------------------------------------------
// A. Real-scale Memory pressure: current canonical KP order of magnitude.
// ---------------------------------------------------------------------------

let scaleState = buildMemory(2517, 8);
const scaleIds = allCardIds(scaleState);
assert.equal(scaleIds.length, 2517, 'scale-card-count');

// Admit only 250 / 2517. The other 2267 must remain library-only forever.
for (let i = 0; i < 90; i += 1) {
  scaleState = addEvidence(scaleState, scaleIds[i], i % 2 ? 'unknown' : 'fuzzy', T0);
}
for (let i = 90; i < 170; i += 1) {
  scaleState = addEvidence(scaleState, scaleIds[i], 'known', T0);
}
for (let i = 170; i < 250; i += 1) {
  scaleState = addEvidence(scaleState, scaleIds[i], 'mastered', T0);
}

const scaleStart = performance.now();
const scaleQueue = todayMemoryQueue(scaleState, { now: T0 + 30 * 60 * 1000 });
const scaleMs = performance.now() - scaleStart;

assert.equal(scaleQueue.length, 90, 'scale-immediate-due-count');
assertUniqueQueue(scaleQueue, 'scale');
const admittedScale = new Set(scaleIds.slice(0, 250));
assert.equal(scaleQueue.every((row) => admittedScale.has(row.id)), true, 'scale-library-leak');
// Generous fail line: this is an interactive learner queue, not an offline batch.
assert.ok(scaleMs < 8000, `scale-queue-pathological-runtime:${scaleMs.toFixed(1)}ms`);

const untouchedProbe = xizongRetentionState(scaleState, scaleIds.at(-1), T0 + 90 * DAY);
assert.equal(untouchedProbe.state, 'LIBRARY_ONLY', 'scale-untouched-became-time-debt');

// ---------------------------------------------------------------------------
// B. 90-day selective retention loop under bounded review capacity.
// ---------------------------------------------------------------------------

let longState = buildMemory(600, 6);
const longIds = allCardIds(longState);
const admittedLong = new Set(longIds.slice(0, 120));

for (let i = 0; i < 40; i += 1) {
  longState = addEvidence(longState, longIds[i], i % 2 ? 'unknown' : 'fuzzy', T0);
}
for (let i = 40; i < 80; i += 1) {
  longState = addEvidence(longState, longIds[i], 'known', T0);
}
for (let i = 80; i < 120; i += 1) {
  longState = addEvidence(longState, longIds[i], 'mastered', T0);
}

const dailyDueBefore = [];
let maxQueue = 0;
let totalReviews = 0;

for (let day = 0; day < 90; day += 1) {
  const now = T0 + day * DAY;
  const queue = todayMemoryQueue(longState, { now });
  assertUniqueQueue(queue, `day-${day}`);
  assert.equal(queue.every((row) => admittedLong.has(row.id)), true, `day-${day}:library-leak`);
  maxQueue = Math.max(maxQueue, queue.length);
  dailyDueBefore.push(queue.length);

  const work = queue.slice(0, 18);
  work.forEach((row, index) => {
    const retention = xizongRetentionState(longState, row.id, now);
    const rating = retention.state === 'DUE_WEAK' ? 'known' : 'mastered';
    longState = addEvidence(longState, row.id, rating, now + (index + 1) * 60_000);
    totalReviews += 1;
  });
}

const finalQueue = todayMemoryQueue(longState, { now: T0 + 90 * DAY });
assertUniqueQueue(finalQueue, 'day-90-final');
assert.equal(finalQueue.every((row) => admittedLong.has(row.id)), true, 'final-library-leak');
assert.ok(maxQueue <= 120, `review-debt-exceeded-admitted-identities:${maxQueue}`);
assert.ok(totalReviews > 120, 'long-run-did-not-retest-admitted-memory');

const last28 = dailyDueBefore.slice(-28);
const avgLast28 = last28.reduce((a, b) => a + b, 0) / last28.length;
assert.ok(avgLast28 <= 18, `steady-state-review-load-exceeds-capacity:${avgLast28.toFixed(2)}`);

for (const id of longIds.slice(120, 140)) {
  assert.equal(
    xizongRetentionState(longState, id, T0 + 90 * DAY).state,
    'LIBRARY_ONLY',
    `untouched-library-time-debt:${id}`
  );
}

// Repeated "known" may prove current retrieval, but can never inflate durable stability.
let knownState = buildMemory(1, 1);
const knownId = allCardIds(knownState)[0];
knownState = addEvidence(knownState, knownId, 'unknown', T0);
for (let day = 0; day < 6; day += 1) {
  knownState = addEvidence(knownState, knownId, 'known', T0 + day * DAY + 60_000);
  const retention = xizongRetentionState(knownState, knownId, T0 + day * DAY + 120_000);
  assert.equal(retention.stabilityStage, 0, `known-inflated-stability:day-${day}`);
  assert.equal(retention.nextIntervalDays, 1, `known-expanded-beyond-d1:day-${day}`);
}

// ---------------------------------------------------------------------------
// C. Repair completion must not rewrite mastery.
// ---------------------------------------------------------------------------

const evidenceBeforeRepair = longState.evidence.length;
const repairCard = longIds[0];
longState = setRepairTasks(longState, [{
  id: 'repair:stress:1',
  cardId: repairCard,
  kpId: longState.cards[repairCard].kpId,
  blockId: longState.cards[repairCard].blockId,
  systemId: 'stress',
  title: 'Stress repair',
  reason: 'Official W/U',
  action: 'Repair only the bounded distinction',
  priority: 'high',
  origin: 'ARCH_PLUS_STRESS',
  sourceQuestionIds: ['xizong-official-2025-n041'],
  createdAt: '2026-09-20T08:30:00.000Z',
  status: 'ACTIVE'
}]);
assert.equal(activeRepairTasks(longState).length, 1, 'repair-not-active');
longState = completeRepairTask(longState, 'repair:stress:1', '2026-09-20T09:00:00.000Z');
assert.equal(activeRepairTasks(longState).length, 0, 'repair-not-closed');
assert.equal(longState.evidence.length, evidenceBeforeRepair, 'repair-rewrote-memory-evidence');

// ---------------------------------------------------------------------------
// D. Targeted Practice: true-question reuse + bounded Current-bound AI probes.
// ---------------------------------------------------------------------------

const targetCard = longState.cards[longIds[0]];
const probeRaw = {
  question_id: 'xizong-ai-probe:stress-kp-001',
  source_kind: 'AI_TRANSFER_PROBE',
  probe_kind: 'CONDITION_CHANGE',
  question_type: 'A',
  stem: '在只改变一个决定性条件后，哪个结论仍成立？',
  options: [
    { label: 'A', text: 'A' },
    { label: 'B', text: 'B' },
    { label: 'C', text: 'C' },
    { label: 'D', text: 'D' }
  ],
  correct_answer: 'C',
  target_kp_ids: [targetCard.kpId],
  canonical_source_hash: targetCard.sourceHash,
  explanation: {
    exam_target: 'Stress transfer',
    decision_axis: 'Decisive condition',
    reasoning_chain: ['Identify condition', 'Run mechanism'],
    correct_option_reason: 'Bound to current owner',
    transfer_rule: 'Recompute, do not memorize wording'
  }
};

const probes = normalizeXizongInlinePracticeQuestions([probeRaw], 'ARCH_PLUS_STRESS');
assert.equal(probes.length, 1, 'probe-normalization');
assert.equal(
  validateXizongInlinePracticeQuestionBindings(longState, probes, 'ARCH_PLUS_STRESS'),
  true,
  'current-bound-probe-rejected'
);

const staleProbe = normalizeXizongInlinePracticeQuestions([
  { ...probeRaw, question_id: 'xizong-ai-probe:stress-kp-stale', canonical_source_hash: 'stale-owner-hash' }
], 'ARCH_PLUS_STRESS_STALE');
expectThrows(
  () => validateXizongInlinePracticeQuestionBindings(longState, staleProbe, 'ARCH_PLUS_STRESS_STALE'),
  /INLINE_QUESTION_SOURCE_REVISION_MISMATCH/,
  'stale-probe-accepted'
);

expectThrows(
  () => normalizeXizongInlinePracticeQuestions([
    probeRaw,
    { ...probeRaw, question_id: 'xizong-ai-probe:stress-kp-002' },
    { ...probeRaw, question_id: 'xizong-ai-probe:stress-kp-003' }
  ], 'ARCH_PLUS_STRESS_BURDEN'),
  /INLINE_QUESTION_COUNT_INVALID/,
  'third-ai-probe-accepted'
);

// ---------------------------------------------------------------------------
// E. True-question reuse, AI evidence separation, and score attribution.
// ---------------------------------------------------------------------------

const reviewedRelation = {
  reviewStatus: 'REVIEWED',
  sourceSystemId: 'stress',
  systemId: 'stress',
  blockId: targetCard.blockId,
  targetStatus: 'RESOLVED_KP',
  resolvedLogicGroupId: 'stress-lg01',
  primaryKpId: 'STRESS-KP-001',
  primaryRuntimeKpId: targetCard.kpId,
  supportingKpIds: ['STRESS-KP-002','STRESS-KP-003'],
  supportingRuntimeKpIds: [longState.cards[longIds[1]].kpId, longState.cards[longIds[2]].kpId]
};

const officialQuestion = {
  questionId: 'xizong-official-2025-n041',
  year: 2025,
  number: 41,
  questionType: 'A',
  correctAnswer: 'D',
  points: 2,
  sourceKind: 'OFFICIAL_EXAM',
  scoringRole: 'OFFICIAL_EVIDENCE',
  relation: reviewedRelation
};

const probeQuestion = probes[0];
const context = {
  systemId: 'stress',
  canonicalId: 'STRESS',
  scopeHash: 'stress-scope',
  questionInventoryHash: 'stress-inventory',
  questions: [officialQuestion, probeQuestion],
  attemptContext: 'TARGETED_PRACTICE',
  resultVisibility: 'immediate',
  studyPhase: 'SECOND_PASS',
  queueMode: 'EXPLICIT_SET'
};

let sweep = {};
let serial = 0;
const makeRuntime = (iso) => ({
  now: iso,
  makeId: (prefix) => `${prefix}:stress:${++serial}`
});

sweep = recordXizongQuestionAttempt(sweep, {
  question: officialQuestion,
  status: 'wrong',
  selected: ['A'],
  context,
  holdoutYears: []
}, makeRuntime('2026-09-20T10:00:00.000Z'));

sweep = recordXizongQuestionAttempt(sweep, {
  question: probeQuestion,
  status: 'wrong',
  selected: ['B'],
  context,
  holdoutYears: []
}, makeRuntime('2026-09-20T10:05:00.000Z'));

let retained = collectXizongRetainedEvidence(
  [['kianos:xizong:chat-set-question-sweep:stress:v1', JSON.stringify(sweep)]],
  { holdoutYears: [] }
);
assert.deepEqual(retained.wrongUncertainIds, [officialQuestion.questionId], 'ai-polluted-official-wu');
assert.equal(retained.transferProbeEvents.length, 1, 'ai-transfer-evidence-missing');

sweep = recordXizongQuestionAttempt(sweep, {
  question: officialQuestion,
  status: 'stable',
  selected: ['D'],
  context,
  holdoutYears: []
}, makeRuntime('2026-09-21T10:00:00.000Z'));

retained = collectXizongRetainedEvidence(
  [['kianos:xizong:chat-set-question-sweep:stress:v1', JSON.stringify(sweep)]],
  { holdoutYears: [] }
);
assert.equal(retained.wrongUncertainIds.includes(officialQuestion.questionId), false, 'stable-reuse-did-not-clear-current-wu');
assert.equal(
  sweep.attemptHistory.filter((row) => row.question_id === officialQuestion.questionId).length,
  2,
  'official-reuse-history-not-preserved'
);

const score = summarizeXizongScoreAttribution([
  ...sweep.attemptHistory,
  {
    type: 'QUESTION_ATTEMPT',
    attempt_id: 'stress-unmapped',
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
    submitted_at: '2026-09-22T10:00:00.000Z'
  }
]);

assert.equal(score.rows.some((row) => row.question_id.startsWith('xizong-ai-probe:')), false, 'ai-entered-score-attribution');
assert.equal(score.totals.stable_points, 2, 'stable-reuse-not-current-score-evidence');
assert.equal(score.totals.wrong_points, 1.5, 'old-official-wrong-or-ai-double-counted');
assert.equal(score.totals.unmapped_points, 1.5, 'partial-mapping-did-not-fail-closed');
const kpBucket = score.targets.find((row) => row.owner_kind === 'KP' && row.owner_id === targetCard.kpId);
assert.ok(kpBucket, 'reviewed-primary-kp-bucket-missing');
assert.equal(kpBucket.stable_points, 2, 'supporting-kps-duplicated-points');

// ---------------------------------------------------------------------------
// F. Governance self-attack: no normal-mode ranking drift.
// ---------------------------------------------------------------------------

const policyPath = path.resolve(process.cwd(), '../content/xizong/knowledge/learner/study-policy.json');
const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
assert.equal(policy.goal.score_target, '275+', 'xizong-score-target-drift');
assert.equal(Boolean(policy.marginal_value), false, 'marginal-value-ranking-sneaked-into-normal-mode');
assert.equal(Boolean(policy.exam_frequency_priority), false, 'frequency-ranking-sneaked-into-normal-mode');
assert.equal(
  policy.score_attribution.prediction_boundary.includes('not predicted score gain/loss'),
  true,
  'score-attribution-prediction-boundary-missing'
);
assert.equal(
  policy.memory_admission.retention_clock.exam_horizon_rule.includes('D2→D4→D7→D14'),
  true,
  'exam-horizon-retention-policy-drift'
);

console.log(JSON.stringify({
  ok: true,
  schema: 'kianos.xizong.architecture-plus-stress.v1',
  scale: {
    released_cards: scaleIds.length,
    admitted_cards: admittedScale.size,
    immediate_due: scaleQueue.length,
    queue_ms: Math.round(scaleMs * 10) / 10
  },
  ninety_day_memory: {
    released_cards: longIds.length,
    admitted_cards: admittedLong.size,
    max_due_queue: maxQueue,
    final_due_queue: finalQueue.length,
    total_review_events: totalReviews,
    avg_due_last_28_days: Math.round(avgLast28 * 100) / 100,
    daily_review_cap: 18
  },
  targeted_practice: {
    official_reuse_preserved: true,
    ai_probe_cap: 2,
    stale_probe_rejected: true,
    official_ai_evidence_separated: true
  },
  score_attribution: {
    stable_points: score.totals.stable_points,
    wrong_points: score.totals.wrong_points,
    unmapped_points: score.totals.unmapped_points,
    ai_score_pollution: 0,
    primary_owner_no_double_count: true
  },
  architecture: {
    normal_mode_marginal_value: 'ABSENT',
    normal_mode_frequency_ranking: 'ABSENT',
    subject_local_recovery_controller: 'NOT_REQUIRED_BY_STRESS'
  }
}, null, 2));

console.log('PASS Xizong Architecture+ stress: real-scale selective Memory, 90-day retention, true-question reuse, bounded Current-bound AI probes, repair separation, partial mapping fail-closed, no ranking drift');
