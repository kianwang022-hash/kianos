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
const causal = read('content/politics/CAUSAL_REPAIR_POLICY.md');
const auditBrief = read('content/politics/MATURITY_FRESH_INDEPENDENT_AUDIT_BRIEF.md');
const orchestrator = read('EXAM_ORCHESTRATOR_CONTRACT.md');

assert.ok(current.includes('ACTIVE OWNER #638'));
assert.ok(current.includes('work/politics-later-readiness-20260920'));
assert.ok(/fresh independent/i.test(current));
assert.ok(current.includes('BLOCKED ON M7'));
assert.ok(stage.includes('FREEZE CANDIDATE'));
assert.ok(stage.includes('Fresh Independent / Anti-Anchored'));
assert.ok(stage.toLowerCase().includes('single result package is `maturity_package.md`'));

assert.ok(pkg.includes('FREEZE CANDIDATE'));
assert.ok(pkg.includes('BUILDER_CLOSURE_COMPLETE'));
assert.ok(pkg.includes('FRESH INDEPENDENT AUDIT REQUIRED'));
assert.equal(pkg.includes('SYSTEM_LOGIC_ACCEPTED: **YES**'), false,
  'Builder package may not self-certify SYSTEM_LOGIC_ACCEPTED before shared §23 Fresh Audit');

const crosswalkStart = pkg.indexOf('## 10. Mother-standard crosswalk');
const acceptanceStart = pkg.indexOf('### Required subject-level acceptance package');
const ledgerStart = pkg.indexOf('## 11. Execution ledger');
assert.ok(crosswalkStart >= 0 && acceptanceStart > crosswalkStart && ledgerStart > acceptanceStart);

const crosswalk = pkg.slice(crosswalkStart, acceptanceStart);
const rows = [...crosswalk.matchAll(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|/gm)]
  .map((m) => ({ n: Number(m[1]), name: m[2].trim() }));
assert.deepEqual(rows.map((r) => r.n), Array.from({ length: 29 }, (_, i) => i),
  'mother-standard crosswalk must cover the actual §0–§28 exactly once');

const expectedNames = [
  'Score closure',
  'Ability closure',
  'Material closure',
  'Method closure',
  'Evidence closure',
  'Forecast closure',
  'Dynamic control closure',
  'Future-source lifecycle closure',
  'Execution / transport closure',
  'Adversarial / failure closure',
  'Attention-cost closure',
  'Ownership / maintainability closure',
  'Fresh-Chat / no-Website falsification',
  'Real learner U closure',
  'Target authority / score semantics',
  'Construct coverage / negative space',
  'Measurement / scoring validity',
  'Decision quality / semantic safety',
  'Evidence observability / revision / material identity',
  'Adaptive generated-asset lifecycle',
  'Value of information / latency / latest useful date',
  'Future-source failure / supersession / rollback',
  'Concurrent state / bounded context',
  'Independent anti-anchored audit',
  'Adversarial methodology',
  'Causal repair / discrimination',
  'Subject specificity / anti-homogenization',
  'Stop rule',
  'Cross-subject composition / joint feasibility'
];
assert.deepEqual(rows.map((r) => r.name), expectedNames,
  'crosswalk labels must match the shared mother-standard sections rather than a local renumbering');
assert.match(crosswalk, /\| 23 \| Independent anti-anchored audit \| \*\*OPEN — HARD FREEZE BLOCKER\*\*/);
assert.match(crosswalk, /\| 28 \| Cross-subject composition \/ joint feasibility \| \*\*SHARED OWNER GATE/);

const acceptance = pkg.slice(acceptanceStart, ledgerStart);
const acceptanceRows = [...acceptance.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1]));
assert.deepEqual(acceptanceRows, Array.from({ length: 12 }, (_, i) => i + 1),
  'required subject-level acceptance package must cover items 1–12 exactly once');
assert.match(acceptance, /\| 9 \| Fresh Independent Anti-Anchored Audit result \| \*\*MISSING — FREEZE BLOCKER\*\*/);

assert.ok(orchestrator.includes('Total      425+'));
assert.ok(orchestrator.includes('Politics    70+'));
assert.ok(matrix.includes('Canonical target authority'));
assert.ok(matrix.includes('EXAM_ORCHESTRATOR_CONTRACT.md'));
assert.ok(matrix.includes('protect floor'));
assert.ok(matrix.includes('elastic upside'));
assert.ok(matrix.includes('Push 75'));

for (const state of ['REACTIVATE','BUILD','VERIFY','STABILIZE','MAINTAIN','ELASTIC']) {
  assert.ok(matrix.includes(state), 'dynamic-control state missing: ' + state);
}

assert.ok(/104[- ]task/i.test(inventory));
assert.ok(inventory.includes('SYSTEM MATERIAL READY / FINAL PERFORMANCE EVIDENCE GATED'));
assert.equal(inventory.includes('yes after revalidation'), false, 'stale generated-bank revalidation wording remains');
assert.equal(inventory.includes('Main material blockers:'), false, 'already-repaired material blockers remain stale');
assert.ok(scoring.toLowerCase().includes('not a precise exam-score converter'));

assert.ok(
  forecast.toLowerCase().includes('whole-cycle later-stage capacity')
  || forecast.toLowerCase().includes('later-stage workload is an explicit scenario range only')
);
assert.ok(forecast.includes('Forecast may not tell the learner'));
assert.ok(forecast.includes('P20/P50/P80'));

assert.ok(report.includes('BUILDER ADVERSARIAL CLOSURE COMPLETE'));
assert.ok(report.includes('5,832 combinations'));
assert.ok(/decision[- ]flip/i.test(report));
assert.ok(report.toLowerCase().includes('metamorphic'));
assert.ok(report.includes('Fresh Chat attack'));
assert.ok(report.includes('No-Website attack'));
assert.ok(report.includes('False Secure'));
assert.ok(report.includes('False Unstable'));
assert.ok(report.includes('Authentic modality'));

assert.ok(causal.includes('Observation is not diagnosis'));
assert.ok(causal.includes('Smallest discriminating check'));
assert.ok(causal.includes('same-item improvement proves Repair understanding at most'));
assert.ok(causal.includes('observation != cause != Repair != stable capability'));

assert.ok(auditBrief.includes('INVALID — blind audit contaminated'));
assert.ok(auditBrief.includes('candidate_head'));
assert.ok(auditBrief.includes('§0–§28'));
assert.ok(auditBrief.includes('all-green-but-real-fail'));
assert.ok(auditBrief.includes('over-conservative-all-green'));
assert.ok(auditBrief.includes('do **not** read'));
assert.ok(auditBrief.includes('MATURITY_PACKAGE.md'));

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

console.log('PASS Politics freeze candidate package: actual mother-standard §0–§28 crosswalk, canonical target authority, repaired material truth, causal Repair owner, adversarial methodology, and hard Fresh Independent freeze gate.');
