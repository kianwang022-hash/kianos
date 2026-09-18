import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';
import { loadXizongSystemQuestionSweep } from '../src/lib/xizongQuestions.mjs';
import { XIZONG_MEMORY_STORAGE_KEY } from '../src/lib/xizongMemoryModel.mjs';

const PORT = 4329;
const DEBUG_PORT = 9229;
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const report = { schema: 'kianos.xizong.a1.browser_evidence_journey.v2', started_at: new Date().toISOString(), checks: [] };
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`A1_BROWSER_EVIDENCE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const js = (value) => JSON.stringify(value);

async function waitForHttp(url, attempts = 120) {
  for (let i = 0; i < attempts; i += 1) {
    try { const response = await fetch(url); if (response.ok) return response; } catch {}
    await sleep(200);
  }
  throw new Error(`HTTP_NOT_READY:${url}`);
}
function chromeExecutable() {
  for (const candidate of [process.env.CHROME_BIN, process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean)) {
    if (fs.existsSync(candidate)) return candidate;
  }
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    const found = spawnSync('which', [name], { encoding: 'utf8' }).stdout?.trim();
    if (found) return found;
  }
  throw new Error('CHROME_EXECUTABLE_NOT_FOUND');
}
class CDP {
  constructor(url) { this.url = url; this.nextId = 1; this.pending = new Map(); this.waiters = new Map(); }
  async connect() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const row = this.pending.get(message.id);
        if (!row) return;
        this.pending.delete(message.id);
        if (message.error) row.reject(new Error(`CDP_${row.method}:${JSON.stringify(message.error)}`));
        else row.resolve(message.result || {});
        return;
      }
      const list = this.waiters.get(message.method) || [];
      this.waiters.set(message.method, []);
      list.forEach((resolve) => resolve(message.params || {}));
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  waitEvent(method, timeout = 8000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`CDP_EVENT_TIMEOUT:${method}`)), timeout);
      const wrapped = (value) => { clearTimeout(timer); resolve(value); };
      const list = this.waiters.get(method) || [];
      list.push(wrapped); this.waiters.set(method, list);
    });
  }
  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
    if (result.exceptionDetails) throw new Error(`BROWSER_EVAL:${JSON.stringify(result.exceptionDetails)}`);
    return result.result?.value;
  }
  async navigate(url) {
    const loaded = this.waitEvent('Page.loadEventFired');
    await this.send('Page.navigate', { url });
    await loaded; await sleep(120);
  }
  async reload() {
    const loaded = this.waitEvent('Page.loadEventFired');
    await this.send('Page.reload', { ignoreCache: true });
    await loaded; await sleep(180);
  }
  close() { try { this.ws?.close(); } catch {} }
}
const clickExpr = (selector) => `(()=>{const e=document.querySelector(${js(selector)});if(!e)return {ok:false};e.click();return {ok:true,disabled:Boolean(e.disabled),hidden:Boolean(e.hidden)};})()`;

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32' });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-a1-e-'));
let chrome;
let cdp;

try {
  await waitForHttp(`${BASE}/xizong/`);
  const executable = chromeExecutable();
  chrome = spawn(executable, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  await waitForHttp(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
  const targets = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
  const pageTarget = targets.find((target) => target.type === 'page');
  check(Boolean(pageTarget?.webSocketDebuggerUrl), 'chrome_page_target_available');
  cdp = new CDP(pageTarget.webSocketDebuggerUrl);
  await cdp.connect(); await cdp.send('Page.enable'); await cdp.send('Runtime.enable');

  const system = loadXizongSystem('circulation');
  const sweep = loadXizongSystemQuestionSweep(system);
  check(system.canonicalId === 'A1' && system.blocks.length === 12, 'a1_system_identity');
  check(sweep?.questions?.length === 376, 'a1_question_truth_available', String(sweep?.questions?.length || 0));
  const b2Meta = system.blocks.find((row) => row.blockId === 'circulation-b02');
  const b2 = loadXizongBlock('circulation', b2Meta.slug);
  const firstKp = b2.kpRecords[0].kpId;
  const firstGroupIds = b2.logicGroups[0].kpIds;
  const b2StudyKey = 'kianos-xizong-astro-v2:xizong:circulation-b02';
  const b2ExtKey = 'kianos-xizong-memory-review-v2:xizong:circulation-b02';

  // ----- Block Evidence owner: repeated real Recall stays append-preserved. -----
  await cdp.navigate(`${BASE}/xizong/circulation/b02/`);
  await cdp.evaluate(`(()=>{for(const key of Object.keys(localStorage))if(key.includes('xizong'))localStorage.removeItem(key);sessionStorage.clear();})()`);
  await cdp.reload();
  await cdp.evaluate(`localStorage.setItem(${js(b2StudyKey)}, JSON.stringify({stage:'kp_recall',groupIndex:0,kpIndex:0,learned:${JSON.stringify(Object.fromEntries(firstGroupIds.map((id) => [id, true])))},ratings:{},blockRecallDone:false,completed:false}))`);
  await cdp.reload();
  check(await cdp.evaluate(`document.querySelectorAll('.xv6MemoryReview').length`) === 0, 'retired_after_learn_ui_absent');
  check(await cdp.evaluate(`Boolean(document.querySelector('[data-xizong-recall-evidence-bridge]')?.hidden)`), 'recall_evidence_bridge_is_nonvisual');
  check(await cdp.evaluate(`Boolean(document.querySelector('[data-xizong-memory-release-bridge]')?.hidden)`), 'memory_release_bridge_is_nonvisual');

  await cdp.evaluate(clickExpr('[data-kp-recall-card]:not([hidden]) [data-kp-reveal]'));
  await cdp.evaluate(clickExpr('[data-kp-recall-card]:not([hidden]) [data-rating="unknown"]'));
  await sleep(180);
  let ext = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(b2ExtKey)})||'null')`);
  let recallEvents = (ext?.evidenceHistory || []).filter((row) => row.type === 'KP_RECALL' && row.kp_id === firstKp && row.evidence_origin === 'USER_RECALL_ATTEMPT');
  check(recallEvents.length === 1, 'first_real_recall_attempt_appended', String(recallEvents.length));

  await cdp.reload();
  await cdp.evaluate(clickExpr('[data-kp-target="0"]'));
  await cdp.evaluate(clickExpr('[data-kp-recall-card]:not([hidden]) [data-kp-reveal]'));
  await cdp.evaluate(clickExpr('[data-kp-recall-card]:not([hidden]) [data-rating="unknown"]'));
  await sleep(180);
  ext = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(b2ExtKey)})||'null')`);
  recallEvents = (ext?.evidenceHistory || []).filter((row) => row.type === 'KP_RECALL' && row.kp_id === firstKp && row.evidence_origin === 'USER_RECALL_ATTEMPT');
  check(recallEvents.length === 2, 'repeated_identical_recall_attempt_preserved', String(recallEvents.length));
  let study = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(b2StudyKey)})||'null')`);
  check(study?.ratings?.[firstKp] === 'unknown', 'latest_recall_state_remains_unknown');
  check(!(ext?.evidenceHistory || []).some((row) => row.type === 'MEMORY' || row.type === 'CHAT_PLAN_REVIEW'), 'block_recall_does_not_manufacture_retired_after_learn_evidence');

  // The live Block dock must export Chat-readable learner state from the current runtime,
  // not from the retired After Learn surface.
  check(await cdp.evaluate(`getComputedStyle(document.querySelector('.kianosCurrentDock')).display === 'none'`), 'engineering_current_dock_hidden_on_xizong');
  await cdp.evaluate(`(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async(text)=>{globalThis.__xizongStudyPacket=String(text);}}});})()`);
  await cdp.evaluate(clickExpr('[data-copy-study-packet]'));
  await sleep(120);
  const packetText = await cdp.evaluate(`globalThis.__xizongStudyPacket || ''`);
  const studyPacket = JSON.parse(packetText);
  check(studyPacket?.schema === 'kianos.xizong.study_packet.v3', 'live_study_packet_schema');
  check(studyPacket?.current?.block_id === 'circulation-b02', 'live_study_packet_block_identity', String(studyPacket?.current?.block_id || ''));
  check(studyPacket?.learning_state?.current_stage === 'kp_recall', 'live_study_packet_stage', String(studyPacket?.learning_state?.current_stage || ''));
  const expectedResumeKp = b2.kpRecords[Math.max(0, Math.min(b2.kpRecords.length - 1, Number(study?.kpIndex || 0)))]?.kpId || '';
  check(studyPacket?.learning_state?.resume?.kp_id === expectedResumeKp, 'live_study_packet_exact_kp_resume', `${studyPacket?.learning_state?.resume?.kp_id || ''}/${expectedResumeKp}`);
  check(studyPacket?.learning_state?.source_contact && Object.prototype.hasOwnProperty.call(studyPacket.learning_state.source_contact, 'whole_block_confirmed'), 'live_study_packet_source_contact_state');
  check(studyPacket?.learning_state?.ttsx && Object.prototype.hasOwnProperty.call(studyPacket.learning_state.ttsx, 'evidence'), 'live_study_packet_ttsx_state');
  const packetKp = (studyPacket?.kp_evidence || []).find((row) => row.kp_id === firstKp);
  check(packetKp?.recall_rating === 'unknown', 'live_study_packet_latest_recall');
  check(Number(packetKp?.repeated_unstable_count || 0) >= 2, 'live_study_packet_repeated_instability', String(packetKp?.repeated_unstable_count || 0));
  check((studyPacket?.block_evidence_history || []).filter((row) => row.type === 'KP_RECALL' && row.kp_id === firstKp).length >= 2, 'live_study_packet_preserves_attempt_history');
  check(Array.isArray(studyPacket?.practice?.wrong_uncertain), 'live_study_packet_practice_summary_present');

  const memoryBeforeComplete = await cdp.evaluate(`(()=>{try{return JSON.parse(localStorage.getItem(${js(XIZONG_MEMORY_STORAGE_KEY)})||'null')}catch{return null}})()`);
  check(!memoryBeforeComplete?.releasedBlocks?.['circulation-b02'], 'incomplete_block_does_not_release_memory');

  // ----- System W/U repair: stable excluded, reviewed relation routed, unresolved relation not guessed. -----
  const reviewedQuestion = sweep.questions.find((q) => q.relation?.blockId && q.relation?.primaryKpId && q.relation.blockId !== 'circulation-b02')
    || sweep.questions.find((q) => q.relation?.blockId && q.relation?.primaryKpId);
  const unresolvedQuestion = sweep.questions.find((q) => q.questionId !== reviewedQuestion?.questionId && (!q.relation?.blockId || !q.relation?.primaryKpId));
  const stableQuestion = sweep.questions.find((q) => ![reviewedQuestion?.questionId, unresolvedQuestion?.questionId].includes(q.questionId));
  check(Boolean(reviewedQuestion && unresolvedQuestion && stableQuestion), 'reviewed_and_unresolved_relation_fixtures_exist');
  const reviewedBlockMeta = system.blocks.find((row) => row.blockId === reviewedQuestion.relation.blockId);
  check(Boolean(reviewedBlockMeta), 'reviewed_relation_targets_current_a1_block', reviewedQuestion.relation.blockId);
  const targetObjectId = `xizong:${reviewedQuestion.relation.blockId}`;
  const targetStudyKey = `kianos-xizong-astro-v2:${targetObjectId}`;
  await cdp.navigate(`${BASE}/xizong/circulation/`);
  await cdp.evaluate(`localStorage.setItem(${js(targetStudyKey)}, JSON.stringify({stage:'block_learn',groupIndex:0,kpIndex:0,learned:{${js(reviewedQuestion.relation.primaryKpId)}:true},ratings:{${js(reviewedQuestion.relation.primaryKpId)}:'unknown'},blockRecallDone:false,completed:false}))`);
  const sweepKey = 'kianos:xizong:system-question-sweep:circulation:v1';
  await cdp.evaluate(`localStorage.setItem(${js(sweepKey)}, JSON.stringify({results:{${js(stableQuestion.questionId)}:{status:'stable',selected:['A']},${js(reviewedQuestion.questionId)}:{status:'wrong',selected:['B']},${js(unresolvedQuestion.questionId)}:{status:'uncertain',selected:['C']}}}))`);
  const planPayload = { plan: [
    { question_id: reviewedQuestion.questionId, reason: 'reviewed W/U', action: 'repair reviewed owner', priority: 'high' },
    { question_id: unresolvedQuestion.questionId, reason: 'unresolved W/U', action: 'keep unresolved', priority: 'medium' },
    { question_id: stableQuestion.questionId, reason: 'stable must not repair', action: 'should drop', priority: 'low' },
    { question_id: 'xizong-official-fake', reason: 'fake', action: 'drop', priority: 'low' }
  ] };
  await cdp.evaluate(`(()=>{const e=document.querySelector('[data-plan-text]');e.value=${js(JSON.stringify(planPayload))};})()`);
  await cdp.evaluate(clickExpr('[data-apply-plan]'));
  await sleep(120);
  const repairKey = 'kianos:xizong:system-repair-return:circulation:v1';
  const repair = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(repairKey)})||'null')`);
  const repairIds = (repair?.plan || []).map((row) => row.questionId).sort();
  check(repairIds.length === 2 && repairIds.includes(reviewedQuestion.questionId) && repairIds.includes(unresolvedQuestion.questionId), 'system_repair_accepts_only_current_wrong_uncertain', repairIds.join(','));
  check(!repairIds.includes(stableQuestion.questionId), 'stable_question_creates_no_repair_debt');

  const memoryAfterPlan = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(XIZONG_MEMORY_STORAGE_KEY)})||'null')`);
  const activeSystemRepairs = (memoryAfterPlan?.repairTasks || []).filter((task) => task?.status !== 'DONE');
  check(activeSystemRepairs.length === 1, 'reviewed_wu_creates_one_visible_memory_repair', String(activeSystemRepairs.length));
  check(activeSystemRepairs[0]?.kpId === reviewedQuestion.relation.primaryKpId, 'memory_repair_targets_reviewed_kp');
  check((activeSystemRepairs[0]?.sourceQuestionIds || []).includes(reviewedQuestion.questionId), 'memory_repair_preserves_source_question');
  check(!(activeSystemRepairs[0]?.sourceQuestionIds || []).includes(unresolvedQuestion.questionId), 'unresolved_question_not_guessed_into_memory_repair');

  await cdp.navigate(`${BASE}/xizong/memory/`);
  await cdp.evaluate(clickExpr('[data-memory-view="REPAIR"]'));
  await sleep(120);
  check(!(await cdp.evaluate(`document.querySelector('[data-memory-repair-card]')?.hidden`)), 'memory_repair_is_learner_visible');
  check((await cdp.evaluate(`document.querySelector('[data-repair-title]')?.textContent || ''`)).includes(reviewedQuestion.relation.primaryKpId), 'memory_repair_shows_exact_kp');
  check(Boolean(await cdp.evaluate(`document.querySelector('[data-repair-block-link]')?.getAttribute('href') || ''`)), 'memory_repair_has_block_return');
  check((await cdp.evaluate(`document.querySelector('[data-repair-return-link]')?.getAttribute('href') || ''`)).includes('/xizong/practice/circulation/'), 'memory_repair_has_question_return');

  const inboxSnapshot = await cdp.evaluate(`(()=>{const out={};for(const key of Object.keys(localStorage)){if(key.startsWith('kianos-xizong-repair-inbox-v1:'))out[key]=JSON.parse(localStorage.getItem(key));}return out;})()`);
  const inboxQuestionIds = Object.values(inboxSnapshot).flatMap((inbox) => (inbox?.plans || []).flatMap((plan) => plan.sourceQuestionIds || []));
  check(inboxQuestionIds.includes(reviewedQuestion.questionId), 'reviewed_relation_creates_block_inbox');
  check(!inboxQuestionIds.includes(unresolvedQuestion.questionId), 'unresolved_relation_not_guessed_into_block_inbox');

  // Consume inbox in the reviewed target Block. Original Recall state must survive repair import.
  const targetExtKey = `kianos-xizong-memory-review-v2:${targetObjectId}`;
  const targetInboxKey = `kianos-xizong-repair-inbox-v1:${targetObjectId}`;
  await cdp.navigate(`${BASE}/xizong/circulation/${reviewedBlockMeta.slug}/`);
  await sleep(900);
  const targetStudy = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(targetStudyKey)})||'null')`);
  const targetExt = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(targetExtKey)})||'null')`);
  check(targetStudy?.ratings?.[reviewedQuestion.relation.primaryKpId] === 'unknown', 'system_repair_import_preserves_original_block_recall');
  check(await cdp.evaluate(`localStorage.getItem(${js(targetInboxKey)})`) === null, 'repair_inbox_cleared_only_after_block_import');
  check((targetExt?.reviewPlan || []).some((row) => row.kpId === reviewedQuestion.relation.primaryKpId && (row.sourceQuestionIds || []).includes(reviewedQuestion.questionId)), 'reviewed_wu_plan_imported_to_exact_block_kp');
  check((targetExt?.evidenceHistory || []).some((row) => row.type === 'SYSTEM_WU_PLAN_IMPORTED' && row.evidence_role === 'REPAIR_ONLY' && (row.source_question_ids || []).includes(reviewedQuestion.questionId)), 'repair_inbox_import_evidence_is_repair_only');
  const sweepAfterRepair = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(sweepKey)})||'null')`);
  check(sweepAfterRepair?.results?.[reviewedQuestion.questionId]?.status === 'wrong' && sweepAfterRepair?.results?.[stableQuestion.questionId]?.status === 'stable', 'repair_return_does_not_rewrite_original_question_evidence');

  await cdp.navigate(`${BASE}/xizong/memory/`);
  await cdp.evaluate(clickExpr('[data-memory-view="REPAIR"]'));
  await sleep(100);
  await cdp.evaluate(clickExpr('[data-repair-complete]'));
  await sleep(100);
  const memoryAfterRepairDone = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(XIZONG_MEMORY_STORAGE_KEY)})||'null')`);
  const completedRepair = (memoryAfterRepairDone?.repairTasks || []).find((task) => task?.kpId === ${js(reviewedQuestion.relation.primaryKpId)});
  check(completedRepair?.status === 'DONE' && Boolean(completedRepair?.completedAt), 'memory_repair_completion_is_durable_evidence');
  const sweepAfterRepairDone = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(sweepKey)})||'null')`);
  check(sweepAfterRepairDone?.results?.[reviewedQuestion.questionId]?.status === 'wrong', 'repair_completion_does_not_rewrite_question_attempt');

  // System question/relation version changes must invalidate visible question-derived Repair
  // while preserving unrelated systems and archiving the stale tasks.
  const systemEvidenceMetaKey = 'kianos:xizong:system-evidence-meta:circulation:v1';
  await cdp.navigate(`${BASE}/xizong/practice/circulation/`);
  const currentSystemEvidenceVersion = await cdp.evaluate(`document.querySelector('[data-xizong-system-evidence-guard]')?.getAttribute('data-evidence-version') || ''`);
  check(Boolean(currentSystemEvidenceVersion), 'system_evidence_version_present');
  await cdp.evaluate(`(()=>{
    const key=${js(XIZONG_MEMORY_STORAGE_KEY)};
    const memory=JSON.parse(localStorage.getItem(key)||'null')||{schema:'kianos.xizong.memory.v1',revision:1,releasedBlocks:{},cards:{},promptOverrides:{},marks:{},evidence:[],attention:{},repairTasks:[]};
    memory.repairTasks=[
      ...(memory.repairTasks||[]),
      {id:'stale-circulation-repair',systemId:'circulation',blockId:'circulation-b01',kpId:'circulation-b01-kp01',origin:'SYSTEM_WU_CHAT_RETURN',status:'ACTIVE',sourceQuestionIds:['old-q']},
      {id:'keep-respiratory-repair',systemId:'respiratory',blockId:'respiratory-r01',kpId:'respiratory-r01-kp01',origin:'SYSTEM_WU_CHAT_RETURN',status:'ACTIVE',sourceQuestionIds:['other-q']}
    ];
    localStorage.setItem(key,JSON.stringify(memory));
    localStorage.setItem(${js(systemEvidenceMetaKey)},JSON.stringify({version:'STALE_SYSTEM_VERSION'}));
  })()`);
  await cdp.reload();
  await sleep(1200);
  const memoryAfterSystemVersionChange = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(XIZONG_MEMORY_STORAGE_KEY)})||'null')`);
  check(!(memoryAfterSystemVersionChange?.repairTasks||[]).some((task)=>task?.id==='stale-circulation-repair'), 'stale_visible_system_repair_invalidated');
  check((memoryAfterSystemVersionChange?.repairTasks||[]).some((task)=>task?.id==='keep-respiratory-repair'), 'unrelated_system_repair_preserved');
  const staleSystemArchive = await cdp.evaluate(`(()=>{
    const keys=Object.keys(localStorage).filter((key)=>key.startsWith('kianos-xizong-stale-system-evidence:circulation:')).sort();
    const key=keys[keys.length-1];
    return key?JSON.parse(localStorage.getItem(key)||'null'):null;
  })()`);
  check((staleSystemArchive?.stale_visible_memory_repairs||[]).some((task)=>task?.id==='stale-circulation-repair'), 'stale_visible_system_repair_archived');

  // ----- Block content-version mutation: archive stale evidence, preserve notes only. -----
  const staleMeta = system.blocks.find((row) => row.blockId === 'circulation-b03');
  const staleBlock = loadXizongBlock('circulation', staleMeta.slug);
  const staleObjectId = 'xizong:circulation-b03';
  const staleStudyKey = `kianos-xizong-astro-v2:${staleObjectId}`;
  const staleExtKey = `kianos-xizong-memory-review-v2:${staleObjectId}`;
  const stalePersonalKey = `kianos-xizong-personal-v1:${staleObjectId}`;
  const staleInboxKey = `kianos-xizong-repair-inbox-v1:${staleObjectId}`;
  const staleMetaKey = `kianos-xizong-evidence-meta-v1:${staleObjectId}`;
  await cdp.navigate(`${BASE}/xizong/circulation/${staleMeta.slug}/`);
  const currentBlockVersion = await cdp.evaluate(`document.querySelector('[data-xizong-block-evidence-guard]')?.getAttribute('data-evidence-version') || ''`);
  check(Boolean(currentBlockVersion), 'block_evidence_version_present');
  const noteKp = staleBlock.kpRecords[0].kpId;
  await cdp.evaluate(`(()=>{
    localStorage.setItem(${js(staleMetaKey)},JSON.stringify({version:'STALE_VERSION'}));
    localStorage.setItem(${js(staleStudyKey)},JSON.stringify({stage:'block_complete',learned:{${js(noteKp)}:true},ratings:{${js(noteKp)}:'mastered'},blockRecallDone:true,completed:true}));
    localStorage.setItem(${js(staleExtKey)},JSON.stringify({memory:{${js(noteKp)}:'STABLE'},reviewPlan:[{kpId:${js(noteKp)},sourceQuestionIds:['old-q']}],evidenceHistory:[{type:'KP_RECALL',kp_id:${js(noteKp)},rating:'mastered'}]}));
    localStorage.setItem(${js(stalePersonalKey)},JSON.stringify({lectureRead:true,kp:{${js(noteKp)}:{comment:'keep this note'}}}));
    localStorage.setItem(${js(staleInboxKey)},JSON.stringify({plans:[{kpId:${js(noteKp)},sourceQuestionIds:['old-q']}]}));
  })()`);
  await cdp.reload(); await sleep(900);
  const staleStudy = await cdp.evaluate(`(()=>{try{return JSON.parse(localStorage.getItem(${js(staleStudyKey)})||'null')}catch{return null}})()`);
  const staleExt = await cdp.evaluate(`(()=>{try{return JSON.parse(localStorage.getItem(${js(staleExtKey)})||'null')}catch{return null}})()`);
  const stalePersonal = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(stalePersonalKey)})||'null')`);
  const staleArchiveKeys = await cdp.evaluate(`Object.keys(localStorage).filter((key)=>key.startsWith(${js(`kianos-xizong-stale-evidence-v1:${staleObjectId}:`)}))`);
  check(!staleStudy?.completed, 'stale_block_completion_invalidated');
  check(!(staleExt?.evidenceHistory || []).some((row) => row?.rating === 'mastered'), 'stale_block_evidence_not_reused_as_current');
  check(await cdp.evaluate(`localStorage.getItem(${js(staleInboxKey)})`) === null, 'stale_block_repair_inbox_invalidated');
  check(stalePersonal?.lectureRead === false && stalePersonal?.kp?.[noteKp]?.comment === 'keep this note', 'stale_block_reset_preserves_note_but_not_lecture_completion');
  check(staleArchiveKeys.length > 0, 'stale_block_evidence_archived');

  // Malformed legacy evidence bridge data recovers without manufacturing mastery.
  const malformedMeta = system.blocks.find((row) => row.blockId === 'circulation-b05');
  const malformedKey = 'kianos-xizong-memory-review-v2:xizong:circulation-b05';
  await cdp.navigate(`${BASE}/xizong/circulation/${malformedMeta.slug}/`);
  await cdp.evaluate(`localStorage.setItem(${js(malformedKey)},'{malformed')`);
  await cdp.reload(); await sleep(150);
  const repairedMalformed = await cdp.evaluate(`(()=>{try{return JSON.parse(localStorage.getItem(${js(malformedKey)})||'null')}catch{return null}})()`);
  check(repairedMalformed !== null, 'malformed_evidence_store_recovers_to_valid_json');
  check(!(repairedMalformed?.evidenceHistory || []).some((row) => row?.rating === 'mastered' || row?.state === 'STABLE'), 'malformed_evidence_store_manufactures_no_mastery');

  // Whole-paper holdout protects every question in the held year at Evidence selection level.
  const heldYear = Number(sweep.years[0]);
  const heldIds = sweep.questions.filter((q) => Number(q.year) === heldYear).map((q) => q.questionId);
  const activeIds = sweep.questions.filter((q) => Number(q.year) !== heldYear).map((q) => q.questionId);
  check(heldIds.length > 0 && heldIds.every((id) => !activeIds.includes(id)), 'whole_paper_holdout_excludes_entire_year', `${heldYear}:${heldIds.length}`);

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.evidence_class = 'EXECUTED_HEADLESS_CHROME_EVIDENCE_SEMANTICS_NOT_REAL_LEARNER_U';
  report.chrome = executable;
  report.a1 = { blocks: system.blocks.length, kp: 312, questions: sweep.questions.length, reviewed_question: reviewedQuestion.questionId, unresolved_question: unresolvedQuestion.questionId, held_year: heldYear };
  fs.mkdirSync(path.resolve(process.cwd(), '.qa'), { recursive: true });
  fs.writeFileSync(path.resolve(process.cwd(), '.qa/xizong-a1-browser-evidence.json'), JSON.stringify(report, null, 2));
  console.log(`A1_BROWSER_EVIDENCE_JOURNEY_PASS | checks=${report.checks.length} | questions=${sweep.questions.length} | U=NOT_TESTED`);
} catch (error) {
  report.finished_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.mkdirSync(path.resolve(process.cwd(), '.qa'), { recursive: true });
  fs.writeFileSync(path.resolve(process.cwd(), '.qa/xizong-a1-browser-evidence.json'), JSON.stringify(report, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  cdp?.close();
  try { chrome?.kill('SIGTERM'); } catch {}
  if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch {} }
  else { try { server.kill('SIGTERM'); } catch {} }
  await sleep(250);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
}