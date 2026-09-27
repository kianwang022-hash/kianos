#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

import { inspectWebsiteHeavyLease } from './websiteHeavyWork.mjs';
import { isProcessAlive, terminateProcessTree } from './currentRelease.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-heavy-work-'));
const lock = path.join(root, 'heavy.lock');
const log = path.join(root, 'events.jsonl');
const worker = path.join(root, 'worker.mjs');
const env = {
  ...process.env,
  KIANOS_WEBSITE_HEAVY_LOCK: lock,
  KIANOS_WEBSITE_HEAVY_WAIT_MS: '5000',
  KIANOS_WEBSITE_HEAVY_STALE_MS: '500'
};

fs.writeFileSync(worker, `
import fs from 'node:fs';
const [id, log, wait] = process.argv.slice(2);
const append = (event) => fs.appendFileSync(log, JSON.stringify({ id, event, at: Date.now(), pid: process.pid }) + '\\n');
append('start');
await new Promise((resolve) => setTimeout(resolve, Number(wait)));
append('end');
`);

const webRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

const run = (id, wait = 250) => spawn(process.execPath, [
  'scripts/kianos-heavy-run.mjs',
  '--label', 'synthetic-' + id,
  '--wait-ms', '5000',
  '--',
  process.execPath, worker, id, log, String(wait)
], {
  cwd: webRoot,
  env,
  stdio: ['ignore', 'pipe', 'pipe']
});

async function waitForHeld(label, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const status = inspectWebsiteHeavyLease(env);
    if (status.state === 'held' && status.owner?.label === label) return status;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error('WEBSITE_HEAVY_TEST_LEASE_NOT_HELD:' + label);
}

const exit = (child) => new Promise((resolve, reject) => {
  let stdout = '';
  let stderr = '';
  child.stdout?.on('data', (chunk) => { stdout += chunk.toString(); });
  child.stderr?.on('data', (chunk) => { stderr += chunk.toString(); });
  child.once('error', reject);
  child.once('exit', (code) => resolve({ code, stdout, stderr }));
});

let unrelated = null;
let first = null;
let second = null;
try {
  unrelated = spawn(process.execPath, ['-e', 'setTimeout(()=>{},5000)'], {
    detached: process.platform !== 'win32',
    stdio: 'ignore'
  });

  first = run('A', 300);
  const held = await waitForHeld('synthetic-A');
  assert.equal(held.state, 'held');
  assert.equal(held.owner?.live, true);

  second = run('B', 180);
  const [a, b] = await Promise.all([exit(first), exit(second)]);
  assert.equal(a.code, 0, a.stderr);
  assert.equal(b.code, 0, b.stderr);

  const rows = fs.readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
  const byId = Object.groupBy(rows, (row) => row.id);
  for (const id of ['A', 'B']) {
    assert.equal(byId[id]?.length, 2, id + ' must start and end exactly once');
  }
  const interval = (id) => ({
    start: byId[id].find((row) => row.event === 'start').at,
    end: byId[id].find((row) => row.event === 'end').at
  });
  const ai = interval('A');
  const bi = interval('B');
  assert.equal(ai.end <= bi.start || bi.end <= ai.start, true, 'heavy jobs overlapped');

  assert.equal(isProcessAlive(unrelated.pid), true, 'lease arbitration must not kill unrelated work');
  assert.equal(inspectWebsiteHeavyLease(env).state, 'idle');

  console.log(JSON.stringify({
    status: 'PASS',
    schema: 'kianos.website.heavy_work.v1',
    serialized: true,
    unrelated_process_preserved: true,
    lock_path: lock
  }, null, 2));
} finally {
  const owned = inspectWebsiteHeavyLease(env);
  if (owned.owner?.pid && owned.owner?.live === true) {
    try { await terminateProcessTree(Number(owned.owner.pid), { graceMs: 200 }); } catch {}
  }
  for (const child of [first, second]) {
    if (child?.pid && child.exitCode == null) {
      try { child.kill('SIGTERM'); } catch {}
    }
  }
  if (unrelated?.pid) {
    try { await terminateProcessTree(unrelated.pid, { graceMs: 200 }); } catch {}
  }
  fs.rmSync(root, { recursive: true, force: true });
}
