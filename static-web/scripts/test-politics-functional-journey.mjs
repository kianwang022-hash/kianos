import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4324;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '../politics-functional-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = {
  schema: 'kianos.politics.functional_first_journey.v1',
  started_at: new Date().toISOString(),
  checks: []
};

const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`POLITICS_FUNCTIONAL_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let index = 0; index < 80; index += 1) {
    try {
      const response = await fetch(`${BASE}/politics/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('POLITICS_PREVIEW_SERVER_NOT_READY');
}

async function clearPoliticsState(page) {
  await page.goto(`${BASE}/politics/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('kianos-politics-')) localStorage.removeItem(key);
    }
  });
}

async function configs(page) {
  return page.locator('[data-politics-unit-return-config]').evaluateAll((rows) => rows.map((row) => {
    try { return JSON.parse(row.getAttribute('data-config') || 'null'); } catch { return null; }
  }).filter(Boolean));
}

async function chooseConfig(page, { minQuestions = 1 } = {}) {
  const rows = await configs(page);
  const row = rows.find((item) => (item?.expected_question_ids || []).length >= minQuestions);
  check(Boolean(row), `config_with_${minQuestions}_questions_exists`);
  // Select the existing Natural Unit through its real navigation control.
  // Presentation may show one Unit at a time; it does not change attempt rules.
  if (row?.natural_unit_id) {
    const unit = page.locator(`[data-politics-unit][data-unit-id="${row.natural_unit_id}"]`);
    if (await unit.count() && !(await unit.isVisible())) {
      const anchor = await unit.getAttribute('id');
      await page.locator(`.politicsRail a[href="#${anchor}"]`).click();
      await unit.waitFor({ state: 'visible' });
    }
  }
  return row;
}

async function cardFor(page, questionId) {
  return page.locator(`[data-politics-question][data-question-id="${questionId}"]`);
}

async function answerCard(page, questionId, mode = 'correct') {
  const card = await cardFor(page, questionId);
  await card.waitFor({ state: 'attached' });
  const answer = String(await card.getAttribute('data-answer') || '');
  const optionLabels = await card.locator('[data-politics-option]').evaluateAll((buttons) => buttons.map((button) => button.getAttribute('data-politics-option') || ''));
  let selected = [...answer];
  let uncertain = false;
  if (mode === 'repair') {
    const wrong = optionLabels.find((label) => !answer.includes(label));
    if (wrong) selected = [wrong];
    else uncertain = true;
  }
  for (const label of selected) await card.locator(`[data-politics-option="${label}"]`).click();
  if (uncertain) await card.locator('[data-politics-uncertain]').click();
  await card.locator('[data-politics-submit]').click();
  await card.locator('[data-politics-result]').waitFor({ state: 'visible' });
  await page.waitForTimeout(80);
  return { card, answer, uncertain };
}

async function firstAttempt(page, config, questionId) {
  return page.evaluate(({ unitKey, qid }) => {
    const store = JSON.parse(localStorage.getItem('kianos-politics-attempts-v1') || '{"units":{}}');
    return store?.units?.[unitKey]?.attempts?.[qid] || null;
  }, { unitKey: config.unit_key, qid: questionId });
}

async function lastLocation(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('kianos-politics-last-location-v1') || 'null'));
}

async function completeConfigClean(page, config) {
  const ids = config.expected_question_ids || [];
  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];
    const card = await cardFor(page, id);
    await card.waitFor({ state: 'visible' });
    await answerCard(page, id, 'correct');
    const attempt = await firstAttempt(page, config, id);
    check(attempt?.outcome === 'STABLE', `clean_first_attempt_${index + 1}`);
    if (index < ids.length - 1) {
      const next = card.locator('[data-politics-next]');
      await next.waitFor({ state: 'visible' });
      await next.click();
    }
  }
}

async function historyCleanJourney(page) {
  await clearPoliticsState(page);
  await page.goto(`${BASE}/politics/history/ch01/`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-politics-runtime][data-subject="history"]').waitFor({ state: 'visible' });
  const config = await chooseConfig(page);
  await completeConfigClean(page, config);
  const unitReturn = page.locator(`#politics-unit-return-${String(config.natural_unit_id).replace(/[^a-zA-Z0-9_-]/g, '-')}`);
  await unitReturn.waitFor({ state: 'visible' });
  check((await unitReturn.textContent())?.includes('不等于长期掌握'), 'clean_unit_return_preserves_no_mastery');
  const handoffEvents = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-politics-evidence-v1') || '[]'));
  check(Array.isArray(handoffEvents) && handoffEvents.length === 0, 'clean_path_creates_no_wrong_uncertain_handoff');
}

async function historyResumeJourney(page) {
  await clearPoliticsState(page);
  await page.goto(`${BASE}/politics/history/ch01/`, { waitUntil: 'domcontentloaded' });
  const config = await chooseConfig(page, { minQuestions: 2 });
  const [firstId, secondId] = config.expected_question_ids;
  const firstCard = await cardFor(page, firstId);
  await firstCard.waitFor({ state: 'visible' });
  await answerCard(page, firstId, 'correct');
  await firstCard.locator('[data-politics-next]').click();
  await (await cardFor(page, secondId)).waitFor({ state: 'visible' });
  const before = await lastLocation(page);
  check(before?.question_id === secondId && before?.action === 'VERIFY', 'history_cursor_tracks_next_pending_question', JSON.stringify(before));

  await page.reload({ waitUntil: 'domcontentloaded' });
  const secondCard = await cardFor(page, secondId);
  await secondCard.waitFor({ state: 'visible' });
  check(await secondCard.evaluate((node) => node.classList.contains('active')), 'history_refresh_rehydrates_pending_question');
  check((await firstAttempt(page, config, firstId))?.outcome === 'STABLE', 'history_refresh_preserves_first_attempt_truth');

  await page.goto(`${BASE}/politics/`, { waitUntil: 'domcontentloaded' });
  const continueHref = await page.locator('[data-politics-continue]').getAttribute('href');
  check(String(continueHref || '').includes(`#politics-question-${secondId.replace(/[^a-zA-Z0-9_-]/g, '-')}`), 'politics_home_continue_targets_real_question', String(continueHref || ''));
}

async function historyRepairJourney(page) {
  await clearPoliticsState(page);
  await page.goto(`${BASE}/politics/history/ch01/`, { waitUntil: 'domcontentloaded' });
  const config = await chooseConfig(page);
  const questionId = config.expected_question_ids[0];
  const { card } = await answerCard(page, questionId, 'repair');
  const attempt = await firstAttempt(page, config, questionId);
  check(['WRONG', 'UNCERTAIN'].includes(attempt?.outcome), 'history_problem_first_attempt_recorded', JSON.stringify(attempt));

  const sourceLink = card.locator('[data-politics-repair] a[href^="#source-"]');
  await sourceLink.waitFor({ state: 'visible' });
  await sourceLink.click();
  await page.waitForTimeout(80);
  const source = page.locator(`#${config.source_anchor}`);
  await source.waitFor({ state: 'visible' });
  const returnLink = source.locator(`[data-politics-return-to-question="${questionId}"]`);
  await returnLink.waitFor({ state: 'visible' });
  check((await lastLocation(page))?.action === 'REPAIR_SOURCE', 'history_repair_source_cursor_saved');

  await returnLink.click();
  await card.waitFor({ state: 'visible' });
  check((await lastLocation(page))?.action === 'REPAIR', 'history_repair_return_targets_interrupted_question');
  check(await card.locator('[data-politics-repair]').isVisible(), 'history_repair_panel_visible_after_return');

  await page.reload({ waitUntil: 'domcontentloaded' });
  const restored = await cardFor(page, questionId);
  await restored.waitFor({ state: 'visible' });
  check(await restored.locator('[data-politics-result]').isVisible(), 'history_refresh_restores_problem_result');
  check(await restored.locator('[data-politics-repair]').isVisible(), 'history_refresh_restores_repair');
  check((await firstAttempt(page, config, questionId))?.outcome === attempt.outcome, 'history_refresh_does_not_overwrite_first_attempt');
}

async function c00GoldenScreenshots(page) {
  await clearPoliticsState(page);
  await page.goto(`${BASE}/politics/marxism/ch00/`, { waitUntil: 'networkidle' });
  const workspace = page.locator('[data-politics-cognitive-workspace]');
  await workspace.waitFor({ state: 'visible' });
  check(await workspace.locator('.chapterContext').isVisible(), 'c00_compact_chapter_context_visible');

  const s01 = workspace.locator('[data-workspace-unit]').nth(0);
  await s01.waitFor({ state: 'visible' });
  check((await s01.locator('.goldenGraph').count()) === 1, 'c00_s01_uses_one_spatial_graph');
  await page.screenshot({ path: path.join(auditDir, 'marx-c00-s01-orient.png'), fullPage: false });

  await workspace.locator('[data-workspace-unit-tab="1"]').click();
  const s02 = workspace.locator('[data-workspace-unit]').nth(1);
  await s02.waitFor({ state: 'visible' });
  check((await s02.locator('.goldenGraph').count()) === 2, 'c00_s02_keeps_two_maps_simultaneously_visible');
  await page.screenshot({ path: path.join(auditDir, 'marx-c00-s02-orient.png'), fullPage: false });
}

async function c00RepairResumeJourney(page) {
  await clearPoliticsState(page);
  await page.goto(`${BASE}/politics/marxism/ch00/`, { waitUntil: 'domcontentloaded' });
  const workspace = page.locator('[data-politics-cognitive-workspace]');
  await workspace.waitFor({ state: 'visible' });
  const unit = workspace.locator('[data-workspace-unit]').first();
  await unit.locator('[data-workspace-action="start-learn"]').click();
  await unit.locator('[data-workspace-action="learn-fastpath"]').click();
  check((await unit.getAttribute('data-state')) === 'VERIFY', 'c00_enters_verify_without_forced_recall');

  const configRows = await configs(page);
  const unitId = await unit.getAttribute('data-unit-id');
  const config = configRows.find((row) => row.runtime_unit_id === unitId);
  check(Boolean(config), 'c00_active_unit_has_return_config');
  const questionId = config.expected_question_ids[0];
  await answerCard(page, questionId, 'repair');
  check((await unit.getAttribute('data-state')) === 'REPAIR', 'c00_problem_enters_repair_state');
  const inspectorRepair = unit.locator('[data-workspace-repair-slot] [data-politics-repair]');
  check(await inspectorRepair.isVisible(), 'c00_problem_moves_repair_into_inspector');

  const sourceLink = inspectorRepair.locator('a[href^="#source-"]');
  await sourceLink.click();
  check((await unit.getAttribute('data-state')) === 'EXTERNAL_LEARN', 'c00_repair_routes_to_external_source_state');
  const source = unit.locator(`#${config.source_anchor}`);
  const returnLink = source.locator(`[data-politics-return-to-question="${questionId}"]`);
  await returnLink.waitFor({ state: 'visible' });
  await returnLink.click();
  check((await unit.getAttribute('data-state')) === 'REPAIR', 'c00_source_return_restores_repair_state');

  await page.reload({ waitUntil: 'domcontentloaded' });
  const restoredUnit = page.locator(`[data-workspace-unit][data-unit-id="${unitId}"]`);
  await restoredUnit.waitFor({ state: 'visible' });
  check((await restoredUnit.getAttribute('data-state')) === 'REPAIR', 'c00_refresh_restores_repair_state');
  check(await restoredUnit.locator('[data-workspace-repair-slot] [data-politics-repair]').isVisible(), 'c00_refresh_rehydrates_repair_content');
}

async function xiShapeSmoke(page) {
  await clearPoliticsState(page);
  await page.goto(`${BASE}/politics/xi/ch00/`, { waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-politics-runtime][data-subject="xi"]');
  await root.waitFor({ state: 'visible' });
  check(await root.locator('[data-politics-unit]').count() > 0, 'xi_generic_runtime_has_natural_units');
  check(await root.locator('[data-politics-external-source]').count() > 0, 'xi_preserves_external_chengfeng_surface');
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await context.newPage();
  await historyCleanJourney(page);
  await historyResumeJourney(page);
  await historyRepairJourney(page);
  await c00GoldenScreenshots(page);
  await c00RepairResumeJourney(page);
  await xiShapeSmoke(page);
  await context.close();
  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  fs.writeFileSync(path.join(auditDir, 'journey.json'), JSON.stringify(report, null, 2));
  console.log('POLITICS_FUNCTIONAL_FIRST_JOURNEY_PASS');
} catch (error) {
  report.finished_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.writeFileSync(path.join(auditDir, 'journey.json'), JSON.stringify(report, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close().catch(() => {});
  if (process.platform !== 'win32' && server.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  } else {
    try { server.kill('SIGTERM'); } catch {}
  }
  server.stdout?.destroy();
  server.stderr?.destroy();
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGKILL'); } catch {}
    } else {
      try { server.kill('SIGKILL'); } catch {}
    }
  }
}
