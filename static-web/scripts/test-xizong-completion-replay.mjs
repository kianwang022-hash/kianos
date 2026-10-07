import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';
import { resolveXizongLearnerProjection, loadXizongSystemCompletionRequirements } from '../src/lib/xizongLearnerProjection.mjs';
import { buildXizongRevisionWitness } from '../src/lib/xizongRevisionWitness.mjs';
import { reconcileXizongRevision, revisionStatus, xizongSourceContactCovered, historicalXizongSourceContinuation, sourceContactCompatible, revalidateXizongUnit } from '../src/lib/xizongContentRevision.mjs';
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

const samples=[['circulation','b01'],['digestive-metabolic-endocrine-tumor','d01'],['digestive-metabolic-endocrine-tumor','m02'],['reproductive-breast','sr01'],['neuro-sensory-motor-orthopedics','n11'],['remaining-clinical','f09']];
const results=[];
// Non-contiguous members are independent of array order and Source segmentation.
const memberFixture={sourceHash:'fixture',sourceContact:{mode:'NATURAL_SOURCE_UNITS',segments:[{segmentId:'s1',kpOrdinals:[1,3]},{segmentId:'s2',kpOrdinals:[2]}]},
  kps:[{kpId:'a',ordinal:1},{kpId:'b',ordinal:2},{kpId:'c',ordinal:3}],logicGroups:[]};
const memberStudy={sourceContactDone:true,learned:{a:true,b:true,c:true},sourceContactEvidence:[{segment_id:'s1',source_hash:'fixture',kp_ids:['c','a']},{segment_id:'s2',source_hash:'fixture',kp_ids:['b']}]};
assert.equal(xizongSourceContactCovered(memberStudy,memberFixture),true);
assert.equal(xizongSourceContactCovered({...memberStudy,sourceContactEvidence:[{...memberStudy.sourceContactEvidence[0],kp_ids:['a']},memberStudy.sourceContactEvidence[1]]},memberFixture),false);
const groupFixture={...memberFixture,sourceContact:{logicGroupIsAutomaticSourceChunk:true}};
assert.equal(xizongSourceContactCovered(memberStudy,groupFixture),true);
assert.equal(xizongSourceContactCovered({...memberStudy,sourceContactDone:false},groupFixture),true,'whole-LG records own coverage, not cumulative flag');

for(const [system,slug] of samples) {
  const learner=resolveXizongLearnerProjection(loadXizongBlock(system,slug)).learnerObject;
  const study=completed(learner), before=JSON.stringify(study);
  assert.equal(inspectXizongBlockCompletion(learner,study).complete,true,system+': exact Source coverage');
  assert.equal(inspectXizongBlockCompletion(learner,{...study,sourceContactDone:false}).complete,learner.sourceContact.logicGroupIsAutomaticSourceChunk===true,system+': mode-specific false');
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
  const [requirement]=loadXizongSystemCompletionRequirements(loadXizongSystem(system),[learner.identity.blockId]);
  assert.deepEqual(requirement.sourceContact,learner.sourceContact,'requirements use formal resolved Source owner');
  assert.equal(inspectXizongBlockCompletion(requirement,study).complete,true,'actual requirements positive');
  const noContact={...study,sourceContactEvidence:[]};
  assert.equal(inspectXizongBlockCompletion(requirement,noContact).complete,false,'actual requirements missing coverage');
  const reqStorage={getItem:()=>JSON.stringify(noContact)};
  assert.equal(inspectXizongSystemCompletion([requirement],reqStorage).complete,false,'System consumer missing coverage');
  const guardSource=fs.readFileSync(new URL('../src/components/XizongRuntimeStageGuard.astro',import.meta.url),'utf8');
  const guardOwner=guardSource.slice(guardSource.indexOf('  const missingPrerequisites ='),guardSource.indexOf('  // Free navigation'));
  const reqMissing=vm.runInNewContext(guardOwner+';missingPrerequisites();',{blockPrerequisites:[{blockId:learner.identity.blockId,requirement}],readBlockState:()=>noContact,inspectXizongBlockCompletion});
  assert.equal(reqMissing.length,1,'actual prerequisite consumer missing coverage');
  const legacyReq=structuredClone(study);delete legacyReq.contentRevision;delete legacyReq.sourceContactDone;delete legacyReq.sourceContactEvidence;
  assert.equal(inspectXizongBlockCompletion(requirement,legacyReq).complete,true,'actual requirements historical continuation');
  assert.equal(inspectXizongBlockCompletion(requirement,legacyReq).currentClaim,'UNKNOWN');
  results.push({system,mode:learner.sourceContact.mode,slug,actualRequirementsSourceBound:true,systemMissingCoverageBlocked:true,prerequisiteMissingCoverageBlocked:true});
}

// Freeze the actual old producer: CI shallow clones need no moving HEAD/history.
const frozen=JSON.parse(fs.readFileSync(new URL('./fixtures/xizong-legacy-source-producer-14a6.json',import.meta.url),'utf8'));
const groupLearner=resolveXizongLearnerProjection(loadXizongBlock('digestive-metabolic-endocrine-tumor','d01')).learnerObject;
assert.equal(groupLearner.sourceContact.logicGroupIsAutomaticSourceChunk,true,'real whole-LG owner');
const producerState=completed(groupLearner);producerState.sourceContactEvidence=[];producerState.sourceContactDone=false;
const producerGroups=groupLearner.logicGroups.map(group=>({...group,groupId:group.identity.logicGroupId}));let groupIndex=0,handler;
vm.runInNewContext(frozen.sourceContactProducer+frozen.coverage+frozen.groupContactHandler+';for(groupIndex=0;groupIndex<groups.length;groupIndex++) handler();',{
 state:producerState,revisionWitness:groupLearner.revisionWitness,currentSourceHash:groupLearner.sourceHash,sourceContactMode:groupLearner.sourceContact.mode,
 sourceContactCompatible,revalidateXizongUnit,objectId:'fixture',sourcePerGroup:true,biochemistrySource:null,integrationPrimary:false,naturalSourceUnits:false,
 sourceSegments:[],kpData:groupLearner.kps.map(k=>({kpId:k.identity.kpId})),totalKp:groupLearner.kps.length,groups:producerGroups,
 get groupIndex(){return groupIndex;},set groupIndex(i){groupIndex=i;},root:{querySelector:()=>({addEventListener:(event,cb)=>handler=cb})},
 get handler(){return handler;},currentGroup:()=>producerGroups[groupIndex],groupVisualGapReviewableFromOriginalSource:()=>true,
 firstUnrecalledIndexForGroup:()=>0,ttsxRowsForGroup:()=>[],queueTtsx:()=>false,save:()=>{},setStage:()=>{}
});
assert.equal(producerState.sourceContactDone,false,'actual 14a6 producer leaves false after full group contact');
assert.equal(inspectXizongBlockCompletion(groupLearner,producerState).complete,true,'real full contact history remains qualified');
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

const compatibleStorage=new Storage();compatibleStorage.setItem('kianos-xizong-astro-v2:'+objectId,JSON.stringify(study));
const oldOptions={...options,storage:compatibleStorage},oldPacket=buildXizongStudyPacketFromStorage(oldOptions);
const oldHandoff=buildXizongChatHandoff(oldPacket,{returnHref:'/xizong/circulation/b01/',makeId:()=> 'compatible-reexport'});writeXizongChatHandoff(compatibleStorage,oldHandoff);
const revised=structuredClone(learner);revised.sourceHash+='-prompt-only';revised.kps[0].prompt.canonical+=' retrieval-only';revised.revisionWitness=buildXizongRevisionWitness(revised);
const revisedOptions={...oldOptions,packetMeta:{...oldOptions.packetMeta,sourceHash:revised.sourceHash,revisionWitness:revised.revisionWitness}};
const revisedPacket=buildXizongStudyPacketFromStorage(revisedOptions),compatibleReturn={...ret,handoff_id:oldHandoff.handoff_id,origin:oldHandoff.origin,resume:oldHandoff.resume};
assert.equal(applyXizongChatReturn(compatibleStorage,compatibleReturn,{currentPacket:revisedPacket}).status,'applied');
const regenerated=buildXizongStudyPacketFromStorage(revisedOptions),compatibleBytes=JSON.stringify([...compatibleStorage.map]),compatibleWrites=compatibleStorage.writes;
assert.equal(applyXizongChatReturn(compatibleStorage,compatibleReturn,{currentPacket:regenerated}).status,'already_applied','V1 handoff/V2 compatible native Packet replay');
assert.equal(compatibleStorage.writes,compatibleWrites);assert.equal(JSON.stringify([...compatibleStorage.map]),compatibleBytes);
const changedAfterReturn=structuredClone(regenerated);changedAfterReturn.learning_state.recall_ratings[learner.kps[0].identity.kpId]='mastered';
assert.throws(()=>applyXizongChatReturn(compatibleStorage,compatibleReturn,{currentPacket:changedAfterReturn}),/STALE_EVIDENCE/);
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
// Actual old visit-time inference must not make the same history unusable.
const visited=structuredClone(legacy);
vm.runInNewContext(frozen.legacyFlagInitialization,{state:visited,kpData:learner.kps.map(k=>({kpId:k.identity.kpId})),sourcePerGroup:false,totalKp:learner.kps.length});
assert.equal(visited.sourceContactDone,true,'frozen producer inference reproduced');
for(const row of [legacy,visited]) {
 const before=JSON.stringify(row),check=inspectXizongBlockCompletion(requirements[0],row);
 assert.equal(check.complete,true);assert.equal(check.currentClaim,'UNKNOWN');assert.equal(JSON.stringify(row),before);
 assert.equal(historicalXizongSourceContinuation(reconcileXizongRevision(row,learner.revisionWitness)),true);
}
const currentV6=fs.readFileSync(new URL('../src/components/XizongBlockV6.astro',import.meta.url),'utf8');
assert.ok(!currentV6.includes('state.sourceContactDone = !sourcePerGroup'),'visiting legacy cannot manufacture contact from learned count');
// Execute the actual first-mount routing prefix through its real persistence
// boundary. Completion alone does not prove that Resume survives mounting.
const recallEntry=currentV6.match(/    const isPostChatRecall = [^\n]+;/)?.[0];
assert.ok(recallEntry,'routing fixture includes the actual post-Chat navigation helper');
const routing=recallEntry+'\n'+currentV6.slice(currentV6.indexOf('    const setStage ='),currentV6.indexOf('      stages.forEach',currentV6.indexOf('    const setStage =')))+'    };';
function route(saved,requested='kp_recall',mode={}) {
 const state=reconcileXizongRevision(structuredClone(saved),learner.revisionWitness),writes=[];
 vm.runInNewContext(routing+';setStage(requested);',{
  state,requested,root:{dataset:{}},historicalXizongSourceContinuation,postChatRecallAvailable:false,bPostChatReferenceBlock:false,
  biochemistrySource:null,segmentedSourceUnits:false,integrationPrimary:false,
  naturalSourceUnits:false,sourcePerGroup:false,pendingTtsxIsReviewed:()=>false,
  save:()=>{writes.push(state.stage);return true;},...mode
 });
 return {state,writes};
}
for(const requested of ['kp_recall','kp_learn','logic_group']) {
 const mounted=route(legacy,requested);
 assert.equal(mounted.state.stage,'kp_recall','actual mount retains historical Recall continuation');
 assert.deepEqual(mounted.writes,['kp_recall']);assert.equal(mounted.state.sourceContactDone,undefined);
 assert.deepEqual(mounted.state.ratings,legacy.ratings);assert.deepEqual(mounted.state.learned,legacy.learned);
 assert.equal(revisionStatus(mounted.state,learner.sourceHash,learner.revisionWitness).current_claim,'UNKNOWN');
}
assert.equal(route({...study,sourceContactDone:false,sourceContactEvidence:[]}).state.stage,'source_contact','known current missing Source still routes to Source');
assert.equal(route({...legacy,completed:false}).state.stage,'source_contact','unfinished legacy cannot bypass Source');
assert.equal(route(legacy,'source_contact',{sourcePerGroup:true}).state.stage,'kp_learn','whole-LG explicit Source return normalizes to its rendered panel');
const bReturn=route({...legacy,recallEntryMode:'POST_CHAT_RECALL'},'source_contact',{bPostChatReferenceBlock:true,sourcePerGroup:true,modelReadiness:null,requiredModelsReady:()=>true,heldGatesFor:()=>[],currentGroup:()=>null,independentReadinessGates:[]});
assert.equal(bReturn.state.stage,'kp_learn');assert.equal(bReturn.state.recallEntryMode,undefined,'B Source return clears only post-Chat navigation permission');
assert.deepEqual(bReturn.state.ratings,legacy.ratings);assert.deepEqual(bReturn.state.learned,legacy.learned);
const sourceView=route(legacy,'source_contact',{sourcePerGroup:true}).state;
const sourceReload=route(sourceView,sourceView.stage,{sourcePerGroup:true});
assert.equal(sourceReload.state.stage,'kp_learn','explicit whole-LG Source-view Resume is idempotent');
assert.equal(sourceReload.state.sourceContactDone,undefined);
assert.deepEqual(sourceReload.state.ratings,legacy.ratings);

assert.equal(route(legacy,'source_contact',{integrationPrimary:true,integrationTargetedSourceReturns:false}).state.stage,'kp_recall','direct integration has no Source panel and must not synthesize contact');


console.log(JSON.stringify({ok:true,synthetic_only:true,source_modes:results,regenerated_return_readonly:true,unvisited_prerequisite_blocked:true,legacy_unknown_preserved:true}));
