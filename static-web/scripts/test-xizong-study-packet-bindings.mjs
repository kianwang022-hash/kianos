import assert from 'node:assert/strict';
import { buildXizongStudyPacketFromStorage } from '../src/lib/xizongStudyPacket.mjs';
import { XIZONG_MEMORY_STORAGE_KEY, createXizongMemoryState } from '../src/lib/xizongMemoryModel.mjs';

class MemoryStorage {
  constructor(entries={}) { this.map=new Map(Object.entries(entries)); }
  getItem(key){ return this.map.has(key)?this.map.get(key):null; }
  setItem(key,value){ this.map.set(key,String(value)); }
  removeItem(key){ this.map.delete(key); }
  key(index){ return [...this.map.keys()][index] ?? null; }
  get length(){ return this.map.size; }
}

const memory=createXizongMemoryState();
memory.releasedBlocks['a1-b01']={
  blockId:'a1-b01',systemId:'circulation',canonicalId:'A1',
  blockLabel:'B1',blockTitle:'Demo',sourceHash:'h1',
  releasedAt:'2026-09-20T01:00:00.000Z',refreshedAt:'2026-09-20T01:00:00.000Z',
  coreCardIds:['core:a1-b01-kp01'],precisionCardIds:['precision:a1-b01-kp01:p1']
};
memory.cards['core:a1-b01-kp01']={
  id:'core:a1-b01-kp01',family:'CORE',systemId:'circulation',canonicalId:'A1',
  blockId:'a1-b01',blockLabel:'B1',kpId:'a1-b01-kp01',displayId:'KP01',
  title:'Demo Core',sourceHash:'h1'
};
memory.cards['precision:a1-b01-kp01:p1']={
  id:'precision:a1-b01-kp01:p1',family:'PRECISION',systemId:'circulation',canonicalId:'A1',
  blockId:'a1-b01',blockLabel:'B1',kpId:'a1-b01-kp01',title:'Demo Precision',
  sourceHash:'h1'
};
memory.attention['core:a1-b01-kp01']={
  reviewRequested:true,reason:'LEARNER_REQUESTED',updatedAt:'2026-09-20T02:00:00.000Z'
};
memory.repairTasks=[{
  id:'repair:demo',
  kpId:'a1-b01-kp01',
  blockId:'a1-b01',
  systemId:'circulation',
  title:'Demo Repair',
  reason:'bounded issue',
  action:'repair this point',
  priority:'high',
  origin:'SYSTEM_WU_CHAT_RETURN',
  sourceQuestionIds:['xizong-official-2024-n001'],
  blockHref:'/xizong/circulation/b01/',
  returnHref:'/xizong/practice/circulation/',
  createdAt:'2026-09-20T03:00:00.000Z',
  status:'ACTIVE'
}];

const storage=new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]:JSON.stringify(memory),
  'kianos-xizong-astro-v2:xizong:a1-b01':JSON.stringify({
    schema:'kianos.xizong.block-state.v2',
    stage:'kp_recall',
    groupIndex:0,
    kpIndex:0,
    learned:{'a1-b01-kp01':true},
    ratings:{'a1-b01-kp01':'fuzzy'},
    ttsxEvidence:{},
    ttsxAnnotations:{},
    pendingTtsx:null,
    blockRecallDone:false,
    completed:false
  })
});

const packet=buildXizongStudyPacketFromStorage({
  storage,
  packetMeta:{
    objectId:'xizong:a1-b01',
    blockId:'a1-b01',
    systemId:'circulation',
    canonicalId:'A1',
    blockLabel:'B1',
    blockTitle:'Demo',
    sourcePath:'content/xizong/demo.json',
    sourceHash:'h1'
  },
  kpRows:[{
    kpId:'a1-b01-kp01',
    displayId:'KP01',
    title:'Demo KP',
    groupId:'g1',
    groupLabel:'Group 1',
    sourceLocator:'P1',
    prompt:'Recall demo'
  }],
  now:Date.parse('2026-09-20T04:00:00.000Z')
});

assert.equal(packet.schema,'kianos.xizong.study_packet.v3');
assert.equal(packet.kp_evidence.length,1);
assert.deepEqual(packet.kp_evidence[0].memory_binding,{
  core_card_id:'core:a1-b01-kp01',
  source_hash:'h1',
  precision_card_ids:['precision:a1-b01-kp01:p1']
});
assert.equal(packet.memory.today[0].id,'core:a1-b01-kp01');
assert.equal(packet.memory.today[0].source_hash,'h1');
assert.equal(packet.memory.active_repairs[0].id,'repair:demo');
assert.equal(packet.memory.active_repairs[0].created_at,'2026-09-20T03:00:00.000Z');

const encoded=JSON.stringify(packet);
assert.equal(encoded.includes('"mastery_score"'),false);
assert.equal(encoded.includes('"scheduler_weight"'),false);

console.log('PASS Xizong study packet executable bindings: exact Memory + Repair identities without new mastery model');
