#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  adoptLegacyDist,
  isAtomicServingLink,
  promoteStagedBuild,
  resolveServedRoot
} from './currentStaticSlots.mjs';

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-static-slots-'));
const distPath = path.join(scratch, 'dist');
const previousPath = path.join(scratch, '.current-build-prev');
const stagePath = path.join(scratch, '.current-build-next');
const buildsRoot = path.join(scratch, '.current-builds');

const writeBuild = (root, label) => {
  fs.mkdirSync(path.join(root, '_astro'), { recursive: true });
  fs.writeFileSync(path.join(root, 'index.html'), '<html>' + label + '</html>');
  fs.writeFileSync(path.join(root, '_astro', label + '.js'), label);
};

try {
  writeBuild(distPath, 'A');
  const adopted = adoptLegacyDist({
    distPath,
    previousPath,
    buildsRoot,
    sha: 'sha-a'
  });
  assert.equal(isAtomicServingLink(distPath), true, 'DIST_NOT_ATOMIC_LINK_AFTER_ADOPT');
  assert.equal(resolveServedRoot(distPath), fs.realpathSync(adopted), 'ADOPTED_ROOT_MISMATCH');

  writeBuild(stagePath, 'B');
  const second = promoteStagedBuild({
    distPath,
    previousPath,
    stagePath,
    buildsRoot,
    sha: 'sha-b'
  });
  assert.equal(resolveServedRoot(distPath), fs.realpathSync(second.activeRoot), 'SECOND_ACTIVE_ROOT_MISMATCH');
  assert.equal(resolveServedRoot(previousPath), fs.realpathSync(adopted), 'SECOND_PREVIOUS_ROOT_MISMATCH');

  writeBuild(stagePath, 'C');
  const third = promoteStagedBuild({
    distPath,
    previousPath,
    stagePath,
    buildsRoot,
    sha: 'sha-c'
  });
  assert.equal(resolveServedRoot(distPath), fs.realpathSync(third.activeRoot), 'THIRD_ACTIVE_ROOT_MISMATCH');
  assert.equal(resolveServedRoot(previousPath), fs.realpathSync(second.activeRoot), 'THIRD_PREVIOUS_ROOT_MISMATCH');
  assert.equal(fs.existsSync(adopted), false, 'STALE_SLOT_NOT_PRUNED');
  assert.equal(fs.readdirSync(buildsRoot).length, 2, 'SLOT_RETENTION_NOT_TWO_GENERATIONS');

  console.log('STATIC_CURRENT_SLOTS PASS');
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}
