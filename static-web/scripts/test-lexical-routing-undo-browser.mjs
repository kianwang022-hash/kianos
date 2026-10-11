import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
const { chromium } = await import(process.env.PLAYWRIGHT_PACKAGE_MODULE || 'playwright');
const web=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
// Complete production component script; only its surrounding writer-ready gate
// and markup are fixture inputs. No whole-site writer/recovery claim is made.
const source=fs.readFileSync(path.join(web,'src/components/VocabularyEvidenceBridge.astro'),'utf8');
const script=source.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert.ok(script);
const bundle=await build({stdin:{contents:script,resolveDir:path.join(web,'src/components'),loader:'ts'},bundle:true,write:false,format:'iife',platform:'browser'});
const html=`<!doctype html><main><div data-vocab-evidence-bridge data-base="/" data-total="1000" hidden></div><section data-local-port="vocabulary" data-vocab-word="synthetic" data-vocab-object="word:synthetic" data-vocab-ordinal="1" data-vocab-revealed="true"><button data-vocab-route="mastered">Mastered</button><button data-vocab-route="unknown">Unknown</button><button data-vocab-undo>Undo</button></section></main><script>window[Symbol.for('kianos.native.learner-writer')]={ready:Promise.resolve(),assertWritable(){}};</script><script src="/component.js"></script>`;
const server=http.createServer((req,res)=>{if(req.url?.startsWith('/component.js')){res.setHeader('content-type','text/javascript');res.end(bundle.outputFiles[0].contents);}else if(req.url?.startsWith('/vocabulary/word/')){res.setHeader('content-type','text/html');res.end(html);}else{res.statusCode=404;res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;assert.ok(![4321,4322].includes(port));const base=`http://127.0.0.1:${port}`;
const key='kianos-lexical-card-routing-v1',intakeKey='kianos-lexical-intake-v1';
const old={event_id:'synthetic-old',word_id:'word:synthetic',ordinal:1,word:'synthetic',route:'FUZZY',observed_at:'2026-01-01T00:00:00.000Z',return_href:'/vocabulary/word/?o=1'};
const day='2026-01-01';const checks=[];let browser;
const check=(condition,name,detail=null)=>{if(!condition&&detail)console.error(JSON.stringify(detail));assert.ok(condition,name);checks.push(name);console.log('PASS '+name);};
try{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const run=async(routing,introduced,actions,search='?o=1')=>{
  const context=await browser.newContext();
  try{
   await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
   await context.addInitScript(({routing,introduced,key,intakeKey})=>{if(localStorage.getItem('__synthetic-seed'))return;localStorage.setItem(key,JSON.stringify(routing));localStorage.setItem(intakeKey,JSON.stringify({schema:'kianos.lexical.intake.v1',introduced}));localStorage.setItem('__synthetic-seed','1');},{routing,introduced,key,intakeKey});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   const read=()=>page.evaluate(({key,intakeKey})=>({routing:JSON.parse(localStorage.getItem(key)),intake:JSON.parse(localStorage.getItem(intakeKey))}),{key,intakeKey});
   await page.goto(base+'/vocabulary/word/'+search);await page.locator('[data-vocab-evidence-initialized="true"]').waitFor();await actions(page,read);check(errors.length===0,'no component browser errors');
  }finally{await context.close();}
 };
 const rows=Array.from({length:300},(_,n)=>({...old,event_id:'synthetic-other-'+n,word_id:'word:other'+n,word:'other'+n}));
 await run({schema:'kianos.lexical.card_routing.v1',history:rows,latest_by_word:{'word:synthetic':old,...Object.fromEntries(rows.map(e=>[e.word_id,e]))}},{'word:synthetic':day},async(page,read)=>{
  await page.locator('[data-vocab-route="mastered"]').click();let s=await read();check(s.routing.history.length===300&&Object.keys(s.routing.latest_by_word).length===301,'native button preserves per-word state beyond cap');
  await page.reload();await page.locator('[data-vocab-evidence-initialized="true"]').waitFor();await page.locator('[data-vocab-undo]').click();s=await read();check(JSON.stringify(s.routing.latest_by_word['word:synthetic'])===JSON.stringify(old)&&s.intake.introduced['word:synthetic']===day,'native refreshed undo restores out-of-window state and introduction',{latest:s.routing.latest_by_word['word:synthetic']??null,introduction:s.intake.introduced['word:synthetic']??null});
  await page.locator('[data-vocab-route="unknown"]').click();await page.locator('[data-vocab-route="mastered"]').click();await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('Backspace');s=await read();check(s.routing.latest_by_word['word:synthetic'].route==='UNKNOWN','keyboard undo restores preceding judgment');await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('Backspace');s=await read();check(s.routing.latest_by_word['word:synthetic'].route==='FUZZY'&&s.intake.introduced['word:synthetic']===day,'repeated keyboard undo restores old state');
 });
 await run({schema:'kianos.lexical.card_routing.v1',history:[],latest_by_word:{}},{},async(page,read)=>{
  await page.locator('[data-vocab-route="mastered"]').click();await page.locator('[data-vocab-undo]').click();let s=await read();check(!s.routing.latest_by_word['word:synthetic']&&!s.intake.introduced['word:synthetic'],'native first undo removes only new introduction');const before=JSON.stringify(s);await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('Backspace');check(JSON.stringify(await read())===before,'extra empty undo harmless');
 });
 await run({schema:'kianos.lexical.card_routing.v1',history:[old],latest_by_word:{'word:synthetic':old}},{'word:synthetic':day},async(page,read)=>{
  const before=JSON.stringify(await read());await page.locator('[data-vocab-undo]').click();check(JSON.stringify(await read())===before,'legacy missing prior preserves records');check(await page.locator('[data-vocab-undo-notice]').isVisible(),'legacy block explains preservation');await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('Backspace');check(JSON.stringify(await read())===before,'repeated blocked undo preserves records');
 });
 const today=new Date().toLocaleDateString('en-CA');
 await run({schema:'kianos.lexical.card_routing.v1',history:[old],latest_by_word:{'word:synthetic':old}},{'word:synthetic':day},async(page,read)=>{
  check(await page.locator('[data-vocab-undo]').isDisabled(),'revisit entry cannot consume older traversal');
  await page.locator('[data-vocab-route="mastered"]').click();await page.locator('[data-vocab-undo]').click();const before=JSON.stringify(await read());
  check(await page.locator('[data-vocab-undo]').isDisabled(),'revisit undo stops when its own judgments exhausted');
  await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('Backspace');check(JSON.stringify(await read())===before,'extra revisit keyboard undo preserves old traversal');
 },'?o=1&revisit=1,2&revisit_session=synthetic-round&day='+today);
 console.log(JSON.stringify({status:'PASS',checks:checks.length,fixture:'complete production routing script with synthetic storage',port}));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
