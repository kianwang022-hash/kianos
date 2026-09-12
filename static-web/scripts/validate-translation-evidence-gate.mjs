import fs from 'node:fs';
import {
  TRANSLATION_RETURN_SCHEMA,
  blankTranslationState,
  blankTransferLedger,
  freezeWholeAttempt,
  routeAttemptToReview,
  parseTranslationReturn,
  applyTranslationReturn,
  saveReconstruction,
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

const prompts = [{ id: 's1', ordinal: 1, sourceText: 'Fresh source.' }];

function frozenTask(answer, firstSubmittedAt, history = []) {
  const state = blankTranslationState(prompts, history);
  state.drafts.s1 = answer;
  return freezeWholeAttempt(state, prompts, firstSubmittedAt).state;
}

// Shared evidence semantics must remain explicit in canonical content/UI.
const contract = read('../../content/english/modules/translation/learning.md');
const guard = read('../src/components/TranslationEvidenceGuard.astro');
const workspace = read('../src/components/TranslationWorkspace.astro');
check(contract.includes('Evidence granularity may be smaller than Review granularity.'), 'whole-set review must coexist with finer evidence granularity');
check(contract.includes('first meaningful failure'), 'evidence contract must target first meaningful failure');
check(contract.includes('可由它解释的 downstream effects 不独立制造复习债务'), 'cascade effects must not manufacture separate debt');
check(contract.includes('同一句重译正确只证明 repair 生效，不证明 mastery'), 'same-item reconstruction must not be treated as mastery');
check(contract.includes('Lexical sense / phrase / construction / collocation / contrast / confusable 继续回到 LexicalOS canonical owner'), 'LexicalOS ownership boundary must be explicit');
check(workspace.includes('FIRST TRANSLATION · IMMUTABLE'), 'immutable first translation must remain the diagnostic baseline');
check(guard.includes("stage === 'attempt' ? 'none' : ''"), 'pending target detail must stay hidden until first attempt is frozen');
check(guard.includes('dataset.reopenReview'), 'later contradictory evidence must have a route back from PASS into Review');

// Build one durable reusable target from a repair task.
let source = frozenTask('source answer', '2026-09-12T10:00:00.000Z');
source = routeAttemptToReview(source);
const reusableRepair = parseTranslationReturn(packet({
  task: 'task-source',
  decision: 'REPAIR_NEEDED',
  primary_failure: {
    layer: 'English Representation',
    skill: 'R4 Scope',
    affected_segments: ['s1'],
    minimal_repair: 'repair scope',
    reconstruction_prompt: 'retranslate'
  },
  transfer_target: {
    admit: true,
    target_id: 'translation:r4:scope-strength',
    label: 'Scope strength',
    layer: 'English Representation',
    skill: 'R4 Scope',
    underlying_demand: 'Preserve scope strength on later fresh material.'
  },
  transfer_updates: []
}), 'task-source');
let applied = applyTranslationReturn(source, reusableRepair, prompts, blankTransferLedger(), { task: 'task-source', now: '2026-09-12T10:05:00.000Z' });
applied.state.reconstructDrafts.s1 = 'reconstructed';
let repaired = saveReconstruction(applied.state, applied.ledger, { task: 'task-source', now: '2026-09-12T10:10:00.000Z' });
check(repaired.state.stage === 'transfer_pending', 'reusable repaired failure must enter TRANSFER_PENDING');
check(pendingTransferTargets(repaired.ledger).length === 1, 'durable reusable target must exist after admitted repair');
check((repaired.ledger.targets[0]?.evidence || []).length === 0, 'source-task Reconstruction must not count as fresh transfer evidence');

const closeUpdate = (task) => parseTranslationReturn(packet({
  task,
  decision: 'PASS',
  transfer_updates: [{
    target_id: 'translation:r4:scope-strength',
    relation: 'support',
    note: 'independent success',
    close: true
  }]
}), task);

// Old/exposed material must never masquerade as fresh closure evidence.
let oldTask = frozenTask('old answer', '2026-09-12T09:00:00.000Z');
oldTask = routeAttemptToReview(oldTask);
expectThrows(
  () => applyTranslationReturn(oldTask, closeUpdate('task-old'), prompts, repaired.ledger, { task: 'task-old', now: '2026-09-12T11:00:00.000Z' }),
  'RETURN_PACKET_TRANSFER_CLOSE_REQUIRES_FRESH_TASK',
  'task first attempted before target creation must not close the target'
);

let repeatedTask = frozenTask('repeat answer', '2026-09-12T11:00:00.000Z', [{ archivedAt: '2026-09-12T08:00:00.000Z' }]);
repeatedTask = routeAttemptToReview(repeatedTask);
expectThrows(
  () => applyTranslationReturn(repeatedTask, closeUpdate('task-repeat'), prompts, repaired.ledger, { task: 'task-repeat', now: '2026-09-12T11:05:00.000Z' }),
  'RETURN_PACKET_TRANSFER_CLOSE_REQUIRES_FRESH_TASK',
  'repeated/exposed task with prior history must not close the target'
);

// Irrelevant later material is evidence about non-relevance, not support/refutation.
let freshB = frozenTask('fresh B', '2026-09-12T11:30:00.000Z');
freshB = routeAttemptToReview(freshB);
const irrelevant = parseTranslationReturn(packet({
  task: 'task-b',
  decision: 'PASS',
  transfer_updates: [{
    target_id: 'translation:r4:scope-strength',
    relation: 'irrelevant',
    note: 'did not test the demand',
    close: false
  }]
}), 'task-b');
applied = applyTranslationReturn(freshB, irrelevant, prompts, repaired.ledger, { task: 'task-b', now: '2026-09-12T11:31:00.000Z' });
check(pendingTransferTargets(applied.ledger).length === 1, 'irrelevant later material must not close pending target');
check(applied.ledger.targets[0].evidence.length === 1 && applied.ledger.targets[0].evidence[0].relation === 'irrelevant', 'irrelevant relation should remain explicit without becoming support');

// Re-import from the same later task must replace, not stack, evidence.
const supportNoClose = parseTranslationReturn(packet({
  task: 'task-b',
  decision: 'PASS',
  transfer_updates: [{
    target_id: 'translation:r4:scope-strength',
    relation: 'support',
    note: 'same task reinterpretation',
    close: false
  }]
}), 'task-b');
applied = applyTranslationReturn(freshB, supportNoClose, prompts, applied.ledger, { task: 'task-b', now: '2026-09-12T11:32:00.000Z' });
const sameTaskCount = applied.ledger.targets[0].evidence.length;
applied = applyTranslationReturn(freshB, supportNoClose, prompts, applied.ledger, { task: 'task-b', now: '2026-09-12T11:33:00.000Z' });
check(applied.ledger.targets[0].evidence.length === sameTaskCount, 'same later task must be idempotent evidence, not extra count');

// Fresh first attempt after target creation may close only when Chat semantically marks support+close.
let freshC = frozenTask('fresh C', '2026-09-12T12:00:00.000Z');
freshC = routeAttemptToReview(freshC);
applied = applyTranslationReturn(freshC, closeUpdate('task-c'), prompts, applied.ledger, { task: 'task-c', now: '2026-09-12T12:01:00.000Z' });
check(applied.ledger.targets[0].status === 'closed', 'fresh independent support with semantic close may close the target');
check(applied.ledger.targets[0].closedByTask === 'task-c', 'closure must preserve the actual closing task');
const closingEvidence = applied.ledger.targets[0].evidence.find((row) => row.task === 'task-c');
check(closingEvidence?.freshForClosure === true, 'closing evidence must record that freshness requirements were met');
check(closingEvidence?.taskHistoryCount === 0, 'closing evidence must record zero prior task history');

// Contradictory later evidence must reopen; no arbitrary permanent mastery label.
let freshD = frozenTask('fresh D', '2026-09-12T13:00:00.000Z');
freshD = routeAttemptToReview(freshD);
const contradict = parseTranslationReturn(packet({
  task: 'task-d',
  decision: 'PASS',
  transfer_updates: [{
    target_id: 'translation:r4:scope-strength',
    relation: 'contradict',
    note: 'later failure contradicts closure',
    close: false
  }]
}), 'task-d');
applied = applyTranslationReturn(freshD, contradict, prompts, applied.ledger, { task: 'task-d', now: '2026-09-12T13:01:00.000Z' });
check(applied.ledger.targets[0].status === 'pending', 'contradictory later evidence must reopen closed target');
check(!applied.ledger.targets[0].closedByTask, 'reopened target must clear stale closure provenance');

// Non-reusable repair must not manufacture durable debt.
let localOnly = frozenTask('local only', '2026-09-12T14:00:00.000Z');
localOnly = routeAttemptToReview(localOnly);
const localRepair = parseTranslationReturn(packet({
  task: 'task-local',
  decision: 'REPAIR_NEEDED',
  primary_failure: {
    layer: 'Chinese Reconstruction',
    affected_segments: ['s1'],
    minimal_repair: 'local wording repair'
  },
  transfer_target: { admit: false },
  transfer_updates: []
}), 'task-local');
applied = applyTranslationReturn(localOnly, localRepair, prompts, blankTransferLedger(), { task: 'task-local' });
applied.state.reconstructDrafts.s1 = 'fixed';
const localDone = saveReconstruction(applied.state, applied.ledger, { task: 'task-local', now: '2026-09-12T14:01:00.000Z' });
check(localDone.state.stage === 'repaired', 'non-reusable repair must finish without durable transfer debt');
check(localDone.ledger.targets.length === 0, 'admit=false must create no durable target');

// Lexical canonical ownership: repair may occur here, durable lexical debt may not duplicate into Translation ledger.
expectThrows(
  () => parseTranslationReturn(packet({
    task: 'task-lexical',
    decision: 'REPAIR_NEEDED',
    primary_failure: {
      layer: 'Lexical',
      affected_segments: ['s1'],
      minimal_repair: 'resolve lexical sense'
    },
    transfer_target: {
      admit: true,
      target_id: 'translation:lexical:duplicate',
      label: 'duplicate lexical debt',
      layer: 'Lexical',
      underlying_demand: 'remember lexical sense'
    },
    transfer_updates: []
  }), 'task-lexical'),
  'RETURN_PACKET_TRANSFER_TARGET_LEXICAL_OWNER',
  'LexicalOS-owned durable knowledge must not be duplicated into Translation transfer ledger'
);

// Private evidence stays browser-local; shared Current is not a learner ledger.
check(workspace.includes('localStorage.setItem'), 'Translation private learner state must persist on-device');
check(workspace.includes('不会写回 GitHub shared Current'), 'learner-facing UI must state that private evidence is not shared Current truth');

const result = {
  schema: 'kianos.english.translation.evidence-gate-validation.v1',
  gate: 'E',
  decision: issues.length ? 'BLOCKED' : 'PASS',
  pass: issues.length === 0,
  counts: { checks, issues: issues.length },
  boundaries: {
    wholeSetReviewFineEvidence: true,
    immutableFirstEvidence: true,
    cascadeCollapse: true,
    reconstructionNotMastery: true,
    oldTaskCannotClose: true,
    repeatedTaskCannotClose: true,
    irrelevantDoesNotConfirm: true,
    sameTaskEvidenceIdempotent: true,
    freshSemanticClosure: true,
    contradictionReopens: true,
    nonReusableNoDebt: true,
    lexicalRoutesToCanonicalOwner: true,
    privateEvidenceLocal: true
  },
  issues
};

const out = process.env.KIANOS_TRANSLATION_EVIDENCE_GATE_OUT;
if (out) fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (!result.pass) process.exit(1);
