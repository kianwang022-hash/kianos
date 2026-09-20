import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const current = read('content/politics/CURRENT.md');
const stage = read('content/politics/MATURITY_STAGE_PLAN.md');
const pkg = read('content/politics/MATURITY_PACKAGE.md');
const report = read('content/politics/MATURITY_ADVERSARIAL_REPORT.md');
const matrix = read('content/politics/SCORE_ABILITY_MATRIX.md');
const inventory = read('content/politics/MATERIAL_INVENTORY.md');
const forecast = read('content/politics/FORECAST_MODEL.md');
const analysis = read('content/politics/analysis-output/README.md');
const scoring = read('content/politics/analysis-output/SCORING_RUBRIC.md');
const ingestion = read('content/politics/later-stage/INGESTION_RULES.md');
const mock = read('content/politics/mock-final/README.md');

assert.ok(current.includes('ACTIVE OWNER #638'));
assert.ok(current.includes('work/politics-later-readiness-20260920'));
assert.ok(current.includes('MATURITY_STAGE_PLAN.md'));
assert.ok(current.includes('MATURITY_PACKAGE.md'));
assert.ok(stage.toLowerCase().includes('single result package is `maturity_package.md`'));

const crosswalkRows = [...pkg.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1]));
assert.deepEqual(crosswalkRows, Array.from({ length: 29 }, (_, i) => i + 1), 'mother-standard crosswalk must cover 1-29 exactly once');

for (const section of [
  'Score → Ability → Material → Method → Evidence',
  'Full Material Inventory',
  'Dynamic Control',
  'Forecast',
  'Adversarial / Lifecycle',
  'Chat ↔ Website Proof',
  'Future Source Readiness',
  'Real Learner U',
  'Remaining Unknowns'
]) {
  assert.ok(pkg.includes(section), 'missing maturity-package section: ' + section);
}

for (const token of [
  'SYSTEM_LOGIC_ACCEPTED',
  'KIAN_SPECIFIC_CALIBRATED',
  'CURRENT_YEAR_SOURCE_READY'
]) {
  assert.ok(pkg.includes(token), 'missing truth-boundary token: ' + token);
}

for (const scenario of [
  'first day',
  'normal week',
  'learner 30% slower',
  'only 30% normal capacity',
  'three bad days / bad week',
  'W/U explosion',
  'Repair compression worsens',
  'Memory explodes / relapses',
  'Future Source late',
  'Future Source partial',
  'Future Source v2 replaces v1',
  'learner progress newer than copied plan',
  'browser restart',
  'checkpoint corrupt',
  'timer missing',
  'partial evidence',
  'stable module still receives heavy Build',
  'Chat falsely declares Secure',
  'same/exposed task presented as fresh',
  'old annual wording presented as Current',
  'full paper / handwriting'
]) {
  assert.ok(report.toLowerCase().includes(scenario.toLowerCase()), 'lifecycle scenario missing: ' + scenario);
}

for (const phrase of ['Fresh Chat attack','No-Website attack','False Secure','False Unstable','Authentic modality']) {
  assert.ok(report.includes(phrase), 'adversarial section missing: ' + phrase);
}

for (const state of ['REACTIVATE','BUILD','VERIFY','STABILIZE','MAINTAIN','ELASTIC']) {
  assert.ok(matrix.includes(state), 'dynamic-control state missing: ' + state);
}
assert.ok(matrix.includes('Protect-70'));
assert.ok(matrix.includes('Push-75'));

assert.ok(/104[- ]task/i.test(inventory));
assert.ok(inventory.toLowerCase().includes('current-year exact'));
assert.ok(scoring.toLowerCase().includes('not a precise exam-score converter'));

assert.ok(
  forecast.toLowerCase().includes('whole-cycle later-stage capacity')
  || forecast.toLowerCase().includes('later-stage workload is an explicit scenario range only')
);
assert.ok(forecast.includes('Forecast may not tell the learner'));
assert.ok(forecast.includes('P20/P50/P80'));

assert.ok(
  analysis.includes('No Website requirement')
  || analysis.includes('not a Website / Runtime lane')
);
assert.ok(
  mock.includes('No Website requirement')
  || mock.includes('does not require a dedicated Website')
);
assert.ok(ingestion.toLowerCase().includes('transitive invalidation'));
assert.ok(ingestion.toLowerCase().includes('partial'));
assert.ok(
  ingestion.toLowerCase().includes('second revision')
  || ingestion.toLowerCase().includes('v2')
);

for (const forbidden of [
  'MATERIAL BANK INCOMPLETE',
  'MATERIAL + EVIDENCE GAP',
  'MATERIAL GAP',
  'MISSING / HIGH PRIORITY',
  'CANDIDATE / SENSOR+STRESS PROOF PENDING'
]) {
  assert.equal(matrix.includes(forbidden) || inventory.includes(forbidden), false, 'stale maturity status remains: ' + forbidden);
}

console.log('PASS Politics maturity package: mother-standard 1-29 coverage, single restart, lifecycle matrix, Fresh Chat, No-Website, dynamic control, Forecast boundaries, source lifecycle, stale-status cleanup.');
