export const XIZONG_SCORE_ATTRIBUTION_SCHEMA = 'kianos.xizong.score-attribution.v1';

const OFFICIAL_ID = /^xizong-official-\d{4}-n\d{3}$/;
const VALID_STATUS = new Set(['stable', 'uncertain', 'wrong']);

const text = (value) => String(value ?? '');
const finitePositive = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

function eventTime(event) {
  const raw = Date.parse(text(event?.submitted_at || event?.updatedAt || event?.updated_at));
  return Number.isFinite(raw) ? raw : Number.NEGATIVE_INFINITY;
}

function isOfficialEvent(event) {
  const id = text(event?.question_id || event?.questionId);
  const source = text(event?.question_source);
  const scoringRole = text(event?.scoring_role);
  return OFFICIAL_ID.test(id)
    && (source === 'OFFICIAL_EXAM' || source === '')
    && (scoringRole === 'OFFICIAL_EVIDENCE' || scoringRole === '');
}

function ownerFromRelation(relation) {
  if (!relation || relation.review_status !== 'REVIEWED') {
    return { kind: 'UNKNOWN', id: 'UNMAPPED', block_id: '', kp_id: '' };
  }
  const targetStatus = text(relation.target_status);
  const kpId = text(relation.primary_runtime_kp_id);
  const blockId = text(relation.block_id);
  if (targetStatus === 'RESOLVED_KP' && kpId) {
    return { kind: 'KP', id: kpId, block_id: blockId, kp_id: kpId };
  }
  if (blockId) {
    return { kind: 'BLOCK', id: blockId, block_id: blockId, kp_id: '' };
  }
  return { kind: 'UNKNOWN', id: 'UNMAPPED', block_id: '', kp_id: '' };
}

export function normalizeXizongOfficialScoreEvidence(event) {
  if (!event || event.type !== 'QUESTION_ATTEMPT' || !isOfficialEvent(event)) return null;
  const questionId = text(event.question_id || event.questionId);
  const status = text(event.status);
  if (!VALID_STATUS.has(status)) return null;
  const points = finitePositive(event.points_possible);
  if (points == null) return null;
  const relation = event.reviewed_relation && typeof event.reviewed_relation === 'object'
    ? event.reviewed_relation
    : null;
  const owner = ownerFromRelation(relation);
  return {
    question_id: questionId,
    attempt_id: text(event.attempt_id),
    attempt_index: Math.max(1, Number(event.attempt_index || 1)),
    submitted_at: text(event.submitted_at),
    year: Number(event.year || 0) || null,
    number: Number(event.number || 0) || null,
    question_type: text(event.question_type),
    context: text(event.context),
    study_phase: text(event.study_phase),
    status,
    points_possible: points,
    freshness: Number(event.attempt_index || 1) <= 1 ? 'FIRST_ATTEMPT' : 'REUSE',
    owner,
    mapping_status: owner.kind === 'UNKNOWN' ? 'UNMAPPED' : 'REVIEWED',
    supporting_runtime_kp_ids: relation
      ? [...new Set((Array.isArray(relation.supporting_runtime_kp_ids)
          ? relation.supporting_runtime_kp_ids
          : []).map(String).filter(Boolean))]
      : []
  };
}

export function latestXizongOfficialScoreEvidence(attemptHistory) {
  const latest = new Map();
  for (const raw of Array.isArray(attemptHistory) ? attemptHistory : []) {
    const row = normalizeXizongOfficialScoreEvidence(raw);
    if (!row) continue;
    const previous = latest.get(row.question_id);
    if (!previous || eventTime(raw) >= eventTime(previous.__raw)) {
      latest.set(row.question_id, { ...row, __raw: raw });
    }
  }
  return [...latest.values()]
    .map(({ __raw, ...row }) => row)
    .sort((a, b) => {
      const ay = Number(a.year || 0);
      const by = Number(b.year || 0);
      if (ay !== by) return ay - by;
      const an = Number(a.number || 0);
      const bn = Number(b.number || 0);
      if (an !== bn) return an - bn;
      return a.question_id.localeCompare(b.question_id);
    });
}

function emptyBucket(owner) {
  return {
    owner_kind: owner.kind,
    owner_id: owner.id,
    block_id: owner.block_id,
    primary_kp_id: owner.kp_id,
    question_ids: [],
    supporting_runtime_kp_ids: [],
    stable_points: 0,
    uncertain_points: 0,
    wrong_points: 0,
    first_attempt_wrong_points: 0,
    reuse_wrong_points: 0
  };
}

function round1(value) {
  return Math.round((Number(value) + Number.EPSILON) * 10) / 10;
}

export function summarizeXizongScoreAttribution(attemptHistory) {
  const rows = latestXizongOfficialScoreEvidence(attemptHistory);
  const buckets = new Map();
  let stable = 0;
  let uncertain = 0;
  let wrong = 0;
  let mapped = 0;
  let unmapped = 0;
  let firstAttemptWrong = 0;
  let reuseWrong = 0;

  for (const row of rows) {
    if (row.status === 'stable') stable += row.points_possible;
    if (row.status === 'uncertain') uncertain += row.points_possible;
    if (row.status === 'wrong') wrong += row.points_possible;
    if (row.mapping_status === 'REVIEWED') mapped += row.points_possible;
    else unmapped += row.points_possible;
    if (row.status === 'wrong' && row.freshness === 'FIRST_ATTEMPT') firstAttemptWrong += row.points_possible;
    if (row.status === 'wrong' && row.freshness === 'REUSE') reuseWrong += row.points_possible;

    const key = row.owner.kind + ':' + row.owner.id;
    if (!buckets.has(key)) buckets.set(key, emptyBucket(row.owner));
    const bucket = buckets.get(key);
    bucket.question_ids.push(row.question_id);
    bucket.supporting_runtime_kp_ids.push(...row.supporting_runtime_kp_ids);
    if (row.status === 'stable') bucket.stable_points += row.points_possible;
    if (row.status === 'uncertain') bucket.uncertain_points += row.points_possible;
    if (row.status === 'wrong') bucket.wrong_points += row.points_possible;
    if (row.status === 'wrong' && row.freshness === 'FIRST_ATTEMPT') bucket.first_attempt_wrong_points += row.points_possible;
    if (row.status === 'wrong' && row.freshness === 'REUSE') bucket.reuse_wrong_points += row.points_possible;
  }

  const targets = [...buckets.values()].map((bucket) => ({
    ...bucket,
    question_ids: [...new Set(bucket.question_ids)],
    supporting_runtime_kp_ids: [...new Set(bucket.supporting_runtime_kp_ids)],
    stable_points: round1(bucket.stable_points),
    uncertain_points: round1(bucket.uncertain_points),
    wrong_points: round1(bucket.wrong_points),
    first_attempt_wrong_points: round1(bucket.first_attempt_wrong_points),
    reuse_wrong_points: round1(bucket.reuse_wrong_points)
  })).sort((a, b) =>
    b.wrong_points - a.wrong_points
    || b.uncertain_points - a.uncertain_points
    || a.owner_id.localeCompare(b.owner_id)
  );

  return {
    schema: XIZONG_SCORE_ATTRIBUTION_SCHEMA,
    semantics: 'LATEST_OFFICIAL_ATTEMPT_PER_QUESTION;POINT_WEIGHT_IS_OBSERVED_EVIDENCE_NOT_PREDICTED_SCORE_GAIN',
    totals: {
      official_question_identities: rows.length,
      stable_points: round1(stable),
      uncertain_points: round1(uncertain),
      wrong_points: round1(wrong),
      reviewed_mapped_points: round1(mapped),
      unmapped_points: round1(unmapped),
      first_attempt_wrong_points: round1(firstAttemptWrong),
      reuse_wrong_points: round1(reuseWrong)
    },
    targets,
    rows
  };
}
