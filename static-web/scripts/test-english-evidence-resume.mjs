import assert from 'node:assert/strict';
import { buildEnglishEvidencePacket } from '../src/lib/englishSessionControl.mjs';

class MemoryStorage {
  constructor(entries={}){this.map=new Map(Object.entries(entries));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(String(k),String(v));}
  removeItem(k){this.map.delete(String(k));}
}

const day='2026-09-20';
const storage=new MemoryStorage({
  'kianos-english-session-instruction-v1':JSON.stringify({
    schema:'kianos.english.session-instruction.v1',
    session_id:'english-resume-proof',
    study_day:day,
    generated_at:'2026-09-20T00:00:00.000Z',
    current_step:0,
    steps:[
      {
        step_id:'r1',
        task:'reading_a',
        object_id:'reading-done',
        source_hash:'hash-reading-done',
        label:'Reading done',
        note:'first'
      },
      {
        step_id:'t1',
        task:'translation',
        object_id:'translation-next',
        source_hash:'hash-translation-next',
        label:'Translation next',
        note:'second'
      }
    ],
    return_policy:{on_finish:'english_home'}
  }),
  'kianos-reading-attempt-v1:reading-done':JSON.stringify({
    binding:{source_hash:'hash-reading-done'},
    submitted:true,
    results:{},
    uncertain:[],
    reviewResolved:true
  }),
  'kianos-reading-last-location-v1':JSON.stringify({
    id:'reading-done',
    title:'Reading done',
    href:'/reading/reading-done/',
    updatedAt:'2026-09-20T00:20:00.000Z'
  })
});

const packet=buildEnglishEvidencePacket(storage,{
  day,
  now:Date.parse('2026-09-20T00:30:00.000Z'),
  catalog:[]
});

assert.equal(packet.schema,'kianos.english.evidence.v1');
assert.equal(packet.resume.status,'ready');
assert.equal(packet.resume.task,'translation');
assert.equal(packet.resume.object_id,'translation-next');
assert.equal(packet.resume.step_index,1);
assert.equal(packet.resume.step_count,2);
assert.equal(packet.resume.href,'/translation/translation-next/');
assert.equal(packet.forecast_progress.schema,'kianos.english.forecast-progress.v1');
assert.equal(packet.forecast_progress.forecast_role,'FACTUAL_SUBJECT_PROGRESS_SIGNAL_ONLY');
assert.equal(packet.forecast_progress.gate_workload_authority,false);
assert.equal(packet.forecast_progress.scope,'CURRENT_EXPLICIT_SESSION_ONLY');
assert.equal(packet.forecast_progress.status,'active');
assert.equal(packet.forecast_progress.total_steps,2);
assert.equal(packet.forecast_progress.completed_steps,1);
assert.equal(packet.forecast_progress.remaining_steps,1);
assert.deepEqual(packet.forecast_progress.remaining_by_task,{translation:1});
assert.equal(packet.forecast_progress.remaining[0].object_id,'translation-next');
assert.match(packet.forecast_progress.evidence_boundary,/exam\.subject-demand\.v1/);
assert.ok(Array.isArray(packet.inventory)&&packet.inventory.some(row=>row.object_id==='reading-done'));

console.log('PASS English evidence Resume advances past completed step to the next incomplete session task');
