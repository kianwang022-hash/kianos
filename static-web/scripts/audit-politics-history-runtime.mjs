import fs from 'node:fs';
import path from 'node:path';
import { listPoliticsChapterPathsCurrent, loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';
import { buildPoliticsUnitReturnConfigs, evaluatePoliticsUnitReturn } from '../src/lib/politicsUnitReturn.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const chapterPage = fs.readFileSync(path.join(repoRoot, 'static-web/src/pages/politics/[subject]/[chapter].astro'), 'utf8');
const returnEnhancer = fs.readFileSync(path.join(repoRoot, 'static-web/src/components/PoliticsUnitReturnEnhancer.astro'), 'utf8');
const failures = [];

function ids(values) {
  return (Array.isArray(values) ? values : []).map((value) => String(value || '')).filter(Boolean);
}

function sameSet(left, right) {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function syntheticSnapshot(config, override = {}) {
  const attempts = Object.fromEntries(config.expected_question_ids.map((questionId) => [questionId, {
    question_id: questionId,
    outcome: override[questionId] || 'STABLE'
  }]));
  return {
    schema: 'kianos.politics.attempt_snapshot.v1',
    units: {
      [config.unit_key]: {
        unit_key: config.unit_key,
        natural_unit_id: config.natural_unit_id,
        attempts
      }
    }
  };
}

if (!chapterPage.includes("import PoliticsUnitReturnEnhancer from '../../../components/PoliticsUnitReturnEnhancer.astro'")) {
  failures.push({ code: 'HISTORY_RUNTIME_RETURN_ENHANCER_NOT_IMPORTED' });
}
if (!chapterPage.includes('<PoliticsUnitReturnEnhancer chapter={data} />')) {
  failures.push({ code: 'HISTORY_RUNTIME_RETURN_ENHANCER_NOT_MOUNTED' });
}
for (const hook of ['data-politics-unit-return', 'data-unit-return-repair', 'data-unit-return-continue']) {
  if (!returnEnhancer.includes(hook)) failures.push({ code: 'HISTORY_RUNTIME_RETURN_HOOK_MISSING', hook });
}

const historyPaths = listPoliticsChapterPathsCurrent()
  .filter((row) => String(row?.subject || '') === 'history')
  .sort((a, b) => String(a.chapter).localeCompare(String(b.chapter), 'en', { numeric: true }));

let unitCount = 0;
let configCount = 0;
let questionCount = 0;

for (const row of historyPaths) {
  const chapter = loadPoliticsChapterCurrent(row.subject, row.chapter);
  const configs = buildPoliticsUnitReturnConfigs(chapter);
  const unitsWithQuestions = (chapter.units || []).filter((unit) => (unit.questions || []).length > 0);
  unitCount += unitsWithQuestions.length;
  configCount += configs.length;
  questionCount += unitsWithQuestions.reduce((sum, unit) => sum + (unit.questions || []).length, 0);

  const configsByRuntimeUnit = new Map();
  for (const config of configs) {
    const key = String(config.runtime_unit_id || '');
    if (!configsByRuntimeUnit.has(key)) configsByRuntimeUnit.set(key, []);
    configsByRuntimeUnit.get(key).push(config);
  }

  for (const unit of unitsWithQuestions) {
    const runtimeUnitId = String(unit.unitId || '');
    const matches = configsByRuntimeUnit.get(runtimeUnitId) || [];
    if (matches.length !== 1) {
      failures.push({ chapter: row.chapter, unit: runtimeUnitId, code: 'HISTORY_RUNTIME_UNIT_RETURN_CONFIG_COUNT', count: matches.length });
      continue;
    }
    const config = matches[0];
    const renderedQuestionIds = ids((unit.questions || []).map((question) => question.id));
    const expectedQuestionIds = ids(config.expected_question_ids);
    if (!sameSet(renderedQuestionIds, expectedQuestionIds)) {
      failures.push({ chapter: row.chapter, unit: runtimeUnitId, code: 'HISTORY_RUNTIME_QUESTION_COVERAGE_MISMATCH' });
    }
    if (config.source_anchor !== `source-${runtimeUnitId}`) {
      failures.push({ chapter: row.chapter, unit: runtimeUnitId, code: 'HISTORY_RUNTIME_REPAIR_RETURN_TARGET_MISMATCH' });
    }
    if (config.mastery_claim !== 'NONE') {
      failures.push({ chapter: row.chapter, unit: runtimeUnitId, code: 'HISTORY_RUNTIME_MANUFACTURES_MASTERY' });
    }

    const pending = evaluatePoliticsUnitReturn(config, { schema: 'kianos.politics.attempt_snapshot.v1', units: {} });
    if (pending.ready || pending.unit_state !== 'PENDING') {
      failures.push({ chapter: row.chapter, unit: runtimeUnitId, code: 'HISTORY_RUNTIME_PREMATURE_RETURN_READY' });
    }

    const stable = evaluatePoliticsUnitReturn(config, syntheticSnapshot(config));
    if (!stable.ready || stable.unit_state !== 'STABLE') {
      failures.push({ chapter: row.chapter, unit: runtimeUnitId, code: 'HISTORY_RUNTIME_CLEAN_PASS_NOT_EXECUTABLE' });
    }

    const firstQuestion = expectedQuestionIds[0];
    if (firstQuestion) {
      const repair = evaluatePoliticsUnitReturn(config, syntheticSnapshot(config, { [firstQuestion]: 'WRONG' }));
      if (!repair.ready || repair.unit_state !== 'REPAIR') {
        failures.push({ chapter: row.chapter, unit: runtimeUnitId, code: 'HISTORY_RUNTIME_WRONG_NOT_ROUTED_TO_REPAIR' });
      }
      const uncertain = evaluatePoliticsUnitReturn(config, syntheticSnapshot(config, { [firstQuestion]: 'UNCERTAIN' }));
      if (!uncertain.ready || uncertain.unit_state !== 'UNCERTAIN') {
        failures.push({ chapter: row.chapter, unit: runtimeUnitId, code: 'HISTORY_RUNTIME_UNCERTAIN_NOT_ROUTED' });
      }
    }
  }
}

if (historyPaths.length !== 10) failures.push({ code: 'HISTORY_RUNTIME_CHAPTER_COUNT_UNEXPECTED', count: historyPaths.length });
if (!unitCount || !configCount || !questionCount) failures.push({ code: 'HISTORY_RUNTIME_EMPTY_SCOPE', unitCount, configCount, questionCount });
if (configCount !== unitCount) failures.push({ code: 'HISTORY_RUNTIME_CONFIG_UNIT_PARITY', unitCount, configCount });

const report = {
  status: failures.length ? 'FAIL' : 'PASS',
  scope: 'HISTORY_RUNTIME',
  chapter_count: historyPaths.length,
  units_with_questions: unitCount,
  unit_return_configs: configCount,
  rendered_questions: questionCount,
  tested_paths: ['PENDING', 'CLEAN_PASS', 'WRONG_TO_REPAIR', 'UNCERTAIN_TO_REPAIR_RETURN'],
  evidence_gate: 'FROZEN_NOT_TESTED',
  failure_count: failures.length,
  failures
};

console.log('POLITICS_HISTORY_RUNTIME_AUDIT');
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(2);
