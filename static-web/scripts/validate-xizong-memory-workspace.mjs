import fs from 'node:fs';
import path from 'node:path';
import {
  XIZONG_MEMORY_SCHEMA,
  createXizongMemoryState,
  releaseBlockMemory,
  memorySummary,
  todayMemoryQueue,
  setPersonalPrompt,
  resolvedCorePrompt,
  addMarkedFragment,
  removeMarkedFragment,
  appendMemoryEvidence,
  weakWeightForCard,
  isWeakMemoryCard,
  setRepairTasks,
  selectMemoryView
} from '../src/lib/xizongMemoryModel.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(`CURRENT_XIZONG_MEMORY_VALIDATION:${message}`);
}

const release = {
  blockId: 'respiratory-r01',
  systemId: 'respiratory',
  canonicalId: 'A2',
  blockLabel: 'R1',
  blockTitle: '呼吸生理',
  sourceHash: 'fixture-source-v1',
  coreCards: [
    {
      id: 'core:respiratory-r01-kp01',
      systemId: 'respiratory', canonicalId: 'A2', blockId: 'respiratory-r01', blockLabel: 'R1', blockTitle: '呼吸生理',
      logicGroupId: 'respiratory-r01-lg01', groupLabel: '容量与流速', kpId: 'respiratory-r01-kp01', displayId: 'KP1', title: '肺容积',
      promptCanonical: '容积 / 容量 → 组合关系', coreHtml: '<p>canonical core</p>'
    },
    {
      id: 'core:respiratory-r01-kp02',
      systemId: 'respiratory', canonicalId: 'A2', blockId: 'respiratory-r01', blockLabel: 'R1', blockTitle: '呼吸生理',
      logicGroupId: 'respiratory-r01-lg01', groupLabel: '容量与流速', kpId: 'respiratory-r01-kp02', displayId: 'KP2', title: '时间肺活量',
      promptCanonical: 'FEV → 一秒率', coreHtml: '<p>second core</p>'
    }
  ],
  precisionCards: [
    {
      id: 'precision:a2-r01-kp01-precision',
      systemId: 'respiratory', canonicalId: 'A2', blockId: 'respiratory-r01', blockLabel: 'R1', blockTitle: '呼吸生理',
      kpId: 'respiratory-r01-kp01', displayId: 'KP1', title: '肺容积精确项',
      cue: '肺容积 / 肺容量常用数值最终需要精确恢复。', answerHtml: '', ownerContextHtml: '<p>canonical owner context</p>', answerResolution: 'OWNER_CONTEXT_ONLY'
    }
  ]
};

let state = createXizongMemoryState();
assert(state.schema === XIZONG_MEMORY_SCHEMA, 'schema');
state = releaseBlockMemory(state, release, '2026-09-17T08:00:00Z');
let summary = memorySummary(state);
assert(summary.releasedBlocks === 1, 'release-block-count');
assert(summary.core === 2 && summary.precision === 1, 'release-card-count');
assert(summary.today === 0, 'release-must-not-create-today-debt');
assert(todayMemoryQueue(state).length === 0, 'today-empty-after-release');

// Idempotent second release must not duplicate cards or evidence.
state = releaseBlockMemory(state, release, '2026-09-17T09:00:00Z');
summary = memorySummary(state);
assert(Object.keys(state.cards).length === 3, 'idempotent-card-identity');
assert(state.evidence.length === 0, 'idempotent-no-evidence');
assert(summary.today === 0, 'idempotent-no-debt');

// Private Prompt must override learner-facing front without touching canonical Prompt.
state = setPersonalPrompt(state, 'respiratory-r01-kp01', '我自己的提示');
const core = state.cards['core:respiratory-r01-kp01'];
assert(core.promptCanonical === '容积 / 容量 → 组合关系', 'canonical-prompt-mutated');
assert(resolvedCorePrompt(state, core) === '我自己的提示', 'prompt-override-missing');
state = setPersonalPrompt(state, 'respiratory-r01-kp01', '');
assert(resolvedCorePrompt(state, core) === core.promptCanonical, 'prompt-reset-failed');

// Marked is an anchored fragment, not another Core card and not auto-weak.
state = addMarkedFragment(state, {
  id: 'mark:test',
  cardId: core.id,
  kpId: core.kpId,
  surface: 'CORE',
  text: 'canonical fragment'
}, '2026-09-17T10:00:00Z');
assert(memorySummary(state).marked === 1, 'mark-count');
assert(Object.keys(state.cards).length === 3, 'mark-created-duplicate-card');
assert(!isWeakMemoryCard(state, core.id), 'mark-must-not-imply-weak');
state = removeMarkedFragment(state, 'mark:test');
assert(memorySummary(state).marked === 0, 'mark-remove');

// Weak evidence raises Today priority; later stable evidence can remove the rolling signal
// without deleting the permanent card or overwriting the first observation.
state = appendMemoryEvidence(state, { cardId: core.id, rating: 'unknown', origin: 'CORE_MEMORY_RECALL' }, '2026-09-17T11:00:00Z');
assert(isWeakMemoryCard(state, core.id), 'unknown-not-weak');
assert(todayMemoryQueue(state).some((row) => row.id === core.id), 'unknown-not-in-today');
const weakAfterUnknown = weakWeightForCard(state, core.id);
assert(weakAfterUnknown >= 1, 'weak-weight-low');
state = appendMemoryEvidence(state, { cardId: core.id, rating: 'mastered', origin: 'CORE_MEMORY_RECALL' }, '2026-09-17T12:00:00Z');
assert(state.evidence.length === 2, 'evidence-overwritten');
assert(state.evidence[0].rating === 'unknown', 'original-observation-lost');
assert(!todayMemoryQueue(state).some((row) => row.id === core.id), 'stable-evidence-did-not-clear-today-priority');
assert(state.cards[core.id], 'stable-evidence-deleted-card');

// Precision card can exist honestly with owner context only; isolated exact answer must not be fabricated.
const precision = state.cards['precision:a2-r01-kp01-precision'];
assert(precision.answerResolution === 'OWNER_CONTEXT_ONLY', 'precision-resolution');
assert(!precision.answerHtml && precision.ownerContextHtml.includes('owner context'), 'precision-fallback-context');

// Repair is a separate bounded task queue and must reuse card identity when linked.
state = setRepairTasks(state, [{
  id: 'repair:test', cardId: core.id, title: '只修一个机制断点', reason: 'Chat discriminating check', action: '重新运行局部链条', priority: 'high'
}]);
assert(selectMemoryView(state, 'REPAIR').items.length === 1, 'repair-queue');
assert(Object.keys(state.cards).length === 3, 'repair-created-duplicate-card');

// Surface contract: one independent route, exactly five named top-level views.
const componentPath = path.resolve(process.cwd(), 'src/components/XizongMemoryWorkspace.astro');
const pagePath = path.resolve(process.cwd(), 'src/pages/xizong/memory/index.astro');
const component = fs.readFileSync(componentPath, 'utf8');
const page = fs.readFileSync(pagePath, 'utf8');
for (const view of ['TODAY', 'CORE', 'PRECISION', 'MARKED', 'REPAIR']) {
  assert(component.includes(`data-memory-view="${view}"`), `view-missing:${view}`);
}
assert(component.includes('data-precision-mode="BROWSE"') && component.includes('data-precision-mode="RECALL"'), 'precision-modes');
assert(component.includes('data-memory-prompt-edit') && component.includes('data-memory-mark-selection'), 'personal-annotation-controls');
assert(page.includes('XizongMemoryWorkspace'), 'memory-route');
assert(!component.includes('data-xizong-v6-block'), 'memory-must-not-own-block-runtime');

console.log(JSON.stringify({
  ok: true,
  schema: state.schema,
  released_blocks: summary.releasedBlocks,
  cards: Object.keys(state.cards).length,
  evidence_preserved: state.evidence.length,
  top_views: ['Today', 'Core', 'Precision', 'Marked', 'Repair'],
  block_complete_bridge: 'NOT_IN_PHASE_1'
}, null, 2));
