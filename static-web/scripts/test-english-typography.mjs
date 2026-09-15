import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const dist = path.resolve('dist');
const out = path.resolve('../objective-audit/english-typography');
fs.mkdirSync(out, { recursive: true });

function serve(directory) {
  const mime = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.woff2': 'font/woff2'
  };
  const server = http.createServer((req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      let file = path.resolve(directory, `.${pathname}`);
      if (!file.startsWith(directory + path.sep) && file !== directory) {
        res.writeHead(403);
        return res.end();
      }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!fs.existsSync(file)) {
        res.writeHead(404);
        return res.end('Not found');
      }
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    } catch {
      res.writeHead(400);
      res.end();
    }
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

let server;
let browser;
const report = {
  scope: 'English typography acceptance / CI surrogate',
  productTarget: 'Mac system-ui / PingFang SC',
  ciSurrogate: 'Noto Sans CJK SC',
  pass: false
};

try {
  server = await serve(dist);
  const base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const response = await page.goto(`${base}/english/`);
  assert.equal(response?.status(), 200, 'English Home must render for typography acceptance');
  await page.evaluate(async () => { await document.fonts.ready; });

  const node = page.locator('.englishEntryFamilies p:visible').first();
  await node.waitFor();
  const computed = await node.evaluate((el) => {
    el.setAttribute('data-english-typography-probe', '');
    const style = getComputedStyle(el);
    return {
      text: el.textContent?.trim() || '',
      family: style.fontFamily,
      size: parseFloat(style.fontSize),
      weight: style.fontWeight,
      lineHeight: style.lineHeight
    };
  });
  assert.match(computed.text, /[\u3400-\u9fff]/, 'Typography probe must contain Chinese glyphs');
  assert.ok(computed.family.includes('PingFang SC'), `Declared stack must keep PingFang SC: ${computed.family}`);
  assert.ok(computed.family.includes('Noto Sans CJK SC'), `Declared stack must keep Noto Sans CJK SC fallback: ${computed.family}`);
  assert.ok(computed.size >= 18, `Learner-facing Home copy must remain readable: ${computed.size}px`);

  const session = await page.context().newCDPSession(page);
  await session.send('DOM.enable');
  await session.send('CSS.enable');
  const doc = await session.send('DOM.getDocument');
  const { nodeId } = await session.send('DOM.querySelector', {
    nodeId: doc.root.nodeId,
    selector: '[data-english-typography-probe]'
  });
  const { fonts } = await session.send('CSS.getPlatformFontsForNode', { nodeId });
  await session.detach();
  await node.evaluate((el) => el.removeAttribute('data-english-typography-probe'));

  const glyphFonts = fonts.filter((font) => font.glyphCount > 0);
  assert.ok(glyphFonts.length > 0, 'Typography acceptance requires actual glyph-render evidence');
  assert.ok(
    glyphFonts.every((font) => !/WenQuanYi|Zen Hei/i.test(font.familyName)),
    `WenQuanYi fallback invalidates typography acceptance: ${JSON.stringify(glyphFonts)}`
  );
  assert.ok(
    glyphFonts.some((font) => /Noto Sans CJK|PingFang|Hiragino Sans|Microsoft YaHei/i.test(font.familyName)),
    `No accepted modern CJK sans rendered the Chinese probe: ${JSON.stringify(glyphFonts)}`
  );

  report.computed = computed;
  report.platformFonts = glyphFonts;
  report.pass = true;
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log('PASS English typography:', JSON.stringify({ computed, glyphFonts }));
  await context.close();
} catch (error) {
  report.failure = error.stack || String(error);
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  if (server) {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  }
}
