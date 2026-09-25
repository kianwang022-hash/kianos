#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveSafeAstroBuildArgs } from './kianos-safe-astro-build.mjs';

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-safe-build-'));
const webRoot = path.join(scratch, 'static-web');
const servedRoot = path.join(scratch, 'served-release');
fs.mkdirSync(webRoot, { recursive: true });
fs.mkdirSync(servedRoot, { recursive: true });
fs.symlinkSync(servedRoot, path.join(webRoot, 'dist'), 'dir');
fs.symlinkSync(servedRoot, path.join(webRoot, 'dist-alias'), 'dir');

try {
  const ordinary = resolveSafeAstroBuildArgs([], { managedCurrent: false, currentWebRoot: webRoot });
  assert.deepEqual(ordinary.args, []);
  assert.equal(ordinary.redirected, false);

  const managed = resolveSafeAstroBuildArgs([], { managedCurrent: true, currentWebRoot: webRoot });
  assert.equal(managed.redirected, true);
  assert.equal(managed.outDir, path.join(webRoot, '.qa', 'astro-build'));

  const staged = resolveSafeAstroBuildArgs(['--outDir', '.current-build-next'], { managedCurrent: true, currentWebRoot: webRoot });
  assert.equal(staged.redirected, false);

  const forbidden = [
    'dist', 'dist/_qa', 'dist/foo/bar', 'dist/../dist/nested',
    'dist-alias', 'dist-alias/nested', path.join(servedRoot, 'absolute'), path.join(servedRoot, 'deep', 'child')
  ];
  for (const outDir of forbidden) {
    assert.throws(() => resolveSafeAstroBuildArgs(['--outDir', outDir], {
      managedCurrent: true, currentWebRoot: webRoot
    }), /CURRENT_LIVE_DIST_BUILD_FORBIDDEN/, `must reject live target alias: ${outDir}`);
  }

  for (const outDir of [path.join(webRoot, '.qa', 'astro-build'), path.join(webRoot, '.qa', 'astro-build', 'nested')]) {
    assert.equal(resolveSafeAstroBuildArgs(['--outDir', outDir], {
      managedCurrent: true, currentWebRoot: webRoot
    }).redirected, false);
  }

  console.log('CURRENT_SAFE_ASTRO_BUILD PASS: lexical, symlink-alias and physical-target live dist paths are blocked');
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}
