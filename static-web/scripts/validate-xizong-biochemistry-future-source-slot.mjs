import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('..');
const read=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const text=(p)=>fs.readFileSync(path.join(root,p),'utf8');

const slotPath='content/xizong/knowledge/learner/xizong-2027-biochemistry-delta-slot.json';
const slot=read(slotPath);
const system=read('content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/system.json');
const late=read('content/xizong/knowledge/learner/xizong-26-late-stage-material-baseline.json');
const maturity=text('content/xizong/MATURITY_PACKAGE.md');

assert.equal(slot.schema,'kianos.xizong.future_source_slot.v1');
assert.equal(slot.status,'BLOCKED_UNTIL_27_SOURCE');
assert.equal(slot.slot_id,'xizong-2027-biochemistry-delta');
assert.equal(slot.current_state.source_present,false);
assert.equal(slot.current_state.current_year_delta_known,false);
assert.equal(slot.current_state.exact_workload_minutes,null);

assert.equal(slot.current_owner_boundary.canonical_medical_owner,
  'content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/system.json');
assert.deepEqual(slot.current_owner_boundary.canonical_blocks,
  ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10']);

const route=(Array.isArray(system.block_route)?system.block_route:[])
  .filter(row=>/^M\d+$/.test(String(row?.id||'')))
  .map(row=>({id:String(row.id),title:String(row.title),kp_count:Number(row.kp)}));
assert.deepEqual(slot.prior_baseline.canonical_core.blocks,route,
  'future-source slot must be bound to Current M1-M10 identity, not a hand-entered alternate baseline');

const final5=(late.baseline_families||[]).find(row=>row.family_id==='26-FINAL-5H');
assert.ok(final5,'26 final-5h baseline missing');
const bioPdf=(final5.independent_compression_pdfs||[]).find(row=>row.visible_name==='生化 5小时 天天师兄.pdf');
assert.ok(bioPdf,'26 biochemistry historical compression baseline missing');
assert.equal(slot.prior_baseline.historical_late_stage_reference.asset,bioPdf.visible_name);
assert.equal(slot.prior_baseline.historical_late_stage_reference.pages,bioPdf.pages);

assert.deepEqual(slot.delta_contract.classes,['PRESERVE','UPDATE','NEW','RETIRE','CONFLICT']);
assert.equal(slot.delta_contract.no_full_rebuild_without_evidence,true);
assert.equal(slot.delta_contract.workload_rule,'gross - replacement - true_overlap = net_new_effective_work');

for(const field of [
  'late','partial','second_version','never_arrives','low_value'
]) assert.ok(String(slot.fallback?.[field]||'').length>0,'missing fallback:'+field);

for(const target of [
  'Teaching/Guide cues',
  'Precision Memory candidates',
  'derived/synthetic transfer probes',
  'active Repair tasks',
  'learner evidence interpretation',
  'Chat plan / Resume if it authorizes stale content',
  'Forecast workload / score-risk interpretation',
  'Secure/Stabilize claim'
]){
  assert.ok(slot.downstream_invalidation.review_when_semantics_change.includes(target),
    'missing transitive invalidation target:'+target);
}
assert.deepEqual(slot.downstream_invalidation.evidence_policy,
  ['PRESERVE','MIGRATE','STALE','INVALID']);

assert.match(slot.forecast_contract.before_arrival,/No invented 27-cycle minutes/i);
assert.match(slot.forecast_contract.after_arrival,/verified net-new/i);
assert.match(slot.current_state.action_now,/WAIT_FOR_27_SOURCE/);

assert.ok(maturity.includes(slotPath),
  'Maturity Package G3 must route to the durable future-source slot');
assert.match(maturity,/G3 — 2027 Biochemistry delta/);

console.log(JSON.stringify({
  schema:'kianos.xizong.biochemistry-future-source-slot-proof.v1',
  canonical_blocks:route.map(row=>row.id),
  historical_baseline:bioPdf.visible_name,
  source_present:false,
  delta_known:false,
  exact_workload_minutes:null,
  future_lifecycle:'PASS',
  transitive_invalidation:'PASS',
  no_full_rebuild:'PASS',
  forecast_fail_closed_before_arrival:'PASS'
},null,2));
console.log('PASS Xizong 2027 Biochemistry durable future-source slot');
