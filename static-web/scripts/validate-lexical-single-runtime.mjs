import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lexicalRuntimeManifest } from '../src/lib/lexical.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const fail = (message) => { throw new Error('LEXICAL_SINGLE_RUNTIME_FAIL:' + message); };
const read = (relative) => fs.readFileSync(path.join(repoRoot, relative), 'utf8');

const contentManifest = JSON.parse(read('content/lexical/learner/final/manifest.json'));
if (contentManifest.schema !== 'kianos.lexical.final_learner_manifest.v1') fail('content_manifest_schema');
if (contentManifest.object_count !== 7946) fail('content_object_count');

const manifest = lexicalRuntimeManifest();
if (manifest.schema !== 'kianos.lexical.runtime_manifest.v1') fail('runtime_manifest_schema');
if (manifest.object_count !== 7946) fail('runtime_object_count');
if (manifest.shard_size !== 32) fail('runtime_shard_size');
if (!Array.isArray(manifest.shards) || manifest.shards.length !== Math.ceil(7946 / 32)) fail('runtime_shard_count');

let expected = 1;
for (const shard of manifest.shards) {
  if (Number(shard.start) !== expected) fail('runtime_shard_start_' + expected);
  if (Number(shard.end) < Number(shard.start) || Number(shard.end) - Number(shard.start) + 1 > 32) fail('runtime_shard_width_' + shard.start);
  expected = Number(shard.end) + 1;
}
if (expected !== 7947) fail('runtime_shard_coverage');

if (fs.existsSync(path.join(webRoot, 'src/pages/vocabulary/[ordinal].astro'))) fail('per_word_page_still_present');

const runtimePage = read('static-web/src/pages/vocabulary/word/index.astro');
const fragmentPage = read('static-web/src/pages/vocabulary-data/[key].astro');
const runtime = read('static-web/src/components/VocabularyWordRuntime.astro');
const markup = read('static-web/src/components/VocabularyWordMarkup.astro');
const home = read('static-web/src/components/VocabularyHome.astro');
const server = read('static-web/scripts/kianos-static-server.mjs');

if (!runtimePage.includes('data-vocab-runtime-host') || !runtimePage.includes('vocabulary-data/')) fail('runtime_loader_missing');
if (!fragmentPage.includes('VocabularyWordMarkup') || !fragmentPage.includes('lexicalRuntimeManifest')) fail('fragment_projection_missing');
if (!runtime.includes("kianos:vocabulary-root-ready")) fail('runtime_dynamic_init_missing');
if (!markup.includes('data-has-reference={hasReferenceRail') || !markup.includes('portedVocabEvidenceColumn')) fail('content_earned_reference_missing');
if (!home.includes('lexicalWordRuntimeHref')) fail('home_not_using_single_runtime');
if (!server.includes('legacyVocabularyWord') || !server.includes("resolveStatic('/vocabulary/word/'")) fail('legacy_url_compat_missing');

console.log(JSON.stringify({
  pass: true,
  word_runtime_pages: 1,
  final_learner_objects: manifest.object_count,
  shard_size: manifest.shard_size,
  shard_count: manifest.shards.length,
  legacy_word_urls_preserved_by_static_runtime: true
}, null, 2));
