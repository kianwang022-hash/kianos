import assert from 'node:assert/strict';import fs from 'node:fs';import {chromium} from 'playwright';
const browser=await chromium.launch({headless:false});const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4349/reading/fixture-reading/');
 await page.locator('[data-question]').first().locator('[data-option=A]').click();
 const before=await page.evaluate(()=>({...localStorage}));
 await page.locator('.portedReadingPassage p').first().evaluate(e=>{const text=e.firstChild;const start=text.textContent.indexOf('equipment');const range=document.createRange();range.setStart(text,start);range.setEnd(text,start+9);getSelection().removeAllRanges();getSelection().addRange(range);document.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));});
 await page.locator('[data-lexical-lookup-link]').waitFor({state:'visible'});await page.click('[data-lexical-lookup-link]');
 await page.locator('[data-lexical-reference] [data-vocab-details]').waitFor();
 assert.equal(await page.locator('[data-lexical-reference] button').count(),0);assert.match(await page.locator('[data-lookup-status]').textContent(),/只读/);
 assert.deepEqual(await page.evaluate(()=>({...localStorage})),before);
 await page.screenshot({path:'../output/playwright/issue148/lexical-readonly-return.png'});
 await page.click('[data-lexical-exact-return]');await page.locator('[data-question]').first().waitFor();assert.deepEqual(await page.evaluate(()=>({...localStorage})),before);
 assert.deepEqual(errors,[]);fs.writeFileSync('../output/playwright/issue148/lexical-browser.json',JSON.stringify({status:'PASS',checks:['exact Current lookup','production reference renderer reused','no lexical learner Runtime executed','localStorage unchanged','exact Reading return and first choice preserved'],learnerU:'NOT_TESTED'},null,2));console.log('PASS Lexical read-only exact Return and storage identity');
}finally{await browser.close()}
