#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import {
  classifyStaticBuild,
  staticBuildCanReuseFromBase
} from './currentStaticImpact.mjs';
import {
  adoptLegacyDist,
  isAtomicServingLink,
  promoteStagedBuild,
  resolveServedRoot
} from './currentStaticSlots.mjs';

const execFileAsync = promisify(execFile);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const webRoot = path.join(repoRoot, 'static-web');
const markerPath = path.join(repoRoot, '.git', 'kianos-current-mirror');
const staticServerPath = path.join(webRoot, 'scripts', 'kianos-static-server.mjs');
const statusPath = path.join(webRoot, 'public', '__kianos-current.json');
const distPath = path.join(webRoot, 'dist');
const stagePath = path.join(webRoot, '.current-build-next');
const previousPath = path.join(webRoot, '.current-build-prev');
const buildsPath = path.join(webRoot, '.current-builds');
const failurePath = path.join(webRoot, '.current-build-failure.json');
const intervalMs = Math.max(3000, Number(process.env.KIANOS_SYNC_INTERVAL_MS || 8000));
const host = process.env.KIANOS_HOST || '127.0.0.1';
const port = String(process.env.KIANOS_PORT || '4321');
const npmBin = process.env.KIANOS_NPM_BIN || 'npm';
const oneShot = process.env.KIANOS_SYNC_ONCE === '1';
const skipAstro = process.env.KIANOS_SKIP_ASTRO === '1';
const buildNice = Math.max(0, Math.min(20, Number(process.env.KIANOS_BUILD_NICE || 10)));

let site = null;
let stopping = false;
let syncing = false;
let reloadingSite = false;
let lastNetworkError = '';
let lastKnownSha = '';
let lastSyncHealthy = true;

function readBuildFailure() {
  try { return JSON.parse(fs.readFileSync(failurePath, 'utf8')); } catch { return null; }
}

const stamp = () => new Date().toISOString();
const log = (message) => console.log(`[${stamp()}] ${message}`);
const warn = (message) => console.error(`[${stamp()}] ${message}`);

async function git(args) {
  const { stdout } = await execFileAsync('git', args, { cwd: repoRoot, maxBuffer: 16 * 1024 * 1024 });
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

async function runChild(file, args, { cwd = webRoot, label = file } = {}) {
  await new Promise((resolve, reject) => {
    const child = spawn(file, args, {
      cwd,
      stdio: 'inherit',
      env: process.env
    });
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`${label} exited ${code}`)));
    child.once('error', reject);
  });
}

async function npmInstall() {
  log('package inputs changed; refreshing static-web dependencies');
  await runChild(npmBin, ['install', '--no-audit', '--no-fund'], { label: 'npm install' });
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

function ensureAtomicServingLayout(sha) {
  let dist = null;
  try { dist = fs.lstatSync(distPath); } catch {}
  if (!dist || dist.isSymbolicLink()) return resolveServedRoot(distPath);
  if (site) throw new Error('STATIC_ATOMIC_LAYOUT_MIGRATION_REQUIRES_STOPPED_SITE');

  const built = readBuiltStatus(distPath);
  return adoptLegacyDist({
    distPath,
    previousPath,
    buildsRoot: buildsPath,
    sha: built?.sha || sha || 'legacy'
  });
}

async function buildStatic(sha, extra = {}) {
  const failure = readBuildFailure();
  if (failure?.sha === sha && !(oneShot && process.env.KIANOS_RETRY_FAILED_BUILD === '1')) {
    throw new Error(`CURRENT_BUILD_BLOCKED:${sha}:${failure.error}`);
  }
  fs.rmSync(stagePath, { recursive: true, force: true });
  writeStatus('building', sha, extra);
  // The compiler validates its content-addressed cache. Even when Git reports
  // no lexical change, a cold/missing/corrupt projection cannot be trusted.
  const buildScript = 'build';
  log(
    'building static Current ' + String(sha).slice(0, 8)
    + ' at background priority while the previous site remains available'
    + '; lexical projection recompiles only changed inputs'
  );
  const args = [npmBin, 'run', buildScript, '--', '--outDir', stagePath];
  try {
    if (buildNice > 0 && process.platform !== 'win32' && fs.existsSync('/usr/bin/nice')) {
      await runChild('/usr/bin/nice', ['-n', String(buildNice), ...args], { label: 'Astro static build' });
    } else {
      await runChild(npmBin, args.slice(1), { label: 'Astro static build' });
    }
  } catch (error) {
    writeJson(failurePath, { sha, error: error.message, failed_at: stamp() });
    throw error;
  }
  writeBuiltStatus(stagePath, sha, extra);
  fs.rmSync(failurePath, { force: true });
}

function promoteStaticBuild(sha) {
  const promoted = promoteStagedBuild({
    distPath,
    previousPath,
    stagePath,
    buildsRoot: buildsPath,
    sha
  });
  log(
    'atomically switched static Current to ' + String(sha).slice(0, 8)
    + (promoted.previousRoot ? '; previous slot retained for old assets' : '')
  );
}

function startSite() {
  if (skipAstro || stopping || site) return;
  if (!fs.existsSync(staticServerPath)) {
    throw new Error(`KianOS static server missing at ${staticServerPath}`);
  }
  if (!resolveServedRoot(distPath)) {
    throw new Error('STATIC_CURRENT_BUILD_MISSING');
  }
  log(`starting prebuilt Current site on http://${host}:${port}`);
  site = spawn(process.execPath, [
    staticServerPath,
    '--host', host,
    '--port', port,
    '--root', distPath,
    '--fallback-root', previousPath
  ], {
    cwd: webRoot,
    stdio: 'inherit',
    env: process.env
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

function reuseStaticBuild(sha, { baseSha = '', ...extra } = {}) {
  if (skipAstro) return false;
  recoverStaticDirectories();
  ensureAtomicServingLayout(sha);
  const activeRoot = resolveServedRoot(distPath);
  if (!activeRoot) return false;
  const prior = readBuiltStatus(activeRoot);
  if (!staticBuildCanReuseFromBase(prior, baseSha)) {
    log(
      'static build reuse refused; active build does not prove base '
      + String(baseSha || '').slice(0, 8)
    );
    return false;
  }
  writeBuiltStatus(activeRoot, sha, {
    ...extra,
    reused_static_build: true,
    reused_from_sha: String(prior.sha || '')
  });
  return true;
}

async function ensureStaticBuild(sha, extra = {}) {
  if (skipAstro) return false;
  recoverStaticDirectories();
  ensureAtomicServingLayout(sha);

  const activeRoot = resolveServedRoot(distPath);
  const built = activeRoot ? readBuiltStatus(activeRoot) : null;
  if (built?.state === 'synced' && built?.sha === sha && activeRoot) {
    return false;
  }

  await buildStatic(sha, extra);
  if (!isAtomicServingLink(distPath) && fs.existsSync(distPath)) {
    ensureAtomicServingLayout(sha);
  }
  promoteStaticBuild(sha);
  return true;
}

async function remoteMainSha() {
  const raw = await git(['ls-remote', 'origin', 'refs/heads/main']);
  return raw.split(/\s+/)[0] || '';
}

async function syncOnce({ initial = false } = {}) {
  if (syncing || stopping) return false;
  syncing = true;
  try {
    const local = await git(['rev-parse', 'HEAD']);
    lastKnownSha = local;
    writeStatus('checking', local);

    const remote = await remoteMainSha();
    if (!remote) throw new Error('origin/main did not return a SHA');

    if (local === remote) {
      const rebuilt = await ensureStaticBuild(local, { changed_paths: 0 });
      lastSyncHealthy = true;
      writeStatus('synced', local);
      if (initial) {
        log(`Current mirror already matches main ${local.slice(0, 8)}${rebuilt ? '; static build refreshed' : '; static build current'}`);
      }
      return rebuilt;
    }

    writeStatus('updating', local, { target_sha: remote });
    log(`main advanced ${local.slice(0, 8)} → ${remote.slice(0, 8)}; syncing whole repository`);
    await git(['fetch', 'origin', 'main', '--prune']);
    const fetched = await git(['rev-parse', 'origin/main']);
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
    const staticRuntimeChanged = changedPaths.some((file) => (
      file === 'static-web/scripts/kianos-static-server.mjs'
      || /^static-web\/scripts\/private.*\.mjs$/.test(file)
      || file === 'static-web/src/lib/englishSessionCatalog.mjs'
    ));

    await git(['checkout', '-B', 'main', 'origin/main']);
    await git(['reset', '--hard', 'origin/main']);
    lastKnownSha = fetched;

    if (changedPaths.some((file) => [
      'static-web/package.json',
      'static-web/package-lock.json',
      'static-web/npm-shrinkwrap.json'
    ].includes(file))) {
      await npmInstall();
    }

    let staticBuild = 'rebuilt';
    if (!skipAstro && !buildDecision.required) {
      const reused = reuseStaticBuild(fetched, {
        baseSha: impactBase,
        changed_paths: changedPaths.length,
        build_impact_paths: 0
      });
      if (reused) {
        staticBuild = 'reused';
        log(
          `reused current static build for ${fetched.slice(0, 8)}; `
          + `${changedPaths.length} changed path(s) are runtime/control-only`
        );
      } else {
        await ensureStaticBuild(fetched, {
          changed_paths: changedPaths.length,
          build_impact_paths: 0,
          lexical_projection_required: false,
          lexical_projection_paths: 0
        });
      }
    } else {
      await ensureStaticBuild(fetched, {
        changed_paths: changedPaths.length,
        build_impact_paths: buildDecision.build_paths.length,
        lexical_projection_required: buildDecision.lexical_projection_required,
        lexical_projection_paths: buildDecision.lexical_projection_paths.length
      });
    }

    lastSyncHealthy = true;
    lastNetworkError = '';
    writeStatus('synced', fetched, {
      changed_paths: changedPaths.length,
      static_build: skipAstro ? 'skipped' : staticBuild,
      build_impact_paths: buildDecision.build_paths.length
    });
    log(
      `synced ${changedPaths.length} changed path(s); static Current is ${fetched.slice(0, 8)} `
      + `(${skipAstro ? 'skipped' : staticBuild})`
    );

    if (!oneShot && syncRuntimeChanged) {
      log('Current sync runtime changed; restarting the LaunchAgent-managed process after successful handoff');
      stopping = true;
      await stopSite();
      process.exit(0);
    }
    if (!oneShot && staticRuntimeChanged && site) {
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
    writeStatus('degraded', readBuiltStatus()?.sha || '', {
      target_sha: lastKnownSha,
      build_blocked: readBuildFailure()?.sha === lastKnownSha,
      error: message
    });
    if (!oneShot && !site && !stopping && resolveServedRoot(distPath)) {
      try { startSite(); } catch (startError) { warn(startError.stack || startError.message); }
    }
    return false;
  } finally {
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
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

try {
  lastKnownSha = await git(['rev-parse', 'HEAD']);
} catch {}
writeStatus('starting', lastKnownSha);
await syncOnce({ initial: true });

if (oneShot) {
  log(`one-shot Current sync ${lastSyncHealthy ? 'PASS' : 'FAIL'}`);
  process.exit(lastSyncHealthy ? 0 : 1);
}

try { startSite(); } catch (error) { warn(error.stack || error.message); }
log(`watching origin/main every ${Math.round(intervalMs / 1000)}s; new Current is prebuilt before learner traffic switches`);
setInterval(() => void syncOnce(), intervalMs);
