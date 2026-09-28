import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-current-audit-pin-'));
const mirror = path.join(root, 'mirror');
const releases = path.join(root, 'releases-root');
const bin = path.join(root, 'fake-git');
const gitLog = path.join(root, 'git.log');
const served = '1111111111111111111111111111111111111111';
const remote = '2222222222222222222222222222222222222222';

fs.mkdirSync(path.join(mirror, '.git'), { recursive: true });
fs.writeFileSync(path.join(mirror, '.git', 'kianos-current-mirror'), '');
fs.mkdirSync(path.join(mirror, 'static-web', 'scripts'), { recursive: true });
fs.mkdirSync(path.join(mirror, 'static-web', 'public'), { recursive: true });
for (const name of ['kianos-current-sync.mjs','currentRelease.mjs','currentStaticImpact.mjs','currentStaticSlots.mjs','currentDependencies.mjs']) {
  fs.copyFileSync(path.join(scripts, name), path.join(mirror, 'static-web', 'scripts', name));
}

const releaseRoot = path.join(releases, 'releases', served);
const dist = path.join(releaseRoot, 'static-web', 'dist');
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'index.html'), '<!doctype html><title>pinned</title>');
fs.writeFileSync(path.join(dist, '__kianos-current.json'), JSON.stringify({state:'synced',sha:served}) + '\n');
fs.mkdirSync(releases, { recursive: true });
fs.symlinkSync(releaseRoot, path.join(releases, 'active'));

fs.writeFileSync(bin, `#!/bin/sh
printf '%s\\n' "$*" >> "${gitLog}"
case "$1 $2" in
  "rev-parse HEAD") echo "${served}"; exit 0 ;;
  "rev-parse FETCH_HEAD") echo "${remote}"; exit 0 ;;
  "ls-remote origin") echo "${remote}  refs/heads/main"; exit 0 ;;
esac
exit 0
`);
fs.chmodSync(bin, 0o755);

const commonEnv = {
  ...process.env,
  KIANOS_RELEASES_DIR: releases,
  KIANOS_DELIVERY_LOCK: path.join(releases, 'delivery.lock')
};
const cli = (...args) => spawnSync(process.execPath, [path.join(scripts, 'kianos-current-audit-pin.mjs'), ...args], {
  env: commonEnv, encoding: 'utf8'
});
const syncOnce = () => spawnSync(process.execPath, [path.join(mirror, 'static-web', 'scripts', 'kianos-current-sync.mjs')], {
  cwd: mirror,
  env: {
    ...commonEnv,
    KIANOS_SYNC_ONCE: '1',
    KIANOS_SKIP_ASTRO: '1',
    KIANOS_GIT_BIN: bin
  },
  encoding: 'utf8'
});

try {
  const pinned = cli('pin', served);
  assert.equal(pinned.status, 0, pinned.stderr);
  assert.equal(JSON.parse(pinned.stdout).pin.sha, served);

  fs.writeFileSync(gitLog, '');
  const held = syncOnce();
  assert.equal(held.status, 0, held.stderr);
  const heldStatus = JSON.parse(fs.readFileSync(path.join(mirror, 'static-web', 'public', '__kianos-current.json'), 'utf8'));
  assert.equal(heldStatus.state, 'pinned');
  assert.equal(heldStatus.sha, served);
  assert.equal(heldStatus.pinned_sha, served);
  assert.equal(heldStatus.target_sha, remote);
  const heldGit = fs.readFileSync(gitLog, 'utf8');
  assert.match(heldGit, /rev-parse HEAD/);
  assert.match(heldGit, /ls-remote origin refs\/heads\/main/);
  assert.doesNotMatch(heldGit, /fetch origin main|checkout|reset --hard/, 'pinned sync must not fetch/build/activate/catch up');

  const wrong = cli('pin', '3333333333333333333333333333333333333333');
  assert.notEqual(wrong.status, 0, 'wrong-SHA pin must fail');
  assert.equal(JSON.parse(fs.readFileSync(path.join(releases, 'audit-pin.json'), 'utf8')).sha, served);

  const released = cli('release', served);
  assert.equal(released.status, 0, released.stderr);
  assert.equal(fs.existsSync(path.join(releases, 'audit-pin.json')), false);

  fs.writeFileSync(gitLog, '');
  const caughtUp = syncOnce();
  assert.equal(caughtUp.status, 0, caughtUp.stderr);
  const caughtStatus = JSON.parse(fs.readFileSync(path.join(mirror, 'static-web', 'public', '__kianos-current.json'), 'utf8'));
  assert.equal(caughtStatus.state, 'synced');
  assert.equal(caughtStatus.control_sha, remote);
  const catchGit = fs.readFileSync(gitLog, 'utf8');
  assert.match(catchGit, /fetch origin main --prune/);
  assert.match(catchGit, /checkout -B main/);
  assert.match(catchGit, /reset --hard/);

  console.log(JSON.stringify({
    status:'PASS',
    pin_current_served:'PASS',
    hold_later_remote:'PASS',
    status_exposes_pin_and_target:'PASS',
    wrong_sha_rejected:'PASS',
    release_pin:'PASS',
    catch_up_resumes:'PASS'
  }, null, 2));
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
