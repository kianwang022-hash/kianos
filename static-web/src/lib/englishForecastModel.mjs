export const ENGLISH_FORECAST_INPUT_SCHEMA = 'kianos.english.forecast-input.v1';
export const ENGLISH_FORECAST_MODEL_SCHEMA = 'kianos.english.workload-forecast.v1';
export const ENGLISH_PRODUCTIVE_SCORING_STANDARD_VERSION = 'english.productive-scoring.v2';
export const ENGLISH_SCORE_CHANNELS = Object.freeze({
  objective: Object.freeze({label: 'Objective', max_points: 60}),
  translation: Object.freeze({label: 'Translation', max_points: 10}),
  writing_small: Object.freeze({label: 'Small Writing', max_points: 10}),
  writing_big: Object.freeze({label: 'Big Writing', max_points: 20})
});
export const ENGLISH_FORECAST_FAMILIES = Object.freeze([
  'reading_a', 'cloze', 'reading_b', 'translation', 'writing_small', 'writing_big', 'lexical', 'whole_paper'
]);

const record = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const finite = (v) => typeof v === 'number' && Number.isFinite(v) ? v : null;
const nonNegative = (v) => finite(v) !== null && v >= 0 ? v : null;
const positive = (v) => finite(v) !== null && v > 0 ? v : null;
const round = (v, digits = 1) => finite(v) === null ? null : Number(v.toFixed(digits));
const copy = (v) => v == null ? null : JSON.parse(JSON.stringify(v));
const bandKeys = ['p20', 'p50', 'p80'];
const zeroBand = () => ({p20: 0, p50: 0, p80: 0});
const sumBands = (rows) => Object.fromEntries(bandKeys.map((k) => [k,
  round(rows.reduce((sum, row) => sum + row.band_minutes[k], 0))]));
const quantile = (rows, p) => {
  const values = [...rows].sort((a, b) => a - b);
  if (!values.length) return null;
  const index = (values.length - 1) * p, low = Math.floor(index), high = Math.ceil(index);
  return values[low] + (values[high] - values[low]) * (index - low);
};
const scoreRange = (value, max) => record(value) && nonNegative(value.low) !== null
  && nonNegative(value.high) !== null && value.low <= value.high && value.high <= max
  ? {low: value.low, high: value.high} : null;

function bucketEvidence(bucket, familyId) {
  const id = typeof bucket?.id === 'string' ? bucket.id.trim() : '';
  if (!id) throw new Error('ENGLISH_FORECAST_BUCKET_ID_REQUIRED:' + familyId);
  const units = nonNegative(bucket.remaining_units);
  const suppliedSamples = bucket.minutes_per_unit_samples;
  const samples = Array.isArray(suppliedSamples) ? suppliedSamples.filter((v) => positive(v) !== null) : [];
  const invalidSampleCount = Array.isArray(suppliedSamples)
    ? suppliedSamples.length - samples.length : suppliedSamples == null ? 0 : 1;
  const suppliedPrior = bucket.minutes_per_unit_prior;
  let prior = null;
  if (record(suppliedPrior) && positive(suppliedPrior.low) !== null && positive(suppliedPrior.high) !== null
      && suppliedPrior.low <= suppliedPrior.high) {
    const central = suppliedPrior.central === undefined ? (suppliedPrior.low + suppliedPrior.high) / 2 : suppliedPrior.central;
    if (positive(central) !== null && central >= suppliedPrior.low && central <= suppliedPrior.high) {
      prior = {low: suppliedPrior.low, central, high: suppliedPrior.high};
    }
  }
  const risks = [];
  if (units === null) risks.push('REMAINING_UNITS_UNKNOWN');
  if (invalidSampleCount) risks.push('TIMING_SAMPLE_INVALID');
  if (suppliedPrior != null && !prior) risks.push('TIMING_PRIOR_INVALID');
  const sampleQuantiles = samples.length ? {
    p20: quantile(samples, .2), p50: quantile(samples, .5), p80: quantile(samples, .8)
  } : null;
  // These are conditional calculations, not claims of representative sampling or confidence.
  const rate = prior ? {p20: prior.low, p50: prior.central, p80: prior.high} : sampleQuantiles;
  let band = null;
  if (!risks.length && units === 0) band = zeroBand();
  else if (!risks.length && rate) band = Object.fromEntries(bandKeys.map((k) => [k, round(rate[k] * units)]));
  else if (units !== null && units > 0 && !rate) risks.push('RATE_UNKNOWN');
  return {
    id, family_id: familyId, required: bucket.required !== false,
    unit_label: String(bucket.unit_label || 'unit'), remaining_units: units,
    minutes_per_unit_samples: [...samples], sample_count: samples.length,
    invalid_sample_count: invalidSampleCount, minutes_per_unit_prior: prior,
    sample_rate_quantiles: sampleQuantiles, band_minutes: band, risks
  };
}

function workloadEvidence(input) {
  const source = record(input.task_families) ? input.task_families : {};
  const families = ENGLISH_FORECAST_FAMILIES.map((id) => {
    const family = record(source[id]) ? source[id] : {};
    const buckets = (Array.isArray(family.work_buckets) ? family.work_buckets : []).map((b) => bucketEvidence(b, id));
    if (new Set(buckets.map((b) => b.id)).size !== buckets.length) throw new Error('ENGLISH_FORECAST_BUCKET_DUPLICATE:' + id);
    const required = buckets.filter((b) => b.required);
    const mode = typeof family.operating_mode === 'string' ? family.operating_mode.toUpperCase() : 'UNKNOWN';
    const mechanisms = Array.isArray(family.open_mechanisms) ? family.open_mechanisms.map(String).filter(Boolean) : [];
    const scopeComplete = family.scope_complete === true;
    const openDemand = mechanisms.length > 0 || !['MAINTAIN', 'ELASTIC'].includes(mode);
    // A zero placeholder is not work for an unresolved demand. Optional work cannot close it either.
    const demandUnpriced = openDemand && !required.some((b) => b.remaining_units === null || b.remaining_units > 0);
    const unpriced = required.filter((b) => b.band_minutes === null).map((b) => b.id);
    if (!scopeComplete) unpriced.push('SCOPE_UNDECLARED');
    if (demandUnpriced) unpriced.push('OPEN_DEMAND_WITHOUT_REQUIRED_WORK');
    if (family.open_mechanisms != null && !Array.isArray(family.open_mechanisms)) unpriced.push('MECHANISM_EVIDENCE_INVALID');
    if (family.work_buckets != null && !Array.isArray(family.work_buckets)) unpriced.push('WORK_BUCKETS_INVALID');
    const known = sumBands(required.filter((b) => b.band_minutes !== null));
    return {
      id, label: String(family.label || id), operating_mode: mode, open_mechanisms: mechanisms,
      scope_complete: scopeComplete, buckets, required_bucket_count: required.length,
      known_priced_band_minutes: known, full_band_minutes: unpriced.length ? null : known,
      unpriced_bucket_ids: unpriced
    };
  });
  const priced = families.flatMap((f) => f.buckets.filter((b) => b.required && b.band_minutes !== null));
  const unpriced = families.flatMap((f) => f.unpriced_bucket_ids.map((id) => f.id + ':' + id));
  const known = sumBands(priced);
  return {
    families, known_priced_band_minutes: known, full_band_minutes: unpriced.length ? null : known,
    unpriced_bucket_ids: unpriced, required_bucket_count: families.reduce((n, f) => n + f.required_bucket_count, 0)
  };
}

function scoreEvidence(input) {
  const clean = (quality) => ['CLEAN', 'LOW_CONTAMINATION', 'INDEPENDENT'].includes(quality);
  const channels = Object.entries(ENGLISH_SCORE_CHANNELS).map(([id, meta]) => {
    const row = record(input.score_channels?.[id]) ? input.score_channels[id] : {};
    const range = scoreRange(row.range, meta.max_points);
    const standard = id === 'objective' || row.scoring_standard_version === ENGLISH_PRODUCTIVE_SCORING_STANDARD_VERSION;
    const modality = String(row.modality || 'UNKNOWN').toUpperCase();
    const quality = String(row.evidence_quality || 'UNKNOWN').toUpperCase();
    const modalityEligible = (id === 'objective' ? ['BROWSER', 'PAPER', 'MIXED'] : ['PAPER', 'MIXED']).includes(modality);
    return {
      id, ...meta, range, evidence_quality: quality, modality,
      scoring_standard_version: id === 'objective' ? null : row.scoring_standard_version || null,
      formal_score_eligible: row.score_eligible === true && range !== null && standard && clean(quality) && modalityEligible,
      evidence_basis: copy(row.evidence_basis)
    };
  });
  const sumRanges = (rows) => rows.length === channels.length ? {
    low: round(rows.reduce((n, r) => n + r.range.low, 0)), high: round(rows.reduce((n, r) => n + r.range.high, 0))
  } : null;
  const whole = record(input.whole_paper) ? input.whole_paper : {};
  const range = scoreRange(whole.score_range, 100);
  const modality = String(whole.modality || 'UNKNOWN').toUpperCase();
  const quality = String(whole.evidence_quality || 'UNKNOWN').toUpperCase();
  return {
    channels, local_channel_band: sumRanges(channels.filter((r) => r.range)),
    formal_local_channel_band: sumRanges(channels.filter((r) => r.formal_score_eligible)),
    integrated_whole_paper: {
      range, evidence_quality: quality, modality,
      productive_scoring_standard_version: whole.productive_scoring_standard_version || null,
      score_eligible: whole.score_eligible === true && range !== null && clean(quality)
        && ['PAPER', 'MIXED'].includes(modality)
        && whole.productive_scoring_standard_version === ENGLISH_PRODUCTIVE_SCORING_STANDARD_VERSION,
      evidence_basis: copy(whole.evidence_basis)
    }
  };
}

export function buildEnglishHighScoreRequirement({targetScore = 85} = {}) {
  if (positive(targetScore) === null || targetScore > 100) throw new Error('ENGLISH_TARGET_SCORE_INVALID');
  return {
    schema: 'kianos.english.high-score-requirement.v1', target_score: targetScore, max_score: 100,
    total_loss_budget: round(100 - targetScore), objective_capability_target: 60,
    channels: Object.entries(ENGLISH_SCORE_CHANNELS).map(([id, row]) => ({id, ...row})),
    boundary: 'A capability target is not an achieved learner score.'
  };
}

export function buildEnglishWorkloadForecast(input, {targetScore = 85} = {}) {
  if (!record(input) || input.schema !== ENGLISH_FORECAST_INPUT_SCHEMA) throw new Error('ENGLISH_FORECAST_INPUT_REQUIRED');
  const workload = workloadEvidence(input), score = scoreEvidence(input);
  return {
    schema: ENGLISH_FORECAST_MODEL_SCHEMA, target: buildEnglishHighScoreRequirement({targetScore}),
    evidence_basis: copy(input.evidence_basis), workload, score,
    uncertainty: [...workload.unpriced_bucket_ids,
      ...score.channels.filter((r) => !r.formal_score_eligible).map((r) => 'FORMAL_SCORE_UNRESOLVED:' + r.id),
      ...(!score.integrated_whole_paper.score_eligible ? ['WHOLE_PAPER_FORMAL_CALIBRATION_UNRESOLVED'] : [])],
    subject_stage_decision: 'OUT_OF_SCOPE', daily_task_prescription: 'OUT_OF_SCOPE', cross_subject_allocation: 'OUT_OF_SCOPE',
    boundary: 'Rates, ranges and counts are conditional input calculations, not confidence, Secure, calibrated probabilities or a task ranking. Chat interprets relevance, representativeness and allocation. Native evidence keeps its source/session binding.'
  };
}

const dayTime = (day) => {
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const time = Date.parse(day + 'T00:00:00Z');
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === day ? time : null;
};
export function assessEnglishDeadlineFeasibility(forecast, {startDay, deadlineDay, dailyMinutes = null, capacityMinutesByDay = null} = {}) {
  if (forecast?.schema !== ENGLISH_FORECAST_MODEL_SCHEMA) throw new Error('ENGLISH_FORECAST_MODEL_REQUIRED');
  const start = dayTime(startDay), end = dayTime(deadlineDay);
  let capacity = null;
  if (start !== null && end !== null && end >= start && end - start <= 3660 * 86400000) {
    const days = (end - start) / 86400000 + 1;
    let minutes = 0;
    for (let i = 0; i < days; i++) {
      const day = new Date(start + i * 86400000).toISOString().slice(0, 10);
      const value = record(capacityMinutesByDay) && Object.hasOwn(capacityMinutesByDay, day)
        ? capacityMinutesByDay[day] : dailyMinutes;
      const amount = nonNegative(value);
      if (amount === null) { minutes = null; break; }
      minutes += amount;
    }
    if (minutes !== null) capacity = {days, minutes: round(minutes)};
  }
  const full = forecast.workload.full_band_minutes, band = full || forecast.workload.known_priced_band_minutes;
  const fit = capacity && band ? Object.fromEntries(bandKeys.map((k) => [k, band[k] <= capacity.minutes])) : null;
  return {
    schema: 'kianos.english.deadline-feasibility.v1', capacity, full_scope: full !== null,
    band_minutes: band, fit: full ? fit : null, known_lower_bound_fit: full ? null : fit,
    required_average_minutes_per_day: full && capacity
      ? Object.fromEntries(bandKeys.map((k) => [k, round(full[k] / capacity.days)])) : null
  };
}

export function buildEnglishForecastFalsifiability(input, {
  targetScore = 85, startDay = null, deadlineDay = null,
  dailyMinutesGrid = [60, 90, 120], workloadMultiplierGrid = [.8, 1, 1.25]
} = {}) {
  const base = buildEnglishWorkloadForecast(input, {targetScore}), grid = [];
  const capacities = [...new Set(dailyMinutesGrid.filter((v) => nonNegative(v) !== null))].sort((a, b) => a - b);
  const multipliers = [...new Set(workloadMultiplierGrid.filter((v) => positive(v) !== null))].sort((a, b) => a - b);
  for (const multiplier of multipliers) for (const minutes of capacities) {
    const stressed = copy(base);
    for (const key of ['full_band_minutes', 'known_priced_band_minutes']) {
      if (stressed.workload[key]) for (const k of bandKeys) stressed.workload[key][k] = round(stressed.workload[key][k] * multiplier);
    }
    const result = assessEnglishDeadlineFeasibility(stressed, {startDay, deadlineDay, dailyMinutes: minutes});
    grid.push({workload_multiplier: multiplier, daily_minutes: minutes, full_scope: result.full_scope,
      fit: result.fit, known_lower_bound_fit: result.known_lower_bound_fit});
  }
  return {
    schema: 'kianos.english.forecast-falsifiability.v1', workload_grid: grid, unresolved_inputs: [...base.uncertainty],
    boundary: 'Sensitivity only. No selected next evidence, information-value ranking, confidence threshold or daily prescription.'
  };
}

export function backtestEnglishForecastHistory(rows = []) {
  const groups = new Map(), workload = [], score = [], unusableWorkload = [], unusableScore = [];
  let missingIdentity = 0, duplicates = 0;
  const conflicts = [];
  for (const row of Array.isArray(rows) ? rows : []) {
    const id = typeof (row?.observation_id ?? row?.id) === 'string' ? (row.observation_id ?? row.id).trim() : '';
    if (!id) { missingIdentity++; continue; }
    // Compare the measurement, not display metadata or aliases. Conflicts are excluded, never first-wins.
    const measurement = {actual_workload_minutes: row.actual_workload_minutes, predicted_workload_band: row.predicted_workload_band,
      actual_score: row.actual_score, predicted_score_range: row.predicted_score_range};
    const stable = (value) => Array.isArray(value) ? value.map(stable) : record(value)
      ? Object.fromEntries(Object.keys(value).sort().map((k) => [k, stable(value[k])])) : value;
    const fingerprint = JSON.stringify(stable(measurement));
    const prior = groups.get(id);
    if (!prior) groups.set(id, {row, fingerprint, conflict: false});
    else if (prior.fingerprint === fingerprint) duplicates++;
    else { prior.conflict = true; if (!conflicts.includes(id)) conflicts.push(id); }
  }
  for (const [id, {row, conflict}] of groups) {
    if (conflict) continue;
    const actual = nonNegative(row.actual_workload_minutes), band = row.predicted_workload_band;
    if (actual !== null && record(band) && bandKeys.every((k) => nonNegative(band[k]) !== null)
        && band.p20 <= band.p50 && band.p50 <= band.p80) {
      workload.push({id, actual_minutes: actual, predicted: copy(band),
        p20_covers: actual <= band.p20, p50_covers: actual <= band.p50, p80_covers: actual <= band.p80,
        p50_actual_ratio: actual > 0 ? round(band.p50 / actual, 4) : null,
        p50_absolute_percent_error: actual > 0 ? round(Math.abs(band.p50 - actual) / actual, 4) : null});
    }
    if (!workload.some((item) => item.id === id) && (Object.hasOwn(row, 'actual_workload_minutes') || Object.hasOwn(row, 'predicted_workload_band'))) unusableWorkload.push(id);
    const actualScore = nonNegative(row.actual_score), range = scoreRange(row.predicted_score_range, 100);
    if (actualScore !== null && actualScore <= 100 && range) score.push({id, actual_score: actualScore, predicted: range,
      covered: actualScore >= range.low && actualScore <= range.high, band_width: range.high - range.low});
    if (!score.some((item) => item.id === id) && (Object.hasOwn(row, 'actual_score') || Object.hasOwn(row, 'predicted_score_range'))) unusableScore.push(id);
  }
  const coverage = (values, key) => values.length ? round(values.filter((r) => r[key]).length / values.length, 4) : null;
  const median = (values) => values.length ? round(quantile(values, .5), 4) : null;
  return {
    schema: 'kianos.english.forecast-backtest.v1', duplicate_row_count: duplicates,
    missing_identity_row_count: missingIdentity, conflicting_observation_ids: conflicts,
    workload: {unusable_observation_ids: unusableWorkload, sample_count: workload.length, p20_coverage: coverage(workload, 'p20_covers'),
      p50_coverage: coverage(workload, 'p50_covers'), p80_coverage: coverage(workload, 'p80_covers'),
      median_p50_actual_ratio: median(workload.map((r) => r.p50_actual_ratio).filter((v) => v !== null)),
      median_p50_absolute_percent_error: median(workload.map((r) => r.p50_absolute_percent_error).filter((v) => v !== null)), rows: workload.slice(-20)},
    score: {unusable_observation_ids: unusableScore, sample_count: score.length, band_coverage: coverage(score, 'covered'),
      median_band_width: median(score.map((r) => r.band_width)), misses: score.filter((r) => !r.covered).slice(-20), rows: score.slice(-20)},
    boundary: 'Unique observation identities and errors are facts, not independence, adequate sample size, BACKTESTED certification or calibrated confidence. Chat interprets them.'
  };
}
