import { CONTROL_LOCAL_RECEIPT_KEY, CONTROL_RECEIPT_SCHEMA } from '../src/lib/privateControlCommand.mjs';
import assert from 'node:assert/strict';
import { preparePrivateCheckpointBootstrap, saveSharedControlToPrivate, restorePrivateCheckpointGroupsFromDurable } from '../src/lib/privateCheckpointRuntime.mjs';
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
// Explicit recovery must use the same pre-consumer transaction boundary.
let conflictedCheckpoint;
await saveSharedControlToPrivate(new Storage({...entries,[xkey]:different}), {
  readCheckpoint, writeCheckpoint: async value=>{conflictedCheckpoint=value;}
});
const conflictedRead=async()=>({status:'ready',checkpoint:conflictedCheckpoint});
for (const direction of ['durableRestoreCheckpointId','rebaseCheckpointId']) {
  const local=new Storage({...entries,[xkey]:different});
  const before=JSON.stringify([...local.map]);
  const prepared=await preparePrivateCheckpointBootstrap(local, {
    readCheckpoint:conflictedRead, recovery:{[direction]:conflictedCheckpoint.checkpoint_id}
  });
  assert.equal(JSON.stringify([...local.map]),before,'explicit preparation is non-mutating');
  commitLearnerStorageChanges(local,prepared.changes,prepared.expected);
  assert.equal(local.getItem(xkey),direction==='durableRestoreCheckpointId'?entries[xkey]:different);
  for(const key of [ekey,lkey,PRACTICE_KEYS.meta])assert.equal(local.getItem(key),entries[key]);
  assert.equal((await saveSharedControlToPrivate(local,{readCheckpoint:conflictedRead,writeCheckpoint:async()=>{}})).status,'saved');
}
for(const recovery of [
  {durableRestoreCheckpointId:'wrong-checkpoint'},
  {rebaseCheckpointId:'wrong-checkpoint'},
  {durableRestoreCheckpointId:conflictedCheckpoint.checkpoint_id,rebaseCheckpointId:conflictedCheckpoint.checkpoint_id}
]) {
  const local=new Storage({...entries,[xkey]:different}),before=JSON.stringify([...local.map]);
  await assert.rejects(()=>preparePrivateCheckpointBootstrap(local,{readCheckpoint:conflictedRead,recovery}),/SOURCE_CHANGED|DIRECTION_AMBIGUOUS/);
  assert.equal(JSON.stringify([...local.map]),before);
}
// Multiple base conflicts do not make valid shared bytes corrupt. A receipt
// remains gated by every native value it would otherwise acknowledge.
const receipt=JSON.stringify({schema:CONTROL_RECEIPT_SCHEMA,command_id:'synthetic-multigroup',command_hash:'a'.repeat(64),status:'APPLIED',observed_at:new Date().toISOString()});
const combinedEntries={...entries,[CONTROL_LOCAL_RECEIPT_KEY]:receipt};
let combinedDurable,combinedConflict;
await saveSharedControlToPrivate(new Storage(combinedEntries),{readCheckpoint:async()=>({status:'missing'}),writeCheckpoint:async value=>{combinedDurable=value;}});
const changedEntries={...combinedEntries,[xkey]:different,[EXAM_PROFILE_KEY]:JSON.stringify({...emptyExamProfile(),defaultDailyMinutes:200})};
await saveSharedControlToPrivate(new Storage(changedEntries),{readCheckpoint:async()=>({status:'ready',checkpoint:combinedDurable}),writeCheckpoint:async value=>{combinedConflict=value;}});
assert.deepEqual(combinedConflict.payload.shared.capture_warnings.sort(),['checkpoint:shared:PRIVATE_CHECKPOINT_LOCAL_BASE_CONFLICT','checkpoint:xizong:PRIVATE_CHECKPOINT_LOCAL_BASE_CONFLICT'].sort());
const combinedRead=async()=>({status:'ready',checkpoint:combinedConflict});
for(const direction of ['durableRestoreCheckpointId','rebaseCheckpointId']) {
  const local=new Storage(changedEntries);
  const prepared=await preparePrivateCheckpointBootstrap(local,{readCheckpoint:combinedRead,recovery:{[direction]:combinedConflict.checkpoint_id}});
  commitLearnerStorageChanges(local,prepared.changes,prepared.expected);
  const expected=direction==='durableRestoreCheckpointId'?combinedEntries:changedEntries;
  for(const [key,raw] of Object.entries(expected))assert.equal(local.getItem(key),raw);
  assert.equal((await saveSharedControlToPrivate(local,{readCheckpoint:combinedRead,writeCheckpoint:async()=>{}})).status,'saved');
}
const subset=new Storage(changedEntries),subsetBefore=JSON.stringify([...subset.map]);
await assert.rejects(()=>restorePrivateCheckpointGroupsFromDurable(subset,{expectedCheckpointId:combinedConflict.checkpoint_id,groupIds:['shared'],readCheckpoint:combinedRead}),/RECEIPT_NATIVE_CONFLICT/);
assert.equal(JSON.stringify([...subset.map]),subsetBefore,'unresolved sibling prevents receipt without partial mutation');
for(const corruption of ['timer','xizong','unselected-warning']) {
  const bad=structuredClone(combinedConflict),local=new Storage(changedEntries),before=JSON.stringify([...local.map]);
  if(corruption==='timer')bad.payload.shared.study_timer_state='{invalid';
  if(corruption==='xizong')bad.payload.subjects.xizong.entries.find(row=>row.key===xkey).raw='{invalid';
  if(corruption==='unselected-warning')bad.payload.shared.capture_warnings.push('checkpoint:politics:NATIVE_EVIDENCE_INVALID');
  await assert.rejects(()=>restorePrivateCheckpointGroupsFromDurable(local,{expectedCheckpointId:bad.checkpoint_id,readCheckpoint:async()=>({status:'ready',checkpoint:bad})}),/SHARED_INVALID|NATIVE_INVALID|RECEIPT_NATIVE_CONFLICT/);
  assert.equal(JSON.stringify([...local.map]),before,'invalid composite source must not change original storage');
}
console.log('PASS multi-group recovery: both directions work; unresolved siblings, invalid native bytes and unrelated warnings still deny receipt atomically');
console.log('PASS checkpoint bootstrap: staged recovery across shared/Xizong/English/Lexical/Politics, lineage, retained conflicts, stale transaction and unavailable reads');
