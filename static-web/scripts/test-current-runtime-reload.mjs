#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import { isolatedTestEnv, reserveLoopbackPort, stopOwnedProcess, waitFor as waitForCondition } from './test-support/isolated-runtime.mjs';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-runtime-reload-'));
const upstream = path.join(temp, 'upstream'), mirror = path.join(temp, 'mirror'), remote = path.join(temp, 'remote.git');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
let port;
const counter = path.join(temp, 'build-count');
let processHandle, logs = '';
const waitFor = fn => waitForCondition(fn, { code: 'CURRENT_RUNTIME_TIMEOUT', detail: () => logs });
const reservePort = reserveLoopbackPort;
const stopFixtureServer = stopOwnedProcess;
async function proveProbeIsolation() {
  const root = path.join(temp, 'probe-isolation');
  const probeScripts = path.join(root, 'scripts');
  const dist = path.join(root, 'dist');
  const stateRoot = path.join(root, 'probe-state');
  const marker = path.join(root, 'bridge-marker.txt');
  fs.mkdirSync(probeScripts, { recursive: true });
  fs.mkdirSync(dist, { recursive: true });
  fs.copyFileSync(path.join(scripts, 'kianos-static-server.mjs'), path.join(probeScripts, 'kianos-static-server.mjs'));
  fs.writeFileSync(path.join(dist, 'index.html'), '<html>probe</html>');
  fs.writeFileSync(path.join(dist, '__kianos-current.json'), JSON.stringify({ state: 'synced', sha: 'probe-sha' }));
  for (const [file, exportName] of [
    ['privateLearnerBridge.mjs', 'privateLearnerBridge'],
    ['privateExternalReadingBridge.mjs', 'privateExternalReadingBridge'],
    ['privateEnglishGeneratedBridge.mjs', 'privateEnglishGeneratedBridge'],
    ['privateControlBridge.mjs', 'privateControlBridge']
  ]) {
    fs.writeFileSync(path.join(probeScripts, file), `import fs from 'node:fs';\nfs.appendFileSync(process.env.KIANOS_PROBE_BRIDGE_MARKER, 'import:${exportName}\\n');\nexport function ${exportName}(){return{configureServer(){fs.appendFileSync(process.env.KIANOS_PROBE_BRIDGE_MARKER, 'configure:${exportName}|private='+process.env.KIANOS_PRIVATE_DIR+'|control='+process.env.KIANOS_CONTROL_DIR+'\\n');}};}\n`);
  }
  const port = await reservePort();
  const probeEnv = {
    ...isolatedTestEnv(stateRoot),
    KIANOS_PROBE_BRIDGE_MARKER: marker,
    KIANOS_PRIVATE_DIR: path.join(stateRoot, 'private'),
    KIANOS_CONTROL_DIR: path.join(stateRoot, 'control'),
    KIANOS_CONTROL_REPO_DIR: path.join(stateRoot, 'control-repo'),
    KIANOS_PACKET_REPO_DIR: path.join(stateRoot, 'packet-repo'),
    KIANOS_EXTERNAL_READING_DIR: path.join(stateRoot, 'external-reading'),
    KIANOS_ENGLISH_GENERATED_DIR: path.join(stateRoot, 'english-generated'),
    KIANOS_CONTROL_ENABLED: '0',
    KIANOS_PACKET_RELAY_ENABLED: '0'
  };
  const launchProbe = () => spawn(process.execPath, [
    path.join(probeScripts, 'kianos-static-server.mjs'), '--host', '127.0.0.1', '--port', String(port), '--root', dist,
    '--release-probe-only'
  ], {
    cwd: root,
    env: probeEnv,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const probe = launchProbe();
  let probeLog = '';
  probe.stdout?.on('data', b => { probeLog += b; });
  probe.stderr?.on('data', b => { probeLog += b; });
  try {
    await waitFor(async () => {
      if (probe.exitCode !== null) throw new Error('release probe exited: ' + probeLog);
      try { return (await (await fetch(`http://127.0.0.1:${port}/__kianos-release.json`)).json()).sha === 'probe-sha'; }
      catch { return false; }
    });
    const rows = fs.readFileSync(marker, 'utf8');
    assert.match(rows, /import:privateLearnerBridge/);
    assert.match(rows, /configure:privateControlBridge/);
    assert.match(rows, new RegExp(stateRoot.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')));
  } finally { await stopFixtureServer(probe); }

  fs.writeFileSync(path.join(probeScripts, 'privateControlBridge.mjs'), 'export function privateControlBridge( {');
  const broken = launchProbe();
  try {
    await waitFor(() => broken.exitCode !== null);
    assert.notEqual(broken.exitCode, 0, 'broken private bridge module must fail release readiness');
  } finally { await stopFixtureServer(broken); }
}
try {
  port = await reserveLoopbackPort();
  await proveProbeIsolation();
  fs.mkdirSync(upstream);
  git(upstream, 'init', '-b', 'main');
  git(upstream, 'config', 'user.name', 'Fixture');
  git(upstream, 'config', 'user.email', 'fixture@example.invalid');
  const write = (file, body) => {
    fs.mkdirSync(path.dirname(path.join(upstream, file)), { recursive: true });
    fs.writeFileSync(path.join(upstream, file), body);
  };
  for (const name of ['kianos-current-sync.mjs', 'currentRelease.mjs', 'currentStaticImpact.mjs', 'currentStaticSlots.mjs', 'currentDependencies.mjs', 'currentClientArtifacts.mjs']) {
    write('static-web/scripts/' + name, fs.readFileSync(path.join(scripts, name)));
  }
  write('static-web/scripts/kianos-static-server.mjs', `import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { version } from '../src/lib/fixture.mjs';
const root = path.resolve(process.argv[process.argv.indexOf('--root') + 1]);
const fallbackIndex = process.argv.indexOf('--fallback-root');
const fallbackRoot = fallbackIndex >= 0 ? path.resolve(process.argv[fallbackIndex + 1]) : '';
const releaseIdentity = () => JSON.parse(fs.readFileSync(path.join(root, '__kianos-current.json')));
http.createServer((req, res) => {
  if (req.url.startsWith('/__kianos-release.json')) return res.end(JSON.stringify(releaseIdentity()));
  if (req.url.startsWith('/__fixture-runtime.json')) return res.end(JSON.stringify({
    version,
    pid: process.pid,
    cwd: process.cwd(),
    repo_root: process.env.KIANOS_REPO_ROOT || '',
    static_root: root,
    fallback_root: fallbackRoot,
    sha: releaseIdentity().sha
  }));
  res.end(version);
}).listen(Number(process.env.KIANOS_PORT), '127.0.0.1');`);
  if (process.argv.includes('--legacy-classifier')) {
    write('static-web/scripts/currentStaticImpact.mjs', execFileSync('git', ['show', '38530ebab7577a84295bf5b30db65e2339359e64:static-web/scripts/currentStaticImpact.mjs'], { cwd: scripts }));
  }
  write('static-web/src/lib/fixture.mjs', 'export const version = "v1";');
  write('.gitignore', 'static-web/public/\nstatic-web/.current-*\nstatic-web/dist\n');
  const commit = () => { git(upstream, 'add', '.'); git(upstream, 'commit', '-m', 'fixture'); return git(upstream, 'rev-parse', 'HEAD'); };
  const first = commit();
  git(temp, 'clone', '--bare', upstream, remote);
  git(upstream, 'remote', 'add', 'origin', remote);
  git(temp, 'clone', remote, mirror);
  fs.writeFileSync(path.join(mirror, '.git/kianos-current-mirror'), '');
  const npm = path.join(temp, 'npm-fixture');
  fs.writeFileSync(npm, `#!/usr/bin/env node
const fs = require('fs'), path = require('path');
const root = process.argv[process.argv.indexOf('--outDir') + 1];
fs.appendFileSync(process.env.KIANOS_TEST_BUILD_COUNTER, 'build\\n');
fs.mkdirSync(root, {recursive:true}); fs.writeFileSync(path.join(root, 'index.html'), 'fixture');`);
  fs.chmodSync(npm, 0o755);
  const realGit = execFileSync('which', ['git'], { encoding: 'utf8' }).trim();
  const fixtureBin = path.join(temp, 'bin');
  const gitWrapper = path.join(fixtureBin, 'git');
  const pruneFailureMarker = path.join(temp, 'fail-worktree-prune-once');
  const resetFailureMarker = path.join(temp, 'fail-reset-once');
  fs.mkdirSync(fixtureBin, { recursive: true });
  fs.writeFileSync(gitWrapper, `#!/bin/sh
if [ -n "$KIANOS_TEST_GIT_PRUNE_FAIL_ONCE" ] && [ -f "$KIANOS_TEST_GIT_PRUNE_FAIL_ONCE" ]; then
  case " $* " in
    *" worktree prune "*)
      rm -f "$KIANOS_TEST_GIT_PRUNE_FAIL_ONCE"
      echo "fixture injected worktree prune failure" >&2
      exit 75
      ;;
  esac
fi
if [ -n "$KIANOS_TEST_GIT_RESET_FAIL_ONCE" ] && [ -f "$KIANOS_TEST_GIT_RESET_FAIL_ONCE" ]; then
  case " $* " in
    *" reset --hard "*)
      rm -f "$KIANOS_TEST_GIT_RESET_FAIL_ONCE"
      echo "fixture injected reset failure" >&2
      exit 76
      ;;
  esac
fi
exec "${realGit}" "$@"
`);
  fs.chmodSync(gitWrapper, 0o755);
  const startSyncProcess = () => {
    const handle = spawn(process.execPath, ['static-web/scripts/kianos-current-sync.mjs'], {
      cwd: mirror, env: {
        ...isolatedTestEnv(path.join(temp, 'private')),
        KIANOS_TEST_BUILD_COUNTER: counter,
        PATH: `${fixtureBin}:${process.env.PATH || ''}`,
        KIANOS_GIT_BIN: gitWrapper,
        KIANOS_SYNC_RUNTIME_SHA: git(mirror, 'rev-parse', 'HEAD'),
        KIANOS_TEST_GIT_PRUNE_FAIL_ONCE: pruneFailureMarker,
        KIANOS_TEST_GIT_RESET_FAIL_ONCE: resetFailureMarker,
        KIANOS_PORT: String(port),
        KIANOS_SYNC_ONCE: '0',
        KIANOS_SYNC_INTERVAL_MS: '3000',
        KIANOS_NPM_BIN: npm,
        KIANOS_BUILD_NICE: '0'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    handle.stdout.on('data', x => { logs += x; });
    handle.stderr.on('data', x => { logs += x; });
    return handle;
  };
  processHandle = startSyncProcess();
  const served = async () => { try { return await (await fetch(`http://127.0.0.1:${port}`, { signal: AbortSignal.timeout(1000) })).text(); } catch { return null; } };
  await waitFor(async () => await served() === 'v1');
  fs.writeFileSync(pruneFailureMarker, 'fail once\n');
  write('static-web/src/lib/fixture.mjs', 'export const version = "v2";');
  const next = commit();
  git(upstream, 'push', 'origin', 'main');
  await waitFor(async () => {
    if (await served() !== 'v2') return false;
    try {
      const control = JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json')));
      const release = await (await fetch(`http://127.0.0.1:${port}/__kianos-release.json`)).json();
      return control.state === 'synced' && control.sha === next && release.sha === next;
    } catch { return false; }
  });
  assert.equal(JSON.parse(fs.readFileSync(path.join(temp, '.kianos-current-releases/active/static-web/dist/__kianos-current.json'))).sha, next);
  const runtime = await (await fetch(`http://127.0.0.1:${port}/__fixture-runtime.json`, { signal: AbortSignal.timeout(1000) })).json();
  const nextRelease = fs.realpathSync(path.join(temp, '.kianos-current-releases/releases', next));
  const firstRelease = fs.realpathSync(path.join(temp, '.kianos-current-releases/releases', first));
  assert.equal(runtime.version, 'v2');
  assert.equal(runtime.sha, next);
  assert.equal(runtime.repo_root, nextRelease);
  assert.equal(runtime.cwd, path.join(nextRelease, 'static-web'));
  assert.equal(runtime.static_root, path.join(nextRelease, 'static-web', 'dist'));
  assert.equal(runtime.fallback_root, path.join(firstRelease, 'static-web', 'dist'));
  assert.equal((logs.match(/performing one controlled server reload/g) || []).length, 1);
  assert.equal(/rolling back/.test(logs), false);
  assert.match(logs, /post-handoff release cleanup deferred; accepted release remains active/);

  write('CURRENT.md', '# fixture control-only update\n');
  const controlOnly = commit();
  git(upstream, 'push', 'origin', 'main');
  await waitFor(async () => {
    try {
      const control = JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json')));
      const release = await (await fetch(`http://127.0.0.1:${port}/__kianos-release.json`)).json();
      return git(mirror, 'rev-parse', 'HEAD') === controlOnly
        && control.state === 'synced'
        && control.control_sha === controlOnly
        && control.sha === next
        && control.static_build === 'reused'
        && release.sha === next;
    } catch { return false; }
  });
  await new Promise(resolve => setTimeout(resolve, 6500));
  const repeatedControlSync = new RegExp(`main advanced ${controlOnly.slice(0, 8)} → ${controlOnly.slice(0, 8)}`, 'g');
  assert.equal((logs.match(repeatedControlSync) || []).length, 0, 'control-only promotion must not resync the same SHA every interval');

  const controlStatus = () => JSON.parse(fs.readFileSync(path.join(mirror, 'static-web/public/__kianos-current.json')));
  const runtimeStatus = async () => (await fetch(`http://127.0.0.1:${port}/__fixture-runtime.json`)).json();
  const buildCount = () => fs.readFileSync(counter, 'utf8').trim().split('\n').length;
  const beforeVerification = { builds: buildCount(), runtime: await runtimeStatus(),
    artifact: fs.readFileSync(path.join(nextRelease, 'static-web/dist/index.html'), 'utf8'), daemon: processHandle.pid };
  write('static-web/scripts/validate-xizong-a2-evidence.mjs', fs.readFileSync(path.join(scripts, 'validate-xizong-a2-evidence.mjs')));
  write('static-web/scripts/test-support/example.mjs', '// fixture-only support\n');
  write('static-web/scripts/fixtures/politics-practice/catalog.mjs', '// synthetic fixture-only change\n');
  const verificationOnly = commit();
  git(upstream, 'push', 'origin', 'main');
  await waitFor(() => controlStatus().state === 'synced' && controlStatus().control_sha === verificationOnly);
  assert.equal(buildCount(), beforeVerification.builds, 'VERIFICATION_ONLY_MUST_NOT_BUILD');
  assert.equal(controlStatus().sha, next, 'VERIFICATION_ONLY_MUST_KEEP_SERVED_SHA');
  assert.equal(controlStatus().static_build, 'reused');
  assert.deepEqual(await runtimeStatus(), beforeVerification.runtime, 'VERIFICATION_ONLY_MUST_KEEP_PROCESS_AND_ARTIFACT_ROOT');
  assert.equal(processHandle.pid, beforeVerification.daemon);
  assert.equal(processHandle.exitCode, null, 'VERIFICATION_ONLY_MUST_NOT_RESTART_DAEMON');
  assert.equal(fs.readFileSync(path.join(nextRelease, 'static-web/dist/index.html'), 'utf8'), beforeVerification.artifact);
  console.log('VERIFICATION_ONLY_RELEASE_EVIDENCE ' + JSON.stringify({
    control_before: controlOnly, control_after: controlStatus().control_sha,
    before: beforeVerification, after: { builds: buildCount(), runtime: await runtimeStatus(),
      artifact: fs.readFileSync(path.join(nextRelease, 'static-web/dist/index.html'), 'utf8'), daemon: processHandle.pid }
  }));

  // Mixed and unknown scripts still promote a new release with a new server.
  let priorRuntime = await runtimeStatus();
  for (const [label, changes] of [
    ['mixed', [['static-web/src/lib/fixture.mjs', 'export const version = "v2"; // actual runtime delta'], ['static-web/scripts/validate-xizong-a2-evidence.mjs', '// verification update']]],
    ['unknown', [['static-web/scripts/validate-future-runtime-helper.mjs', 'export const future = true;']]]
  ]) {
    const before = buildCount();
    for (const [file, body] of changes) write(file, body);
    const sha = commit(); git(upstream, 'push', 'origin', 'main');
    await waitFor(() => controlStatus().state === 'synced' && controlStatus().control_sha === sha);
    const current = await runtimeStatus();
    assert.equal(buildCount(), before + 1, label + '_MUST_BUILD');
    assert.equal(current.sha, sha, label + '_MUST_PROMOTE');
    assert.notEqual(current.pid, priorRuntime.pid, label + '_MUST_RELOAD');
    assert.equal(processHandle.exitCode, null);
    priorRuntime = current;
  }
  console.log('VERIFICATION_ONLY_RELEASE PASS: control SHA advances; served SHA, PID, artifact and build count stay fixed; mixed/unknown still build/reload');

  write('static-web/scripts/currentRelease.mjs', fs.readFileSync(path.join(scripts, 'currentRelease.mjs'), 'utf8') + '\n// fixture daemon-helper update\n');
  const helperUpdate = commit();
  git(upstream, 'push', 'origin', 'main');
  await waitFor(() => processHandle.exitCode !== null);
  assert.equal(processHandle.exitCode, 0, 'sync daemon helper update must request a clean supervisor restart');
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), helperUpdate);
  assert.match(logs, /control-only path\(s\).*serving unchanged release/);
  assert.match(logs, /Current sync runtime differs from loaded daemon; restarting the LaunchAgent-managed process after successful handoff/);

  const recoveryLogStart = logs.length;
  processHandle = startSyncProcess();
  await waitFor(async () => await served() === 'v2' && processHandle.exitCode === null);
  fs.writeFileSync(resetFailureMarker, 'fail once\n');
  write('static-web/scripts/currentRelease.mjs', fs.readFileSync(path.join(scripts, 'currentRelease.mjs'), 'utf8') + '\n// fixture daemon-helper recovery update\n');
  const helperRecoveryUpdate = commit();
  git(upstream, 'push', 'origin', 'main');
  await waitFor(() => processHandle.exitCode !== null);
  const recoveryLogs = logs.slice(recoveryLogStart);
  assert.equal(processHandle.exitCode, 0, 'sync daemon must preserve restart intent across a transient mirror reset failure');
  assert.equal(git(mirror, 'rev-parse', 'HEAD'), helperRecoveryUpdate);
  assert.match(recoveryLogs, /fixture injected reset failure/);
  assert.match(recoveryLogs, /Current sync runtime differs from loaded daemon; restarting the LaunchAgent-managed process after successful handoff/);

  console.log('CURRENT_RUNTIME_RELOAD PASS: handoff pins runtime identity, control-only sync idles, cleanup/reset failures cannot suppress daemon restart');
} finally {
  if (processHandle && processHandle.exitCode === null) {
    await stopOwnedProcess(processHandle);
  }
  fs.rmSync(temp, { recursive: true, force: true });
}
