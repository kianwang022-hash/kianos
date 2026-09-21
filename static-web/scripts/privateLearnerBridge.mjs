import {
  PRIVATE_CHECKPOINT_SCHEMA,
  readPrivateLearnerCheckpoint,
  resolvePrivateLearnerDir,
  writePrivateLearnerCheckpoint
} from './privateLearnerStore.mjs';
import { syncPrivateDailyLearningPacketOnce } from './privateDailyLearningPacketRelay.mjs';

const ROUTE = '/__kianos-private/checkpoint';
const STATUS_ROUTE = ROUTE + '/status';
const MAX_BYTES = 24 * 1024 * 1024;

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

export function privateLearnerBridge({ privateDir = resolvePrivateLearnerDir(), packetSync = syncPrivateDailyLearningPacketOnce } = {}) {
  return {
    name: 'kianos-private-learner-bridge',
    apply: 'serve',
    configureServer(server) {
      let packetSyncBusy = false;
      let packetSyncQueued = false;
      let packetRelay = { state: 'checking', checked_at: null };
      const syncPacket = () => {
        if (packetSyncBusy) {
          packetSyncQueued = true;
          return;
        }
        packetSyncBusy = true;
        packetRelay = { ...packetRelay, state: 'checking' };
        void packetSync({ privateDir })
          .then((result) => {
            packetRelay = {
              state: result?.state || 'unknown',
              status: result?.status || null,
              study_day: result?.study_day || null,
              reason: result?.reason || null,
              checked_at: new Date().toISOString(),
              error: null
            };
          })
          .catch((error) => {
            packetRelay = {
              state: 'degraded',
              status: null,
              study_day: null,
              reason: null,
              checked_at: new Date().toISOString(),
              error: error instanceof Error ? error.message : String(error)
            };
          })
          .finally(() => {
            packetSyncBusy = false;
            if (packetSyncQueued) {
              packetSyncQueued = false;
              syncPacket();
            }
          });
      };

      syncPacket();

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
            syncPacket();
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
