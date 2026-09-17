import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const CURRENT = Object.freeze({
  lexicalAnswer: 'content/lexical/words/answer.json',
  englishManifest: 'content/english/manifest.json',
  englishQuestionBank: 'content/english/source/question_bank.v1.json',
  englishReadingCorpus: 'content/english/source/reading_corpus.v1.json',
  englishGlobalSourceTruth: 'content/english/source/global_source_truth.v1.json'
});

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

function sourceTruthParagraphs(sourceTruth) {
  const explicit = Array.isArray(sourceTruth?.paragraphs)
    ? sourceTruth.paragraphs.map(compactParagraphText).filter(Boolean)
    : [];
  if (explicit.length) return explicit;
  const sourceText = String(sourceTruth?.source_text || '').trim();
  if (!sourceText) return [];
  return sourceText
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function applyQuestionOverlay(question, sourceTruth) {
  const replacement = sourceTruth?.question_overlays?.[String(question?.id || question?.question_id || '')] || {};
  return {
    ...question,
    ...(replacement.prompt ? { prompt: replacement.prompt } : {}),
    ...(replacement.options ? { options: replacement.options } : {})
  };
}

const ENGLISH_REQUIRED = Object.freeze([
  CURRENT.englishManifest,
  CURRENT.englishQuestionBank,
  CURRENT.englishReadingCorpus,
  CURRENT.englishGlobalSourceTruth
]);

let englishSnapshotCache;

function buildEnglishSnapshot() {
  const missing = ENGLISH_REQUIRED.filter((relativePath) => !fs.existsSync(absolute(relativePath)));
  if (missing.length) {
    return {
      status: 'missing',
      required: [...ENGLISH_REQUIRED],
      missing,
      issues: []
    };
  }

  try {
    const manifestText = readText(CURRENT.englishManifest);
    const bankText = readText(CURRENT.englishQuestionBank);
    const corpusText = readText(CURRENT.englishReadingCorpus);
    const globalSourceTruthText = readText(CURRENT.englishGlobalSourceTruth);
    const manifest = JSON.parse(manifestText);
    const bank = JSON.parse(bankText);
    const corpus = JSON.parse(corpusText);
    const globalSourceTruth = JSON.parse(globalSourceTruthText);
    const sourceIdentity = manifest.source_identity || {};
    const ownerPaths = manifest.owners || {};
    const owners = {
      question_bank: {
        owner_path: ownerPaths.question_bank || '',
        sha256: sourceIdentity.question_bank_sha256 || ''
      },
      reading_corpus: {
        owner_path: ownerPaths.reading_corpus || '',
        sha256: sourceIdentity.reading_corpus_sha256 || ''
      },
      global_source_truth: {
        owner_path: ownerPaths.global_source_truth || '',
        sha256: sourceIdentity.global_source_truth_sha256 || ''
      }
    };

    const actualHashes = {
      question_bank: sha256(bankText),
      reading_corpus: sha256(corpusText),
      global_source_truth: sha256(globalSourceTruthText)
    };
    const expectedHashes = {
      question_bank: owners.question_bank.sha256,
      reading_corpus: owners.reading_corpus.sha256,
      global_source_truth: owners.global_source_truth.sha256
    };
    const issues = [];

    if (manifest.status !== 'CURRENT_READY') issues.push('MANIFEST_NOT_CURRENT_READY');
    if (manifest.readiness?.pass !== true) issues.push('MANIFEST_READINESS_NOT_PASSING');
    if (manifest.runtime_contract?.astro_reads_current_only !== true) issues.push('MANIFEST_ASTRO_CURRENT_ONLY_NOT_CONFIRMED');
    if (manifest.runtime_contract?.legacy_fallback !== false) issues.push('MANIFEST_LEGACY_FALLBACK_NOT_DISABLED');
    if (ownerPaths.question_bank !== CURRENT.englishQuestionBank) issues.push('MANIFEST_QUESTION_BANK_OWNER_MISMATCH');
    if (ownerPaths.reading_corpus !== CURRENT.englishReadingCorpus) issues.push('MANIFEST_READING_CORPUS_OWNER_MISMATCH');
    if (ownerPaths.global_source_truth !== CURRENT.englishGlobalSourceTruth) issues.push('MANIFEST_GLOBAL_SOURCE_TRUTH_OWNER_MISMATCH');
    if (!expectedHashes.question_bank) issues.push('MANIFEST_QUESTION_BANK_HASH_MISSING');
    if (!expectedHashes.reading_corpus) issues.push('MANIFEST_READING_CORPUS_HASH_MISSING');
    if (!expectedHashes.global_source_truth) issues.push('MANIFEST_GLOBAL_SOURCE_TRUTH_HASH_MISSING');
    if (expectedHashes.question_bank && actualHashes.question_bank !== expectedHashes.question_bank) {
      issues.push('QUESTION_BANK_HASH_MISMATCH');
    }
    if (expectedHashes.reading_corpus && actualHashes.reading_corpus !== expectedHashes.reading_corpus) {
      issues.push('READING_CORPUS_HASH_MISMATCH');
    }
    if (expectedHashes.global_source_truth && actualHashes.global_source_truth !== expectedHashes.global_source_truth) {
      issues.push('GLOBAL_SOURCE_TRUTH_HASH_MISMATCH');
    }
    if (globalSourceTruth.status !== 'SOURCE_READY') issues.push('GLOBAL_SOURCE_TRUTH_NOT_READY');

    return {
      status: issues.length ? 'invalid' : 'ready',
      required: [...ENGLISH_REQUIRED],
      missing: [],
      issues,
      manifest,
      bank,
      corpus,
      globalSourceTruth,
      owners,
      actualHashes,
      expectedHashes
    };
  } catch (error) {
    return {
      status: 'invalid',
      required: [...ENGLISH_REQUIRED],
      missing: [],
      issues: [`SOURCE_READ_ERROR:${error instanceof Error ? error.message : String(error)}`]
    };
  }
}

function englishSnapshot() {
  englishSnapshotCache ||= buildEnglishSnapshot();
  return englishSnapshotCache;
}

export const buildRevision = process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA || 'local-build';

export function loadAnswer() {
  const bundle = readJson(CURRENT.lexicalAnswer);
  const record = bundle.record || bundle;
  if (record?.word_id !== 'word:answer') throw new Error('CURRENT_ANSWER_NOT_FOUND');
  return {
    objectId: record.word_id,
    ordinal: bundle.ordinal ?? 209,
    record,
    sourcePath: CURRENT.lexicalAnswer,
    sourceHash: record.content_hash || sha256(JSON.stringify(record)),
    shardEntries: [{
      objectId: record.word_id,
      ordinal: bundle.ordinal ?? 209,
      record,
      sourcePath: CURRENT.lexicalAnswer,
      sourceHash: record.content_hash || sha256(JSON.stringify(record))
    }]
  };
}

export function inspectReadingSources() {
  const snapshot = englishSnapshot();
  return {
    status: snapshot.status,
    required: [...snapshot.required],
    missing: [...snapshot.missing],
    issues: [...snapshot.issues],
    expectedHashes: { ...(snapshot.expectedHashes || {}) },
    actualHashes: { ...(snapshot.actualHashes || {}) }
  };
}

export function loadReading() {
  const snapshot = englishSnapshot();
  if (snapshot.status !== 'ready') {
    throw new Error(`CURRENT_READING_SOURCE_NOT_READY:${snapshot.status}:${snapshot.issues.join(',') || snapshot.missing.join(',')}`);
  }

  const { bank, corpus, globalSourceTruth, manifest, owners } = snapshot;
  const sets = Array.isArray(bank.passage_or_sets) ? bank.passage_or_sets : [];
  const preferredId = process.env.KIANOS_READING_SET_ID || 'english1-2000-reading-a-text1';
  const readingSets = sets
    .filter((row) => row?.section === 'reading_part_a')
    .sort((a, b) => String(a?.id || '').localeCompare(String(b?.id || '')));
  const set = sets.find((row) => row?.id === preferredId) || readingSets[0];
  if (!set?.id) throw new Error('CURRENT_READING_SET_NOT_FOUND');

  const sourceQuestions = (Array.isArray(bank.questions_or_prompts) ? bank.questions_or_prompts : [])
    .filter((row) => row?.set_id === set.id)
    .sort((a, b) => Number(a?.ordinal || 0) - Number(b?.ordinal || 0));
  if (!sourceQuestions.length) throw new Error(`CURRENT_READING_QUESTIONS_NOT_FOUND:${set.id}`);

  const sourceTruth = globalSourceTruth?.units?.[set.id];
  if (!sourceTruth || sourceTruth.status !== 'SOURCE_READY') {
    throw new Error(`CURRENT_READING_SOURCE_TRUTH_NOT_READY:${set.id}`);
  }
  const questions = sourceQuestions.map((question) => applyQuestionOverlay(question, sourceTruth));

  const passage = (Array.isArray(corpus.passages) ? corpus.passages : [])
    .find((row) => row?.passage_id === set.id);

  let paragraphs = sourceTruthParagraphs(sourceTruth)
    .map((text, index) => ({ id: `p${index + 1}`, text }));

  if (!paragraphs.length) {
    paragraphs = (Array.isArray(passage?.paragraphs) ? passage.paragraphs : [])
      .map((paragraph, index) => ({
        id: paragraph?.paragraph_id || paragraph?.id || `p${index + 1}`,
        text: compactParagraphText(paragraph)
      }))
      .filter((paragraph) => paragraph.text);
  }

  if (!paragraphs.length) {
    const context = set.context || {};
    const fallback = Array.isArray(context.paragraphs)
      ? context.paragraphs
      : String(context.raw_text || context.text || '').split(/\n\s*\n/);
    paragraphs = fallback
      .map((paragraph, index) => ({ id: `p${index + 1}`, text: compactParagraphText(paragraph) }))
      .filter((paragraph) => paragraph.text);
  }
  if (!paragraphs.length) throw new Error(`CURRENT_READING_PASSAGE_NOT_FOUND:${set.id}`);

  return {
    objectId: set.id,
    title: set?.context?.title || set?.title || set.id,
    paperId: set.paper_id || null,
    section: set.section,
    passage,
    paragraphs,
    questions,
    sourceTruthStatus: sourceTruth.status,
    sourcePaths: {
      passage: CURRENT.englishReadingCorpus,
      questions: CURRENT.englishQuestionBank,
      sourceTruth: CURRENT.englishGlobalSourceTruth,
      manifest: CURRENT.englishManifest
    },
    sourceHashes: {
      passageOwner: owners.reading_corpus.sha256 || sha256(stableJson(passage || paragraphs)),
      questionOwner: owners.question_bank.sha256 || sha256(stableJson(sourceQuestions)),
      sourceTruthOwner: owners.global_source_truth.sha256 || sha256(stableJson(sourceTruth)),
      renderedObject: sha256(stableJson({ set, passage, sourceTruth, questions }))
    },
    manifestStatus: manifest.status || ''
  };
}
