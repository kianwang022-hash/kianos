import assert from 'node:assert/strict';
import {
  ENGLISH_FORECAST_INPUT_SCHEMA,
  ENGLISH_FORECAST_MODEL_SCHEMA,
  ENGLISH_FORECAST_FAMILIES,
  buildEnglishWorkloadForecast,
  assessEnglishDeadlineFeasibility,
  buildEnglishForecastFalsifiability,
  backtestEnglishForecastHistory
} from '../src/lib/englishForecastModel.mjs';

const clone=(value)=>JSON.parse(JSON.stringify(value));

function emptyInput(){
  return {
    schema:ENGLISH_FORECAST_INPUT_SCHEMA,
    task_families:{},
    score_channels:{},
    whole_paper:{},
    learner_parameters:{}
  };
}

function baseInput(){
  const task_families=Object.fromEntries(ENGLISH_FORECAST_FAMILIES.map((id)=>[
    id,
    {
      label:id,
      scope_complete:true,
      operating_mode:'UNKNOWN',
      open_mechanisms:[],
      work_buckets:[]
    }
  ]));

  task_families.reading_a={
    label:'Reading A',
    scope_complete:true,
    operating_mode:'VERIFY',
    open_mechanisms:['two-strong-option'],
    work_buckets:[{
      id:'representative_verify',
      required:true,
      unit_label:'complete passage',
      remaining_units:2,
      minutes_per_unit_samples:[18,20,22,19,21]
    }]
  };
  task_families.cloze={
    label:'Cloze',
    scope_complete:true,
    operating_mode:'VERIFY',
    work_buckets:[{
      id:'complete_set_verify',
      required:true,
      unit_label:'complete set',
      remaining_units:1,
      minutes_per_unit_samples:[14,16,15]
    }]
  };
  task_families.reading_b={
    label:'Part B',
    scope_complete:true,
    operating_mode:'VERIFY',
    work_buckets:[{
      id:'form_coverage',
      required:true,
      unit_label:'complete set',
      remaining_units:2,
      minutes_per_unit_samples:[12,13,14]
    }]
  };
  task_families.translation={
    label:'Translation',
    scope_complete:true,
    operating_mode:'BUILD',
    work_buckets:[{
      id:'independent_sections',
      required:true,
      unit_label:'complete section',
      remaining_units:3,
      minutes_per_unit_samples:[26,29,31,28]
    }]
  };
  task_families.writing_small={
    label:'Small Writing',
    scope_complete:true,
    operating_mode:'BUILD',
    work_buckets:[{
      id:'first_draft_transfer',
      required:true,
      unit_label:'complete draft',
      remaining_units:2,
      minutes_per_unit_samples:[18,20,19]
    }]
  };
  task_families.writing_big={
    label:'Big Writing',
    scope_complete:true,
    operating_mode:'BUILD',
    work_buckets:[{
      id:'first_draft_transfer',
      required:true,
      unit_label:'complete draft',
      remaining_units:3,
      minutes_per_unit_samples:[31,35,33,36]
    }]
  };
  task_families.lexical={
    label:'Lexical',
    scope_complete:true,
    operating_mode:'REACTIVATE',
    work_buckets:[{
      id:'reactivation',
      required:true,
      unit_label:'reactivation block',
      remaining_units:4,
      minutes_per_unit_samples:[15,18,17,16]
    }]
  };
  task_families.whole_paper={
    label:'Whole Paper',
    scope_complete:true,
    operating_mode:'UNCALIBRATED',
    work_buckets:[{
      id:'integrated_execution',
      required:true,
      unit_label:'whole paper',
      remaining_units:1,
      minutes_per_unit_prior:{low:180,central:180,high:180}
    }]
  };

  return {
    schema:ENGLISH_FORECAST_INPUT_SCHEMA,
    task_families,
    score_channels:{
      objective:{range:{low:56,high:60},score_eligible:true,evidence_quality:'LOW_CONTAMINATION',modality:'PAPER'},
      translation:{range:{low:7,high:8},score_eligible:true,evidence_quality:'INDEPENDENT',modality:'TYPED'},
      writing_small:{range:{low:7,high:8},score_eligible:true,evidence_quality:'INDEPENDENT',modality:'TYPED'},
      writing_big:{range:{low:14,high:16},score_eligible:true,evidence_quality:'INDEPENDENT',modality:'TYPED'}
    },
    whole_paper:{
      score_range:{low:84,high:90},
      score_eligible:true,
      evidence_quality:'LOW_CONTAMINATION',
      modality:'PAPER'
    },
    learner_parameters:{
      lexical_delayed_retention:null
    }
  };
}

function fitRank(status){
  return ({
    EVEN_P20_DOES_NOT_FIT:0,
    P20_ONLY_FITS:1,
    P50_FITS_P80_DOES_NOT:2,
    P80_FITS:3
  })[status] ?? -1;
}

// 1) Empty/undeclared scope must fail closed.
{
  const f=buildEnglishWorkloadForecast(emptyInput());
  assert.equal(f.schema,ENGLISH_FORECAST_MODEL_SCHEMA);
  assert.equal(f.workload.full_scope_priced,false);
  assert.equal(f.workload.full_band_minutes,null);
  assert.deepEqual(new Set(f.workload.missing_family_ids),new Set(ENGLISH_FORECAST_FAMILIES));
  assert.equal(f.forecast_state,'UNKNOWN');
  assert.equal(f.subject_stage_decision,'OUT_OF_SCOPE');
  assert.equal(f.daily_task_prescription,'OUT_OF_SCOPE');
  assert.equal(f.cross_subject_allocation,'OUT_OF_SCOPE');
}

// 2) One/two timing samples cannot silently become an empirical P20/P50/P80 band.
{
  const input=baseInput();
  input.task_families.reading_a.work_buckets[0].minutes_per_unit_samples=[20,22];
  delete input.task_families.reading_a.work_buckets[0].minutes_per_unit_prior;
  const f=buildEnglishWorkloadForecast(input);
  const row=f.workload.families.find(x=>x.id==='reading_a').buckets[0];
  assert.equal(row.sample_state,'REFERENCE_ONLY');
  assert.equal(row.band_minutes,null);
  assert.equal(f.workload.full_scope_priced,false);
  assert.ok(f.workload.unpriced_bucket_ids.includes('reading_a:representative_verify'));
}

// 3) Explicit prior may price a bucket, but confidence must remain prior-heavy.
{
  const input=baseInput();
  const row=input.task_families.reading_a.work_buckets[0];
  row.minutes_per_unit_samples=[20];
  row.minutes_per_unit_prior={low:16,central:20,high:26};
  const f=buildEnglishWorkloadForecast(input);
  const b=f.workload.families.find(x=>x.id==='reading_a').buckets[0];
  assert.equal(b.pricing_source,'PRIOR_ONLY');
  assert.ok(b.risks.includes('PRIOR_ONLY_PRICING'));
  assert.equal(f.workload.full_scope_priced,true);
  assert.equal(f.workload.workload_confidence,'PRIOR_HEAVY');
}

// 3b) Three/four timing samples may produce a band but remain PROVISIONAL; 5+ may become EMPIRICAL.
{
  const input=baseInput();
  for(const id of ENGLISH_FORECAST_FAMILIES){
    const family=input.task_families[id];
    for(const bucket of family.work_buckets||[]){
      delete bucket.minutes_per_unit_prior;
      bucket.minutes_per_unit_samples=[10,11,12,13,14];
    }
  }
  input.task_families.cloze.work_buckets[0].minutes_per_unit_samples=[14,15,16];
  let f=buildEnglishWorkloadForecast(input);
  assert.equal(f.workload.workload_confidence,'PROVISIONAL');
  assert.equal(f.workload.families.find(row=>row.id==='cloze').confidence,'PROVISIONAL');

  input.task_families.cloze.work_buckets[0].minutes_per_unit_samples=[14,15,16,15,14];
  f=buildEnglishWorkloadForecast(input);
  assert.equal(f.workload.workload_confidence,'EMPIRICAL');
}

// 4) Empirical workload bands and local/integrated score paths stay distinct.
{
  const input=baseInput();
  const f=buildEnglishWorkloadForecast(input);
  assert.equal(f.workload.full_scope_priced,true);
  assert.ok(f.workload.full_band_minutes.p20<=f.workload.full_band_minutes.p50);
  assert.ok(f.workload.full_band_minutes.p50<=f.workload.full_band_minutes.p80);
  assert.deepEqual(f.score.local_channel_band,{low:84,high:92});
  assert.equal(f.score.local_status,'TARGET_CROSSES_LOCAL_RANGE');
  assert.equal(f.score.integrated_whole_paper.status,'TARGET_CROSSES_INTEGRATED_RANGE');
  assert.equal(f.score.score_path_confidence,'INTEGRATED_HIGH');
  assert.match(f.score.dependency_warning,/not assumed independent/);
}

// 5) Synthetic/assisted/non-score-eligible evidence cannot complete formal score path.
{
  const input=baseInput();
  input.score_channels.writing_big.score_eligible=false;
  input.score_channels.writing_big.evidence_quality='ASSISTED';
  const f=buildEnglishWorkloadForecast(input);
  assert.equal(f.score.local_channel_band,null);
  assert.equal(f.score.local_status,'UNKNOWN');
  assert.ok(f.uncertainty.includes('FORMAL_SCORE_CHANNELS_INCOMPLETE'));
}

// 6) Missing integrated paper does not erase useful local evidence, but confidence stays local-only.
{
  const input=baseInput();
  input.whole_paper={score_range:null,score_eligible:false,evidence_quality:'UNKNOWN',modality:'UNKNOWN'};
  const f=buildEnglishWorkloadForecast(input);
  assert.deepEqual(f.score.local_channel_band,{low:84,high:92});
  assert.equal(f.score.score_path_confidence,'LOCAL_CHANNELS_ONLY');
  assert.ok(f.uncertainty.includes('WHOLE_PAPER_SCORE_CALIBRATION_MISSING'));
}

// 7) Increasing remaining work may never reduce the workload band (metamorphic invariant).
{
  const a=baseInput();
  const b=clone(a);
  b.task_families.reading_a.work_buckets[0].remaining_units+=3;
  const fa=buildEnglishWorkloadForecast(a).workload.full_band_minutes;
  const fb=buildEnglishWorkloadForecast(b).workload.full_band_minutes;
  for(const key of ['p20','p50','p80'])assert.ok(fb[key]>=fa[key],key+' decreased after workload increase');
}

// 8) Higher daily capacity may never worsen feasibility (metamorphic invariant).
{
  const f=buildEnglishWorkloadForecast(baseInput());
  const low=assessEnglishDeadlineFeasibility(f,{startDay:'2026-09-21',deadlineDay:'2026-09-30',dailyMinutes:60});
  const high=assessEnglishDeadlineFeasibility(f,{startDay:'2026-09-21',deadlineDay:'2026-09-30',dailyMinutes:120});
  assert.ok(fitRank(high.status)>=fitRank(low.status));
  assert.equal(low.full_scope,true);
  assert.equal(high.full_scope,true);
}

// 9) Partial scope may expose only a known-priced lower bound, never a whole-scope fit claim.
{
  const input=baseInput();
  input.task_families.translation.scope_complete=false;
  const f=buildEnglishWorkloadForecast(input);
  assert.equal(f.workload.full_scope_priced,false);
  const feasibility=assessEnglishDeadlineFeasibility(f,{startDay:'2026-09-21',deadlineDay:'2026-10-20',dailyMinutes:120});
  assert.equal(feasibility.status,'UNPRICED');
  assert.equal(feasibility.fit,null);
  assert.ok(feasibility.known_lower_bound_fit);
}

// 10) Falsifiability exposes flip surfaces and information candidates without prescribing learner action.
{
  const input=baseInput();
  input.task_families.translation.scope_complete=false;
  input.task_families.translation.work_buckets[0].minutes_per_unit_samples=[];
  const result=buildEnglishForecastFalsifiability(input,{
    startDay:'2026-09-21',
    deadlineDay:'2026-10-20',
    dailyMinutesGrid:[60,90,120],
    workloadMultiplierGrid:[0.8,1,1.25]
  });
  assert.equal(result.subject_stage_decision,'OUT_OF_SCOPE');
  assert.ok(Array.isArray(result.p50_flip_surface));
  assert.equal(result.p50_flip_surface.length,3);
  assert.ok(result.next_high_value_evidence);
  assert.match(result.next_high_value_evidence.id,/^PRICE:/);
  assert.equal(result.next_high_value_evidence.information_priority,'HIGHEST');
  assert.ok(result.evidence_candidates.every(row=>['HIGHEST','HIGH','MEDIUM','LOW'].includes(row.information_priority)));
  assert.ok(result.evidence_candidates.every(row=>!Object.prototype.hasOwnProperty.call(row,'_sort_rank')));
  assert.ok(result.evidence_candidates.some(row=>row.id==='LEXICAL_DELAYED_RETENTION'));
  assert.ok(result.evidence_candidates.some(row=>row.id==='WHOLE_PAPER_CALIBRATION')===false,'whole-paper candidate should not appear when clean integrated score exists');
}

// 11) When formal score evidence is missing, score evidence becomes a high-value information candidate.
{
  const input=baseInput();
  input.score_channels.translation.score_eligible=false;
  input.score_channels.translation.range=null;
  const result=buildEnglishForecastFalsifiability(input);
  assert.ok(result.evidence_candidates.some(row=>row.id==='SCORE:translation'));
}

// 12) Reproducible grid stress: larger workload multiplier cannot improve p50 fit at fixed capacity.
{
  const result=buildEnglishForecastFalsifiability(baseInput(),{
    startDay:'2026-09-21',
    deadlineDay:'2026-09-30',
    dailyMinutesGrid:[60,90,120],
    workloadMultiplierGrid:[0.6,0.8,1,1.2,1.5]
  });
  for(const capacity of [60,90,120]){
    const rows=result.workload_grid.filter(row=>row.daily_minutes===capacity&&row.p50_fit!==null)
      .sort((a,b)=>a.workload_multiplier-b.workload_multiplier);
    let seenFail=false;
    for(const row of rows){
      if(row.p50_fit===false)seenFail=true;
      if(seenFail)assert.notEqual(row.p50_fit,true,'p50 fit recovered after workload multiplier increased');
    }
  }
}

// 13) Scope-complete zero-work families are allowed, but missing families are not.
{
  const input=baseInput();
  for(const id of ENGLISH_FORECAST_FAMILIES){
    input.task_families[id]={label:id,scope_complete:true,operating_mode:'MAINTAIN',work_buckets:[]};
  }
  const f=buildEnglishWorkloadForecast(input);
  assert.equal(f.workload.full_scope_priced,true);
  assert.deepEqual(f.workload.full_band_minutes,{p20:0,p50:0,p80:0});
  assert.equal(f.workload.missing_family_ids.length,0);
}

// 14) Backtest logic must expose calibration error without auto-replanning.
{
  const backtest=backtestEnglishForecastHistory([
    {id:'d1',predicted_workload_band:{p20:80,p50:100,p80:120},actual_workload_minutes:100,predicted_score_range:{low:82,high:88},actual_score:85},
    {id:'d2',predicted_workload_band:{p20:90,p50:110,p80:130},actual_workload_minutes:110,predicted_score_range:{low:84,high:90},actual_score:91},
    {id:'d3',predicted_workload_band:{p20:95,p50:115,p80:135},actual_workload_minutes:130,predicted_score_range:{low:80,high:87},actual_score:79},
    {id:'d4',predicted_workload_band:{p20:85,p50:105,p80:125},actual_workload_minutes:90,predicted_score_range:{low:83,high:89},actual_score:87}
  ]);
  assert.equal(backtest.workload.status,'BACKTESTED');
  assert.equal(backtest.workload.sample_count,4);
  assert.equal(backtest.score.status,'BACKTESTED');
  assert.equal(backtest.score.sample_count,4);
  assert.equal(backtest.score.misses.length,2);
  assert.equal(backtest.recalibration_required,'CHAT_INTERPRETATION_REQUIRED');
  assert.equal(backtest.subject_stage_decision,'OUT_OF_SCOPE');
}

// 15) One observation cannot pretend Forecast calibration is established.
{
  const backtest=backtestEnglishForecastHistory([
    {id:'only',predicted_workload_band:{p20:80,p50:100,p80:120},actual_workload_minutes:110,predicted_score_range:{low:82,high:88},actual_score:85}
  ]);
  assert.equal(backtest.workload.status,'INSUFFICIENT_BACKTEST');
  assert.equal(backtest.score.status,'INSUFFICIENT_BACKTEST');
}

// 16) A 30%-capacity day/week cannot look better than full capacity.
{
  const f=buildEnglishWorkloadForecast(baseInput());
  const full=assessEnglishDeadlineFeasibility(f,{startDay:'2026-09-21',deadlineDay:'2026-10-05',dailyMinutes:120});
  const thirty=assessEnglishDeadlineFeasibility(f,{startDay:'2026-09-21',deadlineDay:'2026-10-05',dailyMinutes:36});
  assert.ok(fitRank(thirty.status)<=fitRank(full.status));
}

// 17) A bad three-day patch must reduce or preserve, never improve, capacity fit.
{
  const f=buildEnglishWorkloadForecast(baseInput());
  const baseline=assessEnglishDeadlineFeasibility(f,{
    startDay:'2026-09-21',
    deadlineDay:'2026-10-05',
    dailyMinutes:120
  });
  const badPatch=assessEnglishDeadlineFeasibility(f,{
    startDay:'2026-09-21',
    deadlineDay:'2026-10-05',
    dailyMinutes:120,
    capacityMinutesByDay:{
      '2026-09-23':36,
      '2026-09-24':36,
      '2026-09-25':36
    }
  });
  assert.ok(fitRank(badPatch.status)<=fitRank(baseline.status));
  assert.ok(badPatch.capacity.minutes<baseline.capacity.minutes);
}

// 18) Repair explosion must increase workload rather than disappear into an average.
{
  const normal=baseInput();
  const stressed=clone(normal);
  stressed.task_families.translation.work_buckets.push({
    id:'repair_cluster',
    required:true,
    unit_label:'repair cluster',
    remaining_units:8,
    minutes_per_unit_samples:[14,16,15,17,15]
  });
  const a=buildEnglishWorkloadForecast(normal).workload.full_band_minutes;
  const b=buildEnglishWorkloadForecast(stressed).workload.full_band_minutes;
  for(const key of ['p20','p50','p80'])assert.ok(b[key]>a[key],key+' did not increase under repair explosion');
}

// 19) Relapse/reopen must add work back after a previously zero-work stable family.
{
  const stable=baseInput();
  stable.task_families.lexical={label:'Lexical',scope_complete:true,operating_mode:'MAINTAIN',work_buckets:[]};
  const reopened=clone(stable);
  reopened.task_families.lexical={
    label:'Lexical',
    scope_complete:true,
    operating_mode:'VERIFY',
    open_mechanisms:['delayed-retention-relapse'],
    work_buckets:[{
      id:'relapse_verify',
      required:true,
      unit_label:'verification block',
      remaining_units:2,
      minutes_per_unit_samples:[15,16,17,15,16]
    }]
  };
  const a=buildEnglishWorkloadForecast(stable).workload.full_band_minutes;
  const b=buildEnglishWorkloadForecast(reopened).workload.full_band_minutes;
  assert.ok(b.p50>a.p50);
}

// 20) A future/new material requirement with unknown workload must make whole scope unpriced, not get stacked as zero.
{
  const input=baseInput();
  input.task_families.writing_big.work_buckets.push({
    id:'future_source_delta',
    required:true,
    unit_label:'future source delta',
    remaining_units:null,
    minutes_per_unit_samples:[]
  });
  const f=buildEnglishWorkloadForecast(input);
  assert.equal(f.workload.full_scope_priced,false);
  assert.equal(f.workload.full_band_minutes,null);
  assert.ok(f.workload.unpriced_bucket_ids.includes('writing_big:future_source_delta'));
  assert.ok(f.uncertainty.includes('WORKLOAD_SCOPE_PARTIALLY_UNPRICED'));
}

console.log(JSON.stringify({
  schema:'kianos.english.forecast-system-logic-validation.v1',
  status:'PASS',
  checks:{
    unknown_scope_fails_closed:true,
    thin_samples_do_not_create_empirical_bands:true,
    prior_only_pricing_is_labeled:true,
    thin_empirical_bands_remain_provisional:true,
    workload_and_score_confidence_are_separate:true,
    non_score_eligible_evidence_cannot_close_score_path:true,
    local_score_does_not_impersonate_whole_paper:true,
    workload_monotonicity:true,
    capacity_monotonicity:true,
    partial_scope_stays_unpriced:true,
    sensitivity_flip_surface:true,
    highest_value_evidence_is_information_only:true,
    voi_priority_is_qualitative_not_fake_numeric_precision:true,
    reproducible_grid_stress:true,
    forecast_backtest_is_falsifiable:true,
    thin_backtest_does_not_claim_calibration:true,
    thirty_percent_capacity_degrades_safely:true,
    bad_three_day_patch_degrades_safely:true,
    repair_explosion_is_priced:true,
    relapse_reopens_workload:true,
    future_source_unknown_remains_unpriced:true,
    no_daily_task_or_cross_subject_authority:true
  }
},null,2));
