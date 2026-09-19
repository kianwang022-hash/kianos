import {
  XIZONG_MEMORY_STORAGE_KEY,
  normalizeXizongMemoryState,
  requestMemoryReview
} from './xizongMemoryModel.mjs';

export const XIZONG_SESSION_SCHEMA = 'kianos.xizong.session-instruction.v1';
export const XIZONG_SESSION_KEY = 'kianos:xizong:session-instruction:v1';
export const XIZONG_CHAT_SET_KEY = 'kianos:xizong:chat-set:v1';

const clean = (value, max = 500) => String(value || '').trim().slice(0, max);
const validDay = (day) => typeof day === 'string'
  && /^\d{4}-\d{2}-\d{2}$/.test(day)
  && !Number.isNaN(Date.parse(day + 'T00:00:00Z'));

function fail(code, detail = '') {
  throw new Error('XIZONG_SESSION_' + code + (detail ? ':' + detail : ''));
}

function normalizeStep(raw, index) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail('STEP_INVALID', String(index));
  const kind = clean(raw.kind, 40).toUpperCase();
  const stepId = clean(raw.step_id || raw.stepId || ('step-' + (index + 1)), 120);
  if (!stepId) fail('STEP_ID_REQUIRED', String(index));
  const base = {
    step_id: stepId,
    kind,
    label: clean(raw.label, 180),
    reason: clean(raw.reason, 1000)
  };

  if (kind === 'MEMORY_REVIEW') {
    const cardIds = [...new Set((Array.isArray(raw.card_ids) ? raw.card_ids : [])
      .map((id) => clean(id, 240)).filter(Boolean))];
    if (!cardIds.length) fail('MEMORY_CARD_IDS_REQUIRED', stepId);
    return { ...base, card_ids: cardIds };
  }

  if (kind === 'PRACTICE_SET') {
    const questionIds = [...new Set((Array.isArray(raw.question_ids) ? raw.question_ids : [])
      .map((id) => clean(id, 160)).filter(Boolean))];
    if (!questionIds.length) fail('PRACTICE_IDS_REQUIRED', stepId);
    if (questionIds.some((id) => !/^xizong-official-\d{4}-n\d{3}$/.test(id))) {
      fail('PRACTICE_ID_INVALID', stepId);
    }
    return {
      ...base,
      question_ids: questionIds,
      study_phase: ['FIRST_PASS','SECOND_PASS','LATE_REVIEW'].includes(String(raw.study_phase || ''))
        ? String(raw.study_phase)
        : 'SECOND_PASS',
      speed: ['normal','fast'].includes(String(raw.speed || '')) ? String(raw.speed) : 'normal',
      allow_holdout: raw.allow_holdout === true
    };
  }

  if (kind === 'NAVIGATE') {
    const href = clean(raw.href, 500);
    if (!href.startsWith('/xizong/')) fail('NAVIGATE_HREF_INVALID', stepId);
    return { ...base, href };
  }

  fail('STEP_KIND_INVALID', kind || String(index));
}

export function validateXizongSessionInstruction(value, expectedDay = null) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('OBJECT_REQUIRED');
  if (value.schema !== XIZONG_SESSION_SCHEMA) fail('SCHEMA_INVALID');
  const sessionId = clean(value.session_id || value.sessionId, 160);
  if (!sessionId) fail('ID_REQUIRED');
  const studyDay = clean(value.study_day || value.studyDay, 20);
  if (!validDay(studyDay)) fail('DAY_INVALID');
  if (expectedDay && studyDay !== expectedDay) fail('STALE_DAY', studyDay);
  const generatedAt = clean(value.generated_at || value.generatedAt, 80);
  if (!generatedAt || Number.isNaN(Date.parse(generatedAt))) fail('GENERATED_AT_INVALID');

  const steps = Array.isArray(value.steps) ? value.steps.map(normalizeStep) : [];
  if (!steps.length || steps.length > 20) fail('STEP_COUNT_INVALID', String(steps.length));
  if (new Set(steps.map((step) => step.step_id)).size !== steps.length) fail('STEP_ID_DUPLICATE');

  const currentStep = Number(value.current_step ?? value.currentStep ?? 0);
  if (!Number.isInteger(currentStep) || currentStep < 0 || currentStep >= steps.length) {
    fail('CURRENT_STEP_INVALID');
  }

  return {
    schema: XIZONG_SESSION_SCHEMA,
    session_id: sessionId,
    study_day: studyDay,
    generated_at: new Date(generatedAt).toISOString(),
    current_step: currentStep,
    steps
  };
}

export function applyXizongSessionInstruction(storage, input, {
  expectedDay,
  now = Date.now(),
  holdoutYears = []
} = {}) {
  if (!storage?.getItem || !storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const instruction = validateXizongSessionInstruction(input, expectedDay);
  if (Date.parse(instruction.generated_at) > Number(now) + 60_000) fail('FUTURE');

  let prior = null;
  const priorRaw = storage.getItem(XIZONG_SESSION_KEY);
  if (priorRaw != null) {
    try { prior = validateXizongSessionInstruction(JSON.parse(priorRaw)); }
    catch { fail('EXISTING_UNREADABLE'); }
    if (prior.session_id === instruction.session_id) {
      if (JSON.stringify(prior) !== JSON.stringify(instruction)) fail('REPLAY_CONFLICT');
      return { status: 'idempotent', instruction: prior };
    }
    if (Date.parse(instruction.generated_at) <= Date.parse(prior.generated_at)) fail('OLDER_INSTRUCTION');
  }

  // Validate every step and prepare all writes before mutating local state.
  let memory = normalizeXizongMemoryState(JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY) || 'null'));
  const prepared = [];
  const held = new Set((Array.isArray(holdoutYears) ? holdoutYears : []).map(Number));

  instruction.steps.forEach((step) => {
    if (step.kind === 'MEMORY_REVIEW') {
      for (const cardId of step.card_ids) {
        if (!memory.cards[cardId]) fail('MEMORY_CARD_UNKNOWN', cardId);
        memory = requestMemoryReview(memory, cardId, true, 'CHAT_SELECTED');
      }
      prepared.push([XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(memory)]);
    }

    if (step.kind === 'PRACTICE_SET') {
      const hitHoldout = step.question_ids.some((id) => held.has(Number(id.match(/official-(\d{4})-/)?.[1])));
      if (hitHoldout && !step.allow_holdout) fail('PRACTICE_HOLDOUT_CONFLICT', step.step_id);
      prepared.push([XIZONG_CHAT_SET_KEY, JSON.stringify({
        schema: 'kianos.xizong.chat_set.v1',
        set_id: instruction.session_id + ':' + step.step_id,
        label: step.label || 'Chat 自选题',
        study_phase: step.study_phase,
        result_visibility: 'immediate',
        speed: step.speed,
        allow_holdout: step.allow_holdout,
        question_ids: step.question_ids
      })]);
    }
  });

  prepared.push([XIZONG_SESSION_KEY, JSON.stringify(instruction)]);

  const keys = [...new Set(prepared.map(([key]) => key))];
  const before = new Map(keys.map((key) => [key, storage.getItem(key)]));

  try {
    // Last prepared value wins for a given key.
    const writes = new Map(prepared);
    for (const [key, raw] of writes.entries()) storage.setItem(key, raw);
  } catch (error) {
    for (const [key, raw] of before.entries()) {
      try {
        if (raw == null) storage.removeItem?.(key);
        else storage.setItem(key, raw);
      } catch {}
    }
    throw error;
  }

  return { status: 'applied', instruction };
}

export function resolveXizongSessionNext(storage, instruction) {
  const value = validateXizongSessionInstruction(instruction);
  for (let i = value.current_step; i < value.steps.length; i += 1) {
    const step = value.steps[i];
    if (step.kind === 'MEMORY_REVIEW') {
      const memory = normalizeXizongMemoryState(JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY) || 'null'));
      const pending = step.card_ids.filter((id) => memory.attention?.[id]?.reviewRequested === true);
      if (pending.length) return { index: i, step, href: '/xizong/memory/' };
      continue;
    }
    if (step.kind === 'PRACTICE_SET') {
      const key = 'kianos:xizong:chat-set-question-sweep:' + value.session_id + ':' + step.step_id + ':v1';
      let state = null;
      try { state = JSON.parse(storage.getItem(key) || 'null'); } catch {}
      const complete = step.question_ids.every((id) => state?.results?.[id]);
      if (!complete) return { index: i, step, href: '/xizong/practice/chat-set/' };
      continue;
    }
    if (step.kind === 'NAVIGATE') {
      // Navigation is intentionally non-evidentiary. A session cannot infer completion
      // merely because the learner visited a page. Return it until a newer Chat session
      // supersedes the instruction.
      return { index: i, step, href: step.href };
    }
  }
  return null;
}
