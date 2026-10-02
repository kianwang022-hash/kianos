// Reproducible, build-time input only. Canonical content stays in StudyHub.
// Both build and build:astro call this through kianos-safe-astro-build.mjs.
// Offline builders may supply STUDYHUB_SOURCE_DIR at the same verified revision.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { STUDYHUB_SOURCE, STUDYHUB_CACHE, loadStudyhub, studyhubDependencies } from '../src/lib/studyhubContent.mjs';

const git = (dir, args) => execFileSync('git', ['-C', dir, ...args], {
  stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', timeout: 120_000,
  env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
});

export function prepareStudyhubSource() {
  const source = process.env.STUDYHUB_SOURCE_DIR || STUDYHUB_CACHE;
  if (process.env.STUDYHUB_SOURCE_DIR || fs.existsSync(source)) {
    // Never overwrite a supplied checkout or silently repair a corrupt cache.
    const library = loadStudyhub(source);
    if (!library.available) throw new Error('STUDYHUB_SOURCE_MISSING: ' + source);
    return { status: 'verified', revision: library.revision, documents: library.docs.size, source };
  }
  const parent = path.dirname(source);
  fs.mkdirSync(parent, { recursive: true });
  const temp = fs.mkdtempSync(path.join(parent, '.prepare-'));
  try {
    git(temp, ['init', '--quiet']);
    git(temp, ['fetch', '--depth=1', STUDYHUB_SOURCE.repository + '.git', STUDYHUB_SOURCE.revision]);
    const files = new Set();
    const queue = ['WORLD_MAP.md'];
    while (queue.length) {
      const file = queue.shift();
      if (files.has(file)) continue;
      const markdown = git(temp, ['show', 'FETCH_HEAD:' + file]);
      files.add(file);
      queue.push(...studyhubDependencies(file, markdown));
    }
    // Materialize only the map's adopted articles and declared Logic dependencies.
    git(temp, ['config', 'core.sparseCheckout', 'true']);
    fs.writeFileSync(path.join(temp, '.git/info/sparse-checkout'), [...files].map(file => '/' + file).join('\n') + '\n');
    git(temp, ['checkout', '--detach', '--quiet', 'FETCH_HEAD']);
    const library = loadStudyhub(temp);
    fs.renameSync(temp, source);
    return { status: 'prepared', revision: library.revision, documents: library.docs.size, source };
  } finally {
    if (fs.existsSync(temp)) fs.rmSync(temp, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(prepareStudyhubSource()));
}
