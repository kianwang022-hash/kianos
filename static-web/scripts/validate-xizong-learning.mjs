import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';
import { loadXizongSystemQuestionSweep } from '../src/lib/xizongQuestions.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');

const fail = (message) => { throw new Error(`XIZONG_ACCEPTANCE_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
const has = (source, needle, message) => assert(source.includes(needle), message || `missing:${needle}`);
const lacks = (source, pattern, message) => assert(!pattern.test(source), message || `forbidden:${pattern}`);
const matches = (source, pattern, message) => assert(pattern.test(source), message || `missing-pattern:${pattern}`);
const roundTrip = (value) => JSON.parse(JSON.stringify(value));

function ratingState(value) {
  if (value === 'unknown' || value === 'fuzzy') return 'HOT';
  if (value === 'known') return 'WARM';
  if (value === 'mastered') return 'STABLE';
  return '';
}

function weakMemory(kpIds, recallRatings, memory = {}) {
  const rows = kpIds.map((kpId) => ({
    kpId,
    sourceRating: recallRatings[kpId] || '',
    memoryState: memory[kpId] || ratingState(recallRatings[kpId]) || ''
  }));
  const weak = rows.filter((row) => ['HOT', 'WARM'].includes(row.memoryState));
  return weak.length ? weak : rows.filter((row) => row.sourceRating && row.memoryState !== 'STABLE');
}

function canCloseBlock({ totalKp, learned, ratings, blockRecallDone, lectureRead }) {
  const coreReady = totalKp > 0
    && Object.values(learned).filter(Boolean).length >= totalKp
    && Object.keys(ratings).length >= totalKp
    && Boolean(blockRecallDone);
  return coreReady && Boolean(lectureRead);
}

function scopedChatPlan(rawPlan, kpIds) {
  const allowed = new Set(kpIds);
  const seen = new Set();
  return rawPlan
    .map((row) => typeof row === 'string' ? row : row?.kp_id || row?.kpId || '')
    .filter((kpId) => kpId && allowed.has(kpId) && !seen.has(kpId) && seen.add(kpId));
}

function normalizeHoldout(years, eligibleYears) {
  const eligible = new Set(eligibleYears.map(Number));
  return [...new Set((Array.isArray(years) ? years : []).map(Number))]
    .filter((year) => eligible.has(year))
    .sort((a, b) => a - b);
}

const wuIds = (results) => Object.entries(results)
  .filter(([, row]) => row && ['wrong', 'uncertain'].includes(row.status))
  .map(([questionId]) => questionId);

// ---------- Current A1 structural / learning-contract load ----------
const system = loadXizongSystem('circulation');
assert(system.canonicalId === 'A1', `identity:${system.canonicalId}`);
assert(system.status === 'CURRENT', `status:${system.status}`);
assert(system.blocks.length === 12, `blocks:${system.blocks.length}`);
assert(system.learningSupport, 'learning-support-missing');

let totalKp = 0;
let totalGroups = 0;
const blocks = [];
for (const meta of system.blocks) {
  const block = loadXizongBlock('circulation', meta.slug);
  blocks.push(block);
  assert(block.centerQuestion, `${block.blockId}:center-question`);
  assert(block.blockLearnMarkdown.trim(), `${block.blockId}:opening-orientation`);
  assert(block.kpRecords.length === meta.kpCount, `${block.blockId}:kp-count`);
  assert(block.firstPassFocus && block.stopLine && block.recallSpine, `${block.blockId}:block-learning-support`);

  const ordinalSet = new Set(block.kpRecords.map((kp) => kp.ordinal));
  assert(ordinalSet.size === meta.kpCount, `${block.blockId}:stable-kp-identity-count`);
  for (let ordinal = 1; ordinal <= meta.kpCount; ordinal += 1) {
    assert(ordinalSet.has(ordinal), `${block.blockId}:stable-kp-identity-missing-${ordinal}`);
  }

  const flattened = block.logicGroups.flatMap((group) => {
    assert(group.goal && group.closure, `${group.groupId}:goal-closure`);
    return group.kpIds;
  });
  assert(flattened.length === block.kpRecords.length, `${block.blockId}:logic-length`);
  assert(flattened.every((kpId, index) => kpId === block.kpRecords[index].kpId), `${block.blockId}:logic-follows-canonical-reading-order`);
  totalKp += block.kpRecords.length;
  totalGroups += block.logicGroups.length;
}
assert(totalKp === 312, `total-kp:${totalKp}`);
assert(totalGroups === 87, `logic-groups:${totalGroups}`);

// Stable KP identity is not learner order. B5 intentionally teaches remodeling KP07-12 before measurement KP04-06.
const b5 = blocks.find((block) => block.blockId === 'circulation-b05');
assert(b5, 'b5-missing');
const b5OpeningOrder = b5.kpRecords.slice(0, 12).map((kp) => kp.ordinal);
assert(
  JSON.stringify(b5OpeningOrder) === JSON.stringify([1, 2, 3, 7, 8, 9, 10, 11, 12, 4, 5, 6]),
  `b5-canonical-reading-order:${b5OpeningOrder.join(',')}`
);
assert(
  b5.logicGroups.map((group) => group.groupId).slice(0, 3).join(',') === 'circulation-b05-lg01,circulation-b05-lg03,circulation-b05-lg02',
  `b5-logic-group-order:${b5.logicGroups.map((group) => group.groupId).slice(0, 3).join(',')}`
);

// Generic opening projection must remove YAML metadata before learner-facing orientation.
for (const blockId of ['circulation-b10', 'circulation-b11', 'circulation-b12']) {
  const block = blocks.find((row) => row.blockId === blockId);
  assert(block, `${blockId}:missing`);
  assert(!block.blockLearnMarkdown.startsWith('---'), `${blockId}:frontmatter-delimiter-leaked`);
  assert(!block.blockLearnMarkdown.includes('schema_version:'), `${blockId}:frontmatter-schema-leaked`);
  assert(!block.blockLearnMarkdown.includes('type: block_guide'), `${blockId}:frontmatter-type-leaked`);
}

// ---------- Clean / weak / repair / persistence journeys ----------
const b1 = blocks[0];
const kpIds = b1.kpRecords.map((kp) => kp.kpId);
const learnedAll = Object.fromEntries(kpIds.map((id) => [id, true]));
const masteredAll = Object.fromEntries(kpIds.map((id) => [id, 'mastered']));
assert(weakMemory(kpIds, masteredAll).length === 0, 'clean-path-manufactured-memory-debt');
assert(!canCloseBlock({ totalKp: kpIds.length, learned: learnedAll, ratings: masteredAll, blockRecallDone: true, lectureRead: false }), 'close-without-lecture');
assert(canCloseBlock({ totalKp: kpIds.length, learned: learnedAll, ratings: masteredAll, blockRecallDone: true, lectureRead: true }), 'clean-path-cannot-close');

const persisted = roundTrip({ learned: learnedAll, ratings: masteredAll, blockRecallDone: true, completed: true });
assert(Object.keys(persisted.learned).length === kpIds.length, 'persistence-lost-learned');
assert(Object.keys(persisted.ratings).length === kpIds.length, 'persistence-lost-recall');
assert(persisted.completed === true, 'persistence-lost-closure');

const weakKpId = kpIds[0];
const firstRecall = { ...masteredAll, [weakKpId]: 'fuzzy' };
assert(weakMemory(kpIds, firstRecall).some((row) => row.kpId === weakKpId), 'fuzzy-not-admitted-to-memory');
assert(weakMemory(kpIds, firstRecall, { [weakKpId]: 'STABLE' }).every((row) => row.kpId !== weakKpId), 'local-repair-cannot-clear-local-queue');
assert(firstRecall[weakKpId] === 'fuzzy', 'repair-rewrote-first-recall');

const imported = scopedChatPlan([
  { kp_id: weakKpId },
  { kp_id: 'circulation-b12-kp99' },
  null,
  weakKpId
], kpIds);
assert(imported.length === 1 && imported[0] === weakKpId, `chat-return-scope-idempotency:${imported.join(',')}`);

// ---------- System Exit / holdout / W-U evidence journeys ----------
const sweep = loadXizongSystemQuestionSweep(system);
assert(sweep?.questionCount === 376, `questions:${sweep?.questionCount}`);
assert(sweep.questionInventoryHash === 'ded191082a6226353d92c05756dfebe4237335e361f7a945e1a2f3b204c457be', `question-hash:${sweep.questionInventoryHash}`);
assert(sweep.questions.length === 376, `loaded-questions:${sweep.questions.length}`);

const testYear = sweep.years[0];
const holdout = normalizeHoldout([testYear, testYear, -1, 9999, 'bad'], sweep.years);
assert(holdout.length === 1 && holdout[0] === testYear, `holdout-normalization:${holdout.join(',')}`);
assert(roundTrip(holdout)[0] === testYear, 'holdout-persistence');
const heldCount = sweep.questions.filter((q) => Number(q.year) === testYear).length;
const active = sweep.questions.filter((q) => !holdout.includes(Number(q.year)));
assert(heldCount > 0 && active.length === 376 - heldCount, `holdout-filter:${active.length}/${376 - heldCount}`);

const [q1, q2, q3] = active.slice(0, 3).map((q) => q.questionId);
assert(q1 && q2 && q3, 'insufficient-active-questions');
const results = { [q1]: { status: 'stable' }, [q2]: { status: 'uncertain' }, [q3]: { status: 'wrong' } };
results[q2] = { status: 'uncertain' }; // repeat write must stay one Question Truth row
assert(Object.keys(results).length === 3, 'question-result-not-idempotent-by-id');
const wu = wuIds(roundTrip(results));
assert(!wu.includes(q1) && wu.includes(q2) && wu.includes(q3) && wu.length === 2, 'wu-routing');
for (const question of sweep.questions) {
  if (question.relation) assert(question.relation.primaryKpId, `${question.questionId}:precise-relation-without-primary-kp`);
}

// ---------- Actual runtime-source contracts ----------
const xizongLib = read('static-web/src/lib/xizong.mjs');
const questionLib = read('static-web/src/lib/xizongQuestions.mjs');
const blockUi = read('static-web/src/components/XizongBlockV6.astro');
const enhancerUi = read('static-web/src/components/XizongStudyEnhancer.astro');
const memoryUi = read('static-web/src/components/XizongMemoryReviewV6.astro');
const systemPage = read('static-web/src/pages/xizong/[system]/index.astro');
const systemUi = read('static-web/src/components/XizongSystemV6.astro');
const exitUi = read('static-web/src/components/XizongSystemExitRuntime.astro');

has(xizongLib, 'function blockOpeningOrientation(markdown)', 'generic-opening-fallback-missing');
has(xizongLib, "replace(/^---\\s*\\n[\\s\\S]*?\\n---\\s*\\n+/, '')", 'generic-opening-does-not-strip-frontmatter');
has(xizongLib, 'const kpOrdinalSet = new Set(kpRecords.map((record) => record.ordinal));', 'stable-kp-identity-set-check-missing');
lacks(xizongLib, /record\.ordinal\s*!==\s*index\s*\+\s*1/, 'loader-still-forces-numeric-kp-order');
has(xizongLib, 'const intro = blockOpeningOrientation(markdown);', 'loader-bypasses-generic-opening');

lacks(systemPage, /2025-2026-v1|writeJson\(holdoutKey,\s*\[2025,\s*2026\]\)/, 'shared-runtime-seeds-private-holdout');
has(exitUi, 'let holdoutYears = readJson(holdoutKey, []);', 'holdout-not-empty-by-default');
has(exitUi, 'const normalizeHoldout = (value) =>', 'holdout-normalization-missing');
has(exitUi, 'eligibleYears.has(year)', 'holdout-normalization-does-not-restrict-to-eligible-years');
has(exitUi, 'holdoutYears = normalizeHoldout(holdoutYears);', 'persisted-holdout-not-normalized-before-use');
has(exitUi, 'const computeActive = () => data.questions.filter((question) => !holdoutYears.includes(Number(question.year)));', 'holdout-filter-runtime-missing');
matches(exitUi, /startSweep\.disabled\s*=\s*!\(recallState\.completedAt\s*&&\s*holdoutYears\.length\)/, 'sweep-gate-missing-recall-or-explicit-holdout');

matches(systemUi, /outlineCount\s*>\s*0\s*\?/, 'outline-absence-not-conditionally-projected');
lacks(systemUi, /Outline\s*\$\{?0\}?/, 'literal-outline-zero');

has(blockUi, 'data-kp-answer hidden', 'recall-answer-not-hidden');
has(blockUi, 'data-kp-reveal', 'recall-reveal-missing');
matches(blockUi, /learnedCount\(\)\s*>=\s*totalKp\s*&&\s*recallCount\(\)\s*>=\s*totalKp\s*&&\s*Boolean\(state\.blockRecallDone\)/, 'block-core-close-gate');
has(blockUi, "JSON.parse(localStorage.getItem(storageKey) || 'null')", 'block-persistence-read-missing');
has(blockUi, 'localStorage.setItem(storageKey, JSON.stringify(state))', 'block-persistence-write-missing');
has(blockUi, '} catch {}', 'block-storage-error-containment-missing');
matches(enhancerUi, /!personal\.lectureRead\s*\|\|\s*!coreReady/, 'lecture-one-pass-close-gate');

matches(memoryUi, /\['HOT',\s*'WARM'\]\.includes\(row\.memoryState\)/, 'weak-memory-admission');
has(memoryUi, "type: 'CHAT_PLAN_REVIEW', evidence_role: 'REPAIR_ONLY'", 'chat-repair-role');
lacks(memoryUi, /study\.ratings\s*=\s*\{[^\n]*current\.kpId/, 'chat-repair-rewrites-recall');
has(memoryUi, '.filter((row) => byId.has(row.kpId))', 'chat-import-not-current-block-scoped');
has(memoryUi, 'ext.lastRecallRatings[kpId] === rating', 'recall-evidence-sync-not-idempotent');
has(memoryUi, 'const parsed = JSON.parse(text);', 'chat-return-json-parse-path');
has(memoryUi, "window.alert('Chat 计划 JSON 无法解析。');", 'chat-return-json-error-path');
has(memoryUi, "chat_plan_review: 'repair-only evidence; never promoted into original Recall or mastery automatically'", 'study-packet-evidence-semantics');

has(exitUi, "persistResult(currentQuestion, 'wrong', currentSelection);", 'wrong-path');
has(exitUi, "nextAfter('stable')", 'stable-fast-pass');
has(exitUi, "persistResult(currentQuestion, 'uncertain', currentSelection);", 'uncertain-path');
has(exitUi, ".filter(({ result }) => result && ['wrong', 'uncertain'].includes(result.status))", 'wu-only-packet');
has(exitUi, 'results[question.questionId] = {', 'question-result-not-keyed-by-truth-id');
has(exitUi, '暂无审核过的精确 KP 回链：保留题号给 Chat，不让网页自己猜。', 'no-guess-guard');
has(questionLib, "if (!row || row.review_status !== 'REVIEWED') return null;", 'unreviewed-precise-relation-accepted');

console.log([
  'Xizong learner-contract acceptance PASS',
  `A1=${system.canonicalId}/${system.systemId}`,
  `Blocks=${system.blocks.length}`,
  `KP=${totalKp}`,
  `LogicGroups=${totalGroups}`,
  `Questions=${sweep.questionCount}`,
  `HoldoutTestYear=${testYear} excluded=${heldCount}`,
  'Journeys=canonical-order,clean,weak,chat-return,holdout,W/U,persistence,idempotency,error',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));
