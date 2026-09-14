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

if (catalog.schema !== 'kianos.politics.practice_catalog.v1') fail('schema');
if (questions.length !== 1148) fail(`question_count:${questions.length}`);
if (uniqueIds.size !== 1148) fail(`unique_question_count:${uniqueIds.size}`);
if (!units.length) fail('units_missing');

const unitByKey = new Map(units.map((unit) => [unit.key, unit]));
for (const question of questions) {
  if (!question.id || !question.stem || !question.answer) fail(`question_core:${question.id || 'missing'}`);
  if (!['single', 'multiple'].includes(question.type)) fail(`question_type:${question.id}`);
  if (!Array.isArray(question.options) || question.options.length !== 4) fail(`question_options:${question.id}:${question.options?.length || 0}`);
  if (question.options.some((option, index) => option.label !== String.fromCharCode(65 + index) || !option.text)) fail(`question_option_shape:${question.id}`);
  if (!/^[A-D]+$/.test(question.answer)) fail(`question_answer:${question.id}`);
  const unit = unitByKey.get(question.unitKey);
  if (!unit) fail(`unit_binding:${question.id}`);
  if (!unit.questionIds.includes(question.id)) fail(`unit_question_inventory:${question.id}`);
  if (!unit.returnConfig?.expected_question_ids?.includes(question.id)) fail(`return_config:${question.id}`);
}

const component = fs.readFileSync(componentPath, 'utf8');
const page = fs.readFileSync(pagePath, 'utf8');
const requiredComponentTokens = [
  'data-filter-subject', 'data-filter-chapter', 'data-filter-unit', 'data-filter-type',
  'data-filter-mode', 'data-interaction-mode', 'data-favorite', 'data-uncertain',
  'data-discussion', 'data-question-timer', 'answerChanges', 'recordPoliticsFirstAttempt',
  'data-cause-picker', 'data-note', 'data-return-unit', 'data-xiao-reference',
  'question.refined?.takeaway', 'question.refined?.chatExplanation',
  'OCR 原解析冒充', 'kianos-politics-evidence-v1', 'kianos-politics-last-location-v1'
];
for (const token of requiredComponentTokens) if (!component.includes(token)) fail(`component_token:${token}`);
for (const forbidden of ['value="due"', '>D1<', '>D3<', '>D7<', '>D14<']) if (component.includes(forbidden)) fail(`scheduler_resurrection:${forbidden}`);
if (!page.includes('buildPoliticsPracticeCatalogCurrent') || !page.includes('PoliticsPracticeWorkbench')) fail('route_wiring');

const refinedReady = questions.filter((question) => question.refined?.takeaway && question.refined?.chatExplanation).length;
const faceMaterialized = questions.filter((question) => question.originalFace?.materialized).length;
console.log(JSON.stringify({
  status: 'PASS',
  questionCount: questions.length,
  unitCount: units.length,
  refinedExplanationStatus: catalog.refinedExplanationStatus,
  refinedReady,
  refinedBlocked: questions.length - refinedReady,
  originalQuestionFaceMaterialized: faceMaterialized,
  originalQuestionFaceBlocked: questions.length - faceMaterialized,
  schedulerUiResurrected: false
}, null, 2));
