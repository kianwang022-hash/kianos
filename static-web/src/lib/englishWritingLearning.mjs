import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

export const WRITING_LEARNING_SOURCE = 'content/english/modules/writing/learning.md';

function sourcePath() {
  return path.join(repoRoot, WRITING_LEARNING_SOURCE);
}

function readSource() {
  return fs.readFileSync(sourcePath(), 'utf8');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function linesOf(markdown) {
  return markdown.replace(/\r\n/g, '\n').split('\n');
}

function headingLevel(line) {
  const match = /^(#{1,6})\s+/.exec(line);
  return match ? match[1].length : null;
}

function extractTopLevel(markdown, startPattern) {
  const lines = linesOf(markdown);
  const start = lines.findIndex((line) => startPattern.test(line));
  if (start < 0) throw new Error(`WRITING_LEARNING_SECTION_MISSING:${startPattern}`);
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (headingLevel(lines[index]) === 1) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join('\n').trim();
}

function extractCoreIntro(markdown) {
  const lines = linesOf(markdown);
  const start = lines.findIndex((line) => /^# B｜/.test(line));
  const end = lines.findIndex((line, index) => index > start && /^## B1｜/.test(line));
  if (start < 0 || end < 0) throw new Error('WRITING_CORE_ROUTE_MISSING');
  return lines.slice(start, end).join('\n').trim();
}

function extractLevelTwo(markdown, startPattern) {
  const lines = linesOf(markdown);
  const start = lines.findIndex((line) => startPattern.test(line));
  if (start < 0) throw new Error(`WRITING_LEARNING_SUBSECTION_MISSING:${startPattern}`);
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    const level = headingLevel(lines[index]);
    if (level !== null && level <= 2) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join('\n').trim();
}

function titleFrom(markdown, fallback) {
  const first = linesOf(markdown).find((line) => /^#{1,6}\s+/.test(line));
  return first ? first.replace(/^#{1,6}\s+/, '').trim() : fallback;
}

function coreBlock(markdown, number) {
  const raw = extractLevelTwo(markdown, new RegExp(`^## B${number}｜`));
  return {
    id: `b${number}`,
    number,
    title: titleFrom(raw, `B${number}`),
    markdown: raw,
    segments: [{ type: 'content', markdown: raw, requires: null }],
    terminalCheckId: null
  };
}

function validateProjection(projection) {
  const issues = [];
  const global = projection.globalMap;
  for (const token of ['TASK', 'CONTENT GENERATION', 'ORGANIZATION', 'ENGLISH REALIZATION', 'REGISTER', 'TIMED DELIVERY']) {
    if (!global.includes(token)) issues.push(`GLOBAL_MAP_PRIMITIVE_MISSING:${token}`);
  }
  if (projection.blocks.length !== 6) issues.push(`CORE_PRIMITIVE_COUNT:${projection.blocks.length}`);
  const ids = projection.blocks.map((block) => block.id).join('|');
  if (ids !== 'b1|b2|b3|b4|b5|b6') issues.push(`CORE_PRIMITIVE_ORDER:${ids}`);
  if (!/Small Writing/.test(projection.modeSpecializations) || !/Big Writing/.test(projection.modeSpecializations)) {
    issues.push('TASK_MODE_SPECIALIZATION_INCOMPLETE');
  }
  if (!/Skill Map/.test(projection.skillMap)) issues.push('SKILL_MAP_MISSING');
  if (!/Synthetic Practice/.test(projection.syntheticPractice)) issues.push('SYNTHETIC_PRACTICE_MISSING');
  if (!/True-Exam Entry/.test(projection.trueExamEntryGate)) issues.push('TRUE_EXAM_ENTRY_GATE_MISSING');
  return issues;
}

let cache;

export function loadWritingLearningProjection() {
  if (cache) return cache;
  const markdown = readSource();
  const blocks = Array.from({ length: 6 }, (_, index) => coreBlock(markdown, index + 1));
  const projection = {
    schema: 'kianos.english.writing.first-learning-projection.v2',
    sourcePath: WRITING_LEARNING_SOURCE,
    sourceHash: sha256(markdown),
    globalMap: extractTopLevel(markdown, /^# A｜/),
    coreIntro: extractCoreIntro(markdown),
    blocks,
    modeSpecializations: extractTopLevel(markdown, /^# C｜/),
    skillMap: extractTopLevel(markdown, /^# D｜/),
    syntheticPractice: extractTopLevel(markdown, /^# E｜/),
    syntheticFullGate: extractTopLevel(markdown, /^# E｜/),
    trueExamEntryGate: extractTopLevel(markdown, /^# I｜/),
    activeCheckCount: 0,
    route: ['global-map', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'modes', 'practice']
  };
  const issues = validateProjection(projection);
  cache = { ...projection, status: issues.length ? 'invalid' : 'ready', issues };
  return cache;
}
