import assert from 'node:assert/strict';

import { buildPoliticsForecast, politicsForecastConstants } from '../src/lib/politicsForecast.mjs';

const evidence = {
  cumulative_first_attempts: {
    by_question_type: {
      single: { attempted: 120, stable: 104, wrong: 8, uncertain: 8 },
      multiple: { attempted: 160, stable: 118, wrong: 24, uncertain: 18 }
    }
  },
  review: { open_problem_count: 31 },
  forecast_progress: {
    catalog_units: 160,
    units_with_first_attempt_evidence: 42,
    current_navigation: {
      structural_units_after_current: 110,
      structural_units_after_current_by_subject: { MARX: 10, XI: 50, HISTORY: 20, MAO: 10, ETHICS: 20 }
    },
    units_with_first_attempt_evidence_by_subject: { MARX: 20, XI: 10, HISTORY: 7, MAO: 3, ETHICS: 2 },
    units_without_first_attempt_evidence_by_subject: { MARX: 2, XI: 50, HISTORY: 28, MAO: 15, ETHICS: 23 }
  }
};

const forecast = buildPoliticsForecast({
  evidence,
  days_remaining: 30,
  analysis: { status: 'UNKNOWN' },
  future_sources: {
    handbook: 'UNKNOWN',
    current_affairs: 'UNKNOWN',
    xiao8: 'UNKNOWN',
    xiao4: 'UNKNOWN'
  }
});

assert.ok(forecast.first_round_stress.unit_cases.length >= 2, 'null explicit remaining units must preserve structural uncertainty cases');
assert.equal(
  forecast.first_round_stress.unit_cases.some((row) => row.label === 'EXPLICIT_REMAINING_UNITS'),
  false,
  'default null must not become explicit zero remaining units'
);

assert.equal(forecast.schema, 'kianos.politics.forecast.v1');
assert.equal(forecast.role, 'SUBJECT_WORKLOAD_AND_RISK_EVIDENCE_NOT_STRATEGY');
assert.equal(forecast.facts.remaining_questions.single, politicsForecastConstants.TOTALS.single - 120);
assert.equal(forecast.facts.remaining_questions.multiple, politicsForecastConstants.TOTALS.multiple - 160);
assert.equal(forecast.facts.observed_questions.single.wu, 16);
assert.equal(forecast.facts.observed_questions.multiple.wu, 42);
assert.equal(forecast.personal_calibration.status, 'CALIBRATION_PENDING');
assert.equal(forecast.score_path.total_score_confidence, 'WIDE_OR_UNKNOWN');
assert.deepEqual(
  forecast.facts.unit_progress_signals.nav_tail_units_by_subject,
  { MARX: 10, XI: 50, HISTORY: 20, MAO: 10, ETHICS: 20 }
);

for (const unitCase of forecast.first_round_stress.unit_cases) {
  assert.equal(unitCase.scenario_count, 5832);
  const caps = unitCase.capacity;
  for (let i = 1; i < caps.length; i += 1) {
    assert.ok(caps[i].stress_grid_fit_fraction >= caps[i - 1].stress_grid_fit_fraction);
  }
  for (const row of unitCase.sensitivity) {
    if (row.parameter === 'signals_per_repair_cluster') {
      assert.ok(
        row.mean_minutes_delta <= 0,
        'signals_per_repair_cluster should not get more expensive when more signals compress into one repair cluster'
      );
    } else {
      assert.ok(
        row.mean_minutes_delta >= 0,
        `${row.parameter} should not get cheaper when moved from low to high stress`
      );
    }
  }
}

const explicit = buildPoliticsForecast({
  evidence,
  days_remaining: 30,
  explicit_remaining_units: 40
});
assert.equal(explicit.first_round_stress.unit_cases.length, 1);
assert.equal(explicit.first_round_stress.unit_cases[0].remaining_units, 40);

const withObserved = buildPoliticsForecast({
  evidence,
  days_remaining: 30,
  observed_capacity_or_workload_samples: [35, 37, 39, 40, 42, 44, 48]
});
assert.equal(withObserved.personal_calibration.status, 'SAMPLES_PRESENT_MODEL_NOT_YET_FIT');
assert.equal(withObserved.personal_calibration.sample_count, 7);
assert.equal(withObserved.personal_calibration.p20, null);
assert.equal(withObserved.personal_calibration.p50, null);
assert.equal(withObserved.personal_calibration.p80, null);
assert.match(withObserved.personal_calibration.boundary, /do not become remaining-work P20\/P50\/P80/i);

const zero = buildPoliticsForecast({
  evidence: {},
  days_remaining: 30
});
assert.equal(zero.facts.remaining_questions.single, 528);
assert.equal(zero.facts.remaining_questions.multiple, 620);
assert.equal(zero.score_path.objective_confidence, 'UNCALIBRATED');

const overObserved = buildPoliticsForecast({
  evidence: {
    cumulative_first_attempts: {
      by_question_type: {
        single: { attempted: 9999, stable: 9999, wrong: 0, uncertain: 0 },
        multiple: { attempted: 9999, stable: 9999, wrong: 0, uncertain: 0 }
      }
    },
    review: { open_problem_count: 0 },
    forecast_progress: {
      catalog_units: 160,
      units_with_first_attempt_evidence: 160,
      current_navigation: { structural_units_after_current: 0 }
    }
  },
  days_remaining: 1
});
assert.equal(overObserved.facts.remaining_questions.single, 0);
assert.equal(overObserved.facts.remaining_questions.multiple, 0);

const readyLater = buildPoliticsForecast({
  evidence,
  days_remaining: 30,
  analysis: { status: 'READY' },
  future_sources: {
    handbook: 'READY',
    current_affairs: 'READY',
    xiao8: 'NOT_YET_NEEDED',
    xiao4: 'NOT_YET_NEEDED'
  }
});
assert.equal(readyLater.score_path.total_score_confidence, 'PHASE_APPROPRIATE_REASSESSMENT_REQUIRED');

const laterUnknown = buildPoliticsForecast({
  evidence,
  days_remaining: 30
});
assert.equal(laterUnknown.later_stage_workload.status, 'UNKNOWN');
assert.equal(laterUnknown.later_stage_workload.total_minutes_range, null);
assert.equal(laterUnknown.whole_cycle_workload.status, 'UNKNOWN');

const laterExplicit = buildPoliticsForecast({
  evidence,
  days_remaining: 30,
  capacity_minutes_per_day: [60, 120],
  later_workload_assumptions: {
    analysis_build: [300, 600],
    future_source_assimilation: { min: 180, max: 360 },
    mock_final_reserve: 240
  }
});
assert.equal(laterExplicit.later_stage_workload.status, 'EXPLICIT_SCENARIO');
assert.deepEqual(laterExplicit.later_stage_workload.total_minutes_range, { min: 720, max: 1200 });
assert.equal(laterExplicit.whole_cycle_workload.status, 'EXPLICIT_SCENARIO');
for (const row of laterExplicit.whole_cycle_workload.unit_cases) {
  assert.equal(
    row.whole_cycle_minutes_range.min,
    row.first_round_minutes_range.min + 720
  );
  assert.equal(
    row.whole_cycle_minutes_range.max,
    row.first_round_minutes_range.max + 1200
  );
}

const laterMoreExpensive = buildPoliticsForecast({
  evidence,
  days_remaining: 30,
  later_workload_assumptions: {
    analysis_build: [300, 600],
    future_source_assimilation: { min: 400, max: 800 },
    mock_final_reserve: 240
  }
});
assert.ok(
  laterMoreExpensive.later_stage_workload.total_minutes_range.min
    > laterExplicit.later_stage_workload.total_minutes_range.min
);
assert.ok(
  laterMoreExpensive.later_stage_workload.total_minutes_range.max
    > laterExplicit.later_stage_workload.total_minutes_range.max
);

const laterPartial = buildPoliticsForecast({
  evidence,
  days_remaining: 30,
  later_workload_assumptions: { analysis_build: [300, 600] }
});
assert.equal(laterPartial.later_stage_workload.status, 'PARTIAL_SCENARIO');
assert.equal(laterPartial.later_stage_workload.total_minutes_range, null);
assert.equal(laterPartial.whole_cycle_workload.status, 'UNKNOWN');

assert.equal('next_action' in forecast, false);
assert.equal('priority' in forecast, false);
assert.equal('target_minutes' in forecast, false);

console.log('PASS Politics Forecast: stress grid, sensitivity, calibration boundary, and no-strategy invariant');
