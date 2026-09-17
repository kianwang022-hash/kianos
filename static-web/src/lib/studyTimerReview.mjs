import {
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_SCHEMA,
  STUDY_SUBJECTS,
  pauseStudyTimer,
  readStudyTimerLedger,
  readStudyTimerState,
  resumeStudyTimer
} from './studyTimer.mjs';

export const STUDY_TIMER_REVIEW_KEY = 'kianos-study-timer-review-v1';
export const STUDY_TIMER_GAP_MS = 30 * 60 * 1000;

const safeParse = (raw, fallback) => {
  try { return raw == null ? fallback : JSON.parse(raw); }
  catch { return fallback; }
};

function readStore(storage) {
  const value = safeParse(storage?.getItem?.(STUDY_TIMER_REVIEW_KEY), null);
  if (!value || value.schema !== 'kianos.study-timer-review.v1' || !Array.isArray(value.items)) {
    return { schema: 'kianos.study-timer-review.v1', items: [] };
  }
  return { schema: 'kianos.study-timer-review.v1', items: value.items.slice(-1000) };
}

function writeStore(storage, store) {
  storage?.setItem?.(STUDY_TIMER_REVIEW_KEY, JSON.stringify(store));
  return store;
}

export function readPendingStudyTimerReviews(storage) {
  return readStore(storage).items.filter((item) => item?.status === 'pending');
}

export function captureStudyTimerRuntimeGap(storage, now = Date.now(), thresholdMs = STUDY_TIMER_GAP_MS) {
  const state = readStudyTimerState(storage);
  if (!state.running || !state.subject || state.segmentStartedAt == null || state.lastSeenAt == null) return null;
  if (state.lastSeenAt < state.segmentStartedAt || now - state.lastSeenAt < thresholdMs) return null;

  const from = state.lastSeenAt;
  const to = now;
  const id = `runtime-gap-${from}-${to}-${state.subject}`;
  const store = readStore(storage);
  const existing = store.items.find((item) => item.id === id);
  if (existing) return existing;

  // Preserve the trustworthy continuous part up to the last heartbeat, isolate only
  // the runtime-dead interval, then continue timing without requiring a manual resume.
  pauseStudyTimer(storage, from);
  resumeStudyTimer(storage, state.context, to);

  const item = {
    id,
    kind: 'runtime_gap',
    status: 'pending',
    subject: state.subject,
    context: state.context,
    from,
    to,
    minutes: Math.max(1, Math.round((to - from) / 60000)),
    createdAt: now,
    resolution: null
  };
  store.items.push(item);
  if (store.items.length > 1000) store.items = store.items.slice(-1000);
  writeStore(storage, store);
  return item;
}

function appendResolvedSession(storage, item, { subject, from, to, context }) {
  if (!STUDY_SUBJECTS.includes(subject) || !Number.isFinite(from) || !Number.isFinite(to) || to <= from) {
    throw new Error('Invalid timer review resolution.');
  }
  const ledger = readStudyTimerLedger(storage);
  ledger.sessions.push({
    id: `review-${item.id}-${subject}`,
    subject,
    context: context || item.context || { subject, route: `review:${subject}`, detailKey: 'reviewed-gap', detailLabel: 'Reviewed timer gap' },
    startedAt: Math.round(from),
    endedAt: Math.round(to),
    source: 'review-confirmed-gap',
    excluded: false,
    edited: true
  });
  if (ledger.sessions.length > 10000) ledger.sessions = ledger.sessions.slice(-10000);
  storage?.setItem?.(STUDY_TIMER_LEDGER_KEY, JSON.stringify({ schema: STUDY_TIMER_SCHEMA, sessions: ledger.sessions }));
}

export function resolveStudyTimerReview(storage, reviewId, resolution = {}) {
  const store = readStore(storage);
  const item = store.items.find((candidate) => candidate.id === reviewId);
  if (!item || item.status !== 'pending') return null;
  const action = resolution.action;
  if (!['keep', 'exclude', 'reclassify', 'custom'].includes(action)) throw new Error('Unknown timer review action.');

  if (action === 'keep') {
    appendResolvedSession(storage, item, {
      subject: item.subject,
      from: item.from,
      to: item.to,
      context: item.context
    });
  } else if (action === 'reclassify') {
    const subject = resolution.subject;
    appendResolvedSession(storage, item, {
      subject,
      from: item.from,
      to: item.to,
      context: { subject, route: `review:${subject}`, detailKey: 'reclassified-gap', detailLabel: 'Reclassified timer gap' }
    });
  } else if (action === 'custom') {
    const subject = resolution.subject || item.subject;
    appendResolvedSession(storage, item, {
      subject,
      from: Number.isFinite(resolution.from) ? resolution.from : item.from,
      to: Number.isFinite(resolution.to) ? resolution.to : item.to,
      context: resolution.context || item.context
    });
  }

  item.status = 'resolved';
  item.resolution = {
    action,
    subject: resolution.subject || item.subject,
    from: Number.isFinite(resolution.from) ? resolution.from : item.from,
    to: Number.isFinite(resolution.to) ? resolution.to : item.to,
    resolvedAt: Date.now()
  };
  writeStore(storage, store);
  return item;
}
