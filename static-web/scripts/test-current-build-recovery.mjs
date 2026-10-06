#!/usr/bin/env node
import assert from 'node:assert/strict';
import { clientBuildContextHash } from './currentClientArtifacts.mjs';
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
const serverMarker = path.join(temp, 'server-started');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
try {
  fs.mkdirSync(upstream);
  git(upstream, 'init', '-b', 'main');
  git(upstream, 'config', 'user.name', 'Fixture');
  git(upstream, 'config', 'user.email', 'fixture@example.invalid');
  fs.mkdirSync(path.join(upstream, 'static-web/scripts'), { recursive: true });
  for (const name of ['kianos-current-sync.mjs', 'currentRelease.mjs', 'currentStaticImpact.mjs', 'currentStaticSlots.mjs', 'currentDependencies.mjs', 'currentClientArtifacts.mjs']) {
    fs.copyFileSync(path.join(scripts, name), path.join(upstream, 'static-web/scripts', name));
  }
  fs.writeFileSync(path.join(upstream, 'static-web/scripts/kianos-static-server.mjs'), `import fs from 'node:fs';import http from 'node:http';import path from 'node:path';const args=process.argv.slice(2),root=args[args.indexOf('--root')+1];fs.writeFileSync(process.env.SERVER_MARKER,String(process.pid));http.createServer((req,res)=>{if(req.url.startsWith('/__kianos-release.json'))return res.end(fs.readFileSync(path.join(root,'__kianos-current.json')));res.end('fixture');}).listen(+process.env.KIANOS_PORT,'127.0.0.1');`);
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
  const releases = path.join(temp, 'releases');
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
  const realGit = execFileSync('/usr/bin/which', ['git'], { encoding: 'utf8' }).trim();
  const fakeGit = path.join(temp, 'git-fixture');
  const checkoutPid = path.join(temp, 'checkout.pid');
  fs.writeFileSync(fakeGit, `#!/usr/bin/env node
const {spawnSync}=require('child_process'), fs=require('fs');
const args=process.argv.slice(2);
if(args.includes('worktree') && args.includes('add')) {
  fs.writeFileSync(${JSON.stringify(checkoutPid)}, String(process.pid));
  // Local checkout can take longer than the unchanged remote/control budget.
  setTimeout(() => process.exit(spawnSync(${JSON.stringify(realGit)},args,{stdio:'inherit'}).status || 0),1100);
} else process.exit(spawnSync(${JSON.stringify(realGit)},args,{stdio:'inherit'}).status || 0);
`);
  fs.chmodSync(fakeGit, 0o755);
  const baseEnv = { ...process.env, KIANOS_SYNC_ONCE: '1', KIANOS_NPM_BIN: fakeNpm,
    KIANOS_BUILD_NICE: '0', KIANOS_RELEASES_DIR: releases, KIANOS_GIT_BIN: fakeGit,
    KIANOS_GIT_TIMEOUT_MS: '1000', KIANOS_CHECKOUT_TIMEOUT_MS: '2000',
    COUNTER: counter, SERVER_MARKER: serverMarker };
  const locked = path.join(releases, 'releases', first + '-' + clientBuildContextHash(baseEnv, mirror));
  fs.mkdirSync(path.dirname(locked), { recursive: true });
  git(mirror, 'worktree', 'add', '--detach', locked, first);
  const unique = path.join(locked, 'unique-private-fixture');
  fs.writeFileSync(unique, 'preserve locked candidate bytes');
  git(mirror, 'worktree', 'lock', '--reason', 'initializing', locked);
  const run = (extra = {}) => spawnSync(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], {
    cwd: mirror, encoding: 'utf8', timeout: 15000,
    env: { ...baseEnv, ...extra }
  });
  const count = () => fs.readFileSync(counter, 'utf8').trim().split('\n').length;
  const built = () => JSON.parse(fs.readFileSync(path.join(releases, 'active/static-web/dist/__kianos-current.json')));
  const status = () => JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json')));
  let result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(built().sha, first);
  assert.equal(fs.readFileSync(unique, 'utf8'), 'preserve locked candidate bytes');
  assert.notEqual(fs.realpathSync(path.join(releases, 'active')), locked, 'locked identity must be bypassed with a fresh path');
  assert.ok(built().timings_ms.checkout >= 1100, 'checkout must survive the shorter control Git budget');
  assert.equal(git(mirror, 'worktree', 'list', '--porcelain').includes('locked initializing'), true);


  // Simulate a real migrated control mirror that still carries a stale legacy
  // dist identity. Impact must be based on the active isolated release, not
  // this obsolete control-checkout artifact.
  fs.mkdirSync(path.join(mirror, 'static-web/dist'), { recursive: true });
  fs.writeFileSync(
    path.join(mirror, 'static-web/dist/__kianos-current.json'),
    JSON.stringify({ state: 'synced', sha: 'legacy-stale-control-dist' })
  );

  const controlOnly = commit('CURRENT.md', 'control-only metadata');
  git(upstream, 'push', 'origin', 'main');
  result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(count(), 1, 'control-only update must reuse the active release without rebuilding');
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), controlOnly, 'control mirror must advance on a control-only update');
  assert.equal(built().sha, first, 'control-only update must preserve the served release identity');
  assert.equal(status().sha, first, 'browser Current SHA must remain the served release SHA');
  assert.equal(status().control_sha, controlOnly, 'control status must expose the newer control mirror SHA separately');
  assert.equal(status().static_build, 'reused');

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
  assert.equal(fs.readFileSync(path.join(releases, 'active/static-web/dist/index.html'), 'utf8'), 'new content');
  assert.equal(fs.existsSync(path.join(mirror, 'static-web/.current-build-failure.json')), false);
  assert.equal(run({ PAGE_TEXT: 'new content' }).status, 0);
  assert.equal(count(), 4, 'unchanged successful SHA must reuse');
  assert.equal(fs.existsSync(serverMarker), true, 'one-shot must probe candidate runtime readiness');
  const probePid = Number(fs.readFileSync(serverMarker, 'utf8'));
  assert.throws(() => process.kill(probePid, 0), /ESRCH/, 'one-shot readiness probe must not survive the sync');
  const accepted = fs.realpathSync(path.join(releases, 'active'));
  const previous = fs.realpathSync(path.join(releases, 'previous'));
  const cancelledAt = Date.now();
  result = run({ KIANOS_CHECKOUT_TIMEOUT_MS: '100' });
  assert.equal(result.status, 1, 'checkout cancellation must fail closed');
  assert.match(result.stderr, /git worktree add timed out after 100ms/);
  assert.ok(Date.now() - cancelledAt < 5000, 'checkout cancellation must be bounded');
  assert.throws(() => process.kill(Number(fs.readFileSync(checkoutPid)), 0), /ESRCH/, 'cancelled checkout must stop before retry');
  assert.equal(fs.realpathSync(path.join(releases, 'active')), accepted, 'timeout must preserve active');
  assert.equal(fs.realpathSync(path.join(releases, 'previous')), previous, 'timeout must preserve previous');
  assert.equal(fs.readFileSync(unique, 'utf8'), 'preserve locked candidate bytes', 'pruning must preserve locked bytes');
  assert.equal(run().status, 0, 'next bounded attempt must recover without force-unlocking old candidates');
  console.log('CURRENT_BUILD_RECOVERY PASS: failure retention, restart suppression, retry, served-base impact, atomic recovery');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
