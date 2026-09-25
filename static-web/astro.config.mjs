import { defineConfig } from 'astro/config';
import { privateLearnerBridge } from './scripts/privateLearnerBridge.mjs';
import { privateExternalReadingBridge } from './scripts/privateExternalReadingBridge.mjs';
import { privateControlBridge } from './scripts/privateControlBridge.mjs';

export default defineConfig({
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [privateLearnerBridge(), privateExternalReadingBridge(), privateControlBridge()],
    define: {
      __KIANOS_RELEASE_SHA__: JSON.stringify(process.env.KIANOS_RELEASE_SHA || '')
    }
  }
});
