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
  if (!ok) throw new Error(`LEXICAL_IDENTITY_LINEAGE_BROWSER_FAIL:${name}:${detail}`);
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
    try { const response = await fetch(`${BASE}/vocabulary/7/`); if (response.ok) return; } catch {}
    await sleep(125);
  }
  throw new Error(`LEXICAL_IDENTITY_LINEAGE_PREVIEW_NOT_READY:${serverLog.slice(-2000)}`);
}
const storage = async (page, key) => page.evaluate((k) => {
  try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; }
}, key);
const goto = async (page, route) => {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(100);
};

const LEDGER_KEY = 'kianos-lexical-evidence-ledger-v2';
const WORD_KEY = 'kianos-vocabulary-astro-v2:word:abnormal';
const OLD_MERGED = 'sense:abnormal:3271d9f4317951c3';
const CURRENT = 'sense:abnormal:98807d28524a5607';
const DEPRECATED = 'sense:abnormal:eb663cac3ad15b02';

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (error) => checks.push({ name: 'pageerror', ok: false, detail: error.message }));

  await goto(page, '/vocabulary/7/');
  await page.evaluate(() => localStorage.clear());
  await page.evaluate(({ key, oldMerged, deprecated }) => {
    localStorage.setItem(key, JSON.stringify({
      schema: 'kianos.lexical.evidence_ledger.v2',
      events: [
        {
          event_id: 'browser-old-merged', word_id: 'word:abnormal', ordinal: 7, word: 'abnormal',
          target_kind: 'sense', target_id: oldMerged, target_locator: null, target_revision: null,
          source: 'depth_plus', outcome: 'ADDED', observed_at: '2026-09-01T08:00:00Z'
        },
        {
          event_id: 'browser-old-deprecated', word_id: 'word:abnormal', ordinal: 7, word: 'abnormal',
          target_kind: 'sense', target_id: deprecated, target_locator: null, target_revision: null,
          source: 'depth_plus', outcome: 'ADDED', observed_at: '2026-09-01T08:01:00Z'
        }
      ],
      conflicts: [],
      identity_lineage: {}
    }));
  }, { key: LEDGER_KEY, oldMerged: OLD_MERGED, deprecated: DEPRECATED });

  // Direct Word entry must reconcile Current identity before WordRuntime projects Repair.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(120);
  const root = page.locator('[data-local-port="vocabulary"]');
  check((await root.getAttribute('data-vocab-object')) === 'word:abnormal', 'real_current_word_loaded');

  const ledger = await storage(page, LEDGER_KEY);
  const mergedKey = `word:abnormal|sense|id:${OLD_MERGED}`;
  const deprecatedKey = `word:abnormal|sense|id:${DEPRECATED}`;
  check(ledger?.identity_lineage?.[mergedKey]?.resolution === 'REMAP', 'merged_lineage_registered', JSON.stringify(ledger?.identity_lineage?.[mergedKey] || {}));
  check(ledger?.identity_lineage?.[mergedKey]?.to_target_id === CURRENT, 'merged_successor_exact');
  check(ledger?.identity_lineage?.[deprecatedKey]?.resolution === 'FROZEN', 'deprecated_without_successor_frozen', JSON.stringify(ledger?.identity_lineage?.[deprecatedKey] || {}));
  check(ledger?.events?.find((event) => event.event_id === 'browser-old-merged')?.target_id === OLD_MERGED, 'historical_event_not_rewritten');
  check(ledger?.events?.find((event) => event.event_id === 'browser-old-deprecated')?.target_id === DEPRECATED, 'deprecated_history_retained');

  const state = await storage(page, WORD_KEY);
  const repairTargets = state?.repairTargets || {};
  check(Object.keys(repairTargets).length === 1, 'only_one_actionable_current_repair', JSON.stringify(repairTargets));
  check(Boolean(repairTargets[CURRENT]), 'old_merged_evidence_projects_to_current_successor', JSON.stringify(repairTargets));
  check(!repairTargets[OLD_MERGED] && !repairTargets[DEPRECATED], 'stale_targets_not_actionable');

  if (!(await page.locator('[data-vocab-details]').isVisible())) await page.locator('[data-vocab-reveal]').click();
  const currentButton = page.locator(`[data-vocab-repair][data-target-id="${CURRENT}"]`);
  check(await currentButton.count() === 1, 'current_successor_surface_exists');
  check((await currentButton.getAttribute('aria-pressed')) === 'true', 'current_successor_surface_restores_repair');
  check(await page.locator(`[data-vocab-repair][data-target-id="${OLD_MERGED}"]`).count() === 0, 'merged_old_surface_not_rendered');
  check(await page.locator(`[data-vocab-repair][data-target-id="${DEPRECATED}"]`).count() === 0, 'deprecated_surface_not_rendered');
  check((await page.locator('[data-vocab-repair-summary]').innerText()).includes('1 个具体分支'), 'word_summary_counts_current_only');

  // Home must project the same reconciled ledger: one Current target, no invisible deprecated debt.
  await goto(page, '/vocabulary/');
  await page.locator('[data-lexical-tab="review"]').click();
  await page.waitForTimeout(60);
  const repairText = await page.locator('[data-lexical-review-list]').innerText();
  check(repairText.includes('abnormal'), 'home_shows_reconciled_word');
  check(repairText.includes('1 exact Repair target'), 'home_counts_only_current_successor', repairText);

  // Clearing the Current successor must clear the folded historical claim without deleting history.
  await goto(page, '/vocabulary/7/');
  if (!(await page.locator('[data-vocab-details]').isVisible())) await page.locator('[data-vocab-reveal]').click();
  await page.locator(`[data-vocab-repair][data-target-id="${CURRENT}"]`).click();
  await page.waitForTimeout(60);
  const afterClearState = await storage(page, WORD_KEY);
  check(Object.keys(afterClearState?.repairTargets || {}).length === 0, 'clear_current_successor_removes_actionable_repair');
  const afterClearLedger = await storage(page, LEDGER_KEY);
  check(afterClearLedger?.events?.some((event) => event.target_id === CURRENT && event.source === 'manual_clear' && event.outcome === 'CLEAR'), 'clear_event_recorded_on_current_successor');
  check(afterClearLedger?.events?.some((event) => event.event_id === 'browser-old-merged' && event.target_id === OLD_MERGED), 'old_history_survives_clear');

  await goto(page, '/vocabulary/');
  await page.locator('[data-lexical-tab="review"]').click();
  await page.waitForTimeout(60);
  check((await page.locator('[data-lexical-review-list]').innerText()).includes('没有 evidence-backed Repair'), 'home_has_no_orphan_repair_after_clear');

  const summary = {
    status: 'PASS',
    fixture: 'abnormal@7',
    merged: `${OLD_MERGED} -> ${CURRENT}`,
    frozen: DEPRECATED,
    checks,
    historical_event_rewrites: 0,
    persistent_real_learner_state_mutation: 0,
    claim: 'Real browser proof: explicit Current merge lineage carries old evidence to the successor; deprecated/no-successor evidence freezes and never becomes invisible actionable debt.'
  };
  fs.writeFileSync(path.join(AUDIT, 'identity-lineage-journey.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary));
  await context.close();
} catch (error) {
  fs.writeFileSync(path.join(AUDIT, 'identity-lineage-journey-failure.json'), JSON.stringify({ status: 'FAIL', error: String(error?.stack || error), checks, serverLog }, null, 2));
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
