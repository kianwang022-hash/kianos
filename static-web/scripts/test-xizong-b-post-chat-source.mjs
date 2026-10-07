import assert from 'node:assert/strict';
import { writeBTestProof } from './xizong-b-test-proof.mjs';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Fresh processes read isolated raw owners with cache disabled. No live edits.
const repo = fileURLToPath(new URL('../../', import.meta.url));
const adapter = new URL('../src/lib/xizongSemanticAdapter.mjs', import.meta.url).href;
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'xizong-b-source-'));
const learner = 'content/xizong/knowledge/learner/';
const system = 'content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/';
const learningPath = `${learner}b-digestive-metabolic-endocrine-tumor-learning.json`;
const mapPath = `${learner}biochemistry-27-source-map.json`;
const learning = JSON.parse(fs.readFileSync(path.join(repo, learningPath)));
const sourceMap = JSON.parse(fs.readFileSync(path.join(repo, mapPath)));
const files = [ `${system}system.json`, learningPath, mapPath, `${learner}shared-fields.json`,
  ...fs.readdirSync(path.join(repo, learner)).filter(name => name.startsWith('b-digestive-metabolic-endocrine-tumor-') && name.endsWith('.json')).map(name => `${learner}${name}`) ];
fs.cpSync(path.join(repo, system), path.join(fixture, system), { recursive: true });
files.push('content/xizong/knowledge/manifest.json', 'content/xizong/projection/manifest.json');
for (const file of new Set(files)) {
  fs.mkdirSync(path.dirname(path.join(fixture, file)), { recursive: true });
  fs.copyFileSync(path.join(repo, file), path.join(fixture, file));
}
const clone = value => JSON.parse(JSON.stringify(value));
function write(file, value) { fs.writeFileSync(path.join(fixture, file), JSON.stringify(value)); }
function run() {
  try {
    return { data: JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', `import {loadXizongSemanticSystem} from ${JSON.stringify(adapter)}; console.log(JSON.stringify(loadXizongSemanticSystem('digestive-metabolic-endocrine-tumor')));`], {
      env: { ...process.env, KIANOS_REPO_ROOT: fixture, KIANOS_XIZONG_BUILD_CACHE: '0' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 4 * 1024 * 1024 })) };
  } catch (error) { return { error: String(error.stderr || error.message) }; }
}
const negativeCases = [];
function rejects(name, mutateLearning, mutateMap, pattern) {
  const l = clone(learning); const m = clone(sourceMap); mutateLearning?.(l); mutateMap?.(m); write(learningPath, l); write(mapPath, m);
  const result = run(); assert.match(result.error || '', pattern, name); negativeCases.push(name);
}
try {
  const before = run(); assert.equal(before.error, undefined); assert.equal(before.data.blocks.length, 38);
  assert.equal(before.data.blocks.reduce((sum, block) => sum + block.logicGroups.length, 0), 170);
  for (const block of before.data.blocks) {
    const source = block.sourceContact;
    if (block.blockId.startsWith('D')) {
      assert.equal(source.mode, 'WHOLE_LOGIC_GROUP'); assert.equal(source.logicGroupIsAutomaticSourceChunk, true);
      assert.deepEqual(source.segments, block.logicGroups.map(group => ({ segmentId: `source:${group.groupId}`, kind: 'LOGIC_GROUP_SOURCE_CONTACT', logicGroupIds: [group.groupId], kpOrdinals: group.kpOrdinals })));
    } else {
      assert.equal(source.mode, 'CONSUME_GLOBAL_BIOCHEMISTRY_SOURCE_MAP_CURRENT'); assert.equal(source.logicGroupIsAutomaticSourceChunk, false);
      assert.equal(source.sourceMapOwner, mapPath); assert.equal(source.sourceLaneHash, sourceMap.source.sha256);
      assert.equal(source.closureUnit, sourceMap.block_source_closure_checkpoints[block.blockId].after_unit);
      const primary = sourceMap.source_units.filter(unit => unit.canonical_content.some(row => row.block === block.blockId && ['PRIMARY_FORMATION', 'PRIMARY_COMPLETION'].includes(row.role)));
      assert.deepEqual(source.segments.map(segment => segment.sourceUnitId), primary.map(unit => unit.id));
    }
  }
  rejects('D cannot clone A-family Source', l => { l.blocks.D1.source_contact = { mode: 'NATURAL_SOURCE_UNIT' }; }, null, /B_SOURCE_GEOMETRY_INVALID:D1/);
  rejects('D unknown mode cannot fall back', l => { l.blocks.D1.source_contact = { mode: 'UNKNOWN' }; }, null, /B_SOURCE_GEOMETRY_INVALID:D1/);
  rejects('M cannot fall back to D Source', l => { delete l.blocks.M1.source_contact; }, null, /B_SOURCE_GEOMETRY_INVALID:M1/);
  rejects('M/G exact Source owner', l => { l.blocks.G1.source_contact.source_map_owner = `${learner}shared-fields.json`; }, null, /B_SOURCE_GEOMETRY_INVALID:G1/);
  rejects('Source map status', null, m => { m.status = 'HISTORICAL'; }, /BIOCHEMISTRY_SOURCE_MAP_INVALID/);
  rejects('Source hash exact sha256', null, m => { m.source.sha256 = 'synthetic'; }, /BIOCHEMISTRY_SOURCE_HASH_INVALID/);
  rejects('duplicate Source unit', null, m => { m.source_units.push(clone(m.source_units[0])); }, /BIOCHEMISTRY_SOURCE_UNITS_INVALID/);
  rejects('unknown primary LG', null, m => { m.source_units[0].canonical_content.find(row => row.block === 'M2').logic_group = 'b-m99-lg01'; }, /BIOCHEMISTRY_SOURCE_BINDING_INVALID/);
  rejects('KP outside native LG', null, m => { m.source_units[0].canonical_content.find(row => row.block === 'M2').kp_range = [1, 9]; }, /BIOCHEMISTRY_SOURCE_BINDING_INVALID/);
  rejects('non-integer range', null, m => { m.source_units[0].canonical_content.find(row => row.block === 'M2').kp_range = [1, '5']; }, /BIOCHEMISTRY_SOURCE_BINDING_INVALID/);
  rejects('SUPPORT cannot replace PRIMARY', null, m => { m.source_units[0].canonical_content.find(row => row.block === 'M2').role = 'SUPPORT_JIT'; }, /BIOCHEMISTRY_SOURCE_COVERAGE_INCOMPLETE/);
  rejects('PRIMARY-looking alias', null, m => { m.source_units[0].canonical_content.find(row => row.block === 'M2').role = 'PRIMARY_GUESSED'; }, /BIOCHEMISTRY_SOURCE_ROLE_INVALID/);
  rejects('support cannot close Source', null, m => { m.source_units[0].canonical_content.find(row => row.block === 'M1').closes_block_source_contact = true; }, /BIOCHEMISTRY_SOURCE_CHECKPOINT_INVALID/);
  rejects('M1 cannot close at JIT', null, m => { m.block_source_closure_checkpoints.M1.after_unit = 'BIO27-S01'; }, /BIOCHEMISTRY_SOURCE_CHECKPOINT_INVALID:M1/);
  rejects('G5 must wait final Source unit', null, m => { m.block_source_closure_checkpoints.G5.after_unit = 'BIO27-S15'; }, /BIOCHEMISTRY_SOURCE_CHECKPOINT_INVALID:G5/);
  rejects('missing closure', null, m => { delete m.source_units.at(-1).canonical_content.find(row => row.block === 'G5').closes_block_source_contact; }, /BIOCHEMISTRY_SOURCE_CHECKPOINT_INVALID:G5/);
  rejects('primary cannot follow closure', null, m => { const early = m.source_units.splice(8, 1)[0]; m.source_units.push(early); }, /BIOCHEMISTRY_SOURCE_CHECKPOINT_INVALID:M1/);
  rejects('missing accepted readiness policy', l => { delete l.readiness_execution_policy; }, null, /B_READINESS_POLICY_INVALID/);
  rejects('unreviewed readiness policy', l => { l.readiness_execution_policy.authority = 'UNREVIEWED'; }, null, /B_READINESS_POLICY_INVALID/);
  rejects('missing raw required models', l => { delete l.blocks.D2.readiness.requires; }, null, /B_READINESS_REQUIRES_INVALID:D2/);
  rejects('route/block readiness owner drift', l => { l.blocks.D2.readiness.requires = ['D3']; }, null, /B_READINESS_OWNER_DRIFT:D2/);
  rejects('reviewed native IDs cannot use padded aliases', l => { l.blocks.D2.readiness.requires = ['D01']; l.system_route.readiness.D2.requires = ['D01']; }, null, /B_READINESS_MODEL_REF_INVALID:D2:D01/);
  rejects('scoped Tumor requirement cannot become ordinary cognition', l => { delete l.blocks.D21.readiness.independent_gates; }, null, /B_INDEPENDENT_GATE_UNBOUND:D21/);
  rejects('unknown scoped LG', l => { l.blocks.D21.readiness.independent_gates[0].logic_group_ids = ['b-d21-lg99']; }, null, /B_INDEPENDENT_GATE_BINDING_INVALID:D21/);
  rejects('duplicate scoped LG', l => { l.blocks.D21.readiness.independent_gates[0].logic_group_ids.push('b-d21-lg09'); }, null, /B_INDEPENDENT_GATE_BINDING_INVALID:D21/);
  rejects('Source conflict cannot move to a guessed KP', l => { l.blocks.D19.logic_groups['b-d19-lg07'].source_conflict.kp_ids = ['D19-kp18']; }, null, /B_SOURCE_CONFLICT_BINDING_INVALID:D19:b-d19-lg07/);
  rejects('Source conflict requires exact reviewed provenance', l => { l.blocks.D19.logic_groups['b-d19-lg07'].source_conflict.source_refs = []; }, null, /B_SOURCE_CONFLICT_BINDING_INVALID:D19:b-d19-lg07/);
  rejects('malformed Source conflict cannot silently clear hold', l => { l.blocks.D19.logic_groups['b-d19-lg07'].source_conflict = null; }, null, /B_SOURCE_CONFLICT_BINDING_INVALID:D19:b-d19-lg07/);
  write(learningPath, learning); write(mapPath, sourceMap);
  const rawModel = path.join(fixture, before.data.blocks.find(block => block.blockId === 'D2').sourceContact.requiredModelReadiness.requirements[0].ownerPath);
  const original = fs.readFileSync(rawModel, 'utf8'); fs.writeFileSync(rawModel, original + '\nSYNTHETIC_REQUIRED_MODEL_REVISION\n');
  const changed = run(); assert.equal(changed.error, undefined);
  assert.notEqual(changed.data.blocks.find(block => block.blockId === 'D2').sourceContact.requiredModelReadiness.witness, before.data.blocks.find(block => block.blockId === 'D2').sourceContact.requiredModelReadiness.witness, 'required native model byte change invalidates old target permission');
  assert.equal(changed.data.blocks.find(block => block.blockId === 'G1').sourceContact.requiredModelReadiness.witness, before.data.blocks.find(block => block.blockId === 'G1').sourceContact.requiredModelReadiness.witness, 'unrelated model witness unaffected');
  fs.writeFileSync(rawModel, original);
  write(learningPath, learning); write(mapPath, sourceMap); fs.rmSync(path.join(fixture, mapPath));
  assert.match(run().error || '', /BIOCHEMISTRY_SOURCE_MAP_MISSING/);
  writeBTestProof('xizong-b-post-chat-source', { freshProcess: true, cache: 'disabled', liveOwnerMutation: false, coverage: { blocks: 38, logicGroups: 170, wholeLogicGroupBlocks: 23, globalBiochemistryBlocks: 15 }, negativeCount: negativeCases.length + 1, negativeCases: [...negativeCases, 'missing Source map'] });
  console.log('B native Source raw-owner mutations PASS | fresh-process/cache-disabled | 38 Blocks/170 LGs | D whole-LG and global27 native bindings, support exclusion, final closure and malformed/missing/identity failures');
} finally { fs.rmSync(fixture, { recursive: true, force: true }); }
