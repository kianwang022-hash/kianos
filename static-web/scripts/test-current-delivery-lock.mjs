#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { acquireDeliveryLock } from './currentRelease.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-delivery-lock-'));
const lock = path.join(root, 'delivery.lock');
try {
  const release = await acquireDeliveryLock(lock, { timeoutMs: 50 });
  await assert.rejects(acquireDeliveryLock(lock, { timeoutMs: 80 }), /CURRENT_DELIVERY_LOCK_TIMEOUT/);
  release();
  (await acquireDeliveryLock(lock, { timeoutMs: 50 }))();
  fs.writeFileSync(lock, JSON.stringify({ pid: 99999999 }));
  (await acquireDeliveryLock(lock, { timeoutMs: 50 }))();
  console.log('CURRENT_DELIVERY_LOCK PASS: live owners block and stale owners recover');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
