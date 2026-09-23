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
const mainRemoteRef = ['refs', 'heads', 'main'].join('/');

const rows = [];
let failed = false;
let learnerEvidenceReady = false;
const jsonOutput = process.argv.includes('--json');
const startedAt = new Date().toISOString();

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
  for (let i = 0; i < 30; i += 1) {
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

async function fetchJson(route) {
  try {
    const response = await fetch(`${base}${route}`, { cache: 'no-store' });
    let value = null;
    try { value = await response.json(); } catch {}
    return { ok: response.ok, status: response.status, value };
  } catch (error) {
    return { ok: false, status: 0, value: null, error: error?.message || String(error) };
  }
}

async function waitForRelayStatus(route) {
  let last = null;
  for (let i = 0; i < 30; i += 1) {
    last = await fetchJson(route);
    const state = last?.value?.relay?.state;
    if (last.status === 200 && state && state !== 'checking') return last;
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  return last;
}

async function waitForMirrorSha(gitBin, targetSha) {
  let current = '';
  for (let i = 0; i < 20; i += 1) {
    try {
      current = await command(gitBin, ['rev-parse', 'HEAD'], { cwd: mirrorDir });
      if (current === targetSha) return current;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return current;
}

if (!jsonOutput) {
  console.log('KianOS Current Doctor');
  console.log('=====================');
}

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
    const raw = await command(gitBin, ['ls-remote', 'origin', mainRemoteRef], { cwd: mirrorDir });
    remoteSha = raw.split(/\s+/)[0] || '';
    if (!remoteSha) throw new Error('origin/main returned no SHA');
    if (localSha !== remoteSha) {
      localSha = await waitForMirrorSha(gitBin, remoteSha);
    }
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

if (siteOk) {
  const checkpoint = await fetchJson('/__kianos-private/checkpoint');
  if (checkpoint.status === 200 && checkpoint.value?.status === 'ready') {
    record('PASS', 'Private checkpoint bridge', 'checkpoint available');
  } else if (checkpoint.status === 404 && checkpoint.value?.status === 'missing') {
    record('PASS', 'Private checkpoint bridge', 'ready · no learner checkpoint yet');
  } else {
    record('FAIL', 'Private checkpoint bridge', checkpoint.error || `HTTP ${checkpoint.status} · ${checkpoint.value?.status || 'unexpected response'}`);
  }

  const packetRelay = await waitForRelayStatus('/__kianos-private/checkpoint/status');
  if (packetRelay.status === 200 && packetRelay.value?.status === 'ready') {
    const relay = packetRelay.value?.relay || {};
    if (relay.state === 'ready') {
      record('PASS', 'Daily Learning Packet relay', [relay.status, relay.study_day].filter(Boolean).join(' · ') || 'ready');
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      learnerEvidenceReady = relay.learner_evidence_ready === true && relay.study_day === today;
      record(learnerEvidenceReady ? 'PASS' : 'WARN', 'Learner evidence for current-day planning',
        learnerEvidenceReady ? `current-day valid basis · coverage=${JSON.stringify(relay.coverage)} · unknown remains unknown` :
          `unavailable or stale · day=${relay.study_day || 'unknown'} · coverage=${JSON.stringify(relay.coverage || {})} · healthy native learning remains available`);
    } else if (relay.state === 'missing' && relay.reason === 'private-checkpoint-missing') {
      record('WARN', 'Daily Learning Packet relay', 'not exercised · no local learner checkpoint yet');
    } else if (relay.state === 'disabled') {
      record('FAIL', 'Daily Learning Packet relay', 'disabled');
    } else if (relay.state === 'degraded') {
      record('FAIL', 'Daily Learning Packet relay', relay.error || 'runtime packet relay unavailable');
    } else {
      record('FAIL', 'Daily Learning Packet relay', relay.state || 'not initialized');
    }
  } else {
    record('FAIL', 'Daily Learning Packet relay', packetRelay.error || `HTTP ${packetRelay.status}`);
  }

  const control = await waitForRelayStatus('/__kianos-private/control/status');
  if (control.status === 200 && control.value?.status === 'ready') {
    const relay = control.value?.relay || {};
    if (relay.state === 'ready') {
      record('PASS', 'Private Chat control relay', relay.command_status || 'ready');
    } else if (relay.state === 'disabled') {
      record('FAIL', 'Private Chat control relay', 'disabled');
    } else if (relay.state === 'degraded') {
      record('FAIL', 'Private Chat control relay', relay.error || 'private repo unavailable');
    } else {
      record('FAIL', 'Private Chat control relay', relay.state || 'not initialized');
    }
  } else {
    record('FAIL', 'Private Chat control relay', control.error || `HTTP ${control.status}`);
  }

  const external = await fetchJson('/__kianos-private/external-reading/status');
  if (external.status === 200 && external.value?.status === 'ready') {
    const counts = external.value?.counts || {};
    const tpo = counts?.toefl || {};
    const ielts = counts?.ielts || {};
    record(
      'PASS',
      'External Reading private source',
      `TPO ${tpo.collections || 0} collections / ${tpo.passages || 0} passages · IELTS ${ielts.books || 0} books / ${ielts.passages || 0} passages`
    );
  } else if (external.status === 404 && external.value?.status === 'missing_source') {
    const missing = Array.isArray(external.value?.missing) ? external.value.missing.length : 0;
    record('WARN', 'External Reading private source', `missing ${missing} source file(s) under ${external.value?.source_root || 'default private source root'}`);
  } else if (external.status === 409 && external.value?.status === 'stale_source') {
    const mismatches = Array.isArray(external.value?.mismatches) ? external.value.mismatches : [];
    const first = mismatches[0]?.relative ? ` · first: ${mismatches[0].relative}` : '';
    record('WARN', 'External Reading private source', `stale repaired-source hash set · ${mismatches.length} mismatch(es)${first}`);
  } else {
    record('WARN', 'External Reading private source', external.error || `HTTP ${external.status} · ${external.value?.status || external.value?.error || 'not ready'}`);
  }
}

const report = {
  schema: 'kianos.current-doctor.v1',
  generated_at: new Date().toISOString(),
  started_at: startedAt,
  ready: !failed && learnerEvidenceReady,
  transport_ready: !failed,
  learner_evidence_ready: learnerEvidenceReady,
  base_url: base + '/',
  mirror_dir: mirrorDir,
  private_dir: privateDir,
  local_sha: localSha || null,
  remote_sha: remoteSha || null,
  rows
};

if (jsonOutput) {
  console.log(JSON.stringify(report));
  process.exit(report.ready ? 0 : 1);
}

console.log('');
for (const row of rows) {
  const detail = row.detail ? ` — ${row.detail}` : '';
  console.log(`${row.level.padEnd(4)}  ${row.label}${detail}`);
}
console.log('');

if (!report.ready) {
  console.error('NOT READY: inspect the failed/warned owner above. A reachable relay does not prove current learner evidence. Native learning may remain available.');
  process.exit(1);
}

console.log(`READY: KianOS Current is ready for learner use at ${base}/`);
