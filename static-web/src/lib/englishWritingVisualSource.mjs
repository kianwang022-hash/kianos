import crypto from 'node:crypto';
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

function expectedSha256(asset) {
  return String(asset?.asset_sha256 || asset?.sha256 || '').trim().toLowerCase();
}

function expectedBytes(asset) {
  const value = Number(asset?.bytes);
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function inspectAsset(asset) {
  const assetPath = canonicalAssetPath(asset);
  const expectedSha = expectedSha256(asset);
  const bytes = expectedBytes(asset);
  const publicPath = assetPath ? path.join(repoRoot, 'static-web/public', assetPath) : '';
  const exists = Boolean(publicPath) && fs.existsSync(publicPath);
  let actualBytes = null;
  let actualSha256 = '';

  if (exists) {
    const buffer = fs.readFileSync(publicPath);
    actualBytes = buffer.length;
    actualSha256 = sha256(buffer);
  }

  const metadataComplete = Boolean(assetPath)
    && /^[a-f0-9]{64}$/.test(expectedSha)
    && bytes !== null;
  const exact = metadataComplete
    && exists
    && actualBytes === bytes
    && actualSha256 === expectedSha;

  return {
    assetPath,
    publicPath: assetPath ? `static-web/public/${assetPath}` : '',
    expectedBytes: bytes,
    expectedSha256: expectedSha,
    exists,
    actualBytes,
    actualSha256,
    metadataComplete,
    exact
  };
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
    cache = {
      status: 'missing',
      mappingReady: false,
      binaryReady: false,
      records: new Map(),
      assets: [],
      issue: `WRITING_VISUAL_SOURCE_MISSING:${WRITING_VISUAL_SOURCE}`
    };
    return cache;
  }

  try {
    const truth = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    const records = collectWritingBTruth(truth);
    const assets = [];
    let mappingReady = records.size === 27;

    for (let year = 2000; year <= 2026; year += 1) {
      const objectId = `english1-${year}-writing-b-main`;
      const row = records.get(objectId);
      const visuals = row ? canonicalVisualAssets(row) : [];
      if (!row || !visuals.length) mappingReady = false;
      for (const asset of visuals) {
        const inspection = inspectAsset(asset);
        if (!inspection.metadataComplete) mappingReady = false;
        assets.push({ objectId, year, ...inspection });
      }
    }

    const binaryReady = mappingReady && assets.length > 0 && assets.every((asset) => asset.exact);
    const status = !mappingReady ? 'invalid' : binaryReady ? 'ready' : 'binary_blocked';
    const issue = !mappingReady
      ? `WRITING_VISUAL_MAPPING_CLOSURE:${records.size}/27`
      : binaryReady
        ? ''
        : `WRITING_VISUAL_BINARY_CLOSURE:${assets.filter((asset) => asset.exact).length}/${assets.length}`;

    cache = { status, mappingReady, binaryReady, records, assets, issue };
    return cache;
  } catch (error) {
    cache = {
      status: 'invalid',
      mappingReady: false,
      binaryReady: false,
      records: new Map(),
      assets: [],
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
    mappingReady: data.mappingReady,
    binaryReady: data.binaryReady,
    recordCount: data.records.size,
    assetCount: data.assets.length,
    exactAssetCount: data.assets.filter((asset) => asset.exact).length,
    sourcePath: WRITING_VISUAL_SOURCE,
    assets: data.assets.map((asset) => ({ ...asset }))
  };
}
