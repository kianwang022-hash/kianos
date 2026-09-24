import { STUDY_TIMER_TIMEZONE, studyDayAt } from './studyTimer.mjs';

export const STEWARD_REALITY_SCHEMA = 'kianos.steward-reality.v1';
export const STEWARD_REALITY_KEY = 'kianos-steward-reality-v1';
export const STEWARD_BREAK_DURATIONS = Object.freeze([5, 10, 15]);
export const STEWARD_REENTRY_STATES = Object.freeze(['RESTORED', 'PARTIAL', 'NOT_RESTORED']);
export const STEWARD_BREAK_METHODS = Object.freeze(['walk', 'eyes_closed', 'phone', 'food', 'water']);

const clean = (value, max = 320) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const finiteTime = value => Number.isFinite(Number(value)) ? Math.max(0, Math.round(Number(value))) : null;
const unique = values => [...new Set((Array.isArray(values) ? values : []).map(value => clean(value, 40)).filter(Boolean))];

function cleanContext(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const subject = clean(value.subject, 40);
  const route = clean(value.route, 240);
  const detailKey = clean(value.detailKey, 160);
  const detailLabel = clean(value.detailLabel, 160);
  if (!subject && !route && !detailKey && !detailLabel) return null;
  return { subject, route, detailKey, detailLabel };
}

function cleanReentry(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const status = clean(value.status, 40);
  if (!STEWARD_REENTRY_STATES.includes(status)) return null;
  const at = finiteTime(value.at);
  return {
    status,
    note: clean(value.note, 500),
    at
  };
}

function cleanBreak(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const startedAt = finiteTime(value.startedAt);
  if (startedAt == null) return null;
  const endedAt = finiteTime(value.endedAt);
  const plannedRestMinutes = value.plannedRestMinutes == null ? null : Number(value.plannedRestMinutes);
  return {
    id: clean(value.id, 160) || `break-${startedAt}`,
    kind: 'BREAK',
    startedAt,
    endedAt: endedAt != null && endedAt >= startedAt ? endedAt : null,
    plannedRestMinutes: STEWARD_BREAK_DURATIONS.includes(plannedRestMinutes) ? plannedRestMinutes : null,
    methods: unique(value.methods).filter(method => STEWARD_BREAK_METHODS.includes(method)),
    customMethod: clean(value.customMethod, 120),
    note: clean(value.note, 500),
    preBreakContext: cleanContext(value.preBreakContext),
    reentry: cleanReentry(value.reentry)
  };
}

const emptyReality = () => ({ schema: STEWARD_REALITY_SCHEMA, revision: 1, events: [] });

export function validateStewardReality(value) {
  if (!value || value.schema !== STEWARD_REALITY_SCHEMA || !Array.isArray(value.events)) {
    throw new Error('STEWARD_REALITY_SCHEMA_INVALID');
  }
  return {
    schema: STEWARD_REALITY_SCHEMA,
    revision: 1,
    events: value.events.map(cleanBreak).filter(Boolean)
  };
}

export function normalizeStewardReality(value) {
  if (value == null) return emptyReality();
  return validateStewardReality(value);
}

export function readStewardReality(storage) {
  const raw = storage?.getItem?.(STEWARD_REALITY_KEY);
  if (raw == null) return emptyReality();
  try {
    return validateStewardReality(JSON.parse(raw));
  } catch {
    return { ...emptyReality(), unavailable: 'STEWARD_REALITY_INVALID' };
  }
}

function writableReality(storage) {
  const state = readStewardReality(storage);
  if (state.unavailable) throw new Error(state.unavailable);
  return state;
}

function writeStewardReality(storage, value) {
  const normalized = validateStewardReality(value);
  storage?.setItem?.(STEWARD_REALITY_KEY, JSON.stringify(normalized));
  return normalized;
}

export function latestOpenStewardBreak(storage) {
  const state = readStewardReality(storage);
  return [...state.events].reverse().find(event => event.endedAt == null) || null;
}

export function beginStewardBreak(storage, {
  startedAt = Date.now(),
  preBreakContext = null
} = {}) {
  const state = writableReality(storage);
  const existing = [...state.events].reverse().find(event => event.endedAt == null);
  if (existing) return existing;
  const stamp = finiteTime(startedAt) ?? Date.now();
  const event = cleanBreak({
    id: `break-${stamp}-${state.events.length + 1}`,
    startedAt: stamp,
    preBreakContext
  });
  writeStewardReality(storage, { ...state, events: [...state.events, event] });
  return event;
}

export function updateStewardBreak(storage, breakId, patch = {}) {
  const state = writableReality(storage);
  let updated = null;
  const events = state.events.map(event => {
    if (event.id !== breakId) return event;
    updated = cleanBreak({
      ...event,
      plannedRestMinutes: patch.plannedRestMinutes === undefined ? event.plannedRestMinutes : patch.plannedRestMinutes,
      methods: patch.methods === undefined ? event.methods : patch.methods,
      customMethod: patch.customMethod === undefined ? event.customMethod : patch.customMethod,
      note: patch.note === undefined ? event.note : patch.note
    });
    return updated;
  });
  if (!updated) return null;
  writeStewardReality(storage, { ...state, events });
  return updated;
}

export function endLatestStewardBreak(storage, endedAt = Date.now()) {
  const state = writableReality(storage);
  const index = state.events.findLastIndex(event => event.endedAt == null);
  if (index < 0) return null;
  const stamp = finiteTime(endedAt) ?? Date.now();
  const events = [...state.events];
  events[index] = cleanBreak({ ...events[index], endedAt: Math.max(stamp, events[index].startedAt) });
  writeStewardReality(storage, { ...state, events });
  return events[index];
}

export function recordStewardBreakReentry(storage, breakId, {
  status,
  note = '',
  at = Date.now()
} = {}) {
  if (!STEWARD_REENTRY_STATES.includes(status)) throw new Error('STEWARD_REENTRY_STATUS_INVALID');
  const state = writableReality(storage);
  let updated = null;
  const events = state.events.map(event => {
    if (event.id !== breakId || event.endedAt == null) return event;
    updated = cleanBreak({
      ...event,
      reentry: { status, note, at: finiteTime(at) ?? Date.now() }
    });
    return updated;
  });
  if (!updated) return null;
  writeStewardReality(storage, { ...state, events });
  return updated;
}

export function stewardRealityEventsForDay(storage, day, timeZone = STUDY_TIMER_TIMEZONE) {
  const state = readStewardReality(storage);
  if (state.unavailable) return null;
  return state.events
    .filter(event => studyDayAt(event.startedAt, timeZone) === day)
    .sort((a, b) => a.startedAt - b.startedAt);
}

export function buildStewardRealityDailySummary(storage, {
  day,
  timeZone = STUDY_TIMER_TIMEZONE
} = {}) {
  const events = stewardRealityEventsForDay(storage, day, timeZone);
  if (events == null) {
    return {
      schema: 'kianos.steward-reality-summary.v1',
      study_day: day,
      breaks: null,
      error: 'STEWARD_REALITY_UNAVAILABLE'
    };
  }
  return {
    schema: 'kianos.steward-reality-summary.v1',
    study_day: day,
    breaks: events.map(event => ({
      id: event.id,
      started_at: new Date(event.startedAt).toISOString(),
      ended_at: event.endedAt == null ? null : new Date(event.endedAt).toISOString(),
      observed_minutes: event.endedAt == null ? null : Number(((event.endedAt - event.startedAt) / 60000).toFixed(1)),
      planned_rest_minutes: event.plannedRestMinutes,
      methods: [...event.methods],
      custom_method: event.customMethod || null,
      note: event.note || null,
      pre_break_context: event.preBreakContext,
      reentry: event.reentry ? {
        status: event.reentry.status,
        note: event.reentry.note || null,
        observed_at: event.reentry.at == null ? null : new Date(event.reentry.at).toISOString()
      } : null
    }))
  };
}
