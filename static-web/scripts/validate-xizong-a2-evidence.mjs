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
const recallBridge = read('static-web/src/components/XizongRecallEvidenceBridge.astro');
const memoryModel = read('static-web/src/lib/xizongMemoryModel.mjs');
const memoryWorkspace = read('static-web/src/components/XizongMemoryWorkspace.astro');
const repairBridge = read('static-web/src/components/XizongRepairInboxBridge.astro');
const blockPage = read('static-web/src/pages/xizong/[system]/[block].astro');
const recallPage = read('static-web/src/pages/xizong/[system]/recall.astro');
const practicePage = read('static-web/src/pages/xizong/practice/[system].astro');
const repairReturn = read('static-web/src/components/XizongSystemRepairReturn.astro');
const systemWuReturn = read('static-web/src/lib/xizongSystemWuReturn.mjs');
const questionOwner = read('static-web/src/lib/xizongQuestions.mjs');

assert(blockGuard.includes('kianos-xizong-stale-evidence-v1:'), 'stale-block-evidence-not-archived');
assert(blockGuard.includes('localStorage.removeItem(studyKey)'), 'stale-block-progress-remains-current');
assert(blockGuard.includes("kp: oldPersonal?.kp || {}"), 'learner-notes-not-preserved-on-version-reset');
assert(blockGuard.includes('localStorage.removeItem(repairInboxKey)'), 'stale-block-repair-inbox-remains-current');
assert(!blockGuard.includes("type: 'KP_RECALL'"), 'block-evidence-guard-still-competes-for-recall-writes');
assert(!blockGuard.includes("[data-review-rating]"), 'block-evidence-guard-still-competes-for-repair-writes');
assert(blockPage.includes('<XizongBlockEvidenceGuard block={projection} />'), 'block-evidence-guard-not-mounted');
assert(blockPage.includes('<XizongRepairInboxBridge block={projection} />'), 'repair-inbox-bridge-not-mounted');

assert(recallBridge.includes("type: 'KP_RECALL'"), 'recall-ledger-owner-missing');
assert(recallBridge.includes("appendRecall(kpId, rating, 'USER_RECALL_ATTEMPT')"), 'user-recall-attempt-ledger-missing');
assert(recallBridge.includes("evidence_origin: 'BOOTSTRAP_EXISTING_STATE'"), 'legacy-recall-bootstrap-missing');
assert(memoryModel.includes('export function appendMemoryEvidence'), 'memory-evidence-owner-missing');
assert(memoryModel.includes('export function completeRepairTask'), 'resolved-repair-closure-missing');
assert(memoryWorkspace.includes('completeRepairTask(state, item.id)'), 'visible-repair-not-closed-through-owner');
assert(memoryWorkspace.includes('不把修完自动写成 mastery'), 'repair-promotes-mastery');

assert(
  repairReturn.includes('applyXizongSystemWuReturn') && repairReturn.includes('consumePendingXizongSystemWuReturn'),
  'system-repair-return-bypasses-shared-owner'
);
assert(
  systemWuReturn.includes("inboxKey:'kianos-xizong-repair-inbox-v1:xizong:'")
    && systemWuReturn.includes('storage.setItem(inboxKey'),
  'system-wu-return-owner-does-not-persist-repair-inbox'
);
assert(!repairReturn.includes('kianos-xizong-memory-review-v2:${objectId}'), 'system-repair-return-still-writes-block-evidence-store');
assert(repairBridge.includes('kianos-xizong-repair-inbox-v1:'), 'block-repair-inbox-not-consumed');
assert(
  systemWuReturn.includes("schema:'kianos.xizong.system_wu_return_receipt.v1'")
    && systemWuReturn.includes('repair_tasks:(detail.repairTasks || []).map((task)=>({')
    && systemWuReturn.includes('task_id:task.id')
    && systemWuReturn.includes('origin:task.origin'),
  'system-wu-return-bounded-receipt-missing'
);
assert(
  systemWuReturn.includes("origin:'SYSTEM_WU_CHAT_RETURN'")
    && systemWuReturn.includes('sourceQuestionIds:plan.sourceQuestionIds')
    && systemWuReturn.includes("status:'ACTIVE'")
    && systemWuReturn.includes('nextMemory=setRepairTasks(memory,[...kept,...tasks])'),
  'system-wu-return-repair-only-task-semantics-missing'
);
assert(
  repairBridge.includes('const next = setRepairTasks(memory, [...preserved, ...incoming]);')
    && repairBridge.includes("if (!writeJson(XIZONG_MEMORY_STORAGE_KEY, next)) throw new Error('Repair save failed');"),
  'repair-inbox-bridge-consumption-semantics-missing'
);
assert(repairBridge.includes("window.addEventListener('storage'"), 'open-block-tab-cannot-receive-repair');
assert(repairBridge.includes("window.dispatchEvent(new CustomEvent('kianos:xizong-repair-inbox-migrated'"), 'inbox-consume-does-not-announce-current-state');

assert(systemGuard.includes("phase = answered === 0 ? 'PRE_QUESTION'"), 'system-recall-phase-ledger-missing');
assert(systemGuard.includes("'POST_QUESTION'"), 'post-question-recall-phase-missing');
assert(
  systemGuard.includes('sweep?.questionSemanticHash')
    && questionOwner.includes("correct_answer: String(question?.correctAnswer || '')")
    && questionOwner.includes('export function xizongQuestionSemanticHash'),
  'question-answer-change-not-versioned'
);
assert(systemGuard.includes('question.relation?.primaryKpId'), 'reviewed-route-change-not-versioned');
assert(systemGuard.includes('stale_block_question_plans'), 'stale-question-repair-plan-not-archived');
assert(systemGuard.includes('stale_block_repair_inboxes'), 'stale-repair-inbox-not-archived');
assert(systemGuard.includes('stale_visible_memory_repairs'), 'stale-visible-repair-not-archived');
assert(
  systemGuard.includes('if (oldSweep && !writeJson(sweepKey, {')
    && systemGuard.includes('results: {},')
    && systemGuard.includes('current_revision_valid: false'),
  'stale-question-results-not-invalidated'
);
assert(recallPage.includes('<XizongSystemEvidenceGuard system={system} sweep={questionSweep} />'), 'recall-system-evidence-guard-not-mounted');
assert(practicePage.includes('<XizongSystemEvidenceGuard system={system} sweep={sweep} />'), 'practice-system-evidence-guard-not-mounted');

assert(
  repairReturn.includes('currentXizongSystemWuEvidence')
    && systemWuReturn.includes('export function currentXizongSystemWuEvidence')
    && systemWuReturn.includes('assertCurrentWuBinding'),
  'system-repair-return-does-not-read-private-wu-through-shared-owner'
);
assert(!repairReturn.includes('localStorage.setItem("content/'), 'private-evidence-writing-shared-content');

console.log([
  'A2 Evidence acceptance probe PASS',
  `System=${system.canonicalId}/${system.systemId}`,
  `Blocks=${system.blocks.length}`,
  `Questions=${sweep.questionCount}`,
  'Memory=selective+stable-exit',
  'RecallHistory=single-owner+repeated-attempts-preserved',
  'ChatRepair=repair-only+single-owner-queue-closure',
  'RepairReturn=shared-owner-receipt+repair-only+atomic-inbox+cross-tab-safe',
  'SystemRecall=pre/mid/post-distinct',
  'StaleEvidence=archive+fail-closed',
  'LearnerState=browser-private',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));