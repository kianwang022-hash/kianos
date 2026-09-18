import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const SOURCES = Object.freeze({
  root: 'CURRENT.md',
  xizong: 'content/xizong/CURRENT.md',
  xizongProgram: 'content/xizong/CONTENT_MAINLINE.md',
  english: 'content/english/CURRENT.md',
  politics: 'content/politics/CURRENT.md',
  lexical: 'content/lexical/CURRENT.md'
});

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function clean(value = '') {
  return String(value)
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function field(text, labels) {
  for (const label of labels) {
    const match = text.match(new RegExp(`\\*\\*${escapeRegExp(label)}:\\*\\*\\s*([^\\n]+)`, 'i'));
    if (match) return clean(match[1]);
  }
  return '';
}

function section(text, heading) {
  const match = text.match(new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$([\\s\\S]*?)(?=^##\\s+|\\Z)`, 'm'));
  return match ? match[1].trim() : '';
}

function firstParagraph(text) {
  return clean(String(text || '').split(/\n\s*\n/).find(part => part.trim() && !part.trim().startsWith('```')) || '');
}

function markdownTable(sectionText) {
  const rows = [];
  for (const raw of String(sectionText || '').split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('|') || /^\|\s*-/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map(clean);
    if (cells.length < 3 || /^program$/i.test(cells[0])) continue;
    rows.push(cells);
  }
  return rows;
}

function activeProgramRows(rootText) {
  return markdownTable(section(rootText, 'Active programs')).map(([name, state, continueFrom]) => ({
    name,
    state,
    continueFrom
  }));
}

function rootRole(rootText) {
  const match = rootText.match(/Role:\s*\*\*([^*]+)\*\*/i);
  return clean(match?.[1] || 'Control Tower + root router');
}

function firstCodeLineAfter(text, phrase) {
  const index = String(text || '').indexOf(phrase);
  if (index < 0) return '';
  const tail = String(text).slice(index);
  const match = tail.match(/```text\s*\n([\s\S]*?)```/);
  if (!match) return '';
  return clean(match[1].split('\n').find(line => line.trim()) || '');
}

function programRow(rows, matcher) {
  return rows.find(row => matcher.test(row.name)) || null;
}

function laneSnapshot({ id, label, row, text: laneText, stateHeading, source, fallbackNext }) {
  const state = clean(row?.state || 'router-only');
  const blocked = /\bBLOCKED\b|阻塞/i.test(state);
  return {
    id,
    label,
    active: state,
    engineering: firstParagraph(section(laneText, stateHeading)) || '按该科 Current 路由维护',
    learner: 'Learner Truth 仅来自私有真实学习 / runtime evidence',
    blocker: blocked ? state : 'none',
    next: fallbackNext || (row ? `按 ${row.name} Current 继续` : '按该科 Current 继续'),
    source
  };
}

function lexicalTruth(text) {
  const match = text.match(/## Current truth\s*\n\s*```text\s*\n([\s\S]*?)```/);
  const rows = {};
  if (!match) return rows;
  for (const raw of match[1].split('\n')) {
    const line = raw.trim();
    if (!line || !line.includes(':')) continue;
    const index = line.indexOf(':');
    rows[clean(line.slice(0, index))] = clean(line.slice(index + 1));
  }
  return rows;
}

function xizongProgram(text) {
  const priority = text.match(/^##\s+([^\n]+—\s*ACTIVE PRIORITY)\s*$/m);
  const activeBranch = text.match(/The active medical-content branch is:\s*\n\s*`([^`]+)`/);
  const phase = text.match(/Current Content stage is ([^.\n]+)[.\n]/);
  return {
    priority: clean(priority?.[1] || ''),
    phase: clean(phase?.[1] || ''),
    branch: clean(activeBranch?.[1] || '')
  };
}

export function buildMissionControlSnapshot() {
  const rootText = read(SOURCES.root);
  const xizongText = read(SOURCES.xizong);
  const xizongProgramText = read(SOURCES.xizongProgram);
  const englishText = read(SOURCES.english);
  const politicsText = read(SOURCES.politics);
  const lexicalText = read(SOURCES.lexical);

  const rows = activeProgramRows(rootText);
  const xProgram = xizongProgram(xizongProgramText);
  const activeRows = rows.filter(row => /\bACTIVE\b/i.test(row.state));
  const blockedRows = rows.filter(row => /\bBLOCKED\b|阻塞/i.test(row.state));

  const xRow = programRow(rows, /Xizong Content/i);
  const eRow = programRow(rows, /English Content/i);
  const pRow = programRow(rows, /Politics Content/i);
  const lRow = programRow(rows, /Lexical backend Content/i);

  const xNext = firstCodeLineAfter(xizongProgramText, 'Required sequence now:')
    || '按 Xizong Content Mainline 的 active branch / exact cursor 继续';

  return {
    project: {
      active: activeRows.length ? activeRows.map(row => row.name).join(' / ') : 'router-only',
      stage: rootRole(rootText),
      blocker: blockedRows.length ? blockedRows.map(row => row.name).join(' / ') : 'none',
      next: activeRows.length ? `继续：${activeRows.map(row => row.name).join(' / ')}` : '按各 program Current 继续',
      source: SOURCES.root
    },
    lanes: [
      {
        ...laneSnapshot({
          id: 'xizong',
          label: '西综',
          row: xRow,
          text: xizongText,
          stateHeading: 'Current state',
          source: SOURCES.xizong,
          fallbackNext: xNext
        }),
        active: xProgram.priority || clean(xRow?.state || 'router-only'),
        engineering: xProgram.phase || firstParagraph(section(xizongText, 'Current state')) || '按各 System Current 推进',
        detailSource: SOURCES.xizongProgram
      },
      laneSnapshot({
        id: 'english',
        label: '英语',
        row: eRow,
        text: englishText,
        stateHeading: 'Current engineering state',
        source: SOURCES.english,
        fallbackNext: '真实学习优先；工程只修 concrete learner-visible defect'
      }),
      laneSnapshot({
        id: 'politics',
        label: '政治',
        row: pRow,
        text: politicsText,
        stateHeading: 'Current state',
        source: SOURCES.politics,
        fallbackNext: '正常 learner use 优先；只按 concrete defect reopen 最小 owner'
      }),
      laneSnapshot({
        id: 'lexical',
        label: 'Lexical',
        row: lRow,
        text: lexicalText,
        stateHeading: 'Current state',
        source: SOURCES.lexical,
        fallbackNext: firstParagraph(section(lexicalText, 'Exact next action')) || '真实 learner use'
      })
    ]
  };
}
