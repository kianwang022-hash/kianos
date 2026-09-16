import { listProjectableXizongSystems, loadXizongBlock } from '../src/lib/xizong.mjs';
import { learningCuesForBlock } from '../src/lib/xizongLearningCues.mjs';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';
import { validateXizongLearnerObject } from '../src/lib/xizongLearnerObject.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(`CURRENT_XIZONG_LEARNER_OBJECT_VALIDATION:${message}`);
}

function ids(rows) {
  return (Array.isArray(rows) ? rows : []).map((row) => row?.id).filter(Boolean).sort();
}

function sameIds(left, right) {
  return JSON.stringify(ids(left)) === JSON.stringify(ids(right));
}

const reports = [];
let totalKp = 0;
let totalKpVisual = 0;
let totalKpPrecision = 0;
let totalExtensions = 0;

for (const systemSummary of listProjectableXizongSystems()) {
  for (const blockSummary of systemSummary.blocks || []) {
    const canonicalBlock = loadXizongBlock(systemSummary.systemId, blockSummary.blockId);
    const resolved = resolveXizongLearnerProjection(canonicalBlock);
    const productionBlock = resolved.block;
    const learnerObject = resolved.learnerObject;
    const report = resolved.report;

    assert(report.kpCount === (productionBlock.kpRecords || []).length, `${productionBlock.blockId}:kp-count`);
    assert(report.logicGroupCount === (productionBlock.logicGroups || []).length, `${productionBlock.blockId}:group-count`);
    assert(learnerObject.kps.every((kp) => kp.core.markdown === (productionBlock.kpRecords.find((row) => row.kpId === kp.identity.kpId)?.detailMarkdown || '')), `${productionBlock.blockId}:core-drift`);

    const expectedKpVisualIds = (resolved.learningCues.visuals || [])
      .filter((row) => row?.anchor?.kp_id)
      .map((row) => row.id)
      .sort();
    const actualKpVisualIds = learnerObject.kps.flatMap((kp) => kp.visual.map((row) => row.id)).sort();
    assert(JSON.stringify(expectedKpVisualIds) === JSON.stringify(actualKpVisualIds), `${productionBlock.blockId}:kp-visual-loss`);

    for (const kp of learnerObject.kps) {
      const kpId = kp.identity.kpId;
      const learnSlot = learnerObject.slots?.kpLearnAux?.[kpId] || {};
      const recallSlot = learnerObject.slots?.kpRecallPostReveal?.[kpId] || {};
      assert(sameIds(learnSlot.visual, kp.visual), `${kpId}:learn-visual-drift`);
      assert(sameIds(learnSlot.precision, kp.precision), `${kpId}:learn-precision-drift`);
      assert(sameIds(learnSlot.extension, kp.extension), `${kpId}:learn-extension-drift`);
      assert(sameIds(recallSlot.visual, kp.visual), `${kpId}:recall-visual-drift`);
      assert(sameIds(recallSlot.precision, kp.precision), `${kpId}:recall-precision-drift`);
      assert(sameIds(recallSlot.extension, kp.extension), `${kpId}:recall-extension-drift`);
      assert(recallSlot.core?.markdown === kp.core.markdown, `${kpId}:recall-core-drift`);
    }

    for (const group of learnerObject.logicGroups) {
      const groupId = group.identity.logicGroupId;
      const pre = learnerObject.slots?.logicGroupPrelearn?.[groupId] || {};
      const post = learnerObject.slots?.logicGroupPostlearn?.[groupId] || {};
      assert(sameIds(pre.visual, group.visual), `${groupId}:prelearn-visual-drift`);
      assert(sameIds(post.precision, group.precision), `${groupId}:postlearn-precision-drift`);
    }

    reports.push(report);
    totalKp += report.kpCount;
    totalKpVisual += report.kpVisualCount;
    totalKpPrecision += report.kpPrecisionCount;
    totalExtensions += report.extensionCount;
  }
}

// Adversarial: Recall front must stay answer-clean.
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
  let rejected = false;
  try { validateXizongLearnerObject(sample); } catch { rejected = true; }
  assert(rejected, 'adversarial-recall-front-leak-not-caught');
}

// Adversarial: a cue cannot name a real KP and a real but wrong Logic Group.
{
  const block = {
    blockId: 'fixture-b01',
    kpRecords: [{ kpId: 'fixture-b01-kp01' }],
    logicGroups: [
      { groupId: 'fixture-b01-lg01', kpIds: ['fixture-b01-kp01'] },
      { groupId: 'fixture-b01-lg02', kpIds: [] }
    ]
  };
  const cues = {
    sourcePath: 'fixture',
    precisionIndex: [{
      id: 'fixture-cue',
      anchor: {
        block_id: 'fixture-b01',
        kp_id: 'fixture-b01-kp01',
        logic_group_id: 'fixture-b01-lg02'
      }
    }],
    visualBindings: []
  };
  let rejected = false;
  try { learningCuesForBlock(cues, block); } catch { rejected = true; }
  assert(rejected, 'adversarial-cross-owner-anchor-not-caught');
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
