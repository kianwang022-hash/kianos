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

    for (const kp of learnerObject.kps) {
      const kpId = kp.identity.kpId;
      const canonicalKp = (productionBlock.kpRecords || []).find((row) => row.kpId === kpId);
      assert(Boolean(canonicalKp), `${kpId}:canonical-kp-missing`);
      assert(kp.prompt?.canonical === (canonicalKp?.prompt || ''), `${kpId}:prompt-drift`);
      assert(kp.core?.markdown === (canonicalKp?.detailMarkdown || ''), `${kpId}:core-drift`);
      assert(kp.source?.locator === (canonicalKp?.sourceLocator || ''), `${kpId}:source-drift`);
      assert(kp.outline?.locator === (canonicalKp?.outlineLocator || ''), `${kpId}:outline-drift`);

      const learnSlot = learnerObject.slots?.kpLearnAux?.[kpId] || {};
      const recallContext = learnerObject.slots?.kpRecallContext?.[kpId] || {};
      const recallSlot = learnerObject.slots?.kpRecallPostReveal?.[kpId] || {};
      const connections = [...(kp.connection?.incoming || []), ...(kp.connection?.outgoing || [])];
      assert(sameIds(learnSlot.visual, kp.visual), `${kpId}:learn-visual-drift`);
      assert(sameIds(learnSlot.precision, kp.precision), `${kpId}:learn-precision-drift`);
      assert(sameIds(learnSlot.extension, kp.extension), `${kpId}:learn-extension-drift`);
      assert(sameIds(learnSlot.connection, connections), `${kpId}:learn-connection-drift`);
      assert(sameIds(recallContext.visual, kp.visual), `${kpId}:recall-context-visual-drift`);
      assert(sameIds(recallContext.precision, kp.precision), `${kpId}:recall-context-precision-drift`);
      assert(sameIds(recallContext.extension, kp.extension), `${kpId}:recall-context-extension-drift`);
      assert(sameIds(recallContext.connection, connections), `${kpId}:recall-context-connection-drift`);
      assert(sameIds(recallSlot.visual, kp.visual), `${kpId}:recall-legacy-visual-drift`);
      assert(sameIds(recallSlot.precision, kp.precision), `${kpId}:recall-legacy-precision-drift`);
      assert(sameIds(recallSlot.extension, kp.extension), `${kpId}:recall-legacy-extension-drift`);
      assert(sameIds(recallSlot.connection, connections), `${kpId}:recall-legacy-connection-drift`);
      assert(recallSlot.core?.markdown === kp.core.markdown, `${kpId}:recall-core-drift`);
    }

    const expectedKpVisualIds = (resolved.learningCues.visuals || [])
      .filter((row) => row?.anchor?.kp_id)
      .map((row) => row.id)
      .sort();
    const actualKpVisualIds = learnerObject.kps.flatMap((kp) => kp.visual.map((row) => row.id)).sort();
    assert(JSON.stringify(expectedKpVisualIds) === JSON.stringify(actualKpVisualIds), `${productionBlock.blockId}:kp-visual-loss`);

    for (const group of learnerObject.logicGroups) {
      const groupId = group.identity.logicGroupId;
      const pre = learnerObject.slots?.logicGroupPrelearn?.[groupId] || {};
      const post = learnerObject.slots?.logicGroupPostlearn?.[groupId] || {};
      assert(sameIds(pre.visual, group.visual), `${groupId}:prelearn-visual-drift`);
      assert(sameIds(pre.connection, group.connection?.incoming), `${groupId}:prelearn-connection-drift`);
      assert(sameIds(post.precision, group.precision), `${groupId}:postlearn-precision-drift`);
      assert(sameIds(post.connection, group.connection?.outgoing), `${groupId}:postlearn-connection-drift`);
    }

    reports.push(report);
    totalKp += report.kpCount;
    totalKpVisual += report.kpVisualCount;
    totalKpPrecision += report.kpPrecisionCount;
    totalExtensions += report.extensionCount;
  }
}

// Adversarial: KP Recall front may keep title/context refs, but Core must stay hidden.
{
  const sample = {
    schema: 'kianos.xizong.learner_object.v1',
    objectType: 'BLOCK',
    identity: { blockId: 'fixture' },
    logicGroups: [],
    kps: [{
      identity: { kpId: 'fixture-kp01', title: 'Fixture title' },
      core: { markdown: 'answer', html: '' },
      precision: [], visual: [], extension: [], connection: { incoming: [], outgoing: [] },
      recall: {
        front: { identity: { kpId: 'fixture-kp01', title: 'Fixture title' }, prompt: { canonical: 'prompt' }, core: 'leak' },
        contextRefs: [],
        postRevealRefs: ['core']
      }
    }]
  };
  let rejected = false;
  try { validateXizongLearnerObject(sample); } catch { rejected = true; }
  assert(rejected, 'adversarial-recall-front-core-leak-not-caught');
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
