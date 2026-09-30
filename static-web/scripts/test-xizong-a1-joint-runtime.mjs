import fs from 'node:fs';
import assert from 'node:assert/strict';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';
import { reconcileXizongRevision, revisionStatus, compatibleRevisionWitnesses } from '../src/lib/xizongContentRevision.mjs';
import { buildXizongStudyPacketFromStorage } from '../src/lib/xizongStudyPacket.mjs';
import { releaseCompletedBlockToMemory } from '../src/lib/xizongMemoryAutoRelease.mjs';
import { buildXizongChatHandoff, validateXizongChatReturn } from '../src/lib/xizongChatReturn.mjs';
import { captureXizongPrivateCheckpoint, prepareXizongPrivateCheckpointRestore } from '../src/lib/xizongPrivateCheckpoint.mjs';
if(process.argv[2]==='--capture'){
 const blocks=Array.from({length:12},(_,i)=>{const slug='b'+String(i+1).padStart(2,'0'),b=loadXizongBlock('circulation',slug);return {slug,sourcePath:b.sourcePath,sourceHash:b.sourceHash,kpRecords:b.kpRecords,learnerObject:resolveXizongLearnerProjection(b).learnerObject};});
 fs.writeFileSync(process.argv[3],JSON.stringify({evidence:'CANONICAL_ARTIFACT_ONLY_NO_LEARNER_DATA',blocks},null,2)+'\n');console.log('captured 12 A1 Blocks');
}else{
 const load=name=>JSON.parse(fs.readFileSync('.qa/xizong-a1-'+name+'.json','utf8')).blocks;
 const main=load('main'),prior=load('cebac443'),joint=load('joint'),report={evidence:'REAL_A1_CONTENT_SYNTHETIC_LEARNER_STATE_ONLY',checks:[],transitions:[]};
 const check=(ok,name,detail)=>{report.checks.push({name,pass:Boolean(ok),...(ok?{}:{detail})});};
 class Storage {constructor(){this.map=new Map()}get length(){return this.map.size}key(i){return [...this.map.keys()][i]??null}getItem(k){return this.map.get(k)??null}setItem(k,v){this.map.set(k,String(v))}removeItem(k){this.map.delete(k)}}
 const clone=structuredClone;
 const expected={b02:['circulation-b02-kp09'],b07:['circulation-b07-kp01'],b10:['circulation-b10-kp01']};
 function seed(l){return {...reconcileXizongRevision({stage:'kp_recall',kpIndex:Math.min(4,l.kps.length-1),groupIndex:0},l.revisionWitness),schema:'kianos.xizong.block-state.v2',learned:Object.fromEntries(l.kps.map(k=>[k.identity.kpId,true])),ratings:Object.fromEntries(l.kps.map(k=>[k.identity.kpId,'known'])),sourceContactDone:true,sourceContactEvidence:l.logicGroups.map(g=>({segment_id:'source:'+g.identity.logicGroupId,source_hash:l.sourceHash,contact_witness:l.revisionWitness.contact,kp_ids:g.kpIds,completed_at:'2026-09-20T00:00:00Z'})),blockRecallDone:true,blockRecallCompletedAt:'2026-09-20T00:00:00Z',completed:true,completedAt:'2026-09-20T00:00:00Z',ttsxEvidence:{fixture:{completedAt:'historical'}},ttsxAnnotations:{fixture:{note:'synthetic annotation'}}};}
 function packet(storage,l){return buildXizongStudyPacketFromStorage({storage,packetMeta:{objectId:'xizong:'+l.identity.blockId,systemId:'circulation',blockId:l.identity.blockId,canonicalId:'A1',sourceHash:l.sourceHash,revisionWitness:l.revisionWitness},kpRows:l.kps.map(k=>({kpId:k.identity.kpId,groupId:k.identity.logicGroupId,prompt:k.prompt.canonical,sourceLocator:k.source?.locator})),now:Date.parse('2026-09-30')});}
 let count=0;
 for(let i=0;i<12;i++){
 const old=main[i].learnerObject,p=prior[i].learnerObject,n=joint[i].learnerObject,id=n.identity.blockId,slug=joint[i].slug;
 const changed=n.kps.filter((k,j)=>k.prompt.canonical!==p.kps[j].prompt.canonical).map(k=>k.identity.kpId);count+=changed.length;
 const fromMain=reconcileXizongRevision(seed(old),n.revisionWitness),fromPrior=reconcileXizongRevision(seed(p),n.revisionWitness);
 const mainStatus=revisionStatus(fromMain,n.sourceHash),priorStatus=revisionStatus(fromPrior,n.sourceHash);
 report.transitions.push({slug,promptChanged:changed,mainImpactedKp:mainStatus.impacted_kp_ids,mainImpactedGroup:mainStatus.impacted_group_ids,mainBlockReview:mainStatus.block_review_required,mainContactReview:mainStatus.contact_review_required,incrementClassification:priorStatus.status});
 check(compatibleRevisionWitnesses(p.revisionWitness,n.revisionWitness)&&!priorStatus.blocked,slug+' 049e543 is semantically compatible');
 check(JSON.stringify(mainStatus.impacted_kp_ids)===JSON.stringify(expected[slug]||[]),slug+' full stack invalidates exact independently reviewed Core owners',mainStatus);
 check(!mainStatus.impacted_group_ids.length&&!mainStatus.block_review_required&&!mainStatus.contact_review_required,slug+' no unrelated group/Source/Block review');
 for(const key of ['learned','ratings','sourceContactEvidence','completedAt','blockRecallCompletedAt','ttsxEvidence','ttsxAnnotations','kpIndex','resumeKpId'])check(JSON.stringify(fromMain[key])===JSON.stringify(seed(old)[key]),slug+' main historical '+key+' preserved');
 const storage=new Storage(),key='kianos-xizong-astro-v2:xizong:'+id,meta='kianos-xizong-evidence-meta-v1:xizong:'+id;storage.setItem(key,JSON.stringify(seed(p)));storage.setItem('kianos-xizong-personal-v1:xizong:'+id,JSON.stringify({lectureRead:true,kp:{[p.kps[0].identity.kpId]:{comment:'synthetic note',marks:['synthetic mark'],prompt:'synthetic override'}}}));
 storage.setItem(meta,JSON.stringify({version:p.sourceHash,revisionWitness:p.revisionWitness}));
 const oldPacket=packet(storage,p),newPacket=packet(storage,n),h=buildXizongChatHandoff(oldPacket),r={schema:'kianos.xizong.chat_return.v1',handoff_id:h.handoff_id,return_id:'joint-'+slug,origin:h.origin,resume:h.resume,decision:'NO_ACTION',repairs:[]};
 try{validateXizongChatReturn(r,h,newPacket);check(true,slug+' actual Prompt candidate Return stays compatible')}catch(e){check(false,slug+' actual Prompt candidate Return stays compatible',e.message)}
 check(newPacket.kp_evidence.every(k=>k.current_claim==='SUPPORTED'),slug+' Prompt-only Packet keeps current claims');
 const destination=new Storage();destination.setItem(meta,JSON.stringify({version:n.sourceHash,revisionWitness:n.revisionWitness}));check(prepareXizongPrivateCheckpointRestore(destination,captureXizongPrivateCheckpoint(storage)).changes.some(c=>c.key===key),slug+' Prompt-only checkpoint fill stays compatible');
 const initialMemory=releaseCompletedBlockToMemory(null,p,seed(p),{releasedAt:'2026-09-20T00:00:00Z'}).state,refreshed=releaseCompletedBlockToMemory(initialMemory,n,fromPrior,{refreshedAt:'2026-09-30T00:00:00Z'}).state;
 check(Object.values(refreshed.cards).every(c=>!c.contentChangedAt),slug+' Prompt-only Memory adds zero debt');
 const mainMemory=releaseCompletedBlockToMemory(null,old,seed(old),{releasedAt:'2026-09-20T00:00:00Z'}).state,semanticMemory=releaseCompletedBlockToMemory(mainMemory,n,fromMain,{refreshedAt:'2026-09-30T00:00:00Z'}).state;
 const affectedCore=Object.values(semanticMemory.cards).filter(c=>c.family==='CORE'&&c.contentChangedAt).map(c=>c.kpId);
 check(JSON.stringify(affectedCore)===JSON.stringify(expected[slug]||[]),slug+' full stack Memory debt limited to changed Core',affectedCore);
 if(expected[slug]){storage.setItem(key,JSON.stringify(seed(old)));const before=packet(storage,old),mh=buildXizongChatHandoff(before),mr={...r,handoff_id:mh.handoff_id,origin:mh.origin,resume:mh.resume};check(assertThrows(()=>validateXizongChatReturn(mr,mh,packet(storage,n)),/CURRENT_OBJECT_CHANGED/),slug+' Core change rejects stale Return');storage.setItem(meta,JSON.stringify({version:old.sourceHash,revisionWitness:old.revisionWitness}));check(prepareXizongPrivateCheckpointRestore(destination,captureXizongPrivateCheckpoint(storage)).skipped.some(c=>c.key===key&&c.reason==='NATIVE_REVISION_CHANGED'),slug+' Core change rejects stale checkpoint fill');}
 const legacy=seed(old);delete legacy.contentRevision;storage.setItem(key,JSON.stringify(legacy));check(packet(storage,n).kp_evidence.every(k=>k.current_claim==='UNKNOWN'),slug+' legacy raw ratings do not gain current promotion');
 }
 function assertThrows(fn,re){try{fn();return false}catch(e){return re.test(e.message)}}
 check(count===64,'64 Prompt changes independently consumed by current resolver',count);
 report.passed=report.checks.filter(c=>c.pass).length;fs.writeFileSync('.qa/xizong-a1-joint-runtime.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(report.checks.some(c=>!c.pass))process.exitCode=1;
}
