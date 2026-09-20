import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve('..');
const manifestPath = path.join(repoRoot, 'content/politics/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const slots = manifest.future_source_families;

assert.equal(slots?.schema, 'kianos.politics.future-source-slots.v1');
assert.equal(slots?.exam_cycle, '2027');
assert.equal(slots?.authority_rule, 'ONLY_BOUND_HAS_CURRENT_YEAR_AUTHORITY');

const expectedFamilies = ['memory_handbook', 'current_affairs', 'xiao8', 'xiao4'];
const allowedStatuses = ['UNBOUND', 'PARTIAL', 'BOUND', 'STALE', 'REJECTED'];
assert.deepEqual(slots?.allowed_statuses, allowedStatuses);
assert.deepEqual(Object.keys(slots?.families || {}).sort(), [...expectedFamilies].sort());

const hex64 = /^[0-9a-f]{64}$/i;
const hashFile = (absolutePath) => createHash('sha256').update(fs.readFileSync(absolutePath)).digest('hex');

for (const family of expectedFamilies) {
  const row = slots.families[family];
  assert.ok(row && typeof row === 'object' && !Array.isArray(row), family + ': row missing');
  assert.ok(allowedStatuses.includes(row.status), family + ': invalid status');
  assert.equal(typeof row.current_year_authority, 'boolean', family + ': authority flag required');

  if (row.status === 'UNBOUND') {
    assert.equal(row.current_year_authority, false, family + ': UNBOUND cannot have authority');
    for (const key of ['source_path', 'sha256', 'revision_id', 'supersedes_revision_id', 'bound_at', 'status_reason']) {
      assert.equal(row[key], null, family + ': UNBOUND must not carry current-year source metadata: ' + key);
    }
    continue;
  }

  assert.match(String(row.source_path || ''), /^content\/politics\/source\/future\//, family + ': source path must stay under Politics future Source');
  assert.match(String(row.sha256 || ''), hex64, family + ': sha256 required');
  assert.ok(String(row.revision_id || '').trim(), family + ': revision_id required');
  assert.ok(Number.isFinite(Date.parse(String(row.bound_at || ''))), family + ': bound_at must be ISO time');

  const absoluteSource = path.resolve(repoRoot, row.source_path);
  const futureRoot = path.resolve(repoRoot, 'content/politics/source/future');
  assert.ok(absoluteSource.startsWith(futureRoot + path.sep), family + ': source path escaped future Source root');
  assert.ok(fs.existsSync(absoluteSource) && fs.statSync(absoluteSource).isFile(), family + ': source file missing');
  assert.equal(hashFile(absoluteSource), String(row.sha256).toLowerCase(), family + ': source sha256 mismatch');

  if (row.supersedes_revision_id != null) {
    assert.ok(String(row.supersedes_revision_id).trim(), family + ': supersedes_revision_id cannot be blank');
    assert.notEqual(row.supersedes_revision_id, row.revision_id, family + ': revision cannot supersede itself');
  }

  if (row.status === 'BOUND') {
    assert.equal(row.current_year_authority, true, family + ': BOUND must explicitly grant current-year authority');
    assert.equal(row.status_reason, null, family + ': BOUND should not carry a rejection/partial reason');
  } else {
    assert.equal(row.current_year_authority, false, family + ': only BOUND may grant current-year authority');
    assert.ok(String(row.status_reason || '').trim(), family + ': non-authoritative bound source requires status_reason');
  }
}

console.log('PASS Politics future-source slots: only exact file+hash verified BOUND revisions can gain 2027 authority; partial/stale/rejected states fail closed.');
