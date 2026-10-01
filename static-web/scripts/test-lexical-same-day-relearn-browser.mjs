import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { localLexicalDay, sameDayLexicalRevisits } from '../src/lib/lexicalSettings.mjs';
import { lexicalRevisitContext, lexicalStudyNeighbors } from '../src/lib/lexicalRuntimeRoute.mjs';

// Always own a fresh candidate server: its private learner/checkpoint runtime is
// temporary. Never run these synthetic judgments against Current or real state.
const port = Number(process.env.KIANOS_RELEARN_TEST_PORT || 4333);
const base = `http://127.0.0.1:${port}`;
const out = process.env.KIANOS_RELEARN_TEST_OUT || fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-relearn-proof-'));
fs.mkdirSync(out, { recursive: true });
const checks = [];
const check = (ok, name, detail = '') => {
  checks.push({ name, ok: Boolean(ok), detail });
  console.log((ok ? 'PASS ' : 'FAIL ')+name);
  if (!ok) throw new Error(`RELEARN_FAIL:${name}:${JSON.stringify(detail)}`);
};
const today = localLexicalDay();
check(lexicalRevisitContext({ search: '?revisit=23,280,26&day='+today },7946,today).ordinals[1]===280, 'parse_nonadjacent_snapshot');
for (const query of ['revisit=23,23', 'revisit=23,99999', 'revisit=', 'revisit=23,280&day=1900-01-01']) {
  check(lexicalRevisitContext({search:'?'+query},7946,today).invalid, 'reject_invalid_or_expired_context', query);
}
check(lexicalStudyNeighbors(24,7946,{ordinals:[23,280,26]}).invalid,'reject_ordinal_outside_snapshot');
const server = spawn(process.execPath, ['scripts/kianos-candidate-runtime.mjs'], {
  cwd: process.cwd(), env: { ...process.env, KIANOS_CANDIDATE_PORT: String(port), KIANOS_CANDIDATE_OPEN: '0' },
  stdio: ['ignore','pipe','pipe'], detached: process.platform!=='win32'
});
let log = '';
server.stdout.on('data', chunk => {log += chunk;});
server.stderr.on('data', chunk => {log += chunk;});
let browser;
try {
  for (let i=0;!log.includes('[KianOS Candidate] READY');i++) {
    if (i>200 || server.exitCode!==null) throw new Error('candidate not ready: '+log);
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  await context.addInitScript(() => {
    // Candidate uses Astro dev; hide its development toolbar so it cannot
    // cover the learner's bottom rating buttons. It is absent in Stable.
    document.addEventListener('DOMContentLoaded',()=>{const style=document.createElement('style');style.textContent='astro-dev-toolbar { display:none !important; }';document.head.append(style);});
    window.__speech=[];
    window.SpeechSynthesisUtterance=class { constructor(text){this.text=text;} };
    Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},speak(u){window.__speech.push({text:u.text,lang:u.lang});},addEventListener(){},removeEventListener(){}}});
    if (localStorage.getItem('__relearn-fixture')) return;
    const now=Date.now();
    const rows=[[23,'academic'],[280,'articulate'],[26,'accent']].map(([ordinal,word],i)=>({event_id:'synthetic-relearn-'+ordinal,word_id:'word:'+word,ordinal,word,route:'FUZZY',observed_at:new Date(now-i*1000).toISOString(),return_href:'/vocabulary/word/?o='+ordinal}));
    localStorage.setItem('kianos-lexical-card-routing-v1',JSON.stringify({schema:'kianos.lexical.card_routing.v1',history:rows,latest_by_word:Object.fromEntries(rows.map(row=>[row.word_id,row]))}));
    localStorage.setItem('kianos-lexical-intake-v1',JSON.stringify({schema:'kianos.lexical.intake.v1',introduced:Object.fromEntries(rows.map(row=>[row.word_id,new Date(now-86400000).toLocaleDateString('en-CA')]))}));
    localStorage.setItem('kianos-vocabulary-last-ordinal','7000');
    localStorage.setItem('__relearn-fixture','1');
  });
  const page=await context.newPage();
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  let documents=0;page.on('request',r=>{if(r.resourceType()==='document')documents++;});
  const word=async n=>{await page.locator(`[data-vocab-ordinal="${n}"][data-vocab-evidence-initialized="true"]`).waitFor();};
  const cursor=()=>page.evaluate(()=>localStorage.getItem('kianos-vocabulary-last-ordinal'));
  const routing=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-lexical-card-routing-v1')));
  const home=async()=>{await page.goto(base+'/vocabulary/');await page.locator('[data-lexical-home-ready="true"]').waitFor();};
  const score=async(route,n)=>{const button=page.locator(`[data-vocab-route="${route}"]`);if(!(await button.isVisible()))await page.locator('[data-vocab-reveal]').click();await button.click();if(n)await word(n);else await page.locator('[data-lexical-home-ready="true"]').waitFor();};
  await home();
  const entry=await page.locator('[data-lexical-same-day-start]').getAttribute('href');
  check(entry.includes('revisit=23%2C280%2C26'),'real_home_entry_carries_selected_queue',entry);
  await page.locator('[data-lexical-same-day-start]').click();await word(23);
  check((await cursor())==='7000','entry_preserves_coverage_cursor');
  await page.waitForFunction(()=>window.__speech.length===1);
  const firstDocuments=documents;
  await score('known',280);
  check(documents===firstDocuments,'score_swaps_within_same_document');
  check(sameDayLexicalRevisits(await routing()).map(x=>x.ordinal).join(',')==='280,26','known_removes_current_from_live_set');
  check((await cursor())==='7000','second_preserves_coverage_cursor');
  await page.waitForFunction(()=>window.__speech.length===2);
  check((await page.evaluate(()=>window.__speech)).map(x=>x.text).join(',')==='academic,articulate','one_auto_pronunciation_per_front');
  await page.screenshot({path:path.join(out,'relearn-second-articulate.png')});
  await page.locator('[data-vocab-undo]').click();await word(23);
  check(new URL(page.url()).searchParams.has('revisit'),'undo_retains_queue_context');
  check(sameDayLexicalRevisits(await routing()).length===3,'undo_restores_prior_judgment');
  await page.locator('[data-vocab-runtime-next]').click();await word(280);
  await page.locator('[data-vocab-runtime-prev]').click();await word(23);
  await page.goBack();await word(280);
  check((await cursor())==='7000','arrow_and_browser_back_preserve_cursor');
  await page.reload();await word(280);
  check((await page.locator('[data-vocab-runtime-position]').innerText()).includes('2 / 3'),'refresh_keeps_position');
  await page.waitForFunction(()=>window.__speech.length===1);
  await score('unknown',26);
  check(sameDayLexicalRevisits(await routing())[0].ordinal===280,'unknown_reorders_live_set_without_repeating_current');
  await page.locator('[data-vocab-runtime-prev]').click();await word(280);
  await score('fuzzy',26);
  check(sameDayLexicalRevisits(await routing())[0].ordinal===280,'fuzzy_reorders_live_set_without_skipping_next');
  check((await page.locator('[data-vocab-runtime-next]').innerText())==='完成','last_uses_queue_end');
  await page.screenshot({path:path.join(out,'relearn-last-accent.png')});
  await score('fuzzy',null);
  check((await cursor())==='7000','queue_tail_returns_home_without_main_cursor_change');
  check((await page.locator('[data-lexical-same-day-count]').innerText())==='3','fuzzy_tail_remains_pending_without_auto_loop');
  await page.waitForFunction(async()=>{const r=await fetch('/__kianos-private/checkpoint');if(!r.ok)return false;const body=await r.json();return body.checkpoint?.payload?.subjects?.lexical?.entries?.['kianos-vocabulary-last-ordinal']==='7000';},{},{timeout:10000});
  check(true,'isolated_backend_checkpoint_preserves_coverage_cursor');
  const direct=base+'/vocabulary/word/?o=280&revisit=23,280,26&day='+today;
  await page.goto(direct);await word(280);
  check((await cursor())==='7000','direct_entry_keeps_context_and_cursor');
  await page.locator('[data-lexical-study-nav] > a').click();await page.locator('[data-lexical-home-ready="true"]').waitFor();
  check((await page.locator('[data-lexical-overview-continue]').getAttribute('href')).includes('o=7000'),'return_keeps_main_continue_entry');
  // Clear remaining live subset through its real Home entry, never reset storage.
  await page.locator('[data-lexical-same-day-start]').click();await word(26);
  await score('known',280);await score('known',23);await score('mastered',null);
  check((await page.locator('[data-lexical-same-day-count]').innerText())==='0','empty_queue_disables_home_entry');
  check((await page.locator('[data-lexical-same-day-start]').getAttribute('aria-disabled'))==='true','empty_entry_disabled');
  await page.goto(base+'/vocabulary/word/?o=23&revisit=23,280,26&day=1900-01-01');
  await page.locator('[data-lexical-home-ready="true"]').waitFor();
  check((await cursor())==='7000','expired_day_returns_home_without_cursor_write');
  check(sameDayLexicalRevisits(await routing(),'1900-01-01').length===0,'cross_day_live_projection_is_empty');
  await page.goto(base+'/vocabulary/word/?o=24&revisit=23,280,26&day='+today);
  await page.locator('[data-lexical-home-ready="true"]').waitFor();
  check((await cursor())==='7000','outside_queue_direct_entry_fails_closed');
  await page.locator('[data-lexical-overview-continue]').click();await word(7000);
  check(!new URL(page.url()).searchParams.has('revisit'),'main_continue_has_no_revisit_context');
  await score('known',7001);
  check((await cursor())==='7001','ordinary_coverage_advances_independently');
  check(errors.length===0,'no_browser_runtime_errors',errors);
  console.log(JSON.stringify({ok:true,checks,out},null,2));
} finally {
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({checks,serverLog:log},null,2)+'\n');
  await browser?.close();
  if (server.exitCode===null) {try{process.kill(-server.pid,'SIGTERM');}catch{server.kill('SIGTERM');}}
}
