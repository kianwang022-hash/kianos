import fs from 'node:fs';
import {
  TRANSLATION_RETURN_SCHEMA,
  blankTranslationState,
  blankTransferLedger,
  normalizeTranslationState,
  normalizeTransferLedger,
  freezeWholeAttempt,
  passCleanAttempt,
  routeAttemptToReview,
  parseTranslationReturn,
  applyTranslationReturn,
  saveReconstruction,
  archiveTranslationAttempt,
  pendingTransferTargets
} from '../src/lib/translationRuntimeModel.mjs';

const issues = [];
let checks = 0;

function check(condition, message) {
  checks += 1;
  if (!condition) issues.push(message);
}

function expectThrows(fn, expected, message) {
  let seen = '';
  try { fn(); }
  catch (error) { seen = error instanceof Error ? error.message : String(error); }
  check(seen.includes(expected), `${message} (got ${seen || 'no error'})`);
}

function packet(payload) {
  return `${TRANSLATION_RETURN_SCHEMA}\n${JSON.stringify({ schema: TRANSLATION_RETURN_SCHEMA, ...payload })}`;
}

function read(relativeUrl) {
  return fs.readFileSync(new URL(relativeUrl, import.meta.url), 'utf8');
}

const prompts = [
  { id: 's1', ordinal: 1, sourceText: 'Source one.' },
  { id: 's2', ordinal: 2, sourceText: 'Source two.' }
];

// 1) Clean Attempt must be whole-set and immutable once frozen.
let state = blankTranslationState(prompts);
state.drafts.s1 = '第一句';
let frozen = freezeWholeAttempt(state, prompts, '2026-09-12T00:00:00.000Z');
check(frozen.ok === false, 'partial whole-set attempt must not freeze');
check(frozen.missing.length === 1 && frozen.missing[0] === 's2', 'partial freeze must identify the missing segment');
check(Object.keys(frozen.state.firstAttempts || {}).length === 0, 'failed freeze must not manufacture first-attempt evidence');

state.drafts.s2 = '第二句';
frozen = freezeWholeAttempt(state, prompts, '2026-09-12T00:01:00.000Z');
check(frozen.ok === true && frozen.state.stage === 'decision', 'complete attempt must reach PASS/Review decision');
check(frozen.state.firstAttempts.s1 === '第一句' && frozen.state.firstAttempts.s2 === '第二句', 'whole first attempt must preserve both segment outputs');
const frozenSnapshot = JSON.stringify(frozen.state.firstAttempts);
frozen.state.drafts.s1 = '后来修改';
check(JSON.stringify(frozen.state.firstAttempts) === frozenSnapshot, 'later drafts must not overwrite immutable first attempt');

// 2) Stable work must have an executable clean PASS path with no manufactured debt.
const passed = passCleanAttempt(frozen.state, '2026-09-12T00:02:00.000Z');
check(passed.stage === 'passed' && passed.decision === 'PASS', 'clean PASS path must be executable');
check(passed.pendingTransferCandidate == null, 'clean PASS must not manufacture transfer debt');
check((passed.affectedSegments || []).length === 0, 'clean PASS must not manufacture repair slices');

// 3) Saved-state normalization must fail safe.
const incompleteSaved = normalizeTranslationState(prompts, {
  ...blankTranslationState(prompts),
  version: 2,
  stage: 'reconstruct',
  firstAttempts: { s1: 'only one' },
  firstSubmittedAt: '2026-09-12T00:00:00.000Z'
});
check(incompleteSaved.stage === 'attempt', 'saved state without a complete first attempt must fail safe to attempt');
check(Object.keys(incompleteSaved.firstAttempts || {}).length === 0, 'incomplete saved first-attempt evidence must be cleared');

const invalidStageSaved = normalizeTranslationState(prompts, { ...frozen.state, version: 2, stage: 'unknown-stage' });
check(invalidStageSaved.stage === 'decision', 'complete saved attempt with invalid stage must fail safe to decision');

// 4) Review route + handoff contract must preserve whole-set first evidence and default to no Reference.
state = routeAttemptToReview(frozen.state);
check(state.stage === 'diagnosis', 'Need Review must enter diagnosis');
const workspace = read('../src/components/TranslationWorkspace.astro');
check(workspace.includes('FIRST TRANSLATION · IMMUTABLE'), 'handoff must include immutable first translation');
check(workspace.includes("state.referenceRevealed ? referenceText() : 'intentionally not revealed'"), 'handoff must exclude Reference unless learner explicitly revealed it');
check(workspace.includes('PENDING TRANSFER TARGETS'), 'handoff must carry pending-target context only after the clean attempt stage');

// 5) Malformed / wrong-task return must fail closed.
expectThrows(
  () => parseTranslationReturn('', 'task-a'),
  'RETURN_PACKET_SCHEMA_MISSING',
  'empty/malformed return must fail closed'
);
expectThrows(
  () => parseTranslationReturn(packet({ task: 'wrong-task', decision: 'PASS' }), 'task-a'),
  'RETURN_PACKET_TASK_MISMATCH',
  'return from another task must not import'
);
expectThrows(
  () => parseTranslationReturn(packet({
    task: 'task-a',
    decision: 'REPAIR_NEEDED',
    primary_failure: { layer: 'English Representation', minimal_repair: 'repair' },
    transfer_target: { admit: false },
    transfer_updates: []
  }), 'task-a'),
  'RETURN_PACKET_AFFECTED_SEGMENTS_MISSING',
  'REPAIR_NEEDED must identify the affected repair slice rather than silently widen to the whole set'
);

// 6) Valid repair return must route only the addressed slice into Reconstruction.
const repairPayload = parseTranslationReturn(packet({
  task: 'task-a',
  decision: 'REPAIR_NEEDED',
  primary_failure: {
    layer: 'English Representation',
    skill: 'R4 Scope',
    affected_segments: ['s2'],
    minimal_repair: '先确定 scope，再恢复命题强度。',
    reconstruction_prompt: '只重做第二句。'
  },
  transfer_target: { admit: false },
  transfer_updates: []
}), 'task-a');

let ledger = blankTransferLedger();
let applied = applyTranslationReturn(state, repairPayload, prompts, ledger, { task: 'task-a', now: '2026-09-12T01:00:00.000Z' });
check(applied.state.stage === 'reconstruct', 'valid repair return must enter Reconstruction');
check(applied.state.affectedSegments.length === 1 && applied.state.affectedSegments[0] === 's2', 'repair must preserve the smallest addressed segment slice');
check(applied.state.firstAttempts.s1 === '第一句' && applied.state.firstAttempts.s2 === '第二句', 'repair import must preserve immutable first attempt');

// 7) Failed apply must be atomic: no half-written transfer evidence may leak into the original ledger.
ledger = {
  version: 1,
  targets: [{
    id: 'translation:r4:scope',
    label: 'Scope',
    underlyingDemand: 'Handle scope correctly',
    status: 'pending',
    sourceTask: 'task-source',
    lastSourceTask: 'task-source',
    evidence: []
  }]
};
const originalLedger = JSON.stringify(ledger);
const badSegmentWithUpdate = {
  schema: TRANSLATION_RETURN_SCHEMA,
  task: 'task-b',
  decision: 'REPAIR_NEEDED',
  primary_failure: {
    layer: 'English Representation',
    affected_segments: ['not-a-segment'],
    minimal_repair: 'repair'
  },
  transfer_target: { admit: false },
  transfer_updates: [{
    target_id: 'translation:r4:scope',
    relation: 'support',
    note: 'must not leak if repair address fails',
    close: false
  }]
};
expectThrows(
  () => applyTranslationReturn(state, badSegmentWithUpdate, prompts, ledger, { task: 'task-b', now: '2026-09-12T01:05:00.000Z' }),
  'RETURN_PACKET_AFFECTED_SEGMENT_INVALID',
  'invalid repair address must abort the whole return application'
);
check(JSON.stringify(ledger) === originalLedger, 'failed return application must not mutate the original transfer ledger');

const normalizedLedger = normalizeTransferLedger(ledger);
normalizedLedger.targets[0].evidence.push({ task: 'x' });
check(ledger.targets[0].evidence.length === 0, 'normalized ledger evidence must be independently cloned, not share the source array');

// 8) Reconstruction cannot finish while addressed segments are missing.
applied = applyTranslationReturn(state, repairPayload, prompts, blankTransferLedger(), { task: 'task-a' });
let repaired = saveReconstruction(applied.state, applied.ledger, { task: 'task-a' });
check(repaired.ok === false && repaired.missing.length === 1 && repaired.missing[0] === 's2', 'incomplete Reconstruction must not finish');
applied.state.reconstructDrafts.s2 = '修复后的第二句';
repaired = saveReconstruction(applied.state, applied.ledger, { task: 'task-a', now: '2026-09-12T01:10:00.000Z' });
check(repaired.ok === true && repaired.state.stage === 'repaired', 'non-admitted repaired failure must exit as repaired');
check((repaired.state.reconstructions || []).length === 1, 'saved Reconstruction must be preserved in runtime state');

// 9) A reusable repair may enter TRANSFER_PENDING, but same-task reconstruction never closes it.
const reusablePayload = parseTranslationReturn(packet({
  task: 'task-a',
  decision: 'REPAIR_NEEDED',
  primary_failure: {
    layer: 'English Representation',
    skill: 'R4 Scope',
    affected_segments: ['s2'],
    minimal_repair: 'repair',
    reconstruction_prompt: 'reconstruct'
  },
  transfer_target: {
    admit: true,
    target_id: 'translation:r4:scope-strength',
    label: 'Scope 强度保持',
    layer: 'English Representation',
    skill: 'R4 Scope',
    underlying_demand: 'Later fresh material must test scope strength.'
  },
  transfer_updates: []
}), 'task-a');
applied = applyTranslationReturn(state, reusablePayload, prompts, blankTransferLedger(), { task: 'task-a' });
applied.state.reconstructDrafts.s2 = '再次修复';
const pending = saveReconstruction(applied.state, applied.ledger, { task: 'task-a', now: '2026-09-12T01:20:00.000Z' });
check(pending.ok === true && pending.state.stage === 'transfer_pending', 'admitted reusable failure must exit to TRANSFER_PENDING');
check(pendingTransferTargets(pending.ledger).length === 1, 'same-task reconstruction must leave the reusable target pending rather than closed');

// 10) Reset/history must preserve prior first-attempt evidence before a new attempt.
const snapshot = archiveTranslationAttempt(pending.state, '2026-09-12T01:30:00.000Z');
check(Boolean(snapshot), 'completed attempt must be archivable');
check(snapshot.firstAttempts.s1 === '第一句' && snapshot.firstAttempts.s2 === '第二句', 'archive must preserve immutable first-attempt evidence');
const restarted = blankTranslationState(prompts, [snapshot]);
check(restarted.stage === 'attempt' && restarted.history.length === 1, 'reset must start a clean attempt while retaining archived history');
check(Object.keys(restarted.firstAttempts || {}).length === 0, 'reset must not carry previous first attempt into the new attempt');

// 11) Persistence guard must fail closed when local storage is unavailable.
const persistence = read('../src/components/TranslationPersistenceGuard.astro');
check(persistence.includes("root.dataset.persistenceAvailable = 'false'"), 'persistence guard must expose unavailable state');
check(persistence.includes('freeze.disabled = true'), 'persistence guard must disable formal first-attempt freeze when storage is unavailable');
check(persistence.includes('不能锁定正式第一版'), 'persistence guard must explain why formal attempt cannot start without durable local storage');

// 12) Reference loader must fail closed on identity/load failure and never fabricate missing references.
const referenceLoader = read('../src/components/TranslationReferenceLoader.astro');
check(referenceLoader.includes('REFERENCE_IDENTITY_MISMATCH'), 'Reference payload identity mismatch must fail closed');
check(referenceLoader.includes('不会伪造答案'), 'Reference load failure must explicitly remain non-fabricating');
check(referenceLoader.includes('Current source 暂无已核验参考译文'), 'missing Source references must render as unavailable rather than fabricated content');

const result = {
  schema: 'kianos.english.translation.runtime-gate-validation.v1',
  gate: 'R',
  decision: issues.length ? 'BLOCKED' : 'PASS',
  pass: issues.length === 0,
  counts: {
    checks,
    issues: issues.length
  },
  boundaries: {
    wholeAttemptRequired: true,
    cleanPassWithoutDebt: true,
    immutableFirstAttempt: true,
    wrongTaskFailClosed: true,
    repairSliceRequired: true,
    failedImportAtomic: true,
    reconstructionRequired: true,
    sameTaskCannotCloseMastery: true,
    persistenceFailClosed: true,
    referenceNonFabrication: true
  },
  issues
};

const out = process.env.KIANOS_TRANSLATION_RUNTIME_GATE_OUT;
if (out) fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (!result.pass) process.exit(1);
