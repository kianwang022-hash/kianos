export const POLITICS_ANALYSIS_EVIDENCE_SCHEMA = 'kianos.politics.analysis-evidence.v1';
export const POLITICS_ANALYSIS_BATCH_SCHEMA = 'kianos.politics.analysis-evidence-batch.v1';
export const POLITICS_ANALYSIS_PROFILE_SCHEMA = 'kianos.politics.analysis-history-profile.v1';

const RATINGS = new Set([0, 1, 2, 'U']);
const DEPTHS = new Set(['IDENTIFY','SEGMENTATION','SKELETON','MATERIAL_BINDING','FORMULATION','COMPLETE','TIMED_COMPLETE']);
const EXPOSURES = new Set(['FRESH','CHANGED_CONTEXT','EXPOSED','REPAIR_SAME_TASK','UNKNOWN']);
const record = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const clean = (v, max = 4000) => String(v ?? '').trim().slice(0, max);
const validDay = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));
const validIso = (v) => { const s = clean(v, 80); return s && Number.isFinite(Date.parse(s)) ? s : ''; };

function normalizeRatings(input = {}) {
  const out = {};
  for (const key of ['D1','D2','D3','D4','D5','D6','D7']) {
    if (!(key in input)) continue;
    const value = input[key];
    if (!RATINGS.has(value)) throw new Error('POLITICS_ANALYSIS_EVIDENCE_RATING_INVALID:' + key);
    out[key] = value;
  }
  return out;
}

export function validatePoliticsAnalysisEvidence(input, { expectedDay = null } = {}) {
  if (!record(input) || input.schema !== POLITICS_ANALYSIS_EVIDENCE_SCHEMA) {
    throw new Error('POLITICS_ANALYSIS_EVIDENCE_SCHEMA_INVALID');
  }
  const eventId = clean(input.event_id, 220);
  const taskId = clean(input.task_id, 220);
  const taskRevision = clean(input.task_revision, 220);
  const attemptId = clean(input.attempt_id, 220);
  const sourceBasis = clean(input.source_basis, 600);
  const materialIdentity = clean(input.material_identity, 220) || null;
  const materialFamilyId = clean(input.material_family_id, 700) || null;
  const studyDay = clean(input.study_day, 20);
  const observedAt = validIso(input.observed_at);
  const requestedDepth = clean(input.requested_depth, 80);
  const requestedExposureState = clean(input.exposure_state || 'UNKNOWN', 80);
  if (!eventId || !taskId || !taskRevision || !attemptId || !sourceBasis || !validDay(studyDay) || !observedAt) {
    throw new Error('POLITICS_ANALYSIS_EVIDENCE_IDENTITY_INVALID');
  }
  if (expectedDay && studyDay !== expectedDay) throw new Error('POLITICS_ANALYSIS_EVIDENCE_DAY_MISMATCH');
  if (!DEPTHS.has(requestedDepth)) throw new Error('POLITICS_ANALYSIS_EVIDENCE_DEPTH_INVALID');
  if (!EXPOSURES.has(requestedExposureState)) throw new Error('POLITICS_ANALYSIS_EVIDENCE_EXPOSURE_INVALID');
  if ((materialIdentity && !materialFamilyId) || (!materialIdentity && materialFamilyId)) {
    throw new Error('POLITICS_ANALYSIS_EVIDENCE_MATERIAL_IDENTITY_PARTIAL');
  }
  const identityBound = Boolean(materialIdentity && materialFamilyId);
  const exposureState =
    ['FRESH','CHANGED_CONTEXT'].includes(requestedExposureState) && !identityBound
      ? 'UNKNOWN'
      : requestedExposureState;
  const materialIdentityStatus = identityBound
    ? 'BOUND'
    : 'LEGACY_MATERIAL_IDENTITY_UNAVAILABLE';
  const ratings = normalizeRatings(input.ratings || {});
  if (!Object.keys(ratings).length) throw new Error('POLITICS_ANALYSIS_EVIDENCE_RATINGS_EMPTY');
  const currentYearStatus = clean(input.current_year_status || 'UNKNOWN', 120);
  const rater = clean(input.rater || 'CHAT', 120);
  const secondReview = clean(input.second_review_status || 'NONE', 120);
  const repairOf = clean(input.repair_of, 220) || null;
  const notes = clean(input.notes, 3000) || null;
  return {
    schema: POLITICS_ANALYSIS_EVIDENCE_SCHEMA,
    event_id: eventId,
    task_id: taskId,
    task_revision: taskRevision,
    attempt_id: attemptId,
    source_basis: sourceBasis,
    material_identity: materialIdentity,
    material_family_id: materialFamilyId,
    material_identity_status: materialIdentityStatus,
    current_year_status: currentYearStatus,
    study_day: studyDay,
    observed_at: observedAt,
    requested_depth: requestedDepth,
    exposure_state: exposureState,
    ratings,
    rater,
    second_review_status: secondReview,
    repair_of: repairOf,
    notes
  };
}

export function validatePoliticsAnalysisEvidenceBatch(input, { expectedDay = null } = {}) {
  if (!record(input) || input.schema !== POLITICS_ANALYSIS_BATCH_SCHEMA) {
    throw new Error('POLITICS_ANALYSIS_BATCH_SCHEMA_INVALID');
  }
  const studyDay = clean(input.study_day, 20);
  if (!validDay(studyDay)) throw new Error('POLITICS_ANALYSIS_BATCH_DAY_INVALID');
  if (expectedDay && studyDay !== expectedDay) throw new Error('POLITICS_ANALYSIS_BATCH_DAY_MISMATCH');
  const generatedAt = validIso(input.generated_at);
  if (!generatedAt) throw new Error('POLITICS_ANALYSIS_BATCH_GENERATED_AT_INVALID');
  const events = (Array.isArray(input.events) ? input.events : []).map((event) =>
    validatePoliticsAnalysisEvidence(event, { expectedDay: studyDay })
  );
  if (!events.length) throw new Error('POLITICS_ANALYSIS_BATCH_EMPTY');
  const ids = new Set();
  for (const event of events) {
    if (ids.has(event.event_id)) throw new Error('POLITICS_ANALYSIS_BATCH_DUPLICATE_EVENT:' + event.event_id);
    ids.add(event.event_id);
  }
  return { schema: POLITICS_ANALYSIS_BATCH_SCHEMA, study_day: studyDay, generated_at: generatedAt, events };
}

export function applyPoliticsAnalysisEvidenceBatch(storage, input, {
  expectedDay = null,
  evidenceKey = 'kianos-politics-evidence-v1'
} = {}) {
  if (!storage?.getItem || !storage?.setItem) throw new Error('POLITICS_ANALYSIS_STORAGE_UNAVAILABLE');
  const batch = validatePoliticsAnalysisEvidenceBatch(input, { expectedDay });
  let existing;
  try { existing = JSON.parse(storage.getItem(evidenceKey) || '[]'); }
  catch { throw new Error('POLITICS_ANALYSIS_EVIDENCE_LEDGER_UNREADABLE'); }
  if (!Array.isArray(existing) || !existing.every(record)) throw new Error('POLITICS_ANALYSIS_EVIDENCE_LEDGER_INVALID');
  const byId = new Map(existing.filter((row) => row?.event_id).map((row) => [row.event_id, row]));
  const seenExactMaterial = new Set();
  const seenMaterialFamily = new Set();
  for (const row of existing) {
    if (row?.schema !== POLITICS_ANALYSIS_EVIDENCE_SCHEMA) continue;
    if (row.material_identity) seenExactMaterial.add(String(row.material_identity));
    const family = row.material_family_id || (row.source_basis ? 'source-family:' + row.source_basis : null);
    if (family) seenMaterialFamily.add(String(family));
  }

  let appended = 0;
  const next = [...existing];
  for (const event of batch.events) {
    const prior = byId.get(event.event_id);
    if (prior) {
      if (JSON.stringify(prior) !== JSON.stringify(event)) throw new Error('POLITICS_ANALYSIS_EVIDENCE_CONFLICT_KEEP_FIRST:' + event.event_id);
      continue;
    }

    if (event.exposure_state === 'FRESH') {
      if (seenExactMaterial.has(event.material_identity)) {
        throw new Error('POLITICS_ANALYSIS_EVIDENCE_FRESH_EXACT_MATERIAL_REUSED:' + event.event_id);
      }
      if (seenMaterialFamily.has(event.material_family_id)) {
        throw new Error('POLITICS_ANALYSIS_EVIDENCE_FRESH_MATERIAL_FAMILY_EXPOSED:' + event.event_id);
      }
    }
    if (event.exposure_state === 'CHANGED_CONTEXT' && seenExactMaterial.has(event.material_identity)) {
      throw new Error('POLITICS_ANALYSIS_EVIDENCE_CHANGED_CONTEXT_EXACT_MATERIAL_REUSED:' + event.event_id);
    }

    next.push(event);
    byId.set(event.event_id, event);
    if (event.material_identity) seenExactMaterial.add(event.material_identity);
    if (event.material_family_id) seenMaterialFamily.add(event.material_family_id);
    appended += 1;
  }
  storage.setItem(evidenceKey, JSON.stringify(next));
  return { batch, appended, total_events: next.length };
}

export function buildPoliticsAnalysisEvidenceProfile(eventsInput = [], { recentLimit = 30 } = {}) {
  const events = (Array.isArray(eventsInput) ? eventsInput : [])
    .filter((row) => row?.schema === POLITICS_ANALYSIS_EVIDENCE_SCHEMA)
    .map((row) => { try { return validatePoliticsAnalysisEvidence(row); } catch { return null; } })
    .filter(Boolean)
    .sort((a,b) => String(a.observed_at).localeCompare(String(b.observed_at)));
  const latestByTask = new Map();
  for (const event of events) latestByTask.set(event.task_id + '@' + event.task_revision, event);
  const ratingCounts = Object.fromEntries(['D1','D2','D3','D4','D5','D6','D7'].map((d) => [d, { broken:0, partial:0, usable:0, unknown:0 }]));
  for (const event of latestByTask.values()) {
    for (const [dimension,value] of Object.entries(event.ratings || {})) {
      const row = ratingCounts[dimension];
      if (!row) continue;
      if (value === 0) row.broken += 1;
      else if (value === 1) row.partial += 1;
      else if (value === 2) row.usable += 1;
      else row.unknown += 1;
    }
  }
  const recent = events.slice(-Math.max(1, Math.min(100, Number(recentLimit) || 30))).map((event) => ({
    event_id:event.event_id, task_id:event.task_id, task_revision:event.task_revision, study_day:event.study_day,
    observed_at:event.observed_at, requested_depth:event.requested_depth, exposure_state:event.exposure_state,
    material_identity:event.material_identity, material_family_id:event.material_family_id,
    material_identity_status:event.material_identity_status,
    ratings:event.ratings, current_year_status:event.current_year_status, second_review_status:event.second_review_status
  }));
  return {
    schema: POLITICS_ANALYSIS_PROFILE_SCHEMA,
    role: 'BOUNDED_PRIVATE_ANALYSIS_EVIDENCE_PROFILE_NOT_SCORE_OR_SCHEDULER',
    summary: {
      total_events: events.length,
      current_tasks_with_evidence: latestByTask.size,
      current_task_revisions_with_evidence: latestByTask.size,
      dimensions: ratingCounts
    },
    recent_events: recent,
    boundary: [
      'RAW_ANSWERS_REMAIN_PRIVATE_CHAT_OR_LOCAL_TRUTH',
      'DIAGNOSTIC_RATINGS_ARE_NOT_EXAM_SCORE',
      'EXPOSED_OR_REPAIR_SAME_TASK_IS_NOT_FRESH_TRANSFER',
      'FRESH_REQUIRES_UNSEEN_EXACT_MATERIAL_AND_UNSEEN_MATERIAL_FAMILY',
      'MISSING_LEGACY_MATERIAL_IDENTITY_DOWNGRADES_FRESHNESS_TO_UNKNOWN',
      'CHAT_DECIDES_NEXT_ANALYSIS_ACTION'
    ]
  };
}
