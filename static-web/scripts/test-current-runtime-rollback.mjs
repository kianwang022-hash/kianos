#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-runtime-rollback-'));
const upstream = path.join(root, 'upstream');
const remote = path.join(root, 'remote.git');
const mirror = path.join(root, 'mirror');
const git = (cwd, ...args) => execFileSync('git', args, {
  cwd,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe']
}).trim();
const port = await new Promise((resolve) => {
  const server = net.createServer().listen(0, '127.0.0.1', () => {
    const value = server.address().port;
    server.close(() => resolve(value));
  });
});
let daemon;
let logs = '';
const wait = async (fn) => {
  for (let end = Date.now() + 15000; Date.now() < end; await new Promise((resolve) => setTimeout(resolve, 100))) {
    if (await fn()) return;
  }
  throw new Error(logs);
};

try {
  fs.mkdirSync(upstream);
  git(upstream, 'init', '-b', 'main');
  git(upstream, 'config', 'user.email', 'fixture@example.invalid');
  git(upstream, 'config', 'user.name', 'Fixture');

  const write = (file, body) => {
    fs.mkdirSync(path.dirname(path.join(upstream, file)), { recursive: true });
    fs.writeFileSync(path.join(upstream, file), body);
  };

  for (const name of ['kianos-current-sync.mjs', 'currentRelease.mjs', 'currentStaticImpact.mjs', 'currentStaticSlots.mjs']) {
    write(`static-web/scripts/${name}`, fs.readFileSync(path.join(scripts, name)));
  }
  write('static-web/package.json', '{}');
  write('.gitignore', 'static-web/public/\nstatic-web/dist\nstatic-web/.current-*\n');
  write(
    'static-web/scripts/kianos-static-server.mjs',
    `import fs from 'node:fs';import http from 'node:http';import path from 'node:path';const r=process.argv[process.argv.indexOf('--root')+1];http.createServer((q,s)=>s.end(q.url.startsWith('/__kianos-release.json')?JSON.stringify({sha:JSON.parse(fs.readFileSync(path.join(r,'__kianos-current.json'))).sha}):'A')).listen(+process.env.KIANOS_PORT,'127.0.0.1');`
  );

  git(upstream, 'add', '.');
  git(upstream, 'commit', '-m', 'A');
  const a = git(upstream, 'rev-parse', 'HEAD');
  git(root, 'clone', '--bare', upstream, remote);
  git(upstream, 'remote', 'add', 'origin', remote);
  git(root, 'clone', remote, mirror);
  fs.writeFileSync(path.join(mirror, '.git/kianos-current-mirror'), '');

  fs.mkdirSync(path.join(mirror, 'static-web/dist'), { recursive: true });
  fs.writeFileSync(path.join(mirror, 'static-web/dist/index.html'), 'A');
  fs.writeFileSync(
    path.join(mirror, 'static-web/dist/__kianos-current.json'),
    JSON.stringify({ sha: a })
  );

  // B fails its pre-activation probe. Legacy A must remain active/serviceable.
  write(
    'static-web/scripts/kianos-static-server.mjs',
    `import http from 'node:http';http.createServer((q,s)=>s.end(q.url.startsWith('/__kianos-release.json')?'{"sha":"wrong"}':'B')).listen(+process.env.KIANOS_PORT,'127.0.0.1');`
  );
  git(upstream, 'add', '.');
  git(upstream, 'commit', '-m', 'B bad probe');
  const b = git(upstream, 'rev-parse', 'HEAD');
  git(upstream, 'push', 'origin', 'main');

  const npm = path.join(root, 'npm');
  fs.writeFileSync(
    npm,
    '#!/bin/sh\n[ "$1" = install ] && exit 0\nout=""\nwhile [ "$#" -gt 0 ]; do [ "$1" = --outDir ] && { shift; out="$1"; }; shift; done\nmkdir -p "$out"\necho x > "$out/index.html"\n'
  );
  fs.chmodSync(npm, 0o755);

  daemon = spawn(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], {
    cwd: mirror,
    env: {
      ...process.env,
      KIANOS_PORT: String(port),
      KIANOS_NPM_BIN: npm,
      KIANOS_BUILD_NICE: '0',
      KIANOS_SYNC_INTERVAL_MS: '3000'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  daemon.stdout.on('data', (chunk) => { logs += chunk; });
  daemon.stderr.on('data', (chunk) => { logs += chunk; });

  await wait(async () => {
    try { return await (await fetch(`http://127.0.0.1:${port}`)).text() === 'A'; }
    catch { return false; }
  });

  await wait(async () => {
    if (!/probe failed before activation; keeping current release/.test(logs)) return false;
    try {
      if (await (await fetch(`http://127.0.0.1:${port}`)).text() !== 'A') return false;
      const status = JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json')));
      return status.state === 'degraded' && status.target_sha === b;
    } catch {
      return false;
    }
  });
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), a);
  assert.equal(fs.existsSync(path.join(root, '.kianos-current-releases/active')), false);
  assert.equal(fs.existsSync(path.join(root, '.kianos-current-releases/releases', b)), false, 'failed B release worktree must be removed');
  assert.equal(git(mirror, 'worktree', 'list', '--porcelain').includes(b), false, 'failed B worktree metadata must be removed');

  // C is healthy and becomes the first isolated active release.
  write(
    'static-web/scripts/kianos-static-server.mjs',
    `import fs from 'node:fs';import http from 'node:http';import path from 'node:path';const r=process.argv[process.argv.indexOf('--root')+1];http.createServer((q,s)=>s.end(q.url.startsWith('/__kianos-release.json')?JSON.stringify({sha:JSON.parse(fs.readFileSync(path.join(r,'__kianos-current.json'))).sha}):'C')).listen(+process.env.KIANOS_PORT,'127.0.0.1');`
  );
  write('fixture.txt', 'C');
  git(upstream, 'add', '.');
  git(upstream, 'commit', '-m', 'C healthy');
  const c = git(upstream, 'rev-parse', 'HEAD');
  git(upstream, 'push', 'origin', 'main');

  await wait(async () => {
    try {
      if (await (await fetch(`http://127.0.0.1:${port}`)).text() !== 'C') return false;
      if (git(mirror, 'rev-parse', 'HEAD') !== c) return false;
      const status = JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json')));
      return status.state === 'synced' && status.sha === c;
    } catch {
      return false;
    }
  });
  const active = path.join(root, '.kianos-current-releases/active');
  assert.equal(
    fs.realpathSync(active),
    fs.realpathSync(path.join(root, '.kianos-current-releases/releases', c))
  );

  // D fails before activation. Healthy isolated C must remain active; the
  // failure must not invoke rollback and downgrade/remove the current release.
  const dLogStart = logs.length;
  write(
    'static-web/scripts/kianos-static-server.mjs',
    `import http from 'node:http';http.createServer((q,s)=>s.end(q.url.startsWith('/__kianos-release.json')?'{"sha":"wrong"}':'D')).listen(+process.env.KIANOS_PORT,'127.0.0.1');`
  );
  write('fixture.txt', 'D');
  git(upstream, 'add', '.');
  git(upstream, 'commit', '-m', 'D bad preactivation probe');
  const d = git(upstream, 'rev-parse', 'HEAD');
  git(upstream, 'push', 'origin', 'main');

  await wait(async () => {
    if (!/probe failed before activation; keeping current release/.test(logs.slice(dLogStart))) return false;
    try {
      if (await (await fetch(`http://127.0.0.1:${port}`)).text() !== 'C') return false;
      const status = JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json')));
      return status.state === 'degraded' && status.target_sha === d;
    } catch {
      return false;
    }
  });
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), c);
  assert.equal(
    fs.realpathSync(active),
    fs.realpathSync(path.join(root, '.kianos-current-releases/releases', c)),
    'pre-activation probe failure must preserve the current healthy active release'
  );
  assert.equal(fs.existsSync(path.join(root, '.kianos-current-releases/releases', d)), false, 'failed D release worktree must be removed');
  assert.equal(git(mirror, 'worktree', 'list', '--porcelain').includes(d), false, 'failed D worktree metadata must be removed');

  console.log('CURRENT_RUNTIME_ROLLBACK PASS: pre-activation failures preserve healthy releases and rejected candidates are cleaned');
} finally {
  if (daemon?.exitCode === null) {
    daemon.kill('SIGTERM');
    await once(daemon, 'exit');
  }
  fs.rmSync(root, { recursive: true, force: true });
}
