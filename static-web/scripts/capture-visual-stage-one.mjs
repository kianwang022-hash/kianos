import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';

// Isolated browser evidence on existing exposed/synthetic tasks, never learner U.
const out=path.resolve('../visual-evidence/stage1');
const root=path.resolve('dist');
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404).end();return;}
  res.setHeader('content-type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true});
const cases=[['home','/'],['english-home','/english/'],['reading-index','/reading/'],['cloze-index','/cloze/'],['part-b-index','/reading-b/'],['translation-index','/translation/'],['writing-index','/writing/'],['reading','/reading/english1-2000-reading-a-text1/'],['cloze','/cloze/english1-2000-cloze-main/'],['part-b','/reading-b/english1-2005-reading-b-main/'],['translation','/translation/english1-2000-translation-main/'],['writing-small','/writing/writing-synthetic-small-v1/'],['writing-big','/writing/writing-synthetic-big-v1/'],['objective-guide','/objective-learn/'],['translation-guide','/translation-learn/'],['writing-guide','/writing-learn/'],['lexical-home','/vocabulary/'],['lexical-front','/vocabulary/40/'],['lexical-depth','/vocabulary/40/','reveal'],['lexical-simple','/vocabulary/710/','reveal'],['lexical-search','/vocabulary/','search'],['lexical-challenge','/vocabulary/','challenge']];
const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),environment:'Linux Chromium / Noto Sans CJK; not Mac or learner U',pages:[],failures:[]};
try{
 for(const [name,route,act] of cases){
  const ctx=await browser.newContext({viewport:{width:1536,height:864},locale:'zh-CN'});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   const response=await page.goto(base+route,{waitUntil:'networkidle'});if(!response?.ok())throw new Error(`HTTP ${response?.status()}`);
   await page.evaluate(()=>document.fonts.ready);
   if(act==='reveal')await page.locator('[data-vocab-reveal]').click();
   if(act==='search'){await page.locator('[data-lexical-tab="search"]').click();await page.locator('[data-lexical-search]').fill('account');}
   if(act==='challenge')await page.locator('[data-lexical-tab="challenge"]').click();
   await page.waitForTimeout(120);await page.screenshot({path:path.join(out,name+'.png')});
   const metrics=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight,title:document.title,targets:[...document.querySelectorAll('[data-vocab-repair]')].map(e=>[e.getAttribute('data-target-kind'),e.getAttribute('data-target-id'),e.getAttribute('data-target-locator')]),readingColumns:getComputedStyle(document.querySelector('.portedReadingColumns')||document.body).gridTemplateColumns}));
   report.pages.push({name,route,errors,...metrics});if(errors.length)report.failures.push({name,errors});if(metrics.scrollW>1537)report.failures.push({name,error:'Horizontal overflow'});
  }catch(e){report.failures.push({name,error:e.message});}finally{await ctx.close();}
 }
}finally{await browser.close();server.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify({screens:report.pages.length,failures:report.failures},null,2));
if(report.failures.length)process.exitCode=1;
