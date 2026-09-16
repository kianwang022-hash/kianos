import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(webRoot, '..');

const ownerRoot = path.join(repoRoot, 'content/xizong/question-relations');
const shardRoot = path.join(ownerRoot, 'shards');
const manifestPath = path.join(ownerRoot, 'manifest.json');
const explanationRoot = path.join(repoRoot, 'content/xizong/explanations/shards');

function walkJson(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile() && entry.name.endsWith('.json')) out.push(absolute);
    }
  };
  walk(root);
  return out.sort();
}

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(header).update(buffer).digest('hex');
}

function qidOrder(questionId) {
  const match = String(questionId).match(/^xizong-official-(\d{4})-n(\d{3})$/);
  if (!match) throw new Error(`XIZONG_RELATION_MANIFEST_INVALID_QID:${questionId}`);
  return Number(match[1]) * 1000 + Number(match[2]);
}

function explanationDecisionIndex() {
  const byId = new Map();
  for (const absolute of walkJson(explanationRoot)) {
    const rows = JSON.parse(fs.readFileSync(absolute, 'utf8'));
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (row?.question_id) byId.set(row.question_id, row.mapping_decision || null);
    }
  }
  return byId;
}

export function buildExpectedManifest() {
  const current = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const explanations = explanationDecisionIndex();
  const shardEntries = [];
  const reviewedIds = new Set();
  let reviewedRelationCount = 0;

  for (const absolute of walkJson(shardRoot)) {
    const bytes = fs.readFileSync(absolute);
    const rows = JSON.parse(bytes.toString('utf8'));
    if (!Array.isArray(rows)) throw new Error(`XIZONG_RELATION_MANIFEST_SHARD_NOT_ARRAY:${absolute}`);
    if (!rows.length) continue;

    const sorted = [...rows].sort((a, b) => qidOrder(a.question_id) - qidOrder(b.question_id));
    for (const row of sorted) {
      if (row?.review_status !== 'REVIEWED') throw new Error(`XIZONG_RELATION_MANIFEST_NON_REVIEWED:${row?.question_id || absolute}`);
      if (reviewedIds.has(row.question_id)) throw new Error(`XIZONG_RELATION_MANIFEST_DUPLICATE_QID:${row.question_id}`);
      reviewedIds.add(row.question_id);
    }

    const relative = path.relative(ownerRoot, absolute).split(path.sep).join('/');
    shardEntries.push({
      path: relative,
      record_count: sorted.length,
      first_question_id: sorted[0].question_id,
      last_question_id: sorted.at(-1).question_id,
      blob_sha: gitBlobSha(bytes)
    });
    reviewedRelationCount += sorted.length;
  }

  const convertedNeedsReviewCount = [...reviewedIds]
    .filter((questionId) => explanations.get(questionId) === 'NEEDS_CHAT_MAPPING_REVIEW')
    .length;

  current.canonical_storage.reviewed_relation_count = reviewedRelationCount;
  current.canonical_storage.shard_count = shardEntries.length;
  current.canonical_storage.shards = shardEntries;
  current.semantic_boundary.needs_mapping_review_explanations_converted = convertedNeedsReviewCount;
  current.semantic_boundary.inferred_relations = 0;
  current.semantic_boundary.missing_mapping_coverage_blocking = false;
  current.semantic_boundary.review_status_required = 'REVIEWED';

  return current;
}

const expectedText = `${JSON.stringify(buildExpectedManifest())}\n`;
const currentText = fs.readFileSync(manifestPath, 'utf8').trimEnd() + '\n';
const write = process.argv.includes('--write');
const check = process.argv.includes('--check');

if (write) {
  if (expectedText !== currentText) {
    fs.writeFileSync(manifestPath, expectedText);
    console.log(`XIZONG_RELATION_MANIFEST_SYNCED:${manifestPath}`);
  } else {
    console.log('XIZONG_RELATION_MANIFEST_ALREADY_SYNCED');
  }
} else if (check) {
  if (expectedText !== currentText) {
    throw new Error('XIZONG_RELATION_MANIFEST_OUT_OF_SYNC');
  }
  console.log('XIZONG_RELATION_MANIFEST_SYNC_OK');
} else {
  process.stdout.write(expectedText);
}
