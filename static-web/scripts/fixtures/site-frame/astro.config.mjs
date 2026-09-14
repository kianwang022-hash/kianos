import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  output: 'static', trailingSlash: 'ignore',
  vite: { resolve: { alias: { '@runtime': fileURLToPath(new URL('../../../src', import.meta.url)) } }, server: { fs: { allow: [fileURLToPath(new URL('../../..', import.meta.url))] } } }
});
