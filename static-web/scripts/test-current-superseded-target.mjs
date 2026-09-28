#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-superseded-current-'));
const upstream = path.join(root, 'upstream');
const remote = path.join(root, 'remote.git');
const mirror = path.join(root, 'mirror');
const releases = path.join(root, 'releases');
const events = path.join(root, 'npm-events');
const git = (cwd, ...args) => execFileSync('git', args, {
  cwd,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe']
}).trim();
const write = (file, body) => {
  const target = path.join(upstream, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, body);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function runOnce(env = {}) {
  return spawnSync(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], {
    cwd: mirror,
    env: {
      ...process.env,
      KIANOS_SYNC_ONCE: '1',
      KIANOS_NPM_BIN: path.join(root, 'npm-fixture'),
      KIANOS_RELEASES_DIR: releases,
      KIANOS_BUILD_NICE: '0',
      ...env
    },
    encoding: 'utf8',
    timeout: 30000
  });
}

async function waitForBuild(sha, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    let rows = '';
    try { rows = fs.readFileSync(events, 'utf8'); } catch {}
    if (rows.includes('build ' + sha)) return;
    await sleep(25);
  }
  throw new Error('SUPERSEDED_TARGET_BUILD_DID_NOT_START:' + sha);
}

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
    'currentDependencies.mjs'
  ]) {
    write('static-web/scripts/' + name, fs.readFileSync(path.join(scripts, name)));
  }

  write('static-web/package.json', '{}');
  write('.gitignore', 'static-web/public/\nstatic-web/dist\nstatic-web/.current-*\n');
  write(
    'static-web/scripts/kianos-static-server.mjs',
    `import fs from 'node:fs';import http from 'node:http';import path from 'node:path';const args=process.argv.slice(2),root=args[args.indexOf('--root')+1];http.createServer((req,res)=>{if(req.url.startsWith('/__kianos-release.json'))return res.end(fs.readFileSync(path.join(root,'__kianos-current.json')));res.end('fixture');}).listen(+process.env.KIANOS_PORT,'127.0.0.1');`
  );
  write('static-web/src/pages/fixture.astro', '<p>A</p>\n');
  git(upstream, 'add', '.');
  git(upstream, 'commit', '-m', 'A');
  const a = git(upstream, 'rev-parse', 'HEAD');

  git(root, 'clone', '--bare', upstream, remote);
  git(upstream, 'remote', 'add', 'origin', remote);
  git(root, 'clone', remote, mirror);
  fs.writeFileSync(path.join(mirror, '.git/kianos-current-mirror'), '');

  const npm = path.join(root, 'npm-fixture');
  fs.writeFileSync(npm, `#!/bin/sh
if [ "$1" = "install" ]; then
  mkdir -p "$PWD/node_modules/.bin" "$PWD/node_modules/astro"
  printf '{"name":"astro","version":"5.0.0"}\\n' > "$PWD/node_modules/astro/package.json"
  : > "$PWD/node_modules/.bin/astro"
  exit 0
fi
sha="$(git -C "$PWD" rev-parse HEAD)"
echo "build $sha" >> "${events}"
sleep "\${KIANOS_TEST_BUILD_SLEEP:-0}"
out=""
while [ "$#" -gt 0 ]; do
  if [ "$1" = "--outDir" ]; then shift; out="$1"; fi
  shift
done
mkdir -p "$out"
echo built > "$out/index.html"
`);
  fs.chmodSync(npm, 0o755);

  const initial = runOnce();
  assert.equal(initial.status, 0, initial.stderr || initial.stdout);
  assert.equal(fs.realpathSync(path.join(releases, 'active')), fs.realpathSync(path.join(releases, 'releases', a)));

  write('static-web/src/pages/fixture.astro', '<p>B</p>\n');
  git(upstream, 'add', '.');
  git(upstream, 'commit', '-m', 'B');
  const b = git(upstream, 'rev-parse', 'HEAD');
  git(upstream, 'push', 'origin', 'main');
  fs.writeFileSync(events, '');

  const inFlight = spawn(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], {
    cwd: mirror,
    env: {
      ...process.env,
      KIANOS_SYNC_ONCE: '1',
      KIANOS_NPM_BIN: npm,
      KIANOS_RELEASES_DIR: releases,
      KIANOS_BUILD_NICE: '0',
      KIANOS_TEST_BUILD_SLEEP: '1'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let inFlightLog = '';
  inFlight.stdout.on('data', (chunk) => { inFlightLog += chunk.toString(); });
  inFlight.stderr.on('data', (chunk) => { inFlightLog += chunk.toString(); });

  await waitForBuild(b);

  write('static-web/src/pages/fixture.astro', '<p>C</p>\n');
  git(upstream, 'add', '.');
  git(upstream, 'commit', '-m', 'C');
  const c = git(upstream, 'rev-parse', 'HEAD');
  git(upstream, 'push', 'origin', 'main');

  const [firstCode] = await once(inFlight, 'exit');
  assert.equal(firstCode, 1, inFlightLog);
  assert.equal(
    fs.realpathSync(path.join(releases, 'active')),
    fs.realpathSync(path.join(releases, 'releases', a)),
    'superseded B must never replace Stable A'
  );
  assert.equal(fs.existsSync(path.join(releases, 'releases', b)), false, 'superseded candidate release should be cleaned');

  const pending = JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json'), 'utf8'));
  assert.equal(pending.state, 'pending');
  assert.equal(pending.sha, a);
  assert.equal(pending.superseded_sha, b);
  assert.equal(pending.target_sha, c);
  assert.equal(pending.static_build, 'discarded-superseded');

  const final = runOnce();
  assert.equal(final.status, 0, final.stderr || final.stdout);
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), c);
  assert.equal(fs.realpathSync(path.join(releases, 'active')), fs.realpathSync(path.join(releases, 'releases', c)));
  assert.equal(fs.realpathSync(path.join(releases, 'previous')), fs.realpathSync(path.join(releases, 'releases', a)));

  const rows = fs.readFileSync(events, 'utf8').trim().split('\n').filter(Boolean);
  assert.deepEqual(rows, ['build ' + b, 'build ' + c]);
  console.log('CURRENT_SUPERSEDED_TARGET PASS: obsolete built SHA is discarded before Stable activation; newest main promotes once');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
