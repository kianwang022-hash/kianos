export const XIZONG_STUDY_PHASES = Object.freeze(['FIRST_PASS', 'SECOND_PASS', 'LATE_REVIEW']);
export const XIZONG_QUESTION_ROUND_MODES = Object.freeze(['TARGETED', 'FULL_RESWEEP', 'EXPLICIT_SET']);

const PHASE_LABELS = Object.freeze({
  FIRST_PASS: '一轮',
  SECOND_PASS: '二轮',
  LATE_REVIEW: '后期复习'
});

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isoNow = () => new Date().toISOString();
const fallbackId = (prefix = 'xizong') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const questionIdOf = (event) => String(event?.question_id || event?.questionId || '');

export const xizongStudyPhaseLabel = (phase) => PHASE_LABELS[phase] || PHASE_LABELS.FIRST_PASS;

const normalizeStudyPhase = (phase, fallback = 'FIRST_PASS') =>
  XIZONG_STUDY_PHASES.includes(String(phase || '')) ? String(phase) : fallback;

function questionMap(questions) {
  return new Map((Array.isArray(questions) ? questions : [])
    .filter((question) => question?.questionId)
    .map((question) => [String(question.questionId), question]));
}

function eligibleQuestions(questions, holdoutYears = []) {
  const held = new Set((Array.isArray(holdoutYears) ? holdoutYears : []).map(Number).filter(Number.isFinite));
  return (Array.isArray(questions) ? questions : [])
    .filter((question) => question?.questionId)
    .filter((question) => !held.has(Number(question?.year)));
}

function latestAttemptByQuestion(history, phase = null) {
  const latest = new Map();
  for (const event of Array.isArray(history) ? history : []) {
    if (event?.type !== 'QUESTION_ATTEMPT') continue;
    if (phase && event?.study_phase !== phase) continue;
    const questionId = questionIdOf(event);
    if (!questionId) continue;
    latest.set(questionId, event);
  }
  return latest;
}

export function deriveXizongSecondPassQuestionIds(input, questions, holdoutYears = []) {
  const state = isObject(input) ? input : {};
  const firstPassLatest = latestAttemptByQuestion(state.attemptHistory, 'FIRST_PASS');
  const latest = latestAttemptByQuestion(state.attemptHistory);
  return eligibleQuestions(questions, holdoutYears)
    .map((question) => String(question.questionId))
    .filter((questionId) => {
      const firstStatus = String(firstPassLatest.get(questionId)?.status || '');
      const latestStatus = String(latest.get(questionId)?.status || '');
      return ['wrong', 'uncertain'].includes(firstStatus) && ['wrong', 'uncertain'].includes(latestStatus);
    });
}

export function deriveXizongMarkedQuestionIds(input, questions, holdoutYears = []) {
  const state = isObject(input) ? input : {};
  const marks = isObject(state.marks) ? state.marks : {};
  return eligibleQuestions(questions, holdoutYears)
    .map((question) => String(question.questionId))
    .filter((questionId) => Boolean(marks[questionId]));
}

export function deriveXizongLateReviewQuestionIds(input, questions, holdoutYears = []) {
  const state = isObject(input) ? input : {};
  const latest = latestAttemptByQuestion(state.attemptHistory);
  return eligibleQuestions(questions, holdoutYears)
    .map((question) => String(question.questionId))
    .filter((questionId) => ['wrong', 'uncertain'].includes(String(latest.get(questionId)?.status || '')));
}

export function deriveXizongQuestionIdsForCurrentRound(input, questions, holdoutYears = []) {
  const state = isObject(input) ? input : {};
  const eligible = eligibleQuestions(questions, holdoutYears);
  const allIds = eligible.map((question) => String(question.questionId));
  if (['FULL_RESWEEP', 'EXPLICIT_SET'].includes(state.round?.queueMode)) return allIds;
  if (state.round?.studyPhase === 'SECOND_PASS') {
    const targeted = new Set(deriveXizongSecondPassQuestionIds(state, eligible, []));
    return allIds.filter((questionId) => targeted.has(questionId));
  }
  if (state.round?.studyPhase === 'LATE_REVIEW') {
    const targeted = new Set(deriveXizongLateReviewQuestionIds(state, eligible, []));
    return allIds.filter((questionId) => targeted.has(questionId));
  }
  return allIds;
}

function reviewedRelationSnapshot(question) {
  const relation = question?.relation;
  if (!relation || relation.reviewStatus !== 'REVIEWED') return null;
  return {
    review_status: 'REVIEWED',
    source_system_id: String(relation.sourceSystemId || ''),
    system_id: String(relation.systemId || ''),
    block_id: String(relation.blockId || ''),
    target_status: String(relation.targetStatus || ''),
    logic_group_id: String(relation.resolvedLogicGroupId || relation.logicGroupId || ''),
    primary_canonical_kp_id: String(relation.primaryKpId || ''),
    primary_runtime_kp_id: String(relation.primaryRuntimeKpId || ''),
    supporting_canonical_kp_ids: [...new Set((Array.isArray(relation.supportingKpIds) ? relation.supportingKpIds : []).map(String).filter(Boolean))],
    supporting_runtime_kp_ids: [...new Set((Array.isArray(relation.supportingRuntimeKpIds) ? relation.supportingRuntimeKpIds : []).map(String).filter(Boolean))]
  };
}

function attemptEvent({
  question,
  result,
  context,
  round,
  holdoutYears,
  history,
  evidenceOrigin,
  submittedAt,
  makeId
}) {
  const questionId = String(question?.questionId || result?.questionId || '');
  if (!questionId) throw new Error('XIZONG_QUESTION_ATTEMPT_ID_MISSING');
  const priorAttempts = (Array.isArray(history) ? history : []).filter((event) => questionIdOf(event) === questionId).length;
  return {
    type: 'QUESTION_ATTEMPT',
    evidence_origin: evidenceOrigin,
    attempt_id: makeId('attempt'),
    attempt_index: priorAttempts + 1,
    question_id: questionId,
    question_source: String(question?.sourceKind || (/^xizong-official-\d{4}-n\d{3}$/.test(questionId) ? 'OFFICIAL_EXAM' : 'UNKNOWN')),
    scoring_role: String(question?.scoringRole || (/^xizong-official-\d{4}-n\d{3}$/.test(questionId) ? 'OFFICIAL_EVIDENCE' : 'NON_SCORE')),
    probe_kind: String(question?.probeKind || ''),
    evidence_intent: String(question?.evidenceIntent || ''),
    semantic_family_id: String(question?.semanticFamilyId || ''),
    derived_from_ids: [...new Set((Array.isArray(question?.derivedFromIds) ? question.derivedFromIds : []).map(String).filter(Boolean))],
    changed_dimensions: [...new Set((Array.isArray(question?.changedDimensions) ? question.changedDimensions : []).map(String).filter(Boolean))],
    fresh_transfer_eligible: question?.freshTransferEligible === true,
    freshness_class: String(question?.freshnessClass || ''),
    target_kp_ids: [...new Set((Array.isArray(question?.targetKpIds) ? question.targetKpIds : []).map(String).filter(Boolean))],
    canonical_source_hash: String(question?.canonicalSourceHash || ''),
    points_possible: Number.isFinite(Number(question?.points)) && Number(question?.points) > 0
      ? Number(question.points)
      : null,
    reviewed_relation: reviewedRelationSnapshot(question),
    system_id: String(context?.systemId || ''),
    canonical_id: String(context?.canonicalId || ''),
    study_phase: round.studyPhase,
    context: String(context?.attemptContext || 'SYSTEM_SWEEP'),
    round_id: round.id,
    round_ordinal: round.ordinal,
    status: String(result?.status || ''),
    selected: Array.isArray(result?.selected) ? [...result.selected].sort() : [],
    correct_answer: result?.correctAnswer ?? question?.correctAnswer ?? '',
    year: question?.year ?? null,
    number: question?.number ?? null,
    question_type: question?.questionType || '',
    result_visibility: ['immediate', 'hidden'].includes(String(context?.resultVisibility || ''))
      ? String(context.resultVisibility)
      : 'immediate',
    scope_hash: String(context?.scopeHash || ''),
    question_inventory_hash: String(context?.questionInventoryHash || ''),
    holdout_years: [...new Set((Array.isArray(holdoutYears) ? holdoutYears : []).map(Number).filter(Number.isFinite))].sort((a, b) => a - b),
    marked: Boolean(result?.marked),
    submitted_at: submittedAt
  };
}

export function ensureXizongQuestionSweepState(input, context = {}, runtime = {}) {
  const now = runtime.now || isoNow();
  const makeId = runtime.makeId || fallbackId;
  const state = isObject(input) ? { ...input } : {};
  state.results = isObject(state.results) ? { ...state.results } : {};
  state.marks = isObject(state.marks) ? { ...state.marks } : {};
  state.attemptHistory = Array.isArray(state.attemptHistory) ? [...state.attemptHistory] : [];

  const validRound = isObject(state.round)
    && state.round.id
    && XIZONG_STUDY_PHASES.includes(state.round.studyPhase)
    && Number.isInteger(Number(state.round.ordinal))
    && Number(state.round.ordinal) > 0;

  if (!validRound) {
    const legacyTimes = Object.values(state.results)
      .map((row) => String(row?.updatedAt || ''))
      .filter(Boolean)
      .sort();
    state.round = {
      id: makeId('round'),
      studyPhase: normalizeStudyPhase(context?.studyPhase),
      queueMode: XIZONG_QUESTION_ROUND_MODES.includes(String(context?.queueMode || ''))
        ? String(context.queueMode)
        : 'TARGETED',
      ordinal: 1,
      startedAt: legacyTimes[0] || now,
      evidenceOrigin: Object.keys(state.results).length ? 'BOOTSTRAP_EXISTING_STATE' : 'RUNTIME_CREATED'
    };
  } else {
    state.round = {
      ...state.round,
      ordinal: Number(state.round.ordinal)
    };
  }

  if (!state.attemptHistoryBootstrappedAt) {
    const questions = questionMap(context.questions);
    for (const [questionId, result] of Object.entries(state.results)) {
      if (!isObject(result)) continue;
      const alreadyPreserved = state.attemptHistory.some((event) => {
        if (questionIdOf(event) !== questionId) return false;
        const eventAt = String(event?.submitted_at || event?.updatedAt || '');
        return eventAt && result.updatedAt && eventAt === String(result.updatedAt);
      });
      if (alreadyPreserved) continue;
      const question = questions.get(questionId) || { questionId };
      const event = attemptEvent({
        question,
        result,
        context,
        round: state.round,
        holdoutYears: context.holdoutYears,
        history: state.attemptHistory,
        evidenceOrigin: 'BOOTSTRAP_EXISTING_RESULT',
        submittedAt: String(result.updatedAt || now),
        makeId
      });
      state.attemptHistory.push(event);
      state.results[questionId] = {
        ...result,
        attemptId: event.attempt_id,
        roundId: state.round.id,
        studyPhase: state.round.studyPhase
      };
    }
    state.attemptHistoryBootstrappedAt = now;
  }

  return state;
}

export function recordXizongQuestionAttempt(input, payload, runtime = {}) {
  const now = runtime.now || isoNow();
  const makeId = runtime.makeId || fallbackId;
  const question = payload?.question;
  const questionId = String(question?.questionId || '');
  if (!questionId) throw new Error('XIZONG_QUESTION_ATTEMPT_ID_MISSING');

  const state = ensureXizongQuestionSweepState(input, payload?.context || {}, { now, makeId });
  if (state.results[questionId]) throw new Error(`XIZONG_QUESTION_ALREADY_COMPLETED_IN_ROUND:${questionId}`);

  const result = {
    status: String(payload?.status || ''),
    selected: [...new Set(Array.from(payload?.selected || []).map(String))].sort(),
    correctAnswer: question.correctAnswer,
    marked: Boolean(payload?.marked ?? state.marks?.[questionId]),
    updatedAt: now
  };
  if (!['stable', 'uncertain', 'wrong'].includes(result.status)) {
    throw new Error(`XIZONG_QUESTION_ATTEMPT_STATUS_INVALID:${result.status}`);
  }

  const event = attemptEvent({
    question,
    result,
    context: payload?.context || {},
    round: state.round,
    holdoutYears: payload?.holdoutYears,
    history: state.attemptHistory,
    evidenceOrigin: 'USER_QUESTION_ATTEMPT',
    submittedAt: now,
    makeId
  });

  return {
    ...state,
    results: {
      ...state.results,
      [questionId]: {
        ...result,
        attemptId: event.attempt_id,
        roundId: state.round.id,
        studyPhase: state.round.studyPhase
      }
    },
    attemptHistory: [...state.attemptHistory, event]
  };
}

export function setXizongQuestionMarked(input, questionId, marked = true) {
  const id = String(questionId || '');
  if (!id) throw new Error('XIZONG_QUESTION_MARK_ID_MISSING');
  const state = isObject(input) ? { ...input } : {};
  state.marks = isObject(state.marks) ? { ...state.marks } : {};
  if (marked) state.marks[id] = true;
  else delete state.marks[id];
  return state;
}

export function isXizongQuestionMarked(input, questionId) {
  return Boolean(isObject(input?.marks) && input.marks[String(questionId || '')]);
}

export function startNextXizongQuestionRound(input, activeQuestionIds, runtime = {}, options = {}) {
  const now = runtime.now || isoNow();
  const makeId = runtime.makeId || fallbackId;
  const state = ensureXizongQuestionSweepState(input, {}, { now, makeId });
  const activeIds = [...new Set((Array.isArray(activeQuestionIds) ? activeQuestionIds : []).map(String).filter(Boolean))];
  const remaining = activeIds.filter((questionId) => !state.results?.[questionId]);
  if (remaining.length) throw new Error(`XIZONG_QUESTION_ROUND_INCOMPLETE:${remaining.length}`);

  const requestedPhase = normalizeStudyPhase(options?.studyPhase, state.round.studyPhase);
  const requestedMode = String(options?.queueMode || 'TARGETED');
  const queueMode = XIZONG_QUESTION_ROUND_MODES.includes(requestedMode) ? requestedMode : 'TARGETED';

  return {
    ...state,
    results: {},
    round: {
      id: makeId('round'),
      studyPhase: requestedPhase,
      queueMode,
      ordinal: Number(state.round.ordinal || 1) + 1,
      startedAt: now,
      previousRoundId: state.round.id,
      evidenceOrigin: 'USER_STARTED_NEXT_ROUND'
    }
  };
}
