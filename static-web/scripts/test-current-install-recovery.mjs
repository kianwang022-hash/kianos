#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-install-recovery-'));
const upstream = path.join(root, 'upstream'), remote = path.join(root, 'remote.git'), mirror = path.join(root, 'mirror');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const write = (file, body) => { fs.mkdirSync(path.dirname(path.join(upstream, file)), { recursive: true }); fs.writeFileSync(path.join(upstream, file), body); };
const run = (env) => spawnSync(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], { cwd: mirror, env: { ...process.env, ...env, KIANOS_SYNC_ONCE: '1', KIANOS_BUILD_NICE: '0' }, encoding: 'utf8', timeout: 30000 });
try {
  fs.mkdirSync(upstream); git(upstream, 'init', '-b', 'main'); git(upstream, 'config', 'user.email', 'fixture@example.invalid'); git(upstream, 'config', 'user.name', 'Fixture');
  for (const name of ['kianos-current-sync.mjs', 'currentRelease.mjs', 'currentStaticImpact.mjs', 'currentStaticSlots.mjs']) write(`static-web/scripts/${name}`, fs.readFileSync(path.join(scripts, name)));
  write('static-web/package.json', '{}'); write('.gitignore', 'static-web/public/\nstatic-web/dist\nstatic-web/.current-*\n'); write('fixture.txt', 'A');
  write('static-web/scripts/kianos-static-server.mjs', `import fs from 'node:fs';import http from 'node:http';import path from 'node:path';const r=process.argv[process.argv.indexOf('--root')+1];http.createServer((q,s)=>s.end(q.url.startsWith('/__kianos-release.json')?JSON.stringify({sha:fs.existsSync(path.join(r,'bad'))?'wrong':JSON.parse(fs.readFileSync(path.join(r,'__kianos-current.json'))).sha}):'ok')).listen(+process.env.KIANOS_PORT,'127.0.0.1');`);
  git(upstream, 'add', '.'); git(upstream, 'commit', '-m', 'A'); const a = git(upstream, 'rev-parse', 'HEAD');
  git(root, 'clone', '--bare', upstream, remote); git(upstream, 'remote', 'add', 'origin', remote); git(root, 'clone', remote, mirror); fs.writeFileSync(path.join(mirror, '.git/kianos-current-mirror'), '');
  const npm = path.join(root, 'npm');
  fs.writeFileSync(npm, `#!/bin/sh\nif [ "$1" = install ]; then [ "$INSTALL_FAIL" != 1 ]; exit $?; fi\nout=""; while [ "$#" -gt 0 ]; do [ "$1" = --outDir ] && { shift; out="$1"; }; shift; done\nmkdir -p "$out"; echo built > "$out/index.html"\n`);
  fs.chmodSync(npm, 0o755);
  assert.equal(run({ KIANOS_NPM_BIN: npm }).status, 0);
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), a);
  write('fixture.txt', 'B'); git(upstream, 'add', '.'); git(upstream, 'commit', '-m', 'B'); const b = git(upstream, 'rev-parse', 'HEAD'); git(upstream, 'push', 'origin', 'main');
  const failed = run({ KIANOS_NPM_BIN: npm, INSTALL_FAIL: '1' });
  assert.notEqual(failed.status, 0); assert.equal(git(mirror, 'rev-parse', 'HEAD'), a);
  assert.equal(fs.realpathSync(path.join(root, '.kianos-current-releases/active')), fs.realpathSync(path.join(root, '.kianos-current-releases/releases', a)));
  assert.equal(run({ KIANOS_NPM_BIN: npm }).status, 0);
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), b);
  assert.equal(JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json'))).sha, b);
  write('static-web/scripts/kianos-static-server.mjs', `import http from 'node:http';http.createServer((q,s)=>s.end(q.url.startsWith('/__kianos-release.json')?'{"sha":"wrong"}':'bad')).listen(+process.env.KIANOS_PORT,'127.0.0.1');`);
  git(upstream, 'add', '.'); git(upstream, 'commit', '-m', 'bad runtime'); const c = git(upstream, 'rev-parse', 'HEAD'); git(upstream, 'push', 'origin', 'main');
  const bad = run({ KIANOS_NPM_BIN: npm });
  assert.notEqual(bad.status, 0);
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), b);
  assert.equal(fs.realpathSync(path.join(root, '.kianos-current-releases/active')), fs.realpathSync(path.join(root, '.kianos-current-releases/releases', b)));
  assert.equal(JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json'))).target_sha, c);
  const controlOnly = run({ KIANOS_NPM_BIN: npm, KIANOS_SKIP_ASTRO: '1' });
  assert.equal(controlOnly.status, 0, controlOnly.stderr);
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), c, 'control-only sync must advance the mirror');
  assert.equal(fs.realpathSync(path.join(root, '.kianos-current-releases/active')), fs.realpathSync(path.join(root, '.kianos-current-releases/releases', b)), 'control-only sync must not change the served release');
  const controlStatus = JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json')));
  assert.equal(controlStatus.sha, c);
  assert.equal(controlStatus.static_build, 'skipped');

  // Probe teardown must be bounded even when the candidate runtime ignores
  // SIGTERM. The supervisor should escalate to process-group SIGKILL before
  // releasing its delivery lock and still accept the healthy release.
  write('fixture.txt', 'D');
  write('static-web/scripts/kianos-static-server.mjs', `import fs from 'node:fs';import http from 'node:http';import path from 'node:path';const args=process.argv.slice(2),r=args[args.indexOf('--root')+1];if(args.includes('--release-probe-only'))process.on('SIGTERM',()=>{});http.createServer((q,s)=>s.end(q.url.startsWith('/__kianos-release.json')?JSON.stringify({sha:JSON.parse(fs.readFileSync(path.join(r,'__kianos-current.json'))).sha}):'ok')).listen(+process.env.KIANOS_PORT,'127.0.0.1');`);
  git(upstream, 'add', '.'); git(upstream, 'commit', '-m', 'stubborn probe runtime'); const d = git(upstream, 'rev-parse', 'HEAD'); git(upstream, 'push', 'origin', 'main');
  const probeStarted = Date.now();
  const stubborn = run({ KIANOS_NPM_BIN: npm });
  const probeElapsed = Date.now() - probeStarted;
  assert.equal(stubborn.status, 0, stubborn.stderr);
  assert.ok(probeElapsed >= 900, `probe cleanup settled before TERM grace elapsed: ${probeElapsed}ms`);
  assert.ok(probeElapsed < 10000, `probe cleanup exceeded bounded teardown: ${probeElapsed}ms`);
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), d);
  assert.equal(JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json'))).sha, d);

  console.log('CURRENT_INSTALL_RECOVERY PASS: same SHA retries install, readiness gates promotion, skip-Astro stays control-only, stubborn probe cleanup is bounded');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
