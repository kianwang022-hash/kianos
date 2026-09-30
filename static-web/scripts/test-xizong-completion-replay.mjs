import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';
import { resolveXizongLearnerProjection, loadXizongSystemCompletionRequirements } from '../src/lib/xizongLearnerProjection.mjs';
import { buildXizongRevisionWitness } from '../src/lib/xizongRevisionWitness.mjs';
import { reconcileXizongRevision, revisionStatus, xizongSourceContactCovered } from '../src/lib/xizongContentRevision.mjs';
import { buildXizongStudyPacketFromStorage } from '../src/lib/xizongStudyPacket.mjs';
import { buildXizongChatHandoff, writeXizongChatHandoff, applyXizongChatReturn } from '../src/lib/xizongChatReturn.mjs';
import { inspectXizongBlockCompletion, inspectXizongSystemCompletion } from '../src/lib/xizongMemoryAutoRelease.mjs';

class Storage {
  map = new Map(); writes = 0;
  get length() { return this.map.size; } key(i) { return [...this.map.keys()][i] ?? null; }
  getItem(k) { return this.map.get(k) ?? null; }
  setItem(k,v) { this.map.set(k,String(v)); this.writes++; }
  removeItem(k) { this.map.delete(k); this.writes++; }
}
// Synthetic evidence only. Derive exact identities/coverage from real canonical
// owners; never write canonical files or a live learner/browser store.
function completed(learner) {
  const study = { ...reconcileXizongRevision({}, learner.revisionWitness), sourceHash:learner.sourceHash,
    stage:'kp_recall', kpIndex:0, groupIndex:0, sourceContactDone:true, blockRecallDone:true, completed:true,
    learned:Object.fromEntries(learner.kps.map(k=>[k.identity.kpId,true])),
    ratings:Object.fromEntries(learner.kps.map(k=>[k.identity.kpId,'known'])) };
  const contact=learner.sourceContact, mode=contact.mode;
  const entry=(segment_id,kp_ids,extra={})=>({segment_id,kp_ids,source_hash:learner.sourceHash,contact_witness:learner.revisionWitness.contact,
    visual_reviewed_lg_ids:learner.logicGroups.map(g=>g.identity.logicGroupId),...extra});
  const kpIds=learner.kps.map(k=>k.identity.kpId);
  study.sourceContactEvidence=[];
  if(mode==='NATURAL_SOURCE_UNITS'||mode==='CONSUME_GLOBAL_BIOCHEMISTRY_SOURCE_MAP_CURRENT'||contact.integrationTargetedSourceReturns) {
    for(const segment of contact.segments) study.sourceContactEvidence.push(entry(segment.segmentId,
      segment.kpOrdinals.map(ordinal=>learner.kps.find(k=>k.identity.ordinal===ordinal).identity.kpId),
      mode==='CONSUME_GLOBAL_BIOCHEMISTRY_SOURCE_MAP_CURRENT'?{coverage_kind:'GLOBAL_BIOCHEMISTRY_SOURCE_UNIT',source_unit_id:segment.sourceUnitId,lane_source_hash:contact.sourceLaneHash}:{}));
  }
  if(mode==='INTEGRATION_PRIMARY') study.sourceContactEvidence.push(entry('integration-primary:fixture',kpIds,
    {coverage_kind:contact.integrationTargetedSourceReturns?'INTEGRATION_PRIMARY_DIRECT_RELEASE':'INTEGRATION_PRIMARY_NO_NEW_CONTINUOUS_SOURCE'}));
  else if(!study.sourceContactEvidence.length) study.sourceContactEvidence.push(entry('block-cumulative:fixture',kpIds,
    {coverage_kind:'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION'}));
  return study;
}

const samples=[['circulation','b01'],['digestive-metabolic-endocrine-tumor','m02'],['reproductive-breast','sr01'],['neuro-sensory-motor-orthopedics','n11'],['remaining-clinical','f09']];
const results=[];
// Non-contiguous members are independent of array order and Source segmentation.
const memberFixture={sourceHash:'fixture',sourceContact:{mode:'NATURAL_SOURCE_UNITS',segments:[{segmentId:'s1',kpOrdinals:[1,3]},{segmentId:'s2',kpOrdinals:[2]}]},
  kps:[{kpId:'a',ordinal:1},{kpId:'b',ordinal:2},{kpId:'c',ordinal:3}],logicGroups:[]};
const memberStudy={sourceContactDone:true,learned:{a:true,b:true,c:true},sourceContactEvidence:[{segment_id:'s1',source_hash:'fixture',kp_ids:['c','a']},{segment_id:'s2',source_hash:'fixture',kp_ids:['b']}]};
assert.equal(xizongSourceContactCovered(memberStudy,memberFixture),true);
assert.equal(xizongSourceContactCovered({...memberStudy,sourceContactEvidence:[{...memberStudy.sourceContactEvidence[0],kp_ids:['a']},memberStudy.sourceContactEvidence[1]]},memberFixture),false);
const groupFixture={...memberFixture,sourceContact:{logicGroupIsAutomaticSourceChunk:true}};
assert.equal(xizongSourceContactCovered(memberStudy,groupFixture),true);
assert.equal(xizongSourceContactCovered({...memberStudy,sourceContactDone:false},groupFixture),false);

for(const [system,slug] of samples) {
  const learner=resolveXizongLearnerProjection(loadXizongBlock(system,slug)).learnerObject;
  const study=completed(learner), before=JSON.stringify(study);
  assert.equal(inspectXizongBlockCompletion(learner,study).complete,true,system+': exact Source coverage');
  assert.equal(inspectXizongBlockCompletion(learner,{...study,sourceContactDone:false}).complete,false,system+': explicit false');
  assert.equal(inspectXizongBlockCompletion(learner,{...study,sourceContactEvidence:[]}).complete,false,system+': missing coverage');
  const unrelated=structuredClone(study);unrelated.sourceContactEvidence.forEach(row=>row.kp_ids=['not-an-owned-kp']);
  assert.equal(inspectXizongBlockCompletion(learner,unrelated).complete,false,system+': segment name alone is not coverage');
  if(learner.sourceContact.mode === 'CONSUME_GLOBAL_BIOCHEMISTRY_SOURCE_MAP_CURRENT') {
    const stale=structuredClone(study);stale.sourceContactEvidence.forEach(row=>row.lane_source_hash='another-edition');
    assert.equal(inspectXizongBlockCompletion(learner,stale).complete,false,'global lane binding retained');
  }
  const changed=structuredClone(learner);changed.sourceHash+='-synthetic-medical';changed.kps[0].core.markdown+='\nSYNTHETIC_FACT_CHANGE';changed.revisionWitness=buildXizongRevisionWitness(changed);
  assert.equal(inspectXizongBlockCompletion(changed,study).complete,false,'unvisited Current semantic change');
  const prompt=structuredClone(learner);prompt.sourceHash+='-synthetic-prompt';prompt.kps[0].prompt.canonical+=' synthetic retrieval';prompt.revisionWitness=buildXizongRevisionWitness(prompt);
  assert.equal(inspectXizongBlockCompletion(prompt,study).complete,true,'compatible Prompt retains completion');
  assert.equal(JSON.stringify(study),before,'all inspectors leave old bytes/history untouched');
  if(learner.sourceContact.mode==='NATURAL_SOURCE_UNITS') {
    const removed=structuredClone(study);removed.sourceContactEvidence.shift();
    assert.equal(inspectXizongBlockCompletion(learner,removed).complete,false,'zero-KP orientation unit still requires contact');
  }
  results.push({system,mode:learner.sourceContact.mode,slug});
}

const learner=resolveXizongLearnerProjection(loadXizongBlock('circulation','b01')).learnerObject, study=completed(learner);
const storage=new Storage(), objectId='xizong:'+learner.identity.blockId;
storage.setItem('kianos-xizong-astro-v2:'+objectId,JSON.stringify(study));
const options={storage,packetMeta:{objectId,systemId:'circulation',blockId:learner.identity.blockId,sourceHash:learner.sourceHash,revisionWitness:learner.revisionWitness},
  kpRows:learner.kps.map(k=>({kpId:k.identity.kpId,groupId:k.identity.logicGroupId,sourceLocator:k.source.locator}))};
const packet=buildXizongStudyPacketFromStorage(options), handoff=buildXizongChatHandoff(packet,{returnHref:'/xizong/circulation/b01/',makeId:()=> 'native-reexport'});
writeXizongChatHandoff(storage,handoff);
const ret={schema:'kianos.xizong.chat_return.v1',return_id:'native-reexport-return',handoff_id:handoff.handoff_id,origin:handoff.origin,resume:handoff.resume,
  decision:'REPAIR',repairs:[{kp_id:learner.kps[0].identity.kpId,reason:'synthetic',action:'synthetic',priority:'normal',source_question_ids:[]}]};
for(const failAt of [1,2,3]) {
  const partial=new Storage();writeXizongChatHandoff(partial,handoff);const prior=JSON.stringify([...partial.map]);let count=0;
  const nativeSet=partial.setItem.bind(partial);partial.setItem=(key,raw)=>{if(++count===failAt)throw Error('SYNTHETIC_QUOTA');nativeSet(key,raw);};
  assert.throws(()=>applyXizongChatReturn(partial,ret,{currentPacket:packet}),/SYNTHETIC_QUOTA/);
  assert.equal(JSON.stringify([...partial.map]),prior,'inbox, Memory and new receipt witness roll back together');
}
assert.equal(applyXizongChatReturn(storage,ret,{currentPacket:packet}).status,'applied');
const fresh=buildXizongStudyPacketFromStorage(options), snapshot=JSON.stringify([...storage.map]), writes=storage.writes;
assert.equal(applyXizongChatReturn(storage,ret,{currentPacket:fresh}).status,'already_applied','actual regenerated Packet replay');
assert.equal(storage.writes,writes);assert.equal(JSON.stringify([...storage.map]),snapshot,'replay is read-only');
assert.throws(()=>applyXizongChatReturn(storage,{...ret,note:'conflict'},{currentPacket:fresh}),/RETURN_CONFLICT/);
assert.throws(()=>applyXizongChatReturn(storage,{...ret,origin:{...ret.origin,block_id:'foreign'}},{currentPacket:fresh}),/ORIGIN_MISMATCH/);
const evidence=structuredClone(fresh);evidence.learning_state.recall_ratings[learner.kps[0].identity.kpId]='mastered';
assert.throws(()=>applyXizongChatReturn(storage,ret,{currentPacket:evidence}),/STALE_EVIDENCE/,'later learner writes stay guarded');
const semantic=structuredClone(fresh);semantic.current.revision_witness.kps[learner.kps[0].identity.kpId]='changed';
assert.throws(()=>applyXizongChatReturn(storage,ret,{currentPacket:semantic}),/CURRENT_OBJECT_CHANGED/);

const system=loadXizongSystem('circulation'), requirements=loadXizongSystemCompletionRequirements(system,[learner.identity.blockId]);
assert.equal(requirements.length,1);assert.ok(!JSON.stringify(requirements).includes('core'),'identity requirements do not ship Core');
assert.equal(inspectXizongSystemCompletion(requirements,storage).complete,true);
const changed=structuredClone(learner);changed.kps[0].core.markdown+='\nSYNTHETIC_MEDICAL_CHANGE';changed.revisionWitness=buildXizongRevisionWitness(changed);
const stage=fs.readFileSync(new URL('../src/components/XizongRuntimeStageGuard.astro',import.meta.url),'utf8');
const owner=stage.slice(stage.indexOf('  const missingPrerequisites ='),stage.indexOf('  // Free navigation'));
const missing=vm.runInNewContext(owner+';missingPrerequisites();',{blockPrerequisites:[{blockId:learner.identity.blockId,requirement:changed}],readBlockState:()=>study,inspectXizongBlockCompletion});
assert.equal(missing.length,1,'actual stage guard recomputes unseen prerequisite');
const legacy=structuredClone(study);delete legacy.contentRevision;delete legacy.sourceContactDone;delete legacy.sourceContactEvidence;
const legacyBefore=JSON.stringify(legacy), legacyCheck=inspectXizongBlockCompletion(learner,legacy);
assert.equal(legacyCheck.complete,true,'legacy continuation retained');assert.equal(legacyCheck.currentClaim,'UNKNOWN');
assert.equal(revisionStatus(legacy,learner.sourceHash,learner.revisionWitness).current_claim,'UNKNOWN');assert.equal(JSON.stringify(legacy),legacyBefore);
console.log(JSON.stringify({ok:true,synthetic_only:true,source_modes:results,regenerated_return_readonly:true,unvisited_prerequisite_blocked:true,legacy_unknown_preserved:true}));
