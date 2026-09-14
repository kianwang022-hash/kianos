// #148 Current uses native frames + #117 Workbench; retained code below audits the retired embedded consumer only.
import { runCurrentPoliticsFrame } from './politics-frame-test-entry.mjs';
await runCurrentPoliticsFrame({ subject: 'mao', formal: false });
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4326;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '../politics-mao-evidence-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = {
  schema: 'kianos.politics.mao_evidence_journey.v1',
  started_at: new Date().toISOString(),
  checks: []
};

const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`POLITICS_MAO_EVIDENCE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let index = 0; index < 80; index += 1) {
    try {
      const response = await fetch(`${BASE}/politics/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('POLITICS_MAO_EVIDENCE_PREVIEW_SERVER_NOT_READY');
}

async function clearPoliticsState(page) {
  await page.goto(`${BASE}/politics/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('kianos-politics-')) localStorage.removeItem(key);
    }
  });
}

async function configs(page) {
  return page.locator('[data-politics-unit-return-config]').evaluateAll((rows) => rows.map((row) => {
    try { return JSON.parse(row.getAttribute('data-config') || 'null'); } catch { return null; }
  }).filter(Boolean));
}

async function findMaoConfig(page, { minQuestions = 1, maxQuestions = 6 } = {}) {
  let fallback = null;
  for (let index = 0; index <= 8; index += 1) {
    const chapter = `ch${String(index).padStart(2, '0')}`;
    await page.goto(`${BASE}/politics/mao/${chapter}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-politics-runtime][data-subject="mao"]').waitFor({ state: 'visible' });
    const rows = await configs(page);
    for (const config of rows) {
      const count = (config?.expected_question_ids || []).length;
      if (count < minQuestions) continue;
      const candidate = { chapter, config };
      if (count <= maxQuestions) return candidate;
      if (!fallback || count < (fallback.config.expected_question_ids || []).length) fallback = candidate;
    }
  }
  check(Boolean(fallback), `mao_evidence_config_with_${minQuestions}_questions_exists`);
  return fallback;
}

async function cardFor(page, questionId) {
  return page.locator(`[data-politics-question][data-question-id="${questionId}"]`);
}

async function answerCard(page, questionId, mode = 'correct') {
  const card = await cardFor(page, questionId);
  await card.waitFor({ state: 'visible' });
  const answer = String(await card.getAttribute('data-answer') || '');
  const labels = await card.locator('[data-politics-option]').evaluateAll((buttons) => buttons.map((button) => button.getAttribute('data-politics-option') || ''));
  let selected = [...answer];
  if (mode === 'wrong') {
    const wrong = labels.find((label) => !answer.includes(label));
    selected = wrong ? [wrong] : selected;
  }
  for (const label of selected) await card.locator(`[data-politics-option="${label}"]`).click();
  if (mode === 'uncertain') await card.locator('[data-politics-uncertain]').click();
  await card.locator('[data-politics-submit]').click();
  await card.locator('[data-politics-result]').waitFor({ state: 'visible' });
  await page.waitForTimeout(100);
  return { card, answer };
}

async function firstAttempt(page, config, questionId) {
  return page.evaluate(({ unitKey, qid }) => {
    const store = JSON.parse(localStorage.getItem('kianos-politics-attempts-v1') || '{"units":{}}');
    return store?.units?.[unitKey]?.attempts?.[qid] || null;
  }, { unitKey: config.unit_key, qid: questionId });
}

async function evidenceEvents(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('kianos-politics-evidence-v1') || '[]'));
}

async function cleanEvidenceJourney(page) {
  await clearPoliticsState(page);
  const located = await findMaoConfig(page, { minQuestions: 1, maxQuestions: 5 });
  check(Boolean(located), 'mao_e_clean_config_found');
  const { chapter, config } = located;
  check(config.mastery_claim === 'NONE', 'mao_e_config_never_claims_mastery', String(config.mastery_claim || ''));
  check(['NATURAL_UNIT_SAFE_FALLBACK', 'CANONICAL_NODE_MAPPING'].includes(config.evidence_precision), 'mao_e_config_uses_bounded_precision', String(config.evidence_precision || ''));

  const ids = config.expected_question_ids || [];
  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];
    const { card } = await answerCard(page, id, 'correct');
    const attempt = await firstAttempt(page, config, id);
    check(attempt?.outcome === 'STABLE', `mao_e_clean_first_attempt_${index + 1}_stable`, chapter);
    if (index < ids.length - 1) await card.locator('[data-politics-next]').click();
  }

  const events = await evidenceEvents(page);
  check(Array.isArray(events) && events.length === 0, 'mao_e_clean_stable_creates_no_repair_debt', JSON.stringify(events));
  const returnId = `politics-unit-return-${String(config.natural_unit_id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const unitReturn = page.locator(`#${returnId}`);
  await unitReturn.waitFor({ state: 'visible' });
  check((await unitReturn.textContent())?.includes('不等于长期掌握'), 'mao_e_clean_ui_preserves_no_mastery');
}

async function wrongHandoffJourney(page, context) {
  await clearPoliticsState(page);
  const located = await findMaoConfig(page, { minQuestions: 1, maxQuestions: 6 });
  check(Boolean(located), 'mao_e_wrong_config_found');
  const { chapter, config } = located;
  const questionId = config.expected_question_ids[0];
  const { card } = await answerCard(page, questionId, 'wrong');

  const attempt = await firstAttempt(page, config, questionId);
  check(attempt?.outcome === 'WRONG', 'mao_e_wrong_first_attempt_recorded', JSON.stringify(attempt));
  const events = await evidenceEvents(page);
  check(events.length === 1, 'mao_e_wrong_creates_one_repair_event', JSON.stringify(events));
  const event = events[0] || {};
  check(event.subject === 'mao' && event.chapter === chapter, 'mao_e_event_keeps_subject_chapter', JSON.stringify(event));
  check(event.unit_id === config.runtime_unit_id && event.question_id === questionId, 'mao_e_event_keeps_unit_question_identity', JSON.stringify(event));
  check(event.outcome === 'WRONG' && event.selected === attempt.selected && event.correct_answer === attempt.correct_answer, 'mao_e_event_keeps_first_attempt_meaning', JSON.stringify(event));
  check(event.source === 'xiao1000', 'mao_e_event_keeps_question_source', JSON.stringify(event));
  check(event.repair_source_anchor === config.source_anchor, 'mao_e_event_keeps_repair_source_anchor', JSON.stringify(event));
  check(Array.isArray(event.repair_source_owner_ids) && event.repair_source_owner_ids.length > 0, 'mao_e_event_keeps_stable_repair_source_owner', JSON.stringify(event));

  const beforeRepair = JSON.stringify(attempt);
  const repair = card.locator('[data-politics-repair]');
  await repair.waitFor({ state: 'visible' });
  await repair.locator('a[href^="#source-"]').click();
  const source = page.locator(`#${config.source_anchor}`);
  await source.waitFor({ state: 'visible' });
  const returnLink = source.locator(`[data-politics-return-to-question="${questionId}"]`);
  await returnLink.waitFor({ state: 'visible' });
  await returnLink.click();
  await card.waitFor({ state: 'visible' });
  check(JSON.stringify(await firstAttempt(page, config, questionId)) === beforeRepair, 'mao_e_repair_does_not_rewrite_first_attempt');
  check((await evidenceEvents(page))[0]?.outcome === 'WRONG', 'mao_e_repair_does_not_erase_wrong_debt');

  await page.goto(`${BASE}/politics/mao/ch08/`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-politics-runtime][data-subject="mao"]').waitFor({ state: 'visible' });
  await page.goto(`${BASE}/politics/`, { waitUntil: 'domcontentloaded' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  await page.locator('[data-politics-copy-handoff]').click();
  const packetText = await page.evaluate(async () => navigator.clipboard.readText());
  const packet = JSON.parse(packetText || '{}');
  check(packet.schema === 'kianos.politics.return_packet.v1', 'mao_e_return_packet_schema');
  check(Array.isArray(packet.events) && packet.events.length === 1, 'mao_e_return_packet_carries_only_meaningful_debt', JSON.stringify(packet));
  const packetEvent = packet.events[0] || {};
  check(packetEvent.question_id === questionId && packetEvent.outcome === 'WRONG', 'mao_e_packet_preserves_original_wrong_event', JSON.stringify(packetEvent));
  check(packetEvent.repair_source_anchor === config.source_anchor, 'mao_e_packet_source_attribution_survives_later_navigation', JSON.stringify(packetEvent));
  check(JSON.stringify(packetEvent.repair_source_owner_ids || []) === JSON.stringify(event.repair_source_owner_ids || []), 'mao_e_packet_preserves_stable_source_owner_ids', JSON.stringify(packetEvent));
  check(packet.last_location?.chapter === 'ch08', 'mao_e_packet_last_location_is_independent_from_event_provenance', JSON.stringify(packet.last_location));
}

async function uncertainJourney(page) {
  await clearPoliticsState(page);
  const located = await findMaoConfig(page, { minQuestions: 1, maxQuestions: 6 });
  check(Boolean(located), 'mao_e_uncertain_config_found');
  const { config } = located;
  const questionId = config.expected_question_ids[0];
  await answerCard(page, questionId, 'uncertain');
  const attempt = await firstAttempt(page, config, questionId);
  const events = await evidenceEvents(page);
  check(attempt?.outcome === 'UNCERTAIN', 'mao_e_uncertain_first_attempt_distinct', JSON.stringify(attempt));
  check(events.length === 1 && events[0]?.outcome === 'UNCERTAIN', 'mao_e_uncertain_debt_distinct_from_wrong', JSON.stringify(events));
  check(events[0]?.selected === events[0]?.correct_answer, 'mao_e_uncertain_can_preserve_correct_but_unstable_attempt', JSON.stringify(events[0]));
}

async function persistenceFailureJourney(page) {
  await clearPoliticsState(page);
  const located = await findMaoConfig(page, { minQuestions: 1, maxQuestions: 6 });
  check(Boolean(located), 'mao_e_persistence_config_found');
  const { config } = located;
  const questionId = config.expected_question_ids[0];

  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    window.__kianosOriginalSetItem = original;
    Storage.prototype.setItem = function patchedSetItem(key, value) {
      if (key === 'kianos-politics-attempts-v1') throw new DOMException('forced evidence persistence failure', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });

  await answerCard(page, questionId, 'correct');
  const warning = page.locator('[data-politics-attempt-persistence-error]');
  await warning.waitFor({ state: 'visible' });
  check((await warning.textContent())?.includes('Unit Return 暂不推进'), 'mao_e_persistence_failure_is_visible_and_fail_closed');
  check((await firstAttempt(page, config, questionId)) == null, 'mao_e_failed_persistence_does_not_manufacture_first_attempt');
  const returnId = `politics-unit-return-${String(config.natural_unit_id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const unitReturn = page.locator(`#${returnId}`);
  check(!(await unitReturn.isVisible()), 'mao_e_failed_persistence_cannot_close_unit');
  const cursor = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-politics-last-location-v1') || 'null'));
  check(cursor?.action !== 'UNIT_RETURN', 'mao_e_failed_persistence_cannot_advance_cursor_to_unit_return', JSON.stringify(cursor));
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
  const context = await browser.newContext();
  const page = await context.newPage();

  await cleanEvidenceJourney(page);
  await wrongHandoffJourney(page, context);
  await uncertainJourney(page);
  await persistenceFailureJourney(page);

  await context.close();
  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.boundaries = {
    mastery_claim: 'NONE',
    user_validation: 'UNTESTED_NOT_INFERRED',
    later_transfer: 'NOT_EXECUTED_IN_FIRST_ROUND_E; future transfer must append/challenge rather than overwrite first-attempt truth'
  };
  fs.writeFileSync(path.join(auditDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log('POLITICS_MAO_EVIDENCE_PASS');
  console.log(JSON.stringify({ checks: report.checks.length }));
} catch (error) {
  report.finished_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.writeFileSync(path.join(auditDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  throw error;
} finally {
  if (browser) await browser.close();
  if (server.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); }
    catch { try { server.kill('SIGTERM'); } catch {} }
  }
}
