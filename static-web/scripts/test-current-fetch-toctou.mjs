#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-fetch-toctou-'));
const upstream = path.join(root, 'upstream'), remote = path.join(root, 'remote.git'), mirror = path.join(root, 'mirror');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const write = (file, body) => { fs.mkdirSync(path.dirname(path.join(upstream, file)), { recursive: true }); fs.writeFileSync(path.join(upstream, file), body); };
try {
  fs.mkdirSync(upstream); git(upstream, 'init', '-b', 'main'); git(upstream, 'config', 'user.email', 'fixture@example.invalid'); git(upstream, 'config', 'user.name', 'Fixture');
  for (const name of ['kianos-current-sync.mjs', 'currentRelease.mjs', 'currentStaticImpact.mjs', 'currentStaticSlots.mjs']) write(`static-web/scripts/${name}`, fs.readFileSync(path.join(scripts, name)));
  write('static-web/package.json', '{}'); write('.gitignore', 'static-web/public/\nstatic-web/dist\nstatic-web/.current-*\n');
  write('fixture.txt', 'A'); git(upstream, 'add', '.'); git(upstream, 'commit', '-m', 'A'); const a = git(upstream, 'rev-parse', 'HEAD');
  git(root, 'clone', '--bare', upstream, remote); git(upstream, 'remote', 'add', 'origin', remote);
  write('fixture.txt', 'B'); git(upstream, 'add', '.'); git(upstream, 'commit', '-m', 'B'); const b = git(upstream, 'rev-parse', 'HEAD');
  // Make B's object reachable in the bare remote without advancing main yet.
  git(upstream, 'push', 'origin', b + ':refs/heads/staged-b');
  git(root, 'clone', remote, mirror); git(mirror, 'reset', '--hard', a); fs.writeFileSync(path.join(mirror, '.git/kianos-current-mirror'), '');
  const npm = path.join(root, 'npm');
  fs.writeFileSync(npm, `#!/bin/sh\nif [ "$1" = install ]; then exit 0; fi\nout=""; while [ "$#" -gt 0 ]; do [ "$1" = --outDir ] && { shift; out="$1"; }; shift; done\nmkdir -p "$out"; echo built > "$out/index.html"\n`);
  fs.chmodSync(npm, 0o755);
  const wrapper = path.join(root, 'git');
  const mainRef = ['refs', 'heads', 'main'].join('/');
  fs.writeFileSync(wrapper, `#!/bin/sh\nargs="$*"\ncase "$args" in *ls-remote*) echo "${a}\\t${mainRef}"; exit 0;; esac\ncase "$args" in *fetch*) git --git-dir="${remote}" update-ref ${mainRef} ${b};; esac\nexec git "$@"\n`);
  fs.chmodSync(wrapper, 0o755);
  const result = spawnSync(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], { cwd: mirror, env: { ...process.env, KIANOS_SYNC_ONCE: '1', KIANOS_GIT_BIN: wrapper, KIANOS_NPM_BIN: npm, KIANOS_BUILD_NICE: '0' }, encoding: 'utf8', timeout: 30000 });
  assert.equal(result.status, 0, result.stderr);
  const status = JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json')));
  assert.equal(status.sha, b); assert.equal(status.target_sha, b);
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), b);
  assert.equal(fs.realpathSync(path.join(root, '.kianos-current-releases/active')), fs.realpathSync(path.join(root, '.kianos-current-releases/releases', b)));
  console.log('CURRENT_FETCH_TOCTOU PASS: fetched SHA, release, control mirror, and status agree');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
