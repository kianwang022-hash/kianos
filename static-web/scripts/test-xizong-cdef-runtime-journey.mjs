import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const PORT = Number(process.env.KIANOS_XIZONG_CDEF_PORT || 4339);
const DEBUG_PORT = Number(process.env.KIANOS_XIZONG_CDEF_DEBUG_PORT || 9249);
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });
const reportPath = path.join(auditDir, 'xizong-cdef-runtime-journey.json');
const report = {
  schema: 'kianos.xizong.cdef.runtime_journey.v1',
  evidence_class: 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U',
  started_at: new Date().toISOString(),
  checks: []
};
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_CDEF_RUNTIME_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const js = (value) => JSON.stringify(value);
async function waitForHttp(url, attempts = 120) {
  for (let i = 0; i < attempts; i += 1) {
    try { const response = await fetch(url); if (response.ok) return response; } catch {}
    await sleep(150);
  }
  throw new Error(`HTTP_NOT_READY:${url}`);
}
function chromeExecutable() {
  const candidates = [
    process.env.CHROME_BIN,
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean);
  for (const candidate of candidates) if (fs.existsSync(candidate)) return candidate;
  for (const name of ['google-chrome','google-chrome-stable','chromium','chromium-browser']) {
    const found = spawnSync('which', [name], { encoding: 'utf8' }).stdout?.trim();
    if (found) return found;
  }
  throw new Error('CHROME_EXECUTABLE_NOT_FOUND');
}
class CDP {
  constructor(url) { this.url = url; this.nextId = 1; this.pending = new Map(); }
  async connect() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const row = this.pending.get(message.id);
      if (!row) return;
      this.pending.delete(message.id);
      if (message.error) row.reject(new Error(`CDP_${row.method}:${JSON.stringify(message.error)}`));
      else row.resolve(message.result || {});
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: true, userGesture: true
    });
    if (result.exceptionDetails) throw new Error(`BROWSER_EVAL:${JSON.stringify(result.exceptionDetails)}`);
    return result.result?.value;
  }
  async navigate(url) {
    await this.send('Page.navigate', { url });
    await sleep(1100);
  }
  async reload() {
    await this.send('Page.reload', { ignoreCache: true });
    await sleep(1100);
  }
  close() { try { this.ws?.close(); } catch {} }
}
let cdp;
async function focusWriter() {
  await cdp.send('Page.bringToFront');
  for (let i = 0; i < 60; i += 1) {
    if (await cdp.evaluate(`document.documentElement.dataset.learnerWriter === 'active'`)) return;
    await sleep(80);
  }
  throw new Error('LEARNER_WRITER_NOT_ACTIVE');
}
async function clearXizong() {
  await cdp.navigate(`${BASE}/xizong/`);
  await focusWriter();
  await cdp.evaluate(`(()=>{for(const key of Object.keys(localStorage))if(key.includes('xizong'))localStorage.removeItem(key);sessionStorage.clear();return true})()`);
}
const click = async (selector) => {
  const result = await cdp.evaluate(`(()=>{const e=document.querySelector(${js(selector)});if(!e)return {ok:false};e.click();return {ok:true,disabled:Boolean(e.disabled)}})()`);
  if (!result?.ok) throw new Error(`CLICK_TARGET_MISSING:${selector}`);
  await sleep(90);
  return result;
};
const keyEnter = async () => {
  await cdp.evaluate(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))`);
  await sleep(70);
};
async function load(route) {
  await cdp.navigate(`${BASE}${route}`);
  await focusWriter();
  await sleep(120);
}
async function snap() {
  return cdp.evaluate(`(()=>{
    const root=document.querySelector('[data-xizong-v6-block]');
    const key='kianos-xizong-astro-v2:'+(root?.getAttribute('data-study-object')||'');
    let state={};try{state=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
    let scope=[];try{scope=JSON.parse(root?.dataset.sourceCompanionKpIds||'[]')}catch{}
    const visible=[...document.querySelectorAll('[data-study-stage]')].find((node)=>!node.hidden);
    return {
      stage:visible?.dataset.studyStage||state.stage||'',
      groupIndex:Number(state.groupIndex||0),
      sourceSegmentIndex:Number(state.sourceSegmentIndex||0),
      sourceTitle:document.querySelector('[data-source-stage-title]')?.textContent?.trim()||'',
      scopeIds:scope,
      learned:Object.values(state.learned||{}).filter(Boolean).length,
      ratings:Object.keys(state.ratings||{}).length,
      evidence:(state.sourceContactEvidence||[]).map((row)=>row?.segment_id||''),
      sourceDone:state.sourceContactDone===true,
      released:Object.entries(state.integrationReleasedGroups||{}).filter(([,v])=>v===true).map(([id])=>id),
      buttons:[...document.querySelectorAll('[data-group-target]')].map((button,index)=>({
        index,disabled:Boolean(button.disabled),done:button.classList.contains('done')
      }))
    };
  })()`);
}
const visibleStage = async () => (await snap()).stage;
const sourceDone = async () => { await click('[data-source-contact-done]'); return snap(); };
const beginBlock = async (route) => {
  await load(route);
  await click('[data-stage-next="logic_group"]');
  return snap();
};
async function completeRecallGroup() {
  const groupIndex = (await snap()).groupIndex;
  for (let i = 0; i < 100; i += 1) {
    const current = await snap();
    if (current.stage !== 'kp_recall' || current.groupIndex !== groupIndex) return current;
    const hasReveal = await cdp.evaluate(`Boolean(document.querySelector('[data-kp-recall-card]:not([hidden]) [data-kp-reveal]:not([hidden])'))`);
    if (hasReveal) await click('[data-kp-recall-card]:not([hidden]) [data-kp-reveal]');
    await click('[data-kp-recall-card]:not([hidden]) [data-rating="known"]');
  }
  throw new Error('RECALL_LOOP_TIMEOUT');
}
async function completeLearnGroup() {
  for (let i = 0; i < 100; i += 1) {
    if ((await snap()).stage !== 'kp_learn') return snap();
    await keyEnter();
  }
  throw new Error('LEARN_LOOP_TIMEOUT');
}
async function sr1Journey() {
  await clearXizong();
  let row = await beginBlock('/xizong/reproductive-breast/sr01/');
  check(row.stage === 'source_contact' && row.sourceTitle.includes('第 1 段'), 'sr1_starts_segment_1');
  check(row.scopeIds.length === 0, 'sr1_segment_1_has_no_fake_kp_scope');
  row = await sourceDone();
  check(row.stage === 'source_contact' && row.sourceTitle.includes('第 2 段'), 'sr1_segment_1_continues_segment_2');
  check(row.learned === 0 && row.ratings === 0, 'sr1_segment_1_does_not_mint_learning');
  await cdp.reload(); await focusWriter();
  row = await snap();
  check(row.stage === 'source_contact' && row.sourceTitle.includes('第 2 段'), 'sr1_reload_restores_segment_2');
  row = await sourceDone();
  check(row.stage === 'kp_recall' && row.groupIndex === 0 && row.learned === 10, 'sr1_segment_2_releases_exact_recall');
}
async function n4Journey() {
  await clearXizong();
  let row = await beginBlock('/xizong/neuro-sensory-motor-orthopedics/n04/');
  check(row.stage === 'source_contact' && row.scopeIds.length === 10, 'n4_segment_1_scope');
  row = await sourceDone();
  check(row.stage === 'kp_recall' && row.groupIndex === 0, 'n4_segment_1_releases_lg01');
  await completeRecallGroup(); await completeRecallGroup(); row = await completeRecallGroup();
  check(row.stage === 'source_contact' && row.sourceSegmentIndex === 1, 'n4_lg01_03_routes_segment_2');
  check(row.scopeIds.length === 6, 'n4_segment_2_scope');
  row = await sourceDone();
  check(row.stage === 'kp_recall' && row.groupIndex === 3 && row.learned === 16, 'n4_segment_2_releases_lg04');
}
async function n11Journey() {
  await clearXizong();
  let row = await beginBlock('/xizong/neuro-sensory-motor-orthopedics/n11/');
  check(row.stage === 'kp_learn' && row.evidence.length === 0, 'n11_starts_kianos_learn');
  row = await completeLearnGroup();
  check(row.stage === 'kp_recall' && row.groupIndex === 0, 'n11_learn_releases_recall');
  row = await completeRecallGroup();
  check(row.stage === 'kp_learn' && row.groupIndex === 1, 'n11_next_group_stays_kianos_learn');
  check(row.evidence.length === 0, 'n11_optional_source_does_not_mint_evidence');
}
async function f9Journey() {
  await clearXizong();
  let row = await beginBlock('/xizong/remaining-clinical/f09/');
  check(row.stage === 'kp_learn' && row.groupIndex === 0, 'f9_starts_integration_lg01');
  await completeLearnGroup(); row = await completeRecallGroup();
  check(row.stage === 'source_contact' && row.sourceSegmentIndex === 0, 'f9_lg01_routes_source_1');
  check(row.scopeIds.length === 1, 'f9_source_1_scope');
  row = await sourceDone();
  check(row.stage === 'kp_recall' && row.groupIndex === 1 && row.evidence.includes('F9-SU1'), 'f9_source_1_releases_lg02');
  await cdp.reload(); await focusWriter();
  row = await snap();
  check(row.stage === 'kp_recall' && row.groupIndex === 1, 'f9_reload_restores_lg02');
  row = await completeRecallGroup();
  check(row.stage === 'source_contact' && row.sourceSegmentIndex === 1, 'f9_lg02_routes_source_2');
  row = await sourceDone();
  check(row.stage === 'kp_recall' && row.groupIndex === 2, 'f9_source_2_releases_lg03');
  check(row.sourceDone && row.evidence.includes('F9-SU2'), 'f9_required_source_closes_after_source_2');
}
async function o5Journey() {
  await clearXizong();
  await beginBlock('/xizong/neuro-sensory-motor-orthopedics/o05/');
  await sourceDone(); await completeRecallGroup(); await completeRecallGroup();
  check((await snap()).sourceSegmentIndex === 1, 'o5_routes_source_2');
  await sourceDone(); await completeRecallGroup();
  check((await snap()).sourceSegmentIndex === 2, 'o5_routes_source_3');
  let row = await sourceDone();
  check(row.stage === 'kp_recall' && row.groupIndex === 3 && row.learned === 13, 'o5_source_3_releases_lg04_only');
  check(row.buttons[4]?.disabled === true, 'o5_lg05_locked_before_lg04_closure');
  row = await completeRecallGroup();
  check(row.stage === 'kp_learn' && row.groupIndex === 4, 'o5_lg04_closure_releases_lg05_learn');
  check(row.released.includes('O5-LG05') && row.learned === 13, 'o5_release_does_not_mint_learning');
  await cdp.reload(); await focusWriter();
  row = await snap();
  check(row.stage === 'kp_learn' && row.groupIndex === 4, 'o5_reload_preserves_lg05_learn');
  row = await completeLearnGroup();
  check(row.stage === 'kp_recall' && row.learned === 15, 'o5_lg05_learned_only_after_kianos_learn');
}
async function o4Journey() {
  await clearXizong();
  await beginBlock('/xizong/neuro-sensory-motor-orthopedics/o04/');
  await sourceDone(); await completeRecallGroup(); await completeRecallGroup();
  let row = await completeRecallGroup();
  check(row.stage === 'source_contact' && row.sourceSegmentIndex === 1, 'o4_lg01_03_routes_source_2');
  const ratingsBefore = row.ratings;
  row = await sourceDone();
  check(row.stage === 'kp_recall' && row.groupIndex === 3, 'o4_reactivate_does_not_route_back_lg01');
  check(row.ratings === ratingsBefore && row.released.length === 0, 'o4_reactivate_does_not_rewrite_progress');
  check(row.learned === 18, 'o4_source_2_forms_direct_kps_only');
}
async function f1Journey() {
  await clearXizong();
  let row = await beginBlock('/xizong/remaining-clinical/f01/');
  check(row.stage === 'source_contact' && row.sourceTitle.includes('第 1 段'), 'f1_starts_segment_1');
  row = await sourceDone();
  check(row.stage === 'kp_recall' && row.groupIndex === 0, 'f1_segment_1_releases_lg01');
  await completeRecallGroup(); row = await completeRecallGroup();
  check(row.stage === 'source_contact' && row.sourceSegmentIndex === 1, 'f1_lg01_02_routes_segment_2');
}
async function cH1Regression() {
  await clearXizong();
  let row = await beginBlock('/xizong/hematology-immunity-infection/h01/');
  check(row.stage === 'source_contact', 'c_h1_existing_source_flow_starts_source');
  row = await sourceDone();
  check(row.stage === 'kp_recall' && row.sourceDone && row.learned > 0, 'c_h1_existing_source_flow_reaches_recall');
}
async function n1Regression() {
  await clearXizong();
  let row = await beginBlock('/xizong/neuro-sensory-motor-orthopedics/n01/');
  check(row.stage === 'source_contact', 'n1_whole_block_starts_source');
  row = await sourceDone();
  check(row.stage === 'kp_recall' && row.sourceDone, 'n1_whole_block_reaches_recall');
}
const server = spawn('npm', ['run','candidate:serve'], {
  cwd: process.cwd(),
  stdio: ['ignore','pipe','pipe'],
  detached: process.platform !== 'win32',
  env: {
    ...process.env,
    KIANOS_CANDIDATE_PORT: String(PORT)
  }
});
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-xizong-cdef-'));
let chrome;
try {
  await waitForHttp(`${BASE}/xizong/`);
  chrome = spawn(chromeExecutable(), [
    '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    `--window-size=1536,960`,
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank'
  ], { stdio: ['ignore','ignore','pipe'] });
  await waitForHttp(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
  const targets = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
  const pageTarget = targets.find((row) => row.type === 'page');
  check(Boolean(pageTarget?.webSocketDebuggerUrl), 'chrome_page_target_available');
  cdp = new CDP(pageTarget.webSocketDebuggerUrl);
  await cdp.connect(); await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  await cH1Regression();
  await n1Regression();
  await n4Journey();
  await n11Journey();
  await sr1Journey();
  await f1Journey();
  await f9Journey();
  await o5Journey();
  await o4Journey();

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.boundary = 'Executed browser engineering proof only; no real learner U/mastery claim.';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`XIZONG_CDEF_RUNTIME_JOURNEY_PASS | checks=${report.checks.length}`);
} catch (error) {
  report.finished_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  cdp?.close();
  try { chrome?.kill('SIGTERM'); } catch {}
  if (process.platform !== 'win32' && server.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  } else {
    try { server.kill('SIGTERM'); } catch {}
  }
  server.stdout?.destroy(); server.stderr?.destroy();
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGKILL'); } catch {}
    } else {
      try { server.kill('SIGKILL'); } catch {}
    }
  }
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
}
