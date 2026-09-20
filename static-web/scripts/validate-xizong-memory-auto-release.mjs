import {
  appendMemoryEvidence,
  createXizongMemoryState,
  memorySummary,
  resolvedCorePrompt,
  todayMemoryQueue
} from '../src/lib/xizongMemoryModel.mjs';
import {
  inspectXizongBlockCompletion,
  releaseCompletedBlockToMemory,
  xizongStudyStorageKey
} from '../src/lib/xizongMemoryAutoRelease.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(`CURRENT_XIZONG_MEMORY_AUTO_RELEASE_VALIDATION:${message}`);
}

const learner = {
  schema: 'kianos.xizong.learner_object.v1',
  objectType: 'BLOCK',
  identity: {
    systemId: 'respiratory',
    canonicalId: 'A2',
    blockId: 'respiratory-r01',
    blockLabel: 'R1',
    title: '呼吸生理'
  },
  kps: [
    {
      identity: {
        logicGroupId: 'respiratory-r01-lg01', groupLabel: '容量与流速',
        kpId: 'respiratory-r01-kp01', displayId: 'KP1', title: '肺容积'
      },
      prompt: { canonical: '容积 / 容量 → 组合关系' },
      core: { markdown: 'KP1 canonical markdown', html: '<p>KP1 canonical Core</p>' },
      source: { locator: 'P10–11' }, outline: { locator: 'Outline 1' },
      precision: [{
        id: 'a2-r01-kp01-precision', kind: 'PRECISION',
        anchor: { block_id: 'respiratory-r01', kp_id: 'respiratory-r01-kp01' },
        cue: 'KP1 exact target', sourceLocator: 'P10'
      }]
    },
    {
      identity: {
        logicGroupId: 'respiratory-r01-lg01', groupLabel: '容量与流速',
        kpId: 'respiratory-r01-kp02', displayId: 'KP2', title: '时间肺活量'
      },
      prompt: { canonical: 'FEV → 一秒率' },
      core: { markdown: 'KP2 canonical markdown', html: '<p>KP2 canonical Core</p>' },
      source: { locator: 'P11–12' }, outline: { locator: 'Outline 2' },
      precision: []
    }
  ],
  logicGroups: [{
    identity: { logicGroupId: 'respiratory-r01-lg01', label: '容量与流速' },
    kpIds: ['respiratory-r01-kp01', 'respiratory-r01-kp02'],
    precision: [{
      id: 'a2-r01-lg01-precision', kind: 'PRECISION',
      anchor: { block_id: 'respiratory-r01', logic_group_id: 'respiratory-r01-lg01' },
      cue: 'LG exact target', sourceLocator: 'P10–12'
    }]
  }]
};

const validStudy = {
  stage: 'block_complete',
  learned: {
    'respiratory-r01-kp01': true,
    'respiratory-r01-kp02': true
  },
  ratings: {
    'respiratory-r01-kp01': 'fuzzy',
    'respiratory-r01-kp02': 'known'
  },
  blockRecallDone: true,
  completed: true
};

assert(xizongStudyStorageKey('xizong:A2:R1') === 'kianos-xizong-astro-v2:xizong:A2:R1', 'study-storage-key');
assert(inspectXizongBlockCompletion(learner, { ...validStudy, completed: false }).reason === 'BLOCK_NOT_CONFIRMED', 'requires-confirmed-complete');
assert(inspectXizongBlockCompletion(learner, { ...validStudy, blockRecallDone: false }).reason === 'BLOCK_RECALL_MISSING', 'requires-block-recall');
assert(inspectXizongBlockCompletion(learner, {
  ...validStudy,
  learned: { ...validStudy.learned, 'respiratory-r01-kp02': false }
}).reason === 'KP_LEARN_INCOMPLETE', 'requires-all-kp-learned');
assert(inspectXizongBlockCompletion(learner, {
  ...validStudy,
  ratings: { 'respiratory-r01-kp01': 'fuzzy' }
}).reason === 'KP_RECALL_INCOMPLETE', 'requires-all-kp-ratings');

let memory = createXizongMemoryState();
let result = releaseCompletedBlockToMemory(memory, learner, { ...validStudy, completed: false });
assert(!result.released && result.reason === 'BLOCK_NOT_CONFIRMED', 'incomplete-must-not-release');
assert(memorySummary(result.state).releasedBlocks === 0, 'incomplete-created-library');

result = releaseCompletedBlockToMemory(memory, learner, validStudy, {
  sourceHash: 'fixture-source-v1',
  releasedAt: '2026-09-17T08:00:00Z',
  promptOverrides: { 'respiratory-r01-kp01': '我的第一轮 Prompt' },
  markedFragments: [{
    id: 'mark:first-pass',
    cardId: 'core:respiratory-r01-kp01',
    kpId: 'respiratory-r01-kp01',
    surface: 'CORE',
    text: '第一轮真正想标记的片段',
    createdAt: '2026-09-17T08:00:00Z'
  }]
});
assert(result.released && result.reason === 'BLOCK_COMPLETE_RELEASED', 'valid-complete-not-released');
memory = result.state;
let summary = memorySummary(memory);
assert(summary.releasedBlocks === 1, 'released-block-count');
assert(summary.core === 2, 'core-release-count');
assert(summary.precision === 2, 'kp-and-lg-precision-release-count');
assert(summary.marked === 1, 'marked-release-count');
assert(memory.promptOverrides['respiratory-r01-kp01'] === '我的第一轮 Prompt', 'prompt-override-release');
assert(resolvedCorePrompt(memory, memory.cards['core:respiratory-r01-kp01']) === '我的第一轮 Prompt', 'released-prompt-resolution');
const today = todayMemoryQueue(memory);
assert(today.length === 1 && today[0].id === 'core:respiratory-r01-kp01', 'first-pass-weak-selectivity');
assert(!today.some((card) => card.family === 'PRECISION'), 'release-created-precision-debt');

// Later Memory evidence may stabilize the first-pass weak card. Reopening the Block
// must not replay the stale first-pass fuzzy signal.
memory = appendMemoryEvidence(memory, {
  cardId: 'core:respiratory-r01-kp01',
  rating: 'mastered',
  origin: 'AUTO_RELEASE_VALIDATION'
}, '2026-09-18T08:00:00Z');
assert(todayMemoryQueue(memory, { now: Date.parse('2026-09-18T08:01:00Z') }).length === 0, 'mastered-card-still-in-immediate-today');
const evidenceBefore = memory.evidence.length;
const refreshedAtBefore = memory.releasedBlocks['respiratory-r01'].refreshedAt;
result = releaseCompletedBlockToMemory(memory, learner, validStudy, {
  sourceHash: 'fixture-source-v1',
  releasedAt: '2026-09-19T08:00:00Z'
});
assert(!result.released && result.reason === 'ALREADY_RELEASED', 'repeat-release-not-noop');
assert(result.state.evidence.length === evidenceBefore, 'repeat-release-added-evidence');
assert(result.state.releasedBlocks['respiratory-r01'].refreshedAt === refreshedAtBefore, 'repeat-release-mutated-release');
assert(result.state.attention['core:respiratory-r01-kp01']?.reviewRequested !== true, 'repeat-release-resurrected-stale-weak-signal');
assert(todayMemoryQueue(result.state, { now: Date.parse('2026-09-18T08:01:00Z') }).length === 0, 'repeat-release-mutated-immediate-memory-state');

let invalidFailed = false;
try {
  releaseCompletedBlockToMemory(createXizongMemoryState(), { ...learner, schema: 'wrong.schema' }, validStudy);
} catch { invalidFailed = true; }
assert(invalidFailed, 'invalid-learner-object-must-fail-closed');

console.log(JSON.stringify({
  ok: true,
  schema: result.schema,
  block_id: result.blockId,
  release_once: true,
  core: summary.core,
  precision: summary.precision,
  first_pass_today: today.length,
  stale_signal_replay_blocked: true
}, null, 2));
