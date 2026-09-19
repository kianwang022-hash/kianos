import assert from 'node:assert/strict';
import {
  ENGLISH_SESSION_SCHEMA,
  resolveEnglishSessionStep,
  englishSessionStepHref
} from '../src/lib/englishSessionControl.mjs';
import {buildChatControlledExamReadModel} from '../src/lib/examPlanReadModel.mjs';

class Storage{
  constructor(entries={}){this.map=new Map(Object.entries(entries));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.get(k)??null;}
  setItem(k,v){this.map.set(k,String(v));}
  removeItem(k){this.map.delete(k);}
}

const day='2026-09-20';
const sessionId='english-chain-1';
const catalog=[
  {task:'external_reading',object_id:'external-chat-2026-09-20-a',source_hash:'ha',study_day:day},
  {task:'external_reading',object_id:'external-chat-2026-09-20-b',source_hash:'hb',study_day:day}
];
const instruction={
  schema:ENGLISH_SESSION_SCHEMA,
  session_id:sessionId,
  study_day:day,
  generated_at:'2026-09-20T02:00:00+08:00',
  current_step:0,
  steps:[
    {step_id:'a',task:'external_reading',object_id:catalog[0].object_id,source_hash:'ha',label:'A',params:{}},
    {step_id:'b',task:'external_reading',object_id:catalog[1].object_id,source_hash:'hb',label:'B',params:{}}
  ],
  return_policy:{on_finish:'english_home'}
};
const attempt=(hash,submitted)=>JSON.stringify({
  binding:{source_hash:hash,source_snapshot:{completion_requirement:'QUESTIONS_SUBMITTED'}},
  submitted,
  stage:submitted?'submitted':'active',
  results:{}
});
const storage=new Storage({
  ['kianos-english-external-reading-attempt-v1:'+catalog[0].object_id]:attempt('ha',true),
  ['kianos-english-external-reading-attempt-v1:'+catalog[1].object_id]:attempt('hb',false)
});
let step=resolveEnglishSessionStep(storage,instruction,catalog);
assert.equal(step.index,1,'subject session should mechanically advance inside Chat-authored order');
assert.equal(step.step.object_id,catalog[1].object_id);

const plan={
  schema:'kianos.exam.chat-plan.v1',
  study_day:day,
  generated_at:'2026-09-20T02:01:00+08:00',
  subjects:{
    xizong:null,
    english:{target_minutes:60,role:'稳推进',note:'',session_ref:sessionId},
    politics:null
  },
  next_subject:'english',
  attention:null
};
let model=buildChatControlledExamReadModel({
  day,
  chatPlanState:{status:'ready',plan},
  nativeContinue:{
    english:{href:englishSessionStepHref(step.step,'/'),title:'B',sessionRef:sessionId},
    politics:{href:'/politics/practice/',title:'政治'}
  }
});
assert.equal(model.next?.subject,'english');
assert.equal(model.next?.href,'/external-reading/?id='+catalog[1].object_id);

storage.setItem('kianos-english-external-reading-attempt-v1:'+catalog[1].object_id,attempt('hb',true));
step=resolveEnglishSessionStep(storage,instruction,catalog);
assert.equal(step,null,'English session is now complete');

model=buildChatControlledExamReadModel({
  day,
  chatPlanState:{status:'ready',plan},
  nativeContinue:{
    english:null,
    politics:{href:'/politics/practice/',title:'政治'}
  }
});
assert.equal(model.next,null,'completed English session must wait for Chat; Home must not auto-switch subjects');
assert.equal(model.control.strategyOwner,'CHAT');

console.log('PASS English subject-local sequencing without autonomous cross-subject switch');
