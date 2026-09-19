export const POLITICS_MEMORY_PLAN_SCHEMA = 'kianos.politics.memory-plan.v1';
export const POLITICS_MEMORY_PLAN_KEY = 'kianos-politics-memory-plan-v1';
export const POLITICS_MEMORY_PLAN_PREFIX = 'kianos-politics-memory-plan-v1:';
export const POLITICS_MEMORY_EVIDENCE_KEY = 'kianos-politics-memory-evidence-v1';

const RESPONSES = new Set(['FORGOT', 'FUZZY', 'STABLE']);
const clean = (value, max = 1000) => String(value ?? '').trim().slice(0, max);
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function fail(code, detail = '') {
  throw new Error('POLITICS_MEMORY_' + code + (detail ? ':' + detail : ''));
}

function validDay(day) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(day || ''));
}

function catalogMap(catalog) {
  if (!record(catalog) || catalog.schema !== 'kianos.politics.memory-candidate-catalog.v1') {
    fail('CATALOG_INVALID');
  }
  return new Map((Array.isArray(catalog.candidates) ? catalog.candidates : [])
    .map((row) => [String(row?.id || ''), row]).filter(([id]) => id));
}

export function validatePoliticsMemoryPlan(input, catalog, {
  expectedDay = null,
  now = Date.now()
} = {}) {
  if (!record(input) || input.schema !== POLITICS_MEMORY_PLAN_SCHEMA) fail('PLAN_SCHEMA_INVALID');
  const planId = clean(input.plan_id, 160);
  const studyDay = clean(input.study_day, 20);
  const generatedAt = clean(input.generated_at, 80);
  const phase = clean(input.phase, 80);
  if (!planId) fail('PLAN_ID_REQUIRED');
  if (!validDay(studyDay)) fail('PLAN_DAY_INVALID');
  if (expectedDay && studyDay !== expectedDay) fail('PLAN_STALE_DAY', studyDay);
  if (!generatedAt || Number.isNaN(Date.parse(generatedAt))) fail('PLAN_GENERATED_AT_INVALID');
  if (Date.parse(generatedAt) > Number(now) + 60_000) fail('PLAN_FUTURE');

  const byId = catalogMap(catalog);
  const catalogRevision = clean(catalog?.revision, 200);
  if (!catalogRevision) fail('CATALOG_REVISION_REQUIRED');
  if (clean(input.catalog_revision, 200) !== catalogRevision) fail('PLAN_CATALOG_MISMATCH');
  const rawItems = Array.isArray(input.items) ? input.items : [];
  if (rawItems.length > 100) fail('PLAN_TOO_LARGE');
  const seen = new Set();
  const items = rawItems.map((raw, index) => {
    const candidateId = clean(raw?.candidate_id, 220);
    if (!candidateId || seen.has(candidateId)) fail('PLAN_ITEM_INVALID', String(index));
    const candidate = byId.get(candidateId);
    if (!candidate) fail('PLAN_UNKNOWN_CANDIDATE', candidateId);
    seen.add(candidateId);
    return {
      candidate_id: candidateId,
      reason: clean(raw?.reason, 1200) || null
    };
  });

  return {
    schema: POLITICS_MEMORY_PLAN_SCHEMA,
    plan_id: planId,
    study_day: studyDay,
    generated_at: new Date(generatedAt).toISOString(),
    catalog_revision: catalogRevision,
    phase: phase || null,
    supersedes_plan_id: clean(input.supersedes_plan_id, 160) || null,
    items
  };
}

export function applyPoliticsMemoryPlan(storage, catalog, input, options = {}) {
  if (!storage?.getItem || !storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const plan = validatePoliticsMemoryPlan(input, catalog, options);
  let current = null;
  try {
    const raw = storage.getItem(POLITICS_MEMORY_PLAN_KEY);
    current = raw ? JSON.parse(raw) : null;
  } catch { fail('CURRENT_PLAN_UNREADABLE'); }

  if (current?.plan_id === plan.plan_id) {
    if (JSON.stringify(current) !== JSON.stringify(plan)) fail('PLAN_REPLAY_CONFLICT', plan.plan_id);
    return { status: 'idempotent', plan: current };
  }

  if (current) {
    if (plan.supersedes_plan_id !== current.plan_id) fail('PLAN_SUPERSEDE_REQUIRED', current.plan_id);
    if (Date.parse(plan.generated_at) <= Date.parse(current.generated_at || 0)) fail('PLAN_NOT_NEWER');
  } else if (plan.supersedes_plan_id) {
    fail('PLAN_SUPERSEDE_TARGET_MISSING', plan.supersedes_plan_id);
  }

  const exactKey = POLITICS_MEMORY_PLAN_PREFIX + plan.plan_id;
  if (storage.getItem(exactKey) != null) fail('PLAN_ID_CONFLICT', plan.plan_id);

  const beforeCurrent = storage.getItem(POLITICS_MEMORY_PLAN_KEY);
  try {
    storage.setItem(exactKey, JSON.stringify(plan));
    storage.setItem(POLITICS_MEMORY_PLAN_KEY, JSON.stringify(plan));
  } catch (error) {
    try {
      if (beforeCurrent == null) storage.removeItem?.(POLITICS_MEMORY_PLAN_KEY);
      else storage.setItem(POLITICS_MEMORY_PLAN_KEY, beforeCurrent);
      storage.removeItem?.(exactKey);
    } catch {}
    throw error;
  }
  return { status: current ? 'superseded' : 'applied', plan };
}

function readEvidence(storage) {
  try {
    const value = JSON.parse(storage.getItem(POLITICS_MEMORY_EVIDENCE_KEY) || '[]');
    if (!Array.isArray(value)) fail('EVIDENCE_INVALID');
    return value;
  } catch (error) {
    if (String(error?.message || error).includes('POLITICS_MEMORY_')) throw error;
    fail('EVIDENCE_INVALID');
  }
}

export function recordPoliticsMemoryResponse(storage, catalog, {
  plan_id,
  candidate_id,
  response,
  observed_at = new Date().toISOString()
} = {}) {
  const planId = clean(plan_id, 160);
  const candidateId = clean(candidate_id, 220);
  const value = clean(response, 20).toUpperCase();
  if (!RESPONSES.has(value)) fail('RESPONSE_INVALID');
  if (!observed_at || Number.isNaN(Date.parse(observed_at))) fail('RESPONSE_TIME_INVALID');

  let current;
  try { current = JSON.parse(storage.getItem(POLITICS_MEMORY_PLAN_KEY) || 'null'); }
  catch { fail('CURRENT_PLAN_UNREADABLE'); }
  if (!current || current.plan_id !== planId) fail('RESPONSE_PLAN_NOT_CURRENT');
  const byId = catalogMap(catalog);
  if (!catalog?.revision || current.catalog_revision !== catalog.revision) fail('RESPONSE_CATALOG_STALE');
  if (!byId.has(candidateId)) fail('RESPONSE_CANDIDATE_STALE', candidateId);
  if (!(current.items || []).some((item) => item.candidate_id === candidateId)) {
    fail('RESPONSE_CANDIDATE_OUT_OF_PLAN', candidateId);
  }

  const evidence = readEvidence(storage);
  const eventId = planId + ':' + candidateId;
  if (evidence.some((row) => row?.event_id === eventId)) fail('RESPONSE_ALREADY_RECORDED', candidateId);
  const row = {
    schema: 'kianos.politics.memory-recall-event.v1',
    event_id: eventId,
    plan_id: planId,
    study_day: current.study_day,
    candidate_id: candidateId,
    response: value,
    observed_at: new Date(observed_at).toISOString()
  };
  storage.setItem(POLITICS_MEMORY_EVIDENCE_KEY, JSON.stringify([...evidence, row]));
  return row;
}

export function resolvePoliticsMemoryResume(storage, catalog) {
  let plan;
  try { plan = JSON.parse(storage.getItem(POLITICS_MEMORY_PLAN_KEY) || 'null'); }
  catch { fail('CURRENT_PLAN_UNREADABLE'); }
  if (!plan) return null;

  const byId = catalogMap(catalog);
  if (!catalog?.revision || plan.catalog_revision !== catalog.revision) {
    return {
      status: 'STALE',
      reason: 'catalog-revision-changed',
      plan_id: plan.plan_id
    };
  }
  const evidence = readEvidence(storage);
  const done = new Set(evidence
    .filter((row) => row?.plan_id === plan.plan_id)
    .map((row) => row.candidate_id));

  for (let index = 0; index < (plan.items || []).length; index += 1) {
    const item = plan.items[index];
    if (done.has(item.candidate_id)) continue;
    const candidate = byId.get(item.candidate_id);
    if (!candidate) {
      return {
        status: 'STALE',
        reason: 'candidate-missing',
        plan_id: plan.plan_id,
        candidate_id: item.candidate_id
      };
    }
    return {
      status: 'ACTIVE',
      index,
      total: plan.items.length,
      plan,
      item,
      candidate
    };
  }

  return {
    status: 'COMPLETE',
    plan_id: plan.plan_id,
    total: (plan.items || []).length
  };
}


export function politicsMemoryCheckpointKeyAllowed(key) {
  const value = String(key || '');
  return value === POLITICS_MEMORY_PLAN_KEY
    || value === POLITICS_MEMORY_EVIDENCE_KEY
    || value.startsWith(POLITICS_MEMORY_PLAN_PREFIX);
}

function validateStoredPlanShape(value) {
  if (!record(value)
      || value.schema !== POLITICS_MEMORY_PLAN_SCHEMA
      || !clean(value.plan_id, 160)
      || !validDay(value.study_day)
      || !clean(value.generated_at, 80)
      || Number.isNaN(Date.parse(value.generated_at))
      || !clean(value.catalog_revision, 200)
      || !Array.isArray(value.items)) {
    fail('CHECKPOINT_PLAN_INVALID');
  }
  const ids = value.items.map((item) => clean(item?.candidate_id, 220)).filter(Boolean);
  if (ids.length !== value.items.length || new Set(ids).size !== ids.length) {
    fail('CHECKPOINT_PLAN_ITEMS_INVALID');
  }
  return value;
}

function validateStoredEvidenceShape(value) {
  if (!Array.isArray(value)) fail('CHECKPOINT_EVIDENCE_INVALID');
  for (const row of value) {
    if (!record(row)
        || row.schema !== 'kianos.politics.memory-recall-event.v1'
        || !clean(row.event_id, 400)
        || !clean(row.plan_id, 160)
        || !validDay(row.study_day)
        || !clean(row.candidate_id, 220)
        || !RESPONSES.has(clean(row.response, 20).toUpperCase())
        || !clean(row.observed_at, 80)
        || Number.isNaN(Date.parse(row.observed_at))) {
      fail('CHECKPOINT_EVIDENCE_INVALID');
    }
  }
  return value;
}

export function validatePoliticsMemoryCheckpointValue(key, value) {
  const k = String(key || '');
  if (k === POLITICS_MEMORY_EVIDENCE_KEY) return validateStoredEvidenceShape(value);
  if (k === POLITICS_MEMORY_PLAN_KEY || k.startsWith(POLITICS_MEMORY_PLAN_PREFIX)) {
    return validateStoredPlanShape(value);
  }
  fail('CHECKPOINT_KEY_INVALID', k);
}
