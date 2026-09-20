#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const webRoot = path.join(repoRoot, 'static-web');
const markerPath = path.join(repoRoot, '.git', 'kianos-current-mirror');
const staticServerPath = path.join(webRoot, 'scripts', 'kianos-static-server.mjs');
const statusPath = path.join(webRoot, 'public', '__kianos-current.json');
const distPath = path.join(webRoot, 'dist');
const stagePath = path.join(webRoot, '.current-build-next');
const backupPath = path.join(webRoot, '.current-build-prev');
const intervalMs = Math.max(3000, Number(process.env.KIANOS_SYNC_INTERVAL_MS || 8000));
const host = process.env.KIANOS_HOST || '127.0.0.1';
const port = String(process.env.KIANOS_PORT || '4321');
const npmBin = process.env.KIANOS_NPM_BIN || 'npm';
const oneShot = process.env.KIANOS_SYNC_ONCE === '1';
const skipAstro = process.env.KIANOS_SKIP_ASTRO === '1';

let site = null;
let stopping = false;
let syncing = false;
let restartingSite = false;
let lastNetworkError = '';
let lastKnownSha = '';
let lastSyncHealthy = true;

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
  if (!fs.existsSync(distPath) && fs.existsSync(backupPath)) {
    fs.renameSync(backupPath, distPath);
  } else if (fs.existsSync(distPath) && fs.existsSync(backupPath)) {
    fs.rmSync(backupPath, { recursive: true, force: true });
  }
}

async function buildStatic(sha, extra = {}) {
  fs.rmSync(stagePath, { recursive: true, force: true });
  writeStatus('building', sha, extra);
  log(`building static Current ${String(sha).slice(0, 8)} while the previous site remains available`);
  await runChild(npmBin, ['run', 'build', '--', '--outDir', stagePath], { label: 'Astro static build' });
  writeBuiltStatus(stagePath, sha, extra);
}

function promoteStaticBuild() {
  if (!fs.existsSync(stagePath)) throw new Error('STATIC_BUILD_STAGE_MISSING');
  fs.rmSync(backupPath, { recursive: true, force: true });
  const hadDist = fs.existsSync(distPath);
  if (hadDist) fs.renameSync(distPath, backupPath);
  try {
    fs.renameSync(stagePath, distPath);
  } catch (error) {
    if (!fs.existsSync(distPath) && fs.existsSync(backupPath)) fs.renameSync(backupPath, distPath);
    throw error;
  }
  fs.rmSync(backupPath, { recursive: true, force: true });
}

function startSite() {
  if (skipAstro || stopping || site) return;
  if (!fs.existsSync(staticServerPath)) {
    throw new Error(`KianOS static server missing at ${staticServerPath}`);
  }
  if (!fs.existsSync(path.join(distPath, 'index.html'))) {
    throw new Error('STATIC_CURRENT_BUILD_MISSING');
  }
  log(`starting prebuilt Current site on http://${host}:${port}`);
  site = spawn(process.execPath, [
    staticServerPath,
    '--host', host,
    '--port', port,
    '--root', distPath
  ], {
    cwd: webRoot,
    stdio: 'inherit',
    env: process.env
  });
  site.once('exit', (code, signal) => {
    const expected = stopping || restartingSite;
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

async function ensureStaticBuild(sha, extra = {}) {
  if (skipAstro) return false;
  recoverStaticDirectories();
  const built = readBuiltStatus();
  if (built?.state === 'synced' && built?.sha === sha && fs.existsSync(path.join(distPath, 'index.html'))) {
    return false;
  }

  await buildStatic(sha, extra);
  const wasServing = Boolean(site);
  if (wasServing) {
    restartingSite = true;
    await stopSite();
  }
  try {
    promoteStaticBuild();
  } finally {
    restartingSite = false;
    if (wasServing && !stopping && !site) {
      try { startSite(); } catch (error) { warn(error.stack || error.message); }
    }
  }
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
    lastNetworkError = '';

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
    const changed = await git(['diff', '--name-only', local, fetched]);
    const changedPaths = changed ? changed.split('\n').filter(Boolean) : [];

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

    await ensureStaticBuild(fetched, { changed_paths: changedPaths.length });
    lastSyncHealthy = true;
    writeStatus('synced', fetched, { changed_paths: changedPaths.length });
    log(`synced ${changedPaths.length} changed path(s); static Current is ${fetched.slice(0, 8)}`);
    return true;
  } catch (error) {
    lastSyncHealthy = false;
    const message = error?.message || String(error);
    if (message !== lastNetworkError) {
      warn(`sync/build check failed: ${message}`);
      lastNetworkError = message;
    }
    writeStatus('degraded', lastKnownSha);
    if (!site && !stopping && fs.existsSync(path.join(distPath, 'index.html'))) {
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
