import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { loadXizongBlock, resolveXizongKnowledgeView } from '../src/lib/xizong.mjs';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';
import { presentXizongLearnerBlock } from '../src/lib/xizongLearnerObject.mjs';
import * as memory from '../src/lib/xizongCompiledMemoryRelease.mjs';
import { createXizongReviewedRelationFreshnessResolver } from '../src/lib/xizongReviewedRelationFreshness.mjs';
import { createXizongMemoryState, makePreparedMemoryAvailable, appendMemoryEvidence, todayMemoryQueue } from '../src/lib/xizongMemoryModel.mjs';
import { reconcileXizongRevision, revisionRequiresAction, revisionStatus, compatibleRevisionWitnesses } from '../src/lib/xizongContentRevision.mjs';
import { buildXizongRevisionWitness } from '../src/lib/xizongRevisionWitness.mjs';
import { releaseCompletedBlockToMemory, inspectXizongBlockCompletion } from '../src/lib/xizongMemoryAutoRelease.mjs';
import { buildXizongMemoryReleaseDescriptorFromLearnerObject as nativeDescriptor } from '../src/lib/xizongMemoryRelease.mjs';
import { releaseBlockMemory } from '../src/lib/xizongMemoryModel.mjs';
import { buildXizongStudyPacketFromStorage, buildXizongForecastProgress } from '../src/lib/xizongStudyPacket.mjs';
import { buildXizongChatHandoff, writeXizongChatHandoff, applyXizongChatReturn, XIZONG_CHAT_RETURN_SCHEMA } from '../src/lib/xizongChatReturn.mjs';
const root = process.env.KIANOS_REPO_ROOT || path.resolve(new URL('../../', import.meta.url).pathname);
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const compile = () => resolveXizongLearnerProjection({systemId:'circulation',blockId:'circulation-b01'});
const initial = compile(), learner = initial.learnerObject, canonical = loadXizongBlock('circulation','circulation-b01');
const descriptor = memory.buildXizongPreparedMemoryAvailability(learner);
const checks = [];
const check = (name, run) => { run(); checks.push(name); };
const sourcePath = path.join(root,canonical.sourcePath), original = fs.readFileSync(sourcePath,'utf8');
const match = original.match(/<!-- kianos:knowledge\n([\s\S]*?)\n-->/), originalKnowledge = JSON.parse(match[1]);
const replaceKnowledge = value => original.replace(match[0], `<!-- kianos:knowledge\n${JSON.stringify(value,null,2)}\n-->`);
const editFile = (file, value, run) => { const old=fs.readFileSync(file);try{fs.writeFileSync(file,value);run();}finally{fs.writeFileSync(file,old);} };
const editKnowledge = (mutate, run) => {const value=structuredClone(originalKnowledge);mutate(value);editFile(sourcePath,replaceKnowledge(value),run);};
const golden = {
  "witness": "a361e4862c48bbf12db729d8a7c36f9ef2496ff5a42587850ab33448fd67fd0a",
  "cards": "0af414c1310ec3e53c91d2eb3dce3804d76a4d02dc2d3b2cd107413e598f9144",
  "core": "9fdfd125578bfc36cefa61af658bbd7567dbe27103a46bd355b13d5ba4e1dca6"
};
check('actual B1 owner and honest admission',()=>{
 assert.equal(canonical.logicGroups.length,7);assert.equal(canonical.kpRecords.length,32);
 assert.equal(canonical.knowledge.exact_items.length,17);assert.equal(descriptor.precisionCards.length,13);
 assert.equal(canonical.knowledge.gate_views.length,9);assert.equal(canonical.knowledge.inactive_gate_refs.length,5);
 assert.equal(learner.semanticOwnership.sourcePath,canonical.sourcePath);
});
check('same Core and semantic history witnesses after relocation',()=>{
 const {sourceHash,...witness}=buildXizongRevisionWitness({ ...learner, model:undefined });
 // The previous golden lacked the authoritative model. Preserve its KP/LG/
 // support history without freezing that incomplete Block witness as Current.
 assert.equal(hash(witness),golden.witness);
 assert.notEqual(learner.revisionWitness.block,witness.block);
 assert.equal(hash(canonical.kpRecords.map(c=>Object.fromEntries(['kpId','title','prompt','detailMarkdown','sourceLocator','outlineLocator'].map(k=>[k,c[k]])))),golden.core);
 assert.equal(hash(descriptor.precisionCards.map(c=>Object.fromEntries(['id','precisionCueId','kpId','answerHtml','semanticRevision'].map(k=>[k,c[k]])))),golden.cards);
});
check('adopted model and natural bindings preserved',()=>{
 const history=fs.readFileSync(path.join(root,'content/xizong/projection/a1-circulation/chat/b01-teaching.md'),'utf8').split('\n\n').slice(1).join('\n\n');
 const normalize=text=>text.replace(/\]\([^\n]+?\)/g,'](CANONICAL_REF)')
   .replace(/<!-- (?:kianos:model-view [a-z-]+|\/kianos:model-view) -->\n/g,'');
 assert.equal(normalize(learner.model.markdown),normalize(history));
 const ids=[...learner.model.markdown.matchAll(/<!-- b1:node (\{[^\n]+?\}) -->/g)].map(m=>JSON.parse(m[1]).kp_id);
 assert.deepEqual(ids,canonical.knowledge.model.node_kp_ids);assert.equal(ids.length,19);
 assert.match(learner.model.markdown,/微循环交换.*静脉回收与再次充盈/);
 assert.match(learner.model.markdown,/并行供养/);
});
check('old nonmodel witness creates an honest model evidence gap without new work',()=>{
 const prior=buildXizongRevisionWitness({...learner,model:undefined});
 const {sourceHash,...oldSemantic}=prior;assert.equal(hash(oldSemantic),golden.witness);
 assert.equal(prior.block,learner.revisionWitness.blockModel.withoutModel);
 assert.equal(compatibleRevisionWitnesses(prior,learner.revisionWitness),false);
 const alreadyBound=structuredClone(learner.revisionWitness);delete alreadyBound.blockModel;
 assert.equal(compatibleRevisionWitnesses(alreadyBound,learner.revisionWitness),true);
 const study={sourceHash:prior.sourceHash,completed:true,blockRecallDone:true,
  learned:Object.fromEntries(learner.kps.map(k=>[k.identity.kpId,true])),
  ratings:Object.fromEntries(learner.kps.map(k=>[k.identity.kpId,'known'])),contentRevision:{witness:prior}};
 const state=reconcileXizongRevision(study,learner.revisionWitness),r=state.contentRevision;
 assert.equal(r.classification,'UNCLASSIFIED_REVISION');assert.equal(r.blockReason,'UNCLASSIFIED_REVISION');
 assert.deepEqual(r.history.at(-1).unwitnessedScopes,['BLOCK_MODEL']);
 assert.equal(r.history.at(-1).reason,'MODEL_NOT_BOUND_BY_PRIOR_WITNESS');
 assert.equal(r.blockPending,true);assert.equal(revisionRequiresAction(state),false);
 assert.equal(revisionStatus(state,learner.sourceHash).current_claim,'UNKNOWN');
 assert.deepEqual(r.pendingKp,{});assert.deepEqual(r.pendingGroup,{});assert.equal(r.contactPending,false);
 assert.equal(state.completed,true);assert.equal(state.blockRecallDone,true);assert.deepEqual(state.learned,study.learned);assert.deepEqual(state.ratings,study.ratings);
 assert.notEqual(inspectXizongBlockCompletion(learner,state).reason,'CONTENT_REVALIDATION_REQUIRED');
 const before=makePreparedMemoryAvailable(createXizongMemoryState(),{...descriptor,revisionWitness:prior});
 const after=makePreparedMemoryAvailable(before,descriptor);assert.equal(todayMemoryQueue(before).length,0);assert.equal(todayMemoryQueue(after).length,0);
 assert.deepEqual(after.evidence,before.evidence);assert.deepEqual(after.releasedBlocks,before.releasedBlocks);
 assert.equal(Object.values(after.cards).reduce((n,c)=>n+(c.contentHistory?.length||0),0),0);
 // Exercise the actual Packet/forecast/Return consumers with isolated storage.
 const values=new Map([['kianos-xizong-astro-v2:xizong:circulation-b01',JSON.stringify(study)]]);
 const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key),key:i=>[...values.keys()][i]??null,get length(){return values.size}};
 const kpRows=learner.kps.map(k=>({kpId:k.identity.kpId,groupId:k.identity.logicGroupId,title:k.identity.title,prompt:k.prompt.canonical}));
 const packetMeta={objectId:'xizong:circulation-b01',systemId:'circulation',canonicalId:'A1',blockId:'circulation-b01',sourceHash:learner.sourceHash,revisionWitness:learner.revisionWitness};
 const packet=buildXizongStudyPacketFromStorage({storage,packetMeta,kpRows});
 assert.equal(packet.current.revision_review.current_claim,'UNKNOWN');assert.equal(packet.current.revision_review.blocked,true);
 assert.equal(packet.current.source_revision_blocked,false);assert.equal(packet.learning_state.current_block_complete,true);
 const forecast=buildXizongForecastProgress(storage,[{systemId:'circulation',blockId:'circulation-b01',packetMeta,kpRows}]);
 assert.deepEqual(forecast.runtime_evidence.completed_block_ids,['circulation-b01']);
 assert.equal(forecast.runtime_evidence.source_revision_blocked_count,0);
 const studyBytes=storage.getItem('kianos-xizong-astro-v2:xizong:circulation-b01');
 const handoff=buildXizongChatHandoff(packet,{returnHref:'/xizong/circulation/b01/',makeId:()=> 'fresh-model-gap'});writeXizongChatHandoff(storage,handoff);
 const response={schema:XIZONG_CHAT_RETURN_SCHEMA,return_id:'model-gap-return',handoff_id:handoff.handoff_id,origin:handoff.origin,resume:handoff.resume,decision:'NO_ACTION',repairs:[]};
 assert.equal(applyXizongChatReturn(storage,response,{currentPacket:packet}).status,'applied');
 assert.equal(applyXizongChatReturn(storage,response,{currentPacket:packet}).status,'already_applied');
 assert.equal(storage.getItem('kianos-xizong-astro-v2:xizong:circulation-b01'),studyBytes);
 const oldPacket=buildXizongStudyPacketFromStorage({storage,packetMeta:{...packetMeta,revisionWitness:prior},kpRows});
 const oldHandoff=buildXizongChatHandoff(oldPacket,{returnHref:'/xizong/circulation/b01/',makeId:()=> 'old-unbound-model'});writeXizongChatHandoff(storage,oldHandoff);
 assert.throws(()=>applyXizongChatReturn(storage,{...response,return_id:'stale-model-return',handoff_id:oldHandoff.handoff_id,origin:oldHandoff.origin,resume:oldHandoff.resume},{currentPacket:packet}),/CURRENT_OBJECT_CHANGED/);

 // A proven change to a field the old witness DID cover is still actionable.
 const known=structuredClone(learner);known.framework.stopLine+='semantic change';
 const changed=reconcileXizongRevision(study,buildXizongRevisionWitness(known));
 assert.equal(changed.contentRevision.blockReason,'LOCAL_SEMANTIC_CHANGE');assert.equal(revisionRequiresAction(changed),true);
 for(const mutate of [l=>l.framework.stopLine+='meaning change',l=>l.kps[0].core.markdown+='meaning change',l=>l.sourceContact.mode+='source change',l=>l.model.markdown=l.model.markdown.replace('维持下一搏','抑制下一搏')]){
  const l=structuredClone(learner);mutate(l);const w=buildXizongRevisionWitness(l);
  const knownStudy={...study,contentRevision:{witness:learner.revisionWitness}};
  storage.setItem('kianos-xizong-astro-v2:xizong:circulation-b01',JSON.stringify(knownStudy));
  const rejected=buildXizongStudyPacketFromStorage({storage,packetMeta:{...packetMeta,revisionWitness:w},kpRows});
  assert.equal(rejected.current.source_revision_blocked,true);assert.equal(rejected.learning_state.current_block_complete,false);
 }

});
check('real model relationship change requires Block review without erasing history',()=>{
 const study={ sourceHash:learner.sourceHash,completed:true,blockRecallDone:true,
   ratings:{'circulation-b01-kp27':'known'},learned:{'circulation-b01-kp27':true},
   contentRevision:{witness:learner.revisionWitness} };
 editFile(sourcePath,original.replace('主动脉分出冠脉 → ⑥供养心肌 → 维持下一搏','主动脉分出冠脉 → ⑥供养心肌 → 抑制下一搏'),()=>{
  const changed=compile().learnerObject,state=reconcileXizongRevision(study,changed.revisionWitness);
  assert.notEqual(changed.revisionWitness.block,learner.revisionWitness.block);
  assert.equal(state.contentRevision.blockPending,true);assert.equal(revisionRequiresAction(state),true);
  assert.equal(inspectXizongBlockCompletion(changed,state).reason,'CONTENT_REVALIDATION_REQUIRED');
  assert.equal(state.completed,true);assert.equal(state.blockRecallDone,true);assert.deepEqual(state.ratings,study.ratings);
  assert.deepEqual(changed.revisionWitness.kps,learner.revisionWitness.kps);
 });
});
check('known model locator/presentation relocation preserves semantic witness',()=>{
 const changed=structuredClone(learner);
 changed.model.markdown=changed.model.markdown.replace(/"canonical_line":\d+/g,'"canonical_line":9999')
  .replace(/<!-- b1:source \d+:\d+ -->/g,'<!-- b1:source 9000:9999 -->')
  .replace(/\]\(#[^\s)]+\)/g,'](../Block.md?plain=1#L9999)').replace(/\*\*/g,'');
 assert.equal(buildXizongRevisionWitness(changed).block,learner.revisionWitness.block);
});
check('single canonical cue edit is derived without a second semantic edit',()=>{
 editKnowledge(k=>{k.exact_items[0].item.cue+='单点编辑检验';},()=>{
  const changed=compile().learnerObject,d=memory.buildXizongPreparedMemoryAvailability(changed);
  assert.match(d.precisionCards[0].cue,/单点编辑检验/);
  assert.notEqual(changed.revisionWitness.kps[d.precisionCards[0].kpId],learner.revisionWitness.kps[d.precisionCards[0].kpId]);
  assert.equal(d.precisionCards.length,13);
 });
});
check('real unmigrated native objects refresh through default shared API without raw reads',()=>{
 for(const [system,id] of [['circulation','b02'],['digestive-metabolic-endocrine-tumor','d06'],['digestive-metabolic-endocrine-tumor','m04'],['urinary','b05']]) {
  const obj=resolveXizongLearnerProjection(loadXizongBlock(system,id)).learnerObject;
  const expected=nativeDescriptor(obj),input=JSON.parse(JSON.stringify(obj));
  const prior=releaseBlockMemory(createXizongMemoryState(),expected);
  prior.releasedBlocks[obj.identity.blockId].sourceHash='historical-location';
  const read=fs.readFileSync;
  try { fs.readFileSync=()=>{throw new Error('RAW_OWNER_DENIED');};
   const result=releaseCompletedBlockToMemory(prior,input,{});
   assert.equal(result.refreshed,true);
   assert.deepEqual(memory.buildXizongMemoryReleaseDescriptorFromLearnerObject(input),expected);
   assert.deepEqual(result.state.evidence,prior.evidence);
  } finally { fs.readFileSync=read; }
 }
});
check('single Prompt edit updates the same natural model node',()=>{
 const kp=canonical.kpRecords[0];
 editFile(sourcePath,original.replace(`**主提示**：${kp.prompt}`,`**主提示**：${kp.prompt}｜单点编辑检验`),()=>{
  const changed=compile().learnerObject;
  assert.ok(changed.kps[0].prompt.canonical.endsWith('｜单点编辑检验'));
  assert.ok(changed.model.markdown.includes(`${kp.title}〔${kp.prompt}｜单点编辑检验〕`));
 });
});
check('single canonical mnemonic edit reaches Memory and invalidates only genuine semantic witness',()=>{
 editKnowledge(k=>{k.exact_items.find(v=>v.item.mnemonic).item.mnemonic+='（单点编辑检验）';},()=>{
  const changed=compile().learnerObject,d=memory.buildXizongPreparedMemoryAvailability(changed);
  assert.match(d.precisionCards.find(c=>c.id==='precision:b01-m02-cycle-pressure-extrema').answerHtml,/单点编辑检验/);
  assert.notEqual(changed.revisionWitness.kps['circulation-b01-kp03'],learner.revisionWitness.kps['circulation-b01-kp03']);
  assert.equal(changed.revisionWitness.kps['circulation-b01-kp04'],learner.revisionWitness.kps['circulation-b01-kp04']);
 });
});
check('Core change makes reviewed explanation explicitly stale without auto-signing',()=>{
 editFile(sourcePath,original.replace('- **时间**：','- **时间**：单点编辑检验'),()=>assert.throws(compile,/MODEL_DERIVATION_STALE/));
});
for(const [name,mutate] of [
 ['missing canonical group',k=>k.logic_groups.pop()],
 ['overlapping canonical membership',k=>k.logic_groups[1].kpOrdinals.unshift(1)],
 ['duplicate exact identity',k=>k.exact_items.push(k.exact_items[0])],
 ['parallel exact answer',k=>k.exact_items[0].item.answer='FORGED'],
 ['unknown canonical field',k=>k.competing_answer='FORGED'],
 ['missing admitted item',k=>k.exact_items.shift()],
 ['ambiguous exact selector',k=>k.fragments['kp03.time'].pattern='^']
])check(name+' fails closed',()=>editKnowledge(mutate,()=>assert.throws(compile)));
check('missing canonical payload has no legacy fallback',()=>editFile(sourcePath,original.replace(match[0],''),()=>assert.throws(compile,/KNOWLEDGE_OWNER_MISSING/)));
check('old semantic poison is ignored; unique current data remains live',()=>{
 const sharedPath=path.join(root,'content/xizong/knowledge/learner/shared-fields.json'),shared=JSON.parse(fs.readFileSync(sharedPath));
 shared.logic_groups['circulation-b01']=[{id:'FORGED',kp:[1,32]}];
 shared.block_fields['circulation-b01'].initial_orientation={status:'APPROVED',minimal_model:'FORGED'};
 for(const [key,field] of Object.entries(shared.kp_fields))if(key.startsWith('circulation-b01-kp')){
  field.retention_metadata ||= {};field.retention_metadata.memory_items=[{memory_id:'FORGED',answer:'FORGED'}];
  field.retention_metadata.gate_knowledge=[{anchor:'FORGED'}];
 }
 editFile(sharedPath,JSON.stringify(shared),()=>assert.deepEqual(compile().learnerObject,learner));
 const learningPath=path.join(root,canonical.learningSupportSourcePath),learning=JSON.parse(fs.readFileSync(learningPath));
 for(const g of Object.values(learning.blocks[canonical.blockId].logic_groups)){g.kp=[1,32];g.label='FORGED';}
 editFile(learningPath,JSON.stringify(learning),()=>{
  const result=compile().learnerObject;assert.deepEqual(result.logicGroups,learner.logicGroups);
 });
});
check('serialized consumers need no raw owner access',()=>{
 const value=JSON.parse(JSON.stringify(learner));const read=fs.readFileSync;
 try{fs.readFileSync=()=>{throw new Error('RAW_OWNER_DENIED');};
  assert.equal(memory.buildXizongPreparedMemoryAvailability(value).precisionCards.length,13);
  const view=presentXizongLearnerBlock(value);assert.equal(view.kpRecords.length,32);assert.equal(view.logicGroups.length,7);
 }finally{fs.readFileSync=read;}
});
check('Projection uses its declared canonical model binding without bypass',()=>{
 assert.equal(initial.block.cognitiveProjection.assetPath,'content/xizong/projection/a1-circulation/blocks/b01.projection.json');
 assert.ok(initial.block.cognitiveProjection.stageObjects.some(row=>row.objectId==='circulation-b01-framework'));
 const asset=path.join(root,initial.block.cognitiveProjection.assetPath),json=JSON.parse(fs.readFileSync(asset));
 json.objects.find(row=>row.object_id==='circulation-b01-framework').binding.role='MISSING_MODEL';
 editFile(asset,JSON.stringify(json),()=>assert.throws(compile,/OWNER_REF_UNSUPPORTED/));
});
check('old semantic fields and teaching can be disconnected without affecting the same object',()=>{
 const file=path.join(root,'content/xizong/knowledge/learner/shared-fields.json'),shared=JSON.parse(fs.readFileSync(file));
 delete shared.logic_groups['circulation-b01'];delete shared.block_fields['circulation-b01'].initial_orientation;
 for(const [id,field] of Object.entries(shared.kp_fields))if(id.startsWith('circulation-b01-kp')){
   delete field.retention_metadata?.memory_items;delete field.retention_metadata?.gate_knowledge;
 }
 editFile(file,JSON.stringify(shared),()=>assert.deepEqual(compile().learnerObject,learner));
 const teaching=path.join(root,'content/xizong/projection/a1-circulation/chat/b01-teaching.md');
 editFile(teaching,'FORGED_LEGACY_TEACHING',()=>assert.deepEqual(compile().learnerObject,learner));
});
const freshness=row=>createXizongReviewedRelationFreshnessResolver({repoRoot:root})(row);
const exactRow={block_id:canonical.blockId,provenance:{knowledge_path:canonical.sourcePath,knowledge_blob_sha:createHash('sha1').update(`blob ${Buffer.byteLength(original)}\0`).update(original).digest('hex')}};
check('exact current relation remains current; historical B1 relation is not revived',()=>{
 assert.equal(freshness(exactRow).status,'CURRENT');
 assert.equal(freshness({...exactRow,provenance:{...exactRow.provenance,knowledge_blob_sha:'8568c5d170be506620b4bbeffb1b6c0a14f18b5d'}}).status,'STALE_REVIEW_WITNESS');
});
for(const [name,mutate] of [
 ['topology',k=>k.logic_groups.reverse()],
 ['qualification',k=>k.exact_items[0].item.scope_note='CHANGED'],
 ['mnemonic',k=>k.exact_items[0].item.mnemonic='CHANGED'],
 ['model provenance',k=>k.model.adopted_source_blob='0'.repeat(40)],
 ['self-certified relocation',k=>k.relocation={legacy_blob_sha:exactRow.provenance.knowledge_blob_sha,semantic_sha256:hash(k)}]
])check(`${name} cannot reuse the current relation witness`,()=>editKnowledge(mutate,()=>assert.equal(freshness(exactRow).status,'STALE_REVIEW_WITNESS')));
check('Core, Source and model byte changes reject the prior exact witness',()=>{
 for(const changed of [original+'\nCHANGED_CORE',original.replace('source_pdf_pages','changed_source_pdf_pages'),original.replace('<!-- b1:node','<!-- changed:node')]){
  assert.notEqual(changed,original);editFile(sourcePath,changed,()=>assert.equal(freshness(exactRow).status,'STALE_REVIEW_WITNESS'));
 }
});
check('revalidated witness never falls back to an older valid witness',()=>{
 assert.equal(freshness({...exactRow,provenance:{...exactRow.provenance,knowledge_revalidated_blob_sha:'f'.repeat(40)}}).status,'STALE_REVIEW_WITNESS');
 assert.equal(freshness({...exactRow,provenance:{...exactRow.provenance,knowledge_path:'missing-owner.md'}}).status,'OWNER_MISSING');
});
check('source relocation preserves evidence and creates no Today debt',()=>{
 const before={...descriptor,sourceHash:'old-content-location'};
 let state=makePreparedMemoryAvailable(createXizongMemoryState(),before);
 state=appendMemoryEvidence(state,{cardId:descriptor.precisionCards[0].id,rating:'known',origin:'SYNTHETIC_OWNER_MIGRATION'},'2026-10-07T00:00:00Z');
 const evidence=JSON.stringify(state.evidence),attention=JSON.stringify(state.attention),beforeToday=JSON.stringify(todayMemoryQueue(state));
 const next=makePreparedMemoryAvailable(state,descriptor);
 assert.equal(JSON.stringify(next.evidence),evidence);assert.equal(JSON.stringify(next.attention),attention);
 assert.equal(JSON.stringify(todayMemoryQueue(next)),beforeToday);
 assert.equal(JSON.stringify(makePreparedMemoryAvailable(next,descriptor)),JSON.stringify(next));
});
console.log(`PASS ${checks.length} canonical B1 owner convergence checks; D8/other Blocks not migrated.`);
