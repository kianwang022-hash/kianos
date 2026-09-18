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

const t0 = Date.parse('2026-09-17T00:00:00Z');
const storage = new MemoryStorage({
  [STUDY_TIMER_STATE_KEY]: JSON.stringify({
    schema: STUDY_TIMER_SCHEMA,
    running: false,
    manualPaused: true,
    subject: 'xizong',
    context: { subject: 'xizong', route: 'xizong/circulation/b03/', detailKey: 'A1/B03', detailLabel: 'A1 B03' },
    segmentStartedAt: null,
    lastSeenAt: t0,
    revision: 1,
    updatedAt: t0
  }),
  [STUDY_TIMER_LEDGER_KEY]: JSON.stringify({
    schema: STUDY_TIMER_SCHEMA,
    sessions: [{
      id: 'xz-1',
      subject: 'xizong',
      context: { subject: 'xizong', route: 'xizong/circulation/b03/', detailKey: 'A1/B03', detailLabel: 'A1 B03' },
      startedAt: t0,
      endedAt: t0 + 60 * 60 * 1000,
      source: 'timer'
    }]
  })
});

const xizongEvidence = {
  schema: 'kianos.xizong.study_packet.v3',
  current: {
    object_id: 'xizong:circulation-b03',
    system_id: 'circulation',
    canonical_id: 'A1',
    block_id: 'circulation-b03',
    block_label: 'B03',
    block_title: '循环代表 Block'
  },
  learning_state: {
    current_stage: 'kp_recall',
    source_contact: {
      mode: 'WHOLE_LOGIC_GROUP',
      per_logic_group: false,
      whole_block_confirmed: true,
      active_group_contacted: true
    },
    resume: {
      group_index: 1,
      logic_group_id: 'circulation-b03-lg02',
      logic_group_label: '第二学习节',
      kp_index: 6,
      kp_id: 'circulation-b03-kp07',
      kp_display_id: 'KP07',
      source_locator: 'P42'
    },
    ttsx: {
      pending: null,
      evidence: { 'source:circulation-b03-lg01': { completedAt: '2026-09-17T01:00:00Z' } },
      annotations: {}
    },
    learned_kp_ids: ['circulation-b03-kp01','circulation-b03-kp07'],
    recall_ratings: {
      'circulation-b03-kp01': 'mastered',
      'circulation-b03-kp07': 'fuzzy'
    },
    block_recall_done: false,
    block_complete: false
  },
  summary: {
    total_kp: 18,
    learned_kp: 7,
    recalled_kp: 7,
    active_logic_group_id: 'circulation-b03-lg02',
    active_kp_id: 'circulation-b03-kp07',
    unresolved_wu_questions: 3,
    marked_questions: 1
  },
  memory: {
    today: [],
    marked_fragments: [],
    active_repairs: [{
      id: 'repair:system-wu:circulation:circulation-b03:circulation-b03-kp07',
      kp_id: 'circulation-b03-kp07',
      source_question_ids: ['xizong-official-2025-n101'],
      return_href: '/xizong/practice/circulation/'
    }],
    evidence: []
  },
  practice: {
    holdout_years: [2026],
    wrong_uncertain: [{ question_id: 'xizong-official-2025-n101', status: 'wrong' }],
    marked_question_ids: ['xizong-official-2024-n088']
  }
};

const base = buildDailyLearningPacket({
  storage,
  day: '2026-09-17',
  now: t0 + 2 * 60 * 60 * 1000,
  subjectPackets: {}
});
const packet = attachDailySubjectPacket(base, 'xizong', xizongEvidence);

assert.equal(packet.schema, 'kianos.daily-learning-packet.v1');
assert.equal(packet.subjects.xizong.time.minutes, 60);
assert.equal(packet.subjects.xizong.evidence.schema, 'kianos.xizong.study_packet.v3');
assert.equal(packet.subjects.xizong.evidence.learning_state.current_stage, 'kp_recall');
assert.equal(packet.subjects.xizong.evidence.learning_state.resume.kp_id, 'circulation-b03-kp07');
assert.equal(packet.subjects.xizong.evidence.learning_state.source_contact.whole_block_confirmed, true);
assert.equal(packet.subjects.xizong.evidence.learning_state.ttsx.evidence['source:circulation-b03-lg01'].completedAt, '2026-09-17T01:00:00Z');
assert.equal(packet.subjects.xizong.evidence.practice.wrong_uncertain[0].question_id, 'xizong-official-2025-n101');
assert.equal(packet.subjects.xizong.evidence.memory.active_repairs[0].kp_id, 'circulation-b03-kp07');
assert.equal(base.subjects.xizong.evidence, null, 'attach must not mutate original daily packet');

console.log('XIZONG_DAILY_PACKET_PASS | exact resume + source contact + TTSX + Recall + Repair + Practice');
