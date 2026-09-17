import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(webRoot, rel), 'utf8');
const block = read('src/components/XizongBlockV6.astro');
const guard = read('src/components/XizongRuntimeStageGuard.astro');
const systemPage = read('src/pages/xizong/[system]/index.astro');
const system = read('src/components/XizongSystemWorkspace.astro');
const base = read('src/layouts/Base.astro');

function assert(condition, code) {
  if (!condition) throw new Error(code);
}

// P1 — first learning is Logic-Group continuous Lecture contact, not KP-by-KP app switching.
assert(block.includes('不要按 KP 来回切换 App'), 'A1_P_GROUP_LECTURE_CONTINUITY_MISSING');
assert(block.includes('data-group-lecture-done'), 'A1_P_GROUP_LECTURE_HANDOFF_MISSING');
assert(block.includes('这一节原讲义已连续学完，开始 Recall'), 'A1_P_GROUP_RETURN_ACTION_MISSING');
assert(!block.includes('data-kp-learned'), 'A1_P_KP_BY_KP_LEARN_FLOW_REGRESSION');
assert(block.includes('<b>原讲义</b>') && block.includes('<b>本节 Recall</b>'), 'A1_P_CHAIN_SEMANTICS_MISSING');

// P2 — formal answer reveal remains behind a neutral Recall front.
assert(block.includes('先主动恢复，不看答案型标题。'), 'A1_P_NEUTRAL_RECALL_FRONT_MISSING');
assert(block.includes('data-kp-answer hidden'), 'A1_P_RECALL_ANSWER_NOT_HIDDEN');
assert(block.includes('data-kp-reveal'), 'A1_P_RECALL_REVEAL_MISSING');

// P3 — later stages fail closed against learner-state prerequisites.
assert(guard.includes("requested === 'kp_recall' && counts.learned <= counts.recalled"), 'A1_P_EARLY_KP_RECALL_NOT_GUARDED');
assert(guard.includes("requested === 'block_recall'"), 'A1_P_EARLY_BLOCK_RECALL_NOT_GUARDED');
assert(guard.includes("target.closest('[data-kp-reveal]')"), 'A1_P_EARLY_REVEAL_NOT_GUARDED');
assert(guard.includes("target.closest('[data-start-recall]')"), 'A1_P_EARLY_SYSTEM_RECALL_NOT_GUARDED');
assert(guard.includes("target.closest('[data-reveal-recall]')"), 'A1_P_EARLY_SYSTEM_REVEAL_NOT_GUARDED');

// P4 — System Exit is explicitly later-stage; first-learning System surface stays orientation-first.
assert(systemPage.includes('后面阶段 · System Exit'), 'A1_P_SYSTEM_EXIT_NOT_LATER_STAGE');
assert(systemPage.includes('学完整个系统后，再做 System Recall + 系统真题'), 'A1_P_SYSTEM_EXIT_TIMING_COPY_MISSING');
assert(
  system.includes('data-system-framework-plan="purpose-first"') &&
    system.includes('data-representation-gate={framework.schema}') &&
    system.includes('data-system-section="mother"') &&
    system.includes('data-system-section="failure"') &&
    system.includes('data-selected-title') &&
    system.includes('进入这个 Block') &&
    system.includes('class="xzSystemWorkspace"') &&
    !system.includes('xv6System'),
  'A1_P_SYSTEM_ORIENTATION_INCOMPLETE'
);

// P5 — governance/provenance metadata stays out of Xizong learner chrome.
assert(base.includes('body.surfaceBody-xizong .sourceDock'), 'A1_P_GOVERNANCE_DOCK_NOT_HIDDEN');
assert(base.includes('body.surfaceBody-xizong .portedSourceFoot'), 'A1_P_SOURCE_FOOT_NOT_HIDDEN');

// P6 — Projection does not invent Question→KP bindings in the Block learner surface.
assert(!block.includes('questionToKp') && !block.includes('question_to_kp'), 'A1_P_INFERRED_QUESTION_KP_SURFACE');

console.log('A1 Projection PASS | LogicGroupLecture=continuous | RecallReveal=guarded | SystemWorkspace=current-single-owner | SystemExit=later | GovernanceChrome=hidden');
