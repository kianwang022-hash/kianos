import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4331;
const BASE = `http://127.0.0.1:${PORT}`;
const reportPath = path.resolve(process.cwd(), '.qa/xizong-golden-journey.json');
const report = {
  schema: 'kianos.xizong.golden_journey.v1',
  representative: 'circulation/b02',
  started_at: new Date().toISOString(),
  checks: []
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_GOLDEN_JOURNEY_FAIL:${name}${detail ? `:${detail}` : ''}`);
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
  const visibleStage = async () => page.locator('[data-study-stage]:visible').first().getAttribute('data-study-stage');
  const readState = async () => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  const completeButton = page.locator('[data-block-complete]');

  check(await root.count() === 1, 'existing_v6_runtime_mounted');
  check(await root.getAttribute('data-source-contact-mode') !== 'WHOLE_LOGIC_GROUP', 'representative_uses_natural_block_source_contact');
  check(await page.locator('[data-xizong-attention]').count() === 1, 'attention_projection_present');
  check(await page.locator('[data-xizong-cognitive-projection]').count() === 1, 'compiled_projection_present');
  check(await visibleStage() === 'block_learn', 'clean_state_starts_at_orientation');
  check(await completeButton.isDisabled(), 'completion_locked_before_learning');

  await page.locator('[data-stage-next="logic_group"]').click();
  check(await visibleStage() === 'source_contact', 'orientation_enters_one_continuous_source_contact');
  let state = await readState();
  check(Object.keys(state?.learned || {}).length === 0, 'source_entry_does_not_manufacture_contact_evidence');
  check(Object.keys(state?.ratings || {}).length === 0, 'source_entry_does_not_manufacture_recall_evidence');
  check(state?.completed !== true, 'source_entry_does_not_manufacture_completion');

  await page.locator('[data-source-contact-done]').click();
  check(await visibleStage() === 'logic_group', 'source_confirmation_returns_to_retrieval_orientation');
  state = await readState();
  const totalKp = await page.locator('[data-kp-recall-card]').count();
  const groupCount = await page.locator('[data-group-target]').count();
  const learnedCountAfterSource = Object.values(state?.learned || {}).filter(Boolean).length;
  check(state?.sourceContactDone === true, 'source_contact_confirmation_persisted');
  check(totalKp > 0 && learnedCountAfterSource === totalKp, 'source_contact_releases_all_block_kps_for_retrieval', `${learnedCountAfterSource}/${totalKp}`);
  check(Object.keys(state?.ratings || {}).length === 0, 'source_contact_is_not_recall_mastery');
  check(state?.completed !== true, 'source_contact_is_not_block_completion');

  let ratedTotal = 0;
  let fuzzyKpId = '';
  for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
    check(await visibleStage() === 'logic_group', 'logic_group_orientation_reached', `${groupIndex + 1}/${groupCount}`);
    await page.locator('[data-enter-group]').click();
    check(await visibleStage() === 'kp_recall', 'natural_source_group_enters_recall_directly', `${groupIndex + 1}/${groupCount}`);
    check(await page.locator('[data-study-stage="source_contact"]:visible').count() === 0, 'source_not_reopened_for_logic_group', `${groupIndex + 1}/${groupCount}`);
    check(await page.locator('[data-study-stage="kp_learn"]:visible').count() === 0, 'no_fake_per_group_lecture_for_natural_source_mode', `${groupIndex + 1}/${groupCount}`);

    let safety = 0;
    while ((await visibleStage()) === 'kp_recall' && safety++ < totalKp + 5) {
      const card = page.locator('[data-kp-recall-card]:visible');
      const kpId = await card.getAttribute('data-kp-id');
      check(Boolean(kpId), 'visible_recall_card_has_real_kp', kpId || '');
      const reveal = card.locator('[data-kp-reveal]:visible');
      if (await reveal.count()) await reveal.click();
      const rating = fuzzyKpId ? 'known' : 'fuzzy';
      await card.locator(`[data-rating="${rating}"]`).click();
      if (!fuzzyKpId) fuzzyKpId = kpId || '';
      ratedTotal += 1;
      await page.waitForTimeout(170);
    }
    check(safety <= totalKp + 5, 'recall_loop_terminated', `${groupIndex + 1}/${groupCount}`);
    check(await visibleStage() === 'group_close', 'logic_group_closes_after_real_retrieval', `${groupIndex + 1}/${groupCount}`);
    await page.locator('[data-group-close-next]').click();
    if (groupIndex < groupCount - 1) {
      check(await visibleStage() === 'logic_group', 'next_logic_group_reached_without_source_bounce', `${groupIndex + 2}/${groupCount}`);
    }
  }

  check(await visibleStage() === 'block_recall', 'all_logic_groups_flow_into_block_recall');
  state = await readState();
  check(ratedTotal === totalKp, 'every_kp_received_real_recall_evidence', `${ratedTotal}/${totalKp}`);
  check(Object.keys(state?.ratings || {}).length === totalKp, 'all_recall_ratings_persisted', `${Object.keys(state?.ratings || {}).length}/${totalKp}`);
  check(state?.ratings?.[fuzzyKpId] === 'fuzzy', 'journey_preserves_nonmastered_first_pass_evidence', fuzzyKpId);
  check(state?.blockRecallDone !== true, 'block_recall_not_precompleted');
  check(state?.completed !== true, 'block_not_completed_before_block_recall');
  check(await completeButton.isDisabled(), 'final_completion_still_locked_before_block_recall');

  await page.locator('[data-block-recall-complete]').click();
  check(await visibleStage() === 'block_complete', 'block_recall_enters_completion_gate');
  state = await readState();
  check(state?.blockRecallDone === true, 'block_recall_completion_persisted');
  check(state?.completed !== true, 'completion_requires_explicit_final_confirmation');
  check(!(await completeButton.isDisabled()), 'final_completion_unlocks_only_after_required_evidence');

  await completeButton.click();
  state = await readState();
  check(state?.completed === true, 'explicit_final_completion_persisted');
  check(await completeButton.isDisabled(), 'completed_block_cannot_be_double_completed');
  check(state?.ratings?.[fuzzyKpId] === 'fuzzy', 'completion_does_not_upgrade_fuzzy_to_mastered', fuzzyKpId);

  await page.reload({ waitUntil: 'networkidle' });
  state = await readState();
  check(await visibleStage() === 'block_complete', 'completed_stage_survives_reload');
  check(state?.sourceContactDone === true, 'source_contact_survives_reload');
  check(Object.values(state?.learned || {}).filter(Boolean).length === totalKp, 'source_contact_coverage_survives_reload');
  check(Object.keys(state?.ratings || {}).length === totalKp, 'recall_evidence_survives_reload');
  check(state?.blockRecallDone === true && state?.completed === true, 'block_completion_survives_reload');
  check(state?.ratings?.[fuzzyKpId] === 'fuzzy', 'nonmastered_evidence_survives_reload', fuzzyKpId);
  const v3Keys = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('kianos-xizong-astro-v3:')));
  check(v3Keys.length === 0, 'no_parallel_v3_store_created');

  report.completed_at = new Date().toISOString();
  report.status = 'PASS';
  report.source_contact_mode = await root.getAttribute('data-source-contact-mode');
  report.logic_groups = groupCount;
  report.total_kp = totalKp;
  report.fuzzy_kp = fuzzyKpId;
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`XIZONG_GOLDEN_JOURNEY PASS | groups=${groupCount} | KP=${totalKp} | fuzzy=${fuzzyKpId} | checks=${report.checks.length}`);
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
