import assert from 'node:assert/strict';
import fs from 'node:fs';

import { buildXizongScoreEvidence } from '../src/lib/xizongForecastModel.mjs';

const readJson=(p)=>JSON.parse(fs.readFileSync(p,'utf8'));

const bio=readJson('../content/xizong/knowledge/learner/xizong-2027-biochemistry-delta-slot.json');
const fmt=readJson('../content/xizong/knowledge/learner/xizong-2027-exam-format-delta-slot.json');
const hum=readJson('../content/xizong/humanities/current.json');
const late=readJson('../content/xizong/knowledge/learner/xizong-26-late-stage-material-baseline.json');

assert.equal(bio.schema,'kianos.xizong.future_source_slot.v1');
assert.equal(bio.status,'BLOCKED_UNTIL_27_SOURCE');
assert.ok(bio.arrival_contract?.fidelity_validation?.length>=5);
assert.deepEqual(bio.delta_contract?.classes,['PRESERVE','UPDATE','NEW','RETIRE','CONFLICT']);
assert.ok(bio.downstream_invalidation?.review_when_semantics_change?.includes('Forecast workload / score-risk interpretation'));
assert.equal(bio.current_state?.source_present,false);

assert.equal(fmt.schema,'kianos.xizong.future_source_slot.v1');
assert.equal(fmt.status,'BLOCKED_UNTIL_AUTHORITATIVE_2027_FORMAT_SOURCE');
assert.equal(fmt.prior_baseline?.question_count,165);
assert.equal(fmt.prior_baseline?.max_score,300);
assert.equal(fmt.current_owner_boundary?.historical_format_owner,'content/xizong/questions/exam-format.json');
assert.deepEqual(fmt.delta_contract?.classes,['PRESERVE','UPDATE','NEW','RETIRE','CONFLICT']);
assert.equal(fmt.delta_contract?.no_silent_inheritance,true);
assert.ok(fmt.downstream_invalidation?.review_when_semantics_change?.includes('formal score evidence compatibility'));
assert.ok(fmt.downstream_invalidation?.review_when_semantics_change?.includes('275 / 270 loss-envelope interpretation'));
assert.equal(fmt.current_state?.exact_2027_geometry_known,false);
assert.equal(fmt.current_state?.current_format_source_hash,null);

assert.equal(hum.status,'CURRENT_BASELINE_WITH_2027_SCOPE_DELTA_BLOCKED');
assert.equal(hum.official_question_scope?.question_count,80);
assert.ok((hum.remaining_unknowns||[]).some(row=>row.type==='CURRENT_YEAR_DELTA_GAP' && row.status==='BLOCKED_UPSTREAM_SOURCE'));

const families=new Map((late.baseline_families||[]).map(row=>[row.family_id,row]));
for(const id of ['26-CASE-CRAM','26-FOUR-MOCKS','26-FINAL-5H']){
  const row=families.get(id);
  assert.ok(row,id+' baseline missing');
  assert.ok(String(row.current_year_delta_slot||'').trim(),id+' current-year delta slot missing');
}
assert.equal(late.cycle_identity?.current_cycle_label,'27考研');
assert.ok((late.absorption_policy?.when_27_arrives||[]).some(x=>/PRESERVE \/ UPDATE \/ NEW \/ RETIRE \/ CONFLICT/.test(x)));

// Current-format calibration must fail closed before authoritative 2027 format identity exists.
const progress={
  schema:'kianos.xizong.forecast-progress.v1',
  canonical_scope:{systems:8,blocks:159,canonical_kp:2517,logic_groups:762,block_weights:[]},
  runtime_evidence:{completed_blocks:0,recall:{}},
  question_workload:{status:'EXACT_COMPLETE',exact_union_eligible_questions:2928,known_remaining_questions:2928,known_remaining_is_lower_bound:false},
  practice_evidence:{first_pass:{attempted_questions:0},latest:{},fresh_transfer:{}},
  repair_evidence:{},
  memory_evidence:{precision:{}},
  system_recall_evidence:[],
  formal_score_evidence:{sealed_papers:[
    {year:2024,earned_score:276,max_score:300,internal_holdout_protected_before_seal:true,exam_format_source_hash:'historical-165',question_inventory_hash:'paper-2024',exam_format:{year:2024,question_count:165,max_score:300}},
    {year:2025,earned_score:279,max_score:300,internal_holdout_protected_before_seal:true,exam_format_source_hash:'historical-165',question_inventory_hash:'paper-2025',exam_format:{year:2025,question_count:165,max_score:300}},
    {year:2026,earned_score:281,max_score:300,internal_holdout_protected_before_seal:true,exam_format_source_hash:'historical-165',question_inventory_hash:'paper-2026',exam_format:{year:2026,question_count:165,max_score:300}}
  ]}
};

const blocked=buildXizongScoreEvidence(progress,{
  targetScore:275,
  contaminationStatus:'LEAST_CONTAMINATED'
});
assert.ok(blocked.formal_score.historical_calibration_band);
assert.equal(blocked.formal_score.calibration_band,null);
assert.equal(blocked.formal_score.current_format_compatibility,'UNKNOWN_CURRENT_YEAR_FORMAT');
assert.equal(blocked.formal_score.score_extrapolation_ready,false);

const matched=buildXizongScoreEvidence(progress,{
  targetScore:275,
  contaminationStatus:'LEAST_CONTAMINATED',
  currentExamFormatSourceHash:'historical-165'
});
assert.ok(matched.formal_score.calibration_band);
assert.equal(matched.formal_score.current_format_compatibility,'MATCHED');
assert.equal(matched.formal_score.score_extrapolation_ready,true);

const mismatched=buildXizongScoreEvidence(progress,{
  targetScore:275,
  contaminationStatus:'LEAST_CONTAMINATED',
  currentExamFormatSourceHash:'2027-new-format'
});
assert.equal(mismatched.formal_score.calibration_band,null);
assert.equal(mismatched.formal_score.current_format_compatibility,'NO_MATCHING_CALIBRATION');
assert.equal(mismatched.formal_score.score_extrapolation_ready,false);

console.log('PASS Xizong Future Source slots: biochem + humanities + late-stage + 2027 exam-format fail-closed');
