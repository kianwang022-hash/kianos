#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-sync-startup-boundary-'));
const upstream = path.join(root, 'upstream');
const remote = path.join(root, 'remote.git');
const mirror = path.join(root, 'mirror');
const git = (cwd, ...args) => execFileSync('git', args, {
  cwd,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe']
}).trim();

let child;
let logs = '';
const waitFor = async (fn, timeoutMs = 10000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await fn()) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('STARTUP_BOUNDARY_TIMEOUT\n' + logs);
};
try {
  fs.mkdirSync(upstream);
  git(upstream, 'init', '-b', 'main');
  git(upstream, 'config', 'user.email', 'fixture@example.invalid');
  git(upstream, 'config', 'user.name', 'Fixture');

  const write = (file, body) => {
    const target = path.join(upstream, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, body);
  };
  for (const name of [
    'kianos-current-sync.mjs',
    'currentRelease.mjs',
    'currentStaticImpact.mjs',
    'currentStaticSlots.mjs'
  ]) {
    write('static-web/scripts/' + name, fs.readFileSync(path.join(scripts, name)));
  }
  const helper = path.join(upstream, 'static-web/scripts/currentRelease.mjs');
  const helperSource = fs.readFileSync(helper, 'utf8');
  fs.writeFileSync(helper, helperSource + '\nconsole.log("STARTUP_BOUNDARY_LOADED_A");\n');
  write('static-web/package.json', '{}');
  write('.gitignore', 'static-web/public/\nstatic-web/dist\nstatic-web/.current-*\n');

  git(upstream, 'add', '.');
  git(upstream, 'commit', '-m', 'A');
  const a = git(upstream, 'rev-parse', 'HEAD');
  git(root, 'clone', '--bare', upstream, remote);
  git(upstream, 'remote', 'add', 'origin', remote);
  git(root, 'clone', remote, mirror);
  fs.writeFileSync(path.join(mirror, '.git/kianos-current-mirror'), '');

  fs.writeFileSync(helper, helperSource + '\nconsole.log("STARTUP_BOUNDARY_LOADED_B");\n');
  git(upstream, 'add', '.');
  git(upstream, 'commit', '-m', 'B helper update');
  const b = git(upstream, 'rev-parse', 'HEAD');
  git(upstream, 'push', 'origin', 'main');
  git(mirror, 'fetch', 'origin', 'main');

  const ready = path.join(root, 'head-read-blocked');
  const proceed = path.join(root, 'continue-head-read');
  const realGit = execFileSync('which', ['git'], { encoding: 'utf8' }).trim();
  const gitWrapper = path.join(root, 'git-wrapper');
  fs.writeFileSync(gitWrapper, `#!/bin/sh
if [ "$1" = rev-parse ] && [ "$2" = HEAD ] && [ ! -f "${ready}" ]; then
  touch "${ready}"
  while [ ! -f "${proceed}" ]; do sleep 0.05; done
fi
exec "${realGit}" "$@"
`);
  fs.chmodSync(gitWrapper, 0o755);
  child = spawn(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], {
    cwd: mirror,
    env: {
      ...process.env,
      KIANOS_SYNC_RUNTIME_SHA: a,
      KIANOS_GIT_BIN: gitWrapper,
      KIANOS_SKIP_ASTRO: '1',
      KIANOS_SYNC_INTERVAL_MS: '3000'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  child.stdout.on('data', (chunk) => { logs += chunk; });
  child.stderr.on('data', (chunk) => { logs += chunk; });

  await waitFor(() => fs.existsSync(ready));
  assert.match(logs, /STARTUP_BOUNDARY_LOADED_A/);
  assert.doesNotMatch(logs, /STARTUP_BOUNDARY_LOADED_B/);

  // Simulate another accepted delivery moving the mutable mirror after the
  // launcher captured A but before the already-loaded daemon samples HEAD.
  git(mirror, 'checkout', '-B', 'main', b);
  git(mirror, 'reset', '--hard', b);
  fs.writeFileSync(proceed, 'continue\n');

  await Promise.race([once(child, 'exit'), new Promise((_, reject) => setTimeout(() => reject(new Error('STARTUP_BOUNDARY_DAEMON_DID_NOT_RESTART')), 6000))]);
  assert.equal(child.exitCode, 0, logs);
  assert.match(logs, /Current sync runtime differs from loaded daemon/);
  console.log('CURRENT_SYNC_STARTUP_BOUNDARY PASS: launcher-captured runtime SHA survives mirror movement before daemon HEAD read');
} finally {
  if (child && child.exitCode === null) {
    child.kill('SIGTERM');
    await Promise.race([once(child, 'exit'), new Promise(resolve => setTimeout(resolve, 1500))]);
  }
  fs.rmSync(root, { recursive: true, force: true });
}
