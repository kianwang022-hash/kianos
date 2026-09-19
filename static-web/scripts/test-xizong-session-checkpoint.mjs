import assert from 'node:assert/strict';
import {
  captureXizongPrivateCheckpoint,
  restoreXizongPrivateCheckpoint
} from '../src/lib/xizongPrivateCheckpoint.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  key(index) { return [...this.map.keys()][index] ?? null; }
  get length() { return this.map.size; }
}

const sessionKey='kianos:xizong:session-instruction:v1';
const runtimeKey='kianos:xizong:session-runtime:v1';
const handoffKey='kianos-xizong-chat-handoff-v1:handoff-durable';
const returnReceiptKey='kianos-xizong-chat-return-v1:handoff-durable';
const pendingReturnKey='kianos:xizong:pending-chat-return:v1';
const source=new MemoryStorage({
  [sessionKey]:JSON.stringify({
    schema:'kianos.xizong.session-instruction.v1',
    session_id:'xz-1',
    study_day:'2026-09-20',
    generated_at:'2026-09-20T01:00:00.000Z',
    steps:[{
      step_id:'m1',
      kind:'MEMORY_REVIEW',
      targets:[{card_id:'core:a1-b01-kp01',block_id:'a1-b01',source_hash:'h1'}]
    }]
  }),
  [runtimeKey]:JSON.stringify({
    schema:'kianos.xizong.session-runtime.v1',
    session_id:'xz-1',
    study_day:'2026-09-20',
    instruction_generated_at:'2026-09-20T01:00:00.000Z',
    current_step:0,
    activated_at:'2026-09-20T01:01:00.000Z',
    handoff_completed_at:null,
    status:'ACTIVE'
  }),
  [handoffKey]:JSON.stringify({
    schema:'kianos.xizong.chat_handoff.v1',
    handoff_id:'handoff-durable',
    created_at:'2026-09-20T01:00:00.000Z',
    origin:{object_id:'xizong:a1-b01',system_id:'circulation',block_id:'a1-b01',source_hash:'h1',evidence_version:'ev-1'},
    resume:{current_stage:'kp_recall',group_index:0,logic_group_id:'g1',kp_index:0,kp_id:'kp1',source_locator:'P1'},
    allowed_kp_ids:['kp1'],
    allowed_question_ids:[],
    return_href:'/xizong/circulation/b01/'
  }),
  [returnReceiptKey]:JSON.stringify({
    schema:'kianos.xizong.chat_return_receipt.v1',
    handoff_id:'handoff-durable',
    return_id:'return-durable',
    imported_at:'2026-09-20T01:02:00.000Z',
    return_packet:{schema:'kianos.xizong.chat_return.v1'},
    repair_task_ids:[]
  }),
  [pendingReturnKey]:JSON.stringify({
    schema:'kianos.xizong.pending-chat-return.v1',
    pending_by_object:{
      'xizong:a1-b01':{
        handoff_id:'handoff-durable',
        return_id:'return-pending',
        object_id:'xizong:a1-b01',
        system_id:'circulation',
        block_id:'a1-b01',
        source_hash:'h1',
        evidence_version:'ev-1',
        return_href:'/xizong/circulation/b01/',
        received_at:'2026-09-20T01:03:00.000Z',
        return_packet:{schema:'kianos.xizong.chat_return.v1'}
      }
    },
    last_receipt:null
  })
});

const checkpoint=captureXizongPrivateCheckpoint(source,{now:Date.parse('2026-09-20T02:00:00.000Z')});
assert.ok(checkpoint.entries.some((row)=>row.key===sessionKey));
assert.ok(checkpoint.entries.some((row)=>row.key===runtimeKey));
assert.ok(checkpoint.entries.some((row)=>row.key===handoffKey));
assert.ok(checkpoint.entries.some((row)=>row.key===returnReceiptKey));
assert.ok(checkpoint.entries.some((row)=>row.key===pendingReturnKey));

const target=new MemoryStorage();
const restored=restoreXizongPrivateCheckpoint(target,checkpoint,{onlyIfEmpty:true});
assert.equal(restored.status,'restored');
assert.equal(JSON.parse(target.getItem(sessionKey)).session_id,'xz-1');
assert.equal(JSON.parse(target.getItem(runtimeKey)).current_step,0);
assert.equal(JSON.parse(target.getItem(runtimeKey)).status,'ACTIVE');
assert.equal(JSON.parse(target.getItem(handoffKey)).handoff_id,'handoff-durable');
assert.equal(JSON.parse(target.getItem(returnReceiptKey)).return_id,'return-durable');
assert.equal(JSON.parse(target.getItem(pendingReturnKey)).pending_by_object['xizong:a1-b01'].return_id,'return-pending');

console.log('PASS Xizong session durability: immutable instruction + execution runtime captured/restored');
