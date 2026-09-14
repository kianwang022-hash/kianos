import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { catalog } from './fixtures/politics-practice/catalog.mjs';
import { PRACTICE_KEYS as K } from '../src/lib/politicsPracticeClient.mjs';
import { publicPracticeCatalog, practiceReviewPayload } from '../src/lib/politicsPracticeView.mjs';

const root = process.cwd(), port = Number(process.env.PRACTICE_QA_PORT || 4339);
const completionOnly = process.env.PRACTICE_QA_ONLY === 'completion';
const base = `http://127.0.0.1:${port}`, out = path.resolve(root, completionOnly ? '../output/playwright/issue139-completion' : '../output/playwright/issue117');
fs.mkdirSync(out, { recursive: true });
const report = { scope: '#117 isolated synthetic runtime/browser SELF only', commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), viewport: { width: 1440, height: 900 }, currentAsset: 'BLOCKED_UPSTREAM_CURRENT_ASSET_RECONCILIATION', learnerU: 'NOT_TESTED', checks: [] };
const pass = (name) => { report.checks.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); };
execFileSync(path.join(root, 'node_modules/.bin/astro'), ['build', '--root', 'scripts/fixtures/politics-practice'], { cwd: root, stdio: 'pipe' });
const server = spawn(path.join(root, 'node_modules/.bin/astro'), ['preview', '--root', 'scripts/fixtures/politics-practice', '--host', '127.0.0.1', '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let serverLog = ''; server.stdout.on('data', (s) => { serverLog += s; }); server.stderr.on('data', (s) => { serverLog += s; });
let browser;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitFor(fn, message) { for (let i = 0; i < 100; i++) { if (await fn()) return; await sleep(60); } throw new Error(message); }
async function read(page, key) { return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), key); }
async function result(page) { await page.locator('[data-submitted-result]').waitFor({ state: 'visible' }); }
async function screenshot(page, name) { await page.screenshot({ path: path.join(out, `${name}.png`) }); }
async function clean(page) {
  const html = await page.locator('body').innerHTML();
  for (const token of ['TAKEAWAY_PROTECTED', 'EXPLANATION_PROTECTED', 'SOURCE_ONLY_AFTER_SUBMIT']) assert.ok(!html.includes(token), `clean DOM leak ${token}`);
  const tree = await page.locator('body').ariaSnapshot();
  assert.ok(!tree.includes('PROTECTED'));
  assert.equal(await page.locator('[data-submitted-result]').isVisible(), false);
  assert.equal(await page.locator('[data-submitted-result]').getAttribute('data-outcome'), null);
  assert.equal(await page.locator('[data-result-status]').textContent(), '');
}
async function pageFor(url = '/politics/practice/') {
  const ctx = await browser.newContext({ viewport: report.viewport });
  const page = await ctx.newPage(); page.on('dialog', (dialog) => dialog.accept());
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + url); await page.locator('[data-start-session]').waitFor();
  return { ctx, page, errors };
}
async function start(page, count = '5') {
  await page.selectOption('[data-filter-count]', count); await page.check('[data-learned-scope]');
  await page.click('[data-start-session]'); await page.locator('[data-question-card]').waitFor({ state: 'visible' });
}
async function answer(page, labels) { for (const l of labels) await page.click(`[data-option="${l}"]`); await page.click('[data-submit]'); await result(page); }
async function installFailure(page, key, finalSession = false) {
  await page.evaluate(({ key, finalSession }) => {
    window.__fail = { key, finalSession }; const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, value) {
      const f = window.__fail;
      if (f && k === f.key && (!f.finalSession || (JSON.parse(value).pending === null && Object.keys(JSON.parse(value).results || {}).length))) throw new DOMException('synthetic quota failure', 'QuotaExceededError');
      return original.call(this, k, value);
    };
  }, { key, finalSession });
}
try {
  for (let i = 0; i < 100; i++) { try { if ((await fetch(base + '/politics/practice/')).ok) break; } catch {} if (i === 99) throw new Error(serverLog); await sleep(150); }
  browser = await chromium.launch({ headless: !process.env.PRACTICE_QA_HEADED });
  if (!completionOnly) {
  const publicText = JSON.stringify(publicPracticeCatalog(catalog));
  assert.ok(!publicText.includes('PROTECTED')); assert.ok(!publicText.includes('SOURCE_ONLY'));
  const polluted = structuredClone(catalog); polluted.questions[0].xiao_reference = 'forbidden'; polluted.questions[0].originalExplanation = 'forbidden';
  assert.ok(!JSON.stringify(practiceReviewPayload(polluted, polluted.questions[0].id)).includes('forbidden'));
  pass('explicit clean/review serialization allowlists');
  {
    const { page, ctx, errors } = await pageFor();
    await page.click('[data-start-session]'); assert.equal(await read(page, K.session), null);
    assert.match(await page.locator('[data-practice-error]').innerText(), /原讲义/);
    await screenshot(page, 'setup');
    await start(page); await clean(page); await screenshot(page, 'clean-single');
    await page.click('[data-option="A"]'); await page.keyboard.press('2');
    await page.click('[data-uncertain]'); await page.click('[data-favorite]'); await page.click('[data-discussion]');
    let session = await read(page, K.session); assert.equal(session.draft.selected, 'B'); assert.equal(session.draft.trajectory.length, 2);
    await page.reload(); assert.equal(await page.locator('[data-option="B"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('[data-uncertain]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-question-card]').focus(); await page.keyboard.press('Enter'); await result(page);
    session = await read(page, K.session); const first = await read(page, K.attempts);
    assert.equal(session.results[session.ids[0]].outcome, 'UNCERTAIN'); assert.equal(session.results[session.ids[0]].answerChanges, 1);
    await page.fill('[data-note]', '独立合成备注：保留原题。');
    await page.reload(); await result(page); assert.equal(await page.inputValue('[data-note]'), '独立合成备注：保留原题。');
    assert.deepEqual(await read(page, K.attempts), first); assert.equal((await read(page, K.evidence)).length, 1);
    await page.click('[data-return-unit]'); await page.locator('[data-practice-exact-return]').waitFor({ state: 'visible' });
    await screenshot(page, 'exact-source-return'); await page.click('[data-practice-exact-return]'); await result(page);
    assert.equal((await read(page, K.session)).ids[0], session.ids[0]); assert.equal(await page.inputValue('[data-note]'), '独立合成备注：保留原题。');
    await page.click('[data-next-question]'); await page.reload(); await clean(page); assert.equal(await page.locator('[data-question-type]').innerText(), '多选');
    await page.click('[data-interaction-fast]'); await page.click('[data-option="A"]'); await page.click('[data-option="C"]'); await page.click('[data-option="C"]');
    assert.equal(await page.locator('[data-submitted-result]').isVisible(), false);
    await page.click('[data-option="C"]'); await page.locator('[data-option="C"]').press('Enter'); await result(page);
    assert.match(await page.locator('[data-result-delta]').innerText(), /漏选 B；多选 C/);
    await screenshot(page, 'submitted-multiple-wrong');
    await page.click('[data-cause="options"]'); await page.click('[data-next-question]');
    await page.click('[data-option="B"]');
    await waitFor(async () => (await read(page, K.session)).index === 3, 'fast stable did not advance');
    await page.click('[data-uncertain]'); await page.click('[data-option="B"]'); await result(page); await sleep(650);
    assert.equal((await read(page, K.session)).index, 3);
    await page.click('[data-next-question]'); await clean(page); await screenshot(page, 'long-clean');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.click('[data-option="A"]'); await result(page); await screenshot(page, 'long-result');
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); await screenshot(page, 'long-result-bottom');
    await page.setViewportSize({ width: 600, height: 900 }); await page.evaluate(() => scrollTo(0, 0)); await screenshot(page, 'narrow-result');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.setViewportSize(report.viewport); await page.click('[data-next-question]'); await page.locator('[data-session-complete]').waitFor({ state: 'visible' });
    assert.match(await page.locator('[data-complete-score]').innerText(), /3 \/ 5/); assert.match(await page.locator('[data-complete-causes]').innerText(), /选项没辨清 1/);
    await screenshot(page, 'complete'); assert.equal(Object.keys((await read(page, K.attempts)).units['fixture/ch01/NU1'].attempts).length, 5);
    assert.deepEqual(errors, []); pass('P-J1–8: normal/multiple/Fast/signals/draft/result refresh/exact source return/long/summary'); await ctx.close();
  }
  for (const key of [K.attempts, K.meta, K.evidence, K.session]) {
    const { page, ctx } = await pageFor(); await start(page); await page.click('[data-option="A"]');
    await installFailure(page, key, key === K.session); await page.click('[data-submit]');
    await page.locator('[data-retry-save]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-submitted-result]').isVisible(), false); assert.equal((await read(page, K.session)).index, 0);
    await screenshot(page, `failure-${key.split('-').slice(2, -1).join('-')}`);
    await page.reload(); await page.locator('[data-retry-save]').waitFor({ state: 'visible' }); await clean(page);
    await page.click('[data-retry-save]'); await result(page);
    assert.equal(Object.keys((await read(page, K.session)).results).length, 1); assert.equal((await read(page, K.evidence)).length, 1);
    const saved = await read(page, K.attempts); await page.reload(); await result(page); assert.deepEqual(await read(page, K.attempts), saved);
    pass(`idempotent partial-save recovery: ${key}`); await ctx.close();
  }
  {
    const { page, ctx } = await pageFor(); await start(page); await answer(page, 'A');
    await installFailure(page, K.meta); await page.fill('[data-note]', '未保存备注必须保留'); await sleep(450);
    await page.click('[data-next-question]'); await page.click('[data-next-question]');
    assert.equal((await read(page, K.session)).index, 0); assert.equal(await page.inputValue('[data-note]'), '未保存备注必须保留');
    await page.click('[data-return-unit]'); assert.ok(page.url().includes('/practice/'));
    await screenshot(page, 'note-save-failure'); await page.evaluate(() => { window.__fail = null; });
    await page.click('[data-next-question]'); assert.equal((await read(page, K.meta)).notes[catalog.questions[0].id], '未保存备注必须保留'); await clean(page);
    await page.click('[data-option="A"]'); await page.click('[data-exit-session]');
    assert.equal((await read(page, K.session)).status, 'paused'); await page.click('[data-resume-session]');
    assert.equal(await page.locator('[data-option="A"]').getAttribute('aria-pressed'), 'true');
    pass('note repeated failure blocks next/link; successful retry; pause/resume draft'); await ctx.close();
  }
  for (const kind of ['missing', 'unbound', 'stale', 'incomplete']) {
    const { page, ctx } = await pageFor(); await start(page);
    await page.route('**/practice-review/*.json', async (route) => {
      if (kind === 'missing') return route.fulfill({ status: 404, body: '{}' });
      const p = practiceReviewPayload(catalog, catalog.questions[0].id);
      if (kind === 'unbound') p.id = catalog.questions[1].id;
      if (kind === 'stale') p.revision = 'outdated';
      if (kind === 'incomplete') p.chatExplanation = '';
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(p) });
    });
    await page.click('[data-option="B"]'); await page.click('[data-submit]');
    await page.locator('[data-practice-error]').waitFor({ state: 'visible' }); assert.equal(await read(page, K.attempts), null); await clean(page);
    pass(`review fail closed: ${kind}`); await ctx.close();
  }
  {
    const { page, ctx } = await pageFor('/politics/practice/?unit=fixture%2Fch01%2FNU2');
    assert.equal(await page.inputValue('[data-filter-unit]'), 'fixture/ch01/NU2'); await start(page); assert.equal((await read(page, K.session)).ids[0], catalog.questions[5].id);
    const original = await read(page, K.session);
    await page.goto(base + '/politics/practice/?session=stale&question=wrong');
    await page.locator('[data-practice-error]').waitFor({ state: 'visible' }); const after = await read(page, K.session); assert.equal(after.id, original.id); assert.equal(after.index, original.index); assert.deepEqual(after.ids, original.ids); assert.deepEqual(after.results, original.results);
    assert.equal(await page.locator('[data-start-session]').isDisabled(), true);
    pass('unit deep link exact scope; stale target preserves session and refuses fallback'); await ctx.close();
  }
  {
    const { page, ctx } = await pageFor(); await start(page);
    const second = await ctx.newPage(); await second.goto(base + '/politics/practice/');
    await second.click('[data-option="A"]'); await page.click('[data-option="B"]');
    assert.equal((await read(page, K.session)).draft.selected, 'A'); assert.match(await page.locator('[data-practice-error]').innerText(), /其他页面/);
    pass('concurrent tab cannot overwrite newer draft'); await ctx.close();
  }
  {
    const { page, ctx } = await pageFor(); await page.selectOption('[data-filter-type]', 'multiple'); await start(page);
    await page.click('[data-option="A"]'); await page.click('[data-interaction-fast]');
    await page.dispatchEvent('[data-question-card]', 'keydown', { key: '2', isComposing: true }); assert.equal((await read(page, K.session)).draft.selected, 'A');
    await page.click('[data-option="B"]'); await page.locator('[data-option="B"]').press('Enter'); await result(page);
    await page.fill('[data-note]', '输入 1234 Enter'); await page.locator('[data-note]').press('Enter'); assert.equal((await read(page, K.session)).index, 0);
    await page.emulateMedia({ reducedMotion: 'reduce' }); assert.equal(await page.locator('[data-next-question]').evaluate((el) => getComputedStyle(el).transitionDuration), '0s');
    pass('IME/text input safety; mouse-select Enter submit; reduced motion'); await ctx.close();
  }
  {
    const { page, ctx } = await pageFor();
    const q = catalog.questions[0];
    const first = { schema: 'kianos.politics.attempt_snapshot.v1', units: { [q.unitKey]: { unit_key: q.unitKey, natural_unit_id: q.unitId, attempts: { [q.id]: { question_id: q.id, selected: 'A', correct_answer: 'B', outcome: 'WRONG', observed_at: 'synthetic-first-attempt' } } } } };
    await page.evaluate(({ K, q, first }) => {
      localStorage.setItem(K.attempts, JSON.stringify(first));
      localStorage.setItem(K.meta, JSON.stringify({ schema: 'kianos.politics.practice_meta.v1', favorites: { [q.id]: true }, discussion: { [q.id]: false }, latestOutcome: { [q.id]: 'WRONG' }, notes: {}, causes: {} }));
    }, { K, q, first });
    await page.reload(); await page.click('[data-mode-value="wrong"]'); assert.equal(await page.locator('[data-available-count]').innerText(), '1');
    await start(page); await answer(page, 'B'); await page.click('[data-result-discussion-toggle]'); await page.click('[data-result-discussion-toggle]'); assert.deepEqual(await read(page, K.attempts), first);
    await page.click('[data-next-question]'); await page.click('[data-start-another]');
    await page.click('[data-mode-value="wrong"]'); assert.equal(await page.locator('[data-available-count]').innerText(), '0');
    await page.click('[data-mode-value="favorite"]'); assert.equal(await page.locator('[data-available-count]').innerText(), '1');
    await start(page); assert.equal((await read(page, K.session)).ids[0], q.id);
    assert.equal(await page.locator('[data-discussion]').getAttribute('aria-pressed'), 'false');
    pass('wrong/favorite re-entry; correcting retry preserves immutable first attempt and signal distinction'); await ctx.close();
  }
  {
    const { page, ctx } = await pageFor(); await page.click('[data-mode-value="random"]'); await start(page, '10');
    const ids = (await read(page, K.session)).ids;
    assert.equal(new Set(ids).size, 8); assert.deepEqual([...ids].sort(), catalog.questions.map((q) => q.id).sort());
    pass('random range without duplicate/dropped question identities'); await ctx.close();
  }
  {
    const { page, ctx } = await pageFor(); await installFailure(page, K.session);
    await page.check('[data-learned-scope]'); await page.click('[data-start-session]');
    assert.equal(await read(page, K.session), null); assert.equal(await page.locator('[data-question-card]').isVisible(), false);
    await page.evaluate(() => { window.__fail = null; }); await start(page);
    await page.route('**/practice-review/*.json', (route) => { const p = practiceReviewPayload(catalog, catalog.questions[0].id); p.source = []; return route.fulfill({ contentType: 'application/json', body: JSON.stringify(p) }); });
    await answer(page, 'B'); assert.match(await page.locator('[data-review-sources]').innerText(), /没有已绑定/); await screenshot(page, 'correct-sparse-source');
    await installFailure(page, K.session); await page.click('[data-next-question]'); assert.equal((await read(page, K.session)).index, 0); assert.equal(await page.locator('[data-submitted-result]').isVisible(), true);
    await page.evaluate(() => { window.__fail = null; }); await page.click('[data-next-question]'); assert.equal((await read(page, K.session)).index, 1);
    pass('failed session start/Next never advances; sparse source honest fallback'); await ctx.close();
  }
  {
    const { page, ctx } = await pageFor();
    const old = { schema: 'kianos.politics.practice_session.v1', id: 'old-unreconstructable', status: 'active', ids: [catalog.questions[0].id], index: 0, correctCount: 1 };
    await page.evaluate(({ K, old }) => localStorage.setItem(K.session, JSON.stringify(old)), { K, old }); await page.reload();
    assert.match(await page.locator('[data-practice-error]').innerText(), /版本或内容已变化/); assert.deepEqual(await read(page, K.session), old);
    assert.equal(await page.locator('[data-start-session]').isDisabled(), true);
    pass('unsupported previous session retained and fail-closed, no invented attempt migration'); await ctx.close();
  }
  {
    const { page, ctx } = await pageFor('/politics/practice/?question=SYNTHETIC-M-2');
    await start(page);
    assert.equal((await read(page, K.session)).ids[0], 'SYNTHETIC-M-2');
    pass('question deep link starts exact known question without rewriting learner history'); await ctx.close();
  }
  }
  {
    const { page, ctx, errors } = await pageFor('/politics/practice/?unit=fixture/ch01/NU2');
    await page.selectOption('[data-filter-type]', 'single');
    await start(page);
    for (let i = 0; i < 2; i++) { await answer(page, 'B'); await page.click('[data-next-question]'); }
    await page.locator('[data-session-complete]').waitFor({ state: 'visible' });
    const completed = await read(page, K.session), first = await read(page, K.attempts);
    const exact = page.url();
    await page.reload(); await page.locator('[data-session-complete]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-practice-error]').isVisible(), false);
    assert.equal(await page.locator('[data-start-session]').isVisible(), false);
    assert.equal(await page.locator('.politicsMode').isVisible(), false);
    assert.deepEqual(await read(page, K.session), completed);
    assert.deepEqual(await read(page, K.attempts), first);
    await screenshot(page, 'completed-refresh');
    pass('completed exact URL refresh preserves summary and immutable attempts');
    await page.goto(exact.replace(/question=[^&]+/, 'question=STALE-COMPLETED-TARGET'));
    assert.match(await page.locator('[data-practice-error]').innerText(), /返回目标已过期/);
    assert.deepEqual(await read(page, K.session), completed);
    pass('completed session still rejects stale exact-question return');
    await page.goto(exact); await page.click('[data-start-another]');
    await page.selectOption('[data-filter-type]', 'single'); await start(page);
    const next = await read(page, K.session);
    assert.notEqual(next.id, completed.id); assert.equal(next.status, 'active');
    assert.deepEqual(await read(page, K.attempts), first);
    assert.deepEqual(errors, []);
    pass('start another after completed refresh keeps earlier first attempts'); await ctx.close();
  }
  report.status = 'PASS';
} catch (e) { report.status = 'FAIL'; report.error = e.stack; console.error(e); process.exitCode = 1; }
finally {
  fs.writeFileSync(path.join(out, 'journeys.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(out, 'fixture-server.log'), serverLog);
  await browser?.close(); server.kill('SIGTERM');
}
