import { defineConfig } from 'astro/config';
import { privateLearnerBridge } from './scripts/privateLearnerBridge.mjs';
import { privateExternalReadingBridge } from './scripts/privateExternalReadingBridge.mjs';

export default defineConfig({
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [privateLearnerBridge(), privateExternalReadingBridge()]
  }
});
