#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';
import { practiceReady, publicPracticeCatalog, practiceReviewPayload } from '../src/lib/politicsPracticeView.mjs';
import { gunzipSync } from 'node:zlib';

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
// Source training_ready is verified question content, not NU admission.
// Require every canonical-owned question; quarantine only IDs genuinely absent
// from Current ownership. A dropped renderer/first-ready owner still fails.
const repoRoot = path.resolve(process.env.KIANOS_REPO_ROOT || '..');
const regionRows = fs.readFileSync(path.join(repoRoot, 'content/politics/source/politics_unified_regions.v1.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
const ownedIds = new Set(regionRows.filter((r) => r.status === 'canonical').flatMap((r) => r.xiao_question_refs || []));
const blocked = questions.filter((q) => !ownedIds.has(q.id));
if (diagnostics.unresolvedPracticeOwnerCount !== blocked.length) fail('current_owner_coverage');
const original = JSON.parse(gunzipSync(fs.readFileSync(path.join(repoRoot, 'content/politics/derived/xiao1000-learner-explanations/asset.v1.json.gz'))));
const explanations = new Map(original.records.map((r) => [r.question_id, r]));
const publicCatalog = publicPracticeCatalog(catalog);
if (publicCatalog.questions.length !== questions.length - blocked.length || publicCatalog.unavailable.length !== blocked.length) fail('admission_inventory');

const unitByKey = new Map(units.map((unit) => [unit.key, unit]));
for (const question of questions) {
  if (!question.id || !question.sourceId || !question.stem || !question.answer) fail(`question_core:${question.id || 'missing'}`);
  if (!['single', 'multiple'].includes(question.type)) fail(`question_type:${question.id}`);
  if (!Array.isArray(question.options) || question.options.length !== 4) fail(`question_options:${question.id}:${question.options?.length || 0}`);
  if (question.options.some((option, index) => option.label !== String.fromCharCode(65 + index) || !option.text)) fail(`question_option_shape:${question.id}`);
  if (!/^[A-D]+$/.test(question.answer)) fail(`question_answer:${question.id}`);
  if (!question.refined?.takeaway || !question.refined?.chatExplanation) fail(`refined_binding:${question.sourceId}`);
  const exact = explanations.get(question.sourceId);
  if (!exact || exact.takeaway !== question.refined.takeaway || exact.chat_explanation !== question.refined.chatExplanation) fail(`refined_content_changed:${question.id}`);
  if (Object.prototype.hasOwnProperty.call(question, 'xiaoReference')) fail(`learner_xiao_reference_leak:${question.id}`);
  if (Object.prototype.hasOwnProperty.call(question, 'originalExplanation')) fail(`learner_original_explanation_leak:${question.id}`);
  if (!ownedIds.has(question.id)) {
    if (practiceReady(question) || question.unitKey || question.unitHref || publicCatalog.questions.some((q) => q.id === question.id)) fail(`unowned_question_admitted:${question.id}`);
    let rejected = false;
    try { practiceReviewPayload(catalog, question.id); } catch { rejected = true; }
    if (!rejected) fail(`unowned_review_admitted:${question.id}`);
    continue;
  }
  const unit = unitByKey.get(question.unitKey);
  if (!unit) fail(`unit_binding:${question.id}`);
  if (!unit.questionIds.includes(question.id)) fail(`unit_question_inventory:${question.id}`);
  if (!unit.returnConfig?.expected_question_ids?.includes(question.id)) fail(`return_config:${question.id}`);
  const review = practiceReviewPayload(catalog, question.id);
  if (review.answer !== question.answer || review.source.length !== unit.source.length) fail(`review_payload:${question.id}`);
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
  admittedQuestionCount: publicCatalog.questions.length,
  protectedUnownedQuestionCount: blocked.length,
  protectedQuestionIds: blocked.map((q) => q.id),
  refinedExplanationStatus: catalog.refinedExplanationStatus,
  refinedExplanationContentVersion: catalog.refinedExplanationContentVersion,
  refinedReady: questions.filter((question) => question.refined?.takeaway && question.refined?.chatExplanation).length,
  learnerFacingOriginalExplanation: false,
  legacyStyleQuestionMapRemoved: true,
  dueSchedulerUiResurrected: false
}, null, 2));
