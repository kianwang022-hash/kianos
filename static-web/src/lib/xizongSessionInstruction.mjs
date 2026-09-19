import {
  XIZONG_MEMORY_STORAGE_KEY,
  normalizeXizongMemoryState,
  requestMemoryReview
} from './xizongMemoryModel.mjs';

export const XIZONG_SESSION_SCHEMA = 'kianos.xizong.session-instruction.v1';
export const XIZONG_SESSION_RUNTIME_SCHEMA = 'kianos.xizong.session-runtime.v1';
export const XIZONG_SESSION_KEY = 'kianos:xizong:session-instruction:v1';
export const XIZONG_SESSION_RUNTIME_KEY = 'kianos:xizong:session-runtime:v1';
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

function memoryTarget(raw, stepId, index) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    fail('MEMORY_TARGET_INVALID', stepId + ':' + index);
  }
  const cardId = clean(raw.card_id || raw.cardId, 240);
  const sourceHash = clean(raw.source_hash || raw.sourceHash, 180);
  const blockId = clean(raw.block_id || raw.blockId, 200);
  if (!cardId || !sourceHash) fail('MEMORY_TARGET_IDENTITY_REQUIRED', stepId + ':' + index);
  return { card_id: cardId, source_hash: sourceHash, block_id: blockId || null };
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
    const targets = (Array.isArray(raw.targets) ? raw.targets : []).map((row, i) => memoryTarget(row, stepId, i));
    if (!targets.length) fail('MEMORY_TARGETS_REQUIRED', stepId);
    const ids = targets.map((row) => row.card_id);
    if (new Set(ids).size !== ids.length) fail('MEMORY_TARGET_DUPLICATE', stepId);
    return { ...base, targets };
  }

  if (kind === 'PRACTICE_SET') {
    const rawQuestionIds = (Array.isArray(raw.question_ids) ? raw.question_ids : [])
      .map((id) => clean(id, 160)).filter(Boolean);
    if (!rawQuestionIds.length) fail('PRACTICE_IDS_REQUIRED', stepId);
    if (new Set(rawQuestionIds).size !== rawQuestionIds.length) fail('PRACTICE_IDS_DUPLICATE', stepId);
    if (rawQuestionIds.some((id) => !/^xizong-official-\d{4}-n\d{3}$/.test(id))) {
      fail('PRACTICE_ID_INVALID', stepId);
    }
    return {
      ...base,
      question_ids: rawQuestionIds,
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

function makeRuntime(instruction) {
  return {
    schema: XIZONG_SESSION_RUNTIME_SCHEMA,
    session_id: instruction.session_id,
    study_day: instruction.study_day,
    instruction_generated_at: instruction.generated_at,
    current_step: 0,
    activated_at: null,
    status: 'ACTIVE'
  };
}

function validateRuntime(value, instruction) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || value.schema !== XIZONG_SESSION_RUNTIME_SCHEMA) fail('RUNTIME_INVALID');
  if (value.session_id !== instruction.session_id || value.study_day !== instruction.study_day) {
    fail('RUNTIME_SESSION_MISMATCH');
  }
  if (value.instruction_generated_at !== instruction.generated_at) fail('RUNTIME_REVISION_MISMATCH');
  const currentStep = Number(value.current_step);
  if (!Number.isInteger(currentStep) || currentStep < 0 || currentStep > instruction.steps.length) {
    fail('RUNTIME_STEP_INVALID');
  }
  if (!['ACTIVE','COMPLETE'].includes(value.status)) fail('RUNTIME_STATUS_INVALID');
  return {
    schema: XIZONG_SESSION_RUNTIME_SCHEMA,
    session_id: instruction.session_id,
    study_day: instruction.study_day,
    instruction_generated_at: instruction.generated_at,
    current_step: currentStep,
    activated_at: value.activated_at && !Number.isNaN(Date.parse(value.activated_at))
      ? new Date(value.activated_at).toISOString()
      : null,
    status: value.status
  };
}

function readPair(storage) {
  const instructionRaw = parseJson(storage, XIZONG_SESSION_KEY, null);
  if (!instructionRaw) return { instruction: null, runtime: null };
  const instruction = validateXizongSessionInstruction(instructionRaw);
  const runtimeRaw = parseJson(storage, XIZONG_SESSION_RUNTIME_KEY, null);
  if (!runtimeRaw) fail('RUNTIME_MISSING');
  return { instruction, runtime: validateRuntime(runtimeRaw, instruction) };
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

function exactSessionReason(instruction, step) {
  return 'CHAT_SESSION:' + instruction.session_id + ':' + step.step_id;
}

function validateMemoryTargets(memory, step) {
  for (const target of step.targets) {
    const card = memory.cards?.[target.card_id];
    if (!card) fail('MEMORY_CARD_UNKNOWN', target.card_id);
    if (String(card.sourceHash || '') !== target.source_hash) {
      fail('MEMORY_SOURCE_REVISION_MISMATCH', target.card_id);
    }
    if (target.block_id && String(card.blockId || '') !== target.block_id) {
      fail('MEMORY_BLOCK_MISMATCH', target.card_id);
    }
  }
}

function clearSessionOwnedMemoryAttention(memoryInput, instruction, step) {
  let memory = normalizeXizongMemoryState(memoryInput);
  for (const target of step.targets) {
    const row = memory.attention?.[target.card_id];
    if (row?.reviewRequested === true && String(row?.reason || '') === exactSessionReason(instruction, step)) {
      memory = requestMemoryReview(memory, target.card_id, false, '');
    }
  }
  return memory;
}

function cleanupSupersededSession(storage, priorInstruction, priorRuntime) {
  const writes = [];
  const current = priorInstruction.steps[priorRuntime.current_step] || null;

  if (current?.kind === 'MEMORY_REVIEW' && priorRuntime.activated_at) {
    const memory = clearSessionOwnedMemoryAttention(
      parseJson(storage, XIZONG_MEMORY_STORAGE_KEY, null),
      priorInstruction,
      current
    );
    writes.push([XIZONG_MEMORY_STORAGE_KEY, memory]);
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
      return { status: 'idempotent', instruction: existing.instruction, runtime: existing.runtime };
    }
    if (Date.parse(instruction.generated_at) <= Date.parse(existing.instruction.generated_at)) {
      fail('OLDER_INSTRUCTION');
    }
  }

  const memory = normalizeXizongMemoryState(parseJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
  for (const step of instruction.steps) {
    if (step.kind === 'MEMORY_REVIEW') validateMemoryTargets(memory, step);
  }

  const runtime = makeRuntime(instruction);
  const writes = existing.instruction
    ? cleanupSupersededSession(storage, existing.instruction, existing.runtime)
    : [];
  writes.push([XIZONG_SESSION_KEY, instruction], [XIZONG_SESSION_RUNTIME_KEY, runtime]);
  writeAtomically(storage, writes);

  return {
    status: existing.instruction ? 'superseded' : 'applied',
    instruction,
    runtime
  };
}

export function xizongChatSetSweepKey(sessionId, stepId) {
  const setId = String(sessionId) + ':' + String(stepId);
  const storageId = ('chat-set:' + setId).replace(/[^a-zA-Z0-9:_-]+/g, '-');
  return 'kianos:xizong:chat-set-question-sweep:' + storageId + ':v1';
}

function stepComplete(storage, instruction, runtime, step) {
  if (!runtime.activated_at) return false;

  if (step.kind === 'MEMORY_REVIEW') {
    const memory = normalizeXizongMemoryState(parseJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
    const activatedAt = Date.parse(runtime.activated_at);
    return step.targets.every((target) =>
      memory.evidence.some((event) =>
        event?.cardId === target.card_id
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
  const { instruction, runtime } = readPair(storage);
  if (!instruction || !runtime) return { status: 'missing', next: null };
  if (runtime.status === 'COMPLETE') return { status: 'complete', next: null };

  const step = instruction.steps[runtime.current_step];
  if (!stepComplete(storage, instruction, runtime, step)) {
    return { status: 'pending', next: resolveXizongSessionNext(storage, instruction, runtime) };
  }

  const writes = [];
  if (step.kind === 'MEMORY_REVIEW') {
    const memory = clearSessionOwnedMemoryAttention(
      parseJson(storage, XIZONG_MEMORY_STORAGE_KEY, null),
      instruction,
      step
    );
    writes.push([XIZONG_MEMORY_STORAGE_KEY, memory]);
  } else if (step.kind === 'PRACTICE_SET') {
    const activeSet = parseJson(storage, XIZONG_CHAT_SET_KEY, null);
    if (activeSet?.set_id === instruction.session_id + ':' + step.step_id) {
      writes.push([XIZONG_CHAT_SET_KEY, null]);
    }
  }

  const nextIndex = runtime.current_step + 1;
  const done = nextIndex >= instruction.steps.length;
  const nextRuntime = {
    ...runtime,
    current_step: nextIndex,
    activated_at: null,
    status: done ? 'COMPLETE' : 'ACTIVE'
  };
  writes.push([XIZONG_SESSION_RUNTIME_KEY, nextRuntime]);
  writeAtomically(storage, writes);

  return {
    status: done ? 'complete' : 'advanced',
    next: done ? null : resolveXizongSessionNext(storage, instruction, nextRuntime)
  };
}

export function activateXizongSessionCurrentStep(storage, {
  now = Date.now(),
  holdoutYears = []
} = {}) {
  const { instruction, runtime } = readPair(storage);
  if (!instruction || !runtime) return { status: 'missing', next: null };
  if (runtime.status === 'COMPLETE') return { status: 'complete', next: null };

  const step = instruction.steps[runtime.current_step];
  if (!step) fail('ACTIVE_STEP_MISSING');
  if (runtime.activated_at) {
    return { status: 'already_active', next: resolveXizongSessionNext(storage, instruction, runtime) };
  }

  const activatedAt = new Date(now).toISOString();
  const nextRuntime = { ...runtime, activated_at: activatedAt };
  const writes = [];

  if (step.kind === 'MEMORY_REVIEW') {
    let memory = normalizeXizongMemoryState(parseJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
    validateMemoryTargets(memory, step);
    for (const target of step.targets) {
      memory = requestMemoryReview(
        memory,
        target.card_id,
        true,
        exactSessionReason(instruction, step)
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

  writes.push([XIZONG_SESSION_RUNTIME_KEY, nextRuntime]);
  writeAtomically(storage, writes);
  return { status: 'activated', next: resolveXizongSessionNext(storage, instruction, nextRuntime) };
}

// Browser/Home convenience: reconcile evidence, advance completed steps, then ensure
// exactly the current step is activated. This mutates execution state only; it never
// changes mastery semantics.
export function activateXizongSessionNext(storage, instructionInput = null, {
  holdoutYears = [],
  now = Date.now()
} = {}) {
  if (instructionInput) {
    const expected = validateXizongSessionInstruction(instructionInput);
    const current = readPair(storage);
    if (!current.instruction || current.instruction.session_id !== expected.session_id
        || JSON.stringify(current.instruction) !== JSON.stringify(expected)) {
      fail('ACTIVE_INSTRUCTION_MISMATCH');
    }
  }

  let result = advanceXizongSessionIfComplete(storage);
  while (result.status === 'advanced') result = advanceXizongSessionIfComplete(storage);
  if (result.status === 'complete' || result.status === 'missing') return result;
  return activateXizongSessionCurrentStep(storage, { now, holdoutYears });
}

export function installAndActivateXizongSessionInstruction(storage, input, {
  expectedDay,
  now = Date.now(),
  holdoutYears = []
} = {}) {
  const keys = [
    XIZONG_SESSION_KEY,
    XIZONG_SESSION_RUNTIME_KEY,
    XIZONG_MEMORY_STORAGE_KEY,
    XIZONG_CHAT_SET_KEY
  ];
  const before = new Map(keys.map((key) => [key, storage.getItem(key)]));
  try {
    const installed = applyXizongSessionInstruction(storage, input, { expectedDay, now });
    const activated = activateXizongSessionNext(storage, installed.instruction, { now, holdoutYears });
    return { installed, activated };
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

export function resolveXizongSessionNext(storage, instructionInput = null, runtimeInput = null) {
  const pair = instructionInput
    ? (() => {
        const instruction = validateXizongSessionInstruction(instructionInput);
        const runtime = validateRuntime(
          runtimeInput || parseJson(storage, XIZONG_SESSION_RUNTIME_KEY, null),
          instruction
        );
        return { instruction, runtime };
      })()
    : readPair(storage);

  const { instruction, runtime } = pair;
  if (!instruction || !runtime || runtime.status === 'COMPLETE') return null;
  const step = instruction.steps[runtime.current_step];
  if (!step) return null;

  const suffix = '?session=' + encodeURIComponent(instruction.session_id)
    + '&step=' + encodeURIComponent(step.step_id);
  if (step.kind === 'MEMORY_REVIEW') {
    return { index: runtime.current_step, step, href: '/xizong/memory/' + suffix, active: Boolean(runtime.activated_at) };
  }
  if (step.kind === 'PRACTICE_SET') {
    return { index: runtime.current_step, step, href: '/xizong/practice/chat-set/' + suffix, active: Boolean(runtime.activated_at) };
  }
  return null;
}
