import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';
import { loadXizongSystemQuestionSweep } from '../src/lib/xizongQuestions.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
const fail = (message) => { throw new Error(`A1_EVIDENCE_ACCEPTANCE_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

const system = loadXizongSystem('circulation');
const sweep = loadXizongSystemQuestionSweep(system);
assert(system.canonicalId === 'A1', `system:${system.canonicalId}`);
assert(system.blocks.length === 12, `blocks:${system.blocks.length}`);
assert(sweep?.questionCount === 376, `questions:${sweep?.questionCount}`);

let totalKp = 0;
let totalGroups = 0;
for (const meta of system.blocks) {
  const block = loadXizongBlock('circulation', meta.slug);
  totalKp += block.kpRecords.length;
  totalGroups += block.logicGroups.length;
}
assert(totalKp === 312, `kp:${totalKp}`);
assert(totalGroups > 0, 'logic-groups-missing');

const recallBridge = read('static-web/src/components/XizongRecallEvidenceBridge.astro');
const memoryWorkspace = read('static-web/src/components/XizongMemoryWorkspace.astro');
const memoryModel = read('static-web/src/lib/xizongMemoryModel.mjs');
const blockGuard = read('static-web/src/components/XizongBlockEvidenceGuard.astro');
const systemGuard = read('static-web/src/components/XizongSystemEvidenceGuard.astro');
const repairReturn = read('static-web/src/components/XizongSystemRepairReturn.astro');
const repairBridge = read('static-web/src/components/XizongRepairInboxBridge.astro');
const practiceUi = read('static-web/src/components/XizongPracticeWorkbench.astro');
const questionLib = read('static-web/src/lib/xizongQuestions.mjs');
const crosswalkLib = read('static-web/src/lib/xizongQuestionCrosswalk.mjs');
const blockPage = read('static-web/src/pages/xizong/[system]/[block].astro');
const recallPage = read('static-web/src/pages/xizong/[system]/recall.astro');
const practicePage = read('static-web/src/pages/xizong/practice/[system].astro');

// Block Recall evidence has one live semantic writer and keeps every real attempt.
assert(recallBridge.includes("evidence_origin: 'USER_RECALL_ATTEMPT'"), 'user-recall-attempt-ledger-missing');
assert(recallBridge.includes("evidence_origin: 'BOOTSTRAP_EXISTING_STATE'"), 'bootstrap-evidence-origin-missing');
assert(recallBridge.includes("ext.evidenceHistory = ["), 'evidence-history-not-append-only');
assert(recallBridge.includes(".slice(-400)"), 'evidence-history-not-bounded');
assert(memoryModel.includes('export function appendMemoryEvidence'), 'memory-evidence-owner-missing');
assert(memoryWorkspace.includes('appendMemoryEvidence(state,'), 'memory-workspace-bypasses-memory-evidence-owner');
assert(memoryModel.includes('export function completeRepairTask'), 'repair-completion-evidence-owner-missing');
assert(memoryWorkspace.includes('completeRepairTask(state, item.id)'), 'visible-repair-completion-not-wired');
assert(!blockGuard.includes("type: 'KP_RECALL'"), 'block-guard-competes-for-recall-writes');
assert(!blockGuard.includes('[data-memory-rating]'), 'block-guard-competes-for-memory-writes');

// Block content-version changes archive incompatible evidence and preserve only notes.
assert(blockGuard.includes('kianos-xizong-stale-evidence-v1:'), 'stale-block-archive-missing');
assert(blockGuard.includes('localStorage.removeItem(studyKey)'), 'stale-block-study-not-invalidated');
assert(blockGuard.includes('localStorage.removeItem(extensionKey)'), 'stale-block-extension-not-invalidated');
assert(blockGuard.includes('localStorage.removeItem(repairInboxKey)'), 'stale-block-inbox-not-invalidated');
assert(blockGuard.includes("lectureRead: false, kp: oldPersonal?.kp || {}"), 'stale-block-personal-note-boundary-invalid');

// System Evidence versions include system/learning/block/question truth and invalidate stale question-derived state.
assert(systemGuard.includes('blockEvidenceHash.toString(16)'), 'system-version-misses-block-content');
assert(systemGuard.includes("system?.learningSupport?.sourceHash || ''"), 'system-version-misses-learning-support');
assert(systemGuard.includes('questionEvidenceHash.toString(16)'), 'system-version-misses-question-evidence');
assert(systemGuard.includes('kianos-xizong-stale-system-evidence:'), 'stale-system-archive-missing');
assert(systemGuard.includes('stale_block_question_plans'), 'stale-system-question-plan-archive-missing');
assert(systemGuard.includes('stale_block_repair_inboxes'), 'stale-system-inbox-archive-missing');
assert(systemGuard.includes('localStorage.removeItem(recallKey)'), 'stale-system-recall-not-invalidated');
assert(systemGuard.includes('localStorage.removeItem(sweepKey)'), 'stale-system-sweep-not-invalidated');
assert(systemGuard.includes("phase = answered === 0 ? 'PRE_QUESTION'"), 'system-recall-pre-phase-missing');
assert(systemGuard.includes("'MID_SWEEP'"), 'system-recall-mid-phase-missing');
assert(systemGuard.includes("'POST_QUESTION'"), 'system-recall-post-phase-missing');

// Stable question evidence stays out of repair. Precise repair requires reviewed relation.
assert(repairReturn.includes(".filter(([, row]) => row && ['wrong', 'uncertain'].includes(row.status))"), 'stable-question-forced-to-repair');
assert(repairReturn.includes('const allowed = new Set(currentWu().map'), 'repair-plan-not-scoped-to-current-wu');
assert(practiceUi.includes("let holdoutYears = data.allowHoldout ? [] : readJson(holdoutKey, []);"), 'holdout-not-private-empty-default');
assert(practiceUi.includes('const eligibleQuestions = () => data.questions.filter((q) => !holdoutYears.includes(Number(q.year)));'), 'holdout-not-excluded-from-sweep');
assert(repairReturn.includes('暂无审核过的精确 Block/KP 回链：保留题号给 Chat，不自动猜。'), 'missing-relation-guessed');
assert(questionLib.includes('loadReviewedXizongQuestionRelation(questionId)'), 'question-runtime-bypasses-crosswalk-owner');
assert(crosswalkLib.includes("if (!row || row.review_status !== 'REVIEWED') return null;"), 'unreviewed-question-relation-accepted');
assert(repairReturn.includes('allowed.has(row.questionId)'), 'repair-plan-not-limited-to-current-wu');
assert(repairReturn.includes('!relation?.blockId || !relation?.primaryKpId'), 'repair-return-not-reviewed-only');

// System→Block repair uses fail-closed inbox ownership and preserves question provenance.
assert(repairReturn.includes('kianos-xizong-repair-inbox-v1:'), 'system-repair-bypasses-inbox');
assert(repairBridge.includes('kianos-xizong-repair-inbox-v1:'), 'block-inbox-consumer-missing');
assert(repairBridge.includes("type: 'SYSTEM_WU_PLAN_IMPORTED'"), 'inbox-import-evidence-missing');
assert(repairBridge.includes("evidence_role: 'REPAIR_ONLY'"), 'inbox-import-promotes-mastery');
assert(repairBridge.includes('source_question_ids:'), 'inbox-loses-question-provenance');
const durableWriteIndex = repairBridge.indexOf('if (!writeJson(extensionKey, ext)) return false;');
const durableClearIndex = repairBridge.indexOf('localStorage.removeItem(inboxKey)', durableWriteIndex);
assert(durableWriteIndex >= 0 && durableClearIndex > durableWriteIndex, 'inbox-clear-before-write');
assert(repairBridge.includes("window.addEventListener('storage'"), 'already-open-block-cross-tab-return-missing');
assert(blockPage.includes('<XizongBlockEvidenceGuard block={projection} />'), 'block-evidence-guard-not-mounted');
assert(blockPage.includes('<XizongRepairInboxBridge block={projection} />'), 'repair-inbox-bridge-not-mounted');
assert(recallPage.includes('<XizongSystemEvidenceGuard system={system} sweep={questionSweep} />'), 'recall-system-evidence-guard-not-mounted');
assert(practicePage.includes('<XizongSystemEvidenceGuard system={system} sweep={sweep} />'), 'practice-system-evidence-guard-not-mounted');

// Current A1 question set contains both reviewed and unresolved precise relation cases,
// so the executed Evidence journey can challenge both paths instead of fabricating fixtures.
const reviewed = sweep.questions.filter((question) => question.relation?.blockId && question.relation?.primaryKpId);
const unresolved = sweep.questions.filter((question) => !question.relation?.blockId || !question.relation?.primaryKpId);
assert(reviewed.length > 0, 'no-reviewed-question-relation-for-a1-evidence-test');
assert(unresolved.length > 0, 'no-unresolved-question-relation-for-a1-evidence-test');

console.log([
  'A1 Evidence contract PASS',
  `Blocks=${system.blocks.length}`,
  `KP=${totalKp}`,
  `LogicGroups=${totalGroups}`,
  `Questions=${sweep.questionCount}`,
  `ReviewedRelations=${reviewed.length}`,
  `UnresolvedRelations=${unresolved.length}`,
  'RecallHistory=append-only+repeated-attempt-contract',
  'Repair=repair-only+reviewed-relation-only',
  'Holdout=private+excluded',
  'StaleEvidence=block+system-fail-closed',
  'Inbox=write-before-clear+cross-tab',
  'U=NOT_TESTED'
].join(' | '));