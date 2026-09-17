import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import astroConfig from '../astro.config.mjs';

const auditDir = path.resolve('audit/external-reading-runtime');
fs.mkdirSync(auditDir, { recursive: true });
const configuredBase = String(astroConfig.base || '/');
const previewBase = configuredBase === '/' ? '' : `/${configuredBase.replace(/^\/+|\/+$/g, '')}`;
const BASE = `http://127.0.0.1:4321${previewBase}`;
const OBJECT_ID = 'synthetic-external-runtime';
const RUNTIME_ID = `external--${OBJECT_ID}`;
const report = { startedAt: new Date().toISOString(), checks: [] };

function check(condition, name, detail = '') {
  assert.ok(condition, `${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, detail });
}

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(`${BASE}/english/external/`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('EXTERNAL_READING_PREVIEW_NOT_READY');
}

async function stopServer(server) {
  if (!server?.pid) return;
  try { process.kill(-server.pid, 'SIGTERM'); } catch {
    try { server.kill('SIGTERM'); } catch {}
  }
}

const adapterSource = fs.readFileSync(path.resolve('src/components/SharedReadingWorkspace.astro'), 'utf8');
check(!adapterSource.includes('kianos-reading-continuous-session-v1'), 'adapter_has_no_reading_a_private_continuous_key');
check(!adapterSource.includes('localStorage'), 'adapter_has_no_foreign_runtime_storage_patch');
check(!adapterSource.includes('querySelector'), 'adapter_has_no_post_render_dom_patch');

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

    await page.goto(`${BASE}/english/external/`, { waitUntil: 'domcontentloaded' });
    check(await page.locator(`[data-external-object="${OBJECT_ID}"]`).count() === 1, 'inventory_discovers_materialized_object');
    check(await page.locator('[data-kianos-subject-bar="english"] a.active').textContent() === 'External Reading', 'external_top_bar_active');
    await page.locator(`[data-external-object="${OBJECT_ID}"] a`).click();
    await page.waitForURL(`**/english/external/${OBJECT_ID}/`);

    const root = page.locator('[data-local-port="reading"]');
    check(await root.count() === 1, 'uses_shared_reading_workspace');
    check(await root.getAttribute('data-reading-object') === RUNTIME_ID, 'external_runtime_id_isolated');
    check(await root.getAttribute('data-reading-continuous-enabled') === 'false', 'owner_disables_continuous_session_for_external');
    check((await page.locator('.portedReadingHeaderCenter > span').textContent()) === 'External Reading', 'external_runtime_label');
    check((await page.locator('.portedReadingSessionHeader > a').textContent()) === '‹ External Reading', 'external_back_label_owned_by_workspace_parameters');
    check(await page.locator('[data-reading-passage] p').count() === 2, 'passage_paragraphs_render');
    check(await page.locator('[data-question]').count() === 2, 'full_question_set_renders');
    check(await page.locator('[data-reading-continuous]').isHidden(), 'exam_continuous_session_not_reused');

    const html = await page.content();
    check(!html.includes('data-answer="\"A\""') && !html.includes('data-answer="\"B\""'), 'clean_attempt_does_not_embed_formal_answers');

    const q1 = page.locator('[data-question="q1"]');
    await q1.locator('.portedUncertain').click();
    check(await q1.locator('.portedUncertain').getAttribute('aria-pressed') === 'true', 'uncertain_toggle_works');
    await q1.locator('[data-option="B"]').click();
    await page.locator('[data-question="q2"] [data-option="B"]').click();

    const readingAKey = `kianos-reading-attempt-v1:${OBJECT_ID}`;
    const externalKey = `kianos-reading-attempt-v1:${RUNTIME_ID}`;
    check(await page.evaluate((key) => localStorage.getItem(key) === null, readingAKey), 'raw_external_id_does_not_collide_with_reading_a_storage');
    check(await page.evaluate((key) => Boolean(localStorage.getItem(key)), externalKey), 'external_attempt_uses_isolated_runtime_id');

    const examContinuousKey = 'kianos-reading-continuous-session-v1';
    const examContinuousSentinel = {
      version: 1,
      active: true,
      reviewing: false,
      startedAt: '2026-09-17T00:00:00.000Z',
      items: [{ id: 'reading-a-sentinel', score: 3, total: 5, problemCount: 2 }],
      reviewIds: ['reading-a-sentinel'],
      reviewIndex: 0,
      lastSummary: null
    };
    await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
      key: examContinuousKey,
      value: examContinuousSentinel
    });

    await page.locator('[data-reading-submit]').click();
    await page.locator('[data-reading-result]').waitFor({ state: 'visible' });
    check((await page.locator('[data-reading-score]').textContent()) === '1 / 2', 'submit_loads_answer_projection_and_scores');
    check(await q1.locator('[data-reading-repair]').isVisible(), 'wrong_or_uncertain_enters_shared_repair');
    check((await q1.locator('[data-reading-formal-answer]').textContent()) === 'A', 'formal_answer_reveals_only_after_submit');

    const examSessionAfter = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), examContinuousKey);
    check(JSON.stringify(examSessionAfter) === JSON.stringify(examContinuousSentinel), 'external_submit_preserves_reading_a_continuous_session');

    await page.screenshot({ path: path.join(auditDir, 'external-reading-1440x900.png'), fullPage: false });
    await context.close();
  } finally {
    await browser.close().catch(() => {});
  }

  report.finishedAt = new Date().toISOString();
  report.pass = true;
  fs.writeFileSync(path.join(auditDir, 'external-reading-runtime.json'), JSON.stringify(report, null, 2));
  console.log(`EXTERNAL_READING_RUNTIME_PASS ${report.checks.length} checks`);
} catch (error) {
  report.finishedAt = new Date().toISOString();
  report.pass = false;
  report.error = error instanceof Error ? error.stack || error.message : String(error);
  report.serverLog = serverLog.slice(-12000);
  fs.writeFileSync(path.join(auditDir, 'external-reading-runtime.json'), JSON.stringify(report, null, 2));
  console.error(report.error);
  process.exitCode = 1;
} finally {
  await stopServer(server);
}
