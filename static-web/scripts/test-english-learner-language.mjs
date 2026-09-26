import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { listReadingSets } from '../src/lib/englishReading.mjs';
import { listClozeSets, listReadingBSets } from '../src/lib/englishObjective.mjs';
import { listTranslationSets } from '../src/lib/englishTranslation.mjs';
import { listWritingRuntimeTasks } from '../src/lib/englishWritingRuntimeSourceTruth.mjs';
import { listEnglishExamPapers } from '../src/lib/englishExamPaper.mjs';
import { listLexicalWordSummaries } from '../src/lib/lexical.mjs';

const BASE = 'http://127.0.0.1:4482';
const auditDir = path.resolve(process.cwd(), '../english-language-audit');
fs.mkdirSync(auditDir, { recursive: true });

const forbidden = [
  'Canonical projection',
  'Current provenance',
  'Runtime boundary',
  'KIANOS_',
  'sha256:',
  'Private evidence ledger',
  'TRANSFER_PENDING',
  'REPAIR_COMPLETE',
  'Evidence ↔ Session',
  'CHAT CONTROL',
  'Whole-Essay Runtime',
  'Productive lane',
  'Translation · Current',
  'English · Translation Current',
  'English · Writing Current',
  'English · Current'
];

const checks = [];
function check(condition, name, detail = '') {
  if (!condition) throw new Error(`ENGLISH_LEARNER_LANGUAGE_FAIL:${name}${detail ? ':' + detail : ''}`);
  checks.push({ name, pass: true, detail });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('ENGLISH_LEARNER_LANGUAGE_PREVIEW_NOT_READY');
}

async function stopServer(server) {
  if (!server) return;
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGTERM'); } catch {}
    } else {
      try { server.kill('SIGTERM'); } catch {}
    }
    await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  }
  if (server.exitCode === null) {
    try { server.kill('SIGKILL'); } catch {}
  }
}

const reading = listReadingSets()[0];
const cloze = listClozeSets()[0];
const readingB = listReadingBSets()[0];
const translation = listTranslationSets()[0];
const writing = listWritingRuntimeTasks().find((item) => item?.sourceKind === 'synthetic');
const paper = listEnglishExamPapers()[0];
const lexicalWord = listLexicalWordSummaries()[0];

check(Boolean(reading?.id && cloze?.id && readingB?.id && translation?.id && writing?.id && paper?.paperId && lexicalWord?.ordinal), 'fixtures_available');

const routes = [
  ['english-home', '/english/'],
  ['objective-guide', '/objective-learn/'],
  ['reading-home', '/reading/'],
  ['reading-task', `/reading/${encodeURIComponent(reading.id)}/`],
  ['cloze-home', '/cloze/'],
  ['cloze-task', `/cloze/${encodeURIComponent(cloze.id)}/`],
  ['part-b-home', '/reading-b/'],
  ['part-b-task', `/reading-b/${encodeURIComponent(readingB.id)}/`],
  ['translation-home', '/translation/'],
  ['translation-guide', '/translation-learn/'],
  ['translation-task', `/translation/${encodeURIComponent(translation.id)}/`],
  ['writing-home', '/writing/'],
  ['writing-guide', '/writing-learn/'],
  ['writing-task', `/writing/${encodeURIComponent(writing.id)}/`],
  ['full-paper-index', '/english-exam/'],
  ['full-paper-overview', `/english-exam/${encodeURIComponent(paper.paperId)}/`],
  ['vocabulary-home', '/vocabulary/'],
  ['vocabulary-word', `/vocabulary/${encodeURIComponent(lexicalWord.ordinal)}/`]
];

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4482'], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});
let serverLog = '';
server.stdout.on('data', (chunk) => { serverLog += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverLog += chunk.toString(); });

try {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    for (const [name, route] of routes) {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
      const text = String(await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
      const hits = forbidden.filter((term) => text.includes(term));
      check(hits.length === 0, name + '_no_engineering_language', hits.join('|'));

      const currentDockVisible = await page.locator('.kianosCurrentDock').isVisible().catch(() => false);
      check(currentDockVisible === false, name + '_no_current_debug_dock');

      const visibleCode = await page.locator('main.productCanvas code:visible').allTextContents();
      const engineeringCode = visibleCode.filter((value) => /(?:sha256:|content\/english\/|kianos\.|source\/question_bank|CURRENT_READY)/i.test(String(value || '')));
      check(engineeringCode.length === 0, name + '_no_visible_engineering_code', engineeringCode.join('|'));
    }

    await context.close();
  } finally {
    await browser.close().catch(() => {});
  }

  fs.writeFileSync(path.join(auditDir, 'english-learner-language.json'), JSON.stringify({
    schema: 'kianos.english.learner-language-audit.v1',
    status: 'PASS',
    routes: routes.map(([name, route]) => ({ name, route })),
    forbidden,
    checks
  }, null, 2));
  console.log(`ENGLISH_LEARNER_LANGUAGE_PASS ${checks.length} checks`);
} catch (error) {
  fs.writeFileSync(path.join(auditDir, 'english-learner-language.json'), JSON.stringify({
    schema: 'kianos.english.learner-language-audit.v1',
    status: 'FAIL',
    error: error instanceof Error ? error.stack || error.message : String(error),
    checks,
    serverLog: serverLog.slice(-12000)
  }, null, 2));
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
} finally {
  await stopServer(server);
}
