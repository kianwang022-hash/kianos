import { marked } from 'marked';
import { projectBlockLearn, projectKpCore, projectVisualGate } from './xizongProjection.mjs';
import { isDeepStrictEqual } from 'node:util';
import { createHash } from 'node:crypto';
import { withXizongCompileContext, seedXizongCompile } from './xizongCompileContext.mjs';
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
export function resolveXizongLearnerProjection(canonicalBlock, options = {}) {
  return withXizongCompileContext(() => {
    if (!canonicalBlock?.kpRecords) canonicalBlock = loadXizongBlock(canonicalBlock?.systemId, canonicalBlock?.blockId);
    seedXizongCompile(`block:${canonicalBlock?.systemId}:${canonicalBlock?.blockId}`, canonicalBlock);
    seedXizongCompile(`block:${canonicalBlock?.systemId}:${canonicalBlock?.slug}`, canonicalBlock);
    return compileLearnerProjection(canonicalBlock, options);
  });
}
function compileLearnerProjection(canonicalBlock, {
  enrichBlock = null,
  attachVisualBundles = attachCanonicalVisualBundles
} = {}) {
  if (!canonicalBlock?.systemId || !canonicalBlock?.blockId) fail('CANONICAL_BLOCK_REQUIRED');

  const system = loadXizongSystem(canonicalBlock.systemId);
  const productionBlock = buildXizongProductionBlock(canonicalBlock);
  const productionSnapshot = structuredClone(productionBlock);
  const block = typeof enrichBlock === 'function' ? enrichBlock(productionBlock) : productionBlock;

  if (!block || block.blockId !== productionBlock.blockId || block.systemId !== productionBlock.systemId) {
    fail('ENRICHMENT_IDENTITY_DRIFT', canonicalBlock.blockId);
  }
  const semanticFields = value => {
    const { blockLearnHtml, visualGateHtml, ...semantic } = value;
    return { ...semantic, kpRecords: (semantic.kpRecords || []).map(({ detailHtml, ...kp }) => kp) };
  };
  if (!isDeepStrictEqual(semanticFields(block), semanticFields(productionSnapshot))) fail('ENRICHMENT_SEMANTIC_DRIFT', canonicalBlock.blockId);
  if (block.blockLearnHtml !== undefined && block.blockLearnHtml !== marked.parse(projectBlockLearn(productionSnapshot.blockLearnMarkdown), {gfm:true})) fail('ENRICHMENT_MODEL_HTML_DRIFT', canonicalBlock.blockId);
  const visualHtml = productionSnapshot.visualGateMarkdown ? marked.parse(projectVisualGate(productionSnapshot.visualGateMarkdown), {gfm:true}) : '';
  if (block.visualGateHtml !== undefined && block.visualGateHtml !== visualHtml) fail('ENRICHMENT_VISUAL_HTML_DRIFT', canonicalBlock.blockId);
  for (const [index, kp] of (block.kpRecords || []).entries()) {
    if (kp.detailHtml !== undefined && kp.detailHtml !== marked.parse(projectKpCore(productionSnapshot.kpRecords[index].detailMarkdown), {gfm:true})) fail('ENRICHMENT_CORE_HTML_DRIFT', kp.kpId);
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
  if (canonicalBlock.knowledge) learnerObject.preparedMemory = {
    blockId: block.blockId, sourceHash: learnerObject.sourceHash, identity: { ...learnerObject.identity },
    semanticOwner: canonicalBlock.knowledge ? canonicalBlock.sourcePath : null,
    items: (learningCues.precision || []).filter(row => row.prepared_memory_ref && row.answer_html).map(row => ({
      id: row.id, cue: row.cue, anchor: structuredClone(row.anchor), prepared_memory_ref: structuredClone(row.prepared_memory_ref), answer_html: row.answer_html,
      prepared_memory_owner: row.prepared_memory_owner
    }))
  };
  if (canonicalBlock.knowledge) {
    learnerObject.semanticOwnership = { sourcePath: canonicalBlock.sourcePath, mode: 'CANONICAL_BLOCK' };
    if (canonicalBlock.modelMarkdown) learnerObject.model = { markdown: canonicalBlock.modelMarkdown, sourcePath: canonicalBlock.sourcePath };
    learnerObject.presentation = {
      objectId: block.objectId, slug: block.slug, systemTitle: block.systemTitle, sourcePath: block.sourcePath,
      semanticAdapterSchema: block.semanticAdapterSchema, attention: block.attention, ttsx: block.ttsx,
      blockLearnHtml: block.blockLearnHtml || '', visualGateHtml: block.visualGateHtml || '',
      knowledgeReferenceHtml: marked.parse(canonicalBlock.knowledgeReferenceMarkdown.replace(/^(#{1,6}) (.+)$/gm, (_, hashes, title) => {
        const kp = title.match(/^KP(\d+)｜/);
        const id = kp ? `${block.blockId}-kp${kp[1].padStart(2,'0')}`
          : `${block.blockId}-reference-${createHash('sha256').update(title).digest('hex').slice(0,12)}`;
        const escaped = title.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        return `<h${hashes.length} id="${id}">${escaped}</h${hashes.length}>`;
      }), {gfm:true})
    };
  }
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
