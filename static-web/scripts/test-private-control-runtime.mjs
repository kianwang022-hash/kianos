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

console.log('PASS private control prototype: transactional per-target dispatch + replay/stale/supersede/cross-day isolation');
