import { loadXizongSystem } from './xizong.mjs';
import { buildXizongProductionBlock } from './xizongProductionProjection.mjs';
import { loadXizongLearningCues, learningCuesForBlock } from './xizongLearningCues.mjs';
import { attachSourceVisualBundles } from './xizongSourceVisualAssets.mjs';
import { loadXizongPathways, pathwaysForBlock } from './xizongPathways.mjs';
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
 */
export function resolveXizongLearnerProjection(canonicalBlock, { enrichBlock = null } = {}) {
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
    visuals: attachSourceVisualBundles(rawLearningCues.visuals || [])
  };

  const pathways = pathwaysForBlock(loadXizongPathways(system), block.blockId);
  const extensionAssets = extensionAssetsForBlock(block);
  const learnerObject = buildXizongLearnerObject({
    block,
    learningCues,
    extensionAssets,
    pathways
  });
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
