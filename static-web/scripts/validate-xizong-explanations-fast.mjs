#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '../..');
const explanationRoot = path.join(root, 'content/xizong/explanations');
const manifest = JSON.parse(fs.readFileSync(path.join(explanationRoot, 'manifest.json'), 'utf8'));

function fail(message) {
  throw new Error(message);
}

const shards = manifest?.canonical_storage?.shards;
const expectedCount = Number(manifest?.canonical_storage?.approved_explanation_count);
if (!Array.isArray(shards) || !Number.isInteger(expectedCount) || expectedCount < 1) {
  fail('XIZONG_EXPLANATION_MANIFEST_INVALID');
}

const seen = new Set();
const questionCache = new Map();
let count = 0;

for (const shard of shards) {
  const relative = String(shard?.path || '');
  const file = path.join(explanationRoot, relative);
  if (!relative || !fs.existsSync(file)) fail(`XIZONG_EXPLANATION_SHARD_MISSING:${relative}`);
  const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(rows)) fail(`XIZONG_EXPLANATION_SHARD_NOT_ARRAY:${relative}`);
  if (rows.length !== Number(shard.record_count)) {
    fail(`XIZONG_EXPLANATION_COUNT_MISMATCH:${relative}:${rows.length}!=${shard.record_count}`);
  }
  if (rows.length) {
    if (rows[0]?.question_id !== shard.first_question_id) fail(`XIZONG_EXPLANATION_FIRST_ID_MISMATCH:${relative}`);
    if (rows.at(-1)?.question_id !== shard.last_question_id) fail(`XIZONG_EXPLANATION_LAST_ID_MISMATCH:${relative}`);
  }

  for (const row of rows) {
    const qid = String(row?.question_id || '');
    if (!/^xizong-official-\d{4}-n\d{3}$/.test(qid)) fail(`XIZONG_EXPLANATION_ID_INVALID:${qid}`);
    if (seen.has(qid)) fail(`XIZONG_EXPLANATION_DUPLICATE:${qid}`);
    seen.add(qid);
    count += 1;

    if (row.truth_gate !== 'PASS' || row.explanation_status !== 'APPROVED') {
      fail(`XIZONG_EXPLANATION_NOT_APPROVED:${qid}`);
    }
    if (!String(row.exam_target || '').trim() || !String(row.decision_axis || '').trim()) {
      fail(`XIZONG_EXPLANATION_DECISION_EMPTY:${qid}`);
    }
    if (!Array.isArray(row.reasoning_chain) || row.reasoning_chain.length < 1) {
      fail(`XIZONG_EXPLANATION_REASONING_EMPTY:${qid}`);
    }

    const truthPath = String(row?.question_truth_ref?.path || '');
    if (!truthPath.startsWith('content/xizong/questions/shards/')) {
      fail(`XIZONG_EXPLANATION_TRUTH_REF_INVALID:${qid}`);
    }
    let truth = questionCache.get(truthPath);
    if (!truth) {
      const absolute = path.join(root, truthPath);
      if (!fs.existsSync(absolute)) fail(`XIZONG_EXPLANATION_TRUTH_SHARD_MISSING:${qid}`);
      truth = JSON.parse(fs.readFileSync(absolute, 'utf8'));
      questionCache.set(truthPath, truth);
    }
    if (!truth?.[qid] || truth[qid]?.question_id !== qid) {
      fail(`XIZONG_EXPLANATION_TRUTH_ID_MISSING:${qid}`);
    }
  }
}

if (count !== expectedCount) fail(`XIZONG_EXPLANATION_TOTAL_MISMATCH:${count}!=${expectedCount}`);
if (Number(manifest?.coverage?.approved_explanations) !== count) {
  fail(`XIZONG_EXPLANATION_COVERAGE_MISMATCH:${manifest?.coverage?.approved_explanations}!=${count}`);
}

console.log(JSON.stringify({
  status: 'PASS',
  explanation_count: count,
  shard_count: shards.length,
  question_truth_shards_read: questionCache.size
}));
