#!/usr/bin/env node
import assert from 'node:assert/strict';

process.env.KIANOS_XIZONG_BUILD_CACHE = '1';

const { listProjectableXizongSystems, loadXizongSystem, loadXizongBlock } = await import('../src/lib/xizong.mjs');
const { loadXizongSemanticSystem } = await import('../src/lib/xizongSemanticAdapter.mjs');
const { loadXizongLearningCues } = await import('../src/lib/xizongLearningCues.mjs');
const { loadXizongPathways } = await import('../src/lib/xizongPathways.mjs');

const systems = listProjectableXizongSystems();
assert(systems.length > 0, 'projectable Xizong systems required');

const system = systems.find((row) => row.systemId === 'circulation') || systems[0];
const loadedA = loadXizongSystem(system.systemId);
const loadedB = loadXizongSystem(system.systemId);
assert.strictEqual(loadedA, loadedB, 'canonical system projection should be memoized within one build process');

const firstBlock = loadedA.blocks[0];
assert(firstBlock, 'cached system must expose at least one block');
const blockBySlug = loadXizongBlock(system.systemId, firstBlock.slug);
const blockById = loadXizongBlock(system.systemId, firstBlock.blockId);
assert.strictEqual(blockBySlug, blockById, 'slug/id lookups should share one canonical block projection');

const semanticA = loadXizongSemanticSystem(system.systemId);
const semanticB = loadXizongSemanticSystem(system.systemId);
assert.strictEqual(semanticA, semanticB, 'semantic system should be memoized within one build process');

const cuesA = loadXizongLearningCues(loadedA);
const cuesB = loadXizongLearningCues(loadedA);
assert.strictEqual(cuesA, cuesB, 'learning cues should be memoized within one build process');

const pathwaysA = loadXizongPathways(loadedA);
const pathwaysB = loadXizongPathways(loadedA);
assert.strictEqual(pathwaysA, pathwaysB, 'pathways should be memoized within one build process');

console.log('XIZONG_BUILD_CACHE PASS: canonical/system/semantic/cues/pathways reuse one immutable build-process projection');
