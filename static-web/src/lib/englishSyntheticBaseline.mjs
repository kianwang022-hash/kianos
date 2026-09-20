import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

export const SYNTHETIC_BASELINE_SOURCE = Object.freeze({
  objective: 'content/english/modules/objective/synthetic-baseline.v1.json',
  objectiveKey: 'content/english/modules/objective/synthetic-baseline-key.v1.json',
  translation: 'content/english/modules/translation/synthetic-tasks.v1.json',
  translationReference: 'content/english/modules/translation/synthetic-tasks.reference.v1.json'
});

const labels = ['A','B','C','D','E','F','G','H'];
const readText = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function stableJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableJson).join(',') + ']';
  return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + stableJson(value[key])).join(',') + '}';
}

function optionObject(values) {
  if (!Array.isArray(values)) return {};
  return Object.fromEntries(values.map((value, index) => [labels[index], String(value || '')]));
}

function parseLabeled(values) {
  return Object.fromEntries((Array.isArray(values) ? values : []).map((value, index) => {
    const text = String(value || '').trim();
    const match = text.match(/^([A-H])\.\s*(.*)$/);
    return match ? [match[1], match[2]] : [labels[index], text];
  }).filter(([, text]) => text));
}

function textBlocks(text, prefix = 'm') {
  return String(text || '')
    .split(/\n\s*\n/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((textValue, index) => ({ id: prefix + (index + 1), text: textValue }));
}

let cached;

function snapshot() {
  if (cached) return cached;
  try {
    const objectiveRaw = readText(SYNTHETIC_BASELINE_SOURCE.objective);
    const objectiveKeyRaw = readText(SYNTHETIC_BASELINE_SOURCE.objectiveKey);
    const translationRaw = readText(SYNTHETIC_BASELINE_SOURCE.translation);
    const translationReferenceRaw = readText(SYNTHETIC_BASELINE_SOURCE.translationReference);
    const objective = JSON.parse(objectiveRaw);
    const objectiveKey = JSON.parse(objectiveKeyRaw);
    const translation = JSON.parse(translationRaw);
    const translationReference = JSON.parse(translationReferenceRaw);
    const issues = [];
    if (objective?.schema !== 'kianos.english.objective.synthetic_baseline.v1') issues.push('OBJECTIVE_SCHEMA');
    if (objectiveKey?.schema !== 'kianos.english.objective.synthetic_baseline_key.v1') issues.push('OBJECTIVE_KEY_SCHEMA');
    if (translation?.schema !== 'kianos.english.translation.synthetic_tasks.v1') issues.push('TRANSLATION_SCHEMA');
    if (translationReference?.schema !== 'kianos.english.translation.synthetic_tasks.reference.v1') issues.push('TRANSLATION_REFERENCE_SCHEMA');
    if (!['CURRENT','CURRENT_CANDIDATE'].includes(objective?.status)) issues.push('OBJECTIVE_STATUS');
    if (!['CURRENT','CURRENT_CANDIDATE'].includes(translation?.status)) issues.push('TRANSLATION_STATUS');
    cached = {
      status: issues.length ? 'invalid' : 'ready',
      issues,
      objective,
      objectiveKey,
      translation,
      translationReference,
      hashes: {
        objective: sha256(objectiveRaw),
        objectiveKey: sha256(objectiveKeyRaw),
        translation: sha256(translationRaw),
        translationReference: sha256(translationReferenceRaw)
      }
    };
  } catch (error) {
    cached = {
      status: 'invalid',
      issues: [error instanceof Error ? error.message : String(error)]
    };
  }
  return cached;
}

function requireReady() {
  const data = snapshot();
  if (data.status !== 'ready') {
    throw new Error('ENGLISH_SYNTHETIC_BASELINE_NOT_READY:' + data.status + ':' + (data.issues || []).join('|'));
  }
  return data;
}

function nav(rows, index) {
  return {
    position: index + 1,
    total: rows.length,
    previousId: index > 0 ? rows[index - 1].id : null,
    nextId: index < rows.length - 1 ? rows[index + 1].id : null
  };
}

function summary(row, index, total, title) {
  return {
    id: row.id,
    title,
    paperId: null,
    year: null,
    section: 'synthetic_baseline',
    position: index + 1,
    total,
    evidenceRole: row.role || null,
    sourceKind: 'synthetic'
  };
}

export function inspectEnglishSyntheticBaseline() {
  const data = snapshot();
  return {
    status: data.status,
    issues: [...(data.issues || [])],
    readingA: data.objective?.reading_a?.length || 0,
    cloze: data.objective?.cloze?.length || 0,
    partB: data.objective?.part_b?.length || 0,
    translation: data.translation?.tasks?.length || 0
  };
}

export function listSyntheticReadingSets() {
  const data = requireReady();
  const rows = data.objective.reading_a || [];
  return rows.map((row, index) => summary(row, index, rows.length, 'Synthetic Reading A · ' + (index + 1)));
}

export function loadSyntheticReadingById(id) {
  const data = requireReady();
  const rows = data.objective.reading_a || [];
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) throw new Error('SYNTHETIC_READING_NOT_FOUND:' + id);
  const row = rows[index];
  const questions = row.questions.map((question, qIndex) => ({
    id: String(question.id || 'q' + (qIndex + 1)),
    ordinal: qIndex + 1,
    prompt: String(question.stem || ''),
    options: optionObject(question.options)
  }));
  return {
    task: 'reading_a',
    objectId: row.id,
    title: 'Synthetic Reading A · ' + (index + 1),
    paperId: null,
    year: null,
    code: 'SYNTHETIC',
    section: 'reading_part_a_synthetic',
    paragraphs: textBlocks(row.passage, 'p'),
    questions,
    context: {
      source_kind: 'synthetic',
      evidence_role: row.role,
      target_mechanisms: clone(row.target_mechanisms || [])
    },
    navigation: nav(rows, index),
    sourcePaths: {
      passage: SYNTHETIC_BASELINE_SOURCE.objective,
      questions: SYNTHETIC_BASELINE_SOURCE.objective
    },
    sourceHashes: {
      syntheticOwner: data.hashes.objective,
      renderedObject: sha256(stableJson(row))
    },
    sourceKind: 'synthetic'
  };
}

export function loadSyntheticReadingAnswersById(id) {
  const data = requireReady();
  const row = (data.objective.reading_a || []).find((item) => item.id === id);
  if (!row) throw new Error('SYNTHETIC_READING_NOT_FOUND:' + id);
  const key = data.objectiveKey.answers?.[id];
  if (!key || typeof key !== 'object' || Array.isArray(key)) throw new Error('SYNTHETIC_READING_KEY_MISSING:' + id);
  const answers = {};
  for (const question of row.questions) {
    const answerIndex = Number(key[question.id]);
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= question.options.length) {
      throw new Error('SYNTHETIC_READING_KEY_INVALID:' + id + ':' + question.id);
    }
    answers[question.id] = labels[answerIndex];
  }
  return { schema: 'kianos.english.reading_answers.v1', objectId: id, answers };
}

export function loadSyntheticReadingReviewById(id) {
  loadSyntheticReadingById(id);
  return {
    schema: 'kianos.english.reading_review_projection.v1',
    objectId: id,
    questions: {}
  };
}

export function listSyntheticClozeSets() {
  const data = requireReady();
  const rows = data.objective.cloze || [];
  return rows.map((row, index) => summary(row, index, rows.length, 'Synthetic Cloze · ' + (index + 1)));
}

export function loadSyntheticClozeById(id) {
  const data = requireReady();
  const rows = data.objective.cloze || [];
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) throw new Error('SYNTHETIC_CLOZE_NOT_FOUND:' + id);
  const row = rows[index];
  const questions = row.blanks.map((blank, qIndex) => ({
    id: 'q' + (blank.n || qIndex + 1),
    ordinal: blank.n || qIndex + 1,
    prompt: 'Blank ' + (blank.n || qIndex + 1),
    options: optionObject(blank.options)
  }));
  return {
    task: 'cloze',
    objectId: row.id,
    title: 'Synthetic Cloze · ' + (index + 1),
    paperId: null,
    year: null,
    code: 'SYNTHETIC',
    section: 'cloze_synthetic',
    material: textBlocks(row.passage_with_blanks),
    questions,
    candidates: [],
    context: {
      instruction: 'Choose the best answer for each blank from the four options.',
      subtitle: 'Task-native synthetic baseline',
      source_kind: 'synthetic',
      evidence_role: row.role,
      target_mechanisms: clone(row.target_mechanisms || [])
    },
    navigation: nav(rows, index),
    sourcePaths: {
      questions: SYNTHETIC_BASELINE_SOURCE.objective
    },
    sourceHashes: {
      syntheticOwner: data.hashes.objective,
      renderedObject: sha256(stableJson(row))
    },
    sourceKind: 'synthetic'
  };
}

export function loadSyntheticClozeAnswersById(id) {
  const data = requireReady();
  const row = (data.objective.cloze || []).find((item) => item.id === id);
  if (!row) throw new Error('SYNTHETIC_CLOZE_NOT_FOUND:' + id);
  const key = data.objectiveKey.answers?.[id];
  if (!Array.isArray(key) || key.length !== row.blanks.length) throw new Error('SYNTHETIC_CLOZE_KEY_MISSING:' + id);
  const answers = {};
  row.blanks.forEach((blank, index) => {
    const answerIndex = Number(key[index]);
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= blank.options.length) {
      throw new Error('SYNTHETIC_CLOZE_KEY_INVALID:' + id + ':' + (index + 1));
    }
    answers['q' + (blank.n || index + 1)] = labels[answerIndex];
  });
  return { schema: 'kianos.english.objective_answers.v1', task: 'cloze', objectId: id, answers };
}

function partBForm(value) {
  return ({
    GAP_MATCHING: 'gap_match',
    PARAGRAPH_ORDERING: 'ordering',
    HEADING_MATCHING: 'heading_match',
    COMMENT_STATEMENT_MATCHING: 'comment_match'
  })[String(value || '').toUpperCase()] || 'generic_matching';
}

function partBCandidates(row) {
  if (row.candidates && typeof row.candidates === 'object' && !Array.isArray(row.candidates)) return clone(row.candidates);
  if (Array.isArray(row.headings)) return parseLabeled(row.headings);
  if (Array.isArray(row.statements)) return parseLabeled(row.statements);
  if (row.paragraphs && !Array.isArray(row.paragraphs) && typeof row.paragraphs === 'object') return clone(row.paragraphs);
  return {};
}

function partBMaterial(row, form) {
  if (form === 'gap_match') {
    return (row.body || []).map((text, index) => ({ id: 'm' + (index + 1), text: String(text || '') }));
  }
  if (form === 'heading_match') {
    return (row.paragraphs || []).map((text, index) => ({ id: 'm' + (index + 1), text: 'Paragraph ' + (index + 1) + ': ' + text }));
  }
  if (form === 'comment_match') {
    return (row.comments || []).map((text, index) => ({ id: 'm' + (index + 1), text: 'Comment ' + (index + 1) + ': ' + text }));
  }
  return [];
}

export function listSyntheticReadingBSets() {
  const data = requireReady();
  const rows = data.objective.part_b || [];
  return rows.map((row, index) => summary(row, index, rows.length, 'Synthetic Part B · ' + String(row.form || '').replaceAll('_', ' ')));
}

export function loadSyntheticReadingBById(id) {
  const data = requireReady();
  const rows = data.objective.part_b || [];
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) throw new Error('SYNTHETIC_PART_B_NOT_FOUND:' + id);
  const row = rows[index];
  const form = partBForm(row.form);
  const candidateMap = partBCandidates(row);
  const candidates = Object.entries(candidateMap).map(([label, text]) => ({ label, text: String(text || '') }));
  const questions = Array.from({ length: 5 }, (_, qIndex) => ({
    id: 'q' + (qIndex + 1),
    ordinal: qIndex + 1,
    prompt: form === 'gap_match' ? 'Gap ' + (qIndex + 1)
      : form === 'ordering' ? 'Slot ' + (qIndex + 1)
      : form === 'heading_match' ? 'Paragraph ' + (qIndex + 1)
      : form === 'comment_match' ? 'Comment ' + (qIndex + 1)
      : 'Item ' + (qIndex + 1),
    options: clone(candidateMap),
    displayLabel: form === 'comment_match' ? 'Comment ' + (qIndex + 1) : ''
  }));
  return {
    task: 'reading_b',
    objectId: row.id,
    title: 'Synthetic Part B · ' + String(row.form || '').replaceAll('_', ' '),
    paperId: null,
    year: null,
    code: 'SYNTHETIC',
    section: 'reading_part_b_synthetic',
    material: partBMaterial(row, form),
    questions,
    candidates,
    context: {
      directions: String(row.directions || ''),
      questionGroupType: String(row.form || ''),
      taskForm: form,
      formLabel: String(row.form || '').replaceAll('_', ' '),
      candidateUsePolicy: 'single_use',
      itemLabel: form === 'gap_match' ? 'Gap' : form === 'ordering' ? 'Slot' : form === 'heading_match' ? 'Paragraph' : 'Comment',
      orderingSkeleton: form === 'ordering' ? clone(row.skeleton || []) : [],
      fixedGivens: form === 'ordering' ? clone(row.fixed || []) : [],
      source_kind: 'synthetic',
      evidence_role: row.role,
      target_mechanisms: clone(row.target_mechanisms || [])
    },
    navigation: nav(rows, index),
    sourcePaths: {
      questions: SYNTHETIC_BASELINE_SOURCE.objective
    },
    sourceHashes: {
      syntheticOwner: data.hashes.objective,
      renderedObject: sha256(stableJson(row))
    },
    sourceKind: 'synthetic'
  };
}

export function loadSyntheticReadingBAnswersById(id) {
  const data = requireReady();
  const row = (data.objective.part_b || []).find((item) => item.id === id);
  if (!row) throw new Error('SYNTHETIC_PART_B_NOT_FOUND:' + id);
  const key = data.objectiveKey.answers?.[id];
  if (!key || typeof key !== 'object' || Array.isArray(key)) throw new Error('SYNTHETIC_PART_B_KEY_MISSING:' + id);
  const answers = Object.fromEntries(Array.from({ length: 5 }, (_, index) => [
    'q' + (index + 1),
    String(key[String(index + 1)] || '')
  ]));
  if (Object.values(answers).some((answer) => !answer)) throw new Error('SYNTHETIC_PART_B_KEY_INVALID:' + id);
  return { schema: 'kianos.english.objective_answers.v1', task: 'reading_b', objectId: id, answers };
}

export function listSyntheticTranslationSets() {
  const data = requireReady();
  const rows = data.translation.tasks || [];
  return rows.map((row, index) => summary(row, index, rows.length, 'Synthetic Translation · ' + String(row.theme || index + 1)));
}

export function loadSyntheticTranslationById(id) {
  const data = requireReady();
  const rows = data.translation.tasks || [];
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) throw new Error('SYNTHETIC_TRANSLATION_NOT_FOUND:' + id);
  const row = rows[index];
  const prompts = (row.segments || []).map((segment, sIndex) => ({
    id: row.id + ':s' + (segment.n || sIndex + 1),
    ordinal: segment.n || sIndex + 1,
    instruction: 'Translate the following segment into Chinese.',
    sourceText: String(segment.text || '')
  }));
  return {
    task: 'translation',
    objectId: row.id,
    title: 'Synthetic Translation · ' + String(row.theme || index + 1),
    paperId: null,
    year: null,
    code: 'SYNTHETIC',
    section: 'translation_synthetic',
    material: [],
    prompts,
    referenceCoverage: {
      available: prompts.length,
      total: prompts.length,
      missing: 0,
      complete: prompts.length > 0
    },
    context: {
      instruction: 'Translate all five segments independently before opening references.',
      subtitle: String(row.context || ''),
      source_kind: 'synthetic',
      evidence_role: row.role,
      target_mechanisms: clone(row.target_mechanisms || [])
    },
    navigation: nav(rows, index),
    sourcePaths: {
      questions: SYNTHETIC_BASELINE_SOURCE.translation,
      reference: SYNTHETIC_BASELINE_SOURCE.translationReference
    },
    sourceHashes: {
      syntheticOwner: data.hashes.translation,
      renderedObject: sha256(stableJson(row))
    },
    sourceKind: 'synthetic'
  };
}

export function loadSyntheticTranslationReferencesById(id) {
  const data = requireReady();
  const row = (data.translation.tasks || []).find((item) => item.id === id);
  if (!row) throw new Error('SYNTHETIC_TRANSLATION_NOT_FOUND:' + id);
  const referenceTexts = data.translationReference.tasks?.[id];
  if (!Array.isArray(referenceTexts) || referenceTexts.length !== row.segments.length) {
    throw new Error('SYNTHETIC_TRANSLATION_REFERENCE_MISSING:' + id);
  }
  const references = referenceTexts.map((text, index) => ({
    id: row.id + ':s' + (row.segments[index]?.n || index + 1),
    ordinal: row.segments[index]?.n || index + 1,
    text: String(text || ''),
    available: Boolean(String(text || '').trim()),
    status: 'synthetic_reference',
    source: SYNTHETIC_BASELINE_SOURCE.translationReference,
    official: false,
    semanticRule: 'Synthetic reference is post-attempt comparison only; it is not an official unique answer.'
  }));
  return {
    schema: 'kianos.english.translation_reference.v1',
    task: 'translation',
    objectId: id,
    availableCount: references.filter((row) => row.available).length,
    totalCount: references.length,
    missingCount: references.filter((row) => !row.available).length,
    references
  };
}
