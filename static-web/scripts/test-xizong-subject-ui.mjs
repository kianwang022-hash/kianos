import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { marked } from 'marked';
import { loadXizongSystem, loadXizongBlock } from '../src/lib/xizong.mjs';
import { loadXizongPathways } from '../src/lib/xizongPathways.mjs';
import { loadXizongFrame, xizongFrameView } from '../src/lib/xizongFrameProjection.mjs';
import { projectBlockLearn, projectKpCore } from '../src/lib/xizongProjection.mjs';

// Called AFTER the existing A2 journey; disposable contexts, never learner U.
export async function testXizongSubjectUi({ browser, base, auditDir }) {
  const out = path.join(auditDir, 'subject-ui'); fs.mkdirSync(out, { recursive: true });
  const report = { scope: 'A1/A2/A3 whole-subject readability + affected safety', independence: 'SELF', learnerU: 'UNTESTED', state: 'DISPOSABLE_QA', checks: [], views: [], fonts: [], errors: [], accounting: { systems: 0, blocks: 0, kps: 0, groups: 0, coreTextEqualities: 0, guideTextEqualities: 0 } };
  const pass = name => { report.checks.push(name); console.log('PASS Xizong UI:', name); };
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage(); page.setDefaultTimeout(12000);
  page.on('pageerror', error => report.errors.push(error.message));
  const normalize = value => String(value || '').replace(/\s+/g, '');
  const ready = async () => { await page.evaluate(() => document.fonts.ready); await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))); };
  const go = async url => { await page.goto(base + url); await ready(); };
  const snap = async (name, widths = [1440, 1728, 1024, 390]) => {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 }); await ready();
      const bounds = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
      assert.ok(bounds.scroll <= bounds.width + 1, `${name} horizontal page overflow ${width}: ${bounds.scroll}`);
      await page.screenshot({ path: path.join(out, `${name}-${width}.png`), fullPage: false });
      report.views.push({ name, width, scrollWidth: bounds.scroll });
    }
    await page.setViewportSize({ width: 1440, height: 1000 }); await ready();
  };
  const textEqual = async (selector, html, label) => {
    const result = await page.evaluate(({ selector, html }) => {
      const expected = document.createElement('div'); expected.innerHTML = html;
      const normalize = value => String(value || '').replace(/\s+/g, '');
      return { actual: normalize(document.querySelector(selector)?.textContent), expected: normalize(expected.textContent) };
    }, { selector, html });
    assert.ok(result.expected.length > 0, `empty expected ${label}`);
    assert.equal(result.actual, result.expected, label);
  };
  const fontProbe = async (selector, minSize, label) => {
    const element = page.locator(selector).first();
    const style = await element.evaluate(e => ({ size: parseFloat(getComputedStyle(e).fontSize), weight: getComputedStyle(e).fontWeight, family: getComputedStyle(e).fontFamily, text: e.textContent.trim().slice(0, 60) }));
    assert.ok(style.size >= minSize, `${label} too small: ${style.size}`); assert.ok(style.text);
    const cdp = await context.newCDPSession(page);
    try {
      await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
      const doc = await cdp.send('DOM.getDocument');
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector });
      const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
      assert.ok(fonts.length > 0, `no real glyph evidence ${label}`);
      assert.ok(fonts.every(f => !/serif|mincho|songti|times/i.test(f.familyName)), `serif glyph fallback ${label}`);
      report.fonts.push({ label, ...style, fonts });
    } finally { await cdp.detach(); }
  };
  const studyKey = id => `kianos-xizong-astro-v2:xizong:${id}`;
  const read = key => page.evaluate(key => JSON.parse(localStorage.getItem(key) || 'null'), key);
  const stateStage = () => page.locator('[data-study-stage]:visible').getAttribute('data-study-stage');
  const sourceHashes = {};
  try {
    await go('/xizong/');
    assert.equal(await page.locator('[data-site-resume-subject=xizong]').isVisible(), false);
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    assert.equal(await page.locator('.subjectEntries>section').count(), 3);
    await snap('home'); await fontProbe('.subjectEntries p', 19, 'home');
    pass('empty Home preserves three free System routes, no invented Resume or learner evidence');

    const representative = new Set(['circulation-b01','circulation-b07','circulation-b10','circulation-b11','respiratory-r01','respiratory-r02','urinary-b01','urinary-b05']);
    for (const sid of ['circulation', 'respiratory', 'urinary']) {
      const system = loadXizongSystem(sid); const frame = loadXizongFrame(sid); const pathways = loadXizongPathways(system);
      report.accounting.systems++; sourceHashes[system.sourcePath] = system.sourceHash;
      await go(`/xizong/${sid}/`);
      const systemText = normalize(await page.locator('.xv6SystemMain').innerText());
      assert.ok(systemText.includes(normalize(system.mission)));
      for (const item of system.coreVariables) {
        for (const text of typeof item === 'string' ? [item] : [item.id, item.label, item.role].filter(Boolean)) {
          assert.ok(systemText.includes(normalize(text)), `${sid} missing variable meaning ${text}`);
        }
      }
      for (const item of [...system.coreRelations, ...system.judgmentAxes]) assert.ok(systemText.includes(normalize(item)), `${sid} missing relation ${item}`);
      assert.equal(await page.locator('[data-system-block]').count(), system.blocks.length);
      const bindings = xizongFrameView(frame, 'SYSTEM_GUIDE');
      assert.ok(bindings.length > 0);
      await snap(`system-${sid}`); await fontProbe('.xv6Mother', 20, `${sid} System prose`);
      for (const [id, view] of Object.entries(pathways?.systemFailureViews || {})) {
        const button = page.locator(`[data-failure-id="${id}"]`); if (!await button.count()) continue;
        await button.click();
        assert.equal(await button.getAttribute('aria-pressed'), 'true');
        const active = await page.locator('[data-spine-node].mechanism-active').evaluateAll(nodes => nodes.map(e => Number(e.dataset.spineNode)));
        assert.deepEqual(active, [...(view.focus_nodes || [])].map(Number).sort((a,b) => a-b), `reviewed focus ${sid}/${id}`);
      }
      if (Object.keys(pathways?.systemFailureViews || {}).length) await snap(`failure-${sid}`, [1440]);
      // First pass must not unlock later Recall just because the UI is built.
      await page.locator('[data-xizong-later-stage]>summary').click();
      await page.locator('[data-start-recall]').click();
      assert.equal(await page.locator('[data-recall-dialog]').isVisible(), false);
      await page.evaluate(() => sessionStorage.setItem(`kianos-xizong-system-selection:${document.querySelector('[data-xizong-system]').dataset.xizongSystem}`, 'not-a-number'));
      await page.reload(); await ready();
      assert.equal(await page.locator('[data-system-block].selected').getAttribute('data-system-block'), '0');
      pass(`${sid}: full variable identities/roles, relations, Current-only failure focus and closed later-stage gate`);

      for (const blockMeta of system.blocks) {
        const block = loadXizongBlock(sid, blockMeta.slug); const blockFrame = loadXizongFrame(block.blockId);
        sourceHashes[block.sourcePath] = block.sourceHash;
        report.accounting.blocks++; report.accounting.kps += block.kpRecords.length; report.accounting.groups += block.logicGroups.length;
        await go(`/xizong/${sid}/${block.slug}/`);
        assert.equal(await stateStage(), 'block_learn');
        assert.equal(await page.locator('[data-group-target]').count(), block.logicGroups.length);
        assert.equal(await page.locator('[data-kp-recall-card]').count(), block.kpRecords.length);
        assert.equal(await page.locator('.xv6BlockOrientation').evaluate(e => e.tagName), 'SECTION');
        assert.ok(xizongFrameView(blockFrame, 'BLOCK_ORIENT').length > 0);
        await textEqual('.xv6BlockOrientation .portedStudyArticle', marked.parse(projectBlockLearn(block.blockLearnMarkdown), { gfm: true }), `${block.blockId} Guide`);
        report.accounting.guideTextEqualities++;
        for (const kp of block.kpRecords) {
          await textEqual(`[data-kp-id="${kp.kpId}"] [data-kp-answer] .markdown`, marked.parse(projectKpCore(kp.detailMarkdown), { gfm: true }), `${kp.kpId} complete projected Core`);
          report.accounting.coreTextEqualities++;
        }
        assert.equal(await page.locator('[data-study-extension]').isVisible(), false);
        if (representative.has(block.blockId)) {
          await page.evaluate(() => scrollTo(0,0)); await snap(`guide-${block.blockId}`);
          await fontProbe('.portedStudyArticle p', 20, `${block.blockId} Guide prose`);
          const geometry = await page.locator('.portedStudyLayout').evaluate(e => {
            const r = sel => e.querySelector(sel).getBoundingClientRect();
            return { chain: r('.portedStudyChain').height, main: r('.portedStudyMain').width, rail: r('.portedStudyOutline').width, chainTop: r('.portedStudyChain').top, mainTop: r('.portedStudyMain').top };
          });
          assert.ok(geometry.chain < 145 && geometry.chainTop < geometry.mainTop && geometry.main > 800, `${block.blockId} thin state line / dominant Main: ${JSON.stringify(geometry)}`);
        }
      }
    }
    pass('all 38 Guides and 805 projected Core bodies preserve full text; LG maps, bindings and first-view After-Learn timing retained');

    for (const [sid, slug] of [['circulation','b02'],['respiratory','r01'],['urinary','b01']]) {
      const block = loadXizongBlock(sid, slug); const key = studyKey(block.blockId);
      await go(`/xizong/${sid}/${slug}/`);
      // A modified Enter must never acknowledge Lecture contact.
      await page.locator('[data-stage-next=logic_group]').click();
      const beforeModified = await read(key);
      await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', ctrlKey: true, bubbles: true })));
      assert.deepEqual(await read(key), beforeModified);
      await page.locator('[data-enter-group]').click();
      assert.equal(await stateStage(), 'kp_learn');
      assert.equal(await page.locator('.xv6GroupKpMap').getAttribute('open'), '');
      assert.match(await page.locator('[data-group-lecture-source]').innerText(), /MarginNote/);
      await snap(`lecture-${sid}`, [1440, 390]);
      await page.locator('[data-stage-target=kp_recall]').evaluate(e => e.click());
      assert.equal(await stateStage(), 'kp_learn');
      await page.locator('[data-kp-reveal]').first().evaluate(e => e.click());
      assert.equal(await page.locator('[data-kp-answer]').first().isVisible(), false);
      await page.locator('[data-group-lecture-done]').click(); await ready();
      assert.equal(await stateStage(), 'kp_recall');
      const group = block.logicGroups[0]; const firstKp = block.kpRecords.find(kp => kp.kpId === group.kpIds[0]);
      const card = page.locator('[data-kp-recall-card]:visible');
      assert.equal(await card.getAttribute('data-kp-id'), firstKp.kpId);
      assert.equal(await page.locator('[data-xizong-v6-block]').getAttribute('data-frame-neutral'), 'true');
      const visible = await page.locator('body').ariaSnapshot();
      assert.ok(!visible.includes(firstKp.title), `${sid} Front leaked title`);
      assert.equal(await page.locator('[data-xizong-study-dock]').isVisible(), false);
      const beforeRating = await read(key); const extKey = `kianos-xizong-memory-review-v2:xizong:${block.blockId}`;
      const beforeEvidence = (await read(extKey))?.evidenceHistory || [];
      await page.evaluate(() => document.activeElement?.blur());
      for (const value of ['1','2','3','4']) await page.keyboard.press(value);
      await card.locator('[data-rating=known]').evaluate(e => e.click());
      assert.deepEqual((await read(key)).ratings, beforeRating.ratings, `${sid} hidden numeric/direct rating must not write`);
      assert.deepEqual((await read(extKey))?.evidenceHistory || [], beforeEvidence, `${sid} hidden rating must not append evidence`);
      await page.evaluate(() => scrollTo(0,0)); await snap(`recall-front-${sid}`);
      for (const [index, id] of group.kpIds.entries()) {
        const active = page.locator('[data-kp-recall-card]:visible');
        assert.equal(await active.getAttribute('data-kp-id'), id);
        await active.locator('[data-kp-reveal]').click(); await ready();
        assert.equal(await page.locator('[data-xizong-v6-block]').getAttribute('data-frame-neutral'), 'false');
        if (index === 0) {
          await snap(`recall-reveal-${sid}`);
          await fontProbe('[data-kp-recall-card]:not([hidden]) [data-kp-answer] p', 20, `${sid} revealed Core prose`);
        }
        await active.locator(`[data-rating=${index===0?'fuzzy':'mastered'}]`).click();
        await page.waitForTimeout(180);
      }
      assert.equal(await stateStage(), 'group_close');
      assert.ok(normalize(await page.locator('[data-group-close-closure]').innerText()).includes(normalize(group.closure)));
      await snap(`group-close-${sid}`, [1440, 390]);
      await page.locator('[data-group-close-next]').click();
      assert.equal(await stateStage(), 'logic_group');
      const saved = await read(key); await page.reload(); await ready();
      assert.equal((await read(key)).groupIndex, saved.groupIndex);
      assert.deepEqual((await read(key)).ratings, saved.ratings);
      await go('/xizong/');
      assert.ok((await page.locator('[data-site-resume-subject=xizong]').getAttribute('href')).includes(`/${sid}/${slug}/`));
      await page.locator('[data-site-resume-subject=xizong]').click(); await ready();
      assert.equal((await read(key)).groupIndex, saved.groupIndex);
      pass(`${sid}: source -> guarded Front -> complete Reveal -> real group ratings -> closure/refresh/exact Home return`);
    }

    for (const sid of ['circulation','respiratory','urinary']) {
      const system = loadXizongSystem(sid);
      await go(`/xizong/${sid}/`);
      // Deliberate disposable prerequisite fixture, not a claim to real learning.
      await page.evaluate(blocks => blocks.forEach(b => localStorage.setItem(`kianos-xizong-astro-v2:xizong:${b.blockId}`, JSON.stringify({ completed: true }))), system.blocks);
      await page.locator('[data-xizong-later-stage]>summary').click();
      await page.locator('[data-start-recall]').click();
      assert.equal(await page.locator('[data-recall-reveal]').isVisible(), false);
      await snap(`system-recall-front-${sid}`, [1440, 390]);
      await page.locator('[data-reveal-recall]').click(); await snap(`system-recall-reveal-${sid}`, [1440]);
      await page.locator('[data-complete-recall]').click();
      const payload = await page.locator('[data-sweep-payload]').evaluate(e => JSON.parse(e.textContent));
      const holdout = Math.max(...payload.years.map(Number));
      await page.fill('[data-holdout-input]', String(holdout)); await page.click('[data-save-holdout]'); await page.click('[data-start-sweep]');
      const key = `kianos:xizong:system-question-sweep:${sid}:v1`;
      const qmap = new Map(payload.questions.map(q => [q.questionId,q]));
      const current = async () => qmap.get((await read(key)).activeQuestionId);
      const q = await current(); assert.notEqual(q.year, holdout);
      await snap(`question-${sid}`); await fontProbe('[data-question-stem]', 22, `${sid} question stem`);
      const selectionBefore = await page.evaluate(sid => sessionStorage.getItem(`kianos-xizong-system-selection:${sid}`), sid);
      await page.evaluate(() => document.activeElement?.blur()); await page.keyboard.press('ArrowDown');
      assert.equal(await page.evaluate(sid => sessionStorage.getItem(`kianos-xizong-system-selection:${sid}`), sid), selectionBefore, `${sid} System key stole question context`);
      const incorrect = q.options.find(o => !q.correctAnswer.includes(o.label)); assert.ok(incorrect);
      await page.locator(`[data-question-options] [data-option="${incorrect.label}"]`).click();
      await page.locator('[data-submit-answer]').click();
      await page.locator('[data-answer-panel]').waitFor({ state:'visible' });
      const first = (await read(key)).attemptHistory[0];
      await snap(`wrong-${sid}`, [1440, 390]);
      await page.locator('[data-sweep-mark]').click(); assert.deepEqual((await read(key)).attemptHistory[0], first);
      await page.reload(); await ready(); assert.equal((await current()).questionId, q.questionId);
      await page.selectOption('[data-sweep-visibility]', 'hidden'); await page.check('[data-sweep-fast]');
      assert.equal(await page.locator('[data-answer-panel]').isVisible(), false);
      assert.equal(await page.locator('.xseSweepStats').isVisible(), false);
      assert.equal(await page.locator('[data-xizong-repair-return]').isVisible(), false);
      assert.equal(await page.locator('[data-sweep-map] .wrong').count(), 0);
      assert.deepEqual((await read(key)).attemptHistory[0], first);
      await snap(`hidden-fast-${sid}`, [1440]);
      pass(`${sid}: gated System Recall / holdout / readable question / wrong evidence / marking / exact refresh / hidden-result safety`);
    }

    // Keep the original full Block closure/weak-Memory test unchanged and run it.
    const legacyOut = path.resolve('../output/playwright/issue148'); fs.mkdirSync(legacyOut,{recursive:true});
    await new Promise((resolve,reject) => {
      const child=spawn(process.execPath,['scripts/test-site-block-closure.mjs'],{env:{...process.env,SITE_FRAME_URL:base},stdio:'inherit'});
      child.on('error',reject); child.on('exit',code => code===0?resolve():reject(new Error(`EXISTING_BLOCK_CLOSURE_FAILED:${code}`)));
    });
    for(const name of ['block-closure-browser.json','xizong-block-recall-front.png','xizong-a2-core.png']) {
      const source=path.join(legacyOut,name); if(fs.existsSync(source)) fs.copyFileSync(source,path.join(out,name));
    }
    pass('unchanged complete Block closure / failed contact save / weak Memory admission and stable exit regression');
    assert.deepEqual(report.errors, []);
    assert.deepEqual(report.accounting, { systems:3, blocks:38, kps:805, groups:224, coreTextEqualities:805, guideTextEqualities:38 });
    report.status='PASS';
  } catch (error) {
    report.status='FAIL'; report.failure=error.stack;
    await page.screenshot({path:path.join(out,'failure.png'),fullPage:false}).catch(()=>{});
    throw error;
  } finally {
    report.currentSourceHashes=sourceHashes;
    const files=['src/styles/xizong-readable.css','src/layouts/Base.astro','src/components/XizongSystemV6.astro','src/components/XizongFrameValue.astro','src/components/XizongRuntimeStageGuard.astro','src/components/XizongStudyEnhancer.astro','scripts/test-xizong-subject-ui.mjs','scripts/test-xizong-a2-functional-journey.mjs'];
    report.sourceSha256=Object.fromEntries(files.map(file=>[file,createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
    report.githubSha=process.env.GITHUB_SHA||null;
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
    await context.close();
  }
}
