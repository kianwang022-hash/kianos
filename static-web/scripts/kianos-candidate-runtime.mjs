#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import { canReuseDependencies, cloneDependencies, readDependencyProof } from './currentDependencies.mjs';
import { terminateProcessTree } from './currentRelease.mjs';

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

export function ensureCandidateDependencies(env = process.env, {
  targetWebRoot = webRoot,
  sources = null
} = {}) {
  const nodeModules = path.join(targetWebRoot, 'node_modules');
  const localAstro = astroExecutable(targetWebRoot);

  if (fs.existsSync(localAstro)) {
    let linked = false;
    try { linked = fs.lstatSync(nodeModules).isSymbolicLink(); } catch {}

    if (!linked) {
      const proof = readDependencyProof(targetWebRoot);
      if (!proof || canReuseDependencies(targetWebRoot, targetWebRoot)) {
        return { source: 'local', mode: 'local', cleanup: () => {} };
      }
      fs.rmSync(nodeModules, { recursive: true, force: true });
    } else {
      const resolvedModules = fs.realpathSync(nodeModules);
      const linkedSource = path.dirname(resolvedModules);
      if (!canReuseDependencies(linkedSource, targetWebRoot)) {
        throw new Error('KIANOS_CANDIDATE_EXTERNAL_NODE_MODULES_UNSAFE:' + linkedSource);
      }
      fs.rmSync(nodeModules, { force: true });
      const reused = cloneDependencies(linkedSource, targetWebRoot);
      return {
        source: linkedSource,
        mode: 'materialized',
        duration_ms: reused.duration_ms,
        cleanup: () => {}
      };
    }
  }

  const candidates = Array.isArray(sources) ? sources : dependencySources(env);
  for (const source of candidates) {
    if (!fs.existsSync(source) || !canReuseDependencies(source, targetWebRoot)) continue;
    const reused = cloneDependencies(source, targetWebRoot);
    if (!fs.existsSync(astroExecutable(targetWebRoot))) {
      fs.rmSync(nodeModules, { recursive: true, force: true });
      continue;
    }
    return {
      source,
      mode: 'materialized',
      duration_ms: reused.duration_ms,
      cleanup: () => {}
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

async function portAccepting(host, port) {
  return await new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const finish = (value) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(250);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

async function waitForReady(config, child) {
  // Readiness must never render a KianOS surface. Business routes can load
  // large canonical objects; polling them during startup creates overlapping
  // aborted SSR work and defeats the Fast Lane before Kian opens a page.
  for (let i = 0; i < 240; i += 1) {
    if (child.exitCode != null) throw new Error('KIANOS_CANDIDATE_EXITED_BEFORE_READY');
    if (await portAccepting(config.host, config.port)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
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

  const stop = () => {
    if (stopping) return;
    stopping = true;
    if (child?.pid) {
      void terminateProcessTree(child.pid, { graceMs: 1000 }).catch((error) => {
        console.warn('[KianOS Candidate] process-tree cleanup failed:', error?.message || error);
      });
    }
  };

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);

  try {
    dependencyLease = ensureCandidateDependencies();
    if (dependencyLease?.mode === 'materialized') {
      console.log('[KianOS Candidate] materialized compatible dependencies inside this worktree in '
        + dependencyLease.duration_ms + 'ms');
    }
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
      shell: process.platform === 'win32',
      detached: process.platform !== 'win32'
    });

    const exit = new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', (code, signal) => resolve({ code: code ?? 1, signal }));
    });

    await waitForReady(config, child);
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
    if (child?.pid && child.exitCode == null) {
      try { await terminateProcessTree(child.pid, { graceMs: 1000 }); } catch {}
    }
    cleanup();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
