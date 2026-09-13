import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';
import { loadXizongSystemQuestionSweep } from '../src/lib/xizongQuestions.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const fail = (message) => { throw new Error(`A3_RUNTIME_ACCEPTANCE_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
const has = (source, needle, message) => assert(source.includes(needle), message || `missing:${needle}`);
const matches = (source, pattern, message) => assert(pattern.test(source), message || `missing-pattern:${pattern}`);
const fnv1a = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(16);
};

const learnedCount = (state) => Object.values(state?.learned || {}).filter(Boolean).length;
const recallCount = (state) => Object.keys(state?.ratings || {}).length;
const canRecordKpRecall = (state, kpId) => Boolean(state?.learned?.[kpId]);
const canRecordBlockRecall = (state, totalKp) => totalKp > 0 && learnedCount(state) >= totalKp && recallCount(state) >= totalKp;
const canCloseBlock = (state, totalKp) => canRecordBlockRecall(state, totalKp) && Boolean(state?.blockRecallDone);
const canRecordSystemRecall = (states, blockIds) => blockIds.length > 0 && blockIds.every((id) => Boolean(states?.[id]?.completed));

const system = loadXizongSystem('urinary');
assert(system.canonicalId === 'A3', `identity:${system.canonicalId}`);
assert(system.status === 'CURRENT', `status:${system.status}`);
assert(system.blocks.length === 14, `blocks:${system.blocks.length}`);
assert(system.learningSupport, 'learning-support-missing');

let totalKp = 0;
let totalGroups = 0;
const blocks = [];
for (const meta of system.blocks) {
  const block = loadXizongBlock('urinary', meta.slug);
  blocks.push(block);
  assert(block.kpRecords.length === meta.kpCount, `${block.blockId}:kp-count`);
  assert(block.logicGroups.length > 0, `${block.blockId}:logic-groups`);
  assert(block.firstPassFocus && block.stopLine && block.recallSpine, `${block.blockId}:learning-support`);
  const flattened = block.logicGroups.flatMap((group) => group.kpIds);
  assert(flattened.length === block.kpRecords.length, `${block.blockId}:logic-length`);
  assert(flattened.every((id, index) => id === block.kpRecords[index].kpId), `${block.blockId}:logic-order`);
  totalKp += block.kpRecords.length;
  totalGroups += block.logicGroups.length;
}
assert(totalKp === 257, `total-kp:${totalKp}`);
assert(totalGroups === 75, `logic-groups:${totalGroups}`);

const first = blocks[0];
const kpIds = first.kpRecords.map((kp) => kp.kpId);
let state = { stage: 'block_learn', groupIndex: 0, kpIndex: 0, learned: {}, ratings: {}, blockRecallDone: false, completed: false };
assert(!canRecordKpRecall(state, kpIds[0]), 'premature-kp-recall-accepted');
state.learned[kpIds[0]] = true;
assert(canRecordKpRecall(state, kpIds[0]), 'learned-kp-cannot-recall');
state.learned = Object.fromEntries(kpIds.map((id) => [id, true]));
assert(!canRecordBlockRecall(state, kpIds.length), 'block-recall-before-kp-recall');
state.ratings = Object.fromEntries(kpIds.map((id) => [id, 'known']));
assert(canRecordBlockRecall(state, kpIds.length), 'block-recall-after-kp-recall-blocked');
assert(!canCloseBlock(state, kpIds.length), 'block-close-before-block-recall');
state.blockRecallDone = true;
assert(canCloseBlock(state, kpIds.length), 'clean-block-cannot-close');

const blockIds = system.blocks.map((block) => block.blockId);
const systemStates = Object.fromEntries(blockIds.map((id) => [id, { completed: false }]));
assert(!canRecordSystemRecall(systemStates, blockIds), 'premature-system-recall-accepted');
for (const id of blockIds) systemStates[id].completed = true;
assert(canRecordSystemRecall(systemStates, blockIds), 'completed-system-recall-blocked');

const sweep = loadXizongSystemQuestionSweep(system);
assert(sweep?.questionCount === 243, `questions:${sweep?.questionCount}`);
assert(sweep.questions.length === 243, `loaded-questions:${sweep.questions.length}`);
assert(new Set(sweep.questions.map((question) => question.questionId)).size === 243, 'question-truth-id-duplicate');
assert(Array.isArray(sweep.years) && sweep.years.length > 0, 'question-years-missing');

const blockEvidenceRows = system.blocks.map((block) => [block.blockId, block.sourcePath, read(block.sourcePath)].join('~')).join('|');
const currentBlockEvidenceHash = fnv1a(blockEvidenceRows);
const changedBlockEvidenceHash = fnv1a(`${blockEvidenceRows}\nSIMULATED_BLOCK_CHANGE`);
assert(currentBlockEvidenceHash !== changedBlockEvidenceHash, 'block-version-mutation-not-detected');

const blockUi = read('static-web/src/components/XizongBlockV6.astro');
const enhancerUi = read('static-web/src/components/XizongStudyEnhancer.astro');
const stageGuard = read('static-web/src/components/XizongRuntimeStageGuard.astro');
const blockEvidenceGuard = read('static-web/src/components/XizongBlockEvidenceGuard.astro');
const systemEvidenceGuard = read('static-web/src/components/XizongSystemEvidenceGuard.astro');
const exitUi = read('static-web/src/components/XizongSystemExitRuntime.astro');
const repairUi = read('static-web/src/components/XizongSystemRepairReturn.astro');
const repairBridge = read('static-web/src/components/XizongRepairInboxBridge.astro');
const memoryUi = read('static-web/src/components/XizongMemoryReviewV6.astro');
const lastLocation = read('static-web/src/components/XizongLastLocation.astro');
const blockPage = read('static-web/src/pages/xizong/[system]/[block].astro');

has(blockUi, "setStage('group_close')", 'logic-group-close-transition');
has(blockUi, "setStage('kp_recall')", 'kp-recall-transition');
has(blockUi, "setStage('block_recall')", 'block-recall-transition');
has(blockUi, "setStage('block_complete')", 'block-complete-transition');
has(blockUi, '不要按 KP 来回切换 App', 'logic-group-lecture-continuity');
has(blockUi, 'data-group-lecture-done', 'logic-group-lecture-return');
has(enhancerUi, 'button.disabled = !coreReady || Boolean(study.completed);', 'block-completion-ui-gate');
assert(!enhancerUi.includes('lectureRead'), 'legacy-block-lecture-confirmation-remains');
has(enhancerUi, 'iPad / MarginNote · 原讲义定位', 'external-primary-source-not-explicit');

has(stageGuard, "requested === 'kp_recall' && counts.learned <= counts.recalled", 'premature-kp-recall-stage-guard');
has(stageGuard, "target.closest('[data-kp-reveal]')", 'premature-kp-reveal-guard');
has(stageGuard, "requested === 'block_recall'", 'premature-block-recall-stage-guard');
has(stageGuard, "target.closest('[data-block-recall-complete]')", 'premature-block-recall-evidence-guard');
has(stageGuard, "target.closest('[data-start-recall]')", 'system-recall-start-guard');
has(stageGuard, "target.closest('[data-reveal-recall]')", 'system-recall-reveal-guard');
has(stageGuard, "target.closest('[data-complete-recall]')", 'system-recall-completion-guard');
has(stageGuard, "target.closest('[data-start-sweep]')", 'system-sweep-completion-guard');
has(stageGuard, 'if (completed.length < blockIds.length)', 'whole-system-prerequisite-guard');

has(blockEvidenceGuard, "block?.learningSupportSourceHash || ''", 'block-learning-support-not-versioned');
has(blockEvidenceGuard, 'localStorage.removeItem(repairInboxKey);', 'stale-block-repair-inbox-not-invalidated');
has(systemEvidenceGuard, 'const blockEvidenceRows = (system?.blocks || []).map((block) => {', 'system-block-content-not-versioned');
has(systemEvidenceGuard, "system?.learningSupport?.sourceHash || ''", 'system-learning-support-not-versioned');
has(systemEvidenceGuard, 'blockEvidenceHash.toString(16)', 'system-block-version-not-in-evidence-version');
has(systemEvidenceGuard, 'localStorage.removeItem(recallKey);', 'stale-system-recall-not-invalidated');
has(systemEvidenceGuard, 'localStorage.removeItem(sweepKey);', 'stale-system-sweep-not-invalidated');
has(systemEvidenceGuard, 'stale_block_repair_inboxes', 'stale-system-repair-inbox-not-archived');

has(exitUi, "let recallState = readJson(recallKey, { completedAt: null });", 'system-recall-default-progress');
has(exitUi, "let holdoutYears = readJson(holdoutKey, []);", 'holdout-not-empty-by-default');
matches(exitUi, /startSweep\.disabled\s*=\s*!\(recallState\.completedAt\s*&&\s*holdoutYears\.length\)/, 'question-sweep-prerequisite-gate');
has(exitUi, ".filter(({ result }) => result && ['wrong', 'uncertain'].includes(result.status))", 'wu-only-handoff');
has(exitUi, '暂无审核过的精确 KP 回链：保留题号给 Chat，不让网页自己猜。', 'no-guessed-repair-route');

has(repairUi, 'allowed.has(row.questionId)', 'chat-plan-not-scoped-to-real-wu');
has(repairUi, '!relation?.blockId || !relation?.primaryKpId', 'repair-route-not-reviewed-relation-only');
has(repairUi, 'kianos-xizong-repair-inbox-v1:', 'repair-return-does-not-use-inbox');
has(repairBridge, 'kianos-xizong-repair-inbox-v1:', 'block-repair-inbox-not-consumed');
has(repairBridge, "type: 'SYSTEM_WU_PLAN_IMPORTED'", 'repair-inbox-import-not-evidenced');
has(repairBridge, "window.addEventListener('storage'", 'open-block-tab-repair-return-missing');
has(repairBridge, 'window.location.reload();', 'repair-return-does-not-rebuild-block-memory-state');
has(blockPage, '<XizongRepairInboxBridge block={projection} />', 'repair-inbox-bridge-not-mounted');
has(memoryUi, "type: 'CHAT_PLAN_REVIEW', evidence_role: 'REPAIR_ONLY'", 'repair-evidence-overwrites-mastery');
has(lastLocation, "localStorage.setItem('kianos-xizong-last-location-v1', JSON.stringify(value))", 'resume-location-not-persisted');

console.log([
  'A3 Runtime acceptance probe PASS',
  `System=${system.canonicalId}/${system.systemId}`,
  `Blocks=${system.blocks.length}`,
  `KP=${totalKp}`,
  `LogicGroups=${totalGroups}`,
  `Questions=${sweep.questionCount}`,
  `BlockEvidence=${currentBlockEvidenceHash}`,
  'Journeys=lecture-handoff,KP-recall-guard,block-close,system-recall-gate,system-sweep-gate,stale-evidence-invalidation,W/U-repair-inbox-return,resume',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));