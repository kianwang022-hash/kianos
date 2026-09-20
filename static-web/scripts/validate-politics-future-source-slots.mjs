import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.resolve('../content/politics/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const slots = manifest.future_source_families;

assert.equal(slots?.schema, 'kianos.politics.future-source-slots.v1');
assert.equal(slots?.exam_cycle, '2027');
assert.equal(slots?.authority_rule, 'UNBOUND_HAS_ZERO_CURRENT_YEAR_AUTHORITY');

const expectedFamilies = ['memory_handbook', 'current_affairs', 'xiao8', 'xiao4'];
assert.deepEqual(Object.keys(slots?.families || {}).sort(), [...expectedFamilies].sort());

const hex64 = /^[0-9a-f]{64}$/i;
for (const family of expectedFamilies) {
  const row = slots.families[family];
  assert.ok(row && typeof row === 'object' && !Array.isArray(row), family + ': row missing');
  assert.ok(['UNBOUND', 'BOUND'].includes(row.status), family + ': invalid status');

  if (row.status === 'UNBOUND') {
    for (const key of ['source_path', 'sha256', 'revision_id', 'supersedes_revision_id', 'bound_at']) {
      assert.equal(row[key], null, family + ': UNBOUND must not carry current-year authority metadata: ' + key);
    }
    continue;
  }

  assert.match(String(row.source_path || ''), /^content\/politics\/source\/future\//, family + ': bound path must stay under Politics future Source');
  assert.match(String(row.sha256 || ''), hex64, family + ': bound sha256 required');
  assert.ok(String(row.revision_id || '').trim(), family + ': revision_id required');
  assert.ok(Number.isFinite(Date.parse(String(row.bound_at || ''))), family + ': bound_at must be ISO time');
  if (row.supersedes_revision_id != null) {
    assert.ok(String(row.supersedes_revision_id).trim(), family + ': supersedes_revision_id cannot be blank');
    assert.notEqual(row.supersedes_revision_id, row.revision_id, family + ': revision cannot supersede itself');
  }
}

console.log('PASS Politics future-source slots: four known annual families fail closed until exact 2027 provenance is bound.');
