import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { defineConfig } from 'astro/config';
import { currentClientArtifactsIntegration } from './scripts/currentClientArtifacts.mjs';
import { privateLearnerBridge } from './scripts/privateLearnerBridge.mjs';
import { privateExternalReadingBridge } from './scripts/privateExternalReadingBridge.mjs';
import { privateEnglishGeneratedBridge } from './scripts/privateEnglishGeneratedBridge.mjs';
import { privateControlBridge } from './scripts/privateControlBridge.mjs';

function canonicalContentDevReload() {
  const canonicalContentRoot = path.resolve(process.cwd(), '..', 'content');
  let nativeWatcher = null;
  let nativeWatcherActive = false;
  let reloadTimer = null;

  const scheduleReload = (server) => {
    if (reloadTimer) clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      reloadTimer = null;
      server.moduleGraph.invalidateAll();
      server.ws.send({ type: 'full-reload', path: '*' });
    }, 80);
  };

  return {
    name: 'kianos-canonical-content-dev-reload',
    apply: 'serve',
    configureServer(server) {
      if (!fs.existsSync(canonicalContentRoot)) return;
      try {
        nativeWatcher = fs.watch(canonicalContentRoot, { recursive: true }, () => scheduleReload(server));
        nativeWatcherActive = true;
        const cleanup = () => {
          if (reloadTimer) clearTimeout(reloadTimer);
          reloadTimer = null;
          try { nativeWatcher?.close(); } catch {}
          nativeWatcher = null;
          nativeWatcherActive = false;
        };
        server.httpServer?.once('close', cleanup);
      } catch (error) {
        console.warn('[KianOS] native content watcher unavailable; falling back to Vite watcher:', error?.message || error);
        server.watcher.add(canonicalContentRoot);
      }
    },
    handleHotUpdate(ctx) {
      const changed = path.resolve(ctx.file);
      if (changed !== canonicalContentRoot && !changed.startsWith(canonicalContentRoot + path.sep)) return;
      if (nativeWatcherActive) return [];
      ctx.server.moduleGraph.invalidateAll();
      ctx.server.ws.send({ type: 'full-reload', path: '*' });
      return [];
    }
  };
}

// Astro dev/preview is an engineering surface, never the live learner runtime.
// Default every private bridge to one process-local scratch root so browser QA
// cannot restore from or write to Kian's real learner/control state. The formal
// Current runtime uses kianos-static-server.mjs and does not import this config.
// A deliberate local session may opt in explicitly when live private state is
// genuinely required.
if (process.env.KIANOS_ASTRO_ALLOW_LIVE_PRIVATE !== '1') {
  const explicitControlRelay = ['KIANOS_CONTROL_ENABLED', 'KIANOS_CONTROL_SOURCE_FILE', 'KIANOS_CONTROL_REPO_URL']
    .some((name) => String(process.env[name] || '').trim());
  const explicitPacketRelay = ['KIANOS_PACKET_RELAY_ENABLED', 'KIANOS_PACKET_REPO_DIR', 'KIANOS_PACKET_REPO_URL']
    .some((name) => String(process.env[name] || '').trim());

  let runtimeRoot = String(process.env.KIANOS_ASTRO_RUNTIME_ROOT || '').trim();
  let generatedRoot = false;
  if (!runtimeRoot) {
    runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-astro-runtime-'));
    process.env.KIANOS_ASTRO_RUNTIME_ROOT = runtimeRoot;
    generatedRoot = true;
  } else {
    runtimeRoot = path.resolve(runtimeRoot);
  }

  const isolatedDefaults = {
    KIANOS_PRIVATE_DIR: path.join(runtimeRoot, 'learner-state'),
    KIANOS_CONTROL_DIR: path.join(runtimeRoot, 'control'),
    KIANOS_CONTROL_REPO_DIR: path.join(runtimeRoot, 'control-repo'),
    KIANOS_PACKET_REPO_DIR: path.join(runtimeRoot, 'packet-repo'),
    KIANOS_EXTERNAL_READING_DIR: path.join(runtimeRoot, 'external-reading'),
    KIANOS_ENGLISH_GENERATED_DIR: path.join(runtimeRoot, 'english-generated')
  };
  for (const [name, value] of Object.entries(isolatedDefaults)) {
    if (!String(process.env[name] || '').trim()) process.env[name] = value;
  }

  // Avoid background Git/network relay activity in an ordinary QA preview.
  // Tests that intentionally exercise a relay already provide an explicit
  // source/config and therefore keep that capability enabled.
  if (!explicitControlRelay) process.env.KIANOS_CONTROL_ENABLED = '0';
  if (!explicitPacketRelay) process.env.KIANOS_PACKET_RELAY_ENABLED = '0';

  if (generatedRoot) {
    process.once('exit', () => {
      try { fs.rmSync(runtimeRoot, { recursive: true, force: true }); } catch {}
    });
  }
}

export default defineConfig({
  base: '/',
  output: 'static',
  integrations: [currentClientArtifactsIntegration()],
  trailingSlash: 'always',
  vite: {
    plugins: [canonicalContentDevReload(), privateLearnerBridge(), privateExternalReadingBridge(), privateEnglishGeneratedBridge(), privateControlBridge()],
    define: {
      __KIANOS_RELEASE_SHA__: JSON.stringify(process.env.KIANOS_RELEASE_SHA || '')
    }
  }
});
