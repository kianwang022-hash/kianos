import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const materializer = path.join(webRoot, 'scripts/apply-xizong-crosswalk-reviewed-batches.mjs');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-xizong-crosswalk-'));
const ownerRoot = path.join(tempRoot, 'content/xizong/question-relations');
const shardRoot = path.join(ownerRoot, 'shards/2099');
const pendingRoot = path.join(ownerRoot, 'pending-reviewed-batches');
const knowledgePath = 'content/xizong/knowledge/test.md';
const knowledgeAbsolute = path.join(tempRoot, knowledgePath);
fs.mkdirSync(shardRoot, { recursive: true });
fs.mkdirSync(pendingRoot, { recursive: true });
fs.mkdirSync(path.dirname(knowledgeAbsolute), { recursive: true });
const knowledgeBody = 'synthetic current knowledge owner\n';
fs.writeFileSync(knowledgeAbsolute, knowledgeBody);
const knowledgeBuffer = Buffer.from(knowledgeBody, 'utf8');
const knowledgeBlobSha = crypto.createHash('sha1')
  .update(Buffer.concat([Buffer.from(`blob ${knowledgeBuffer.length}\\0`, 'utf8'), knowledgeBuffer]))
  .digest('hex');

const existing = [{ question_id: 'xizong-official-2099-n001' }];
fs.writeFileSync(path.join(shardRoot, 'q001-025.json'), `${JSON.stringify(existing)}\n`);
fs.writeFileSync(path.join(ownerRoot, 'manifest.json'), `${JSON.stringify({
  canonical_storage: { reviewed_relation_count: 1 }
})}\n`);
fs.writeFileSync(path.join(ownerRoot, 'continuation.json'), `${JSON.stringify({
  schema: 'kianos.xizong.question_relations.continuation.v2',
  last_growth: { reviewed_relation_count_before: 0, reviewed_relation_count_after: 1 }
}, null, 2)}\n`);
const incoming = [{
  question_id: 'xizong-official-2099-n002',
  system_id: 'test-system',
  block_id: 'test-block',
  primary_kp_id: 'test-kp',
  supporting_kp_ids: [],
  review_status: 'REVIEWED',
  provenance: {
    question_truth_path: 'content/xizong/questions/shards/2099/q001-025.json',
    question_truth_blob_sha: 'question-sha',
    knowledge_path: knowledgePath,
    knowledge_blob_sha: knowledgeBlobSha
  },
  review: {
    semantic_owner: 'Chat',
    basis: 'Synthetic throughput validator row.',
    old_mapping_inherited: false
  }
}];
fs.writeFileSync(path.join(pendingRoot, 'synthetic.json'), `${JSON.stringify(incoming, null, 2)}\n`);

try {
  const run = spawnSync(process.execPath, [materializer], {
    cwd: webRoot,
    env: { ...process.env, KIANOS_REPO_ROOT: tempRoot },
    encoding: 'utf8'
  });
  if (run.status !== 0) throw new Error(`materializer_exit_${run.status}:${run.stderr || run.stdout}`);
  const shard = JSON.parse(fs.readFileSync(path.join(shardRoot, 'q001-025.json'), 'utf8'));
  if (shard.length !== 2 || shard[1]?.question_id !== 'xizong-official-2099-n002') {
    throw new Error('canonical_materialization_failed');
  }
  if (fs.existsSync(pendingRoot)) throw new Error('staging_not_deleted');
  const continuation = JSON.parse(fs.readFileSync(path.join(ownerRoot, 'continuation.json'), 'utf8'));
  const growth = continuation.last_growth;
  if (growth?.reviewed_relation_count_before !== 1 || growth?.reviewed_relation_count_after !== 2) {
    throw new Error('continuation_count_advance_failed');
  }
  if (JSON.stringify(growth?.added_question_ids) !== JSON.stringify(['xizong-official-2099-n002'])) {
    throw new Error('continuation_question_ids_failed');
  }

  fs.mkdirSync(pendingRoot, { recursive: true });
  const staleIncoming = [{
    ...incoming[0],
    question_id: 'xizong-official-2099-n003',
    provenance: { ...incoming[0].provenance, knowledge_blob_sha: 'stale-witness' }
  }];
  fs.writeFileSync(path.join(pendingRoot, 'stale.json'), `${JSON.stringify(staleIncoming, null, 2)}\n`);
  const staleRun = spawnSync(process.execPath, [materializer], {
    cwd: webRoot,
    env: { ...process.env, KIANOS_REPO_ROOT: tempRoot },
    encoding: 'utf8'
  });
  if (staleRun.status === 0 || !String(staleRun.stderr || staleRun.stdout).includes('XIZONG_REVIEWED_BATCH_STALE_KNOWLEDGE_WITNESS')) {
    throw new Error(`stale_witness_not_rejected:${staleRun.stderr || staleRun.stdout}`);
  }

  console.log('XIZONG_CROSSWALK_THROUGHPUT_OK materialize=PASS continuation=1->2 stale_witness=REJECTED');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
