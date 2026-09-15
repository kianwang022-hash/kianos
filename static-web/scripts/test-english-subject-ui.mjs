import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { marked } from 'marked';
import { listWritingSyntheticTasks } from '../src/lib/englishWritingSynthetic.mjs';
import { testEnglishResumeContract } from './test-english-resume-contract.mjs';

// Actual production renderers + already-owned synthetic material. This suite
// never opens a protected exam task and never connects to a real learner store.
const root = path.resolve('..');
const out = path.resolve('../objective-audit/english-subject-ui');
fs.mkdirSync(out, { recursive: true });
const report = {scope:'English whole-subject UI / synthetic execution / SELF',learnerU:'NOT_TESTED',checks:[],views:[],fonts:[],catalogRows:[],errors:[]};
const pass = name => {report.checks.push(name);console.log('PASS English:',name);};
const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));
const servers = [];
let browser;
function command(args, name, timeout=240000) {
  const run=spawnSync(process.execPath,args,{cwd:process.cwd(),encoding:'utf8',env:{...process.env,KIANOS_REPO_ROOT:root},timeout,maxBuffer:32*1024*1024});
  fs.writeFileSync(path.join(out,`${name}.log`),(run.stdout||'')+(run.stderr||'')+(run.error?.stack||''));
  assert.equal(run.status,0,`${name}: ${run.error?.message || (run.stderr||run.stdout||'').slice(-1800)}`);
}
async function serve(directory) {
  const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
  const server=http.createServer((req,res)=>{
    try {
      const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
      let file=path.resolve(directory,`.${name}`);
      if(!file.startsWith(directory+path.sep)&&file!==directory){res.writeHead(403);return res.end();}
      if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
      if(!fs.existsSync(file)){res.writeHead(404);return res.end('Not found');}
      res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
      fs.createReadStream(file).pipe(res);
    }catch{res.writeHead(400);res.end();}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  servers.push(server);return `http://127.0.0.1:${server.address().port}`;
}
const read=(page,key)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null'),key);
async function noOverflow(page,label) {
  const detail=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth}));
  assert.ok(detail.width<=detail.viewport+1,`${label}: horizontal overflow ${JSON.stringify(detail)}`);
}
async function fontProbe(page,selector,label,minSize) {
  const node=page.locator(`${selector}:visible`).first();await node.waitFor();
  const style=await node.evaluate(el=>{el.setAttribute('data-english-qa-font','');const s=getComputedStyle(el);return{family:s.fontFamily,size:parseFloat(s.fontSize),weight:s.fontWeight,text:el.textContent?.trim().slice(0,70)};});
  assert.ok(style.text&&style.size>=minSize,`${label} actual text size ${JSON.stringify(style)}`);
  const session=await page.context().newCDPSession(page);
  await session.send('DOM.enable');await session.send('CSS.enable');
  const doc=await session.send('DOM.getDocument');
  const {nodeId}=await session.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'[data-english-qa-font]'});
  const {fonts}=await session.send('CSS.getPlatformFontsForNode',{nodeId});
  assert.ok(fonts.some(font=>font.glyphCount>0),`${label}: no actual glyph evidence`);
  assert.ok(fonts.every(font=>!/(serif|mincho|songti|times|georgia)/i.test(font.familyName)),`${label}: serif fallback ${JSON.stringify(fonts)}`);
  report.fonts.push({label,...style,fonts});
  await node.evaluate(el=>el.removeAttribute('data-english-qa-font'));await session.detach();
}
async function selectText(page,selector,text) {
  await page.evaluate(({selector,text})=>{
    const owner=document.querySelector(selector);const walker=document.createTreeWalker(owner,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())){const offset=node.textContent.indexOf(text);if(offset<0)continue;const range=document.createRange();range.setStart(node,offset);range.setEnd(node,offset+text.length);getSelection().removeAllRanges();getSelection().addRange(range);document.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));return;}
    throw Error(`QA_TEXT_NOT_FOUND:${text}`);
  },{selector,text});
}
try {
  for(const check of testEnglishResumeContract())pass(`Resume: ${check}`);
  command(['node_modules/astro/astro.js','build','--root','scripts/fixtures/site-frame'],'synthetic-build');
  const base=await serve(path.resolve('scripts/fixtures/site-frame/dist'));
  const production=await serve(path.resolve('dist'));
  browser=await chromium.launch();
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',error=>report.errors.push(error.message));
  const go=async(route,host=base)=>{const res=await page.goto(host+route);assert.equal(res.status(),200,route);await page.evaluate(async()=>{await document.fonts.ready;});};
  const shot=async name=>{await page.screenshot({path:path.join(out,`${name}.png`)});await noOverflow(page,name);};
  const tasks=listWritingSyntheticTasks();assert.equal(tasks.length,2);
  const views=[
    ['home','/english/','.englishEntryFamilies p',18,production],
    ['catalog-reading','/reading/','.readingHomeHero p',18,production],
    ['catalog-cloze','/cloze/','.objectiveHomeHero p',18,production],
    ['catalog-part-b','/reading-b/','.objectiveHomeHero p',18,production],
    ['catalog-translation','/translation/','.translationHero p',18,production],
    ['catalog-writing','/writing/','.writingHomeHero p',18,production],
    ['reading','/reading/fixture-reading/','.portedReadingPassage p',20],
    ['cloze','/cloze/fixture-cloze/','.clozePassage p',20],
    ...['gap_match','heading_match','ordering','comment_match'].map(form=>[`part-b-${form}`,`/reading-b/fixture-${form}/`,'.readingBCandidates p span',19]),
    ['translation','/translation/fixture-translation/','.translationSegment p',19],
    ...tasks.map(task=>[`writing-${task.kind}`,`/writing/${task.id}/`,'.writingPromptBody blockquote',19]),
    ['guide-objective','/objective-learn/','.objectiveLearnContent p',19],
    ['guide-translation','/translation-learn/','.translationLearnMain .markdownBody p',19],
    ['guide-writing','/writing-learn/','.writingStage .markdownBody p',19]
  ];
  for(const [name,route,selector,size,host=base] of views){
    for(const width of [1440,1728,1024,390]){
      await page.setViewportSize({width,height:width===1728?1117:900});await go(route,host);
      if(width===1440)await fontProbe(page,selector,name,size);
      await shot(`${name}-${width}`);
      if (name.startsWith('catalog-') && name !== 'catalog-writing') {
        const row = page.locator('[data-reading-results]>a,[data-objective-results]>a,[data-translation-results]>a').first();
        await row.waitFor();
        const layout = await row.evaluate(el => {
          const title = el.querySelector('strong'), source = el.querySelector('span'), count = el.querySelector('small');
          const a = title.getBoundingClientRect(), b = source.getBoundingClientRect(), c = count.getBoundingClientRect();
          return { display:getComputedStyle(el).display, decoration:getComputedStyle(el).textDecorationLine,
            title: title.textContent, source: source.textContent, titleSize:parseFloat(getComputedStyle(title).fontSize),
            titleWeight:Number(getComputedStyle(title).fontWeight), separate: b.top >= a.bottom-1,
            countSeparate: c.left >= b.right-1, rowWidth:el.clientWidth, contentWidth:el.scrollWidth };
        });
        assert.equal(layout.display,'grid',`${name} dynamic result row missed its layout`);
        assert.equal(layout.decoration,'none',`${name} browser-default link decoration`);
        assert.ok(layout.titleSize>=18 && layout.titleWeight>=700 && layout.separate && layout.countSeparate,
          `${name}/${width}: missing title/source/count hierarchy ${JSON.stringify(layout)}`);
        assert.ok(layout.contentWidth <= layout.rowWidth+1,`${name}/${width} row content overflow`);
        report.catalogRows.push({name,width,...layout});
      }
      report.views.push({name,width,route});
    }
  }
  pass('Dynamic catalog rows: title/source/count hierarchy and non-clipping at all four widths');
  pass('18 English catalog/task/Guide/entry views: actual sans glyphs and 1440/1728/1024/390 overflow checks');
  await page.setViewportSize({width:1440,height:900});
  await go('/english/',production);assert.equal(await page.locator('[data-site-resume-subject=english]').isVisible(),false);
  assert.equal(await page.locator('.englishEntryFamilies>section').count(),3);
  pass('Empty English Home has three direct families and optional Guides, no fabricated Resume');
  for (const [route, prefix] of [['reading','reading'],['cloze','objective'],['reading-b','objective'],['translation','translation']]) {
    await go(`/${route}/`,production);
    const before=await page.evaluate(()=>JSON.stringify(Object.entries(localStorage)));
    assert.match(await page.locator('[data-catalog-entry-label]').innerText(),/打开/);
    await page.locator(`[data-${prefix}-search]`).fill('QA_NO_MATCH_7deaa92b');
    assert.equal(await page.locator(`[data-${prefix}-results] a`).count(),0);
    assert.equal(await page.evaluate(()=>JSON.stringify(Object.entries(localStorage))),before);
  }
  pass('All four exam catalogs: truthful start labels, working search and non-mutating browsing without opening protected tasks');

  await go('/reading/fixture-reading/');
  assert.equal(await page.locator('[data-question]:visible').count(),5);
  assert.equal(await page.locator('[data-reading-answer-strip]:visible').count(),0);
  const panes=await page.locator('.portedReadingColumns').evaluate(el=>[...el.children].map(e=>({x:e.getBoundingClientRect().x,overflow:getComputedStyle(e).overflowY})));
  assert.ok(panes[0].x<panes[1].x&&panes.every(x=>x.overflow==='auto'));
  for(let i=0;i<5;i++)await page.locator('[data-question]').nth(i).locator(`[data-option=${i===0?'B':'A'}]`).click();
  await page.locator('[data-question]').nth(1).locator('.portedUncertain').click();
  assert.equal(await page.locator('.portedReadingOptions .result-correct,.portedReadingOptions .result-wrong').count(),0);
  const key='kianos-reading-attempt-v1:fixture-reading';
  const attempt=await read(page,key);
  await page.locator('.portedReadingQuestions').evaluate(el=>el.scrollTop=260);
  await page.locator('.portedReadingPassage').evaluate(el=>el.scrollTop=140);
  const position=await page.evaluate(()=>[document.querySelector('.portedReadingQuestions').scrollTop,document.querySelector('.portedReadingPassage').scrollTop]);
  await page.locator('[data-task-guide-link]').click();await page.locator('.objectiveLearnContent').waitFor();
  await page.locator('[data-task-guide-link]').click();await page.locator('[data-local-port=reading]').waitFor();
  assert.deepEqual((await read(page,key)).answers,attempt.answers);
  await page.waitForFunction(expected=>Math.abs(document.querySelector('.portedReadingQuestions').scrollTop-expected[0])<=2&&Math.abs(document.querySelector('.portedReadingPassage').scrollTop-expected[1])<=2,position);
  pass('Reading full sheet, independent panes, pre-submit gating and exact Guide return with answers/scroll');
  await page.locator('[data-reading-submit]').click();await page.locator('[data-reading-result]').waitFor({state:'visible'});
  assert.equal((await page.locator('[data-reading-score]').innerText()).trim(),'4 / 5');
  assert.equal(await page.locator('[data-question]:visible').count(),5);
  await shot('reading-submitted');await page.reload();await page.locator('[data-reading-result]').waitFor({state:'visible'});
  assert.deepEqual((await read(page,key)).answers,attempt.answers);
  pass('Reading wrong/uncertain review remains on the full sheet and survives refresh');

  await go('/cloze/fixture-cloze/');assert.equal(await page.locator('.clozeQuestion:visible').count(),20);
  const columns=await page.locator('.clozeOptions').first().evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
  assert.equal(columns,4);
  await page.locator('[data-cloze-source-blank="7"]').click();
  assert.ok(await page.locator('.clozeQuestion').nth(7).evaluate(el=>el.contains(document.activeElement)));
  for(let i=0;i<20;i++)await page.locator('.clozeQuestion').nth(i).locator(`[data-value=${i===0?'B':'A'}]`).click();
  const cloze=await read(page,'kianos-cloze-attempt-v1:fixture-cloze');
  await page.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'b',code:'KeyB',isComposing:true,bubbles:true})));
  assert.deepEqual((await read(page,'kianos-cloze-attempt-v1:fixture-cloze')).answers,cloze.answers);
  assert.equal(await page.locator('[data-objective-formal]:visible').count(),0);
  await page.locator('[data-objective-submit]').click();await page.locator('[data-objective-result-summary]').waitFor({state:'visible'});
  assert.equal((await page.locator('[data-objective-score]').innerText()).trim(),'19 / 20');await shot('cloze-submitted');
  pass('Cloze 20-row/four-option geometry, source-to-blank focus, IME isolation and whole-set result');

  for(const form of ['gap_match','heading_match','ordering','comment_match']){
    await go(`/reading-b/fixture-${form}/`);assert.equal(await page.locator('[data-reading-b-candidate]').count(),7);
    assert.equal(await page.locator('[data-reading-b-select]').count(),5);
    if(form==='ordering')assert.equal(await page.locator('[data-reading-b-fixed]').count(),2);
    await page.locator('[data-reading-b-select]').first().selectOption('B');
    assert.equal(await page.locator('[data-reading-b-select]').nth(1).locator('option[value=B]').isDisabled(),true);
    for(let i=1;i<5;i++)await page.locator('[data-reading-b-select]').nth(i).selectOption('BCDEF'[i]);
    await page.locator('[data-objective-submit]').click();await page.locator('[data-objective-result-summary]').waitFor({state:'visible'});
    assert.equal((await page.locator('[data-objective-score]').innerText()).trim(),'5 / 5');
    assert.equal(await page.locator('[data-reading-b-select]').count(),5);await shot(`part-b-${form}-submitted`);
  }
  pass('All four Part B forms preserve full pool/map, single-use constraints, fixed givens and whole-set submit');

  await go('/translation/fixture-translation/');
  const translationKey='kianos-translation-attempt-v2:fixture-translation';
  assert.equal(await page.locator('[data-reference-panel]:visible,[data-complete-reference]:visible').count(),0);
  for(let i=0;i<5;i++)await page.locator('[data-attempt-id]').nth(i).fill(`隔离测试译文 ${i+1}：保留完整意义与关系。`);
  await page.reload();assert.match(await page.locator('[data-attempt-id]').first().inputValue(),/隔离测试/);
  await page.evaluate(()=>{window.__englishSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('kianos-translation-attempt-v2:'))throw new DOMException('Isolated QA','QuotaExceededError');return window.__englishSet.call(this,k,v);};});
  await page.locator('[data-freeze-first]').click();assert.equal((await read(page,translationKey)).stage,'attempt');
  await page.evaluate(()=>Storage.prototype.setItem=window.__englishSet);
  await page.locator('[data-freeze-first]').click();await page.locator('[data-stage=decision]').waitFor({state:'visible'});
  const first=(await read(page,translationKey)).firstAttempts;assert.equal(Object.keys(first).length,5);
  await page.locator('[data-pass-clean]').click();await page.locator('[data-stage=passed]').waitFor({state:'visible'});
  assert.deepEqual((await read(page,translationKey)).firstAttempts,first);await shot('translation-passed');
  await go('/english/');
  const afterPass=await page.locator('[data-site-resume-subject=english]').getAttribute('href');
  assert.ok(!afterPass || !afterPass.includes('/translation/fixture-translation/'), 'Completed translation must leave Resume; other real unfinished work may remain');
  pass('Translation full five-part writing, save-failure protection, immutable first attempt and clean PASS exit');

  for(const task of tasks){
    await go(`/writing/${task.id}/`);await page.locator('[data-plan-mode][value=direct]').check();
    assert.equal(await page.locator('[data-plan-field]').isVisible(),false);
    const draft='Dear volunteers, thank you for helping us with the library trial. Please record each loan and return the equipment before closing time. Your observations will help us improve the service. Best regards, the coordinator.';
    await page.locator('[data-essay-draft]').fill(draft);
    const box=await page.locator('[data-essay-draft]').boundingBox();assert.ok(box.width>600&&box.height>=350);
    await shot(`writing-${task.kind}-draft`);await page.reload();assert.equal(await page.locator('[data-essay-draft]').inputValue(),draft);
    await page.locator('[data-lock-first]').click();await page.locator('[data-runtime-stage=review]').waitFor({state:'visible'});
    const original=(await read(page,`kianos-writing-runtime-v1:${task.id}`)).firstDraft;
    await page.locator('[data-authoring-revision]').fill('A separate learner revision. It does not replace the first draft.');
    await page.locator('[data-save-authoring-revision]').click();await page.reload();
    assert.equal((await read(page,`kianos-writing-runtime-v1:${task.id}`)).firstDraft,original);
    assert.match(await page.locator('[data-authoring-revision]').inputValue(),/separate learner revision/);
    await shot(`writing-${task.kind}-revision`);
  }
  pass('Small and Big synthetic Writing: dominant full editor, Direct mode, refresh and independent revision');

  await go('/objective-learn/');
  const expected=await marked.parse(fs.readFileSync(path.join(root,'content/english/modules/objective-learning.md'),'utf8'));
  const matches=await page.evaluate(html=>{const el=document.createElement('div');el.innerHTML=html;const clean=s=>s.replace(/\s+/g,' ').trim();return clean(el.textContent)===clean(document.querySelector('.objectiveLearnContent').textContent);},expected);
  assert.equal(matches,true);pass('Complete Objective Guide rendered text equals its Current Markdown owner, not a reduced summary');
  await context.close();

  // Fresh contexts isolate async failure/selection races from prior cached lookup.
  const indexRows=await fetch(base+'/lexical-index.json').then(r=>r.json());
  const library=indexRows.filter(x=>x.word.toLowerCase()==='library');assert.equal(library.length,1);
  for(const variant of ['real','delay','failure','duplicate']){
    const ctx=await browser.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>report.errors.push(e.message));
    if(variant!=='real')await p.route('**/lexical-index.json',async route=>{
      if(variant==='delay')await sleep(180);
      await route.fulfill({status:variant==='failure'?503:200,contentType:'application/json',body:JSON.stringify(variant==='duplicate'?[library[0],library[0]]:indexRows)});
    });
    await p.goto(base+'/reading/fixture-reading/');await p.locator('[data-local-port=reading]').waitFor();
    await selectText(p,'.portedReadingPassage p','library');
    if(variant==='delay'){
      await p.evaluate(()=>{getSelection().removeAllRanges();document.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));});await sleep(350);
      assert.equal(await p.locator('[data-english-lexical-bridge]').isVisible(),false);
    } else if(variant==='real'){
      await p.locator('[data-lexical-lookup-link]').waitFor({state:'visible'});
      const href=new URL(await p.locator('[data-lexical-lookup-link]').getAttribute('href'));
      assert.equal(href.searchParams.get('object'),library[0].objectId);
      const before=await p.evaluate(()=>JSON.stringify(Object.keys(localStorage).filter(k=>/lexical|vocab/i.test(k)).sort().map(k=>[k,localStorage.getItem(k)])));
      await p.locator('[data-lexical-lookup-link]').click();await p.locator('[data-lexical-reference] [data-vocab-details]').waitFor();
      assert.equal(await p.evaluate(()=>JSON.stringify(Object.keys(localStorage).filter(k=>/lexical|vocab/i.test(k)).sort().map(k=>[k,localStorage.getItem(k)]))),before);
      await p.locator('[data-lexical-exact-return]').click();assert.equal(new URL(p.url()).pathname,'/reading/fixture-reading/');
      await selectText(p,'.portedReadingPassage p','library');await p.locator('[data-lexical-lookup-link]').waitFor({state:'visible'});await p.keyboard.press('Escape');
      assert.equal(await p.locator('[data-english-lexical-bridge]').isVisible(),false);
    } else {
      await p.locator('[data-english-lexical-bridge]').waitFor({state:'visible'});
      assert.equal(await p.locator('[data-lexical-lookup-link]').isVisible(),false);
      assert.equal(await p.locator('[data-lexical-lookup-link]').getAttribute('href'),null);
    }
    await ctx.close();pass(`Lexical ${variant}: exact read-only reference or safe non-stale failure`);
  }
  command(['scripts/test-writing-ffv-journey.mjs'],'existing-writing-ffv',180000);
  fs.copyFileSync('../ffv-audit/writing-ffv-journey.json',path.join(out,'writing-ffv-journey.json'));
  assert.equal(JSON.parse(fs.readFileSync(path.join(out,'writing-ffv-journey.json'),'utf8')).pass,true);
  pass('Existing complete Writing FFV: clean exit, repair, regeneration and English Resume');
  assert.deepEqual(report.errors,[]);report.pass=true;
} catch(error) {report.failure=error.stack;report.pass=false;process.exitCode=1;console.error(error);}
finally {
  await browser?.close();
  for(const server of servers){server.closeAllConnections?.();await new Promise(resolve=>server.close(resolve));}
  const paths=['src/styles/english-readable.css','src/layouts/Base.astro','src/components/EnglishLexicalBridge.astro','src/lib/siteResume.mjs','scripts/test-english-subject-ui.mjs','scripts/test-english-resume-contract.mjs','scripts/run-objective-journey.mjs','src/components/ReadingHome.astro','src/components/ObjectiveHome.astro','src/pages/translation.astro'];
  report.fingerprints={github_sha:process.env.GITHUB_SHA||null,files:Object.fromEntries(paths.map(p=>[p,createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
}
