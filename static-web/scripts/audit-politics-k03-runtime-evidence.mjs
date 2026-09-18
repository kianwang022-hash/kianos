import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';
import { enrichPoliticsChapterCurrent } from '../src/lib/politicsRepairMemory.mjs';
import { PRACTICE_KEYS } from '../src/lib/politicsPracticeState.mjs';
import {
  buildPoliticsUnitReturnConfigs,
  evaluatePoliticsUnitReturn,
  recordPoliticsFirstAttempt
} from '../src/lib/politicsUnitReturn.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const K03 = 'POL27-CF-MARX-C02-K03';
const EXPECTED = ['X1000-MARX-S-028','X1000-MARX-S-039','X1000-MARX-M-027','X1000-MARX-M-028','X1000-MARX-M-030'];

function attempt(questionId, outcome = 'STABLE') {
  return {
    question_id: questionId,
    outcome,
    selected: 'A',
    correct_answer: 'A',
    study_day: '2026-09-12',
    observed_at: `2026-09-12T00:${String(EXPECTED.indexOf(questionId) + 1).padStart(2, '0')}:00.000Z`
  };
}

function buildSnapshot(config, overrides = {}) {
  let store = { schema: 'kianos.politics.attempt_snapshot.v1', units: {} };
  for (const questionId of EXPECTED) {
    const result = recordPoliticsFirstAttempt(store, config, attempt(questionId, overrides[questionId] || 'STABLE'));
    assert.equal(result.recorded, true, `first attempt must record once: ${questionId}`);
    store = result.store;
  }
  return store;
}

const chapter = enrichPoliticsChapterCurrent(loadPoliticsChapterCurrent('marxism', 'ch02'));
const configs = buildPoliticsUnitReturnConfigs(chapter);
const k03Configs = configs.filter((candidate) => candidate.natural_unit_id === K03);
assert.equal(k03Configs.length, 1, 'K03 pilot must expose exactly one K03 Unit Return config');
const config = k03Configs[0];
assert.equal(config.natural_unit_id, K03);
assert.equal(config.learner_state, 'PENDING_ATTEMPT_EVIDENCE', 'shared Current must not precompute learner state');
assert.equal(config.mastery_claim, 'NONE', 'Unit Return must not preclaim mastery');
assert.deepEqual(config.expected_question_ids, EXPECTED, 'Unit Return must consume exactly the 5 formal first-ready questions in learner order');
assert.equal(config.expected_question_count, 5);
assert.equal(config.nodes.length, 3);
assert.equal(config.current_node_edge_count, 5, 'only independently first-ready question edges may count as current evidence');

const nodeBySuffix = (suffix) => config.nodes.find((node) => node.node_id.endsWith(suffix));
assert.deepEqual(nodeBySuffix('N01')?.question_ids, ['X1000-MARX-S-039','X1000-MARX-M-027']);
assert.equal(nodeBySuffix('N01')?.deferred_question_count, 7);
assert.deepEqual(nodeBySuffix('N02')?.question_ids, ['X1000-MARX-S-028','X1000-MARX-M-028']);
assert.deepEqual(nodeBySuffix('N03')?.question_ids, ['X1000-MARX-M-030']);
assert.equal(nodeBySuffix('N03')?.deferred_question_count, 2);
assert.equal(nodeBySuffix('N04'), undefined, 'an untested node must not receive invented stable evidence');

const emptySnapshot = { schema: 'kianos.politics.attempt_snapshot.v1', units: {} };
const persistenceCandidate = recordPoliticsFirstAttempt(emptySnapshot, config, attempt(EXPECTED[0]));
assert.equal(persistenceCandidate.recorded, true);
assert.equal(evaluatePoliticsUnitReturn(config, emptySnapshot).completed_question_count, 0, 'record helper must not mutate the accepted snapshot before persistence succeeds');
assert.equal(evaluatePoliticsUnitReturn(config, persistenceCandidate.store).completed_question_count, 1, 'persistable candidate may advance only after caller accepts it');

let partialStore = emptySnapshot;
for (const questionId of EXPECTED.slice(0, -1)) {
  partialStore = recordPoliticsFirstAttempt(partialStore, config, attempt(questionId)).store;
}
const pending = evaluatePoliticsUnitReturn(config, partialStore);
assert.equal(pending.ready, false, 'Unit Return must not appear before all 5 real first attempts exist');
assert.equal(pending.completed_question_count, 4);
assert.deepEqual(pending.pending_question_ids, [EXPECTED.at(-1)]);
assert.equal(pending.unit_state, 'PENDING');
assert.equal(pending.mastery_claim, 'NONE');

const finalRecord = recordPoliticsFirstAttempt(partialStore, config, attempt(EXPECTED.at(-1)));
assert.equal(finalRecord.recorded, true);
const clean = evaluatePoliticsUnitReturn(config, finalRecord.store);
assert.equal(clean.ready, true);
assert.equal(clean.unit_state, 'STABLE');
assert.ok(clean.nodes.every((node) => node.state === 'STABLE'));
assert.equal(clean.mastery_claim, 'NONE', 'clean first pass is not permanent mastery');

const duplicate = recordPoliticsFirstAttempt(finalRecord.store, config, attempt(EXPECTED[0], 'WRONG'));
assert.equal(duplicate.recorded, false, 'reload/re-submit must not overwrite first meaningful evidence');
assert.equal(duplicate.reason, 'FIRST_ATTEMPT_ALREADY_RECORDED');
assert.equal(evaluatePoliticsUnitReturn(config, duplicate.store).unit_state, 'STABLE', 'later same-item resubmission must not rewrite the original first attempt');

const outOfScope = recordPoliticsFirstAttempt(finalRecord.store, config, attempt('X1000-MARX-M-029', 'WRONG'));
assert.equal(outOfScope.recorded, false, 'deferred question must not mutate the K03 first-ready snapshot');
assert.equal(outOfScope.reason, 'INVALID_OR_OUT_OF_SCOPE');

const uncertain = evaluatePoliticsUnitReturn(config, buildSnapshot(config, { 'X1000-MARX-S-028': 'UNCERTAIN' }));
assert.equal(uncertain.ready, true);
assert.equal(uncertain.unit_state, 'UNCERTAIN');
assert.equal(uncertain.nodes.find((node) => node.node_id.endsWith('N02'))?.state, 'UNCERTAIN');
assert.ok(uncertain.nodes.filter((node) => !node.node_id.endsWith('N02')).every((node) => node.state === 'STABLE'));

const wrong = evaluatePoliticsUnitReturn(config, buildSnapshot(config, { 'X1000-MARX-M-027': 'WRONG' }));
assert.equal(wrong.ready, true);
assert.equal(wrong.unit_state, 'REPAIR');
assert.equal(wrong.nodes.find((node) => node.node_id.endsWith('N01'))?.state, 'REPAIR');
assert.equal(wrong.nodes.find((node) => node.node_id.endsWith('N04')), undefined);
assert.equal(wrong.nodes.find((node) => node.node_id.endsWith('N02'))?.state, 'STABLE');
assert.equal(wrong.nodes.find((node) => node.node_id.endsWith('N03'))?.state, 'STABLE');

const chapterRuntimeSource = fs.readFileSync(path.join(repoRoot, 'static-web/src/components/PoliticsChapterRuntime.astro'), 'utf8');
const cognitiveWorkspaceSource = fs.readFileSync(path.join(repoRoot, 'static-web/src/components/PoliticsCognitiveWorkspace.astro'), 'utf8');
const practiceClientSource = fs.readFileSync(path.join(repoRoot, 'static-web/src/lib/politicsPracticeClient.mjs'), 'utf8');
const workbenchSource = fs.readFileSync(path.join(repoRoot, 'static-web/src/components/PoliticsPracticeWorkbench.astro'), 'utf8');
const homeToolsSource = fs.readFileSync(path.join(repoRoot, 'static-web/src/components/PoliticsHomeTools.astro'), 'utf8');
const reviewClientSource = fs.readFileSync(path.join(repoRoot, 'static-web/src/lib/politicsReviewClient.mjs'), 'utf8');
assert.ok(!chapterRuntimeSource.includes('data-politics-question') && !cognitiveWorkspaceSource.includes('data-politics-question'), 'learning pages must not write question attempts');
assert.ok(chapterRuntimeSource.includes('politics/practice/?unit='), 'learning page must hand exact Unit to formal Workbench');
assert.ok(practiceClientSource.includes("if (p.outcome === 'WRONG' || p.uncertain)"), 'formal Workbench must keep durable W/U evidence admission');
assert.ok(workbenchSource.includes('data-takeaway') && workbenchSource.includes('data-chat-explanation'), 'formal Workbench must own prebuilt refined backside Content');
assert.equal(PRACTICE_KEYS.evidence, 'kianos-politics-evidence-v1', 'durable evidence storage identity remains owned by formal Politics practice');
assert.ok(homeToolsSource.includes('readPoliticsSnapshot'), 'Home may read summary learner state');
assert.ok(!homeToolsSource.includes('politicsReviewPacket') && !homeToolsSource.includes('data-politics-copy-handoff'), 'Home must not auto-export Chat handoff packets');
assert.ok(reviewClientSource.includes('politicsReviewPacket'), 'Review must remain the learner-triggered batch packet owner');
assert.ok(!homeToolsSource.includes('kianos-politics-attempts-v1'), 'private attempt storage identity must not be re-declared by Home');

console.log(JSON.stringify({
  status: 'PASS',
  gate: 'K03_RUNTIME_EVIDENCE',
  expected_first_attempts: config.expected_question_count,
  current_node_edges: config.current_node_edge_count,
  nodes: config.nodes.map((node) => ({
    node_id: node.node_id,
    current_questions: node.current_question_count,
    deferred_questions: node.deferred_question_count
  })),
  journeys: {
    pending_4_of_5: 'PENDING',
    stable_5_of_5: clean.unit_state,
    uncertain_s028: uncertain.unit_state,
    wrong_m027_current_node: wrong.unit_state,
    duplicate_first_attempt: duplicate.reason,
    deferred_question_guard: outOfScope.reason,
    persistence_failure_policy: 'FAIL_CLOSED_BEFORE_SNAPSHOT_ADVANCES'
  },
  durable_handoff_policy: 'WRONG_UNCERTAIN_ONLY',
  mastery_claim: clean.mastery_claim
}, null, 2));
