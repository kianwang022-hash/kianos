import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const cwd = path.resolve(process.cwd());
const repoRoot = path.basename(cwd) === 'static-web' ? path.resolve(cwd, '..') : cwd;
const learnerRoot = path.join(repoRoot, 'content/xizong/knowledge/learner');
const assetRoot = path.join(repoRoot, 'static-web/src/assets/xizong/source-visuals');
const manifestSuffix = '-source-visuals.json';

const EXPECTED_SCHEMA = 'kianos.xizong.source_visual_bundles.v1';
const EXPECTED_SELECTION = 'SPARSE_HIGH_VALUE_NOT_EXHAUSTIVE';
const EXPECTED_COMPLETENESS = 'PARTIAL_BY_DESIGN_EXTENSIBLE';
const failures = [];

const sha256File = (filePath) => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
const isSha256 = (value) => /^[0-9a-f]{64}$/i.test(String(value || ''));

function safeRelativeAssetPath(value) {
  const normalized = String(value || '').replaceAll('\\', '/').replace(/^\/+/, '');
  return normalized && !normalized.includes('..') && !path.isAbsolute(normalized) ? normalized : '';
}

const manifests = fs.existsSync(learnerRoot)
  ? fs.readdirSync(learnerRoot).filter((name) => name.endsWith(manifestSuffix)).sort()
  : [];

const seenCueIds = new Set();
let bundleCount = 0;
let assetCount = 0;

for (const fileName of manifests) {
  const manifestPath = path.join(learnerRoot, fileName);
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    failures.push(`${fileName}: invalid JSON (${error.message})`);
    continue;
  }

  const systemId = String(manifest?.system_id || '');
  const canonicalId = String(manifest?.canonical_id || '');
  if (manifest?.schema !== EXPECTED_SCHEMA) failures.push(`${fileName}: invalid schema`);
  if (manifest?.status !== 'CURRENT') failures.push(`${fileName}: status must be CURRENT`);
  if (!String(manifest?.authority || '').startsWith('CHAT_APPROVED')) failures.push(`${fileName}: authority must be CHAT_APPROVED*`);
  if (!systemId || !canonicalId) failures.push(`${fileName}: missing System identity`);
  if (manifest?.selection_policy !== EXPECTED_SELECTION) failures.push(`${fileName}: Visual selection must remain sparse/high-value`);
  if (manifest?.completeness !== EXPECTED_COMPLETENESS) failures.push(`${fileName}: content completeness must remain partial/extensible`);

  const cueFileName = `${canonicalId.toLowerCase()}-${systemId}-learning-cues.json`;
  const cuePath = path.join(learnerRoot, cueFileName);
  let visualCueIds = new Set();
  if (!systemId || !canonicalId || !fs.existsSync(cuePath)) {
    failures.push(`${fileName}: matching Current learning-cues owner missing (${cueFileName})`);
  } else {
    try {
      const cues = JSON.parse(fs.readFileSync(cuePath, 'utf8'));
      if (cues?.status !== 'CURRENT' || !String(cues?.authority || '').startsWith('CHAT_APPROVED')) {
        failures.push(`${fileName}: matching learning-cues owner is not Current/approved`);
      }
      if (cues?.system_id !== systemId || cues?.canonical_id !== canonicalId) failures.push(`${fileName}: manifest / learning-cues identity mismatch`);
      visualCueIds = new Set((Array.isArray(cues?.visual_bindings) ? cues.visual_bindings : []).map((row) => String(row?.id || '')).filter(Boolean));
    } catch (error) {
      failures.push(`${fileName}: cannot read matching learning-cues owner (${error.message})`);
    }
  }

  for (const bundle of Array.isArray(manifest?.bundles) ? manifest.bundles : []) {
    bundleCount += 1;
    const cueId = String(bundle?.cue_id || '');
    if (!cueId) {
      failures.push(`${fileName}: bundle missing cue_id`);
      continue;
    }
    if (!visualCueIds.has(cueId)) failures.push(`${fileName}: bundle references unknown Visual cue ${cueId}`);
    if (seenCueIds.has(cueId)) failures.push(`${fileName}: duplicate Visual cue ownership ${cueId}`);
    seenCueIds.add(cueId);

    if (!isSha256(bundle?.source_sha256)) failures.push(`${cueId}: source_sha256 missing/invalid`);
    if (bundle?.completeness_policy !== 'FAIL_CLOSED_IF_REQUIRED_ASSET_MISSING') failures.push(`${cueId}: referenced-asset completeness policy must fail closed`);

    const assets = Array.isArray(bundle?.assets) ? bundle.assets : [];
    if (!assets.length) failures.push(`${cueId}: bundle must contain at least one reviewed asset`);

    for (const asset of assets) {
      assetCount += 1;
      const relativeAsset = safeRelativeAssetPath(asset?.asset_path);
      if (!relativeAsset) {
        failures.push(`${cueId}: unsafe or missing asset_path`);
        continue;
      }

      const absoluteAsset = path.resolve(assetRoot, relativeAsset);
      if (!absoluteAsset.startsWith(`${path.resolve(assetRoot)}${path.sep}`)) {
        failures.push(`${cueId}: asset path escapes source-visual root (${relativeAsset})`);
        continue;
      }
      if (!fs.existsSync(absoluteAsset)) {
        failures.push(`${cueId}: missing asset ${relativeAsset}`);
        continue;
      }

      if (!String(asset?.source_object_id || '').trim()) failures.push(`${cueId}: ${relativeAsset} missing Source Object identity`);
      if (!(Number(asset?.source_page) > 0)) failures.push(`${cueId}: ${relativeAsset} missing source_page`);
      if (!String(asset?.usage_label || '').trim()) failures.push(`${cueId}: ${relativeAsset} missing usage_label`);
      if (!String(asset?.alt || '').trim()) failures.push(`${cueId}: ${relativeAsset} missing alt text`);

      const expectedDerivedSha = String(asset?.derived_asset_sha256 || '');
      if (!isSha256(expectedDerivedSha)) {
        failures.push(`${cueId}: ${relativeAsset} missing/invalid derived asset SHA`);
      } else if (sha256File(absoluteAsset) !== expectedDerivedSha.toLowerCase()) {
        failures.push(`${cueId}: derived asset SHA drift ${relativeAsset}`);
      }

      if (asset?.source_crop_sha256 && !isSha256(asset.source_crop_sha256)) failures.push(`${cueId}: ${relativeAsset} invalid source_crop_sha256`);
    }
  }
}

if (failures.length) {
  console.error('Xizong source visual validation FAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'PASS',
  manifests: manifests.length,
  bundles: bundleCount,
  assets: assetCount,
  completeness: 'SPARSE_OPTIONAL_CONTENT_ALLOWED'
}, null, 2));
console.log('No manifest is also legal: Visual content availability is not learner progress or learner debt.');
