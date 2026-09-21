import {
  collectXizongRetainedEvidence,
  buildXizongRetainedSet,
  setXizongGlobalQuestionMark,
  resolveXizongQuestionMarked
} from '../src/lib/xizongRetainedPractice.mjs';

const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_RETAINED_PRACTICE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  console.log(`PASS ${name}${detail ? ` · ${detail}` : ''}`);
};

const q1 = 'xizong-official-2021-n001';
const q2 = 'xizong-official-2021-n002';
const q3 = 'xizong-official-2022-n003';
const q4 = 'xizong-official-2023-n004';
const held = 'xizong-official-2025-n005';

const stateA = {
  marks: { [q3]: true },
  attemptHistory: [
    { type:'QUESTION_ATTEMPT', question_id:q1, question_semantic_revision:'fixture-v1', status:'wrong', submitted_at:'2026-09-18T01:00:00.000Z' },
    { type:'QUESTION_ATTEMPT', question_id:q2, question_semantic_revision:'fixture-v1', status:'uncertain', submitted_at:'2026-09-18T02:00:00.000Z' },
    { type:'QUESTION_ATTEMPT', question_id:held, question_semantic_revision:'fixture-v1', status:'wrong', submitted_at:'2026-09-18T03:00:00.000Z' }
  ]
};
const stateB = {
  marks: {},
  attemptHistory: [
    { type:'QUESTION_ATTEMPT', question_id:q1, question_semantic_revision:'fixture-v1', status:'stable', submitted_at:'2026-09-18T04:00:00.000Z' },
    { type:'QUESTION_ATTEMPT', question_id:q4, question_semantic_revision:'fixture-v1', status:'wrong', submitted_at:'2026-09-18T05:00:00.000Z' }
  ]
};

const preferences = setXizongGlobalQuestionMark(
  setXizongGlobalQuestionMark({}, q3, false),
  q4,
  true
);

const evidence = collectXizongRetainedEvidence([
  ['kianos:xizong:system-question-sweep:circulation:v1', JSON.stringify(stateA)],
  ['kianos:xizong:chat-set-question-sweep:chat-set:demo:v1', JSON.stringify(stateB)],
  ['some:unrelated:key', JSON.stringify({ attemptHistory:[{ question_id:q2, question_semantic_revision:'fixture-v1', status:'wrong' }] })]
], {
  holdoutYears:[2025],
  questionSemanticRevisions:Object.fromEntries([q1,q2,q3,q4,held].map(id=>[id,'fixture-v1'])),
  markOverrides: preferences.questionMarks
});

check(!evidence.wrongUncertainIds.includes(q1), 'latest_stable_removes_old_wrong');
check(evidence.wrongUncertainIds.join(',') === [q4,q2].join(','), 'wu_sorted_by_latest_recency', evidence.wrongUncertainIds.join(','));
check(!evidence.wrongUncertainIds.includes(held), 'holdout_excluded_from_retained_queue');
check(!evidence.markedIds.includes(q3), 'global_unmark_overrides_legacy_scope_mark');
check(evidence.markedIds.includes(q4), 'global_mark_override_admitted');
check(resolveXizongQuestionMarked(preferences, stateA, q3) === false, 'global_unmark_resolves_false');
check(resolveXizongQuestionMarked(preferences, stateA, q4) === true, 'global_mark_resolves_true');

const wuSet = buildXizongRetainedSet('WU', evidence, { studyPhase:'SECOND_PASS' });
check(wuSet.question_ids.join(',') === [q4,q2].join(','), 'wu_set_preserves_aggregated_order');
check(wuSet.study_phase === 'SECOND_PASS', 'wu_set_explicit_phase');
check(wuSet.result_visibility === 'immediate', 'wu_set_immediate_only');

const markedSet = buildXizongRetainedSet('MARKED', evidence, { studyPhase:'LATE_REVIEW' });
check(markedSet.question_ids.join(',') === q4, 'marked_set_uses_global_mark_state');
check(markedSet.study_phase === 'LATE_REVIEW', 'marked_set_accepts_explicit_phase');

console.log('XIZONG_RETAINED_PRACTICE_PASS');
