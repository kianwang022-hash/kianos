// Shared by bounded verification entrypoints. Never accepts a live base URL.
import assert from 'node:assert/strict';
import path from 'node:path';
import net from 'node:net';
import { isolatedCandidateEnv } from '../kianos-candidate-runtime.mjs';

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function isolatedTestEnv(root, parent = process.env) {
  const clean = Object.fromEntries(Object.entries(parent).filter(([name]) =>
    !name.startsWith('KIANOS_') && !['NODE_OPTIONS', 'NODE_PATH'].includes(name)));
  return { ...isolatedCandidateEnv(root, clean, 'synthetic-verification'),
    KIANOS_CURRENT_DIR: path.join(root, 'current'),
    KIANOS_CURRENT_STATUS_PATH: path.join(root, 'status.json') };
}

export async function reserveLoopbackPort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  assert.ok(port > 1024 && ![4321, 4322].includes(port));
  return port;
}

export async function waitFor(check, { code = 'CONDITION_TIMEOUT', timeout = 15000, detail = () => '', signal } = {}) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (signal?.aborted) throw Object.assign(new Error('INTERRUPTED'), { code: 'INTERRUPTED' });
    if (await check()) return;
    await sleep(100);
  }
  throw Object.assign(new Error(code + ': ' + detail()), { code });
}

export async function waitForLearnerWriter(page, { consumer, timeout = 15000 } = {}) {
  await page.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active', null, { timeout });
  // Writer readiness does not establish that a consumer has rendered its result.
  if (consumer) await page.locator(consumer).waitFor({ state: 'visible', timeout });
}

export async function stopOwnedProcess(child, { processGroup = false } = {}) {
  if (!child?.pid) return;
  if (processGroup) {
    // The caller created this detached child, so its PID is the owned PGID.
    // A reaped group leader says nothing about surviving descendants.
    const signalGroup = signal => {
      try { process.kill(-child.pid, signal); return true; }
      catch (error) { if (error.code === 'ESRCH') return false; throw error; }
    };
    const groupExited = async timeout => {
      const deadline = Date.now() + timeout;
      while (signalGroup(0)) {
        if (Date.now() >= deadline) return false;
        await sleep(25);
      }
      return true;
    };
    if (!signalGroup('SIGTERM') || await groupExited(2000)) return;
    signalGroup('SIGKILL');
    assert.ok(await groupExited(1000), 'owned process group did not stop');
    return;
  }
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise(resolve => child.once('exit', resolve));
  const kill = signal => {
    try { child.kill(signal); }
    catch (error) { if (error.code !== 'ESRCH') throw error; }
  };
  kill('SIGTERM');
  await Promise.race([exited, sleep(2000)]);
  if (child.exitCode === null && child.signalCode === null) {
    kill('SIGKILL'); await Promise.race([exited, sleep(1000)]);
  }
  assert.ok(child.exitCode !== null || child.signalCode !== null, 'owned process did not stop');
}
