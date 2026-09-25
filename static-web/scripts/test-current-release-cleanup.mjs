#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runBounded } from './currentRelease.mjs';

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-release-cleanup-'));
const childPid = path.join(temp, 'child.pid');
try {
  await assert.rejects(
    runBounded(process.execPath, ['-e', `
      const fs = require('fs'), { spawn } = require('child_process');
      const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)']);
      fs.writeFileSync(${JSON.stringify(childPid)}, String(child.pid));
      setInterval(() => {}, 1000);
    `], { timeoutMs: 200, label: 'tree fixture' }),
    /timed out/
  );
  const pid = Number(fs.readFileSync(childPid, 'utf8'));
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.throws(() => process.kill(pid, 0), /ESRCH/, 'timed-out descendants must not survive');
  console.log('CURRENT_RELEASE_CLEANUP PASS: timed-out process group is reaped before rejection');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
