import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { listLexicalOrdinals, loadLexicalWordByOrdinal } from '../src/lib/lexical.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const evidencePath = path.join(repoRoot, 'content/lexical/acceptance/full-catalog-k-report.json');
const browserEvidencePath = path.join(repoRoot, 'content/lexical/acceptance/full-catalog-k-browser.json');
const wordsRoot = path.join(repoRoot, 'content/lexical/words/by-ordinal');
const BASE = 'http://127.0.0.1:4321';
const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
const checks = [];
const check = (ok, name, detail = '') => {
  checks.push({ ok: Boolean(ok), name, detail: String(detail || '') });
  if (!ok) throw new Error(`FULL_CATALOG_K_BROWSER_FAIL:${name}:${detail}`);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const rawOwner = (ordinal) => JSON.parse(fs.readFileSync(path.join(wordsRoot, `o${String(ordinal).padStart(4, '0')}.json`), 'utf8'));
const importantRelations = (card) => [
  ...(Array.isArray(card.semantic_neighbors) ? card.semantic_neighbors : []),
  ...(Array.isArray(card.confusables) ? card.confusables : [])
].filter((relation) => {
  if ((card.confusables || []).includes(relation)) return true;
  const priority = String(relation?.priority || relation?.tier || '').toUpperCase();
  return ['S', 'A'].includes(priority) || Number(relation?.learning_value_score || 0) >= 8.5;
});

const fixtures = {
  safe_simple: evidence.representatives.safe_simple,
  rich_polysemous: evidence.representatives.rich_polysemous,
  familiar_new: evidence.representatives.familiar_new,
  reference_only: evidence.representatives.reference_only
};

for (const ordinal of listLexicalOrdinals()) {
  const answer = loadLexicalWordByOrdinal(ordinal);
  const card = answer.record || {};
  const owner = rawOwner(ordinal);
  if (!fixtures.construction_heavy && (card.constructions || []).length >= 1) fixtures.construction_heavy = { ordinal, word_id: answer.objectId, word: card.word };
  if (!fixtures.relation_owned && importantRelations(card).length >= 1) fixtures.relation_owned = { ordinal, word_id: answer.objectId, word: card.word };
  if (!fixtures.register_sensitivity && (card.senses || []).some((sense) => sense?.register || sense?.writing_safe === false || sense?.sensitivity_note || sense?.stance)) fixtures.register_sensitivity = { ordinal, word_id: answer.objectId, word: card.word };
  if (!fixtures.same_owner_form && card.form_identity && ((card.form_identity.boundaries || []).length || (card.form_identity.variants || []).length || card.form_identity.boundary)) fixtures.same_owner_form = { ordinal, word_id: answer.objectId, word: card.word };
  if (!fixtures.reference_only && (owner.reference_senses || []).length >= 1) fixtures.reference_only = { ordinal, word_id: answer.objectId, word: card.word };
  if (fixtures.construction_heavy && fixtures.relation_owned && fixtures.register_sensitivity && fixtures.same_owner_form && fixtures.reference_only) break;
}

const byWord = new Map();
for (const ordinal of listLexicalOrdinals()) {
  const answer = loadLexicalWordByOrdinal(ordinal);
  byWord.set(String(answer.record?.word || ''), { ordinal, word_id: answer.objectId, word: answer.record?.word });
}
for (const pair of [['vigor', 'vigour'], ['practice', 'practise'], ['plow', 'plough']]) {
  if (byWord.has(pair[0]) && byWord.has(pair[1])) {
    fixtures.distinct_owner_spelling = [byWord.get(pair[0]), byWord.get(pair[1])];
    break;
  }
}

for (const key of ['safe_simple','rich_polysemous','familiar_new','construction_heavy','relation_owned','register_sensitivity','same_owner_form','reference_only','distinct_owner_spelling']) check(Boolean(fixtures[key]), 'fixture_present', key);

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4321'], {
  cwd: path.resolve(repoRoot, 'static-web'), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let serverLog = '';
server.stdout?.on('data', (chunk) => { serverLog += String(chunk); });
server.stderr?.on('data', (chunk) => { serverLog += String(chunk); });
async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try { const response = await fetch(`${BASE}/vocabulary/`); if (response.ok) return; } catch {}
    await sleep(120);
  }
  throw new Error(`FULL_CATALOG_K_PREVIEW_NOT_READY:${serverLog.slice(-2000)}`);
}

let browser;
const observed = {};
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const inspect = async (label, fixture) => {
    const answer = loadLexicalWordByOrdinal(fixture.ordinal);
    const card = answer.record || {};
    await page.goto(`${BASE}/vocabulary/${fixture.ordinal}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(80);
    const root = page.locator('[data-local-port="vocabulary"]');
    check((await root.getAttribute('data-vocab-object')) === answer.objectId, `${label}_object_identity`, `${fixture.ordinal}:${answer.objectId}`);
    check(Boolean(await root.getAttribute('data-vocab-source-hash')), `${label}_source_hash`);
    await page.locator('[data-vocab-reveal]').click();
    check(await page.locator('[data-vocab-details]').isVisible(), `${label}_reveal_visible`);
    check(await page.locator('[data-vocab-repair][data-target-kind="core"]').count() === 1, `${label}_core_target`);
    const bodyText = await page.locator('body').innerText();
    check(bodyText.includes(String(card.word || fixture.word || '')), `${label}_word_visible`);
    check(!bodyText.includes('undefined') && !bodyText.includes('[object Object]'), `${label}_no_raw_value_leak`);

    // Projection fidelity is identity-bearing, not a requirement that every raw
    // semantic gloss be copied verbatim into the learner UI. Core is the
    // compressed organizing layer; each active Sense must still survive as an
    // exact stable learner target.
    const activeSenseIds = (card.senses || []).map((sense) => String(sense?.sense_id || '')).filter(Boolean);
    const renderedSenseIds = await page.locator('[data-vocab-repair][data-target-kind="sense"]').evaluateAll((nodes) =>
      nodes.map((node) => String(node.getAttribute('data-target-id') || '')).filter(Boolean)
    );
    check(renderedSenseIds.length === activeSenseIds.length, `${label}_active_sense_target_count`, `${renderedSenseIds.length}|${activeSenseIds.length}`);
    for (const senseId of activeSenseIds) check(renderedSenseIds.includes(senseId), `${label}_active_sense_target_identity`, senseId);

    const coreText = String(card.core_concept?.core_meaning_cn || card.core_concept?.mental_model_cn || card.core_concept?.core_meaning_en || '').trim();
    if (coreText) check(bodyText.includes(coreText), `${label}_core_meaning_visible`, coreText);

    const targetKinds = await page.locator('[data-vocab-repair]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-target-kind')).filter(Boolean));
    observed[label] = { ordinal: fixture.ordinal, word: card.word, objectId: answer.objectId, targetKinds, activeSenseIds, renderedSenseIds };
    return { answer, card, bodyText, targetKinds, activeSenseIds, renderedSenseIds };
  };

  const safe = await inspect('safe_simple', fixtures.safe_simple);
  check(safe.targetKinds.filter((x) => x === 'sense').length >= 1, 'safe_simple_has_active_sense_target');

  const rich = await inspect('rich_polysemous', fixtures.rich_polysemous);
  check(rich.targetKinds.filter((x) => x === 'sense').length >= 3, 'rich_polysemous_multi_sense_targets', JSON.stringify(rich.targetKinds));

  const familiar = await inspect('familiar_new', fixtures.familiar_new);
  check(familiar.targetKinds.filter((x) => x === 'sense').length >= 2, 'familiar_new_multiple_sense_targets', JSON.stringify(familiar.targetKinds));

  const construction = await inspect('construction_heavy', fixtures.construction_heavy);
  check(construction.targetKinds.includes('construction'), 'construction_target_projected', JSON.stringify(construction.targetKinds));

  const relation = await inspect('relation_owned', fixtures.relation_owned);
  check(relation.targetKinds.includes('relation'), 'important_relation_target_projected', JSON.stringify(relation.targetKinds));

  const register = await inspect('register_sensitivity', fixtures.register_sensitivity);
  const registerSense = (register.card.senses || []).find((sense) => sense?.register || sense?.writing_safe === false || sense?.sensitivity_note || sense?.stance);
  const registerSemanticText = String(registerSense?.usage_note || registerSense?.definition_en || registerSense?.definition_cn || '').trim();
  if (registerSemanticText) check(register.bodyText.includes(registerSemanticText), 'register_semantic_content_visible', registerSemanticText);

  const form = await inspect('same_owner_form', fixtures.same_owner_form);
  check(form.targetKinds.includes('form_identity'), 'same_owner_form_target_projected', JSON.stringify(form.targetKinds));
  const formSurfaces = [
    ...(form.card.form_identity?.boundaries || []).map((row) => row?.surface),
    ...(form.card.form_identity?.variants || []).map((row) => row?.canonical_form || row?.surface || row?.spelling)
  ].filter(Boolean);
  for (const surface of formSurfaces) check(form.bodyText.includes(String(surface)), 'same_owner_form_surface_visible', `${fixtures.same_owner_form.ordinal}:${surface}`);

  const reference = await inspect('reference_only', fixtures.reference_only);
  const rawReference = rawOwner(fixtures.reference_only.ordinal).reference_senses || [];
  const activeDefinitions = new Set((reference.card.senses || []).flatMap((sense) => [sense?.definition_cn, sense?.definition_en]).filter(Boolean).map(String));
  const uniqueReferenceText = rawReference.flatMap((ref) => [ref?.definition_cn, ref?.definition_en]).filter((text) => text && !activeDefinitions.has(String(text))).map(String)[0];
  if (uniqueReferenceText) check(!reference.bodyText.includes(uniqueReferenceText), 'reference_only_not_crowding_study', uniqueReferenceText);

  const [leftFixture, rightFixture] = fixtures.distinct_owner_spelling;
  const left = await inspect('distinct_owner_left', leftFixture);
  const right = await inspect('distinct_owner_right', rightFixture);
  check(left.answer.objectId !== right.answer.objectId && left.answer.ordinal !== right.answer.ordinal, 'distinct_owner_identity_preserved', `${left.answer.objectId}|${right.answer.objectId}`);

  check(pageErrors.length === 0, 'no_browser_page_errors', JSON.stringify(pageErrors));
  const summary = {
    schema: 'kianos.lexical.full_catalog_k_browser.v1',
    issue: 56,
    status: 'PASS',
    fixtures,
    observed,
    checks,
    content_acceptance_delta: 0,
    persistent_real_learner_state_mutation: 0,
    claim: 'representative Current owners across full-catalog risk families render accepted Natural Owner truth through the actual vocabulary learner projection'
  };
  fs.writeFileSync(browserEvidencePath, JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
  await context.close();
} catch (error) {
  const failure = { schema: 'kianos.lexical.full_catalog_k_browser.v1', issue: 56, status: 'FAIL', error: String(error?.stack || error), fixtures, observed, checks, serverLog };
  fs.writeFileSync(browserEvidencePath, JSON.stringify(failure, null, 2) + '\n');
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
