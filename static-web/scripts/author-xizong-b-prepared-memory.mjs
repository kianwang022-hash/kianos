// Explicit finite authoring only. This script never runs in the runtime/build.
// Its independent reviewed fixture is the acceptance input; native loading
// supplies witnesses only after every complete item and premise is matched.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root = process.env.KIANOS_REPO_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
process.env.KIANOS_REPO_ROOT = root;
process.env.KIANOS_XIZONG_BUILD_CACHE = '0';
assert.ok(process.argv.includes('--write-reviewed'), 'Explicit --write-reviewed is required; never silently renew a stale witness.');
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const fixture = read('static-web/scripts/fixtures/b-reviewed-native-memory.json');
const {loadXizongBlock} = await import(pathToFileURL(path.join(root, 'static-web/src/lib/xizong.mjs')));
const {preparedNativeCueWitness, preparedMemoryDigest} = await import(pathToFileURL(path.join(root, 'static-web/src/lib/xizongLearningCues.mjs')));
const sharedPath = 'content/xizong/knowledge/learner/shared-fields.json';
const indexPath = 'content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning-cues.json';
const shared = read(sharedPath), index = read(indexPath);
assert.equal(index.status, 'CURRENT'); assert.equal(index.system_id, 'digestive-metabolic-endocrine-tumor'); assert.equal(index.canonical_id, 'B');
assert.match(index.authority, /^CHAT_APPROVED/);
for (const [relative, hash] of Object.entries(fixture.raw_witness_inputs)) {
  assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex'), hash, `${relative}: independent Source review stale`);
}
const learning = read('content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning.json');
assert.deepEqual(learning.readiness_execution_policy, fixture.accepted_learning_readiness.execution_policy, 'Current-target model-readiness semantics require exact independent review');
assert.deepEqual(learning.system_route.tumor_gate, fixture.accepted_learning_readiness.tumor_gate);
assert.deepEqual(learning.cross_system_handoff, fixture.accepted_learning_readiness.cross_system_handoff);
for (const [id, accepted] of Object.entries(fixture.accepted_learning_readiness.readiness_by_block)) assert.deepEqual(learning.blocks[id].readiness, accepted, `${id}: independent readiness review stale`);
for (const reviewed of fixture.accepted_learning_readiness.required_core_group_conflicts) {
  const group = learning.blocks?.[reviewed.block_id]?.logic_groups?.[reviewed.logic_group_id];
  assert.ok(group, 'Required Core-owning accepted LG disappeared');
  assert.deepEqual(group.source_conflict ?? null, reviewed.source_conflict, 'Required native LG source-conflict premise changed');
}
const ids = new Set(fixture.accepted.map(row => row.id));
assert.equal(ids.size, fixture.accepted.length);
assert.ok(index.precision_index.every(row => ids.has(row.id)), 'Unreviewed concurrent B cue exists; preserve it and stop authoring.');
const blocks = new Map();
const block = id => { if (!blocks.has(id)) blocks.set(id, loadXizongBlock(index.system_id, id)); return blocks.get(id); };
const next = [];
for (const accepted of fixture.accepted) {
  const native = block(accepted.anchor.block_id), item = structuredClone(accepted.item);
  for (const premise of accepted.native_basis.cores) {
    const owner = block(premise.blockId), kp = owner.kpRecords.find(kp => kp.kpId === premise.kpId);
    assert.ok(kp, `${accepted.id}: missing actual native premise ${premise.kpId}`);
    for (const [key, value] of Object.entries(premise)) if (!['blockId', 'sourcePath'].includes(key)) assert.deepEqual(kp[key], value, `${accepted.id}/${premise.kpId}: reviewed ${key} changed`);
    assert.equal(owner.sourcePath, premise.sourcePath);
    assert.ok(!kp.contentDiagnostics?.length);
    shared.source_bindings[owner.blockId] = owner.sourcePath;
  }
  for (const [key, value] of Object.entries(accepted.native_basis.block_qualifiers)) assert.equal(native[key], value, `${accepted.id}: reviewed ${key} changed`);
  if (accepted.anchor.logic_group_id) assert.deepEqual(native.logicGroups.find(group => group.groupId === accepted.anchor.logic_group_id), accepted.native_basis.group);
  assert.deepEqual(item.retention_metadata.required_core_refs, accepted.required_core_refs);
  const existing = shared.precision_fields[accepted.id];
  if (existing && preparedMemoryDigest(existing) !== preparedMemoryDigest(item)) {
    assert.ok(process.argv.includes('--replace-reviewed-items'), 'Reviewed qualifier amendment requires explicit --replace-reviewed-items');
    assert.equal(preparedMemoryDigest(existing), accepted.previous_authored_item_sha256, `${accepted.id}: preserve unreviewed concurrent item change`);
    assert.equal(existing.answer, item.answer, 'Qualifier amendment must preserve complete reviewed answer');
    assert.equal(existing.cue, item.cue, 'Qualifier amendment must preserve reviewed cue');
  }
  shared.precision_fields[accepted.id] = item;
}
for (const accepted of fixture.accepted) {
  const row = {id: accepted.id, cue: accepted.item.cue, anchor: accepted.anchor};
  const witness = preparedNativeCueWitness(row, block(accepted.anchor.block_id), shared.precision_fields[row.id], shared);
  assert.deepEqual(witness.owner_kp_ids, accepted.owner_kp_ids);
  row.prepared_memory_ref = {collection: 'precision_fields', owner_mode: 'NATIVE_CUE', precision_id: row.id,
    item_sha256: preparedMemoryDigest(shared.precision_fields[row.id]), ...witness};
  next.push(row);
}
index.precision_index = next;
for (const [relative, value] of [[sharedPath, shared], [indexPath, index]]) fs.writeFileSync(path.join(root, relative), JSON.stringify(value, null, 2) + '\n');
console.log(JSON.stringify({status: 'REVIEWED_AUTHORING_COMPLETE', admitted: next.length, held: fixture.dispositions.filter(row => row.status === 'HOLD').length, noRuntimeResigning: true}));
