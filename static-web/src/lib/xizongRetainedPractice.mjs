export const XIZONG_RETAINED_SET_SCHEMA = 'kianos.xizong.retained_set.v1';
export const XIZONG_RETAINED_SET_KEY = 'kianos:xizong:retained-set:v1';
export const XIZONG_QUESTION_PREFERENCES_KEY = 'kianos:xizong:question-preferences:v1';

const SWEEP_KEY = /^kianos:xizong:(?:system|chat-set|retained)-question-sweep:.*:v1$/;
const QID = /^xizong-official-(\d{4})-n\d{3}$/;

const asObject = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const asTime = (value) => String(value || '');

function parseState(value) {
  if (value && typeof value === 'object') return asObject(value);
  try { return asObject(JSON.parse(String(value || ''))); } catch { return {}; }
}

function eventQuestionId(event) {
  return String(event?.question_id || event?.questionId || '');
}

function eventTime(event) {
  return asTime(event?.submitted_at || event?.updatedAt || event?.updated_at);
}

function fallbackResultEvents(state) {
  return Object.entries(asObject(state.results)).map(([questionId, result]) => ({
    type: 'QUESTION_ATTEMPT',
    question_id: questionId,
    status: String(result?.status || ''),
    submitted_at: String(result?.updatedAt || result?.submitted_at || ''),
    marked: Boolean(result?.marked)
  }));
}

function yearOf(questionId) {
  const match = String(questionId || '').match(QID);
  return match ? Number(match[1]) : null;
}

function sortedByRecency(ids, latest) {
  return [...ids].sort((a, b) => {
    const at = eventTime(latest.get(a));
    const bt = eventTime(latest.get(b));
    if (at !== bt) return bt.localeCompare(at);
    return a.localeCompare(b);
  });
}

export function collectXizongRetainedEvidence(entries, options = {}) {
  const rows = Array.isArray(entries) ? entries : [];
  const holdout = new Set((Array.isArray(options.holdoutYears) ? options.holdoutYears : [])
    .map(Number)
    .filter(Number.isFinite));
  const markOverrides = asObject(options.markOverrides);

  const latest = new Map();
  const legacyMarks = new Set();

  for (const [key, raw] of rows) {
    if (!SWEEP_KEY.test(String(key || ''))) continue;
    const state = parseState(raw);

    for (const [questionId, marked] of Object.entries(asObject(state.marks))) {
      if (marked && QID.test(questionId)) legacyMarks.add(questionId);
    }

    const history = Array.isArray(state.attemptHistory) && state.attemptHistory.length
      ? state.attemptHistory
      : fallbackResultEvents(state);
    const hiddenPaperSealed = Boolean(state?.paperSeal?.sealedAt);

    for (const event of history) {
      if (event?.type && event.type !== 'QUESTION_ATTEMPT') continue;
      if (String(event?.result_visibility || '') === 'hidden' && !hiddenPaperSealed) continue;
      const questionId = eventQuestionId(event);
      if (!QID.test(questionId)) continue;
      const previous = latest.get(questionId);
      if (!previous || eventTime(event) >= eventTime(previous)) latest.set(questionId, event);
      if (event?.marked === true) legacyMarks.add(questionId);
    }
  }

  const marked = new Set(legacyMarks);
  for (const [questionId, value] of Object.entries(markOverrides)) {
    if (!QID.test(questionId)) continue;
    if (value === true) marked.add(questionId);
    else if (value === false) marked.delete(questionId);
  }

  const eligible = (questionId) => {
    const year = yearOf(questionId);
    return year != null && !holdout.has(year);
  };

  const wrongUncertainIds = sortedByRecency(
    [...latest.entries()]
      .filter(([questionId, event]) => eligible(questionId) && ['wrong', 'uncertain'].includes(String(event?.status || '')))
      .map(([questionId]) => questionId),
    latest
  );

  const markedIds = sortedByRecency(
    [...marked].filter(eligible),
    latest
  );

  return {
    wrongUncertainIds,
    markedIds,
    latestAttemptByQuestion: Object.fromEntries([...latest.entries()].map(([questionId, event]) => [questionId, event]))
  };
}

export function buildXizongRetainedSet(mode, evidence, options = {}) {
  const normalized = String(mode || '').toUpperCase();
  const ids = normalized === 'MARKED'
    ? [...(evidence?.markedIds || [])]
    : normalized === 'WU'
      ? [...(evidence?.wrongUncertainIds || [])]
      : [];
  if (!['WU', 'MARKED'].includes(normalized)) throw new Error(`XIZONG_RETAINED_MODE_INVALID:${mode}`);
  if (!ids.length) throw new Error(`XIZONG_RETAINED_SET_EMPTY:${normalized}`);
  return {
    schema: XIZONG_RETAINED_SET_SCHEMA,
    set_id: `retained-${normalized.toLowerCase()}-${Date.now()}`,
    mode: normalized,
    label: normalized === 'WU' ? '错题 / 不确定' : '已标记',
    study_phase: String(options.studyPhase || 'SECOND_PASS'),
    result_visibility: 'immediate',
    speed: String(options.speed || 'normal'),
    question_ids: ids
  };
}

export function xizongQuestionMarkOverrides(preferences) {
  return asObject(preferences)?.questionMarks && typeof preferences.questionMarks === 'object'
    ? { ...preferences.questionMarks }
    : {};
}

export function setXizongGlobalQuestionMark(preferences, questionId, marked) {
  const id = String(questionId || '');
  if (!QID.test(id)) throw new Error(`XIZONG_GLOBAL_MARK_ID_INVALID:${id}`);
  const base = asObject(preferences);
  return {
    ...base,
    questionMarks: {
      ...xizongQuestionMarkOverrides(base),
      [id]: Boolean(marked)
    }
  };
}

export function resolveXizongQuestionMarked(preferences, legacyState, questionId) {
  const id = String(questionId || '');
  const overrides = xizongQuestionMarkOverrides(preferences);
  if (Object.prototype.hasOwnProperty.call(overrides, id)) return Boolean(overrides[id]);
  return Boolean(asObject(legacyState?.marks)[id]);
}
