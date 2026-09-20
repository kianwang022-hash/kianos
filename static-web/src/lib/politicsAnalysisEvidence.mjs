export const POLITICS_ANALYSIS_EVIDENCE_SCHEMA = 'kianos.politics.analysis-evidence.v1';
export const POLITICS_ANALYSIS_STORE_SCHEMA = 'kianos.politics.analysis-evidence-store.v1';
export const POLITICS_ANALYSIS_SUMMARY_SCHEMA = 'kianos.politics.analysis-summary.v1';
export const POLITICS_ANALYSIS_EVIDENCE_KEY = 'kianos-politics-analysis-evidence-v1';

const MODES = new Set(['IDENTIFY', 'SKELETON', 'BIND', 'FORMULATION', 'DELIVER']);
const ROLES = new Set(['FIRST', 'REPAIR', 'TRANSFER']);
const SUBJECTS = new Set(['marxism', 'history', 'mao', 'xi', 'ethics_law', 'current_affairs', 'mixed']);
const FRESHNESS = new Set(['STABLE_CURRENT', 'LEGACY_GEOMETRY_ONLY', 'CURRENT_YEAR_EXACT_REQUIRED']);
const FORMULATION = new Set(['NONE', 'STABLE_SOURCE', 'CURRENT_YEAR_EXACT']);
const AUTHORITY = new Set(['CURRENT_STABLE', 'LEGACY_GEOMETRY', 'BOUND']);
const CONFIDENCE = new Set(['LOW', 'MEDIUM', 'HIGH']);
const FLAGS = new Set([
  'WRONG_OWNER',
  'PROMPT_MISREAD',
  'TEMPLATE_DUMP',
  'MATERIAL_UNBOUND',
  'UNSUPPORTED_FORMULATION',
  'STALE_CURRENT_YEAR_CONTENT',
  'ANSWER_LEAKAGE',
  'TIMEOUT',
  'INCOMPLETE'
]);
const DIMS = ['I', 'S', 'B', 'F', 'D'];
const MAX_RECORDS = 1000;
const RECENT_LIMIT = 20;

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const clean = (value, max = 2000) => String(value ?? '').trim().slice(0, max);
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const validDay = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
const validIso = value => {
  const text = clean(value, 80);
  return text && Number.isFinite(Date.parse(text)) ? new Date(text).toISOString() : '';
};

function fail(code, detail = '') {
  throw new Error('POLITICS_ANALYSIS_' + code + (detail ? ':' + detail : ''));
}

function rubricValue(value, dim) {
  if (value === 'NA') return value;
  if (Number.isInteger(value) && value >= 0 && value <= 2) return value;
  fail('RUBRIC_INVALID', dim);
}

function requiredDimensions(mode, formulationRequirement) {
  const required = new Set(['I']);
  if (['SKELETON', 'BIND', 'FORMULATION', 'DELIVER'].includes(mode)) required.add('S');
  if (['BIND', 'FORMULATION', 'DELIVER'].includes(mode)) required.add('B');
  if (mode === 'FORMULATION' || (mode === 'DELIVER' && formulationRequirement !== 'NONE')) required.add('F');
  if (mode === 'DELIVER') required.add('D');
  return required;
}

function normalizeSourceBasis(value, freshnessClass) {
  if (!record(value)) fail('SOURCE_BASIS_INVALID');
  const family = clean(value.family, 160);
  const identity = clean(value.identity, 500);
  const revision = clean(value.revision, 240) || null;
  const authorityStatus = clean(value.authority_status, 40);
  if (!family || !identity || !AUTHORITY.has(authorityStatus)) fail('SOURCE_BASIS_FIELDS_INVALID');

  if (freshnessClass === 'STABLE_CURRENT' && authorityStatus !== 'CURRENT_STABLE') {
    fail('SOURCE_AUTHORITY_MISMATCH', freshnessClass);
  }
  if (freshnessClass === 'LEGACY_GEOMETRY_ONLY' && authorityStatus !== 'LEGACY_GEOMETRY') {
    fail('SOURCE_AUTHORITY_MISMATCH', freshnessClass);
  }
  if (freshnessClass === 'CURRENT_YEAR_EXACT_REQUIRED') {
    if (authorityStatus !== 'BOUND' || !revision) fail('CURRENT_YEAR_SOURCE_NOT_BOUND');
  }

  return { family, identity, revision, authority_status: authorityStatus };
}

function signature(value) {
  const { applied_at, evidence_signature, ...basis } = value;
  return JSON.stringify(basis);
}

export function emptyPoliticsAnalysisEvidenceStore() {
  return { schema: POLITICS_ANALYSIS_STORE_SCHEMA, records: [] };
}

export function validatePoliticsAnalysisEvidence(input, { now = Date.now() } = {}) {
  if (!record(input)
      || input.schema !== POLITICS_ANALYSIS_EVIDENCE_SCHEMA
      || input.direction !== 'CHAT_TO_LEARNER') {
    fail('SCHEMA_INVALID');
  }

  const evidenceId = clean(input.evidence_id, 200);
  const taskId = clean(input.task_id, 240);
  const taskRevision = clean(input.task_revision, 240);
  const rubricVersion = clean(input.rubric_version, 120);
  const subject = clean(input.subject, 80);
  const taskMode = clean(input.task_mode, 40);
  const attemptRole = clean(input.attempt_role, 40);
  const freshnessClass = clean(input.freshness_class, 60);
  const formulationRequirement = clean(input.formulation_requirement, 60);
  const studyDay = clean(input.study_day, 20);
  const observedAt = validIso(input.observed_at);
  const assessmentConfidence = clean(input.assessment_confidence, 40);
  const subquestionId = clean(input.subquestion_id, 200);

  if (!evidenceId || !taskId || !taskRevision || !rubricVersion || !subquestionId) fail('IDENTITY_REQUIRED');
  if (!SUBJECTS.has(subject)) fail('SUBJECT_INVALID', subject);
  if (!MODES.has(taskMode)) fail('MODE_INVALID', taskMode);
  if (!ROLES.has(attemptRole)) fail('ROLE_INVALID', attemptRole);
  if (!FRESHNESS.has(freshnessClass)) fail('FRESHNESS_INVALID', freshnessClass);
  if (!FORMULATION.has(formulationRequirement)) fail('FORMULATION_REQUIREMENT_INVALID', formulationRequirement);
  if (!validDay(studyDay)) fail('DAY_INVALID');
  if (!observedAt || Date.parse(observedAt) > Number(now) + 300_000) fail('OBSERVED_AT_INVALID');
  if (!CONFIDENCE.has(assessmentConfidence)) fail('CONFIDENCE_INVALID');

  if (freshnessClass === 'LEGACY_GEOMETRY_ONLY' && formulationRequirement !== 'NONE') {
    fail('LEGACY_EXACT_FORMULATION_FORBIDDEN');
  }
  if (formulationRequirement === 'CURRENT_YEAR_EXACT' && freshnessClass !== 'CURRENT_YEAR_EXACT_REQUIRED') {
    fail('CURRENT_YEAR_FORMULATION_FRESHNESS_MISMATCH');
  }
  if (freshnessClass === 'CURRENT_YEAR_EXACT_REQUIRED' && formulationRequirement !== 'CURRENT_YEAR_EXACT') {
    fail('CURRENT_YEAR_FRESHNESS_FORMULATION_MISMATCH');
  }

  const sourceBasis = normalizeSourceBasis(input.source_basis, freshnessClass);
  const rawRubric = record(input.rubric) ? input.rubric : {};
  const rubric = Object.fromEntries(DIMS.map(dim => [dim, rubricValue(rawRubric[dim], dim)]));
  const required = requiredDimensions(taskMode, formulationRequirement);

  for (const dim of DIMS) {
    if (required.has(dim) && rubric[dim] === 'NA') fail('REQUIRED_RUBRIC_NA', dim);
    if (!required.has(dim) && rubric[dim] !== 'NA') fail('UNTESTED_RUBRIC_MUST_BE_NA', dim);
  }

  const flags = [...new Set((Array.isArray(input.critical_flags) ? input.critical_flags : [])
    .map(value => clean(value, 80)).filter(Boolean))];
  if (flags.some(flag => !FLAGS.has(flag))) fail('FLAG_INVALID');

  const freshMaterial = input.fresh_material === true;
  if (attemptRole === 'TRANSFER' && !freshMaterial) fail('TRANSFER_REQUIRES_FRESH_MATERIAL');
  if (attemptRole !== 'TRANSFER' && freshMaterial) fail('FRESH_MATERIAL_ROLE_MISMATCH');

  const deliveryTiming = clean(input.delivery_timing || 'NA', 20);
  const rawElapsed = input.elapsed_seconds;
  let elapsedSeconds = null;
  if (taskMode === 'DELIVER') {
    if (!['UNTIMED', 'TIMED'].includes(deliveryTiming)) fail('DELIVERY_TIMING_INVALID');
    if (deliveryTiming === 'TIMED') {
      elapsedSeconds = Number(rawElapsed);
      if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0 || elapsedSeconds > 3600) fail('ELAPSED_INVALID');
    } else if (rawElapsed != null) {
      fail('UNTIMED_HAS_ELAPSED');
    }
  } else {
    if (deliveryTiming !== 'NA' || rawElapsed != null) fail('NON_DELIVER_TIMING_INVALID');
  }

  const normalized = {
    schema: POLITICS_ANALYSIS_EVIDENCE_SCHEMA,
    direction: 'CHAT_TO_LEARNER',
    evidence_id: evidenceId,
    task_id: taskId,
    task_revision: taskRevision,
    rubric_version: rubricVersion,
    subject,
    subquestion_id: subquestionId,
    task_mode: taskMode,
    attempt_role: attemptRole,
    fresh_material: freshMaterial,
    freshness_class: freshnessClass,
    formulation_requirement: formulationRequirement,
    source_basis: sourceBasis,
    study_day: studyDay,
    observed_at: observedAt,
    rubric,
    critical_flags: flags,
    assessment_confidence: assessmentConfidence,
    delivery_timing: deliveryTiming,
    elapsed_seconds: elapsedSeconds,
    diagnosis_summary: clean(input.diagnosis_summary, 1600) || null,
    repair_instruction: clean(input.repair_instruction, 1600) || null
  };
  normalized.evidence_signature = signature(normalized);
  return normalized;
}

export function validatePoliticsAnalysisStore(value) {
  if (!record(value) || value.schema !== POLITICS_ANALYSIS_STORE_SCHEMA || !Array.isArray(value.records)) {
    fail('STORE_SCHEMA_INVALID');
  }
  if (value.records.length > MAX_RECORDS) fail('STORE_TOO_LARGE');

  const seen = new Set();
  const firstByTaskRevision = new Set();
  const records = value.records.map((raw, index) => {
    const normalized = validatePoliticsAnalysisEvidence(raw, { now: Date.now() + 300_000 });
    const storedSignature = clean(raw.evidence_signature, 20000);
    if (!storedSignature || storedSignature !== normalized.evidence_signature) fail('STORE_SIGNATURE_INVALID', String(index));
    if (seen.has(normalized.evidence_id)) fail('STORE_DUPLICATE_ID', normalized.evidence_id);
    seen.add(normalized.evidence_id);

    const taskKey = normalized.task_id + '@' + normalized.task_revision;
    if (normalized.attempt_role === 'FIRST') {
      if (firstByTaskRevision.has(taskKey)) fail('STORE_DUPLICATE_FIRST', taskKey);
      firstByTaskRevision.add(taskKey);
    }
    return { ...normalized, applied_at: validIso(raw.applied_at) || normalized.observed_at };
  });
  return { schema: POLITICS_ANALYSIS_STORE_SCHEMA, records };
}

export function readPoliticsAnalysisEvidenceStore(storage) {
  const raw = storage?.getItem?.(POLITICS_ANALYSIS_EVIDENCE_KEY);
  if (raw == null) return emptyPoliticsAnalysisEvidenceStore();
  let value;
  try { value = JSON.parse(raw); }
  catch { fail('STORE_JSON_INVALID'); }
  return validatePoliticsAnalysisStore(value);
}

export function applyPoliticsAnalysisEvidence(storage, input, {
  now = Date.now(),
  boundCurrentYearSources = []
} = {}) {
  if (!storage?.getItem || !storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const normalized = validatePoliticsAnalysisEvidence(input, { now });
  if (normalized.freshness_class === 'CURRENT_YEAR_EXACT_REQUIRED') {
    const bindings = Array.isArray(boundCurrentYearSources) ? boundCurrentYearSources : [];
    const matched = bindings.some((row) =>
      record(row)
      && clean(row.family, 160) === normalized.source_basis.family
      && clean(row.revision, 240) === normalized.source_basis.revision
      && row.current_year_authority === true
    );
    if (!matched) fail('CURRENT_YEAR_SOURCE_NOT_CURRENT_BOUND');
  }
  const store = readPoliticsAnalysisEvidenceStore(storage);
  const existing = store.records.find(record => record.evidence_id === normalized.evidence_id);

  if (existing) {
    if (existing.evidence_signature !== normalized.evidence_signature) fail('EVIDENCE_ID_CONFLICT', normalized.evidence_id);
    return { status: 'idempotent', value: clone(existing), store: clone(store) };
  }

  const taskKey = normalized.task_id + '@' + normalized.task_revision;
  if (normalized.attempt_role === 'FIRST' && store.records.some(record =>
    record.attempt_role === 'FIRST'
    && (record.task_id + '@' + record.task_revision) === taskKey)) {
    fail('FIRST_ALREADY_RECORDED', taskKey);
  }
  if (store.records.length >= MAX_RECORDS) fail('STORE_TOO_LARGE');

  const stored = { ...normalized, applied_at: new Date(now).toISOString() };
  const next = { schema: POLITICS_ANALYSIS_STORE_SCHEMA, records: [...store.records, stored] };
  const previousRaw = storage.getItem(POLITICS_ANALYSIS_EVIDENCE_KEY);
  try {
    storage.setItem(POLITICS_ANALYSIS_EVIDENCE_KEY, JSON.stringify(next));
  } catch (error) {
    try {
      if (previousRaw == null) storage.removeItem?.(POLITICS_ANALYSIS_EVIDENCE_KEY);
      else storage.setItem(POLITICS_ANALYSIS_EVIDENCE_KEY, previousRaw);
    } catch {}
    throw error;
  }
  return { status: 'applied', value: clone(stored), store: clone(next) };
}

function brief(record) {
  if (!record) return null;
  return {
    evidence_id: record.evidence_id,
    task_id: record.task_id,
    task_revision: record.task_revision,
    subject: record.subject,
    subquestion_id: record.subquestion_id,
    task_mode: record.task_mode,
    attempt_role: record.attempt_role,
    fresh_material: record.fresh_material,
    freshness_class: record.freshness_class,
    formulation_requirement: record.formulation_requirement,
    source_basis: record.source_basis,
    study_day: record.study_day,
    observed_at: record.observed_at,
    rubric: record.rubric,
    critical_flags: record.critical_flags,
    assessment_confidence: record.assessment_confidence,
    delivery_timing: record.delivery_timing,
    elapsed_seconds: record.elapsed_seconds,
    diagnosis_summary: record.diagnosis_summary
  };
}

export function politicsAnalysisEvidenceSummary(storeValue, { day = '' } = {}) {
  const store = validatePoliticsAnalysisStore(storeValue || emptyPoliticsAnalysisEvidenceStore());
  const sorted = [...store.records].sort((a, b) => String(a.observed_at).localeCompare(String(b.observed_at)));
  const today = validDay(day) ? sorted.filter(record => record.study_day === day) : [];
  const latestByTask = new Map();
  for (const row of sorted) latestByTask.set(row.task_id + '@' + row.task_revision, row);
  const latestRows = [...latestByTask.values()];
  const latestTransfer = [...sorted].reverse().find(row => row.attempt_role === 'TRANSFER') || null;
  const latestTimedDelivery = [...sorted].reverse().find(row => row.task_mode === 'DELIVER' && row.delivery_timing === 'TIMED') || null;

  const todayByMode = Object.fromEntries([...MODES].map(mode => [mode, today.filter(row => row.task_mode === mode).length]));
  const openCritical = latestRows
    .filter(row => row.critical_flags.length)
    .sort((a, b) => String(b.observed_at).localeCompare(String(a.observed_at)))
    .slice(0, 10)
    .map(row => ({ task_id: row.task_id, task_revision: row.task_revision, flags: row.critical_flags, observed_at: row.observed_at }));

  return {
    schema: POLITICS_ANALYSIS_SUMMARY_SCHEMA,
    evidence_role: 'TASK_LEVEL_EVIDENCE_ONLY_NO_SCORE_OR_MASTERY_AUTHORITY',
    total_records: sorted.length,
    today_count: today.length,
    today_by_mode: todayByMode,
    latest_transfer: brief(latestTransfer),
    latest_timed_delivery: brief(latestTimedDelivery),
    open_critical_flags: openCritical,
    recent_records: sorted.slice(-RECENT_LIMIT).reverse().map(brief),
    evidence_boundary:
      'Analysis evidence records task-level observed performance. Legacy geometry never authorizes 2027 exact wording, one Chat assessment does not create exam-score confidence, and no aggregate mastery score is inferred here.'
  };
}

export function politicsAnalysisCheckpointKeyAllowed(key) {
  return String(key || '') === POLITICS_ANALYSIS_EVIDENCE_KEY;
}

export function validatePoliticsAnalysisCheckpointValue(key, value) {
  if (!politicsAnalysisCheckpointKeyAllowed(key)) fail('CHECKPOINT_KEY_INVALID', String(key || ''));
  return validatePoliticsAnalysisStore(value);
}
