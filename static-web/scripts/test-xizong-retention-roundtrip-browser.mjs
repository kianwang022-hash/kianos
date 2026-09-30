import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {loadReviewedRetentionConnections} from '../src/lib/xizongPathways.mjs';

const external=process.env.KIANOS_XIZONG_TEST_BASE_URL;
const base=external||'http://127.0.0.1:4337';
const target=new URL(base);
assert.ok(['localhost','127.0.0.1'].includes(target.hostname)&&target.port!=='4321','isolated runtime required');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-retention-'));
const server=external?null:spawn('npm',['run','dev','--','--host','127.0.0.1','--port','4337'],{
  stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32',
  env:{...process.env,KIANOS_PRIVATE_DIR:path.join(tmp,'private'),KIANOS_CONTROL_DIR:path.join(tmp,'control')}
});
let logs='';server?.stdout.on('data',b=>logs+=b);server?.stderr.on('data',b=>logs+=b);
fs.mkdirSync('.qa',{recursive:true});
const report={evidence:'ISOLATED_NATIVE_BROWSER_NOT_LEARNER_U',targets:[],source:[],errors:[]};
let browser;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
try{
  for(let i=0;i<150;i++){
    try{if((await fetch(base+'/xizong/circulation/b01/')).ok)break;}catch{}
    if(i===149)throw Error('runtime not ready\n'+logs.slice(-6000));
    await delay(500);
  }
  browser=await chromium.launch({headless:true,...(process.env.KIANOS_TEST_CHROME?{executablePath:process.env.KIANOS_TEST_CHROME}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();page.setDefaultTimeout(20000);
  page.on('pageerror',e=>report.errors.push(String(e)));
  const writer=()=>page.waitForFunction(()=>document.hasFocus()&&document.visibilityState==='visible'&&document.documentElement.dataset.learnerWriter==='active');
  const all=loadReviewedRetentionConnections();
  const destinations=[...new Set(all.map(r=>r.target.href))];
  // Start at each TARGET with clean state, rather than just checking HTTP links.
  for(const route of destinations){
    const expected=all.filter(r=>r.target.href===route);
    await page.goto(base+route,{waitUntil:'domcontentloaded'});await writer();
    if(expected[0].target.block_id){
      const root=page.locator('[data-xizong-v6-block]');
      for(const row of expected){
        const card=page.locator('[data-xizong-aux-surface]:visible [data-learner-asset-id="'+row.id+'"]');
        assert.equal(await card.isVisible(),true,row.id+': target first entry');
        assert.ok((await card.innerText()).includes('本章串联回收'));
        assert.equal(await card.locator('a').getAttribute('href'),row.source.href);
      }
      await root.locator('[data-stage-next="logic_group"]').click();
      await page.waitForFunction(()=>document.querySelector('[data-study-stage="source_contact"]')?.hidden===false);
      await page.reload({waitUntil:'domcontentloaded'});await writer();
      for(const row of expected)assert.equal(await page.locator('[data-xizong-aux-surface]:visible [data-learner-asset-id="'+row.id+'"]').isVisible(),true,row.id+': direct Resume');
      await root.locator('[data-source-contact-done]').click();
      if(await root.locator('[data-study-stage="ttsx_checkpoint"]').isVisible())await root.locator('[data-ttsx-continue]').click();
      const recall=root.locator('[data-kp-recall-card]:visible');
      await recall.waitFor({state:'visible'});
      for(const row of expected)assert.equal(await page.locator('[data-xizong-aux-surface]:visible [data-learner-asset-id="'+row.id+'"]').count(),0,row.id+': Front protection');
      await recall.locator('[data-kp-reveal]').click();
      for(const row of expected)assert.equal(await page.locator('[data-xizong-aux-surface]:visible [data-learner-asset-id="'+row.id+'"]').isVisible(),true,row.id+': Reveal context');
    }else{
      for(const row of expected){
        const card=page.locator('[data-retention-connection-id="'+row.id+'"]');
        assert.equal(await card.isVisible(),true,row.id+': System entry');
        assert.ok((await card.innerText()).includes(row.seed));
      }
      await page.locator('[data-system-view-button="framework"]').click();
      for(const row of expected)assert.equal(await page.locator('[data-retention-connection-id="'+row.id+'"]').isVisible(),true,row.id+': System framework');
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,route+': overflow');
    await page.screenshot({path:'.qa/retention-'+route.split('/').filter(Boolean).join('-')+'.png'});
    report.targets.push({route,ids:expected.map(r=>r.id),pass:true});
  }
  await page.goto(base+'/xizong/circulation/b01/',{waitUntil:'domcontentloaded'});await writer();
  const root=page.locator('[data-xizong-v6-block]');
  await root.locator('[data-stage-next="logic_group"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-study-stage="source_contact"]')?.hidden===false);
  for(let i=0;i<23;i++)await root.locator('[data-companion-next="source_contact"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-learner-kp-companion="source_contact"]')?.dataset.kpId==='circulation-b01-kp24');
  assert.match(await page.locator('[data-study-stage="source_contact"]:visible .xv6KpLearnPrompt p').innerText(),/核心压力梯度.*抽吸端 6 个因素.*送血端 7 个因素/);
  const expected=['b01-c07-venous-hf-to-b11','b01-c08-ischemic-relaxation-to-b11','b01-c09-myocardial-pericardial-filling-to-b8','b01-c10-volume-posture-to-b12','b01-c11-venous-nitrate-to-b6'];
  for(const id of expected){assert.equal(await page.locator('[data-attention-section="FUTURE_CONNECTION"] [data-learner-asset-id="'+id+'"]').isVisible(),true,id+': independently expected P128 hook');report.source.push(id);}
  assert.ok((await page.locator('[data-attention-section="CURRENT_TAKEAWAY"]').innerText()).includes('持续紧张性收缩'));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'KP24 overflow');
  await page.screenshot({path:'.qa/retention-kp24-p128.png'});
  const debt=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>/memory/i.test(k))));
  assert.ok(!/b01-c|b02-c/.test(JSON.stringify(debt)),'not a Memory task');
  assert.deepEqual(report.errors,[]);
  report.status='PASS';console.log('PASS native browser retention: '+report.targets.length+' target entries/Resume/Reveal; KP24 P128 notices');
}catch(e){report.status='FAIL';report.error=String(e.stack||e);throw e;}
finally{
  fs.writeFileSync('.qa/xizong-retention-roundtrip-browser.json',JSON.stringify(report,null,2)+'\n');
  fs.writeFileSync('.qa/xizong-retention-server.log',logs);
  await browser?.close();
  if(server){try{process.kill(-server.pid,'SIGTERM')}catch{server.kill('SIGTERM')}}
  fs.rmSync(tmp,{recursive:true,force:true});
}
