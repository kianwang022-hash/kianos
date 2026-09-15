import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4326;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '../xizong-a2-functional-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = { schema: 'kianos.xizong.a2.functional_first_journey.v1', started_at: new Date().toISOString(), checks: [] };
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`A2_FUNCTIONAL_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
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

async function blockResumeAndEvidenceJourney(page) {
  await page.goto(`${BASE}/xizong/respiratory/r01/`, { waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-xizong-v6-block]');
  await root.waitFor({ state: 'visible' });
  const recallCards = root.locator('[data-kp-recall-card]');
  const kpCount = await recallCards.count();
  check(kpCount > 0, 'r01_recall_inventory_present', String(kpCount));
  check(await root.locator('[data-kp-learn-card]').count() === 0, 'legacy_per_kp_web_learn_surface_absent');

  await root.locator('[data-stage-next="logic_group"]').click();
  await root.locator('[data-enter-group]').click();
  const studyKey = 'kianos-xizong-astro-v2:xizong:respiratory-r01';
  let state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(state?.stage === 'kp_learn', 'enters_group_lecture_stage');
  const savedGroup = state.groupIndex;
  const savedIndex = state.kpIndex;

  await page.reload({ waitUntil: 'domcontentloaded' });
  state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(state?.stage === 'kp_learn' && state?.groupIndex === savedGroup && state?.kpIndex === savedIndex, 'refresh_restores_group_lecture_stage');

  await root.locator('[data-stage-target="kp_recall"]').click();
  await page.waitForTimeout(80);
  state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(state?.stage === 'kp_learn', 'premature_recall_stage_blocked');
  check(Object.keys(state?.ratings || {}).length === 0, 'premature_recall_cannot_manufacture_evidence');

  await root.locator('[data-group-lecture-done]').click();
  await page.waitForTimeout(80);
  state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  const learnedIds = Object.entries(state?.learned || {}).filter(([, learned]) => Boolean(learned)).map(([id]) => id);
  check(state?.stage === 'kp_recall', 'group_lecture_enters_recall');
  check(learnedIds.length > 0, 'group_learning_contact_persisted', String(learnedIds.length));

  const recall = root.locator('[data-kp-recall-card]:not([hidden])');
  const attemptedKp = await recall.getAttribute('data-kp-id');
  check(Boolean(attemptedKp) && state?.learned?.[attemptedKp] === true, 'visible_recall_belongs_to_learned_group');
  await recall.locator('[data-kp-reveal]').click();
  await recall.locator('[data-rating="mastered"]').click();
  await page.waitForTimeout(160);
  state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(state?.ratings?.[attemptedKp] === 'mastered', 'learned_kp_recall_persists');

  const allKpIds = await recallCards.evaluateAll((cards) => cards.map((c) => c.getAttribute('data-kp-id')).filter(Boolean));
  await page.evaluate(({ key, kpIds }) => {
    const learned = Object.fromEntries(kpIds.map((id) => [id, true]));
    const ratings = Object.fromEntries(kpIds.map((id) => [id, 'mastered']));
    localStorage.setItem(key, JSON.stringify({ stage: 'block_complete', groupIndex: 0, kpIndex: 0, learned, ratings, blockRecallDone: false, completed: false }));
  }, { key: studyKey, kpIds: allKpIds });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const complete = root.locator('[data-block-complete]');
  check(await complete.isDisabled(), 'block_recall_required_for_completion');
  await complete.evaluate((button) => {
    button.disabled = false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(state?.completed !== true, 'capture_guard_rejects_completion_without_block_recall');

  await root.locator('[data-stage-target="block_recall"]').click();
  await root.locator('[data-block-recall-complete]').click();
  await page.waitForTimeout(60);
  state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(state?.blockRecallDone === true && state?.stage === 'block_complete', 'block_recall_persists_and_returns_to_completion');
  check(!(await complete.isDisabled()), 'block_recall_unlocks_completion');
  await complete.click();
  state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(state?.completed === true, 'block_completion_persists_after_all_evidence');

  await page.goto(`${BASE}/xizong/`, { waitUntil: 'domcontentloaded' });
  const continueLink = page.locator('[data-xizong-continue]');
  check((await continueLink.getAttribute('href') || '').includes('/xizong/respiratory/r01/'), 'home_continue_returns_to_recent_block');
}

async function systemQuestionRepairJourney(page) {
  const blockIds = [
    'respiratory-r01','respiratory-r02','respiratory-r03','respiratory-r04','respiratory-r05','respiratory-r06',
    'respiratory-r07','respiratory-r08','respiratory-r09','respiratory-r10','respiratory-r11','respiratory-r12'
  ];
  await page.goto(`${BASE}/xizong/respiratory/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((ids) => {
    ids.forEach((id) => {
      const key = `kianos-xizong-astro-v2:xizong:${id}`;
      const old = JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify({ ...old, completed: true }));
    });
  }, blockIds);
  await page.reload({ waitUntil: 'domcontentloaded' });

  const later = page.locator('[data-xizong-later-stage="system-exit"]');
  await later.locator(':scope > summary').click();
  const exit = page.locator('[data-xizong-system-exit="respiratory"]');
  await exit.locator('[data-start-recall]').click();
  await exit.locator('[data-reveal-recall]').click();
  await exit.locator('[data-complete-recall]').click();
  check((await page.evaluate(() => JSON.parse(localStorage.getItem('kianos:xizong:system-recall:respiratory:v1') || 'null')))?.completedAt, 'system_recall_persists_after_all_blocks');

  const payload = await exit.locator('[data-sweep-payload]').evaluate((node) => JSON.parse(node.textContent || 'null'));
  const target = payload.questions.find((q) => q?.relation?.primaryKpId && q?.relation?.blockId);
  check(Boolean(target), 'reviewed_relation_question_exists');
  const holdoutYear = payload.years.find((year) => Number(year) !== Number(target.year));
  check(Boolean(holdoutYear), 'non_target_holdout_year_exists');
  await exit.locator('[data-holdout-input]').fill(String(holdoutYear));
  await exit.locator('[data-save-holdout]').click();

  await page.evaluate(({ targetId, heldYear, questions }) => {
    const active = questions.filter((q) => Number(q.year) !== Number(heldYear));
    const results = {};
    for (const q of active) {
      if (q.questionId === targetId) break;
      results[q.questionId] = { status: 'stable', selected: [], correctAnswer: q.correctAnswer, updatedAt: new Date().toISOString() };
    }
    localStorage.setItem('kianos:xizong:system-question-sweep:respiratory:v1', JSON.stringify({ results }));
  }, { targetId: target.questionId, heldYear: holdoutYear, questions: payload.questions });

  await exit.locator('[data-start-sweep]').click();
  const workspace = exit.locator('[data-question-workspace]');
  await workspace.waitFor({ state: 'visible' });
  check((await exit.locator('[data-question-meta]').textContent() || '').includes(String(target.number)), 'reviewed_target_is_current_question');

  const correctLetters = String(target.correctAnswer || '').toUpperCase().match(/[A-Z]/g) || [];
  for (const letter of correctLetters) await exit.locator(`[data-question-options] [data-option="${letter}"]`).click();
  await exit.locator('[data-submit-answer]').click();
  await exit.locator('[data-mark-uncertain]').click();
  const saved = await page.evaluate((qid) => JSON.parse(localStorage.getItem('kianos:xizong:system-question-sweep:respiratory:v1') || '{"results":{}}').results?.[qid], target.questionId);
  check(saved?.status === 'uncertain', 'uncertain_result_persists_as_question_evidence');

  const repair = page.locator('[data-xizong-repair-return="respiratory"]');
  await repair.locator(':scope > summary').click();
  const plan = JSON.stringify({ plan: [{ question_id: target.questionId, reason: 'functional journey', action: 'repair owning KP', priority: 'high' }] });
  await repair.locator('[data-plan-text]').fill(plan);
  await repair.locator('[data-apply-plan]').click();
  const routeLink = repair.locator('[data-plan-list] a').first();
  await routeLink.waitFor({ state: 'visible' });

  const [repairPage] = await Promise.all([
    page.context().waitForEvent('page'),
    routeLink.click()
  ]);
  await repairPage.waitForLoadState('domcontentloaded');
  await repairPage.waitForTimeout(500);
  const relation = target.relation;
  const repairEvidence = await repairPage.evaluate(({ blockId, kpId }) => {
    const ext = JSON.parse(localStorage.getItem(`kianos-xizong-memory-review-v2:xizong:${blockId}`) || 'null');
    return {
      inPlan: Array.isArray(ext?.reviewPlan) && ext.reviewPlan.some((row) => String(row?.kpId || row?.kp_id || row || '') === kpId),
      imported: Array.isArray(ext?.evidenceHistory) && ext.evidenceHistory.some((row) => row?.type === 'SYSTEM_WU_PLAN_IMPORTED' && row?.evidence_role === 'REPAIR_ONLY')
    };
  }, { blockId: relation.blockId, kpId: relation.primaryKpId });
  check(repairEvidence.inPlan && repairEvidence.imported, 'reviewed_wu_routes_to_owner_as_repair_only');
  await repairPage.close();

  check(!page.isClosed(), 'original_sweep_tab_preserved_for_return');
  const savedAfterRepair = await page.evaluate((qid) => JSON.parse(localStorage.getItem('kianos:xizong:system-question-sweep:respiratory:v1') || '{"results":{}}').results?.[qid], target.questionId);
  check(savedAfterRepair?.status === 'uncertain', 'repair_does_not_rewrite_original_question_evidence');
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
  console.log('A2_FUNCTIONAL_FIRST_JOURNEY_PASS');
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
