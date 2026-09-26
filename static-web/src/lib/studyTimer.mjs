import { isEnglishFamily, localRoute, resolveEnglishActive, topSegment } from './sharedNavigation.mjs';

export const STUDY_TIMER_STATE_KEY = 'kianos-study-timer-state-v2';
export const STUDY_TIMER_LEDGER_KEY = 'kianos-study-timer-ledger-v2';
export const STUDY_TIMER_SCHEMA = 'kianos.study-timer.v2';
export const STUDY_TIMER_TIMEZONE = 'Asia/Shanghai';
export const STUDY_SUBJECTS = Object.freeze(['xizong', 'politics', 'english']);

const MAX_SESSIONS = 10000;
const MIN_SESSION_MS = 1000;

const safeParse = (raw, fallback) => {
  try { return raw == null ? fallback : JSON.parse(raw); }
  catch { return fallback; }
};

const cleanString = (value, max = 240) => typeof value === 'string' ? value.slice(0, max) : '';
const finiteMs = (value) => Number.isFinite(value) ? Math.max(0, Math.round(value)) : null;
const sameContext = (a, b) => (a?.subject || null) === (b?.subject || null)
  && (a?.detailKey || '') === (b?.detailKey || '')
  && (a?.route || '') === (b?.route || '');

export function emptyStudyTimerState() {
  return {
    schema: STUDY_TIMER_SCHEMA,
    running: false,
    manualPaused: false,
    subject: null,
    context: null,
    segmentStartedAt: null,
    lastSeenAt: null,
    revision: 0,
    updatedAt: null
  };
}

export function emptyStudyTimerLedger() {
  return { schema: STUDY_TIMER_SCHEMA, sessions: [] };
}

function normalizeContext(context) {
  if (!context || !STUDY_SUBJECTS.includes(context.subject)) return null;
  return {
    subject: context.subject,
    route: cleanString(context.route),
    detailKey: cleanString(context.detailKey),
    detailLabel: cleanString(context.detailLabel || context.detailKey || context.subject)
  };
}

function normalizeState(value) {
  const fallback = emptyStudyTimerState();
  if (!value || value.schema !== STUDY_TIMER_SCHEMA) return fallback;
  const context = normalizeContext(value.context);
  const subject = STUDY_SUBJECTS.includes(value.subject) ? value.subject : context?.subject || null;
  return {
    schema: STUDY_TIMER_SCHEMA,
    running: value.running === true && !!subject,
    manualPaused: value.manualPaused === true,
    subject,
    context: context?.subject === subject ? context : subject ? { subject, route: '', detailKey: subject, detailLabel: subject } : null,
    segmentStartedAt: finiteMs(value.segmentStartedAt),
    lastSeenAt: finiteMs(value.lastSeenAt),
    revision: Number.isInteger(value.revision) ? Math.max(0, value.revision) : 0,
    updatedAt: finiteMs(value.updatedAt)
  };
}

function normalizeSession(value) {
  if (!value || !STUDY_SUBJECTS.includes(value.subject)) return null;
  const startedAt = finiteMs(value.startedAt);
  const endedAt = finiteMs(value.endedAt);
  if (startedAt === null || endedAt === null || endedAt <= startedAt) return null;
  return {
    id: cleanString(value.id || `${startedAt}-${endedAt}-${value.subject}`),
    subject: value.subject,
    context: normalizeContext(value.context) || { subject: value.subject, route: '', detailKey: value.subject, detailLabel: value.subject },
    startedAt,
    endedAt,
    source: cleanString(value.source || 'timer', 40),
    excluded: value.excluded === true,
    edited: value.edited === true
  };
}

function normalizeLedger(value) {
  if (!value || value.schema !== STUDY_TIMER_SCHEMA || !Array.isArray(value.sessions)) return emptyStudyTimerLedger();
  return {
    schema: STUDY_TIMER_SCHEMA,
    sessions: value.sessions.map(normalizeSession).filter(Boolean).slice(-MAX_SESSIONS)
  };
}

export function readStudyTimerState(storage) {
  return normalizeState(safeParse(storage?.getItem?.(STUDY_TIMER_STATE_KEY), null));
}

export function readStudyTimerLedger(storage) {
  return normalizeLedger(safeParse(storage?.getItem?.(STUDY_TIMER_LEDGER_KEY), null));
}

function writeState(storage, state) {
  storage?.setItem?.(STUDY_TIMER_STATE_KEY, JSON.stringify(state));
  return state;
}

function writeLedger(storage, ledger) {
  storage?.setItem?.(STUDY_TIMER_LEDGER_KEY, JSON.stringify(ledger));
  return ledger;
}

function appendSession(storage, session) {
  const normalized = normalizeSession(session);
  if (!normalized || normalized.endedAt - normalized.startedAt < MIN_SESSION_MS) return;
  const ledger = readStudyTimerLedger(storage);
  ledger.sessions.push(normalized);
  if (ledger.sessions.length > MAX_SESSIONS) ledger.sessions = ledger.sessions.slice(-MAX_SESSIONS);
  writeLedger(storage, ledger);
}

function closeRunningSegment(storage, state, endedAt, source = 'timer') {
  if (!state.running || !state.subject || state.segmentStartedAt == null || endedAt <= state.segmentStartedAt) return;
  appendSession(storage, {
    id: `${state.segmentStartedAt}-${endedAt}-${state.subject}-${state.revision}`,
    subject: state.subject,
    context: state.context,
    startedAt: state.segmentStartedAt,
    endedAt,
    source
  });
}

export function resolveStudyTimerContext(pathname, base = '/') {
  const route = localRoute(pathname || '', base);
  const segment = topSegment(route);
  if (segment === 'xizong') {
    const parts = route.split('/').filter(Boolean).slice(1);
    const detailKey = parts.length ? parts.join('/') : 'overview';
    return { subject: 'xizong', route, detailKey, detailLabel: detailKey };
  }
  if (segment === 'politics') {
    const parts = route.split('/').filter(Boolean).slice(1);
    const detailKey = parts.length ? parts.join('/') : 'overview';
    return { subject: 'politics', route, detailKey, detailLabel: detailKey };
  }
  if (isEnglishFamily(route) || ['lexical', 'external-reading', 'external'].includes(segment)) {
    const detailKey = isEnglishFamily(route) ? resolveEnglishActive(route) : segment;
    return { subject: 'english', route, detailKey, detailLabel: detailKey };
  }
  return null;
}

export function setStudyTimerContext(storage, context, now = Date.now(), { source = 'route' } = {}) {
  const nextContext = normalizeContext(context);
  if (!nextContext) return readStudyTimerState(storage);
  const state = readStudyTimerState(storage);
  const timestamp = finiteMs(now) ?? Date.now();

  if (state.running) {
    if (!sameContext(state.context, nextContext)) closeRunningSegment(storage, state, timestamp, source);
    const next = {
      ...state,
      subject: nextContext.subject,
      context: nextContext,
      segmentStartedAt: sameContext(state.context, nextContext) ? state.segmentStartedAt : timestamp,
      lastSeenAt: timestamp,
      updatedAt: timestamp,
      revision: state.revision + 1
    };
    return writeState(storage, next);
  }

  const shouldAutoStart = !state.manualPaused && !state.subject;
  const next = {
    ...state,
    running: shouldAutoStart,
    subject: nextContext.subject,
    context: nextContext,
    segmentStartedAt: shouldAutoStart ? timestamp : null,
    lastSeenAt: timestamp,
    updatedAt: timestamp,
    revision: state.revision + 1
  };
  return writeState(storage, next);
}

export function resumeStudyTimer(storage, context = null, now = Date.now()) {
  const timestamp = finiteMs(now) ?? Date.now();
  const state = readStudyTimerState(storage);
  const nextContext = normalizeContext(context) || state.context;
  if (!nextContext) return state;
  if (state.running) return setStudyTimerContext(storage, nextContext, timestamp, { source: 'resume-context' });
  return writeState(storage, {
    ...state,
    running: true,
    manualPaused: false,
    subject: nextContext.subject,
    context: nextContext,
    segmentStartedAt: timestamp,
    lastSeenAt: timestamp,
    updatedAt: timestamp,
    revision: state.revision + 1
  });
}

export function pauseStudyTimer(storage, now = Date.now()) {
  const timestamp = finiteMs(now) ?? Date.now();
  const state = readStudyTimerState(storage);
  if (state.running) closeRunningSegment(storage, state, timestamp, 'manual-pause');
  return writeState(storage, {
    ...state,
    running: false,
    manualPaused: true,
    segmentStartedAt: null,
    lastSeenAt: timestamp,
    updatedAt: timestamp,
    revision: state.revision + 1
  });
}

export function touchStudyTimer(storage, now = Date.now()) {
  const timestamp = finiteMs(now) ?? Date.now();
  const state = readStudyTimerState(storage);
  if (!state.subject) return state;
  return writeState(storage, {
    ...state,
    lastSeenAt: timestamp,
    updatedAt: timestamp,
    revision: state.revision + 1
  });
}

export function editStudySession(storage, sessionId, patch = {}) {
  const ledger = readStudyTimerLedger(storage);
  const index = ledger.sessions.findIndex((session) => session.id === sessionId);
  if (index < 0) return null;
  const current = ledger.sessions[index];
  const candidate = normalizeSession({
    ...current,
    ...patch,
    context: patch.context ? normalizeContext(patch.context) : current.context,
    edited: true
  });
  if (!candidate) throw new Error('Invalid study timer session edit.');
  ledger.sessions[index] = candidate;
  writeLedger(storage, ledger);
  return candidate;
}

export function adjustActiveStudyTimer(storage, patch = {}, now = Date.now()) {
  const state = readStudyTimerState(storage);
  if (!state.running) return state;
  const timestamp = finiteMs(now) ?? Date.now();
  const startedAt = patch.segmentStartedAt == null ? state.segmentStartedAt : finiteMs(patch.segmentStartedAt);
  if (startedAt == null || startedAt > timestamp) throw new Error('Invalid active timer start.');
  const context = patch.context ? normalizeContext(patch.context) : state.context;
  const subject = patch.subject && STUDY_SUBJECTS.includes(patch.subject) ? patch.subject : context?.subject || state.subject;
  return writeState(storage, {
    ...state,
    subject,
    context: context ? { ...context, subject } : state.context,
    segmentStartedAt: startedAt,
    updatedAt: timestamp,
    revision: state.revision + 1
  });
}

export function studyDayAt(timestamp, timeZone = STUDY_TIMER_TIMEZONE) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date(timestamp));
}

function dayBoundary(start, end, timeZone) {
  const startDay = studyDayAt(start, timeZone);
  if (studyDayAt(end - 1, timeZone) === startDay) return end;
  let low = start + 1;
  let high = end;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (studyDayAt(mid, timeZone) === startDay) low = mid + 1;
    else high = mid;
  }
  return low;
}

function allSessions(storage, now) {
  const sessions = [...readStudyTimerLedger(storage).sessions];
  const state = readStudyTimerState(storage);
  if (state.running && state.subject && state.segmentStartedAt != null && now > state.segmentStartedAt) {
    sessions.push({
      id: 'active', subject: state.subject, context: state.context,
      startedAt: state.segmentStartedAt, endedAt: now, source: 'active', excluded: false, edited: false
    });
  }
  return sessions.filter((session) => !session.excluded && session.startedAt < now)
    .map((session) => ({ ...session, endedAt: Math.min(session.endedAt, now) }))
    .filter((session) => session.endedAt > session.startedAt);
}

export function aggregateStudyTime(storage, { day = studyDayAt(Date.now()), now = Date.now(), timeZone = STUDY_TIMER_TIMEZONE } = {}) {
  const bySubject = Object.fromEntries(STUDY_SUBJECTS.map((subject) => [subject, { ms: 0, details: {} }]));
  for (const session of allSessions(storage, now)) {
    let cursor = session.startedAt;
    while (cursor < session.endedAt) {
      const boundary = dayBoundary(cursor, session.endedAt, timeZone);
      const sessionDay = studyDayAt(cursor, timeZone);
      if (sessionDay === day) {
        const ms = boundary - cursor;
        const row = bySubject[session.subject];
        row.ms += ms;
        const detailKey = session.context?.detailKey || 'other';
        row.details[detailKey] = (row.details[detailKey] || 0) + ms;
      }
      cursor = boundary;
    }
  }
  return {
    day,
    timeZone,
    totalMs: STUDY_SUBJECTS.reduce((sum, subject) => sum + bySubject[subject].ms, 0),
    bySubject
  };
}

export function buildStudyTimerReviewCandidates(storage, now = Date.now(), {
  heartbeatGapMs = 30 * 60 * 1000,
  longSessionMs = 6 * 60 * 60 * 1000
} = {}) {
  const state = readStudyTimerState(storage);
  const ledger = readStudyTimerLedger(storage);
  const candidates = [];
  if (state.running && state.segmentStartedAt != null && now - state.segmentStartedAt >= longSessionMs) {
    candidates.push({ kind: 'long_active', subject: state.subject, from: state.segmentStartedAt, to: now });
  }
  if (state.running && state.lastSeenAt != null && now - state.lastSeenAt >= heartbeatGapMs) {
    candidates.push({ kind: 'heartbeat_gap', subject: state.subject, from: state.lastSeenAt, to: now });
  }
  for (const session of ledger.sessions.slice(-50)) {
    if (!session.excluded && session.endedAt - session.startedAt >= longSessionMs) {
      candidates.push({ kind: 'long_session', subject: session.subject, sessionId: session.id, from: session.startedAt, to: session.endedAt });
    }
  }
  return candidates;
}

export function buildStudyTimerReadModel(storage, now = Date.now(), timeZone = STUDY_TIMER_TIMEZONE) {
  const state = readStudyTimerState(storage);
  const today = aggregateStudyTime(storage, { day: studyDayAt(now, timeZone), now, timeZone });
  return {
    schema: 'kianos.study-timer.read-model.v1',
    active: {
      running: state.running,
      subject: state.subject,
      context: state.context,
      elapsedMs: state.running && state.segmentStartedAt != null ? Math.max(0, now - state.segmentStartedAt) : 0,
      segmentStartedAt: state.segmentStartedAt
    },
    today,
    reviewCandidates: buildStudyTimerReviewCandidates(storage, now)
  };
}

export function buildDailyStudyTimePacket(storage, { day = studyDayAt(Date.now()), now = Date.now(), timeZone = STUDY_TIMER_TIMEZONE } = {}) {
  const aggregate = aggregateStudyTime(storage, { day, now, timeZone });
  const subjects = {};
  for (const subject of STUDY_SUBJECTS) {
    const row = aggregate.bySubject[subject];
    subjects[subject] = {
      minutes: Math.round(row.ms / 60000),
      details: Object.entries(row.details)
        .map(([detail, ms]) => ({ detail, minutes: Math.round(ms / 60000) }))
        .filter((item) => item.minutes > 0)
        .sort((a, b) => b.minutes - a.minutes)
    };
  }
  const state = readStudyTimerState(storage);
  return {
    schema: 'kianos.study-time-packet.v1',
    study_day: day,
    timezone: timeZone,
    generated_at: new Date(now).toISOString(),
    total_minutes: Math.round(aggregate.totalMs / 60000),
    subjects,
    timer: {
      running: state.running,
      active_subject: state.subject,
      review_candidates: buildStudyTimerReviewCandidates(storage, now)
    }
  };
}
