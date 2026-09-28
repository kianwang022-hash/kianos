#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  acquireDeliveryLock,
  clearCurrentAuditPin,
  readCurrentAuditPin,
  releasePaths,
  writeCurrentAuditPin
} from './currentRelease.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const releases = releasePaths(repoRoot);
const command = String(process.argv[2] || 'status').trim();
const expectedSha = String(process.argv[3] || '').trim();

function activeIdentity() {
  if (!fs.existsSync(releases.active)) throw new Error('CURRENT_AUDIT_PIN_ACTIVE_RELEASE_MISSING');
  const activeRoot = fs.realpathSync(releases.active);
  const statusPath = path.join(activeRoot, 'static-web', 'dist', '__kianos-current.json');
  let status;
  try { status = JSON.parse(fs.readFileSync(statusPath, 'utf8')); }
  catch { throw new Error('CURRENT_AUDIT_PIN_ACTIVE_STATUS_UNREADABLE'); }
  const sha = String(status?.sha || '').trim();
  if (status?.state !== 'synced' || !/^[0-9a-f]{40}$/i.test(sha)) {
    throw new Error('CURRENT_AUDIT_PIN_ACTIVE_STATUS_INVALID');
  }
  return { sha, active_root: activeRoot };
}

function print(value) {
  process.stdout.write(JSON.stringify(value) + '\n');
}

if (command === 'status') {
  const active = activeIdentity();
  const pin = readCurrentAuditPin(releases.auditPin);
  print({ status: pin ? 'pinned' : 'unpinned', active_sha: active.sha, pin });
  process.exit(0);
}

if (!['pin', 'release'].includes(command)) {
  throw new Error('Usage: kianos-current-audit-pin.mjs pin [CURRENT_SERVED_SHA] | release [PINNED_SHA] | status');
}

const unlock = await acquireDeliveryLock(releases.lock);
try {
  const active = activeIdentity();
  const existing = readCurrentAuditPin(releases.auditPin);

  if (command === 'pin') {
    if (expectedSha && expectedSha !== active.sha) {
      throw new Error(`CURRENT_AUDIT_PIN_EXPECTED_SHA_MISMATCH:${expectedSha}:${active.sha}`);
    }
    if (existing && existing.sha !== active.sha) {
      throw new Error(`CURRENT_AUDIT_PIN_CONFLICT:${existing.sha}:${active.sha}`);
    }
    const pin = existing || writeCurrentAuditPin(releases.auditPin, active.sha);
    print({ status: 'pinned', active_sha: active.sha, pin });
  } else {
    if (expectedSha && existing?.sha !== expectedSha) {
      throw new Error(`CURRENT_AUDIT_RELEASE_EXPECTED_SHA_MISMATCH:${expectedSha}:${existing?.sha || 'unpinned'}`);
    }
    clearCurrentAuditPin(releases.auditPin);
    print({ status: 'released', active_sha: active.sha, released_sha: existing?.sha || null });
  }
} finally {
  unlock();
}
