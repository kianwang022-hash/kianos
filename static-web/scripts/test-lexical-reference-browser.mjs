import assert from 'node:assert/strict';
import fs from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_PACKAGE_MODULE || 'playwright');
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

 // A second fresh context carries only synthetic prior Form and control events.
 let formLedger=emptyLexicalLedger();
 const formTargets=[
  ['internalize',7826,'form_identity',null,'record.form_identity'],
  ['humor',2405,'form_identity',null,'record.form_identity'],
  ['import',2473,'form_identity',null,'record.form_identity'],
  ['die',1367,'form_identity',null,'record.form_identity'],
  ['mat',2976,'form_identity',null,'record.form_identity'],
  ['diet',1368,'form_identity',null,'record.senses[3].lexical_identity_overlay'],
  ['internalize',7826,'sense','sense:internalize:2772118fc8fe5d6d',null],
  ['import',2473,'core',null,'record.core_concept']
 ];
 for(const [i,[word,ordinal,target_kind,target_id,target_locator]] of formTargets.entries()) formLedger=appendEvidenceEvent(formLedger,{event_id:'prior-form-browser-'+i,word_id:'word:'+word,ordinal,word,target_kind,target_id,target_locator,target_revision:target_id?null:'synthetic-prior-revision-'+ordinal,source:'depth_plus',outcome:'ADDED',observed_at:'2026-10-07T00:00:00.000Z'}).ledger;
 const formEventBytes=JSON.stringify(formLedger.events);
 const formContext=await browser.newContext({viewport:{width:1440,height:1000}});
 await formContext.addInitScript(({ledger,key})=>{
  if(!localStorage.getItem('__form_seed')) {localStorage.setItem(key,JSON.stringify(ledger));localStorage.setItem('__form_seed','1');}
  window.__formCopies=[];
  Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>window.__formCopies.push(text)},configurable:true});
 },{ledger:formLedger,key:LEXICAL_LEDGER_STORAGE_KEY});
 const formPage=await formContext.newPage();formPage.on('pageerror',e=>errors.push(e.message));
 const formRead=()=>formPage.evaluate(key=>JSON.parse(localStorage.getItem(key)),LEXICAL_LEDGER_STORAGE_KEY);
 const formOpen=async(o,mode)=>{await formPage.goto(`${base}/vocabulary/word/?o=${o}&mode=${mode}`);await formPage.locator(`[data-vocab-ordinal="${o}"][data-vocab-initialized="true"][data-vocab-evidence-initialized="true"]`).waitFor();await formPage.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
 await formOpen(7826,'lookup');
 check(JSON.stringify(await formRead())===JSON.stringify(formLedger),'prior_Form_Lookup_preserves_entire_ledger_before_any_Study');
 await formPage.goto(base+'/vocabulary/');await formPage.locator('[data-lexical-home-ready="true"]').waitFor();
 await formPage.waitForFunction(()=>document.querySelector('[data-lexical-repair-count]')?.textContent==='5');
 const afterHome=await formRead();
 check(compileRepairTargets(afterHome).length===5,'real_Home_retires_only_three_background_Form_debts');
 check(JSON.stringify(afterHome.events)===formEventBytes,'real_Home_preserves_all_prior_Form_and_control_event_bytes');
 await formPage.locator('[data-lexical-copy-return]').click();
 await formPage.waitForFunction(()=>window.__formCopies.length===1);
 const handoff=await formPage.evaluate(()=>JSON.parse(window.__formCopies[0].split('LEXICAL_CHAT_STATE_JSON\n')[1]));
 check(handoff.repair.active_target_count===5 && handoff.today_evidence.length===8,'real_Home_handoff_exports_qualified_debt_and_unchanged_history');
 for(const [ordinal,word] of [[7826,'internalize'],[2405,'humor'],[2473,'import']]) {
  await formOpen(ordinal,'repair');
  check(await formPage.locator('.lexicalFormSection').isHidden() && await formPage.locator('.lexicalFormSection [data-vocab-repair]').count()===0,word+'_real_Repair_has_no_background_Form_target');
  check(!compileRepairTargets(await formRead()).some(t=>t.ordinal===ordinal&&t.target_locator==='record.form_identity'),word+'_real_Repair_does_not_resurrect_prior_Form_debt');
  const frozenBytes=JSON.stringify(await formRead());
  await formOpen(ordinal,'lookup');
  check(await formPage.locator('.lexicalFormSection').isVisible() && JSON.stringify(await formRead())===frozenBytes,word+'_real_Lookup_retains_Form_and_preserves_entire_reconciled_ledger');
 }
 for(const ordinal of [1367,2976]) {
  await formOpen(ordinal,'repair');
  check(await formPage.locator('.lexicalFormSection [data-vocab-repair]').getAttribute('aria-pressed')==='true','valuable_Form_'+ordinal+'_remains_selected_and_executable');
 }
 check(compileRepairTargets(await formRead()).some(t=>t.ordinal===1368&&t.target_locator==='record.senses[3].lexical_identity_overlay'),'Diet_overlay_stays_executable_in_real_browser');
 check(JSON.stringify((await formRead()).events)===formEventBytes,'entire_real_browser_Form_journey_preserves_historical_events');
 await formContext.close();
 check(errors.length===0,'no_browser_errors');
 fs.writeFileSync(out+'/result.json',JSON.stringify({base,checks,errors,privateState:'synthetic isolated Candidate only'},null,2));
 console.log(`REFERENCE_BROWSER_PASS ${checks.length} ${out}`);
} finally {await browser.close();}
