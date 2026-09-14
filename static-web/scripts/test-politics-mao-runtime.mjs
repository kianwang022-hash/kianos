// #148 Current uses native frames + #117 Workbench; retained code below audits the retired embedded consumer only.
import { runCurrentPoliticsFrame } from './politics-frame-test-entry.mjs';
await runCurrentPoliticsFrame({ subject: 'mao', formal: false });
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4325;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '../politics-mao-runtime-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = {
  schema: 'kianos.politics.mao_runtime_journey.v1',
  started_at: new Date().toISOString(),
  checks: []
};

const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`POLITICS_MAO_RUNTIME_FAIL:${name}${detail ? `:${detail}` : ''}`);
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
  throw new Error('POLITICS_MAO_PREVIEW_SERVER_NOT_READY');
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

async function findMaoConfig(page, { minQuestions = 1, maxQuestions = 6 } = {}) {
  let fallback = null;
  for (let index = 0; index <= 8; index += 1) {
    const chapter = `ch${String(index).padStart(2, '0')}`;
    await page.goto(`${BASE}/politics/mao/${chapter}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-politics-runtime][data-subject="mao"]').waitFor({ state: 'visible' });
    const rows = await configs(page);
    for (const config of rows) {
      const count = (config?.expected_question_ids || []).length;
      if (count < minQuestions) continue;
      const candidate = { chapter, config };
      if (count <= maxQuestions) return candidate;
      if (!fallback || count < (fallback.config.expected_question_ids || []).length) fallback = candidate;
    }
  }
  check(Boolean(fallback), `mao_config_with_${minQuestions}_questions_exists`);
  return fallback;
}

async function cardFor(page, questionId) {
  return page.locator(`[data-politics-question][data-question-id="${questionId}"]`);
}

async function answerCard(page, questionId, mode = 'correct') {
  const card = await cardFor(page, questionId);
  await card.waitFor({ state: 'attached' });
  const answer = String(await card.getAttribute('data-answer') || '');
  const labels = await card.locator('[data-politics-option]').evaluateAll((buttons) => buttons.map((button) => button.getAttribute('data-politics-option') || ''));
  let selected = [...answer];
  let uncertain = false;
  if (mode === 'repair') {
    const wrong = labels.find((label) => !answer.includes(label));
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

async function maoChapterSmoke(page) {
  await clearPoliticsState(page);
  for (let index = 0; index <= 8; index += 1) {
    const chapter = `ch${String(index).padStart(2, '0')}`;
    await page.goto(`${BASE}/politics/mao/${chapter}/`, { waitUntil: 'domcontentloaded' });
    const root = page.locator('[data-politics-runtime][data-subject="mao"]');
    await root.waitFor({ state: 'visible' });
    check((await root.getAttribute('data-chapter')) === chapter, `mao_${chapter}_identity`);
    check(await root.locator('[data-politics-unit]').count() > 0, `mao_${chapter}_has_units`);
    check(await root.locator('[data-politics-external-source]').count() > 0, `mao_${chapter}_external_chengfeng_handoff`);
    check(await page.locator('[data-politics-cognitive-workspace]').count() === 0, `mao_${chapter}_keeps_subject_generic_runtime`);
  }
}

async function maoCleanJourney(page) {
  await clearPoliticsState(page);
  const located = await findMaoConfig(page, { minQuestions: 1, maxQuestions: 5 });
  check(Boolean(located), 'mao_clean_config_found');
  const { chapter, config } = located;
  const source = page.locator(`#${config.source_anchor}`);
  await source.waitFor({ state: 'attached' });
  check((await source.textContent())?.includes('iPad / MarginNote'), 'mao_clean_external_study_handoff_visible', chapter);

  const ids = config.expected_question_ids || [];
  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];
    const card = await cardFor(page, id);
    await card.waitFor({ state: 'visible' });
    await answerCard(page, id, 'correct');
    const attempt = await firstAttempt(page, config, id);
    check(attempt?.outcome === 'STABLE', `mao_clean_first_attempt_${index + 1}`, chapter);
    if (index < ids.length - 1) {
      const next = card.locator('[data-politics-next]');
      await next.waitFor({ state: 'visible' });
      await next.click();
    }
  }

  const returnId = `politics-unit-return-${String(config.natural_unit_id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const unitReturn = page.locator(`#${returnId}`);
  await unitReturn.waitFor({ state: 'visible' });
  check((await unitReturn.textContent())?.includes('不等于长期掌握'), 'mao_clean_unit_return_preserves_no_mastery');
  const evidence = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-politics-evidence-v1') || '[]'));
  check(Array.isArray(evidence) && evidence.length === 0, 'mao_clean_creates_no_wrong_uncertain_handoff');

  await unitReturn.locator('[data-unit-return-continue]').click();
  const cursor = await lastLocation(page);
  check(['ORIENT', 'CHAPTER_CLOSE'].includes(cursor?.action), 'mao_clean_continue_advances_real_path', JSON.stringify(cursor));
}

async function maoResumeJourney(page) {
  await clearPoliticsState(page);
  const located = await findMaoConfig(page, { minQuestions: 2, maxQuestions: 6 });
  check(Boolean(located), 'mao_resume_config_found');
  const { chapter, config } = located;
  const [firstId, secondId] = config.expected_question_ids;
  const firstCard = await cardFor(page, firstId);
  await firstCard.waitFor({ state: 'visible' });
  await answerCard(page, firstId, 'correct');
  await firstCard.locator('[data-politics-next]').click();
  const secondCard = await cardFor(page, secondId);
  await secondCard.waitFor({ state: 'visible' });

  const before = await lastLocation(page);
  check(before?.subject === 'mao' && before?.chapter === chapter, 'mao_cursor_keeps_subject_chapter', JSON.stringify(before));
  check(before?.question_id === secondId && before?.action === 'VERIFY', 'mao_cursor_tracks_next_pending_question', JSON.stringify(before));

  await page.reload({ waitUntil: 'domcontentloaded' });
  const restored = await cardFor(page, secondId);
  await restored.waitFor({ state: 'visible' });
  check(await restored.evaluate((node) => node.classList.contains('active')), 'mao_refresh_rehydrates_pending_question');
  check((await firstAttempt(page, config, firstId))?.outcome === 'STABLE', 'mao_refresh_preserves_first_attempt_truth');

  await page.goto(`${BASE}/politics/`, { waitUntil: 'domcontentloaded' });
  const continueHref = await page.locator('[data-politics-continue]').getAttribute('href');
  check(String(continueHref || '').includes(`/politics/mao/${chapter}/`), 'mao_home_continue_keeps_chapter', String(continueHref || ''));
  check(String(continueHref || '').includes(`#politics-question-${secondId.replace(/[^a-zA-Z0-9_-]/g, '-')}`), 'mao_home_continue_targets_real_question', String(continueHref || ''));
}

async function maoRepairJourney(page) {
  await clearPoliticsState(page);
  const located = await findMaoConfig(page, { minQuestions: 1, maxQuestions: 6 });
  check(Boolean(located), 'mao_repair_config_found');
  const { chapter, config } = located;
  const questionId = config.expected_question_ids[0];
  const { card } = await answerCard(page, questionId, 'repair');
  const attempt = await firstAttempt(page, config, questionId);
  check(['WRONG', 'UNCERTAIN'].includes(attempt?.outcome), 'mao_problem_first_attempt_recorded', JSON.stringify(attempt));
  const firstResultText = String(await card.locator('[data-politics-result]').textContent() || '');

  const repair = card.locator('[data-politics-repair]');
  await repair.waitFor({ state: 'visible' });
  const sourceLink = repair.locator('a[href^="#source-"]');
  await sourceLink.waitFor({ state: 'visible' });
  await sourceLink.click();
  await page.waitForTimeout(80);

  const source = page.locator(`#${config.source_anchor}`);
  await source.waitFor({ state: 'visible' });
  const returnLink = source.locator(`[data-politics-return-to-question="${questionId}"]`);
  await returnLink.waitFor({ state: 'visible' });
  const sourceCursor = await lastLocation(page);
  check(sourceCursor?.subject === 'mao' && sourceCursor?.chapter === chapter, 'mao_repair_source_keeps_subject_chapter', JSON.stringify(sourceCursor));
  check(sourceCursor?.action === 'REPAIR_SOURCE', 'mao_repair_source_cursor_saved', JSON.stringify(sourceCursor));

  await returnLink.click();
  await card.waitFor({ state: 'visible' });
  const returnCursor = await lastLocation(page);
  check(returnCursor?.action === 'REPAIR' && returnCursor?.question_id === questionId, 'mao_repair_return_targets_interrupted_question', JSON.stringify(returnCursor));
  check(await card.locator('[data-politics-repair]').isVisible(), 'mao_repair_panel_visible_after_return');
  check(await card.locator('[data-politics-result]').isVisible(), 'mao_repair_return_keeps_problem_result_visible');
  check(String(await card.locator('[data-politics-result]').textContent() || '') === firstResultText, 'mao_repair_return_preserves_problem_result');
  check(JSON.stringify(await firstAttempt(page, config, questionId)) === JSON.stringify(attempt), 'mao_repair_return_preserves_first_attempt');

  await page.reload({ waitUntil: 'domcontentloaded' });
  const restored = await cardFor(page, questionId);
  await restored.waitFor({ state: 'visible' });
  check(await restored.locator('[data-politics-result]').isVisible(), 'mao_refresh_restores_problem_result');
  check(await restored.locator('[data-politics-repair]').isVisible(), 'mao_refresh_restores_repair');
  check((await firstAttempt(page, config, questionId))?.outcome === attempt.outcome, 'mao_refresh_does_not_overwrite_first_attempt');
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
  const context = await browser.newContext();
  const page = await context.newPage();

  await maoChapterSmoke(page);
  await maoCleanJourney(page);
  await maoResumeJourney(page);
  await maoRepairJourney(page);

  await context.close();
  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  fs.writeFileSync(path.join(auditDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log('POLITICS_MAO_RUNTIME_PASS');
  console.log(JSON.stringify({ checks: report.checks.length }));
} catch (error) {
  report.finished_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.writeFileSync(path.join(auditDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  throw error;
} finally {
  if (browser) await browser.close();
  if (server.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); }
    catch { try { server.kill('SIGTERM'); } catch {} }
  }
}
