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
check(defaultQueue.candidate_count > 0, 'default_queue_has_review_candidates', String(defaultQueue.candidate_count));
check(defaultQueue.candidates.every((row) => row.mapping_decision === 'NEEDS_CHAT_MAPPING_REVIEW'), 'default_queue_only_uses_needs_review_routing_hint');
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
check(byId.get('xizong-official-2005-n036')?.review_mode === 'EXPLICIT_REREVIEW', 'explicit_no_safe_rereview_is_allowed_without_mapping');
check(byId.get('xizong-official-2005-n036')?.relation_exists === false, 'explicit_rereview_does_not_manufacture_relation');
check(byId.get('xizong-official-2005-n042')?.review_mode === 'ALREADY_REVIEWED', 'new_n042_relation_is_seen_as_canonical');
check(byId.get('xizong-official-2005-n044')?.review_mode === 'ALREADY_REVIEWED', 'new_n044_relation_is_seen_as_canonical');

const serialized = JSON.stringify(defaultQueue);
for (const forbidden of ['suggested_system_id', 'suggested_block_id', 'suggested_logic_group_id', 'suggested_kp_id', 'suggested_primary_kp_id']) {
  check(!serialized.includes(forbidden), `queue_does_not_emit_${forbidden}`);
}

const calibration = fs.readFileSync(path.join(repoRoot, 'content/xizong/question-relations/CALIBRATION.md'), 'utf8');
check(calibration.includes('Stage: C0 PASS'), 'c0_calibration_is_closed');
check(calibration.includes('schema v1 stays frozen'), 'c0_does_not_expand_schema');
check(calibration.includes('no suggested System/Block/KP target'), 'c1_discovery_semantics_are_explicit');

console.log(`XIZONG_CROSSWALK_REVIEW_PIPELINE_OK default=${defaultQueue.candidate_count} reviewed=${defaultQueue.reviewed_relation_count}`);
