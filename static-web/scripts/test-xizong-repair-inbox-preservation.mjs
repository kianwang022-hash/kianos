import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { XIZONG_CHAT_RETURN_SCHEMA, XIZONG_CHAT_RETURN_PREFIX, buildXizongChatHandoff, writeXizongChatHandoff, applyXizongChatReturn } from '../src/lib/xizongChatReturn.mjs';
import { XIZONG_MEMORY_STORAGE_KEY, createXizongMemoryState, readXizongMemoryStorage, setRepairTasks, completeRepairTask, selectMemoryView } from '../src/lib/xizongMemoryModel.mjs';
import { XIZONG_SYSTEM_WU_RETURN_SCHEMA, applyXizongSystemWuReturn, validateXizongSystemWuReturn } from '../src/lib/xizongSystemWuReturn.mjs';
import { stageXizongChatReturn, consumePendingXizongChatReturnForObject, pendingXizongChatReturnForObject } from '../src/lib/xizongPendingChatReturn.mjs';

const bridgeSource = fs.readFileSync(new URL('../src/components/XizongRepairInboxBridge.astro', import.meta.url), 'utf8');
const workspaceSource = fs.readFileSync(new URL('../src/components/XizongMemoryWorkspace.astro', import.meta.url), 'utf8');
const bridgeScript = bridgeSource.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace(/import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];\s*/g, '');
const showRepairScript = workspaceSource.slice(workspaceSource.indexOf('    const showRepair = '), workspaceSource.indexOf('    const makeQueueButton = ')) + '\nshowRepair(item);';
const NOW = Date.parse('2026-10-01T05:00:00.000Z');
const RETURN_HREF = '/xizong/synthetic-system/synthetic-block/?resume=synthetic#synthetic-kp';
const OBJECT = 'xizong:synthetic-block';
const INBOX = 'kianos-xizong-repair-inbox-v1:' + OBJECT;
const TASK = 'repair:block-chat:synthetic-block:synthetic-kp';

class Storage {
  map = new Map(); writes = []; failRemove = false; failSet = false;
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { if (this.failSet && key === XIZONG_MEMORY_STORAGE_KEY) { this.failSet = false; throw new Error('synthetic memory fault'); } this.writes.push({ op: 'set', key }); this.map.set(key, String(value)); }
  removeItem(key) { if (this.failRemove && key === INBOX) { this.failRemove = false; throw new Error('synthetic removal fault'); } this.writes.push({ op: 'remove', key }); this.map.delete(key); }
  snapshot() { return Object.fromEntries([...this.map].sort(([a], [b]) => a.localeCompare(b))); }
}

function fixture({ withCard = true, decision = 'REPAIR' } = {}) {
  const storage = new Storage();
  const memory = createXizongMemoryState();
  if (withCard) memory.cards['core:synthetic-kp'] = { id: 'core:synthetic-kp', family: 'CORE', kpId: 'synthetic-kp', blockId: 'synthetic-block', systemId: 'synthetic-system', prompt: 'Synthetic prompt', coreHtml: '<p>Synthetic context only.</p>' };
  memory.repairTasks = [{ id: 'unrelated:synthetic-task', kpId: 'other-kp', blockId: 'other-block', systemId: 'other-system', cardId: '', status: 'DONE', completedAt: '2026-09-30T00:00:00.000Z', createdAt: '2026-09-29T00:00:00.000Z', title: 'Unrelated synthetic task', reason: 'Synthetic', action: 'Synthetic', origin: 'CHAT_OR_QUESTION_REPAIR', sourceQuestionIds: [], blockHref: '/other/', returnHref: '/other/' }];
  memory.evidence = [{ id: 'synthetic-evidence', cardId: 'core:synthetic-kp', rating: 'fuzzy', at: '2026-09-30T00:00:00.000Z' }];
  storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(setRepairTasks(memory, memory.repairTasks)));
  const packet = {
    schema: 'kianos.xizong.study_packet.v3',
    current: { object_id: OBJECT, system_id: 'synthetic-system', block_id: 'synthetic-block', block_label: 'Synthetic Block', source_hash: 'synthetic-current-hash' },
    learning_state: { current_stage: 'kp_recall', resume: { group_index: 0, logic_group_id: 'synthetic-lg', kp_index: 0, kp_id: 'synthetic-kp', source_locator: 'synthetic-locator' }, learned_kp_ids: ['synthetic-kp'], recall_ratings: { 'synthetic-kp': 'fuzzy' }, block_recall_done: false, block_complete: false },
    kp_evidence: [{ kp_id: 'synthetic-kp' }], block_evidence_history: [], memory: { active_repairs: [] },
    practice: { wrong_uncertain: [{ question_id: 'synthetic-question-1900', status: 'wrong', submitted_at: '2026-09-30T23:59:00.000Z' }], marked_question_ids: [] }
  };
  const handoff = buildXizongChatHandoff(packet, { returnHref: RETURN_HREF, now: NOW, makeId: () => 'synthetic-handoff' });
  writeXizongChatHandoff(storage, handoff);
  const envelope = { schema: XIZONG_CHAT_RETURN_SCHEMA, return_id: 'synthetic-return', handoff_id: handoff.handoff_id, origin: handoff.origin, resume: handoff.resume, decision, repairs: decision === 'REPAIR' ? [{ kp_id: 'synthetic-kp', reason: 'Synthetic bounded reason', action: 'Synthetic bounded action', priority: 'high', source_question_ids: ['synthetic-question-1900'] }] : [] };
  const apply = () => applyXizongChatReturn(storage, envelope, { currentPacket: packet, now: NOW + 1000 });
  return { storage, packet, handoff, envelope, apply };
}

async function runBridge(storage, { allowed = ['synthetic-kp'] } = {}) {
  const events = [], errors = [], timers = [], handlers = new Map();
  class HTMLElement { constructor(attrs) { this.attrs = attrs; } getAttribute(k) { return this.attrs[k] ?? null; } }
  const marker = new HTMLElement({ 'data-object-id': OBJECT, 'data-block-id': 'synthetic-block', 'data-system-id': 'synthetic-system', 'data-block-label': 'Synthetic Block' });
  const document = { querySelector(selector) { return selector === '[data-xizong-repair-inbox-bridge]' ? marker : selector === '[data-repair-inbox-kp-ids]' ? { textContent: JSON.stringify(allowed) } : null; } };
  const window = { dispatchEvent(e) { events.push(e); }, setTimeout(callback) { timers.push(callback); }, addEventListener(type, callback) { handlers.set(type, callback); } };
  vm.runInNewContext(bridgeScript, { XIZONG_MEMORY_STORAGE_KEY, readXizongMemoryStorage, setRepairTasks, validateXizongSystemWuReturn, learnerWriterReady: Promise.resolve(), document, window, HTMLElement, localStorage: storage, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } }, console: { error(e) { errors.push(String(e)); } } }, { filename: 'actual-XizongRepairInboxBridge-script.js' });
  await Promise.resolve();
  assert.equal(timers.length, 1, 'actual writer-ready callback scheduled its migration');
  timers.shift()();
  return { events, errors, handlers };
}

function repairUI(state, item) {
  class HTMLAnchorElement { hidden = true; href = ''; }
  const blockLink = new HTMLAnchorElement(), returnLink = new HTMLAnchorElement();
  const texts = {};
  vm.runInNewContext(showRepairScript, { state, item, card: {}, markedCard: {}, repairCard: {}, empty: {}, q: s => s === '[data-repair-block-link]' ? blockLink : s === '[data-repair-return-link]' ? returnLink : null, setText: (s, text) => texts[s] = text, repairPriorityLabel: x => x, repairOriginLabel: x => x, cardLabel: x => x.id || '', cardContext: x => x.blockId || '', HTMLAnchorElement }, { filename: 'actual-MemoryWorkspace-showRepair.js' });
  return { blockLink: { hidden: blockLink.hidden, href: blockLink.href }, returnLink: { hidden: returnLink.hidden, href: returnLink.href }, texts };
}
const task = storage => readXizongMemoryStorage(storage).repairTasks.find(x => x.id === TASK);
const results = { baseline: 'ffab1c3687c106686cb0969d2a450213fa895914', method: 'native Return/Memory ESM functions + entire actual inbox bridge script with only imports replaced by bindings; exact Memory showRepair body; synthetic storage/DOM/writer-ready/timers', scenarios: [] };

{
  const f = fixture();
  stageXizongChatReturn(f.storage, f.envelope, { now: NOW, studyDay: '2026-10-01' });
  const enhancerSource = fs.readFileSync(new URL('../src/components/XizongStudyEnhancer.astro', import.meta.url), 'utf8');
  const consumer = enhancerSource.slice(enhancerSource.indexOf('    const consumePendingReturn = '), enhancerSource.indexOf("    window.addEventListener('kianos:private-control-consumed'")) + '\nconsumePendingReturn();';
  const timers = [], events = [], packetStatus = {}; let reloads = 0;
  const result = vm.runInNewContext(consumer, { buildStudyPacket: () => f.packet, consumePendingXizongChatReturnForObject, localStorage: f.storage, objectId: OBJECT, studyDayAt: () => '2026-10-01', Date: class extends Date { static now() { return NOW + 1000; } }, packetStatus, window: { setTimeout: callback => timers.push(callback), location: { reload() { reloads += 1; } }, dispatchEvent: event => events.push(event) }, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } } }, { filename: 'actual-StudyEnhancer-consumePendingReturn.js' });
  assert.equal(result.status, 'applied'); assert.equal(result.receipt.status, 'APPLIED'); assert.equal(pendingXizongChatReturnForObject(f.storage, OBJECT), null); assert.equal(task(f.storage).returnHref, RETURN_HREF);
  assert.equal(timers.length, 1); timers[0](); assert.equal(reloads, 1);
  const before = task(f.storage); await runBridge(f.storage); const after = task(f.storage);
  assert.deepEqual(after, before); assert.equal(after.returnHref, RETURN_HREF); assert.equal(after.cardId, 'core:synthetic-kp'); assert.equal(f.storage.getItem(INBOX), null);
  results.scenarios.push({ name: 'Native staged Return -> actual StudyEnhancer consumer -> requested reload -> actual Block bridge', outcome: 'PASS_NORMAL_FLOW_PRESERVATION', before, after, pendingConsumed: true, actualConsumerRequestedReload: true, packetStatus: packetStatus.textContent });
}

{
  const f = fixture(); const first = f.apply(); const before = task(f.storage);
  const beforeState = readXizongMemoryStorage(f.storage), beforeUI = repairUI(beforeState, before);
  const inbox = JSON.parse(f.storage.getItem(INBOX));
  assert.equal(first.status, 'applied'); assert.equal(before.cardId, 'core:synthetic-kp'); assert.equal(before.blockHref, RETURN_HREF); assert.equal(before.returnHref, RETURN_HREF);
  assert.equal(beforeUI.blockLink.hidden, false); assert.equal(beforeUI.returnLink.hidden, false);
  assert.equal(inbox.returnHref, RETURN_HREF); assert.equal(inbox.plans[0].returnHref, undefined);
  const receiptBefore = f.storage.getItem(XIZONG_CHAT_RETURN_PREFIX + f.handoff.handoff_id);
  const memoryRaw = f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY), writesBeforeBridge = f.storage.writes.length;
  const migrated = await runBridge(f.storage), after = task(f.storage), afterState = readXizongMemoryStorage(f.storage), afterUI = repairUI(afterState, after);
  assert.equal(f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY), memoryRaw);
  assert.deepEqual(f.storage.writes.slice(writesBeforeBridge), [{ op: 'remove', key: INBOX }]);
  assert.deepEqual(after, before); assert.equal(after.cardId, 'core:synthetic-kp'); assert.equal(after.blockHref, RETURN_HREF); assert.equal(after.returnHref, RETURN_HREF);
  assert.deepEqual(afterUI, beforeUI); assert.equal(afterUI.blockLink.hidden, false); assert.equal(afterUI.returnLink.hidden, false); assert.equal(f.storage.getItem(INBOX), null); assert.equal(migrated.events.length, 1);
  assert.deepEqual(after.sourceQuestionIds, before.sourceQuestionIds); assert.equal(after.createdAt, before.createdAt); assert.equal(after.status, 'ACTIVE');
  assert.deepEqual(afterState.evidence, beforeState.evidence); assert.deepEqual(afterState.cards, beforeState.cards); assert.deepEqual(afterState.repairTasks.find(x => x.id.startsWith('unrelated:')), beforeState.repairTasks.find(x => x.id.startsWith('unrelated:')));
  assert.equal(f.storage.getItem(XIZONG_CHAT_RETURN_PREFIX + f.handoff.handoff_id), receiptBefore);
  const afterSnapshot = f.storage.snapshot(), writes = f.storage.writes.length;
  const replay = f.apply(); assert.equal(replay.status, 'already_applied'); assert.equal(replay.repair_tasks[0].returnHref, RETURN_HREF); assert.equal(f.storage.writes.length, writes); assert.deepEqual(f.storage.snapshot(), afterSnapshot);
  await runBridge(f.storage); assert.equal(f.storage.writes.length, writes); assert.deepEqual(f.storage.snapshot(), afterSnapshot);
  results.scenarios.push({ name: 'apply -> Block startup migration -> Memory display -> exact replay -> repeated startup', outcome: 'PASS_LINK_CARD_METADATA_PRESERVATION', before, inbox, after, beforeUI, afterUI, replayStatus: replay.status, receiptPreserved: true, unrelatedTaskCardsAndEvidencePreserved: true, repeatMigrationWrites: 0 });
}
{
  const f = fixture({ withCard: false }); f.apply(); const before = task(f.storage); await runBridge(f.storage); const after = task(f.storage);
  assert.equal(before.cardId, ''); assert.equal(before.returnHref, RETURN_HREF); assert.equal(after.returnHref, RETURN_HREF);
  results.scenarios.push({ name: 'No released Core card', outcome: 'PASS_LINK_PRESERVATION', before, after });
}
{
  const f = fixture(); const mounted = await runBridge(f.storage); assert.equal(mounted.events.length, 0);
  f.apply(); assert.equal(task(f.storage).returnHref, RETURN_HREF); assert.notEqual(f.storage.getItem(INBOX), null);
  await runBridge(f.storage); assert.equal(task(f.storage).returnHref, RETURN_HREF);
  results.scenarios.push({ name: 'Bridge mounts before same-document apply; later Block startup consumes leftover inbox', outcome: 'PASS_REENTRY_PRESERVATION', sameDocumentApplyLeavesInbox: true });
}
{
  const f = fixture(); const mounted = await runBridge(f.storage); f.apply();
  mounted.handlers.get('storage')({ key: INBOX, newValue: f.storage.getItem(INBOX) });
  assert.equal(task(f.storage).returnHref, RETURN_HREF); assert.equal(f.storage.getItem(INBOX), null);
  results.scenarios.push({ name: 'Existing Block bridge receives storage event after synthetic apply', outcome: 'PASS_LINK_PRESERVATION' });
}
{
  const f = fixture(); f.apply();
  f.storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(completeRepairTask(readXizongMemoryStorage(f.storage), TASK, NOW + 2000)));
  const before = task(f.storage); assert.equal(before.status, 'DONE');
  await runBridge(f.storage); const after = task(f.storage);
  assert.deepEqual(after, before); assert.equal(after.status, 'DONE'); assert.equal(after.completedAt, new Date(NOW + 2000).toISOString()); assert.equal(selectMemoryView(readXizongMemoryStorage(f.storage), 'REPAIR').items.some(x => x.id === TASK), false);
  results.scenarios.push({ name: 'Apply -> native Memory complete -> later Block migration', outcome: 'PASS_SAME_OCCURRENCE_COMPLETION_PRESERVATION', before, after });
}
{
  const f = fixture(); f.apply(); const before = f.storage.snapshot(); f.storage.failRemove = true;
  const attempted = await runBridge(f.storage); assert.deepEqual(f.storage.snapshot(), before); assert.equal(attempted.events.length, 0);
  results.scenarios.push({ name: 'Inbox removal failure', outcome: 'PASS_ROLLBACK_EXACT_STORAGE' });
}
{
  const f = fixture({ decision: 'NO_ACTION' }); f.apply(); const before = f.storage.snapshot(), writes = f.storage.writes.length;
  await runBridge(f.storage); assert.deepEqual(f.storage.snapshot(), before); assert.equal(f.storage.writes.length, writes);
  results.scenarios.push({ name: 'NO_ACTION', outcome: 'PASS_NO_MIGRATION_NO_WRITE' });
}
{
  const f = fixture(); f.apply(); const beforeMemory = f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY);
  const migrated = await runBridge(f.storage, { allowed: ['different-kp'] });
  assert.equal(f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY), beforeMemory); assert.equal(migrated.events.length, 0);
  results.scenarios.push({ name: 'Non-allowed KP inbox plans', outcome: 'PASS_MEMORY_UNCHANGED' });
}

function changeTask(storage, update) {
  const memory = readXizongMemoryStorage(storage);
  memory.repairTasks = memory.repairTasks.map(row => row.id === TASK ? { ...row, ...update } : row);
  storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(memory));
}
function changeInbox(storage, update) {
  const inbox = JSON.parse(storage.getItem(INBOX));
  storage.setItem(INBOX, JSON.stringify({ ...inbox, ...update }));
}
function legacyFixture({ importedAt = new Date(NOW).toISOString(), questions = [] } = {}) {
  const f = fixture();
  f.storage.setItem(INBOX, JSON.stringify({ importedAt, plans: [{
    kpId: 'synthetic-kp', reason: 'Legacy reason', action: 'Legacy action', priority: 'high',
    sourceQuestionIds: questions, blockHref: '/synthetic/block/', returnHref: '/synthetic/practice/'
  }] }));
  return f;
}
async function assertBlocked(storage, label) {
  const before = storage.snapshot(), writes = storage.writes.length;
  const result = await runBridge(storage);
  assert.deepEqual(storage.snapshot(), before, label);
  assert.equal(storage.writes.length, writes, label + ': no writes');
  assert.equal(result.events.length, 0, label + ': no success event');
  results.scenarios.push({ name: label, outcome: 'PASS_FAIL_CLOSED_STORAGE_UNCHANGED' });
}

// A matching inbox delivery must not normalize away any existing task data.
{
  const f = fixture(); f.apply();
  changeTask(f.storage, { title: 'Preserved title', privateMetadata: { note: 'synthetic only' } });
  const memory = readXizongMemoryStorage(f.storage);
  memory.repairTasks[0].privateMetadata = { unrelated: true };
  memory.promptOverrides = { 'synthetic-kp': 'Synthetic private prompt' };
  memory.marks = { 'synthetic-mark': { text: 'Synthetic mark' } };
  memory.attention = { 'core:synthetic-kp': { reason: 'Synthetic evidence' } };
  memory.releasedBlocks = { 'synthetic-block': { releasedAt: new Date(NOW - 5000).toISOString() } };
  f.storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(memory));
  const before = f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY);
  await runBridge(f.storage);
  assert.equal(f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY), before);
  results.scenarios.push({ name: 'Exact same occurrence preserves all native Memory bytes and additional metadata', outcome: 'PASS_NO_MEMORY_WRITE' });
}
{
  const f = fixture(); f.apply();
  changeTask(f.storage, { privateMetadata: { note: 'Preserve during sibling import' } });
  const before = task(f.storage), inbox = JSON.parse(f.storage.getItem(INBOX));
  changeInbox(f.storage, { plans: [...inbox.plans, { kpId: 'synthetic-kp-two', action: 'Synthetic sibling repair' }] });
  await runBridge(f.storage, { allowed: ['synthetic-kp', 'synthetic-kp-two'] });
  assert.deepEqual(task(f.storage), before);
  assert.equal(readXizongMemoryStorage(f.storage).repairTasks.filter(row => row.kpId === 'synthetic-kp-two').length, 1);
  results.scenarios.push({ name: 'Mixed same-occurrence delivery plus new sibling preserves the full existing task', outcome: 'PASS_MIXED_IMPORT_PRESERVATION' });
}
for (const questions of [[], ['synthetic-question-1900']]) {
  const f = legacyFixture({ questions }), before = readXizongMemoryStorage(f.storage);
  const result = await runBridge(f.storage);
  const state = readXizongMemoryStorage(f.storage), created = state.repairTasks.find(row => row.kpId === 'synthetic-kp');
  assert.equal(created.id, questions.length ? 'repair:system-wu:synthetic-system:synthetic-block:synthetic-kp' : 'repair:block-inbox:synthetic-block:synthetic-kp');
  assert.equal(created.status, 'ACTIVE'); assert.equal(created.createdAt, new Date(NOW).toISOString());
  assert.equal(created.blockHref, '/synthetic/block/'); assert.equal(created.returnHref, '/synthetic/practice/');
  assert.deepEqual(created.sourceQuestionIds, questions); assert.deepEqual(state.repairTasks[0], before.repairTasks[0]);
  assert.deepEqual(state.evidence, before.evidence); assert.equal(f.storage.getItem(INBOX), null); assert.equal(result.events.length, 1);
  const snapshot = f.storage.snapshot(), writes = f.storage.writes.length;
  await runBridge(f.storage); assert.deepEqual(f.storage.snapshot(), snapshot); assert.equal(f.storage.writes.length, writes);
  results.scenarios.push({ name: 'Legacy inbox-only creation: ' + (questions.length ? 'System W/U' : 'Block inbox'), outcome: 'PASS_CREATE_ONCE' });
}
{
  const f = legacyFixture({ importedAt: undefined });
  changeInbox(f.storage, { importedAt: '' });
  await runBridge(f.storage);
  assert(Number.isFinite(Date.parse(readXizongMemoryStorage(f.storage).repairTasks.at(-1).createdAt)));
  results.scenarios.push({ name: 'Legacy inbox without timestamp and without a task collision', outcome: 'PASS_EXISTING_CREATION_FALLBACK' });
}
{
  const f = fixture(); f.apply();
  changeInbox(f.storage, { importedAt: new Date(NOW + 3000).toISOString() });
  await assertBlocked(f.storage, 'A later envelope alone cannot replace the native task occurrence');
}
{
  const f = fixture(); f.apply(); const oldInbox = f.storage.getItem(INBOX);
  const nextPacket = JSON.parse(JSON.stringify(f.packet)); nextPacket.memory.active_repairs = [{ id: TASK }];
  const nextHandoff = buildXizongChatHandoff(nextPacket, { returnHref: RETURN_HREF, now: NOW + 2000, makeId: () => 'synthetic-handoff-new' });
  writeXizongChatHandoff(f.storage, nextHandoff);
  const nextEnvelope = { ...f.envelope, return_id: 'synthetic-return-new', handoff_id: nextHandoff.handoff_id, origin: nextHandoff.origin, resume: nextHandoff.resume };
  assert.equal(applyXizongChatReturn(f.storage, nextEnvelope, { currentPacket: nextPacket, now: NOW + 3000 }).status, 'applied');
  const newer = task(f.storage); assert.equal(newer.createdAt, new Date(NOW + 3000).toISOString());
  f.storage.setItem(INBOX, oldInbox);
  await assertBlocked(f.storage, 'Older leftover inbox cannot overwrite the newer native Return occurrence');
  assert.deepEqual(task(f.storage), newer);
}
for (const [label, mutate] of [
  ['Same timestamp with changed question membership', f => changeTask(f.storage, { sourceQuestionIds: ['different-synthetic-question'] })],
  ['Same ID with different system target', f => changeTask(f.storage, { systemId: 'different-system' })],
  ['Same ID with different KP target', f => changeTask(f.storage, { kpId: 'different-kp' })],
  ['Same ID with different Block target', f => changeTask(f.storage, { blockId: 'different-block' })],
  ['Same ID with different origin', f => changeTask(f.storage, { origin: 'CHAT_OR_QUESTION_REPAIR' })],
  ['Same ID with different diagnostic axis', f => changeTask(f.storage, { diagnosticAxis: 'DIFFERENT' })],
  ['Missing native occurrence timestamp', f => changeTask(f.storage, { createdAt: '' })],
  ['Invalid native occurrence timestamp', f => changeTask(f.storage, { createdAt: 'not-a-date' })],
  ['Missing inbox occurrence timestamp', f => changeInbox(f.storage, { importedAt: '' })],
  ['Invalid inbox occurrence timestamp', f => changeInbox(f.storage, { importedAt: 'not-a-date' })],
  ['Duplicate native same-ID tasks', f => { const memory = readXizongMemoryStorage(f.storage); memory.repairTasks.push({ ...task(f.storage) }); f.storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(memory)); }]
]) {
  const f = fixture(); f.apply(); mutate(f); await assertBlocked(f.storage, label);
}
for (const failure of ['failSet', 'failRemove']) {
  const f = legacyFixture(); const before = f.storage.snapshot(); f.storage[failure] = true;
  const failed = await runBridge(f.storage);
  assert.deepEqual(f.storage.snapshot(), before); assert.equal(failed.events.length, 0);
  const retry = await runBridge(f.storage); assert.equal(retry.events.length, 1); assert.equal(f.storage.getItem(INBOX), null);
  assert.equal(readXizongMemoryStorage(f.storage).repairTasks.filter(row => row.kpId === 'synthetic-kp').length, 1);
  results.scenarios.push({ name: 'Legacy inbox transaction ' + failure + ' rollback and retry', outcome: 'PASS_ATOMIC_ROLLBACK_AND_RETRY' });
}
{
  const f = fixture(); f.apply(); f.storage.setItem(XIZONG_MEMORY_STORAGE_KEY, '{corrupt');
  await assertBlocked(f.storage, 'Unreadable existing Memory cannot be replaced with an empty library');
}
{
  const f = fixture();
  const questionId = 'xizong-official-1900-n001';
  f.storage.setItem('kianos:xizong:system-question-sweep:synthetic-system:v1', JSON.stringify({ results: { [questionId]: { status: 'wrong', attemptId: 'synthetic-attempt', updatedAt: new Date(NOW).toISOString(), roundId: 'synthetic-round' } } }));
  const packet = { schema: XIZONG_SYSTEM_WU_RETURN_SCHEMA, return_id: 'synthetic-system-return', system_id: 'synthetic-system', decision: 'REPAIR', plan: [{ question_id: questionId, status: 'wrong', attempt_id: 'synthetic-attempt', submitted_at: new Date(NOW).toISOString(), round_id: 'synthetic-round', action: 'Synthetic repair' }] };
  const options = { questions: [{ questionId, relation: { blockId: 'synthetic-block', primaryKpId: 'synthetic-kp' } }], routes: { 'synthetic-block': { label: 'Synthetic Block', href: '/synthetic/block/' } }, practiceHref: '/synthetic/practice/', now: NOW + 1000 };
  const applied = applyXizongSystemWuReturn(f.storage, packet, options);
  assert.equal(applied.status, 'applied'); const id = applied.repair_tasks[0].id;
  f.storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(completeRepairTask(readXizongMemoryStorage(f.storage), id, NOW + 2000)));
  const before = f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY);
  await runBridge(f.storage); assert.equal(f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY), before);
  const snapshot = f.storage.snapshot(), writes = f.storage.writes.length;
  assert.equal(applyXizongSystemWuReturn(f.storage, packet, options).status, 'already_applied');
  assert.deepEqual(f.storage.snapshot(), snapshot); assert.equal(f.storage.writes.length, writes);
  results.scenarios.push({ name: 'Native System W/U direct Return, completion, bridge consume and exact replay', outcome: 'PASS_SHARED_BRIDGE_PRESERVATION' });
}


const SYSTEM_RESULT = 'kianos:xizong:system-repair-return:synthetic-system:v1';
const A_ID = 'repair:system-wu:synthetic-system:synthetic-block:synthetic-kp';
const B_ID = 'repair:system-wu:synthetic-system:synthetic-block:synthetic-kp-two';
function mixedAgeFixture() {
  const f = fixture();
  const questionA = 'xizong-official-1900-n001', questionB = 'xizong-official-1900-n002';
  f.storage.setItem('kianos:xizong:system-question-sweep:synthetic-system:v1', JSON.stringify({ results: {
    [questionA]: { status: 'wrong', attemptId: 'attempt-a', updatedAt: new Date(NOW).toISOString(), roundId: 'round-a' },
    [questionB]: { status: 'wrong', attemptId: 'attempt-b', updatedAt: new Date(NOW).toISOString(), roundId: 'round-b' }
  } }));
  const questions = [
    { questionId: questionA, relation: { blockId: 'synthetic-block', primaryKpId: 'synthetic-kp' } },
    { questionId: questionB, relation: { blockId: 'synthetic-block', primaryKpId: 'synthetic-kp-two' } }
  ];
  const options = { questions, routes: { 'synthetic-block': { label: 'Synthetic Block', href: '/synthetic/block/' } }, practiceHref: '/synthetic/practice/' };
  const packet = (suffix, returnId) => ({ schema: XIZONG_SYSTEM_WU_RETURN_SCHEMA, return_id: returnId, system_id: 'synthetic-system', decision: 'REPAIR', plan: [{ question_id: suffix === 'a' ? questionA : questionB, status: 'wrong', attempt_id: 'attempt-' + suffix, submitted_at: new Date(NOW).toISOString(), round_id: 'round-' + suffix, action: 'Synthetic ' + suffix }] });
  const apply = (suffix, returnId, at) => applyXizongSystemWuReturn(f.storage, packet(suffix, returnId), { ...options, now: at });
  apply('a', 'return-a', NOW + 1000);
  f.storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(completeRepairTask(readXizongMemoryStorage(f.storage), A_ID, NOW + 2000)));
  apply('b', 'return-b', NOW + 3000);
  return { ...f, apply };
}
async function mixedBridge(storage) { return runBridge(storage, { allowed: ['synthetic-kp', 'synthetic-kp-two'] }); }
async function assertMixedBlocked(storage, label) {
  const before = storage.snapshot(), writes = storage.writes.length;
  const result = await mixedBridge(storage);
  assert.deepEqual(storage.snapshot(), before, label);
  assert.equal(storage.writes.length, writes, label + ': no writes');
  assert.equal(result.events.length, 0, label + ': no success event');
  results.scenarios.push({ name: label, outcome: 'PASS_UNPROVEN_BATCH_FAIL_CLOSED' });
}
{
  const f = mixedAgeFixture(), before = f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY);
  const inbox = JSON.parse(f.storage.getItem(INBOX)); assert.equal(inbox.plans.length, 2);
  const a = readXizongMemoryStorage(f.storage).repairTasks.find(row => row.id === A_ID);
  assert.equal(a.status, 'DONE'); assert.notEqual(a.createdAt, inbox.importedAt);
  const result = await mixedBridge(f.storage);
  assert.equal(f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY), before);
  assert.equal(f.storage.getItem(INBOX), null); assert.equal(result.events.length, 1);
  results.scenarios.push({ name: 'Native A Return, complete A, native B Return: retained A and B survive exact', outcome: 'PASS_NATIVE_MIXED_AGE_PRESERVATION' });
}
{
  const f = mixedAgeFixture();
  const beforeA = readXizongMemoryStorage(f.storage).repairTasks.find(row => row.id === A_ID);
  const applied = f.apply('a', 'return-a-new', NOW + 4000);
  assert.equal(applied.status, 'applied');
  const beforeBridge = f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY);
  const newA = readXizongMemoryStorage(f.storage).repairTasks.find(row => row.id === A_ID);
  assert.equal(newA.status, 'ACTIVE'); assert.equal(newA.completedAt, ''); assert.equal(newA.createdAt, new Date(NOW + 4000).toISOString());
  assert.notEqual(newA.createdAt, beforeA.createdAt);
  await mixedBridge(f.storage); assert.equal(f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY), beforeBridge); assert.equal(f.storage.getItem(INBOX), null);
  const snapshot = f.storage.snapshot(), writes = f.storage.writes.length;
  assert.equal(f.apply('a', 'return-a-new', NOW + 4000).status, 'already_applied');
  await mixedBridge(f.storage); assert.deepEqual(f.storage.snapshot(), snapshot); assert.equal(f.storage.writes.length, writes);
  results.scenarios.push({ name: 'Native new A occurrence remains ACTIVE while older B is retained; exact replay is read-only', outcome: 'PASS_NATIVE_OWNS_NEW_OCCURRENCE' });
}
for (const [label, mutate] of [
  ['Missing result', (r, f) => f.storage.removeItem(SYSTEM_RESULT)],
  ['Corrupt result JSON', (r, f) => f.storage.setItem(SYSTEM_RESULT, '{corrupt')],
  ['Missing receipt', r => delete r.receipt],
  ['Wrong receipt schema', r => r.receipt.schema = 'arbitrary.note'],
  ['Unapplied receipt status', r => r.receipt.status = 'REJECTED'],
  ['Mismatched result Return ID', r => r.return_id = 'different-return'],
  ['Mismatched packet Return ID', r => r.return_packet.return_id = 'different-return'],
  ['Mismatched receipt Return ID', r => r.receipt.return_id = 'different-return'],
  ['Mismatched packet System', r => r.return_packet.system_id = 'different-system'],
  ['Mismatched receipt System', r => r.receipt.system_id = 'different-system'],
  ['Mismatched result timestamp', r => r.importedAt = new Date(NOW + 9000).toISOString()],
  ['Mismatched receipt timestamp', r => r.receipt.at = new Date(NOW + 9000).toISOString()],
  ['Mismatched receipt task timestamp', r => r.receipt.repair_tasks[0].created_at = new Date(NOW + 9000).toISOString()],
  ['Duplicated receipt task', r => r.receipt.repair_tasks.push({ ...r.receipt.repair_tasks[0] })],
  ['Mismatched task ID sets', r => r.repair_task_ids = [A_ID]],
  ['Wrong receipt task KP', r => r.receipt.repair_tasks[0].kp_id = 'different-kp'],
  ['Wrong receipt task Block', r => r.receipt.repair_tasks[0].block_id = 'different-block'],
  ['Wrong receipt task origin', r => r.receipt.repair_tasks[0].origin = 'BLOCK_CHAT_RETURN'],
  ['Wrong receipt task axis', r => r.receipt.repair_tasks[0].diagnostic_axis = 'DIFFERENT'],
  ['Receipt packet no longer contains the native question', r => r.return_packet.plan[0].question_id = 'xizong-official-1900-n099'],
  ['Receipt has no current task witness', (r, f) => { const memory = readXizongMemoryStorage(f.storage); memory.repairTasks = memory.repairTasks.filter(row => row.id !== B_ID); f.storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(memory)); }],
  ['Missing retained native task', (r, f) => { const memory = readXizongMemoryStorage(f.storage); memory.repairTasks = memory.repairTasks.filter(row => row.id !== A_ID); f.storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(memory)); }],
  ['Retained plan differs from native payload', (r, f) => { const inbox = JSON.parse(f.storage.getItem(INBOX)); inbox.plans[0].action = 'Different action'; f.storage.setItem(INBOX, JSON.stringify(inbox)); }]
]) {
  const f = mixedAgeFixture(), result = JSON.parse(f.storage.getItem(SYSTEM_RESULT));
  mutate(result, f);
  if (!['Missing result', 'Corrupt result JSON'].includes(label)) f.storage.setItem(SYSTEM_RESULT, JSON.stringify(result));
  await assertMixedBlocked(f.storage, label + ' cannot prove retained-plan identity');
}


{
  const f = mixedAgeFixture(), memory = readXizongMemoryStorage(f.storage);
  memory.repairTasks = memory.repairTasks.filter(row => row.id !== A_ID);
  f.storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(memory));
  const result = JSON.parse(f.storage.getItem(SYSTEM_RESULT)); delete result.receipt;
  f.storage.setItem(SYSTEM_RESULT, JSON.stringify(result));
  await assertMixedBlocked(f.storage, 'Absent retained task plus malformed-present native result cannot fall back to legacy import');
}
const qp = n => 'xizong-official-1900-n' + String(n).padStart(3, '0');
function partitionFixture({ unmapped = false, separateTasks = false } = {}) {
  const f = fixture(), evidence = {};
  for (const n of [1, 2, 3, 4]) evidence[qp(n)] = { status: 'wrong', attemptId: 'attempt-' + n, updatedAt: new Date(NOW).toISOString(), roundId: 'round-' + n };
  f.storage.setItem('kianos:xizong:system-question-sweep:synthetic-system:v1', JSON.stringify({ results: evidence }));
  const questions = [1, 2, 3, 4].map(n => ({ questionId: qp(n), relation: n === 4 ? null : { blockId: 'synthetic-block', primaryKpId: n === 1 ? 'synthetic-kp' : n === 3 && separateTasks ? 'synthetic-kp-three' : 'synthetic-kp-two' } }));
  const options = { questions, routes: { 'synthetic-block': { label: 'Synthetic Block', href: '/synthetic/block/' } }, practiceHref: '/synthetic/practice/' };
  const packet = (ns, id) => ({ schema: XIZONG_SYSTEM_WU_RETURN_SCHEMA, return_id: id, system_id: 'synthetic-system', decision: 'REPAIR', plan: ns.map(n => ({ question_id: qp(n), status: 'wrong', attempt_id: 'attempt-' + n, submitted_at: new Date(NOW).toISOString(), round_id: 'round-' + n, action: 'Synthetic task ' + n })) });
  applyXizongSystemWuReturn(f.storage, packet([1], 'partition-a'), { ...options, now: NOW + 1000 });
  f.storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(completeRepairTask(readXizongMemoryStorage(f.storage), A_ID, NOW + 2000)));
  applyXizongSystemWuReturn(f.storage, packet(unmapped ? [2, 3, 4] : [2, 3], 'partition-b'), { ...options, now: NOW + 3000 });
  return f;
}
{
  const f = partitionFixture(), memory = readXizongMemoryStorage(f.storage);
  memory.repairTasks.find(row => row.id === B_ID).sourceQuestionIds = [qp(2)];
  f.storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(memory));
  const inbox = JSON.parse(f.storage.getItem(INBOX)); inbox.plans.find(row => row.kpId === 'synthetic-kp-two').sourceQuestionIds = [qp(2)];
  f.storage.setItem(INBOX, JSON.stringify(inbox));
  await assertMixedBlocked(f.storage, 'Mutually matching Memory and inbox strict subset cannot prove the full Return batch');
}
for (const unmapped of [false, true]) {
  const f = partitionFixture({ unmapped }), before = f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY);
  const result = await mixedBridge(f.storage);
  assert.equal(f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY), before); assert.equal(f.storage.getItem(INBOX), null); assert.equal(result.events.length, 1);
  results.scenarios.push({ name: 'Exact native grouped-question partition' + (unmapped ? ' with explicit unmapped question' : ''), outcome: 'PASS_COMPLETE_NATIVE_MEMBERSHIP' });
}
for (const [label, change] of [
  ['Missing result unmapped list', r => delete r.unmapped_question_ids],
  ['Missing receipt unmapped list', r => delete r.receipt.unmapped_question_ids],
  ['Mismatched unmapped lists', r => r.receipt.unmapped_question_ids = []],
  ['Duplicated unmapped membership', r => { r.unmapped_question_ids.push(qp(4)); r.receipt.unmapped_question_ids.push(qp(4)); }],
  ['Mapped and unmapped membership overlap', r => { r.unmapped_question_ids.push(qp(2)); r.receipt.unmapped_question_ids.push(qp(2)); }],
  ['Extra unmapped identity absent from packet', r => { r.unmapped_question_ids.push(qp(99)); r.receipt.unmapped_question_ids.push(qp(99)); }],
  ['Missing question from complete partition', r => { r.unmapped_question_ids = []; r.receipt.unmapped_question_ids = []; }]
]) {
  const f = partitionFixture({ unmapped: true }), result = JSON.parse(f.storage.getItem(SYSTEM_RESULT));
  change(result); f.storage.setItem(SYSTEM_RESULT, JSON.stringify(result));
  await assertMixedBlocked(f.storage, label + ' fails exact native partition');
}
{
  const f = partitionFixture({ separateTasks: true }), before = f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY);
  const result = await runBridge(f.storage, { allowed: ['synthetic-kp', 'synthetic-kp-two', 'synthetic-kp-three'] });
  assert.equal(f.storage.getItem(XIZONG_MEMORY_STORAGE_KEY), before); assert.equal(f.storage.getItem(INBOX), null); assert.equal(result.events.length, 1);
  results.scenarios.push({ name: 'Exact native partition across multiple current task targets', outcome: 'PASS_COMPLETE_MULTI_TASK_MEMBERSHIP' });
}
{
  const f = partitionFixture({ separateTasks: true });
  const memory = readXizongMemoryStorage(f.storage), inbox = JSON.parse(f.storage.getItem(INBOX));
  memory.repairTasks.find(row => row.kpId === 'synthetic-kp-three').sourceQuestionIds = [qp(2)];
  inbox.plans.find(row => row.kpId === 'synthetic-kp-three').sourceQuestionIds = [qp(2)];
  f.storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(memory)); f.storage.setItem(INBOX, JSON.stringify(inbox));
  const before = f.storage.snapshot(), writes = f.storage.writes.length;
  const result = await runBridge(f.storage, { allowed: ['synthetic-kp', 'synthetic-kp-two', 'synthetic-kp-three'] });
  assert.deepEqual(f.storage.snapshot(), before); assert.equal(f.storage.writes.length, writes); assert.equal(result.events.length, 0);
  results.scenarios.push({ name: 'Same question cannot witness two different native task memberships', outcome: 'PASS_CROSS_TASK_DUPLICATE_FAIL_CLOSED' });
}

if (process.env.XIZONG_REPAIR_INBOX_REPORT) fs.writeFileSync(process.env.XIZONG_REPAIR_INBOX_REPORT, JSON.stringify(results, null, 2) + '\n');
for (const scenario of results.scenarios) console.log(scenario.outcome + ': ' + scenario.name);
console.log(`PASS Xizong Repair inbox preservation: ${results.scenarios.length} actual-component/native synthetic scenarios`);
