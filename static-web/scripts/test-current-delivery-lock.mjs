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
  const ownerA = await acquireDeliveryLock(lock, { timeoutMs: 50 });
  const tokenB = 'owner-b-token';
  fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, token: tokenB }));
  ownerA();
  assert.equal(JSON.parse(fs.readFileSync(lock, 'utf8')).token, tokenB, 'stale release must not remove a replacement lock');
  fs.rmSync(lock);
  const live = await acquireDeliveryLock(lock, { timeoutMs: 80 });
  fs.utimesSync(lock, new Date(0), new Date(0));
  await assert.rejects(acquireDeliveryLock(lock, { timeoutMs: 80, staleMs: 1 }), /CURRENT_DELIVERY_LOCK_TIMEOUT/);
  live();
  console.log('CURRENT_DELIVERY_LOCK PASS: live owners block and stale owners recover');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
