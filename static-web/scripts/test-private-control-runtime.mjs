import assert from 'node:assert/strict';
import {
  PRIVATE_CONTROL_COMMAND_SCHEMA,
  PRIVATE_CONTROL_RECEIPT_SCHEMA
} from '../src/lib/privateControlCommand.mjs';
import {
  applyPrivateControlCommand,
  readPrivateControlRuntimeState
} from '../src/lib/privateControlRuntime.mjs';
import { EXAM_CHAT_PLAN_KEY } from '../src/lib/examChatPlan.mjs';
import { XIZONG_MEMORY_STORAGE_KEY, createXizongMemoryState } from '../src/lib/xizongMemoryModel.mjs';
import { XIZONG_SESSION_KEY, XIZONG_CHAT_SET_KEY } from '../src/lib/xizongSessionInstruction.mjs';
import { attachXizongChatReturnContract } from '../src/lib/xizongChatReturn.mjs';
import {
  XIZONG_PENDING_CHAT_RETURN_KEY,
  consumePendingXizongChatReturnForObject
} from '../src/lib/xizongPendingChatReturn.mjs';
import {
  XIZONG_SYSTEM_WU_PENDING_KEY,
  consumePendingXizongSystemWuReturn
} from '../src/lib/xizongSystemWuReturn.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

const day = '2026-09-20';
const t0 = Date.parse('2026-09-20T01:00:00Z');
const storage = new MemoryStorage();

const planPayload = {
  schema: 'kianos.exam.chat-plan.v1',
  study_day: day,
  generated_at: new Date(t0).toISOString(),
  subjects: {
    xizong: { target_minutes: 360, role: '主推进', note: '', session_ref: null },
    english: null,
    politics: null
  },
  next_subject: 'xizong',
  attention: null
};

const c1 = {
  schema: PRIVATE_CONTROL_COMMAND_SCHEMA,
  command_id: 'cmd-plan-1',
  issued_at: new Date(t0).toISOString(),
  study_day: day,
  target: 'exam.chat_plan',
  payload: planPayload
};

const r1 = applyPrivateControlCommand(storage, c1, { expectedDay: day, now: t0 + 1000 });
assert.equal(r1.schema, PRIVATE_CONTROL_RECEIPT_SCHEMA);
assert.equal(r1.status, 'APPLIED');
assert.equal(JSON.parse(storage.getItem(EXAM_CHAT_PLAN_KEY)).next_subject, 'xizong');

const replay = applyPrivateControlCommand(storage, c1, { expectedDay: day, now: t0 + 2000 });
assert.equal(replay.command_id, 'cmd-plan-1');
assert.equal(readPrivateControlRuntimeState(storage).receipts.length, 1, 'replay must not create another receipt');

assert.throws(() => applyPrivateControlCommand(storage, {
  ...c1,
  payload: { ...planPayload, next_subject: 'english' }
}, { expectedDay: day, now: t0 + 2500 }), /COMMAND_ID_CONFLICT/,
'same command id with different payload must fail');

const memory = createXizongMemoryState();
memory.releasedBlocks['a1-b01'] = {
  blockId: 'a1-b01',
  systemId: 'circulation',
  sourceHash: 'h1',
  releasedAt: new Date(t0).toISOString(),
  refreshedAt: new Date(t0).toISOString(),
  coreCardIds: ['core:a1-b01-kp01'],
  precisionCardIds: []
};
memory.cards['core:a1-b01-kp01'] = {
  id: 'core:a1-b01-kp01',
  family: 'CORE',
  blockId: 'a1-b01',
  kpId: 'a1-b01-kp01',
  sourceHash: 'h1'
};
storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(memory));

const x1 = {
  schema: PRIVATE_CONTROL_COMMAND_SCHEMA,
  command_id: 'cmd-xz-1',
  issued_at: new Date(t0 + 3000).toISOString(),
  study_day: day,
  target: 'xizong.session',
  payload: {
    schema: 'kianos.xizong.session-instruction.v1',
    session_id: 'xz-session-1',
    study_day: day,
    generated_at: new Date(t0 + 3000).toISOString(),
    current_step: 0,
    steps: [
      { step_id:'m1', kind:'MEMORY_REVIEW', targets:[{card_id:'core:a1-b01-kp01',block_id:'a1-b01',source_hash:'h1'}] },
      { step_id:'q1', kind:'PRACTICE_SET', question_ids:['xizong-official-2024-n001'] }
    ]
  }
};

const xr1 = applyPrivateControlCommand(storage, x1, { expectedDay: day, now: t0 + 4000 });
assert.equal(xr1.status, 'APPLIED');
assert.equal(JSON.parse(storage.getItem(XIZONG_SESSION_KEY)).session_id, 'xz-session-1');
assert.equal(
  JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY)).attention['core:a1-b01-kp01'],
  undefined,
  'Chat control selection must remain session-local, not become Weak/Today attention'
);
assert.equal(
  JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY)).evidence.length,
  0,
  'transport selection is not learner Recall evidence'
);
assert.equal(storage.getItem(XIZONG_CHAT_SET_KEY), null,
  'control receipt may activate current step but must not pre-project later step');

const stateAfterTwoTargets = readPrivateControlRuntimeState(storage);
assert.equal(stateAfterTwoTargets.active_by_target['exam.chat_plan'].command_id, 'cmd-plan-1');
assert.equal(stateAfterTwoTargets.active_by_target['xizong.session'].command_id, 'cmd-xz-1',
  'independent targets must coexist');

const wrongSupersede = {
  ...x1,
  command_id: 'cmd-xz-bad',
  issued_at: new Date(t0 + 5000).toISOString(),
  supersedes: 'not-active',
  payload: { ...x1.payload, session_id:'xz-bad', generated_at:new Date(t0 + 5000).toISOString() }
};
const rejected = applyPrivateControlCommand(storage, wrongSupersede, { expectedDay: day, now: t0 + 6000 });
assert.equal(rejected.status, 'REJECTED');
assert.equal(readPrivateControlRuntimeState(storage).active_by_target['xizong.session'].command_id, 'cmd-xz-1',
  'rejected command must not replace active target command');

const x2 = {
  ...x1,
  command_id: 'cmd-xz-2',
  issued_at: new Date(t0 + 7000).toISOString(),
  supersedes: 'cmd-xz-1',
  payload: {
    ...x1.payload,
    session_id:'xz-session-2',
    generated_at:new Date(t0 + 7000).toISOString(),
    steps:[{step_id:'m2',kind:'MEMORY_REVIEW',targets:[{card_id:'core:a1-b01-kp01',block_id:'a1-b01',source_hash:'h1'}]}]
  }
};
const xr2 = applyPrivateControlCommand(storage, x2, { expectedDay: day, now: t0 + 8000 });
assert.equal(xr2.status, 'APPLIED');
assert.equal(JSON.parse(storage.getItem(XIZONG_SESSION_KEY)).session_id, 'xz-session-2');
assert.equal(readPrivateControlRuntimeState(storage).active_by_target['xizong.session'].command_id, 'cmd-xz-2');

const staleX = {
  ...x2,
  command_id: 'cmd-xz-old',
  issued_at: new Date(t0 + 6500).toISOString(),
  supersedes: 'cmd-xz-2',
  payload: { ...x2.payload, session_id:'xz-old', generated_at:new Date(t0 + 6500).toISOString() }
};
const stale = applyPrivateControlCommand(storage, staleX, { expectedDay: day, now: t0 + 9000 });
assert.equal(stale.status, 'STALE');
assert.equal(JSON.parse(storage.getItem(XIZONG_SESSION_KEY)).session_id, 'xz-session-2');

// Typed Xizong Chat Return is transport-only until the exact Block resolver validates current evidence.
const returnPacket = {
  schema:'kianos.xizong.study_packet.v3',
  exported_at:new Date(t0 + 12_000).toISOString(),
  current:{
    object_id:'xizong:a1-b01',
    system_id:'circulation',
    canonical_id:'A1',
    block_id:'a1-b01',
    block_label:'B1',
    block_title:'Demo',
    source_hash:'h1'
  },
  learning_state:{
    current_stage:'kp_recall',
    source_contact:{confirmed_segments:[],mode:'NATURAL_SOURCE_UNIT',per_logic_group:false,whole_block_confirmed:true,active_group_contacted:true},
    resume:{group_index:0,logic_group_id:'g1',logic_group_label:'G1',kp_index:0,kp_id:'a1-b01-kp01',kp_display_id:'KP01',source_locator:'P1'},
    ttsx:{pending:null,evidence:{},annotations:{}},
    learned_kp_ids:['a1-b01-kp01'],
    recall_ratings:{'a1-b01-kp01':'fuzzy'},
    block_recall_done:false,
    block_complete:false,
    system_recall:null
  },
  summary:{unresolved_wu_questions:0},
  kp_evidence:[{kp_id:'a1-b01-kp01',recall_rating:'fuzzy'}],
  block_evidence_history:[],
  memory:{today:[],marked_fragments:[],active_repairs:[],evidence:[]},
  practice:{holdout_years:[],wrong_uncertain:[],marked_question_ids:[]},
  pending_repair_inbox:null,
  reserve_learning:[]
};
const returnExport = attachXizongChatReturnContract(storage, returnPacket, {
  returnHref:'/xizong/circulation/b01/',
  now:t0 + 12_000
});
const returnPayload = {
  schema:'kianos.xizong.chat_return.v1',
  return_id:'return-control-1',
  handoff_id:returnExport.chat_return_contract.handoff_id,
  origin:returnExport.chat_return_contract.origin,
  resume:returnExport.chat_return_contract.resume,
  decision:'REPAIR',
  repairs:[{
    kp_id:'a1-b01-kp01',
    reason:'bounded gap',
    action:'repair only this KP',
    priority:'high',
    source_question_ids:[]
  }]
};
const beforeReturnMemory = storage.getItem(XIZONG_MEMORY_STORAGE_KEY);
const returnCommand = {
  schema:PRIVATE_CONTROL_COMMAND_SCHEMA,
  command_id:'cmd-xz-return-1',
  issued_at:new Date(t0 + 13_000).toISOString(),
  study_day:day,
  target:'xizong.chat_return',
  payload:returnPayload
};
const returnTransportReceipt = applyPrivateControlCommand(storage, returnCommand, {
  expectedDay:day,
  now:t0 + 14_000
});
assert.equal(returnTransportReceipt.status,'APPLIED');
assert.equal(JSON.parse(storage.getItem(XIZONG_PENDING_CHAT_RETURN_KEY)).pending_by_object['xizong:a1-b01'].return_id,'return-control-1');
assert.equal(storage.getItem(XIZONG_MEMORY_STORAGE_KEY),beforeReturnMemory,
  'transport staging must not mutate learner Memory/Repair before exact Block validation');
assert.equal(storage.getItem('kianos-xizong-repair-inbox-v1:xizong:a1-b01'),null,
  'transport staging must not write Repair inbox');

const subjectApply = consumePendingXizongChatReturnForObject(storage, {
  objectId:'xizong:a1-b01',
  currentPacket:returnPacket,
  now:t0 + 15_000
});
assert.equal(subjectApply.status,'applied');
const memoryAfterSubjectApply = JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY));
assert.equal(
  memoryAfterSubjectApply.repairTasks.some((task)=>task.id==='repair:block-chat:a1-b01:a1-b01-kp01'),
  true,
  'only the subject resolver may create canonical Repair'
);
assert.equal(
  readPrivateControlRuntimeState(storage).active_by_target['xizong.chat_return'].command_id,
  'cmd-xz-return-1'
);

// A newer trusted Return may replace an older unconsumed Return for the same Block.
const replaceReturnStorage = new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]: JSON.stringify(memory)
});
const replaceExport = attachXizongChatReturnContract(replaceReturnStorage, returnPacket, {
  returnHref:'/xizong/circulation/b01/',
  now:t0 + 16_000
});
const replaceBase = {
  schema:'kianos.xizong.chat_return.v1',
  handoff_id:replaceExport.chat_return_contract.handoff_id,
  origin:replaceExport.chat_return_contract.origin,
  resume:replaceExport.chat_return_contract.resume,
  decision:'REPAIR',
  repairs:[{
    kp_id:'a1-b01-kp01',
    reason:'old pending reason',
    action:'old pending action',
    priority:'high',
    source_question_ids:[]
  }]
};
const replaceCommandA = {
  schema:PRIVATE_CONTROL_COMMAND_SCHEMA,
  command_id:'replace-pending-return-a',
  issued_at:new Date(t0 + 17_000).toISOString(),
  study_day:day,
  target:'xizong.chat_return',
  payload:{...replaceBase,return_id:'replace-return-a'}
};
const replaceReceiptA = applyPrivateControlCommand(replaceReturnStorage, replaceCommandA, {
  expectedDay:day,
  now:t0 + 18_000
});
assert.equal(replaceReceiptA.status,'APPLIED');

const replaceCommandB = {
  ...replaceCommandA,
  command_id:'replace-pending-return-b',
  issued_at:new Date(t0 + 19_000).toISOString(),
  payload:{
    ...replaceBase,
    return_id:'replace-return-b',
    repairs:[{
      ...replaceBase.repairs[0],
      reason:'new authoritative pending reason',
      action:'new authoritative pending action'
    }]
  }
};
const replaceReceiptB = applyPrivateControlCommand(replaceReturnStorage, replaceCommandB, {
  expectedDay:day,
  now:t0 + 20_000
});
assert.equal(replaceReceiptB.status,'APPLIED');
const replacedPending = JSON.parse(replaceReturnStorage.getItem(XIZONG_PENDING_CHAT_RETURN_KEY));
assert.equal(replacedPending.pending_by_object['xizong:a1-b01'].return_id,'replace-return-b');
assert.equal(replaceReturnStorage.getItem('kianos-xizong-repair-inbox-v1:xizong:a1-b01'),null);
assert.equal(
  JSON.parse(replaceReturnStorage.getItem(XIZONG_MEMORY_STORAGE_KEY)).repairTasks.length,
  0,
  'replacing pending transport must not execute either Return'
);
const replaceApply = consumePendingXizongChatReturnForObject(replaceReturnStorage, {
  objectId:'xizong:a1-b01',
  currentPacket:returnPacket,
  now:t0 + 21_000
});
assert.equal(replaceApply.status,'applied');
const replaceMemory = JSON.parse(replaceReturnStorage.getItem(XIZONG_MEMORY_STORAGE_KEY));
assert.equal(replaceMemory.repairTasks.length,1);
assert.equal(replaceMemory.repairTasks[0].reason,'new authoritative pending reason');
assert.equal(replaceMemory.repairTasks.some((task)=>task.reason==='old pending reason'),false);

// System W/U control is stage-only until exact System Practice validates current attempts + reviewed relations.
const wuStorage = new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]: JSON.stringify(memory),
  'kianos:xizong:system-question-sweep:circulation:v1': JSON.stringify({
    results:{
      'xizong-official-2024-n001':{
        status:'wrong',
        attemptId:'wu-attempt-1',
        roundId:'wu-round-1',
        updatedAt:new Date(t0 + 22_000).toISOString()
      }
    },
    attemptHistory:[{
      type:'QUESTION_ATTEMPT',
      question_id:'xizong-official-2024-n001',
      attempt_id:'wu-attempt-1',
      round_id:'wu-round-1',
      status:'wrong',
      submitted_at:new Date(t0 + 22_000).toISOString()
    }]
  })
});
const wuPayload = {
  schema:'kianos.xizong.system_wu_return.v1',
  return_id:'wu-return-control-1',
  system_id:'circulation',
  decision:'REPAIR',
  plan:[{
    question_id:'xizong-official-2024-n001',
    status:'wrong',
    attempt_id:'wu-attempt-1',
    submitted_at:new Date(t0 + 22_000).toISOString(),
    round_id:'wu-round-1',
    reason:'current W/U diagnosis',
    action:'repair only reviewed relation',
    priority:'high'
  }]
};
const wuCommand = {
  schema:PRIVATE_CONTROL_COMMAND_SCHEMA,
  command_id:'cmd-xz-system-wu-1',
  issued_at:new Date(t0 + 23_000).toISOString(),
  study_day:day,
  target:'xizong.system_wu_return',
  payload:wuPayload
};
const wuMemoryBefore = wuStorage.getItem(XIZONG_MEMORY_STORAGE_KEY);
const wuTransport = applyPrivateControlCommand(wuStorage, wuCommand, {
  expectedDay:day,
  now:t0 + 24_000
});
assert.equal(wuTransport.status,'APPLIED');
assert.equal(
  JSON.parse(wuStorage.getItem(XIZONG_SYSTEM_WU_PENDING_KEY)).pending_by_system.circulation.return_id,
  'wu-return-control-1'
);
assert.equal(wuStorage.getItem(XIZONG_MEMORY_STORAGE_KEY),wuMemoryBefore,
  'System W/U transport must not create Repair before subject validation');

const wuSubject = consumePendingXizongSystemWuReturn(wuStorage, {
  systemId:'circulation',
  questions:[{
    questionId:'xizong-official-2024-n001',
    relation:{blockId:'a1-b01',primaryKpId:'a1-b01-kp01'}
  }],
  routes:{'a1-b01':{label:'B1',href:'/xizong/circulation/b01/'}},
  practiceHref:'/xizong/practice/circulation/',
  now:t0 + 25_000,
  expectedDay:day
});
assert.equal(wuSubject.status,'applied');
assert.equal(
  JSON.parse(wuStorage.getItem(XIZONG_MEMORY_STORAGE_KEY)).repairTasks.some(
    (task)=>task.id==='repair:system-wu:circulation:a1-b01:a1-b01-kp01'
  ),
  true,
  'only subject resolver creates System W/U Repair'
);

// A rejected activation must roll back both Xizong target state and active command state.
const holdoutStorage = new MemoryStorage();
holdoutStorage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(memory));
const holdoutCommand = {
  schema: PRIVATE_CONTROL_COMMAND_SCHEMA,
  command_id: 'cmd-xz-holdout',
  issued_at: new Date(t0 + 10_000).toISOString(),
  study_day: day,
  target: 'xizong.session',
  payload: {
    schema: 'kianos.xizong.session-instruction.v1',
    session_id: 'xz-holdout',
    study_day: day,
    generated_at: new Date(t0 + 10_000).toISOString(),
    steps: [{ step_id:'q1', kind:'PRACTICE_SET', question_ids:['xizong-official-2024-n001'] }]
  }
};
const holdoutReceipt = applyPrivateControlCommand(holdoutStorage, holdoutCommand, {
  expectedDay: day,
  now: t0 + 11_000,
  holdoutYears: [2024]
});
assert.equal(holdoutReceipt.status, 'REJECTED');
assert.equal(holdoutStorage.getItem(XIZONG_SESSION_KEY), null, 'rejected activation must roll back session install');
assert.equal(holdoutStorage.getItem(XIZONG_CHAT_SET_KEY), null, 'rejected activation must not leave a Chat Set');
assert.equal(readPrivateControlRuntimeState(holdoutStorage).active_by_target['xizong.session'], undefined);

// Corrupt replay state must fail closed rather than silently resetting replay protection.
const corruptStateStorage = new MemoryStorage({
  'kianos:private-control-runtime:v1': '{bad-json'
});
assert.throws(
  () => readPrivateControlRuntimeState(corruptStateStorage),
  /STATE_JSON_INVALID/
);

// A stale plan payload cannot be smuggled inside a newer command envelope.
const planStorage = new MemoryStorage();
applyPrivateControlCommand(planStorage, c1, { expectedDay: day, now: t0 + 1000 });
const stalePlanCommand = {
  ...c1,
  command_id: 'cmd-plan-2',
  issued_at: new Date(t0 + 20_000).toISOString(),
  supersedes: 'cmd-plan-1',
  payload: { ...planPayload, generated_at: new Date(t0 - 1000).toISOString() }
};
const stalePlanReceipt = applyPrivateControlCommand(planStorage, stalePlanCommand, {
  expectedDay: day,
  now: t0 + 21_000
});
assert.equal(stalePlanReceipt.status, 'REJECTED');
assert.equal(JSON.parse(planStorage.getItem(EXAM_CHAT_PLAN_KEY)).generated_at, new Date(t0).toISOString());

// A previous-day active slot must not force today's first command to supersede yesterday.
const crossDayStorage = new MemoryStorage({
  'kianos:private-control-runtime:v1': JSON.stringify({
    schema:'kianos.private-control-runtime-state.v1',
    active_by_target:{
      'exam.chat_plan':{
        command_id:'yesterday-plan',
        command_signature:'cmd-deadbeef',
        issued_at:'2026-09-19T01:00:00.000Z',
        applied_at:'2026-09-19T01:00:01.000Z',
        study_day:'2026-09-19'
      }
    },
    receipts:[]
  })
});
const todayPlanCommand = {
  ...c1,
  command_id:'today-plan',
  issued_at:new Date(t0 + 30_000).toISOString(),
  payload:{...planPayload, generated_at:new Date(t0 + 30_000).toISOString()}
};
const todayPlanReceipt = applyPrivateControlCommand(crossDayStorage, todayPlanCommand, {
  expectedDay:day,
  now:t0 + 31_000
});
assert.equal(todayPlanReceipt.status,'APPLIED');
assert.equal(readPrivateControlRuntimeState(crossDayStorage).active_by_target['exam.chat_plan'].command_id,'today-plan');

// Stale-day command is recorded once, then replays the same STALE receipt.
const staleDayStorage = new MemoryStorage();
const staleDayCommand = {
  ...c1,
  command_id:'yesterday-arrived-late',
  study_day:'2026-09-19',
  issued_at:'2026-09-19T02:00:00.000Z',
  payload:{...planPayload,study_day:'2026-09-19',generated_at:'2026-09-19T02:00:00.000Z'}
};
const staleDayReceipt = applyPrivateControlCommand(staleDayStorage, staleDayCommand, {
  expectedDay:day,
  now:t0 + 40_000
});
assert.equal(staleDayReceipt.status,'STALE');
const staleDayReplay = applyPrivateControlCommand(staleDayStorage, staleDayCommand, {
  expectedDay:day,
  now:t0 + 50_000
});
assert.equal(staleDayReplay.status,'STALE');
assert.equal(readPrivateControlRuntimeState(staleDayStorage).receipts.length,1);

// A future-dated command cannot lock the target against later legitimate commands.
const futureStorage = new MemoryStorage();
const futureCommand = {
  ...c1,
  command_id:'future-plan',
  issued_at:new Date(t0 + 10 * 60_000).toISOString(),
  payload:{...planPayload,generated_at:new Date(t0 + 10 * 60_000).toISOString()}
};
const futureReceipt = applyPrivateControlCommand(futureStorage, futureCommand, {
  expectedDay:day,
  now:t0
});
assert.equal(futureReceipt.status,'REJECTED');
assert.equal(readPrivateControlRuntimeState(futureStorage).active_by_target['exam.chat_plan'],undefined);
assert.equal(futureStorage.getItem(EXAM_CHAT_PLAN_KEY),null);

console.log('PASS private control prototype: transactional per-target dispatch + replay/stale/supersede/cross-day/future-time isolation');
