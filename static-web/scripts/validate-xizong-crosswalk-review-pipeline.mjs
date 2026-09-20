import fs from 'node:fs';
import path from 'node:path';
import { buildXizongCrosswalkReviewQueue } from './build-xizong-crosswalk-review-queue.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_CROSSWALK_REVIEW_PIPELINE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`);
};

const defaultQueue = buildXizongCrosswalkReviewQueue({ limit: 250 });
check(defaultQueue.no_inference === true, 'queue_declares_no_inference');
check(defaultQueue.semantic_authority === 'NONE_PACKET_ONLY', 'queue_has_no_semantic_authority');
check(defaultQueue.anti_anchored === true, 'queue_is_anti_anchored');
check(defaultQueue.schema === 'kianos.xizong.crosswalk_review_queue.v2', 'queue_uses_v2_anti_anchor_shape');
check(defaultQueue.independent_analysis_contract?.exam_target, 'queue_defines_independent_exam_target');
check(defaultQueue.independent_analysis_contract?.decision_axis, 'queue_defines_independent_decision_axis');
check(defaultQueue.independent_analysis_contract?.answer_logic, 'queue_defines_independent_answer_logic');
check(defaultQueue.independent_analysis_contract?.mapping_fit, 'queue_defines_smallest_sufficient_mapping_fit');
check(defaultQueue.independent_analysis_contract?.uncertainty, 'queue_defines_fail_closed_uncertainty');
check(defaultQueue.candidate_count > 0, 'default_queue_has_review_candidates', String(defaultQueue.candidate_count));
check(defaultQueue.candidates.every((row) => row.review_mode === 'DEFAULT_ANTI_ANCHORED_REVIEW'), 'default_queue_uses_anti_anchored_review_mode');
check(defaultQueue.candidates.every((row) => !Object.hasOwn(row, 'mapping_decision')), 'default_queue_withholds_mapping_decision');
check(defaultQueue.candidates.every((row) => !Object.hasOwn(row, 'explanation')), 'default_queue_withholds_old_explanation');
check(defaultQueue.candidates.every((row) => !Object.hasOwn(row, 'current_relation')), 'default_queue_withholds_prior_relation_targets');
check(defaultQueue.candidates.every((row) => row.relation_exists === false), 'default_queue_excludes_already_reviewed_relations');
check(defaultQueue.candidates.some((row) => row.question_id === 'xizong-official-2005-n132'), 'known_unmapped_needs_review_candidate_is_present');
check(!defaultQueue.candidates.some((row) => row.question_id === 'xizong-official-2005-n127'), 'newly_reviewed_candidate_drops_out_automatically');
check(!defaultQueue.candidates.some((row) => row.question_id === 'xizong-official-2005-n036'), 'no_safe_match_not_silently_promoted');

const explicit = buildXizongCrosswalkReviewQueue({
  questionIds: [
    'xizong-official-2005-n036',
    'xizong-official-2005-n042',
    'xizong-official-2005-n044'
  ]
});
const byId = new Map(explicit.candidates.map((row) => [row.question_id, row]));
check(byId.get('xizong-official-2005-n036')?.review_mode === 'EXPLICIT_ANTI_ANCHORED_REVIEW', 'explicit_no_safe_rereview_is_allowed_without_mapping');
check(byId.get('xizong-official-2005-n036')?.relation_exists === false, 'explicit_rereview_does_not_manufacture_relation');
check(byId.get('xizong-official-2005-n042')?.review_mode === 'ALREADY_REVIEWED', 'new_n042_relation_is_seen_as_canonical');
check(byId.get('xizong-official-2005-n042')?.prior_relation_withheld === true, 'existing_relation_target_is_withheld_before_independent_review');
check(byId.get('xizong-official-2005-n044')?.review_mode === 'ALREADY_REVIEWED', 'new_n044_relation_is_seen_as_canonical');
check(byId.get('xizong-official-2005-n044')?.prior_relation_withheld === true, 'second_existing_relation_target_is_withheld_before_independent_review');

const serialized = JSON.stringify(defaultQueue);
for (const forbidden of ['suggested_system_id', 'suggested_block_id', 'suggested_logic_group_id', 'suggested_kp_id', 'suggested_primary_kp_id']) {
  check(!serialized.includes(forbidden), `queue_does_not_emit_${forbidden}`);
}
for (const forbiddenField of ['exam_target', 'decision_axis', 'transfer_rule', 'valuable_distractors', 'source_conflict_note']) {
  check(defaultQueue.candidates.every((row) => !Object.hasOwn(row, forbiddenField)), `queue_withholds_legacy_${forbiddenField}`);
}

const calibration = fs.readFileSync(path.join(repoRoot, 'content/xizong/question-relations/CALIBRATION.md'), 'utf8');
check(calibration.includes('Stage: C0 PASS'), 'c0_calibration_is_closed');
check(calibration.includes('schema v1 stays frozen'), 'c0_does_not_expand_schema');
check(calibration.includes('may **not** emit suggested System/Block/KP targets'), 'c1_discovery_semantics_are_explicit');
check(calibration.includes('anti-anchored default packet'), 'c1_anti_anchor_boundary_is_explicit');

console.log(`XIZONG_CROSSWALK_REVIEW_PIPELINE_OK default=${defaultQueue.candidate_count} reviewed=${defaultQueue.reviewed_relation_count}`);
