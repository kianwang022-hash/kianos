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
const page = read('static-web/src/pages/xizong/[system]/index.astro');
const memory = read('static-web/src/components/XizongMemoryReviewV6.astro');

assert(component.includes("['wrong', 'uncertain'].includes(row.status)"), 'component-wu-filter-missing');
assert(component.includes('const relation = question?.relation;'), 'component-does-not-derive-canonical-relation');
assert(component.includes('reviewed relation'), 'component-safety-contract-missing');
assert(component.includes('kianos-xizong-memory-review-v2:'), 'block-review-delivery-missing');
assert(component.includes("target = '_blank'"), 'repair-does-not-preserve-question-mainline');
assert(component.includes('没有匹配到本轮真实 W/U 题号'), 'invalid-return-not-contained');
assert(page.includes('<XizongSystemRepairReturn system={system} />'), 'repair-return-not-mounted');
assert(memory.includes("evidence_role: 'REPAIR_ONLY'"), 'block-repair-evidence-role-regressed');
assert(memory.includes('不覆盖最初 KP Recall'), 'repair-overwrites-original-recall');

console.log([
  'A2 W/U repair-return PASS',
  `Questions=${sweep.questionCount}`,
  `ReviewedRoutes=${reviewed.length}`,
  `ProbeQuestion=${routed.questionId}`,
  `Route=${canonicalRelation.blockId}/${canonicalRelation.primaryKpId}`,
  'StableWorkDoesNotCreateRepairDebt=true',
  'ChatCannotInventQuestionToKnowledgeMapping=true',
  'ReturnKeepsQuestionMainline=true',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));
