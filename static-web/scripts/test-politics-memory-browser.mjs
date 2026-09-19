// Synthetic browser proof for the hidden Politics Memory prototype.
// This creates no learner U and never writes public learner state.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { buildPoliticsMemoryCandidateCatalogCurrent } from '../src/lib/politicsMemoryCandidates.mjs';
import {
  POLITICS_MEMORY_PLAN_SCHEMA,
  POLITICS_MEMORY_PLAN_KEY,
  POLITICS_MEMORY_EVIDENCE_KEY
} from '../src/lib/politicsMemoryRuntime.mjs';

const out = path.resolve(process.env.POLITICS_MEMORY_EVIDENCE || '../qa/politics-memory-prototype');
fs.mkdirSync(out, { recursive: true });

const site = path.resolve('dist');
const catalog = buildPoliticsMemoryCandidateCatalogCurrent();
assert.ok(catalog.candidates.length >= 2, 'real Current Politics must expose at least two reviewed memory candidates for browser proof');

const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  try {
    let name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (name.endsWith('/')) name += 'index.html';
    const file = path.resolve(site, '.' + name);
    if (!file.startsWith(site + path.sep) || !fs.statSync(file).isFile()) throw new Error('missing');
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ headless: true });
const results = [];
const shot = (page, name) => page.screenshot({ path: path.join(out, name + '.png'), fullPage: true });
const today = '2026-09-20';
const now = '2026-09-20T02:45:00.000+08:00';

async function check(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, status: 'PASS', detail });
  } catch (error) {
    results.push({ name, status: 'FAIL', error: String(error?.stack || error) });
  }
  console.log(JSON.stringify(results.at(-1)));
}

async function contextWith(plan = null, evidence = null) {
  const context = await browser.newContext({
    viewport: { width: 1512, height: 982 },
    timezoneId: 'Asia/Shanghai'
  });
  await context.addInitScript(({ plan, evidence, planKey, evidenceKey }) => {
    if (plan) localStorage.setItem(planKey, JSON.stringify(plan));
    if (evidence) localStorage.setItem(evidenceKey, JSON.stringify(evidence));
  }, {
    plan,
    evidence,
    planKey: POLITICS_MEMORY_PLAN_KEY,
    evidenceKey: POLITICS_MEMORY_EVIDENCE_KEY
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  return { context, page };
}

const chosen = catalog.candidates.slice(0, 2);
const plan = {
  schema: POLITICS_MEMORY_PLAN_SCHEMA,
  plan_id: 'synthetic-browser-plan-1',
  study_day: today,
  generated_at: now,
  catalog_revision: catalog.revision,
  phase: 'FIRST_ROUND',
  supersedes_plan_id: null,
  items: chosen.map((candidate, index) => ({
    candidate_id: candidate.id,
    reason: index === 0 ? 'synthetic first memory target' : 'synthetic second memory target'
  }))
};

await check('no-plan-is-quiet-and-card-hidden', async () => {
  const { context, page } = await contextWith();
  try {
    await page.goto(base + '/politics/memory/');
    await page.locator('[data-memory-empty]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-memory-card]').isVisible(), false);
    assert.equal(await page.locator('[data-memory-answer]').isVisible(), false);
    await shot(page, '00-empty');
    return { empty: true };
  } finally {
    await context.close();
  }
});


await check('explicit-zero-item-plan-means-no-memory-work', async () => {
  const zeroPlan = {
    ...plan,
    plan_id: 'synthetic-zero-plan',
    items: []
  };
  const { context, page } = await contextWith(zeroPlan);
  try {
    await page.goto(base + '/politics/memory/');
    await page.locator('[data-memory-empty]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-memory-card]').isVisible(), false);
    assert.equal(await page.locator('[data-memory-complete]').isVisible(), false);
    const evidence = JSON.parse(await page.evaluate((key) => localStorage.getItem(key) || '[]', POLITICS_MEMORY_EVIDENCE_KEY));
    assert.equal(evidence.length, 0);
    await shot(page, '00b-zero-plan');
    return { planned_count: 0 };
  } finally {
    await context.close();
  }
});

await check('active-plan-hides-answer-until-reveal', async () => {
  const { context, page } = await contextWith(plan);
  try {
    await page.goto(base + '/politics/memory/');
    await page.locator('[data-memory-card]').waitFor({ state: 'visible' });
    assert.equal((await page.locator('[data-memory-progress]').textContent()).trim(), '1 / 2');
    assert.equal((await page.locator('[data-memory-prompt]').textContent()).trim(), chosen[0].prompt);
    assert.equal(await page.locator('[data-memory-answer]').isVisible(), false);

    const bodyBefore = await page.locator('body').innerText();
    for (const answer of chosen[0].answer_items) assert.ok(!bodyBefore.includes(answer), 'answer must not be learner-visible before reveal');

    await page.keyboard.press('Enter');
    await page.locator('[data-memory-answer]').waitFor({ state: 'visible' });
    const bodyAfter = await page.locator('[data-memory-answer]').innerText();
    for (const answer of chosen[0].answer_items) assert.ok(bodyAfter.includes(answer));
    assert.equal(JSON.parse(await page.evaluate((key) => localStorage.getItem(key) || '[]', POLITICS_MEMORY_EVIDENCE_KEY)).length, 0, 'reveal alone must create no evidence');
    await shot(page, '01-revealed');
    return { candidate: chosen[0].id };
  } finally {
    await context.close();
  }
});

await check('keyboard-response-records-one-event-and-refresh-resumes-next', async () => {
  const { context, page } = await contextWith(plan);
  try {
    await page.goto(base + '/politics/memory/');
    await page.keyboard.press('Space');
    await page.keyboard.press('2');

    let events = JSON.parse(await page.evaluate((key) => localStorage.getItem(key) || '[]', POLITICS_MEMORY_EVIDENCE_KEY));
    assert.equal(events.length, 1);
    assert.equal(events[0].candidate_id, chosen[0].id);
    assert.equal(events[0].response, 'FUZZY');
    assert.equal(events[0].candidate_snapshot.id, chosen[0].id);
    assert.deepEqual(events[0].candidate_snapshot.source_refs, chosen[0].source_refs);
    assert.deepEqual(events[0].candidate_snapshot.answer_items, chosen[0].answer_items);

    assert.equal((await page.locator('[data-memory-progress]').textContent()).trim(), '2 / 2');
    assert.equal((await page.locator('[data-memory-prompt]').textContent()).trim(), chosen[1].prompt);

    await page.reload();
    await page.locator('[data-memory-card]').waitFor({ state: 'visible' });
    assert.equal((await page.locator('[data-memory-progress]').textContent()).trim(), '2 / 2');
    assert.equal((await page.locator('[data-memory-prompt]').textContent()).trim(), chosen[1].prompt);
    events = JSON.parse(await page.evaluate((key) => localStorage.getItem(key) || '[]', POLITICS_MEMORY_EVIDENCE_KEY));
    assert.equal(events.length, 1);
    await shot(page, '02-resume-second');
    return { first_response: events[0].response };
  } finally {
    await context.close();
  }
});

await check('second-response-completes-without-auto-extra-round', async () => {
  const firstEvent = {
    schema: 'kianos.politics.memory-recall-event.v1',
    event_id: plan.plan_id + ':' + chosen[0].id,
    plan_id: plan.plan_id,
    study_day: today,
    candidate_id: chosen[0].id,
    catalog_revision: catalog.revision,
    candidate_snapshot: {
      id: chosen[0].id,
      subject: chosen[0].subject,
      chapter_id: chosen[0].chapter_id,
      natural_unit_id: chosen[0].natural_unit_id,
      family: chosen[0].family,
      prompt: chosen[0].prompt,
      answer_items: chosen[0].answer_items,
      source_refs: chosen[0].source_refs,
      source_role: chosen[0].source_role
    },
    response: 'FUZZY',
    observed_at: '2026-09-20T02:46:00.000+08:00'
  };
  const { context, page } = await contextWith(plan, [firstEvent]);
  try {
    await page.goto(base + '/politics/memory/');
    await page.keyboard.press('Enter');
    await page.keyboard.press('3');
    await page.locator('[data-memory-complete]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-memory-card]').isVisible(), false);
    const events = JSON.parse(await page.evaluate((key) => localStorage.getItem(key) || '[]', POLITICS_MEMORY_EVIDENCE_KEY));
    assert.equal(events.length, 2);
    assert.equal(events[1].candidate_id, chosen[1].id);
    assert.equal(events[1].response, 'STABLE');
    await page.reload();
    await page.locator('[data-memory-complete]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-memory-card]').isVisible(), false);
    await shot(page, '03-complete');
    return { event_count: events.length };
  } finally {
    await context.close();
  }
});

await check('stale-day-plan-fails-closed', async () => {
  const stalePlan = { ...plan, study_day: '2026-09-19', plan_id: 'synthetic-stale-day' };
  const { context, page } = await contextWith(stalePlan);
  try {
    await page.goto(base + '/politics/memory/');
    await page.locator('[data-memory-stale]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-memory-card]').isVisible(), false);
    assert.equal(await page.evaluate((key) => localStorage.getItem(key) !== null, POLITICS_MEMORY_PLAN_KEY), true, 'stale plan must be preserved, not silently deleted');
    await shot(page, '04-stale-day');
    return { preserved: true };
  } finally {
    await context.close();
  }
});

await check('stale-catalog-plan-fails-closed', async () => {
  const stalePlan = { ...plan, catalog_revision: 'synthetic-old-catalog', plan_id: 'synthetic-stale-catalog' };
  const { context, page } = await contextWith(stalePlan);
  try {
    await page.goto(base + '/politics/memory/');
    await page.locator('[data-memory-stale]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-memory-card]').isVisible(), false);
    assert.equal(await page.evaluate((key) => localStorage.getItem(key) !== null, POLITICS_MEMORY_PLAN_KEY), true);
    await shot(page, '05-stale-catalog');
    return { preserved: true };
  } finally {
    await context.close();
  }
});

await browser.close();
await new Promise((resolve) => server.close(resolve));

const report = {
  schema: 'kianos.politics.memory-browser-prototype.v1',
  synthetic: true,
  learner_U: 'UNTESTED',
  catalog_revision: catalog.revision,
  candidate_count: catalog.candidates.length,
  results,
  passed: results.filter((row) => row.status === 'PASS').length,
  failed: results.filter((row) => row.status === 'FAIL').length
};
fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ passed: report.passed, failed: report.failed, candidate_count: report.candidate_count }));
if (report.failed) process.exitCode = 1;
