#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { acquireDeliveryLock, isProcessAlive } from './currentRelease.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-delivery-lock-'));
const lock = path.join(root, 'delivery.lock');
const held = () => path.join(lock, 'held');
const ownerFiles = () => fs.existsSync(held()) ? fs.readdirSync(held()) : [];
const ownerPath = () => path.join(held(), ownerFiles()[0]);

try {
  const release = await acquireDeliveryLock(lock, { timeoutMs: 50 });
  assert.equal(fs.lstatSync(lock).isDirectory(), true);
  assert.equal(ownerFiles().length, 1);
  await assert.rejects(acquireDeliveryLock(lock, { timeoutMs: 80 }), /CURRENT_DELIVERY_LOCK_TIMEOUT/);
  release();
  assert.equal(fs.existsSync(held()), false);
  assert.equal(fs.existsSync(lock), true, 'lock root persists; ownership is held/');

  // A becomes stale, B takes over, then A's old release callback fires late.
  const releaseA = await acquireDeliveryLock(lock, { timeoutMs: 50 });
  const aPath = ownerPath();
  const a = JSON.parse(fs.readFileSync(aPath, 'utf8'));
  fs.writeFileSync(aPath, JSON.stringify({ ...a, pid: 99999999 }));
  const releaseB = await acquireDeliveryLock(lock, { timeoutMs: 80 });
  const bName = ownerFiles()[0];
  releaseA();
  assert.deepEqual(ownerFiles(), [bName], 'stale A must not remove successor B');
  await assert.rejects(acquireDeliveryLock(lock, { timeoutMs: 80 }), /CURRENT_DELIVERY_LOCK_TIMEOUT/);
  releaseB();

  // Age never overrides a demonstrably live PID.
  const live = await acquireDeliveryLock(lock, { timeoutMs: 50 });
  fs.utimesSync(ownerPath(), new Date(0), new Date(0));
  fs.utimesSync(held(), new Date(0), new Date(0));
  await assert.rejects(acquireDeliveryLock(lock, { timeoutMs: 80, staleMs: 1 }), /CURRENT_DELIVERY_LOCK_TIMEOUT/);
  live();

  // kill(pid, 0): EPERM/unknown fail safe as alive; ESRCH means dead.
  const errorKill = (code) => () => { const error = new Error(code); error.code = code; throw error; };
  assert.equal(isProcessAlive(process.pid, errorKill('EPERM')), true);
  assert.equal(isProcessAlive(process.pid, errorKill('EACCES')), true);
  assert.equal(isProcessAlive(process.pid, errorKill('ESRCH')), false);
  assert.equal(isProcessAlive(-process.pid, errorKill('EPERM')), true);

  // Legacy file-format migration: dead owner recovers; old live owner blocks.
  const legacy = path.join(root, 'legacy.lock');
  fs.writeFileSync(legacy, JSON.stringify({ pid: 99999999 }));
  const migrated = await acquireDeliveryLock(legacy, { timeoutMs: 80 });
  assert.equal(fs.lstatSync(legacy).isDirectory(), true);
  migrated();
  fs.rmSync(legacy, { recursive: true, force: true });
  fs.writeFileSync(legacy, JSON.stringify({ pid: process.pid }));
  fs.utimesSync(legacy, new Date(0), new Date(0));
  await assert.rejects(acquireDeliveryLock(legacy, { timeoutMs: 80, staleMs: 1 }), /CURRENT_DELIVERY_LOCK_TIMEOUT/);

  console.log('CURRENT_DELIVERY_LOCK PASS: atomic lease, successor-safe release, live-owner precedence, legacy recovery');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
