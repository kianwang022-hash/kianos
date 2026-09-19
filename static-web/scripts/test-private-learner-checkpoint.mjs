import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  PRIVATE_CHECKPOINT_SCHEMA,
  readPrivateLearnerCheckpoint as readFileCheckpoint,
  writePrivateLearnerCheckpoint as writeFileCheckpoint
} from './privateLearnerStore.mjs';
import {
  buildPrivateLearnerCheckpoint,
  readPrivateLearnerCheckpoint as readRemoteCheckpoint,
  writePrivateLearnerCheckpoint as writeRemoteCheckpoint
} from '../src/lib/privateLearnerCheckpoint.mjs';
import {
  captureSharedControlCheckpoint,
  restoreSharedControlCheckpoint,
  SHARED_CONTROL_CHECKPOINT_SCHEMA
} from '../src/lib/sharedControlCheckpoint.mjs';
import {
  initPrivateCheckpointAutosave,
  restoreSharedControlFromPrivate,
  saveSharedControlToPrivate,
  sharedControlStorageIsEmpty
} from '../src/lib/privateCheckpointRuntime.mjs';
import {
  EXAM_CHAT_PLAN_KEY,
  EXAM_CHAT_PLAN_SCHEMA
} from '../src/lib/examChatPlan.mjs';
import {
  EXAM_PROFILE_KEY,
  emptyExamProfile
} from '../src/lib/examOrchestrator.mjs';
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
const now = Date.parse('2026-09-19T01:00:00Z');
const profile = emptyExamProfile();
const chatPlan = {
  schema: EXAM_CHAT_PLAN_SCHEMA,
  study_day: day,
  generated_at: new Date(now).toISOString(),
  subjects: {
    xizong: { target_minutes: 360, role: '主推进', note: 'continue current block' },
    english: { target_minutes: 120, role: '保连续' },
    politics: { target_minutes: 90, role: '稳推进' }
  },
  next_subject: 'xizong',
  attention: { text: '先继续西综。', action: '查看依据' }
};
const timerState = {
  schema: STUDY_TIMER_SCHEMA,
  running: false,
  manualPaused: true,
  subject: 'xizong',
  context: { subject: 'xizong', route: 'xizong/a1/', detailKey: 'A1/B03', detailLabel: 'A1 B03' },
  segmentStartedAt: null,
  lastSeenAt: now,
  revision: 1,
  updatedAt: now
};
const timerLedger = {
  schema: STUDY_TIMER_SCHEMA,
  sessions: [{
    id: 's1',
    subject: 'xizong',
    context: timerState.context,
    startedAt: now - 3600000,
    endedAt: now,
    source: 'timer'
  }]
};

const source = new MemoryStorage({
  [EXAM_PROFILE_KEY]: JSON.stringify(profile),
  [EXAM_CHAT_PLAN_KEY]: JSON.stringify(chatPlan),
  [STUDY_TIMER_STATE_KEY]: JSON.stringify(timerState),
  [STUDY_TIMER_LEDGER_KEY]: JSON.stringify(timerLedger)
});

const shared = captureSharedControlCheckpoint(source, { studyDay: day, now });
assert.equal(shared.schema, SHARED_CONTROL_CHECKPOINT_SCHEMA);
assert.equal(shared.chat_plan.next_subject, 'xizong');
assert.equal(shared.study_timer_ledger.sessions.length, 1);

const checkpoint = buildPrivateLearnerCheckpoint({
  studyDay: day,
  now,
  shared,
  subjects: {}
});
assert.equal(checkpoint.schema, PRIVATE_CHECKPOINT_SCHEMA);
assert.equal(checkpoint.study_day, day);

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-private-checkpoint-'));
try {
  const saved = writeFileCheckpoint(checkpoint, dir);
  const loaded = readFileCheckpoint(dir);
  assert.equal(saved.checkpoint_id, loaded.checkpoint_id);
  assert.equal(loaded.payload.shared.schema, SHARED_CONTROL_CHECKPOINT_SCHEMA);
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

let remoteSaved = null;
const fakeFetch = async (_url, options = {}) => {
  if (options.method === 'PUT') {
    remoteSaved = JSON.parse(options.body);
    return new Response(JSON.stringify({ status: 'saved', checkpoint_id: remoteSaved.checkpoint_id }), { status: 200 });
  }
  if (!remoteSaved) return new Response(JSON.stringify({ status: 'missing' }), { status: 404 });
  return new Response(JSON.stringify({ status: 'ready', checkpoint: remoteSaved }), { status: 200 });
};
await writeRemoteCheckpoint(checkpoint, { fetchImpl: fakeFetch });
const remoteRead = await readRemoteCheckpoint({ fetchImpl: fakeFetch });
assert.equal(remoteRead.status, 'ready');
assert.equal(remoteRead.checkpoint.payload.shared.chat_plan.next_subject, 'xizong');

const target = new MemoryStorage();
restoreSharedControlCheckpoint(target, remoteRead.checkpoint.payload.shared, { expectedDay: day });
assert.equal(JSON.parse(target.getItem(EXAM_CHAT_PLAN_KEY)).next_subject, 'xizong');
assert.equal(JSON.parse(target.getItem(STUDY_TIMER_LEDGER_KEY)).sessions.length, 1);

const staleStorage = new MemoryStorage({
  [EXAM_CHAT_PLAN_KEY]: JSON.stringify({ ...chatPlan, study_day: '2026-09-18' }),
  [STUDY_TIMER_STATE_KEY]: JSON.stringify(timerState),
  [STUDY_TIMER_LEDGER_KEY]: JSON.stringify(timerLedger)
});
const staleShared = captureSharedControlCheckpoint(staleStorage, { studyDay: day, now });
assert.equal(staleShared.chat_plan, null, 'stale Chat plan must not be promoted into durable checkpoint');

assert.throws(() => writeFileCheckpoint({ ...checkpoint, schema: 'wrong' }, os.tmpdir()), /SCHEMA_INVALID/);

const empty = new MemoryStorage();
assert.equal(sharedControlStorageIsEmpty(empty), true);
const restoredRuntime = await restoreSharedControlFromPrivate(empty, {
  now,
  readCheckpoint: async () => ({ status: 'ready', checkpoint })
});
assert.equal(restoredRuntime.status, 'restored');
assert.equal(JSON.parse(empty.getItem(EXAM_CHAT_PLAN_KEY)).next_subject, 'xizong');

const present = new MemoryStorage({ [STUDY_TIMER_STATE_KEY]: JSON.stringify(timerState) });
const skippedRuntime = await restoreSharedControlFromPrivate(present, {
  now,
  readCheckpoint: async () => ({ status: 'ready', checkpoint })
});
assert.equal(skippedRuntime.status, 'skipped');

const yesterdayCheckpoint = buildPrivateLearnerCheckpoint({
  studyDay: '2026-09-18',
  now: now - 86400000,
  shared: {
    ...shared,
    study_day: '2026-09-18',
    chat_plan: { ...chatPlan, study_day: '2026-09-18', generated_at: new Date(now - 86400000).toISOString() }
  },
  subjects: { future_subject: { schema: 'future.subject.payload.v1', keep: true } }
});
const nextDay = new MemoryStorage();
const crossDay = await restoreSharedControlFromPrivate(nextDay, {
  now,
  readCheckpoint: async () => ({ status: 'ready', checkpoint: yesterdayCheckpoint })
});
assert.equal(crossDay.status, 'restored');
assert.equal(nextDay.getItem(EXAM_CHAT_PLAN_KEY), null, 'previous-day Chat plan must not revive');
assert.equal(JSON.parse(nextDay.getItem(STUDY_TIMER_LEDGER_KEY)).sessions.length, 1, 'durable timer history survives day boundary');

let writtenCheckpoint = null;
await saveSharedControlToPrivate(source, {
  now,
  readCheckpoint: async () => ({ status: 'ready', checkpoint: yesterdayCheckpoint }),
  writeCheckpoint: async (value) => { writtenCheckpoint = value; return { status: 'saved' }; }
});
assert.equal(writtenCheckpoint.payload.subjects.future_subject.keep, true, 'shared autosave must preserve future subject-owned payloads');

const xizongStudyKey = 'kianos-xizong-astro-v2:xizong:circulation-b01';
const xizongEvidenceKey = 'kianos-xizong-memory-review-v2:xizong:circulation-b01';
const xizongLastKey = 'kianos-xizong-last-location-v1';
const xizongSource = new MemoryStorage({
  [xizongStudyKey]: JSON.stringify({
    stage: 'kp_recall',
    kpIndex: 0,
    ratings: { 'circulation-b01-kp01': 'fuzzy' },
    learned: { 'circulation-b01-kp01': true }
  }),
  [xizongEvidenceKey]: JSON.stringify({
    evidenceHistory: [{ type: 'KP_RECALL', kp_id: 'circulation-b01-kp01', rating: 'fuzzy' }]
  }),
  [xizongLastKey]: JSON.stringify({
    href: '/xizong/circulation/b01/',
    systemId: 'circulation',
    blockSlug: 'b01'
  })
});
let xizongSaved = null;
await saveSharedControlToPrivate(xizongSource, {
  now,
  readCheckpoint: async () => ({ status: 'missing', checkpoint: null }),
  writeCheckpoint: async (value) => { xizongSaved = value; return { status: 'saved' }; }
});
assert.equal(xizongSaved.payload.subjects.xizong.schema, 'kianos.xizong.private-checkpoint.v1');
assert.equal(xizongSaved.payload.subjects.xizong.entry_count, 3);
assert.ok(xizongSaved.payload.subjects.xizong.entries.some((row) => row.key === xizongStudyKey));

const wiped = new MemoryStorage();
const restoreXizong = await restoreSharedControlFromPrivate(wiped, {
  now,
  readCheckpoint: async () => ({ status: 'ready', checkpoint: xizongSaved })
});
assert.equal(restoreXizong.status, 'restored');
assert.equal(restoreXizong.subjects.xizong.status, 'restored');
assert.equal(JSON.parse(wiped.getItem(xizongStudyKey)).ratings['circulation-b01-kp01'], 'fuzzy');
assert.equal(JSON.parse(wiped.getItem(xizongLastKey)).href, '/xizong/circulation/b01/');

const existingXizong = new MemoryStorage({
  [xizongStudyKey]: JSON.stringify({ stage: 'kp_recall', ratings: { 'circulation-b01-kp01': 'mastered' } })
});
const noOverwrite = await restoreSharedControlFromPrivate(existingXizong, {
  now,
  readCheckpoint: async () => ({ status: 'ready', checkpoint: xizongSaved })
});
assert.notEqual(JSON.parse(existingXizong.getItem(xizongStudyKey)).ratings['circulation-b01-kp01'], 'fuzzy',
  'automatic restore must not overwrite existing Xizong learner state');
assert.equal(noOverwrite.subjects?.xizong?.status || 'skipped', 'skipped');

let failedReadWrites = 0;
await assert.rejects(
  () => saveSharedControlToPrivate(xizongSource, {
    now,
    readCheckpoint: async () => ({ status: 'unavailable', checkpoint: null, error: 'disk temporarily unreadable' }),
    writeCheckpoint: async () => { failedReadWrites += 1; }
  }),
  /PRIVATE_CHECKPOINT_EXISTING_READ_UNSAFE/
);
assert.equal(failedReadWrites, 0, 'failed existing-checkpoint read must authorize zero writes');

const corruptXizong = new MemoryStorage({
  [xizongStudyKey]: '{not-json'
});
let corruptWrites = 0;
await assert.rejects(
  () => saveSharedControlToPrivate(corruptXizong, {
    now,
    readCheckpoint: async () => ({ status: 'missing', checkpoint: null }),
    writeCheckpoint: async () => { corruptWrites += 1; }
  }),
  /XIZONG_CHECKPOINT_ENTRY_JSON_INVALID/
);
assert.equal(corruptWrites, 0, 'corrupt Xizong source state must not produce a partial checkpoint');


const englishExposureKey = 'kianos-english-material-exposure-v1';
const externalAttemptKey = 'kianos-english-external-reading-attempt-v1:tpo56-p1';
const lexicalLedgerKey = 'kianos-lexical-evidence-ledger-v2';
const englishExposure = {
  schema: 'kianos.english.material-exposure.v1',
  materials: {
    'tpo56-p1': {
      object_id: 'tpo56-p1',
      events: [{ event_id: 'attempt-1:opened', attempt_id: 'attempt-1', event: 'opened', at: new Date(now).toISOString() }]
    }
  }
};
const externalAttempt = {
  binding: {
    task: 'external_reading',
    object_id: 'tpo56-p1',
    source_hash: 'synthetic-external-hash',
    attempt_id: 'attempt-1',
    revision: 1,
    prior_exposure: 'unknown',
    assistance: 'unassisted'
  },
  stage: 'completed',
  submitted: false
};
const lexicalLedger = {
  schema: 'kianos.lexical.evidence_ledger.v2',
  events: [],
  conflicts: [],
  identity_lineage: {}
};
const politicsAttempts = {
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
          observed_at: new Date(now).toISOString()
        }
      }
    }
  }
};
const politicsMeta = {
  latestOutcome: { P1: 'UNCERTAIN' },
  notes: { P1: '保留这次犹豫点' },
  causes: { P1: 'understanding' }
};
const politicsEvidence = [{
  question_id: 'P1',
  outcome: 'UNCERTAIN',
  study_day: day,
  observed_at: new Date(now).toISOString()
}];
const combinedSource = new MemoryStorage({
  [EXAM_PROFILE_KEY]: JSON.stringify(profile),
  [EXAM_CHAT_PLAN_KEY]: JSON.stringify(chatPlan),
  [STUDY_TIMER_STATE_KEY]: JSON.stringify(timerState),
  [STUDY_TIMER_LEDGER_KEY]: JSON.stringify(timerLedger),
  [xizongStudyKey]: xizongSource.getItem(xizongStudyKey),
  [xizongEvidenceKey]: xizongSource.getItem(xizongEvidenceKey),
  [xizongLastKey]: xizongSource.getItem(xizongLastKey),
  [englishExposureKey]: JSON.stringify(englishExposure),
  [externalAttemptKey]: JSON.stringify(externalAttempt),
  [lexicalLedgerKey]: JSON.stringify(lexicalLedger),
  [PRACTICE_KEYS.attempts]: JSON.stringify(politicsAttempts),
  [PRACTICE_KEYS.meta]: JSON.stringify(politicsMeta),
  [PRACTICE_KEYS.evidence]: JSON.stringify(politicsEvidence),
  [PRACTICE_KEYS.last]: JSON.stringify({
    href: '/politics/marxism/c01/#u01',
    subject: 'marxism',
    chapter: 'c01',
    title: '自然单元 1'
  })
});
let combinedSaved = null;
await saveSharedControlToPrivate(combinedSource, {
  now,
  readCheckpoint: async () => ({ status: 'missing', checkpoint: null }),
  writeCheckpoint: async (value) => { combinedSaved = value; return { status: 'saved' }; }
});
assert.equal(combinedSaved.payload.subjects.xizong.schema, 'kianos.xizong.private-checkpoint.v1');
assert.equal(combinedSaved.payload.subjects.english.schema, 'kianos.english.private-payload.v1');
assert.equal(combinedSaved.payload.subjects.politics.schema, 'kianos.politics.private-payload.v1');
assert.equal(combinedSaved.payload.subjects.lexical.schema, 'kianos.lexical.private-payload.v1');
assert.ok(combinedSaved.payload.subjects.politics.entries[PRACTICE_KEYS.attempts],
  'Politics attempts must be captured by the shared Politics checkpoint');
assert.ok(combinedSaved.payload.subjects.english.entries[externalAttemptKey],
  'External Reading private attempt must be captured by the shared English checkpoint');

const combinedRestore = new MemoryStorage();
const combinedRestored = await restoreSharedControlFromPrivate(combinedRestore, {
  now,
  readCheckpoint: async () => ({ status: 'ready', checkpoint: combinedSaved })
});
assert.equal(combinedRestored.status, 'restored');
assert.equal(combinedRestored.subjects.xizong.status, 'restored');
assert.equal(combinedRestored.subjects.english.status, 'restored');
assert.equal(combinedRestored.subjects.politics.status, 'restored');
assert.equal(combinedRestored.subjects.lexical.status, 'restored');
assert.equal(JSON.parse(combinedRestore.getItem(externalAttemptKey)).binding.object_id, 'tpo56-p1');
assert.equal(JSON.parse(combinedRestore.getItem(englishExposureKey)).materials['tpo56-p1'].object_id, 'tpo56-p1');
assert.equal(JSON.parse(combinedRestore.getItem(lexicalLedgerKey)).schema, 'kianos.lexical.evidence_ledger.v2');
assert.equal(JSON.parse(combinedRestore.getItem(PRACTICE_KEYS.attempts)).units['marxism/c01/u01'].attempts.P1.outcome, 'UNCERTAIN');

const englishConflict = new MemoryStorage({
  [englishExposureKey]: JSON.stringify({
    schema: 'kianos.english.material-exposure.v1',
    materials: { local: { object_id: 'local', events: [] } }
  })
});
await assert.rejects(
  () => restoreSharedControlFromPrivate(englishConflict, {
    now,
    readCheckpoint: async () => ({ status: 'ready', checkpoint: combinedSaved })
  }),
  /PRIVATE_CHECKPOINT_ENGLISH_CONFLICT_KEEP_LOCAL/
);
assert.deepEqual(JSON.parse(englishConflict.getItem(englishExposureKey)).materials, {
  local: { object_id: 'local', events: [] }
}, 'English conflict must keep local truth');
assert.equal(englishConflict.getItem(EXAM_CHAT_PLAN_KEY), null,
  'English conflict must reject before shared control is restored');
assert.equal(englishConflict.getItem(xizongStudyKey), null,
  'English conflict must reject before Xizong is partially restored');
assert.equal(englishConflict.getItem(lexicalLedgerKey), null,
  'English conflict must reject before Lexical is partially restored');

const politicsConflict = new MemoryStorage({
  [PRACTICE_KEYS.attempts]: JSON.stringify({
    schema: 'kianos.politics.attempt_snapshot.v1',
    units: {
      'marxism/c01/u01': {
        unit_key: 'marxism/c01/u01',
        attempts: {
          P1: {
            question_id: 'P1',
            outcome: 'STABLE',
            selected: 'A',
            correct_answer: 'A',
            study_day: day,
            observed_at: new Date(now + 1000).toISOString()
          }
        }
      }
    }
  })
});
await assert.rejects(
  () => restoreSharedControlFromPrivate(politicsConflict, {
    now,
    readCheckpoint: async () => ({ status: 'ready', checkpoint: combinedSaved })
  }),
  /PRIVATE_CHECKPOINT_POLITICS_CONFLICT_KEEP_LOCAL/
);
assert.equal(JSON.parse(politicsConflict.getItem(PRACTICE_KEYS.attempts)).units['marxism/c01/u01'].attempts.P1.outcome, 'STABLE',
  'Politics conflict must keep local truth');
assert.equal(politicsConflict.getItem(EXAM_CHAT_PLAN_KEY), null,
  'Politics conflict must reject before shared control is restored');
assert.equal(politicsConflict.getItem(xizongStudyKey), null,
  'Politics conflict must reject before Xizong is partially restored');

const lexicalConflict = new MemoryStorage({
  [lexicalLedgerKey]: JSON.stringify({
    schema: 'kianos.lexical.evidence_ledger.v2',
    events: [{ event_id: 'local-only' }],
    conflicts: [],
    identity_lineage: {}
  })
});
await assert.rejects(
  () => restoreSharedControlFromPrivate(lexicalConflict, {
    now,
    readCheckpoint: async () => ({ status: 'ready', checkpoint: combinedSaved })
  }),
  /PRIVATE_CHECKPOINT_LEXICAL_CONFLICT_KEEP_LOCAL/
);
assert.equal(lexicalConflict.getItem(EXAM_CHAT_PLAN_KEY), null,
  'Lexical conflict must reject before shared control is restored');
assert.equal(lexicalConflict.getItem(xizongStudyKey), null,
  'Lexical conflict must reject before Xizong is partially restored');


const originalFetch = globalThis.fetch;
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
const visibilityListeners = new Set();
const fakeDocument = {
  visibilityState: 'visible',
  addEventListener(type, handler) {
    if (type === 'visibilitychange') visibilityListeners.add(handler);
  },
  removeEventListener(type, handler) {
    if (type === 'visibilitychange') visibilityListeners.delete(handler);
  }
};
Object.defineProperty(globalThis, 'document', {
  configurable: true,
  writable: true,
  value: fakeDocument
});

let backgroundCheckpointWrites = 0;
globalThis.fetch = async (_input, init = {}) => {
  const method = String(init?.method || 'GET').toUpperCase();
  if (method === 'GET') {
    return new Response(JSON.stringify({ status: 'missing', checkpoint: null }), {
      status: 404,
      headers: { 'content-type': 'application/json' }
    });
  }
  if (method === 'PUT') {
    backgroundCheckpointWrites += 1;
    return new Response(JSON.stringify({ status: 'saved', checkpoint_id: 'background-test' }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  }
  throw new Error('UNEXPECTED_BACKGROUND_CHECKPOINT_METHOD:' + method);
};

try {
  const autosave = initPrivateCheckpointAutosave(source, {
    intervalMs: 60 * 60 * 1000,
    debounceMs: 60 * 60 * 1000,
    now: () => now
  });
  assert.equal(visibilityListeners.size, 1, 'autosave must register one background visibility listener');
  fakeDocument.visibilityState = 'hidden';
  for (const handler of [...visibilityListeners]) handler();
  await new Promise((resolve) => setTimeout(resolve, 25));
  assert.equal(backgroundCheckpointWrites, 1, 'backgrounding the learner page must flush one private checkpoint');
  autosave.stop();
  assert.equal(visibilityListeners.size, 0, 'stopping autosave must remove the visibility listener');
} finally {
  globalThis.fetch = originalFetch;
  if (originalDocumentDescriptor) {
    Object.defineProperty(globalThis, 'document', originalDocumentDescriptor);
  } else {
    delete globalThis.document;
  }
}

console.log('PASS private learner checkpoint foundation: Xizong + English + Politics + Lexical atomic capture/restore + safe conflicts');

