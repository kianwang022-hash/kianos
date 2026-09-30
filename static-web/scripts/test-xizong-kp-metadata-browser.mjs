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
 assert.deepEqual(errors,[]);report.status='PASS';
 await page.screenshot({path:'.qa/metadata-c-h01.png'});
} catch(e){report.status='FAIL';report.error=String(e.stack||e);throw e;}
finally{await browser.close();fs.mkdirSync('.qa',{recursive:true});fs.writeFileSync('.qa/xizong-kp-metadata-browser.json',JSON.stringify(report,null,2));}
console.log(`Xizong authored metadata browser PASS: ${report.checks.length} checks; H1 raw→visible Prompt and existing personal override, no learner evidence.`);
