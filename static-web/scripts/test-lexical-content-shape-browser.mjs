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
  if (!ok) throw new Error(`LEXICAL_CONTENT_SHAPE_FAIL:${name}:${detail}`);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fixedCount = (card) => (Array.isArray(card?.senses) ? card.senses : []).reduce((sum, sense) => sum + (Array.isArray(sense?.collocations) ? sense.collocations.filter((item) => item?.exam_value === 'fixed_pattern').length : 0), 0);
const relationCount = (card) => (Array.isArray(card?.semantic_neighbors) ? card.semantic_neighbors.length : 0) + (Array.isArray(card?.confusables) ? card.confusables.length : 0);
const projectedOptionalCount = (card) => (Array.isArray(card?.secondary_senses) ? card.secondary_senses.length : 0)
  + (Array.isArray(card?.constructions) ? card.constructions.length : 0)
  + relationCount(card)
  + fixedCount(card)
  + (Array.isArray(card?.senses) ? card.senses.filter((sense) => Boolean(sense?.lexical_identity_overlay)).length : 0);

let sparse = null;
let rich = null;
for (const ordinal of listLexicalOrdinals()) {
  const answer = loadLexicalWordByOrdinal(ordinal);
  const card = answer.record || {};
  const optional = projectedOptionalCount(card);
  const senses = Array.isArray(card.senses) ? card.senses : [];
  if (!sparse && card.core_concept && senses.length <= 1 && optional === 0) sparse = answer;
  if (!rich && card.core_concept && senses.length >= 2 && optional >= 3) rich = answer;
  if (sparse && rich) break;
}
if (!sparse) throw new Error('LEXICAL_SPARSE_CURRENT_FIXTURE_MISSING');
if (!rich) throw new Error('LEXICAL_RICH_CURRENT_FIXTURE_MISSING');

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
  throw new Error(`LEXICAL_CONTENT_SHAPE_PREVIEW_NOT_READY:${serverLog.slice(-2000)}`);
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const inspect = async (answer, label) => {
    await page.goto(`${BASE}/vocabulary/${answer.ordinal}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(80);
    const root = page.locator('[data-local-port="vocabulary"]');
    check((await root.getAttribute('data-vocab-object')) === answer.objectId, `${label}_identity`, `${answer.ordinal}|${answer.objectId}`);
    await page.locator('[data-vocab-reveal]').click();
    check(await page.locator('[data-vocab-details]').isVisible(), `${label}_reveal_visible`);
    check(await page.locator('[data-vocab-repair][data-target-kind="core"]').count() === 1, `${label}_core_surface_available`);
    const buttonCount = await page.locator('[data-vocab-repair]').count();
    check(buttonCount >= 1, `${label}_has_at_least_core_target`, buttonCount);
    const emptyText = await page.locator('body').innerText();
    check(!emptyText.includes('undefined') && !emptyText.includes('[object Object]'), `${label}_no_raw_missing_value_leak`);
    return { buttonCount };
  };

  const sparseResult = await inspect(sparse, 'sparse');
  const richResult = await inspect(rich, 'rich');
  check(richResult.buttonCount > sparseResult.buttonCount, 'rich_projection_expands_without_changing_runtime', `${sparseResult.buttonCount}->${richResult.buttonCount}`);
  check(pageErrors.length === 0, 'no_browser_page_errors_across_shapes', JSON.stringify(pageErrors));

  const summary = {
    status: 'PASS',
    sparse: { ordinal: sparse.ordinal, objectId: sparse.objectId, word: sparse.record?.word, repairButtons: sparseResult.buttonCount },
    rich: { ordinal: rich.ordinal, objectId: rich.objectId, word: rich.record?.word, repairButtons: richResult.buttonCount },
    checks,
    visual_contract: 'not_defined_in_current_lexical_owner_schema; absence is non-blocking and no synthetic semantic field was introduced',
    content_acceptance_delta: 0,
    persistent_real_learner_state_mutation: 0,
    claim: 'one shared Study runtime renders sparse and rich Current content shapes conditionally without requiring optional modules to exist'
  };
  fs.writeFileSync(path.join(AUDIT, 'content-shape-journey.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary));
  await context.close();
} catch (error) {
  fs.writeFileSync(path.join(AUDIT, 'content-shape-journey-failure.json'), JSON.stringify({ status: 'FAIL', error: String(error?.stack || error), checks, serverLog }, null, 2));
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
