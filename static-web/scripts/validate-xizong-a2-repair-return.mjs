import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadXizongSystem } from '../src/lib/xizong.mjs';
import { loadXizongSystemQuestionSweep } from '../src/lib/xizongQuestions.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const fail = (message) => { throw new Error(`A2_REPAIR_RETURN_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const system = loadXizongSystem('respiratory');
const sweep = loadXizongSystemQuestionSweep(system);
assert(system.canonicalId === 'A2', 'wrong-system');
assert(sweep?.questionCount === 359, `question-count:${sweep?.questionCount}`);

const reviewed = sweep.questions.filter((q) => q.relation?.blockId && q.relation?.primaryKpId);
assert(reviewed.length > 0, 'no-reviewed-repair-route');
const routed = reviewed[0];
const stable = sweep.questions.find((q) => q.questionId !== routed.questionId);
assert(stable, 'no-second-question');

const results = {
  [routed.questionId]: { status: 'wrong', selected: ['A'] },
  [stable.questionId]: { status: 'stable', selected: ['B'] }
};
const currentWu = () => Object.entries(results)
  .filter(([, row]) => row && ['wrong', 'uncertain'].includes(row.status))
  .map(([questionId]) => questionId);
const allowed = new Set(currentWu());
assert(allowed.has(routed.questionId), 'wrong-not-eligible');
assert(!allowed.has(stable.questionId), 'stable-became-repair-debt');

const returned = {
  plan: [
    { question_id: routed.questionId, reason: 'mechanism gap', action: 'repair smallest owner', priority: 'high', block_id: 'invented-block', kp_id: 'invented-kp' },
    { question_id: stable.questionId, reason: 'should be rejected', action: 'do not schedule' },
    { question_id: 'invented-question', reason: 'should be rejected', action: 'do not schedule' }
  ]
};
const accepted = returned.plan.filter((row) => allowed.has(row.question_id));
assert(accepted.length === 1 && accepted[0].question_id === routed.questionId, 'return-not-scoped-to-current-wu');

const canonicalRelation = sweep.questions.find((q) => q.questionId === accepted[0].question_id)?.relation;
assert(canonicalRelation?.blockId === routed.relation.blockId, 'canonical-block-route-lost');
assert(canonicalRelation?.primaryKpId === routed.relation.primaryKpId, 'canonical-kp-route-lost');
assert(canonicalRelation.blockId !== accepted[0].block_id, 'chat-invented-block-was-trusted');
assert(canonicalRelation.primaryKpId !== accepted[0].kp_id, 'chat-invented-kp-was-trusted');
assert(system.blocks.some((block) => block.blockId === canonicalRelation.blockId), 'reviewed-block-not-in-a2');

const component = read('static-web/src/components/XizongSystemRepairReturn.astro');
const bridge = read('static-web/src/components/XizongRepairInboxBridge.astro');
const page = read('static-web/src/pages/xizong/practice/[system].astro');
const blockPage = read('static-web/src/pages/xizong/[system]/[block].astro');
const memoryModel = read('static-web/src/lib/xizongMemoryModel.mjs');
const memoryWorkspace = read('static-web/src/components/XizongMemoryWorkspace.astro');

assert(component.includes("['wrong', 'uncertain'].includes(row.status)"), 'component-wu-filter-missing');
assert(component.includes('const relation = question?.relation;'), 'component-does-not-derive-canonical-relation');
assert(component.includes('reviewed relation'), 'component-safety-contract-missing');
assert(component.includes('kianos-xizong-repair-inbox-v1:'), 'block-repair-inbox-delivery-missing');
assert(!component.includes('kianos-xizong-memory-review-v2:${objectId}'), 'system-page-still-writes-block-evidence-store');
assert(component.includes("target = '_blank'"), 'repair-does-not-preserve-question-mainline');
assert(component.includes('没有匹配到本轮真实 W/U 题号'), 'invalid-return-not-contained');
assert(page.includes('<XizongSystemRepairReturn system={system} />'), 'repair-return-not-mounted');
assert(blockPage.includes('<XizongRepairInboxBridge block={projection} />'), 'repair-inbox-bridge-not-mounted');
assert(bridge.includes('kianos-xizong-repair-inbox-v1:'), 'bridge-does-not-read-repair-inbox');
assert(bridge.includes('XIZONG_MEMORY_STORAGE_KEY'), 'bridge-does-not-use-unified-memory-owner');
assert(bridge.includes('setRepairTasks'), 'bridge-bypasses-unified-repair-task-owner');
assert(bridge.includes("'SYSTEM_WU_CHAT_RETURN'"), 'bridge-system-wu-repair-origin-missing');
assert(bridge.includes("window.addEventListener('storage'"), 'open-block-tab-cannot-receive-repair-inbox');
assert(bridge.includes("kianos:xizong-repair-inbox-migrated"), 'repair-inbox-migration-event-missing');
assert(!bridge.includes('appendMemoryEvidence'), 'repair-inbox-must-not-write-recall/mastery-evidence');
assert(component.includes('XIZONG_MEMORY_STORAGE_KEY'), 'visible-memory-repair-delivery-missing');
assert(component.includes('setRepairTasks'), 'visible-memory-repair-owner-bypassed');
assert(component.includes("origin: 'SYSTEM_WU_CHAT_RETURN'"), 'visible-repair-origin-missing');
assert(memoryModel.includes('export function completeRepairTask'), 'visible-repair-completion-owner-missing');
assert(memoryWorkspace.includes('data-repair-complete'), 'visible-repair-completion-control-missing');
assert(memoryWorkspace.includes('不把修完自动写成 mastery'), 'repair-overwrites-mastery-boundary');

console.log([
  'A2 W/U repair-return PASS',
  `Questions=${sweep.questionCount}`,
  `ReviewedRoutes=${reviewed.length}`,
  `ProbeQuestion=${routed.questionId}`,
  `Route=${canonicalRelation.blockId}/${canonicalRelation.primaryKpId}`,
  'StableWorkDoesNotCreateRepairDebt=true',
  'ChatCannotInventQuestionToKnowledgeMapping=true',
  'ReturnKeepsQuestionMainline=true',
  'CrossTabRepairInbox=true',
  'VisibleMemoryRepair=true',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));