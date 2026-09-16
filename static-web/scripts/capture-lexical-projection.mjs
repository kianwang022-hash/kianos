import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

// Visual projection gate only. Linux Chromium/Noto is a browser pre-gate,
// not Mac/PingFang acceptance and not learner U evidence. This deliberately
// tests content-shape adaptation rather than one hand-picked rich word.
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
      // Kian accepted a half-step less density. A fixed 105px ceiling would
      // reject readable content while missing clipping inside fixed-height panes.
      // Keep the viewport/width gates; directly test reachable text, type floors,
      // right-side cards, and detection power against a clipped-row mutation.
      const readabilityAudit = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('.lexicalSenseRow')];
        const saved = [...document.querySelectorAll('*')].filter(el => el.scrollTop || el.scrollLeft)
          .map(el => [el, el.scrollTop, el.scrollLeft]);
        const scan = () => {
          const failures = [];
          const leaves = [...document.querySelectorAll('.lexicalSenseMeaning > p, .lexicalSenseMeaning > strong, .lexicalSenseUsage li > b, .lexicalSenseUsage li > span, .lexicalExpansionSection article > b, .lexicalExpansionCn, .lexicalFormVariants b, .lexicalFamilyRows b')];
          for (const el of leaves) {
            if (!el.getClientRects().length || getComputedStyle(el).display === 'none') continue;
            el.scrollIntoView({block:'nearest', inline:'nearest', behavior:'instant'});
            const r=el.getBoundingClientRect();
            if (r.left < -2 || r.right > innerWidth+2 || r.top < -2 || r.bottom > innerHeight+2) failures.push('unreachable:'+el.textContent.trim().slice(0,70));
            for (let a=el.parentElement; a; a=a.parentElement) {
              const cs=getComputedStyle(a), ar=a.getBoundingClientRect();
              const clippedX=/hidden|clip|auto|scroll/.test(cs.overflowX) && (r.left < ar.left-2 || r.right > ar.right+2);
              const clippedY=/hidden|clip|auto|scroll/.test(cs.overflowY) && (r.top < ar.top-2 || r.bottom > ar.bottom+2);
              if (clippedX || clippedY) { failures.push('clipped:'+el.textContent.trim().slice(0,70)); break; }
            }
          }
          for (const row of rows) {
            if (row.scrollWidth > row.clientWidth+2) failures.push('row-horizontal-overflow');
            const cn=row.querySelector('.lexicalSenseMeaning > p');
            const en=row.querySelector('.lexicalSenseMeaning > strong');
            if (cn && parseFloat(getComputedStyle(cn).fontSize) < 18) failures.push('chinese-type-floor');
            if (en && parseFloat(getComputedStyle(en).fontSize) < 13.5) failures.push('english-type-floor');
          }
          return [...new Set(failures)];
        };
        const failures=scan();
        const first=rows[0], prior=first?.getAttribute('style');
        let clippedMutationDetected=false;
        if (first) {
          first.style.cssText+=';height:4px!important;max-height:4px!important;min-height:0!important;padding-block:0!important;overflow:hidden!important;';
          clippedMutationDetected=scan().some(s => s.startsWith('clipped:'));
          if (prior === null) first.removeAttribute('style'); else first.setAttribute('style', prior);
        }
        const cards=[...document.querySelectorAll('.portedVocabEvidenceColumn > .lexicalExpansionSection')];
        const distinctCards=cards.every(el => parseFloat(getComputedStyle(el).borderTopWidth)>0 && parseFloat(getComputedStyle(el).borderRadius)>=6);
        for (const el of document.querySelectorAll('*')) { if(el.scrollTop) el.scrollTop=0; if(el.scrollLeft) el.scrollLeft=0; }
        saved.forEach(([el,top,left]) => {el.scrollTop=top;el.scrollLeft=left;});
        return {failures,clippedMutationDetected,distinctCards,cardCount:cards.length};
      });
      assert.deepEqual(readabilityAudit.failures, [], `${test.name}: text must be readable and reachable`);
      assert.ok(readabilityAudit.clippedMutationDetected, `${test.name}: clipping detector must catch its negative control`);
      if (test.expectExpansion) assert.ok(readabilityAudit.distinctCards, `${test.name}: preserve accepted separate expansion cards`);
      metrics.readabilityAudit = readabilityAudit;
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
