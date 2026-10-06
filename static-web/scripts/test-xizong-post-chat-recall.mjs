import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as revision from '../src/lib/xizongContentRevision.mjs';

// Execute the shipped inline controller and evidence capture listener against a
// small synthetic DOM/storage adapter. This is not browser, medical or learner U proof.
const component = fs.readFileSync(new URL('../src/components/XizongBlockV6.astro', import.meta.url), 'utf8');
const bridge = fs.readFileSync(new URL('../src/components/XizongRecallEvidenceBridge.astro', import.meta.url), 'utf8');
const guard = fs.readFileSync(new URL('../src/components/XizongRuntimeStageGuard.astro', import.meta.url), 'utf8');
const guardController = guard.match(/<script>\n([\s\S]*?)<\/script>/)?.[1]
  .replace(/^  import[^\n]+\n/gm, '').replace('void learnerWriterReady.then', 'learnerWriterReady.then');
assert.ok(guardController, 'execute the actual prerequisite/Reveal/rating capture guard');
const runtime = component.match(/<script define:vars=\{\{[\s\S]*?\}\}>\n([\s\S]*?)<\/script>/)?.[1];
assert.ok(runtime, 'execute the actual Block controller');
const controller = runtime.replace(/await import\(revisionRuntimeUrl\)/, '__revision');
const evidenceController = bridge.match(/<script>\n([\s\S]*?)<\/script>/)?.[1]
  .replace(/  import[^\n]+\n/, '').replace('void learnerWriterReady.then', 'learnerWriterReady.then');
assert.ok(evidenceController, 'execute the actual evidence bridge');
// Evaluate the actual frontmatter predicate, rather than restating its scope.
const availabilityExpression = component.match(/const postChatRecallAvailable = ([\s\S]*?);/)?.[1];
assert.ok(availabilityExpression);
const availableFor = (systemId = 'circulation', slug = 'b01', mode = 'NATURAL_SOURCE_UNIT', perGroup = false) =>
  vm.runInNewContext(availabilityExpression, { block: { systemId, slug }, sourceContactMode: mode, sourcePerGroup: perGroup });
assert.equal(availableFor(), true);
for (const args of [['circulation', 'b02'], ['respiratory', 'b01'], ['circulation', 'b01', 'NATURAL_SOURCE_UNITS'], ['circulation', 'b01', 'NATURAL_SOURCE_UNIT', true]]) {
  assert.equal(availableFor(...args), false, `scope:${args}`);
}
assert.match(component, /data-post-chat-recall-available=\{postChatRecallAvailable \? 'true' : 'false'\}/);
assert.equal((component.match(/postChatRecallAvailable && <button type="button" data-post-chat-recall>Chat 后开始 KP 回忆/g) || []).length, 2, 'fresh and saved Source-stage entry');
assert.match(component, /postChatRecallAvailable && <button type="button" data-stage-target="source_contact">回原讲义/);

class Element {
  constructor(attrs = {}, hidden = false) {
    this.attrs = { ...attrs }; this.hidden = hidden; this.children = []; this.parent = null;
    this.listeners = {}; this.dataset = {}; this.inert = false; this.textContent = '';
    for (const [key, value] of Object.entries(attrs)) if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
    const classes = new Set();
    this.classList = { add: (...names) => names.forEach(name => classes.add(name)), toggle: (name, on) => { const next = on ?? !classes.has(name); if (next) classes.add(name); else classes.delete(name); return next; }, contains: name => classes.has(name) };
  }
  getAttribute(name) { return this.attrs[name] ?? null; }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  hasAttribute(name) { return name === 'hidden' ? this.hidden : name in this.attrs; }
  append(...children) { for (const child of children) { child.parent = this; this.children.push(child); } }
  before() {}
  replaceChildren(...children) { this.children = []; this.append(...children); }
  matches(selector) {
    if (selector === 'h3') return this.attrs.tag === 'h3';
    const match = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    return Boolean(match && this.hasAttribute(match[1]) && (match[2] === undefined || this.getAttribute(match[1]) === match[2]));
  }
  querySelectorAll(selector) {
    const selectors = selector.split(','); const found = [];
    const visit = node => { for (const child of node.children) { if (selectors.some(s => child.matches(s))) found.push(child); visit(child); } };
    visit(this); return found;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { for (let node = this; node; node = node.parent) if (selector.split(',').some(s => node.matches(s))) return node; return null; }
  addEventListener(type, callback, capture = false) { (this.listeners[type] ||= []).push({ callback, capture }); }
  dispatchEvent(event) {
    event.target ||= this; event.preventDefault ||= () => {}; event.stopImmediatePropagation ||= () => { event.stopped = true; };
    const route = []; for (let node = this; node; node = node.parent) route.push(node);
    for (const capture of [true, false]) {
      for (const node of capture ? [...route].reverse() : route) for (const row of node.listeners[event.type] || []) {
        if (row.capture !== capture || event.stopped) continue;
        event.currentTarget = node; row.callback(event);
      }
    }
    return !event.stopped;
  }
  click() { this.dispatchEvent({ type: 'click' }); }
}
const clone = value => JSON.parse(JSON.stringify(value));
const kpIds = ['circulation-b01-kp01', 'circulation-b01-kp02', 'circulation-b01-kp03'];
const groupIds = ['circulation-b01-lg01', 'circulation-b01-lg02'];
const groupPayload = [
  { groupId: groupIds[0], kpIds: kpIds.slice(0, 2), label: 'Synthetic group one' },
  { groupId: groupIds[1], kpIds: kpIds.slice(2), label: 'Synthetic group two' }
];
const kpPayload = kpIds.map((kpId, index) => ({ kpId, groupId: groupIds[index < 2 ? 0 : 1], title: `Synthetic KP ${index + 1}` }));
const witness = { schema: 'kianos.xizong.revision-witness.v1', sourceHash: 'synthetic-source', kpOrder: kpIds,
  groupOrder: groupIds, segmentOrder: [], members: Object.fromEntries(groupPayload.map(g => [g.groupId, g.kpIds])),
  kps: Object.fromEntries(kpIds.map(id => [id, id])), groups: Object.fromEntries(groupIds.map(id => [id, id])), block: 'synthetic-block', contact: 'synthetic-contact' };
const stateKey = 'kianos-xizong-astro-v2:xizong:circulation-b01';
const evidenceKey = 'kianos-xizong-memory-review-v2:xizong:circulation-b01';

async function createHarness({ saved, available = true, ttsx = [], visual = false, prerequisite = false } = {}) {
  const root = new Element({ 'data-xizong-v6-block': '', 'data-study-object': 'xizong:circulation-b01', 'data-block-label': 'B1',
    'data-study-system-id': 'circulation', 'data-study-block-slug': 'b01', 'data-study-block-id': 'circulation-b01',
    'data-study-source-hash': 'synthetic-source', 'data-post-chat-recall-available': String(available) });
  const add = (parent, attrs, hidden = false) => { const node = new Element(attrs, hidden); parent.append(node); return node; };
  const stages = Object.fromEntries(['block_learn', 'source_contact', 'kp_recall', 'ttsx_checkpoint', 'block_recall'].map(name => [name, add(root, { 'data-study-stage': name }, name !== 'block_learn')]));
  const entry = add(stages.block_learn, { 'data-post-chat-recall': '' });
  const sourceEntry = add(stages.source_contact, { 'data-post-chat-recall': '' });
  const lectureEntry = add(stages.block_learn, { 'data-stage-next': 'logic_group' });
  const sourceReturn = add(stages.kp_recall, { 'data-stage-target': 'source_contact' });
  const recallTarget = add(root, { 'data-stage-target': 'kp_recall' });
  const confirmSource = add(stages.source_contact, { 'data-source-contact-done': '' });
  const groupButtons = groupPayload.map((_, i) => add(root, { 'data-group-target': String(i) }));
  const cards = kpIds.map((id, i) => {
    const card = add(stages.kp_recall, { 'data-kp-recall-card': String(i), 'data-kp-id': id }, i !== 0);
    add(card, { tag: 'h3' }).textContent = id;
    const reveal = add(card, { 'data-kp-reveal': '' });
    const answer = add(card, { 'data-kp-answer': '' }, true);
    const rating = add(card, { 'data-kp-rating': '' }, true);
    const buttons = Object.fromEntries(['unknown', 'fuzzy', 'known', 'mastered', 'invalid'].map(value => [value, add(rating, { 'data-rating': value })]));
    return { card, reveal, answer, rating, buttons };
  });
  const recallReveal = add(stages.block_recall, { 'data-block-recall-reveal': '' });
  const recallAnswer = add(stages.block_recall, { 'data-block-recall-answer': '' }, true);
  const recallComplete = add(stages.block_recall, { 'data-block-recall-complete': '' });
  const complete = add(stages.block_recall, { 'data-block-complete': '' });
  const ttsxDone = add(stages.ttsx_checkpoint, { 'data-ttsx-done': '' });
  const evidenceBridge = new Element({ 'data-xizong-recall-evidence-bridge': '', 'data-study-object': 'xizong:circulation-b01', 'data-study-source-hash': 'synthetic-source' });
  const evidenceKps = new Element({ 'data-xizong-recall-evidence-kps': '' }); evidenceKps.textContent = JSON.stringify(kpIds);
  const completionInput = new Element({ 'data-xizong-completion-input': '' });
  completionInput.textContent = JSON.stringify({ blockId: 'circulation-b01', blockIds: [], blockPrerequisites: prerequisite ? [{ blockId: 'missing', requirement: null }] : [],
    blockingVisualGroups: visual ? [{ groupId: groupIds[1], label: 'Synthetic visual', reviewableFromOriginalSource: true }] : [], requirements: [] });
  const document = new Element(); document.append(root, evidenceBridge, evidenceKps, completionInput);
  document.createElement = () => new Element(); document.createTextNode = text => { const el = new Element(); el.textContent = text; return el; };
  const values = new Map(saved ? [[stateKey, JSON.stringify(saved)]] : []);
  let failKey = null;
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { if (key === failKey) throw new Error('synthetic write failure'); values.set(key, value); } };
  const timers = []; const dispatched = [];
  const window = new Element(); window.__kianosLearnerWriterReady = Promise.resolve(); window.setTimeout = callback => timers.push(callback);
  window.dispatchEvent = event => { dispatched.push(event); return true; };
  class CustomEvent { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } }
  const groups = clone(groupPayload); if (visual) { groups[1].visualRequired = true; groups[1].visualSourceState = 'GAP_NOT_MOUNTED'; }
  const context = vm.createContext({ window, document, localStorage: storage, sessionStorage: { getItem: () => null, setItem: () => {} }, HTMLElement: Element, Element, CustomEvent, __revision: revision,
    learnerWriterReady: Promise.resolve(), sourceContactCompatible: revision.sourceContactCompatible, revisionRequiresAction: revision.revisionRequiresAction, needsFreshKpRecall: revision.needsFreshKpRecall,
    groupPayload: groups, kpPayload, revisionRuntimeUrl: '', revisionWitness: witness,
    sourcePerGroup: false, postChatRecallAvailable: available, sourceContactMode: 'NATURAL_SOURCE_UNIT', sourceContactPayload: { mode: 'NATURAL_SOURCE_UNIT', logicGroupIsAutomaticSourceChunk: false },
    naturalSourceUnits: false, integrationPrimary: false, integrationTargetedSourceReturns: false, integrationReleaseLogicGroupIds: [], segmentedSourceUnits: false,
    blockSourceDebtPayload: [], blockSourceConflictPayload: [], blockVisualDebtPayload: visual ? [groupIds[1]] : [], sourceSegmentPayload: [], biochemistrySourcePayload: null, ttsxPayload: ttsx });
  await vm.runInContext(controller, context);
  await vm.runInContext(guardController, context);
  await vm.runInContext(evidenceController, context);
  return { root, entry, sourceEntry, lectureEntry, sourceReturn, recallTarget, confirmSource, groupButtons, cards, stages, recallReveal, recallAnswer, recallComplete, complete, ttsxDone, dispatched,
    state: () => JSON.parse(values.get(stateKey)), evidence: () => JSON.parse(values.get(evidenceKey)),
    flush: () => { while (timers.length) timers.shift()(); }, fail: key => { failKey = key; }, stateKey, evidenceKey };
}
function noContact(h) {
  const state = h.state();
  assert.deepEqual(state.learned, {}); assert.notEqual(state.sourceContactDone, true);
  assert.equal((state.sourceContactEvidence || []).length, 0); assert.deepEqual(state.ttsxEvidence, {});
  assert.equal(state.blockRecallDone, false); assert.equal(state.completed, false);
  assert.equal(h.dispatched.filter(e => e.type === 'kianos:xizong-block-complete').length, 0);
}
function rate(h, index, value = 'known') { h.cards[index].reveal.click(); h.cards[index].buttons[value].click(); }

const fresh = await createHarness();
const initialEvidence = fresh.evidence();
fresh.entry.click();
assert.equal(fresh.state().stage, 'kp_recall'); assert.equal(fresh.state().recallEntryMode, 'POST_CHAT_RECALL');
assert.equal(revision.studyHasEvidence(fresh.state()), false, 'entry creates no learning evidence');
assert.deepEqual(fresh.evidence(), initialEvidence, 'entry writes no Recall history'); noContact(fresh);
assert.equal(fresh.cards[0].answer.hidden, true); assert.equal(fresh.cards[0].rating.hidden, true);
fresh.cards[0].buttons.known.click(); assert.deepEqual(fresh.state().ratings, {}); assert.equal(fresh.evidence().evidenceHistory.length, 0, 'unrevealed rejected');
fresh.cards[1].reveal.click(); assert.equal(fresh.cards[1].answer.hidden, true, 'guard rejects hidden post-Chat Reveal'); fresh.cards[1].buttons.known.click(); assert.equal(fresh.evidence().evidenceHistory.length, 0, 'hidden card rejected');
fresh.cards[0].reveal.click(); fresh.cards[0].buttons.invalid.click(); assert.equal(fresh.evidence().evidenceHistory.length, 0, 'invalid rating rejected');
fresh.cards[0].buttons.known.click();
assert.equal(fresh.state().ratings[kpIds[0]], 'known'); assert.equal(fresh.evidence().evidenceHistory.length, 1);
assert.equal(fresh.evidence().evidenceHistory[0].evidence_origin, 'USER_RECALL_ATTEMPT');
fresh.cards[0].buttons.known.click(); assert.equal(fresh.evidence().evidenceHistory.length, 1, 'duplicate rejected'); noContact(fresh);
fresh.flush(); assert.equal(fresh.state().kpIndex, 1);
const resumed = await createHarness({ saved: fresh.state() });
assert.equal(resumed.state().stage, 'kp_recall'); assert.equal(resumed.state().kpIndex, 1); assert.equal(resumed.state().resumeKpId, kpIds[1]);
assert.equal(resumed.cards[1].answer.hidden, true, 'Resume is a clean Front');
resumed.groupButtons[1].click(); assert.equal(resumed.state().stage, 'kp_recall'); assert.equal(resumed.state().resumeGroupId, groupIds[1]);
assert.equal(resumed.state().resumeKpId, kpIds[2]); noContact(resumed);
resumed.sourceReturn.click(); assert.equal(resumed.state().stage, 'source_contact', 'explicit Source navigation remains');
resumed.cards[2].reveal.click(); assert.equal(resumed.cards[2].answer.hidden, true, 'guard rejects post-Chat Reveal from Source stage'); resumed.cards[2].buttons.known.click(); assert.equal(resumed.state().ratings[kpIds[2]], undefined, 'inactive Recall stage rejected');
const sourceResumed = await createHarness({ saved: resumed.state() });
assert.equal(sourceResumed.state().stage, 'source_contact', 'explicit Source intention survives reload');
sourceResumed.sourceEntry.click(); assert.equal(sourceResumed.state().stage, 'kp_recall'); assert.equal(sourceResumed.state().kpIndex, 2); noContact(sourceResumed);

for (const available of [false, true]) {
  const injection = await createHarness({ available, saved: { ...fresh.state(), stage: 'kp_recall', learned: {}, ratings: {}, recallEntryMode: available ? 'UNKNOWN_MODE' : 'POST_CHAT_RECALL' } });
  assert.equal(injection.state().stage, 'source_contact', 'foreign/unknown mode cannot bypass Source');
  assert.equal(injection.state().recallEntryMode, undefined);
  rate(injection, injection.state().kpIndex); assert.equal(injection.evidence().evidenceHistory.length, 0);
  if (!available) { injection.entry.click(); assert.equal(injection.state().stage, 'source_contact'); }
}
const prerequisite = await createHarness({ prerequisite: true }); prerequisite.entry.click();
assert.equal(prerequisite.state().stage, 'block_learn', 'post-Chat entry preserves hard prerequisite gate');
assert.equal(prerequisite.state().recallEntryMode, undefined); noContact(prerequisite);
const targetEntry = await createHarness(); targetEntry.recallTarget.click();
assert.equal(targetEntry.state().stage, 'block_learn', 'guard rejects Source-free ordinary Recall target');
targetEntry.entry.click(); targetEntry.sourceReturn.click(); targetEntry.recallTarget.click();
assert.equal(targetEntry.state().stage, 'kp_recall', 'validated post-Chat target routes through guard'); noContact(targetEntry);
const normal = await createHarness(); normal.lectureEntry.click();
assert.equal(normal.state().stage, 'source_contact', 'original Lecture entry remains the default'); noContact(normal);
normal.confirmSource.click(); assert.equal(normal.state().sourceContactDone, true); assert.equal(Object.keys(normal.state().learned).length, 3);
rate(normal, 0); assert.equal(normal.state().ratings[kpIds[0]], 'known', 'original Source-first Recall still works');

for (const failEvidence of [true, false]) {
  const failed = await createHarness(); failed.entry.click(); const before = failed.state();
  failed.fail(failEvidence ? evidenceKey : stateKey); rate(failed, 0); failed.flush();
  assert.deepEqual(failed.state(), before, 'failed save never advances persisted state');
  assert.equal(failed.root.dataset.xizongStateBlocked, 'true'); assert.equal(failed.root.inert, true);
  assert.equal(failed.evidence().evidenceHistory.length, failEvidence ? 0 : 1, 'a captured real observation survives a later Block-state save failure');
  rate(failed, 0); assert.equal(failed.evidence().evidenceHistory.length, failEvidence ? 0 : 1, 'blocked retry creates no duplicate'); noContact(failed);
}
const entryFailure = await createHarness(); const beforeEntry = entryFailure.state();
entryFailure.fail(stateKey); entryFailure.entry.click(); assert.deepEqual(entryFailure.state(), beforeEntry); assert.equal(entryFailure.evidence().evidenceHistory.length, 0);

const completeRecall = await createHarness(); completeRecall.entry.click();
for (let i = 0; i < 3; i += 1) { rate(completeRecall, i); completeRecall.flush(); }
assert.equal(completeRecall.state().stage, 'block_recall'); assert.equal(Object.keys(completeRecall.state().ratings).length, 3);
completeRecall.recallReveal.click(); completeRecall.recallComplete.click(); completeRecall.complete.click();
assert.equal(completeRecall.recallAnswer.hidden, true, 'formal Block Recall remains Source-gated');
assert.equal(completeRecall.complete.disabled, true); noContact(completeRecall);
completeRecall.groupButtons[0].click(); completeRecall.sourceReturn.click(); completeRecall.confirmSource.click();
assert.equal(completeRecall.state().sourceContactDone, true); assert.equal(completeRecall.state().sourceContactEvidence.length, 1, 'only explicit Source confirmation creates contact');
// Re-enter Block Recall via the existing final-group rating path after real Source contact.
completeRecall.groupButtons[1].click(); rate(completeRecall, 2); completeRecall.flush();
completeRecall.recallReveal.click(); completeRecall.recallComplete.click(); completeRecall.complete.click();
assert.equal(completeRecall.state().blockRecallDone, true); assert.equal(completeRecall.state().completed, true);
assert.equal(completeRecall.dispatched.filter(e => e.type === 'kianos:xizong-block-complete').length, 1);

const visual = await createHarness({ visual: true }); visual.entry.click();
for (let i = 0; i < 3; i += 1) { rate(visual, i); visual.flush(); }
assert.equal(visual.state().stage, 'source_contact', 'required Source visual return remains');
assert.equal(visual.complete.disabled, true); noContact(visual);
const ttsx = [{ checkpointId: 'synthetic-reviewed', label: 'Synthetic Source boundary', questionRows: [] }];
const checkpoint = await createHarness({ ttsx }); checkpoint.entry.click(); noContact(checkpoint);
checkpoint.sourceReturn.click(); checkpoint.confirmSource.click(); assert.equal(checkpoint.state().stage, 'ttsx_checkpoint');
const pending = await createHarness({ saved: checkpoint.state(), ttsx }); pending.entry.click();
assert.equal(pending.state().stage, 'ttsx_checkpoint', 'post-Chat navigation cannot bypass pending reviewed TTSX');
pending.ttsxDone.click(); assert.equal(pending.state().stage, 'kp_recall'); assert.equal(Object.keys(pending.state().ttsxEvidence).length, 1);

console.log('B1 post-Chat Recall PASS | actual controller + stage guard + evidence bridge, synthetic DOM/storage | entry=no evidence | Recall=explicit revealed rating | Resume/group/source navigation preserved | foreign mode/failure/duplicate guards | completion/visual/TTSX gates preserved | browser/U=NOT_TESTED');
