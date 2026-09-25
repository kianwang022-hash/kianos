#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import {
  classifyStaticBuild,
  requiresStaticRuntimeReload
} from './currentStaticImpact.mjs';
import {
  atomicReplaceSymlink,
  resolveServedRoot
} from './currentStaticSlots.mjs';
import {
  acquireDeliveryLock,
  releasePaths,
  runBounded,
  terminateProcessTree
} from './currentRelease.mjs';

const execFileAsync = promisify(execFile);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const webRoot = path.join(repoRoot, 'static-web');
const markerPath = path.join(repoRoot, '.git', 'kianos-current-mirror');
const staticServerPath = path.join(webRoot, 'scripts', 'kianos-static-server.mjs');
const statusPath = path.join(webRoot, 'public', '__kianos-current.json');
const distPath = path.join(webRoot, 'dist');
const previousPath = path.join(webRoot, '.current-build-prev');
const failurePath = path.join(webRoot, '.current-build-failure.json');
const intervalMs = Math.max(3000, Number(process.env.KIANOS_SYNC_INTERVAL_MS || 8000));
const host = process.env.KIANOS_HOST || '127.0.0.1';
const port = String(process.env.KIANOS_PORT || '4321');
const npmBin = process.env.KIANOS_NPM_BIN || 'npm';
const gitBin = process.env.KIANOS_GIT_BIN || 'git';
const oneShot = process.env.KIANOS_SYNC_ONCE === '1';
const skipAstro = process.env.KIANOS_SKIP_ASTRO === '1';
const releases = releasePaths(repoRoot);
const subprocessTimeoutMs = Number(process.env.KIANOS_SUBPROCESS_TIMEOUT_MS || 120000);

let site = null;
let stopping = false;
let syncing = false;
let reloadingSite = false;
let lastNetworkError = '';
let lastKnownSha = '';
let lastTargetSha = '';
let lastSyncHealthy = true;
let activeReleaseRoot = null;

function readBuildFailure() {
  try { return JSON.parse(fs.readFileSync(failurePath, 'utf8')); } catch { return null; }
}

const stamp = () => new Date().toISOString();
const log = (message) => console.log(`[${stamp()}] ${message}`);
const warn = (message) => console.error(`[${stamp()}] ${message}`);

async function git(args) {
  const { stdout } = await execFileAsync(gitBin, args, {
    cwd: repoRoot,
    maxBuffer: 16 * 1024 * 1024,
    timeout: Number(process.env.KIANOS_GIT_TIMEOUT_MS || 30000)
  });
  return String(stdout || '').trim();
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value)}\n`, 'utf8');
}

function writeStatus(state, sha = lastKnownSha, extra = {}) {
  try {
    writeJson(statusPath, {
      state,
      sha: String(sha || ''),
      updated_at: stamp(),
      ...extra
    });
  } catch (error) {
    warn(`could not write local Current status: ${error?.message || error}`);
  }
}

function writeBuiltStatus(root, sha, extra = {}) {
  writeJson(path.join(root, '__kianos-current.json'), {
    state: 'synced',
    sha: String(sha || ''),
    updated_at: stamp(),
    serving_mode: 'static-node',
    ...extra
  });
}

function readBuiltStatus(root = distPath) {
  try {
    const file = path.join(root, '__kianos-current.json');
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function readActiveBuiltStatus() {
  return activeReleaseRoot
    ? readBuiltStatus(path.join(activeReleaseRoot, 'static-web', 'dist'))
    : readBuiltStatus();
}

async function runChild(file, args, { cwd = webRoot, label = file, env = process.env } = {}) {
  await runBounded(file, args, { cwd, env, label, timeoutMs: subprocessTimeoutMs });
}

async function prepareRelease(sha, extra = {}) {
  const failure = readBuildFailure();
  if (failure?.sha === sha && failure.stage === 'build' && !(oneShot && process.env.KIANOS_RETRY_FAILED_BUILD === '1')) {
    throw new Error(`CURRENT_BUILD_BLOCKED:${sha}:${failure.error}`);
  }
  fs.mkdirSync(releases.root, { recursive: true });
  const releaseRoot = releases.release(sha);
  if (fs.existsSync(releaseRoot)) {
    const existingDist = path.join(releaseRoot, 'static-web', 'dist');
    if (readBuiltStatus(existingDist)?.state === 'synced'
      && readBuiltStatus(existingDist)?.sha === sha
      && fs.existsSync(path.join(existingDist, 'index.html'))) {
      return path.join(releaseRoot, 'static-web');
    }
    try {
      await runBounded('git', ['-C', repoRoot, 'worktree', 'remove', '--force', releaseRoot], {
        label: 'remove incomplete release',
        timeoutMs: Number(process.env.KIANOS_GIT_TIMEOUT_MS || 30000)
      });
    } catch {}
    fs.rmSync(releaseRoot, { recursive: true, force: true });
  }
  if (fs.existsSync(releases.candidate)) await runBounded('git', ['-C', repoRoot, 'worktree', 'remove', '--force', releases.candidate], { label: 'remove stale candidate' });
  await runBounded('git', ['-C', repoRoot, 'worktree', 'add', '--detach', releaseRoot, sha], {
    label: 'git worktree add',
    timeoutMs: Number(process.env.KIANOS_GIT_TIMEOUT_MS || 30000)
  });
  const candidateWebRoot = path.join(releaseRoot, 'static-web');
  try {
    if (fs.existsSync(path.join(candidateWebRoot, 'package.json'))) {
      await runChild(npmBin, ['install', '--no-audit', '--no-fund'], {
        cwd: candidateWebRoot,
        label: 'candidate npm install'
      });
    }
    if (!skipAstro) {
      const candidateStage = path.join(candidateWebRoot, '.current-build-next');
      fs.rmSync(candidateStage, { recursive: true, force: true });
      const args = [npmBin, 'run', 'build', '--', '--outDir', candidateStage];
      await runChild(args[0], args.slice(1), {
        cwd: candidateWebRoot,
        label: 'candidate Astro build',
        env: { ...process.env, KIANOS_RELEASE_SHA: sha }
      });
      writeBuiltStatus(candidateStage, sha, extra);
      fs.renameSync(candidateStage, path.join(candidateWebRoot, 'dist'));
    }
  } catch (error) {
    writeJson(failurePath, { sha, stage: /npm install/.test(error.message) ? 'install' : 'build', error: error.message, failed_at: stamp() });
    try {
      await runBounded('git', ['-C', repoRoot, 'worktree', 'remove', '--force', releaseRoot], {
        label: 'cleanup failed candidate',
        timeoutMs: Number(process.env.KIANOS_GIT_TIMEOUT_MS || 30000)
      });
    } catch {}
    throw error;
  }
  if (!skipAstro && !fs.existsSync(path.join(candidateWebRoot, 'dist', 'index.html'))) {
    throw new Error('CURRENT_RELEASE_BUILD_INVALID');
  }
  fs.rmSync(failurePath, { force: true });
  return candidateWebRoot;
}

async function activateRelease(sha) {
  const old = fs.existsSync(releases.active) ? fs.realpathSync(releases.active) : null;
  const next = releases.release(sha);
  if (!fs.existsSync(next)) throw new Error(`CURRENT_RELEASE_MISSING:${sha}`);
  if (old) atomicReplaceSymlink(old, releases.previous);
  atomicReplaceSymlink(next, releases.active);
  activeReleaseRoot = fs.realpathSync(releases.active);
  return { old, active: activeReleaseRoot, sha };
}

async function pruneReleases() {
  const retained = new Set(
    [releases.active, releases.previous]
      .filter(fs.existsSync)
      .map((link) => fs.realpathSync(link))
  );
  const releasesRoot = path.join(releases.root, 'releases');
  if (!fs.existsSync(releasesRoot)) return;
  for (const entry of fs.readdirSync(releasesRoot)) {
    const releaseRoot = path.join(releasesRoot, entry);
    let releaseIdentity = path.resolve(releaseRoot);
    try { releaseIdentity = fs.realpathSync(releaseRoot); } catch {}
    if (retained.has(releaseIdentity)) continue;
    try {
      await runBounded('git', ['-C', repoRoot, 'worktree', 'remove', '--force', releaseRoot], {
        label: 'prune old release',
        timeoutMs: Number(process.env.KIANOS_GIT_TIMEOUT_MS || 30000)
      });
    } catch {
      fs.rmSync(releaseRoot, { recursive: true, force: true });
    }
  }
  await runBounded('git', ['-C', repoRoot, 'worktree', 'prune'], {
    label: 'prune release metadata',
    timeoutMs: Number(process.env.KIANOS_GIT_TIMEOUT_MS || 30000)
  });
}

function recoverStaticDirectories() {
  let dist = null;
  let previous = null;
  try { dist = fs.lstatSync(distPath); } catch {}
  try { previous = fs.lstatSync(previousPath); } catch {}

  if (!dist && previous?.isDirectory()) {
    fs.renameSync(previousPath, distPath);
    return;
  }
  if (dist && previous?.isDirectory()) {
    fs.rmSync(previousPath, { recursive: true, force: true });
  }
}

function startSite() {
  if (skipAstro || stopping || site) return;
  const pinnedWebRoot = activeReleaseRoot ? path.join(activeReleaseRoot, 'static-web') : webRoot;
  const pinnedServerPath = path.join(pinnedWebRoot, 'scripts', 'kianos-static-server.mjs');
  if (!fs.existsSync(pinnedServerPath)) {
    throw new Error(`KianOS static server missing at ${pinnedServerPath}`);
  }
  const servedRoot = activeReleaseRoot
    ? path.join(activeReleaseRoot, 'static-web', 'dist')
    : distPath;
  if (!resolveServedRoot(servedRoot)) {
    throw new Error('STATIC_CURRENT_BUILD_MISSING');
  }
  log(`starting prebuilt Current site on http://${host}:${port}`);
  site = spawn(process.execPath, [
    pinnedServerPath,
    '--host', host,
    '--port', port,
    '--root', servedRoot,
    '--fallback-root', activeReleaseRoot && fs.existsSync(releases.previous)
      ? path.join(fs.realpathSync(releases.previous), 'static-web', 'dist')
      : previousPath
  ], {
    cwd: pinnedWebRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...(activeReleaseRoot ? {
        KIANOS_REPO_ROOT: activeReleaseRoot,
        KIANOS_CURRENT_STATUS_PATH: statusPath
      } : {})
    }
  });
  site.once('exit', (code, signal) => {
    const expected = stopping || reloadingSite;
    site = null;
    if (!expected) {
      warn(`Current static server stopped unexpectedly (${signal || code}); restarting in 1200ms`);
      setTimeout(() => {
        try { startSite(); } catch (error) { warn(error.stack || error.message); }
      }, 1200);
    }
  });
}

async function stopSite() {
  if (!site) return;
  const child = site;
  await new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    child.once('exit', finish);
    child.kill('SIGTERM');
    setTimeout(() => {
      if (!done) {
        try { child.kill('SIGKILL'); } catch {}
        finish();
      }
    }, 3000);
  });
  site = null;
}

async function reloadSite() {
  if (!site || stopping) return;
  reloadingSite = true;
  try {
    await stopSite();
  } finally {
    reloadingSite = false;
  }
  if (!stopping && !site) startSite();
}

async function waitForSiteReady(expectedSha, timeoutMs = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (!site) throw new Error('CURRENT_RELEASE_RUNTIME_EXITED');
    try {
      const response = await fetch(`http://${host}:${port}/__kianos-release.json?t=${Date.now()}`);
      if (response.ok) {
        const identity = await response.json();
        if (expectedSha && identity?.sha === expectedSha) return;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('CURRENT_RELEASE_RUNTIME_NOT_READY');
}

async function probeRelease(releaseRoot, expectedSha, timeoutMs = 5000) {
  const probePort = await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, host, () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
  const candidateWebRoot = path.join(releaseRoot, 'static-web');
  const candidateServerPath = path.join(candidateWebRoot, 'scripts', 'kianos-static-server.mjs');
  if (!fs.existsSync(candidateServerPath)) {
    throw new Error(`CURRENT_RELEASE_RUNTIME_MISSING:${candidateServerPath}`);
  }
  const candidateServer = spawn(process.execPath, [
    candidateServerPath,
    '--host', host,
    '--port', String(probePort),
    '--root', path.join(candidateWebRoot, 'dist'),
    '--release-probe-only'
  ], {
    cwd: candidateWebRoot,
    stdio: 'ignore',
    detached: process.platform !== 'win32',
    env: {
      ...process.env,
      KIANOS_PORT: String(probePort),
      KIANOS_RELEASE_PROBE_ONLY: '1'
    }
  });
  try {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      if (candidateServer.exitCode !== null) throw new Error('CURRENT_RELEASE_RUNTIME_EXITED');
      try {
        const response = await fetch(`http://${host}:${probePort}/__kianos-release.json?t=${Date.now()}`);
        if (response.ok && (await response.json())?.sha === expectedSha) return;
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('CURRENT_RELEASE_RUNTIME_NOT_READY');
  } finally {
    if (candidateServer.pid) {
      await terminateProcessTree(candidateServer.pid, { graceMs: 1000 });
    }
  }
}

async function rollbackRelease() {
  await stopSite();
  if (fs.existsSync(releases.previous)) {
    atomicReplaceSymlink(fs.realpathSync(releases.previous), releases.active);
  } else if (fs.existsSync(releases.active)) {
    fs.rmSync(releases.active, { force: true });
  }
  activeReleaseRoot = fs.existsSync(releases.active) ? fs.realpathSync(releases.active) : null;
  if (activeReleaseRoot) {
    startSite();
    await waitForSiteReady(readActiveBuiltStatus()?.sha);
  } else if (resolveServedRoot(distPath)) {
    startSite();
    await waitForSiteReady(readActiveBuiltStatus()?.sha);
  }
}

async function remoteMainSha() {
  const raw = await git(['ls-remote', 'origin', 'refs/heads/main']);
  return raw.split(/\s+/)[0] || '';
}

async function syncOnce({ initial = false } = {}) {
  if (syncing || stopping) return false;
  syncing = true;
  let releaseLock = null;
  try {
    releaseLock = await acquireDeliveryLock(releases.lock);
    const local = await git(['rev-parse', 'HEAD']);
    lastKnownSha = local;
    writeStatus('checking', local);

    const remote = await remoteMainSha();
    if (!remote) throw new Error('origin/main did not return a SHA');
    lastTargetSha = remote;

    const activeSha = readActiveBuiltStatus()?.sha || '';
    if (local === remote && activeReleaseRoot && activeSha === remote) {
      lastSyncHealthy = true;
      writeStatus('synced', local, { release_root: activeReleaseRoot });
      if (initial) {
        log(`Current release already matches main ${local.slice(0, 8)}`);
      }
      return false;
    }

    writeStatus('updating', local, { target_sha: remote });
    log(`main advanced ${local.slice(0, 8)} → ${remote.slice(0, 8)}; syncing whole repository`);
    await git(['fetch', 'origin', 'main', '--prune']);
    const fetched = await git(['rev-parse', 'FETCH_HEAD']);
    lastTargetSha = fetched;
    // A previous update may have moved HEAD but failed to publish. Classify
    // from the actually served source, never from that failed checkout.
    const builtBase = readBuiltStatus();
    const impactBase = builtBase?.state === 'synced' && builtBase?.sha ? builtBase.sha : local;
    const changed = await git(['diff', '--name-only', impactBase, fetched]);
    const changedPaths = changed ? changed.split('\n').filter(Boolean) : [];
    const buildDecision = classifyStaticBuild(changedPaths);
    const syncRuntimeChanged = changedPaths.some((file) => [
      'static-web/scripts/kianos-current-sync.mjs',
      'static-web/scripts/currentStaticImpact.mjs',
      'static-web/scripts/currentStaticSlots.mjs',
      'static-web/package.json',
      'static-web/package-lock.json',
      'static-web/npm-shrinkwrap.json'
    ].includes(file));
    const staticRuntimeChanged = requiresStaticRuntimeReload(changedPaths);

    let runtimeReloaded = false;
    if (!skipAstro) {
      await prepareRelease(fetched, {
        changed_paths: changedPaths.length,
        build_impact_paths: buildDecision.build_paths.length,
        lexical_projection_required: buildDecision.lexical_projection_required,
        lexical_projection_paths: buildDecision.lexical_projection_paths.length
      });
      try {
        await probeRelease(releases.release(fetched), fetched);
      } catch (error) {
        warn(`new Current release probe failed before activation; keeping current release: ${error.message}`);
        throw error;
      }
      await activateRelease(fetched);
      if (!oneShot && site) {
        try {
          log('performing one controlled server reload for accepted release transition');
          await reloadSite();
          await waitForSiteReady(fetched);
          runtimeReloaded = true;
        } catch (error) {
          warn(`new Current release failed readiness; rolling back: ${error.message}`);
          await rollbackRelease();
          throw error;
        }
      }
    }
    lastKnownSha = fetched;
    await git(['checkout', '-B', 'main', fetched]);
    await git(['reset', '--hard', fetched]);
    if (!skipAstro) await pruneReleases();

    lastSyncHealthy = true;
    lastNetworkError = '';
    writeStatus('synced', fetched, {
      target_sha: fetched,
      changed_paths: changedPaths.length,
      static_build: skipAstro ? 'skipped' : 'rebuilt',
      build_impact_paths: buildDecision.build_paths.length
    });
    log(
      `synced ${changedPaths.length} changed path(s); static Current is ${fetched.slice(0, 8)} `
      + `(${skipAstro ? 'skipped' : 'rebuilt'})`
    );

    if (!oneShot && syncRuntimeChanged) {
      log('Current sync runtime changed; restarting the LaunchAgent-managed process after successful handoff');
      stopping = true;
      await stopSite();
      process.exit(0);
    }
    if (!oneShot && staticRuntimeChanged && site && !syncRuntimeChanged && !runtimeReloaded) {
      log('Current static runtime owner changed; performing one controlled server reload');
      await reloadSite();
    }
    return true;
  } catch (error) {
    lastSyncHealthy = false;
    const message = error?.message || String(error);
    if (message !== lastNetworkError) {
      warn(`sync/build check failed: ${message}`);
      lastNetworkError = message;
    }
    writeStatus('degraded', readActiveBuiltStatus()?.sha || '', {
      target_sha: lastTargetSha || lastKnownSha,
      build_blocked: readBuildFailure()?.sha === (lastTargetSha || lastKnownSha),
      error: message
    });
    if (!oneShot && !site && !stopping && resolveServedRoot(distPath)) {
      try { startSite(); } catch (startError) { warn(startError.stack || startError.message); }
    }
    return false;
  } finally {
    if (releaseLock) releaseLock();
    syncing = false;
  }
}

async function shutdown(signal) {
  if (stopping) return;
  stopping = true;
  writeStatus('stopping', lastKnownSha);
  log(`received ${signal}; stopping Current site`);
  await stopSite();
  process.exit(0);
}

if (!fs.existsSync(markerPath) && process.env.KIANOS_ALLOW_UNSAFE_SYNC !== '1') {
  warn('Refusing destructive main sync outside a dedicated Current mirror.');
  warn(`Expected marker: ${markerPath}`);
  warn('Install with: npm run current:install');
  process.exit(2);
}

recoverStaticDirectories();
if (fs.existsSync(releases.active)) activeReleaseRoot = fs.realpathSync(releases.active);
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

try {
  lastKnownSha = await git(['rev-parse', 'HEAD']);
} catch {}
writeStatus('starting', lastKnownSha);
if (!oneShot) try { startSite(); } catch (error) {
  if (resolveServedRoot(distPath)) warn(error.stack || error.message);
}
await syncOnce({ initial: true });

if (oneShot) {
  log(`one-shot Current sync ${lastSyncHealthy ? 'PASS' : 'FAIL'}`);
  process.exit(lastSyncHealthy ? 0 : 1);
}

try { if (!site) startSite(); } catch (error) { warn(error.stack || error.message); }
log(`watching origin/main every ${Math.round(intervalMs / 1000)}s; new Current is prebuilt before learner traffic switches`);
setInterval(() => void syncOnce(), intervalMs);
