import fs from 'node:fs';
import {
  inspectTranslationSources,
  listTranslationSets,
  loadTranslationById,
  loadTranslationReferencesById
} from '../src/lib/englishTranslation.mjs';

const issues = [];
const missingReferenceIds = [];
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

function typeSummary(value) {
  if (Array.isArray(value)) return `array(${value.length})`;
  if (value && typeof value === 'object') return `object<${Object.keys(value).sort().join(',')}>`;
  return typeof value;
}

function compactDiagnostic(value, depth = 0) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return value.slice(0, 500);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (depth >= 3) return typeSummary(value);
  if (Array.isArray(value)) return value.slice(0, 8).map((item) => compactDiagnostic(item, depth + 1));
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, compactDiagnostic(child, depth + 1)]));
  }
  return String(value);
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
        if (!present(row?.text)) {
          const id = String(row?.id || '?');
          missingReferenceIds.push(id);
          issues.push(`${task.objectId}:${id}: formal reference missing`);
        }
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

  requireText('contract', contract, 'H4｜Reference reveal');
  requireText('contract', contract, 'first translation');
  requireText('contract', contract, 'H8｜Runtime interaction boundary');
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

function printReferenceGapDiagnostics() {
  if (!missingReferenceIds.length) return;
  try {
    const bank = JSON.parse(read('../../content/english/source/question_bank.v1.json'));
    const rows = Array.isArray(bank?.questions_or_prompts) ? bank.questions_or_prompts : [];
    const wanted = new Set(missingReferenceIds);
    const diagnostics = rows
      .filter((row) => wanted.has(String(row?.id || row?.question_id || '')))
      .map((row) => ({
        id: row?.id || row?.question_id || '',
        answer: compactDiagnostic(row?.answer),
        analysis: compactDiagnostic(row?.analysis),
        formal_answer: compactDiagnostic(row?.formal_answer),
        correct_answer: compactDiagnostic(row?.correct_answer),
        reference_translation: compactDiagnostic(row?.reference_translation),
        target_text: compactDiagnostic(row?.target_text)
      }));
    console.error('\nTranslation missing-reference nested diagnostics:');
    console.error(JSON.stringify(diagnostics, null, 2));
  } catch (error) {
    console.error(`\nTranslation diagnostics failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

validateSourceProjection();
validateContractAndUi();
summary.issueCount = issues.length;
console.log(JSON.stringify(summary, null, 2));

if (issues.length) {
  console.error('\nTranslation runtime issues:');
  issues.slice(0, 160).forEach((issue) => console.error(`- ${issue}`));
  if (issues.length > 160) console.error(`- … ${issues.length - 160} more`);
  printReferenceGapDiagnostics();
  process.exitCode = 1;
}
