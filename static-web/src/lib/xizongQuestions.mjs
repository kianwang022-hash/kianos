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
const EXAM_FORMAT_PATH = 'content/xizong/questions/exam-format.json';
let examFormatOwnerCache = null;
let examFormatSourceHashCache = null;
const examFormatYearCache = new Map();

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
  const reasoningChain = Array.isArray(row.reasoning_chain)
    ? row.reasoning_chain.map((item) => String(item || '').trim()).filter(Boolean)
    : [];
  return {
    examTarget: String(row.exam_target || ''),
    decisionAxis: String(row.decision_axis || ''),
    reasoningChain,
    correctOptionReason: String(row.correct_option_reason || ''),
    commonFailureNode: String(row.common_failure_node || ''),
    transferRule: String(row.transfer_rule || ''),
    valuableDistractors
  };
}

function loadCachedShard(root, shard, cache, fallback) {
  const key = `${root}/${shard}`;
  if (cache.has(key)) return cache.get(key);
  if (!fs.existsSync(absolute(key))) {
    cache.set(key, fallback);
    return fallback;
  }
  const value = readJson(key);
  cache.set(key, value);
  return value;
}

function questionPointsForYearNumber(year, number) {
  const format = loadXizongExamFormatForYear(year);
  const n = Number(number);
  const segment = (format.scoringSegments || []).find((row) =>
    n >= Number(row?.start) && n <= Number(row?.end)
  );
  const points = Number(segment?.points || 0);
  return Number.isFinite(points) && points > 0 ? points : 0;
}

function loadQuestionProjection(questionId, questionCache = new Map(), explanationCache = new Map()) {
  const route = routeForQuestionId(questionId);
  const truthShard = loadCachedShard(QUESTION_ROOT, route.shard, questionCache, {});
  const truth = truthShard?.[questionId];
  if (!truth || truth.question_id !== questionId) {
    throw new Error(`CURRENT_XIZONG_QUESTION_ORPHAN:${questionId}`);
  }

  const explanationShard = loadCachedShard(EXPLANATION_ROOT, route.shard, explanationCache, []);
  const explanationRow = Array.isArray(explanationShard)
    ? explanationShard.find((row) => row?.question_id === questionId)
    : null;

  const optionObject = truth?.content?.option_set?.options || {};
  const options = Object.entries(optionObject).map(([label, text]) => ({
    label: String(label),
    text: String(text)
  }));
  if (!options.length) throw new Error(`CURRENT_XIZONG_QUESTION_OPTIONS_MISSING:${questionId}`);

  const year = Number(truth?.source_identity?.official_exam_year || route.year);
  const number = Number(truth?.source_identity?.official_exam_number || route.number);
  return {
    questionId,
    year,
    number,
    points: questionPointsForYearNumber(year, number),
    questionType: String(truth?.question_type || ''),
    stem: String(truth?.content?.stem || ''),
    options,
    correctAnswer: String(truth?.content?.correct_answer || ''),
    explanation: normalizeExplanation(explanationRow),
    relation: loadReviewedXizongQuestionRelation(questionId)
  };
}

export function listXizongQuestionYears() {
  const manifest = readJson(`${QUESTION_ROOT}/manifest.json`);
  const years = new Set();
  for (const shard of manifest?.canonical_storage?.shards || []) {
    const match = String(shard?.path || '').match(/^shards\/(\d{4})\//);
    if (match) years.add(match[1]);
  }
  return [...years].sort();
}

export function loadXizongQuestionYear(year) {
  const normalizedYear = String(year || '');
  if (!/^\d{4}$/.test(normalizedYear)) {
    throw new Error(`CURRENT_XIZONG_QUESTION_YEAR_INVALID:${normalizedYear}`);
  }
  const manifest = readJson(`${QUESTION_ROOT}/manifest.json`);
  const shardRows = (manifest?.canonical_storage?.shards || [])
    .filter((row) => String(row?.path || '').startsWith(`shards/${normalizedYear}/`));
  if (!shardRows.length) throw new Error(`CURRENT_XIZONG_QUESTION_YEAR_MISSING:${normalizedYear}`);

  const questionCache = new Map();
  const explanationCache = new Map();
  const ids = [];
  for (const row of shardRows) {
    const shard = loadCachedShard(QUESTION_ROOT, row.path, questionCache, {});
    ids.push(...Object.keys(shard || {}));
  }
  ids.sort((a, b) => routeForQuestionId(a).number - routeForQuestionId(b).number);
  return ids.map((questionId) => loadQuestionProjection(questionId, questionCache, explanationCache));
}

export function loadXizongQuestionsByIds(questionIds) {
  const ids = Array.isArray(questionIds) ? questionIds.map(String) : [];
  const seen = new Set();
  if (!ids.length) throw new Error('CURRENT_XIZONG_CHAT_SET_EMPTY');
  if (ids.some((id) => !/^xizong-official-\d{4}-n\d{3}$/.test(id))) {
    throw new Error('CURRENT_XIZONG_CHAT_SET_ID_INVALID');
  }
  if (ids.some((id) => seen.has(id) || !seen.add(id))) {
    throw new Error('CURRENT_XIZONG_CHAT_SET_DUPLICATE_ID');
  }
  const questionCache = new Map();
  const explanationCache = new Map();
  return ids.map((questionId) => loadQuestionProjection(questionId, questionCache, explanationCache));
}

function loadXizongExamFormatOwner() {
  if (examFormatOwnerCache) return examFormatOwnerCache;
  const raw = readText(EXAM_FORMAT_PATH);
  const owner = JSON.parse(raw);
  if (owner?.schema !== 'kianos.xizong.exam_format.v1' || owner?.status !== 'CURRENT') {
    throw new Error('CURRENT_XIZONG_EXAM_FORMAT_INVALID');
  }
  examFormatOwnerCache = owner;
  examFormatSourceHashCache = sha256(raw);
  return examFormatOwnerCache;
}

export function loadXizongExamFormatForYear(year) {
  const normalizedYear = Number(year);
  if (!Number.isInteger(normalizedYear)) throw new Error(`CURRENT_XIZONG_EXAM_FORMAT_YEAR_INVALID:${year}`);
  if (examFormatYearCache.has(normalizedYear)) return examFormatYearCache.get(normalizedYear);
  const owner = loadXizongExamFormatOwner();
  const row = (owner.eras || []).find((item) => normalizedYear >= Number(item?.start_year) && normalizedYear <= Number(item?.end_year));
  if (!row) throw new Error(`CURRENT_XIZONG_EXAM_FORMAT_YEAR_MISSING:${normalizedYear}`);
  const value = {
    schema: owner.schema,
    authority: owner.authority,
    year: normalizedYear,
    eraId: String(row.era_id || ''),
    questionCount: Number(row.question_count || 0),
    maxScore: Number(row.max_score || 0),
    scoringSegments: (row.scoring_segments || []).map((segment) => ({
      start: Number(segment.start),
      end: Number(segment.end),
      points: Number(segment.points)
    })),
    sourcePath: EXAM_FORMAT_PATH,
    sourceHash: examFormatSourceHashCache
  };
  examFormatYearCache.set(normalizedYear, value);
  return value;
}

export function listXizongPaperSummaries() {
  const manifest = readJson(`${QUESTION_ROOT}/manifest.json`);
  const counts = new Map();
  for (const row of manifest?.canonical_storage?.shards || []) {
    const match = String(row?.path || '').match(/^shards\/(\d{4})\//);
    if (!match) continue;
    counts.set(match[1], Number(counts.get(match[1]) || 0) + Number(row?.record_count || 0));
  }
  return [...counts.entries()]
    .map(([year, questionCount]) => {
      const format = loadXizongExamFormatForYear(year);
      if (format.questionCount !== questionCount) {
        throw new Error(`CURRENT_XIZONG_PAPER_FORMAT_COUNT_MISMATCH:${year}:${questionCount}/${format.questionCount}`);
      }
      return {
        year: Number(year),
        questionCount,
        maxScore: format.maxScore,
        eraId: format.eraId
      };
    })
    .sort((a, b) => b.year - a.year);
}

export function loadXizongWholePaper(year) {
  const normalizedYear = Number(year);
  const questions = loadXizongQuestionYear(normalizedYear);
  const format = loadXizongExamFormatForYear(normalizedYear);
  if (questions.length !== format.questionCount) {
    throw new Error(`CURRENT_XIZONG_PAPER_QUESTION_COUNT_MISMATCH:${normalizedYear}:${questions.length}/${format.questionCount}`);
  }
  const ids = questions.map((question) => question.questionId);
  return {
    systemId: `paper-${normalizedYear}`,
    canonicalId: String(normalizedYear),
    title: `${normalizedYear} 整卷`,
    questionCount: questions.length,
    scopePath: EXAM_FORMAT_PATH,
    scopeHash: format.sourceHash,
    questionInventoryHash: inventoryHash(ids),
    questions,
    years: [normalizedYear],
    holdoutRequired: false,
    resultVisibility: 'hidden',
    paperFormat: {
      year: normalizedYear,
      era_id: format.eraId,
      question_count: format.questionCount,
      max_score: format.maxScore,
      scoring_segments: format.scoringSegments
    }
  };
}

export function buildXizongForecastQuestionScope(systems = []) {
  const rows = [];
  const union = new Set();
  const unionYearCounts = {};
  let summedExactQuestions = 0;

  for (const system of Array.isArray(systems) ? systems : []) {
    const systemId = String(system?.systemId || '');
    const canonicalId = String(system?.canonicalId || '');
    if (!systemId || !canonicalId) continue;

    const sweep = loadXizongSystemQuestionSweep(system);
    if (!sweep) {
      rows.push({
        system_id: systemId,
        canonical_id: canonicalId,
        status: 'UNKNOWN',
        question_count: null,
        year_counts: {},
        reason: 'EXACT_OFFICIAL_QUESTION_SCOPE_UNAVAILABLE'
      });
      continue;
    }

    const yearCounts = {};
    for (const question of sweep.questions || []) {
      const questionId = String(question?.questionId || '');
      const year = Number(question?.year);
      if (!questionId) continue;
      summedExactQuestions += 1;
      if (Number.isInteger(year)) yearCounts[year] = (yearCounts[year] || 0) + 1;
      if (!union.has(questionId)) {
        union.add(questionId);
        if (Number.isInteger(year)) unionYearCounts[year] = (unionYearCounts[year] || 0) + 1;
      }
    }

    rows.push({
      system_id: systemId,
      canonical_id: canonicalId,
      status: 'EXACT',
      question_count: sweep.questionCount,
      year_counts: yearCounts,
      scope_hash: sweep.scopeHash,
      question_inventory_hash: sweep.questionInventoryHash
    });
  }

  const unknownSystems = rows
    .filter((row) => row.status !== 'EXACT')
    .map((row) => row.canonical_id || row.system_id);

  return {
    schema: 'kianos.xizong.forecast-question-scope.v1',
    authority: 'DERIVED_FROM_CURRENT_EXACT_SYSTEM_QUESTION_SCOPES',
    systems: rows,
    exact_union_questions: union.size,
    summed_exact_system_questions: summedExactQuestions,
    cross_system_duplicate_memberships: Math.max(0, summedExactQuestions - union.size),
    union_year_counts: unionYearCounts,
    unknown_systems: unknownSystems,
    scope_complete: unknownSystems.length === 0,
    evidence_boundary:
      'Exact System question scopes are factual workload inventory only. UNKNOWN systems remain unknown rather than zero; Holdout subtraction happens against the union at learner-runtime time.'
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
  const questions = ids.map((questionId) => loadQuestionProjection(questionId, questionCache, explanationCache));

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
