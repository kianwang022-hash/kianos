import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
// Synthetic browser contexts only. Screenshots are Linux/Noto substitution evidence.
const root=path.resolve('dist'),out=path.resolve('../visual-stage-two/viewport');
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(f!==root&&!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
 if(!fs.existsSync(f)){res.writeHead(404).end();return;}
 res.setHeader('content-type',mime[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,b=await chromium.launch({headless:true});
const cases=[
 ['home','/'],['english-home','/english/'],
 ['reading','/reading/english1-2000-reading-a-text1/'],
 ['cloze','/cloze/english1-2000-cloze-main/'],
 ['translation','/translation/english1-2000-translation-main/'],
 ['writing','/writing/writing-synthetic-big-v1/'],
 ['lexical-front','/vocabulary/40/'],['lexical-depth','/vocabulary/40/','word'],
 ['politics-home','/politics/'],['politics-history','/politics/history/ch01/#unit-1'],
 ['politics-mao','/politics/mao/ch02/#unit-2'],['politics-xi','/politics/xi/ch02/#unit-1'],
 ['politics-ethics','/politics/ethics_law/ch05/#unit-1'],['politics-marxism','/politics/marxism/ch00/'],
 ['politics-result','/politics/practice/','result'],['politics-result-wrong','/politics/practice/','wrong-result'],
 ['xizong-system','/xizong/circulation/'],['xizong-block','/xizong/circulation/b01/'],
 ['xizong-recall','/xizong/circulation/b01/','recall'],['xizong-reveal','/xizong/circulation/b01/','reveal']
];
const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),environment:'Linux Chromium / Noto Sans CJK; no Mac or real learner U claim',pages:[],failures:[]};
const panes='.productCanvas,.politicsStudy,.politicsCognitiveWorkspace,.politicsUnitCognition,.contextualInspector,.politicsUnitCompanion,.cognitiveStage,.politicsResultLayout,.portedReadingColumns,.portedReadingPassage,.portedReadingQuestions,.clozeLayout,.translationColumns,.writingRuntimeColumns,.portedVocabStudySheet,.portedVocabMeaningColumn,.portedVocabBody,.xv6SystemShell,.portedStudyRuntime,.portedStudyMain,.portedRecallAnswer,.portedRecallRating';
const observe=async(p)=>p.evaluate((selectors)=>{
 const boxes=[...document.querySelectorAll(selectors)].filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {class:e.className,top:r.top,bottom:r.bottom,width:r.width,height:r.height,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight,overflowY:s.overflowY,fontSize:s.fontSize};});
 const controls=[...document.querySelectorAll('[data-kp-reveal],[data-rating],[data-lexical-next],.politicsReviewActions button')].filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent.trim(),top:r.top,bottom:r.bottom};});
 return {documentHeight:document.documentElement.scrollHeight,documentWidth:document.documentElement.scrollWidth,bodyFont:getComputedStyle(document.body).fontSize,boxes,controls};
},panes);
try{
 for(const [name,route,act] of cases){
  for(const viewport of [{width:1440,height:780},...(['home','reading','lexical-depth','politics-home','politics-history','xizong-reveal'].includes(name)?[{width:1280,height:720}]:[])]){
   const ctx=await b.newContext({viewport,locale:'zh-CN'}),p=await ctx.newPage(),errors=[];
   p.setDefaultTimeout(8000);p.on('pageerror',e=>errors.push(e.message));const label=name+'-'+viewport.width;
   try{
    const response=await p.goto(origin+route,{waitUntil:'networkidle'});if(!response?.ok())throw Error(`HTTP ${response?.status()}`);
    await p.evaluate(()=>document.fonts.ready);
    if(act==='word')await p.locator('[data-vocab-reveal]').click();
    if(act==='result'||act==='wrong-result'){await p.locator('[data-learned-scope]').check();await p.locator('[data-start-session-inline]').click();await p.locator('[data-question-options] button').nth(act==='wrong-result'?1:0).click();await p.locator('[data-submit]').click();if(act==='wrong-result'&&!/答错/.test(await p.locator('[data-result-status]').innerText()))throw Error('Wrong-result probe did not reach its expected outcome');}
    if(act==='recall'||act==='reveal'){await p.locator('[data-stage-next="logic_group"]').click();await p.locator('[data-enter-group]').click();await p.locator('[data-group-lecture-done]').click();if(act==='reveal')await p.locator('[data-kp-reveal]:visible').click();}
    await p.waitForTimeout(120);
    const metrics=await observe(p);
    // A control inside the viewport can still be cut off by a scrolling pane.
    // Check clipping ancestors, not just the document bottom.
    const clippedControls=await p.evaluate(()=>[...document.querySelectorAll('[data-kp-reveal],[data-rating],.politicsReviewActions button,.politicsReviewActions a')].filter(e=>e.getClientRects().length).flatMap(e=>{
      const r=e.getBoundingClientRect(),issues=[];
      if(r.top<0||r.bottom>innerHeight+1)issues.push('viewport');
      for(let a=e.parentElement;a;a=a.parentElement){const s=getComputedStyle(a),q=a.getBoundingClientRect();if(/^(auto|scroll|hidden|clip)$/.test(s.overflowY)&&(r.top<q.top-1||r.bottom>q.bottom+1))issues.push(a.className);}
      return issues.length?[{text:e.textContent.trim(),clippedBy:issues}]:[];
    }));
    if(clippedControls.length)report.failures.push({name:label,error:'Primary action clipped',clippedControls});
    if(metrics.documentWidth>viewport.width+1)report.failures.push({name:label,error:'Page width overflow'});
    if(metrics.documentHeight>viewport.height+1)report.failures.push({name:label,error:'Desktop document exceeds viewport'});
    if(parseFloat(metrics.bodyFont)<17)report.failures.push({name:label,error:'Base type shrunk'});
    const active=metrics.boxes.filter(x=>/^(politicsStudy|politicsCognitiveWorkspace|portedVocabStudySheet|xv6SystemShell|portedStudyRuntime|portedReadingColumns|clozeLayout|translationColumns|writingRuntimeColumns)/.test(x.class));
    for(const box of active)if(box.bottom>viewport.height+2||box.height<180)report.failures.push({name:label,error:'Active workspace outside viewport',box});
    if(act==='recall'&&await p.locator('[data-kp-answer]:visible').count())report.failures.push({name:label,error:'Recall answer visible'});
    if(act==='reveal'&&metrics.controls.some(c=>c.text.includes('·')&&c.bottom>viewport.height+2))report.failures.push({name:label,error:'Recall rating below viewport'});
    const cdp=await ctx.newCDPSession(p);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const {root:doc}=await cdp.send('DOM.getDocument');const fonts=[];
    for(const selector of ['h1','h2','.projectionText','.portedRecallAnswer h4']){const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.nodeId,selector});if(nodeId){const r=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});fonts.push(...r.fonts);}}
    if(fonts.some(f=>/WenQuanYi/.test(f.familyName)))report.failures.push({name:label,error:'Disallowed CJK fallback'});
    await p.screenshot({path:path.join(out,label+'.png')});
    // Verify that overflowing primary panes are genuinely scrollable, not cut off.
    const scrolling=await p.evaluate(selectors=>[...document.querySelectorAll(selectors)].filter(e=>e.getClientRects().length&&e.scrollHeight>e.clientHeight+3&&['auto','scroll'].includes(getComputedStyle(e).overflowY)).map(e=>{const before=e.scrollTop;e.scrollTop=e.scrollHeight;const moved=e.scrollTop>before;e.scrollTop=before;return {class:e.className,moved};}),panes);
    let journey=null;
    if(act==='result'||act==='wrong-result'){
      const selected=await p.locator('[data-result-selected]').innerText(),formal=await p.locator('[data-result-answer]').innerText();
      await p.reload({waitUntil:'networkidle'});
      if(!await p.locator('[data-submitted-result]').isVisible()||selected!==await p.locator('[data-result-selected]').innerText()||formal!==await p.locator('[data-result-answer]').innerText())throw Error('Submitted result did not survive refresh');
      const href=await p.locator('[data-return-unit]').getAttribute('href'),expected=new URL(href,origin);
      await p.locator('[data-return-unit]').click();await p.waitForLoadState('networkidle');
      const returned=new URL(p.url());
      if(returned.pathname!==expected.pathname||returned.hash!==expected.hash)throw Error('Return did not restore its exact Unit');
      journey={submittedRefresh:true,exactReturn:expected.pathname+expected.search+expected.hash};
    }
    report.pages.push({name:label,route,viewport,...metrics,fonts,scrolling,journey,errors});
    if(errors.length)report.failures.push({name:label,errors});
   }catch(e){report.failures.push({name:label,error:String(e)});}finally{await ctx.close();}
  }
 }
}finally{await b.close();server.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify({head:report.head,pages:report.pages.length,failures:report.failures},null,2));
if(report.failures.length)process.exitCode=1;
