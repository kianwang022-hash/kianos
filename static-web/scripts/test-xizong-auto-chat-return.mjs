import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  XIZONG_CHAT_RETURN_SCHEMA,
  attachXizongChatReturnContract,
  xizongStudyPacketEvidenceVersion
} from '../src/lib/xizongChatReturn.mjs';
import {
  XIZONG_PENDING_CHAT_RETURN_KEY,
  consumePendingXizongChatReturnForObject,
  pendingXizongChatReturnForObject,
  stageXizongChatReturn
} from '../src/lib/xizongPendingChatReturn.mjs';

class MemoryStorage {
  constructor(entries={}) { this.map=new Map(Object.entries(entries)); }
  getItem(key){ return this.map.has(key)?this.map.get(key):null; }
  setItem(key,value){ this.map.set(key,String(value)); }
  removeItem(key){ this.map.delete(key); }
  key(index){ return [...this.map.keys()][index] ?? null; }
  get length(){ return this.map.size; }
}

const basePacket=()=>({
  schema:'kianos.xizong.study_packet.v3',
  exported_at:'2026-09-20T01:00:00.000Z',
  current:{
    object_id:'xizong:circulation-b01',
    system_id:'circulation',
    canonical_id:'A1',
    block_id:'circulation-b01',
    block_label:'B01',
    block_title:'循环 Demo',
    source_hash:'source-b01-v1'
  },
  learning_state:{
    current_stage:'kp_recall',
    source_contact:{mode:'NATURAL_SOURCE_UNIT',confirmed_segments:[{segment_id:'s1',kp_ids:['kp01']}]},
    resume:{
      group_index:0,logic_group_id:'lg01',kp_index:0,kp_id:'kp01',source_locator:'P10'
    },
    learned_kp_ids:['kp01'],
    recall_ratings:{kp01:'fuzzy'},
    block_recall_done:false,
    block_complete:false
  },
  summary:{unresolved_wu_questions:1},
  kp_evidence:[
    {kp_id:'kp01',recall_rating:'fuzzy'},
    {kp_id:'kp02',recall_rating:''}
  ],
  block_evidence_history:[
    {id:'ev1',type:'KP_RECALL',kp_id:'kp01',rating:'fuzzy',at:'2026-09-20T00:55:00.000Z'}
  ],
  memory:{active_repairs:[]},
  practice:{
    wrong_uncertain:[{question_id:'xizong-official-2024-n001',status:'wrong',submitted_at:'2026-09-20T00:50:00.000Z'}],
    marked_question_ids:[]
  }
});

function repairReturn(exported, returnId='return-1'){
  const contract=exported.chat_return_contract;
  return {
    schema:XIZONG_CHAT_RETURN_SCHEMA,
    return_id:returnId,
    handoff_id:contract.handoff_id,
    origin:contract.origin,
    resume:contract.resume,
    decision:'REPAIR',
    repairs:[{
      kp_id:'kp01',
      reason:'机制链仍不稳',
      action:'只修这一 KP 后回原任务',
      priority:'high',
      source_question_ids:['xizong-official-2024-n001']
    }]
  };
}

const packet=basePacket();
const storage=new MemoryStorage();
const exported1=attachXizongChatReturnContract(storage,packet,{
  returnHref:'/xizong/circulation/b01/',
  now:Date.parse('2026-09-20T01:00:00.000Z')
});
const exported2=attachXizongChatReturnContract(storage,packet,{
  returnHref:'/xizong/circulation/b01/',
  now:Date.parse('2026-09-20T01:05:00.000Z')
});
assert.equal(exported1.chat_return_contract.handoff_id,exported2.chat_return_contract.handoff_id,
  'same current evidence must reuse one stable handoff');
assert.equal(exported1.chat_return_contract.origin.evidence_version,xizongStudyPacketEvidenceVersion(packet));
assert.deepEqual(exported1.chat_return_contract.allowed_kp_ids,['kp01','kp02']);
assert.deepEqual(exported1.chat_return_contract.allowed_question_ids,['xizong-official-2024-n001']);
assert.equal([...storage.map.keys()].filter(k=>k.startsWith('kianos-xizong-chat-handoff-v1:')).length,1);

const ret=repairReturn(exported1);
const staged=stageXizongChatReturn(storage,ret,{now:Date.parse('2026-09-20T01:06:00.000Z')});
assert.equal(staged.status,'staged');
assert.equal(staged.entry.object_id,'xizong:circulation-b01');
assert.equal(pendingXizongChatReturnForObject(storage,'xizong:circulation-b01').return_id,'return-1');

const stagedAgain=stageXizongChatReturn(storage,ret,{now:Date.parse('2026-09-20T01:07:00.000Z')});
assert.equal(stagedAgain.status,'already_staged');
assert.equal(
  consumePendingXizongChatReturnForObject(storage,{
    objectId:'xizong:other-block',
    currentPacket:packet
  }).status,
  'no_pending',
  'wrong Block must not consume a pending Return'
);

// Changed evidence invalidates the old Return and creates zero Repair.
const stalePacket=basePacket();
stalePacket.learning_state.recall_ratings.kp01='mastered';
const stale=consumePendingXizongChatReturnForObject(storage,{
  objectId:'xizong:circulation-b01',
  currentPacket:stalePacket,
  now:Date.parse('2026-09-20T01:08:00.000Z')
});
assert.equal(stale.status,'stale');
assert.equal(storage.getItem('kianos-xizong-repair-inbox-v1:xizong:circulation-b01'),null);
assert.equal(pendingXizongChatReturnForObject(storage,'xizong:circulation-b01'),null);
assert.equal(JSON.parse(storage.getItem(XIZONG_PENDING_CHAT_RETURN_KEY)).last_receipt.status,'STALE');

// Fresh path applies through the existing typed Return owner.
const goodStorage=new MemoryStorage();
const goodPacket=basePacket();
const goodExport=attachXizongChatReturnContract(goodStorage,goodPacket,{
  returnHref:'/xizong/circulation/b01/',
  now:Date.parse('2026-09-20T02:00:00.000Z')
});
const goodReturn=repairReturn(goodExport,'return-good');
stageXizongChatReturn(goodStorage,goodReturn,{now:Date.parse('2026-09-20T02:01:00.000Z')});
const applied=consumePendingXizongChatReturnForObject(goodStorage,{
  objectId:'xizong:circulation-b01',
  currentPacket:goodPacket,
  now:Date.parse('2026-09-20T02:02:00.000Z')
});
assert.equal(applied.status,'applied');
assert.equal(applied.receipt.decision,'REPAIR');
assert.deepEqual(applied.receipt.repair_kp_ids,['kp01']);
const inbox=JSON.parse(goodStorage.getItem('kianos-xizong-repair-inbox-v1:xizong:circulation-b01'));
assert.equal(inbox.plans.length,1);
assert.equal(inbox.plans[0].kpId,'kp01');
assert.equal(inbox.plans[0].sourceHandoffId,goodExport.chat_return_contract.handoff_id);
const visibleRepair = JSON.parse(goodStorage.getItem('kianos-xizong-memory-v1')).repairTasks[0];
assert.equal(visibleRepair.id,'repair:block-chat:circulation-b01:kp01');
assert.equal(visibleRepair.origin,'BLOCK_CHAT_RETURN');
assert.equal(applied.receipt.repair_tasks.length,1);
assert.equal(applied.receipt.repair_tasks[0].task_id,visibleRepair.id);
assert.equal(applied.receipt.repair_tasks[0].created_at,visibleRepair.createdAt);
assert.equal(pendingXizongChatReturnForObject(goodStorage,'xizong:circulation-b01'),null);

// Re-staging the already-applied exact Return is harmless and idempotent at apply time.
stageXizongChatReturn(goodStorage,goodReturn,{now:Date.parse('2026-09-20T02:03:00.000Z')});
const repeated=consumePendingXizongChatReturnForObject(goodStorage,{
  objectId:'xizong:circulation-b01',
  currentPacket:goodPacket,
  now:Date.parse('2026-09-20T02:04:00.000Z')
});
assert.equal(repeated.status,'already_applied');
assert.equal(JSON.parse(goodStorage.getItem('kianos-xizong-repair-inbox-v1:xizong:circulation-b01')).plans.length,1);
assert.equal(JSON.parse(goodStorage.getItem('kianos-xizong-memory-v1')).repairTasks.length,1);

// NO_ACTION clears pending with no repair mutation.
const noActionStorage=new MemoryStorage();
const noActionPacket=basePacket();
const noActionExport=attachXizongChatReturnContract(noActionStorage,noActionPacket,{
  returnHref:'/xizong/circulation/b01/',
  now:Date.parse('2026-09-20T03:00:00.000Z')
});
const noAction={
  schema:XIZONG_CHAT_RETURN_SCHEMA,
  return_id:'return-none',
  handoff_id:noActionExport.chat_return_contract.handoff_id,
  origin:noActionExport.chat_return_contract.origin,
  resume:noActionExport.chat_return_contract.resume,
  decision:'NO_ACTION',
  repairs:[],
  note:'当前不值得制造额外 Repair'
};
stageXizongChatReturn(noActionStorage,noAction,{now:Date.parse('2026-09-20T03:01:00.000Z')});
const noActionResult=consumePendingXizongChatReturnForObject(noActionStorage,{
  objectId:'xizong:circulation-b01',
  currentPacket:noActionPacket,
  now:Date.parse('2026-09-20T03:02:00.000Z')
});
assert.equal(noActionResult.status,'applied');
assert.equal(noActionResult.receipt.decision,'NO_ACTION');
assert.equal(noActionStorage.getItem('kianos-xizong-repair-inbox-v1:xizong:circulation-b01'),null);

// A different pending Return for the same object cannot silently overwrite the first.
const conflictStorage=new MemoryStorage();
const conflictPacket=basePacket();
const conflictExport=attachXizongChatReturnContract(conflictStorage,conflictPacket,{
  returnHref:'/xizong/circulation/b01/'
});
stageXizongChatReturn(conflictStorage,repairReturn(conflictExport,'return-a'));
assert.throws(
  ()=>stageXizongChatReturn(conflictStorage,repairReturn(conflictExport,'return-b')),
  /OBJECT_PENDING_CONFLICT/
);

const here=path.dirname(fileURLToPath(import.meta.url));
const client=fs.readFileSync(path.join(here,'../src/lib/examOrchestratorClient.mjs'),'utf8');
assert.match(client,/attachXizongChatReturnContract/);
assert.match(client,/xizongEvidence\.current_block\s*=\s*attachXizongChatReturnContract/);

console.log('PASS Xizong automatic typed Return round-trip: stable handoff + pending route + fresh Block validation + stale/idempotent/NO_ACTION safety');
