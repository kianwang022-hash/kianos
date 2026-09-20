const TOTALS = Object.freeze({
  units: 160,
  single: 528,
  multiple: 620
});

const DEFAULT_STRESS_AXES = Object.freeze({
  unit_minutes: [3, 5, 8, 12],
  single_minutes: [0.5, 0.8, 1.1],
  multiple_minutes: [0.8, 1.2, 1.6],
  single_wu_rate: [0.05, 0.10, 0.15],
  multiple_wu_rate: [0.15, 0.25, 0.35],
  signals_per_repair_cluster: [2, 4, 6],
  repair_cluster_minutes: [4, 8],
  memory_minutes_per_day: [5, 10, 20]
});

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const bounded = (value, min, max) => Math.min(max, Math.max(min, finite(value, min)));
const round = (value, digits = 2) => Number(Number(value).toFixed(digits));

function observedQuestionFacts(evidence = {}) {
  const byType = evidence?.cumulative_first_attempts?.by_question_type || {};
  const row = (type) => {
    const value = byType[type] || {};
    const attempted = Math.max(0, finite(value.attempted));
    const wrong = Math.max(0, finite(value.wrong));
    const uncertain = Math.max(0, finite(value.uncertain));
    return {
      attempted,
      stable: Math.max(0, finite(value.stable)),
      wrong,
      uncertain,
      wu: wrong + uncertain,
      wu_rate: attempted ? round((wrong + uncertain) / attempted, 4) : null
    };
  };
  return { single: row('single'), multiple: row('multiple') };
}

function unitRemainderSignals(evidence = {}) {
  const progress = evidence?.forecast_progress || {};
  const catalogUnits = Math.max(0, finite(progress.catalog_units, TOTALS.units));
  const observedUnits = Math.max(0, finite(progress.units_with_first_attempt_evidence));
  const navTail = Number.isFinite(Number(progress?.current_navigation?.structural_units_after_current))
    ? Math.max(0, Number(progress.current_navigation.structural_units_after_current))
    : null;
  return {
    catalog_units: catalogUnits,
    units_with_question_contact: observedUnits,
    nav_tail_units: navTail,
    unobserved_unit_count: Math.max(0, catalogUnits - observedUnits),
    units_with_question_contact_by_subject:
      progress.units_with_first_attempt_evidence_by_subject || {},
    units_without_question_contact_by_subject:
      progress.units_without_first_attempt_evidence_by_subject || {},
    nav_tail_units_by_subject:
      progress?.current_navigation?.structural_units_after_current_by_subject || null,
    boundary: 'Navigation/question-contact are progress signals, not proof of source-learning completion.'
  };
}

function unitCandidates(signals, explicitRemainingUnits) {
  if (Number.isFinite(Number(explicitRemainingUnits))) {
    return [{
      label: 'EXPLICIT_REMAINING_UNITS',
      remaining_units: bounded(explicitRemainingUnits, 0, signals.catalog_units),
      confidence: 'EXPLICIT_INPUT'
    }];
  }
  const candidates = [];
  if (signals.nav_tail_units !== null) candidates.push({
    label: 'NAV_TAIL_PRIOR_ONLY',
    remaining_units: signals.nav_tail_units,
    confidence: 'LOW_PROGRESS_PRIOR'
  });
  candidates.push({
    label: 'UNOBSERVED_QUESTION_CONTACT_UNITS',
    remaining_units: signals.unobserved_unit_count,
    confidence: 'LOWER_BOUND_STYLE_SIGNAL'
  });
  candidates.push({
    label: 'FULL_CATALOG_STRESS',
    remaining_units: signals.catalog_units,
    confidence: 'CONSERVATIVE_STRESS_ONLY'
  });
  const seen = new Set();
  return candidates.filter((row) => {
    const key = String(row.remaining_units);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function scenarioMinutes({
  remaining_units,
  remaining_single,
  remaining_multiple,
  existing_open_problems,
  days_remaining,
  unit_minutes,
  single_minutes,
  multiple_minutes,
  single_wu_rate,
  multiple_wu_rate,
  signals_per_repair_cluster,
  repair_cluster_minutes,
  memory_minutes_per_day
}) {
  const unit = remaining_units * unit_minutes;
  const questions = remaining_single * single_minutes + remaining_multiple * multiple_minutes;
  const expectedFutureSignals = remaining_single * single_wu_rate + remaining_multiple * multiple_wu_rate;
  const repairSignals = existing_open_problems + expectedFutureSignals;
  const repairClusters = repairSignals / signals_per_repair_cluster;
  const repair = repairClusters * repair_cluster_minutes;
  const memory = days_remaining * memory_minutes_per_day;
  return {
    unit_minutes: round(unit),
    question_minutes: round(questions),
    projected_repair_signals: round(repairSignals),
    projected_repair_clusters: round(repairClusters),
    repair_minutes: round(repair),
    memory_minutes: round(memory),
    first_round_minutes: round(unit + questions + repair + memory)
  };
}

function cartesianStress(axes = DEFAULT_STRESS_AXES) {
  const keys = Object.keys(axes);
  let rows = [{}];
  for (const key of keys) {
    const next = [];
    for (const row of rows) for (const value of axes[key]) next.push({ ...row, [key]: value });
    rows = next;
  }
  return rows;
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function sensitivity(rows, keys) {
  const out = [];
  for (const key of keys) {
    const values = [...new Set(rows.map((row) => row.params[key]))].sort((a,b) => a-b);
    if (values.length < 2) continue;
    const low = values[0], high = values.at(-1);
    const lowMean = mean(rows.filter((row) => row.params[key] === low).map((row) => row.work.first_round_minutes));
    const highMean = mean(rows.filter((row) => row.params[key] === high).map((row) => row.work.first_round_minutes));
    out.push({
      parameter: key,
      low,
      high,
      mean_minutes_delta: round(highMean - lowMean),
      mean_hours_delta: round((highMean - lowMean) / 60)
    });
  }
  return out.sort((a,b) => Math.abs(b.mean_minutes_delta) - Math.abs(a.mean_minutes_delta));
}

function personalCalibration(values = [], { minSamples = 7 } = {}) {
  const clean = values.map(Number).filter(Number.isFinite);
  return {
    status: clean.length < minSamples
      ? 'CALIBRATION_PENDING'
      : 'SAMPLES_PRESENT_MODEL_NOT_YET_FIT',
    sample_count: clean.length,
    min_samples: minSamples,
    p20: null,
    p50: null,
    p80: null,
    boundary:
      'Raw observed minutes do not become remaining-work P20/P50/P80 until they are mapped to typed throughput and remaining structural load.'
  };
}

export function buildPoliticsForecast({
  evidence = {},
  days_remaining,
  capacity_minutes_per_day = [60, 90, 120, 150],
  explicit_remaining_units = null,
  stress_axes = DEFAULT_STRESS_AXES,
  observed_capacity_or_workload_samples = [],
  analysis = {},
  future_sources = {}
} = {}) {
  const days = Math.max(0, Math.trunc(finite(days_remaining)));
  const questions = observedQuestionFacts(evidence);
  const units = unitRemainderSignals(evidence);
  const remainingSingle = Math.max(0, TOTALS.single - questions.single.attempted);
  const remainingMultiple = Math.max(0, TOTALS.multiple - questions.multiple.attempted);
  const openProblems = Math.max(0, finite(evidence?.review?.open_problem_count));
  const unitCases = unitCandidates(units, explicit_remaining_units);
  const stressParams = cartesianStress(stress_axes);

  const cases = unitCases.map((unitCase) => {
    const rows = stressParams.map((params) => ({
      params,
      work: scenarioMinutes({
        remaining_units: unitCase.remaining_units,
        remaining_single: remainingSingle,
        remaining_multiple: remainingMultiple,
        existing_open_problems: openProblems,
        days_remaining: days,
        ...params
      })
    }));
    const capacity = capacity_minutes_per_day.map((perDay) => {
      const available = Math.max(0, finite(perDay)) * days;
      const fit = rows.filter((row) => row.work.first_round_minutes <= available).length;
      return {
        minutes_per_day: perDay,
        available_minutes: round(available),
        stress_grid_fit_fraction: rows.length ? round(fit / rows.length, 4) : null,
        interpretation: 'ROBUSTNESS_METRIC_NOT_COMPLETION_PROBABILITY'
      };
    });
    return {
      ...unitCase,
      scenario_count: rows.length,
      first_round_minutes_range: {
        min: Math.min(...rows.map((row) => row.work.first_round_minutes)),
        max: Math.max(...rows.map((row) => row.work.first_round_minutes))
      },
      capacity,
      sensitivity: sensitivity(rows, Object.keys(stress_axes))
    };
  });

  const analysisStatus = String(analysis.status || 'UNKNOWN');
  const sourceStatuses = Object.fromEntries(
    ['handbook','current_affairs','xiao8','xiao4'].map((key) => [key, String(future_sources?.[key] || 'UNKNOWN')])
  );
  const laterIncomplete = analysisStatus === 'UNKNOWN'
    || Object.values(sourceStatuses).some((status) => !['READY','AVAILABLE','NOT_YET_NEEDED'].includes(status));

  return {
    schema: 'kianos.politics.forecast.v1',
    role: 'SUBJECT_WORKLOAD_AND_RISK_EVIDENCE_NOT_STRATEGY',
    target: { protect: 70, upside: 75 },
    facts: {
      days_remaining: days,
      totals: TOTALS,
      observed_questions: questions,
      remaining_questions: { single: remainingSingle, multiple: remainingMultiple },
      open_review_problems: openProblems,
      unit_progress_signals: units
    },
    first_round_stress: {
      axes: stress_axes,
      unit_cases: cases,
      note: 'Stress-grid fit fractions are robustness checks, not probabilities and not personal P20/P50/P80. Unit composition is exposed separately because equal unit counts can have different subject burden.'
    },
    personal_calibration: personalCalibration(observed_capacity_or_workload_samples),
    score_path: {
      objective_confidence: questions.single.attempted + questions.multiple.attempted
        ? 'EVIDENCE_ACCUMULATING'
        : 'UNCALIBRATED',
      analysis_confidence: analysisStatus,
      current_year_sources: sourceStatuses,
      total_score_confidence: laterIncomplete ? 'WIDE_OR_UNKNOWN' : 'PHASE_APPROPRIATE_REASSESSMENT_REQUIRED',
      boundary: 'This module does not convert Xiao1000 accuracy directly into an exam score and does not choose today\'s task.'
    }
  };
}

export const politicsForecastConstants = { TOTALS, DEFAULT_STRESS_AXES };
