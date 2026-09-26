import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { listTranslationSets } from '../src/lib/englishTranslation.mjs';

const BASE = 'http://127.0.0.1:4488';
const auditDir = path.resolve(process.cwd(), '../translation-browser-audit');
fs.mkdirSync(auditDir, { recursive: true });

const report = {
  schema: 'kianos.english.translation.learner-journey.v1',
  startedAt: new Date().toISOString(),
  checks: []
};

function check(condition, name, detail = '') {
  if (!condition) throw new Error(`TRANSLATION_BROWSER_FAIL:${name}${detail ? ':' + detail : ''}`);
  report.checks.push({ name, pass: true, detail });
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
  throw new Error('TRANSLATION_BROWSER_PREVIEW_NOT_READY');
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
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGKILL'); } catch {}
    } else {
      try { server.kill('SIGKILL'); } catch {}
    }
  }
}

async function assertNoVisibleEngineering(page, name) {
  const text = String(await page.locator('[data-translation-runtime]').innerText()).replace(/\s+/g, ' ');
  const forbidden = ['KIANOS_', 'Current provenance', 'sha256:', 'Runtime boundary', 'TRANSFER_PENDING', 'REPAIR_COMPLETE'];
  const hits = forbidden.filter((term) => text.includes(term));
  check(hits.length === 0, name, hits.join('|'));
}

async function fillAttempt(page, prefix) {
  const boxes = page.locator('[data-attempt-id]');
  const count = await boxes.count();
  check(count > 0, prefix + '_segments_present');
  for (let i = 0; i < count; i += 1) {
    await boxes.nth(i).fill(`这是第 ${i + 1} 句的独立第一版译文，用于真实浏览器闭环验证。`);
  }
  return count;
}

async function cleanPassJourney(page, id) {
  await page.goto(`${BASE}/translation/${encodeURIComponent(id)}/`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-translation-runtime]').waitFor({ state: 'visible' });
  const count = await fillAttempt(page, 'clean');

  await page.locator('[data-freeze-first]').click();
  await page.locator('[data-stage="decision"]').waitFor({ state: 'visible' });
  check(await page.locator('[data-frozen-first]').isVisible(), 'clean_first_attempt_preserved');

  await page.locator('[data-pass-clean]').click();
  await page.locator('[data-stage="passed"]').waitFor({ state: 'visible' });
  let state = await page.evaluate((taskId) =>
    JSON.parse(localStorage.getItem(`kianos-translation-attempt-v2:${taskId}`) || 'null'), id);
  check(state?.stage === 'passed', 'clean_pass_reaches_terminal_state');
  check(Object.keys(state?.firstAttempts || {}).length === count, 'clean_pass_keeps_first_attempts');
  check(state?.pendingTransferCandidate == null, 'clean_pass_creates_no_transfer_debt');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-stage="passed"]').waitFor({ state: 'visible' });
  state = await page.evaluate((taskId) =>
    JSON.parse(localStorage.getItem(`kianos-translation-attempt-v2:${taskId}`) || 'null'), id);
  check(state?.stage === 'passed', 'clean_pass_survives_refresh');
}

async function manualRepairJourney(page, id) {
  await page.goto(`${BASE}/translation/${encodeURIComponent(id)}/`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-translation-runtime]').waitFor({ state: 'visible' });
  await fillAttempt(page, 'repair');

  await page.locator('[data-freeze-first]').click();
  await page.locator('[data-stage="decision"]').waitFor({ state: 'visible' });
  await page.locator('[data-route-review]').click();
  await page.locator('[data-stage="diagnosis"]').waitFor({ state: 'visible' });

  const direct = page.locator('.translationDirectReview');
  await direct.waitFor({ state: 'visible' });
  check(await direct.getByText('需要修就直接选句子，自己重译').isVisible(), 'normal_review_path_is_human_facing');
  await assertNoVisibleEngineering(page, 'translation_review_surface_has_no_engineering_language');

  const firstSegment = direct.locator('[data-segment-id]').first();
  const affectedId = await firstSegment.getAttribute('data-segment-id');
  check(Boolean(affectedId), 'manual_repair_segment_available');
  await firstSegment.click();
  await direct.getByRole('button', { name: '开始重译' }).click();

  await page.locator('[data-stage="reconstruct"]').waitFor({ state: 'visible' });
  const reconstruct = page.locator('[data-reconstruct-id]');
  check(await reconstruct.count() === 1, 'manual_repair_stays_smallest_scope');
  await assertNoVisibleEngineering(page, 'translation_reconstruct_surface_has_no_engineering_language');
  await reconstruct.fill('这是根据复盘后重新完成的译文。');
  await page.locator('[data-save-reconstruction]').click();
  await page.locator('[data-stage="repaired"]').waitFor({ state: 'visible' });

  let state = await page.evaluate((taskId) =>
    JSON.parse(localStorage.getItem(`kianos-translation-attempt-v2:${taskId}`) || 'null'), id);
  check(state?.stage === 'repaired', 'manual_repair_reaches_terminal_state');
  check(state?.pendingTransferCandidate == null, 'manual_repair_does_not_manufacture_transfer_target');
  check(Boolean(state?.firstAttempts?.[affectedId]), 'manual_repair_preserves_first_attempt');
  check((state?.reconstructions || []).length === 1, 'manual_repair_preserves_reconstruction');
  await assertNoVisibleEngineering(page, 'translation_repaired_surface_has_no_engineering_language');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-stage="repaired"]').waitFor({ state: 'visible' });
  state = await page.evaluate((taskId) =>
    JSON.parse(localStorage.getItem(`kianos-translation-attempt-v2:${taskId}`) || 'null'), id);
  check(state?.stage === 'repaired', 'manual_repair_survives_refresh');

  await page.goto(`${BASE}/english/`, { waitUntil: 'domcontentloaded' });
  check(await page.locator('[data-english-resume]').isHidden(), 'finished_translation_does_not_create_resume_debt');
}

const sets = listTranslationSets();
check(sets.length >= 2, 'translation_has_two_browser_fixtures');

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4488'], {
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

    await cleanPassJourney(page, sets[0].id);
    await manualRepairJourney(page, sets[1].id);

    await context.close();
  } finally {
    await browser.close().catch(() => {});
  }

  report.finishedAt = new Date().toISOString();
  report.pass = true;
  fs.writeFileSync(path.join(auditDir, 'translation-learner-journey.json'), JSON.stringify(report, null, 2));
  console.log(`TRANSLATION_LEARNER_JOURNEY_PASS ${report.checks.length} checks`);
} catch (error) {
  report.finishedAt = new Date().toISOString();
  report.pass = false;
  report.error = error instanceof Error ? error.stack || error.message : String(error);
  report.serverLog = serverLog.slice(-12000);
  fs.writeFileSync(path.join(auditDir, 'translation-learner-journey.json'), JSON.stringify(report, null, 2));
  console.error(report.error);
  process.exitCode = 1;
} finally {
  await stopServer(server);
}
