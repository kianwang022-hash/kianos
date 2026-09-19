import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { listEnglishExamPapers, loadEnglishExamPaper } from '../src/lib/englishExamPaper.mjs';

const BASE = 'http://127.0.0.1:4321';
const auditDir = path.resolve(process.cwd(), '../english-exam-audit');
fs.mkdirSync(auditDir, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, code, detail = '') => {
  if (!condition) throw new Error(`ENGLISH_EXAM_BROWSER_FAIL:${code}${detail ? ':' + detail : ''}`);
};

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('ENGLISH_EXAM_PREVIEW_NOT_READY');
}

async function stopServer(server) {
  if (!server) return;
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch {} }
    else { try { server.kill('SIGTERM'); } catch {} }
    await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  }
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGKILL'); } catch {} }
    else { try { server.kill('SIGKILL'); } catch {} }
  }
}

const summaries = listEnglishExamPapers();
check(summaries.length > 0, 'paper_catalog_empty');
const paper = loadEnglishExamPaper(summaries[0].paperId);
const first = paper.steps[0];
check(first.task === 'cloze', 'default_first_step_not_cloze', first.task);


function normalStorageKey(step) {
  return ({
    cloze: 'kianos-cloze-attempt-v1:',
    reading_a: 'kianos-reading-attempt-v1:',
    reading_b: 'kianos-reading-b-attempt-v1:',
    translation: 'kianos-translation-attempt-v2:',
    writing: 'kianos-writing-runtime-v1:'
  })[step.task] + step.object_id;
}

async function prepareExamStep(page, step, index, total) {
  await page.locator('[data-english-exam-task-bridge]').waitFor({ state: 'visible' });
  const progress = String(await page.locator('[data-exam-step-progress]').textContent() || '');
  check(progress.includes(`第 ${index + 1} / ${total} 部分`), 'full_step_progress_mismatch', progress);

  const examMode = await page.evaluate(() => document.documentElement.dataset.englishExamSession === 'true');
  check(examMode, 'full_step_not_in_exam_mode', step.step_id);

  if (['cloze', 'reading_a', 'reading_b'].includes(step.task)) {
    check(await page.locator('[data-objective-formal]:visible, [data-reading-formal-answer]:visible').count() === 0, 'full_step_answer_leak', step.step_id);
  }

  if (step.task === 'cloze') {
    await page.locator('[data-cloze-option]').first().click();
  } else if (step.task === 'reading_a') {
    await page.locator('[data-option]').first().click();
  } else if (step.task === 'reading_b') {
    const select = page.locator('[data-reading-b-select]').first();
    const options = await select.locator('option').evaluateAll((nodes) =>
      nodes.filter((node) => node.value && !node.disabled).map((node) => node.value)
    );
    check(options.length > 0, 'full_reading_b_no_selectable_candidate', step.step_id);
    await select.selectOption(options[0]);
  } else if (step.task === 'translation') {
    const boxes = page.locator('[data-attempt-id]');
    const count = await boxes.count();
    check(count > 0, 'full_translation_inputs_missing');
    for (let i = 0; i < count; i += 1) {
      await boxes.nth(i).fill(`Mock 翻译第 ${i + 1} 句。`);
    }
  } else if (step.task === 'writing') {
    const essay = page.locator('[data-essay-draft]');
    await essay.waitFor({ state: 'visible' });
    await essay.fill(`Mock ${step.writing_kind || 'writing'} essay. This is isolated exam-session evidence and must not modify normal Writing state.`);
  }

  const isolatedKeyPresent = await page.evaluate(({ sessionId, task, objectId }) =>
    localStorage.getItem(`kianos-english-exam-task-v1:${sessionId}:${task}:${objectId}`) !== null,
    {
      sessionId: new URL(page.url()).searchParams.get('exam_session') || '',
      task: step.task,
      objectId: step.object_id
    }
  );
  check(isolatedKeyPresent, 'full_step_isolated_storage_missing', step.step_id);
}

async function fullNineStepJourney(browser, paper) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}/english-exam/${encodeURIComponent(paper.paper_id)}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-english-exam-home][data-exam-ready="true"]').waitFor({ state: 'visible' });

    const sentinels = paper.steps.map((step, index) => ({
      key: normalStorageKey(step),
      value: { sentinel: `normal-${index + 1}`, task: step.task, objectId: step.object_id }
    }));
    await page.evaluate((rows) => rows.forEach(({ key, value }) => localStorage.setItem(key, JSON.stringify(value))), sentinels);

    await page.locator('[data-exam-start]').click();

    for (let index = 0; index < paper.steps.length; index += 1) {
      const step = paper.steps[index];
      if (index === 0) {
        await page.waitForURL('**/cloze/**?exam_session=*');
      }
      await prepareExamStep(page, step, index, paper.steps.length);

      const complete = page.locator('[data-exam-complete]');
      await complete.waitFor({ state: 'visible' });
      if (index < paper.steps.length - 1) {
        const currentUrl = page.url();
        await complete.click();
        await page.waitForFunction((url) => location.href !== url, currentUrl);
      } else {
        await complete.click();
        await page.waitForURL(`**/english-exam/${encodeURIComponent(paper.paper_id)}/`);
      }
    }

    check(await page.locator('.englishExamStep[data-complete="true"]').count() === 9, 'full_paper_not_9_of_9_complete');

    const captured = await page.evaluate(() => {
      const raw = localStorage.getItem('kianos-english-exam-session-v1');
      const state = raw ? JSON.parse(raw) : null;
      return { currentStep: state?.current_step, captureCount: Object.keys(state?.captures || {}).length, status: state?.status };
    });
    check(captured.currentStep === 9 && captured.captureCount === 9 && captured.status === 'ACTIVE', 'full_paper_capture_state_invalid', JSON.stringify(captured));

    const unchanged = await page.evaluate((rows) => rows.every(({ key, value }) => {
      const actual = JSON.parse(localStorage.getItem(key) || 'null');
      return actual?.sentinel === value.sentinel;
    }), sentinels);
    check(unchanged, 'full_paper_polluted_normal_learning_storage');

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('[data-exam-seal]').click();
    check(await page.locator('[data-exam-result]').isHidden(), 'full_paper_result_visible_before_release');
    await page.locator('[data-exam-release]').click();
    await page.locator('[data-exam-result]').waitFor({ state: 'visible' });
    const score = String(await page.locator('[data-exam-objective-score]').textContent() || '');
    check(score.includes('/ 60'), 'full_paper_release_not_out_of_60', score);
    check((await page.locator('[data-exam-result]').innerText()).includes('Chat'), 'full_paper_productive_review_not_routed_to_chat');

    await page.screenshot({ path: path.join(auditDir, 'english-exam-9-step-complete.png'), fullPage: false });
  } finally {
    await context.close();
  }
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4321'], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});
let serverLog = '';
server.stdout.on('data', (chunk) => { serverLog += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverLog += chunk.toString(); });

try {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    await page.goto(`${BASE}/english-exam/`, { waitUntil: 'domcontentloaded' });
    check(await page.locator('.englishExamPaperList>a').count() === summaries.length, 'paper_catalog_count');
    await page.screenshot({ path: path.join(auditDir, 'english-exam-index.png'), fullPage: false });

    await page.goto(`${BASE}/english-exam/${encodeURIComponent(paper.paper_id)}/`, { waitUntil: 'domcontentloaded' });
    check(await page.locator('[data-exam-start]').isVisible(), 'start_button_missing');
    await page.locator('[data-english-exam-home][data-exam-ready="true"]').waitFor({ state: 'visible' });
    await page.locator('[data-exam-start]').waitFor({ state: 'visible' });
    check(await page.locator('[data-exam-start]').isEnabled(), 'start_button_not_enabled_after_runtime_ready');
    check((await page.locator('[data-exam-step-list]').locator('.englishExamStep').count()) === 9, 'paper_map_not_9_steps');
    await page.screenshot({ path: path.join(auditDir, 'english-exam-paper.png'), fullPage: false });

    await page.evaluate(({ key }) => {
      localStorage.setItem(key, JSON.stringify({ sentinel: 'normal-study-state' }));
    }, { key: `kianos-cloze-attempt-v1:${first.object_id}` });

    await page.locator('[data-exam-start]').click();
    await page.waitForURL('**/cloze/**?exam_session=*');

    check(await page.locator('[data-english-exam-task-bridge]').isVisible(), 'exam_bridge_missing');
    check(await page.locator('[data-objective-root]').getAttribute('data-objective-answers-ready') === 'false', 'answers_loaded_during_exam');
    check(await page.locator('[data-objective-formal]:visible').count() === 0, 'formal_answer_visible_during_exam');
    check(await page.locator('[data-exam-complete]').isVisible(), 'exam_complete_missing');

    const isolatedCount = await page.evaluate((prefix) =>
      Object.keys(localStorage).filter((key) => key.startsWith(prefix)).length,
      'kianos-english-exam-task-v1:'
    );
    check(isolatedCount >= 1, 'mock_storage_not_isolated');

    const normalSentinel = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), `kianos-cloze-attempt-v1:${first.object_id}`);
    check(normalSentinel?.sentinel === 'normal-study-state', 'normal_attempt_state_polluted');

    await page.screenshot({ path: path.join(auditDir, 'english-exam-cloze.png'), fullPage: false });

    await page.locator('[data-exam-complete]').click();
    await page.waitForURL('**/reading/**?exam_session=*');

    await page.goto(`${BASE}/english-exam/${encodeURIComponent(paper.paper_id)}/`, { waitUntil: 'domcontentloaded' });
    check(await page.locator('[data-exam-seal]').isVisible(), 'early_seal_missing');
    check(await page.locator('.englishExamStep[data-complete="true"]').count() >= 1, 'captured_step_not_visible');

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('[data-exam-seal]').click();
    check(await page.locator('[data-exam-release]').isVisible(), 'release_button_missing_after_seal');

    check(await page.locator('[data-exam-result]').isHidden(), 'result_visible_before_release');
    await page.locator('[data-exam-release]').click();
    await page.locator('[data-exam-result]').waitFor({ state: 'visible' });

    const score = String(await page.locator('[data-exam-objective-score]').textContent() || '');
    check(score.includes('/ 60'), 'objective_release_not_out_of_60', score);
    check((await page.locator('[data-exam-result]').innerText()).includes('Chat'), 'productive_review_not_routed_to_chat');
    await page.screenshot({ path: path.join(auditDir, 'english-exam-release.png'), fullPage: false });

    await context.close();
    await fullNineStepJourney(browser, paper);
  } finally {
    await browser.close().catch(() => {});
  }
  fs.writeFileSync(path.join(auditDir, 'english-exam-browser.json'), JSON.stringify({
    status: 'PASS',
    paper_id: paper.paper_id,
    steps: paper.steps.length,
    delayed_objective_release: true,
    mock_storage_isolated: true,
    productive_review_owner: 'CHAT',
    full_browser_steps_completed: 9,
    normal_learning_storage_preserved: true
  }, null, 2));
  console.log('ENGLISH_EXAM_BROWSER_PASS');
} catch (error) {
  fs.writeFileSync(path.join(auditDir, 'english-exam-browser.json'), JSON.stringify({
    status: 'FAIL',
    error: error instanceof Error ? error.stack || error.message : String(error),
    serverLog: serverLog.slice(-12000)
  }, null, 2));
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
} finally {
  await stopServer(server);
}
