import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { acquireDeliveryLock, isProcessAlive } from './currentRelease.mjs';

export const DEFAULT_WEBSITE_HEAVY_WAIT_MS = 120_000;
export const DEFAULT_WEBSITE_HEAVY_STALE_MS = 120_000;

export function resolveWebsiteHeavyLockPath(env = process.env) {
  const configured = String(env.KIANOS_WEBSITE_HEAVY_LOCK || '').trim();
  return configured
    ? path.resolve(configured)
    : path.join(os.homedir(), '.kianos-runtime', 'website-heavy.lock');
}

export function resolveWebsiteHeavyWaitMs(env = process.env) {
  const configured = Number(env.KIANOS_WEBSITE_HEAVY_WAIT_MS);
  return Number.isFinite(configured) && configured >= 0
    ? configured
    : DEFAULT_WEBSITE_HEAVY_WAIT_MS;
}

export function resolveWebsiteHeavyStaleMs(env = process.env) {
  const configured = Number(env.KIANOS_WEBSITE_HEAVY_STALE_MS);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_WEBSITE_HEAVY_STALE_MS;
}

function currentOwnerPath(lockPath) {
  const held = path.join(lockPath, 'held');
  let names = [];
  try { names = fs.readdirSync(held); } catch {}
  if (names.length !== 1) return null;
  return path.join(held, names[0]);
}

function readOwner(ownerPath) {
  if (!ownerPath) return null;
  try { return JSON.parse(fs.readFileSync(ownerPath, 'utf8')); } catch { return null; }
}

export function inspectWebsiteHeavyLease(env = process.env) {
  const lockPath = resolveWebsiteHeavyLockPath(env);
  const ownerPath = currentOwnerPath(lockPath);
  if (!ownerPath) return { state: 'idle', lock_path: lockPath, owner: null };
  const owner = readOwner(ownerPath);
  const pid = Number(owner?.pid);
  const live = Number.isInteger(pid) && pid > 0 ? isProcessAlive(pid) : null;
  return {
    state: live === false ? 'stale' : 'held',
    lock_path: lockPath,
    owner: owner ? { ...owner, live } : { live: null }
  };
}

export async function acquireWebsiteHeavyLease({
  label = 'website-heavy-work',
  env = process.env,
  timeoutMs = resolveWebsiteHeavyWaitMs(env),
  staleMs = resolveWebsiteHeavyStaleMs(env)
} = {}) {
  const lockPath = resolveWebsiteHeavyLockPath(env);
  let releaseRaw = null;
  try {
    releaseRaw = await acquireDeliveryLock(lockPath, { timeoutMs, staleMs });
  } catch (error) {
    if (String(error?.message || error).includes('CURRENT_DELIVERY_LOCK_TIMEOUT')) {
      const status = inspectWebsiteHeavyLease(env);
      const holder = status?.owner?.label || status?.owner?.pid || 'unknown';
      throw new Error(`KIANOS_WEBSITE_HEAVY_BUSY:${label}:holder=${holder}`);
    }
    throw error;
  }

  const ownerPath = currentOwnerPath(lockPath);
  if (!ownerPath) {
    releaseRaw();
    throw new Error('KIANOS_WEBSITE_HEAVY_OWNER_MISSING');
  }

  const initial = readOwner(ownerPath) || {};
  let released = false;

  const updateOwner = (patch = {}) => {
    if (released) return;
    const current = readOwner(ownerPath);
    if (!current || current.token !== initial.token) {
      throw new Error('KIANOS_WEBSITE_HEAVY_OWNER_CHANGED');
    }
    fs.writeFileSync(ownerPath, JSON.stringify({
      ...current,
      kind: 'website-heavy',
      label,
      wrapper_pid: process.pid,
      cwd: process.cwd(),
      ...patch
    }));
  };

  updateOwner();

  return {
    lockPath,
    ownerPath,
    updateOwner,
    release() {
      if (released) return;
      released = true;
      releaseRaw();
    }
  };
}
