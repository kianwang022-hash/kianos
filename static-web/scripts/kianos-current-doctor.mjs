#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const home = os.homedir();
const mirrorDir = process.env.KIANOS_CURRENT_DIR || path.join(home, 'KianOS-current');
const privateDir = process.env.KIANOS_PRIVATE_DIR || path.join(home, 'Library', 'Application Support', 'KianOS', 'learner-state');
const port = String(process.env.KIANOS_PORT || '4321');
const label = 'com.kianos.current-mirror';
const plist = path.join(home, 'Library', 'LaunchAgents', `${label}.plist`);
const base = `http://127.0.0.1:${port}`;
const marker = path.join(mirrorDir, '.git', 'kianos-current-mirror');

const rows = [];
let failed = false;

const record = (level, labelText, detail = '') => {
  rows.push({ level, label: labelText, detail });
  if (level === 'FAIL') failed = true;
};

async function command(file, args, options = {}) {
  const result = await execFileAsync(file, args, { maxBuffer: 16 * 1024 * 1024, ...options });
  return String(result.stdout || '').trim();
}

async function canRun(name) {
  try {
    const resolved = await command('/usr/bin/which', [name]);
    record('PASS', `${name} available`, resolved);
    return resolved;
  } catch {
    record('FAIL', `${name} available`, 'not found in PATH');
    return '';
  }
}

async function readCurrentStatus() {
  let last = null;
  for (let i = 0; i < 20; i += 1) {
    try {
      const response = await fetch(`${base}/__kianos-current.json?t=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) {
        last = await response.json();
        if (last?.state === 'synced') return last;
        if (last?.state === 'degraded') return last;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  return last;
}

console.log('KianOS Current Doctor');
console.log('=====================');

if (process.platform !== 'darwin') {
  record('FAIL', 'macOS runtime', `detected ${process.platform}`);
} else {
  record('PASS', 'macOS runtime', os.release());
}

const gitBin = await canRun('git');
await canRun('node');
await canRun('npm');

if (!fs.existsSync(mirrorDir)) {
  record('FAIL', 'Current mirror', `missing: ${mirrorDir}`);
} else if (!fs.existsSync(marker)) {
  record('FAIL', 'Current mirror marker', `missing: ${marker}`);
} else {
  record('PASS', 'Current mirror', mirrorDir);
}

if (!fs.existsSync(plist)) {
  record('FAIL', 'LaunchAgent', `missing: ${plist}`);
} else if (process.platform === 'darwin') {
  try {
    await command('/bin/launchctl', ['print', `gui/${process.getuid()}/${label}`]);
    record('PASS', 'LaunchAgent', label);
  } catch {
    record('FAIL', 'LaunchAgent', 'installed plist is not loaded');
  }
}

if (!fs.existsSync(privateDir)) {
  record('FAIL', 'Private learner-state directory', `missing: ${privateDir}`);
} else {
  const mode = fs.statSync(privateDir).mode & 0o777;
  if (mode === 0o700) record('PASS', 'Private learner-state directory', `${privateDir} · mode 700`);
  else record('FAIL', 'Private learner-state permissions', `${privateDir} · expected 700, got ${mode.toString(8)}`);
}

let localSha = '';
let remoteSha = '';
if (gitBin && fs.existsSync(marker)) {
  try {
    localSha = await command(gitBin, ['rev-parse', 'HEAD'], { cwd: mirrorDir });
    record('PASS', 'Current mirror commit', localSha.slice(0, 12));
  } catch (error) {
    record('FAIL', 'Current mirror commit', error?.message || String(error));
  }

  try {
    const raw = await command(gitBin, ['ls-remote', 'origin', 'refs/heads/main'], { cwd: mirrorDir });
    remoteSha = raw.split(/\s+/)[0] || '';
    if (!remoteSha) throw new Error('origin/main returned no SHA');
    if (localSha === remoteSha) record('PASS', 'GitHub main sync', remoteSha.slice(0, 12));
    else record('FAIL', 'GitHub main sync', `local ${localSha.slice(0, 12)} != main ${remoteSha.slice(0, 12)}`);
  } catch (error) {
    record('WARN', 'GitHub main reachability', error?.message || String(error));
  }
}

let siteOk = false;
try {
  const response = await fetch(`${base}/?t=${Date.now()}`, { cache: 'no-store' });
  siteOk = response.ok;
  if (siteOk) record('PASS', 'Learner site', base);
  else record('FAIL', 'Learner site', `HTTP ${response.status}`);
} catch {
  record('FAIL', 'Learner site', `not reachable at ${base}`);
}

const status = siteOk ? await readCurrentStatus() : null;
if (!status) {
  record('FAIL', 'Current sync status', 'status endpoint unavailable');
} else if (status.state !== 'synced') {
  record('FAIL', 'Current sync status', `state=${status.state}`);
} else if (localSha && status.sha !== localSha) {
  record('FAIL', 'Current sync status', `status SHA ${String(status.sha).slice(0, 12)} != mirror ${localSha.slice(0, 12)}`);
} else {
  record('PASS', 'Current sync status', `synced · ${String(status.sha || '').slice(0, 12)}`);
}

console.log('');
for (const row of rows) {
  const detail = row.detail ? ` — ${row.detail}` : '';
  console.log(`${row.level.padEnd(4)}  ${row.label}${detail}`);
}
console.log('');

if (failed) {
  console.error('NOT READY: run "npm run current:install" from the KianOS repository, then rerun "npm run current:doctor".');
  process.exit(1);
}

console.log(`READY: KianOS Current is ready for learner use at ${base}/`);
