import assert from 'node:assert/strict';
import {
  STUDY_TIMER_STATE_KEY,
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_SCHEMA
} from '../src/lib/studyTimer.mjs';
import { buildDailyLearningPacket, attachDailySubjectPacket, serializeDailyLearningPacketForChat } from '../src/lib/dailyLearningPacket.mjs';
import {
  PRIVATE_CONTROL_RUNTIME_STATE_KEY,
  PRIVATE_CONTROL_RUNTIME_STATE_SCHEMA
} from '../src/lib/privateControlRuntime.mjs';

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
  [PRIVATE_CONTROL_RUNTIME_STATE_KEY]: JSON.stringify({
    schema: PRIVATE_CONTROL_RUNTIME_STATE_SCHEMA,
    active_by_target: {},
    receipts: [{
      schema: 'kianos.private-control-receipt.v1',
      command_id: 'cmd-xz-1',
      target: 'xizong.session',
      study_day: '2026-09-17',
      issued_at: '2026-09-17T00:30:00.000Z',
      command_signature: 'cmd-deadbeef',
      status: 'APPLIED',
      detail: '',
      applied_at: '2026-09-17T00:31:00.000Z'
    }]
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
assert.equal(packet.control.last_receipt.command_id, 'cmd-xz-1');
assert.equal(packet.control.last_receipt.target, 'xizong.session');
assert.equal(packet.control.last_receipt.status, 'APPLIED');
assert.equal(packet.control.last_receipt.detail, '', 'successful receipt should not dump transport detail');

const chatText = serializeDailyLearningPacketForChat(packet);
assert.match(chatText, /^KIANOS_DAILY_LEARNING_HANDOFF_V1/m);
assert.match(chatText, /HOW TO READ IT/);
assert.match(chatText, /WHAT CHAT SHOULD DO/);
assert.match(chatText, /LEARN state/);
assert.match(chatText, /kianos\.exam\.chat-plan\.v1/);
assert.match(chatText, /same study_day/);
assert.match(chatText, /kianos-chat-plan-<study_day>\.json/);
assert.match(chatText, /Home .* 安排说明 .* Chat Plan/s);
assert.match(chatText, /CURRENT\.md/);
assert.doesNotMatch(chatText, /route through .*CURRENT\.md/i);
assert.match(chatText, /DAILY_PACKET_JSON/);
assert.match(chatText, /"total_minutes": 90/);
assert.match(chatText, /missing evidence means unknown/i);
assert.match(chatText, /transport acknowledgement only/i);
assert.match(chatText, /"command_id": "cmd-xz-1"/);

const withXizong = attachDailySubjectPacket(packet, 'xizong', { schema: 'xizong.daily.v1', completed_blocks: ['B03'] });
assert.equal(withXizong.subjects.xizong.evidence.completed_blocks[0], 'B03');
assert.equal(packet.subjects.xizong.evidence, null, 'attach must not mutate the original packet');
assert.throws(() => attachDailySubjectPacket(packet, 'lexical', {}), /Unsupported subject/);
assert.throws(() => buildDailyLearningPacket({ storage, day: '2026-09-17', now: t0, plan: { ...plan, day: '2026-09-18' } }), /day mismatch/);

console.log('PASS daily learning packet: time + plan + opaque subject evidence');
