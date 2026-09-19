import assert from 'node:assert/strict';
import {
  XIZONG_SYSTEM_WU_RETURN_SCHEMA,
  XIZONG_SYSTEM_WU_PENDING_KEY,
  applyXizongSystemWuReturn,
  consumePendingXizongSystemWuReturn,
  readXizongSystemWuPendingState,
  stageXizongSystemWuReturn,
  validateXizongSystemWuReturn
} from '../src/lib/xizongSystemWuReturn.mjs';
import {
  XIZONG_MEMORY_STORAGE_KEY,
  createXizongMemoryState
} from '../src/lib/xizongMemoryModel.mjs';

class MemoryStorage {
  constructor(entries={}) { this.map=new Map(Object.entries(entries)); }
  getItem(key){ return this.map.has(key)?this.map.get(key):null; }
  setItem(key,value){ this.map.set(key,String(value)); }
  removeItem(key){ this.map.delete(key); }
  key(index){ return [...this.map.keys()][index] ?? null; }
  get length(){ return this.map.size; }
}

const systemId='circulation';
const sweepKey='kianos:xizong:system-question-sweep:'+systemId+':v1';
const questions=[
  {
    questionId:'xizong-official-2024-n001',
    relation:{blockId:'circulation-b01',primaryKpId:'circulation-b01-kp01'}
  },
  {
    questionId:'xizong-official-2023-n002',
    relation:null
  },
  {
    questionId:'xizong-official-2022-n003',
    relation:{blockId:'circulation-b02',primaryKpId:'circulation-b02-kp02'}
  }
];
const routes={
  'circulation-b01':{label:'B1',href:'/xizong/circulation/b01/'},
  'circulation-b02':{label:'B2',href:'/xizong/circulation/b02/'}
};
const memory=createXizongMemoryState();
const storage=new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]:JSON.stringify(memory),
  [sweepKey]:JSON.stringify({
    results:{
      'xizong-official-2024-n001':{status:'wrong',selected:['A']},
      'xizong-official-2023-n002':{status:'uncertain',selected:['B']},
      'xizong-official-2022-n003':{status:'stable',selected:['C']}
    }
  })
});

const returned={
  schema:XIZONG_SYSTEM_WU_RETURN_SCHEMA,
  return_id:'wu-return-1',
  system_id:systemId,
  decision:'REPAIR',
  plan:[
    {
      question_id:'xizong-official-2024-n001',
      reason:'机制链断点',
      action:'只修这个机制',
      priority:'high'
    },
    {
      question_id:'xizong-official-2023-n002',
      reason:'仍然不确定',
      action:'保留题号，不能猜映射',
      priority:'medium'
    }
  ]
};

const valid=validateXizongSystemWuReturn(returned,systemId);
assert.equal(valid.plan.length,2);
assert.throws(()=>validateXizongSystemWuReturn({
  ...returned,
  return_id:'bad-mapping',
  plan:[{question_id:'xizong-official-2024-n001',block_id:'circulation-b01',kp_id:'circulation-b01-kp01'}]
},systemId),/UNTRUSTED_MAPPING/);

const first=applyXizongSystemWuReturn(storage,returned,{
  questions,
  routes,
  practiceHref:'/xizong/practice/circulation/',
  now:Date.parse('2026-09-20T01:00:00Z')
});
assert.equal(first.status,'applied');
assert.equal(first.repair_tasks.length,1,'only reviewed relation may create Repair');
assert.equal(first.repair_tasks[0].id,'repair:system-wu:circulation:circulation-b01:circulation-b01-kp01');
assert.equal(first.repair_tasks[0].origin,'SYSTEM_WU_CHAT_RETURN');
assert.deepEqual(first.receipt.unmapped_question_ids,['xizong-official-2023-n002']);

const after=JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY));
assert.equal(after.repairTasks.length,1);
assert.equal(after.repairTasks[0].sourceQuestionIds[0],'xizong-official-2024-n001');
assert.equal(storage.getItem('kianos-xizong-repair-inbox-v1:xizong:circulation-b02'),null,
  'stable/unrequested relation must not create Repair');
assert.equal(storage.getItem('kianos-xizong-repair-inbox-v1:xizong:circulation-b01')!==null,true);

const repeated=applyXizongSystemWuReturn(storage,returned,{
  questions,routes,practiceHref:'/xizong/practice/circulation/'
});
assert.equal(repeated.status,'already_applied');
assert.equal(JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY)).repairTasks.length,1);

// Current W/U is authoritative: a stale Return cannot repair a question that is now stable.
const staleStorage=new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]:JSON.stringify(memory),
  [sweepKey]:JSON.stringify({
    results:{'xizong-official-2024-n001':{status:'stable'}}
  })
});
assert.throws(()=>applyXizongSystemWuReturn(staleStorage,{
  ...returned,
  return_id:'stale-return',
  plan:[returned.plan[0]]
},{questions,routes,practiceHref:'/xizong/practice/circulation/'}),/QUESTION_NOT_CURRENT_WU/);
assert.equal(JSON.parse(staleStorage.getItem(XIZONG_MEMORY_STORAGE_KEY)).repairTasks.length,0);

// NO_ACTION never creates Repair.
const noActionStorage=new MemoryStorage({
  [sweepKey]:JSON.stringify({results:{'xizong-official-2024-n001':{status:'wrong'}}})
});
const noAction=applyXizongSystemWuReturn(noActionStorage,{
  schema:XIZONG_SYSTEM_WU_RETURN_SCHEMA,
  return_id:'wu-none',
  system_id:systemId,
  decision:'NO_ACTION',
  plan:[],
  note:'当前不值得建立 Repair'
},{questions,routes,practiceHref:'/xizong/practice/circulation/'});
assert.equal(noAction.status,'applied');
assert.equal(noAction.repair_tasks.length,0);
assert.equal(noActionStorage.getItem(XIZONG_MEMORY_STORAGE_KEY),null);

// Pending route: staging is transport-only, exact System consumes against Current W/U.
const pendingStorage=new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]:JSON.stringify(memory),
  [sweepKey]:JSON.stringify({
    results:{
      'xizong-official-2024-n001':{status:'wrong'},
      'xizong-official-2023-n002':{status:'uncertain'}
    }
  })
});
const staged=stageXizongSystemWuReturn(pendingStorage,returned,{now:Date.parse('2026-09-20T02:00:00Z')});
assert.equal(staged.status,'staged');
assert.equal(JSON.parse(pendingStorage.getItem(XIZONG_MEMORY_STORAGE_KEY)).repairTasks.length,0,
  'staging must not mutate learner Repair');
assert.equal(readXizongSystemWuPendingState(pendingStorage).pending_by_system[systemId].return_id,'wu-return-1');

const consumed=consumePendingXizongSystemWuReturn(pendingStorage,{
  systemId,
  questions,
  routes,
  practiceHref:'/xizong/practice/circulation/',
  now:Date.parse('2026-09-20T02:01:00Z')
});
assert.equal(consumed.status,'applied');
assert.equal(consumed.receipt.repair_tasks.length,1);
assert.deepEqual(consumed.receipt.unmapped_question_ids,['xizong-official-2023-n002']);
assert.equal(readXizongSystemWuPendingState(pendingStorage).pending_by_system[systemId],undefined);

// Pending Return becomes STALE if learner state changes before System page consumes it.
const pendingStale=new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]:JSON.stringify(memory),
  [sweepKey]:JSON.stringify({results:{'xizong-official-2024-n001':{status:'wrong'}}})
});
stageXizongSystemWuReturn(pendingStale,{
  ...returned,
  return_id:'pending-stale',
  plan:[returned.plan[0]]
});
pendingStale.setItem(sweepKey,JSON.stringify({results:{'xizong-official-2024-n001':{status:'stable'}}}));
const staleConsume=consumePendingXizongSystemWuReturn(pendingStale,{
  systemId,questions,routes,practiceHref:'/xizong/practice/circulation/'
});
assert.equal(staleConsume.status,'stale');
assert.equal(JSON.parse(pendingStale.getItem(XIZONG_MEMORY_STORAGE_KEY)).repairTasks.length,0);

// Direct lower-level staging does not silently replace a pending plan.
const conflictStorage=new MemoryStorage({[sweepKey]:JSON.stringify({results:{}})});
stageXizongSystemWuReturn(conflictStorage,{
  schema:XIZONG_SYSTEM_WU_RETURN_SCHEMA,
  return_id:'a',system_id:systemId,decision:'NO_ACTION',plan:[]
});
assert.throws(()=>stageXizongSystemWuReturn(conflictStorage,{
  schema:XIZONG_SYSTEM_WU_RETURN_SCHEMA,
  return_id:'b',system_id:systemId,decision:'NO_ACTION',plan:[]
}),/SYSTEM_PENDING_CONFLICT/);

// Corrupt Memory must fail closed and preserve bytes.
const corruptMemoryStorage=new MemoryStorage({
  [XIZONG_MEMORY_STORAGE_KEY]:'{bad-json',
  [sweepKey]:JSON.stringify({results:{'xizong-official-2024-n001':{status:'wrong'}}})
});
assert.throws(()=>applyXizongSystemWuReturn(corruptMemoryStorage,{
  ...returned,
  return_id:'corrupt-memory',
  plan:[returned.plan[0]]
},{questions,routes,practiceHref:'/xizong/practice/circulation/'}),/MEMORY_STATE_CORRUPT/);
assert.equal(corruptMemoryStorage.getItem(XIZONG_MEMORY_STORAGE_KEY),'{bad-json');
assert.equal(corruptMemoryStorage.getItem('kianos:xizong:system-repair-return:circulation:v1'),null);

// Unknown question isn't accepted merely because Chat named it.
assert.throws(()=>applyXizongSystemWuReturn(new MemoryStorage({
  [sweepKey]:JSON.stringify({results:{'unknown-q':{status:'wrong'}}})
}),{
  ...returned,
  return_id:'unknown-q',
  plan:[{question_id:'unknown-q',reason:'x',action:'y',priority:'high'}]
},{questions,routes,practiceHref:'/xizong/practice/circulation/'}),/QUESTION_NOT_CURRENT_WU/);

assert.equal(JSON.parse(pendingStorage.getItem(XIZONG_SYSTEM_WU_PENDING_KEY)).last_receipt.status,'APPLIED');

console.log('PASS Xizong typed System W/U Return: current-W/U validation + reviewed-relation-only routing + canonical Memory Repair + stale/idempotent/fail-closed semantics');
