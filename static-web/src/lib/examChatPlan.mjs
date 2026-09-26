import { EXAM_PROFILE_KEY, validateExamProfile } from './examOrchestrator.mjs';
import {
  readStudyTimerLedger, STUDY_TIMER_LEDGER_KEY, STUDY_TIMER_STATE_KEY, STUDY_TIMER_SCHEMA
} from './studyTimer.mjs';
import { LEXICAL_LEDGER_STORAGE_KEY, assertLexicalLedgerReadable } from './lexicalEvidence.mjs';
import { LEXICAL_INTAKE_STORAGE_KEY, LEXICAL_ROUTING_STORAGE_KEY } from './lexicalSettings.mjs';
import { englishCheckpointKeyAllowed } from './englishLearnerEvidence.mjs';
import { politicsCheckpointKeyAllowed } from './politicsChatReturn.mjs';
import { isXizongDurableStorageKey } from './xizongPrivateCheckpoint.mjs';

export const EXAM_CHAT_PLAN_SCHEMA = 'kianos.exam.chat-plan.v1';
export const EXAM_CHAT_PLAN_BASIS_SCHEMA = 'kianos.exam.chat-plan-basis.v1';
export const EXAM_CHAT_PLAN_KEY = 'kianos-exam-chat-plan-v1';
export const EXAM_CHAT_PLAN_SUBJECTS = Object.freeze(['xizong', 'english', 'politics']);

const text = (value, max = 500) => String(value || '').trim().slice(0, max);
const validDay = (day) => typeof day === 'string'
  && /^\d{4}-\d{2}-\d{2}$/.test(day)
  && !Number.isNaN(Date.parse(`${day}T00:00:00Z`))
  && new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day;
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const FINGERPRINT_PATTERN = /^fnv1a64:[0-9a-f]{16}:\d+$/;

const XIZONG_CONTROL_PATTERNS = Object.freeze([
  /^kianos-xizong-last-location-v1$/,
  /^kianos-xizong-repair-inbox-v1:/,
  /^kianos-xizong-chat-handoff-v1:/,
  /^kianos-xizong-chat-return-v1:/,
  /^kianos:xizong:pending-(?:chat-return|system-wu-return):v1$/,
  /^kianos:xizong:system-repair-return:/,
  /^kianos:xizong:session-(?:instruction|runtime):v1$/,
  /^kianos:xizong:(?:chat-set|retained-set):v1$/,
  /^kianos:xizong:question-preferences:v1$/,
  /^kianos:xizong:full-paper-holdout-years:v1$/
]);
const ENGLISH_CONTROL_PATTERNS = Object.freeze([
  /last-location/,
  /^kianos-english-session-(?:instruction|runtime)-v1$/
]);
const POLITICS_EVIDENCE_KEYS = new Set([
  'kianos-politics-attempts-v1',
  'kianos-politics-practice-meta-v1',
  'kianos-politics-evidence-v1',
  'kianos-politics-memory-evidence-v1'
]);

const finiteMinutes = (value, field) => {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1440) {
    throw new Error(`Invalid ${field}; expected 0–1440 minutes or null.`);
  }
  return Math.round(number);
};

const presentationId = (value, field) => {
  const id = text(value, 96);
  if (!id || !/^[A-Za-z0-9._:-]+$/.test(id)) {
    throw new Error(`Invalid ${field}; expected a stable presentation id.`);
  }
  return id;
};

const presentationSubject = (value, field) => {
  if (value === null || value === undefined || value === '') return null;
  const subject = String(value);
  if (!EXAM_CHAT_PLAN_SUBJECTS.includes(subject)) {
    throw new Error(`Invalid ${field}; unsupported subject.`);
  }
  return subject;
};

const presentationClock = (value, field, optional = false) => {
  if ((value === null || value === undefined || value === '') && optional) return null;
  const clock = String(value || '');
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(clock)) {
    throw new Error(`Invalid ${field}; expected HH:MM.`);
  }
  return clock;
};

const CAPACITY_STATES = Object.freeze(['ORDINARY', 'REDUCED', 'UNCERTAIN', 'RECOVER_FIRST']);

function normalizeExamChatPlanCapacity(value) {
  if (value == null) return null;
  if (!record(value)) throw new Error('Chat Plan capacity must be an object.');
  for (const forbidden of ['score', 'readiness_score', 'recovery_score', 'debt_score']) {
    if (Object.prototype.hasOwnProperty.call(value, forbidden)) {
      throw new Error('Chat Plan capacity must not contain a readiness/recovery score.');
    }
  }
  const state = String(value.state || '').trim().toUpperCase();
  if (!CAPACITY_STATES.includes(state)) {
    throw new Error('Chat Plan capacity.state is invalid.');
  }
  const summary = text(value.summary, 220);
  if (!summary) throw new Error('Chat Plan capacity.summary is required.');
  return {
    state,
    summary,
    basis: text(value.basis, 300),
    load: text(value.load, 220),
    action: text(value.action, 220),
    recheck: text(value.recheck, 220)
  };
}

const presentationRows = (value, field, max) => {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value) || value.length > max) {
    throw new Error(`Invalid ${field}; expected at most ${max} rows.`);
  }
  return value;
};

const assertUniquePresentationIds = (rows, field) => {
  const seen = new Set();
  for (const row of rows) {
    if (seen.has(row.id)) throw new Error(`Invalid ${field}; duplicate id ${row.id}.`);
    seen.add(row.id);
  }
  return rows;
};


const boundedNumber = (value, field, { min = 0, max = 100000, optional = false } = {}) => {
  if ((value === null || value === undefined || value === '') && optional) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`Invalid ${field}.`);
  }
  return number;
};

function normalizeNutritionProjection(value) {
  if (value == null) return null;
  if (!record(value)) throw new Error('Chat Plan presentation.nutrition must be an object.');
  const ownerRef = text(value.owner_ref, 240);
  if (!ownerRef) throw new Error('presentation.nutrition.owner_ref is required.');

  const foods = presentationRows(value.foods, 'presentation.nutrition.foods', 24).map((raw, index) => {
    if (!record(raw)) throw new Error(`Invalid presentation.nutrition.foods[${index}].`);
    const id = presentationId(raw.id, `presentation.nutrition.foods[${index}].id`);
    const label = text(raw.label, 100);
    if (!label) throw new Error(`presentation.nutrition.foods[${index}].label is required.`);
    const unit = text(raw.unit || 'g', 20);
    if (!unit) throw new Error(`presentation.nutrition.foods[${index}].unit is required.`);
    const nutrition = raw.nutrition == null ? null : raw.nutrition;
    let normalizedNutrition = null;
    if (nutrition != null) {
      if (!record(nutrition)) throw new Error(`Invalid presentation.nutrition.foods[${index}].nutrition.`);
      const basis = String(nutrition.basis || '').trim().toUpperCase();
      if (!['PER_100G', 'PER_UNIT'].includes(basis)) {
        throw new Error(`Invalid presentation.nutrition.foods[${index}].nutrition.basis.`);
      }
      normalizedNutrition = {
        basis,
        kcal: boundedNumber(nutrition.kcal, `presentation.nutrition.foods[${index}].nutrition.kcal`),
        protein_g: boundedNumber(nutrition.protein_g, `presentation.nutrition.foods[${index}].nutrition.protein_g`),
        carb_g: boundedNumber(nutrition.carb_g, `presentation.nutrition.foods[${index}].nutrition.carb_g`),
        fat_g: boundedNumber(nutrition.fat_g, `presentation.nutrition.foods[${index}].nutrition.fat_g`)
      };
    }
    return {
      id,
      label,
      unit,
      grams_per_unit: (() => {
        const grams = raw.grams_per_unit == null
          ? (unit === 'g' ? 1 : null)
          : boundedNumber(raw.grams_per_unit, `presentation.nutrition.foods[${index}].grams_per_unit`, { min: .01, max: 10000 });
        if (normalizedNutrition?.basis === 'PER_100G' && grams == null) {
          throw new Error(`Invalid presentation.nutrition.foods[${index}].grams_per_unit; required for PER_100G.`);
        }
        return grams;
      })(),
      recommended_amount: boundedNumber(raw.recommended_amount, `presentation.nutrition.foods[${index}].recommended_amount`, { min: 0, max: 10000 }),
      note: text(raw.note, 180),
      nutrition: normalizedNutrition
    };
  });
  const foodIds = new Set(foods.map((food) => food.id));
  if (foodIds.size !== foods.length) throw new Error('Invalid presentation.nutrition.foods; duplicate id.');

  const normalizeEntries = (rows, field, max) => presentationRows(rows, field, max).map((raw, index) => {
    if (!record(raw)) throw new Error(`Invalid ${field}[${index}].`);
    const foodId = presentationId(raw.food_id, `${field}[${index}].food_id`);
    if (!foodIds.has(foodId)) throw new Error(`Invalid ${field}[${index}].food_id; unknown food.`);
    return {
      food_id: foodId,
      amount: boundedNumber(raw.amount, `${field}[${index}].amount`, { min: 0, max: 10000 }),
      role: text(raw.role, 40)
    };
  });

  const meals = presentationRows(value.meals, 'presentation.nutrition.meals', 8).map((raw, index) => {
    if (!record(raw)) throw new Error(`Invalid presentation.nutrition.meals[${index}].`);
    const id = presentationId(raw.id, `presentation.nutrition.meals[${index}].id`);
    const label = text(raw.label, 120);
    if (!label) throw new Error(`presentation.nutrition.meals[${index}].label is required.`);
    return {
      id,
      label,
      note: text(raw.note, 180),
      items: normalizeEntries(raw.items, `presentation.nutrition.meals[${index}].items`, 16)
    };
  });
  const mealIds = new Set(meals.map((meal) => meal.id));
  if (mealIds.size !== meals.length) throw new Error('Invalid presentation.nutrition.meals; duplicate id.');
  const activeMealId = value.active_meal_id == null || value.active_meal_id === ''
    ? (meals[0]?.id || null)
    : presentationId(value.active_meal_id, 'presentation.nutrition.active_meal_id');
  if (activeMealId && !mealIds.has(activeMealId)) {
    throw new Error('Invalid presentation.nutrition.active_meal_id; unknown meal.');
  }

  return {
    owner_ref: ownerRef,
    target_label: text(value.target_label, 120),
    foods,
    meals,
    active_meal_id: activeMealId,
    topup_pool: normalizeEntries(value.topup_pool, 'presentation.nutrition.topup_pool', 8),
    quick_add: normalizeEntries(value.quick_add, 'presentation.nutrition.quick_add', 12)
  };
}

function normalizeTrainingExercise(raw, field, allowAlternatives = true) {
  if (!record(raw)) throw new Error(`Invalid ${field}.`);
  const id = presentationId(raw.id, `${field}.id`);
  const label = text(raw.label, 120);
  if (!label) throw new Error(`${field}.label is required.`);
  const normalized = {
    id,
    label,
    note: text(raw.note, 180),
    prescription: text(raw.prescription, 160),
    sets_value: boundedNumber(raw.sets_value, `${field}.sets_value`, { min: 0, max: 100, optional: true }),
    time_label: text(raw.time_label, 80),
    rest_note: text(raw.rest_note, 220),
    stop_note: text(raw.stop_note, 220),
    load_value: boundedNumber(raw.load_value, `${field}.load_value`, { min: 0, max: 100000, optional: true }),
    load_unit: text(raw.load_unit, 20),
    reps_value: boundedNumber(raw.reps_value, `${field}.reps_value`, { min: 0, max: 10000, optional: true }),
    reps_unit: text(raw.reps_unit || 'reps', 20),
    rpe: boundedNumber(raw.rpe, `${field}.rpe`, { min: 0, max: 10, optional: true })
  };
  if (allowAlternatives) {
    normalized.alternatives = presentationRows(raw.alternatives, `${field}.alternatives`, 6)
      .map((value, index) => normalizeTrainingExercise(value, `${field}.alternatives[${index}]`, false));
  }
  return normalized;
}

function normalizeTrainingProjection(value) {
  if (value == null) return null;
  if (!record(value)) throw new Error('Chat Plan presentation.training must be an object.');
  const ownerRef = text(value.owner_ref, 240);
  if (!ownerRef) throw new Error('presentation.training.owner_ref is required.');
  const exercises = presentationRows(value.exercises, 'presentation.training.exercises', 8)
    .map((raw, index) => normalizeTrainingExercise(raw, `presentation.training.exercises[${index}]`));
  const ids = new Set(exercises.map((exercise) => exercise.id));
  if (ids.size !== exercises.length) throw new Error('Invalid presentation.training.exercises; duplicate id.');
  return {
    owner_ref: ownerRef,
    session_id: presentationId(value.session_id, 'presentation.training.session_id'),
    title: text(value.title, 140) || '今日训练',
    duration_label: text(value.duration_label, 80),
    mode: value.mode == null ? null : (() => { const m=String(value.mode).toUpperCase(); if(!['NORMAL','CONCISE','RECOVERY','REST'].includes(m)) throw Error('TRAINING_MODE_INVALID'); return m; })(),
    exercises
  };
}

function normalizeExamChatPlanPresentation(value) {
  if (value == null) return null;
  if (!record(value)) throw new Error('Chat Plan presentation must be an object.');

  const todayTasks = assertUniquePresentationIds(
    presentationRows(value.today_tasks, 'presentation.today_tasks', 12).map((raw, index) => {
    if (!record(raw)) throw new Error(`Invalid presentation.today_tasks[${index}].`);
    const label = text(raw.label, 120);
    if (!label) throw new Error(`presentation.today_tasks[${index}].label is required.`);
    return {
      id: presentationId(raw.id, `presentation.today_tasks[${index}].id`),
      subject: presentationSubject(raw.subject, `presentation.today_tasks[${index}].subject`),
      label,
      note: text(raw.note, 220)
    };
  }),
    'presentation.today_tasks'
  );

  const weekReference = assertUniquePresentationIds(
    presentationRows(value.week_reference, 'presentation.week_reference', 8).map((raw, index) => {
    if (!record(raw)) throw new Error(`Invalid presentation.week_reference[${index}].`);
    const label = text(raw.label, 120);
    if (!label) throw new Error(`presentation.week_reference[${index}].label is required.`);
    let progressRatio = null;
    if (raw.progress_ratio !== null && raw.progress_ratio !== undefined) {
      const number = raw.progress_ratio;
      if (!Number.isFinite(number) || number < 0 || number > 1) {
        throw new Error(`Invalid presentation.week_reference[${index}].progress_ratio.`);
      }
      progressRatio = number;
    }
    return {
      id: presentationId(raw.id, `presentation.week_reference[${index}].id`),
      subject: presentationSubject(raw.subject, `presentation.week_reference[${index}].subject`),
      label,
      detail: text(raw.detail, 220),
      value: text(raw.value, 80),
      progress_ratio: progressRatio
    };
  }),
    'presentation.week_reference'
  );

  const scheduleBlocks = assertUniquePresentationIds(
    presentationRows(value.schedule_blocks, 'presentation.schedule_blocks', 40).map((raw, index) => {
    if (!record(raw)) throw new Error(`Invalid presentation.schedule_blocks[${index}].`);
    const start = presentationClock(raw.start, `presentation.schedule_blocks[${index}].start`);
    const end = presentationClock(raw.end, `presentation.schedule_blocks[${index}].end`, true);
    if (end && end === start) {
      throw new Error(`Invalid presentation.schedule_blocks[${index}]; end must differ from start; an earlier clock means next calendar day.`);
    }
    const label = text(raw.label, 100);
    if (!label) throw new Error(`presentation.schedule_blocks[${index}].label is required.`);
    return {
      id: presentationId(raw.id, `presentation.schedule_blocks[${index}].id`),
      subject: presentationSubject(raw.subject, `presentation.schedule_blocks[${index}].subject`),
      start,
      end,
      label,
      detail: text(raw.detail, 140),
      meal_id: raw.meal_id ? presentationId(raw.meal_id, 'schedule.meal_id') : null,
      training_session_id: raw.training_session_id ? presentationId(raw.training_session_id, 'schedule.training_session_id') : null
    };
  }),
    'presentation.schedule_blocks'
  ).sort((a, b) => a.start.localeCompare(b.start));

  return {
    today_tasks: todayTasks,
    week_reference: weekReference,
    schedule_blocks: scheduleBlocks,
    nutrition: normalizeNutritionProjection(value.nutrition),
    training: normalizeTrainingProjection(value.training)
  };
}

const storageKeys = (storage) => {
  if (!storage?.getItem || typeof storage.key !== 'function'
      || !Number.isInteger(storage.length) || storage.length < 0) {
    throw new Error('CHAT_PLAN_EVIDENCE_STORAGE_UNAVAILABLE');
  }
  const keys = [];
  for (let index = 0; index < Number(storage.length); index += 1) {
    const key = storage.key(index);
    if (typeof key !== 'string') throw new Error('CHAT_PLAN_EVIDENCE_STORAGE_UNREADABLE');
    keys.push(key);
  }
  return [...new Set(keys)].sort();
};

const canonicalJson = (raw) => {
  if (raw == null) return 'null';
  let value;
  try { value = JSON.parse(String(raw)); }
  catch { throw new Error('CHAT_PLAN_EVIDENCE_UNREADABLE'); }
  const normalize = (input) => {
    if (Array.isArray(input)) return input.map(normalize);
    if (!record(input)) return input;
    return Object.fromEntries(Object.keys(input).sort().map((key) => [key, normalize(input[key])]));
  };
  return JSON.stringify(normalize(value));
};

const fingerprint = (value) => {
  const source = String(value ?? '');
  // Same FNV-1a64 over UTF-16 code units, without allocating BigInts per
  // character. Two 32-bit limbs preserve every existing basis fingerprint.
  let high = 0xcbf29ce4;
  let low = 0x84222325;
  for (let index = 0; index < source.length; index += 1) {
    low = (low ^ source.charCodeAt(index)) >>> 0;
    const product = low * 0x1b3; // exact integer: below 2^53
    const carry = (product / 0x100000000) >>> 0;
    high = (high * 0x1b3 + carry + (low << 8)) >>> 0;
    low = product >>> 0;
  }
  return `fnv1a64:${high.toString(16).padStart(8, '0')}${low.toString(16).padStart(8, '0')}:${source.length}`;
};

const fingerprintRows = (rows) => fingerprint(rows
  .map(([key, raw]) => `${key}\u0000${canonicalJson(raw)}`)
  .join('\u0001'));

// Reuse the native evidence keys. Pronunciation, navigation, cursor and other
// control/UI settings are deliberately not evidence or plan dependencies.
const LEXICAL_EVIDENCE_KEYS = new Set([
  LEXICAL_LEDGER_STORAGE_KEY, LEXICAL_INTAKE_STORAGE_KEY, LEXICAL_ROUTING_STORAGE_KEY
]);

const subjectEvidenceKeyAllowed = (subject, key) => {
  if (subject === 'xizong') {
    return isXizongDurableStorageKey(key)
      && !XIZONG_CONTROL_PATTERNS.some((pattern) => pattern.test(key));
  }
  if (subject === 'english') {
    return LEXICAL_EVIDENCE_KEYS.has(key)
      || (englishCheckpointKeyAllowed(key)
        && !ENGLISH_CONTROL_PATTERNS.some((pattern) => pattern.test(key)));
  }
  if (subject === 'politics') {
    return politicsCheckpointKeyAllowed(key) && POLITICS_EVIDENCE_KEYS.has(key);
  }
  return false;
};

const subjectEvidenceFingerprint = (storage, subject, keys) => fingerprintRows(
  keys
    .filter((key) => subjectEvidenceKeyAllowed(subject, key))
    .map((key) => [key, storage.getItem(key)])
);

const planningProfileBasis = (storage, studyDay) => {
  const raw = storage?.getItem?.(EXAM_PROFILE_KEY);
  if (raw == null) return null;
  try {
    const value = validateExamProfile(JSON.parse(raw), studyDay);
    return {
      schema: value.schema || null,
      defaultDailyMinutes: value.defaultDailyMinutes ?? null,
      capacityByDay: value.capacityByDay || {},
      maintenanceByDay: value.maintenanceByDay || {},
      observations: Array.isArray(value.observations) ? value.observations : [],
      reports: Array.isArray(value.reports) ? value.reports : [],
      gateReports: Array.isArray(value.gateReports) ? value.gateReports : []
    };
  } catch {
    throw new Error('CHAT_PLAN_PROFILE_INVALID');
  }
};

// Normalizing a corrupt timer into an empty ledger is not valid planning
// evidence. This is a readability guard, not a second time/learner ledger.
export function assertExamChatPlanTimeReadable(storage) {
  for (const key of [STUDY_TIMER_STATE_KEY, STUDY_TIMER_LEDGER_KEY]) {
    const raw = storage.getItem(key);
    if (raw == null) continue;
    let value;
    try { value = JSON.parse(raw); }
    catch { throw new Error('CHAT_PLAN_TIMER_UNREADABLE'); }
    if (!record(value) || value.schema !== STUDY_TIMER_SCHEMA) {
      throw new Error('CHAT_PLAN_TIMER_SCHEMA_INVALID');
    }
    if (key === STUDY_TIMER_LEDGER_KEY) {
      if (!Array.isArray(value.sessions)
        || readStudyTimerLedger(storage).sessions.length !== value.sessions.length) {
        throw new Error('CHAT_PLAN_TIMER_LEDGER_INVALID');
      }
    } else if (typeof value.running !== 'boolean'
      || (value.running && (!EXAM_CHAT_PLAN_SUBJECTS.includes(value.subject)
        || !Number.isFinite(value.segmentStartedAt)
        || !Number.isFinite(value.lastSeenAt)))) {
      throw new Error('CHAT_PLAN_TIMER_STATE_INVALID');
    }
  }
}

const sharedContextFingerprint = (storage, studyDay) => {
  assertExamChatPlanTimeReadable(storage);
  return fingerprint(JSON.stringify({
    exam_profile: planningProfileBasis(storage, studyDay),
    study_timer_ledger: readStudyTimerLedger(storage)
  }));
};

const basisCore = (studyDay, sharedContext, subjects) => JSON.stringify({
  study_day: studyDay,
  shared_context_fingerprint: sharedContext,
  subjects: Object.fromEntries(EXAM_CHAT_PLAN_SUBJECTS.map((subject) => [subject, subjects[subject]]))
});

export function buildExamChatPlanBasis(storage, studyDay) {
  if (!storage?.getItem) throw new Error('CHAT_PLAN_EVIDENCE_STORAGE_UNAVAILABLE');
  if (!validDay(studyDay)) throw new Error('CHAT_PLAN_EVIDENCE_BASIS_DAY_INVALID');
  const keys = storageKeys(storage);
  const lexicalRaw = storage.getItem(LEXICAL_LEDGER_STORAGE_KEY);
  if (lexicalRaw != null) assertLexicalLedgerReadable(JSON.parse(lexicalRaw));
  const subjects = Object.fromEntries(EXAM_CHAT_PLAN_SUBJECTS.map((subject) => [
    subject,
    subjectEvidenceFingerprint(storage, subject, keys)
  ]));
  const sharedContext = sharedContextFingerprint(storage, studyDay);
  return {
    schema: EXAM_CHAT_PLAN_BASIS_SCHEMA,
    study_day: studyDay,
    shared_context_fingerprint: sharedContext,
    subjects,
    evidence_fingerprint: fingerprint(basisCore(studyDay, sharedContext, subjects))
  };
}

function normalizeExamChatPlanBasis(value, expectedDay = null) {
  if (value == null) return null;
  if (!record(value) || value.schema !== EXAM_CHAT_PLAN_BASIS_SCHEMA || !validDay(value.study_day)) {
    throw new Error('Chat Plan learner_evidence_basis is invalid.');
  }
  if (expectedDay && value.study_day !== expectedDay) {
    throw new Error('CHAT_PLAN_EVIDENCE_BASIS_DAY_MISMATCH');
  }
  if (!record(value.subjects)) throw new Error('Chat Plan learner_evidence_basis subjects are invalid.');
  const subjects = {};
  for (const subject of EXAM_CHAT_PLAN_SUBJECTS) {
    const row = String(value.subjects[subject] || '');
    if (!FINGERPRINT_PATTERN.test(row)) throw new Error(`Chat Plan learner_evidence_basis is missing ${subject} evidence identity.`);
    subjects[subject] = row;
  }
  const sharedContext = String(value.shared_context_fingerprint || '');
  const evidenceFingerprint = String(value.evidence_fingerprint || '');
  if (!FINGERPRINT_PATTERN.test(sharedContext) || !FINGERPRINT_PATTERN.test(evidenceFingerprint)) {
    throw new Error('Chat Plan learner_evidence_basis fingerprint is invalid.');
  }
  const expectedFingerprint = fingerprint(basisCore(value.study_day, sharedContext, subjects));
  if (evidenceFingerprint !== expectedFingerprint) {
    throw new Error('Chat Plan learner_evidence_basis is internally inconsistent.');
  }
  return {
    schema: EXAM_CHAT_PLAN_BASIS_SCHEMA,
    study_day: value.study_day,
    shared_context_fingerprint: sharedContext,
    subjects,
    evidence_fingerprint: evidenceFingerprint
  };
}

export function validateExamChatPlan(value, expectedDay = null) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Chat Plan must be an object.');
  }
  if (value.schema !== EXAM_CHAT_PLAN_SCHEMA) {
    throw new Error('Not a KianOS Chat Plan.');
  }
  if (!validDay(value.study_day)) {
    throw new Error('Chat Plan study_day is invalid.');
  }
  if (expectedDay && value.study_day !== expectedDay) {
    throw new Error(`Chat Plan is for ${value.study_day}, not ${expectedDay}.`);
  }

  const generatedAt = text(value.generated_at, 80);
  if (!generatedAt || Number.isNaN(Date.parse(generatedAt))) {
    throw new Error('Chat Plan generated_at is missing or invalid.');
  }
  if (Date.parse(generatedAt) > Date.now() + 60_000) {
    throw new Error('CHAT_PLAN_FUTURE_GENERATED_AT');
  }
  const learnerEvidenceBasis = normalizeExamChatPlanBasis(value.learner_evidence_basis, value.study_day);
  const capacity = normalizeExamChatPlanCapacity(value.capacity);
  const presentation = normalizeExamChatPlanPresentation(value.presentation);

  const rawSubjects = value.subjects && typeof value.subjects === 'object' && !Array.isArray(value.subjects)
    ? value.subjects
    : {};
  for (const subject of Object.keys(rawSubjects)) {
    if (!EXAM_CHAT_PLAN_SUBJECTS.includes(subject)) {
      throw new Error(`Unsupported Chat Plan subject: ${subject}`);
    }
  }

  const subjects = {};
  for (const subject of EXAM_CHAT_PLAN_SUBJECTS) {
    const raw = rawSubjects[subject];
    if (raw == null) {
      subjects[subject] = null;
      continue;
    }
    if (typeof raw !== 'object' || Array.isArray(raw)) {
      throw new Error(`Invalid Chat Plan subject row: ${subject}`);
    }
    subjects[subject] = {
      target_minutes: finiteMinutes(raw.target_minutes, `${subject}.target_minutes`),
      role: text(raw.role, 80),
      note: text(raw.note, 500),
      session_ref: text(raw.session_ref, 240) || null
    };
  }

  const nextSubject = value.next_subject == null || value.next_subject === ''
    ? null
    : String(value.next_subject);
  if (nextSubject && !EXAM_CHAT_PLAN_SUBJECTS.includes(nextSubject)) {
    throw new Error('Chat Plan next_subject is invalid.');
  }

  let attention = null;
  if (value.attention != null) {
    if (typeof value.attention !== 'object' || Array.isArray(value.attention)) {
      throw new Error('Chat Plan attention must be an object.');
    }
    const attentionText = text(value.attention.text, 300);
    if (attentionText) {
      attention = {
        text: attentionText,
        action: text(value.attention.action, 80)
      };
    }
  }

  return {
    schema: EXAM_CHAT_PLAN_SCHEMA,
    study_day: value.study_day,
    generated_at: new Date(generatedAt).toISOString(),
    learner_evidence_basis: learnerEvidenceBasis,
    capacity,
    subjects,
    next_subject: nextSubject,
    attention,
    presentation
  };
}

export function validateExamChatPlanAgainstStorage(storage, value, expectedDay = null) {
  const plan = validateExamChatPlan(value, expectedDay);
  if (!plan.learner_evidence_basis) throw new Error('CHAT_PLAN_EVIDENCE_BASIS_REQUIRED');
  const current = buildExamChatPlanBasis(storage, plan.study_day);
  if (JSON.stringify(plan.learner_evidence_basis) !== JSON.stringify(current)) {
    throw new Error('CHAT_PLAN_EVIDENCE_BASIS_STALE');
  }
  return plan;
}

export function readExamChatPlan(storage, expectedDay) {
  if (!storage?.getItem) {
    return { status: 'unavailable', plan: null, error: 'Storage is unavailable.' };
  }
  let raw;
  try { raw = storage.getItem(EXAM_CHAT_PLAN_KEY); }
  catch { return { status: 'unavailable', plan: null, error: 'Storage is unreadable.' }; }
  if (raw == null) return { status: 'missing', plan: null, presentation: null, error: null };
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.study_day && expectedDay && parsed.study_day !== expectedDay) {
      return {
        status: 'stale',
        plan: null,
        presentation: null,
        error: `Chat Plan is for ${parsed.study_day}, not ${expectedDay}.`
      };
    }
    try {
      return {
        status: 'ready',
        plan: validateExamChatPlanAgainstStorage(storage, parsed, expectedDay),
        presentation: null,
        error: null
      };
    } catch (error) {
      if (/CHAT_PLAN_EVIDENCE_BASIS_(?:REQUIRED|STALE|DAY_MISMATCH)/.test(String(error?.message || ''))) {
        return {
          status: 'stale',
          plan: null,
          presentation: null,
          error: error instanceof Error ? error.message : String(error)
        };
      }
      throw error;
    }
  } catch (error) {
    return {
      status: 'invalid',
      plan: null,
      presentation: null,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export function examChatPlanEffectMatches(storage, input, expectedDay = null) {
  try {
    const state = readExamChatPlan(storage, expectedDay);
    if (state.status !== 'ready' || !state.plan) return false;
    const expected = validateExamChatPlan(input, expectedDay);
    const withoutBasis = (value) => {
      const { learner_evidence_basis, ...rest } = value || {};
      return rest;
    };
    return JSON.stringify(withoutBasis(state.plan)) === JSON.stringify(withoutBasis(expected));
  } catch {
    return false;
  }
}

export function writeExamChatPlan(storage, value, expectedDay) {
  if (!storage?.setItem || !storage?.getItem) throw new Error('Storage is unavailable.');
  const plan = validateExamChatPlanAgainstStorage(storage, value, expectedDay);

  let currentRaw = null;
  try { currentRaw = storage.getItem(EXAM_CHAT_PLAN_KEY); }
  catch { throw new Error('Storage is unreadable.'); }

  if (currentRaw != null) {
    try {
      const current = validateExamChatPlan(JSON.parse(currentRaw));
      if (current.study_day === plan.study_day) {
        const currentTime = Date.parse(current.generated_at);
        const nextTime = Date.parse(plan.generated_at);
        if (nextTime < currentTime) throw new Error('CHAT_PLAN_OLDER_THAN_CURRENT');
        if (nextTime === currentTime) {
          if (JSON.stringify(current) === JSON.stringify(plan)) return current;
          throw new Error('CHAT_PLAN_GENERATION_CONFLICT');
        }
      }
    } catch (error) {
      if (/^CHAT_PLAN_(?:OLDER_THAN_CURRENT|GENERATION_CONFLICT)$/.test(String(error?.message || ''))) throw error;
      // Invalid prior bytes are not a valid freshness owner; the new validated
      // plan may replace them without guessing their intended ordering.
    }
  }

  storage.setItem(EXAM_CHAT_PLAN_KEY, JSON.stringify(plan));
  return plan;
}


/** Display/capture reference only. Never use to admit or reapply a command.
 * Ordinary execution changes the original evidence basis. That must invalidate
 * new strategy claims, not erase the already adopted schedule/meal prescription.
 */
export function readExamChatPlanForDisplay(storage, expectedDay) {
  const strict = readExamChatPlan(storage, expectedDay);
  if (strict.status !== 'stale' || strict.error !== 'CHAT_PLAN_EVIDENCE_BASIS_STALE') return strict;
  try {
    const stored = validateExamChatPlan(JSON.parse(storage.getItem(EXAM_CHAT_PLAN_KEY)), expectedDay);
    return { status: 'reference', plan: {...stored, capacity: null}, presentation: null,
      error: strict.error, executable: false, guidanceFresh: false };
  } catch { return strict; }
}

export function examScheduleInterval(block, day) {
  const clock = value => { const [h,m]=value.split(':').map(Number);return h*60+m; };
  const midnight=Date.parse(`${day}T00:00:00+08:00`);
  const start=clock(block.start),end=block.end?clock(block.end):null;
  return {start:midnight+start*60000,end:end==null?null:midnight+(end+(end<start?1440:0))*60000};
}
