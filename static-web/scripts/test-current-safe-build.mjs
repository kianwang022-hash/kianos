#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { resolveSafeAstroBuildArgs } from './kianos-safe-astro-build.mjs';

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-safe-build-'));
const webRoot = path.join(scratch, 'static-web');
fs.mkdirSync(webRoot, { recursive: true });

try {
  const ordinary = resolveSafeAstroBuildArgs([], { managedCurrent: false, currentWebRoot: webRoot });
  assert.deepEqual(ordinary.args, []);
  assert.equal(ordinary.redirected, false);

  const managed = resolveSafeAstroBuildArgs([], { managedCurrent: true, currentWebRoot: webRoot });
  assert.equal(managed.redirected, true);
  assert.equal(managed.outDir, path.join(webRoot, '.qa', 'astro-build'));
  assert.deepEqual(managed.args.slice(-2), ['--outDir', managed.outDir]);

  const staged = resolveSafeAstroBuildArgs(['--outDir', '.current-build-next'], {
    managedCurrent: true,
    currentWebRoot: webRoot
  });
  assert.equal(staged.redirected, false);
  assert.equal(staged.outDir, path.join(webRoot, '.current-build-next'));

  assert.throws(() => resolveSafeAstroBuildArgs(['--outDir', 'dist'], {
    managedCurrent: true,
    currentWebRoot: webRoot
  }), /CURRENT_LIVE_DIST_BUILD_FORBIDDEN/);

  assert.throws(() => resolveSafeAstroBuildArgs(['--outDir=dist'], {
    managedCurrent: true,
    currentWebRoot: webRoot
  }), /CURRENT_LIVE_DIST_BUILD_FORBIDDEN/);

  console.log('CURRENT_SAFE_ASTRO_BUILD PASS: managed Current cannot mutate live dist');
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}
