#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { isolatedTestEnv, stopOwnedProcess, waitFor } from './test-support/isolated-runtime.mjs';

const signal = (pid, value) => {
  try { process.kill(pid, value); return true; }
  catch (error) { if (error.code === 'ESRCH') return false; throw error; }
};
const descendantSource = `
process.on('SIGTERM', () => {});
setInterval(() => {}, 1000);
process.send('ready');
`;
const failures = [];
for (const mode of ['leader-exited', 'leader-exits-on-term', 'signal-error']) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-owned-group-'));
  const leader = spawn(process.execPath, ['--input-type=module', '-e', `
import { spawn } from 'node:child_process';
process.on('SIGTERM', () => process.exit(0));
const child = spawn(process.execPath, ['-e', ${JSON.stringify(descendantSource)}], {
  stdio: ['ignore', 'ignore', 'ignore', 'ipc']
});
child.once('message', () => process.send({ descendant: child.pid }, () => {
  if (${JSON.stringify(mode)} === 'leader-exited') process.exit(0);
}));
`], { detached: true, env: isolatedTestEnv(root), stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
  let log = '';
  leader.stderr.on('data', chunk => { log += chunk; });
  try {
    const [{ descendant }] = await once(leader, 'message', { signal: AbortSignal.timeout(5000) });
    console.log('OWNED_GROUP_FIXTURE ' + JSON.stringify({ mode, group: leader.pid, descendant, root }));
    if (mode === 'leader-exited') await waitFor(() => leader.exitCode === 0, { timeout: 5000 });
    assert.equal(signal(-leader.pid, 0), true, 'fixture group must exist');
    assert.equal(signal(descendant, 0), true, 'fixture descendant must be running');
    if (mode === 'signal-error') {
      const originalKill = process.kill;
      const injected = Object.assign(new Error('synthetic owned-group probe denial'), { code: 'EPERM' });
      process.kill = (pid, value) => {
        if (pid === -leader.pid) throw injected;
        return originalKill(pid, value);
      };
      try { await assert.rejects(stopOwnedProcess(leader, { processGroup: true }), error => error === injected); }
      finally { process.kill = originalKill; }
      console.log('OWNED_GROUP_ERROR PASS: synthetic EPERM propagates unchanged');
    } else {
      await stopOwnedProcess(leader, { processGroup: true });
      assert.equal(signal(-leader.pid, 0), false, 'OWNED_GROUP_MUST_BE_GONE:' + mode);
      assert.equal(signal(descendant, 0), false, 'OWNED_DESCENDANT_MUST_BE_GONE:' + mode);
      assert.equal(leader.exitCode, 0, 'fixture leader exits normally while descendant ignores TERM');
      console.log('OWNED_GROUP_CLEANUP PASS: ' + JSON.stringify({ mode, leaderExitCode: leader.exitCode, groupGone: true, descendantGone: true }));
    }
  } catch (error) {
    failures.push(error);
    console.error('OWNED_GROUP_CLEANUP FAIL: ' + mode + ': ' + error.message + (log ? '\n' + log : ''));
  } finally {
    // Independent emergency cleanup touches only this fixture's detached group.
    // It must also work when replaying the previous, defective stop helper.
    if (leader.pid) {
      signal(-leader.pid, 'SIGKILL');
      await waitFor(() => !signal(-leader.pid, 0), { code: 'FIXTURE_GROUP_CLEANUP_TIMEOUT', timeout: 5000 });
    }
    fs.rmSync(root, { recursive: true, force: true });
  }
}
assert.equal(failures.length, 0, failures.map(error => error.message).join('\n'));
