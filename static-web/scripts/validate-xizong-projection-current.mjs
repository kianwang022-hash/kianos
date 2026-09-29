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
assert(manifest.status === 'CURRENT_RECONCILED_A1_A2_A3_B_C_D_E_F_COMPILED', `status:${manifest.status}`);

const validation = manifest.validation || {};
assert(validation.current_semantic_adapter === 'static-web/src/lib/xizongSemanticAdapter.mjs', 'semantic-adapter-owner');
assert(validation.current_reconciliation_validator === 'static-web/scripts/validate-xizong-projection-current.mjs', 'reconciliation-validator-owner');
assert(validation.scope === 'ASSET_BINDINGS_AND_DECLARATIVE_VISIBILITY_ONLY', `validation-scope:${validation.scope}`);
const accounting = validation.eligibility_accounting || {};
const compiled = Array.isArray(accounting.compiled) ? accounting.compiled : [];
const compiledIds = compiled.map((row) => row?.canonical_id);
assert(JSON.stringify(compiledIds) === JSON.stringify(['A1', 'A2', 'A3', 'B', 'C', 'D', 'E', 'F']), `compiled:${compiledIds.join(',')}`);

const cCompiled = compiled.find((row) => row?.canonical_id === 'C');
const dCompiled = compiled.find((row) => row?.canonical_id === 'D');
assert(cCompiled?.status === 'ELIGIBLE_COMPILED_P_ACCEPTED', `c-status:${cCompiled?.status}`);
assert(dCompiled?.system_id === 'neuro-sensory-motor-orthopedics', 'd-system-id');
assert(dCompiled?.status === 'ELIGIBLE_COMPILED_P_ACCEPTED', `d-status:${dCompiled?.status}`);
assert(dCompiled?.block_count === 27, `d-block-count:${dCompiled?.block_count}`);

const eligibleNotCompiled = Array.isArray(accounting.eligible_not_compiled) ? accounting.eligible_not_compiled : [];
assert(eligibleNotCompiled.length === 0, `eligible-not-compiled:${eligibleNotCompiled.length}`);
assert((accounting.not_eligible || []).length === 0, 'unexpected-not-eligible-ledger');
const coverage = validation.coverage || {};
assert(coverage.systems === 8, `compiled-systems:${coverage.systems}`);
assert(coverage.blocks === 159, `compiled-blocks:${coverage.blocks}`);
assert(coverage.total_projection_assets === 167, `compiled-assets:${coverage.total_projection_assets}`);
assert(coverage.eligible_not_compiled_blocks === 0, `eligible-not-compiled-blocks:${coverage.eligible_not_compiled_blocks}`);
assert(coverage.current_eligible_systems === 8, `current-eligible-systems:${coverage.current_eligible_systems}`);
assert(coverage.current_eligible_blocks === 159, `current-eligible-blocks:${coverage.current_eligible_blocks}`);

const b = loadXizongSemanticSystem('digestive-metabolic-endocrine-tumor');
const c = loadXizongSemanticSystem('hematology-immunity-infection');
const d = loadXizongSemanticSystem('neuro-sensory-motor-orthopedics');
const e = loadXizongSemanticSystem('reproductive-breast');
const f = loadXizongSemanticSystem('remaining-clinical');
assert(b.identity.blockCount === 38 && b.identity.kpCount === 600 && b.identity.logicGroupCount === 170, 'b-current-identity');
assert(c.identity.blockCount === 27 && c.identity.kpCount === 423 && c.identity.logicGroupCount === 133, 'c-current-identity');
assert(d.identity.blockCount === 27 && d.identity.kpCount === 356 && d.identity.logicGroupCount === 128, 'd-current-identity');
assert(e.identity.blockCount === 20 && e.identity.kpCount === 212 && e.identity.logicGroupCount === 67, 'e-current-identity');
assert(f.identity.blockCount === 9 && f.identity.kpCount === 121 && f.identity.logicGroupCount === 40, 'f-current-identity');
assert(b.sourceContactPolicy.mode === 'WHOLE_LOGIC_GROUP', `b-source-contact:${b.sourceContactPolicy.mode}`);
assert(c.sourceContactPolicy.mode === 'BLOCK_OR_CANONICAL_SOURCE_UNIT', `c-source-contact:${c.sourceContactPolicy.mode}`);
assert(d.sourceContactPolicy.mode === 'MIXED_BY_BLOCK', `d-source-contact:${d.sourceContactPolicy.mode}`);
assert(e.sourceContactPolicy.mode === 'MIXED_BY_BLOCK', `e-source-contact:${e.sourceContactPolicy.mode}`);
assert(f.sourceContactPolicy.mode === 'MIXED_BY_BLOCK', `f-source-contact:${f.sourceContactPolicy.mode}`);

const { block: dn4 } = loadXizongSemanticBlock('neuro-sensory-motor-orthopedics', 'neuro-n04');
assert(dn4.sourceContact.mode === 'NATURAL_SOURCE_UNITS', `d-n4-source:${dn4.sourceContact.mode}`);
assert(dn4.sourceContact.segments.length === 2, `d-n4-source-units:${dn4.sourceContact.segments.length}`);
const { block: dn11 } = loadXizongSemanticBlock('neuro-sensory-motor-orthopedics', 'neuro-n11');
assert(dn11.sourceContact.mode === 'INTEGRATION_PRIMARY', `d-n11-source:${dn11.sourceContact.mode}`);
assert(dn11.sourceContact.requiresPrimarySourceContact === false, 'd-n11-integration-primary-contact');
const { block: esr1 } = loadXizongSemanticBlock('reproductive-breast', 'SR1');
assert(esr1.sourceContact.mode === 'NATURAL_SOURCE_UNITS' && esr1.sourceContact.segments.length === 2, 'e-sr1-source-units');
assert(esr1.sourceContact.segments[0].logicGroupIds.length === 0 && esr1.sourceContact.segments[0].contributesToLogicGroupIds.includes('SR1-LG01'), 'e-sr1-contributes-only-boundary');
const { block: ff9 } = loadXizongSemanticBlock('remaining-clinical', 'F9');
assert(ff9.sourceContact.mode === 'INTEGRATION_PRIMARY' && ff9.sourceContact.requiresPrimarySourceContact === false, 'f-f9-integration-primary');

const manifestSystems = manifest.systems || {};
assert(Object.keys(manifestSystems).length === 8, `compiled-manifest-systems:${Object.keys(manifestSystems).length}`);
assert(manifestSystems['neuro-sensory-motor-orthopedics']?.block_count === 27, 'd-compiled-manifest-entry');
assert(manifestSystems['reproductive-breast']?.block_count === 20, 'e-compiled-manifest-entry');
assert(manifestSystems['remaining-clinical']?.block_count === 9, 'f-compiled-manifest-entry');

console.log('Xizong Projection Current reconciliation PASS: A1/A2/A3/B/C/D/E/F compiled; shared D/E/F owner normalization active.');
