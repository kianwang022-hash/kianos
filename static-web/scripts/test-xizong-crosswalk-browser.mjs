import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4328;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '../xizong-crosswalk-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = { schema: 'kianos.xizong.crosswalk_browser.v1', started_at: new Date().toISOString(), checks: [] };
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_CROSSWALK_BROWSER_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try { const response = await fetch(`${BASE}/xizong/`); if (response.ok) return; } catch {}
    await sleep(250);
  }
  throw new Error('XIZONG_CROSSWALK_PREVIEW_NOT_READY');
}

function answerLetters(value) {
  return String(value || '').toUpperCase().match(/[A-Z]/g) || [];
}

async function currentPayloadQuestion(exit, payload) {
  const meta = (await exit.locator('[data-question-meta]').textContent() || '').trim();
  return payload.questions.find((question) => meta.includes(String(question.year)) && meta.includes(`第 ${question.number} 题`)) || null;
}

async function runJourney(page) {
  await page.goto(`${BASE}/xizong/respiratory/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });

  const later = page.locator('[data-xizong-later-stage="system-exit"]');
  const exit = page.locator('[data-xizong-system-exit="respiratory"]');
  const payload = await exit.locator('[data-sweep-payload]').evaluate((node) => JSON.parse(node.textContent || 'null'));
  const mapped = payload.questions.find((question) => question?.relation?.targetStatus === 'RESOLVED_KP' && question?.relation?.knowledgePath);
  const unmapped = payload.questions.find((question) => !question?.relation);
  check(Boolean(mapped), 'mapped_second_pass_fixture_exists', mapped?.questionId || 'none');
  check(Boolean(unmapped), 'unmapped_second_pass_fixture_exists', unmapped?.questionId || 'none');
  const holdoutYear = payload.years.find((year) => Number(year) !== Number(mapped.year) && Number(year) !== Number(unmapped.year));
  check(Boolean(holdoutYear), 'independent_holdout_year_exists', String(holdoutYear || 'none'));

  const blockIds = [
    'respiratory-r01','respiratory-r02','respiratory-r03','respiratory-r04','respiratory-r05','respiratory-r06',
    'respiratory-r07','respiratory-r08','respiratory-r09','respiratory-r10','respiratory-r11','respiratory-r12'
  ];
  await page.evaluate(({ ids, mappedId, unmappedId, heldYear }) => {
    ids.forEach((id) => {
      localStorage.setItem(`kianos-xizong-astro-v2:xizong:${id}`, JSON.stringify({ completed: true }));
    });
    const now = new Date().toISOString();
    localStorage.setItem('kianos:xizong:system-recall:respiratory:v1', JSON.stringify({ completedAt: now }));
    localStorage.setItem('kianos:xizong:full-paper-holdout-years:v1', JSON.stringify([heldYear]));
    localStorage.setItem('kianos:xizong:system-question-sweep:respiratory:v1', JSON.stringify({
      results: {},
      attemptHistoryBootstrappedAt: now,
      attemptHistory: [
        { type: 'QUESTION_ATTEMPT', question_id: mappedId, study_phase: 'FIRST_PASS', status: 'uncertain', submitted_at: now },
        { type: 'QUESTION_ATTEMPT', question_id: unmappedId, study_phase: 'FIRST_PASS', status: 'wrong', submitted_at: now }
      ],
      round: {
        id: 'crosswalk-second-pass',
        studyPhase: 'SECOND_PASS',
        queueMode: 'TARGETED',
        ordinal: 2,
        startedAt: now,
        evidenceOrigin: 'BROWSER_ACCEPTANCE_FIXTURE'
      }
    }));
  }, { ids: blockIds, mappedId: mapped.questionId, unmappedId: unmapped.questionId, heldYear: holdoutYear });
  await page.reload({ waitUntil: 'domcontentloaded' });

  await later.locator(':scope > summary').click();
  check((await exit.locator('[data-study-phase]').textContent() || '').includes('二轮'), 'runtime_reads_second_pass_fixture');
  check((await exit.locator('[data-sweep-count]').textContent() || '').trim() === '2', 'targeted_queue_contains_only_two_fixture_questions');
  await exit.locator('[data-start-sweep]').click();
  await exit.locator('[data-question-workspace]').waitFor({ state: 'visible' });

  let sawMapped = false;
  let sawUnmapped = false;
  for (let index = 0; index < 2; index += 1) {
    const question = await currentPayloadQuestion(exit, payload);
    check(Boolean(question), 'current_question_resolves_to_payload', String(index + 1));
    for (const letter of answerLetters(question.correctAnswer)) {
      await exit.locator(`[data-question-options] [data-option="${letter}"]`).click();
    }
    await exit.locator('[data-submit-answer]').click();

    const consumer = page.locator('[data-xizong-question-crosswalk-consumer="respiratory"]');
    await consumer.waitFor({ state: 'visible' });
    const link = consumer.locator('[data-crosswalk-link]');
    const fallback = consumer.locator('[data-crosswalk-fallback]');

    if (question.relation?.targetStatus === 'RESOLVED_KP') {
      sawMapped = true;
      check(await link.isVisible(), 'reviewed_mapping_shows_link', question.questionId);
      check(!(await fallback.isVisible()), 'reviewed_mapping_hides_fallback', question.questionId);
      const href = await link.evaluate((node) => node.href);
      check(Boolean(href) && href.endsWith(question.relation.knowledgePath), 'question_link_uses_projected_knowledge_path', href || 'missing');

      const blockPage = await page.context().newPage();
      await blockPage.goto(href, { waitUntil: 'domcontentloaded' });
      const reverseQuestion = blockPage.locator(`[data-crosswalk-question-id="${question.questionId}"]`);
      check(await reverseQuestion.count() > 0, 'backlink_lands_on_reverse_index_question', question.questionId);
      const expectedHash = `#crosswalk-${encodeURIComponent(question.relation.primaryKpId)}`;
      check(new URL(blockPage.url()).hash === expectedHash, 'backlink_preserves_exact_kp_anchor', expectedHash);
      check(await blockPage.locator(expectedHash).count() > 0, 'exact_kp_anchor_exists_in_reverse_index', question.relation.primaryKpId);
      await blockPage.close();
    } else {
      sawUnmapped = true;
      check(!(await link.isVisible()), 'missing_mapping_has_no_fabricated_link', question.questionId);
      check(await fallback.isVisible(), 'missing_mapping_shows_graceful_fallback', question.questionId);
      check((await fallback.textContent() || '').includes('不补猜映射'), 'missing_mapping_fallback_forbids_guessing', question.questionId);
    }

    await exit.locator('[data-mark-stable]').click();
  }

  check(sawMapped && sawUnmapped, 'journey_exercises_mapped_and_unmapped_paths');
  check(await exit.locator('[data-sweep-done]').isVisible(), 'two_question_second_pass_reaches_done');
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
  await runJourney(page);
  await context.close();
  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.evidence_class = 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U';
  fs.writeFileSync(path.join(auditDir, 'journey.json'), JSON.stringify(report, null, 2));
  console.log('XIZONG_CROSSWALK_BROWSER_PASS');
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
