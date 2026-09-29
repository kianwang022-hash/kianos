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
    fs.mkdirSync(path.join(dir, 'node_modules', 'astro'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'fixture', version, dependencies: { astro: '5.18.2' } }));
    fs.writeFileSync(path.join(dir, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: {} }));
    fs.writeFileSync(path.join(dir, 'node_modules', 'astro', 'package.json'), JSON.stringify({ name: 'astro', version: '5.18.2' }));
    fs.writeFileSync(path.join(dir, 'node_modules', 'astro', 'astro.js'), 'fixture-cli');
    fs.writeFileSync(path.join(dir, 'node_modules', '.bin', process.platform === 'win32' ? 'astro.cmd' : 'astro'), 'fixture');
    fs.writeFileSync(path.join(dir, 'node_modules', 'payload.txt'), 'dependency-tree');
  };

  makeWeb(source);
  makeWeb(target);

  const identity = dependencyIdentity(source);
  writeDependencyProof(source, identity);
  assert.equal(canReuseDependencies(source, target), true, 'matching package/runtime identity should reuse');

  const targetManifest = JSON.parse(fs.readFileSync(path.join(target, 'package.json'), 'utf8'));
  targetManifest.scripts = { dev: 'astro dev', candidate: 'node candidate.js' };
  targetManifest.version = '9.9.9';
  fs.writeFileSync(path.join(target, 'package.json'), JSON.stringify(targetManifest));
  assert.equal(
    canReuseDependencies(source, target),
    true,
    'script/metadata-only package.json drift must not invalidate the verified dependency tree'
  );
  targetManifest.dependencies.astro = '5.19.0';
  fs.writeFileSync(path.join(target, 'package.json'), JSON.stringify(targetManifest));
  assert.equal(
    canReuseDependencies(source, target),
    false,
    'dependency declaration change must invalidate reuse'
  );
  makeWeb(target);

  const cloned = cloneDependencies(source, target);
  assert(cloned.duration_ms >= 0, 'clone duration must be reported');
  assert.equal(fs.readFileSync(path.join(target, 'node_modules', 'payload.txt'), 'utf8'), 'dependency-tree');
  assert.deepEqual(readDependencyProof(target), identity);

  if (process.platform !== 'win32') {
    // Reproduce a promoted Current release whose npm .bin link was converted
    // into an absolute link to an ancestor release and that ancestor was GC'd.
    const ancestor = path.join(root, 'ancestor-release');
    const legacyTarget = path.join(root, 'legacy-target');
    makeWeb(legacyTarget);
    fs.mkdirSync(path.join(ancestor, 'node_modules', 'astro'), { recursive: true });
    fs.writeFileSync(path.join(ancestor, 'node_modules', 'astro', 'astro.js'), 'ancestor-cli');
    const sourceBin = path.join(source, 'node_modules', '.bin', 'astro');
    fs.rmSync(sourceBin, { force: true });
    fs.symlinkSync(path.join(ancestor, 'node_modules', 'astro', 'astro.js'), sourceBin);
    fs.rmSync(ancestor, { recursive: true, force: true });

    assert.equal(fs.existsSync(sourceBin), false, 'legacy absolute .bin link should be broken');
    assert.equal(
      canReuseDependencies(source, legacyTarget),
      true,
      'valid proof/package tree must remain reusable even when a derived .bin shim points at a GCd ancestor'
    );

    const legacyClone = cloneDependencies(source, legacyTarget);
    const clonedBin = path.join(legacyTarget, 'node_modules', '.bin', 'astro');
    assert.equal(fs.lstatSync(clonedBin).isSymbolicLink(), true);
    assert.equal(path.isAbsolute(fs.readlinkSync(clonedBin)), false, 'cloned .bin link must be worktree-local');
    assert.equal(
      fs.realpathSync(clonedBin),
      fs.realpathSync(path.join(legacyTarget, 'node_modules', 'astro', 'astro.js')),
      'cloned .bin link must resolve inside the target dependency tree'
    );
    assert.equal(legacyClone.rebased_bin_links >= 1, true, 'legacy absolute bin link should be rebased');
  }

  fs.writeFileSync(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture', version: '2.0.0', dependencies: { astro: '5.19.0' } }));
  assert.equal(canReuseDependencies(source, target), false, 'dependency declaration change must reject reuse');

  makeWeb(target);
  assert.equal(
    canReuseDependencies(source, target, { nodeVersion: 'v0.0.0', nodeAbi: '0', platform: process.platform, arch: process.arch }),
    false,
    'runtime ABI change must reject reuse'
  );

  fs.rmSync(path.join(source, 'node_modules', '.kianos-current-dependencies.json'));
  assert.equal(canReuseDependencies(source, target), false, 'missing proof must fail closed');

  // Real Current shape: package-lock.json is not tracked in the repo, but
  // npm install creates one as a local byproduct. The proof must preserve the
  // fresh-worktree identity captured before install so the next fresh target
  // can reuse the verified dependency tree.
  const installed = path.join(root, 'installed-with-generated-lock');
  const fresh = path.join(root, 'fresh-without-lock');
  for (const dir of [installed, fresh]) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
      name: 'fixture',
      version: '1.0.0',
      dependencies: { astro: '5.18.2' }
    }));
  }
  fs.mkdirSync(path.join(installed, 'node_modules', '.bin'), { recursive: true });
  fs.mkdirSync(path.join(installed, 'node_modules', 'astro'), { recursive: true });
  fs.writeFileSync(path.join(installed, 'node_modules', 'astro', 'package.json'), JSON.stringify({ name: 'astro', version: '5.18.2' }));
  fs.writeFileSync(path.join(installed, 'node_modules', 'astro', 'astro.js'), 'fixture-cli');
  fs.writeFileSync(
    path.join(installed, 'node_modules', '.bin', process.platform === 'win32' ? 'astro.cmd' : 'astro'),
    'fixture'
  );
  const preInstallIdentity = dependencyIdentity(installed);
  fs.writeFileSync(
    path.join(installed, 'package-lock.json'),
    JSON.stringify({ lockfileVersion: 3, packages: {} })
  );
  writeDependencyProof(installed, preInstallIdentity);
  assert.equal(
    canReuseDependencies(installed, fresh),
    true,
    'generated untracked lockfile must not poison the next fresh-worktree reuse check'
  );
  fs.writeFileSync(path.join(fresh, 'package.json'), JSON.stringify({
    name: 'fixture',
    version: '2.0.0',
    dependencies: { astro: '5.19.0' }
  }));
  assert.equal(
    canReuseDependencies(installed, fresh),
    false,
    'canonical dependency declaration change must still reject reuse'
  );

  console.log('CURRENT_DEPENDENCY_REUSE PASS');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
