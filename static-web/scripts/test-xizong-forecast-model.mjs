import assert from 'node:assert/strict';
import {
  XIZONG_FORECAST_MODEL_SCHEMA,
  applyXizongForecastScenario,
  assessXizongDeadlineFeasibility,
  auditXizongCompressionProposals,
  buildXizongForecastLoop,
  buildXizongHighScoreRequirement,
  buildXizongScoreReadiness,
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
      fresh_transfer:{observed_probes:12,stable:8,uncertain:3,wrong:1,by_probe_kind:{FRESH_VARIANT:12}}
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
        {timer_minutes_in_repair_window:10},
        {timer_minutes_in_repair_window:12},
        {timer_minutes_in_repair_window:15},
        {timer_minutes_in_repair_window:18},
        {timer_minutes_in_repair_window:20}
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
        {year:2024,earned_score:270,max_score:300,discipline_breakdown:{disciplines:{}}},
        {year:2025,earned_score:278,max_score:300,discipline_breakdown:{disciplines:{}}},
        {year:2026,earned_score:282,max_score:300,discipline_breakdown:{disciplines:{}}}
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
  const readiness=buildXizongScoreReadiness(noPaper,{targetScore:275});
  assert.equal(readiness.formal_score.status,'NOT_READY');
  assert.equal(readiness.gate_readiness.result,'NOT_READY');
}

{
  const onePaper=baseProgress();
  onePaper.formal_score_evidence={sealed_papers:[{year:2026,earned_score:279,max_score:300}]};
  const readiness=buildXizongScoreReadiness(onePaper,{targetScore:275});
  assert.equal(readiness.formal_score.status,'REFERENCE_ONLY_CONTAMINATION_UNKNOWN');
  assert.equal(readiness.formal_score.empirical_band,null);
  assert.equal(readiness.formal_score.latest_target_gap,-4);
  assert.equal(readiness.formal_score.score_extrapolation_ready,false);
  assert.equal(readiness.gate_readiness.result,'EVIDENCE_PRESENT_LOW_CONFIDENCE');
}

{
  const readiness=buildXizongScoreReadiness(baseProgress(),{targetScore:275});
  assert.equal(readiness.formal_score.status,'EMPIRICAL_BAND_CONTAMINATION_UNKNOWN');
  assert.equal(readiness.formal_score.score_extrapolation_ready,false);
  assert.equal(readiness.gate_readiness.result,'EVIDENCE_PRESENT_LOW_CONFIDENCE');
  assert.ok(readiness.formal_score.empirical_band.p20<=readiness.formal_score.empirical_band.p50);
  assert.ok(readiness.formal_score.empirical_band.p50<=readiness.formal_score.empirical_band.p80);
  assert.equal(readiness.capabilities.precision.evidence_status,'SELECTIVE_EVIDENCE_PRESENT');
  assert.equal(readiness.capabilities.fresh_transfer.observed_probes,12);
}

{
  const readiness=buildXizongScoreReadiness(baseProgress(),{
    targetScore:275,
    materialGaps:[{id:'humanism-core',severity:'HARD',points_at_risk:16}]
  });
  assert.equal(readiness.gate_readiness.coverage_ready,false);
  assert.equal(readiness.gate_readiness.result,'NOT_READY');
}

{
  const contaminated=buildXizongScoreReadiness(baseProgress(),{
    targetScore:275,
    contaminationStatus:'KNOWN_PRIOR_EXPOSURE'
  });
  assert.equal(contaminated.formal_score.status,'EMPIRICAL_BAND_KNOWN_CONTAMINATION');
  assert.equal(contaminated.formal_score.score_extrapolation_ready,false);
  assert.equal(contaminated.formal_score.observed_score_is_not_fresh_prediction,true);
  assert.equal(contaminated.gate_readiness.result,'EVIDENCE_PRESENT_LOW_CONFIDENCE');

  const leastContaminated=buildXizongScoreReadiness(baseProgress(),{
    targetScore:275,
    contaminationStatus:'LEAST_CONTAMINATED'
  });
  assert.equal(leastContaminated.formal_score.status,'EMPIRICAL_BAND_LOW_CONTAMINATION');
  assert.equal(leastContaminated.formal_score.score_extrapolation_ready,true);
  assert.equal(leastContaminated.gate_readiness.result,'READY_FOR_DEFENSIBLE_ESTIMATE');
}

{
  const noPrecision=baseProgress();
  noPrecision.memory_evidence.precision={cards:0,weak:0,due_weak:0,due_delayed:0,stable_waiting:0};
  const readiness=buildXizongScoreReadiness(noPrecision);
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
  assert.equal(loop.maturity,'COVERAGE_INCOMPLETE');
  assert.ok(loop.uncertainty.includes('HARD_MATERIAL_COVERAGE_INCOMPLETE'));
  assert.ok(loop.uncertainty.includes('MATERIAL_OR_ROUTING_SCOPE_UNPRICED'));
  assert.equal(loop.score.gate_readiness.coverage_ready,false);
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
}

{
  const allBlocksNoPaper=baseProgress();
  allBlocksNoPaper.formal_score_evidence={sealed_papers:[]};
  allBlocksNoPaper.runtime_evidence.completed_blocks=allBlocksNoPaper.canonical_scope.blocks;
  allBlocksNoPaper.runtime_evidence.completed_block_ids=allBlocksNoPaper.canonical_scope.block_weights.map(row=>row.block_id);
  const readiness=buildXizongScoreReadiness(allBlocksNoPaper);
  assert.equal(readiness.capabilities.source_model.evidence_status,'FULL_RUNTIME_CLOSURE_OBSERVED');
  assert.equal(readiness.formal_score.status,'NOT_READY');
  assert.equal(readiness.gate_readiness.result,'NOT_READY');
}

console.log('PASS Xizong forecast adversarial suite: target→capability→workload→material delta→capacity→score evidence fail-closed');
