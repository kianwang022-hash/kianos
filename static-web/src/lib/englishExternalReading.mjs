import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const EXTERNAL_ROOT = 'content/english/external';
const OBJECT_ROOT = `${EXTERNAL_ROOT}/objects`;
const MANIFEST_PATH = `${EXTERNAL_ROOT}/manifest.json`;
const SCHEMA_ID = 'kianos.english.external_reading_object.v1';
const RUNTIME_PREFIX = 'external--';

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function stableJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
}

function objectFiles() {
  const root = absolute(OBJECT_ROOT);
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root)
    .filter((name) => name.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `${OBJECT_ROOT}/${name}`);
}

function normalizeAnswer(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (value === null || value === undefined || value === '') return [];
  return [String(value)];
}

function validateObject(value, sourcePath) {
  const fail = (reason) => {
    throw new Error(`CURRENT_EXTERNAL_READING_INVALID:${sourcePath}:${reason}`);
  };
  if (!value || typeof value !== 'object') fail('not_object');
  if (value.schema !== SCHEMA_ID) fail(`schema:${String(value.schema || '')}`);
  if (!String(value.object_id || '').trim()) fail('object_id');
  if (String(value.object_id).startsWith(RUNTIME_PREFIX)) fail('object_id_reserved_prefix');
  if (!value.source || typeof value.source !== 'object') fail('source');
  if (!String(value.source.kind || '').trim()) fail('source.kind');
  if (!String(value.source.source_id || '').trim()) fail('source.source_id');
  const paragraphs = Array.isArray(value.content?.paragraphs) ? value.content.paragraphs : [];
  if (!paragraphs.length) fail('content.paragraphs');
  paragraphs.forEach((paragraph, index) => {
    if (!String(paragraph?.id || '').trim()) fail(`paragraph.${index}.id`);
    if (!String(paragraph?.text || '').trim()) fail(`paragraph.${index}.text`);
  });

  const seen = new Set();
  const questions = Array.isArray(value.questions) ? value.questions : [];
  questions.forEach((question, index) => {
    const id = String(question?.id || '').trim();
    if (!id) fail(`question.${index}.id`);
    if (seen.has(id)) fail(`question_duplicate:${id}`);
    seen.add(id);
    if (!String(question?.prompt || '').trim()) fail(`question.${id}.prompt`);
    if (!question.options || typeof question.options !== 'object' || Array.isArray(question.options)) {
      fail(`question.${id}.options`);
    }
    const labels = Object.keys(question.options);
    if (labels.length < 2) fail(`question.${id}.options_count`);
    if (!normalizeAnswer(question.answer).length) fail(`question.${id}.answer`);
  });

  return value;
}

function readObject(sourcePath) {
  const text = fs.readFileSync(absolute(sourcePath), 'utf8');
  const parsed = validateObject(JSON.parse(text), sourcePath);
  return { sourcePath, text, value: parsed };
}

function manifestStatus() {
  try {
    return JSON.parse(fs.readFileSync(absolute(MANIFEST_PATH), 'utf8')).status || '';
  } catch {
    return '';
  }
}

function titleFor(value) {
  return String(value.content?.title || value.source?.title || value.source?.source_id || value.object_id);
}

function runtimeId(objectId) {
  return `${RUNTIME_PREFIX}${objectId}`;
}

function listEntries() {
  return objectFiles().map((sourcePath) => readObject(sourcePath));
}

export function listExternalReadingObjects() {
  return listEntries().map(({ value }, index, all) => ({
    id: value.object_id,
    runtimeId: runtimeId(value.object_id),
    title: titleFor(value),
    sourceKind: value.source.kind,
    publication: value.source.publication || null,
    publishedAt: value.source.published_at || null,
    exposureState: value.exposure_state,
    role: value.role || null,
    questionCount: Array.isArray(value.questions) ? value.questions.length : 0,
    position: index + 1,
    total: all.length
  }));
}

export function loadExternalReadingById(objectId) {
  const entries = listEntries();
  const index = entries.findIndex(({ value }) => value.object_id === objectId);
  if (index < 0) throw new Error(`CURRENT_EXTERNAL_READING_NOT_FOUND:${objectId}`);
  const { value, sourcePath, text } = entries[index];
  const questions = Array.isArray(value.questions) ? value.questions : [];

  return {
    objectId: runtimeId(value.object_id),
    sourceObjectId: value.object_id,
    title: titleFor(value),
    paperId: value.source.publication || value.source.kind,
    section: 'external_reading',
    paragraphs: value.content.paragraphs.map((paragraph) => ({
      id: String(paragraph.id),
      text: String(paragraph.text)
    })),
    questions: questions.map(({ answer, ...question }) => ({ ...question })),
    // Reading A owns its continuous-session route contract under /reading/.
    // External mode deliberately stays single-object in this first slice so
    // no cross-family navigation path is manufactured by the shared runtime.
    navigation: {
      position: index + 1,
      total: entries.length,
      previousId: null,
      nextId: null
    },
    sourcePaths: {
      passage: sourcePath,
      questions: sourcePath,
      manifest: MANIFEST_PATH,
      sourceTruth: sourcePath
    },
    sourceHashes: {
      passageOwner: sha256(text),
      questionOwner: sha256(text),
      renderedObject: sha256(stableJson(value))
    },
    manifestStatus: manifestStatus(),
    external: {
      source: value.source,
      exposureState: value.exposure_state,
      role: value.role || null,
      studyNote: value.study_note || null,
      questionless: questions.length === 0
    }
  };
}

export function loadExternalReadingAnswersById(objectId) {
  const entries = listEntries();
  const entry = entries.find(({ value }) => value.object_id === objectId);
  if (!entry) throw new Error(`CURRENT_EXTERNAL_READING_NOT_FOUND:${objectId}`);
  const answers = {};
  (Array.isArray(entry.value.questions) ? entry.value.questions : []).forEach((question) => {
    answers[String(question.id)] = question.answer ?? '';
  });
  return {
    schema: 'kianos.english.external_reading_answers.v1',
    objectId: runtimeId(entry.value.object_id),
    answers
  };
}
