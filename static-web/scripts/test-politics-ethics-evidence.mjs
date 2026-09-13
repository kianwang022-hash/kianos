import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4329;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '../politics-ethics-evidence-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = { schema: 'kianos.politics.ethics_evidence_journey.v1', started_at: new Date().toISOString(), checks: [] };
const check = (ok, name, detail = '') => {
  if (!ok) throw new Error(`POLITICS_ETHICS_EVIDENCE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try { if ((await fetch(`${BASE}/politics/`)).ok) return; } catch {}
    await sleep(250);
  }
  throw new Error('POLITICS_ETHICS_EVIDENCE_PREVIEW_SERVER_NOT_READY');
}
async function clearState(page) {
  await page.goto(`${BASE}/politics/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('kianos-politics-')).forEach((k) => localStorage.removeItem(k)));
}
async function configs(page) {
  return page.locator('[data-politics-unit-return-config]').evaluateAll((rows) => rows.map((row) => {
    try { return JSON.parse(row.getAttribute('data-config') || 'null'); } catch { return null; }
  }).filter(Boolean));
}
async function findConfig(page, maxQuestions = 6) {
  let fallback = null;
  for (let i = 0; i <= 6; i += 1) {
    const chapter = `ch${String(i).padStart(2, '0')}`;
    await page.goto(`${BASE}/politics/ethics_law/${chapter}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-politics-runtime][data-subject="ethics_law"]').waitFor({ state: 'visible' });
    for (const config of await configs(page)) {
      const count = config?.expected_question_ids?.length || 0;
      if (!count) continue;
      if (count <= maxQuestions) return { chapter, config };
      if (!fallback || count < fallback.config.expected_question_ids.length) fallback = { chapter, config };
    }
  }
  check(Boolean(fallback), 'ethics_e_config_exists');
  return fallback;
}
const cardFor = (page, qid) => page.locator(`[data-politics-question][data-question-id="${qid}"]`);
async function answer(page, qid, mode = 'correct') {
  const card = cardFor(page, qid); await card.waitFor({ state: 'visible' });
  const correct = String(await card.getAttribute('data-answer') || '');
  const labels = await card.locator('[data-politics-option]').evaluateAll((els) => els.map((el) => el.getAttribute('data-politics-option') || ''));
  let picks = [...correct]; let uncertain = mode === 'uncertain';
  if (mode === 'repair') {
    const wrong = labels.find((label) => !correct.includes(label));
    if (wrong) picks = [wrong]; else uncertain = true;
  }
  for (const label of picks) await card.locator(`[data-politics-option="${label}"]`).click();
  if (uncertain) await card.locator('[data-politics-uncertain]').click();
  await card.locator('[data-politics-submit]').click();
  await card.locator('[data-politics-result]').waitFor({ state: 'visible' });
  await page.waitForTimeout(100);
  return card;
}
async function firstAttempt(page, config, qid) {
  return page.evaluate(({ key, qid }) => {
    const store = JSON.parse(localStorage.getItem('kianos-politics-attempts-v1') || '{"units":{}}');
    return store?.units?.[key]?.attempts?.[qid] || null;
  }, { key: config.unit_key, qid });
}
const evidenceEvents = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('kianos-politics-evidence-v1') || '[]'));

async function cleanJourney(page) {
  await clearState(page);
  const { config } = await findConfig(page, 5);
  check(config.mastery_claim === 'NONE', 'ethics_e_config_no_mastery');
  const ids = config.expected_question_ids || [];
  for (let i = 0; i < ids.length; i += 1) {
    const card = await answer(page, ids[i], 'correct');
    check((await firstAttempt(page, config, ids[i]))?.outcome === 'STABLE', `ethics_e_clean_attempt_${i + 1}`);
    if (i < ids.length - 1) await card.locator('[data-politics-next]').click();
  }
  check((await evidenceEvents(page)).length === 0, 'ethics_e_clean_no_repair_debt');
  const returnId = `politics-unit-return-${String(config.natural_unit_id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const unitReturn = page.locator(`#${returnId}`); await unitReturn.waitFor({ state: 'visible' });
  check((await unitReturn.textContent())?.includes('不等于长期掌握'), 'ethics_e_clean_no_mastery_ui');
}

async function repairPacketJourney(page, context) {
  await clearState(page);
  const { chapter, config } = await findConfig(page, 6);
  const qid = config.expected_question_ids[0];
  const card = await answer(page, qid, 'repair');
  const attempt = await firstAttempt(page, config, qid);
  check(['WRONG', 'UNCERTAIN'].includes(attempt?.outcome), 'ethics_e_problem_first_attempt', JSON.stringify(attempt));
  const initialEvents = await evidenceEvents(page);
  check(initialEvents.length === 1, 'ethics_e_one_repair_event', JSON.stringify(initialEvents));
  const event = initialEvents[0] || {};
  check(event.subject === 'ethics_law' && event.chapter === chapter, 'ethics_e_event_subject_chapter', JSON.stringify(event));
  check(event.unit_id === config.runtime_unit_id && event.question_id === qid, 'ethics_e_event_unit_question', JSON.stringify(event));
  check(event.outcome === attempt.outcome && event.selected === attempt.selected && event.correct_answer === attempt.correct_answer, 'ethics_e_event_keeps_first_attempt_meaning', JSON.stringify(event));
  check(event.repair_source_anchor === config.source_anchor, 'ethics_e_event_repair_source_anchor', JSON.stringify(event));
  check(Array.isArray(event.repair_source_owner_ids) && event.repair_source_owner_ids.length > 0, 'ethics_e_event_stable_source_owner', JSON.stringify(event));

  const before = JSON.stringify(attempt);
  const repair = card.locator('[data-politics-repair]'); await repair.waitFor({ state: 'visible' });
  await repair.locator('a[href^="#source-"]').click();
  const source = page.locator(`#${config.source_anchor}`); await source.waitFor({ state: 'visible' });
  const returnLink = source.locator(`[data-politics-return-to-question="${qid}"]`); await returnLink.waitFor({ state: 'visible' });
  await returnLink.click(); await card.waitFor({ state: 'visible' });
  check(JSON.stringify(await firstAttempt(page, config, qid)) === before, 'ethics_e_repair_does_not_rewrite_first_attempt');
  check((await evidenceEvents(page))[0]?.outcome === attempt.outcome, 'ethics_e_repair_does_not_erase_debt');

  await page.goto(`${BASE}/politics/ethics_law/ch06/`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-politics-runtime][data-subject="ethics_law"]').waitFor({ state: 'visible' });
  await page.goto(`${BASE}/politics/`, { waitUntil: 'domcontentloaded' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  await page.locator('[data-politics-copy-handoff]').click();
  const packet = JSON.parse(await page.evaluate(async () => navigator.clipboard.readText()) || '{}');
  check(packet.schema === 'kianos.politics.return_packet.v1', 'ethics_e_packet_schema');
  check(packet.events?.length === 1, 'ethics_e_packet_one_debt', JSON.stringify(packet));
  const packetEvent = packet.events?.[0] || {};
  check(packetEvent.question_id === qid && packetEvent.outcome === attempt.outcome, 'ethics_e_packet_original_event', JSON.stringify(packetEvent));
  check(packetEvent.repair_source_anchor === config.source_anchor, 'ethics_e_packet_source_survives_later_navigation', JSON.stringify(packetEvent));
  check(JSON.stringify(packetEvent.repair_source_owner_ids || []) === JSON.stringify(event.repair_source_owner_ids || []), 'ethics_e_packet_source_owners_stable', JSON.stringify(packetEvent));
  check(packet.last_location?.chapter === 'ch06', 'ethics_e_last_location_independent_from_event', JSON.stringify(packet.last_location));
}

async function uncertainJourney(page) {
  await clearState(page);
  const { config } = await findConfig(page, 6);
  const qid = config.expected_question_ids[0];
  await answer(page, qid, 'uncertain');
  const attempt = await firstAttempt(page, config, qid);
  const events = await evidenceEvents(page);
  check(attempt?.outcome === 'UNCERTAIN', 'ethics_e_uncertain_distinct_attempt', JSON.stringify(attempt));
  check(events.length === 1 && events[0]?.outcome === 'UNCERTAIN', 'ethics_e_uncertain_distinct_debt', JSON.stringify(events));
}

async function persistenceFailure(page) {
  await clearState(page);
  const { config } = await findConfig(page, 6);
  const qid = config.expected_question_ids[0];
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function patched(key, value) {
      if (key === 'kianos-politics-attempts-v1') throw new DOMException('forced evidence persistence failure', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await answer(page, qid, 'correct');
  const warning = page.locator('[data-politics-attempt-persistence-error]'); await warning.waitFor({ state: 'visible' });
  check((await warning.textContent())?.includes('Unit Return 暂不推进'), 'ethics_e_persistence_visible_fail_closed');
  check((await firstAttempt(page, config, qid)) == null, 'ethics_e_persistence_no_fake_attempt');
  const returnId = `politics-unit-return-${String(config.natural_unit_id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  check(!(await page.locator(`#${returnId}`).isVisible()), 'ethics_e_persistence_no_fake_unit_return');
  const cursor = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-politics-last-location-v1') || 'null'));
  check(cursor?.action !== 'UNIT_RETURN', 'ethics_e_persistence_no_fake_unit_return_cursor', JSON.stringify(cursor));
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32' });
let browser;
try {
  await waitForServer(); browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(); const page = await context.newPage();
  await cleanJourney(page); await repairPacketJourney(page, context); await uncertainJourney(page); await persistenceFailure(page);
  await context.close(); report.finished_at = new Date().toISOString(); report.status = 'PASS';
  report.boundaries = { mastery_claim: 'NONE', user_validation: 'UNTESTED_NOT_INFERRED', later_transfer: 'NOT_EXECUTED_IN_FIRST_ROUND_E' };
  fs.writeFileSync(path.join(auditDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log('POLITICS_ETHICS_EVIDENCE_PASS'); console.log(JSON.stringify({ checks: report.checks.length }));
} catch (error) {
  report.finished_at = new Date().toISOString(); report.status = 'FAIL'; report.error = String(error?.stack || error);
  fs.writeFileSync(path.join(auditDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`); throw error;
} finally {
  if (browser) await browser.close();
  if (server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch { try { server.kill('SIGTERM'); } catch {} } }
}
