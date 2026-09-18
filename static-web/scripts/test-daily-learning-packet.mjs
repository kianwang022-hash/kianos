import assert from 'node:assert/strict';
import {
  STUDY_TIMER_STATE_KEY,
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_SCHEMA
} from '../src/lib/studyTimer.mjs';
import { buildDailyLearningPacket, attachDailySubjectPacket } from '../src/lib/dailyLearningPacket.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
}

const t0 = Date.parse('2026-09-17T00:00:00Z'); // 08:00 Asia/Shanghai
const storage = new MemoryStorage({
  [STUDY_TIMER_STATE_KEY]: JSON.stringify({
    schema: STUDY_TIMER_SCHEMA,
    running: false,
    manualPaused: true,
    subject: 'english',
    context: { subject: 'english', route: 'reading/', detailKey: 'reading-a', detailLabel: 'Reading A' },
    segmentStartedAt: null,
    lastSeenAt: t0,
    revision: 2,
    updatedAt: t0
  }),
  [STUDY_TIMER_LEDGER_KEY]: JSON.stringify({
    schema: STUDY_TIMER_SCHEMA,
    sessions: [
      {
        id: 'xz-1', subject: 'xizong',
        context: { subject: 'xizong', route: 'xizong/a1/', detailKey: 'A1/B03', detailLabel: 'A1 B03' },
        startedAt: t0, endedAt: t0 + 60 * 60 * 1000, source: 'timer'
      },
      {
        id: 'en-1', subject: 'english',
        context: { subject: 'english', route: 'reading/', detailKey: 'reading-a', detailLabel: 'Reading A' },
        startedAt: t0 + 60 * 60 * 1000, endedAt: t0 + 90 * 60 * 1000, source: 'timer'
      }
    ]
  })
});

const plan = {
  schema: 'kianos.exam-plan.read-model.v1',
  day: '2026-09-17',
  phase: { id: 'A', label: 'First-Round Closure', outsideCycle: false },
  gate: { date: '2026-09-27', label: 'First-Round Gate', daysRemaining: 10 },
  capacity: { dayMinutes: 600, actualMinutes: 90, remainingMinutes: 510, unallocatedMinutes: 0 },
  next: { subject: 'xizong', href: '/kianos/xizong/a1/', title: '继续 A1' },
  attention: null,
  time: { usesTimer: true },
  subjects: {
    xizong: { subject: 'xizong', targetMinutes: 360, actualMinutes: 60, remainingMinutes: 300 },
    politics: { subject: 'politics', targetMinutes: 90, actualMinutes: 0, remainingMinutes: 90 },
    english: { subject: 'english', targetMinutes: 150, actualMinutes: 30, remainingMinutes: 120 }
  }
};

const politicsEvidence = {
  schema: 'kianos.politics.return_packet.v1',
  study_day: '2026-09-17',
  events: [{ question_id: 'P1', outcome: 'UNCERTAIN' }]
};

const packet = buildDailyLearningPacket({
  storage,
  day: '2026-09-17',
  now: t0 + 2 * 60 * 60 * 1000,
  plan,
  subjectPackets: { politics: politicsEvidence }
});

assert.equal(packet.schema, 'kianos.daily-learning-packet.v1');
assert.equal(packet.study_day, '2026-09-17');
assert.equal(packet.total_minutes, 90);
assert.equal(packet.subjects.xizong.time.minutes, 60);
assert.equal(packet.subjects.english.time.minutes, 30);
assert.equal(packet.subjects.politics.time.minutes, 0);
assert.equal(packet.subjects.xizong.time.details[0].detail, 'A1/B03');
assert.equal(packet.subjects.xizong.plan.remainingMinutes, 300);
assert.deepEqual(packet.subjects.politics.evidence, politicsEvidence);
assert.equal(packet.subjects.xizong.evidence, null);
assert.equal(packet.schedule.capacity.remainingMinutes, 510);

const xizongEvidence = {
  schema: 'kianos.xizong.study_packet.v3',
  current: {
    system_id: 'circulation',
    canonical_id: 'A1',
    block_id: 'circulation-b03',
    block_label: 'B03'
  },
  learning_state: {
    current_stage: 'kp_recall',
    source_contact: { mode: 'WHOLE_LOGIC_GROUP', per_logic_group: false, whole_block_confirmed: true, active_group_contacted: true },
    resume: { group_index: 1, logic_group_id: 'circulation-b03-lg02', kp_index: 6, kp_id: 'circulation-b03-kp07', source_locator: 'P42' },
    ttsx: { pending: null, evidence: { 'source:circulation-b03-lg01': { completedAt: '2026-09-17T01:00:00Z' } }, annotations: {} },
    learned_kp_ids: ['circulation-b03-kp01','circulation-b03-kp07'],
    recall_ratings: { 'circulation-b03-kp01': 'mastered', 'circulation-b03-kp07': 'fuzzy' },
    block_recall_done: false,
    block_complete: false
  },
  summary: { total_kp: 18, learned_kp: 7, recalled_kp: 7, unresolved_wu_questions: 3, marked_questions: 1 },
  practice: {
    holdout_years: [2026],
    wrong_uncertain: [{ question_id: 'xizong-official-2025-n101', status: 'wrong' }],
    marked_question_ids: ['xizong-official-2024-n088']
  }
};
const withXizong = attachDailySubjectPacket(packet, 'xizong', xizongEvidence);
assert.equal(withXizong.subjects.xizong.evidence.schema, 'kianos.xizong.study_packet.v3');
assert.equal(withXizong.subjects.xizong.evidence.learning_state.current_stage, 'kp_recall');
assert.equal(withXizong.subjects.xizong.evidence.learning_state.resume.kp_id, 'circulation-b03-kp07');
assert.equal(withXizong.subjects.xizong.evidence.learning_state.source_contact.whole_block_confirmed, true);
assert.equal(withXizong.subjects.xizong.evidence.practice.wrong_uncertain[0].question_id, 'xizong-official-2025-n101');
assert.equal(packet.subjects.xizong.evidence, null, 'attach must not mutate the original packet');
assert.throws(() => attachDailySubjectPacket(packet, 'lexical', {}), /Unsupported subject/);
assert.throws(() => buildDailyLearningPacket({ storage, day: '2026-09-17', now: t0, plan: { ...plan, day: '2026-09-18' } }), /day mismatch/);

console.log('PASS daily learning packet: time + plan + exact Xizong learner-state evidence');
