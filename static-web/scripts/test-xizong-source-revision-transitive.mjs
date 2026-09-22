import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  buildXizongForecastProgress,
  buildXizongStudyPacketFromStorage,
  xizongStudySourceRevisionStatus
} from '../src/lib/xizongStudyPacket.mjs';

class Storage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  get length(){ return this.map.size; }
  key(index){ return [...this.map.keys()][index] ?? null; }
  getItem(key){ return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key,value){ this.map.set(String(key),String(value)); }
  removeItem(key){ this.map.delete(String(key)); }
}

const packetMeta={
  objectId:'xizong:audit-b01',
  systemId:'audit',
  canonicalId:'AUDIT',
  blockId:'audit-b01',
  blockLabel:'B01',
  blockTitle:'Audit',
  sourcePath:'fixture.md',
  sourceHash:'source-v2',
  sourceContactMode:'WHOLE_BLOCK_CUMULATIVE',
  sourcePerGroup:false
};
const kpRows=[{
  kpId:'audit-b01-kp01',
  displayId:'KP01',
  title:'Audit KP',
  groupId:'audit-lg01',
  groupLabel:'LG01',
  sourceLocator:'p1',
  prompt:'recall'
}];
const packetIndex=[{systemId:'audit',blockId:'audit-b01',packetMeta,kpRows}];
const stateKey='kianos-xizong-astro-v2:xizong:audit-b01';

const staleState={
  schema:'kianos.xizong.block-state.v2',
  stage:'block_recall',
  learned:{'audit-b01-kp01':true},
  ratings:{'audit-b01-kp01':'mastered'},
  sourceContactDone:true,
  sourceContactEvidence:[{
    segment_id:'block-cumulative:xizong:audit-b01',
    coverage_kind:'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION',
    kp_ids:['audit-b01-kp01'],
    completed_at:'2026-09-20T00:00:00Z',
    source_hash:'source-v1'
  }],
  blockRecallDone:true,
  completed:true
};

const status=xizongStudySourceRevisionStatus(staleState,'source-v2');
assert.equal(status.status,'STALE_SOURCE_REVISION');
assert.equal(status.blocked,true);

const staleStorage=new Storage({[stateKey]:JSON.stringify(staleState)});
const staleForecast=buildXizongForecastProgress(staleStorage,packetIndex);
assert.equal(staleForecast.runtime_evidence.completed_blocks,0);
assert.equal(staleForecast.runtime_evidence.source_revision_blocked_count,1);
assert.equal(staleForecast.runtime_evidence.source_revision_blocked_blocks[0].status,'STALE_SOURCE_REVISION');

const stalePacket=buildXizongStudyPacketFromStorage({
  storage:staleStorage,packetMeta,kpRows,now:Date.parse('2026-09-21T00:00:00Z')
});
assert.equal(stalePacket.current.source_revision_blocked,true);
assert.equal(stalePacket.current.source_revision_status,'STALE_SOURCE_REVISION');
assert.equal(stalePacket.current.evidence_source_hash,'source-v1');

const unboundState={
  schema:'kianos.xizong.block-state.v2',
  learned:{'audit-b01-kp01':true},
  ratings:{'audit-b01-kp01':'known'},
  blockRecallDone:true,
  completed:true
};
const unbound=xizongStudySourceRevisionStatus(unboundState,'source-v2');
assert.equal(unbound.status,'SOURCE_IDENTITY_UNBOUND');
assert.equal(unbound.blocked,true);
const unboundForecast=buildXizongForecastProgress(
  new Storage({[stateKey]:JSON.stringify(unboundState)}),
  packetIndex
);
assert.equal(unboundForecast.runtime_evidence.completed_blocks,0);
assert.equal(unboundForecast.runtime_evidence.source_revision_blocked_count,1);

const currentState={
  ...staleState,
  sourceHash:'source-v2',
  sourceContactEvidence:[{
    ...staleState.sourceContactEvidence[0],
    source_hash:'source-v2'
  }]
};
const currentStatus=xizongStudySourceRevisionStatus(currentState,'source-v2');
assert.equal(currentStatus.status,'CURRENT');
assert.equal(currentStatus.blocked,false);
const currentForecast=buildXizongForecastProgress(
  new Storage({[stateKey]:JSON.stringify(currentState)}),
  packetIndex
);
assert.equal(currentForecast.runtime_evidence.completed_blocks,1);
assert.equal(currentForecast.runtime_evidence.source_revision_blocked_count,0);

const pendingState={...currentState,sourceRevisionPending:true,sourceRevisionFromHash:'source-v1'};
const pending=xizongStudySourceRevisionStatus(pendingState,'source-v2');
assert.equal(pending.status,'REVISION_PENDING');
assert.equal(pending.blocked,true);

// Browser owner must reopen completion and require current Source contact + Block Recall.
const component=fs.readFileSync('static-web/src/components/XizongBlockV6.astro','utf8');
assert.match(component,/sourceRevisionPending: true/);
assert.match(component,/sourceRevisionReason: evidenceSourceHash \? 'SOURCE_REVISION_CHANGED' : 'SOURCE_IDENTITY_UNBOUND'/);
assert.match(component,/completed: false/);
assert.match(component,/blockRecallDone: false/);
assert.match(component,/currentSourceContactCovered/);
assert.match(component,/state\.sourceRevisionPending !== true/);
assert.match(component,/Source 已更新 · 需重新确认/);

console.log(JSON.stringify({
  schema:'kianos.xizong.source-revision-transitive.v1',
  stale_block_cannot_reduce_forecast:'PASS',
  unbound_block_cannot_reduce_forecast:'PASS',
  packet_surfaces_revision_status:'PASS',
  current_bound_completion_still_counts:'PASS',
  browser_reopens_completion_without_deleting_prior_recall:'PASS'
},null,2));
console.log('PASS Xizong Source revision transitive invalidation');

// D3 exercises complete native modules, not copied function excerpts.
const { xizongQuestionSemanticRevision } = await import('../src/lib/xizongQuestions.mjs');
const { ensureXizongQuestionSweepState, recordXizongQuestionAttempt } = await import('../src/lib/xizongQuestionAttempts.mjs');
const { collectXizongRetainedEvidence } = await import('../src/lib/xizongRetainedPractice.mjs');
const { captureXizongPrivateCheckpoint, prepareXizongPrivateCheckpointRestore } = await import('../src/lib/xizongPrivateCheckpoint.mjs');
const qid = 'xizong-official-2026-n001';
const question = { questionId: qid, questionType: 'A1', stem: 'original', options: [{ label: 'A', text: 'one' }, { label: 'B', text: 'two' }], correctAnswer: 'A', year: 2026, number: 1, points: 1.5 };
question.semanticRevision = xizongQuestionSemanticRevision(question);
const ctx = q => ({ questions: [q], questionSemanticRevisions: { [qid]: q.semanticRevision }, systemId: 'audit', canonicalId: 'AUDIT', scopeHash: 'scope', questionInventoryHash: 'inventory', attemptContext: 'SYSTEM_SWEEP' });
const recorded = recordXizongQuestionAttempt({}, { question, context: ctx(question), status: 'wrong', selected: ['B'], marked: true }, { now: '2026-09-20T01:00:00Z', makeId: p => p+'-one' });
assert.deepEqual(ensureXizongQuestionSweepState(recorded, ctx(question)), recorded);
const legacy = structuredClone(recorded);
delete legacy.results[qid].questionSemanticRevision;
delete legacy.questionSemanticRevisions;
legacy.attemptHistory = [];
delete legacy.attemptHistoryBootstrappedAt;
const bootstrapped = ensureXizongQuestionSweepState(legacy, ctx(question));
assert.equal(bootstrapped.results[qid], undefined);
assert.equal(bootstrapped.attemptHistory[0].question_semantic_revision, '');
assert.equal(bootstrapped.attemptHistory[0].current_revision_valid, false);
for (const change of [{ stem: 'revised' }, { options: [{ label: 'A', text: 'changed' }, { label: 'B', text: 'two' }] }, { options: [{ label: 'B', text: 'one' }, { label: 'A', text: 'two' }] }, { questionType: 'X' }]) {
  const q = { ...question, ...change };
  q.semanticRevision = xizongQuestionSemanticRevision(q);
  assert.notEqual(q.semanticRevision, question.semanticRevision);
  for (const nativeContext of ['SYSTEM_SWEEP', 'PAPER', 'TARGETED_PRACTICE', 'RETAINED_WU']) {
    const old = structuredClone(recorded);
    old.paperDraftAnswers = { [qid]: { selected: ['B'] } };
    old.paperSeal = { sealedAt: '2026-09-20T02:00:00Z', summary: { earnedScore: 0, maxScore: 300, questionCount: 1 }, evidenceContext: { questionSemanticRevisions: { [qid]: question.semanticRevision } } };
    const before = JSON.stringify(old);
    const revised = ensureXizongQuestionSweepState(old, { ...ctx(q), attemptContext: nativeContext });
    assert.equal(JSON.stringify(old), before, 'revision reconciliation must not mutate its input');
    assert.equal(revised.results[qid], undefined);
    assert.equal(revised.paperDraftAnswers[qid], undefined);
    assert.equal(revised.paperSeal, undefined);
    assert.equal(revised.paperSealHistory[0].summary.earnedScore, 0);
    assert.equal(revised.attemptHistory.length, 1);
    assert.equal(revised.marks[qid], undefined); // marked result is preserved in raw event
    assert.deepEqual(ensureXizongQuestionSweepState(revised, ctx(q)), revised);
    const entries = [['kianos:xizong:paper-question-sweep:paper-2026:v1', JSON.stringify(revised)]];
    const retained = collectXizongRetainedEvidence(entries, { questionSemanticRevisions: ctx(q).questionSemanticRevisions });
    assert.equal(retained.wrongUncertainIds.length, 0);
    assert.ok(retained.markedIds.includes(qid), 'explicit mark survives content revision');
    const st = new Storage(Object.fromEntries(entries));
    const progress = buildXizongForecastProgress(st, packetIndex, { questionScope: { question_semantic_revisions: ctx(q).questionSemanticRevisions } });
    assert.equal(progress.practice_evidence.official_attempt_events, 0);
    assert.equal(progress.practice_evidence.raw_historical_official_attempt_events, 1);
    assert.equal(progress.formal_score_evidence.sealed_papers.length, 1);
    assert.equal(progress.formal_score_evidence.sealed_papers[0].earned_score, 0);
    assert.equal(progress.formal_score_evidence.sealed_papers[0].current_revision_valid, false);
    const next = recordXizongQuestionAttempt(revised, { question: q, context: ctx(q), status: 'stable', selected: ['A'] }, { now: '2026-09-22T01:00:00Z', makeId: p => p+'-two' });
    assert.equal(next.attemptHistory.length, 2);
    assert.equal(next.attemptHistory[1].attempt_index, 2, 'source revision never manufactures fresh exposure');
  }
}
const activeKey = 'kianos:xizong:system-recall:audit:v1';
const metaKey = 'kianos:xizong:system-evidence-meta:audit:v1';
const archiveKey = 'kianos-xizong-stale-system-evidence:audit:1';
const backup = captureXizongPrivateCheckpoint(new Storage({ [activeKey]: '{"done":true}', [metaKey]: '{"version":"old"}', 'kianos:xizong:full-paper-holdout-years:v1': '[2026]' }));
const retiredStorage = new Storage({ [metaKey]: '{"version":"new"}', [archiveKey]: JSON.stringify({ previous_version: 'old', current_version: 'new', recall: { done: true } }) });
let plan = prepareXizongPrivateCheckpointRestore(retiredStorage, backup);
assert.ok(plan.skipped.some(row => row.key === activeKey && row.reason === 'NATIVE_REVISION_CHANGED'));
assert.ok(plan.changes.some(row => row.key === 'kianos:xizong:full-paper-holdout-years:v1'));
assert.equal(retiredStorage.getItem(activeKey), null);
const uncertainBackup = structuredClone(backup);
uncertainBackup.entries = uncertainBackup.entries.filter(row => row.key !== metaKey);
uncertainBackup.entries.find(row => row.key === activeKey).raw = '{"done":"different"}';
plan = prepareXizongPrivateCheckpointRestore(retiredStorage, uncertainBackup);
assert.equal(plan.status, 'blocked');
assert.ok(plan.blocked.some(row => row.key === activeKey));
assert.throws(() => prepareXizongPrivateCheckpointRestore(new Storage({ [archiveKey]: '{bad' }), backup), /JSON_INVALID/);
console.log('PASS D3 semantic consumer closure, immutable raw history/exposure, sealed historical score and archive-aware native restore');

const currentBackup = structuredClone(backup);
currentBackup.entries.find(row => row.key === metaKey).raw = '{"version":"new"}';
assert.ok(prepareXizongPrivateCheckpointRestore(retiredStorage, currentBackup).changes.some(row => row.key === activeKey), 'same revision can legitimately repeat an archived-shaped value');

// Execute the actual complete System guard client script with disposable storage.
// This tests storage failure ordering; real route/browser acceptance is separate.
const vm = await import('node:vm');
const { normalizeXizongMemoryState, XIZONG_MEMORY_STORAGE_KEY } = await import('../src/lib/xizongMemoryModel.mjs');
const guardSource = fs.readFileSync('static-web/src/components/XizongSystemEvidenceGuard.astro', 'utf8');
const guardScript = guardSource.match(/<script>\s*([\s\S]*?)<\/script>/)[1].replace(/^\s*import[^;]+;/gm, '');
for (const failure of ['archive', 'sweep', 'meta', null]) {
  class Element { constructor(attrs = {}) { this.attrs = attrs; this.inert = false; } getAttribute(key) { return this.attrs[key]; } before() {} setAttribute() {} }
  const marker = new Element({ 'data-system-id': 'audit', 'data-evidence-version': 'new' });
  const root = new Element();
  const sweepKey = 'kianos:xizong:system-question-sweep:audit:v1';
  const initialSweep = JSON.stringify(recorded);
  const local = new Storage({ [metaKey]: '{"version":"old"}', [activeKey]: '{"done":true}', [sweepKey]: initialSweep });
  const set = local.setItem.bind(local);
  local.setItem = (key, value) => {
    if (failure === 'archive' && key.startsWith('kianos-xizong-stale-system-evidence:')) throw Error('quota');
    if (failure === 'sweep' && key === sweepKey) throw Error('quota');
    if (failure === 'meta' && key === metaKey) throw Error('quota');
    set(key, value);
  };
  let reloads = 0, initialized;
  vm.runInNewContext(guardScript, {
    // This VM owns isolated storage. The real cross-page Web Lock is exercised
    // by the separate browser regression, not claimed by this admission double.
    learnerWriterReady: { then(fn) { initialized = Promise.resolve().then(fn); return initialized; } },
    HTMLElement: Element, Element, localStorage: local, sessionStorage: new Storage(),
    XIZONG_MEMORY_STORAGE_KEY, normalizeXizongMemoryState,
    document: { querySelector: selector => selector.includes('data-xizong-system-evidence-guard') ? marker : selector.includes('data-xizong-system-exit') ? root : { textContent: '[]' }, querySelectorAll: () => [], createElement: () => new Element() },
    window: { location: { reload: () => { reloads++; } } }, Date, JSON
  });
  await initialized;
  if (failure) {
    assert.equal(root.inert, true);
    assert.equal(local.getItem(sweepKey), initialSweep);
    assert.equal(JSON.parse(local.getItem(metaKey)).version, 'old');
    assert.equal(local.getItem(activeKey), '{"done":true}');
    assert.equal(reloads, 0);
  } else {
    assert.equal(reloads, 1);
    assert.equal(local.getItem(activeKey), null);
    const kept = JSON.parse(local.getItem(sweepKey));
    assert.deepEqual(kept.results, {});
    assert.equal(kept.attemptHistory.length, 1);
    assert.equal(kept.attemptHistory[0].current_revision_valid, false);
    assert.equal(JSON.parse(local.getItem(metaKey)).version, 'new');
  }
}
console.log('PASS actual System guard client: archive/write failure retains active originals; success preserves exposure and retires current inference');
