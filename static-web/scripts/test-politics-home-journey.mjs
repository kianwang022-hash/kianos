import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Run against production output in a disposable context. No real learner U.
export async function testPoliticsHome({ browser, base, out, report, sample }) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const evidence = { scope: 'Politics Home / chain-first regression', learnerU: 'NOT_TESTED', state: 'DISPOSABLE_QA_ONLY', checks: [], errors: [] };
  page.on('pageerror', error => evidence.errors.push(error.message));
  const lastKey = 'kianos-politics-last-location-v1';
  const evidenceKey = 'kianos-politics-evidence-v1';
  const home = `${base}/politics/`;
  const ready = () => page.locator('[data-politics-home-ready="true"]').waitFor({ state: 'attached' });
  const visit = async () => { await page.goto(home); await ready(); };
  const snapshot = () => page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])));
  const seed = async (last, events) => page.evaluate(({ last, events, lastKey, evidenceKey }) => {
    localStorage.removeItem(lastKey);
    if (last !== null) localStorage.setItem(lastKey, JSON.stringify(last));
    localStorage.setItem(evidenceKey, JSON.stringify(events));
  }, { last, events, lastKey, evidenceKey });
  const reloadUnchanged = async () => {
    const before = await snapshot(); await page.reload(); await ready();
    assert.equal(await snapshot(), before, 'Home must not mutate learner storage');
  };
  const pass = name => { evidence.checks.push(name); report.checks.push(`Home: ${name}`); console.log('PASS Home:', name); };
  const shot = name => page.screenshot({ path: path.join(out, `home-${name}.png`) });
  const noOverflow = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  let resume;
  try {
    await visit();
    assert.equal(await page.locator('[data-politics-continue]').isVisible(), false);
    assert.equal(await page.locator('.politicsHandoff').isVisible(), false);
    assert.equal(await page.locator('.subjectEntry:visible').count(), 5);
    assert.equal(await snapshot(), '[]');
    await shot('first-entry-1440');
    await page.setViewportSize({ width: 1728, height: 1117 });
    assert.equal(await noOverflow(), true); await shot('first-entry-1728');
    await page.setViewportSize({ width: 1440, height: 900 });
    pass('empty state has five free entries, no fabricated Continue/Today or storage');

    // Obtain the Resume from the real source-handoff interaction, not a guessed identity.
    await page.goto(base + sample.unitHref);
    await page.locator('[data-frame-handoff]:visible').click();
    await page.waitForFunction(key => Boolean(localStorage.getItem(key)), lastKey);
    resume = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), lastKey);
    assert.equal(resume.action, 'EXTERNAL_LEARN');
    await visit();
    assert.equal(await page.locator('[data-politics-continue]').getAttribute('href'), resume.href);
    assert.match(await page.locator('[data-politics-continue-meta]').innerText(), /iPad \/ MarginNote/);
    await reloadUnchanged(); await shot('real-source-resume');
    await page.locator('[data-politics-continue]').click();
    assert.equal(new URL(page.url()).pathname + new URL(page.url()).search + new URL(page.url()).hash, resume.href);
    await page.locator('[data-frame-unit]:visible [data-politics-external-source]').waitFor();
    pass('actual NU source handoff -> Home -> exact original locator, with external-primary cue');
    await visit();

    const day = await page.evaluate(() => new Date().toLocaleDateString('en-CA'));
    const stable = { event_id: 'home-stable', study_day: day, outcome: 'STABLE' };
    const wrong = { event_id: 'home-wrong', study_day: day, outcome: 'WRONG', question_id: sample.id };
    const uncertain = { event_id: 'home-uncertain', study_day: day, outcome: 'UNCERTAIN', question_id: sample.id };
    await seed(resume, [stable]); await reloadUnchanged();
    assert.equal(await page.locator('.politicsHandoff').isVisible(), false);
    pass('stable-only work does not create Today or review debt');

    await seed(resume, [stable, wrong, uncertain, { ...wrong, study_day: '2000-01-01' }, { study_day: day, outcome: 'SEEN' }, null]);
    await reloadUnchanged();
    assert.match(await page.locator('[data-politics-handoff-summary]').innerText(), /2 条.*1 Wrong.*1 Uncertain/);
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__homePacket = text; } } }));
    await page.locator('[data-politics-copy-handoff]').click();
    await page.waitForFunction(() => Boolean(window.__homePacket));
    const packet = JSON.parse(await page.evaluate(() => window.__homePacket));
    assert.deepEqual(packet.events, [wrong, uncertain]);
    assert.deepEqual(packet.last_location, resume);
    assert.equal(packet.schema, 'kianos.politics.return_packet.v1');
    await shot('meaningful-handoff');
    pass('mixed ledger exports only today WRONG/UNCERTAIN and preserves exact location');

    await seed(null, [wrong]); await reloadUnchanged();
    assert.equal(await page.locator('[data-politics-continue]').isVisible(), false);
    assert.equal(await page.locator('.politicsHandoff').isVisible(), true);
    pass('repair-only Home does not invent a resumable task');
    for (const href of ['http://[', 'https://example.invalid/politics/', '/politics-else/', 'javascript:alert(1)', { bad: true }]) {
      await seed({ ...resume, href, title: 'REJECTED_LOCATION_TITLE' }, [wrong]);
      await reloadUnchanged();
      assert.equal(await page.locator('[data-politics-continue]').isVisible(), false);
      assert.equal(await page.locator('.politicsHandoff').isVisible(), true);
      assert.equal((await page.locator('body').innerText()).includes('REJECTED_LOCATION_TITLE'), false);
    }
    await seed({ href: resume.href }, []); await reloadUnchanged();
    assert.equal(await page.locator('[data-politics-continue]').isVisible(), false);
    await page.evaluate(({ lastKey, evidenceKey }) => { localStorage.setItem(lastKey, '{'); localStorage.setItem(evidenceKey, '{'); }, { lastKey, evidenceKey });
    await reloadUnchanged();
    assert.equal(await page.locator('[data-politics-home-tools]').isVisible(), false);
    pass('malformed/external/wrong-lane/unidentified records fail quietly without rewriting evidence');

    await seed(resume, [wrong]);
    await page.evaluate(key => window.dispatchEvent(new StorageEvent('storage', { key })), lastKey);
    assert.equal(await page.locator('[data-politics-continue]').getAttribute('href'), resume.href);
    await seed(null, []); await page.evaluate(() => window.dispatchEvent(new Event('pageshow')));
    assert.equal(await page.locator('[data-politics-home-tools]').isVisible(), false);
    pass('storage and back-forward restoration recalculate actual position');

    await seed(resume, [wrong, uncertain]); await reloadUnchanged();
    for (const width of [1024, 820, 390]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await noOverflow(), true, `Home overflow at ${width}px`);
    }
    await shot('narrow-390');
    pass('populated Home remains usable at 1024/820/390px');
    assert.deepEqual(evidence.errors, []);

    const unavailable = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    try {
      await unavailable.addInitScript(() => {
        const original = Storage.prototype.getItem;
        Storage.prototype.getItem = function(key) {
          if (key.startsWith('kianos-politics-')) throw new DOMException('Blocked for isolated QA', 'SecurityError');
          return original.call(this, key);
        };
      });
      const blocked = await unavailable.newPage(); const errors = [];
      blocked.on('pageerror', error => errors.push(error.message));
      await blocked.goto(home); await blocked.locator('[data-politics-home-ready="true"]').waitFor({ state: 'attached' });
      assert.equal(await blocked.locator('[data-politics-continue]').isVisible(), false);
      assert.equal(await blocked.locator('.subjectEntry:visible').count(), 5);
      assert.deepEqual(errors, []);
    } finally { await unavailable.close(); }
    pass('storage read failure leaves free subject entry intact, without fabricated progress');
  } catch (error) { evidence.failure = error.stack; throw error; }
  finally { fs.writeFileSync(path.join(out, 'home-report.json'), JSON.stringify(evidence, null, 2) + '\n'); await context.close(); }
}
