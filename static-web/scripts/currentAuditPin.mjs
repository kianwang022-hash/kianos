import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  acquireDeliveryLock,
  clearCurrentAuditPin,
  DEFAULT_AUDIT_PIN_TTL_MINUTES,
  readCurrentAuditPin,
  releasePaths,
  writeCurrentAuditPin
} from './currentRelease.mjs';

const SHA_RE = /^[0-9a-f]{40}$/;

function fail(code, detail = '') {
  throw new Error(`${code}${detail ? `:${detail}` : ''}`);
}

async function fetchServedRelease(host, port) {
  const response = await fetch(
    `http://${host}:${port}/__kianos-release.json?t=${Date.now()}`,
    { cache: 'no-store', signal: AbortSignal.timeout(5000) }
  );
  if (!response.ok) fail('CURRENT_AUDIT_PIN_STABLE_UNAVAILABLE', String(response.status));
  const body = await response.json();
  if (!SHA_RE.test(String(body?.sha || ''))) {
    fail('CURRENT_AUDIT_PIN_SERVED_SHA_INVALID', String(body?.sha || ''));
  }
  return String(body.sha);
}

function arg(name, fallback = '') {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

async function withDeliveryLock(releases, fn) {
  const releaseLock = await acquireDeliveryLock(releases.lock);
  try {
    return await fn();
  } finally {
    releaseLock();
  }
}

async function main() {
  const action = String(process.argv[2] || 'status').toLowerCase();
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(scriptDir, '../..');
  const releases = releasePaths(repoRoot);
  const host = process.env.KIANOS_HOST || '127.0.0.1';
  const port = String(process.env.KIANOS_PORT || '4321');

  if (action === 'pin') {
    const result = await withDeliveryLock(releases, async () => {
      const servedSha = await fetchServedRelease(host, port);
      const expectedSha = arg('--sha');
      if (expectedSha && expectedSha !== servedSha) {
        fail('CURRENT_AUDIT_PIN_EXPECTED_SHA_MISMATCH', `${expectedSha}:${servedSha}`);
      }
      const pin = writeCurrentAuditPin(releases.auditPin, {
        sha: servedSha,
        issue: arg('--issue'),
        ttlMinutes: Number(arg('--minutes', String(DEFAULT_AUDIT_PIN_TTL_MINUTES)))
      });
      return { servedSha, pin };
    });
    console.log(JSON.stringify({
      ok: true,
      action,
      served_sha: result.servedSha,
      pin: result.pin
    }, null, 2));
    return;
  }

  if (action === 'release') {
    const prior = await withDeliveryLock(
      releases,
      async () => clearCurrentAuditPin(releases.auditPin)
    );
    console.log(JSON.stringify({ ok: true, action, released: prior }, null, 2));
    return;
  }

  if (action === 'status') {
    const servedSha = await fetchServedRelease(host, port);
    const pin = readCurrentAuditPin(releases.auditPin);
    console.log(JSON.stringify({ ok: true, action, served_sha: servedSha, pin }, null, 2));
    return;
  }

  fail('CURRENT_AUDIT_PIN_ACTION_INVALID', action);
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
