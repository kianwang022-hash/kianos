import fs from 'node:fs';
import path from 'node:path';

const JSON_ROUTE = /\\.json\\/?$/i;

function safeOutputPath(root, pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); }
  catch { return null; }
  const relative = decoded.replace(/^\\/+/, '').replace(/\\/+$/, '');
  if (!relative || !JSON_ROUTE.test('/' + relative)) return null;
  const target = path.resolve(root, relative);
  const rel = path.relative(root, target);
  if (!rel || rel.startsWith('..' + path.sep) || path.isAbsolute(rel)) return null;
  return target;
}

function existingJsonFile(root, pathname) {
  const target = safeOutputPath(root, pathname);
  if (!target) return null;
  const candidates = [target, path.join(target, 'index.html')];
  for (const file of candidates) {
    try {
      if (fs.statSync(file).isFile()) return file;
    } catch {}
  }
  return null;
}

export function staticJsonPreviewBridge({ outDir = 'dist' } = {}) {
  return {
    name: 'kianos-static-json-preview-bridge',
    apply: 'serve',
    configurePreviewServer(server) {
      const root = path.resolve(process.cwd(), outDir);
      server.middlewares.use((req, res, next) => {
        if (!['GET', 'HEAD'].includes(String(req.method || 'GET').toUpperCase())) return next();
        const url = new URL(req.url || '/', 'http://127.0.0.1');
        if (!JSON_ROUTE.test(url.pathname)) return next();

        const file = existingJsonFile(root, url.pathname);
        if (!file) return next();

        try {
          const bytes = fs.readFileSync(file);
          res.statusCode = 200;
          res.setHeader('content-type', 'application/json; charset=utf-8');
          res.setHeader('content-length', String(bytes.length));
          res.setHeader('cache-control', 'no-cache');
          if (req.method === 'HEAD') return res.end();
          return res.end(bytes);
        } catch {
          return next();
        }
      });
    }
  };
}
