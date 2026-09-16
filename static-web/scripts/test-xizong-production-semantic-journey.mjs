import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4328;
const BASE = `http://127.0.0.1:${PORT}`;
const reportPath = path.resolve(process.cwd(), '.qa/xizong-a1-browser-runtime.json');
const report = {
  schema: 'kianos.xizong.production_semantic_browser_journey.v1',
  started_at: new Date().toISOString(),
  checks: []
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_PRODUCTION_BROWSER_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};

async function waitForHttp(url, attempts = 120) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await sleep(200);
  }
  throw new Error(`HTTP_NOT_READY:${url}`);
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});
let browser;

try {
  await waitForHttp(`${BASE}/xizong/`);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1512, height: 982 } });
  const blockUrl = `${BASE}/xizong/circulation/b02/`;
  const studyKey = 'kianos-xizong-astro-v2:xizong:circulation-b02';

  await page.goto(blockUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle' });

  const root = page.locator('[data-xizong-v6-block]');
  check(await root.count() === 1, 'v6_production_family_mounted');
  const sourceMode = await root.getAttribute('data-source-contact-mode');
  check(sourceMode !== 'WHOLE_LOGIC_GROUP', 'a1_b02_not_forced_to_whole_lg_source_contact', sourceMode || '');
  check(await page.locator('[data-xizong-cognitive-projection]').count() === 1, 'compiled_projection_mounted');
  check(await page.locator('[data-xizong-attention]').count() === 1, 'attention_projection_mounted');
  check(await page.locator('[data-projection-role="MAP"]').count() + await page.locator('[data-projection-role="PROBLEM"]').count() > 0, 'semantic_projection_objects_present');

  const visibleStage = async () => page.locator('[data-study-stage]:visible').first().getAttribute('data-study-stage');
  check(await visibleStage() === 'block_learn', 'clean_state_starts_at_block_orientation');

  await page.locator('[data-stage-next="logic_group"]').click();
  check(await visibleStage() === 'source_contact', 'block_orientation_enters_continuous_source_contact');
  let state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(Object.keys(state?.learned || {}).length === 0, 'entering_source_contact_does_not_manufacture_evidence');

  await page.locator('[data-source-contact-done]').click();
  check(await visibleStage() === 'logic_group', 'source_contact_returns_to_retrieval_orientation');
  state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  const totalKp = await page.locator('[data-kp-recall-card]').count();
  const learnedCount = Object.values(state?.learned || {}).filter(Boolean).length;
  check(state?.sourceContactDone === true, 'continuous_source_contact_confirmation_persisted');
  check(learnedCount === totalKp && totalKp > 0, 'continuous_source_contact_releases_block_retrieval', `${learnedCount}/${totalKp}`);

  await page.locator('[data-enter-group]').click();
  check(await visibleStage() === 'kp_recall', 'natural_source_mode_goes_directly_to_group_recall');
  check(await page.locator('[data-study-stage="kp_learn"]:visible').count() === 0, 'no_lg_by_lg_source_bounce_after_continuous_contact');

  const firstGroupId = await page.locator('[data-kp-recall-card]:visible').getAttribute('data-kp-id');
  check(Boolean(firstGroupId), 'first_group_recall_has_real_kp');
  let safety = 0;
  while ((await visibleStage()) === 'kp_recall' && safety++ < 30) {
    const reveal = page.locator('[data-kp-recall-card]:visible [data-kp-reveal]:visible');
    if (await reveal.count()) await reveal.click();
    await page.locator('[data-kp-recall-card]:visible [data-rating="mastered"]').click();
    await sleep(180);
  }
  check(await visibleStage() === 'group_close', 'first_logic_group_closes_after_retrieval');

  await page.locator('[data-group-close-next]').click();
  check(await visibleStage() === 'logic_group', 'next_logic_group_orientation_reached');
  await page.locator('[data-enter-group]').click();
  check(await visibleStage() === 'kp_recall', 'second_logic_group_recall_without_source_reentry');
  check(await page.locator('[data-study-stage="source_contact"]:visible').count() === 0, 'continuous_source_not_reopened_between_logic_groups');

  state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(state?.sourceContactDone === true, 'source_contact_state_survives_group_transition');
  check(Object.keys(state?.ratings || {}).length > 0, 'real_recall_evidence_persisted');

  report.completed_at = new Date().toISOString();
  report.source_contact_mode = sourceMode;
  report.total_kp = totalKp;
  report.status = 'PASS';
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`XIZONG_PRODUCTION_SEMANTIC_BROWSER PASS | source=${sourceMode} | KP=${totalKp} | checks=${report.checks.length}`);
} catch (error) {
  report.completed_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  throw error;
} finally {
  try { await browser?.close(); } catch {}
  try {
    if (process.platform === 'win32') server.kill();
    else process.kill(-server.pid, 'SIGTERM');
  } catch { try { server.kill('SIGTERM'); } catch {} }
}
