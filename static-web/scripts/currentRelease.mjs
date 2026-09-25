import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function isProcessAlive(target, kill = process.kill) {
  if (!Number.isInteger(target) || target === 0) return false;
  try {
    kill(target, 0);
    return true;
  } catch (error) {
    if (error?.code === 'ESRCH') return false;
    // EPERM means the process/group exists but is inaccessible. Unknown probe
    // failures also fail safe as alive so delivery ownership is never stolen.
    return true;
  }
}

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

  const ensureLockRoot = () => {
    try {
      const stat = fs.lstatSync(lockPath);
      if (stat.isDirectory()) return true;
      if (!stat.isFile()) return false;

      // Migrate the legacy single-file lock only when its owner is dead (or an
      // ownerless/corrupt file is old enough). A live PID always wins over age.
      let owner = null;
      try { owner = JSON.parse(fs.readFileSync(lockPath, 'utf8')); } catch {}
      const pid = Number(owner?.pid);
      const validPid = Number.isInteger(pid) && pid > 0;
      const stale = validPid
        ? !isProcessAlive(pid)
        : Date.now() - stat.mtimeMs > staleMs;
      if (!stale) return false;
      try { fs.unlinkSync(lockPath); } catch {}
    } catch (error) {
      if (error?.code !== 'ENOENT') return false;
    }

    try { fs.mkdirSync(lockPath); } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
    }
    try { return fs.lstatSync(lockPath).isDirectory(); } catch { return false; }
  };

  const installLease = () => {
    if (!ensureLockRoot()) return null;
    const token = randomUUID();
    const held = path.join(lockPath, 'held');
    const prepared = path.join(lockPath, `.acquire-${process.pid}-${token}`);
    const ownerName = `${token}.json`;
    fs.mkdirSync(prepared);
    fs.writeFileSync(path.join(prepared, ownerName), JSON.stringify({
      pid: process.pid,
      token,
      started_at: new Date().toISOString()
    }));
    try {
      // Prepared is non-empty before this atomic rename. A contender therefore
      // cannot replace another owner's non-empty held directory.
      fs.renameSync(prepared, held);
    } catch (error) {
      fs.rmSync(prepared, { recursive: true, force: true });
      if (!['EEXIST', 'ENOTEMPTY'].includes(error?.code)) throw error;
      return null;
    }

    const ownerPath = path.join(held, ownerName);
    return () => {
      // Release only this lease's unique token. If stale recovery has already
      // installed a successor, that successor token keeps held non-empty and
      // the rmdir fails safely; no callback ever removes a successor lease.
      try { fs.unlinkSync(ownerPath); } catch {}
      try { fs.rmdirSync(held); } catch {}
    };
  };

  while (true) {
    const release = installLease();
    if (release) return release;

    if (ensureLockRoot()) {
      const held = path.join(lockPath, 'held');
      let heldStat = null;
      let ownerNames = [];
      try {
        heldStat = fs.statSync(held);
        ownerNames = fs.readdirSync(held);
      } catch {}

      if (ownerNames.length) {
        let liveOrUnknown = false;
        const staleOwnerPaths = [];
        for (const name of ownerNames) {
          const ownerPath = path.join(held, name);
          let ownerStat = null;
          let owner = null;
          try {
            ownerStat = fs.statSync(ownerPath);
            owner = JSON.parse(fs.readFileSync(ownerPath, 'utf8'));
          } catch {}
          const pid = Number(owner?.pid);
          if (Number.isInteger(pid) && pid > 0) {
            if (isProcessAlive(pid)) liveOrUnknown = true;
            else staleOwnerPaths.push(ownerPath);
          } else if (ownerStat && Date.now() - ownerStat.mtimeMs > staleMs) {
            staleOwnerPaths.push(ownerPath);
          } else {
            liveOrUnknown = true;
          }
        }
        if (!liveOrUnknown && staleOwnerPaths.length === ownerNames.length) {
          for (const ownerPath of staleOwnerPaths) {
            try { fs.unlinkSync(ownerPath); } catch {}
          }
          try { fs.rmdirSync(held); } catch {}
          continue;
        }
      } else if (heldStat && Date.now() - heldStat.mtimeMs > staleMs) {
        try { fs.rmdirSync(held); } catch {}
        continue;
      }
    }

    if (Date.now() - started >= timeoutMs) throw new Error('CURRENT_DELIVERY_LOCK_TIMEOUT');
    await sleep(50);
  }
}

export async function waitForProcessGroupGone(pid, timeout = 1000, kill = process.kill) {
  const target = -Math.abs(Number(pid));
  const deadline = Date.now() + Math.max(0, Number(timeout) || 0);
  while (isProcessAlive(target, kill) && Date.now() < deadline) await sleep(25);
  return !isProcessAlive(target, kill);
}

export async function terminateProcessTree(pid, { graceMs = 1000, kill = process.kill } = {}) {
  const numericPid = Number(pid);
  if (!Number.isInteger(numericPid) || numericPid <= 0) return;

  if (process.platform === 'win32') {
    try { kill(numericPid, 'SIGTERM'); } catch (error) { if (error?.code === 'ESRCH') return; }
    const deadline = Date.now() + graceMs;
    while (isProcessAlive(numericPid, kill) && Date.now() < deadline) await sleep(25);
    if (isProcessAlive(numericPid, kill)) {
      try { kill(numericPid, 'SIGKILL'); } catch (error) { if (error?.code === 'ESRCH') return; }
      while (isProcessAlive(numericPid, kill)) await sleep(25);
    }
    return;
  }

  const target = -numericPid;
  try { kill(target, 'SIGTERM'); } catch (error) { if (error?.code === 'ESRCH') return; }
  if (await waitForProcessGroupGone(numericPid, graceMs, kill)) return;
  try { kill(target, 'SIGKILL'); } catch (error) { if (error?.code === 'ESRCH') return; }
  // Never settle the caller while descendants remain observable. EPERM and
  // unknown probe errors are deliberately treated as alive above.
  while (isProcessAlive(target, kill)) await sleep(25);
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
    let settled = false;
    const timer = setTimeout(() => {
      timedOut = true;
      void terminateProcessTree(child.pid).then(() => {
        if (!settled) {
          settled = true;
          reject(new Error(`${label} timed out after ${timeoutMs}ms`));
        }
      });
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
      if (timedOut || settled) return;
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
