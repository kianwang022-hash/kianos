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

function absolute(relativePath) { return path.join(repoRoot, relativePath); }
function exists(relativePath) { return fs.existsSync(absolute(relativePath)); }
function readText(relativePath) { return fs.readFileSync(absolute(relativePath), 'utf8'); }
function readJson(relativePath) { return JSON.parse(readText(relativePath)); }
function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }

function parseJsonl(relativePath) {
  if (!exists(relativePath)) return [];
  return readText(relativePath).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); }
    catch { throw new Error(`CURRENT_POLITICS_JSONL_INVALID:${relativePath}:${index + 1}`); }
  });
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
    chain: Array.isArray(chain) ? chain.map(String) : [],
    attention: String(o.attention_rule || '')
  };
}

function compressionView(raw) {
  const c = raw?.chapter_compression || {};
  const rawChain = c.reconstruction_chain || c.timeline || c.reconstruction || c.historical_direction || [];
  return {
    chain: Array.isArray(rawChain) ? rawChain.map(String) : (rawChain ? [String(rawChain)] : []),
    boundaries: Array.isArray(c.major_boundaries) ? c.major_boundaries.map(String) : (Array.isArray(c.boundaries) ? c.boundaries.map(String) : []),
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

function findObjectContainingExactString(value, target) {
  if (!value || typeof value !== 'object') return null;
  const values = Array.isArray(value) ? value : Object.values(value);
  if (values.some((entry) => typeof entry === 'string' && entry === target)) return value;
  for (const entry of values) {
    const match = findObjectContainingExactString(entry, target);
    if (match) return match;
  }
  return null;
}

function resolveJsonlObjects(relativePath, ids) {
  const wanted = [...new Set((ids || []).filter(Boolean))];
  const result = new Map();
  if (!wanted.length || !exists(relativePath)) return result;
  const unresolved = new Set(wanted);
  const lines = readText(relativePath).split(/\r?\n/);
  for (const raw of lines) {
    if (!raw) continue;
    const candidates = [...unresolved].filter((id) => raw.includes(id));
    if (!candidates.length) continue;
    let row;
    try { row = JSON.parse(raw); } catch { continue; }
    for (const id of candidates) {
      result.set(id, findObjectContainingExactString(row, id) || row);
      unresolved.delete(id);
    }
    if (!unresolved.size) break;
  }
  return result;
}

function scalar(value) { return typeof value === 'string' ? value.trim() : ''; }
function textFromValue(value) {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(textFromValue).filter(Boolean).join('\n\n');
  if (!value || typeof value !== 'object') return '';
  if (typeof value.text === 'string') return value.text.trim();
  if (typeof value.content === 'string') return value.content.trim();
  return '';
}

function nodeView(id, object) {
  const title = scalar(object?.title) || scalar(object?.heading) || scalar(object?.label) || scalar(object?.name) || '';
  let text = '';
  for (const key of ['source_text','raw_text','plain_text','node_text','markdown','content','body','text','paragraphs','paragraph','value']) {
    text = textFromValue(object?.[key]);
    if (text) break;
  }
  return { id, title, text, resolved: Boolean(text) };
}

function normalizeOptionLabel(value, index) {
  const raw = String(value ?? '').trim();
  if (/^[A-D]$/i.test(raw)) return raw.toUpperCase();
  return String.fromCharCode(65 + index);
}

function questionOptions(object) {
  const value = object?.options ?? object?.choices ?? object?.option_list;
  if (Array.isArray(value)) return value.map((entry, index) => ({ label: normalizeOptionLabel(entry?.label ?? entry?.key ?? '', index), text: String(typeof entry === 'string' ? entry : entry?.text ?? entry?.content ?? entry?.value ?? '').trim() })).filter((row) => row.text);
  if (value && typeof value === 'object') return Object.entries(value).map(([key, entry], index) => ({ label: normalizeOptionLabel(key, index), text: String(typeof entry === 'string' ? entry : entry?.text ?? entry?.content ?? entry?.value ?? '').trim() })).filter((row) => row.text);
  return ['A','B','C','D'].map((label) => ({ label, text: String(object?.[`option_${label.toLowerCase()}`] ?? object?.[`option${label}`] ?? object?.[label] ?? '').trim() })).filter((row) => row.text);
}

function answerText(value) {
  if (Array.isArray(value)) return value.map(answerText).filter(Boolean).join('');
  if (value && typeof value === 'object') return answerText(value.label ?? value.key ?? value.answer ?? value.value ?? '');
  const raw = String(value ?? '').toUpperCase();
  const letters = raw.match(/[A-D]/g);
  return letters ? [...new Set(letters)].sort().join('') : raw.trim();
}

function questionView(id, object) {
  let stem = '';
  for (const key of ['question_text','stem','question','prompt','title','text','content']) {
    if (typeof object?.[key] === 'string' && object[key].trim()) { stem = object[key].trim(); break; }
  }
  const options = questionOptions(object);
  const answer = answerText(object?.official_answer ?? object?.correct_answer ?? object?.answer ?? object?.correct ?? object?.key ?? '');
  const explanation = String(object?.explanation ?? object?.analysis ?? object?.official_explanation ?? object?.rationale ?? '').trim();
  return { id, stem, options, answer, explanation, resolved: Boolean(stem && options.length && answer) };
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
    bridge: String(unit?.from_previous || unit?.starting_point || unit?.context || ''),
    question: String(unit?.core_problem || unit?.concept_question || unit?.stage_question || unit?.role_question || unit?.judgment_question || unit?.problem || ''),
    answer: String(unit?.answer || unit?.core_answer || unit?.evaluation || ''),
    relation: String(unit?.key_relation || unit?.relation || ''),
    application: String(unit?.application || unit?.situational_application || ''),
    next: String(unit?.after_this || unit?.next || ''),
    closure: String(unit?.closure_cue || unit?.review_prompt || ''),
    boundaries: unitBoundaries(unit),
    beats: Array.isArray(unit?.teaching_beats) ? unit.teaching_beats : [],
    conditions: Array.isArray(unit?.conditions) ? unit.conditions : [],
    failureCauses: Array.isArray(unit?.failure_causes) ? unit.failure_causes : [],
    gains: Array.isArray(unit?.historical_gain) ? unit.historical_gain : [],
    process: String(unit?.process || ''),
    turningPoint: String(unit?.turning_point || ''),
    program: String(unit?.program || ''),
    hierarchy: unit?.hierarchy || null
  };
}

function hydrateUnits(raw) {
  const units = unitList(raw);
  const regions = regionIndex().byUnit;
  const refSets = units.map((unit) => {
    const unitId = String(unit?.natural_unit_id || unit?.unit_id || '');
    const region = regions.get(unitId) || null;
    return { unit, unitId, region, sourceRefs: [...new Set(region?.chengfeng_refs || [])], questionIds: [...new Set(region?.xiao_question_refs || [])] };
  });
  const sourceObjects = resolveJsonlObjects(NODES, refSets.flatMap((row) => row.sourceRefs));
  const questionObjects = resolveJsonlObjects(QUESTIONS, refSets.flatMap((row) => row.questionIds));

  return refSets.map(({ unit, unitId, region, sourceRefs, questionIds }) => {
    const sourceNodes = sourceRefs.map((id) => nodeView(id, sourceObjects.get(id))).filter((row) => row.resolved);
    const questions = questionIds.map((id) => questionView(id, questionObjects.get(id))).filter((row) => row.resolved);
    return {
      unitId,
      regionId: String(region?.unified_region_id || unit?.region_id || ''),
      title: String(unit?.title || region?.title || unitId),
      teaching: unitTeaching(unit),
      sourceNodes,
      sourceRefCount: sourceRefs.length,
      questions,
      questionRefCount: questionIds.length,
      raw: unit
    };
  });
}

function learningManifest() {
  const manifest = readJson(MANIFEST);
  if (manifest?.status !== 'CURRENT_ACTIVE') throw new Error(`CURRENT_POLITICS_MANIFEST_INVALID:${manifest?.status || 'unknown'}`);
  return manifest;
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
  const checks = required.map((relativePath) => ({ path: relativePath, exists: exists(relativePath), size: exists(relativePath) ? fs.statSync(absolute(relativePath)).size : 0 }));
  return { status: checks.every((row) => row.exists && row.size > 0) ? 'ready' : 'partial', checks };
}
