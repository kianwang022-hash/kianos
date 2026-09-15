import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';
import { listLexicalWordSummaries } from '../src/lib/lexical.mjs';

const out = path.resolve('../lexical-audit/visual');
fs.mkdirSync(out, { recursive: true });
const report = { scope: 'Lexical visual gate / Current production', learnerU: 'NOT_TESTED', views: [], fonts: [], checks: [], errors: [] };
const pass = (name) => { report.checks.push(name); console.log('PASS Lexical visual:', name); };
const servers = [];
let browser;

async function serve(directory) {
  const mime = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.mjs':'text/javascript', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2' };
  const server = http.createServer((req, res) => {
    try {
      const name = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      let file = path.resolve(directory, `.${name}`);
      if (!file.startsWith(directory + path.sep) && file !== directory) { res.writeHead(403); return res.end(); }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!fs.existsSync(file)) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    } catch { res.writeHead(400); res.end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}

async function noOverflow(page, label) {
  const detail = await page.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth }));
  assert.ok(detail.width <= detail.viewport + 1, `${label}: horizontal overflow ${JSON.stringify(detail)}`);
}

async function fontProbe(page, selector, label) {
  const node = page.locator(`${selector}:visible`).first();
  await node.waitFor();
  await node.evaluate(el => el.setAttribute('data-lexical-qa-font', ''));
  const style = await node.evaluate(el => {
    const s = getComputedStyle(el);
    return { family: s.fontFamily, size: parseFloat(s.fontSize), weight: s.fontWeight, text: el.textContent?.trim().slice(0, 80) || '' };
  });
  const session = await page.context().newCDPSession(page);
  await session.send('DOM.enable');
  await session.send('CSS.enable');
  const doc = await session.send('DOM.getDocument');
  const { nodeId } = await session.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '[data-lexical-qa-font]' });
  const { fonts } = await session.send('CSS.getPlatformFontsForNode', { nodeId });
  assert.ok(fonts.some(font => font.glyphCount > 0), `${label}: no actual glyph evidence`);
  assert.ok(fonts.every(font => !/WenQuanYi/i.test(font.familyName)), `${label}: WenQuanYi fallback ${JSON.stringify(fonts)}`);
  report.fonts.push({ label, ...style, fonts });
  await node.evaluate(el => el.removeAttribute('data-lexical-qa-font'));
  await session.detach();
}

try {
  const summaries = listLexicalWordSummaries();
  const findWord = (word) => {
    const row = summaries.find(item => String(item.word || '').toLowerCase() === word.toLowerCase());
    assert.ok(row?.ordinal, `LEXICAL_WORD_NOT_FOUND:${word}`);
    return row;
  };
  const answer = findWord('answer');
  const say = findWord('say');

  const base = await serve(path.resolve('dist'));
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => report.errors.push(error.message));

  const go = async (route) => {
    const res = await page.goto(base + route);
    assert.equal(res?.status(), 200, route);
    await page.evaluate(async () => { await document.fonts.ready; });
  };
  const shot = async (name, locator = null) => {
    if (locator) await locator.screenshot({ path: path.join(out, `${name}.png`) });
    else await page.screenshot({ path: path.join(out, `${name}.png`) });
    await noOverflow(page, name);
    report.views.push({ name, url: page.url(), width: (await page.viewportSize()).width });
  };

  for (const width of [1440, 1728, 390]) {
    await page.setViewportSize({ width, height: width === 1728 ? 1117 : 900 });
    await go('/vocabulary/');
    await shot(`home-${width}`);
  }
  pass('Vocabulary Home screenshots captured without horizontal overflow');

  await page.setViewportSize({ width: 1440, height: 900 });
  await go('/vocabulary/');
  await page.locator('[data-lexical-tab="search"]').click();
  const search = page.locator('[data-lexical-search]');
  await search.fill('say');
  await page.locator('[data-lexical-search-results] .lexicalWordRow').first().waitFor();
  await shot('home-search-say-1440');
  await page.locator('[data-lexical-tab="review"]').click();
  await shot('home-repair-empty-1440');
  await page.locator('[data-lexical-tab="challenge"]').click();
  await page.locator('[data-challenge-import-panel]').waitFor();
  await shot('home-challenge-import-1440');
  pass('Search / Repair / Challenge Current modes captured without fabricated state');

  await go(`/vocabulary/${answer.ordinal}/`);
  await page.locator('[data-vocab-front]').waitFor();
  await shot('answer-front-1440');
  pass('answer Recall Front captured from Current word owner');

  await go(`/vocabulary/${say.ordinal}/`);
  await page.locator('[data-vocab-reveal]').click();
  await page.locator('[data-vocab-details]:visible').waitFor();
  await page.locator('.portedVocabSenseRow').first().waitFor();
  await fontProbe(page, '.portedVocabSenseCn', 'say sense Chinese');
  const sense = await page.locator('.portedVocabSenseRow').first().evaluate(el => {
    const s = getComputedStyle(el);
    const heading = el.querySelector('.portedVocabSenseHeading');
    const meaning = el.querySelector('.portedVocabSenseMeaning');
    const cn = el.querySelector('.portedVocabSenseCn');
    const en = el.querySelector('.portedVocabSenseEn');
    const facts = el.querySelector('.portedVocabSenseFacts');
    const hr = heading?.getBoundingClientRect();
    const mr = meaning?.getBoundingClientRect();
    const fr = facts?.getBoundingClientRect();
    return {
      display: s.display,
      columns: s.gridTemplateColumns,
      width: el.getBoundingClientRect().width,
      cnSize: cn ? parseFloat(getComputedStyle(cn).fontSize) : 0,
      enSize: en ? parseFloat(getComputedStyle(en).fontSize) : 0,
      hasFacts: Boolean(facts),
      heading: hr ? { left:hr.left, top:hr.top, right:hr.right, bottom:hr.bottom } : null,
      meaning: mr ? { left:mr.left, top:mr.top, right:mr.right, bottom:mr.bottom } : null,
      facts: fr ? { left:fr.left, top:fr.top, right:fr.right, bottom:fr.bottom, width:fr.width } : null
    };
  });
  assert.equal(sense.display, 'grid', `say sense row not grid: ${JSON.stringify(sense)}`);
  assert.ok(sense.cnSize >= 17 && sense.enSize >= 18, `say sense row text too small: ${JSON.stringify(sense)}`);
  assert.ok(sense.hasFacts && sense.heading && sense.meaning && sense.facts, `say sense row owner missing: ${JSON.stringify(sense)}`);
  assert.ok(Math.abs(sense.heading.left - sense.meaning.left) <= 2, `sense heading/meaning do not share left owner: ${JSON.stringify(sense)}`);
  assert.ok(sense.facts.left >= sense.meaning.right - 2, `sense facts are not the right owner: ${JSON.stringify(sense)}`);
  assert.ok(sense.facts.top <= sense.heading.top + 2 && sense.facts.bottom >= sense.meaning.bottom - 2, `sense facts do not span the semantic row: ${JSON.stringify(sense)}`);
  report.senseRow = sense;
  await shot('say-reveal-1440');
  await shot('say-sense-row-1440', page.locator('.portedVocabSenseRow').first());
  pass('say Reveal and first sense-row preserve left meaning / right facts ownership');

  fs.writeFileSync(path.resolve('../lexical-audit/visual-report.json'), JSON.stringify({ ...report, pass: true }, null, 2));
} catch (error) {
  report.errors.push(error?.stack || String(error));
  fs.writeFileSync(path.resolve('../lexical-audit/visual-report.json'), JSON.stringify({ ...report, pass: false }, null, 2));
  throw error;
} finally {
  if (browser) await browser.close();
  await Promise.all(servers.map(server => new Promise(resolve => server.close(resolve))));
}
