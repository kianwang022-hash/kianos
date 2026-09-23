#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { runPrivateDailyLearningPacketRelayWorker } from './privateLearnerBridge.mjs';

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-packet-worker-'));

try {
  const result = await runPrivateDailyLearningPacketRelayWorker({
    privateDir: scratch,
    env: {
      ...process.env,
      KIANOS_PACKET_RELAY_ENABLED: '0'
    }
  });
  assert.equal(result?.state, 'disabled', 'PACKET_WORKER_DISABLED_STATE_MISMATCH');
  console.log('PASS private packet relay worker process');
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}
