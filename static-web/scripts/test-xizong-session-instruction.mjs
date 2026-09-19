import assert from 'node:assert/strict';
import {
  XIZONG_SESSION_SCHEMA,
  XIZONG_SESSION_KEY,
  acknowledgeXizongBlockReturn,
  XIZONG_SESSION_RUNTIME_KEY,
  XIZONG_CHAT_SET_KEY,
  applyXizongSessionInstruction,
  activateXizongSessionCurrentStep,
  advanceXizongSessionIfComplete,
  resolveXizongSessionNext,
  validateXizongSessionInstruction,
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
memory.releasedBlocks['a1-b01'] = {
  blockId: 'a1-b01',
  systemId: 'circulation',
  sourceHash: 'h1',
  releasedAt: new Date(now).toISOString(),
  refreshedAt: new Date(now).toISOString(),
  coreCardIds: ['core:a1-b01-kp01'],
  precisionCardIds: []
};
memory.cards['core:a1-b01-kp01'] = {
  id: 'core:a1-b01-kp01',
  family: 'CORE',
  blockId: 'a1-b01',
  kpId: 'a1-b01-kp01'
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
      targets: [{ card_id: 'core:a1-b01-kp01', block_id: 'a1-b01', source_hash: 'h1' }],
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
assert.equal(JSON.parse(storage.getItem(XIZONG_SESSION_RUNTIME_KEY)).current_step, 0);
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
assert.equal(
  memoryState.attention['core:a1-b01-kp01'],
  undefined,
  'activating a Chat-selected Memory step must not manufacture Weak/Today attention'
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
assert.equal(JSON.parse(storage.getItem(XIZONG_SESSION_RUNTIME_KEY)).current_step, 1);

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
  results: {},
  attemptHistory: [
    { type:'QUESTION_ATTEMPT', question_id:'xizong-official-2024-n001', status:'stable' },
    { type:'QUESTION_ATTEMPT', question_id:'xizong-official-2023-n002', status:'wrong' }
  ]
}));
const completed = advanceXizongSessionIfComplete(storage);
assert.equal(completed.status, 'complete');
assert.equal(JSON.parse(storage.getItem(XIZONG_SESSION_RUNTIME_KEY)).status, 'COMPLETE');
assert.equal(resolveXizongSessionNext(storage), null);

// Newer session supersedes active session without mutating long-term Memory attention.
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
  JSON.parse(supersedeStorage.getItem(XIZONG_MEMORY_STORAGE_KEY)).attention['core:a1-b01-kp01'],
  undefined,
  'superseding a session must not create or clear learner weakness state'
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
  steps: [{ step_id: 'm1', kind: 'MEMORY_REVIEW', targets: [{ card_id:'core:missing', block_id:'a1-b01', source_hash:'h1' }] }]
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
  JSON.parse(holdoutStorage.getItem(XIZONG_SESSION_RUNTIME_KEY)).activated_at,
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


const revisionStorage = makeStorage();
assert.throws(() => applyXizongSessionInstruction(revisionStorage, {
  ...instruction,
  session_id:'stale-memory-revision',
  steps:[{
    step_id:'m1',
    kind:'MEMORY_REVIEW',
    targets:[{card_id:'core:a1-b01-kp01',block_id:'a1-b01',source_hash:'old-hash'}]
  }]
}, { expectedDay: day, now }), /MEMORY_SOURCE_REVISION_MISMATCH/);



// SYSTEM_RECALL step uses append-preserved native Recall history after activation.
const systemRecallStorage = makeStorage();
const systemRecallInstruction = {
  schema: XIZONG_SESSION_SCHEMA,
  session_id: 'xz-system-recall',
  study_day: day,
  generated_at: new Date(now + 20_000).toISOString(),
  steps: [{
    step_id:'sr1',
    kind:'SYSTEM_RECALL',
    system_id:'circulation',
    label:'循环系统回忆'
  }]
};
applyXizongSessionInstruction(systemRecallStorage, systemRecallInstruction, {
  expectedDay:day,
  now:now + 20_000
});
const systemActivated = activateXizongSessionCurrentStep(systemRecallStorage, {
  now:now + 21_000
});
assert.equal(systemActivated.next.step.kind,'SYSTEM_RECALL');
assert.match(systemActivated.next.href,/\/xizong\/circulation\/recall\//);
systemRecallStorage.setItem('kianos:xizong:system-recall:circulation:v1', JSON.stringify({
  completedAt:new Date(now - 1000).toISOString(),
  history:[{
    event_id:'old',
    completed_at:new Date(now - 1000).toISOString(),
    after_round_id:null
  }]
}));
assert.equal(advanceXizongSessionIfComplete(systemRecallStorage).status,'pending',
  'historical System Recall must not complete a new Chat assignment');
systemRecallStorage.setItem('kianos:xizong:system-recall:circulation:v1', JSON.stringify({
  completedAt:new Date(now + 22_000).toISOString(),
  history:[
    {event_id:'old',completed_at:new Date(now - 1000).toISOString(),after_round_id:null},
    {event_id:'fresh',completed_at:new Date(now + 22_000).toISOString(),after_round_id:null}
  ]
}));
assert.equal(advanceXizongSessionIfComplete(systemRecallStorage).status,'complete',
  'fresh native System Recall event completes the assigned action');

// REPAIR_TASK binds exact task revision and completes only from native Repair completion.
const repairStorage = makeStorage();
const repairMemory = JSON.parse(repairStorage.getItem(XIZONG_MEMORY_STORAGE_KEY));
repairMemory.repairTasks = [{
  id:'repair:demo:a1-b01:kp01',
  kpId:'a1-b01-kp01',
  blockId:'a1-b01',
  systemId:'circulation',
  title:'Demo Repair',
  reason:'bounded issue',
  action:'repair only this point',
  priority:'high',
  origin:'SYSTEM_WU_CHAT_RETURN',
  sourceQuestionIds:['xizong-official-2024-n001'],
  blockHref:'/xizong/circulation/b01/',
  returnHref:'/xizong/practice/circulation/',
  createdAt:new Date(now + 30_000).toISOString(),
  status:'ACTIVE'
}];
repairStorage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(repairMemory));
const repairInstruction = {
  schema:XIZONG_SESSION_SCHEMA,
  session_id:'xz-repair-task',
  study_day:day,
  generated_at:new Date(now + 31_000).toISOString(),
  steps:[{
    step_id:'r1',
    kind:'REPAIR_TASK',
    task_id:'repair:demo:a1-b01:kp01',
    created_at:new Date(now + 30_000).toISOString(),
    block_id:'a1-b01',
    kp_id:'a1-b01-kp01',
    label:'修补这个断点'
  }]
};
applyXizongSessionInstruction(repairStorage, repairInstruction, {
  expectedDay:day,
  now:now + 31_000
});
const repairActivated = activateXizongSessionCurrentStep(repairStorage, {
  now:now + 32_000
});
assert.equal(repairActivated.next.step.kind,'REPAIR_TASK');
assert.match(repairActivated.next.href,/\/xizong\/memory\//);
assert.match(repairActivated.next.href,/repair=repair%3Ademo%3Aa1-b01%3Akp01/);
assert.equal(advanceXizongSessionIfComplete(repairStorage).status,'pending');
const repaired = JSON.parse(repairStorage.getItem(XIZONG_MEMORY_STORAGE_KEY));
repaired.repairTasks[0] = {
  ...repaired.repairTasks[0],
  status:'DONE',
  completedAt:new Date(now + 33_000).toISOString()
};
repairStorage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(repaired));
assert.equal(advanceXizongSessionIfComplete(repairStorage).status,'complete');

const staleRepairStorage = makeStorage();
const staleRepairMemory = JSON.parse(staleRepairStorage.getItem(XIZONG_MEMORY_STORAGE_KEY));
staleRepairMemory.repairTasks = [{
  id:'repair:same-id',
  kpId:'a1-b01-kp01',
  blockId:'a1-b01',
  createdAt:new Date(now + 40_000).toISOString(),
  status:'ACTIVE'
}];
staleRepairStorage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(staleRepairMemory));
assert.throws(() => applyXizongSessionInstruction(staleRepairStorage, {
  ...repairInstruction,
  session_id:'xz-repair-stale',
  generated_at:new Date(now + 41_000).toISOString(),
  steps:[{
    ...repairInstruction.steps[0],
    task_id:'repair:same-id',
    created_at:new Date(now + 39_000).toISOString()
  }]
}, { expectedDay:day, now:now + 41_000 }), /REPAIR_TASK_REVISION_MISMATCH/);

console.log('PASS Xizong native session extensions: System Recall + exact existing Repair');


// BLOCK_RETURN is terminal transport only: exact arrival, zero learner-evidence mutation.
const blockReturnStorage = makeStorage();
const memoryBeforeBlockReturn = blockReturnStorage.getItem(XIZONG_MEMORY_STORAGE_KEY);
const blockReturnInstruction = {
  schema:XIZONG_SESSION_SCHEMA,
  session_id:'xz-block-return',
  study_day:day,
  generated_at:new Date(now + 50_000).toISOString(),
  steps:[{
    step_id:'b1',
    kind:'BLOCK_RETURN',
    system_id:'circulation',
    block_id:'a1-b01',
    block_slug:'b01',
    source_hash:'h1',
    label:'回 B1 原讲义'
  }]
};
applyXizongSessionInstruction(blockReturnStorage, blockReturnInstruction, {
  expectedDay:day,
  now:now + 50_000
});
const blockActivated = activateXizongSessionCurrentStep(blockReturnStorage, {
  now:now + 51_000
});
assert.equal(blockActivated.next.step.kind,'BLOCK_RETURN');
assert.equal(blockActivated.next.terminal,true);
assert.match(blockActivated.next.href,/\/xizong\/circulation\/b01\//);

assert.throws(() => acknowledgeXizongBlockReturn(blockReturnStorage, {
  sessionId:'xz-block-return',
  stepId:'b1',
  systemId:'circulation',
  blockId:'a1-b01',
  blockSlug:'b01',
  sourceHash:'wrong-hash',
  now:now + 52_000
}), /BLOCK_RETURN_TARGET_MISMATCH/);
assert.equal(
  JSON.parse(blockReturnStorage.getItem(XIZONG_SESSION_RUNTIME_KEY)).status,
  'ACTIVE',
  'wrong landing identity must not complete transport'
);

const blockAck = acknowledgeXizongBlockReturn(blockReturnStorage, {
  sessionId:'xz-block-return',
  stepId:'b1',
  systemId:'circulation',
  blockId:'a1-b01',
  blockSlug:'b01',
  sourceHash:'h1',
  now:now + 53_000
});
assert.equal(blockAck.status,'complete');
assert.equal(
  JSON.parse(blockReturnStorage.getItem(XIZONG_SESSION_RUNTIME_KEY)).status,
  'COMPLETE'
);
assert.equal(
  blockReturnStorage.getItem(XIZONG_MEMORY_STORAGE_KEY),
  memoryBeforeBlockReturn,
  'transport arrival must not mutate learner Memory evidence'
);

assert.throws(() => validateXizongSessionInstruction({
  ...blockReturnInstruction,
  session_id:'xz-block-return-invalid-order',
  steps:[
    blockReturnInstruction.steps[0],
    {step_id:'q-after',kind:'PRACTICE_SET',question_ids:['xizong-official-2024-n001']}
  ]
}, day), /BLOCK_RETURN_MUST_BE_TERMINAL/);

console.log('PASS Xizong terminal Block return: exact target arrival without learner-evidence mutation');
