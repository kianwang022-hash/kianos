import fs from 'node:fs';
import {
  inspectTranslationSources,
  listTranslationSets,
  loadTranslationById,
  loadTranslationReferencesById
} from '../src/lib/englishTranslation.mjs';

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
  issueCount: 0
};

function read(relativeUrl) {
  return fs.readFileSync(new URL(relativeUrl, import.meta.url), 'utf8');
}

function present(value) {
  return String(value ?? '').trim().length > 0;
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
  const contract = read('../../content/english/modules/translation.md');
  const workspace = read('../src/components/TranslationWorkspace.astro');
  const home = read('../src/pages/translation.astro');
  const taskPage = read('../src/pages/translation/[id].astro');
  const learnPage = read('../src/pages/translation-learn.astro');

  const requireText = (label, text, needle) => {
    if (!text.includes(needle)) issues.push(`${label}: missing ${needle}`);
  };
  const forbidText = (label, text, needle) => {
    if (text.includes(needle)) issues.push(`${label}: forbidden learner/runtime coupling ${needle}`);
  };

  requireText('contract', contract, 'H4｜Reference reveal');
  requireText('contract', contract, 'first translation');
  requireText('contract', contract, 'H8｜Runtime interaction boundary');
  requireText('workspace', workspace, 'kianos-translation-attempt-v1');
  requireText('workspace', workspace, 'KIANOS_TRANSLATION_HANDOFF_V1');
  requireText('workspace', workspace, 'data-frozen-first');
  requireText('workspace', workspace, 'data-reference-panel');
  requireText('workspace', workspace, 'data-reveal-reference');
  requireText('workspace', workspace, 'intentionally not revealed');
  requireText('workspace', workspace, 'data-start-reconstruct');
  requireText('workspace', workspace, 'data-save-reconstruction');
  requireText('workspace', workspace, 'whole task/set');
  requireText('workspace', workspace, 'runtime 不会自行补造');
  requireText('home', home, 'Productive lane');
  requireText('home', home, 'translation-learn');
  requireText('task page', taskPage, 'loadTranslationReferencesById');
  requireText('learn page', learnPage, 'content/english/modules/translation.md');

  forbidText('workspace', workspace, 'data-translation-score');
  forbidText('workspace', workspace, 'lexical_choice');
  forbidText('workspace', workspace, 'clause_architecture');
  forbidText('workspace', workspace, 'kianos-english-objective-transfer-claims-v1');
}

validateSourceProjection();
validateContractAndUi();
summary.issueCount = issues.length;
console.log(JSON.stringify(summary, null, 2));
if (referenceGaps.length) {
  console.log('\nKnown Current reference gaps (runtime remains usable; no answer is fabricated):');
  referenceGaps.forEach((gap) => console.log(`- ${gap.setId}:${gap.id}:${gap.status}`));
}

if (issues.length) {
  console.error('\nTranslation runtime issues:');
  issues.slice(0, 160).forEach((issue) => console.error(`- ${issue}`));
  if (issues.length > 160) console.error(`- … ${issues.length - 160} more`);
  process.exitCode = 1;
}
