#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const scripts = path.dirname(fileURLToPath(import.meta.url)), root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-runtime-rollback-')), upstream = path.join(root, 'upstream'), remote = path.join(root, 'remote.git'), mirror = path.join(root, 'mirror');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const port = await new Promise(resolve => { const s = net.createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
let daemon, logs = '';
const wait = async (fn) => { for (let end = Date.now() + 15000; Date.now() < end; await new Promise(r => setTimeout(r, 100))) if (await fn()) return; throw new Error(logs); };
try {
  fs.mkdirSync(upstream); git(upstream, 'init', '-b', 'main'); git(upstream, 'config', 'user.email', 'fixture@example.invalid'); git(upstream, 'config', 'user.name', 'Fixture');
  const write = (f, x) => { fs.mkdirSync(path.dirname(path.join(upstream, f)), { recursive: true }); fs.writeFileSync(path.join(upstream, f), x); };
  for (const n of ['kianos-current-sync.mjs', 'currentRelease.mjs', 'currentStaticImpact.mjs', 'currentStaticSlots.mjs']) write(`static-web/scripts/${n}`, fs.readFileSync(path.join(scripts, n)));
  write('static-web/package.json', '{}'); write('.gitignore', 'static-web/public/\nstatic-web/dist\nstatic-web/.current-*\n');
  write('static-web/scripts/kianos-static-server.mjs', `import fs from 'node:fs';import http from 'node:http';import path from 'node:path';const r=process.argv[process.argv.indexOf('--root')+1],bad=fs.existsSync(path.join(r,'bad'));http.createServer((q,s)=>s.end(q.url.startsWith('/__kianos-release.json')?JSON.stringify({sha:bad?'wrong':JSON.parse(fs.readFileSync(path.join(r,'__kianos-current.json'))).sha}):bad?'B':'A')).listen(+process.env.KIANOS_PORT,'127.0.0.1');`);
  git(upstream, 'add', '.'); git(upstream, 'commit', '-m', 'A'); const a = git(upstream, 'rev-parse', 'HEAD'); git(root, 'clone', '--bare', upstream, remote); git(upstream, 'remote', 'add', 'origin', remote); git(root, 'clone', remote, mirror); fs.writeFileSync(path.join(mirror, '.git/kianos-current-mirror'), '');
  const npm = path.join(root, 'npm'); fs.writeFileSync(npm, '#!/bin/sh\n[ "$1" = install ] && exit 0\nout="";while [ "$#" -gt 0 ];do [ "$1" = --outDir ]&&{ shift;out="$1";};shift;done;mkdir -p "$out";echo x>"$out/index.html"\n'); fs.chmodSync(npm, 0o755);
  daemon = spawn(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], { cwd: mirror, env: { ...process.env, KIANOS_PORT: String(port), KIANOS_NPM_BIN: npm, KIANOS_BUILD_NICE: '0', KIANOS_SYNC_INTERVAL_MS: '3000' }, stdio: ['ignore', 'pipe', 'pipe'] }); daemon.stdout.on('data', x => logs += x); daemon.stderr.on('data', x => logs += x);
  await wait(async () => { try { return await (await fetch(`http://127.0.0.1:${port}`)).text() === 'A'; } catch { return false; } });
  write('static-web/scripts/kianos-static-server.mjs', `import http from 'node:http';http.createServer((q,s)=>s.end(q.url.startsWith('/__kianos-release.json')?'{"sha":"wrong"}':'B')).listen(+process.env.KIANOS_PORT,'127.0.0.1');`); git(upstream, 'add', '.'); git(upstream, 'commit', '-m', 'B'); const b = git(upstream, 'rev-parse', 'HEAD'); git(upstream, 'push', 'origin', 'main');
  await wait(async () => {
    if (!/rolling back/.test(logs)) return false;
    try {
      if (await (await fetch(`http://127.0.0.1:${port}`)).text() !== 'A') return false;
      const status = JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json')));
      return status.state === 'degraded' && status.target_sha === b;
    } catch { return false; }
  });
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), a);
  assert.equal(fs.realpathSync(path.join(root, '.kianos-current-releases/active')), fs.realpathSync(path.join(root, '.kianos-current-releases/releases', a)));
  const status = JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json'))); assert.equal(status.state, 'degraded'); assert.equal(status.target_sha, b);
  console.log('CURRENT_RUNTIME_ROLLBACK PASS: daemon rejects B and restores serviceable A without mirror advancement');
} finally { if (daemon?.exitCode === null) { daemon.kill('SIGTERM'); await once(daemon, 'exit'); } fs.rmSync(root, { recursive: true, force: true }); }
