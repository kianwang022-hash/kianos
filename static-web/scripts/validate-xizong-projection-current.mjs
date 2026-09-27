import fs from 'node:fs';
import path from 'node:path';
import {
  listCurrentXizongSystemIdentities,
  listProjectableXizongSystems
} from '../src/lib/xizong.mjs';
import {
  loadXizongSemanticBlock,
  loadXizongSemanticSystem
} from '../src/lib/xizongSemanticAdapter.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const manifestPath = path.join(repoRoot, 'content/xizong/projection/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const fail = (message) => { throw new Error(`XIZONG_PROJECTION_CURRENT_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const ids = (rows) => rows.map((row) => row?.canonical_id || row?.canonicalId).filter(Boolean).sort();

assert(manifest.schema === 'kianos.xizong.cognitive_projection.manifest.v1', `schema:${manifest.schema}`);
assert(manifest.runtime_authority === false, 'runtime-authority-must-remain-false');
assert(
  manifest.status === 'CURRENT_MATERIALIZED_A1_A2_A3_B_DERIVED_BASELINE_C_D_E_F',
  `status:${manifest.status}`
);

const validation = manifest.validation || {};
assert(validation.current_semantic_adapter === 'static-web/src/lib/xizongSemanticAdapter.mjs', 'semantic-adapter-owner');
assert(validation.current_reconciliation_validator === 'static-web/scripts/validate-xizong-projection-current.mjs', 'reconciliation-validator-owner');

const accounting = validation.eligibility_accounting || {};
const compiled = Array.isArray(accounting.compiled) ? accounting.compiled : [];
const eligibleNotCompiled = Array.isArray(accounting.eligible_not_compiled) ? accounting.eligible_not_compiled : [];
const notEligible = Array.isArray(accounting.not_eligible) ? accounting.not_eligible : [];

assert(JSON.stringify(ids(compiled)) === JSON.stringify(['A1','A2','A3','B']), `compiled:${ids(compiled).join(',')}`);
assert(JSON.stringify(ids(eligibleNotCompiled)) === JSON.stringify(['C','D','E','F']), `eligible-not-compiled:${ids(eligibleNotCompiled).join(',')}`);
assert(notEligible.length === 0, `not-eligible-count:${notEligible.length}`);
assert(
  eligibleNotCompiled.every((row) => row?.status === 'ELIGIBLE_NOT_COMPILED' && row?.runtime_projection_mode === 'DERIVED_BASELINE_CURRENT'),
  'eligible-derived-baseline-accounting'
);

const coverage = validation.coverage || {};
assert(coverage.systems === 4, `materialized-systems:${coverage.systems}`);
assert(coverage.blocks === 76, `materialized-blocks:${coverage.blocks}`);
assert(coverage.total_projection_assets === 80, `materialized-assets:${coverage.total_projection_assets}`);
assert(coverage.current_eligible_systems === 8, `current-eligible-systems:${coverage.current_eligible_systems}`);
assert(coverage.current_eligible_blocks === 159, `current-eligible-blocks:${coverage.current_eligible_blocks}`);
assert(coverage.eligible_not_compiled_blocks === 83, `eligible-not-materialized-blocks:${coverage.eligible_not_compiled_blocks}`);
assert(coverage.derived_baseline_blocks === 83, `derived-baseline-blocks:${coverage.derived_baseline_blocks}`);
assert(coverage.current_runtime_projectable_blocks === 159, `runtime-projectable-blocks:${coverage.current_runtime_projectable_blocks}`);

const roster = listCurrentXizongSystemIdentities();
assert(roster.length === 8, `current-roster:${roster.length}`);
assert(roster.every((row) => row.projectionEligible === true), 'current-owner-projectability-not-all-eligible');
const materializedCurrent = roster.filter((row) => row.projectionAccepted).map((row) => row.canonicalId).sort();
const derivedCurrent = roster.filter((row) => row.projectionEligible && !row.projectionAccepted).map((row) => row.canonicalId).sort();
assert(JSON.stringify(materializedCurrent) === JSON.stringify(['A1','A2','A3','B']), `current-materialized:${materializedCurrent.join(',')}`);
assert(JSON.stringify(derivedCurrent) === JSON.stringify(['C','D','E','F']), `current-derived:${derivedCurrent.join(',')}`);
assert(JSON.stringify(derivedCurrent) === JSON.stringify(ids(eligibleNotCompiled)), 'manifest-eligibility-drift-from-current-owners');

const projectable = listProjectableXizongSystems();
assert(projectable.length === 8, `runtime-projectable-system-count:${projectable.length}`);
assert(
  projectable.reduce((sum, row) => sum + row.blocks.length, 0) === 159,
  'runtime-projectable-block-count'
);

const expectedSemantic = {
  B: ['digestive-metabolic-endocrine-tumor', 38, 600, 170],
  C: ['hematology-immunity-infection', 27, 423, 133],
  D: ['neuro-sensory-motor-orthopedics', 27, 356, 128],
  E: ['reproductive-breast', 20, 212, 67],
  F: ['remaining-clinical', 9, 121, 40]
};
for (const [canonicalId, [systemId, blocks, kp, lg]] of Object.entries(expectedSemantic)) {
  const system = loadXizongSemanticSystem(systemId);
  assert(system.canonicalId === canonicalId, `${canonicalId}:canonical-id`);
  assert(system.identity.blockCount === blocks, `${canonicalId}:block-count:${system.identity.blockCount}`);
  assert(system.identity.kpCount === kp, `${canonicalId}:kp-count:${system.identity.kpCount}`);
  assert(system.identity.logicGroupCount === lg, `${canonicalId}:lg-count:${system.identity.logicGroupCount}`);
}

const { block: ch1 } = loadXizongSemanticBlock('hematology-immunity-infection', 'hematology-h01');
const nonContiguous = ch1.logicGroups.find((row) => row.groupId === 'c-h01-lg06');
assert(nonContiguous?.membershipMode === 'EXPLICIT_ORDINAL_LIST', `C:membership-mode:${nonContiguous?.membershipMode}`);
assert(JSON.stringify(nonContiguous?.kpOrdinals) === JSON.stringify([1,12,13]), `C:noncontiguous:${nonContiguous?.kpOrdinals}`);
assert(ch1.sourceContact.logicGroupIsAutomaticSourceChunk === false, 'C:lg-source-collapse');

const { block: dn1 } = loadXizongSemanticBlock('neuro-sensory-motor-orthopedics', 'neuro-n01');
assert(dn1.sourceContact.mode === 'WHOLE_BLOCK_SOURCE', `D:N1:source-mode:${dn1.sourceContact.mode}`);
assert(dn1.sourceContact.segments.length === 1, `D:N1:source-segments:${dn1.sourceContact.segments.length}`);

const { block: esr1 } = loadXizongSemanticBlock('reproductive-breast', 'SR1');
assert(esr1.sourceContact.mode === 'NATURAL_SOURCE_UNITS', `E:SR1:source-mode:${esr1.sourceContact.mode}`);
assert(esr1.sourceContact.segments.length === 2, `E:SR1:source-segments:${esr1.sourceContact.segments.length}`);
assert(esr1.sourceContact.segments[0].logicGroupIds.length === 0, 'E:SR1:refresh-must-not-prematurely-release-lg01');
assert(JSON.stringify(esr1.sourceContact.segments[0].contributesToLogicGroupIds) === JSON.stringify(['SR1-LG01']), 'E:SR1:refresh-contribution-binding-lost');
assert(JSON.stringify(esr1.sourceContact.segments[1].logicGroupIds) === JSON.stringify(['SR1-LG01','SR1-LG02','SR1-LG03']), 'E:SR1:accepted-content-release-binding-lost');
assert(esr1.sourceContact.contentRealizationOwner?.endsWith('e-reproductive-breast-content.json'), 'E:SR1:content-realization-owner-missing');

const { block: ff9 } = loadXizongSemanticBlock('remaining-clinical', 'F9');
assert(ff9.sourceContact.mode === 'INTEGRATION_PRIMARY', `F:F9:source-mode:${ff9.sourceContact.mode}`);

const manifestSystems = manifest.systems || {};
assert(Object.keys(manifestSystems).length === 4, `materialized-manifest-systems:${Object.keys(manifestSystems).length}`);
for (const systemId of ['hematology-immunity-infection','neuro-sensory-motor-orthopedics','reproductive-breast','remaining-clinical']) {
  assert(!manifestSystems[systemId], `${systemId}:must-not-pretend-materialized`);
}

console.log(
  'Xizong Projection Current reconciliation PASS: 4 materialized Systems / 76 Blocks + '
  + '4 Current-derived baseline Systems / 83 Blocks = 8 Systems / 159 Blocks; '
  + 'eligibility reconciles from exact Current owners and shared semantic adapter.'
);
