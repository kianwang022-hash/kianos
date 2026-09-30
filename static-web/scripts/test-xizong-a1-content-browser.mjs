import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.env.KIANOS_XIZONG_TEST_BASE_URL || 'http://127.0.0.1:4322';
const url = new URL(base);
assert.ok(['127.0.0.1','localhost'].includes(url.hostname) && url.port !== '4321', 'isolated Candidate required');
const out = path.resolve('../output/playwright/a1-content');
fs.mkdirSync(out,{recursive:true});
const report = {base,evidence:'ISOLATED_BROWSER_NOT_LEARNER_U',learn:[],recall:[],screenshots:[],errors:[]};
const browser = await chromium.launch({headless:true,executablePath:process.env.KIANOS_TEST_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const context = await browser.newContext({viewport:{width:1512,height:982}});
const page = await context.newPage();
page.on('pageerror',error=>report.errors.push(String(error)));
const writer = () => page.waitForFunction(()=>document.hasFocus() && document.visibilityState==='visible' && document.documentElement.dataset.learnerWriter==='active');
const root = page.locator('[data-xizong-v6-block]');
const stage = () => root.locator('[data-study-stage]:visible').first().getAttribute('data-study-stage');
const state = () => page.evaluate(()=>{const id=document.querySelector('[data-xizong-v6-block]').dataset.studyObject;return JSON.parse(localStorage.getItem('kianos-xizong-astro-v2:'+id)||'{}');});
const snap = async name => {await page.screenshot({path:path.join(out,name+'.png')});report.screenshots.push(name);};
try {
  for (let b=1;b<=12;b++) {
    const block = `b${String(b).padStart(2,'0')}`;
    await page.goto(`${base}/xizong/circulation/${block}/`,{waitUntil:'domcontentloaded'});
    await writer();
    const payload = JSON.parse(await page.locator('[data-xizong-learner-object-payload]').textContent());
    assert.equal(await stage(),'block_learn');
    await root.locator('[data-stage-next="logic_group"]').click();
    await page.waitForFunction(()=>document.querySelector('[data-study-stage="source_contact"]')?.hidden===false);
    for (let i=0;i<payload.kps.length;i++) {
      const kp=payload.kps[i]; const id=kp.identity.kpId;
      const card=root.locator('[data-study-stage="source_contact"]:visible [data-learner-kp-companion]');
      await page.waitForFunction(id=>document.querySelector('[data-study-stage="source_contact"]:not([hidden]) [data-learner-kp-companion]')?.dataset.kpId===id,id);
      assert.equal(await card.locator('.xv6KpLearnPrompt p').innerText(),kp.prompt.canonical, id+':Prompt');
      const core=await card.locator('[data-learner-kp-core]').evaluate((node,html)=>{const ref=document.createElement('div');ref.innerHTML=html;return {actual:node.textContent,expected:ref.textContent};},kp.core.html);
      assert.equal(core.actual,core.expected,id+':full Core');
      const header=await root.locator('[data-study-active-kp]').innerText();
      assert.ok(header.includes(kp.identity.displayId)&&header.includes(kp.identity.title),id+':header');
      if(kp.source.locator)assert.ok(header.includes(kp.source.locator),id+':source');
      if(kp.outline.locator)assert.ok(header.includes(kp.outline.locator),id+':outline');
      assert.ok((await root.locator('[data-study-group-rail] .xzLogicGroupKp.current').innerText()).includes(kp.identity.displayId),id+':left map');
      for(const attention of kp.attention) {
        const node=page.locator(`[data-xizong-aux-surface]:visible [data-learner-asset-id="${attention.id}"]`);
        assert.equal(await node.isVisible(),true,id+':Attention '+attention.id);
        assert.ok((await node.innerText()).includes(attention.cue));
      }
      for(const connection of kp.connection.outgoing) {
        const node=page.locator(`[data-attention-section="FUTURE_CONNECTION"] [data-learner-asset-id="${connection.id}"]`);
        assert.equal(await node.isVisible(),true,id+':Connection');
        assert.ok((await node.innerText()).includes(connection.cue));
        assert.equal(await node.locator('a').getAttribute('href'),connection.other.href);
        assert.ok((await page.request.get(base+connection.other.href)).ok(),id+':target resolves');
      }
      for(const asset of [...kp.precision,...kp.visual,...kp.extension]) {
        assert.equal(await page.locator(`[data-xizong-aux-surface]:visible [data-learner-asset-id="${asset.id}"]`).isVisible(),true,id+':support '+asset.id);
      }
      const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+2,header:document.querySelector('.portedStudyExtension > header')?.getBoundingClientRect().height}));
      assert.equal(geometry.overflow,false,id+':horizontal overflow');
      const current=await state();
      assert.equal(current.kpIndex,i,id+':native position');
      assert.equal(Object.keys(current.ratings||{}).length,0,id+':no Recall debt');
      assert.equal(Object.values(current.learned||{}).filter(Boolean).length,0,id+':no learning manufactured');
      report.learn.push({kp:id,attention:kp.attention.length,connection:kp.connection.outgoing.length});
      if((b===1&&[8,23,26,29].includes(i))||(b===2&&i===10)||(b===11&&i===13)||(b===12&&i===4)) await snap(id);
      if(b===1&&i===23) {
        assert.match(await card.locator('.xv6KpLearnPrompt p').innerText(),/核心压力梯度.*抽吸端 6 个因素.*送血端 7 个因素/);
        assert.ok((await page.locator('[data-attention-section="CURRENT_TAKEAWAY"]').innerText()).includes('持续紧张性收缩'));
        await page.setViewportSize({width:1180,height:820});await page.waitForTimeout(350);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
        await snap(id+'-landscape');await page.setViewportSize({width:1512,height:982});await page.waitForTimeout(350);
        await page.locator('[data-study-timer-today]').click();await page.waitForURL(/\/steward\/?$/);
        await page.locator('[data-study-timer-today]').click();await page.waitForURL(/\/circulation\/b01\/?$/);await writer();
        await page.waitForFunction(()=>document.querySelector('[data-learner-kp-companion="source_contact"]')?.dataset.kpId==='circulation-b01-kp24');
        assert.equal((await state()).kpIndex,23,'Today return');
        await page.reload({waitUntil:'domcontentloaded'});await writer();
        assert.equal((await state()).kpIndex,23,'reload Resume');
        assert.ok((await root.locator('[data-study-active-kp]').innerText()).includes('KP24'));
      }
      if(i+1<payload.kps.length) await root.locator('[data-companion-next="source_contact"]').click();
    }
    if(b!==1)continue;
    await root.locator('[data-source-contact-done]').click();
    if(await stage()==='ttsx_checkpoint')await root.locator('[data-ttsx-continue]').click();
    const recalled=new Set();
    for(let safety=0;await stage()==='kp_recall'&&safety<40;safety++) {
      const card=root.locator('[data-kp-recall-card]:visible');
      const id=await card.getAttribute('data-kp-id');const kp=payload.kps.find(k=>k.identity.kpId===id);
      assert.equal(await card.locator('[data-kp-answer]').isVisible(),false,id+':Front Core protected');
      for(const row of [...kp.visual,...kp.precision,...kp.connection.outgoing]) {
        if(row.answerBearing||row.displayPolicy?.timing==='POST_REVEAL') assert.equal(await page.locator(`[data-xizong-aux-surface]:visible [data-learner-asset-id="${row.id}"]`).count(),0,id+':Front support protection');
      }
      await card.locator('[data-kp-reveal]').click();
      assert.equal(await card.locator('[data-kp-answer]').isVisible(),true,id+':Reveal');
      const core=await card.locator('[data-kp-answer]').evaluate((node,html)=>{const ref=document.createElement('div');ref.innerHTML=html;return {actual:node.textContent.replace(/\s/g,''),expected:ref.textContent.replace(/\s/g,'')};},kp.core.html);
      assert.ok(core.actual.includes(core.expected),id+':Reveal full Core');
      for(const row of [...kp.visual,...kp.precision,...kp.connection.outgoing]) assert.equal(await page.locator(`[data-xizong-aux-surface]:visible [data-learner-asset-id="${row.id}"]`).isVisible(),true,id+':Reveal support');
      await card.locator('[data-rating="known"]').click();recalled.add(id);report.recall.push(id);
      await page.waitForFunction(id=>{const active=document.querySelector('[data-study-stage="kp_recall"]');return active?.hidden || active?.querySelector('[data-kp-recall-card]:not([hidden])')?.dataset.kpId!==id;},id);
    }
    assert.equal(recalled.size,32,'all B1 Recall');
    assert.equal(await stage(),'block_recall','continuous Source never reopens between LGs');
    await root.locator('[data-block-recall-reveal]').click();
    await root.locator('[data-block-recall-complete]').click();
    await root.locator('[data-block-complete]').click();
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')||'{}').releasedBlocks?.['circulation-b01']);
    const debt=await page.evaluate(()=>{
      const current=JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')||'{}');
      const evidence=JSON.parse(localStorage.getItem('kianos-xizong-memory-review-v2:xizong:circulation-b01')||'{}');
      return {cards:current.cards,attention:current.attention,reviewPlan:evidence.reviewPlan,memory:evidence.memory};
    });
    assert.ok(!/b01-c0[1-6]-/.test(JSON.stringify(debt)),'Connection must not become a Memory card or review obligation');
    assert.equal(Object.keys(debt.cards).filter(id=>id.startsWith('core:circulation-b01-')).length,32);
  }
  assert.equal(report.learn.length,312);assert.deepEqual(report.errors,[]);
  report.status='PASS';console.log(`PASS A1 real surface: ${report.learn.length} KP Learn, ${report.recall.length} B1 Recall, 12 reviewed Connections, KP24 Today/Resume`);
} catch(error) {report.status='FAIL';report.error=String(error.stack||error);await snap('failure');throw error;}
finally {fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
