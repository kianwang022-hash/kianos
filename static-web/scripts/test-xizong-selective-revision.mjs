import assert from 'node:assert/strict';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';
import { attachSourceVisualBundles } from '../src/lib/xizongSourceVisualAssets.mjs';
import fs from 'node:fs';
import vm from 'node:vm';
import { marked } from 'marked';
import { projectKpCore } from '../src/lib/xizongProjection.mjs';
import { createHash } from 'node:crypto';
import { buildXizongRevisionWitness, buildXizongSystemRecallWitness } from '../src/lib/xizongRevisionWitness.mjs';
import { reconcileXizongRevision, revisionStatus, revalidateXizongUnit, compatibleRevisionWitnesses } from '../src/lib/xizongContentRevision.mjs';
import { releaseCompletedBlockToMemory as releaseCompiledBlockToMemory, inspectXizongBlockCompletion, hasXizongSystemRecall } from '../src/lib/xizongMemoryAutoRelease.mjs';
import { appendMemoryEvidence, xizongRetentionState } from '../src/lib/xizongMemoryModel.mjs';
import { buildXizongStudyPacketFromStorage } from '../src/lib/xizongStudyPacket.mjs';
import { buildXizongChatHandoff, validateXizongChatReturn } from '../src/lib/xizongChatReturn.mjs';
import { captureXizongPrivateCheckpoint, prepareXizongPrivateCheckpointRestore } from '../src/lib/xizongPrivateCheckpoint.mjs';
import { buildXizongMemoryReleaseDescriptorFromLearnerObject as buildSyntheticDescriptor } from '../src/lib/xizongMemoryRelease.mjs';
// Opaque v1/v2 fixtures exercise the state engine, not compiled Content identity.
// The default public entrypoint is separately tested with native B2/D6/M4/A3B5.
const releaseCompletedBlockToMemory=(memory,learner,study,options={})=>releaseCompiledBlockToMemory(memory,learner,study,{...options,descriptorBuilder:buildSyntheticDescriptor});
class Storage { constructor(v={}) { this.map=new Map(Object.entries(v)); } get length(){return this.map.size} key(i){return [...this.map.keys()][i]??null} getItem(k){return this.map.get(k)??null} setItem(k,v){this.map.set(k,String(v))} removeItem(k){this.map.delete(k)} }
const clone = x=>structuredClone(x);
let count=0;
const check=(value,label)=>{assert.ok(value,label);count++};
const learner={schema:'kianos.xizong.learner_object.v1',objectType:'BLOCK',sourceHash:'v1',identity:{blockId:'audit',systemId:'audit',canonicalId:'AUDIT'},framework:{recallSpine:'model'},sourceContact:{mode:'WHOLE_BLOCK_CUMULATIVE',segments:[]},kps:['a','b','c'].map((id,i)=>({identity:{kpId:id,logicGroupId:i===1?'g2':'g1'},prompt:{canonical:'question'},core:{markdown:'Core '+id,html:'<p>Core '+id+'</p>'},precision:[],visual:[],extension:[],connection:{incoming:[],outgoing:[]},attention:[]})),logicGroups:[{identity:{logicGroupId:'g1'},kpIds:['a','c'],goal:'goal 1',closure:'closure 1'},{identity:{logicGroupId:'g2'},kpIds:['b'],goal:'goal 2',closure:'closure 2'}]};
const withWitness=l=>({...l,revisionWitness:buildXizongRevisionWitness(l)});
const original=withWitness(learner);
const initial={...reconcileXizongRevision({stage:'kp_recall',kpIndex:2,groupIndex:0},original.revisionWitness),learned:{a:true,b:true,c:true},ratings:{a:'known',b:'fuzzy',c:'mastered'},sourceContactDone:true,sourceContactEvidence:[{source_hash:'v1',kp_ids:['a','b','c'],coverage_kind:'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION',segment_id:'block-cumulative:xizong:audit'}],blockRecallDone:true,blockRecallCompletedAt:'2026-09-20T00:00:00Z',completed:true,completedAt:'2026-09-20T00:00:00Z',ttsxEvidence:{t:{completedAt:'past'}},ttsxAnnotations:{t:'private'},pendingTtsx:{key:'pending'}};
const personal={lectureRead:true,kp:{a:{comment:'note',marks:['mark']}}};
for(const mode of ['WHOLE_BLOCK_CUMULATIVE','WHOLE_BLOCK_SOURCE','WHOLE_LOGIC_GROUP','BLOCK_OR_CANONICAL_SOURCE_UNIT','NATURAL_SOURCE_UNIT','NATURAL_SOURCE_UNITS','INTEGRATION_PRIMARY','CONSUME_GLOBAL_BIOCHEMISTRY_SOURCE_MAP_CURRENT']) {
 const before=clone(learner);before.sourceContact.mode=mode;const w=buildXizongRevisionWitness(before);
 const seed={...clone(initial),contentRevision:{...clone(initial.contentRevision),witness:w}};
 const after=clone(before);after.sourceHash='v2';after.kps[0].prompt.canonical='new retrieval';after.kps[0].identity.title='new title';after.kps[0].source={locator:'P2'};
 for(const declaration of ['> **主提示**：changed','> **主提示：** changed','> **主提示：changed**','> **主提示**：changed ｜ **Outline**：P1']) {
  after.kps[0].core.markdown=declaration+'\n\n**Core a**';const next=withWitness(after);const state=reconcileXizongRevision(seed,next.revisionWitness);
  check(!revisionStatus(state,'v2').blocked,mode+' presentation preserves current claim');
  for(const key of ['learned','ratings','sourceContactEvidence','completed','blockRecallDone','ttsxEvidence','ttsxAnnotations','pendingTtsx','kpIndex']) assert.deepEqual(state[key],seed[key],key);
  check(state.sourceHash==='v1','never stamp old evidence new');
 }
}
const prompt=clone(learner);prompt.sourceHash='v2';prompt.kps[0].prompt.canonical='new';const promptL=withWitness(prompt);const preserved=reconcileXizongRevision(initial,promptL.revisionWitness);
check(inspectXizongBlockCompletion(promptL,initial).complete,'nonsemantic completion from unvisited old state');
const semantic=clone(prompt);semantic.sourceHash='v3';semantic.kps[1].core.markdown='medical fact changed';const semanticL=withWitness(semantic);const changed=reconcileXizongRevision(preserved,semanticL.revisionWitness);
assert.deepEqual(revisionStatus(changed,'v3').impacted_kp_ids,['b']);assert.deepEqual(revisionStatus(changed,'v3').impacted_group_ids,[]);count+=2;
check(changed.completed&&changed.ratings.a==='known'&&changed.kpIndex===2,'local semantic preserves completion/history/Resume');
check(!inspectXizongBlockCompletion(semanticL,changed).complete,'changed current claim fails closed');
revalidateXizongUnit(changed,'KP','b');check(!revisionStatus(changed,'v3').blocked,'fresh affected KP clears only its current claim');
const revalidatedAgain=reconcileXizongRevision(changed,{...semanticL.revisionWitness,sourceHash:'v4',kps:{...semanticL.revisionWitness.kps,b:'another-fact'}});revalidateXizongUnit(revalidatedAgain,'KP','b');check(revalidatedAgain.contentRevision.priorRatings.at(-1).sourceHash==='v3','repeated revalidation archives each rating against its actually observed version');
const group=clone(prompt);group.logicGroups[0].closure='new group reasoning';const groupState=reconcileXizongRevision(preserved,buildXizongRevisionWitness(group));assert.deepEqual(revisionStatus(groupState,'v2').impacted_group_ids,['g1']);count++;
for(const family of ['precision','visual','extension','attention']) {const l=clone(prompt);l.kps[2][family]=[{id:'support',answerHtml:'fact changed'}];const s=reconcileXizongRevision(preserved,buildXizongRevisionWitness(l));assert.deepEqual(revisionStatus(s,'v2').impacted_kp_ids,['c']);count++;}
const topo=clone(prompt);topo.kps=[topo.kps[2],topo.kps[0],topo.kps[1]];topo.logicGroups[0].kpIds=['c','a'];const migrated=reconcileXizongRevision(preserved,buildXizongRevisionWitness(topo));check(migrated.kpIndex===0&&migrated.resumeKpId==='c','stable ID Resume through reorder/non-contiguous group');assert.deepEqual(migrated.ratings,initial.ratings);count++;
const legacy=clone(initial);delete legacy.contentRevision;delete legacy.resumeKpId;const unknown=reconcileXizongRevision(legacy,promptL.revisionWitness);check(revisionStatus(unknown,'v2').status==='UNCLASSIFIED_REVISION','no legacy baseline means UNKNOWN');check(inspectXizongBlockCompletion(promptL,unknown).complete,'UNKNOWN does not force whole-Block relearning');
check(unknown.completed&&unknown.ratings.c==='mastered'&&unknown.kpIndex===2,'legacy evidence and index retained');check(revisionStatus(unknown,'v2').legacy_resume.identityStatus==='UNKNOWN'&&unknown.contentRevision.legacyResume.kpIndex===2,'legacy index is preserved without falsely claiming historical stable-ID recovery');check(revisionStatus(reconcileXizongRevision(unknown,{...promptL.revisionWitness,sourceHash:'v3'}),'v3').blocked,'second visit cannot launder UNKNOWN');
const legacyRelease=releaseCompletedBlockToMemory(null,promptL,unknown,{releasedAt:'2026-09-20T00:00:00Z'}).state;
check(xizongRetentionState(legacyRelease,'core:a',Date.parse('2026-09-25')).currentClaim==='UNKNOWN','first Memory release from legacy UNKNOWN cannot promote old study evidence');
check(Object.values(legacyRelease.cards).every(c=>!c.contentChangedAt),'legacy UNKNOWN release creates no blanket content debt');
const memory=releaseCompletedBlockToMemory(null,original,initial,{releasedAt:'2026-09-20T00:00:00Z'}).state;
const refreshed=releaseCompletedBlockToMemory(memory,promptL,preserved,{refreshedAt:'2026-09-21T00:00:00Z'}).state;
check(Object.values(refreshed.cards).every(c=>!c.contentChangedAt),'prompt refresh creates zero Memory content debt');
const medical=releaseCompletedBlockToMemory(refreshed,semanticL,changed,{refreshedAt:'2026-09-22T00:00:00Z'}).state;
check(Boolean(medical.cards['core:b'].contentChangedAt)&&!medical.cards['core:a'].contentChangedAt&&!medical.cards['core:c'].contentChangedAt,'Memory changes only affected card');
check(xizongRetentionState(medical,'core:b',Date.parse('2026-09-25')).currentClaim==='REVALIDATION_REQUIRED','Memory exposes changed current claim separately from raw evidence');
const repeated=clone(semanticL);repeated.sourceHash='v4';repeated.kps[0].prompt.canonical='another prompt';repeated.revisionWitness=buildXizongRevisionWitness(repeated);
const repeatedMemory=releaseCompletedBlockToMemory(medical,repeated,changed,{refreshedAt:'2026-09-23T00:00:00Z'}).state;
check(repeatedMemory.cards['core:b'].contentChangedAt===medical.cards['core:b'].contentChangedAt&&!repeatedMemory.cards['core:a'].contentChangedAt&&!repeatedMemory.cards['core:c'].contentChangedAt,'second revision cannot broaden or restart Memory content debt');
assert.deepEqual(repeatedMemory.evidence,medical.evidence);count++;
const key='kianos-xizong-astro-v2:xizong:audit',metaKey='kianos-xizong-evidence-meta-v1:xizong:audit';
const storage=new Storage({[key]:JSON.stringify(initial),'kianos-xizong-personal-v1:xizong:audit':JSON.stringify(personal)});
const packet=l=>buildXizongStudyPacketFromStorage({storage,packetMeta:{objectId:'xizong:audit',systemId:'audit',blockId:'audit',canonicalId:'AUDIT',sourceHash:l.sourceHash,revisionWitness:l.revisionWitness},kpRows:l.kps.map(k=>({kpId:k.identity.kpId,groupId:k.identity.logicGroupId,prompt:k.prompt.canonical})),now:Date.parse('2026-09-25')});
const beforePacket=packet(original), afterPacket=packet(promptL);const handoff=buildXizongChatHandoff(beforePacket,{now:Date.parse('2026-09-25')});
const returned={return_id:'synthetic-return',schema:'kianos.xizong.chat_return.v1',handoff_id:handoff.handoff_id,origin:handoff.origin,resume:handoff.resume,decision:'NO_ACTION',repairs:[]};
validateXizongChatReturn(returned,handoff,afterPacket);count++;
assert.throws(()=>validateXizongChatReturn(returned,handoff,packet(semanticL)),/CURRENT_OBJECT_CHANGED/);count++;
const changedEvidence=clone(afterPacket);changedEvidence.learning_state.recall_ratings.a='unknown';assert.throws(()=>validateXizongChatReturn(returned,handoff,changedEvidence),/STALE_EVIDENCE/);count++;
storage.setItem(metaKey,JSON.stringify({version:'v1',revisionWitness:original.revisionWitness}));const checkpoint=captureXizongPrivateCheckpoint(storage);
const destination=new Storage({[metaKey]:JSON.stringify({version:'v2',revisionWitness:promptL.revisionWitness})});
check(prepareXizongPrivateCheckpointRestore(destination,checkpoint).changes.some(r=>r.key===key),'checkpoint compatible revision fills only missing state');
destination.setItem(metaKey,JSON.stringify({version:'v3',revisionWitness:semanticL.revisionWitness}));check(prepareXizongPrivateCheckpointRestore(destination,checkpoint).skipped.some(r=>r.key===key&&r.reason==='NATIVE_REVISION_CHANGED'),'checkpoint semantic version protection retained');
destination.setItem(metaKey,JSON.stringify({version:'v1',revisionWitness:semanticL.revisionWitness}));check(prepareXizongPrivateCheckpointRestore(destination,checkpoint).skipped.some(r=>r.key===key&&r.reason==='NATIVE_REVISION_CHANGED'),'same artifact version with changed resolved support still rejects stale checkpoint');
// Segment order and locators are navigation; membership is resolved to stable IDs.
const segments=clone(learner);segments.sourceContact.segments=[{segmentId:'s1',label:'old',pdf:[1],kpOrdinals:[1,3],logicGroupIds:['g1']},{segmentId:'s2',kpOrdinals:[2],logicGroupIds:['g2']}];
const segmentedState={...clone(initial),sourceSegmentIndex:1,resumeSourceSegmentId:'s2',contentRevision:{...clone(initial.contentRevision),witness:buildXizongRevisionWitness(segments)}};
const segmentAfter=clone(segments);segmentAfter.sourceHash='v2';segmentAfter.sourceContact.segments.reverse();segmentAfter.sourceContact.segments[1].label='new locator label';segmentAfter.sourceContact.segments[1].pdf=[8];
const segmentMoved=reconcileXizongRevision(segmentedState,buildXizongRevisionWitness(segmentAfter));
check(segmentMoved.sourceSegmentIndex===0&&!revisionStatus(segmentMoved,'v2').blocked,'segment-only reorder/locator correction preserves contact and stable Resume');
const removed=clone(learner);removed.kps.pop();removed.logicGroups[0].kpIds=['a'];
const removedState=reconcileXizongRevision(initial,buildXizongRevisionWitness(removed));
check(removedState.resumeKpId==='b'&&removedState.ratings.c==='mastered','removed KP retained as history, Resume moves to nearest surviving ID');
const mixed=clone(unknown);revalidateXizongUnit(mixed,'KP','a');storage.setItem(key,JSON.stringify(mixed));
const mixedPacket=packet(promptL);
check(mixedPacket.kp_evidence.find(k=>k.kp_id==='a').current_claim==='SUPPORTED'&&mixedPacket.kp_evidence.find(k=>k.kp_id==='b').current_claim==='UNKNOWN','fresh unit does not promote neighboring UNKNOWN evidence');
check(!revisionStatus(reconcileXizongRevision(unknown,{...promptL.revisionWitness,sourceHash:'later'}),'later').baseline_known,'later observation cannot certify missing legacy baseline');
const systemBefore=buildXizongSystemRecallWitness({sourceHash:'s1',mentalModel:{spine:['A']},systemRecall:{neutral_front:'old'}});
const systemPrompt=buildXizongSystemRecallWitness({sourceHash:'s2',mentalModel:{spine:['A']},systemRecall:{neutral_front:'new'}});
const systemChanged=buildXizongSystemRecallWitness({sourceHash:'s3',mentalModel:{spine:['B']},systemRecall:{neutral_front:'new'}});
const systemStorage=new Storage({'kianos:xizong:system-recall:audit:v1':JSON.stringify({completedAt:'2026-09-20T00:00:00Z',revisionWitness:systemBefore}),'kianos:xizong:system-evidence-meta:audit:v1':JSON.stringify({revisionWitness:systemBefore})});
check(hasXizongSystemRecall(systemStorage,'audit',systemPrompt),'System retrieval prompt preserves Recall');
check(!hasXizongSystemRecall(systemStorage,'audit',systemChanged),'current System model rejects stale Recall even before guard metadata updates');
let legacyMemory=clone(memory);for(const c of Object.values(legacyMemory.cards))delete c.semanticRevision;
legacyMemory=appendMemoryEvidence(legacyMemory,{cardId:'core:a',rating:'mastered'},'2026-09-20T00:00:00Z');
legacyMemory=appendMemoryEvidence(legacyMemory,{cardId:'core:a',rating:'mastered'},'2026-09-23T00:00:00Z');
legacyMemory=releaseCompletedBlockToMemory(legacyMemory,promptL,preserved,{refreshedAt:'2026-09-24T00:00:00Z'}).state;
check(xizongRetentionState(legacyMemory,'core:a',Date.parse('2026-09-25')).currentClaim==='UNKNOWN','legacy Memory evidence does not acquire mastery from a new fingerprint');
const legacyEvidence=clone(legacyMemory.evidence);
legacyMemory=appendMemoryEvidence(legacyMemory,{cardId:'core:a',rating:'mastered'},'2026-09-25T00:00:00Z');
check(xizongRetentionState(legacyMemory,'core:a',Date.parse('2026-09-25')).stabilityStage===1,'fresh Memory revalidation starts current stability without historical inflation');
assert.deepEqual(legacyMemory.evidence.slice(0,-1),legacyEvidence);count++;

// Exact real owner parity across Node requirements and Vite visual attachment.
const actual=loadXizongBlock('circulation','b01');
const native=resolveXizongLearnerProjection(actual).learnerObject;
const rendered=resolveXizongLearnerProjection(actual,{attachVisualBundles:rows=>attachSourceVisualBundles(rows).map(row=>row.source_visual_bundle?({...row,source_visual_bundle:{...row.source_visual_bundle,assets:row.source_visual_bundle.assets.map(a=>({...a,src:'/emitted/'+a.sourceObjectId+'.webp',width:999}))}}):row),enrichBlock:b=>({...b,kpRecords:b.kpRecords.map(k=>({...k,detailHtml:marked.parse(projectKpCore(k.detailMarkdown),{gfm:true})}))})}).learnerObject;
check(compatibleRevisionWitnesses(native.revisionWitness,rendered.revisionWitness),'Node System/Home and rendered Block share medical/visual identity');
const changedCrop=clone(native);const visualGroup=changedCrop.logicGroups.find(g=>g.visual.some(v=>v.sourceVisualBundle));visualGroup.visual.find(v=>v.sourceVisualBundle).sourceVisualBundle.assets[0].sourceCropSha256='changed-source-pixels';
const cropWitness=buildXizongRevisionWitness(changedCrop);
check(native.revisionWitness.groupOrder.filter(id=>native.revisionWitness.groups[id]!==cropWitness.groups[id]).join()===visualGroup.identity.logicGroupId,'changed source crop affects only its actual LG owner');

// Run the actual complete guard scripts against disposable storage. The original
// code is the failure witness; no production/browser profile is read or modified.
// Frozen verbatim from d354e4d852c34ec1bb90681402d68e049f8d635b, not moving HEAD.
const legacyGuardHashes={
 'XizongBlockEvidenceGuard.astro':'00618d1549b04271919fccf62f27fecc3ac70a3a9ab9f39946d714aa7bb797d7',
 'XizongSystemEvidenceGuard.astro':'43e8e99daf176256a2a57f807f16e1383ee5b18e0ded1183b6a2fb99335993d6'
};
for(const name of ['XizongBlockEvidenceGuard.astro','XizongSystemEvidenceGuard.astro']) {
 for(const before of [true,false]) {
  const source=fs.readFileSync(new URL(before?'./fixtures/xizong-revision/d354e4d-'+name:'../src/components/'+name,import.meta.url),'utf8');
  if(before)assert.equal(createHash('sha256').update(source).digest('hex'),legacyGuardHashes[name],'immutable before guard fixture');
  const script=source.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace(/^\s*import[^;]+;/gm,'');
  class Element {constructor(attrs={}){this.attrs=attrs;this.inert=false;this.dataset={}}getAttribute(k){return this.attrs[k]}before(){}setAttribute(){}querySelector(){return null}addEventListener(){}}
  const system=name.includes('System'), guardMeta=system?'kianos:xizong:system-evidence-meta:audit:v1':metaKey;
  const activeKey=system?'kianos:xizong:system-recall:audit:v1':key;
  const local=new Storage({[guardMeta]:'{"version":"old"}',[activeKey]:JSON.stringify(initial)});let initialized,reloads=0;
  const marker=new Element({'data-object-id':'xizong:audit','data-system-id':'audit','data-evidence-version':'new'}),root=new Element();
  vm.runInNewContext(script,{learnerWriterReady:{then(fn){initialized=Promise.resolve().then(fn);return initialized}},HTMLElement:Element,Element,localStorage:local,sessionStorage:new Storage(),XIZONG_MEMORY_STORAGE_KEY:'memory',normalizeXizongMemoryState:x=>({...x,repairTasks:[]}),document:{querySelector:s=>s.includes('evidence-guard')?marker:s.includes('data-evidence-')?{textContent:'[]'}:root,querySelectorAll:()=>[],createElement:()=>new Element()},window:{location:{reload(){reloads++}}},Date,JSON});await initialized;
  check(before ? local.getItem(activeKey)===null&&reloads===1 : local.getItem(activeKey)===JSON.stringify(initial)&&reloads===0, (before?'BEFORE violates policy; ':'AFTER preserves active evidence; ')+name);
 }
}
console.log(JSON.stringify({status:'PASS',checks:count,evidence:'SYNTHETIC_ONLY',before:'Both original guards delete active evidence and reload',after:'Preserves history; semantic/support changes selectively block current claims'},null,2));
