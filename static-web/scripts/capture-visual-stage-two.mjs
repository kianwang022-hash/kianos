import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

// Isolated browser journeys, never private learner state or U evidence.
const root=path.resolve('dist');
const out=path.resolve('../visual-stage-two');
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(f!==root&&!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
  if(!fs.existsSync(f)){res.writeHead(404).end();return;}
  res.setHeader('content-type',mime[path.extname(f)]||'application/octet-stream');
  fs.createReadStream(f).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true});
const cases=[
 ['politics-home','/politics/'],
 ['politics-marxism','/politics/marxism/ch00/'],
 ['politics-history','/politics/history/ch01/'],
 ['politics-mao','/politics/mao/ch01/'],
 ['politics-xi','/politics/xi/ch01/'],
 ['politics-ethics','/politics/ethics_law/ch01/'],
 ['politics-history-unit','/politics/history/ch01/#unit-1'],
 ['politics-mao-unit','/politics/mao/ch02/#unit-2'],
 ['politics-xi-unit','/politics/xi/ch02/#unit-1'],
 ['politics-ethics-unit','/politics/ethics_law/ch05/#unit-1'],
 ['politics-practice','/politics/practice/'],
 ['politics-attempt','/politics/practice/','attempt'],
 ['politics-result','/politics/practice/','result'],
 ['xizong-home','/xizong/'],
 ['xizong-system','/xizong/circulation/'],
 ['xizong-block','/xizong/circulation/b01/'],
 ['xizong-logic','/xizong/circulation/b01/','logic'],
 ['xizong-lecture','/xizong/circulation/b01/','lecture'],
 ['xizong-recall','/xizong/circulation/b01/','recall'],
 ['xizong-reveal','/xizong/circulation/b01/','reveal'],
 ['xizong-a2','/xizong/respiratory/'],
 ['xizong-a3','/xizong/urinary/'],
 ['politics-narrow','/politics/history/ch01/',null,390],
 ['xizong-narrow','/xizong/circulation/b01/',null,390]
];
const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),environment:'Linux Chromium + Noto Sans CJK; not Mac acceptance; synthetic state only',pages:[],failures:[]};
try{
 for(const [name,route,state,width=1536] of cases){
  const ctx=await browser.newContext({viewport:{width,height:864},locale:'zh-CN'});
  const p=await ctx.newPage();p.setDefaultTimeout(8000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
  try{
   const res=await p.goto(origin+route,{waitUntil:'networkidle'});if(!res?.ok())throw Error(`HTTP ${res?.status()}`);
   await p.evaluate(()=>document.fonts.ready);
   if(state==='attempt'||state==='result'){
    await p.locator('[data-learned-scope]').check();await p.locator('[data-start-session-inline]').click();
    if(state==='result'){await p.locator('[data-question-options] button').first().click();await p.locator('[data-submit]').click();}
   }
   if(['logic','lecture','recall','reveal'].includes(state)){
    await p.locator('[data-stage-next="logic_group"]').click();
    if(state!=='logic')await p.locator('[data-enter-group]').click();
    if(['recall','reveal'].includes(state))await p.locator('[data-group-lecture-done]').click();
    if(state==='reveal')await p.locator('[data-kp-reveal]:visible').click();
   }
   await p.waitForTimeout(140);
   const metrics=await p.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,title:document.title,visibleHeadings:[...document.querySelectorAll('h1,h2,h3')].filter(e=>e.getClientRects().length).map(e=>e.textContent.trim()).slice(0,25),boxes:[...document.querySelectorAll('.politicsStudy,.politicsMain,.politicsRail,.cognitiveStage,.contextInspector,.portedStudyLayout,.portedStudyMain,.portedStudyOutline,.portedStudyChain')].filter(e=>e.getClientRects().length).slice(0,15).map(e=>({class:e.className,width:e.clientWidth,height:e.clientHeight,font:getComputedStyle(e).fontSize}))}));
   const cdp=await ctx.newCDPSession(p);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const {root:doc}=await cdp.send('DOM.getDocument');const fonts=[];
   for(const selector of ['h1','h2','h3','.politicsStem','.portedStudyIdentity h2']){const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.nodeId,selector});if(nodeId){const r=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});fonts.push(...r.fonts);}}
   if(fonts.some(f=>/WenQuanYi/.test(f.familyName)))throw Error('Disallowed CJK fallback');
   await p.screenshot({path:path.join(out,name+'.png')});
   if(width===390)await p.screenshot({path:path.join(out,name+'-full.png'),fullPage:true});
   if(state==='recall'){
    const visibleAnswers=await p.locator('[data-kp-answer]:visible').count();
    if(visibleAnswers)report.failures.push({name,error:'Recall Core visible before Reveal'});
    for(const selector of ['.portedStudyIdentity h2','.portedStudyKpRail button>span','.xv6PersonalDock','.portedKpRecallCard>header>span']) {if(await p.locator(selector+':visible').count())report.failures.push({name,error:'Workspace Recall leak: '+selector});}
   }
   report.pages.push({name,route,state,...metrics,fonts,errors});
   if(errors.length)report.failures.push({name,errors});
   if(metrics.scrollWidth>width+1)report.failures.push({name,error:'Horizontal page overflow',width:metrics.scrollWidth});
  }catch(e){report.failures.push({name,error:String(e)});}finally{await ctx.close();}
 }
}finally{await browser.close();server.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify({head:report.head,pages:report.pages.length,failures:report.failures},null,2));
if(report.failures.length)process.exitCode=1;
