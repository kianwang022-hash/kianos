#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-delivery-concurrency-'));
const upstream = path.join(root, 'upstream');
const remote = path.join(root, 'remote.git');
const mirror = path.join(root, 'mirror');
const releases = path.join(root, 'releases');
const events = path.join(root, 'npm-events');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const write = (file, body) => { fs.mkdirSync(path.dirname(path.join(upstream, file)), { recursive: true }); fs.writeFileSync(path.join(upstream, file), body); };
try {
  fs.mkdirSync(upstream);
  git(upstream, 'init', '-b', 'main');
  git(upstream, 'config', 'user.email', 'fixture@example.invalid');
  git(upstream, 'config', 'user.name', 'Fixture');
  for (const name of ['kianos-current-sync.mjs', 'currentRelease.mjs', 'currentStaticImpact.mjs', 'currentStaticSlots.mjs']) {
    write(`static-web/scripts/${name}`, fs.readFileSync(path.join(scripts, name)));
  }
  write('static-web/package.json', '{}');
  write('.gitignore', 'static-web/public/\nstatic-web/dist\nstatic-web/.current-*\n');
  write('static-web/scripts/kianos-static-server.mjs', `import fs from 'node:fs';import http from 'node:http';import path from 'node:path';const args=process.argv.slice(2),root=args[args.indexOf('--root')+1];http.createServer((req,res)=>{if(req.url.startsWith('/__kianos-release.json'))return res.end(fs.readFileSync(path.join(root,'__kianos-current.json')));res.end('fixture');}).listen(+process.env.KIANOS_PORT,'127.0.0.1');`);
  write('fixture.txt', 'A');
  git(upstream, 'add', '.'); git(upstream, 'commit', '-m', 'A');
  const sha = git(upstream, 'rev-parse', 'HEAD');
  git(root, 'clone', '--bare', upstream, remote);
  git(root, 'clone', remote, mirror);
  fs.writeFileSync(path.join(mirror, '.git/kianos-current-mirror'), '');

  const npm = path.join(root, 'npm-fixture');
  fs.writeFileSync(npm, `#!/bin/sh\nif [ "$1" = install ]; then echo install >> "${events}"; sleep 1; exit 0; fi\necho build >> "${events}"\nout=""; while [ "$#" -gt 0 ]; do [ "$1" = --outDir ] && { shift; out="$1"; }; shift; done\nmkdir -p "$out"; echo built > "$out/index.html"\n`);
  fs.chmodSync(npm, 0o755);
  const start = () => spawn(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], {
    cwd: mirror,
    env: { ...process.env, KIANOS_SYNC_ONCE: '1', KIANOS_NPM_BIN: npm, KIANOS_BUILD_NICE: '0', KIANOS_RELEASES_DIR: releases },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const first = start();
  await new Promise(resolve => setTimeout(resolve, 80));
  const second = start();
  const [a, b] = await Promise.all([once(first, 'exit'), once(second, 'exit')]);
  assert.equal(a[0], 0, 'first supervisor failed');
  assert.equal(b[0], 0, 'second supervisor failed');

  const rows = fs.readFileSync(events, 'utf8').trim().split('\n').filter(Boolean);
  assert.equal(rows.filter(x => x === 'install').length, 1, 'concurrent supervisors must install once');
  assert.equal(rows.filter(x => x === 'build').length, 1, 'concurrent supervisors must build once');
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), sha);
  assert.equal(fs.realpathSync(path.join(releases, 'active')), fs.realpathSync(path.join(releases, 'releases', sha)));
  assert.equal(fs.existsSync(path.join(releases, 'delivery.lock')), false, 'delivery lock must be released');
  const worktrees = git(mirror, 'worktree', 'list', '--porcelain');
  assert.equal((worktrees.match(/^worktree /gm) || []).length, 2, 'mirror + one immutable release expected');
  console.log('CURRENT_DELIVERY_CONCURRENCY PASS: two supervisors serialize into one release mutation');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
