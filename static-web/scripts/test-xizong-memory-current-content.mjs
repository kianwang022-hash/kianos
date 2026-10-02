// Synthetic real-workspace consumer proof. No learner profile or deployed server.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { marked } from 'marked';
import { projectKpCore } from '../src/lib/xizongProjection.mjs';
import { commitLearnerStorageChanges } from '../src/lib/browserLearnerWriter.mjs';
import * as memory from '../src/lib/xizongMemoryModel.mjs';
import { buildXizongMemoryReleaseDescriptorFromLearnerObject as descriptor } from '../src/lib/xizongMemoryRelease.mjs';
import { refreshReleasedXizongMemoryBlock as refresh } from '../src/lib/xizongMemoryCurrentContent.mjs';

const root = new URL('../', import.meta.url);
const source = fs.readFileSync(process.env.MEMORY_WORKSPACE_SOURCE || new URL('src/components/XizongMemoryWorkspace.astro', root), 'utf8');
const script = source.split('<script>')[1].split('</script>')[0].replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];\s*/g, '');
const markup = source.split('---')[2].split('<script>')[0]
  .replace('data-memory-content-base={`${base}xizong/memory/data/`}', 'data-memory-content-base="/xizong/memory/data/"')
  .replace('href={`${base}xizong/`}', 'href="/xizong/"');
const at = '2026-10-01T00:00:00.000Z';
function learner(id, revision = 'old', prompt = 'Canonical old prompt') {
  const kpId = `${id}-kp`, group = `${id}-group`;
  return {
    schema: 'kianos.xizong.learner_object.v1', objectType: 'BLOCK', sourceHash: `${revision}:${prompt}`,
    identity: { blockId: id, systemId: 'synthetic', canonicalId: 'S', blockLabel: id, title: id },
    revisionWitness: { schema: 'kianos.xizong.content-revision-witness.v1', kps: { [kpId]: revision }, groups: { [group]: revision } },
    kps: [{ identity: { kpId, logicGroupId: group, displayId: 'KP', title: id }, prompt: { canonical: prompt },
      core: { markdown: `${revision} canonical Core`, html: `<p>${revision} canonical Core</p>` },
      precision: [{ id: `${id}-precision`, kind: 'PRECISION', cue: `${revision} precision cue`, answerHtml: `<p>${revision} exact answer</p>` }] }],
    logicGroups: [{ identity: { logicGroupId: group, label: group }, kpIds: [kpId], precision: [] }]
  };
}
function seed(ids = ['block-a']) {
  let state = memory.createXizongMemoryState();
  for (const id of ids) state = memory.releaseBlockMemory(state, descriptor(learner(id)), at);
  state = memory.appendMemoryEvidence(state, { cardId: 'core:block-a-kp', rating: 'mastered', origin: 'CORE_MEMORY_RECALL' }, at);
  state = memory.setPersonalPrompt(state, 'block-a-kp', 'Private prompt');
  state = memory.addMarkedFragment(state, { id: 'mark-a', cardId: 'core:block-a-kp', kpId: 'block-a-kp', surface: 'CORE', text: 'old private fragment' }, at);
  return memory.setRepairTasks(state, [{ id: 'repair-a', cardId: 'core:block-a-kp', title: 'Synthetic repair', status: 'ACTIVE', createdAt: at }]);
}
const checks = [];
function check(name, fn) { fn(); checks.push(name); }
const before = seed();
const current = descriptor(learner('block-a', 'new', 'Canonical current prompt'));
const updated = refresh(before, 'block-a', { ...current, attentionSignals: [{ cardId: 'core:block-a-kp', reviewRequested: true }] }, '2026-10-01T01:00:00Z');
check('stable-ID refresh preserves private facts and prior evidence', () => {
  for (const key of ['evidence', 'promptOverrides', 'marks', 'repairTasks', 'attention']) assert.deepEqual(updated[key], before[key]);
  assert.deepEqual(Object.keys(updated.cards), Object.keys(before.cards));
  assert.equal(updated.cards['core:block-a-kp'].releasedAt, at);
  assert.equal(updated.releasedBlocks['block-a'].releasedAt, at);
  assert.equal(updated.cards['core:block-a-kp'].revisionReview, 'LOCAL_SEMANTIC_CHANGE');
  assert.equal(updated.cards['core:block-a-kp'].contentHistory[0].coreHtml, '<p>old canonical Core</p>');
});
check('same revision is idempotent', () => assert.deepEqual(refresh(updated, 'block-a', current), updated));
check('Prompt-only compatible edit has no semantic debt', () => {
  const next = refresh(before, 'block-a', descriptor(learner('block-a', 'old', 'Current prompt only')), at);
  assert.equal(next.cards['core:block-a-kp'].promptCanonical, 'Current prompt only');
  assert.equal(next.cards['core:block-a-kp'].revisionReview, null);
  assert.equal(next.cards['core:block-a-kp'].contentChangedAt, null);
  assert.deepEqual(next.evidence, before.evidence);
});
check('unreleased sibling never enters library', () => assert.deepEqual(refresh(before, 'unreleased', descriptor(learner('unreleased'))), before));
check('missing and invalid descriptors fail without mutation', () => {
  for (const bad of [null, {}, { ...current, blockId: 'other' }, { ...current, coreCards: [] }, { ...current, revisionWitness: null }]) assert.throws(() => refresh(before, 'block-a', bad));
  assert.deepEqual(before, seed());
});

// Execute the actual static endpoint with fixture owner I/O. Markdown projection,
// descriptor builder, route generation and JSON response remain production code.
const endpoint = fs.readFileSync(new URL('src/pages/xizong/memory/data/[blockId].json.js', root), 'utf8')
  .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];\s*/g, '').replaceAll('export function', 'function');
const catalog = [{ systemId: 'synthetic-system', blocks: [{ blockId: 'block-a', slug: 'route-a' }] }];
const endpointScope = { marked, projectKpCore, Response,
  listProjectableXizongSystems: () => catalog,
  loadXizongBlock: (systemId, slug) => { assert.equal(systemId, 'synthetic-system'); assert.equal(slug, 'route-a'); return { fixture: true }; },
  resolveXizongLearnerProjection: (block, options) => {
    assert.equal(block.fixture, true);
    const result = options.enrichBlock({ kpRecords: [{ detailMarkdown: '**Current Core**' }] });
    const resolved = learner('block-a', 'new'); resolved.kps[0].core.html = result.kpRecords[0].detailHtml;
    return { learnerObject: resolved };
  }, buildXizongMemoryReleaseDescriptorFromLearnerObject: descriptor };
vm.runInNewContext(endpoint + ';globalThis.endpointApi = {getStaticPaths, GET};', endpointScope);
const paths = endpointScope.endpointApi.getStaticPaths();
assert.equal(paths[0].params.blockId, 'block-a');
const response = endpointScope.endpointApi.GET({ props: paths[0].props });
assert.match(response.headers.get('Content-Type'), /application\/json/);
const endpointPayload = await response.json();
assert.equal(endpointPayload.blockId, 'block-a'); assert.match(endpointPayload.coreCards[0].coreHtml, /<strong>Current Core<\/strong>/);
assert.deepEqual(endpointPayload.attentionSignals, []);
checks.push('actual endpoint routes by stable Block ID and serializes resolved Current descriptor');

class Element {
  constructor(tag = 'div') { this.tag = tag; this.attrs = {}; this.dataset = {}; this.children = []; this.handlers = {}; this.hidden = false; this.textContent = ''; this.innerHTML = ''; this.classList = { toggle() {} }; }
  getAttribute(name) { return this.attrs[name] ?? null; }
  setAttribute(name, value) { this.attrs[name] = value; }
  addEventListener(type, fn) { (this.handlers[type] ||= []).push(fn); }
  emit(type, event = {}) { for (const fn of this.handlers[type] || []) fn({ target: this, ...event }); }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = [...nodes]; }
  before() {}
}
class Input extends Element {}
class TextArea extends Element {}
class Anchor extends Element {}
class Storage {
  constructor(state) { this.data = new Map([[memory.XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(state)]]); this.writes = []; this.failWrites = false; }
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) { if (this.failWrites) throw new Error('synthetic storage write failure'); this.data.set(key, value); this.writes.push(key); }
}
const tick = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
async function boot(initial, payloads) {
  const nodes = [];
  for (const match of markup.matchAll(/<(\w+)([^>]*?)>/g)) {
    const tag = match[1], attrs = match[2];
    if (!attrs.includes('data-') && !attrs.includes('xzMemoryWeakFilter')) continue;
    const C = tag === 'input' ? Input : tag === 'textarea' ? TextArea : tag === 'a' ? Anchor : Element;
    const node = new C(tag);
    for (const a of attrs.matchAll(/(data-[\w-]+)(?:="([^"]*)")?/g)) node.attrs[a[1]] = a[2] || '';
    node.hidden = /\bhidden\b/.test(attrs); node.attrs.class = attrs.match(/class="([^"]*)"/)?.[1] || '';
    nodes.push(node);
  }
  const matches = (node, selector) => {
    if (selector.startsWith('.')) return node.attrs.class.split(' ').includes(selector.slice(1));
    const m = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    return m && m[1] in node.attrs && (m[2] === undefined || node.attrs[m[1]] === m[2]);
  };
  const all = selector => selector === '[data-memory-queue] > button' ? find('[data-memory-queue]').children : nodes.filter(n => matches(n, selector));
  const find = selector => all(selector)[0] || null;
  const rootNode = find('[data-xizong-memory-workspace]');
  rootNode.querySelector = find; rootNode.querySelectorAll = all;
  const document = { querySelector: find, createElement: tag => new Element(tag) };
  const events = {}, errors = [], requests = [];
  const window = { location: { search: '' }, addEventListener: (type, fn) => { events[type] = fn; }, dispatchEvent() {} };
  const storage = new Storage(initial);
  let allowWriter;
  const ready = new Promise(resolve => { allowWriter = resolve; });
  const fetch = async url => {
    const id = decodeURIComponent(url.split('/').pop().replace(/\.json$/, '')); requests.push(id);
    const data = typeof payloads[id] === 'function' ? await payloads[id]() : payloads[id];
    return { ok: data !== undefined, json: async () => data };
  };
  const sandbox = { ...memory, commitLearnerStorageChanges, refreshReleasedXizongMemoryBlock: refresh, document, window, localStorage: storage,
    HTMLElement: Element, Element, HTMLInputElement: Input, HTMLTextAreaElement: TextArea, HTMLAnchorElement: Anchor,
    learnerWriterReady: ready, fetch, URLSearchParams, AbortSignal, console: { error: e => errors.push(e.message) },
    XIZONG_SESSION_KEY: 'synthetic-session', resolveXizongSessionNext: () => null, validateXizongSessionInstruction: () => null,
    studyDayAt: () => '2026-10-01', CustomEvent: class {} };
  vm.runInNewContext(script, sandbox);
  return { storage, requests, errors, find, all, events, allowWriter, click: s => { assert(find(s), `node ${s}`); find(s).emit('click'); }, state: () => JSON.parse(storage.getItem(memory.XIZONG_MEMORY_STORAGE_KEY)), flush: tick };
}
const page = await boot(before, { 'block-a': current, unreleased: descriptor(learner('unreleased')) });
assert.equal(page.requests.length, 0); assert.deepEqual(page.state(), before);
checks.push('native writer readiness gates fetch and mutation');
page.allowWriter(); await page.flush(); page.click('[data-memory-view="CORE"]');
assert.match(page.find('[data-memory-answer]').innerHTML, /new canonical Core/);
assert.equal(page.find('[data-memory-prompt]').textContent, 'Private prompt');
assert.deepEqual(page.requests, ['block-a']);
for (const key of ['evidence', 'promptOverrides', 'marks', 'repairTasks', 'attention']) assert.deepEqual(page.state()[key], before[key]);
checks.push('direct workspace startup displays Current Core and preserves private facts');
page.click('[data-memory-view="PRECISION"]');
assert.match(page.find('[data-memory-answer]').innerHTML, /new exact answer/);
checks.push('direct workspace startup displays Current Precision');
const actual = page.state();
const again = await boot(actual, { 'block-a': current }); again.allowWriter(); await again.flush();
assert.deepEqual(again.state(), actual); assert.equal(again.storage.writes.length, 0);
checks.push('repeated workspace startup is idempotent without writes');

const two = seed(['block-a', 'block-b']);
let releaseB; const waiting = new Promise(resolve => { releaseB = resolve; });
const progressive = await boot(two, { 'block-a': current, 'block-b': () => waiting });
progressive.allowWriter(); await progressive.flush(); progressive.click('[data-memory-view="CORE"]');
assert.equal(progressive.find('[data-memory-queue]').children.length, 1);
assert.match(progressive.find('[data-memory-answer]').innerHTML, /new canonical Core/);
checks.push('first current Block usable while sibling remains pending');
progressive.click('[data-memory-reveal]'); progressive.click('[data-memory-rating="known"]');
const during = memory.addMarkedFragment(progressive.state(), { id: 'during-load', cardId: 'core:block-a-kp', kpId: 'block-a-kp', surface: 'CORE', text: 'mark during load' }, at);
progressive.storage.setItem(memory.XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(during));
assert.equal(during.evidence.length, before.evidence.length + 1);
releaseB(descriptor(learner('block-b', 'new'))); await progressive.flush();
assert.deepEqual(progressive.state().evidence, during.evidence);
assert.deepEqual(progressive.state().marks, during.marks);
checks.push('later asynchronous refresh preserves intervening rating and mark');

for (const [name, bad] of [['absent', undefined], ['invalid', { ...current, blockId: 'wrong' }]]) {
  const blocked = await boot(two, { 'block-a': bad, 'block-b': descriptor(learner('block-b', 'new')) });
  blocked.allowWriter(); await blocked.flush(); blocked.click('[data-memory-view="CORE"]');
  assert.match(blocked.find('[data-memory-content-status]').textContent, /暂不可用/);
  assert.equal(blocked.find('[data-memory-queue]').children.length, 1);
  assert.deepEqual(blocked.state().cards['core:block-a-kp'], two.cards['core:block-a-kp']);
  assert.match(blocked.find('[data-memory-card-title]').textContent, /block-b/);
  checks.push(`${name} descriptor blocks only affected cards and preserves their storage`);
}
const noWrite = await boot(before, { 'block-a': current }); noWrite.storage.failWrites = true;
noWrite.allowWriter(); await noWrite.flush(); noWrite.click('[data-memory-view="CORE"]');
assert.equal(noWrite.find('[data-memory-queue]').children.length, 0); assert.deepEqual(noWrite.state(), before);
checks.push('refresh storage failure cannot expose unpersisted current cards or rating');
const badOnly = await boot(before, {}); badOnly.allowWriter(); await badOnly.flush();
badOnly.click('[data-memory-rating="known"]'); assert.deepEqual(badOnly.state(), before);
checks.push('missing owner cannot append stale rating');
const retry = await boot(before, {}); retry.allowWriter(); await retry.flush();
const retrySuccess = await boot(retry.state(), { 'block-a': current }); retrySuccess.allowWriter(); await retrySuccess.flush(); retrySuccess.click('[data-memory-view="CORE"]');
assert.match(retrySuccess.find('[data-memory-answer]').innerHTML, /new canonical Core/);
checks.push('later entry retries previously unavailable owner successfully');
const oldGeneration = await boot(before, { 'block-a': current }); oldGeneration.allowWriter(); await oldGeneration.flush();
const beforeStorageRefresh = oldGeneration.state(); oldGeneration.events.storage({ key: memory.XIZONG_MEMORY_STORAGE_KEY }); await oldGeneration.flush();
assert.deepEqual(oldGeneration.state(), beforeStorageRefresh);
checks.push('storage-triggered refresh remains idempotent');
const race = await boot(before, { 'block-a': current });
const concurrent = memory.setPersonalPrompt(before, 'block-a-kp', 'Concurrent private prompt');
const originalGet = race.storage.getItem.bind(race.storage); let reads = 0;
race.storage.getItem = key => {
  reads += 1;
  if (reads === 3) race.storage.data.set(key, JSON.stringify(concurrent));
  return originalGet(key);
};
race.allowWriter(); await race.flush(); race.click('[data-memory-view="CORE"]');
assert.deepEqual(race.state(), concurrent);
assert.equal(race.find('[data-memory-queue]').children.length, 0);
assert(race.errors.some(error => error.includes('STALE')));
checks.push('native compare-and-swap rejects concurrent storage replacement without rollback');
let readyA; const delayA = new Promise(resolve => { readyA = resolve; });
const editRace = await boot(two, { 'block-a': () => delayA, 'block-b': descriptor(learner('block-b', 'new')) });
editRace.allowWriter(); await editRace.flush(); editRace.click('[data-memory-view="CORE"]');
assert.match(editRace.find('[data-memory-card-title]').textContent, /block-b/);
editRace.click('[data-memory-prompt-edit]');
editRace.find('[data-memory-prompt-input]').value = 'Private edit intended only for B';
readyA(current); await editRace.flush();
assert.match(editRace.find('[data-memory-card-title]').textContent, /block-b/);
editRace.click('[data-memory-prompt-save]');
assert.equal(editRace.state().promptOverrides['block-b-kp'], 'Private edit intended only for B');
assert.equal(editRace.state().promptOverrides['block-a-kp'], 'Private prompt');
checks.push('late sibling preserves selected stable card and private Prompt edit target');
editRace.click('[data-memory-prompt-edit]');
editRace.find('[data-memory-prompt-input]').value = 'Must not leak into A';
editRace.find('[data-memory-queue]').children[0].emit('click');
assert.equal(editRace.find('[data-memory-prompt-editor]').hidden, true);
editRace.click('[data-memory-prompt-save]');
assert.equal(editRace.state().promptOverrides['block-a-kp'], 'Private prompt');
assert.equal(editRace.state().promptOverrides['block-b-kp'], 'Private edit intended only for B');
checks.push('explicit card switch closes editor and cannot misattribute stale input');
console.log(JSON.stringify({ pass: true, harness: 'actual workspace script; synthetic DOM, storage, transport and readiness', checks }, null, 2));
