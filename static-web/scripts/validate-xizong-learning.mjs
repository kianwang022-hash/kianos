import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';
import { loadXizongSystemQuestionSweep } from '../src/lib/xizongQuestions.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, '..');
const repoRoot = path.resolve(webRoot, '..');

function fail(message) {
  throw new Error(`XIZONG_ACCEPTANCE_FAIL:${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function mustInclude(source, needle, message) {
  assert(source.includes(needle), message || `missing:${needle}`);
}

function mustMatch(source, pattern, message) {
  assert(pattern.test(source), message || `missing-pattern:${pattern}`);
}

function mustNotMatch(source, pattern, message) {
  assert(!pattern.test(source), message || `forbidden-pattern:${pattern}`);
}

function ratingState(value) {
  return value === 'unknown' || value === 'fuzzy'
    ? 'HOT'
    : value === 'known'
      ? 'WARM'
      : value === 'mastered'
        ? 'STABLE'
        : '';
}

function currentWeakMemory(kpIds, recallRatings, memory = {}) {
  const rows = kpIds.map((kpId) => ({
    kpId,
    sourceRating: recallRatings[kpId] || '',
    memoryState: memory[kpId] || ratingState(recallRatings[kpId]) || ''
  }));
  const weak = rows.filter((row) => ['HOT', 'WARM'].includes(row.memoryState));
  return weak.length ? weak : rows.filter((row) => row.sourceRating && row.memoryState !== 'STABLE');
}

function blockCanComplete({ totalKp, learned, ratings, blockRecallDone, lectureRead }) {
  const coreReady = totalKp > 0
    && Object.values(learned).filter(Boolean).length >= totalKp
    && Object.keys(ratings).length >= totalKp
    && Boolean(blockRecallDone);
  return coreReady && Boolean(lectureRead);
}

function reviewPlanForCurrentBlock(rawPlan, kpIds) {
  const allowed = new Set(kpIds);
  const seen = new Set();
  return rawPlan
    .map((item) => typeof item === 'string' ? item : item?.kp_id || item?.kpId || '')
    .filter((kpId) => kpId && allowed.has(kpId) && !seen.has(kpId) && seen.add(kpId));
}

function wuItems(results) {
  return Object.entries(results)
    .filter(([, row]) => row && ['wrong', 'uncertain'].includes(row.status))
    .map(([questionId]) => questionId);
}

const system = loadXizongSystem('circulation');
assert(system.canonicalId === 'A1', `A1 identity:${system.canonicalId}`);
assert(system.status === 'CURRENT', `A1 status:${system.status}`);
assert(system.blocks.length === 12, `A1 block count:${system.blocks.length}`);
assert(system.learningSupport, 'A1 learning support missing');

let totalKp = 0;
let totalLogicGroups = 0;
const loadedBlocks = [];
for (const blockMeta of system.blocks) {
  const block = loadXizongBlock('circulation', blockMeta.slug);
  loadedBlocks.push(block);
  assert(block.centerQuestion, `${block.blockId}:center question missing`);
  assert(block.blockLearnMarkdown.trim(), `${block.blockId}:opening orientation missing`);
  assert(block.kpRecords.length === blockMeta.kpCount, `${block.blockId}:KP count`);
  assert(block.logicGroups.length > 0, `${block.blockId}:logic groups missing`);
  assert(block.firstPassFocus && block.stopLine && block.recallSpine, `${block.blockId}:first-pass block semantics incomplete`);

  const flattened = [];
  for (const group of block.logicGroups) {
    assert(group.goal && group.closure, `${group.groupId}:goal/closure incomplete`);
    flattened.push(...group.kpIds);
  }
  assert(flattened.length === block.kpRecords.length, `${block.blockId}:logic flatten length`);
  assert(flattened.every((kpId, index) => kpId === block.kpRecords[index].kpId), `${block.blockId}:logic flatten identity/order`);

  totalKp += block.kpRecords.length;
  totalLogicGroups += block.logicGroups.length;
}
assert(totalKp === 312, `A1 total KP:${totalKp}`);
assert(totalLogicGroups === 87, `A1 logic groups:${totalLogicGroups}`);

const b1 = loadedBlocks[0];
const b1KpIds = b1.kpRecords.map((kp) => kp.kpId);
const learnedAll = Object.fromEntries(b1KpIds.map((kpId) => [kpId, true]));
const masteredAll = Object.fromEntries(b1KpIds.map((kpId) => [kpId, 'mastered']));

// Clean first-pass journey: stable Recall creates no Memory/Chat debt and can close only after Lecture + Block Recall.
assert(currentWeakMemory(b1KpIds, masteredAll).length === 0, 'clean mastered Recall manufactured Memory debt');
assert(!blockCanComplete({ totalKp: b1KpIds.length, learned: learnedAll, ratings: masteredAll, blockRecallDone: true, lectureRead: false }), 'Block closes without Lecture one-pass confirmation');
assert(blockCanComplete({ totalKp: b1KpIds.length, learned: learnedAll, ratings: masteredAll, blockRecallDone: true, lectureRead: true }), 'clean Block cannot close after required checkpoints');

// Weak path: one fuzzy Recall enters Memory; local repair does not rewrite the original Recall evidence.
const weakKpId = b1KpIds[0];
const weakRatings = { ...masteredAll, [weakKpId]: 'fuzzy' };
assert(currentWeakMemory(b1KpIds, weakRatings).some((row) => row.kpId === weakKpId), 'fuzzy Recall did not enter Memory');
const repairedMemory = { [weakKpId]: 'STABLE' };
assert(currentWeakMemory(b1KpIds, weakRatings, repairedMemory).every((row) => row.kpId !== weakKpId), 'local repair cannot clear local weak queue');
assert(weakRatings[weakKpId] === 'fuzzy', 'repair simulation rewrote original Recall evidence');

// Chat-return journey: only IDs that exist in the current Block survive import.
const imported = reviewPlanForCurrentBlock([
  { kp_id: weakKpId, reason: 'repair' },
  { kp_id: 'circulation-b12-kp99', reason: 'foreign-or-invalid' },
  weakKpId
], b1KpIds);
assert(imported.length === 1 && imported[0] === weakKpId, `Chat import scope:${imported.join(',')}`);

const sweep = loadXizongSystemQuestionSweep(system);
assert(sweep, 'A1 System question sweep missing');
assert(sweep.questionCount === 376, `A1 sweep count:${sweep.questionCount}`);
assert(sweep.questionInventoryHash === 'ded191082a6226353d92c05756dfebe4237335e361f7a945e1a2f3b204c457be', `A1 sweep hash:${sweep.questionInventoryHash}`);
assert(sweep.questions.length === 376, `A1 loaded questions:${sweep.questions.length}`);

// Holdout journey: use one deterministic test year only as test data; runtime product truth remains learner-selected empty-by-default state.
const testHoldoutYear = sweep.years[0];
const expectedHeld = sweep.questions.filter((question) => question.year === testHoldoutYear).length;
const activeQuestions = sweep.questions.filter((question) => question.year !== testHoldoutYear);
assert(expectedHeld > 0, `test holdout year has no questions:${testHoldoutYear}`);
assert(activeQuestions.length === 376 - expectedHeld, `holdout exclusion:${activeQuestions.length}/${376 - expectedHeld}`);

// Official-question evidence journey: stable fast-pass creates no W/U; uncertain/wrong do.
const q1 = activeQuestions[0]?.questionId;
const q2 = activeQuestions[1]?.questionId;
const q3 = activeQuestions[2]?.questionId;
assert(q1 && q2 && q3, 'not enough active questions for W/U simulation');
const simulatedResults = {
  [q1]: { status: 'stable' },
  [q2]: { status: 'uncertain' },
  [q3]: { status: 'wrong' }
};
const simulatedWu = wuItems(simulatedResults);
assert(!simulatedWu.includes(q1), 'stable question manufactured W/U debt');
assert(simulatedWu.includes(q2) && simulatedWu.includes(q3) && simulatedWu.length === 2, 'W/U routing mismatch');

// Question-to-Knowledge evidence is fail-safe: loaded precise relations must have a real primary KP ID; source loader only accepts REVIEWED rows.
for (const question of sweep.questions) {
  if (!question.relation) continue;
  assert(question.relation.primaryKpId, `${question.questionId}:reviewed relation missing primary KP`);
}

const xizongLib = read('static-web/src/lib/xizong.mjs');
const questionLib = read('static-web/src/lib/xizongQuestions.mjs');
const blockComponent = read('static-web/src/components/XizongBlockV6.astro');
const enhancerComponent = read('static-web/src/components/XizongStudyEnhancer.astro');
const memoryComponent = read('static-web/src/components/XizongMemoryReviewV6.astro');
const systemPage = read('static-web/src/pages/xizong/[system]/index.astro');
const systemComponent = read('static-web/src/components/XizongSystemV6.astro');
const exitComponent = read('static-web/src/components/XizongSystemExitRuntime.astro');

// Projection must accept canonical content instead of forcing the A2 heading shape.
mustInclude(xizongLib, 'function blockOpeningOrientation(markdown)', 'generic Block opening projection missing');
mustInclude(xizongLib, "const intro = blockOpeningOrientation(markdown);", 'Block loader still bypasses generic opening projection');

// Private strategy must remain private: shared System page cannot seed exact holdout years.
mustNotMatch(systemPage, /2025-2026-v1|writeJson\(holdoutKey,\s*\[2025,\s*2026\]\)/, 'shared runtime seeds private holdout years');
mustInclude(exitComponent, "let holdoutYears = readJson(holdoutKey, []);", 'holdout is not empty-by-default private state');
mustInclude(exitComponent, "const computeActive = () => data.questions.filter((question) => !holdoutYears.includes(Number(question.year)));", 'holdout does not filter System sweep');
mustMatch(exitComponent, /startSweep\.disabled\s*=\s*!\(recallState\.completedAt\s*&&\s*holdoutYears\.length\)/, 'System sweep can start before Recall + explicit holdout');

// Missing metadata must be omitted, never falsified as learner-facing Outline 0.
mustMatch(systemComponent, /outlineCount\s*>\s*0\s*\?/, 'System projection does not conditionally omit absent Outline metadata');
mustNotMatch(systemComponent, /Outline\s*\$\{?0\}?/, 'System projection contains literal Outline 0');

// Block Recall stays answer-hidden until Reveal; completion requires learned + Recall + Block Recall.
mustInclude(blockComponent, 'data-kp-answer hidden', 'KP Recall answer is not hidden by default');
mustInclude(blockComponent, 'data-kp-reveal', 'KP Recall Reveal control missing');
mustMatch(blockComponent, /learnedCount\(\)\s*>=\s*totalKp\s*&&\s*recallCount\(\)\s*>=\s*totalKp\s*&&\s*Boolean\(state\.blockRecallDone\)/, 'Block completion core gate mismatch');
mustMatch(enhancerComponent, /!personal\.lectureRead\s*\|\|\s*!coreReady/, 'Lecture one-pass gate missing from Block completion');

// Stable Recall is not manufactured into debt; Chat repair evidence cannot rewrite original Recall/mastery state.
mustMatch(memoryComponent, /\['HOT',\s*'WARM'\]\.includes\(row\.memoryState\)/, 'Memory weak queue semantics missing');
mustInclude(memoryComponent, "type: 'CHAT_PLAN_REVIEW', evidence_role: 'REPAIR_ONLY'", 'Chat repair evidence role missing');
mustNotMatch(memoryComponent, /study\.ratings\s*=\s*\{[^\n]*current\.kpId/, 'Chat repair still rewrites original Recall ratings');
mustInclude(memoryComponent, '.filter((row) => byId.has(row.kpId))', 'Chat import does not filter to current Block KP IDs');

// System question path preserves fast pass + W/U-only repair and never fabricates precise relations.
mustInclude(exitComponent, "persistResult(currentQuestion, 'wrong', currentSelection);", 'wrong path missing');
mustInclude(exitComponent, "nextAfter('stable')", 'stable fast-pass missing');
mustInclude(exitComponent, "persistResult(currentQuestion, 'uncertain', currentSelection);", 'uncertain path missing');
mustInclude(exitComponent, ".filter(({ result }) => result && ['wrong', 'uncertain'].includes(result.status))", 'W/U packet is not W/U-only');
mustInclude(exitComponent, '暂无审核过的精确 KP 回链：保留题号给 Chat，不让网页自己猜。', 'missing-relation no-guess guard missing');
mustInclude(questionLib, "if (!row || row.review_status !== 'REVIEWED') return null;", 'question relation loader accepts unreviewed precise relation');

console.log([
  'Xizong learner-contract acceptance PASS',
  `A1=${system.canonicalId}/${system.systemId}`,
  `Blocks=${system.blocks.length}`,
  `KP=${totalKp}`,
  `LogicGroups=${totalLogicGroups}`,
  `Questions=${sweep.questionCount}`,
  `HoldoutTestYear=${testHoldoutYear} excluded=${expectedHeld}`,
  'Journeys=clean,weak,chat-return,holdout,W/U',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));
