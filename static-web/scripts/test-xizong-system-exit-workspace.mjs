import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { loadXizongSystem } from '../src/lib/xizong.mjs';
import { loadXizongSystemQuestionSweep } from '../src/lib/xizongQuestions.mjs';
import {
  ensureXizongQuestionSweepState,
  recordXizongQuestionAttempt,
  startNextXizongQuestionRound,
  deriveXizongQuestionIdsForCurrentRound
} from '../src/lib/xizongQuestionAttempts.mjs';

const PORT = 4338;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });
const reportPath = path.join(auditDir, 'xizong-system-exit-workspace.json');
const questionShot = path.join(auditDir, 'xizong-system-exit-question.png');
const recallShot = path.join(auditDir, 'xizong-system-exit-recall.png');
const report = {
  schema: 'kianos.xizong.system_exit_workspace.v1',
  representative: 'A1/circulation',
  started_at: new Date().toISOString(),
  checks: [],
  type_samples: []
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_SYSTEM_EXIT_BROWSER_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};

async function waitForHttp(url, attempts = 120) {
  for (let index = 0; index < attempts; index += 1) {
    try { const response = await fetch(url); if (response.ok) return; } catch {}
    await sleep(200);
  }
  throw new Error(`HTTP_NOT_READY:${url}`);
}

async function scanVisibleType(root, stage) {
  const result = await root.evaluate((node) => {
    const selector = 'a,p,li,span,small,b,strong,em,label,button,summary,code,kbd,dt,dd,input,textarea';
    const rows = [...node.querySelectorAll(selector)]
      .filter((el) => {
        const value = ((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) ? (el.value || el.placeholder) : el.textContent || '').trim();
        if (!value) return false;
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && el.getClientRects().length > 0;
      })
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) ? (el.value || el.placeholder) : el.textContent) || '').trim().replace(/\s+/g, ' ').slice(0, 100),
        size: Number.parseFloat(getComputedStyle(el).fontSize || '0')
      }));
    return { count: rows.length, min: rows.length ? Math.min(...rows.map((row) => row.size)) : null, under15: rows.filter((row) => row.size < 14.99).slice(0, 30) };
  });
  report.type_samples.push({ stage, ...result });
  check(result.under15.length === 0, `${stage}_visible_type_floor_15`, JSON.stringify(result.under15));
  return result.min;
}

const answerLetters = (value) => (String(value || '').toUpperCase().match(/[A-Z]/g) || []).sort();
const makeIdFactory = () => {
  let counter = 0;
  return (prefix) => `${prefix}-system-exit-fixture-${++counter}`;
};

const system = loadXizongSystem('circulation');
const sweep = loadXizongSystemQuestionSweep(system);
check(system?.canonicalId === 'A1', 'fixture_a1_system');
check(sweep?.questions?.length === 376, 'fixture_a1_question_truth', String(sweep?.questions?.length || 0));
const completedBlockIds = (system?.blocks || []).map((block) => String(block?.blockId || '')).filter(Boolean);
check(completedBlockIds.length > 0, 'fixture_system_blocks_present', String(completedBlockIds.length));
const holdoutYear = Number(sweep.years[0]);
const eligible = sweep.questions.filter((question) => Number(question.year) !== holdoutYear);
check(eligible.length > 2, 'fixture_non_holdout_questions');
const firstPassQuestion = eligible[0];
const firstPassWrongOption = firstPassQuestion.options.find((option) => !answerLetters(firstPassQuestion.correctAnswer).includes(option.label));
check(Boolean(firstPassWrongOption), 'fixture_first_pass_has_wrong_option', firstPassQuestion.questionId);

const reviewedTarget = eligible.find((question) => question.relation?.knowledgePath
  && ['RESOLVED_KP', 'RESOLVED_BLOCK', 'BLOCK_ONLY'].includes(question.relation?.targetStatus)
  && question.explanation
  && (question.explanation.decisionAxis || question.explanation.transferRule || question.explanation.valuableDistractors?.length));
const missingTarget = eligible.find((question) => question.questionId !== reviewedTarget?.questionId && !question.relation);
check(Boolean(reviewedTarget), 'fixture_reviewed_crosswalk_question');
check(Boolean(missingTarget), 'fixture_missing_crosswalk_question');

const attemptContext = {
  systemId: sweep.systemId,
  canonicalId: sweep.canonicalId,
  scopeHash: sweep.scopeHash,
  questionInventoryHash: sweep.questionInventoryHash,
  questions: sweep.questions,
  holdoutYears: [holdoutYear]
};
const makeId = makeIdFactory();
let secondPassState = ensureXizongQuestionSweepState({ results: {} }, attemptContext, { now: '2026-09-17T08:00:00.000Z', makeId });
for (const question of eligible) {
  const status = question.questionId === reviewedTarget.questionId
    ? 'wrong'
    : question.questionId === missingTarget.questionId ? 'uncertain' : 'stable';
  secondPassState = recordXizongQuestionAttempt(secondPassState, {
    question,
    status,
    selected: answerLetters(question.correctAnswer),
    context: attemptContext,
    holdoutYears: [holdoutYear]
  }, { now: `2026-09-17T08:${String((eligible.indexOf(question) % 60)).padStart(2, '0')}:00.000Z`, makeId });
}
secondPassState = startNextXizongQuestionRound(
  secondPassState,
  eligible.map((question) => question.questionId),
  { now: '2026-09-17T10:00:00.000Z', makeId },
  { queueMode: 'TARGETED' }
);
const targetedIds = deriveXizongQuestionIdsForCurrentRound(secondPassState, sweep.questions, [holdoutYear]);
check(targetedIds.length === 2, 'fixture_second_pass_exact_two_wu', targetedIds.join(','));
check(targetedIds.includes(reviewedTarget.questionId) && targetedIds.includes(missingTarget.questionId), 'fixture_second_pass_targets_reviewed_and_missing');

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let browser;
try {
  await waitForHttp(`${BASE}/xizong/circulation/`);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await context.newPage();
  const url = `${BASE}/xizong/circulation/`;
  const recallKey = 'kianos:xizong:system-recall:circulation:v1';
  const holdoutKey = 'kianos:xizong:full-paper-holdout-years:v1';
  const sweepKey = 'kianos:xizong:system-question-sweep:circulation:v1';

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate((blockIds) => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
    for (const blockId of blockIds) {
      localStorage.setItem(`kianos-xizong-astro-v2:xizong:${blockId}`, JSON.stringify({ completed: true }));
    }
  }, completedBlockIds);
  await page.reload({ waitUntil: 'networkidle' });
  const seededBlockCount = await page.evaluate((blockIds) => blockIds.filter((blockId) => {
    try {
      return Boolean(JSON.parse(localStorage.getItem(`kianos-xizong-astro-v2:xizong:${blockId}`) || 'null')?.completed);
    } catch {
      return false;
    }
  }).length, completedBlockIds);
  check(seededBlockCount === completedBlockIds.length, 'system_exit_prerequisite_block_completion_seeded', `${seededBlockCount}/${completedBlockIds.length}`);

  const stage = page.locator('[data-xizong-later-stage="system-exit"]');
  check(await stage.count() === 1, 'later_stage_mounted');
  check(await stage.evaluate((node) => node.classList.contains('xzExitStage')), 'later_stage_current_namespace');
  check(await page.locator('.xizongLaterStage').count() === 0, 'legacy_later_stage_namespace_absent');
  await stage.evaluate((node) => { node.open = true; });
  const exit = page.locator('[data-xizong-system-exit="circulation"]');
  await exit.waitFor({ state: 'visible' });
  check(await page.locator('.xseCard,.xseStem,.xseOptions').count() === 0, 'legacy_broad_exit_visual_classes_absent');
  check(await page.locator('.xseCompletionWorkbench').count() === 1, 'single_completion_workbench_present');
  check(await page.locator('[data-recall-dialog]').count() === 0, 'recall_modal_removed');
  check(await page.locator('[data-recall-workspace]').isVisible(), 'inline_recall_workspace_visible');
  check(await page.locator('[data-xizong-question-crosswalk-consumer]').isHidden(), 'crosswalk_hidden_before_second_pass_answer');
  await scanVisibleType(stage, 'exit_entry');

  const geometry = await stage.evaluate((node) => {
    const root = node.getBoundingClientRect();
    const exitRoot = node.querySelector('.xse')?.getBoundingClientRect();
    const steps = node.querySelector('.xseSteps')?.getBoundingClientRect();
    return { root_width: root.width, exit_width: exitRoot?.width || 0, steps_width: steps?.width || 0 };
  });
  check(geometry.root_width > 1080, 'later_stage_uses_mac_width', JSON.stringify(geometry));
  check(geometry.exit_width > 1000, 'exit_workspace_uses_available_width', JSON.stringify(geometry));
  report.geometry = geometry;

  const recallWorkspace = exit.locator('[data-recall-workspace]');
  check(await exit.locator('[data-recall-front]').isVisible(), 'recall_front_visible');
  check(await exit.locator('[data-recall-reveal]').isHidden(), 'recall_answer_protected');
  await scanVisibleType(recallWorkspace, 'recall_front');
  await page.screenshot({ path: recallShot, fullPage: false });
  await exit.locator('[data-reveal-recall]').click();
  check(await exit.locator('[data-recall-front]').isHidden(), 'recall_front_hides_after_reveal');
  check(await exit.locator('[data-recall-reveal]').isVisible(), 'recall_reveal_visible');
  await scanVisibleType(recallWorkspace, 'recall_reveal');
  await exit.locator('[data-complete-recall]').click();
  check(await recallWorkspace.isHidden(), 'recall_workspace_hides_after_complete');
  check(await exit.locator('[data-question-gate]').isVisible(), 'question_gate_visible_after_recall');
  const recallState = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), recallKey);
  check(Boolean(recallState?.completedAt), 'recall_completion_persisted');

  await exit.locator('[data-holdout-input]').fill(String(holdoutYear));
  await exit.locator('[data-save-holdout]').click();
  const held = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), holdoutKey);
  check(Array.isArray(held) && held.length === 1 && Number(held[0]) === holdoutYear, 'holdout_persisted');
  check(!(await exit.locator('[data-start-sweep]').isDisabled()), 'question_gate_unlocks_after_recall_and_holdout');
  await exit.locator('[data-start-sweep]').click();
  const workspace = exit.locator('[data-question-workspace]');
  await workspace.waitFor({ state: 'visible' });
  check((await exit.locator('[data-question-stem]').textContent() || '').trim().length > 10, 'official_question_stem_visible');
  check(await exit.locator('.xseOption').count() >= 4, 'official_question_options_visible');
  check(await exit.locator('[data-question-map] .xseMapItem').count() > 10, 'question_map_populated');
  check((await exit.locator('[data-fast-sweep]').getAttribute('aria-pressed')) === 'false', 'fast_sweep_off_by_default');
  await exit.locator('[data-fast-sweep]').click();
  check((await exit.locator('[data-fast-sweep]').getAttribute('aria-pressed')) === 'true', 'fast_sweep_can_enable');
  await exit.locator('[data-fast-sweep]').click();
  await exit.locator('[data-question-mark]').click();
  check((await exit.locator('[data-question-mark]').getAttribute('aria-pressed')) === 'true', 'question_mark_can_set');
  await exit.locator('[data-question-mark]').click();
  check((await exit.locator('[data-question-mark]').getAttribute('aria-pressed')) === 'false', 'question_mark_can_clear');
  await scanVisibleType(workspace, 'first_pass_question');

  await exit.locator(`.xseOption[data-option="${firstPassWrongOption.label}"]`).click();
  await exit.locator('[data-submit-answer]').click();
  check(await exit.locator('[data-answer-panel]').isVisible(), 'answer_panel_visible_after_submit');
  check(await exit.locator('[data-wrong-judge]').isVisible(), 'wrong_path_visible_after_wrong_answer');
  check(await exit.locator('[data-repair-panel]').isVisible(), 'first_pass_repair_visible_after_wrong_answer');
  const firstPassStored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), sweepKey);
  check(firstPassStored?.results?.[firstPassQuestion.questionId]?.status === 'wrong', 'wrong_attempt_persisted_to_current_round');
  check((firstPassStored?.attemptHistory || []).some((event) => event.question_id === firstPassQuestion.questionId && event.evidence_origin === 'USER_QUESTION_ATTEMPT'), 'attempt_history_append_preserved');
  check(await page.locator('[data-xizong-question-crosswalk-consumer]').isHidden(), 'crosswalk_stays_hidden_in_first_pass');
  await scanVisibleType(stage, 'first_pass_answer');

  const repairReturn = page.locator('[data-xizong-repair-return="circulation"]');
  await repairReturn.evaluate((node) => { node.open = true; });
  await scanVisibleType(repairReturn, 'repair_return');
  await workspace.scrollIntoViewIfNeeded();
  await page.screenshot({ path: questionShot, fullPage: false });

  // Seed a legal Current SECOND_PASS from real A1 Question Truth: exactly one reviewed W/U and one unmapped W/U.
  await page.evaluate(({ recallKey, holdoutKey, sweepKey, holdoutYear, secondPassState }) => {
    localStorage.setItem(recallKey, JSON.stringify({ completedAt: '2026-09-17T10:01:00.000Z' }));
    localStorage.setItem(holdoutKey, JSON.stringify([holdoutYear]));
    localStorage.setItem(sweepKey, JSON.stringify(secondPassState));
  }, { recallKey, holdoutKey, sweepKey, holdoutYear, secondPassState });
  await page.reload({ waitUntil: 'networkidle' });
  const stage2 = page.locator('[data-xizong-later-stage="system-exit"]');
  await stage2.evaluate((node) => { node.open = true; });
  const exit2 = page.locator('[data-xizong-system-exit="circulation"]');
  check(!(await exit2.locator('[data-start-sweep]').isDisabled()), 'second_pass_gate_restored_from_current_state');
  await exit2.locator('[data-start-sweep]').click();
  await exit2.locator('[data-question-workspace]').waitFor({ state: 'visible' });
  check((await exit2.locator('[data-study-phase]').textContent() || '').includes('二轮'), 'second_pass_label_visible');

  for (const targetId of targetedIds) {
    const target = sweep.questions.find((question) => question.questionId === targetId);
    check(Boolean(target), 'targeted_question_resolves', targetId);
    const meta = (await exit2.locator('[data-question-meta]').textContent() || '').trim();
    check(meta.includes(String(target.year)) && meta.includes(String(target.number)), 'second_pass_target_order_matches_model', `${targetId}:${meta}`);
    for (const label of answerLetters(target.correctAnswer)) {
      await exit2.locator(`.xseOption[data-option="${label}"]`).click();
    }
    await exit2.locator('[data-submit-answer]').click();
    check(await exit2.locator('[data-second-pass-review]').isVisible(), 'second_pass_review_surface_visible', targetId);
    await scanVisibleType(stage2, `second_pass_answer_${targetId}`);

    const crosswalk = page.locator('[data-xizong-question-crosswalk-consumer="circulation"]');
    await page.waitForTimeout(80);
    check(await crosswalk.isVisible(), 'second_pass_crosswalk_consumer_visible', targetId);
    if (target.relation?.knowledgePath) {
      const link = crosswalk.locator('[data-crosswalk-link]');
      check(await link.isVisible(), 'reviewed_crosswalk_link_visible', targetId);
      check((await link.getAttribute('href') || '').includes(String(target.relation.knowledgePath).replace(/^\/+/, '')), 'reviewed_crosswalk_exact_target', target.relation.knowledgePath);
    } else {
      const fallback = crosswalk.locator('[data-crosswalk-fallback]');
      check(await fallback.isVisible(), 'missing_crosswalk_fallback_visible', targetId);
      check((await fallback.textContent() || '').includes('暂无 REVIEWED Crosswalk'), 'missing_crosswalk_does_not_guess', targetId);
    }
    await exit2.locator('[data-next-correct]').click();
    await page.waitForTimeout(80);
  }
  const secondStored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), sweepKey);
  check(secondStored?.round?.studyPhase === 'SECOND_PASS', 'second_pass_state_preserved');
  check((secondStored?.attemptHistory || []).filter((event) => event.study_phase === 'SECOND_PASS').length === 2, 'second_pass_attempts_appended_without_history_rewrite');

  report.status = 'PASS';
  report.finished_at = new Date().toISOString();
  report.holdout_year = holdoutYear;
  report.first_pass_question = firstPassQuestion.questionId;
  report.second_pass_targets = targetedIds;
  report.min_visible_type_px = Math.min(...report.type_samples.map((row) => row.min).filter((value) => Number.isFinite(value)));
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`XIZONG_SYSTEM_EXIT_WORKSPACE PASS | checks=${report.checks.length} | minType=${report.min_visible_type_px}`);
  await context.close();
} catch (error) {
  report.status = 'FAIL';
  report.finished_at = new Date().toISOString();
  report.error = String(error?.stack || error);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  throw error;
} finally {
  try { await browser?.close(); } catch {}
  try {
    if (process.platform === 'win32') server.kill();
    else process.kill(-server.pid, 'SIGTERM');
  } catch { try { server.kill('SIGTERM'); } catch {} }
}
