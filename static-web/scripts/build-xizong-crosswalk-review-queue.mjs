import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(webRoot, '..');

const QUESTION_ROOT = 'content/xizong/questions';
const EXPLANATION_ROOT = 'content/xizong/explanations';
const RELATION_ROOT = 'content/xizong/question-relations';

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));

function walkJson(relativeDir) {
  const absoluteDir = path.join(repoRoot, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  const out = [];
  const walk = (dir, prefix) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      const relative = path.posix.join(prefix, entry.name);
      if (entry.isDirectory()) walk(absolute, relative);
      else if (entry.isFile() && entry.name.endsWith('.json')) out.push(relative);
    }
  };
  walk(absoluteDir, relativeDir);
  return out.sort();
}

function pad3(value) {
  return String(value).padStart(3, '0');
}

export function routeForQuestionId(questionId) {
  const match = String(questionId).match(/^xizong-official-(\d{4})-n(\d{3})$/);
  if (!match) throw new Error(`XIZONG_CROSSWALK_REVIEW_INVALID_QUESTION_ID:${questionId}`);
  const year = match[1];
  const number = Number(match[2]);
  const start = Math.floor((number - 1) / 25) * 25 + 1;
  const end = start + 24;
  const shard = `shards/${year}/q${pad3(start)}-${pad3(end)}.json`;
  return { year, number, shard };
}

function loadRelationIndex() {
  const byId = new Map();
  for (const relativePath of walkJson(`${RELATION_ROOT}/shards`)) {
    const rows = readJson(relativePath);
    if (!Array.isArray(rows)) throw new Error(`XIZONG_CROSSWALK_RELATION_SHARD_NOT_ARRAY:${relativePath}`);
    for (const row of rows) {
      const questionId = String(row?.question_id || '');
      if (!questionId || row?.review_status !== 'REVIEWED') continue;
      if (byId.has(questionId)) throw new Error(`XIZONG_CROSSWALK_DUPLICATE_REVIEWED_RELATION:${questionId}`);
      byId.set(questionId, { ...row, _path: relativePath });
    }
  }
  return byId;
}

function loadExplanationIndex() {
  const byId = new Map();
  for (const relativePath of walkJson(`${EXPLANATION_ROOT}/shards`)) {
    const rows = readJson(relativePath);
    if (!Array.isArray(rows)) throw new Error(`XIZONG_CROSSWALK_EXPLANATION_SHARD_NOT_ARRAY:${relativePath}`);
    for (const row of rows) {
      const questionId = String(row?.question_id || '');
      if (!questionId) continue;
      if (byId.has(questionId)) throw new Error(`XIZONG_CROSSWALK_DUPLICATE_EXPLANATION:${questionId}`);
      byId.set(questionId, { ...row, _path: relativePath });
    }
  }
  return byId;
}

function loadQuestionTruth(questionId) {
  const route = routeForQuestionId(questionId);
  const relativePath = `${QUESTION_ROOT}/${route.shard}`;
  const shard = readJson(relativePath);
  const row = shard?.[questionId];
  if (!row || row.question_id !== questionId) throw new Error(`XIZONG_CROSSWALK_REVIEW_QUESTION_TRUTH_MISSING:${questionId}`);
  return { row, path: relativePath };
}

function compactRelation(relation) {
  if (!relation) return null;
  return {
    question_id: relation.question_id,
    system_id: relation.system_id || null,
    block_id: relation.block_id || null,
    logic_group_id: relation.logic_group_id || null,
    primary_kp_id: relation.primary_kp_id || null,
    supporting_kp_ids: Array.isArray(relation.supporting_kp_ids) ? relation.supporting_kp_ids : [],
    reviewed_bridge_target_refs: Array.isArray(relation.reviewed_bridge_target_refs) ? relation.reviewed_bridge_target_refs : [],
    review_status: relation.review_status,
    relation_path: relation._path
  };
}

function buildCandidate(questionId, relation, explicit) {
  const truth = loadQuestionTruth(questionId);
  const content = truth.row?.content || {};
  const sourceStatus = truth.row?.provenance?.annual_source?.source_refs?.source_status || null;
  const alreadyReviewed = Boolean(relation);
  return {
    question_id: questionId,
    review_mode: alreadyReviewed
      ? 'ALREADY_REVIEWED'
      : explicit
        ? 'EXPLICIT_ANTI_ANCHORED_REVIEW'
        : 'DEFAULT_ANTI_ANCHORED_REVIEW',
    relation_exists: alreadyReviewed,
    prior_relation_withheld: alreadyReviewed,
    question_truth: {
      path: truth.path,
      question_type: truth.row?.question_type || null,
      shared_option_group: truth.row?.shared_option_group || null,
      stem: String(content.stem || ''),
      options: content?.option_set?.options || {},
      correct_answer: content.correct_answer ?? null,
      source_status: sourceStatus
    },
    reviewer_instruction: alreadyReviewed
      ? 'Independently solve the Question Truth first. A canonical REVIEWED relation exists, but its target is intentionally withheld from this packet to avoid anchoring. Do not create a second row unless this is an explicit re-audit with a bounded replacement basis.'
      : 'Independently solve the Question Truth before consulting any old Explanation or mapping hint. Form a provisional exam target and decision axis, inspect the exact Current Knowledge owner, choose the smallest sufficient System/Block/LG/KP target, self-attack that target, and only then author a REVIEWED relation. Old Explanation may be checked only after the provisional mapping as conflict evidence, never as mapping authority.'
  };
}

export function buildXizongCrosswalkReviewQueue({ questionIds = [], limit = 50 } = {}) {
  const relationIndex = loadRelationIndex();
  const explanationIndex = loadExplanationIndex();
  const explicitIds = [...new Set((questionIds || []).map(String).filter(Boolean))];
  const explicit = explicitIds.length > 0;
  const sourceIds = explicit
    ? explicitIds
    : [...explanationIndex.entries()]
        .filter(([, row]) => row?.truth_gate === 'PASS')
        .filter(([, row]) => row?.explanation_status === 'APPROVED')
        .filter(([, row]) => row?.mapping_decision === 'NEEDS_CHAT_MAPPING_REVIEW')
        .map(([questionId]) => questionId)
        .filter((questionId) => !relationIndex.has(questionId));

  const ids = sourceIds.sort().slice(0, Math.max(1, Number(limit) || 50));
  const candidates = ids.map((questionId) => buildCandidate(
    questionId,
    relationIndex.get(questionId) || null,
    explicit
  ));

  return {
    schema: 'kianos.xizong.crosswalk_review_queue.v2',
    generated_at: new Date().toISOString(),
    mode: explicit ? 'EXPLICIT_ANTI_ANCHORED_QUESTION_IDS' : 'DEFAULT_ANTI_ANCHORED_REVIEW',
    semantic_authority: 'NONE_PACKET_ONLY',
    no_inference: true,
    anti_anchored: true,
    backlog_selection: explicit
      ? 'EXPLICIT_QUESTION_IDS'
      : 'APPROVED_EXPLANATION_ROUTING_HINT_ONLY_NOT_REVIEW_INPUT',
    withheld_before_provisional_judgment: [
      'old Explanation semantics',
      'old mapping_decision',
      'prior System/Block/LG/KP targets'
    ],
    review_protocol: [
      'solve Question Truth independently',
      'state provisional exam target and decision axis',
      'inspect exact Current Knowledge owner',
      'choose the smallest sufficient mapping target',
      'self-attack whether the chosen owner fully explains the question',
      'optionally conflict-check old Explanation only after provisional mapping',
      'author REVIEWED relation only when exact-owner evidence is sufficient'
    ],
    canonical_relation_owner: RELATION_ROOT,
    reviewed_relation_count: relationIndex.size,
    candidate_count: candidates.length,
    candidates
  };
}

function parseArgs(argv) {
  const questionIds = [];
  let out = '';
  let limit = 50;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--question-id') {
      questionIds.push(...String(argv[++index] || '').split(',').map((value) => value.trim()).filter(Boolean));
    } else if (arg === '--out') {
      out = String(argv[++index] || '');
    } else if (arg === '--limit') {
      limit = Number(argv[++index] || 50);
    } else {
      throw new Error(`XIZONG_CROSSWALK_REVIEW_UNKNOWN_ARG:${arg}`);
    }
  }
  return { questionIds, out, limit };
}

const entryPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (entryPath === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const packet = buildXizongCrosswalkReviewQueue({ questionIds: args.questionIds, limit: args.limit });
  const text = `${JSON.stringify(packet, null, 2)}\n`;
  if (args.out) {
    const outputPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, text);
    console.log(`XIZONG_CROSSWALK_REVIEW_QUEUE_WRITTEN:${outputPath}:candidates=${packet.candidate_count}`);
  } else {
    process.stdout.write(text);
  }
}
