import fs from 'node:fs';
import {
  inspectTranslationSources,
  listTranslationSets,
  loadTranslationById,
  loadTranslationReferencesById
} from '../src/lib/englishTranslation.mjs';
import {
  TRANSLATION_RETURN_SCHEMA,
  blankTranslationState,
  blankTransferLedger,
  normalizeTranslationState,
  pendingTransferTargets,
  freezeWholeAttempt,
  passCleanAttempt,
  routeAttemptToReview,
  parseTranslationReturn,
  applyTranslationReturn,
  saveReconstruction
} from '../src/lib/translationRuntimeModel.mjs';

const issues = [];
const referenceGaps = [];
const summary = {
  status: 'unknown',
  sets: 0,
  prompts: 0,
  referencesAvailable: 0,
  referenceGaps: 0,
  completeReferenceSets: 0,
  partialReferenceSets: 0,
  withSource: 0,
  journeyChecks: 0,
  issueCount: 0
};

function read(relativeUrl) {
  return fs.readFileSync(new URL(relativeUrl, import.meta.url), 'utf8');
}

function present(value) {
  return String(value ?? '').trim().length > 0;
}

function check(condition, message) {
  summary.journeyChecks += 1;
  if (!condition) issues.push(`journey: ${message}`);
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

function sourcePresent(task) {
  return (task.material || []).some((item) => present(item?.text))
    || (task.prompts || []).some((item) => present(item?.sourceText));
}

function validateSourceProjection() {
  const state = inspectTranslationSources();
  const sets = listTranslationSets();
  summary.status = state.status;
  summary.sets = sets.length;

  if (state.status !== 'ready') {
    issues.push(`source not ready: ${(state.issues || []).join(' | ') || state.status}`);
    issues.push(`available sections: ${(state.availableSections || []).map((row) => `${row.section}:${row.setCount}`).join(', ') || 'none'}`);
    return;
  }
  if (!sets.length) issues.push('no Translation sets resolved from Current question bank');
  if (!state.sections?.length) issues.push('no Current Translation section resolved');
  if (!state.sections.every((section) => /translation/i.test(String(section)))) {
    issues.push(`resolved section does not visibly identify Translation: ${state.sections.join(', ')}`);
  }

  for (const catalogItem of sets) {
    try {
      const task = loadTranslationById(catalogItem.id);
      const reference = loadTranslationReferencesById(catalogItem.id);
      const prompts = task.prompts || [];
      const rows = reference.references || [];
      summary.prompts += prompts.length;
      summary.referencesAvailable += rows.filter((row) => row.available && present(row.text)).length;
      if (sourcePresent(task)) summary.withSource += 1;
      else issues.push(`${task.objectId}: no learner-facing source text projection`);
      if (!prompts.length) issues.push(`${task.objectId}: no stable prompt/task rows`);
      if (task.sourcePaths?.contract !== 'content/english/modules/translation/learning.md') {
        issues.push(`${task.objectId}: runtime contract path is not Current Translation owner (${task.sourcePaths?.contract || 'missing'})`);
      }
      if (reference.objectId !== task.objectId || reference.task !== 'translation') {
        issues.push(`${task.objectId}: reference payload identity mismatch`);
      }
      if (rows.length !== prompts.length) {
        issues.push(`${task.objectId}: reference/prompt row count mismatch ${rows.length}/${prompts.length}`);
      }
      if (reference.availableCount + reference.missingCount !== reference.totalCount) {
        issues.push(`${task.objectId}: reference coverage arithmetic invalid`);
      }
      if (reference.missingCount > 0) summary.partialReferenceSets += 1;
      else summary.completeReferenceSets += 1;

      const promptIds = new Set(prompts.map((item) => String(item?.id || '')));
      for (const prompt of prompts) {
        if (!present(prompt?.id)) issues.push(`${task.objectId}: prompt without stable id`);
        if (Object.prototype.hasOwnProperty.call(prompt, 'answer')
          || Object.prototype.hasOwnProperty.call(prompt, 'formal_answer')
          || Object.prototype.hasOwnProperty.call(prompt, 'correct_answer')
          || Object.prototype.hasOwnProperty.call(prompt, 'analysis')) {
          issues.push(`${task.objectId}:${prompt.id}: answer/analysis leaked into clean attempt projection`);
        }
      }
      for (const row of rows) {
        if (!promptIds.has(String(row?.id || ''))) {
          issues.push(`${task.objectId}:${row?.id || '?'}: reference id does not match prompt id`);
        }
        if (row.available && !present(row.text)) {
          issues.push(`${task.objectId}:${row?.id || '?'}: reference marked available without text`);
        }
        if (!row.available) {
          referenceGaps.push({ setId: task.objectId, id: row?.id || '?', status: row?.status || '' });
          if (row.status !== 'pending_review') {
            issues.push(`${task.objectId}:${row?.id || '?'}: missing reference is not explicitly pending_review (${row.status || 'unknown'})`);
          }
        }
      }
    } catch (error) {
      issues.push(`${catalogItem.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  summary.referenceGaps = referenceGaps.length;
  if (state.completeReferenceSetCount !== summary.completeReferenceSets) {
    issues.push(`inspect/runtime complete-reference count mismatch ${state.completeReferenceSetCount}/${summary.completeReferenceSets}`);
  }
  if (state.partialReferenceSetCount !== summary.partialReferenceSets) {
    issues.push(`inspect/runtime partial-reference count mismatch ${state.partialReferenceSetCount}/${summary.partialReferenceSets}`);
  }
  if ((state.referenceGaps || []).length !== summary.referenceGaps) {
    issues.push(`inspect/runtime reference-gap count mismatch ${(state.referenceGaps || []).length}/${summary.referenceGaps}`);
  }
}

function validateContractAndUi() {
  const manifest = JSON.parse(read('../../content/english/manifest.json'));
  const contract = read('../../content/english/modules/translation/learning.md');
  const scanner = read('../src/lib/englishTranslation.mjs');
  const model = read('../src/lib/translationRuntimeModel.mjs');
  const workspace = read('../src/components/TranslationWorkspace.astro');
  const evidenceGuard = read('../src/components/TranslationEvidenceGuard.astro');
  const referenceLoader = read('../src/components/TranslationReferenceLoader.astro');
  const referenceEndpoint = read('../src/pages/translation-reference/[id].json.js');
  const home = read('../src/pages/translation.astro');
  const taskPage = read('../src/pages/translation/[id].astro');
  const learnPage = read('../src/pages/translation-learn.astro');

  const requireText = (label, text, needle) => {
    if (!text.includes(needle)) issues.push(`${label}: missing ${needle}`);
  };
  const forbidText = (label, text, needle) => {
    if (text.includes(needle)) issues.push(`${label}: forbidden stale/incorrect coupling ${needle}`);
  };

  if (manifest?.owners?.translation_contract !== 'content/english/modules/translation/learning.md') {
    issues.push(`manifest: Translation owner mismatch ${manifest?.owners?.translation_contract || 'missing'}`);
  }

  requireText('contract', contract, 'ATTEMPT');
  requireText('contract', contract, 'PASS');
  // Current compact learning owner delegates detailed protocol to its explicit reference.
  const protocol = read('../../content/english/modules/translation/learning.reference.md');
  requireText('contract', contract, 'learning.reference.md');
  requireText('reference protocol', protocol, 'TRANSFER_PENDING');
  requireText('reference protocol', protocol, 'CLOSED');
  requireText('contract', contract, 'Evidence granularity may be smaller than Review granularity.');
  requireText('scanner', scanner, "contract: 'content/english/modules/translation/learning.md'");
  requireText('scanner', scanner, 'MANIFEST_TRANSLATION_OWNER_MISMATCH');
  forbidText('scanner', scanner, "content/english/modules/translation.md'");

  requireText('model', model, 'wholeAttemptMissing');
  requireText('model', model, 'passCleanAttempt');
  requireText('model', model, 'parseTranslationReturn');
  requireText('model', model, 'pendingTransferTargets');
  requireText('model', model, 'applyTransferUpdates');
  requireText('model', model, 'RETURN_PACKET_TRANSFER_TARGET_INCOMPLETE');
  requireText('model', model, 'RETURN_PACKET_TRANSFER_TARGET_UNKNOWN');
  requireText('model', model, 'RETURN_PACKET_TRANSFER_UPDATE_DUPLICATE');
  requireText('model', model, 'repairSignature');
  requireText('model', model, "task === clean(target.sourceTask)");
  requireText('model', model, 'priorIndex');

  requireText('workspace', workspace, 'data-attempt-id');
  requireText('workspace', workspace, 'data-pass-clean');
  requireText('workspace', workspace, 'data-route-review');
  requireText('workspace', workspace, 'KIANOS_TRANSLATION_HANDOFF_V2');
  requireText('workspace', workspace, 'data-chat-return');
  requireText('workspace', workspace, 'data-import-return');
  requireText('workspace', workspace, 'dataset.reconstructId');
  requireText('workspace', workspace, 'TRANSFER_PENDING');
  requireText('workspace', workspace, 'pendingTransferTargets');
  requireText('workspace', workspace, 'referenceRevealed');
  forbidText('workspace', workspace, 'Priority 1 · Meaning / load-bearing');
  forbidText('workspace', workspace, 'Priority 2 · Naturalness / structure');
  forbidText('workspace', workspace, 'data-first-draft');

  requireText('evidence guard', evidenceGuard, "stage === 'attempt' ? 'none' : ''");
  forbidText('evidence guard', evidenceGuard, "stage === 'attempt' || stage === 'decision'");
  requireText('evidence guard', evidenceGuard, '发现问题 → 回 Review');

  requireText('reference loader', referenceLoader, 'fetch(referenceUrl');
  requireText('reference loader', referenceLoader, 'REFERENCE_IDENTITY_MISMATCH');
  requireText('reference loader', referenceLoader, 'buildHandoffWithReference');
  requireText('reference endpoint', referenceEndpoint, 'loadTranslationReferencesById');
  requireText('reference endpoint', referenceEndpoint, 'application/json; charset=utf-8');
  requireText('reference endpoint', referenceEndpoint, 'max-age=0, must-revalidate');
  forbidText('reference endpoint', referenceEndpoint, 'immutable');
  requireText('task page', taskPage, 'TranslationReferenceLoader');
  requireText('task page', taskPage, 'references: []');
  requireText('task page', taskPage, 'translation-reference/');
  forbidText('task page', taskPage, 'loadTranslationReferencesById');

  requireText('home', home, 'Productive lane');
  requireText('home', home, 'translation-learn');
  forbidText('home', home, 'pendingTransferTargets(');
  forbidText('home', home, 'target.label');
  forbidText('home', home, 'target.underlyingDemand');
  requireText('learn page', learnPage, "['B1', 'B1 · Representation']");
  requireText('learn page', learnPage, 'Skill Map + Deep Repair');
  requireText('learn page', learnPage, '系统 / Chat 参考');
}

function validateLearnerJourneys() {
  const prompts = [
    { id: 's1', ordinal: 1, sourceText: 'Source one.' },
    { id: 's2', ordinal: 2, sourceText: 'Source two.' }
  ];

  let state = blankTranslationState(prompts);
  state.drafts.s1 = '译文一';
  let frozen = freezeWholeAttempt(state, prompts, '2026-09-12T00:00:00.000Z');
  check(frozen.ok === false, 'partial set must not freeze');
  check(frozen.missing.length === 1 && frozen.missing[0] === 's2', 'missing segment must be identified');

  state.drafts.s2 = '译文二';
  frozen = freezeWholeAttempt(state, prompts, '2026-09-12T00:01:00.000Z');
  check(frozen.ok === true && frozen.state.stage === 'decision', 'complete clean attempt must reach PASS/Review decision');
  const passed = passCleanAttempt(frozen.state, '2026-09-12T00:02:00.000Z');
  check(passed.stage === 'passed' && passed.decision === 'PASS', 'stable work must have executable PASS path');
  check(passed.pendingTransferCandidate == null, 'clean PASS must not manufacture a transfer target');

  const corrupted = normalizeTranslationState(prompts, { ...frozen.state, version: 2, stage: 'broken-stage' });
  check(corrupted.stage === 'decision', 'complete saved attempt with invalid stage must fail safe to decision');

  state = blankTranslationState(prompts);
  state.drafts.s1 = '第一次一';
  state.drafts.s2 = '第一次二';
  frozen = freezeWholeAttempt(state, prompts, '2026-09-12T01:00:00.000Z');
  state = routeAttemptToReview(frozen.state);
  check(state.stage === 'diagnosis', 'Need Review must enter whole-set diagnosis');

  const repairPayload = {
    task: 'task-a',
    decision: 'REPAIR_NEEDED',
    primary_failure: {
      layer: 'English Representation',
      skill: 'R4 Scope',
      affected_segments: ['s2'],
      minimal_repair: '先确定否定作用域，再恢复命题强度。',
      reconstruction_prompt: '只重新翻译 Segment 2。'
    },
    transfer_target: {
      admit: true,
      target_id: 'translation:r4:scope-strength',
      label: 'Scope 强度保持',
      layer: 'English Representation',
      skill: 'R4 Scope',
      underlying_demand: '在新句中正确处理否定 / modality 对命题强度的限制。'
    },
    transfer_updates: []
  };
  const parsedRepair = parseTranslationReturn(packet(repairPayload), 'task-a');
  let ledger = blankTransferLedger();
  let applied = applyTranslationReturn(state, parsedRepair, prompts, ledger, { task: 'task-a', now: '2026-09-12T01:01:00.000Z' });
  state = applied.state;
  ledger = applied.ledger;
  check(state.stage === 'reconstruct', 'REPAIR_NEEDED return must enter Reconstruction');
  check(state.affectedSegments.length === 1 && state.affectedSegments[0] === 's2', 'repair must preserve segment-bound evidence without splitting learner review flow');
  state.reconstructDrafts.s2 = '修复后的第二句';

  const identicalRepair = applyTranslationReturn(state, parsedRepair, prompts, ledger, { task: 'task-a', now: '2026-09-12T01:01:30.000Z' });
  check(identicalRepair.state.reconstructDrafts.s2 === '修复后的第二句', 're-importing identical repair must not erase reconstruction work');

  const revisedRepair = parseTranslationReturn(packet({
    ...repairPayload,
    primary_failure: {
      ...repairPayload.primary_failure,
      minimal_repair: '先固定否定 scope，再检查 modality 强度，不要把部分否定译成全否定。'
    }
  }), 'task-a');
  const revised = applyTranslationReturn(state, revisedRepair, prompts, ledger, { task: 'task-a', now: '2026-09-12T01:01:40.000Z' });
  check(revised.state.reconstructDrafts.s2 === '', 'changed repair must clear stale reconstruction draft before re-execution');

  state = identicalRepair.state;
  const repaired = saveReconstruction(state, ledger, { task: 'task-a', now: '2026-09-12T01:02:00.000Z' });
  check(repaired.ok === true && repaired.state.stage === 'transfer_pending', 'reusable repaired failure must become TRANSFER_PENDING');
  check(pendingTransferTargets(repaired.ledger).length === 1, 'admitted reusable target must exist in private transfer ledger');

  expectThrows(
    () => parseTranslationReturn(packet({
      task: 'task-a',
      decision: 'REPAIR_NEEDED',
      primary_failure: { layer: 'English Representation', affected_segments: ['s2'], minimal_repair: 'repair' },
      transfer_target: { admit: true, target_id: 'broken', label: 'Broken' }
    }), 'task-a'),
    'RETURN_PACKET_TRANSFER_TARGET_INCOMPLETE',
    'admitted transfer target must contain durable demand before UI can claim TRANSFER_PENDING'
  );

  expectThrows(
    () => parseTranslationReturn(`${TRANSLATION_RETURN_SCHEMA}\n${JSON.stringify({ task: 'task-a', decision: 'PASS' })}`, 'task-a'),
    'RETURN_PACKET_SCHEMA_INVALID',
    'Return marker in prose must not substitute for exact JSON schema identity'
  );

  expectThrows(
    () => parseTranslationReturn(packet({ task: 'wrong-task', decision: 'PASS' }), 'task-a'),
    'RETURN_PACKET_TASK_MISMATCH',
    'Return from another Translation set must not import into this task'
  );

  const invalidSegment = parseTranslationReturn(packet({
    task: 'task-a',
    decision: 'REPAIR_NEEDED',
    primary_failure: {
      layer: 'English Representation',
      affected_segments: ['not-a-segment'],
      minimal_repair: 'repair'
    },
    transfer_target: { admit: false },
    transfer_updates: []
  }), 'task-a');
  expectThrows(
    () => applyTranslationReturn(state, invalidSegment, prompts, repaired.ledger, { task: 'task-a' }),
    'RETURN_PACKET_AFFECTED_SEGMENT_INVALID',
    'invalid segment address must be rejected rather than silently widening repair to whole set'
  );

  expectThrows(
    () => parseTranslationReturn(packet({
      task: 'task-b',
      decision: 'PASS',
      transfer_updates: [{ target_id: 'translation:r4:scope-strength', relation: 'irrelevant', note: 'not tested', close: true }]
    }), 'task-b'),
    'RETURN_PACKET_TRANSFER_CLOSE_INVALID',
    'irrelevant or contradictory material must not carry a close flag'
  );

  expectThrows(
    () => parseTranslationReturn(packet({
      task: 'task-b',
      decision: 'PASS',
      transfer_updates: [
        { target_id: 'translation:r4:scope-strength', relation: 'support', note: 'one', close: false },
        { target_id: 'translation:r4:scope-strength', relation: 'support', note: 'two', close: false }
      ]
    }), 'task-b'),
    'RETURN_PACKET_TRANSFER_UPDATE_DUPLICATE',
    'one fresh task must not submit multiple updates for the same target'
  );

  const freshState = freezeWholeAttempt(Object.assign(blankTranslationState(prompts), { drafts: { s1: '新译文一', s2: '新译文二' } }), prompts).state;

  const unknownTarget = parseTranslationReturn(packet({
    task: 'task-b',
    decision: 'PASS',
    transfer_updates: [{ target_id: 'translation:unknown', relation: 'support', note: 'typo', close: false }]
  }), 'task-b');
  expectThrows(
    () => applyTranslationReturn(routeAttemptToReview(freshState), unknownTarget, prompts, repaired.ledger, { task: 'task-b' }),
    'RETURN_PACKET_TRANSFER_TARGET_UNKNOWN',
    'mistyped transfer target must fail closed instead of silently losing evidence'
  );

  const sameTaskSupport = parseTranslationReturn(packet({
    task: 'task-a',
    decision: 'PASS',
    transfer_updates: [{
      target_id: 'translation:r4:scope-strength',
      relation: 'support',
      note: 'same task must not count as fresh evidence',
      close: true
    }]
  }), 'task-a');
  applied = applyTranslationReturn(routeAttemptToReview(freshState), sameTaskSupport, prompts, repaired.ledger, { task: 'task-a', now: '2026-09-12T02:00:00.000Z' });
  check(pendingTransferTargets(applied.ledger).length === 1, 'source task must never close its own transfer target');
  check((applied.ledger.targets[0]?.evidence || []).length === 0, 'source task must not even enter fresh transfer evidence');

  const irrelevantPacket = parseTranslationReturn(packet({
    task: 'task-b',
    decision: 'PASS',
    transfer_updates: [{
      target_id: 'translation:r4:scope-strength',
      relation: 'irrelevant',
      note: '本题没有真正测试该 scope demand。',
      close: false
    }]
  }), 'task-b');
  applied = applyTranslationReturn(routeAttemptToReview(freshState), irrelevantPacket, prompts, applied.ledger, { task: 'task-b', now: '2026-09-13T00:00:00.000Z' });
  check(pendingTransferTargets(applied.ledger).length === 1, 'irrelevant later material must not close a pending target');

  const supportB = parseTranslationReturn(packet({
    task: 'task-b',
    decision: 'PASS',
    transfer_updates: [{
      target_id: 'translation:r4:scope-strength',
      relation: 'support',
      note: 'same later task imported again should replace its old evidence, not stack counts',
      close: false
    }]
  }), 'task-b');
  applied = applyTranslationReturn(routeAttemptToReview(freshState), supportB, prompts, applied.ledger, { task: 'task-b', now: '2026-09-13T00:05:00.000Z' });
  const afterFirstSupportCount = applied.ledger.targets[0]?.evidence?.length || 0;
  applied = applyTranslationReturn(routeAttemptToReview(freshState), supportB, prompts, applied.ledger, { task: 'task-b', now: '2026-09-13T00:06:00.000Z' });
  check((applied.ledger.targets[0]?.evidence?.length || 0) === afterFirstSupportCount, 're-importing same later task must be idempotent evidence');

  const supportPacket = parseTranslationReturn(packet({
    task: 'task-c',
    decision: 'PASS',
    transfer_updates: [{
      target_id: 'translation:r4:scope-strength',
      relation: 'support',
      note: '新句独立正确处理相同 scope demand。',
      close: true
    }]
  }), 'task-c');
  applied = applyTranslationReturn(routeAttemptToReview(freshState), supportPacket, prompts, applied.ledger, { task: 'task-c', now: '2026-09-14T00:00:00.000Z' });
  check(pendingTransferTargets(applied.ledger).length === 0, 'meaningful fresh support with semantic close must reach CLOSED');
  check(applied.ledger.targets[0]?.status === 'closed', 'closed transfer target must remain explicit evidence, not disappear');
}

validateSourceProjection();
validateContractAndUi();
validateLearnerJourneys();
summary.issueCount = issues.length;
console.log(JSON.stringify(summary, null, 2));
if (referenceGaps.length) {
  console.log('\nKnown Current reference gaps (runtime remains usable; no answer is fabricated):');
  referenceGaps.forEach((gap) => console.log(`- ${gap.setId}:${gap.id}:${gap.status}`));
}

if (issues.length) {
  console.error('\nTranslation runtime issues:');
  issues.slice(0, 200).forEach((issue) => console.error(`- ${issue}`));
  if (issues.length > 200) console.error(`- … ${issues.length - 200} more`);
  process.exitCode = 1;
}
