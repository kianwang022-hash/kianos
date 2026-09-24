import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, '..');
const repoRoot = process.env.KIANOS_REPO_ROOT ? path.resolve(process.env.KIANOS_REPO_ROOT) : path.resolve(webRoot, '..');
const relationRoot = path.join(repoRoot, 'content/xizong/question-relations');
const manifest = JSON.parse(fs.readFileSync(path.join(relationRoot, 'manifest.json'), 'utf8'));

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(Buffer.concat([header, buffer])).digest('hex');
}

const ownerCache = new Map();
function currentOwnerBlob(relativePath) {
  const rel = String(relativePath || '').trim();
  if (!rel) return { status: 'MISSING_PATH', path: rel, blob: null };
  if (ownerCache.has(rel)) return ownerCache.get(rel);
  const absolute = path.join(repoRoot, rel);
  if (!absolute.startsWith(repoRoot + path.sep) || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    const result = { status: 'OWNER_MISSING', path: rel, blob: null };
    ownerCache.set(rel, result);
    return result;
  }
  const buffer = fs.readFileSync(absolute);
  const result = { status: 'CURRENT', path: rel, blob: gitBlobSha(buffer) };
  ownerCache.set(rel, result);
  return result;
}

const rows = [];
for (const shard of manifest?.canonical_storage?.shards || []) {
  const shardPath = path.join(relationRoot, String(shard.path || ''));
  if (!fs.existsSync(shardPath)) throw new Error(`XIZONG_RELATION_FRESHNESS_SHARD_MISSING:${shard.path}`);
  const values = JSON.parse(fs.readFileSync(shardPath, 'utf8'));
  if (!Array.isArray(values)) throw new Error(`XIZONG_RELATION_FRESHNESS_SHARD_INVALID:${shard.path}`);
  rows.push(...values);
}

const reportRows = [];
const byOwner = new Map();
const counts = { current: 0, stale: 0, owner_missing: 0, witness_missing: 0, total: rows.length };

for (const row of rows) {
  const qid = String(row?.question_id || '');
  const ownerPath = String(row?.provenance?.knowledge_path || '');
  const originalWitness = String(row?.provenance?.knowledge_blob_sha || '');
  const revalidatedWitness = String(row?.provenance?.knowledge_revalidated_blob_sha || '');
  const effectiveWitness = revalidatedWitness || originalWitness;
  const current = currentOwnerBlob(ownerPath);
  let status;
  if (current.status !== 'CURRENT') status = 'OWNER_MISSING';
  else if (!effectiveWitness) status = 'WITNESS_MISSING';
  else if (effectiveWitness === current.blob) status = 'CURRENT';
  else status = 'STALE_REVIEW_WITNESS';

  if (status === 'CURRENT') counts.current += 1;
  else if (status === 'STALE_REVIEW_WITNESS') counts.stale += 1;
  else if (status === 'OWNER_MISSING') counts.owner_missing += 1;
  else counts.witness_missing += 1;

  const bucket = byOwner.get(ownerPath) || { owner_path: ownerPath, current_blob_sha: current.blob, current: 0, stale: 0, owner_missing: 0, witness_missing: 0, sample_question_ids: [] };
  if (status === 'CURRENT') bucket.current += 1;
  else if (status === 'STALE_REVIEW_WITNESS') bucket.stale += 1;
  else if (status === 'OWNER_MISSING') bucket.owner_missing += 1;
  else bucket.witness_missing += 1;
  if (status !== 'CURRENT' && bucket.sample_question_ids.length < 12) bucket.sample_question_ids.push(qid);
  byOwner.set(ownerPath, bucket);

  if (status !== 'CURRENT') reportRows.push({
    question_id: qid,
    status,
    knowledge_path: ownerPath,
    current_blob_sha: current.blob,
    knowledge_blob_sha: originalWitness || null,
    knowledge_revalidated_blob_sha: revalidatedWitness || null,
    effective_review_witness: effectiveWitness || null
  });
}

const owners = [...byOwner.values()].sort((a, b) =>
  (b.stale + b.owner_missing + b.witness_missing) - (a.stale + a.owner_missing + a.witness_missing)
);

const report = {
  schema: 'kianos.xizong.reviewed_relation_freshness.v1',
  rule: 'stable identity != current revision != reviewed-against witness',
  counts,
  owner_count: owners.length,
  affected_owner_count: owners.filter(x => x.stale || x.owner_missing || x.witness_missing).length,
  owners,
  stale_rows: reportRows
};

const outArg = process.argv.indexOf('--out');
if (outArg >= 0) {
  const output = path.resolve(webRoot, process.argv[outArg + 1]);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
}

console.log(JSON.stringify({
  schema: report.schema,
  counts: report.counts,
  owner_count: report.owner_count,
  affected_owner_count: report.affected_owner_count,
  top_affected_owners: owners.filter(x => x.stale || x.owner_missing || x.witness_missing).slice(0, 20)
}, null, 2));

if (process.argv.includes('--strict') && (counts.stale || counts.owner_missing || counts.witness_missing)) {
  throw new Error(`XIZONG_REVIEWED_RELATION_FRESHNESS_FAIL:stale=${counts.stale}:owner_missing=${counts.owner_missing}:witness_missing=${counts.witness_missing}`);
}