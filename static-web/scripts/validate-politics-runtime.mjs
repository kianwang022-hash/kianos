import {
  listPoliticsSubjectsCurrent,
  loadPoliticsChapterCurrent,
  politicsCurrentHealth,
  politicsRuntimeDiagnostics
} from '../src/lib/politicsRuntime.mjs';

const EXPECTED = Object.freeze({
  marxism: 9,
  history: 10,
  mao: 9,
  xi: 18,
  ethics_law: 7
});

function fail(message) {
  console.error(`POLITICS_RUNTIME_QA_FAIL: ${message}`);
  process.exitCode = 1;
}

const health = politicsCurrentHealth();
if (health.status !== 'ready') {
  fail(`required Current sources are not ready: ${health.checks.filter((row) => !row.exists || row.size <= 0).map((row) => row.path).join(', ')}`);
}

const subjects = listPoliticsSubjectsCurrent();
if (subjects.length !== Object.keys(EXPECTED).length) {
  fail(`subject count ${subjects.length}/${Object.keys(EXPECTED).length}`);
}

let chapterCount = 0;
let unitCount = 0;
let sourceOwnerCount = 0;
let questionCount = 0;
let unresolvedSources = 0;
let unresolvedQuestions = 0;

for (const subject of subjects) {
  const expectedChapters = EXPECTED[subject.subject];
  if (!expectedChapters) fail(`unexpected subject ${subject.subject}`);
  if (subject.chapters.length !== expectedChapters) {
    fail(`${subject.subject} chapter count ${subject.chapters.length}/${expectedChapters}`);
  }

  for (const chapterMeta of subject.chapters) {
    chapterCount += 1;
    const chapter = loadPoliticsChapterCurrent(subject.subject, chapterMeta.code);
    if (!chapter.units.length) fail(`${subject.subject}/${chapterMeta.code} has no Natural Units`);
    if (!chapter.orientation.question && !chapter.orientation.answer) {
      fail(`${subject.subject}/${chapterMeta.code} has no usable orientation`);
    }

    for (const unit of chapter.units) {
      unitCount += 1;
      sourceOwnerCount += unit.sourceOwnerCount || 0;
      questionCount += unit.questions.length;
      unresolvedSources += unit.unresolvedSourceRefs.length;
      unresolvedQuestions += unit.unresolvedQuestionIds.length;

      if (unit.sourceRefCount > 0 && !unit.sourceNodes.length) {
        fail(`${unit.unitId} has Chengfeng refs but no resolved source text`);
      }
      if (unit.unresolvedSourceRefs.length) {
        fail(`${unit.unitId} unresolved Chengfeng owners: ${unit.unresolvedSourceRefs.join(', ')}`);
      }
      if (unit.questionRefCount > 0 && unit.questions.length !== unit.questionRefCount) {
        fail(`${unit.unitId} Xiao1000 resolution ${unit.questions.length}/${unit.questionRefCount}; unresolved: ${unit.unresolvedQuestionIds.join(', ')}`);
      }
    }
  }
}

const expectedTotal = Object.values(EXPECTED).reduce((sum, value) => sum + value, 0);
if (chapterCount !== expectedTotal) fail(`total chapter count ${chapterCount}/${expectedTotal}`);

const diagnostics = politicsRuntimeDiagnostics();
if (diagnostics.sourceRegistryRows < 1000) fail(`source registry unexpectedly small: ${diagnostics.sourceRegistryRows}`);
if (diagnostics.questionRows < 1000) fail(`question database unexpectedly small: ${diagnostics.questionRows}`);

if (!process.exitCode) {
  console.log('POLITICS_RUNTIME_QA_PASS');
  console.log(JSON.stringify({
    subjects: subjects.length,
    chapters: chapterCount,
    units: unitCount,
    sourceOwners: sourceOwnerCount,
    questions: questionCount,
    unresolvedSources,
    unresolvedQuestions,
    sourceRegistryRows: diagnostics.sourceRegistryRows,
    questionRows: diagnostics.questionRows
  }));
}

await import('./audit-politics-k03-pilot.mjs');
await import('./validate-politics-repair-memory.mjs');
