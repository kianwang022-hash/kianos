import assert from 'node:assert/strict';
import { XIZONG_MEMORY_STORAGE_KEY } from '../src/lib/xizongMemoryModel.mjs';
import {
  XIZONG_CHAT_RETURN_SCHEMA,
  applyXizongChatReturn,
  buildXizongChatExport,
  buildXizongChatHandoff,
  writeXizongChatHandoff,
  xizongStudyPacketEvidenceVersion
} from '../src/lib/xizongChatReturn.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

const packet = {
  schema: 'kianos.xizong.study_packet.v3',
  exported_at: '2026-09-19T01:00:00.000Z',
  current: {
    object_id: 'xizong:circulation-b01',
    system_id: 'circulation',
    canonical_id: 'A1',
    block_id: 'circulation-b01',
    block_label: 'B01',
    block_title: '循环',
    source_hash: 'sha256-current-b01'
  },
  learning_state: {
    current_stage: 'kp_recall',
    source_contact: { mode: 'NATURAL_SOURCE_UNIT', confirmed_segments: [{ id: 'seg-1', kp_ids: ['kp01'] }] },
    resume: {
      group_index: 0,
      logic_group_id: 'lg01',
      kp_index: 0,
      kp_id: 'kp01',
      source_locator: 'P10'
    },
    learned_kp_ids: ['kp01'],
    recall_ratings: { kp01: 'fuzzy' },
    block_recall_done: false,
    block_complete: false
  },
  summary: { unresolved_wu_questions: 1 },
  kp_evidence: [
    { kp_id: 'kp01', recall_rating: 'fuzzy' },
    { kp_id: 'kp02', recall_rating: '' }
  ],
  block_evidence_history: [
    { id: 'ev1', type: 'KP_RECALL', kp_id: 'kp01', rating: 'fuzzy', at: '2026-09-19T00:55:00Z' }
  ],
  memory: { active_repairs: [] },
  practice: {
    wrong_uncertain: [{ question_id: 'xizong-official-2025-n101', status: 'wrong', submitted_at: '2026-09-19T00:50:00Z' }],
    marked_question_ids: []
  }
};

const handoff = buildXizongChatHandoff(packet, {
  returnHref: '/xizong/circulation/b01/',
  now: Date.parse('2026-09-19T01:00:00Z'),
  makeId: () => 'handoff-test-1'
});
assert.equal(handoff.origin.evidence_version, xizongStudyPacketEvidenceVersion(packet));
assert.equal(handoff.resume.kp_id, 'kp01');
assert.deepEqual(handoff.allowed_kp_ids, ['kp01','kp02']);

const storage = new MemoryStorage();
writeXizongChatHandoff(storage, handoff);
const exported = buildXizongChatExport(packet, handoff);
assert.equal(exported.chat_return_contract.handoff_id, 'handoff-test-1');
assert.equal(exported.chat_return_contract.origin.evidence_version, handoff.origin.evidence_version);

const repairReturn = {
  schema: XIZONG_CHAT_RETURN_SCHEMA,
  return_id: 'return-1',
  handoff_id: handoff.handoff_id,
  origin: handoff.origin,
  resume: handoff.resume,
  decision: 'REPAIR',
  repairs: [{
    kp_id: 'kp01',
    reason: '机制链仍不稳',
    action: '只重建这一 KP 后回原任务',
    priority: 'high',
    source_question_ids: ['xizong-official-2025-n101']
  }]
};

const first = applyXizongChatReturn(storage, repairReturn, {
  currentPacket: packet,
  now: Date.parse('2026-09-19T01:05:00Z')
});
assert.equal(first.status, 'applied');
assert.equal(first.return_href, '/xizong/circulation/b01/');
assert.equal(first.resume.kp_id, 'kp01');

const inbox = JSON.parse(storage.getItem('kianos-xizong-repair-inbox-v1:xizong:circulation-b01'));
assert.equal(inbox.plans.length, 1);
assert.equal(inbox.plans[0].kpId, 'kp01');
assert.equal(inbox.plans[0].sourceHandoffId, handoff.handoff_id);

const memoryAfterReturn = JSON.parse(storage.getItem('kianos-xizong-memory-v1'));
assert.equal(memoryAfterReturn.repairTasks.length, 1);
assert.equal(memoryAfterReturn.repairTasks[0].id, 'repair:block-chat:circulation-b01:kp01');
assert.equal(memoryAfterReturn.repairTasks[0].origin, 'BLOCK_CHAT_RETURN');
assert.equal(memoryAfterReturn.repairTasks[0].kpId, 'kp01');
assert.equal(memoryAfterReturn.repairTasks[0].blockId, 'circulation-b01');
assert.equal(memoryAfterReturn.repairTasks[0].systemId, 'circulation');
assert.equal(memoryAfterReturn.repairTasks[0].sourceQuestionIds[0], 'xizong-official-2025-n101');
assert.equal(memoryAfterReturn.repairTasks[0].blockHref, '/xizong/circulation/b01/');
assert.equal(first.repair_tasks[0].createdAt, memoryAfterReturn.repairTasks[0].createdAt);

const repeated = applyXizongChatReturn(storage, repairReturn, { currentPacket: packet });
assert.equal(repeated.status, 'already_applied');
assert.equal(JSON.parse(storage.getItem('kianos-xizong-repair-inbox-v1:xizong:circulation-b01')).plans.length, 1,
  'idempotent re-import must not duplicate repair debt');
assert.equal(JSON.parse(storage.getItem('kianos-xizong-memory-v1')).repairTasks.length, 1,
  'idempotent re-import must not duplicate visible Memory Repair');

assert.throws(
  () => applyXizongChatReturn(storage, { ...repairReturn, return_id: 'return-conflict' }, { currentPacket: packet }),
  /RETURN_CONFLICT/
);

const stalePacket = JSON.parse(JSON.stringify(packet));
stalePacket.learning_state.recall_ratings.kp01 = 'mastered';
assert.throws(
  () => {
    const freshStorage = new MemoryStorage();
    writeXizongChatHandoff(freshStorage, handoff);
    applyXizongChatReturn(freshStorage, repairReturn, { currentPacket: stalePacket });
  },
  /STALE_EVIDENCE/
);

assert.throws(
  () => {
    const freshStorage = new MemoryStorage();
    writeXizongChatHandoff(freshStorage, handoff);
    applyXizongChatReturn(freshStorage, {
      ...repairReturn,
      repairs: [{ kp_id: 'unknown-kp', reason: 'x', action: 'y', priority: 'high' }]
    }, { currentPacket: packet });
  },
  /REPAIR_KP_INVALID/
);

assert.throws(
  () => {
    const freshStorage = new MemoryStorage();
    writeXizongChatHandoff(freshStorage, handoff);
    applyXizongChatReturn(freshStorage, {
      ...repairReturn,
      origin: { ...handoff.origin, source_hash: 'stale-source' }
    }, { currentPacket: packet });
  },
  /ORIGIN_MISMATCH:source_hash/
);

const noActionStorage = new MemoryStorage();
writeXizongChatHandoff(noActionStorage, handoff);
const noAction = applyXizongChatReturn(noActionStorage, {
  schema: XIZONG_CHAT_RETURN_SCHEMA,
  return_id: 'return-none',
  handoff_id: handoff.handoff_id,
  origin: handoff.origin,
  resume: handoff.resume,
  decision: 'NO_ACTION',
  repairs: [],
  note: '当前没有需要建立 Repair 的断点'
}, { currentPacket: packet });
assert.equal(noAction.status, 'applied');
assert.equal(noActionStorage.getItem('kianos-xizong-repair-inbox-v1:xizong:circulation-b01'), null);
assert.equal(noActionStorage.getItem('kianos-xizong-memory-v1'), null,
  'NO_ACTION must not manufacture Memory Repair state');

const preserveStorage = new MemoryStorage({
  'kianos-xizong-memory-v1': JSON.stringify({
    schema:'kianos.xizong.memory.v1',
    revision:1,
    releasedBlocks:{},
    cards:{},
    promptOverrides:{},
    marks:{},
    evidence:[],
    attention:{},
    repairTasks:[{
      id:'repair:existing',
      kpId:'other-kp',
      blockId:'other-block',
      systemId:'other-system',
      createdAt:'2026-09-18T00:00:00.000Z',
      status:'ACTIVE'
    }]
  })
});
writeXizongChatHandoff(preserveStorage, handoff);
applyXizongChatReturn(preserveStorage, repairReturn, {
  currentPacket:packet,
  now:Date.parse('2026-09-19T01:06:00Z')
});
assert.equal(JSON.parse(preserveStorage.getItem('kianos-xizong-memory-v1')).repairTasks.length,2,
  'typed Return must preserve unrelated existing Repair tasks');

class FailingStorage extends MemoryStorage {
  constructor(entries={}, failKey='') { super(entries); this.failKey=failKey; this.failed=false; }
  setItem(key,value) {
    if(key===this.failKey && !this.failed){ this.failed=true; throw new Error('SYNTHETIC_WRITE_FAIL'); }
    super.setItem(key,value);
  }
}
const rollbackStorage = new FailingStorage(
  {},
  'kianos-xizong-chat-return-v1:handoff-test-1'
);
writeXizongChatHandoff(rollbackStorage, handoff);
assert.throws(
  ()=>applyXizongChatReturn(rollbackStorage, repairReturn, {
    currentPacket:packet,
    now:Date.parse('2026-09-19T01:07:00Z')
  }),
  /SYNTHETIC_WRITE_FAIL/
);
assert.equal(rollbackStorage.getItem('kianos-xizong-repair-inbox-v1:xizong:circulation-b01'),null);
assert.equal(rollbackStorage.getItem('kianos-xizong-memory-v1'),null);
assert.equal(rollbackStorage.getItem('kianos-xizong-chat-return-v1:handoff-test-1'),null);

console.log('PASS Xizong typed Chat Return: exact identity/version + visible Memory Repair + resume + atomic/idempotent fail-closed');


const corruptMemoryStorage = new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]: '{bad-json'
});
writeXizongChatHandoff(corruptMemoryStorage, handoff);
assert.throws(
  () => applyXizongChatReturn(corruptMemoryStorage, repairReturn, { currentPacket: packet }),
  /MEMORY_STATE_CORRUPT/
);
assert.equal(corruptMemoryStorage.getItem(XIZONG_MEMORY_STORAGE_KEY), '{bad-json',
  'typed Return must preserve unreadable Memory bytes');
assert.equal(corruptMemoryStorage.getItem('kianos-xizong-repair-inbox-v1:xizong:circulation-b01'), null,
  'failed Memory mutation must roll back Repair inbox');
assert.equal(corruptMemoryStorage.getItem('kianos-xizong-chat-return-v1:'+handoff.handoff_id), null,
  'failed Memory mutation must not write Return receipt');
