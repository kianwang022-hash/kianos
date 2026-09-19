import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { listWritingSyntheticTasks } from '../src/lib/englishWritingSynthetic.mjs';
import { listTranslationSets, loadTranslationById } from '../src/lib/englishTranslationSourceTruth.mjs';

const BASE = 'http://127.0.0.1:4321';
const auditDir = path.resolve(process.cwd(), '../ffv-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = {
  schema: 'kianos.english.writing.ffv-journey.v1',
  startedAt: new Date().toISOString(),
  checks: []
};

function check(condition, name, detail = '') {
  if (!condition) throw new Error(`WRITING_FFV_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('WRITING_FFV_PREVIEW_NOT_READY');
}

async function stopServer(server) {
  if (!server) return;
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGTERM'); } catch {}
    } else {
      try { server.kill('SIGTERM'); } catch {}
    }
    await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  }
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGKILL'); } catch {}
    } else {
      try { server.kill('SIGKILL'); } catch {}
    }
  }
  server.stdout?.destroy();
  server.stderr?.destroy();
}

async function readWritingRecord(page, id) {
  return page.evaluate((taskId) => JSON.parse(localStorage.getItem(`kianos-writing-runtime-v1:${taskId}`) || 'null'), id);
}

async function setJson(page, key, value) {
  await page.evaluate(([storageKey, storageValue]) => {
    if (storageValue === null) localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, JSON.stringify(storageValue));
  }, [key, value]);
}

async function assertNoVisibleEngineering(page, name) {
  const text = String(await page.locator('[data-writing-runtime]').innerText()).replace(/\s+/g, ' ');
  const forbidden = ['KIANOS_', 'Current provenance', 'sha256:', 'Private evidence ledger', 'TRANSFER_PENDING', 'REPAIR_COMPLETE'];
  const hits = forbidden.filter((term) => text.includes(term));
  check(hits.length === 0, name, hits.join('|'));
}

async function clearEnglishResumeFixtures(page) {
  await page.evaluate(() => {
    [
      'kianos-reading-last-location-v1',
      'kianos-translation-last-location-v1',
      'kianos-writing-last-location-v1',
      'kianos-writing-evidence-v1',
      'kianos-english-session-instruction-v1'
    ].forEach((key) => localStorage.removeItem(key));
  });
}

async function openAdvancedReview(page) {
  const advanced = page.locator('[data-runtime-stage="review"] details.productiveAdvanced');
  await advanced.waitFor({ state: 'visible' });
  if (!(await advanced.getAttribute('open'))) await advanced.locator('summary').click();
  await page.locator('[data-review-return]').waitFor({ state: 'visible' });
}

function reviewPass(taskId) {
  return {
    schema: 'kianos.english.writing.review-return.v1',
    taskId,
    reviewOf: 'FIRST_DRAFT',
    verdict: 'PASS_ACCEPTABLE',
    firstFailureLayer: null,
    repairScope: null,
    smallestRepair: null,
    reason: 'Synthetic FFV fixture is complete and adequate; no meaningful repair is justified.'
  };
}

function reviewRepair(task, record) {
  return {
    schema: 'kianos.english.writing.review-return.v1',
    taskId: task.id,
    reviewOf: 'FIRST_DRAFT',
    attemptSubmittedAt: record.firstSubmittedAt,
    sourceHash: task.sourceHash,
    verdict: 'REPAIR_NEEDED',
    firstFailureLayer: 'Content',
    repairScope: 'the explanation after the core claim',
    smallestRepair: 'Add one concrete mechanism that explains why coordination changes the result.',
    reason: 'The claim is relevant but one causal step is still asserted rather than developed.'
  };
}

function repairCompleteNoDebt(task, record) {
  return {
    schema: 'kianos.english.writing.repair-return.v1',
    taskId: task.id,
    repairOf: 'REGENERATION',
    attemptSubmittedAt: record.firstSubmittedAt,
    regenerationSubmittedAt: record.regenerationSubmittedAt,
    sourceHash: task.sourceHash,
    verdict: 'REPAIR_COMPLETE',
    reason: 'The learner independently supplied the missing mechanism; no reusable long-term target is justified from this one synthetic case.',
    memoryAdmission: { admit: false }
  };
}

async function cleanPassJourney(browser, task) {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}/writing/${encodeURIComponent(task.id)}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-writing-runtime]').waitFor({ state: 'visible' });
    check(await page.locator('[data-writing-evidence-panel]').isHidden(), 'clean_open_has_no_transfer_attention');

    await page.locator('input[data-plan-mode][value="direct"]').check();
    await page.locator('[data-essay-draft]').fill(
      'Dear students, the workshop will now be held on Saturday at 10:00 a.m. in Library Seminar Room 3. Please bring a laptop or tablet so that you can follow the practical exercises. If you cannot attend, please reply to the organizer by Friday evening. We apologize for the change and look forward to seeing you.'
    );
    await page.locator('[data-lock-first]').click();
    await page.locator('[data-runtime-stage="review"]').waitFor({ state: 'visible' });

    let record = await readWritingRecord(page, task.id);
    check(record?.state === 'REVIEW_PENDING', 'clean_first_draft_enters_semantic_review');
    check(record?.planMode === 'direct' && !record?.firstPlan, 'direct_mode_does_not_manufacture_plan');
    check(Boolean(record?.firstDraft), 'clean_first_draft_is_preserved');
    check(await page.locator('[data-writing-evidence-panel]').isHidden(), 'review_pending_has_no_transfer_attention');
    await assertNoVisibleEngineering(page, 'review_default_surface_has_no_engineering_language');

    // Normal learner path: stable work exits directly without a JSON round-trip.
    await page.getByRole('button', { name: '这篇可以了', exact: true }).click();
    await page.locator('[data-runtime-stage="passed"]').waitFor({ state: 'visible' });

    record = await readWritingRecord(page, task.id);
    check(record?.state === 'PASS_ACCEPTABLE', 'direct_semantic_pass_is_real_exit');
    check(record?.transferCandidate === null, 'semantic_pass_manufactures_no_transfer_debt');
    check(await page.locator('[data-writing-evidence-panel]').isHidden(), 'passed_work_has_no_transfer_panel_without_natural_evidence');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-runtime-stage="passed"]').waitFor({ state: 'visible' });
    record = await readWritingRecord(page, task.id);
    check(record?.state === 'PASS_ACCEPTABLE' && Boolean(record?.firstDraft), 'pass_survives_refresh_with_first_evidence');

    await page.goto(`${BASE}/english/`, { waitUntil: 'domcontentloaded' });
    check(await page.locator('[data-english-resume]').isHidden(), 'passed_writing_does_not_drag_resume_backward');
  } finally {
    await context.close();
  }
}

async function repairReturnJourney(browser, task) {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}/writing/${encodeURIComponent(task.id)}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-writing-runtime]').waitFor({ state: 'visible' });
    await page.locator('input[data-plan-mode][value="direct"]').check();
    await page.locator('[data-essay-draft]').fill(
      'The two teams show that effort alone does not guarantee an efficient result. Team A repeats work because members search separately, while Team B coordinates tasks and shares one outline. Coordination can reduce duplicated effort and make later integration easier. In group projects, clear division of labor therefore helps people use their different strengths and complete a common goal more reliably.'
    );
    await page.locator('[data-lock-first]').click();
    await page.locator('[data-runtime-stage="review"]').waitFor({ state: 'visible' });

    // Structured return remains supported, but it is intentionally an advanced evidence path.
    await openAdvancedReview(page);
    let record = await readWritingRecord(page, task.id);
    await page.locator('[data-review-return]').fill(JSON.stringify(reviewRepair(task, record)));
    await page.locator('[data-import-review]').click();
    await page.locator('[data-runtime-stage="repair"]').waitFor({ state: 'visible' });

    record = await readWritingRecord(page, task.id);
    check(record?.state === 'REPAIR_NEEDED', 'problem_enters_smallest_repair');
    check(record?.reviewReturn?.firstFailureLayer === 'Content', 'repair_preserves_first_meaningful_failure');
    check(await page.locator('[data-writing-evidence-panel]').isHidden(), 'active_repair_has_no_transfer_attention');
    await assertNoVisibleEngineering(page, 'repair_default_surface_has_no_engineering_language');

    await page.goto(`${BASE}/english/`, { waitUntil: 'domcontentloaded' });
    check(await page.locator('[data-english-resume]').isHidden(), 'website_does_not_auto_rank_active_writing_repair');

    await page.evaluate((taskId) => {
      const day = new Date().toLocaleDateString('en-CA');
      localStorage.setItem('kianos-english-session-instruction-v1', JSON.stringify({
        schema: 'kianos.english.session-instruction.v1',
        session_id: 'writing-ffv-repair',
        study_day: day,
        generated_at: new Date().toISOString(),
        current_step: 0,
        steps: [{
          step_id: 'writing-repair',
          task: 'writing',
          object_id: taskId,
          source_hash: taskSourceHash,
          label: 'Writing repair',
          note: 'FFV exact repair return'
        }],
        return_policy: { on_finish: 'english_home' }
      }));
    }, { taskId: task.id, taskSourceHash: task.sourceHash });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-english-resume]').waitFor({ state: 'visible' });
    check((await page.locator('[data-english-resume-title]').textContent()) === 'Writing repair', 'chat_session_surfaces_selected_writing_repair');
    check((await page.locator('[data-english-resume-link]').getAttribute('href'))?.includes(task.id), 'chat_session_returns_to_exact_writing_task');

    await page.goto(`${BASE}/writing/${encodeURIComponent(task.id)}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-runtime-stage="repair"]').waitFor({ state: 'visible' });
    await page.locator('[data-regeneration]').fill(
      'Coordination reduces duplicated searches because members divide responsibilities before collecting information and then combine their work through one shared outline.'
    );
    await page.locator('[data-lock-regeneration]').click();
    await page.locator('[data-runtime-stage="repair-check"]').waitFor({ state: 'visible' });

    record = await readWritingRecord(page, task.id);
    await page.locator('[data-repair-return]').fill(JSON.stringify(repairCompleteNoDebt(task, record)));
    await page.locator('[data-import-repair]').click();
    await page.locator('[data-runtime-stage="repair-complete"]').waitFor({ state: 'visible' });

    record = await readWritingRecord(page, task.id);
    check(record?.state === 'REPAIR_COMPLETE', 'repair_return_can_finish_without_durable_debt');
    check(record?.transferCandidate === null, 'one_off_repair_does_not_manufacture_transfer_target');
    check(await page.locator('[data-writing-evidence-panel]').isHidden(), 'repair_complete_without_target_keeps_evidence_panel_silent');
    await assertNoVisibleEngineering(page, 'repair_complete_surface_has_no_engineering_language');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-runtime-stage="repair-complete"]').waitFor({ state: 'visible' });
    check((await readWritingRecord(page, task.id))?.state === 'REPAIR_COMPLETE', 'repair_complete_survives_refresh');

    await page.goto(`${BASE}/english/`, { waitUntil: 'domcontentloaded' });
    check(await page.locator('[data-english-resume]').isHidden(), 'completed_repair_does_not_become_resume_debt');

    // Backend-rich pending states must remain silent until normal work naturally makes them relevant.
    await setJson(page, 'kianos-writing-last-location-v1', {
      id: task.id,
      title: task.title,
      state: 'TRANSFER_PENDING',
      href: `/writing/${encodeURIComponent(task.id)}/`,
      updatedAt: '2026-09-13T10:00:00.000Z'
    });
    await setJson(page, 'kianos-writing-evidence-v1', {
      version: 1,
      targets: [{
        targetId: 'writing:synthetic:dormant',
        label: 'Dormant target',
        underlyingDemand: 'Backend-only fixture',
        status: 'pending',
        originTaskId: task.id,
        admittedAt: '2026-09-13T09:00:00.000Z',
        events: []
      }]
    });
    await setJson(page, 'kianos-translation-last-location-v1', {
      id: 'translation-dormant-fixture',
      title: 'Translation dormant claim fixture',
      state: 'TRANSFER_PENDING',
      href: '/translation/',
      updatedAt: '2026-09-13T10:01:00.000Z'
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    check(await page.locator('[data-english-resume]').isHidden(), 'dormant_pending_states_do_not_summon_resume');

    // Cross-lane learner state remains evidence only. Website must not recreate
    // the retired cross-task priority table; Chat owns Resume selection.
    const translationSummary = listTranslationSets()[0];
    const translationTask = loadTranslationById(translationSummary.id);
    await setJson(page, 'kianos-translation-last-location-v1', {
      id: translationTask.objectId,
      title: translationTask.title,
      state: 'RECONSTRUCT',
      href: `/translation/${encodeURIComponent(translationTask.objectId)}/`,
      updatedAt: '2026-09-13T10:02:00.000Z'
    });
    await setJson(page, 'kianos-writing-last-location-v1', {
      id: task.id,
      title: task.title,
      state: 'REVIEW_PENDING',
      href: `/writing/${encodeURIComponent(task.id)}/`,
      updatedAt: '2026-09-13T10:03:00.000Z'
    });
    await setJson(page, 'kianos-english-session-instruction-v1', null);
    await page.reload({ waitUntil: 'domcontentloaded' });
    check(await page.locator('[data-english-resume]').isHidden(), 'website_does_not_auto_rank_cross_lane_state');

    const day = await page.evaluate(() => new Date().toLocaleDateString('en-CA'));
    await setJson(page, 'kianos-english-session-instruction-v1', {
      schema: 'kianos.english.session-instruction.v1',
      session_id: 'writing-ffv-cross-lane',
      study_day: day,
      generated_at: new Date().toISOString(),
      current_step: 0,
      steps: [{
        step_id: 'translation-reconstruct',
        task: 'translation',
        object_id: translationTask.objectId,
        source_hash: translationTask.sourceHashes.renderedObject,
        label: 'Translation · unfinished reconstruction',
        note: 'Chat selected from current English evidence'
      }],
      return_policy: { on_finish: 'english_home' }
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-english-resume]').waitFor({ state: 'visible' });
    check((await page.locator('[data-english-resume-title]').textContent()) === 'Translation · unfinished reconstruction', 'chat_session_owns_cross_lane_resume_selection');
    check((await page.locator('[data-english-resume-link]').getAttribute('href'))?.includes(translationTask.objectId), 'chat_session_routes_to_selected_cross_lane_object');

    await clearEnglishResumeFixtures(page);
  } finally {
    await context.close();
  }
}

const tasks = listWritingSyntheticTasks();
check(tasks.length >= 2, 'two_learner_safe_synthetic_tasks_available');

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
    await cleanPassJourney(browser, tasks[0]);
    await repairReturnJourney(browser, tasks[1]);
  } finally {
    await browser.close().catch(() => {});
  }
  report.finishedAt = new Date().toISOString();
  report.pass = true;
  fs.writeFileSync(path.join(auditDir, 'writing-ffv-journey.json'), JSON.stringify(report, null, 2));
  console.log(`WRITING_FFV_JOURNEY_PASS ${report.checks.length} checks`);
} catch (error) {
  report.finishedAt = new Date().toISOString();
  report.pass = false;
  report.error = error instanceof Error ? error.stack || error.message : String(error);
  report.serverLog = serverLog.slice(-12000);
  fs.writeFileSync(path.join(auditDir, 'writing-ffv-journey.json'), JSON.stringify(report, null, 2));
  console.error(report.error);
  process.exitCode = 1;
} finally {
  await stopServer(server);
}