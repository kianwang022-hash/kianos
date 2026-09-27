import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { ensureCandidateDependencies } from './kianos-candidate-runtime.mjs';

ensureCandidateDependencies();

const [
  { loadXizongBlock, loadXizongSystem },
  { buildXizongProductionBlock },
  { loadXizongSystemQuestionSweep },
  {
    XIZONG_MEMORY_STORAGE_KEY,
    createXizongMemoryState,
    releaseBlockMemory,
    setRepairTasks
  },
  { XIZONG_SESSION_KEY, XIZONG_SESSION_RUNTIME_KEY },
  { EXAM_CHAT_PLAN_KEY, EXAM_CHAT_PLAN_SCHEMA },
  { STUDY_TIMER_STATE_KEY, STUDY_TIMER_SCHEMA, studyDayAt }
] = await Promise.all([
  import('../src/lib/xizong.mjs'),
  import('../src/lib/xizongProductionProjection.mjs'),
  import('../src/lib/xizongQuestions.mjs'),
  import('../src/lib/xizongMemoryModel.mjs'),
  import('../src/lib/xizongSessionInstruction.mjs'),
  import('../src/lib/examChatPlan.mjs'),
  import('../src/lib/studyTimer.mjs')
]);

const PORT=4341,DEBUG_PORT=9251,BASE=`http://127.0.0.1:${PORT}`;
const NOW=Date.now(),DAY=studyDayAt(NOW);
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const privateDir=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-xz-m5-private-'));
fs.mkdirSync(path.resolve('.qa'), { recursive: true });
const repoHead=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout?.trim()||'UNKNOWN';
const report={
  schema:'kianos.xizong.exam-system-integration.v1',
  started_at:new Date().toISOString(),
  basis:{
    repo_head:repoHead,
    runtime_mode:'WEBSITE_CANDIDATE',
    base_url:BASE,
    viewport:'1536x960',
    browser:'Google Chrome headless via CDP',
    test_state:'fresh Chrome profiles + Candidate isolated runtime + private checkpoint'
  },
  checks:[]
};
const check=(ok,name,detail='')=>{if(!ok)throw new Error(`XIZONG_M5_FAIL:${name}${detail?':'+detail:''}`);report.checks.push({name,pass:true,detail});};
const js=(v)=>JSON.stringify(v);
async function waitHttp(url,n=120){
  for(let i=0;i<n;i++){try{const r=await fetch(url);if(r.ok)return r;}catch{}await sleep(150);}
  throw new Error('HTTP_NOT_READY:'+url);
}
function chromeExecutable(){
  const candidates=[process.env.CHROME_BIN,process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean);
  for(const file of candidates) if(fs.existsSync(file)) return file;
  for(const name of ['google-chrome','chromium']){
    const found=spawnSync('which',[name],{encoding:'utf8'}).stdout?.trim();
    if(found)return found;
  }
  throw new Error('CHROME_EXECUTABLE_NOT_FOUND');
}
class CDP{
  constructor(url){this.url=url;this.i=1;this.pending=new Map();this.waiters=new Map();}
  async connect(){
    this.ws=new WebSocket(this.url);
    await new Promise((r,j)=>{this.ws.addEventListener('open',r,{once:true});this.ws.addEventListener('error',j,{once:true});});
    this.ws.addEventListener('message',e=>this.onMessage(JSON.parse(String(e.data))));
  }
  onMessage(m){
    if(m.id){const p=this.pending.get(m.id);if(!p)return;this.pending.delete(m.id);m.error?p.j(new Error(JSON.stringify(m.error))):p.r(m.result||{});return;}
    const a=this.waiters.get(m.method)||[];this.waiters.set(m.method,[]);a.forEach(fn=>fn(m.params||{}));
  }
  send(method,params={}){
    const id=this.i++;
    return new Promise((r,j)=>{this.pending.set(id,{r,j});this.ws.send(JSON.stringify({id,method,params}));});
  }
  waitEvent(method,timeout=8000){
    return new Promise((r,j)=>{
      const timer=setTimeout(()=>j(new Error('CDP_EVENT_TIMEOUT:'+method)),timeout);
      const list=this.waiters.get(method)||[];
      list.push((value)=>{clearTimeout(timer);r(value);});this.waiters.set(method,list);
    });
  }
  async eval(expression){
    const z=await this.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});
    if(z.exceptionDetails)throw new Error('BROWSER_EVAL:'+JSON.stringify(z.exceptionDetails));
    return z.result?.value;
  }
  async nav(url){
    const loaded=this.waitEvent('Page.loadEventFired');
    await this.send('Page.navigate',{url});await loaded;await sleep(150);
  }
  async reload(){
    const loaded=this.waitEvent('Page.loadEventFired');
    await this.send('Page.reload',{ignoreCache:true});await loaded;await sleep(150);
  }
  close(){try{this.ws?.close();}catch{}}
}
const click=(cdp,selector)=>cdp.eval(`(()=>{const e=document.querySelector(${js(selector)});if(!e)return false;e.click();return true;})()`);
const text=(cdp,selector)=>cdp.eval(`document.querySelector(${js(selector)})?.textContent?.trim()||''`);
const href=(cdp,selector)=>cdp.eval(`document.querySelector(${js(selector)})?.getAttribute('href')||''`);
const block=loadXizongBlock('circulation','b02');
const production=buildXizongProductionBlock(block);
const firstKp=production.kpRecords[0],secondKp=production.kpRecords[1]||firstKp;
const sweep=loadXizongSystemQuestionSweep(loadXizongSystem('circulation'));
const question=sweep.questions.find(row=>row.questionId==='xizong-official-2010-n007'
  && String(row?.relation?.blockId||'')===block.blockId);
if(!firstKp||!question||question.correctAnswer!=='A')throw new Error('M5_FIXTURE_MISSING');

const memoryCardId=`core:${firstKp.kpId}`;
const repairTaskId='repair:m5-b02';
const repairCreatedAt=new Date(NOW-20*60*1000).toISOString();
let memory=releaseBlockMemory(createXizongMemoryState(),{
  blockId:block.blockId,systemId:block.systemId,canonicalId:block.systemCanonicalId,
  blockLabel:block.label,blockTitle:block.title,sourceHash:block.sourceHash,
  coreCards:[{
    id:memoryCardId,blockId:block.blockId,systemId:block.systemId,
    canonicalId:block.systemCanonicalId,blockLabel:block.label,blockTitle:block.title,
    kpId:firstKp.kpId,displayId:firstKp.displayId,title:firstKp.title,
    promptCanonical:firstKp.prompt,coreHtml:'<p>M5 fixture</p>',sourceLocator:firstKp.sourceLocator
  }],precisionCards:[]
},new Date(NOW-30*60*1000).toISOString());
memory=setRepairTasks(memory,[{
  id:repairTaskId,cardId:memoryCardId,kpId:firstKp.kpId,blockId:block.blockId,
  systemId:block.systemId,diagnosticAxis:'MECHANISM',title:'B02 最小修补',
  reason:'M5 integration fixture',action:'完成修补后返回原 Block。',priority:'high',
  origin:'CHAT_REPAIR',sourceQuestionIds:[question.questionId],
  blockHref:`/xizong/${block.systemId}/${block.slug}/`,
  returnHref:`/xizong/${block.systemId}/${block.slug}/`,
  createdAt:repairCreatedAt,status:'ACTIVE'
}]);
const sessionId='m5-xizong-session';
const sessionInstruction={
  schema:'kianos.xizong.session-instruction.v1',session_id:sessionId,study_day:DAY,
  generated_at:new Date(NOW-9*60*1000).toISOString(),
  steps:[
    {step_id:'memory-review',kind:'MEMORY_REVIEW',label:'回收当前 Core',
      targets:[{card_id:memoryCardId,block_id:block.blockId,source_hash:block.sourceHash}]},
    {step_id:'practice-set',kind:'PRACTICE_SET',label:'做一道当前真题',
      question_ids:[question.questionId],inline_questions:[],study_phase:'SECOND_PASS',speed:'normal',allow_holdout:true},
    {step_id:'repair-task',kind:'REPAIR_TASK',label:'完成当前修补',
      task_id:repairTaskId,created_at:repairCreatedAt,block_id:block.blockId,kp_id:firstKp.kpId},
    {step_id:'block-return',kind:'BLOCK_RETURN',label:'回到当前 Block',
      system_id:block.systemId,block_id:block.blockId,block_slug:block.slug,source_hash:block.sourceHash}
  ]
};
const stateKey=`kianos-xizong-astro-v2:${block.objectId}`;
const groupIndex=Math.max(0,production.logicGroups.findIndex(g=>g.groupId===secondKp.groupId));
const kpIndex=Math.max(0,production.kpRecords.findIndex(kp=>kp.kpId===secondKp.kpId));
const blockState={
  schema:'kianos.xizong.block-state.v2',stage:'kp_recall',groupIndex,kpIndex,
  sourceSegmentIndex:0,integrationReleasedGroups:{},
  learned:{[firstKp.kpId]:true,[secondKp.kpId]:true},
  ratings:{[firstKp.kpId]:'known'},
  ttsxEvidence:{},ttsxAnnotations:{},pendingTtsx:null,
  sourceContactDone:true,sourceContactEvidence:[],blockRecallDone:false,completed:false,
  sourceHash:block.sourceHash,sourceRevisionPending:false,sourceRevisionFromHash:null
};
const lastLocation={
  systemId:block.systemId,systemTitle:block.systemTitle,systemCanonical:block.systemCanonicalId,
  blockSlug:block.slug,blockLabel:block.label,blockTitle:block.title,
  href:`/xizong/${block.systemId}/${block.slug}/`,
  observed_at:new Date(NOW-5*60*1000).toISOString()
};
const timerState={
  schema:STUDY_TIMER_SCHEMA,running:true,manualPaused:false,subject:'xizong',
  context:{subject:'xizong',route:`xizong/${block.systemId}/${block.slug}/`,detailKey:`${block.systemId}/${block.slug}`,detailLabel:block.label},
  segmentStartedAt:NOW-5000,lastSeenAt:NOW-1000,revision:1,updatedAt:NOW-1000
};
const plan={
  schema:EXAM_CHAT_PLAN_SCHEMA,study_day:DAY,generated_at:new Date(NOW-10*60*1000).toISOString(),
  learner_evidence_basis:null,
  subjects:{
    xizong:{target_minutes:360,role:'主推进',note:'继续当前西综断点。',session_ref:sessionId},
    english:{target_minutes:90,role:'保连续',note:'保持英语完整任务。',session_ref:null},
    politics:{target_minutes:60,role:'保连续',note:'保持政治推进。',session_ref:null}
  },
  next_subject:'xizong',attention:null
};
const packetJson=(copy)=>{
  const marker='DAILY_PACKET_JSON\n',i=String(copy||'').indexOf(marker);
  if(i<0)throw new Error('DAILY_PACKET_JSON_MISSING');
  return JSON.parse(copy.slice(i+marker.length));
};
let server=null;
function startServer(){
  server=spawn('npm',['run','candidate:serve'],{
    cwd:process.cwd(),
    env:{...process.env,KIANOS_CANDIDATE_PORT:String(PORT)},
    stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'
  });
  return waitHttp(BASE+'/');
}
async function stopServer(){
  if(!server)return;
  try{process.platform==='win32'?server.kill('SIGTERM'):process.kill(-server.pid,'SIGTERM');}catch{}
  await Promise.race([new Promise(r=>server.once('exit',r)),sleep(1200)]);
  if(server.exitCode===null){try{process.platform==='win32'?server.kill('SIGKILL'):process.kill(-server.pid,'SIGKILL');}catch{}}
  server=null;
}
async function launchBrowser(debugPort,tag){
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),`kianos-xz-m5-${tag}-`));
  const chrome=spawn(chromeExecutable(),['--headless=new','--no-sandbox','--disable-gpu',
    '--window-size=1536,960',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${profile}`,'about:blank'],
    {stdio:['ignore','ignore','pipe']});
  await waitHttp(`http://127.0.0.1:${debugPort}/json/version`);
  const targets=await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
  const cdp=new CDP(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
  await cdp.connect();await cdp.send('Page.enable');await cdp.send('Runtime.enable');
  await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:`
    window.__kianosCopies=[];
    Object.defineProperty(navigator,'clipboard',{value:{writeText:async(t)=>window.__kianosCopies.push(t)},configurable:true});
  `});
  return{chrome,cdp,profile};
}
async function waitExpr(cdp,expr,label,attempts=120){
  for(let i=0;i<attempts;i++){if(await cdp.eval(expr))return;await sleep(100);}
  throw new Error('WAIT_TIMEOUT:'+label);
}
async function homeReady(cdp){
  await waitExpr(cdp,`document.querySelector('[data-exam-home]')?.dataset.ready==='true'`,'home-ready');
}
async function writerReady(cdp){
  await cdp.send('Page.bringToFront');
  await waitExpr(cdp,`document.documentElement?.dataset?.learnerWriter==='active'`,'writer-ready');
}
const getJson=(cdp,key)=>cdp.eval(`(()=>{try{return JSON.parse(localStorage.getItem(${js(key)})||'null')}catch{return null}})()`);
const setJson=(cdp,key,value)=>cdp.eval(`localStorage.setItem(${js(key)},${js(JSON.stringify(value))})`);

let firstBrowser,secondBrowser;
try{
  await startServer();
  firstBrowser=await launchBrowser(DEBUG_PORT,'first');
  let cdp=firstBrowser.cdp;
  await cdp.nav(BASE+'/');await writerReady(cdp);
  await cdp.eval('localStorage.clear();sessionStorage.clear()');

  await setJson(cdp,'kianos-xizong-last-location-v1',lastLocation);
  await setJson(cdp,stateKey,blockState);
  await setJson(cdp,XIZONG_MEMORY_STORAGE_KEY,memory);
  await setJson(cdp,STUDY_TIMER_STATE_KEY,timerState);

  const installResult=await cdp.eval(`(async()=>{const m=await import('/src/lib/xizongSessionInstruction.mjs');return m.installAndActivateXizongSessionInstruction(localStorage,${js(sessionInstruction)},{expectedDay:${js(DAY)},now:${NOW-8*60*1000},holdoutYears:[]});})()`);
  check(installResult?.activated?.next?.step?.kind==='MEMORY_REVIEW','session_installs_memory_first');

  const planResult=await cdp.eval(`(async()=>{const m=await import('/src/lib/examChatPlan.mjs');const p=${js(plan)};p.learner_evidence_basis=m.buildExamChatPlanBasis(localStorage,${js(DAY)});m.writeExamChatPlan(localStorage,p,${js(DAY)});return m.readExamChatPlan(localStorage,${js(DAY)});})()`);
  check(planResult?.status==='ready','fresh_chat_plan_ready');
  await cdp.reload();await writerReady(cdp);await homeReady(cdp);
  check(await cdp.eval(`document.querySelector('[data-exam-home]')?.dataset.strategyOwner==='chat'`),
    'home_strategy_owner_stays_chat');
  check(await cdp.eval(`document.querySelector('[data-exam-home]')?.dataset.chatPlanStatus==='ready'`),
    'home_consumes_fresh_plan');

  const firstNext=await href(cdp,'[data-exam-next]');
  check(firstNext.includes('/xizong/memory/')
      && firstNext.includes('session='+encodeURIComponent(sessionId))
      && firstNext.includes('step=memory-review'),
    'fresh_plan_routes_exact_session_ref',firstNext);

  await click(cdp,'[data-exam-why]');
  await waitExpr(cdp,`document.querySelector('[data-exam-why-dialog]')?.open===true`,'why-dialog');
  await cdp.eval(`(()=>{const d=document.querySelector('[data-exam-why-dialog] .examAdvanced');if(d&&!d.open)d.open=true;})()`);
  await click(cdp,'[data-exam-copy-daily]');
  await waitExpr(cdp,`Array.isArray(window.__kianosCopies)&&window.__kianosCopies.length>0`,'daily-copy',450);
  const initialPacket=packetJson(await cdp.eval('window.__kianosCopies.at(-1)'));
  check(initialPacket.subjects?.xizong?.plan?.sessionRef===sessionId,
    'daily_packet_carries_same_xizong_session_ref');
  check(initialPacket.subjects?.xizong?.evidence?.learning_state?.current_stage==='kp_recall'
      && initialPacket.subjects?.xizong?.evidence?.learning_state?.resume?.kp_id===secondKp.kpId,
    'daily_packet_preserves_exact_block_stage_kp');
  const xizongEvidence = initialPacket.subjects?.xizong?.evidence || {};
  const evidenceKeys = [];
  const collectKeys = (value, prefix = '') => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      const path = prefix ? prefix + '.' + key : key;
      evidenceKeys.push(path);
      collectKeys(child, path);
    }
  };
  collectKeys(xizongEvidence);
  check(!evidenceKeys.some((key) => /(^|\.)(?:mastery|debt|review_debt)(?:\.|$)/i.test(key)),
    'daily_packet_does_not_invent_mastery_or_debt_fields', evidenceKeys.filter((key) => /mastery|debt/i.test(key)).join(','));
  check(JSON.stringify(xizongEvidence.learning_state?.learned_kp_ids || []) === JSON.stringify([firstKp.kpId, secondKp.kpId]),
    'daily_packet_preserves_exact_learned_kp_ids');
  check(xizongEvidence.learning_state?.recall_ratings?.[firstKp.kpId] === 'known'
      && !Object.hasOwn(xizongEvidence.learning_state?.recall_ratings || {}, secondKp.kpId),
    'daily_packet_preserves_exact_recall_ratings_and_current_unrecalled_kp');
  check(xizongEvidence.learning_state?.block_complete === false,
    'daily_packet_preserves_incomplete_block_truth');

  await cdp.nav(BASE+firstNext);await writerReady(cdp);
  check(new URL(await cdp.eval('location.href')).searchParams.get('step')==='memory-review',
    'memory_receives_exact_session_step');
  await waitExpr(cdp,`document.querySelector('[data-xizong-memory-workspace]')!==null`,'memory-workspace');
  await click(cdp,'[data-memory-reveal]');
  await click(cdp,'[data-memory-rating="known"]');
  await sleep(80);
  const memoryAfter=await getJson(cdp,XIZONG_MEMORY_STORAGE_KEY);
  check(memoryAfter?.evidence?.some(e=>e?.cardId===memoryCardId),
    'memory_writes_native_evidence');

  const reconcileProbe=await cdp.eval(`(async()=>{class S{constructor(src){this.m=new Map();for(let i=0;i<src.length;i++){const k=src.key(i);if(k!=null)this.m.set(k,src.getItem(k));}}get length(){return this.m.size}key(i){return [...this.m.keys()][i]??null}getItem(k){return this.m.get(k)??null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}}const m=await import('/src/lib/xizongSessionInstruction.mjs');const s=new S(localStorage);try{const instruction=JSON.parse(s.getItem(m.XIZONG_SESSION_KEY)||'null');const result=m.activateXizongSessionNext(s,instruction,{now:Date.now(),holdoutYears:[]});return{ok:true,status:result?.status||'',kind:result?.next?.step?.kind||'',href:result?.next?.href||''}}catch(e){return{ok:false,error:String(e?.stack||e)}}})()`);
  check(reconcileProbe?.ok===true,'memory_to_practice_session_reconcile',reconcileProbe?.error||JSON.stringify(reconcileProbe));
  check(reconcileProbe?.kind==='PRACTICE_SET'&&String(reconcileProbe?.href||'').includes('/xizong/practice/chat-set/'),
    'memory_native_evidence_resolves_practice_next',JSON.stringify(reconcileProbe));

  await cdp.nav(BASE+'/');await writerReady(cdp);await homeReady(cdp);
  const staleStatus=await cdp.eval(`document.querySelector('[data-exam-home]')?.dataset.chatPlanStatus||''`);
  check(['reference','stale'].includes(staleStatus),'new_evidence_invalidates_global_plan',staleStatus);
  check((await href(cdp,'[data-exam-next]'))==='','stale_plan_has_no_global_next');

  let resumeHref=await href(cdp,'[data-xizong-continue]');
  check(resumeHref.includes('/xizong/practice/chat-set/')
      && resumeHref.includes('step=practice-set'),'xizong_resume_advances_practice',resumeHref);
  await cdp.nav(BASE+resumeHref);await writerReady(cdp);
  let practiceReady=false;
  for(let i=0;i<300;i++){
    if(await cdp.eval(`document.querySelector('[data-question-card]')?.hidden===false`)){practiceReady=true;break;}
    await sleep(100);
  }
  const practiceDiag=await cdp.eval(`(()=>({gateHidden:document.querySelector('[data-chat-set-gate]')?.hidden??null,title:document.querySelector('[data-chat-set-error-title]')?.textContent?.trim()||'',body:document.querySelector('[data-chat-set-error-body]')?.textContent?.trim()||'',chatSet:localStorage.getItem('kianos:xizong:chat-set:v1'),runtime:localStorage.getItem('kianos:xizong:session-runtime:v1')}))()`);
  check(practiceReady,'practice_question_visible',JSON.stringify(practiceDiag));
  check((await text(cdp,'[data-question-meta]')).includes('2010')
      && (await text(cdp,'[data-question-stem]')).includes('下蹲位突然起立'),
    'practice_exact_official_question');
  check(await cdp.eval(`document.querySelector('[data-answer-panel]')?.hidden!==false`),
    'practice_answer_hidden_before_submit');
  await click(cdp,'.xzpOption[data-option="A"]');
  await click(cdp,'[data-submit-answer]');
  await sleep(100);

  await cdp.nav(BASE+'/');await writerReady(cdp);await homeReady(cdp);
  resumeHref=await href(cdp,'[data-xizong-continue]');
  check(resumeHref.includes('/xizong/memory/')
      && resumeHref.includes('step=repair-task')
      && resumeHref.includes('repair='+encodeURIComponent(repairTaskId)),
    'practice_native_evidence_advances_repair',resumeHref);
  await cdp.nav(BASE+resumeHref);await writerReady(cdp);
  await waitExpr(cdp,`document.querySelector('[data-memory-repair-card]')?.hidden===false`,'repair-card');
  await click(cdp,'[data-repair-complete]');
  await sleep(80);

  await cdp.nav(BASE+'/');await writerReady(cdp);await homeReady(cdp);
  resumeHref=await href(cdp,'[data-xizong-continue]');
  check(resumeHref.includes(`/xizong/${block.systemId}/${block.slug}/`)
      && resumeHref.includes('step=block-return'),'repair_advances_exact_block_return',resumeHref);
  const pendingRuntime=await getJson(cdp,XIZONG_SESSION_RUNTIME_KEY);
  check(pendingRuntime?.status==='ACTIVE'&&pendingRuntime.current_step===3&&Boolean(pendingRuntime.activated_at),
    'terminal_block_return_waits_for_exact_open');
  const pendingBlock=await getJson(cdp,stateKey);
  check(pendingBlock?.stage==='kp_recall'&&pendingBlock.kpIndex===kpIndex&&pendingBlock.groupIndex===groupIndex,
    'session_transport_preserves_block_stage_kp');
  const checkpointResult=await cdp.eval(`(async()=>{const m=await import('/src/lib/privateCheckpointRuntime.mjs');return m.saveSharedControlToPrivate(localStorage,{now:Date.now()});})()`);
  check(checkpointResult?.status==='saved','private_checkpoint_saved',JSON.stringify(checkpointResult));

  const remote=await cdp.eval(`(async()=>{const r=await fetch('/__kianos-private/checkpoint',{cache:'no-store'});return {status:r.status,body:await r.json()};})()`);
  check(remote?.status===200&&remote?.body?.status==='ready','private_checkpoint_ready');
  const xEntries=remote.body?.checkpoint?.payload?.subjects?.xizong?.entries||[];
  const xKeys=new Set(xEntries.map(e=>e?.key));
  check(xKeys.has(XIZONG_SESSION_KEY)&&xKeys.has(XIZONG_SESSION_RUNTIME_KEY)
      &&xKeys.has(stateKey)&&xKeys.has('kianos-xizong-last-location-v1'),
    'checkpoint_captures_session_block_resume');
  check(JSON.stringify(remote.body?.checkpoint?.payload?.shared||{}).includes(sessionId),
    'checkpoint_shared_plan_keeps_session_ref');

  firstBrowser.cdp.close();
  try{firstBrowser.chrome.kill('SIGTERM')}catch{}
  firstBrowser=null;

  secondBrowser=await launchBrowser(DEBUG_PORT+1,'restored');
  cdp=secondBrowser.cdp;
  await cdp.nav(BASE+'/');await writerReady(cdp);
  await waitExpr(cdp,`localStorage.getItem(${js(XIZONG_SESSION_RUNTIME_KEY)})!==null`,'checkpoint-restore',160);
  await homeReady(cdp);

  const restoredPlan=await getJson(cdp,EXAM_CHAT_PLAN_KEY);
  const restoredRuntime=await getJson(cdp,XIZONG_SESSION_RUNTIME_KEY);
  const restoredBlock=await getJson(cdp,stateKey);
  check(restoredPlan?.subjects?.xizong?.session_ref===sessionId,'restore_keeps_plan_session_ref');
  check(restoredRuntime?.status==='ACTIVE'&&restoredRuntime.current_step===3,
    'restore_keeps_pending_block_return');
  check(restoredBlock?.stage==='kp_recall'&&restoredBlock.kpIndex===kpIndex&&restoredBlock.groupIndex===groupIndex,
    'restore_keeps_exact_stage_kp');

  const restoredResume=await href(cdp,'[data-xizong-continue]');
  check(restoredResume.includes(`/xizong/${block.systemId}/${block.slug}/`)
      &&restoredResume.includes('session='+encodeURIComponent(sessionId))
      &&restoredResume.includes('step=block-return'),
    'restored_home_points_exact_block_return',restoredResume);
  await cdp.nav(BASE+restoredResume);await writerReady(cdp);
  await waitExpr(cdp,`(()=>{try{return JSON.parse(localStorage.getItem(${js(XIZONG_SESSION_RUNTIME_KEY)})||'null')?.status==='COMPLETE'}catch{return false}})()`,'block-return-complete');
  const completedRuntime=await getJson(cdp,XIZONG_SESSION_RUNTIME_KEY);
  const returnedBlock=await getJson(cdp,stateKey);
  const returnedTimer=await getJson(cdp,STUDY_TIMER_STATE_KEY);
  check(completedRuntime?.current_step===sessionInstruction.steps.length
      &&Boolean(completedRuntime?.handoff_completed_at),
    'exact_block_return_completes_session_only_on_target');
  check(returnedBlock?.stage==='kp_recall'&&returnedBlock.kpIndex===kpIndex&&returnedBlock.groupIndex===groupIndex,
    'block_return_does_not_rewrite_subject_learning_state');
  check(returnedTimer?.subject==='xizong'
      &&String(returnedTimer?.context?.route||'').includes(`xizong/${block.systemId}/${block.slug}`),
    'timer_retargets_exact_returned_block_route');

  await cdp.nav(BASE+'/');await writerReady(cdp);await homeReady(cdp);
  await click(cdp,'[data-exam-why]');
  await waitExpr(cdp,`document.querySelector('[data-exam-why-dialog]')?.open===true`,'restored-why');
  await cdp.eval(`(()=>{const d=document.querySelector('[data-exam-why-dialog] .examAdvanced');if(d&&!d.open)d.open=true;})()`);
  await click(cdp,'[data-exam-copy-daily]');
  await waitExpr(cdp,`Array.isArray(window.__kianosCopies)&&window.__kianosCopies.length>0`,'restored-packet',450);
  const restoredPacket=packetJson(await cdp.eval('window.__kianosCopies.at(-1)'));
  check(restoredPacket.subjects?.xizong?.evidence?.learning_state?.current_stage==='kp_recall'
      &&restoredPacket.subjects?.xizong?.evidence?.learning_state?.resume?.kp_id===secondKp.kpId,
    'restored_daily_packet_keeps_exact_xizong_resume');
  check(restoredPacket.subjects?.xizong?.evidence?.learning_state?.block_complete===false,
    'packet_does_not_promote_transport_return_to_completion');

  report.finished_at=new Date().toISOString();report.status='PASS';
  report.boundary='READY_FOR_REAL_USER_TRIAL for the demonstrated M5 integration claim only; no learner mastery or U claim.';
  fs.mkdirSync(path.resolve('.qa'),{recursive:true});
  fs.writeFileSync(path.resolve('.qa/xizong-exam-system-integration.json'),JSON.stringify(report,null,2));
  console.log(`XIZONG_M5_EXAM_SYSTEM_INTEGRATION_PASS | checks=${report.checks.length}`);
} catch(error){
  report.finished_at=new Date().toISOString();report.status='FAIL';report.error=String(error?.stack||error);
  fs.mkdirSync(path.resolve('.qa'),{recursive:true});
  fs.writeFileSync(path.resolve('.qa/xizong-exam-system-integration.json'),JSON.stringify(report,null,2));
  console.error(error);process.exitCode=1;
} finally {
  for(const row of [firstBrowser,secondBrowser]){
    try{row?.cdp?.close()}catch{}
    try{row?.chrome?.kill('SIGTERM')}catch{}
    try{if(row?.profile)fs.rmSync(row.profile,{recursive:true,force:true})}catch{}
  }
  await stopServer();
  fs.rmSync(privateDir,{recursive:true,force:true});
}
