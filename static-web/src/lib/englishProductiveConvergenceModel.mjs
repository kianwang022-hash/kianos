import { translationPromptIds } from './translationRuntimeModel.mjs';
import { WRITING_STATES } from './writingRuntimeModel.mjs';

const clean = (value) => String(value ?? '').trim();
const clone = (value) => typeof structuredClone === 'function'
  ? structuredClone(value)
  : JSON.parse(JSON.stringify(value));
const nowIso = (now) => {
  if (typeof now === 'string' && now) return now;
  if (now instanceof Date) return now.toISOString();
  return new Date().toISOString();
};

/**
 * Learner already decided a Translation set needs revision (possibly after a
 * normal Chat discussion). This transition records no machine diagnosis and
 * admits no transfer target; it only opens same-item Reconstruction for the
 * learner-selected segments while preserving the frozen first attempt.
 */
export function startManualTranslationReconstruction(state, prompts = [], affected = []) {
  if (!state || !['diagnosis', 'decision'].includes(state.stage)) {
    throw new Error(`TRANSLATION_MANUAL_RECONSTRUCT_INVALID_STAGE:${state?.stage || 'missing'}`);
  }
  const valid = new Set(translationPromptIds(prompts));
  const ids = [...new Set((Array.isArray(affected) ? affected : []).map(clean).filter(Boolean))];
  if (!ids.length) throw new Error('TRANSLATION_MANUAL_RECONSTRUCT_SEGMENT_REQUIRED');
  const invalid = ids.filter((id) => !valid.has(id));
  if (invalid.length) throw new Error(`TRANSLATION_MANUAL_RECONSTRUCT_SEGMENT_INVALID:${invalid.join('|')}`);
  const firstComplete = [...valid].every((id) => clean(state.firstAttempts?.[id]));
  if (!firstComplete) throw new Error('TRANSLATION_MANUAL_RECONSTRUCT_FIRST_ATTEMPT_INCOMPLETE');

  const next = clone(state);
  next.stage = 'reconstruct';
  next.decision = 'REPAIR_NEEDED';
  next.chatReturn = null;
  next.affectedSegments = ids;
  next.pendingTransferCandidate = null;
  next.referenceRevealed = false;
  next.completeReferenceOpen = false;
  next.reconstructDrafts = { ...(next.reconstructDrafts || {}) };
  for (const id of ids) {
    if (!(id in next.reconstructDrafts)) next.reconstructDrafts[id] = '';
  }
  return next;
}

/**
 * Save a learner-authored Writing revision without inventing a Chat diagnosis.
 * First draft stays immutable; the revision is local task evidence only.
 */
export function saveManualWritingRevision(record, revision, now) {
  if (!record || record.state !== WRITING_STATES.REVIEW_PENDING) {
    throw new Error(`WRITING_MANUAL_REVISION_INVALID_STATE:${record?.state || 'missing'}`);
  }
  if (!clean(record.firstDraft)) throw new Error('WRITING_MANUAL_REVISION_FIRST_DRAFT_MISSING');
  const text = clean(revision);
  if (!text) throw new Error('WRITING_MANUAL_REVISION_EMPTY');

  const next = clone(record);
  next.manualRevisions = Array.isArray(next.manualRevisions) ? [...next.manualRevisions] : [];
  const last = clean(next.manualRevisions[next.manualRevisions.length - 1]?.text);
  if (last !== text) next.manualRevisions.push({ text, at: nowIso(now) });
  next.manualRevisionDraft = text;
  next.draftEssay = text;
  next.updatedAt = nowIso(now);
  return next;
}

/**
 * Cheap PASS is a real English exit. It may follow the immutable first draft or
 * a learner-authored manual revision. No repair/transfer debt is manufactured.
 */
export function passWritingManualReview(record, revision = '', now) {
  if (!record || record.state !== WRITING_STATES.REVIEW_PENDING) {
    throw new Error(`WRITING_MANUAL_PASS_INVALID_STATE:${record?.state || 'missing'}`);
  }
  let next = clone(record);
  const text = clean(revision);
  if (text && text !== clean(next.firstDraft)) next = saveManualWritingRevision(next, text, now);
  next.state = WRITING_STATES.PASS_ACCEPTABLE;
  next.completedAt = nowIso(now);
  next.updatedAt = next.completedAt;
  next.reviewReturn = null;
  next.repairReturn = null;
  next.transferCandidate = null;
  return next;
}
