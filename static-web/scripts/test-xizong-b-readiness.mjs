import assert from 'node:assert/strict';
import { writeBTestProof } from './xizong-b-test-proof.mjs';
import fs from 'node:fs';
import vm from 'node:vm';
import * as revision from '../src/lib/xizongContentRevision.mjs';
import { inspectXizongBlockCompletion } from '../src/lib/xizongMemoryAutoRelease.mjs';
process.env.XIZONG_B_POSTCHAT_HARNESS_ONLY = '1';
const { createHarness, nativeBlocks, noContact, rate, confirmModels } = await import('./test-xizong-b-post-chat-recall.mjs');
const clone = value => JSON.parse(JSON.stringify(value));
const preintegration = JSON.parse(fs.readFileSync(new URL('./fixtures/xizong-b-readiness-preintegration.json', import.meta.url)));
const rawLearning = JSON.parse(fs.readFileSync(new URL('../../content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning.json', import.meta.url)));
assert.equal(preintegration.blocks.filter(row => row.requires.length).length, 35);
for (const row of preintegration.blocks) {
  assert.deepEqual(row.hardReadinessBlockIds, []); assert.deepEqual(row.requiredPriorBlockIds, []);
  assert.deepEqual(row.requires, rawLearning.blocks[row.blockId].readiness.requires, 'owner raw cognitive requirements stay unchanged');
  const current = nativeBlocks.find(block => block.blockId === row.blockId).sourceContact;
  const accounted = [...current.requiredModelReadiness.requirements.map(item => item.sourceText),
    ...current.independentReadinessGates.filter(gate => gate.sourceField === 'requires').map(gate => gate.sourceText)];
  assert.deepEqual([...accounted].sort(), [...row.requires].sort(), 'every formerly dropped raw requires item now executes as model readiness or explicit independent scope');
}


for (const id of ['D2', 'M2', 'G1', 'D6', 'D12', 'D13', 'D16', 'D17']) {
  const block = nativeBlocks.find(row => row.blockId === id);
  const requirement = block.sourceContact.requiredModelReadiness;
  assert.ok(requirement.requirements.length);
  assert.deepEqual(block.sourceContact.hardReadinessBlockIds, []);
  assert.deepEqual(block.sourceContact.requiredPriorBlockIds, []);
  const priorKey = 'kianos-xizong-astro-v2:xizong:D1';
  const priorText = JSON.stringify({ completed: true, blockRecallDone: true, learned: { 'digestive-d1-kp01': true }, ratings: { 'digestive-d1-kp01': 'known' }, notes: ['preserve prior exact bytes'], sourceContactEvidence: [{ segment_id: 'historical' }] });
  const h = await createHarness(block, { values: new Map([[priorKey, priorText], ['unrelated-history', 'untouched']]) });
  const before = h.state(), evidence = h.evidence();
  assert.equal(h.modelPanel.hidden, false);
  for (const row of requirement.requirements) assert.ok(h.modelList.textContent.includes(row.modelPrompt));
  h.entry.click(); assert.equal(h.state().stage, 'block_learn'); assert.equal(h.state().requiredModelContinuation, undefined);
  assert.equal(h.values.get(priorKey), priorText, 'prior completion never auto-confirms cognition'); noContact(h);
  confirmModels(h);
  const confirmed = h.state();
  assert.deepEqual(confirmed.requiredModelContinuation.targetBlockId, id);
  assert.equal(confirmed.requiredModelContinuation.requirementsWitness, requirement.witness);
  assert.equal(confirmed.requiredModelContinuation.confirmation, 'USER_CURRENT_TARGET_MODELS_UNDERSTOOD');
  assert.ok(Number.isFinite(Date.parse(confirmed.requiredModelContinuation.confirmedAt)));
  assert.deepEqual(h.evidence(), evidence); assert.equal(h.values.get(priorKey), priorText); assert.equal(h.values.get('unrelated-history'), 'untouched');
  assert.equal(revision.studyHasEvidence(confirmed), false); noContact(h);
  h.entry.click(); assert.equal(h.state().stage, 'kp_recall');
  const saved = clone(h.state());
  const resumed = await createHarness(block, { values: h.values }); assert.equal(resumed.state().stage, 'kp_recall'); assert.equal(resumed.modelPanel.hidden, true); noContact(resumed);
  for (const mutation of [
    row => { delete row.requiredModelContinuation; },
    row => { row.requiredModelContinuation.requirementsWitness = 'stale'; },
    row => { row.requiredModelContinuation.targetBlockId = 'D24'; },
    row => { row.requiredModelContinuation.confirmation = 'CHAT_SAYS_UNDERSTOOD'; },
    row => { row.requiredModelContinuation.confirmedAt = 'not-a-date'; }
  ]) {
    const stale = clone(saved); mutation(stale); const denied = await createHarness(block, { saved: stale });
    assert.equal(denied.state().stage, 'block_learn'); denied.entry.click(); assert.equal(denied.state().stage, 'block_learn');
    rate(denied, denied.state().kpIndex); assert.deepEqual(denied.state().ratings, {}); noContact(denied);
  }
  const failed = await createHarness(block); const beforeFailure = failed.state(), beforeEvidence = failed.evidence();
  failed.fail(failed.stateKey); confirmModels(failed); failed.entry.click();
  assert.deepEqual(failed.state(), beforeFailure); assert.deepEqual(failed.evidence(), beforeEvidence); assert.equal(failed.root.inert, true);
  const absent = clone(block); delete absent.sourceContact.requiredModelReadiness;
  const missing = await createHarness(absent); missing.entry.click(); assert.equal(missing.state().stage, 'block_learn');
  missing.confirmSource?.click(); noContact(missing);
  if (requirement.sourceEncounterBeforeReadiness) {
    const source = await createHarness(block); source.lectureEntry.click(); assert.equal(source.state().stage, 'source_contact', 'global Source encounter stays non-gating');
    assert.equal(source.state().requiredModelContinuation, undefined); noContact(source);
    source.sourceEntry.click(); assert.equal(source.state().stage, 'source_contact'); noContact(source);
  }
  assert.deepEqual(before.learned, {});
}

// Exact independent scopes survive cognitive confirmation and old full history.
function oldCompleted(block) {
  const learner = block.learnerObject, ids = block.kpRecords.map(kp => kp.kpId);
  const state = { ...revision.reconcileXizongRevision({}, learner.revisionWitness), sourceHash: block.sourceHash,
    stage: 'kp_recall', kpIndex: 0, groupIndex: 0, sourceContactDone: true, blockRecallDone: true, completed: true,
    learned: Object.fromEntries(ids.map(id => [id, true])), ratings: Object.fromEntries(ids.map(id => [id, 'known'])),
    sourceContactEvidence: [{ segment_id: 'block-cumulative:historical-fixture', kp_ids: ids, source_hash: block.sourceHash,
      contact_witness: learner.revisionWitness.contact, coverage_kind: 'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION', visual_reviewed_lg_ids: block.logicGroups.map(group => group.groupId) }] };
  return state;
}
for (const id of ['D11', 'D15', 'D18', 'D19', 'D20', 'D21']) {
  const block = nativeBlocks.find(row => row.blockId === id); const old = oldCompleted(block), before = JSON.stringify(old);
  assert.equal(inspectXizongBlockCompletion(block.learnerObject, old).complete, false);
  assert.equal(inspectXizongBlockCompletion(block.learnerObject, old).reason, 'INDEPENDENT_READINESS_UNRESOLVED');
  assert.equal(JSON.stringify(old), before, 'current guard never relabels historical completion');
  const h = await createHarness(block, { saved: old }); confirmModels(h);
  const gates = block.sourceContact.independentReadinessGates;
  for (let index = 0; index < block.logicGroups.length; index += 1) {
    const group = block.logicGroups[index]; h.groupButtons[index].click(); h.entry.click();
    if (gates.some(gate => gate.logicGroupIds.includes(group.groupId))) {
      assert.equal(h.state().stage, 'logic_group'); const ratings = clone(h.state().ratings);
      const kpIndex = block.kpRecords.findIndex(kp => kp.kpId === group.kpIds[0]);
      h.cards[kpIndex].reveal.click(); assert.equal(h.cards[kpIndex].answer.hidden, true);
      h.cards[kpIndex].buttons.known.click(); assert.deepEqual(h.state().ratings, ratings);
      h.recallReveal.click(); h.recallComplete.click(); h.complete.click();
      assert.equal(h.dispatched.filter(event => event.type === 'kianos:xizong-block-complete').length, 0);
    } else assert.equal(h.state().stage, 'kp_recall', 'mixed-Block unrelated LG remains accessible');
  }
  assert.equal(h.state().completed, true); assert.equal(h.state().blockRecallDone, true);
  assert.deepEqual(h.state().ratings, old.ratings); assert.deepEqual(h.state().sourceContactEvidence, old.sourceContactEvidence);
  if (id === 'D19') {
    h.groupButtons[6].click();
    assert.equal(h.heldReferences[0].node.hidden, false);
    assert.ok(h.heldReferences[0].node.textContent.includes('HOLD'));
    const kp = block.kpRecords.find(kp => kp.kpId === 'digestive-d19-kp18');
    assert.ok(h.heldReferences[0].reference.textContent.includes(kp.title)); assert.ok(h.heldReferences[0].reference.textContent.includes(kp.prompt));
    h.groupButtons[4].click(); assert.equal(h.heldReferences[0].node.hidden, true, 'AOSC does not inherit hemobilia hold');
  }
}
const d1 = nativeBlocks.find(row => row.blockId === 'D1');
assert.equal(inspectXizongBlockCompletion(d1.learnerObject, oldCompleted(d1)).complete, true, 'ungated current completion still works');

// Execute the actual held-reference label expressions; native facts stay intact.
const interaction = fs.readFileSync(new URL('../src/components/XizongKpLearnInteraction.astro', import.meta.url), 'utf8');
const goalLabel = interaction.match(/goal.innerHTML = ([^\n]+);/)[1];
const closureLabel = interaction.match(/closure.innerHTML = ([^\n]+);/)[1];
assert.match(vm.runInNewContext(goalLabel, { sourceReference: true }), /Current 参考目标 · HOLD/);
assert.match(vm.runInNewContext(closureLabel, { sourceReference: true }), /HOLD，不认领完成/);
assert.equal(vm.runInNewContext(goalLabel, { sourceReference: false }), '<b>这一节解决</b><span></span>');
assert.equal(vm.runInNewContext(closureLabel, { sourceReference: false }), '<b>学完能做到</b><span></span>');
const historyLabel = interaction.match(/state.textContent = (study.ratings\?\.\[id\][\s\S]*?);/)[1];
for (const sourceReference of [false, true]) {
  assert.equal(vm.runInNewContext(historyLabel, { sourceReference, study: { ratings: { kp: 'known' } }, id: 'kp', cardKpId: 'kp' }), sourceReference ? '历史回忆' : '已回忆');
}

// The actual shared packet function carries the precise repair request. Merely
// exporting it neither confirms readiness nor creates a new repair queue.
const enhancer = fs.readFileSync(new URL('../src/components/XizongStudyEnhancer.astro', import.meta.url), 'utf8');
const start = enhancer.indexOf('    const buildStudyPacket =');
const builder = enhancer.slice(start, enhancer.indexOf('    // One subject-owned packet builder', start));
const d2 = nativeBlocks.find(row => row.blockId === 'D2');
const meta = { blockId: d2.blockId, blockTitle: d2.title, requiredModelReadiness: d2.sourceContact.requiredModelReadiness };
const packet = vm.runInNewContext(builder + ';buildStudyPacket();', { packetMeta: meta, objectId: d2.objectId, localStorage: {}, kpRows: [], currentStage: () => 'block_learn', currentIndex: () => 0, readStudy: () => ({}), buildXizongStudyPacketFromStorage: () => ({ request_to_chat: ['existing packet request'], schema: 'existing' }) });
for (const row of meta.requiredModelReadiness.requirements) assert.ok(packet.request_to_chat.some(text => text.includes(row.modelPrompt)));
assert.ok(packet.request_to_chat.some(text => text.includes('不创建新的 Repair/Memory 队列')));
assert.equal(packet.schema, 'existing');
writeBTestProof('xizong-b-readiness', {
  beforeFix: { adapterSha256: preintegration.adapter_sha256, rawNonemptyRequiresBlocks: 35, derivedCompletionArraysEmpty: 38, fixture: 'scripts/fixtures/xizong-b-readiness-preintegration.json', boundary: preintegration.observation_boundary },
  targetModelBlocksTested: ['D2', 'M2', 'G1', 'D6', 'D12', 'D13', 'D16', 'D17'],
  independentHeldBlocksTested: ['D11', 'D15', 'D18', 'D19', 'D20', 'D21'],
  cognitiveConfirmationNegativeCasesPerBlock: ['missing confirmation', 'stale witness', 'other target', 'Chat claim', 'invalid time', 'failed save', 'missing current model contract'],
  independentNegativeCases: ['old all-evidence history does not satisfy current independent gates', 'current-target confirmation never waives Tumor/O9 or Source conflict', 'held Reveal and rating rejected', 'held formal closure/completion rejected'],
  positiveControls: ['native current-model prompt shown', 'explicit user confirmation persists and reloads', 'prior owner stores remain byte-identical', 'global Source encounter stays permitted', 'mixed-Block unrelated LGs remain reachable', 'unchanged Current source-conflict reference only', 'ungated D1 completion', 'existing Chat packet contains precise smallest-repair request'],
  noPriorOwnerEvidence: true, noNewRepairQueue: true
}, nativeBlocks.map(block => block.sourcePath));
console.log('B required-model readiness PASS | explicit displayed current-target confirmation | no Block-completion shortcut | stale/missing/foreign/failed-save blocked | Source exception | old history preserved | exact scoped Tumor + D19 LG07 reference hold | existing Chat packet only');
