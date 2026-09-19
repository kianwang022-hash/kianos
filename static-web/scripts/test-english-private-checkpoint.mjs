import assert from 'node:assert/strict';
import {
  restoreSharedControlFromPrivate,
  saveSharedControlToPrivate
} from '../src/lib/privateCheckpointRuntime.mjs';
import {
  EXAM_PROFILE_KEY,
  emptyExamProfile
} from '../src/lib/examOrchestrator.mjs';

class MemoryStorage {
  constructor(entries={}){this.map=new Map(Object.entries(entries));this.failKey=null;}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(key){return this.map.has(key)?this.map.get(key):null;}
  setItem(key,value){if(this.failKey===key)throw new Error('SYNTHETIC_WRITE_FAILURE:'+key);this.map.set(key,String(value));}
  removeItem(key){this.map.delete(key);}
}
const now=Date.parse('2026-09-19T02:00:00Z');
const externalKey='kianos-english-external-reading-attempt-v1:tpo56-p1';
const exposureKey='kianos-english-material-exposure-v1';
const lexicalKey='kianos-vocabulary-routing-v1';
const externalValue={
  binding:{task:'external_reading',object_id:'tpo56-p1',source_hash:'hash-v1',attempt_id:'a1',revision:1},
  stage:'completed',
  submitted:false
};
const exposureValue={
  schema:'kianos.english.material-exposure.v1',
  materials:{'tpo56-p1':{object_id:'tpo56-p1',events:[{event_id:'a1:opened',attempt_id:'a1',source_hash:'hash-v1',context:'study',event:'opened',at:'2026-09-19T02:00:00.000Z'}]}}
};
const source=new MemoryStorage({
  [externalKey]:JSON.stringify(externalValue),
  [exposureKey]:JSON.stringify(exposureValue),
  [lexicalKey]:JSON.stringify({word_id:'example',state:'known'})
});

let checkpoint=null;
await saveSharedControlToPrivate(source,{
  now,
  readCheckpoint:async()=>({status:'missing',checkpoint:null}),
  writeCheckpoint:async value=>{checkpoint=value;return{status:'saved'};}
});
assert.equal(checkpoint.payload.subjects.english.schema,'kianos.english.private-payload.v1');
assert.equal(checkpoint.payload.subjects.lexical.schema,'kianos.lexical.private-payload.v1');
assert.equal(checkpoint.payload.subjects.english.entries[externalKey],JSON.stringify(externalValue));
assert.equal(checkpoint.payload.subjects.english.entries[exposureKey],JSON.stringify(exposureValue));

const wiped=new MemoryStorage();
const restored=await restoreSharedControlFromPrivate(wiped,{
  now,
  readCheckpoint:async()=>({status:'ready',checkpoint})
});
assert.equal(restored.status,'restored');
assert.equal(JSON.parse(wiped.getItem(externalKey)).stage,'completed');
assert.equal(JSON.parse(wiped.getItem(exposureKey)).materials['tpo56-p1'].events[0].event,'opened');
assert.equal(JSON.parse(wiped.getItem(lexicalKey)).state,'known');

const localEnglish=new MemoryStorage({
  [externalKey]:JSON.stringify({...externalValue,stage:'active'})
});
const keepLocal=await restoreSharedControlFromPrivate(localEnglish,{
  now,
  readCheckpoint:async()=>({status:'ready',checkpoint})
});
assert.equal(JSON.parse(localEnglish.getItem(externalKey)).stage,'active','existing English learner evidence must win over remote restore');
assert.equal(JSON.parse(localEnglish.getItem(lexicalKey)).state,'known','independent empty Lexical subject may still restore');
assert.equal(keepLocal.subjects.english.status,'skipped');
assert.equal(keepLocal.subjects.lexical.status,'restored');

const invalid=JSON.parse(JSON.stringify(checkpoint));
invalid.payload.subjects.lexical.entries[lexicalKey]='{broken-json';
const invalidTarget=new MemoryStorage();
const invalidResult=await restoreSharedControlFromPrivate(invalidTarget,{
  now,
  readCheckpoint:async()=>({status:'ready',checkpoint:invalid})
});
assert.equal(invalidResult.status,'invalid');
assert.equal(invalidTarget.getItem(externalKey),null,'invalid remote subject must authorize zero subject writes');
assert.equal(invalidTarget.getItem(EXAM_PROFILE_KEY),null,'invalid remote subject must authorize zero shared writes');

const failing=new MemoryStorage();
failing.failKey=lexicalKey;
await assert.rejects(
  ()=>restoreSharedControlFromPrivate(failing,{
    now,
    readCheckpoint:async()=>({status:'ready',checkpoint})
  }),
  /SYNTHETIC_WRITE_FAILURE/
);
assert.equal(failing.getItem(externalKey),null,'cross-subject write failure must roll back English');
assert.equal(failing.getItem(exposureKey),null,'cross-subject write failure must roll back exposure');
assert.equal(failing.getItem(lexicalKey),null,'failed Lexical write must leave no partial state');
assert.equal(failing.getItem(EXAM_PROFILE_KEY),null,'cross-subject failure must roll back shared controls');

let unsafeWrites=0;
await assert.rejects(
  ()=>saveSharedControlToPrivate(source,{
    now,
    readCheckpoint:async()=>({status:'unavailable',checkpoint:null,error:'disk unavailable'}),
    writeCheckpoint:async()=>{unsafeWrites+=1;}
  }),
  /PRIVATE_CHECKPOINT_EXISTING_READ_UNSAFE/
);
assert.equal(unsafeWrites,0);

console.log(JSON.stringify({
  status:'PASS',
  english_external_checkpoint:'PASS',
  lexical_checkpoint:'PASS',
  per_subject_keep_local:'PASS',
  invalid_remote_zero_write:'PASS',
  cross_subject_atomic_rollback:'PASS',
  unsafe_read_zero_write:'PASS'
},null,2));
