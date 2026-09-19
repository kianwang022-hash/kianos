import assert from 'node:assert/strict';
import {
  captureSharedControlCheckpoint,
  restoreSharedControlCheckpoint
} from '../src/lib/sharedControlCheckpoint.mjs';
import {
  PRIVATE_CONTROL_RUNTIME_STATE_KEY,
  PRIVATE_CONTROL_RUNTIME_STATE_SCHEMA
} from '../src/lib/privateControlRuntime.mjs';
import {
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_SCHEMA,
  STUDY_TIMER_STATE_KEY
} from '../src/lib/studyTimer.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  key(index) { return [...this.map.keys()][index] ?? null; }
  get length() { return this.map.size; }
}

const day='2026-09-20';
const timerState={
  schema:STUDY_TIMER_SCHEMA,
  running:false,
  manualPaused:true,
  subject:null,
  context:null,
  segmentStartedAt:null,
  lastSeenAt:Date.parse('2026-09-20T01:00:00Z'),
  revision:1,
  updatedAt:Date.parse('2026-09-20T01:00:00Z')
};
const timerLedger={schema:STUDY_TIMER_SCHEMA,sessions:[]};
const control={
  schema:PRIVATE_CONTROL_RUNTIME_STATE_SCHEMA,
  active_by_target:{
    'xizong.session':{
      command_id:'cmd-xz-1',
      command_signature:'cmd-deadbeef',
      issued_at:'2026-09-20T01:00:00.000Z',
      applied_at:'2026-09-20T01:00:01.000Z',
      study_day:day
    }
  },
  receipts:[{
    schema:'kianos.private-control-receipt.v1',
    command_id:'cmd-xz-1',
    target:'xizong.session',
    study_day:day,
    issued_at:'2026-09-20T01:00:00.000Z',
    command_signature:'cmd-deadbeef',
    status:'APPLIED',
    detail:'',
    applied_at:'2026-09-20T01:00:01.000Z'
  }]
};

const source=new MemoryStorage({
  [PRIVATE_CONTROL_RUNTIME_STATE_KEY]:JSON.stringify(control),
  [STUDY_TIMER_STATE_KEY]:JSON.stringify(timerState),
  [STUDY_TIMER_LEDGER_KEY]:JSON.stringify(timerLedger)
});

const checkpoint=captureSharedControlCheckpoint(source,{
  studyDay:day,
  now:Date.parse('2026-09-20T02:00:00Z')
});
assert.equal(checkpoint.private_control_runtime.active_by_target['xizong.session'].command_id,'cmd-xz-1');
assert.equal(checkpoint.private_control_runtime.receipts.length,1);

const sameDay=new MemoryStorage();
restoreSharedControlCheckpoint(sameDay,checkpoint,{expectedDay:day});
const sameControl=JSON.parse(sameDay.getItem(PRIVATE_CONTROL_RUNTIME_STATE_KEY));
assert.equal(sameControl.active_by_target['xizong.session'].command_id,'cmd-xz-1');
assert.equal(sameControl.receipts.length,1);

const nextDay=new MemoryStorage();
restoreSharedControlCheckpoint(nextDay,{
  ...checkpoint,
  study_day:'2026-09-21'
},{expectedDay:'2026-09-21'});
const nextControl=JSON.parse(nextDay.getItem(PRIVATE_CONTROL_RUNTIME_STATE_KEY));
assert.deepEqual(nextControl.active_by_target,{},'previous-day active commands must not revive');
assert.equal(nextControl.receipts.length,1,'receipt history survives day boundary for replay/audit');

const corrupt=new MemoryStorage({
  [PRIVATE_CONTROL_RUNTIME_STATE_KEY]:'{bad-json',
  [STUDY_TIMER_STATE_KEY]:JSON.stringify(timerState),
  [STUDY_TIMER_LEDGER_KEY]:JSON.stringify(timerLedger)
});
assert.throws(
  ()=>captureSharedControlCheckpoint(corrupt,{studyDay:day}),
  /STATE_JSON_INVALID/,
  'corrupt replay protection must fail closed'
);

console.log('PASS private control durability: same-day active restore + cross-day active expiry + receipt preservation');
