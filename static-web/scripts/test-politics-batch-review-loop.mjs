import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';
import { PRACTICE_KEYS as K } from '../src/lib/politicsPracticeState.mjs';

const PORT = 4350;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '../politics-batch-review-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = { schema: 'kianos.politics.batch_review_loop.v1', checks: [] };
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`POLITICS_BATCH_REVIEW_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const catalog = buildPoliticsPracticeCatalogCurrent('/');
const target = catalog.questions.find((q) => q.id === 'X1000-MARX-S-001') || catalog.questions.find((q) => q.unitKey);
if (!target) throw new Error('POLITICS_BATCH_REVIEW_TARGET_MISSING');

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try { if ((await fetch(`${BASE}/politics/`)).ok) return; } catch {}
    await sleep(180);
  }
  throw new Error('POLITICS_BATCH_REVIEW_SERVER_NOT_READY');
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();

  // Learning page owns orientation/source handoff only; no second attempt writer.
  const unitUrl = new URL(target.unitHref, BASE);
  await page.goto(unitUrl.href, { waitUntil: 'domcontentloaded' });
  check(await page.locator('[data-politics-question]').count() === 0, 'learning_page_has_no_inline_xiao_attempt');
  const entry = page.locator(`[data-practice-unit-entry="${target.unitKey}"]`);
  await entry.waitFor({ state: 'attached' });
  const entryHref = await entry.getAttribute('href');
  check(String(entryHref).includes('/politics/practice/?unit='), 'learning_page_routes_exact_unit_to_workbench', String(entryHref));
  check(!String(entryHref).includes('learnedScope=confirmed'), 'generic_unit_entry_keeps_learned_scope_gate');

  await page.goto(new URL(String(entryHref), BASE).href, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-learned-scope]').waitFor({ state: 'attached' });
  check(!(await page.locator('[data-learned-scope]').isChecked()), 'generic_unit_entry_does_not_auto_confirm_learning');

  await page.goto(unitUrl.href, { waitUntil: 'domcontentloaded' });
  const learnedUnit = page.locator(`[data-workspace-unit][data-unit-id="${target.unitId}"]`);
  await learnedUnit.waitFor({ state: 'visible' });
  await learnedUnit.locator('[data-workspace-action="start-learn"]').click();
  await learnedUnit.locator('[data-workspace-action="learn-done"]').click();
  await learnedUnit.locator('[data-workspace-action="recall-pass"]').click();
  await page.waitForURL(/learnedScope=confirmed/);
  await page.locator('[data-learned-scope]').waitFor({ state: 'attached' });
  check(await page.locator('[data-learned-scope]').isChecked(), 'completed_recall_handoff_auto_confirms_exact_learned_scope');

  // Formal Workbench is the only attempt/backside owner.
  await page.goto(`${BASE}/politics/practice/?unit=${encodeURIComponent(target.unitKey)}&question=${encodeURIComponent(target.id)}`, { waitUntil: 'domcontentloaded' });
  check(await page.inputValue('[data-filter-unit]') === target.unitKey, 'workbench_receives_exact_unit');
  await page.check('[data-learned-scope]');
  await page.click('[data-start-session]');
  await page.locator('[data-question-card]').waitFor({ state: 'visible' });
  const session = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), K.session);
  check(session?.ids?.[0] === target.id, 'workbench_deeplink_keeps_exact_question', JSON.stringify(session?.ids?.slice(0, 3)));

  await page.click('[data-uncertain]');
  for (const label of String(target.answer)) await page.click(`[data-option="${label}"]`);
  await page.click('[data-submit]');
  await page.locator('[data-submitted-result]').waitFor({ state: 'visible' });
  check((await page.locator('[data-takeaway]').innerText()).trim().length > 0, 'backside_takeaway_is_prebuilt_content');
  check((await page.locator('[data-chat-explanation]').innerText()).trim().length > 0, 'backside_refined_explanation_is_prebuilt_content');
  check(await page.locator('[data-cause-picker]').isVisible(), 'uncertain_correct_can_record_cause');
  await page.click('[data-cause="understanding"]');
  await page.fill('[data-note]', '批量复盘时一起看这个犹豫点');
  await page.waitForTimeout(350);

  const snapshot = await page.evaluate((keys) => ({
    evidence: JSON.parse(localStorage.getItem(keys.evidence) || '[]'),
    meta: JSON.parse(localStorage.getItem(keys.meta) || '{}')
  }), K);
  check(snapshot.evidence.some((e) => e.question_id === target.id && e.outcome === 'UNCERTAIN'), 'uncertain_evidence_recorded');
  check(snapshot.meta?.causes?.[target.id] === 'understanding', 'learner_cause_recorded');
  check(snapshot.meta?.notes?.[target.id] === '批量复盘时一起看这个犹豫点', 'learner_note_recorded');

  await page.click('[data-next-question]');
  const unfinishedSession = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), K.session);
  check(unfinishedSession?.status === 'active' && unfinishedSession.index === 1, 'unfinished_session_advances_without_erasing_review_evidence');

  // Home shows records/Review entry but does not auto-export Chat packets.
  await page.goto(`${BASE}/politics/`, { waitUntil: 'domcontentloaded' });
  check(await page.locator('[data-politics-copy-handoff]').count() === 0, 'home_has_no_direct_chat_export');
  const currentDock = page.locator('.kianosCurrentDock');
  const currentDockCount = await currentDock.count();
  const currentDockDisplay = currentDockCount ? await currentDock.evaluate((n) => getComputedStyle(n).display) : 'absent';
  check(currentDockCount === 0 || currentDockDisplay === 'none', 'politics_has_no_visible_engineering_current_dock', currentDockDisplay);

  // Review is the intentional batch Chat handoff owner.
  await page.goto(`${BASE}/politics/review/`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-politics-review][data-ready="true"]').waitFor({ state: 'visible' });
  const reviewRow = page.locator(`[data-review-question="${target.id}"]`);
  check(await reviewRow.count() === 1, 'review_collects_problem_question');
  check(await reviewRow.locator('a').count() === 0, 'review_old_problem_does_not_expose_dead_exact_question_link_during_unfinished_session');
  check(await page.locator('[data-review-action]').isHidden(), 'review_does_not_start_competing_review_session_while_workbench_is_unfinished');
  const resumeHref = await page.locator('[data-review-resume-link]').getAttribute('href');
  check(
    String(resumeHref).includes(`session=${encodeURIComponent(unfinishedSession.id)}`)
      && String(resumeHref).includes(`question=${encodeURIComponent(unfinishedSession.ids[unfinishedSession.index])}`),
    'review_resume_targets_exact_current_unfinished_question',
    String(resumeHref)
  );
  await page.click('[data-review-copy]');
  const packetText = await page.evaluate(() => navigator.clipboard.readText());
  const packet = JSON.parse(packetText);
  check(packet.schema === 'kianos.politics.return_packet.v1', 'review_exports_one_batch_packet');
  const ctx = packet.review_context.find((row) => row.question_id === target.id);
  check(Boolean(ctx), 'batch_packet_contains_question');
  check(ctx.cause === 'understanding', 'batch_packet_contains_learner_cause');
  check(ctx.note === '批量复盘时一起看这个犹豫点', 'batch_packet_contains_learner_note');

  report.status = 'PASS';
  report.target = { id: target.id, unitKey: target.unitKey };
  fs.writeFileSync(path.join(auditDir, 'batch-review-loop.json'), JSON.stringify(report, null, 2));
  console.log('POLITICS_BATCH_REVIEW_LOOP_PASS');
  await context.close();
} catch (error) {
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.writeFileSync(path.join(auditDir, 'batch-review-loop.json'), JSON.stringify(report, null, 2));
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
}
