import assert from 'node:assert/strict';
import {
  CONTROL_BROWSER_SCHEMA,
  validateBrowserControlCommand
} from '../src/lib/privateControlCommand.mjs';
import { applyPrivateControlCommand } from '../src/lib/privateControlRuntime.mjs';
import { POLITICS_MEMORY_PLAN_KEY } from '../src/lib/politicsMemoryRuntime.mjs';
import { captureXizongPrivateCheckpoint } from '../src/lib/xizongPrivateCheckpoint.mjs';
import { exportPoliticsCheckpoint, validatePoliticsPrivatePayload } from '../src/lib/politicsChatReturn.mjs';

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
const xzResult=await applyPrivateControlCommand(xzStorage,xzCommand,{day,now});
assert.equal(xzResult.status,'applied');
assert.equal(JSON.parse(xzStorage.getItem('kianos:xizong:session-instruction:v1')).session_id,xzSession.session_id);
assert.equal(JSON.parse(xzStorage.getItem('kianos-exam-chat-plan-v1')).subjects.xizong.session_ref,xzSession.session_id);
const xzCheckpoint=captureXizongPrivateCheckpoint(xzStorage,{now});
assert.ok(xzCheckpoint.entries.some(row=>row.key==='kianos:xizong:session-instruction:v1'),'Xizong session must be durable');
assert.ok(xzCheckpoint.entries.some(row=>row.key==='kianos:xizong:session-runtime:v1'),'Xizong session runtime must be durable');

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
const polResult=await applyPrivateControlCommand(polStorage,polCommand,{day,now});
assert.equal(polResult.status,'applied');
assert.equal(JSON.parse(polStorage.getItem(POLITICS_MEMORY_PLAN_KEY)).plan_id,polMemory.plan_id);
assert.equal(JSON.parse(polStorage.getItem('kianos-exam-chat-plan-v1')).subjects.politics.session_ref,polMemory.plan_id);
const politicsCheckpoint=exportPoliticsCheckpoint(polStorage);
const politicsEntries=new Map(validatePoliticsPrivatePayload(politicsCheckpoint));
assert.ok(politicsEntries.has(POLITICS_MEMORY_PLAN_KEY),'Politics Memory plan must be durable');

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

console.log('SHARED_CONTROL_THREE_SUBJECTS PASS');
