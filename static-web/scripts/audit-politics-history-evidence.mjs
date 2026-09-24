import fs from 'node:fs';
import path from 'node:path';
import { listPoliticsChapterPathsCurrent, loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';
import {
  buildPoliticsUnitReturnConfigs,
  recordPoliticsFirstAttempt,
  evaluatePoliticsUnitReturn
} from '../src/lib/politicsUnitReturn.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const unitReturnEnhancer = fs.readFileSync(path.join(repoRoot, 'static-web/src/components/PoliticsUnitReturnEnhancer.astro'), 'utf8');
const practiceClient = fs.readFileSync(path.join(repoRoot, 'static-web/src/lib/politicsPracticeClient.mjs'), 'utf8');
const failures = [];

function emptyStore() {
  return { schema: 'kianos.politics.attempt_snapshot.v1', units: {} };
}

function recordAll(config, firstOutcome = 'STABLE') {
  let store = emptyStore();
  config.expected_question_ids.forEach((questionId, index) => {
    const result = recordPoliticsFirstAttempt(store, config, {
      question_id: questionId,
      outcome: index === 0 ? firstOutcome : 'STABLE',
      selected: 'A',
      correct_answer: 'A',
      study_day: '2099-01-01',
      observed_at: `2099-01-01T00:00:${String(index).padStart(2, '0')}Z`
    });
    if (!result.recorded) failures.push({ unit: config.runtime_unit_id, question: questionId, code: 'HISTORY_E_FIRST_ATTEMPT_NOT_RECORDED' });
    store = result.store;
  });
  return store;
}

for (const requiredSnippet of [
  "const attemptKey = 'kianos-politics-attempts-v1'",
  'localStorage.setItem',
  'if (!saveJson(attemptKey, recorded.store))',
  'showPersistenceFailure(config)',
  'Unit Return 暂不推进'
]) {
  if (!unitReturnEnhancer.includes(requiredSnippet)) {
    failures.push({ code: 'HISTORY_E_FAIL_CLOSED_PERSISTENCE_GUARD_MISSING', snippet: requiredSnippet });
  }
}

if (!practiceClient.includes("if (p.outcome === 'WRONG' || p.uncertain) {")) {
  failures.push({ code: 'HISTORY_E_DURABLE_REPAIR_DEBT_NOT_GATED' });
}
if (!practiceClient.includes("outcome: p.outcome, uncertain: p.uncertain, selected: p.selected, correct_answer: p.review.answer")) {
  failures.push({ code: 'HISTORY_E_REPAIR_EVENT_OUTCOME_NOT_PRESERVED' });
}

const historyPaths = listPoliticsChapterPathsCurrent()
  .filter((row) => String(row?.subject || '') === 'history')
  .sort((a, b) => String(a.chapter).localeCompare(String(b.chapter), 'en', { numeric: true }));

let configCount = 0;
let questionCount = 0;

for (const row of historyPaths) {
  const chapter = loadPoliticsChapterCurrent(row.subject, row.chapter);
  const configs = buildPoliticsUnitReturnConfigs(chapter);
  configCount += configs.length;

  for (const config of configs) {
    const questionIds = config.expected_question_ids || [];
    questionCount += questionIds.length;
    if (!questionIds.length) {
      failures.push({ chapter: row.chapter, unit: config.runtime_unit_id, code: 'HISTORY_E_EMPTY_EVIDENCE_SCOPE' });
      continue;
    }
    if (config.mastery_claim !== 'NONE') {
      failures.push({ chapter: row.chapter, unit: config.runtime_unit_id, code: 'HISTORY_E_EVIDENCE_MANUFACTURES_MASTERY' });
    }
    if (!['NATURAL_UNIT_SAFE_FALLBACK', 'CANONICAL_NODE_MAPPING'].includes(config.evidence_precision)) {
      failures.push({ chapter: row.chapter, unit: config.runtime_unit_id, code: 'HISTORY_E_UNSAFE_EVIDENCE_PRECISION', precision: config.evidence_precision });
    }

    const firstQuestion = questionIds[0];

    let firstWrong = emptyStore();
    const wrong = recordPoliticsFirstAttempt(firstWrong, config, {
      question_id: firstQuestion,
      outcome: 'WRONG',
      selected: 'B',
      correct_answer: 'A',
      study_day: '2099-01-01',
      observed_at: '2099-01-01T00:00:00Z'
    });
    if (!wrong.recorded) failures.push({ chapter: row.chapter, unit: config.runtime_unit_id, code: 'HISTORY_E_WRONG_FIRST_ATTEMPT_NOT_RECORDED' });
    firstWrong = wrong.store;

    const overwrite = recordPoliticsFirstAttempt(firstWrong, config, {
      question_id: firstQuestion,
      outcome: 'STABLE',
      selected: 'A',
      correct_answer: 'A',
      study_day: '2099-01-01',
      observed_at: '2099-01-01T00:10:00Z'
    });
    const preserved = overwrite.store.units?.[config.unit_key]?.attempts?.[firstQuestion];
    if (overwrite.recorded || overwrite.reason !== 'FIRST_ATTEMPT_ALREADY_RECORDED' || preserved?.outcome !== 'WRONG') {
      failures.push({ chapter: row.chapter, unit: config.runtime_unit_id, code: 'HISTORY_E_FIRST_ATTEMPT_OVERWRITTEN' });
    }

    let wrongClosureStore = firstWrong;
    for (const questionId of questionIds.slice(1)) {
      wrongClosureStore = recordPoliticsFirstAttempt(wrongClosureStore, config, {
        question_id: questionId,
        outcome: 'STABLE',
        selected: 'A',
        correct_answer: 'A',
        study_day: '2099-01-01',
        observed_at: '2099-01-01T00:20:00Z'
      }).store;
    }
    const wrongClosure = evaluatePoliticsUnitReturn(config, wrongClosureStore);
    if (!wrongClosure.ready || wrongClosure.unit_state !== 'REPAIR' || wrongClosure.mastery_claim !== 'NONE') {
      failures.push({ chapter: row.chapter, unit: config.runtime_unit_id, code: 'HISTORY_E_WRONG_EVIDENCE_NOT_PRESERVED_TO_CLOSURE' });
    }

    const uncertainClosure = evaluatePoliticsUnitReturn(config, recordAll(config, 'UNCERTAIN'));
    if (!uncertainClosure.ready || uncertainClosure.unit_state !== 'UNCERTAIN' || uncertainClosure.mastery_claim !== 'NONE') {
      failures.push({ chapter: row.chapter, unit: config.runtime_unit_id, code: 'HISTORY_E_UNCERTAIN_EVIDENCE_NOT_DISTINCT' });
    }

    const stableClosure = evaluatePoliticsUnitReturn(config, recordAll(config, 'STABLE'));
    if (!stableClosure.ready || stableClosure.unit_state !== 'STABLE' || stableClosure.mastery_claim !== 'NONE') {
      failures.push({ chapter: row.chapter, unit: config.runtime_unit_id, code: 'HISTORY_E_STABLE_EVIDENCE_SEMANTICS_INVALID' });
    }

    const outOfScope = recordPoliticsFirstAttempt(emptyStore(), config, {
      question_id: '__NOT_A_HISTORY_QUESTION__',
      outcome: 'WRONG'
    });
    if (outOfScope.recorded || Object.keys(outOfScope.store.units || {}).length) {
      failures.push({ chapter: row.chapter, unit: config.runtime_unit_id, code: 'HISTORY_E_OUT_OF_SCOPE_EVIDENCE_ADMITTED' });
    }
  }
}

if (historyPaths.length !== 10) failures.push({ code: 'HISTORY_E_CHAPTER_COUNT_UNEXPECTED', count: historyPaths.length });
if (!configCount || !questionCount) failures.push({ code: 'HISTORY_E_EMPTY_SCOPE', configCount, questionCount });

const report = {
  status: failures.length ? 'FAIL' : 'PASS',
  scope: 'HISTORY_EVIDENCE',
  chapter_count: historyPaths.length,
  unit_return_configs: configCount,
  question_evidence_slots: questionCount,
  assertions: [
    'FIRST_ATTEMPT_PRESERVED',
    'WRONG_UNCERTAIN_DISTINCT',
    'NO_MASTERY_FROM_THIS_PASS',
    'APPROPRIATE_UNIT_OR_CANONICAL_NODE_PRECISION',
    'OUT_OF_SCOPE_REJECTED',
    'PERSISTENCE_FAILURE_FAILS_CLOSED',
    'DURABLE_REPAIR_DEBT_ONLY_WHEN_NEEDED'
  ],
  user_validation_gate: 'UNTESTED_NOT_INFERRED',
  failure_count: failures.length,
  failures
};

console.log('POLITICS_HISTORY_EVIDENCE_AUDIT');
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(2);
