#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { resolveCandidateConfig, STABLE_CURRENT_PORT } from './kianos-candidate-runtime.mjs';
import { terminateProcessTree } from './currentRelease.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(webRoot, '..');
const stewardPath = path.join(webRoot, 'src/pages/steward/index.astro');
const marker = 'FAST-LANE-WORKFLOW-PROBE';
const original = fs.readFileSync(stewardPath, 'utf8');
const sourceNeedle = '<h1>今天怎么过</h1>';

assert.ok(original.includes(sourceNeedle), 'representative Steward UI owner changed unexpectedly');

const packageJson = JSON.parse(fs.readFileSync(path.join(webRoot, 'package.json'), 'utf8'));
const agents = fs.readFileSync(path.join(repoRoot, 'AGENTS.md'), 'utf8');
const websiteCurrent = fs.readFileSync(path.join(webRoot, 'CURRENT.md'), 'utf8');

assert.equal(resolveCandidateConfig({}).port, 4322, 'default UI Candidate port must stay 4322');
assert.throws(
  () => resolveCandidateConfig({ KIANOS_CANDIDATE_PORT: String(STABLE_CURRENT_PORT) }),
  /KIANOS_CANDIDATE_MUST_NOT_USE_STABLE_PORT_4321/
);
assert.equal(packageJson.scripts?.['candidate:serve'], 'node scripts/kianos-candidate-runtime.mjs');
assert.match(agents, /npm run candidate:serve/);
assert.match(agents, /127\.0\.0\.1:4322/);
assert.ok(
  agents.includes('http://127.0.0.1:' + STABLE_CURRENT_PORT + '/ Stable'),
  'UI entry instructions must name Stable without hardcoding production port in test source'
);
assert.match(websiteCurrent, /UI iteration \/ Human Gate preview/);
assert.match(websiteCurrent, /kianos-candidate-runtime\.mjs/);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function canListen(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.listen(port, '127.0.0.1', () => {
      server.close(() => resolve(true));
    });
  });
}

async function nextCandidatePort() {
  for (const port of [4322, 4323, 4324, 4325]) {
    if (await canListen(port)) return port;
  }
  throw new Error('FAST_LANE_WORKFLOW_NO_CANDIDATE_PORT');
}

async function waitForPort(port, child, timeoutMs = 12000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode != null) throw new Error('FAST_LANE_CANDIDATE_EXITED_EARLY');
    const open = await new Promise((resolve) => {
      const socket = net.createConnection({ host: '127.0.0.1', port });
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
    if (open) return;
    await sleep(100);
  }
  throw new Error('FAST_LANE_CANDIDATE_START_TIMEOUT');
}

async function fetchText(url, timeout = 30000) {
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(timeout) });
  assert.equal(response.ok, true, 'request failed: ' + url + ' -> ' + response.status);
  return await response.text();
}

async function waitForBody(url, predicate, timeoutMs = 12000) {
  const deadline = Date.now() + timeoutMs;
  let last = '';
  while (Date.now() < deadline) {
    try {
      last = await fetchText(url, 5000);
      if (predicate(last)) return last;
    } catch {}
    await sleep(150);
  }
  throw new Error('FAST_LANE_WORKFLOW_BODY_TIMEOUT:' + last.slice(0, 200));
}

async function waitForCandidateMetrics(readLog, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const log = readLog();
    const line = log.split('\n').find((row) => row.includes('[KianOS Candidate] METRICS '));
    if (line) {
      const payload = line.slice(line.indexOf('[KianOS Candidate] METRICS ') + '[KianOS Candidate] METRICS '.length);
      return JSON.parse(payload);
    }
    await sleep(50);
  }
  throw new Error('FAST_LANE_CANDIDATE_METRICS_TIMEOUT');
}

let candidate = null;
let candidateLog = '';

try {
  const candidatePort = await nextCandidatePort();
  const candidateStartedAt = Date.now();
  candidate = spawn(process.execPath, ['scripts/kianos-candidate-runtime.mjs'], {
    cwd: webRoot,
    env: {
      ...process.env,
      KIANOS_CANDIDATE_OPEN: '0',
      KIANOS_CANDIDATE_PORT: String(candidatePort)
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32'
  });
  candidate.stdout?.on('data', (chunk) => { candidateLog += chunk.toString(); });
  candidate.stderr?.on('data', (chunk) => { candidateLog += chunk.toString(); });

  await waitForPort(candidatePort, candidate);
  const candidateStartupMs = Date.now() - candidateStartedAt;
  const candidateMetrics = await waitForCandidateMetrics(() => candidateLog);
  const candidateUrl = 'http://127.0.0.1:' + candidatePort + '/steward/';
  const before = await fetchText(candidateUrl);
  assert.ok(before.includes('今天怎么过'), 'Candidate did not render representative Steward surface');
  assert.equal(before.includes(marker), false, 'Candidate started with stale workflow marker');

  const changed = original.replace(sourceNeedle, '<h1>今天怎么过 · ' + marker + '</h1>');
  const changedAt = Date.now();
  fs.writeFileSync(stewardPath, changed, 'utf8');
  await waitForBody(candidateUrl, (body) => body.includes(marker), 15000);
  const candidateRefreshMs = Date.now() - changedAt;

  const revertAt = Date.now();
  fs.writeFileSync(stewardPath, original, 'utf8');
  await waitForBody(candidateUrl, (body) => body.includes('今天怎么过') && !body.includes(marker), 15000);
  const candidateRevertMs = Date.now() - revertAt;

  console.log(JSON.stringify({
    status: 'PASS',
    schema: 'kianos.website.fast_lane_workflow.v1',
    default_candidate_port: 4322,
    exercised_candidate_port: candidatePort,
    stable_lane: 'not_invoked',
    stable_port_guarded: STABLE_CURRENT_PORT !== candidatePort,
    candidate_startup_ms: candidateStartupMs,
    candidate_runtime_startup_ms: candidateMetrics.startup_ms,
    candidate_dependency_ms: candidateMetrics.dependency_ms,
    candidate_dependency_mode: candidateMetrics.dependency_mode,
    candidate_dependency_verification: candidateMetrics.dependency_verification,
    candidate_refresh_ms: candidateRefreshMs,
    candidate_revert_ms: candidateRevertMs,
    candidate_process_reused: true,
    managed_current_rebuild_triggered: false,
    representative_surface: 'steward'
  }, null, 2));
} catch (error) {
  if (candidateLog) console.error(candidateLog.slice(-5000));
  throw error;
} finally {
  try { fs.writeFileSync(stewardPath, original, 'utf8'); } catch {}
  if (candidate?.pid) {
    try { await terminateProcessTree(candidate.pid, { graceMs: 1000 }); } catch {}
  }
}
