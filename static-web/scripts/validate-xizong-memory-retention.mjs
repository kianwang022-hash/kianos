import {
  XIZONG_RETENTION_WINDOWS_DAYS,
  appendMemoryEvidence,
  createXizongMemoryState,
  memorySummary,
  releaseBlockMemory,
  todayMemoryQueue,
  xizongRetentionState
} from '../src/lib/xizongMemoryModel.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(`XIZONG_RETENTION_CLOCK_FAIL:${message}`);
}

const DAY = 86400000;
const t0 = Date.parse('2026-09-20T08:00:00.000Z');
const release = {
  blockId: 'circulation-b01',
  systemId: 'circulation',
  canonicalId: 'A1',
  blockLabel: 'B1',
  blockTitle: '正常机械循环',
  sourceHash: 'retention-fixture-v1',
  coreCards: [
    {
      id: 'core:circulation-b01-kp01',
      systemId: 'circulation',
      canonicalId: 'A1',
      blockId: 'circulation-b01',
      blockLabel: 'B1',
      blockTitle: '正常机械循环',
      kpId: 'circulation-b01-kp01',
      displayId: 'KP01',
      title: '循环机制',
      promptCanonical: '主动恢复循环主链',
      coreHtml: '<p>fixture</p>'
    },
    {
      id: 'core:circulation-b01-kp02',
      systemId: 'circulation',
      canonicalId: 'A1',
      blockId: 'circulation-b01',
      blockLabel: 'B1',
      blockTitle: '正常机械循环',
      kpId: 'circulation-b01-kp02',
      displayId: 'KP02',
      title: '稳定库对象',
      promptCanonical: '不应仅因时间经过制造复习债',
      coreHtml: '<p>fixture 2</p>'
    }
  ],
  precisionCards: []
};

let state = releaseBlockMemory(createXizongMemoryState(), release, t0);
assert(XIZONG_RETENTION_WINDOWS_DAYS.join(',') === '1,3,7,14,30', 'progressive-windows');
assert(todayMemoryQueue(state, { now: t0 + 60 * DAY }).length === 0,
  'library-only-content-became-time-debt');
assert(xizongRetentionState(state, 'core:circulation-b01-kp02', t0 + 60 * DAY).state === 'LIBRARY_ONLY',
  'untouched-library-card-not-library-only');

// "known / 会了" is successful retrieval now, not durable stability.
// It exits immediate Today pressure, gets a delayed D1 check, and cannot inflate the long interval by itself.
let knownState = appendMemoryEvidence(state, {
  cardId: 'core:circulation-b01-kp01',
  rating: 'unknown',
  origin: 'RETENTION_KNOWN_FIXTURE'
}, t0);
knownState = appendMemoryEvidence(knownState, {
  cardId: 'core:circulation-b01-kp01',
  rating: 'known',
  origin: 'RETENTION_KNOWN_FIXTURE'
}, t0 + 10 * 60 * 1000);
let knownRetention = xizongRetentionState(
  knownState,
  'core:circulation-b01-kp01',
  t0 + 11 * 60 * 1000
);
assert(knownRetention.state === 'KNOWN_WAIT', 'known-was-treated-as-stable');
assert(knownRetention.stabilityStage === 0, 'known-inflated-stability-stage');
assert(knownRetention.nextIntervalDays === 1, 'known-delayed-check-not-d1');
assert(
  !todayMemoryQueue(knownState, { now: t0 + 11 * 60 * 1000 })
    .some((row) => row.id === 'core:circulation-b01-kp01'),
  'known-stayed-in-immediate-today'
);
const knownDue = t0 + 10 * 60 * 1000 + DAY;
knownRetention = xizongRetentionState(knownState, 'core:circulation-b01-kp01', knownDue);
assert(knownRetention.state === 'DUE_DELAYED_STABILITY', 'known-d1-check-not-due');

knownState = appendMemoryEvidence(knownState, {
  cardId: 'core:circulation-b01-kp01',
  rating: 'known',
  origin: 'RETENTION_KNOWN_FIXTURE'
}, knownDue + 5 * 60 * 1000);
knownRetention = xizongRetentionState(
  knownState,
  'core:circulation-b01-kp01',
  knownDue + 6 * 60 * 1000
);
assert(knownRetention.state === 'KNOWN_WAIT', 'repeated-known-became-stable');
assert(knownRetention.stabilityStage === 0, 'repeated-known-inflated-stability-stage');
assert(knownRetention.nextIntervalDays === 1, 'repeated-known-expanded-window');

state = appendMemoryEvidence(state, {
  cardId: 'core:circulation-b01-kp01',
  rating: 'unknown',
  origin: 'RETENTION_FIXTURE'
}, t0);
let retention = xizongRetentionState(state, 'core:circulation-b01-kp01', t0 + 1);
assert(retention.state === 'DUE_WEAK' && retention.due === true, 'weak-not-immediately-due');

state = appendMemoryEvidence(state, {
  cardId: 'core:circulation-b01-kp01',
  rating: 'mastered',
  origin: 'RETENTION_FIXTURE'
}, t0 + 10 * 60 * 1000);
retention = xizongRetentionState(state, 'core:circulation-b01-kp01', t0 + 11 * 60 * 1000);
assert(retention.state === 'STABLE_WAIT', 'mastered-did-not-clear-immediate-debt');
assert(retention.nextIntervalDays === 1 && retention.stabilityStage === 1, 'first-stability-window');

const firstDue = t0 + 10 * 60 * 1000 + DAY;
retention = xizongRetentionState(state, 'core:circulation-b01-kp01', firstDue);
assert(retention.state === 'DUE_DELAYED_STABILITY', 'first-delayed-check-not-due');

state = appendMemoryEvidence(state, {
  cardId: 'core:circulation-b01-kp01',
  rating: 'mastered',
  origin: 'RETENTION_FIXTURE'
}, firstDue + 5 * 60 * 1000);
retention = xizongRetentionState(state, 'core:circulation-b01-kp01', firstDue + 2 * DAY);
assert(retention.state === 'STABLE_WAIT' && retention.nextIntervalDays === 3,
  'second-success-did-not-expand-window');
retention = xizongRetentionState(state, 'core:circulation-b01-kp01', firstDue + 5 * 60 * 1000 + 3 * DAY);
assert(retention.state === 'DUE_DELAYED_STABILITY', 'three-day-check-not-due');

const overdueNow = firstDue + 5 * 60 * 1000 + 13 * DAY;
const overdueQueue = todayMemoryQueue(state, { now: overdueNow });
assert(overdueQueue.length === 1, 'overdue-created-duplicate-debt');
assert(overdueQueue[0].id === 'core:circulation-b01-kp01', 'wrong-overdue-card');
assert(overdueQueue[0].overdueDays >= 10, 'overdue-age-not-preserved');
assert(!overdueQueue.some((row) => row.id === 'core:circulation-b01-kp02'),
  'stable-library-card-leaked-into-overdue-queue');

const changed = JSON.parse(JSON.stringify(state));
changed.cards['core:circulation-b01-kp01'].contentChangedAt =
  new Date(firstDue + 6 * 60 * 1000).toISOString();
retention = xizongRetentionState(changed, 'core:circulation-b01-kp01', firstDue + 7 * 60 * 1000);
assert(retention.state === 'DUE_CONTENT_CHANGED', 'content-change-not-invalidating-old-proof');

const summary = memorySummary(state, overdueNow);
assert(summary.admitted === 1, 'admitted-count');
assert(summary.libraryOnly === 1, 'library-only-count');
assert(summary.dueDelayed === 1, 'due-delayed-count');
assert(summary.today === 1, 'today-summary-count');

const capped = todayMemoryQueue(state, { now: overdueNow, maxItems: 1 });
assert(capped.length === 1, 'bounded-review-selection');

console.log(JSON.stringify({
  ok: true,
  model: 'XIZONG_MAXIMUM_REMEMBER_RETENTION_CLOCK_V1',
  progressive_windows_days: XIZONG_RETENTION_WINDOWS_DAYS,
  no_blanket_time_debt: true,
  no_historical_review_debt: true,
  content_change_invalidates_old_proof: true,
  delayed_stability_recheck: true,
  summary
}, null, 2));
console.log('PASS Xizong retention clock: selective admission, delayed proof, progressive spacing, no review inflation');
