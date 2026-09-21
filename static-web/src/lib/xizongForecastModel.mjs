export const XIZONG_FORECAST_MODEL_SCHEMA = 'kianos.xizong.workload-forecast.v1';
export const XIZONG_HISTORICAL_MODERN_165_SCORE_PROFILE = Object.freeze({
  schema: 'kianos.xizong.historical-score-profile.v1',
  authority: 'HISTORICAL_2017_2026_WORKING_PRIOR_NOT_2027_CURRENT_TRUTH',
  max_score: 300,
  question_count: 165,
  disciplines: Object.freeze({
    physiology: Object.freeze({ label: '生理', points: 42, ranges: [[1,16],[116,119],[136,141]] }),
    biochemistry: Object.freeze({ label: '生化', points: 36, ranges: [[17,28],[120,123],[142,147]] }),
    pathology: Object.freeze({ label: '病理', points: 36, ranges: [[29,40],[124,127],[148,153]] }),
    internal: Object.freeze({ label: '内科', points: 100, ranges: [[41,56],[68,92],[128,131],[154,159]] }),
    surgery: Object.freeze({ label: '外科', points: 70, ranges: [[57,67],[93,107],[132,135],[160,165]] }),
    humanism: Object.freeze({ label: '人文', points: 16, ranges: [[108,115]] })
  })
});

export function xizongHistoricalDisciplineForQuestion(yearInput, numberInput, profile = XIZONG_HISTORICAL_MODERN_165_SCORE_PROFILE) {
  const year = Number(yearInput);
  const number = Number(numberInput);
  if (!Number.isInteger(year) || year < 2017 || year > 2026 || !Number.isInteger(number)) return null;
  for (const [id, row] of Object.entries(profile?.disciplines || {})) {
    if ((row?.ranges || []).some(([start,end]) => number >= Number(start) && number <= Number(end))) return id;
  }
  return null;
}

export function buildXizongHighScoreRequirement({
  targetScore = 275,
  profile = XIZONG_HISTORICAL_MODERN_165_SCORE_PROFILE
} = {}) {
  const maxScore = Number(profile?.max_score || 300);
  const target = Number(targetScore);
  if (!Number.isFinite(target) || target <= 0 || target > maxScore) throw new Error('XIZONG_TARGET_SCORE_INVALID');
  const lossBudget = maxScore - target;
  const retention = target / maxScore;
  const disciplines = Object.entries(profile?.disciplines || {}).map(([id,row]) => {
    const points = Number(row?.points || 0);
    const neutralLoss = points * (lossBudget / maxScore);
    return {
      id,
      label: String(row?.label || id),
      points,
      neutral_proportional_loss_budget: round(neutralLoss, 2),
      neutral_proportional_target_points: round(points - neutralLoss, 2),
      neutral_point_retention: round(retention, 4)
    };
  });
  const roundedTargetTotal = disciplines.reduce((sum,row)=>sum+Number(row.neutral_proportional_target_points||0),0);
  return {
    schema: 'kianos.xizong.high-score-requirement.v1',
    target_score: target,
    max_score: maxScore,
    total_loss_budget: round(lossBudget, 2),
    point_retention_required: round(retention, 4),
    neutral_proportional_target_total: target,
    display_rounding_residual: round(roundedTargetTotal - target, 2),
    historical_structure_authority: String(profile?.authority || ''),
    disciplines,
    capability_requirements: [
      { id: 'SOURCE_MODEL', target: 'UNDERSTOOD', evidence: 'Source contact + canonical learning closure' },
      { id: 'ACTIVE_RECALL', target: 'RECALLABLE', evidence: 'KP/LG/Block/System retrieval evidence' },
      { id: 'PRECISION', target: 'REQUIRED_STABLE_WHERE_HIGH_VALUE', evidence: 'selective Precision Memory delayed stability' },
      { id: 'OFFICIAL_APPLICATION', target: 'APPLICABLE', evidence: 'official question performance + decisive-condition reasoning' },
      { id: 'REPAIR_FRESH_VERIFICATION', target: 'REPAIRED_AND_RETESTED', evidence: 'W/U cluster repair followed by fresh application' },
      { id: 'CASE_TRANSFER', target: 'CASE_STABLE', evidence: 'fresh transfer/case/cross-system evidence' },
      { id: 'WHOLE_PAPER_EXECUTION', target: 'TIME_PRESSURE_STABLE', evidence: 'sealed whole-paper or execution-faithful large calibration' }
    ],
    boundary:
      'The proportional discipline loss budgets are neutral diagnostic baselines, not fixed quotas. Per-discipline display rounding may not sum exactly to target_score; display_rounding_residual records that harmless presentation delta. The 275+ requirement is total point retention; evidence may justify asymmetric loss allocation later.'
  };
}


const finite = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
const positive = (value) => {
  const n = finite(value);
  return n !== null && n > 0 ? n : null;
};
const round = (value, digits = 1) => {
  const n = finite(value);
  if (n === null) return null;
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
};

function quantile(values, p) {
  const rows = (Array.isArray(values) ? values : [])
    .map(Number)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if (!rows.length) return null;
  if (rows.length === 1) return rows[0];
  const position = (rows.length - 1) * Math.max(0, Math.min(1, Number(p)));
  const low = Math.floor(position);
  const high = Math.ceil(position);
  if (low === high) return rows[low];
  const weight = position - low;
  return rows[low] * (1 - weight) + rows[high] * weight;
}

function median(values) {
  return quantile(values, 0.5);
}

function sampleState(count) {
  if (count <= 0) return 'NO_SAMPLES';
  if (count < 3) return 'REFERENCE_ONLY';
  if (count < 5) return 'PROVISIONAL';
  return 'EMPIRICAL';
}

function rateEstimate(samples, remainingUnits, {
  id,
  unit,
  rateOf
} = {}) {
  const rates = (Array.isArray(samples) ? samples : [])
    .map((sample) => {
      const rate = positive(rateOf(sample));
      return rate === null ? null : rate;
    })
    .filter((value) => value !== null);
  const remaining = Math.max(0, Number(remainingUnits || 0));
  const state = sampleState(rates.length);
  const referenceRate = median(rates);
  const result = {
    id,
    unit,
    sample_count: rates.length,
    sample_state: state,
    remaining_units: remaining,
    reference_minutes_per_unit: referenceRate === null ? null : round(referenceRate, 3),
    band_minutes: null
  };
  if (rates.length >= 3) {
    result.band_minutes = {
      p20: round(quantile(rates, 0.2) * remaining),
      p50: round(quantile(rates, 0.5) * remaining),
      p80: round(quantile(rates, 0.8) * remaining)
    };
  }
  return result;
}

function combineModelFormBands(estimators = []) {
  const valid = estimators.filter((row) => row?.band_minutes);
  if (!valid.length) return null;
  const p20 = Math.min(...valid.map((row) => row.band_minutes.p20));
  const p50s = valid.map((row) => row.band_minutes.p50);
  const p80 = Math.max(...valid.map((row) => row.band_minutes.p80));
  const overlapLower = Math.max(...valid.map((row) => row.band_minutes.p20));
  const overlapUpper = Math.min(...valid.map((row) => row.band_minutes.p80));
  return {
    p20: round(p20),
    p50: round(median(p50s)),
    p80: round(p80),
    estimator_count: valid.length,
    estimator_bands_overlap: overlapLower <= overlapUpper,
    estimator_overlap_minutes: {
      lower: round(overlapLower),
      upper: round(overlapUpper)
    },
    p50_model_spread_ratio: p50s.length > 1 && Math.min(...p50s) > 0
      ? round(Math.max(...p50s) / Math.min(...p50s), 3)
      : 1
  };
}

function relativeError(predicted, actual) {
  const p = positive(predicted);
  const a = positive(actual);
  return p === null || a === null ? null : Math.abs(p - a) / a;
}

function signedRatio(predicted, actual) {
  const p = positive(predicted);
  const a = positive(actual);
  return p === null || a === null ? null : p / a;
}

function rollingKnowledgeBacktest(samples = []) {
  const ordered = (Array.isArray(samples) ? samples : [])
    .filter((row) => positive(row?.timer_minutes_to_completion) !== null)
    .slice()
    .sort((a,b) => String(a?.completed_at || '').localeCompare(String(b?.completed_at || '')));
  const trials = [];
  for (let index = 3; index < ordered.length; index += 1) {
    const train = ordered.slice(0,index);
    const test = ordered[index];
    const actual = positive(test?.timer_minutes_to_completion);
    const candidates = [];
    const kpRate = median(train.map((row) => {
      const m=positive(row?.timer_minutes_to_completion), u=positive(row?.kp_count);
      return m!==null&&u!==null ? m/u : null;
    }).filter((x)=>x!==null));
    const lgRate = median(train.map((row) => {
      const m=positive(row?.timer_minutes_to_completion), u=positive(row?.logic_group_count);
      return m!==null&&u!==null ? m/u : null;
    }).filter((x)=>x!==null));
    if (kpRate !== null && positive(test?.kp_count)!==null) candidates.push(kpRate*Number(test.kp_count));
    if (lgRate !== null && positive(test?.logic_group_count)!==null) candidates.push(lgRate*Number(test.logic_group_count));
    const predicted = candidates.length ? median(candidates) : null;
    const error = relativeError(predicted,actual);
    const ratio = signedRatio(predicted,actual);
    if (error === null || ratio === null) continue;
    trials.push({
      block_id:String(test?.block_id||''),
      canonical_id:String(test?.canonical_id||''),
      actual_minutes:round(actual),
      predicted_minutes:round(predicted),
      absolute_percent_error:round(error,4),
      predicted_actual_ratio:round(ratio,4)
    });
  }
  const errors=trials.map((row)=>row.absolute_percent_error);
  const ratios=trials.map((row)=>row.predicted_actual_ratio);
  const rateRows=ordered.map((row)=>{
    const minutes=positive(row?.timer_minutes_to_completion);
    const kp=positive(row?.kp_count);
    const lg=positive(row?.logic_group_count);
    return {
      kp_rate:minutes!==null&&kp!==null ? minutes/kp : null,
      lg_rate:minutes!==null&&lg!==null ? minutes/lg : null
    };
  });
  const recentRates=rateRows.slice(-3);
  const earlierRates=rateRows.slice(0,Math.max(0,rateRows.length-3));
  const driftFor=(key)=>{
    const recent=median(recentRates.map((row)=>positive(row?.[key])).filter((x)=>x!==null));
    const earlier=median(earlierRates.map((row)=>positive(row?.[key])).filter((x)=>x!==null));
    return recent!==null&&earlier!==null&&earlier>0 ? recent/earlier : null;
  };
  const kpDrift=driftFor('kp_rate');
  const lgDrift=driftFor('lg_rate');
  const structuralSlowdown=kpDrift!==null&&lgDrift!==null&&kpDrift>1.35&&lgDrift>1.35;
  return {
    status: trials.length >= 3 ? 'BACKTESTED' : 'INSUFFICIENT_BACKTEST',
    completed_samples: ordered.length,
    trial_count: trials.length,
    median_absolute_percent_error: errors.length ? round(median(errors),4) : null,
    median_predicted_actual_ratio: ratios.length ? round(median(ratios),4) : null,
    recent_vs_earlier_kp_rate_ratio: kpDrift===null ? null : round(kpDrift,4),
    recent_vs_earlier_lg_rate_ratio: lgDrift===null ? null : round(lgDrift,4),
    structural_pace_slowdown: structuralSlowdown,
    trials: trials.slice(-12),
    boundary:
      'Rolling backtest predicts each later completed Block from earlier completed Blocks only. It is a calibration diagnostic, not an independent learner truth.'
  };
}

function rollingRateBacktest(rows = [], valueKey = 'observed_minutes_per_attempt') {
  const ordered=(Array.isArray(rows)?rows:[])
    .filter((row)=>positive(row?.[valueKey])!==null)
    .slice()
    .sort((a,b)=>String(a?.day||a?.completed_at||'').localeCompare(String(b?.day||b?.completed_at||'')));
  const trials=[];
  for(let index=3;index<ordered.length;index+=1){
    const train=ordered.slice(0,index).map((row)=>positive(row?.[valueKey])).filter((x)=>x!==null);
    const actual=positive(ordered[index]?.[valueKey]);
    const predicted=median(train);
    const error=relativeError(predicted,actual);
    const ratio=signedRatio(predicted,actual);
    if(error===null||ratio===null) continue;
    trials.push({
      id:String(ordered[index]?.day||ordered[index]?.repair_id||index),
      actual:round(actual,3),
      predicted:round(predicted,3),
      absolute_percent_error:round(error,4),
      predicted_actual_ratio:round(ratio,4)
    });
  }
  return {
    status:trials.length>=3?'BACKTESTED':'INSUFFICIENT_BACKTEST',
    sample_count:ordered.length,
    trial_count:trials.length,
    median_absolute_percent_error:trials.length?round(median(trials.map((row)=>row.absolute_percent_error)),4):null,
    median_predicted_actual_ratio:trials.length?round(median(trials.map((row)=>row.predicted_actual_ratio)),4):null,
    trials:trials.slice(-12)
  };
}

function knowledgeForecast(progress) {
  const weights = Array.isArray(progress?.canonical_scope?.block_weights)
    ? progress.canonical_scope.block_weights
    : [];
  const completedIds = new Set(progress?.runtime_evidence?.completed_block_ids || []);
  const remaining = weights.filter((row) => !completedIds.has(String(row?.block_id || '')));
  const remainingBlocks = remaining.reduce((sum, row) => {
    const count = Number(row?.block_count);
    return sum + (Number.isFinite(count) && count > 0 ? count : 1);
  }, 0);
  const samples = (progress?.runtime_evidence?.completed_blocks_detail || [])
    .filter((row) => positive(row?.timer_minutes_to_completion) !== null);
  const sampleSystems = new Set(samples.map((row) => String(row?.canonical_id || '')).filter(Boolean));
  const remainingKp = remaining.reduce((sum, row) => sum + Math.max(0, Number(row?.kp_count || 0)), 0);
  const remainingLg = remaining.reduce((sum, row) => sum + Math.max(0, Number(row?.logic_group_count || 0)), 0);
  const estimators = [
    rateEstimate(samples, remainingBlocks, {
      id: 'BLOCK',
      unit: 'completed block',
      rateOf: (sample) => positive(sample?.timer_minutes_to_completion)
    }),
    rateEstimate(samples, remainingKp, {
      id: 'KP',
      unit: 'canonical KP',
      rateOf: (sample) => {
        const minutes = positive(sample?.timer_minutes_to_completion);
        const units = positive(sample?.kp_count);
        return minutes !== null && units !== null ? minutes / units : null;
      }
    }),
    rateEstimate(samples, remainingLg, {
      id: 'LG',
      unit: 'logic group',
      rateOf: (sample) => {
        const minutes = positive(sample?.timer_minutes_to_completion);
        const units = positive(sample?.logic_group_count);
        return minutes !== null && units !== null ? minutes / units : null;
      }
    })
  ];
  const band = combineModelFormBands(estimators);
  const backtest = rollingKnowledgeBacktest(samples);
  const risks = [];
  if (samples.length < 3) risks.push('INSUFFICIENT_COMPLETED_BLOCK_TIMER_SAMPLES');
  if (sampleSystems.size < 2 && samples.length > 0) risks.push('SINGLE_SYSTEM_CALIBRATION');
  if (Number(progress?.runtime_evidence?.started_incomplete_blocks || 0) > 0) {
    risks.push('STARTED_INCOMPLETE_BLOCKS_PRICED_AS_FULL_REMAINING');
  }
  if (remaining.some((row) => String(row?.scope_kind || '') === 'UNPROJECTED_AGGREGATE')) {
    risks.push('UNPROJECTED_CANONICAL_SCOPE_RETAINED');
  }
  if (band && band.estimator_bands_overlap === false) risks.push('STRUCTURAL_ESTIMATORS_DIVERGE');
  if (backtest.status === 'BACKTESTED' && Number(backtest.median_absolute_percent_error || 0) > 0.25) {
    risks.push('KNOWLEDGE_FORECAST_BACKTEST_ERROR_HIGH');
  }
  if (backtest.status === 'BACKTESTED' && Number(backtest.median_predicted_actual_ratio || 1) < 0.85) {
    risks.push('KNOWLEDGE_FORECAST_SYSTEMATIC_OPTIMISM');
  }
  if (backtest.structural_pace_slowdown === true) {
    risks.push('RECENT_KNOWLEDGE_PACE_SLOWDOWN');
  }
  return {
    component: 'FIRST_PASS_KNOWLEDGE_CLOSURE',
    required: true,
    status: band ? (samples.length >= 5 && sampleSystems.size >= 2 ? 'CALIBRATED' : 'PROVISIONAL') : sampleState(samples.length),
    remaining: {
      blocks: remainingBlocks,
      kp: remainingKp,
      logic_groups: remainingLg
    },
    calibration: {
      completed_block_timer_samples: samples.length,
      sample_systems: [...sampleSystems].sort(),
      estimators,
      rolling_backtest: backtest
    },
    band_minutes: band,
    risks,
    evidence_boundary:
      'Route timer to Block completion is learner evidence, not guaranteed total study time. Started incomplete Blocks remain fully priced until a stronger fractional-completion signal is proven. Canonical unprojected Blocks remain in workload via durable owner counts; Website projectability never deletes them.'
  };
}

function questionForecast(progress) {
  const remaining = finite(progress?.question_workload?.known_remaining_questions);
  const allDayRows = progress?.practice_evidence?.first_pass?.by_day || [];
  const currentScopeSamples = allDayRows
    .filter((row) => positive(row?.current_scope_observed_minutes_per_attempt) !== null)
    .map((row) => ({
      ...row,
      forecast_minutes_per_attempt: positive(row?.current_scope_observed_minutes_per_attempt),
      forecast_attempts: Number(row?.current_scope_attempted || 0),
      forecast_timer_minutes: Number(row?.current_scope_practice_timer_minutes || 0)
    }));
  const broaderSamples = allDayRows
    .filter((row) => positive(row?.observed_minutes_per_attempt) !== null)
    .map((row) => ({
      ...row,
      forecast_minutes_per_attempt: positive(row?.observed_minutes_per_attempt),
      forecast_attempts: Number(row?.attempted || 0),
      forecast_timer_minutes: Number(row?.practice_timer_minutes || 0)
    }));
  const daySamples = currentScopeSamples.length ? currentScopeSamples : broaderSamples;
  const fallbackSource = currentScopeSamples.length
    ? 'CURRENT_EXACT_SCOPE_SYSTEM_SWEEP'
    : 'BROADER_OFFICIAL_PRACTICE_FALLBACK';
  const rates = daySamples
    .map((row) => positive(row?.forecast_minutes_per_attempt))
    .filter((value) => value !== null);
  const state = sampleState(rates.length);
  const backtest = rollingRateBacktest(
    daySamples.map((row) => ({ ...row, observed_minutes_per_attempt: row.forecast_minutes_per_attempt }))
  );
  const fallbackBand = remaining === 0 ? { p20: 0, p50: 0, p80: 0 } : remaining !== null && rates.length >= 3
    ? {
        p20: round(quantile(rates, 0.2) * remaining),
        p50: round(quantile(rates, 0.5) * remaining),
        p80: round(quantile(rates, 0.8) * remaining)
      }
    : null;

  const workloadSystems = (Array.isArray(progress?.question_workload?.systems)
    ? progress.question_workload.systems
    : [])
    .filter((row) => row?.status === 'EXACT' && Number(row?.remaining_questions || 0) > 0);
  const practiceBySystem = new Map(
    (Array.isArray(progress?.practice_evidence?.first_pass?.by_system)
      ? progress.practice_evidence.first_pass.by_system
      : [])
      .map((row) => [String(row?.canonical_id || ''), row])
  );
  const workloadDomains = (Array.isArray(progress?.question_workload?.non_system_domains)
    ? progress.question_workload.non_system_domains
    : [])
    .filter((row) => row?.status === 'EXACT' && Number(row?.remaining_questions || 0) > 0);
  const practiceByDomain = new Map(
    (Array.isArray(progress?.practice_evidence?.first_pass?.by_domain)
      ? progress.practice_evidence.first_pass.by_domain
      : [])
      .map((row) => [String(row?.canonical_id || row?.domain_id || ''), row])
  );
  const systemRows = workloadSystems.map((workload) => {
    const canonicalId = String(workload?.canonical_id || '');
    const practice = practiceBySystem.get(canonicalId) || {};
    const speedSamples = (Array.isArray(practice?.current_scope_speed_by_day)
      ? practice.current_scope_speed_by_day
      : [])
      .map((row) => positive(row?.observed_minutes_per_attempt))
      .filter((value) => value !== null);
    const remainingQuestions = Math.max(0, Number(workload?.remaining_questions || 0));
    const systemBand = speedSamples.length >= 3
      ? {
          p20: round(quantile(speedSamples, 0.2) * remainingQuestions),
          p50: round(quantile(speedSamples, 0.5) * remainingQuestions),
          p80: round(quantile(speedSamples, 0.8) * remainingQuestions)
        }
      : null;
    return {
      canonical_id: canonicalId,
      remaining_questions: remainingQuestions,
      speed_samples: speedSamples.length,
      reference_minutes_per_question: speedSamples.length ? round(median(speedSamples), 3) : null,
      speed_rates: speedSamples.map((value) => round(value, 3)),
      band_minutes: systemBand
    };
  });
  const domainRows = workloadDomains.map((workload) => {
    const canonicalId = String(workload?.canonical_id || workload?.domain_id || '');
    const practice = practiceByDomain.get(canonicalId) || {};
    const domainSpecificRates = (Array.isArray(practice?.current_scope_speed_by_day)
      ? practice.current_scope_speed_by_day
      : [])
      .map((row) => positive(row?.observed_minutes_per_attempt))
      .filter((value) => value !== null);
    const speedRates = domainSpecificRates;
    const speedSource = domainSpecificRates.length >= 3
      ? 'NON_SYSTEM_DOMAIN_CURRENT_EXACT_SCOPE'
      : 'UNPRICED';
    const remainingQuestions = Math.max(0, Number(workload?.remaining_questions || 0));
    const domainBand = speedRates.length >= 3
      ? {
          p20: round(quantile(speedRates, 0.2) * remainingQuestions),
          p50: round(quantile(speedRates, 0.5) * remainingQuestions),
          p80: round(quantile(speedRates, 0.8) * remainingQuestions)
        }
      : null;
    return {
      domain_id: String(workload?.domain_id || ''),
      canonical_id: canonicalId,
      owner_kind: 'NON_SYSTEM_EXAM_DOMAIN',
      remaining_questions: remainingQuestions,
      speed_source: speedSource,
      speed_samples: speedRates.length,
      domain_specific_speed_samples: domainSpecificRates.length,
      reference_minutes_per_question: speedRates.length ? round(median(speedRates), 3) : null,
      speed_rates: speedRates.map((value) => round(value, 3)),
      band_minutes: domainBand
    };
  });

  const ownerRows = [...systemRows, ...domainRows];
  const ownerPricingMode = ownerRows.length > 0;
  const unpricedSystemIds = ownerPricingMode
    ? systemRows.filter((row) => !row.band_minutes).map((row) => row.canonical_id)
    : [];
  const unpricedDomainIds = ownerPricingMode
    ? domainRows.filter((row) => !row.band_minutes).map((row) => row.canonical_id)
    : [];
  const stratifiedBand = ownerPricingMode
    && unpricedSystemIds.length === 0
    && unpricedDomainIds.length === 0
    ? {
        p20: round(ownerRows.reduce((sum, row) => sum + Number(row.band_minutes?.p20 || 0), 0)),
        p50: round(ownerRows.reduce((sum, row) => sum + Number(row.band_minutes?.p50 || 0), 0)),
        p80: round(ownerRows.reduce((sum, row) => sum + Number(row.band_minutes?.p80 || 0), 0))
      }
    : null;
  const ownerReferenceRates = ownerRows
    .map((row) => positive(row.reference_minutes_per_question))
    .filter((value) => value !== null);
  const speedHeterogeneityRatio = ownerReferenceRates.length >= 2
    ? round(Math.max(...ownerReferenceRates) / Math.min(...ownerReferenceRates), 3)
    : null;
  const band = ownerPricingMode ? stratifiedBand : fallbackBand;
  const calibrationSource = ownerPricingMode
    ? 'OWNER_STRATIFIED_CURRENT_EXACT_SCOPE'
    : fallbackSource;

  const risks = [];
  if (remaining === null) risks.push('KNOWN_REMAINING_QUESTION_COUNT_AMBIGUOUS');
  if (!ownerPricingMode && rates.length < 3) risks.push('INSUFFICIENT_PRACTICE_TIMER_SAMPLES');
  if (ownerPricingMode && unpricedSystemIds.length) risks.push('SYSTEM_QUESTION_SPEED_UNCALIBRATED');
  if (ownerPricingMode && unpricedDomainIds.length) risks.push('NON_SYSTEM_DOMAIN_SPEED_UNCALIBRATED');
  if (speedHeterogeneityRatio !== null && speedHeterogeneityRatio >= 1.5) risks.push('QUESTION_SPEED_OWNER_HETEROGENEITY');
  if (progress?.question_workload?.known_remaining_is_lower_bound) risks.push('UNPRICED_SYSTEM_QUESTION_SCOPE');
  if (Number(progress?.question_workload?.cross_owner_duplicate_memberships
    ?? progress?.question_workload?.cross_system_duplicate_memberships
    ?? 0) > 0) {
    risks.push('CROSS_SYSTEM_DUPLICATE_MEMBERSHIP');
    risks.push('CROSS_OWNER_DUPLICATE_MEMBERSHIP');
  }
  if (backtest.status === 'BACKTESTED' && Number(backtest.median_absolute_percent_error || 0) > 0.25) {
    risks.push('QUESTION_SPEED_BACKTEST_ERROR_HIGH');
  }
  if (backtest.status === 'BACKTESTED' && Number(backtest.median_predicted_actual_ratio || 1) < 0.85) {
    risks.push('QUESTION_SPEED_SYSTEMATIC_OPTIMISM');
  }
  return {
    component: 'FIRST_PASS_OFFICIAL_SWEEP',
    required: true,
    status: band
      ? (ownerPricingMode
          ? (
              systemRows.every((row) => row.speed_samples >= 5)
              && domainRows.every((row) => row.speed_source === 'NON_SYSTEM_DOMAIN_CURRENT_EXACT_SCOPE' && row.speed_samples >= 5)
                ? 'CALIBRATED'
                : 'PROVISIONAL'
            )
          : (rates.length >= 5 ? 'CALIBRATED' : 'PROVISIONAL'))
      : (ownerPricingMode ? 'UNPRICED_REQUIRED' : state),
    known_remaining_questions: remaining,
    known_remaining_is_lower_bound: Boolean(progress?.question_workload?.known_remaining_is_lower_bound),
    unknown_systems: [...(progress?.question_workload?.unknown_systems || [])],
    unknown_domains: [...(progress?.question_workload?.unknown_domains || [])],
    calibration: {
      source: calibrationSource,
      day_samples: rates.length,
      current_scope_day_samples: currentScopeSamples.length,
      broader_day_samples: broaderSamples.length,
      reference_minutes_per_question: rates.length ? round(median(rates), 3) : null,
      system_rows: systemRows,
      non_system_domain_rows: domainRows,
      unpriced_system_ids: unpricedSystemIds,
      unpriced_domain_ids: unpricedDomainIds,
      system_speed_heterogeneity_ratio: speedHeterogeneityRatio,
      sample_rows: daySamples.map((row) => ({
        day: row.day,
        attempts: Number(row.forecast_attempts || 0),
        practice_timer_minutes: Number(row.forecast_timer_minutes || 0),
        minutes_per_attempt: positive(row.forecast_minutes_per_attempt)
      })),
      rolling_backtest: backtest
    },
    band_minutes: band,
    risks,
    evidence_boundary:
      'Question throughput uses owner-stratified Current exact-scope timing, weighting each medical System or independent non-System exam domain by its own remaining demand. A remaining owner without its own observations stays unpriced; pooled activity from a completed or different owner cannot price it. Website routing never turns humanities into a medical System.'
  };
}

function recallForecast(progress) {
  const rows = Array.isArray(progress?.system_recall_evidence) ? progress.system_recall_evidence : [];
  let remainingEvents = 0;
  const samples = [];
  for (const row of rows) {
    if (!row?.pre_question_recall_observed) remainingEvents += 1;
    if (!row?.post_first_pass_recall_observed) remainingEvents += 1;
    for (const event of row?.events || []) {
      const minutes = positive(event?.timer_minutes_since_previous_recall);
      if (minutes !== null) samples.push(minutes);
    }
  }
  const state = sampleState(samples.length);
  const band = samples.length >= 3
    ? {
        p20: round(quantile(samples, 0.2) * remainingEvents),
        p50: round(quantile(samples, 0.5) * remainingEvents),
        p80: round(quantile(samples, 0.8) * remainingEvents)
      }
    : null;
  return {
    component: 'SYSTEM_RECALL_CLOSURE',
    required: true,
    status: band ? (samples.length >= 5 ? 'CALIBRATED' : 'PROVISIONAL') : state,
    remaining_recall_events: remainingEvents,
    calibration: {
      recall_timer_samples: samples.length,
      reference_minutes_per_recall: samples.length ? round(median(samples), 3) : null
    },
    band_minutes: band,
    risks: samples.length < 3 && remainingEvents > 0 ? ['INSUFFICIENT_SYSTEM_RECALL_TIMER_SAMPLES'] : [],
    evidence_boundary:
      'A pre-question/manual recall event and a post-FIRST_PASS recall event are distinct requirements. Timer evidence prices observed recall sessions only.'
  };
}

function repairForecast(progress, { wrongUncertainRate = null } = {}) {
  const firstPass = progress?.practice_evidence?.first_pass || {};
  const currentScopeAttempted = Math.max(0, Number(firstPass?.current_scope_unique_attempted_questions || 0));
  const broaderAttempted = Math.max(0, Number(firstPass?.attempted_questions || 0));
  const currentScopeRate = finite(firstPass?.current_scope_wrong_or_uncertain_rate);
  const broaderRate = finite(firstPass?.wrong_or_uncertain_rate);
  const observedRate = currentScopeRate !== null ? currentScopeRate : broaderRate;
  const attempted = currentScopeRate !== null ? currentScopeAttempted : broaderAttempted;
  const observedRateSource = currentScopeRate !== null
    ? 'CURRENT_EXACT_SCOPE_FIRST_ATTEMPT'
    : 'BROADER_FIRST_PASS_FALLBACK';
  const scenarioRate = wrongUncertainRate === null
    ? null
    : Math.max(0, Math.min(1, Number(wrongUncertainRate)));
  const remainingQuestions = finite(progress?.question_workload?.known_remaining_questions);

  const workloadSystems = (Array.isArray(progress?.question_workload?.systems)
    ? progress.question_workload.systems
    : [])
    .filter((row) => row?.status === 'EXACT' && Number(row?.remaining_questions || 0) > 0);
  const practiceBySystem = new Map(
    (Array.isArray(firstPass?.by_system) ? firstPass.by_system : [])
      .map((row) => [String(row?.canonical_id || ''), row])
  );
  const workloadDomains = (Array.isArray(progress?.question_workload?.non_system_domains)
    ? progress.question_workload.non_system_domains
    : [])
    .filter((row) => row?.status === 'EXACT' && Number(row?.remaining_questions || 0) > 0);
  const practiceByDomain = new Map(
    (Array.isArray(firstPass?.by_domain) ? firstPass.by_domain : [])
      .map((row) => [String(row?.canonical_id || row?.domain_id || ''), row])
  );
  const systemErrorRows = workloadSystems.map((workload) => {
    const canonicalId = String(workload?.canonical_id || '');
    const practice = practiceBySystem.get(canonicalId) || {};
    const sampleCount = Math.max(0, Number(practice?.current_scope_unique_attempted || 0));
    const rate = finite(practice?.current_scope_wrong_or_uncertain_rate);
    const remaining = Math.max(0, Number(workload?.remaining_questions || 0));
    return {
      canonical_id: canonicalId,
      remaining_questions: remaining,
      observed_attempts: sampleCount,
      wrong_uncertain_rate: rate,
      predicted_future_wrong_uncertain_questions: rate === null ? null : round(remaining * rate)
    };
  });
  const domainErrorRows = workloadDomains.map((workload) => {
    const canonicalId = String(workload?.canonical_id || workload?.domain_id || '');
    const practice = practiceByDomain.get(canonicalId) || {};
    const rate = finite(practice?.current_scope_wrong_or_uncertain_rate);
    const remaining = Math.max(0, Number(workload?.remaining_questions || 0));
    return {
      owner_kind: 'NON_SYSTEM_EXAM_DOMAIN',
      domain_id: String(workload?.domain_id || ''),
      canonical_id: canonicalId,
      remaining_questions: remaining,
      observed_attempts: Math.max(0, Number(practice?.current_scope_unique_attempted || 0)),
      wrong_uncertain_rate: rate,
      predicted_future_wrong_uncertain_questions: rate === null ? null : round(remaining * rate)
    };
  });
  const ownerErrorRows = [
    ...systemErrorRows.map((row) => ({ owner_kind: 'MEDICAL_SYSTEM', domain_id: null, ...row })),
    ...domainErrorRows
  ];
  const ownerPricingMode = scenarioRate === null && ownerErrorRows.length > 0;
  const unpricedSystemIds = ownerPricingMode
    ? systemErrorRows.filter((row) => row.wrong_uncertain_rate === null).map((row) => row.canonical_id)
    : [];
  const unpricedDomainIds = ownerPricingMode
    ? domainErrorRows.filter((row) => row.wrong_uncertain_rate === null).map((row) => row.canonical_id)
    : [];

  let futureWu = null;
  let forecastRate = null;
  let forecastRateSource = observedRateSource;
  if (scenarioRate !== null) {
    futureWu = remainingQuestions !== null ? remainingQuestions * scenarioRate : null;
    forecastRate = scenarioRate;
    forecastRateSource = 'SCENARIO_OVERRIDE';
  } else if (ownerPricingMode) {
    if (unpricedSystemIds.length === 0 && unpricedDomainIds.length === 0 && remainingQuestions !== null) {
      futureWu = ownerErrorRows.reduce(
        (sum, row) => sum + Number(row.remaining_questions || 0) * Number(row.wrong_uncertain_rate || 0),
        0
      );
      forecastRate = remainingQuestions > 0 ? futureWu / remainingQuestions : 0;
    }
    forecastRateSource = 'OWNER_STRATIFIED_CURRENT_EXACT_SCOPE';
  } else {
    forecastRate = observedRate;
    futureWu = observedRate !== null && remainingQuestions !== null ? remainingQuestions * observedRate : null;
  }

  if (remainingQuestions === 0) futureWu = 0;

  const observedOwnerRates = ownerErrorRows
    .map((row) => finite(row.wrong_uncertain_rate))
    .filter((value) => value !== null);
  const rateSpread = observedOwnerRates.length >= 2
    ? round(Math.max(...observedOwnerRates) - Math.min(...observedOwnerRates), 4)
    : null;

  const questionsPerCluster = positive(progress?.repair_evidence?.observed_question_to_cluster_ratio);
  const activeClusters = Math.max(0, Number(
    progress?.repair_evidence?.active_question_backed_clusters
    ?? progress?.repair_evidence?.active_repair_clusters
    ?? 0
  ));

  const compressionBySystem = new Map(
    (Array.isArray(progress?.repair_evidence?.by_system) ? progress.repair_evidence.by_system : [])
      .map((row) => [String(row?.canonical_id || ''), row])
  );
  const compressionByDomain = new Map(
    (Array.isArray(progress?.repair_evidence?.by_domain) ? progress.repair_evidence.by_domain : [])
      .map((row) => [String(row?.canonical_id || row?.domain_id || ''), row])
  );
  const futureWuByOwner = ownerErrorRows.map((errorRow) => {
    const rate = scenarioRate !== null
      ? scenarioRate
      : ownerPricingMode
        ? finite(errorRow?.wrong_uncertain_rate)
        : forecastRate;
    return {
      owner_kind: errorRow.owner_kind,
      domain_id: errorRow.domain_id,
      canonical_id: errorRow.canonical_id,
      future_wrong_uncertain_questions:
        rate === null ? null : Number(errorRow.remaining_questions || 0) * rate
    };
  });
  const compressionRows = futureWuByOwner.map((row) => {
    const observed = row.owner_kind === 'NON_SYSTEM_EXAM_DOMAIN'
      ? (compressionByDomain.get(row.canonical_id) || {})
      : (compressionBySystem.get(row.canonical_id) || {});
    const clusterSamples = Math.max(0, Number(observed?.question_backed_clusters || 0));
    const ratio = positive(observed?.observed_question_to_cluster_ratio);
    const usableRatio = ratio !== null && clusterSamples >= 3 ? ratio : null;
    return {
      owner_kind: row.owner_kind,
      domain_id: row.domain_id,
      canonical_id: row.canonical_id,
      future_wrong_uncertain_questions:
        row.future_wrong_uncertain_questions === null ? null : round(row.future_wrong_uncertain_questions),
      observed_question_backed_clusters: clusterSamples,
      observed_questions_per_cluster: ratio,
      pricing_questions_per_cluster: usableRatio,
      predicted_future_clusters:
        row.future_wrong_uncertain_questions !== null && usableRatio !== null
          ? round(row.future_wrong_uncertain_questions / usableRatio, 2)
          : null
    };
  });
  const ownerCompressionMode = ownerErrorRows.length > 0;
  const unpricedCompressionSystemIds = ownerCompressionMode
    ? compressionRows
        .filter((row) => row.owner_kind === 'MEDICAL_SYSTEM'
          && Number(row.future_wrong_uncertain_questions || 0) > 0
          && row.pricing_questions_per_cluster === null)
        .map((row) => row.canonical_id)
    : [];
  const unpricedCompressionDomainIds = ownerCompressionMode
    ? compressionRows
        .filter((row) => row.owner_kind === 'NON_SYSTEM_EXAM_DOMAIN'
          && Number(row.future_wrong_uncertain_questions || 0) > 0
          && row.pricing_questions_per_cluster === null)
        .map((row) => row.canonical_id)
    : [];
  const futureClusters = ownerCompressionMode
    ? (futureWu !== null && unpricedCompressionSystemIds.length === 0 && unpricedCompressionDomainIds.length === 0
        ? compressionRows.reduce((sum, row) => sum + Number(row.predicted_future_clusters || 0), 0)
        : null)
    : (futureWu === 0 ? 0 : futureWu !== null && questionsPerCluster !== null ? futureWu / questionsPerCluster : null);
  const totalClusters = futureClusters !== null ? activeClusters + futureClusters : null;
  const repairCalibrationRows = progress?.repair_evidence?.calibration_samples || [];
  const samples = repairCalibrationRows
    .map((row) => positive(row?.exclusive_repair_timer_minutes))
    .filter((value) => value !== null);
  const mixedWindowSamples = repairCalibrationRows
    .map((row) => positive(row?.timer_minutes_in_repair_window))
    .filter((value) => value !== null);
  const state = sampleState(samples.length);
  const band = totalClusters === 0 ? { p20: 0, p50: 0, p80: 0 } : totalClusters !== null && samples.length >= 3
    ? {
        p20: round(quantile(samples, 0.2) * totalClusters),
        p50: round(quantile(samples, 0.5) * totalClusters),
        p80: round(quantile(samples, 0.8) * totalClusters)
      }
    : null;
  const risks = [];
  if (forecastRate === null) risks.push('WRONG_UNCERTAIN_RATE_UNOBSERVED');
  if (!ownerPricingMode && attempted > 0 && attempted < 30 && scenarioRate === null) risks.push('WRONG_UNCERTAIN_RATE_LOW_SAMPLE');
  if (ownerPricingMode && unpricedSystemIds.length) risks.push('SYSTEM_WRONG_UNCERTAIN_RATE_UNOBSERVED');
  if (ownerPricingMode && unpricedDomainIds.length) risks.push('NON_SYSTEM_DOMAIN_WRONG_UNCERTAIN_RATE_UNOBSERVED');
  if (ownerPricingMode && systemErrorRows.some((row) => row.observed_attempts > 0 && row.observed_attempts < 30)) {
    risks.push('SYSTEM_WRONG_UNCERTAIN_RATE_LOW_SAMPLE');
  }
  if (ownerPricingMode && domainErrorRows.some((row) => row.observed_attempts > 0 && row.observed_attempts < 30)) {
    risks.push('NON_SYSTEM_DOMAIN_WRONG_UNCERTAIN_RATE_LOW_SAMPLE');
  }
  if (rateSpread !== null && rateSpread >= 0.15) risks.push('WRONG_UNCERTAIN_OWNER_HETEROGENEITY');
  if (!ownerCompressionMode && questionsPerCluster === null) risks.push('REPAIR_COMPRESSION_UNOBSERVED');
  if (ownerCompressionMode && unpricedCompressionSystemIds.length) risks.push('SYSTEM_REPAIR_COMPRESSION_UNCALIBRATED');
  if (ownerCompressionMode && unpricedCompressionDomainIds.length) risks.push('NON_SYSTEM_DOMAIN_REPAIR_COMPRESSION_UNCALIBRATED');
  if (ownerCompressionMode && compressionRows.some((row) =>
    row.observed_question_backed_clusters > 0 && row.observed_question_backed_clusters < 3
  )) risks.push('OWNER_REPAIR_COMPRESSION_LOW_SAMPLE');
  if (mixedWindowSamples.length > 0 && samples.length < 3) risks.push('REPAIR_TIMER_CONTAMINATED_MIXED_WINDOW');
  if (samples.length < 3 && totalClusters !== null && totalClusters > 0) risks.push('REPAIR_TIME_UNCALIBRATED');
  return {
    component: 'WRONG_UNCERTAIN_REPAIR',
    required: true,
    status: band ? (samples.length >= 5 ? 'CALIBRATED' : 'PROVISIONAL') : 'UNPRICED_REQUIRED',
    error_rate: {
      source: forecastRateSource,
      value: forecastRate === null ? null : round(forecastRate, 4),
      forecast_weighted_value: forecastRate === null ? null : round(forecastRate, 4),
      observed_attempts: attempted,
      current_scope_attempts: currentScopeAttempted,
      broader_first_pass_attempts: broaderAttempted,
      system_rows: systemErrorRows,
      non_system_domain_rows: domainErrorRows,
      unpriced_system_ids: unpricedSystemIds,
      unpriced_domain_ids: unpricedDomainIds,
      owner_rate_spread: rateSpread
    },
    compression: {
      observed_questions_per_cluster: questionsPerCluster,
      system_rows: compressionRows.filter((row) => row.owner_kind === 'MEDICAL_SYSTEM'),
      non_system_domain_rows: compressionRows.filter((row) => row.owner_kind === 'NON_SYSTEM_EXAM_DOMAIN'),
      unpriced_system_ids: unpricedCompressionSystemIds,
      unpriced_domain_ids: unpricedCompressionDomainIds,
      active_clusters: activeClusters,
      predicted_future_wrong_uncertain_questions: futureWu === null ? null : round(futureWu),
      predicted_future_clusters: futureClusters === null ? null : round(futureClusters, 2),
      total_clusters_to_price: totalClusters === null ? null : round(totalClusters, 2)
    },
    calibration: {
      exclusive_repair_timer_samples: samples.length,
      mixed_window_timer_samples: mixedWindowSamples.length,
      reference_exclusive_minutes_per_cluster: samples.length ? round(median(samples), 3) : null,
      mixed_window_reference_minutes_per_cluster: mixedWindowSamples.length ? round(median(mixedWindowSamples), 3) : null,
      timing_semantics: samples.length
        ? 'EXCLUSIVE_REPAIR_TIMER'
        : mixedWindowSamples.length
          ? 'MIXED_BLOCK_ROUTE_WINDOW_REFERENCE_ONLY'
          : 'UNOBSERVED'
    },
    band_minutes: band,
    risks,
    evidence_boundary:
      'Future Repair pressure uses owner-stratified Current exact-scope first-attempt W/U across medical Systems and independent non-System exam domains. A remaining owner without its own W/U or compression evidence stays unpriced rather than inheriting zero or another owner rate. Scenario overrides intentionally apply one explicit W/U rate across the remaining known scope. Repair workload minutes require exclusive Repair timing; mixed Block-route lifetime windows are reference-only.'
  };
}

function verificationForecast(progress, questionsComponent, repairComponent) {
  const currentUnresolved = Math.max(0, Number(progress?.practice_evidence?.latest?.unresolved_wrong_uncertain_questions || 0));
  const futureWu = finite(repairComponent?.compression?.predicted_future_wrong_uncertain_questions);
  const questions = futureWu === null ? null : currentUnresolved + futureWu;
  const speedRows = [
    ...(questionsComponent?.calibration?.system_rows || []).map((row) => ({ owner_kind: 'MEDICAL_SYSTEM', ...row })),
    ...(questionsComponent?.calibration?.non_system_domain_rows || [])
  ];
  const speedByOwner = new Map(speedRows.map((row) => [
    `${row.owner_kind || 'MEDICAL_SYSTEM'}:${row.canonical_id || ''}`,
    row
  ]));
  const pressureRows = [
    ...(repairComponent?.compression?.system_rows || []),
    ...(repairComponent?.compression?.non_system_domain_rows || [])
  ];
  const pricedRows = pressureRows.map((row) => {
    const speed = speedByOwner.get(`${row.owner_kind || 'MEDICAL_SYSTEM'}:${row.canonical_id || ''}`) || {};
    const rates = (Array.isArray(speed.speed_rates) ? speed.speed_rates : [])
      .map(positive)
      .filter((value) => value !== null);
    const demand = finite(row?.future_wrong_uncertain_questions);
    return {
      owner_kind: row.owner_kind || 'MEDICAL_SYSTEM',
      canonical_id: String(row?.canonical_id || ''),
      verification_questions: demand,
      timing_samples: rates.length,
      band_minutes: demand !== null && demand <= 0
        ? { p20: 0, p50: 0, p80: 0 }
        : demand !== null && rates.length >= 3
          ? {
              p20: round(quantile(rates, 0.2) * demand),
              p50: round(quantile(rates, 0.5) * demand),
              p80: round(quantile(rates, 0.8) * demand)
            }
          : null
    };
  });
  const ownerDemandUnpriced = pricedRows.some((row) => Number(row.verification_questions || 0) > 0 && !row.band_minutes);
  const ownerReferenceBand = questions !== null
    && currentUnresolved === 0
    && !ownerDemandUnpriced
    && pricedRows.length > 0
    ? {
        p20: round(pricedRows.reduce((sum, row) => sum + Number(row.band_minutes?.p20 || 0), 0)),
        p50: round(pricedRows.reduce((sum, row) => sum + Number(row.band_minutes?.p50 || 0), 0)),
        p80: round(pricedRows.reduce((sum, row) => sum + Number(row.band_minutes?.p80 || 0), 0))
      }
    : null;
  const pooledRates = (questionsComponent?.calibration?.sample_rows || [])
    .map((row) => positive(row.minutes_per_attempt)).filter((value) => value !== null);
  const legacyReference = pressureRows.length === 0 && questions !== null && pooledRates.length >= 3
    ? Object.fromEntries([['p20', 0.2], ['p50', 0.5], ['p80', 0.8]].map(([key, q]) => [key, round(quantile(pooledRates, q) * questions)]))
    : null;
  const referenceBand = questions === 0 ? { p20: 0, p50: 0, p80: 0 } : ownerReferenceBand || legacyReference;
  const risks = [];
  if (questions === null) risks.push('VERIFICATION_VOLUME_UNPRICED');
  if (currentUnresolved > 0 && pressureRows.length > 0) risks.push('CURRENT_UNRESOLVED_OWNER_DISTRIBUTION_UNPRICED');
  if (ownerDemandUnpriced) risks.push('VERIFICATION_OWNER_SPEED_UNCALIBRATED');
  if (referenceBand && questions > 0) risks.push('FRESH_VERIFICATION_TIMING_NOT_OBSERVED');
  return {
    component: 'SECOND_PASS_FRESH_VERIFICATION',
    required_for_first_round: false,
    required_for_score_formation: true,
    status: questions === 0 ? 'NO_REMAINING_DEMAND' : referenceBand ? 'PROVISIONAL_REFERENCE' : 'UNPRICED_REQUIRED',
    estimated_verification_questions: questions === null ? null : round(questions),
    timing_basis: questions === 0 ? 'NO_REMAINING_DEMAND' : ownerReferenceBand ? 'OWNER_FIRST_PASS_TIMING_REFERENCE' : legacyReference ? 'POOLED_FIRST_PASS_REFERENCE_ONLY' : 'UNPRICED',
    owner_rows: pricedRows,
    band_minutes: referenceBand,
    risks,
    evidence_boundary:
      'Repair completion is not fresh verification. Verification demand follows unresolved/future Wrong-Uncertain evidence. Owner-specific first-pass timing may provide a clearly provisional workload reference, but it is not claimed as observed fresh-verification duration; pooled timing may not erase owner heterogeneity.'
  };
}

function formalCalibrationForecast(progress) {
  const papers = Array.isArray(progress?.formal_score_evidence?.sealed_papers)
    ? progress.formal_score_evidence.sealed_papers
    : [];
  const comparable = papers.filter((row) => Number(row?.max_score) === 300 && row?.current_revision_valid !== false);
  const internallyProtected = comparable.filter((row) => row?.internal_holdout_protected_before_seal === true);
  return {
    component: 'FORMAL_SCORE_CALIBRATION',
    required_for_first_round: false,
    required_for_score_formation: true,
    status: internallyProtected.length > 0
      ? 'INTERNAL_HOLDOUT_CALIBRATION_PRESENT'
      : comparable.length > 0
        ? 'OBSERVED_SCORE_ONLY_CONTAMINATION_UNRESOLVED'
        : 'UNPRICED_REQUIRED',
    completed_300_point_papers: comparable.length,
    internally_holdout_protected_papers: internallyProtected.length,
    latest: internallyProtected.at(-1) || comparable.at(-1) || null,
    band_minutes: internallyProtected.length > 0 ? { p20: 0, p50: 0, p80: 0 } : null,
    unpriced_if_missing: internallyProtected.length === 0,
    evidence_boundary:
      'A sealed score is always observed evidence, but score-formation calibration requires at least an internally Holdout-protected full paper or an externally justified fresh-equivalent calibration. Internal Holdout proves only KianOS non-exposure before seal; it does not prove external non-exposure.'
  };
}

function aggregateComponents(components, { scopeComplete = true } = {}) {
  const required = (Array.isArray(components) ? components : []).filter(Boolean);
  const priced = required.filter((row) => row?.band_minutes
    && finite(row.band_minutes.p20) !== null
    && finite(row.band_minutes.p50) !== null
    && finite(row.band_minutes.p80) !== null);
  const unpriced = required.filter((row) => !priced.includes(row)).map((row) => row.component);
  const sum = (key) => round(priced.reduce((total, row) => total + Number(row.band_minutes[key] || 0), 0));
  return {
    status: unpriced.length === 0 && scopeComplete ? 'FULLY_PRICED' : 'PARTIAL',
    scope_complete: Boolean(scopeComplete),
    priced_components: priced.map((row) => row.component),
    unpriced_components: unpriced,
    known_priced_band_minutes: priced.length ? {
      p20: sum('p20'),
      p50: sum('p50'),
      p80: sum('p80')
    } : null,
    full_band_minutes: unpriced.length === 0 && scopeComplete ? {
      p20: sum('p20'),
      p50: sum('p50'),
      p80: sum('p80')
    } : null
  };
}

export function buildXizongWorkloadForecast(progress, {
  wrongUncertainRate = null
} = {}) {
  if (!progress || progress.schema !== 'kianos.xizong.forecast-progress.v1') {
    throw new Error('XIZONG_FORECAST_PROGRESS_REQUIRED');
  }
  const knowledge = knowledgeForecast(progress);
  const questions = questionForecast(progress);
  const recall = recallForecast(progress);
  const repair = repairForecast(progress, { wrongUncertainRate });
  const verification = verificationForecast(progress, questions, repair);
  const formalCalibration = formalCalibrationForecast(progress);
  const questionScopeComplete = progress?.question_workload?.status === 'EXACT_COMPLETE';

  const firstRound = aggregateComponents(
    [knowledge, questions, recall, repair],
    { scopeComplete: questionScopeComplete }
  );
  const scoreFormation = aggregateComponents(
    [knowledge, questions, recall, repair, verification, formalCalibration],
    { scopeComplete: questionScopeComplete }
  );

  const risks = [...new Set([
    ...(knowledge.risks || []),
    ...(questions.risks || []),
    ...(recall.risks || []),
    ...(repair.risks || []),
    ...(verification.risks || []),
    ...(questionScopeComplete ? [] : ['EXACT_QUESTION_SCOPE_INCOMPLETE']),
    ...(formalCalibration.unpriced_if_missing ? ['FORMAL_SCORE_CALIBRATION_MISSING'] : [])
  ])];

  return {
    schema: XIZONG_FORECAST_MODEL_SCHEMA,
    semantics: 'WORKLOAD_ESTIMATOR_NOT_STRATEGY_ENGINE',
    components: {
      knowledge,
      questions,
      system_recall: recall,
      repair,
      verification,
      formal_calibration: formalCalibration
    },
    first_round: firstRound,
    score_formation: scoreFormation,
    risks,
    evidence_maturity: {
      knowledge: knowledge.status,
      questions: questions.status,
      repair: repair.status,
      recall: recall.status
    },
    model_boundary:
      'Planning P20/P50/P80 are empirical workload bands under current evidence, not guaranteed probabilities. Missing components remain unpriced; Website/Runtime must not convert this estimator into subject allocation or next-action strategy.'
  };
}

export function buildXizongScoreEvidence(progress, {
  targetScore = 275,
  contaminationStatus = 'UNKNOWN',
  materialGaps = [],
  currentExamFormatSourceHash = null
} = {}) {
  if (!progress || progress.schema !== 'kianos.xizong.forecast-progress.v1') {
    throw new Error('XIZONG_FORECAST_PROGRESS_REQUIRED');
  }
  const requirement = buildXizongHighScoreRequirement({ targetScore });
  const formalPapers = (progress?.formal_score_evidence?.sealed_papers || [])
    .filter((row) => Number(row?.max_score) === 300);
  const latest = formalPapers.at(-1) || null;
  const formatIdentifiedPapers = formalPapers.filter((row) =>
    row?.current_revision_valid !== false
    &&     String(row?.exam_format_source_hash || '').trim()
    && String(row?.question_inventory_hash || '').trim()
    && Number(row?.exam_format?.max_score || row?.max_score || 0) === 300
    && Number(row?.exam_format?.question_count || 0) > 0
  );
  const internallyProtectedPapers = formalPapers
    .filter((row) => row?.internal_holdout_protected_before_seal === true);
  const internallyProtectedFormatIdentifiedPapers = formatIdentifiedPapers
    .filter((row) => row?.internal_holdout_protected_before_seal === true);

  const recall = progress?.runtime_evidence?.recall || {};
  const rated = Math.max(0, Number(recall?.rated || 0));
  const weakRecall = Math.max(0, Number(recall?.unknown || 0) + Number(recall?.fuzzy || 0));
  const systemRecallRows = progress?.system_recall_evidence || [];
  const precision = progress?.memory_evidence?.precision || {};
  const transfer = progress?.practice_evidence?.fresh_transfer || {};
  const qWork = progress?.question_workload || {};
  const firstPass = progress?.practice_evidence?.first_pass || {};
  const hardGaps = (Array.isArray(materialGaps) ? materialGaps : [])
    .filter((row) => String(row?.severity || '').toUpperCase() === 'HARD');
  const transferByKind = transfer?.by_probe_kind_status || {};
  const dedicatedCaseRows = Object.entries(transferByKind)
    .filter(([kind]) => /CASE|CROSS_SYSTEM/i.test(String(kind || '')))
    .map(([kind, row]) => ({
      probe_kind: String(kind),
      observed: Math.max(0, Number(row?.observed || 0)),
      stable: Math.max(0, Number(row?.stable || 0)),
      uncertain: Math.max(0, Number(row?.uncertain || 0)),
      wrong: Math.max(0, Number(row?.wrong || 0))
    }));
  const dedicatedCaseTotals = dedicatedCaseRows.reduce((acc, row) => ({
    observed: acc.observed + row.observed,
    stable: acc.stable + row.stable,
    uncertain: acc.uncertain + row.uncertain,
    wrong: acc.wrong + row.wrong
  }), { observed: 0, stable: 0, uncertain: 0, wrong: 0 });

  const capabilities = {
    source_model: {
      evidence_status: Number(progress?.runtime_evidence?.completed_blocks || 0) === Number(progress?.canonical_scope?.blocks || 0)
        ? 'FULL_RUNTIME_CLOSURE_OBSERVED'
        : 'PARTIAL_OR_UNKNOWN',
      completed_blocks: Number(progress?.runtime_evidence?.completed_blocks || 0),
      canonical_blocks: Number(progress?.canonical_scope?.blocks || 0),
      boundary: 'No runtime evidence does not prove unstudied.'
    },
    active_recall: {
      evidence_status: rated > 0 ? 'OBSERVED' : 'UNKNOWN',
      rated_kp: rated,
      weak_rated_kp: weakRecall,
      weak_rate_among_rated: rated > 0 ? round(weakRecall / rated, 4) : null
    },
    structural_reconstruction: {
      evidence_status: systemRecallRows.length ? 'OBSERVED' : 'UNKNOWN',
      systems: systemRecallRows.length,
      pre_question_observed: systemRecallRows.filter((row) => row?.pre_question_recall_observed).length,
      post_first_pass_observed: systemRecallRows.filter((row) => row?.post_first_pass_recall_observed).length
    },
    precision: {
      evidence_status: Number(precision?.cards || 0) > 0 ? 'SELECTIVE_EVIDENCE_PRESENT' : 'UNKNOWN_OR_NOT_ADMITTED',
      cards: Number(precision?.cards || 0),
      weak: Number(precision?.weak || 0),
      due_weak: Number(precision?.due_weak || 0),
      due_delayed: Number(precision?.due_delayed || 0),
      stable_waiting: Number(precision?.stable_waiting || 0),
      boundary: 'Only selectively admitted Precision is measured; zero cards never proves precision mastery.'
    },
    official_application: {
      evidence_status: Number(firstPass?.attempted_questions || 0) > 0 ? 'OBSERVED' : 'UNKNOWN',
      first_pass_attempted: Number(firstPass?.attempted_questions || 0),
      current_scope_attempted: Number(firstPass?.current_scope_eligible_attempted_questions || 0),
      known_eligible_questions: finite(qWork?.exact_union_eligible_questions),
      wrong_uncertain_rate: finite(firstPass?.wrong_or_uncertain_rate),
      boundary: qWork?.known_remaining_is_lower_bound ? 'KNOWN_SCOPE_LOWER_BOUND' : 'CURRENT_EXACT_SCOPE'
    },
    repair_fresh_verification: {
      evidence_status: Number(progress?.repair_evidence?.total_repair_clusters || 0) > 0 ? 'REPAIR_EVIDENCE_PRESENT' : 'UNKNOWN_OR_NONE_OBSERVED',
      active_clusters: Number(progress?.repair_evidence?.active_repair_clusters || 0),
      completed_clusters: Number(progress?.repair_evidence?.completed_repair_clusters || 0),
      unresolved_wrong_uncertain_questions: Number(progress?.practice_evidence?.latest?.unresolved_wrong_uncertain_questions || 0),
      boundary: 'DONE repair is not mastery; later fresh application remains the stronger evidence.'
    },
    fresh_transfer: {
      evidence_status: Number(transfer?.observed_probes || 0) > 0 ? 'OBSERVED_SUPPLEMENTARY' : 'UNKNOWN',
      observed_probes: Number(transfer?.observed_probes || 0),
      stable: Number(transfer?.stable || 0),
      uncertain: Number(transfer?.uncertain || 0),
      wrong: Number(transfer?.wrong || 0),
      boundary: 'AI transfer probes are supplementary and never formal score truth.'
    },
    case_stability: {
      evidence_status: dedicatedCaseTotals.observed > 0
        ? 'DEDICATED_CASE_TRANSFER_OBSERVED'
        : formalPapers.length > 0
          ? 'WHOLE_PAPER_PROXY_PRESENT'
          : 'UNKNOWN',
      dedicated_case_evidence: dedicatedCaseTotals.observed > 0,
      observed_probes: dedicatedCaseTotals.observed,
      stable: dedicatedCaseTotals.stable,
      uncertain: dedicatedCaseTotals.uncertain,
      wrong: dedicatedCaseTotals.wrong,
      probe_kinds: dedicatedCaseRows,
      boundary:
        'Whole-paper performance is only a proxy for case/cross-System stability. Dedicated case/cross-System transfer requires separately typed fresh-transfer probes and remains supplementary rather than formal score truth.'
    },
    whole_paper_execution: {
      evidence_status: formalPapers.length > 0 ? 'FORMAL_EVIDENCE_PRESENT' : 'MISSING',
      sealed_300_point_papers: formalPapers.length,
      latest
    }
  };

  const contamination = String(contaminationStatus || 'UNKNOWN').toUpperCase();
  const freshEquivalent = contamination === 'FRESH_EQUIVALENT';
  const lowContamination = ['LEAST_CONTAMINATED','LOW','FRESH_EQUIVALENT'].includes(contamination);
  const knownContamination = ['KNOWN_PRIOR_EXPOSURE','HIGH','CONTAMINATED'].includes(contamination);
  const historicalCalibrationPapers = freshEquivalent
    ? formatIdentifiedPapers
    : lowContamination
      ? internallyProtectedFormatIdentifiedPapers
      : [];
  const currentFormatHash = String(
    currentExamFormatSourceHash
    || progress?.current_exam_format?.source_hash
    || ''
  ).trim();
  const calibrationPapers = currentFormatHash
    ? historicalCalibrationPapers.filter((row) =>
        String(row?.exam_format_source_hash || '') === currentFormatHash
      )
    : [];
  const observedScores = formalPapers
    .map((row) => Number(row?.earned_score))
    .filter(Number.isFinite);
  const historicalCalibrationScores = historicalCalibrationPapers
    .map((row) => Number(row?.earned_score))
    .filter(Number.isFinite);
  const calibrationScores = calibrationPapers
    .map((row) => Number(row?.earned_score))
    .filter(Number.isFinite);
  const observedBand = observedScores.length >= 3 ? {
    p20: round(quantile(observedScores, 0.2)),
    p50: round(quantile(observedScores, 0.5)),
    p80: round(quantile(observedScores, 0.8))
  } : null;
  const historicalCalibrationBand = historicalCalibrationScores.length >= 3 ? {
    p20: round(quantile(historicalCalibrationScores, 0.2)),
    p50: round(quantile(historicalCalibrationScores, 0.5)),
    p80: round(quantile(historicalCalibrationScores, 0.8))
  } : null;
  const calibrationBand = calibrationScores.length >= 3 ? {
    p20: round(quantile(calibrationScores, 0.2)),
    p50: round(quantile(calibrationScores, 0.5)),
    p80: round(quantile(calibrationScores, 0.8))
  } : null;

  let scoreEstimateStatus = 'NOT_READY';
  if (formalPapers.length === 1) scoreEstimateStatus = 'REFERENCE_ONLY';
  else if (formalPapers.length === 2) scoreEstimateStatus = 'MULTI_REFERENCE_NO_EMPIRICAL_BAND';
  else if (formalPapers.length >= 3) scoreEstimateStatus = 'EMPIRICAL_BAND';
  if (formalPapers.length && contamination === 'UNKNOWN') scoreEstimateStatus += '_CONTAMINATION_UNKNOWN';
  else if (formalPapers.length && knownContamination) scoreEstimateStatus += '_KNOWN_CONTAMINATION';
  else if (formalPapers.length && lowContamination && historicalCalibrationPapers.length === 0) {
    scoreEstimateStatus += '_LOW_CONTAMINATION_WITHOUT_IDENTIFIED_PROTECTED_CALIBRATION';
  } else if (formalPapers.length && lowContamination && !currentFormatHash) {
    scoreEstimateStatus += '_CURRENT_FORMAT_UNKNOWN';
  } else if (formalPapers.length && lowContamination && calibrationPapers.length === 0) {
    scoreEstimateStatus += '_CURRENT_FORMAT_MISMATCH';
  } else if (formalPapers.length && lowContamination) {
    scoreEstimateStatus += '_LOW_CONTAMINATION_CURRENT_FORMAT';
  }

  const scoreExtrapolationReady = Boolean(calibrationBand) && lowContamination && Boolean(currentFormatHash);
  const evidenceResult = hardGaps.length > 0 || formalPapers.length === 0
    ? 'INSUFFICIENT_SCORE_EVIDENCE'
    : scoreExtrapolationReady
      ? 'SCORE_ESTIMATE_EVIDENCE_USABLE'
      : 'SCORE_EVIDENCE_PRESENT_LOW_CONFIDENCE';

  return {
    schema: 'kianos.xizong.score-evidence.v1',
    requirement,
    formal_score: {
      status: scoreEstimateStatus,
      sample_count: formalPapers.length,
      calibration_sample_count: calibrationPapers.length,
      historical_calibration_sample_count: historicalCalibrationPapers.length,
      format_identified_sample_count: formatIdentifiedPapers.length,
      internally_holdout_protected_sample_count: internallyProtectedPapers.length,
      latest_score: latest ? Number(latest.earned_score) : null,
      latest_target_gap: latest ? round(requirement.target_score - Number(latest.earned_score || 0)) : null,
      empirical_band: observedBand,
      historical_calibration_band: historicalCalibrationBand,
      calibration_band: calibrationBand,
      contamination_status: contamination,
      current_exam_format_source_hash: currentFormatHash || null,
      current_format_compatibility: !currentFormatHash
        ? 'UNKNOWN_CURRENT_YEAR_FORMAT'
        : calibrationPapers.length
          ? 'MATCHED'
          : 'NO_MATCHING_CALIBRATION',
      score_extrapolation_ready: scoreExtrapolationReady,
      observed_score_is_not_fresh_prediction: formalPapers.length > 0 && !scoreExtrapolationReady,
      discipline_breakdown: latest?.discipline_breakdown || null
    },
    capabilities,
    material_gaps: Array.isArray(materialGaps) ? materialGaps : [],
    hard_material_gaps: hardGaps,
    evidence_readiness: {
      coverage_ready: hardGaps.length === 0,
      formal_score_evidence_ready: formalPapers.length > 0,
      observed_empirical_band_ready: Boolean(observedBand),
      historical_calibration_band_ready: Boolean(historicalCalibrationBand),
      calibration_band_ready: Boolean(calibrationBand),
      current_format_identity_ready: Boolean(currentFormatHash),
      score_extrapolation_ready: scoreExtrapolationReady,
      result: evidenceResult
    },
    subject_maturity_claim: 'OUT_OF_SCOPE',
    boundary:
      'Work completion and capability evidence do not manufacture predicted score. Formal scores remain observed evidence even when contaminated, so empirical_band is descriptive only. Historical low-contamination papers may form historical_calibration_band, but current calibration_band additionally requires format identity matching the Current exam-format Source hash. If the Current-year geometry/format Source is unavailable, score extrapolation remains low-confidence instead of treating historical geometry as Current truth. Internal Holdout never proves external non-exposure; no arbitrary contamination point penalty is invented. This object reports score-evidence usability only and never declares Xizong subject maturity or Stage closure.'
  };
}

const XIZONG_COMPRESSION_PROTECTED = new Set([
  'FIRST_PASS_SOURCE_CONTACT',
  'FIRST_PASS_ACTIVE_RECALL',
  'BLOCK_RECALL',
  'SYSTEM_RECALL',
  'CURRENT_SCOPE_OFFICIAL_SWEEP',
  'WRONG_UNCERTAIN_REPAIR',
  'FRESH_VERIFICATION',
  'HARD_COVERAGE',
  'FORMAL_SCORE_CALIBRATION'
]);

const XIZONG_COMPRESSION_ADMISSIBLE = new Set([
  'DUPLICATE_SOURCE',
  'CURRENT_YEAR_REPLACEMENT',
  'STABLE_SECOND_PASS_REPETITION',
  'REPAIR_CLUSTER_DEDUP',
  'OPTIONAL_LOW_VALUE',
  'MATERIAL_OVERLAP'
]);

export function auditXizongCompressionProposals(proposals = []) {
  const rows = (Array.isArray(proposals) ? proposals : []).map((row, index) => {
    const kind = String(row?.kind || '').toUpperCase();
    const target = String(row?.target || '').toUpperCase();
    const minutes = Math.max(0, Number(row?.minutes || 0));
    let decision = 'REVIEW_REQUIRED';
    let reason = 'UNCLASSIFIED_COMPRESSION';
    if (XIZONG_COMPRESSION_PROTECTED.has(target)) {
      decision = 'REJECT';
      reason = 'PROTECTED_CAPABILITY_OR_EVIDENCE';
    } else if (XIZONG_COMPRESSION_ADMISSIBLE.has(kind)) {
      decision = 'ALLOW';
      reason = 'DEDUP_OR_LOW_VALUE_COMPRESSION';
    }
    return {
      id: String(row?.id || `compression-${index + 1}`),
      kind,
      target,
      minutes,
      decision,
      reason,
      replacement_evidence: String(row?.replacement_evidence || '')
    };
  });
  return {
    schema: 'kianos.xizong.compression-audit.v1',
    proposals: rows,
    allowed_minutes: rows.filter((row) => row.decision === 'ALLOW').reduce((sum,row)=>sum+row.minutes,0),
    rejected_minutes: rows.filter((row) => row.decision === 'REJECT').reduce((sum,row)=>sum+row.minutes,0),
    review_required_minutes: rows.filter((row) => row.decision === 'REVIEW_REQUIRED').reduce((sum,row)=>sum+row.minutes,0),
    safe: rows.every((row) => row.decision !== 'REJECT'),
    boundary:
      'Compression may remove duplication/replaced/low-value work; it may not manufacture feasibility by deleting required first-pass learning, official coverage, Repair verification, hard coverage or formal score calibration.'
  };
}

export function classifyXizongMaterialGaps(gaps = []) {
  const rows = (Array.isArray(gaps) ? gaps : []).map((row, index) => {
    const type = String(row?.type || row?.kind || 'UNSPECIFIED').toUpperCase();
    const severity = String(row?.severity || '').toUpperCase()
      || (type === 'HARD_COVERAGE_GAP' ? 'HARD' : 'BOUNDED');
    const blocksCoverage = type === 'HARD_COVERAGE_GAP';
    const blocksForecast = ['HARD_COVERAGE_GAP','ROUTING_FORECAST_GAP','CURRENT_YEAR_DELTA_GAP'].includes(type)
      && row?.resolved !== true;
    return {
      id: String(row?.id || `gap-${index + 1}`),
      type,
      severity,
      resolved: row?.resolved === true,
      points_at_risk: finite(row?.points_at_risk),
      workload_minutes: finite(row?.workload_minutes),
      blocks_coverage_readiness: blocksCoverage && row?.resolved !== true,
      blocks_full_forecast: blocksForecast,
      note: String(row?.note || '')
    };
  });
  const unresolved = rows.filter((row) => !row.resolved);
  return {
    schema: 'kianos.xizong.material-gap-audit.v1',
    gaps: rows,
    unresolved_gap_ids: unresolved.map((row) => row.id),
    hard_coverage_gap_ids: unresolved.filter((row) => row.blocks_coverage_readiness).map((row) => row.id),
    forecast_gap_ids: unresolved.filter((row) => row.blocks_full_forecast).map((row) => row.id),
    current_year_delta_gap_ids: unresolved.filter((row) => row.type === 'CURRENT_YEAR_DELTA_GAP').map((row) => row.id),
    routing_gap_ids: unresolved.filter((row) => row.type === 'ROUTING_FORECAST_GAP').map((row) => row.id),
    optional_delta_gap_ids: unresolved.filter((row) => row.type === 'OPTIONAL_DELTA_GAP').map((row) => row.id),
    coverage_ready: unresolved.every((row) => !row.blocks_coverage_readiness),
    full_forecast_material_ready: unresolved.every((row) => !row.blocks_full_forecast),
    boundary:
      'Coverage gaps, current-year deltas, routing gaps and optional deltas are distinct. Routing uncertainty never implies missing medical knowledge, and optional material is not debt until admitted.'
  };
}

export function buildXizongForecastLoop(progress, {
  targetScore = 275,
  contaminationStatus = 'UNKNOWN',
  materialGaps = [],
  wrongUncertainRate = null,
  dailyMinutes = null,
  startDay = null,
  capacityMinutesByDay = null,
  materialItems = null
} = {}) {
  if (!progress || progress.schema !== 'kianos.xizong.forecast-progress.v1') {
    throw new Error('XIZONG_FORECAST_PROGRESS_REQUIRED');
  }
  const materials = classifyXizongMaterialGaps(materialGaps);
  const workload = buildXizongWorkloadForecast(progress, { wrongUncertainRate });
  const score = buildXizongScoreEvidence(progress, {
    targetScore,
    contaminationStatus,
    materialGaps: materials.gaps.map((row) => ({
      ...row,
      severity: row.blocks_coverage_readiness ? 'HARD' : row.severity
    }))
  });
  const scenario = applyXizongForecastScenario(workload, {
    dailyMinutes,
    startDay,
    capacityMinutesByDay,
    materialItems
  });

  const uncertainty = [];
  if (!materials.coverage_ready) uncertainty.push('HARD_MATERIAL_COVERAGE_INCOMPLETE');
  if (!materials.full_forecast_material_ready) uncertainty.push('MATERIAL_OR_ROUTING_SCOPE_UNPRICED');
  if (workload.first_round.status !== 'FULLY_PRICED') uncertainty.push('FIRST_ROUND_WORKLOAD_PARTIAL');
  if (workload.score_formation.status !== 'FULLY_PRICED') uncertainty.push('SCORE_FORMATION_WORKLOAD_PARTIAL');
  if (!score.evidence_readiness.formal_score_evidence_ready) uncertainty.push('FORMAL_SCORE_EVIDENCE_MISSING');
  if (!score.evidence_readiness.score_extrapolation_ready && score.evidence_readiness.formal_score_evidence_ready) {
    uncertainty.push('SCORE_EXTRAPOLATION_LOW_CONFIDENCE');
  }
  if (scenario.first_round.status === 'UNPRICED') uncertainty.push('CAPACITY_OR_MATERIAL_SCENARIO_UNPRICED');
  if (score?.capabilities?.case_stability?.dedicated_case_evidence !== true) uncertainty.push('DEDICATED_CASE_TRANSFER_UNKNOWN');
  if (score?.capabilities?.precision?.evidence_status === 'UNKNOWN_OR_NOT_ADMITTED') uncertainty.push('PRECISION_EVIDENCE_UNKNOWN_OR_NOT_ADMITTED');

  const calibration = {
    knowledge_backtest: String(workload?.components?.knowledge?.calibration?.rolling_backtest?.status || 'INSUFFICIENT_BACKTEST'),
    question_backtest: String(workload?.components?.questions?.calibration?.rolling_backtest?.status || 'INSUFFICIENT_BACKTEST'),
    repair_time_samples: Number(workload?.components?.repair?.calibration?.exclusive_repair_timer_samples || 0),
    knowledge_sample_systems: Array.isArray(workload?.components?.knowledge?.calibration?.sample_systems)
      ? workload.components.knowledge.calibration.sample_systems.length
      : 0
  };
  const empiricalCalibrationReady =
    calibration.knowledge_backtest === 'BACKTESTED'
    && calibration.question_backtest === 'BACKTESTED'
    && calibration.repair_time_samples >= 3
    && calibration.knowledge_sample_systems >= 2;
  if (!empiricalCalibrationReady) uncertainty.push('EMPIRICAL_FORECAST_CALIBRATION_INCOMPLETE');

  let forecastState = 'DEFENSIBLE_FORECAST';
  if (!materials.coverage_ready) forecastState = 'COVERAGE_INCOMPLETE';
  else if (workload.first_round.status !== 'FULLY_PRICED') forecastState = 'WORKLOAD_PARTIAL';
  else if (!empiricalCalibrationReady) forecastState = 'CALIBRATING';
  else if (!score.evidence_readiness.formal_score_evidence_ready) forecastState = 'SCORE_EVIDENCE_MISSING';
  else if (!score.evidence_readiness.score_extrapolation_ready) forecastState = 'SCORE_LOW_CONFIDENCE';
  else if (workload.score_formation.status !== 'FULLY_PRICED') forecastState = 'SCORE_FORMATION_PARTIAL';

  return {
    schema: 'kianos.xizong.forecast-loop.v1',
    target: buildXizongHighScoreRequirement({ targetScore }),
    materials,
    workload,
    score,
    scenario,
    calibration,
    empirical_calibration_ready: empiricalCalibrationReady,
    uncertainty: [...new Set(uncertainty)],
    forecast_state: forecastState,
    subject_stage_decision: 'OUT_OF_SCOPE',
    model_logic_validation: 'CI_GATED_EXTERNALLY',
    loop_boundary:
      'Model logic validation and Forecast-state maturity are separate from Xizong subject maturity. CI can validate fail-closed logic while sparse learner evidence still leaves the estimate CALIBRATING or UNKNOWN. This loop does not advance Stage B/C/D, allocate cross-subject time, choose the next subject, or convert coverage completion into score truth.'
  };
}

export function reconcileXizongMaterialIncrement(items = []) {
  const rows = (Array.isArray(items) ? items : []).map((row, index) => {
    const gross = finite(row?.gross_minutes);
    const replacement = Math.max(0, Number(row?.replaces_minutes || 0));
    const overlap = Math.max(0, Number(row?.overlap_minutes || 0));
    const admitted = row?.admitted !== false;
    const net = gross === null || !admitted ? null : Math.max(0, gross - replacement - overlap);
    return {
      id: String(row?.id || `material-${index + 1}`),
      admitted,
      gross_minutes: gross,
      replaces_minutes: replacement,
      overlap_minutes: overlap,
      net_minutes: net,
      status: !admitted ? 'REJECTED' : gross === null ? 'UNPRICED' : 'PRICED'
    };
  });
  const admitted = rows.filter((row) => row.admitted);
  const unpriced = admitted.filter((row) => row.net_minutes === null);
  return {
    schema: 'kianos.xizong.material-increment.v1',
    items: rows,
    status: unpriced.length ? 'PARTIAL' : 'PRICED',
    net_minutes: unpriced.length ? null : round(admitted.reduce((sum,row)=>sum+Number(row.net_minutes||0),0)),
    unpriced_item_ids: unpriced.map((row) => row.id),
    boundary:
      'Current-year case/cram/biochemistry/five-hour assets enter as deduplicated net workload. Replacement and overlap are subtracted before forecast; raw duration is never blindly stacked.'
  };
}

function addDays(day, offset) {
  const match = String(day || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  date.setUTCDate(date.getUTCDate() + Number(offset || 0));
  return date.toISOString().slice(0, 10);
}

function projectMinutesAcrossCapacity(minutes, {
  startDay = null,
  dailyMinutes = null,
  capacityMinutesByDay = null,
  maxDays = 180
} = {}) {
  const need = Math.max(0, Number(minutes || 0));
  const fallback = positive(dailyMinutes);
  if (!startDay) return { days: fallback ? Math.ceil(need / fallback) : null, date: null, remaining_minutes: null };
  let remaining = need;
  for (let index = 0; index < maxDays; index += 1) {
    const day = addDays(startDay, index);
    const specific = recordLike(capacityMinutesByDay) ? finite(capacityMinutesByDay[day]) : null;
    const capacity = specific === null ? fallback : Math.max(0, specific);
    if (capacity === null) return { days: null, date: null, remaining_minutes: remaining };
    remaining -= capacity;
    if (remaining <= 0) return { days: index + 1, date: day, remaining_minutes: 0 };
  }
  return { days: null, date: null, remaining_minutes: round(Math.max(0, remaining)) };
}

function recordLike(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function daySpanInclusive(startDay, endDay) {
  const start = Date.parse(String(startDay || '') + 'T00:00:00Z');
  const end = Date.parse(String(endDay || '') + 'T00:00:00Z');
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  return Math.floor((end - start) / 86400000) + 1;
}

function capacityThroughDeadline({
  startDay,
  deadlineDay,
  dailyMinutes = null,
  capacityMinutesByDay = null
} = {}) {
  const days = daySpanInclusive(startDay, deadlineDay);
  if (days === null) return null;
  const fallback = positive(dailyMinutes);
  let total = 0;
  for (let index = 0; index < days; index += 1) {
    const day = addDays(startDay, index);
    const specific = recordLike(capacityMinutesByDay) ? finite(capacityMinutesByDay[day]) : null;
    const capacity = specific === null ? fallback : Math.max(0, specific);
    if (capacity === null) return null;
    total += capacity;
  }
  return { days, minutes: round(total) };
}

export function assessXizongDeadlineFeasibility(forecast, {
  startDay,
  deadlineDay,
  dailyMinutes = null,
  capacityMinutesByDay = null,
  netIncrementMinutes = 0,
  materialItems = null,
  scope = 'score_formation'
} = {}) {
  if (!forecast || forecast.schema !== XIZONG_FORECAST_MODEL_SCHEMA) {
    throw new Error('XIZONG_FORECAST_MODEL_REQUIRED');
  }
  const scenario = applyXizongForecastScenario(forecast, {
    dailyMinutes,
    startDay,
    capacityMinutesByDay,
    netIncrementMinutes,
    materialItems
  });
  const target = scope === 'first_round' ? scenario.first_round : scenario.score_formation;
  const capacity = capacityThroughDeadline({ startDay, deadlineDay, dailyMinutes, capacityMinutesByDay });
  if (!capacity || !target?.band_minutes) {
    return {
      schema: 'kianos.xizong.deadline-feasibility.v1',
      scope,
      start_day: startDay || null,
      deadline_day: deadlineDay || null,
      status: 'UNPRICED',
      capacity,
      band_minutes: target?.band_minutes || null,
      fit: null,
      known_lower_bound_fit: null,
      required_average_minutes_per_day: null,
      full_scope: Boolean(target?.full_scope)
    };
  }
  const fit = Object.fromEntries(
    ['p20','p50','p80'].map((key) => [key, Number(target.band_minutes[key] || 0) <= capacity.minutes])
  );
  if (!target.full_scope) {
    return {
      schema: 'kianos.xizong.deadline-feasibility.v1',
      scope,
      start_day: startDay,
      deadline_day: deadlineDay,
      status: 'UNPRICED',
      capacity,
      band_minutes: target.band_minutes,
      fit: null,
      known_lower_bound_fit: fit,
      required_average_minutes_per_day: null,
      full_scope: false,
      boundary:
        'Known-priced lower-bound work may fit, but unresolved scope forbids a whole-scope completion claim. Deadline feasibility stays UNPRICED until all required workload is priced.'
    };
  }
  const requiredAverage = Object.fromEntries(
    ['p20','p50','p80'].map((key) => [
      key,
      capacity.days > 0 ? round(Number(target.band_minutes[key] || 0) / capacity.days, 1) : null
    ])
  );
  let status = 'P80_FITS';
  if (!fit.p20) status = 'EVEN_P20_DOES_NOT_FIT';
  else if (!fit.p50) status = 'P20_ONLY_FITS';
  else if (!fit.p80) status = 'P50_FITS_P80_DOES_NOT';
  return {
    schema: 'kianos.xizong.deadline-feasibility.v1',
    scope,
    start_day: startDay,
    deadline_day: deadlineDay,
    status,
    capacity,
    band_minutes: target.band_minutes,
    fit,
    known_lower_bound_fit: null,
    required_average_minutes_per_day: requiredAverage,
    full_scope: true,
    boundary:
      'The deadline is a capacity constraint, not a completion target invented by calendar. UNPRICED scope remains unknown; fit classification never deletes protected work to make a date look feasible.'
  };
}


export function buildXizongCheckpointRequirement(forecast, {
  startDay,
  deadlineDay,
  dailyMinutes = null,
  capacityMinutesByDay = null,
  netIncrementMinutes = 0,
  materialItems = null,
  scope = 'first_round'
} = {}) {
  if (!forecast || forecast.schema !== XIZONG_FORECAST_MODEL_SCHEMA) {
    throw new Error('XIZONG_FORECAST_MODEL_REQUIRED');
  }
  const supportedScope = scope === 'score_formation' ? 'score_formation' : 'first_round';
  const ids = supportedScope === 'score_formation'
    ? ['knowledge','questions','system_recall','repair','verification','formal_calibration']
    : ['knowledge','questions','system_recall','repair'];
  const actionById = {
    knowledge: 'LEARN',
    questions: 'ATTEMPT',
    system_recall: 'RECONSTRUCT',
    repair: 'REPAIR',
    verification: 'VERIFY',
    formal_calibration: 'FORMAL_SCORE_CALIBRATE'
  };
  const workBuckets = ids.map((id) => {
    const row = forecast?.components?.[id] || {};
    return {
      id,
      learner_role: actionById[id],
      status: String(row?.status || 'UNKNOWN'),
      band_minutes: row?.band_minutes || null,
      priced: Boolean(row?.band_minutes),
      risks: Array.isArray(row?.risks) ? row.risks : []
    };
  });
  const feasibility = assessXizongDeadlineFeasibility(forecast, {
    startDay,
    deadlineDay,
    dailyMinutes,
    capacityMinutesByDay,
    netIncrementMinutes,
    materialItems,
    scope: supportedScope
  });
  const aggregate = supportedScope === 'score_formation'
    ? forecast.score_formation
    : forecast.first_round;
  return {
    schema: 'kianos.xizong.checkpoint-requirement.v1',
    scope: supportedScope,
    start_day: startDay || null,
    deadline_day: deadlineDay || null,
    capacity: feasibility?.capacity || null,
    feasibility,
    work_buckets: workBuckets,
    unpriced_bucket_ids: workBuckets.filter((row) => !row.priced).map((row) => row.id),
    aggregate_status: String(aggregate?.status || 'UNKNOWN'),
    full_scope_priced: Boolean(aggregate?.full_band_minutes),
    subject_stage_decision: 'OUT_OF_SCOPE',
    boundary:
      'This checkpoint decomposes remaining evidence-priced work into learner-role buckets and capacity. It is not a daily schedule, does not choose subject/System order, and cannot claim full completion when the aggregate or a required material scope is only partially priced.'
  };
}

export function applyXizongForecastScenario(forecast, {
  dailyMinutes = null,
  netIncrementMinutes = 0,
  materialItems = null,
  startDay = null,
  capacityMinutesByDay = null
} = {}) {
  if (!forecast || forecast.schema !== XIZONG_FORECAST_MODEL_SCHEMA) {
    throw new Error('XIZONG_FORECAST_MODEL_REQUIRED');
  }
  const perDay = positive(dailyMinutes);
  const material = materialItems == null ? null : reconcileXizongMaterialIncrement(materialItems);
  const directIncrement = Math.max(0, Number(netIncrementMinutes || 0));
  const increment = material
    ? (material.net_minutes === null ? null : Number(material.net_minutes))
    : directIncrement;
  const project = (aggregate) => {
    const band = aggregate?.full_band_minutes || aggregate?.known_priced_band_minutes;
    if (!band || increment === null) return {
      status: 'UNPRICED',
      full_scope: false,
      band_minutes: null,
      band_days: null,
      band_dates: null
    };
    const withIncrement = {
      p20: round(Number(band.p20 || 0) + increment),
      p50: round(Number(band.p50 || 0) + increment),
      p80: round(Number(band.p80 || 0) + increment)
    };
    return {
      status: aggregate?.full_band_minutes ? 'FULL_SCOPE' : 'KNOWN_PRICED_LOWER_BOUND',
      full_scope: Boolean(aggregate?.full_band_minutes),
      band_minutes: withIncrement,
      band_days: perDay === null ? null : {
        p20: Math.ceil(withIncrement.p20 / perDay),
        p50: Math.ceil(withIncrement.p50 / perDay),
        p80: Math.ceil(withIncrement.p80 / perDay)
      },
      band_dates: startDay ? {
        p20: projectMinutesAcrossCapacity(withIncrement.p20, { startDay, dailyMinutes: perDay, capacityMinutesByDay }),
        p50: projectMinutesAcrossCapacity(withIncrement.p50, { startDay, dailyMinutes: perDay, capacityMinutesByDay }),
        p80: projectMinutesAcrossCapacity(withIncrement.p80, { startDay, dailyMinutes: perDay, capacityMinutesByDay })
      } : null
    };
  };
  return {
    schema: 'kianos.xizong.forecast-scenario.v1',
    daily_minutes: perDay,
    net_increment_minutes: increment,
    material_increment: material,
    start_day: startDay,
    first_round: project(forecast.first_round),
    score_formation: project(forecast.score_formation),
    boundary:
      'net_increment_minutes must be deduplicated net new workload. Raw case/cram/five-hour material duration must not be added before delta/replacement reconciliation.'
  };
}


export function buildXizongForecastFalsifiability(progress, {
  startDay = null,
  deadlineDay = null,
  dailyMinutes = 300,
  scope = 'first_round',
  wrongUncertainRateGrid = [0.15, 0.30, 0.45],
  dailyMinutesGrid = [180, 300, 420],
  materialItems = null
} = {}) {
  if (!progress || progress.schema !== 'kianos.xizong.forecast-progress.v1') {
    throw new Error('XIZONG_FORECAST_PROGRESS_REQUIRED');
  }

  const baseForecast = buildXizongWorkloadForecast(progress);
  const scoreEvidence = buildXizongScoreEvidence(progress);
  const baseFeasibility = startDay && deadlineDay
    ? assessXizongDeadlineFeasibility(baseForecast, {
        startDay,
        deadlineDay,
        dailyMinutes,
        materialItems,
        scope
      })
    : null;

  const wuRates = [...new Set((Array.isArray(wrongUncertainRateGrid) ? wrongUncertainRateGrid : [])
    .map(Number).filter((value) => Number.isFinite(value) && value >= 0 && value <= 1))]
    .sort((a,b)=>a-b);
  const capacities = [...new Set((Array.isArray(dailyMinutesGrid) ? dailyMinutesGrid : [])
    .map(Number).filter((value) => Number.isFinite(value) && value > 0))]
    .sort((a,b)=>a-b);

  const grid = [];
  if (startDay && deadlineDay) {
    for (const wrongUncertainRate of wuRates) {
      const stressed = buildXizongWorkloadForecast(progress, { wrongUncertainRate });
      for (const capacity of capacities) {
        const feasibility = assessXizongDeadlineFeasibility(stressed, {
          startDay,
          deadlineDay,
          dailyMinutes: capacity,
          materialItems,
          scope
        });
        grid.push({
          wrong_uncertain_rate: round(wrongUncertainRate, 4),
          daily_minutes: capacity,
          status: feasibility.status,
          full_scope: feasibility.full_scope,
          p20_fit: feasibility.fit?.p20 ?? null,
          p50_fit: feasibility.fit?.p50 ?? null,
          p80_fit: feasibility.fit?.p80 ?? null,
          required_average_minutes_per_day: feasibility.required_average_minutes_per_day
        });
      }
    }
  }

  const p50FlipByCapacity = capacities.map((capacity) => {
    const rows = grid.filter((row) => row.daily_minutes === capacity && row.p50_fit !== null);
    const firstFailure = rows.find((row) => row.p50_fit === false);
    const lastSuccess = [...rows].reverse().find((row) => row.p50_fit === true);
    return {
      daily_minutes: capacity,
      last_tested_wu_rate_with_p50_fit: lastSuccess?.wrong_uncertain_rate ?? null,
      first_tested_wu_rate_without_p50_fit: firstFailure?.wrong_uncertain_rate ?? null
    };
  });

  const candidates = [];
  const addCandidate = (id, priority, reason, evidence, costClass = 'BOUNDED') => {
    if (candidates.some((row) => row.id === id)) return;
    candidates.push({
      id,
      information_priority: priority,
      reason,
      evidence_to_collect: evidence,
      learner_cost_class: costClass
    });
  };

  const knowledgeBacktest = String(baseForecast?.components?.knowledge?.calibration?.rolling_backtest?.status || '');
  const questionBacktest = String(baseForecast?.components?.questions?.calibration?.rolling_backtest?.status || '');
  const knowledgeSystems = Array.isArray(baseForecast?.components?.knowledge?.calibration?.sample_systems)
    ? baseForecast.components.knowledge.calibration.sample_systems.length
    : 0;
  const repair = baseForecast?.components?.repair || {};

  if (baseForecast.first_round.status !== 'FULLY_PRICED') {
    addCandidate(
      'FULL_PRICING_BLOCKER',
      100,
      'A required first-round workload component is still unpriced.',
      'Collect only the missing factual workload evidence named by the unpriced component; do not guess a rate.'
    );
  }
  if (knowledgeSystems < 2 || knowledgeBacktest !== 'BACKTESTED') {
    addCandidate(
      'REPRESENTATIVE_BLOCK_THROUGHPUT',
      90,
      'Knowledge throughput is not yet cross-System/backtest calibrated.',
      'Time completion of a representative real Block from a not-yet-well-calibrated System, preserving KP/LG identity.'
    );
  }
  if (questionBacktest !== 'BACKTESTED' || baseForecast?.components?.questions?.band_minutes == null) {
    addCandidate(
      'REPRESENTATIVE_OFFICIAL_SWEEP_SPEED',
      85,
      'Official-question speed is not yet sufficiently backtest-calibrated.',
      'Record timed Current-scope official-question work in a representative System without changing the learning plan merely for measurement.'
    );
  }
  if ((repair?.error_rate?.unpriced_system_ids || []).length) {
    addCandidate(
      'SYSTEM_SPECIFIC_WU_RATE',
      84,
      'At least one remaining System has no observed Wrong/Uncertain rate.',
      'Observe a representative Current-scope official-question sample in the named unpriced System.'
    );
  }
  if ((repair?.compression?.unpriced_system_ids || []).length) {
    addCandidate(
      'SYSTEM_REPAIR_COMPRESSION',
      83,
      'At least one System has no observed question→Repair-cluster compression.',
      'Close real Repair clusters in that System and record how many source questions collapse into each causal cluster.'
    );
  }
  if (Number(repair?.calibration?.exclusive_repair_timer_samples || 0) < 3) {
    addCandidate(
      'EXCLUSIVE_REPAIR_TIME',
      82,
      'Repair time is not yet calibrated with enough exclusive samples.',
      'Record exclusive Repair time, not mixed Block-route lifetime time.'
    );
  }
  if (scoreEvidence?.capabilities?.case_stability?.dedicated_case_evidence !== true) {
    addCandidate(
      'DEDICATED_CASE_TRANSFER',
      60,
      'Whole-paper or local official performance cannot prove X8 case/cross-System transfer.',
      'Collect a bounded dedicated case/cross-System transfer observation when the maturity owner judges it decision-relevant.',
      'MODERATE'
    );
  }
  if (scoreEvidence?.formal_score?.calibration_band == null) {
    addCandidate(
      'LOW_CONTAMINATION_FORMAL_SCORE',
      40,
      'Observed paper scores do not yet form a strong low-contamination calibration band.',
      'Preserve low-contamination whole-paper evidence for the appropriate later maturity stage; do not consume it merely to improve the Forecast.',
      'SCARCE'
    );
  }

  candidates.sort((a,b) => b.information_priority - a.information_priority || a.id.localeCompare(b.id));

  const capacityFlip = baseFeasibility?.required_average_minutes_per_day
    ? {
        p20_daily_minutes: baseFeasibility.required_average_minutes_per_day.p20,
        p50_daily_minutes: baseFeasibility.required_average_minutes_per_day.p50,
        p80_daily_minutes: baseFeasibility.required_average_minutes_per_day.p80
      }
    : null;

  return {
    schema: 'kianos.xizong.forecast-falsifiability.v1',
    scope: scope === 'score_formation' ? 'score_formation' : 'first_round',
    base_forecast_state: String(buildXizongForecastLoop(progress, {
      dailyMinutes,
      startDay
    }).forecast_state || 'UNKNOWN'),
    assumptions: {
      start_day: startDay,
      deadline_day: deadlineDay,
      daily_minutes: positive(dailyMinutes),
      tested_wrong_uncertain_rates: wuRates,
      tested_daily_minutes: capacities,
      material_increment_status: materialItems == null
        ? 'NONE'
        : reconcileXizongMaterialIncrement(materialItems).status
    },
    capacity_flip_points: capacityFlip,
    wrong_uncertain_capacity_grid: grid,
    p50_flip_surface: p50FlipByCapacity,
    next_high_value_evidence: candidates[0] || null,
    evidence_candidates: candidates,
    boundary:
      'Sensitivity surfaces expose when a capacity conclusion flips. They do not choose the learner action. next_high_value_evidence is an information candidate only; the maturity owner must still decide whether collecting it is worth learner time and scarce-material cost.'
  };
}
