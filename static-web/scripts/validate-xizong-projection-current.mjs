import fs from 'node:fs';
import path from 'node:path';
import { loadXizongSemanticBlock, loadXizongSemanticSystem } from '../src/lib/xizongSemanticAdapter.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const manifestPath = path.join(repoRoot, 'content/xizong/projection/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const fail = (message) => { throw new Error(`XIZONG_PROJECTION_CURRENT_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

assert(manifest.schema === 'kianos.xizong.cognitive_projection.manifest.v1', `schema:${manifest.schema}`);
assert(manifest.runtime_authority === false, 'runtime-authority-must-remain-false');
assert(manifest.status === 'CURRENT_RECONCILED_A1_A2_A3_B_C_COMPILED', `status:${manifest.status}`);

const validation = manifest.validation || {};
assert(validation.current_semantic_adapter === 'static-web/src/lib/xizongSemanticAdapter.mjs', 'semantic-adapter-owner');
assert(validation.current_reconciliation_validator === 'static-web/scripts/validate-xizong-projection-current.mjs', 'reconciliation-validator-owner');
assert(validation.scope === 'ASSET_BINDINGS_AND_DECLARATIVE_VISIBILITY_ONLY', `validation-scope:${validation.scope}`);

const accounting = validation.eligibility_accounting || {};
const compiled = Array.isArray(accounting.compiled) ? accounting.compiled : [];
const compiledIds = compiled.map((row) => row?.canonical_id);
assert(JSON.stringify(compiledIds) === JSON.stringify(['A1', 'A2', 'A3', 'B', 'C']), `compiled:${compiledIds.join(',')}`);
const cCompiled = compiled.find((row) => row?.canonical_id === 'C');
assert(cCompiled?.system_id === 'hematology-immunity-infection', 'c-system-id');
assert(cCompiled?.status === 'ELIGIBLE_COMPILED', `c-status:${cCompiled?.status}`);
assert(cCompiled?.block_count === 27, `c-block-count:${cCompiled?.block_count}`);

const eligibleNotCompiled = Array.isArray(accounting.eligible_not_compiled) ? accounting.eligible_not_compiled : [];
assert(eligibleNotCompiled.length === 0, `eligible-not-compiled-count:${eligibleNotCompiled.length}`);

const notEligible = Array.isArray(accounting.not_eligible) ? accounting.not_eligible : [];
assert(!notEligible.some((row) => row?.canonical_id === 'C'), 'c-still-marked-not-eligible');
for (const canonicalId of ['D', 'E', 'F']) {
  assert(notEligible.some((row) => row?.canonical_id === canonicalId), `${canonicalId}:missing-not-eligible-ledger`);
}

const coverage = validation.coverage || {};
assert(coverage.systems === 5, `compiled-systems:${coverage.systems}`);
assert(coverage.blocks === 103, `compiled-blocks:${coverage.blocks}`);
assert(coverage.total_projection_assets === 108, `compiled-assets:${coverage.total_projection_assets}`);
assert(coverage.eligible_not_compiled_blocks === 0, `eligible-not-compiled-blocks:${coverage.eligible_not_compiled_blocks}`);
assert(coverage.current_eligible_systems === 5, `current-eligible-systems:${coverage.current_eligible_systems}`);
assert(coverage.current_eligible_blocks === 103, `current-eligible-blocks:${coverage.current_eligible_blocks}`);

const b = loadXizongSemanticSystem('digestive-metabolic-endocrine-tumor');
const c = loadXizongSemanticSystem('hematology-immunity-infection');
assert(b.identity.blockCount === 38 && b.identity.kpCount === 600 && b.identity.logicGroupCount === 170, 'b-current-identity');
assert(c.identity.blockCount === 27 && c.identity.kpCount === 423 && c.identity.logicGroupCount === 133, 'c-current-identity');
assert(b.sourceContactPolicy.mode === 'WHOLE_LOGIC_GROUP', `b-source-contact:${b.sourceContactPolicy.mode}`);
assert(c.sourceContactPolicy.mode === 'BLOCK_OR_CANONICAL_SOURCE_UNIT', `c-source-contact:${c.sourceContactPolicy.mode}`);

const { block: ch1 } = loadXizongSemanticBlock('hematology-immunity-infection', 'hematology-h01');
const nonContiguous = ch1.logicGroups.find((row) => row.groupId === 'c-h01-lg06');
assert(nonContiguous?.membershipMode === 'EXPLICIT_ORDINAL_LIST', `c-membership-mode:${nonContiguous?.membershipMode}`);
assert(JSON.stringify(nonContiguous?.kpOrdinals) === JSON.stringify([1, 12, 13]), `c-noncontiguous:${nonContiguous?.kpOrdinals}`);
assert(ch1.sourceContact.logicGroupIsAutomaticSourceChunk === false, 'c-lg-source-collapse');
assert(ch1.sourceContact.segments.length === 0, `c-invented-source-segments:${ch1.sourceContact.segments.length}`);

const manifestSystems = manifest.systems || {};
assert(Object.keys(manifestSystems).length === 5, `compiled-manifest-systems:${Object.keys(manifestSystems).length}`);
assert(manifestSystems['hematology-immunity-infection']?.block_count === 27, 'c-compiled-manifest-entry');

console.log('Xizong Projection Current reconciliation PASS: A1/A2/A3/B/C compiled; C explicit membership and Block/canonical Source-unit topology preserved.');
