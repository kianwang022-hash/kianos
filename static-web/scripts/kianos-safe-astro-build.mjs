#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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

export function resolveSafeAstroBuildArgs(args, {
  managedCurrent = fs.existsSync(markerPath),
  currentWebRoot = webRoot
} = {}) {
  const next = [...args];
  const configuredOutDir = outDirFromArgs(next);
  if (!managedCurrent) return { args: next, redirected: false, outDir: configuredOutDir || null };

  const liveDist = path.resolve(currentWebRoot, 'dist');
  if (configuredOutDir) {
    const resolved = path.resolve(currentWebRoot, configuredOutDir);
    if (resolved === liveDist) {
      throw new Error('CURRENT_LIVE_DIST_BUILD_FORBIDDEN: use Current sync or a non-live --outDir');
    }
    return { args: next, redirected: false, outDir: resolved };
  }

  const safeOutDir = path.join(currentWebRoot, '.qa', 'astro-build');
  fs.rmSync(safeOutDir, { recursive: true, force: true });
  next.push('--outDir', safeOutDir);
  return { args: next, redirected: true, outDir: safeOutDir };
}

async function main() {
  const plan = resolveSafeAstroBuildArgs(process.argv.slice(2));
  if (plan.redirected) {
    console.log('[KianOS] managed Current mirror: redirecting local Astro build to ' + plan.outDir);
  }
  const astroBin = path.join(webRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'astro.cmd' : 'astro');
  const child = spawn(astroBin, ['build', ...plan.args], {
    cwd: webRoot,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  const code = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (exitCode) => resolve(exitCode ?? 1));
  });
  process.exit(code);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
