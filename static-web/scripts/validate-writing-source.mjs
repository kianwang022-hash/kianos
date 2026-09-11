import fs from 'node:fs';
import path from 'node:path';
import {
  inspectWritingSources,
  listWritingTasks,
  loadWritingById,
  WRITING_SOURCE_BOUNDARY
} from '../src/lib/englishWriting.mjs';

const report = inspectWritingSources();
const tasks = listWritingTasks();
const failures = [];

function requireCheck(condition, code) {
  if (!condition) failures.push(code);
}

requireCheck(report.status === 'ready', `SOURCE_STATUS:${report.status}`);
requireCheck(report.sourceGate === 'S_PASS', `SOURCE_GATE:${report.sourceGate}`);
requireCheck(report.setCount === 49, `WRITING_SET_COUNT:${report.setCount}`);
requireCheck(report.promptCount === 49, `WRITING_PROMPT_COUNT:${report.promptCount}`);
requireCheck(report.sourceReadySetCount === 49, `WRITING_SOURCE_READY_COUNT:${report.sourceReadySetCount}`);
requireCheck(report.blockedSetCount === 0, `WRITING_BLOCKED_SET_COUNT:${report.blockedSetCount}`);
requireCheck(report.kindCounts.small === 22, `WRITING_SMALL_COUNT:${report.kindCounts.small}`);
requireCheck(report.kindCounts.big === 27, `WRITING_BIG_COUNT:${report.kindCounts.big}`);
requireCheck(report.kindCounts.unknown === 0, `WRITING_UNKNOWN_KIND_COUNT:${report.kindCounts.unknown}`);
requireCheck(JSON.stringify(report.sections) === JSON.stringify(['writing_part_a', 'writing_part_b']), `WRITING_SECTIONS:${report.sections.join('|')}`);
requireCheck(JSON.stringify(report.yearsBySection.writing_part_a || []) === JSON.stringify(Array.from({ length: 22 }, (_, i) => 2005 + i)), 'WRITING_PART_A_YEAR_COVERAGE');
requireCheck(JSON.stringify(report.yearsBySection.writing_part_b || []) === JSON.stringify(Array.from({ length: 27 }, (_, i) => 2000 + i)), 'WRITING_PART_B_YEAR_COVERAGE');
requireCheck(Object.values(report.checks || {}).every(Boolean), `SOURCE_CHECK_FAILURE:${Object.entries(report.checks || {}).filter(([, pass]) => !pass).map(([key]) => key).join('|')}`);
requireCheck(tasks.length === 49, `WRITING_TASK_CATALOG_COUNT:${tasks.length}`);

const setIds = new Set();
const promptIds = new Set();
const learnerProjectionKeys = new Set([
  'task', 'objectId', 'title', 'paperId', 'year', 'code', 'section', 'kind',
  'material', 'prompts', 'sourceReady', 'context', 'navigation', 'sourcePaths',
  'sourceHashes', 'manifestStatus'
]);

for (const task of tasks) {
  requireCheck(!setIds.has(task.id), `DUPLICATE_TASK_ID:${task.id}`);
  setIds.add(task.id);
  const loaded = loadWritingById(task.id);
  requireCheck(loaded.sourceReady === true, `TASK_NOT_SOURCE_READY:${task.id}`);
  requireCheck(Array.isArray(loaded.prompts) && loaded.prompts.length === 1, `PROMPT_CARDINALITY:${task.id}`);
  const prompt = loaded.prompts?.[0] || {};
  requireCheck(Boolean(prompt.id), `PROMPT_ID_MISSING:${task.id}`);
  requireCheck(!promptIds.has(prompt.id), `DUPLICATE_PROMPT_ID:${prompt.id}`);
  promptIds.add(prompt.id);
  requireCheck(Boolean(prompt.instruction || prompt.promptText), `PROMPT_TEXT_MISSING:${task.id}`);
  requireCheck(Object.keys(loaded).every((key) => learnerProjectionKeys.has(key)), `UNEXPECTED_LEARNER_FIELD:${task.id}`);
  const spec = WRITING_SOURCE_BOUNDARY.sections[task.section];
  requireCheck(Boolean(spec), `UNKNOWN_WRITING_SECTION:${task.section}`);
  requireCheck(task.kind === spec?.kind, `WRITING_KIND_DRIFT:${task.id}:${task.kind}`);
  requireCheck(task.id === spec?.setIdForYear(Number(task.year)), `WRITING_SET_ID_PATTERN:${task.id}`);
  requireCheck(prompt.id === spec?.promptIdForYear(Number(task.year)), `WRITING_PROMPT_ID_PATTERN:${prompt.id}`);
}

const validation = {
  schema: 'kianos.english.writing.source-gate-validation.v1',
  gate: 'S',
  pass: failures.length === 0,
  sourceHash: report.sourceHash,
  sections: report.sections,
  yearsBySection: report.yearsBySection,
  counts: {
    sets: report.setCount,
    prompts: report.promptCount,
    small: report.kindCounts.small,
    big: report.kindCounts.big,
    unknown: report.kindCounts.unknown,
    sourceReadySets: report.sourceReadySetCount,
    blockedSets: report.blockedSetCount,
    uniqueSetIds: setIds.size,
    uniquePromptIds: promptIds.size
  },
  checks: report.checks,
  failures,
  learnerProjectionPolicy: {
    completeEssayTaskObject: true,
    promptTextIncludedForRuntime: true,
    formalAnswerExcluded: true,
    analysisExcluded: true,
    taxonomyExcluded: true,
    requiredSetContextPreserved: true
  },
  note: 'A green validation is evidence for the Writing Source gate only. It does not imply Projection, Runtime, Evidence, or Learner Validation acceptance.'
};

const rendered = `${JSON.stringify(validation, null, 2)}\n`;
const outPath = process.env.KIANOS_WRITING_SOURCE_GATE_OUT;
if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, rendered, 'utf8');
}
console.log(rendered);

if (failures.length) process.exitCode = 1;
