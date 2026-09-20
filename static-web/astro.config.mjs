import { defineConfig } from 'astro/config';
import { privateLearnerBridge } from './scripts/privateLearnerBridge.mjs';
import { privateExternalReadingBridge } from './scripts/privateExternalReadingBridge.mjs';
import { privateControlBridge } from './scripts/privateControlBridge.mjs';
import { staticJsonPreviewBridge } from './scripts/staticJsonPreviewBridge.mjs';

const learnerBridge = privateLearnerBridge();
const externalReadingBridge = privateExternalReadingBridge();
const controlBridge = privateControlBridge();

const privateRuntimePreviewBridge = {
  name: 'kianos-private-runtime-preview-bridge',
  apply: 'serve',
  configurePreviewServer(server) {
    learnerBridge.configureServer?.(server);
    externalReadingBridge.configureServer?.(server);
    controlBridge.configureServer?.(server);
  }
};

export default defineConfig({
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [
      staticJsonPreviewBridge(),
      privateRuntimePreviewBridge,
      learnerBridge,
      externalReadingBridge,
      controlBridge
    ]
  }
});
