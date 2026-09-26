import {
  XIZONG_MEMORY_SCHEMA,
  XIZONG_MEMORY_STORAGE_KEY,
  normalizeXizongMemoryState,
  setRepairTasks
} from './xizongMemoryModel.mjs';

export const XIZONG_SYSTEM_WU_RETURN_SCHEMA = 'kianos.xizong.system_wu_return.v1';
export const XIZONG_SYSTEM_WU_PENDING_SCHEMA = 'kianos.xizong.system_wu_pending.v1';
export const XIZONG_SYSTEM_WU_PENDING_KEY = 'kianos:xizong:pending-system-wu-return:v1';

const clean = (value, max = 1200) => String(value || '').trim().slice(0, max);
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const PRIORITIES = new Set(['high','medium','low','normal']);

function fail(code, detail = '') {
  throw new Error('XIZONG_SYSTEM_WU_RETURN_' + code + (detail ? ':' + detail : ''));
}

function readJsonStrict(storage, key, fallback = null) {
  const raw = storage?.getItem?.(key);
  if (raw == null) return fallback;
  try { return JSON.parse(raw); }
  catch { fail('STATE_JSON_INVALID', key); }
}

function readMemoryForMutation(storage) {
  const raw = storage.getItem(XIZONG_MEMORY_STORAGE_KEY);
  if (raw == null) return normalizeXizongMemoryState(null);
  let value;
  try { value = JSON.parse(raw); }
  catch { fail('MEMORY_STATE_CORRUPT'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('MEMORY_STATE_INVALID');
  if (value.schema && value.schema !== XIZONG_MEMORY_SCHEMA) fail('MEMORY_SCHEMA_INVALID');
  if (value.repairTasks != null && !Array.isArray(value.repairTasks)) fail('MEMORY_REPAIR_TASKS_INVALID');
  return normalizeXizongMemoryState(value);
}

function normalizePlanRow(row, index) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) fail('PLAN_ROW_INVALID', String(index));
  if (['block_id','blockId','kp_id','kpId','target','target_kp_id'].some((key) => key in row)) {
    fail('UNTRUSTED_MAPPING', String(index));
  }
  const questionId = clean(row.question_id || row.questionId, 180);
  if (!questionId) fail('QUESTION_ID_REQUIRED', String(index));
  const priority = clean(row.priority || 'normal', 20).toLowerCase();
  if (!PRIORITIES.has(priority)) fail('PRIORITY_INVALID', priority);
  const status = clean(row.status || row.evidence_status, 20).toLowerCase();
  if (!['wrong','uncertain'].includes(status)) fail('EVIDENCE_STATUS_INVALID', questionId);
  const attemptId = clean(row.attempt_id || row.attemptId, 180);
  const submittedAtRaw = clean(row.submitted_at || row.submittedAt, 80);
  const submittedAt = submittedAtRaw && !Number.isNaN(Date.parse(submittedAtRaw))
    ? new Date(submittedAtRaw).toISOString()
    : '';
  const roundId = clean(row.round_id || row.roundId, 180);
  if (!attemptId && !submittedAt) fail('EVIDENCE_BINDING_REQUIRED', questionId);
  return {
    question_id: questionId,
    status,
    attempt_id: attemptId,
    submitted_at: submittedAt,
    round_id: roundId,
    reason: clean(row.reason || row.why, 1200),
    action: clean(row.action || row.task, 1600),
    diagnostic_axis: clean(row.diagnostic_axis || row.diagnosticAxis, 80).toUpperCase(),
    priority
  };
}

export function validateXizongSystemWuReturn(value, expectedSystemId = null) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('OBJECT_REQUIRED');
  if (value.schema !== XIZONG_SYSTEM_WU_RETURN_SCHEMA) fail('SCHEMA_INVALID');
  const returnId = clean(value.return_id || value.returnId, 160);
  const systemId = clean(value.system_id || value.systemId, 160);
  if (!returnId || !systemId) fail('IDENTITY_REQUIRED');
  if (expectedSystemId && systemId !== expectedSystemId) fail('SYSTEM_MISMATCH', systemId);
  const decision = clean(value.decision, 20).toUpperCase();
  if (!['NO_ACTION','REPAIR'].includes(decision)) fail('DECISION_INVALID');
  const rows = Array.isArray(value.plan) ? value.plan.map(normalizePlanRow) : [];
  if (new Set(rows.map((row) => row.question_id)).size !== rows.length) fail('QUESTION_DUPLICATE');
  if (decision === 'NO_ACTION' && rows.length) fail('NO_ACTION_WITH_PLAN');
  if (decision === 'REPAIR' && !rows.length) fail('REPAIR_EMPTY');
  return {
    schema:XIZONG_SYSTEM_WU_RETURN_SCHEMA,
    return_id:returnId,
    system_id:systemId,
    decision,
    plan:rows,
    note:clean(value.note, 1200)
  };
}

function pendingEmpty() {
  return {
    schema:XIZONG_SYSTEM_WU_PENDING_SCHEMA,
    pending_by_system:{},
    last_receipt:null
  };
}

export function readXizongSystemWuPendingState(storage) {
  if (!storage?.getItem) fail('STORAGE_UNAVAILABLE');
  const value = readJsonStrict(storage, XIZONG_SYSTEM_WU_PENDING_KEY, null);
  if (value == null) return pendingEmpty();
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || value.schema !== XIZONG_SYSTEM_WU_PENDING_SCHEMA
      || !value.pending_by_system || typeof value.pending_by_system !== 'object'
      || Array.isArray(value.pending_by_system)) {
    fail('PENDING_STATE_INVALID');
  }
  return {
    schema:XIZONG_SYSTEM_WU_PENDING_SCHEMA,
    pending_by_system:clone(value.pending_by_system),
    last_receipt:value.last_receipt == null ? null : clone(value.last_receipt)
  };
}

function writePending(storage, state) {
  storage.setItem(XIZONG_SYSTEM_WU_PENDING_KEY, JSON.stringify(state));
}

export function stageXizongSystemWuReturn(storage, input, {
  now = Date.now(),
  replace = false,
  studyDay = null
} = {}) {
  if (!storage?.getItem || !storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const value = validateXizongSystemWuReturn(input);
  const state = readXizongSystemWuPendingState(storage);
  const existing = state.pending_by_system[value.system_id] || null;
  if (existing) {
    const same = existing.return_id === value.return_id
      && JSON.stringify(existing.return_packet) === JSON.stringify(value);
    if (same) return {status:'already_staged',entry:clone(existing)};
    if (!replace) fail('SYSTEM_PENDING_CONFLICT', value.system_id);
  }
  const entry = {
    return_id:value.return_id,
    system_id:value.system_id,
    study_day:studyDay ? clean(studyDay,20) : null,
    received_at:new Date(now).toISOString(),
    return_packet:clone(value)
  };
  writePending(storage, {
    ...state,
    pending_by_system:{...state.pending_by_system,[value.system_id]:entry}
  });
  return {status:existing?'replaced':'staged',entry:clone(entry)};
}

export function xizongSystemWuReturnEffectMatches(storage, input) {
  try {
    const value = validateXizongSystemWuReturn(input);
    const state = readXizongSystemWuPendingState(storage);
    const pending = state.pending_by_system?.[value.system_id] || null;
    if (pending
        && pending.return_id === value.return_id
        && JSON.stringify(pending.return_packet) === JSON.stringify(value)) return true;
    const receipt = state.last_receipt;
    return Boolean(receipt
      && receipt.return_id === value.return_id
      && receipt.system_id === value.system_id
      && ['APPLIED','ALREADY_APPLIED','STALE','REJECTED'].includes(receipt.status));
  } catch {
    return false;
  }
}

function currentWuObservation(state, questionId) {
  const result = state?.results?.[questionId] || null;
  if (!result || !['wrong','uncertain'].includes(String(result.status || ''))) return null;
  const history = Array.isArray(state?.attemptHistory) ? state.attemptHistory : [];
  const byAttempt = result?.attemptId
    ? history.find((event) => event?.type === 'QUESTION_ATTEMPT' && event?.attempt_id === result.attemptId)
    : null;
  const legacyLatest = !result?.attemptId
    ? [...history].reverse().find((event) =>
        event?.type === 'QUESTION_ATTEMPT' && String(event?.question_id || '') === questionId
      ) || null
    : null;
  const evidenceEvent = byAttempt || legacyLatest;
  const submittedAtRaw = String(result?.updatedAt || result?.submitted_at || evidenceEvent?.submitted_at || '');
  const submittedAt = submittedAtRaw && !Number.isNaN(Date.parse(submittedAtRaw))
    ? new Date(submittedAtRaw).toISOString()
    : '';
  return {
    question_id: questionId,
    status: String(result?.status || evidenceEvent?.status || ''),
    attempt_id: String(result?.attemptId || evidenceEvent?.attempt_id || ''),
    submitted_at: submittedAt,
    round_id: String(result?.roundId || evidenceEvent?.round_id || '')
  };
}

export function currentXizongSystemWuEvidence(storage, systemId, questions = []) {
  if (!storage?.getItem) fail('STORAGE_UNAVAILABLE');
  const id = clean(systemId, 160);
  const catalog = new Set((Array.isArray(questions) ? questions : [])
    .map((q) => String(q?.questionId || ''))
    .filter(Boolean));
  const state = readJsonStrict(storage, `kianos:xizong:system-question-sweep:${id}:v1`, {results:{}});
  return Object.keys(state?.results || {})
    .filter((questionId) => (!catalog.size || catalog.has(questionId))
      && /^xizong-official-\d{4}-n\d{3}$/.test(questionId))
    .map((questionId) => currentWuObservation(state, questionId))
    .filter(Boolean)
    .sort((a, b) => String(b.submitted_at || '').localeCompare(String(a.submitted_at || '')));
}

function assertCurrentWuBinding(row, current) {
  if (!current) fail('QUESTION_NOT_CURRENT_WU', row.question_id);
  if (row.status !== current.status) fail('QUESTION_EVIDENCE_STALE', row.question_id + ':status');
  if (row.attempt_id && row.attempt_id !== current.attempt_id) {
    fail('QUESTION_EVIDENCE_STALE', row.question_id + ':attempt_id');
  }
  if (row.submitted_at && row.submitted_at !== current.submitted_at) {
    fail('QUESTION_EVIDENCE_STALE', row.question_id + ':submitted_at');
  }
  if (row.round_id && row.round_id !== current.round_id) {
    fail('QUESTION_EVIDENCE_STALE', row.question_id + ':round_id');
  }
}

function planToTasks({
  value,
  systemId,
  questionById,
  routes,
  practiceHref,
  importedAt
}) {
  const byBlockKp = new Map();
  const unmapped = [];
  for (const row of value.plan) {
    const question = questionById.get(row.question_id);
    const relation = question?.relation;
    const route = relation?.blockId ? routes?.[relation.blockId] : null;
    if (!relation?.blockId || !relation?.primaryKpId || !route) {
      unmapped.push(row.question_id);
      continue;
    }
    const allowedAxes = Array.isArray(question?.repairDiagnosticAxes)
      ? question.repairDiagnosticAxes.map((axis) => String(axis || '').toUpperCase()).filter(Boolean)
      : [];
    const diagnosticAxis = String(row?.diagnostic_axis || '').toUpperCase();
    if (allowedAxes.length && !diagnosticAxis) fail('DIAGNOSTIC_AXIS_REQUIRED', row.question_id);
    if (allowedAxes.length && !allowedAxes.includes(diagnosticAxis)) fail('DIAGNOSTIC_AXIS_INVALID', row.question_id + ':' + diagnosticAxis);
    if (!allowedAxes.length && diagnosticAxis) fail('DIAGNOSTIC_AXIS_UNAUTHORIZED', row.question_id + ':' + diagnosticAxis);
    const key = relation.blockId + '::' + relation.primaryKpId + '::' + diagnosticAxis;
    const item = byBlockKp.get(key) || {
      blockId:String(relation.blockId),
      kpId:String(relation.primaryKpId),
      questionIds:[],
      reasons:[],
      actions:[],
      priorities:[],
      diagnosticAxis
    };
    item.questionIds.push(row.question_id);
    if (row.reason) item.reasons.push(row.reason);
    if (row.action) item.actions.push(row.action);
    item.priorities.push(row.priority);
    byBlockKp.set(key,item);
  }

  const rank = {high:4,medium:3,normal:2,low:1};
  const groups=[...byBlockKp.values()].map((item)=>{
    const priority=[...item.priorities].sort((a,b)=>(rank[b]||0)-(rank[a]||0))[0] || 'high';
    const route=routes[item.blockId];
    const plan={
      kpId:item.kpId,
      diagnosticAxis:item.diagnosticAxis || '',
      reason:[...new Set(item.reasons)].join('；') || `来自 ${item.questionIds.length} 道 W/U 题`,
      action:[...new Set(item.actions)].join('；') || '重新运行这一 KP 所属机制链，再回到题目主线。',
      priority,
      sourceQuestionIds:[...new Set(item.questionIds)],
      blockHref:String(route?.href || ''),
      returnHref:String(practiceHref || '')
    };
    return {
      inboxKey:'kianos-xizong-repair-inbox-v1:xizong:'+item.blockId,
      plan,
      task:{
        id:`repair:system-wu:${systemId}:${item.blockId}:${item.kpId}${item.diagnosticAxis ? ':' + item.diagnosticAxis.toLowerCase() : ''}`,
        kpId:item.kpId,
        blockId:item.blockId,
        systemId,
        diagnosticAxis:item.diagnosticAxis || '',
        title:[route?.label,item.kpId,item.diagnosticAxis].filter(Boolean).join(' · '),
        reason:plan.reason,
        action:plan.action,
        priority:plan.priority,
        origin:'SYSTEM_WU_CHAT_RETURN',
        sourceQuestionIds:plan.sourceQuestionIds,
        blockHref:plan.blockHref,
        returnHref:plan.returnHref,
        createdAt:importedAt,
        status:'ACTIVE'
      }
    };
  });
  return {groups,unmapped};
}

function receipt(entry, status, detail = {}, now = Date.now()) {
  return {
    schema:'kianos.xizong.system_wu_return_receipt.v1',
    return_id:entry.return_id,
    system_id:entry.system_id,
    status,
    repair_tasks:(detail.repairTasks || []).map((task)=>({
      task_id:task.id,
      created_at:task.createdAt,
      block_id:task.blockId,
      kp_id:task.kpId,
      origin:task.origin,
      diagnostic_axis:task.diagnosticAxis || ''
    })),
    unmapped_question_ids:[...(detail.unmapped || [])],
    detail:clean(detail.message, 1000),
    at:new Date(now).toISOString()
  };
}

export function applyXizongSystemWuReturn(storage, input, {
  questions = [],
  routes = {},
  practiceHref = '',
  now = Date.now(),
  expectedDay = null
} = {}) {
  if (!storage?.getItem || !storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const value = validateXizongSystemWuReturn(input);
  const questionById = new Map((Array.isArray(questions)?questions:[]).map((q)=>[String(q?.questionId || ''),q]).filter(([id])=>id));
  const currentWu = new Map(
    currentXizongSystemWuEvidence(storage, value.system_id, questions)
      .map((row) => [row.question_id, row])
  );
  for (const row of value.plan) {
    assertCurrentWuBinding(row, currentWu.get(row.question_id) || null);
  }

  const resultKey=`kianos:xizong:system-repair-return:${value.system_id}:v1`;
  const existing=readJsonStrict(storage,resultKey,null);
  if (existing?.return_id) {
    if (existing.return_id === value.return_id && JSON.stringify(existing.return_packet) === JSON.stringify(value)) {
      const memory=readMemoryForMutation(storage);
      const ids=new Set(existing.repair_task_ids || []);
      return {
        status:'already_applied',
        return_packet:value,
        receipt:clone(existing.receipt || null),
        repair_tasks:(memory.repairTasks || []).filter((task)=>ids.has(task.id))
      };
    }
    if (existing.return_id === value.return_id) fail('RETURN_CONFLICT');
  }

  const importedAt=new Date(now).toISOString();
  const {groups,unmapped}=value.decision === 'REPAIR'
    ? planToTasks({value,systemId:value.system_id,questionById,routes,practiceHref,importedAt})
    : {groups:[],unmapped:[]};

  const memoryBefore=storage.getItem(XIZONG_MEMORY_STORAGE_KEY);
  const resultBefore=storage.getItem(resultKey);
  const inboxBefore=new Map(groups.map(({inboxKey})=>[inboxKey,storage.getItem(inboxKey)]));
  let tasks=[];
  let nextMemory=null;

  if (groups.length) {
    const memory=readMemoryForMutation(storage);
    tasks=groups.map((row)=>row.task);
    const ids=new Set(tasks.map((task)=>task.id));
    const kept=(memory.repairTasks || []).filter((task)=>!ids.has(String(task?.id || '')));
    nextMemory=setRepairTasks(memory,[...kept,...tasks]);
  }

  const nextReceipt=receipt(
    {return_id:value.return_id,system_id:value.system_id},
    'APPLIED',
    {repairTasks:tasks,unmapped},
    now
  );

  try {
    for (const {inboxKey,plan} of groups) {
      const prior=readJsonStrict(storage,inboxKey,{plans:[]}) || {plans:[]};
      const existingPlans=Array.isArray(prior.plans)?prior.plans:[];
      const kept=existingPlans.filter((row)=>String(row?.kpId || row?.kp_id || '')!==plan.kpId);
      storage.setItem(inboxKey,JSON.stringify({
        ...prior,
        importedAt,
        sourceSystemId:value.system_id,
        plans:[...kept,plan]
      }));
    }
    if (nextMemory) storage.setItem(XIZONG_MEMORY_STORAGE_KEY,JSON.stringify(nextMemory));
    storage.setItem(resultKey,JSON.stringify({
      importedAt,
      return_id:value.return_id,
      return_packet:value,
      repair_task_ids:tasks.map((task)=>task.id),
      unmapped_question_ids:unmapped,
      receipt:nextReceipt
    }));
  } catch (error) {
    try {
      if (memoryBefore==null) storage.removeItem?.(XIZONG_MEMORY_STORAGE_KEY);
      else storage.setItem(XIZONG_MEMORY_STORAGE_KEY,memoryBefore);
      if (resultBefore==null) storage.removeItem?.(resultKey);
      else storage.setItem(resultKey,resultBefore);
      for (const [key,raw] of inboxBefore.entries()) {
        if (raw==null) storage.removeItem?.(key);
        else storage.setItem(key,raw);
      }
    } catch { fail('ROLLBACK_INCOMPLETE'); }
    throw error;
  }

  return {
    status:'applied',
    return_packet:value,
    receipt:nextReceipt,
    repair_tasks:tasks
  };
}

export function consumePendingXizongSystemWuReturn(storage, {
  systemId,
  questions = [],
  routes = {},
  practiceHref = '',
  now = Date.now(),
  expectedDay = null
} = {}) {
  const id=clean(systemId,160);
  const state=readXizongSystemWuPendingState(storage);
  const entry=state.pending_by_system[id] || null;
  if (!entry) return {status:'no_pending',receipt:state.last_receipt};

  if (expectedDay && entry.study_day && entry.study_day !== expectedDay) {
    const nextReceipt=receipt(entry,'STALE',{message:'pending System W/U Return belongs to a different study day'},now);
    const pending={...state.pending_by_system};
    delete pending[id];
    writePending(storage,{...state,pending_by_system:pending,last_receipt:nextReceipt});
    return {status:'stale',receipt:clone(nextReceipt),apply_result:null};
  }

  let applyResult=null;
  let nextReceipt;
  try {
    applyResult=applyXizongSystemWuReturn(storage,entry.return_packet,{questions,routes,practiceHref,now});
    nextReceipt=receipt(
      entry,
      applyResult.status==='already_applied'?'ALREADY_APPLIED':'APPLIED',
      {repairTasks:applyResult.repair_tasks || [],unmapped:applyResult.receipt?.unmapped_question_ids || []},
      now
    );
  } catch (error) {
    const message=String(error?.message || error);
    const status=(message.includes('QUESTION_NOT_CURRENT_WU') || message.includes('QUESTION_EVIDENCE_STALE'))
      ? 'STALE'
      : 'REJECTED';
    nextReceipt=receipt(entry,status,{message},now);
  }

  const latest=readXizongSystemWuPendingState(storage);
  const current=latest.pending_by_system[id];
  const pending={...latest.pending_by_system};
  if (current?.return_id===entry.return_id) delete pending[id];
  writePending(storage,{...latest,pending_by_system:pending,last_receipt:nextReceipt});
  return {
    status:nextReceipt.status.toLowerCase(),
    receipt:clone(nextReceipt),
    apply_result:applyResult
  };
}
