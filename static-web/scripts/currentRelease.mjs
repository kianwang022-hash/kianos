import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

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
      fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, started_at: new Date().toISOString() }));
      fs.closeSync(fd);
      return () => { try { fs.rmSync(lockPath, { force: true }); } catch {} };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let stale = false;
      try {
        const stat = fs.statSync(lockPath);
        stale = Date.now() - stat.mtimeMs > staleMs;
        if (!stale) {
          const owner = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
          if (owner.pid) {
            try { process.kill(owner.pid, 0); stale = false; } catch { stale = true; }
          }
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
  return new Promise((resolve, reject) => {
    const grouped = process.platform !== 'win32';
    const child = spawn(file, args, { cwd, env, stdio: 'inherit', detached: grouped });
    let timedOut = false;
    let timer = setTimeout(() => {
      timedOut = true;
      try {
        if (grouped) process.kill(-child.pid, 'SIGTERM');
        else child.kill('SIGTERM');
      } catch {}
      setTimeout(() => {
        try {
          if (grouped) process.kill(-child.pid, 'SIGKILL');
          else child.kill('SIGKILL');
        } catch {}
      }, 1000).unref();
    }, timeoutMs);
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('exit', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) reject(new Error(`${label} timed out after ${timeoutMs}ms`));
      else if (code === 0) resolve();
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
