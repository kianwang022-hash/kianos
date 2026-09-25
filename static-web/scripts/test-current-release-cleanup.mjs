#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { isProcessAlive, runBounded, terminateProcessTree } from './currentRelease.mjs';

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-release-cleanup-'));
const childPid = path.join(temp, 'child.pid');
try {
  const startedAt = Date.now();
  await assert.rejects(
    runBounded(process.execPath, ['-e', `
      const fs = require('fs'), { spawn } = require('child_process');
      const child = spawn(process.execPath, ['-e', 'process.on("SIGTERM", () => {}); setInterval(() => {}, 1000)']);
      fs.writeFileSync(${JSON.stringify(childPid)}, String(child.pid));
      process.on('SIGTERM', () => process.exit(0));
      setInterval(() => {}, 1000);
    `], { timeoutMs: 200, label: 'tree fixture' }),
    /timed out/
  );
  const elapsed = Date.now() - startedAt;
  const pid = Number(fs.readFileSync(childPid, 'utf8'));
  assert.ok(elapsed >= 900, `timeout settled before grace cleanup: ${elapsed}ms`);
  assert.throws(() => process.kill(pid, 0), /ESRCH/, 'timed-out descendant must be dead before rejection');
  const eperm = () => { const error = new Error('permission denied'); error.code = 'EPERM'; throw error; };
  assert.equal(isProcessAlive(-pid, eperm), true, 'group EPERM must mean still alive');

  const cleanupStarted = Date.now();
  await assert.rejects(
    terminateProcessTree(424242, { graceMs: 50, kill: eperm }),
    /CURRENT_PROCESS_TREE_STILL_ALIVE/
  );
  const cleanupElapsed = Date.now() - cleanupStarted;
  assert.ok(cleanupElapsed >= 90, `final cleanup deadline returned too early: ${cleanupElapsed}ms`);
  assert.ok(cleanupElapsed < 500, `final cleanup outcome was not bounded: ${cleanupElapsed}ms`);

  console.log('CURRENT_RELEASE_CLEANUP PASS: timeout waits for real descendants and reports unkillable groups within a bounded deadline');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
