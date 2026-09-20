import assert from 'node:assert/strict';
import { politicsDailyEvidencePacket } from '../src/lib/politicsPracticeState.mjs';

const day = '2026-09-21';
const catalog = {
  revision: 'maturity-objective-evidence-test',
  units: [{
    key: 'marx/c01/u01',
    id: 'U01',
    subject: 'marx',
    chapter: 'c01',
    questionIds: ['S1', 'M1', 'M2']
  }],
  questions: [
    {
      id: 'S1', type: 'single', subject: 'marx', subjectLabel: '马克思主义基本原理',
      chapter: 'c01', chapterTitle: '第一章', unitKey: 'marx/c01/u01', unitId: 'U01',
      unitTitle: '测试单元', unitHref: '/politics/marx/c01/#u01', number: 1
    },
    {
      id: 'M1', type: 'multiple', subject: 'marx', subjectLabel: '马克思主义基本原理',
      chapter: 'c01', chapterTitle: '第一章', unitKey: 'marx/c01/u01', unitId: 'U01',
      unitTitle: '测试单元', unitHref: '/politics/marx/c01/#u01', number: 2
    },
    {
      id: 'M2', type: 'multiple', subject: 'marx', subjectLabel: '马克思主义基本原理',
      chapter: 'c01', chapterTitle: '第一章', unitKey: 'marx/c01/u01', unitId: 'U01',
      unitTitle: '测试单元', unitHref: '/politics/marx/c01/#u01', number: 3
    },
    {
      id: 'M3', type: 'multiple', subject: 'marx', subjectLabel: '马克思主义基本原理',
      chapter: '', chapterTitle: '', unitKey: '', unitId: '',
      unitTitle: '', unitHref: '', scopeStatus: 'QUESTION_SCOPE_UNRESOLVED', number: 4
    }
  ]
};

const attempt = (question_id, outcome, observed_at, uncertain = false) => ({
  question_id,
  outcome,
  selected: 'A',
  correct_answer: 'A',
  study_day: day,
  observed_at,
  uncertain
});

const snapshot = {
  attempts: {
    units: {
      'marx/c01/u01': {
        attempts: {
          S1: attempt('S1', 'STABLE', '2026-09-21T01:00:00.000Z'),
          M1: attempt('M1', 'WRONG', '2026-09-21T01:05:00.000Z'),
          M2: attempt('M2', 'UNCERTAIN', '2026-09-21T01:10:00.000Z', true),
          M3: attempt('M3', 'WRONG', '2026-09-21T01:15:00.000Z')
        }
      }
    }
  },
  meta: {
    latestOutcome: { S1: 'STABLE', M1: 'WRONG', M2: 'UNCERTAIN', M3: 'WRONG' },
    causes: { M1: 'options', M2: 'memory', M3: 'understanding' },
    notes: {},
    discussion: {},
    favorites: {}
  },
  session: null,
  last: null,
  events: [],
  errors: []
};

const packet = politicsDailyEvidencePacket(catalog, snapshot, { day, now: Date.parse('2026-09-21T02:00:00.000Z') });

assert.equal(packet.schema, 'kianos.politics.study_packet.v1');
assert.equal(packet.forecast_progress.schema, 'kianos.politics.forecast-progress.v1');
assert.equal(packet.forecast_progress.forecast_role, 'FACTUAL_SUBJECT_PROGRESS_SIGNAL_ONLY');
assert.equal(packet.forecast_progress.gate_workload_authority, false);

const byType = packet.forecast_progress.objective_evidence_by_type;
assert.deepEqual(byType.single, {
  source_questions: 1,
  currently_admitted_questions: 1,
  withheld_questions: 0,
  first_attempt_questions: 1,
  historical_first_attempt_on_withheld_questions: 0,
  stable_count: 1,
  wrong_count: 0,
  uncertain_count: 0,
  cause_counts: { memory: 0, understanding: 0, options: 0, careless: 0 }
});
assert.deepEqual(byType.multiple, {
  source_questions: 3,
  currently_admitted_questions: 2,
  withheld_questions: 1,
  first_attempt_questions: 2,
  historical_first_attempt_on_withheld_questions: 1,
  stable_count: 0,
  wrong_count: 1,
  uncertain_count: 1,
  cause_counts: { memory: 1, understanding: 0, options: 1, careless: 0 }
});

assert.deepEqual(
  packet.today.attempts.map((row) => [row.question_id, row.question_type, row.outcome]),
  [
    ['S1', 'single', 'STABLE'],
    ['M1', 'multiple', 'WRONG'],
    ['M2', 'multiple', 'UNCERTAIN'],
    ['M3', 'multiple', 'WRONG']
  ]
);

assert.match(packet.forecast_progress.evidence_boundary, /do not prove.*exam score/i);

console.log('PASS Politics maturity objective evidence: single/multiple remain factual, separated, and non-score-authoritative.');
