import {
  XIZONG_MEMORY_STORAGE_KEY,
  normalizeXizongMemoryState
} from './xizongMemoryModel.mjs';

export const XIZONG_SESSION_SCHEMA = 'kianos.xizong.session-instruction.v1';
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

function readJson(storage, key, fallback = null) {
  try {
    const raw = storage?.getItem?.(key);
    return raw == null ? fallback : (JSON.parse(raw) ?? fallback);
  } catch {
    return fallback;
  }
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
    const rawTargets = Array.isArray(raw.targets) ? raw.targets : [];
    if (!rawTargets.length) fail('MEMORY_TARGETS_REQUIRED', stepId);
    const targets = rawTargets.map((target, targetIndex) => {
      if (!target || typeof target !== 'object' || Array.isArray(target)) {
        fail('MEMORY_TARGET_INVALID', stepId + ':' + targetIndex);
      }
      const cardId = clean(target.card_id || target.cardId, 240);
      const blockId = clean(target.block_id || target.blockId, 200);
      const sourceHash = clean(target.source_hash || target.sourceHash, 160);
      if (!cardId || !blockId || !sourceHash) fail('MEMORY_TARGET_IDENTITY_REQUIRED', stepId + ':' + targetIndex);
      return { card_id: cardId, block_id: blockId, source_hash: sourceHash };
    });
    if (new Set(targets.map((target) => target.card_id)).size !== targets.length) {
      fail('MEMORY_TARGET_DUPLICATE', stepId);
    }
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
  const navigateIndex = steps.findIndex((step) => step.kind === 'NAVIGATE');
  if (navigateIndex >= 0 && navigateIndex !== steps.length - 1) fail('NAVIGATE_MUST_BE_TERMINAL');

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
  now = Date.now()
} = {}) {
  if (!storage?.getItem || !storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const instruction = validateXizongSessionInstruction(input, expectedDay);
  if (Date.parse(instruction.generated_at) > Number(now) + 60_000) fail('FUTURE');

  const priorRaw = storage.getItem(XIZONG_SESSION_KEY);
  if (priorRaw != null) {
    let prior;
    try { prior = validateXizongSessionInstruction(JSON.parse(priorRaw)); }
    catch { fail('EXISTING_UNREADABLE'); }

    if (prior.session_id === instruction.session_id) {
      if (JSON.stringify(prior) !== JSON.stringify(instruction)) fail('REPLAY_CONFLICT');
      return { status: 'idempotent', instruction: prior };
    }
    if (Date.parse(instruction.generated_at) <= Date.parse(prior.generated_at)) fail('OLDER_INSTRUCTION');
  }

  // Installing a session never pre-mutates future native executors. Step projection
  // happens only when that step becomes current.
  const beforeSession = storage.getItem(XIZONG_SESSION_KEY);
  const beforeRuntime = storage.getItem(XIZONG_SESSION_RUNTIME_KEY);
  try {
    storage.setItem(XIZONG_SESSION_KEY, JSON.stringify(instruction));
    storage.setItem(XIZONG_SESSION_RUNTIME_KEY, JSON.stringify({
      schema: 'kianos.xizong.session-runtime.v1',
      session_id: instruction.session_id,
      installed_at: new Date(now).toISOString(),
      activated_steps: [],
      activated_at_by_step: {}
    }));
  } catch (error) {
    try {
      if (beforeSession == null) storage.removeItem?.(XIZONG_SESSION_KEY);
      else storage.setItem(XIZONG_SESSION_KEY, beforeSession);
      if (beforeRuntime == null) storage.removeItem?.(XIZONG_SESSION_RUNTIME_KEY);
      else storage.setItem(XIZONG_SESSION_RUNTIME_KEY, beforeRuntime);
    } catch {}
    throw error;
  }

  return { status: 'applied', instruction };
}

function sessionRuntime(storage, instruction) {
  const raw = readJson(storage, XIZONG_SESSION_RUNTIME_KEY, null);
  if (!raw || raw.schema !== 'kianos.xizong.session-runtime.v1' || raw.session_id !== instruction.session_id) {
    return {
      schema: 'kianos.xizong.session-runtime.v1',
      session_id: instruction.session_id,
      installed_at: instruction.generated_at,
      activated_steps: [],
      activated_at_by_step: {}
    };
  }
  return {
    ...raw,
    activated_steps: Array.isArray(raw.activated_steps) ? [...raw.activated_steps] : [],
    activated_at_by_step: raw.activated_at_by_step && typeof raw.activated_at_by_step === 'object'
      ? { ...raw.activated_at_by_step }
      : {}
  };
}

function chatSetStorageId(instruction, step) {
  return ('chat-set:' + instruction.session_id + ':' + step.step_id)
    .replace(/[^a-zA-Z0-9:_-]+/g, '-');
}

function practiceSweepKey(instruction, step) {
  return 'kianos:xizong:chat-set-question-sweep:' + chatSetStorageId(instruction, step) + ':v1';
}

function stepIsComplete(storage, instruction, step) {
  const runtime = sessionRuntime(storage, instruction);
  const activatedAt = Date.parse(runtime.activated_at_by_step?.[step.step_id] || instruction.generated_at);

  if (step.kind === 'MEMORY_REVIEW') {
    const memory = normalizeXizongMemoryState(readJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
    return step.targets.every((target) =>
      memory.evidence.some((row) =>
        row?.cardId === target.card_id
        && Number.isFinite(Date.parse(row?.at))
        && Date.parse(row.at) >= activatedAt
      )
    );
  }

  if (step.kind === 'PRACTICE_SET') {
    const state = readJson(storage, practiceSweepKey(instruction, step), null);
    const history = Array.isArray(state?.attemptHistory) ? state.attemptHistory : [];
    return step.question_ids.every((id) =>
      history.some((row) => row?.type === 'QUESTION_ATTEMPT' && row?.question_id === id)
      || Boolean(state?.results?.[id])
    );
  }

  // NAVIGATE is intentionally terminal/non-evidentiary in this prototype.
  return false;
}

export function resolveXizongSessionNext(storage, instruction) {
  const value = validateXizongSessionInstruction(instruction);
  for (let i = value.current_step; i < value.steps.length; i += 1) {
    const step = value.steps[i];
    if (stepIsComplete(storage, value, step)) continue;
    if (step.kind === 'MEMORY_REVIEW') {
      return {
        index: i,
        step,
        href: '/xizong/memory/?session=' + encodeURIComponent(value.session_id)
          + '&step=' + encodeURIComponent(step.step_id)
      };
    }
    if (step.kind === 'PRACTICE_SET') return { index: i, step, href: '/xizong/practice/chat-set/' };
    if (step.kind === 'NAVIGATE') return { index: i, step, href: step.href };
  }
  return null;
}

export function activateXizongSessionNext(storage, instruction, {
  holdoutYears = [],
  now = Date.now()
} = {}) {
  if (!storage?.getItem || !storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const value = validateXizongSessionInstruction(instruction);
  const next = resolveXizongSessionNext(storage, value);
  if (!next) return { status: 'complete', next: null };

  const runtime = sessionRuntime(storage, value);
  if (runtime.activated_steps.includes(next.step.step_id)) {
    return { status: 'active', next };
  }

  const before = new Map([
    [XIZONG_MEMORY_STORAGE_KEY, storage.getItem(XIZONG_MEMORY_STORAGE_KEY)],
    [XIZONG_CHAT_SET_KEY, storage.getItem(XIZONG_CHAT_SET_KEY)],
    [XIZONG_SESSION_RUNTIME_KEY, storage.getItem(XIZONG_SESSION_RUNTIME_KEY)]
  ]);

  try {
    if (next.step.kind === 'MEMORY_REVIEW') {
      const memory = normalizeXizongMemoryState(readJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
      for (const target of next.step.targets) {
        const card = memory.cards[target.card_id];
        if (!card) fail('MEMORY_CARD_UNKNOWN', target.card_id);
        if (String(card.blockId || '') !== target.block_id) {
          fail('MEMORY_BLOCK_IDENTITY_MISMATCH', target.card_id);
        }
        const releasedBlock = memory.releasedBlocks?.[target.block_id];
        if (!releasedBlock) fail('MEMORY_RELEASE_OWNER_MISSING', target.block_id);
        if (String(releasedBlock.sourceHash || '') !== target.source_hash) {
          fail('MEMORY_SOURCE_REVISION_MISMATCH', target.card_id);
        }
      }
      // Do not mutate attention / weakWeight. The Memory workspace should render the
      // exact session-selected cards from the active Session instruction.
    }

    if (next.step.kind === 'PRACTICE_SET') {
      const held = new Set((Array.isArray(holdoutYears) ? holdoutYears : []).map(Number));
      const hitHoldout = next.step.question_ids.some((id) =>
        held.has(Number(id.match(/official-(\d{4})-/)?.[1]))
      );
      if (hitHoldout && !next.step.allow_holdout) fail('PRACTICE_HOLDOUT_CONFLICT', next.step.step_id);
      storage.setItem(XIZONG_CHAT_SET_KEY, JSON.stringify({
        schema: 'kianos.xizong.chat_set.v1',
        set_id: value.session_id + ':' + next.step.step_id,
        label: next.step.label || 'Chat 自选题',
        study_phase: next.step.study_phase,
        result_visibility: 'immediate',
        speed: next.step.speed,
        allow_holdout: next.step.allow_holdout,
        question_ids: next.step.question_ids
      }));
    }

    runtime.activated_steps = [...runtime.activated_steps, next.step.step_id];
    runtime.activated_at_by_step = {
      ...(runtime.activated_at_by_step || {}),
      [next.step.step_id]: new Date(now).toISOString()
    };
    runtime.updated_at = new Date(now).toISOString();
    storage.setItem(XIZONG_SESSION_RUNTIME_KEY, JSON.stringify(runtime));
    return { status: 'activated', next };
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
