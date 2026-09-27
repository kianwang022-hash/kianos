#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { acquireWebsiteHeavyLease } from './websiteHeavyWork.mjs';
import { terminateProcessTree } from './currentRelease.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(webRoot, '..');
const markerPath = path.join(repoRoot, '.git', 'kianos-current-mirror');

function outDirFromArgs(args) {
  for (let i = 0; i < args.length; i += 1) {
    const arg = String(args[i] || '');
    if (arg === '--outDir') return args[i + 1] ? String(args[i + 1]) : '';
    if (arg.startsWith('--outDir=')) return arg.slice('--outDir='.length);
  }
  return '';
}

export function canonicalizePath(target) {
  const absolute = path.resolve(target);
  const parsed = path.parse(absolute);
  let resolved = parsed.root;
  const pending = absolute.slice(parsed.root.length).split(path.sep).filter(Boolean);
  let symlinkHops = 0;

  while (pending.length) {
    const segment = pending.shift();
    const candidate = path.join(resolved, segment);
    let stat;
    try {
      stat = fs.lstatSync(candidate);
    } catch (error) {
      if (error?.code === 'ENOENT') {
        return path.resolve(resolved, segment, ...pending);
      }
      throw error;
    }

    if (stat.isSymbolicLink()) {
      symlinkHops += 1;
      if (symlinkHops > 64) throw new Error('CURRENT_PATH_SYMLINK_LOOP');
      const linkTarget = path.resolve(path.dirname(candidate), fs.readlinkSync(candidate));
      const linkParsed = path.parse(linkTarget);
      resolved = linkParsed.root;
      pending.unshift(...linkTarget.slice(linkParsed.root.length).split(path.sep).filter(Boolean));
      continue;
    }

    resolved = fs.realpathSync(candidate);
  }

  return path.resolve(resolved);
}

function flipAsciiCase(value) {
  const chars = [...String(value)];
  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i];
    if (ch >= 'a' && ch <= 'z') {
      chars[i] = ch.toUpperCase();
      return chars.join('');
    }
    if (ch >= 'A' && ch <= 'Z') {
      chars[i] = ch.toLowerCase();
      return chars.join('');
    }
  }
  return '';
}

function isCaseInsensitiveFilesystem(existingPath) {
  let current = path.resolve(existingPath);
  while (true) {
    try {
      const currentStat = fs.statSync(current);
      const base = path.basename(current);
      const alternateBase = flipAsciiCase(base);
      if (alternateBase && alternateBase !== base) {
        const alternate = path.join(path.dirname(current), alternateBase);
        try {
          const alternateStat = fs.statSync(alternate);
          return currentStat.dev === alternateStat.dev && currentStat.ino === alternateStat.ino;
        } catch {
          return false;
        }
      }
    } catch {}
    const parent = path.dirname(current);
    if (parent === current) return process.platform === 'win32';
    current = parent;
  }
}

function isSameOrDescendant(target, root, caseInsensitive) {
  const normalize = (value) => {
    const resolved = path.resolve(value);
    return caseInsensitive ? resolved.toLowerCase() : resolved;
  };
  const normalizedTarget = normalize(target);
  const normalizedRoot = normalize(root);
  return normalizedTarget === normalizedRoot
    || normalizedTarget.startsWith(`${normalizedRoot}${path.sep}`);
}

export function resolveSafeAstroBuildArgs(args, {
  managedCurrent = fs.existsSync(markerPath),
  currentWebRoot = webRoot
} = {}) {
  const next = [...args];
  const configuredOutDir = outDirFromArgs(next);
  if (!managedCurrent) return { args: next, redirected: false, outDir: configuredOutDir || null };

  const liveDist = canonicalizePath(path.join(currentWebRoot, 'dist'));
  const caseInsensitive = isCaseInsensitiveFilesystem(currentWebRoot);
  if (configuredOutDir) {
    const resolved = path.resolve(currentWebRoot, configuredOutDir);
    const canonicalResolved = canonicalizePath(resolved);
    if (isSameOrDescendant(canonicalResolved, liveDist, caseInsensitive)) {
      throw new Error('CURRENT_LIVE_DIST_BUILD_FORBIDDEN: use Current sync or a non-live --outDir');
    }
    return { args: next, redirected: false, outDir: resolved };
  }

  const safeOutDir = path.join(currentWebRoot, '.qa', 'astro-build');
  const canonicalSafeOutDir = canonicalizePath(safeOutDir);
  if (isSameOrDescendant(canonicalSafeOutDir, liveDist, caseInsensitive)) {
    throw new Error('CURRENT_LIVE_DIST_BUILD_FORBIDDEN: managed Current QA output resolves inside the live served release');
  }
  fs.rmSync(safeOutDir, { recursive: true, force: true });
  next.push('--outDir', safeOutDir);
  return { args: next, redirected: true, outDir: safeOutDir };
}

async function main() {
  const plan = resolveSafeAstroBuildArgs(process.argv.slice(2));
  if (plan.redirected) {
    console.log('[KianOS] managed Current mirror: redirecting local Astro build to ' + plan.outDir);
  }

  const lease = await acquireWebsiteHeavyLease({
    label: 'astro-build',
    timeoutMs: Number(process.env.KIANOS_WEBSITE_BUILD_WAIT_MS || 600000)
  });
  const astroBin = path.join(webRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'astro.cmd' : 'astro');
  let child = null;
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    if (child?.pid) void terminateProcessTree(child.pid, { graceMs: 1000 }).catch(() => {});
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);

  try {
    child = spawn(astroBin, ['build', ...plan.args], {
      cwd: webRoot,
      env: { ...process.env, KIANOS_XIZONG_BUILD_CACHE: '1' },
      stdio: 'inherit',
      shell: process.platform === 'win32',
      detached: process.platform !== 'win32'
    });
    lease.updateOwner({
      pid: child.pid,
      command: 'astro build',
      out_dir: plan.outDir || null
    });
    const code = await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', (exitCode) => resolve(exitCode ?? 1));
    });
    process.exitCode = code;
  } finally {
    process.removeListener('SIGINT', stop);
    process.removeListener('SIGTERM', stop);
    if (child?.pid && child.exitCode == null) {
      try { await terminateProcessTree(child.pid, { graceMs: 1000 }); } catch {}
    }
    lease.release();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
