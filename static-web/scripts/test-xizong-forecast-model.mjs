import { buildXizongForecastProgress } from '../src/lib/xizongStudyPacket.mjs';
import { STUDY_TIMER_SCHEMA, STUDY_TIMER_LEDGER_KEY } from '../src/lib/studyTimer.mjs';
import assert from 'node:assert/strict';
import {
  XIZONG_FORECAST_MODEL_SCHEMA,
  applyXizongForecastScenario,
  assessXizongDeadlineFeasibility,
  auditXizongCompressionProposals,
  buildXizongForecastLoop,
  buildXizongForecastFalsifiability,
  buildXizongCheckpointRequirement,
  buildXizongHighScoreRequirement,
  buildXizongScoreEvidence,
  buildXizongWorkloadForecast,
  classifyXizongMaterialGaps,
  reconcileXizongMaterialIncrement
} from '../src/lib/xizongForecastModel.mjs';

function baseProgress() {
  const blocks = [
    ['A1','a1-b01',12,5,60],
    ['A1','a1-b02',18,6,90],
    ['A1','a1-b03',20,7,110],
    ['A2','a2-b01',14,4,80],
    ['A2','a2-b02',24,8,130],
    ['A2','a2-b03',30,10,null]
  ];
  const completed = blocks.slice(0,5).map(([canonical,block,kp,lg,minutes]) => ({
    canonical_id: canonical,
    block_id: block,
    kp_count: kp,
    logic_group_count: lg,
    timer_minutes_to_completion: minutes,
    completed_at: '2026-09-20T00:00:00.000Z'
  }));
  return {
    schema:'kianos.xizong.forecast-progress.v1',
    canonical_scope:{
      systems:2,
      blocks:blocks.length,
      canonical_kp:blocks.reduce((s,row)=>s+row[2],0),
      logic_groups:blocks.reduce((s,row)=>s+row[3],0),
      block_weights:blocks.map(([canonical,block,kp,lg])=>({
        canonical_id:canonical,block_id:block,kp_count:kp,logic_group_count:lg
      }))
    },
    runtime_evidence:{
      observed_blocks:6,
      completed_blocks:5,
      started_incomplete_blocks:1,
      completed_block_ids:completed.map(row=>row.block_id),
      completed_blocks_detail:completed,
      started_incomplete:[{canonical_id:'A2',block_id:'a2-b03',kp_count:30,logic_group_count:10}],
      recall:{rated:70,unknown:4,fuzzy:8,known:30,mastered:28}
    },
    question_workload:{
      status:'EXACT_COMPLETE',
      exact_union_eligible_questions:500,
      known_remaining_questions:100,
      known_remaining_is_lower_bound:false,
      cross_system_duplicate_memberships:0,
      unknown_systems:[]
    },
    practice_evidence:{
      first_pass:{
        attempted_questions:400,
        current_scope_eligible_attempted_questions:400,
        wrong_or_uncertain_rate:0.2,
        by_day:[
          {day:'2026-09-16',attempted:40,practice_timer_minutes:48,observed_minutes_per_attempt:1.2},
          {day:'2026-09-17',attempted:50,practice_timer_minutes:70,observed_minutes_per_attempt:1.4},
          {day:'2026-09-18',attempted:40,practice_timer_minutes:64,observed_minutes_per_attempt:1.6},
          {day:'2026-09-19',attempted:50,practice_timer_minutes:90,observed_minutes_per_attempt:1.8},
          {day:'2026-09-20',attempted:40,practice_timer_minutes:80,observed_minutes_per_attempt:2}
        ]
      },
      latest:{unresolved_wrong_uncertain_questions:20},
      fresh_transfer:{
        observed_probes:12,
        stable:8,
        uncertain:3,
        wrong:1,
        by_probe_kind:{FRESH_VARIANT:12},
        by_probe_kind_status:{FRESH_VARIANT:{observed:12,stable:8,uncertain:3,wrong:1}}
      }
    },
    repair_evidence:{
      total_repair_clusters:50,
      active_repair_clusters:5,
      active_question_backed_clusters:5,
      completed_repair_clusters:45,
      completed_question_backed_clusters:45,
      question_backed_clusters:50,
      unique_source_question_ids:100,
      observed_question_to_cluster_ratio:2,
      calibration_samples:[
        {timer_minutes_in_repair_window:10,exclusive_repair_timer_minutes:10},
        {timer_minutes_in_repair_window:12,exclusive_repair_timer_minutes:12},
        {timer_minutes_in_repair_window:15,exclusive_repair_timer_minutes:15},
        {timer_minutes_in_repair_window:18,exclusive_repair_timer_minutes:18},
        {timer_minutes_in_repair_window:20,exclusive_repair_timer_minutes:20}
      ]
    },
    memory_evidence:{
      precision:{cards:30,weak:4,due_weak:2,due_delayed:3,stable_waiting:18},
      core:{cards:50,weak:5,due_weak:2,due_delayed:4,stable_waiting:30}
    },
    system_recall_evidence:[
      {canonical_id:'A1',pre_question_recall_observed:true,post_first_pass_recall_observed:true,events:[
        {timer_minutes_since_previous_recall:20},{timer_minutes_since_previous_recall:22}
      ]},
      {canonical_id:'A2',pre_question_recall_observed:true,post_first_pass_recall_observed:false,events:[
        {timer_minutes_since_previous_recall:25},{timer_minutes_since_previous_recall:28},{timer_minutes_since_previous_recall:30}
      ]}
    ],
    formal_score_evidence:{
      sealed_papers:[
        {year:2024,earned_score:270,max_score:300,internal_holdout_protected_before_seal:true,exam_format_source_hash:'historical-format-v1',question_inventory_hash:'paper-2024',exam_format:{year:2024,question_count:165,max_score:300},discipline_breakdown:{disciplines:{}}},
        {year:2025,earned_score:278,max_score:300,internal_holdout_protected_before_seal:true,exam_format_source_hash:'historical-format-v1',question_inventory_hash:'paper-2025',exam_format:{year:2025,question_count:165,max_score:300},discipline_breakdown:{disciplines:{}}},
        {year:2026,earned_score:282,max_score:300,internal_holdout_protected_before_seal:true,exam_format_source_hash:'historical-format-v1',question_inventory_hash:'paper-2026',exam_format:{year:2026,question_count:165,max_score:300},discipline_breakdown:{disciplines:{}}}
      ]
    }
  };
}

{
  const requirement=buildXizongHighScoreRequirement({targetScore:275});
  assert.equal(requirement.total_loss_budget,25);
  assert.equal(requirement.point_retention_required,0.9167);
  assert.equal(requirement.disciplines.reduce((sum,row)=>sum+row.points,0),300);
  assert.equal(requirement.neutral_proportional_target_total,275);
  assert.equal(requirement.display_rounding_residual,0.01);
  assert.ok(Math.abs(
    requirement.disciplines.reduce((sum,row)=>sum+row.neutral_proportional_target_points,0)-275
  )<=0.02);
  assert.equal(requirement.disciplines.find(row=>row.id==='humanism')?.points,16);
  assert.match(requirement.boundary,/not fixed quotas/i);
}

{
  const forecast=buildXizongWorkloadForecast(baseProgress());
  assert.equal(forecast.schema,XIZONG_FORECAST_MODEL_SCHEMA);
  assert.equal(forecast.first_round.status,'FULLY_PRICED');
  assert.equal(forecast.score_formation.status,'FULLY_PRICED');
  for(const aggregate of [forecast.first_round,forecast.score_formation]){
    assert.ok(aggregate.full_band_minutes.p20<=aggregate.full_band_minutes.p50);
    assert.ok(aggregate.full_band_minutes.p50<=aggregate.full_band_minutes.p80);
  }
  assert.ok(forecast.components.knowledge.risks.includes('STARTED_INCOMPLETE_BLOCKS_PRICED_AS_FULL_REMAINING'));
}

{
  const progress=baseProgress();
  const base=buildXizongWorkloadForecast(progress);
  const stress30=buildXizongWorkloadForecast(progress,{wrongUncertainRate:0.30});
  assert.equal(stress30.components.repair.error_rate.value,0.30);
  assert.ok(
    stress30.components.repair.compression.predicted_future_wrong_uncertain_questions
    > base.components.repair.compression.predicted_future_wrong_uncertain_questions
  );
  assert.equal(stress30.components.repair.compression.observed_questions_per_cluster,2);
  assert.equal(stress30.components.repair.compression.predicted_future_clusters,15);
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
  assert.ok(forecast.risks.includes('UNPRICED_SYSTEM_QUESTION_SCOPE'));
}

{
  const noTimer=baseProgress();
  noTimer.runtime_evidence.completed_blocks_detail=noTimer.runtime_evidence.completed_blocks_detail.map(row=>({
    ...row,timer_minutes_to_completion:0
  }));
  noTimer.practice_evidence.first_pass.by_day=noTimer.practice_evidence.first_pass.by_day.map(row=>({
    ...row,practice_timer_minutes:0,observed_minutes_per_attempt:null
  }));
  noTimer.repair_evidence.calibration_samples=[];
  noTimer.system_recall_evidence=noTimer.system_recall_evidence.map(row=>({...row,events:[]}));
  const forecast=buildXizongWorkloadForecast(noTimer);
  assert.equal(forecast.first_round.full_band_minutes,null);
  assert.equal(forecast.components.knowledge.status,'NO_SAMPLES');
  assert.ok(forecast.risks.includes('INSUFFICIENT_COMPLETED_BLOCK_TIMER_SAMPLES'));
}

{
  const fastOnly=baseProgress();
  fastOnly.runtime_evidence.completed_blocks_detail=fastOnly.runtime_evidence.completed_blocks_detail.slice(0,2)
    .map(row=>({...row,canonical_id:'A1'}));
  fastOnly.runtime_evidence.completed_block_ids=fastOnly.runtime_evidence.completed_blocks_detail.map(row=>row.block_id);
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
  const readiness=buildXizongScoreEvidence(noPaper,{targetScore:275});
  assert.equal(readiness.formal_score.status,'NOT_READY');
  assert.equal(readiness.evidence_readiness.result,'INSUFFICIENT_SCORE_EVIDENCE');
}

{
  const onePaper=baseProgress();
  onePaper.formal_score_evidence={sealed_papers:[{year:2026,earned_score:279,max_score:300}]};
  const readiness=buildXizongScoreEvidence(onePaper,{targetScore:275});
  assert.equal(readiness.formal_score.status,'REFERENCE_ONLY_CONTAMINATION_UNKNOWN');
  assert.equal(readiness.formal_score.empirical_band,null);
  assert.equal(readiness.formal_score.latest_target_gap,-4);
  assert.equal(readiness.formal_score.score_extrapolation_ready,false);
  assert.equal(readiness.evidence_readiness.result,'SCORE_EVIDENCE_PRESENT_LOW_CONFIDENCE');
}

{
  const readiness=buildXizongScoreEvidence(baseProgress(),{targetScore:275});
  assert.equal(readiness.formal_score.status,'EMPIRICAL_BAND_CONTAMINATION_UNKNOWN');
  assert.equal(readiness.formal_score.score_extrapolation_ready,false);
  assert.equal(readiness.evidence_readiness.result,'SCORE_EVIDENCE_PRESENT_LOW_CONFIDENCE');
  assert.equal(readiness.formal_score.calibration_band,null);
  assert.ok(readiness.formal_score.empirical_band.p20<=readiness.formal_score.empirical_band.p50);
  assert.ok(readiness.formal_score.empirical_band.p50<=readiness.formal_score.empirical_band.p80);
  assert.equal(readiness.capabilities.precision.evidence_status,'SELECTIVE_EVIDENCE_PRESENT');
  assert.equal(readiness.capabilities.fresh_transfer.observed_probes,12);
}

{
  const readiness=buildXizongScoreEvidence(baseProgress(),{
    targetScore:275,
    materialGaps:[{id:'humanism-core',severity:'HARD',points_at_risk:16}]
  });
  assert.equal(readiness.evidence_readiness.coverage_ready,false);
  assert.equal(readiness.evidence_readiness.result,'INSUFFICIENT_SCORE_EVIDENCE');
}

{
  const contaminated=buildXizongScoreEvidence(baseProgress(),{
    targetScore:275,
    contaminationStatus:'KNOWN_PRIOR_EXPOSURE'
  });
  assert.equal(contaminated.formal_score.status,'EMPIRICAL_BAND_KNOWN_CONTAMINATION');
  assert.equal(contaminated.formal_score.score_extrapolation_ready,false);
  assert.equal(contaminated.formal_score.observed_score_is_not_fresh_prediction,true);
  assert.equal(contaminated.evidence_readiness.result,'SCORE_EVIDENCE_PRESENT_LOW_CONFIDENCE');

  const leastContaminated=buildXizongScoreEvidence(baseProgress(),{
    targetScore:275,
    contaminationStatus:'LEAST_CONTAMINATED'
  });
  assert.equal(leastContaminated.formal_score.status,'EMPIRICAL_BAND_CURRENT_FORMAT_UNKNOWN');
  assert.equal(leastContaminated.formal_score.historical_calibration_sample_count,3);
  assert.ok(leastContaminated.formal_score.historical_calibration_band);
  assert.equal(leastContaminated.formal_score.calibration_band,null);
  assert.equal(leastContaminated.formal_score.current_format_compatibility,'UNKNOWN_CURRENT_YEAR_FORMAT');
  assert.equal(leastContaminated.formal_score.score_extrapolation_ready,false);
  assert.equal(leastContaminated.evidence_readiness.result,'SCORE_EVIDENCE_PRESENT_LOW_CONFIDENCE');

  const matchedCurrentFormat=buildXizongScoreEvidence(baseProgress(),{
    targetScore:275,
    contaminationStatus:'LEAST_CONTAMINATED',
    currentExamFormatSourceHash:'historical-format-v1'
  });
  assert.equal(matchedCurrentFormat.formal_score.status,'EMPIRICAL_BAND_LOW_CONTAMINATION_CURRENT_FORMAT');
  assert.equal(matchedCurrentFormat.formal_score.calibration_sample_count,3);
  assert.ok(matchedCurrentFormat.formal_score.calibration_band);
  assert.equal(matchedCurrentFormat.formal_score.current_format_compatibility,'MATCHED');
  assert.equal(matchedCurrentFormat.formal_score.score_extrapolation_ready,false, 'matched historical quantiles do not validate future score prediction');
  assert.equal(matchedCurrentFormat.formal_score.observed_score_is_not_fresh_prediction,true);
  assert.equal(matchedCurrentFormat.evidence_readiness.result,'SCORE_EVIDENCE_PRESENT_LOW_CONFIDENCE');
}

{
  const twoProtected=baseProgress();
  twoProtected.formal_score_evidence.sealed_papers=twoProtected.formal_score_evidence.sealed_papers.slice(0,2);
  const readiness=buildXizongScoreEvidence(twoProtected,{
    targetScore:275,
    contaminationStatus:'LEAST_CONTAMINATED'
  });
  assert.equal(readiness.formal_score.historical_calibration_sample_count,2);
  assert.equal(readiness.formal_score.calibration_sample_count,0);
  assert.equal(readiness.formal_score.historical_calibration_band,null);
  assert.equal(readiness.formal_score.calibration_band,null);
  assert.equal(readiness.formal_score.score_extrapolation_ready,false);
  assert.equal(readiness.evidence_readiness.result,'SCORE_EVIDENCE_PRESENT_LOW_CONFIDENCE');
}

{
  const unprotected=baseProgress();
  unprotected.formal_score_evidence.sealed_papers=unprotected.formal_score_evidence.sealed_papers.map((row)=>({
    ...row,
    internal_holdout_protected_before_seal:false,
    external_exposure_status:'UNKNOWN'
  }));
  const readiness=buildXizongScoreEvidence(unprotected,{
    targetScore:275,
    contaminationStatus:'LEAST_CONTAMINATED'
  });
  assert.equal(readiness.formal_score.score_extrapolation_ready,false,
    'a Chat low-contamination claim must not upgrade an internally unprotected old paper');
  assert.equal(readiness.formal_score.historical_calibration_sample_count,0);
  assert.equal(readiness.formal_score.calibration_sample_count,0);
  assert.equal(readiness.evidence_readiness.result,'SCORE_EVIDENCE_PRESENT_LOW_CONFIDENCE');
  assert.match(readiness.formal_score.status,/WITHOUT_IDENTIFIED_PROTECTED_CALIBRATION/);

  const workload=buildXizongWorkloadForecast(unprotected);
  assert.equal(workload.components.formal_calibration.band_minutes,null,
    'observed old-paper scores alone must not close formal calibration workload');
  assert.equal(workload.components.formal_calibration.status,'OBSERVED_SCORE_ONLY_CONTAMINATION_UNRESOLVED');
  assert.equal(workload.score_formation.status,'PARTIAL');
}

{
  const highPaperNoCase=baseProgress();
  highPaperNoCase.formal_score_evidence.sealed_papers=highPaperNoCase.formal_score_evidence.sealed_papers.map((row)=>({
    ...row,
    earned_score:290
  }));
  const readiness=buildXizongScoreEvidence(highPaperNoCase,{
    targetScore:275,
    contaminationStatus:'LEAST_CONTAMINATED'
  });
  assert.equal(readiness.capabilities.case_stability.evidence_status,'WHOLE_PAPER_PROXY_PRESENT');
  assert.equal(readiness.capabilities.case_stability.dedicated_case_evidence,false,
    'even a high low-contamination whole paper must not manufacture dedicated case-transfer evidence');
  assert.equal(readiness.subject_maturity_claim,'OUT_OF_SCOPE',
    'Forecast score evidence must never become a subject maturity verdict');

  highPaperNoCase.practice_evidence.fresh_transfer={
    ...highPaperNoCase.practice_evidence.fresh_transfer,
    observed_probes:16,
    stable:11,
    uncertain:4,
    wrong:1,
    by_probe_kind:{
      FRESH_VARIANT:12,
      CASE_VARIANT:2,
      CROSS_SYSTEM_CASE:2
    },
    by_probe_kind_status:{
      FRESH_VARIANT:{observed:12,stable:8,uncertain:3,wrong:1},
      CASE_VARIANT:{observed:2,stable:1,uncertain:1,wrong:0},
      CROSS_SYSTEM_CASE:{observed:2,stable:2,uncertain:0,wrong:0}
    }
  };
  const withCase=buildXizongScoreEvidence(highPaperNoCase,{
    targetScore:275,
    contaminationStatus:'LEAST_CONTAMINATED'
  });
  assert.equal(withCase.capabilities.case_stability.evidence_status,'DEDICATED_CASE_TRANSFER_OBSERVED');
  assert.equal(withCase.capabilities.case_stability.dedicated_case_evidence,true);
  assert.equal(withCase.capabilities.case_stability.observed_probes,4);
  assert.equal(withCase.capabilities.case_stability.stable,3);
}

{
  const noPrecision=baseProgress();
  noPrecision.memory_evidence.precision={cards:0,weak:0,due_weak:0,due_delayed:0,stable_waiting:0};
  const readiness=buildXizongScoreEvidence(noPrecision);
  assert.equal(readiness.capabilities.precision.evidence_status,'UNKNOWN_OR_NOT_ADMITTED');
}

{
  const increment=reconcileXizongMaterialIncrement([
    {id:'case-cram',gross_minutes:900,replaces_minutes:300,overlap_minutes:150,admitted:true},
    {id:'biochem-delta',gross_minutes:240,replaces_minutes:180,overlap_minutes:0,admitted:true}
  ]);
  assert.equal(increment.status,'PRICED');
  assert.equal(increment.net_minutes,510);

  const unpriced=reconcileXizongMaterialIncrement([
    {id:'case-cram',gross_minutes:null,admitted:true}
  ]);
  assert.equal(unpriced.status,'PARTIAL');
  assert.equal(unpriced.net_minutes,null);
}

{
  const forecast=buildXizongWorkloadForecast(baseProgress());
  const baseline=applyXizongForecastScenario(forecast,{dailyMinutes:300,startDay:'2026-09-21'});
  const plus=applyXizongForecastScenario(forecast,{
    dailyMinutes:300,
    startDay:'2026-09-21',
    materialItems:[{id:'case-cram',gross_minutes:1500,replaces_minutes:0,overlap_minutes:0,admitted:true}]
  });
  assert.equal(plus.first_round.band_minutes.p50-baseline.first_round.band_minutes.p50,1500);
  assert.ok(plus.first_round.band_dates.p50.days>=baseline.first_round.band_dates.p50.days+4);

  const badWeekCap={
    '2026-09-21':0,
    '2026-09-22':0,
    '2026-09-23':0
  };
  const badWeek=applyXizongForecastScenario(forecast,{
    dailyMinutes:300,
    startDay:'2026-09-21',
    capacityMinutesByDay:badWeekCap
  });
  assert.ok(badWeek.first_round.band_dates.p50.days>=baseline.first_round.band_dates.p50.days+3);
}

{
  const low=baseProgress();
  low.runtime_evidence.completed_blocks_detail=low.runtime_evidence.completed_blocks_detail.slice(0,2);
  low.practice_evidence.first_pass.by_day=low.practice_evidence.first_pass.by_day.slice(0,2);
  low.repair_evidence.calibration_samples=low.repair_evidence.calibration_samples.slice(0,2);
  low.system_recall_evidence=[{
    canonical_id:'A1',
    pre_question_recall_observed:false,
    post_first_pass_recall_observed:false,
    events:[{timer_minutes_since_previous_recall:20}]
  }];
  const forecast=buildXizongWorkloadForecast(low);
  assert.equal(forecast.first_round.status,'PARTIAL');
  assert.equal(forecast.components.knowledge.band_minutes,null);
  assert.equal(forecast.components.questions.band_minutes,null);
  assert.equal(forecast.components.repair.band_minutes,null);
  assert.ok(forecast.components.knowledge.risks.includes('INSUFFICIENT_COMPLETED_BLOCK_TIMER_SAMPLES'));
}

{
  const drift=baseProgress();
  drift.runtime_evidence.completed_blocks_detail=[
    {canonical_id:'A1',block_id:'d1',kp_count:10,logic_group_count:5,timer_minutes_to_completion:30,completed_at:'2026-09-14T00:00:00Z'},
    {canonical_id:'A1',block_id:'d2',kp_count:10,logic_group_count:5,timer_minutes_to_completion:30,completed_at:'2026-09-15T00:00:00Z'},
    {canonical_id:'A1',block_id:'d3',kp_count:10,logic_group_count:5,timer_minutes_to_completion:30,completed_at:'2026-09-16T00:00:00Z'},
    {canonical_id:'A2',block_id:'d4',kp_count:10,logic_group_count:5,timer_minutes_to_completion:120,completed_at:'2026-09-17T00:00:00Z'},
    {canonical_id:'A2',block_id:'d5',kp_count:10,logic_group_count:5,timer_minutes_to_completion:120,completed_at:'2026-09-18T00:00:00Z'},
    {canonical_id:'B',block_id:'d6',kp_count:10,logic_group_count:5,timer_minutes_to_completion:120,completed_at:'2026-09-19T00:00:00Z'}
  ];
  drift.runtime_evidence.completed_block_ids=drift.runtime_evidence.completed_blocks_detail.map(row=>row.block_id);
  const forecast=buildXizongWorkloadForecast(drift);
  const backtest=forecast.components.knowledge.calibration.rolling_backtest;
  assert.equal(backtest.status,'BACKTESTED');
  assert.ok(backtest.median_predicted_actual_ratio<0.85);
  assert.ok(forecast.components.knowledge.risks.includes('KNOWLEDGE_FORECAST_SYSTEMATIC_OPTIMISM'));
  assert.ok(forecast.components.knowledge.risks.includes('RECENT_KNOWLEDGE_PACE_SLOWDOWN'));
}

{
  const speedDrift=baseProgress();
  speedDrift.practice_evidence.first_pass.by_day=[
    {day:'2026-09-14',attempted:20,practice_timer_minutes:20,observed_minutes_per_attempt:1},
    {day:'2026-09-15',attempted:20,practice_timer_minutes:20,observed_minutes_per_attempt:1},
    {day:'2026-09-16',attempted:20,practice_timer_minutes:20,observed_minutes_per_attempt:1},
    {day:'2026-09-17',attempted:20,practice_timer_minutes:40,observed_minutes_per_attempt:2},
    {day:'2026-09-18',attempted:20,practice_timer_minutes:40,observed_minutes_per_attempt:2},
    {day:'2026-09-19',attempted:20,practice_timer_minutes:40,observed_minutes_per_attempt:2}
  ];
  const forecast=buildXizongWorkloadForecast(speedDrift);
  assert.equal(forecast.components.questions.calibration.rolling_backtest.status,'BACKTESTED');
  assert.ok(forecast.components.questions.risks.includes('QUESTION_SPEED_SYSTEMATIC_OPTIMISM'));
}

{
  const scopedRate=baseProgress();
  scopedRate.practice_evidence.first_pass={
    ...scopedRate.practice_evidence.first_pass,
    attempted_questions:200,
    wrong_or_uncertain_rate:0.4,
    current_scope_unique_attempted_questions:50,
    current_scope_wrong_or_uncertain_rate:0.1
  };
  const forecast=buildXizongWorkloadForecast(scopedRate);
  assert.equal(forecast.components.repair.error_rate.source,'CURRENT_EXACT_SCOPE_FIRST_ATTEMPT');
  assert.equal(forecast.components.repair.error_rate.value,0.1);
  assert.equal(forecast.components.repair.compression.predicted_future_wrong_uncertain_questions,10);
}

{
  const scopedSpeed=baseProgress();
  scopedSpeed.practice_evidence.first_pass.by_day=[
    {day:'2026-09-14',attempted:20,practice_timer_minutes:40,observed_minutes_per_attempt:2,current_scope_attempted:10,current_scope_practice_timer_minutes:10,current_scope_observed_minutes_per_attempt:1},
    {day:'2026-09-15',attempted:20,practice_timer_minutes:40,observed_minutes_per_attempt:2,current_scope_attempted:10,current_scope_practice_timer_minutes:10,current_scope_observed_minutes_per_attempt:1},
    {day:'2026-09-16',attempted:20,practice_timer_minutes:40,observed_minutes_per_attempt:2,current_scope_attempted:10,current_scope_practice_timer_minutes:10,current_scope_observed_minutes_per_attempt:1},
    {day:'2026-09-17',attempted:20,practice_timer_minutes:40,observed_minutes_per_attempt:2,current_scope_attempted:10,current_scope_practice_timer_minutes:10,current_scope_observed_minutes_per_attempt:1.1},
    {day:'2026-09-18',attempted:20,practice_timer_minutes:40,observed_minutes_per_attempt:2,current_scope_attempted:10,current_scope_practice_timer_minutes:10,current_scope_observed_minutes_per_attempt:0.9}
  ];
  const forecast=buildXizongWorkloadForecast(scopedSpeed);
  assert.equal(forecast.components.questions.calibration.source,'CURRENT_EXACT_SCOPE_SYSTEM_SWEEP');
  assert.equal(forecast.components.questions.calibration.reference_minutes_per_question,1);
  assert.equal(forecast.components.questions.calibration.current_scope_day_samples,5);
}

{
  const noCompression=baseProgress();
  noCompression.repair_evidence.observed_question_to_cluster_ratio=null;
  const forecast=buildXizongWorkloadForecast(noCompression);
  assert.equal(forecast.components.repair.band_minutes,null);
  assert.ok(forecast.components.repair.risks.includes('REPAIR_COMPRESSION_UNOBSERVED'));
}

{
  const forecast=buildXizongWorkloadForecast(baseProgress());
  const generous=assessXizongDeadlineFeasibility(forecast,{
    startDay:'2026-09-21',
    deadlineDay:'2026-10-20',
    dailyMinutes:600,
    scope:'first_round'
  });
  assert.ok(['P80_FITS','P50_FITS_P80_DOES_NOT','P20_ONLY_FITS','EVEN_P20_DOES_NOT_FIT'].includes(generous.status));
  assert.equal(generous.capacity.days,30);
  assert.equal(generous.capacity.minutes,18000);
  assert.ok(generous.required_average_minutes_per_day.p20<=generous.required_average_minutes_per_day.p50);
  assert.ok(generous.required_average_minutes_per_day.p50<=generous.required_average_minutes_per_day.p80);

  const impossible=assessXizongDeadlineFeasibility(forecast,{
    startDay:'2026-09-21',
    deadlineDay:'2026-09-21',
    dailyMinutes:1,
    scope:'score_formation'
  });
  assert.equal(impossible.status,'EVEN_P20_DOES_NOT_FIT');

  const partial=baseProgress();
  partial.question_workload={...partial.question_workload,status:'EXACT_PARTIAL',known_remaining_is_lower_bound:true,unknown_systems:['F']};
  const partialForecast=buildXizongWorkloadForecast(partial);
  const unknown=assessXizongDeadlineFeasibility(partialForecast,{
    startDay:'2026-09-21',
    deadlineDay:'2026-10-20',
    dailyMinutes:300,
    scope:'first_round'
  });
  assert.equal(unknown.status,'UNPRICED',
    'unknown F scope must not become a fake calendar completion claim');
  assert.equal(unknown.fit,null);
  assert.ok(unknown.known_lower_bound_fit,
    'known priced work may still expose a lower-bound capacity check without claiming full completion');
}


{
  const forecast=buildXizongWorkloadForecast(baseProgress());
  const checkpoint=buildXizongCheckpointRequirement(forecast,{
    startDay:'2026-09-21',
    deadlineDay:'2026-10-20',
    dailyMinutes:300,
    scope:'first_round'
  });
  assert.equal(checkpoint.capacity.days,30);
  assert.equal(checkpoint.capacity.minutes,9000);
  assert.deepEqual(
    checkpoint.work_buckets.map(row=>row.learner_role),
    ['LEARN','ATTEMPT','RECONSTRUCT','REPAIR']
  );
  assert.equal(checkpoint.subject_stage_decision,'OUT_OF_SCOPE');
  assert.equal(checkpoint.full_scope_priced,true);

  const scoreCheckpoint=buildXizongCheckpointRequirement(forecast,{
    startDay:'2026-09-21',
    deadlineDay:'2026-10-20',
    dailyMinutes:300,
    scope:'score_formation',
    materialItems:[
      {id:'case-cram',gross_minutes:900,replaces_minutes:300,overlap_minutes:150,admitted:true}
    ]
  });
  assert.deepEqual(
    scoreCheckpoint.work_buckets.map(row=>row.learner_role),
    ['LEARN','ATTEMPT','RECONSTRUCT','REPAIR','VERIFY','FORMAL_SCORE_CALIBRATE']
  );
  assert.equal(scoreCheckpoint.feasibility.scope,'score_formation');
  assert.equal(scoreCheckpoint.feasibility.band_minutes.p50,
    forecast.score_formation.full_band_minutes.p50 + 450,
    'Case/Cram must enter checkpoint capacity as deduplicated net-new work, not gross duration');
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
  const checkpoint=buildXizongCheckpointRequirement(forecast,{
    startDay:'2026-09-21',
    deadlineDay:'2026-10-20',
    dailyMinutes:300,
    scope:'first_round'
  });
  assert.equal(checkpoint.full_scope_priced,false);
  assert.equal(checkpoint.feasibility.status,'UNPRICED');
  assert.equal(checkpoint.feasibility.fit,null);
}


{
  const compression=auditXizongCompressionProposals([
    {id:'case-overlap',kind:'MATERIAL_OVERLAP',target:'CASE_CRAM_REPEAT',minutes:300},
    {id:'stable-q',kind:'STABLE_SECOND_PASS_REPETITION',target:'SECOND_PASS_REPETITION',minutes:180},
    {id:'repair-dedup',kind:'REPAIR_CLUSTER_DEDUP',target:'DUPLICATE_REPAIR',minutes:120},
    {id:'bad-source-cut',kind:'OPTIONAL_LOW_VALUE',target:'FIRST_PASS_SOURCE_CONTACT',minutes:600},
    {id:'bad-score-cut',kind:'OPTIONAL_LOW_VALUE',target:'FORMAL_SCORE_CALIBRATION',minutes:180}
  ]);
  assert.equal(compression.proposals.find(row=>row.id==='case-overlap')?.decision,'ALLOW');
  assert.equal(compression.proposals.find(row=>row.id==='stable-q')?.decision,'ALLOW');
  assert.equal(compression.proposals.find(row=>row.id==='repair-dedup')?.decision,'ALLOW');
  assert.equal(compression.proposals.find(row=>row.id==='bad-source-cut')?.decision,'REJECT');
  assert.equal(compression.proposals.find(row=>row.id==='bad-score-cut')?.decision,'REJECT');
  assert.equal(compression.safe,false);
  assert.equal(compression.allowed_minutes,600);
  assert.equal(compression.rejected_minutes,780);
}

{
  const materials=classifyXizongMaterialGaps([
    {id:'humanism-core',type:'HARD_COVERAGE_GAP',points_at_risk:16},
    {id:'biochem-2027-delta',type:'CURRENT_YEAR_DELTA_GAP'},
    {id:'f-official-scope',type:'ROUTING_FORECAST_GAP'},
    {id:'case-cram',type:'OPTIONAL_DELTA_GAP'}
  ]);
  assert.equal(materials.coverage_ready,false);
  assert.equal(materials.full_forecast_material_ready,false);
  assert.deepEqual(materials.hard_coverage_gap_ids,['humanism-core']);
  assert.deepEqual(materials.current_year_delta_gap_ids,['biochem-2027-delta']);
  assert.deepEqual(materials.routing_gap_ids,['f-official-scope']);
  assert.deepEqual(materials.optional_delta_gap_ids,['case-cram']);
  assert.ok(!materials.hard_coverage_gap_ids.includes('f-official-scope'),
    'missing F routing must not masquerade as missing medical Core');
}

{
  const loop=buildXizongForecastLoop(baseProgress(),{
    targetScore:275,
    contaminationStatus:'KNOWN_PRIOR_EXPOSURE',
    materialGaps:[
      {id:'humanism-core',type:'HARD_COVERAGE_GAP',points_at_risk:16},
      {id:'biochem-2027-delta',type:'CURRENT_YEAR_DELTA_GAP'},
      {id:'f-official-scope',type:'ROUTING_FORECAST_GAP'}
    ],
    dailyMinutes:300,
    startDay:'2026-09-21'
  });
  assert.equal(loop.forecast_state,'COVERAGE_INCOMPLETE');
  assert.ok(loop.uncertainty.includes('HARD_MATERIAL_COVERAGE_INCOMPLETE'));
  assert.ok(loop.uncertainty.includes('MATERIAL_OR_ROUTING_SCOPE_UNPRICED'));
  assert.equal(loop.score.evidence_readiness.coverage_ready,false);
  assert.equal(loop.model_logic_validation,'CI_GATED_EXTERNALLY');
  assert.equal(loop.subject_stage_decision,'OUT_OF_SCOPE');
}

{
  const routingOnly=buildXizongForecastLoop(baseProgress(),{
    targetScore:275,
    contaminationStatus:'LEAST_CONTAMINATED',
    materialGaps:[{id:'f-official-scope',type:'ROUTING_FORECAST_GAP'}],
    dailyMinutes:300,
    startDay:'2026-09-21'
  });
  assert.equal(routingOnly.materials.coverage_ready,true);
  assert.equal(routingOnly.materials.full_forecast_material_ready,false);
  assert.ok(!routingOnly.uncertainty.includes('HARD_MATERIAL_COVERAGE_INCOMPLETE'));
  assert.ok(routingOnly.uncertainty.includes('MATERIAL_OR_ROUTING_SCOPE_UNPRICED'));
  assert.equal(routingOnly.empirical_calibration_ready,false);
  assert.ok(routingOnly.uncertainty.includes('EMPIRICAL_FORECAST_CALIBRATION_INCOMPLETE'));
  assert.ok(routingOnly.uncertainty.includes('DEDICATED_CASE_TRANSFER_UNKNOWN'));
}

{
  const allBlocksNoPaper=baseProgress();
  allBlocksNoPaper.formal_score_evidence={sealed_papers:[]};
  allBlocksNoPaper.runtime_evidence.completed_blocks=allBlocksNoPaper.canonical_scope.blocks;
  allBlocksNoPaper.runtime_evidence.completed_block_ids=allBlocksNoPaper.canonical_scope.block_weights.map(row=>row.block_id);
  const readiness=buildXizongScoreEvidence(allBlocksNoPaper);
  assert.equal(readiness.capabilities.source_model.evidence_status,'FULL_RUNTIME_CLOSURE_OBSERVED');
  assert.equal(readiness.formal_score.status,'NOT_READY');
  assert.equal(readiness.evidence_readiness.result,'INSUFFICIENT_SCORE_EVIDENCE');
}


{
  const hetero=baseProgress();
  hetero.question_workload.systems=[
    {canonical_id:'A1',system_id:'a1',status:'EXACT',remaining_questions:20},
    {canonical_id:'A2',system_id:'a2',status:'EXACT',remaining_questions:80}
  ];
  hetero.practice_evidence.first_pass.by_system=[
    {
      canonical_id:'A1',
      current_scope_unique_attempted:40,
      current_scope_wrong_or_uncertain_rate:0.05,
      current_scope_speed_by_day:[
        {day:'2026-09-16',observed_minutes_per_attempt:1.0},
        {day:'2026-09-17',observed_minutes_per_attempt:1.1},
        {day:'2026-09-18',observed_minutes_per_attempt:0.9}
      ]
    },
    {
      canonical_id:'A2',
      current_scope_unique_attempted:40,
      current_scope_wrong_or_uncertain_rate:0.40,
      current_scope_speed_by_day:[
        {day:'2026-09-16',observed_minutes_per_attempt:3.0},
        {day:'2026-09-17',observed_minutes_per_attempt:3.2},
        {day:'2026-09-18',observed_minutes_per_attempt:2.8}
      ]
    }
  ];
  hetero.repair_evidence.by_system=[
    {
      canonical_id:'A1',
      question_backed_clusters:5,
      unique_source_question_ids:10,
      observed_question_to_cluster_ratio:2
    },
    {
      canonical_id:'A2',
      question_backed_clusters:12,
      unique_source_question_ids:12,
      observed_question_to_cluster_ratio:1
    }
  ];
  const forecast=buildXizongWorkloadForecast(hetero);
  assert.equal(forecast.components.questions.calibration.source,'OWNER_STRATIFIED_CURRENT_EXACT_SCOPE');
  assert.equal(forecast.components.questions.band_minutes.p50,260,
    'slow A2 remaining load must dominate instead of inheriting fast A1 speed');
  assert.equal(forecast.components.questions.calibration.system_speed_heterogeneity_ratio,3);
  assert.ok(forecast.components.questions.risks.includes('QUESTION_SPEED_OWNER_HETEROGENEITY'));
  assert.equal(forecast.components.repair.error_rate.source,'OWNER_STRATIFIED_CURRENT_EXACT_SCOPE');
  assert.equal(forecast.components.repair.error_rate.forecast_weighted_value,0.33);
  assert.equal(forecast.components.repair.compression.predicted_future_wrong_uncertain_questions,33,
    'future W/U must weight each System rate by its own remaining question load');
  assert.equal(forecast.components.repair.compression.predicted_future_clusters,32.5,
    'Repair compression must use each System own observed questions-per-cluster ratio');
  assert.ok(forecast.components.repair.risks.includes('WRONG_UNCERTAIN_OWNER_HETEROGENEITY'));
}

{
  const missingSpeed=baseProgress();
  missingSpeed.question_workload.systems=[
    {canonical_id:'A1',system_id:'a1',status:'EXACT',remaining_questions:20},
    {canonical_id:'A2',system_id:'a2',status:'EXACT',remaining_questions:80}
  ];
  missingSpeed.practice_evidence.first_pass.by_system=[
    {
      canonical_id:'A1',
      current_scope_unique_attempted:40,
      current_scope_wrong_or_uncertain_rate:0.10,
      current_scope_speed_by_day:[
        {day:'2026-09-16',observed_minutes_per_attempt:1},
        {day:'2026-09-17',observed_minutes_per_attempt:1},
        {day:'2026-09-18',observed_minutes_per_attempt:1}
      ]
    },
    {
      canonical_id:'A2',
      current_scope_unique_attempted:40,
      current_scope_wrong_or_uncertain_rate:0.25,
      current_scope_speed_by_day:[]
    }
  ];
  const forecast=buildXizongWorkloadForecast(missingSpeed);
  assert.equal(forecast.components.questions.band_minutes,null,
    'an unobserved remaining System must not inherit pooled speed from a familiar System');
  assert.deepEqual(forecast.components.questions.calibration.unpriced_system_ids,['A2']);
  assert.ok(forecast.components.questions.risks.includes('SYSTEM_QUESTION_SPEED_UNCALIBRATED'));
}

{
  const missingRate=baseProgress();
  missingRate.question_workload.systems=[
    {canonical_id:'A1',system_id:'a1',status:'EXACT',remaining_questions:20},
    {canonical_id:'A2',system_id:'a2',status:'EXACT',remaining_questions:80}
  ];
  missingRate.practice_evidence.first_pass.by_system=[
    {
      canonical_id:'A1',
      current_scope_unique_attempted:40,
      current_scope_wrong_or_uncertain_rate:0.10,
      current_scope_speed_by_day:[
        {day:'2026-09-16',observed_minutes_per_attempt:1},
        {day:'2026-09-17',observed_minutes_per_attempt:1},
        {day:'2026-09-18',observed_minutes_per_attempt:1}
      ]
    },
    {
      canonical_id:'A2',
      current_scope_unique_attempted:0,
      current_scope_wrong_or_uncertain_rate:null,
      current_scope_speed_by_day:[
        {day:'2026-09-16',observed_minutes_per_attempt:2},
        {day:'2026-09-17',observed_minutes_per_attempt:2},
        {day:'2026-09-18',observed_minutes_per_attempt:2}
      ]
    }
  ];
  const forecast=buildXizongWorkloadForecast(missingRate);
  assert.equal(forecast.components.repair.band_minutes,null,
    'an unobserved remaining System W/U rate must not inherit A1 error rate');
  assert.deepEqual(forecast.components.repair.error_rate.unpriced_system_ids,['A2']);
  assert.ok(forecast.components.repair.risks.includes('SYSTEM_WRONG_UNCERTAIN_RATE_UNOBSERVED'));

  const scenario=buildXizongWorkloadForecast(missingRate,{wrongUncertainRate:0.30});
  assert.equal(scenario.components.repair.error_rate.source,'SCENARIO_OVERRIDE');
  assert.equal(scenario.components.repair.compression.predicted_future_wrong_uncertain_questions,30,
    'explicit 30% stress scenario may intentionally override System-specific unknowns');
}


{
  const missingCompression=baseProgress();
  missingCompression.question_workload.systems=[
    {canonical_id:'A1',system_id:'a1',status:'EXACT',remaining_questions:20},
    {canonical_id:'A2',system_id:'a2',status:'EXACT',remaining_questions:80}
  ];
  missingCompression.practice_evidence.first_pass.by_system=[
    {
      canonical_id:'A1',
      current_scope_unique_attempted:40,
      current_scope_wrong_or_uncertain_rate:0.10,
      current_scope_speed_by_day:[
        {day:'2026-09-16',observed_minutes_per_attempt:1},
        {day:'2026-09-17',observed_minutes_per_attempt:1},
        {day:'2026-09-18',observed_minutes_per_attempt:1}
      ]
    },
    {
      canonical_id:'A2',
      current_scope_unique_attempted:40,
      current_scope_wrong_or_uncertain_rate:0.30,
      current_scope_speed_by_day:[
        {day:'2026-09-16',observed_minutes_per_attempt:2},
        {day:'2026-09-17',observed_minutes_per_attempt:2},
        {day:'2026-09-18',observed_minutes_per_attempt:2}
      ]
    }
  ];
  missingCompression.repair_evidence.by_system=[
    {
      canonical_id:'A1',
      question_backed_clusters:5,
      unique_source_question_ids:10,
      observed_question_to_cluster_ratio:2
    }
  ];
  const forecast=buildXizongWorkloadForecast(missingCompression);
  assert.equal(forecast.components.repair.band_minutes,null,
    'A1 Repair compression must not price an unobserved A2 compression ratio');
  assert.deepEqual(forecast.components.repair.compression.unpriced_system_ids,['A2']);
  assert.ok(forecast.components.repair.risks.includes('SYSTEM_REPAIR_COMPRESSION_UNCALIBRATED'));
}

{
  const mixedOnly=baseProgress();
  mixedOnly.repair_evidence.calibration_samples=mixedOnly.repair_evidence.calibration_samples.map((row)=>({
    timer_minutes_in_repair_window:row.timer_minutes_in_repair_window,
    exclusive_repair_timer_minutes:null
  }));
  const forecast=buildXizongWorkloadForecast(mixedOnly);
  assert.equal(forecast.components.repair.band_minutes,null,
    'mixed Block-route lifetime timing must not be added as causal Repair workload');
  assert.equal(forecast.components.repair.calibration.exclusive_repair_timer_samples,0);
  assert.equal(forecast.components.repair.calibration.mixed_window_timer_samples,5);
  assert.ok(forecast.components.repair.risks.includes('REPAIR_TIMER_CONTAMINATED_MIXED_WINDOW'));
  assert.ok(forecast.components.repair.risks.includes('REPAIR_TIME_UNCALIBRATED'));
  assert.equal(forecast.first_round.full_band_minutes,null,
    'first-round total must withhold full pricing when Repair time is contaminated');
}

console.log('PASS Xizong forecast adversarial suite: target→capability→workload→material delta→capacity→score evidence fail-closed');


{
  const surface=buildXizongForecastFalsifiability(baseProgress(),{
    startDay:'2026-09-21',
    deadlineDay:'2026-10-20',
    dailyMinutes:300,
    scope:'first_round',
    wrongUncertainRateGrid:[0.15,0.30,0.45],
    dailyMinutesGrid:[180,300,420]
  });
  assert.equal(surface.schema,'kianos.xizong.forecast-falsifiability.v1');
  assert.equal(surface.wrong_uncertain_capacity_grid.length,9);
  assert.equal(surface.p50_flip_surface.length,3);
  assert.ok(surface.capacity_flip_points.p20_daily_minutes<=surface.capacity_flip_points.p50_daily_minutes);
  assert.ok(surface.capacity_flip_points.p50_daily_minutes<=surface.capacity_flip_points.p80_daily_minutes);
  assert.ok(surface.next_high_value_evidence);
  assert.match(surface.boundary,/do not choose the learner action/i);

  for(const capacity of [180,300,420]){
    const rows=surface.wrong_uncertain_capacity_grid
      .filter(row=>row.daily_minutes===capacity)
      .sort((a,b)=>a.wrong_uncertain_rate-b.wrong_uncertain_rate);
    const priced=rows.filter(row=>row.required_average_minutes_per_day?.p50!=null);
    for(let i=1;i<priced.length;i+=1){
      assert.ok(
        priced[i].required_average_minutes_per_day.p50
        >= priced[i-1].required_average_minutes_per_day.p50,
        'raising W/U must not reduce required P50 daily capacity'
      );
    }
  }

  const rate030=surface.wrong_uncertain_capacity_grid
    .filter(row=>row.wrong_uncertain_rate===0.3)
    .sort((a,b)=>a.daily_minutes-b.daily_minutes);
  const fitRank=(value)=>value===true?2:value===false?1:0;
  for(let i=1;i<rate030.length;i+=1){
    assert.ok(
      fitRank(rate030[i].p50_fit)>=fitRank(rate030[i-1].p50_fit),
      'more daily capacity must not worsen P50 feasibility'
    );
  }
}

{
  const partial=baseProgress();
  partial.question_workload={
    ...partial.question_workload,
    status:'EXACT_PARTIAL',
    known_remaining_is_lower_bound:true,
    unknown_systems:['F']
  };
  const surface=buildXizongForecastFalsifiability(partial,{
    startDay:'2026-09-21',
    deadlineDay:'2026-10-20',
    dailyMinutes:300
  });
  assert.equal(surface.next_high_value_evidence.id,'FULL_PRICING_BLOCKER');
  assert.ok(surface.evidence_candidates.some(row=>row.id==='FULL_PRICING_BLOCKER'));
}

console.log('PASS Xizong forecast falsifiability: sensitivity grid + flip surface + next information evidence');

// D2: remaining-owner demand activates pricing even when no medical System remains.
{
  const p = baseProgress();
  const days = Array.from({ length: 5 }, (_, i) => ({ day: `2026-09-${15+i}`, attempted: 80, practice_timer_minutes: 170, observed_minutes_per_attempt: 2.125 }));
  const owner = (id, rate, speed, attempted) => ({ canonical_id: id, current_scope_unique_attempted: attempted, current_scope_wrong_or_uncertain_rate: rate, current_scope_speed_by_day: days.map(row => ({ ...row, observed_minutes_per_attempt: speed })) });
  p.question_workload = { status: 'EXACT_COMPLETE', known_remaining_questions: 50, known_remaining_is_lower_bound: false, systems: [{ canonical_id: 'A1', status: 'EXACT', remaining_questions: 0 }], non_system_domains: [{ domain_id: 'clinical-humanities', canonical_id: 'HUMANITIES', status: 'EXACT', remaining_questions: 50 }], unknown_systems: [], unknown_domains: [] };
  p.practice_evidence.first_pass = { attempted_questions: 400, wrong_or_uncertain_rate: 0, by_day: days, by_system: [owner('A1', .1, 1, 350)], by_domain: [owner('HUMANITIES', 1, 10, 50)] };
  p.practice_evidence.latest.unresolved_wrong_uncertain_questions = 0;
  p.repair_evidence.active_question_backed_clusters = 0;
  p.repair_evidence.by_system = [{ canonical_id: 'A1', question_backed_clusters: 5, observed_question_to_cluster_ratio: 1 }];
  p.repair_evidence.by_domain = [{ canonical_id: 'HUMANITIES', question_backed_clusters: 5, observed_question_to_cluster_ratio: 5 }];
  let f = buildXizongWorkloadForecast(p);
  assert.equal(f.components.questions.band_minutes.p50, 500);
  assert.equal(f.components.repair.compression.predicted_future_wrong_uncertain_questions, 50);
  assert.equal(f.components.repair.compression.predicted_future_clusters, 10);
  assert.equal(f.components.verification.band_minutes.p50, 500);
  assert.equal(f.components.verification.status, 'PROVISIONAL_REFERENCE');
  assert.ok(f.components.verification.risks.includes('FRESH_VERIFICATION_TIMING_NOT_OBSERVED'));
  const saved = structuredClone(p);
  p.practice_evidence.first_pass.by_domain = [];
  p.repair_evidence.by_domain = [];
  f = buildXizongWorkloadForecast(p);
  assert.equal(f.components.questions.band_minutes, null);
  assert.equal(f.components.questions.status, 'UNPRICED_REQUIRED');
  assert.equal(f.components.repair.status, 'UNPRICED_REQUIRED');
  assert.equal(f.components.repair.compression.predicted_future_wrong_uncertain_questions, null);
  assert.equal(f.components.verification.estimated_verification_questions, null);
  assert.equal(f.components.verification.band_minutes, null);
  assert.deepEqual(f.components.repair.error_rate.unpriced_domain_ids, ['HUMANITIES']);
  p.practice_evidence.first_pass.by_domain = [owner('HUMANITIES', 0, 10, 50)];
  f = buildXizongWorkloadForecast(p);
  assert.equal(f.components.repair.compression.predicted_future_wrong_uncertain_questions, 0);
  assert.equal(f.components.verification.band_minutes.p50, 0);
  const mixed = structuredClone(saved);
  mixed.question_workload.systems[0].remaining_questions = 50;
  mixed.question_workload.known_remaining_questions = 100;
  f = buildXizongWorkloadForecast(mixed);
  assert.equal(f.components.questions.band_minutes.p50, 550);
  assert.equal(f.components.repair.compression.predicted_future_wrong_uncertain_questions, 55);
  assert.equal(f.components.repair.compression.predicted_future_clusters, 15);
  assert.equal(f.components.verification.band_minutes.p50, 505);
  assert.equal(f.components.verification.status, 'PROVISIONAL_REFERENCE');
  const before = JSON.stringify(mixed);
  buildXizongWorkloadForecast(mixed, { wrongUncertainRate: .5 });
  assert.equal(JSON.stringify(mixed), before);
  mixed.question_workload.non_system_domains[0].remaining_questions = 0;
  mixed.question_workload.known_remaining_questions = 50;
  mixed.practice_evidence.first_pass.by_domain = [];
  assert.equal(buildXizongWorkloadForecast(mixed).components.questions.band_minutes.p50, 50);
  mixed.question_workload.status = 'EXACT_PARTIAL';
  mixed.question_workload.known_remaining_is_lower_bound = true;
  mixed.question_workload.unknown_domains = ['HUMANITIES'];
  assert.equal(buildXizongWorkloadForecast(mixed).first_round.full_band_minutes, null);
}
console.log('PASS D2 owner-only pricing, missing/zero, heterogeneous provisional verification, unknown scope and non-mutating scenarios');

{
  const revised = baseProgress();
  revised.formal_score_evidence.sealed_papers = revised.formal_score_evidence.sealed_papers.map(row => ({ ...row, current_revision_valid: false }));
  const score = buildXizongScoreEvidence(revised, { contaminationStatus: 'LOW', currentExamFormatSourceHash: 'historical-format-v1' });
  assert.equal(score.formal_score.sample_count, 3, 'historical sealed scores remain observations');
  assert.equal(score.formal_score.calibration_sample_count, 0, 'superseded semantics cannot calibrate Current');
  assert.equal(score.formal_score.score_extrapolation_ready, false);
  assert.equal(buildXizongWorkloadForecast(revised).components.formal_calibration.band_minutes, null);
}
console.log('PASS historical sealed scores preserved while Current calibration remains withheld');


// Production adapter regression: native completion, observation identity, and unknown numeric values.
{
  const storage = (entries) => {
    const map = new Map(Object.entries(entries));
    return { getItem: (key) => map.get(key) ?? null, key: (i) => [...map.keys()][i], get length() { return map.size; } };
  };
  const index = [{ systemId: 'circulation', blockId: 'circulation-b01', routeKey: 'circulation/b01',
    packetMeta: { objectId: 'xizong:circulation-b01', canonicalId: 'A1', sourceHash: 'current-source' },
    kpRows: [{ kpId: 'kp1', groupId: 'lg1' }] }];
  const key = 'kianos-xizong-astro-v2:xizong:circulation-b01';
  const incomplete = { sourceHash: 'current-source', completed: true, completedAt: '2026-09-20T02:00:00Z' };
  const valid = { ...incomplete, blockRecallDone: true, learned: { kp1: true }, ratings: { kp1: 'fuzzy' } };
  const progress = (entries) => buildXizongForecastProgress(storage(entries), index, { now: Date.parse('2026-09-21T00:00:00Z') });
  const blocked = progress({ [key]: JSON.stringify(incomplete) });
  assert.equal(blocked.runtime_evidence.completed_blocks, 0);
  assert.equal(blocked.workload_forecast.components.knowledge.remaining.blocks, 1);
  assert.equal(progress({ [key]: JSON.stringify(valid) }).runtime_evidence.completed_blocks, 1);
  assert.equal(progress({ [key]: JSON.stringify({ ...valid, sourceHash: 'old-source' }) }).runtime_evidence.completed_blocks, 0);
  const session = { id: 'one-hour', subject: 'xizong', context: { subject: 'xizong', detailKey: 'circulation/b01' },
    startedAt: Date.parse('2026-09-20T01:00:00Z'), endedAt: Date.parse('2026-09-20T02:00:00Z') };
  const timerEntries = { [key]: JSON.stringify(valid), [STUDY_TIMER_LEDGER_KEY]: JSON.stringify({ schema: STUDY_TIMER_SCHEMA, sessions: [session, session] }) };
  const before = JSON.stringify(timerEntries);
  assert.equal(progress(timerEntries).runtime_evidence.completed_blocks_detail[0].timer_minutes_to_completion, 60);
  assert.equal(JSON.stringify(timerEntries), before, 'Forecast must not rewrite timer evidence');
  assert.throws(() => progress({ ...timerEntries, [STUDY_TIMER_LEDGER_KEY]: JSON.stringify({ schema: STUDY_TIMER_SCHEMA, sessions: [session, { ...session, endedAt: session.endedAt + 60000 }] }) }), /TIMER_DUPLICATE_CONFLICT/);
  const seal = { sealedAt: '2026-09-20T02:00:00Z', summary: { maxScore: 300, questionCount: 165, earnedScore: null },
    evidenceContext: { questionSemanticRevisions: { q1: 'revision-1' }, questionInventoryHash: 'paper-2026', examFormatSourceHash: 'format-v1', examFormat: { max_score: 300, question_count: 165 }, internalHoldoutProtectedBeforeSeal: true } };
  const paperProgress = buildXizongForecastProgress(storage({ 'kianos:xizong:paper-question-sweep:paper-2026:v1': JSON.stringify({ paperSeal: seal }) }), index,
    { questionScope: { schema: 'kianos.xizong.forecast-question-scope.v1', systems: [], question_semantic_revisions: { q1: 'revision-1' } } });
  assert.equal(paperProgress.formal_score_evidence.sealed_papers[0].earned_score, null);
  const unknown = buildXizongScoreEvidence(paperProgress, { contaminationStatus: 'LOW', currentExamFormatSourceHash: 'format-v1' });
  assert.equal(unknown.formal_score.latest_score, null);
  assert.equal(unknown.formal_score.latest_target_gap, null);
  assert.equal(unknown.formal_score.calibration_sample_count, 0);
  assert.equal(unknown.formal_score.sample_count, 0);
  assert.equal(unknown.evidence_readiness.formal_score_evidence_ready, false);
  for (const earnedScore of [null, false, [], '', '0', '280', {}, -1, 301]) {
    const row = buildXizongForecastProgress(storage({ 'kianos:xizong:paper-question-sweep:paper-2026:v1': JSON.stringify({ paperSeal: { ...seal, summary: { ...seal.summary, earnedScore } } }) }), index);
    assert.equal(row.formal_score_evidence.sealed_papers[0].earned_score, null);
    const direct = { ...paperProgress, formal_score_evidence: { sealed_papers: [{ ...paperProgress.formal_score_evidence.sealed_papers[0], earned_score: earnedScore }] } };
    assert.equal(buildXizongScoreEvidence(direct).formal_score.latest_score, null);
  }
  const realZero = { ...paperProgress, formal_score_evidence: { sealed_papers: [{ ...paperProgress.formal_score_evidence.sealed_papers[0], earned_score: 0 }] } };
  assert.equal(buildXizongScoreEvidence(realZero).formal_score.latest_score, 0);
  assert.equal(buildXizongScoreEvidence(realZero).formal_score.latest_target_gap, 275);
  const paper = { ...paperProgress.formal_score_evidence.sealed_papers[0], earned_score: 280 };
  paperProgress.formal_score_evidence.sealed_papers = [paper, structuredClone(paper), structuredClone(paper)];
  const duplicated = buildXizongScoreEvidence(paperProgress, { contaminationStatus: 'LOW', currentExamFormatSourceHash: 'format-v1' });
  assert.equal(duplicated.formal_score.raw_observation_count, 3);
  assert.equal(duplicated.formal_score.sample_count, 1);
  assert.equal(duplicated.formal_score.calibration_sample_count, 1);
  assert.equal(duplicated.formal_score.calibration_band, null);
  const original = JSON.stringify(paperProgress);
  buildXizongScoreEvidence(paperProgress);
  assert.equal(JSON.stringify(paperProgress), original);
  paperProgress.formal_score_evidence.sealed_papers = [paper, { ...paper, earned_score: 290 }];
  const conflict = buildXizongScoreEvidence(paperProgress);
  assert.equal(conflict.formal_score.sample_count, 0);
  assert.equal(conflict.formal_score.raw_observation_count, 2);
  assert.deepEqual(conflict.formal_score.conflicting_paper_ids, ['2026']);
  assert.equal(buildXizongScoreEvidence(paperProgress, { contaminationStatus: 'LOW', currentExamFormatSourceHash: 'format-v1' }).formal_score.calibration_sample_count, 0);
  paperProgress.formal_score_evidence.sealed_papers = [paper, { ...paper, sealed_at: '2026-09-21T02:00:00Z', earned_score: 290 }, { ...paper, sealed_at: '2026-09-22T02:00:00Z', earned_score: 300 }];
  assert.equal(buildXizongScoreEvidence(paperProgress, { contaminationStatus: 'LOW', currentExamFormatSourceHash: 'format-v1' }).formal_score.calibration_sample_count, 1);
  paperProgress.formal_score_evidence.sealed_papers = [{ ...paper, external_exposure_status: 'KNOWN_PRIOR_EXPOSURE' }];
  const exposed = buildXizongScoreEvidence(paperProgress, { contaminationStatus: 'FRESH_EQUIVALENT', currentExamFormatSourceHash: 'format-v1' });
  assert.equal(exposed.formal_score.sample_count, 1, 'historical exposed score is retained');
  assert.equal(exposed.formal_score.latest_score, 280);
  assert.equal(exposed.formal_score.calibration_sample_count, 0, 'a global label cannot erase known paper exposure');
  assert.equal(buildXizongWorkloadForecast(paperProgress).components.formal_calibration.band_minutes, null);
}
{
  const initial = buildXizongWorkloadForecast(baseProgress());
  for (const owner of ['knowledge', 'questions', 'system_recall', 'repair']) assert.equal(initial.components[owner].status, 'PROVISIONAL');
  const progress = baseProgress();
  const rates = [1, 1, 1, 10, 100, 1000];
  progress.runtime_evidence.completed_blocks_detail = rates.map((minutes, i) => ({ canonical_id: i % 2 ? 'A1' : 'A2', block_id: 'done-' + i,
    kp_count: 10, logic_group_count: 2, timer_minutes_to_completion: minutes, completed_at: `2026-09-${10 + i}T00:00:00Z` }));
  progress.practice_evidence.first_pass.by_day = rates.map((rate, i) => ({ day: `2026-09-${10 + i}`, attempted: 10, practice_timer_minutes: rate * 10, observed_minutes_per_attempt: rate }));
  progress.current_exam_format = { source_hash: 'historical-format-v1' };
  const loop = buildXizongForecastLoop(progress, { contaminationStatus: 'LOW' });
  assert.equal(loop.workload.components.knowledge.calibration.rolling_backtest.median_absolute_percent_error, 0.99);
  assert.equal(loop.workload.components.questions.calibration.rolling_backtest.median_absolute_percent_error, 0.99);
  assert.equal(loop.workload.components.knowledge.status, 'PROVISIONAL');
  assert.equal(loop.workload.components.questions.status, 'PROVISIONAL');
  assert.equal(loop.empirical_calibration_ready, false);
  assert.equal(loop.forecast_state, 'CALIBRATING');
  const forecast = buildXizongWorkloadForecast(baseProgress());
  for (const capacityMinutesByDay of [[], false, 'unknown', { '2026-09-21': null }, { '2026-09-21': 'unknown' }]) {
    const options = { startDay: '2026-09-21', deadlineDay: '2026-09-21', dailyMinutes: 10000, capacityMinutesByDay };
    const result = assessXizongDeadlineFeasibility(forecast, options);
    assert.equal(result.capacity, null);
    assert.equal(result.fit, null);
    assert.equal(result.status, 'UNPRICED');
    assert.equal(applyXizongForecastScenario(forecast, options).first_round.band_dates.p50.date, null);
  }
  const zero = assessXizongDeadlineFeasibility(forecast, { startDay: '2026-09-21', deadlineDay: '2026-09-21', dailyMinutes: 0 });
  assert.equal(zero.capacity.minutes, 0);
  assert.equal(zero.fit.p20, false);
  for (const [startDay, deadlineDay] of [['2026-02-31', '2026-03-03'], ['2026-02-28', '2026-02-31'], ['2026-09-22', '2026-09-21']]) {
    const invalidDate = assessXizongDeadlineFeasibility(forecast, { startDay, deadlineDay, dailyMinutes: 10000 });
    assert.equal(invalidDate.capacity, null);
    assert.equal(invalidDate.fit, null);
  }
  assert.equal(applyXizongForecastScenario(forecast, { startDay: '2026-02-31', dailyMinutes: 10000 }).first_round.band_dates.p50.date, null);
}
console.log('PASS Forecast native closure, unique observations, known exposure, unknown score/capacity, and failed-calibration regression');
