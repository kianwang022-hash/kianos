export const POLITICS_SESSION_KEYS = Object.freeze({
  instruction: 'kianos-politics-session-instruction-v1',
  evidence: 'kianos-politics-session-evidence-v1',
  runtime: 'kianos-politics-session-runtime-v1'
});

export const POLITICS_SESSION_PHASES = Object.freeze([
  'FIRST_ROUND',
  'CONSOLIDATION',
  'ANALYSIS_OUTPUT',
  'MOCK_FINAL'
]);

export const POLITICS_SESSION_RECIPES = Object.freeze([
  'RECONSTRUCT',
  'TARGETED_RECALL',
  'PRECISION',
  'QUESTION_RETEST',
  'SOURCE_REPAIR',
  'CHAT_REPAIR_RETURN',
  'CLOSE'
]);

const PHASES = new Set(POLITICS_SESSION_PHASES);
const RECIPES = new Set(POLITICS_SESSION_RECIPES);
const STRATEGY_KEYS = new Set([
  'priority',
  'importance',
  'score',
  'due',
  'mastery',
  'mastery_claim',
  'recommended_next',
  'recommendation',
  'weakness_score',
  'review_priority'
]);

const plain = (value) => value && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' ? value.trim() : '';
const stringList = (value, label) => {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error(`POLITICS_SESSION_${label}_NOT_ARRAY`);
  const rows = value.map(text);
  if (rows.some((row) => !row)) throw new Error(`POLITICS_SESSION_${label}_EMPTY_ITEM`);
  if (new Set(rows).size !== rows.length) throw new Error(`POLITICS_SESSION_${label}_DUPLICATE`);
  return rows;
};
const noStrategyFields = (object, label) => {
  for (const key of Object.keys(object || {})) {
    if (STRATEGY_KEYS.has(key)) throw new Error(`POLITICS_SESSION_STRATEGY_FIELD_FORBIDDEN:${label}:${key}`);
  }
};

function normalizeStep(step, index) {
  if (!plain(step)) throw new Error(`POLITICS_SESSION_STEP_NOT_OBJECT:${index}`);
  noStrategyFields(step, `STEP_${index}`);

  const stepId = text(step.step_id || step.action_id);
  const recipeType = text(step.recipe_type || step.type).toUpperCase();
  if (!stepId) throw new Error(`POLITICS_SESSION_STEP_ID_MISSING:${index}`);
  if (!RECIPES.has(recipeType)) throw new Error(`POLITICS_SESSION_RECIPE_INVALID:${stepId}:${recipeType || 'MISSING'}`);

  const targetRefs = stringList(
    step.target_refs
      ?? step.targetRefs
      ?? step.targets
      ?? step.current_refs
      ?? step.content_refs
      ?? [],
    'TARGET_REFS'
  );
  const questionIds = stringList(step.question_ids ?? step.questionIds ?? [], 'QUESTION_IDS');
  const guardEvidenceRefs = stringList(
    step.guard_evidence_refs
      ?? step.guardEvidenceRefs
      ?? step.target_guard_evidence_refs
      ?? [],
    'GUARD_REFS'
  );
  const prompt = text(step.learner_prompt ?? step.prompt);
  const sourceHref = text(step.source_href ?? step.sourceHref);
  if (sourceHref && !sourceHref.startsWith('/') && !/^https?:\/\//i.test(sourceHref)) {
    throw new Error(`POLITICS_SESSION_SOURCE_HREF_INVALID:${stepId}`);
  }

  if (['RECONSTRUCT', 'TARGETED_RECALL'].includes(recipeType) && !targetRefs.length) {
    throw new Error(`POLITICS_SESSION_TARGET_REQUIRED:${stepId}`);
  }
  if (recipeType === 'RECONSTRUCT' && !prompt) {
    throw new Error(`POLITICS_SESSION_PROMPT_REQUIRED:${stepId}`);
  }
  if (recipeType === 'PRECISION' && (!targetRefs.length || !guardEvidenceRefs.length)) {
    throw new Error(`POLITICS_SESSION_PRECISION_GUARD_REQUIRED:${stepId}`);
  }
  if (recipeType === 'QUESTION_RETEST' && !questionIds.length) {
    throw new Error(`POLITICS_SESSION_QUESTION_IDS_REQUIRED:${stepId}`);
  }
  if (recipeType === 'SOURCE_REPAIR' && !targetRefs.length && !sourceHref) {
    throw new Error(`POLITICS_SESSION_SOURCE_TARGET_REQUIRED:${stepId}`);
  }
  if (recipeType === 'CHAT_REPAIR_RETURN' && !targetRefs.length && !questionIds.length) {
    throw new Error(`POLITICS_SESSION_CHAT_RETURN_CONTEXT_REQUIRED:${stepId}`);
  }
  if (recipeType === 'CLOSE' && (targetRefs.length || questionIds.length)) {
    throw new Error(`POLITICS_SESSION_CLOSE_MUST_BE_EMPTY:${stepId}`);
  }

  const timerSeconds = step.timer_seconds == null ? null : Number(step.timer_seconds);
  if (timerSeconds != null && (!Number.isFinite(timerSeconds) || timerSeconds <= 0 || timerSeconds > 14400)) {
    throw new Error(`POLITICS_SESSION_TIMER_INVALID:${stepId}`);
  }

  return {
    step_id: stepId,
    recipe_type: recipeType,
    target_refs: targetRefs,
    question_ids: questionIds,
    learner_prompt: prompt || null,
    guard_evidence_refs: guardEvidenceRefs,
    source_href: sourceHref || null,
    timer_seconds: timerSeconds
  };
}

export function validatePoliticsSessionInstruction(input, { targetRefs = null, questionIds = null } = {}) {
  if (!plain(input)) throw new Error('POLITICS_SESSION_INSTRUCTION_NOT_OBJECT');
  noStrategyFields(input, 'INSTRUCTION');

  const schema = text(input.schema);
  if (schema !== 'kianos.politics.session-instruction.v1') {
    throw new Error(`POLITICS_SESSION_SCHEMA_INVALID:${schema || 'MISSING'}`);
  }

  const sessionId = text(input.session_id);
  const subjectId = text(input.subject_id);
  const phase = text(input.phase).toUpperCase();
  const anchorRef = text(input.anchor_ref);
  if (!sessionId) throw new Error('POLITICS_SESSION_ID_MISSING');
  if (!subjectId) throw new Error('POLITICS_SESSION_SUBJECT_MISSING');
  if (!PHASES.has(phase)) throw new Error(`POLITICS_SESSION_PHASE_INVALID:${phase || 'MISSING'}`);
  if (!anchorRef) throw new Error('POLITICS_SESSION_ANCHOR_MISSING');
  if (!Array.isArray(input.steps) || !input.steps.length) throw new Error('POLITICS_SESSION_STEPS_EMPTY');

  const steps = input.steps.map(normalizeStep);
  if (new Set(steps.map((step) => step.step_id)).size !== steps.length) {
    throw new Error('POLITICS_SESSION_STEP_ID_DUPLICATE');
  }

  if (targetRefs) {
    const allowed = targetRefs instanceof Set ? targetRefs : new Set(targetRefs);
    for (const step of steps) {
      for (const ref of step.target_refs) {
        if (!allowed.has(ref)) throw new Error(`POLITICS_SESSION_TARGET_UNRESOLVED:${step.step_id}:${ref}`);
      }
    }
  }
  if (questionIds) {
    const allowed = questionIds instanceof Set ? questionIds : new Set(questionIds);
    for (const step of steps) {
      for (const id of step.question_ids) {
        if (!allowed.has(id)) throw new Error(`POLITICS_SESSION_QUESTION_UNRESOLVED:${step.step_id}:${id}`);
      }
    }
  }

  const returnPolicy = plain(input.return_policy) ? {
    on_complete: text(input.return_policy.on_complete) || 'CHAT',
    on_interrupt: text(input.return_policy.on_interrupt) || 'RESUME'
  } : { on_complete: 'CHAT', on_interrupt: 'RESUME' };

  return {
    schema: 'kianos.politics.session-instruction.v1',
    session_id: sessionId,
    subject_id: subjectId,
    phase,
    anchor_ref: anchorRef,
    steps,
    return_policy: returnPolicy
  };
}

export function normalizePoliticsSessionInstruction(input, options = {}) {
  if (input?.schema === 'kianos.politics.session-instruction.v1') {
    return validatePoliticsSessionInstruction(input, options);
  }
  if (input?.schema !== 'kianos.politics.consolidation_plan.v1') {
    throw new Error(`POLITICS_SESSION_SCHEMA_INVALID:${text(input?.schema) || 'MISSING'}`);
  }

  const scope = plain(input.scope) ? input.scope : {};
  const normalized = {
    schema: 'kianos.politics.session-instruction.v1',
    session_id: text(input.session_id) || `consolidation-${Date.now()}`,
    subject_id: text(scope.subject_id || input.subject_id),
    phase: 'CONSOLIDATION',
    anchor_ref: text(scope.anchor_ref || input.anchor_ref),
    steps: (Array.isArray(input.actions) ? input.actions : []).map((action) => ({
      ...action,
      step_id: action?.step_id || action?.action_id,
      recipe_type: action?.recipe_type || action?.type,
      learner_prompt: action?.learner_prompt || action?.prompt
    })),
    return_policy: input.return_policy || { on_complete: 'CHAT', on_interrupt: 'RESUME' }
  };
  return validatePoliticsSessionInstruction(normalized, options);
}

export function emptyPoliticsSessionEvidence(instruction) {
  return {
    schema: 'kianos.politics.session-evidence.v1',
    session_id: instruction.session_id,
    subject_id: instruction.subject_id,
    phase: instruction.phase,
    anchor_ref: instruction.anchor_ref,
    events: [],
    resume: {
      step_index: 0,
      step_id: instruction.steps[0]?.step_id || null,
      status: 'ACTIVE'
    }
  };
}

export function validatePoliticsSessionEvidence(input, instruction) {
  if (!plain(input) || input.schema !== 'kianos.politics.session-evidence.v1') {
    throw new Error('POLITICS_SESSION_EVIDENCE_SCHEMA_INVALID');
  }
  if (input.session_id !== instruction.session_id) throw new Error('POLITICS_SESSION_EVIDENCE_SESSION_MISMATCH');
  if (!Array.isArray(input.events)) throw new Error('POLITICS_SESSION_EVIDENCE_EVENTS_INVALID');
  return input;
}

export function appendPoliticsSessionEvidence(store, instruction, event, resume = null) {
  const current = store
    ? validatePoliticsSessionEvidence(store, instruction)
    : emptyPoliticsSessionEvidence(instruction);
  const nextEvent = {
    event_id: text(event?.event_id) || `${instruction.session_id}:${text(event?.step_id)}:${Date.now()}`,
    step_id: text(event?.step_id),
    recipe_type: text(event?.recipe_type),
    target_refs: stringList(event?.target_refs || [], 'EVIDENCE_TARGET_REFS'),
    question_ids: stringList(event?.question_ids || [], 'EVIDENCE_QUESTION_IDS'),
    response: event?.response == null ? null : String(event.response),
    deterministic_result: plain(event?.deterministic_result) ? JSON.parse(JSON.stringify(event.deterministic_result)) : null,
    mark: event?.mark == null ? null : text(event.mark).toUpperCase(),
    revealed: Boolean(event?.revealed),
    elapsed_ms: Number.isFinite(event?.elapsed_ms) ? Math.max(0, Math.round(event.elapsed_ms)) : null,
    blocked_reason: event?.blocked_reason == null ? null : String(event.blocked_reason),
    observed_at: text(event?.observed_at) || new Date().toISOString()
  };
  if (!nextEvent.step_id || !nextEvent.recipe_type) throw new Error('POLITICS_SESSION_EVIDENCE_IDENTITY_MISSING');
  if (nextEvent.mark && !['STABLE', 'UNCERTAIN', 'WRONG', 'SKIPPED'].includes(nextEvent.mark)) {
    throw new Error(`POLITICS_SESSION_EVIDENCE_MARK_INVALID:${nextEvent.mark}`);
  }

  return {
    ...current,
    events: [...current.events, nextEvent],
    resume: resume || current.resume
  };
}
