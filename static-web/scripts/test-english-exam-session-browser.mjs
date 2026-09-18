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
  } finally {
    await browser.close().catch(() => {});
  }
  fs.writeFileSync(path.join(auditDir, 'english-exam-browser.json'), JSON.stringify({
    status: 'PASS',
    paper_id: paper.paper_id,
    steps: paper.steps.length,
    delayed_objective_release: true,
    mock_storage_isolated: true,
    productive_review_owner: 'CHAT'
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
