import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';
import { listPoliticsSubjectsCurrent } from '../src/lib/politicsCurrent.mjs';
import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';
import { practiceReady } from '../src/lib/politicsPracticeView.mjs';

const out = path.resolve('../politics-audit/visual');
fs.mkdirSync(out, { recursive: true });
const report = { scope: 'Politics visual gate / Current production', learnerU: 'NOT_TESTED', views: [], fonts: [], checks: [], errors: [] };
const pass = name => { report.checks.push(name); console.log('PASS Politics visual:', name); };
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
  await node.evaluate(el => el.setAttribute('data-politics-qa-font', ''));
  const style = await node.evaluate(el => {
    const s = getComputedStyle(el);
    return { family: s.fontFamily, size: parseFloat(s.fontSize), weight: s.fontWeight, text: el.textContent?.trim().slice(0, 80) || '' };
  });
  const session = await page.context().newCDPSession(page);
  await session.send('DOM.enable');
  await session.send('CSS.enable');
  const doc = await session.send('DOM.getDocument');
  const { nodeId } = await session.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '[data-politics-qa-font]' });
  const { fonts } = await session.send('CSS.getPlatformFontsForNode', { nodeId });
  assert.ok(fonts.some(font => font.glyphCount > 0), `${label}: no actual glyph evidence`);
  assert.ok(fonts.every(font => !/WenQuanYi/i.test(font.familyName)), `${label}: WenQuanYi fallback ${JSON.stringify(fonts)}`);
  report.fonts.push({ label, ...style, fonts });
  await node.evaluate(el => el.removeAttribute('data-politics-qa-font'));
  await session.detach();
}

try {
  const subjects = listPoliticsSubjectsCurrent();
  const firstSubject = subjects[0];
  const firstChapter = firstSubject?.chapters?.[0];
  assert.ok(firstSubject?.subject && firstChapter?.code, 'POLITICS_FIRST_CHAPTER_NOT_READY');
  const catalog = buildPoliticsPracticeCatalogCurrent('/');
  const practiceQuestion = catalog.questions.find(q => practiceReady(q) && String(q.answer || '').length === 1);
  assert.ok(practiceQuestion?.id, 'POLITICS_VISUAL_QUESTION_NOT_READY');

  const base = await serve(path.resolve('dist'));
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => report.errors.push(error.message));

  const go = async route => {
    const res = await page.goto(base + route);
    assert.equal(res?.status(), 200, route);
    await page.evaluate(async () => { await document.fonts.ready; });
  };
  const shot = async name => {
    await page.screenshot({ path: path.join(out, `${name}.png`) });
    await noOverflow(page, name);
    report.views.push({ name, url: page.url(), width: (await page.viewportSize()).width });
  };

  for (const width of [1440, 1728, 390]) {
    await page.setViewportSize({ width, height: width === 1728 ? 1117 : 900 });
    await go('/politics/');
    if (width === 1440) await fontProbe(page, '.politicsSubjectLane h2', 'Politics Home Chinese');
    await shot(`overview-${width}`);
  }
  pass('Politics overview captured at Mac-wide and narrow widths');

  await page.setViewportSize({ width: 1440, height: 900 });
  await go(`/politics/${firstSubject.subject}/${firstChapter.code}/`);
  await page.locator('[data-politics-frame]').waitFor();
  const frame = await page.locator('.frameCognition').evaluate(el => {
    const primary = el.querySelector('.framePrimary')?.getBoundingClientRect();
    const companion = el.querySelector('.frameCompanion')?.getBoundingClientRect();
    return { columns:getComputedStyle(el).gridTemplateColumns, primaryWidth:primary?.width || 0, companionWidth:companion?.width || 0 };
  });
  assert.ok(frame.primaryWidth > frame.companionWidth, `Politics frame lost primary/companion hierarchy: ${JSON.stringify(frame)}`);
  report.frame = frame;
  await shot('natural-unit-1440');
  pass('Current chapter keeps primary cognition left and source/next companion right');

  await go(`/politics/practice/?question=${encodeURIComponent(practiceQuestion.id)}`);
  await page.locator('[data-start-session]').waitFor();
  await page.selectOption('[data-filter-count]', '5');
  await page.check('[data-learned-scope]');
  await page.click('[data-start-session]');
  await page.locator('[data-question-card]').waitFor({ state:'visible' });
  await shot('practice-question-1440');

  const wrong = 'ABCD'.split('').find(letter => !String(practiceQuestion.answer).includes(letter));
  assert.ok(wrong, 'POLITICS_VISUAL_WRONG_OPTION_NOT_FOUND');
  await page.click(`[data-option="${wrong}"]`);
  await page.click('[data-submit]');
  await page.locator('[data-submitted-result]').waitFor({ state:'visible' });
  const resultStatus = (await page.locator('[data-result-status]').textContent())?.trim() || '';
  assert.match(resultStatus, /答错|Wrong/i, `Expected wrong review state, got ${resultStatus}`);
  await shot('practice-wrong-review-1440');
  pass('Real Current Xiao1000 question and wrong-review state captured');

  fs.writeFileSync(path.resolve('../politics-audit/visual-report.json'), JSON.stringify({ ...report, pass:true }, null, 2));
} catch (error) {
  report.errors.push(error?.stack || String(error));
  fs.writeFileSync(path.resolve('../politics-audit/visual-report.json'), JSON.stringify({ ...report, pass:false }, null, 2));
  throw error;
} finally {
  if (browser) await browser.close();
  await Promise.all(servers.map(server => new Promise(resolve => server.close(resolve))));
}
