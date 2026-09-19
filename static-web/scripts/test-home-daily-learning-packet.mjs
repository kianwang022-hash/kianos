import assert from 'node:assert/strict';

import { buildHomeDailyLearningPacket } from '../src/lib/dailyLearningPacketRuntime.mjs';
import {
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_SCHEMA,
  STUDY_TIMER_STATE_KEY
} from '../src/lib/studyTimer.mjs';
import { PRACTICE_KEYS } from '../src/lib/politicsPracticeState.mjs';
import { POLITICS_MEMORY_EVIDENCE_KEY } from '../src/lib/politicsMemoryRuntime.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  key(index) { return [...this.map.keys()][index] ?? null; }
  get length() { return this.map.size; }
}

const day = '2026-09-19';
const now = Date.parse('2026-09-19T03:00:00.000Z');
const xizongObject = 'xizong:a1-r01';
const xizongStateKey = `kianos-xizong-astro-v2:${xizongObject}`;

const xizongPacketIndex = [{
  systemId: 'a1',
  slug: 'r01',
  blockId: 'a1-r01',
  blockLabel: 'B01',
  packetMeta: {
    objectId: xizongObject,
    systemId: 'a1',
    canonicalId: 'A1',
    blockId: 'a1-r01',
    blockLabel: 'B01',
    blockTitle: '循环代表 Block',
    sourcePath: 'content/xizong/knowledge/systems/a1/blocks/B01.md',
    sourceHash: 'source-hash-a1-r01',
    sourceContactMode: 'WHOLE_LOGIC_GROUP',
    sourcePerGroup: false,
    reserveItems: []
  },
  kpRows: [
    {
      kpId: 'a1-r01-kp01',
      displayId: 'KP01',
      title: '第一知识包',
      groupId: 'a1-r01-lg01',
      groupLabel: '第一学习节',
      sourceLocator: 'P10',
      prompt: '第一提示'
    },
    {
      kpId: 'a1-r01-kp02',
      displayId: 'KP02',
      title: '第二知识包',
      groupId: 'a1-r01-lg01',
      groupLabel: '第一学习节',
      sourceLocator: 'P11',
      prompt: '第二提示'
    }
  ]
}];

const politicsCatalog = {
  revision: 'politics-home-rev-1',
  questions: [{
    id: 'P1',
    subject: 'marxism',
    subjectLabel: '马原',
    number: 1,
    type: 'single',
    chapter: 'c01',
    chapterTitle: '第一章',
    unitKey: 'marxism/c01/u01',
    unitId: 'u01',
    unitTitle: '自然单元 1',
    unitHref: '/politics/marxism/c01/'
  }],
  chapters: [{ subject: 'marxism', code: 'c01', title: '第一章' }],
  units: []
};

const storage = new MemoryStorage({
  [STUDY_TIMER_STATE_KEY]: JSON.stringify({
    schema: STUDY_TIMER_SCHEMA,
    running: false,
    manualPaused: true,
    subject: 'politics',
    context: { subject: 'politics', route: 'politics/practice/', detailKey: 'xiao1000', detailLabel: '肖1000' },
    segmentStartedAt: null,
    lastSeenAt: now,
    revision: 1,
    updatedAt: now
  }),
  [STUDY_TIMER_LEDGER_KEY]: JSON.stringify({
    schema: STUDY_TIMER_SCHEMA,
    sessions: [
      {
        id: 'xz',
        subject: 'xizong',
        context: { subject: 'xizong', route: 'xizong/a1/r01/', detailKey: 'A1/B01', detailLabel: 'A1 B01' },
        startedAt: now - 100 * 60 * 1000,
        endedAt: now - 60 * 60 * 1000,
        source: 'timer'
      },
      {
        id: 'en',
        subject: 'english',
        context: { subject: 'english', route: 'reading/', detailKey: 'reading-a', detailLabel: 'Reading A' },
        startedAt: now - 60 * 60 * 1000,
        endedAt: now - 30 * 60 * 1000,
        source: 'timer'
      },
      {
        id: 'pol',
        subject: 'politics',
        context: { subject: 'politics', route: 'politics/practice/', detailKey: 'xiao1000', detailLabel: '肖1000' },
        startedAt: now - 30 * 60 * 1000,
        endedAt: now,
        source: 'timer'
      }
    ]
  }),
  ['kianos-xizong-last-location-v1']: JSON.stringify({
    systemId: 'a1',
    blockSlug: 'r01',
    blockLabel: 'B01',
    href: '/xizong/a1/r01/',
    observed_at: '2026-09-19T02:20:00.000Z'
  }),
  [xizongStateKey]: JSON.stringify({
    schema: 'kianos.xizong.block-state.v2',
    stage: 'kp_recall',
    groupIndex: 0,
    kpIndex: 1,
    learned: { 'a1-r01-kp01': true, 'a1-r01-kp02': true },
    ratings: { 'a1-r01-kp01': 'known', 'a1-r01-kp02': 'fuzzy' },
    ttsxEvidence: {},
    ttsxAnnotations: {},
    pendingTtsx: null,
    sourceContactDone: true,
    sourceContactEvidence: [],
    blockRecallDone: false,
    completed: false
  }),
  ['kianos-reading-attempt-v1:reading-2025-a']: JSON.stringify({
    binding: {
      task: 'reading_a',
      object_id: 'reading-2025-a',
      source_hash: 'english-hash',
      attempt_id: 'en-attempt-1',
      prior_exposure: 'unknown',
      assistance: 'unassisted'
    },
    submitted: true,
    saved_at: '2026-09-19T02:40:00.000Z'
  }),
  [PRACTICE_KEYS.attempts]: JSON.stringify({
    schema: 'kianos.politics.attempt_snapshot.v1',
    units: {
      'marxism/c01/u01': {
        unit_key: 'marxism/c01/u01',
        attempts: {
          P1: {
            question_id: 'P1',
            outcome: 'UNCERTAIN',
            selected: 'A',
            correct_answer: 'A',
            uncertain: true,
            study_day: day,
            observed_at: '2026-09-19T02:50:00.000Z'
          }
        }
      }
    }
  }),
  [PRACTICE_KEYS.meta]: JSON.stringify({
    latestOutcome: { P1: 'UNCERTAIN' },
    notes: { P1: '边界仍不稳' },
    causes: { P1: 'understanding' }
  }),
  [PRACTICE_KEYS.evidence]: JSON.stringify([
    { question_id: 'P1', outcome: 'UNCERTAIN', study_day: day, observed_at: '2026-09-19T02:50:00.000Z' }
  ]),
  [PRACTICE_KEYS.last]: JSON.stringify({
    href: '/politics/marxism/c01/',
    subject: 'marxism',
    chapter: 'c01',
    title: '自然单元 1'
  })
});

const result = buildHomeDailyLearningPacket({
  storage,
  day,
  now,
  plan: null,
  xizongPacketIndex,
  politicsCatalog,
  base: '/'
});

assert.deepEqual(result.coverage, {
  xizong: 'attached',
  english: 'attached',
  politics: 'attached'
});
assert.deepEqual(result.warnings, []);
assert.equal(result.packet.subjects.xizong.evidence.schema, 'kianos.xizong.study_packet.v3');
assert.equal(result.packet.subjects.xizong.evidence.learning_state.resume.kp_id, 'a1-r01-kp02');
assert.equal(result.packet.subjects.xizong.evidence.learning_state.recall_ratings['a1-r01-kp02'], 'fuzzy');
assert.equal(result.packet.subjects.english.evidence.schema, 'kianos.english.evidence.v1');
assert.equal(result.packet.subjects.politics.evidence.schema, 'kianos.politics.study_packet.v1');
assert.equal(result.packet.subjects.xizong.time.minutes, 40);
assert.equal(result.packet.subjects.english.time.minutes, 30);
assert.equal(result.packet.subjects.politics.time.minutes, 30);

const emptyStorage = new MemoryStorage({
  [STUDY_TIMER_STATE_KEY]: JSON.stringify({
    schema: STUDY_TIMER_SCHEMA,
    running: false,
    manualPaused: true,
    subject: null,
    context: null,
    segmentStartedAt: null,
    lastSeenAt: now,
    revision: 1,
    updatedAt: now
  }),
  [STUDY_TIMER_LEDGER_KEY]: JSON.stringify({ schema: STUDY_TIMER_SCHEMA, sessions: [] })
});
const empty = buildHomeDailyLearningPacket({
  storage: emptyStorage,
  day,
  now,
  xizongPacketIndex,
  politicsCatalog,
  base: '/'
});
assert.deepEqual(empty.coverage, { xizong: 'unknown', english: 'unknown', politics: 'unknown' });
assert.equal(empty.packet.subjects.xizong.evidence, null);
assert.equal(empty.packet.subjects.english.evidence, null);
assert.equal(empty.packet.subjects.politics.evidence, null);


const corruptPoliticsMemory = new MemoryStorage(Object.fromEntries(storage.map.entries()));
corruptPoliticsMemory.setItem(POLITICS_MEMORY_EVIDENCE_KEY, '{bad-json');
const partialMemory = buildHomeDailyLearningPacket({
  storage: corruptPoliticsMemory,
  day,
  now,
  xizongPacketIndex,
  politicsCatalog,
  base: '/'
});
assert.equal(partialMemory.coverage.politics, 'attached');
assert.equal(partialMemory.packet.subjects.politics.evidence.today.uncertain_count, 1);
assert.equal(partialMemory.packet.subjects.politics.evidence.memory, null);
assert.ok(partialMemory.warnings.some((row) => row.includes('politics-memory:POLITICS_MEMORY_EVIDENCE_INVALID')));

const corruptPolitics = new MemoryStorage(Object.fromEntries(storage.map.entries()));
corruptPolitics.setItem(PRACTICE_KEYS.meta, '{bad-json');
const partial = buildHomeDailyLearningPacket({
  storage: corruptPolitics,
  day,
  now,
  xizongPacketIndex,
  politicsCatalog,
  base: '/'
});
assert.equal(partial.coverage.xizong, 'attached');
assert.equal(partial.coverage.english, 'attached');
assert.equal(partial.coverage.politics, 'unknown');
assert.equal(partial.packet.subjects.politics.evidence, null);
assert.ok(partial.warnings.some((row) => row.includes('POLITICS_EVIDENCE_UNREADABLE')));

console.log('PASS Home daily packet: one envelope + three subject evidence adapters + unknown fail-closed');
