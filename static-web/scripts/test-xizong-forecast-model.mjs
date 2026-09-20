import assert from 'node:assert/strict';
import {
  XIZONG_FORECAST_MODEL_SCHEMA,
  applyXizongForecastScenario,
  buildXizongWorkloadForecast
} from '../src/lib/xizongForecastModel.mjs';

function baseProgress() {
  const blockWeights = [
    ['A1','a1-b01',10,3],['A1','a1-b02',20,6],['A1','a1-b03',15,5],
    ['A2','a2-r01',25,8],['A2','a2-r02',12,4],['A2','a2-r03',30,10],
    ['B','b-d01',40,12],['B','b-d02',18,6]
  ].map(([canonical_id,block_id,kp_count,logic_group_count])=>({
    canonical_id, block_id, kp_count, logic_group_count
  }));
  const completed = [
    ['A1','a1-b01',10,3,50],['A1','a1-b02',20,6,90],['A1','a1-b03',15,5,70],
    ['A2','a2-r01',25,8,120],['A2','a2-r02',12,4,55]
  ].map(([canonical_id,block_id,kp_count,logic_group_count,timer_minutes_to_completion])=>({
    canonical_id,block_id,kp_count,logic_group_count,timer_minutes_to_completion,
    completed_at:'2026-09-20T00:00:00.000Z'
  }));
  return {
    schema:'kianos.xizong.forecast-progress.v1',
    canonical_scope:{
      blocks:blockWeights.length,
      canonical_kp:blockWeights.reduce((s,r)=>s+r.kp_count,0),
      logic_groups:blockWeights.reduce((s,r)=>s+r.logic_group_count,0),
      block_weights:blockWeights
    },
    runtime_evidence:{
      completed_blocks:completed.length,
      completed_block_ids:completed.map(r=>r.block_id),
      completed_blocks_detail:completed,
      started_incomplete_blocks:0,
      started_incomplete:[]
    },
    question_workload:{
      status:'EXACT_COMPLETE',
      known_remaining_questions:100,
      known_remaining_is_lower_bound:false,
      cross_system_duplicate_memberships:0,
      unknown_systems:[]
    },
    practice_evidence:{
      first_pass:{
        attempted_questions:100,
        wrong_or_uncertain_rate:0.2,
        by_day:[
          {day:'2026-09-16',attempted:20,practice_timer_minutes:30,observed_minutes_per_attempt:1.5},
          {day:'2026-09-17',attempted:20,practice_timer_minutes:34,observed_minutes_per_attempt:1.7},
          {day:'2026-09-18',attempted:20,practice_timer_minutes:32,observed_minutes_per_attempt:1.6},
          {day:'2026-09-19',attempted:20,practice_timer_minutes:36,observed_minutes_per_attempt:1.8},
          {day:'2026-09-20',attempted:20,practice_timer_minutes:28,observed_minutes_per_attempt:1.4}
        ]
      },
      latest:{unresolved_wrong_uncertain_questions:10}
    },
    repair_evidence:{
      active_repair_clusters:2,
      observed_question_to_cluster_ratio:2,
      calibration_samples:[
        {timer_minutes_in_repair_window:10},
        {timer_minutes_in_repair_window:12},
        {timer_minutes_in_repair_window:14},
        {timer_minutes_in_repair_window:11},
        {timer_minutes_in_repair_window:13}
      ]
    },
    system_recall_evidence:[
      {
        system_id:'a1',canonical_id:'A1',
        pre_question_recall_observed:true,post_first_pass_recall_observed:true,
        events:[
          {timer_minutes_since_previous_recall:12},
          {timer_minutes_since_previous_recall:10},
          {timer_minutes_since_previous_recall:11}
        ]
      },
      {
        system_id:'a2',canonical_id:'A2',
        pre_question_recall_observed:true,post_first_pass_recall_observed:false,
        events:[
          {timer_minutes_since_previous_recall:13},
          {timer_minutes_since_previous_recall:9},
          {timer_minutes_since_previous_recall:12}
        ]
      }
    ],
    formal_score_evidence:{
      sealed_papers:[{
        year:2025,sealed_at:'2026-09-20T00:00:00.000Z',
        earned_score:270,max_score:300,question_count:165
      }]
    }
  };
}

{
  const forecast=buildXizongWorkloadForecast(baseProgress());
  assert.equal(forecast.schema,XIZONG_FORECAST_MODEL_SCHEMA);
  assert.equal(forecast.first_round.status,'FULLY_PRICED');
  assert.ok(forecast.first_round.full_band_minutes.p20 <= forecast.first_round.full_band_minutes.p50);
  assert.ok(forecast.first_round.full_band_minutes.p50 <= forecast.first_round.full_band_minutes.p80);
  assert.equal(forecast.score_formation.status,'FULLY_PRICED');
  assert.equal(forecast.components.knowledge.status,'CALIBRATED');
  assert.equal(forecast.components.questions.status,'CALIBRATED');
  assert.equal(forecast.components.repair.status,'CALIBRATED');
}

{
  const forecast=buildXizongWorkloadForecast(baseProgress(),{wrongUncertainRate:0.30});
  assert.equal(forecast.components.repair.error_rate.source,'SCENARIO_OVERRIDE');
  assert.equal(forecast.components.repair.compression.predicted_future_wrong_uncertain_questions,30);
  assert.equal(forecast.components.repair.compression.predicted_future_clusters,15);
  assert.equal(forecast.components.repair.compression.total_clusters_to_price,17);
}

{
  const partial=baseProgress();
  partial.question_workload={
    ...partial.question_workload,
    status:'EXACT_PARTIAL',
    known_remaining_is_lower_bound:true,
    unknown_systems:['F']
  };
  const forecast=buildXizongWorkloadForecast(partial);
  assert.equal(forecast.first_round.status,'PARTIAL');
  assert.equal(forecast.first_round.full_band_minutes,null);
  assert.ok(forecast.first_round.known_priced_band_minutes);
  assert.ok(forecast.risks.includes('EXACT_QUESTION_SCOPE_INCOMPLETE'));
}

{
  const noTimer=baseProgress();
  noTimer.runtime_evidence.completed_blocks_detail=noTimer.runtime_evidence.completed_blocks_detail.map(r=>({
    ...r,timer_minutes_to_completion:0
  }));
  noTimer.practice_evidence.first_pass.by_day=noTimer.practice_evidence.first_pass.by_day.map(r=>({
    ...r,practice_timer_minutes:0,observed_minutes_per_attempt:null
  }));
  noTimer.repair_evidence.calibration_samples=[];
  noTimer.system_recall_evidence=noTimer.system_recall_evidence.map(r=>({...r,events:[]}));
  const forecast=buildXizongWorkloadForecast(noTimer);
  assert.equal(forecast.first_round.full_band_minutes,null);
  assert.equal(forecast.components.knowledge.status,'NO_SAMPLES');
  assert.ok(forecast.risks.includes('INSUFFICIENT_COMPLETED_BLOCK_TIMER_SAMPLES'));
}

{
  const fastOnly=baseProgress();
  fastOnly.runtime_evidence.completed_blocks_detail=fastOnly.runtime_evidence.completed_blocks_detail.slice(0,2);
  fastOnly.runtime_evidence.completed_block_ids=fastOnly.runtime_evidence.completed_blocks_detail.map(r=>r.block_id);
  const forecast=buildXizongWorkloadForecast(fastOnly);
  assert.equal(forecast.components.knowledge.band_minutes,null);
  assert.equal(forecast.components.knowledge.status,'REFERENCE_ONLY');
  assert.ok(forecast.components.knowledge.risks.includes('SINGLE_SYSTEM_CALIBRATION'));
}

{
  const duplicate=baseProgress();
  duplicate.question_workload={
    ...duplicate.question_workload,
    known_remaining_questions:null,
    cross_system_duplicate_memberships:3
  };
  const forecast=buildXizongWorkloadForecast(duplicate);
  assert.equal(forecast.components.questions.band_minutes,null);
  assert.ok(forecast.components.questions.risks.includes('CROSS_SYSTEM_DUPLICATE_MEMBERSHIP'));
  assert.equal(forecast.first_round.full_band_minutes,null);
}

{
  const noPaper=baseProgress();
  noPaper.formal_score_evidence={sealed_papers:[]};
  const forecast=buildXizongWorkloadForecast(noPaper);
  assert.equal(forecast.first_round.status,'FULLY_PRICED');
  assert.equal(forecast.score_formation.status,'PARTIAL');
  assert.ok(forecast.score_formation.unpriced_components.includes('FORMAL_SCORE_CALIBRATION'));
  assert.ok(forecast.risks.includes('FORMAL_SCORE_CALIBRATION_MISSING'));
}

{
  const forecast=buildXizongWorkloadForecast(baseProgress());
  const baseBand=forecast.first_round.full_band_minutes;
  const fiveHour=applyXizongForecastScenario(forecast,{dailyMinutes:300,netIncrementMinutes:300});
  assert.equal(fiveHour.first_round.band_minutes.p20,baseBand.p20+300);
  assert.equal(fiveHour.first_round.band_minutes.p50,baseBand.p50+300);
  assert.equal(fiveHour.first_round.band_minutes.p80,baseBand.p80+300);
  assert.ok(fiveHour.first_round.band_days.p20>=1);
}

{
  const forecast=buildXizongWorkloadForecast(baseProgress());
  const twentyHours=applyXizongForecastScenario(forecast,{dailyMinutes:300,netIncrementMinutes:1200});
  const zero=applyXizongForecastScenario(forecast,{dailyMinutes:300,netIncrementMinutes:0});
  assert.equal(twentyHours.first_round.band_minutes.p50-zero.first_round.band_minutes.p50,1200);
  assert.ok(twentyHours.first_round.band_days.p50-zero.first_round.band_days.p50>=3);
}

{
  const hetero=baseProgress();
  hetero.runtime_evidence.completed_blocks_detail=[
    {canonical_id:'A1',block_id:'a1-b01',kp_count:5,logic_group_count:2,timer_minutes_to_completion:20},
    {canonical_id:'A1',block_id:'a1-b02',kp_count:6,logic_group_count:2,timer_minutes_to_completion:20},
    {canonical_id:'A2',block_id:'a2-r01',kp_count:50,logic_group_count:15,timer_minutes_to_completion:240},
    {canonical_id:'A2',block_id:'a2-r02',kp_count:45,logic_group_count:14,timer_minutes_to_completion:220},
    {canonical_id:'B',block_id:'b-d01',kp_count:60,logic_group_count:18,timer_minutes_to_completion:300}
  ];
  hetero.runtime_evidence.completed_block_ids=hetero.runtime_evidence.completed_blocks_detail.map(r=>r.block_id);
  const forecast=buildXizongWorkloadForecast(hetero);
  assert.ok(forecast.components.knowledge.calibration.estimators.length===3);
  assert.ok(forecast.components.knowledge.band_minutes.p80>=forecast.components.knowledge.band_minutes.p50);
}

console.log('PASS Xizong forecast model adversarial suite: fail-closed scope, timer, error-rate, Repair, score-evidence and increment scenarios');
