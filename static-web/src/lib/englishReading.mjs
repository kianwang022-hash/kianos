import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { inspectReadingSources } from './current.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const SOURCE = Object.freeze({
  manifest: 'content/english/manifest.json',
  questionBank: 'content/english/source/question_bank.v1.json',
  readingCorpus: 'content/english/source/reading_corpus.v1.json'
});

const QUESTION_TASKS = new Set([
  'DETAIL', 'INFERENCE', 'MAIN_IDEA', 'TITLE', 'ATTITUDE', 'WORD_PHRASE',
  'REFERENCE', 'PURPOSE_FUNCTION', 'STRUCTURE_RELATION', 'OTHER'
]);

const OPTION_DIAGNOSES = new Set([
  'SUPPORTED', 'CONTRADICTED', 'UNSUPPORTED', 'TRUE_BUT_IRRELEVANT', 'PARTLY_TRUE',
  'ENTITY_SHIFT', 'OBJECT_SHIFT', 'POLARITY_SHIFT', 'MODALITY_SHIFT', 'DEGREE_SHIFT',
  'QUANTITY_SHIFT', 'SCOPE_SHIFT', 'TIME_SHIFT', 'CAUSE_SHIFT', 'CAUSE_REVERSAL',
  'CORRELATION_TO_CAUSATION', 'COMPARISON_SHIFT', 'ATTRIBUTION_SHIFT', 'LOCAL_TO_GLOBAL',
  'GLOBAL_TO_LOCAL', 'EXAMPLE_AS_CLAIM', 'CLAIM_AS_EXAMPLE', 'OVER_INFERENCE',
  'UNDER_INFERENCE', 'OTHER'
]);

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function stableJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
}

function compactParagraphText(paragraph) {
  if (typeof paragraph === 'string') return paragraph.trim();
  if (!paragraph || typeof paragraph !== 'object') return '';
  if (typeof paragraph.text === 'string' && paragraph.text.trim()) return paragraph.text.trim();
  const sentences = Array.isArray(paragraph.sentences) ? paragraph.sentences : [];
  return sentences
    .map((sentence) => typeof sentence === 'string' ? sentence : String(sentence?.text || ''))
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .join(' ');
}

function isVerifiedStatus(value) {
  const status = String(value || '').trim().toLowerCase();
  return Boolean(status && status.includes('verified') && !status.includes('unverified') && !status.includes('pending') && !status.includes('rejected'));
}

function findEnumTokens(value, allowed, output = new Set()) {
  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, '_');
    if (allowed.has(normalized)) output.add(normalized);
    return output;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => findEnumTokens(item, allowed, output));
    return output;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => findEnumTokens(item, allowed, output));
  }
  return output;
}

function semanticQuestionIndex(corpus) {
  const index = new Map();
  const visit = (value) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== 'object') return;

    const hasSemanticFields = Object.prototype.hasOwnProperty.call(value, 'question_task')
      || Object.prototype.hasOwnProperty.call(value, 'canonical_evidence_sets')
      || Object.prototype.hasOwnProperty.call(value, 'option_diagnosis')
      || Object.prototype.hasOwnProperty.call(value, 'analysis_verification_status');
    const id = String(value.question_id || '');

    if (id && hasSemanticFields) {
      if (index.has(id) && index.get(id) !== value) {
        throw new Error(`CURRENT_READING_SEMANTIC_DUPLICATE:${id}`);
      }
      index.set(id, value);
    }

    Object.values(value).forEach(visit);
  };
  visit(corpus);
  return index;
}

function sentenceIndex(passage) {
  const index = new Map();
  (Array.isArray(passage?.paragraphs) ? passage.paragraphs : []).forEach((paragraph) => {
    (Array.isArray(paragraph?.sentences) ? paragraph.sentences : []).forEach((sentence) => {
      if (!sentence || typeof sentence !== 'object') return;
      const id = String(sentence.sentence_id || sentence.id || '');
      const text = String(sentence.text || '').trim();
      if (id && text) index.set(id, text);
    });
  });
  return index;
}

function optionDiagnosisForLabel(optionDiagnosis, label) {
  if (!optionDiagnosis || typeof optionDiagnosis !== 'object' || !label) return [];
  const upper = String(label).toUpperCase();
  const direct = optionDiagnosis[upper] ?? optionDiagnosis[upper.toLowerCase()];
  if (direct !== undefined) return [...findEnumTokens(direct, OPTION_DIAGNOSES)];

  for (const [key, value] of Object.entries(optionDiagnosis)) {
    const normalizedKey = String(key).toUpperCase();
    if (normalizedKey === upper || normalizedKey.endsWith(`-${upper}`) || normalizedKey.endsWith(`:${upper}`)) {
      return [...findEnumTokens(value, OPTION_DIAGNOSES)];
    }
    if (value && typeof value === 'object') {
      const optionIdentity = String(value.option_id || value.option || value.label || '').toUpperCase();
      if (optionIdentity === upper || optionIdentity.endsWith(`-${upper}`) || optionIdentity.endsWith(`:${upper}`)) {
        return [...findEnumTokens(value, OPTION_DIAGNOSES)];
      }
    }
  }
  return [];
}

function projectReviewQuestion(semanticQuestion, passage, labels) {
  if (!semanticQuestion) return null;
  const semanticVerified = isVerifiedStatus(semanticQuestion.analysis_verification_status)
    || isVerifiedStatus(semanticQuestion.verification_status);
  const sentences = sentenceIndex(passage);
  const evidenceSets = Array.isArray(semanticQuestion.canonical_evidence_sets)
    ? semanticQuestion.canonical_evidence_sets
    : [];

  const minimalEvidence = evidenceSets
    .filter((set) => String(set?.sufficiency || '').toUpperCase() === 'MINIMAL')
    .filter((set) => isVerifiedStatus(set?.verification_status) || semanticVerified)
    .map((set) => {
      const sentenceIds = Array.isArray(set?.sentence_ids) ? set.sentence_ids.map(String).filter(Boolean) : [];
      const resolved = sentenceIds.map((id) => sentences.get(id)).filter(Boolean);
      if (!sentenceIds.length || resolved.length !== sentenceIds.length) return null;
      return {
        evidenceSetId: String(set.evidence_set_id || ''),
        sentenceIds,
        text: resolved.join(' '),
        spanNote: typeof set.optional_span_note === 'string' ? set.optional_span_note : '',
        verificationStatus: String(set.verification_status || semanticQuestion.analysis_verification_status || '')
      };
    })
    .filter(Boolean);

  const taskTokens = semanticVerified
    ? [...findEnumTokens(semanticQuestion.question_task, QUESTION_TASKS)]
    : [];
  const optionDiagnosis = {};
  if (semanticVerified && semanticQuestion.option_diagnosis && typeof semanticQuestion.option_diagnosis === 'object') {
    labels.forEach((label) => {
      const diagnoses = optionDiagnosisForLabel(semanticQuestion.option_diagnosis, label);
      if (diagnoses.length) optionDiagnosis[label] = diagnoses;
    });
  }

  if (!minimalEvidence.length && !taskTokens.length && !Object.keys(optionDiagnosis).length) return null;
  return {
    questionTask: taskTokens[0] || '',
    minimalEvidence,
    optionDiagnosis,
    analysisVerificationStatus: String(semanticQuestion.analysis_verification_status || semanticQuestion.verification_status || '')
  };
}

let cache;

function objectiveTaskSections(manifest, taskName) {
  const map = manifest?.final_learner_objects?.objective_task_map;
  if (map?.schema !== 'kianos.english.objective_task_map.v1' || !map?.tasks || typeof map.tasks !== 'object') {
    throw new Error('READING_TASK_MAP_NOT_READY');
  }
  const task = map.tasks[taskName];
  const sections = Array.isArray(task?.sections)
    ? task.sections.map((value) => String(value || '').trim()).filter(Boolean)
    : [];
  if (!sections.length || new Set(sections).size !== sections.length) {
    throw new Error(`READING_TASK_IDENTITY_INVALID:${taskName}`);
  }
  return sections;
}

function snapshot() {
  if (cache) return cache;
  const gate = inspectReadingSources();
  if (gate.status !== 'ready') {
    cache = { status: gate.status, issues: gate.issues || [], missing: gate.missing || [] };
    return cache;
  }

  const manifestText = readText(SOURCE.manifest);
  const bankText = readText(SOURCE.questionBank);
  const corpusText = readText(SOURCE.readingCorpus);
  const manifest = JSON.parse(manifestText);
  const bank = JSON.parse(bankText);
  const corpus = JSON.parse(corpusText);
  const readingSections = new Set(objectiveTaskSections(manifest, 'reading_a'));
  const sets = (Array.isArray(bank.passage_or_sets) ? bank.passage_or_sets : [])
    .filter((row) => row?.id && readingSections.has(String(row?.section || '')))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));

  cache = {
    status: 'ready',
    manifest,
    bank,
    corpus,
    sets,
    semanticQuestions: semanticQuestionIndex(corpus),
    sourceHashes: {
      passageOwner: manifest.source_identity?.reading_corpus_sha256 || sha256(corpusText),
      questionOwner: manifest.source_identity?.question_bank_sha256 || sha256(bankText)
    }
  };
  return cache;
}

function setTitle(set) {
  return set?.context?.title || set?.title || set?.id || 'Reading';
}

function questionsForSet(data, setId) {
  return (Array.isArray(data.bank.questions_or_prompts) ? data.bank.questions_or_prompts : [])
    .filter((row) => row?.set_id === setId)
    .sort((a, b) => Number(a?.ordinal || 0) - Number(b?.ordinal || 0));
}

function passageForSet(data, setId) {
  return (Array.isArray(data.corpus.passages) ? data.corpus.passages : [])
    .find((row) => row?.passage_id === setId);
}

function attemptQuestion(question) {
  if (!question || typeof question !== 'object') return question;
  const { answer, ...clean } = question;
  return clean;
}

export function listReadingSets() {
  const data = snapshot();
  if (data.status !== 'ready') return [];
  return data.sets.map((set, index) => ({
    id: set.id,
    title: setTitle(set),
    paperId: set.paper_id || null,
    position: index + 1,
    total: data.sets.length
  }));
}

export function loadReadingById(readingId) {
  const data = snapshot();
  if (data.status !== 'ready') {
    throw new Error(`CURRENT_READING_SOURCE_NOT_READY:${data.status}:${[...(data.issues || []), ...(data.missing || [])].join(',')}`);
  }

  const index = data.sets.findIndex((row) => row.id === readingId);
  if (index < 0) throw new Error(`CURRENT_READING_SET_NOT_FOUND:${readingId}`);
  const set = data.sets[index];

  const sourceQuestions = questionsForSet(data, set.id);
  if (!sourceQuestions.length) throw new Error(`CURRENT_READING_QUESTIONS_NOT_FOUND:${set.id}`);
  const questions = sourceQuestions.map(attemptQuestion);

  const passage = passageForSet(data, set.id);

  let paragraphs = (Array.isArray(passage?.paragraphs) ? passage.paragraphs : [])
    .map((paragraph, paragraphIndex) => ({
      id: paragraph?.paragraph_id || paragraph?.id || `p${paragraphIndex + 1}`,
      text: compactParagraphText(paragraph)
    }))
    .filter((paragraph) => paragraph.text);

  if (!paragraphs.length) {
    const context = set.context || {};
    const fallback = Array.isArray(context.paragraphs)
      ? context.paragraphs
      : String(context.raw_text || context.text || '').split(/\n\s*\n/);
    paragraphs = fallback
      .map((paragraph, paragraphIndex) => ({
        id: `p${paragraphIndex + 1}`,
        text: compactParagraphText(paragraph)
      }))
      .filter((paragraph) => paragraph.text);
  }
  if (!paragraphs.length) throw new Error(`CURRENT_READING_PASSAGE_NOT_FOUND:${set.id}`);

  return {
    objectId: set.id,
    title: setTitle(set),
    paperId: set.paper_id || null,
    section: set.section,
    passage,
    paragraphs,
    questions,
    navigation: {
      position: index + 1,
      total: data.sets.length,
      previousId: index > 0 ? data.sets[index - 1].id : null,
      nextId: index < data.sets.length - 1 ? data.sets[index + 1].id : null
    },
    sourcePaths: {
      passage: SOURCE.readingCorpus,
      questions: SOURCE.questionBank,
      manifest: SOURCE.manifest
    },
    sourceHashes: {
      passageOwner: data.sourceHashes.passageOwner,
      questionOwner: data.sourceHashes.questionOwner,
      renderedObject: sha256(stableJson({ set, passage, questions: sourceQuestions }))
    },
    manifestStatus: data.manifest.status || ''
  };
}

export function loadReadingAnswersById(readingId) {
  const data = snapshot();
  if (data.status !== 'ready') throw new Error(`CURRENT_READING_SOURCE_NOT_READY:${data.status}`);
  const set = data.sets.find((row) => row.id === readingId);
  if (!set) throw new Error(`CURRENT_READING_SET_NOT_FOUND:${readingId}`);
  const answers = {};

  questionsForSet(data, set.id).forEach((question) => {
    const id = String(question?.id || question?.question_id || '');
    if (!id) return;
    answers[id] = question?.answer ?? '';
  });

  return {
    schema: 'kianos.english.reading_answers.v1',
    objectId: set.id,
    answers
  };
}

export function loadReadingReviewById(readingId) {
  const data = snapshot();
  if (data.status !== 'ready') throw new Error(`CURRENT_READING_SOURCE_NOT_READY:${data.status}`);
  const set = data.sets.find((row) => row.id === readingId);
  if (!set) throw new Error(`CURRENT_READING_SET_NOT_FOUND:${readingId}`);
  const passage = passageForSet(data, set.id);
  const questions = questionsForSet(data, set.id);
  const projected = {};

  questions.forEach((question) => {
    const id = String(question?.id || question?.question_id || '');
    if (!id) return;
    const labels = question?.options && typeof question.options === 'object'
      ? Object.keys(question.options).map(String)
      : ['A', 'B', 'C', 'D'];
    const review = projectReviewQuestion(data.semanticQuestions.get(id), passage, labels);
    if (review) projected[id] = review;
  });

  return {
    schema: 'kianos.english.reading_review_projection.v1',
    objectId: set.id,
    questions: projected
  };
}

export function loadDefaultReading() {
  const items = listReadingSets();
  if (!items.length) {
    const data = snapshot();
    throw new Error(`CURRENT_READING_SOURCE_NOT_READY:${data.status}`);
  }
  const preferred = process.env.KIANOS_READING_SET_ID;
  const selected = preferred && items.some((item) => item.id === preferred)
    ? preferred
    : items[0].id;
  return loadReadingById(selected);
}
