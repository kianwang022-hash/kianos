import { STUDY_TIMER_TIMEZONE, studyDayAt } from './studyTimer.mjs';

export const STEWARD_REALITY_SCHEMA = 'kianos.steward-reality.v2';
export const STEWARD_REALITY_LEGACY_SCHEMA = 'kianos.steward-reality.v1';
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


const cleanAmount = (value, max = 100000) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > max) return null;
  return number;
};

function cleanMeal(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const observedAt = finiteTime(value.observedAt);
  const mealId = clean(value.mealId, 120);
  const label = clean(value.label, 160);
  if (observedAt == null || !mealId || !label || !Array.isArray(value.items)) return null;
  const items = value.items.slice(0, 24).map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const foodId = clean(item.foodId, 120);
    const foodLabel = clean(item.label, 160);
    const amount = cleanAmount(item.amount, 10000);
    const unit = clean(item.unit, 24);
    if (!foodId || !foodLabel || amount == null || !unit) return null;
    return { foodId, label: foodLabel, amount, unit };
  }).filter(Boolean);
  return {
    id: clean(value.id, 180) || `meal-${studyDayAt(observedAt, STUDY_TIMER_TIMEZONE)}-${mealId}`,
    kind: 'MEAL',
    observedAt,
    mealId,
    label,
    ownerRef: clean(value.ownerRef, 260),
    planGeneratedAt: clean(value.planGeneratedAt, 80),
    status: 'SELECTED',
    uncertain: Boolean(value.uncertain),
    items,
    note: clean(value.note, 500)
  };
}

const TRAINING_EFFECTS = new Set(['BETTER', 'SAME', 'TIRED']);
const TRAINING_EXERCISE_STATES = new Set(['RECORDED', 'MODIFIED', 'SKIPPED']);

function cleanTraining(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const observedAt = finiteTime(value.observedAt);
  const sessionId = clean(value.sessionId, 120);
  const label = clean(value.label, 160);
  if (observedAt == null || !sessionId || !label || !Array.isArray(value.exercises)) return null;
  const exercises = value.exercises.slice(0, 12).map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const exerciseId = clean(item.exerciseId, 120);
    const exerciseLabel = clean(item.label, 160);
    const status = clean(item.status, 40).toUpperCase();
    if (!exerciseId || !exerciseLabel || !TRAINING_EXERCISE_STATES.has(status)) return null;
    return {
      exerciseId,
      variantId: clean(item.variantId, 120),
      label: exerciseLabel,
      status,
      loadValue: item.loadValue == null ? null : cleanAmount(item.loadValue),
      loadUnit: clean(item.loadUnit, 24),
      repsValue: item.repsValue == null ? null : cleanAmount(item.repsValue, 10000),
      repsUnit: clean(item.repsUnit, 24),
      rpe: item.rpe == null ? null : cleanAmount(item.rpe, 10)
    };
  }).filter(Boolean);
  const effect = clean(value.effect, 40).toUpperCase();
  return {
    id: clean(value.id, 180) || `training-${studyDayAt(observedAt, STUDY_TIMER_TIMEZONE)}-${sessionId}`,
    kind: 'TRAINING',
    observedAt,
    sessionId,
    label,
    ownerRef: clean(value.ownerRef, 260),
    planGeneratedAt: clean(value.planGeneratedAt, 80),
    effect: TRAINING_EFFECTS.has(effect) ? effect : null,
    note: clean(value.note, 500),
    exercises
  };
}

function cleanEvent(value) {
  const kind = clean(value?.kind, 40).toUpperCase();
  if (!kind || kind === 'BREAK') return cleanBreak(value);
  if (kind === 'MEAL') return cleanMeal(value);
  if (kind === 'TRAINING') return cleanTraining(value);
  return null;
}

const emptyReality = () => ({ schema: STEWARD_REALITY_SCHEMA, revision: 2, events: [] });

export function validateStewardReality(value) {
  if (!value || ![STEWARD_REALITY_SCHEMA, STEWARD_REALITY_LEGACY_SCHEMA].includes(value.schema) || !Array.isArray(value.events)) {
    throw new Error('STEWARD_REALITY_SCHEMA_INVALID');
  }
  return {
    schema: STEWARD_REALITY_SCHEMA,
    revision: 2,
    events: value.events.map(cleanEvent).filter(Boolean)
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
  return [...state.events].reverse().find(event => event.kind === 'BREAK' && event.endedAt == null) || null;
}

export function beginStewardBreak(storage, {
  startedAt = Date.now(),
  preBreakContext = null
} = {}) {
  const state = writableReality(storage);
  const existing = [...state.events].reverse().find(event => event.kind === 'BREAK' && event.endedAt == null);
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
    if (event.kind !== 'BREAK' || event.id !== breakId) return event;
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
  const index = state.events.findLastIndex(event => event.kind === 'BREAK' && event.endedAt == null);
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

function realityEventsForDay(storage, day, kind, timeZone = STUDY_TIMER_TIMEZONE) {
  const state = readStewardReality(storage);
  if (state.unavailable) return null;
  const timestamp = (event) => event.kind === 'BREAK' ? event.startedAt : event.observedAt;
  return state.events
    .filter(event => event.kind === kind && studyDayAt(timestamp(event), timeZone) === day)
    .sort((a, b) => timestamp(a) - timestamp(b));
}

export function stewardRealityEventsForDay(storage, day, timeZone = STUDY_TIMER_TIMEZONE) {
  return realityEventsForDay(storage, day, 'BREAK', timeZone);
}

export function stewardMealSelectionsForDay(storage, day, timeZone = STUDY_TIMER_TIMEZONE) {
  return realityEventsForDay(storage, day, 'MEAL', timeZone);
}

export function stewardTrainingActualsForDay(storage, day, timeZone = STUDY_TIMER_TIMEZONE) {
  return realityEventsForDay(storage, day, 'TRAINING', timeZone);
}

function upsertRealityEvent(storage, nextEvent) {
  const state = writableReality(storage);
  const events = state.events.filter((event) => event.id !== nextEvent.id);
  writeStewardReality(storage, { ...state, events: [...events, nextEvent] });
  return nextEvent;
}

export function upsertStewardMealSelection(storage, value = {}) {
  const event = cleanMeal(value);
  if (!event) throw new Error('STEWARD_MEAL_ACTUAL_INVALID');
  return upsertRealityEvent(storage, event);
}

export function upsertStewardTrainingActual(storage, value = {}) {
  const event = cleanTraining(value);
  if (!event) throw new Error('STEWARD_TRAINING_ACTUAL_INVALID');
  return upsertRealityEvent(storage, event);
}

export function buildStewardRealityDailySummary(storage, {
  day,
  timeZone = STUDY_TIMER_TIMEZONE
} = {}) {
  const events = stewardRealityEventsForDay(storage, day, timeZone);
  const meals = stewardMealSelectionsForDay(storage, day, timeZone);
  const training = stewardTrainingActualsForDay(storage, day, timeZone);
  if (events == null || meals == null || training == null) {
    return {
      schema: 'kianos.steward-reality-summary.v1',
      study_day: day,
      breaks: null,
      meals: null,
      training: null,
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
    })),
    meals: meals.map(event => ({
      id: event.id,
      observed_at: new Date(event.observedAt).toISOString(),
      meal_id: event.mealId,
      label: event.label,
      owner_ref: event.ownerRef || null,
      plan_generated_at: event.planGeneratedAt || null,
      status: event.status,
      uncertain: event.uncertain,
      items: event.items.map(item => ({
        food_id: item.foodId,
        label: item.label,
        amount: item.amount,
        unit: item.unit
      })),
      note: event.note || null
    })),
    training: training.map(event => ({
      id: event.id,
      observed_at: new Date(event.observedAt).toISOString(),
      session_id: event.sessionId,
      label: event.label,
      owner_ref: event.ownerRef || null,
      plan_generated_at: event.planGeneratedAt || null,
      effect: event.effect,
      note: event.note || null,
      exercises: event.exercises.map(item => ({
        exercise_id: item.exerciseId,
        variant_id: item.variantId || null,
        label: item.label,
        status: item.status,
        load_value: item.loadValue,
        load_unit: item.loadUnit || null,
        reps_value: item.repsValue,
        reps_unit: item.repsUnit || null,
        rpe: item.rpe
      }))
    }))
  };
}
