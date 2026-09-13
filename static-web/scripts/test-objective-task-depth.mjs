import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import {
  listReadingSets,
  loadReadingById,
  loadReadingAnswersById
} from '../src/lib/englishReading.mjs';
import {
  listReadingBSets,
  loadReadingBById,
  loadReadingBAnswersById
} from '../src/lib/englishObjective.mjs';

const BASE = 'http://127.0.0.1:4321';
const auditDir = path.resolve(process.cwd(), '../objective-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = {
  schema: 'kianos.objective.task_depth_e2e.v1',
  startedAt: new Date().toISOString(),
  checks: []
};

const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`OBJECTIVE_TASK_DEPTH_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const qid = (q, index) => String(q?.id || q?.question_id || `q${index + 1}`);
const firstAnswer = (value) => Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '');
const optionLabels = (options) => Array.isArray(options)
  ? options.map((_, index) => String.fromCharCode(65 + index))
  : options && typeof options === 'object' ? Object.keys(options).map(String) : [];
const wrongLabel = (question, correct) => optionLabels(question?.options).find((label) => label !== correct) || '';

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('OBJECTIVE_TASK_DEPTH_PREVIEW_NOT_READY');
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

async function importReturn(page, payload) {
  await openImporter(page);
  await page.locator('[data-transfer-input]').fill(returnText(payload));
  await page.locator('[data-transfer-apply]').click();
  await page.waitForFunction(() => document.querySelector('[data-transfer-import]')?.hasAttribute('hidden'));
}

async function copyHandoff(page, selector) {
  await page.locator(selector).waitFor({ state: 'visible' });
  await page.locator(selector).click();
  return page.evaluate(() => navigator.clipboard.readText());
}

async function failPersistenceOnceThenImport(page, payload, task) {
  await openImporter(page);
  const text = returnText(payload);
  await page.locator('[data-transfer-input]').fill(text);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    window.__objectiveDepthOriginalSetItem = original;
    Storage.prototype.setItem = function(key, value) {
      if (String(key).includes('objective-review-return')) throw new Error('synthetic persistence failure');
      return original.call(this, key, value);
    };
  });
  await page.locator('[data-transfer-apply]').click();
  check((await page.locator('[data-transfer-input]').inputValue()).includes('KIANOS_OBJECTIVE_RETURN_V1'), `${task}_failed_import_preserves_return`);
  check((await storeClaims(page, task)).length === 0, `${task}_failed_import_rolls_back_claims`);
  await page.evaluate(() => {
    if (window.__objectiveDepthOriginalSetItem) Storage.prototype.setItem = window.__objectiveDepthOriginalSetItem;
  });
  await page.locator('[data-transfer-apply]').click();
  await page.waitForFunction(() => document.querySelector('[data-transfer-import]')?.hasAttribute('hidden'));
}

async function answerReadingA(page, reading, answers, { wrongIndices = [], uncertainIndices = [] } = {}) {
  const wrong = new Set(wrongIndices);
  const uncertain = new Set(uncertainIndices);
  for (let index = 0; index < reading.questions.length; index += 1) {
    const question = reading.questions[index];
    const id = qid(question, index);
    const formal = firstAnswer(answers.answers[id]);
    const selected = wrong.has(index) ? wrongLabel(question, formal) : formal;
    if (!selected) throw new Error(`READING_A_DEPTH_ANSWER_NOT_SELECTABLE:${id}`);
    await page.locator('.portedReadingQuestionNav button').nth(index).click();
    await page.locator('[data-question]').nth(index).locator(`[data-option="${selected}"]`).click();
    if (uncertain.has(index)) await page.locator('[data-question]').nth(index).locator('.portedUncertain').click();
  }
  await page.locator('[data-reading-submit]').click();
  await page.locator('[data-reading-result]').waitFor({ state: 'visible' });
}

function readingBFormalMap(item, answers) {
  return item.questions.map((question, index) => firstAnswer(answers.answers[qid(question, index)]));
}

async function answerReadingB(page, item, answers, { swapFirstPair = false } = {}) {
  const formal = readingBFormalMap(item, answers);
  if (swapFirstPair) {
    check(formal.length >= 2 && formal[0] && formal[1] && formal[0] !== formal[1], `reading_b_${item.objectId}_swappable_pair`);
  }
  for (let index = 0; index < item.questions.length; index += 1) {
    let selected = formal[index];
    if (swapFirstPair && index === 0) selected = formal[1];
    if (swapFirstPair && index === 1) selected = formal[0];
    if (!selected) throw new Error(`READING_B_DEPTH_ANSWER_NOT_SELECTABLE:${qid(item.questions[index], index)}`);
    await page.locator('[data-reading-b-select]').nth(index).selectOption(selected);
  }
  await page.locator('[data-objective-submit]').click();
  await page.locator('[data-objective-result-summary]').waitFor({ state: 'visible' });
}

async function readingADeepJourney(browser) {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  try {
    const ids = listReadingSets().slice(0, 6).map((item) => item.id);
    check(ids.length >= 5, 'reading_a_depth_has_five_sets');
    const [uncertainId, repairId, closeId, reopenId] = ids;
    // Correct but uncertain must enter passage-level review without manufacturing a wrong answer.
    const uncertainReading = loadReadingById(uncertainId);
    await page.goto(`${BASE}/reading/${encodeURIComponent(uncertainId)}/`, { waitUntil: 'domcontentloaded' });
    await answerReadingA(page, uncertainReading, loadReadingAnswersById(uncertainId), { uncertainIndices: [0] });
    check((await page.locator('[data-reading-score]').textContent())?.trim() === `${uncertainReading.questions.length} / ${uncertainReading.questions.length}`, 'reading_a_uncertain_correct_score_stays_correct');
    const uncertainPacket = await copyHandoff(page, '[data-reading-passage-copy-chat]');
    check(uncertainPacket.includes('Reading A review packet v1') && uncertainPacket.includes('Uncertain: Q1'), 'reading_a_uncertain_enters_whole_passage_review');
    check((await storeClaims(page, 'reading_a')).length === 0, 'reading_a_uncertain_does_not_manufacture_debt');

    // Wrong passage -> whole-passage handoff -> completed task repair -> one pending claim.
    const repairReading = loadReadingById(repairId);
    await page.goto(`${BASE}/reading/${encodeURIComponent(repairId)}/`, { waitUntil: 'domcontentloaded' });
    await answerReadingA(page, repairReading, loadReadingAnswersById(repairId), { wrongIndices: [0, 1] });
    const repairPacket = await copyHandoff(page, '[data-reading-passage-copy-chat]');
    check(
      repairPacket.includes('Reading A review packet v1') &&
      repairPacket.includes('PASSAGE') &&
      repairPacket.includes('ALL-QUESTION OUTCOME MAP') &&
      repairPacket.includes('REPAIR / RETURN PROTOCOL'),
      'reading_a_problem_handoff_is_whole_passage'
    );
    const handoff = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), `kianos-english-objective-handoff-v1:reading_a:${repairId}`);
    check(handoff?.objectId === repairId && handoff?.task === 'reading_a', 'reading_a_handoff_snapshot_saved');

    const firstId = qid(repairReading.questions[0], 0);
    const secondId = qid(repairReading.questions[1], 1);
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_a', objectId: repairId,
      threads: [{
        threadId: 'diagnosis-only', scope: 'shared', itemIds: [firstId, secondId], route: 'reading_a',
        summary: 'two item signals were diagnosed but not yet repaired', repairCompleted: false, repairEvidence: ''
      }],
      newClaims: [{ sourceThreadId: 'diagnosis-only', statement: 'must not become debt before learner re-execution' }],
      claimUpdates: []
    });
    check((await storeClaims(page, 'reading_a')).length === 0, 'reading_a_diagnosis_only_cannot_create_claim');

    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_a', objectId: repairId,
      threads: [{
        threadId: 'ability-reading', scope: 'shared', itemIds: [firstId, secondId], route: 'reading',
        summary: 'shared passage representation failure belongs to Reading', repairCompleted: true,
        repairEvidence: 'learner rebuilt the relevant passage representation'
      }],
      newClaims: [{ sourceThreadId: 'ability-reading', statement: 'must not duplicate Reading-owned debt inside Reading A' }],
      claimUpdates: []
    });
    check((await storeClaims(page, 'reading_a')).length === 0, 'reading_a_reading_route_cannot_create_task_claim');

    const completedReturn = {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_a', objectId: repairId,
      threads: [{
        threadId: 'ra-shared-1', scope: 'shared', itemIds: [firstId, secondId], route: 'reading_a',
        summary: 'option adjudication accepted a broader claim than the decisive evidence allowed', repairCompleted: true,
        repairEvidence: 'learner re-located the decisive span, compared scope fields, and re-adjudicated both affected options'
      }],
      newClaims: [{ sourceThreadId: 'ra-shared-1', statement: 'when close options differ in scope, compare the decisive evidence boundary before accepting the paraphrase' }],
      claimUpdates: []
    };
    await failPersistenceOnceThenImport(page, completedReturn, 'reading_a');
    let claims = await storeClaims(page, 'reading_a');
    check(claims.length === 1 && claims[0].status === 'TRANSFER_PENDING', 'reading_a_completed_repair_creates_one_pending_claim');
    const claimId = claims[0].claimId;

    await importReturn(page, completedReturn);
    claims = await storeClaims(page, 'reading_a');
    check(claims.length === 1, 'reading_a_duplicate_return_is_idempotent');

    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_a', objectId: repairId,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'CLOSED', evidence: 'same passage correction is not fresh transfer' }]
    });
    claims = await storeClaims(page, 'reading_a');
    check(claims[0]?.status === 'TRANSFER_PENDING', 'reading_a_same_object_cannot_close_claim');

    // Distinct clean passage carries the claim and may close only with explicit fresh evidence.
    const closeReading = loadReadingById(closeId);
    await page.goto(`${BASE}/reading/${encodeURIComponent(closeId)}/`, { waitUntil: 'domcontentloaded' });
    await answerReadingA(page, closeReading, loadReadingAnswersById(closeId));
    const transferPacket = await copyHandoff(page, '[data-reading-passage-copy-chat]');
    check(transferPacket.includes('QUESTION CONTEXT FOR DIAGNOSIS / TRANSFER') && transferPacket.includes(claimId), 'reading_a_fresh_transfer_packet_has_claim_and_context');
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_a', objectId: closeId,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'CLOSED', evidence: '' }]
    });
    claims = await storeClaims(page, 'reading_a');
    check(claims[0]?.status === 'TRANSFER_PENDING', 'reading_a_close_without_fresh_evidence_rejected');
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_a', objectId: closeId,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'CLOSED', evidence: 'fresh passage directly required scope-boundary adjudication and execution was stable' }]
    });
    claims = await storeClaims(page, 'reading_a');
    check(claims[0]?.status === 'CLOSED', 'reading_a_fresh_relevant_evidence_closes_claim');

    // Distinct contradictory problem can reopen the exact closed task claim.
    const reopenReading = loadReadingById(reopenId);
    await page.goto(`${BASE}/reading/${encodeURIComponent(reopenId)}/`, { waitUntil: 'domcontentloaded' });
    await answerReadingA(page, reopenReading, loadReadingAnswersById(reopenId), { wrongIndices: [0] });
    const reopenPacket = await copyHandoff(page, '[data-reading-passage-copy-chat]');
    check(reopenPacket.includes('RECENT CLOSED CLAIMS · REOPEN CANDIDATES') && reopenPacket.includes(claimId), 'reading_a_problem_packet_surfaces_reopen_candidate');
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_a', objectId: reopenId,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'REOPENED', evidence: 'fresh passage reproduced the same over-broad scope acceptance under a new option contrast' }]
    });
    claims = await storeClaims(page, 'reading_a');
    check(claims[0]?.status === 'TRANSFER_PENDING', 'reading_a_fresh_contradiction_reopens_claim');
  } finally {
    await context.close();
  }
}

async function readingAContinuousJourney(browser) {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  try {
    const all = listReadingSets().map((entry) => loadReadingById(entry.id));
    const start = all.find((item) => item.navigation?.nextId);
    check(Boolean(start?.navigation?.nextId), 'reading_a_continuous_has_linked_pair');
    const nextId = start.navigation.nextId;
    const nextReading = loadReadingById(nextId);

    await page.goto(`${BASE}/reading/${encodeURIComponent(start.objectId)}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-reading-continuous]').click();
    check((await page.locator('[data-reading-continuous]').getAttribute('aria-pressed')) === 'true', 'reading_a_continuous_mode_enabled');
    await answerReadingA(page, start, loadReadingAnswersById(start.objectId), { uncertainIndices: [0] });
    check((await page.locator('[data-reading-score]').textContent())?.trim() === '已收卷', 'reading_a_continuous_hides_interim_score');
    check(await page.locator('[data-reading-answer-strip]').first().isHidden(), 'reading_a_continuous_hides_formal_answer_strip');
    check(await page.locator('[data-reading-passage-copy-chat]').isHidden(), 'reading_a_continuous_hides_interim_review_handoff');
    const firstAttempt = await page.evaluate((id) => JSON.parse(localStorage.getItem(`kianos-reading-attempt-v1:${id}`) || 'null'), start.objectId);
    check(firstAttempt?.submitted === true && firstAttempt?.reviewUnlocked === false, 'reading_a_continuous_first_attempt_sealed');

    await page.locator('[data-reading-session-continue]').click();
    await page.waitForURL(`**/reading/${encodeURIComponent(nextId)}**`);
    await page.locator('[data-local-port="reading"]').waitFor({ state: 'visible' });
    await answerReadingA(page, nextReading, loadReadingAnswersById(nextId));
    check((await page.locator('[data-reading-score]').textContent())?.trim() === '已收卷', 'reading_a_continuous_second_score_stays_sealed');
    const session = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-reading-continuous-session-v1') || 'null'));
    check(session?.items?.length === 2, 'reading_a_continuous_records_two_passages');
    check(session?.reviewIds?.length === 1 && session.reviewIds[0] === start.objectId, 'reading_a_continuous_routes_only_problem_passage_to_review');

    await page.locator('[data-reading-session-review]').click();
    await page.waitForURL(`**/reading/${encodeURIComponent(start.objectId)}**`);
    await page.locator('[data-local-port="reading"]').waitFor({ state: 'visible' });
    check((await page.locator('[data-reading-score]').textContent())?.trim() === `${start.questions.length} / ${start.questions.length}`, 'reading_a_continuous_unlocks_review_score_at_session_end');
    check(await page.locator('[data-reading-passage-copy-chat]').isVisible(), 'reading_a_continuous_returns_to_problem_passage_handoff');
    const restored = await page.evaluate((id) => JSON.parse(localStorage.getItem(`kianos-reading-attempt-v1:${id}`) || 'null'), start.objectId);
    check(restored?.submitted === true && restored?.uncertain?.length === 1 && restored?.reviewUnlocked !== false, 'reading_a_continuous_preserves_attempt_and_uncertainty_on_return');
  } finally {
    await context.close();
  }
}

async function readingBDeepJourney(browser) {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  try {
    const items = listReadingBSets().slice(0, 5).map((entry) => loadReadingBById(entry.id));
    check(items.length >= 3, 'reading_b_depth_has_three_sets');
    const [repairItem, closeItem, reopenItem] = items;

    await page.goto(`${BASE}/reading-b/${encodeURIComponent(repairItem.objectId)}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-objective-root]').waitFor({ state: 'visible' });
    await answerReadingB(page, repairItem, loadReadingBAnswersById(repairItem.objectId), { swapFirstPair: true });
    const repairPacket = await copyHandoff(page, '[data-objective-copy-chat]');
    check(
      repairPacket.includes('Reading B set review packet v1') &&
      repairPacket.includes('COMPLETE MATCH / PLACEMENT MAP') &&
      repairPacket.includes('CANDIDATE INVENTORY') &&
      repairPacket.includes('REPAIR / RETURN PROTOCOL'),
      'reading_b_problem_handoff_is_whole_set'
    );
    const handoff = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), `kianos-english-objective-handoff-v1:reading_b:${repairItem.objectId}`);
    check(handoff?.objectId === repairItem.objectId && handoff?.task === 'reading_b', 'reading_b_handoff_snapshot_saved');

    const firstId = qid(repairItem.questions[0], 0);
    const secondId = qid(repairItem.questions[1], 1);
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_b', objectId: repairItem.objectId,
      threads: [
        {
          threadId: 'rb-local-reading', scope: 'local', itemIds: [firstId], route: 'reading',
          summary: 'local discourse representation issue belongs to Reading', repairCompleted: true,
          repairEvidence: 'learner reconstructed the local discourse relation'
        },
        {
          threadId: 'rb-coupled', scope: 'coupled', itemIds: [firstId, secondId], route: 'reading_b',
          summary: 'two placements were swapped because candidate roles were reconciled locally but not globally', repairCompleted: false,
          repairEvidence: ''
        }
      ],
      newClaims: [
        { sourceThreadId: 'rb-local-reading', statement: 'must not duplicate Reading-owned work' },
        { sourceThreadId: 'rb-coupled', statement: 'must not admit coupled task debt before repair' }
      ],
      claimUpdates: []
    });
    check((await storeClaims(page, 'reading_b')).length === 0, 'reading_b_routed_or_unrepaired_threads_do_not_create_claims');

    const completedReturn = {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_b', objectId: repairItem.objectId,
      threads: [{
        threadId: 'rb-coupled', scope: 'coupled', itemIds: [firstId, secondId], route: 'reading_b',
        summary: 'two placements were swapped because local fit was accepted before global reconciliation', repairCompleted: true,
        repairEvidence: 'learner contrasted both candidate roles, rebuilt the coupled placement map, and verified the remaining global inventory'
      }],
      newClaims: [{ sourceThreadId: 'rb-coupled', statement: 'after a locally plausible placement, verify the coupled/global candidate map before committing' }],
      claimUpdates: []
    };
    await failPersistenceOnceThenImport(page, completedReturn, 'reading_b');
    let claims = await storeClaims(page, 'reading_b');
    check(claims.length === 1 && claims[0].status === 'TRANSFER_PENDING', 'reading_b_completed_coupled_repair_creates_one_pending_claim');
    const claimId = claims[0].claimId;
    await importReturn(page, completedReturn);
    claims = await storeClaims(page, 'reading_b');
    check(claims.length === 1, 'reading_b_duplicate_return_is_idempotent');

    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_b', objectId: repairItem.objectId,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'CLOSED', evidence: 'same set is not fresh transfer evidence' }]
    });
    claims = await storeClaims(page, 'reading_b');
    check(claims[0]?.status === 'TRANSFER_PENDING', 'reading_b_same_object_cannot_close_claim');

    await page.goto(`${BASE}/reading-b/${encodeURIComponent(closeItem.objectId)}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-objective-root]').waitFor({ state: 'visible' });
    await answerReadingB(page, closeItem, loadReadingBAnswersById(closeItem.objectId));
    const transferPacket = await copyHandoff(page, '[data-objective-copy-chat]');
    check(transferPacket.includes('ITEM CONTEXT FOR DIAGNOSIS / TRANSFER') && transferPacket.includes(claimId), 'reading_b_fresh_transfer_packet_has_claim_and_context');
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_b', objectId: closeItem.objectId,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'CLOSED', evidence: '' }]
    });
    claims = await storeClaims(page, 'reading_b');
    check(claims[0]?.status === 'TRANSFER_PENDING', 'reading_b_close_without_fresh_evidence_rejected');
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_b', objectId: closeItem.objectId,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'CLOSED', evidence: 'fresh set directly required global candidate reconciliation and the map remained stable' }]
    });
    claims = await storeClaims(page, 'reading_b');
    check(claims[0]?.status === 'CLOSED', 'reading_b_fresh_relevant_evidence_closes_claim');

    await page.goto(`${BASE}/reading-b/${encodeURIComponent(reopenItem.objectId)}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-objective-root]').waitFor({ state: 'visible' });
    await answerReadingB(page, reopenItem, loadReadingBAnswersById(reopenItem.objectId), { swapFirstPair: true });
    const reopenPacket = await copyHandoff(page, '[data-objective-copy-chat]');
    check(reopenPacket.includes('RECENT CLOSED CLAIMS · REOPEN CANDIDATES') && reopenPacket.includes(claimId), 'reading_b_problem_packet_surfaces_reopen_candidate');
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_b', objectId: reopenItem.objectId,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'REOPENED', evidence: 'fresh set reproduced the same local-fit-before-global-reconciliation failure' }]
    });
    claims = await storeClaims(page, 'reading_b');
    check(claims[0]?.status === 'TRANSFER_PENDING', 'reading_b_fresh_contradiction_reopens_claim');

    const candidatePolicy = await page.locator('[data-objective-root]').getAttribute('data-reading-b-candidate-policy');
    if (candidatePolicy === 'single_use') {
      const firstSelect = page.locator('[data-reading-b-select]').first();
      const selected = await firstSelect.inputValue();
      const duplicateEnabled = await page.locator('[data-reading-b-select]').nth(1).locator(`option[value="${selected}"]`).isEnabled().catch(() => false);
      check(!duplicateEnabled, 'reading_b_single_use_constraint_survives_problem_journey');
    }
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
    await readingADeepJourney(browser);
    await readingAContinuousJourney(browser);
    await readingBDeepJourney(browser);
  } finally {
    await browser.close().catch(() => {});
  }
  report.finishedAt = new Date().toISOString();
  report.pass = true;
  fs.writeFileSync(path.join(auditDir, 'objective-task-depth.json'), JSON.stringify(report, null, 2));
  console.log(`OBJECTIVE_TASK_DEPTH_E2E_PASS ${report.checks.length} checks`);
} catch (error) {
  report.finishedAt = new Date().toISOString();
  report.pass = false;
  report.error = error instanceof Error ? error.stack || error.message : String(error);
  report.serverLog = serverLog.slice(-12000);
  fs.writeFileSync(path.join(auditDir, 'objective-task-depth.json'), JSON.stringify(report, null, 2));
  console.error(report.error);
  process.exitCode = 1;
} finally {
  await stopServer(server);
}