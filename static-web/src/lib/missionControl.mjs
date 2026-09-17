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
  const lex = lexicalTruth(lexicalText);
  const xProgram = xizongProgram(xizongProgramText);

  return {
    project: {
      active: field(rootText, ['Active scope']) || 'router-only',
      stage: field(rootText, ['Current stage']),
      blocker: field(rootText, ['Blocker']) || 'none',
      next: field(rootText, ['Next action']),
      source: SOURCES.root
    },
    lanes: [
      {
        id: 'xizong',
        label: '西综',
        active: xProgram.priority || field(xizongText, ['Active lane-level scope']),
        engineering: xProgram.phase || '按各 System Current 推进',
        learner: '真实学习进度只来自私有 learner evidence',
        blocker: field(xizongText, ['Blocker']) || 'none',
        next: field(xizongText, ['Next action']),
        source: SOURCES.xizong,
        detailSource: SOURCES.xizongProgram
      },
      {
        id: 'english',
        label: '英语',
        active: field(englishText, ['Active lane-level scope']) || 'router-only',
        engineering: field(englishText, ['Module engineering state']),
        learner: field(englishText, ['Learner state']),
        blocker: field(englishText, ['Blocker']) || 'none',
        next: field(englishText, ['Next action']),
        source: SOURCES.english
      },
      {
        id: 'politics',
        label: '政治',
        active: field(politicsText, ['Current product task']) || field(politicsText, ['Learning-engineering scope']),
        engineering: field(politicsText, ['Learning-engineering scope']),
        learner: '五科 S/K/L/P/R/E 已收口；U 仍需真实使用',
        blocker: field(politicsText, ['Learning blocker']) || 'none',
        next: field(politicsText, ['Learning next action']),
        source: SOURCES.politics
      },
      {
        id: 'lexical',
        label: 'Lexical',
        active: lex['active Lexical engineering gate'] || 'NONE',
        engineering: [
          lex['full-catalog K acceptance'],
          lex['Projection acceptance'],
          lex['Runtime acceptance'],
          lex['Evidence acceptance']
        ].filter(Boolean).join(' · '),
        learner: lex['Learner validation'] || '',
        blocker: lex['active Lexical engineering gate'] === 'NONE' ? 'none' : lex['active Lexical engineering gate'],
        next: firstParagraph(section(lexicalText, 'Exact next action')),
        source: SOURCES.lexical
      }
    ]
  };
}
