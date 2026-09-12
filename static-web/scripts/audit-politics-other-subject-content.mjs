import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEARNING_ROOT = path.join(repoRoot, 'content/politics/learning');
const REGIONS = path.join(repoRoot, 'content/politics/source/politics_unified_regions.v1.jsonl');
const NODE_SHARDS = path.join(repoRoot, 'content/politics/source/nodes/shards');

const SUBJECTS = [
  {
    key: 'mao',
    sourceSubject: 'MAO',
    dir: 'mao',
    expectedChapters: 9,
    teachingShape: 'HISTORICAL_PROBLEM_TO_THEORY_RESPONSE_WITH_POSITIONING_BOUNDARIES',
    mapSignals: ['master_chain', 'whole_subject_recall'],
    unitQuestionKeys: ['stage_question', 'role_question', 'concept_question', 'core_problem', 'question'],
    requiredUnitSupport: 1
  },
  {
    key: 'xi',
    sourceSubject: 'XI',
    dir: 'xi',
    expectedChapters: 18,
    teachingShape: 'HIERARCHY_ROLE_GOAL_PRINCIPLE_PATH_WITH_CONFUSABLE_FORMULATION_BOUNDARIES',
    mapSignals: ['master_architecture', 'whole_subject_recall'],
    unitQuestionKeys: ['role_question', 'stage_question', 'concept_question', 'core_problem', 'question'],
    requiredUnitSupport: 1
  },
  {
    key: 'ethics_law',
    sourceSubject: 'ETHICS',
    dir: 'ethics-law',
    expectedChapters: 7,
    teachingShape: 'CONCEPT_BOUNDARY_NORMATIVE_JUDGMENT_IDENTITY_AND_SITUATIONAL_APPLICATION',
    mapSignals: ['subject_story', 'subject_boundaries'],
    unitQuestionKeys: ['concept_question', 'stage_question', 'role_question', 'core_problem', 'question'],
    requiredUnitSupport: 2
  }
];

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(JSON.parse);
}
function asList(value) { return Array.isArray(value) ? value.filter(Boolean) : (value ? [value] : []); }
function uniq(values) { return [...new Set(values.filter(Boolean))]; }
function text(value) { return String(value || '').trim(); }
function firstText(object, keys) {
  for (const key of keys) if (text(object?.[key])) return text(object[key]);
  return '';
}
function representedIds(unit) {
  return uniq([text(unit?.natural_unit_id), ...asList(unit?.embedded_natural_unit_ids).map(text)]);
}
function supportSignalCount(unit) {
  const scalar = [
    unit?.key_relation,
    unit?.relation,
    unit?.boundary,
    unit?.application,
    unit?.next,
    unit?.position,
    unit?.historical_role,
    unit?.historical_problem,
    unit?.theory_response,
    unit?.identity,
    unit?.judgment_rule
  ];
  const list = [
    ...asList(unit?.boundaries),
    ...asList(unit?.major_boundaries),
    ...asList(unit?.principles),
    ...asList(unit?.relations),
    ...asList(unit?.applications),
    ...asList(unit?.contrasts)
  ];
  const objectSignals = [unit?.hierarchy].filter((value) => value && typeof value === 'object' && Object.keys(value).length);
  return [...scalar, ...list, ...objectSignals].filter(Boolean).length;
}
function chapterProblem(orientation = {}) {
  return firstText(orientation, ['real_problem', 'core_problem', 'core_question', 'problem']);
}
function chapterAnswer(orientation = {}) {
  return firstText(orientation, ['core_answer', 'learner_thesis', 'answer']);
}
function compressionSignal(compression = {}) {
  return firstText(compression, ['reconstruction', 'causal_chain', 'historical_direction', 'stage_shift'])
    || asList(compression?.reconstruction_chain).join(' → ')
    || asList(compression?.timeline).join(' → ');
}

const regionRows = readJsonl(REGIONS).filter((row) => row?.status === 'canonical');
const shardCache = new Map();

function shardPathForNode(nodeId) {
  const id = text(nodeId);
  const cf = id.match(/^POL27-CF-(MAO|XI|ETHICS)-C(\d{2})/);
  if (cf) return path.join(NODE_SHARDS, 'pol27-cf', cf[1].toLowerCase(), `c${cf[2]}.json`);
  return '';
}
function nodeExists(nodeId) {
  const file = shardPathForNode(nodeId);
  if (!file || !fs.existsSync(file)) return false;
  if (!shardCache.has(file)) shardCache.set(file, readJson(file));
  return Boolean(shardCache.get(file)?.[nodeId]);
}

const reports = [];
const blockers = [];
const reviews = [];

for (const config of SUBJECTS) {
  const subjectDir = path.join(LEARNING_ROOT, config.dir);
  const subjectMapPath = path.join(subjectDir, 'subject-map.json');
  const subjectBlockers = [];
  const subjectReviews = [];
  const canonicalRegions = regionRows.filter((row) => row?.subject === config.sourceSubject);
  const regionByUnit = new Map(canonicalRegions.map((row) => [text(row.natural_unit_id), row]));
  const represented = new Set();

  if (!fs.existsSync(subjectMapPath)) {
    subjectBlockers.push({ code: 'MISSING_SUBJECT_MAP' });
  } else {
    const map = readJson(subjectMapPath);
    if (text(map?.teaching_shape) !== config.teachingShape) {
      subjectBlockers.push({ code: 'SUBJECT_MAP_TEACHING_SHAPE_MISMATCH', got: map?.teaching_shape || '' });
    }
    for (const key of config.mapSignals) {
      const value = map?.[key];
      if (!(text(value) || asList(value).length)) subjectBlockers.push({ code: `SUBJECT_MAP_MISSING_${key.toUpperCase()}` });
    }
  }

  const chapterFiles = fs.readdirSync(subjectDir).filter((name) => /^ch\d+\.json$/i.test(name)).sort();
  if (chapterFiles.length !== config.expectedChapters) {
    subjectBlockers.push({ code: 'CHAPTER_COUNT_MISMATCH', expected: config.expectedChapters, got: chapterFiles.length });
  }

  const chapterReports = [];
  for (const name of chapterFiles) {
    const raw = readJson(path.join(subjectDir, name));
    const chapter = path.basename(name, '.json').toLowerCase();
    const localBlockers = [];
    const localReviews = [];
    const declared = uniq(asList(raw?.source_bindings?.natural_unit_ids).map(text));
    const units = asList(raw?.units);
    const projected = uniq(units.flatMap(representedIds));

    if (text(raw?.teaching_shape) !== config.teachingShape) localBlockers.push('TEACHING_SHAPE_MISMATCH');
    if (!chapterProblem(raw?.chapter_orientation)) localBlockers.push('MISSING_CHAPTER_CORE_PROBLEM');
    if (!chapterAnswer(raw?.chapter_orientation)) localBlockers.push('MISSING_CHAPTER_CORE_ANSWER');
    if (!text(raw?.chapter_orientation?.attention_rule)) localReviews.push('MISSING_ATTENTION_RULE');
    if (!compressionSignal(raw?.chapter_compression)) localBlockers.push('MISSING_CHAPTER_COMPRESSION');
    if (!text(raw?.chapter_compression?.review_prompt)) localBlockers.push('MISSING_CHAPTER_REVIEW_PROMPT');

    if (declared.length !== projected.length || declared.some((id) => !projected.includes(id)) || projected.some((id) => !declared.includes(id))) {
      localBlockers.push('UNIT_DECLARATION_PROJECTION_MISMATCH');
    }

    for (const unit of units) {
      const unitId = text(unit?.natural_unit_id);
      const ids = representedIds(unit);
      ids.forEach((id) => represented.add(id));
      const unitBlockers = [];
      const unitReviews = [];
      if (!unitId) unitBlockers.push('MISSING_UNIT_ID');
      if (!text(unit?.title)) unitBlockers.push('MISSING_UNIT_TITLE');
      if (!firstText(unit, config.unitQuestionKeys)) unitBlockers.push('MISSING_UNIT_LEARNING_QUESTION');
      if (!firstText(unit, ['answer', 'core_answer', 'theory_response'])) unitBlockers.push('MISSING_UNIT_CORE_ANSWER');
      const supports = supportSignalCount(unit);
      if (supports < config.requiredUnitSupport) unitReviews.push(`THIN_UNIT_SUPPORT:${supports}`);

      for (const id of ids) {
        const region = regionByUnit.get(id);
        if (!region) {
          unitBlockers.push(`MISSING_CANONICAL_REGION:${id}`);
          continue;
        }
        const sourceRefs = uniq(asList(region?.chengfeng_refs).map(text));
        if (!sourceRefs.length) unitBlockers.push(`NO_CHENGFENG_SOURCE_REFS:${id}`);
        const missingRefs = sourceRefs.filter((ref) => !nodeExists(ref));
        if (missingRefs.length) unitBlockers.push(`UNRESOLVED_CHENGFENG:${missingRefs.join(',')}`);
      }

      for (const code of uniq(unitBlockers)) subjectBlockers.push({ chapter, unit_id: unitId, code });
      for (const code of uniq(unitReviews)) subjectReviews.push({ chapter, unit_id: unitId, code });
    }

    for (const code of uniq(localBlockers)) subjectBlockers.push({ chapter, code });
    for (const code of uniq(localReviews)) subjectReviews.push({ chapter, code });
    chapterReports.push({ chapter, learner_units: units.length, declared_units: declared.length, blocker_count: localBlockers.length, review_count: localReviews.length });
  }

  const orphanCanonical = canonicalRegions.map((row) => text(row.natural_unit_id)).filter((id) => id && !represented.has(id));
  for (const id of orphanCanonical) subjectBlockers.push({ chapter: id.match(/-C(\d{2})/)?.[1] ? `ch${id.match(/-C(\d{2})/)[1]}` : 'unknown', unit_id: id, code: 'CANONICAL_REGION_NOT_REPRESENTED' });

  blockers.push(...subjectBlockers.map((row) => ({ subject: config.key, ...row })));
  reviews.push(...subjectReviews.map((row) => ({ subject: config.key, ...row })));
  reports.push({
    subject: config.key,
    chapter_count: chapterFiles.length,
    canonical_region_count: canonicalRegions.length,
    represented_natural_unit_count: represented.size,
    blocker_count: subjectBlockers.length,
    review_count: subjectReviews.length,
    chapters: chapterReports
  });
}

const result = {
  status: blockers.length ? 'BLOCKED' : reviews.length ? 'PASS_WITH_REVIEW_QUEUE' : 'PASS',
  scope: 'POLITICS_OTHER_SUBJECT_CONTENT_CLOSURE',
  subjects: reports,
  blocker_count: blockers.length,
  review_count: reviews.length,
  blockers,
  review_queue: reviews
};

console.log('POLITICS_OTHER_SUBJECT_CONTENT_AUDIT');
console.log(JSON.stringify(result, null, 2));
if (blockers.length) process.exit(2);
