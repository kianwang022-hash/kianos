#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const scripts = path.dirname(fileURLToPath(import.meta.url)), root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-offline-startup-')), mirror = path.join(root, 'mirror');
const port = await new Promise(resolve => { const s = net.createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
let child, logs = '';
try {
  fs.mkdirSync(path.join(mirror, '.git'), { recursive: true }); fs.writeFileSync(path.join(mirror, '.git/kianos-current-mirror'), '');
  for (const name of ['kianos-current-sync.mjs', 'currentRelease.mjs', 'currentStaticImpact.mjs', 'currentStaticSlots.mjs']) {
    const target = path.join(mirror, 'static-web/scripts', name); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(path.join(scripts, name), target);
  }
  const release = path.join(root, '.kianos-current-releases/releases/lkg'), dist = path.join(release, 'static-web/dist');
  fs.mkdirSync(dist, { recursive: true }); fs.writeFileSync(path.join(dist, 'index.html'), 'LKG_READY'); fs.writeFileSync(path.join(dist, '__kianos-current.json'), '{"sha":"lkg"}');
  fs.mkdirSync(path.join(release, 'static-web/scripts'), { recursive: true });
  fs.writeFileSync(path.join(release, 'static-web/scripts/kianos-static-server.mjs'), `import http from 'node:http';import fs from 'node:fs';import path from 'node:path';const r=process.argv[process.argv.indexOf('--root')+1];http.createServer((q,s)=>s.end(fs.readFileSync(path.join(r,q.url.startsWith('/__kianos-release')?'__kianos-current.json':'index.html')))).listen(+process.argv[process.argv.indexOf('--port')+1],'127.0.0.1');`);
  fs.symlinkSync(release, path.join(root, '.kianos-current-releases/active'));
  const fakeGit = path.join(root, 'git'); fs.writeFileSync(fakeGit, '#!/bin/sh\n[ "$1" = rev-parse ] && { echo lkg; exit 0; }\nsleep 3; exit 1\n'); fs.chmodSync(fakeGit, 0o755);
  child = spawn(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], { cwd: mirror, env: { ...process.env, KIANOS_PORT: String(port), KIANOS_GIT_BIN: fakeGit, KIANOS_GIT_TIMEOUT_MS: '1000', KIANOS_SYNC_INTERVAL_MS: '5000' }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', x => { logs += x; }); child.stderr.on('data', x => { logs += x; });
  const deadline = Date.now() + 3000;
  while (true) {
    try {
      assert.match(await (await fetch(`http://127.0.0.1:${port}`)).text(), /LKG_READY/);
      assert.doesNotMatch(logs, /sync\/build check failed/, 'LKG must be served before offline discovery degrades');
      break;
    } catch (e) {
      if (/sync\/build check failed/.test(logs)) throw new Error('OFFLINE_DISCOVERY_DEGRADED_BEFORE_LKG_READY', { cause: e });
      if (Date.now() > deadline) throw e;
      await new Promise(r => setTimeout(r, 25));
    }
  }
  await new Promise(r => setTimeout(r, 1300));
  assert.equal(child.exitCode, null); assert.match(logs, /sync\/build check failed/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json'))).state, 'degraded');
  console.log('CURRENT_OFFLINE_STARTUP PASS: daemon serves LKG before offline discovery degrades');
} finally { if (child?.exitCode === null) { child.kill('SIGTERM'); await once(child, 'exit'); } fs.rmSync(root, { recursive: true, force: true }); }
