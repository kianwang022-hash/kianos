import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import * as session from '../src/lib/englishSessionControl.mjs';
import { saveEnglishAttempt } from '../src/lib/englishLearnerEvidence.mjs';
import { studyDayAt } from '../src/lib/studyTimer.mjs';

// Synthetic memory only. Execute the complete mounted component script, with
// native instruction/evidence/binding owners and inert DOM/network boundaries.
const component = fs.readFileSync(new URL('../src/components/EnglishSessionControl.astro', import.meta.url), 'utf8');
const home = fs.readFileSync(new URL('../src/pages/english.astro', import.meta.url), 'utf8');
assert.match(home, /<EnglishSessionControl\s*\/>/);
const scripts = [...component.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1);
const script = scripts[0][1].replace(/^[ \t]*import[\s\S]*?\bfrom\s+(['"])[^'"]+\1;[ \t]*$/gm, '');
assert.doesNotMatch(script, /^\s*import\s/m);

class Storage {
  constructor(rows = {}) { this.rows = new Map(Object.entries(rows)); this.writes = 0; }
  get length() { return this.rows.size; }
  key(index) { return [...this.rows.keys()][index] ?? null; }
  getItem(key) { return this.rows.get(key) ?? null; }
  setItem(key, value) { this.rows.set(key, String(value)); this.writes += 1; }
  removeItem(key) { this.rows.delete(key); this.writes += 1; }
}

const NativeDate = globalThis.Date;
let now = NativeDate.parse('2026-10-01T04:00:00Z');
let day = '2026-10-01';
const meta = {
  task: 'cloze', object_id: 'session-day-fixture', source_hash: 'session-day-source-v1',
  snapshot: { questions: [{ id: 'synthetic-q1' }] }
};
const catalog = [{ task: meta.task, object_id: meta.object_id, source_hash: meta.source_hash }];
const instruction = (overrides = {}) => ({
  schema: session.ENGLISH_SESSION_SCHEMA,
  session_id: 'session-day-synthetic', study_day: day,
  generated_at: new NativeDate(now - 1000).toISOString(), current_step: 0,
  steps: [{
    ...catalog[0], label: 'Synthetic day-boundary task',
    params: {
      time_budget_seconds: 120,
      assistance_context: {
        state: 'assisted', basis: 'chat_context', note: 'Synthetic prior teaching',
        observed_at: new NativeDate(now - 2000).toISOString()
      }
    }
  }],
  ...overrides
});

async function withClock(timeZone, run, instant = '2026-10-01T04:00:00Z') {
  now = NativeDate.parse(instant);
  day = studyDayAt(now);
  const priorTZ = process.env.TZ;
  class Clock extends NativeDate {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  process.env.TZ = timeZone;
  globalThis.Date = Clock;
  try { return await run(); }
  finally {
    globalThis.Date = NativeDate;
    if (priorTZ === undefined) delete process.env.TZ;
    else process.env.TZ = priorTZ;
  }
}

async function mount(storage) {
  class Element {
    constructor() {
      this.hidden = false; this.textContent = ''; this.listeners = new Map(); this.classes = new Set();
      this.classList = { toggle: (name, on) => on ? this.classes.add(name) : this.classes.delete(name) };
    }
    addEventListener(type, listener) { this.listeners.set(type, listener); }
  }
  class Details extends Element {}
  class Textarea extends Element { value = ''; focus() {} }
  const root = new Details();
  const nodes = Object.fromEntries([
    'status', 'import', 'copy-evidence', 'toggle-import', 'cancel-session', 'apply-session', 'clear-session'
  ].map(name => [name, new Element()]));
  nodes.input = new Textarea();
  nodes.import.hidden = true;
  const selectors = {
    '[data-english-session-status]': nodes.status,
    '[data-english-session-import]': nodes.import,
    '[data-english-session-input]': nodes.input,
    ...Object.fromEntries(['copy-evidence', 'toggle-import', 'cancel-session', 'apply-session', 'clear-session']
      .map(name => [`[data-english-${name}]`, nodes[name]]))
  };
  root.querySelector = selector => selectors[selector] ?? null;
  const events = [], copies = [], requests = [], windowListeners = new Map();
  let boot;
  const context = {
    ...session,
    // Do not make a missing production import accidentally pass in this VM.
    ...(/import\s*\{\s*studyDayAt\s*\}\s*from\s*['"]\.\.\/lib\/studyTimer\.mjs['"]/.test(component) ? { studyDayAt } : {}),
    Date: globalThis.Date, localStorage: storage,
    HTMLElement: Element, HTMLDetailsElement: Details, HTMLTextAreaElement: Textarea,
    learnerWriterReady: { then(callback) { boot = Promise.resolve().then(callback); return boot; } },
    CustomEvent: class { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } },
    document: { querySelector: selector => selector === '[data-english-session-control]'
      ? root : selector === '[data-english-session-catalog]' ? { textContent: JSON.stringify(catalog) } : null },
    navigator: { clipboard: { writeText: async text => { copies.push(text); } } },
    fetch: async url => {
      assert(['/__kianos-private/external-reading/catalog', '/__kianos-private/english-generated/catalog'].includes(url));
      requests.push(url);
      return { ok: false };
    },
    window: {
      addEventListener: (type, listener) => windowListeners.set(type, listener),
      dispatchEvent: event => { events.push(event); }
    }
  };
  vm.runInNewContext(script, context, { filename: 'EnglishSessionControl.astro:actual-script' });
  await boot;
  return {
    nodes, events, copies, requests, windowListeners,
    click: async name => {
      const listener = nodes[name]?.listeners.get('click');
      assert.equal(typeof listener, 'function', `Mounted ${name} handler`);
      await listener();
    }
  };
}

for (const [timeZone, localDay] of [['America/Los_Angeles', '2026-09-30'], ['Asia/Shanghai', day]]) {
  test(`${timeZone}: actual manual copy exports the canonical study day without writes`, async () => withClock(timeZone, async () => {
    assert.equal(new Date().toLocaleDateString('en-CA'), localDay, 'Counterexample/control device day');
    assert.equal(studyDayAt(Date.now()), day);
    const storage = new Storage(), harness = await mount(storage);
    await harness.click('copy-evidence');
    assert.equal(harness.copies.length, 1);
    const text = harness.copies[0];
    const shape = JSON.parse(text.split('\nRETURN_SHAPE\n')[1].split('\n\nEVIDENCE_JSON\n')[0]);
    const evidence = JSON.parse(text.split('\nEVIDENCE_JSON\n')[1]);
    assert.equal(shape.study_day, day, 'Chat return shape shares Resume day');
    assert.equal(evidence.study_day, day, 'Copied evidence shares Resume day');
    assert.equal(storage.writes, 0);
    assert.equal(storage.length, 0);
  }));

  test(`${timeZone}: actual import -> native Resume selection -> first binding preserves instruction context`, async () => withClock(timeZone, async () => {
    const storage = new Storage(), harness = await mount(storage);
    harness.nodes.input.value = JSON.stringify(instruction());
    harness.nodes.import.hidden = false;
    await harness.click('apply-session');
    assert.equal(harness.nodes.status.textContent, '学习安排已导入。');
    assert.equal(harness.nodes.input.value, '');
    assert.equal(harness.nodes.import.hidden, true);
    const saved = JSON.parse(storage.getItem(session.ENGLISH_SESSION_KEY));
    assert.equal(saved.study_day, day);
    const state = session.readEnglishSessionInstruction(storage, studyDayAt(now), { catalog });
    assert.equal(state.status, 'ready');
    const selected = session.resolveEnglishSessionStep(storage, state.instruction, catalog);
    assert.equal(session.englishSessionStepHref(selected.step), '/cloze/session-day-fixture/');
    assert.equal(harness.events.at(-1).type, 'kianos:english-session-updated');
    assert.equal(harness.events.at(-1).detail.session_id, saved.session_id);
    const attempt = { submitted: false, answers: {}, results: {} };
    saveEnglishAttempt(storage, 'kianos-cloze-attempt-v1:' + meta.object_id, attempt, meta, { now });
    assert.equal(attempt.binding.time_budget_seconds, 120);
    assert.equal(attempt.binding.assistance, 'assisted');
    assert.equal(attempt.binding.assistance_context.note, 'Synthetic prior teaching');
    assert.equal(attempt.binding.object_id, meta.object_id);
    assert.equal(attempt.binding.source_hash, meta.source_hash);
    assert.equal(attempt.firstEvidenceMeta, undefined, 'Opening is not first-performance completion');
  }));

  test(`${timeZone}: actual initial/focus/storage status accepts a canonical current instruction without writes`, async () => withClock(timeZone, async () => {
    const raw = JSON.stringify(instruction());
    const storage = new Storage({ [session.ENGLISH_SESSION_KEY]: raw });
    const harness = await mount(storage);
    const assertReady = () => {
      assert.match(harness.nodes.status.textContent, /^已载入 · Synthetic day-boundary task · 1\/1$/);
      assert.equal(harness.nodes.status.classes.has('isBad'), false);
    };
    assertReady();
    harness.windowListeners.get('focus')(); assertReady();
    harness.windowListeners.get('storage')({ key: session.ENGLISH_SESSION_KEY }); assertReady();
    assert.equal(storage.getItem(session.ENGLISH_SESSION_KEY), raw);
    assert.equal(storage.writes, 0);
  }));
}

test('actual manual import rejects yesterday even when it is still the device-local day', async () => withClock('America/Los_Angeles', async () => {
  const storage = new Storage(), harness = await mount(storage);
  harness.nodes.input.value = JSON.stringify(instruction({ study_day: '2026-09-30' }));
  await harness.click('apply-session');
  assert.equal(harness.nodes.status.classes.has('isBad'), true);
  assert.equal(storage.getItem(session.ENGLISH_SESSION_KEY), null);
  assert.equal(storage.writes, 0);
  assert.equal(harness.events.length, 0);
}));

test('actual manual import retains native source rejection without changing existing bytes', async () => withClock('America/Los_Angeles', async () => {
  const raw = JSON.stringify(instruction());
  const storage = new Storage({ [session.ENGLISH_SESSION_KEY]: raw }), harness = await mount(storage);
  harness.nodes.input.value = JSON.stringify(instruction({ steps: [{ ...catalog[0], source_hash: 'wrong-source' }] }));
  await harness.click('apply-session');
  assert.equal(harness.nodes.status.classes.has('isBad'), true);
  assert.match(harness.nodes.status.textContent, /ENGLISH_SESSION_SOURCE_REVISION_MISMATCH/);
  assert.equal(storage.getItem(session.ENGLISH_SESSION_KEY), raw);
  assert.equal(storage.writes, 0);
  assert.equal(harness.events.length, 0);
}));

// Use the actual full-paper Chat-plan reader, not a duplicate date policy.
const examPage = fs.readFileSync(new URL('../src/pages/english-exam/[id].astro', import.meta.url), 'utf8');
const examDayAdapter = examPage.match(/const localDay = .*?;/)?.[0];
const examPlanReader = examPage.match(/const readExamPlanFromChat = \(\) => \{[\s\S]*?\n    \};/)?.[0];
assert(examDayAdapter && examPlanReader);
function readPaperPlan(storage, paper) {
  return vm.runInNewContext(`${examDayAdapter}\n${examPlanReader}\nreadExamPlanFromChat();`, {
    ...session,
    ...(/import\s*\{\s*studyDayAt\s*\}\s*from\s*['"]\.\.\/\.\.\/lib\/studyTimer\.mjs['"]/.test(examPage) ? {studyDayAt} : {}),
    Date: globalThis.Date, localStorage: storage, paper, paperId: paper.paper_id
  });
}

for (const timeZone of ['UTC', 'America/Los_Angeles', 'Asia/Shanghai']) {
  for (const instant of ['2026-10-02T15:59:00Z', '2026-10-02T16:01:00Z']) {
    test(`${timeZone} ${instant}: manual copy/import, Resume and full-paper share the study day`, async () => withClock(timeZone, async () => {
      const expected = instant.includes('15:59') ? '2026-10-02' : '2026-10-03';
      assert.equal(day, expected);
      const storage = new Storage(), harness = await mount(storage);
      await harness.click('copy-evidence');
      const evidence = JSON.parse(harness.copies[0].split('\nEVIDENCE_JSON\n')[1]);
      assert.equal(evidence.study_day, expected);
      harness.nodes.input.value = JSON.stringify(instruction());
      await harness.click('apply-session');
      assert.equal(harness.nodes.status.textContent, '学习安排已导入。');
      assert.equal(session.readEnglishSessionInstruction(storage, expected, {catalog}).status, 'ready');
      harness.windowListeners.get('focus')();
      assert.match(harness.nodes.status.textContent, /^已载入/);
      const paper = {paper_id:'synthetic-paper',source_hash:'synthetic-paper-source'};
      const paperInstruction = instruction({steps:[{task:'full_paper',object_id:paper.paper_id,source_hash:paper.source_hash,params:{task_order:['writing','translation','cloze','reading_a','reading_b']}}]});
      storage.setItem(session.ENGLISH_SESSION_KEY, JSON.stringify(paperInstruction));
      const before = storage.getItem(session.ENGLISH_SESSION_KEY), writes = storage.writes;
      const plan = readPaperPlan(storage,paper);
      assert(plan, 'current study-day instruction supplies the full-paper Chat plan');
      assert.deepEqual(JSON.parse(JSON.stringify(plan)).taskOrder, paperInstruction.steps[0].params.task_order);
      assert.equal(storage.writes,writes);assert.equal(storage.getItem(session.ENGLISH_SESSION_KEY),before);
      assert.throws(()=>readPaperPlan(storage,{...paper,source_hash:'wrong-source'}),/ENGLISH_EXAM_INSTRUCTION_SOURCE_CHANGED/);
      const yesterday = new NativeDate(NativeDate.parse(expected+'T00:00:00Z')-86400000).toISOString().slice(0,10);
      storage.setItem(session.ENGLISH_SESSION_KEY,JSON.stringify({...paperInstruction,study_day:yesterday}));
      assert.equal(readPaperPlan(storage,paper),null,'stale instruction must not supply an exam plan');
    }, instant));
  }
}
