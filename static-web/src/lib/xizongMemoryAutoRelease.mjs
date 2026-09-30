import { compatibleRevisionWitnesses, revisionRequiresAction, reconcileXizongRevision, revisionStatus, sourceContactCompatible, xizongSourceContactCovered, historicalXizongSourceContinuation } from './xizongContentRevision.mjs';
import {
  addMarkedFragment,
  normalizeXizongMemoryState,
  releaseBlockMemory,
  setPersonalPrompt
} from './xizongMemoryModel.mjs';
import {
  XIZONG_LEARNER_OBJECT_SCHEMA,
  buildXizongMemoryReleaseDescriptorFromLearnerObject
} from './xizongMemoryRelease.mjs';

export const XIZONG_MEMORY_AUTO_RELEASE_SCHEMA = 'kianos.xizong.memory_auto_release.v1';
export const XIZONG_BLOCK_STUDY_STORAGE_PREFIX = 'kianos-xizong-astro-v2:';
const VALID_RATINGS = new Set(['unknown', 'fuzzy', 'known', 'mastered']);

function text(value) {
  return String(value || '');
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function fail(code, detail = '') {
  throw new Error(`CURRENT_XIZONG_MEMORY_AUTO_RELEASE_${code}${detail ? `:${detail}` : ''}`);
}

function learnerKpIds(learnerObject) {
  if (learnerObject?.schema !== XIZONG_LEARNER_OBJECT_SCHEMA || learnerObject?.objectType !== 'BLOCK') {
    fail('LEARNER_OBJECT_SCHEMA_INVALID', text(learnerObject?.schema));
  }
  const blockId = text(learnerObject?.identity?.blockId);
  if (!blockId) fail('BLOCK_ID_MISSING');
  const ids = array(learnerObject?.kps).map((kp) => text(kp?.identity?.kpId));
  if (!ids.length || ids.some((id) => !id) || new Set(ids).size !== ids.length) {
    fail('LEARNER_KP_SET_INVALID', blockId);
  }
  return { blockId, ids };
}

export function xizongStudyStorageKey(objectId) {
  const id = text(objectId);
  if (!id) fail('OBJECT_ID_MISSING');
  return `${XIZONG_BLOCK_STUDY_STORAGE_PREFIX}${id}`;
}

export function inspectXizongBlockCompletion(learnerObject, studyStateInput) {
  const { blockId, ids } = learnerKpIds(learnerObject);
  const initialStudy = studyStateInput && typeof studyStateInput === 'object' && !Array.isArray(studyStateInput)
    ? studyStateInput
    : {};
  const study = learnerObject.revisionWitness ? reconcileXizongRevision(initialStudy, learnerObject.revisionWitness) : initialStudy;
  if (learnerObject.revisionWitness ? revisionRequiresAction(study) : learnerObject.sourceHash && revisionStatus(study, learnerObject.sourceHash).blocked) {
    return { complete:false, reason:'CONTENT_REVALIDATION_REQUIRED', blockId, kpIds:ids };
  }
  if (study.schema && study.schema !== 'kianos.xizong.block-state.v2') return { complete: false, reason: 'UNSUPPORTED_STUDY_SCHEMA', blockId, kpIds: ids };
  if (study.completed !== true) return { complete: false, reason: 'BLOCK_NOT_CONFIRMED', blockId, kpIds: ids };
  if (study.blockRecallDone !== true) return { complete: false, reason: 'BLOCK_RECALL_MISSING', blockId, kpIds: ids };
  const learned = study.learned && typeof study.learned === 'object' ? study.learned : {};
  const missingLearned = ids.filter((kpId) => learned[kpId] !== true);
  if (missingLearned.length) {
    return { complete: false, reason: 'KP_LEARN_INCOMPLETE', blockId, kpIds: ids, missingKpIds: missingLearned };
  }
  const ratings = study.ratings && typeof study.ratings === 'object' ? study.ratings : {};
  const missingRatings = ids.filter((kpId) => !VALID_RATINGS.has(text(ratings[kpId])));
  if (missingRatings.length) {
    return { complete: false, reason: 'KP_RECALL_INCOMPLETE', blockId, kpIds: ids, missingKpIds: missingRatings };
  }
  const visualGroups = array(learnerObject?.logicGroups).filter((group) =>
    group?.visualRequired === true && /GAP/i.test(text(group?.visualSourceState))
  );
  if (visualGroups.length) {
    const sourceHash = text(learnerObject?.sourceHash);
    const evidence = array(study?.sourceContactEvidence);
    const unresolved = visualGroups.filter((group) => {
      const groupId = text(group?.identity?.logicGroupId || group?.groupId);
      if (!groupId) return true;
      if (!/GAP.*NOT_MOUNTED/i.test(text(group?.visualSourceState))) return true;
      return !evidence.some((entry) =>
        sourceContactCompatible(study, entry, sourceHash)
        && array(entry?.visual_reviewed_lg_ids).map(text).includes(groupId)
      );
    });
    if (unresolved.length) {
      return {
        complete: false,
        reason: 'VISUAL_EVIDENCE_INCOMPLETE',
        blockId,
        kpIds: ids,
        missingVisualGroupIds: unresolved.map((group) => text(group?.identity?.logicGroupId || group?.groupId)).filter(Boolean)
      };
    }
  }
  const revision = learnerObject.revisionWitness ? revisionStatus(study, learnerObject.sourceHash) : null;
  // A legacy record without a Source baseline remains historical/UNKNOWN. It
  // does not acquire fresh contact or mastery merely by visiting this consumer.
  const historicalUnknown = historicalXizongSourceContinuation(study);
  if (!historicalUnknown && study.sourceContactDone === false && learnerObject.sourceContact?.logicGroupIsAutomaticSourceChunk !== true) {
    return { complete: false, reason: 'SOURCE_CONTACT_INCOMPLETE', blockId, kpIds: ids };
  }
  if (learnerObject.sourceContact && !historicalUnknown && !xizongSourceContactCovered(study, learnerObject)) {
    return { complete: false, reason: 'SOURCE_COVERAGE_INCOMPLETE', blockId, kpIds: ids };
  }
  return { complete: true, reason: 'COMPLETE', blockId, kpIds: ids,
    currentClaim: historicalUnknown ? 'UNKNOWN' : revision?.current_claim || 'UNKNOWN' };
}

function applyPrivateReleaseState(stateInput, descriptor, releasedAt = null) {
  let state = stateInput;
  for (const [kpId, prompt] of Object.entries(descriptor?.promptOverrides || {})) {
    if (!descriptor.coreCards.some((card) => card.kpId === kpId)) continue;
    state = setPersonalPrompt(state, kpId, prompt);
  }
  for (const mark of array(descriptor?.markedFragments)) {
    const cardId = text(mark?.cardId);
    if (!state.cards?.[cardId]) continue;
    state = addMarkedFragment(state, mark, mark?.createdAt || releasedAt || null);
  }
  return state;
}

export function xizongPersonalMarkedFragments(learnerObject, personal, objectId) {
  return array(learnerObject?.kps).flatMap((kp) => {
    const kpId = text(kp?.identity?.kpId);
    return array(personal?.kp?.[kpId]?.marks).filter((mark) =>
      ['PROMPT', 'CORE'].includes(mark?.surface) && ['important', 'weak'].includes(mark?.kind)
      && typeof mark?.text === 'string' && mark.text.trim()
      && Number.isFinite(Date.parse(mark?.createdAt))
    ).map((mark) => ({
      id: `personal:${encodeURIComponent(objectId)}:${encodeURIComponent(JSON.stringify([kpId, mark.surface, mark.kind, mark.text, mark.createdAt]))}`,
      cardId: `core:${kpId}`, kpId, surface: mark.surface, text: mark.text,
      createdAt: mark.createdAt, personalObjectId: objectId, personalKind: mark.kind
    }));
  });
}

// Personal marks remain owned by the Block personal state. Reconcile only this
// bridge's copies; never replay ratings, create review debt or remove Memory marks.
export function syncXizongPersonalMarks(stateInput, learnerObject, personal, objectId) {
  let state = normalizeXizongMemoryState(stateInput);
  const desired = xizongPersonalMarkedFragments(learnerObject, personal, objectId)
    .filter((mark) => state.cards[mark.cardId]?.family === 'CORE');
  const desiredIds = new Set(desired.map((mark) => mark.id));
  state.marks = { ...state.marks };
  for (const [id, mark] of Object.entries(state.marks)) {
    if (mark?.personalObjectId === objectId && !desiredIds.has(id)) delete state.marks[id];
  }
  for (const mark of desired) {
    if (state.marks[mark.id]) continue;
    state = addMarkedFragment(state, mark, mark.createdAt);
    state.marks[mark.id] = { ...state.marks[mark.id], personalObjectId: objectId, personalKind: mark.personalKind };
  }
  return state;
}

export function releaseCompletedBlockToMemory(memoryStateInput, learnerObject, studyState, options = {}) {
  const memory = normalizeXizongMemoryState(memoryStateInput);
  const { blockId } = learnerKpIds(learnerObject);
  const currentSourceHash = text(options?.sourceHash || learnerObject?.sourceHash);
  const previousRelease = memory.releasedBlocks?.[blockId] || null;

  // A released Memory library is a copy of Current canonical content, not a frozen
  // first-pass snapshot. Refresh stable card content, but let the per-card
  // semantic witness decide whether admitted evidence requires revalidation.
  if (previousRelease && ((currentSourceHash && previousRelease.sourceHash !== currentSourceHash)
    || JSON.stringify(previousRelease.revisionWitness || null) !== JSON.stringify(learnerObject.revisionWitness || null))) {
    const refreshDescriptor = buildXizongMemoryReleaseDescriptorFromLearnerObject(learnerObject, {
      sourceHash: currentSourceHash
    });
    const state = releaseBlockMemory(memory, refreshDescriptor, options?.refreshedAt || options?.releasedAt || null);
    return {
      schema: XIZONG_MEMORY_AUTO_RELEASE_SCHEMA,
      state,
      released: false,
      refreshed: true,
      reason: 'CONTENT_REVISION_REFRESHED',
      blockId,
      missingKpIds: []
    };
  }

  const completion = inspectXizongBlockCompletion(learnerObject, studyState);
  if (!completion.complete) {
    return {
      schema: XIZONG_MEMORY_AUTO_RELEASE_SCHEMA,
      state: memory,
      released: false,
      refreshed: false,
      reason: completion.reason,
      blockId: completion.blockId,
      missingKpIds: completion.missingKpIds || []
    };
  }

  // Same-revision re-entry remains idempotent: never replay first-pass weak signals
  // after later Memory evidence has stabilized.
  if (previousRelease) {
    return {
      schema: XIZONG_MEMORY_AUTO_RELEASE_SCHEMA,
      state: memory,
      released: false,
      refreshed: false,
      reason: 'ALREADY_RELEASED',
      blockId: completion.blockId,
      missingKpIds: []
    };
  }

  const descriptor = buildXizongMemoryReleaseDescriptorFromLearnerObject(learnerObject, {
    sourceHash: currentSourceHash,
    recallRatings: studyState?.ratings || {},
    promptOverrides: options?.promptOverrides || {},
    markedFragments: options?.markedFragments || []
  });
  const releasedAt = options?.releasedAt || null;
  let state = releaseBlockMemory(memory, descriptor, releasedAt);
  // Availability from historical Block completion is allowed; missing native
  // semantic baselines must not become a supported learner claim on first release.
  const revision = learnerObject.revisionWitness
    ? reconcileXizongRevision(studyState, learnerObject.revisionWitness).contentRevision : null;
  for (const card of [...descriptor.coreCards, ...descriptor.precisionCards]) {
    const reason = card.kpId ? revision?.pendingKp?.[card.kpId] : revision?.pendingGroup?.[card.logicGroupId];
    if (reason === 'UNCLASSIFIED_REVISION') state.cards[card.id].revisionReview = reason;
  }
  state = applyPrivateReleaseState(state, descriptor, releasedAt);

  return {
    schema: XIZONG_MEMORY_AUTO_RELEASE_SCHEMA,
    state,
    released: true,
    reason: 'BLOCK_COMPLETE_RELEASED',
    blockId: completion.blockId,
    coreCardIds: descriptor.coreCards.map((card) => card.id),
    precisionCardIds: descriptor.precisionCards.map((card) => card.id),
    attentionCardIds: descriptor.attentionSignals.map((signal) => signal.cardId)
  };
}

// One completion predicate for Memory, System release and learner Resume.
export function inspectXizongSystemCompletion(requirements, storage) {
  const rows = Array.isArray(requirements) ? requirements : [];
  if (!rows.length) return { complete: false, completed: 0, total: 0 };
  const seen = new Set();
  const checks = rows.map((row) => {
    const id = row?.identity?.blockId;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    try {
      const study = JSON.parse(storage.getItem(`kianos-xizong-astro-v2:xizong:${id}`) || 'null');
      return inspectXizongBlockCompletion(row, study).complete;
    } catch { return false; }
  });
  return { complete: checks.every(Boolean), completed: checks.filter(Boolean).length, total: rows.length };
}
export function hasXizongSystemRecall(storage, systemId, currentWitness = null) {
  try {
    const row = JSON.parse(storage.getItem(`kianos:xizong:system-recall:${systemId}:v1`) || 'null');
    const meta = JSON.parse(storage.getItem(`kianos:xizong:system-evidence-meta:${systemId}:v1`) || 'null');
    const witness = currentWitness || meta?.revisionWitness;
    if (row?.revisionWitness && witness && !compatibleRevisionWitnesses(row.revisionWitness, witness)) return false;
    return typeof row?.completedAt === 'string' && Number.isFinite(Date.parse(row.completedAt));
  } catch { return false; }
}
