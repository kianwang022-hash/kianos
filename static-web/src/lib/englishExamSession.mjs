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

function reorderExamSteps(paper, taskOrder = null) {
  const steps = Array.isArray(paper?.steps) ? paper.steps.map((step) => ({ ...step })) : [];
  const defaultOrder = Array.isArray(paper?.default_task_order) ? [...paper.default_task_order] : [];
  if (!Array.isArray(taskOrder) || !taskOrder.length) return steps;

  const normalized = taskOrder.map(String);
  if (
    normalized.length !== defaultOrder.length
    || new Set(normalized).size !== normalized.length
    || normalized.some((task) => !defaultOrder.includes(task))
  ) {
    throw new Error('ENGLISH_EXAM_TASK_ORDER_INVALID');
  }

  const grouped = new Map();
  for (const step of steps) {
    if (!grouped.has(step.task)) grouped.set(step.task, []);
    grouped.get(step.task).push(step);
  }
  return normalized.flatMap((task) => grouped.get(task) || []);
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
  const steps = reorderExamSteps(paper, taskOrder).map(validateStep);
  if (!steps.length) throw new Error('ENGLISH_EXAM_STEPS_EMPTY');
  const durationMinutes = Number(paper.duration_minutes || 0);
  if (durationMinutes !== 180 || steps.length !== 9 || Number(paper.total_points) !== 100
    || ['cloze','reading_a','reading_b','translation','writing'].some((task,i) => steps.filter(s=>s.task===task).length !== [1,4,1,1,2][i])
    || steps.reduce((sum,s)=>sum+s.max_points,0)!==100) {
    throw new Error('ENGLISH_EXAM_DURATION_INVALID');
  }
  if (new Set(steps.map(s=>s.step_id)).size!==9 || new Set(steps.map(s=>s.object_id)).size!==9
      || Number(paper.objective_max_points)!==60 || Number(paper.productive_max_points)!==40
      || steps.some(s=>!s.source_hash || !Array.isArray(s.question_ids))) throw new Error('ENGLISH_EXAM_PAPER_IDENTITY_INVALID');
  const small=steps.filter(s=>s.task==='writing'&&s.writing_kind==='small'),big=steps.filter(s=>s.task==='writing'&&s.writing_kind==='big');
  if(small.length!==1||big.length!==1||small[0].max_points!==10||big[0].max_points!==20
     ||steps.filter(s=>s.task!=='writing').some(s=>s.max_points!==10)
     ||steps.filter(s=>OBJECTIVE_TASKS.has(s.task)).some(s=>s.question_ids.length!==(s.task==='cloze'?20:5))) throw new Error('ENGLISH_EXAM_SECTION_STRUCTURE_INVALID');

  return {
    schema: ENGLISH_EXAM_SESSION_SCHEMA,
    session_id: sessionId || `${paper.paper_id}:${new Date(started).toISOString()}`,
    paper_id: String(paper.paper_id),
    source_hash: paper.source_hash || null,
    year: Number(paper.year),
    status: 'ACTIVE',
    revision: 0,
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
  const started = Date.parse(value.started_at), deadline = Date.parse(value.deadline_at);
  if (!Number.isFinite(started) || !Number.isFinite(deadline) || deadline-started !== 180*60_000 || Number(value.duration_minutes)!==180) throw new Error('ENGLISH_EXAM_CLOCK_INVALID');
  if (new Set(value.steps.map(s=>s.step_id)).size!==value.steps.length) throw new Error('ENGLISH_EXAM_DUPLICATE_STEP');
  if (!value.captures || typeof value.captures!=='object' || Array.isArray(value.captures)) throw new Error('ENGLISH_EXAM_CAPTURES_INVALID');
  for(const [id,capture] of Object.entries(value.captures)) {
    const step=value.steps.find(s=>s.step_id===id);
    if(!step || capture.step_id!==id || capture.task!==step.task || capture.object_id!==step.object_id) throw new Error('ENGLISH_EXAM_CAPTURE_IDENTITY_INVALID');
  }
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
  const raw = storage.getItem(ENGLISH_EXAM_SESSION_KEY);
  let prior = null;
  if(raw) { try {prior=validateEnglishExamSession(JSON.parse(raw));} catch {throw new Error('ENGLISH_EXAM_EXISTING_DATA_UNREADABLE_EXPORT_BEFORE_REPLACE');} }
  if(prior?.session_id===valid.session_id) {
    if(JSON.stringify(prior)===JSON.stringify(valid))return prior;
    if(prior.status !== 'ACTIVE' && (valid.status==='ACTIVE' || JSON.stringify(prior.captures)!==JSON.stringify(valid.captures))) throw new Error('ENGLISH_EXAM_SEALED_IMMUTABLE');
    if(prior.status==='RELEASED')throw new Error('ENGLISH_EXAM_RELEASE_IMMUTABLE');
    if(Number(valid.revision||0)!==Number(prior.revision||0)+1)throw new Error('ENGLISH_EXAM_STALE_WRITE');
  }
  const archiveKey=prior && prior.session_id!==valid.session_id ? 'kianos-english-exam-archive-v1:'+prior.session_id : null;
  const previousArchive=archiveKey?storage.getItem(archiveKey):null;
  try {
    if(archiveKey)storage.setItem(archiveKey,raw);
    storage.setItem(ENGLISH_EXAM_SESSION_KEY, JSON.stringify(valid));
  } catch(error) {
    if(archiveKey) {if(previousArchive==null)storage.removeItem(archiveKey);else storage.setItem(archiveKey,previousArchive);}
    throw error;
  }
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
  if (englishExamRemainingMs(current, now)<=0) throw new Error('ENGLISH_EXAM_DEADLINE_REACHED');
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
  updated.revision = Number(current.revision||0)+1;
  return updated;
}

export function selectEnglishExamStep(state, index, now = Date.now()) {
  const current = validateEnglishExamSession(state);
  if (current.status !== 'ACTIVE') throw new Error('ENGLISH_EXAM_NOT_ACTIVE');
  if (englishExamRemainingMs(current, now)<=0) throw new Error('ENGLISH_EXAM_DEADLINE_REACHED');
  const target = Number(index);
  if (!Number.isInteger(target) || target < 0 || target >= current.steps.length) {
    throw new Error('ENGLISH_EXAM_STEP_INDEX_INVALID');
  }
  const updated = clone(current);
  updated.current_step = target;
  updated.updated_at = iso(now);
  updated.revision = Number(current.revision||0)+1;
  return updated;
}

export function sealEnglishExamSession(state, now = Date.now(), {storage=null} = {}) {
  const current = validateEnglishExamSession(state);
  if (current.status !== 'ACTIVE') return current;
  const updated = clone(current);
  // Seal freezes all autosaved work, not only sections whose Complete button was clicked.
  if(storage) {
    for(const step of current.steps) {
      const raw=storage.getItem(englishExamTaskStorageKey(current.session_id,step.task,step.object_id));
      if(raw==null)continue;
      let local;try{local=JSON.parse(raw);}catch{throw new Error('ENGLISH_EXAM_UNREADABLE_TASK:'+step.step_id);}
      const savedAt=Date.parse(local.saved_at || local.updatedAt || '');
      if(Number.isFinite(savedAt) && savedAt>Date.parse(current.deadline_at))throw new Error('ENGLISH_EXAM_LATE_TASK_WRITE:'+step.step_id);
      updated.captures[step.step_id]={step_id:step.step_id,task:step.task,object_id:step.object_id,completed_at:current.captures[step.step_id]?.completed_at||null,sealed_snapshot_at:iso(Math.min(Number(now),Date.parse(current.deadline_at))),payload:englishExamPayload(step.task,local)};
    }
  }
  updated.status = 'SEALED';
  updated.current_step = updated.steps.length;
  updated.sealed_at = iso(now);
  updated.updated_at = iso(now);
  updated.revision = Number(current.revision||0)+1;
  return updated;
}

function normalizeAnswers(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, answer]) => [String(key), String(answer ?? '')])
  );
}

function examEvidenceContext(payload = {}) {
  return {
    prior_exposure: String(payload?.prior_exposure || 'unknown'),
    assistance: String(payload?.assistance || 'unknown'),
    source_kind: String(payload?.source_kind || 'unknown'),
    evidence_role: payload?.evidence_role == null ? null : String(payload.evidence_role),
    timing_status: String(payload?.timing_status || 'uncalibrated'),
    independent_transfer_candidate: payload?.independent_transfer_candidate === true
  };
}

export function releaseEnglishExamObjective(state, answerPacket, now = Date.now()) {
  const current = validateEnglishExamSession(state);
  if (current.status === 'ACTIVE') throw new Error('ENGLISH_EXAM_MUST_BE_SEALED');
  if (current.status === 'RELEASED') return current;
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
    const keyStep=byStep[step.step_id];
    if(step.source_hash && keyStep.source_hash!==step.source_hash) throw new Error('ENGLISH_EXAM_ANSWER_REVISION_MISMATCH:'+step.step_id);
    if(keyStep?.task && (keyStep.task!==step.task || keyStep.object_id!==step.object_id)) throw new Error('ENGLISH_EXAM_ANSWER_IDENTITY_MISMATCH');
    if(step.question_ids && JSON.stringify([...step.question_ids].sort())!==JSON.stringify(Object.keys(expected).sort())) throw new Error('ENGLISH_EXAM_ANSWER_SET_INCOMPLETE:'+step.step_id);
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
      max_points: Number(step.max_points || 0),
      evidence: examEvidenceContext(current.captures?.[step.step_id]?.payload || {})
    });
  }

  const updated = clone(current);
  updated.status = 'RELEASED';
  updated.released_at = iso(now);
  updated.updated_at = iso(now);
  updated.revision = Number(current.revision||0)+1;
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
    productive_status: current.release?.productive?.status || null,
    step_evidence: current.steps.map((step) => ({
      step_id: step.step_id,
      task: step.task,
      object_id: step.object_id,
      source_hash: step.source_hash || null,
      evidence: examEvidenceContext(current.captures?.[step.step_id]?.payload || {})
    }))
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


export function englishExamTaskStorageKey(sessionId, task, objectId) {
  return `kianos-english-exam-task-v1:${sessionId}:${task}:${objectId}`;
}

export function englishExamPayload(task, local) {
  const first=local?.firstEvidenceMeta&&typeof local.firstEvidenceMeta==='object'?local.firstEvidenceMeta:{};
  const binding=local?.binding&&typeof local.binding==='object'?local.binding:{};
  const evidence={...binding,...first};
  const common={
    started_at:local.startedAt||local.createdAt||null,
    source_hash:binding.source_hash||local.sourceHash||null,
    attempt_id:binding.attempt_id||null,
    prior_exposure:String(evidence.prior_exposure||'unknown'),
    assistance:String(evidence.assistance||'unknown'),
    source_kind:String(evidence.source_kind||'unknown'),
    evidence_role:evidence.evidence_role==null?null:String(evidence.evidence_role),
    timing_status:String(evidence.timing_status||'uncalibrated'),
    independent_transfer_candidate:evidence.independent_transfer_candidate===true
  };
  if(['reading_a','cloze','reading_b'].includes(task))return {...common,answers:clone(local.answers||{}),uncertain:clone(local.uncertain||[]),trajectory:clone(local.trajectory||{})};
  if(task==='translation')return {...common,answers:clone(local.drafts||{}),first_attempts:clone(local.firstAttempts||{})};
  if(task==='writing')return {...common,plan_mode:local.planMode||'direct',plan:local.planMode==='planned'?local.draftPlan||'':'',essay:local.draftEssay||'',first_draft:local.firstDraft||''};
  throw new Error('ENGLISH_EXAM_TASK_UNSUPPORTED');
}

export function assertEnglishExamTaskAccess(storage, {sessionId,task,objectId,sourceHash=null,now=Date.now()}={}) {
  const state=readEnglishExamSession(storage);
  if(!state || state.session_id!==sessionId || state.status!=='ACTIVE')throw new Error('ENGLISH_EXAM_CONTEXT_INVALID_OR_SEALED');
  if(englishExamRemainingMs(state,now)<=0)throw new Error('ENGLISH_EXAM_DEADLINE_REACHED');
  const step=state.steps.find(s=>s.task===task && s.object_id===objectId);
  if(!step)throw new Error('ENGLISH_EXAM_EXACT_TASK_REQUIRED');
  if(sourceHash && step.source_hash && sourceHash!==step.source_hash)throw new Error('ENGLISH_EXAM_SOURCE_CHANGED_EXPORT_REQUIRED');
  return {state,step};
}
