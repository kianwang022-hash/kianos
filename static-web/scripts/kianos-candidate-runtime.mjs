#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import { canReuseDependencies } from './currentDependencies.mjs';

const execFileAsync = promisify(execFile);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(webRoot, '..');

export const DEFAULT_CANDIDATE_HOST = '127.0.0.1';
export const DEFAULT_CANDIDATE_PORT = 4322;
export const STABLE_CURRENT_PORT = 4321;

export function resolveCandidateConfig(env = process.env) {
  const host = String(env.KIANOS_CANDIDATE_HOST || DEFAULT_CANDIDATE_HOST).trim();
  const port = Number(env.KIANOS_CANDIDATE_PORT || DEFAULT_CANDIDATE_PORT);
  if (!host) throw new Error('KIANOS_CANDIDATE_HOST_INVALID');
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('KIANOS_CANDIDATE_PORT_INVALID');
  }
  if (port === STABLE_CURRENT_PORT) {
    throw new Error('KIANOS_CANDIDATE_MUST_NOT_USE_STABLE_PORT_4321');
  }
  return {
    host,
    port,
    openBrowser: String(env.KIANOS_CANDIDATE_OPEN || '1') !== '0',
    base: `http://${host}:${port}/`
  };
}

export function isolatedCandidateEnv(runtimeRoot, parentEnv = process.env, releaseIdentity = 'candidate') {
  const root = path.resolve(runtimeRoot);
  return {
    ...parentEnv,
    KIANOS_CANDIDATE_RUNTIME: '1',
    KIANOS_RELEASE_SHA: releaseIdentity,
    KIANOS_ASTRO_ALLOW_LIVE_PRIVATE: '0',
    KIANOS_ASTRO_RUNTIME_ROOT: root,
    KIANOS_PRIVATE_DIR: path.join(root, 'learner-state'),
    KIANOS_CONTROL_DIR: path.join(root, 'control'),
    KIANOS_CONTROL_REPO_DIR: path.join(root, 'control-repo'),
    KIANOS_PACKET_REPO_DIR: path.join(root, 'packet-repo'),
    KIANOS_EXTERNAL_READING_DIR: path.join(root, 'external-reading'),
    KIANOS_ENGLISH_GENERATED_DIR: path.join(root, 'english-generated'),
    KIANOS_CONTROL_ENABLED: '0',
    KIANOS_PACKET_RELAY_ENABLED: '0'
  };
}

function astroExecutable(root) {
  return path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'astro.cmd' : 'astro');
}

function dependencySources(env = process.env) {
  const rows = [];
  const explicit = String(env.KIANOS_CANDIDATE_DEPENDENCY_SOURCE || '').trim();
  if (explicit) rows.push(path.resolve(explicit));
  rows.push(path.join(os.homedir(), '.kianos-current-releases', 'active', 'static-web'));
  rows.push(path.join(path.dirname(repoRoot), '.kianos-current-releases', 'active', 'static-web'));
  return [...new Set(rows)];
}

export function ensureCandidateDependencies(env = process.env) {
  const localAstro = astroExecutable(webRoot);
  if (fs.existsSync(localAstro)) return { source: 'local', cleanup: () => {} };

  const nodeModules = path.join(webRoot, 'node_modules');
  for (const source of dependencySources(env)) {
    if (!fs.existsSync(source) || !canReuseDependencies(source, webRoot)) continue;
    const sourceModules = path.join(source, 'node_modules');
    fs.rmSync(nodeModules, { recursive: true, force: true });
    fs.symlinkSync(sourceModules, nodeModules, 'dir');
    if (!fs.existsSync(astroExecutable(webRoot))) {
      fs.rmSync(nodeModules, { recursive: true, force: true });
      continue;
    }
    return {
      source,
      cleanup: () => {
        try {
          if (fs.lstatSync(nodeModules).isSymbolicLink()) fs.rmSync(nodeModules, { force: true });
        } catch {}
      }
    };
  }

  throw new Error(
    'KIANOS_CANDIDATE_DEPENDENCIES_MISSING: no compatible local/Current dependency tree; run npm install once in static-web'
  );
}

async function shortHead() {
  try {
    const { stdout } = await execFileAsync('git', ['rev-parse', '--short=12', 'HEAD'], { cwd: repoRoot });
    return String(stdout || '').trim() || 'worktree';
  } catch {
    return 'worktree';
  }
}

async function waitForReady(base, child) {
  for (let i = 0; i < 240; i += 1) {
    if (child.exitCode != null) throw new Error('KIANOS_CANDIDATE_EXITED_BEFORE_READY');
    try {
      const response = await fetch(base, { cache: 'no-store', signal: AbortSignal.timeout(750) });
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('KIANOS_CANDIDATE_START_TIMEOUT');
}

async function main() {
  const config = resolveCandidateConfig();
  const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-candidate-'));
  let dependencyLease = null;
  let child = null;
  let stopping = false;

  const cleanup = () => {
    try { dependencyLease?.cleanup?.(); } catch {}
    try { fs.rmSync(runtimeRoot, { recursive: true, force: true }); } catch {}
  };

  const stop = (signal = 'SIGTERM') => {
    if (stopping) return;
    stopping = true;
    try { child?.kill(signal); } catch {}
  };

  process.on('SIGINT', () => stop('SIGINT'));
  process.on('SIGTERM', () => stop('SIGTERM'));

  try {
    dependencyLease = ensureCandidateDependencies();
    const head = await shortHead();
    const env = isolatedCandidateEnv(runtimeRoot, process.env, `candidate-${head}`);
    const astro = astroExecutable(webRoot);
    child = spawn(astro, [
      'dev',
      '--host', config.host,
      '--port', String(config.port),
      '--strictPort'
    ], {
      cwd: webRoot,
      env,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    const exit = new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', (code, signal) => resolve({ code: code ?? 1, signal }));
    });

    await waitForReady(config.base, child);
    console.log(`[KianOS Candidate] READY ${config.base}`);
    console.log(`[KianOS Candidate] branch HEAD ${head}; isolated runtime ${runtimeRoot}`);
    console.log('[KianOS Candidate] stable Current remains http://127.0.0.1:4321/');

    if (config.openBrowser && process.platform === 'darwin') {
      try { await execFileAsync('/usr/bin/open', [config.base]); }
      catch (error) { console.warn('[KianOS Candidate] browser open failed:', error?.message || error); }
    }

    const result = await exit;
    if (!stopping && result.code !== 0) {
      throw new Error(`KIANOS_CANDIDATE_EXITED:${result.code}:${result.signal || ''}`);
    }
    process.exitCode = result.code;
  } finally {
    cleanup();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
