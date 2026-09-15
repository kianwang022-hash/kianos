import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const REGISTRY_ROOT = path.join(repoRoot, 'content/xizong/knowledge/learner');
const ASSET_GLOB_PREFIX = '../assets/xizong/source-visuals/';
const assetUrls = import.meta.glob('../assets/xizong/source-visuals/**/*.{webp,png}', {
  eager: true,
  query: '?url',
  import: 'default'
});

function loadCurrentRegistries() {
  if (!fs.existsSync(REGISTRY_ROOT)) return [];
  return fs.readdirSync(REGISTRY_ROOT)
    .filter((name) => name.endsWith('-source-visuals.json'))
    .sort()
    .map((name) => {
      const sourcePath = path.join(REGISTRY_ROOT, name);
      const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
      if (raw?.status !== 'CURRENT' || !String(raw?.authority || '').startsWith('CHAT_REVIEWED')) {
        throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_REGISTRY_INVALID:${name}`);
      }
      return { name, raw };
    });
}

function resolveAsset(asset, cueId) {
  const assetPath = String(asset?.asset_path || '').replace(/^\/+/, '');
  if (!assetPath || assetPath.includes('..')) {
    throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_ASSET_PATH_INVALID:${cueId}`);
  }
  const key = `${ASSET_GLOB_PREFIX}${assetPath}`;
  const src = assetUrls[key];
  if (!src) {
    throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_ASSET_MISSING:${cueId}:${assetPath}`);
  }
  return Object.freeze({
    sourceObjectId: asset?.source_object_id || '',
    sourcePage: Number(asset?.source_page || 0),
    usageLabel: asset?.usage_label || '',
    alt: asset?.alt || asset?.usage_label || '原讲义裁图',
    src,
    width: Number(asset?.width || 0) || undefined,
    height: Number(asset?.height || 0) || undefined,
    sourceCropSha256: asset?.source_crop_sha256 || '',
    derivedAssetSha256: asset?.derived_asset_sha256 || ''
  });
}

function compileBundles() {
  const compiled = {};
  for (const { name, raw } of loadCurrentRegistries()) {
    for (const row of raw?.bundles || []) {
      const cueId = String(row?.cue_id || '');
      if (!cueId) throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_CUE_ID_MISSING:${name}`);
      if (compiled[cueId]) throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_CUE_DUPLICATE:${cueId}`);
      const assets = (Array.isArray(row?.assets) ? row.assets : []).map((asset) => resolveAsset(asset, cueId));
      if (!assets.length) throw new Error(`CURRENT_XIZONG_SOURCE_VISUAL_BUNDLE_EMPTY:${cueId}`);
      compiled[cueId] = Object.freeze({
        sourceSha256: row?.source_sha256 || '',
        completenessPolicy: row?.completeness_policy || 'FAIL_CLOSED_IF_REQUIRED_ASSET_MISSING',
        assets: Object.freeze(assets)
      });
    }
  }
  return Object.freeze(compiled);
}

const bundles = compileBundles();

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
