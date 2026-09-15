import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const MANIFEST_ROOT = 'content/xizong/knowledge/learner';
const ASSET_ROOT = 'static-web/src/assets/xizong/source-visuals';
const MANIFEST_SUFFIX = '-source-visuals.json';

// Vite owns URL emission; the manifest owns which assets mean what.
// New A1/A2/A3 content packs can add assets/metadata without editing this renderer bridge.
const assetUrls = import.meta.glob('../assets/xizong/source-visuals/**/*.{webp,png,jpg,jpeg}', {
  eager: true,
  query: '?url',
  import: 'default'
});

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function safeAssetPath(value, cueId) {
  const normalized = String(value || '').replaceAll('\\', '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) {
    throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_ASSET_PATH_INVALID:${cueId}`);
  }
  return normalized;
}

function sha256File(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(absolute(relativePath))).digest('hex');
}

function normalizeAsset(asset, cueId) {
  const assetPath = safeAssetPath(asset?.asset_path, cueId);
  const viteKey = `../assets/xizong/source-visuals/${assetPath}`;
  const src = assetUrls[viteKey];
  if (!src) {
    throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_ASSET_MISSING:${cueId}:${assetPath}`);
  }

  const derivedAssetSha256 = String(asset?.derived_asset_sha256 || '');
  if (!derivedAssetSha256) {
    throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_ASSET_SHA_MISSING:${cueId}:${assetPath}`);
  }
  const actualSha = sha256File(`${ASSET_ROOT}/${assetPath}`);
  if (actualSha !== derivedAssetSha256) {
    throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_ASSET_SHA_MISMATCH:${cueId}:${assetPath}`);
  }

  const sourceObjectId = String(asset?.source_object_id || '');
  if (!sourceObjectId) {
    throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_OBJECT_MISSING:${cueId}:${assetPath}`);
  }

  return Object.freeze({
    sourceObjectId,
    sourcePage: Number(asset?.source_page || 0) || null,
    usageRole: String(asset?.usage_role || ''),
    usageLabel: String(asset?.usage_label || ''),
    alt: String(asset?.alt || ''),
    src,
    width: Number(asset?.width || 0) || null,
    height: Number(asset?.height || 0) || null,
    sourceCropSha256: String(asset?.source_crop_sha256 || ''),
    derivedAssetSha256
  });
}

function loadBundles() {
  const root = absolute(MANIFEST_ROOT);
  if (!fs.existsSync(root)) return Object.freeze({});

  const files = fs.readdirSync(root)
    .filter((name) => name.endsWith(MANIFEST_SUFFIX))
    .sort();

  const bundles = {};
  for (const fileName of files) {
    const manifestPath = `${MANIFEST_ROOT}/${fileName}`;
    const raw = JSON.parse(fs.readFileSync(absolute(manifestPath), 'utf8'));
    if (raw?.schema !== 'kianos.xizong.source_visual_bundles.v1') {
      throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_MANIFEST_SCHEMA_INVALID:${fileName}`);
    }
    if (raw?.status !== 'CURRENT' || !String(raw?.authority || '').startsWith('CHAT_APPROVED')) {
      throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_MANIFEST_AUTHORITY_INVALID:${fileName}`);
    }

    for (const bundle of Array.isArray(raw?.bundles) ? raw.bundles : []) {
      const cueId = String(bundle?.cue_id || '');
      if (!cueId) throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_CUE_ID_MISSING:${fileName}`);
      if (bundles[cueId]) throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_CUE_DUPLICATE:${cueId}`);

      const assets = (Array.isArray(bundle?.assets) ? bundle.assets : []).map((asset) => normalizeAsset(asset, cueId));
      if (!assets.length) throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_BUNDLE_EMPTY:${cueId}`);

      bundles[cueId] = Object.freeze({
        sourceSha256: String(bundle?.source_sha256 || ''),
        completenessPolicy: String(bundle?.completeness_policy || 'FAIL_CLOSED_IF_REQUIRED_ASSET_MISSING'),
        selectionPolicy: String(raw?.selection_policy || 'SPARSE_HIGH_VALUE_NOT_EXHAUSTIVE'),
        contentCompleteness: String(raw?.completeness || 'PARTIAL_BY_DESIGN_EXTENSIBLE'),
        manifestPath,
        assets: Object.freeze(assets)
      });
    }
  }

  return Object.freeze(bundles);
}

const bundles = loadBundles();

export function sourceVisualBundleForCue(cueId) {
  return bundles[String(cueId || '')] || null;
}

export function attachSourceVisualBundles(rows = []) {
  return (Array.isArray(rows) ? rows : []).map((row) => {
    const bundle = sourceVisualBundleForCue(row?.id);
    if (!bundle) return row;
    return {
      ...row,
      source_visual_bundle: bundle
    };
  });
}
