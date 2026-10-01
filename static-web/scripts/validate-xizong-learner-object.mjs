import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
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
      const productionGroup = (productionBlock.logicGroups || []).find((row) => row.groupId === groupId) || null;
      const pre = learnerObject.slots?.logicGroupPrelearn?.[groupId] || {};
      const post = learnerObject.slots?.logicGroupPostlearn?.[groupId] || {};
      assert(sameIds(pre.visual, group.visual), `${groupId}:prelearn-visual-drift`);
      assert(sameIds(pre.connection, group.connection?.incoming), `${groupId}:prelearn-connection-drift`);
      assert(sameIds(post.precision, group.precision), `${groupId}:postlearn-precision-drift`);
      assert(sameIds(post.connection, group.connection?.outgoing), `${groupId}:postlearn-connection-drift`);
      assert(group.visualRequired === (productionGroup?.visualRequired === true), `${groupId}:visual-required-drift`);
      assert(group.visualSourceState === String(productionGroup?.visualSourceState || ''), `${groupId}:visual-source-state-drift`);
      if (['E', 'F'].includes(systemSummary.canonicalId) && productionGroup?.visualRequired === true) {
        assert((pre.visual || []).length > 0, `${groupId}:visual-required-missing-prelearn-cue`);
        if (/GAP/i.test(String(productionGroup?.visualSourceState || ''))) {
          assert((pre.visual || []).every((row) => !(row?.sourceVisualBundle?.assets || []).length), `${groupId}:visual-gap-fabricated-prelearn-image`);
          assert((pre.visual || []).some((row) => Boolean(row?.sourceLocator || row?.task)), `${groupId}:visual-gap-prelearn-without-locator-or-task`);
        }
      }
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

// SOURCE_COMPANION_OWNERSHIP_REGRESSION_BEGIN
// Execute the actual consumer selectors with structural fixtures only. The
// persisted/native cursor can legitimately lag the next Source unit's fallback.
{
  const bridge = readFileSync(new URL('../src/components/XizongLearnerObjectBridge.astro', import.meta.url), 'utf8');
  const between = (start, end) => {
    const from = bridge.indexOf(start);
    const to = bridge.indexOf(end, from);
    assert(from >= 0 && to > from, `source-companion-fixture-boundary:${start}`);
    return bridge.slice(from, to);
  };
  const sourceBranch = between("} else if (stage === 'source_contact') {", "} else if (stage === 'kp_learn') {");
  const selection = sourceBranch.match(/const kp = ([^;]+);/)?.[1];
  assert(selection, 'source-companion-aux-selection-missing');
  const selectors = between('      const visibleCompanionKp =', '      const recallAnswerVisible =')
    + between('      const sourceCompanionKps =', '      const groupCompanionIds =');
  const renderSource = between('        const persistedId = nativeKpId();', '        const group = activeGroup();');
  const rows = Array.from({ length: 8 }, (_, index) => ({ identity: {
    kpId: `fixture-kp${index + 1}`, ordinal: index + 1,
    logicGroupId: index < 4 ? 'SR4-LG01' : 'SR4-LG02'
  } }));
  const groups = [
    { identity: { logicGroupId: 'SR4-LG01' }, kpIds: rows.slice(0, 4).map(row => row.identity.kpId) },
    { identity: { logicGroupId: 'SR4-LG02' }, kpIds: rows.slice(4).map(row => row.identity.kpId) }
  ];
  // Accepted E/SR4 structural Source order: SU1 owns 1–4; SU2 owns 5–8.
  const natural = [
    { sourceUnitId: 'SR4-SU1', kpOrdinals: [1, 2, 3, 4] },
    { sourceUnitId: 'SR4-SU2', kpOrdinals: [5, 6, 7, 8] }
  ];
  const cases = [
    { name: 'initial-current-unit', segments: natural, unit: 'SR4-SU1', native: 2, expected: 2 },
    { name: 'accepted-SR4-next-unit', segments: natural, unit: 'SR4-SU2', native: 4, expected: 5 },
    { name: 'manual-next', segments: natural, unit: 'SR4-SU2', native: 6, index: 1, expected: 6 },
    { name: 'manual-previous', segments: natural, unit: 'SR4-SU2', native: 5, index: 0, expected: 5 },
    { name: 'noncontiguous-cross-LG', segments: [{sourceUnitId:'mixed', kpOrdinals:[2, 6]}], unit:'mixed', native:4, expected:2 },
    { name: 'contributing-LG', segments: [{sourceUnitId:'warmup', kpOrdinals:[], contributesToLogicGroupIds:['SR4-LG02']}], unit:'warmup', native:4, expected:5 },
    { name: 'empty-unit', segments: [{sourceUnitId:'empty', kpOrdinals:[]}], unit:'empty', native:4, expected:null },
    { name: 'whole-block', segments: [], native:4, expected:4 },
    { name: 'global-biochemistry', segments: [], native:6, expected:6 },
    { name: 'targeted-integration-return', segments: [natural[1]], unit:'SR4-SU2', native:2, expected:5 }
  ];
  for (const row of cases) {
    const nativeId = `fixture-kp${row.native}`;
    const context = {
      array: value => Array.isArray(value) ? value : [],
      text: value => String(value || ''),
      allKps: rows, groups, kpById: new Map(rows.map(kp => [kp.identity.kpId, kp])),
      sourceContactSegments: row.segments, sourceLearnIndex: row.index || 0,
      root: { dataset: {sourceSegmentId:row.unit || ''} },
      activeStage: () => 'source_contact', nativeKpId: () => nativeId,
      sourceCompanionHost: {},
      renderCompanionCard: (_host, kp) => { context.coreOrdinal = kp?.identity?.ordinal ?? null; }
    };
    runInNewContext(selectors + '\n' + renderSource
      + `\nglobalThis.auxOrdinal = (${selection})?.identity?.ordinal ?? null;`, context);
    assert(context.coreOrdinal === row.expected, `${row.name}:visible-owner-drift`);
    assert(context.auxOrdinal === context.coreOrdinal, `${row.name}:auxiliary-owner-drift`);
    assert(context.nativeKpId() === nativeId, `${row.name}:renderer-mutated-native-cursor`);
  }
  // Whole-LG Learn uses its existing group path; Recall has its own selector.
  assert(bridge.includes("const kp = visibleCompanionKp('kp_learn') || groupCompanionKp();"), 'whole-LG-selector-changed');
  assert(bridge.includes('const kpId = activeRecallKpId();'), 'recall-selector-changed');
}
// SOURCE_COMPANION_OWNERSHIP_REGRESSION_END

console.log(JSON.stringify({
  ok: true,
  schema: 'kianos.xizong.learner_object.v1',
  blocks: reports.length,
  kp: totalKp,
  kp_visual: totalKpVisual,
  kp_precision: totalKpPrecision,
  extension: totalExtensions
}, null, 2));
