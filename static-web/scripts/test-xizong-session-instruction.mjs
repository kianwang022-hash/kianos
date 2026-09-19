import assert from 'node:assert/strict';
import {
  XIZONG_SESSION_SCHEMA,
  XIZONG_SESSION_KEY,
  XIZONG_CHAT_SET_KEY,
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

const applied = applyXizongSessionInstruction(storage, instruction, { expectedDay: day, now, holdoutYears: [] });
assert.equal(applied.status, 'applied');
assert.equal(JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY)).attention['core:a1-b01-kp01'].reviewRequested, true);
assert.equal(JSON.parse(storage.getItem(XIZONG_CHAT_SET_KEY)).question_ids.length, 2);
assert.equal(JSON.parse(storage.getItem(XIZONG_SESSION_KEY)).session_id, instruction.session_id);

const replay = applyXizongSessionInstruction(storage, instruction, { expectedDay: day, now, holdoutYears: [] });
assert.equal(replay.status, 'idempotent');

assert.throws(() => applyXizongSessionInstruction(storage, {
  ...instruction,
  session_id: 'older',
  generated_at: new Date(now - 1000).toISOString()
}, { expectedDay: day, now }), /OLDER_INSTRUCTION/);

assert.throws(() => applyXizongSessionInstruction(new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]: JSON.stringify(memory)
}), {
  ...instruction,
  session_id: 'bad-card',
  steps: [{ step_id: 'm1', kind: 'MEMORY_REVIEW', card_ids: ['core:missing'] }]
}, { expectedDay: day, now }), /MEMORY_CARD_UNKNOWN/);

const holdoutStorage = new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]: JSON.stringify(memory)
});
assert.throws(() => applyXizongSessionInstruction(holdoutStorage, {
  ...instruction,
  session_id: 'holdout',
  steps: [{ step_id:'q1', kind:'PRACTICE_SET', question_ids:['xizong-official-2024-n001'] }]
}, { expectedDay: day, now, holdoutYears:[2024] }), /PRACTICE_HOLDOUT_CONFLICT/);
assert.equal(holdoutStorage.getItem(XIZONG_SESSION_KEY), null, 'failed validation must not partially install session');

const first = resolveXizongSessionNext(storage, instruction);
assert.equal(first.step.kind, 'MEMORY_REVIEW');
assert.equal(first.href, '/xizong/memory/');

// Any real post-session Recall event completes the requested action. The rating itself
// remains learner evidence and must not be promoted to mastery by the session layer.
const nextMemory = JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY));
nextMemory.evidence.push({
  id: 'memory:core:a1-b01-kp01:1',
  cardId: 'core:a1-b01-kp01',
  family: 'CORE',
  rating: 'fuzzy',
  origin: 'CORE_MEMORY_RECALL',
  at: new Date(now + 1000).toISOString()
});
storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(nextMemory));
const second = resolveXizongSessionNext(storage, instruction);
assert.equal(second.step.kind, 'PRACTICE_SET');
assert.equal(second.href, '/xizong/practice/chat-set/');
assert.equal(JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY)).evidence.at(-1).rating, 'fuzzy',
  'session completion must not rewrite Recall quality');

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

console.log('PASS Xizong session prototype: typed Memory + Practice dispatch, evidence-based completion, stale/holdout/idempotency guards');
