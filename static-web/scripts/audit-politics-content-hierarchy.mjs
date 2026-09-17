import fs from 'node:fs';
import path from 'node:path';
import { loadPoliticsCompiledPresentation } from '../src/lib/politicsCompiledPresentation.mjs';
import { POLITICS_CONTENT_TIERS, validatePoliticsContentHierarchy } from '../src/lib/politicsContentHierarchy.mjs';

const repoRoot = path.resolve(process.cwd(), '..');
const projectionRoot = path.join(repoRoot, 'content/politics/projection');
const manifest = JSON.parse(fs.readFileSync(path.join(projectionRoot, 'manifest.json'), 'utf8'));

const errors = [];
const stats = {
  pass: 0,
  referenceOnly: 0,
  blocked: 0,
  subjects: {},
  tiers: Object.fromEntries(POLITICS_CONTENT_TIERS.map(tier => [tier, 0]))
};

function fail(message) {
  errors.push(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function subjectParam(directory) {
  return directory === 'ethics-law' ? 'ethics_law' : directory;
}

function codeFromProjectionFile(file) {
  return path.basename(file, '.projection.json');
}

function countHierarchy(hierarchy) {
  for (const tier of POLITICS_CONTENT_TIERS) stats.tiers[tier] += hierarchy.tiers[tier].length;
}

for (const [directory, subjectMeta] of Object.entries(manifest.subjects || {})) {
  const subjectStats = stats.subjects[directory] = { pass: 0, referenceOnly: 0, blocked: 0 };
  for (const relativeFile of subjectMeta.files || []) {
    const projection = readJson(path.join(projectionRoot, relativeFile));
    const code = codeFromProjectionFile(relativeFile);
    let compiled;
    try {
      compiled = loadPoliticsCompiledPresentation(subjectParam(directory), code);
    } catch (error) {
      fail(`${relativeFile}: compile failed: ${error.message}`);
      continue;
    }
    if (!(compiled instanceof Map)) {
      fail(`${relativeFile}: compiled presentation missing`);
      continue;
    }

    for (const unit of projection.units || []) {
      const disposition = unit.projection_disposition;
      if (disposition === 'REFERENCE_ONLY') {
        stats.referenceOnly += 1;
        subjectStats.referenceOnly += 1;
        if (compiled.has(unit.unit_id)) fail(`${relativeFile}:${unit.unit_id}: REFERENCE_ONLY leaked into compiled learner hierarchy`);
        continue;
      }
      if (disposition === 'BLOCKED') {
        stats.blocked += 1;
        subjectStats.blocked += 1;
        if (compiled.has(unit.unit_id)) fail(`${relativeFile}:${unit.unit_id}: BLOCKED leaked into compiled learner hierarchy`);
        continue;
      }
      if (disposition !== 'PASS') {
        fail(`${relativeFile}:${unit.unit_id}: unknown projection disposition ${disposition || '<missing>'}`);
        continue;
      }

      stats.pass += 1;
      subjectStats.pass += 1;
      const resolved = compiled.get(unit.unit_id);
      if (!resolved) {
        fail(`${relativeFile}:${unit.unit_id}: PASS unit missing compiled hierarchy`);
        continue;
      }
      try {
        validatePoliticsContentHierarchy(resolved.hierarchy);
      } catch (error) {
        fail(`${relativeFile}:${unit.unit_id}: ${error.message}`);
        continue;
      }
      countHierarchy(resolved.hierarchy);

      const h1 = resolved.hierarchy.tiers.H1_ORIENTATION_CORE;
      const h2 = resolved.hierarchy.tiers.H2_FIRST_ROUND_CARRY;
      const h5 = resolved.hierarchy.tiers.H5_REPAIR_REFERENCE;

      if (!h1.some(item => item.kind === 'problem')) fail(`${relativeFile}:${unit.unit_id}: H1 problem missing`);
      if ((unit.primary_geometry || []).length && !h1.some(item => item.kind === 'primary')) {
        fail(`${relativeFile}:${unit.unit_id}: selected primary geometry did not resolve into H1`);
      }
      if ((unit.first_round_exact || []).length && !h2.some(item => item.kind === 'exact')) {
        fail(`${relativeFile}:${unit.unit_id}: first_round_exact did not resolve into H2`);
      }
      if (unit.chengfeng_handoff && !h1.some(item => item.kind === 'handoff')) {
        const locatorRef = unit.chengfeng_handoff.source_locator;
        const lookForRefs = unit.chengfeng_handoff.look_for || [];
        if (locatorRef || lookForRefs.length) {
          fail(`${relativeFile}:${unit.unit_id}: Chengfeng handoff has Current refs but no H1 learner handoff`);
        }
      }
      if (unit.chengfeng_handoff?.source_owner_ids?.length && !h5.some(item => item.kind === 'handoff_provenance')) {
        fail(`${relativeFile}:${unit.unit_id}: source owner ids were not demoted to H5 provenance`);
      }
    }
  }
}

const expectedPass = Object.values(manifest.subjects || {}).reduce((sum, subject) => sum + Number(subject.pass || 0), 0);
const expectedReference = Object.values(manifest.subjects || {}).reduce((sum, subject) => sum + Number(subject.reference_only || 0), 0);
const expectedBlocked = Object.values(manifest.subjects || {}).reduce((sum, subject) => sum + Number(subject.blocked || 0), 0);

if (stats.pass !== expectedPass) fail(`PASS accounting mismatch: hierarchy=${stats.pass}, manifest=${expectedPass}`);
if (stats.referenceOnly !== expectedReference) fail(`REFERENCE_ONLY accounting mismatch: hierarchy=${stats.referenceOnly}, manifest=${expectedReference}`);
if (stats.blocked !== expectedBlocked) fail(`BLOCKED accounting mismatch: hierarchy=${stats.blocked}, manifest=${expectedBlocked}`);

if (errors.length) {
  console.error(`POLITICS_CONTENT_HIERARCHY_AUDIT_FAIL (${errors.length})`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log('POLITICS_CONTENT_HIERARCHY_AUDIT_PASS');
console.log(JSON.stringify({
  expected: { pass: expectedPass, referenceOnly: expectedReference, blocked: expectedBlocked },
  resolved: stats
}, null, 2));
