import {
  listPoliticsChapterPathsCurrent,
  loadPoliticsChapterCurrent
} from '../src/lib/politicsCurrent.mjs';
import { enrichPoliticsChapterCurrent } from '../src/lib/politicsRepairMemory.mjs';
import {
  buildPoliticsUnitReturnConfigs,
  evaluatePoliticsUnitReturn,
  recordPoliticsFirstAttempt
} from '../src/lib/politicsUnitReturn.mjs';

const K03 = 'POL27-CF-MARX-C02-K03';
const EXPECTED_COUNTS = new Map(Object.entries({
  'POL27-CF-MARX-C00-S01': 7,
  'POL27-CF-MARX-C00-S02': 3,
  'POL27-CF-MARX-C01-S01': 6,
  'POL27-CF-MARX-C01-S02': 26,
  'POL27-CF-MARX-C02-S01': 28,
  [K03]: 11,
  'POL27-CF-MARX-C02-S02': 8,
  'POL27-CF-MARX-C03-S01': 31,
  'POL27-CF-MARX-C03-S02': 22,
  'POL27-CF-MARX-C03-S03': 6,
  'POL27-CF-MARX-C04-S01': 43,
  'POL27-CF-MARX-C04-S02': 6,
  'POL27-CF-MARX-C04-S03': 10,
  'POL27-CF-MARX-C05-S01': 39,
  'POL27-CF-MARX-C05-S02': 68,
  'POL27-CF-MARX-C05-S03': 6,
  'POL27-CF-MARX-C06-S01': 27,
  'POL27-CF-MARX-C06-S02': 16,
  'POL27-CF-MARX-C06-S03': 1,
  'POL27-CF-MARX-C07-S01': 18,
  'POL27-CF-MARX-C07-S02': 8,
  'POL27-CF-MARX-C08': 6
}));

function fail(message) {
  throw new Error(`POLITICS_MARXISM_RUNTIME_EVIDENCE_AUDIT_FAIL:${message}`);
}

function recordAll(config, firstOutcome = 'STABLE') {
  let snapshot = { schema: 'kianos.politics.attempt_snapshot.v1', units: {} };
  for (let index = 0; index < config.expected_question_ids.length; index += 1) {
    const questionId = config.expected_question_ids[index];
    const outcome = index === 0 ? firstOutcome : 'STABLE';
    const result = recordPoliticsFirstAttempt(snapshot, config, {
      question_id: questionId,
      outcome,
      selected: outcome === 'WRONG' ? 'A' : 'B',
      correct_answer: 'B',
      study_day: '2026-09-12',
      observed_at: `2026-09-12T00:${String(index).padStart(2, '0')}:00.000Z`
    });
    if (!result.recorded) fail(`${config.natural_unit_id} failed to record ${questionId}:${result.reason}`);
    snapshot = result.store;
  }
  return snapshot;
}

const configs = [];
for (const path of listPoliticsChapterPathsCurrent().filter((row) => row.subject === 'marxism')) {
  const chapter = enrichPoliticsChapterCurrent(loadPoliticsChapterCurrent(path.subject, path.chapter));
  const chapterConfigs = buildPoliticsUnitReturnConfigs(chapter);
  const questionUnits = (chapter.units || []).filter((unit) => (unit.questions || []).length > 0);
  const configuredRuntimeIds = new Set(chapterConfigs.map((config) => config.runtime_unit_id));
  for (const unit of questionUnits) {
    if (!configuredRuntimeIds.has(unit.unitId)) fail(`${path.chapter} rendered unit lacks Unit Return config: ${unit.unitId}`);
  }
  configs.push(...chapterConfigs);
}

if (configs.length !== EXPECTED_COUNTS.size) fail(`expected ${EXPECTED_COUNTS.size} configs, got ${configs.length}`);

const configByUnit = new Map(configs.map((config) => [config.natural_unit_id, config]));
for (const [unitId, expectedCount] of EXPECTED_COUNTS.entries()) {
  const config = configByUnit.get(unitId);
  if (!config) fail(`missing config ${unitId}`);
  if (config.expected_question_count !== expectedCount) {
    fail(`${unitId} expected ${expectedCount} questions, got ${config.expected_question_count}`);
  }
  if (config.learner_state !== 'PENDING_ATTEMPT_EVIDENCE') fail(`${unitId} precomputed learner state`);
  if (config.mastery_claim !== 'NONE') fail(`${unitId} claims mastery`);

  if (unitId === K03) {
    if (config.evidence_precision !== 'CANONICAL_NODE_MAPPING') fail('K03 lost canonical-node precision');
    if (config.nodes.length !== 4) fail(`K03 expected 4 nodes, got ${config.nodes.length}`);
  } else {
    if (config.evidence_precision !== 'NATURAL_UNIT_SAFE_FALLBACK') fail(`${unitId} falsely claims fine precision`);
    if (config.nodes.length !== 1) fail(`${unitId} safe fallback must have exactly one node`);
    if (config.nodes[0].node_id !== unitId) fail(`${unitId} fallback node does not equal canonical Natural Unit`);
  }

  const stable = evaluatePoliticsUnitReturn(config, recordAll(config, 'STABLE'));
  if (!stable.ready || stable.unit_state !== 'STABLE' || stable.mastery_claim !== 'NONE') {
    fail(`${unitId} clean path did not close as this-pass STABLE`);
  }

  const wrongSnapshot = recordAll(config, 'WRONG');
  const wrong = evaluatePoliticsUnitReturn(config, wrongSnapshot);
  if (!wrong.ready || wrong.unit_state !== 'REPAIR' || wrong.mastery_claim !== 'NONE') {
    fail(`${unitId} wrong path did not close as REPAIR`);
  }

  const uncertain = evaluatePoliticsUnitReturn(config, recordAll(config, 'UNCERTAIN'));
  if (!uncertain.ready || uncertain.unit_state !== 'UNCERTAIN' || uncertain.mastery_claim !== 'NONE') {
    fail(`${unitId} uncertain path did not close as UNCERTAIN`);
  }

  const firstQuestion = config.expected_question_ids[0];
  const duplicate = recordPoliticsFirstAttempt(wrongSnapshot, config, {
    question_id: firstQuestion,
    outcome: 'STABLE',
    selected: 'B',
    correct_answer: 'B'
  });
  if (duplicate.recorded || duplicate.reason !== 'FIRST_ATTEMPT_ALREADY_RECORDED') {
    fail(`${unitId} duplicate first attempt was not rejected`);
  }
  const preserved = evaluatePoliticsUnitReturn(config, duplicate.store);
  if (preserved.unit_state !== 'REPAIR') fail(`${unitId} duplicate submission rewrote first evidence`);

  const outOfScope = recordPoliticsFirstAttempt(wrongSnapshot, config, {
    question_id: 'X1000-MARX-S-999',
    outcome: 'WRONG'
  });
  if (outOfScope.recorded || outOfScope.reason !== 'INVALID_OR_OUT_OF_SCOPE') {
    fail(`${unitId} accepted out-of-scope evidence`);
  }
}

const allQuestionIds = configs.flatMap((config) => config.expected_question_ids);
const uniqueQuestionIds = new Set(allQuestionIds);
if (allQuestionIds.length !== 396) fail(`expected 396 emitted evidence questions, got ${allQuestionIds.length}`);
if (uniqueQuestionIds.size !== 396) fail(`expected 396 unique evidence questions, got ${uniqueQuestionIds.size}`);

console.log('POLITICS_MARXISM_RUNTIME_EVIDENCE_AUDIT');
console.log(JSON.stringify({
  status: 'PASS',
  unitReturnConfigCount: configs.length,
  emittedQuestionCount: allQuestionIds.length,
  uniqueQuestionCount: uniqueQuestionIds.size,
  canonicalNodePrecisionUnits: configs.filter((config) => config.evidence_precision === 'CANONICAL_NODE_MAPPING').map((config) => config.natural_unit_id),
  safeNaturalUnitPrecisionCount: configs.filter((config) => config.evidence_precision === 'NATURAL_UNIT_SAFE_FALLBACK').length,
  cleanWrongUncertainPathsChecked: configs.length,
  duplicateFirstAttemptProtection: true,
  outOfScopeProtection: true,
  masteryClaim: 'NONE'
}, null, 2));
