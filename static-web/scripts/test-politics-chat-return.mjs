import assert from 'node:assert/strict';

import {
  PRACTICE_KEYS,
  politicsReviewPacket
} from '../src/lib/politicsPracticeState.mjs';
import {
  POLITICS_CHAT_RETURN_SCHEMA,
  applyPoliticsChatReturn,
  exportPoliticsCheckpoint,
  readPoliticsChatReturn,
  validatePoliticsPrivatePayload
} from '../src/lib/politicsChatReturn.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  key(index) { return [...this.map.keys()][index] ?? null; }
  get length() { return this.map.size; }
}

const day = '2026-09-19';
const catalog = {
  revision: 'politics-test-rev-1',
  questions: [
    {
      id: 'Q1', subject: 'marxism', subjectLabel: '马原', number: 1, type: 'single',
      chapter: 'c01', chapterTitle: '第一章', unitKey: 'marxism/c01/u01',
      unitId: 'u01', unitTitle: '自然单元 1', unitHref: '/politics/marxism/c01/#u01'
    },
    {
      id: 'Q2', subject: 'history', subjectLabel: '史纲', number: 2, type: 'single',
      chapter: 'c02', chapterTitle: '第二章', unitKey: 'history/c02/u02',
      unitId: 'u02', unitTitle: '自然单元 2', unitHref: '/politics/history/c02/#u02'
    }
  ],
  chapters: [],
  units: []
};

const attempts = {
  schema: 'kianos.politics.attempt_snapshot.v1',
  units: {
    'marxism/c01/u01': {
      unit_key: 'marxism/c01/u01',
      attempts: {
        Q1: {
          question_id: 'Q1',
          outcome: 'WRONG',
          selected: 'B',
          correct_answer: 'A',
          study_day: day,
          observed_at: '2026-09-19T01:00:00.000Z',
          source_context: { unit_key: 'marxism/c01/u01', source: 'xiao1000' }
        }
      }
    }
  }
};
const meta = {
  notes: { Q1: '这里总把必要条件看成充分条件' },
  causes: { Q1: 'understanding' },
  latestOutcome: { Q1: 'WRONG' },
  discussion: { Q1: true }
};
const evidence = [{
  question_id: 'Q1',
  outcome: 'WRONG',
  study_day: day,
  observed_at: '2026-09-19T01:00:00.000Z'
}];

const source = () => new MemoryStorage({
  [PRACTICE_KEYS.attempts]: JSON.stringify(attempts),
  [PRACTICE_KEYS.meta]: JSON.stringify(meta),
  [PRACTICE_KEYS.evidence]: JSON.stringify(evidence),
  [PRACTICE_KEYS.last]: JSON.stringify({
    href: '/politics/marxism/c01/#u01',
    subject: 'marxism',
    chapter: 'c01',
    title: '自然单元 1'
  })
});

const storage = source();
const snapshot = {
  attempts,
  meta,
  session: null,
  last: JSON.parse(storage.getItem(PRACTICE_KEYS.last)),
  events: evidence,
  errors: []
};
const outbound = politicsReviewPacket(catalog, snapshot, { day, filter: 'all', subject: 'all' });
assert.equal(outbound.schema, 'kianos.politics.return_packet.v1');
assert.ok(outbound.batch_id.startsWith('politics-review-'));
assert.deepEqual(outbound.scope, { filter: 'all', subject: 'all' });
assert.equal(outbound.review_context.length, 1);
assert.equal(outbound.review_context[0].question_id, 'Q1');

const validReturn = {
  schema: POLITICS_CHAT_RETURN_SCHEMA,
  direction: 'CHAT_TO_LEARNER',
  batch_id: outbound.batch_id,
  catalog_revision: outbound.catalog_revision,
  study_day: outbound.study_day,
  scope: outbound.scope,
  generated_at: '2026-09-19T02:00:00.000Z',
  verdict: 'FOLLOW_UP',
  diagnosis_summary: '同一个条件判断断点。',
  follow_ups: [{
    id: 'logic-condition-repair',
    question_ids: ['Q1'],
    action: 'SOURCE_RETURN',
    reason: '必要/充分条件边界不稳。',
    instruction: '回原学习单元只复核这个边界，再回来继续题目。'
  }]
};

const applied = applyPoliticsChatReturn(storage, catalog, validReturn, {
  now: Date.parse('2026-09-19T02:01:00.000Z')
});
assert.equal(applied.status, 'applied');
assert.equal(applied.value.follow_ups[0].contexts[0].unit_key, 'marxism/c01/u01');
assert.equal(applied.value.follow_ups[0].return_targets[0].href, '/politics/marxism/c01/#u01');
assert.equal(readPoliticsChatReturn(storage, outbound.batch_id).diagnosis_summary, '同一个条件判断断点。');

const replay = applyPoliticsChatReturn(storage, catalog, validReturn, {
  now: Date.parse('2026-09-19T02:02:00.000Z')
});
assert.equal(replay.status, 'idempotent');
assert.equal(readPoliticsChatReturn(storage, outbound.batch_id).applied_at, '2026-09-19T02:01:00.000Z');

await assert.rejects(async () => applyPoliticsChatReturn(storage, catalog, {
  ...validReturn,
  follow_ups: [{ ...validReturn.follow_ups[0], reason: '冲突的第二个解释' }]
}), /POLITICS_CHAT_RETURN_CONFLICT_KEEP_FIRST/);

const invalidQuestionStorage = source();
assert.throws(() => applyPoliticsChatReturn(invalidQuestionStorage, catalog, {
  ...validReturn,
  follow_ups: [{
    id: 'invented-question',
    question_ids: ['Q2'],
    action: 'RETEST',
    reason: '不应通过。',
    instruction: '不应执行。'
  }]
}), /POLITICS_CHAT_RETURN_QUESTION_OUT_OF_SCOPE/);

const staleStorage = source();
const staleMeta = { ...meta, latestOutcome: { Q1: 'STABLE' }, discussion: { Q1: false } };
staleStorage.setItem(PRACTICE_KEYS.meta, JSON.stringify(staleMeta));
assert.throws(() => applyPoliticsChatReturn(staleStorage, catalog, validReturn), /POLITICS_CHAT_RETURN_STALE_BATCH/);

const noActionStorage = source();
const noAction = applyPoliticsChatReturn(noActionStorage, catalog, {
  schema: POLITICS_CHAT_RETURN_SCHEMA,
  direction: 'CHAT_TO_LEARNER',
  batch_id: outbound.batch_id,
  catalog_revision: outbound.catalog_revision,
  study_day: outbound.study_day,
  scope: outbound.scope,
  generated_at: '2026-09-19T02:03:00.000Z',
  verdict: 'NO_ACTION',
  diagnosis_summary: '本批次不需要额外修补，继续主线。',
  follow_ups: []
});
assert.equal(noAction.value.verdict, 'NO_ACTION');

const checkpoint = exportPoliticsCheckpoint(storage);
assert.equal(checkpoint.schema, 'kianos.politics.private-payload.v1');
assert.ok(checkpoint.entries[PRACTICE_KEYS.attempts]);
assert.ok(Object.keys(checkpoint.entries).some((key) => key.startsWith('kianos-politics-chat-return-v1:')));
assert.ok(validatePoliticsPrivatePayload(checkpoint).length >= 5);

console.log('PASS politics typed Chat return: exact batch + stale rejection + idempotent replay + conflict safety + checkpoint');
