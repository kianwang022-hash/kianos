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
  if (!ok) throw new Error(`LEXICAL_LEDGER_WORD_PROJECTION_FAIL:${name}:${detail}`);
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
    try { const response = await fetch(`${BASE}/vocabulary/4/`); if (response.ok) return; } catch {}
    await sleep(125);
  }
  throw new Error(`LEXICAL_LEDGER_WORD_PROJECTION_PREVIEW_NOT_READY:${serverLog.slice(-2000)}`);
}
const storage = async (page, key) => page.evaluate((k) => {
  try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; }
}, key);

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (error) => checks.push({ name: 'pageerror', ok: false, detail: error.message }));
  await page.goto(`${BASE}/vocabulary/4/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });

  const root = page.locator('[data-local-port="vocabulary"]');
  const objectId = await root.getAttribute('data-vocab-object');
  const word = await root.getAttribute('data-vocab-word');
  const sourceHash = await root.getAttribute('data-vocab-source-hash');
  const ordinal = Number(await root.getAttribute('data-vocab-ordinal'));
  check(Boolean(objectId && sourceHash && ordinal === 4), 'fixture_identity', `${objectId}|${word}|${ordinal}`);

  const activeEvent = {
    event_id: 'projection:cloze-wrong',
    word_id: objectId,
    ordinal,
    word,
    target_kind: 'core',
    target_id: null,
    target_locator: 'record.core_concept',
    target_revision: sourceHash,
    source: 'cloze',
    outcome: 'WRONG',
    attribution: 'lexical',
    demand: 'discrimination',
    observed_at: '2099-03-01T08:00:00Z'
  };
  await page.evaluate((event) => {
    localStorage.setItem('kianos-lexical-evidence-ledger-v2', JSON.stringify({ schema: 'kianos.lexical.evidence_ledger.v2', events: [event], conflicts: [] }));
  }, activeEvent);
  await page.reload({ waitUntil: 'domcontentloaded' });
  if (!(await page.locator('[data-vocab-details]').isVisible())) await page.locator('[data-vocab-reveal]').click();
  const coreButton = page.locator('[data-vocab-repair][data-target-kind="core"]');
  check((await coreButton.getAttribute('aria-pressed')) === 'true', 'ledger_active_projects_into_word_ui');
  let local = await storage(page, `kianos-vocabulary-astro-v2:${objectId}`);
  const activeRows = Object.values(local?.repairTargets || {});
  check(activeRows.length === 1 && activeRows[0]?.source === 'evidence_reducer', 'word_cache_is_projection_not_authority', JSON.stringify(activeRows));
  let ledger = await storage(page, 'kianos-lexical-evidence-ledger-v2');
  check(ledger?.events?.length === 1 && ledger.events[0]?.event_id === activeEvent.event_id, 'ledger_projection_does_not_fake_migration', JSON.stringify(ledger?.events || []));

  const clearEvent = {
    event_id: 'projection:manual-clear',
    word_id: objectId,
    ordinal,
    word,
    target_kind: 'core',
    target_id: null,
    target_locator: 'record.core_concept',
    target_revision: sourceHash,
    source: 'manual_clear',
    outcome: 'CLEAR',
    observed_at: '2099-03-02T08:00:00Z'
  };
  await page.evaluate((event) => {
    const ledger = JSON.parse(localStorage.getItem('kianos-lexical-evidence-ledger-v2'));
    ledger.events.push(event);
    localStorage.setItem('kianos-lexical-evidence-ledger-v2', JSON.stringify(ledger));
  }, clearEvent);
  await page.reload({ waitUntil: 'domcontentloaded' });
  if (!(await page.locator('[data-vocab-details]').isVisible())) await page.locator('[data-vocab-reveal]').click();
  check((await page.locator('[data-vocab-repair][data-target-kind="core"]').getAttribute('aria-pressed')) === 'false', 'ledger_dormant_projects_out_of_word_ui');
  local = await storage(page, `kianos-vocabulary-astro-v2:${objectId}`);
  check(Object.keys(local?.repairTargets || {}).length === 0, 'dormant_cache_projection_empty');
  ledger = await storage(page, 'kianos-lexical-evidence-ledger-v2');
  check(ledger?.events?.length === 2, 'ledger_history_preserved_without_projection_noise', JSON.stringify(ledger?.events || []));

  // A modern local + must become a ledger-backed projection before reload. Reloading must not
  // reinterpret that projection as a legacy cache target and manufacture a migration event.
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  if (!(await page.locator('[data-vocab-details]').isVisible())) await page.locator('[data-vocab-reveal]').click();
  const manualCoreButton = page.locator('[data-vocab-repair][data-target-kind="core"]');
  await manualCoreButton.click();
  await page.waitForTimeout(40);
  local = await storage(page, `kianos-vocabulary-astro-v2:${objectId}`);
  const manualRows = Object.values(local?.repairTargets || {});
  check(manualRows.length === 1 && manualRows[0]?.source === 'evidence_reducer', 'manual_plus_cache_immediately_becomes_projection', JSON.stringify(manualRows));
  ledger = await storage(page, 'kianos-lexical-evidence-ledger-v2');
  const admissionsBeforeReload = ledger?.events?.filter((event) => event.source === 'depth_plus' && event.outcome === 'ADDED' && event.target_kind === 'core') || [];
  check(admissionsBeforeReload.length === 1, 'manual_plus_one_ledger_admission_before_reload', JSON.stringify(admissionsBeforeReload));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(40);
  ledger = await storage(page, 'kianos-lexical-evidence-ledger-v2');
  const admissionsAfterReload = ledger?.events?.filter((event) => event.source === 'depth_plus' && event.outcome === 'ADDED' && event.target_kind === 'core') || [];
  check(admissionsAfterReload.length === 1, 'reload_does_not_duplicate_manual_plus_history', JSON.stringify(admissionsAfterReload));
  check(!(ledger?.events || []).some((event) => String(event.event_id || '').startsWith('migration:')), 'modern_projection_never_reclassified_as_legacy_migration');

  const summary = {
    status: 'PASS', fixture: { ordinal, objectId, word, sourceHash }, checks,
    content_acceptance_delta: 0,
    persistent_real_learner_state_mutation: 0,
    claim: 'word Study UI is a projection of the shared ledger; modern manual toggles remain ledger-backed across reload and legacy cache no longer owns Repair truth'
  };
  fs.writeFileSync(path.join(AUDIT, 'ledger-word-projection-journey.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary));
  await context.close();
} catch (error) {
  fs.writeFileSync(path.join(AUDIT, 'ledger-word-projection-journey-failure.json'), JSON.stringify({ status: 'FAIL', error: String(error?.stack || error), checks, serverLog }, null, 2));
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
