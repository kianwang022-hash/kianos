import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { listLexicalOrdinals, loadLexicalWordByOrdinal } from '../src/lib/lexical.mjs';

const BASE = 'http://127.0.0.1:4321';
const AUDIT = path.resolve(process.cwd(), '../lexical-ffv-audit');
fs.mkdirSync(AUDIT, { recursive: true });
const checks = [];
const check = (ok, name, detail = '') => {
  checks.push({ name, ok: Boolean(ok), detail: String(detail || '') });
  if (!ok) throw new Error(`LEXICAL_FORM_IDENTITY_BROWSER_FAIL:${name}:${detail}`);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sample = (() => {
  for (const ordinal of listLexicalOrdinals()) {
    const answer = loadLexicalWordByOrdinal(ordinal);
    const senses = Array.isArray(answer.record?.senses) ? answer.record.senses : [];
    const senseIndex = senses.findIndex((sense) => Boolean(sense?.lexical_identity_overlay));
    if (senseIndex >= 0) return { answer, senseIndex, overlay: senses[senseIndex].lexical_identity_overlay };
  }
  return null;
})();
if (!sample) throw new Error('LEXICAL_FORM_IDENTITY_FIXTURE_MISSING');

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4321'], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let serverLog = '';
server.stdout?.on('data', (chunk) => { serverLog += String(chunk); });
server.stderr?.on('data', (chunk) => { serverLog += String(chunk); });

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(`${BASE}/vocabulary/`);
      if (response.ok) return;
    } catch {}
    await sleep(125);
  }
  throw new Error(`LEXICAL_FORM_IDENTITY_PREVIEW_NOT_READY:${serverLog.slice(-2000)}`);
}
const storage = async (page, key) => page.evaluate((k) => {
  try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; }
}, key);
const goto = async (page, route) => {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(80);
};
const challengePacket = (target) => ({
  schema: 'kianos.lexical.challenge_packet.v1',
  study_day: '2099-01-01',
  generated_at: '2099-01-01T08:00:00Z',
  challenges: [{
    challenge_id: 'browser-form-identity-strong-success',
    word_id: target.word_id,
    ordinal: target.ordinal,
    word: target.word,
    target_kind: target.target_kind,
    target_id: target.target_id,
    target_locator: target.target_locator,
    target_revision: target.target_revision,
    source_evidence: 'real Current form/identity Repair target',
    evidence_quality: { assistance: 'unassisted', context_novelty: 'unseen', delayed: true },
    question_type: 'spatial_choice',
    stem: 'Choose the accepted form / identity distinction.',
    options: [{ key: 'left', text: 'incorrect distinction' }, { key: 'right', text: 'correct distinction' }],
    correct_key: 'right'
  }]
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (error) => checks.push({ name: 'pageerror', ok: false, detail: error.message }));

  const { answer, senseIndex } = sample;
  await goto(page, `/vocabulary/${answer.ordinal}/`);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-local-port="vocabulary"]');
  const objectId = await root.getAttribute('data-vocab-object');
  const word = await root.getAttribute('data-vocab-word');
  const sourceHash = await root.getAttribute('data-vocab-source-hash');
  check(objectId === answer.objectId && Boolean(sourceHash), 'fixture_identity', `${objectId}|${word}|${answer.ordinal}`);

  await page.locator('[data-vocab-reveal]').click();
  const button = page.locator('[data-vocab-repair][data-target-kind="form_identity"]').first();
  check(await button.count() > 0, 'form_identity_surface_present', `ordinal=${answer.ordinal}`);
  const targetLocator = await button.getAttribute('data-target-locator');
  check(targetLocator === `record.senses[${senseIndex}].lexical_identity_overlay`, 'form_identity_locator_exact', targetLocator || '');

  const target = {
    word_id: objectId,
    ordinal: answer.ordinal,
    word,
    target_kind: 'form_identity',
    target_id: (await button.getAttribute('data-target-id')) || null,
    target_locator: targetLocator,
    target_revision: sourceHash
  };
  await button.click();
  await page.waitForTimeout(40);

  const local = await storage(page, `kianos-vocabulary-astro-v2:${objectId}`);
  const repairRows = Object.values(local?.repairTargets || {});
  check(repairRows.length === 1 && repairRows[0]?.target_kind === 'form_identity', 'local_form_identity_active', JSON.stringify(repairRows));
  check(repairRows[0]?.target_revision === sourceHash, 'local_form_identity_revision_preserved', repairRows[0]?.target_revision || '');
  const ledger = await storage(page, 'kianos-lexical-evidence-ledger-v2');
  const admission = ledger?.events?.find((event) => event.source === 'depth_plus' && event.outcome === 'ADDED' && event.target_kind === 'form_identity');
  check(Boolean(admission), 'ledger_form_identity_admission');
  check(admission?.target_revision === sourceHash && admission?.target_locator === targetLocator, 'ledger_form_identity_exact_identity', JSON.stringify(admission || {}));

  await goto(page, '/vocabulary/');
  await page.locator('[data-lexical-tab="review"]').click();
  await page.waitForTimeout(40);
  const reviewText = await page.locator('[data-lexical-review-list]').innerText();
  check(reviewText.includes(word) && reviewText.includes('1 exact Repair target'), 'home_projects_form_identity_repair', reviewText);

  await page.locator('[data-lexical-tab="challenge"]').click();
  await page.locator('[data-challenge-packet-input]').fill(JSON.stringify(challengePacket(target)));
  await page.locator('[data-challenge-import]').click();
  await page.locator('[data-challenge-question-panel]').waitFor({ state: 'visible' });
  await page.locator('[data-challenge-choice="right"]').click();
  const feedback = await page.locator('[data-challenge-feedback]').innerText();
  check(feedback.includes('暂时退出 Repair'), 'qualified_form_identity_success_dormant', feedback);
  const after = await storage(page, `kianos-vocabulary-astro-v2:${objectId}`);
  check(Object.keys(after?.repairTargets || {}).length === 0, 'form_identity_cache_reconciled');

  await page.screenshot({ path: path.join(AUDIT, 'form-identity-final.png'), fullPage: true });
  const summary = {
    status: 'PASS',
    fixture: { ordinal: answer.ordinal, objectId, word, sourceHash, targetLocator },
    checks,
    content_acceptance_delta: 0,
    persistent_real_learner_state_mutation: 0,
    claim: 'real Current form/identity surface can enter exact Repair and retire only on qualifying evidence'
  };
  fs.writeFileSync(path.join(AUDIT, 'form-identity-journey.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary));
  await context.close();
} catch (error) {
  fs.writeFileSync(path.join(AUDIT, 'form-identity-journey-failure.json'), JSON.stringify({ status: 'FAIL', error: String(error?.stack || error), checks, serverLog }, null, 2));
  throw error;
} finally {
  if (browser) await browser.close();
  if (process.platform !== 'win32' && server.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  } else {
    try { server.kill('SIGTERM'); } catch {}
  }
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(800)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGKILL'); } catch {} }
    else { try { server.kill('SIGKILL'); } catch {} }
  }
}
