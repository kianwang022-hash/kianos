import { englishMaterialExposure } from './englishTaskEvidence.mjs';
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
  'translation',
  'writing',
  'full_paper'
]);

const LAST_LOCATION_KEYS = Object.freeze({
  reading_a: 'kianos-reading-last-location-v1',
  cloze: 'kianos-cloze-last-location-v1',
  reading_b: 'kianos-reading-b-last-location-v1',
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
      params.task_order = step.params.task_order.map((value) => clean(value, 40));
      const required = ENGLISH_SESSION_TASKS.filter(task => task !== 'full_paper');
      if (params.task_order.length !== required.length || new Set(params.task_order).size !== required.length || params.task_order.some(t => !required.includes(t))) throw new Error('ENGLISH_SESSION_EXAM_ORDER_INVALID');
    }
  }
  return {
    step_id: clean(step.step_id || step.stepId || ('step-' + (index + 1)), 80),
    task,
    object_id: objectId,
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

  if (new Set(steps.map(step=>step.step_id)).size !== steps.length) throw new Error('ENGLISH_SESSION_DUPLICATE_STEP');

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
    evidence_revision: clean(value.evidence_revision, 100) || null,
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

export function writeEnglishSessionInstruction(storage, input, expectedDay = null, catalog = null) {
  if (!storage?.setItem) throw new Error('ENGLISH_SESSION_STORAGE_UNAVAILABLE');
  const instruction = parseEnglishSessionInstruction(input, expectedDay);
  if (!catalog || instruction.steps.some(step => !(catalog[step.task] || []).includes(step.object_id))) throw new Error('ENGLISH_SESSION_CURRENT_ID_UNRESOLVED');
  const priorRaw = storage.getItem(ENGLISH_SESSION_KEY);
  if (priorRaw) {
    let prior;
    try { prior = validateEnglishSessionInstruction(JSON.parse(priorRaw)); }
    catch { throw new Error('ENGLISH_SESSION_RECOVERY_REQUIRED'); }
    const signature = value => JSON.stringify({ ...value, current_step: 0 });
    if (prior.session_id === instruction.session_id) {
      if (signature(prior) !== signature(instruction)) throw new Error('ENGLISH_SESSION_ID_CONFLICT');
      return prior; // Replay acknowledges the original instruction; never rewinds its cursor.
    }
    if (instruction.generated_at <= prior.generated_at) throw new Error('ENGLISH_SESSION_OUT_OF_ORDER');
  }
  if (!instruction.evidence_revision || instruction.evidence_revision !== englishEvidenceRevision(storage)) throw new Error('ENGLISH_SESSION_EVIDENCE_STALE');
  storage.setItem(ENGLISH_SESSION_KEY, JSON.stringify(instruction));
  return instruction;
}

export function clearEnglishSessionInstruction(storage) {
  if (!storage?.removeItem) return;
  storage.removeItem(ENGLISH_SESSION_KEY);
}

export function englishSessionStepHref(step, base = '/') {
  if (!step || !ENGLISH_SESSION_TASKS.includes(step.task) || !step.object_id) return null;
  const prefix = ({
    reading_a: 'reading',
    cloze: 'cloze',
    reading_b: 'reading-b',
    translation: 'translation',
    writing: 'writing',
    full_paper: 'english-exam'
  })[step.task];
  const normalizedBase = String(base || '/').endsWith('/') ? String(base || '/') : String(base || '/') + '/';
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
      problem_count: problemCount(attempt),
      uncertain_count: Array.isArray(attempt.uncertain) ? attempt.uncertain.length : 0,
      started_at: clean(attempt.startedAt, 80) || null,
      submitted_at: clean(attempt.submittedAt, 80) || null,
      review_unlocked: attempt.reviewUnlocked !== false
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


// Factual retention index, not a cross-task scheduler. Missing/corrupt records stay unknown.
const ATTEMPT_PREFIXES = Object.freeze({
  reading_a:'kianos-reading-attempt-v1:', cloze:'kianos-cloze-attempt-v1:',
  reading_b:'kianos-reading-b-attempt-v1:', translation:'kianos-translation-attempt-v2:',
  writing:'kianos-writing-runtime-v1:'
});
function evidenceEntries(storage) {
  const keys = [];
  for (let i=0;i<Number(storage?.length || 0);i++) {
    const key = storage.key(i);
    if (key && (Object.values(ATTEMPT_PREFIXES).some(p=>key.startsWith(p)) || key==='kianos-english-exam-session-v1' || key==='kianos-english-material-evidence-v1')) keys.push(key);
  }
  return keys.sort().map(key=>[key,storage.getItem(key)]);
}
export function englishEvidenceRevision(storage) {
  const text = JSON.stringify(evidenceEntries(storage));
  let a=2166136261, b=2246822507;
  for (let i=0;i<text.length;i++) { a=Math.imul(a^text.charCodeAt(i),16777619); b=Math.imul(b^text.charCodeAt(i),3266489909); }
  return (a>>>0).toString(16).padStart(8,'0')+(b>>>0).toString(16).padStart(8,'0');
}
export function englishStepComplete(storage, step) {
  if (step?.task==='full_paper') {
    const exam=readEnglishExamSession(storage);
    return exam?.paper_id===step.object_id && ['SEALED','RELEASED'].includes(exam.status);
  }
  const record=readJson(storage,(ATTEMPT_PREFIXES[step?.task] || '')+step?.object_id);
  if (!record) return false;
  if (step.task==='writing') return ['PASS_ACCEPTABLE','REPAIR_COMPLETE','TRANSFER_PENDING'].includes(record.state);
  if (step.task==='translation') return ['passed','repaired','transfer_pending'].includes(record.stage);
  if (!record.submitted) return false;
  if (problemCount(record)===0) return true;
  const review=readJson(storage,`kianos-english-objective-review-return-v1:${step.task}:${step.object_id}`);
  return review?.attemptSubmittedAt===record.submittedAt && Array.isArray(review.threads) && review.threads.every(t=>t.repairCompleted===true);
}
export function nextEnglishInstructionStep(storage, instruction, catalog=null) {
  // Only walk the order that Chat explicitly selected; never rank new tasks.
  for (let i=instruction.current_step;i<instruction.steps.length;i++) {
    const step=instruction.steps[i];
    if (catalog && !(catalog[step.task] || []).includes(step.object_id)) return null;
    if (!englishStepComplete(storage,step)) return {step,index:i};
  }
  return null;
}
function retainedTaskFacts(storage) {
  return evidenceEntries(storage).flatMap(([key,raw])=>{
    const pair=Object.entries(ATTEMPT_PREFIXES).find(([,p])=>key.startsWith(p));
    if (!pair) return [];
    const [task,prefix]=pair; let record;
    try { record=JSON.parse(raw); } catch { return [{task,object_id:key.slice(prefix.length),status:'RECOVERY_REQUIRED'}]; }
    return [{task,object_id:key.slice(prefix.length),state:record.stage || record.state || (record.submitted?'submitted':'attempt'),
      complete:englishStepComplete(storage,{task,object_id:key.slice(prefix.length)}),
      problem_count:problemCount(record),uncertain_count:record.uncertain?.length || 0,
      first_submitted_at:record.firstSubmittedAt || record.submittedAt || null,
      has_first_output:Boolean(record.firstDraft || Object.keys(record.firstAttempts || {}).length),
      current_index:record.currentIndex ?? null,content_revision:record.evidence_binding?.content_revision || record.content_revision || null}];
  });
}

export function buildEnglishEvidencePacket(storage, { day, now = Date.now() } = {}) {
  if (!storage?.getItem) throw new Error('ENGLISH_EVIDENCE_STORAGE_UNAVAILABLE');
  if (!validDay(day)) throw new Error('ENGLISH_EVIDENCE_DAY_INVALID');

  return {
    schema: ENGLISH_EVIDENCE_SCHEMA,
    study_day: day,
    generated_at: new Date(now).toISOString(),
    evidence_revision: englishEvidenceRevision(storage),
    retained_tasks: retainedTaskFacts(storage).map(task=>({...task,exposure:englishMaterialExposure(storage,task.object_id)})),
    tasks: clone({
      reading_a: objectiveEvidence(storage, LAST_LOCATION_KEYS.reading_a, 'kianos-reading-attempt-v1:'),
      cloze: objectiveEvidence(storage, LAST_LOCATION_KEYS.cloze, 'kianos-cloze-attempt-v1:'),
      reading_b: objectiveEvidence(storage, LAST_LOCATION_KEYS.reading_b, 'kianos-reading-b-attempt-v1:'),
      translation: productiveEvidence(storage, 'translation'),
      writing: productiveEvidence(storage, 'writing')
    }),
    exam_session: summarizeEnglishExamSession(readEnglishExamSession(storage))
  };
}

export function buildEnglishChatHandoffText(storage, { day, now = Date.now(), catalog = null } = {}) {
  const evidence = buildEnglishEvidencePacket(storage, { day, now });
  const generatedAt = new Date(now).toISOString();
  const returnShape = {
    schema: ENGLISH_SESSION_SCHEMA,
    session_id: `english-${day}-chat`,
    study_day: day,
    generated_at: generatedAt,
    evidence_revision: evidence.evidence_revision,
    current_step: 0,
    steps: [{
      step_id: 'step-1',
      task: 'reading_a',
      object_id: '<replace with an exact Current object id justified by the evidence>',
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
    '- If GitHub access is available, read the exact Current content/learning owner needed to interpret this learner evidence; engineering CURRENT is not learner progress. Do not revive legacy architecture.',
    '- Apply the current English Learning Contract: stable work stays cheap; real problems get the smallest useful repair; Chat owns cross-task next-step selection; the website only executes the selected task.',
    '- Missing evidence means unknown, not failed. Finished work must not be turned back into Resume debt.',
    '',
    'WHAT CHAT SHOULD DO',
    '- Explain the current English situation in normal language and choose a next action only when that is useful.',
    '- If the learner only asked for review/diagnosis, answer normally; no website return object is required.',
    '- If the learner wants the website to Resume an exact next task, include ONE JSON object matching RETURN_SHAPE. Replace the angle-bracket placeholders; task must be one of reading_a, cloze, reading_b, translation, writing, full_paper. Use exact Current object ids; never invent ids.',
    '',
    'CURRENT_OBJECT_IDS (identity only; no protected task content)',
    JSON.stringify(catalog),
    '',
    'RETURN_SHAPE',
    JSON.stringify(returnShape, null, 2),
    '',
    'EVIDENCE_JSON',
    JSON.stringify(evidence, null, 2)
  ].join('\n');
}

