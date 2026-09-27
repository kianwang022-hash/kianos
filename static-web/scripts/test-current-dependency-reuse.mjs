#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  canReuseDependencies,
  cloneDependencies,
  dependencyIdentity,
  readDependencyProof,
  writeDependencyProof
} from './currentDependencies.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-current-deps-'));
try {
  const source = path.join(root, 'source');
  const target = path.join(root, 'target');
  const makeWeb = (dir, version = '1.0.0') => {
    fs.mkdirSync(path.join(dir, 'node_modules', '.bin'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'fixture', version, dependencies: { astro: '5.18.2' } }));
    fs.writeFileSync(path.join(dir, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: {} }));
    fs.writeFileSync(path.join(dir, 'node_modules', '.bin', process.platform === 'win32' ? 'astro.cmd' : 'astro'), 'fixture');
    fs.writeFileSync(path.join(dir, 'node_modules', 'payload.txt'), 'dependency-tree');
  };

  makeWeb(source);
  makeWeb(target);

  const identity = dependencyIdentity(source);
  writeDependencyProof(source, identity);
  assert.equal(canReuseDependencies(source, target), true, 'matching package/runtime identity should reuse');

  const cloned = cloneDependencies(source, target);
  assert(cloned.duration_ms >= 0, 'clone duration must be reported');
  assert.equal(fs.readFileSync(path.join(target, 'node_modules', 'payload.txt'), 'utf8'), 'dependency-tree');
  assert.deepEqual(readDependencyProof(target), identity);

  fs.writeFileSync(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture', version: '2.0.0', dependencies: { astro: '5.18.2' } }));
  assert.equal(canReuseDependencies(source, target), false, 'package input change must reject reuse');

  makeWeb(target);
  assert.equal(
    canReuseDependencies(source, target, { nodeVersion: 'v0.0.0', nodeAbi: '0', platform: process.platform, arch: process.arch }),
    false,
    'runtime ABI change must reject reuse'
  );

  fs.rmSync(path.join(source, 'node_modules', '.kianos-current-dependencies.json'));
  assert.equal(canReuseDependencies(source, target), false, 'missing proof must fail closed');

  console.log('CURRENT_DEPENDENCY_REUSE PASS');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
