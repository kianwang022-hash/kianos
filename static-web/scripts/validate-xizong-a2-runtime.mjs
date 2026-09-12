import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';
import { loadXizongSystemQuestionSweep } from '../src/lib/xizongQuestions.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const fail = (message) => { throw new Error(`A2_RUNTIME_ACCEPTANCE_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
const has = (source, needle, message) => assert(source.includes(needle), message || `missing:${needle}`);
const matches = (source, pattern, message) => assert(pattern.test(source), message || `missing-pattern:${pattern}`);
const roundTrip = (value) => JSON.parse(JSON.stringify(value));

const learnedCount = (state) => Object.values(state?.learned || {}).filter(Boolean).length;
const recallCount = (state) => Object.keys(state?.ratings || {}).length;
const canRecordKpRecall = (state, kpId) => Boolean(state?.learned?.[kpId]);
const canRecordBlockRecall = (state, totalKp) => totalKp > 0 && learnedCount(state) >= totalKp && recallCount(state) >= totalKp;
const canCloseBlock = (state, totalKp, lectureRead) => canRecordBlockRecall(state, totalKp) && Boolean(state?.blockRecallDone) && Boolean(lectureRead);
const canRecordSystemRecall = (states, blockIds) => blockIds.length > 0 && blockIds.every((id) => Boolean(states?.[id]?.completed));
const normalizeHoldout = (years, eligibleYears) => {
  const eligible = new Set(eligibleYears.map(Number));
  return [...new Set((Array.isArray(years) ? years : []).map(Number))]
    .filter((year) => eligible.has(year))
    .sort((a, b) => a - b);
};
const wuIds = (results) => Object.entries(results)
  .filter(([, row]) => row && ['wrong', 'uncertain'].includes(row.status))
  .map(([questionId]) => questionId);

// ---------- Current A2 load ----------
const system = loadXizongSystem('respiratory');
assert(system.canonicalId === 'A2', `identity:${system.canonicalId}`);
assert(system.status === 'CURRENT', `status:${system.status}`);
assert(system.blocks.length === 12, `blocks:${system.blocks.length}`);
assert(system.learningSupport, 'learning-support-missing');

let totalKp = 0;
let totalGroups = 0;
const blocks = [];
for (const meta of system.blocks) {
  const block = loadXizongBlock('respiratory', meta.slug);
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
assert(totalKp === 236, `total-kp:${totalKp}`);
assert(totalGroups === 62, `logic-groups:${totalGroups}`);

// ---------- Block runtime journeys ----------
const first = blocks[0];
const kpIds = first.kpRecords.map((kp) => kp.kpId);
const totalFirstKp = kpIds.length;
let state = { stage: 'block_learn', groupIndex: 0, kpIndex: 0, learned: {}, ratings: {}, blockRecallDone: false, completed: false };
assert(learnedCount(state) === 0 && recallCount(state) === 0 && !state.blockRecallDone && !state.completed, 'initial-state-manufactures-progress');
assert(!canRecordKpRecall(state, kpIds[0]), 'premature-kp-recall-accepted');
assert(!canRecordBlockRecall(state, totalFirstKp), 'premature-block-recall-accepted');

state.learned[kpIds[0]] = true;
assert(canRecordKpRecall(state, kpIds[0]), 'learned-kp-cannot-recall');
assert(!canRecordKpRecall(state, kpIds[1]), 'unlearned-neighbor-can-recall');

state.learned = Object.fromEntries(kpIds.map((id) => [id, true]));
assert(!canRecordBlockRecall(state, totalFirstKp), 'block-recall-before-kp-recall');
state.ratings = Object.fromEntries(kpIds.map((id) => [id, 'mastered']));
assert(canRecordBlockRecall(state, totalFirstKp), 'block-recall-after-kp-recall-blocked');
state.blockRecallDone = true;
assert(!canCloseBlock(state, totalFirstKp, false), 'block-close-without-lecture');
assert(canCloseBlock(state, totalFirstKp, true), 'clean-block-cannot-close');
state.completed = true;
const persistedBlock = roundTrip(state);
assert(persistedBlock.completed && Object.keys(persistedBlock.ratings).length === totalFirstKp, 'block-roundtrip-loss');

// ---------- System Recall cannot manufacture a learned System ----------
const blockIds = system.blocks.map((block) => block.blockId);
const systemStates = Object.fromEntries(blockIds.map((id) => [id, { completed: false }]));
assert(!canRecordSystemRecall(systemStates, blockIds), 'premature-system-recall-accepted');
systemStates[blockIds[0]].completed = true;
assert(!canRecordSystemRecall(systemStates, blockIds), 'partial-system-recall-accepted');
for (const id of blockIds) systemStates[id].completed = true;
assert(canRecordSystemRecall(systemStates, blockIds), 'completed-system-recall-blocked');

// ---------- System question / holdout / W-U journeys ----------
const sweep = loadXizongSystemQuestionSweep(system);
assert(sweep?.questionCount === 359, `questions:${sweep?.questionCount}`);
assert(sweep.questions.length === 359, `loaded-questions:${sweep.questions.length}`);
assert(new Set(sweep.questions.map((question) => question.questionId)).size === 359, 'question-truth-id-duplicate');
assert(Array.isArray(sweep.years) && sweep.years.length > 0, 'question-years-missing');

const testYear = sweep.years[0];
const holdout = normalizeHoldout([testYear, testYear, -1, 9999, 'bad'], sweep.years);
assert(holdout.length === 1 && holdout[0] === Number(testYear), `holdout-normalization:${holdout.join(',')}`);
const heldCount = sweep.questions.filter((q) => Number(q.year) === Number(testYear)).length;
const active = sweep.questions.filter((q) => !holdout.includes(Number(q.year)));
assert(heldCount > 0 && active.length === 359 - heldCount, `holdout-filter:${active.length}/${359 - heldCount}`);

const [q1, q2, q3] = active.slice(0, 3).map((q) => q.questionId);
assert(q1 && q2 && q3, 'insufficient-active-questions');
const results = { [q1]: { status: 'stable' }, [q2]: { status: 'uncertain' }, [q3]: { status: 'wrong' } };
results[q2] = { status: 'uncertain' };
assert(Object.keys(results).length === 3, 'question-result-not-idempotent-by-truth-id');
const wu = wuIds(roundTrip(results));
assert(wu.length === 2 && wu.includes(q2) && wu.includes(q3) && !wu.includes(q1), 'wu-routing');

// ---------- Actual runtime-source contracts ----------
const blockUi = read('static-web/src/components/XizongBlockV6.astro');
const enhancerUi = read('static-web/src/components/XizongStudyEnhancer.astro');
const memoryUi = read('static-web/src/components/XizongMemoryReviewV6.astro');
const exitUi = read('static-web/src/components/XizongSystemExitRuntime.astro');
const guardUi = read('static-web/src/components/XizongRuntimeStageGuard.astro');
const blockPage = read('static-web/src/pages/xizong/[system]/[block].astro');
const systemPage = read('static-web/src/pages/xizong/[system]/index.astro');
const lastLocation = read('static-web/src/components/XizongLastLocation.astro');
const homeTools = read('static-web/src/components/XizongHomeTools.astro');
const questionLib = read('static-web/src/lib/xizongQuestions.mjs');

has(blockUi, "let state = { stage: 'block_learn', groupIndex: 0, kpIndex: 0, learned: {}, ratings: {}, blockRecallDone: false, completed: false }", 'block-initial-state');
has(blockUi, "JSON.parse(localStorage.getItem(storageKey) || 'null')", 'block-state-read');
has(blockUi, 'localStorage.setItem(storageKey, JSON.stringify(state))', 'block-state-write');
has(blockUi, "setStage('group_close')", 'logic-group-close-transition');
has(blockUi, "setStage('kp_recall')", 'kp-recall-transition');
has(blockUi, "setStage('block_recall')", 'block-recall-transition');
has(blockUi, "setStage('block_complete')", 'block-complete-transition');
matches(enhancerUi, /!personal\.lectureRead\s*\|\|\s*!coreReady/, 'lecture-close-gate');

has(guardUi, "if (kpId && !state?.learned?.[kpId])", 'premature-kp-recall-guard');
has(guardUi, 'if (!total || learned < total || recalled < total)', 'premature-block-recall-guard');
has(guardUi, 'if (completed.length < blockIds.length)', 'premature-system-recall-guard');
has(guardUi, 'Free navigation is preserved.', 'free-navigation-contract');
has(blockPage, '<XizongRuntimeStageGuard system={system} block={block} />', 'block-guard-not-mounted');
has(systemPage, '<XizongRuntimeStageGuard system={system} />', 'system-guard-not-mounted');

has(exitUi, "let recallState = readJson(recallKey, { completedAt: null });", 'system-recall-default-progress');
has(exitUi, "let holdoutYears = readJson(holdoutKey, []);", 'holdout-not-empty-by-default');
matches(exitUi, /startSweep\.disabled\s*=\s*!\(recallState\.completedAt\s*&&\s*holdoutYears\.length\)/, 'question-sweep-prerequisite-gate');
has(exitUi, ".filter(({ result }) => result && ['wrong', 'uncertain'].includes(result.status))", 'wu-only-handoff');
has(exitUi, '暂无审核过的精确 KP 回链：保留题号给 Chat，不让网页自己猜。', 'no-guessed-repair-route');
has(questionLib, "if (!row || row.review_status !== 'REVIEWED') return null;", 'unreviewed-question-relation-accepted');

has(memoryUi, 'const parsed = JSON.parse(text);', 'chat-return-json-parse');
has(memoryUi, '.filter((row) => byId.has(row.kpId))', 'chat-return-not-scoped-to-current-block');
has(memoryUi, "window.alert('Chat 计划 JSON 无法解析。');", 'malformed-chat-return-not-contained');
has(memoryUi, "type: 'CHAT_PLAN_REVIEW', evidence_role: 'REPAIR_ONLY'", 'chat-return-repair-role');

has(lastLocation, "localStorage.setItem('kianos-xizong-last-location-v1', JSON.stringify(value))", 'last-location-write');
has(lastLocation, 'href: window.location.pathname', 'last-location-path');
has(homeTools, "localStorage.getItem('kianos-xizong-last-location-v1')", 'continue-read');
has(homeTools, 'link.href = last.href;', 'continue-return');
has(homeTools, '} catch {}', 'continue-malformed-state-containment');

console.log([
  'A2 Runtime acceptance probe PASS',
  `System=${system.canonicalId}/${system.systemId}`,
  `Blocks=${system.blocks.length}`,
  `KP=${totalKp}`,
  `LogicGroups=${totalGroups}`,
  `Questions=${sweep.questionCount}`,
  `HoldoutTestYear=${testYear} excluded=${heldCount}`,
  'Journeys=clean,early-jump-guard,block-close,system-recall-gate,continue-return,holdout,W/U,chat-return,persistence,malformed-input',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));
