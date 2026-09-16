import { listProjectableXizongSystems, loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';
import { buildXizongProductionBlock } from '../src/lib/xizongProductionProjection.mjs';
import { loadXizongLearningCues, learningCuesForBlock } from '../src/lib/xizongLearningCues.mjs';
import { loadXizongPathways, pathwaysForBlock } from '../src/lib/xizongPathways.mjs';
import { extensionAssetsForBlock } from '../src/lib/xizongExtensionAssets.mjs';
import { buildXizongLearnerObject, validateXizongLearnerObject } from '../src/lib/xizongLearnerObject.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(`CURRENT_XIZONG_LEARNER_OBJECT_VALIDATION:${message}`);
}

const reports = [];
let totalKp = 0;
let totalKpVisual = 0;
let totalKpPrecision = 0;
let totalExtensions = 0;

for (const systemSummary of listProjectableXizongSystems()) {
  const system = loadXizongSystem(systemSummary.systemId);
  const pathways = loadXizongPathways(system);
  const cues = loadXizongLearningCues(system);

  for (const blockSummary of system.blocks || []) {
    const canonicalBlock = loadXizongBlock(system.systemId, blockSummary.blockId);
    const productionBlock = buildXizongProductionBlock(canonicalBlock);
    const learningCues = learningCuesForBlock(cues, productionBlock);
    const blockPathways = pathwaysForBlock(pathways, productionBlock.blockId);
    const extensionAssets = extensionAssetsForBlock(productionBlock);
    const learnerObject = buildXizongLearnerObject({
      block: productionBlock,
      learningCues,
      extensionAssets,
      pathways: blockPathways
    });
    const report = validateXizongLearnerObject(learnerObject);

    assert(report.kpCount === (productionBlock.kpRecords || []).length, `${productionBlock.blockId}:kp-count`);
    assert(report.logicGroupCount === (productionBlock.logicGroups || []).length, `${productionBlock.blockId}:group-count`);
    assert(learnerObject.kps.every((kp) => kp.core.markdown === (productionBlock.kpRecords.find((row) => row.kpId === kp.identity.kpId)?.detailMarkdown || '')), `${productionBlock.blockId}:core-drift`);

    const expectedKpVisualIds = (learningCues.visuals || [])
      .filter((row) => row?.anchor?.kp_id)
      .map((row) => row.id)
      .sort();
    const actualKpVisualIds = learnerObject.kps.flatMap((kp) => kp.visual.map((row) => row.id)).sort();
    assert(JSON.stringify(expectedKpVisualIds) === JSON.stringify(actualKpVisualIds), `${productionBlock.blockId}:kp-visual-loss`);

    reports.push(report);
    totalKp += report.kpCount;
    totalKpVisual += report.kpVisualCount;
    totalKpPrecision += report.kpPrecisionCount;
    totalExtensions += report.extensionCount;
  }
}

// Small adversarial checks: clean Recall front and duplicate KP protection must fail closed.
{
  const sample = {
    schema: 'kianos.xizong.learner_object.v1',
    objectType: 'BLOCK',
    identity: { blockId: 'fixture' },
    logicGroups: [],
    kps: [{
      identity: { kpId: 'fixture-kp01' },
      core: { markdown: 'answer', html: '' },
      precision: [], visual: [], extension: [], connection: { incoming: [], outgoing: [] },
      recall: { front: { identity: { kpId: 'fixture-kp01' }, prompt: { canonical: 'prompt' }, core: 'leak' }, postRevealRefs: ['core'] }
    }]
  };
  let leaked = false;
  try { validateXizongLearnerObject(sample); } catch { leaked = true; }
  assert(leaked, 'adversarial-recall-front-leak-not-caught');
}

console.log(JSON.stringify({
  ok: true,
  schema: 'kianos.xizong.learner_object.v1',
  blocks: reports.length,
  kp: totalKp,
  kp_visual: totalKpVisual,
  kp_precision: totalKpPrecision,
  extension: totalExtensions
}, null, 2));
