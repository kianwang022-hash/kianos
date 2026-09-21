export const ENGLISH_EXAM_SESSION_SCHEMA = 'kianos.english.exam-session.v1';
export const ENGLISH_EXAM_SESSION_KEY = 'kianos-english-exam-session-v1';
export const ENGLISH_EXAM_ANSWER_SCHEMA = 'kianos.english.exam-answer.v1';
export const ENGLISH_EXAM_EVIDENCE_SCHEMA = 'kianos.english.exam-evidence.v1';
export const ENGLISH_EXAM_PRODUCTIVE_SCORE_RETURN_SCHEMA = 'kianos.english.exam-productive-score-return.v1';
export const ENGLISH_EXAM_PRODUCTIVE_SCORING_STANDARD_VERSION = 'english.productive-scoring.v2';

const OBJECTIVE_TASKS = new Set(['cloze', 'reading_a', 'reading_b']);
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const iso = (value) => new Date(value).toISOString();
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const numberIn = (value, max) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const hasProductiveOutput = (step, payload) => step.task === 'writing'
  ? [payload?.essay, payload?.first_draft].some((text) => typeof text === 'string' && text.trim())
  : [payload?.answers, payload?.first_attempts].some((answers) => record(answers)
    && Object.values(answers).some((text) => typeof text === 'string' && text.trim()));

// A missing capture is unvisited work. A present capture must carry an explicit
// output channel, including an empty map/string for genuinely blank work.
function assertExamCaptureOutput(step, payload) {
  if (!record(payload)) throw new Error('ENGLISH_EXAM_CAPTURE_OUTPUT_UNREADABLE:' + step.step_id);
  if (OBJECTIVE_TASKS.has(step.task) || step.task === 'translation') {
    if (!Object.hasOwn(payload, 'answers') || !record(payload.answers)) {
      throw new Error('ENGLISH_EXAM_CAPTURE_OUTPUT_UNREADABLE:' + step.step_id);
    }
    normalizeAnswers(payload.answers);
  }
  if (step.task === 'translation' && Object.hasOwn(payload, 'first_attempts')) {
    if (!record(payload.first_attempts)) throw new Error('ENGLISH_EXAM_CAPTURE_OUTPUT_UNREADABLE:' + step.step_id);
    normalizeAnswers(payload.first_attempts);
  }
  if (step.task === 'writing' && (typeof payload.essay !== 'string'
      || (payload.first_draft != null && typeof payload.first_draft !== 'string'))) {
    throw new Error('ENGLISH_EXAM_CAPTURE_OUTPUT_UNREADABLE:' + step.step_id);
  }
}

function assertExamScoreEvidence(state) {
  if (!['RELEASED', 'SCORED'].includes(state.status)) return;
  const objective = state.release?.objective;
  const steps = state.steps.filter((step) => OBJECTIVE_TASKS.has(step.task));
  if (!record(objective) || !numberIn(objective.points, 60) || objective.max_points !== 60
      || !Array.isArray(objective.steps) || objective.steps.length !== steps.length) {
    throw new Error('ENGLISH_EXAM_OBJECTIVE_SCORE_INVALID');
  }
  let points = 0;
  const ids = new Set();
  for (const row of objective.steps) {
    const step = steps.find((candidate) => candidate.step_id === row?.step_id);
    if (!step || ids.has(row.step_id) || row.task !== step.task || row.object_id !== step.object_id
        || row.max_points !== step.max_points || !numberIn(row.points, step.max_points)
        || !Number.isInteger(row.correct) || !Number.isInteger(row.total)
        || row.total !== step.question_ids.length || row.correct < 0 || row.correct > row.total
        || row.points !== Number((row.correct / row.total * step.max_points).toFixed(2))) {
      throw new Error('ENGLISH_EXAM_OBJECTIVE_SCORE_INVALID');
    }
    ids.add(row.step_id);
    points += row.points;
  }
  if (objective.points !== Number(points.toFixed(2))) throw new Error('ENGLISH_EXAM_OBJECTIVE_TOTAL_INVALID');
  if (state.status !== 'SCORED') return;
  const productive = state.release.productive;
  if (!record(productive) || productive.status !== 'SCORED'
      || productive.scoring_standard_version !== ENGLISH_EXAM_PRODUCTIVE_SCORING_STANDARD_VERSION
      || productive.review_of !== 'SEALED_FIRST_OUTPUT') {
    throw new Error('ENGLISH_EXAM_PRODUCTIVE_EVIDENCE_MISSING');
  }
  let low = 0, high = 0;
  for (const [channel, max] of Object.entries({translation: 10, writing_small: 10, writing_big: 20})) {
    const row = productive.channels?.[channel];
    const step = englishExamProductiveStep(state, channel);
    if (!step || !record(row) || row.step_id !== step.step_id || row.object_id !== step.object_id
        || row.source_hash !== step.source_hash || row.requires_independent_rescore !== false
        || !['HIGH','MEDIUM','LOW'].includes(row.confidence)
        || !['ANCHORED_SINGLE','INDEPENDENT_RESCORE_RECONCILED'].includes(row.review_mode)) {
      throw new Error('ENGLISH_EXAM_PRODUCTIVE_EVIDENCE_INVALID:' + channel);
    }
    const range = normalizeEnglishExamScoreRange(row.score_range, max, channel);
    if (range.high > 0 && !hasProductiveOutput(step, state.captures[step.step_id]?.payload)) {
      throw new Error('ENGLISH_EXAM_SCORE_WITHOUT_PRODUCTIVE_OUTPUT:' + channel);
    }
    low += range.low; high += range.high;
  }
  const range = {low: Number(low.toFixed(1)), high: Number(high.toFixed(1))};
  const total = {low: Number((points + low).toFixed(1)), high: Number((points + high).toFixed(1))};
  const integrated = state.release.integrated;
  if (!same(productive.score_range, range) || !record(integrated) || !same(integrated.score_range, total)
      || integrated.max_points !== 100 || integrated.modality !== 'TYPED' || integrated.score_eligible !== false
      || integrated.productive_scoring_standard_version !== ENGLISH_EXAM_PRODUCTIVE_SCORING_STANDARD_VERSION
      || integrated.evidence_quality !== englishExamWholePaperEvidenceQuality(state)) {
    throw new Error('ENGLISH_EXAM_INTEGRATED_EVIDENCE_INVALID');
  }
}

function finiteTime(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`ENGLISH_EXAM_TIME_INVALID:${label}`);
  return number;
}

function normalizeExamAssistanceContext(value) {
  if (value == null) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('ENGLISH_EXAM_ASSISTANCE_CONTEXT_INVALID');
  }
  const state = String(value.state || '');
  const basis = String(value.basis || '');
  const note = String(value.note || '').trim();
  const observedAt = String(value.observed_at || '');
  if (!['assisted','unknown'].includes(state)
    || !['chat_context','learner_statement'].includes(basis)
    || !note
    || !Number.isFinite(Date.parse(observedAt))) {
    throw new Error('ENGLISH_EXAM_ASSISTANCE_CONTEXT_INVALID');
  }
  return {
    state,
    basis,
    note: note.slice(0, 400),
    observed_at: new Date(observedAt).toISOString()
  };
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
  sessionId = null,
  assistanceContext = null
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
    paper_assistance_context: normalizeExamAssistanceContext(assistanceContext),
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
  if (!['ACTIVE', 'SEALED', 'RELEASED', 'SCORED'].includes(value.status)) {
    throw new Error(`ENGLISH_EXAM_SESSION_STATUS_INVALID:${value.status}`);
  }
  value.steps.forEach(validateStep);
  // Reuse the same paper geometry on durable reads; a status label is not proof.
  const steps = value.steps;
  if (steps.length !== 9 || value.total_points !== 100 || value.objective_max_points !== 60
      || value.productive_max_points !== 40 || !value.source_hash
      || new Set(steps.map((step) => step.object_id)).size !== 9
      || ['cloze','reading_a','reading_b','translation','writing'].some((task, index) =>
        steps.filter((step) => step.task === task).length !== [1,4,1,1,2][index])
      || steps.some((step) => !step.source_hash || !Array.isArray(step.question_ids))
      || steps.filter((step) => OBJECTIVE_TASKS.has(step.task)).some((step) =>
        step.question_ids.length !== (step.task === 'cloze' ? 20 : 5)
        || new Set(step.question_ids).size !== step.question_ids.length)
      || steps.filter((step) => step.task !== 'writing').some((step) => step.max_points !== 10)
      || steps.filter((step) => step.task === 'writing' && step.writing_kind === 'small' && step.max_points === 10).length !== 1
      || steps.filter((step) => step.task === 'writing' && step.writing_kind === 'big' && step.max_points === 20).length !== 1
      || !Number.isInteger(value.revision) || value.revision < 0) {
    throw new Error('ENGLISH_EXAM_DURABLE_GEOMETRY_INVALID');
  }
  const started = Date.parse(value.started_at), deadline = Date.parse(value.deadline_at);
  if (!Number.isFinite(started) || !Number.isFinite(deadline) || deadline-started !== 180*60_000 || Number(value.duration_minutes)!==180) throw new Error('ENGLISH_EXAM_CLOCK_INVALID');
  if (new Set(value.steps.map(s=>s.step_id)).size!==value.steps.length) throw new Error('ENGLISH_EXAM_DUPLICATE_STEP');
  normalizeExamAssistanceContext(value.paper_assistance_context);
  if (!value.captures || typeof value.captures!=='object' || Array.isArray(value.captures)) throw new Error('ENGLISH_EXAM_CAPTURES_INVALID');
  for(const [id,capture] of Object.entries(value.captures)) {
    const step=value.steps.find(s=>s.step_id===id);
    if(!step || !record(capture) || capture.step_id!==id || capture.task!==step.task || capture.object_id!==step.object_id
        || !record(capture.payload)) throw new Error('ENGLISH_EXAM_CAPTURE_IDENTITY_INVALID');
    assertExamCaptureOutput(step, capture.payload);
    if (capture.payload.source_hash != null && capture.payload.source_hash !== step.source_hash) {
      throw new Error('ENGLISH_EXAM_CAPTURE_SOURCE_MISMATCH');
    }
  }
  if (!Number.isInteger(Number(value.current_step)) || Number(value.current_step) < 0 || Number(value.current_step) > value.steps.length) {
    throw new Error('ENGLISH_EXAM_CURRENT_STEP_INVALID');
  }
  assertExamScoreEvidence(value);
  return clone(value);
}

export function inspectEnglishExamSession(storage) {
  if (!storage?.getItem) {
    return { status: 'unavailable', session: null, error: 'ENGLISH_EXAM_STORAGE_UNAVAILABLE' };
  }
  let raw;
  try { raw = storage.getItem(ENGLISH_EXAM_SESSION_KEY); }
  catch (error) { return {status: 'unavailable', session: null, error: String(error?.message || error)}; }
  if (raw == null) return { status: 'missing', session: null, error: null };
  try {
    const session=validateEnglishExamSession(JSON.parse(raw));
    if(storage.getItem('kianos-english-exam-archive-v1:'+session.session_id)!=null)throw new Error('ENGLISH_EXAM_SESSION_RETIRED_PRESERVE_RAW');
    return { status: 'ready', session, error: null };
  } catch (error) {
    return {
      status: 'invalid',
      session: null,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export function readEnglishExamSession(storage) {
  const state = inspectEnglishExamSession(storage);
  return state.status === 'ready' ? state.session : null;
}

export function writeEnglishExamSession(storage, state) {
  if (!storage?.setItem) throw new Error('ENGLISH_EXAM_STORAGE_UNAVAILABLE');
  const valid = validateEnglishExamSession(state);
  if(storage.getItem('kianos-english-exam-archive-v1:'+valid.session_id)!=null)throw new Error('ENGLISH_EXAM_CURRENT_SESSION_CHANGED');
  const raw = storage.getItem(ENGLISH_EXAM_SESSION_KEY);
  let prior = null;
  if(raw!=null) { try {prior=validateEnglishExamSession(JSON.parse(raw));} catch {throw new Error('ENGLISH_EXAM_EXISTING_DATA_UNREADABLE_EXPORT_BEFORE_REPLACE');} }
  if (prior && prior.session_id !== valid.session_id) {
    // Only an explicitly new session can replace the active slot. An old async
    // release/capture must never archive the newer session and resurrect itself.
    if (valid.status !== 'ACTIVE' || valid.revision !== 0
        || Date.parse(valid.started_at) < Date.parse(prior.started_at)
        || storage.getItem('kianos-english-exam-archive-v1:' + valid.session_id) != null) {
      throw new Error('ENGLISH_EXAM_CURRENT_SESSION_CHANGED');
    }
  }
  if(prior?.session_id===valid.session_id) {
    if(JSON.stringify(prior)===JSON.stringify(valid))return prior;
    for (const field of ['paper_id','source_hash','steps','started_at','deadline_at','duration_minutes','total_points','objective_max_points','productive_max_points','task_order','paper_assistance_context']) {
      if (!same(prior[field], valid[field])) throw new Error('ENGLISH_EXAM_SESSION_IDENTITY_IMMUTABLE:' + field);
    }
    if (prior.status === 'RELEASED' && !same(prior.release.objective, valid.release?.objective)) {
      throw new Error('ENGLISH_EXAM_OBJECTIVE_RELEASE_IMMUTABLE');
    }
    if(prior.status !== 'ACTIVE' && (valid.status==='ACTIVE' || JSON.stringify(prior.captures)!==JSON.stringify(valid.captures))) throw new Error('ENGLISH_EXAM_SEALED_IMMUTABLE');
    if(prior.status==='SCORED')throw new Error('ENGLISH_EXAM_SCORE_IMMUTABLE');
    if(prior.status==='RELEASED' && valid.status!=='SCORED')throw new Error('ENGLISH_EXAM_RELEASE_IMMUTABLE');
    if(Number(valid.revision||0)!==Number(prior.revision||0)+1)throw new Error('ENGLISH_EXAM_STALE_WRITE');
  }
  const archiveKey=prior && prior.session_id!==valid.session_id ? 'kianos-english-exam-archive-v1:'+prior.session_id : null;
  const previousArchive=archiveKey?storage.getItem(archiveKey):null;
  if(previousArchive!=null&&previousArchive!==raw)throw new Error('ENGLISH_EXAM_ARCHIVE_CONFLICT_PRESERVE_DATA');
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
  assertExamCaptureOutput(step, payload);

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
      // Absence was handled above. A present autosave must contain its output;
      // never replace intact captures with a default invented from missing fields.
      const payload = englishExamPayload(step.task, local);
      const previous = current.captures[step.step_id]?.payload;
      if (step.task === 'translation' && record(previous?.first_attempts)
          && Object.entries(previous.first_attempts).some(([id, text]) =>
            payload.first_attempts[id] !== text)) {
        throw new Error('ENGLISH_EXAM_FIRST_OUTPUT_CHANGED:' + step.step_id);
      }
      if (step.task === 'writing' && typeof previous?.first_draft === 'string'
          && previous.first_draft && previous.first_draft !== payload.first_draft) {
        throw new Error('ENGLISH_EXAM_FIRST_OUTPUT_CHANGED:' + step.step_id);
      }
      const savedAt=Date.parse(local.saved_at || local.updatedAt || '');
      if(Number.isFinite(savedAt) && savedAt>Date.parse(current.deadline_at))throw new Error('ENGLISH_EXAM_LATE_TASK_WRITE:'+step.step_id);
      updated.captures[step.step_id]={step_id:step.step_id,task:step.task,object_id:step.object_id,completed_at:current.captures[step.step_id]?.completed_at||null,sealed_snapshot_at:iso(Math.min(Number(now),Date.parse(current.deadline_at))),payload};
    }
  }
  updated.status = 'SEALED';
  updated.current_step = updated.steps.length;
  updated.sealed_at = iso(now);
  updated.updated_at = iso(now);
  updated.revision = Number(current.revision||0)+1;
  return validateEnglishExamSession(updated);
}

function normalizeAnswers(value) {
  if (value === undefined) return {}; // Unvisited sealed section: genuinely unanswered.
  if (!record(value) || Object.values(value).some((answer) => typeof answer !== 'string')) {
    throw new Error('ENGLISH_EXAM_ANSWERS_UNREADABLE');
  }
  return clone(value);
}

function examEvidenceContext(payload = {}) {
  return {
    prior_exposure: ['unseen','exposed'].includes(payload?.prior_exposure) ? payload.prior_exposure : 'unknown',
    assistance: ['unassisted','assisted'].includes(payload?.assistance) ? payload.assistance : 'unknown',
    source_kind: String(payload?.source_kind || 'unknown'),
    evidence_role: payload?.evidence_role == null ? null : String(payload.evidence_role),
    semantic_source_hash: payload?.semantic_source_hash == null ? null : String(payload.semantic_source_hash),
    timing_status: String(payload?.timing_status || 'uncalibrated'),
    independent_transfer_candidate: payload?.independent_transfer_candidate === true
  };
}

export function releaseEnglishExamObjective(state, answerPacket, now = Date.now()) {
  const current = validateEnglishExamSession(state);
  if (current.status === 'ACTIVE') throw new Error('ENGLISH_EXAM_MUST_BE_SEALED');
  if (['RELEASED','SCORED'].includes(current.status)) return current;
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
    paper_assistance_context: clone(current.paper_assistance_context || null),
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


function parseEnglishExamReturnObject(input) {
  if (input && typeof input === 'object' && !Array.isArray(input)) return clone(input);
  const raw = String(input || '').trim();
  if (!raw) throw new Error('ENGLISH_EXAM_PRODUCTIVE_SCORE_RETURN_EMPTY');
  const candidates = [raw];
  const start = raw.indexOf('{'), end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) candidates.push(raw.slice(start, end + 1));
  for (const candidate of candidates) {
    try {
      const value = JSON.parse(candidate);
      if (value && typeof value === 'object' && !Array.isArray(value)) return value;
    } catch {}
  }
  throw new Error('ENGLISH_EXAM_PRODUCTIVE_SCORE_RETURN_INVALID_JSON');
}

function normalizeEnglishExamScoreRange(value, maxPoints, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('ENGLISH_EXAM_PRODUCTIVE_SCORE_RANGE_REQUIRED:' + label);
  }
  const low = value.low, high = value.high;
  if (!numberIn(low, maxPoints) || !numberIn(high, maxPoints) || high < low) {
    throw new Error('ENGLISH_EXAM_PRODUCTIVE_SCORE_RANGE_INVALID:' + label);
  }
  return { low: Number(low.toFixed(1)), high: Number(high.toFixed(1)) };
}

function englishExamProductiveStep(current, channel) {
  if (channel === 'translation') return current.steps.find((step) => step.task === 'translation') || null;
  const kind = channel === 'writing_small' ? 'small' : channel === 'writing_big' ? 'big' : null;
  if (!kind) return null;
  return current.steps.find((step) => step.task === 'writing' && step.writing_kind === kind) || null;
}

function englishExamWholePaperEvidenceQuality(current) {
  const contexts = current.steps.map((step) => examEvidenceContext(current.captures?.[step.step_id]?.payload || {}));
  const parent = current.paper_assistance_context;
  if (parent?.state === 'assisted' || contexts.some((row) => row.assistance === 'assisted')) return 'ASSISTED';
  if (contexts.some((row) => row.prior_exposure === 'exposed')) return 'EXPOSED';
  if (parent?.state === 'unknown'
    || contexts.some((row) => row.assistance === 'unknown' || row.prior_exposure === 'unknown')) return 'UNKNOWN';
  return 'LOW_CONTAMINATION';
}

export function validateEnglishExamProductiveScoreReturn(input, state) {
  const current = validateEnglishExamSession(state);
  if (current.status !== 'RELEASED' || !current.release?.objective) {
    throw new Error('ENGLISH_EXAM_PRODUCTIVE_SCORE_REQUIRES_RELEASED_OBJECTIVE');
  }
  const value = parseEnglishExamReturnObject(input);
  if (value.schema !== ENGLISH_EXAM_PRODUCTIVE_SCORE_RETURN_SCHEMA) {
    throw new Error('ENGLISH_EXAM_PRODUCTIVE_SCORE_RETURN_SCHEMA_INVALID');
  }
  if (String(value.session_id || '') !== current.session_id
    || String(value.paper_id || '') !== current.paper_id
    || String(value.paper_source_hash || '') !== String(current.source_hash || '')) {
    throw new Error('ENGLISH_EXAM_PRODUCTIVE_SCORE_SESSION_IDENTITY_MISMATCH');
  }
  if (String(value.scoring_standard_version || '') !== ENGLISH_EXAM_PRODUCTIVE_SCORING_STANDARD_VERSION) {
    throw new Error('ENGLISH_EXAM_PRODUCTIVE_SCORING_STANDARD_STALE_OR_UNBOUND');
  }
  if (value.review_of !== 'SEALED_FIRST_OUTPUT') {
    throw new Error('ENGLISH_EXAM_PRODUCTIVE_SCORE_REVIEW_TARGET_INVALID');
  }
  const sourceChannels = value.channels;
  if (!sourceChannels || typeof sourceChannels !== 'object' || Array.isArray(sourceChannels)) {
    throw new Error('ENGLISH_EXAM_PRODUCTIVE_SCORE_CHANNELS_REQUIRED');
  }
  const definitions = {
    translation: 10,
    writing_small: 10,
    writing_big: 20
  };
  const channels = {};
  for (const [channel, maxPoints] of Object.entries(definitions)) {
    const row = sourceChannels[channel];
    const step = englishExamProductiveStep(current, channel);
    if (!step || !row || typeof row !== 'object' || Array.isArray(row)) {
      throw new Error('ENGLISH_EXAM_PRODUCTIVE_SCORE_CHANNEL_REQUIRED:' + channel);
    }
    if (String(row.step_id || '') !== step.step_id
      || String(row.object_id || '') !== step.object_id
      || String(row.source_hash || '') !== String(step.source_hash || '')) {
      throw new Error('ENGLISH_EXAM_PRODUCTIVE_SCORE_CHANNEL_IDENTITY_MISMATCH:' + channel);
    }
    const confidence = String(row.confidence || '').toUpperCase();
    if (!['HIGH','MEDIUM','LOW'].includes(confidence)) {
      throw new Error('ENGLISH_EXAM_PRODUCTIVE_SCORE_CONFIDENCE_INVALID:' + channel);
    }
    const reviewMode = String(row.review_mode || '').toUpperCase();
    if (!['ANCHORED_SINGLE','INDEPENDENT_RESCORE_RECONCILED'].includes(reviewMode)) {
      throw new Error('ENGLISH_EXAM_PRODUCTIVE_SCORE_REVIEW_MODE_INVALID:' + channel);
    }
    if (row.requires_independent_rescore !== false) {
      throw new Error('ENGLISH_EXAM_PRODUCTIVE_RESCORE_REQUIRED_BEFORE_IMPORT:' + channel);
    }
    const range = normalizeEnglishExamScoreRange(row.score_range, maxPoints, channel);
    if (range.high > 0 && !hasProductiveOutput(step, current.captures[step.step_id]?.payload)) {
      throw new Error('ENGLISH_EXAM_SCORE_WITHOUT_PRODUCTIVE_OUTPUT:' + channel);
    }
    channels[channel] = {
      step_id: step.step_id,
      object_id: step.object_id,
      source_hash: step.source_hash || null,
      score_range: range,
      confidence,
      review_mode: reviewMode,
      requires_independent_rescore: false
    };
  }
  return {
    schema: ENGLISH_EXAM_PRODUCTIVE_SCORE_RETURN_SCHEMA,
    session_id: current.session_id,
    paper_id: current.paper_id,
    paper_source_hash: current.source_hash || null,
    scoring_standard_version: ENGLISH_EXAM_PRODUCTIVE_SCORING_STANDARD_VERSION,
    review_of: 'SEALED_FIRST_OUTPUT',
    channels
  };
}

export function applyEnglishExamProductiveScoreReturn(state, input, now = Date.now()) {
  const current = validateEnglishExamSession(state);
  const scored = validateEnglishExamProductiveScoreReturn(input, current);
  const productRows = Object.values(scored.channels);
  const productiveRange = {
    low: Number(productRows.reduce((sum, row) => sum + row.score_range.low, 0).toFixed(1)),
    high: Number(productRows.reduce((sum, row) => sum + row.score_range.high, 0).toFixed(1))
  };
  const objectivePoints = current.release.objective.points;
  if (!numberIn(objectivePoints, 60)) throw new Error('ENGLISH_EXAM_OBJECTIVE_SCORE_MISSING');
  const integratedRange = {
    low: Number((objectivePoints + productiveRange.low).toFixed(1)),
    high: Number((objectivePoints + productiveRange.high).toFixed(1))
  };
  const updated = clone(current);
  updated.status = 'SCORED';
  updated.scored_at = iso(now);
  updated.updated_at = iso(now);
  updated.revision = Number(current.revision || 0) + 1;
  updated.release.productive = {
    status: 'SCORED',
    max_points: Number(current.productive_max_points || 40),
    scoring_standard_version: scored.scoring_standard_version,
    review_of: scored.review_of,
    score_range: productiveRange,
    channels: clone(scored.channels),
    scored_at: updated.scored_at
  };
  updated.release.integrated = {
    score_range: integratedRange,
    max_points: Number(current.total_points || 100),
    evidence_quality: englishExamWholePaperEvidenceQuality(current),
    modality: 'TYPED',
    score_eligible: false,
    productive_scoring_standard_version: scored.scoring_standard_version,
    boundary: 'BROWSER_TYPED_WHOLE_PAPER_IS_DIAGNOSTIC_NOT_FORMAL_PAPER_CALIBRATION'
  };
  return updated;
}

export function englishExamProductiveScoreReturnContract(state) {
  const current = validateEnglishExamSession(state);
  if (current.status !== 'RELEASED') return null;
  const channel = (name) => {
    const step = englishExamProductiveStep(current, name);
    return step ? {
      step_id: step.step_id,
      object_id: step.object_id,
      source_hash: step.source_hash || null,
      score_range: { low: '<number>', high: '<number>' },
      confidence: 'HIGH | MEDIUM | LOW',
      review_mode: 'ANCHORED_SINGLE | INDEPENDENT_RESCORE_RECONCILED',
      requires_independent_rescore: false
    } : null;
  };
  return {
    schema: ENGLISH_EXAM_PRODUCTIVE_SCORE_RETURN_SCHEMA,
    session_id: current.session_id,
    paper_id: current.paper_id,
    paper_source_hash: current.source_hash || null,
    scoring_standard_version: ENGLISH_EXAM_PRODUCTIVE_SCORING_STANDARD_VERSION,
    review_of: 'SEALED_FIRST_OUTPUT',
    channels: {
      translation: channel('translation'),
      writing_small: channel('writing_small'),
      writing_big: channel('writing_big')
    },
    boundary: 'Score only the preserved sealed first outputs. If an independent re-score is still required, do not mark it false merely to make the packet importable. Deliver the completed object as the payload of english.exam_score_return through the existing private control relay. An accepted return displays reference ranges directly, without another learner confirmation; it is not formal exam calibration.'
  };
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
    productive_score_evidence: current.release?.productive?.status === 'SCORED' ? clone(current.release.productive) : null,
    integrated_score_evidence: current.release?.integrated ? clone(current.release.integrated) : null,
    paper_assistance_context: clone(current.paper_assistance_context || null),
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
    paper_assistance_context: clone(current.paper_assistance_context || null),
    steps: current.steps.map((step) => ({
      ...clone(step),
      capture: clone(current.captures?.[step.step_id] || null)
    })),
    release: clone(current.release),
    forecast_input: buildEnglishExamForecastInput(current),
    productive_score_return_contract: englishExamProductiveScoreReturnContract(current)
  };
}


export function englishExamTaskStorageKey(sessionId, task, objectId) {
  return `kianos-english-exam-task-v1:${sessionId}:${task}:${objectId}`;
}

export function englishExamPayload(task, local) {
  if (!record(local)) throw new Error('ENGLISH_EXAM_TASK_PAYLOAD_UNREADABLE');
  const first=local?.firstEvidenceMeta&&typeof local.firstEvidenceMeta==='object'?local.firstEvidenceMeta:{};
  const binding=local?.binding&&typeof local.binding==='object'?local.binding:{};
  const evidence={...binding,...first};
  const common={
    started_at:local.startedAt||local.createdAt||null,
    source_hash:binding.source_hash||local.sourceHash||null,
    semantic_source_hash:evidence.semantic_source_hash||binding.source_hash||local.sourceHash||null,
    attempt_id:binding.attempt_id||null,
    prior_exposure:String(evidence.prior_exposure||'unknown'),
    assistance:String(evidence.assistance||'unknown'),
    source_kind:String(evidence.source_kind||'unknown'),
    evidence_role:evidence.evidence_role==null?null:String(evidence.evidence_role),
    timing_status:String(evidence.timing_status||'uncalibrated'),
    independent_transfer_candidate:evidence.independent_transfer_candidate===true
  };
  const requiredAnswers = (field) => {
    if (!Object.hasOwn(local, field) || !record(local[field])) {
      throw new Error('ENGLISH_EXAM_TASK_OUTPUT_UNREADABLE:' + task + ':' + field);
    }
    return normalizeAnswers(local[field]);
  };
  if (OBJECTIVE_TASKS.has(task)) {
    return {...common, answers: requiredAnswers('answers'),
      uncertain: clone(local.uncertain || []), trajectory: clone(local.trajectory || {})};
  }
  if (task === 'translation') {
    const answers = requiredAnswers('drafts');
    // Older unsubmitted records may omit firstAttempts; a supplied value must
    // still be readable. Seal also preserves every previously captured first output.
    const firstAttempts = Object.hasOwn(local, 'firstAttempts')
      ? requiredAnswers('firstAttempts') : {};
    return {...common, answers, first_attempts: firstAttempts};
  }
  if (task === 'writing') {
    if (!Object.hasOwn(local, 'draftEssay') || typeof local.draftEssay !== 'string'
        || (local.firstDraft != null && typeof local.firstDraft !== 'string')) {
      throw new Error('ENGLISH_EXAM_TASK_OUTPUT_UNREADABLE:writing:draftEssay_or_firstDraft');
    }
    // Empty strings/maps are explicit blank work, unlike an absent output field.
    return {...common, plan_mode: local.planMode || 'direct',
      plan: local.planMode === 'planned' ? local.draftPlan || '' : '',
      essay: local.draftEssay, first_draft: local.firstDraft ?? ''};
  }
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

// Transient native projection into the existing Forecast input. No second score ledger.
export function buildEnglishExamForecastInput(state) {
  const current = validateEnglishExamSession(state);
  const basis = {session_id: current.session_id, paper_id: current.paper_id,
    source_hash: current.source_hash, revision: current.revision};
  const channels = {};
  if (['RELEASED','SCORED'].includes(current.status)) {
    const points = current.release.objective.points;
    channels.objective = {range: {low: points, high: points}, score_eligible: false,
      evidence_quality: englishExamWholePaperEvidenceQuality(current), modality: 'BROWSER', evidence_basis: basis};
  }
  if (current.status === 'SCORED') for (const [id, row] of Object.entries(current.release.productive.channels)) {
    channels[id] = {range: clone(row.score_range), score_eligible: false,
      scoring_standard_version: current.release.productive.scoring_standard_version,
      evidence_quality: englishExamWholePaperEvidenceQuality(current), modality: 'TYPED', evidence_basis: basis};
  }
  return {schema: 'kianos.english.forecast-input.v1', evidence_basis: basis, task_families: {},
    score_channels: channels,
    whole_paper: current.status === 'SCORED' ? {...clone(current.release.integrated), evidence_basis: basis} : {}};
}
