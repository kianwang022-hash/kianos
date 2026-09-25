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
fs.symlinkSync(path.join(servedRoot, 'future-explicit'), path.join(webRoot, 'dist-dangling'), 'dir');

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
    'dist-alias', 'dist-alias/nested', 'dist-dangling', 'dist-dangling/nested',
    path.join(servedRoot, 'absolute'), path.join(servedRoot, 'deep', 'child')
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

  // On case-insensitive filesystems (the real managed macOS target), an
  // alternate spelling such as DIST/foo physically resolves under dist.
  // Existing path components must be realpath-canonicalized before compare.
  const legacyWebRoot = path.join(scratch, 'legacy-static-web');
  fs.mkdirSync(path.join(legacyWebRoot, 'dist'), { recursive: true });
  if (fs.existsSync(path.join(legacyWebRoot, 'DIST'))) {
    assert.throws(() => resolveSafeAstroBuildArgs(['--outDir', 'DIST/qa'], {
      managedCurrent: true, currentWebRoot: legacyWebRoot
    }), /CURRENT_LIVE_DIST_BUILD_FORBIDDEN/, 'case-variant live dist path must be rejected on case-insensitive filesystems');
  }

  // The implicit QA redirect must be physically contained too. If `.qa`
  // itself resolves into the live served release, a default build must fail
  // before rm/write touches that target.
  fs.rmSync(path.join(webRoot, '.qa'), { recursive: true, force: true });
  fs.symlinkSync(path.join(servedRoot, 'future-qa'), path.join(webRoot, '.qa'), 'dir');
  assert.throws(() => resolveSafeAstroBuildArgs([], {
    managedCurrent: true, currentWebRoot: webRoot
  }), /CURRENT_LIVE_DIST_BUILD_FORBIDDEN/, 'default QA output must reject a .qa symlink into live dist');

  console.log('CURRENT_SAFE_ASTRO_BUILD PASS: explicit and default outputs cannot reach live dist through lexical or symlink aliases');
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}
