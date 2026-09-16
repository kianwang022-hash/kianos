import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(webRoot, '..');

const ownerRoot = path.join(repoRoot, 'content/xizong/question-relations');
const pendingRoot = path.join(ownerRoot, 'pending-reviewed-batches');
const manifestPath = path.join(ownerRoot, 'manifest.json');
const continuationPath = path.join(ownerRoot, 'continuation.json');
const qidPattern = /^xizong-official-(\d{4})-n(\d{3})$/;

function pad3(value) { return String(value).padStart(3, '0'); }
function shardRelativePath(questionId) {
  const match = String(questionId).match(qidPattern);
  if (!match) throw new Error(`XIZONG_REVIEWED_BATCH_INVALID_QID:${questionId}`);
  const year = match[1];
  const number = Number(match[2]);
  const start = Math.floor((number - 1) / 25) * 25 + 1;
  return `shards/${year}/q${pad3(start)}-${pad3(start + 24)}.json`;
}
function qidOrder(questionId) {
  const match = String(questionId).match(qidPattern);
  if (!match) throw new Error(`XIZONG_REVIEWED_BATCH_INVALID_QID:${questionId}`);
  return Number(match[1]) * 1000 + Number(match[2]);
}
function loadJson(absolutePath) { return JSON.parse(fs.readFileSync(absolutePath, 'utf8')); }
function validateRow(row, batchPath) {
  const qid = String(row?.question_id || '');
  if (!qidPattern.test(qid)) throw new Error(`XIZONG_REVIEWED_BATCH_INVALID_QID:${batchPath}:${qid}`);
  if (row?.review_status !== 'REVIEWED') throw new Error(`XIZONG_REVIEWED_BATCH_NOT_REVIEWED:${batchPath}:${qid}`);
  if (row?.review?.semantic_owner !== 'Chat') throw new Error(`XIZONG_REVIEWED_BATCH_OWNER_NOT_CHAT:${batchPath}:${qid}`);
  if (!String(row?.review?.basis || '').trim()) throw new Error(`XIZONG_REVIEWED_BATCH_MISSING_BASIS:${batchPath}:${qid}`);
  for (const field of ['question_truth_path', 'question_truth_blob_sha', 'knowledge_path', 'knowledge_blob_sha']) {
    if (!String(row?.provenance?.[field] || '').trim()) throw new Error(`XIZONG_REVIEWED_BATCH_MISSING_${field.toUpperCase()}:${batchPath}:${qid}`);
  }
  return qid;
}
function pendingFiles() {
  if (!fs.existsSync(pendingRoot)) return [];
  return fs.readdirSync(pendingRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(pendingRoot, entry.name))
    .sort();
}
function advanceContinuation(beforeCount, addedQuestionIds) {
  if (!fs.existsSync(continuationPath)) return;
  const continuation = loadJson(continuationPath);
  const sortedIds = [...addedQuestionIds].sort((a, b) => qidOrder(a) - qidOrder(b));
  continuation.last_growth = {
    date: new Date().toISOString().slice(0, 10),
    reviewed_relation_count_before: beforeCount,
    reviewed_relation_count_after: beforeCount + sortedIds.length,
    added_question_ids: sortedIds,
    notes: [
      `Materializer advanced the C2 cursor automatically from ${beforeCount} to ${beforeCount + sortedIds.length}; no post-materialization human cursor commit is required.`,
      'Only explicit Chat-reviewed exact-owner rows were materialized; semantic details remain in each relation review.basis and provenance.',
      'Missing mappings, source-conflicted questions, framework-only matches and incompletely owned details remain legal absences.'
    ]
  };
  fs.writeFileSync(continuationPath, `${JSON.stringify(continuation, null, 2)}\n`);
  console.log(`XIZONG_REVIEWED_BATCH_CONTINUATION_ADVANCED:${beforeCount}->${beforeCount + sortedIds.length}`);
}

const files = pendingFiles();
if (!files.length) {
  console.log('XIZONG_REVIEWED_BATCHES_NONE');
  process.exit(0);
}

const beforeCount = fs.existsSync(manifestPath)
  ? Number(loadJson(manifestPath)?.canonical_storage?.reviewed_relation_count || 0)
  : 0;
const grouped = new Map();
const seenPending = new Set();
for (const batchPath of files) {
  const rows = loadJson(batchPath);
  if (!Array.isArray(rows) || !rows.length) throw new Error(`XIZONG_REVIEWED_BATCH_EMPTY_OR_NOT_ARRAY:${batchPath}`);
  for (const row of rows) {
    const qid = validateRow(row, batchPath);
    if (seenPending.has(qid)) throw new Error(`XIZONG_REVIEWED_BATCH_DUPLICATE_PENDING_QID:${qid}`);
    seenPending.add(qid);
    const relativeShard = shardRelativePath(qid);
    if (!grouped.has(relativeShard)) grouped.set(relativeShard, []);
    grouped.get(relativeShard).push(row);
  }
}

for (const [relativeShard, incoming] of grouped) {
  const absoluteShard = path.join(ownerRoot, relativeShard);
  fs.mkdirSync(path.dirname(absoluteShard), { recursive: true });
  const existing = fs.existsSync(absoluteShard) ? loadJson(absoluteShard) : [];
  if (!Array.isArray(existing)) throw new Error(`XIZONG_REVIEWED_BATCH_TARGET_NOT_ARRAY:${relativeShard}`);
  const existingIds = new Set(existing.map((row) => row.question_id));
  for (const row of incoming) {
    if (existingIds.has(row.question_id)) throw new Error(`XIZONG_REVIEWED_BATCH_ALREADY_CANONICAL:${row.question_id}`);
    existing.push(row);
    existingIds.add(row.question_id);
  }
  existing.sort((a, b) => qidOrder(a.question_id) - qidOrder(b.question_id));
  fs.writeFileSync(absoluteShard, `${JSON.stringify(existing)}\n`);
  console.log(`XIZONG_REVIEWED_BATCH_MATERIALIZED:${relativeShard}:added=${incoming.length}:total=${existing.length}`);
}

advanceContinuation(beforeCount, seenPending);

for (const batchPath of files) fs.unlinkSync(batchPath);
try {
  if (fs.existsSync(pendingRoot) && fs.readdirSync(pendingRoot).length === 0) fs.rmdirSync(pendingRoot);
} catch {}

console.log(`XIZONG_REVIEWED_BATCHES_APPLIED:files=${files.length}:rows=${seenPending.size}:before=${beforeCount}:after=${beforeCount + seenPending.size}`);
