import assert from 'node:assert/strict';
import {
  STUDY_TIMER_STATE_KEY,
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_SCHEMA
} from '../src/lib/studyTimer.mjs';
import { buildDailyLearningPacket, attachDailySubjectPacket, serializeDailyLearningPacketForChat } from '../src/lib/dailyLearningPacket.mjs';
import {
  CONTROL_LOCAL_RECEIPT_KEY,
  CONTROL_RECEIPT_SCHEMA
} from '../src/lib/privateControlCommand.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  get length() { return this.map.size; }
  key(index) { return [...this.map.keys()][index] ?? null; }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
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
  [CONTROL_LOCAL_RECEIPT_KEY]: JSON.stringify({
    schema: CONTROL_RECEIPT_SCHEMA,
    command_id: 'control-20260917-proof-001',
    command_hash: 'hash-001',
    status: 'APPLIED',
    observed_at: '2026-09-17T01:59:00.000Z',
    error: null
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
assert.equal(packet.control.schema, CONTROL_RECEIPT_SCHEMA);
assert.equal(packet.control.command_id, 'control-20260917-proof-001');
assert.equal(packet.control.status, 'APPLIED');
assert.equal(packet.learner_evidence_basis.schema, 'kianos.exam.chat-plan-basis.v1');
assert.equal(packet.learner_evidence_basis.study_day, '2026-09-17');
assert.match(packet.learner_evidence_basis.evidence_fingerprint, /^fnv1a64:/);

const sameEvidenceLaterPacket = buildDailyLearningPacket({
  storage,
  day: '2026-09-17',
  now: t0 + 3 * 60 * 60 * 1000,
  plan,
  subjectPackets: { politics: politicsEvidence }
});
assert.deepEqual(
  sameEvidenceLaterPacket.learner_evidence_basis,
  packet.learner_evidence_basis,
  'basis identity must not drift merely because packet generated_at changed'
);

storage.setItem('kianos-politics-evidence-v1', JSON.stringify([{
  event_id: 'daily-basis-politics-e1',
  study_day: '2026-09-17',
  observed_at: '2026-09-17T03:10:00.000Z'
}]));
const newerEvidencePacket = buildDailyLearningPacket({
  storage,
  day: '2026-09-17',
  now: t0 + 4 * 60 * 60 * 1000,
  plan,
  subjectPackets: { politics: politicsEvidence }
});
assert.notEqual(
  newerEvidencePacket.learner_evidence_basis.evidence_fingerprint,
  packet.learner_evidence_basis.evidence_fingerprint,
  'new learner evidence must change the Daily Packet basis identity'
);

const chatText = serializeDailyLearningPacketForChat(packet);
assert.match(chatText, /^KIANOS_DAILY_LEARNING_HANDOFF_V1/m);
assert.match(chatText, /HOW TO READ IT/);
assert.match(chatText, /WHAT CHAT SHOULD DO/);
assert.match(chatText, /LEARN state/);
assert.match(chatText, /kianos\.exam\.chat-plan\.v1/);
assert.match(chatText, /same study_day/);
assert.match(chatText, /learner_evidence_basis/);
assert.match(chatText, /unchanged/);
assert.match(chatText, /fresh Daily Learning Packet/i);
assert.match(chatText, /kianos-chat-plan-<study_day>\.json/);
assert.match(chatText, /Home .* 安排说明 .* Chat Plan/s);
assert.match(chatText, /CURRENT\.md/);
assert.doesNotMatch(chatText, /route through .*CURRENT\.md/i);
assert.match(chatText, /DAILY_PACKET_JSON/);
assert.match(chatText, /"total_minutes": 90/);
assert.match(chatText, /missing evidence means unknown/i);
assert.match(chatText, /"command_id": "control-20260917-proof-001"/);
assert.match(chatText, /transport receipt only/i);

const withXizong = attachDailySubjectPacket(packet, 'xizong', { schema: 'xizong.daily.v1', completed_blocks: ['B03'] });
assert.equal(withXizong.subjects.xizong.evidence.completed_blocks[0], 'B03');
assert.equal(packet.subjects.xizong.evidence, null, 'attach must not mutate the original packet');
assert.throws(() => attachDailySubjectPacket(packet, 'lexical', {}), /Unsupported subject/);
assert.throws(() => buildDailyLearningPacket({ storage, day: '2026-09-17', now: t0, plan: { ...plan, day: '2026-09-18' } }), /day mismatch/);

console.log('PASS daily learning packet: time + plan + opaque subject evidence + stable learner-evidence basis');
