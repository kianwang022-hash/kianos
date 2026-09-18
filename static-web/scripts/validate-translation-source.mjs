import fs from 'node:fs';
import path from 'node:path';
import {
  inspectTranslationSources,
  listTranslationSets,
  loadTranslationById,
  loadTranslationReferencesById
} from '../src/lib/englishTranslation.mjs';

const report = inspectTranslationSources();
const catalog = listTranslationSets();
const failures = [];
const debts = [];
const setIds = new Set();
const promptIds = new Set();
const questionOwnerHashes = new Set();

function check(condition, code) {
  if (!condition) failures.push(code);
}

function present(value) {
  return String(value ?? '').trim().length > 0;
}

function hasLearnerSource(task) {
  return (task.material || []).some((item) => present(item?.text))
    || (task.prompts || []).some((item) => present(item?.sourceText));
}

const learnerProjectionKeys = new Set([
  'task', 'objectId', 'title', 'paperId', 'year', 'code', 'section',
  'material', 'prompts', 'referenceCoverage', 'context', 'navigation',
  'sourcePaths', 'sourceHashes', 'manifestStatus', 'sectionResolutionMode'
]);

check(report.status === 'ready', `SOURCE_STATUS:${report.status}`);
check((report.issues || []).length === 0, `SOURCE_ISSUES:${(report.issues || []).join('|')}`);
check((report.missing || []).length === 0, `SOURCE_MISSING:${(report.missing || []).join('|')}`);
check(Array.isArray(report.sections) && report.sections.length > 0, 'TRANSLATION_SECTION_NOT_RESOLVED');
check(report.sectionResolutionMode === 'content-owned-task-map', `SECTION_RESOLUTION_MODE:${report.sectionResolutionMode || 'missing'}`);
check(report.setCount > 0, `TRANSLATION_SET_COUNT:${report.setCount}`);
check(catalog.length === report.setCount, `CATALOG_SET_COUNT:${catalog.length}/${report.setCount}`);
check(report.completeReferenceSetCount + report.partialReferenceSetCount === report.setCount,
  `REFERENCE_SET_ACCOUNTING:${report.completeReferenceSetCount}+${report.partialReferenceSetCount}/${report.setCount}`);

for (const item of catalog) {
  check(present(item.id), 'CATALOG_SET_ID_MISSING');
  check(!setIds.has(item.id), `DUPLICATE_SET_ID:${item.id}`);
  setIds.add(item.id);

  let task;
  let reference;
  try {
    task = loadTranslationById(item.id);
    reference = loadTranslationReferencesById(item.id);
  } catch (error) {
    failures.push(`LOAD_FAILED:${item.id}:${error instanceof Error ? error.message : String(error)}`);
    continue;
  }

  check(task.task === 'translation', `TASK_KIND:${item.id}:${task.task}`);
  check(task.objectId === item.id, `TASK_IDENTITY:${item.id}:${task.objectId}`);
  check(task.manifestStatus === 'CURRENT_READY', `MANIFEST_STATUS:${item.id}:${task.manifestStatus || 'missing'}`);
  check(task.sectionResolutionMode === 'content-owned-task-map', `TASK_SECTION_RESOLUTION_MODE:${item.id}:${task.sectionResolutionMode || 'missing'}`);
  check(report.sections.includes(task.section), `TASK_SECTION_OUTSIDE_RESOLUTION:${item.id}:${task.section}`);
  check(Object.keys(task).every((key) => learnerProjectionKeys.has(key)), `UNEXPECTED_LEARNER_FIELD:${item.id}`);

  check(task.sourcePaths?.questions === 'content/english/source/question_bank.v1.json', `QUESTION_BANK_OWNER:${item.id}:${task.sourcePaths?.questions || 'missing'}`);
  check(task.sourcePaths?.manifest === 'content/english/manifest.json', `MANIFEST_OWNER:${item.id}:${task.sourcePaths?.manifest || 'missing'}`);
  check(task.sourcePaths?.contract === 'content/english/modules/translation/learning.md', `TRANSLATION_CONTRACT_OWNER:${item.id}:${task.sourcePaths?.contract || 'missing'}`);
  check(/^[a-f0-9]{64}$/i.test(String(task.sourceHashes?.questionOwner || '')), `QUESTION_OWNER_HASH:${item.id}`);
  check(/^[a-f0-9]{64}$/i.test(String(task.sourceHashes?.renderedObject || '')), `RENDERED_OBJECT_HASH:${item.id}`);
  if (present(task.sourceHashes?.questionOwner)) questionOwnerHashes.add(task.sourceHashes.questionOwner);

  const prompts = Array.isArray(task.prompts) ? task.prompts : [];
  check(prompts.length > 0, `PROMPT_ROWS_MISSING:${item.id}`);
  check(hasLearnerSource(task), `LEARNER_SOURCE_TEXT_MISSING:${item.id}`);
  check(task.navigation?.position === item.position, `NAV_POSITION:${item.id}:${task.navigation?.position}/${item.position}`);
  check(task.navigation?.total === catalog.length, `NAV_TOTAL:${item.id}:${task.navigation?.total}/${catalog.length}`);

  for (const prompt of prompts) {
    const promptId = String(prompt?.id || '');
    check(present(promptId), `PROMPT_ID_MISSING:${item.id}`);
    check(!promptIds.has(promptId), `DUPLICATE_PROMPT_ID:${promptId}`);
    promptIds.add(promptId);
    check(Number.isFinite(Number(prompt?.ordinal)) && Number(prompt.ordinal) > 0, `PROMPT_ORDINAL_INVALID:${item.id}:${promptId}`);
    check(!Object.prototype.hasOwnProperty.call(prompt, 'answer'), `ANSWER_LEAK:${item.id}:${promptId}`);
    check(!Object.prototype.hasOwnProperty.call(prompt, 'formal_answer'), `FORMAL_ANSWER_LEAK:${item.id}:${promptId}`);
    check(!Object.prototype.hasOwnProperty.call(prompt, 'correct_answer'), `CORRECT_ANSWER_LEAK:${item.id}:${promptId}`);
    check(!Object.prototype.hasOwnProperty.call(prompt, 'analysis'), `ANALYSIS_LEAK:${item.id}:${promptId}`);
  }

  const rows = Array.isArray(reference?.references) ? reference.references : [];
  check(reference?.schema === 'kianos.english.translation_reference.v1', `REFERENCE_SCHEMA:${item.id}:${reference?.schema || 'missing'}`);
  check(reference?.task === 'translation', `REFERENCE_TASK:${item.id}:${reference?.task || 'missing'}`);
  check(reference?.objectId === item.id, `REFERENCE_IDENTITY:${item.id}:${reference?.objectId || 'missing'}`);
  check(rows.length === prompts.length, `REFERENCE_PROMPT_CARDINALITY:${item.id}:${rows.length}/${prompts.length}`);
  check(reference?.availableCount + reference?.missingCount === reference?.totalCount,
    `REFERENCE_ACCOUNTING:${item.id}:${reference?.availableCount}+${reference?.missingCount}/${reference?.totalCount}`);

  const localPromptIds = new Set(prompts.map((prompt) => String(prompt?.id || '')));
  for (const row of rows) {
    const referenceId = String(row?.id || '');
    check(localPromptIds.has(referenceId), `REFERENCE_PROMPT_ID_MISMATCH:${item.id}:${referenceId || 'missing'}`);
    if (row.available) {
      check(present(row.text), `REFERENCE_AVAILABLE_WITHOUT_TEXT:${item.id}:${referenceId}`);
      check(present(row.source), `REFERENCE_AVAILABLE_WITHOUT_SOURCE:${item.id}:${referenceId}`);
    } else {
      check(!present(row.text), `REFERENCE_MISSING_WITH_TEXT:${item.id}:${referenceId}`);
      check(row.status === 'pending_review', `REFERENCE_GAP_NOT_PENDING_REVIEW:${item.id}:${referenceId}:${row.status || 'missing'}`);
      debts.push({ setId: item.id, promptId: referenceId, status: row.status || 'missing' });
    }
  }
}

check(questionOwnerHashes.size === 1, `QUESTION_OWNER_HASH_DRIFT:${questionOwnerHashes.size}`);
check(promptIds.size > 0, 'NO_STABLE_TRANSLATION_PROMPTS');
check((report.referenceGaps || []).length === debts.length, `REFERENCE_GAP_COUNT_DRIFT:${(report.referenceGaps || []).length}/${debts.length}`);

const decision = failures.length
  ? 'BLOCKED'
  : debts.length
    ? 'PASS_WITH_DEBT'
    : 'PASS';

const validation = {
  schema: 'kianos.english.translation.source-gate-validation.v1',
  gate: 'S',
  decision,
  pass: failures.length === 0,
  counts: {
    sections: report.sections?.length || 0,
    sets: catalog.length,
    prompts: promptIds.size,
    completeReferenceSets: report.completeReferenceSetCount || 0,
    partialReferenceSets: report.partialReferenceSetCount || 0,
    pendingReferenceDebts: debts.length
  },
  sections: report.sections || [],
  sectionResolutionMode: report.sectionResolutionMode || '',
  questionOwnerHash: [...questionOwnerHashes][0] || '',
  debts,
  failures,
  sourcePolicy: {
    currentManifestRequired: true,
    canonicalQuestionBankRequired: true,
    canonicalTranslationContractRequired: true,
    legacyFallbackForbidden: true,
    stablePromptIdentityRequired: true,
    cleanAttemptProjectionMustExcludeAnswers: true,
    missingReferenceAllowedOnlyAsExplicitPendingReviewDebt: true,
    fabricatedReferenceForbidden: true
  },
  note: 'A green result is evidence for Translation Source gate S only. PASS_WITH_DEBT means bounded pending_review reference debt exists; it does not authorize fabricated references and does not imply K/L/P/R/E/U acceptance.'
};

const rendered = `${JSON.stringify(validation, null, 2)}\n`;
const outPath = process.env.KIANOS_TRANSLATION_SOURCE_GATE_OUT;
if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, rendered, 'utf8');
}
console.log(rendered);

if (failures.length) process.exitCode = 1;
