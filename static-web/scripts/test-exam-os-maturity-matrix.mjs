#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(webRoot, '..');
const matrixPath = path.join(scriptDir, 'exam-os-maturity-matrix.json');
const outputDir = path.join(webRoot, '.qa', 'exam-os-maturity');
const outputPath = path.join(outputDir, 'result.json');
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

assert.equal(matrix.schema, 'kianos.exam-os-maturity-matrix.v1');
assert.ok(matrix.proofs && typeof matrix.proofs === 'object' && !Array.isArray(matrix.proofs));
assert.ok(Array.isArray(matrix.scenarios) && matrix.scenarios.length > 0);

const scenarioIds = new Set();
for (const scenario of matrix.scenarios) {
  assert.match(String(scenario.id || ''), /^[a-z0-9_]+$/);
  assert.equal(scenarioIds.has(scenario.id), false, 'duplicate scenario: ' + scenario.id);
  scenarioIds.add(scenario.id);
  assert.ok(Array.isArray(scenario.proof_ids) && scenario.proof_ids.length > 0, 'scenario has no proof: ' + scenario.id);
  for (const proofId of scenario.proof_ids) {
    assert.ok(matrix.proofs[proofId], 'unknown proof ' + proofId + ' in ' + scenario.id);
  }
}

const allTiers = [...new Set(Object.values(matrix.proofs).map((proof) => proof.tier))];
const requestedTiers = String(process.env.EXAM_OS_MATURITY_TIERS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const tiers = new Set(requestedTiers.length ? requestedTiers : allTiers);
for (const tier of tiers) assert.ok(allTiers.includes(tier), 'unknown maturity tier: ' + tier);

const proofResults = {};
const selectedProofIds = Object.entries(matrix.proofs)
  .filter(([, proof]) => tiers.has(proof.tier))
  .map(([proofId]) => proofId);

fs.mkdirSync(outputDir, { recursive: true });

for (const proofId of selectedProofIds) {
  const proof = matrix.proofs[proofId];
  assert.ok(Array.isArray(proof.command) && proof.command.length >= 2, 'invalid command: ' + proofId);
  const sourceArg = proof.command.find((value) => /\.(?:mjs|py)$/.test(value));
  if (sourceArg) {
    assert.equal(fs.existsSync(path.resolve(webRoot, sourceArg)), true, 'missing proof source: ' + sourceArg);
  }

  const [command, ...args] = proof.command;
  const started = Date.now();
  console.log('\n=== EXAM OS PROOF ' + proofId + ' [' + proof.tier + '] ===');
  const child = spawnSync(command, args, {
    cwd: webRoot,
    stdio: 'inherit',
    timeout: Number(proof.timeout_ms || 120000),
    env: {
      ...process.env,
      KIANOS_REPO_ROOT: repoRoot
    }
  });
  const durationMs = Date.now() - started;
  const pass = child.status === 0 && !child.error;
  proofResults[proofId] = {
    tier: proof.tier,
    pass,
    duration_ms: durationMs,
    exit_code: child.status,
    signal: child.signal || null,
    error: child.error ? String(child.error.message || child.error) : null
  };
  console.log((pass ? 'PASS ' : 'FAIL ') + proofId + ' · ' + durationMs + 'ms');
}

const scenarioResults = matrix.scenarios.map((scenario) => {
  const selected = scenario.proof_ids.every((proofId) => Object.prototype.hasOwnProperty.call(proofResults, proofId));
  const pass = selected && scenario.proof_ids.every((proofId) => proofResults[proofId].pass);
  return {
    id: scenario.id,
    description: scenario.description,
    proof_ids: scenario.proof_ids,
    status: !selected ? 'SKIPPED' : pass ? 'PASS' : 'FAIL'
  };
});

const failures = Object.entries(proofResults)
  .filter(([, result]) => !result.pass)
  .map(([proofId]) => proofId);

const report = {
  schema: 'kianos.exam-os-maturity-result.v1',
  generated_at: new Date().toISOString(),
  matrix_schema: matrix.schema,
  tiers: [...tiers],
  synthetic_gate: true,
  learner_user_validation: 'NOT_UPGRADED_BY_SYNTHETIC_GATE',
  proofs: proofResults,
  scenarios: scenarioResults,
  status: failures.length ? 'FAIL' : 'PASS'
};
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');

if (failures.length) {
  console.error('\nEXAM_OS_MATURITY FAIL: ' + failures.join(', '));
  process.exit(1);
}

const passedScenarios = scenarioResults.filter((row) => row.status === 'PASS').length;
const skippedScenarios = scenarioResults.filter((row) => row.status === 'SKIPPED').length;
console.log('\nEXAM_OS_MATURITY PASS'
  + ' | proofs=' + selectedProofIds.length
  + ' | scenarios=' + passedScenarios
  + (skippedScenarios ? ' | skipped=' + skippedScenarios : '')
  + ' | U remains real-use only');
