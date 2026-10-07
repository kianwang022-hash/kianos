// Run against an already-started isolated Candidate or CI built-site preview.
// Never use Stable or a persistent profile. Current content; synthetic evidence only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';
import { projectKpCore } from '../src/lib/xizongProjection.mjs';
import { buildXizongPreparedMemoryAvailability as describe } from '../src/lib/xizongMemoryRelease.mjs';
import { createXizongMemoryState, makePreparedMemoryAvailable, releasedMemoryCards } from '../src/lib/xizongMemoryModel.mjs';
const base = new URL(process.env.KIANOS_PREPARED_MEMORY_TEST_BASE || 'http://127.0.0.1:4322/');
assert.equal(base.hostname,'127.0.0.1'); assert.notEqual(base.port,'4321');
const { chromium } = await import(process.env.KIANOS_PLAYWRIGHT_MODULE || 'playwright');
const object = resolveXizongLearnerProjection(loadXizongBlock('circulation','b01'),{
  enrichBlock:b=>({...b,kpRecords:b.kpRecords.map(k=>({...k,detailHtml:marked.parse(projectKpCore(k.detailMarkdown))}))})
}).learnerObject;
const descriptor=describe(object);
// Expected cards only: the browser must create availability through its real button.
const fixture=makePreparedMemoryAvailable(createXizongMemoryState(),descriptor,'2026-10-01T00:00:00Z');
const cards=releasedMemoryCards(fixture,'PRECISION');
assert.equal(cards.length,13);
const key='kianos-xizong-memory-v1';
const checks=[], errors=[];
const assertTitleOnlyKp=async(page,root,object,kpId)=>{
    const expected=object.kps.find(k=>k.identity.kpId===kpId);
    assert.ok(expected,'visible stable KP identity remains canonical');
    await page.waitForFunction(({kpId,title})=>{
      const host=document.querySelector('[data-xizong-v6-block]');
      const card=[...host.querySelectorAll('[data-kp-recall-card]')].find(c=>c.getAttribute('data-kp-id')===kpId);
      return card && !card.hidden && card.querySelector(':scope > header > h3')?.textContent.trim()===title
        && host.querySelector('[data-kp-recall-title]')?.textContent.trim()===title
        && host.querySelector('.xzLogicGroupKp.current');
    },{kpId,title:expected.identity.title});
    const card=root.locator(`[data-kp-recall-card][data-kp-id="${kpId}"]`);
    assert.equal((await card.locator(':scope > header > h3').textContent()).trim(),expected.identity.title);
    assert.equal((await root.locator('[data-kp-recall-title]').textContent()).trim(),expected.identity.title);
    assert.equal((await card.locator(':scope > header > p').textContent()).trim(),expected.prompt.canonical.trim());
    const group=object.logicGroups.find(g=>g.identity.logicGroupId===expected.identity.logicGroupId);
    const expectedTitles=group.kpIds.map(id=>object.kps.find(k=>k.identity.kpId===id).identity.title);
    assert.deepEqual((await root.locator('.xzLogicGroupKp > span').allTextContents()).map(t=>t.trim()),expectedTitles);
    assert.ok((await root.locator('.xzLogicGroupKp > b').allTextContents()).every(t=>t.trim()===''));
    assert.equal(await card.getAttribute('data-kp-id'),kpId);
  };
const browser=await chromium.launch({headless:true,...(process.env.KIANOS_TEST_CHROME?{executablePath:process.env.KIANOS_TEST_CHROME}:{})});
try {
  const context=await browser.newContext({viewport:{width:1440,height:960}});
  await context.route('**/*', route => {
    const url=new URL(route.request().url());
    return url.origin===base.origin ? route.continue() : route.abort();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const out=path.resolve(process.env.KIANOS_PREPARED_MEMORY_TEST_OUTPUT || '/tmp/kianos-xizong-1113-browser-proof');
  fs.mkdirSync(out,{recursive:true});
  const ready=async()=>{
    await page.bringToFront();
    await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active',{},{timeout:30000});
  };
  const blockUrl=new URL('/xizong/circulation/b01/',base).href;
  await page.goto(blockUrl,{waitUntil:'domcontentloaded',timeout:30000});
  await ready();
  const root=page.locator('[data-xizong-v6-block]');

  const objectId=await root.getAttribute('data-study-object');
  const studyKey=`kianos-xizong-astro-v2:${objectId}`;
  const recallKey=`kianos-xizong-memory-review-v2:${objectId}`;
  const read=key=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null'),key);
  const claims=state=>({sourceContactDone:state?.sourceContactDone===true,sourceContactEvidence:state?.sourceContactEvidence||[],
    learned:state?.learned||{},completed:state?.completed===true,blockRecallDone:state?.blockRecallDone===true});
  const initial=await read(studyKey);
  assert.equal(await read(key),null);
  assert.deepEqual(claims(initial),{sourceContactDone:false,sourceContactEvidence:[],learned:{},completed:false,blockRecallDone:false});
  await root.locator('[data-study-stage="block_learn"] [data-post-chat-recall]').click();
  await root.locator('[data-study-stage="kp_recall"]').waitFor({state:'visible'});
  const entry=await read(studyKey);
  assert.equal(entry.recallEntryMode,'POST_CHAT_RECALL');assert.deepEqual(claims(entry),claims(initial));
  const firstKp=root.locator('[data-kp-recall-card]:visible').first();
  const firstKpId=await firstKp.getAttribute('data-kp-id');
  assert.equal(await firstKp.locator('[data-kp-answer]').isVisible(),false);
  assert.equal(await firstKp.locator('[data-kp-rating]').isVisible(),false);
  assert.equal((await read(recallKey)).evidenceHistory.length,0);
  await assertTitleOnlyKp(page,root,object,firstKpId);
  checks.push('B1 front and toolbar show the exact canonical title, rail hides KP numbers, full Prompt and stable identity remain');
  await page.screenshot({path:path.join(out,'post-chat-kp-front.png'),fullPage:true});
  checks.push('fresh real B1 Chat button enters clean KP Recall without Source, learned or completion claims');
  await firstKp.locator('[data-kp-reveal]').click();
  assert.equal(await firstKp.locator('[data-kp-answer]').isVisible(),true);
  await firstKp.locator('[data-rating="known"]').click();
  await page.waitForFunction(({studyKey,firstKpId,kpIndex})=>{
    const state=JSON.parse(localStorage.getItem(studyKey)||'null');
    return state?.ratings?.[firstKpId]==='known' && state.kpIndex!==kpIndex;
  },{studyKey,firstKpId,kpIndex:entry.kpIndex});
  const afterKp=await read(studyKey),kpEvidence=await read(recallKey);
  assert.deepEqual(claims(afterKp),claims(initial));
  assert.equal(kpEvidence.evidenceHistory.length,1);
  assert.equal(kpEvidence.evidenceHistory[0].evidence_origin,'USER_RECALL_ATTEMPT');
  assert.equal(kpEvidence.evidenceHistory[0].kp_id,firstKpId);
  await page.reload({waitUntil:'domcontentloaded'});await ready();
  await root.locator('[data-study-stage="kp_recall"]').waitFor({state:'visible'});
  const resumed=await read(studyKey);
  assert.equal(resumed.kpIndex,afterKp.kpIndex);assert.equal(resumed.recallEntryMode,'POST_CHAT_RECALL');
  assert.deepEqual((await read(recallKey)).evidenceHistory,kpEvidence.evidenceHistory);
  assert.equal(await root.locator('[data-kp-recall-card]:visible [data-kp-answer]').isVisible(),false);
  assert.deepEqual(claims(resumed),claims(initial));
  await assertTitleOnlyKp(page,root,object,resumed.resumeKpId);
  checks.push('title-only B1 presentation survives rating, next-KP navigation and reload without changing Prompt or Resume identity');
  checks.push('real KP Reveal/rating persists once and reload resumes post-Chat position with a hidden answer');
  await root.locator('[data-open-prepared-memory]').click();
  await page.waitForURL(url=>url.pathname.endsWith('/xizong/memory/') && url.searchParams.get('view')==='precision');await ready();
  await page.waitForFunction(()=>document.querySelector('[data-memory-summary-precision]')?.textContent==='13');
  const available=await read(key);
  assert.equal(Object.keys(available.cards).length,13);assert.deepEqual(available.releasedBlocks,{});
  assert.deepEqual(available.evidence,[]);assert.deepEqual(available.attention,{});
  assert.equal((await page.locator('[data-memory-summary-core]').textContent()).trim(),'0');
  assert.equal((await page.locator('[data-memory-summary-today]').textContent()).trim(),'0');
  assert.deepEqual(claims(await read(studyKey)),claims(initial));
  assert.deepEqual((await read(recallKey)).evidenceHistory,kpEvidence.evidenceHistory);
  assert.equal(await page.locator('[data-memory-queue] button').count(),13);
  checks.push('actual prepared Memory action persists exactly 13 Precision then opens Browse, with zero Core/Today/release receipts');
  const answer=page.locator('[data-memory-answer]');
  for(const [i,card] of cards.entries()){
    await page.locator('[data-memory-queue] button').nth(i).click();
    assert.equal((await page.locator('[data-memory-precision-text]').textContent()).trim(),card.cue);
    assert.equal(await answer.isVisible(),true);
    assert.equal(await answer.locator(`[data-prepared-memory="${card.precisionCueId}"]`).count(),1);
    assert.match(await page.locator('[data-memory-precision-resolution]').textContent(),/已绑定精确答案/);
  }
  checks.push('all 13 actual native answers render in existing Precision Browse');
  const cvpIndex=cards.findIndex(c=>c.id==='precision:b01-m14-cvp-normal-physiology');
  await page.locator('[data-memory-queue] button').nth(cvpIndex).click();
  assert.match(await answer.textContent(),/4–12 cmH₂O/);
  assert.match(await answer.textContent(),/Physiology Study only/);
  assert.match(await answer.textContent(),/no cross-subject unified Memory/i);
  checks.push('actual Browse preserves CVP scope and unresolved Source conflict without reinterpretation');
  const idx=cards.findIndex(c=>c.id==='precision:b01-m02-cycle-pressure-extrema');
  await page.locator('[data-memory-queue] button').nth(idx).click();
  assert.match(await answer.textContent(),/快射-双双高潮/);
  checks.push('the original mnemonic reaches the actual answer panel');
  await page.locator('[data-precision-mode="RECALL"]').click();
  assert.equal(await answer.isVisible(),false);
  assert.equal(await page.locator('[data-memory-ratings]').isVisible(),false);
  checks.push('Recall hides answer and mnemonic together before Reveal');
  await page.locator('[data-memory-reveal]').click();
  assert.equal(await answer.isVisible(),true);assert.match(await answer.textContent(),/快射-双双高潮/);
  assert.equal(await page.locator('[data-memory-ratings]').isVisible(),true);
  checks.push('Reveal restores the exact answer and memory aid');
  await page.screenshot({path:path.join(out,'prepared-memory-reveal.png'),fullPage:true});
  await page.locator('[data-memory-rating="known"]').click();
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.equal(saved.evidence.length,1);assert.equal(saved.evidence[0].cardId,cards[idx].id);
  assert.equal(Object.keys(saved.cards).length,13);
  checks.push('one synthetic rating uses the existing identity, not a duplicate card');
  await page.reload({waitUntil:'domcontentloaded'});
  await ready();
  await page.waitForFunction(()=>document.querySelector('[data-memory-summary-precision]')?.textContent==='13');
  const after=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.deepEqual(after.evidence,saved.evidence);assert.equal(Object.keys(after.cards).length,13);
  checks.push('reload retains the synthetic result without replay');
  await page.goto(blockUrl,{waitUntil:'domcontentloaded'});await ready();
  await root.locator('[data-open-prepared-memory]').click();
  await page.waitForURL(url=>url.pathname.endsWith('/xizong/memory/'));await ready();
  const reopened=await read(key);
  assert.deepEqual(reopened,saved);assert.deepEqual(reopened.releasedBlocks,{});
  assert.deepEqual((await read(recallKey)).evidenceHistory,kpEvidence.evidenceHistory);
  assert.deepEqual(claims(await read(studyKey)),claims(initial));
  checks.push('reopening through the actual B1 action preserves existing Memory/KP evidence and does not consume full Block release');

  // B2 starts in a separate empty browser profile. Its native current owner has
  // no formal Block prerequisite: never seed B1 completion to make entry pass.
  {
    const b2Object=resolveXizongLearnerProjection(loadXizongBlock('circulation','b02'),{
      enrichBlock:b=>({...b,kpRecords:b.kpRecords.map(k=>({...k,detailHtml:marked.parse(projectKpCore(k.detailMarkdown))}))})
    }).learnerObject;
    assert.equal(b2Object.kps.length,19);assert.equal(b2Object.logicGroups.length,5);
    assert.equal(b2Object.sourceContact.mode,'NATURAL_SOURCE_UNIT');
    assert.equal(b2Object.sourceContact.logicGroupIsAutomaticSourceChunk,false);
    assert.deepEqual(b2Object.sourceContact.hardReadinessBlockIds,[]);
    assert.deepEqual(b2Object.sourceContact.requiredPriorBlockIds,[]);
    const b2Context=await browser.newContext({viewport:{width:1440,height:960}});
    await b2Context.route('**/*',route=>new URL(route.request().url()).origin===base.origin?route.continue():route.abort());
    const b2Page=await b2Context.newPage();b2Page.on('pageerror',e=>errors.push(e.message));
    const b2Ready=async()=>{
      await b2Page.bringToFront();
      await b2Page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active',{},{timeout:30000});
    };
    const b2Url=new URL('/xizong/circulation/b02/',base).href;
    await b2Page.goto(b2Url,{waitUntil:'domcontentloaded'});await b2Ready();
    const b2Root=b2Page.locator('[data-xizong-v6-block]');
    assert.equal(await b2Root.getAttribute('data-post-chat-recall-available'),'true');
    assert.equal(await b2Root.getAttribute('data-kp-title-only'),'true');
    const nativeGuard=JSON.parse(await b2Page.locator('[data-xizong-completion-input]').textContent());
    assert.equal(nativeGuard.blockId,'circulation-b02');assert.deepEqual(nativeGuard.blockPrerequisites,[]);
    const nativeObject=JSON.parse(await b2Page.locator('[data-xizong-learner-object-payload]').textContent());
    assert.deepEqual(nativeObject.kps.map(k=>k.identity.kpId),b2Object.kps.map(k=>k.identity.kpId));
    const b2StudyKey='kianos-xizong-astro-v2:xizong:circulation-b02';
    const b2RecallKey='kianos-xizong-memory-review-v2:xizong:circulation-b02';
    const b2Read=key=>b2Page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null'),key);
    const b2Claims=state=>({...claims(state),ttsxEvidence:state?.ttsxEvidence||{}});
    const b2Initial=await b2Read(b2StudyKey);
    assert.deepEqual(b2Claims(b2Initial),{sourceContactDone:false,sourceContactEvidence:[],learned:{},completed:false,blockRecallDone:false,ttsxEvidence:{}});
    assert.equal(await b2Read('kianos-xizong-astro-v2:xizong:circulation-b01'),null);
    assert.equal(await b2Read(key),null);
    await b2Page.evaluate(()=>{
      window.__b2CompletionEvents=[];
      window.addEventListener('kianos:xizong-block-complete',e=>window.__b2CompletionEvents.push(e.detail));
    });
    await b2Root.locator('[data-study-stage="block_learn"] [data-post-chat-recall]').click();
    await b2Root.locator('[data-study-stage="kp_recall"]').waitFor({state:'visible'});
    const b2Entry=await b2Read(b2StudyKey);
    assert.equal(b2Entry.recallEntryMode,'POST_CHAT_RECALL');
    assert.deepEqual(b2Claims(b2Entry),b2Claims(b2Initial));
    const b2First=b2Root.locator('[data-kp-recall-card]:visible').first();
    const b2FirstId=await b2First.getAttribute('data-kp-id');
    assert.equal(await b2First.locator('[data-kp-answer]').isVisible(),false);
    assert.equal(await b2First.locator('[data-kp-rating]').isVisible(),false);
    assert.equal((await b2Read(b2RecallKey)).evidenceHistory.length,0);
    await assertTitleOnlyKp(b2Page,b2Root,b2Object,b2FirstId);
    await b2Page.keyboard.press('3');
    assert.deepEqual((await b2Read(b2StudyKey)).ratings,{});
    assert.equal((await b2Read(b2RecallKey)).evidenceHistory.length,0);
    assert.equal((await b2Root.locator('[data-study-local-status]').textContent()).trim(),'先 Reveal 当前 Core，再记录本次 Recall');
    checks.push('native B2 has 5 LG / 19 KP, no fabricated B1 prerequisite; fresh Chat entry is title-only, full Prompt, clean Front and no evidence');
    await b2Page.screenshot({path:path.join(out,'b02-post-chat-kp-front.png'),fullPage:true});
    await b2First.locator('[data-kp-reveal]').click();
    assert.equal(await b2First.locator('[data-kp-answer]').isVisible(),true);
    await b2First.locator('[data-rating="known"]').click();
    await b2Page.waitForFunction(({studyKey,kpId,index})=>{
      const state=JSON.parse(localStorage.getItem(studyKey)||'null');
      return state?.ratings?.[kpId]==='known' && state.kpIndex!==index;
    },{studyKey:b2StudyKey,kpId:b2FirstId,index:b2Entry.kpIndex});
    const b2After=await b2Read(b2StudyKey),b2Evidence=await b2Read(b2RecallKey);
    assert.equal(b2Evidence.evidenceHistory.length,1);
    assert.equal(b2Evidence.evidenceHistory[0].evidence_origin,'USER_RECALL_ATTEMPT');
    assert.equal(b2Evidence.evidenceHistory[0].kp_id,b2FirstId);
    assert.deepEqual(b2Claims(b2After),b2Claims(b2Initial));
    assert.equal(await b2Root.locator('[data-block-complete]').isDisabled(),true);
    assert.deepEqual(await b2Page.evaluate(()=>window.__b2CompletionEvents),[]);
    assert.equal(await b2Read(key),null);
    await b2Page.reload({waitUntil:'domcontentloaded'});await b2Ready();
    await b2Root.locator('[data-study-stage="kp_recall"]').waitFor({state:'visible'});
    const b2Resumed=await b2Read(b2StudyKey);
    assert.equal(b2Resumed.kpIndex,b2After.kpIndex);assert.equal(b2Resumed.resumeKpId,b2After.resumeKpId);
    assert.equal(b2Resumed.recallEntryMode,'POST_CHAT_RECALL');
    assert.deepEqual((await b2Read(b2RecallKey)).evidenceHistory,b2Evidence.evidenceHistory);
    assert.equal(await b2Root.locator('[data-kp-recall-card]:visible [data-kp-answer]').isVisible(),false);
    await assertTitleOnlyKp(b2Page,b2Root,b2Object,b2Resumed.resumeKpId);
    await b2Root.locator('[data-study-stage="kp_recall"] [data-stage-target="source_contact"]').click();
    await b2Root.locator('[data-study-stage="source_contact"]').waitFor({state:'visible'});
    await b2Page.reload({waitUntil:'domcontentloaded'});await b2Ready();
    await b2Root.locator('[data-study-stage="source_contact"]').waitFor({state:'visible'});
    assert.equal((await b2Read(b2StudyKey)).stage,'source_contact');
    await b2Root.locator('[data-study-stage="source_contact"] [data-post-chat-recall]').click();
    await b2Root.locator('[data-study-stage="kp_recall"]').waitFor({state:'visible'});
    assert.equal((await b2Read(b2StudyKey)).resumeKpId,b2Resumed.resumeKpId);
    assert.deepEqual(b2Claims(await b2Read(b2StudyKey)),b2Claims(b2Initial));
    assert.deepEqual((await b2Read(b2RecallKey)).evidenceHistory,b2Evidence.evidenceHistory);
    assert.equal(await b2Read('kianos-xizong-astro-v2:xizong:circulation-b01'),null);
    assert.equal(await b2Read(key),null);
    assert.equal(await b2Root.locator('[data-kp-recall-card]:visible [data-kp-answer]').isVisible(),false);
    await assertTitleOnlyKp(b2Page,b2Root,b2Object,b2Resumed.resumeKpId);
    checks.push('actual B2 Reveal/rating persists exactly once; reload and explicit Source return/re-entry preserve clean Front/Resume, Source/learned/TTSX/full Memory release stay unclaimed');
    const b2Descriptor=describe(b2Object);
    const b2Cards=releasedMemoryCards(makePreparedMemoryAvailable(createXizongMemoryState(),b2Descriptor),'PRECISION');
    const b2Ids=['b02-m01-baroreceptor-afferents','b02-m02-chemoreceptor-bias','b02-m03-chemoreflex-80',
      'b02-m05-axon-reflex-cgrp','b02-m06-medulla-80-20','b02-m07-medulla-ach-n1','b02-m09-angii-angiii-extremes',
      'b02-m10-adh-identity-origin-storage','b02-m11-v1-v2-aqp2-localization','b02-m12-adh-inhibitors','b02-m13-anp-bnp-origin','b02-m14-pg-directions'];
    assert.deepEqual(b2Cards.map(c=>c.precisionCueId).sort(),[...b2Ids].sort());
    await b2Root.locator('[data-open-prepared-memory]').click();
    await b2Page.waitForURL(url=>url.pathname.endsWith('/xizong/memory/')&&url.searchParams.get('view')==='precision'&&url.searchParams.get('block')==='circulation-b02');
    await b2Ready();
    await b2Page.waitForFunction(()=>document.querySelector('[data-memory-summary-precision]')?.textContent==='12');
    const b2Available=await b2Read(key);
    assert.deepEqual(Object.keys(b2Available.cards).sort(),b2Ids.map(id=>`precision:${id}`).sort());
    assert.deepEqual(b2Available.releasedBlocks,{});assert.deepEqual(b2Available.evidence,[]);assert.deepEqual(b2Available.attention,{});
    assert.equal((await b2Page.locator('[data-memory-summary-core]').textContent()).trim(),'0');
    assert.equal((await b2Page.locator('[data-memory-summary-today]').textContent()).trim(),'0');
    assert.match(await b2Page.locator('[data-memory-view-note]').textContent(),/^B2 /);
    assert.equal(await b2Page.locator('[data-memory-queue] button').count(),12);
    const b2Answer=b2Page.locator('[data-memory-answer]');
    for(const [i,card] of b2Cards.entries()){
      await b2Page.locator('[data-memory-queue] button').nth(i).click();
      assert.equal((await b2Page.locator('[data-memory-precision-text]').textContent()).trim(),card.cue);
      assert.equal(await b2Answer.isVisible(),true);
      const actual=b2Answer.locator(`[data-prepared-memory="${card.precisionCueId}"]`);
      assert.equal(await actual.count(),1);
      const expectedText=await b2Page.evaluate(html=>{const el=document.createElement('div');el.innerHTML=html;return el.textContent;},card.answerHtml);
      assert.equal(await actual.textContent(),expectedText);
      assert.equal(b2Available.cards[card.id].sourceLocator,card.sourceLocator);
      assert.match(await b2Page.locator('[data-memory-precision-resolution]').textContent(),/已绑定精确答案/);
    }
    const b2Choose=async id=>{
      const index=b2Cards.findIndex(c=>c.precisionCueId===id);assert.ok(index>=0);
      await b2Page.locator('[data-memory-queue] button').nth(index).click();return index;
    };
    await b2Choose('b02-m01-baroreceptor-afferents');assert.match(await b2Answer.textContent(),/窦九弓十/);
    await b2Choose('b02-m03-chemoreflex-80');assert.match(await b2Answer.textContent(),/不改写成临床抢救目标、SBP或MAP阈值/);
    await b2Choose('b02-m09-angii-angiii-extremes');assert.match(await b2Answer.textContent(),/限RAS内部比较/);
    await b2Choose('b02-m10-adh-identity-origin-storage');assert.match(await b2Answer.textContent(),/垂体后叶素/);assert.match(await b2Answer.textContent(),/OT/);
    await b2Choose('b02-m13-anp-bnp-origin');assert.match(await b2Answer.textContent(),/诊断阈值归B11/);
    const b2AidIndex=await b2Choose('b02-m12-adh-inhibitors');
    assert.match(await b2Answer.textContent(),/酒心咖啡糖/);
    assert.match(await b2Answer.textContent(),/口诀只辅助名单/);
    await b2Page.locator('[data-memory-rating="known"]').dispatchEvent('click');
    assert.deepEqual((await b2Read(key)).evidence,[],'Browse cannot rate');
    await b2Page.locator('[data-precision-mode="RECALL"]').click();
    assert.equal(await b2Answer.isVisible(),false);assert.equal(await b2Page.locator('[data-memory-ratings]').isVisible(),false);
    await b2Page.locator('[data-memory-rating="known"]').dispatchEvent('click');
    assert.deepEqual((await b2Read(key)).evidence,[],'Recall cannot rate before Reveal');
    await b2Page.screenshot({path:path.join(out,'b02-prepared-memory-front.png'),fullPage:true});
    await b2Page.locator('[data-memory-reveal]').click();
    assert.equal(await b2Answer.isVisible(),true);assert.match(await b2Answer.textContent(),/酒心咖啡糖/);
    await b2Page.screenshot({path:path.join(out,'b02-prepared-memory-reveal.png'),fullPage:true});
    await b2Page.locator('[data-memory-rating="known"]').click();
    const b2Rated=await b2Read(key);
    assert.equal(b2Rated.evidence.length,1);assert.equal(b2Rated.evidence[0].cardId,b2Cards[b2AidIndex].id);
    assert.equal(Object.keys(b2Rated.cards).length,12);assert.deepEqual(b2Rated.releasedBlocks,{});
    await b2Page.reload({waitUntil:'domcontentloaded'});await b2Ready();
    assert.deepEqual(await b2Read(key),b2Rated);
    await b2Page.goto(b2Url,{waitUntil:'domcontentloaded'});await b2Ready();
    await b2Root.locator('[data-open-prepared-memory]').click();
    await b2Page.waitForURL(url=>url.pathname.endsWith('/xizong/memory/')&&url.searchParams.get('block')==='circulation-b02');await b2Ready();
    assert.deepEqual(await b2Read(key),b2Rated);
    assert.deepEqual(b2Claims(await b2Read(b2StudyKey)),b2Claims(b2Initial));
    assert.deepEqual((await b2Read(b2RecallKey)).evidenceHistory,b2Evidence.evidenceHistory);
    assert.equal(await b2Read('kianos-xizong-astro-v2:xizong:circulation-b01'),null);
    checks.push('actual B2 opens exactly12 reviewed Precision, zero Core/Today/release; all answers/provenance/qualifications and both inherited aids render, Recall hides them, one explicit synthetic rating survives reload/reopen without Source/learned/completion mutation');

    // Declared historical-card fixture in this isolated profile only. A later
    // native opening must refresh the same ID and preserve genuine test clicks.
    const b2OldAnswer='<p>Declared fixture: prior prepared answer</p>';
    await b2Page.evaluate(({key,id,answer})=>{
      const state=JSON.parse(localStorage.getItem(key));state.cards[id].answerHtml=answer;
      state.cards[id].semanticRevision='declared-prior-content-fixture';localStorage.setItem(key,JSON.stringify(state));
    },{key,id:b2Cards[b2AidIndex].id,answer:b2OldAnswer});
    await b2Page.goto(b2Url,{waitUntil:'domcontentloaded'});await b2Ready();
    await b2Root.locator('[data-open-prepared-memory]').click();
    await b2Page.waitForURL(url=>url.pathname.endsWith('/xizong/memory/'));await b2Ready();
    const b2Refreshed=await b2Read(key),b2RefreshedCard=b2Refreshed.cards[b2Cards[b2AidIndex].id];
    assert.equal(Object.keys(b2Refreshed.cards).length,12);assert.deepEqual(b2Refreshed.evidence,b2Rated.evidence);
    assert.deepEqual(b2Refreshed.releasedBlocks,{});assert.deepEqual(b2Refreshed.attention,b2Rated.attention);
    assert.equal(b2RefreshedCard.answerHtml,b2Cards[b2AidIndex].answerHtml);
    assert.equal(b2RefreshedCard.contentHistory.at(-1).answerHtml,b2OldAnswer);
    assert.ok(b2RefreshedCard.contentChangedAt);
    checks.push('actual B2 same-ID content refresh preserves explicit Memory/KP history and release boundary; old payload is a declared synthetic fixture');

    // A fresh isolated browser profile proves persistence fails before routing.
    const failContext=await browser.newContext();
    await failContext.route('**/*',route=>new URL(route.request().url()).origin===base.origin?route.continue():route.abort());
    await failContext.addInitScript(()=>{
      const write=Storage.prototype.setItem;
      Storage.prototype.setItem=function(key,value){if(key==='kianos-xizong-memory-v1')throw new Error('Declared Memory persistence-failure fixture');return write.call(this,key,value);};
    });
    const failPage=await failContext.newPage();failPage.on('pageerror',e=>errors.push(e.message));
    await failPage.goto(b2Url,{waitUntil:'domcontentloaded'});
    await failPage.bringToFront();await failPage.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
    await failPage.locator('[data-open-prepared-memory]').click();
    await failPage.waitForFunction(()=>document.querySelector('[data-prepared-memory-status]')?.textContent.includes('无法安全打开'));
    assert.equal(failPage.url(),b2Url);
    assert.equal(await failPage.evaluate(key=>localStorage.getItem(key),key),null);
    const failStudy=await failPage.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null'),b2StudyKey);
    assert.deepEqual(b2Claims(failStudy),b2Claims(b2Initial));
    await failContext.close();
    checks.push('actual B2 persistence failure leaves old storage and Source/learned/completion intact and refuses navigation');
    await b2Context.close();
  }
  // Coherent remaining-System journeys. Empty isolated profiles, native current
  // requirements and original identities; no fake completion or Source contact.
  const cases=[
    {slug:'b03',id:'B03-M01',text:/约 -90 mV/,label:'ordinary retained row'},
    {slug:'b05',id:'xpg_ee3aabc71215185d',text:/25%/,label:'current-Core corrected scope'},
    {slug:'b07',id:'B07-M01',text:/窦律/,label:'multi-Core murmur qualification and original visual destination'},
    {slug:'b10',id:'xpg_2f3dc8b2ab10a87b',text:/QRS/,label:'existing Precision with held rate content excluded'},
    {slug:'b11',id:'xpg_e817b36d446e7568',text:/HFpEF/,label:'complete owner with expected-absent M08'},
    {slug:'b12',id:'xpg_4004a850c58fd059',text:/活动性大出血/,label:'compound Hb/volume owner and additional safety Core'}
  ];
  for(const scenario of cases){
    const blockId=`circulation-${scenario.slug}`;
    const blockObject=resolveXizongLearnerProjection(loadXizongBlock('circulation',scenario.slug),{
      enrichBlock:b=>({...b,kpRecords:b.kpRecords.map(k=>({...k,detailHtml:marked.parse(projectKpCore(k.detailMarkdown))}))})
    }).learnerObject;
    const expected=describe(blockObject);
    const ctx=await browser.newContext({viewport:{width:1440,height:960}});
    await ctx.route('**/*',route=>new URL(route.request().url()).origin===base.origin?route.continue():route.abort());
    const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
    const ready=async()=>{await p.bringToFront();await p.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');};
    const url=new URL(`/xizong/circulation/${scenario.slug}/`,base).href;
    const studyKey=`kianos-xizong-astro-v2:xizong:${blockId}`,recallKey=`kianos-xizong-memory-review-v2:xizong:${blockId}`;
    const read=k=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),k);
    const unchanged=s=>({...claims(s),ttsxEvidence:s?.ttsxEvidence||{}});
    await p.goto(url,{waitUntil:'domcontentloaded'});await ready();
    const host=p.locator('[data-xizong-v6-block]');
    assert.equal(await host.getAttribute('data-post-chat-recall-available'),'true');
    const payload=JSON.parse(await p.locator('[data-xizong-learner-object-payload]').textContent());
    assert.deepEqual(payload.kps.map(k=>k.identity.kpId),blockObject.kps.map(k=>k.identity.kpId));
    assert.deepEqual(payload.sourceContact.hardReadinessBlockIds,[]);
    assert.deepEqual(payload.sourceContact.requiredPriorBlockIds,[]);
    const initial=await read(studyKey);assert.equal(await read(key),null);
    assert.notEqual(initial.completed,true);
    await host.locator('[data-study-stage="block_learn"] [data-post-chat-recall]').click();
    await host.locator('[data-study-stage="kp_recall"]').waitFor({state:'visible'});
    const front=host.locator('[data-kp-recall-card]:visible').first();
    const firstId=await front.getAttribute('data-kp-id');
    await assertTitleOnlyKp(p,host,blockObject,firstId);
    assert.equal(await front.locator('[data-kp-answer]').isVisible(),false);
    assert.equal(await host.locator('[data-prepared-memory]:visible').count(),0);
    await p.keyboard.press('3');assert.deepEqual((await read(studyKey)).ratings,{});
    assert.equal((await read(recallKey)).evidenceHistory.length,0);
    await front.locator('[data-kp-reveal]').click();
    await front.locator('[data-rating="known"]').click();
    await p.waitForFunction(({studyKey,firstId})=>JSON.parse(localStorage.getItem(studyKey))?.ratings?.[firstId]==='known',{studyKey,firstId});
    const kpHistory=await read(recallKey),afterKp=await read(studyKey);
    assert.equal(kpHistory.evidenceHistory.length,1);assert.deepEqual(unchanged(afterKp),unchanged(initial));
    assert.equal(await host.locator('[data-block-complete]').isDisabled(),true);
    await p.reload({waitUntil:'domcontentloaded'});await ready();
    assert.equal((await read(studyKey)).resumeKpId,afterKp.resumeKpId);
    assert.deepEqual((await read(recallKey)).evidenceHistory,kpHistory.evidenceHistory);
    assert.equal(await host.locator('[data-kp-recall-card]:visible [data-kp-answer]').isVisible(),false);
    // Verify original current visual destinations are served, without claiming
    // a fresh interpretation of PDF/image pixels or visual gate completion.
    if(['b03','b05','b07'].includes(scenario.slug)){
      const visualRows=[...payload.kps,...payload.logicGroups].flatMap(x=>x.visual||[]);
      const assets=visualRows.flatMap(x=>x.sourceVisualBundle?.assets||[]);
      assert.ok(assets.length>0,`${scenario.slug}: existing original-source visual bundle`);
      for(const asset of assets){assert.ok(asset.src);const response=await p.request.get(new URL(asset.src,base).href);assert.equal(response.status(),200);assert.match(response.headers()['content-type'],/image/);}
    }
    await host.locator('[data-open-prepared-memory]').click();
    await p.waitForURL(u=>u.pathname.endsWith('/xizong/memory/')&&u.searchParams.get('block')===blockId);await ready();
    assert.ok((await p.locator('[data-memory-view-note]').textContent()).startsWith(`${blockObject.identity.blockLabel} 已准备的精确记忆`));
    const memory=await read(key);assert.deepEqual(Object.keys(memory.cards).sort(),expected.precisionCards.map(c=>c.id).sort());
    assert.deepEqual(memory.evidence,[]);assert.deepEqual(memory.releasedBlocks,{});assert.deepEqual(memory.attention,{});
    assert.equal((await p.locator('[data-memory-summary-core]').textContent()).trim(),'0');
    assert.equal((await p.locator('[data-memory-summary-today]').textContent()).trim(),'0');
    assert.equal(await p.locator('[data-memory-queue] button').count(),expected.precisionCards.length);
    const answer=p.locator('[data-memory-answer]');
    const cardIds=await p.evaluate(key=>Object.keys(JSON.parse(localStorage.getItem(key)).cards),key);
    for(const held of ['B03-M04','B06-M08','xpg_c8ea9e6209ee8fb6','B12-M08','B12-M09','B12-M19'])assert.ok(!cardIds.includes(`precision:${held}`));
    const expectedCards=releasedMemoryCards(memory,'PRECISION');
    for(const [i,card] of expectedCards.entries()){
      await p.locator('[data-memory-queue] button').nth(i).click();
      const actual=answer.locator(`[data-prepared-memory="${card.precisionCueId}"]`);assert.equal(await actual.count(),1);
      const expectedText=await p.evaluate(html=>{const t=document.createElement('template');t.innerHTML=html;return t.content.textContent.replace(/\s+/g,' ').trim();},card.answerHtml);
      const authoredTables = {'B10-M23': 4, 'B10-M32': 4, 'B11-M02': 4};
      if (Object.hasOwn(authoredTables, card.precisionCueId)) {
        // These three pre-existing answers contain explicit pipe-table syntax.
        // Compare native authored cells and all exterior text, not punctuation
        // that the view-only formatter intentionally turns into table markup.
        const source = await p.evaluate(html => {
          const t = document.createElement('template'); t.innerHTML = html;
          const raw = t.content.querySelector('section > p').textContent;
          const lines = raw.split(/\r?\n/), tableLines = lines.filter(line => line.trim().startsWith('|'));
          const cells = line => line.trim().slice(1, -1).split('|').map(cell => cell.trim());
          const header = cells(tableLines[0]), rows = tableLines.slice(2).map(cells);
          return {header, rows, prose: lines.filter(line => line.trim() && !line.trim().startsWith('|')),
            full: t.content.textContent.replace(tableLines.join('\n'), header.join('') + rows.flat().join('')).replace(/\s+/g, ' ').trim()};
        }, card.answerHtml);
        const body = actual.locator(':scope > [data-memory-prepared-answer]');
        assert.equal(await body.locator('table').count(), 1);
        assert.deepEqual(await body.locator('thead th').allTextContents(), source.header);
        assert.deepEqual(await body.locator('tbody tr').evaluateAll(rows => rows.map(row => [...row.querySelectorAll('td')].map(cell => cell.textContent))), source.rows);
        assert.equal(source.rows.length, authoredTables[card.precisionCueId]);
        assert.deepEqual(await body.locator('p').allTextContents(), source.prose);
        assert.equal((await actual.textContent()).replace(/\s+/g,' ').trim(),source.full);
        assert.equal(await body.locator('details').count(), 0, 'table answer and qualifications are not folded');
      } else assert.equal((await actual.textContent()).replace(/\s+/g,' ').trim(),expectedText);
    }
    const index=expectedCards.findIndex(c=>c.precisionCueId===scenario.id);assert.ok(index>=0,scenario.id);
    await p.locator('[data-memory-queue] button').nth(index).click();assert.match(await answer.textContent(),scenario.text);
    await p.locator('[data-precision-mode="RECALL"]').click();
    assert.equal(await answer.isVisible(),false);assert.equal(await p.locator('[data-memory-ratings]').isVisible(),false);
    await p.screenshot({path:path.join(out,`${scenario.slug}-prepared-front.png`),fullPage:true});
    await p.locator('[data-memory-reveal]').click();assert.equal(await answer.isVisible(),true);assert.match(await answer.textContent(),scenario.text);
    await p.screenshot({path:path.join(out,`${scenario.slug}-prepared-reveal.png`),fullPage:true});
    await p.locator('[data-memory-rating="known"]').click();
    const rated=await read(key);assert.equal(rated.evidence.length,1);assert.equal(rated.evidence[0].cardId,`precision:${scenario.id}`);
    await p.reload({waitUntil:'domcontentloaded'});await ready();assert.deepEqual((await read(key)).evidence,rated.evidence);
    await p.goto(url,{waitUntil:'domcontentloaded'});await ready();await host.locator('[data-open-prepared-memory]').click();
    await p.waitForURL(u=>u.pathname.endsWith('/xizong/memory/'));await ready();
    assert.deepEqual((await read(key)).evidence,rated.evidence);assert.deepEqual((await read(key)).releasedBlocks,{});
    assert.deepEqual(unchanged(await read(studyKey)),unchanged(initial));
    assert.deepEqual((await read(recallKey)).evidenceHistory,kpHistory.evidenceHistory);
    // Earlier-revision data is an explicit synthetic fixture on the same ID.
    await p.evaluate(({key,id})=>{const s=JSON.parse(localStorage.getItem(key));s.cards[id].semanticRevision='declared-prior-content-fixture';s.cards[id].answerHtml='<p>Declared prior answer fixture</p>';s.marks={private:{text:'Synthetic preserved mark'}};localStorage.setItem(key,JSON.stringify(s));},{key,id:`precision:${scenario.id}`});
    await p.goto(url,{waitUntil:'domcontentloaded'});await ready();await host.locator('[data-open-prepared-memory]').click();
    await p.waitForURL(u=>u.pathname.endsWith('/xizong/memory/'));await ready();
    const refreshed=await read(key);assert.deepEqual(refreshed.evidence,rated.evidence);assert.deepEqual(refreshed.marks,{private:{text:'Synthetic preserved mark'}});
    assert.equal(refreshed.cards[`precision:${scenario.id}`].contentHistory.at(-1).answerHtml,'<p>Declared prior answer fixture</p>');
    assert.deepEqual(refreshed.releasedBlocks,{});
    checks.push(`${scenario.slug}: ${scenario.label}; native Front/Reveal/rating/Resume, every prepared answer/qualification, hidden Recall, one rating, history/reopen and no Source/Core/completion/debt`);
    await ctx.close();
  }
  // The compound path must stop before navigation if persistence fails.
  {
    const ctx=await browser.newContext();await ctx.route('**/*',r=>new URL(r.request().url()).origin===base.origin?r.continue():r.abort());
    await ctx.addInitScript(()=>{const save=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='kianos-xizong-memory-v1')throw Error('Declared batch persistence failure');return save.call(this,k,v);};});
    const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));const url=new URL('/xizong/circulation/b12/',base).href;
    await p.goto(url,{waitUntil:'domcontentloaded'});await p.bringToFront();await p.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
    // The Block controller imports revision logic asynchronously after writer
    // readiness. Snapshot its genuine initialized baseline, not pre-init null.
    await p.waitForFunction(()=>Boolean(JSON.parse(localStorage.getItem('kianos-xizong-astro-v2:xizong:circulation-b12')||'null')?.contentRevision?.witness?.block));
    const before=await p.evaluate(()=>localStorage.getItem('kianos-xizong-astro-v2:xizong:circulation-b12'));
    await p.locator('[data-open-prepared-memory]').click();await p.waitForFunction(()=>document.querySelector('[data-prepared-memory-status]')?.textContent.includes('无法安全打开'));
    assert.equal(p.url(),url);assert.equal(await p.evaluate(key=>localStorage.getItem(key),key),null);
    assert.equal(await p.evaluate(()=>localStorage.getItem('kianos-xizong-astro-v2:xizong:circulation-b12')),before);
    checks.push('B12 compound persistence failure preserves old storage, Source and completion and refuses routing');await ctx.close();
  }

  assert.deepEqual(errors,[]);
  const result={status:'PASS',base:base.href,scope:'native B1/B2 regressions plus coherent remaining-A1 representative post-Chat KP Recall and prepared Memory in an isolated built-site browser; synthetic evidence only, not real learner or Stable proof',checks};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
} catch (error) {
  const out=path.resolve(process.env.KIANOS_PREPARED_MEMORY_TEST_OUTPUT || '/tmp/kianos-xizong-1113-browser-proof');
  fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({status:'FAIL',base:base.href,checks,errors,error:String(error?.stack||error)},null,2));
  throw error;
} finally {await browser.close();}


