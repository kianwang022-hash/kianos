import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import {
  PRIVATE_CHECKPOINT_SCHEMA,
  readPrivateLearnerCheckpoint,
  resolvePrivateLearnerDir,
  writePrivateLearnerCheckpoint
} from './privateLearnerStore.mjs';

const execFileAsync = promisify(execFile);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, '..');
const workerPath = path.join(scriptDir, 'privateDailyLearningPacketRelayWorker.mjs');

const ROUTE = '/__kianos-private/checkpoint';
const STATUS_ROUTE = ROUTE + '/status';
const MAX_BYTES = 24 * 1024 * 1024;
export const PRIVATE_PACKET_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
export const PRIVATE_PACKET_REFRESH_DEBOUNCE_MS = 10 * 1000;

const packetSyncMode = (value) => String(value || '').toLowerCase() === 'immediate'
  ? 'immediate'
  : 'routine';

const isLoopback = (address) => {
  const value = String(address || '').toLowerCase();
  return value === '127.0.0.1' || value === '::1' || value === '::ffff:127.0.0.1';
};

const json = (res, status, value) => {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(value));
};

export async function runPrivateDailyLearningPacketRelayWorker({
  privateDir = resolvePrivateLearnerDir(),
  env = process.env
} = {}) {
  const timeoutMs = Math.max(
    5_000,
    Math.min(300_000, Number(env.KIANOS_PACKET_RELAY_WORKER_TIMEOUT_MS || 120_000))
  );
  const { stdout } = await execFileAsync(process.execPath, [
    workerPath,
    '--private-dir', privateDir
  ], {
    cwd: webRoot,
    env: { ...env, KIANOS_PRIVATE_DIR: privateDir },
    maxBuffer: 2 * 1024 * 1024,
    timeout: timeoutMs,
    killSignal: 'SIGTERM'
  });
  const raw = String(stdout || '').trim();
  if (!raw) throw new Error('PRIVATE_PACKET_RELAY_WORKER_EMPTY_RESULT');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('PRIVATE_PACKET_RELAY_WORKER_INVALID_RESULT');
  }
}

async function readBody(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BYTES) throw new Error('PRIVATE_CHECKPOINT_TOO_LARGE');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) throw new Error('PRIVATE_CHECKPOINT_BODY_REQUIRED');
  return JSON.parse(raw);
}

export function privateLearnerBridge({
  privateDir = resolvePrivateLearnerDir(),
  packetSync = runPrivateDailyLearningPacketRelayWorker,
  packetRefreshIntervalMs = PRIVATE_PACKET_REFRESH_INTERVAL_MS,
  packetRefreshDebounceMs = PRIVATE_PACKET_REFRESH_DEBOUNCE_MS,
  now = () => Date.now()
} = {}) {
  const refreshIntervalMs = Math.max(1, Number(packetRefreshIntervalMs) || PRIVATE_PACKET_REFRESH_INTERVAL_MS);
  const refreshDebounceMs = Math.max(0, Number(packetRefreshDebounceMs) || 0);

  return {
    name: 'kianos-private-learner-bridge',
    apply: 'serve',
    configureServer(server) {
      let packetSyncBusy = false;
      let packetSyncQueued = false;
      let packetSyncQueuedImmediate = false;
      let packetSyncTimer = null;
      let packetLastSuccessAt = 0;
      let packetRelay = {
        state: 'checking',
        refreshing: false,
        refresh_scheduled_at: null,
        checked_at: null,
        last_success_at: null
      };

      const timestamp = () => new Date(now()).toISOString();

      const runPacketSync = () => {
        if (packetSyncTimer) {
          clearTimeout(packetSyncTimer);
          packetSyncTimer = null;
        }
        if (packetSyncBusy) {
          packetSyncQueued = true;
          return;
        }
        packetSyncBusy = true;
        const hadLastGood = packetRelay.state === 'ready' || packetLastSuccessAt > 0;
        packetRelay = hadLastGood
          ? {
              ...packetRelay,
              state: 'ready',
              refreshing: true,
              refresh_started_at: timestamp(),
              refresh_scheduled_at: null,
              refresh_error: null
            }
          : {
              ...packetRelay,
              state: 'checking',
              refreshing: true,
              refresh_started_at: timestamp(),
              refresh_scheduled_at: null,
              refresh_error: null
            };

        void packetSync({ privateDir })
          .then((result) => {
            const finishedAt = now();
            const state = result?.state || 'unknown';
            if (state === 'ready') packetLastSuccessAt = finishedAt;
            packetRelay = {
              state,
              status: result?.status || null,
              study_day: result?.study_day || null,
              learner_evidence_ready: result?.learner_evidence_ready === true,
              coverage: result?.coverage || null,
              generated_at: result?.generated_at || null,
              reason: result?.reason || null,
              refreshing: false,
              refresh_started_at: null,
              refresh_scheduled_at: null,
              refresh_error: null,
              checked_at: new Date(finishedAt).toISOString(),
              last_success_at: state === 'ready'
                ? new Date(finishedAt).toISOString()
                : packetRelay.last_success_at || null,
              error: null
            };
          })
          .catch((error) => {
            const message = error instanceof Error ? error.message : String(error);
            if (packetRelay.state === 'ready' || packetLastSuccessAt > 0) {
              packetRelay = {
                ...packetRelay,
                state: 'ready',
                refreshing: false,
                refresh_started_at: null,
                refresh_scheduled_at: null,
                refresh_error: message,
                checked_at: timestamp(),
                error: null
              };
            } else {
              packetRelay = {
                state: 'degraded',
                status: null,
                study_day: null,
                learner_evidence_ready: false,
                coverage: null,
                generated_at: null,
                reason: null,
                refreshing: false,
                refresh_started_at: null,
                refresh_scheduled_at: null,
                refresh_error: message,
                checked_at: timestamp(),
                last_success_at: null,
                error: message
              };
            }
          })
          .finally(() => {
            packetSyncBusy = false;
            if (packetSyncQueued) {
              const mode = packetSyncQueuedImmediate ? 'immediate' : 'routine';
              packetSyncQueued = false;
              packetSyncQueuedImmediate = false;
              schedulePacketSync(mode);
            }
          });
      };

      const schedulePacketSync = (mode = 'routine') => {
        const normalizedMode = packetSyncMode(mode);
        if (packetSyncBusy) {
          packetSyncQueued = true;
          if (normalizedMode === 'immediate') packetSyncQueuedImmediate = true;
          return;
        }

        if (normalizedMode === 'immediate' || packetLastSuccessAt <= 0) {
          if (packetSyncTimer) {
            clearTimeout(packetSyncTimer);
            packetSyncTimer = null;
          }
          runPacketSync();
          return;
        }

        if (packetSyncTimer) return;
        const current = now();
        const dueAt = Math.max(
          current + refreshDebounceMs,
          packetLastSuccessAt + refreshIntervalMs
        );
        packetRelay = {
          ...packetRelay,
          refresh_scheduled_at: new Date(dueAt).toISOString()
        };
        packetSyncTimer = setTimeout(() => {
          packetSyncTimer = null;
          runPacketSync();
        }, Math.max(0, dueAt - current));
      };

      schedulePacketSync('immediate');

      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url || '/', 'http://127.0.0.1').pathname;
        if (![ROUTE, STATUS_ROUTE].includes(pathname)) return next();

        if (!isLoopback(req.socket?.remoteAddress)) {
          return json(res, 403, { status: 'forbidden' });
        }

        try {
          if (req.method === 'GET' && pathname === STATUS_ROUTE) {
            return json(res, 200, { status: 'ready', relay: packetRelay });
          }
          if (req.method === 'GET' && pathname === ROUTE) {
            const checkpoint = readPrivateLearnerCheckpoint(privateDir);
            return checkpoint
              ? json(res, 200, { status: 'ready', checkpoint })
              : json(res, 404, { status: 'missing', checkpoint: null });
          }

          if (req.method === 'PUT') {
            const input = await readBody(req);
            if (typeof req.headers['if-match'] !== 'string') {
              return json(res, 428, { status: 'error', error: 'PRIVATE_CHECKPOINT_PRECONDITION_REQUIRED' });
            }
            const expectedCheckpointId = JSON.parse(req.headers['if-match']);
            if (expectedCheckpointId !== null && typeof expectedCheckpointId !== 'string') {
              throw new Error('PRIVATE_CHECKPOINT_PRECONDITION_INVALID');
            }
            const checkpoint = writePrivateLearnerCheckpoint(input, privateDir, { expectedCheckpointId });
            const syncMode = packetSyncMode(req.headers['x-kianos-packet-sync']);
            schedulePacketSync(syncMode);
            return json(res, 200, {
              status: 'saved',
              schema: PRIVATE_CHECKPOINT_SCHEMA,
              checkpoint_id: checkpoint.checkpoint_id,
              study_day: checkpoint.study_day,
              generated_at: checkpoint.generated_at
            });
          }

          res.setHeader('allow', 'GET, PUT');
          return json(res, 405, { status: 'method_not_allowed' });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const status = /CONFLICT|STALE_WRITE/.test(message) ? 409
            : /JSON|REQUIRED|INVALID|SCHEMA|TOO_LARGE/.test(message) ? 400 : 500;
          return json(res, status, { status: 'error', error: message });
        }
      });
    }
  };
}
