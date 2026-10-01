import assert from 'node:assert/strict';
import { preparePrivateCheckpointBootstrap, saveSharedControlToPrivate } from '../src/lib/privateCheckpointRuntime.mjs';
import { commitLearnerStorageChanges } from '../src/lib/browserLearnerWriter.mjs';
import { EXAM_PROFILE_KEY, emptyExamProfile } from '../src/lib/examOrchestrator.mjs';
import { STUDY_TIMER_STATE_KEY, STUDY_TIMER_LEDGER_KEY, STUDY_TIMER_SCHEMA, emptyStudyTimerState } from '../src/lib/studyTimer.mjs';
import { PRACTICE_KEYS } from '../src/lib/politicsPracticeState.mjs';
class Storage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  get length() { return this.map.size; }
  key(i) { return [...this.map.keys()][i] ?? null; }
  getItem(key) { return this.map.get(key) ?? null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}
const xkey = 'kianos-xizong-astro-v2:xizong:circulation-b02';
const ekey = 'kianos-english-material-exposure-v1';
const lkey = 'kianos-vocabulary-last-ordinal';
const entries = {
  [EXAM_PROFILE_KEY]: JSON.stringify(emptyExamProfile()),
  [STUDY_TIMER_STATE_KEY]: JSON.stringify(emptyStudyTimerState()),
  [STUDY_TIMER_LEDGER_KEY]: JSON.stringify({schema:STUDY_TIMER_SCHEMA,sessions:[]}),
  [xkey]: JSON.stringify({stage:'source_contact',kpIndex:4,groupIndex:1,learned:{},ratings:{},completed:false,sourceHash:'synthetic-bootstrap-source'}),
  [ekey]: JSON.stringify({schema:'kianos.english.material-exposure.v1',materials:{fixture:{object_id:'fixture',events:[]}}}),
  [lkey]: '81',
  [PRACTICE_KEYS.meta]: JSON.stringify({latestOutcome:{},notes:{P1:'synthetic'},causes:{}})
};
let durable;
const seeded = await saveSharedControlToPrivate(new Storage(entries), {readCheckpoint:async()=>({status:'missing',checkpoint:null}),writeCheckpoint:async c=>{durable=c;}});
assert.equal(seeded.status, 'saved');
const readCheckpoint = async () => ({status:'ready',checkpoint:durable});
const empty = new Storage();
const prepared = await preparePrivateCheckpointBootstrap(empty, {readCheckpoint});
assert.equal(empty.length, 0, 'preparation must not write native state');
commitLearnerStorageChanges(empty, prepared.changes, prepared.expected);
for (const [key, raw] of Object.entries(entries)) assert.equal(empty.getItem(key), raw, 'restore exact native owner: '+key);
const saved = await saveSharedControlToPrivate(empty, {readCheckpoint,writeCheckpoint:async()=>{}});
assert.equal(saved.status, 'saved', 'recovered lineage admits subsequent native saving');
const different = JSON.stringify({...JSON.parse(entries[xkey]),kpIndex:9});
const conflict = new Storage({...entries,[xkey]:different});
const conflictPrepared = await preparePrivateCheckpointBootstrap(conflict, {readCheckpoint});
commitLearnerStorageChanges(conflict, conflictPrepared.changes, conflictPrepared.expected);
assert.equal(conflict.getItem(xkey), different, 'bootstrap must not silently choose durable over conflicting local truth');
const conflictSaved = await saveSharedControlToPrivate(conflict, {readCheckpoint,writeCheckpoint:async()=>{}});
assert.ok(conflictSaved.warnings.some(row=>row==='checkpoint:xizong:PRIVATE_CHECKPOINT_LOCAL_BASE_CONFLICT'));
assert.ok(!conflictSaved.warnings.some(row=>row.startsWith('checkpoint:english+lexical:')||row.startsWith('checkpoint:politics:')), 'healthy subject groups remain independent');
const stale = new Storage();
const stalePrepared = await preparePrivateCheckpointBootstrap(stale, {readCheckpoint});
stale.setItem(xkey, different);
assert.throws(()=>commitLearnerStorageChanges(stale,stalePrepared.changes,stalePrepared.expected),/KIANOS_LEARNER_STORAGE_STALE/);
assert.equal(stale.getItem(xkey), different);
assert.equal(stale.length, 1, 'stale preparation must not partially install siblings');
for (const status of ['missing','unavailable','invalid']) {
  const local = new Storage({[lkey]:'37'});
  const result = await preparePrivateCheckpointBootstrap(local,{readCheckpoint:async()=>({status,checkpoint:null})});
  assert.equal(result.changes.length,0); assert.equal(local.getItem(lkey),'37');
}
await assert.rejects(()=>preparePrivateCheckpointBootstrap({get length(){throw new Error('read denied');}}),/read denied/);
console.log('PASS checkpoint bootstrap: staged recovery across shared/Xizong/English/Lexical/Politics, lineage, retained conflicts, stale transaction and unavailable reads');
