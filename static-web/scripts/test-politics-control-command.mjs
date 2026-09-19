import assert from 'node:assert/strict';
import {
  POLITICS_CONTROL_COMMAND_SCHEMA,
  POLITICS_CONTROL_RECEIPT_PREFIX,
  applyPoliticsControlCommand
} from '../src/lib/politicsControlCommand.mjs';
import { PRACTICE_KEYS, politicsReviewPacket } from '../src/lib/politicsPracticeState.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  key(index) { return [...this.map.keys()][index] ?? null; }
  get length() { return this.map.size; }
}

const day = '2026-09-20';
const now = Date.parse('2026-09-20T01:55:00+08:00');
const q = {
  id: 'politics-q-001',
  number: '1',
  type: 'single',
  subject: 'marxism',
  subjectLabel: '马克思主义基本原理',
  chapter: 'c01',
  chapterTitle: '第一章',
  unitKey: 'marxism/c01/u01',
  unitId: 'u01',
  unitTitle: '单元一',
  unitHref: '/politics/marxism/c01/#source-u01'
};
const catalog = {
  revision: 'catalog-r1',
  questions: [q],
  units: [{ key: q.unitKey, subject: q.subject, chapter: q.chapter, title: q.unitTitle, href: q.unitHref }],
  chapters: [{ subject: q.subject, code: q.chapter, key: q.subject + '/' + q.chapter, title: q.chapterTitle }],
  subjects: [{ id: q.subject, label: q.subjectLabel }]
};
const first = {
  question_id: q.id,
  outcome: 'WRONG',
  selected: 'B',
  correct_answer: 'A',
  study_day: day,
  observed_at: '2026-09-20T00:30:00.000Z',
  source_context: {
    subject: q.subject,
    chapter: q.chapter,
    unit_id: q.unitId,
    unit_key: q.unitKey,
    source_href: q.unitHref
  }
};
const storage = new MemoryStorage({
  [PRACTICE_KEYS.attempts]: JSON.stringify({
    schema: 'kianos.politics.attempt_snapshot.v1',
    units: {
      [q.unitKey]: {
        unit_key: q.unitKey,
        natural_unit_id: q.unitId,
        first_observed_at: first.observed_at,
        last_observed_at: first.observed_at,
        attempts: { [q.id]: first }
      }
    }
  }),
  [PRACTICE_KEYS.meta]: JSON.stringify({
    schema: 'kianos.politics.practice_meta.v1',
    favorites: {},
    discussion: {},
    causes: { [q.id]: 'understanding' },
    notes: {},
    latestOutcome: { [q.id]: 'WRONG' }
  }),
  [PRACTICE_KEYS.evidence]: JSON.stringify([]),
  [PRACTICE_KEYS.session]: JSON.stringify(null),
  [PRACTICE_KEYS.last]: JSON.stringify(null)
});

const packet = politicsReviewPacket(catalog, {
  attempts: JSON.parse(storage.getItem(PRACTICE_KEYS.attempts)),
  meta: JSON.parse(storage.getItem(PRACTICE_KEYS.meta)),
  session: null,
  last: null,
  events: [],
  errors: []
}, { day, filter: 'all', subject: 'all' });

const chatReturn = {
  schema: 'kianos.politics.chat-return.v1',
  direction: 'CHAT_TO_LEARNER',
  batch_id: packet.batch_id,
  catalog_revision: packet.catalog_revision,
  study_day: day,
  scope: packet.scope,
  generated_at: new Date(now).toISOString(),
  verdict: 'FOLLOW_UP',
  diagnosis_summary: '当前更像理解问题，先回源后再测。',
  follow_ups: [{
    id: 'f1',
    action: 'SOURCE_RETURN',
    reason: '先核对原讲义关系。',
    instruction: '回这个 Natural Unit 看清关系后继续主线。',
    question_ids: [q.id]
  }]
};

const command = {
  schema: POLITICS_CONTROL_COMMAND_SCHEMA,
  command_id: 'pcmd-001',
  study_day: day,
  issued_at: new Date(now).toISOString(),
  payload: chatReturn
};

const applied = applyPoliticsControlCommand(storage, catalog, command, { expectedDay: day, now });
assert.equal(applied.status, 'applied');
assert.equal(applied.receipt.status, 'APPLIED');
assert.ok(storage.getItem(POLITICS_CONTROL_RECEIPT_PREFIX + command.command_id));

const replay = applyPoliticsControlCommand(storage, catalog, command, { expectedDay: day, now });
assert.equal(replay.status, 'idempotent');

const staleCommand = {
  ...command,
  command_id: 'pcmd-stale',
  study_day: '2026-09-19',
  payload: { ...chatReturn, study_day: '2026-09-19' }
};
assert.throws(() => applyPoliticsControlCommand(storage, catalog, staleCommand, {
  expectedDay: day,
  now
}), /POLITICS_CONTROL_STALE_DAY/);

const correctedSameBatch = {
  ...command,
  command_id: 'pcmd-002',
  issued_at: new Date(now + 1_000).toISOString(),
  payload: {
    ...chatReturn,
    generated_at: new Date(now + 1_000).toISOString(),
    diagnosis_summary: '继续讨论后判断无需额外动作。',
    verdict: 'NO_ACTION',
    follow_ups: []
  }
};
const correction = applyPoliticsControlCommand(storage, catalog, correctedSameBatch, {
  expectedDay: day,
  now: now + 1_000
});
assert.equal(correction.status, 'rejected');
assert.match(correction.receipt.error, /CONFLICT_KEEP_FIRST/);

console.log('PASS politics control prototype; same-batch Chat correction currently fails closed by design');
