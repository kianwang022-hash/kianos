// Run with playwright-cli -s=<isolated session> run-code --filename <this file>.
// The session must point at an isolated candidate. No live user records are used.
async page => {
  const checks=[];
  const check=(ok,name,detail=null)=>{checks.push({name,pass:!!ok,detail});console.log(JSON.stringify(checks.at(-1)));if(!ok)throw Error(name+': '+JSON.stringify(detail));};
  const root=new URL(page.url()).origin;
  if(!/^http:\/\/127\.0\.0\.1:(?!4321\b)\d+$/.test(root))throw Error('Isolated loopback candidate required');
  const energy='/studyhub/assets/ENERGY_RESOURCES_SYSTEM_FOUNDATION_GUIDE/';
  const direction='/studyhub/assets/W5_DIRECTION_PRODUCTION_CAPITAL_STATE_CAPACITY_PILOT/';
  const requests=[];const errors=[];
  page.on('request',r=>{if(/__kianos-private|browserLearnerWriter|learnerPageRuntime|privateCheckpointRuntime|studyTimerClient|privateControlRuntime/.test(r.url()))requests.push(r.url());});
  page.on('pageerror',error=>errors.push(error.message));
  const position=()=>page.evaluate(()=>{
    const y=document.querySelector('.shToolbar').getBoundingClientRect().bottom+22;
    const p=[...document.querySelectorAll('[data-sh-article] [data-sh-block]')].find(n=>{const r=n.getBoundingClientRect();return r.height>0&&r.bottom>y;});
    const r=p.getBoundingClientRect();return {id:p.id,top:r.top,ratio:Math.max(0,(y-r.top)/r.height),y:scrollY};
  });
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(root+energy);await page.waitForFunction(()=>localStorage.getItem('kianos-studyhub-reader-v1:last'));
  check(await page.locator('[data-sh-anchor]').count()===6,'existing E1-E6 anchors');
  await page.locator('[data-sh-anchor][href="#energy-e3"]').click();
  await page.waitForTimeout(250);
  const before=await position();
  await page.getByRole('button',{name:'展开原有 Logic'}).click();
  await page.locator('[data-sh-context-body]').getByText('System Logic',{exact:true}).waitFor();
  check(await page.locator('[data-sh-context]').isVisible(),'existing source expands in place');
  await page.keyboard.press('Escape');
  const closed=await position();check(closed.id===before.id&&Math.abs(closed.y-before.y)<2,'close restores exact long-read position',{before,closed});
  await page.locator('[data-sh-font]').selectOption('24');await page.waitForTimeout(250);
  const resized=await position();check(resized.id===before.id&&Math.abs(resized.ratio-before.ratio)<0.03,'font size preserves visible paragraph',{before,resized});
  await page.reload();await page.waitForTimeout(300);
  const reloaded=await position();check(reloaded.id===resized.id&&Math.abs(reloaded.y-resized.y)<3,'reload resumes exact position',{resized,reloaded});
  check(await page.locator('[data-sh-font]').inputValue()==='24','font preference resumes');
  // Deterministic native DOM range. Pointer/keyboard controls are real browser inputs.
  const chosen=await page.evaluate(()=>{
    const p=[...document.querySelectorAll('[data-sh-article] p')].find(n=>n.textContent.includes('很多天然气发电机组需要持续获得天然气'));
    p.scrollIntoView({block:'center'});const range=document.createRange();range.selectNodeContents(p);const s=getSelection();s.removeAllRanges();s.addRange(range);document.dispatchEvent(new Event('selectionchange'));return p.textContent;
  });
  const atSelection=await position();
  await page.locator('[data-sh-ask]').focus();await page.keyboard.press('Enter');
  await page.locator('[data-sh-question-input]').fill('天然气和电力怎样形成相互依赖？');
  const payload=await page.locator('[data-sh-payload]').inputValue();
  check(payload.includes(chosen)&&payload.includes('相邻上下文（原文）')&&payload.includes('/blob/e02970bf')&&payload.includes('#energy-e3')&&payload.includes('怎样形成相互依赖'),'question includes quote, adjacent source context, canonical anchor and question');
  await page.context().grantPermissions(['clipboard-read','clipboard-write']);
  await page.locator('[data-sh-copy]').click();
  await page.waitForFunction(()=>document.querySelector('[data-sh-copy-status]').textContent.length>0);
  check((await page.locator('[data-sh-copy-status]').textContent()).includes('已复制'),'copy handoff succeeds without pretend AI');
  check(await page.evaluate(()=>navigator.clipboard.readText())===payload,'clipboard is complete payload');
  await page.keyboard.press('Escape');check(Math.abs((await position()).y-atSelection.y)<3,'keyboard dialog close preserves selection reading position');
  const next=page.locator('.shArticleFoot a').filter({hasText:'Meta 花 100 亿美元'});
  await next.scrollIntoViewIfNeeded();await page.waitForTimeout(250);const from=await position();
  await next.click();await page.waitForURL('**'+direction);await page.locator('[data-sh-return]').waitFor();
  await page.locator('[data-sh-return]').click();await page.waitForURL('**'+energy);await page.waitForTimeout(300);
  const returned=await position();check(returned.id===from.id&&Math.abs(returned.y-from.y)<3,'cross-article return restores source location',{from,returned});
  await page.locator('[data-sh-font]').selectOption('20');
  await page.locator('[data-sh-anchor][href="#energy-e4"]').click();await page.waitForTimeout(250);
  await page.screenshot({path:'output/playwright/desktop-reader-verified.png'});
  await page.setViewportSize({width:820,height:1180});await page.waitForTimeout(200);
  check(!(await page.locator('.shLogic').isVisible()),'iPad reader gives prose full width');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'iPad no horizontal page overflow');
  await page.screenshot({path:'output/playwright/ipad-reader.png'});
  const browser=page.context().browser();const mobileContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  try{
    const mobile=await mobileContext.newPage();
    await mobile.route('**/__kianos-current.json*',route=>route.fulfill({status:200,contentType:'application/json',body:'{"state":"synced","sha":"38530ebab"}'}));
    await mobile.goto(root+energy);await mobile.waitForTimeout(250);
    check(!(await mobile.locator('.shLogic').isVisible()),'phone Logic hidden');
    check(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'phone no horizontal page overflow');
    await mobile.locator('[data-sh-ask]').tap();
    check((await mobile.locator('[data-sh-status]').textContent()).includes('先在正文中选中'),'touch no-selection hint honest');
    await mobile.locator('[data-sh-article] details summary').first().tap();
    const preview=mobile.locator('[data-sh-article] [data-sh-preview]').first();await preview.tap();
    await mobile.locator('[data-sh-context-body]').getByText('System Logic',{exact:true}).waitFor();
    await mobile.getByRole('button',{name:'回到刚才的位置'}).tap();
    check(!(await mobile.locator('[data-sh-context]').isVisible()),'touch source expansion and close');
    await mobile.locator('[data-sh-article] details summary').first().tap();
    await mobile.evaluate(()=>window.scrollTo(0,0));
    await mobile.screenshot({path:'output/playwright/phone-reader.png'});
  }finally{await mobileContext.close();}
  await page.bringToFront();
  await page.goto(root+'/studyhub/assets/W5_DIRECTION_PRODUCTION_CAPITAL_STATE_CAPACITY_LOGIC/');
  const expected=await page.evaluate(async()=>{
    const response=await fetch(document.querySelector('[data-sh-preview$="#w5-d3"]').dataset.shPreview.split('#')[0]);
    const doc=new DOMParser().parseFromString(await response.text(),'text/html');
    const anchor=doc.querySelector('#w5-d3');let node=anchor;while(node.parentElement!==doc.querySelector('[data-sh-article]'))node=node.parentElement;
    return {heading:node.nextElementSibling.textContent,paragraph:node.nextElementSibling.nextElementSibling.textContent};
  });
  await page.locator('[data-sh-preview$="#w5-d3"]').click();
  await page.waitForFunction(text=>document.querySelector('[data-sh-context-body]').textContent.includes(text),expected.paragraph);
  const excerpt=await page.locator('[data-sh-context-body]').textContent();
  check(excerpt.includes(expected.heading)&&excerpt.includes(expected.paragraph),'explicit source anchor expands its real heading and prose');
  await page.getByRole('button',{name:'回到刚才的位置'}).click();
  const originalLinkText=await page.evaluate(()=>{
    const paragraph=document.querySelector('[data-sh-article] p:has([data-sh-preview])');
    const clone=paragraph.cloneNode(true);clone.querySelectorAll('[data-sh-preview],[data-sh-ui]').forEach(n=>n.remove());
    const range=document.createRange();range.selectNodeContents(paragraph);getSelection().removeAllRanges();getSelection().addRange(range);document.dispatchEvent(new Event('selectionchange'));return clone.textContent.trim();
  });
  await page.locator('[data-sh-ask]').click();
  check((await page.locator('[data-sh-quote]').textContent())===originalLinkText,'selection retains source link text and excludes preview UI');
  check(!(await page.locator('[data-sh-payload]').inputValue()).includes('展开原文'),'adjacent copied original context excludes injected UI');
  await page.keyboard.press('Escape');
  await page.evaluate(()=>{window.__originalFetch=window.fetch;window.__pendingPreviews=[];window.fetch=()=>new Promise((resolve,reject)=>window.__pendingPreviews.push({resolve,reject}));});
  try{
    const button=page.locator('[data-sh-preview$="#w5-d3"]');
    await button.click();await page.getByRole('button',{name:'回到刚才的位置'}).click();
    await button.click();
    await page.evaluate(()=>window.__pendingPreviews[1].resolve(new Response('<div data-sh-reader data-sh-title="Synthetic preview"></div><article data-sh-article><p id="w5-d3">Newest synthetic preview</p></article>')));
    await page.getByText('Newest synthetic preview',{exact:true}).waitFor();
    await page.evaluate(()=>window.__pendingPreviews[0].reject(new Error('Old synthetic error')));await page.waitForTimeout(50);
    check((await page.locator('[data-sh-context-body]').textContent())==='Newest synthetic preview','late old failure cannot replace the new successful preview');
    await page.getByRole('button',{name:'回到刚才的位置'}).click();
    await button.click();await page.getByRole('button',{name:'回到刚才的位置'}).click();
    await page.evaluate(()=>window.__pendingPreviews[2].reject(new Error('Closed synthetic error')));await page.waitForTimeout(50);
    check(!(await page.locator('[data-sh-context]').isVisible())&&!(await page.locator('[data-sh-context-body]').textContent()).includes('暂时无法'),'failure after close cannot mutate hidden preview or reading state');
    await button.click();await page.evaluate(()=>window.__pendingPreviews[3].reject(new Error('Current synthetic error')));
    await page.locator('[data-sh-context-body]').filter({hasText:'暂时无法展开'}).waitFor();
    check(true,'current request failure remains visible');await page.getByRole('button',{name:'回到刚才的位置'}).click();
  }finally{await page.evaluate(()=>{window.fetch=window.__originalFetch;delete window.__originalFetch;delete window.__pendingPreviews;});}
  check(requests.length===0,'no learner/private/timer/control modules or requests',requests);
  const keys=await page.evaluate(()=>Object.keys(localStorage));
  check(keys.every(k=>k.startsWith('kianos-studyhub-reader-v1:')||k==='kianos-global-rail-expanded-v1'),'reader only writes UI position/preferences',keys);
  check(errors.length===0,'no uncaught reader browser errors',errors);
  return {pass:true,checks};
}
