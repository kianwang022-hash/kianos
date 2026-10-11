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
 // Fault injection applies only to synthetic localStorage in this owned browser context.
 const injectFailure=async(page,failKey)=>page.evaluate(({failKey,intakeKey,key})=>{
  window.__storageFault={enabled:true,writes:[],navigations:0};
  window.addEventListener('kianos:vocabulary-navigate',()=>window.__storageFault.navigations++);
  const original=Storage.prototype.setItem;
  Storage.prototype.setItem=function(k,v){
   if(this===localStorage&&(k===key||k===intakeKey)){
    window.__storageFault.writes.push({key:k,failed:window.__storageFault.enabled&&k===failKey});
    if(window.__storageFault.enabled&&k===failKey)throw new DOMException('Synthetic quota failure','QuotaExceededError');
   }
   return original.call(this,k,v);
  };
 },{failKey,intakeKey,key});
 const fault=page=>page.evaluate(()=>window.__storageFault);
 const retry=page=>page.evaluate(()=>{window.__storageFault.enabled=false;});
 await run({schema:'kianos.lexical.card_routing.v1',history:[old],latest_by_word:{'word:synthetic':old}},{'word:synthetic':day},async(page,read)=>{
  const before=JSON.stringify(await read());await injectFailure(page,key);
  await page.locator('[data-vocab-route="mastered"]').click();
  check(JSON.stringify(await read())===before,'quota failure retains prior successful judgment');
  check(await page.locator('[data-vocab-save-notice]').isVisible()&&(await page.locator('[data-vocab-save-notice]').textContent()).includes('未保存'),'quota failure explicitly reports unsaved');
  check((await fault(page)).navigations===0,'quota failure does not navigate');
  await page.reload();await page.locator('[data-vocab-evidence-initialized="true"]').waitFor();
  check(JSON.stringify(await read())===before,'refresh after failed score retains prior judgment');
  await page.locator('[data-vocab-route="mastered"]').click();const saved=await read();
  check(saved.routing.history.length===2&&saved.routing.latest_by_word['word:synthetic'].route==='MASTERED','retry after refresh adds exactly one judgment');
 });
 await run({schema:'kianos.lexical.card_routing.v1',history:[],latest_by_word:{}},{},async(page,read)=>{
  const before=JSON.stringify(await read());await injectFailure(page,key);
  await page.locator('[data-vocab-route="mastered"]').click();let f=await fault(page);
  check(f.writes[0]?.key===intakeKey&&!f.writes[0].failed&&f.writes[1]?.key===key&&f.writes[1].failed,'synthetic first intake write succeeds before routing quota failure');
  check(JSON.stringify(await read())===before,'second-key score failure rolls back introduction');
  check(f.navigations===0&&await page.locator('[data-vocab-save-notice]').isVisible(),'partial score failure reports unsaved without navigation');
  await retry(page);await page.locator('[data-vocab-route="mastered"]').click();const saved=await read();
  check(saved.routing.history.length===1&&!!saved.intake.introduced['word:synthetic']&&(await fault(page)).navigations===1,'same-page retry commits one introduction and judgment');
  check(await page.locator('[data-vocab-save-notice]').count()===0,'successful retry clears unsaved notice');
 });
 await run({schema:'kianos.lexical.card_routing.v1',history:[],latest_by_word:{}},{},async(page,read)=>{
  await page.locator('[data-vocab-route="mastered"]').click();
  await page.reload();await page.locator('[data-vocab-evidence-initialized="true"]').waitFor();
  const before=JSON.stringify(await read());await injectFailure(page,key);await page.locator('[data-vocab-undo]').click();let f=await fault(page);
  check(f.writes[0]?.key===intakeKey&&!f.writes[0].failed&&f.writes[1]?.key===key&&f.writes[1].failed,'refreshed undo injects second-key quota failure');
  check(JSON.stringify(await read())===before,'failed undo rolls back intake and preserves successful score');
  check(f.navigations===0&&await page.locator('[data-vocab-save-notice]').isVisible(),'failed undo reports unsaved without navigation');
  await retry(page);await page.locator('[data-vocab-undo]').click();const undone=await read();
  check(undone.routing.history.length===0&&!undone.routing.latest_by_word['word:synthetic']&&!undone.intake.introduced['word:synthetic']&&(await fault(page)).navigations===1,'undo retry applies once with consistent stores');
  await page.reload();await page.locator('[data-vocab-evidence-initialized="true"]').waitFor();
  check(JSON.stringify(await read())===JSON.stringify(undone),'refresh retains successful undo retry');
 });
 // Missing transaction edge cases, limited to this component's synthetic stores.
 const injectEdgeFault=async(page,kind)=>page.evaluate(({kind,key,intakeKey})=>{
  const proto=Storage.prototype,set=proto.setItem,get=proto.getItem;
  const priorIntake=get.call(localStorage,intakeKey);
  const concurrent=JSON.stringify({schema:'kianos.lexical.intake.v1',introduced:{'word:concurrent':'2026-02-02'}});
  window.__edgeFault={navigations:0,writes:[],readMismatch:false,concurrent};
  window.addEventListener('kianos:vocabulary-navigate',()=>window.__edgeFault.navigations++);
  let mismatchPending=false;
  proto.setItem=function(k,v){
   if(this!==localStorage||![key,intakeKey].includes(k))return set.call(this,k,v);
   window.__edgeFault.writes.push(k);
   if(kind==='first-write'&&k===intakeKey)throw new DOMException('Synthetic first write failure','QuotaExceededError');
   if(kind==='rollback-failure'&&k===intakeKey&&v===priorIntake)throw new DOMException('Synthetic rollback failure','QuotaExceededError');
   if(['rollback-failure','concurrent-conflict'].includes(kind)&&k===key){
    if(kind==='concurrent-conflict')set.call(this,intakeKey,concurrent);
    throw new DOMException('Synthetic second write failure','QuotaExceededError');
   }
   const result=set.call(this,k,v);
   if(kind==='read-mismatch'&&k===key&&!window.__edgeFault.readMismatch)mismatchPending=true;
   return result;
  };
  proto.getItem=function(k){
   if(this===localStorage&&k===key&&mismatchPending){mismatchPending=false;window.__edgeFault.readMismatch=true;return null;}
   return get.call(this,k);
  };
 },{kind,key,intakeKey});
 for(const kind of ['first-write','read-mismatch','rollback-failure','concurrent-conflict']){
  // Keep a prior intake byte string so rollback failure can target its restore write.
  await run({schema:'kianos.lexical.card_routing.v1',history:[],latest_by_word:{}},{'word:unrelated':day},async(page,read)=>{
   const before=await read();await injectEdgeFault(page,kind);
   await page.locator('[data-vocab-route="mastered"]').click();
   const after=await read(),state=await page.evaluate(()=>window.__edgeFault);
   check(state.navigations===0,kind+' stops navigation');
   check(JSON.stringify(after.routing)===JSON.stringify(before.routing),kind+' preserves prior routing');
   const notice=page.locator('[data-vocab-save-notice]');
   check(await notice.isVisible(),kind+' shows save alert');
   if(['first-write','read-mismatch'].includes(kind)){
    check(JSON.stringify(after.intake)===JSON.stringify(before.intake),kind+' restores prior intake');
    check((await notice.textContent()).includes('未保存'),kind+' reports unsaved');
    if(kind==='first-write')check(state.writes.length===1&&state.writes[0]===intakeKey,'first intake failure never attempts routing write');
    else check(state.readMismatch,'post-write verification observes injected mismatched read');
   }else{
    check((await notice.textContent()).includes('状态需要核对'),kind+' reports uncertain state without preservation claim');
    check(await page.locator('[data-vocab-route="mastered"]').isDisabled()&&await page.locator('[data-vocab-undo]').isDisabled(),kind+' pauses judgment and undo in current page');
    if(kind==='concurrent-conflict'){
     const raw=await page.evaluate(intakeKey=>localStorage.getItem(intakeKey),intakeKey);
     check(raw===state.concurrent,'rollback conflict preserves exact synthetic concurrent bytes');
    }else check(!!after.intake.introduced['word:synthetic']&&after.intake.introduced['word:unrelated']===day,'rollback write failure retains unrolled intake for reconciliation');
    const snapshot=JSON.stringify(after);
    await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('Backspace');await page.keyboard.press('ArrowDown');
    check(JSON.stringify(await read())===snapshot&&(await page.evaluate(()=>window.__edgeFault.navigations))===0,kind+' keyboard actions do not continue after pause');
   }
  });
 }
 console.log(JSON.stringify({status:'PASS',checks:checks.length,fixture:'complete production routing script with synthetic storage',port}));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
