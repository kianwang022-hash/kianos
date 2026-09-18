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
    orderingWithSkeleton: 0,
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
  if (state.sectionResolutionMode !== 'content-owned-task-map') {
    issues.push(`${task}: task identity must come from Content-owned task map, got ${state.sectionResolutionMode || 'none'}`);
  }

  for (const catalogItem of sets) {
    try {
      const item = load(catalogItem.id);
      const answerPayload = loadAnswers(catalogItem.id);
      const questions = item.questions || [];
      stats.questions += questions.length;

      const ordering = task === 'reading_b' && item.context?.taskForm === 'ordering';
      if (item.material?.length) {
        stats.withMaterial += 1;
      } else if (ordering && Array.isArray(item.context?.orderingSkeleton) && item.context.orderingSkeleton.length) {
        stats.orderingWithSkeleton += 1;
      } else {
        issues.push(`${task}:${item.objectId}: no usable passage/material or ordering-skeleton projection`);
      }

      if (!questions.length) issues.push(`${task}:${item.objectId}: no questions`);
      if (!state.sections.includes(item.section)) issues.push(`${task}:${item.objectId}: section ${item.section} outside resolved task sections`);
      if (answerPayload.objectId !== item.objectId || answerPayload.task !== task) issues.push(`${task}:${item.objectId}: answer payload identity mismatch`);

      if (task === 'reading_b') {
        if (!item.context?.taskForm) issues.push(`${task}:${item.objectId}: task form not projected`);
        if (!item.context?.candidateUsePolicy) issues.push(`${task}:${item.objectId}: candidate-use policy not projected`);
        if (!item.context?.itemLabel) issues.push(`${task}:${item.objectId}: item label not projected`);
        if (!['single_use', 'repeat_allowed', 'source_unspecified'].includes(item.context?.candidateUsePolicy)) {
          issues.push(`${task}:${item.objectId}: invalid candidate-use policy ${item.context?.candidateUsePolicy}`);
        }
        if (ordering && item.material?.length) issues.push(`${task}:${item.objectId}: ordering should use candidate paragraphs + source skeleton, not duplicate generic material`);
      }

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
      if (answerIds.size !== questions.length) issues.push(`${task}:${item.objectId}: answer/question count mismatch ${answerIds.size}/${questions.length}`);
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
    if (text.includes(needle)) uiIssues.push(`${label}: forbidden/legacy runtime still loaded: ${needle}`);
  };

  try {
    const component = read('../src/components/ObjectiveTransferClaims.astro');
    [
      'kianos-english-objective-transfer-claims-v1',
      'KIANOS_OBJECTIVE_RETURN_V1',
      'kianos.english.objective_review_return.v1',
      'kianos.english.objective_handoff.v1',
      'repairCompleted',
      'repairEvidence',
      'allowedActive',
      'allowedReopen',
      'persistPair',
      'REOPENED',
      'node.hidden = !attempt?.submitted || problems === 0'
    ].forEach((needle) => requireText('ObjectiveTransferClaims', component, needle));
    forbidText('ObjectiveTransferClaims', component, 'kianos-reading-watch-signals-v1');
    forbidText('ObjectiveTransferClaims', component, '待迁移能力验证');
    forbidText('ObjectiveTransferClaims', component, 'clean attempt，但有');
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
    const workspace = read('../src/components/ReadingBWorkspace.astro');
    ['data-objective-instruction', 'data-reading-b-task-form', 'data-reading-b-candidate-policy', 'data-reading-b-candidate-use'].forEach((needle) => requireText('Reading B workspace', workspace, needle));
  } catch (error) {
    uiIssues.push(`Reading B page/workspace: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const readingA = read('../src/pages/reading/[id].astro');
    requireText('Reading A page', readingA, 'ObjectiveTransferClaims');
    requireText('Reading A page', readingA, 'task="reading_a"');
    ['ReadingReviewSignals', 'ReadingTransferEvidence', 'ReadingSessionTransferEvidence', 'ReadingRepairCoach'].forEach((needle) => forbidText('Reading A page', readingA, needle));
  } catch (error) {
    uiIssues.push(`Reading A page: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const objectiveHandoff = read('../src/components/ObjectiveHandoff.astro');
    [
      'OPTIONAL_ESCALATION',
      'ACTIVE TRANSFER CLAIMS · opportunistic only',
      'KIANOS_OBJECTIVE_RETURN_V1',
      'RECENT CLOSED CLAIMS · reopen only with direct contradiction',
      'repairCompleted',
      'repairEvidence',
      'reopenCandidateIds',
      'data-objective-instruction',
      'node.hidden = !attempt.submitted || problems === 0'
    ].forEach((needle) => requireText('ObjectiveHandoff', objectiveHandoff, needle));
    forbidText('ObjectiveHandoff', objectiveHandoff, 'TRANSFER_CHECK');
  } catch (error) {
    uiIssues.push(`ObjectiveHandoff: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const readingHandoff = read('../src/components/ReadingPassageHandoff.astro');
    [
      'OPTIONAL_ESCALATION',
      'ACTIVE TRANSFER CLAIMS · opportunistic only',
      'KIANOS_OBJECTIVE_RETURN_V1',
      'RECENT CLOSED CLAIMS · reopen only with direct contradiction',
      'newClaims require',
      'reopenCandidateIds',
      'problems === 0'
    ].forEach((needle) => requireText('ReadingPassageHandoff', readingHandoff, needle));
    forbidText('ReadingPassageHandoff', readingHandoff, 'TRANSFER_CHECK');
    forbidText('ReadingPassageHandoff', readingHandoff, '用这篇验证迁移');
  } catch (error) {
    uiIssues.push(`ReadingPassageHandoff: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const sessionHandoff = read('../src/components/ReadingSessionHandoff.astro');
    ['reviewIds.length >= 2', 'Compare only where evidence supports a recurring pattern', 'one-off error stays local'].forEach((needle) => requireText('ReadingSessionHandoff', sessionHandoff, needle));
    forbidText('ReadingSessionHandoff', sessionHandoff, 'kianos-reading-watch-signals-v1');
  } catch (error) {
    uiIssues.push(`ReadingSessionHandoff: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const journey = read('./test-objective-journey.mjs');
    ['cloze_clean_pass_creates_no_debt', 'duplicate_return_is_idempotent', 'failed_import_preserves_pasted_return', 'fresh_relevant_evidence_closes_claim', 'fresh_contradiction_reopens_closed_claim', 'reading_b_directions_projected'].forEach((needle) => requireText('objective journey E2E', journey, needle));
  } catch (error) {
    uiIssues.push(`objective journey E2E: ${error instanceof Error ? error.message : String(error)}`);
  }

  issues.push(...uiIssues.map((issue) => `ui:${issue}`));
  summary.evidenceRuntime = {
    status: uiIssues.length ? 'invalid' : 'ready',
    issueCount: uiIssues.length,
    legacyQuestionWatchLoaded: uiIssues.some((issue) => issue.includes('legacy runtime still loaded'))
  };
}

try {
  const manifest = JSON.parse(read('../../content/english/manifest.json'));
  const map = manifest?.final_learner_objects?.task_map;
  if (map?.schema !== 'kianos.english.task_map.v1') {
    issues.push('objective task map: missing Content-owned schema');
  }
  const expected = {
    reading_a: ['reading_part_a'],
    cloze: ['cloze'],
    reading_b: ['reading_part_b'],
    translation: ['translation'],
    writing: ['writing_part_a', 'writing_part_b']
  };
  for (const [task, sections] of Object.entries(expected)) {
    if (JSON.stringify(map?.tasks?.[task]?.sections || []) !== JSON.stringify(sections)) {
      issues.push(`objective task map: ${task} sections drift`);
    }
  }

  const objectiveLoader = read('../src/lib/englishObjective.mjs');
  for (const forbidden of ['KIANOS_CLOZE_SECTIONS', 'KIANOS_READING_B_SECTIONS', 'sectionMatch(', 'idMatch(']) {
    if (objectiveLoader.includes(forbidden)) {
      issues.push(`objective loader: semantic task inference remains: ${forbidden}`);
    }
  }
  const readingLoader = read('../src/lib/englishReading.mjs');
  if (!readingLoader.includes("objectiveTaskSections(manifest, 'reading_a')")) {
    issues.push('Reading A loader: Content-owned task identity not consumed');
  }

  const translationLoader = read('../src/lib/englishTranslation.mjs');
  for (const forbidden of ['KIANOS_TRANSLATION_SECTIONS', 'sectionMatch(', 'idMatch(']) {
    if (translationLoader.includes(forbidden)) {
      issues.push(`Translation loader: semantic task inference remains: ${forbidden}`);
    }
  }
  if (!translationLoader.includes("manifest?.final_learner_objects?.task_map")) {
    issues.push('Translation loader: Content-owned task identity not consumed');
  }

  const writingLoader = read('../src/lib/englishWriting.mjs');
  if (writingLoader.includes('looksLikeWriting(')) {
    issues.push('Writing loader: semantic task inference remains: looksLikeWriting');
  }
  if (!writingLoader.includes("manifest?.final_learner_objects?.task_map")) {
    issues.push('Writing loader: Content-owned task identity not consumed');
  }
} catch (error) {
  issues.push(`objective task map: ${error instanceof Error ? error.message : String(error)}`);
}

validateTask({ task: 'cloze', list: listClozeSets, load: loadClozeById, loadAnswers: loadClozeAnswersById });
validateTask({ task: 'reading_b', list: listReadingBSets, load: loadReadingBById, loadAnswers: loadReadingBAnswersById });
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