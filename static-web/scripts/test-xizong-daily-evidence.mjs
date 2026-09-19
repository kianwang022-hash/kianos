import assert from 'node:assert/strict';
import { buildXizongDailyEvidencePacket } from '../src/lib/xizongDailyEvidence.mjs';
import { XIZONG_MEMORY_STORAGE_KEY, createXizongMemoryState } from '../src/lib/xizongMemoryModel.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  key(index) { return [...this.map.keys()][index] ?? null; }
  get length() { return this.map.size; }
}

const day='2026-09-20';
const memory=createXizongMemoryState();
memory.cards['core:a1-b01-kp01']={id:'core:a1-b01-kp01',family:'CORE',systemId:'circulation',blockId:'a1-b01',kpId:'a1-b01-kp01',sourceHash:'h1'};
memory.cards['precision:p2']={id:'precision:p2',family:'PRECISION',systemId:'respiratory',blockId:'a2-b03',kpId:'a2-b03-kp02',sourceHash:'h2'};
memory.evidence=[
  {id:'m1',cardId:'core:a1-b01-kp01',family:'CORE',rating:'fuzzy',origin:'CORE_MEMORY_RECALL',at:'2026-09-20T02:00:00.000Z'},
  {id:'m-old',cardId:'precision:p2',family:'PRECISION',rating:'known',origin:'PRECISION_MEMORY_RECALL',at:'2026-09-18T02:00:00.000Z'}
];
memory.repairTasks=[
  {id:'r1',systemId:'circulation',blockId:'a1-b01',kpId:'a1-b01-kp01',priority:'high',origin:'SYSTEM_WU_CHAT_RETURN',sourceQuestionIds:['xizong-official-2024-n001'],createdAt:'2026-09-20T02:10:00.000Z',status:'ACTIVE'},
  {id:'r2',systemId:'respiratory',blockId:'a2-b03',kpId:'a2-b03-kp02',priority:'normal',origin:'CHAT_OR_QUESTION_REPAIR',sourceQuestionIds:[],createdAt:'2026-09-19T02:10:00.000Z',completedAt:'2026-09-20T03:00:00.000Z',status:'DONE'}
];

const storage=new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]:JSON.stringify(memory),
  'kianos-xizong-memory-review-v2:xizong:a1-b01':JSON.stringify({
    evidenceHistory:[
      {type:'KP_RECALL',kp_id:'a1-b01-kp01',rating:'fuzzy',evidence_origin:'USER_RECALL_ATTEMPT',at:'2026-09-20T01:30:00.000Z'},
      {type:'KP_RECALL',kp_id:'a1-b01-kp02',rating:'known',evidence_origin:'BOOTSTRAP_EXISTING_STATE',at:'2026-09-20T01:31:00.000Z'}
    ]
  }),
  'kianos-xizong-memory-review-v2:xizong:a2-b03':JSON.stringify({
    evidenceHistory:[
      {type:'KP_RECALL',kp_id:'a2-b03-kp02',rating:'known',evidence_origin:'USER_RECALL_ATTEMPT',at:'2026-09-20T04:00:00.000Z'}
    ]
  }),
  'kianos-xizong-astro-v2:xizong:a1-b01':JSON.stringify({
    sourceContactEvidence:[{segment_id:'s1',coverage_kind:'ACCEPTED_SOURCE_SEGMENT',source_contact_mode:'NATURAL_SOURCE_UNIT',kp_ids:['a1-b01-kp01'],completed_at:'2026-09-20T01:00:00.000Z',source_hash:'h1'}],
    ttsxEvidence:{t1:{completedAt:'2026-09-20T01:10:00.000Z',checkpointIds:['t1'],annotations:{}}},
    blockRecallDone:true,
    blockRecallCompletedAt:'2026-09-20T01:20:00.000Z',
    completed:true,
    completedAt:'2026-09-20T01:25:00.000Z'
  }),
  'kianos:xizong:chat-set-question-sweep:chat-set:xz:q1:v1':JSON.stringify({
    attemptHistory:[
      {type:'QUESTION_ATTEMPT',evidence_origin:'USER_QUESTION_ATTEMPT',question_id:'xizong-official-2024-n001',status:'wrong',system_id:'chat-set:xz:q1',canonical_id:'CHAT',study_phase:'SECOND_PASS',context:'CHAT_SET',round_id:'round-1',submitted_at:'2026-09-20T05:00:00.000Z'},
      {type:'QUESTION_ATTEMPT',evidence_origin:'BOOTSTRAP_EXISTING_RESULT',question_id:'xizong-official-2023-n001',status:'stable',submitted_at:'2026-09-20T05:01:00.000Z'}
    ]
  }),
  'kianos:xizong:pending-chat-return:v1':JSON.stringify({
    schema:'kianos.xizong.pending-chat-return.v1',
    pending_by_object:{
      'xizong:a2-b03':{
        handoff_id:'h-pending',
        return_id:'r-pending',
        object_id:'xizong:a2-b03',
        system_id:'respiratory',
        block_id:'a2-b03',
        source_hash:'h2',
        evidence_version:'ev-pending',
        return_href:'/xizong/respiratory/b03/',
        received_at:'2026-09-19T23:30:00.000Z',
        return_packet:{schema:'kianos.xizong.chat_return.v1'}
      }
    },
    last_receipt:{
      schema:'kianos.xizong.pending-chat-return-receipt.v1',
      handoff_id:'h-applied',
      return_id:'r-applied',
      object_id:'xizong:a1-b01',
      system_id:'circulation',
      block_id:'a1-b01',
      source_hash:'h1',
      evidence_version:'ev-1',
      status:'APPLIED',
      decision:'REPAIR',
      repair_kp_ids:['a1-b01-kp01'],
      repair_tasks:[{
        task_id:'repair:block-chat:a1-b01:a1-b01-kp01',
        created_at:'2026-09-20T06:10:00.000Z',
        system_id:'circulation',
        block_id:'a1-b01',
        kp_id:'a1-b01-kp01',
        origin:'BLOCK_CHAT_RETURN'
      }],
      detail:'',
      at:'2026-09-20T06:10:00.000Z'
    }
  }),
  'kianos:xizong:system-recall:circulation:v1':JSON.stringify({
    completedAt:'2026-09-20T06:00:00.000Z',
    afterRoundId:'round-1',
    history:[
      {event_id:'sr-1',completed_at:'2026-09-19T06:00:00.000Z',after_round_id:null},
      {event_id:'sr-2',completed_at:'2026-09-20T06:00:00.000Z',after_round_id:'round-1'}
    ]
  })
});

const packet=buildXizongDailyEvidencePacket(storage,{
  day,
  now:Date.parse('2026-09-20T07:00:00.000Z'),
  currentBlockPacket:{schema:'kianos.xizong.study_packet.v3',current:{block_id:'a2-b03'}}
});

assert.equal(packet.schema,'kianos.xizong.daily_evidence.v1');
assert.equal(packet.current_block.current.block_id,'a2-b03');
assert.equal(packet.events.kp_recall.length,2,'cross-Block real KP Recall should be retained');
assert.equal(packet.events.block_recall.length,1);
assert.equal(packet.events.block_complete.length,1);
assert.equal(packet.events.kp_recall.some(x=>x.kp_id==='a1-b01-kp02'),false,'bootstrap Recall must not become today learner evidence');
assert.equal(packet.events.memory_recall.length,1);
assert.equal(packet.events.question_attempt.length,1,'bootstrap question compatibility row must be excluded');
assert.equal(packet.events.question_attempt[0].status,'wrong');
assert.equal(packet.events.repair_lifecycle.length,2,'created and completed Repair lifecycle events remain observations');
assert.equal(packet.events.system_recall.length,1);
assert.equal(packet.events.system_recall[0].event_id,'sr-2');
assert.equal(packet.events.source_contact.length,1);
assert.equal(packet.events.ttsx.length,1);
assert.equal(packet.coverage.block_recall_timestamp_history,'PROTOTYPE_FIRST_COMPLETION_TIMESTAMP');
assert.equal(packet.coverage.block_complete_timestamp_history,'PROTOTYPE_FIRST_COMPLETION_TIMESTAMP');
assert.equal(packet.coverage.system_recall_history,'PROTOTYPE_APPEND_PRESERVED_WITH_LEGACY_FALLBACK');
assert.equal(packet.evidence_semantics.repair_completed.includes('not mastery'),true);
assert.equal(packet.current.memory_today.some((row)=>row.card_id==='core:a1-b01-kp01'),true);
assert.equal(packet.current.memory_today.find((row)=>row.card_id==='core:a1-b01-kp01')?.source_hash,'h1');
assert.equal(packet.current.active_repairs[0].task_id,'r1');
assert.equal(packet.current.active_repairs[0].created_at,'2026-09-20T02:10:00.000Z');
assert.equal(packet.evidence_semantics.memory_today.includes('not mastery debt'),true);
assert.equal(packet.current.pending_chat_returns.length,1);
assert.equal(packet.current.pending_chat_returns[0].return_id,'r-pending',
  'unresolved pending Return remains visible even if received before this study day');
assert.equal(packet.current.chat_return_receipt.status,'APPLIED');
assert.equal(packet.current.chat_return_receipt.repair_tasks[0].origin,'BLOCK_CHAT_RETURN');
assert.equal(packet.evidence_semantics.chat_return_control.includes('transport/control state only'),true);

const oldReceiptStorage=new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]:JSON.stringify(createXizongMemoryState()),
  'kianos:xizong:pending-chat-return:v1':JSON.stringify({
    schema:'kianos.xizong.pending-chat-return.v1',
    pending_by_object:{},
    last_receipt:{
      schema:'kianos.xizong.pending-chat-return-receipt.v1',
      handoff_id:'old-h',
      return_id:'old-r',
      object_id:'xizong:old',
      status:'APPLIED',
      decision:'NO_ACTION',
      repair_kp_ids:[],
      repair_tasks:[],
      detail:'',
      at:'2026-09-19T05:00:00.000Z'
    }
  })
});
const oldReceiptPacket=buildXizongDailyEvidencePacket(oldReceiptStorage,{
  day,
  now:Date.parse('2026-09-20T07:00:00.000Z')
});
assert.equal(oldReceiptPacket.current.chat_return_receipt,null,
  'resolved transport receipts from prior study days must not pollute future Daily Packets');

console.log('PASS Xizong daily evidence prototype: cross-Block evidence + current executable/control state with bounded history');
