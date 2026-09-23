#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const PORT=4431;
const BASE='http://127.0.0.1:'+PORT;
const webRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const privateDir=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-skill-reading-'));
const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
let server;

async function startServer(){
  server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port',String(PORT)],{
    cwd:webRoot,env:{...process.env,KIANOS_PRIVATE_DIR:privateDir},stdio:['ignore','pipe','pipe'],
    detached:process.platform!=='win32'
  });
  let output=''; server.stdout.on('data',(c)=>output+=c); server.stderr.on('data',(c)=>output+=c);
  for(let i=0;i<120;i+=1){
    try{const r=await fetch(BASE+'/skills/'); if(r.ok && (await r.text()).includes('17 项能力，按需调用')) return;}catch{}
    if(server.exitCode!=null)throw new Error('SKILL_SERVER_EXITED:'+output.slice(-1500));
    await sleep(100);
  }
  throw new Error('SKILL_SERVER_NOT_READY:'+output.slice(-1500));
}

async function stopServer(){
  if(!server)return;
  try{if(process.platform==='win32')server.kill('SIGTERM');else process.kill(-server.pid,'SIGTERM');}catch{}
  await Promise.race([new Promise((r)=>server.once('exit',r)),sleep(1200)]);
}

const pass=(name)=>console.log('PASS',name);

await startServer();
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on('pageerror',(e)=>errors.push('pageerror:'+e.message));

  await page.goto(BASE+'/skills/',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'17 项能力，按需调用'}).waitFor({state:'visible'});
  await page.getByText('高精力自我调节').first().waitFor({state:'visible'});
  pass('library renders capability-first Skill surface');

  await page.locator('[data-skill-card="high-energy"]').getByRole('link',{name:'进入 Skill'}).click();
  await page.getByRole('heading',{name:'高精力自我调节'}).waitFor({state:'visible'});
  assert.equal(await page.locator('textarea').count(),0);
  assert.equal(await page.getByText('从整张地图到 5 个能力单元').count(),1);
  for(const name of ['总览','状态诊断','瞬时恢复','日内精力配置','周尺度恢复','长期 baseline']){
    assert.ok((await page.getByText(name,{exact:true}).count())>=1,name);
  }
  pass('Skill Home is a reading map, not a cognition workflow');

  await page.goto(BASE+'/skills/high-energy/u1-state-diagnosis/',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:/U1.*状态诊断/}).waitFor({state:'visible'});
  assert.equal(await page.locator('textarea').count(),0);
  assert.equal(await page.locator('[data-attempt-panel]').count(),0);
  assert.equal(await page.locator('[data-chat-review]').count(),0);
  assert.equal(await page.locator('[data-repair-panel]').count(),0);
  assert.equal(await page.locator('.skillReaderMain button').count(),0);
  const nav=await page.locator('.skillReaderNavItem').allInnerTexts();
  assert.ok(nav.some((x)=>x.includes('瞬时恢复')));
  assert.ok(nav.every((x)=>!x.includes('验证')&&!x.includes('重建')&&!x.includes('迁移')));
  pass('reader exposes only learner material and no workflow controls');

  let readerLoads=0;
  page.on('load',()=>readerLoads+=1);
  await page.locator('.skillReaderNav').evaluate((el)=>{
    el.dataset.persistProbe='keep';
    window.__kianosSkillNavProbe=el;
  });
  await page.locator('.skillReaderNav').getByRole('link',{name:'U2 瞬时恢复'}).click();
  await page.waitForURL('**/u2-acute-recovery/');
  await page.getByRole('heading',{name:/U2.*瞬时恢复/}).waitFor({state:'visible'});
  assert.equal(await page.evaluate(()=>window.__kianosSkillNavProbe===document.querySelector('.skillReaderNav')),true);
  assert.equal(await page.locator('.skillReaderNav').getAttribute('data-persist-probe'),'keep');
  assert.equal(readerLoads,0);
  await page.evaluate(()=>history.back());
  await page.waitForURL('**/u1-state-diagnosis/');
  await page.getByRole('heading',{name:/U1.*状态诊断/}).waitFor({state:'visible'});
  assert.equal(await page.evaluate(()=>window.__kianosSkillNavProbe===document.querySelector('.skillReaderNav')),true);
  pass('reader switches content without remounting the sidebar');

  const protectedResponse=await page.goto(BASE+'/skills/high-energy/u1-verify/',{waitUntil:'domcontentloaded'});
  assert.equal(protectedResponse.status(),404);
  const reconstructResponse=await page.goto(BASE+'/skills/high-energy/u1-reconstruct/',{waitUntil:'domcontentloaded'});
  assert.equal(reconstructResponse.status(),404);
  pass('Chat-only cognition assets have no learner webpage routes');

  await page.goto(BASE+'/skills/high-energy/u2-acute-recovery/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(150);
  await page.goto(BASE+'/skills/high-energy/',{waitUntil:'domcontentloaded'});
  const continueHref=await page.locator('[data-skill-continue]').getAttribute('href');
  assert.ok(continueHref?.endsWith('/skills/high-energy/u2-acute-recovery/'));
  pass('lightweight Resume follows last reading position only');

  assert.deepEqual(errors,[]);
  console.log('SKILL_LIBRARY_READING_JOURNEY PASS');
} finally {
  await browser.close();
  await stopServer();
}
