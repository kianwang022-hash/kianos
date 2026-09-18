import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { listClozeSets } from '../src/lib/englishObjective.mjs';
import { listTranslationSets } from '../src/lib/englishTranslation.mjs';
import { listWritingRuntimeTasks } from '../src/lib/englishWritingRuntimeSourceTruth.mjs';

if (process.platform !== 'darwin') {
  throw new Error(`MAC_TYPOGRAPHY_GATE_REQUIRES_DARWIN:${process.platform}`);
}

const BASE = 'http://127.0.0.1:4321';
const auditDir = path.resolve(process.cwd(), '../english-mac-typography-audit');
fs.mkdirSync(auditDir, { recursive: true });

const cloze = listClozeSets()[0];
const translation = listTranslationSets()[0];
const writing = listWritingRuntimeTasks().find((item) => item?.sourceKind === 'synthetic') || listWritingRuntimeTasks()[0];

if (!cloze?.id || !translation?.id || !writing?.id) {
  throw new Error('MAC_TYPOGRAPHY_FIXTURE_MISSING');
}

const routes = [
  ['english-home', '/english/'],
  ['cloze', `/cloze/${encodeURIComponent(cloze.id)}/`],
  ['translation', `/translation/${encodeURIComponent(translation.id)}/`],
  ['writing', `/writing/${encodeURIComponent(writing.id)}/`],
];

const report = {
  schema: 'kianos.english.mac-l1-typography.v1',
  platform: process.platform,
  startedAt: new Date().toISOString(),
  checks: [],
  routes: [],
};

function check(condition, name, detail = '') {
  if (!condition) throw new Error(`MAC_L1_TYPOGRAPHY_FAIL:${name}${detail ? ':' + detail : ''}`);
  report.checks.push({ name, pass: true, detail });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('MAC_TYPOGRAPHY_PREVIEW_NOT_READY');
}

async function stopServer(server) {
  if (!server) return;
  if (server.exitCode === null) {
    try { server.kill('SIGTERM'); } catch {}
    await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  }
  if (server.exitCode === null) {
    try { server.kill('SIGKILL'); } catch {}
  }
}

function pingFangFirst(stack) {
  return /^["']?PingFang SC["']?(?:,|$)/i.test(String(stack || '').trim());
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4321'], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
server.stdout.on('data', (chunk) => { serverLog += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverLog += chunk.toString(); });

try {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1512, height: 982 }, deviceScaleFactor: 1 });
    const page = await context.newPage();

    for (const [name, route] of routes) {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
      await page.locator('main.productCanvas').waitFor({ state: 'visible' });

      const evidence = await page.evaluate(() => {
        const body = document.body;
        const main = document.querySelector('main.productCanvas');
        const subjectBar = document.querySelector('.kianosSubjectBar');
        const bodyStyle = getComputedStyle(body);
        const mainStyle = main ? getComputedStyle(main) : null;
        const subjectStyle = subjectBar ? getComputedStyle(subjectBar) : null;
        const cssPingFang = getComputedStyle(document.documentElement).getPropertyValue('--study-font-cjk').trim();
        return {
          fontCheck: document.fonts.check('16px "PingFang SC"'),
          cssPingFang,
          bodyFont: bodyStyle.fontFamily,
          bodyWeight: bodyStyle.fontWeight,
          mainFont: mainStyle?.fontFamily || '',
          subjectFont: subjectStyle?.fontFamily || '',
          documentOverflow: document.documentElement.scrollWidth - window.innerWidth,
          bodyOverflow: body.scrollWidth - window.innerWidth,
        };
      });

      check(evidence.fontCheck === true, `${name}_pingfang_installed`);
      check(pingFangFirst(evidence.cssPingFang), `${name}_l1_token_pingfang_first`, evidence.cssPingFang);
      check(pingFangFirst(evidence.bodyFont), `${name}_body_pingfang_first`, evidence.bodyFont);
      check(pingFangFirst(evidence.mainFont), `${name}_main_pingfang_first`, evidence.mainFont);
      check(!evidence.subjectFont || pingFangFirst(evidence.subjectFont), `${name}_subject_bar_pingfang_first`, evidence.subjectFont);
      check(evidence.documentOverflow <= 1 && evidence.bodyOverflow <= 1, `${name}_no_horizontal_overflow`, JSON.stringify(evidence));

      await page.screenshot({
        path: path.join(auditDir, `${name}-1512x982-macos.png`),
        fullPage: false,
      });
      report.routes.push({ name, route, ...evidence });
    }

    await context.close();
  } finally {
    await browser.close().catch(() => {});
  }

  report.finishedAt = new Date().toISOString();
  report.status = 'PASS';
  fs.writeFileSync(path.join(auditDir, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`MAC_L1_TYPOGRAPHY_PASS ${report.checks.length} checks`);
} catch (error) {
  report.finishedAt = new Date().toISOString();
  report.status = 'FAIL';
  report.error = error instanceof Error ? error.stack || error.message : String(error);
  report.serverLog = serverLog.slice(-12000);
  fs.writeFileSync(path.join(auditDir, 'report.json'), JSON.stringify(report, null, 2));
  console.error(report.error);
  process.exitCode = 1;
} finally {
  await stopServer(server);
}
