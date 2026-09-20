export const XIZONG_FORECAST_MODEL_SCHEMA = 'kianos.xizong.workload-forecast.v1';

const finite = (value) => Number.isFinite(Number(value)) ? Number(value) : null;
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
  return {
    p20: round(p20),
    p50: round(median(p50s)),
    p80: round(p80),
    estimator_count: valid.length,
    p50_model_spread_ratio: p50s.length > 1 && Math.min(...p50s) > 0
      ? round(Math.max(...p50s) / Math.min(...p50s), 3)
      : 1
  };
}

function knowledgeForecast(progress) {
  const weights = Array.isArray(progress?.canonical_scope?.block_weights)
    ? progress.canonical_scope.block_weights
    : [];
  const completedIds = new Set(progress?.runtime_evidence?.completed_block_ids || []);
  const remaining = weights.filter((row) => !completedIds.has(String(row?.block_id || '')));
  const samples = (progress?.runtime_evidence?.completed_blocks_detail || [])
    .filter((row) => positive(row?.timer_minutes_to_completion) !== null);
  const sampleSystems = new Set(samples.map((row) => String(row?.canonical_id || '')).filter(Boolean));
  const remainingKp = remaining.reduce((sum, row) => sum + Math.max(0, Number(row?.kp_count || 0)), 0);
  const remainingLg = remaining.reduce((sum, row) => sum + Math.max(0, Number(row?.logic_group_count || 0)), 0);
  const estimators = [
    rateEstimate(samples, remaining.length, {
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
  const risks = [];
  if (samples.length < 3) risks.push('INSUFFICIENT_COMPLETED_BLOCK_TIMER_SAMPLES');
  if (sampleSystems.size < 2 && samples.length > 0) risks.push('SINGLE_SYSTEM_CALIBRATION');
  if (Number(progress?.runtime_evidence?.started_incomplete_blocks || 0) > 0) {
    risks.push('STARTED_INCOMPLETE_BLOCKS_PRICED_AS_FULL_REMAINING');
  }
  if (band?.p50_model_spread_ratio > 1.35) risks.push('STRUCTURAL_ESTIMATORS_DIVERGE');
  return {
    component: 'FIRST_PASS_KNOWLEDGE_CLOSURE',
    required: true,
    status: band ? (samples.length >= 5 && sampleSystems.size >= 2 ? 'CALIBRATED' : 'PROVISIONAL') : sampleState(samples.length),
    remaining: {
      blocks: remaining.length,
      kp: remainingKp,
      logic_groups: remainingLg
    },
    calibration: {
      completed_block_timer_samples: samples.length,
      sample_systems: [...sampleSystems].sort(),
      estimators
    },
    band_minutes: band,
    risks,
    evidence_boundary:
      'Route timer to Block completion is learner evidence, not guaranteed total study time. Started incomplete Blocks remain fully priced until a stronger fractional-completion signal is proven.'
  };
}

function questionForecast(progress) {
  const remaining = finite(progress?.question_workload?.known_remaining_questions);
  const daySamples = (progress?.practice_evidence?.first_pass?.by_day || [])
    .filter((row) => positive(row?.observed_minutes_per_attempt) !== null);
  const rates = daySamples
    .map((row) => positive(row?.observed_minutes_per_attempt))
    .filter((value) => value !== null);
  const state = sampleState(rates.length);
  const band = remaining !== null && rates.length >= 3
    ? {
        p20: round(quantile(rates, 0.2) * remaining),
        p50: round(quantile(rates, 0.5) * remaining),
        p80: round(quantile(rates, 0.8) * remaining)
      }
    : null;
  const risks = [];
  if (remaining === null) risks.push('KNOWN_REMAINING_QUESTION_COUNT_AMBIGUOUS');
  if (rates.length < 3) risks.push('INSUFFICIENT_PRACTICE_TIMER_SAMPLES');
  if (progress?.question_workload?.known_remaining_is_lower_bound) risks.push('UNPRICED_SYSTEM_QUESTION_SCOPE');
  if (Number(progress?.question_workload?.cross_system_duplicate_memberships || 0) > 0) risks.push('CROSS_SYSTEM_DUPLICATE_MEMBERSHIP');
  return {
    component: 'FIRST_PASS_OFFICIAL_SWEEP',
    required: true,
    status: band ? (rates.length >= 5 ? 'CALIBRATED' : 'PROVISIONAL') : state,
    known_remaining_questions: remaining,
    known_remaining_is_lower_bound: Boolean(progress?.question_workload?.known_remaining_is_lower_bound),
    unknown_systems: [...(progress?.question_workload?.unknown_systems || [])],
    calibration: {
      day_samples: rates.length,
      reference_minutes_per_question: rates.length ? round(median(rates), 3) : null,
      sample_rows: daySamples.map((row) => ({
        day: row.day,
        attempts: Number(row.attempted || 0),
        practice_timer_minutes: Number(row.practice_timer_minutes || 0),
        minutes_per_attempt: positive(row.observed_minutes_per_attempt)
      }))
    },
    band_minutes: band,
    risks,
    evidence_boundary:
      'Practice timer minutes are route-attributed observed time and may include explanation/review on the same practice surface. Unknown exact System scope makes the known question forecast a lower bound.'
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
  const attempted = Math.max(0, Number(progress?.practice_evidence?.first_pass?.attempted_questions || 0));
  const observedRate = finite(progress?.practice_evidence?.first_pass?.wrong_or_uncertain_rate);
  const rate = wrongUncertainRate === null ? observedRate : Math.max(0, Math.min(1, Number(wrongUncertainRate)));
  const remainingQuestions = finite(progress?.question_workload?.known_remaining_questions);
  const questionsPerCluster = positive(progress?.repair_evidence?.observed_question_to_cluster_ratio);
  const activeClusters = Math.max(0, Number(progress?.repair_evidence?.active_repair_clusters || 0));
  const futureWu = rate !== null && remainingQuestions !== null ? remainingQuestions * rate : null;
  const futureClusters = futureWu !== null && questionsPerCluster !== null
    ? futureWu / questionsPerCluster
    : null;
  const totalClusters = futureClusters !== null ? activeClusters + futureClusters : null;
  const samples = (progress?.repair_evidence?.calibration_samples || [])
    .map((row) => positive(row?.timer_minutes_in_repair_window))
    .filter((value) => value !== null);
  const state = sampleState(samples.length);
  const band = totalClusters !== null && samples.length >= 3
    ? {
        p20: round(quantile(samples, 0.2) * totalClusters),
        p50: round(quantile(samples, 0.5) * totalClusters),
        p80: round(quantile(samples, 0.8) * totalClusters)
      }
    : null;
  const risks = [];
  if (rate === null) risks.push('WRONG_UNCERTAIN_RATE_UNOBSERVED');
  if (attempted > 0 && attempted < 30 && wrongUncertainRate === null) risks.push('WRONG_UNCERTAIN_RATE_LOW_SAMPLE');
  if (questionsPerCluster === null) risks.push('REPAIR_COMPRESSION_UNOBSERVED');
  if (samples.length < 3 && totalClusters !== null && totalClusters > 0) risks.push('REPAIR_TIME_UNCALIBRATED');
  return {
    component: 'WRONG_UNCERTAIN_REPAIR',
    required: true,
    status: band ? (samples.length >= 5 ? 'CALIBRATED' : 'PROVISIONAL') : state,
    error_rate: {
      source: wrongUncertainRate === null ? 'OBSERVED_FIRST_PASS' : 'SCENARIO_OVERRIDE',
      value: rate,
      observed_attempts: attempted
    },
    compression: {
      observed_questions_per_cluster: questionsPerCluster,
      active_clusters: activeClusters,
      predicted_future_wrong_uncertain_questions: futureWu === null ? null : round(futureWu),
      predicted_future_clusters: futureClusters === null ? null : round(futureClusters, 2),
      total_clusters_to_price: totalClusters === null ? null : round(totalClusters, 2)
    },
    calibration: {
      completed_repair_window_samples: samples.length,
      reference_window_minutes_per_cluster: samples.length ? round(median(samples), 3) : null,
      timing_semantics: 'BLOCK_ROUTE_TIMER_WITHIN_REPAIR_LIFETIME_WINDOW'
    },
    band_minutes: band,
    risks,
    evidence_boundary:
      'Repair timing samples are route-time inside the repair lifetime window, not pure causal repair minutes. They are intentionally conservative/provisional until repeated samples converge.'
  };
}

function verificationForecast(progress, questionsComponent, repairComponent) {
  const rates = (questionsComponent?.calibration?.sample_rows || [])
    .map((row) => positive(row?.minutes_per_attempt))
    .filter((value) => value !== null);
  const currentUnresolved = Math.max(0, Number(progress?.practice_evidence?.latest?.unresolved_wrong_uncertain_questions || 0));
  const futureWu = finite(repairComponent?.compression?.predicted_future_wrong_uncertain_questions);
  const questions = futureWu === null ? null : currentUnresolved + futureWu;
  const band = questions !== null && rates.length >= 3
    ? {
        p20: round(quantile(rates, 0.2) * questions),
        p50: round(quantile(rates, 0.5) * questions),
        p80: round(quantile(rates, 0.8) * questions)
      }
    : null;
  return {
    component: 'SECOND_PASS_FRESH_VERIFICATION',
    required_for_first_round: false,
    required_for_score_formation: true,
    status: band ? (rates.length >= 5 ? 'CALIBRATED' : 'PROVISIONAL') : sampleState(rates.length),
    estimated_verification_questions: questions === null ? null : round(questions),
    band_minutes: band,
    risks: questions === null ? ['VERIFICATION_VOLUME_UNPRICED'] : rates.length < 3 ? ['VERIFICATION_SPEED_UNCALIBRATED'] : [],
    evidence_boundary:
      'Repair completion is not fresh verification. Default second-pass verification demand follows unresolved/future Wrong-Uncertain question evidence.'
  };
}

function formalCalibrationForecast(progress) {
  const papers = Array.isArray(progress?.formal_score_evidence?.sealed_papers)
    ? progress.formal_score_evidence.sealed_papers
    : [];
  const comparable = papers.filter((row) => Number(row?.max_score) === 300);
  return {
    component: 'FORMAL_SCORE_CALIBRATION',
    required_for_first_round: false,
    required_for_score_formation: true,
    status: comparable.length > 0 ? 'EVIDENCE_PRESENT' : 'UNPRICED_REQUIRED',
    completed_300_point_papers: comparable.length,
    latest: comparable.at(-1) || null,
    band_minutes: { p20: 0, p50: 0, p80: 0 },
    unpriced_if_missing: comparable.length === 0,
    evidence_boundary:
      'At least one least-contaminated full-paper or equivalent large calibration slice is required for a defensible score estimate; workload time is not invented when no timed calibration evidence exists.'
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
    { scopeComplete: questionScopeComplete && !formalCalibration.unpriced_if_missing }
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

export function applyXizongForecastScenario(forecast, {
  dailyMinutes = null,
  netIncrementMinutes = 0
} = {}) {
  if (!forecast || forecast.schema !== XIZONG_FORECAST_MODEL_SCHEMA) {
    throw new Error('XIZONG_FORECAST_MODEL_REQUIRED');
  }
  const perDay = positive(dailyMinutes);
  const increment = Math.max(0, Number(netIncrementMinutes || 0));
  const project = (aggregate) => {
    const band = aggregate?.full_band_minutes || aggregate?.known_priced_band_minutes;
    if (!band) return {
      status: 'UNPRICED',
      full_scope: false,
      band_minutes: null,
      band_days: null
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
      }
    };
  };
  return {
    schema: 'kianos.xizong.forecast-scenario.v1',
    daily_minutes: perDay,
    net_increment_minutes: increment,
    first_round: project(forecast.first_round),
    score_formation: project(forecast.score_formation),
    boundary:
      'net_increment_minutes must be deduplicated net new workload. Raw case/cram/five-hour material duration must not be added before delta/replacement reconciliation.'
  };
}
