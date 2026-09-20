import assert from 'node:assert/strict';

import {
  buildDailyLearningPacket,
  attachDailySubjectPacket,
  serializeDailyLearningPacketForChat
} from '../src/lib/dailyLearningPacket.mjs';
import {
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_SCHEMA,
  STUDY_TIMER_STATE_KEY
} from '../src/lib/studyTimer.mjs';
import { buildEnglishEvidencePacket } from '../src/lib/englishSessionControl.mjs';
import { politicsDailyEvidencePacket } from '../src/lib/politicsPracticeState.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  key(index) { return [...this.map.keys()][index] ?? null; }
  get length() { return this.map.size; }
}

const day = '2026-09-19';
const now = Date.parse('2026-09-19T02:00:00.000Z');
const storage = new MemoryStorage({
  [STUDY_TIMER_STATE_KEY]: JSON.stringify({
    schema: STUDY_TIMER_SCHEMA,
    running: false,
    manualPaused: true,
    subject: 'english',
    context: { subject: 'english', route: 'reading/', detailKey: 'reading-a', detailLabel: 'Reading A' },
    segmentStartedAt: null,
    lastSeenAt: now,
    revision: 1,
    updatedAt: now
  }),
  [STUDY_TIMER_LEDGER_KEY]: JSON.stringify({
    schema: STUDY_TIMER_SCHEMA,
    sessions: [
      {
        id: 'english-1',
        subject: 'english',
        context: { subject: 'english', route: 'reading/', detailKey: 'reading-a', detailLabel: 'Reading A' },
        startedAt: now - 40 * 60 * 1000,
        endedAt: now,
        source: 'timer'
      },
      {
        id: 'politics-1',
        subject: 'politics',
        context: { subject: 'politics', route: 'politics/practice/', detailKey: 'xiao1000', detailLabel: '肖1000' },
        startedAt: now - 70 * 60 * 1000,
        endedAt: now - 40 * 60 * 1000,
        source: 'timer'
      }
    ]
  }),
  ['kianos-reading-attempt-v1:reading-2025-a']: JSON.stringify({
    binding: {
      task: 'reading_a',
      object_id: 'reading-2025-a',
      source_hash: 'reading-hash',
      attempt_id: 'attempt-reading-1',
      prior_exposure: 'unknown',
      assistance: 'unassisted'
    },
    submitted: true,
    answers: { q1: 'A' },
    results: {},
    saved_at: '2026-09-19T01:40:00.000Z'
  })
});

const english = buildEnglishEvidencePacket(storage, { day, now, catalog: [] });
assert.equal(english.schema, 'kianos.english.evidence.v1');
assert.equal(english.study_day, day);
assert.equal(english.inventory.length, 1);
assert.equal(english.inventory[0].task, 'reading_a');
assert.equal(english.inventory[0].object_id, 'reading-2025-a');

const politicsCatalog = {
  revision: 'politics-daily-rev-1',
  questions: [{
    id: 'PQ1',
    subject: 'marxism',
    subjectLabel: '马原',
    number: 1,
    type: 'single',
    chapter: 'c01',
    chapterTitle: '第一章',
    unitKey: 'marxism/c01/u01',
    unitId: 'u01',
    unitTitle: '自然单元 1',
    unitHref: '/politics/marxism/c01/#u01'
  }],
  chapters: [{ subject: 'marxism', code: 'c01', title: '第一章' }],
  units: [
    {
      key: 'marxism/c01/u01',
      id: 'u01',
      subject: 'MARX',
      chapter: 'c01',
      questionIds: ['PQ1']
    },
    {
      key: 'xi/c01/u02',
      id: 'u02',
      subject: 'XI',
      chapter: 'c01',
      questionIds: []
    }
  ]
};
const politicsSnapshot = {
  attempts: {
    schema: 'kianos.politics.attempt_snapshot.v1',
    units: {
      'marxism/c01/u01': {
        unit_key: 'marxism/c01/u01',
        attempts: {
          PQ1: {
            question_id: 'PQ1',
            outcome: 'UNCERTAIN',
            selected: 'A',
            correct_answer: 'A',
            uncertain: true,
            study_day: day,
            observed_at: '2026-09-19T01:20:00.000Z'
          }
        }
      }
    }
  },
  meta: {
    latestOutcome: { PQ1: 'UNCERTAIN' },
    notes: { PQ1: '概念边界还不稳' },
    causes: { PQ1: 'understanding' }
  },
  session: null,
  last: {
    href: '/politics/marxism/c01/',
    subject: 'marxism',
    chapter: 'c01',
    unit_id: 'u01',
    title: '自然单元 1'
  },
  events: [
    { question_id: 'PQ1', outcome: 'UNCERTAIN', study_day: day, observed_at: '2026-09-19T01:20:00.000Z' },
    {
      schema: 'kianos.politics.analysis-evidence.v1',
      event_id: 'analysis-e1',
      task_id: 'POL-AO-043',
      task_revision: 'bank-r3',
      attempt_id: 'analysis-attempt-1',
      source_basis: 'MARX-C02-OUT-CONTRADICTION',
      current_year_status: 'STABLE_STRUCTURE',
      study_day: day,
      observed_at: '2026-09-19T01:25:00.000Z',
      requested_depth: 'MATERIAL_BINDING',
      exposure_state: 'FRESH',
      ratings: { D1: 2, D2: 2, D3: 2, D4: 0 },
      rater: 'CHAT'
    }
  ],
  errors: []
};
const politics = politicsDailyEvidencePacket(politicsCatalog, politicsSnapshot, { day, now, base: '/' });
assert.equal(politics.schema, 'kianos.politics.study_packet.v1');
assert.equal(politics.today.attempted_count, 1);
assert.equal(politics.today.uncertain_count, 1);
assert.equal(politics.today.attempts[0].question_type, 'single');
assert.equal(politics.cumulative_first_attempts.total, 1);
assert.deepEqual(politics.cumulative_first_attempts.by_question_type.single, {
  attempted: 1, stable: 0, wrong: 0, uncertain: 1
});
assert.deepEqual(politics.cumulative_first_attempts.by_question_type.multiple, {
  attempted: 0, stable: 0, wrong: 0, uncertain: 0
});
assert.equal(politics.review.open_problem_count, 1);
assert.equal(politics.resume.title, '自然单元 1');
assert.equal(politics.analysis.schema, 'kianos.politics.analysis-history-profile.v1');
assert.equal(politics.analysis.summary.total_events, 1);
assert.equal(politics.analysis.summary.dimensions.D4.broken, 1);
assert.equal('score' in politics.analysis, false);
assert.equal('next_action' in politics.analysis, false);
assert.deepEqual(
  politics.forecast_progress.units_with_first_attempt_evidence_by_subject,
  { MARX: 1 }
);
assert.deepEqual(
  politics.forecast_progress.units_without_first_attempt_evidence_by_subject,
  { XI: 1 }
);
assert.deepEqual(
  politics.forecast_progress.current_navigation.structural_units_after_current_by_subject,
  { XI: 1 }
);

let packet = buildDailyLearningPacket({ storage, day, now, subjectPackets: {} });
packet = attachDailySubjectPacket(packet, 'english', english);
packet = attachDailySubjectPacket(packet, 'politics', politics);

assert.equal(packet.schema, 'kianos.daily-learning-packet.v1');
assert.equal(packet.subjects.english.evidence.schema, 'kianos.english.evidence.v1');
assert.equal(packet.subjects.politics.evidence.schema, 'kianos.politics.study_packet.v1');
assert.equal(packet.subjects.xizong.evidence, null);
assert.equal(packet.subjects.english.time.minutes, 40);
assert.equal(packet.subjects.politics.time.minutes, 30);

const text = serializeDailyLearningPacketForChat(packet);
assert.match(text, /"schema": "kianos\.english\.evidence\.v1"/);
assert.match(text, /"schema": "kianos\.politics\.study_packet\.v1"/);
assert.match(text, /LEARN state/);
assert.match(text, /kianos\.exam\.chat-plan\.v1/);
assert.match(text, /missing evidence means unknown/i);

console.log('PASS subject daily packets: English + Politics attach to one shared Daily Learning Packet');
