import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const POLITICS = path.join(repoRoot, 'content/politics');
const regions = fs.readFileSync(path.join(POLITICS, 'source/politics_unified_regions.v1.jsonl'), 'utf8')
  .split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(JSON.parse);
const legacyLinks = fs.readFileSync(path.join(POLITICS, 'source/question_knowledge_links.jsonl'), 'utf8')
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

function legacyClaimedChapter(row) {
  const chapter = String(row?.chapter || '').trim();
  if (!chapter) return null;
  if (/导论|绪论/.test(chapter)) return 0;
  const match = chapter.match(/第([零一二三四五六七八九十\d]+)章/);
  return match ? chineseNumber(match[1]) : null;
}

// Current unified-region ownership is the semantic authority.
const currentOwners = new Map();
for (const row of regions.filter((row) => row?.status === 'canonical')) {
  for (const questionId of row.xiao_question_refs || []) {
    if (!currentOwners.has(questionId)) currentOwners.set(questionId, []);
    currentOwners.get(questionId).push({
      natural_unit_id: row.natural_unit_id,
      region_id: row.unified_region_id,
      title: row.title,
      chapter: regionChapter(row)
    });
  }
}

// Legacy question_knowledge_links is inspected only as historical provenance.
// A disagreement is evidence that the legacy row is stale/wrong; it is NOT a reason
// to mutate Current ownership or Question Repair semantics.
const disagreements = [];
const legacyRowsWithoutCurrentOwner = [];
const legacyRowsWithoutChapter = [];
let comparableLegacyRows = 0;

for (const legacy of legacyLinks) {
  const canonicalId = canonicalQuestionId(legacy.question_id);
  if (!canonicalId) continue;
  const claimedChapter = legacyClaimedChapter(legacy);
  const owners = currentOwners.get(canonicalId) || [];

  if (!owners.length) {
    legacyRowsWithoutCurrentOwner.push({
      question_id: canonicalId,
      source_question_id: legacy.question_id,
      legacy_claimed_chapter: claimedChapter,
      legacy_knowledge_title: legacy.knowledge_title || '',
      legacy_mapping_confidence: legacy.mapping_confidence || '',
      legacy_mapping_method: legacy.mapping_method || '',
      legacy_xiao_mapping_status: legacy.xiao_mapping_status || ''
    });
    continue;
  }

  if (claimedChapter == null) {
    legacyRowsWithoutChapter.push({
      question_id: canonicalId,
      legacy_chapter_text: legacy.chapter || '',
      current_owners: owners
    });
    continue;
  }

  comparableLegacyRows += 1;
  if (!owners.some((owner) => owner.chapter === claimedChapter)) {
    disagreements.push({
      classification: 'LEGACY_PROVENANCE_DISAGREES_WITH_CURRENT',
      question_id: canonicalId,
      source_question_id: legacy.question_id,
      legacy_claimed_chapter: claimedChapter,
      legacy_chapter_text: legacy.chapter || '',
      legacy_knowledge_title: legacy.knowledge_title || '',
      legacy_mapping_confidence: legacy.mapping_confidence || '',
      legacy_mapping_method: legacy.mapping_method || '',
      legacy_xiao_mapping_status: legacy.xiao_mapping_status || '',
      current_owners: owners
    });
  }
}

const report = {
  semanticAuthority: 'politics_unified_regions',
  legacyRole: 'PROVENANCE_ONLY_NO_SEMANTIC_AUTHORITY',
  linkedCurrentQuestionIds: currentOwners.size,
  legacyLinkRows: legacyLinks.length,
  comparableLegacyRows,
  legacyDisagreementCount: disagreements.length,
  legacyRowsWithoutCurrentOwnerCount: legacyRowsWithoutCurrentOwner.length,
  legacyRowsWithoutChapterCount: legacyRowsWithoutChapter.length,
  legacyDisagreements: disagreements,
  legacyRowsWithoutCurrentOwner,
  legacyRowsWithoutChapter
};

console.log('POLITICS_QUESTION_ROUTING_AUDIT');
console.log(JSON.stringify(report, null, 2));
