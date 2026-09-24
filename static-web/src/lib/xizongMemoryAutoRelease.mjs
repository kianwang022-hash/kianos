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
  const study = studyStateInput && typeof studyStateInput === 'object' && !Array.isArray(studyStateInput)
    ? studyStateInput
    : {};
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
  return { complete: true, reason: 'COMPLETE', blockId, kpIds: ids };
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

export function releaseCompletedBlockToMemory(memoryStateInput, learnerObject, studyState, options = {}) {
  const memory = normalizeXizongMemoryState(memoryStateInput);
  const { blockId } = learnerKpIds(learnerObject);
  const currentSourceHash = text(options?.sourceHash || learnerObject?.sourceHash);
  const previousRelease = memory.releasedBlocks?.[blockId] || null;

  // A released Memory library is a copy of Current canonical content, not a frozen
  // first-pass snapshot. If the owning Block revision changes, refresh the stable
  // card identities immediately so old evidence stays historical while retention
  // can surface CONTENT_CHANGED_AFTER_LAST_EVIDENCE. Do this independently of
  // current Block completion: the evidence guard may already have archived/reset
  // first-pass study state for the new revision.
  if (previousRelease?.sourceHash && currentSourceHash && previousRelease.sourceHash !== currentSourceHash) {
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
      const rawMeta = storage.getItem(`kianos-xizong-evidence-meta-v1:xizong:${id}`);
      if (rawMeta !== null) {
        const meta = JSON.parse(rawMeta);
        if (!meta || typeof meta.version !== 'string' || meta.version !== row.evidenceVersion) return false;
      }
      return inspectXizongBlockCompletion(row, study).complete;
    } catch { return false; }
  });
  return { complete: checks.every(Boolean), completed: checks.filter(Boolean).length, total: rows.length };
}
export function hasXizongSystemRecall(storage, systemId) {
  try {
    const row = JSON.parse(storage.getItem(`kianos:xizong:system-recall:${systemId}:v1`) || 'null');
    return typeof row?.completedAt === 'string' && Number.isFinite(Date.parse(row.completedAt));
  } catch { return false; }
}
