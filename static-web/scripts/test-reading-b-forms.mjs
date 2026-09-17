import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium, webkit } from 'playwright';
import {
  listReadingBSets,
  loadReadingBById,
  loadReadingBAnswersById
} from '../src/lib/englishObjective.mjs';

const BASE = 'http://127.0.0.1:4321';
const auditDir = path.resolve(process.cwd(), '../objective-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = { schema: 'kianos.reading_b.forms_e2e.v1', startedAt: new Date().toISOString(), checks: [] };
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`READING_B_E2E_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const qid = (q, index) => String(q?.id || q?.question_id || `q${index + 1}`);
const firstAnswer = (value) => Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '');

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try { const response = await fetch(BASE); if (response.ok) return; } catch {}
    await sleep(250);
  }
  throw new Error('READING_B_PREVIEW_SERVER_NOT_READY');
}

async function stopServer(server) {
  if (!server) return;
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGTERM'); } catch {}
    } else {
      try { server.kill('SIGTERM'); } catch {}
    }
    await Promise.race([
      new Promise((resolve) => server.once('exit', resolve)),
      sleep(1000)
    ]);
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

async function answerMap(page, item, answerPayload, overrides = {}) {
  for (let index = 0; index < item.questions.length; index += 1) {
    const id = qid(item.questions[index], index);
    const selected = String(overrides[id] || firstAnswer(answerPayload.answers[id]));
    if (!selected) throw new Error(`READING_B_MISSING_SELECTABLE_ANSWER:${id}`);
    await page.locator('[data-reading-b-select]').nth(index).selectOption(selected);
  }
  await page.locator('[data-objective-submit]').click();
  await page.locator('[data-objective-result-summary]').waitFor({ state: 'visible' });
}

async function validateForm(page, item, browserName) {
  const prefix = `${browserName}_${item.context.taskForm}`;
  await page.goto(`${BASE}/reading-b/${encodeURIComponent(item.objectId)}/`);
  await page.locator('[data-objective-root]').waitFor({ state: 'visible' });

  check((await page.locator('[data-objective-root]').getAttribute('data-reading-b-task-form')) === item.context.taskForm, `${prefix}_task_form`);
  check((await page.locator('[data-objective-root]').getAttribute('data-reading-b-candidate-policy')) === 'single_use', `${prefix}_single_use`);

  // Current keeps the exact source directions in the projection for provenance,
  // but the learner-facing workspace no longer spends a full-width card on
  // boilerplate exam instructions. Task form + candidate policy own the compact UI.
  const instruction = page.locator('[data-objective-instruction]');
  check(await instruction.count() === 1, `${prefix}_directions_preserved_in_projection`);
  const directionText = (await instruction.locator('p').textContent())?.replace(/\s+/g, ' ').trim() || '';
  check(directionText.includes(String(item.context.directions).slice(0, 32)), `${prefix}_directions_source_exact`);
  check(await instruction.isHidden(), `${prefix}_verbose_directions_not_learner_facing`);

  const candidateRows = page.locator('[data-objective-candidate]');
  check(await candidateRows.count() === item.candidates.length, `${prefix}_candidate_count`);
  const candidateText = (await candidateRows.first().locator('span').textContent())?.trim() || '';
  check(candidateText.length > 8 && candidateText !== item.candidates[0].label, `${prefix}_candidate_text`);

  if (item.context.taskForm === 'ordering') {
    check(await page.locator('[data-reading-b-ordering-skeleton]').count() === 1, `${prefix}_ordering_skeleton_visible`);
    check(await page.locator('[data-reading-b-fixed]').count() === item.context.fixedGivens.length, `${prefix}_fixed_givens_visible`);
    check(await page.locator('[data-objective-material-block]').count() === 0, `${prefix}_no_fake_material_panel`);
    const firstSelect = page.locator('[data-reading-b-select]').first();
    for (const fixed of item.context.fixedGivens) {
      check(await firstSelect.locator(`option[value="${fixed}"]`).isDisabled(), `${prefix}_fixed_${fixed}_not_selectable`);
    }
  } else {
    check(await page.locator('[data-objective-material-block]').count() > 0, `${prefix}_material_visible`);
  }

  if (item.context.taskForm === 'comment_match') {
    const firstLabel = (await page.locator('[data-reading-b-target-label]').first().getAttribute('data-reading-b-target-label')) || '';
    check(/41\s*·\s*\S+/.test(firstLabel), `${prefix}_comment_name_projected`, firstLabel);
  } else {
    const firstLabel = (await page.locator('[data-reading-b-target-label]').first().getAttribute('data-reading-b-target-label')) || '';
    check(firstLabel.includes('41'), `${prefix}_uses_exam_number_41`, firstLabel);
  }

  await answerMap(page, item, loadReadingBAnswersById(item.objectId));
  check((await page.locator('[data-objective-score]').textContent())?.trim() === `${item.questions.length} / ${item.questions.length}`, `${prefix}_clean_map_executable`);
  check(await page.locator('.objectiveHandoff').isHidden(), `${prefix}_clean_pass_no_forced_chat`);
}

async function runBrowser(browserType, name, itemsByForm, { handoff = false } = {}) {
  const browser = await browserType.launch({ headless: true });
  try {
    const context = await browser.newContext({ permissions: handoff ? ['clipboard-read', 'clipboard-write'] : [] });
    const page = await context.newPage();
    for (const form of ['gap_match', 'heading_match', 'ordering', 'comment_match']) {
      await validateForm(page, itemsByForm.get(form), name);
    }

    if (handoff) {
      const orderingItems = listReadingBSets().map((entry) => loadReadingBById(entry.id)).filter((item) => item.context.taskForm === 'ordering');
      const item = orderingItems[1] || orderingItems[0];
      const answerPayload = loadReadingBAnswersById(item.objectId);
      const formal = item.questions.map((question, index) => firstAnswer(answerPayload.answers[qid(question, index)]));
      check(formal.length >= 2 && formal[0] && formal[1] && formal[0] !== formal[1], 'chromium_ordering_has_swappable_formal_pair');
      const firstId = qid(item.questions[0], 0);
      const secondId = qid(item.questions[1], 1);
      const swapped = { [firstId]: formal[1], [secondId]: formal[0] };

      await page.goto(`${BASE}/reading-b/${encodeURIComponent(item.objectId)}/`);
      await answerMap(page, item, answerPayload, swapped);
      await page.locator('[data-objective-copy-chat]').waitFor({ state: 'visible' });
      await page.locator('[data-objective-copy-chat]').click();
      const packet = await page.evaluate(() => navigator.clipboard.readText());
      check(packet.includes('Reading B deep review packet v2'), 'chromium_ordering_handoff_whole_set');
      check(packet.includes('Task form: ordering'), 'chromium_ordering_handoff_form');
      check(packet.includes('ORDERING SKELETON'), 'chromium_ordering_handoff_skeleton');
      check(packet.includes('CANDIDATE INVENTORY'), 'chromium_ordering_handoff_candidates');
      check(packet.includes('Slot 41'), 'chromium_ordering_handoff_exam_slot');
    }
  } finally {
    await browser.close().catch(() => {});
  }
}

const allItems = listReadingBSets().map((entry) => loadReadingBById(entry.id));
const itemsByForm = new Map();
for (const item of allItems) if (!itemsByForm.has(item.context.taskForm)) itemsByForm.set(item.context.taskForm, item);
for (const form of ['gap_match', 'heading_match', 'ordering', 'comment_match']) check(Boolean(itemsByForm.get(form)), `source_has_${form}`);

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
  await runBrowser(chromium, 'chromium', itemsByForm, { handoff: true });
  await runBrowser(webkit, 'webkit', itemsByForm);
  report.finishedAt = new Date().toISOString();
  report.pass = true;
  fs.writeFileSync(path.join(auditDir, 'reading-b-forms.json'), JSON.stringify(report, null, 2));
  console.log(`READING_B_FORMS_E2E_PASS ${report.checks.length} checks`);
} catch (error) {
  report.finishedAt = new Date().toISOString();
  report.pass = false;
  report.error = error instanceof Error ? error.stack || error.message : String(error);
  report.serverLog = serverLog.slice(-12000);
  fs.writeFileSync(path.join(auditDir, 'reading-b-forms.json'), JSON.stringify(report, null, 2));
  console.error(report.error);
  process.exitCode = 1;
} finally {
  await stopServer(server);
}
