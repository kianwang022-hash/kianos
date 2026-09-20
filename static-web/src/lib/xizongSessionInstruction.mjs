import {
  XIZONG_MEMORY_STORAGE_KEY,
  normalizeXizongMemoryState
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

const AI_PROBE_KINDS = new Set(['MECHANISM_VARIANT','DISCRIMINATION','MINI_CASE','CONDITION_CHANGE','PRECISION']);
const AI_PROBE_TYPES = new Set(['A','X']);

function cleanExplanation(raw) {
  const value = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const reasoning = Array.isArray(value.reasoning_chain || value.reasoningChain)
    ? (value.reasoning_chain || value.reasoningChain).map((item) => clean(item, 800)).filter(Boolean).slice(0, 8)
    : [];
  const distractors = Array.isArray(value.valuable_distractors || value.valuableDistractors)
    ? (value.valuable_distractors || value.valuableDistractors).map((row) => ({
        option: clean(row?.option, 8),
        reason: clean(row?.reason, 800)
      })).filter((row) => row.option && row.reason).slice(0, 6)
    : [];
  return {
    examTarget: clean(value.exam_target || value.examTarget, 800),
    decisionAxis: clean(value.decision_axis || value.decisionAxis, 800),
    reasoningChain: reasoning,
    correctOptionReason: clean(value.correct_option_reason || value.correctOptionReason, 1200),
    commonFailureNode: clean(value.common_failure_node || value.commonFailureNode, 800),
    transferRule: clean(value.transfer_rule || value.transferRule, 1000),
    valuableDistractors: distractors
  };
}

export function normalizeXizongInlinePracticeQuestions(input, context = 'PRACTICE_SET') {
  const rows = Array.isArray(input) ? input : [];
  if (rows.length > 2) fail('INLINE_QUESTION_COUNT_INVALID', context);
  const seen = new Set();
  return rows.map((raw, index) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail('INLINE_QUESTION_INVALID', context + ':' + index);
    const questionId = clean(raw.question_id || raw.questionId, 180);
    if (!/^xizong-ai-probe:[A-Za-z0-9._:-]{8,160}$/.test(questionId)) {
      fail('INLINE_QUESTION_ID_INVALID', context + ':' + index);
    }
    if (seen.has(questionId)) fail('INLINE_QUESTION_ID_DUPLICATE', questionId);
    seen.add(questionId);
    const sourceKind = clean(raw.source_kind || raw.sourceKind, 40).toUpperCase();
    if (sourceKind !== 'AI_TRANSFER_PROBE') fail('INLINE_QUESTION_SOURCE_INVALID', questionId);
    const probeKind = clean(raw.probe_kind || raw.probeKind, 40).toUpperCase();
    if (!AI_PROBE_KINDS.has(probeKind)) fail('INLINE_QUESTION_PROBE_KIND_INVALID', questionId);
    const questionType = clean(raw.question_type || raw.questionType || 'A', 8).toUpperCase();
    if (!AI_PROBE_TYPES.has(questionType)) fail('INLINE_QUESTION_TYPE_INVALID', questionId);
    const stem = clean(raw.stem, 2400);
    if (!stem) fail('INLINE_QUESTION_STEM_REQUIRED', questionId);
    const rawOptions = Array.isArray(raw.options)
      ? raw.options
      : raw.options && typeof raw.options === 'object'
        ? Object.entries(raw.options).map(([label, textValue]) => ({ label, text: textValue }))
        : [];
    const options = rawOptions.map((row) => ({
      label: clean(row?.label, 4).toUpperCase(),
      text: clean(row?.text, 1200)
    })).filter((row) => row.label && row.text);
    if (options.length < 2 || options.length > 5) fail('INLINE_QUESTION_OPTIONS_INVALID', questionId);
    if (new Set(options.map((row) => row.label)).size !== options.length) fail('INLINE_QUESTION_OPTION_DUPLICATE', questionId);
    const optionLabels = new Set(options.map((row) => row.label));
    const correctAnswer = clean(raw.correct_answer || raw.correctAnswer, 12).toUpperCase();
    const correctLabels = [...new Set(correctAnswer.match(/[A-Z]/g) || [])];
    if (!correctLabels.length || correctLabels.some((label) => !optionLabels.has(label))) {
      fail('INLINE_QUESTION_ANSWER_INVALID', questionId);
    }
    if (questionType === 'A' && correctLabels.length !== 1) fail('INLINE_QUESTION_SINGLE_ANSWER_REQUIRED', questionId);
    const targetKpIds = [...new Set((Array.isArray(raw.target_kp_ids || raw.targetKpIds)
      ? (raw.target_kp_ids || raw.targetKpIds)
      : []).map((id) => clean(id, 200)).filter(Boolean))];
    if (!targetKpIds.length || targetKpIds.length > 8) fail('INLINE_QUESTION_TARGET_REQUIRED', questionId);
    const canonicalSourceHash = clean(raw.canonical_source_hash || raw.canonicalSourceHash, 180);
    if (!canonicalSourceHash) fail('INLINE_QUESTION_SOURCE_HASH_REQUIRED', questionId);
    const explanation = cleanExplanation(raw.explanation);
    if (!explanation.examTarget) fail('INLINE_QUESTION_EXAM_TARGET_REQUIRED', questionId);
    if (!explanation.decisionAxis) fail('INLINE_QUESTION_DECISION_AXIS_REQUIRED', questionId);
    if (!explanation.correctOptionReason) fail('INLINE_QUESTION_CORRECT_REASON_REQUIRED', questionId);
    if (!explanation.commonFailureNode) fail('INLINE_QUESTION_FAILURE_NODE_REQUIRED', questionId);
    if (!explanation.transferRule) fail('INLINE_QUESTION_TRANSFER_RULE_REQUIRED', questionId);
    if (explanation.reasoningChain.length < 2) fail('INLINE_QUESTION_REASONING_CHAIN_TOO_THIN', questionId);
    if (!explanation.valuableDistractors.length) fail('INLINE_QUESTION_DISTRACTOR_MECHANISM_REQUIRED', questionId);
    for (const distractor of explanation.valuableDistractors) {
      if (!optionLabels.has(distractor.option) || correctLabels.includes(distractor.option)) {
        fail('INLINE_QUESTION_DISTRACTOR_BINDING_INVALID', questionId);
      }
    }

    return {
      questionId,
      sourceKind: 'AI_TRANSFER_PROBE',
      scoringRole: 'TRANSFER_ONLY',
      qualityGate: 'TARGET+DECISION_AXIS+FAILURE+TRANSFER+DISTRACTOR',
      probeKind,
      year: 'AI',
      number: index + 1,
      questionType,
      stem,
      options,
      correctAnswer: correctLabels.join(''),
      explanation,
      relation: null,
      targetKpIds,
      canonicalSourceHash
    };
  });
}

function memoryTarget(raw, stepId, index) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    fail('MEMORY_TARGET_INVALID', stepId + ':' + index);
  }
  const cardId = clean(raw.card_id || raw.cardId, 240);
  const sourceHash = clean(raw.source_hash || raw.sourceHash, 180);
  const blockId = clean(raw.block_id || raw.blockId, 200);
  if (!cardId || !blockId || !sourceHash) fail('MEMORY_TARGET_IDENTITY_REQUIRED', stepId + ':' + index);
  return { card_id: cardId, block_id: blockId, source_hash: sourceHash };
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
    if (new Set(rawQuestionIds).size !== rawQuestionIds.length) fail('PRACTICE_IDS_DUPLICATE', stepId);
    if (rawQuestionIds.some((id) => !/^xizong-official-\d{4}-n\d{3}$/.test(id))) {
      fail('PRACTICE_ID_INVALID', stepId);
    }
    const inlineQuestions = normalizeXizongInlinePracticeQuestions(raw.inline_questions || raw.inlineQuestions, stepId);
    if (!rawQuestionIds.length && !inlineQuestions.length) fail('PRACTICE_ITEMS_REQUIRED', stepId);
    if (rawQuestionIds.length + inlineQuestions.length > 20) fail('PRACTICE_ITEM_COUNT_INVALID', stepId);
    return {
      ...base,
      question_ids: rawQuestionIds,
      inline_questions: inlineQuestions,
      study_phase: ['FIRST_PASS','SECOND_PASS','LATE_REVIEW'].includes(String(raw.study_phase || ''))
        ? String(raw.study_phase)
        : 'SECOND_PASS',
      speed: ['normal','fast'].includes(String(raw.speed || '')) ? String(raw.speed) : 'normal',
      allow_holdout: raw.allow_holdout === true
    };
  }

  if (kind === 'SYSTEM_RECALL') {
    const systemId = clean(raw.system_id || raw.systemId, 160);
    if (!systemId || !/^[A-Za-z0-9._-]+$/.test(systemId)) fail('SYSTEM_ID_INVALID', stepId);
    return { ...base, system_id: systemId };
  }

  if (kind === 'REPAIR_TASK') {
    const taskId = clean(raw.task_id || raw.taskId, 240);
    const createdAt = clean(raw.created_at || raw.createdAt, 80);
    const blockId = clean(raw.block_id || raw.blockId, 200);
    const kpId = clean(raw.kp_id || raw.kpId, 200);
    if (!taskId || !createdAt || Number.isNaN(Date.parse(createdAt))) fail('REPAIR_TARGET_IDENTITY_REQUIRED', stepId);
    return {
      ...base,
      task_id: taskId,
      created_at: new Date(createdAt).toISOString(),
      block_id: blockId || null,
      kp_id: kpId || null
    };
  }

  if (kind === 'BLOCK_RETURN') {
    const systemId = clean(raw.system_id || raw.systemId, 160);
    const blockId = clean(raw.block_id || raw.blockId, 200);
    const blockSlug = clean(raw.block_slug || raw.blockSlug, 160);
    const sourceHash = clean(raw.source_hash || raw.sourceHash, 180);
    if (!systemId || !/^[A-Za-z0-9._-]+$/.test(systemId)) fail('BLOCK_RETURN_SYSTEM_INVALID', stepId);
    if (!blockId || !blockSlug || !/^[A-Za-z0-9._-]+$/.test(blockSlug) || !sourceHash) {
      fail('BLOCK_RETURN_IDENTITY_REQUIRED', stepId);
    }
    return {
      ...base,
      system_id: systemId,
      block_id: blockId,
      block_slug: blockSlug,
      source_hash: sourceHash
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
  const blockReturnIndex = steps.findIndex((step) => step.kind === 'BLOCK_RETURN');
  if (blockReturnIndex >= 0 && blockReturnIndex !== steps.length - 1) {
    fail('BLOCK_RETURN_MUST_BE_TERMINAL');
  }

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
    handoff_completed_at: null,
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
    handoff_completed_at: value.handoff_completed_at && !Number.isNaN(Date.parse(value.handoff_completed_at))
      ? new Date(value.handoff_completed_at).toISOString()
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

export function validateXizongInlinePracticeQuestionBindings(
  memoryInput,
  inlineQuestions,
  context = 'PRACTICE_SET'
) {
  const memory = normalizeXizongMemoryState(memoryInput);
  for (const question of Array.isArray(inlineQuestions) ? inlineQuestions : []) {
    const expectedHash = String(question?.canonicalSourceHash || '');
    const targetKpIds = Array.isArray(question?.targetKpIds) ? question.targetKpIds : [];
    if (!expectedHash || !targetKpIds.length) {
      fail('INLINE_QUESTION_TARGET_BINDING_INVALID', context);
    }

    const sourceHashes = new Set();
    for (const kpId of targetKpIds) {
      const cards = Object.values(memory.cards || {})
        .filter((card) => String(card?.kpId || '') === String(kpId || ''));
      if (!cards.length) fail('INLINE_QUESTION_TARGET_OWNER_MISSING', String(kpId || ''));
      for (const card of cards) {
        const sourceHash = String(card?.sourceHash || '');
        if (!sourceHash) fail('INLINE_QUESTION_TARGET_SOURCE_MISSING', String(kpId || ''));
        sourceHashes.add(sourceHash);
      }
    }

    if (sourceHashes.size !== 1) {
      fail('INLINE_QUESTION_MULTI_SOURCE_TARGET_UNSUPPORTED', question.questionId);
    }
    const [currentHash] = [...sourceHashes];
    if (currentHash !== expectedHash) {
      fail('INLINE_QUESTION_SOURCE_REVISION_MISMATCH', question.questionId);
    }
  }
  return true;
}

function validateInlineQuestionTargets(memory, step) {
  return validateXizongInlinePracticeQuestionBindings(
    memory,
    step.inline_questions || [],
    step.step_id
  );
}

function validateRepairTarget(memory, step) {
  const task = (memory.repairTasks || []).find((row) => String(row?.id || '') === step.task_id);
  if (!task) fail('REPAIR_TASK_UNKNOWN', step.task_id);
  if (String(task.createdAt || '') !== step.created_at) fail('REPAIR_TASK_REVISION_MISMATCH', step.task_id);
  if (step.block_id && String(task.blockId || '') !== step.block_id) fail('REPAIR_TASK_BLOCK_MISMATCH', step.task_id);
  if (step.kp_id && String(task.kpId || '') !== step.kp_id) fail('REPAIR_TASK_KP_MISMATCH', step.task_id);
  if (String(task.status || 'ACTIVE') === 'DONE') fail('REPAIR_TASK_ALREADY_DONE', step.task_id);
  return task;
}

function validateMemoryTargets(memory, step) {
  for (const target of step.targets) {
    const card = memory.cards?.[target.card_id];
    if (!card) fail('MEMORY_CARD_UNKNOWN', target.card_id);
    if (String(card.blockId || '') !== target.block_id) {
      fail('MEMORY_BLOCK_MISMATCH', target.card_id);
    }
    const releasedBlock = memory.releasedBlocks?.[target.block_id];
    if (!releasedBlock) fail('MEMORY_RELEASE_OWNER_MISSING', target.block_id);
    if (String(releasedBlock.sourceHash || '') !== target.source_hash) {
      fail('MEMORY_SOURCE_REVISION_MISMATCH', target.card_id);
    }
  }
}

function cleanupSupersededSession(storage, priorInstruction, priorRuntime) {
  const writes = [];
  const current = priorInstruction.steps[priorRuntime.current_step] || null;

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
    if (step.kind === 'PRACTICE_SET') validateInlineQuestionTargets(memory, step);
    if (step.kind === 'REPAIR_TASK') validateRepairTarget(memory, step);
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
    validateMemoryTargets(memory, step);
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
    const history = Array.isArray(sweep?.attemptHistory) ? sweep.attemptHistory : [];
    const ids = [
      ...(step.question_ids || []),
      ...(step.inline_questions || []).map((row) => row.questionId)
    ];
    return ids.every((id) =>
      Boolean(sweep?.results?.[id])
      || history.some((row) => row?.type === 'QUESTION_ATTEMPT' && row?.question_id === id)
    );
  }

  if (step.kind === 'SYSTEM_RECALL') {
    const state = parseJson(storage, 'kianos:xizong:system-recall:' + step.system_id + ':v1', null);
    const history = Array.isArray(state?.history) ? state.history : [];
    const activatedAt = Date.parse(runtime.activated_at);
    return history.some((row) =>
      Number.isFinite(Date.parse(row?.completed_at))
      && Date.parse(row.completed_at) >= activatedAt
    );
  }

  if (step.kind === 'REPAIR_TASK') {
    const memory = normalizeXizongMemoryState(parseJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
    const task = (memory.repairTasks || []).find((row) => String(row?.id || '') === step.task_id);
    if (!task) fail('REPAIR_TASK_UNKNOWN', step.task_id);
    if (String(task.createdAt || '') !== step.created_at) fail('REPAIR_TASK_REVISION_MISMATCH', step.task_id);
    const completedAt = Date.parse(task.completedAt || '');
    return String(task.status || '') === 'DONE'
      && Number.isFinite(completedAt)
      && completedAt >= Date.parse(runtime.activated_at);
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
  if (step.kind === 'PRACTICE_SET') {
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
    handoff_completed_at: null,
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
  const nextRuntime = { ...runtime, activated_at: activatedAt, handoff_completed_at: null };
  const writes = [];

  if (step.kind === 'MEMORY_REVIEW') {
    const memory = normalizeXizongMemoryState(parseJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
    validateMemoryTargets(memory, step);
    // Chat selection is session-local execution state, not durable weakness/attention.
    // The Memory page reads exact targets from the active Session instruction.
  }

  if (step.kind === 'REPAIR_TASK') {
    const memory = normalizeXizongMemoryState(parseJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
    validateRepairTarget(memory, step);
  }

  if (step.kind === 'PRACTICE_SET') {
    const memory = normalizeXizongMemoryState(parseJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
    validateInlineQuestionTargets(memory, step);
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
      question_ids: step.question_ids,
      inline_questions: step.inline_questions || []
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

export function acknowledgeXizongBlockReturn(storage, {
  sessionId,
  stepId,
  systemId,
  blockId,
  blockSlug,
  sourceHash,
  now = Date.now()
} = {}) {
  const { instruction, runtime } = readPair(storage);
  if (!instruction || !runtime || runtime.status === 'COMPLETE') return { status:'missing' };
  const step = instruction.steps[runtime.current_step];
  if (step?.kind !== 'BLOCK_RETURN') fail('BLOCK_RETURN_NOT_ACTIVE');
  if (instruction.session_id !== String(sessionId || '') || step.step_id !== String(stepId || '')) {
    fail('BLOCK_RETURN_SESSION_MISMATCH');
  }
  if (step.system_id !== String(systemId || '')
      || step.block_id !== String(blockId || '')
      || step.block_slug !== String(blockSlug || '')
      || step.source_hash !== String(sourceHash || '')) {
    fail('BLOCK_RETURN_TARGET_MISMATCH');
  }
  if (!runtime.activated_at) fail('BLOCK_RETURN_NOT_ACTIVATED');
  const completedAt = new Date(now).toISOString();
  const nextRuntime = {
    ...runtime,
    current_step: instruction.steps.length,
    handoff_completed_at: completedAt,
    status: 'COMPLETE'
  };
  writeAtomically(storage, [[XIZONG_SESSION_RUNTIME_KEY, nextRuntime]]);
  return { status:'complete', completed_at:completedAt };
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
    const memory = normalizeXizongMemoryState(parseJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
    validateMemoryTargets(memory, step);
    return { index: runtime.current_step, step, href: '/xizong/memory/' + suffix, active: Boolean(runtime.activated_at) };
  }
  if (step.kind === 'PRACTICE_SET') {
    return { index: runtime.current_step, step, href: '/xizong/practice/chat-set/' + suffix, active: Boolean(runtime.activated_at) };
  }
  if (step.kind === 'SYSTEM_RECALL') {
    return {
      index: runtime.current_step,
      step,
      href: '/xizong/' + encodeURIComponent(step.system_id) + '/recall/' + suffix,
      active: Boolean(runtime.activated_at)
    };
  }
  if (step.kind === 'REPAIR_TASK') {
    const memory = normalizeXizongMemoryState(parseJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
    validateRepairTarget(memory, step);
    return {
      index: runtime.current_step,
      step,
      href: '/xizong/memory/' + suffix + '&repair=' + encodeURIComponent(step.task_id),
      active: Boolean(runtime.activated_at)
    };
  }
  if (step.kind === 'BLOCK_RETURN') {
    return {
      index: runtime.current_step,
      step,
      href: '/xizong/' + encodeURIComponent(step.system_id) + '/' + encodeURIComponent(step.block_slug) + '/' + suffix,
      active: Boolean(runtime.activated_at),
      terminal: true
    };
  }
  return null;
}
