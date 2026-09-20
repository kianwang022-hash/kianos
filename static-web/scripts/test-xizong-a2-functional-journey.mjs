import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { loadXizongSystem, loadXizongBlock } from '../src/lib/xizong.mjs';

const PORT = 4326;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '../xizong-a2-functional-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = { schema: 'kianos.xizong.a2.functional_first_journey.v2', started_at: new Date().toISOString(), checks: [] };
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`A2_FUNCTIONAL_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const answerLetters = (value) => (String(value || '').toUpperCase().match(/[A-Z]/g) || []).sort();

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try { const r = await fetch(`${BASE}/xizong/`); if (r.ok) return; } catch {}
    await sleep(250);
  }
  throw new Error('A2_PREVIEW_SERVER_NOT_READY');
}

async function clearXizong(page) {
  await page.goto(`${BASE}/xizong/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
}

async function visibleStage(root) {
  return root.locator('[data-study-stage]:visible').first().getAttribute('data-study-stage');
}

async function blockResumeAndEvidenceJourney(page) {
  const route = `${BASE}/xizong/respiratory/r01/`;
  const studyKey = 'kianos-xizong-astro-v2:xizong:respiratory-r01';
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-xizong-v6-block]');
  await root.waitFor({ state: 'visible' });
  const recallCards = root.locator('[data-kp-recall-card]');
  const kpCount = await recallCards.count();

  check(kpCount > 0, 'r01_recall_inventory_present', String(kpCount));
  check(await visibleStage(root) === 'block_learn', 'r01_starts_at_block_orientation');
  check(await root.locator('[data-kp-learn-card]').count() === 0, 'legacy_per_kp_web_learn_surface_absent');

  await root.locator('[data-stage-next="logic_group"]').click();
  await root.locator('[data-study-stage="source_contact"]').waitFor({ state: 'visible' });
  let state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(state?.stage === 'source_contact' && state?.sourceContactDone === false, 'block_orientation_enters_continuous_source_contact');
  check(Object.keys(state?.ratings || {}).length === 0, 'source_contact_does_not_manufacture_recall_evidence');

  const savedGroup = state.groupIndex;
  const savedIndex = state.kpIndex;
  await page.reload({ waitUntil: 'domcontentloaded' });
  await root.locator('[data-study-stage="source_contact"]').waitFor({ state: 'visible' });
  state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(state?.stage === 'source_contact' && state?.groupIndex === savedGroup && state?.kpIndex === savedIndex, 'refresh_restores_continuous_source_contact');
  check(await root.locator('[data-stage-target="kp_recall"]').count() === 0, 'retired_direct_recall_shortcut_absent');
  check(await root.locator('[data-study-stage="kp_recall"]:visible').count() === 0, 'recall_not_released_before_source_contact');

  await root.locator('[data-source-contact-done]').click();
  await page.waitForTimeout(100);
  let stage = await visibleStage(root);
  if (stage === 'ttsx_checkpoint') {
    await root.locator('[data-ttsx-done]').click();
    await page.waitForTimeout(100);
    stage = await visibleStage(root);
  }
  check(stage === 'kp_recall', 'continuous_source_contact_enters_current_recall_flow', stage);

  state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  const learnedIds = Object.entries(state?.learned || {}).filter(([, learned]) => Boolean(learned)).map(([id]) => id);
  check(state?.sourceContactDone === true, 'continuous_source_contact_persists');
  check(learnedIds.length === kpCount, 'block_source_contact_marks_current_block_contact_only', `${learnedIds.length}/${kpCount}`);

  const recall = root.locator('[data-kp-recall-card]:not([hidden])');
  const attemptedKp = await recall.getAttribute('data-kp-id');
  check(Boolean(attemptedKp) && state?.learned?.[attemptedKp] === true, 'visible_recall_belongs_to_source_contacted_block');
  await recall.locator('[data-kp-reveal]').click();
  await recall.locator('[data-rating="mastered"]').click();
  await page.waitForTimeout(160);
  state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(state?.ratings?.[attemptedKp] === 'mastered', 'learned_kp_recall_persists');

  const allKpIds = await recallCards.evaluateAll((cards) => cards.map((c) => c.getAttribute('data-kp-id')).filter(Boolean));
  await page.evaluate(({ key, kpIds }) => {
    const learned = Object.fromEntries(kpIds.map((id) => [id, true]));
    const ratings = Object.fromEntries(kpIds.map((id) => [id, 'mastered']));
    localStorage.setItem(key, JSON.stringify({
      stage: 'block_recall',
      groupIndex: 0,
      kpIndex: 0,
      sourceContactDone: true,
      learned,
      ratings,
      ttsxEvidence: {},
      ttsxAnnotations: {},
      pendingTtsx: null,
      blockRecallDone: false,
      completed: false
    }));
  }, { key: studyKey, kpIds: allKpIds });
  await page.reload({ waitUntil: 'domcontentloaded' });

  const complete = root.locator('[data-block-complete]');
  check(await visibleStage(root) === 'block_recall', 'complete_candidate_reopens_at_block_recall');
  check(await complete.isDisabled(), 'block_recall_required_for_completion');
  await root.locator('[data-block-recall-reveal]').click();
  await root.locator('[data-block-recall-complete]').click();
  await page.waitForTimeout(80);
  state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(state?.blockRecallDone === true && state?.completed !== true, 'block_recall_is_separate_from_final_completion');
  check(!(await complete.isDisabled()), 'block_recall_unlocks_completion');
  await complete.click();
  state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(state?.completed === true, 'block_completion_persists_after_all_evidence');

  await page.goto(`${BASE}/xizong/`, { waitUntil: 'domcontentloaded' });
  const continueLink = page.locator('[data-xizong-continue]');
  check((await continueLink.getAttribute('href') || '').includes('/xizong/respiratory/r01/'), 'home_continue_returns_to_recent_block');
}

async function systemQuestionRepairJourney(page) {
  const respiratory = loadXizongSystem('respiratory');
  const completedBlocks = Object.fromEntries(respiratory.blocks.map((ref) => {
    const block = loadXizongBlock('respiratory', ref.slug);
    return [block.blockId, {
      completed: true,
      blockRecallDone: true,
      learned: Object.fromEntries(block.kpRecords.map((kp) => [kp.kpId, true])),
      ratings: Object.fromEntries(block.kpRecords.map((kp) => [kp.kpId, 'known']))
    }];
  }));

  await page.goto(`${BASE}/xizong/respiratory/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((rows) => {
    Object.entries(rows).forEach(([id, state]) => {
      localStorage.setItem(`kianos-xizong-astro-v2:xizong:${id}`, JSON.stringify(state));
    });
  }, completedBlocks);
  await page.goto(`${BASE}/xizong/respiratory/recall/`, { waitUntil: 'domcontentloaded' });
  const recall = page.locator('[data-xizong-system-exit="respiratory"]');
  await recall.waitFor({ state: 'visible' });
  check(await page.locator('[data-xizong-system-recall-lock]').isHidden(), 'completed_system_releases_dedicated_recall');
  await recall.locator('[data-reveal-recall]').click();
  await recall.locator('[data-complete-recall]').click();
  const recallState = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos:xizong:system-recall:respiratory:v1') || 'null'));
  check(Boolean(recallState?.completedAt), 'system_recall_persists_after_all_blocks');
  check(await recall.locator('[data-practice-handoff]').isVisible(), 'system_recall_releases_practice_handoff');

  await page.goto(`${BASE}/xizong/practice/respiratory/`, { waitUntil: 'networkidle' });
  const practice = page.locator('[data-xizong-practice="respiratory"]');
  await practice.waitFor({ state: 'visible' });
  const payload = JSON.parse((await practice.locator('[data-sweep-payload]').textContent()) || 'null');
  const target = payload.questions.find((q) => q?.relation?.primaryKpId && q?.relation?.blockId && q?.relation?.knowledgePath);
  check(Boolean(target), 'reviewed_relation_question_exists');
  const holdoutYear = payload.years.find((year) => Number(year) !== Number(target.year));
  check(Boolean(holdoutYear), 'non_target_holdout_year_exists');

  await practice.locator('.xzpMore').evaluate((node) => { node.open = true; });
  await practice.locator('[data-holdout-control]').evaluate((node) => { node.open = true; });
  await practice.locator('[data-holdout-input]').fill(String(holdoutYear));
  await practice.locator('[data-save-holdout]').click();
  await practice.locator('[data-question-card]').waitFor({ state: 'visible' });

  const mapTarget = practice.locator(`.xzpMapItem[title="${target.year} · 第 ${target.number} 题"]`);
  await mapTarget.click();
  check((await practice.locator('[data-question-meta]').textContent() || '').includes(`第 ${target.number} 题`), 'reviewed_target_selected_in_current_workbench');

  await practice.locator('[data-question-uncertain]').click();
  check((await practice.locator('[data-question-uncertain]').getAttribute('aria-pressed')) === 'true', 'learner_uncertainty_explicit_before_submit');
  for (const letter of answerLetters(target.correctAnswer)) {
    await practice.locator(`[data-question-options] [data-option="${letter}"]`).click();
  }
  await practice.locator('[data-submit-answer]').click();
  await page.waitForTimeout(150);
  check((await practice.locator('[data-answer-result]').textContent() || '').includes('不确定'), 'correct_but_unsure_stays_uncertain');

  const sweepKey = 'kianos:xizong:system-question-sweep:respiratory:v1';
  const firstPassState = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), sweepKey);
  check(firstPassState?.results?.[target.questionId]?.status === 'uncertain', 'uncertain_result_persists');
  check((firstPassState?.attemptHistory || []).some((event) =>
    event.question_id === target.questionId && event.status === 'uncertain' && event.evidence_origin === 'USER_QUESTION_ATTEMPT'
  ), 'uncertain_attempt_is_append_preserved');
  check(await practice.locator('[data-relation-wrap]').isVisible(), 'reviewed_relation_released_after_attempt');
  check((await practice.locator('[data-relation-link]').getAttribute('href') || '').includes(String(target.relation.knowledgePath).replace(/^\/+/,'')), 'reviewed_relation_targets_exact_knowledge_path');

  const repair = page.locator('[data-xizong-repair-return="respiratory"]');
  await repair.locator(':scope > summary').click();
  const plan = JSON.stringify({ plan: [{
    question_id: target.questionId,
    reason: 'A2 functional journey',
    action: 'repair reviewed owning KP only',
    priority: 'high'
  }] });
  await repair.locator('[data-plan-text]').fill(plan);
  await repair.locator('[data-apply-plan]').click();

  const routeLink = repair.locator('[data-plan-list] a').first();
  await routeLink.waitFor({ state: 'visible' });
  const memoryAfterPlan = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-xizong-memory-v1') || 'null'));
  const visibleRepair = (memoryAfterPlan?.repairTasks || []).find((task) =>
    task?.kpId === target.relation.primaryKpId && (task?.sourceQuestionIds || []).includes(target.questionId)
  );
  check(Boolean(visibleRepair), 'reviewed_wu_enters_visible_memory_repair');
  check(String(visibleRepair?.returnHref || '').includes('/xizong/practice/respiratory/'), 'visible_repair_keeps_question_return');

  const [repairPage] = await Promise.all([
    page.context().waitForEvent('page'),
    routeLink.click()
  ]);
  await repairPage.waitForLoadState('domcontentloaded');
  await repairPage.waitForTimeout(500);
  const repairEvidence = await repairPage.evaluate(({ blockId, kpId }) => {
    const ext = JSON.parse(localStorage.getItem(`kianos-xizong-memory-review-v2:xizong:${blockId}`) || 'null');
    return {
      inPlan: Array.isArray(ext?.reviewPlan) && ext.reviewPlan.some((row) => String(row?.kpId || row?.kp_id || row || '') === kpId),
      imported: Array.isArray(ext?.evidenceHistory) && ext.evidenceHistory.some((row) =>
        row?.type === 'SYSTEM_WU_PLAN_IMPORTED' && row?.evidence_role === 'REPAIR_ONLY'
      )
    };
  }, { blockId: target.relation.blockId, kpId: target.relation.primaryKpId });
  check(repairEvidence.inPlan && repairEvidence.imported, 'reviewed_wu_routes_to_owner_as_repair_only');
  await repairPage.close();

  check(!page.isClosed(), 'original_practice_tab_preserved_for_return');
  const stateAfterRepair = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), sweepKey);
  check(stateAfterRepair?.results?.[target.questionId]?.status === 'uncertain', 'repair_does_not_rewrite_question_attempt');
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await clearXizong(page);
  await blockResumeAndEvidenceJourney(page);
  await systemQuestionRepairJourney(page);
  await context.close();
  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.evidence_class = 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U';
  fs.writeFileSync(path.join(auditDir, 'journey.json'), JSON.stringify(report, null, 2));
  console.log(`A2_FUNCTIONAL_FIRST_JOURNEY_PASS | checks=${report.checks.length}`);
} catch (error) {
  report.finished_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.writeFileSync(path.join(auditDir, 'journey.json'), JSON.stringify(report, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close().catch(() => {});
  if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch {} }
  else { try { server.kill('SIGTERM'); } catch {} }
  server.stdout?.destroy(); server.stderr?.destroy();
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGKILL'); } catch {} }
    else { try { server.kill('SIGKILL'); } catch {} }
  }
}
