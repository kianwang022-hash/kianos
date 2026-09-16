import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium, webkit } from 'playwright';
import {
  listClozeSets,
  loadClozeById,
  loadClozeAnswersById,
  listReadingBSets,
  loadReadingBById,
  loadReadingBAnswersById
} from '../src/lib/englishObjective.mjs';
import {
  listReadingSets,
  loadReadingById,
  loadReadingAnswersById
} from '../src/lib/englishReading.mjs';

const BASE = 'http://127.0.0.1:4321';
const auditDir = path.resolve(process.cwd(), '../objective-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = { schema: 'kianos.objective.acceptance_e2e.v2', startedAt: new Date().toISOString(), browsers: {}, checks: [] };

const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`ACCEPTANCE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const qid = (q, index) => String(q?.id || q?.question_id || `q${index + 1}`);
const firstAnswer = (value) => Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '');
const optionLabels = (options) => Array.isArray(options)
  ? options.map((_, index) => String.fromCharCode(65 + index))
  : options && typeof options === 'object' ? Object.keys(options).map(String) : [];
const wrongLabel = (question, correct) => optionLabels(question?.options).find((label) => label !== correct) || '';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('PREVIEW_SERVER_NOT_READY');
}

function returnText(payload) {
  return `KIANOS_OBJECTIVE_RETURN_V1\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``;
}

async function storeClaims(page, task) {
  return page.evaluate((targetTask) => {
    const value = JSON.parse(localStorage.getItem('kianos-english-objective-transfer-claims-v1') || '{"claims":[]}');
    return (value.claims || []).filter((claim) => claim?.task === targetTask);
  }, task);
}

async function openImporter(page) {
  const toggle = page.locator('[data-transfer-toggle]');
  await toggle.waitFor({ state: 'visible' });
  const box = page.locator('[data-transfer-import]');
  if (await box.isHidden()) await toggle.click();
  await page.locator('[data-transfer-input]').waitFor({ state: 'visible' });
}

async function importReturn(page, payload, { expectSuccess = true } = {}) {
  await openImporter(page);
  const text = returnText(payload);
  await page.locator('[data-transfer-input]').fill(text);
  await page.locator('[data-transfer-apply]').click();
  if (expectSuccess) await page.waitForFunction(() => document.querySelector('[data-transfer-import]')?.hasAttribute('hidden'));
  return text;
}

async function copyHandoff(page, selector) {
  await page.locator(selector).waitFor({ state: 'visible' });
  await page.locator(selector).click();
  return page.evaluate(() => navigator.clipboard.readText());
}

async function answerCloze(page, item, answers, wrongIndex = -1) {
  for (let index = 0; index < item.questions.length; index += 1) {
    const question = item.questions[index];
    const id = qid(question, index);
    const formal = firstAnswer(answers.answers[id]);
    const selected = index === wrongIndex ? wrongLabel(question, formal) : formal;
    if (!selected) throw new Error(`CLOZE_ANSWER_NOT_SELECTABLE:${id}`);
    await page.locator('[data-objective-question]').nth(index).locator(`[data-value="${selected}"]`).click();
  }
  await page.locator('[data-objective-submit]').click();
  await page.locator('[data-objective-result-summary]').waitFor({ state: 'visible' });
}

async function answerReadingA(page, reading, answers, wrongIndex = -1) {
  for (let index = 0; index < reading.questions.length; index += 1) {
    const question = reading.questions[index];
    const id = qid(question, index);
    const formal = firstAnswer(answers.answers[id]);
    const selected = index === wrongIndex ? wrongLabel(question, formal) : formal;
    if (!selected) throw new Error(`READING_A_ANSWER_NOT_SELECTABLE:${id}`);
    await page.locator('[data-question]').nth(index).locator(`[data-option="${selected}"]`).click();
  }
  await page.locator('[data-reading-submit]').click();
  await page.locator('[data-reading-result]').waitFor({ state: 'visible' });
}

async function answerReadingB(page, item, answers, wrongIndex = -1) {
  for (let index = 0; index < item.questions.length; index += 1) {
    const question = item.questions[index];
    const id = qid(question, index);
    const formal = firstAnswer(answers.answers[id]);
    const labels = optionLabels(question?.options).length ? optionLabels(question.options) : item.candidates.map((candidate) => String(candidate.label));
    const selected = index === wrongIndex ? labels.find((label) => label !== formal) || '' : formal;
    if (!selected) throw new Error(`READING_B_ANSWER_NOT_SELECTABLE:${id}`);
    await page.locator('[data-reading-b-select]').nth(index).selectOption(selected);
  }
  await page.locator('[data-objective-submit]').click();
  await page.locator('[data-objective-result-summary]').waitFor({ state: 'visible' });
}

async function chromiumJourney() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();

  const clozeIds = listClozeSets().slice(0, 5).map((item) => item.id);
  check(clozeIds.length >= 5, 'cloze_has_multiple_fresh_sets');
  const [cleanId, repairId, dormantId, closeId, reopenId] = clozeIds;

  // Clean work has no Chat task and no debt.
  const cleanItem = loadClozeById(cleanId);
  await page.goto(`${BASE}/cloze/${encodeURIComponent(cleanId)}/`);
  await answerCloze(page, cleanItem, loadClozeAnswersById(cleanId));
  check((await page.locator('[data-objective-score]').textContent())?.trim() === `${cleanItem.questions.length} / ${cleanItem.questions.length}`, 'cloze_clean_score');
  check(await page.locator('.objectiveHandoff').isHidden(), 'cloze_clean_pass_has_no_forced_chat');
  check(await page.locator('.objectiveTransferPanel').isHidden(), 'cloze_clean_pass_has_no_transfer_panel');
  check((await storeClaims(page, 'cloze')).length === 0, 'cloze_clean_pass_creates_no_debt');

  // A real problem may escalate to one whole-context deep-review packet.
  const repairItem = loadClozeById(repairId);
  await page.goto(`${BASE}/cloze/${encodeURIComponent(repairId)}/`);
  await answerCloze(page, repairItem, loadClozeAnswersById(repairId), 0);
  const repairPacket = await copyHandoff(page, '[data-objective-copy-chat]');
  check(repairPacket.includes('Cloze deep review packet v2') && repairPacket.includes('OPTIONAL_ESCALATION') && repairPacket.includes('REPAIR / RETURN PROTOCOL'), 'cloze_problem_packet_is_optional_whole_context');
  const handoff = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), `kianos-english-objective-handoff-v1:cloze:${repairId}`);
  check(handoff?.objectId === repairId && handoff?.mode === 'OPTIONAL_ESCALATION', 'cloze_handoff_snapshot_saved');

  const repairQuestionId = qid(repairItem.questions[0], 0);

  // Diagnosis alone and shared-owner repairs cannot manufacture Objective task debt.
  await importReturn(page, {
    schema: 'kianos.english.objective_review_return.v1', task: 'cloze', objectId: repairId,
    threads: [{
      threadId: 'diagnosis-only', scope: 'local', itemIds: [repairQuestionId], route: 'cloze',
      summary: 'diagnosed but not yet repaired', repairCompleted: false, repairEvidence: ''
    }],
    newClaims: [{ sourceThreadId: 'diagnosis-only', statement: 'should not be admitted before repair' }],
    claimUpdates: []
  }, { expectSuccess: false });
  await sleep(100);
  check((await storeClaims(page, 'cloze')).length === 0, 'diagnosis_only_cannot_create_claim');

  for (const route of ['lexical', 'reading']) {
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'cloze', objectId: repairId,
      threads: [{
        threadId: `ability-${route}`, scope: 'local', itemIds: [repairQuestionId], route,
        summary: `${route} shared owner should receive this repair`, repairCompleted: true,
        repairEvidence: 'learner completed the routed repair'
      }],
      newClaims: [{ sourceThreadId: `ability-${route}`, statement: 'must not duplicate shared-owner debt inside Objective' }],
      claimUpdates: []
    }, { expectSuccess: false });
    await sleep(100);
    check((await storeClaims(page, 'cloze')).length === 0, `${route}_route_cannot_create_objective_claim`);
  }

  const completedReturn = {
    schema: 'kianos.english.objective_review_return.v1', task: 'cloze', objectId: repairId,
    threads: [{
      threadId: 't1', scope: 'local', itemIds: [repairQuestionId], route: 'cloze',
      summary: 'candidate competition procedure failed', repairCompleted: true,
      repairEvidence: 'learner reconstructed slot demand and re-decided the competitor pair from the decisive constraint'
    }],
    newClaims: [{ sourceThreadId: 't1', statement: 'when candidates both fit rough meaning, verify the decisive constraint before choosing' }],
    claimUpdates: []
  };

  // Persistence failure remains atomic and preserves the pasted return.
  await openImporter(page);
  const failedText = returnText(completedReturn);
  await page.locator('[data-transfer-input]').fill(failedText);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    window.__objectiveOriginalSetItem = original;
    Storage.prototype.setItem = function(key, value) {
      if (String(key).includes('objective-review-return')) throw new Error('synthetic persistence failure');
      return original.call(this, key, value);
    };
  });
  await page.locator('[data-transfer-apply]').click();
  check((await page.locator('[data-transfer-input]').inputValue()).includes('KIANOS_OBJECTIVE_RETURN_V1'), 'failed_import_preserves_pasted_return');
  check((await storeClaims(page, 'cloze')).length === 0, 'failed_import_rolls_back_claim_state');
  await page.evaluate(() => {
    if (window.__objectiveOriginalSetItem) Storage.prototype.setItem = window.__objectiveOriginalSetItem;
  });
  await page.locator('[data-transfer-apply]').click();
  await page.waitForFunction(() => document.querySelector('[data-transfer-import]')?.hasAttribute('hidden'));
  let clozeClaims = await storeClaims(page, 'cloze');
  check(clozeClaims.length === 1 && clozeClaims[0].status === 'TRANSFER_PENDING', 'completed_repair_creates_one_pending_claim');
  const claimId = clozeClaims[0].claimId;

  await importReturn(page, completedReturn);
  clozeClaims = await storeClaims(page, 'cloze');
  check(clozeClaims.length === 1, 'duplicate_return_is_idempotent');

  // Same historical object cannot close its own transfer target.
  await importReturn(page, {
    schema: 'kianos.english.objective_review_return.v1', task: 'cloze', objectId: repairId,
    threads: [], newClaims: [],
    claimUpdates: [{ claimId, status: 'CLOSED', evidence: 'same historical repair object is not fresh transfer evidence' }]
  }, { expectSuccess: false });
  await sleep(100);
  clozeClaims = await storeClaims(page, 'cloze');
  check(clozeClaims.find((claim) => claim.claimId === claimId)?.status === 'TRANSFER_PENDING', 'unauthorized_same_object_closure_rejected');

  // Strongest minimality invariant: a pending backend claim must stay dormant on a clean later task.
  const dormantItem = loadClozeById(dormantId);
  await page.goto(`${BASE}/cloze/${encodeURIComponent(dormantId)}/`);
  await answerCloze(page, dormantItem, loadClozeAnswersById(dormantId));
  check(await page.locator('.objectiveHandoff').isHidden(), 'clean_pending_claim_does_not_create_learner_task');
  check(await page.locator('.objectiveTransferPanel').isHidden(), 'clean_pending_claim_does_not_surface_transfer_panel');
  clozeClaims = await storeClaims(page, 'cloze');
  check(clozeClaims.find((claim) => claim.claimId === claimId)?.status === 'TRANSFER_PENDING', 'clean_task_leaves_dormant_claim_unchanged');

  // Later normal work can update a claim opportunistically when an actual problem already justifies deep review.
  const closeItem = loadClozeById(closeId);
  await page.goto(`${BASE}/cloze/${encodeURIComponent(closeId)}/`);
  await answerCloze(page, closeItem, loadClozeAnswersById(closeId), 0);
  const supportPacket = await copyHandoff(page, '[data-objective-copy-chat]');
  check(supportPacket.includes('ACTIVE TRANSFER CLAIMS · opportunistic only') && supportPacket.includes(claimId), 'problem_review_may_carry_relevant_pending_claim');

  await importReturn(page, {
    schema: 'kianos.english.objective_review_return.v1', task: 'cloze', objectId: closeId,
    threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'CLOSED', evidence: '' }]
  });
  clozeClaims = await storeClaims(page, 'cloze');
  check(clozeClaims.find((claim) => claim.claimId === claimId)?.status === 'TRANSFER_PENDING', 'closure_without_fresh_evidence_rejected');

  await importReturn(page, {
    schema: 'kianos.english.objective_review_return.v1', task: 'cloze', objectId: closeId,
    threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'CLOSED', evidence: 'fresh problem set also directly tested the same best-fit procedure and the relevant execution was stable' }]
  });
  clozeClaims = await storeClaims(page, 'cloze');
  check(clozeClaims.find((claim) => claim.claimId === claimId)?.status === 'CLOSED', 'fresh_relevant_evidence_closes_claim');

  // The current handoff authorized the pending claim for possible close, not reopen.
  await importReturn(page, {
    schema: 'kianos.english.objective_review_return.v1', task: 'cloze', objectId: closeId,
    threads: [], newClaims: [],
    claimUpdates: [{ claimId, status: 'REOPENED', evidence: 'same packet is not a closed-claim reopen candidate' }]
  }, { expectSuccess: false });
  await sleep(100);
  clozeClaims = await storeClaims(page, 'cloze');
  check(clozeClaims.find((claim) => claim.claimId === claimId)?.status === 'CLOSED', 'unauthorized_reopen_rejected');

  // A later contradictory fresh problem can conservatively reopen the exact closed claim.
  const reopenItem = loadClozeById(reopenId);
  await page.goto(`${BASE}/cloze/${encodeURIComponent(reopenId)}/`);
  await answerCloze(page, reopenItem, loadClozeAnswersById(reopenId), 0);
  const reopenPacket = await copyHandoff(page, '[data-objective-copy-chat]');
  check(reopenPacket.includes('RECENT CLOSED CLAIMS · reopen only with direct contradiction') && reopenPacket.includes(claimId), 'problem_packet_can_surface_closed_reopen_candidate');
  await importReturn(page, {
    schema: 'kianos.english.objective_review_return.v1', task: 'cloze', objectId: reopenId,
    threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'REOPENED', evidence: 'fresh problem reproduced the same premature rough-meaning choice despite a decisive competing constraint' }]
  });
  clozeClaims = await storeClaims(page, 'cloze');
  check(clozeClaims.find((claim) => claim.claimId === claimId)?.status === 'TRANSFER_PENDING', 'fresh_contradiction_reopens_closed_claim');

  await browser.close();
  report.browsers.chromium = 'full-journey-pass';
}

async function readingAAndBSmoke(browserType, name) {
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({ permissions: name === 'chromium' ? ['clipboard-read', 'clipboard-write'] : [] });
  const page = await context.newPage();

  // Reading A clean and problem paths preserve whole-passage attempt continuity; deep review is optional escalation.
  const readingIds = listReadingSets().slice(0, 3).map((item) => item.id);
  check(readingIds.length >= 2, `${name}_reading_a_has_sets`);
  const cleanReading = loadReadingById(readingIds[0]);
  await page.goto(`${BASE}/reading/${encodeURIComponent(readingIds[0])}/`);
  await answerReadingA(page, cleanReading, loadReadingAnswersById(readingIds[0]));
  check((await page.locator('[data-reading-score]').textContent())?.trim() === `${cleanReading.questions.length} / ${cleanReading.questions.length}`, `${name}_reading_a_clean_pass`);
  check(await page.locator('[data-reading-passage-copy-chat]').isHidden(), `${name}_reading_a_clean_no_forced_chat`);

  const problemReading = loadReadingById(readingIds[1]);
  await page.goto(`${BASE}/reading/${encodeURIComponent(readingIds[1])}/`);
  await answerReadingA(page, problemReading, loadReadingAnswersById(readingIds[1]), 0);
  await page.locator('[data-reading-passage-copy-chat]').waitFor({ state: 'visible' });
  const repairStatus = (await page.locator('[data-reading-passage-copy-status]').textContent()) || '';
  check(repairStatus.includes('problem') && repairStatus.includes('快速'), `${name}_reading_a_problem_offers_optional_escalation`);
  check(await page.locator('[data-reading-coach]').count() === 0, `${name}_reading_a_old_local_semantic_coach_not_loaded`);

  // Reading B preserves real directions/form and can execute a formal clean map.
  const readingBItems = listReadingBSets().map((entry) => loadReadingBById(entry.id));
  const readingB = readingBItems.find((item) => item.context?.instruction && item.questions.length > 1) || readingBItems[0];
  check(Boolean(readingB), `${name}_reading_b_has_set`);
  await page.goto(`${BASE}/reading-b/${encodeURIComponent(readingB.objectId)}/`);
  if (readingB.context?.instruction || readingB.context?.subtitle) {
    await page.locator('[data-objective-instruction]').waitFor({ state: 'visible' });
    const directions = (await page.locator('[data-objective-instruction]').textContent()) || '';
    check(directions.includes(String(readingB.context.instruction || '').trim().slice(0, 24)) || Boolean(readingB.context.subtitle), `${name}_reading_b_directions_projected`);
  }
  check((await page.locator('[data-objective-root]').getAttribute('data-reading-b-task-form')) === readingB.context.taskForm, `${name}_reading_b_task_form_projected`);
  check((await page.locator('[data-objective-root]').getAttribute('data-reading-b-candidate-policy')) === readingB.context.candidateUsePolicy, `${name}_reading_b_candidate_policy_projected`);

  await answerReadingB(page, readingB, loadReadingBAnswersById(readingB.objectId));
  check((await page.locator('[data-objective-score]').textContent())?.trim() === `${readingB.questions.length} / ${readingB.questions.length}`, `${name}_reading_b_formal_map_executable`);

  await browser.close();
  report.browsers[name] = report.browsers[name] || 'smoke-pass';
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4321'], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe']
});
let serverLog = '';
server.stdout.on('data', (chunk) => { serverLog += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverLog += chunk.toString(); });

try {
  await waitForServer();
  await chromiumJourney();
  await readingAAndBSmoke(chromium, 'chromium-smoke');
  await readingAAndBSmoke(webkit, 'webkit');
  report.finishedAt = new Date().toISOString();
  report.pass = true;
  fs.writeFileSync(path.join(auditDir, 'journey.json'), JSON.stringify(report, null, 2));
  console.log(`OBJECTIVE_ACCEPTANCE_E2E_PASS ${report.checks.length} checks`);
} catch (error) {
  report.finishedAt = new Date().toISOString();
  report.pass = false;
  report.error = error instanceof Error ? error.stack || error.message : String(error);
  report.serverLog = serverLog.slice(-12000);
  fs.writeFileSync(path.join(auditDir, 'journey.json'), JSON.stringify(report, null, 2));
  console.error(report.error);
  process.exitCode = 1;
} finally {
  server.kill('SIGTERM');
}