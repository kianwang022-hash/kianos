#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';
import { practiceReady } from '../src/lib/politicsPracticeView.mjs';

const PORT = Number(process.env.KIANOS_STATIC_RUNTIME_TEST_PORT || 4491);
const BASE = `http://127.0.0.1:${PORT}`;
const webRoot = process.cwd();
const astroBin = path.join(webRoot, 'node_modules', '.bin', 'astro');
const distRoot = path.join(webRoot, 'dist');
const budgetMs = Number(process.env.KIANOS_STATIC_RUNTIME_WARM_BUDGET_MS || 250);
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-static-runtime-'));
const privateDir = path.join(scratch, 'learner-state');
const controlDir = path.join(scratch, 'control');
fs.mkdirSync(privateDir, { recursive: true, mode: 0o700 });
fs.mkdirSync(controlDir, { recursive: true, mode: 0o700 });

assert.equal(fs.existsSync(path.join(distRoot, 'index.html')), true, 'STATIC_RUNTIME_DIST_MISSING');
assert.equal(fs.existsSync(astroBin), true, 'STATIC_RUNTIME_ASTRO_MISSING');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let output = '';
const server = spawn(astroBin, ['preview', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: webRoot,
  env: {
    ...process.env,
    KIANOS_PRIVATE_DIR: privateDir,
    KIANOS_CONTROL_DIR: controlDir,
    KIANOS_CONTROL_ENABLED: '0',
    KIANOS_PACKET_RELAY_ENABLED: '0'
  },
  stdio: ['ignore', 'pipe', 'pipe']
});
server.stdout?.on('data', (chunk) => { output += chunk.toString(); });
server.stderr?.on('data', (chunk) => { output += chunk.toString(); });

async function waitReady() {
  for (let i = 0; i < 120; i += 1) {
    if (server.exitCode != null) throw new Error('STATIC_RUNTIME_PREVIEW_EXITED:' + output.slice(-3000));
    try {
      const response = await fetch(BASE + '/', { cache: 'no-store' });
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('STATIC_RUNTIME_PREVIEW_NOT_READY:' + output.slice(-3000));
}

async function timed(route) {
  const started = performance.now();
  const response = await fetch(BASE + route, { cache: 'no-store', redirect: 'follow' });
  const body = await response.arrayBuffer();
  return {
    status: response.status,
    ms: performance.now() - started,
    bytes: body.byteLength,
    text: new TextDecoder().decode(body)
  };
}

async function measure(route, count = 7) {
  const rows = [];
  for (let i = 0; i < count; i += 1) rows.push(await timed(route));
  const warm = rows.slice(1);
  return {
    rows,
    warmMax: Math.max(...warm.map((row) => row.ms)),
    warmMean: warm.reduce((sum, row) => sum + row.ms, 0) / warm.length
  };
}

function assertWarm(label, metric) {
  assert.equal(metric.rows.every((row) => row.status === 200), true, `${label}_HTTP`);
  assert.ok(metric.warmMax < budgetMs, `${label}_WARM_TOO_SLOW:${metric.warmMax.toFixed(1)}ms>=${budgetMs}ms`);
}

try {
  await waitReady();

  const home = await measure('/');
  assertWarm('HOME', home);
  assert.match(home.rows[0].text, /学习工作台/);

  const politics = await measure('/politics/practice/');
  assertWarm('POLITICS_PRACTICE', politics);
  assert.match(politics.rows[0].text, /肖1000/);

  const catalog = buildPoliticsPracticeCatalogCurrent('/');
  const question = catalog.questions.find(practiceReady);
  assert.ok(question?.id, 'POLITICS_REVIEW_QUESTION_MISSING');
  const reviewRoute = `/politics/practice-review/${encodeURIComponent(question.id)}.json/`;
  const review = await measure(reviewRoute);
  assertWarm('POLITICS_REVIEW_JSON', review);
  const reviewPayload = JSON.parse(review.rows[0].text);
  assert.equal(reviewPayload.schema, 'kianos.politics.practice_review.v1');
  assert.equal(reviewPayload.id, question.id);

  const checkpoint = await timed('/__kianos-private/checkpoint');
  assert.equal(checkpoint.status, 404, 'PRIVATE_CHECKPOINT_PREVIEW_ROUTE_MISSING');
  assert.equal(JSON.parse(checkpoint.text).status, 'missing');

  const control = await timed('/__kianos-private/control/status');
  assert.equal(control.status, 200, 'PRIVATE_CONTROL_PREVIEW_ROUTE_MISSING');
  const controlPayload = JSON.parse(control.text);
  assert.equal(controlPayload.status, 'ready');
  assert.equal(controlPayload.relay?.state, 'disabled');

  console.log(
    'STATIC_CURRENT_RUNTIME PASS'
    + ` | home warm max=${home.warmMax.toFixed(1)}ms mean=${home.warmMean.toFixed(1)}ms`
    + ` | politics warm max=${politics.warmMax.toFixed(1)}ms mean=${politics.warmMean.toFixed(1)}ms`
    + ` | review warm max=${review.warmMax.toFixed(1)}ms mean=${review.warmMean.toFixed(1)}ms`
    + ` | budget=${budgetMs}ms`
  );
} finally {
  try { server.kill('SIGTERM'); } catch {}
  await Promise.race([
    new Promise((resolve) => server.once('exit', resolve)),
    sleep(1500)
  ]);
  fs.rmSync(scratch, { recursive: true, force: true });
}
