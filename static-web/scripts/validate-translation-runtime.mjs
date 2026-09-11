import fs from 'node:fs';
import {
  inspectTranslationSources,
  listTranslationSets,
  loadTranslationById,
  loadTranslationReferencesById
} from '../src/lib/englishTranslation.mjs';

const issues = [];
const summary = {
  status: 'unknown',
  sets: 0,
  prompts: 0,
  references: 0,
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
      const references = loadTranslationReferencesById(catalogItem.id);
      const prompts = task.prompts || [];
      const answerRows = references.references || [];
      summary.prompts += prompts.length;
      summary.references += answerRows.length;
      if (sourcePresent(task)) summary.withSource += 1;
      else issues.push(`${task.objectId}: no learner-facing source text projection`);
      if (!prompts.length) issues.push(`${task.objectId}: no stable prompt/task rows`);
      if (references.objectId !== task.objectId || references.task !== 'translation') {
        issues.push(`${task.objectId}: reference payload identity mismatch`);
      }
      if (answerRows.length !== prompts.length) {
        issues.push(`${task.objectId}: reference/prompt count mismatch ${answerRows.length}/${prompts.length}`);
      }
      const promptIds = new Set(prompts.map((item) => String(item?.id || '')));
      for (const prompt of prompts) {
        if (!present(prompt?.id)) issues.push(`${task.objectId}: prompt without stable id`);
        if (Object.prototype.hasOwnProperty.call(prompt, 'answer')
          || Object.prototype.hasOwnProperty.call(prompt, 'formal_answer')
          || Object.prototype.hasOwnProperty.call(prompt, 'correct_answer')) {
          issues.push(`${task.objectId}:${prompt.id}: formal reference leaked into clean attempt projection`);
        }
      }
      for (const row of answerRows) {
        if (!promptIds.has(String(row?.id || ''))) issues.push(`${task.objectId}:${row?.id || '?'}: reference id does not match prompt id`);
        if (!present(row?.text)) issues.push(`${task.objectId}:${row?.id || '?'}: formal reference missing`);
      }
    } catch (error) {
      issues.push(`${catalogItem.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
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

  requireText('contract', contract, 'Frozen Translation Runtime Contract');
  requireText('contract', contract, 'first translation');
  requireText('workspace', workspace, 'kianos-translation-attempt-v1');
  requireText('workspace', workspace, 'KIANOS_TRANSLATION_HANDOFF_V1');
  requireText('workspace', workspace, 'data-frozen-first');
  requireText('workspace', workspace, 'data-reference-panel');
  requireText('workspace', workspace, 'data-start-reconstruct');
  requireText('workspace', workspace, 'data-save-reconstruction');
  requireText('workspace', workspace, 'whole task/set');
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

if (issues.length) {
  console.error('\nTranslation runtime issues:');
  issues.slice(0, 160).forEach((issue) => console.error(`- ${issue}`));
  if (issues.length > 160) console.error(`- … ${issues.length - 160} more`);
  process.exitCode = 1;
}
