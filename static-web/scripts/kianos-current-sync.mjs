#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { randomUUID } from 'node:crypto';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { planClientArtifactBuild, clientProofDigest, clientBuildContextHash, CLIENT_PROOF_FILE } from './currentClientArtifacts.mjs';

import {
  classifyStaticBuild,
  requiresStaticRuntimeReload,
  staticBuildNpmScript
} from './currentStaticImpact.mjs';
import {
  atomicReplaceSymlink,
  resolveServedRoot
} from './currentStaticSlots.mjs';
import {
  acquireDeliveryLock,
  releasePaths,
  resolveCurrentSubprocessTimeoutMs,
  resolveCurrentCheckoutTimeoutMs,
  parseReleaseWorktrees,
  releaseWorktreeIsDisposable,
  availableReleaseWorktreePath,
  releaseIdentityProblem,
  runBounded,
  terminateProcessTree
} from './currentRelease.mjs';
import {
  canReuseDependencies,
  cloneDependencies,
  dependencyIdentity,
  writeDependencyProof
} from './currentDependencies.mjs';

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
// Use the control checkout as one stable normalization boundary for every lane.
const buildContextHash = clientBuildContextHash(process.env, repoRoot);
const subprocessTimeoutMs = resolveCurrentSubprocessTimeoutMs();
const buildTimeoutMs = subprocessTimeoutMs;
const checkoutTimeoutMs = resolveCurrentCheckoutTimeoutMs();
const syncRuntimePaths = [
  'static-web/scripts/kianos-current-sync.mjs',
  'static-web/scripts/currentRelease.mjs',
  'static-web/scripts/currentStaticImpact.mjs',
  'static-web/scripts/currentStaticSlots.mjs',
  'static-web/scripts/currentDependencies.mjs',
  'static-web/scripts/currentClientArtifacts.mjs',
  'static-web/package.json',
  'static-web/package-lock.json',
  'static-web/npm-shrinkwrap.json'
];

let site = null;
let stopping = false;
let syncing = false;
let reloadingSite = false;
let lastNetworkError = '';
let lastKnownSha = '';
let lastTargetSha = '';
let lastSyncHealthy = true;
let activeReleaseRoot = null;
let syncRuntimeLoadedSha = String(process.env.KIANOS_SYNC_RUNTIME_SHA || '').trim();
let syncRuntimeCheckedTargetSha = '';
let syncRuntimeCheckedChanged = false;

function readBuildFailure() {
  try { return JSON.parse(fs.readFileSync(failurePath, 'utf8')); } catch { return null; }
}

function readControlStatus() {
  try { return JSON.parse(fs.readFileSync(statusPath, 'utf8')); } catch { return null; }
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
  const pending = `${file}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(pending, `${JSON.stringify(value)}\n`, { encoding: 'utf8', flag: 'wx' });
    fs.renameSync(pending, file);
  } finally { fs.rmSync(pending, { force: true }); }
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
    ...extra,
    contextHash: buildContextHash
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

function hasCurrentBuildContext(root) {
  const status = readBuiltStatus(root);
  return status?.state === 'synced' && status.contextHash === buildContextHash;
}

function activeBuildContextMatches() {
  return hasCurrentBuildContext(activeReleaseRoot ? path.join(activeReleaseRoot, 'static-web', 'dist') : distPath);
}

function retainedReleaseRoots() {
  return new Set([releases.active, releases.previous].filter(fs.existsSync).map(file => fs.realpathSync(file)));
}

function assertDisposableRelease(releaseRoot) {
  const identity = fs.existsSync(releaseRoot) ? fs.realpathSync(releaseRoot) : path.resolve(releaseRoot);
  if (retainedReleaseRoots().has(identity)) throw new Error('CURRENT_RETAINED_RELEASE_MUST_NOT_BE_REMOVED');
}

async function runChild(file, args, {
  cwd = webRoot,
  label = file,
  env = process.env,
  timeoutMs = subprocessTimeoutMs
} = {}) {
  // npm/Astro shebangs must use the supervisor's Node, not another Node found
  // earlier in a login shell PATH; otherwise every compiler receipt goes stale.
  const childEnv = { ...env, PATH: [path.dirname(process.execPath), env.PATH].filter(Boolean).join(path.delimiter) };
  await runBounded(file, args, { cwd, env: childEnv, label, timeoutMs });
}

async function prepareRelease(sha, extra = {}) {
  const prepareStartedAt = Date.now();
  const timings = { dependencies: 0, astro_build: 0, total: 0 };
  let dependencyMode = 'not-required';
  const failure = readBuildFailure();
  if (failure?.sha === sha && failure.contextHash === buildContextHash && failure.stage === 'build' && !(oneShot && process.env.KIANOS_RETRY_FAILED_BUILD === '1')) {
    throw new Error(`CURRENT_BUILD_BLOCKED:${sha}:${failure.error}`);
  }
  fs.mkdirSync(releases.root, { recursive: true });
  let releaseRoot = releases.release(sha, buildContextHash);
  if (fs.existsSync(releaseRoot)) {
    const existingDist = path.join(releaseRoot, 'static-web', 'dist');
    if (hasCurrentBuildContext(existingDist)
      && readBuiltStatus(existingDist)?.sha === sha
      && fs.existsSync(path.join(existingDist, 'index.html'))) {
      timings.total = Date.now() - prepareStartedAt;
      return {
        releaseRoot,
        webRoot: path.join(releaseRoot, 'static-web'),
        created: false,
        dependencyMode: 'existing-release',
        timings
      };
    }
    if (retainedReleaseRoots().has(fs.realpathSync(releaseRoot))) {
      // A missing/corrupt receipt must not turn rebuilding into in-place erasure.
      releaseRoot += '-' + randomUUID();
    } else await cleanupPreparedRelease(releaseRoot);
  }
  // A killed checkout can leave a locked registration even after its path
  // disappears. Do not reuse/remove that identity; one safe new path is enough.
  const worktrees = parseReleaseWorktrees(await git(['worktree', 'list', '--porcelain']));
  const availableRoot = availableReleaseWorktreePath(releaseRoot, worktrees);
  if (availableRoot !== releaseRoot) log(`preserving occupied candidate ${releaseRoot}; preparing ${availableRoot}`);
  releaseRoot = availableRoot;
  if (fs.existsSync(releases.candidate)) await cleanupPreparedRelease(releases.candidate);
  const checkoutStartedAt = Date.now();
  await runBounded(gitBin, ['-C', repoRoot, 'worktree', 'add', '--detach', releaseRoot, sha], {
    label: 'git worktree add',
    timeoutMs: checkoutTimeoutMs
  });
  timings.checkout = Date.now() - checkoutStartedAt;
  log(`release checkout completed in ${timings.checkout}ms (budget ${checkoutTimeoutMs}ms)`);
  const candidateWebRoot = path.join(releaseRoot, 'static-web');
  try {
    if (fs.existsSync(path.join(candidateWebRoot, 'package.json'))) {
      let dependenciesReady = false;
      const activeWebRoot = activeReleaseRoot ? path.join(activeReleaseRoot, 'static-web') : null;
      if (activeWebRoot && canReuseDependencies(activeWebRoot, candidateWebRoot)) {
        try {
          const reused = cloneDependencies(activeWebRoot, candidateWebRoot);
          dependenciesReady = true;
          dependencyMode = 'reused';
          timings.dependencies = reused.duration_ms;
          log(`reused verified candidate dependencies in ${reused.duration_ms}ms (${reused.copy_mode})`);
        } catch (error) {
          warn(`candidate dependency reuse failed; falling back to npm install: ${error?.message || error}`);
        }
      }
      if (!dependenciesReady) {
        // Proof must describe the canonical dependency inputs from the fresh
        // worktree. npm install may create an untracked package-lock.json;
        // fingerprinting after install would make the next fresh worktree
        // differ forever and silently defeat dependency reuse.
        const dependencyProof = dependencyIdentity(candidateWebRoot);
        const installStartedAt = Date.now();
        await runChild(npmBin, ['install', '--no-audit', '--no-fund'], {
          cwd: candidateWebRoot,
          label: 'candidate npm install'
        });
        timings.dependencies = Date.now() - installStartedAt;
        dependencyMode = 'installed';
        writeDependencyProof(candidateWebRoot, dependencyProof);
        log('installed and recorded candidate dependency proof');
      }
    }
    if (!skipAstro) {
      const candidateStage = path.join(candidateWebRoot, '.current-build-next');
      fs.rmSync(candidateStage, { recursive: true, force: true });
      const buildScript = staticBuildNpmScript(extra);
      const args = [npmBin, 'run', buildScript, '--', '--outDir', candidateStage];
      const buildStartedAt = Date.now();
      // Fingerprint the same invocation boundary for both lanes. npm adds
      // transport-only environment defaults before launching the full build.
      const buildEnv = { ...process.env, KIANOS_RELEASE_SHA: sha,
        KIANOS_BUILD_CONTEXT_HASH: buildContextHash };
      let clientArtifactDelivery = null;
      const baseWebRoot = activeReleaseRoot ? path.join(activeReleaseRoot, 'static-web') : null;
      const clientPlan = planClientArtifactBuild({ baseWebRoot, webRoot: candidateWebRoot, targetSha: sha, contextRoot: repoRoot });
      if (clientPlan.eligible) {
        try {
          await runChild(process.execPath, ['scripts/currentClientArtifacts.mjs',
            '--base-web-root', baseWebRoot, '--target-sha', sha, '--out-dir', candidateStage, '--context-root', repoRoot], {
            cwd: candidateWebRoot, label: 'candidate client artifact build',
            env: buildEnv,
            timeoutMs: Math.min(buildTimeoutMs, 90000)
          });
          const proof = JSON.parse(fs.readFileSync(path.join(candidateWebRoot, CLIENT_PROOF_FILE), 'utf8'));
          if (proof.sourceSha !== sha || proof.contextHash !== buildContextHash || proof.delivery?.kind !== 'client-artifacts') throw new Error('CURRENT_CLIENT_DELIVERY_RECEIPT_INVALID');
          clientArtifactDelivery = proof.delivery;
          log(`client-only release assembled; ${proof.delivery.reusedHtml} HTML artifacts reused, no prerender`);
        } catch (error) {
          warn(`client artifact proof failed; falling back to complete build: ${error.message}`);
          fs.rmSync(candidateStage, { recursive: true, force: true });
          fs.rmSync(path.join(candidateWebRoot, CLIENT_PROOF_FILE), { force: true });
        }
      } else log(`complete build required: ${clientPlan.reason}`);
      if (!clientArtifactDelivery) await runChild(args[0], args.slice(1), {
        cwd: candidateWebRoot,
        label: 'candidate Astro build',
        env: buildEnv,
        timeoutMs: buildTimeoutMs
      });
      timings.client_artifacts = clientArtifactDelivery;

      timings.astro_build = Date.now() - buildStartedAt;
      timings.total = Date.now() - prepareStartedAt;
      writeBuiltStatus(candidateStage, sha, {
        ...extra,
        dependency_mode: dependencyMode,
        client_proof_sha256: clientProofDigest(candidateWebRoot),
        ...(clientArtifactDelivery ? { static_build: 'client-artifacts', artifact_base_sha: clientArtifactDelivery.baseSha, artifact_delivery: clientArtifactDelivery } : {}),
        timings_ms: {
          dependencies: timings.dependencies,
          astro_build: timings.astro_build,
          checkout: timings.checkout || 0,
          prepare_release_total: timings.total
        }
      });
      fs.renameSync(candidateStage, path.join(candidateWebRoot, 'dist'));
    }
  } catch (error) {
    writeJson(failurePath, {
      sha,
      contextHash: buildContextHash,
      stage: /npm install|CURRENT_DEPENDENCY_/.test(error.message) ? 'install' : 'build',
      error: error.message,
      failed_at: stamp()
    });
    await cleanupPreparedRelease(releaseRoot);
    throw error;
  }
  if (!skipAstro && !fs.existsSync(path.join(candidateWebRoot, 'dist', 'index.html'))) {
    throw new Error('CURRENT_RELEASE_BUILD_INVALID');
  }
  fs.rmSync(failurePath, { force: true });
  timings.total = Date.now() - prepareStartedAt;
  return { releaseRoot, webRoot: candidateWebRoot, created: true, dependencyMode, timings };
}

async function cleanupPreparedRelease(releaseRoot) {
  assertDisposableRelease(releaseRoot);
  const worktrees = parseReleaseWorktrees(await git(['worktree', 'list', '--porcelain']));
  if (!releaseWorktreeIsDisposable(releaseRoot, worktrees)) {
    if (fs.existsSync(releaseRoot) || worktrees.some(row => path.resolve(row.path) === path.resolve(releaseRoot))) {
      warn(`preserving locked, incomplete or unregistered release ${releaseRoot}`);
    }
    return false;
  }
  try {
    await runBounded(gitBin, ['-C', repoRoot, 'worktree', 'remove', '--force', releaseRoot], {
      label: 'cleanup rejected release',
      timeoutMs: Number(process.env.KIANOS_GIT_TIMEOUT_MS || 30000)
    });
    return true;
  } catch (error) {
    // Git owns worktree identity. Failed removal must not be followed by an
    // unchecked rm that deletes bytes while leaving a locked registration.
    warn(`preserving release after bounded cleanup failure: ${error?.message || error}`);
    return false;
  }
}

async function activateRelease(next, sha) {
  const old = fs.existsSync(releases.active) ? fs.realpathSync(releases.active) : null;
  if (!hasCurrentBuildContext(path.join(next, 'static-web', 'dist'))
    || readBuiltStatus(path.join(next, 'static-web', 'dist'))?.sha !== sha) throw new Error('CURRENT_RELEASE_CONTEXT_MISMATCH');
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
    await cleanupPreparedRelease(releaseRoot);
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
    if (retainedReleaseRoots().has(fs.realpathSync(previousPath))) return;
    fs.renameSync(previousPath, distPath);
    return;
  }
  if (dist && previous?.isDirectory()) {
    assertDisposableRelease(previousPath);
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
  if (!hasCurrentBuildContext(servedRoot)) throw new Error('CURRENT_RELEASE_CONTEXT_MISMATCH');
  const previousRoot = activeReleaseRoot && fs.existsSync(releases.previous)
    ? path.join(fs.realpathSync(releases.previous), 'static-web', 'dist') : previousPath;
  // Old hashed chunks can contain private content too; never cross contexts.
  const fallbackRoot = hasCurrentBuildContext(previousRoot) ? previousRoot : '';
  log(`starting prebuilt Current site on http://${host}:${port}`);
  site = spawn(process.execPath, [
    pinnedServerPath,
    '--host', host,
    '--port', port,
    '--root', servedRoot,
    '--fallback-root', fallbackRoot
  ], {
    cwd: pinnedWebRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      KIANOS_STATIC_FALLBACK_ROOT: fallbackRoot,
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

async function fetchReleaseIdentity(url, deadlineAt) {
  const remainingMs = deadlineAt - Date.now();
  if (remainingMs <= 0) throw new Error('CURRENT_RELEASE_RUNTIME_NOT_READY');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), remainingMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return { http_status: response.status };
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function waitForSiteReady(expectedSha, timeoutMs = 5000) {
  const deadlineAt = Date.now() + timeoutMs;
  let observation = 'no-response';
  let requestError = '';
  while (Date.now() < deadlineAt) {
    if (!site) throw new Error('CURRENT_RELEASE_RUNTIME_EXITED');
    try {
      const identity = await fetchReleaseIdentity(
        `http://${host}:${port}/__kianos-release.json?t=${Date.now()}`,
        deadlineAt
      );
      const problem = releaseIdentityProblem(identity, expectedSha, buildContextHash);
      if (!problem) return;
      observation = problem;
    } catch (error) { requestError = error.cause?.code || error.name; }
    if (Date.now() < deadlineAt) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error(`CURRENT_RELEASE_RUNTIME_NOT_READY:${observation}${requestError ? ':last-request:' + requestError : ''}`);
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
  const probeStateRoot = fs.mkdtempSync(path.join(releases.root, '.probe-state-'));
  const candidateServer = spawn(process.execPath, [
    candidateServerPath,
    '--host', host,
    '--port', String(probePort),
    '--root', path.join(candidateWebRoot, 'dist'),
    '--release-probe-only'
  ], {
    cwd: candidateWebRoot,
    stdio: ['ignore', 'ignore', 'pipe'],
    detached: process.platform !== 'win32',
    env: {
      ...process.env,
      KIANOS_PORT: String(probePort),
      KIANOS_RELEASE_PROBE_ONLY: '1',
      KIANOS_REPO_ROOT: releaseRoot,
      KIANOS_PRIVATE_DIR: path.join(probeStateRoot, 'private'),
      KIANOS_CONTROL_DIR: path.join(probeStateRoot, 'control'),
      KIANOS_CONTROL_REPO_DIR: path.join(probeStateRoot, 'control-repo'),
      KIANOS_PACKET_REPO_DIR: path.join(probeStateRoot, 'packet-repo'),
      KIANOS_EXTERNAL_READING_DIR: path.join(probeStateRoot, 'external-reading'),
      KIANOS_ENGLISH_GENERATED_DIR: path.join(probeStateRoot, 'english-generated'),
      KIANOS_CONTROL_ENABLED: '0',
      KIANOS_PACKET_RELAY_ENABLED: '0'
    }
  });
  let stderr = '';
  let spawnError = null;
  candidateServer.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-1200); });
  candidateServer.once('error', error => { spawnError = error; });
  try {
    const deadlineAt = Date.now() + timeoutMs;
    let observation = 'no-response';
    let requestError = '';
    while (Date.now() < deadlineAt) {
      if (spawnError) throw new Error(`CURRENT_RELEASE_RUNTIME_SPAWN_FAILED:${spawnError.code || spawnError.name}`);
      if (candidateServer.exitCode !== null || candidateServer.signalCode !== null) {
        throw new Error(`CURRENT_RELEASE_RUNTIME_EXITED:${candidateServer.exitCode ?? candidateServer.signalCode}:${stderr.trim()}`);
      }
      try {
        const identity = await fetchReleaseIdentity(
          `http://${host}:${probePort}/__kianos-release.json?t=${Date.now()}`,
          deadlineAt
        );
        const problem = releaseIdentityProblem(identity, expectedSha, buildContextHash);
        if (!problem) return;
        observation = problem;
      } catch (error) { requestError = error.cause?.code || error.name; }
      if (Date.now() < deadlineAt) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    throw new Error(`CURRENT_RELEASE_RUNTIME_NOT_READY:${observation}${requestError ? ':last-request:' + requestError : ''}${stderr ? ':' + stderr.trim() : ''}`);
  } finally {
    try {
      if (candidateServer.pid) {
        await terminateProcessTree(candidateServer.pid, { graceMs: 1000 });
      }
    } finally {
      fs.rmSync(probeStateRoot, { recursive: true, force: true });
    }
  }
}

async function rollbackRelease() {
  await stopSite();
  if (fs.existsSync(releases.previous)) {
    atomicReplaceSymlink(fs.realpathSync(releases.previous), releases.active);
  } else if (fs.existsSync(releases.active)) {
    // Remove only the serving pointer, never the release directory it targets.
    if (!fs.lstatSync(releases.active).isSymbolicLink()) throw new Error('CURRENT_ACTIVE_POINTER_NOT_SYMLINK');
    fs.unlinkSync(releases.active);
  }
  activeReleaseRoot = fs.existsSync(releases.active) ? fs.realpathSync(releases.active) : null;
  if (activeReleaseRoot && activeBuildContextMatches()) {
    startSite();
    await waitForSiteReady(readActiveBuiltStatus()?.sha);
  } else if (!activeReleaseRoot && hasCurrentBuildContext(distPath) && resolveServedRoot(distPath)) {
    startSite();
    await waitForSiteReady(readActiveBuiltStatus()?.sha);
  }
}

async function remoteMainSha() {
  const raw = await git(['ls-remote', 'origin', 'refs/heads/main']);
  return raw.split(/\s+/)[0] || '';
}

async function fetchMainHead() {
  const startedAt = Date.now();
  await git(['fetch', 'origin', 'main', '--prune']);
  return {
    sha: await git(['rev-parse', 'FETCH_HEAD']),
    duration_ms: Date.now() - startedAt
  };
}

async function syncRuntimeChangedSinceLoad(targetSha) {
  const target = String(targetSha || '').trim();
  if (!syncRuntimeLoadedSha || !target || syncRuntimeLoadedSha === target) return false;
  if (syncRuntimeCheckedTargetSha === target) return syncRuntimeCheckedChanged;
  const changed = await git([
    'diff',
    '--name-only',
    syncRuntimeLoadedSha,
    target,
    '--',
    ...syncRuntimePaths
  ]);
  syncRuntimeCheckedTargetSha = target;
  syncRuntimeCheckedChanged = Boolean(changed.trim());
  return syncRuntimeCheckedChanged;
}

async function restartSyncRuntimeIfNeeded(targetSha) {
  if (oneShot || !(await syncRuntimeChangedSinceLoad(targetSha))) return false;
  log('Current sync runtime differs from loaded daemon; restarting the LaunchAgent-managed process after successful handoff');
  stopping = true;
  await stopSite();
  process.exit(0);
  return true;
}

async function syncOnce({ initial = false } = {}) {
  if (syncing || stopping) return false;
  syncing = true;
  const syncStartedAt = Date.now();
  let fetchDurationMs = 0;
  let releaseLock = null;
  try {
    releaseLock = await acquireDeliveryLock(releases.lock);
    const local = await git(['rev-parse', 'HEAD']);
    lastKnownSha = local;
    const priorControlStatus = readControlStatus();
    writeStatus('checking', local);

    const remote = await remoteMainSha();
    if (!remote) throw new Error('origin/main did not return a SHA');
    lastTargetSha = remote;

    const activeSha = readActiveBuiltStatus()?.sha || '';
    if (local === remote && activeReleaseRoot && activeSha === remote && activeBuildContextMatches()) {
      lastSyncHealthy = true;
      writeStatus('synced', activeSha, { control_sha: local, release_root: activeReleaseRoot });
      if (await restartSyncRuntimeIfNeeded(remote)) return false;
      if (initial) {
        log(`Current release already matches main ${local.slice(0, 8)}`);
      }
      return false;
    }

    if (
      local === remote
      && activeReleaseRoot
      && activeBuildContextMatches()
      && priorControlStatus?.state === 'synced'
      && priorControlStatus?.static_build === 'reused'
      && priorControlStatus?.control_sha === remote
      && priorControlStatus?.sha === activeSha
    ) {
      lastSyncHealthy = true;
      writeStatus('synced', activeSha, {
        control_sha: remote,
        target_sha: remote,
        static_build: 'reused',
        release_root: activeReleaseRoot
      });
      if (await restartSyncRuntimeIfNeeded(remote)) return false;
      return false;
    }

    writeStatus('updating', activeSha || local, { control_sha: local, target_sha: remote });
    log(`main advanced ${local.slice(0, 8)} → ${remote.slice(0, 8)}; syncing whole repository`);
    const initialFetch = await fetchMainHead();
    let fetched = initialFetch.sha;
    fetchDurationMs += initialFetch.duration_ms;
    lastTargetSha = fetched;
    // A previous update may have moved HEAD but failed to publish. Classify
    // from the actually served source, never from that failed checkout.
    const builtBase = readActiveBuiltStatus();
    const impactBase = builtBase?.state === 'synced' && builtBase?.sha ? builtBase.sha : local;
    let changed = await git(['diff', '--name-only', impactBase, fetched]);
    let changedPaths = changed ? changed.split('\n').filter(Boolean) : [];
    let buildDecision = classifyStaticBuild(changedPaths);
    let staticRuntimeChanged = requiresStaticRuntimeReload(changedPaths);

    // A burst of accepted commits can land between ls-remote and the expensive
    // build. Re-read main once before building so the daemon starts from the
    // newest coherent target instead of knowingly constructing an obsolete one.
    if (!skipAstro && (buildDecision.required || staticRuntimeChanged || !activeBuildContextMatches())) {
      const preBuildFetch = await fetchMainHead();
      fetchDurationMs += preBuildFetch.duration_ms;
      if (preBuildFetch.sha && preBuildFetch.sha !== fetched) {
        log(`coalescing superseded pre-build target ${fetched.slice(0, 8)} → ${preBuildFetch.sha.slice(0, 8)}`);
        fetched = preBuildFetch.sha;
        lastTargetSha = fetched;
        changed = await git(['diff', '--name-only', impactBase, fetched]);
        changedPaths = changed ? changed.split('\n').filter(Boolean) : [];
        buildDecision = classifyStaticBuild(changedPaths);
        staticRuntimeChanged = requiresStaticRuntimeReload(changedPaths);
      }
    }

    const reuseActiveRelease = !skipAstro
      && Boolean(activeReleaseRoot)
      && activeBuildContextMatches()
      && !buildDecision.required
      && !staticRuntimeChanged;

    if (reuseActiveRelease) {
      lastKnownSha = fetched;
      await git(['checkout', '-B', 'main', fetched]);
      await git(['reset', '--hard', fetched]);
      lastSyncHealthy = true;
      lastNetworkError = '';
      writeStatus('synced', activeSha, {
        control_sha: fetched,
        target_sha: fetched,
        changed_paths: changedPaths.length,
        static_build: 'reused',
        build_impact_paths: 0,
        release_root: activeReleaseRoot,
        timings_ms: {
          remote_fetch: fetchDurationMs,
          sync_total: Date.now() - syncStartedAt
        }
      });
      log(
        `synced ${changedPaths.length} control-only path(s) to ${fetched.slice(0, 8)}; `
        + `serving unchanged release ${activeSha.slice(0, 8)}`
      );
      if (await restartSyncRuntimeIfNeeded(fetched)) return true;
      return true;
    }

    let controlTargetSha = fetched;
    let runtimeReloaded = false;
    let preparedRelease = null;
    let probeDurationMs = 0;
    let promotionDurationMs = 0;
    if (!skipAstro) {
      preparedRelease = await prepareRelease(fetched, {
        changed_paths: changedPaths.length,
        build_impact_paths: buildDecision.build_paths.length,
        lexical_projection_required: buildDecision.lexical_projection_required,
        lexical_projection_paths: buildDecision.lexical_projection_paths.length
      });

      // Recheck fetched main before activation. A later control-only commit
      // can reuse this exact built release; output/runtime changes still need
      // a fresh release and must not promote the superseded candidate.
      const preActivationFetch = await fetchMainHead();
      fetchDurationMs += preActivationFetch.duration_ms;
      const supersedingRemote = preActivationFetch.sha;
      if (supersedingRemote && supersedingRemote !== fetched) {
        const laterChanges = await git(['diff', '--no-renames', '--name-only', fetched, supersedingRemote]);
        const laterPaths = laterChanges ? laterChanges.split('\n').filter(Boolean) : [];
        const laterBuild = classifyStaticBuild(laterPaths);
        if (!laterBuild.required && !requiresStaticRuntimeReload(laterPaths)) {
          controlTargetSha = supersedingRemote;
          lastTargetSha = supersedingRemote;
          changedPaths = [...new Set([...changedPaths, ...laterPaths])];
          log(
            `keeping built release ${fetched.slice(0, 8)} for control-only main ${supersedingRemote.slice(0, 8)}; `
            + 'no second build required'
          );
        } else {
          if (preparedRelease.created) await cleanupPreparedRelease(preparedRelease.releaseRoot);
          lastTargetSha = supersedingRemote;
          writeStatus(oneShot ? 'pending' : 'coalescing', activeSha, {
            control_sha: local,
            target_sha: supersedingRemote,
            superseded_sha: fetched,
            changed_paths: changedPaths.length,
            static_build: 'discarded-superseded',
            build_impact_paths: buildDecision.build_paths.length,
            release_root: activeReleaseRoot,
            timings_ms: {
              remote_fetch: fetchDurationMs,
              dependencies: preparedRelease.timings?.dependencies || 0,
              astro_build: preparedRelease.timings?.astro_build || 0,
              prepare_release_total: preparedRelease.timings?.total || 0,
              sync_total: Date.now() - syncStartedAt
            }
          });
          log(
            `built target ${fetched.slice(0, 8)} was superseded by ${supersedingRemote.slice(0, 8)} before activation; `
            + 'Stable remains unchanged'
          );
          if (oneShot) {
            lastSyncHealthy = false;
            return false;
          }
          setTimeout(() => void syncOnce(), 75);
          return true;
        }
      }

      try {
        const probeStartedAt = Date.now();
        await probeRelease(preparedRelease.releaseRoot, fetched);
        probeDurationMs = Date.now() - probeStartedAt;
      } catch (error) {
        warn(`new Current release probe failed before activation; keeping current release: ${error.message}`);
        // The immutable build receipt is already verified. Readiness failure
        // must keep this exact artifact for the next bounded probe, rather
        // than rebuilding the same SHA under the same load. It is never active
        // until both identity and configured-runtime readiness pass.
        throw error;
      }
      const promotionStartedAt = Date.now();
      await activateRelease(preparedRelease.releaseRoot, fetched);
      if (!oneShot) {
        try {
          if (site) {
            log('performing one controlled server reload for accepted release transition');
            await reloadSite();
          } else {
            log('starting accepted Current release on the configured runtime endpoint');
            startSite();
          }
          await waitForSiteReady(fetched);
          runtimeReloaded = true;
        } catch (error) {
          warn(`new Current release failed readiness; rolling back: ${error.message}`);
          await rollbackRelease();
          throw error;
        }
      }
      promotionDurationMs = Date.now() - promotionStartedAt;
    }
    lastKnownSha = controlTargetSha;
    await git(['checkout', '-B', 'main', controlTargetSha]);
    await git(['reset', '--hard', controlTargetSha]);
    if (!skipAstro) {
      try {
        await pruneReleases();
      } catch (error) {
        warn(`post-handoff release cleanup deferred; accepted release remains active: ${error?.message || error}`);
      }
    }

    lastSyncHealthy = true;
    lastNetworkError = '';
    const staticBuildOutcome = skipAstro ? 'skipped' : preparedRelease?.created === false ? 'reused' : preparedRelease?.timings?.client_artifacts ? 'client-artifacts' : controlTargetSha === fetched ? 'rebuilt' : 'reused';
    writeStatus('synced', skipAstro ? fetched : readActiveBuiltStatus()?.sha || fetched, {
      control_sha: controlTargetSha,
      target_sha: controlTargetSha,
      changed_paths: changedPaths.length,
      static_build: staticBuildOutcome,
      ...(preparedRelease?.timings?.client_artifacts ? { artifact_base_sha: preparedRelease.timings.client_artifacts.baseSha, artifact_delivery: preparedRelease.timings.client_artifacts } : {}),
      build_impact_paths: buildDecision.build_paths.length,
      ...(!skipAstro && activeReleaseRoot ? { release_root: activeReleaseRoot } : {}),
      timings_ms: {
        remote_fetch: fetchDurationMs,
        checkout: preparedRelease?.timings?.checkout || 0,
        dependencies: preparedRelease?.timings?.dependencies || 0,
        astro_build: preparedRelease?.timings?.astro_build || 0,
        prepare_release_total: preparedRelease?.timings?.total || 0,
        release_probe: probeDurationMs,
        promotion: promotionDurationMs,
        sync_total: Date.now() - syncStartedAt
      }
    });
    log(
      `synced ${changedPaths.length} changed path(s) to control ${controlTargetSha.slice(0, 8)}; `
      + `static Current is ${fetched.slice(0, 8)} (${staticBuildOutcome})`
    );

    if (await restartSyncRuntimeIfNeeded(controlTargetSha)) return true;
    if (!oneShot && staticRuntimeChanged && site && !runtimeReloaded) {
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
      build_blocked: readBuildFailure()?.sha === (lastTargetSha || lastKnownSha)
        && readBuildFailure()?.contextHash === buildContextHash,
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

if (!oneShot && !syncRuntimeLoadedSha) {
  warn('Missing KIANOS_SYNC_RUNTIME_SHA; start Current through the installed LaunchAgent or npm run current:serve.');
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
  if (activeReleaseRoot || resolveServedRoot(distPath)) warn(error.stack || error.message);
}
await syncOnce({ initial: true });

if (oneShot) {
  log(`one-shot Current sync ${lastSyncHealthy ? 'PASS' : 'FAIL'}`);
  process.exit(lastSyncHealthy ? 0 : 1);
}

try { if (!site) startSite(); } catch (error) { warn(error.stack || error.message); }
log(`watching origin/main every ${Math.round(intervalMs / 1000)}s; new Current is prebuilt before learner traffic switches`);
setInterval(() => void syncOnce(), intervalMs);
