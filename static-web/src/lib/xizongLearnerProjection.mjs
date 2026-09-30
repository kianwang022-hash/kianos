import { buildXizongRevisionWitness } from './xizongRevisionWitness.mjs';
import { attachSourceVisualBundles as attachCanonicalVisualBundles } from './xizongSourceVisualAssets.mjs';
import { loadXizongSystem, loadXizongBlock } from './xizong.mjs';
import { buildXizongProductionBlock } from './xizongProductionProjection.mjs';
import { loadXizongLearningCues, learningCuesForBlock } from './xizongLearningCues.mjs';
import { loadXizongPathways, pathwaysForBlock, loadReviewedRetentionConnections } from './xizongPathways.mjs';
import { extensionAssetsForBlock } from './xizongExtensionAssets.mjs';
import { buildXizongLearnerObject, validateXizongLearnerObject } from './xizongLearnerObject.mjs';

function fail(code, detail = '') {
  throw new Error(`CURRENT_XIZONG_LEARNER_PROJECTION_${code}${detail ? `:${detail}` : ''}`);
}

/**
 * Single semantic composition entrypoint for learner-facing Block projection.
 *
 * All reviewed enrichment families are resolved here exactly once before a
 * renderer sees them. `enrichBlock` may add renderer-only fields (for example
 * pre-rendered HTML), but it must preserve Block/KP/LG identity.
 *
 * Source-visual URL attachment is deliberately injected by the Astro/Vite
 * caller. The semantic resolver itself stays runnable in plain Node so Current
 * validation does not depend on `import.meta.glob`.
 */
export function resolveXizongLearnerProjection(canonicalBlock, {
  enrichBlock = null,
  attachVisualBundles = attachCanonicalVisualBundles
} = {}) {
  if (!canonicalBlock?.systemId || !canonicalBlock?.blockId) fail('CANONICAL_BLOCK_REQUIRED');

  const system = loadXizongSystem(canonicalBlock.systemId);
  const productionBlock = buildXizongProductionBlock(canonicalBlock);
  const block = typeof enrichBlock === 'function' ? enrichBlock(productionBlock) : productionBlock;

  if (!block || block.blockId !== productionBlock.blockId || block.systemId !== productionBlock.systemId) {
    fail('ENRICHMENT_IDENTITY_DRIFT', canonicalBlock.blockId);
  }

  const cues = loadXizongLearningCues(system);
  const rawLearningCues = learningCuesForBlock(cues, block);
  const learningCues = {
    ...rawLearningCues,
    visuals: typeof attachVisualBundles === 'function'
      ? attachVisualBundles(rawLearningCues.visuals || [])
      : (rawLearningCues.visuals || [])
  };

  const currentPathways = loadXizongPathways(system);
  const pathways = pathwaysForBlock({
    connections: [...(currentPathways?.connections || []), ...loadReviewedRetentionConnections()]
  }, block.blockId);
  const extensionAssets = extensionAssetsForBlock(block);
  const learnerObject = buildXizongLearnerObject({
    block,
    learningCues,
    extensionAssets,
    pathways
  });
  learnerObject.revisionWitness = buildXizongRevisionWitness(learnerObject);
  const report = validateXizongLearnerObject(learnerObject);

  return {
    system,
    block,
    learningCues,
    pathways,
    extensionAssets,
    learnerObject,
    report
  };
}

// Identity-only Current requirements; never ship medical Core to a stage guard.
export function loadXizongSystemCompletionRequirements(system, blockIds = null) {
  return (system?.blocks || []).filter(ref => !blockIds || blockIds.includes(ref.blockId)).map((ref) => {
    const block = loadXizongBlock(system.systemId, ref.slug);
    const { learnerObject } = resolveXizongLearnerProjection(block);
    return {
      schema: 'kianos.xizong.learner_object.v1', objectType: 'BLOCK',
      sourceHash: learnerObject.sourceHash,
      sourceContact: learnerObject.sourceContact,
      revisionWitness: learnerObject.revisionWitness,
      identity: { blockId: learnerObject.identity.blockId },
      logicGroups: learnerObject.logicGroups.map((group) => ({
        identity: { logicGroupId: group.identity.logicGroupId },
        kpIds: group.kpIds,
        visualRequired: group.visualRequired === true,
        visualSourceState: String(group.visualSourceState || '')
      })),
      kps: learnerObject.kps.map((kp) => ({ identity: { kpId: kp.identity.kpId, ordinal: kp.identity.ordinal } })),
      evidenceVersion: [block.sourceHash, block.systemSourceHash, block.learningSupportSourceHash].join(':')
    };
  });
}
