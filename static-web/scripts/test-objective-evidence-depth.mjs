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
import { loadReadingById as loadCurrentReadingById } from '../src/lib/englishReadingSourceTruth.mjs';
import { loadReadingBById as loadCurrentReadingBById } from '../src/lib/englishObjectiveSourceTruth.mjs';

const BASE = 'http://127.0.0.1:4321';
const auditDir = path.resolve(process.cwd(), '../objective-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = {
  schema: 'kianos.objective.evidence_depth_e2e.v1',
  gate: 'E',
  startedAt: new Date().toISOString(),
  checks: []
};

const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`OBJECTIVE_EVIDENCE_DEPTH_FAIL:${name}${detail ? `:${detail}` : ''}`);
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
  throw new Error('OBJECTIVE_EVIDENCE_PREVIEW_NOT_READY');
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

function returnText(payload) {
  return `KIANOS_OBJECTIVE_RETURN_V1\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``;
}

async function claimsFor(page, task) {
  return page.evaluate((targetTask) => {
    const value = JSON.parse(localStorage.getItem('kianos-english-objective-transfer-claims-v1') || '{"claims":[]}');
    return (value.claims || []).filter((claim) => claim?.task === targetTask);
  }, task);
}

async function declareSyntheticUnseen(page, objectId, sourceHashes) {
  const sourceHash = sourceHashes?.renderedObject;
  if (!sourceHash) throw new Error('SYNTHETIC_UNSEEN_SOURCE_MISSING:' + objectId);
  const semanticSourceHash = sourceHashes.semanticSource || sourceHash;
  await page.evaluate(({ id, sourceHash, semanticSourceHash }) => {
    const key = 'kianos-english-material-exposure-v1';
    const ledger = JSON.parse(localStorage.getItem(key) || '{"schema":"kianos.english.material-exposure.v1","materials":{}}');
    if (ledger?.materials?.[id]?.events?.length) throw new Error('SYNTHETIC_UNSEEN_ALREADY_EXPOSED:' + id);
    ledger.schema = 'kianos.english.material-exposure.v1';
    ledger.materials ||= {};
    ledger.materials[id] = {
      object_id: id,
      events: [],
      declaration: {
        state: 'unseen',
        source_hash: sourceHash,
        semantic_source_hash: semanticSourceHash,
        basis: 'learner_statement',
        observed_at: new Date().toISOString(),
        note: 'SYNTHETIC TEST testimony only; not Kian learner evidence.'
      }
    };
    localStorage.setItem(key, JSON.stringify(ledger));
  }, { id: objectId, sourceHash, semanticSourceHash });
}

async function openImporter(page) {
  const toggle = page.locator('[data-transfer-toggle]');
  await toggle.waitFor({ state: 'visible' });
  const box = page.locator('[data-transfer-import]');
  if (await box.isHidden()) await toggle.click();
  await page.locator('[data-transfer-input]').waitFor({ state: 'visible' });
}

async function importReturn(page, payload, { expectSuccess = true, expectHide = true } = {}) {
  await openImporter(page);
  await page.locator('[data-transfer-input]').fill(returnText(payload));
  await page.locator('[data-transfer-apply]').click();
  if (expectSuccess && expectHide) {
    await page.waitForFunction(() => document.querySelector('[data-transfer-import]')?.hasAttribute('hidden'));
  } else if (expectSuccess) {
    await page.waitForFunction(() => /已应用/.test(document.querySelector('[data-transfer-status]')?.textContent || ''));
  }
}

async function copyHandoff(page, selector) {
  await page.locator(selector).waitFor({ state: 'visible' });
  await page.locator(selector).click();
  return page.evaluate(() => navigator.clipboard.readText());
}

async function answerReadingA(page, reading, answers, { wrongIndices = [] } = {}) {
  const wrong = new Set(wrongIndices);
  for (let index = 0; index < reading.questions.length; index += 1) {
    const question = reading.questions[index];
    const id = qid(question, index);
    const formal = firstAnswer(answers.answers[id]);
    const selected = wrong.has(index) ? wrongLabel(question, formal) : formal;
    if (!selected) throw new Error(`READING_A_EVIDENCE_ANSWER_NOT_SELECTABLE:${id}`);
    await page.locator('[data-question]').nth(index).locator(`[data-option="${selected}"]`).click();
  }
  await page.locator('[data-reading-submit]').click();
  await page.locator('[data-reading-result]').waitFor({ state: 'visible' });
}

function readingBFormalMap(item, answers) {
  return item.questions.map((question, index) => firstAnswer(answers.answers[qid(question, index)]));
}

function isSwappable(item) {
  const formal = readingBFormalMap(item, loadReadingBAnswersById(item.objectId));
  return formal.length >= 2 && formal[0] && formal[1] && formal[0] !== formal[1];
}

async function answerReadingB(page, item, answers, { swapFirstPair = false } = {}) {
  const formal = readingBFormalMap(item, answers);
  if (swapFirstPair) check(isSwappable(item), `reading_b_${item.objectId}_swappable_pair`);
  for (let index = 0; index < item.questions.length; index += 1) {
    let selected = formal[index];
    if (swapFirstPair && index === 0) selected = formal[1];
    if (swapFirstPair && index === 1) selected = formal[0];
    if (!selected) throw new Error(`READING_B_EVIDENCE_ANSWER_NOT_SELECTABLE:${qid(item.questions[index], index)}`);
    await page.locator('[data-reading-b-select]').nth(index).selectOption(selected);
  }
  await page.locator('[data-objective-submit]').click();
  await page.locator('[data-objective-result-summary]').waitFor({ state: 'visible' });
}

async function readingAEvidence(browser) {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  try {
    const ids = listReadingSets().slice(0, 8).map((item) => item.id);
    check(ids.length >= 4, 'reading_a_has_distinct_evidence_objects');
    const [repairId, cleanCarryId, closeId, reopenId] = ids;

    const repair = loadReadingById(repairId);
    await page.goto(`${BASE}/reading/${encodeURIComponent(repairId)}/`, { waitUntil: 'domcontentloaded' });
    await answerReadingA(page, repair, loadReadingAnswersById(repairId), { wrongIndices: [0, 1] });
    const repairPacket = await copyHandoff(page, '[data-reading-passage-copy-chat]');
    check(repairPacket.includes('Reading A deep review packet v2'), 'reading_a_problem_opens_optional_deep_review');

    const firstId = qid(repair.questions[0], 0);
    const secondId = qid(repair.questions[1], 1);
    const repairAttempt = await page.evaluate((id) =>
      JSON.parse(localStorage.getItem(`kianos-reading-attempt-v1:${id}`) || 'null'), repairId);
    const repairIdentity = {
      attemptSubmittedAt: repairAttempt?.submittedAt,
      sourceHash: repairAttempt?.binding?.source_hash
    };
    check(Boolean(repairIdentity.attemptSubmittedAt && repairIdentity.sourceHash), 'reading_a_repair_attempt_identity_present');

    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_a', objectId: repairId,
      ...repairIdentity,
      threads: [{
        threadId: 'ra-diagnosis-only', scope: 'shared', itemIds: [firstId, secondId], route: 'reading_a',
        summary: 'diagnosed but not re-executed', repairCompleted: false, repairEvidence: ''
      }],
      newClaims: [{ sourceThreadId: 'ra-diagnosis-only', statement: 'diagnosis must not become durable debt' }],
      claimUpdates: []
    }, { expectSuccess: false });
    check((await claimsFor(page, 'reading_a')).length === 0, 'reading_a_diagnosis_only_creates_no_claim');

    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_a', objectId: repairId,
      ...repairIdentity,
      threads: [{
        threadId: 'ra-reading-owner', scope: 'shared', itemIds: [firstId, secondId], route: 'reading',
        summary: 'passage representation failure belongs to Reading', repairCompleted: true,
        repairEvidence: 'learner rebuilt the passage representation'
      }],
      newClaims: [{ sourceThreadId: 'ra-reading-owner', statement: 'must not duplicate Reading-owned debt' }],
      claimUpdates: []
    }, { expectSuccess: false });
    check((await claimsFor(page, 'reading_a')).length === 0, 'reading_a_reading_owner_creates_no_objective_claim');

    const completed = {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_a', objectId: repairId,
      ...repairIdentity,
      threads: [{
        threadId: 'ra-task-repair', scope: 'shared', itemIds: [firstId, secondId], route: 'reading_a',
        summary: 'two options shared one over-broad evidence-boundary failure', repairCompleted: true,
        repairEvidence: 'learner re-located the decisive span and re-adjudicated both options against the narrower boundary'
      }],
      newClaims: [{ sourceThreadId: 'ra-task-repair', statement: 'compare decisive evidence scope before accepting a broader paraphrase' }],
      claimUpdates: []
    };
    await importReturn(page, completed);
    let claims = await claimsFor(page, 'reading_a');
    check(claims.length === 1 && claims[0].status === 'TRANSFER_PENDING', 'reading_a_completed_shared_repair_creates_one_claim');
    const claimId = claims[0].claimId;

    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_a', objectId: repairId,
      ...repairIdentity,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'CLOSED', evidence: 'same passage correction' }]
    }, { expectSuccess: false });
    claims = await claimsFor(page, 'reading_a');
    check(claims[0]?.status === 'TRANSFER_PENDING', 'reading_a_same_object_cannot_close_claim');

    const cleanCarry = loadReadingById(cleanCarryId);
    await page.goto(`${BASE}/reading/${encodeURIComponent(cleanCarryId)}/`, { waitUntil: 'domcontentloaded' });
    await answerReadingA(page, cleanCarry, loadReadingAnswersById(cleanCarryId));
    check(await page.locator('[data-reading-passage-copy-chat]').isHidden(), 'reading_a_clean_carry_stays_silent');
    claims = await claimsFor(page, 'reading_a');
    check(claims[0]?.status === 'TRANSFER_PENDING', 'reading_a_clean_carry_does_not_auto_close_claim');

    const close = loadReadingById(closeId);
    await declareSyntheticUnseen(page, closeId, loadCurrentReadingById(closeId).sourceHashes);
    await page.goto(`${BASE}/reading/${encodeURIComponent(closeId)}/`, { waitUntil: 'domcontentloaded' });
    await answerReadingA(page, close, loadReadingAnswersById(closeId), { wrongIndices: [0] });
    const closeAttempt = await page.evaluate((id) =>
      JSON.parse(localStorage.getItem(`kianos-reading-attempt-v1:${id}`) || 'null'), closeId);
    const closeIdentity = { attemptSubmittedAt: closeAttempt?.submittedAt, sourceHash: closeAttempt?.binding?.source_hash };
    check(Boolean(closeIdentity.attemptSubmittedAt && closeIdentity.sourceHash), 'reading_a_close_attempt_identity_present');
    const closePacket = await copyHandoff(page, '[data-reading-passage-copy-chat]');
    check(closePacket.includes(claimId) && closePacket.includes('ACTIVE TRANSFER CLAIMS'), 'reading_a_fresh_problem_carries_pending_claim_opportunistically');
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_a', objectId: closeId,
      ...closeIdentity,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'CLOSED', evidence: '' }]
    }, { expectSuccess: false });
    claims = await claimsFor(page, 'reading_a');
    check(claims[0]?.status === 'TRANSFER_PENDING', 'reading_a_close_requires_explicit_fresh_evidence');
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_a', objectId: closeId,
      ...closeIdentity,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'CLOSED', evidence: 'fresh passage directly exercised the same scope-boundary adjudication and execution was stable' }]
    });
    claims = await claimsFor(page, 'reading_a');
    check(claims[0]?.status === 'CLOSED', 'reading_a_relevant_fresh_evidence_closes_claim');

    const reopen = loadReadingById(reopenId);
    await declareSyntheticUnseen(page, reopenId, loadCurrentReadingById(reopenId).sourceHashes);
    await page.goto(`${BASE}/reading/${encodeURIComponent(reopenId)}/`, { waitUntil: 'domcontentloaded' });
    await answerReadingA(page, reopen, loadReadingAnswersById(reopenId), { wrongIndices: [0] });
    const reopenAttempt = await page.evaluate((id) =>
      JSON.parse(localStorage.getItem(`kianos-reading-attempt-v1:${id}`) || 'null'), reopenId);
    const reopenIdentity = { attemptSubmittedAt: reopenAttempt?.submittedAt, sourceHash: reopenAttempt?.binding?.source_hash };
    check(Boolean(reopenIdentity.attemptSubmittedAt && reopenIdentity.sourceHash), 'reading_a_reopen_attempt_identity_present');
    const reopenPacket = await copyHandoff(page, '[data-reading-passage-copy-chat]');
    check(reopenPacket.includes(claimId) && reopenPacket.includes('RECENT CLOSED CLAIMS'), 'reading_a_fresh_problem_surfaces_reopen_candidate');
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_a', objectId: reopenId,
      ...reopenIdentity,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'REOPENED', evidence: '' }]
    }, { expectSuccess: false });
    claims = await claimsFor(page, 'reading_a');
    check(claims[0]?.status === 'CLOSED', 'reading_a_reopen_requires_contradictory_evidence');
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_a', objectId: reopenId,
      ...reopenIdentity,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'REOPENED', evidence: 'fresh passage reproduced the same over-broad scope acceptance under a new option contrast' }]
    });
    claims = await claimsFor(page, 'reading_a');
    check(claims[0]?.status === 'TRANSFER_PENDING', 'reading_a_contradictory_fresh_evidence_reopens_claim');
  } finally {
    await context.close();
  }
}

async function readingBEvidence(browser) {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  try {
    const items = listReadingBSets().map((entry) => loadReadingBById(entry.id));
    const swappable = items.filter((item) => isSwappable(item));
    check(swappable.length >= 4, 'reading_b_has_four_swappable_evidence_sets');
    const [repairItem, cleanCarryItem, closeItem, reopenItem] = swappable;

    await page.goto(`${BASE}/reading-b/${encodeURIComponent(repairItem.objectId)}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-objective-root]').waitFor({ state: 'visible' });
    await answerReadingB(page, repairItem, loadReadingBAnswersById(repairItem.objectId), { swapFirstPair: true });
    const repairPacket = await copyHandoff(page, '[data-objective-copy-chat]');
    check(repairPacket.includes('Reading B deep review packet v2'), 'reading_b_problem_opens_optional_deep_review');

    const firstId = qid(repairItem.questions[0], 0);
    const secondId = qid(repairItem.questions[1], 1);
    const repairAttempt = await page.evaluate((id) =>
      JSON.parse(localStorage.getItem(`kianos-reading-b-attempt-v1:${id}`) || 'null'), repairItem.objectId);
    const repairIdentity = {
      attemptSubmittedAt: repairAttempt?.submittedAt,
      sourceHash: repairAttempt?.binding?.source_hash
    };
    check(Boolean(repairIdentity.attemptSubmittedAt && repairIdentity.sourceHash), 'reading_b_repair_attempt_identity_present');

    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_b', objectId: repairItem.objectId,
      ...repairIdentity,
      threads: [{
        threadId: 'rb-diagnosis-only', scope: 'coupled', itemIds: [firstId, secondId], route: 'reading_b',
        summary: 'swap diagnosed but not repaired', repairCompleted: false, repairEvidence: ''
      }],
      newClaims: [{ sourceThreadId: 'rb-diagnosis-only', statement: 'diagnosis must not become durable debt' }],
      claimUpdates: []
    }, { expectSuccess: false });
    check((await claimsFor(page, 'reading_b')).length === 0, 'reading_b_diagnosis_only_creates_no_claim');

    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_b', objectId: repairItem.objectId,
      ...repairIdentity,
      threads: [{
        threadId: 'rb-reading-owner', scope: 'local', itemIds: [firstId], route: 'reading',
        summary: 'local discourse representation issue belongs to Reading', repairCompleted: true,
        repairEvidence: 'learner rebuilt the discourse relation'
      }],
      newClaims: [{ sourceThreadId: 'rb-reading-owner', statement: 'must not duplicate Reading-owned debt' }],
      claimUpdates: []
    }, { expectSuccess: false });
    check((await claimsFor(page, 'reading_b')).length === 0, 'reading_b_reading_owner_creates_no_objective_claim');

    const completed = {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_b', objectId: repairItem.objectId,
      ...repairIdentity,
      threads: [{
        threadId: 'rb-coupled-repair', scope: 'coupled', itemIds: [firstId, secondId], route: 'reading_b',
        summary: 'two placements were swapped because local fit was accepted before global reconciliation', repairCompleted: true,
        repairEvidence: 'learner rebuilt the coupled placement map and verified the remaining global candidate inventory'
      }],
      newClaims: [{ sourceThreadId: 'rb-coupled-repair', statement: 'verify the coupled/global map before committing a locally plausible placement' }],
      claimUpdates: []
    };
    await importReturn(page, completed);
    let claims = await claimsFor(page, 'reading_b');
    check(claims.length === 1 && claims[0].status === 'TRANSFER_PENDING', 'reading_b_completed_coupled_repair_creates_one_claim');
    const claimId = claims[0].claimId;

    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_b', objectId: repairItem.objectId,
      ...repairIdentity,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'CLOSED', evidence: 'same set correction' }]
    }, { expectSuccess: false });
    claims = await claimsFor(page, 'reading_b');
    check(claims[0]?.status === 'TRANSFER_PENDING', 'reading_b_same_object_cannot_close_claim');

    await page.goto(`${BASE}/reading-b/${encodeURIComponent(cleanCarryItem.objectId)}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-objective-root]').waitFor({ state: 'visible' });
    await answerReadingB(page, cleanCarryItem, loadReadingBAnswersById(cleanCarryItem.objectId));
    check(await page.locator('[data-objective-copy-chat]').isHidden(), 'reading_b_clean_carry_stays_silent');
    claims = await claimsFor(page, 'reading_b');
    check(claims[0]?.status === 'TRANSFER_PENDING', 'reading_b_clean_carry_does_not_auto_close_claim');

    await declareSyntheticUnseen(page, closeItem.objectId, loadCurrentReadingBById(closeItem.objectId).sourceHashes);
    await page.goto(`${BASE}/reading-b/${encodeURIComponent(closeItem.objectId)}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-objective-root]').waitFor({ state: 'visible' });
    await answerReadingB(page, closeItem, loadReadingBAnswersById(closeItem.objectId), { swapFirstPair: true });
    const closeAttempt = await page.evaluate((id) =>
      JSON.parse(localStorage.getItem(`kianos-reading-b-attempt-v1:${id}`) || 'null'), closeItem.objectId);
    const closeIdentity = { attemptSubmittedAt: closeAttempt?.submittedAt, sourceHash: closeAttempt?.binding?.source_hash };
    check(Boolean(closeIdentity.attemptSubmittedAt && closeIdentity.sourceHash), 'reading_b_close_attempt_identity_present');
    const closePacket = await copyHandoff(page, '[data-objective-copy-chat]');
    check(closePacket.includes(claimId) && closePacket.includes('ACTIVE TRANSFER CLAIMS'), 'reading_b_fresh_problem_carries_pending_claim_opportunistically');
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_b', objectId: closeItem.objectId,
      ...closeIdentity,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'CLOSED', evidence: '' }]
    }, { expectSuccess: false });
    claims = await claimsFor(page, 'reading_b');
    check(claims[0]?.status === 'TRANSFER_PENDING', 'reading_b_close_requires_explicit_fresh_evidence');
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_b', objectId: closeItem.objectId,
      ...closeIdentity,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'CLOSED', evidence: 'fresh set directly exercised the same global reconciliation procedure and execution was stable' }]
    });
    claims = await claimsFor(page, 'reading_b');
    check(claims[0]?.status === 'CLOSED', 'reading_b_relevant_fresh_evidence_closes_claim');

    await declareSyntheticUnseen(page, reopenItem.objectId, loadCurrentReadingBById(reopenItem.objectId).sourceHashes);
    await page.goto(`${BASE}/reading-b/${encodeURIComponent(reopenItem.objectId)}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-objective-root]').waitFor({ state: 'visible' });
    await answerReadingB(page, reopenItem, loadReadingBAnswersById(reopenItem.objectId), { swapFirstPair: true });
    const reopenAttempt = await page.evaluate((id) =>
      JSON.parse(localStorage.getItem(`kianos-reading-b-attempt-v1:${id}`) || 'null'), reopenItem.objectId);
    const reopenIdentity = { attemptSubmittedAt: reopenAttempt?.submittedAt, sourceHash: reopenAttempt?.binding?.source_hash };
    check(Boolean(reopenIdentity.attemptSubmittedAt && reopenIdentity.sourceHash), 'reading_b_reopen_attempt_identity_present');
    const reopenPacket = await copyHandoff(page, '[data-objective-copy-chat]');
    check(reopenPacket.includes(claimId) && reopenPacket.includes('RECENT CLOSED CLAIMS'), 'reading_b_fresh_problem_surfaces_reopen_candidate');
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_b', objectId: reopenItem.objectId,
      ...reopenIdentity,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'REOPENED', evidence: '' }]
    }, { expectSuccess: false });
    claims = await claimsFor(page, 'reading_b');
    check(claims[0]?.status === 'CLOSED', 'reading_b_reopen_requires_contradictory_evidence');
    await importReturn(page, {
      schema: 'kianos.english.objective_review_return.v1', task: 'reading_b', objectId: reopenItem.objectId,
      ...reopenIdentity,
      threads: [], newClaims: [], claimUpdates: [{ claimId, status: 'REOPENED', evidence: 'fresh set reproduced the same local-fit-before-global-reconciliation failure under a new map' }]
    });
    claims = await claimsFor(page, 'reading_b');
    check(claims[0]?.status === 'TRANSFER_PENDING', 'reading_b_contradictory_fresh_evidence_reopens_claim');
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
    await readingAEvidence(browser);
    await readingBEvidence(browser);
  } finally {
    await browser.close().catch(() => {});
  }
  report.finishedAt = new Date().toISOString();
  report.pass = true;
  fs.writeFileSync(path.join(auditDir, 'objective-evidence-depth.json'), JSON.stringify(report, null, 2));
  console.log(`OBJECTIVE_EVIDENCE_DEPTH_E2E_PASS ${report.checks.length} checks`);
} catch (error) {
  report.finishedAt = new Date().toISOString();
  report.pass = false;
  report.error = error instanceof Error ? error.stack || error.message : String(error);
  report.serverLog = serverLog.slice(-12000);
  fs.writeFileSync(path.join(auditDir, 'objective-evidence-depth.json'), JSON.stringify(report, null, 2));
  console.error(report.error);
  process.exitCode = 1;
} finally {
  await stopServer(server);
}
