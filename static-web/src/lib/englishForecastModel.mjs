export const ENGLISH_FORECAST_INPUT_SCHEMA='kianos.english.forecast-input.v1';
export const ENGLISH_FORECAST_MODEL_SCHEMA='kianos.english.workload-forecast.v1';

export const ENGLISH_SCORE_CHANNELS=Object.freeze({
  objective:Object.freeze({label:'Objective',max_points:60}),
  translation:Object.freeze({label:'Translation',max_points:10}),
  writing_small:Object.freeze({label:'Small Writing',max_points:10}),
  writing_big:Object.freeze({label:'Big Writing',max_points:20})
});

export const ENGLISH_FORECAST_FAMILIES=Object.freeze([
  'reading_a',
  'cloze',
  'reading_b',
  'translation',
  'writing_small',
  'writing_big',
  'lexical',
  'whole_paper'
]);

const finite=(value)=>{
  if(value===null||value===undefined||value==='')return null;
  const n=Number(value);
  return Number.isFinite(n)?n:null;
};
const positive=(value)=>{
  const n=finite(value);
  return n!==null&&n>0?n:null;
};
const nonNegative=(value)=>{
  const n=finite(value);
  return n!==null&&n>=0?n:null;
};
const round=(value,digits=1)=>{
  const n=finite(value);
  if(n===null)return null;
  const factor=10**digits;
  return Math.round(n*factor)/factor;
};
const clone=(value)=>value==null?value:JSON.parse(JSON.stringify(value));

function quantile(values,p){
  const rows=(Array.isArray(values)?values:[]).map(Number).filter(Number.isFinite).sort((a,b)=>a-b);
  if(!rows.length)return null;
  if(rows.length===1)return rows[0];
  const pos=(rows.length-1)*Math.max(0,Math.min(1,Number(p)));
  const low=Math.floor(pos),high=Math.ceil(pos);
  if(low===high)return rows[low];
  const w=pos-low;
  return rows[low]*(1-w)+rows[high]*w;
}

function median(values){return quantile(values,0.5);}

function sampleState(count){
  if(count<=0)return 'NO_SAMPLES';
  if(count<3)return 'REFERENCE_ONLY';
  if(count<5)return 'PROVISIONAL';
  return 'EMPIRICAL';
}

function validPriorRange(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  const low=positive(value.low),high=positive(value.high);
  if(low===null||high===null||low>high)return null;
  const central=positive(value.central);
  return {
    low,
    central:central!==null&&central>=low&&central<=high?central:(low+high)/2,
    high
  };
}

function bucketForecast(bucket,familyId){
  const id=String(bucket?.id||'').trim();
  if(!id)throw new Error('ENGLISH_FORECAST_BUCKET_ID_REQUIRED:'+familyId);
  const required=bucket?.required!==false;
  const units=nonNegative(bucket?.remaining_units);
  const samples=(Array.isArray(bucket?.minutes_per_unit_samples)?bucket.minutes_per_unit_samples:[])
    .map(positive).filter((v)=>v!==null);
  const prior=validPriorRange(bucket?.minutes_per_unit_prior);

  const result={
    id,
    family_id:familyId,
    required,
    unit_label:String(bucket?.unit_label||'unit'),
    remaining_units:units,
    sample_count:samples.length,
    sample_state:sampleState(samples.length),
    pricing_source:'UNPRICED',
    reference_minutes_per_unit:samples.length?round(median(samples),3):(prior?round(prior.central,3):null),
    band_minutes:null,
    risks:[]
  };

  if(units===0){
    result.pricing_source='ZERO_REMAINING';
    result.band_minutes={p20:0,p50:0,p80:0};
    return result;
  }

  if(units===null){
    result.risks.push('REMAINING_UNITS_UNKNOWN');
    return result;
  }

  if(samples.length>=3){
    result.pricing_source='EMPIRICAL';
    result.band_minutes={
      p20:round(quantile(samples,0.2)*units),
      p50:round(quantile(samples,0.5)*units),
      p80:round(quantile(samples,0.8)*units)
    };
    return result;
  }

  if(prior){
    result.pricing_source='PRIOR_ONLY';
    result.band_minutes={
      p20:round(prior.low*units),
      p50:round(prior.central*units),
      p80:round(prior.high*units)
    };
    result.risks.push('PRIOR_ONLY_PRICING');
    if(samples.length>0)result.risks.push('EMPIRICAL_SAMPLE_TOO_THIN');
    return result;
  }

  result.risks.push(samples.length?'EMPIRICAL_SAMPLE_TOO_THIN':'RATE_UNKNOWN');
  return result;
}

function sumBands(rows){
  if(!rows.length)return {p20:0,p50:0,p80:0};
  return {
    p20:round(rows.reduce((sum,row)=>sum+Number(row.band_minutes?.p20||0),0)),
    p50:round(rows.reduce((sum,row)=>sum+Number(row.band_minutes?.p50||0),0)),
    p80:round(rows.reduce((sum,row)=>sum+Number(row.band_minutes?.p80||0),0))
  };
}

function workloadForecast(input){
  const source=input?.task_families&&typeof input.task_families==='object'&&!Array.isArray(input.task_families)
    ? input.task_families
    : {};
  const families=[];
  const missingFamilyIds=[];

  for(const familyId of ENGLISH_FORECAST_FAMILIES){
    const family=source[familyId];
    if(!family||typeof family!=='object'||Array.isArray(family)){
      missingFamilyIds.push(familyId);
      families.push({
        id:familyId,
        label:familyId,
        operating_mode:'UNKNOWN',
        open_mechanisms:[],
        buckets:[],
        required_bucket_count:0,
        unpriced_bucket_ids:['SCOPE_UNDECLARED'],
        known_priced_band_minutes:{p20:0,p50:0,p80:0},
        full_band_minutes:null,
        confidence:'UNKNOWN',
        scope_complete:false
      });
      continue;
    }

    const buckets=(Array.isArray(family?.work_buckets)?family.work_buckets:[])
      .map((bucket)=>bucketForecast(bucket,familyId));
    const requiredBuckets=buckets.filter((row)=>row.required);
    const pricedRequired=requiredBuckets.filter((row)=>row.band_minutes);
    const unpricedRequired=requiredBuckets.filter((row)=>!row.band_minutes);
    const priorOnly=requiredBuckets.filter((row)=>row.pricing_source==='PRIOR_ONLY');
    const empirical=requiredBuckets.filter((row)=>row.pricing_source==='EMPIRICAL');
    const provisionalEmpirical=empirical.filter((row)=>row.sample_state==='PROVISIONAL');
    const scopeComplete=family.scope_complete===true;
    const knownBand=sumBands(pricedRequired);
    const scopeUnknown=!scopeComplete;
    const fullBand=(unpricedRequired.length||scopeUnknown)?null:knownBand;
    const unpricedIds=[
      ...unpricedRequired.map((row)=>row.id),
      ...(scopeUnknown?['SCOPE_UNDECLARED']:[])
    ];
    families.push({
      id:familyId,
      label:String(family?.label||familyId),
      operating_mode:String(family?.operating_mode||'UNKNOWN'),
      open_mechanisms:Array.isArray(family?.open_mechanisms)?family.open_mechanisms.map(String):[],
      buckets,
      required_bucket_count:requiredBuckets.length,
      unpriced_bucket_ids:unpricedIds,
      known_priced_band_minutes:knownBand,
      full_band_minutes:fullBand,
      confidence:(unpricedRequired.length||scopeUnknown)?'PARTIAL'
        : priorOnly.length?'PRIOR_HEAVY'
        : provisionalEmpirical.length?'PROVISIONAL'
        : empirical.length===requiredBuckets.length&&requiredBuckets.length?'EMPIRICAL'
        :'MIXED',
      scope_complete:scopeComplete
    });
  }

  const requiredRows=families.flatMap((family)=>family.buckets.filter((row)=>row.required));
  const pricedRows=requiredRows.filter((row)=>row.band_minutes);
  const unpricedRows=requiredRows.filter((row)=>!row.band_minutes);
  const incompleteFamilies=families.filter((family)=>!family.scope_complete);
  const knownBand=sumBands(pricedRows);
  const fullBand=(unpricedRows.length||incompleteFamilies.length)?null:knownBand;
  const priorCount=requiredRows.filter((row)=>row.pricing_source==='PRIOR_ONLY').length;
  const empiricalCount=requiredRows.filter((row)=>row.pricing_source==='EMPIRICAL').length;
  const provisionalEmpiricalCount=requiredRows.filter((row)=>row.pricing_source==='EMPIRICAL'&&row.sample_state==='PROVISIONAL').length;

  return {
    families,
    known_priced_band_minutes:knownBand,
    full_band_minutes:fullBand,
    full_scope_priced:unpricedRows.length===0&&incompleteFamilies.length===0,
    missing_family_ids:missingFamilyIds,
    incomplete_family_ids:incompleteFamilies.map((row)=>row.id),
    unpriced_bucket_ids:[
      ...unpricedRows.map((row)=>familyBucketId(row)),
      ...incompleteFamilies.map((row)=>row.id+':SCOPE_UNDECLARED')
    ],
    workload_confidence:(unpricedRows.length||incompleteFamilies.length)?'PARTIAL'
      : priorCount?'PRIOR_HEAVY'
      : provisionalEmpiricalCount?'PROVISIONAL'
      : empiricalCount===requiredRows.length&&requiredRows.length?'EMPIRICAL'
      :'MIXED',
    required_bucket_count:requiredRows.length,
    empirical_bucket_count:empiricalCount,
    provisional_empirical_bucket_count:provisionalEmpiricalCount,
    prior_only_bucket_count:priorCount
  };
}

function familyBucketId(row){return row.family_id+':'+row.id;}

function normalizeScoreRange(value,maxPoints){
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  const low=nonNegative(value.low),high=nonNegative(value.high);
  if(low===null||high===null||low>high||high>maxPoints)return null;
  return {low:round(low,1),high:round(high,1)};
}

function scoreChannelRow(id,input){
  const meta=ENGLISH_SCORE_CHANNELS[id];
  const row=input?.score_channels?.[id]||{};
  const range=normalizeScoreRange(row.range,meta.max_points);
  const scoreEligible=row.score_eligible===true;
  const evidenceQuality=String(row.evidence_quality||'UNKNOWN').toUpperCase();
  const modality=String(row.modality||'UNKNOWN').toUpperCase();
  const risks=[];
  if(!range)risks.push('SCORE_RANGE_UNKNOWN');
  if(!scoreEligible)risks.push('NOT_FORMAL_SCORE_ELIGIBLE');
  if(['EXPOSED','ASSISTED','CONTAMINATED','UNKNOWN'].includes(evidenceQuality))risks.push('EVIDENCE_QUALITY_LIMITS_SCORE_CONFIDENCE');
  if(['TYPED','UNKNOWN'].includes(modality)&&id!=='objective')risks.push('EXAM_MODE_MODALITY_UNCALIBRATED');
  return {
    id,
    label:meta.label,
    max_points:meta.max_points,
    range,
    score_eligible:scoreEligible,
    evidence_quality:evidenceQuality,
    modality,
    risks
  };
}

function scoreForecast(input,targetScore){
  const channels=Object.keys(ENGLISH_SCORE_CHANNELS).map((id)=>scoreChannelRow(id,input));
  const eligible=channels.filter((row)=>row.score_eligible&&row.range);
  const allEligible=eligible.length===channels.length;
  const localBand=allEligible?{
    low:round(eligible.reduce((sum,row)=>sum+row.range.low,0),1),
    high:round(eligible.reduce((sum,row)=>sum+row.range.high,0),1)
  }:null;

  const integrated=input?.whole_paper||{};
  const integratedRange=normalizeScoreRange(integrated.score_range,100);
  const integratedEligible=integrated.score_eligible===true&&integratedRange!==null;
  const integratedEvidenceQuality=String(integrated.evidence_quality||'UNKNOWN').toUpperCase();
  const integratedModality=String(integrated.modality||'UNKNOWN').toUpperCase();

  let localStatus='UNKNOWN';
  if(localBand){
    if(localBand.high<targetScore)localStatus='TARGET_ABOVE_LOCAL_RANGE';
    else if(localBand.low>=targetScore)localStatus='TARGET_WITHIN_PROTECTED_LOCAL_RANGE';
    else localStatus='TARGET_CROSSES_LOCAL_RANGE';
  }

  let integratedStatus='UNKNOWN';
  if(integratedEligible){
    if(integratedRange.high<targetScore)integratedStatus='TARGET_ABOVE_INTEGRATED_RANGE';
    else if(integratedRange.low>=targetScore)integratedStatus='TARGET_WITHIN_PROTECTED_INTEGRATED_RANGE';
    else integratedStatus='TARGET_CROSSES_INTEGRATED_RANGE';
  }

  const confidence=integratedEligible
    ? (['CLEAN','LOW_CONTAMINATION'].includes(integratedEvidenceQuality)
      && ['PAPER','MIXED'].includes(integratedModality)?'INTEGRATED_HIGH':'INTEGRATED_LIMITED')
    : localBand?'LOCAL_CHANNELS_ONLY':'PARTIAL';

  return {
    target_score:targetScore,
    channels,
    local_channel_band:localBand,
    local_status:localStatus,
    integrated_whole_paper:{
      range:integratedRange,
      score_eligible:integratedEligible,
      evidence_quality:integratedEvidenceQuality,
      modality:integratedModality,
      status:integratedStatus
    },
    score_path_confidence:confidence,
    dependency_warning:
      'Local channel ranges are not assumed independent. Whole-paper timing/fatigue/modality can move the realized total; local ranges must not be mechanically narrowed into an exam-total forecast.',
    flip_points:localBand?{
      points_needed_above_local_low_to_target:round(Math.max(0,targetScore-localBand.low),1),
      local_upper_slack_above_target:round(localBand.high-targetScore,1)
    }:null
  };
}

export function buildEnglishHighScoreRequirement({targetScore=85}={}){
  const target=finite(targetScore);
  if(target===null||target<=0||target>100)throw new Error('ENGLISH_TARGET_SCORE_INVALID');
  return {
    schema:'kianos.english.high-score-requirement.v1',
    target_score:target,
    max_score:100,
    total_loss_budget:round(100-target,1),
    channels:Object.entries(ENGLISH_SCORE_CHANNELS).map(([id,row])=>({
      id,label:row.label,max_points:row.max_points
    })),
    objective_capability_target:60,
    boundary:
      'Objective 60/60 is a capability-building target: no known recurring predictable Objective loss mechanism is accepted as permanent. It is not a claim that every mock must literally score 60.'
  };
}

export function buildEnglishWorkloadForecast(input,{targetScore=85}={}){
  if(!input||input.schema!==ENGLISH_FORECAST_INPUT_SCHEMA)throw new Error('ENGLISH_FORECAST_INPUT_REQUIRED');
  const target=buildEnglishHighScoreRequirement({targetScore});
  const workload=workloadForecast(input);
  const score=scoreForecast(input,target.target_score);
  const uncertainty=[];
  if(!workload.full_scope_priced)uncertainty.push('WORKLOAD_SCOPE_PARTIALLY_UNPRICED');
  if(workload.prior_only_bucket_count)uncertainty.push('WORKLOAD_HAS_PRIOR_ONLY_PRICING');
  if(score.local_channel_band==null)uncertainty.push('FORMAL_SCORE_CHANNELS_INCOMPLETE');
  if(!score.integrated_whole_paper.score_eligible)uncertainty.push('WHOLE_PAPER_SCORE_CALIBRATION_MISSING');
  if(score.integrated_whole_paper.modality==='UNKNOWN'||score.integrated_whole_paper.modality==='TYPED')uncertainty.push('PAPER_MODALITY_UNCALIBRATED');

  const state=!workload.full_scope_priced&&score.local_channel_band==null?'UNKNOWN'
    : workload.full_scope_priced&&score.local_channel_band!==null?'SYSTEM_LOGIC_READY_WITH_INPUTS'
    :'PARTIAL';

  return {
    schema:ENGLISH_FORECAST_MODEL_SCHEMA,
    target,
    workload,
    score,
    uncertainty:[...new Set(uncertainty)],
    forecast_state:state,
    subject_stage_decision:'OUT_OF_SCOPE',
    daily_task_prescription:'OUT_OF_SCOPE',
    cross_subject_allocation:'OUT_OF_SCOPE',
    boundary:
      'This model estimates English workload/score uncertainty only. It does not choose today’s task count, subject order, cross-subject time allocation, Secure state, or learner action.'
  };
}

function addDays(day,offset){
  const m=String(day||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m)return null;
  const d=new Date(Date.UTC(Number(m[1]),Number(m[2])-1,Number(m[3])));
  d.setUTCDate(d.getUTCDate()+Number(offset||0));
  return d.toISOString().slice(0,10);
}

function daySpanInclusive(startDay,endDay){
  const start=Date.parse(String(startDay||'')+'T00:00:00Z');
  const end=Date.parse(String(endDay||'')+'T00:00:00Z');
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<start)return null;
  return Math.floor((end-start)/86400000)+1;
}

function capacityThroughDeadline({startDay,deadlineDay,dailyMinutes=null,capacityMinutesByDay=null}={}){
  const days=daySpanInclusive(startDay,deadlineDay);
  if(days===null)return null;
  const fallback=nonNegative(dailyMinutes);
  let total=0;
  for(let i=0;i<days;i++){
    const day=addDays(startDay,i);
    const specific=capacityMinutesByDay&&typeof capacityMinutesByDay==='object'&&!Array.isArray(capacityMinutesByDay)
      ? nonNegative(capacityMinutesByDay[day])
      : null;
    const capacity=specific===null?fallback:specific;
    if(capacity===null)return null;
    total+=capacity;
  }
  return {days,minutes:round(total,1)};
}

export function assessEnglishDeadlineFeasibility(forecast,{
  startDay,
  deadlineDay,
  dailyMinutes=null,
  capacityMinutesByDay=null
}={}){
  if(!forecast||forecast.schema!==ENGLISH_FORECAST_MODEL_SCHEMA)throw new Error('ENGLISH_FORECAST_MODEL_REQUIRED');
  const capacity=capacityThroughDeadline({startDay,deadlineDay,dailyMinutes,capacityMinutesByDay});
  const full=forecast.workload.full_band_minutes;
  const known=forecast.workload.known_priced_band_minutes;
  const band=full||known;
  if(!capacity||!band){
    return {
      schema:'kianos.english.deadline-feasibility.v1',
      status:'UNPRICED',
      full_scope:false,
      capacity,
      band_minutes:band,
      fit:null,
      known_lower_bound_fit:null
    };
  }
  const fit=Object.fromEntries(['p20','p50','p80'].map((key)=>[key,Number(band[key]||0)<=capacity.minutes]));
  if(!full){
    return {
      schema:'kianos.english.deadline-feasibility.v1',
      status:'UNPRICED',
      full_scope:false,
      capacity,
      band_minutes:band,
      fit:null,
      known_lower_bound_fit:fit,
      required_average_minutes_per_day:null,
      boundary:
        'Known priced work can be compared with capacity, but unresolved required workload forbids whole-scope completion claims.'
    };
  }
  const requiredAverage=Object.fromEntries(['p20','p50','p80'].map((key)=>[
    key,capacity.days?round(Number(full[key]||0)/capacity.days,1):null
  ]));
  let status='P80_FITS';
  if(!fit.p20)status='EVEN_P20_DOES_NOT_FIT';
  else if(!fit.p50)status='P20_ONLY_FITS';
  else if(!fit.p80)status='P50_FITS_P80_DOES_NOT';
  return {
    schema:'kianos.english.deadline-feasibility.v1',
    status,
    full_scope:true,
    capacity,
    band_minutes:full,
    fit,
    known_lower_bound_fit:null,
    required_average_minutes_per_day:requiredAverage,
    boundary:
      'Feasibility is a capacity diagnostic, not a daily schedule. The model never deletes required work to make a deadline look feasible.'
  };
}

function scaleBand(band,multiplier){
  if(!band)return null;
  return {
    p20:round(Number(band.p20||0)*multiplier,1),
    p50:round(Number(band.p50||0)*multiplier,1),
    p80:round(Number(band.p80||0)*multiplier,1)
  };
}

function evidenceCandidates(input,forecast){
  const rows=[];
  const priorityLabel=(rank)=>rank>=90?'HIGHEST':rank>=75?'HIGH':rank>=50?'MEDIUM':'LOW';
  const add=(id,rank,reason,evidence,cost='BOUNDED')=>{
    if(rows.some((row)=>row.id===id))return;
    rows.push({
      id,
      _sort_rank:rank,
      information_priority:priorityLabel(rank),
      reason,
      evidence_to_collect:evidence,
      learner_cost_class:cost
    });
  };

  for(const family of forecast.workload.families){
    for(const bucket of family.buckets.filter((row)=>row.required)){
      if(!bucket.band_minutes){
        add(
          'PRICE:'+family.id+':'+bucket.id,
          100,
          'A required workload bucket is unpriced.',
          'Collect the missing remaining-unit identity or enough representative task-time evidence for '+family.label+' / '+bucket.id+'. Do not guess a rate.'
        );
      }else if(bucket.pricing_source==='PRIOR_ONLY'){
        add(
          'CALIBRATE:'+family.id+':'+bucket.id,
          80,
          'A required workload bucket is priced only from a prior range.',
          'Collect representative real learner timing for '+family.label+' / '+bucket.id+' when it naturally occurs; do not manufacture practice solely for measurement.'
        );
      }
    }
  }

  for(const channel of forecast.score.channels){
    if(!channel.score_eligible||!channel.range){
      add(
        'SCORE:'+channel.id,
        75,
        channel.label+' lacks score-eligible evidence.',
        'Obtain a clean/appropriately qualified first-output or formal score range for '+channel.label+' using existing task/scoring owners.',
        channel.id==='objective'?'SCARCE':'BOUNDED'
      );
    }
  }

  if(!forecast.score.integrated_whole_paper.score_eligible){
    add(
      'WHOLE_PAPER_CALIBRATION',
      50,
      'Local score channels do not prove integrated 180-minute exam execution.',
      'Preserve an appropriate low-contamination Whole Paper execution for later calibration; do not consume scarce formal material merely to improve the Forecast.',
      'SCARCE'
    );
  }

  const lexical=input?.learner_parameters?.lexical_delayed_retention;
  if(lexical==null){
    add(
      'LEXICAL_DELAYED_RETENTION',
      70,
      'Lexical reactivation speed alone cannot price maintenance/relapse risk.',
      'Observe delayed lexical retention through normal study and downstream English task performance.',
      'NATURAL_OBSERVATION'
    );
  }

  rows.sort((a,b)=>b._sort_rank-a._sort_rank||a.id.localeCompare(b.id));
  return rows.map(({_sort_rank,...row})=>row);
}

export function buildEnglishForecastFalsifiability(input,{
  targetScore=85,
  startDay=null,
  deadlineDay=null,
  dailyMinutesGrid=[60,90,120],
  workloadMultiplierGrid=[0.8,1,1.25]
}={}){
  const base=buildEnglishWorkloadForecast(input,{targetScore});
  const capacities=[...new Set((Array.isArray(dailyMinutesGrid)?dailyMinutesGrid:[]).map(Number).filter((v)=>Number.isFinite(v)&&v>=0))].sort((a,b)=>a-b);
  const multipliers=[...new Set((Array.isArray(workloadMultiplierGrid)?workloadMultiplierGrid:[]).map(Number).filter((v)=>Number.isFinite(v)&&v>0))].sort((a,b)=>a-b);
  const baseBand=base.workload.full_band_minutes||base.workload.known_priced_band_minutes;
  const grid=[];

  if(startDay&&deadlineDay&&baseBand){
    for(const multiplier of multipliers){
      const stressed=clone(base);
      const scaled=scaleBand(baseBand,multiplier);
      if(base.workload.full_band_minutes)stressed.workload.full_band_minutes=scaled;
      else stressed.workload.known_priced_band_minutes=scaled;
      for(const dailyMinutes of capacities){
        const feasibility=assessEnglishDeadlineFeasibility(stressed,{startDay,deadlineDay,dailyMinutes});
        grid.push({
          workload_multiplier:round(multiplier,3),
          daily_minutes:dailyMinutes,
          status:feasibility.status,
          full_scope:feasibility.full_scope,
          p20_fit:feasibility.fit?.p20??feasibility.known_lower_bound_fit?.p20??null,
          p50_fit:feasibility.fit?.p50??feasibility.known_lower_bound_fit?.p50??null,
          p80_fit:feasibility.fit?.p80??feasibility.known_lower_bound_fit?.p80??null
        });
      }
    }
  }

  const p50FlipSurface=capacities.map((dailyMinutes)=>{
    const rows=grid.filter((row)=>row.daily_minutes===dailyMinutes&&row.p50_fit!==null);
    const lastFit=[...rows].reverse().find((row)=>row.p50_fit===true);
    const firstFail=rows.find((row)=>row.p50_fit===false);
    return {
      daily_minutes:dailyMinutes,
      largest_tested_workload_multiplier_with_p50_fit:lastFit?.workload_multiplier??null,
      smallest_tested_workload_multiplier_without_p50_fit:firstFail?.workload_multiplier??null
    };
  });

  const candidates=evidenceCandidates(input,base);
  return {
    schema:'kianos.english.forecast-falsifiability.v1',
    assumptions:{
      target_score:targetScore,
      start_day:startDay,
      deadline_day:deadlineDay,
      tested_daily_minutes:capacities,
      tested_workload_multipliers:multipliers
    },
    base_forecast_state:base.forecast_state,
    workload_grid:grid,
    p50_flip_surface:p50FlipSurface,
    score_flip_points:base.score.flip_points,
    next_high_value_evidence:candidates[0]||null,
    evidence_candidates:candidates,
    subject_stage_decision:'OUT_OF_SCOPE',
    boundary:
      'Sensitivity surfaces expose when a capacity conclusion flips. They do not choose the learner action, daily task count, or cross-subject allocation. Evidence candidates are information candidates only.'
  };
}


function ratioOrNull(numerator,denominator){
  const a=finite(numerator),b=positive(denominator);
  return a===null||b===null?null:a/b;
}

export function backtestEnglishForecastHistory(rows=[]){
  const source=Array.isArray(rows)?rows:[];
  const workloadRows=[];
  const scoreRows=[];

  for(const row of source){
    const id=String(row?.id||row?.day||row?.observed_at||'').trim()||null;
    const actualMinutes=nonNegative(row?.actual_workload_minutes);
    const band=row?.predicted_workload_band;
    const p20=nonNegative(band?.p20),p50=nonNegative(band?.p50),p80=nonNegative(band?.p80);
    if(actualMinutes!==null&&p20!==null&&p50!==null&&p80!==null&&p20<=p50&&p50<=p80){
      const ratio=ratioOrNull(p50,actualMinutes);
      const absError=actualMinutes>0?Math.abs(p50-actualMinutes)/actualMinutes:null;
      workloadRows.push({
        id,
        actual_minutes:round(actualMinutes,1),
        predicted:{p20:round(p20,1),p50:round(p50,1),p80:round(p80,1)},
        p20_covers:actualMinutes<=p20,
        p50_covers:actualMinutes<=p50,
        p80_covers:actualMinutes<=p80,
        p50_actual_ratio:ratio===null?null:round(ratio,4),
        p50_absolute_percent_error:absError===null?null:round(absError,4)
      });
    }

    const actualScore=nonNegative(row?.actual_score);
    const scoreRange=row?.predicted_score_range;
    const low=nonNegative(scoreRange?.low),high=nonNegative(scoreRange?.high);
    if(actualScore!==null&&low!==null&&high!==null&&low<=high&&high<=100){
      scoreRows.push({
        id,
        actual_score:round(actualScore,1),
        predicted:{low:round(low,1),high:round(high,1)},
        covered:actualScore>=low&&actualScore<=high,
        miss_direction:actualScore<low?'OVER_OPTIMISTIC_LOW_BOUND':actualScore>high?'UNDER_PREDICTED_UPSIDE':null,
        band_width:round(high-low,1)
      });
    }
  }

  const coverage=(items,key)=>items.length
    ? round(items.filter((row)=>row[key]===true).length/items.length,4)
    : null;
  const ratios=workloadRows.map((row)=>row.p50_actual_ratio).filter((v)=>v!==null);
  const errors=workloadRows.map((row)=>row.p50_absolute_percent_error).filter((v)=>v!==null);
  const widths=scoreRows.map((row)=>row.band_width).filter((v)=>v!==null);

  return {
    schema:'kianos.english.forecast-backtest.v1',
    workload:{
      status:workloadRows.length>=3?'BACKTESTED':'INSUFFICIENT_BACKTEST',
      sample_count:workloadRows.length,
      p20_coverage:coverage(workloadRows,'p20_covers'),
      p50_coverage:coverage(workloadRows,'p50_covers'),
      p80_coverage:coverage(workloadRows,'p80_covers'),
      median_p50_actual_ratio:ratios.length?round(median(ratios),4):null,
      median_p50_absolute_percent_error:errors.length?round(median(errors),4):null,
      rows:workloadRows.slice(-20)
    },
    score:{
      status:scoreRows.length>=3?'BACKTESTED':'INSUFFICIENT_BACKTEST',
      sample_count:scoreRows.length,
      band_coverage:coverage(scoreRows,'covered'),
      median_band_width:widths.length?round(median(widths),1):null,
      misses:scoreRows.filter((row)=>!row.covered).slice(-20),
      rows:scoreRows.slice(-20)
    },
    recalibration_required:
      'CHAT_INTERPRETATION_REQUIRED',
    subject_stage_decision:'OUT_OF_SCOPE',
    boundary:
      'Backtest diagnostics expose calibration error after real outcomes exist. They do not auto-change workload, widen/narrow score bands, assign daily tasks, or claim Kian-specific calibration without sufficient real samples.'
  };
}
