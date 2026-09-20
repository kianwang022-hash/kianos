import {atomicEnglishWrites,readEnglishExposure,ENGLISH_MATERIAL_EXPOSURE_KEY} from './englishLearnerEvidence.mjs';
import {
  readEnglishExamSession,
  summarizeEnglishExamSession
} from './englishExamSession.mjs';

export const ENGLISH_SESSION_SCHEMA = 'kianos.english.session-instruction.v1';
export const ENGLISH_SESSION_KEY = 'kianos-english-session-instruction-v1';
export const ENGLISH_EVIDENCE_SCHEMA = 'kianos.english.evidence.v1';

export const ENGLISH_SESSION_TASKS = Object.freeze([
  'reading_a',
  'cloze',
  'reading_b',
  'external_reading',
  'translation',
  'writing',
  'full_paper'
]);

const LAST_LOCATION_KEYS = Object.freeze({
  reading_a: 'kianos-reading-last-location-v1',
  cloze: 'kianos-cloze-last-location-v1',
  reading_b: 'kianos-reading-b-last-location-v1',
  external_reading: 'kianos-english-external-reading-last-location-v1',
  translation: 'kianos-translation-last-location-v1',
  writing: 'kianos-writing-last-location-v1'
});

const clean = (value, max = 500) => String(value || '').trim().slice(0, max);
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

const validDay = (day) => typeof day === 'string'
  && /^\d{4}-\d{2}-\d{2}$/.test(day)
  && !Number.isNaN(Date.parse(day + 'T00:00:00Z'))
  && new Date(day + 'T00:00:00Z').toISOString().slice(0, 10) === day;

const readJson = (storage, key) => {
  if (!storage?.getItem) return null;
  try {
    return JSON.parse(storage.getItem(key) || 'null');
  } catch {
    return null;
  }
};

function normalizeStep(step, index) {
  if (!step || typeof step !== 'object' || Array.isArray(step)) {
    throw new Error('ENGLISH_SESSION_STEP_INVALID:' + index);
  }
  const task = clean(step.task, 40);
  if (!ENGLISH_SESSION_TASKS.includes(task)) {
    throw new Error('ENGLISH_SESSION_TASK_INVALID:' + (task || 'missing'));
  }
  const objectId = clean(step.object_id || step.objectId, 240);
  if (!objectId) throw new Error('ENGLISH_SESSION_OBJECT_REQUIRED:' + task);
  if (!/^[A-Za-z0-9._:-]+$/.test(objectId)) {
    throw new Error('ENGLISH_SESSION_OBJECT_INVALID:' + task);
  }
  let params = {};
  if (step.params != null) {
    if (!step.params || typeof step.params !== 'object' || Array.isArray(step.params)) {
      throw new Error('ENGLISH_SESSION_PARAMS_INVALID:' + task);
    }
    if (task === 'full_paper' && step.params.task_order != null) {
      if (!Array.isArray(step.params.task_order)) {
        throw new Error('ENGLISH_SESSION_EXAM_ORDER_INVALID');
      }
      params.task_order = step.params.task_order.map((value) => clean(value, 40)).filter(Boolean);
    }
  }
  if(step.params?.time_budget_seconds != null){
    const n=Number(step.params.time_budget_seconds);if(!Number.isFinite(n)||n<=0||n>10800)throw new Error('ENGLISH_SESSION_TIME_BUDGET_INVALID');params.time_budget_seconds=n;
  }
  if(step.params?.material_exposure != null){
    const declaration=step.params.material_exposure;
    if(!['unseen','exposed','unknown'].includes(declaration.state)||declaration.basis!=='learner_statement'||!declaration.note||!Number.isFinite(Date.parse(declaration.observed_at)))throw new Error('ENGLISH_MATERIAL_DECLARATION_INVALID');
    params.material_exposure={state:declaration.state,basis:'learner_statement',note:clean(declaration.note,400),observed_at:new Date(declaration.observed_at).toISOString()};
  }
  if(step.params?.assistance_context != null){
    const declaration=step.params.assistance_context;
    if(!['assisted','unknown'].includes(declaration.state)
      || !['chat_context','learner_statement'].includes(declaration.basis)
      || !declaration.note
      || !Number.isFinite(Date.parse(declaration.observed_at)))throw new Error('ENGLISH_ASSISTANCE_DECLARATION_INVALID');
    params.assistance_context={
      state:declaration.state,
      basis:declaration.basis,
      note:clean(declaration.note,400),
      observed_at:new Date(declaration.observed_at).toISOString()
    };
  }
  return {
    step_id: clean(step.step_id || step.stepId || ('step-' + (index + 1)), 80),
    task,
    object_id: objectId,
    source_hash: clean(step.source_hash, 128),
    label: clean(step.label, 180),
    note: clean(step.note, 800),
    params
  };
}

export function validateEnglishSessionInstruction(value, expectedDay = null) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('ENGLISH_SESSION_OBJECT_REQUIRED');
  }
  if (value.schema !== ENGLISH_SESSION_SCHEMA) {
    throw new Error('ENGLISH_SESSION_SCHEMA_INVALID:' + (value?.schema || 'missing'));
  }
  const sessionId = clean(value.session_id || value.sessionId, 120);
  if (!sessionId) throw new Error('ENGLISH_SESSION_ID_REQUIRED');

  const studyDay = clean(value.study_day || value.studyDay, 20);
  if (!validDay(studyDay)) throw new Error('ENGLISH_SESSION_STUDY_DAY_INVALID');
  if (expectedDay && studyDay !== expectedDay) {
    throw new Error('ENGLISH_SESSION_STALE:' + studyDay + ':' + expectedDay);
  }

  const generatedAt = clean(value.generated_at || value.generatedAt, 80);
  if (!generatedAt || Number.isNaN(Date.parse(generatedAt))) {
    throw new Error('ENGLISH_SESSION_GENERATED_AT_INVALID');
  }

  const steps = Array.isArray(value.steps) ? value.steps.map(normalizeStep) : [];
  if (!steps.length || steps.length > 20) {
    throw new Error('ENGLISH_SESSION_STEP_COUNT_INVALID:' + steps.length);
  }

  if (new Set(steps.map(step => step.step_id)).size !== steps.length) throw new Error('ENGLISH_SESSION_DUPLICATE_STEP');

  const currentStep = Number(value.current_step ?? value.currentStep ?? 0);
  if (!Number.isInteger(currentStep) || currentStep < 0 || currentStep >= steps.length) {
    throw new Error('ENGLISH_SESSION_CURRENT_STEP_INVALID:' + currentStep);
  }

  return {
    schema: ENGLISH_SESSION_SCHEMA,
    session_id: sessionId,
    study_day: studyDay,
    generated_at: new Date(generatedAt).toISOString(),
    current_step: currentStep,
    steps,
    return_policy: {
      on_finish: clean(value?.return_policy?.on_finish || value?.returnPolicy?.onFinish || 'english_home', 80)
    }
  };
}

export function parseEnglishSessionInstruction(input, expectedDay = null) {
  if (input && typeof input === 'object') {
    return validateEnglishSessionInstruction(input, expectedDay);
  }
  const raw = String(input || '').trim();
  if (!raw) throw new Error('ENGLISH_SESSION_IMPORT_EMPTY');

  const candidates = [raw];
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) candidates.push(raw.slice(start, end + 1));

  for (const candidate of candidates) {
    try {
      return validateEnglishSessionInstruction(JSON.parse(candidate), expectedDay);
    } catch {}
  }
  throw new Error('ENGLISH_SESSION_IMPORT_INVALID');
}

export function readEnglishSessionInstruction(storage, expectedDay = null) {
  if (!storage?.getItem) {
    return { status: 'unavailable', instruction: null, error: 'Storage unavailable.' };
  }
  const raw = storage.getItem(ENGLISH_SESSION_KEY);
  if (raw == null) return { status: 'missing', instruction: null, error: null };
  try {
    const parsed = JSON.parse(raw);
    if (expectedDay && parsed?.study_day && parsed.study_day !== expectedDay) {
      return {
        status: 'stale',
        instruction: null,
        error: 'Session is for ' + parsed.study_day + ', not ' + expectedDay + '.'
      };
    }
    return {
      status: 'ready',
      instruction: validateEnglishSessionInstruction(parsed, expectedDay),
      error: null
    };
  } catch (error) {
    return {
      status: 'invalid',
      instruction: null,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export function writeEnglishSessionInstruction(storage, input, expectedDay = null, { catalog, now = Date.now() } = {}) {
  if (!storage?.setItem) throw new Error('ENGLISH_SESSION_STORAGE_UNAVAILABLE');
  const instruction = parseEnglishSessionInstruction(input, expectedDay);
  if (!Array.isArray(catalog)) throw new Error('ENGLISH_SESSION_CURRENT_CATALOG_REQUIRED');
  if (Date.parse(instruction.generated_at) > Number(now) + 60_000) throw new Error('ENGLISH_SESSION_FUTURE_INSTRUCTION');
  for (const step of instruction.steps) {
    const owner = catalog.find(row => row.task === step.task && row.object_id === step.object_id);
    if (!owner) throw new Error('ENGLISH_SESSION_OBJECT_NOT_CURRENT:' + step.object_id);
    if (owner.study_day && expectedDay && owner.study_day !== expectedDay) throw new Error('ENGLISH_SESSION_OBJECT_STALE_DAY:' + step.object_id);
    if (!step.source_hash || step.source_hash !== owner.source_hash) throw new Error('ENGLISH_SESSION_SOURCE_REVISION_MISMATCH:' + step.object_id);
    if (step.task === 'full_paper' && step.params.task_order) {
      const order = step.params.task_order;
      const expected = ['cloze','reading_a','reading_b','translation','writing'];
      if (order.length !== expected.length || new Set(order).size !== expected.length || order.some(x => !expected.includes(x))) throw new Error('ENGLISH_SESSION_EXAM_ORDER_INVALID');
    }
  }
  const raw = storage.getItem(ENGLISH_SESSION_KEY);
  if (raw) {
    let prior;
    try { prior = validateEnglishSessionInstruction(JSON.parse(raw)); }
    catch { throw new Error('ENGLISH_SESSION_EXISTING_DATA_UNREADABLE_EXPORT_BEFORE_REPLACE'); }
    if (prior.session_id === instruction.session_id) {
      // Progress is local execution of the same instruction; replay must not rewind it.
      const body = value => JSON.stringify({...value, current_step:0});
      if (body(prior) !== body(instruction)) throw new Error('ENGLISH_SESSION_REPLAY_CONFLICT');
      return prior;
    }
    if (Date.parse(instruction.generated_at) <= Date.parse(prior.generated_at)) throw new Error('ENGLISH_SESSION_OLDER_INSTRUCTION');
  }
  const declarations=instruction.steps.filter(s=>s.params.material_exposure);
  const changes=[[ENGLISH_SESSION_KEY,instruction]];
  if(declarations.length){
    const exposure=readEnglishExposure(storage);
    for(const step of declarations){
      const d=step.params.material_exposure;
      if(Date.parse(d.observed_at)>Date.parse(instruction.generated_at))throw new Error('ENGLISH_MATERIAL_DECLARATION_FUTURE');
      const owner=catalog.find(r=>r.task===step.task&&r.object_id===step.object_id);
      const ids=step.task==='full_paper'?owner.material_ids:[step.object_id];
      if(!ids?.length)throw new Error('ENGLISH_MATERIAL_DECLARATION_IDENTITIES_REQUIRED');
      for(const id of ids){
        const m=exposure.materials[id]||{object_id:id,events:[]};
        if(d.state==='unseen'&&(m.events.length||m.declaration?.state==='exposed'||['kianos-reading-attempt-v1:','kianos-cloze-attempt-v1:','kianos-reading-b-attempt-v1:','kianos-english-external-reading-attempt-v1:','kianos-translation-attempt-v2:','kianos-writing-runtime-v1:'].some(prefix=>storage.getItem(prefix+id)!=null)))throw new Error('ENGLISH_MATERIAL_ALREADY_EXPOSED:'+id);
        if(m.declaration&&Date.parse(d.observed_at)<Date.parse(m.declaration.observed_at))throw new Error('ENGLISH_MATERIAL_DECLARATION_STALE');
        m.declaration={...d,session_instruction_id:instruction.session_id};exposure.materials[id]=m;
      }
    }
    changes.push([ENGLISH_MATERIAL_EXPOSURE_KEY,exposure]);
  }
  // Whole instruction + optional learner-supplied facts commit atomically.
  atomicEnglishWrites(storage,changes);
  return instruction;
}

export function englishStepIsComplete(storage, step) {
  const prefixes = {reading_a:'kianos-reading-attempt-v1:',cloze:'kianos-cloze-attempt-v1:',reading_b:'kianos-reading-b-attempt-v1:',external_reading:'kianos-english-external-reading-attempt-v1:',translation:'kianos-translation-attempt-v2:',writing:'kianos-writing-runtime-v1:'};
  if (step?.task === 'full_paper') {
    const exam = readEnglishExamSession(storage);
    return exam?.paper_id === step.object_id && Boolean(step.source_hash) && exam.source_hash === step.source_hash && exam.status === 'RELEASED';
  }
  const value = readJson(storage, (prefixes[step?.task] || '') + step?.object_id);
  if (!value) return false;
  if (!value.binding || value.binding.source_hash !== step.source_hash) return false;
  if (['reading_a','cloze','reading_b'].includes(step.task)) return value.submitted === true && (problemCount(value) === 0 || value.reviewResolved === true);
  if (step.task === 'external_reading') {
    const requirement = value?.binding?.source_snapshot?.completion_requirement || 'READ_ONLY_OK';
    if (requirement === 'QUESTIONS_SUBMITTED') return value.submitted === true;
    return value.stage === 'completed';
  }
  if (step.task === 'translation') return ['passed','repaired','transfer_pending'].includes(value.stage);
  return ['PASS_ACCEPTABLE','REPAIR_COMPLETE','TRANSFER_PENDING'].includes(value.state);
}

export function resolveEnglishSessionStep(storage, instruction, catalog) {
  // Follow only Chat's explicit ordering; never rank unrelated tasks.
  for (let i=instruction.current_step;i<instruction.steps.length;i+=1) {
    const step=instruction.steps[i];
    if (!catalog.some(row=>row.task===step.task && row.object_id===step.object_id && row.source_hash===step.source_hash)) return null;
    if (!englishStepIsComplete(storage,step)) return {step,index:i};
  }
  return null;
}

export function clearEnglishSessionInstruction(storage) {
  if (!storage?.removeItem) return;
  storage.removeItem(ENGLISH_SESSION_KEY);
}

export function englishSessionStepHref(step, base = '/') {
  if (!step || !ENGLISH_SESSION_TASKS.includes(step.task) || !step.object_id) return null;
  const normalizedBase = String(base || '/').endsWith('/') ? String(base || '/') : String(base || '/') + '/';
  if (step.task === 'external_reading') {
    return normalizedBase + 'external-reading/?id=' + encodeURIComponent(step.object_id);
  }
  const prefix = ({
    reading_a: 'reading',
    cloze: 'cloze',
    reading_b: 'reading-b',
    translation: 'translation',
    writing: 'writing',
    full_paper: 'english-exam'
  })[step.task];
  return normalizedBase + prefix + '/' + encodeURIComponent(step.object_id) + '/';
}

function problemCount(attempt = {}) {
  const uncertain = new Set(Array.isArray(attempt?.uncertain) ? attempt.uncertain.map(String) : []);
  return Object.keys(attempt?.results || {}).filter((id) =>
    ['wrong', 'unanswered'].includes(attempt?.results?.[id]) || uncertain.has(String(id))
  ).length;
}

function objectiveEvidence(storage, lastKey, attemptPrefix) {
  const last = readJson(storage, lastKey);
  if (!last?.id) return { last_object: null, attempt: null };
  const attempt = readJson(storage, attemptPrefix + last.id) || null;
  return {
    last_object: {
      id: String(last.id),
      title: clean(last.title, 180),
      href: clean(last.href, 280) || null,
      paper_id: clean(last.paperId, 120) || null,
      position: Number(last.position || 0) || null,
      total: Number(last.total || 0) || null
    },
    attempt: attempt ? {
      schema: clean(attempt.schema, 120) || null,
      submitted: attempt.submitted === true,
      stage: clean(attempt.stage, 80) || null,
      problem_count: problemCount(attempt),
      uncertain_count: Array.isArray(attempt.uncertain) ? attempt.uncertain.length : 0,
      started_at: clean(attempt.startedAt, 80) || null,
      submitted_at: clean(attempt.submittedAt, 80) || null,
      review_unlocked: attempt.reviewUnlocked !== false,
      generated_drill: attempt?.binding?.source_snapshot?.question_origin === 'CHAT_GENERATED' ? {
        question_origin: 'CHAT_GENERATED',
        drill_origin: clean(attempt.binding.source_snapshot.drill_origin, 100) || null,
        completion_requirement: clean(attempt.binding.source_snapshot.completion_requirement, 80) || null,
        training_target: attempt.binding.source_snapshot.training_target && typeof attempt.binding.source_snapshot.training_target === 'object'
          ? {
              kind: clean(attempt.binding.source_snapshot.training_target.kind, 120) || null,
              note: clean(attempt.binding.source_snapshot.training_target.note, 800) || null
            }
          : null
      } : null
    } : null
  };
}

function productiveEvidence(storage, task) {
  const last = readJson(storage, LAST_LOCATION_KEYS[task]);
  if (!last?.id) return { last_object: null, runtime: null };
  const key = task === 'translation'
    ? 'kianos-translation-attempt-v2:' + last.id
    : 'kianos-writing-runtime-v1:' + last.id;
  const state = readJson(storage, key);
  return {
    last_object: {
      id: String(last.id),
      title: clean(last.title, 180),
      href: clean(last.href, 280) || null,
      state: clean(last.stage || last.state, 80) || null,
      updated_at: clean(last.updatedAt || last.updated_at, 80) || null
    },
    runtime: state ? {
      schema: clean(state.schema, 120) || null,
      state: clean(state.stage || state.state, 80) || null,
      has_first_attempt: Boolean(
        (state.firstAttempts && Object.keys(state.firstAttempts).length)
        || clean(state.firstDraft, 20)
        || clean(state.firstSubmittedAt, 80)
      ),
      updated_at: clean(state.updatedAt || state.updated_at, 80) || null
    } : null
  };
}


export function englishAttemptInventory(storage) {
  const prefixes={reading_a:'kianos-reading-attempt-v1:',cloze:'kianos-cloze-attempt-v1:',reading_b:'kianos-reading-b-attempt-v1:',external_reading:'kianos-english-external-reading-attempt-v1:',translation:'kianos-translation-attempt-v2:',writing:'kianos-writing-runtime-v1:'};
  const rows=[];
  for(let i=0;i<Number(storage.length||0);i+=1){
    const key=storage.key(i);
    for(const [task,prefix] of Object.entries(prefixes)){
      if(!key?.startsWith(prefix))continue;
      const value=readJson(storage,key);if(!value) {rows.push({task,object_id:key.slice(prefix.length),data_status:'unreadable'});continue;}
      rows.push({task,object_id:key.slice(prefix.length),source_hash:value.sourceHash||value.binding?.source_hash||null,attempt_id:value.attemptId||value.binding?.attempt_id||null,submitted:value.submitted===true,stage:value.stage||value.state||null,problem_count:problemCount(value),started_at:value.startedAt||value.createdAt||null,submitted_at:value.firstSubmittedAt||value.submittedAt||null,updated_at:value.updatedAt||value.saved_at||null,prior_exposure:value.binding?.prior_exposure||'unknown',assistance:value.binding?.assistance||'unknown',complete:englishStepIsComplete(storage,{task,object_id:key.slice(prefix.length),source_hash:value.binding?.source_hash}),first_evidence:value.firstEvidenceMeta||null});
    }
  }
  return rows; // Facts, never a recommendation or a priority score.
}


export const ENGLISH_PERFORMANCE_PROFILE_SCHEMA = 'kianos.english.performance-profile.v1';
export const ENGLISH_PACKET_RECENT_PER_TASK = 8;

const ENGLISH_PROFILE_TASKS = Object.freeze([
  'reading_a',
  'cloze',
  'reading_b',
  'external_reading',
  'translation',
  'writing'
]);

const ENGLISH_PROFILE_TASK_ROLE = Object.freeze({
  reading_a: 'EXAM_OBJECTIVE',
  cloze: 'EXAM_OBJECTIVE',
  reading_b: 'EXAM_OBJECTIVE',
  external_reading: 'GROWTH_READING',
  translation: 'EXAM_PRODUCTIVE',
  writing: 'EXAM_PRODUCTIVE'
});

function englishAttemptTimestamp(row) {
  for (const raw of [
    row?.submitted_at,
    row?.updated_at,
    row?.started_at,
    row?.first_evidence?.submitted_at,
    row?.first_evidence?.observed_at
  ]) {
    const value = Date.parse(String(raw || ''));
    if (Number.isFinite(value)) return value;
  }
  return Number.NEGATIVE_INFINITY;
}

function countValues(rows, getter, values) {
  const out = Object.fromEntries(values.map((value) => [value, 0]));
  out.other = 0;
  for (const row of rows) {
    const value = String(getter(row) || 'unknown');
    if (Object.prototype.hasOwnProperty.call(out, value)) out[value] += 1;
    else out.other += 1;
  }
  return out;
}

function medianNumber(values) {
  const rows = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!rows.length) return null;
  const mid = Math.floor(rows.length / 2);
  return rows.length % 2 ? rows[mid] : Number(((rows[mid - 1] + rows[mid]) / 2).toFixed(2));
}

function safeIndependentTransferCandidate(row) {
  const meta = row?.first_evidence;
  if (!meta || typeof meta !== 'object') return false;
  return meta.independent_transfer_candidate === true
    && row?.prior_exposure === 'unseen'
    && row?.assistance === 'unassisted'
    && meta.timing_status !== 'budget_exceeded';
}

function timingProfile(rows) {
  const metas = rows.map((row) => row?.first_evidence).filter((meta) => meta && typeof meta === 'object');
  const elapsed = metas.map((meta) => Number(meta.elapsed_seconds)).filter(Number.isFinite);
  const ratios = metas
    .map((meta) => {
      const elapsedSeconds = Number(meta.elapsed_seconds);
      const budgetSeconds = Number(meta.time_budget_seconds);
      if (!Number.isFinite(elapsedSeconds) || !Number.isFinite(budgetSeconds) || budgetSeconds <= 0) return null;
      return Number((elapsedSeconds / budgetSeconds).toFixed(3));
    })
    .filter(Number.isFinite);
  const timing = countValues(
    metas,
    (meta) => meta?.timing_status || 'uncalibrated',
    ['within_explicit_budget', 'budget_exceeded', 'uncalibrated']
  );
  return {
    first_evidence_samples: metas.length,
    elapsed_samples: elapsed.length,
    calibrated_samples: timing.within_explicit_budget + timing.budget_exceeded,
    within_explicit_budget: timing.within_explicit_budget,
    budget_exceeded: timing.budget_exceeded,
    uncalibrated: timing.uncalibrated + timing.other,
    median_elapsed_seconds: medianNumber(elapsed),
    median_budget_ratio: medianNumber(ratios)
  };
}

function taskPerformanceProfile(allRows, recentRows, task) {
  const history = allRows.filter((row) => row.task === task);
  const recent = recentRows.filter((row) => row.task === task);
  const objectiveLike = ['reading_a','cloze','reading_b','external_reading'].includes(task);
  const productive = ['translation','writing'].includes(task);

  const summarize = (rows) => {
    const cleanTimingRows = rows.filter((row) =>
      row?.prior_exposure === 'unseen'
      && row?.assistance === 'unassisted'
    );
    const summary = {
      attempts: rows.length,
      unreadable_attempts: rows.filter((row) => row.data_status === 'unreadable').length,
      workflow_complete_attempts: rows.filter((row) => row.complete === true).length,
      independent_transfer_candidates: rows.filter(safeIndependentTransferCandidate).length,
      exposure: countValues(rows, (row) => row.prior_exposure || 'unknown', ['unseen', 'exposed', 'unknown']),
      assistance: countValues(rows, (row) => row.assistance || 'unknown', ['unassisted', 'assisted', 'unknown']),
      timing_basis: 'UNSEEN_UNASSISTED_ONLY',
      timing: timingProfile(cleanTimingRows),
      timing_all: timingProfile(rows)
    };

    if (objectiveLike) {
      summary.problem_bearing_attempts = rows.filter((row) => Number(row.problem_count || 0) > 0).length;
    }

    if (productive) {
      const repairStates = task === 'translation'
        ? new Set(['repaired','transfer_pending'])
        : new Set(['REPAIR_COMPLETE','TRANSFER_PENDING']);
      summary.repair_bearing_attempts = rows.filter((row) => repairStates.has(String(row.stage || ''))).length;
    }

    return summary;
  };

  return {
    role: ENGLISH_PROFILE_TASK_ROLE[task],
    evidence_shape: objectiveLike ? 'QUESTION_OUTCOME' : 'PRODUCTIVE_REPAIR_STATE',
    history: summarize(history),
    recent: summarize(recent)
  };
}

export function boundedEnglishAttemptInventory(rows, perTaskLimit = ENGLISH_PACKET_RECENT_PER_TASK) {
  const limit = Math.max(1, Math.min(20, Math.floor(Number(perTaskLimit) || ENGLISH_PACKET_RECENT_PER_TASK)));
  const selected = [];
  for (const task of ENGLISH_PROFILE_TASKS) {
    selected.push(
      ...rows
        .filter((row) => row.task === task)
        .sort((a, b) => englishAttemptTimestamp(b) - englishAttemptTimestamp(a))
        .slice(0, limit)
    );
  }
  return selected.sort((a, b) => englishAttemptTimestamp(b) - englishAttemptTimestamp(a));
}

export function buildEnglishPerformanceProfile(rows, {
  recentPerTask = ENGLISH_PACKET_RECENT_PER_TASK
} = {}) {
  const allRows = Array.isArray(rows) ? rows : [];
  const recentRows = boundedEnglishAttemptInventory(allRows, recentPerTask);
  return {
    schema: ENGLISH_PERFORMANCE_PROFILE_SCHEMA,
    semantics: 'TASK_LOCAL_DERIVED_TELEMETRY; NOT_MASTERY; NOT_CROSS_TASK_PRIORITY; INDEPENDENT_TRANSFER_CANDIDATE_IS_ELIGIBILITY_ONLY',
    recent_per_task_limit: Math.max(1, Math.min(20, Math.floor(Number(recentPerTask) || ENGLISH_PACKET_RECENT_PER_TASK))),
    total_attempts: allRows.length,
    recent_attempts_included: recentRows.length,
    truncated: recentRows.length < allRows.length,
    tasks: Object.fromEntries(
      ENGLISH_PROFILE_TASKS.map((task) => [task, taskPerformanceProfile(allRows, recentRows, task)])
    ),
    guardrails: [
      'RAW_PRIVATE_HISTORY_REMAINS_LOCAL',
      'DO_NOT_COMPARE_RAW_ELAPSED_TIME_ACROSS_TASK_TYPES',
      'DEFAULT_TIMING_USES_UNSEEN_UNASSISTED_ATTEMPTS_ONLY',
      'TIMING_ALL_IS_OBSERVATIONAL_NOT_CLEAN_SPEED_CALIBRATION',
      'EXPOSED_OR_ASSISTED_WORK_IS_NOT_INDEPENDENT_TRANSFER',
      'UNCALIBRATED_TIMING_IS_UNKNOWN_NOT_SLOW',
      'TRANSLATION_AND_WRITING_HAVE_NO_AUTO_SCORE',
      'PROFILE_CREATES_NO_REVIEW_OR_TEST_DEBT',
      'WORKFLOW_COMPLETE_IS_NOT_PERFORMANCE_SUCCESS'
    ]
  };
}

function englishInventoryPacketView(rows, perTaskLimit = ENGLISH_PACKET_RECENT_PER_TASK) {
  const recent = boundedEnglishAttemptInventory(rows, perTaskLimit);
  const totalsByTask = Object.fromEntries(
    ENGLISH_PROFILE_TASKS.map((task) => [task, rows.filter((row) => row.task === task).length])
  );
  return {
    inventory: recent,
    inventory_meta: {
      total_attempts: rows.length,
      included_attempts: recent.length,
      truncated: recent.length < rows.length,
      recent_per_task_limit: Math.max(1, Math.min(20, Math.floor(Number(perTaskLimit) || ENGLISH_PACKET_RECENT_PER_TASK))),
      total_by_task: totalsByTask,
      semantics: 'BOUNDED_RECENT_EXACT_ATTEMPTS; FULL_RAW_HISTORY_STAYS_IN_PRIVATE_STORAGE'
    }
  };
}


function englishResumeEvidence(storage, day) {
  const sessionState = readEnglishSessionInstruction(storage, day);
  if (sessionState.status === 'ready' && sessionState.instruction) {
    const instruction = sessionState.instruction;
    for (let index = instruction.current_step; index < instruction.steps.length; index += 1) {
      const step = instruction.steps[index];
      if (englishStepIsComplete(storage, step)) continue;
      return {
        status: 'ready',
        session_id: instruction.session_id,
        session_generated_at: instruction.generated_at,
        step_index: index,
        step_count: instruction.steps.length,
        task: step.task,
        object_id: step.object_id,
        source_hash: step.source_hash || null,
        label: step.label || null,
        note: step.note || null,
        href: englishSessionStepHref(step, '/')
      };
    }
    return {
      status: 'session_complete',
      session_id: instruction.session_id,
      session_generated_at: instruction.generated_at
    };
  }

  const candidates = Object.entries(LAST_LOCATION_KEYS)
    .map(([task, key]) => ({ task, value: readJson(storage, key) }))
    .filter((row) => row.value?.id)
    .map((row) => ({
      task: row.task,
      value: row.value,
      timestamp: Date.parse(
        row.value?.updatedAt
        || row.value?.updated_at
        || row.value?.observed_at
        || row.value?.saved_at
        || ''
      )
    }))
    .sort((a, b) => (Number.isFinite(b.timestamp) ? b.timestamp : 0) - (Number.isFinite(a.timestamp) ? a.timestamp : 0));

  const recent = candidates[0];
  if (!recent) {
    return {
      status: sessionState.status === 'invalid' ? 'invalid' : 'missing'
    };
  }

  return {
    status: 'recent_only',
    task: recent.task,
    object_id: String(recent.value.id),
    label: clean(recent.value.title, 180) || null,
    href: clean(recent.value.href, 280) || null,
    updated_at: clean(recent.value.updatedAt || recent.value.updated_at, 80) || null
  };
}

function englishForecastProgress(storage, day) {
  const state = readEnglishSessionInstruction(storage, day);
  if (state.status !== 'ready' || !state.instruction) {
    return {
      schema: 'kianos.english.forecast-progress.v1',
      forecast_role: 'FACTUAL_SUBJECT_PROGRESS_SIGNAL_ONLY',
      gate_workload_authority: false,
      scope: 'CURRENT_EXPLICIT_SESSION_ONLY',
      status: state.status === 'invalid' ? 'invalid' : 'no_active_session',
      session_id: null,
      total_steps: 0,
      completed_steps: 0,
      remaining_steps: 0,
      remaining_by_task: {},
      remaining: [],
      evidence_boundary:
        'No active Chat-owned English session does not mean no English work. Session step completion is workflow progress only, not mastery or Gate workload.'
    };
  }

  const instruction = state.instruction;
  const remainingByTask = {};
  const remaining = [];
  let completedSteps = 0;
  instruction.steps.forEach((step, index) => {
    if (englishStepIsComplete(storage, step)) {
      completedSteps += 1;
      return;
    }
    remainingByTask[step.task] = (remainingByTask[step.task] || 0) + 1;
    remaining.push({
      step_index: index,
      step_id: step.step_id,
      task: step.task,
      object_id: step.object_id,
      source_hash: step.source_hash || null
    });
  });

  return {
    schema: 'kianos.english.forecast-progress.v1',
    forecast_role: 'FACTUAL_SUBJECT_PROGRESS_SIGNAL_ONLY',
    gate_workload_authority: false,
    scope: 'CURRENT_EXPLICIT_SESSION_ONLY',
    status: remaining.length ? 'active' : 'session_complete',
    session_id: instruction.session_id,
    session_generated_at: instruction.generated_at,
    total_steps: instruction.steps.length,
    completed_steps: completedSteps,
    remaining_steps: remaining.length,
    remaining_by_task: remainingByTask,
    remaining,
    evidence_boundary:
      'This describes the explicit current English session only. It must be interpreted with task-local performance_profile and cannot become Gate workload without subject-owned reconciliation into exam.subject-demand.v1.'
  };
}

const ENGLISH_OBJECTIVE_TRANSFER_KEY='kianos-english-objective-transfer-claims-v1';
const ENGLISH_TRANSLATION_TRANSFER_KEY='kianos-translation-transfer-v1';
const ENGLISH_WRITING_EVIDENCE_KEY='kianos-writing-evidence-v1';

function readOptionalLedger(storage,key,rowsKey){
  const raw=storage?.getItem?.(key);
  if(raw==null)return {status:'missing',rows:[]};
  try{
    const value=JSON.parse(raw);
    if(!value||typeof value!=='object'||Array.isArray(value)||!Array.isArray(value[rowsKey]))return {status:'invalid',rows:[]};
    return {status:'ready',rows:value[rowsKey]};
  }catch{
    return {status:'unreadable',rows:[]};
  }
}

function recurrenceTimestamp(row){
  for(const value of [
    row?.updated_at,row?.updatedAt,
    row?.reopened_at,row?.reopenedAt,
    row?.closed_at,row?.closedAt,
    row?.created_at,row?.createdAt,
    row?.admitted_at,row?.admittedAt
  ]){
    const ms=Date.parse(String(value||''));
    if(Number.isFinite(ms))return ms;
  }
  return Number.NEGATIVE_INFINITY;
}

function boundedRecurrenceFamily(rows,{limit=12,mapRow}={}){
  const normalized=(Array.isArray(rows)?rows:[]).map(mapRow).filter(Boolean);
  const sorted=normalized.sort((a,b)=>{
    const ap=a.status==='pending'?1:0, bp=b.status==='pending'?1:0;
    if(ap!==bp)return bp-ap;
    return recurrenceTimestamp(b)-recurrenceTimestamp(a);
  });
  const take=Math.max(1,Math.min(24,Math.floor(Number(limit)||12)));
  const selected=sorted.slice(0,take);
  return {
    total:sorted.length,
    pending:sorted.filter(row=>row.status==='pending').length,
    closed:sorted.filter(row=>row.status==='closed').length,
    included:selected.length,
    truncated:selected.length<sorted.length,
    targets:selected
  };
}

export function buildEnglishLongHorizonRecurrenceDigest(storage,{recentExactTruncated=false,limitPerFamily=12}={}){
  const objective=readOptionalLedger(storage,ENGLISH_OBJECTIVE_TRANSFER_KEY,'claims');
  const translation=readOptionalLedger(storage,ENGLISH_TRANSLATION_TRANSFER_KEY,'targets');
  const writing=readOptionalLedger(storage,ENGLISH_WRITING_EVIDENCE_KEY,'targets');

  const digest={
    schema:'kianos.english.long-horizon-recurrence.v1',
    semantics:'DURABLE_TASK_LOCAL_REPAIR_TRANSFER_PROJECTION; NOT_MASTERY; NOT_PRIORITY',
    recent_exact_window_truncated:recentExactTruncated===true,
    guardrails:[
      'RECENT_EXACT_ABSENCE_IS_NOT_LONG_HORIZON_ABSENCE',
      'PENDING_TARGET_IS_NOT_AUTOMATIC_REVIEW_DEBT',
      'CLOSED_TARGET_CAN_REOPEN_ONLY_WITH_RELEVANT_FRESH_CONTRADICTION',
      'RAW_PRIVATE_HISTORY_REMAINS_LOCAL'
    ],
    objective:{
      status:objective.status,
      ...boundedRecurrenceFamily(objective.rows,{
        limit:limitPerFamily,
        mapRow:(row)=>{
          const id=clean(row?.claimId,240); if(!id)return null;
          const status=String(row?.status||'').toUpperCase()==='CLOSED'?'closed':'pending';
          return {
            target_id:id,
            task:clean(row?.task,40)||null,
            label:clean(row?.statement,500)||null,
            status,
            source_object_id:clean(row?.sourceObjectId,240)||null,
            history_events:Array.isArray(row?.history)?row.history.length:0,
            updated_at:clean(row?.updatedAt,80)||clean(row?.createdAt,80)||null
          };
        }
      })
    },
    translation:{
      status:translation.status,
      ...boundedRecurrenceFamily(translation.rows,{
        limit:limitPerFamily,
        mapRow:(row)=>{
          const id=clean(row?.id,240); if(!id)return null;
          return {
            target_id:id,
            task:'translation',
            label:clean(row?.label,300)||null,
            mechanism:[clean(row?.layer,120),clean(row?.skill,180)].filter(Boolean).join(' · ')||null,
            underlying_demand:clean(row?.underlyingDemand,600)||null,
            status:String(row?.status||'').toLowerCase()==='closed'?'closed':'pending',
            source_task:clean(row?.sourceTask,240)||null,
            last_source_task:clean(row?.lastSourceTask,240)||null,
            evidence_events:Array.isArray(row?.evidence)?row.evidence.length:0,
            updated_at:clean(row?.closedAt,80)||clean(row?.createdAt,80)||null
          };
        }
      })
    },
    writing:{
      status:writing.status,
      ...boundedRecurrenceFamily(writing.rows,{
        limit:limitPerFamily,
        mapRow:(row)=>{
          const id=clean(row?.targetId,240); if(!id)return null;
          return {
            target_id:id,
            task:'writing',
            label:clean(row?.label,300)||null,
            underlying_demand:clean(row?.underlyingDemand,600)||null,
            status:String(row?.status||'').toLowerCase()==='closed'?'closed':'pending',
            origin_task_id:clean(row?.originTaskId,240)||null,
            evidence_events:Array.isArray(row?.events)?row.events.length:0,
            updated_at:clean(row?.updatedAt,80)||clean(row?.reopenedAt,80)||clean(row?.closedAt,80)||clean(row?.admittedAt,80)||null
          };
        }
      })
    }
  };
  digest.requires_deeper_review_if_decision_depends_on_missing_history=
    digest.recent_exact_window_truncated
    || digest.objective.truncated
    || digest.translation.truncated
    || digest.writing.truncated;
  return digest;
}

export function buildEnglishEvidencePacket(storage, { day, now = Date.now(), catalog = [] } = {}) {
  if (!storage?.getItem) throw new Error('ENGLISH_EVIDENCE_STORAGE_UNAVAILABLE');
  if (!validDay(day)) throw new Error('ENGLISH_EVIDENCE_DAY_INVALID');

  const rawInventory = englishAttemptInventory(storage);
  const packetInventory = englishInventoryPacketView(rawInventory);

  return {
    schema: ENGLISH_EVIDENCE_SCHEMA,
    study_day: day,
    generated_at: new Date(now).toISOString(),
    inventory: packetInventory.inventory,
    inventory_meta: packetInventory.inventory_meta,
    performance_profile: buildEnglishPerformanceProfile(rawInventory),
    long_horizon_recurrence: buildEnglishLongHorizonRecurrenceDigest(storage,{recentExactTruncated:packetInventory.inventory_meta.truncated}),
    forecast_progress: englishForecastProgress(storage, day),
    resume: englishResumeEvidence(storage, day),
    tasks: clone({
      reading_a: objectiveEvidence(storage, LAST_LOCATION_KEYS.reading_a, 'kianos-reading-attempt-v1:'),
      cloze: objectiveEvidence(storage, LAST_LOCATION_KEYS.cloze, 'kianos-cloze-attempt-v1:'),
      reading_b: objectiveEvidence(storage, LAST_LOCATION_KEYS.reading_b, 'kianos-reading-b-attempt-v1:'),
      external_reading: objectiveEvidence(storage, LAST_LOCATION_KEYS.external_reading, 'kianos-english-external-reading-attempt-v1:'),
      translation: productiveEvidence(storage, 'translation'),
      writing: productiveEvidence(storage, 'writing')
    }),
    exam_session: summarizeEnglishExamSession(readEnglishExamSession(storage)),
    available_external_reading: (Array.isArray(catalog) ? catalog : [])
      .filter(row => row?.task === 'external_reading')
      .map(row => ({
        object_id: clean(row.object_id, 240),
        source_hash: clean(row.source_hash, 128),
        label: clean(row.label, 180) || null
      }))
  };
}

export function buildEnglishChatHandoffText(storage, { day, now = Date.now(), catalog = [] } = {}) {
  const evidence = buildEnglishEvidencePacket(storage, { day, now, catalog });
  const generatedAt = new Date(now).toISOString();
  const returnShape = {
    schema: ENGLISH_SESSION_SCHEMA,
    session_id: `english-${day}-chat`,
    study_day: day,
    generated_at: generatedAt,
    current_step: 0,
    steps: [{
      step_id: 'step-1',
      task: 'reading_a',
      object_id: '<replace with an exact Current object id justified by the evidence>',
      source_hash: '<exact Current rendered-object hash; do not infer from an old attempt>',
      label: '<learner-facing next task label>',
      note: '<brief reason this is the next useful action>'
    }],
    return_policy: { on_finish: 'english_home' }
  };

  return [
    'KIANOS_ENGLISH_HANDOFF_V1',
    'This packet was exported by the KianOS learner website for Chat.',
    '',
    'HOW TO READ IT',
    '- EVIDENCE_JSON is factual learner/runtime state, not a recommendation, mastery claim, or task priority table.',
    '- If GitHub access is available, first read kianwang022-hash/kianos@main content/english/CURRENT.md, then only the exact child owner needed for the task. Do not revive legacy architecture.',
    '- Apply the current English Learning Contract: stable work stays cheap; real problems get the smallest useful repair; Chat owns cross-task next-step selection; the website only executes the selected task.',
    '- Missing evidence means unknown, not failed. Finished work must not be turned back into Resume debt.',
    '- Optional params.material_exposure={state:unseen|exposed|unknown,basis:learner_statement,observed_at:ISO,note:actual learner statement} may be supplied ONLY from real learner testimony before an attempt. Never infer unseen from missing storage or Content defaults.',
    '- If prior Chat discussion or learner testimony materially cues the assigned task, params.assistance_context={state:assisted|unknown,basis:chat_context|learner_statement,observed_at:ISO,note:brief factual reason} may downgrade the next first-evidence claim. Do not declare unassisted; that remains the default only when no contrary evidence exists.',
    '- performance_profile is task-level bounded telemetry. long_horizon_recurrence projects durable Objective/Translation/Writing Repair/Transfer targets. If recent exact attempts are truncated, absence from the recent window is not proof that a mechanism never existed.',
    '',
    'WHAT CHAT SHOULD DO',
    '- Explain the current English situation in normal language and choose a next action only when that is useful.',
    '- If the learner only asked for review/diagnosis, answer normally; no website return object is required.',
    '- If the learner wants the website to Resume an exact next task, include ONE JSON object matching RETURN_SHAPE. Replace the angle-bracket placeholders; task must be one of reading_a, cloze, reading_b, external_reading, translation, writing, full_paper. Use exact Current object ids; never invent ids.',
    '',
    'RETURN_SHAPE',
    JSON.stringify(returnShape, null, 2),
    '',
    'EVIDENCE_JSON',
    JSON.stringify(evidence, null, 2)
  ].join('\n');
}

