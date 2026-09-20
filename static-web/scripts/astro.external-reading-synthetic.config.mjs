import { defineConfig } from 'astro/config';
import { privateLearnerBridge } from './privateLearnerBridge.mjs';
import { privateExternalReadingBridge } from './privateExternalReadingBridge.mjs';
import { privateControlBridge } from './privateControlBridge.mjs';

export default defineConfig({
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [
      privateLearnerBridge(),
      privateExternalReadingBridge({enforceSourceHashGate:false}),
      privateControlBridge()
    ]
  }
});
