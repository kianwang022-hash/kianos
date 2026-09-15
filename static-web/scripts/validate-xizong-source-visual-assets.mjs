import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const staticRoot = process.cwd();
const repoRoot = path.resolve(staticRoot, '..');
const learnerRoot = path.join(repoRoot, 'content/xizong/knowledge/learner');
const assetRoot = path.join(staticRoot, 'src/assets/xizong/source-visuals');
const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const fail = (message) => { throw new Error(`XIZONG_SOURCE_VISUAL_VALIDATION_FAIL:${message}`); };
const isSha = (value) => /^[0-9a-f]{64}$/i.test(String(value || ''));

const files = fs.existsSync(learnerRoot)
  ? fs.readdirSync(learnerRoot).filter((name) => name.endsWith('-source-visuals.json')).sort()
  : [];
if (!files.length) fail('NO_CURRENT_REGISTRY');

const globalCueIds = new Set();
let registryCount = 0;
let bundleCount = 0;
let assetCount = 0;

for (const file of files) {
  const registry = JSON.parse(fs.readFileSync(path.join(learnerRoot, file), 'utf8'));
  if (registry?.status !== 'CURRENT') fail(`${file}:STATUS`);
  if (!String(registry?.authority || '').startsWith('CHAT_REVIEWED')) fail(`${file}:AUTHORITY`);
  if (!registry?.system_id || !registry?.canonical_id) fail(`${file}:IDENTITY`);
  const cuePath = path.join(repoRoot, String(registry?.learning_cues || ''));
  if (!fs.existsSync(cuePath)) fail(`${file}:LEARNING_CUES_MISSING`);
  const cues = JSON.parse(fs.readFileSync(cuePath, 'utf8'));
  const visualRows = Array.isArray(cues?.visual_bindings) ? cues.visual_bindings : [];
  const visualCueIds = new Set(visualRows.map((row) => row?.id).filter(Boolean));
  const registryCueIds = new Set();

  for (const bundle of registry?.bundles || []) {
    const cueId = String(bundle?.cue_id || '');
    if (!cueId || !visualCueIds.has(cueId)) fail(`${file}:UNKNOWN_CUE:${cueId}`);
    if (registryCueIds.has(cueId) || globalCueIds.has(cueId)) fail(`${file}:DUPLICATE_CUE:${cueId}`);
    registryCueIds.add(cueId);
    globalCueIds.add(cueId);
    bundleCount += 1;
    if (!isSha(bundle?.source_sha256)) fail(`${cueId}:SOURCE_SHA`);
    if (bundle?.completeness_policy !== 'FAIL_CLOSED_IF_REQUIRED_ASSET_MISSING') fail(`${cueId}:COMPLETENESS_POLICY`);
    const assets = Array.isArray(bundle?.assets) ? bundle.assets : [];
    if (!assets.length) fail(`${cueId}:EMPTY_BUNDLE`);
    for (const asset of assets) {
      const rel = String(asset?.asset_path || '');
      if (!rel || rel.includes('..') || path.isAbsolute(rel)) fail(`${cueId}:ASSET_PATH:${rel}`);
      const abs = path.join(assetRoot, rel);
      if (!fs.existsSync(abs)) fail(`${cueId}:ASSET_MISSING:${rel}`);
      if (!asset?.source_object_id) fail(`${cueId}:SOURCE_OBJECT_ID:${rel}`);
      if (!(Number(asset?.source_page) > 0)) fail(`${cueId}:SOURCE_PAGE:${rel}`);
      if (!asset?.usage_label || !asset?.alt) fail(`${cueId}:ACCESSIBILITY_LABEL:${rel}`);
      if (!isSha(asset?.derived_asset_sha256)) fail(`${cueId}:DERIVED_SHA_DECLARATION:${rel}`);
      const actual = sha256(fs.readFileSync(abs));
      if (actual !== asset.derived_asset_sha256) fail(`${cueId}:DERIVED_SHA_DRIFT:${rel}`);
      if (asset?.source_crop_sha256 && !isSha(asset.source_crop_sha256)) fail(`${cueId}:SOURCE_CROP_SHA:${rel}`);
      assetCount += 1;
    }
  }

  if (registry?.coverage_policy === 'ALL_CURRENT_VISUAL_CUES_HAVE_REVIEWED_BUNDLE') {
    const missing = [...visualCueIds].filter((id) => !registryCueIds.has(id));
    const extra = [...registryCueIds].filter((id) => !visualCueIds.has(id));
    if (missing.length || extra.length) fail(`${file}:FULL_COVERAGE:missing=${missing.join(',')}:extra=${extra.join(',')}`);
  }
  registryCount += 1;
}

console.log(JSON.stringify({
  status: 'PASS',
  registries: registryCount,
  bundles: bundleCount,
  assets: assetCount,
  policy: 'SPARSE_CONTENT_ALLOWED_UNLESS_REGISTRY_EXPLICITLY_REQUIRES_FULL_CUE_COVERAGE'
}, null, 2));
