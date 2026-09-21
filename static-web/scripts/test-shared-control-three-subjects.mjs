import assert from 'node:assert/strict';
import {
  CONTROL_BROWSER_SCHEMA,
  CONTROL_COMMAND_SCHEMA,
  CONTROL_LOCAL_RECEIPT_KEY,
  browserControlCommand,
  validateBrowserControlCommand
} from '../src/lib/privateControlCommand.mjs';
import { applyPrivateControlCommand } from '../src/lib/privateControlRuntime.mjs';
import { buildExamChatPlanBasis } from '../src/lib/examChatPlan.mjs';
import {
  POLITICS_MEMORY_PLAN_KEY,
  POLITICS_MEMORY_PLAN_PREFIX,
  stagePoliticsMemoryPlan
} from '../src/lib/politicsMemoryRuntime.mjs';
import { captureXizongPrivateCheckpoint } from '../src/lib/xizongPrivateCheckpoint.mjs';
import { exportPoliticsCheckpoint, validatePoliticsPrivatePayload } from '../src/lib/politicsChatReturn.mjs';
import {
  ENGLISH_EXAM_ANSWER_SCHEMA,
  ENGLISH_EXAM_SESSION_KEY,
  startEnglishExamSession,
  captureEnglishExamStep,
  sealEnglishExamSession,
  releaseEnglishExamObjective,
  englishExamProductiveScoreReturnContract,
  readEnglishExamSession,
  writeEnglishExamSession
} from '../src/lib/englishExamSession.mjs';
import { exportEnglishCheckpoint, inspectEnglishCheckpoint } from '../src/lib/englishLearnerEvidence.mjs';
import { capturePrivateSubjectCheckpoints, restorePrivateSubjectCheckpoints } from '../src/lib/privateSubjectCheckpoints.mjs';

class MemoryStorage {
  constructor(entries={}){this.map=new Map(Object.entries(entries));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(k,String(v));}
  removeItem(k){this.map.delete(k);}
}
if(typeof globalThis.CustomEvent!=='function'){
  globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail;}};
}
globalThis.window={dispatchEvent(){}};
globalThis.fetch=async()=>({ok:true,json:async()=>({}),status:200});

const day='2026-09-20';
const now=Date.parse('2026-09-20T05:00:00+08:00');
const generatedAt='2026-09-19T21:00:00.000Z';

const cardId='core:circulation-b01-kp01';
const memory={
  schema:'kianos.xizong.memory.v1',revision:1,
  releasedBlocks:{'circulation-b01':{
    blockId:'circulation-b01',systemId:'circulation',canonicalId:'A1',
    blockLabel:'B1',blockTitle:'fixture',sourceHash:'direct-source-v1',
    releasedAt:generatedAt,refreshedAt:generatedAt,
    coreCardIds:[cardId],precisionCardIds:[]
  }},
  cards:{[cardId]:{
    id:cardId,family:'CORE',systemId:'circulation',canonicalId:'A1',
    blockId:'circulation-b01',blockLabel:'B1',blockTitle:'fixture',
    logicGroupId:'circulation-b01-lg01',groupLabel:'fixture',
    kpId:'circulation-b01-kp01',displayId:'KP01',title:'fixture',
    promptCanonical:'fixture',coreHtml:'<p>fixture</p>',
    sourceLocator:'P1',sourceHash:'direct-source-v1',releasedAt:generatedAt
  }},
  promptOverrides:{},marks:{},evidence:[],attention:{},repairTasks:[]
};

const xzSession={
  schema:'kianos.xizong.session-instruction.v1',
  session_id:'xz-direct-session',
  study_day:day,
  generated_at:generatedAt,
  current_step:0,
  steps:[{
    step_id:'m1',kind:'MEMORY_REVIEW',label:'回收循环核心机制',
    reason:'shared control transport proof',
    targets:[{card_id:cardId,block_id:'circulation-b01',source_hash:'direct-source-v1'}]
  }]
};
const xzPlan={
  schema:'kianos.exam.chat-plan.v1',study_day:day,generated_at:generatedAt,
  subjects:{
    xizong:{target_minutes:60,role:'主推进',note:'fixture',session_ref:xzSession.session_id},
    english:null,politics:null
  },
  next_subject:'xizong',attention:null
};
const xzCommand={
  schema:CONTROL_BROWSER_SCHEMA,
  command_id:'direct-xizong-001',command_hash:'test-xz',
  study_day:day,generated_at:generatedAt,expires_at:null,
  operations:[
    {kind:'xizong.session',payload:xzSession},
    {kind:'exam.chat_plan',payload:xzPlan}
  ]
};
const xzStorage=new MemoryStorage({'kianos-xizong-memory-v1':JSON.stringify(memory)});
xzPlan.learner_evidence_basis=buildExamChatPlanBasis(xzStorage,day);
const xzResult=await applyPrivateControlCommand(xzStorage,xzCommand,{day,now});
assert.equal(xzResult.status,'applied');
assert.equal(JSON.parse(xzStorage.getItem('kianos:xizong:session-instruction:v1')).session_id,xzSession.session_id);
assert.equal(JSON.parse(xzStorage.getItem('kianos-exam-chat-plan-v1')).subjects.xizong.session_ref,xzSession.session_id);
const xzCheckpoint=captureXizongPrivateCheckpoint(xzStorage,{now});
assert.ok(xzCheckpoint.entries.some(row=>row.key==='kianos:xizong:session-instruction:v1'),'Xizong session must be durable');
assert.ok(xzCheckpoint.entries.some(row=>row.key==='kianos:xizong:session-runtime:v1'),'Xizong session runtime must be durable');

const xzReturnStorage=new MemoryStorage({
  'kianos-xizong-chat-handoff-v1:xz-handoff-return':JSON.stringify({
    schema:'kianos.xizong.chat_handoff.v1',
    handoff_id:'xz-handoff-return',
    created_at:generatedAt,
    origin:{
      object_id:'xizong:circulation-b01',
      system_id:'circulation',
      block_id:'circulation-b01',
      source_hash:'direct-source-v1',
      evidence_version:'ev-fixture'
    },
    resume:{
      current_stage:'kp_recall',group_index:0,logic_group_id:'circulation-b01-lg01',
      kp_index:0,kp_id:'circulation-b01-kp01',source_locator:'P1'
    },
    return_href:'/xizong/circulation/b01/',
    allowed_kp_ids:['circulation-b01-kp01'],
    allowed_question_ids:[]
  })
});
const xzReturn={
  schema:'kianos.xizong.chat_return.v1',
  return_id:'xz-return-direct-001',
  handoff_id:'xz-handoff-return',
  decision:'NO_ACTION',
  repairs:[]
};
const xzReturnPlan={
  schema:'kianos.exam.chat-plan.v1',study_day:day,generated_at:generatedAt,
  subjects:{
    xizong:{target_minutes:30,role:'返回修补',note:'typed Return',session_ref:xzReturn.return_id},
    english:null,politics:null
  },
  next_subject:'xizong',attention:null
};
const xzReturnCommand={
  schema:CONTROL_BROWSER_SCHEMA,
  command_id:'direct-xizong-return-001',command_hash:'test-xz-return',
  study_day:day,generated_at:generatedAt,expires_at:null,
  operations:[
    {kind:'xizong.chat_return',payload:xzReturn},
    {kind:'exam.chat_plan',payload:xzReturnPlan}
  ]
};
xzReturnPlan.learner_evidence_basis=buildExamChatPlanBasis(xzReturnStorage,day);
const xzReturnResult=await applyPrivateControlCommand(xzReturnStorage,xzReturnCommand,{day,now});
assert.equal(xzReturnResult.status,'applied');
const pendingReturn=JSON.parse(xzReturnStorage.getItem('kianos:xizong:pending-chat-return:v1'));
assert.equal(pendingReturn.pending_by_object['xizong:circulation-b01'].return_id,xzReturn.return_id);
assert.equal(JSON.parse(xzReturnStorage.getItem('kianos-exam-chat-plan-v1')).subjects.xizong.session_ref,xzReturn.return_id);

const polMemory={
  schema:'kianos.politics.memory-plan.v1',
  plan_id:'politics-direct-plan',
  study_day:day,
  generated_at:generatedAt,
  catalog_revision:'politics-memory-test-revision',
  phase:'FIRST_ROUND',
  supersedes_plan_id:null,
  items:[{candidate_id:'polmem-fixture',reason:'shared control transport proof'}]
};
const polPlan={
  schema:'kianos.exam.chat-plan.v1',study_day:day,generated_at:generatedAt,
  subjects:{
    xizong:null,english:null,
    politics:{target_minutes:45,role:'推进',note:'今日记忆',session_ref:polMemory.plan_id}
  },
  next_subject:'politics',attention:null
};
const polCommand={
  schema:CONTROL_BROWSER_SCHEMA,
  command_id:'direct-politics-001',command_hash:'test-pol',
  study_day:day,generated_at:generatedAt,expires_at:null,
  operations:[
    {kind:'politics.memory_plan',payload:polMemory},
    {kind:'exam.chat_plan',payload:polPlan}
  ]
};
const polStorage=new MemoryStorage();
polPlan.learner_evidence_basis=buildExamChatPlanBasis(polStorage,day);
const polResult=await applyPrivateControlCommand(polStorage,polCommand,{day,now});
assert.equal(polResult.status,'applied');
assert.equal(JSON.parse(polStorage.getItem(POLITICS_MEMORY_PLAN_KEY)).plan_id,polMemory.plan_id);
assert.equal(JSON.parse(polStorage.getItem('kianos-exam-chat-plan-v1')).subjects.politics.session_ref,polMemory.plan_id);
polStorage.setItem('kianos-politics-memory-evidence-v1',JSON.stringify([{
  schema:'kianos.politics.memory-recall-event.v1',
  event_id:polMemory.plan_id+':polmem-fixture',
  plan_id:polMemory.plan_id,
  study_day:day,
  candidate_id:'polmem-fixture',
  catalog_revision:polMemory.catalog_revision,
  candidate_snapshot:{
    id:'polmem-fixture',subject:'xi',chapter_id:'fixture',natural_unit_id:null,
    family:'ACTIVE_PRECISION',prompt:'fixture',answer_items:['fixture answer'],
    source_refs:['fixture-source'],source_role:'CURRENT_REVIEWED'
  },
  response:'FUZZY',
  observed_at:new Date(now).toISOString()
}]));
const politicsCheckpoint=exportPoliticsCheckpoint(polStorage);
const politicsEntries=new Map(validatePoliticsPrivatePayload(politicsCheckpoint));
assert.ok(politicsEntries.has(POLITICS_MEMORY_PLAN_KEY),'Politics Memory plan must be durable');
assert.ok(politicsEntries.has('kianos-politics-memory-evidence-v1'),'Politics Memory recall evidence must be durable');


const stalePoliticsPlan={
  ...polMemory,
  plan_id:'politics-yesterday-plan',
  study_day:'2026-09-19',
  generated_at:'2026-09-18T21:00:00.000Z',
  supersedes_plan_id:null
};
const newDayPoliticsPlan={
  ...polMemory,
  plan_id:'politics-new-day-plan',
  generated_at:'2026-09-19T21:00:00.000Z',
  supersedes_plan_id:null
};
const crossDayPoliticsStorage=new MemoryStorage({
  [POLITICS_MEMORY_PLAN_KEY]:JSON.stringify(stalePoliticsPlan),
  [POLITICS_MEMORY_PLAN_PREFIX+stalePoliticsPlan.plan_id]:JSON.stringify(stalePoliticsPlan)
});
const crossDayStage=stagePoliticsMemoryPlan(crossDayPoliticsStorage,newDayPoliticsPlan,{expectedDay:day,now});
assert.equal(crossDayStage.status,'replaced_stale_day');
assert.equal(JSON.parse(crossDayPoliticsStorage.getItem(POLITICS_MEMORY_PLAN_KEY)).plan_id,newDayPoliticsPlan.plan_id);
assert.equal(JSON.parse(crossDayPoliticsStorage.getItem(POLITICS_MEMORY_PLAN_PREFIX+stalePoliticsPlan.plan_id)).plan_id,stalePoliticsPlan.plan_id,
  'cross-day replacement must preserve exact prior plan history');

assert.throws(()=>validateBrowserControlCommand({
  ...xzCommand,
  command_id:'direct-xizong-bad-ref',
  operations:[
    {kind:'xizong.session',payload:xzSession},
    {kind:'exam.chat_plan',payload:{
      ...xzPlan,
      subjects:{...xzPlan.subjects,xizong:{...xzPlan.subjects.xizong,session_ref:'wrong-ref'}}
    }}
  ]
},day),/XIZONG_SESSION_REF_MISMATCH/);

assert.throws(()=>validateBrowserControlCommand({
  ...polCommand,
  command_id:'direct-politics-bad-ref',
  operations:[
    {kind:'politics.memory_plan',payload:polMemory},
    {kind:'exam.chat_plan',payload:{
      ...polPlan,
      subjects:{...polPlan.subjects,politics:{...polPlan.subjects.politics,session_ref:'wrong-ref'}}
    }}
  ]
},day),/POLITICS_SESSION_REF_MISMATCH/);

// Synthetic paper, real native capture/seal/release/score/checkpoint owners.
// No canonical questions, answers, or real learner state are used.
const examTasks=['cloze','reading_a','reading_a','reading_a','reading_a','reading_b','translation','writing','writing'];
const examSteps=examTasks.map((task,index)=>({
  step_id:'synthetic-step-'+index,task,object_id:'synthetic-exam-object-'+index,
  source_hash:'synthetic-source-'+index,max_points:index===8?20:10,
  question_ids:Array.from({length:task==='cloze'?20:['reading_a','reading_b'].includes(task)?5:0},(_,n)=>'q'+n),
  ...(task==='writing'?{writing_kind:index===7?'small':'big'}:{})
}));
const examPaper={
  schema:'kianos.english.exam-paper.v1',paper_id:'synthetic-exam-control',source_hash:'synthetic-paper-source',year:2026,
  duration_minutes:180,total_points:100,objective_max_points:60,productive_max_points:40,
  default_task_order:['cloze','reading_a','reading_b','translation','writing'],steps:examSteps
};
const examStart=now-60*60_000;
let releasedExam=startEnglishExamSession(examPaper,{sessionId:'synthetic-exam-session',now:examStart});
const examAnswers={};
for(const [index,step] of examSteps.entries()){
  const answers=Object.fromEntries(step.question_ids.map(id=>[id,'A']));
  const payload=step.task==='writing'?{essay:'Synthetic sealed first output.'}
    :step.task==='translation'?{answers:{t1:'Synthetic sealed translation.'}}:{answers};
  releasedExam=captureEnglishExamStep(releasedExam,{
    stepId:step.step_id,task:step.task,objectId:step.object_id,payload,now:examStart+(index+1)*60_000
  });
  if(step.question_ids.length)examAnswers[step.step_id]={task:step.task,object_id:step.object_id,source_hash:step.source_hash,answers};
}
releasedExam=sealEnglishExamSession(releasedExam,examStart+30*60_000);
releasedExam=releaseEnglishExamObjective(releasedExam,{
  schema:ENGLISH_EXAM_ANSWER_SCHEMA,paper_id:examPaper.paper_id,steps:examAnswers
},examStart+31*60_000);
const scoreReturn=englishExamProductiveScoreReturnContract(releasedExam);
for(const [name,channel] of Object.entries(scoreReturn.channels)){
  Object.assign(channel,{
    score_range:name==='writing_big'?{low:14,high:17}:{low:6,high:8},
    confidence:'MEDIUM',review_mode:'ANCHORED_SINGLE',requires_independent_rescore:false
  });
}
const scoreCommand=browserControlCommand({
  schema:CONTROL_COMMAND_SCHEMA,command_id:'english-score-native-001',study_day:day,generated_at:generatedAt,
  operations:[{kind:'english.exam_score_return',payload:scoreReturn}]
},{commandHash:'synthetic-score-command-hash'});
assert.equal(validateBrowserControlCommand(scoreCommand,day).operations[0].kind,'english.exam_score_return');
assert.throws(()=>validateBrowserControlCommand({...scoreCommand,operations:[...scoreCommand.operations,...scoreCommand.operations]},day),/OP_DUPLICATE/);
const scoreStorage=new MemoryStorage();
writeEnglishExamSession(scoreStorage,releasedExam);
const scoreEvents=[];
globalThis.window={dispatchEvent:event=>scoreEvents.push(event.type)};
assert.equal((await applyPrivateControlCommand(scoreStorage,scoreCommand,{day,now})).status,'applied');
const scoredExam=readEnglishExamSession(scoreStorage);
assert.equal(scoredExam.status,'SCORED');
assert.deepEqual(scoredExam.captures,releasedExam.captures,'scoring must preserve the sealed first outputs');
assert.deepEqual(scoredExam.release.objective,releasedExam.release.objective);
assert.deepEqual(scoredExam.release.integrated.score_range,{low:86,high:93});
assert.equal(scoredExam.release.integrated.evidence_quality,'UNKNOWN');
assert.equal(scoredExam.release.integrated.score_eligible,false);
assert.equal(scoredExam.revision,releasedExam.revision+1);
assert.ok(scoreEvents.includes('kianos:english-exam-updated'));
assert.ok(scoreEvents.includes('kianos:english-session-updated'));
assert.ok(scoreEvents.includes('kianos:private-control-consumed'));
const scoredSnapshot=[...scoreStorage.map];
scoreEvents.length=0;
assert.equal((await applyPrivateControlCommand(scoreStorage,scoreCommand,{day,now})).status,'idempotent');
assert.deepEqual([...scoreStorage.map],scoredSnapshot,'same-command replay must not rewrite score or receipt');
assert.equal(scoreEvents.length,0);
await assert.rejects(applyPrivateControlCommand(scoreStorage,{
  ...scoreCommand,command_id:'english-score-native-002',command_hash:'new-command-hash',generated_at:new Date(now+1000).toISOString()
},{day,now:now+1000}),/PRODUCTIVE_SCORE_REQUIRES_RELEASED_OBJECTIVE/);
assert.deepEqual([...scoreStorage.map],scoredSnapshot,'a new command cannot overwrite an already scored exam');

const badScoreStorage=new MemoryStorage({'kianos-xizong-memory-v1':JSON.stringify(memory)});
writeEnglishExamSession(badScoreStorage,releasedExam);
const beforeBadScore=[...badScoreStorage.map];
await assert.rejects(applyPrivateControlCommand(badScoreStorage,{
  ...scoreCommand,operations:[
    {kind:'xizong.session',payload:xzSession},
    {kind:'english.exam_score_return',payload:{...scoreReturn,paper_source_hash:'wrong-source-revision'}}
  ]
},{day,now}),/PRODUCTIVE_SCORE_SESSION_IDENTITY_MISMATCH/);
assert.deepEqual([...badScoreStorage.map],beforeBadScore,'bad score must discard earlier native writes from the same command');
assert.equal(badScoreStorage.getItem(CONTROL_LOCAL_RECEIPT_KEY),null);
assert.equal(scoreEvents.length,0,'rejected scores must not announce native updates');

class ReceiptFailStorage extends MemoryStorage {
  setItem(key,value){if(key===CONTROL_LOCAL_RECEIPT_KEY)throw new Error('SYNTHETIC_RECEIPT_QUOTA');super.setItem(key,value);}
}
const receiptFailStorage=new ReceiptFailStorage();
writeEnglishExamSession(receiptFailStorage,releasedExam);
const beforeReceiptFailure=[...receiptFailStorage.map];
await assert.rejects(applyPrivateControlCommand(receiptFailStorage,scoreCommand,{day,now}),/SYNTHETIC_RECEIPT_QUOTA/);
assert.deepEqual([...receiptFailStorage.map],beforeReceiptFailure,'receipt failure must roll back the native SCORED write');

assert.equal(inspectEnglishCheckpoint(exportEnglishCheckpoint(scoreStorage)).status,'valid');
const scoredBackup=capturePrivateSubjectCheckpoints(scoreStorage);
const restoredScoreStorage=new MemoryStorage();
restorePrivateSubjectCheckpoints(restoredScoreStorage,scoredBackup);
assert.equal(restoredScoreStorage.getItem(ENGLISH_EXAM_SESSION_KEY),scoreStorage.getItem(ENGLISH_EXAM_SESSION_KEY));
assert.deepEqual(readEnglishExamSession(restoredScoreStorage),scoredExam,'real native checkpoint restores the complete SCORED state');

console.log('SHARED_CONTROL_THREE_SUBJECTS PASS (including native English score transport, replay, rollback and checkpoint)');
