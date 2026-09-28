#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

import {
  clearCurrentAuditPin,
  readCurrentAuditPin,
  writeCurrentAuditPin
} from './currentRelease.mjs';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-current-audit-pin-'));
const upstream = path.join(root, 'upstream');
const remote = path.join(root, 'remote.git');
const mirror = path.join(root, 'mirror');
const releases = path.join(root, 'releases');
const pinPath = path.join(releases, 'audit-pin.json');
const git = (cwd, ...args) => execFileSync('git', args, {
  cwd,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe']
}).trim();

const write = (base, file, body) => {
  const target = path.join(base, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, body);
};

const freePort = async () => {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
};

let child;
let logs = '';
const waitFor = async (fn, timeoutMs = 10000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await fn()) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('CURRENT_AUDIT_PIN_TIMEOUT\n' + logs);
};

try {
  fs.mkdirSync(upstream);
  git(upstream, 'init', '-b', 'main');
  git(upstream, 'config', 'user.email', 'fixture@example.invalid');
  git(upstream, 'config', 'user.name', 'Fixture');

  for (const name of [
    'kianos-current-sync.mjs',
    'currentRelease.mjs',
    'currentStaticImpact.mjs',
    'currentStaticSlots.mjs',
    'currentDependencies.mjs',
    'currentAuditPin.mjs',
    'kianos-static-server.mjs'
  ]) {
    write(upstream, 'static-web/scripts/' + name, fs.readFileSync(path.join(scripts, name)));
  }
  write(upstream, 'static-web/package.json', '{}');
  write(upstream, '.gitignore', 'static-web/public/\nstatic-web/dist\nstatic-web/.current-*\n');
  write(upstream, 'fixture.txt', 'A\n');
  git(upstream, 'add', '.');
  git(upstream, 'commit', '-m', 'A');
  const a = git(upstream, 'rev-parse', 'HEAD');

  git(root, 'clone', '--bare', upstream, remote);
  git(upstream, 'remote', 'add', 'origin', remote);
  git(root, 'clone', remote, mirror);
  fs.writeFileSync(path.join(mirror, '.git/kianos-current-mirror'), '');

  const releaseA = path.join(releases, 'releases', a);
  const distA = path.join(releaseA, 'static-web', 'dist');
  const releaseScripts = path.join(releaseA, 'static-web', 'scripts');
  fs.mkdirSync(distA, { recursive: true });
  fs.mkdirSync(releaseScripts, { recursive: true });
  fs.copyFileSync(
    path.join(scripts, 'kianos-static-server.mjs'),
    path.join(releaseScripts, 'kianos-static-server.mjs')
  );
  fs.writeFileSync(path.join(distA, 'index.html'), '<!doctype html><title>A</title>');
  fs.writeFileSync(
    path.join(distA, '__kianos-current.json'),
    JSON.stringify({ state: 'synced', sha: a }) + '\n'
  );
  fs.mkdirSync(releases, { recursive: true });
  fs.symlinkSync(releaseA, path.join(releases, 'active'), 'dir');
  const pin = writeCurrentAuditPin(pinPath, {
    sha: a,
    issue: 'fixture-audit',
    ttlMinutes: 30
  });
  assert.equal(readCurrentAuditPin(pinPath)?.sha, a);
  assert.equal(pin.issue, 'fixture-audit');

  write(upstream, 'fixture.txt', 'B\n');
  git(upstream, 'add', 'fixture.txt');
  git(upstream, 'commit', '-m', 'B');
  const b = git(upstream, 'rev-parse', 'HEAD');
  git(upstream, 'push', 'origin', 'main');

  const port = await freePort();
  child = spawn(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], {
    cwd: mirror,
    env: {
      ...process.env,
      KIANOS_SYNC_RUNTIME_SHA: a,
      KIANOS_SKIP_ASTRO: '1',
      KIANOS_RELEASES_DIR: releases,
      KIANOS_PORT: String(port),
      KIANOS_SYNC_INTERVAL_MS: '3000',
      KIANOS_PRIVATE_DIR: path.join(root, 'private')
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  child.stdout.on('data', (chunk) => { logs += chunk; });
  child.stderr.on('data', (chunk) => { logs += chunk; });

  const statusPath = path.join(mirror, 'static-web/public/__kianos-current.json');
  await waitFor(() => {
    try {
      const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
      return status.state === 'pinned' && status.sha === a && status.target_sha === b;
    } catch {
      return false;
    }
  });

  assert.equal(git(mirror, 'rev-parse', 'HEAD'), a);
  assert.equal(fs.realpathSync(path.join(releases, 'active')), fs.realpathSync(releaseA));
  assert.match(logs, /audit pin holding Stable/);

  child.kill('SIGTERM');
  await Promise.race([
    once(child, 'exit'),
    new Promise((_, reject) => setTimeout(
      () => reject(new Error('PINNED_DAEMON_DID_NOT_EXIT')),
      4000
    ))
  ]);
  child = null;

  writeCurrentAuditPin(pinPath, { sha: b, issue: 'wrong-sha', ttlMinutes: 30 });
  const mismatch = spawnSync(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], {
    cwd: mirror,
    env: {
      ...process.env,
      KIANOS_SYNC_ONCE: '1',
      KIANOS_SKIP_ASTRO: '1',
      KIANOS_RELEASES_DIR: releases,
      KIANOS_PORT: String(port)
    },
    encoding: 'utf8',
    timeout: 10000
  });
  assert.equal(mismatch.status, 1, mismatch.stdout + mismatch.stderr);
  assert.match(
    fs.readFileSync(statusPath, 'utf8'),
    /CURRENT_AUDIT_PIN_RELEASE_MISMATCH/
  );
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), a);

  clearCurrentAuditPin(pinPath);
  const released = spawnSync(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], {
    cwd: mirror,
    env: {
      ...process.env,
      KIANOS_SYNC_ONCE: '1',
      KIANOS_SKIP_ASTRO: '1',
      KIANOS_RELEASES_DIR: releases,
      KIANOS_PORT: String(port)
    },
    encoding: 'utf8',
    timeout: 10000
  });
  assert.equal(released.status, 0, released.stdout + released.stderr);
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), b);
  assert.equal(readCurrentAuditPin(pinPath), null);

  writeCurrentAuditPin(pinPath, { sha: b, ttlMinutes: 1, now: 0 });
  assert.equal(readCurrentAuditPin(pinPath, { now: 120_000 }), null);
  assert.equal(fs.existsSync(pinPath), false);

  console.log(
    'CURRENT_AUDIT_PIN PASS: exact Stable is held, wrong-SHA fails closed, release resumes sync'
  );
} finally {
  if (child && child.exitCode === null) {
    child.kill('SIGTERM');
    await Promise.race([
      once(child, 'exit'),
      new Promise((resolve) => setTimeout(resolve, 1500))
    ]);
  }
  fs.rmSync(root, { recursive: true, force: true });
}
