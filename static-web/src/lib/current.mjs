import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const CURRENT = Object.freeze({
  b1: 'content/xizong/knowledge/systems/a1-circulation/blocks/Block1_正常机械循环_学习阅读版_v7_最终执行版.md',
  lexicalAnswer: 'content/lexical/words/answer.json'
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

function extractCenterQuestion(markdown) {
  const match = String(markdown).match(/^>\s*\*\*中心问题\*\*[：:]\s*(.+)$/m);
  return match?.[1]?.trim() || '';
}

function h2Sections(markdown) {
  const headings = [...String(markdown).matchAll(/^##\s+(.+)$/gm)];
  return headings.map((match, index) => {
    const start = match.index || 0;
    const end = headings[index + 1]?.index ?? markdown.length;
    const body = markdown.slice(start, end).trim();
    return {
      sectionId: `section-${index + 1}`,
      title: String(match[1] || '').trim(),
      markdown: body,
      kpIds: [...body.matchAll(/^###\s+(KP\d+)[｜|]/gm)].map((row) => row[1])
    };
  });
}

function kpRecords(markdown, sections) {
  const matches = [...String(markdown).matchAll(/^###\s+(KP\d+)[｜|]\s*(.+)$/gm)];
  return matches.map((match, index) => {
    const start = match.index || 0;
    const nextKp = matches[index + 1]?.index ?? markdown.length;
    const nextH2Relative = markdown.slice(start + match[0].length).search(/^##\s+/m);
    const nextH2 = nextH2Relative >= 0 ? start + match[0].length + nextH2Relative : markdown.length;
    const end = Math.min(nextKp, nextH2);
    const sectionMarkdown = markdown.slice(start, end).trim();
    const promptMatch = sectionMarkdown.match(/^>\s*\*\*主提示\*\*[：:]\s*(.+)$/m);
    const detailMarker = sectionMarkdown.search(/^####\s+详细展开\s*$/m);
    const detailMarkdown = detailMarker >= 0
      ? sectionMarkdown.slice(detailMarker).replace(/^####\s+详细展开\s*\n?/, '').trim()
      : sectionMarkdown.replace(/^###\s+.+\n?/, '').trim();
    const parent = [...sections].reverse().find((section) => section.markdown.includes(match[0]));
    return {
      kpId: match[1],
      title: String(match[2] || '').trim(),
      prompt: promptMatch?.[1]?.trim() || '',
      groupTitle: parent?.title || '',
      markdown: sectionMarkdown,
      detailMarkdown
    };
  });
}

export const buildRevision = process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA || 'local-build';

export function loadB1() {
  const markdown = readText(CURRENT.b1);
  const sections = h2Sections(markdown);
  const firstSectionIndex = String(markdown).search(/^##\s+/m);
  const orientationMarkdown = firstSectionIndex >= 0 ? markdown.slice(0, firstSectionIndex).trim() : markdown;
  const records = kpRecords(markdown, sections);
  return {
    objectId: 'xizong:a1:block1',
    title: 'B1 · 正常机械循环',
    centerQuestion: extractCenterQuestion(markdown),
    orientationMarkdown,
    sections,
    kpRecords: records,
    kpCount: records.length,
    markdown,
    sourcePath: CURRENT.b1,
    sourceHash: sha256(markdown)
  };
}

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

export const migrationStatus = Object.freeze({
  xizong: 'ready',
  lexical: 'ready',
  english: 'pending-full-source-transfer',
  politics: 'pending-full-source-transfer'
});
