#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-runtime-reload-'));
const upstream = path.join(temp, 'upstream'), mirror = path.join(temp, 'mirror'), remote = path.join(temp, 'remote.git');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const reservation = net.createServer();
reservation.listen(0, '127.0.0.1');
await once(reservation, 'listening');
const port = reservation.address().port;
await new Promise(resolve => reservation.close(resolve));
let processHandle, logs = '';
const waitFor = async (fn) => {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (await fn()) return;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error('runtime reload timeout\n' + logs);
};
try {
  fs.mkdirSync(upstream);
  git(upstream, 'init', '-b', 'main');
  git(upstream, 'config', 'user.name', 'Fixture');
  git(upstream, 'config', 'user.email', 'fixture@example.invalid');
  const write = (file, body) => {
    fs.mkdirSync(path.dirname(path.join(upstream, file)), { recursive: true });
    fs.writeFileSync(path.join(upstream, file), body);
  };
  for (const name of ['kianos-current-sync.mjs', 'currentStaticImpact.mjs', 'currentStaticSlots.mjs']) {
    write('static-web/scripts/' + name, fs.readFileSync(path.join(scripts, name)));
  }
  write('static-web/scripts/kianos-static-server.mjs', `import http from 'node:http';
import { version } from '../src/lib/fixture.mjs';
http.createServer((req, res) => res.end(version)).listen(Number(process.env.KIANOS_PORT), '127.0.0.1');`);
  write('static-web/src/lib/fixture.mjs', 'export const version = "v1";');
  write('.gitignore', 'static-web/public/\nstatic-web/.current-*\nstatic-web/dist\n');
  const commit = () => { git(upstream, 'add', '.'); git(upstream, 'commit', '-m', 'fixture'); return git(upstream, 'rev-parse', 'HEAD'); };
  commit();
  git(temp, 'clone', '--bare', upstream, remote);
  git(upstream, 'remote', 'add', 'origin', remote);
  git(temp, 'clone', remote, mirror);
  fs.writeFileSync(path.join(mirror, '.git/kianos-current-mirror'), '');
  const npm = path.join(temp, 'npm-fixture');
  fs.writeFileSync(npm, `#!/usr/bin/env node
const fs = require('fs'), path = require('path');
const root = process.argv[process.argv.indexOf('--outDir') + 1];
fs.mkdirSync(root, {recursive:true}); fs.writeFileSync(path.join(root, 'index.html'), 'fixture');`);
  fs.chmodSync(npm, 0o755);
  processHandle = spawn(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], {
    cwd: mirror, env: { ...process.env, KIANOS_PORT: String(port), KIANOS_SYNC_ONCE: '0', KIANOS_SYNC_INTERVAL_MS: '3000', KIANOS_NPM_BIN: npm, KIANOS_BUILD_NICE: '0' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  processHandle.stdout.on('data', x => { logs += x; });
  processHandle.stderr.on('data', x => { logs += x; });
  const served = async () => { try { return await (await fetch(`http://127.0.0.1:${port}`, { signal: AbortSignal.timeout(1000) })).text(); } catch { return null; } };
  await waitFor(async () => await served() === 'v1');
  write('static-web/src/lib/fixture.mjs', 'export const version = "v2";');
  const next = commit();
  git(upstream, 'push', 'origin', 'main');
  await waitFor(async () => await served() === 'v2');
  assert.equal(JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/dist/__kianos-current.json'))).sha, next);
  assert.equal((logs.match(/performing one controlled server reload/g) || []).length, 1);
  console.log('CURRENT_RUNTIME_RELOAD PASS: library-only update publishes new site and reloads server once');
} finally {
  if (processHandle && processHandle.exitCode === null) {
    processHandle.kill('SIGTERM');
    await once(processHandle, 'exit');
  }
  fs.rmSync(temp, { recursive: true, force: true });
}
