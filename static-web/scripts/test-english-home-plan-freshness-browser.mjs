import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

// Run only against a task-owned server with isolated private directories and relays disabled.
const base=process.env.KIANOS_NATIVE_TEST_BASE||'http://127.0.0.1:4477';
const output=path.resolve(process.env.KIANOS_NATIVE_TEST_OUTPUT||'output/playwright/english-home-freshness');
fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.KIANOS_BROWSER_CHANNEL?{channel:process.env.KIANOS_BROWSER_CHANNEL}:{})});
const context=await browser.newContext({viewport:{width:1440,height:900}});
const page=await context.newPage();page.setDefaultTimeout(20000);
const errors=[];page.on('pageerror',error=>errors.push(String(error.message)));
try{
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Boolean(document.querySelector('[data-exam-home]')?.dataset.chatPlanStatus));
  const installed=await page.evaluate(async()=>{
    const control=await import('/src/lib/privateControlRuntime.mjs');
    const plans=await import('/src/lib/examChatPlan.mjs');
    const english=await import('/src/lib/englishSessionControl.mjs');
    const exposure=await import('/src/lib/englishLearnerEvidence.mjs');
    const lexical=await import('/src/lib/lexicalEvidence.mjs');
    const profile=await import('/src/lib/examOrchestrator.mjs');
    const timer=await import('/src/lib/studyTimer.mjs');
    const rows=JSON.parse(document.querySelector('[data-english-resume-catalog]').textContent);
    const meta=rows.find(row=>row.task==='writing'&&row.object_id.startsWith('writing-synthetic-'));
    if(!meta)throw new Error('EXISTING_SYNTHETIC_WRITING_CATALOG_REQUIRED');
    const now=Date.now(),day=timer.studyDayAt(now),stamp=new Date(now).toISOString();
    if(!localStorage.getItem(profile.EXAM_PROFILE_KEY))localStorage.setItem(profile.EXAM_PROFILE_KEY,JSON.stringify(profile.emptyExamProfile()));
    localStorage.setItem(lexical.LEXICAL_LEDGER_STORAGE_KEY,JSON.stringify(lexical.emptyLexicalLedger()));
    const initialBasis=plans.buildExamChatPlanBasis(localStorage,day);
    const instruction={schema:english.ENGLISH_SESSION_SCHEMA,session_id:'synthetic-home-session',study_day:day,generated_at:stamp,current_step:0,
      steps:[{step_id:'writing',...meta,label:'Synthetic Home proof',params:{material_exposure:{state:'unknown',basis:'learner_statement',note:'Synthetic engineering testimony only',observed_at:stamp}}}],return_policy:{on_finish:'english_home'}};
    const plan={schema:plans.EXAM_CHAT_PLAN_SCHEMA,study_day:day,generated_at:stamp,learner_evidence_basis:initialBasis,subjects:{english:{target_minutes:30,session_ref:instruction.session_id}},next_subject:'english'};
    const result=await control.applyPrivateControlCommand(localStorage,{schema:'kianos.control-browser-command.v1',command_id:'synthetic-home-command-001',command_hash:'c'.repeat(64),study_day:day,generated_at:stamp,expires_at:null,operations:[{kind:'english.session',payload:instruction},{kind:'exam.chat_plan',payload:plan}]},{day,now});
    const currentBasis=plans.buildExamChatPlanBasis(localStorage,day);
    return{applied:result.status,exposureChanged:initialBasis.subjects.english!==currentBasis.subjects.english,exposureSaved:Boolean(localStorage.getItem(exposure.ENGLISH_MATERIAL_EXPOSURE_KEY)),planStatus:plans.readExamChatPlan(localStorage,day).status,href:english.englishSessionStepHref(meta,'/')};
  });
  assert.equal(installed.applied,'applied');assert.equal(installed.exposureChanged,true);assert.equal(installed.exposureSaved,true);assert.equal(installed.planStatus,'ready');
  await page.waitForFunction(()=>document.querySelector('[data-exam-home]')?.dataset.chatPlanStatus==='ready');
  await page.locator('[data-english-resume-link]').waitFor({state:'visible'});
  assert.equal(await page.locator('[data-english-resume-link]').getAttribute('href'),installed.href);
  await page.screenshot({path:path.join(output,'home-plan-ready.png'),fullPage:false});

  const appendLexical=async({id,notify})=>{
    const native=await import('/src/lib/lexicalEvidence.mjs');
    const oldValue=localStorage.getItem(native.LEXICAL_LEDGER_STORAGE_KEY);
    const result=native.appendEvidenceEvent(JSON.parse(oldValue),{event_id:id,word_id:'word:synthetic-home-proof',target_kind:'sense',target_id:'sense:synthetic-home-proof',source:'reading',outcome:'WRONG',observed_at:new Date().toISOString(),demand:'recognition',attribution:'lexical',assistance:'unassisted',context_novelty:'unseen'});
    if(result.status!=='APPENDED')throw new Error('SYNTHETIC_LEXICAL_APPEND_FAILED:'+result.status);
    native.assertLexicalLedgerReadable(result.ledger);
    const newValue=JSON.stringify(result.ledger);localStorage.setItem(native.LEXICAL_LEDGER_STORAGE_KEY,newValue);
    if(notify)window.dispatchEvent(new StorageEvent('storage',{key:native.LEXICAL_LEDGER_STORAGE_KEY,oldValue,newValue,storageArea:localStorage,url:location.href}));
    return result.status;
  };
  await page.evaluate(appendLexical,{id:'synthetic-home-evidence-001',notify:true});
  await page.waitForFunction(()=>document.querySelector('[data-exam-home]')?.dataset.chatPlanStatus==='stale');
  assert.equal(await page.locator('[data-english-resume-link]').isVisible(),true);
  assert.equal(await page.locator('[data-english-resume-link]').getAttribute('href'),installed.href);
  await page.screenshot({path:path.join(output,'home-plan-stale-native-resume-retained.png'),fullPage:false});

  // A fresh Chat-issued plan is valid again; the second tab must invalidate it
  // through the browser's real cross-document storage event, without a focus event.
  await page.evaluate(async()=>{
    const control=await import('/src/lib/privateControlRuntime.mjs');
    const plans=await import('/src/lib/examChatPlan.mjs');
    const prior=JSON.parse(localStorage.getItem(plans.EXAM_CHAT_PLAN_KEY));
    const now=Date.now(),stamp=new Date(now).toISOString(),day=prior.study_day;
    const plan={...prior,generated_at:stamp,learner_evidence_basis:plans.buildExamChatPlanBasis(localStorage,day)};
    await control.applyPrivateControlCommand(localStorage,{schema:'kianos.control-browser-command.v1',command_id:'synthetic-home-command-002',command_hash:'d'.repeat(64),study_day:day,generated_at:stamp,expires_at:null,operations:[{kind:'exam.chat_plan',payload:plan}]},{day,now});
  });
  await page.waitForFunction(()=>document.querySelector('[data-exam-home]')?.dataset.chatPlanStatus==='ready');
  const second=await context.newPage();await second.goto(base+'/english/',{waitUntil:'domcontentloaded'});
  await second.waitForFunction(()=>Boolean(document.querySelector('[data-english-session-status]')?.textContent));
  assert.equal(await page.locator('[data-exam-home]').getAttribute('data-chat-plan-status'),'ready');
  await second.evaluate(appendLexical,{id:'synthetic-home-evidence-002',notify:false});
  await page.waitForFunction(()=>document.querySelector('[data-exam-home]')?.dataset.chatPlanStatus==='stale');
  assert.equal(await page.locator('[data-english-resume-link]').isVisible(),true);
  assert.equal(await page.locator('[data-english-resume-link]').getAttribute('href'),installed.href);
  await page.screenshot({path:path.join(output,'home-cross-tab-stale.png'),fullPage:false});
  assert.deepEqual(errors,[]);
  const report={status:'PASS',scope:'One composed real Home case, production browser imports and existing synthetic Writing identity',checks:{same_command_exposure_changes_native_evidence:true,same_command_plan_remains_ready:true,same_page_valid_lexical_change_stales_home:true,native_english_resume_remains_available:true,cross_tab_storage_event_stales_home_without_focus:true},protected_exam_body_used:false,real_learner_state_used:false,production_deployment:false,base};
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}catch(error){
  fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify({error:String(error),pageErrors:errors,browser:await page.evaluate(()=>({url:location.href,status:document.querySelector('[data-exam-home]')?.dataset.chatPlanStatus})).catch(()=>null)},null,2));throw error;
}finally{await context.close();await browser.close();}
