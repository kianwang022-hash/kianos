export const WRITING_RUNTIME_VERSION = 1;
export const WRITING_RUNTIME_SCHEMA = 'kianos.english.writing.runtime.v1';
export const WRITING_REVIEW_PACKET_SCHEMA = 'kianos.english.writing.review-packet.v1';
export const WRITING_REVIEW_RETURN_SCHEMA = 'kianos.english.writing.review-return.v1';
export const WRITING_REPAIR_PACKET_SCHEMA = 'kianos.english.writing.repair-check-packet.v1';
export const WRITING_REPAIR_RETURN_SCHEMA = 'kianos.english.writing.repair-return.v1';

export const WRITING_FAILURE_LAYERS = Object.freeze([
  'Task',
  'Content',
  'Structure',
  'Language',
  'Error-Register',
  'Timed Execution'
]);

export const WRITING_STATES = Object.freeze({
  ATTEMPT: 'ATTEMPT',
  REVIEW_PENDING: 'REVIEW_PENDING',
  PASS_ACCEPTABLE: 'PASS_ACCEPTABLE',
  REPAIR_NEEDED: 'REPAIR_NEEDED',
  REPAIR_CHECK_PENDING: 'REPAIR_CHECK_PENDING',
  REPAIR_COMPLETE: 'REPAIR_COMPLETE',
  TRANSFER_PENDING: 'TRANSFER_PENDING'
});

export const WRITING_REPAIR_CONTINUATIONS = Object.freeze({
  ROOT_NOT_YET_REPAIRED: 'ROOT_NOT_YET_REPAIRED',
  INDEPENDENT_DOWNSTREAM: 'INDEPENDENT_DOWNSTREAM'
});

function clean(value) {
  return String(value ?? '').trim();
}

function nonEmpty(value) {
  return clean(value).length > 0;
}

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function nowIso(now) {
  if (typeof now === 'string' && now) return now;
  if (now instanceof Date) return now.toISOString();
  return new Date().toISOString();
}

function sourceKindOf(task) {
  return clean(task?.sourceKind || task?.source_kind);
}

function learnerTaskOf(task) {
  return task?.learnerTask || task?.task || {};
}

function assertTask(task) {
  if (!task || typeof task !== 'object' || !nonEmpty(task.id) || !nonEmpty(task.kind)) {
    throw new Error('WRITING_RUNTIME_INVALID_TASK');
  }
  if (!['small', 'big'].includes(task.kind)) throw new Error(`WRITING_RUNTIME_INVALID_KIND:${task.kind}`);
  if (!['synthetic', 'exam'].includes(sourceKindOf(task))) {
    throw new Error(`WRITING_RUNTIME_INVALID_SOURCE_KIND:${sourceKindOf(task) || 'missing'}`);
  }
}

export function createInitialWritingRecord(task, history = [], now) {
  assertTask(task);
  const at = nowIso(now);
  return {
    version: WRITING_RUNTIME_VERSION,
    schema: WRITING_RUNTIME_SCHEMA,
    taskId: task.id,
    taskKind: task.kind,
    sourceKind: sourceKindOf(task),
    state: WRITING_STATES.ATTEMPT,
    planMode: 'direct',
    draftPlan: '',
    draftEssay: '',
    firstPlan: '',
    firstDraft: '',
    firstSubmittedAt: '',
    reviewReturn: null,
    regenerationDraft: '',
    regeneration: '',
    repairReturn: null,
    repairHistory: [],
    transferCandidate: null,
    completedAt: '',
    history: Array.isArray(history) ? history : [],
    createdAt: at,
    updatedAt: at
  };
}

export function normalizeWritingRecord(task, saved = null, now) {
  assertTask(task);
  const preservedHistory = Array.isArray(saved?.history) ? saved.history : [];
  if (saved && (Number(saved.version) !== WRITING_RUNTIME_VERSION || saved.taskId !== task.id)) throw new Error('WRITING_SCHEMA_OR_TASK_MISMATCH_PRESERVE_DATA');
  if (!saved || Number(saved?.version) !== WRITING_RUNTIME_VERSION || saved?.taskId !== task.id) {
    return createInitialWritingRecord(task, preservedHistory, now);
  }
  const next = {
    ...createInitialWritingRecord(task, preservedHistory, saved.createdAt || now),
    ...saved,
    history: preservedHistory,
    repairHistory: Array.isArray(saved?.repairHistory) ? saved.repairHistory : []
  };
  if (!Object.values(WRITING_STATES).includes(next.state)) throw new Error('WRITING_STATE_INVALID_PRESERVE_DATA');
  if (!['planned', 'direct'].includes(next.planMode)) next.planMode = 'direct';
  if (!nonEmpty(next.firstDraft) && next.state !== WRITING_STATES.ATTEMPT) {
    throw new Error('WRITING_FIRST_DRAFT_MISSING_PRESERVE_DATA');
  }
  return next;
}

export function lockFirstAttempt(record, input = {}, now) {
  if (!record || record.state !== WRITING_STATES.ATTEMPT) {
    throw new Error(`WRITING_FIRST_ATTEMPT_NOT_EDITABLE:${record?.state || 'missing'}`);
  }
  const planMode = input.planMode === 'direct' ? 'direct' : 'planned';
  const firstPlan = clean(input.firstPlan);
  const firstDraft = clean(input.firstDraft);
  if (planMode === 'planned' && !firstPlan) throw new Error('WRITING_FIRST_PLAN_REQUIRED_OR_USE_DIRECT_MODE');
  if (!firstDraft) throw new Error('WRITING_FIRST_DRAFT_REQUIRED');
  const next = clone(record);
  next.planMode = planMode;
  next.firstPlan = firstPlan;
  next.firstDraft = firstDraft;
  next.draftPlan = firstPlan;
  next.draftEssay = firstDraft;
  next.firstSubmittedAt = nowIso(now);
  next.state = WRITING_STATES.REVIEW_PENDING;
  next.reviewReturn = null;
  next.regenerationDraft = '';
  next.regeneration = '';
  next.repairReturn = null;
  next.transferCandidate = null;
  next.updatedAt = nowIso(now);
  return next;
}

export function buildWritingReviewPacket(task, record) {
  assertTask(task);
  if (!record || record.taskId !== task.id || record.state !== WRITING_STATES.REVIEW_PENDING) {
    throw new Error(`WRITING_REVIEW_PACKET_INVALID_STATE:${record?.state || 'missing'}`);
  }
  if (!nonEmpty(record.firstDraft)) throw new Error('WRITING_REVIEW_PACKET_MISSING_FIRST_DRAFT');
  if (record.planMode === 'planned' && !nonEmpty(record.firstPlan)) throw new Error('WRITING_REVIEW_PACKET_MISSING_FIRST_PLAN');
  return {
    schema: WRITING_REVIEW_PACKET_SCHEMA,
    taskId: task.id,
    taskKind: task.kind,
    sourceKind: sourceKindOf(task),
    task: learnerTaskOf(task),
    firstMeaningfulPlanning: {
      mode: record.planMode,
      text: record.planMode === 'planned' ? record.firstPlan : null
    },
    firstDraft: record.firstDraft,
    attemptEvidence: clone(record.firstEvidenceMeta || record.binding || null),
    attemptSubmittedAt: record.firstSubmittedAt,
    sourceHash: task.sourceHash,
    reviewContract: {
      learnerUnit: 'one complete essay',
      judgeWholeEssayFirst: true,
      acceptableWorkCanPassWithoutRepair: true,
      noCosmeticRepairDebt: true,
      noModelEssayBeforeJudgment: true,
      cascadeRule: 'Choose the earliest meaningful failure sufficient to explain important downstream effects. Do not create downstream repair debt unless it remains independently after the upstream repair.',
      ifRepairNeeded: 'Return one first failure layer, the smallest affected scope that must be regenerated, and one concise repair cue/action. Do not rewrite the learner essay.',
      allowedFirstFailureLayers: WRITING_FAILURE_LAYERS,
      returnSchema: {
        schema: WRITING_REVIEW_RETURN_SCHEMA,
        taskId: task.id,
        reviewOf: 'FIRST_DRAFT',
        attemptSubmittedAt: record.firstSubmittedAt,
        sourceHash: task.sourceHash,
        verdict: 'PASS_ACCEPTABLE | REPAIR_NEEDED',
        firstFailureLayer: 'null on PASS; otherwise one allowed layer',
        repairScope: 'null on PASS; otherwise the smallest scope that must be regenerated',
        smallestRepair: 'null on PASS; otherwise a concise cue/action, not replacement prose',
        reason: 'brief whole-essay rationale'
      }
    }
  };
}

function parseJsonInput(input) {
  if (input && typeof input === 'object') return input;
  if (!nonEmpty(input)) throw new Error('WRITING_RETURN_EMPTY');
  const raw = String(input);
  try {
    return JSON.parse(raw);
  } catch {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      try { return JSON.parse(fenced[1]); } catch {}
    }
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { return JSON.parse(raw.slice(start, end + 1)); } catch {}
    }
    throw new Error('WRITING_RETURN_INVALID_JSON');
  }
}

export function validateWritingReviewReturn(input, taskId) {
  const value = parseJsonInput(input);
  if (value?.schema !== WRITING_REVIEW_RETURN_SCHEMA) throw new Error(`WRITING_REVIEW_RETURN_SCHEMA:${value?.schema || 'missing'}`);
  if (clean(value?.taskId) !== clean(taskId)) throw new Error(`WRITING_REVIEW_RETURN_TASK_MISMATCH:${value?.taskId || 'missing'}`);
  if (value?.reviewOf !== 'FIRST_DRAFT') throw new Error(`WRITING_REVIEW_RETURN_REVIEW_OF:${value?.reviewOf || 'missing'}`);
  if (!['PASS_ACCEPTABLE', 'REPAIR_NEEDED'].includes(value?.verdict)) throw new Error(`WRITING_REVIEW_RETURN_VERDICT:${value?.verdict || 'missing'}`);
  if (!nonEmpty(value?.reason)) throw new Error('WRITING_REVIEW_RETURN_REASON_REQUIRED');
  if(value.lexicalThreads!=null&&!Array.isArray(value.lexicalThreads))throw new Error('WRITING_LEXICAL_THREADS_INVALID');

  if (value.verdict === 'PASS_ACCEPTABLE') {
    if (nonEmpty(value?.firstFailureLayer) || nonEmpty(value?.repairScope) || nonEmpty(value?.smallestRepair)) {
      throw new Error('WRITING_PASS_HAS_REPAIR_DEBT');
    }
    return {
      schema: WRITING_REVIEW_RETURN_SCHEMA,
      taskId: clean(taskId),
      reviewOf: 'FIRST_DRAFT',
      attemptSubmittedAt: clean(value.attemptSubmittedAt),
      sourceHash:clean(value.sourceHash),
      lexicalThreads:clone(value.lexicalThreads||[]),
      verdict: 'PASS_ACCEPTABLE',
      firstFailureLayer: null,
      repairScope: null,
      smallestRepair: null,
      reason: clean(value.reason)
    };
  }

  if (!WRITING_FAILURE_LAYERS.includes(value.firstFailureLayer)) throw new Error(`WRITING_REPAIR_LAYER_INVALID:${value.firstFailureLayer || 'missing'}`);
  if (!nonEmpty(value.repairScope)) throw new Error('WRITING_REPAIR_SCOPE_REQUIRED');
  if (!nonEmpty(value.smallestRepair)) throw new Error('WRITING_SMALLEST_REPAIR_REQUIRED');
  return {
    schema: WRITING_REVIEW_RETURN_SCHEMA,
    taskId: clean(taskId),
    reviewOf: 'FIRST_DRAFT',
    attemptSubmittedAt: clean(value.attemptSubmittedAt),
      sourceHash:clean(value.sourceHash),
      lexicalThreads:clone(value.lexicalThreads||[]),
    verdict: 'REPAIR_NEEDED',
    firstFailureLayer: value.firstFailureLayer,
    repairScope: clean(value.repairScope),
    smallestRepair: clean(value.smallestRepair),
    reason: clean(value.reason)
  };
}

export function applyWritingReviewReturn(record, reviewReturn, now) {
  reviewReturn = validateWritingReviewReturn(reviewReturn, record?.taskId);
  if (!reviewReturn.attemptSubmittedAt || reviewReturn.attemptSubmittedAt !== record?.firstSubmittedAt) throw new Error('WRITING_REVIEW_STALE_ATTEMPT');
  if(!reviewReturn.sourceHash || reviewReturn.sourceHash!==record.binding?.source_hash)throw new Error('WRITING_REVIEW_SOURCE_MISMATCH');
  if (record?.reviewReturn && JSON.stringify(record.reviewReturn) === JSON.stringify(reviewReturn)) return clone(record);
  if (!record || record.state !== WRITING_STATES.REVIEW_PENDING) {
    throw new Error(`WRITING_REVIEW_IMPORT_INVALID_STATE:${record?.state || 'missing'}`);
  }
  if (record.taskId !== reviewReturn?.taskId) throw new Error('WRITING_REVIEW_IMPORT_TASK_MISMATCH');
  const next = clone(record);
  next.reviewReturn = clone(reviewReturn);
  next.updatedAt = nowIso(now);
  if (reviewReturn.verdict === 'PASS_ACCEPTABLE') {
    next.state = WRITING_STATES.PASS_ACCEPTABLE;
    next.completedAt = nowIso(now);
    next.regenerationDraft = '';
    next.regeneration = '';
    next.transferCandidate = null;
    return next;
  }
  next.state = WRITING_STATES.REPAIR_NEEDED;
  next.completedAt = '';
  next.regenerationDraft = '';
  next.regeneration = '';
  next.repairReturn = null;
  next.transferCandidate = null;
  return next;
}

export function lockWritingRegeneration(record, regeneration, now) {
  if (!record || record.state !== WRITING_STATES.REPAIR_NEEDED) {
    throw new Error(`WRITING_REGEN_INVALID_STATE:${record?.state || 'missing'}`);
  }
  if (!record.reviewReturn || record.reviewReturn.verdict !== 'REPAIR_NEEDED') throw new Error('WRITING_REGEN_MISSING_ROOT_REPAIR');
  if (!nonEmpty(regeneration)) throw new Error('WRITING_REGEN_REQUIRED');
  const next = clone(record);
  next.regenerationSubmittedAt = nowIso(now);
  next.regeneration = clean(regeneration);
  next.regenerationDraft = clean(regeneration);
  next.repairReturn = null;
  next.state = WRITING_STATES.REPAIR_CHECK_PENDING;
  next.updatedAt = nowIso(now);
  return next;
}

export function buildWritingRepairCheckPacket(task, record) {
  assertTask(task);
  if (!record || record.taskId !== task.id || record.state !== WRITING_STATES.REPAIR_CHECK_PENDING) {
    throw new Error(`WRITING_REPAIR_PACKET_INVALID_STATE:${record?.state || 'missing'}`);
  }
  if (!record.reviewReturn || !nonEmpty(record.regeneration)) throw new Error('WRITING_REPAIR_PACKET_MISSING_EVIDENCE');
  return {
    schema: WRITING_REPAIR_PACKET_SCHEMA,
    taskId: task.id,
    taskKind: task.kind,
    sourceKind: sourceKindOf(task),
    task: learnerTaskOf(task),
    firstMeaningfulPlanning: {
      mode: record.planMode,
      text: record.planMode === 'planned' ? record.firstPlan : null
    },
    firstDraft: record.firstDraft,
    attemptEvidence: clone(record.firstEvidenceMeta || record.binding || null),
    attemptSubmittedAt: record.firstSubmittedAt,
    rootDiagnosis: {
      firstFailureLayer: record.reviewReturn.firstFailureLayer,
      repairScope: record.reviewReturn.repairScope,
      smallestRepair: record.reviewReturn.smallestRepair,
      reason: record.reviewReturn.reason
    },
    learnerRegeneration: record.regeneration,
    regenerationSubmittedAt: record.regenerationSubmittedAt,
    repairCheckContract: {
      judgeOnlyTheNamedRepairFirst: true,
      samePromptSuccessIsRepairEvidenceNotTransferClosure: true,
      noAutomaticTransferDebt: true,
      memoryAdmissionRule: 'Only a reusable, high-value generation problem may be admitted. If not, return admit=false and the task ends REPAIR_COMPLETE.',
      cascadeRule: 'If the upstream repair succeeds but a later problem remains independently, it may become the next first failure. Otherwise do not manufacture downstream debt.',
      returnSchema: {
        schema: WRITING_REPAIR_RETURN_SCHEMA,
        taskId: task.id,
        repairOf: 'REGENERATION',
        attemptSubmittedAt: record.firstSubmittedAt,
        regenerationSubmittedAt: record.regenerationSubmittedAt,
        sourceHash: task.sourceHash,
        verdict: 'REPAIR_COMPLETE | REPAIR_STILL_NEEDED',
        reason: 'brief rationale',
        whenComplete: {
          memoryAdmission: '{ admit:false } OR { admit:true, targetId, label, underlyingDemand }'
        },
        whenStillNeeded: {
          continuation: `${WRITING_REPAIR_CONTINUATIONS.ROOT_NOT_YET_REPAIRED} | ${WRITING_REPAIR_CONTINUATIONS.INDEPENDENT_DOWNSTREAM}`,
          nextFailureLayer: 'one allowed layer',
          repairScope: 'smallest scope that now must be regenerated',
          smallestRepair: 'concise cue/action, not replacement prose'
        }
      }
    }
  };
}

function normalizeMemoryAdmission(value) {
  if (!value || value.admit !== true) return { admit: false };
  const targetId = clean(value.targetId || value.target_id);
  const label = clean(value.label);
  const underlyingDemand = clean(value.underlyingDemand || value.underlying_demand);
  if (!targetId || !label || !underlyingDemand) throw new Error('WRITING_MEMORY_ADMISSION_INCOMPLETE');
  return { admit: true, targetId, label, underlyingDemand };
}

export function validateWritingRepairReturn(input, record) {
  if (!record?.reviewReturn || record.reviewReturn.verdict !== 'REPAIR_NEEDED') throw new Error('WRITING_REPAIR_RETURN_MISSING_ROOT_DIAGNOSIS');
  const value = parseJsonInput(input);
  if (value?.schema !== WRITING_REPAIR_RETURN_SCHEMA) throw new Error(`WRITING_REPAIR_RETURN_SCHEMA:${value?.schema || 'missing'}`);
  if (clean(value?.taskId) !== clean(record.taskId)) throw new Error(`WRITING_REPAIR_RETURN_TASK_MISMATCH:${value?.taskId || 'missing'}`);
  if(value.attemptSubmittedAt!==record.firstSubmittedAt || value.regenerationSubmittedAt!==record.regenerationSubmittedAt)throw new Error('WRITING_REPAIR_STALE_ATTEMPT');
  if(!value.sourceHash||value.sourceHash!==record.binding?.source_hash)throw new Error('WRITING_REPAIR_SOURCE_MISMATCH');
  if (value?.repairOf !== 'REGENERATION') throw new Error(`WRITING_REPAIR_RETURN_REPAIR_OF:${value?.repairOf || 'missing'}`);
  if (!['REPAIR_COMPLETE', 'REPAIR_STILL_NEEDED'].includes(value?.verdict)) throw new Error(`WRITING_REPAIR_RETURN_VERDICT:${value?.verdict || 'missing'}`);
  if (!nonEmpty(value?.reason)) throw new Error('WRITING_REPAIR_RETURN_REASON_REQUIRED');

  if (value.verdict === 'REPAIR_COMPLETE') {
    return {
      schema: WRITING_REPAIR_RETURN_SCHEMA,
      taskId: record.taskId,
      repairOf: 'REGENERATION',
      attemptSubmittedAt:clean(value.attemptSubmittedAt),regenerationSubmittedAt:clean(value.regenerationSubmittedAt),sourceHash:clean(value.sourceHash),
      verdict: 'REPAIR_COMPLETE',
      reason: clean(value.reason),
      memoryAdmission: normalizeMemoryAdmission(value.memoryAdmission)
    };
  }

  if (!Object.values(WRITING_REPAIR_CONTINUATIONS).includes(value.continuation)) {
    throw new Error(`WRITING_REPAIR_CONTINUATION_INVALID:${value?.continuation || 'missing'}`);
  }
  if (!WRITING_FAILURE_LAYERS.includes(value.nextFailureLayer)) throw new Error(`WRITING_NEXT_FAILURE_LAYER_INVALID:${value?.nextFailureLayer || 'missing'}`);
  if (!nonEmpty(value.repairScope)) throw new Error('WRITING_NEXT_REPAIR_SCOPE_REQUIRED');
  if (!nonEmpty(value.smallestRepair)) throw new Error('WRITING_NEXT_SMALLEST_REPAIR_REQUIRED');

  const priorIndex = WRITING_FAILURE_LAYERS.indexOf(record.reviewReturn.firstFailureLayer);
  const nextIndex = WRITING_FAILURE_LAYERS.indexOf(value.nextFailureLayer);
  if (value.continuation === WRITING_REPAIR_CONTINUATIONS.ROOT_NOT_YET_REPAIRED && nextIndex !== priorIndex) {
    throw new Error('WRITING_UNREPAIRED_ROOT_LAYER_CHANGED');
  }
  if (value.continuation === WRITING_REPAIR_CONTINUATIONS.INDEPENDENT_DOWNSTREAM && nextIndex <= priorIndex) {
    throw new Error('WRITING_DOWNSTREAM_FAILURE_NOT_DOWNSTREAM');
  }

  return {
    schema: WRITING_REPAIR_RETURN_SCHEMA,
    taskId: record.taskId,
    repairOf: 'REGENERATION',
    attemptSubmittedAt:clean(value.attemptSubmittedAt),regenerationSubmittedAt:clean(value.regenerationSubmittedAt),sourceHash:clean(value.sourceHash),
    verdict: 'REPAIR_STILL_NEEDED',
    continuation: value.continuation,
    nextFailureLayer: value.nextFailureLayer,
    repairScope: clean(value.repairScope),
    smallestRepair: clean(value.smallestRepair),
    reason: clean(value.reason)
  };
}

export function applyWritingRepairReturn(record, repairReturn, now) {
  repairReturn=validateWritingRepairReturn(repairReturn,record);
  if(JSON.stringify(record.repairReturn)===JSON.stringify(repairReturn))return clone(record);
  if (!record || record.state !== WRITING_STATES.REPAIR_CHECK_PENDING) {
    throw new Error(`WRITING_REPAIR_IMPORT_INVALID_STATE:${record?.state || 'missing'}`);
  }
  if (record.taskId !== repairReturn?.taskId) throw new Error('WRITING_REPAIR_IMPORT_TASK_MISMATCH');
  const next = clone(record);
  next.repairReturn = clone(repairReturn);
  next.updatedAt = nowIso(now);

  if (repairReturn.verdict === 'REPAIR_COMPLETE') {
    next.completedAt = nowIso(now);
    next.transferCandidate = repairReturn.memoryAdmission?.admit === true
      ? clone(repairReturn.memoryAdmission)
      : null;
    next.state = next.transferCandidate ? WRITING_STATES.TRANSFER_PENDING : WRITING_STATES.REPAIR_COMPLETE;
    return next;
  }

  next.repairHistory = [
    ...(Array.isArray(next.repairHistory) ? next.repairHistory : []),
    {
      diagnosis: clone(record.reviewReturn),
      regeneration: record.regeneration,
      repairCheck: clone(repairReturn),
      at: nowIso(now)
    }
  ];
  next.reviewReturn = {
    schema: WRITING_REVIEW_RETURN_SCHEMA,
    taskId: record.taskId,
    reviewOf: 'REGENERATION',
    verdict: 'REPAIR_NEEDED',
    firstFailureLayer: repairReturn.nextFailureLayer,
    repairScope: repairReturn.repairScope,
    smallestRepair: repairReturn.smallestRepair,
    reason: repairReturn.reason
  };
  next.regeneration = '';
  next.regenerationDraft = '';
  next.transferCandidate = null;
  next.completedAt = '';
  next.state = WRITING_STATES.REPAIR_NEEDED;
  return next;
}

export function archiveWritingAttempt(record, now) {
  if (!record || !nonEmpty(record.firstDraft)) return null;
  return {
    taskId: record.taskId,
    sourceKind: record.sourceKind,
    planMode: record.planMode,
    firstPlan: record.firstPlan,
    firstDraft: record.firstDraft,
    attemptEvidence: clone(record.firstEvidenceMeta || record.binding || null),
    attemptSubmittedAt: record.firstSubmittedAt,
    firstSubmittedAt: record.firstSubmittedAt,
    finalState: record.state,
    reviewReturn: record.reviewReturn,
    regeneration: record.regeneration,
    repairReturn: record.repairReturn,
    repairHistory: Array.isArray(record.repairHistory) ? record.repairHistory : [],
    transferCandidate: record.transferCandidate,
    completedAt: record.completedAt,
    archivedAt: nowIso(now)
  };
}

export function resetWritingAttempt(task, record, now) {
  const history = Array.isArray(record?.history) ? [...record.history] : [];
  const archived = archiveWritingAttempt(record, now);
  if (archived) history.push(archived);
  return createInitialWritingRecord(task, history, now);
}

export function syntheticTaskQualifiesForColdStartExit(record) {
  return Boolean(record) && [
    WRITING_STATES.PASS_ACCEPTABLE,
    WRITING_STATES.REPAIR_COMPLETE,
    WRITING_STATES.TRANSFER_PENDING
  ].includes(record.state);
}
