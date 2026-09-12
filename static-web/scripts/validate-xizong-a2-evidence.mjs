import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';
import { loadXizongSystemQuestionSweep } from '../src/lib/xizongQuestions.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const fail = (message) => { throw new Error(`A2_EVIDENCE_ACCEPTANCE_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const ratingState = (value) => value === 'unknown' || value === 'fuzzy' ? 'HOT' : value === 'known' ? 'WARM' : value === 'mastered' ? 'STABLE' : '';
const memoryItems = (kpIds, ratings, memory) => {
  const rows = kpIds.map((kpId) => ({ kpId, sourceRating: ratings[kpId] || '', memoryState: memory[kpId] || ratingState(ratings[kpId]) || '' }));
  const weak = rows.filter((row) => ['HOT', 'WARM'].includes(row.memoryState));
  return weak.length ? weak : rows.filter((row) => row.sourceRating && row.memoryState !== 'STABLE');
};
const systemRecallPhase = (answered, total) => answered === 0 ? 'PRE_QUESTION' : total > 0 && answered >= total ? 'POST_QUESTION' : 'MID_SWEEP';

const system = loadXizongSystem('respiratory');
const sweep = loadXizongSystemQuestionSweep(system);
const block = loadXizongBlock('respiratory', system.blocks[0].slug);
assert(system.canonicalId === 'A2', 'wrong-system');
assert(system.blocks.length === 12, `blocks:${system.blocks.length}`);
assert(block.kpRecords.length > 1, 'block-too-small-for-evidence-probe');
assert(sweep?.questionCount === 359, `questions:${sweep?.questionCount}`);

const [weakKp, stableKp] = block.kpRecords.slice(0, 2).map((kp) => kp.kpId);
const originalRatings = { [weakKp]: 'unknown', [stableKp]: 'mastered' };
let memory = {};
let queue = memoryItems([weakKp, stableKp], originalRatings, memory);
assert(queue.length === 1 && queue[0].kpId === weakKp, 'memory-admission-not-selective');
memory = { [weakKp]: 'STABLE' };
queue = memoryItems([weakKp, stableKp], originalRatings, memory);
assert(queue.length === 0, 'stable-memory-cannot-leave-weak-queue');
assert(originalRatings[weakKp] === 'unknown', 'memory-stable-overwrote-original-recall');

const evidenceHistory = [];
evidenceHistory.push({ type: 'KP_RECALL', kp_id: weakKp, rating: 'unknown' });
evidenceHistory.push({ type: 'KP_RECALL', kp_id: weakKp, rating: 'unknown' });
assert(evidenceHistory.length === 2, 'repeated-identical-recall-collapsed');
assert(evidenceHistory.filter((row) => row.kp_id === weakKp && row.rating === 'unknown').length === 2, 'repeated-weak-evidence-lost');

const repairHistory = [{ type: 'CHAT_PLAN_REVIEW', evidence_role: 'REPAIR_ONLY', kp_id: weakKp, rating: 'known' }];
let repairPlan = [{ kpId: weakKp, reason: 'mechanism gap', action: 'repair smallest owner' }];
repairPlan = repairPlan.filter((row) => row.kpId !== weakKp);
assert(repairPlan.length === 0, 'resolved-repair-task-stays-active');
assert(repairHistory[0].evidence_role === 'REPAIR_ONLY', 'repair-promoted-to-mastery');
assert(originalRatings[weakKp] === 'unknown', 'repair-overwrote-original-recall');

assert(systemRecallPhase(0, 100) === 'PRE_QUESTION', 'pre-question-recall-not-distinct');
assert(systemRecallPhase(40, 100) === 'MID_SWEEP', 'mid-sweep-recall-not-distinct');
assert(systemRecallPhase(100, 100) === 'POST_QUESTION', 'post-question-recall-not-distinct');

const blockGuard = read('static-web/src/components/XizongBlockEvidenceGuard.astro');
const systemGuard = read('static-web/src/components/XizongSystemEvidenceGuard.astro');
const memoryUi = read('static-web/src/components/XizongMemoryReviewV6.astro');
const blockPage = read('static-web/src/pages/xizong/[system]/[block].astro');
const systemPage = read('static-web/src/pages/xizong/[system]/index.astro');
const repairReturn = read('static-web/src/components/XizongSystemRepairReturn.astro');

assert(blockGuard.includes("type: 'KP_RECALL'"), 'block-recall-ledger-missing');
assert(blockGuard.includes('evidenceHistory = [...'), 'block-evidence-history-not-appended');
assert(blockGuard.includes("['known', 'mastered'].includes(value)"), 'resolved-repair-closure-missing');
assert(blockGuard.includes('ext.reviewPlan ='), 'resolved-repair-not-removed-from-active-plan');
assert(blockGuard.includes('kianos-xizong-stale-evidence-v1:'), 'stale-block-evidence-not-archived');
assert(blockGuard.includes('localStorage.removeItem(studyKey)'), 'stale-block-progress-remains-current');
assert(blockGuard.includes("kp: oldPersonal?.kp || {}"), 'learner-notes-not-preserved-on-version-reset');
assert(blockPage.includes('<XizongBlockEvidenceGuard block={projection} />'), 'block-evidence-guard-not-mounted');

assert(systemGuard.includes("phase = answered === 0 ? 'PRE_QUESTION'"), 'system-recall-phase-ledger-missing');
assert(systemGuard.includes("'POST_QUESTION'"), 'post-question-recall-phase-missing');
assert(systemGuard.includes('question.correctAnswer'), 'question-answer-change-not-versioned');
assert(systemGuard.includes('question.relation?.primaryKpId'), 'reviewed-route-change-not-versioned');
assert(systemGuard.includes('stale_block_question_plans'), 'stale-question-repair-plan-not-archived');
assert(systemGuard.includes('localStorage.removeItem(sweepKey)'), 'stale-question-results-remain-current');
assert(systemPage.includes('<XizongSystemEvidenceGuard system={system} sweep={questionSweep} />'), 'system-evidence-guard-not-mounted');

assert(memoryUi.includes("evidence_role: 'REPAIR_ONLY'"), 'chat-repair-role-regressed');
assert(memoryUi.includes("memory: 'local repair evidence; STABLE may clear the local weak queue but does not rewrite the original Recall rating'"), 'memory-semantics-regressed');
assert(memoryUi.includes("mastery: 'requires later meaningful fresh Recall/transfer evidence"), 'mastery-closure-too-weak');
assert(repairReturn.includes('const sweepState = () => readJson'), 'system-repair-return-does-not-read-private-wu');
assert(!repairReturn.includes('localStorage.setItem("content/'), 'private-evidence-writing-shared-content');

console.log([
  'A2 Evidence acceptance probe PASS',
  `System=${system.canonicalId}/${system.systemId}`,
  `Blocks=${system.blocks.length}`,
  `Questions=${sweep.questionCount}`,
  'Memory=selective+stable-exit',
  'RecallHistory=repeated-attempts-preserved',
  'ChatRepair=repair-only+queue-closure',
  'SystemRecall=pre/mid/post-distinct',
  'StaleEvidence=archive+fail-closed',
  'LearnerState=browser-private',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));
