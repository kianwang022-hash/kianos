#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const args = process.argv.slice(2);
const releaseProbeOnly = args.includes('--release-probe-only') || process.env.KIANOS_RELEASE_PROBE_ONLY === '1';
const arg = (name, fallback) => {
  const index = args.indexOf('--' + name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const host = arg('host', process.env.KIANOS_HOST || '127.0.0.1');
const port = Number(arg('port', process.env.KIANOS_PORT || 4321));
const root = path.resolve(arg('root', process.env.KIANOS_STATIC_ROOT || 'dist'));
const fallbackRootArg = arg('fallback-root', process.env.KIANOS_STATIC_FALLBACK_ROOT || '');
const fallbackRoot = fallbackRootArg ? path.resolve(fallbackRootArg) : '';
const currentStatusPath = path.resolve(
  process.env.KIANOS_CURRENT_STATUS_PATH || path.join(process.cwd(), 'public', '__kianos-current.json')
);
const releaseIdentityPath = path.join(root, '__kianos-current.json');

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('KIANOS_STATIC_PORT_INVALID');
}
function resolvedRoot(configuredRoot) {
  if (!configuredRoot) return null;
  try {
    const real = fs.realpathSync(configuredRoot);
    const stat = fs.statSync(path.join(real, 'index.html'));
    return stat.isFile() ? real : null;
  } catch {
    return null;
  }
}

if (!resolvedRoot(root)) {
  throw new Error('KIANOS_STATIC_ROOT_INVALID:' + root);
}

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'],
  ['.avif', 'image/avif'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.ttf', 'font/ttf'],
  ['.otf', 'font/otf'],
  ['.pdf', 'application/pdf'],
  ['.mp3', 'audio/mpeg'],
  ['.mp4', 'video/mp4'],
  ['.webm', 'video/webm']
]);

function safeRelative(pathname, activeRoot) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); }
  catch { return null; }
  if (decoded.includes('\0')) return null;
  const relative = decoded.replace(/^\/+/, '').replace(/\/+$/, '');
  const target = path.resolve(activeRoot, relative || '.');
  const rel = path.relative(activeRoot, target);
  if (rel.startsWith('..' + path.sep) || path.isAbsolute(rel)) return null;
  return relative;
}

function resolveStatic(pathname, activeRoot) {
  const relative = safeRelative(pathname, activeRoot);
  if (relative == null) return null;

  const base = path.resolve(activeRoot, relative || '.');
  const candidates = [];
  if (!relative || pathname.endsWith('/')) {
    candidates.push(path.join(base, 'index.html'));
  } else {
    candidates.push(base, path.join(base, 'index.html'));
  }

  for (const file of candidates) {
    try {
      const stat = fs.statSync(file);
      if (stat.isFile()) return { file, stat };
    } catch {}
  }
  return null;
}

function contentType(pathname, file) {
  const routeExt = path.extname(String(pathname || '').replace(/\/+$/, '')).toLowerCase();
  if (routeExt === '.json') return MIME.get('.json');
  return MIME.get(path.extname(file).toLowerCase()) || 'application/octet-stream';
}

function sendFile(req, res, pathname, resolved, { status = 200, cache = null } = {}) {
  const { file, stat } = resolved;
  const range = String(req.headers.range || '');
  res.setHeader('content-type', contentType(pathname, file));
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('accept-ranges', 'bytes');
  res.setHeader('cache-control', cache || (pathname.startsWith('/_astro/')
    ? 'public, max-age=31536000, immutable'
    : 'no-cache'));

  const match = range.match(/^bytes=(\d*)-(\d*)$/);
  if (match && stat.size > 0) {
    let start = match[1] ? Number(match[1]) : null;
    let end = match[2] ? Number(match[2]) : null;
    if (start == null && end != null) {
      start = Math.max(0, stat.size - end);
      end = stat.size - 1;
    } else {
      start = start ?? 0;
      end = Math.min(end ?? stat.size - 1, stat.size - 1);
    }
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= stat.size) {
      res.statusCode = 416;
      res.setHeader('content-range', 'bytes */' + stat.size);
      return res.end();
    }
    res.statusCode = 206;
    res.setHeader('content-range', 'bytes ' + start + '-' + end + '/' + stat.size);
    res.setHeader('content-length', String(end - start + 1));
    if (req.method === 'HEAD') return res.end();
    return fs.createReadStream(file, { start, end }).pipe(res);
  }

  res.statusCode = status;
  res.setHeader('content-length', String(stat.size));
  if (req.method === 'HEAD') return res.end();
  return fs.createReadStream(file).pipe(res);
}

function sendCurrentStatus(req, res) {
  try {
    const stat = fs.statSync(currentStatusPath);
    if (!stat.isFile()) throw new Error('not-file');
    return sendFile(req, res, '/__kianos-current.json', { file: currentStatusPath, stat }, {
      cache: 'no-store'
    });
  } catch {
    res.statusCode = 503;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    return res.end(JSON.stringify({ state: 'unavailable', sha: '' }));
  }
}

function sendReleaseIdentity(req, res) {
  try {
    const stat = fs.statSync(releaseIdentityPath);
    if (!stat.isFile()) throw new Error('not-file');
    return sendFile(req, res, '/__kianos-release.json', { file: releaseIdentityPath, stat }, {
      cache: 'no-store'
    });
  } catch {
    res.statusCode = 503;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    return res.end(JSON.stringify({ state: 'unavailable', sha: '' }));
  }
}

const stack = [];
const middlewares = {
  use(handler) {
    if (typeof handler === 'function') stack.push(handler);
  }
};

function fail(res, error) {
  if (res.writableEnded) return;
  res.statusCode = 500;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify({
    status: 'error',
    error: error instanceof Error ? error.message : String(error)
  }));
}

function staticFallback(req, res) {
  if (!['GET', 'HEAD'].includes(String(req.method || 'GET').toUpperCase())) {
    res.statusCode = 405;
    res.setHeader('allow', 'GET, HEAD');
    return res.end();
  }

  const url = new URL(req.url || '/', 'http://127.0.0.1');
  if (url.pathname === '/__kianos-current.json') return sendCurrentStatus(req, res);
  if (url.pathname === '/__kianos-release.json') return sendReleaseIdentity(req, res);

  const activeRoot = resolvedRoot(root);
  if (!activeRoot) {
    res.statusCode = 503;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    return res.end('Current build unavailable');
  }

  const resolved = resolveStatic(url.pathname, activeRoot);
  if (resolved) return sendFile(req, res, url.pathname, resolved);

  if (url.pathname.startsWith('/_astro/')) {
    const previousRoot = resolvedRoot(fallbackRoot);
    if (previousRoot && previousRoot !== activeRoot) {
      const previous = resolveStatic(url.pathname, previousRoot);
      if (previous) return sendFile(req, res, url.pathname, previous);
    }
  }

  const notFound = resolveStatic('/404.html', activeRoot);
  if (notFound) return sendFile(req, res, '/404.html', notFound, { status: 404 });
  res.statusCode = 404;
  res.setHeader('content-type', 'text/plain; charset=utf-8');
  res.end('Not Found');
}

function dispatch(req, res, index = 0) {
  if (res.writableEnded) return;
  const handler = stack[index];
  if (!handler) return staticFallback(req, res);

  let advanced = false;
  const next = (error) => {
    if (advanced || res.writableEnded) return;
    advanced = true;
    if (error) return fail(res, error);
    return dispatch(req, res, index + 1);
  };

  try {
    const result = handler(req, res, next);
    if (result && typeof result.then === 'function') {
      result.catch((error) => fail(res, error));
    }
  } catch (error) {
    fail(res, error);
  }
}

const server = http.createServer((req, res) => dispatch(req, res));
const bridgeServer = { middlewares, httpServer: server };

if (!releaseProbeOnly) {
  const [
    { privateLearnerBridge },
    { privateExternalReadingBridge },
    { privateControlBridge }
  ] = await Promise.all([
    import('./privateLearnerBridge.mjs'),
    import('./privateExternalReadingBridge.mjs'),
    import('./privateControlBridge.mjs')
  ]);
  for (const bridge of [
    privateLearnerBridge(),
    privateExternalReadingBridge(),
    privateControlBridge()
  ]) {
    bridge.configureServer?.(bridgeServer);
  }
}

server.listen(port, host, () => {
  console.log(
    'KianOS static runtime listening on http://' + host + ':' + port
    + ' · root=' + root
    + (fallbackRoot ? ' · fallback=' + fallbackRoot : '')
  );
});

const shutdown = () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500).unref();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
