import fs from 'node:fs';
import path from 'node:path';
import { listPoliticsChapterPathsCurrent, loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';
import {
  buildPoliticsUnitReturnConfigs,
  recordPoliticsFirstAttempt,
  evaluatePoliticsUnitReturn
} from '../src/lib/politicsUnitReturn.mjs';

const auditDir = path.resolve(process.cwd(), '../politics-ethics-evidence-audit');
fs.mkdirSync(auditDir, { recursive: true });
const failures = [];
let checks = 0;
const pass = (condition, code, detail = {}) => {
  checks += 1;
  if (!condition) failures.push({ code, ...detail });
};
const emptyStore = () => ({ schema: 'kianos.politics.attempt_snapshot.v1', units: {} });

function recordRest(config, store, firstIndex = 1, outcome = 'STABLE') {
  let next = store;
  for (const questionId of (config.expected_question_ids || []).slice(firstIndex)) {
    next = recordPoliticsFirstAttempt(next, config, {
      question_id: questionId,
      outcome,
      selected: 'A',
      correct_answer: 'A',
      study_day: '2099-01-01',
      observed_at: '2099-01-01T00:20:00Z'
    }).store;
  }
  return next;
}

const paths = listPoliticsChapterPathsCurrent()
  .filter((row) => String(row?.subject || '') === 'ethics_law')
  .sort((a, b) => String(a.chapter).localeCompare(String(b.chapter), 'en', { numeric: true }));

pass(paths.length === 7, 'ETHICS_E_CHAPTER_COUNT', { count: paths.length });
let configCount = 0;
let questionCount = 0;

for (const row of paths) {
  const chapter = loadPoliticsChapterCurrent(row.subject, row.chapter);
  const configs = buildPoliticsUnitReturnConfigs(chapter);
  pass(configs.length > 0, 'ETHICS_E_CHAPTER_HAS_EXECUTABLE_CONFIG', { chapter: row.chapter, count: configs.length });
  configCount += configs.length;

  for (const config of configs) {
    const questionIds = config.expected_question_ids || [];
    questionCount += questionIds.length;
    pass(questionIds.length > 0, 'ETHICS_E_NONEMPTY_SCOPE', { chapter: row.chapter, unit: config.runtime_unit_id });
    pass(config.mastery_claim === 'NONE', 'ETHICS_E_NO_MASTERY_CLAIM', { chapter: row.chapter, unit: config.runtime_unit_id });
    pass(['NATURAL_UNIT_SAFE_FALLBACK', 'CANONICAL_NODE_MAPPING'].includes(config.evidence_precision), 'ETHICS_E_BOUNDED_PRECISION', { chapter: row.chapter, unit: config.runtime_unit_id, precision: config.evidence_precision });
    pass(Boolean(config.source_anchor), 'ETHICS_E_SOURCE_ANCHOR_EXISTS', { chapter: row.chapter, unit: config.runtime_unit_id });
    if (!questionIds.length) continue;

    const firstQuestion = questionIds[0];
    const wrong = recordPoliticsFirstAttempt(emptyStore(), config, {
      question_id: firstQuestion,
      outcome: 'WRONG',
      selected: 'B',
      correct_answer: 'A',
      study_day: '2099-01-01',
      observed_at: '2099-01-01T00:00:00Z'
    });
    pass(wrong.recorded, 'ETHICS_E_FIRST_WRONG_RECORDED', { chapter: row.chapter, unit: config.runtime_unit_id, question: firstQuestion });

    const overwrite = recordPoliticsFirstAttempt(wrong.store, config, {
      question_id: firstQuestion,
      outcome: 'STABLE',
      selected: 'A',
      correct_answer: 'A',
      study_day: '2099-01-01',
      observed_at: '2099-01-01T00:10:00Z'
    });
    const preserved = overwrite.store.units?.[config.unit_key]?.attempts?.[firstQuestion];
    pass(!overwrite.recorded && overwrite.reason === 'FIRST_ATTEMPT_ALREADY_RECORDED' && preserved?.outcome === 'WRONG', 'ETHICS_E_FIRST_ATTEMPT_IMMUTABLE', { chapter: row.chapter, unit: config.runtime_unit_id, question: firstQuestion });

    const wrongClosure = evaluatePoliticsUnitReturn(config, recordRest(config, wrong.store));
    pass(wrongClosure.ready && wrongClosure.unit_state === 'REPAIR' && wrongClosure.mastery_claim === 'NONE', 'ETHICS_E_WRONG_SURVIVES_TO_UNIT_EVIDENCE', { chapter: row.chapter, unit: config.runtime_unit_id, state: wrongClosure.unit_state });

    let uncertainStore = emptyStore();
    for (const [index, questionId] of questionIds.entries()) {
      uncertainStore = recordPoliticsFirstAttempt(uncertainStore, config, {
        question_id: questionId,
        outcome: index === 0 ? 'UNCERTAIN' : 'STABLE',
        selected: 'A',
        correct_answer: 'A',
        study_day: '2099-01-01',
        observed_at: `2099-01-01T00:30:${String(index).padStart(2, '0')}Z`
      }).store;
    }
    const uncertainClosure = evaluatePoliticsUnitReturn(config, uncertainStore);
    pass(uncertainClosure.ready && uncertainClosure.unit_state === 'UNCERTAIN' && uncertainClosure.mastery_claim === 'NONE', 'ETHICS_E_UNCERTAIN_DISTINCT', { chapter: row.chapter, unit: config.runtime_unit_id, state: uncertainClosure.unit_state });

    let stableStore = emptyStore();
    for (const [index, questionId] of questionIds.entries()) {
      stableStore = recordPoliticsFirstAttempt(stableStore, config, {
        question_id: questionId,
        outcome: 'STABLE',
        selected: 'A',
        correct_answer: 'A',
        study_day: '2099-01-01',
        observed_at: `2099-01-01T00:40:${String(index).padStart(2, '0')}Z`
      }).store;
    }
    const stableClosure = evaluatePoliticsUnitReturn(config, stableStore);
    pass(stableClosure.ready && stableClosure.unit_state === 'STABLE' && stableClosure.mastery_claim === 'NONE', 'ETHICS_E_STABLE_IS_THIS_PASS_ONLY', { chapter: row.chapter, unit: config.runtime_unit_id, state: stableClosure.unit_state });

    const outOfScope = recordPoliticsFirstAttempt(emptyStore(), config, {
      question_id: '__NOT_AN_ETHICS_QUESTION__',
      outcome: 'WRONG'
    });
    pass(!outOfScope.recorded && Object.keys(outOfScope.store.units || {}).length === 0, 'ETHICS_E_OUT_OF_SCOPE_REJECTED', { chapter: row.chapter, unit: config.runtime_unit_id, reason: outOfScope.reason });
  }
}

pass(configCount > 0 && questionCount > 0, 'ETHICS_E_SCOPE_NONEMPTY', { configCount, questionCount });

const report = {
  schema: 'kianos.politics.ethics_evidence_model_audit.v1',
  status: failures.length ? 'FAIL' : 'PASS',
  scope: 'ETHICS_C00_C06_EVIDENCE_MODEL',
  chapter_count: paths.length,
  unit_return_configs: configCount,
  question_evidence_slots: questionCount,
  check_count: checks,
  failure_count: failures.length,
  failures,
  boundaries: {
    mastery_claim: 'NONE',
    user_validation: 'UNTESTED_NOT_INFERRED',
    later_transfer: 'LATER_PHASE_NOT_EXECUTED; future evidence may append/challenge but never overwrite first-attempt truth'
  }
};

fs.writeFileSync(path.join(auditDir, 'model-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log('POLITICS_ETHICS_EVIDENCE_MODEL_AUDIT');
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(2);
