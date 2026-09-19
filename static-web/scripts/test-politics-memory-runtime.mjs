import assert from 'node:assert/strict';
import {
  extractPoliticsMemoryCandidates
} from '../src/lib/politicsMemoryCandidates.mjs';
import {
  POLITICS_MEMORY_PLAN_SCHEMA,
  POLITICS_MEMORY_PLAN_KEY,
  POLITICS_MEMORY_EVIDENCE_KEY,
  applyPoliticsMemoryPlan,
  recordPoliticsMemoryResponse,
  resolvePoliticsMemoryResume,
  politicsMemoryCheckpointKeyAllowed,
  validatePoliticsMemoryCheckpointValue
} from '../src/lib/politicsMemoryRuntime.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

const chapter = {
  subject: 'xi',
  chapter: 'ch03',
  title: '党的领导',
  raw: {
    subject: 'XI',
    chapter_id: 'POL27-LEARN-XI-C03',
    teaching_title: '党的领导',
    content_support: {
      active_precision: [{
        natural_unit_id: 'POL27-CF-XI-C03-S01',
        name: '党的领导四组高频身份',
        items: ['最本质特征', '最大优势', '最高政治领导力量', '根本保证'],
        source_refs: ['SRC-1']
      }],
      active_boundaries: [{
        natural_unit_id: 'POL27-CF-XI-C03-S01',
        name: '全面领导边界',
        items: ['全面领导 ≠ 替代具体履职'],
        source_refs: ['SRC-2']
      }, {
        natural_unit_id: 'POL27-CF-XI-C03-S01',
        name: '无来源的边界',
        items: ['should not be admitted'],
        source_refs: []
      }]
    }
  }
};

const extracted = extractPoliticsMemoryCandidates(chapter);
assert.equal(extracted.length, 2, 'only explicit source-grounded active memory shapes are admitted');
assert.equal(extracted[0].admission, 'CANDIDATE_ONLY');
assert.equal(extracted[0].subject, 'xi');
assert.equal(extracted[0].chapter_id, 'POL27-LEARN-XI-C03');

const catalog = {
  schema: 'kianos.politics.memory-candidate-catalog.v1',
  revision: 'catalog-r1',
  candidates: extracted
};

const now = Date.parse('2026-09-20T02:30:00+08:00');
const day = '2026-09-20';
const first = {
  schema: POLITICS_MEMORY_PLAN_SCHEMA,
  plan_id: 'p1',
  study_day: day,
  generated_at: new Date(now).toISOString(),
  catalog_revision: catalog.revision,
  phase: 'FIRST_ROUND',
  items: extracted.map((row) => ({ candidate_id: row.id, reason: 'Chat selected' }))
};

const storage = new MemoryStorage();
const applied = applyPoliticsMemoryPlan(storage, catalog, first, { expectedDay: day, now });
assert.equal(applied.status, 'applied');
assert.equal(JSON.parse(storage.getItem(POLITICS_MEMORY_PLAN_KEY)).plan_id, 'p1');

const resume1 = resolvePoliticsMemoryResume(storage, catalog, { expectedDay: day });
assert.equal(resume1.status, 'ACTIVE');
assert.equal(resume1.index, 0);

recordPoliticsMemoryResponse(storage, catalog, {
  plan_id: 'p1',
  candidate_id: resume1.candidate.id,
  response: 'FUZZY',
  observed_at: new Date(now + 1000).toISOString()
}, { expectedDay: day });
const resume2 = resolvePoliticsMemoryResume(storage, catalog, { expectedDay: day });
assert.equal(resume2.status, 'ACTIVE');
assert.equal(resume2.index, 1);

recordPoliticsMemoryResponse(storage, catalog, {
  plan_id: 'p1',
  candidate_id: resume2.candidate.id,
  response: 'STABLE',
  observed_at: new Date(now + 2000).toISOString()
}, { expectedDay: day });
assert.equal(resolvePoliticsMemoryResume(storage, catalog, { expectedDay: day }).status, 'COMPLETE');

assert.throws(() => recordPoliticsMemoryResponse(storage, catalog, {
  plan_id: 'p1',
  candidate_id: resume2.candidate.id,
  response: 'STABLE'
}, { expectedDay: day }), /RESPONSE_ALREADY_RECORDED/);

const replacement = {
  schema: POLITICS_MEMORY_PLAN_SCHEMA,
  plan_id: 'p2',
  study_day: day,
  generated_at: new Date(now + 5000).toISOString(),
  catalog_revision: catalog.revision,
  phase: 'FIRST_ROUND',
  supersedes_plan_id: 'p1',
  items: [{ candidate_id: extracted[0].id, reason: 'Chat replanned after new evidence' }]
};
assert.equal(applyPoliticsMemoryPlan(storage, catalog, replacement, {
  expectedDay: day,
  now: now + 5000
}).status, 'superseded');

assert.throws(() => applyPoliticsMemoryPlan(new MemoryStorage(), catalog, {
  ...first,
  plan_id: 'unknown',
  items: [{ candidate_id: 'missing', reason: 'invalid' }]
}, { expectedDay: day, now }), /PLAN_UNKNOWN_CANDIDATE/);

assert.equal(JSON.parse(storage.getItem(POLITICS_MEMORY_EVIDENCE_KEY)).length, 2);
assert.equal(politicsMemoryCheckpointKeyAllowed(POLITICS_MEMORY_PLAN_KEY), true);
assert.equal(politicsMemoryCheckpointKeyAllowed(POLITICS_MEMORY_EVIDENCE_KEY), true);
validatePoliticsMemoryCheckpointValue(POLITICS_MEMORY_PLAN_KEY, JSON.parse(storage.getItem(POLITICS_MEMORY_PLAN_KEY)));
validatePoliticsMemoryCheckpointValue(POLITICS_MEMORY_EVIDENCE_KEY, JSON.parse(storage.getItem(POLITICS_MEMORY_EVIDENCE_KEY)));

const staleCatalog = { ...catalog, revision: 'catalog-r2' };
assert.equal(resolvePoliticsMemoryResume(storage, staleCatalog, { expectedDay: day }).status, 'STALE');
assert.throws(() => recordPoliticsMemoryResponse(storage, staleCatalog, {
  plan_id: 'p2',
  candidate_id: extracted[0].id,
  response: 'STABLE'
}, { expectedDay: day }), /RESPONSE_CATALOG_STALE/);

assert.equal(resolvePoliticsMemoryResume(storage, catalog, { expectedDay: '2026-09-21' }).status, 'STALE');
assert.throws(() => recordPoliticsMemoryResponse(storage, catalog, {
  plan_id: 'p2',
  candidate_id: extracted[0].id,
  response: 'STABLE'
}, { expectedDay: '2026-09-21' }), /RESPONSE_STALE_DAY/);

assert.throws(() => applyPoliticsMemoryPlan(new MemoryStorage(), catalog, {
  ...first,
  plan_id: 'wrong-revision',
  catalog_revision: 'catalog-old'
}, { expectedDay: day, now }), /PLAN_CATALOG_MISMATCH/);

console.log('PASS politics memory prototype: stable candidate identity, catalog-bound plan, explicit supersede, recall evidence, resume');
