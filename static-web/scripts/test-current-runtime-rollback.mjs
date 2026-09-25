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

  // Separate first-promotion case: no legacy dist and no prior site. The
  // candidate probe passes on its isolated port, but the production runtime
  // intentionally fails when started on the configured endpoint. The active
  // pointer must be removed again and the mirror must remain on the old SHA.
  if (daemon?.exitCode === null) {
    daemon.kill('SIGTERM');
    await once(daemon, 'exit');
  }
  daemon = null;

  const firstRoot = path.join(root, 'first-promotion');
  const firstUpstream = path.join(firstRoot, 'upstream');
  const firstRemote = path.join(firstRoot, 'remote.git');
  const firstMirror = path.join(firstRoot, 'mirror');
  fs.mkdirSync(firstUpstream, { recursive: true });
  git(firstUpstream, 'init', '-b', 'main');
  git(firstUpstream, 'config', 'user.email', 'fixture@example.invalid');
  git(firstUpstream, 'config', 'user.name', 'Fixture');
  const writeFirst = (file, body) => {
    fs.mkdirSync(path.dirname(path.join(firstUpstream, file)), { recursive: true });
    fs.writeFileSync(path.join(firstUpstream, file), body);
  };
  for (const name of ['kianos-current-sync.mjs', 'currentRelease.mjs', 'currentStaticImpact.mjs', 'currentStaticSlots.mjs']) {
    writeFirst(`static-web/scripts/${name}`, fs.readFileSync(path.join(scripts, name)));
  }
  writeFirst('static-web/package.json', '{}');
  writeFirst('.gitignore', 'static-web/public/\nstatic-web/dist\nstatic-web/.current-*\n');
  writeFirst('fixture.txt', 'E0');
  writeFirst(
    'static-web/scripts/kianos-static-server.mjs',
    `import http from 'node:http';http.createServer((q,s)=>s.end('E0')).listen(+process.env.KIANOS_PORT,'127.0.0.1');`
  );
  git(firstUpstream, 'add', '.');
  git(firstUpstream, 'commit', '-m', 'E0 base');
  const e0 = git(firstUpstream, 'rev-parse', 'HEAD');
  git(firstRoot, 'clone', '--bare', firstUpstream, firstRemote);
  git(firstUpstream, 'remote', 'add', 'origin', firstRemote);
  git(firstRoot, 'clone', firstRemote, firstMirror);
  fs.writeFileSync(path.join(firstMirror, '.git/kianos-current-mirror'), '');

  writeFirst('fixture.txt', 'E1');
  writeFirst(
    'static-web/scripts/kianos-static-server.mjs',
    `import fs from 'node:fs';import http from 'node:http';import path from 'node:path';const args=process.argv.slice(2),r=args[args.indexOf('--root')+1];if(!args.includes('--release-probe-only'))process.exit(23);http.createServer((q,s)=>s.end(q.url.startsWith('/__kianos-release.json')?JSON.stringify({sha:JSON.parse(fs.readFileSync(path.join(r,'__kianos-current.json'))).sha}):'probe-ok')).listen(+process.env.KIANOS_PORT,'127.0.0.1');`
  );
  git(firstUpstream, 'add', '.');
  git(firstUpstream, 'commit', '-m', 'E1 probe-good production-bad');
  const e1 = git(firstUpstream, 'rev-parse', 'HEAD');
  git(firstUpstream, 'push', 'origin', 'main');

  const firstPort = await new Promise((resolve) => {
    const server = net.createServer().listen(0, '127.0.0.1', () => {
      const value = server.address().port;
      server.close(() => resolve(value));
    });
  });
  let firstLogs = '';
  const firstDaemon = spawn(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], {
    cwd: firstMirror,
    env: {
      ...process.env,
      KIANOS_PORT: String(firstPort),
      KIANOS_NPM_BIN: npm,
      KIANOS_BUILD_NICE: '0',
      KIANOS_SYNC_INTERVAL_MS: '3000'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  firstDaemon.stdout.on('data', (chunk) => { firstLogs += chunk; });
  firstDaemon.stderr.on('data', (chunk) => { firstLogs += chunk; });
  try {
    await wait(async () => {
      if (!/new Current release failed readiness; rolling back/.test(firstLogs)) return false;
      try {
        const status = JSON.parse(fs.readFileSync(path.join(firstMirror, 'static-web/public/__kianos-current.json')));
        return status.state === 'degraded' && status.target_sha === e1;
      } catch {
        return false;
      }
    });
    assert.equal(git(firstMirror, 'rev-parse', 'HEAD'), e0, 'failed first promotion must not advance the mirror');
    assert.equal(fs.existsSync(path.join(firstRoot, '.kianos-current-releases/active')), false, 'failed first promotion must not leave an active pointer');
  } finally {
    if (firstDaemon.exitCode === null) {
      firstDaemon.kill('SIGTERM');
      await once(firstDaemon, 'exit');
    }
  }

  console.log('CURRENT_RUNTIME_ROLLBACK PASS: pre-activation and configured-endpoint failures preserve the last healthy release');
} finally {
  if (daemon?.exitCode === null) {
    daemon.kill('SIGTERM');
    await once(daemon, 'exit');
  }
  fs.rmSync(root, { recursive: true, force: true });
}
