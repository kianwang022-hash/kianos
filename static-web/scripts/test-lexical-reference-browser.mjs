import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
import { emptyLexicalLedger, appendEvidenceEvent, compileRepairTargets, LEXICAL_LEDGER_STORAGE_KEY } from '../src/lib/lexicalEvidence.mjs';
const base = process.env.LEXICAL_REFERENCE_TEST_BASE;
if (!base || process.env.KIANOS_ISOLATED_TEST_RUNTIME !== '1' || new URL(base).port === '4321') throw Error('REFERENCE_TEST_REQUIRES_ISOLATED_CANDIDATE');
const out = process.env.LEXICAL_REFERENCE_TEST_OUT || '/tmp/1155-browser-proof';
fs.mkdirSync(out,{recursive:true});
let ledger=emptyLexicalLedger();
const targets=[['bore','sense','sense:bore:30b1817c4fac5d13'],['bore','collocation','collocation:3cf52dfbaa3f68349a27'],['carriage','sense','sense:carriage:7479005566ec5ecc'],['carriage','collocation','collocation:5c3b7d1ebdbe39aae0e6'],['bound','collocation','collocation:7fa2edc7720a9a3f51c1'],['career','sense','sense:career:9254dc3737085252']];
for(const [i,[word,target_kind,target_id]] of targets.entries()) ledger=appendEvidenceEvent(ledger,{event_id:'reference-browser-'+i,word_id:'word:'+word,target_kind,target_id,source:'depth_plus',outcome:'ADDED',observed_at:`2026-10-05T00:00:0${i}.000Z`}).ledger;
const checks=[];const check=(ok,name)=>{assert.ok(ok,name);checks.push(name);console.log('PASS '+name);};
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || chromium.executablePath()});
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.addInitScript(({ledger,key})=>{
  if(!localStorage.getItem('__reference_seed')) {localStorage.setItem(key,JSON.stringify(ledger));localStorage.setItem('kianos-vocabulary-last-ordinal','7000');localStorage.setItem('kianos-vocabulary-astro-v2:word:bore',JSON.stringify({revealed:true,repairTargets:{}}));localStorage.setItem('__reference_seed','1');}
  window.SpeechSynthesisUtterance=class{};Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[]},speak(){},addEventListener(){},removeEventListener(){}}});
  document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='astro-dev-toolbar{display:none!important}';document.head.append(s);});
 },{ledger,key:LEXICAL_LEDGER_STORAGE_KEY});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const read=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),LEXICAL_LEDGER_STORAGE_KEY);
 const open=async(o,mode)=>{await page.goto(`${base}/vocabulary/word/?o=${o}&mode=${mode}`);await page.locator(`[data-vocab-ordinal="${o}"][data-vocab-initialized="true"][data-vocab-evidence-initialized="true"]`).waitFor();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
 for(const [o,word,sid,cid] of [[545,'bore',targets[0][2],targets[1][2]],[695,'carriage',targets[2][2],targets[3][2]]]) {
  await open(o,'lookup');
  check(await page.locator(`[data-vocab-reference-sense-id="${sid}"]`).isVisible(),word+'_lookup_reference_is_visible');
  check(await page.locator(`[data-vocab-reference-collocation-id="${cid}"]`).isVisible(),word+'_lookup_child_truth_is_visible');
  check(await page.locator('[data-vocab-lookup-only] [data-vocab-repair]').count()===0,word+'_reference_has_no_plus');
  check(JSON.stringify(await read())===JSON.stringify(ledger),word+'_lookup_preserves_entire_old_ledger');
  check(await page.evaluate(()=>localStorage.getItem('kianos-vocabulary-last-ordinal'))==='7000',word+'_lookup_preserves_resume');
  await page.screenshot({fullPage:true,path:`${out}/${word}-lookup.png`});
 }
 await open(545,'study');
 check(await page.locator('[data-vocab-details]').isVisible(),'existing_bore_reveal_is_preserved');
 check(await page.locator('[data-vocab-lookup-only]').isHidden(),'bore_reference_hidden_in_revealed_study');
 check(compileRepairTargets(await read()).length===4,'bore_parent_and_child_frozen_in_real_study');
 await open(695,'study');
 check(await page.locator('[data-vocab-details]').isHidden(),'carriage_starts_with_front');
 await page.locator('[data-vocab-reveal]').click();
 check(await page.locator('[data-vocab-details]').isVisible() && await page.locator('[data-vocab-lookup-only]').isHidden(),'carriage_reveal_keeps_reference_hidden');
 check(compileRepairTargets(await read()).length===2,'carriage_parent_and_child_frozen_in_real_study');
 await open(555,'lookup');
 const construction=page.locator('[data-vocab-construction-id="construction:bound:bound-up-with"]');
 check(await construction.isVisible() && await construction.getAttribute('data-vocab-construction-sense-id')==='sense:bound:7abc4665b1ff5027','bound_new_construction_has_explicit_adjective_attachment');
 check(await construction.locator('[data-vocab-repair]').getAttribute('aria-pressed')==='false','bound_new_construction_does_not_inherit_jump_evidence');
 check(await page.locator('[data-target-id="collocation:7fa2edc7720a9a3f51c1"]').count()===0 && (await page.locator('[data-vocab-details]').innerText()).includes('跳起'),'bound_old_jump_truth_survives_as_usage_without_plus');
 const after=await read();
 check(JSON.stringify(after.events)===JSON.stringify(ledger.events) && after.conflicts.length===0,'raw_events_unchanged_and_no_conflicts');
 check(compileRepairTargets(after).every(t=>['word:bound','word:career'].includes(t.word_id)),'unrelated_career_and_old_jump_evidence_are_not_frozen_or_remapped');
 await page.screenshot({fullPage:true,path:`${out}/bound-lookup.png`});
 await page.goto(base+'/vocabulary/');await page.locator('[data-lexical-home-ready="true"]').waitFor();
 check(compileRepairTargets(await read()).length===2,'home_consumer_does_not_restore_reference_debt');
 check(errors.length===0,'no_browser_errors');
 fs.writeFileSync(out+'/result.json',JSON.stringify({base,checks,errors,privateState:'synthetic isolated Candidate only'},null,2));
 console.log(`REFERENCE_BROWSER_PASS ${checks.length} ${out}`);
} finally {await browser.close();}
