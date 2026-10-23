import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Cloud-only, synthetic, actual-handler regression. The DOM transport is a
// small deterministic shim; production client, plan, timer and Packet modules
// are imported unchanged. This is not browser/layout or private-state proof.
const here = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = process.env.KIANOS_COPY_TEST_SOURCE_ROOT || path.resolve(here, '..');
const source = file => pathToFileURL(path.join(sourceRoot, 'src/lib', file)).href;
const { initExamHome } = await import(source('examOrchestratorClient.mjs'));
const plan = await import(source('examChatPlan.mjs'));
const timer = await import(source('studyTimer.mjs'));
const exam = await import(source('examOrchestrator.mjs'));
const { initStudyTimerRuntime } = await import(source('studyTimerClient.mjs'));
const RealDate = Date;
const day = '2026-10-01';
let now = RealDate.parse(day + 'T08:33:00+08:00');
globalThis.Date = class extends RealDate {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return now; }
};
class Storage {
  constructor() { this.values = new Map(); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  bytes() { return JSON.stringify([...this.values].sort(([a], [b]) => a.localeCompare(b))); }
}
class Node {
  constructor(name = '') {
    this.name = name; this.listeners = new Map(); this.nodes = new Map();
    this.children = []; this.dataset = {}; this.style = {}; this.attributes = new Map();
    this.hidden = false; this.open = false; this.textContent = ''; this.value = '';
    this.classList = { add() {}, remove() {}, toggle() {} };
  }
  addEventListener(type, fn) { const rows = this.listeners.get(type) || []; rows.push(fn); this.listeners.set(type, rows); }
  dispatchEvent(event) { for (const fn of this.listeners.get(event.type) || []) fn(event); return true; }
  async fire(type, detail = {}) { for (const fn of this.listeners.get(type) || []) await fn({ type, currentTarget: this, target: this, ...detail }); }
  querySelector(selector) { if (!this.nodes.has(selector)) this.nodes.set(selector, new Node(selector)); return this.nodes.get(selector); }
  querySelectorAll(selector) { return selector === 'dialog' ? this.dialogs || [] : []; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  remove() {}
  closest() { return null; }
  showModal() { this.open = true; }
  close() { this.open = false; }
}
globalThis.HTMLElement = Node;
globalThis.setTimeout = () => 0; // no autonomous late render obscures the dialog hold
const validPlan = (storage, suffix = 'one') => ({
  schema: plan.EXAM_CHAT_PLAN_SCHEMA, study_day: day,
  generated_at: new Date(now - 1000).toISOString(),
  learner_evidence_basis: plan.buildExamChatPlanBasis(storage, day),
  subjects: { xizong: { target_minutes: 60, role: 'synthetic mainline' } },
  next_subject: 'xizong', capacity: { state: 'UNCERTAIN', summary: 'synthetic ' + suffix },
  presentation: {
    today_tasks: [{ id: 'task', label: suffix }],
    week_reference: [{ id: 'week', label: 'synthetic week' }],
    schedule_blocks: [{ id: 'meal', start: '12:00', end: '13:00', label: suffix, meal_id: 'meal' }],
    nutrition: { owner_ref: 'synthetic:nutrition', foods: [{ id: 'food', label: suffix, unit: 'g', recommended_amount: 1 }], meals: [{ id: 'meal', label: suffix, items: [{ food_id: 'food', amount: 1 }] }] },
    training: { owner_ref: 'synthetic:training', session_id: 'training', title: suffix, mode: 'REST', exercises: [] }
  }
});
async function setup({ deferred = false, fetchFails = false, clipboardFails = false } = {}) {
  now = RealDate.parse(day + 'T08:33:00+08:00');
  const storage = new Storage();
  storage.setItem('unrelated-preservation-sentinel', 'unchanged');
  timer.resumeStudyTimer(storage, { subject: 'xizong', route: '/xizong/', detailKey: 'synthetic', detailLabel: 'synthetic' }, now);
  const first = plan.writeExamChatPlan(storage, validPlan(storage), day);
  const root = new Node('home');
  for (const [selector, value] of [
    ['[data-exam-catalog]', { base: '/' }],
    ['[data-exam-daily-politics-catalog]', null],
    ['[data-exam-politics-memory-catalog]', null]
  ]) root.querySelector(selector).textContent = JSON.stringify(value);
  root.dialogs = ['why', 'settings', 'record'].map(name => root.querySelector(`[data-exam-${name}-dialog]`));
  const doc = new Node('document');
  doc.hasFocus = () => true; doc.visibilityState = 'visible';
  doc.querySelector = selector => selector === '[data-exam-home]' ? root : null;
  doc.createElement = tag => new Node(tag);
  const win = new Node('window');
  win.localStorage = storage; win.location = { pathname: '/' };
  win.setInterval = () => 0; win.clearInterval = () => {};
  const exports = [];
  win.prompt = (_label, value) => { exports.push({ via: 'prompt', text: value }); return value; };
  globalThis.window = win; globalThis.document = doc; globalThis.localStorage = storage;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: { writeText: async text => { if (clipboardFails) throw Error('synthetic denied'); exports.push({ via: 'clipboard', text }); } } } });
  let release;
  const gate = deferred ? new Promise(resolve => { release = resolve; }) : Promise.resolve();
  globalThis.fetch = async url => {
    assert.equal(url, '/kianos-data/home-xizong.json');
    await gate;
    return { ok: !fetchFails, status: fetchFails ? 503 : 200, json: async () => ({ schema: 'kianos.home.xizong_projection.v1', xizongPacketIndex: [], xizongForecastQuestionScope: {}, xizongForecastCanonicalScope: {} }) };
  };
  initStudyTimerRuntime({ base: '/' });
  initExamHome(root);
  await Promise.resolve();
  const why = root.querySelector('[data-exam-why-dialog]');
  await root.querySelector('[data-exam-why]').fire('click');
  assert.equal(why.open, true);
  const input = root.querySelector('[data-exam-import]'); input.value = 'synthetic-uncommitted-input';
  const beforeReasons = root.querySelector('[data-exam-reasons]').children;
  const copy = async () => {
    await root.querySelector('[data-exam-copy-daily]').fire('click');
    assert.equal(why.open, true, 'explicit copy must keep the dialog open');
    assert.equal(input.value, 'synthetic-uncommitted-input', 'copy preserves pending input');
    assert.equal(root.querySelector('[data-exam-reasons]').children, beforeReasons, 'copy preserves dialog contents/navigation');
    assert.equal(storage.getItem('unrelated-preservation-sentinel'), 'unchanged');
    const output = exports.at(-1);
    return output ? JSON.parse(output.text.split('DAILY_PACKET_JSON\n')[1]) : null;
  };
  return { storage, root, first, why, copy, exports, release, win };
}
const results = [];
async function check(name, run) {
  try { await run(); results.push({ name, pass: true }); }
  catch (error) { results.push({ name, pass: false, error: error.stack }); }
}
await check('fresh explicit copy exports current ready plan and preserves input/storage', async () => {
  const f = await setup(); const before = f.storage.bytes(); const out = await f.copy();
  assert.equal(out.schedule.control.planStatus, 'ready'); assert.equal(out.schedule.control.executable, true);
  assert.deepEqual(out.learner_evidence_basis, plan.buildExamChatPlanBasis(f.storage, day));
  assert.equal(out.schedule.presentation.nutrition.foods[0].label, 'one');
  assert.equal(out.schedule.presentation.training.title, 'one');
  assert.equal(f.storage.bytes(), before);
});
await check('open why → native pause → copy exports reference, never stale execution', async () => {
  const f = await setup(); now += 60_000; f.win.KianOSStudyTimer.pause(now);
  assert.equal(f.root.__kianosExamPlanReadModel.control.planStatus, 'ready', 'dialog policy keeps cached model unchanged until explicit copy');
  assert.equal(plan.readExamChatPlan(f.storage, day).status, 'stale');
  const before = f.storage.bytes(); const out = await f.copy();
  assert.equal(out.schedule.control.planStatus, 'reference');
  assert.equal(out.schedule.control.executable, false); assert.equal(out.schedule.control.guidanceFresh, false);
  assert.equal(out.schedule.capacity.judgment, null); assert.equal(out.schedule.next, null);
  assert.equal(out.schedule.presentation.nutrition.foods[0].label, 'one');
  assert.equal(out.schedule.presentation.training.title, 'one');
  assert.deepEqual(out.learner_evidence_basis, plan.buildExamChatPlanBasis(f.storage, day));
  assert.equal(f.storage.bytes(), before);
  assert.throws(() => plan.writeExamChatPlan(f.storage, f.first, day), /CHAT_PLAN_EVIDENCE_BASIS_STALE/);
  assert.equal(f.storage.bytes(), before, 'copy does not relax stale command admission');
});
await check('new adopted plan while why is open exports current replacement presentation', async () => {
  const f = await setup(); now += 60_000; const replacement = plan.writeExamChatPlan(f.storage, validPlan(f.storage, 'two'), day);
  f.win.dispatchEvent(new Event('kianos:control-command-applied'));
  assert.equal(f.root.__kianosExamPlanReadModel.control.generatedAt, f.first.generated_at);
  const before = f.storage.bytes(); const out = await f.copy();
  assert.equal(out.schedule.control.generatedAt, replacement.generated_at); assert.equal(out.schedule.control.planStatus, 'ready');
  assert.equal(out.schedule.presentation.nutrition.foods[0].label, 'two'); assert.equal(out.schedule.presentation.training.title, 'two');
  assert.throws(() => plan.writeExamChatPlan(f.storage, f.first, day), /CHAT_PLAN_OLDER_THAN_CURRENT/);
  assert.equal(f.storage.bytes(), before, 'copy does not relax replacement generation admission');
});
await check('current profile and replacement share the exported current basis', async () => {
  const f = await setup(); now += 60_000;
  const profile = exam.emptyExamProfile(); profile.capacityByDay[day] = 120;
  f.storage.setItem(exam.EXAM_PROFILE_KEY, JSON.stringify(profile));
  const next = validPlan(f.storage, 'profile-update');
  next.subjects.xizong.session_ref = 'synthetic-new-native-session';
  plan.writeExamChatPlan(f.storage, next, day);
  f.win.dispatchEvent(new Event('kianos:control-command-applied'));
  const before = f.storage.bytes(); const out = await f.copy();
  assert.equal(out.schedule.capacity.dayMinutes, 120);
  assert.equal(out.schedule.next, null, 'new exact session binding cannot reuse an unmatched cached native Continue');
  assert.deepEqual(out.learner_evidence_basis, plan.buildExamChatPlanBasis(f.storage, day));
  assert.equal(f.storage.bytes(), before);
});
for (const [name, raw, expected] of [
  ['missing', null, 'missing'], ['invalid', '{broken', 'invalid'],
  ['basis missing', 'NO_BASIS', 'stale'], ['wrong day', 'WRONG_DAY', 'stale']
]) await check(`${name} at copy cannot resurrect cached guidance`, async () => {
  const f = await setup();
  if (raw === null) f.storage.removeItem(plan.EXAM_CHAT_PLAN_KEY);
  else f.storage.setItem(plan.EXAM_CHAT_PLAN_KEY, raw === 'NO_BASIS' ? JSON.stringify({ ...f.first, learner_evidence_basis: null }) : raw === 'WRONG_DAY' ? JSON.stringify({ ...f.first, study_day: '2026-09-30' }) : raw);
  f.win.dispatchEvent(new Event('kianos:control-command-applied'));
  const before = f.storage.bytes(); const out = await f.copy();
  assert.equal(out.schedule.control.planStatus, expected); assert.equal(out.schedule.control.executable, false);
  assert.equal(out.schedule.capacity.judgment, null); assert.equal(out.schedule.presentation, null); assert.equal(out.schedule.next, null);
  assert.equal(f.storage.bytes(), before);
});
await check('unreadable native basis preserves raw bytes and exports no executable schedule', async () => {
  const f = await setup(); f.storage.setItem(timer.STUDY_TIMER_LEDGER_KEY, '{broken');
  f.win.dispatchEvent(new Event('kianos:study-timer-change'));
  const before = f.storage.bytes(); const out = await f.copy();
  assert.equal(out.learner_evidence_basis, null); assert.equal(out.schedule, null);
  assert.ok(out.warnings.includes('CHAT_PLAN_TIMER_UNREADABLE')); assert.equal(f.storage.bytes(), before);
});
await check('change during awaited projection is reconciled after await', async () => {
  const f = await setup({ deferred: true }); const pending = f.copy();
  now += 60_000; f.win.KianOSStudyTimer.pause(now); f.release(); const out = await pending;
  assert.equal(out.schedule.control.planStatus, 'reference'); assert.equal(out.schedule.control.executable, false);
  assert.deepEqual(out.learner_evidence_basis, plan.buildExamChatPlanBasis(f.storage, day));
});
await check('projection refusal does not export cached packet or alter records/dialog', async () => {
  const f = await setup({ fetchFails: true }); const before = f.storage.bytes();
  assert.equal(await f.copy(), null); assert.equal(f.exports.length, 0); assert.equal(f.storage.bytes(), before);
  assert.match(f.root.querySelector('[data-exam-daily-status]').textContent, /HOME_XIZONG_PROJECTION_HTTP_503/);
});
await check('clipboard refusal uses existing manual fallback with fresh reference', async () => {
  const f = await setup({ clipboardFails: true }); now += 60_000; f.win.KianOSStudyTimer.pause(now);
  const out = await f.copy(); assert.equal(f.exports[0].via, 'prompt'); assert.equal(out.schedule.control.planStatus, 'reference');
});
console.log(JSON.stringify({ sourceRoot, synthetic: true, actualHandler: true, browser: false, results }, null, 2));
if (results.some(row => !row.pass)) process.exitCode = 1;
