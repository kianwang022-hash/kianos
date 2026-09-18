import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { buildPoliticsSessionTargetCatalog } from '../src/lib/politicsSessionCatalog.mjs';
import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';

const PORT = 4348;
const BASE = 'http://127.0.0.1:' + PORT;
const auditDir = path.resolve(process.cwd(), '../politics-functional-audit');
fs.mkdirSync(auditDir, { recursive: true });

const targetCatalog = buildPoliticsSessionTargetCatalog('/');
const practiceCatalog = buildPoliticsPracticeCatalogCurrent('/');
const target = targetCatalog.targets.find((row) =>
  row.subject === 'marxism' && row.state === 'ORIENT'
) || targetCatalog.targets[0];
const questions = practiceCatalog.questions
  .filter((row) => row.unitKey && /^[A-D]+$/.test(row.answer || ''))
  .slice(0, 2);

if (!target || questions.length !== 2) throw new Error('POLITICS_SESSION_JOURNEY_FIXTURE_MISSING');

const qIds = questions.map((row) => row.id);
const answers = Object.fromEntries(questions.map((row) => [row.id, row.answer]));
const report = {
  schema: 'kianos.politics.session_browser_journey.v1',
  started_at: new Date().toISOString(),
  target: target.ref,
  questions: qIds,
  checks: []
};

function check(condition, name, detail = '') {
  if (!condition) throw new Error('POLITICS_SESSION_BROWSER_FAIL:' + name + (detail ? ':' + detail : ''));
  report.checks.push({ name, pass: true, detail });
  console.log('PASS ' + name + (detail ? ' · ' + detail : ''));
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(BASE + '/politics/review/');
      if (response.ok) return;
    } catch {}
    await sleep(200);
  }
  throw new Error('POLITICS_SESSION_PREVIEW_NOT_READY');
}

async function clearPolitics(page) {
  await page.goto(BASE + '/politics/review/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('kianos-politics-')) localStorage.removeItem(key);
    }
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
}

async function importSession(page, instruction) {
  await page.locator('[data-session-import-open]').click();
  await page.locator('[data-session-import-dialog]').waitFor({ state: 'visible' });
  await page.locator('[data-session-import-text]').fill(JSON.stringify(instruction, null, 2));
  await page.locator('[data-session-import-confirm]').click();
  await page.locator('[data-session-workspace]').waitFor({ state: 'visible' });
}

async function answerCurrentPracticeQuestion(page, expectedId) {
  await page.locator('[data-question-card]').waitFor({ state: 'visible' });
  const session = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-politics-practice-session-v1') || 'null'));
  check(session?.ids?.[session.index] === expectedId, 'practice_current_question_exact', expectedId);
  const answer = answers[expectedId];
  for (const label of answer) await page.locator('[data-option="' + label + '"]').click();
  await page.locator('[data-submit]').click();
  await page.locator('[data-submitted-result]').waitFor({ state: 'visible' });
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
  page.on('dialog', (dialog) => dialog.accept());

  await clearPolitics(page);

  const instruction = {
    schema: 'kianos.politics.session-instruction.v1',
    session_id: 'browser-session-001',
    subject_id: target.subject,
    phase: 'CONSOLIDATION',
    anchor_ref: target.unit_id,
    steps: [
      {
        step_id: 'recall-1',
        recipe_type: 'RECONSTRUCT',
        target_refs: [target.ref],
        learner_prompt: '闭卷把这一块想回来。'
      },
      {
        step_id: 'questions-1',
        recipe_type: 'QUESTION_RETEST',
        question_ids: qIds
      },
      {
        step_id: 'close-1',
        recipe_type: 'CLOSE'
      }
    ],
    return_policy: { on_complete: 'CHAT', on_interrupt: 'RESUME' }
  };

  await importSession(page, instruction);
  check(await page.locator('[data-review-native]').isHidden(), 'native_review_hidden_during_chat_session');
  check((await page.locator('[data-session-prompt]').innerText()) === '闭卷把这一块想回来。', 'chat_prompt_literal');
  check(await page.locator('[data-session-reveal-content]').isHidden(), 'answer_payload_concealed_before_reveal');
  check((await page.locator('[data-session-reveal-content] [data-surface-group]').count()) === 0, 'no_target_clone_before_reveal');

  await page.locator('[data-session-response]').fill('我的闭卷回忆');
  await page.locator('[data-session-response]').press('Space');
  check((await page.locator('[data-session-response]').inputValue()).endsWith(' '), 'space_inside_textarea_remains_text_input');
  await page.locator('[data-session-response]').blur();
  await page.keyboard.press('Space');
  await page.locator('[data-session-reveal-content]').waitFor({ state: 'visible' });

  const group = page.locator('[data-session-reveal-content] [data-surface-group="' + target.group_id + '"]');
  await group.waitFor({ state: 'visible' });
  check((await group.getAttribute('data-surface-primitive')) === target.primitive, 'revealed_group_primitive_literal', target.primitive);
  check((await page.locator('[data-session-reveal-content] [data-surface-group]').count()) === 1, 'reveal_only_chat_selected_group');

  await page.locator('[data-session-mark="UNCERTAIN"]').click();
  await page.locator('[data-session-mode="questions"]').waitFor({ state: 'visible' });
  check((await page.locator('[data-session-question-list] li').allTextContents()).join('|') === qIds.join('|'), 'question_retest_order_literal');

  const retestHref = await page.locator('[data-session-question-start]').getAttribute('href');
  check(String(retestHref).includes('questions='), 'question_retest_explicit_href');
  await page.locator('[data-session-question-start]').click();

  await page.locator('[data-scope-summary]').waitFor({ state: 'visible' });
  await page.waitForFunction(() =>
    document.querySelector('[data-scope-summary]')?.textContent?.includes('Chat 指定 2 题 · 不扩题')
  );
  check((await page.locator('[data-scope-summary]').innerText()).includes('Chat 指定 2 题 · 不扩题'), 'practice_scope_exact_two');
  await page.locator('[data-start-session]').click();

  let practice = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-politics-practice-session-v1') || 'null'));
  check(JSON.stringify(practice?.ids) === JSON.stringify(qIds), 'practice_session_exact_question_ids', JSON.stringify(practice?.ids));
  check(practice?.scope?.session_ref === instruction.session_id, 'practice_session_ref_bound');
  check(practice?.scope?.session_step_id === 'questions-1', 'practice_session_step_bound');

  await answerCurrentPracticeQuestion(page, qIds[0]);
  await page.locator('[data-next-question]').click();
  await answerCurrentPracticeQuestion(page, qIds[1]);
  await page.locator('[data-next-question]').click();
  await page.locator('[data-session-complete]').waitFor({ state: 'visible' });

  practice = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-politics-practice-session-v1') || 'null'));
  check(practice?.status === 'completed' && Object.keys(practice.results || {}).length === 2, 'practice_explicit_retest_complete');

  await page.locator('[data-complete-return]').click();
  await page.locator('[data-session-mode="questions"]').waitFor({ state: 'visible' });
  check(!(await page.locator('[data-session-question-finish]').isDisabled()), 'review_detects_exact_completed_retest');
  await page.locator('[data-session-question-finish]').click();

  await page.locator('[data-session-mode="close"]').waitFor({ state: 'visible' });
  await page.locator('[data-session-close]').click();
  await page.locator('[data-session-complete]').waitFor({ state: 'visible' });

  const evidence = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-politics-session-evidence-v1') || 'null'));
  check(evidence?.schema === 'kianos.politics.session-evidence.v1', 'session_evidence_schema');
  check(evidence?.events?.length === 3, 'session_evidence_three_explicit_steps', String(evidence?.events?.length));
  check(evidence.events[0].response === '我的闭卷回忆 ' && evidence.events[0].mark === 'UNCERTAIN', 'recall_response_and_self_mark_preserved');
  check(evidence.events[1].deterministic_result?.results?.length === 2, 'question_results_returned_as_facts');
  check(evidence.events[2].response === 'CHAT_EXPLICIT_CLOSE', 'close_is_chat_explicit');
  const evidenceText = JSON.stringify(evidence);
  check(!evidenceText.includes('recommended_next') && !evidenceText.includes('mastery_claim'), 'evidence_has_no_web_strategy');

  await page.screenshot({ path: path.join(auditDir, 'politics-session-complete.png'), fullPage: false });

  const precisionInstruction = {
    schema: 'kianos.politics.session-instruction.v1',
    session_id: 'browser-session-precision-blocked',
    subject_id: target.subject,
    phase: 'CONSOLIDATION',
    anchor_ref: target.unit_id,
    steps: [{
      step_id: 'precision-1',
      recipe_type: 'PRECISION',
      target_refs: [target.ref],
      guard_evidence_refs: ['synthetic-browser-guard']
    }]
  };
  await importSession(page, precisionInstruction);
  await page.locator('[data-session-blocked]').waitFor({ state: 'visible' });
  check((await page.locator('[data-session-blocked-reason]').innerText()).includes('Precision guard resolver 还未闭环'), 'precision_runtime_fails_closed');
  check(await page.locator('[data-session-reveal-content]').isHidden(), 'precision_block_does_not_reveal_target');

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  fs.writeFileSync(path.join(auditDir, 'session-journey.json'), JSON.stringify(report, null, 2));
  console.log('POLITICS_SESSION_BROWSER_JOURNEY_PASS');
  await context.close();
} catch (error) {
  report.finished_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.writeFileSync(path.join(auditDir, 'session-journey.json'), JSON.stringify(report, null, 2));
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
