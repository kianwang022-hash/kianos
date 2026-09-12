import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const repoRoot = process.cwd();
const truthPath = path.join(repoRoot, 'content/english/source/global_source_truth.v1.json');
const years = String(process.env.WRITING_VISUAL_RECOVERY_YEARS || '')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter(Number.isInteger);

if (!years.length) {
  throw new Error('WRITING_VISUAL_RECOVERY_YEARS must contain at least one year');
}

const truth = JSON.parse(fs.readFileSync(truthPath, 'utf8'));

function canonicalVisualAssets(value) {
  if (Array.isArray(value?.images)) return value.images;
  if (Array.isArray(value?.visual_assets)) return value.visual_assets;
  return [];
}

function collectWritingBTruth(value, out = new Map(), seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return out;
  seen.add(value);
  if (!Array.isArray(value)) {
    const unitId = String(value.fixture_id || value.unit_id || value.set_id || value.id || '');
    const match = unitId.match(/^english1-(\d{4})-writing-b-main$/);
    if (match) {
      const year = Number(match[1]);
      const current = out.get(year);
      if (!current || canonicalVisualAssets(value).length > canonicalVisualAssets(current).length) {
        out.set(year, value);
      }
    }
  }
  for (const child of Array.isArray(value) ? value : Object.values(value)) {
    collectWritingBTruth(child, out, seen);
  }
  return out;
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function fetchExact(asset) {
  const sourceUrl = String(asset?.source_url || '').trim();
  if (!/^https:\/\//i.test(sourceUrl)) {
    throw new Error(`No HTTPS source_url for ${asset?.asset_path || 'unknown asset'}`);
  }

  const response = await fetch(sourceUrl, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (KianOS exact-source recovery; GitHub Actions)',
      accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${sourceUrl}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

const records = collectWritingBTruth(truth);
const report = [];

for (const year of years) {
  const row = records.get(year);
  if (!row) throw new Error(`Missing canonical Writing B truth row for ${year}`);
  const assets = canonicalVisualAssets(row);
  if (!assets.length) throw new Error(`Missing canonical visual mapping for ${year}`);

  for (const asset of assets) {
    const assetPath = String(asset?.asset_path || asset?.path || '').replace(/^\/+/, '');
    const expectedSha = String(asset?.asset_sha256 || asset?.sha256 || '').toLowerCase();
    const expectedBytes = Number(asset?.bytes);
    if (!assetPath || !/^[a-f0-9]{64}$/.test(expectedSha) || !Number.isInteger(expectedBytes)) {
      throw new Error(`Incomplete canonical metadata for ${year}: ${assetPath || 'missing path'}`);
    }

    const destination = path.join(repoRoot, 'static-web/public', assetPath);
    let buffer = null;
    let origin = 'existing';
    if (fs.existsSync(destination)) {
      buffer = fs.readFileSync(destination);
    }

    if (!buffer || buffer.length !== expectedBytes || sha256(buffer) !== expectedSha) {
      buffer = await fetchExact(asset);
      origin = 'source_url';
    }

    const actualSha = sha256(buffer);
    if (buffer.length !== expectedBytes) {
      throw new Error(`${year} byte mismatch for ${assetPath}: ${buffer.length} != ${expectedBytes}`);
    }
    if (actualSha !== expectedSha) {
      throw new Error(`${year} SHA256 mismatch for ${assetPath}: ${actualSha} != ${expectedSha}`);
    }

    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, buffer);
    report.push({ year, asset_path: assetPath, bytes: buffer.length, sha256: actualSha, origin });
    console.log(`RECOVERED ${year} ${assetPath} ${buffer.length} ${actualSha} via ${origin}`);
  }
}

const reportPath = process.env.KIANOS_WRITING_VISUAL_RECOVERY_REPORT;
if (reportPath) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify({
    schema: 'kianos.english.writing.visual-source-recovery.v1',
    years,
    assets: report
  }, null, 2)}\n`, 'utf8');
}
