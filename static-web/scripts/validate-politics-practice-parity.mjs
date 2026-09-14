#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';

const staticRoot = path.resolve(process.cwd());
const componentPath = path.join(staticRoot, 'src/components/PoliticsPracticeWorkbench.astro');
const pagePath = path.join(staticRoot, 'src/pages/politics/practice.astro');
const catalog = buildPoliticsPracticeCatalogCurrent('/');

const fail = (message) => { throw new Error(`POLITICS_PRACTICE_PARITY_INVALID:${message}`); };
const questions = catalog.questions || [];
const units = catalog.units || [];
const ids = questions.map((question) => question.id);
const uniqueIds = new Set(ids);
const diagnostics = catalog.diagnostics || {};

if (catalog.schema !== 'kianos.politics.practice_catalog.v1') fail('schema');
if (questions.length !== 1148) fail(`question_count:${questions.length}`);
if (uniqueIds.size !== 1148) fail(`unique_question_count:${uniqueIds.size}`);
if (!units.length) fail('units_missing');
if (catalog.refinedExplanationStatus !== 'CURRENT_DERIVED_LEARNER_FACING_ASSET') fail(`refined_status:${catalog.refinedExplanationStatus || 'missing'}`);
if (Number(catalog.refinedExplanationCount || 0) !== 1148) fail(`refined_count:${catalog.refinedExplanationCount || 0}`);
if (Number(diagnostics.unresolvedPracticeOwnerCount || 0) !== 0) {
  fail(`unresolved_practice_owners:${JSON.stringify((diagnostics.unresolvedPracticeOwners || []).slice(0, 30))}`);
}

const unitByKey = new Map(units.map((unit) => [unit.key, unit]));
for (const question of questions) {
  if (!question.id || !question.sourceId || !question.stem || !question.answer) fail(`question_core:${question.id || 'missing'}`);
  if (!['single', 'multiple'].includes(question.type)) fail(`question_type:${question.id}`);
  if (!Array.isArray(question.options) || question.options.length !== 4) fail(`question_options:${question.id}:${question.options?.length || 0}`);
  if (question.options.some((option, index) => option.label !== String.fromCharCode(65 + index) || !option.text)) fail(`question_option_shape:${question.id}`);
  if (!/^[A-D]+$/.test(question.answer)) fail(`question_answer:${question.id}`);
  if (!question.refined?.takeaway || !question.refined?.chatExplanation) fail(`refined_binding:${question.sourceId}`);
  if (Object.prototype.hasOwnProperty.call(question, 'xiaoReference')) fail(`learner_xiao_reference_leak:${question.id}`);
  if (Object.prototype.hasOwnProperty.call(question, 'originalExplanation')) fail(`learner_original_explanation_leak:${question.id}`);
  const unit = unitByKey.get(question.unitKey);
  if (!unit) fail(`unit_binding:${question.id}`);
  if (!unit.questionIds.includes(question.id)) fail(`unit_question_inventory:${question.id}`);
  if (!unit.returnConfig?.expected_question_ids?.includes(question.id)) fail(`return_config:${question.id}`);
}

const component = fs.readFileSync(componentPath, 'utf8') + fs.readFileSync(path.join(staticRoot, 'src/lib/politicsPracticeClient.mjs'), 'utf8');
const page = fs.readFileSync(pagePath, 'utf8');
const requiredComponentTokens = [
  'data-filter-subject', 'data-filter-chapter', 'data-filter-unit', 'data-filter-type',
  'data-filter-mode', 'data-mode-value="practice"', 'data-mode-value="random"',
  'data-mode-value="wrong"', 'data-mode-value="favorite"',
  'data-interaction-mode', 'data-interaction-normal', 'data-interaction-fast',
  'data-favorite', 'data-uncertain', 'data-discussion', 'data-question-timer',
  'answerChanges', 'recordPoliticsFirstAttempt', 'data-result-status', 'data-takeaway',
  'data-result-selected', 'data-result-answer', 'data-cause-picker', 'data-note',
  'data-chat-explanation', 'data-review-sources', 'data-next-question', 'data-return-unit',
  'kianos-politics-attempts-v1', 'kianos-politics-evidence-v1', 'kianos-politics-last-location-v1'
];
for (const token of requiredComponentTokens) if (!component.includes(token)) fail(`component_token:${token}`);

const forbiddenComponentTokens = [
  'value="due"', '>D1<', '>D3<', '>D7<', '>D14<',
  'data-xiao-reference', 'data-xiao-text', 'politicsXiaoReference', '查看肖1000原解析',
  'data-question-map'
];
for (const token of forbiddenComponentTokens) if (component.includes(token)) fail(`forbidden_component_token:${token}`);

// Runtime behavior is exercised by test-politics-practice-journey.mjs,
// independently of whether the Current asset is ready.
if (!component.includes('本轮 first attempt 没有保存下来；为保护证据，当前题不推进。')) fail('persistence_failure_guard');
if (!page.includes('buildPoliticsPracticeCatalogCurrent') || !page.includes('PoliticsPracticeWorkbench')) fail('route_wiring');

console.log(JSON.stringify({
  status: 'PASS',
  questionCount: questions.length,
  unitCount: units.length,
  activeQuestionOwnerCount: diagnostics.activeQuestionOwnerCount,
  activeQuestionOwnerDuplicateCount: diagnostics.activeQuestionOwnerDuplicateCount,
  referenceOnlyNaturalUnitCount: diagnostics.referenceOnlyNaturalUnitCount,
  recoveredReferenceOnlyQuestionCount: diagnostics.recoveredReferenceOnlyQuestionCount,
  unresolvedPracticeOwnerCount: diagnostics.unresolvedPracticeOwnerCount,
  refinedExplanationStatus: catalog.refinedExplanationStatus,
  refinedExplanationContentVersion: catalog.refinedExplanationContentVersion,
  refinedReady: questions.filter((question) => question.refined?.takeaway && question.refined?.chatExplanation).length,
  learnerFacingOriginalExplanation: false,
  legacyStyleQuestionMapRemoved: true,
  dueSchedulerUiResurrected: false
}, null, 2));
