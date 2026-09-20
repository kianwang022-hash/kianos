import assert from 'node:assert/strict';
import { englishProductCatalog } from '../src/lib/productCatalog.mjs';
import { buildHomeDailyLearningPacket } from '../src/lib/dailyLearningPacketRuntime.mjs';
import {
  ENGLISH_EXPOSURE_SCHEMA,
  ENGLISH_MATERIAL_EXPOSURE_KEY
} from '../src/lib/englishLearnerEvidence.mjs';

class MemoryStorage {
  constructor(entries={}){this.map=new Map(Object.entries(entries));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.get(k)??null;}
  setItem(k,v){this.map.set(String(k),String(v));}
  removeItem(k){this.map.delete(String(k));}
}

function forbiddenKeys(value, path='root', hits=[]) {
  if (Array.isArray(value)) {
    value.forEach((row,index)=>forbiddenKeys(row,`${path}[${index}]`,hits));
    return hits;
  }
  if (!value || typeof value !== 'object') return hits;
  for (const [key,child] of Object.entries(value)) {
    if (['answer','answers','correct_answer','formal_answer','prompt','passage_text','source_text'].includes(key)) {
      hits.push(`${path}.${key}`);
    }
    forbiddenKeys(child,`${path}.${key}`,hits);
  }
  return hits;
}

const day='2026-09-20';
const now=Date.parse('2026-09-20T12:00:00+08:00');
const catalog=englishProductCatalog();

assert.equal(catalog.schema,'kianos.english.forecast-catalog.v1');
assert.ok(catalog.exam_objects.length>0,'official English objects missing');
assert.ok(catalog.whole_papers.length>0,'whole-paper inventory missing');
assert.equal(catalog.whole_papers.every(row=>row.duration_minutes===180),true);
assert.equal(catalog.whole_papers.every(row=>row.object_ids.length===9),true);
assert.equal(forbiddenKeys(catalog).length,0,'forecast catalog leaked learner source/answer content');

const exam=catalog.exam_objects;
const exposed=exam[0];
const explicitUnseen=exam.find(row=>row.object_id!==exposed.object_id) || exam[1];
const unknown=exam.find(row=>row.object_id!==exposed.object_id&&row.object_id!==explicitUnseen.object_id) || exam[2];
assert.ok(exposed?.object_id&&explicitUnseen?.object_id&&unknown?.object_id);

const generatedId='external-chat-2026-09-20-forecast-001';
const generatedHash='generated-forecast-hash';
const storage=new MemoryStorage({
  [ENGLISH_MATERIAL_EXPOSURE_KEY]:JSON.stringify({
    schema:ENGLISH_EXPOSURE_SCHEMA,
    materials:{
      [exposed.object_id]:{
        object_id:exposed.object_id,
        events:[{event_id:'old-attempt:opened',attempt_id:'old-attempt',event:'opened',at:'2026-09-19T01:00:00+08:00'}]
      },
      [explicitUnseen.object_id]:{
        object_id:explicitUnseen.object_id,
        events:[],
        declaration:{state:'unseen',at:'2026-09-20T08:00:00+08:00'}
      }
    }
  }),
  ['kianos-english-external-reading-attempt-v1:'+generatedId]:JSON.stringify({
    binding:{
      task:'external_reading',
      object_id:generatedId,
      source_hash:generatedHash,
      attempt_id:'generated-attempt',
      prior_exposure:'unseen',
      assistance:'unassisted',
      source_snapshot:{
        source_family:'CHAT_GENERATED',
        source_format:'CHAT_GENERATED',
        question_origin:'CHAT_GENERATED',
        drill_origin:'CHAT_GENERATED_SYNTHETIC',
        completion_requirement:'QUESTIONS_SUBMITTED',
        training_target:{kind:'reading_scope_transfer'}
      }
    },
    submitted:true,
    stage:'submitted',
    results:{q1:'correct'},
    uncertain:[],
    firstEvidenceMeta:{
      prior_exposure:'unseen',
      assistance:'unassisted',
      timing_status:'uncalibrated',
      elapsed_seconds:600,
      time_budget_seconds:null,
      independent_transfer_candidate:true
    },
    submittedAt:'2026-09-20T10:00:00+08:00'
  })
});

const result=buildHomeDailyLearningPacket({
  storage,
  day,
  now,
  plan:null,
  xizongPacketIndex:[],
  politicsCatalog:null,
  politicsMemoryCatalog:null,
  englishCatalog:catalog,
  base:'/'
});

assert.equal(result.coverage.english,'attached');
const evidence=result.packet.subjects.english.evidence;
assert.equal(evidence.forecast_materials.schema,'kianos.english.forecast-material-evidence.v1');
assert.equal(evidence.forecast_materials.status,'ready');
assert.match(evidence.forecast_materials.evidence_boundary,/UNKNOWN is never upgraded to unseen/);

const byTask=evidence.forecast_materials.official_exam.by_task;
const sum=(field)=>Object.values(byTask).reduce((n,row)=>n+Number(row.exposure[field]||0),0);
assert.ok(sum('exposed')>=1,'recorded official exposure lost');
assert.ok(sum('explicit_unseen')>=1,'explicit unseen declaration lost');
assert.ok(sum('unknown')>=1,'unrecorded official material must remain unknown');
assert.equal(
  sum('exposed')+sum('explicit_unseen')+sum('unknown'),
  evidence.forecast_materials.official_exam.registered_objects
);

const paperWithUnknown=evidence.forecast_materials.official_exam.whole_papers.find(row=>row.exposure.unknown>0);
assert.ok(paperWithUnknown,'expected at least one whole paper with unknown exposure');
assert.equal(paperWithUnknown.ledger_fresh_candidate,false,'unknown paper was falsely promoted to fresh');

const generated=evidence.performance_profile.tasks.external_reading.history.generated_drill;
assert.equal(generated.attempts,1);
assert.equal(generated.synthetic_attempts,1);
assert.equal(generated.generated_on_external_source_attempts,0);

console.log(JSON.stringify({
  status:'PASS',
  official_objects:evidence.forecast_materials.official_exam.registered_objects,
  whole_papers:evidence.forecast_materials.official_exam.whole_papers.length,
  official_exposure:{exposed:sum('exposed'),explicit_unseen:sum('explicit_unseen'),unknown:sum('unknown')},
  generated_drill:generated,
  boundary:'unknown-never-means-unseen; generated-drill-never-means-true-paper'
},null,2));
console.log('PASS English forecast evidence: official exposure stays conservative and generated drills stay distinct');
