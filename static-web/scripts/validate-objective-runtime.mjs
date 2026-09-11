import fs from 'node:fs';
import {
  inspectObjectiveTask,
  listClozeSets,
  loadClozeById,
  loadClozeAnswersById,
  listReadingBSets,
  loadReadingBById,
  loadReadingBAnswersById
} from '../src/lib/englishObjective.mjs';

const issues = [];
const summary = {};

function optionCount(options) {
  if (Array.isArray(options)) return options.length;
  if (options && typeof options === 'object') return Object.keys(options).length;
  return 0;
}

function answerPresent(value) {
  if (Array.isArray(value)) return value.length > 0 && value.every((item) => String(item || '').trim());
  return String(value ?? '').trim().length > 0;
}

function typeSummary(value) {
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === 'object'
      ? `array(${value.length})<object:${Object.keys(first).sort().join(',')}>`
      : `array(${value.length})<${typeof first}>`;
  }
  if (value && typeof value === 'object') return `object<${Object.keys(value).sort().join(',')}>`;
  return typeof value;
}

function read(relativeUrl) {
  return fs.readFileSync(new URL(relativeUrl, import.meta.url), 'utf8');
}

function readingBShapeSamples() {
  try {
    const bank = JSON.parse(read('../../content/english/source/question_bank.v1.json'));
    const sets = Array.isArray(bank.passage_or_sets) ? bank.passage_or_sets : [];
    const questions = Array.isArray(bank.questions_or_prompts) ? bank.questions_or_prompts : [];
    return [2005, 2024, 2026].map((year) => {
      const set = sets.find((row) => row?.id === `english1-${year}-reading-b-main`)
        || sets.find((row) => row?.section === 'reading_part_b' && String(row?.id || '').includes(String(year)));
      if (!set) return { year, missing: true };
      const firstQuestion = questions.find((row) => row?.set_id === set.id) || null;
      return {
        year,
        setId: set.id,
        setFields: Object.fromEntries(Object.keys(set).sort().map((key) => [key, typeSummary(set[key])])),
        contextFields: set.context && typeof set.context === 'object'
          ? Object.fromEntries(Object.keys(set.context).sort().map((key) => [key, typeSummary(set.context[key])]))
          : {},
        firstQuestionFields: firstQuestion
          ? Object.fromEntries(Object.keys(firstQuestion).sort().map((key) => [key, typeSummary(firstQuestion[key])]))
          : {}
      };
    });
  } catch (error) {
    return [{ diagnosticError: error instanceof Error ? error.message : String(error) }];
  }
}

function validateTask({ task, list, load, loadAnswers }) {
  const state = inspectObjectiveTask(task);
  const sets = list();
  const stats = {
    status: state.status,
    sections: state.sections,
    resolutionMode: state.sectionResolutionMode,
    sets: sets.length,
    questions: 0,
    withMaterial: 0,
    issueCount: 0
  };

  if (state.status !== 'ready') {
    issues.push(`${task}: source not ready: ${(state.issues || []).join(' | ') || state.status}`);
    issues.push(`${task}: available sections: ${(state.availableSections || []).map((row) => `${row.section}:${row.setCount}`).join(', ') || 'none'}`);
    summary[task] = stats;
    return;
  }
  if (!sets.length) issues.push(`${task}: no resolved sets`);
  if (!state.sections?.length) issues.push(`${task}: no resolved Current section`);

  for (const catalogItem of sets) {
    try {
      const item = load(catalogItem.id);
      const answerPayload = loadAnswers(catalogItem.id);
      const questions = item.questions || [];
      stats.questions += questions.length;
      if (item.material?.length) stats.withMaterial += 1;
      else issues.push(`${task}:${item.objectId}: no passage/material projection`);
      if (!questions.length) issues.push(`${task}:${item.objectId}: no questions`);
      if (!state.sections.includes(item.section)) issues.push(`${task}:${item.objectId}: section ${item.section} outside resolved task sections`);
      if (answerPayload.objectId !== item.objectId || answerPayload.task !== task) issues.push(`${task}:${item.objectId}: answer payload identity mismatch`);

      const answerIds = new Set(Object.keys(answerPayload.answers || {}));
      for (const question of questions) {
        const id = String(question?.id || question?.question_id || '');
        if (!id) {
          issues.push(`${task}:${item.objectId}: question without stable id`);
          continue;
        }
        if (Object.prototype.hasOwnProperty.call(question, 'answer')
          || Object.prototype.hasOwnProperty.call(question, 'formal_answer')
          || Object.prototype.hasOwnProperty.call(question, 'correct_answer')) {
          issues.push(`${task}:${id}: answer leaked into clean-attempt projection`);
        }
        if (!answerIds.has(id) || !answerPresent(answerPayload.answers?.[id])) {
          issues.push(`${task}:${id}: formal answer missing from answer gate payload`);
        }
        const choices = optionCount(question?.options);
        if (task === 'cloze' && choices < 2) issues.push(`${task}:${id}: fewer than 2 candidate options`);
        if (task === 'reading_b' && choices < 1 && !(item.candidates?.length)) issues.push(`${task}:${id}: no local or shared candidate inventory`);
      }
      if (answerIds.size !== questions.length) {
        issues.push(`${task}:${item.objectId}: answer/question count mismatch ${answerIds.size}/${questions.length}`);
      }
    } catch (error) {
      issues.push(`${task}:${catalogItem.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  stats.issueCount = issues.filter((issue) => issue.startsWith(`${task}:`)).length;
  summary[task] = stats;
}

function validateEvidenceRuntimeWiring() {
  const uiIssues = [];
  const requireText = (label, text, needle) => {
    if (!text.includes(needle)) uiIssues.push(`${label}: missing ${needle}`);
  };
  const forbidText = (label, text, needle) => {
    if (text.includes(needle)) uiIssues.push(`${label}: legacy runtime still loaded: ${needle}`);
  };

  try {
    const manifest = JSON.parse(read('../../content/english/manifest.json'));
    if (manifest?.owners?.objective_evidence_runtime !== 'content/english/modules/objective-evidence-runtime.md') {
      uiIssues.push('manifest: objective_evidence_runtime owner missing or incorrect');
    }
    if (manifest?.readiness?.objective_evidence_runtime_present !== true) {
      uiIssues.push('manifest: objective_evidence_runtime_present is not true');
    }
  } catch (error) {
    uiIssues.push(`manifest: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const component = read('../src/components/ObjectiveTransferClaims.astro');
    requireText('ObjectiveTransferClaims', component, 'kianos-english-objective-transfer-claims-v1');
    requireText('ObjectiveTransferClaims', component, 'KIANOS_OBJECTIVE_RETURN_V1');
    requireText('ObjectiveTransferClaims', component, 'kianos.english.objective_review_return.v1');
    forbidText('ObjectiveTransferClaims', component, 'kianos-reading-watch-signals-v1');
  } catch (error) {
    uiIssues.push(`ObjectiveTransferClaims: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const cloze = read('../src/pages/cloze/[id].astro');
    requireText('Cloze page', cloze, 'ObjectiveTransferClaims');
    requireText('Cloze page', cloze, 'task="cloze"');
  } catch (error) {
    uiIssues.push(`Cloze page: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const readingB = read('../src/pages/reading-b/[id].astro');
    requireText('Reading B page', readingB, 'ObjectiveTransferClaims');
    requireText('Reading B page', readingB, 'task="reading_b"');
  } catch (error) {
    uiIssues.push(`Reading B page: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const readingA = read('../src/pages/reading/[id].astro');
    requireText('Reading A page', readingA, 'ObjectiveTransferClaims');
    requireText('Reading A page', readingA, 'task="reading_a"');
    forbidText('Reading A page', readingA, 'ReadingReviewSignals');
    forbidText('Reading A page', readingA, 'ReadingTransferEvidence');
    forbidText('Reading A page', readingA, 'ReadingSessionTransferEvidence');
  } catch (error) {
    uiIssues.push(`Reading A page: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const objectiveHandoff = read('../src/components/ObjectiveHandoff.astro');
    requireText('ObjectiveHandoff', objectiveHandoff, 'ACTIVE TRANSFER CLAIMS');
    requireText('ObjectiveHandoff', objectiveHandoff, 'TRANSFER_CHECK');
    requireText('ObjectiveHandoff', objectiveHandoff, 'KIANOS_OBJECTIVE_RETURN_V1');
  } catch (error) {
    uiIssues.push(`ObjectiveHandoff: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const readingHandoff = read('../src/components/ReadingPassageHandoff.astro');
    requireText('ReadingPassageHandoff', readingHandoff, 'ACTIVE TRANSFER CLAIMS');
    requireText('ReadingPassageHandoff', readingHandoff, 'TRANSFER_CHECK');
    requireText('ReadingPassageHandoff', readingHandoff, 'KIANOS_OBJECTIVE_RETURN_V1');
  } catch (error) {
    uiIssues.push(`ReadingPassageHandoff: ${error instanceof Error ? error.message : String(error)}`);
  }

  issues.push(...uiIssues.map((issue) => `ui:${issue}`));
  summary.evidenceRuntime = {
    status: uiIssues.length ? 'invalid' : 'ready',
    issueCount: uiIssues.length,
    legacyQuestionWatchLoaded: uiIssues.some((issue) => issue.includes('legacy runtime still loaded'))
  };
}

validateTask({
  task: 'cloze',
  list: listClozeSets,
  load: loadClozeById,
  loadAnswers: loadClozeAnswersById
});

validateTask({
  task: 'reading_b',
  list: listReadingBSets,
  load: loadReadingBById,
  loadAnswers: loadReadingBAnswersById
});

validateEvidenceRuntimeWiring();

summary.issueCount = issues.length;
console.log(JSON.stringify(summary, null, 2));

if (issues.length) {
  console.error('\nReading B source shape diagnostics (keys/types only):');
  console.error(JSON.stringify(readingBShapeSamples(), null, 2));
  console.error('\nObjective runtime coverage issues:');
  issues.slice(0, 120).forEach((issue) => console.error(`- ${issue}`));
  if (issues.length > 120) console.error(`- … ${issues.length - 120} more`);
  process.exitCode = 1;
}