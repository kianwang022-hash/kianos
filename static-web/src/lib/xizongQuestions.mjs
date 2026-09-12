import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { loadAcceptedSystemScopeOwner } from './xizongScopeAuthority.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const QUESTION_ROOT = 'content/xizong/questions';
const EXPLANATION_ROOT = 'content/xizong/explanations';
const RELATION_ROOT = 'content/xizong/question-relations';

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function pad3(value) {
  return String(value).padStart(3, '0');
}

function routeForQuestionId(questionId) {
  const match = String(questionId).match(/^xizong-official-(\d{4})-n(\d{3})$/);
  if (!match) throw new Error(`CURRENT_XIZONG_QUESTION_ID_INVALID:${questionId}`);
  const year = match[1];
  const number = Number(match[2]);
  const start = Math.floor((number - 1) / 25) * 25 + 1;
  const end = start + 24;
  return { year, number, shard: `shards/${year}/q${pad3(start)}-${pad3(end)}.json` };
}

function normalizeExplanation(row) {
  if (!row) return null;
  return {
    examTarget: String(row.exam_target || ''),
    decisionAxis: String(row.decision_axis || ''),
    correctOptionReason: String(row.correct_option_reason || ''),
    commonFailureNode: String(row.common_failure_node || ''),
    transferRule: String(row.transfer_rule || '')
  };
}

function normalizeRelation(row) {
  if (!row || row.review_status !== 'REVIEWED') return null;
  return {
    systemId: String(row.system_id || ''),
    blockId: String(row.block_id || ''),
    primaryKpId: String(row.primary_kp_id || ''),
    supportingKpIds: Array.isArray(row.supporting_kp_ids) ? row.supporting_kp_ids.map(String) : []
  };
}

export function loadXizongSystemQuestionSweep(system) {
  const accepted = loadAcceptedSystemScopeOwner(system, { repoRoot });
  if (!accepted) return null;

  const {
    scopeText,
    scope,
    scopePath: relativeScopePath,
    ids,
    inventoryHash: actualInventoryHash
  } = accepted;

  const questionManifest = readJson(`${QUESTION_ROOT}/manifest.json`);
  if (Number(questionManifest?.stable_identity?.question_count || 0) !== 3750 || questionManifest?.stable_identity?.immutable_question_ids !== true) {
    throw new Error('CURRENT_XIZONG_QUESTION_TRUTH_IDENTITY_INVALID');
  }
  const expectedTruthInventoryHash = scope?.recovery?.current_question_truth_identity_check?.current_question_id_inventory_sha256;
  if (expectedTruthInventoryHash && questionManifest?.stable_identity?.inventory_sha256 !== expectedTruthInventoryHash) {
    throw new Error('CURRENT_XIZONG_QUESTION_TRUTH_INVENTORY_CHANGED');
  }

  const questionCache = new Map();
  const explanationCache = new Map();
  const relationCache = new Map();

  const loadShard = (root, shard, cache, fallback) => {
    const key = `${root}/${shard}`;
    if (cache.has(key)) return cache.get(key);
    if (!fs.existsSync(absolute(key))) {
      cache.set(key, fallback);
      return fallback;
    }
    const value = readJson(key);
    cache.set(key, value);
    return value;
  };

  const questions = ids.map((questionId) => {
    const route = routeForQuestionId(questionId);
    const truthShard = loadShard(QUESTION_ROOT, route.shard, questionCache, {});
    const truth = truthShard?.[questionId];
    if (!truth || truth.question_id !== questionId) throw new Error(`CURRENT_XIZONG_QUESTION_SCOPE_ORPHAN:${questionId}`);

    const explanationShard = loadShard(EXPLANATION_ROOT, route.shard, explanationCache, []);
    const explanationRow = Array.isArray(explanationShard)
      ? explanationShard.find((row) => row?.question_id === questionId)
      : null;

    const relationShard = loadShard(RELATION_ROOT, route.shard, relationCache, []);
    const relationRow = Array.isArray(relationShard)
      ? relationShard.find((row) => row?.question_id === questionId && row?.review_status === 'REVIEWED')
      : null;

    const optionObject = truth?.content?.option_set?.options || {};
    const options = Object.entries(optionObject).map(([label, text]) => ({ label: String(label), text: String(text) }));
    if (!options.length) throw new Error(`CURRENT_XIZONG_QUESTION_OPTIONS_MISSING:${questionId}`);

    return {
      questionId,
      year: Number(truth?.source_identity?.official_exam_year || route.year),
      number: Number(truth?.source_identity?.official_exam_number || route.number),
      questionType: String(truth?.question_type || ''),
      stem: String(truth?.content?.stem || ''),
      options,
      correctAnswer: String(truth?.content?.correct_answer || ''),
      explanation: normalizeExplanation(explanationRow),
      relation: normalizeRelation(relationRow)
    };
  });

  return {
    systemId: system.systemId,
    canonicalId: system.canonicalId,
    title: scope?.system?.title || system.title,
    questionCount: ids.length,
    scopePath: relativeScopePath,
    scopeHash: sha256(scopeText),
    questionInventoryHash: actualInventoryHash,
    questions,
    years: Object.keys(scope?.year_counts || {}).map(Number).sort((a, b) => a - b),
    holdoutRequired: true
  };
}
