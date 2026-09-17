import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const PORT = 4338;
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const auditDir = new URL('../../politics-natural-unit-visual-audit/', import.meta.url);
const samples = [
  ['marxism', 'ch01'],
  ['history', 'ch01'],
  ['mao', 'ch01'],
  ['xi', 'ch01'],
  ['ethics_law', 'ch01']
];
const checks = [];
const check = (condition, name, detail = '') => {
  checks.push({ name, pass: Boolean(condition), detail });
  if (!condition) throw new Error(`POLITICS_NU_VISUAL_FAIL:${name}${detail ? `:${detail}` : ''}`);
};

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(`${BASE}/politics/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('POLITICS_NU_VISUAL_SERVER_NOT_READY');
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let browser;
let failure = null;
try {
  await mkdir(auditDir, { recursive: true });
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await context.newPage();

  for (const [subject, chapter] of samples) {
    await page.goto(`${BASE}/politics/${subject}/${chapter}/`, { waitUntil: 'networkidle' });
    const study = page.locator('.politicsStudy');
    await study.waitFor({ state: 'visible' });
    const unit = page.locator('[data-politics-unit]:visible').first();
    await unit.waitFor({ state: 'visible' });

    const metrics = await unit.evaluate((node) => {
      const cognition = node.querySelector('.politicsUnitCognition');
      const companion = node.querySelector('.politicsUnitCompanion');
      const source = node.querySelector('.politicsSource');
      const quiz = node.querySelector('.politicsQuiz');
      const activeRail = document.querySelector('.politicsRail nav a.active');
      const title = node.querySelector('.politicsUnitHead h2');
      const micro = node.querySelector('.politicsMicro');
      const doc = document.documentElement;
      const rect = (el) => el?.getBoundingClientRect();
      return {
        overflow: doc.scrollWidth - window.innerWidth,
        cognitionWidth: rect(cognition)?.width || 0,
        companionWidth: rect(companion)?.width || 0,
        sourceBorder: source ? getComputedStyle(source).borderTopWidth : null,
        sourceRadius: source ? getComputedStyle(source).borderRadius : null,
        quizRadius: quiz ? getComputedStyle(quiz).borderRadius : null,
        activeRailRadius: activeRail ? getComputedStyle(activeRail).borderRadius : null,
        titleSize: title ? Number.parseFloat(getComputedStyle(title).fontSize) : 0,
        microSize: micro ? Number.parseFloat(getComputedStyle(micro).fontSize) : 0
      };
    });

    check(metrics.overflow <= 1, `${subject}_no_document_overflow`, JSON.stringify(metrics));
    check(metrics.cognitionWidth > metrics.companionWidth * 2, `${subject}_cognition_dominates_companion`, JSON.stringify(metrics));
    check(metrics.sourceBorder === '0px', `${subject}_source_card_chrome_removed`, JSON.stringify(metrics));
    check(metrics.sourceRadius === '0px', `${subject}_source_radius_removed`, JSON.stringify(metrics));
    check(metrics.quizRadius === '0px', `${subject}_quiz_outer_card_removed`, JSON.stringify(metrics));
    check(metrics.activeRailRadius === '0px', `${subject}_rail_active_not_card`, JSON.stringify(metrics));
    check(metrics.titleSize >= 28, `${subject}_unit_title_readable`, JSON.stringify(metrics));
    check(metrics.microSize >= 15, `${subject}_microcopy_readable`, JSON.stringify(metrics));

    await page.screenshot({ path: new URL(`politics-nu-${subject}.png`, auditDir).pathname, fullPage: false });
  }
  await context.close();

  const narrow = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const narrowPage = await narrow.newPage();
  await narrowPage.goto(`${BASE}/politics/history/ch01/`, { waitUntil: 'networkidle' });
  const narrowMetrics = await narrowPage.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    unitColumns: getComputedStyle(document.querySelector('[data-politics-unit]:not([hidden])') || document.querySelector('[data-politics-unit]')).gridTemplateColumns
  }));
  check(narrowMetrics.scrollWidth <= narrowMetrics.width + 1, 'narrow_no_document_overflow', JSON.stringify(narrowMetrics));
  await narrowPage.screenshot({ path: new URL('politics-nu-history-narrow.png', auditDir).pathname, fullPage: false });
  await narrow.close();

  console.log('POLITICS_NATURAL_UNIT_VISUAL_CONVERGENCE_PASS');
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await mkdir(auditDir, { recursive: true });
  await writeFile(new URL('result.json', auditDir), JSON.stringify({ checks, failure, status: failure ? 'FAIL' : 'PASS' }, null, 2));
  await browser?.close().catch(() => {});
  if (process.platform !== 'win32' && server.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  } else {
    try { server.kill('SIGTERM'); } catch {}
  }
  server.stdout?.destroy();
  server.stderr?.destroy();
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
}
