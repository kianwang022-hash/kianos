export const POLITICS_MEMORY_PLAN_SCHEMA = 'kianos.politics.memory-plan.v1';
export const POLITICS_MEMORY_PLAN_KEY = 'kianos-politics-memory-plan-v1';
export const POLITICS_MEMORY_PLAN_PREFIX = 'kianos-politics-memory-plan-v1:';
export const POLITICS_MEMORY_EVIDENCE_KEY = 'kianos-politics-memory-evidence-v1';
export const POLITICS_MEMORY_PROFILE_SCHEMA = 'kianos.politics.memory-history-profile.v1';
export const POLITICS_MEMORY_PROFILE_UNSTABLE_LIMIT = 100;
export const POLITICS_MEMORY_PROFILE_STABLE_LIMIT = 30;
export const POLITICS_MEMORY_PROFILE_RECENT_EVENT_LIMIT = 50;

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
} = {}, {
  expectedDay = null
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
  if (expectedDay && current.study_day !== expectedDay) fail('RESPONSE_STALE_DAY', current.study_day);
  const byId = catalogMap(catalog);
  if (!catalog?.revision || current.catalog_revision !== catalog.revision) fail('RESPONSE_CATALOG_STALE');
  const candidate = byId.get(candidateId);
  if (!candidate) fail('RESPONSE_CANDIDATE_STALE', candidateId);
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
    catalog_revision: current.catalog_revision,
    candidate_snapshot: {
      id: candidateId,
      subject: clean(candidate.subject, 80),
      chapter_id: clean(candidate.chapter_id, 180),
      natural_unit_id: clean(candidate.natural_unit_id, 220) || null,
      family: clean(candidate.family, 100),
      prompt: clean(candidate.prompt, 500),
      answer_items: (Array.isArray(candidate.answer_items) ? candidate.answer_items : [])
        .map((item) => clean(item, 2400)).filter(Boolean),
      source_refs: (Array.isArray(candidate.source_refs) ? candidate.source_refs : [])
        .map((item) => clean(item, 240)).filter(Boolean),
      source_role: clean(candidate.source_role, 120)
    },
    response: value,
    observed_at: new Date(observed_at).toISOString()
  };
  storage.setItem(POLITICS_MEMORY_EVIDENCE_KEY, JSON.stringify([...evidence, row]));
  return row;
}

export function resolvePoliticsMemoryResume(storage, catalog, {
  expectedDay = null
} = {}) {
  let plan;
  try {
    const raw = JSON.parse(storage.getItem(POLITICS_MEMORY_PLAN_KEY) || 'null');
    plan = raw ? validateStoredPlanShape(raw) : null;
  } catch { fail('CURRENT_PLAN_UNREADABLE'); }
  if (!plan) return null;

  if (expectedDay && plan.study_day !== expectedDay) {
    return {
      status: 'STALE',
      reason: 'study-day-changed',
      plan_id: plan.plan_id,
      study_day: plan.study_day
    };
  }

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


// Browser-control staging: validates plan structure, day and ordering without trusting
// Chat to supply the current catalog. Exact catalog/candidate validation is performed
// again by the Politics Home/Memory consumer before the learner can act.
export function stagePoliticsMemoryPlan(storage, input, {
  expectedDay = null,
  now = Date.now()
} = {}) {
  if (!storage?.getItem || !storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const plan = validateStoredPlanShape(input);
  if (expectedDay && plan.study_day !== expectedDay) fail('PLAN_STALE_DAY', plan.study_day);
  if (Date.parse(plan.generated_at) > Number(now) + 60_000) fail('PLAN_FUTURE');

  let current = null;
  try {
    const raw = storage.getItem(POLITICS_MEMORY_PLAN_KEY);
    current = raw ? validateStoredPlanShape(JSON.parse(raw)) : null;
  } catch { fail('CURRENT_PLAN_UNREADABLE'); }

  if (current?.plan_id === plan.plan_id) {
    if (JSON.stringify(current) !== JSON.stringify(plan)) fail('PLAN_REPLAY_CONFLICT', plan.plan_id);
    return { status:'idempotent', plan: current };
  }
  let replacedStaleDay = false;
  if (current) {
    if (Date.parse(plan.generated_at) <= Date.parse(current.generated_at || 0)) {
      fail('PLAN_NOT_NEWER');
    }
    if (current.study_day !== plan.study_day) {
      // A new study day may replace yesterday's current pointer without requiring
      // Chat to recover an obsolete plan id. The exact historical plan remains stored.
      replacedStaleDay = true;
    } else if (clean(plan.supersedes_plan_id, 160) !== clean(current.plan_id, 160)) {
      fail('PLAN_SUPERSEDE_REQUIRED', current.plan_id);
    }
  } else if (clean(plan.supersedes_plan_id, 160)) {
    fail('PLAN_SUPERSEDE_TARGET_MISSING', plan.supersedes_plan_id);
  }

  const exactKey = POLITICS_MEMORY_PLAN_PREFIX + plan.plan_id;
  const existingExact = storage.getItem(exactKey);
  if (existingExact != null) fail('PLAN_ID_CONFLICT', plan.plan_id);
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
  return { status: replacedStaleDay ? 'replaced_stale_day' : current ? 'superseded' : 'applied', plan };
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
        || !clean(row.catalog_revision, 200)
        || !record(row.candidate_snapshot)
        || clean(row.candidate_snapshot.id, 220) !== clean(row.candidate_id, 220)
        || !Array.isArray(row.candidate_snapshot.answer_items)
        || !Array.isArray(row.candidate_snapshot.source_refs)
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


function normalizeCandidateSnapshot(candidate) {
  return {
    id: clean(candidate?.id, 220),
    subject: clean(candidate?.subject, 80),
    chapter_id: clean(candidate?.chapter_id, 180),
    natural_unit_id: clean(candidate?.natural_unit_id, 220) || null,
    family: clean(candidate?.family, 100),
    prompt: clean(candidate?.prompt, 500),
    answer_items: (Array.isArray(candidate?.answer_items) ? candidate.answer_items : [])
      .map((item) => clean(item, 2400)).filter(Boolean),
    source_refs: [...new Set((Array.isArray(candidate?.source_refs) ? candidate.source_refs : [])
      .map((item) => clean(item, 240)).filter(Boolean))].sort(),
    source_role: clean(candidate?.source_role, 120)
  };
}

function candidateSnapshotMatchesCurrent(snapshot, candidate) {
  if (!record(snapshot) || !record(candidate)) return false;
  return JSON.stringify(normalizeCandidateSnapshot(snapshot))
    === JSON.stringify(normalizeCandidateSnapshot(candidate));
}

function studyDayDistance(currentDay, priorDay) {
  if (!validDay(currentDay) || !validDay(priorDay)) return null;
  const current = Date.parse(currentDay + 'T00:00:00Z');
  const prior = Date.parse(priorDay + 'T00:00:00Z');
  if (!Number.isFinite(current) || !Number.isFinite(prior)) return null;
  return Math.max(0, Math.floor((current - prior) / 86400000));
}

function responseCount(events, response) {
  return events.filter((row) => row.response === response).length;
}

function boundedHistoryState(candidate, events, currentDay) {
  const sorted = [...events].sort((a, b) => String(a.observed_at || '').localeCompare(String(b.observed_at || '')));
  const latest = sorted.at(-1);
  return {
    candidate_id: candidate.id,
    subject: clean(candidate.subject, 80),
    chapter_id: clean(candidate.chapter_id, 180),
    natural_unit_id: clean(candidate.natural_unit_id, 220) || null,
    family: clean(candidate.family, 100),
    prompt: clean(candidate.prompt, 500),
    source_refs: [...new Set((candidate.source_refs || []).map((ref) => clean(ref, 240)).filter(Boolean))].sort(),
    latest_response: latest?.response || null,
    latest_observed_at: latest?.observed_at || null,
    latest_study_day: latest?.study_day || null,
    study_days_since_latest: studyDayDistance(currentDay, latest?.study_day),
    event_count: sorted.length,
    forgot_count: responseCount(sorted, 'FORGOT'),
    fuzzy_count: responseCount(sorted, 'FUZZY'),
    stable_count: responseCount(sorted, 'STABLE'),
    recent_responses: sorted.slice(-5).map((row) => ({
      response: row.response,
      observed_at: row.observed_at,
      study_day: row.study_day
    }))
  };
}

export function buildPoliticsMemoryHistoryProfile(evidenceInput, catalog, {
  now = Date.now(),
  currentDay = null,
  unstableLimit = POLITICS_MEMORY_PROFILE_UNSTABLE_LIMIT,
  stableLimit = POLITICS_MEMORY_PROFILE_STABLE_LIMIT,
  recentEventLimit = POLITICS_MEMORY_PROFILE_RECENT_EVENT_LIMIT
} = {}) {
  const byId = catalogMap(catalog);
  const currentRevision = clean(catalog?.revision, 200);
  const resolvedCurrentDay = validDay(currentDay)
    ? currentDay
    : new Date(Number(now)).toISOString().slice(0, 10);
  if (!currentRevision) fail('CATALOG_REVISION_REQUIRED');

  const evidence = validateStoredEvidenceShape(Array.isArray(evidenceInput) ? evidenceInput : []);
  const compatible = [];
  const stale = [];

  for (const row of evidence) {
    const candidate = byId.get(clean(row?.candidate_id, 220));
    if (!candidate) {
      stale.push({ event: row, reason: 'CURRENT_CANDIDATE_MISSING' });
      continue;
    }
    if (!candidateSnapshotMatchesCurrent(row.candidate_snapshot, candidate)) {
      stale.push({ event: row, reason: 'CURRENT_CANDIDATE_CHANGED' });
      continue;
    }
    compatible.push(row);
  }

  const grouped = new Map();
  for (const row of compatible) {
    const id = clean(row.candidate_id, 220);
    if (!grouped.has(id)) grouped.set(id, []);
    grouped.get(id).push(row);
  }

  const states = [...grouped.entries()].map(([id, rows]) =>
    boundedHistoryState(byId.get(id), rows, resolvedCurrentDay)
  );

  const unstableRecent = states
    .filter((row) => row.latest_response === 'FORGOT' || row.latest_response === 'FUZZY')
    .sort((a, b) =>
      String(b.latest_observed_at || '').localeCompare(String(a.latest_observed_at || ''))
      || a.candidate_id.localeCompare(b.candidate_id)
    );
  const unstableOldest = [...unstableRecent].sort((a, b) =>
    String(a.latest_observed_at || '').localeCompare(String(b.latest_observed_at || ''))
    || a.candidate_id.localeCompare(b.candidate_id)
  );

  const stable = states
    .filter((row) => row.latest_response === 'STABLE')
    .sort((a, b) =>
      String(a.latest_observed_at || '').localeCompare(String(b.latest_observed_at || ''))
      || a.candidate_id.localeCompare(b.candidate_id)
    );

  const recentEvents = [...compatible]
    .sort((a, b) => String(b.observed_at || '').localeCompare(String(a.observed_at || '')))
    .slice(0, Math.max(1, Math.min(200, Math.floor(Number(recentEventLimit) || POLITICS_MEMORY_PROFILE_RECENT_EVENT_LIMIT))))
    .map((row) => ({
      candidate_id: row.candidate_id,
      response: row.response,
      observed_at: row.observed_at,
      study_day: row.study_day,
      plan_id: row.plan_id
    }));

  const unstableCap = Math.max(2, Math.min(200, Math.floor(Number(unstableLimit) || POLITICS_MEMORY_PROFILE_UNSTABLE_LIMIT)));
  const unstableRecentCap = Math.ceil(unstableCap / 2);
  const unstableOldestCap = Math.floor(unstableCap / 2);
  const stableCap = Math.max(1, Math.min(100, Math.floor(Number(stableLimit) || POLITICS_MEMORY_PROFILE_STABLE_LIMIT)));

  return {
    schema: POLITICS_MEMORY_PROFILE_SCHEMA,
    semantics: 'CURRENT_BOUND_HISTORY_SUMMARY; CHAT_OWNS_SCHEDULING; NO_FIXED_CADENCE; NOT_MASTERY',
    current_catalog_revision: currentRevision,
    summary: {
      catalog_candidate_count: byId.size,
      total_events: evidence.length,
      current_compatible_events: compatible.length,
      stale_or_changed_events: stale.length,
      current_candidates_with_evidence: states.length,
      latest_forgot_candidates: states.filter((row) => row.latest_response === 'FORGOT').length,
      latest_fuzzy_candidates: states.filter((row) => row.latest_response === 'FUZZY').length,
      latest_stable_candidates: states.filter((row) => row.latest_response === 'STABLE').length
    },
    unstable_recent: unstableRecent.slice(0, unstableRecentCap),
    unstable_oldest: unstableOldest.slice(0, unstableOldestCap),
    unstable_total: unstableRecent.length,
    unstable_overflow: Math.max(0, unstableRecent.length - unstableCap),
    oldest_stable_sample: stable.slice(0, stableCap),
    oldest_stable_overflow: Math.max(0, stable.length - stableCap),
    recent_events: recentEvents,
    stale_or_changed: {
      event_count: stale.length,
      candidate_missing_count: stale.filter((row) => row.reason === 'CURRENT_CANDIDATE_MISSING').length,
      candidate_changed_count: stale.filter((row) => row.reason === 'CURRENT_CANDIDATE_CHANGED').length
    },
    guardrails: [
      'RAW_MEMORY_HISTORY_REMAINS_LOCAL',
      'PROFILE_DOES_NOT_CREATE_A_REVIEW_SCHEDULE',
      'OLD_CATALOG_EVIDENCE_IS_REUSED_ONLY_WHEN_THE_CANDIDATE_SNAPSHOT_STILL_MATCHES_CURRENT',
      'STALE_OR_CHANGED_EVIDENCE_NEVER_AUTO_SELECTS_A_CURRENT_MEMORY_TASK',
      'STABLE_IS_EVIDENCE_NOT_MASTERY',
      'CHAT_SELECTS_TODAY_MEMORY_ITEMS'
    ]
  };
}

export function politicsMemoryDailyEvidence(storage, {
  day,
  now = Date.now(),
  catalog = null
} = {}) {
  if (!validDay(day)) fail('DAILY_EVIDENCE_DAY_INVALID');
  const allEvidence = readEvidence(storage);
  const events = allEvidence
    .filter((row) => row?.study_day === day)
    .sort((a, b) => String(a.observed_at || '').localeCompare(String(b.observed_at || '')));
  const historyProfile = catalog
    ? buildPoliticsMemoryHistoryProfile(allEvidence, catalog, { now, currentDay: day })
    : null;

  let currentPlan = null;
  try {
    const raw = storage?.getItem?.(POLITICS_MEMORY_PLAN_KEY);
    currentPlan = raw ? validateStoredPlanShape(JSON.parse(raw)) : null;
  } catch {
    fail('DAILY_EVIDENCE_PLAN_UNREADABLE');
  }

  const count = (response) => events.filter((row) => row.response === response).length;
  const currentDayPlan = currentPlan?.study_day === day ? currentPlan : null;
  const completedIds = new Set(events
    .filter((row) => row.plan_id === currentDayPlan?.plan_id)
    .map((row) => row.candidate_id));

  return {
    schema: 'kianos.politics.memory-evidence.v1',
    study_day: day,
    generated_at: new Date(now).toISOString(),
    summary: {
      recall_count: events.length,
      forgot_count: count('FORGOT'),
      fuzzy_count: count('FUZZY'),
      stable_count: count('STABLE')
    },
    current_plan: currentDayPlan ? {
      plan_id: currentDayPlan.plan_id,
      catalog_revision: currentDayPlan.catalog_revision,
      phase: currentDayPlan.phase || null,
      planned_count: currentDayPlan.items.length,
      completed_count: currentDayPlan.items.filter((item) => completedIds.has(item.candidate_id)).length
    } : null,
    history_profile: historyProfile,
    events: events.map((row) => JSON.parse(JSON.stringify(row)))
  };
}
