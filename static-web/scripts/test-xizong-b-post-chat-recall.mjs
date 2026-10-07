import assert from 'node:assert/strict';
import { writeBTestProof } from './xizong-b-test-proof.mjs';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as revision from '../src/lib/xizongContentRevision.mjs';
import { loadXizongSystem, loadXizongBlock } from '../src/lib/xizong.mjs';
import { loadXizongSemanticSystem } from '../src/lib/xizongSemanticAdapter.mjs';
import { buildXizongProductionBlock } from '../src/lib/xizongProductionProjection.mjs';
import { buildXizongLearnerObject } from '../src/lib/xizongLearnerObject.mjs';
import { buildXizongRevisionWitness } from '../src/lib/xizongRevisionWitness.mjs';
import { inspectXizongBlockCompletion } from '../src/lib/xizongMemoryAutoRelease.mjs';

// Native canonical/production payloads execute the shipped controller, capture
// guard and evidence bridge in isolated DOM/storage. This is not browser/U proof.
const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const component = fs.readFileSync(new URL('../src/components/XizongBlockV6.astro', import.meta.url), 'utf8');
const bridge = fs.readFileSync(new URL('../src/components/XizongRecallEvidenceBridge.astro', import.meta.url), 'utf8');
const guard = fs.readFileSync(new URL('../src/components/XizongRuntimeStageGuard.astro', import.meta.url), 'utf8');
const controller = component.match(/<script define:vars=\{\{[\s\S]*?\}\}>\n([\s\S]*?)<\/script>/)[1].replace(/await import\(revisionRuntimeUrl\)/, '__revision');
const guardController = guard.match(/<script>\n([\s\S]*?)<\/script>/)[1].replace(/^  import[^\n]+\n/gm, '').replace('void learnerWriterReady.then', 'learnerWriterReady.then');
const evidenceController = bridge.match(/<script>\n([\s\S]*?)<\/script>/)[1].replace(/  import[^\n]+\n/, '').replace('void learnerWriterReady.then', 'learnerWriterReady.then');
const frontmatter = component.split('---')[1].replace(/^import [^\n]+\n/gm, '').replace('import.meta.env.BASE_URL', "'/'");
const runtimeVars = component.match(/<script define:vars=\{\{([\s\S]*?)\}\}>/)[1];
function propsFor(block) {
  return vm.runInNewContext(`${frontmatter}\n({${runtimeVars}})`, { Astro: { props: { block } }, revisionRuntimeUrl: '' });
}
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
const systemId = 'digestive-metabolic-endocrine-tumor';
const nativeSystem = loadXizongSystem(systemId);
const semantic = loadXizongSemanticSystem(systemId);
assert.equal(semantic.blocks.length, 38);
assert.equal(semantic.blocks.reduce((sum, block) => sum + block.logicGroups.length, 0), 170);
const nativeBlocks = nativeSystem.blocks.map(ref => {
  const block = buildXizongProductionBlock(loadXizongBlock(systemId, ref.slug));
  const learnerObject = buildXizongLearnerObject({ block });
  learnerObject.revisionWitness = buildXizongRevisionWitness(learnerObject);
  return { ...block, learnerObject };
});
const ids = new Set(nativeBlocks.flatMap(block => block.kpRecords.map(kp => kp.kpId)));
assert.equal(ids.size, 600);
assert.ok(ids.has('digestive-d1-kp01') && ids.has('digestive-d05-kp01') && ids.has('dme-d08-kp01') && ids.has('biochem-m1-kp01') && ids.has('dme-g01-kp01'));
assert.ok(!ids.has('dme-d01-kp01'));

async function createHarness(block, { saved, values: existing, props: overrides = {}, prerequisite = false, failOnBoot = false } = {}) {
  const props = { ...propsFor(block), ...overrides };
  const { sourcePerGroup, groupPayload, kpPayload } = props;
  const objectId = block.objectId;
  const stateKey = `kianos-xizong-astro-v2:${objectId}`;
  const evidenceKey = `kianos-xizong-memory-review-v2:${objectId}`;
  const laneKey = `kianos:xizong:biochemistry-source-lane:${systemId}:v1`;
  const root = new Element({ 'data-xizong-v6-block': '', 'data-study-object': objectId, 'data-block-label': block.label,
    'data-study-system-id': systemId, 'data-study-block-slug': block.slug, 'data-study-block-id': block.blockId,
    'data-study-source-hash': block.sourceHash, 'data-post-chat-recall-available': String(props.postChatRecallAvailable) });
  const add = (parent, attrs, hidden = false) => { const node = new Element(attrs, hidden); parent.append(node); return node; };
  add(root, { 'data-study-local-status': '' });
  const modelRequirements = props.sourceContactPayload?.requiredModelReadiness?.requirements || [];
  const modelPanel = modelRequirements.length ? add(root, { 'data-required-model-readiness': '' }) : null;
  const modelList = modelPanel ? add(modelPanel, { 'data-required-model-list': '' }) : null;
  if (modelList) modelList.textContent = modelRequirements.map(row => `${row.label}: ${row.modelPrompt}`).join('\n');
  const modelConfirm = modelPanel ? add(modelPanel, { 'data-required-model-confirm': '' }) : null;
  const holdNotice = add(root, { 'data-independent-readiness-hold': '' }, true);
  const heldReferences = (props.sourceContactPayload?.independentReadinessGates || []).filter(gate => gate.status === 'HOLD_SOURCE_CONFLICT').map(gate => {
    const node = add(root, { 'data-held-source-reference': '', 'data-held-group': gate.logicGroupIds[0] }, true);
    node.textContent = gate.note;
    const reference = add(node, { 'data-held-current-reference': '' });
    reference.textContent = block.kpRecords.filter(kp => gate.kpIds.includes(kp.kpId)).map(kp => `${kp.title}\n${kp.prompt}\n${kp.detailMarkdown}`).join('\n');
    return { node, reference };
  });


  const stages = Object.fromEntries(['block_learn', sourcePerGroup ? 'kp_learn' : 'source_contact', 'logic_group', 'kp_recall', 'ttsx_checkpoint', 'block_recall'].map(name => [name, add(root, { 'data-study-stage': name }, name !== 'block_learn')]));
  const entry = add(stages.block_learn, { 'data-post-chat-recall': '' });
  const sourceEntry = add(stages[sourcePerGroup ? 'kp_learn' : 'source_contact'], { 'data-post-chat-recall': '' });
  const lectureEntry = add(stages.block_learn, { 'data-stage-next': 'logic_group' });
  const enterGroup = add(stages.logic_group, { 'data-enter-group': '' });
  const sourceReturn = add(stages.kp_recall, { 'data-stage-target': 'source_contact' });
  const recallTarget = add(root, { 'data-stage-target': 'kp_recall' });
  const confirmSource = sourcePerGroup ? add(stages.kp_learn, { 'data-group-lecture-done': '' }) : null;
  const groupButtons = groupPayload.map((_, i) => add(root, { 'data-group-target': String(i) }));
  const outlineButtons = groupPayload.map((_, i) => add(root, { 'data-outline-open': String(i) }));
  const prev = add(stages.kp_recall, { 'data-recall-prev': '' });
  const next = add(stages.kp_recall, { 'data-recall-next': '' });
  const cards = kpPayload.map((kp, i) => {
    const card = add(stages.kp_recall, { 'data-kp-recall-card': String(i), 'data-kp-id': kp.kpId }, i !== 0);
    add(card, { tag: 'h3' }).textContent = kp.title;
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
  const evidenceBridge = new Element({ 'data-xizong-recall-evidence-bridge': '', 'data-study-object': objectId, 'data-study-source-hash': block.sourceHash });
  const evidenceKps = new Element({ 'data-xizong-recall-evidence-kps': '' }); evidenceKps.textContent = JSON.stringify(kpPayload.map(kp => kp.kpId));
  const completionInput = new Element({ 'data-xizong-completion-input': '' });
  completionInput.textContent = JSON.stringify({ blockId: block.blockId, blockIds: [], requiredModelReadiness: props.sourceContactPayload?.requiredModelReadiness || null, independentReadinessGates: props.sourceContactPayload?.independentReadinessGates || [], blockPrerequisites: prerequisite ? [{ blockId: 'missing', requirement: null }] : [],
    blockingVisualGroups: groupPayload.filter(group => group.visualRequired && /GAP/i.test(group.visualSourceState)).map(group => ({ ...group, reviewableFromOriginalSource: /GAP.*NOT_MOUNTED/i.test(group.visualSourceState) })), requirements: [] });
  const document = new Element(); document.append(root, evidenceBridge, evidenceKps, completionInput);
  document.getElementById = () => null; // These stage fixtures have no knowledge deep link.
  document.createElement = () => new Element(); document.createTextNode = text => { const el = new Element(); el.textContent = text; return el; };
  const values = new Map(existing || []); if (saved) values.set(stateKey, JSON.stringify(saved));
  let failKey = failOnBoot ? stateKey : null;
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { if (key === failKey) throw new Error('synthetic write failure'); values.set(key, value); } };
  const timers = []; const dispatched = [];
  const window = new Element(); window.__kianosLearnerWriterReady = Promise.resolve(); window.setTimeout = callback => timers.push(callback);
  const eventDispatch = window.dispatchEvent.bind(window);
  window.dispatchEvent = event => { dispatched.push(event); return eventDispatch(event); };
  class CustomEvent { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } }
  const context = vm.createContext({ ...props, window, document, location:{hash:''}, localStorage: storage, sessionStorage: { getItem: () => null, setItem: () => {} }, HTMLElement: Element, HTMLDetailsElement: Element, Element, CustomEvent, __revision: revision,
    learnerWriterReady: Promise.resolve(), sourceContactCompatible: revision.sourceContactCompatible, revisionRequiresAction: revision.revisionRequiresAction, needsFreshKpRecall: revision.needsFreshKpRecall, inspectXizongBlockCompletion });
  await vm.runInContext(controller, context);
  await vm.runInContext(guardController, context);
  await vm.runInContext(evidenceController, context);
  return { block, props, root, modelPanel, modelList, modelConfirm, holdNotice, heldReferences, entry, sourceEntry, lectureEntry, enterGroup, sourceReturn, recallTarget, confirmSource, groupButtons, outlineButtons, prev, next, cards, stages, recallReveal, recallAnswer, recallComplete, complete, ttsxDone, dispatched, values, stateKey, evidenceKey,
    state: () => JSON.parse(values.get(stateKey)), evidence: () => JSON.parse(values.get(evidenceKey)),
    flush: () => { while (timers.length) timers.shift()(); }, fail: key => { failKey = key; },
    lane: unitIds => { values.set(laneKey, JSON.stringify({ schema: 'kianos.xizong.biochemistry-source-lane-state.v1', history: unitIds.map(id => ({ source_hash: block.sourceContact.sourceLaneHash, source_unit_id: id })) })); window.dispatchEvent({ type: 'storage', key: laneKey }); } };
}
function noContact(h) {
  const state = h.state();
  assert.deepEqual(state.learned, {}); assert.notEqual(state.sourceContactDone, true);
  assert.equal((state.sourceContactEvidence || []).length, 0); assert.deepEqual(state.ttsxEvidence, {});
  assert.equal(state.blockRecallDone, false); assert.equal(state.completed, false);
  assert.equal(h.dispatched.filter(event => event.type === 'kianos:xizong-block-complete').length, 0);
}
function rate(h, index, value = 'known') { h.cards[index].reveal.click(); h.cards[index].buttons[value].click(); }
function confirmModels(h) { h.modelConfirm?.click(); }
function cleanFront(h) { const card = h.cards[h.state().kpIndex]; assert.equal(card.answer.hidden, true); assert.equal(card.rating.hidden, true); }

if (process.env.XIZONG_B_POSTCHAT_HARNESS_ONLY !== '1') {
let retrieved = 0; let held = 0;
for (const block of nativeBlocks) {
  const props = propsFor(block);
  assert.equal(props.guardedPostChatBlock, true, block.blockId);
  assert.equal(props.postChatRecallAvailable, true, `${block.blockId}:${block.sourceContact.mode}`);
  assert.equal(props.sourcePerGroup, block.blockId.startsWith('D'));
  assert.deepEqual(clone(props.groupPayload.map(group => group.groupId)), block.logicGroups.map(group => group.groupId));
  const heldGroups = new Set(block.sourceContact.independentReadinessGates.flatMap(gate => gate.logicGroupIds));
  const freeGroupIndices = block.logicGroups.map((group, i) => heldGroups.has(group.groupId) ? -1 : i).filter(i => i >= 0);
  const fresh = await createHarness(block); const initialEvidence = fresh.evidence();
  if (props.sourceContactPayload.requiredModelReadiness.requirements.length) {
    fresh.entry.click(); assert.equal(fresh.state().stage, 'block_learn'); assert.equal(fresh.state().recallEntryMode, undefined);
    assert.equal(fresh.state().requiredModelContinuation, undefined); noContact(fresh);
    for (const row of props.sourceContactPayload.requiredModelReadiness.requirements) assert.ok(fresh.modelList.textContent.includes(row.modelPrompt));
  }
  confirmModels(fresh);
  if (!freeGroupIndices.length) {
    for (let index = 0; index < block.logicGroups.length; index += 1) {
      fresh.groupButtons[index].click(); fresh.entry.click();
      assert.equal(fresh.state().stage, 'logic_group'); assert.equal(fresh.holdNotice.hidden, false);
      const kpIndex = block.kpRecords.findIndex(kp => kp.kpId === block.logicGroups[index].kpIds[0]);
      rate(fresh, kpIndex); assert.deepEqual(fresh.state().ratings, {});
    }
    held += block.kpRecords.length; noContact(fresh); continue;
  }
  const firstGroupIndex = freeGroupIndices[0]; const lastGroupIndex = freeGroupIndices.at(-1);
  const start = block.kpRecords.findIndex(kp => kp.kpId === block.logicGroups[firstGroupIndex].kpIds[0]);
  fresh.groupButtons[firstGroupIndex].click(); fresh.entry.click();
  assert.equal(fresh.state().stage, 'kp_recall'); assert.equal(fresh.state().recallEntryMode, 'POST_CHAT_RECALL');
  assert.equal(revision.studyHasEvidence(fresh.state()), false); assert.deepEqual(fresh.evidence(), initialEvidence); noContact(fresh); cleanFront(fresh);
  fresh.cards[start].buttons.known.click(); assert.deepEqual(fresh.state().ratings, {});
  const hidden = (start + 1) % block.kpRecords.length;
  fresh.cards[hidden].reveal.click(); assert.equal(fresh.cards[hidden].answer.hidden, true); fresh.cards[hidden].buttons.known.click();
  assert.equal(fresh.evidence().evidenceHistory.length, 0);
  fresh.cards[start].reveal.click(); fresh.cards[start].buttons.invalid.click(); assert.equal(fresh.evidence().evidenceHistory.length, 0);
  fresh.cards[start].buttons.known.click(); fresh.cards[start].buttons.known.click(); fresh.flush();
  assert.equal(fresh.evidence().evidenceHistory.length, 1); assert.equal(fresh.evidence().evidenceHistory[0].evidence_origin, 'USER_RECALL_ATTEMPT'); noContact(fresh);
  const resumed = await createHarness(block, { values: fresh.values });
  assert.equal(resumed.state().resumeKpId, fresh.state().resumeKpId); cleanFront(resumed);
  resumed.next.click(); resumed.prev.click(); cleanFront(resumed);
  resumed.groupButtons[lastGroupIndex].click(); assert.equal(resumed.state().stage, 'kp_recall'); assert.equal(resumed.state().resumeGroupId, block.logicGroups[lastGroupIndex].groupId);
  resumed.outlineButtons[firstGroupIndex].click(); resumed.enterGroup.click(); assert.equal(resumed.state().stage, 'kp_recall'); cleanFront(resumed);
  resumed.cards[resumed.state().kpIndex].reveal.click(); resumed.entry.click(); cleanFront(resumed);
  resumed.sourceReturn.click();
  assert.equal(resumed.state().stage, props.sourcePerGroup ? 'kp_learn' : 'source_contact'); assert.equal(resumed.state().recallEntryMode, undefined);
  resumed.recallTarget.click(); assert.notEqual(resumed.state().stage, 'kp_recall', 'Source return clears bypass');
  const sourceResumed = await createHarness(block, { values: resumed.values });
  assert.equal(sourceResumed.state().stage, props.sourcePerGroup ? 'kp_learn' : 'source_contact'); assert.equal(sourceResumed.state().recallEntryMode, undefined);
  sourceResumed.sourceEntry.click(); assert.equal(sourceResumed.state().stage, 'kp_recall'); noContact(sourceResumed);
  const prerequisite = await createHarness(block, { prerequisite: true }); confirmModels(prerequisite); prerequisite.entry.click(); assert.equal(prerequisite.state().stage, 'block_learn'); noContact(prerequisite);
  for (const available of [false, true]) {
    const stale = await createHarness(block, { props: { postChatRecallAvailable: available }, saved: { ...fresh.state(), ratings: {}, learned: {}, recallEntryMode: available ? 'UNKNOWN_MODE' : 'POST_CHAT_RECALL' } });
    assert.equal(stale.state().recallEntryMode, undefined); rate(stale, stale.state().kpIndex); assert.deepEqual(stale.state().ratings, {}); noContact(stale);
  }
  const normal = await createHarness(block); confirmModels(normal); normal.groupButtons[firstGroupIndex].click(); normal.lectureEntry.click();
  assert.equal(normal.state().stage, props.sourcePerGroup ? 'kp_learn' : 'source_contact');
  normal.recallTarget.click(); assert.notEqual(normal.state().stage, 'kp_recall'); noContact(normal);
  if (props.sourcePerGroup) {
    normal.confirmSource.click(); assert.equal(normal.state().stage, 'kp_recall');
    assert.deepEqual(Object.keys(normal.state().learned), block.logicGroups[firstGroupIndex].kpIds);
    assert.equal(normal.state().sourceContactEvidence[0].segment_id, `source:${block.logicGroups[firstGroupIndex].groupId}`);
    rate(normal, normal.state().kpIndex); assert.equal(normal.evidence().evidenceHistory.length, 1);
  } else {
    const map = JSON.parse(fs.readFileSync(path.join(repoRoot, 'content/xizong/knowledge/learner/biochemistry-27-source-map.json')));
    const supportOnly = map.source_units.filter(unit => unit.canonical_content.some(row => row.block === block.blockId) && !unit.canonical_content.some(row => row.block === block.blockId && row.role.startsWith('PRIMARY'))).map(unit => unit.id);
    normal.lane(supportOnly); noContact(normal);
    normal.lane(block.sourceContact.segments.map(segment => segment.sourceUnitId));
    assert.equal(normal.state().sourceContactDone, true); assert.equal(Object.keys(normal.state().learned).length, block.kpRecords.length);
    assert.ok(normal.state().sourceContactEvidence.every(row => row.coverage_kind === 'GLOBAL_BIOCHEMISTRY_SOURCE_UNIT'));
    normal.groupButtons[0].click(); rate(normal, normal.state().kpIndex); assert.equal(normal.evidence().evidenceHistory.length, 1);
  }
  const traversal = await createHarness(block); confirmModels(traversal);
  for (let index = 0; index < block.logicGroups.length; index += 1) {
    const group = block.logicGroups[index]; traversal.groupButtons[index].click(); traversal.entry.click();
    if (heldGroups.has(group.groupId)) {
      held += group.kpIds.length; assert.equal(traversal.state().stage, 'logic_group');
      const before = clone(traversal.state().ratings); rate(traversal, traversal.state().kpIndex); assert.deepEqual(traversal.state().ratings, before);
      continue;
    }
    for (const kpId of group.kpIds) { assert.equal(traversal.state().resumeKpId, kpId); rate(traversal, traversal.state().kpIndex); traversal.flush(); retrieved += 1; }
  }
  assert.equal(Object.keys(traversal.state().ratings).length, block.logicGroups.filter(group => !heldGroups.has(group.groupId)).reduce((sum, group) => sum + group.kpIds.length, 0));
  traversal.recallReveal.click(); traversal.recallComplete.click(); traversal.complete.click();
  assert.equal(traversal.recallAnswer.hidden, true); assert.equal(traversal.complete.disabled, true); noContact(traversal);
}
assert.equal(retrieved + held, 600);

// Full failure/TTSX/revision/visual regressions on native D/M/G representatives.
for (const id of ['D1', 'M1', 'G1']) {
  const block = nativeBlocks.find(row => row.blockId === id);
  for (const evidenceFailure of [false, true]) {
    const failed = await createHarness(block); confirmModels(failed); failed.entry.click(); const before = failed.state();
    failed.fail(evidenceFailure ? failed.evidenceKey : failed.stateKey); rate(failed, 0); failed.flush();
    assert.deepEqual(failed.state(), before); assert.equal(failed.root.inert, true); assert.equal(failed.root.dataset.xizongStateBlocked, 'true');
    assert.equal(failed.evidence().evidenceHistory.length, evidenceFailure ? 0 : 1); noContact(failed);
    rate(failed, 0); failed.flush(); assert.equal(failed.evidence().evidenceHistory.length, evidenceFailure ? 0 : 1);
  }
  const failed = await createHarness(block); confirmModels(failed); const before = failed.state(); failed.fail(failed.stateKey); failed.entry.click(); assert.deepEqual(failed.state(), before); assert.equal(failed.evidence().evidenceHistory.length, 0);
  const checkpoint = { checkpointId: 'synthetic-reviewed', logicGroupId: block.logicGroups[0].groupId, label: 'Reviewed boundary fixture', questionRows: [] };
  const pending = await createHarness(block, { props: { ttsxPayload: [checkpoint] }, saved: { ...before, stage: 'ttsx_checkpoint', pendingTtsx: { key: checkpoint.checkpointId, checkpointIds: [checkpoint.checkpointId], questionRows: [] } } });
  pending.entry.click(); assert.equal(pending.state().stage, 'ttsx_checkpoint'); assert.deepEqual(pending.state().ttsxEvidence, {});
  pending.ttsxDone.click(); assert.equal(pending.state().stage, 'kp_recall'); assert.equal(Object.keys(pending.state().ttsxEvidence).length, 1);
  // Positive control: actual corresponding Source plus every Recall still closes.
  const complete = await createHarness(block); confirmModels(complete);
  if (complete.props.sourcePerGroup) {
    for (let index = 0; index < block.logicGroups.length; index += 1) {
      complete.groupButtons[index].click(); complete.confirmSource.click();
    }
  } else complete.lane(block.sourceContact.segments.map(segment => segment.sourceUnitId));
  assert.equal(complete.state().sourceContactDone, true);
  complete.groupButtons[0].click(); complete.entry.click();
  for (const kpId of block.logicGroups.flatMap(group => group.kpIds)) {
    assert.equal(complete.state().resumeKpId, kpId); rate(complete, complete.state().kpIndex); complete.flush();
  }
  complete.recallReveal.click(); complete.recallComplete.click(); complete.complete.click();
  assert.equal(complete.state().blockRecallDone, true); assert.equal(complete.state().completed, true);
  assert.equal(complete.dispatched.filter(event => event.type === 'kianos:xizong-block-complete').length, 1);
  assert.equal(inspectXizongBlockCompletion(block.learnerObject, complete.state()).complete, true);

  const changed = clone(block); changed.learnerObject.revisionWitness.kps[block.kpRecords[0].kpId] = 'changed-current-core';
  const recalled = await createHarness(block); confirmModels(recalled); recalled.entry.click(); rate(recalled, 0); recalled.flush();
  const revised = await createHarness(changed, { values: recalled.values }); assert.equal(revision.needsFreshKpRecall(revised.state(), block.kpRecords[0].kpId), true); assert.equal(revised.state().completed, false);
}

// Non-contiguous formation remains partial until the true final global unit.
for (const id of ['M1', 'G1', 'G5']) {
  const block = nativeBlocks.find(row => row.blockId === id); const h = await createHarness(block); confirmModels(h);
  const units = block.sourceContact.segments.map(segment => segment.sourceUnitId);
  h.lane(units.slice(0, -1));
  assert.notEqual(h.state().sourceContactDone, true); assert.ok(Object.keys(h.state().learned).length < block.kpRecords.length);
  assert.equal(inspectXizongBlockCompletion(block.learnerObject, h.state()).complete, false);
  const firstFormed = block.logicGroups.findIndex(group => group.kpIds.every(kpId => h.state().learned[kpId]));
  if (firstFormed >= 0) { h.groupButtons[firstFormed].click(); assert.equal(h.state().stage, 'kp_recall'); }
  h.lane(units); assert.equal(h.state().sourceContactDone, true);
}

{
  const block = nativeBlocks.find(row => row.blockId === 'D13');
  const props = propsFor(block); props.groupPayload[0].visualRequired = true; props.groupPayload[0].visualSourceState = 'GAP_NOT_MOUNTED';
  const visual = await createHarness(block, { props }); confirmModels(visual); visual.entry.click();
  for (const kpId of block.logicGroups.flatMap(group => group.kpIds)) { assert.equal(visual.state().resumeKpId, kpId); rate(visual, visual.state().kpIndex); visual.flush(); }
  assert.equal(visual.state().stage, 'kp_learn'); assert.equal(visual.state().recallEntryMode, undefined);
  visual.recallReveal.click(); visual.recallComplete.click(); visual.complete.click(); noContact(visual);
}

// Product components consume the compiled capability. Source geometry and identity
// remain validated upstream by the semantic adapter / ProductionBlock builders.
for (const block of nativeBlocks) {
  const props = propsFor(block);
  assert.equal(props.postChatRecallAvailable, true, block.blockId);
  assert.equal(block.learnerObject.capabilities.postChatRecall, true, block.blockId);
}
assert.doesNotMatch(component, /systemId === 'digestive-metabolic-endocrine-tumor'|systemCanonicalId === 'B'/);
writeBTestProof('xizong-b-post-chat-recall', {
  coverage: { blocks: 38, logicGroups: 170, nativeKps: 600, retrievableKps: retrieved, heldKps: held,
    wholeLogicGroupBlocks: 23, globalBiochemistryBlocks: 15, requiredModelBlocks: nativeBlocks.filter(block => block.sourceContact.requiredModelReadiness.requirements.length).length },
  heldScopes: nativeBlocks.flatMap(block => block.sourceContact.independentReadinessGates.map(gate => ({ blockId: block.blockId, status: gate.status, logicGroupIds: gate.logicGroupIds }))),
  checks: ['native Source shapes and exact identifiers', 'explicit actual target-model confirmation', 'entry has no Source/Recall/completion evidence', 'same-card Reveal and explicit bounded rating', 'hidden/unrevealed/invalid/duplicate rejection', 'save/reload/resume/previous-next/group and programmatic outline', 'Source-return clears B bypass', 'source-first whole-LG and global primary coverage', 'global support/JIT exclusion and final non-contiguous closure', 'failed saves never advance', 'reviewed TTSX remains pending', 'stale KP revision remains pending', 'current formal completion positive and source-free negative'],
  visualScope: 'Native B visual metadata preserved. Existing required-visual guard is additionally tested only with an explicitly hypothetical fixture; no mounted-image/original-pixel claim.'
}, nativeBlocks.flatMap(block => [block.sourcePath, block.cognitiveProjection.assetPath].filter(Boolean)));
console.log(`B native retrieval coverage: ${retrieved} retrievable KPs + ${held} correctly held Tumor/Source-conflict KPs = 600`);
console.log('B post-Chat native controller PASS | exact 38 Blocks / 170 LGs / 600 KPs | D whole-LG, M/G global27 | source-first/support-exclusion/entry/no-evidence/save/reload/resume/outline/reveal/rating/failure/TTSX/visual/completion | browser/U=NOT_TESTED');

}
export { createHarness, nativeBlocks, propsFor, noContact, rate, confirmModels, cleanFront };
