import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { listProjectableXizongSystems, loadXizongBlock } from '../src/lib/xizong.mjs';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';
import { buildXizongPreparedMemoryAvailability, supportsXizongPreparedMemoryBlock } from '../src/lib/xizongCompiledMemoryRelease.mjs';
import * as native from '../src/lib/xizongMemoryRelease.mjs';
// Execute the shipped page's data producer, rather than a copied algorithm.
const page = fs.readFileSync(new URL('../src/pages/xizong/memory/index.astro', import.meta.url), 'utf8');
const frontmatter = page.split('---')[1].replace(/^import .*;\n/gm, '');
const context = { listProjectableXizongSystems, loadXizongBlock, resolveXizongLearnerProjection,
  buildXizongPreparedMemoryAvailability, supportsXizongPreparedMemoryBlock };
const rows = vm.runInNewContext(`${frontmatter}\ncompiledContexts`, context);
const systems = listProjectableXizongSystems();
assert.equal(rows.length, systems.reduce((n, system) => n + system.blocks.length, 0));
let cards = 0;
for (const system of systems) for (const ref of system.blocks) {
  const { learnerObject } = resolveXizongLearnerProjection(loadXizongBlock(system.systemId, ref.blockId));
  const row = rows.find(row => row.blockId === ref.blockId);
  assert.equal(row.blockLabel, learnerObject.identity.blockLabel);
  const expected = supportsXizongPreparedMemoryBlock(learnerObject)
    ? buildXizongPreparedMemoryAvailability(learnerObject) : null;
  assert.deepEqual(row.descriptor, expected);
  if (expected) {
    // Existing native adapter remains a compiler edge; Website no longer opens it.
    assert.deepEqual(row.descriptor, native.buildXizongPreparedMemoryAvailability(learnerObject));
    cards += row.descriptor.precisionCards.length;
  }
}
const workspace = fs.readFileSync(new URL('../src/components/XizongMemoryWorkspace.astro', import.meta.url), 'utf8');
assert.ok(!workspace.includes("import('../lib/xizongMemoryRelease.mjs')"));
console.log(JSON.stringify({ status: 'PASS', blocks: rows.length, preparedCards: cards,
  scope: 'Shipped Memory page producer; complete compiled/native descriptor parity; no live learner writes' }));
