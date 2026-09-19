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
import { XIZONG_SESSION_KEY } from '../src/lib/xizongSessionInstruction.mjs';

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
  command_id: 'cmd-1',
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
assert.equal(replay.command_id, 'cmd-1');
assert.equal(readPrivateControlRuntimeState(storage).receipts.length, 1, 'replay must not create another receipt');

const stale = applyPrivateControlCommand(storage, {
  ...c1,
  command_id: 'cmd-old',
  issued_at: new Date(t0 - 1000).toISOString()
}, { expectedDay: day, now: t0 + 3000 });
assert.equal(stale.status, 'STALE');
assert.equal(JSON.parse(storage.getItem(EXAM_CHAT_PLAN_KEY)).next_subject, 'xizong');

const memory = createXizongMemoryState();
memory.cards['core:a1-b01-kp01'] = {
  id: 'core:a1-b01-kp01',
  family: 'CORE',
  blockId: 'a1-b01',
  kpId: 'a1-b01-kp01',
  sourceHash: 'h1'
};
storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(memory));

const c2 = {
  schema: PRIVATE_CONTROL_COMMAND_SCHEMA,
  command_id: 'cmd-2',
  issued_at: new Date(t0 + 5000).toISOString(),
  study_day: day,
  target: 'xizong.session',
  supersedes: 'cmd-old',
  payload: {
    schema: 'kianos.xizong.session-instruction.v1',
    session_id: 'xz-session-1',
    study_day: day,
    generated_at: new Date(t0 + 5000).toISOString(),
    current_step: 0,
    steps: [{ step_id:'m1', kind:'MEMORY_REVIEW', card_ids:['core:a1-b01-kp01'] }]
  }
};

const badSupersede = applyPrivateControlCommand(storage, c2, { expectedDay: day, now: t0 + 6000 });
assert.equal(badSupersede.status, 'REJECTED');
assert.equal(storage.getItem(XIZONG_SESSION_KEY), null, 'bad supersede must not mutate subject state');

const latestId = readPrivateControlRuntimeState(storage).receipts.at(-1).command_id;
const c3 = { ...c2, command_id: 'cmd-3', supersedes: latestId, issued_at: new Date(t0 + 7000).toISOString(),
  payload: { ...c2.payload, session_id:'xz-session-2', generated_at:new Date(t0 + 7000).toISOString() } };
const r3 = applyPrivateControlCommand(storage, c3, { expectedDay: day, now: t0 + 8000 });
assert.equal(r3.status, 'APPLIED');
assert.equal(JSON.parse(storage.getItem(XIZONG_SESSION_KEY)).session_id, 'xz-session-2');
assert.equal(JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY)).attention['core:a1-b01-kp01'].reviewRequested, true);

const invalidCard = {
  ...c3,
  command_id: 'cmd-4',
  issued_at: new Date(t0 + 9000).toISOString(),
  supersedes: 'cmd-3',
  payload: {
    ...c3.payload,
    session_id: 'xz-bad',
    generated_at: new Date(t0 + 9000).toISOString(),
    steps: [{step_id:'m1',kind:'MEMORY_REVIEW',card_ids:['core:missing']}]
  }
};
const rejected = applyPrivateControlCommand(storage, invalidCard, { expectedDay: day, now: t0 + 10000 });
assert.equal(rejected.status, 'REJECTED');
assert.equal(JSON.parse(storage.getItem(XIZONG_SESSION_KEY)).session_id, 'xz-session-2',
  'rejected newer command must preserve prior subject state');

console.log('PASS private control prototype: typed dispatch, replay, stale, supersede and rejected-command isolation');
