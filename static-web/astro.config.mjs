import { defineConfig } from 'astro/config';
import { privateLearnerBridge } from './scripts/privateLearnerBridge.mjs';

export default defineConfig({
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [privateLearnerBridge()]
  }
});
