import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

function readJsonl(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(JSON.parse);
}

const sourceRows = readJsonl('content/politics/source/source_node_registry.v2.jsonl');
const questions = readJsonl('content/politics/source/xiao_2027_questions.jsonl');
const legacy = readJsonl('content/politics/source/question_knowledge_links.jsonl');

const pilotIds = ['POL27-CF-MARX-C02-K03', 'POL27-REGION-PILOT-MARX-REG-01'];
const sourceMatches = sourceRows.filter((row) => {
  const text = JSON.stringify(row);
  return pilotIds.some((id) => text.includes(id));
});

const terms = ['矛盾', '同一性', '斗争性', '普遍性', '特殊性', '共性', '个性', '主要矛盾', '主要方面', '一分为二', '对立面', '转化'];
const questionMatches = questions
  .filter((row) => /xiao_2027_marx_/i.test(String(row?.question_id || row?.source_question_id || row?.id || '')))
  .map((row) => {
    const text = JSON.stringify(row);
    const hits = terms.filter((term) => text.includes(term));
    return { row, hits };
  })
  .filter(({ hits }) => hits.length > 0)
  .map(({ row, hits }) => ({
    question_id: row.question_id || row.source_question_id || row.id || '',
    hits,
    stem: row.stem || row.question || row.prompt || row.question_text || '',
    options: row.options || row.choices || null,
    answer: row.answer || row.correct_answer || row.canonical_answer || '',
    explanation: row.explanation || row.analysis || row.original_explanation || ''
  }));

const legacyMatches = legacy.filter((row) => {
  const text = JSON.stringify(row);
  return /xiao_2027_marx_/i.test(String(row?.question_id || '')) && terms.some((term) => text.includes(term));
}).map((row) => ({
  question_id: row.question_id,
  chapter: row.chapter,
  knowledge_title: row.knowledge_title,
  mapping_confidence: row.mapping_confidence,
  mapping_method: row.mapping_method
}));

console.log('POLITICS_K03_PILOT_AUDIT');
console.log(JSON.stringify({
  sourceMatches,
  semanticQuestionCandidates: questionMatches,
  legacyProvenanceCandidates: legacyMatches
}, null, 2));
