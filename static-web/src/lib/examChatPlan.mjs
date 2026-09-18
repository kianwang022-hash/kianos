export const EXAM_CHAT_PLAN_SCHEMA = 'kianos.exam.chat-plan.v1';
export const EXAM_CHAT_PLAN_KEY = 'kianos-exam-chat-plan-v1';
export const EXAM_CHAT_PLAN_SUBJECTS = Object.freeze(['xizong', 'english', 'politics']);

const text = (value, max = 500) => String(value || '').trim().slice(0, max);
const validDay = (day) => typeof day === 'string'
  && /^\d{4}-\d{2}-\d{2}$/.test(day)
  && !Number.isNaN(Date.parse(`${day}T00:00:00Z`))
  && new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day;

const finiteMinutes = (value, field) => {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1440) {
    throw new Error(`Invalid ${field}; expected 0–1440 minutes or null.`);
  }
  return Math.round(number);
};

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
    subjects,
    next_subject: nextSubject,
    attention
  };
}

export function readExamChatPlan(storage, expectedDay) {
  if (!storage?.getItem) {
    return { status: 'unavailable', plan: null, error: 'Storage is unavailable.' };
  }
  const raw = storage.getItem(EXAM_CHAT_PLAN_KEY);
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
    return { status: 'ready', plan: validateExamChatPlan(parsed, expectedDay), error: null };
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
  const plan = validateExamChatPlan(value, expectedDay);
  storage.setItem(EXAM_CHAT_PLAN_KEY, JSON.stringify(plan));
  return plan;
}
