import assert from 'node:assert/strict';

import { buildHomeDailyLearningPacket } from '../src/lib/dailyLearningPacketRuntime.mjs';
import {
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_SCHEMA,
  STUDY_TIMER_STATE_KEY
} from '../src/lib/studyTimer.mjs';
import { PRACTICE_KEYS } from '../src/lib/politicsPracticeState.mjs';

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
  ['kianos-xizong-memory-review-v2:xizong:a2-r03']: JSON.stringify({
    evidenceHistory: [{
      type: 'KP_RECALL',
      kp_id: 'a2-r03-kp01',
      rating: 'fuzzy',
      evidence_origin: 'USER_RECALL_ATTEMPT',
      at: '2026-09-19T02:15:00.000Z'
    }]
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
assert.equal(result.packet.subjects.xizong.evidence.schema, 'kianos.xizong.daily_evidence.v1');
assert.equal(result.packet.subjects.xizong.evidence.current_block.schema, 'kianos.xizong.study_packet.v3');
assert.equal(result.packet.subjects.xizong.evidence.current_block.learning_state.resume.kp_id, 'a1-r01-kp02');
assert.equal(result.packet.subjects.xizong.evidence.current_block.learning_state.recall_ratings['a1-r01-kp02'], 'fuzzy');
assert.equal(result.packet.subjects.xizong.evidence.events.kp_recall.some((row) => row.block_id === 'a2-r03'), true,
  'Home packet must preserve same-day Xizong evidence outside the current Block');
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

const crossOnlyStorage = new MemoryStorage({
  [STUDY_TIMER_STATE_KEY]: JSON.stringify({
    schema: STUDY_TIMER_SCHEMA,
    running: false,
    manualPaused: true,
    subject: 'xizong',
    context: { subject: 'xizong', route: 'xizong/memory/', detailKey: 'memory', detailLabel: 'Memory' },
    segmentStartedAt: null,
    lastSeenAt: now,
    revision: 1,
    updatedAt: now
  }),
  [STUDY_TIMER_LEDGER_KEY]: JSON.stringify({ schema: STUDY_TIMER_SCHEMA, sessions: [] }),
  ['kianos-xizong-memory-v1']: JSON.stringify({
    schema: 'kianos.xizong.memory.v1',
    revision: 1,
    releasedBlocks: {},
    cards: {
      'core:a1-r01-kp01': {
        id: 'core:a1-r01-kp01',
        family: 'CORE',
        systemId: 'a1',
        blockId: 'a1-r01',
        kpId: 'a1-r01-kp01'
      }
    },
    promptOverrides: {},
    marks: {},
    evidence: [{
      id: 'memory:1',
      cardId: 'core:a1-r01-kp01',
      family: 'CORE',
      rating: 'fuzzy',
      origin: 'CORE_MEMORY_RECALL',
      at: '2026-09-19T02:10:00.000Z'
    }],
    attention: {},
    repairTasks: []
  })
});
const crossOnly = buildHomeDailyLearningPacket({
  storage: crossOnlyStorage,
  day,
  now,
  xizongPacketIndex,
  politicsCatalog,
  base: '/'
});
assert.equal(crossOnly.coverage.xizong, 'attached',
  'same-day Xizong review evidence must attach even without a resolvable current Block');
assert.equal(crossOnly.packet.subjects.xizong.evidence.current_block, null);
assert.equal(crossOnly.packet.subjects.xizong.evidence.events.memory_recall.length, 1);

const queueOnlyStorage = new MemoryStorage({
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
  [STUDY_TIMER_LEDGER_KEY]: JSON.stringify({ schema: STUDY_TIMER_SCHEMA, sessions: [] }),
  ['kianos-xizong-memory-v1']: JSON.stringify({
    schema: 'kianos.xizong.memory.v1',
    revision: 1,
    releasedBlocks: {
      'a1-r01': {
        blockId:'a1-r01', systemId:'a1', sourceHash:'queue-source',
        releasedAt:'2026-09-18T00:00:00.000Z', refreshedAt:'2026-09-18T00:00:00.000Z',
        coreCardIds:['core:a1-r01-kp01'], precisionCardIds:[]
      }
    },
    cards: {
      'core:a1-r01-kp01': {
        id:'core:a1-r01-kp01', family:'CORE', systemId:'a1',
        blockId:'a1-r01', kpId:'a1-r01-kp01', sourceHash:'queue-source'
      }
    },
    promptOverrides:{},
    marks:{},
    evidence:[],
    attention:{
      'core:a1-r01-kp01':{
        reviewRequested:true,
        reason:'LEARNER_REQUESTED',
        updatedAt:'2026-09-18T23:00:00.000Z'
      }
    },
    repairTasks:[]
  })
});
const queueOnly = buildHomeDailyLearningPacket({
  storage: queueOnlyStorage,
  day,
  now,
  xizongPacketIndex,
  politicsCatalog,
  base: '/'
});
assert.equal(queueOnly.coverage.xizong,'attached',
  'current Xizong review targets must attach before any new study-day evidence exists');
assert.equal(queueOnly.packet.subjects.xizong.evidence.events.memory_recall.length,0);
assert.equal(queueOnly.packet.subjects.xizong.evidence.current.memory_today.length,1);
assert.equal(queueOnly.packet.subjects.xizong.evidence.current.memory_today[0].source_hash,'queue-source');

const returnOnlyStorage = new MemoryStorage({
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
  [STUDY_TIMER_LEDGER_KEY]: JSON.stringify({ schema: STUDY_TIMER_SCHEMA, sessions: [] }),
  ['kianos:xizong:pending-chat-return:v1']: JSON.stringify({
    schema:'kianos.xizong.pending-chat-return.v1',
    pending_by_object:{
      'xizong:a1-r01':{
        handoff_id:'h1',
        return_id:'r1',
        object_id:'xizong:a1-r01',
        system_id:'a1',
        block_id:'a1-r01',
        source_hash:'source-hash-a1-r01',
        evidence_version:'ev-1',
        return_href:'/xizong/a1/r01/',
        received_at:'2026-09-19T02:55:00.000Z',
        return_packet:{schema:'kianos.xizong.chat_return.v1'}
      }
    },
    last_receipt:null
  })
});
const returnOnly = buildHomeDailyLearningPacket({
  storage:returnOnlyStorage,
  day,
  now,
  xizongPacketIndex,
  politicsCatalog,
  base:'/'
});
assert.equal(returnOnly.coverage.xizong,'attached',
  'pending typed Xizong Return must remain visible even before new learner evidence');
assert.equal(returnOnly.packet.subjects.xizong.evidence.current.pending_chat_returns.length,1);

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

console.log('PASS Home daily packet: subject-level Xizong evidence + English/Politics adapters + unknown fail-closed');
