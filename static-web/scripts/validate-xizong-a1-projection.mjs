import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(webRoot, rel), 'utf8');
const block = read('src/components/XizongBlockV6.astro');
const guard = read('src/components/XizongRuntimeStageGuard.astro');
const systemPage = read('src/pages/xizong/[system]/index.astro');
const system = read('src/components/XizongSystemWorkspace.astro');
const frame = read('src/layouts/BaseFrame.astro');

function assert(condition, code) {
  if (!condition) throw new Error(code);
}

// P1 — first learning preserves continuous original-Lecture contact and returns into local Recall.
// Validate the Current state graph/controls rather than historical learner copy.
assert(block.includes('data-source-contact-mode={sourceContactMode}'), 'A1_P_SOURCE_CONTACT_MODE_MISSING');
assert(block.includes('data-study-stage="source_contact"') && block.includes('data-source-contact-done'), 'A1_P_BLOCK_SOURCE_CONTACT_MISSING');
assert(block.includes('data-study-stage="kp_learn"') && block.includes('data-group-lecture-done'), 'A1_P_GROUP_LECTURE_HANDOFF_MISSING');
assert(block.includes('MarginNote 连续学习 + Mac KP Learn 同时进行'), 'A1_P_GROUP_LECTURE_CONTINUITY_MISSING');
assert(block.includes('data-study-stage="kp_recall"'), 'A1_P_GROUP_RETURN_ACTION_MISSING');
assert(!block.includes('data-kp-learned'), 'A1_P_KP_BY_KP_LEARN_FLOW_REGRESSION');
assert(block.includes('data-enter-group') && block.includes('data-group-lecture-done') && block.includes('data-source-contact-done'), 'A1_P_CHAIN_SEMANTICS_MISSING');

// P2 — formal Core reveal remains behind the Recall front.
assert(block.includes('Core 暂时隐藏'), 'A1_P_NEUTRAL_RECALL_FRONT_MISSING');
assert(block.includes('data-kp-answer hidden'), 'A1_P_RECALL_ANSWER_NOT_HIDDEN');
assert(block.includes('data-kp-reveal'), 'A1_P_RECALL_REVEAL_MISSING');

// P3 — later stages fail closed against learner-state prerequisites.
assert(guard.includes("requested === 'kp_recall' && counts.learned <= counts.recalled"), 'A1_P_EARLY_KP_RECALL_NOT_GUARDED');
assert(guard.includes("requested === 'block_recall'"), 'A1_P_EARLY_BLOCK_RECALL_NOT_GUARDED');
assert(guard.includes("target.closest('[data-kp-reveal]')"), 'A1_P_EARLY_REVEAL_NOT_GUARDED');
assert(guard.includes("target.closest('[data-start-recall]')"), 'A1_P_EARLY_SYSTEM_RECALL_NOT_GUARDED');
assert(guard.includes("target.closest('[data-reveal-recall]')"), 'A1_P_EARLY_SYSTEM_REVEAL_NOT_GUARDED');

// P4 — System Recall/Practice stay later-stage and fail closed until whole-System completion.
assert(systemPage.includes('data-xizong-system-recall-entry hidden'), 'A1_P_SYSTEM_EXIT_NOT_LATER_STAGE');
assert(systemPage.includes('整个 System 已完成，进入系统级闭卷重建。') && systemPage.includes('Recall 是独立工作区；完成后再进入训练。'), 'A1_P_SYSTEM_EXIT_TIMING_COPY_MISSING');
assert(
  system.includes('data-system-framework-plan="purpose-first"') &&
    system.includes('data-representation-gate={framework.schema}') &&
    system.includes('data-system-section="mother"') &&
    system.includes('data-system-section="failure"') &&
    system.includes('data-system-block={index}') &&
    system.includes('class="xzSystemRouteRail"') &&
    system.includes('class="xzSystemStage"') &&
    system.includes('data-system-view-button="framework"') &&
    system.includes('class="xzSystemWorkspace"') &&
    !system.includes('data-selected-title') &&
    !system.includes('xv6System'),
  'A1_P_SYSTEM_ORIENTATION_INCOMPLETE'
);

// P5 — governance/provenance metadata stays out of Xizong learner chrome.
assert(frame.includes('body.surfaceBody-xizong .sourceDock'), 'A1_P_GOVERNANCE_DOCK_NOT_HIDDEN');
assert(frame.includes('body.surfaceBody-xizong .portedSourceFoot'), 'A1_P_SOURCE_FOOT_NOT_HIDDEN');

// P6 — Projection does not invent Question→KP bindings in the Block learner surface.
assert(!block.includes('questionToKp') && !block.includes('question_to_kp'), 'A1_P_INFERRED_QUESTION_KP_SURFACE');

console.log('A1 Projection PASS | SourceContact=continuous+conditional | RecallReveal=guarded | SystemWorkspace=current-single-owner | SystemRecall=later | GovernanceChrome=hidden');
