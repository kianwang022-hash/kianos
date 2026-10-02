import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';
import { loadXizongSystemQuestionSweep } from '../src/lib/xizongQuestions.mjs';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';
import { verifyNativeMemoryEvidence } from './test-support/native-memory-evidence.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const fail = (message) => { throw new Error(`A2_EVIDENCE_ACCEPTANCE_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const system = loadXizongSystem('respiratory');
const sweep = loadXizongSystemQuestionSweep(system);
const block = loadXizongBlock('respiratory', system.blocks[0].slug);
assert(system.canonicalId === 'A2', 'wrong-system');
assert(system.blocks.length === 12, `blocks:${system.blocks.length}`);
assert(block.kpRecords.length > 1, 'block-too-small-for-evidence-probe');
assert(sweep?.questionCount === 359, `questions:${sweep?.questionCount}`);

// Only synthetic observations are supplied to the native Memory owners.
verifyNativeMemoryEvidence(resolveXizongLearnerProjection(block).learnerObject);

// Mounting, single-writer and non-destructive guards remain static checks.
// KP/System browser behavior is not fabricated by a copied test-side algorithm.
const blockGuard = read('static-web/src/components/XizongBlockEvidenceGuard.astro');
const systemGuard = read('static-web/src/components/XizongSystemEvidenceGuard.astro');
const recallBridge = read('static-web/src/components/XizongRecallEvidenceBridge.astro');
const memoryWorkspace = read('static-web/src/components/XizongMemoryWorkspace.astro');
const repairBridge = read('static-web/src/components/XizongRepairInboxBridge.astro');
const blockPage = read('static-web/src/pages/xizong/[system]/[block].astro');
const recallPage = read('static-web/src/pages/xizong/[system]/recall.astro');
const practicePage = read('static-web/src/pages/xizong/practice/[system].astro');
const repairReturn = read('static-web/src/components/XizongSystemRepairReturn.astro');
const systemWuReturn = read('static-web/src/lib/xizongSystemWuReturn.mjs');
const questionOwner = read('static-web/src/lib/xizongQuestions.mjs');

assert(!blockGuard.includes("type: 'KP_RECALL'"), 'block-evidence-guard-still-competes-for-recall-writes');
assert(!blockGuard.includes("[data-review-rating]"), 'block-evidence-guard-still-competes-for-repair-writes');
assert(blockPage.includes('<XizongBlockEvidenceGuard block={projection} />'), 'block-evidence-guard-not-mounted');
assert(blockPage.includes('<XizongRepairInboxBridge block={projection} />'), 'repair-inbox-bridge-not-mounted');

assert(recallBridge.includes("type: 'KP_RECALL'"), 'recall-ledger-owner-missing');
assert(recallBridge.includes("appendRecall(kpId, rating, 'USER_RECALL_ATTEMPT')"), 'user-recall-attempt-ledger-missing');
assert(recallBridge.includes("evidence_origin: 'BOOTSTRAP_EXISTING_STATE'"), 'legacy-recall-bootstrap-missing');
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

assert(recallPage.includes('<XizongSystemEvidenceGuard system={system} sweep={questionSweep} />'), 'recall-system-evidence-guard-not-mounted');
assert(practicePage.includes('<XizongSystemEvidenceGuard system={system} sweep={sweep} />'), 'practice-system-evidence-guard-not-mounted');

assert(
  repairReturn.includes('currentXizongSystemWuEvidence')
    && systemWuReturn.includes('export function currentXizongSystemWuEvidence')
    && systemWuReturn.includes('assertCurrentWuBinding'),
  'system-repair-return-does-not-read-private-wu-through-shared-owner'
);
assert(!repairReturn.includes('localStorage.setItem("content/'), 'private-evidence-writing-shared-content');

// Shared executable policy proof includes frozen destructive before guards,
// prompt preservation, local semantic/UNKNOWN claims, and native per-question
// invalidation across System/Paper/Targeted/Retained paths with history intact.
assert(!blockGuard.includes('localStorage.removeItem('), 'artifact-guard-must-not-delete-block-history');
assert(!systemGuard.includes('localStorage.removeItem('), 'artifact-guard-must-not-delete-system-history');
await import('./test-xizong-source-revision-transitive.mjs');

console.log([
  'A2 Evidence acceptance probe PASS',
  `System=${system.canonicalId}/${system.systemId}`,
  `Blocks=${system.blocks.length}`,
  `Questions=${sweep.questionCount}`,
  'Memory=NATIVE-selective+stable-exit+repeated-evidence+repair-closure',
  'RecallHistory=single-owner-static-guard',
  'ChatRepair=repair-only+single-owner-queue-closure',
  'RepairReturn=shared-owner-receipt+repair-only+atomic-inbox+cross-tab-safe',
  'SystemRecall=phase-wiring-static-guard',
  'RevisionEvidence=preserved+selective-current-claims',
  'LearnerState=browser-private',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));
