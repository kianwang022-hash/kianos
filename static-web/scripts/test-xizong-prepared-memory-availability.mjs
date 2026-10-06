import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as memory from '../src/lib/xizongMemoryModel.mjs';
import * as release from '../src/lib/xizongMemoryRelease.mjs';
import * as autoRelease from '../src/lib/xizongMemoryAutoRelease.mjs';

// The real shipped controllers run against a small synthetic DOM/storage
// adapter. This proves state/control behavior, not Candidate or learner U.
const index = JSON.parse(fs.readFileSync(new URL('../../content/xizong/knowledge/learner/a1-circulation-learning-cues.json', import.meta.url)));
const clone = value => JSON.parse(JSON.stringify(value));
function syntheticLearner(blockId, count) {
  const admitted = index.precision_index.filter(row => row.anchor.block_id === blockId);
  const kps = Array.from({ length: count }, (_, i) => {
    const kpId = `${blockId}-kp${String(i + 1).padStart(2, '0')}`;
    return { identity: { kpId, logicGroupId: 'synthetic-group', title: `Synthetic ${i + 1}` },
      core: { html: '<p>Synthetic Core</p>' }, prompt: { canonical: 'Synthetic Prompt' },
      precision: admitted.filter(row => row.anchor.kp_id === kpId).map(row => {
        const answerHtml = `<section data-prepared-memory="${row.id}"><p>Synthetic exact answer</p><p>Scope</p><p>Aid</p></section>`;
        return { id: row.id, anchor: clone(row.anchor), cue: row.cue, answerHtml,
          raw: { ...clone(row), answer_html: answerHtml, prepared_memory_owner: 'content/xizong/knowledge/learner/shared-fields.json' } };
      }) };
  });
  return { schema: release.XIZONG_LEARNER_OBJECT_SCHEMA, objectType: 'BLOCK',
    sourceHash: 'synthetic-current', identity: { systemId: 'circulation', canonicalId: 'A1', blockId, blockLabel: blockId === 'circulation-b01' ? 'B1' : 'B2' },
    kps, logicGroups: [{ identity: { logicGroupId: 'synthetic-group' }, kpIds: kps.map(k => k.identity.kpId), precision: [] }] };
}
const learner = syntheticLearner('circulation-b01', 32), kps = learner.kps;
const admitted = index.precision_index.filter(row => row.anchor.block_id === learner.identity.blockId);
const describe = value => release.buildXizongPreparedMemoryAvailability(value, { sourceHash: value.sourceHash });
const checks = [];
const check = (name, fn) => { fn(); checks.push(name); };
const descriptor = describe(learner);
const first = memory.makePreparedMemoryAvailable(memory.createXizongMemoryState(), descriptor, '2026-10-01T00:00:00Z');
const firstJson = JSON.stringify(first);
check('fresh B1 gets exactly thirteen admitted Precision, no Core, completion or Today', () => {
  assert.equal(descriptor.coreCards.length, 0); assert.equal(descriptor.attentionSignals.length, 0);
  assert.deepEqual(Object.keys(first.cards), admitted.map(row => `precision:${row.id}`));
  assert.equal(memory.memorySummary(first).core, 0);
  assert.equal(memory.todayMemoryQueue(first).length, 0);
  assert.deepEqual(first.releasedBlocks, {}); assert.deepEqual(first.evidence, []);
});
check('reopening is byte-idempotent and input remains untouched', () => {
  assert.equal(JSON.stringify(memory.makePreparedMemoryAvailable(first, descriptor, '2026-10-02T00:00:00Z')), firstJson);
  assert.equal(JSON.stringify(first), firstJson);
});
check('existing ratings, private annotations, attention, repair and release receipts survive', () => {
  let prior = memory.appendMemoryEvidence(first, { cardId: descriptor.precisionCards[0].id, rating: 'mastered' }, '2026-10-01T01:00:00Z');
  prior.promptOverrides = { kp: 'private' }; prior.marks = { mark: { text: 'private mark' } };
  prior.repairTasks = [{ id: 'repair', status: 'ACTIVE' }];
  prior.releasedBlocks = { other: { releasedAt: 'unchanged', coreCardIds: ['other'] } };
  const snapshot = clone(prior);
  const next = memory.makePreparedMemoryAvailable(prior, { ...descriptor, attentionSignals: [{ cardId: descriptor.precisionCards[0].id, reviewRequested: true }] });
  for (const key of ['releasedBlocks', 'evidence', 'attention', 'promptOverrides', 'marks', 'repairTasks']) assert.deepEqual(next[key], snapshot[key], key);
  assert.deepEqual(prior, snapshot);
});
check('later true completion still gets Core and first-pass handoff exactly once', () => {
  const study = { sourceHash: learner.sourceHash, completed: true, blockRecallDone: true,
    learned: Object.fromEntries(kps.map(k => [k.identity.kpId, true])),
    ratings: Object.fromEntries(kps.map(k => [k.identity.kpId, 'fuzzy'])) };
  const done = autoRelease.releaseCompletedBlockToMemory(first, learner, study);
  assert.equal(done.released, true); assert.equal(done.coreCardIds.length, 32);
  assert.equal(done.precisionCardIds.length, 13); assert.equal(done.attentionCardIds.length, 32);
  let rated = memory.appendMemoryEvidence(done.state, { cardId: done.coreCardIds[0], rating: 'mastered' });
  const again = autoRelease.releaseCompletedBlockToMemory(rated, learner, study);
  assert.equal(again.released, false); assert.equal(again.state.attention[done.coreCardIds[0]].reviewRequested, false);
  assert.deepEqual(again.state.evidence, rated.evidence);
});
check('content revision uses existing history semantics without evidence replay', () => {
  const rated = memory.appendMemoryEvidence(first, { cardId: descriptor.precisionCards[0].id, rating: 'known' }, '2026-10-01T01:00:00Z');
  const changed = clone(descriptor); changed.precisionCards[0].answerHtml += '<p>Synthetic revised answer</p>';
  const next = memory.makePreparedMemoryAvailable(rated, changed, '2026-10-02T00:00:00Z');
  const card = next.cards[descriptor.precisionCards[0].id];
  assert.equal(card.contentHistory.length, 1); assert.equal(card.contentHistory[0].answerHtml, descriptor.precisionCards[0].answerHtml);
  assert.equal(card.contentChangedAt, '2026-10-02T00:00:00.000Z');
  assert.deepEqual(next.evidence, rated.evidence); assert.deepEqual(next.releasedBlocks, rated.releasedBlocks);
});
for (const [name, mutate] of [
  ['unreviewed Block', x => x.identity.blockId = 'circulation-b13'],
  ['duplicate owner', x => x.kps.push(clone(x.kps[2]))],
  ['duplicate cue', x => x.kps[2].precision.push(clone(x.kps[2].precision[0]))],
  ['missing admission', x => x.kps[2].precision.pop()],
  ['unreviewed owner', x => x.kps[2].precision[0].raw.prepared_memory_owner = 'unreviewed.json'],
  ['stale item reference', x => x.kps[2].precision[0].raw.prepared_memory_ref.item_sha256 = 'stale'],
  ['stale Core reference', x => x.kps[2].precision[0].raw.prepared_memory_ref.kp_core_sha256 = 'stale'],
  ['ambiguous owner', x => x.kps[2].precision[0].anchor.kp_id = 'circulation-b01-kp04'],
  ['missing answer', x => { x.kps[2].precision[0].answerHtml = ''; x.kps[2].precision[0].raw.answer_html = ''; }]
]) check(`${name} fails closed`, () => { const input = clone(learner); mutate(input); assert.throws(() => describe(input)); });
check('stale payload source rejected', () => assert.throws(() => release.buildXizongPreparedMemoryAvailability(learner, { sourceHash: 'stale' })));
check('retained unindexed metadata never becomes another card', () => {
  const input = clone(learner); input.kps[2].precision.push({ id: 'b01-m03-unadmitted', cue: 'not admitted' });
  assert.deepEqual(describe(input).precisionCards.map(c => c.id), descriptor.precisionCards.map(c => c.id));
});

const b2Learner = syntheticLearner('circulation-b02', 19);
const b2Descriptor = describe(b2Learner);
const b2First = memory.makePreparedMemoryAvailable(memory.createXizongMemoryState(), b2Descriptor, '2026-10-01T00:00:00Z');
const expectedB2 = ['b02-m01-baroreceptor-afferents', 'b02-m02-chemoreceptor-bias', 'b02-m03-chemoreflex-80',
  'b02-m05-axon-reflex-cgrp', 'b02-m06-medulla-80-20', 'b02-m07-medulla-ach-n1', 'b02-m09-angii-angiii-extremes',
  'b02-m10-adh-identity-origin-storage', 'b02-m11-v1-v2-aqp2-localization', 'b02-m12-adh-inhibitors', 'b02-m13-anp-bnp-origin', 'b02-m14-pg-directions'];
check('B2 selects exactly the twelve reviewed items, zero Core/Today/release/evidence', () => {
  assert.deepEqual(Object.keys(b2First.cards), expectedB2.map(id => `precision:${id}`));
  assert.equal(memory.memorySummary(b2First).precision, 12); assert.equal(memory.memorySummary(b2First).core, 0);
  assert.equal(memory.todayMemoryQueue(b2First).length, 0);
  assert.deepEqual(b2First.releasedBlocks, {}); assert.deepEqual(b2First.evidence, []); assert.deepEqual(b2First.attention, {});
  assert.deepEqual(memory.makePreparedMemoryAvailable(b2First, b2Descriptor), b2First);
});
check('B2 same-ID semantic refresh preserves ratings, private state and old answer history', () => {
  let prior = memory.appendMemoryEvidence(b2First, { cardId: b2Descriptor.precisionCards[0].id, rating: 'known' }, '2026-10-01T01:00:00Z');
  prior.promptOverrides = { private: 'unchanged' }; prior.marks = { private: { text: 'unchanged' } };
  prior.repairTasks = [{ id: 'private', status: 'ACTIVE' }]; prior.releasedBlocks = { other: { releasedAt: 'unchanged' } };
  prior.cards[b2Descriptor.precisionCards[0].id].semanticRevision = 'synthetic-prior';
  const changed = clone(b2Descriptor); changed.precisionCards[0].semanticRevision = 'synthetic-next';
  changed.precisionCards[0].answerHtml += '<p>Synthetic revision</p>';
  const next = memory.makePreparedMemoryAvailable(prior, changed, '2026-10-02T00:00:00Z');
  assert.equal(Object.keys(next.cards).length, 12);
  const card = next.cards[b2Descriptor.precisionCards[0].id];
  assert.equal(card.contentHistory.length, 1); assert.equal(card.contentHistory[0].semanticRevision, 'synthetic-prior');
  assert.equal(card.contentHistory[0].answerHtml, b2Descriptor.precisionCards[0].answerHtml);
  for (const key of ['evidence','attention','promptOverrides','marks','repairTasks','releasedBlocks']) assert.deepEqual(next[key], prior[key]);
  assert.deepEqual(memory.makePreparedMemoryAvailable(next, changed), next);
});
check('B2 availability leaves later true full release and first-pass signals intact', () => {
  const study = { sourceHash: b2Learner.sourceHash, completed: true, blockRecallDone: true,
    learned: Object.fromEntries(b2Learner.kps.map(k => [k.identity.kpId, true])),
    ratings: Object.fromEntries(b2Learner.kps.map(k => [k.identity.kpId, 'fuzzy'])) };
  const done = autoRelease.releaseCompletedBlockToMemory(b2First, b2Learner, study);
  assert.equal(done.released, true); assert.equal(done.coreCardIds.length, 19);
  assert.equal(done.precisionCardIds.length, 12); assert.equal(done.attentionCardIds.length, 19);
  assert.equal(autoRelease.releaseCompletedBlockToMemory(done.state, b2Learner, study).released, false);
});
for (const [name, mutate] of [
  ['missing admission', x => x.kps[1].precision.pop()],
  ['duplicate owner', x => x.kps.push(clone(x.kps[1]))],
  ['duplicate cue', x => x.kps[1].precision.push(clone(x.kps[1].precision[0]))],
  ['unreviewed owner', x => x.kps[1].precision[0].raw.prepared_memory_owner = 'unreviewed.json'],
  ['stale item witness', x => x.kps[1].precision[0].raw.prepared_memory_ref.item_sha256 = 'stale'],
  ['stale Core witness', x => x.kps[1].precision[0].raw.prepared_memory_ref.kp_core_sha256 = 'stale'],
  ['wrong Block anchor', x => x.kps[1].precision[0].anchor.block_id = 'circulation-b01'],
  ['wrong KP owner', x => x.kps[1].precision[0].raw.anchor.kp_id = 'circulation-b02-kp03'],
  ['missing answer', x => { x.kps[1].precision[0].answerHtml = ''; x.kps[1].precision[0].raw.answer_html = ''; }]
]) check(`B2 ${name} fails closed`, () => { const input = clone(b2Learner); mutate(input); assert.throws(() => describe(input)); });
check('B2 held qualifier and LOW metadata cannot enter availability', () => {
  const input = clone(b2Learner);
  for (const id of ['b02-m04-held','b02-m08-low','b02-m15-low','b02-m16-low','b02-m17-low']) input.kps[1].precision.push({id,cue:'not admitted'});
  assert.deepEqual(describe(input).precisionCards.map(c => c.precisionCueId), expectedB2);
});

class Element {
  constructor(attrs = {}) { this.attrs = attrs; this.hidden = false; this.children = []; this.listeners = {}; this.dataset = {}; this.textContent = ''; this.classList = { toggle() {} }; }
  getAttribute(key) { return this.attrs[key] ?? null; }
  setAttribute(key, value) { this.attrs[key] = value; }
  append(...nodes) { this.children.push(...nodes); }
  before() {}
  replaceChildren(...nodes) { this.children = nodes; }
  matches(selector) {
    if (selector.startsWith('.')) return this.attrs.class === selector.slice(1);
    const match = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    return Boolean(match && match[1] in this.attrs && (match[2] === undefined || this.attrs[match[1]] === match[2]));
  }
  querySelectorAll(selector) {
    if (selector === '[data-memory-queue] > button') return this.querySelector('[data-memory-queue]')?.children || [];
    const found = []; const visit = el => { for (const child of el.children) { if (child.matches(selector)) found.push(child); visit(child); } }; visit(this); return found;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
  dispatchEvent(event) { for (const fn of this.listeners[event.type] || []) fn(event); }
  click() { this.dispatchEvent({ type: 'click', target: this }); }
}
class Input extends Element {}
const node = (parent, attrs) => { const child = new Element(attrs); parent.append(child); return child; };
const inline = name => fs.readFileSync(new URL(`../src/components/${name}.astro`, import.meta.url), 'utf8')
  .match(/<script>\n([\s\S]*?)<\/script>/)[1].replace(/  import[\s\S]*?;\n/g, '').replace('void learnerWriterReady.then', 'learnerWriterReady.then');
const bridgeScript = inline('XizongMemoryReleaseBridge'), workspaceScript = inline('XizongMemoryWorkspace');
async function harness({ payload = learner, saved, failSave = false, search = '', chat = null, workspace = false } = {}) {
  const document = new Element(), window = new Element(), navigations = [], writes = [];
  const values = new Map(saved === undefined ? [] : [[memory.XIZONG_MEMORY_STORAGE_KEY, typeof saved === 'string' ? saved : JSON.stringify(saved)]]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { if (failSave) throw new Error('synthetic save failure'); writes.push(key); values.set(key, value); } };
  document.createElement = () => new Element();
  window.location = { search, assign: href => navigations.push(href) };
  const context = { document, window, localStorage: storage, URLSearchParams, HTMLElement: Element, Element,
    HTMLInputElement: Input, HTMLTextAreaElement: Input, HTMLAnchorElement: Input,
    CustomEvent: class { constructor(type, opts) { this.type = type; this.detail = opts?.detail; } },
    learnerWriterReady: Promise.resolve(), console: { error() {} }, ...memory, ...release, ...autoRelease,
    XIZONG_SESSION_KEY: 'synthetic-session', studyDayAt: () => 'synthetic-day',
    validateXizongSessionInstruction: () => chat, resolveXizongSessionNext: () => ({ step: chat?.step }) };
  let root, button, status;
  if (!workspace) {
    root = node(document, { 'data-xizong-v6-block': '', 'data-study-object': `xizong:${payload.identity.blockId}` });
    node(root, { class: 'portedStudyShellActions' });
    node(document, { 'data-xizong-learner-object-payload': '' }).textContent = JSON.stringify(payload);
    node(document, { 'data-xizong-memory-release-bridge': '', 'data-object-id': `xizong:${payload.identity.blockId}`, 'data-source-hash': payload.sourceHash });
    const action = node(document, { 'data-prepared-memory-action': '', 'data-memory-href': '/xizong/memory/?view=precision' }); action.hidden = true;
    button = node(action, { 'data-open-prepared-memory': '' }); status = node(action, { 'data-prepared-memory-status': '' });
  } else {
    root = node(document, { 'data-xizong-memory-workspace': '' });
    for (const key of ['view-title', 'view-note', 'queue', 'card', 'marked-card', 'repair-card', 'empty', 'answer', 'reveal-gate', 'ratings', 'prompt-wrap', 'precision-cue', 'core-actions', 'reveal', 'precision-mode', 'summary-today', 'summary-core', 'summary-precision']) node(root, { [`data-memory-${key}`]: '' });
    for (const view of ['TODAY', 'CORE', 'PRECISION', 'MARKED', 'REPAIR']) node(root, { 'data-memory-view': view });
    for (const mode of ['BROWSE', 'RECALL']) node(root, { 'data-precision-mode': mode });
    for (const rating of ['unknown', 'fuzzy', 'known', 'mastered']) node(root, { 'data-memory-rating': rating });
  }
  await vm.runInNewContext(workspace ? workspaceScript : bridgeScript, context);
  return { root, button, status, navigations, writes, raw: () => values.get(memory.XIZONG_MEMORY_STORAGE_KEY),
    state: () => JSON.parse(values.get(memory.XIZONG_MEMORY_STORAGE_KEY)), q: selector => root.querySelector(selector) };
}
const opened = await harness();
assert.equal(opened.writes.length, 0, 'render alone cannot make cards available');
opened.button.click();
assert.equal(opened.state().evidence.length, 0); assert.equal(Object.keys(opened.state().cards).length, 13);
assert.equal(opened.navigations.length, 1); assert.deepEqual(opened.writes, [memory.XIZONG_MEMORY_STORAGE_KEY]);
checks.push('actual Bridge persists Memory only, then navigates');
for (const [name, saved, failSave] of [['corruption', '{broken', false], ['unsupported schema', { schema: 'future' }, false], ['save failure', memory.createXizongMemoryState(), true]]) {
  const h = await harness({ saved, failSave }); const before = h.raw(); h.button.click();
  assert.equal(h.raw(), before, name); assert.equal(h.navigations.length, 0, name);
  assert.ok(h.status.textContent, name); checks.push(`${name} preserves old storage and stays put`);
}
const browse = await harness({ workspace: true, saved: first, search: '?view=precision&block=circulation-b01' });
assert.equal(browse.q('[data-memory-queue]').children.length, 13);
assert.equal(browse.q('[data-memory-answer]').hidden, false);
assert.match(browse.q('[data-memory-answer]').innerHTML, /Synthetic exact answer.*Scope.*Aid/);
assert.equal(browse.q('[data-memory-ratings]').hidden, true);
browse.q('[data-memory-rating="known"]').click(); assert.equal(browse.state().evidence.length, 0, 'Browse cannot rate');
browse.q('[data-precision-mode="RECALL"]').click();
assert.equal(browse.q('[data-memory-answer]').hidden, true); assert.equal(browse.q('[data-memory-ratings]').hidden, true);
browse.q('[data-memory-rating="known"]').click(); assert.equal(browse.state().evidence.length, 0, 'Recall cannot rate before Reveal');
browse.q('[data-memory-reveal]').click(); assert.equal(browse.q('[data-memory-answer]').hidden, false);
browse.q('[data-memory-rating="known"]').click(); assert.equal(browse.state().evidence.length, 1);
checks.push('actual Workspace Browse shows answer/scope/aid; Recall hides all until Reveal and real rating');
const noCards = await harness({ workspace: true, search: '?view=precision&block=circulation-b01' });
assert.equal(noCards.q('[data-memory-queue]').children.length, 0); assert.equal(noCards.writes.length, 0);
const chat = await harness({ workspace: true, saved: first, search: '?view=precision&block=circulation-b01&session=s&step=t',
  chat: { session_id: 's', step: { step_id: 't', kind: 'MEMORY_REVIEW', targets: [{ card_id: descriptor.precisionCards[0].id }] } } });
assert.equal(chat.q('[data-memory-queue]').children.length, 1); assert.equal(chat.q('[data-memory-answer]').hidden, true);
assert.equal(chat.writes.length, 0);
checks.push('URL manufactures no cards/evidence and valid Chat session keeps Recall precedence');

const b2Opened = await harness({ payload: b2Learner });
assert.equal(b2Opened.writes.length, 0); b2Opened.button.click();
assert.equal(Object.keys(b2Opened.state().cards).length, 12);
assert.deepEqual(b2Opened.navigations, ['/xizong/memory/?view=precision&block=circulation-b02']);
assert.deepEqual(b2Opened.writes, [memory.XIZONG_MEMORY_STORAGE_KEY]);
assert.deepEqual(b2Opened.state().releasedBlocks, {}); assert.deepEqual(b2Opened.state().evidence, []);
for (const [name, saved, failSave] of [['corruption', '{broken', false], ['unsupported schema', { schema: 'future' }, false], ['save failure', memory.createXizongMemoryState(), true]]) {
  const h = await harness({ payload: b2Learner, saved, failSave }); const before = h.raw(); h.button.click();
  assert.equal(h.raw(), before); assert.deepEqual(h.navigations, []); assert.ok(h.status.textContent);
  checks.push(`actual B2 Bridge ${name} preserves storage and does not route`);
}
const both = memory.makePreparedMemoryAvailable(first, b2Descriptor);
const b2Browse = await harness({ workspace: true, saved: both, search: '?view=precision&block=circulation-b02' });
assert.equal(b2Browse.q('[data-memory-queue]').children.length, 12);
assert.match(b2Browse.q('[data-memory-view-note]').textContent, /^B2 /);
assert.equal(b2Browse.q('[data-memory-answer]').hidden, false);
assert.match(b2Browse.q('[data-memory-answer]').innerHTML, /Synthetic exact answer.*Scope.*Aid/);
b2Browse.q('[data-memory-rating="known"]').click(); assert.equal(b2Browse.state().evidence.length, 0);
b2Browse.q('[data-precision-mode="RECALL"]').click();
assert.equal(b2Browse.q('[data-memory-answer]').hidden, true); assert.equal(b2Browse.q('[data-memory-ratings]').hidden, true);
b2Browse.q('[data-memory-rating="known"]').click(); assert.equal(b2Browse.state().evidence.length, 0);
b2Browse.q('[data-memory-reveal]').click(); b2Browse.q('[data-memory-rating="known"]').click();
assert.equal(b2Browse.state().evidence.length, 1); assert.match(b2Browse.state().evidence[0].cardId, /^precision:b02-/);
const b2Reload = await harness({ workspace: true, saved: b2Browse.state(), search: '?view=precision&block=circulation-b02' });
assert.deepEqual(b2Reload.state(), b2Browse.state());
const b2Empty = await harness({ workspace: true, search: '?view=precision&block=circulation-b02' });
assert.equal(b2Empty.q('[data-memory-queue]').children.length, 0); assert.equal(b2Empty.writes.length, 0);
const b2Chat = await harness({ workspace: true, saved: both, search: '?view=precision&block=circulation-b02&session=s&step=t',
  chat: { session_id: 's', step: { step_id: 't', kind: 'MEMORY_REVIEW', targets: [{ card_id: descriptor.precisionCards[0].id }] } } });
assert.equal(b2Chat.q('[data-memory-queue]').children.length, 1); assert.equal(b2Chat.q('[data-memory-answer]').hidden, true);
assert.equal(b2Chat.writes.length, 0);
checks.push('actual B2 Bridge/Workspace use B2-only identity/filter/label, preserve B1 cards and authenticated Chat Recall precedence, hide answers until Recall Reveal, persist one explicit rating and reopen without replay');
console.log(JSON.stringify({ status: 'PASS', boundary: 'synthetic controller + state regression; no Candidate or learner U claim', checks }, null, 2));
