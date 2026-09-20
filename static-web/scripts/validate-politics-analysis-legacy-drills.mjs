import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('../content/politics/derived/analysis/legacy26-drill-index.v1.json');
const bank = JSON.parse(fs.readFileSync(file, 'utf8'));

assert.equal(bank.schema, 'kianos.politics.analysis-legacy-drill-index.v1');
assert.equal(bank.status, 'CANDIDATE_LEGACY_GEOMETRY_ONLY');
assert.equal(bank.authority?.freshness_class, 'LEGACY_GEOMETRY_ONLY');
assert.equal(bank.authority?.current_year_authority, false);
assert.equal(bank.authority?.formulation_requirement, 'NONE');
assert.equal(bank.authority?.exact_2027_recall_allowed, false);
assert.equal(bank.authority?.material_access, 'PRIVATE_SOURCE_REQUIRED');

const expectedDims = {
  IDENTIFY: ['I'],
  SKELETON: ['I','S'],
  BIND: ['I','S','B'],
  DELIVER: ['I','S','B','D']
};
const allowedModes = new Set(Object.keys(expectedDims));
const allowedSubjects = new Set(['marxism','history','mao','xi','ethics_law','current_affairs','mixed']);
const ids = new Set();
const revisions = new Set();

assert.equal(bank.drills.length, 20, 'seed bank must contain the deliberately reviewed first 20 subquestion drills');

for (const drill of bank.drills) {
  assert.ok(drill && typeof drill === 'object' && !Array.isArray(drill));
  assert.ok(drill.id && !ids.has(drill.id), 'duplicate drill id: ' + drill.id);
  ids.add(drill.id);
  assert.equal(drill.task_id, drill.id);
  assert.ok(drill.task_revision && !revisions.has(drill.task_revision), 'duplicate task revision');
  revisions.add(drill.task_revision);
  assert.equal(drill.rubric_version, 'politics-analysis-rubric-v1');
  assert.ok([1,2].includes(drill.set), 'only manually reviewed Xiao8 sets 1-2 belong in seed v1');
  assert.ok(drill.question >= 34 && drill.question <= 38);
  assert.ok([1,2].includes(drill.subquestion));
  assert.ok(allowedSubjects.has(drill.subject));
  assert.ok(allowedModes.has(drill.mode));
  assert.deepEqual(drill.required_dimensions, expectedDims[drill.mode], drill.id + ': dimension mismatch');
  assert.equal(drill.freshness_class, 'LEGACY_GEOMETRY_ONLY');
  assert.equal(drill.formulation_requirement, 'NONE');
  assert.equal(drill.answer_visibility, 'POST_ATTEMPT_ONLY');
  assert.deepEqual(drill.source_basis, {
    family: 'LEG26_XIAO8',
    identity: `2026 Xiao8 set${drill.set} Q${drill.question}(${drill.subquestion})`,
    revision: null,
    authority_status: 'LEGACY_GEOMETRY'
  });
  assert.ok(String(drill.target || '').trim().length >= 20, drill.id + ': target too vague');

  for (const forbidden of ['prompt','stem','material_text','answer','reference_answer','exact_wording','memory_text']) {
    assert.equal(Object.prototype.hasOwnProperty.call(drill, forbidden), false, drill.id + ': must not store ' + forbidden);
  }
}

assert.equal(ids.size, 20);
assert.equal(revisions.size, 20);
assert.deepEqual(
  [...new Set(bank.drills.map(d => d.question))].sort((a,b)=>a-b),
  [34,35,36,37,38]
);
assert.ok(bank.drills.some(d => d.mode === 'DELIVER'), 'delivery must be sampled, not deferred entirely');
assert.ok(bank.drills.some(d => d.subject === 'current_affairs'), 'legacy current-affairs geometry must be represented but non-authoritative');

console.log('PASS Politics legacy Analysis seed bank: 20 executable geometry drills, no prompt/answer copy, no current-year authority, no formulation leakage.');
