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
      params.task_order = step.params.task_order.map((value) => clean(value, 40)).filter(Boolean);
    }
  }
  const intent = clean(step.intent || 'continue', 30);
  if (!['continue', 'attempt', 'repair', 'review', 'retry'].includes(intent)) {
    throw new Error('ENGLISH_SESSION_INTENT_INVALID:' + intent);
  }
  return {
    intent,
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

  if (new Set(steps.map(step => step.step_id)).size !== steps.length) {
    throw new Error('ENGLISH_SESSION_STEP_ID_DUPLICATE');
  }
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

export function assertEnglishSessionTargets(instruction, catalog) {
  if (!catalog || typeof catalog !== 'object') throw new Error('ENGLISH_SESSION_CURRENT_CATALOG_REQUIRED');
  for (const step of instruction.steps) {
    if (!Array.isArray(catalog[step.task]) || !catalog[step.task].includes(step.object_id)) {
      throw new Error(`ENGLISH_SESSION_CURRENT_OBJECT_UNKNOWN:${step.task}:${step.object_id}`);
    }
    if (step.task === 'full_paper' && step.params?.task_order) {
      const order = step.params.task_order;
      const tasks = ['cloze', 'reading_a', 'reading_b', 'translation', 'writing'];
      if (order.length !== tasks.length || new Set(order).size !== tasks.length || order.some(task => !tasks.includes(task))) {
        throw new Error('ENGLISH_SESSION_EXAM_ORDER_INVALID');
      }
    }
  }
  return instruction;
}

export function writeEnglishSessionInstruction(storage, input, expectedDay = null, catalog = null) {
  if (!storage?.setItem) throw new Error('ENGLISH_SESSION_STORAGE_UNAVAILABLE');
  const instruction = assertEnglishSessionTargets(parseEnglishSessionInstruction(input, expectedDay), catalog);
  const prior = readEnglishSessionInstruction(storage);
  if (prior.status === 'invalid') throw new Error('ENGLISH_SESSION_EXISTING_INVALID_RECOVER_FIRST');
  if (prior.instruction) {
    const previous = prior.instruction;
    if (previous.session_id === instruction.session_id) {
      const signature = value => JSON.stringify({ ...value, current_step: 0 });
      if (signature(previous) !== signature(instruction)) throw new Error('ENGLISH_SESSION_ID_CONFLICT');
      return previous; // An identical replay never rewinds an already advanced cursor.
    }
    if (Date.parse(instruction.generated_at) <= Date.parse(previous.generated_at)) {
      throw new Error('ENGLISH_SESSION_STALE_GENERATION');
    }
  }
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

export function buildEnglishEvidencePacket(storage, { day, now = Date.now() } = {}) {
  if (!storage?.getItem) throw new Error('ENGLISH_EVIDENCE_STORAGE_UNAVAILABLE');
  if (!validDay(day)) throw new Error('ENGLISH_EVIDENCE_DAY_INVALID');

  return {
    schema: ENGLISH_EVIDENCE_SCHEMA,
    study_day: day,
    generated_at: new Date(now).toISOString(),
    attempt_inventory: collectEnglishAttemptInventory(storage),
    coverage: 'available-local-records-only; missing evidence remains unknown',
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

export function buildEnglishChatHandoffText(storage, { day, now = Date.now() } = {}) {
  const evidence = buildEnglishEvidencePacket(storage, { day, now });
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
    '- Start with the supplied private learner evidence. If source/learning context is needed, read kianwang022-hash/kianos@main content/english/LEARNING_CONTRACT.md and the exact Current task owner. Engineering CURRENT is not learner progress.',
    '- Apply the current English Learning Contract: stable work stays cheap; real problems get the smallest useful repair; Chat owns cross-task next-step selection; the website only executes the selected task.',
    '- Missing evidence means unknown, not failed. Finished work must not be turned back into Resume debt.',
    '',
    'WHAT CHAT SHOULD DO',
    '- Explain the current English situation in normal language and choose a next action only when that is useful.',
    '- If the learner only asked for review/diagnosis, answer normally; no website return object is required.',
    '- If the learner wants the website to Resume an exact next task, include ONE JSON object matching RETURN_SHAPE. Replace the angle-bracket placeholders; task must be one of reading_a, cloze, reading_b, translation, writing, full_paper. Use exact Current object ids; never invent ids.',
    '',
    'RETURN_SHAPE',
    JSON.stringify(returnShape, null, 2),
    '',
    'EVIDENCE_JSON',
    JSON.stringify(evidence, null, 2)
  ].join('\n');
}


/** All available task identities, not merely the most recently opened page.
 * This is factual inventory, never a priority queue or a recommendation.
 */
export function collectEnglishAttemptInventory(storage) {
  const prefixes = {
    'kianos-reading-attempt-v1:': 'reading_a',
    'kianos-cloze-attempt-v1:': 'cloze',
    'kianos-reading-b-attempt-v1:': 'reading_b',
    'kianos-translation-attempt-v2:': 'translation',
    'kianos-writing-runtime-v1:': 'writing'
  };
  const rows = [];
  for (let index = 0; index < Number(storage?.length || 0); index += 1) {
    const key = storage.key(index);
    const prefix = Object.keys(prefixes).find(value => key?.startsWith(value));
    if (!prefix) continue;
    const objectId = key.slice(prefix.length);
    let value;
    try { value = JSON.parse(storage.getItem(key)); }
    catch { rows.push({ task: prefixes[prefix], object_id: objectId, record_status: 'unreadable' }); continue; }
    rows.push({
      task: prefixes[prefix], object_id: objectId,
      record_status: value && typeof value === 'object' ? 'available' : 'invalid',
      state: value?.stage || value?.state || null,
      submitted: value?.submitted === true,
      submitted_at: value?.submittedAt || value?.firstSubmittedAt || null,
      has_first_attempt: Boolean(value?.firstDraft || Object.keys(value?.firstAttempts || {}).length),
      problem_count: problemCount(value),
      uncertain_count: Array.isArray(value?.uncertain) ? value.uncertain.length : 0,
      started_at: value?.startedAt || value?.createdAt || null,
      updated_at: value?.updatedAt || value?.updated_at || null
    });
  }
  return rows.sort((a, b) => a.task.localeCompare(b.task) || a.object_id.localeCompare(b.object_id));
}

/** Follow only the order Chat explicitly supplied. Do not rank tasks here. */
export function englishSessionResumeStep(storage, instruction) {
  for (let index = instruction.current_step; index < instruction.steps.length; index += 1) {
    const step = instruction.steps[index];
    if (['review', 'repair', 'retry'].includes(step.intent)) return { step, index };
    let complete = false;
    if (step.task === 'writing') {
      const record = readJson(storage, 'kianos-writing-runtime-v1:' + step.object_id);
      complete = ['PASS_ACCEPTABLE', 'REPAIR_COMPLETE', 'TRANSFER_PENDING'].includes(record?.state);
    } else if (step.task === 'translation') {
      const record = readJson(storage, 'kianos-translation-attempt-v2:' + step.object_id);
      complete = ['passed', 'repaired', 'transfer_pending'].includes(record?.stage);
    } else if (['reading_a', 'cloze', 'reading_b'].includes(step.task)) {
      const prefix = {reading_a:'kianos-reading-attempt-v1:',cloze:'kianos-cloze-attempt-v1:',reading_b:'kianos-reading-b-attempt-v1:'}[step.task];
      const record = readJson(storage, prefix + step.object_id);
      complete = record?.submitted === true && Object.keys(record.results || {}).length > 0
        && Object.values(record.results).every(result => result === 'correct')
        && !(record.uncertain || []).length;
    } else if (step.task === 'full_paper') {
      const record = readEnglishExamSession(storage);
      complete = record?.paper_id === step.object_id && ['SEALED', 'RELEASED'].includes(record.status);
    }
    if (!complete) return { step, index };
  }
  return null;
}
