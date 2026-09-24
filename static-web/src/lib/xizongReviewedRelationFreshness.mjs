import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(Buffer.concat([header, buffer])).digest('hex');
}

export function createXizongReviewedRelationFreshnessResolver({ repoRoot }) {
  const root = path.resolve(repoRoot);
  const ownerCache = new Map();

  function currentOwnerBlob(relativePath) {
    const rel = String(relativePath || '').trim();
    if (!rel) return { status: 'MISSING_PATH', path: rel, blob: null };
    if (ownerCache.has(rel)) return ownerCache.get(rel);

    const absolute = path.resolve(root, rel);
    const insideRepo = absolute === root || absolute.startsWith(root + path.sep);
    if (!insideRepo || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
      const result = { status: 'OWNER_MISSING', path: rel, blob: null };
      ownerCache.set(rel, result);
      return result;
    }

    const result = {
      status: 'CURRENT',
      path: rel,
      blob: gitBlobSha(fs.readFileSync(absolute))
    };
    ownerCache.set(rel, result);
    return result;
  }

  return function resolveReviewedRelationFreshness(row) {
    const provenance = row?.provenance || {};
    const knowledgePath = String(provenance.knowledge_path || row?.knowledgeOwnerPath || '').trim();
    const originalWitness = String(provenance.knowledge_blob_sha || row?.knowledgeBlobSha || '').trim();
    const revalidatedWitness = String(
      provenance.knowledge_revalidated_blob_sha || row?.knowledgeRevalidatedBlobSha || ''
    ).trim();
    const effectiveWitness = revalidatedWitness || originalWitness;
    const current = currentOwnerBlob(knowledgePath);

    let status;
    if (current.status !== 'CURRENT') status = 'OWNER_MISSING';
    else if (!effectiveWitness) status = 'WITNESS_MISSING';
    else if (effectiveWitness === current.blob) status = 'CURRENT';
    else status = 'STALE_REVIEW_WITNESS';

    return {
      status,
      knowledge_path: knowledgePath,
      current_blob_sha: current.blob,
      knowledge_blob_sha: originalWitness || null,
      knowledge_revalidated_blob_sha: revalidatedWitness || null,
      effective_review_witness: effectiveWitness || null
    };
  };
}
