import assertStrict from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { normalizeAcceptedLogicGroups } from '../src/lib/xizongAcceptedLearningOwner.mjs';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { loadXizongSemanticBlock, loadXizongSemanticSystem, XIZONG_SEMANTIC_ADAPTER_SCHEMA } from '../src/lib/xizongSemanticAdapter.mjs';

const fail = (message) => { throw new Error(`XIZONG_SEMANTIC_ADAPTER_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

const systemIds = [
  'circulation',
  'respiratory',
  'urinary',
  'digestive-metabolic-endocrine-tumor',
  'hematology-immunity-infection',
  'neuro-sensory-motor-orthopedics',
  'reproductive-breast',
  'remaining-clinical'
];

const systems = new Map();
for (const systemId of systemIds) {
  const system = loadXizongSemanticSystem(systemId);
  systems.set(systemId, system);
  assert(system.schema === XIZONG_SEMANTIC_ADAPTER_SCHEMA, `${systemId}:schema`);
  assert(system.blocks.length === system.identity.blockCount, `${systemId}:block-count`);
  assert(system.blocks.reduce((sum, block) => sum + block.kpCount, 0) === system.identity.kpCount, `${systemId}:kp-count`);
  assert(system.blocks.reduce((sum, block) => sum + block.logicGroups.length, 0) === system.identity.logicGroupCount, `${systemId}:logic-group-count`);
  assert(system.ttsxPolicy.status === 'UNBOUND_FAIL_CLOSED', `${systemId}:ttsx-not-fail-closed`);
  assert(system.ttsxPolicy.questionIds.length === 0, `${systemId}:ttsx-guessed-question-ids`);

  for (const block of system.blocks) {
    const seen = new Set();
    for (const group of block.logicGroups) {
      assert(group.goal && group.closure, `${block.blockId}:${group.groupId}:goal-closure`);
      for (const ordinal of group.kpOrdinals) {
        assert(!seen.has(ordinal), `${block.blockId}:kp${ordinal}:duplicate-membership`);
        seen.add(ordinal);
      }
    }
    assert(seen.size === block.kpCount, `${block.blockId}:coverage-count:${seen.size}/${block.kpCount}`);
    for (let ordinal = 1; ordinal <= block.kpCount; ordinal += 1) {
      assert(seen.has(ordinal), `${block.blockId}:kp${ordinal}:missing-membership`);
    }
    assert(block.ttsx.questionIds.length === 0, `${block.blockId}:ttsx-guessed-question-ids`);
  }
}

// A1: sparse reviewed Visual Gates remain support inside the learning path.
const { block: a1b1 } = loadXizongSemanticBlock('circulation', 'circulation-b01');
const a1b1Visuals = new Set(a1b1.visualGates.map((row) => row.cueId));
for (const cueId of ['a1-b01-lg01-visual', 'a1-b01-lg04-visual', 'a1-b01-lg06-visual']) {
  assert(a1b1Visuals.has(cueId), `a1-b01:visual-missing:${cueId}`);
}
assert(a1b1.visualGates.some((row) => row.sourceAssets.length > 0), 'a1-b01:source-visual-assets-not-attached');

// B: accepted whole-LG Source contact is preserved as an execution segment,
// without changing Logic-Group identity or medical Core.
const b = systems.get('digestive-metabolic-endocrine-tumor');
assert(b.identity.blockCount === 38, `b:block-count:${b.identity.blockCount}`);
assert(b.identity.kpCount === 600, `b:kp-count:${b.identity.kpCount}`);
assert(b.identity.logicGroupCount === 170, `b:logic-group-count:${b.identity.logicGroupCount}`);
const { block: bd1 } = loadXizongSemanticBlock('digestive-metabolic-endocrine-tumor', 'D1');
assert(bd1.sourceContact.mode === 'WHOLE_LOGIC_GROUP', `b-d1:source-contact:${bd1.sourceContact.mode}`);
assert(bd1.sourceContact.logicGroupIsAutomaticSourceChunk === true, 'b-d1:whole-lg-not-source-chunk');
assert(bd1.sourceContact.segments.length === bd1.logicGroups.length, `b-d1:segments:${bd1.sourceContact.segments.length}/${bd1.logicGroups.length}`);
assert(bd1.logicGroups[0].membershipMode === 'LEARNING_RANGE', `b-d1:membership-mode:${bd1.logicGroups[0].membershipMode}`);
assert(JSON.stringify(bd1.logicGroups[0].kpOrdinals) === JSON.stringify([1, 2, 3]), `b-d1:first-membership:${bd1.logicGroups[0].kpOrdinals.join(',')}`);

// C: explicit and intentionally non-contiguous memberships are accepted as-is.
// Logic Groups remain retrieval/closure units, not mandatory Source-contact chunks.
const c = systems.get('hematology-immunity-infection');
assert(c.identity.blockCount === 27, `c:block-count:${c.identity.blockCount}`);
assert(c.identity.kpCount === 423, `c:kp-count:${c.identity.kpCount}`);
assert(c.identity.logicGroupCount === 133, `c:logic-group-count:${c.identity.logicGroupCount}`);
assert(c.ownerPaths.learningShards.length === 5, `c:learning-shards:${c.ownerPaths.learningShards.length}`);
const { block: ch1 } = loadXizongSemanticBlock('hematology-immunity-infection', 'hematology-h01');
const ch1Last = ch1.logicGroups.find((row) => row.groupId === 'c-h01-lg06');
assert(ch1Last, 'c-h01:lg06-missing');
assert(ch1Last.membershipMode === 'EXPLICIT_ORDINAL_LIST', `c-h01:membership-mode:${ch1Last.membershipMode}`);
assert(JSON.stringify(ch1Last.kpOrdinals) === JSON.stringify([1, 12, 13]), `c-h01:noncontiguous-membership:${ch1Last.kpOrdinals.join(',')}`);
assert(ch1.sourceContact.mode === 'BLOCK_OR_CANONICAL_SOURCE_UNIT', `c-h01:source-contact:${ch1.sourceContact.mode}`);
assert(ch1.sourceContact.logicGroupIsAutomaticSourceChunk === false, 'c-h01:lg-promoted-to-source-chunk');
assert(ch1.sourceContact.logicGroupSourceReentryDefault === false, 'c-h01:source-reentry-default-not-false');
assert(ch1.sourceContact.segments.length === 0, `c-h01:invented-source-segments:${ch1.sourceContact.segments.length}`);
assert(ch1.retrievalPoints.slice(1).every((row) => row.sourceContactBefore === null && row.reopenSourceByDefault === false), 'c-h01:lg-retrieval-reopens-source');

// D/E/F share one accepted top-level Logic-Group + Content-realization owner shape.
const d = systems.get('neuro-sensory-motor-orthopedics');
const e = systems.get('reproductive-breast');
const f = systems.get('remaining-clinical');
assert(d.identity.blockCount === 27 && d.identity.kpCount === 356 && d.identity.logicGroupCount === 128, 'd:identity');
assert(e.identity.blockCount === 20 && e.identity.kpCount === 212 && e.identity.logicGroupCount === 67, 'e:identity');
assert(f.identity.blockCount === 9 && f.identity.kpCount === 121 && f.identity.logicGroupCount === 40, 'f:identity');
for (const system of [d, e, f]) {
  assert(system.ownerPaths.content, `${system.canonicalId}:content-owner-not-consumed`);
  assert(system.sourceContactPolicy.mode === 'MIXED_BY_BLOCK', `${system.canonicalId}:source-policy:${system.sourceContactPolicy.mode}`);
}
const { block: dn4 } = loadXizongSemanticBlock('neuro-sensory-motor-orthopedics', 'neuro-n04');
assert(dn4.sourceContact.mode === 'NATURAL_SOURCE_UNITS' && dn4.sourceContact.segments.length === 2, 'd-n4:natural-source-units');
assert(dn4.retrievalPoints.slice(0, 3).every((row) => row.sourceContactBefore === 'source:N4-SU1'), 'd-n4:source-unit-release');
const { block: dn11 } = loadXizongSemanticBlock('neuro-sensory-motor-orthopedics', 'neuro-n11');
assert(dn11.sourceContact.mode === 'INTEGRATION_PRIMARY' && dn11.sourceContact.requiresPrimarySourceContact === false, 'd-n11:integration-primary');
assert(dn11.sourceContact.integrationTargetedSourceReturns === false && dn11.sourceContact.segments.length === 0, 'd-n11:no-fabricated-targeted-source-units');
const { block: do4 } = loadXizongSemanticBlock('neuro-sensory-motor-orthopedics', 'orthopedics-o04');
const do4su2 = do4.sourceContact.segments.find((row) => row.sourceUnitId === 'O4-SU2');
assert(do4su2?.reactivateLogicGroupIds.includes('O4-LG01'), 'd-o4:reactivation-metadata-lost');
assert(do4.retrievalPoints.find((row) => row.logicGroupId === 'O4-LG01')?.sourceContactBefore === 'source:O4-SU1', 'd-o4:reactivation-illegally-remapped-release');
const { block: do11 } = loadXizongSemanticBlock('neuro-sensory-motor-orthopedics', 'orthopedics-o11');
assert(do11.sourceContact.segments.find((row) => row.sourceUnitId === 'O11-SU2')?.reactivationNote.includes('N11'), 'd-o11:reactivation-note-lost');
const { block: do5 } = loadXizongSemanticBlock('neuro-sensory-motor-orthopedics', 'orthopedics-o05');
const do5su3 = do5.sourceContact.segments.find((row) => row.sourceUnitId === 'O5-SU3');
assert(do5su3?.postUnitClosureLogicGroupIds.includes('O5-LG05'), 'd-o5:post-unit-closure-metadata-lost');
assert(do5.retrievalPoints.find((row) => row.logicGroupId === 'O5-LG05')?.sourceContactBefore === 'source:O5-SU3', 'd-o5:post-unit-closure-release-lost');

// E visual fail-closed truth must survive normalization. A prose-capable Core does not
// certify E10-LG03 while its accepted original visual remains missing.
const { block: e10 } = loadXizongSemanticBlock('reproductive-breast', 'E10');
const e10Lg03 = e10.logicGroups.find((row) => row.groupId === 'E10-LG03');
assert(e10Lg03?.visualRequired === true, 'e10-lg03:visual-required-lost');
assert(e10Lg03?.visualSourceState === 'VISUAL_SOURCE_GAP', `e10-lg03:visual-state:${e10Lg03?.visualSourceState}`);
assert(e10.sourceContact.segments.find((row) => row.sourceUnitId === 'E10-SU2')?.visualDebt.includes('E10-LG03'), 'e10-su2:visual-debt-lost');
const { block: esr2 } = loadXizongSemanticBlock('reproductive-breast', 'SR2');
assert(esr2.sourceContact.mode === 'WHOLE_BLOCK_SOURCE', 'e-sr2:whole-block-source');
assert(esr2.sourceContact.releaseLogicGroupIds.length === esr2.logicGroups.length, 'e-sr2:whole-block-release-coverage-lost');

// F8 carries three genuinely spatial visual-gated LGs. Missing original imagery stays
// explicit instead of becoming a synthetic visual or prose-only closure.
const { block: f8 } = loadXizongSemanticBlock('remaining-clinical', 'F8');
for (const groupId of ['F8-LG01', 'F8-LG04', 'F8-LG05']) {
  const group = f8.logicGroups.find((row) => row.groupId === groupId);
  assert(group?.visualRequired === true, `f8:${groupId}:visual-required-lost`);
  assert(/VISUAL_SOURCE_GAP/.test(group?.visualSourceState || ''), `f8:${groupId}:visual-gap-lost:${group?.visualSourceState}`);
}

// Every E/F visual-required LG must have an explicit learner cue. A real visual gap
// may expose a Source locator / bounded task, but may not silently gain a fabricated image asset.
for (const system of [e, f]) {
  for (const block of system.blocks) {
    for (const group of block.logicGroups.filter((row) => row.visualRequired === true)) {
      const cues = block.visualGates.filter((row) => row.anchor?.logicGroupId === group.groupId);
      assert(cues.length > 0, `${block.blockId}:${group.groupId}:visual-required-without-cue`);
      if (/GAP/i.test(group.visualSourceState || '')) {
        assert(cues.every((row) => (row.sourceAssets || []).length === 0), `${block.blockId}:${group.groupId}:visual-gap-fabricated-image`);
        assert(cues.some((row) => Boolean(row.sourceLocator || row.task)), `${block.blockId}:${group.groupId}:visual-gap-without-locator-or-task`);
      }
    }
  }
}

// F9 is not whole-Block integration release. Only LG01 is direct KianOS integration;
// LG02 and LG03/LG04 require the two accepted targeted Source returns.
const { block: f9 } = loadXizongSemanticBlock('remaining-clinical', 'F9');
assert(f9.sourceContact.mode === 'INTEGRATION_PRIMARY', `f9:mode:${f9.sourceContact.mode}`);
assert(f9.sourceContact.integrationTargetedSourceReturns === true, 'f9:targeted-source-return-flag');
assert(f9.sourceContact.externalRecall.length === 3, `f9:external-recall:${f9.sourceContact.externalRecall.length}`);
assert(JSON.stringify(f9.sourceContact.integrationReleaseLogicGroupIds) === JSON.stringify(['F9-LG01']), `f9:direct-release:${f9.sourceContact.integrationReleaseLogicGroupIds}`);
assert(JSON.stringify(f9.sourceContact.segments.map((row) => row.sourceUnitId)) === JSON.stringify(['F9-SU1', 'F9-SU2']), `f9:segments:${f9.sourceContact.segments.map((row) => row.sourceUnitId)}`);
assert(f9.retrievalPoints.find((row) => row.logicGroupId === 'F9-LG01')?.sourceContactBefore === null, 'f9-lg01:unexpected-source-return');
assert(f9.retrievalPoints.find((row) => row.logicGroupId === 'F9-LG02')?.sourceContactBefore === 'source:F9-SU1', 'f9-lg02:targeted-source-return-lost');
assert(f9.retrievalPoints.find((row) => row.logicGroupId === 'F9-LG03')?.sourceContactBefore === 'source:F9-SU2', 'f9-lg03:targeted-source-return-lost');
assert(f9.retrievalPoints.find((row) => row.logicGroupId === 'F9-LG04')?.sourceContactBefore === 'source:F9-SU2', 'f9-lg04:targeted-source-return-lost');
assert(f9.sourceContact.segments[0]?.sourceDebt.includes('complete laparoscopy complication list'), 'f9-su1:source-debt-lost');
const { block: f3 } = loadXizongSemanticBlock('remaining-clinical', 'F3');
assert(f3.sourceContact.releaseLogicGroupIds.length === f3.logicGroups.length, 'f3:whole-block-release-coverage-lost');
assert(f3.sourceContact.blockSourceDebt.includes('delayed-primary / secondary-closure taxonomy detail'), 'f3:block-source-debt-lost');
assert(f3.sourceContact.blockVisualDebt.includes('F3-LG02'), 'f3:block-visual-debt-lost');
const { block: f5 } = loadXizongSemanticBlock('remaining-clinical', 'F5');
assert(f5.sourceContact.blockSourceConflict.some((row) => row.includes('140/90') && row.includes('160/100')), 'f5:source-conflict-lost');
const { block: f6 } = loadXizongSemanticBlock('remaining-clinical', 'F6');
assert(f6.sourceContact.blockVerifiedSource.some((row) => row.includes('1–4 d') && row.includes('2–7 d')), 'f6:verified-source-lost');

// Every accepted D/E/F LG must have exactly one release path. contributes/reactivation
// metadata may support a source unit but must never become a second release edge.
for (const system of [d, e, f]) {
  for (const block of system.blocks) {
    const groupIds = block.logicGroups.map((row) => row.groupId);
    if (block.sourceContact.mode === 'NATURAL_SOURCE_UNITS') {
      const releaseIds = block.sourceContact.segments.flatMap((segment) => [
        ...(segment.logicGroupIds || []),
        ...(segment.postUnitClosureLogicGroupIds || [])
      ]);
      for (const groupId of groupIds) {
        assert(releaseIds.filter((id) => id === groupId).length === 1, `${block.blockId}:${groupId}:natural-release-count`);
      }
    }
    if (block.sourceContact.mode === 'WHOLE_BLOCK_SOURCE' && block.sourceContact.releaseLogicGroupIds.length) {
      assert(block.sourceContact.releaseLogicGroupIds.length === groupIds.length, `${block.blockId}:whole-release-count`);
      assert(groupIds.every((groupId) => block.sourceContact.releaseLogicGroupIds.includes(groupId)), `${block.blockId}:whole-release-coverage`);
    }
    if (block.sourceContact.mode === 'INTEGRATION_PRIMARY' && block.sourceContact.integrationTargetedSourceReturns) {
      const releaseIds = [
        ...block.sourceContact.integrationReleaseLogicGroupIds,
        ...block.sourceContact.segments.flatMap((segment) => segment.logicGroupIds || [])
      ];
      for (const groupId of groupIds) {
        assert(releaseIds.filter((id) => id === groupId).length === 1, `${block.blockId}:${groupId}:integration-release-count`);
      }
    }
  }
}

// The human/Chat content loader and the semantic consumer must resolve the
// same accepted group identity, label and ordered membership for every Block.
// This is an independent consumer comparison, not an extra content registry.
for (const system of systems.values()) {
  for (const semantic of system.blocks) {
    const canonical = loadXizongBlock(system.systemId, semantic.blockId);
    const byId = new Map(canonical.kpRecords.map(kp => [kp.kpId, kp]));
    const actual = canonical.logicGroups.map(group => ({
      id: group.groupId, label: group.label,
      members: group.kpIds.map(id => byId.get(id)?.ordinal)
    }));
    const expected = semantic.logicGroups.map(group => ({
      id: group.groupId, label: group.label, members: group.kpOrdinals
    }));
    assert(JSON.stringify(actual) === JSON.stringify(expected), `${semantic.blockId}:canonical-semantic-group-drift`);
  }
}

// Same-meaning field aliases and heterogeneous membership use one pure owner.
const fixture = {
  system: { logic_index: { 'test-b01': [{ id: 'g1', kp: [1, 2] }, { id: 'g2', kp: [3, 4] }] } },
  blockId: 'test-b01', kpCount: 4,
  blockSupport: { logic_groups: {
    g1: { goal: 'first job', closure: 'first close' },
    g2: { goal: 'second job', closure: 'second close' }
  } }
};
const resolveFixture = input => normalizeAcceptedLogicGroups(input);
assertStrict.deepEqual(resolveFixture(fixture).map(g=>g.kpOrdinals), [[1,2],[3,4]]);
const reordered = structuredClone(fixture);
reordered.blockSupport.learner_order=['g2','g1'];
reordered.blockSupport.logic_groups.g1.kp_members=[1,3];
reordered.blockSupport.logic_groups.g2.members=[4,2];
assertStrict.deepEqual(resolveFixture(reordered).map(g=>g.kpOrdinals), [[4,2],[1,3]]);
const equivalent=structuredClone(reordered);
equivalent.blockSupport.logic_groups.g1.members=['1','3'];
assertStrict.deepEqual(resolveFixture(equivalent),resolveFixture(reordered));
const ranged=structuredClone(fixture);
ranged.blockSupport.logic_groups.g1.kp_range=[1,2];
assertStrict.equal(resolveFixture(ranged)[0].membershipMode,'LEARNING_RANGE');
for (const [name, mutate] of [
  ['alias conflict', f=>{f.blockSupport.logic_groups.g1.kp_members=[1,2];f.blockSupport.logic_groups.g1.members=[2,1];}],
  ['range alias conflict', f=>{f.blockSupport.logic_groups.g1.kp=[1,2];f.blockSupport.logic_groups.g1.kp_range=[1,3];}],
  ['duplicate member', f=>{f.blockSupport.logic_groups.g1.members=[1,1];}],
  ['member out of range', f=>{f.blockSupport.logic_groups.g1.members=[1,5];}],
  ['group overlap', f=>{f.blockSupport.logic_groups.g2.members=[2,3,4];}],
  ['coverage gap', f=>{f.blockSupport.logic_groups.g1.members=[1];}],
  ['unknown group order', f=>{f.blockSupport.learner_order=['g1','missing'];}],
  ['duplicate group order', f=>{f.blockSupport.learner_order=['g1','g1'];}],
  ['missing closure', f=>{f.blockSupport.logic_groups.g1.closure='';}],
  ['invalid range', f=>{f.blockSupport.logic_groups.g1.kp=[2,1];}],
  ['duplicate system ID', f=>{f.system.logic_index['test-b01'][1].id='g1';}],
  ['invalid count', f=>{f.kpCount=0;}]
]) {
  const bad=structuredClone(fixture);mutate(bad);
  assertStrict.throws(()=>resolveFixture(bad),/CURRENT_XIZONG_ACCEPTED_LEARNING_/,name);
}

// Exercise the actual independent loaders with a valid future Learning edit.
// Only this child process sees the changed bytes; never edit real source/state.
const editResult=JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',`
  import fs from 'node:fs';
  const original=fs.readFileSync.bind(fs);
  fs.readFileSync=(file,...args)=>{
    const raw=original(file,...args);
    if (!String(file).endsWith('/a1-circulation-learning.json')) return raw;
    const data=JSON.parse(raw),b=data.blocks['circulation-b01'];
    b.learner_order=Object.keys(b.logic_groups).reverse();
    b.logic_groups['circulation-b01-lg01'].kp_members=[3,1,2];
    const text=JSON.stringify(data);
    return typeof raw==='string'?text:Buffer.from(text);
  };
  const {loadXizongBlock}=await import(${JSON.stringify(new URL('../src/lib/xizong.mjs',import.meta.url).href)});
  const {loadXizongSemanticBlock}=await import(${JSON.stringify(new URL('../src/lib/xizongSemanticAdapter.mjs',import.meta.url).href)});
  const c=loadXizongBlock('circulation','b01'),s=loadXizongSemanticBlock('circulation','circulation-b01').block;
  const raw=c.logicGroups.map(g=>({id:g.groupId,members:g.kpIds.map(id=>c.kpRecords.find(k=>k.kpId===id).ordinal)}));
  const semantic=s.logicGroups.map(g=>({id:g.groupId,members:g.kpOrdinals}));
  console.log(JSON.stringify({raw,semantic,canonicalOrder:c.kpRecords.map(k=>k.ordinal)}));
`],{encoding:'utf8',env:{...process.env,KIANOS_XIZONG_BUILD_CACHE:'0'}}));
assertStrict.deepEqual(editResult.raw,editResult.semantic,'valid accepted edit cannot diverge by read path');
assertStrict.equal(editResult.raw[0].id,'circulation-b01-lg07');
assertStrict.deepEqual(editResult.raw.at(-1).members,[3,1,2]);
assertStrict.deepEqual(editResult.canonicalOrder,Array.from({length:32},(_,i)=>i+1),'learner order never rewrites stable identity');

// The adapter must not manufacture learner progress, official-question mapping,
// or a duplicate question-taking surface.
for (const system of systems.values()) {
  for (const block of system.blocks) {
    const serialized = JSON.stringify(block);
    assert(!serialized.includes('questionResults'), `${block.blockId}:learner-question-state-leak`);
    assert(!serialized.includes('completedAt'), `${block.blockId}:learner-completion-state-leak`);
    assert(!serialized.includes('mastered'), `${block.blockId}:learner-mastery-state-leak`);
  }
}

console.log(`Xizong semantic adapter PASS: ${[...systems.values()].reduce((sum, system) => sum + system.blocks.length, 0)} blocks across A1/A2/A3/B/C/D/E/F`);
