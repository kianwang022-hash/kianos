import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import {
  buildEnglishEvidencePacket,
  buildEnglishPerformanceProfile,
  boundedEnglishAttemptInventory,
  ENGLISH_PACKET_RECENT_PER_TASK
} from '../src/lib/englishSessionControl.mjs';

class MemoryStorage {
  constructor(entries={}){this.map=new Map(Object.entries(entries));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(String(k),String(v));}
  removeItem(k){this.map.delete(String(k));}
}

const day='2026-09-20';
const TASKS=[
  ['reading_a','kianos-reading-attempt-v1:','objective'],
  ['cloze','kianos-cloze-attempt-v1:','objective'],
  ['reading_b','kianos-reading-b-attempt-v1:','objective'],
  ['external_reading','kianos-english-external-reading-attempt-v1:','external'],
  ['translation','kianos-translation-attempt-v2:','translation'],
  ['writing','kianos-writing-runtime-v1:','writing']
];
const PART_B_FORMS=['gap_match','ordering','heading_match','comment_match'];

const entries={};
let serial=0;
for(const [task,prefix,kind] of TASKS){
  for(let i=0;i<120;i+=1){
    serial+=1;
    const objectId=`${task}-fixture-${String(i).padStart(3,'0')}`;
    const started=Date.parse('2026-09-01T00:00:00.000Z')+serial*60000;
    const exposed=i%7===0;
    const assisted=i%11===0;
    const uncalibrated=i%5===0;
    const over=i%9===0;
    const budget=task==='writing'?2400:task==='translation'?1500:task==='reading_a'?1200:task==='cloze'?900:task==='reading_b'?900:1800;
    const elapsed=task==='writing'?1500+i:task==='translation'?900+i:300+i;
    const timingStatus=uncalibrated?'uncalibrated':(over?'budget_exceeded':'within_explicit_budget');
    const independent=!exposed&&!assisted&&timingStatus!=='budget_exceeded';
    const binding={
      task,
      object_id:objectId,
      source_hash:`hash-${task}-${i}`,
      attempt_id:`attempt-${task}-${i}`,
      prior_exposure:exposed?'exposed':(i%13===0?'unknown':'unseen'),
      assistance:assisted?'assisted':'unassisted',
      revision:1,
      source_snapshot:task==='reading_b'?{context:{taskForm:PART_B_FORMS[i%PART_B_FORMS.length]}}:{}
    };
    const firstEvidenceMeta={
      attempt_id:binding.attempt_id,
      source_hash:binding.source_hash,
      prior_exposure:binding.prior_exposure,
      assistance:binding.assistance,
      legacy_unversioned:false,
      time_budget_seconds:uncalibrated?null:budget,
      elapsed_seconds:elapsed,
      timing_status:timingStatus,
      independent_transfer_candidate:independent
    };
    let value;
    if(kind==='objective'){
      value={
        binding,
        submitted:true,
        reviewResolved:i%3===0,
        results:{q1:i%4===0?'wrong':'correct',q2:'correct'},
        uncertain:i%6===0?['q2']:[],
        firstEvidenceMeta,
        startedAt:new Date(started).toISOString(),
        submittedAt:new Date(started+elapsed*1000).toISOString(),
        saved_at:new Date(started+elapsed*1000+1000).toISOString()
      };
    } else if(kind==='external'){
      value={
        binding,
        submitted:true,
        stage:'completed',
        results:{q1:i%4===0?'wrong':'correct'},
        uncertain:i%6===0?['q1']:[],
        firstEvidenceMeta,
        startedAt:new Date(started).toISOString(),
        submittedAt:new Date(started+elapsed*1000).toISOString(),
        saved_at:new Date(started+elapsed*1000+1000).toISOString()
      };
    } else if(kind==='translation'){
      value={
        binding,
        stage:i%4===0?'repaired':'passed',
        firstAttempts:{s1:'fixture'},
        firstEvidenceMeta,
        createdAt:new Date(started).toISOString(),
        firstSubmittedAt:new Date(started+elapsed*1000).toISOString(),
        saved_at:new Date(started+elapsed*1000+1000).toISOString()
      };
    } else {
      value={
        binding,
        state:i%4===0?'REPAIR_COMPLETE':'PASS_ACCEPTABLE',
        firstDraft:'fixture essay',
        firstEvidenceMeta,
        createdAt:new Date(started).toISOString(),
        firstSubmittedAt:new Date(started+elapsed*1000).toISOString(),
        updatedAt:new Date(started+elapsed*1000+1000).toISOString()
      };
    }
    entries[prefix+objectId]=JSON.stringify(value);
  }
}

const storage=new MemoryStorage(entries);
const packet=buildEnglishEvidencePacket(storage,{
  day,
  now:Date.parse('2026-09-20T04:00:00.000Z'),
  catalog:[]
});

assert.equal(packet.schema,'kianos.english.evidence.v1');
assert.equal(packet.inventory_meta.total_attempts,720,'full history count lost');
assert.equal(packet.inventory_meta.recent_per_task_limit,ENGLISH_PACKET_RECENT_PER_TASK);
assert.equal(packet.inventory_meta.included_attempts,ENGLISH_PACKET_RECENT_PER_TASK*6,'bounded per-task inventory size');
assert.equal(packet.inventory.length,48,'inventory not bounded');
assert.equal(packet.inventory_meta.truncated,true);
for(const [task] of TASKS){
  assert.equal(packet.inventory_meta.total_by_task[task],120,`history count missing:${task}`);
  assert.equal(packet.inventory.filter(row=>row.task===task).length,8,`recent task balance missing:${task}`);
}

const profile=packet.performance_profile;
assert.equal(profile.schema,'kianos.english.performance-profile.v1');
assert.equal(profile.total_attempts,720);
assert.equal(profile.recent_attempts_included,48);
assert.equal(profile.truncated,true);
assert.match(profile.semantics,/NOT_MASTERY/);
assert.match(profile.semantics,/NOT_CROSS_TASK_PRIORITY/);
assert.equal(Object.prototype.hasOwnProperty.call(profile,'mastery'),false);
assert.equal(Object.prototype.hasOwnProperty.call(profile,'priority'),false);

assert.equal(profile.tasks.reading_a.role,'EXAM_OBJECTIVE');
assert.equal(profile.tasks.translation.role,'EXAM_PRODUCTIVE');
assert.equal(profile.tasks.writing.role,'EXAM_PRODUCTIVE');
assert.equal(profile.tasks.external_reading.role,'GROWTH_READING');
assert.equal(profile.tasks.reading_a.evidence_shape,'QUESTION_OUTCOME');
assert.equal(profile.tasks.cloze.evidence_shape,'QUESTION_OUTCOME');
assert.equal(profile.tasks.reading_b.evidence_shape,'QUESTION_OUTCOME');
assert.deepEqual(profile.tasks.reading_b.history.form_coverage.covered_forms,PART_B_FORMS);
assert.equal(profile.tasks.reading_b.history.form_coverage.unknown_form_attempts,0);
for(const form of PART_B_FORMS){
  assert.equal(profile.tasks.reading_b.history.form_coverage.by_form[form].attempts,30,`Part B history form count:${form}`);
  assert.equal(profile.tasks.reading_b.recent.form_coverage.by_form[form].attempts,2,`Part B recent form count:${form}`);
}
assert.equal(profile.guardrails.includes('READING_B_AGGREGATE_DOES_NOT_PROVE_FORM_COVERAGE'),true);
assert.equal(packet.inventory.filter(row=>row.task==='reading_b'&&row.task_form).length,8,'Part B recent inventory lost form identity');
assert.equal(profile.tasks.external_reading.evidence_shape,'QUESTION_OUTCOME');
assert.equal(profile.tasks.translation.evidence_shape,'PRODUCTIVE_REPAIR_STATE');
assert.equal(profile.tasks.writing.evidence_shape,'PRODUCTIVE_REPAIR_STATE');
assert.equal(profile.guardrails.includes('WORKFLOW_COMPLETE_IS_NOT_PERFORMANCE_SUCCESS'),true);
assert.equal(Object.prototype.hasOwnProperty.call(profile.tasks.translation.history,'problem_bearing_attempts'),false,
  'Objective problem semantics leaked into Translation');
assert.equal(Object.prototype.hasOwnProperty.call(profile.tasks.writing.history,'problem_bearing_attempts'),false,
  'Objective problem semantics leaked into Writing');
assert.ok(profile.tasks.translation.history.repair_bearing_attempts>0,'Translation repair states missing');
assert.ok(profile.tasks.writing.history.repair_bearing_attempts>0,'Writing repair states missing');

for(const [task] of TASKS){
  const row=profile.tasks[task];
  assert.equal(row.history.attempts,120,`history profile count:${task}`);
  assert.ok(row.history.workflow_complete_attempts>=0,`workflow completion fact missing:${task}`);
  assert.equal(Object.prototype.hasOwnProperty.call(row.history,'complete_attempts'),false,`ambiguous completion field leaked:${task}`);
  assert.equal(row.recent.attempts,8,`recent profile count:${task}`);
  assert.ok(row.history.timing.first_evidence_samples>0,`timing evidence absent:${task}`);
  assert.ok(row.history.exposure.exposed>0,`exposure split absent:${task}`);
  assert.ok(row.history.exposure.unknown>0,`unknown exposure erased:${task}`);
  assert.ok(row.history.assistance.assisted>0,`assisted split absent:${task}`);
  assert.ok(row.history.independent_transfer_candidates<row.history.attempts,`independent transfer overclaimed:${task}`);
}

assert.notEqual(
  profile.tasks.reading_a.history.timing.median_elapsed_seconds,
  profile.tasks.writing.history.timing.median_elapsed_seconds,
  'task-local elapsed timing was collapsed into one cross-task value'
);
assert.equal(
  Object.values(profile.tasks).some(row=>Object.prototype.hasOwnProperty.call(row,'score')),
  false,
  'subject profile invented task scores'
);

const tamperedRows=[
  {
    task:'reading_a',
    object_id:'tampered',
    prior_exposure:'exposed',
    assistance:'assisted',
    complete:true,
    problem_count:0,
    submitted_at:'2026-09-20T01:00:00.000Z',
    first_evidence:{
      independent_transfer_candidate:true,
      timing_status:'within_explicit_budget',
      elapsed_seconds:100,
      time_budget_seconds:1000
    }
  }
];
const tampered=buildEnglishPerformanceProfile(tamperedRows);
assert.equal(
  tampered.tasks.reading_a.history.independent_transfer_candidates,
  0,
  'profile trusted an impossible independent-transfer flag despite exposure/assistance'
);

const uncalibrated=buildEnglishPerformanceProfile([{
  task:'cloze',
  object_id:'uncalibrated',
  prior_exposure:'unseen',
  assistance:'unassisted',
  complete:true,
  problem_count:0,
  submitted_at:'2026-09-20T01:00:00.000Z',
  first_evidence:{
    independent_transfer_candidate:true,
    timing_status:'uncalibrated',
    elapsed_seconds:400,
    time_budget_seconds:null
  }
}]);
assert.equal(uncalibrated.tasks.cloze.history.timing.uncalibrated,1);
assert.equal(uncalibrated.tasks.cloze.history.timing.budget_exceeded,0);
assert.equal(
  uncalibrated.tasks.cloze.history.independent_transfer_candidates,
  1,
  'uncalibrated timing should remain eligible evidence, not be silently treated as too slow'
);

// Familiar / assisted work remains observable history, but must not make the
// default task-local speed estimate look faster than clean unseen work.
const speedContamination = buildEnglishPerformanceProfile([
  {
    task:'reading_a',
    object_id:'seen-fast-1',
    prior_exposure:'exposed',
    assistance:'unassisted',
    complete:true,
    problem_count:0,
    submitted_at:'2026-09-20T01:00:00.000Z',
    first_evidence:{
      timing_status:'within_explicit_budget',
      elapsed_seconds:240,
      time_budget_seconds:1200,
      independent_transfer_candidate:false
    }
  },
  {
    task:'reading_a',
    object_id:'seen-fast-2',
    prior_exposure:'exposed',
    assistance:'unassisted',
    complete:true,
    problem_count:0,
    submitted_at:'2026-09-20T01:10:00.000Z',
    first_evidence:{
      timing_status:'within_explicit_budget',
      elapsed_seconds:300,
      time_budget_seconds:1200,
      independent_transfer_candidate:false
    }
  },
  {
    task:'reading_a',
    object_id:'assisted-fast',
    prior_exposure:'unseen',
    assistance:'assisted',
    complete:true,
    problem_count:0,
    submitted_at:'2026-09-20T01:20:00.000Z',
    first_evidence:{
      timing_status:'within_explicit_budget',
      elapsed_seconds:360,
      time_budget_seconds:1200,
      independent_transfer_candidate:false
    }
  },
  {
    task:'reading_a',
    object_id:'clean-1',
    prior_exposure:'unseen',
    assistance:'unassisted',
    complete:true,
    problem_count:0,
    submitted_at:'2026-09-20T02:00:00.000Z',
    first_evidence:{
      timing_status:'within_explicit_budget',
      elapsed_seconds:900,
      time_budget_seconds:1200,
      independent_transfer_candidate:true
    }
  },
  {
    task:'reading_a',
    object_id:'clean-2',
    prior_exposure:'unseen',
    assistance:'unassisted',
    complete:true,
    problem_count:0,
    submitted_at:'2026-09-20T02:20:00.000Z',
    first_evidence:{
      timing_status:'within_explicit_budget',
      elapsed_seconds:960,
      time_budget_seconds:1200,
      independent_transfer_candidate:true
    }
  },
  {
    task:'reading_a',
    object_id:'clean-3',
    prior_exposure:'unseen',
    assistance:'unassisted',
    complete:true,
    problem_count:0,
    submitted_at:'2026-09-20T02:40:00.000Z',
    first_evidence:{
      timing_status:'within_explicit_budget',
      elapsed_seconds:1020,
      time_budget_seconds:1200,
      independent_transfer_candidate:true
    }
  }
]);
const speed = speedContamination.tasks.reading_a.history;
assert.equal(speed.timing_basis,'UNSEEN_UNASSISTED_ONLY');
assert.equal(speed.timing.first_evidence_samples,3,'clean timing sample contamination');
assert.equal(speed.timing.median_elapsed_seconds,960,'clean timing median was pulled by exposed/assisted work');
assert.equal(speed.timing_all.first_evidence_samples,6,'all timing history was lost');
assert.equal(speed.timing_all.median_elapsed_seconds,630,'all timing observational median unexpected');
assert.ok(
  speed.timing.median_elapsed_seconds > speed.timing_all.median_elapsed_seconds,
  'contaminated fast history did not differ from clean speed'
);

const bounded=boundedEnglishAttemptInventory(
  Array.from({length:50},(_,i)=>({
    task:'reading_a',
    object_id:`r-${i}`,
    updated_at:new Date(Date.parse('2026-09-01T00:00:00Z')+i*1000).toISOString()
  })),
  5
);
assert.equal(bounded.length,5);
assert.equal(bounded[0].object_id,'r-49','recent window ordering');

const fullRows=720;
const payloadBytes=Buffer.byteLength(JSON.stringify(packet),'utf8');
assert.ok(payloadBytes<120000,`bounded packet unexpectedly large:${payloadBytes}`);

// Long-history performance attack: packet bytes are bounded, but runtime must not degrade
// into multi-second scans as private attempt history grows.
const scaleEntries={};
let scaleSerial=0;
const scalePerTask=1200;
for(const [task,prefix,kind] of TASKS){
  for(let i=0;i<scalePerTask;i+=1){
    scaleSerial+=1;
    const objectId=`scale-${task}-${String(i).padStart(4,'0')}`;
    const sourceHash=`scale-hash-${task}-${i}`;
    const attemptId=`scale-attempt-${task}-${i}`;
    const stamp=new Date(Date.parse('2026-08-01T00:00:00.000Z')+scaleSerial*1000).toISOString();
    const binding={
      task,
      object_id:objectId,
      source_hash:sourceHash,
      attempt_id:attemptId,
      prior_exposure:'exposed',
      assistance:'unassisted',
      revision:1,
      source_snapshot:task==='reading_b'
        ? {context:{taskForm:PART_B_FORMS[i%PART_B_FORMS.length]}}
        : (kind==='external'?{completion_requirement:'READ_ONLY_OK'}:{})
    };
    const firstEvidenceMeta={
      attempt_id:attemptId,
      source_hash:sourceHash,
      prior_exposure:'exposed',
      assistance:'unassisted',
      legacy_unversioned:false,
      time_budget_seconds:null,
      elapsed_seconds:600,
      timing_status:'uncalibrated',
      independent_transfer_candidate:false
    };
    let value;
    if(kind==='objective'){
      value={binding,submitted:true,reviewResolved:true,results:{q1:'correct'},uncertain:[],firstEvidenceMeta,submittedAt:stamp,saved_at:stamp};
    }else if(kind==='external'){
      value={binding,submitted:false,stage:'completed',results:{},uncertain:[],firstEvidenceMeta,saved_at:stamp};
    }else if(kind==='translation'){
      value={binding,stage:'passed',firstAttempts:{s1:'fixture'},firstEvidenceMeta,firstSubmittedAt:stamp,saved_at:stamp};
    }else{
      value={binding,state:'PASS_ACCEPTABLE',firstDraft:'fixture',firstEvidenceMeta,firstSubmittedAt:stamp,updatedAt:stamp};
    }
    scaleEntries[prefix+objectId]=JSON.stringify(value);
  }
}
const scaleStorage=new MemoryStorage(scaleEntries);
const scaleStart=performance.now();
const scalePacket=buildEnglishEvidencePacket(scaleStorage,{
  day,
  now:Date.parse('2026-09-20T04:30:00.000Z'),
  catalog:[]
});
const scaleMs=performance.now()-scaleStart;
assert.equal(scalePacket.inventory_meta.total_attempts,scalePerTask*6,'scale-history-count');
assert.equal(scalePacket.inventory.length,48,'scale-packet-unbounded');
assert.ok(scaleMs<500,`english-packet-7200-history-regressed-above-500ms:${scaleMs.toFixed(1)}ms`);

console.log(JSON.stringify({
  ok:true,
  schema:profile.schema,
  full_attempts:fullRows,
  packet_inventory:packet.inventory.length,
  recent_per_task:ENGLISH_PACKET_RECENT_PER_TASK,
  packet_bytes:payloadBytes,
  long_history_attempts:scalePacket.inventory_meta.total_attempts,
  long_history_packet_ms:Math.round(scaleMs*10)/10,
  long_history_fail_line_ms:500,
  task_roles:Object.fromEntries(Object.entries(profile.tasks).map(([task,row])=>[task,row.role])),
  guardrails:profile.guardrails
},null,2));
console.log('PASS English Architecture+ performance profile: bounded packet, task-local timing, no mastery/ranking invention');
