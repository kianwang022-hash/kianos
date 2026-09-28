import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { loadPoliticsSourceFidelityOverrides, splitPoliticsSourceRowsByFidelity } from './politicsSourceFidelity.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const ROOT = 'content/politics';
const LEARNING = `${ROOT}/learning`;
const MANIFEST = `${LEARNING}/manifest.json`;
const REGIONS = `${ROOT}/source/politics_unified_regions.v1.jsonl`;
const QUESTION_MANIFEST = `${ROOT}/source/questions/manifest.json`;
const NODE_MANIFEST = `${ROOT}/source/nodes/manifest.json`;
const SOURCE_SHARD_AUDIT = `${ROOT}/source/source-shard-audit.json`;
const QUESTION_SHARDS = `${ROOT}/source/questions/shards`;
const NODE_SHARDS = `${ROOT}/source/nodes/shards`;
const QUESTION_WIDTH = 25;

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
function unitList(raw) {
  if (Array.isArray(raw?.unit_projections)) return raw.unit_projections;
  if (Array.isArray(raw?.units)) return raw.units;
  if (raw?.unit && typeof raw.unit === 'object') return [raw.unit];
  return [];
}

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

function slug(value) {
  return String(value || 'unknown').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
}

function sourceNodeShardPath(ownerId) {
  const id = String(ownerId || '');
  const match = id.match(/^POL27-([A-Z0-9]+)-([A-Z0-9_]+)(?:-|$)/i);
  if (!match) return '';
  const source = slug(`POL27-${match[1]}`);
  const subject = slug(match[2]);
  const chapter = id.match(/-C(\d{2})(?:-|$)/i)?.[1] || null;
  const page = id.match(/-P(\d{3})(?:-|$)/i)?.[1] || null;
  const partition = chapter ? `c${chapter}` : page ? `p${page}` : 'root';
  return `${NODE_SHARDS}/${source}/${subject}/${partition}.json`;
}

const nodeShardCache = new Map();
function nodeShard(ownerId) {
  const relativePath = sourceNodeShardPath(ownerId);
  if (!relativePath || !exists(relativePath)) return null;
  if (!nodeShardCache.has(relativePath)) nodeShardCache.set(relativePath, readJson(relativePath));
  return { relativePath, rows: nodeShardCache.get(relativePath) };
}

const nodeDescendantCache = new Map();
function descendantsFor(ownerId) {
  if (nodeDescendantCache.has(ownerId)) return nodeDescendantCache.get(ownerId);
  const shard = nodeShard(ownerId);
  if (!shard) return [];
  const rows = Object.entries(shard.rows)
    .filter(([id]) => id === ownerId || id.startsWith(`${ownerId}-`))
    .map(([id, row], order) => ({ id, row, order }));
  nodeDescendantCache.set(ownerId, rows);
  return rows;
}

function sourceOwnerSortKey(id) {
  const match = String(id).match(/-C(\d+)-K(\d+)$/i);
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
}

function sourceOwnerRefs(refs) {
  const unique = [...new Set((refs || []).map(String).filter(Boolean))];
  const kRoots = unique.filter((id) => /-K\d+$/i.test(id));
  if (kRoots.length) {
    return kRoots.sort((a, b) => {
      const ak = sourceOwnerSortKey(a);
      const bk = sourceOwnerSortKey(b);
      if (!ak || !bk) return a.localeCompare(b, 'en', { numeric: true });
      return ak[0] - bk[0] || ak[1] - bk[1];
    });
  }
  return unique.filter((id) => !unique.some((other) => other !== id && id.startsWith(`${other}-`)));
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

let sourceFidelityOverridesCache;
function sourceFidelityOverrides() {
  if (!sourceFidelityOverridesCache) sourceFidelityOverridesCache = loadPoliticsSourceFidelityOverrides();
  return sourceFidelityOverridesCache;
}

function sourceGroupView(ownerId) {
  const rows = descendantsFor(ownerId);
  const { admitted, blocked } = splitPoliticsSourceRowsByFidelity(rows, sourceFidelityOverrides());
  const exact = admitted.find((entry) => entry.id === ownerId)?.row || null;
  const rawTitle = nodeTitle(exact, ownerId);
  const text = mergeSourceSpans(admitted, rawTitle) || nodeText(exact);
  const sameAsTitle = Boolean(text && compactSpace(text) === compactSpace(rawTitle));
  const blockedStatuses = [...new Set(blocked.map((entry) => entry.fidelity?.effectiveStatus).filter(Boolean))];
  return {
    id: ownerId,
    title: sameAsTitle ? '' : rawTitle,
    text,
    resolved: Boolean(text),
    fidelityStatus: blocked.length ? (text ? 'PARTIAL_SAFE' : 'BLOCKED_FIDELITY') : 'ADMITTED',
    blockedNodeIds: blocked.map((entry) => entry.id),
    blockedVerificationStatuses: blockedStatuses,
    descendantCount: Math.max(0, rows.length - 1),
    sourceShard: sourceNodeShardPath(ownerId)
  };
}

function canonicalQuestionSourceId(canonicalId) {
  const match = String(canonicalId || '').match(/^X1000-([A-Z]+)-([SM])-(\d{3})$/i);
  if (!match) return String(canonicalId || '');
  const subject = QUESTION_SUBJECT_SLUG[match[1].toUpperCase()];
  if (!subject) return String(canonicalId || '');
  const kind = match[2].toUpperCase() === 'S' ? 'single' : 'multiple';
  return `xiao_2027_${subject}_${kind}_${match[3]}`;
}

function questionShardPath(sourceId) {
  const match = String(sourceId || '').match(/^xiao_2027_(marx|history|mao|xi|ethics)_([a-z_]+)_(\d{3})$/i);
  if (!match) return '';
  const subject = match[1].toLowerCase();
  const kind = match[2].toLowerCase();
  const number = Number(match[3]);
  const start = Math.floor((number - 1) / QUESTION_WIDTH) * QUESTION_WIDTH + 1;
  const end = start + QUESTION_WIDTH - 1;
  return `${QUESTION_SHARDS}/${subject}/${kind}/q${String(start).padStart(3, '0')}-${String(end).padStart(3, '0')}.json`;
}

const questionShardCache = new Map();
function questionSourceRow(sourceId) {
  const relativePath = questionShardPath(sourceId);
  if (!relativePath || !exists(relativePath)) return { row: null, relativePath };
  if (!questionShardCache.has(relativePath)) questionShardCache.set(relativePath, readJson(relativePath));
  const shard = questionShardCache.get(relativePath);
  return { row: shard?.[sourceId] || null, relativePath };
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
  const { row: object, relativePath } = questionSourceRow(sourceId);
  if (!object) return { id: canonicalId, sourceId, stem: '', options: [], answer: '', explanation: '', resolved: false, sourceShard: relativePath };

  const stem = String(deepField(object, ['question_text', 'stem', 'question', 'prompt', 'title', 'text', 'content']) ?? '').trim();
  const options = questionOptions(object);
  const answer = answerText(deepField(object, ['official_answer', 'correct_answer', 'answer', 'correct', 'key']) ?? '');
  const explanation = String(deepField(object, ['explanation', 'analysis', 'official_explanation', 'rationale']) ?? '').trim();
  return { id: canonicalId, sourceId, stem, options, answer, explanation, resolved: Boolean(stem && options.length && answer), sourceShard: relativePath };
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
  const drafts = unitList(raw).map((unit) => {
    const primaryUnitId = String(unit?.natural_unit_id || unit?.unit_id || '');
    const representedNaturalUnitIds = [primaryUnitId, ...asList(unit?.embedded_natural_unit_ids)]
      .filter(Boolean)
      .filter((id, index, all) => all.indexOf(id) === index);
    const regionRows = representedNaturalUnitIds.map((id) => regions.get(id)).filter(Boolean);
    const rawSourceRefs = [...new Set(regionRows.flatMap((row) => row?.chengfeng_refs || []))];
    const ownerRefs = sourceOwnerRefs(rawSourceRefs);
    const sourceViews = ownerRefs.map(sourceGroupView);
    const sourceNodes = sourceViews.filter((row) => row.resolved);
    const fidelityBlockedSourceRefs = sourceViews
      .filter((row) => row.blockedNodeIds?.length)
      .map((row) => ({
        owner_id: row.id,
        fidelity_status: row.fidelityStatus,
        blocked_node_ids: row.blockedNodeIds,
        blocked_verification_statuses: row.blockedVerificationStatuses
      }));
    const linkedQuestionIds = [...new Set(regionRows.flatMap((row) => row?.xiao_question_refs || []))];
    return {
      unit,
      unitId: primaryUnitId,
      representedNaturalUnitIds,
      regionRows,
      rawSourceRefs,
      ownerRefs,
      sourceViews,
      sourceNodes,
      fidelityBlockedSourceRefs,
      linkedQuestionIds
    };
  });

  const lastQuestionOwner = new Map();
  drafts.forEach((draft, index) => {
    for (const questionId of draft.linkedQuestionIds) lastQuestionOwner.set(questionId, index);
  });

  return drafts.map((draft, index) => {
    const ownedQuestionIds = draft.linkedQuestionIds.filter((id) => lastQuestionOwner.get(id) === index);
    const questions = ownedQuestionIds.map(questionView).filter((row) => row.resolved);
    return {
      unitId: draft.unitId,
      representedNaturalUnitIds: draft.representedNaturalUnitIds,
      regionId: String(draft.regionRows[0]?.unified_region_id || draft.unit?.region_id || ''),
      regionIds: draft.regionRows.map((row) => String(row?.unified_region_id || '')).filter(Boolean),
      title: String(draft.unit?.title || draft.regionRows[0]?.title || draft.unitId),
      teaching: unitTeaching(draft.unit),
      sourceNodes: draft.sourceNodes,
      sourceRefCount: draft.rawSourceRefs.length,
      sourceOwnerCount: draft.ownerRefs.length,
      fidelityBlockedSourceRefs: draft.fidelityBlockedSourceRefs,
      unresolvedSourceRefs: draft.sourceViews
        .filter((row) => !row.resolved && !(row.blockedNodeIds?.length))
        .map((row) => row.id),
      questions,
      questionRefCount: ownedQuestionIds.length,
      linkedQuestionRefCount: draft.linkedQuestionIds.length,
      unresolvedQuestionIds: ownedQuestionIds.filter((id) => !questionView(id).resolved),
      raw: draft.unit
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

function shardManifests() {
  const questionManifest = exists(QUESTION_MANIFEST) ? readJson(QUESTION_MANIFEST) : null;
  const nodeManifest = exists(NODE_MANIFEST) ? readJson(NODE_MANIFEST) : null;
  const audit = exists(SOURCE_SHARD_AUDIT) ? readJson(SOURCE_SHARD_AUDIT) : null;
  return { questionManifest, nodeManifest, audit };
}

export function politicsCurrentHealth() {
  const required = [MANIFEST, REGIONS, QUESTION_MANIFEST, NODE_MANIFEST, SOURCE_SHARD_AUDIT];
  const checks = required.map((relativePath) => ({
    path: relativePath,
    exists: exists(relativePath),
    size: exists(relativePath) ? fs.statSync(absolute(relativePath)).size : 0
  }));
  const { audit } = shardManifests();
  const parity = audit?.status === 'PASS' && audit?.questions?.parity === true && audit?.nodes?.parity === true;
  return {
    status: checks.every((row) => row.exists && row.size > 0) && parity ? 'ready' : 'partial',
    sourceMode: 'DETERMINISTIC_SCOPED_SHARDS',
    monolithRuntimeDependency: false,
    parity,
    checks
  };
}

export function politicsRuntimeDiagnostics() {
  const subjects = listPoliticsSubjectsCurrent();
  const chapters = listPoliticsChapterPathsCurrent();
  const { questionManifest, nodeManifest, audit } = shardManifests();
  return {
    subjects: subjects.map((subject) => ({ subject: subject.subject, chapters: subject.chapters.length })),
    chapterCount: chapters.length,
    sourceMode: 'DETERMINISTIC_SCOPED_SHARDS',
    monolithRuntimeDependency: false,
    sourceNodeRows: Number(nodeManifest?.row_count || 0),
    questionRows: Number(questionManifest?.row_count || 0),
    sourceShardParity: audit?.status === 'PASS' && audit?.questions?.parity === true && audit?.nodes?.parity === true,
    loadedNodeShards: [...nodeShardCache.keys()],
    loadedQuestionShards: [...questionShardCache.keys()]
  };
}

// The existing Current Source loader is reused for explicit cross-chapter deferrals.
export { questionView as loadPoliticsQuestionCurrent };
