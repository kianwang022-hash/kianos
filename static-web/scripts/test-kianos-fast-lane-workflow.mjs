#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { resolveCandidateConfig, STABLE_CURRENT_PORT } from './kianos-candidate-runtime.mjs';
import { terminateProcessTree } from './currentRelease.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(webRoot, '..');
const stewardPath = path.join(webRoot, 'src/pages/steward/index.astro');
const xizongContentPath = path.join(repoRoot, 'content/xizong/knowledge/systems/a1-circulation/blocks/Block1_正常机械循环_学习阅读版_v7_最终执行版.md');
const marker = 'FAST-LANE-WORKFLOW-PROBE';
const contentMarker = 'FAST-LANE-CANONICAL-CONTENT-PROBE';
const original = fs.readFileSync(stewardPath, 'utf8');
const xizongOriginal = fs.readFileSync(xizongContentPath, 'utf8');
const sourceNeedle = '<h1>今天怎么过</h1>';
const xizongSourceNeedle = '> **中心问题**：';

assert.ok(original.includes(sourceNeedle), 'representative Steward UI owner changed unexpectedly');
assert.ok(xizongOriginal.includes(xizongSourceNeedle), 'representative Xizong canonical Content owner changed unexpectedly');

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
assert.match(agents, /learner-facing Website BUILD as well as UI work/);
assert.match(agents, /existing local checkout \+ Candidate for iterative real-consumer proof/);
assert.ok(
  agents.includes('http://127.0.0.1:' + STABLE_CURRENT_PORT + '/ Stable'),
  'Website Fast Lane entry must name Stable without hardcoding production port in test source'
);
assert.match(websiteCurrent, /Website iteration \/ real-consumer preview/);
assert.match(websiteCurrent, /exact Content \/ Product \/ Visual \/ Runtime owner/);
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

async function waitForCandidateReady(port, child, getLog, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  const marker = `[KianOS Candidate] READY http://127.0.0.1:${port}/`;
  while (Date.now() < deadline) {
    const log = getLog();
    if (log.includes(marker)) return;
    if (child.exitCode != null) {
      throw new Error('FAST_LANE_CANDIDATE_EXITED_BEFORE_READY:' + log.slice(-1200));
    }
    await sleep(50);
  }
  throw new Error('FAST_LANE_CANDIDATE_READY_TIMEOUT:' + getLog().slice(-1200));
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

let candidate = null;
let candidateLog = '';

try {
  const candidatePort = await nextCandidatePort();
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
  await waitForCandidateReady(candidatePort, candidate, () => candidateLog);
  const candidateUrl = 'http://127.0.0.1:' + candidatePort + '/steward/';
  const before = await fetchText(candidateUrl);
  assert.ok(before.includes('今天怎么过'), 'Candidate did not render representative Steward surface');
  assert.equal(before.includes(marker), false, 'Candidate started with stale workflow marker');

  const changed = original.replace(sourceNeedle, '<h1>今天怎么过 · ' + marker + '</h1>');
  const changedAt = Date.now();
  fs.writeFileSync(stewardPath, changed, 'utf8');
  await waitForBody(candidateUrl, (body) => body.includes(marker), 15000);
  const candidateRefreshMs = Date.now() - changedAt;

  fs.writeFileSync(stewardPath, original, 'utf8');
  await waitForBody(candidateUrl, (body) => body.includes('今天怎么过') && !body.includes(marker), 15000);

  const xizongUrl = 'http://127.0.0.1:' + candidatePort + '/xizong/circulation/b01/';
  const xizongBefore = await fetchText(xizongUrl);
  assert.equal(xizongBefore.includes(contentMarker), false, 'Candidate started with stale canonical Content marker');
  const xizongChanged = xizongOriginal.replace(xizongSourceNeedle, xizongSourceNeedle + contentMarker + ' ');
  const xizongChangedAt = Date.now();
  fs.writeFileSync(xizongContentPath, xizongChanged, 'utf8');
  const stableProjectionProbe = spawnSync(process.execPath, ['--input-type=module', '-e', `
    const { loadXizongBlock } = await import('./src/lib/xizong.mjs');
    const { buildXizongProductionBlock } = await import('./src/lib/xizongProductionProjection.mjs');
    buildXizongProductionBlock(loadXizongBlock('circulation', 'b01'));
  `], {
    cwd: webRoot,
    env: { ...process.env, KIANOS_CANDIDATE_RUNTIME: '0', KIANOS_XIZONG_BUILD_CACHE: '0' },
    encoding: 'utf8'
  });
  assert.notEqual(stableProjectionProbe.status, 0, 'Stable-mode projection must reject dirty canonical source revision');
  assert.match(stableProjectionProbe.stderr + stableProjectionProbe.stdout, /CURRENT_XIZONG_PRODUCTION_PROJECTION_STRICT_SOURCE_STALE/);
  await waitForBody(xizongUrl, (body) => body.includes(contentMarker), 15000);
  const canonicalContentRefreshMs = Date.now() - xizongChangedAt;

  fs.writeFileSync(xizongContentPath, xizongOriginal, 'utf8');
  await waitForBody(xizongUrl, (body) => !body.includes(contentMarker), 15000);

  console.log(JSON.stringify({
    status: 'PASS',
    schema: 'kianos.website.fast_lane_workflow.v1',
    default_candidate_port: 4322,
    exercised_candidate_port: candidatePort,
    stable_lane: 'not_invoked',
    stable_port_guarded: STABLE_CURRENT_PORT !== candidatePort,
    candidate_refresh_ms: candidateRefreshMs,
    canonical_content_refresh_ms: canonicalContentRefreshMs,
    managed_current_rebuild_triggered: false,
    representative_surface: 'steward',
    representative_canonical_content: 'xizong/circulation/b01'
  }, null, 2));
} catch (error) {
  if (candidateLog) console.error(candidateLog.slice(-5000));
  throw error;
} finally {
  try { fs.writeFileSync(stewardPath, original, 'utf8'); } catch {}
  try { fs.writeFileSync(xizongContentPath, xizongOriginal, 'utf8'); } catch {}
  if (candidate?.pid) {
    try { await terminateProcessTree(candidate.pid, { graceMs: 1000 }); } catch {}
  }
}
