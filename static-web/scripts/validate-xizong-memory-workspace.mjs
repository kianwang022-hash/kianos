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
import {
  XIZONG_MEMORY_RELEASE_SCHEMA,
  buildXizongMemoryReleaseDescriptorFromLearnerObject
} from '../src/lib/xizongMemoryRelease.mjs';

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

state = releaseBlockMemory(state, release, '2026-09-17T09:00:00Z');
summary = memorySummary(state);
assert(Object.keys(state.cards).length === 3, 'idempotent-card-identity');
assert(state.evidence.length === 0, 'idempotent-no-evidence');
assert(summary.today === 0, 'idempotent-no-debt');

state = setPersonalPrompt(state, 'respiratory-r01-kp01', '我自己的提示');
const core = state.cards['core:respiratory-r01-kp01'];
assert(core.promptCanonical === '容积 / 容量 → 组合关系', 'canonical-prompt-mutated');
assert(resolvedCorePrompt(state, core) === '我自己的提示', 'prompt-override-missing');
state = setPersonalPrompt(state, 'respiratory-r01-kp01', '');
assert(resolvedCorePrompt(state, core) === core.promptCanonical, 'prompt-reset-failed');

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

const precision = state.cards['precision:a2-r01-kp01-precision'];
assert(precision.answerResolution === 'OWNER_CONTEXT_ONLY', 'precision-resolution');
assert(!precision.answerHtml && precision.ownerContextHtml.includes('owner context'), 'precision-fallback-context');

state = setRepairTasks(state, [{
  id: 'repair:test', cardId: core.id, title: '只修一个机制断点', reason: 'Chat discriminating check', action: '重新运行局部链条', priority: 'high'
}]);
assert(selectMemoryView(state, 'REPAIR').items.length === 1, 'repair-queue');
assert(Object.keys(state.cards).length === 3, 'repair-created-duplicate-card');

const learnerObjectFixture = {
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
      source: { locator: 'P10–11' },
      outline: { locator: 'Outline 1' },
      precision: [{
        id: 'a2-r01-kp01-precision',
        kind: 'PRECISION',
        anchor: { block_id: 'respiratory-r01', kp_id: 'respiratory-r01-kp01' },
        cue: 'KP1 exact target',
        sourceLocator: 'P10'
      }]
    },
    {
      identity: {
        logicGroupId: 'respiratory-r01-lg01', groupLabel: '容量与流速',
        kpId: 'respiratory-r01-kp02', displayId: 'KP2', title: '时间肺活量'
      },
      prompt: { canonical: 'FEV → 一秒率' },
      core: { markdown: 'KP2 canonical markdown', html: '<p>KP2 canonical Core</p>' },
      source: { locator: 'P11–12' },
      outline: { locator: 'Outline 2' },
      precision: []
    }
  ],
  logicGroups: [
    {
      identity: { logicGroupId: 'respiratory-r01-lg01', label: '容量与流速' },
      kpIds: ['respiratory-r01-kp01', 'respiratory-r01-kp02'],
      precision: [{
        id: 'a2-r01-lg01-precision',
        kind: 'PRECISION',
        anchor: { block_id: 'respiratory-r01', logic_group_id: 'respiratory-r01-lg01' },
        cue: 'LG exact target',
        sourceLocator: 'P10–12'
      }]
    }
  ]
};
const learnerDescriptor = buildXizongMemoryReleaseDescriptorFromLearnerObject(learnerObjectFixture, {
  sourceHash: 'learner-object-source-v1',
  recallRatings: {
    'respiratory-r01-kp01': 'fuzzy',
    'respiratory-r01-kp02': 'known'
  },
  promptOverrides: { 'respiratory-r01-kp01': '私有 Prompt fixture' },
  markedFragments: [{
    id: 'mark:pre-release',
    cardId: 'core:respiratory-r01-kp01',
    kpId: 'respiratory-r01-kp01',
    surface: 'CORE',
    text: '只标这一小段'
  }]
});
assert(learnerDescriptor.schema === XIZONG_MEMORY_RELEASE_SCHEMA, 'learner-release-schema');
assert(learnerDescriptor.coreCards.length === 2, 'learner-release-core-count');
assert(learnerDescriptor.coreCards.map((card) => card.id).join('|') === 'core:respiratory-r01-kp01|core:respiratory-r01-kp02', 'learner-release-core-identities');
assert(learnerDescriptor.coreCards[0].promptCanonical === '容积 / 容量 → 组合关系', 'learner-release-prompt-drift');
assert(learnerDescriptor.coreCards[0].coreHtml === '<p>KP1 canonical Core</p>', 'learner-release-core-drift');
assert(learnerDescriptor.precisionCards.length === 2, 'learner-release-precision-count');
assert(new Set(learnerDescriptor.precisionCards.map((card) => card.id)).size === 2, 'learner-release-precision-duplicate');
const kpPrecisionRelease = learnerDescriptor.precisionCards.find((card) => card.id === 'precision:a2-r01-kp01-precision');
const lgPrecisionRelease = learnerDescriptor.precisionCards.find((card) => card.id === 'precision:a2-r01-lg01-precision');
assert(kpPrecisionRelease?.kpId === 'respiratory-r01-kp01', 'learner-release-kp-precision-owner');
assert(kpPrecisionRelease?.ownerContextHtml === '<p>KP1 canonical Core</p>', 'learner-release-kp-precision-context');
assert(kpPrecisionRelease?.answerResolution === 'OWNER_CONTEXT_ONLY' && !kpPrecisionRelease?.answerHtml, 'learner-release-kp-precision-no-invention');
assert(lgPrecisionRelease?.kpId === '' && lgPrecisionRelease?.logicGroupId === 'respiratory-r01-lg01', 'learner-release-lg-precision-owner');
assert(lgPrecisionRelease?.ownerContextHtml.includes('KP1 canonical Core') && lgPrecisionRelease?.ownerContextHtml.includes('KP2 canonical Core'), 'learner-release-lg-context-coverage');
assert(lgPrecisionRelease?.answerResolution === 'OWNER_CONTEXT_ONLY' && !lgPrecisionRelease?.answerHtml, 'learner-release-lg-precision-no-invention');
assert(learnerDescriptor.attentionSignals.length === 1 && learnerDescriptor.attentionSignals[0].cardId === 'core:respiratory-r01-kp01', 'learner-release-attention-selectivity');
assert(learnerDescriptor.promptOverrides['respiratory-r01-kp01'] === '私有 Prompt fixture', 'learner-release-prompt-override-pass-through');
assert(learnerDescriptor.markedFragments.length === 1 && learnerDescriptor.markedFragments[0].text === '只标这一小段', 'learner-release-mark-pass-through');
let invalidLearnerFailed = false;
try {
  buildXizongMemoryReleaseDescriptorFromLearnerObject({ ...learnerObjectFixture, schema: 'wrong.schema' });
} catch { invalidLearnerFailed = true; }
assert(invalidLearnerFailed, 'learner-release-invalid-schema-must-fail');

const componentPath = path.resolve(process.cwd(), 'src/components/XizongMemoryWorkspace.astro');
const pagePath = path.resolve(process.cwd(), 'src/pages/xizong/memory/index.astro');
const stylePath = path.resolve(process.cwd(), 'src/styles/xizong-memory-workspace.css');
const component = fs.readFileSync(componentPath, 'utf8');
const page = fs.readFileSync(pagePath, 'utf8');
const style = fs.readFileSync(stylePath, 'utf8');
for (const view of ['TODAY', 'CORE', 'PRECISION', 'MARKED', 'REPAIR']) {
  assert(component.includes(`data-memory-view=\"${view}\"`), `view-missing:${view}`);
}
assert(component.includes('data-precision-mode=\"BROWSE\"') && component.includes('data-precision-mode=\"RECALL\"'), 'precision-modes');
assert(component.includes('data-memory-prompt-edit') && component.includes('data-memory-mark-selection'), 'personal-annotation-controls');
assert(page.includes('XizongMemoryWorkspace'), 'memory-route');
assert(page.includes("../../../styles/xizong-memory-workspace.css"), 'memory-style-owner-not-imported');
assert(!component.includes('<style'), 'memory-component-regained-visual-owner');
assert(!component.includes('style='), 'memory-component-inline-style-regression');
assert(!page.includes('<style'), 'memory-route-regained-visual-owner');
assert(!style.includes('!important'), 'memory-style-cascade-recovery-forbidden');
assert(style.includes('.xzMemory') && style.includes('.xzMemoryLayout') && style.includes('.xzMemoryStage'), 'memory-style-owner-incomplete');
assert(!component.includes('data-xizong-v6-block'), 'memory-must-not-own-block-runtime');

console.log(JSON.stringify({
  ok: true,
  schema: state.schema,
  released_blocks: summary.releasedBlocks,
  cards: Object.keys(state.cards).length,
  evidence_preserved: state.evidence.length,
  learner_object_release: {
    core: learnerDescriptor.coreCards.length,
    precision: learnerDescriptor.precisionCards.length,
    attention_signals: learnerDescriptor.attentionSignals.length
  },
  top_views: ['Today', 'Core', 'Precision', 'Marked', 'Repair'],
  presentation_owner: 'src/styles/xizong-memory-workspace.css',
  runtime_owner: 'src/components/XizongMemoryWorkspace.astro',
  block_complete_bridge: 'UNCHANGED'
}, null, 2));
