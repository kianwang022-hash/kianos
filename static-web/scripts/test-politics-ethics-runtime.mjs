// #148 Current uses native frames + #117 Workbench; retained code below audits the retired embedded consumer only.
import { runCurrentPoliticsFrame } from './politics-frame-test-entry.mjs';
await runCurrentPoliticsFrame({ subject: 'ethics_law', formal: false });
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4328;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '../politics-ethics-runtime-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = { schema: 'kianos.politics.ethics_runtime_journey.v1', started_at: new Date().toISOString(), checks: [] };
const check = (ok, name, detail = '') => {
  if (!ok) throw new Error(`POLITICS_ETHICS_RUNTIME_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try { if ((await fetch(`${BASE}/politics/`)).ok) return; } catch {}
    await sleep(250);
  }
  throw new Error('POLITICS_ETHICS_PREVIEW_SERVER_NOT_READY');
}
async function clearState(page) {
  await page.goto(`${BASE}/politics/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('kianos-politics-')).forEach((k) => localStorage.removeItem(k)));
}
async function configs(page) {
  return page.locator('[data-politics-unit-return-config]').evaluateAll((rows) => rows.map((row) => {
    try { return JSON.parse(row.getAttribute('data-config') || 'null'); } catch { return null; }
  }).filter(Boolean));
}
async function findConfig(page, minQuestions = 1) {
  let fallback = null;
  for (let i = 0; i <= 6; i += 1) {
    const chapter = `ch${String(i).padStart(2, '0')}`;
    await page.goto(`${BASE}/politics/ethics_law/${chapter}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-politics-runtime][data-subject="ethics_law"]').waitFor({ state: 'visible' });
    for (const config of await configs(page)) {
      const count = config?.expected_question_ids?.length || 0;
      if (count < minQuestions) continue;
      if (count <= 6) return { chapter, config };
      if (!fallback || count < fallback.config.expected_question_ids.length) fallback = { chapter, config };
    }
  }
  check(Boolean(fallback), `ethics_config_with_${minQuestions}_questions_exists`);
  return fallback;
}
const cardFor = (page, qid) => page.locator(`[data-politics-question][data-question-id="${qid}"]`);
async function answer(page, qid, mode = 'correct') {
  const card = cardFor(page, qid);
  await card.waitFor({ state: 'visible' });
  const correct = String(await card.getAttribute('data-answer') || '');
  const labels = await card.locator('[data-politics-option]').evaluateAll((els) => els.map((el) => el.getAttribute('data-politics-option') || ''));
  let picks = [...correct]; let uncertain = false;
  if (mode === 'repair') {
    const wrong = labels.find((label) => !correct.includes(label));
    if (wrong) picks = [wrong]; else uncertain = true;
  }
  for (const label of picks) await card.locator(`[data-politics-option="${label}"]`).click();
  if (uncertain) await card.locator('[data-politics-uncertain]').click();
  await card.locator('[data-politics-submit]').click();
  await card.locator('[data-politics-result]').waitFor({ state: 'visible' });
  await page.waitForTimeout(100);
  return card;
}
async function attempt(page, config, qid) {
  return page.evaluate(({ key, qid }) => {
    const store = JSON.parse(localStorage.getItem('kianos-politics-attempts-v1') || '{"units":{}}');
    return store?.units?.[key]?.attempts?.[qid] || null;
  }, { key: config.unit_key, qid });
}
async function last(page) { return page.evaluate(() => JSON.parse(localStorage.getItem('kianos-politics-last-location-v1') || 'null')); }

async function smoke(page) {
  await clearState(page);
  for (let i = 0; i <= 6; i += 1) {
    const chapter = `ch${String(i).padStart(2, '0')}`;
    await page.goto(`${BASE}/politics/ethics_law/${chapter}/`, { waitUntil: 'domcontentloaded' });
    const root = page.locator('[data-politics-runtime][data-subject="ethics_law"]');
    await root.waitFor({ state: 'visible' });
    check((await root.getAttribute('data-chapter')) === chapter, `ethics_${chapter}_identity`);
    check(await root.locator('[data-politics-unit]').count() > 0, `ethics_${chapter}_units`);
    check(await root.locator('[data-politics-external-source]').count() > 0, `ethics_${chapter}_external_chengfeng`);
    check(await page.locator('[data-politics-cognitive-workspace]').count() === 0, `ethics_${chapter}_generic_runtime`);
  }
}
async function cleanJourney(page) {
  await clearState(page);
  const located = await findConfig(page, 1); check(Boolean(located), 'ethics_clean_config_found');
  const { config } = located; const ids = config.expected_question_ids || [];
  for (let i = 0; i < ids.length; i += 1) {
    const card = await answer(page, ids[i], 'correct');
    check((await attempt(page, config, ids[i]))?.outcome === 'STABLE', `ethics_clean_attempt_${i + 1}`);
    if (i < ids.length - 1) await card.locator('[data-politics-next]').click();
  }
  const returnId = `politics-unit-return-${String(config.natural_unit_id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const unitReturn = page.locator(`#${returnId}`); await unitReturn.waitFor({ state: 'visible' });
  check((await unitReturn.textContent())?.includes('不等于长期掌握'), 'ethics_clean_no_mastery');
  const evidence = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-politics-evidence-v1') || '[]'));
  check(Array.isArray(evidence) && evidence.length === 0, 'ethics_clean_no_repair_debt');
}
async function resumeJourney(page) {
  await clearState(page);
  const located = await findConfig(page, 2); check(Boolean(located), 'ethics_resume_config_found');
  const { chapter, config } = located; const [first, second] = config.expected_question_ids;
  const firstCard = await answer(page, first, 'correct'); await firstCard.locator('[data-politics-next]').click();
  await cardFor(page, second).waitFor({ state: 'visible' });
  const before = await last(page);
  check(before?.subject === 'ethics_law' && before?.chapter === chapter, 'ethics_resume_identity', JSON.stringify(before));
  check(before?.action === 'VERIFY' && before?.question_id === second, 'ethics_resume_pending_question', JSON.stringify(before));
  await page.reload({ waitUntil: 'domcontentloaded' });
  const restored = cardFor(page, second); await restored.waitFor({ state: 'visible' });
  check(await restored.evaluate((node) => node.classList.contains('active')), 'ethics_refresh_restores_pending');
}
async function repairJourney(page) {
  await clearState(page);
  const located = await findConfig(page, 1); check(Boolean(located), 'ethics_repair_config_found');
  const { chapter, config } = located; const qid = config.expected_question_ids[0];
  const card = await answer(page, qid, 'repair'); const first = await attempt(page, config, qid);
  check(['WRONG','UNCERTAIN'].includes(first?.outcome), 'ethics_problem_first_attempt', JSON.stringify(first));
  const repair = card.locator('[data-politics-repair]'); await repair.waitFor({ state: 'visible' });
  await repair.locator('a[href^="#source-"]').click();
  const source = page.locator(`#${config.source_anchor}`); await source.waitFor({ state: 'visible' });
  const returnLink = source.locator(`[data-politics-return-to-question="${qid}"]`); await returnLink.waitFor({ state: 'visible' });
  const atSource = await last(page);
  check(atSource?.action === 'REPAIR_SOURCE' && atSource?.subject === 'ethics_law' && atSource?.chapter === chapter, 'ethics_repair_source_cursor', JSON.stringify(atSource));
  await returnLink.click(); await card.waitFor({ state: 'visible' });
  check(await card.locator('[data-politics-result]').isVisible(), 'ethics_repair_original_result_visible');
  check(await card.locator('[data-politics-repair]').isVisible(), 'ethics_repair_panel_visible');
  check(JSON.stringify(await attempt(page, config, qid)) === JSON.stringify(first), 'ethics_repair_first_attempt_immutable');
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], { cwd: process.cwd(), stdio: ['ignore','pipe','pipe'], detached: process.platform !== 'win32' });
let browser;
try {
  await waitForServer(); browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(); const page = await context.newPage();
  await smoke(page); await cleanJourney(page); await resumeJourney(page); await repairJourney(page);
  await context.close(); report.finished_at = new Date().toISOString(); report.status = 'PASS';
  report.boundaries = { mastery_claim: 'NONE', evidence_gate: 'R_ONLY', user_validation: 'UNTESTED_NOT_INFERRED' };
  fs.writeFileSync(path.join(auditDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log('POLITICS_ETHICS_RUNTIME_PASS'); console.log(JSON.stringify({ checks: report.checks.length }));
} catch (error) {
  report.finished_at = new Date().toISOString(); report.status = 'FAIL'; report.error = String(error?.stack || error);
  fs.writeFileSync(path.join(auditDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`); throw error;
} finally {
  if (browser) await browser.close();
  if (server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch { try { server.kill('SIGTERM'); } catch {} } }
}
