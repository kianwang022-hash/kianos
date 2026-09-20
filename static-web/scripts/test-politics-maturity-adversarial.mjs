import assert from 'node:assert/strict';
import { buildPoliticsForecast } from '../src/lib/politicsForecast.mjs';

const evidence = {
  cumulative_first_attempts: {
    by_question_type: {
      single: { attempted: 100, stable: 88, wrong: 6, uncertain: 6 },
      multiple: { attempted: 100, stable: 65, wrong: 20, uncertain: 15 }
    }
  },
  review: { open_problem_count: 20 },
  forecast_progress: {
    catalog_units: 160,
    units_with_first_attempt_evidence: 40,
    current_navigation: { structural_units_after_current: 110 }
  }
};

const oneScenario = (overrides = {}) => ({
  unit_minutes: [5],
  single_minutes: [0.8],
  multiple_minutes: [1.2],
  single_wu_rate: [0.10],
  multiple_wu_rate: [0.25],
  signals_per_repair_cluster: [4],
  repair_cluster_minutes: [8],
  memory_minutes_per_day: [10],
  ...overrides
});

const work = (forecast) => forecast.first_round_stress.unit_cases[0].first_round_minutes_range.min;

const baseline = buildPoliticsForecast({
  evidence,
  days_remaining: 30,
  capacity_minutes_per_day: [36, 90, 120],
  stress_axes: oneScenario()
});

const multipleWorse = buildPoliticsForecast({
  evidence,
  days_remaining: 30,
  stress_axes: oneScenario({ multiple_wu_rate: [0.45] })
});
assert.ok(work(multipleWorse) > work(baseline), 'worse multiple-choice W/U must increase workload');

const compressionWorse = buildPoliticsForecast({
  evidence,
  days_remaining: 30,
  stress_axes: oneScenario({ signals_per_repair_cluster: [2] })
});
assert.ok(work(compressionWorse) > work(baseline), 'worse repair compression must increase workload');

const memoryRelapse = buildPoliticsForecast({
  evidence,
  days_remaining: 30,
  stress_axes: oneScenario({ memory_minutes_per_day: [25] })
});
assert.ok(work(memoryRelapse) > work(baseline), 'memory relapse cost must increase workload');

const capacityRows = baseline.first_round_stress.unit_cases[0].capacity;
assert.ok(capacityRows[0].stress_grid_fit_fraction <= capacityRows[1].stress_grid_fit_fraction);
assert.ok(capacityRows[1].stress_grid_fit_fraction <= capacityRows[2].stress_grid_fit_fraction);

const badWeek = buildPoliticsForecast({
  evidence,
  days_remaining: 23,
  capacity_minutes_per_day: [90],
  stress_axes: oneScenario()
});
assert.ok(
  badWeek.first_round_stress.unit_cases[0].capacity[0].stress_grid_fit_fraction
    <= baseline.first_round_stress.unit_cases[0].capacity[1].stress_grid_fit_fraction,
  'losing a week must not improve capacity fit'
);

const reorderedEvidence = {
  review: evidence.review,
  forecast_progress: evidence.forecast_progress,
  cumulative_first_attempts: evidence.cumulative_first_attempts
};
const reordered = buildPoliticsForecast({
  evidence: reorderedEvidence,
  days_remaining: 30,
  capacity_minutes_per_day: [36, 90, 120],
  stress_axes: oneScenario()
});
assert.deepEqual(reordered.facts.observed_questions, baseline.facts.observed_questions);
assert.equal(work(reordered), work(baseline), 'irrelevant metadata/key order must not change forecast');

const partial = buildPoliticsForecast({
  evidence: { review: { open_problem_count: 2 } },
  days_remaining: 30,
  future_sources: { handbook: 'PARTIAL' }
});
assert.equal(partial.score_path.objective_confidence, 'UNCALIBRATED');
assert.equal(partial.score_path.total_score_confidence, 'WIDE_OR_UNKNOWN');

const ready = buildPoliticsForecast({
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
assert.equal(ready.score_path.total_score_confidence, 'PHASE_APPROPRIATE_REASSESSMENT_REQUIRED');

assert.equal('next_action' in baseline, false);
assert.equal('priority' in baseline, false);
assert.equal('target_minutes' in baseline, false);

console.log('PASS Politics maturity adversarial: multiple-choice weakness, repair compression, memory relapse, bad week/capacity collapse, metamorphic ordering, partial evidence fail-closed, no-strategy invariant.');
