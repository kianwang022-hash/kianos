import { buildXizongMemoryReleaseDescriptorFromLearnerObject as legacyFixtureDescriptor } from '../src/lib/xizongMemoryRelease.mjs';
// Frozen A1 batch proof. Pure native Core/semantic/cue/learner path; actual
// full visual-bundle/browser consumption runs separately in existing CI.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { marked } from 'marked';
import { loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';
import { buildXizongProductionBlock } from '../src/lib/xizongProductionProjection.mjs';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';
import { buildXizongLearnerObject } from '../src/lib/xizongLearnerObject.mjs';
import { buildXizongRevisionWitness } from '../src/lib/xizongRevisionWitness.mjs';
import { projectKpCore } from '../src/lib/xizongProjection.mjs';
import { loadXizongLearningCues, learningCuesForBlock, resolvePreparedMemoryCue, preparedMemoryDigest as digest } from '../src/lib/xizongLearningCues.mjs';
import { buildXizongPreparedMemoryAvailability as available } from '../src/lib/xizongMemoryRelease.mjs';
import { createXizongMemoryState, makePreparedMemoryAvailable, appendMemoryEvidence, todayMemoryQueue } from '../src/lib/xizongMemoryModel.mjs';
import { releaseCompletedBlockToMemory as releaseCompiledOrLegacyFixture } from '../src/lib/xizongMemoryAutoRelease.mjs';
import { resolveXizongLearnerAssetRepresentation as representation } from '../src/lib/xizongRepresentationGate.mjs';
const root = new URL('../../', import.meta.url);
const read = p => JSON.parse(fs.readFileSync(new URL(p, root)));
const shared = read('content/xizong/knowledge/learner/shared-fields.json');
const cues = loadXizongLearningCues(loadXizongSystem('circulation'));
const clone = structuredClone, checks = [], objects = new Map(), blocks = new Map();
const check = (name, fn) => { fn(); checks.push(name); };
const escape = s => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const frozenFiles=[["content/xizong/knowledge/systems/a1-circulation/blocks/Block1_正常机械循环_学习阅读版_v7_最终执行版.md", "7d5ec8afabc8c1ff32196e9802ac9364814188e9ab4afe72ec785f24b7f08605"], ["content/xizong/knowledge/systems/a1-circulation/blocks/Block2_循环调节与容量控制_学习阅读版_v4_最终执行版.md", "492d301d95616777cab94fc65d18cb5c530f7f573fc7e0f9ec1455dbf8bf3da2"], ["content/xizong/knowledge/systems/a1-circulation/blocks/Block3_心肌电活动与ECG语言_学习阅读版_v1_Batch2冻结版.md", "3770128a85547f8a258928592c38f5958db2555f814a8625a85be51f8c311297"], ["content/xizong/knowledge/systems/a1-circulation/blocks/Block4_正常止血与病理循环整合_学习阅读版_v1_Batch2冻结版.md", "a3273e2ff1c4d3cb36495f338686892728977eca5a69b2f4f839eddf572db9e5"], ["content/xizong/knowledge/systems/a1-circulation/blocks/Block5_高血压与动脉粥样硬化_学习阅读版_v2_最终执行版.md", "27a66b4cd5188eeddeb9af0b1bdc1da61041f887a578d117bfa34625c4d21a60"], ["content/xizong/knowledge/systems/a1-circulation/blocks/Block6_冠心病与心肌梗死_学习阅读版_v1_Batch3冻结版.md", "39f891bf22fd825b3147ccf5212a44fc0e09d1a45dc158676a64563402094048"], ["content/xizong/knowledge/systems/a1-circulation/blocks/Block7_风湿_IE与四瓣膜病_学习阅读版_v1_Batch4冻结版.md", "d05d101d29862ef5d62cd08978d0e8fda69595a66634c59be535c079e891d86e"], ["content/xizong/knowledge/systems/a1-circulation/blocks/Block8_心肌与心包_学习阅读版_v1_Batch4冻结版.md", "18b8ea4b2cac9186096b6d07152f344aac7ad25f421a6a02ce1c974d60d65208"], ["content/xizong/knowledge/systems/a1-circulation/blocks/Block9_周围血管疾病_学习阅读版_v1_Batch4冻结版.md", "eb4dae031fce3091078e73213d76571c9f975898eb05c2ee5b3acbe57bf96b69"], ["content/xizong/knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md", "2c2f489d1a6d514f08cdc89e4c6f150d7a1aa03251cbfe7683d34f304c86bd32"], ["content/xizong/knowledge/systems/a1-circulation/blocks/Block11_心力衰竭_学习阅读版_v2_最终执行版.md", "3c985ab282d7e4ba7347b388f2a05863a461232e6468fc7ebda08f9244241221"], ["content/xizong/knowledge/systems/a1-circulation/blocks/Block12_休克与心脏骤停_学习阅读版_v2_最终执行版.md", "4d1bc93103759dabb2c3876be2a8fa2600d6025afd5c266a6470817b4ce0db6a"], ["content/xizong/projection/a1-circulation/chat/b03-teaching.md", "76ed79507a0615a2d54f646bbba805a7421ef2a86d683a7dd4be1787efced818"], ["content/xizong/projection/a1-circulation/chat/b04-teaching.md", "5c715af5c568f794d165102ff69a91b320ce864a943c96e26c888e5dc51b9dc4"], ["content/xizong/projection/a1-circulation/chat/b05-teaching.md", "fd78dc4b2ec6cf2a41519a4ddaff7118b7e2220e3a9e618bb1b5f731fc0cb38d"], ["content/xizong/projection/a1-circulation/chat/b06-teaching.md", "cd8b2ffa57fad834b4f1b37d07072c69d6e5d2d04ec7729c8ad810183e419328"], ["content/xizong/projection/a1-circulation/chat/b07-teaching.md", "220adfff4f6969b7e9e62366875c2426372723ccbe904843cca3820229345b4a"], ["content/xizong/projection/a1-circulation/chat/b08-teaching.md", "1e19634b28901d2ebc8f084af597875953d24a8dbdaac9895e116db5b100729f"], ["content/xizong/projection/a1-circulation/chat/b09-teaching.md", "dd2feeffdc958398e19c292faa4a518bbd3cecba5dd4e80cfdee3e99fbbb23dd"], ["content/xizong/projection/a1-circulation/chat/b10-teaching.md", "6999f327d6fcbb3588d09a0bff2a061579f4670067c80cfe827220804e831b9f"], ["content/xizong/projection/a1-circulation/chat/b11-teaching.md", "ad86a0d472a8d16687bc256e2294cdcdd0415de06587f95dd0e0bf49a747f40b"], ["content/xizong/projection/a1-circulation/chat/b12-teaching.md", "d6913463a5401d951c0d00606ae487ed1654a91cc22c455e263bd41ef292e386"], ["content/xizong/knowledge/systems/a1-circulation/system.json", "b270f379a555e912c8b1703d5a3f7be56e77821f63f6f79bad11eefc6deb20cf"], ["content/xizong/knowledge/learner/a1-circulation-learning.json", "73fd2c4a5fca54c9dcc32a37cbc599661618b2cd0b6d06883fbdd104f4372ddd"]];
const protectedIndexDigest="4dd4f285b0e59a611dc8f4fd9092472c236274059fea981e2b8bd4b2290cc190";
const heldIds=["B03-M04", "B03-M05", "B03-M06", "B03-M07", "B03-M12", "B03-M15", "B03-M11", "B04-M18", "B04-M20", "B05-M11", "B05-M12", "B05-M23", "B06-M07", "B06-M08", "B06-M09", "B06-M10", "B06-M27", "B06-M25", "B06-M18", "B07-M02", "B07-M03", "B07-M08", "B07-M23", "B07-M10", "B07-M24", "B07-M11", "B07-M28", "B07-M19", "B07-M27", "B07-M29", "B07-M30", "B08-M18", "B08-M02", "B08-M06", "B08-M23", "B08-M08", "B08-M10", "B08-M11", "B08-M12", "B08-M20", "B08-M21", "B08-M24", "B08-M27", "B08-M29", "B08-M34", "B09-M05", "B09-M17", "B09-M09", "B09-M23", "B09-M13", "B10-M02", "B10-M05", "B10-M21", "B10-M06", "B10-M07", "B10-M09", "B10-M24", "B10-M14", "B10-M26", "B10-M16", "B10-M18", "B10-M30", "B11-M05", "B11-M25", "B11-M06", "B11-M10", "B11-M28", "B11-M11", "B11-M12", "B11-M17", "B11-M19", "B11-M20", "B11-M34", "B11-M30", "B12-M06", "B12-M20", "B12-M21", "B12-M10", "B12-M19"];
check('unmigrated A1 owners and B2 admissions retain their frozen values', () => {
  // B1 atomic relocation is covered by semantic Core/card/history goldens in
  // test-xizong-canonical-block-owner; raw B1 packaging necessarily changes.
  for (const [path, sha] of frozenFiles) {
    if (path.includes('/Block1_') || path.endsWith('/system.json') || path.endsWith('/a1-circulation-learning.json')) continue;
    assert.equal(digest(fs.readFileSync(new URL(path, root),'utf8')), sha, path);
  }
  const system=read('content/xizong/knowledge/systems/a1-circulation/system.json'); delete system.logic_index['circulation-b01'];
  assert.equal(digest(system),'3ffeb7ec89df073f7b0e98ccc919e4286339306fc8bc222508f9d4152f61ca3e');
  const learning=read('content/xizong/knowledge/learner/a1-circulation-learning.json'); delete learning.blocks['circulation-b01'];
  assert.equal(digest(learning),'796260b67562f7c6e7e06856d6a65c9ae1ed7e9742c1cc69abedc83043cc01f1');
  assert.equal(digest(cues.precisionIndex.filter(row=>row.anchor.block_id==='circulation-b02')),'80be8e05ea9a69d547a3ff77477f13c2fd4882fe223ce65a41748328ae49fb83');
});
for (let n=1; n<=12; n++) {
  const id=`circulation-b${String(n).padStart(2,'0')}`;
  const block=buildXizongProductionBlock(loadXizongBlock('circulation', id));
  block.kpRecords=block.kpRecords.map(kp=>({...kp, detailHtml:marked.parse(projectKpCore(kp.detailMarkdown))}));
  blocks.set(id,block);
  const learningCues=learningCuesForBlock(cues,block);
  const learner=block.knowledge ? resolveXizongLearnerProjection({systemId:'circulation',blockId:id}).learnerObject
    : buildXizongLearnerObject({block,learningCues});
  learner.revisionWitness=buildXizongRevisionWitness(learner); objects.set(id,learner);
  check(`${id}: native identity, post-Reveal qualifiers and selective availability`,()=>{
    assert.deepEqual(learner.kps.map(kp=>kp.identity.kpId),block.kpRecords.map(kp=>kp.kpId));
    assert.ok(learner.kps.every(kp=>/^circulation-b\d\d-kp\d\d$/.test(kp.identity.kpId)));
    const descriptor=available(clone(learner));
    assert.equal(descriptor.coreCards.length,0);
    const state=makePreparedMemoryAvailable(createXizongMemoryState(),descriptor);
    assert.deepEqual(state.releasedBlocks,{});assert.deepEqual(state.evidence,[]);assert.equal(todayMemoryQueue(state).length,0);
    assert.equal(JSON.stringify(makePreparedMemoryAvailable(state,descriptor)),JSON.stringify(state));
    for(const row of learningCues.precision.filter(row=>row.prepared_memory_ref)) {
      assert.equal(representation(row,{stage:'KP_RECALL_FRONT'}).visible,false);
      assert.equal(representation(row,{stage:'BLOCK_RECALL_FRONT'}).visible,false);
      const ref=row.prepared_memory_ref;
      const item=ref.collection==='canonical_exact_items'?block.knowledge.exact_items.find(value=>value.item.memory_id===ref.memory_id).item
        :ref.collection==='precision_fields'?shared.precision_fields[ref.precision_id]
        :shared.kp_fields[ref.kp_field_key].retention_metadata[ref.collection].find(x=>x.memory_id===ref.memory_id);
      const members=(ref.source_memory_refs||[]).map(r=>shared.kp_fields[r.kp_field_key].retention_metadata.source_memory_items.find(x=>x.memory_id===r.memory_id));
      for(const value of [item,...members]) for(const s of [value.answer_scope,value.scope_note,value.mnemonic,value.source_conflict?.conflict,value.source_conflict?.policy,...(value.retention_metadata?.source_scope_notes||[])].filter(Boolean)) assert.ok(row.answer_html.includes(escape(s)),`${row.id}: ${s}`);
    }
  });
}
check('all 312 canonical KP identities survive; B1/B2 exact original admission counts survive',()=>{
  assert.equal([...objects.values()].reduce((n,o)=>n+o.kps.length,0),312);
  assert.equal(available(objects.get('circulation-b01')).precisionCards.length,13);
  assert.equal(available(objects.get('circulation-b02')).precisionCards.length,12);
});
const row=id=>cues.precisionIndex.find(r=>r.id===id);
const evaluate=(r,b=blocks.get(r.anchor.block_id),s=shared,opts={})=>resolvePreparedMemoryCue(r,b,s,opts);
const negative=(name,id,mutate,pattern=/CURRENT_XIZONG_PREPARED_MEMORY_/)=>check(name,()=>{
  const r=clone(row(id)),b=clone(blocks.get(r.anchor.block_id)),s=clone(shared),opts={};mutate(r,b,s,opts);assert.throws(()=>evaluate(r,b,s,opts),pattern);
});
const compound='xpg_4004a850c58fd059', wet='xpg_e817b36d446e7568';
check('every explicitly reviewed supplemental medical premise remains required',()=>{
  const expected={"B03-M02": ["circulation-b03-kp07"], "B03-M08": ["circulation-b03-kp14"], "B03-M13": ["circulation-b03-kp19"], "B04-M06": ["circulation-b04-kp11"], "B04-M16": ["circulation-b04-kp09", "circulation-b04-kp10"], "B04-M17": ["circulation-b04-kp13"], "B05-M09": ["circulation-b05-kp22"], "B05-M14": ["circulation-b05-kp06"], "xpg_ccbcd69499cfe14d": ["circulation-b06-kp13", "circulation-b06-kp34"], "B06-M14": ["circulation-b06-kp17"], "B06-M20": ["circulation-b06-kp11"], "B07-M01": ["circulation-b07-kp21", "circulation-b07-kp40"], "xpg_58d002be5a2b04ea": ["circulation-b07-kp15"], "B10-M19": ["circulation-b10-kp19"], "B10-M28": ["circulation-b10-kp22"], "B10-M29": ["circulation-b10-kp22"], "xpg_b85cb6960f8b0b25": ["circulation-b05-kp18"], "B11-M29": ["circulation-b11-kp14"], "B11-M32": ["circulation-b05-kp18"], "xpg_4004a850c58fd059": ["circulation-b12-kp10"]};
  for(const [id,kps] of Object.entries(expected))assert.deepEqual(row(id).prepared_memory_ref.additional_core_refs.map(w=>w.kp_id),kps,id);
});

check('complete compounds preserve existing IDs and expected absence; partial/held references do not become cards',()=>{
  assert.deepEqual(row(wet).prepared_memory_ref.expected_missing_source_memory_ids,['B11-M08']);
  assert.deepEqual(row(compound).prepared_memory_ref.source_memory_refs.map(x=>x.memory_id),['B12-M08','B12-M09']);
  assert.ok(evaluate(row(wet)).answer_html.includes('HFpEF'));
  assert.ok(!row('B06-M08'));assert.ok(!row('B12-M08'));assert.ok(!row('B12-M09'));assert.ok(!row('xpg_c8ea9e6209ee8fb6'));
  for(const id of heldIds) assert.ok(!row(id),id);
});
for(const [name,change] of [
  ['missing member',r=>r.prepared_memory_ref.source_memory_refs.pop()],
  ['duplicate member',r=>r.prepared_memory_ref.source_memory_refs.push(clone(r.prepared_memory_ref.source_memory_refs[0]))],
  ['mixed reference identity',r=>r.prepared_memory_ref.memory_id=r.id],
  ['wrong reference owner',r=>r.prepared_memory_ref.precision_id='other'],
  ['member hash stale',r=>r.prepared_memory_ref.source_memory_refs[0].item_sha256='stale'],
  ['owner hash stale',r=>r.prepared_memory_ref.item_sha256='stale'],
  ['extra unknown ref field',r=>r.prepared_memory_ref.unknown=true],
  ['missing Core hash',r=>delete r.prepared_memory_ref.kp_core_sha256],
  ['wrong field alias',r=>r.prepared_memory_ref.kp_field_key='circulation-b12-kp010'],
  ['inline answer',r=>r.answer_html='<p>copy</p>']
])negative(name,compound,change);
negative('required additional safety Core stale',compound,(_r,b)=>b.kpRecords.find(k=>k.ordinal===10).detailMarkdown+=' changed');
negative('additional Core duplicate',compound,r=>r.prepared_memory_ref.additional_core_refs.push(clone(r.prepared_memory_ref.additional_core_refs[0])));
negative('extra safety path mismatch',compound,r=>r.prepared_memory_ref.additional_core_refs[0].source_path+='x');
negative('absent M08 later appears',wet,(_r,_b,s)=>s.kp_fields['circulation-b11-kp010'].retention_metadata.source_memory_items.push({memory_id:'B11-M08',precision_id:wet}));
negative('member reassigned to another Precision',compound,(_r,_b,s)=>s.kp_fields['circulation-b12-kp011'].retention_metadata.source_memory_items.find(x=>x.memory_id==='B12-M09').precision_id='other');
negative('scope-only source change invalidates member',compound,(_r,_b,s)=>s.kp_fields['circulation-b12-kp011'].retention_metadata.source_memory_items.find(x=>x.memory_id==='B12-M09').scope_note='changed');
negative('conflicting two-digit alias fails closed',compound,(r,_b,s)=>{const k=r.prepared_memory_ref.kp_field_key;s.kp_fields[r.anchor.kp_id]=clone(s.kp_fields[k]);s.kp_fields[r.anchor.kp_id].retention_metadata.source_memory_items[0].answer='changed';});
check('identical native alias remains compatible',()=>{const r=row(compound),s=clone(shared);s.kp_fields[r.anchor.kp_id]=clone(s.kp_fields[r.prepared_memory_ref.kp_field_key]);assert.equal(evaluate(r,blocks.get(r.anchor.block_id),s).answer_html,evaluate(r).answer_html);});
negative('cross-Block current safety Core stale','B11-M32',(_r,_b,_s,opts)=>{opts.loadBlock=(system,id)=>{const other=clone(blocks.get(id));other.kpRecords.find(k=>k.ordinal===18).detailMarkdown+=' changed';return other;};});
negative('cross-Block lookup failure cannot fall back','B11-M32',(_r,_b,_s,opts)=>{opts.loadBlock=()=>{throw Error('missing')};});
negative('ordinary cross-KP Core stale','B07-M01',(_r,b)=>b.kpRecords.find(k=>k.ordinal===21).detailMarkdown+=' changed');
check('availability strictly compares all nested witnesses after serialization',()=>{
  const value=clone(objects.get('circulation-b12'));assert.equal(available(value).precisionCards.length,12);
  const target=value.kps.flatMap(k=>k.precision).find(c=>c.id===compound);
  target.raw.prepared_memory_ref.source_memory_refs[0].item_sha256='stale';assert.throws(()=>available(value),/PREPARED_REFERENCE_STALE/);
  const omitted=clone(objects.get('circulation-b12'));delete omitted.kps.flatMap(k=>k.precision).find(c=>c.id===compound).raw.prepared_memory_ref.additional_core_refs;assert.throws(()=>available(omitted),/PREPARED_REFERENCE_STALE/);
  for(const [key,val] of [['systemId','respiratory'],['canonicalId','A2'],['blockId','circulation-b13']]){const v=clone(objects.get('circulation-b12'));v.identity[key]=val;assert.throws(()=>available(v));}
});
check('original identities keep history, private marks and release receipts; genuine later completion still releases once',()=>{
  const learner=objects.get('circulation-b12'),descriptor=available(learner);
  let state=makePreparedMemoryAvailable(createXizongMemoryState(),descriptor,'2026-10-01T00:00:00Z');
  state=appendMemoryEvidence(state,{cardId:`precision:${compound}`,rating:'known'},'2026-10-01T01:00:00Z');
  state.marks={private:{text:'synthetic private mark'}};state.promptOverrides={private:'synthetic override'};state.releasedBlocks={other:{releasedAt:'preserve'}};
  state.cards[`precision:${compound}`].semanticRevision='synthetic-earlier-reviewed-revision';
  state.cards[`precision:${compound}`].answerHtml='<p>Synthetic earlier answer</p>';
  const old=clone(state);
  const fresh=makePreparedMemoryAvailable(state,descriptor,'2026-10-02T00:00:00Z');
  for(const k of ['evidence','marks','promptOverrides','releasedBlocks'])assert.deepEqual(fresh[k],old[k]);
  assert.equal(fresh.cards[`precision:${compound}`].contentHistory.length,1);
  const study={sourceHash:learner.sourceHash,completed:true,blockRecallDone:true,learned:Object.fromEntries(learner.kps.map(k=>[k.identity.kpId,true])),ratings:Object.fromEntries(learner.kps.map(k=>[k.identity.kpId,'known']))};
  const done=releaseCompletedBlockToMemory(fresh,learner,study);assert.equal(done.released,true);assert.equal(done.coreCardIds.length,learner.kps.length);assert.equal(releaseCompletedBlockToMemory(done.state,learner,study).released,false);
});
console.log(JSON.stringify({status:'PASS',boundary:'Native/semantic/cue/learner and synthetic Memory only; full visual-bundle/browser acceptance remains separate',blocks:[...objects].map(([id,o])=>({id,kps:o.kps.length,prepared:available(o).precisionCards.length})),checks},null,2));

// This file retains deliberate pre-compiler fixtures. Explicitly inject their
// legacy adapter; production migrated consumers never import that raw owner path.
function releaseCompletedBlockToMemory(state, learner, study, options = {}) {
  return releaseCompiledOrLegacyFixture(state, learner, study,
    { ...options, descriptorBuilder: legacyFixtureDescriptor });
}
