export const XIZONG_STUDY_PHASES = Object.freeze(['FIRST_PASS', 'SECOND_PASS', 'LATE_REVIEW']);

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

export const nextXizongStudyPhase = (phase) => phase === 'FIRST_PASS'
  ? 'SECOND_PASS'
  : 'LATE_REVIEW';

function questionMap(questions) {
  return new Map((Array.isArray(questions) ? questions : [])
    .filter((question) => question?.questionId)
    .map((question) => [String(question.questionId), question]));
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
    system_id: String(context?.systemId || ''),
    canonical_id: String(context?.canonicalId || ''),
    study_phase: round.studyPhase,
    context: 'SYSTEM_SWEEP',
    round_id: round.id,
    round_ordinal: round.ordinal,
    status: String(result?.status || ''),
    selected: Array.isArray(result?.selected) ? [...result.selected].sort() : [],
    correct_answer: result?.correctAnswer ?? question?.correctAnswer ?? '',
    year: question?.year ?? null,
    number: question?.number ?? null,
    question_type: question?.questionType || '',
    result_visibility: 'immediate',
    scope_hash: String(context?.scopeHash || ''),
    question_inventory_hash: String(context?.questionInventoryHash || ''),
    holdout_years: [...new Set((Array.isArray(holdoutYears) ? holdoutYears : []).map(Number).filter(Number.isFinite))].sort((a, b) => a - b),
    submitted_at: submittedAt
  };
}

export function ensureXizongQuestionSweepState(input, context = {}, runtime = {}) {
  const now = runtime.now || isoNow();
  const makeId = runtime.makeId || fallbackId;
  const state = isObject(input) ? { ...input } : {};
  state.results = isObject(state.results) ? { ...state.results } : {};
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
      studyPhase: 'FIRST_PASS',
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

export function startNextXizongQuestionRound(input, activeQuestionIds, runtime = {}) {
  const now = runtime.now || isoNow();
  const makeId = runtime.makeId || fallbackId;
  const state = ensureXizongQuestionSweepState(input, {}, { now, makeId });
  const activeIds = [...new Set((Array.isArray(activeQuestionIds) ? activeQuestionIds : []).map(String).filter(Boolean))];
  const remaining = activeIds.filter((questionId) => !state.results?.[questionId]);
  if (remaining.length) throw new Error(`XIZONG_QUESTION_ROUND_INCOMPLETE:${remaining.length}`);

  return {
    ...state,
    results: {},
    round: {
      id: makeId('round'),
      studyPhase: nextXizongStudyPhase(state.round.studyPhase),
      ordinal: Number(state.round.ordinal || 1) + 1,
      startedAt: now,
      previousRoundId: state.round.id,
      evidenceOrigin: 'USER_STARTED_NEXT_ROUND'
    }
  };
}
