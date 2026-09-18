import { reorderEnglishExamSteps } from './englishExamPaper.mjs';

export const ENGLISH_EXAM_SESSION_SCHEMA = 'kianos.english.exam-session.v1';
export const ENGLISH_EXAM_SESSION_KEY = 'kianos-english-exam-session-v1';
export const ENGLISH_EXAM_ANSWER_SCHEMA = 'kianos.english.exam-answer.v1';
export const ENGLISH_EXAM_EVIDENCE_SCHEMA = 'kianos.english.exam-evidence.v1';

const OBJECTIVE_TASKS = new Set(['cloze', 'reading_a', 'reading_b']);
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const iso = (value) => new Date(value).toISOString();

function finiteTime(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`ENGLISH_EXAM_TIME_INVALID:${label}`);
  return number;
}

function validateStep(step) {
  if (!step?.step_id || !step?.task || !step?.object_id) {
    throw new Error('ENGLISH_EXAM_STEP_INVALID');
  }
  return {
    ...clone(step),
    step_id: String(step.step_id),
    task: String(step.task),
    object_id: String(step.object_id),
    label: String(step.label || step.object_id),
    max_points: Number(step.max_points || 0)
  };
}

export function startEnglishExamSession(paper, {
  now = Date.now(),
  taskOrder = null,
  sessionId = null
} = {}) {
  if (paper?.schema !== 'kianos.english.exam-paper.v1') {
    throw new Error('ENGLISH_EXAM_PAPER_INVALID');
  }
  const started = finiteTime(now, 'start');
  const steps = reorderEnglishExamSteps(paper, taskOrder).map(validateStep);
  if (!steps.length) throw new Error('ENGLISH_EXAM_STEPS_EMPTY');
  const durationMinutes = Number(paper.duration_minutes || 0);
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    throw new Error('ENGLISH_EXAM_DURATION_INVALID');
  }

  return {
    schema: ENGLISH_EXAM_SESSION_SCHEMA,
    session_id: sessionId || `${paper.paper_id}:${new Date(started).toISOString()}`,
    paper_id: String(paper.paper_id),
    year: Number(paper.year),
    status: 'ACTIVE',
    started_at: iso(started),
    deadline_at: iso(started + durationMinutes * 60_000),
    sealed_at: null,
    released_at: null,
    duration_minutes: durationMinutes,
    total_points: Number(paper.total_points || 100),
    objective_max_points: Number(paper.objective_max_points || 60),
    productive_max_points: Number(paper.productive_max_points || 40),
    task_order: taskOrder ? [...taskOrder] : [...paper.default_task_order],
    current_step: 0,
    steps,
    captures: {},
    release: null,
    updated_at: iso(started)
  };
}

export function validateEnglishExamSession(value) {
  if (!value || value.schema !== ENGLISH_EXAM_SESSION_SCHEMA) {
    throw new Error('ENGLISH_EXAM_SESSION_INVALID');
  }
  if (!value.session_id || !value.paper_id || !Array.isArray(value.steps) || !value.steps.length) {
    throw new Error('ENGLISH_EXAM_SESSION_IDENTITY_INVALID');
  }
  if (!['ACTIVE', 'SEALED', 'RELEASED'].includes(value.status)) {
    throw new Error(`ENGLISH_EXAM_SESSION_STATUS_INVALID:${value.status}`);
  }
  value.steps.forEach(validateStep);
  if (!Number.isInteger(Number(value.current_step)) || Number(value.current_step) < 0 || Number(value.current_step) > value.steps.length) {
    throw new Error('ENGLISH_EXAM_CURRENT_STEP_INVALID');
  }
  return clone(value);
}

export function readEnglishExamSession(storage) {
  if (!storage?.getItem) return null;
  const raw = storage.getItem(ENGLISH_EXAM_SESSION_KEY);
  if (!raw) return null;
  try {
    return validateEnglishExamSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeEnglishExamSession(storage, state) {
  if (!storage?.setItem) throw new Error('ENGLISH_EXAM_STORAGE_UNAVAILABLE');
  const valid = validateEnglishExamSession(state);
  storage.setItem(ENGLISH_EXAM_SESSION_KEY, JSON.stringify(valid));
  return valid;
}

export function clearEnglishExamSession(storage) {
  if (storage?.removeItem) storage.removeItem(ENGLISH_EXAM_SESSION_KEY);
}

export function englishExamRemainingMs(state, now = Date.now()) {
  const valid = validateEnglishExamSession(state);
  return Math.max(0, Date.parse(valid.deadline_at) - finiteTime(now, 'remaining'));
}

function nextUncapturedIndex(state, afterIndex = -1) {
  for (let index = Math.max(0, afterIndex + 1); index < state.steps.length; index += 1) {
    if (!state.captures?.[state.steps[index].step_id]) return index;
  }
  for (let index = 0; index <= afterIndex && index < state.steps.length; index += 1) {
    if (!state.captures?.[state.steps[index].step_id]) return index;
  }
  return state.steps.length;
}

export function captureEnglishExamStep(state, {
  stepId,
  task,
  objectId,
  payload = {},
  now = Date.now()
} = {}) {
  const current = validateEnglishExamSession(state);
  if (current.status !== 'ACTIVE') throw new Error('ENGLISH_EXAM_NOT_ACTIVE');
  const index = current.steps.findIndex((step) => step.step_id === stepId);
  if (index < 0) throw new Error(`ENGLISH_EXAM_STEP_UNKNOWN:${stepId}`);
  const step = current.steps[index];
  if (step.task !== task || step.object_id !== objectId) {
    throw new Error(`ENGLISH_EXAM_STEP_IDENTITY_MISMATCH:${stepId}`);
  }

  const updated = clone(current);
  updated.captures[step.step_id] = {
    step_id: step.step_id,
    task: step.task,
    object_id: step.object_id,
    completed_at: iso(now),
    payload: clone(payload)
  };
  updated.current_step = nextUncapturedIndex(updated, index);
  updated.updated_at = iso(now);
  return updated;
}

export function selectEnglishExamStep(state, index, now = Date.now()) {
  const current = validateEnglishExamSession(state);
  if (current.status !== 'ACTIVE') throw new Error('ENGLISH_EXAM_NOT_ACTIVE');
  const target = Number(index);
  if (!Number.isInteger(target) || target < 0 || target >= current.steps.length) {
    throw new Error('ENGLISH_EXAM_STEP_INDEX_INVALID');
  }
  const updated = clone(current);
  updated.current_step = target;
  updated.updated_at = iso(now);
  return updated;
}

export function sealEnglishExamSession(state, now = Date.now()) {
  const current = validateEnglishExamSession(state);
  if (current.status !== 'ACTIVE') return current;
  const updated = clone(current);
  updated.status = 'SEALED';
  updated.current_step = updated.steps.length;
  updated.sealed_at = iso(now);
  updated.updated_at = iso(now);
  return updated;
}

function normalizeAnswers(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, answer]) => [String(key), String(answer ?? '')])
  );
}

export function releaseEnglishExamObjective(state, answerPacket, now = Date.now()) {
  const current = validateEnglishExamSession(state);
  if (current.status === 'ACTIVE') throw new Error('ENGLISH_EXAM_MUST_BE_SEALED');
  if (answerPacket?.schema !== ENGLISH_EXAM_ANSWER_SCHEMA || answerPacket?.paper_id !== current.paper_id) {
    throw new Error('ENGLISH_EXAM_ANSWER_PACKET_INVALID');
  }

  const byStep = answerPacket.steps && typeof answerPacket.steps === 'object'
    ? answerPacket.steps
    : {};
  const rows = [];
  let objectivePoints = 0;

  for (const step of current.steps.filter((row) => OBJECTIVE_TASKS.has(row.task))) {
    const expected = normalizeAnswers(byStep[step.step_id]?.answers);
    const actual = normalizeAnswers(current.captures?.[step.step_id]?.payload?.answers);
    const ids = Object.keys(expected);
    if (!ids.length) throw new Error(`ENGLISH_EXAM_ANSWERS_MISSING:${step.step_id}`);
    const correct = ids.filter((id) => actual[id] && actual[id] === expected[id]).length;
    const points = Number(((correct / ids.length) * Number(step.max_points || 0)).toFixed(2));
    objectivePoints += points;
    rows.push({
      step_id: step.step_id,
      task: step.task,
      object_id: step.object_id,
      correct,
      total: ids.length,
      points,
      max_points: Number(step.max_points || 0)
    });
  }

  const updated = clone(current);
  updated.status = 'RELEASED';
  updated.released_at = iso(now);
  updated.updated_at = iso(now);
  updated.release = {
    objective: {
      points: Number(objectivePoints.toFixed(2)),
      max_points: Number(current.objective_max_points || 60),
      steps: rows
    },
    productive: {
      status: 'CHAT_REVIEW_REQUIRED',
      max_points: Number(current.productive_max_points || 40)
    }
  };
  return updated;
}

export function englishExamTaskHref(step, {
  base = '/',
  sessionId = null,
  stepIndex = null
} = {}) {
  if (!step?.task || !step?.object_id) return null;
  const prefix = ({
    reading_a: 'reading',
    cloze: 'cloze',
    reading_b: 'reading-b',
    translation: 'translation',
    writing: 'english-exam-writing'
  })[step.task];
  if (!prefix) return null;
  const normalizedBase = String(base || '/').endsWith('/') ? String(base || '/') : String(base || '/') + '/';
  const query = sessionId
    ? `?exam_session=${encodeURIComponent(sessionId)}&exam_step=${encodeURIComponent(step.step_id)}${Number.isInteger(stepIndex) ? `&exam_index=${stepIndex}` : ''}`
    : '';
  return `${normalizedBase}${prefix}/${encodeURIComponent(step.object_id)}/${query}`;
}

export function summarizeEnglishExamSession(state) {
  if (!state) return null;
  const current = validateEnglishExamSession(state);
  return {
    schema: 'kianos.english.exam-summary.v1',
    session_id: current.session_id,
    paper_id: current.paper_id,
    year: current.year,
    status: current.status,
    started_at: current.started_at,
    deadline_at: current.deadline_at,
    completed_steps: Object.keys(current.captures || {}).length,
    total_steps: current.steps.length,
    current_step: current.current_step,
    objective_result: current.release?.objective || null,
    productive_status: current.release?.productive?.status || null
  };
}

export function buildEnglishExamEvidencePacket(state) {
  const current = validateEnglishExamSession(state);
  return {
    schema: ENGLISH_EXAM_EVIDENCE_SCHEMA,
    session_id: current.session_id,
    paper_id: current.paper_id,
    year: current.year,
    status: current.status,
    started_at: current.started_at,
    sealed_at: current.sealed_at,
    released_at: current.released_at,
    duration_minutes: current.duration_minutes,
    task_order: [...current.task_order],
    steps: current.steps.map((step) => ({
      ...clone(step),
      capture: clone(current.captures?.[step.step_id] || null)
    })),
    release: clone(current.release)
  };
}
