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
const source=new MemoryStorage({
  [sessionKey]:JSON.stringify({
    schema:'kianos.xizong.session-instruction.v1',
    session_id:'xz-1',
    study_day:'2026-09-20',
    generated_at:'2026-09-20T01:00:00.000Z',
    current_step:0,
    steps:[{step_id:'m1',kind:'MEMORY_REVIEW',targets:[{card_id:'core:a1-b01-kp01',block_id:'a1-b01',source_hash:'h1'}]}]
  }),
  [runtimeKey]:JSON.stringify({
    schema:'kianos.xizong.session-runtime.v1',
    session_id:'xz-1',
    installed_at:'2026-09-20T01:00:00.000Z',
    activated_steps:['m1'],
    activated_at_by_step:{m1:'2026-09-20T01:01:00.000Z'}
  })
});

const checkpoint=captureXizongPrivateCheckpoint(source,{now:Date.parse('2026-09-20T02:00:00.000Z')});
assert.ok(checkpoint.entries.some((row)=>row.key===sessionKey));
assert.ok(checkpoint.entries.some((row)=>row.key===runtimeKey));

const target=new MemoryStorage();
const restored=restoreXizongPrivateCheckpoint(target,checkpoint,{onlyIfEmpty:true});
assert.equal(restored.status,'restored');
assert.equal(JSON.parse(target.getItem(sessionKey)).session_id,'xz-1');
assert.deepEqual(JSON.parse(target.getItem(runtimeKey)).activated_steps,['m1']);

console.log('PASS Xizong session durability: instruction/runtime captured and restored by existing private checkpoint');
