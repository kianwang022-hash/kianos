import fs from 'node:fs';
import path from 'node:path';
import { loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';
import { loadXizongSystemQuestionSweep } from '../src/lib/xizongQuestions.mjs';
import {
  loadReviewedXizongQuestionRelation,
  loadXizongQuestionCrosswalkForBlock,
  xizongQuestionRelationFreshnessSummary
} from '../src/lib/xizongQuestionCrosswalk.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_CROSSWALK_FAIL:${name}${detail ? `:${detail}` : ''}`);
  console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`);
};

const mappedId = 'xizong-official-2005-n008';
const mapped = loadReviewedXizongQuestionRelation(mappedId);
check(mapped?.reviewStatus === 'REVIEWED', 'reviewed_relation_only');
check(mapped?.targetStatus === 'RESOLVED_KP', 'respiratory_relation_resolves_to_current_kp', mapped?.targetStatus || 'missing');
check(mapped?.systemId === 'respiratory', 'respiratory_relation_current_system');
check(mapped?.blockId === 'respiratory-r02' && mapped?.blockSlug === 'r02', 'respiratory_relation_current_block');
check(mapped?.primaryKpId === 'respiratory-r02-kp03' && mapped?.primaryRuntimeKpId === 'respiratory-r02-kp03', 'respiratory_primary_kp_exact');
check(mapped?.knowledgePath === 'xizong/respiratory/r02/#crosswalk-respiratory-r02-kp03', 'question_to_knowledge_path_exact', mapped?.knowledgePath || 'missing');

const respiratory = loadXizongSystem('respiratory');
const sweep = loadXizongSystemQuestionSweep(respiratory);
check(Boolean(sweep?.questions?.length), 'respiratory_sweep_available');
check(sweep.questions.some((question) => question.questionId === mappedId && question.relation?.knowledgePath === mapped.knowledgePath), 'system_sweep_uses_shared_crosswalk');
const unmapped = sweep.questions.find((question) => !question.relation);
check(Boolean(unmapped), 'missing_mapping_is_legal', unmapped?.questionId || 'none');

const freshness = xizongQuestionRelationFreshnessSummary();
check(
  freshness.currentReviewedRelationCount + freshness.nonCurrentReviewedRelationCount === freshness.reviewedRelationCount,
  'reviewed_relation_freshness_partition'
);
if (freshness.nonCurrentReviewedRelationCount > 0) {
  const sample = freshness.sampleNonCurrentRelations[0];
  check(
    loadReviewedXizongQuestionRelation(sample.questionId) === null,
    'stale_reviewed_relation_fails_closed',
    `${sample.questionId}:${sample.freshnessStatus}`
  );
}

const r02 = loadXizongBlock('respiratory', 'r02');
const reverse = loadXizongQuestionCrosswalkForBlock(r02);
const reverseRow = reverse.logicGroups
  .flatMap((group) => group.kpRows)
  .flatMap((kp) => kp.questions.map((question) => ({ kp, question })))
  .find(({ question }) => question.questionId === mappedId);
check(Boolean(reverseRow), 'reverse_lookup_derives_from_same_relation');
check(reverseRow?.kp?.runtimeKpId === 'respiratory-r02-kp03', 'reverse_lookup_exact_kp');
check(reverseRow?.question?.roles?.includes('PRIMARY'), 'reverse_lookup_preserves_primary_role');

const bRelationId = 'xizong-official-2005-n010';
const bRelation = loadReviewedXizongQuestionRelation(bRelationId);
const bSystemPath = path.join(repoRoot, 'content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/system.json');
const bSystem = JSON.parse(fs.readFileSync(bSystemPath, 'utf8'));
check(bRelation?.sourceSystemId === bSystem?.system_id, 'b_relation_uses_current_canonical_system_id', bRelation?.sourceSystemId || 'missing');
check(bRelation?.reviewStatus === 'REVIEWED', 'b_relation_is_reviewed');
check(bRelation?.systemId === bSystem?.system_id, 'b_relation_resolves_to_current_system', bRelation?.systemId || 'missing');
check(bRelation?.blockId === 'D2', 'b_relation_current_block', bRelation?.blockId || 'missing');
check(bRelation?.targetStatus === 'RESOLVED_KP', 'b_reviewed_relation_resolves_to_current_kp', bRelation?.targetStatus || 'missing');
check(bRelation?.primaryKpId === 'digestive-d2-kp08' && bRelation?.primaryRuntimeKpId === 'digestive-d2-kp08', 'b_relation_primary_kp_exact');
check(Boolean(bRelation?.knowledgePath), 'b_relation_has_current_knowledge_path');

const ownerOnlyRelation = loadReviewedXizongQuestionRelation('xizong-official-2007-n007');
check(ownerOnlyRelation?.targetStatus === 'BLOCK_ONLY', 'unprojected_current_owner_stays_block_only', ownerOnlyRelation?.targetStatus || 'missing');
check(ownerOnlyRelation?.systemId === 'neuro-sensory-motor-orthopedics', 'unprojected_current_owner_keeps_current_system', ownerOnlyRelation?.systemId || 'missing');
check(ownerOnlyRelation?.currentOwnerOnly === true && ownerOnlyRelation?.projectionAvailable === false, 'unprojected_current_owner_declares_projection_boundary');
check(!ownerOnlyRelation?.knowledgePath, 'unprojected_current_owner_does_not_fabricate_route');

const practiceSource = fs.readFileSync(path.join(repoRoot, 'static-web/src/components/XizongPracticeWorkbench.astro'), 'utf8');
const reverseSource = fs.readFileSync(path.join(repoRoot, 'static-web/src/components/XizongQuestionCrosswalkReverse.astro'), 'utf8');
check(
  practiceSource.includes('relationWrap.hidden = true')
    && !practiceSource.includes('暂无可安全消费的 REVIEWED 回链')
    && !practiceSource.includes('不补猜映射'),
  'practice_missing_mapping_stays_silent_fail_closed'
);
check(practiceSource.includes("['RESOLVED_KP','RESOLVED_BLOCK','BLOCK_ONLY'].includes(relation.targetStatus)"), 'practice_requires_reviewed_resolved_target');
check(practiceSource.includes('relation?.knowledgePath'), 'practice_consumes_shared_relation_path');
check(reverseSource.includes('canonical REVIEWED Question→Knowledge relation') && reverseSource.includes('不会被网页猜进来'), 'reverse_lookup_declares_derived_only');

const practicePage = fs.readFileSync(path.join(repoRoot, 'static-web/src/pages/xizong/practice/[system].astro'), 'utf8');
const blockPage = fs.readFileSync(path.join(repoRoot, 'static-web/src/pages/xizong/[system]/[block].astro'), 'utf8');
check(practicePage.includes('<XizongPracticeWorkbench system={system} sweep={sweep} />'), 'practice_consumer_mounted');
check(blockPage.includes('<XizongQuestionCrosswalkReverse crosswalk={crosswalk} />'), 'block_reverse_lookup_mounted');

console.log(`XIZONG_CROSSWALK_OK mapped=${mappedId} missing=${unmapped?.questionId} reverse=${reverse.reviewedQuestionCount}`);
