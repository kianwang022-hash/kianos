import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4321';
const AUDIT = path.resolve(process.cwd(), '../lexical-ffv-audit');
fs.mkdirSync(AUDIT, { recursive: true });
const checks = [];
const check = (ok, name, detail = '') => {
  checks.push({ name, ok: Boolean(ok), detail: String(detail || '') });
  if (!ok) throw new Error(`LEXICAL_ENGLISH_BROWSER_FAIL:${name}:${detail}`);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4321'], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let serverLog = '';
server.stdout?.on('data', (chunk) => { serverLog += String(chunk); });
server.stderr?.on('data', (chunk) => { serverLog += String(chunk); });

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try { const response = await fetch(`${BASE}/vocabulary/`); if (response.ok) return; } catch {}
    await sleep(125);
  }
  throw new Error(`LEXICAL_ENGLISH_PREVIEW_NOT_READY:${serverLog.slice(-2000)}`);
}
const storage = async (page, key) => page.evaluate((k) => {
  try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; }
}, key);
const ledger = (page) => storage(page, 'kianos-lexical-evidence-ledger-v2');
const wordState = (page, objectId) => storage(page, `kianos-vocabulary-astro-v2:${objectId}`);
const repairCount = async (page, objectId) => Object.keys((await wordState(page, objectId))?.repairTargets || {}).length;
const sameTarget = (event, target) => Boolean(event && target)
  && event.target_kind === target.target_kind
  && (target.target_id
    ? event.target_id === target.target_id
    : event.target_locator === target.target_locator && event.target_revision === target.target_revision);
const goto = async (page, route) => {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(80);
};
const lexicalReturn = ({ objectId, problemId, target, threadId, outcome, evidence = {} }) => ({
  schema: 'kianos.english.objective_review_return.v1',
  task: 'cloze',
  objectId,
  threads: [{
    threadId,
    scope: 'local',
    itemIds: [problemId],
    route: 'lexical',
    summary: 'Isolated browser acceptance: exact lexical evidence resolved from the submitted Cloze problem.',
    repairCompleted: false,
    repairEvidence: 'Exact Current lexical target resolved in synthetic acceptance state.',
    lexicalEvidence: {
      word_id: target.word_id,
      ordinal: target.ordinal,
      word: target.word,
      target_kind: target.target_kind,
      target_id: target.target_id,
      target_locator: target.target_locator,
      target_revision: target.target_revision,
      target_label: target.word,
      outcome,
      ...evidence
    }
  }],
  newClaims: [],
  claimUpdates: []
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (error) => checks.push({ name: 'pageerror', ok: false, detail: error.message }));

  await goto(page, '/vocabulary/4/');
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-local-port="vocabulary"]');
  if (!(await page.locator('[data-vocab-details]').isVisible())) await page.locator('[data-vocab-reveal]').click();
  const plus = page.locator('[data-vocab-repair]').first();
  const objectId = await root.getAttribute('data-vocab-object');
  const targetId = await plus.getAttribute('data-target-id');
  const target = {
    word_id: objectId,
    ordinal: Number(await root.getAttribute('data-vocab-ordinal')),
    word: await root.getAttribute('data-vocab-word'),
    target_kind: await plus.getAttribute('data-target-kind'),
    target_id: targetId || null,
    target_locator: (await plus.getAttribute('data-target-locator')) || null,
    target_revision: targetId ? null : await root.getAttribute('data-vocab-source-hash')
  };
  check(Boolean(target.word_id && target.ordinal && target.target_kind && (target.target_id || (target.target_locator && target.target_revision))), 'exact_lexical_target_fixture', JSON.stringify(target));

  await goto(page, '/cloze/');
  const clozeHref = await page.locator('[data-objective-continue]').getAttribute('href');
  check(Boolean(clozeHref), 'cloze_current_fixture_available', clozeHref || '');
  await page.goto(new URL(clozeHref, BASE).toString(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(80);
  const objectiveRoot = page.locator('[data-objective-root]');
  const clozeObjectId = await objectiveRoot.getAttribute('data-objective-object');
  const attemptKey = await objectiveRoot.getAttribute('data-objective-storage-key');
  const problemId = await page.locator('[data-objective-question]').first().getAttribute('data-objective-question');
  check(Boolean(clozeObjectId && attemptKey && problemId), 'cloze_real_problem_fixture', `${clozeObjectId}|${problemId}`);

  await page.evaluate(({ key, objectId: currentObjectId, problemId: currentProblemId }) => {
    localStorage.setItem(key, JSON.stringify({
      schema: 'kianos.english.cloze_attempt.v1',
      objectId: currentObjectId,
      startedAt: '2099-02-01T07:55:00Z',
      submittedAt: '2099-02-01T08:00:00Z',
      submitted: true,
      answers: {},
      uncertain: [],
      trajectory: {},
      results: { [currentProblemId]: 'wrong' }
    }));
  }, { key: attemptKey, objectId: clozeObjectId, problemId });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(100);
  check(await page.locator('[data-transfer-toggle]').isVisible(), 'deep_review_import_visible_for_real_problem');

  const failureReturn = lexicalReturn({
    objectId: clozeObjectId,
    problemId,
    target,
    threadId: 'browser-cloze-lexical-failure',
    outcome: 'WRONG',
    evidence: { demand: 'discrimination', observed_at: '2099-02-01T08:00:00Z' }
  });
  await page.locator('[data-transfer-toggle]').click();
  await page.locator('[data-transfer-input]').fill(JSON.stringify(failureReturn));
  await page.locator('[data-transfer-apply]').click();
  await page.waitForTimeout(60);
  let currentLedger = await ledger(page);
  let failures = currentLedger?.events?.filter((event) => event.source === 'cloze' && event.outcome === 'WRONG' && sameTarget(event, target)) || [];
  check(failures.length === 1, 'cloze_exact_failure_enters_lexical_ledger', failures.length);
  check(await repairCount(page, objectId) === 1, 'cloze_failure_activates_exact_repair');

  await page.locator('[data-transfer-toggle]').click();
  await page.locator('[data-transfer-input]').fill(JSON.stringify(failureReturn));
  await page.locator('[data-transfer-apply]').click();
  await page.waitForTimeout(60);
  currentLedger = await ledger(page);
  failures = currentLedger?.events?.filter((event) => event.source === 'cloze' && event.outcome === 'WRONG' && sameTarget(event, target)) || [];
  check(failures.length === 1, 'cloze_cross_module_replay_idempotent', failures.length);

  await page.locator('[data-transfer-toggle]').click();
  const successReturn = lexicalReturn({
    objectId: clozeObjectId,
    problemId,
    target,
    threadId: 'browser-cloze-lexical-success',
    outcome: 'CORRECT',
    evidence: {
      demand: 'discrimination', assistance: 'unassisted', context_novelty: 'unseen', delayed: true,
      observed_at: '2099-02-05T08:00:00Z'
    }
  });
  await page.locator('[data-transfer-input]').fill(JSON.stringify(successReturn));
  await page.locator('[data-transfer-apply]').click();
  await page.waitForTimeout(60);
  check(await repairCount(page, objectId) === 0, 'qualified_cloze_success_dormants_exact_target');
  currentLedger = await ledger(page);
  check(currentLedger?.events?.some((event) => event.source === 'cloze' && event.outcome === 'CORRECT' && sameTarget(event, target)), 'qualified_cloze_success_recorded');

  await goto(page, '/vocabulary/');
  await page.locator('[data-lexical-tab="review"]').click();
  await page.waitForTimeout(40);
  check((await page.locator('[data-lexical-review-list]').innerText()).includes('没有 evidence-backed Repair'), 'cross_module_dormancy_updates_home');

  const summary = {
    status: 'PASS', checks,
    lexical_fixture: target,
    english_fixture: { task: 'cloze', objectId: clozeObjectId, problemId },
    content_acceptance_delta: 0,
    persistent_real_learner_state_mutation: 0,
    claim: 'isolated browser proof that an already-accepted English deep-review lexical thread can activate, replay-idempotently preserve, and later dormancy an exact Lexical Repair target'
  };
  fs.writeFileSync(path.join(AUDIT, 'english-handoff-journey.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary));
  await context.close();
} catch (error) {
  fs.writeFileSync(path.join(AUDIT, 'english-handoff-journey-failure.json'), JSON.stringify({ status: 'FAIL', error: String(error?.stack || error), checks, serverLog }, null, 2));
  throw error;
} finally {
  if (browser) await browser.close();
  if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch {} }
  else { try { server.kill('SIGTERM'); } catch {} }
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(800)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGKILL'); } catch {} }
    else { try { server.kill('SIGKILL'); } catch {} }
  }
}
