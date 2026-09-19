import {
  XIZONG_MEMORY_STORAGE_KEY,
  normalizeXizongMemoryState,
  requestMemoryReview
} from './xizongMemoryModel.mjs';

export const XIZONG_SESSION_SCHEMA = 'kianos.xizong.session-instruction.v1';
export const XIZONG_SESSION_STATE_SCHEMA = 'kianos.xizong.session-state.v1';
export const XIZONG_SESSION_KEY = 'kianos:xizong:session-instruction:v1';
export const XIZONG_SESSION_STATE_KEY = 'kianos:xizong:session-state:v1';
export const XIZONG_CHAT_SET_KEY = 'kianos:xizong:chat-set:v1';

const clean = (value, max = 500) => String(value || '').trim().slice(0, max);
const validDay = (day) => typeof day === 'string'
  && /^\d{4}-\d{2}-\d{2}$/.test(day)
  && !Number.isNaN(Date.parse(day + 'T00:00:00Z'));

function fail(code, detail = '') {
  throw new Error('XIZONG_SESSION_' + code + (detail ? ':' + detail : ''));
}

function parseJson(storage, key, fallback = null) {
  const raw = storage?.getItem?.(key);
  if (raw == null) return fallback;
  try { return JSON.parse(raw); }
  catch { fail('STORED_JSON_INVALID', key); }
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

  return {
    schema: XIZONG_SESSION_SCHEMA,
    session_id: sessionId,
    study_day: studyDay,
    generated_at: new Date(generatedAt).toISOString(),
    steps
  };
}

function validateState(value, instruction) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || value.schema !== XIZONG_SESSION_STATE_SCHEMA) fail('STATE_INVALID');
  if (value.session_id !== instruction.session_id || value.study_day !== instruction.study_day) {
    fail('STATE_SESSION_MISMATCH');
  }
  const currentStep = Number(value.current_step);
  if (!Number.isInteger(currentStep) || currentStep < 0 || currentStep > instruction.steps.length) {
    fail('STATE_STEP_INVALID');
  }
  if (!['ACTIVE','COMPLETE'].includes(value.status)) fail('STATE_STATUS_INVALID');
  return {
    schema: XIZONG_SESSION_STATE_SCHEMA,
    session_id: instruction.session_id,
    study_day: instruction.study_day,
    generated_at: instruction.generated_at,
    current_step: currentStep,
    activated_at: value.activated_at && !Number.isNaN(Date.parse(value.activated_at))
      ? new Date(value.activated_at).toISOString()
      : null,
    status: value.status
  };
}

function makeState(instruction) {
  return {
    schema: XIZONG_SESSION_STATE_SCHEMA,
    session_id: instruction.session_id,
    study_day: instruction.study_day,
    generated_at: instruction.generated_at,
    current_step: 0,
    activated_at: null,
    status: 'ACTIVE'
  };
}

function readPair(storage) {
  const instructionRaw = parseJson(storage, XIZONG_SESSION_KEY, null);
  if (!instructionRaw) return { instruction: null, state: null };
  const instruction = validateXizongSessionInstruction(instructionRaw);
  const stateRaw = parseJson(storage, XIZONG_SESSION_STATE_KEY, null);
  if (!stateRaw) fail('STATE_MISSING');
  return { instruction, state: validateState(stateRaw, instruction) };
}

function writeAtomically(storage, writes) {
  const keys = [...new Set(writes.map(([key]) => key))];
  const before = new Map(keys.map((key) => [key, storage.getItem(key)]));
  try {
    for (const [key, value] of writes) {
      if (value == null) storage.removeItem?.(key);
      else storage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  } catch (error) {
    for (const [key, raw] of before.entries()) {
      try {
        if (raw == null) storage.removeItem?.(key);
        else storage.setItem(key, raw);
      } catch {}
    }
    throw error;
  }
}

function cleanupSupersededSession(storage, priorInstruction, priorState) {
  const writes = [];
  const current = priorInstruction.steps[priorState.current_step] || null;

  if (current?.kind === 'MEMORY_REVIEW' && priorState.activated_at) {
    let memory = normalizeXizongMemoryState(parseJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
    let changed = false;
    for (const cardId of current.card_ids) {
      const row = memory.attention?.[cardId];
      if (row?.reviewRequested === true
          && String(row?.reason || '') === 'CHAT_SESSION:' + priorInstruction.session_id + ':' + current.step_id) {
        memory = requestMemoryReview(memory, cardId, false, '');
        changed = true;
      }
    }
    if (changed) writes.push([XIZONG_MEMORY_STORAGE_KEY, memory]);
  }

  const activeSet = parseJson(storage, XIZONG_CHAT_SET_KEY, null);
  if (activeSet?.set_id && String(activeSet.set_id).startsWith(priorInstruction.session_id + ':')) {
    writes.push([XIZONG_CHAT_SET_KEY, null]);
  }
  return writes;
}

export function applyXizongSessionInstruction(storage, input, {
  expectedDay,
  now = Date.now()
} = {}) {
  if (!storage?.getItem || !storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const instruction = validateXizongSessionInstruction(input, expectedDay);
  if (Date.parse(instruction.generated_at) > Number(now) + 60_000) fail('FUTURE');

  const existing = readPair(storage);
  if (existing.instruction) {
    if (existing.instruction.session_id === instruction.session_id) {
      if (JSON.stringify(existing.instruction) !== JSON.stringify(instruction)) fail('REPLAY_CONFLICT');
      return { status: 'idempotent', instruction: existing.instruction, state: existing.state };
    }
    if (Date.parse(instruction.generated_at) <= Date.parse(existing.instruction.generated_at)) {
      fail('OLDER_INSTRUCTION');
    }
  }

  // Validate all Memory identities before any mutation. Future Practice IDs are
  // format-validated here and are current-inventory validated by the native Chat Set executor.
  const memory = normalizeXizongMemoryState(parseJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
  for (const step of instruction.steps) {
    if (step.kind !== 'MEMORY_REVIEW') continue;
    for (const cardId of step.card_ids) {
      if (!memory.cards[cardId]) fail('MEMORY_CARD_UNKNOWN', cardId);
    }
  }

  const nextState = makeState(instruction);
  const writes = existing.instruction
    ? cleanupSupersededSession(storage, existing.instruction, existing.state)
    : [];
  writes.push([XIZONG_SESSION_KEY, instruction], [XIZONG_SESSION_STATE_KEY, nextState]);
  writeAtomically(storage, writes);

  return {
    status: existing.instruction ? 'superseded' : 'applied',
    instruction,
    state: nextState
  };
}

export function activateXizongSessionCurrentStep(storage, {
  now = Date.now(),
  holdoutYears = []
} = {}) {
  const { instruction, state } = readPair(storage);
  if (!instruction || !state) return { status: 'missing', next: null };
  if (state.status === 'COMPLETE') return { status: 'complete', next: null };

  const step = instruction.steps[state.current_step];
  if (!step) fail('ACTIVE_STEP_MISSING');
  if (state.activated_at) return {
    status: 'already_active',
    next: resolveXizongSessionNext(storage, instruction, state)
  };

  const activatedAt = new Date(now).toISOString();
  const nextState = { ...state, activated_at: activatedAt };
  const writes = [];

  if (step.kind === 'MEMORY_REVIEW') {
    let memory = normalizeXizongMemoryState(parseJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
    for (const cardId of step.card_ids) {
      if (!memory.cards[cardId]) fail('MEMORY_CARD_UNKNOWN', cardId);
      memory = requestMemoryReview(
        memory,
        cardId,
        true,
        'CHAT_SESSION:' + instruction.session_id + ':' + step.step_id
      );
    }
    writes.push([XIZONG_MEMORY_STORAGE_KEY, memory]);
  }

  if (step.kind === 'PRACTICE_SET') {
    const held = new Set((Array.isArray(holdoutYears) ? holdoutYears : []).map(Number));
    const hitHoldout = step.question_ids.some((id) =>
      held.has(Number(id.match(/official-(\d{4})-/)?.[1]))
    );
    if (hitHoldout && !step.allow_holdout) fail('PRACTICE_HOLDOUT_CONFLICT', step.step_id);
    writes.push([XIZONG_CHAT_SET_KEY, {
      schema: 'kianos.xizong.chat_set.v1',
      set_id: instruction.session_id + ':' + step.step_id,
      label: step.label || 'Chat 自选题',
      study_phase: step.study_phase,
      result_visibility: 'immediate',
      speed: step.speed,
      allow_holdout: step.allow_holdout,
      question_ids: step.question_ids
    }]);
  }

  writes.push([XIZONG_SESSION_STATE_KEY, nextState]);
  writeAtomically(storage, writes);
  return {
    status: 'activated',
    next: resolveXizongSessionNext(storage, instruction, nextState)
  };
}

export function xizongChatSetSweepKey(sessionId, stepId) {
  const setId = String(sessionId) + ':' + String(stepId);
  const storageId = 'chat-set:' + setId;
  return 'kianos:xizong:chat-set-question-sweep:' + storageId + ':v1';
}

function stepComplete(storage, instruction, state, step) {
  if (!state.activated_at) return false;

  if (step.kind === 'MEMORY_REVIEW') {
    const memory = normalizeXizongMemoryState(parseJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
    const activatedAt = Date.parse(state.activated_at);
    return step.card_ids.every((cardId) =>
      memory.evidence.some((event) =>
        event?.cardId === cardId
        && Number.isFinite(Date.parse(event?.at))
        && Date.parse(event.at) >= activatedAt
      )
    );
  }

  if (step.kind === 'PRACTICE_SET') {
    const sweep = parseJson(storage, xizongChatSetSweepKey(instruction.session_id, step.step_id), null);
    return step.question_ids.every((id) => sweep?.results?.[id]);
  }

  return false;
}

export function advanceXizongSessionIfComplete(storage) {
  const { instruction, state } = readPair(storage);
  if (!instruction || !state) return { status: 'missing', next: null };
  if (state.status === 'COMPLETE') return { status: 'complete', next: null };

  const step = instruction.steps[state.current_step];
  if (!stepComplete(storage, instruction, state, step)) {
    return { status: 'pending', next: resolveXizongSessionNext(storage, instruction, state) };
  }

  const nextIndex = state.current_step + 1;
  const done = nextIndex >= instruction.steps.length;
  const nextState = {
    ...state,
    current_step: nextIndex,
    activated_at: null,
    status: done ? 'COMPLETE' : 'ACTIVE'
  };
  writeAtomically(storage, [[XIZONG_SESSION_STATE_KEY, nextState]]);
  return {
    status: done ? 'complete' : 'advanced',
    next: done ? null : resolveXizongSessionNext(storage, instruction, nextState)
  };
}

export function resolveXizongSessionNext(storage, instructionInput = null, stateInput = null) {
  const pair = instructionInput
    ? {
        instruction: validateXizongSessionInstruction(instructionInput),
        state: validateState(stateInput || parseJson(storage, XIZONG_SESSION_STATE_KEY, null), validateXizongSessionInstruction(instructionInput))
      }
    : readPair(storage);
  const { instruction, state } = pair;
  if (!instruction || !state || state.status === 'COMPLETE') return null;

  const step = instruction.steps[state.current_step];
  if (!step) return null;
  if (step.kind === 'MEMORY_REVIEW') {
    return { index: state.current_step, step, href: '/xizong/memory/', active: Boolean(state.activated_at) };
  }
  if (step.kind === 'PRACTICE_SET') {
    return { index: state.current_step, step, href: '/xizong/practice/chat-set/', active: Boolean(state.activated_at) };
  }
  return null;
}
