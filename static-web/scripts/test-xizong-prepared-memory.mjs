// Current Content -> existing cue resolver -> learner object -> Memory.
// All state below is isolated synthetic data; never read/write browser storage.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { marked } from 'marked';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';
import { projectKpCore } from '../src/lib/xizongProjection.mjs';
import { loadXizongLearningCues, learningCuesForBlock, resolvePreparedMemoryCue, preparedMemoryDigest } from '../src/lib/xizongLearningCues.mjs';
import { buildXizongLearnerObject } from '../src/lib/xizongLearnerObject.mjs';
import { extensionAssetsForBlock } from '../src/lib/xizongExtensionAssets.mjs';
import { buildXizongRevisionWitness } from '../src/lib/xizongRevisionWitness.mjs';
import { resolveXizongLearnerAssetRepresentation as representation } from '../src/lib/xizongRepresentationGate.mjs';
import { buildXizongMemoryReleaseDescriptorFromLearnerObject as describe, buildXizongPreparedMemoryAvailability } from '../src/lib/xizongMemoryRelease.mjs';
import { createXizongMemoryState, releaseBlockMemory, makePreparedMemoryAvailable, appendMemoryEvidence, setPersonalPrompt, memorySummary } from '../src/lib/xizongMemoryModel.mjs';
import { releaseCompletedBlockToMemory } from '../src/lib/xizongMemoryAutoRelease.mjs';

const shared = JSON.parse(fs.readFileSync(new URL('../../content/xizong/knowledge/learner/shared-fields.json', import.meta.url)));
const canonical = loadXizongBlock('circulation', 'b01');
const resolved = resolveXizongLearnerProjection(canonical, { enrichBlock: block => ({ ...block,
  kpRecords: block.kpRecords.map(kp => ({ ...kp, detailHtml: marked.parse(projectKpCore(kp.detailMarkdown)) }))
}) });
const current = resolved.learnerObject;
const cues = loadXizongLearningCues(resolved.system);
const bound = cues.precisionIndex.filter(row => row.prepared_memory_ref && row.anchor.block_id === canonical.blockId);
const descriptor = describe(current);
const checks = [];
const check = (name, test) => { test(); checks.push(name); };
check('thirteen existing cards receive exact answers and current owner context', () => {
  assert.equal(bound.length, 13); assert.equal(descriptor.precisionCards.length, 13);
  for (const cue of bound) {
    const card = descriptor.precisionCards.find(c => c.precisionCueId === cue.id);
    assert.equal(card.answerResolution, 'EXACT_CURRENT_OWNER');
    assert.ok(card.answerHtml.trim()); assert.ok(card.ownerContextHtml.trim());
    assert.equal(card.id, `precision:${cue.id}`); assert.equal(card.kpId, cue.anchor.kp_id);
  }
});
check('existing mnemonic and Source-scoped conflict stay in the answer', () => {
  assert.match(descriptor.precisionCards.find(c => c.id === 'precision:b01-m02-cycle-pressure-extrema').answerHtml, /快射-双双高潮/);
  const cvp = descriptor.precisionCards.find(c => c.id === 'precision:b01-m14-cvp-normal-physiology').answerHtml;
  assert.match(cvp, /4–12 cmH₂O/); assert.match(cvp, /Physiology Study only/); assert.match(cvp, /no cross-subject unified Memory/i);
});
check('all exact answer/aid payloads are protected before KP and Block Reveal', () => {
  for (const kp of current.kps) for (const cue of kp.precision) {
    assert.equal(representation(cue, {stage:'KP_RECALL_FRONT'}).visible, false);
    assert.equal(representation(cue, {stage:'BLOCK_RECALL_FRONT'}).visible, false);
    assert.equal(representation(cue, {stage:'KP_RECALL_REVEALED'}).visible, true);
  }
});
const sample = bound[1], ref = sample.prepared_memory_ref;
const testFailure = (name, mutate, expected) => check(name, () => {
  const row = structuredClone(sample), block = structuredClone(canonical), input = structuredClone(shared);
  mutate(row, block, input);
  assert.throws(() => resolvePreparedMemoryCue(row, block, input), expected);
});
testFailure('unapproved owner rejected', (_r,_b,s) => s.authority = 'UNREVIEWED', /OWNER_UNAPPROVED/);
testFailure('wrong Source owner rejected', (_r,b,s) => s.source_bindings[b.blockId] = 'another-owner.md', /SOURCE_BINDING_MISMATCH/);
testFailure('wrong KP anchor rejected', r => r.anchor.kp_id = 'not-a-kp', /KP_OWNER_MISMATCH/);
testFailure('cross-KP memory field rejected', r => r.prepared_memory_ref.kp_field_key = 'circulation-b01-kp029', /FIELD_OWNER_MISMATCH/);
testFailure('unknown collection rejected', r => r.prepared_memory_ref.collection = 'unreviewed', /COLLECTION_UNSUPPORTED/);
testFailure('different memory identity rejected', r => r.prepared_memory_ref.memory_id = 'other', /IDENTITY_MISMATCH/);
testFailure('missing item rejected', (_r,_b,s) => s.kp_fields[ref.kp_field_key].retention_metadata[ref.collection] = [], /ITEM_MISSING_OR_DUPLICATE/);
testFailure('duplicate item rejected', (_r,_b,s) => { const rows = s.kp_fields[ref.kp_field_key].retention_metadata[ref.collection]; rows.push(structuredClone(rows.find(x=>x.memory_id===sample.id))); }, /ITEM_MISSING_OR_DUPLICATE/);
testFailure('unreviewed changed answer rejected', (_r,_b,s) => s.kp_fields[ref.kp_field_key].retention_metadata[ref.collection].find(x=>x.memory_id===sample.id).answer += ' changed', /ITEM_REVIEW_STALE/);
testFailure('unreviewed changed mnemonic rejected', (_r,_b,s) => s.kp_fields[ref.kp_field_key].retention_metadata[ref.collection].find(x=>x.memory_id===sample.id).mnemonic += ' changed', /ITEM_REVIEW_STALE/);
testFailure('changed current Core rejected', (_r,b) => b.kpRecords.find(x=>x.kpId===sample.anchor.kp_id).detailMarkdown += '\nchanged', /CORE_REVIEW_STALE/);
testFailure('mismatched cue rejected', r => r.cue = 'different question', /ANSWER_OR_CUE_MISMATCH/);
testFailure('parallel inline answer rejected', r => r.answer_html = '<p>another answer</p>', /PARALLEL_ANSWER_OWNER/);
testFailure('conflicting legacy/current aliases rejected', (_r,_b,s) => {
  s.kp_fields[sample.anchor.kp_id] = structuredClone(s.kp_fields[ref.kp_field_key]);
  s.kp_fields[sample.anchor.kp_id].retention_metadata[ref.collection].find(x=>x.memory_id===sample.id).answer = 'different';
}, /AMBIGUOUS_IDENTITY_ALIAS/);
check('unbound cue stays context-only; other retained rows are not auto-admitted', () => {
  const raw = structuredClone(sample); delete raw.prepared_memory_ref;
  assert.deepEqual(resolvePreparedMemoryCue(raw, canonical, null), raw);
  assert.ok(!describe(resolveXizongLearnerProjection(loadXizongBlock('circulation','b03')).learnerObject).precisionCards.some(card => card.id === 'precision:B03-M04'));
});
check('prepared text is escaped, not executable markup', () => {
  const row=structuredClone(sample), input=structuredClone(shared);
  const item=input.kp_fields[ref.kp_field_key].retention_metadata[ref.collection].find(x=>x.memory_id===row.id);
  item.answer='<script>synthetic()</script>'; item.mnemonic='<img src=x onerror=synthetic()>';
  row.prepared_memory_ref.item_sha256=preparedMemoryDigest(item);
  const html=resolvePreparedMemoryCue(row,canonical,input).answer_html;
  assert.ok(!html.includes('<script>')); assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;script&gt;'));
});

// Reproduce the old cue-only path using the same native resolver without the
// newly reviewed references, not a hand-authored duplicate medical fixture.
const legacyCues=structuredClone(cues);
for(const row of legacyCues.precisionIndex) delete row.prepared_memory_ref;
const legacy=buildXizongLearnerObject({block:resolved.block,
  learningCues:{...learningCuesForBlock(legacyCues,resolved.block),visuals:resolved.learningCues.visuals},
  pathways:resolved.pathways,extensionAssets:extensionAssetsForBlock(resolved.block)});
legacy.revisionWitness=buildXizongRevisionWitness(legacy);
const legacyDescriptor=describe(legacy);
check('canonical model, Core, Prompt, order and Source are unchanged', () => {
  assert.equal(current.sourceHash,legacy.sourceHash);
  assert.deepEqual(current.framework,legacy.framework);
  assert.deepEqual(current.sourceContact,legacy.sourceContact);
  assert.deepEqual(current.kps.map(k=>[k.identity,k.prompt,k.core,k.source,k.outline]),legacy.kps.map(k=>[k.identity,k.prompt,k.core,k.source,k.outline]));
  assert.deepEqual(descriptor.precisionCards.map(c=>c.id),legacyDescriptor.precisionCards.map(c=>c.id));
});
let state=releaseBlockMemory(createXizongMemoryState(),legacyDescriptor,'2026-10-01T00:00:00Z');
state=setPersonalPrompt(state,'circulation-b01-kp05','synthetic private prompt');
state=appendMemoryEvidence(state,{cardId:'precision:b01-m02-cycle-pressure-extrema',rating:'mastered'},'2026-10-02T00:00:00Z');
const prior=structuredClone(state);
const refreshed=releaseCompletedBlockToMemory(state,current,{}, {refreshedAt:'2026-10-03T00:00:00Z'});
check('previously released library refreshes answers without fake first-pass evidence', () => {
  assert.equal(refreshed.refreshed,true); assert.equal(refreshed.released,false);
  assert.equal(refreshed.reason,'CONTENT_REVISION_REFRESHED');
  assert.deepEqual(refreshed.state.evidence,prior.evidence);
  assert.deepEqual(refreshed.state.promptOverrides,prior.promptOverrides);
  assert.equal(Object.keys(refreshed.state.cards).length,Object.keys(prior.cards).length);
  assert.match(refreshed.state.cards['precision:b01-m02-cycle-pressure-extrema'].answerHtml,/快射-双双高潮/);
  assert.ok(refreshed.state.cards['precision:b01-m02-cycle-pressure-extrema'].contentChangedAt);
  assert.equal(refreshed.state.cards['core:circulation-b01-kp05'].contentChangedAt,prior.cards['core:circulation-b01-kp05'].contentChangedAt);
  assert.deepEqual(state,prior);
});
check('same-revision revisit does not replay or duplicate evidence', () => {
  const again=releaseCompletedBlockToMemory(refreshed.state,current,{}, {refreshedAt:'2026-10-04T00:00:00Z'});
  assert.equal(again.refreshed,false);assert.deepEqual(again.state.evidence,prior.evidence);
  assert.deepEqual(again.state.cards,refreshed.state.cards);
});
check('new library availability is not Today debt', () => {
  const fresh=releaseBlockMemory(createXizongMemoryState(),descriptor,'2026-10-01T00:00:00Z');
  assert.equal(memorySummary(fresh).today,0);assert.equal(fresh.evidence.length,0);
});
check('native reviewed B1 availability reaches exactly the same thirteen prepared answers without full release', () => {
  const selected = buildXizongPreparedMemoryAvailability(current);
  assert.deepEqual(selected.precisionCards, descriptor.precisionCards);
  assert.deepEqual(selected.coreCards, []); assert.deepEqual(selected.attentionSignals, []);
  const state = makePreparedMemoryAvailable(createXizongMemoryState(), selected, '2026-10-01T00:00:00Z');
  assert.equal(memorySummary(state).precision, 13); assert.equal(memorySummary(state).core, 0);
  assert.equal(memorySummary(state).today, 0); assert.deepEqual(state.releasedBlocks, {});
  assert.deepEqual(state.evidence, []);
  const again = makePreparedMemoryAvailable(state, selected, '2026-10-02T00:00:00Z');
  assert.deepEqual(again, state);
  for (const id of ['b01-m03', 'b01-m07', 'b01-m11', 'b01-m13']) {
    assert.ok(!Object.keys(state.cards).some(key => key.startsWith(`precision:${id}-`)));
  }
});
// B2 reuses the same Current-owner/native projection path. The expected set is
// deliberately explicit test evidence, not a second production admission list.
const b2Canonical = loadXizongBlock('circulation', 'b02');
const b2Current = resolveXizongLearnerProjection(b2Canonical, { enrichBlock: block => ({ ...block,
  kpRecords: block.kpRecords.map(kp => ({ ...kp, detailHtml: marked.parse(projectKpCore(kp.detailMarkdown)) }))
}) }).learnerObject;
const b2Bound = cues.precisionIndex.filter(row => row.anchor.block_id === 'circulation-b02');
const b2Expected = ['b02-m01-baroreceptor-afferents','b02-m02-chemoreceptor-bias','b02-m03-chemoreflex-80',
  'b02-m05-axon-reflex-cgrp','b02-m06-medulla-80-20','b02-m07-medulla-ach-n1','b02-m09-angii-angiii-extremes',
  'b02-m10-adh-identity-origin-storage','b02-m11-v1-v2-aqp2-localization','b02-m12-adh-inhibitors','b02-m13-anp-bnp-origin','b02-m14-pg-directions'];
const b2Selected = buildXizongPreparedMemoryAvailability(b2Current);
check('B2 admits exactly twelve reviewed current native references without changing B1 thirteen', () => {
  assert.deepEqual(b2Bound.map(row => row.id), b2Expected);
  assert.equal(bound.length, 13); assert.equal(describe(current).precisionCards.length, 13);
  assert.deepEqual(b2Selected.precisionCards.map(card => card.precisionCueId), b2Expected);
  assert.deepEqual(b2Selected.coreCards, []); assert.deepEqual(b2Selected.attentionSignals, []);
  const next = makePreparedMemoryAvailable(createXizongMemoryState(), b2Selected);
  assert.equal(memorySummary(next).precision, 12); assert.equal(memorySummary(next).core, 0); assert.equal(memorySummary(next).today, 0);
  assert.deepEqual(next.evidence, []); assert.deepEqual(next.releasedBlocks, {});
  assert.deepEqual(makePreparedMemoryAvailable(next, b2Selected), next);
});
check('all B2 answer/aid/scope/source fields resolve from the original item and hide before Reveal', () => {
  for (const row of b2Bound) {
    assert.ok(!row.answer_html && !row.answerHtml);
    const ref = row.prepared_memory_ref;
    const item = shared.kp_fields[ref.kp_field_key].retention_metadata[ref.collection].find(item => item.memory_id === row.id);
    const native = resolvePreparedMemoryCue(row, b2Canonical, shared);
    assert.equal(ref.kp_core_sha256, preparedMemoryDigest(b2Canonical.kpRecords.find(kp => kp.kpId === row.anchor.kp_id).detailMarkdown));
    assert.equal(ref.item_sha256, preparedMemoryDigest(item));
    const card = b2Selected.precisionCards.find(card => card.precisionCueId === row.id);
    assert.equal(card.answerHtml, native.answer_html); assert.equal(card.sourceLocator, native.source_locator);
    assert.ok(card.ownerContextHtml.trim()); assert.equal(card.answerResolution, 'EXACT_CURRENT_OWNER');
    const cue = b2Current.kps.find(kp => kp.identity.kpId === row.anchor.kp_id).precision.find(cue => cue.id === row.id);
    assert.equal(representation(cue, {stage:'KP_RECALL_FRONT'}).visible, false);
    assert.equal(representation(cue, {stage:'BLOCK_RECALL_FRONT'}).visible, false);
    assert.equal(representation(cue, {stage:'KP_RECALL_REVEALED'}).visible, true);
  }
  const answer = id => b2Selected.precisionCards.find(card => card.precisionCueId === id).answerHtml;
  assert.match(answer('b02-m01-baroreceptor-afferents'), /窦九弓十/);
  assert.match(answer('b02-m01-baroreceptor-afferents'), /传入与传出分开/);
  assert.match(answer('b02-m02-chemoreceptor-bias'), /不写成互斥的唯一功能/);
  assert.match(answer('b02-m03-chemoreflex-80'), /不改写成临床抢救目标、SBP或MAP阈值/);
  assert.match(answer('b02-m09-angii-angiii-extremes'), /限RAS内部比较/);
  assert.match(answer('b02-m10-adh-identity-origin-storage'), /垂体后叶素.*OT/);
  assert.match(answer('b02-m12-adh-inhibitors'), /酒心咖啡糖/);
  assert.match(answer('b02-m12-adh-inhibitors'), /口诀只辅助名单/);
  assert.match(answer('b02-m13-anp-bnp-origin'), /诊断阈值归B11/);
});
check('B2 seventeen retained rows remain intact; held qualifier and LOW rows stay unindexed', () => {
  const retained = Object.entries(shared.kp_fields).filter(([id]) => id.startsWith('circulation-b02-'))
    .flatMap(([, field]) => field.retention_metadata?.memory_items || []);
  assert.equal(retained.length, 17);
  for (const prefix of ['b02-m04-','b02-m08-','b02-m15-','b02-m16-','b02-m17-']) {
    assert.equal(retained.filter(row => row.memory_id.startsWith(prefix)).length, 1);
    assert.ok(!b2Selected.precisionCards.some(card => card.precisionCueId.startsWith(prefix)));
  }
});
for (const [name, mutate, expected] of [
  ['unreviewed owner', (_r,_b,s) => s.authority = 'UNREVIEWED', /OWNER_UNAPPROVED/],
  ['wrong Source', (_r,b,s) => s.source_bindings[b.blockId] = 'another-owner.md', /SOURCE_BINDING_MISMATCH/],
  ['wrong Block', r => r.anchor.block_id = 'circulation-b01', /KP_OWNER_MISMATCH/],
  ['wrong KP', r => r.anchor.kp_id = 'circulation-b02-kp03', /FIELD_OWNER_MISMATCH/],
  ['stale Core', (_r,b) => b.kpRecords.find(k => k.kpId === 'circulation-b02-kp02').detailMarkdown += '\nchanged', /CORE_REVIEW_STALE/],
  ['stale answer', (r,_b,s) => s.kp_fields[r.prepared_memory_ref.kp_field_key].retention_metadata.memory_items[0].answer += 'changed', /ITEM_REVIEW_STALE/],
  ['stale mnemonic', (r,_b,s) => s.kp_fields[r.prepared_memory_ref.kp_field_key].retention_metadata.memory_items[0].mnemonic += 'changed', /ITEM_REVIEW_STALE/],
  ['stale scope', (r,_b,s) => s.kp_fields[r.prepared_memory_ref.kp_field_key].retention_metadata.memory_items[0].answer_scope += 'changed', /ITEM_REVIEW_STALE/],
  ['missing item', (r,_b,s) => s.kp_fields[r.prepared_memory_ref.kp_field_key].retention_metadata.memory_items = [], /ITEM_MISSING_OR_DUPLICATE/],
  ['duplicate item', (r,_b,s) => { const rows=s.kp_fields[r.prepared_memory_ref.kp_field_key].retention_metadata.memory_items;rows.push(structuredClone(rows[0])); }, /ITEM_MISSING_OR_DUPLICATE/],
  ['ambiguous alias', (r,_b,s) => { s.kp_fields[r.anchor.kp_id]=structuredClone(s.kp_fields[r.prepared_memory_ref.kp_field_key]);s.kp_fields[r.anchor.kp_id].retention_metadata.memory_items[0].answer+='changed'; }, /AMBIGUOUS_IDENTITY_ALIAS/],
  ['parallel answer', r => r.answer_html='<p>not the owner</p>', /PARALLEL_ANSWER_OWNER/]
]) check(`B2 native ${name} fails closed`, () => {
  const row=structuredClone(b2Bound[0]),block=structuredClone(b2Canonical),input=structuredClone(shared);
  mutate(row,block,input); assert.throws(()=>resolvePreparedMemoryCue(row,block,input),expected);
});

console.log(JSON.stringify({status:'PASS',boundary:'native Current content + pure synthetic state; no real learner writes',checks},null,2));
