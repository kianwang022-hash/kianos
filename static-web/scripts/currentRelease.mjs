import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function releasePaths(repoRoot) {
  const root = path.resolve(process.env.KIANOS_RELEASES_DIR || path.join(path.dirname(repoRoot), '.kianos-current-releases'));
  return {
    root,
    active: path.join(root, 'active'),
    previous: path.join(root, 'previous'),
    candidate: path.join(root, 'candidate'),
    release: (sha) => path.join(root, 'releases', String(sha)),
    lock: process.env.KIANOS_DELIVERY_LOCK || path.join(root, 'delivery.lock')
  };
}

export async function acquireDeliveryLock(lockPath, {
  timeoutMs = Number(process.env.KIANOS_DELIVERY_LOCK_TIMEOUT_MS || 15000),
  staleMs = Number(process.env.KIANOS_DELIVERY_LOCK_STALE_MS || 120000)
} = {}) {
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });
  const started = Date.now();
  while (true) {
    try {
      const fd = fs.openSync(lockPath, 'wx');
      const token = randomUUID();
      fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, token, started_at: new Date().toISOString() }));
      fs.closeSync(fd);
      return () => {
        try {
          const owner = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
          if (owner.token === token) fs.rmSync(lockPath, { force: true });
        } catch {}
      };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let stale = false;
      try {
        const stat = fs.statSync(lockPath);
        const owner = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
        if (owner.pid) {
          try {
            process.kill(owner.pid, 0);
            stale = false;
          } catch {
            stale = true;
          }
        } else {
          stale = Date.now() - stat.mtimeMs > staleMs;
        }
      } catch { stale = true; }
      if (stale) {
        try { fs.rmSync(lockPath, { force: true }); } catch {}
        continue;
      }
      if (Date.now() - started >= timeoutMs) throw new Error('CURRENT_DELIVERY_LOCK_TIMEOUT');
      await sleep(50);
    }
  }
}

export function runBounded(file, args, {
  cwd,
  env = process.env,
  timeoutMs = Number(process.env.KIANOS_SUBPROCESS_TIMEOUT_MS || 120000),
  label = file
} = {}) {
  const waitForGroupGone = async (pid, timeout = 1000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      try { process.kill(-pid, 0); } catch { return; }
      await sleep(25);
    }
    try { process.kill(-pid, 'SIGKILL'); } catch {}
    while (true) {
      try { process.kill(-pid, 0); } catch { return; }
      await sleep(25);
    }
  };
  return new Promise((resolve, reject) => {
    const grouped = process.platform !== 'win32';
    const child = spawn(file, args, { cwd, env, stdio: 'inherit', detached: grouped });
    let timedOut = false;
    let settled = false;
    const settleTimeout = () => {
      if (!settled) {
        settled = true;
        reject(new Error(`${label} timed out after ${timeoutMs}ms`));
      }
    };
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        if (grouped) process.kill(-child.pid, 'SIGTERM');
        else child.kill('SIGTERM');
      } catch {}
      void waitForGroupGone(child.pid).then(settleTimeout);
    }, timeoutMs);
    child.once('error', (error) => {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
    child.once('exit', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) return;
      if (settled) return;
      settled = true;
      if (code === 0) resolve();
      else reject(new Error(`${label} exited ${code ?? signal}`));
    });
  });
}

export function removeReleaseWorktree(gitBin, repoRoot, worktree) {
  try {
    const result = spawn(gitBin, ['-C', repoRoot, 'worktree', 'remove', '--force', worktree], {
      stdio: 'ignore'
    });
    result.unref();
  } catch {}
}
