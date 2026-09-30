import assert from 'node:assert/strict';
import {captureSharedControlCheckpoint} from '../src/lib/sharedControlCheckpoint.mjs';
import {buildPrivateLearnerCheckpoint} from '../src/lib/privateLearnerCheckpoint.mjs';
import {saveSharedControlToPrivate,restorePrivateCheckpointGroupsFromDurable,rebasePrivateCheckpointLineageToCurrent} from '../src/lib/privateCheckpointRuntime.mjs';
import {buildDailyLearningPacketFromPrivateCheckpoint} from './privateDailyLearningPacket.mjs';
import {EXAM_PROFILE_KEY,emptyExamProfile} from '../src/lib/examOrchestrator.mjs';
import {STUDY_TIMER_LEDGER_KEY,STUDY_TIMER_STATE_KEY,STUDY_TIMER_SCHEMA,emptyStudyTimerState} from '../src/lib/studyTimer.mjs';
import {CONTROL_LOCAL_RECEIPT_KEY,CONTROL_RECEIPT_SCHEMA} from '../src/lib/privateControlCommand.mjs';
class Storage{map=new Map();get length(){return this.map.size;}key(i){return [...this.map.keys()][i]??null;}getItem(k){return this.map.get(k)??null;}setItem(k,v){this.map.set(k,String(v));}removeItem(k){this.map.delete(k);}}
const now=Date.parse('2026-09-30T01:00:00Z'),day='2026-09-30';
function source(){const s=new Storage();s.setItem(EXAM_PROFILE_KEY,JSON.stringify({...emptyExamProfile(),defaultDailyMinutes:300}));s.setItem(STUDY_TIMER_STATE_KEY,JSON.stringify(emptyStudyTimerState()));s.setItem(STUDY_TIMER_LEDGER_KEY,JSON.stringify({schema:STUDY_TIMER_SCHEMA,sessions:[{id:'known-time',subject:'english',startedAt:now-60000,endedAt:now}]}));s.setItem(CONTROL_LOCAL_RECEIPT_KEY,JSON.stringify({schema:CONTROL_RECEIPT_SCHEMA,command_id:'recovery-consumer-001',command_hash:'a'.repeat(64),status:'APPLIED',observed_at:new Date(now).toISOString()}));return s;}
const shared=captureSharedControlCheckpoint(source(),{studyDay:day,now});
const wrap=value=>buildPrivateLearnerCheckpoint({studyDay:day,now,shared:value,subjects:{}});
const healthy=wrap(shared);
for(const recover of [restorePrivateCheckpointGroupsFromDurable,rebasePrivateCheckpointLineageToCurrent]){
 const s=source();s.setItem(EXAM_PROFILE_KEY,JSON.stringify({...emptyExamProfile(),defaultDailyMinutes:200}));let durable;
 const saved=await saveSharedControlToPrivate(s,{now,readCheckpoint:async()=>({status:'ready',checkpoint:healthy}),writeCheckpoint:async v=>{durable=v;}});
 assert.equal(saved.status,'partial');assert.ok(saved.warnings.some(w=>w.includes('PRIVATE_CHECKPOINT_LOCAL_BASE_CONFLICT')));
 const result=await recover(s,{expectedCheckpointId:durable.checkpoint_id,groupIds:['shared'],readCheckpoint:async()=>({status:'ready',checkpoint:durable})});
 assert.ok(['restored','rebased'].includes(result.status));
 assert.equal(JSON.parse(s.getItem(EXAM_PROFILE_KEY)).defaultDailyMinutes,recover===restorePrivateCheckpointGroupsFromDurable?300:200);
 await assert.rejects(()=>recover(s,{expectedCheckpointId:'wrong-id',groupIds:['shared'],readCheckpoint:async()=>({status:'ready',checkpoint:durable})}),/SOURCE_CHANGED/);
}
console.log('PASS valid conflict can be explicitly resolved by durable-wins or lineage rebase');
const baseline=buildDailyLearningPacketFromPrivateCheckpoint(healthy,{now}).packet;
for(const field of ['exam_profile','study_timer_state','study_timer_ledger']){
 const damaged={...shared,[field]:{schema:'unsupported.v0',keep:'original'}};delete damaged.capture_warnings;
 const p=buildDailyLearningPacketFromPrivateCheckpoint(wrap(damaged),{now}).packet;
 assert.equal(p.learner_evidence_basis,null,field+' must not become a valid empty basis');
 assert.equal(p.schedule,null);
 if(field==='exam_profile')assert.equal(p.total_minutes,1,'healthy measured time remains usable despite bad capacity/profile');
 else {assert.equal(p.total_minutes,null);assert.equal(p.timer.running,null);}
 for(const subject of ['xizong','english','politics'])assert.deepEqual(p.subjects[subject].evidence,baseline.subjects[subject].evidence,'independent healthy subject evidence preserved');
}
console.log('PASS legacy field failures remain unknown in actual Packet consumer, healthy scope retained');
