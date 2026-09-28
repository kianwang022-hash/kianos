import assert from 'node:assert/strict';
import {
  ENGLISH_SESSION_KEY,
  buildEnglishEvidencePacket,
  englishSessionStepHref,
  readEnglishSessionInstruction,
  resolveEnglishSessionStep,
  writeEnglishSessionInstruction
} from '../src/lib/englishSessionControl.mjs';

class MemoryStorage {
  constructor(entries={}){this.map=new Map(Object.entries(entries));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(key){return this.map.has(key)?this.map.get(key):null;}
  setItem(key,value){this.map.set(key,String(value));}
  removeItem(key){this.map.delete(key);}
}
const day='2026-09-19', now=Date.parse('2026-09-19T09:00:00+08:00');
const catalog=[{
  task:'external_reading',
  object_id:'tpo56-p1',
  source_hash:'external-content-hash-v1',
  label:'TPO56 · Passage 1'
}];
const instruction={
  schema:'kianos.english.session-instruction.v1',
  session_id:'external-session-1',
  study_day:day,
  generated_at:'2026-09-19T00:30:00.000Z',
  current_step:0,
  steps:[{
    step_id:'external-1',
    task:'external_reading',
    object_id:'tpo56-p1',
    source_hash:'external-content-hash-v1',
    label:'TPO56 · Passage 1',
    note:'Reading growth'
  }],
  return_policy:{on_finish:'english_home'}
};

const storage=new MemoryStorage();
const written=writeEnglishSessionInstruction(storage,instruction,day,{catalog,now});
assert.equal(written.steps[0].task,'external_reading');
assert.equal(readEnglishSessionInstruction(storage,day).status,'ready');
let selected=resolveEnglishSessionStep(storage,written,catalog);
assert.equal(selected.step.object_id,'tpo56-p1');
assert.equal(englishSessionStepHref(selected.step,'/'),'/external-reading/?id=tpo56-p1');

const packet=buildEnglishEvidencePacket(storage,{day,now,catalog});
assert.deepEqual(packet.available_external_reading,[{
  object_id:'tpo56-p1',
  source_hash:'external-content-hash-v1',
  label:'TPO56 · Passage 1'
}]);

const before=storage.getItem(ENGLISH_SESSION_KEY);
assert.throws(()=>writeEnglishSessionInstruction(storage,{
  ...instruction,
  session_id:'external-session-invalid',
  generated_at:'2026-09-19T00:31:00.000Z',
  steps:[{...instruction.steps[0],source_hash:'wrong'}]
},day,{catalog,now}),/SOURCE_REVISION_MISMATCH/);
assert.equal(storage.getItem(ENGLISH_SESSION_KEY),before,'invalid External return must not partially mutate instruction');

const replay=writeEnglishSessionInstruction(storage,instruction,day,{catalog,now});
assert.equal(replay.session_id,'external-session-1');
assert.equal(storage.getItem(ENGLISH_SESSION_KEY),before,'idempotent replay must be byte-stable');

storage.setItem('kianos-english-external-reading-attempt-v1:tpo56-p1',JSON.stringify({
  binding:{task:'external_reading',object_id:'tpo56-p1',source_hash:'external-content-hash-v1',attempt_id:'attempt-1',revision:1},
  stage:'completed',
  submitted:false
}));
selected=resolveEnglishSessionStep(storage,written,catalog);
assert.equal(selected,null,'completed External reading must not resurface as Resume debt');

console.log(JSON.stringify({
  status:'PASS',
  exact_external_id:'PASS',
  exact_external_resume_href:'PASS',
  stale_hash_rejected_atomically:'PASS',
  replay_idempotent:'PASS',
  factual_catalog_export:'PASS',
  completed_not_resume_debt:'PASS'
},null,2));
