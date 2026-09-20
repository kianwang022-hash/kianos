import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('..');
const read=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const text=(p)=>fs.readFileSync(path.join(root,p),'utf8');

const slotPath='content/xizong/questions/exam-format-2027-slot.json';
const slot=read(slotPath);
const history=read('content/xizong/questions/exam-format.json');
const maturity=text('content/xizong/MATURITY_PACKAGE.md');

assert.equal(slot.schema,'kianos.xizong.exam_format_future_slot.v1');
assert.equal(slot.status,'BLOCKED_UNTIL_AUTHORITATIVE_2027_SOURCE');
assert.equal(slot.exam_year,2027);
assert.equal(slot.current_state.authoritative_2027_source_present,false);
assert.equal(slot.current_state.current_format_source_hash,null);
assert.equal(slot.current_state.exact_question_count,null);
assert.equal(slot.current_state.exact_max_score,null);
assert.equal(slot.current_state.exact_scoring_segments,null);

const baseline=(history.eras||[]).find(row=>row.era_id==='CLINICAL_MEDICINE_COMPREHENSIVE_165');
assert.ok(baseline,'historical 2017-2026 baseline missing');
assert.deepEqual(slot.historical_baseline,{
  era_id:baseline.era_id,
  years:[baseline.start_year,baseline.end_year],
  question_count:baseline.question_count,
  max_score:baseline.max_score,
  scoring_segments:baseline.scoring_segments,
  role:'PLANNING_PRIOR_ONLY_NOT_2027_CURRENT_TRUTH'
});

assert.equal(slot.delta_contract.no_silent_inheritance,true);
assert.deepEqual(slot.delta_contract.classes,['PRESERVE','UPDATE','NEW','RETIRE','CONFLICT']);
assert.deepEqual(slot.downstream_invalidation.evidence_policy,['PRESERVE','MIGRATE','STALE','INVALID']);

for(const target of [
  'whole-paper scoring runtime',
  'historical score-to-current calibration band',
  '275/270 loss-envelope geometry',
  'humanities exact-number boundary if numbering changes',
  'Forecast capacity and score interpretation',
  'Stage-D / X9 readiness claim'
]){
  assert.ok(slot.downstream_invalidation.review_when_geometry_changes.includes(target),
    'missing downstream target:'+target);
}

for(const field of ['late','partial','second_version','never_arrives','low_confidence_conflict']){
  assert.ok(String(slot.fallback?.[field]||'').length>0,'missing fallback:'+field);
}

assert.match(slot.forecast_contract.before_arrival,/Current-format score calibration remains unavailable/i);
assert.match(slot.current_state.action_now,/WAIT_FOR_AUTHORITATIVE_2027_FORMAT_SOURCE/);
assert.ok(maturity.includes(slotPath));
assert.match(maturity,/G4 — 2027 exam-format \/ scoring geometry/);

console.log(JSON.stringify({
  schema:'kianos.xizong.exam-format-2027-slot-proof.v1',
  historical_baseline:baseline.era_id,
  historical_question_count:baseline.question_count,
  historical_max_score:baseline.max_score,
  current_2027_geometry:'UNKNOWN',
  silent_inheritance:false,
  downstream_invalidation:'PASS',
  fallback:'PASS'
},null,2));
console.log('PASS Xizong 2027 exam-format durable future-source slot');
