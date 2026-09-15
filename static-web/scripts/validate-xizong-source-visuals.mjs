import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const staticWebRoot = path.resolve(process.cwd());
const repoRoot = path.basename(staticWebRoot) === 'static-web'
  ? path.resolve(staticWebRoot, '..')
  : staticWebRoot;

const MANIFEST_ROOT = path.join(repoRoot, 'content/xizong/knowledge/learner');
const ASSET_ROOT = path.join(repoRoot, 'static-web/src/assets/xizong/source-visuals');
const SUFFIX = '-source-visuals.json';
const EXPECTED_SCHEMA = 'kianos.xizong.source_visual_bundles.v1';
const EXPECTED_SELECTION = 'SPARSE_HIGH_VALUE_NOT_EXHAUSTIVE';
const EXPECTED_COMPLETENESS = 'PARTIAL_BY_DESIGN_EXTENSIBLE';

const sha256 = (filePath) => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
const safeRelativePath = (value) => {
  const normalized = String(value || '').replaceAll('\\', '/').replace(/^\/+/, '');
  return Boolean(normalized) && !normalized.includes('..') && !path.isAbsolute(normalized);
};

const failures = [];
const manifests = fs.existsSync(MANIFEST_ROOT)
  ? fs.readdirSync(MANIFEST_ROOT).filter((name) => name.endsWith(SUFFIX)).sort()
  : [];

if (!manifests.length) failures.push('no source-visual content packs found');

const seenCueIds = new Set();
let bundleCount = 0;
let assetCount = 0;

for (const fileName of manifests) {
  const manifestPath = path.join(MANIFEST_ROOT, fileName);
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    failures.push(`${fileName}: invalid JSON (${error.message})`);
    continue;
  }

  if (manifest.schema !== EXPECTED_SCHEMA) failures.push(`${fileName}: invalid schema`);
  if (manifest.status !== 'CURRENT') failures.push(`${fileName}: status must be CURRENT`);
  if (!String(manifest.authority || '').startsWith('CHAT_APPROVED')) failures.push(`${fileName}: authority must be CHAT_APPROVED*`);
  if (manifest.selection_policy !== EXPECTED_SELECTION) failures.push(`${fileName}: selection policy must stay sparse/high-value`);
  if (manifest.completeness !== EXPECTED_COMPLETENESS) failures.push(`${fileName}: content must remain explicitly partial/extensible`);

  const bundles = Array.isArray(manifest.bundles) ? manifest.bundles : [];
  for (const bundle of bundles) {
    bundleCount += 1;
    const cueId = String(bundle?.cue_id || '');
    if (!cueId) {
      failures.push(`${fileName}: bundle missing cue_id`);
      continue;
    }
    if (seenCueIds.has(cueId)) failures.push(`${fileName}: duplicate cue_id ${cueId}`);
    seenCueIds.add(cueId);

    if (bundle.completeness_policy !== 'FAIL_CLOSED_IF_REQUIRED_ASSET_MISSING') {
      failures.push(`${cueId}: completeness policy must fail closed`);
    }
    if (!String(bundle.source_sha256 || '').match(/^[0-9a-f]{64}$/)) {
      failures.push(`${cueId}: source_sha256 missing/invalid`);
    }

    const assets = Array.isArray(bundle.assets) ? bundle.assets : [];
    if (!assets.length) failures.push(`${cueId}: bundle must contain at least one asset`);
    for (const asset of assets) {
      assetCount += 1;
      const assetPath = String(asset?.asset_path || '');
      if (!safeRelativePath(assetPath)) {
        failures.push(`${cueId}: unsafe asset_path ${assetPath || '<empty>'}`);
        continue;
      }
      const absoluteAsset = path.join(ASSET_ROOT, assetPath);
      if (!absoluteAsset.startsWith(ASSET_ROOT + path.sep)) {
        failures.push(`${cueId}: asset_path escapes source-visual root`);
        continue;
      }
      if (!fs.existsSync(absoluteAsset)) {
        failures.push(`${cueId}: missing asset ${assetPath}`);
        continue;
      }
      if (!String(asset.source_object_id || '')) failures.push(`${cueId}: asset ${assetPath} missing source_object_id`);
      if (!(Number(asset.source_page) > 0)) failures.push(`${cueId}: asset ${assetPath} missing source_page`);
      if (!String(asset.alt || '').trim()) failures.push(`${cueId}: asset ${assetPath} missing alt`);
      if (!String(asset.usage_label || '').trim()) failures.push(`${cueId}: asset ${assetPath} missing usage_label`);

      const expectedSha = String(asset.derived_asset_sha256 || '');
      if (!expectedSha.match(/^[0-9a-f]{64}$/)) {
        failures.push(`${cueId}: asset ${assetPath} missing/invalid derived SHA`);
      } else {
        const actualSha = sha256(absoluteAsset);
        if (actualSha !== expectedSha) failures.push(`${cueId}: asset SHA mismatch ${assetPath}`);
      }
    }
  }
}

if (failures.length) {
  console.error('Xizong source visual validation FAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Xizong source visual validation PASS: ${manifests.length} pack(s), ${bundleCount} bundle(s), ${assetCount} asset reference(s).`);
console.log('Content completeness is intentionally partial; missing optional visuals do not block learning or UI rendering.');
