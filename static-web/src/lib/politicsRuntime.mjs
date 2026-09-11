import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const ROOT = 'content/politics';
const LEARNING = `${ROOT}/learning`;
const MANIFEST = `${LEARNING}/manifest.json`;
const REGIONS = `${ROOT}/source/politics_unified_regions.v1.jsonl`;
const NODES = `${ROOT}/source/source_node_registry.v2.jsonl`;
const QUESTIONS = `${ROOT}/source/xiao_2027_questions.jsonl`;

const SUBJECTS = Object.freeze({
  marxism: { label: '马原', shape: '关系与推演', description: '先看关系链，再看概念边界。' },
  history: { label: '史纲', shape: '阶段与转折', description: '把事件放回历史电影里。' },
  mao: { label: '毛中特', shape: '问题与理论回应', description: '先知道当时解决什么中国问题。' },
  xi: { label: '新思想', shape: '层级与身份', description: '先分方向、目标、保证、动力、原则与路径。' },
  ethics_law: { label: '思修法基', shape: '边界与情境', description: '分清概念和规范，再做具体判断。' }
});

const QUESTION_SUBJECT_SLUG = Object.freeze({
  MARX: 'marx',
  HISTORY: 'history',
  MAO: 'mao',
  XI: 'xi',
  ETHICS: 'ethics'
});

function absolute(relativePath) { return path.join(repoRoot, relativePath); }
function exists(relativePath) { return fs.existsSync(absolute(relativePath)); }
function readText(relativePath) { return fs.readFileSync(absolute(relativePath), 'utf8'); }
function readJson(relativePath) { return JSON.parse(readText(relativePath)); }
function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function asList(value) { return Array.isArray(value) ? value.map(String).filter(Boolean) : (value ? [String(value)] : []); }
function compactSpace(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }

function parseJsonl(relativePath) {
  if (!exists(relativePath)) return [];
  return readText(relativePath)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try { return JSON.parse(line); }
      catch { throw new Error(`CURRENT_POLITICS_JSONL_INVALID:${relativePath}:${index + 1}`); }
    });
}

let manifestCache;
function learningManifest() {
  if (manifestCache) return manifestCache;
  const manifest = readJson(MANIFEST);
  if (manifest?.status !== 'CURRENT_ACTIVE') throw new Error(`CURRENT_POLITICS_MANIFEST_INVALID:${manifest?.status || 'unknown'}`);
  manifestCache = manifest;
  return manifest;
}

function subjectRoot(subject, manifestRow = null) {
  const declared = String(manifestRow?.path || '').replace(/\/$/, '');
  return declared || `${LEARNING}/${subject}`;
}

function chapterFiles(subject, manifestRow = null) {
  const root = subjectRoot(subject, manifestRow);
  if (!exists(root)) return [];
  return fs.readdirSync(absolute(root))
    .filter((name) => /^ch\d+\.json$/i.test(name))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    .map((name) => `${root}/${name}`);
}

function chapterCode(filePath) { return path.basename(filePath, '.json').toLowerCase(); }
function chapterTitle(raw, fallback) { return String(raw?.teaching_title || raw?.title || fallback); }
function unitList(raw) { return Array.isArray(raw?.unit_projections) ? raw.unit_projections : (Array.isArray(raw?.units) ? raw.units : []); }

function orientationView(raw) {
  const o = raw?.chapter_orientation || {};
  const chain = o.reasoning_chain || o.stage_story || o.learning_order || o.chapter_path || o.sequence || [];
  return {
    context: String(o.from_previous || o.starting_point || o.role_in_subject || ''),
    question: String(o.core_problem || o.real_problem || o.question || o.role_question || ''),
    answer: String(o.core_answer || o.learner_thesis || o.answer || ''),
    chain: asList(chain),
    attention: String(o.attention_rule || '')
  };
}

function compressionView(raw) {
  const c = raw?.chapter_compression || {};
  const rawChain = c.reconstruction_chain || c.timeline || c.reconstruction || c.stage_shift || c.historical_direction || [];
  return {
    chain: asList(rawChain),
    boundaries: asList(c.major_boundaries || c.boundaries || []),
    prompt: String(c.review_prompt || '')
  };
}

let regionsCache;
function regionIndex() {
  if (regionsCache) return regionsCache;
  const rows = parseJsonl(REGIONS);
  const byUnit = new Map();
  for (const row of rows) if (row?.natural_unit_id) byUnit.set(String(row.natural_unit_id), row);
  regionsCache = { rows, byUnit };
  return regionsCache;
}

function firstString(value, predicate, depth = 0) {
  if (typeof value === 'string') return predicate(value) ? value : '';
  if (!value || typeof value !== 'object' || depth > 4) return '';
  for (const entry of Array.isArray(value) ? value : Object.values(value)) {
    const found = firstString(entry, predicate, depth + 1);
    if (found) return found;
  }
  return '';
}

function nodeId(row) {
  for (const key of ['stable_node_id', 'node_id', 'id', 'stable_id', 'source_node_id']) {
    if (typeof row?.[key] === 'string' && row[key]) return row[key];
  }
  return firstString(row, (value) => /^POL27-(?:CF|SY)-/.test(value));
}

function nodeTitle(row, fallback = '') {
  for (const key of ['title', 'heading', 'label', 'name']) {
    if (typeof row?.[key] === 'string' && row[key].trim()) return row[key].trim();
  }
  return fallback;
}

function textFromValue(value) {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(textFromValue).filter(Boolean).join('\n\n');
  if (!value || typeof value !== 'object') return '';
  if (typeof value.text === 'string') return value.text.trim();
  if (typeof value.content === 'string') return value.content.trim();
  return '';
}

function nodeText(row) {
  for (const key of [
    'original_text_span', 'source_text', 'raw_text', 'plain_text', 'node_text',
    'markdown', 'content', 'body', 'text', 'paragraphs', 'paragraph', 'value'
  ]) {
    const text = textFromValue(row?.[key]);
    if (text) return text;
  }
  return '';
}

let sourceRegistryCache;
function sourceRegistry() {
  if (sourceRegistryCache) return sourceRegistryCache;
  const rows = parseJsonl(NODES).map((row, order) => ({ row, order, id: nodeId(row) })).filter((entry) => entry.id);
  const byId = new Map(rows.map((entry) => [entry.id, entry]));
  const descendants = new Map();
  sourceRegistryCache = { rows, byId, descendants };
  return sourceRegistryCache;
}

function sourceOwnerRefs(refs) {
  const unique = [...new Set((refs || []).map(String).filter(Boolean))];
  const kRoots = unique.filter((id) => /-K\d+$/i.test(id));
  if (kRoots.length) return kRoots;
  return unique.filter((id) => !unique.some((other) => other !== id && id.startsWith(`${other}-`)));
}

function descendantsFor(ownerId) {
  const registry = sourceRegistry();
  if (registry.descendants.has(ownerId)) return registry.descendants.get(ownerId);
  const rows = registry.rows.filter((entry) => entry.id === ownerId || entry.id.startsWith(`${ownerId}-`));
  registry.descendants.set(ownerId, rows);
  return rows;
}

function mergeSourceSpans(rows, title) {
  const spans = [];
  for (const entry of rows) {
    const text = nodeText(entry.row);
    if (!text) continue;
    const normalized = compactSpace(text);
    if (!normalized || normalized === compactSpace(title)) continue;

    let handled = false;
    for (let index = 0; index < spans.length; index += 1) {
      const existing = compactSpace(spans[index]);
      if (existing === normalized || existing.includes(normalized)) {
        handled = true;
        break;
      }
      if (normalized.includes(existing)) {
        spans[index] = text;
        handled = true;
        break;
      }
    }
    if (!handled) spans.push(text);
  }
  return spans.join('\n\n').trim();
}

function sourceGroupView(ownerId) {
  const rows = descendantsFor(ownerId);
  const exact = sourceRegistry().byId.get(ownerId)?.row;
  const title = nodeTitle(exact, ownerId);
  const text = mergeSourceSpans(rows, title) || nodeText(exact);
  return {
    id: ownerId,
    title,
    text,
    resolved: Boolean(text && compactSpace(text) !== compactSpace(title)),
    descendantCount: Math.max(0, rows.length - 1)
  };
}

function questionRowId(row) {
  for (const key of ['question_id', 'asset_id', 'id', 'stable_id', 'source_id']) {
    if (typeof row?.[key] === 'string' && row[key]) return row[key];
  }
  return firstString(row, (value) => /^xiao_2027_[a-z]+_(?:single|multiple)_\d+$/i.test(value));
}

let questionIndexCache;
function questionIndex() {
  if (questionIndexCache) return questionIndexCache;
  const rows = parseJsonl(QUESTIONS);
  const byId = new Map();
  for (const row of rows) {
    const id = questionRowId(row);
    if (id) byId.set(String(id).toLowerCase(), row);
  }
  questionIndexCache = { rows, byId };
  return questionIndexCache;
}

function canonicalQuestionSourceId(canonicalId) {
  const match = String(canonicalId || '').match(/^X1000-([A-Z]+)-([SM])-(\d{3})$/i);
  if (!match) return String(canonicalId || '');
  const slug = QUESTION_SUBJECT_SLUG[match[1].toUpperCase()];
  if (!slug) return String(canonicalId || '');
  const kind = match[2].toUpperCase() === 'S' ? 'single' : 'multiple';
  return `xiao_2027_${slug}_${kind}_${match[3]}`;
}

function deepField(object, keys, depth = 0) {
  if (!object || typeof object !== 'object' || depth > 4) return undefined;
  for (const key of keys) if (object[key] !== undefined && object[key] !== null) return object[key];
  for (const value of Array.isArray(object) ? object : Object.values(object)) {
    if (!value || typeof value !== 'object') continue;
    const found = deepField(value, keys, depth + 1);
    if (found !== undefined) return found;
  }
  return undefined;
}

function normalizeOptionLabel(value, index) {
  const raw = String(value ?? '').trim();
  if (/^[A-D]$/i.test(raw)) return raw.toUpperCase();
  return String.fromCharCode(65 + index);
}

function questionOptions(object) {
  const value = deepField(object, ['options', 'choices', 'option_list']);
  if (Array.isArray(value)) {
    return value.map((entry, index) => ({
      label: normalizeOptionLabel(typeof entry === 'object' ? entry?.label ?? entry?.key ?? entry?.option ?? '' : '', index),
      text: String(typeof entry === 'string' ? entry : entry?.text ?? entry?.content ?? entry?.value ?? entry?.body ?? '').trim()
    })).filter((row) => row.text);
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).map(([key, entry], index) => ({
      label: normalizeOptionLabel(key, index),
      text: String(typeof entry === 'string' ? entry : entry?.text ?? entry?.content ?? entry?.value ?? '').trim()
    })).filter((row) => row.text);
  }
  return ['A', 'B', 'C', 'D'].map((label) => ({
    label,
    text: String(deepField(object, [`option_${label.toLowerCase()}`, `option${label}`, label]) ?? '').trim()
  })).filter((row) => row.text);
}

function answerText(value) {
  if (Array.isArray(value)) return value.map(answerText).filter(Boolean).join('');
  if (value && typeof value === 'object') return answerText(value.label ?? value.key ?? value.answer ?? value.value ?? '');
  const raw = String(value ?? '').toUpperCase();
  const letters = raw.match(/[A-D]/g);
  return letters ? [...new Set(letters)].sort().join('') : raw.trim();
}

function questionView(canonicalId) {
  const sourceId = canonicalQuestionSourceId(canonicalId);
  const index = questionIndex();
  const object = index.byId.get(sourceId.toLowerCase()) || index.byId.get(String(canonicalId).toLowerCase());
  if (!object) return { id: canonicalId, sourceId, stem: '', options: [], answer: '', explanation: '', resolved: false };

  const stem = String(deepField(object, ['question_text', 'stem', 'question', 'prompt', 'title', 'text', 'content']) ?? '').trim();
  const options = questionOptions(object);
  const answer = answerText(deepField(object, ['official_answer', 'correct_answer', 'answer', 'correct', 'key']) ?? '');
  const explanation = String(deepField(object, ['explanation', 'analysis', 'official_explanation', 'rationale']) ?? '').trim();
  return { id: canonicalId, sourceId, stem, options, answer, explanation, resolved: Boolean(stem && options.length && answer) };
}

function unitBoundaries(unit) {
  const values = [];
  if (unit?.key_boundary) values.push(String(unit.key_boundary));
  if (unit?.boundary) values.push(String(unit.boundary));
  if (Array.isArray(unit?.major_boundaries)) values.push(...unit.major_boundaries.map(String));
  return [...new Set(values.filter(Boolean))];
}

function unitTeaching(unit) {
  return {
    bridge: String(unit?.from_previous || unit?.starting_point || unit?.before || unit?.context || ''),
    question: String(unit?.core_problem || unit?.concept_question || unit?.stage_question || unit?.role_question || unit?.judgment_question || unit?.problem || ''),
    answer: String(unit?.answer || unit?.core_answer || unit?.evaluation || ''),
    relation: String(unit?.key_relation || unit?.relation || ''),
    application: String(unit?.application || unit?.situational_application || ''),
    next: String(unit?.after_this || unit?.next || ''),
    closure: String(unit?.closure_cue || unit?.review_prompt || ''),
    boundaries: unitBoundaries(unit),
    beats: Array.isArray(unit?.teaching_beats) ? unit.teaching_beats : [],
    conditions: asList(unit?.conditions),
    failureCauses: [...asList(unit?.failure_causes), ...asList(unit?.failure_lesson)],
    gains: asList(unit?.historical_gain),
    process: asList(unit?.process),
    turningPoint: String(unit?.turning_point || ''),
    program: String(unit?.program || ''),
    hierarchy: unit?.hierarchy || null
  };
}

function hydrateUnits(raw) {
  const regions = regionIndex().byUnit;
  return unitList(raw).map((unit) => {
    const unitId = String(unit?.natural_unit_id || unit?.unit_id || '');
    const region = regions.get(unitId) || null;
    const rawSourceRefs = [...new Set(region?.chengfeng_refs || [])];
    const ownerRefs = sourceOwnerRefs(rawSourceRefs);
    const sourceNodes = ownerRefs.map(sourceGroupView).filter((row) => row.resolved);
    const questionIds = [...new Set(region?.xiao_question_refs || [])];
    const questions = questionIds.map(questionView).filter((row) => row.resolved);

    return {
      unitId,
      regionId: String(region?.unified_region_id || unit?.region_id || ''),
      title: String(unit?.title || region?.title || unitId),
      teaching: unitTeaching(unit),
      sourceNodes,
      sourceRefCount: rawSourceRefs.length,
      sourceOwnerCount: ownerRefs.length,
      unresolvedSourceRefs: ownerRefs.filter((id) => !sourceGroupView(id).resolved),
      questions,
      questionRefCount: questionIds.length,
      unresolvedQuestionIds: questionIds.filter((id) => !questionView(id).resolved),
      raw: unit
    };
  });
}

export function listPoliticsSubjectsCurrent() {
  const manifest = learningManifest();
  return Object.entries(manifest.subjects || {}).map(([subject, row]) => {
    const files = chapterFiles(subject, row);
    const meta = SUBJECTS[subject] || { label: subject, shape: '', description: '' };
    return {
      subject,
      ...meta,
      status: String(row?.status || ''),
      teachingShape: String(row?.teaching_shape || ''),
      chapters: files.map((sourcePath) => {
        const raw = readJson(sourcePath);
        return { code: chapterCode(sourcePath), title: chapterTitle(raw, chapterCode(sourcePath)), sourcePath };
      })
    };
  }).filter((row) => row.chapters.length);
}

export function listPoliticsChapterPathsCurrent() {
  return listPoliticsSubjectsCurrent().flatMap((subject) => subject.chapters.map((chapter) => ({ subject: subject.subject, chapter: chapter.code })));
}

export function loadPoliticsChapterCurrent(subject, chapter) {
  const manifest = learningManifest();
  const row = manifest.subjects?.[subject];
  if (!row) throw new Error(`CURRENT_POLITICS_SUBJECT_MISSING:${subject}`);
  const sourcePath = `${subjectRoot(subject, row)}/${chapter}.json`;
  if (!exists(sourcePath)) throw new Error(`CURRENT_POLITICS_CHAPTER_MISSING:${subject}:${chapter}`);
  const text = readText(sourcePath);
  const raw = JSON.parse(text);
  const meta = SUBJECTS[subject] || { label: subject, shape: '', description: '' };
  return {
    objectId: `politics:${subject}:${chapter}`,
    subject,
    subjectMeta: meta,
    chapter,
    title: chapterTitle(raw, chapter),
    teachingShape: String(raw?.teaching_shape || ''),
    orientation: orientationView(raw),
    units: hydrateUnits(raw),
    compression: compressionView(raw),
    sourcePath,
    sourceHash: sha256(text),
    raw
  };
}

export function politicsCurrentHealth() {
  const required = [MANIFEST, REGIONS, NODES, QUESTIONS];
  const checks = required.map((relativePath) => ({
    path: relativePath,
    exists: exists(relativePath),
    size: exists(relativePath) ? fs.statSync(absolute(relativePath)).size : 0
  }));
  return { status: checks.every((row) => row.exists && row.size > 0) ? 'ready' : 'partial', checks };
}

export function politicsRuntimeDiagnostics() {
  const subjects = listPoliticsSubjectsCurrent();
  const chapters = listPoliticsChapterPathsCurrent();
  return {
    subjects: subjects.map((subject) => ({ subject: subject.subject, chapters: subject.chapters.length })),
    chapterCount: chapters.length,
    sourceRegistryRows: sourceRegistry().rows.length,
    questionRows: questionIndex().rows.length
  };
}
