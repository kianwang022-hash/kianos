import fs from 'node:fs';
import path from 'node:path';
import { loadPoliticsCompiledPresentation } from '../src/lib/politicsCompiledPresentation.mjs';

const repoRoot = path.resolve(process.cwd(), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'content/politics/projection/manifest.json'), 'utf8'));
const subjectRoute = { history: 'history', marxism: 'marxism', mao: 'mao', xi: 'xi', 'ethics-law': 'ethics_law' };
const totals = { pass: 0, compiled: 0, referenceOnly: 0 };
const bySubject = {};
const representations = {};
const failures = [];

for (const [directory, subject] of Object.entries(manifest.subjects || {})) {
  const route = subjectRoute[directory];
  if (!route) throw new Error(`POLITICS_BATCH_UNKNOWN_SUBJECT:${directory}`);
  const summary = { pass: 0, compiled: 0, referenceOnly: Number(subject.reference_only || 0), files: 0 };
  for (const file of subject.files || []) {
    const code = path.basename(file, '.projection.json');
    const projection = JSON.parse(fs.readFileSync(path.join(repoRoot, 'content/politics/projection', file), 'utf8'));
    const selectedPass = (projection.units || []).filter((unit) => unit.projection_disposition === 'PASS');
    const compiled = loadPoliticsCompiledPresentation(route, code);
    summary.files += 1;
    summary.pass += selectedPass.length;
    summary.compiled += compiled?.size || 0;
    totals.pass += selectedPass.length;
    totals.compiled += compiled?.size || 0;

    if ((compiled?.size || 0) !== selectedPass.length) {
      failures.push(`${directory}/${code}:compiled=${compiled?.size || 0}:pass=${selectedPass.length}`);
    }

    for (const unit of compiled?.values() || []) {
      if (unit.purposeFirst !== true) failures.push(`${unit.unitId}:purposeFirst_not_enabled`);
      const kind = unit.representation?.kind || 'MISSING';
      representations[kind] = (representations[kind] || 0) + 1;
      if (unit.representation?.visible !== true) failures.push(`${unit.unitId}:representation_not_visible`);
      const hasLearnerPayload = Boolean(
        unit.problem || unit.primary?.length || unit.secondary?.length || unit.boundaries?.length ||
        unit.exact?.length || unit.takeaway?.length || unit.handoff || unit.closure
      );
      if (!hasLearnerPayload) failures.push(`${unit.unitId}:empty_learner_payload`);
    }
  }
  totals.referenceOnly += summary.referenceOnly;
  bySubject[directory] = summary;
}

const manifestPass = Object.values(manifest.subjects || {}).reduce((sum, subject) => sum + Number(subject.pass || 0), 0);
const manifestReference = Object.values(manifest.subjects || {}).reduce((sum, subject) => sum + Number(subject.reference_only || 0), 0);
if (totals.pass !== manifestPass) failures.push(`manifest_pass_mismatch:${totals.pass}:${manifestPass}`);
if (totals.referenceOnly !== manifestReference) failures.push(`manifest_reference_mismatch:${totals.referenceOnly}:${manifestReference}`);
if (totals.compiled !== manifestPass) failures.push(`compiled_total_mismatch:${totals.compiled}:${manifestPass}`);

const report = {
  schema: 'kianos.politics.purpose_first_rollout_audit.v1',
  totals,
  expected: { pass: manifestPass, referenceOnly: manifestReference },
  bySubject,
  representations,
  failures,
  status: failures.length ? 'FAIL' : 'PASS'
};

const outDir = path.join(repoRoot, 'politics-functional-audit');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'purpose-first-rollout.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failures.length) throw new Error(`POLITICS_PURPOSE_FIRST_ROLLOUT_FAIL:${failures.slice(0, 8).join('|')}`);
console.log('POLITICS_PURPOSE_FIRST_ROLLOUT_PASS');
