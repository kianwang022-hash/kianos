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

let cache;

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
  const sets = (Array.isArray(bank.passage_or_sets) ? bank.passage_or_sets : [])
    .filter((row) => row?.section === 'reading_part_a' && row?.id)
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));

  cache = {
    status: 'ready',
    manifest,
    bank,
    corpus,
    sets,
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

  const questions = (Array.isArray(data.bank.questions_or_prompts) ? data.bank.questions_or_prompts : [])
    .filter((row) => row?.set_id === set.id)
    .sort((a, b) => Number(a?.ordinal || 0) - Number(b?.ordinal || 0));
  if (!questions.length) throw new Error(`CURRENT_READING_QUESTIONS_NOT_FOUND:${set.id}`);

  const passage = (Array.isArray(data.corpus.passages) ? data.corpus.passages : [])
    .find((row) => row?.passage_id === set.id);

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
      renderedObject: sha256(stableJson({ set, passage, questions }))
    },
    manifestStatus: data.manifest.status || ''
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
