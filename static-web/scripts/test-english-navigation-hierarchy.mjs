import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { listReadingSets } from '../src/lib/englishReadingSourceTruth.mjs';

const BASE = 'http://127.0.0.1:4321';
const auditDir = path.resolve(process.cwd(), '../english-navigation-audit');
fs.mkdirSync(auditDir, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, code, detail = '') => {
  if (!condition) throw new Error(`ENGLISH_NAV_FAIL:${code}${detail ? ':' + detail : ''}`);
};

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('ENGLISH_NAV_PREVIEW_NOT_READY');
}

async function stopServer(server) {
  if (!server) return;
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch {} }
    else { try { server.kill('SIGTERM'); } catch {} }
    await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  }
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGKILL'); } catch {} }
    else { try { server.kill('SIGKILL'); } catch {} }
  }
  server.stdout?.destroy();
  server.stderr?.destroy();
}

const l2Labels = ['Overview', 'Objective', 'Translation', 'Writing', 'Vocabulary'];
const l3Labels = ['Reading A', 'Cloze', 'Part B'];

async function assertEnglishL2(page, active) {
  const bar = page.locator('[data-kianos-subject-bar="english"]');
  await bar.waitFor({ state: 'visible' });
  const labels = (await bar.locator('.kianosSubjectNav a').allTextContents()).map((row) => row.trim());
  check(JSON.stringify(labels) === JSON.stringify(l2Labels), 'l2_exact_items', labels.join('|'));
  const current = String(await bar.locator('a[aria-current="page"]').textContent() || '').trim();
  check(current === active, 'l2_active', current + '!=' + active);
  const size = Number.parseFloat(await bar.locator('.kianosSubjectNav a').first().evaluate((node) => getComputedStyle(node).fontSize));
  const weight = Number.parseInt(await bar.locator('.kianosSubjectNav a').first().evaluate((node) => getComputedStyle(node).fontWeight), 10);
  check(size >= 16, 'l2_typography_not_tiny', String(size));
  check(weight >= 600, 'l2_typography_not_thin', String(weight));
}

async function assertObjectiveL3(page, active) {
  const nav = page.locator('.englishObjectiveLocalNav');
  await nav.waitFor({ state: 'visible' });
  const labels = (await nav.locator('a').allTextContents()).map((row) => row.trim());
  check(JSON.stringify(labels) === JSON.stringify(l3Labels), 'objective_l3_exact_items', labels.join('|'));
  const current = String(await nav.locator('a[aria-current="page"]').textContent() || '').trim();
  check(current === active, 'objective_l3_active', current + '!=' + active);
  const size = Number.parseFloat(await nav.locator('a').first().evaluate((node) => getComputedStyle(node).fontSize));
  const weight = Number.parseInt(await nav.locator('a').first().evaluate((node) => getComputedStyle(node).fontWeight), 10);
  check(size >= 15, 'l3_typography_not_tiny', String(size));
  check(weight >= 600, 'l3_typography_not_thin', String(weight));

  const l2Box = await page.locator('[data-kianos-subject-bar="english"]').boundingBox();
  const l3Box = await nav.boundingBox();
  check(Boolean(l2Box && l3Box && l3Box.y > l2Box.y + l2Box.height), 'l3_is_spatially_below_l2');
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4321'], {
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

    await page.goto(`${BASE}/english/`, { waitUntil: 'domcontentloaded' });
    check(await page.locator('[data-kianos-global-rail]').isVisible(), 'l1_global_rail_visible');
    await assertEnglishL2(page, 'Overview');
    check(await page.locator('.englishObjectiveLocalNav').count() === 0, 'home_has_no_fake_l3');
    await page.screenshot({ path: path.join(auditDir, 'english-navigation-home-1440x900.png'), fullPage: false });

    await page.goto(`${BASE}/reading/`, { waitUntil: 'domcontentloaded' });
    await assertEnglishL2(page, 'Objective');
    await assertObjectiveL3(page, 'Reading A');
    check(await page.locator('[data-kianos-subject-bar="english"] .kianosSubjectNav a').filter({ hasText: 'Reading A' }).count() === 0, 'reading_not_promoted_to_l2');
    await page.screenshot({ path: path.join(auditDir, 'english-navigation-objective-1440x900.png'), fullPage: false });

    await page.goto(`${BASE}/cloze/`, { waitUntil: 'domcontentloaded' });
    await assertEnglishL2(page, 'Objective');
    await assertObjectiveL3(page, 'Cloze');

    await page.goto(`${BASE}/reading-b/`, { waitUntil: 'domcontentloaded' });
    await assertEnglishL2(page, 'Objective');
    await assertObjectiveL3(page, 'Part B');

    for (const [route, active] of [
      ['translation/', 'Translation'],
      ['writing/', 'Writing'],
      ['vocabulary/', 'Vocabulary']
    ]) {
      await page.goto(`${BASE}/${route}`, { waitUntil: 'domcontentloaded' });
      await assertEnglishL2(page, active);
    }

    const firstReading = listReadingSets()[0];
    check(Boolean(firstReading?.id), 'reading_runtime_fixture_missing');
    await page.goto(`${BASE}/reading/${encodeURIComponent(firstReading.id)}/`, { waitUntil: 'domcontentloaded' });
    check(await page.locator('[data-kianos-subject-bar="english"]').count() === 0, 'immersive_runtime_suppresses_l2');
    check(await page.locator('.englishObjectiveLocalNav').count() === 0, 'immersive_runtime_has_no_l3');

    await context.close();
  } finally {
    await browser.close().catch(() => {});
  }

  fs.writeFileSync(path.join(auditDir, 'english-navigation-report.json'), JSON.stringify({
    status: 'PASS',
    l1: ['Home', '西综', '政治', 'English'],
    l2: l2Labels,
    objective_l3: l3Labels,
    immersive_runtime_suppresses_l2: true
  }, null, 2));
  console.log('ENGLISH_NAVIGATION_HIERARCHY_PASS');
} catch (error) {
  fs.writeFileSync(path.join(auditDir, 'english-navigation-report.json'), JSON.stringify({
    status: 'FAIL',
    error: error instanceof Error ? error.stack || error.message : String(error),
    serverLog: serverLog.slice(-12000)
  }, null, 2));
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
} finally {
  await stopServer(server);
}
