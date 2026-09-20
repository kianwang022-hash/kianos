import assert from 'node:assert/strict';
import {
  POLITICS_ANALYSIS_BATCH_SCHEMA,
  POLITICS_ANALYSIS_EVIDENCE_SCHEMA,
  applyPoliticsAnalysisEvidenceBatch,
  buildPoliticsAnalysisEvidenceProfile,
  validatePoliticsAnalysisEvidenceBatch
} from '../src/lib/politicsAnalysisEvidence.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
}

const day = '2026-09-20';
const evidenceKey = 'kianos-politics-evidence-v1';
const normalQuestionEvent = { question_id: 'PQ1', outcome: 'WRONG', study_day: day, observed_at: '2026-09-20T01:00:00.000Z' };
const storage = new MemoryStorage({ [evidenceKey]: JSON.stringify([normalQuestionEvent]) });

const batch = {
  schema: POLITICS_ANALYSIS_BATCH_SCHEMA,
  study_day: day,
  generated_at: '2026-09-20T02:00:00.000Z',
  events: [
    {
      schema: POLITICS_ANALYSIS_EVIDENCE_SCHEMA,
      event_id: 'ao-e1',
      task_id: 'POL-AO-001',
      task_revision: 'bank-r3',
      attempt_id: 'attempt-1',
      source_basis: 'MARX-C01-OUT-LAW-INITIATIVE',
      current_year_status: 'STABLE_STRUCTURE',
      study_day: day,
      observed_at: '2026-09-20T01:30:00.000Z',
      requested_depth: 'IDENTIFY',
      exposure_state: 'FRESH',
      ratings: { D1: 2, D2: 1 },
      rater: 'CHAT'
    },
    {
      schema: POLITICS_ANALYSIS_EVIDENCE_SCHEMA,
      event_id: 'ao-e2',
      task_id: 'POL-AO-043',
      task_revision: 'bank-r3',
      attempt_id: 'attempt-2',
      source_basis: 'MARX-C02-OUT-CONTRADICTION',
      current_year_status: 'STABLE_STRUCTURE',
      study_day: day,
      observed_at: '2026-09-20T01:40:00.000Z',
      requested_depth: 'MATERIAL_BINDING',
      exposure_state: 'CHANGED_CONTEXT',
      ratings: { D1: 2, D2: 2, D3: 2, D4: 0 },
      rater: 'CHAT'
    }
  ]
};

const normalized = validatePoliticsAnalysisEvidenceBatch(batch, { expectedDay: day });
assert.equal(normalized.events.length, 2);

const first = applyPoliticsAnalysisEvidenceBatch(storage, batch, { expectedDay: day, evidenceKey });
assert.equal(first.appended, 2);
const ledger = JSON.parse(storage.getItem(evidenceKey));
assert.equal(ledger.length, 3);
assert.deepEqual(ledger[0], normalQuestionEvent, 'existing question event must remain untouched');

const replay = applyPoliticsAnalysisEvidenceBatch(storage, batch, { expectedDay: day, evidenceKey });
assert.equal(replay.appended, 0, 'identical Analysis batch replay must be idempotent');

const conflict = structuredClone(batch);
conflict.events[0].ratings.D2 = 2;
assert.throws(
  () => applyPoliticsAnalysisEvidenceBatch(storage, conflict, { expectedDay: day, evidenceKey }),
  /POLITICS_ANALYSIS_EVIDENCE_CONFLICT_KEEP_FIRST/
);
assert.equal(JSON.parse(storage.getItem(evidenceKey)).find((row) => row.event_id === 'ao-e1').ratings.D2, 1);

const profile = buildPoliticsAnalysisEvidenceProfile(JSON.parse(storage.getItem(evidenceKey)));
assert.equal(profile.schema, 'kianos.politics.analysis-history-profile.v1');
assert.equal(profile.summary.total_events, 2);
assert.equal(profile.summary.current_tasks_with_evidence, 2);
assert.equal(profile.summary.dimensions.D4.broken, 1);
assert.equal(profile.summary.dimensions.D2.partial, 1);
assert.equal(profile.summary.dimensions.D2.usable, 1);
assert.equal('score' in profile, false);
assert.equal('next_action' in profile, false);
assert.match(profile.role, /NOT_SCORE_OR_SCHEDULER/);

const badRating = structuredClone(batch);
badRating.events[0].event_id = 'ao-bad';
badRating.events[0].ratings.D1 = 3;
assert.throws(() => validatePoliticsAnalysisEvidenceBatch(badRating), /RATING_INVALID/);

const staleDay = structuredClone(batch);
staleDay.study_day = '2026-09-19';
assert.throws(() => validatePoliticsAnalysisEvidenceBatch(staleDay, { expectedDay: day }), /DAY_MISMATCH/);

console.log('PASS Politics Analysis evidence: shared ledger, identity, replay/conflict, bounded profile, no score/scheduler');
