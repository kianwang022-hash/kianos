import {
  PRIVATE_CHECKPOINT_SCHEMA,
  readPrivateLearnerCheckpoint,
  resolvePrivateLearnerDir,
  writePrivateLearnerCheckpoint
} from './privateLearnerStore.mjs';

const ROUTE = '/__kianos-private/checkpoint';
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

export function privateLearnerBridge({ privateDir = resolvePrivateLearnerDir() } = {}) {
  return {
    name: 'kianos-private-learner-bridge',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url || '/', 'http://127.0.0.1').pathname;
        if (pathname !== ROUTE) return next();

        if (!isLoopback(req.socket?.remoteAddress)) {
          return json(res, 403, { status: 'forbidden' });
        }

        try {
          if (req.method === 'GET') {
            const checkpoint = readPrivateLearnerCheckpoint(privateDir);
            return checkpoint
              ? json(res, 200, { status: 'ready', checkpoint })
              : json(res, 404, { status: 'missing', checkpoint: null });
          }

          if (req.method === 'PUT') {
            const input = await readBody(req);
            const checkpoint = writePrivateLearnerCheckpoint(input, privateDir);
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
          const status = /JSON|REQUIRED|INVALID|SCHEMA|TOO_LARGE/.test(message) ? 400 : 500;
          return json(res, status, { status: 'error', error: message });
        }
      });
    }
  };
}
