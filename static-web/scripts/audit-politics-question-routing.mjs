import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const POLITICS = path.join(repoRoot, 'content/politics');
const regions = fs.readFileSync(path.join(POLITICS, 'source/politics_unified_regions.v1.jsonl'), 'utf8')
  .split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(JSON.parse);
const links = fs.readFileSync(path.join(POLITICS, 'source/question_knowledge_links.jsonl'), 'utf8')
  .split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(JSON.parse);

const SUBJECT = Object.freeze({
  marx: 'MARX',
  history: 'HISTORY',
  mao: 'MAO',
  xi: 'XI',
  ethics: 'ETHICS'
});

function canonicalQuestionId(sourceId) {
  const match = String(sourceId || '').match(/^xiao_2027_(marx|history|mao|xi|ethics)_(single|multiple)_(\d+)$/i);
  if (!match) return '';
  const subject = SUBJECT[match[1].toLowerCase()];
  const kind = match[2].toLowerCase() === 'single' ? 'S' : 'M';
  return `X1000-${subject}-${kind}-${String(Number(match[3])).padStart(3, '0')}`;
}

function regionChapter(row) {
  const match = String(row?.natural_unit_id || '').match(/-(?:MARX|HISTORY|MAO|XI|ETHICS)-C(\d{2})(?:-|$)/i);
  return match ? Number(match[1]) : null;
}

function chineseNumber(raw) {
  const text = String(raw || '').trim();
  if (/^\d+$/.test(text)) return Number(text);
  const digit = { 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  if (text === '十') return 10;
  const ten = text.indexOf('十');
  if (ten >= 0) {
    const tens = ten === 0 ? 1 : (digit[text[ten - 1]] ?? 0);
    const ones = ten === text.length - 1 ? 0 : (digit[text[ten + 1]] ?? 0);
    return tens * 10 + ones;
  }
  return text.length === 1 && text in digit ? digit[text] : null;
}

function linkChapter(row) {
  const chapter = String(row?.chapter || '').trim();
  if (!chapter) return null;
  if (/导论|绪论/.test(chapter)) return 0;
  const match = chapter.match(/第([零一二三四五六七八九十\d]+)章/);
  return match ? chineseNumber(match[1]) : null;
}

const owners = new Map();
for (const row of regions.filter((row) => row?.status === 'canonical')) {
  for (const questionId of row.xiao_question_refs || []) {
    if (!owners.has(questionId)) owners.set(questionId, []);
    owners.get(questionId).push({
      natural_unit_id: row.natural_unit_id,
      title: row.title,
      chapter: regionChapter(row)
    });
  }
}

const comparable = [];
const mismatches = [];
const unlinked = [];
const unknownChapter = [];

for (const link of links) {
  const canonicalId = canonicalQuestionId(link.question_id);
  if (!canonicalId) continue;
  const expectedChapter = linkChapter(link);
  const currentOwners = owners.get(canonicalId) || [];
  if (!currentOwners.length) {
    unlinked.push({
      question_id: canonicalId,
      source_question_id: link.question_id,
      subject: link.subject,
      expected_chapter: expectedChapter,
      knowledge_title: link.knowledge_title || '',
      mapping_confidence: link.mapping_confidence || '',
      mapping_method: link.mapping_method || '',
      xiao_mapping_status: link.xiao_mapping_status || ''
    });
    continue;
  }
  if (expectedChapter == null) {
    unknownChapter.push({ question_id: canonicalId, chapter: link.chapter || '', owners: currentOwners });
    continue;
  }
  comparable.push(canonicalId);
  if (!currentOwners.some((owner) => owner.chapter === expectedChapter)) {
    mismatches.push({
      question_id: canonicalId,
      source_question_id: link.question_id,
      subject: link.subject,
      expected_chapter: expectedChapter,
      link_chapter: link.chapter || '',
      knowledge_title: link.knowledge_title || '',
      mapping_confidence: link.mapping_confidence || '',
      mapping_method: link.mapping_method || '',
      xiao_mapping_status: link.xiao_mapping_status || '',
      current_owners: currentOwners
    });
  }
}

const report = {
  linkedCanonicalQuestionIds: owners.size,
  linkRows: links.length,
  comparableLinkRows: comparable.length,
  chapterMismatchCount: mismatches.length,
  unlinkedTrainingQuestionCount: unlinked.length,
  unknownChapterCount: unknownChapter.length,
  chapterMismatches: mismatches,
  unlinkedTrainingQuestions: unlinked,
  unknownChapterRows: unknownChapter
};

console.log('POLITICS_QUESTION_ROUTING_AUDIT');
console.log(JSON.stringify(report, null, 2));
