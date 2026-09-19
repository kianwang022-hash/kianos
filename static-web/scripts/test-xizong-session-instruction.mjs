import assert from 'node:assert/strict';
import {
  XIZONG_SESSION_SCHEMA,
  XIZONG_SESSION_KEY,
  XIZONG_SESSION_RUNTIME_KEY,
  XIZONG_CHAT_SET_KEY,
  activateXizongSessionNext,
  applyXizongSessionInstruction,
  resolveXizongSessionNext
} from '../src/lib/xizongSessionInstruction.mjs';
import { XIZONG_MEMORY_STORAGE_KEY, createXizongMemoryState } from '../src/lib/xizongMemoryModel.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

const day = '2026-09-20';
const now = Date.parse('2026-09-20T01:00:00Z');
const memory = createXizongMemoryState();
memory.cards['core:a1-b01-kp01'] = {
  id: 'core:a1-b01-kp01',
  family: 'CORE',
  blockId: 'a1-b01',
  kpId: 'a1-b01-kp01',
  sourceHash: 'h1'
};

const storage = new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]: JSON.stringify(memory)
});

const instruction = {
  schema: XIZONG_SESSION_SCHEMA,
  session_id: 'xz-20260920-1',
  study_day: day,
  generated_at: new Date(now).toISOString(),
  current_step: 0,
  steps: [
    {
      step_id: 'm1',
      kind: 'MEMORY_REVIEW',
      card_ids: ['core:a1-b01-kp01'],
      reason: 'Chat wants one bounded delayed recall'
    },
    {
      step_id: 'q1',
      kind: 'PRACTICE_SET',
      question_ids: ['xizong-official-2024-n001','xizong-official-2023-n002'],
      study_phase: 'SECOND_PASS'
    }
  ]
};

const applied = applyXizongSessionInstruction(storage, instruction, { expectedDay: day, now });
assert.equal(applied.status, 'applied');
assert.equal(JSON.parse(storage.getItem(XIZONG_SESSION_KEY)).session_id, instruction.session_id);
assert.deepEqual(JSON.parse(storage.getItem(XIZONG_SESSION_RUNTIME_KEY)).activated_steps, []);
assert.equal(JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY)).attention['core:a1-b01-kp01'], undefined,
  'install must not pre-activate future native actions');
assert.equal(storage.getItem(XIZONG_CHAT_SET_KEY), null,
  'install must not pre-write later Practice Set');

const first = activateXizongSessionNext(storage, instruction, { now: now + 100 });
assert.equal(first.status, 'activated');
assert.equal(first.next.step.kind, 'MEMORY_REVIEW');
assert.equal(JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY)).attention['core:a1-b01-kp01'], undefined,
  'Chat-selected Memory must not mutate long-term weak/attention state');
assert.deepEqual(JSON.parse(storage.getItem(XIZONG_SESSION_RUNTIME_KEY)).activated_steps, ['m1']);
assert.match(first.next.href, /\/xizong\/memory\/\?session=/);

const repeatedActivation = activateXizongSessionNext(storage, instruction, { now: now + 200 });
assert.equal(repeatedActivation.status, 'active');
assert.deepEqual(JSON.parse(storage.getItem(XIZONG_SESSION_RUNTIME_KEY)).activated_steps, ['m1'],
  'reactivation must be idempotent');

const replay = applyXizongSessionInstruction(storage, instruction, { expectedDay: day, now: now + 300 });
assert.equal(replay.status, 'idempotent');

assert.throws(() => applyXizongSessionInstruction(storage, {
  ...instruction,
  session_id: 'older',
  generated_at: new Date(now - 1000).toISOString()
}, { expectedDay: day, now }), /OLDER_INSTRUCTION/);

// Any real post-session Recall event completes the action; fuzzy remains evidence.
const nextMemory = JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY));
nextMemory.evidence.push({
  id: 'memory:core:a1-b01-kp01:1',
  cardId: 'core:a1-b01-kp01',
  family: 'CORE',
  rating: 'fuzzy',
  origin: 'CORE_MEMORY_RECALL',
  at: new Date(now + 1200).toISOString()
});
storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(nextMemory));

const secondPending = resolveXizongSessionNext(storage, instruction);
assert.equal(secondPending.step.kind, 'PRACTICE_SET');
assert.equal(storage.getItem(XIZONG_CHAT_SET_KEY), null,
  'later Practice must remain unprojected until activated');

const second = activateXizongSessionNext(storage, instruction, { now: now + 1300, holdoutYears: [] });
assert.equal(second.status, 'activated');
assert.equal(second.next.step.kind, 'PRACTICE_SET');
assert.equal(JSON.parse(storage.getItem(XIZONG_CHAT_SET_KEY)).question_ids.length, 2);
assert.deepEqual(JSON.parse(storage.getItem(XIZONG_SESSION_RUNTIME_KEY)).activated_steps, ['m1','q1']);
assert.equal(JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY)).evidence.at(-1).rating, 'fuzzy',
  'session progression must not rewrite Recall quality');

assert.throws(() => applyXizongSessionInstruction(new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]: JSON.stringify(memory)
}), {
  ...instruction,
  session_id: 'dup-memory',
  steps: [{ step_id: 'm1', kind: 'MEMORY_REVIEW', card_ids: ['core:a1-b01-kp01','core:a1-b01-kp01'] }]
}, { expectedDay: day, now }), /MEMORY_CARD_IDS_DUPLICATE/);

assert.throws(() => applyXizongSessionInstruction(new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]: JSON.stringify(memory)
}), {
  ...instruction,
  session_id: 'dup-question',
  steps: [{ step_id: 'q1', kind: 'PRACTICE_SET', question_ids: ['xizong-official-2024-n001','xizong-official-2024-n001'] }]
}, { expectedDay: day, now }), /PRACTICE_IDS_DUPLICATE/);

const holdoutStorage = new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]: JSON.stringify(memory)
});
const holdoutInstruction = {
  ...instruction,
  session_id: 'holdout',
  steps: [{ step_id:'q1', kind:'PRACTICE_SET', question_ids:['xizong-official-2024-n001'] }]
};
applyXizongSessionInstruction(holdoutStorage, holdoutInstruction, { expectedDay: day, now });
assert.throws(() => activateXizongSessionNext(holdoutStorage, holdoutInstruction, {
  holdoutYears:[2024], now: now + 100
}), /PRACTICE_HOLDOUT_CONFLICT/);
assert.equal(holdoutStorage.getItem(XIZONG_CHAT_SET_KEY), null,
  'failed activation must not partially install Chat Set');
assert.deepEqual(JSON.parse(holdoutStorage.getItem(XIZONG_SESSION_RUNTIME_KEY)).activated_steps, [],
  'failed activation must not mark step active');

assert.throws(() => applyXizongSessionInstruction(new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]: JSON.stringify(memory)
}), {
  ...instruction,
  session_id:'bad-nav',
  steps:[
    {step_id:'n1',kind:'NAVIGATE',href:'/xizong/circulation/'},
    {step_id:'m1',kind:'MEMORY_REVIEW',card_ids:['core:a1-b01-kp01']}
  ]
}, {expectedDay:day,now}), /NAVIGATE_MUST_BE_TERMINAL/);

console.log('PASS Xizong session prototype: non-polluting Memory selection, lazy native projection, evidence completion, stale/holdout/idempotency guards');
