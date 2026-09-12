import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

export const WRITING_VISUAL_SOURCE = 'content/english/source/global_source_truth.v1.json';

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function canonicalVisualAssets(value) {
  if (Array.isArray(value?.images)) return value.images;
  if (Array.isArray(value?.visual_assets)) return value.visual_assets;
  return [];
}

function canonicalVisualField(value) {
  if (Array.isArray(value?.images)) return 'images';
  if (Array.isArray(value?.visual_assets)) return 'visual_assets';
  return null;
}

function collectWritingBTruth(value, out = new Map(), seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return out;
  seen.add(value);

  if (!Array.isArray(value)) {
    const unitId = String(value.fixture_id || value.unit_id || value.set_id || value.id || '');
    if (/^english1-\d{4}-writing-b-main$/.test(unitId)) {
      const current = out.get(unitId);
      if (!current || canonicalVisualAssets(value).length > canonicalVisualAssets(current).length) {
        out.set(unitId, value);
      }
    }
  }

  for (const child of Array.isArray(value) ? value : Object.values(value)) {
    collectWritingBTruth(child, out, seen);
  }
  return out;
}

function canonicalAssetPath(asset) {
  return String(asset?.asset_path || asset?.path || '').trim().replace(/^\/+/, '');
}

function learnerDescriptor(asset) {
  const assetPath = canonicalAssetPath(asset);
  if (!assetPath) return null;
  return {
    asset_path: `/${assetPath}`,
    alt: 'Official Writing exam source image'
  };
}

let cache;

function snapshot() {
  if (cache) return cache;
  const sourcePath = absolute(WRITING_VISUAL_SOURCE);
  if (!fs.existsSync(sourcePath)) {
    cache = { status: 'missing', records: new Map(), issue: `WRITING_VISUAL_SOURCE_MISSING:${WRITING_VISUAL_SOURCE}` };
    return cache;
  }

  try {
    const truth = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    const records = collectWritingBTruth(truth);
    cache = {
      status: records.size === 27 ? 'ready' : 'invalid',
      records,
      issue: records.size === 27 ? '' : `WRITING_VISUAL_SOURCE_COUNT:${records.size}/27`
    };
    return cache;
  } catch (error) {
    cache = {
      status: 'invalid',
      records: new Map(),
      issue: `WRITING_VISUAL_SOURCE_PARSE:${error instanceof Error ? error.message : String(error)}`
    };
    return cache;
  }
}

export function canonicalWritingVisualAssets(objectId) {
  const data = snapshot();
  const row = data.records.get(String(objectId || '')) || null;
  return row ? canonicalVisualAssets(row) : [];
}

export function canonicalWritingVisualField(objectId) {
  const data = snapshot();
  const row = data.records.get(String(objectId || '')) || null;
  return row ? canonicalVisualField(row) : null;
}

export function learnerWritingVisualDescriptors(objectId) {
  return canonicalWritingVisualAssets(objectId)
    .map(learnerDescriptor)
    .filter(Boolean);
}

export function inspectWritingVisualSource() {
  const data = snapshot();
  return {
    status: data.status,
    issue: data.issue,
    recordCount: data.records.size,
    sourcePath: WRITING_VISUAL_SOURCE
  };
}
