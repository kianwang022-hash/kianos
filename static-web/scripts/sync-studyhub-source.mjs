// Offline preflight for the existing private-source/public-shell boundary.
// Build/build:astro call this through kianos-safe-astro-build.mjs. No fetching,
// credential discovery, source export or automatic fixture substitution occurs.
// Private use: KIANOS_STUDYHUB_MODE=private STUDYHUB_SOURCE_DIR=<authorized Git checkout>
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadStudyhub } from '../src/lib/studyhubContent.mjs';

export function prepareStudyhubSource() {
  const library = loadStudyhub();
  return { status: library.available ? 'verified-private' : 'public-unconfigured',
    revision: library.revision || null, documents: library.docs.size };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(prepareStudyhubSource()));
}
