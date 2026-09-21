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
      floorMinutes: value.floorMinutes ?? null,
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
  const learnerEvidenceBasis = normalizeExamChatPlanBasis(value.learner_evidence_basis, value.study_day);

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
    subjects,
    next_subject: nextSubject,
    attention
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
  if (raw == null) return { status: 'missing', plan: null, error: null };
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.study_day && expectedDay && parsed.study_day !== expectedDay) {
      return {
        status: 'stale',
        plan: null,
        error: `Chat Plan is for ${parsed.study_day}, not ${expectedDay}.`
      };
    }
    try {
      return {
        status: 'ready',
        plan: validateExamChatPlanAgainstStorage(storage, parsed, expectedDay),
        error: null
      };
    } catch (error) {
      if (/CHAT_PLAN_EVIDENCE_BASIS_(?:REQUIRED|STALE|DAY_MISMATCH)/.test(String(error?.message || ''))) {
        return {
          status: 'stale',
          plan: null,
          error: error instanceof Error ? error.message : String(error)
        };
      }
      throw error;
    }
  } catch (error) {
    return {
      status: 'invalid',
      plan: null,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export function writeExamChatPlan(storage, value, expectedDay) {
  if (!storage?.setItem) throw new Error('Storage is unavailable.');
  const plan = validateExamChatPlanAgainstStorage(storage, value, expectedDay);
  storage.setItem(EXAM_CHAT_PLAN_KEY, JSON.stringify(plan));
  return plan;
}
