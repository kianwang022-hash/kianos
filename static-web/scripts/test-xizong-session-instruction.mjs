import assert from 'node:assert/strict';
import {
  XIZONG_SESSION_SCHEMA,
  XIZONG_SESSION_KEY,
  XIZONG_SESSION_STATE_KEY,
  XIZONG_CHAT_SET_KEY,
  applyXizongSessionInstruction,
  activateXizongSessionCurrentStep,
  advanceXizongSessionIfComplete,
  resolveXizongSessionNext,
  xizongChatSetSweepKey
} from '../src/lib/xizongSessionInstruction.mjs';
import {
  XIZONG_MEMORY_STORAGE_KEY,
  createXizongMemoryState
} from '../src/lib/xizongMemoryModel.mjs';

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

const makeStorage = () => new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]: JSON.stringify(memory)
});

const instruction = {
  schema: XIZONG_SESSION_SCHEMA,
  session_id: 'xz-20260920-1',
  study_day: day,
  generated_at: new Date(now).toISOString(),
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

const storage = makeStorage();
const applied = applyXizongSessionInstruction(storage, instruction, { expectedDay: day, now });
assert.equal(applied.status, 'applied');
assert.equal(JSON.parse(storage.getItem(XIZONG_SESSION_STATE_KEY)).current_step, 0);
assert.equal(
  JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY)).attention['core:a1-b01-kp01'],
  undefined,
  'installing the session must not activate future work'
);
assert.equal(storage.getItem(XIZONG_CHAT_SET_KEY), null, 'future Practice step must not be installed early');

const replay = applyXizongSessionInstruction(storage, instruction, { expectedDay: day, now });
assert.equal(replay.status, 'idempotent');

const activated = activateXizongSessionCurrentStep(storage, { now });
assert.equal(activated.status, 'activated');
let memoryState = JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY));
assert.equal(memoryState.attention['core:a1-b01-kp01'].reviewRequested, true);
assert.equal(
  memoryState.attention['core:a1-b01-kp01'].reason,
  'CHAT_SESSION:xz-20260920-1:m1'
);
assert.equal(storage.getItem(XIZONG_CHAT_SET_KEY), null, 'only current Memory step should be active');

let pending = advanceXizongSessionIfComplete(storage);
assert.equal(pending.status, 'pending', 'visiting/activating Memory is not completion');

// A real post-activation Memory recall event completes the task even if the rating is fuzzy.
memoryState = JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY));
memoryState.evidence.push({
  id: 'e1',
  cardId: 'core:a1-b01-kp01',
  family: 'CORE',
  rating: 'fuzzy',
  origin: 'CORE_MEMORY_RECALL',
  at: new Date(now + 1000).toISOString()
});
storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(memoryState));

const advanced = advanceXizongSessionIfComplete(storage);
assert.equal(advanced.status, 'advanced');
assert.equal(JSON.parse(storage.getItem(XIZONG_SESSION_STATE_KEY)).current_step, 1);

const practiceActivated = activateXizongSessionCurrentStep(storage, { now: now + 2000, holdoutYears: [] });
assert.equal(practiceActivated.status, 'activated');
const set = JSON.parse(storage.getItem(XIZONG_CHAT_SET_KEY));
assert.deepEqual(set.question_ids, instruction.steps[1].question_ids);
assert.equal(set.set_id, 'xz-20260920-1:q1');

const sweepKey = xizongChatSetSweepKey('xz-20260920-1', 'q1');
assert.equal(
  sweepKey,
  'kianos:xizong:chat-set-question-sweep:chat-set:xz-20260920-1:q1:v1',
  'completion must use the exact Runtime storage identity'
);
storage.setItem(sweepKey, JSON.stringify({
  results: {
    'xizong-official-2024-n001': { status: 'stable' },
    'xizong-official-2023-n002': { status: 'wrong' }
  }
}));
const completed = advanceXizongSessionIfComplete(storage);
assert.equal(completed.status, 'complete');
assert.equal(JSON.parse(storage.getItem(XIZONG_SESSION_STATE_KEY)).status, 'COMPLETE');
assert.equal(resolveXizongSessionNext(storage), null);

// Newer session supersedes active session and removes only Chat-owned attention.
const supersedeStorage = makeStorage();
applyXizongSessionInstruction(supersedeStorage, instruction, { expectedDay: day, now });
activateXizongSessionCurrentStep(supersedeStorage, { now });
const newer = {
  schema: XIZONG_SESSION_SCHEMA,
  session_id: 'xz-20260920-2',
  study_day: day,
  generated_at: new Date(now + 5000).toISOString(),
  steps: [{
    step_id: 'q2',
    kind: 'PRACTICE_SET',
    question_ids: ['xizong-official-2022-n003']
  }]
};
const superseded = applyXizongSessionInstruction(supersedeStorage, newer, {
  expectedDay: day,
  now: now + 5000
});
assert.equal(superseded.status, 'superseded');
assert.equal(
  JSON.parse(supersedeStorage.getItem(XIZONG_MEMORY_STORAGE_KEY)).attention['core:a1-b01-kp01'].reviewRequested,
  false,
  'superseding a session should remove its own pending Memory attention'
);

// Learner-owned attention must survive supersede.
const learnerStorage = makeStorage();
const learnerMemory = JSON.parse(learnerStorage.getItem(XIZONG_MEMORY_STORAGE_KEY));
learnerMemory.attention['core:a1-b01-kp01'] = {
  reviewRequested: true,
  reason: 'LEARNER_REQUESTED',
  updatedAt: new Date(now).toISOString()
};
learnerStorage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(learnerMemory));
applyXizongSessionInstruction(learnerStorage, instruction, { expectedDay: day, now });
applyXizongSessionInstruction(learnerStorage, newer, { expectedDay: day, now: now + 5000 });
assert.equal(
  JSON.parse(learnerStorage.getItem(XIZONG_MEMORY_STORAGE_KEY)).attention['core:a1-b01-kp01'].reviewRequested,
  true
);

// Older or conflicting replay cannot replace current instruction.
assert.throws(() => applyXizongSessionInstruction(storage, {
  ...instruction,
  session_id: 'older',
  generated_at: new Date(now - 1000).toISOString()
}, { expectedDay: day, now: now + 10_000 }), /OLDER_INSTRUCTION/);

assert.throws(() => applyXizongSessionInstruction(makeStorage(), {
  ...instruction,
  session_id: 'bad-card',
  steps: [{ step_id: 'm1', kind: 'MEMORY_REVIEW', card_ids: ['core:missing'] }]
}, { expectedDay: day, now }), /MEMORY_CARD_UNKNOWN/);

// Holdout is checked at activation, before Practice Set mutation.
const holdoutStorage = makeStorage();
const holdoutInstruction = {
  ...instruction,
  session_id: 'holdout',
  steps: [{ step_id:'q1', kind:'PRACTICE_SET', question_ids:['xizong-official-2024-n001'] }]
};
applyXizongSessionInstruction(holdoutStorage, holdoutInstruction, { expectedDay: day, now });
assert.throws(
  () => activateXizongSessionCurrentStep(holdoutStorage, { now, holdoutYears:[2024] }),
  /PRACTICE_HOLDOUT_CONFLICT/
);
assert.equal(holdoutStorage.getItem(XIZONG_CHAT_SET_KEY), null);
assert.equal(
  JSON.parse(holdoutStorage.getItem(XIZONG_SESSION_STATE_KEY)).activated_at,
  null,
  'failed activation must not advance runtime state'
);

// Previous-day instruction is rejected.
assert.throws(() => applyXizongSessionInstruction(makeStorage(), {
  ...instruction,
  session_id: 'stale-day',
  study_day: '2026-09-19'
}, { expectedDay: day, now }), /STALE_DAY/);

assert.equal(JSON.parse(storage.getItem(XIZONG_SESSION_KEY)).session_id, instruction.session_id);

console.log('PASS Xizong session prototype v2: ordered activation + evidence completion + exact sweep key + supersede/stale/holdout guards');
