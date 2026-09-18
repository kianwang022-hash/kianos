// Regression for the fresh audit's long-sequence readability defect.
// Uses synthetic state only. macOS browser proof is not a Kian Human Gate or U.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';

const out = path.resolve(process.env.POLITICS_FRESH_EVIDENCE || '../qa/politics-final-fresh');
fs.mkdirSync(out, { recursive: true });
const site = path.resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  try {
    let name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (name.endsWith('/')) name += 'index.html';
    const file = path.resolve(site, '.' + name);
    if (!file.startsWith(site + path.sep) || !fs.statSync(file).isFile()) throw new Error('missing');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
const page = await context.newPage();
const report = { platform: process.platform, synthetic: true, human_gate: 'PENDING_KIAN', learner_U: 'UNTESTED' };
const shot = name => page.screenshot({ path: path.join(out, name + '.png'), fullPage: true, animations: 'disabled' });
try {
  await page.goto(base + '/politics/marxism/ch01/#unit-2');
  await page.locator('#unit-2').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  const sequence = page.locator('#unit-2 .explicitSequence').first();
  const nodes = sequence.locator(':scope > .sequenceItem');
  const source = JSON.parse(fs.readFileSync('../content/politics/learning/marxism/ch01.json', 'utf8'));
  const expected = source.unit_projections.find(unit => unit.natural_unit_id === 'POL27-CF-MARX-C01-S02').teaching_beats.map(beat => beat.label);
  assert.deepEqual(await nodes.locator('b').allTextContents(), expected);
  assert.equal(await sequence.locator(':scope > .sequenceTransition').count(), expected.length - 1);
  assert.equal(await sequence.locator('[data-transition-mode="ORDER_ONLY"] [data-surface-field="relation"]').count(), 0);
  report.nodes = await nodes.evaluateAll(elements => elements.map(element => ({
    label: element.querySelector('b')?.textContent,
    width: element.getBoundingClientRect().width,
    textWidth: element.querySelector('p')?.getBoundingClientRect().width,
    font: parseFloat(getComputedStyle(element.querySelector('p') || element).fontSize),
    overflow: element.scrollWidth > element.clientWidth + 2
  })));
  for (const node of report.nodes) {
    assert.ok(node.width >= 180 && node.textWidth >= 160, 'node must allow readable CJK lines: ' + JSON.stringify(node));
    assert.ok(node.font >= 16, 'do not solve geometry by shrinking text');
    assert.equal(node.overflow, false);
  }
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false);
  await shot('sequence-readable-start');
  await nodes.last().scrollIntoViewIfNeeded();
  await shot('sequence-readable-end');

  // A screenshot taken mid-transition must not be mistaken for steady-state UI.
  const catalog = buildPoliticsPracticeCatalogCurrent('/');
  const q = catalog.questions.find(q => q.subject === 'history' && q.unitKey && q.type === 'single');
  await page.goto(base + '/politics/practice/?question=' + encodeURIComponent(q.id));
  await page.locator('[data-filter-count]').selectOption('5');
  await page.locator('[data-learned-scope]').check();
  await page.locator('[data-start-session]').click();
  const wrong = q.options.find(option => !q.answer.includes(option.label)).label;
  await page.locator(`[data-option="${wrong}"]`).click();
  await page.locator('[data-submit]').click();
  await page.locator('[data-submitted-result]').waitFor({ state: 'visible' });
  await page.locator('[data-cause="options"]').click();
  await page.waitForTimeout(400);
  const cause = page.locator('[data-cause="options"]');
  report.cause = await cause.evaluate(button => ({
    text: button.textContent, pressed: button.getAttribute('aria-pressed'),
    foreground: getComputedStyle(button).color,
    background: getComputedStyle(button).backgroundColor,
    opacity: getComputedStyle(button).opacity
  }));
  assert.equal(report.cause.pressed, 'true');
  assert.equal(report.cause.text.trim(), '选项没辨清');
  assert.notEqual(report.cause.foreground, report.cause.background);
  assert.equal(report.cause.opacity, '1');
  await shot('history-submitted-settled');
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL';
  report.error = String(error.stack || error);
  await shot('sequence-readability-failure');
  process.exitCode = 1;
} finally {
  fs.writeFileSync(path.join(out, 'sequence-readability.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
  await context.close();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
