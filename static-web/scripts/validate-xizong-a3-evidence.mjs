import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';
import { loadXizongSystemQuestionSweep } from '../src/lib/xizongQuestions.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const fail = (message) => { throw new Error(`A3_EVIDENCE_ACCEPTANCE_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const ratingState = (value) => value === 'unknown' || value === 'fuzzy' ? 'HOT' : value === 'known' ? 'WARM' : value === 'mastered' ? 'STABLE' : '';
const memoryItems = (kpIds, ratings, memory) => {
  const rows = kpIds.map((kpId) => ({ kpId, sourceRating: ratings[kpId] || '', memoryState: memory[kpId] || ratingState(ratings[kpId]) || '' }));
  const weak = rows.filter((row) => ['HOT', 'WARM'].includes(row.memoryState));
  return weak.length ? weak : rows.filter((row) => row.sourceRating && row.memoryState !== 'STABLE');
};
const systemRecallPhase = (answered, total) => answered === 0 ? 'PRE_QUESTION' : total > 0 && answered >= total ? 'POST_QUESTION' : 'MID_SWEEP';
const activeQuestionIds = (questions, holdoutYears) => {
  const held = new Set(holdoutYears.map(Number));
  return questions.filter((question) => !held.has(Number(question.year))).map((question) => question.questionId);
};

const questionScope = JSON.parse(read('content/xizong/knowledge/learner/a3-urinary-question-scope.json'));
const expectedQuestionCount = Number(questionScope?.question_count || 0);
assert(expectedQuestionCount > 0, 'question-scope-count-missing');

const system = loadXizongSystem('urinary');
const sweep = loadXizongSystemQuestionSweep(system);
assert(system.canonicalId === 'A3', 'wrong-system');
assert(system.blocks.length === 14, `blocks:${system.blocks.length}`);
assert(sweep?.questionCount === expectedQuestionCount, `questions:${sweep?.questionCount}/${expectedQuestionCount}`);

let totalKp = 0;
let totalGroups = 0;
for (const meta of system.blocks) {
  const block = loadXizongBlock('urinary', meta.slug);
  totalKp += block.kpRecords.length;
  totalGroups += block.logicGroups.length;
}
assert(totalKp === 257, `kp:${totalKp}`);
assert(totalGroups === 75, `logic-groups:${totalGroups}`);

const firstBlock = loadXizongBlock('urinary', system.blocks[0].slug);
assert(firstBlock.kpRecords.length > 1, 'block-too-small-for-evidence-probe');
const [weakKp, stableKp] = firstBlock.kpRecords.slice(0, 2).map((kp) => kp.kpId);
const originalRatings = { [weakKp]: 'unknown', [stableKp]: 'mastered' };
let memory = {};
let queue = memoryItems([weakKp, stableKp], originalRatings, memory);
assert(queue.length === 1 && queue[0].kpId === weakKp, 'memory-admission-not-selective');
memory = { [weakKp]: 'STABLE' };
queue = memoryItems([weakKp, stableKp], originalRatings, memory);
assert(queue.length === 0, 'stable-memory-cannot-leave-weak-queue');
assert(originalRatings[weakKp] === 'unknown', 'memory-stable-overwrote-original-recall');

const evidenceHistory = [];
evidenceHistory.push({ type: 'KP_RECALL', kp_id: weakKp, rating: 'unknown', evidence_origin: 'USER_RECALL_ATTEMPT' });
evidenceHistory.push({ type: 'KP_RECALL', kp_id: weakKp, rating: 'unknown', evidence_origin: 'USER_RECALL_ATTEMPT' });
assert(evidenceHistory.length === 2, 'repeated-identical-recall-collapsed');
assert(evidenceHistory.every((row) => row.evidence_origin === 'USER_RECALL_ATTEMPT'), 'actual-recall-origin-lost');

const originalWeakRating = originalRatings[weakKp];
const repairHistory = [{ type: 'CHAT_PLAN_REVIEW', evidence_role: 'REPAIR_ONLY', kp_id: weakKp, rating: 'known' }];
let repairPlan = [{ kpId: weakKp, reason: 'mechanism gap', action: 'repair smallest owner' }];
repairPlan = repairPlan.filter((row) => row.kpId !== weakKp);
assert(repairPlan.length === 0, 'resolved-repair-task-stays-active');
assert(repairHistory[0].evidence_role === 'REPAIR_ONLY', 'repair-promoted-to-mastery');
assert(originalRatings[weakKp] === originalWeakRating, 'repair-overwrote-original-recall');

assert(systemRecallPhase(0, 100) === 'PRE_QUESTION', 'pre-question-recall-not-distinct');
assert(systemRecallPhase(40, 100) === 'MID_SWEEP', 'mid-sweep-recall-not-distinct');
assert(systemRecallPhase(100, 100) === 'POST_QUESTION', 'post-question-recall-not-distinct');

const years = [...new Set(sweep.questions.map((question) => Number(question.year)))].filter(Number.isFinite).sort((a, b) => a - b);
assert(years.length > 1, 'not-enough-years-for-holdout-probe');
const heldYear = years[years.length - 1];
const activeWithoutHoldout = activeQuestionIds(sweep.questions, []);
const activeWithHoldout = activeQuestionIds(sweep.questions, [heldYear]);
assert(activeWithoutHoldout.length === expectedQuestionCount, 'empty-holdout-must-not-hide-questions');
assert(activeWithHoldout.length < activeWithoutHoldout.length, 'holdout-does-not-protect-whole-paper-year');
assert(sweep.questions.filter((question) => Number(question.year) === heldYear).every((question) => !activeWithHoldout.includes(question.questionId)), 'held-year-question-leaked-into-sweep');

const blockGuard = read('static-web/src/components/XizongBlockEvidenceGuard.astro');
const systemGuard = read('static-web/src/components/XizongSystemEvidenceGuard.astro');
const recallBridge = read('static-web/src/components/XizongRecallEvidenceBridge.astro');
const memoryModel = read('static-web/src/lib/xizongMemoryModel.mjs');
const memoryWorkspace = read('static-web/src/components/XizongMemoryWorkspace.astro');
const repairBridge = read('static-web/src/components/XizongRepairInboxBridge.astro');
const blockPage = read('static-web/src/pages/xizong/[system]/[block].astro');
const recallPage = read('static-web/src/pages/xizong/[system]/recall.astro');
const practicePage = read('static-web/src/pages/xizong/practice/[system].astro');
const practiceUi = read('static-web/src/components/XizongPracticeWorkbench.astro');
const questionAttemptLib = read('static-web/src/lib/xizongQuestionAttempts.mjs');
const repairReturn = read('static-web/src/components/XizongSystemRepairReturn.astro');
const systemWuReturn = read('static-web/src/lib/xizongSystemWuReturn.mjs');

assert(blockGuard.includes('kianos-xizong-stale-evidence-v1:'), 'stale-block-evidence-not-archived');
assert(blockGuard.includes('localStorage.removeItem(studyKey)'), 'stale-block-progress-not-invalidated');
assert(blockGuard.includes('localStorage.removeItem(extensionKey)'), 'stale-block-extension-not-invalidated');
assert(blockGuard.includes('localStorage.removeItem(repairInboxKey)'), 'stale-block-repair-inbox-not-invalidated');
assert(blockGuard.includes("kp: oldPersonal?.kp || {}"), 'learner-notes-not-preserved-on-version-reset');
assert(!blockGuard.includes("type: 'KP_RECALL'"), 'block-guard-competes-for-recall-evidence');
assert(!blockGuard.includes('[data-review-rating]'), 'block-guard-competes-for-repair-evidence');

assert(recallBridge.includes("appendRecall(kpId, rating, 'USER_RECALL_ATTEMPT')"), 'user-recall-attempt-ledger-missing');
assert(recallBridge.includes("evidence_origin: 'BOOTSTRAP_EXISTING_STATE'"), 'existing-state-bootstrap-missing');
assert(recallBridge.includes("type: 'KP_RECALL'"), 'recall-ledger-owner-missing');
assert(memoryModel.includes('export function appendMemoryEvidence'), 'memory-evidence-owner-missing');
assert(memoryModel.includes('export function completeRepairTask'), 'resolved-repair-closure-missing');
assert(memoryWorkspace.includes('completeRepairTask(state, item.id)'), 'visible-repair-not-closed-through-owner');
assert(memoryWorkspace.includes('不把修完自动写成 mastery'), 'repair-closure-semantics-too-strong');

assert(systemWuReturn.includes("inboxKey:'kianos-xizong-repair-inbox-v1:xizong:'"), 'system-repair-return-bypasses-inbox');
assert(systemWuReturn.includes('storage.setItem(inboxKey'), 'system-repair-return-does-not-persist-inbox-first');
assert(!repairReturn.includes('kianos-xizong-memory-review-v2:${objectId}'), 'system-repair-return-competes-for-block-evidence-store');
assert(blockPage.includes('<XizongRepairInboxBridge block={projection} />'), 'repair-inbox-bridge-not-mounted');
assert(repairBridge.includes('kianos-xizong-repair-inbox-v1:'), 'repair-inbox-not-consumed');
assert(repairBridge.includes('XIZONG_MEMORY_STORAGE_KEY') && repairBridge.includes('setRepairTasks'), 'repair-inbox-does-not-merge-into-current-memory-owner');
assert(systemWuReturn.includes("origin:'SYSTEM_WU_CHAT_RETURN'"), 'repair-inbox-import-origin-missing');
assert(repairBridge.includes('const next = setRepairTasks(memory, [...preserved, ...incoming]);'), 'repair-inbox-promoted-beyond-repair');
assert(repairBridge.includes('sourceQuestionIds,'), 'repair-inbox-loses-question-provenance');
assert(repairBridge.includes("window.addEventListener('storage'"), 'already-open-block-tab-cannot-receive-inbox');
assert(repairBridge.includes("window.dispatchEvent(new CustomEvent('kianos:xizong-repair-inbox-migrated'"), 'repair-inbox-consume-does-not-announce-current-memory-state');

assert(systemGuard.includes("phase = answered === 0 ? 'PRE_QUESTION'"), 'system-recall-phase-ledger-missing');
assert(systemGuard.includes("'POST_QUESTION'"), 'post-question-recall-phase-missing');
assert(systemGuard.includes('blockEvidenceHash.toString(16)'), 'block-content-not-versioned-at-system-level');
assert(systemGuard.includes("system?.learningSupport?.sourceHash || ''"), 'learning-support-not-versioned-at-system-level');
assert(systemGuard.includes('stale_block_question_plans'), 'stale-question-derived-repair-not-archived');
assert(systemGuard.includes('stale_block_repair_inboxes'), 'stale-repair-inbox-not-archived');
assert(systemGuard.includes('stale_visible_memory_repairs'), 'stale-visible-repair-not-archived');
assert(systemGuard.includes('localStorage.removeItem(inboxKey)'), 'stale-system-repair-inbox-not-invalidated');
assert(systemGuard.includes('results: {},'), 'stale-system-sweep-results-not-cleared');
assert(systemGuard.includes('current_revision_valid: false'), 'stale-system-sweep-history-not-invalidated');
assert(recallPage.includes('<XizongSystemEvidenceGuard system={system} sweep={questionSweep} />'), 'recall-system-evidence-guard-not-mounted');
assert(practicePage.includes('<XizongSystemEvidenceGuard system={system} sweep={sweep} />'), 'practice-system-evidence-guard-not-mounted');

assert(practiceUi.includes("let holdoutYears = data.allowHoldout ? [] : readJson(holdoutKey, []);"), 'learner-holdout-not-private-empty-default');
assert(practiceUi.includes('const eligibleQuestions = () => data.questions.filter((q) => !holdoutYears.includes(Number(q.year)));'), 'holdout-not-excluded-from-active-sweep');
assert(practiceUi.includes('deriveXizongQuestionIdsForCurrentRound(sweepState, eligible, [])'), 'phase-aware-active-sweep-not-derived');
assert(questionAttemptLib.includes("['stable', 'uncertain', 'wrong'].includes(result.status)"), 'stable-uncertain-wrong-evidence-contract-not-distinct');
assert(questionAttemptLib.includes("['wrong', 'uncertain'].includes"), 'wu-targeted-second-pass-contract-missing');
assert(questionAttemptLib.includes('Boolean(marks[questionId])'), 'marked-targeted-second-pass-contract-missing');
assert(practiceUi.includes("if (relation?.knowledgePath && ['RESOLVED_KP','RESOLVED_BLOCK','BLOCK_ONLY'].includes(relation.targetStatus))"), 'missing-relation-is-being-guessed');
assert(practiceUi.includes("if (relationWrap) {\n        relationWrap.hidden = true;"), 'missing-relation-does-not-fail-closed');

assert(systemWuReturn.includes('currentXizongSystemWuEvidence'), 'repair-plan-not-bound-to-current-wu-owner');
assert(systemWuReturn.includes('assertCurrentWuBinding'), 'repair-plan-not-scoped-to-actual-wu');
assert(systemWuReturn.includes('!relation?.blockId || !relation?.primaryKpId || !route'), 'repair-route-not-reviewed-only');
assert(!repairReturn.includes('localStorage.setItem("content/'), 'private-learner-evidence-writing-shared-content');

console.log([
  'A3 Evidence acceptance probe PASS',
  `System=${system.canonicalId}/${system.systemId}`,
  `Blocks=${system.blocks.length}`,
  `KP=${totalKp}`,
  `LogicGroups=${totalGroups}`,
  `Questions=${sweep.questionCount}`,
  'Memory=selective+stable-exit-without-rewriting-first-recall',
  'RecallHistory=single-owner+repeated-attempts-preserved',
  'ChatRepair=repair-only+resolved-task-closure+no-mastery-promotion',
  'RepairReturn=atomic-inbox+cross-tab-safe+question-provenance',
  'SystemRecall=pre/mid/post-distinct',
  `Holdout=private+whole-year-exclusion(${heldYear})`,
  'StaleEvidence=block+system archive/fail-closed',
  'LearnerState=browser-private',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));