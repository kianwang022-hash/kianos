import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

// Visual projection gate only. Linux Chromium/Noto is a browser pre-gate,
// not Mac/PingFang acceptance and not learner U evidence.
const out = path.resolve('../visual-evidence/lexical-projection');
const root = path.resolve('dist');
fs.mkdirSync(out, { recursive: true });
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp' };
const server = http.createServer((req, res) => {
  try {
    let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
    res.setHeader('content-type', mime[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  } catch { res.writeHead(400).end(); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const viewport = { width: 1440, height: 780 };

const cases = [
  { name:'yield-no-expansion', ordinal:5489, expectExpansion:false },
  { name:'account-rich-expansion', ordinal:40, expectExpansion:true, expectText:['account','bill','on account of'] },
  { name:'charge-dedup', ordinal:761, expectExpansion:true, uniqueVisible:['charge + sb + with + sth','charge at + sb/sth'] },
  { name:'abstract-form', ordinal:19, expectExpansion:true, expectText:['AB-stract','ab-STRACT'] }
];
const report = {
  head: execFileSync('git', ['rev-parse','HEAD'], { encoding:'utf8' }).trim(),
  environment: 'Linux Chromium / Noto Sans CJK; Mac-wide 1440x780 browser pre-gate only',
  viewport,
  cases: [],
  failures: []
};

try {
  for (const test of cases) {
    const context = await browser.newContext({ viewport, locale:'zh-CN' });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
      const response = await page.goto(`${base}/vocabulary/${test.ordinal}/`, { waitUntil:'networkidle' });
      assert.ok(response?.ok(), `HTTP ${response?.status()}`);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('[data-vocab-reveal]').click();
      await page.waitForTimeout(100);

      const metrics = await page.evaluate(() => {
        const body = document.querySelector('.portedVocabBody');
        const expansion = document.querySelector('.portedVocabEvidenceColumn');
        const rows = [...document.querySelectorAll('.lexicalSenseRow')];
        const rect = (el) => el ? el.getBoundingClientRect() : null;
        const visibleText = (el) => el && el.getClientRects().length ? el.innerText : '';
        return {
          documentHeight: document.documentElement.scrollHeight,
          documentWidth: document.documentElement.scrollWidth,
          bodyHasExpansion: body?.getAttribute('data-has-expansion') || null,
          bodyColumns: body ? getComputedStyle(body).gridTemplateColumns : '',
          bodyRect: rect(body),
          expansionRect: rect(expansion),
          expansionText: visibleText(expansion),
          visibleText: document.body.innerText,
          rowHeights: rows.map((row) => Math.round(row.getBoundingClientRect().height)),
          rowColumns: rows.map((row) => getComputedStyle(row).gridTemplateColumns),
          chineseSizes: rows.map((row) => getComputedStyle(row.querySelector('.lexicalSenseMeaning > p')).fontSize),
          englishSizes: rows.map((row) => getComputedStyle(row.querySelector('.lexicalSenseMeaning > strong')).fontSize)
        };
      });

      assert.equal(metrics.bodyHasExpansion, String(test.expectExpansion), `${test.name}: expansion gate`);
      assert.ok(metrics.documentWidth <= viewport.width + 1, `${test.name}: horizontal overflow ${metrics.documentWidth}`);
      assert.ok(metrics.documentHeight <= viewport.height + 1, `${test.name}: should fit one 1440x780 viewport, got ${metrics.documentHeight}px`);
      assert.ok(metrics.rowHeights.every((height) => height <= 105), `${test.name}: sense row too tall ${metrics.rowHeights.join(',')}`);
      assert.ok(metrics.chineseSizes.every((size, index) => parseFloat(size) > parseFloat(metrics.englishSizes[index])), `${test.name}: Chinese must visually outrank English`);

      if (!test.expectExpansion) {
        assert.equal(metrics.expansionRect, null, `${test.name}: no empty expansion rail`);
        assert.equal(metrics.bodyColumns.split(' ').length, 1, `${test.name}: main workspace should consume full width`);
      } else {
        assert.ok(metrics.expansionRect?.width >= 285, `${test.name}: important expansion too narrow`);
      }
      for (const text of test.expectText || []) assert.ok(metrics.visibleText.includes(text), `${test.name}: missing ${text}`);
      for (const phrase of test.uniqueVisible || []) {
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const count = (metrics.visibleText.match(new RegExp(escaped, 'g')) || []).length;
        assert.equal(count, 1, `${test.name}: ${phrase} rendered ${count} times`);
      }

      await page.screenshot({ path:path.join(out, `${test.name}.png`) });
      report.cases.push({ ...test, ...metrics, pageErrors: errors, status:'PASS' });
      if (errors.length) report.failures.push({ name:test.name, errors });
    } catch (error) {
      report.failures.push({ name:test.name, error:error.message });
      await page.screenshot({ path:path.join(out, `${test.name}-failure.png`) }).catch(() => {});
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  server.close();
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
}

console.log(JSON.stringify({ head:report.head, cases:report.cases.map(({name,status,documentHeight,bodyColumns,expansionRect}) => ({name,status,documentHeight,bodyColumns,expansionWidth:expansionRect?.width || 0})), failures:report.failures }, null, 2));
if (report.failures.length) process.exitCode = 1;
