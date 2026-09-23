#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-build-recovery-'));
const upstream = path.join(temp, 'upstream');
const mirror = path.join(temp, 'mirror');
const remote = path.join(temp, 'remote.git');
const counter = path.join(temp, 'build-count');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
try {
  fs.mkdirSync(upstream);
  git(upstream, 'init', '-b', 'main');
  git(upstream, 'config', 'user.name', 'Fixture');
  git(upstream, 'config', 'user.email', 'fixture@example.invalid');
  fs.mkdirSync(path.join(upstream, 'static-web/scripts'), { recursive: true });
  for (const name of ['kianos-current-sync.mjs', 'currentStaticImpact.mjs', 'currentStaticSlots.mjs']) {
    fs.copyFileSync(path.join(scripts, name), path.join(upstream, 'static-web/scripts', name));
  }
  fs.writeFileSync(path.join(upstream, 'static-web/scripts/kianos-static-server.mjs'), 'setInterval(() => {}, 1000);');
  fs.writeFileSync(path.join(upstream, '.gitignore'), 'static-web/public/\nstatic-web/.current-*\nstatic-web/dist\n');
  const commit = (file, value) => {
    fs.mkdirSync(path.dirname(path.join(upstream, file)), { recursive: true });
    fs.writeFileSync(path.join(upstream, file), value);
    git(upstream, 'add', '.');
    git(upstream, 'commit', '-m', 'fixture');
    return git(upstream, 'rev-parse', 'HEAD');
  };
  const first = commit('content/xizong/explanations/fixture.json', '{}');
  git(temp, 'clone', '--bare', upstream, remote);
  git(upstream, 'remote', 'add', 'origin', remote);
  git(temp, 'clone', remote, mirror);
  fs.writeFileSync(path.join(mirror, '.git/kianos-current-mirror'), '');
  const fakeNpm = path.join(temp, 'npm-fixture');
  fs.writeFileSync(fakeNpm, `#!/usr/bin/env node
const fs = require('fs'), path = require('path');
const count = process.env.COUNTER;
fs.appendFileSync(count, 'build\\n');
if (process.env.BUILD_FAIL === '1') process.exit(1);
const root = process.argv[process.argv.indexOf('--outDir') + 1];
fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(path.join(root, 'index.html'), process.env.PAGE_TEXT || 'fixture');
`);
  fs.chmodSync(fakeNpm, 0o755);
  const run = (extra = {}) => spawnSync(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], {
    cwd: mirror, encoding: 'utf8', timeout: 15000,
    env: { ...process.env, KIANOS_SYNC_ONCE: '1', KIANOS_NPM_BIN: fakeNpm, KIANOS_BUILD_NICE: '0', COUNTER: counter, ...extra }
  });
  const count = () => fs.readFileSync(counter, 'utf8').trim().split('\n').length;
  const built = () => JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/dist/__kianos-current.json')));
  const status = () => JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json')));
  let result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(built().sha, first);
  const failed = commit('content/lexical/words/by-ordinal/o0001.json', '{"changed":true}');
  git(upstream, 'push', 'origin', 'main');
  result = run({ BUILD_FAIL: '1' });
  assert.equal(result.status, 1);
  assert.equal(count(), 2);
  assert.equal(built().sha, first, 'failed build must retain old site');
  assert.equal(status().sha, first, 'served identity must not claim failed target');
  assert.equal(status().target_sha, failed);
  assert.equal(run({ BUILD_FAIL: '1' }).status, 1);
  assert.equal(count(), 2, 'restart must not rebuild unchanged failed SHA');
  assert.equal(run({ BUILD_FAIL: '1', KIANOS_RETRY_FAILED_BUILD: '1' }).status, 1);
  assert.equal(count(), 3, 'explicit engineering retry remains possible');
  const final = commit('CURRENT.md', 'control-only after failed content update');
  git(upstream, 'push', 'origin', 'main');
  result = run({ PAGE_TEXT: 'new content' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(count(), 4, 'must not reuse stale site after failed content + control commit');
  assert.equal(built().sha, final);
  assert.equal(built().lexical_projection_required, true, 'include previously failed content in impact');
  assert.equal(fs.readFileSync(path.join(mirror, 'static-web/dist/index.html'), 'utf8'), 'new content');
  assert.equal(fs.existsSync(path.join(mirror, 'static-web/.current-build-failure.json')), false);
  assert.equal(run().status, 0);
  assert.equal(count(), 4, 'unchanged successful SHA must reuse');
  console.log('CURRENT_BUILD_RECOVERY PASS: failure retention, restart suppression, retry, served-base impact, atomic recovery');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
