import assert from 'node:assert/strict';import fs from'node:fs';import path from'node:path';import{spawn}from'node:child_process';import{chromium}from'playwright';import{buildPoliticsPracticeCatalogCurrent}from'../src/lib/politicsPractice.mjs';import{practiceReady}from'../src/lib/politicsPracticeView.mjs';
const base=process.env.SITE_FRAME_URL||'http://127.0.0.1:4368',out=path.resolve('../output/playwright/issue148/politics-frame');fs.mkdirSync(out,{recursive:true});
const server=process.env.SITE_FRAME_URL?null:spawn(process.execPath,['node_modules/astro/astro.js','preview','--host','127.0.0.1','--port','4368'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const report={scope:'Current five native frames -> Workbench; isolated state; SELF',checks:[],errors:[]};let browser;
try{
 for(let i=0;i<60;i++){try{if((await fetch(base+'/politics/')).ok)break}catch{}await sleep(250)}
 const catalog=buildPoliticsPracticeCatalogCurrent('/');browser=await chromium.launch();
 for(const subject of ['marxism','mao','history','xi','ethics_law']){
  if(process.env.POLITICS_FRAME_SUBJECT&&process.env.POLITICS_FRAME_SUBJECT!==subject)continue;
  const q=catalog.questions.find(q=>q.subject===subject&&practiceReady(q));assert.ok(q);
  const context=await browser.newContext({viewport:{width:1440,height:900}}),p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));
  await p.goto(base+q.unitHref);await p.locator('[data-politics-frame]').waitFor();
  const entry=p.locator(`[data-practice-unit-entry="${q.unitKey}"]`);await entry.waitFor({state:'visible'});
  assert.equal(await p.locator('[data-politics-quiz]').count(),0);assert.ok(await p.locator('[data-frame-unit]:visible [data-projection-role]').count()>0); assert.ok((await p.locator('[data-frame-unit]:visible .framePrimary').innerText()).trim());
  await p.locator('[data-frame-handoff]:visible').click();await p.screenshot({path:path.join(out,subject+'-native.png')});
  await entry.click();await p.check('[data-learned-scope]');await p.click('[data-start-session]');await p.locator('[data-question-card]').waitFor({state:'visible'});
  const session=await p.evaluate(()=>JSON.parse(localStorage.getItem('kianos-politics-practice-session-v1')));assert.ok(session.ids.every(id=>catalog.questions.find(q=>q.id===id).unitKey===q.unitKey));
  await p.reload();assert.equal(await p.locator('[data-submitted-result]').isVisible(),false);
  report.checks.push(subject+' native Current geometry / Chengfeng anchor / exact NU scope / clean persistence');console.log('PASS',report.checks.at(-1));await context.close();
 }
 if(process.env.POLITICS_FRAME_FORMAL==='1')await new Promise((resolve,reject)=>{const child=spawn(process.execPath,['scripts/test-politics-practice-formal.mjs'],{stdio:'inherit',env:{...process.env,PRACTICE_FORMAL_URL:base,PRACTICE_FORMAL_OUT:path.join(out,'formal')}});child.on('exit',code=>code===0?resolve():reject(Error('FORMAL_REGRESSION_'+code)))});
 assert.deepEqual(report.errors,[]);
}catch(e){report.failure=e.stack;throw e}finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM')}
