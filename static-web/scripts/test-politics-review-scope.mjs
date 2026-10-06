// Synthetic-only regression: execute the actual clients with a minimal DOM adapter.
// No catalog builder, protected question content, real storage, or preview server.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as state from '../src/lib/politicsPracticeState.mjs';
import * as returns from '../src/lib/politicsChatReturn.mjs';
import * as analysis from '../src/lib/politicsAnalysisEvidence.mjs';
import { recordPoliticsFirstAttempt } from '../src/lib/politicsUnitReturn.mjs';

const K = state.PRACTICE_KEYS;
const day = new Date().toLocaleDateString('en-CA');
class Node {
  constructor() { this.dataset = {}; this.children = []; this.handlers = {}; this.value = 'all'; this.hidden = false; this.disabled = false; this.style = {}; this.classList = { toggle() {} }; }
  addEventListener(type, fn) { (this.handlers[type] ||= []).push(fn); }
  async fire(type) { for (const fn of this.handlers[type] || []) await fn({ currentTarget: this }); }
  append(...nodes) { this.children.push(...nodes); }
  add(node) { this.append(node); }
  replaceChildren(...nodes) { this.children = nodes; }
  remove() {} focus() {} setAttribute() {} removeAttribute() {} toggleAttribute() {}
  get childElementCount() { return this.children.length; }
}
class Root extends Node {
  constructor() { super(); this.nodes = new Map(); }
  querySelector(selector) { if (!this.nodes.has(selector)) this.nodes.set(selector, new Node()); return this.nodes.get(selector); }
  querySelectorAll(selector) {
    if (selector === '[data-review-filter]') return this.filters;
    if (selector === '[data-mode-value]' || selector === '[data-cause]' || selector === '[data-option]') return [];
    if (selector === 'button') return [...this.nodes.values()];
    return selector.split(', ').map(s => this.querySelector(s));
  }
}
class Storage {
  constructor(rows) { this.rows = new Map(Object.entries(rows)); }
  getItem(key) { return this.rows.get(key) ?? null; }
  setItem(key, value) { this.rows.set(key, String(value)); }
}
const units = [['a', 's1'], ['b', 's1'], ['c', 's2']].map(([id, subject]) => ({ key: `${subject}/c/${id}`, id, subject, chapter: 'c', title: id, href: `/politics/${subject}/c/#${id}` }));
const questions = [
  ['marked-wrong', 0, 'single', 'WRONG', true, day],
  ['unmarked-uncertain', 0, 'single', 'UNCERTAIN', false, day],
  ['marked-stable', 0, 'single', 'STABLE', true, day],
  ['marked-multiple', 1, 'multiple', 'UNCERTAIN', true, '2000-01-01'],
  ['other-subject', 2, 'single', 'WRONG', true, day]
].map(([id, unitIndex, type, outcome, discussion, studyDay], i) => {
  const u = units[unitIndex];
  return { id, subject: u.subject, subjectLabel: u.subject, chapter: u.chapter, chapterTitle: 'synthetic', unitKey: u.key, unitId: u.id, unitTitle: u.title, unitHref: u.href, number: i + 1, type, taskRevision: 'synthetic-v1', sourceId: 'synthetic', stem: 'Synthetic question', options: Array.from({ length: 4 }, (_, optionIndex) => ({ label: String.fromCharCode(65 + optionIndex), text: `Synthetic option ${optionIndex + 1}` })), outcome, discussion, studyDay };
});
const catalog = { revision: 'synthetic-v1', reviewBase: '/politics/practice-review/', questions, units, chapters: ['s1', 's2'].map(subject => ({ key: `${subject}/c`, subject, title: 'synthetic' })), subjects: ['s1', 's2'].map(id => ({ id, label: id })) };
function storage(session) {
  const attempts = { units: {} }, latestOutcome = {}, discussion = {};
  for (const q of questions) {
    (attempts.units[q.unitKey] ||= { attempts: {} }).attempts[q.id] = { question_id: q.id, outcome: q.outcome, study_day: q.studyDay };
    latestOutcome[q.id] = q.outcome; discussion[q.id] = q.discussion;
  }
  const rows = { [K.attempts]: JSON.stringify(attempts), [K.meta]: JSON.stringify({ latestOutcome, discussion }) };
  if (session) rows[K.session] = JSON.stringify(session);
  return new Storage(rows);
}
async function client(kind, search = '', saved = storage()) {
  const root = new Root();
  root.filters = ['all', 'today', 'discussion'].map(filter => { const n = new Node(); n.dataset.reviewFilter = filter; return n; });
  root.querySelector(kind === 'Review' ? '[data-review-catalog]' : '[data-politics-practice-catalog]').textContent = JSON.stringify(catalog);
  root.querySelector('[data-filter-mode]').value = 'ordered';
  root.querySelector('[data-filter-count]').value = '50';
  const location = { search, pathname: '/politics/practice/', origin: 'https://synthetic.invalid' };
  const windowHandlers = {};
  const window = { addEventListener(type, fn) { windowHandlers[type] = fn; }, setInterval() {}, confirm() { return true; } };
  const context = { ...state, ...returns, ...analysis, recordPoliticsFirstAttempt, HTMLElement: Node, Option: class extends Node { constructor(label, value) { super(); this.value = value; this.textContent = label; } }, document: { createElement() { return new Node(); }, addEventListener() {} }, localStorage: saved, location, history: { replaceState(_a, _b, href) { location.search = new URL(href, location.origin).search; } }, window, addEventListener() {}, URL, URLSearchParams, Date, crypto: { randomUUID: () => 'synthetic-session' }, setTimeout, clearTimeout, navigator: {} };
  const source = fs.readFileSync(new URL(`../src/lib/politics${kind}Client.mjs`, import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replace(/^export \{ PRACTICE_KEYS \};\n/gm, '').replace(/export\s+(async\s+)?function/g, '$1function').replaceAll('import.meta.env?.DEV', 'false');
  await vm.runInNewContext(source + `\ninitPolitics${kind}(root);`, { ...context, root });
  return { root, saved, windowHandlers };
}
function descendants(node) { return node.children.flatMap(child => [child, ...descendants(child)]); }
function ids(saved) { return JSON.parse(saved.getItem(K.session)).ids; }
const checks = [];
async function check(name, fn) { await fn(); checks.push(name); }
async function startFrom(href, expected, type) {
  const { root, saved } = await client('Practice', new URL(href, 'https://synthetic.invalid').search);
  if (type) { root.querySelector('[data-filter-type]').value = type; await root.querySelector('[data-filter-type]').fire('change'); }
  assert.equal(root.dataset.blocked, undefined);
  assert.equal(Number(root.querySelector('[data-available-count]').textContent), expected.length);
  root.querySelector('[data-learned-scope]').checked = true;
  await root.querySelector('[data-start-session]').fire('click');
  assert.deepEqual(ids(saved), expected);
}
await check('discussion global and per-unit links preserve visible W/U selection', async () => {
  const { root } = await client('Review');
  root.querySelector('[data-review-subject]').value = 's1';
  await root.filters[2].fire('click');
  assert.equal(root.querySelector('[data-review-count]').textContent.startsWith('2 '), true);
  const href = root.querySelector('[data-review-start]').href;
  assert.equal(new URL(href, 'https://synthetic.invalid').searchParams.get('reviewFilter'), 'discussion');
  assert.equal(new URL(href, 'https://synthetic.invalid').searchParams.get('reviewSubject'), 's1');
  await startFrom(href, ['marked-wrong', 'marked-multiple']);
  await startFrom(href, ['marked-multiple'], 'multiple');
  const groups = root.querySelector('[data-review-groups]').children;
  const first = groups.find(g => g.dataset.reviewUnit === units[0].key);
  const unitLink = descendants(first).find(n => n.textContent === '复习本单元 →');
  assert.equal(new URL(unitLink.href, 'https://synthetic.invalid').searchParams.get('reviewFilter'), 'discussion');
  await startFrom(unitLink.href, ['marked-wrong']);
  // A stable discussion mark stays visible, but is not converted into forced W/U.
  assert.ok(descendants(first).some(n => n.dataset.reviewQuestion === 'marked-stable'));
  assert.ok(descendants(first).some(n => n.href === '/politics/practice/?question=marked-stable'));
});
await check('all and today retain existing links and native pools', async () => {
  const { root } = await client('Review');
  await startFrom(root.querySelector('[data-review-start]').href, ['marked-wrong', 'unmarked-uncertain', 'marked-multiple', 'other-subject']);
  await root.filters[1].fire('click');
  const href = root.querySelector('[data-review-start]').href;
  assert.equal(new URL(href, 'https://synthetic.invalid').searchParams.get('reviewDay'), day);
  await startFrom(href, ['marked-wrong', 'unmarked-uncertain', 'other-subject']);
  const first = root.querySelector('[data-review-groups]').children.find(g => g.dataset.reviewUnit === units[0].key);
  await startFrom(descendants(first).find(n => n.textContent === '复习本单元 →').href, ['marked-wrong', 'unmarked-uncertain']);
});
await check('discussion membership is recomputed at start without a second queue', async () => {
  const { root, saved } = await client('Practice', '?review=problems&reviewFilter=discussion&unit=s1%2Fc%2Fa');
  const meta = JSON.parse(saved.getItem(K.meta));
  meta.discussion['marked-wrong'] = false;
  meta.discussion['unmarked-uncertain'] = true;
  saved.setItem(K.meta, JSON.stringify(meta));
  root.querySelector('[data-learned-scope]').checked = true;
  await root.querySelector('[data-start-session]').fire('click');
  assert.deepEqual(ids(saved), ['unmarked-uncertain']);
});
await check('unreadable review storage blocks start without overwriting records', async () => {
  const saved = storage(); saved.setItem(K.evidence, '{broken-synthetic');
  const before = [...saved.rows];
  const { root } = await client('Practice', '?review=problems&reviewFilter=discussion', saved);
  assert.equal(root.dataset.blocked, 'true');
  root.querySelector('[data-learned-scope]').checked = true;
  await root.querySelector('[data-start-session]').fire('click');
  assert.deepEqual([...saved.rows], before);
});
await check('exact question links still start their requested question', async () => {
  const { root, saved } = await client('Practice', '?question=marked-stable');
  root.querySelector('[data-learned-scope]').checked = true;
  await root.querySelector('[data-start-session]').fire('click');
  assert.equal(ids(saved)[0], 'marked-stable');
});
await check('active and paused sessions are not replaced by review entry', async () => {
  for (const status of ['active', 'paused']) {
    const saved = storage({ runtimeVersion: 2, id: 'existing', revision: catalog.revision, status, ids: ['marked-wrong'], index: 0 });
    const before = [...saved.rows];
    const { root } = await client('Practice', '?review=problems&reviewFilter=discussion', saved);
    assert.equal(root.dataset.blocked, 'true');
    assert.deepEqual([...saved.rows], before);
    await root.querySelector('[data-start-session]').fire('click');
    assert.deepEqual([...saved.rows], before);
  }
});
await check('stale writer cannot replace newer session', async () => {
  const { root, saved, windowHandlers } = await client('Practice', '?review=problems&reviewFilter=discussion');
  saved.setItem(K.session, JSON.stringify({ id: 'newer-session' }));
  windowHandlers.storage({ key: K.session });
  const before = [...saved.rows];
  root.querySelector('[data-learned-scope]').checked = true;
  await root.querySelector('[data-start-session]').fire('click');
  assert.deepEqual([...saved.rows], before);
  assert.match(root.querySelector('[data-practice-error]').textContent, /其他页面/);
});
console.log(JSON.stringify({ status: 'PASS', boundary: 'Synthetic actual-client VM regression; not real browser or full build', checks }, null, 2));
