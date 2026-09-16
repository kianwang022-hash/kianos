import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

// Isolated engineering browser only. Never imports or writes Kian's private state.
// Screenshots are Linux Chromium + Noto evidence, NOT Mac or real-learner U acceptance.
const out = path.resolve('../visual-evidence/screens');
const root = path.resolve('dist');
fs.mkdirSync(out, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.gz': 'application/gzip' };
const server = http.createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  } catch { res.writeHead(400).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const report = {
  schema: 'kianos.visual-convergence.browser-evidence.v1',
  head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  environment: 'Linux Chromium; Noto Sans CJK installed; Mac Human Gate PENDING',
  acceptance: 'EVIDENCE_ONLY_NOT_AESTHETIC_OR_U_PASS',
  pages: [], failures: [], journeys: []
};
const browser = await chromium.launch({ headless: true });
async function capture(name, url, viewport = { width: 1536, height: 864 }, act) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: 'zh-CN' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  try {
    const response = await page.goto(base + url, { waitUntil: 'networkidle' });
    if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
    await page.evaluate(() => document.fonts.ready);
    if (act) await act(page);
    await page.waitForTimeout(200);
    const metrics = await page.evaluate(() => {
      const rect = selector => [...document.querySelectorAll(selector)].filter(e => e.getClientRects().length).slice(0, 20).map(e => {
        const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
        return { selector, text: e.textContent.trim().slice(0, 90), x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, font: s.fontFamily, size: s.fontSize, weight: s.fontWeight, overflowY: s.overflowY };
      });
      return { url: location.pathname, viewport: { width: innerWidth, height: innerHeight }, scroll: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }, bodyFont: getComputedStyle(document.body).fontFamily, bodySize: getComputedStyle(document.body).fontSize,
        visible: ['.productBar','.productCanvas','.homeGrid','.homeLane','.homeCurrentStrip','.commandHeader','.commandSubjects','.commandSubject','.commandFoot','.englishResume','.englishCapabilityLayout','.englishCapabilityGroup','.englishFirstLearning','.portedReadingWorkspace','.portedReadingColumns','.portedReadingPassage','.portedReadingQuestions','.readingWorkspace','.readingPassage','.readingQuestionPane','h1'].flatMap(rect),
        localStorageKeys: Object.keys(localStorage).sort() };
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    const { root: doc } = await cdp.send('DOM.getDocument');
    const platformFonts = { fonts: [] };
    for (const selector of ['h1','h2','.commandSubjectMeta','.portedReadingPassage p','.englishOverview p']) {
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: doc.nodeId, selector });
      if (nodeId) {
        const result = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
        platformFonts.fonts.push(...result.fonts.map(font => ({ selector, ...font })));
      }
    }
    if (url === '/' && !platformFonts.fonts.some(font => /Noto Sans CJK SC/i.test(font.familyName) && font.glyphCount > 0)) throw new Error('Home CJK substitute font was not actually resolved');
    if (platformFonts.fonts.some(font => /WenQuanYi/i.test(font.familyName))) throw new Error('Disallowed WenQuanYi visual evidence');
    await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: false });
    if (metrics.scroll.height > viewport.height + 3 && metrics.scroll.height < 6000) await page.screenshot({ path: path.join(out, `${name}-full.png`), fullPage: true });
    report.pages.push({ name, ...metrics, platformFonts: platformFonts.fonts, errors });
    if (errors.length) report.failures.push({ name, errors });
    if (metrics.scroll.width > viewport.width + 1) report.failures.push({ name, error: 'Horizontal page overflow' });
    if (url === '/' && viewport.width >= 1280) {
      const core = metrics.visible.filter(box => box.selector === '.commandSubject');
      if (core.some(box => box.bottom > viewport.height)) report.failures.push({ name, error: 'Home core below viewport', bottom: Math.max(...core.map(box => box.bottom)) });
    }
  } catch (error) { report.failures.push({ name, error: String(error) }); }
  finally { await context.close(); }
}
try {
  await capture('home-1536', '/');
  await capture('home-1440', '/', { width: 1440, height: 780 });
  await capture('home-1280', '/', { width: 1280, height: 720 });
  await capture('home-narrow', '/', { width: 390, height: 844 });
  const populatedHome = async page => {
    await page.evaluate(() => {
      const today = new Date().toLocaleDateString('en-CA');
      const id = 'english1-2000-reading-a-text1';
      localStorage.setItem('kianos-reading-last-location-v1', JSON.stringify({ id, title: '2000 · Text 1 · synthetic unfinished Reading A', updatedAt: '2026-09-16T00:00:00Z' }));
      localStorage.setItem(`kianos-reading-attempt-v1:${id}`, JSON.stringify({ submitted: false, results: {}, uncertain: [], startedAt: '2026-09-16T00:00:00Z' }));
      localStorage.setItem('kianos-xizong-last-location-v1', JSON.stringify({ href: '/xizong/urinary/b01/', systemId: 'urinary', systemCanonical: 'A3', blockLabel: 'B1', blockTitle: '肾脏总地图、清除率、肾血流与内分泌' }));
      localStorage.setItem('kianos-politics-evidence-v1', JSON.stringify([{ id: 'visual-only-wrong', study_day: today, outcome: 'WRONG' }, { id: 'visual-only-uncertain', study_day: today, outcome: 'UNCERTAIN' }]));
    });
    const before = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage))));
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-english-resume]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-xizong-continue]').getAttribute('href'), '/xizong/urinary/b01/');
    assert.match(await page.locator('[data-politics-handoff-summary]').innerText(), /2.*1 Wrong.*1 Uncertain/);
    assert.equal(await page.locator('[data-english-resume-link]').getAttribute('href'), '/reading/english1-2000-reading-a-text1/');
    assert.equal(await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage)))), before, 'Home must not mutate native learner state');
  };
  await capture('home-populated-1440', '/', { width: 1440, height: 780 }, populatedHome);
  await capture('home-populated-1280', '/', { width: 1280, height: 720 }, populatedHome);
  await capture('english-home', '/english/');
  await capture('english-home-resume', '/english/', { width: 1536, height: 864 }, async page => {
    // Synthetic unfinished exposed Reading A, using the exact existing hub contract.
    await page.evaluate(() => {
      const id = 'english1-2000-reading-a-text1';
      localStorage.setItem('kianos-reading-last-location-v1', JSON.stringify({ id, title: '2000 · Text 1', updatedAt: '2026-09-16T00:00:00Z' }));
      localStorage.setItem(`kianos-reading-attempt-v1:${id}`, JSON.stringify({ submitted: false, results: {}, uncertain: [], startedAt: '2026-09-16T00:00:00Z' }));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-english-resume]').waitFor({ state: 'visible' });
  });
  await capture('english-reading-a', '/reading/english1-2000-reading-a-text1/');
  await capture('english-reading-a-narrow', '/reading/english1-2000-reading-a-text1/', { width: 390, height: 844 });
  await capture('english-guide', '/objective-learn/');

  const context = await browser.newContext({ viewport: { width: 1440, height: 780 }, locale: 'zh-CN' });
  const page = await context.newPage();
  const journeyErrors = [];
  page.on('pageerror', error => journeyErrors.push(String(error)));
  try {
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    await populatedHome(page);
    await page.locator('[data-english-resume-link]').click();
    await page.waitForURL('**/reading/english1-2000-reading-a-text1/');
    await page.locator('.portedReadingPassage').waitFor({ state: 'visible' });
    await page.locator('.productNavItem', { hasText: 'Home' }).click();
    await page.waitForURL(base + '/');
    assert.equal(await page.locator('[data-english-resume-link]').getAttribute('href'), '/reading/english1-2000-reading-a-text1/');
    const packetBefore = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage))));
    // Capture the clipboard API output in the isolated browser; not an OS clipboard claim.
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__handoffPacket = text; } } });
    });
    await page.locator('[data-politics-copy-handoff]').click();
    await page.waitForFunction(() => Boolean(window.__handoffPacket));
    const packet = JSON.parse(await page.evaluate(() => window.__handoffPacket));
    assert.equal(packet.schema, 'kianos.politics.return_packet.v1');
    assert.equal(packet.events.length, 2);
    assert.equal(await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage)))), packetBefore);
    assert.deepEqual(journeyErrors, []);
    report.journeys.push({ name: 'Home native English Resume → actual Reading A → Home exact Resume; Politics handoff read-only', status: 'PASS', evidence: 'SYNTHETIC_BROWSER_NOT_REAL_USER', clipboardCaptureStub: true });
  } catch (error) { report.failures.push({ name: 'home-native-navigation', error: String(error) }); }
  finally { await context.close(); }

} finally {
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
if (report.failures.length) { console.error(JSON.stringify(report.failures, null, 2)); process.exitCode = 1; }
else console.log(`Captured ${report.pages.length} exact-head pages; Human Gate remains pending.`);
