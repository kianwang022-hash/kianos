import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
import {loadXizongBlock} from '../src/lib/xizong.mjs';

const base=process.env.KIANOS_XIZONG_TEST_BASE_URL;
const url=new URL(base);
assert.ok(['localhost','127.0.0.1'].includes(url.hostname)&&url.port==='4322','isolated Candidate 4322 required');
const block=loadXizongBlock('hematology-immunity-infection','h01');
const raw=fs.readFileSync('../'+block.sourcePath,'utf8');
const expected=raw.match(/^> \*\*主提示：(三系3任务[^\n]+)\*\*$/m)?.[1];
assert.ok(expected,'independent authored whole-bold Prompt required');
const browser=await chromium.launch({headless:true,...(process.env.KIANOS_TEST_CHROME?{executablePath:process.env.KIANOS_TEST_CHROME}:{})});
const report={evidence:'ISOLATED_BROWSER_NOT_LEARNER_U',checks:[]};
const check=(ok,label)=>{assert.ok(ok,label);report.checks.push(label);};
try {
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base+'/xizong/hematology-immunity-infection/h01/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active'&&Boolean(document.querySelector('[data-xizong-v6-block]')?.getXizongStudyPosition));
 if(await page.locator('[data-stage-next="logic_group"]').isVisible())await page.locator('[data-stage-next="logic_group"]').click();
 const frame=page.locator('[data-study-stage="source_contact"]:not([hidden]) [data-learner-kp-companion="source_contact"]');await frame.waitFor({state:'visible'});
 check(await frame.getAttribute('data-kp-id')==='hematology-h01-kp01','same exact KP, no group-based reindex');
 const prompt=frame.locator('.xv6KpLearnPrompt p');
 check(await prompt.innerText()===expected,'raw original Prompt reaches visible Website verbatim');
 check(block.kpRecords[0].prompt===expected,'Chat/native reader matches raw original');
 const payload=JSON.parse(await page.locator('[data-xizong-learner-object-payload]').textContent());
 check(JSON.stringify(payload.logicGroups.at(-1).kpIds)===JSON.stringify(['hematology-h01-kp01','hematology-h01-kp12','hematology-h01-kp13']),'non-contiguous C membership preserved');
 await frame.locator('[data-kp-prompt-edit]').click();await frame.locator('[data-kp-prompt-input]').fill('工程验收：个人覆盖保留');await frame.locator('[data-kp-prompt-save]').click();
 check(await prompt.innerText()==='工程验收：个人覆盖保留','personal override remains separate');
 await frame.locator('[data-kp-prompt-edit]').click();await frame.locator('[data-kp-prompt-reset]').click();
 check(await prompt.innerText()===expected,'restore default uses recovered authored Prompt');
 const state=await page.evaluate(id=>JSON.parse(localStorage.getItem('kianos-xizong-astro-v2:'+id)),block.objectId);
 check(Object.values(state.learned||{}).filter(Boolean).length===0&&Object.keys(state.ratings||{}).length===0,'no learner performance fabricated');
 check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),'no horizontal overflow');
 assert.deepEqual(errors,[]);
 // These two targets are raw-owner extraction regressions, not new Content.
 // An optional immutable pre-fix snapshot proves source/evidence-version identity.
 const baselinePath=process.env.KIANOS_METADATA_BASELINE;
 const baseline=baselinePath?JSON.parse(fs.readFileSync(baselinePath,'utf8')):null;
 report.preFixVersionWitness=baseline?'PROVIDED_AND_CHECKED':'NOT_PROVIDED';
 for(const [blockId,kpId,index] of [['E1','repro-path-e1-kp01',0],['E5','repro-path-e5-kp03',2]]) {
  const target=loadXizongBlock('reproductive-breast',blockId);
  const original=fs.readFileSync('../'+target.sourcePath,'utf8');
  const lines=original.split(/\r?\n/);
  const heading=lines.findIndex(line=>new RegExp('^#{2,4} KP0?'+(index+1)+'[｜|]').test(line));
  assert.ok(heading>=0,'independent exact KP heading');
  const row=lines.slice(heading+1).find(line=>line.trim().startsWith('>'));
  const authored=row?.match(/^> \*\*讲义定位 →\*\* (.+?)｜\*\*主提示：(.+)\*\*\s*$/);
  assert.ok(authored,'independent exact inline Source/Prompt declaration');
  const expectedSource=authored[1],expectedPrompt=authored[2];
  const version=[target.sourceHash,target.systemSourceHash,target.learningSupportSourceHash].join(':');
  let preVersion=version;
  if(baseline){
   const previous=baseline.find(x=>x.block.systemId===target.systemId&&x.block.blockId===target.blockId)?.block;
   assert.ok(previous,'pre-fix target snapshot missing');
   preVersion=[previous.sourceHash,previous.systemSourceHash,previous.learningSupportSourceHash].join(':');
   check(preVersion===version,blockId+' parser repair does not change evidence version');
  }
  const ctx=await browser.newContext({viewport:{width:1440,height:900}}),p=await ctx.newPage(),pageErrors=[];
  p.setDefaultTimeout(15000);p.on('pageerror',e=>pageErrors.push(String(e)));
  const ready=()=>p.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active'&&Boolean(document.querySelector('[data-xizong-v6-block]')?.getXizongStudyPosition));
  await p.goto(base+'/xizong/reproductive-breast/'+target.slug+'/',{waitUntil:'domcontentloaded'});await ready();
  if(await p.locator('[data-stage-next="logic_group"]').isVisible())await p.locator('[data-stage-next="logic_group"]').click();
  const frame=p.locator('[data-study-stage="source_contact"]:not([hidden]) [data-learner-kp-companion="source_contact"]');
  await frame.waitFor({state:'visible'});
  for(let i=0;i<index;i++)await p.locator('[data-xizong-v6-block] [data-companion-next="source_contact"]').click();
  const prompt=frame.locator('.xv6KpLearnPrompt p');
  check(await frame.getAttribute('data-kp-id')===kpId,blockId+' exact current KP');
  check(await prompt.innerText()===expectedPrompt,blockId+' inline Prompt reaches visible surface verbatim');
  check((await p.locator('[data-study-active-kp] .portedStudyActiveKpMeta').innerText()).includes('讲义 · '+expectedSource),blockId+' Source locator excludes the Prompt');
  const payload=JSON.parse(await p.locator('[data-xizong-learner-object-payload]').textContent());
  const native=payload.kps.find(k=>k.identity.kpId===kpId);
  check(native.prompt.canonical===expectedPrompt&&native.source.locator===expectedSource,blockId+' raw/native/learner values agree');
  const studyKey='kianos-xizong-astro-v2:'+target.objectId;
  const extKey='kianos-xizong-memory-review-v2:'+target.objectId;
  const metaKey='kianos-xizong-evidence-meta-v1:'+target.objectId;
  const priorEvent={type:'KP_RECALL',kp_id:kpId,rating:'known',evidence_origin:'ENGINEERING_ACCEPTANCE_FIXTURE',source_hash:target.sourceHash,recorded_at:'2026-09-30T00:00:00Z'};
  const before=await p.evaluate(({studyKey,extKey,metaKey,kpId,index,preVersion,priorEvent})=>{
   const state=JSON.parse(localStorage.getItem(studyKey));
   state.kpIndex=index;state.learned={...state.learned,[kpId]:true};state.ratings={...state.ratings,[kpId]:'known'};
   localStorage.setItem(studyKey,JSON.stringify(state));localStorage.setItem(extKey,JSON.stringify({evidenceHistory:[priorEvent]}));
   localStorage.setItem(metaKey,JSON.stringify({version:preVersion,observed_at:'2026-09-30T00:00:00Z'}));
   return {state,archiveKeys:Object.keys(localStorage).filter(k=>k.startsWith('kianos-xizong-stale-evidence-v1:'))};
  },{studyKey,extKey,metaKey,kpId,index,preVersion,priorEvent});
  await frame.locator('[data-kp-prompt-edit]').click();await frame.locator('[data-kp-prompt-input]').fill('工程验收：保留个人 '+kpId);await frame.locator('[data-kp-prompt-save]').click();
  await p.reload({waitUntil:'domcontentloaded'});await ready();await frame.waitFor({state:'visible'});
  check(await frame.getAttribute('data-kp-id')===kpId,blockId+' prior-version position not restarted');
  check(await prompt.innerText()==='工程验收：保留个人 '+kpId,blockId+' private Prompt survives parser repair');
  const after=await p.evaluate(({studyKey,extKey})=>({state:JSON.parse(localStorage.getItem(studyKey)),extension:JSON.parse(localStorage.getItem(extKey)),archiveKeys:Object.keys(localStorage).filter(k=>k.startsWith('kianos-xizong-stale-evidence-v1:'))}),{studyKey,extKey});
  assert.deepEqual(after.archiveKeys,before.archiveKeys);assert.deepEqual(after.state.learned,before.state.learned);assert.deepEqual(after.state.ratings,before.state.ratings);
  assert.equal(after.state.completed,before.state.completed);assert.ok(after.extension.evidenceHistory.some(e=>JSON.stringify(e)===JSON.stringify(priorEvent)));
  check(true,blockId+' no archive/reset/new mastery; synthetic old evidence preserved');
  await frame.locator('[data-kp-prompt-edit]').click();await frame.locator('[data-kp-prompt-reset]').click();
  check(await prompt.innerText()===expectedPrompt,blockId+' reset resolves authored inline default');
  const packet=await p.evaluate(()=>{let packet;document.querySelector('[data-xizong-v6-block]').dispatchEvent(new CustomEvent('kianos:xizong-request-study-packet',{detail:{accept:value=>packet=value}}));return packet;});
  const evidence=packet?.kp_evidence.find(k=>k.kp_id===kpId);
  check(packet?.learning_state.resume.kp_id===kpId&&evidence.prompt===expectedPrompt&&evidence.source_locator===expectedSource&&evidence.prompt_override==='',blockId+' native Packet carries corrected Prompt/Source and exact Resume');
  assert.deepEqual(pageErrors,[]);
  await p.screenshot({path:'.qa/metadata-'+blockId+'.png'});await ctx.close();
 }
 report.status='PASS';
 await page.screenshot({path:'.qa/metadata-c-h01.png'});
} catch(e){report.status='FAIL';report.error=String(e.stack||e);throw e;}
finally{await browser.close();fs.mkdirSync('.qa',{recursive:true});fs.writeFileSync('.qa/xizong-kp-metadata-browser.json',JSON.stringify(report,null,2));}
console.log(`Xizong authored metadata browser PASS: ${report.checks.length} checks; H1/E1/E5 raw→visible Prompt, clean locators, private override/Resume preserved; isolated synthetic evidence only.`);
