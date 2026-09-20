import { defineConfig } from 'astro/config';
import { privateLearnerBridge } from './scripts/privateLearnerBridge.mjs';
import { privateExternalReadingBridge } from './scripts/privateExternalReadingBridge.mjs';
import { privateControlBridge } from './scripts/privateControlBridge.mjs';
import { staticJsonPreviewBridge } from './scripts/staticJsonPreviewBridge.mjs';

export default defineConfig({
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [staticJsonPreviewBridge(), privateLearnerBridge(), privateExternalReadingBridge(), privateControlBridge()]
  }
});
