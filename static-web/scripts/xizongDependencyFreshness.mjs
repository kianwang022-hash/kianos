import crypto from 'node:crypto';

export const XIZONG_DEPENDENCY_FRESHNESS_SCHEMA =
  'kianos.xizong.dependency_freshness.v1';

export function stableSemanticJson(value) {
  if (value === undefined) return 'null';
  if (Array.isArray(value)) return '[' + value.map(stableSemanticJson).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort()
      .map((key) => JSON.stringify(key) + ':' + stableSemanticJson(value[key]))
      .join(',') + '}';
  }
  return JSON.stringify(value);
}

export function semanticSha256(value) {
  return crypto.createHash('sha256').update(stableSemanticJson(value)).digest('hex');
}

export function textSha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function assertDependencyFreshness({
  scope,
  receipt,
  sourceRevisionSha256,
  consumers
}) {
  if (!receipt) throw new Error('DEPENDENCY_FRESHNESS_MISSING:' + scope);
  if (receipt.schema !== XIZONG_DEPENDENCY_FRESHNESS_SCHEMA) {
    throw new Error('DEPENDENCY_FRESHNESS_SCHEMA:' + scope);
  }
  if (receipt.model !== 'UPSTREAM_SIGNATURE_TO_CONSUMER_RECEIPT') {
    throw new Error('DEPENDENCY_FRESHNESS_MODEL:' + scope);
  }
  if (receipt.source_revision_sha256 !== sourceRevisionSha256) {
    throw new Error('STALE_SOURCE_REVISION:' + scope);
  }
  for (const [id, expected] of Object.entries(consumers)) {
    const actual = receipt.consumers?.[id];
    if (!actual) throw new Error('DEPENDENCY_CONSUMER_MISSING:' + id);
    if (expected.path && actual.path !== expected.path) throw new Error('DEPENDENCY_CONSUMER_PATH:' + id);
    if (expected.mode && actual.mode !== expected.mode) throw new Error('DEPENDENCY_CONSUMER_MODE:' + id);
    if (expected.receiptSha256 && actual.receipt_sha256 !== expected.receiptSha256) {
      throw new Error('STALE_CONSUMER:' + id);
    }
  }
  return true;
}

export function assertReviewedAgainst({ scope, stored, current }) {
  const storedRows = stored && typeof stored === 'object' ? stored : {};
  const currentRows = current && typeof current === 'object' ? current : {};
  const storedKeys = Object.keys(storedRows).sort();
  const currentKeys = Object.keys(currentRows).sort();
  if (stableSemanticJson(storedKeys) !== stableSemanticJson(currentKeys)) {
    throw new Error('REVIEW_WITNESS_SET_DRIFT:' + scope);
  }
  for (const key of currentKeys) {
    if (semanticSha256(storedRows[key]) !== semanticSha256(currentRows[key])) {
      throw new Error('STALE_REVIEW_WITNESS:' + scope + ':' + key);
    }
  }
  return true;
}
