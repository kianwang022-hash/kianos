import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { loadXizongSystem } from '../src/lib/xizong.mjs';
import { loadXizongSystemQuestionSweep } from '../src/lib/xizongQuestions.mjs';

const PORT = 4328;
const DEBUG_PORT = 9228;
const BASE = `http://127.0.0.1:${PORT}`;
const report = { schema: 'kianos.xizong.a1.browser_runtime_journey.v1', started_at: new Date().toISOString(), checks: [] };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`A1_BROWSER_RUNTIME_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};

async function waitForHttp(url, attempts = 100) {
  for (let i = 0; i < attempts; i += 1) {
    try { const response = await fetch(url); if (response.ok) return response; } catch {}
    await sleep(200);
  }
  throw new Error(`HTTP_NOT_READY:${url}`);
}

function chromeExecutable() {
  const direct = [
    process.env.CHROME_BIN,
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean);
  for (const candidate of direct) if (fs.existsSync(candidate)) return candidate;
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    const found = spawnSync('which', [name], { encoding: 'utf8' }).stdout?.trim();
    if (found) return found;
  }
  throw new Error('CHROME_EXECUTABLE_NOT_FOUND');
}

async function getJson(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const request = http.request(url, { method }, (response) => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        if ((response.statusCode || 500) >= 400) return reject(new Error(`HTTP_${response.statusCode}:${url}:${data}`));
        try { resolve(JSON.parse(data)); } catch (error) { reject(error); }
      });
    });
    request.on('error', reject);
    request.end();
  });
}

class CDP {
  constructor(url) {
    this.url = url;
    this.nextId = 1;
    this.pending = new Map();
    this.waiters = new Map();
  }
  async connect() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(`CDP_${pending.method}:${JSON.stringify(message.error)}`));
        else pending.resolve(message.result || {});
        return;
      }
      if (message.method) {
        const list = this.waiters.get(message.method) || [];
        this.waiters.set(message.method, []);
        list.forEach((resolve) => resolve(message.params || {}));
      }
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
      list.push(wrapped);
      this.waiters.set(method, list);
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
    await loaded;
    await sleep(120);
  }
  async reload() {
    const loaded = this.waitEvent('Page.loadEventFired');
    await this.send('Page.reload', { ignoreCache: true });
    await loaded;
    await sleep(120);
  }
  close() { try { this.ws?.close(); } catch {} }
}

const js = (value) => JSON.stringify(value);
const visibleStageExpr = `document.querySelector('[data-study-stage]:not([hidden])')?.getAttribute('data-study-stage') || ''`;
const clickExpr = (selector) => `(()=>{const e=document.querySelector(${js(selector)});if(!e)return {ok:false};e.click();return {ok:true,disabled:Boolean(e.disabled),hidden:Boolean(e.hidden)};})()`;
const existsExpr = (selector) => `Boolean(document.querySelector(${js(selector)}))`;
const hiddenExpr = (selector) => `(()=>{const e=document.querySelector(${js(selector)});return e ? Boolean(e.hidden) : null;})()`;

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-a1-r-'));
let chrome;
let cdp;

try {
  await waitForHttp(`${BASE}/xizong/`);
  const executable = chromeExecutable();
  chrome = spawn(executable, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
    `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profile}`, 'about:blank'
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  await waitForHttp(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
  const targets = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  const pageTarget = targets.find((target) => target.type === 'page');
  check(Boolean(pageTarget?.webSocketDebuggerUrl), 'chrome_page_target_available');
  cdp = new CDP(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  const system = loadXizongSystem('circulation');
  const blockIds = system.blocks.map((block) => block.blockId);
  check(system.canonicalId === 'A1' && blockIds.length === 12, 'a1_system_identity', `${system.canonicalId}/${blockIds.length}`);

  const blockUrl = `${BASE}/xizong/circulation/b02/`;
  const studyKey = 'kianos-xizong-astro-v2:xizong:circulation-b02';
  const personalKey = 'kianos-xizong-personal-v1:xizong:circulation-b02';

  // Clean first-learning state.
  await cdp.navigate(blockUrl);
  await cdp.evaluate(`(()=>{for(const key of Object.keys(localStorage))if(key.includes('xizong'))localStorage.removeItem(key);sessionStorage.clear();})()`);
  await cdp.reload();
  check(await cdp.evaluate(visibleStageExpr) === 'block_learn', 'clean_block_starts_at_orientation');
  check((await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(studyKey)})||'null')`))?.completed !== true, 'clean_block_does_not_manufacture_completion');

  // Enter first Logic Group and verify no learning evidence yet.
  await cdp.evaluate(clickExpr('[data-stage-next="logic_group"]'));
  check(await cdp.evaluate(visibleStageExpr) === 'logic_group', 'block_to_logic_group_transition');
  await cdp.evaluate(clickExpr('[data-enter-group]'));
  check(await cdp.evaluate(visibleStageExpr) === 'kp_learn', 'logic_group_to_group_lecture_transition');
  let state = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(studyKey)})||'null')`);
  check(Object.keys(state?.learned || {}).length === 0, 'entering_group_does_not_mark_learning');

  // Attack early Recall and answer reveal.
  await cdp.evaluate(clickExpr('[data-stage-target="kp_recall"]'));
  check(await cdp.evaluate(visibleStageExpr) === 'kp_learn', 'early_kp_recall_navigation_rejected');
  await cdp.evaluate(clickExpr('[data-kp-reveal]'));
  check(await cdp.evaluate(hiddenExpr('[data-kp-answer]')) === true, 'early_answer_reveal_rejected');

  // Confirm only first Logic Group Lecture contact.
  await cdp.evaluate(clickExpr('[data-group-lecture-done]'));
  check(await cdp.evaluate(visibleStageExpr) === 'kp_recall', 'group_lecture_returns_to_recall');
  state = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(studyKey)})||'null')`);
  const totalKp = await cdp.evaluate(`document.querySelectorAll('[data-kp-recall-card]').length`);
  let learnedCount = Object.values(state?.learned || {}).filter(Boolean).length;
  check(learnedCount > 0 && learnedCount < totalKp, 'group_contact_marks_only_current_group', `${learnedCount}/${totalKp}`);

  // First Recall then refresh/resume mid-group.
  await cdp.evaluate(clickExpr('[data-kp-reveal]:not([hidden])'));
  check(await cdp.evaluate(hiddenExpr('[data-kp-recall-card]:not([hidden]) [data-kp-answer]')) === false, 'learned_kp_reveal_allowed');
  await cdp.evaluate(clickExpr('[data-kp-recall-card]:not([hidden]) [data-rating="mastered"]'));
  await sleep(180);
  state = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(studyKey)})||'null')`);
  check(Object.keys(state?.ratings || {}).length === 1, 'first_recall_persisted');
  const savedIndex = state.kpIndex;
  await cdp.reload();
  state = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(studyKey)})||'null')`);
  check(state?.stage === 'kp_recall' && state?.kpIndex === savedIndex, 'refresh_restores_mid_group_recall');

  // Finish first group Recall.
  let safety = 0;
  while ((await cdp.evaluate(visibleStageExpr)) === 'kp_recall' && safety++ < 20) {
    await cdp.evaluate(clickExpr('[data-kp-recall-card]:not([hidden]) [data-kp-reveal]:not([hidden])'));
    await cdp.evaluate(clickExpr('[data-kp-recall-card]:not([hidden]) [data-rating="mastered"]'));
    await sleep(150);
  }
  check(await cdp.evaluate(visibleStageExpr) === 'group_close', 'first_logic_group_closes_after_recall');

  // Early Block Recall still fails closed after only one group.
  await cdp.evaluate(clickExpr('[data-stage-target="block_recall"]'));
  check(await cdp.evaluate(visibleStageExpr) === 'group_close', 'early_block_recall_rejected');

  // Complete all remaining groups through real UI transitions.
  await cdp.evaluate(clickExpr('[data-group-close-next]'));
  safety = 0;
  while ((await cdp.evaluate(visibleStageExpr)) !== 'block_recall' && safety++ < 120) {
    const stage = await cdp.evaluate(visibleStageExpr);
    if (stage === 'logic_group') await cdp.evaluate(clickExpr('[data-enter-group]'));
    else if (stage === 'kp_learn') await cdp.evaluate(clickExpr('[data-group-lecture-done]'));
    else if (stage === 'kp_recall') {
      await cdp.evaluate(clickExpr('[data-kp-recall-card]:not([hidden]) [data-kp-reveal]:not([hidden])'));
      await cdp.evaluate(clickExpr('[data-kp-recall-card]:not([hidden]) [data-rating="known"]'));
      await sleep(145);
    } else if (stage === 'group_close') await cdp.evaluate(clickExpr('[data-group-close-next]'));
    else throw new Error(`UNEXPECTED_BLOCK_STAGE:${stage}`);
    await sleep(40);
  }
  check(await cdp.evaluate(visibleStageExpr) === 'block_recall', 'all_groups_release_block_recall');
  state = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(studyKey)})||'null')`);
  learnedCount = Object.values(state?.learned || {}).filter(Boolean).length;
  const recalledCount = Object.keys(state?.ratings || {}).length;
  const allKpIds = await cdp.evaluate(`Array.from(document.querySelectorAll('[data-kp-recall-card]')).map(card=>card.getAttribute('data-kp-id'))`);
  const missingRecallIds = allKpIds.filter((id) => !state?.ratings?.[id]);
  check(learnedCount === totalKp && recalledCount === totalKp, 'all_kps_have_learning_and_recall_evidence', `learned=${learnedCount}/${totalKp};recalled=${recalledCount}/${totalKp};missing=${missingRecallIds.join(',')}`);

  // Block completion requires Block Recall + Block-level original Lecture confirmation.
  await cdp.evaluate(clickExpr('[data-stage-target="block_complete"]'));
  check(await cdp.evaluate(visibleStageExpr) === 'block_recall', 'block_complete_before_block_recall_rejected');
  await cdp.evaluate(clickExpr('[data-block-recall-complete]'));
  check(await cdp.evaluate(visibleStageExpr) === 'block_complete', 'block_recall_completion_advances_to_close');
  check(await cdp.evaluate(`document.querySelector('[data-block-complete]')?.disabled === true`), 'lecture_confirmation_keeps_block_completion_locked');
  await cdp.evaluate(clickExpr('[data-lecture-read]'));
  await sleep(80);
  check(await cdp.evaluate(`document.querySelector('[data-block-complete]')?.disabled === false`), 'lecture_confirmation_unlocks_block_completion');
  await cdp.evaluate(clickExpr('[data-block-complete]'));
  state = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(studyKey)})||'null')`);
  check(state?.completed === true, 'block_completion_persists');
  check((await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(personalKey)})||'null')`))?.lectureRead === true, 'lecture_confirmation_persists');
  await cdp.reload();
  state = await cdp.evaluate(`JSON.parse(localStorage.getItem(${js(studyKey)})||'null')`);
  check(state?.completed === true && state?.stage === 'block_complete', 'refresh_preserves_completed_block_state');

  // Continue returns to last real Block route.
  await cdp.navigate(`${BASE}/xizong/`);
  const continueHref = await cdp.evaluate(`document.querySelector('[data-xizong-continue]')?.getAttribute('href') || ''`);
  check(continueHref.includes('/xizong/circulation/b02/'), 'home_continue_returns_to_last_block', continueHref);

  // System Recall cannot be consumed after only one completed Block.
  await cdp.navigate(`${BASE}/xizong/circulation/`);
  check(await cdp.evaluate(existsExpr('[data-start-recall]')), 'system_exit_runtime_present');
  await cdp.evaluate(clickExpr('[data-start-recall]'));
  check(await cdp.evaluate(`Boolean(document.querySelector('[data-recall-dialog]')?.open)`) === false, 'early_system_recall_dialog_stays_closed');
  check(await cdp.evaluate(`localStorage.getItem('kianos:xizong:system-recall:circulation:v1')`) === null, 'early_system_recall_creates_no_evidence');

  // Engineering fixture: mark all A1 Blocks complete to exercise late transitions.
  await cdp.evaluate(`(${JSON.stringify(blockIds)}).forEach(id=>{const key='kianos-xizong-astro-v2:xizong:'+id;let old={};try{old=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{};localStorage.setItem(key,JSON.stringify({...old,completed:true}));})`);
  await cdp.reload();
  await cdp.evaluate(clickExpr('[data-start-recall]'));
  check(await cdp.evaluate(`Boolean(document.querySelector('[data-recall-dialog]')?.open)`) === true, 'completed_system_releases_system_recall');
  check(await cdp.evaluate(hiddenExpr('[data-recall-front]')) === false, 'system_recall_front_visible_after_prerequisites');
  await cdp.evaluate(clickExpr('[data-reveal-recall]'));
  check(await cdp.evaluate(hiddenExpr('[data-recall-reveal]')) === false, 'system_recall_reveal_after_prerequisites');
  await cdp.evaluate(clickExpr('[data-complete-recall]'));
  const systemRecall = await cdp.evaluate(`JSON.parse(localStorage.getItem('kianos:xizong:system-recall:circulation:v1')||'null')`);
  check(Boolean(systemRecall?.completedAt), 'system_recall_completion_persists');

  // Holdout remains an explicit prerequisite for the official System sweep.
  const sweep = loadXizongSystemQuestionSweep(system);
  check(sweep?.questions?.length > 0 && sweep?.years?.length > 1, 'a1_question_sweep_available', String(sweep?.questions?.length || 0));
  check(await cdp.evaluate(`document.querySelector('[data-start-sweep]')?.disabled === true`), 'system_sweep_locked_without_holdout');
  const holdoutYear = Number(sweep.years[0]);
  await cdp.evaluate(`(()=>{const input=document.querySelector('[data-holdout-input]');input.value=${js(String(holdoutYear))};input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await cdp.evaluate(clickExpr('[data-save-holdout]'));
  await sleep(80);
  check(await cdp.evaluate(`document.querySelector('[data-start-sweep]')?.disabled === false`), 'saved_holdout_unlocks_system_sweep');
  await cdp.evaluate(clickExpr('[data-start-sweep]'));
  check(await cdp.evaluate(hiddenExpr('[data-question-workspace]')) === false, 'system_question_workspace_executes');

  // Malformed browser-local state fails closed on an untouched Block.
  await cdp.navigate(`${BASE}/xizong/circulation/b03/`);
  const badKey = 'kianos-xizong-astro-v2:xizong:circulation-b03';
  await cdp.evaluate(`localStorage.setItem(${js(badKey)},'{malformed')`);
  await cdp.reload();
  check(await cdp.evaluate(visibleStageExpr) === 'block_learn', 'malformed_block_state_falls_back_to_clean_orientation');
  const badState = await cdp.evaluate(`(()=>{try{return JSON.parse(localStorage.getItem(${js(badKey)})||'null')}catch{return null}})()`);
  check(badState === null || badState?.completed !== true, 'malformed_state_does_not_manufacture_progress');

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.evidence_class = 'EXECUTED_HEADLESS_CHROME_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U';
  report.chrome = executable;
  report.a1 = { blocks: blockIds.length, tested_block: 'circulation-b02', question_count: sweep.questions.length, holdout_year: holdoutYear };
  fs.mkdirSync(path.resolve(process.cwd(), '.qa'), { recursive: true });
  fs.writeFileSync(path.resolve(process.cwd(), '.qa/xizong-a1-browser-runtime.json'), JSON.stringify(report, null, 2));
  console.log(`A1_BROWSER_RUNTIME_JOURNEY_PASS | checks=${report.checks.length} | questions=${sweep.questions.length} | U=NOT_TESTED`);
} catch (error) {
  report.finished_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.mkdirSync(path.resolve(process.cwd(), '.qa'), { recursive: true });
  fs.writeFileSync(path.resolve(process.cwd(), '.qa/xizong-a1-browser-runtime.json'), JSON.stringify(report, null, 2));
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
