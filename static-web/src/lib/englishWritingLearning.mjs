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

function extractCoreIntro(markdown) {
  const lines = linesOf(markdown);
  const start = lines.findIndex((line) => /^# B｜/.test(line));
  const end = lines.findIndex((line, index) => index > start && /^# B1｜/.test(line));
  if (start < 0 || end < 0) throw new Error('WRITING_CORE_ROUTE_MISSING');
  return lines.slice(start, end).join('\n').trim();
}

function titleFrom(markdown, fallback) {
  const first = linesOf(markdown).find((line) => /^#{1,6}\s+/.test(line));
  if (!first) return fallback;
  return first.replace(/^#{1,6}\s+/, '').trim();
}

function splitActiveChecks(markdown, blockId) {
  const lines = linesOf(markdown);
  const segments = [];
  let cursor = 0;
  let checkIndex = 0;
  let currentGate = null;

  while (cursor < lines.length) {
    const activeIndex = lines.findIndex((line, index) => index >= cursor && /^###\s+Active Check\s*$/.test(line.trim()));
    if (activeIndex < 0) {
      const tail = lines.slice(cursor).join('\n').trim();
      if (tail) segments.push({ type: 'content', markdown: tail, requires: currentGate });
      break;
    }

    const before = lines.slice(cursor, activeIndex).join('\n').trim();
    if (before) segments.push({ type: 'content', markdown: before, requires: currentGate });

    let activeEnd = lines.length;
    for (let index = activeIndex + 1; index < lines.length; index += 1) {
      const level = headingLevel(lines[index]);
      if (level !== null && level <= 3) {
        activeEnd = index;
        break;
      }
    }

    checkIndex += 1;
    const checkId = `${blockId}-check-${checkIndex}`;
    const checkMarkdown = lines.slice(activeIndex, activeEnd).join('\n').trim();
    segments.push({
      type: 'active_check',
      id: checkId,
      markdown: checkMarkdown,
      requires: currentGate
    });
    currentGate = checkId;
    cursor = activeEnd;
  }

  return segments;
}

function coreBlock(markdown, number) {
  const id = `b${number}`;
  const raw = extractTopLevel(markdown, new RegExp(`^# B${number}｜`));
  const segments = splitActiveChecks(raw, id);
  const lastSegment = segments.at(-1);
  return {
    id,
    number,
    title: titleFrom(raw, `B${number}`),
    markdown: raw,
    segments,
    terminalCheckId: lastSegment?.type === 'active_check' ? lastSegment.id : null
  };
}

function validateProjection(projection) {
  const issues = [];
  if (!projection.globalMap.includes('TASK') || !projection.globalMap.includes('GENERATE') || !projection.globalMap.includes('DELIVER')) {
    issues.push('GLOBAL_MAP_CHAIN_INCOMPLETE');
  }
  if (projection.blocks.length !== 8) issues.push(`CORE_BLOCK_COUNT:${projection.blocks.length}`);
  const ids = projection.blocks.map((block) => block.id).join('|');
  if (ids !== 'b1|b2|b3|b4|b5|b6|b7|b8') issues.push(`CORE_BLOCK_ORDER:${ids}`);
  if (projection.activeCheckCount < 6) issues.push(`ACTIVE_CHECK_COVERAGE:${projection.activeCheckCount}`);
  for (const block of projection.blocks) {
    const activeChecks = block.segments.filter((segment) => segment.type === 'active_check');
    const covered = new Set(block.segments.filter((segment) => segment.requires).map((segment) => segment.requires));
    if (block.terminalCheckId) covered.add(block.terminalCheckId);
    for (const check of activeChecks) {
      if (!covered.has(check.id)) issues.push(`ACTIVE_CHECK_HAS_NO_POST_ACTION:${check.id}`);
    }
  }
  if (!/one synthetic Small Writing/i.test(projection.syntheticFullGate) || !/one synthetic Big Writing/i.test(projection.syntheticFullGate)) {
    issues.push('FULL_SYNTHETIC_GATE_INCOMPLETE');
  }
  if (!/True-Exam Entry Gate/i.test(projection.trueExamEntryGate)) issues.push('TRUE_EXAM_ENTRY_GATE_MISSING');
  if (!/Skill Map/i.test(projection.skillMap)) issues.push('SKILL_MAP_MISSING');
  return issues;
}

let cache;

export function loadWritingLearningProjection() {
  if (cache) return cache;
  const markdown = readSource();
  const blocks = Array.from({ length: 8 }, (_, index) => coreBlock(markdown, index + 1));
  const projection = {
    schema: 'kianos.english.writing.first-learning-projection.v1',
    sourcePath: WRITING_LEARNING_SOURCE,
    sourceHash: sha256(markdown),
    globalMap: extractTopLevel(markdown, /^# A｜/),
    coreIntro: extractCoreIntro(markdown),
    blocks,
    skillMap: extractTopLevel(markdown, /^# C｜/),
    syntheticFullGate: extractLevelTwo(markdown, /^## E12｜/),
    trueExamEntryGate: extractTopLevel(markdown, /^# I｜/),
    activeCheckCount: blocks.reduce((sum, block) => sum + block.segments.filter((segment) => segment.type === 'active_check').length, 0),
    route: ['global-map', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'synthetic-gate']
  };
  const issues = validateProjection(projection);
  cache = { ...projection, status: issues.length ? 'invalid' : 'ready', issues };
  return cache;
}
