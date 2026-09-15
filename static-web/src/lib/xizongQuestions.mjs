import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { loadReviewedXizongQuestionRelation } from './xizongQuestionCrosswalk.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEARNER_ROOT = 'content/xizong/knowledge/learner';
const QUESTION_ROOT = 'content/xizong/questions';
const EXPLANATION_ROOT = 'content/xizong/explanations';

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

function expandNumberSpec(spec) {
  const values = [];
  for (const rawToken of String(spec || '').split(',')) {
    const token = rawToken.trim();
    if (!token) continue;
    const range = token.match(/^(\d+)-(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
        throw new Error(`CURRENT_XIZONG_QUESTION_SCOPE_RANGE_INVALID:${token}`);
      }
      for (let value = start; value <= end; value += 1) values.push(value);
      continue;
    }
    if (!/^\d+$/.test(token)) throw new Error(`CURRENT_XIZONG_QUESTION_SCOPE_TOKEN_INVALID:${token}`);
    values.push(Number(token));
  }
  return values;
}

function expandScopeIds(scope) {
  const specs = scope?.id_expansion?.question_number_spec_by_year;
  if (!specs || typeof specs !== 'object') throw new Error('CURRENT_XIZONG_QUESTION_SCOPE_SPEC_MISSING');
  const ids = [];
  for (const year of Object.keys(specs).sort()) {
    if (!/^\d{4}$/.test(year)) throw new Error(`CURRENT_XIZONG_QUESTION_SCOPE_YEAR_INVALID:${year}`);
    for (const number of expandNumberSpec(specs[year])) {
      ids.push(`xizong-official-${year}-n${pad3(number)}`);
    }
  }
  return ids;
}

function inventoryHash(ids) {
  return sha256(`${[...ids].sort().join('\n')}\n`);
}

function scopePath(system) {
  return `${LEARNER_ROOT}/${String(system.canonicalId || '').toLowerCase()}-${system.systemId}-question-scope.json`;
}

function normalizeExplanation(row) {
  if (!row) return null;
  const valuableDistractors = Array.isArray(row.valuable_distractors)
    ? row.valuable_distractors.map((item) => ({
        option: String(item?.option || ''),
        reason: String(item?.reason || '')
      })).filter((item) => item.option && item.reason)
    : [];
  return {
    examTarget: String(row.exam_target || ''),
    decisionAxis: String(row.decision_axis || ''),
    correctOptionReason: String(row.correct_option_reason || ''),
    commonFailureNode: String(row.common_failure_node || ''),
    transferRule: String(row.transfer_rule || ''),
    valuableDistractors
  };
}

export function loadXizongSystemQuestionSweep(system) {
  const relativeScopePath = scopePath(system);
  if (!fs.existsSync(absolute(relativeScopePath))) return null;

  const scopeText = readText(relativeScopePath);
  const scope = JSON.parse(scopeText);
  if (scope?.status !== 'CURRENT' || !String(scope?.authority || '').startsWith('CHAT_APPROVED')) {
    throw new Error(`CURRENT_XIZONG_QUESTION_SCOPE_INVALID:${system.systemId}`);
  }
  if (scope?.system?.system_id !== system.systemId || scope?.system?.canonical_id !== system.canonicalId) {
    throw new Error(`CURRENT_XIZONG_QUESTION_SCOPE_IDENTITY_MISMATCH:${system.systemId}`);
  }

  const ids = expandScopeIds(scope);
  const unique = new Set(ids);
  if (ids.length !== Number(scope.question_count) || unique.size !== ids.length) {
    throw new Error(`CURRENT_XIZONG_QUESTION_SCOPE_COUNT_MISMATCH:${system.systemId}:${ids.length}/${unique.size}/${scope.question_count}`);
  }
  const actualInventoryHash = inventoryHash(ids);
  if (actualInventoryHash !== scope.question_id_inventory_sha256) {
    throw new Error(`CURRENT_XIZONG_QUESTION_SCOPE_HASH_MISMATCH:${system.systemId}`);
  }

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
      relation: loadReviewedXizongQuestionRelation(questionId)
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
