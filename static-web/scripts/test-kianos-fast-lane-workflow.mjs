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
const xizongContentPath = path.join(repoRoot, 'content/xizong/knowledge/systems/a1-circulation/blocks/Block1_正常机械循环_学习阅读版_v7_最终执行版.md');
const politicsContentPath = path.join(repoRoot, 'content/politics/learning/marxism/ch00.json');
const englishContentPath = path.join(repoRoot, 'content/english/modules/translation/learning.md');
const marker = 'FAST-LANE-WORKFLOW-PROBE';
const xizongMarker = 'FAST-LANE-XIZONG-CONTENT-PROBE';
const politicsMarker = 'FAST-LANE-POLITICS-CONTENT-PROBE';
const englishMarker = 'FAST-LANE-ENGLISH-CONTENT-PROBE';
const original = fs.readFileSync(stewardPath, 'utf8');
const xizongOriginal = fs.readFileSync(xizongContentPath, 'utf8');
const politicsOriginal = fs.readFileSync(politicsContentPath, 'utf8');
const englishOriginal = fs.readFileSync(englishContentPath, 'utf8');
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
  assert.equal(xizongBefore.includes(xizongMarker), false, 'Candidate started with stale Xizong marker');
  const xizongChangedAt = Date.now();
  fs.writeFileSync(xizongContentPath, xizongOriginal.replace(xizongSourceNeedle, xizongSourceNeedle + xizongMarker + ' '), 'utf8');
  await waitForBody(xizongUrl, (body) => body.includes(xizongMarker), 15000);
  const xizongContentRefreshMs = Date.now() - xizongChangedAt;
  fs.writeFileSync(xizongContentPath, xizongOriginal, 'utf8');
  await waitForBody(xizongUrl, (body) => !body.includes(xizongMarker), 15000);

  const politicsUrl = 'http://127.0.0.1:' + candidatePort + '/politics/marxism/ch00/';
  const politicsObject = JSON.parse(politicsOriginal);
  politicsObject.unit_projections[0].learning_semantics.problem.text += ' ' + politicsMarker;
  const politicsChangedAt = Date.now();
  fs.writeFileSync(politicsContentPath, JSON.stringify(politicsObject, null, 2) + '\n', 'utf8');
  await waitForBody(politicsUrl, (body) => body.includes(politicsMarker), 15000);
  const politicsContentRefreshMs = Date.now() - politicsChangedAt;
  fs.writeFileSync(politicsContentPath, politicsOriginal, 'utf8');
  await waitForBody(politicsUrl, (body) => !body.includes(politicsMarker), 15000);

  const englishUrl = 'http://127.0.0.1:' + candidatePort + '/translation-learn/';
  const englishChangedAt = Date.now();
  fs.writeFileSync(englishContentPath, englishMarker + '\n\n' + englishOriginal, 'utf8');
  await waitForBody(englishUrl, (body) => body.includes(englishMarker), 15000);
  const englishContentRefreshMs = Date.now() - englishChangedAt;
  fs.writeFileSync(englishContentPath, englishOriginal, 'utf8');
  await waitForBody(englishUrl, (body) => !body.includes(englishMarker), 15000);

  console.log(JSON.stringify({
    status: 'PASS',
    schema: 'kianos.website.fast_lane_workflow.v1',
    default_candidate_port: 4322,
    exercised_candidate_port: candidatePort,
    stable_lane: 'not_invoked',
    stable_port_guarded: STABLE_CURRENT_PORT !== candidatePort,
    candidate_refresh_ms: candidateRefreshMs,
    xizong_content_refresh_ms: xizongContentRefreshMs,
    politics_content_refresh_ms: politicsContentRefreshMs,
    english_content_refresh_ms: englishContentRefreshMs,
    managed_current_rebuild_triggered: false,
    representative_surface: 'steward',
    representative_canonical_content: ['xizong/circulation/b01', 'politics/marxism/ch00', 'english/translation-learning']
  }, null, 2));
} catch (error) {
  if (candidateLog) console.error(candidateLog.slice(-5000));
  throw error;
} finally {
  try { fs.writeFileSync(stewardPath, original, 'utf8'); } catch {}
  try { fs.writeFileSync(xizongContentPath, xizongOriginal, 'utf8'); } catch {}
  try { fs.writeFileSync(politicsContentPath, politicsOriginal, 'utf8'); } catch {}
  try { fs.writeFileSync(englishContentPath, englishOriginal, 'utf8'); } catch {}
  if (candidate?.pid) {
    try { await terminateProcessTree(candidate.pid, { graceMs: 1000 }); } catch {}
  }
}
