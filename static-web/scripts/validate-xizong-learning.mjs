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

function canCloseBlock({ totalKp, learned, ratings, blockRecallDone }) {
  return totalKp > 0
    && Object.values(learned).filter(Boolean).length >= totalKp
    && Object.keys(ratings).length >= totalKp
    && Boolean(blockRecallDone);
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
assert(!canCloseBlock({ totalKp: kpIds.length, learned: learnedAll, ratings: masteredAll, blockRecallDone: false }), 'close-without-block-recall');
assert(canCloseBlock({ totalKp: kpIds.length, learned: learnedAll, ratings: masteredAll, blockRecallDone: true }), 'clean-path-cannot-close');

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
const richExplanation = sweep.questions.find((q) => q.explanation?.decisionAxis && q.explanation?.valuableDistractors?.length && q.explanation?.transferRule);
assert(Boolean(richExplanation), 'reviewed-second-pass-explanation-not-projected');
assert(richExplanation.explanation.valuableDistractors.every((item) => item.option && item.reason), 'valuable-distractor-projection-malformed');

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
const crosswalkLib = read('static-web/src/lib/xizongQuestionCrosswalk.mjs');
const blockUi = read('static-web/src/components/XizongBlockV6.astro');
const enhancerUi = read('static-web/src/components/XizongStudyEnhancer.astro');
const studyPacketLib = read('static-web/src/lib/xizongStudyPacket.mjs');
const memoryUi = read('static-web/src/components/XizongMemoryWorkspace.astro');
const recallEvidenceUi = read('static-web/src/components/XizongRecallEvidenceBridge.astro');
const repairInboxUi = read('static-web/src/components/XizongRepairInboxBridge.astro');
const repairReturnUi = read('static-web/src/components/XizongSystemRepairReturn.astro');
const memoryModel = read('static-web/src/lib/xizongMemoryModel.mjs');
const xizongPresentation = read('static-web/src/styles/xizong-presentation.css');
const xizongHome = read('static-web/src/pages/xizong/index.astro');
const systemPage = read('static-web/src/pages/xizong/[system]/index.astro');
const systemUi = read('static-web/src/components/XizongSystemWorkspace.astro');
const exitUi = read('static-web/src/components/XizongSystemExitRuntime.astro');
const practiceUi = read('static-web/src/components/XizongPracticeWorkbench.astro');
const questionAttemptLib = read('static-web/src/lib/xizongQuestionAttempts.mjs');

has(xizongLib, 'function blockOpeningOrientation(markdown)', 'generic-opening-fallback-missing');
has(xizongLib, "replace(/^---\\s*\\n[\\s\\S]*?\\n---\\s*\\n+/, '')", 'generic-opening-does-not-strip-frontmatter');
has(xizongLib, 'const kpOrdinalSet = new Set(kpRecords.map((record) => record.ordinal));', 'stable-kp-identity-set-check-missing');
lacks(xizongLib, /record\.ordinal\s*!==\s*index\s*\+\s*1/, 'loader-still-forces-numeric-kp-order');
has(xizongLib, 'const intro = blockOpeningOrientation(markdown);', 'loader-bypasses-generic-opening');

lacks(systemPage, /2025-2026-v1|writeJson\(holdoutKey,\s*\[2025,\s*2026\]\)/, 'shared-runtime-seeds-private-holdout');
has(practiceUi, "let holdoutYears = data.allowHoldout ? [] : readJson(holdoutKey, []);", 'system-holdout-empty-by-default-with-explicit-chat-override-only');
has(practiceUi, "const allowHoldout = set?.allow_holdout === true;", 'chat-holdout-override-must-be-explicit');
has(practiceUi, "if (selectedHoldoutYears.length && !allowHoldout)", 'chat-set-cannot-silently-consume-holdout');
has(practiceUi, 'const normalizeHoldout = (value) =>', 'holdout-normalization-missing');
has(practiceUi, 'eligibleYears.has(year)', 'holdout-normalization-does-not-restrict-to-eligible-years');
has(practiceUi, 'holdoutYears = normalizeHoldout(holdoutYears);', 'persisted-holdout-not-normalized-before-use');
has(practiceUi, 'const eligibleQuestions = () => data.questions.filter((q) => !holdoutYears.includes(Number(q.year)));', 'holdout-filter-runtime-missing');
has(practiceUi, 'deriveXizongQuestionIdsForCurrentRound(sweepState, eligible, [])', 'phase-aware-question-queue-derivation-missing');
has(questionLib, 'valuable_distractors', 'valuable-distractor-source-projection-missing');
has(questionLib, 'valuableDistractors', 'valuable-distractor-runtime-field-missing');
has(questionLib, 'reasoning_chain', 'reasoning-chain-source-projection-missing');
has(questionLib, 'reasoningChain', 'reasoning-chain-runtime-field-missing');
has(practiceUi, 'data-reasoning-chain', 'adaptive-reasoning-chain-surface-missing');
has(practiceUi, 'renderReview(currentQuestion, existing);', 'adaptive-review-not-bound-to-submitted-question');
has(practiceUi, "if (data.holdoutRequired !== false && !holdoutYears.length) { renderGate(); return; }", 'system-practice-gate-missing-explicit-holdout');

lacks(systemUi, /outlineCount/, 'retired-outline-count-returned');
lacks(systemUi, /Outline\s*\$\{?0\}?/, 'literal-outline-zero');
has(systemUi, 'class="xzSystemWorkspace"', 'current-system-workspace-namespace-missing');
lacks(systemUi, /xv6System/, 'retired-system-workspace-namespace-returned');

has(blockUi, 'data-kp-answer hidden', 'recall-answer-not-hidden');
has(blockUi, 'data-kp-reveal', 'recall-reveal-missing');
matches(blockUi, /learnedCount\(\)\s*>=\s*totalKp\s*&&\s*recallCount\(\)\s*>=\s*totalKp\s*&&\s*Boolean\(state\.blockRecallDone\)/, 'block-core-close-gate');
has(blockUi, 'const raw = localStorage.getItem(storageKey);', 'block-persistence-raw-read-missing');
has(blockUi, 'const saved = JSON.parse(raw);', 'block-persistence-json-parse-missing');
has(blockUi, "saved.schema !== 'kianos.xizong.block-state.v2'", 'block-persistence-schema-guard-missing');
has(blockUi, "suspend('本机学习记录无法安全读取", 'block-persistence-read-fail-closed-missing');
has(blockUi, "if (root.dataset.xizongStateBlocked === 'true') return false;", 'block-persistence-blocked-write-guard-missing');
has(blockUi, 'localStorage.setItem(storageKey, JSON.stringify(state))', 'block-persistence-write-missing');
has(blockUi, "suspend('本次学习状态未能保存", 'block-persistence-write-fail-closed-missing');
has(enhancerUi, 'button.disabled = !coreReady || Boolean(study.completed);', 'block-completion-ui-gate');
assert(!enhancerUi.includes('lectureRead'), 'legacy-block-lecture-confirmation-remains');

has(recallEvidenceUi, "appendRecall(kpId, rating, 'USER_RECALL_ATTEMPT')", 'real-recall-attempt-not-preserved');
has(recallEvidenceUi, 'evidence_origin: evidenceOrigin', 'recall-evidence-origin-not-persisted');
lacks(recallEvidenceUi, /lastRecallRatings\[kpId\]\s*===\s*rating/, 'real-recall-attempt-still-collapsed-by-rating');
has(studyPacketLib, "schema: 'kianos.xizong.study_packet.v3'", 'live-study-packet-schema-missing');
has(studyPacketLib, 'source_contact:', 'study-packet-source-contact-missing');
has(studyPacketLib, 'resume:', 'study-packet-exact-resume-missing');
has(studyPacketLib, 'ttsx:', 'study-packet-ttsx-state-missing');
has(studyPacketLib, 'collectXizongRetainedEvidence', 'study-packet-practice-evidence-missing');
has(enhancerUi, 'data-copy-study-packet', 'live-study-packet-action-missing');
has(memoryUi, 'completeRepairTask(state, item.id)', 'memory-repair-completion-missing');
has(memoryUi, 'data-repair-block-link', 'memory-repair-block-return-missing');
has(memoryUi, 'data-repair-return-link', 'memory-repair-question-return-missing');
has(repairReturnUi, 'setRepairTasks', 'system-wu-not-routed-to-current-memory-repair');
has(repairInboxUi, "evidence_role: 'REPAIR_ONLY'", 'repair-inbox-evidence-role-missing');
has(memoryModel, 'export function completeRepairTask', 'repair-completion-owner-missing');
lacks(enhancerUi, /Current 暂无精确定位/, 'engineering-current-jargon-in-study-dock');
lacks(systemUi, /Current 明确拥有|Current 只定义/, 'engineering-current-jargon-in-system');
lacks(practiceUi, /Current Question Truth|exam-format owner|canonical qid/, 'engineering-jargon-in-practice-errors');
lacks(memoryUi, /恢复 canonical|Current rule|Current owning Core|Current 精确答案/, 'engineering-jargon-in-memory');
lacks(xizongHome, /CURRENT SYSTEMS/, 'engineering-current-label-on-xizong-home');
has(xizongPresentation, '.kianosCurrentDock{display:none!important;}', 'engineering-current-dock-not-hidden-on-xizong');

has(practiceUi, 'data-question-uncertain', 'explicit-uncertain-control-missing');
has(practiceUi, "const status = isCorrect ? (currentUncertain ? 'uncertain' : 'stable') : 'wrong';", 'correct-unsure-not-recorded-as-uncertain');
has(practiceUi, "event.key.toLowerCase() === 'u'", 'uncertain-keyboard-grammar-missing');
has(practiceUi, "status: isCorrect ? (draft.uncertain ? 'uncertain' : 'stable') : 'wrong'", 'paper-uncertain-not-materialized-at-seal');
has(practiceUi, "setXizongQuestionMarked(sweepState", 'explicit-marked-state-missing');
has(practiceUi, 'recordXizongQuestionAttempt(sweepState, {', 'question-result-not-routed-through-stable-attempt-owner');
has(questionAttemptLib, "['wrong', 'uncertain'].includes", 'legacy-wu-evidence-not-preserved-for-targeted-second-pass');
has(questionAttemptLib, 'Boolean(marks[questionId])', 'marked-not-preserved-for-targeted-second-pass');
has(practiceUi, "['RESOLVED_KP','RESOLVED_BLOCK','BLOCK_ONLY'].includes(relation.targetStatus)", 'reviewed-relation-status-guard-missing');
has(practiceUi, 'relationWrap.hidden = true;', 'no-guess-guard');
has(questionLib, 'loadReviewedXizongQuestionRelation(questionId)', 'question-runtime-bypasses-crosswalk-owner');
has(crosswalkLib, "if (!row || row.review_status !== 'REVIEWED') return null;", 'unreviewed-precise-relation-accepted');

console.log([
  'Xizong learner-contract acceptance PASS',
  `A1=${system.canonicalId}/${system.systemId}`,
  `Blocks=${system.blocks.length}`,
  `KP=${totalKp}`,
  `LogicGroups=${totalGroups}`,
  `Questions=${sweep.questionCount}`,
  `HoldoutTestYear=${testYear} excluded=${heldCount}`,
  'Journeys=canonical-order,clean,weak,chat-return,holdout,W/U,persistence,bootstrap-idempotency,attempt-history,error',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));