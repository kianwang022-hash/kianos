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
const astroBin = path.join(webRoot, 'node_modules', '.bin', 'astro');
const statusPath = path.join(webRoot, 'public', '__kianos-current.json');
const intervalMs = Math.max(3000, Number(process.env.KIANOS_SYNC_INTERVAL_MS || 8000));
const host = process.env.KIANOS_HOST || '127.0.0.1';
const port = String(process.env.KIANOS_PORT || '4321');
const npmBin = process.env.KIANOS_NPM_BIN || 'npm';
const oneShot = process.env.KIANOS_SYNC_ONCE === '1';
const skipAstro = process.env.KIANOS_SKIP_ASTRO === '1';

let astro = null;
let stopping = false;
let syncing = false;
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

function writeStatus(state, sha = lastKnownSha, extra = {}) {
  try {
    fs.mkdirSync(path.dirname(statusPath), { recursive: true });
    fs.writeFileSync(statusPath, `${JSON.stringify({
      state,
      sha: String(sha || ''),
      updated_at: stamp(),
      ...extra
    })}\n`, 'utf8');
  } catch (error) {
    warn(`could not write local Current status: ${error?.message || error}`);
  }
}

async function npmInstall() {
  log('package inputs changed; refreshing static-web dependencies');
  await new Promise((resolve, reject) => {
    const child = spawn(npmBin, ['install', '--no-audit', '--no-fund'], {
      cwd: webRoot,
      stdio: 'inherit',
      env: process.env
    });
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`npm install exited ${code}`)));
    child.once('error', reject);
  });
}

function startAstro() {
  if (skipAstro || stopping || astro) return;
  if (!fs.existsSync(astroBin)) {
    throw new Error(`Astro binary missing at ${astroBin}; run npm install in static-web.`);
  }
  log(`starting Current site on http://${host}:${port}`);
  astro = spawn(astroBin, ['dev', '--host', host, '--port', port], {
    cwd: webRoot,
    stdio: 'inherit',
    env: process.env
  });
  astro.once('exit', (code, signal) => {
    const expected = stopping || syncing;
    astro = null;
    if (!expected) {
      warn(`Astro stopped unexpectedly (${signal || code}); restarting in 1200ms`);
      setTimeout(() => {
        try { startAstro(); } catch (error) { warn(error.stack || error.message); }
      }, 1200);
    }
  });
}

async function stopAstro() {
  if (!astro) return;
  const child = astro;
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
  astro = null;
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
      lastSyncHealthy = true;
      writeStatus('synced', local);
      if (initial) log(`Current mirror already matches main ${local.slice(0, 8)}`);
      return false;
    }

    writeStatus('updating', local, { target_sha: remote });
    log(`main advanced ${local.slice(0, 8)} → ${remote.slice(0, 8)}; syncing whole repository`);
    await git(['fetch', 'origin', 'main', '--prune']);
    const fetched = await git(['rev-parse', 'origin/main']);
    const changed = await git(['diff', '--name-only', local, fetched]);
    const changedPaths = changed ? changed.split('\n').filter(Boolean) : [];

    await stopAstro();
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

    lastSyncHealthy = true;
    writeStatus('synced', fetched, { changed_paths: changedPaths.length });
    log(`synced ${changedPaths.length} changed path(s); Current is ${fetched.slice(0, 8)}`);
    startAstro();
    return true;
  } catch (error) {
    lastSyncHealthy = false;
    const message = error?.message || String(error);
    if (message !== lastNetworkError) {
      warn(`sync check failed: ${message}`);
      lastNetworkError = message;
    }
    writeStatus('degraded', lastKnownSha);
    if (!astro && !stopping) {
      try { startAstro(); } catch (startError) { warn(startError.stack || startError.message); }
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
  await stopAstro();
  process.exit(0);
}

if (!fs.existsSync(markerPath) && process.env.KIANOS_ALLOW_UNSAFE_SYNC !== '1') {
  warn('Refusing destructive main sync outside a dedicated Current mirror.');
  warn(`Expected marker: ${markerPath}`);
  warn('Install with: npm run current:install');
  process.exit(2);
}

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

startAstro();
log(`watching origin/main every ${Math.round(intervalMs / 1000)}s; all subjects/content sync as one repository`);
setInterval(() => void syncOnce(), intervalMs);
