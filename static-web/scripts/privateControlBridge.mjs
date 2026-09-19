import {
  readPrivateControlCommand,
  readPrivateControlReceipt,
  writePrivateControlCommand,
  writePrivateControlReceipt
} from './privateControlStore.mjs';

const ROUTE = '/__kianos-private/control';
const MAX_BYTES = 2 * 1024 * 1024;

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
    if (size > MAX_BYTES) throw new Error('PRIVATE_CONTROL_TOO_LARGE');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) throw new Error('PRIVATE_CONTROL_BODY_REQUIRED');
  return JSON.parse(raw);
}

export function privateControlBridge({ privateDir } = {}) {
  return {
    name: 'kianos-private-control-bridge',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url || '/', 'http://127.0.0.1').pathname;
        if (pathname !== ROUTE) return next();
        if (!isLoopback(req.socket?.remoteAddress)) return json(res, 403, { status:'forbidden' });

        try {
          if (req.method === 'GET') {
            const command = readPrivateControlCommand(privateDir);
            const receipt = readPrivateControlReceipt(privateDir);
            return command
              ? json(res, 200, { status:'ready', command, receipt })
              : json(res, 404, { status:'missing', command:null, receipt });
          }

          // PUT is deliberately only a local/prototype ingress. The final remote relay
          // should write through the background service, not expose a network listener.
          if (req.method === 'PUT') {
            const command = writePrivateControlCommand(await readBody(req), privateDir);
            return json(res, 200, { status:'saved', command_id:command.command_id });
          }

          if (req.method === 'POST') {
            const receipt = writePrivateControlReceipt(await readBody(req), privateDir);
            return json(res, 200, { status:'saved', command_id:receipt.command_id, receipt_status:receipt.status });
          }

          res.setHeader('allow', 'GET, PUT, POST');
          return json(res, 405, { status:'method_not_allowed' });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const status = /JSON|REQUIRED|INVALID|SCHEMA|TOO_LARGE/.test(message) ? 400 : 500;
          return json(res, status, { status:'error', error:message });
        }
      });
    }
  };
}
