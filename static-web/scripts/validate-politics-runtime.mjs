import fs from 'node:fs';

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



// Surface Mapping consumer guard.
// Learner renderers may consume resolved Projection / SurfacePlan and Question Truth,
// but must never reconstruct Politics learner semantics from raw teaching/content fields.
const cognitiveWorkspaceUrl = new URL('../src/components/PoliticsCognitiveWorkspace.astro', import.meta.url);
const cognitiveWorkspaceSource = fs.readFileSync(cognitiveWorkspaceUrl, 'utf8');
const chapterPageUrl = new URL('../src/pages/politics/[subject]/[chapter].astro', import.meta.url);
const chapterPageSource = fs.readFileSync(chapterPageUrl, 'utf8');
const repairEnhancerUrl = new URL('../src/components/PoliticsRepairEnhancer.astro', import.meta.url);
const repairEnhancerSource = fs.readFileSync(repairEnhancerUrl, 'utf8');
const unitReturnUrl = new URL('../src/components/PoliticsUnitReturnEnhancer.astro', import.meta.url);
const unitReturnSource = fs.readFileSync(unitReturnUrl, 'utf8');
const compiledPresentationUrl = new URL('../src/lib/politicsCompiledPresentation.mjs', import.meta.url);
const compiledPresentationSource = fs.readFileSync(compiledPresentationUrl, 'utf8');

const semanticInferenceGuards = [
  ['generic runtime reads unit.teaching', chapterRuntimeSource, /unit\.teaching|const\s+t\s*=\s*unit\.teaching/],
  ['generic runtime reads chapter.orientation', chapterRuntimeSource, /chapter\.orientation/],
  ['generic runtime reads chapter.compression', chapterRuntimeSource, /chapter\.compression|chapter\.raw\?\.chapter_compression/],
  ['generic runtime reconstructs raw teaching boundary', chapterRuntimeSource, /t\.boundaries|t\.answer|t\.bridge|t\.closure|t\.next/],
  ['C00 workspace reads raw learning_semantics', cognitiveWorkspaceSource, /learning_semantics|framework_maps|relation_chains|recall_seed|source_handoff/],
  ['chapter page mounts legacy semantic bridge', chapterPageSource, /PoliticsCognitiveWorkspaceBridge|PoliticsCognitiveWorkspaceReadable/],
  ['chapter page mounts DOM semantic replacement', chapterPageSource, /PoliticsCognitiveWorkspaceExplicitSurface|PoliticsProjectionRuntimeOutlet/],
  ['chapter page mounts legacy semantic behavior overlay', chapterPageSource, /PoliticsCognitiveWorkspaceExplicitBehavior/],
  ['repair enhancer carries legacy learner repair payload', repairEnhancerSource, /data-politics-repair-payload|politicsPreciseRepair/]
];
for (const [label, source, pattern] of semanticInferenceGuards) {
  if (pattern.test(source)) fail(`surface mapping consumer regression: ${label}`);
}

const requiredMappedConsumers = [
  ['generic runtime', chapterRuntimeSource, /PoliticsExplicitSurfacePlan/],
  ['C00 workspace', cognitiveWorkspaceSource, /PoliticsExplicitSurfacePlan/],
  ['repair', repairEnhancerSource, /surfacePlan\.states\.REPAIR/],
  ['continue', unitReturnSource, /surfacePlan\.states\.CONTINUE/],
  ['compiled chapter context', compiledPresentationSource, /loadPoliticsCompiledChapterContext/]
];
for (const [label, source, pattern] of requiredMappedConsumers) {
  if (!pattern.test(source)) fail(`surface mapping consumer missing: ${label}`);
}

// Surface Ownership regression guard.
// Chengfeng source text remains resolved in Current for provenance/repair, but first-round
// Politics projection must not turn Astro into a competing continuous lecture reader.
const chapterRuntimeUrl = new URL('../src/components/PoliticsChapterRuntime.astro', import.meta.url);
const chapterRuntimeSource = fs.readFileSync(chapterRuntimeUrl, 'utf8');
const forbiddenProjectionPatterns = [
  ['continuous Chengfeng text render', /node\.text/],
  ['legacy source-flow reader', /politicsSourceFlow/],
  ['legacy learner copy', /直接学正文/]
];
for (const [label, pattern] of forbiddenProjectionPatterns) {
  if (pattern.test(chapterRuntimeSource)) fail(`surface ownership regression: ${label}`);
}
if (!/去 iPad \/ MarginNote 学原讲义/.test(chapterRuntimeSource)) {
  fail('surface ownership regression: missing external-primary Chengfeng handoff');
}
if (!/肖1000 · Astro 验证/.test(chapterRuntimeSource)) {
  fail('surface ownership regression: missing Astro Xiao1000 verification ownership');
}
if (!/data-politics-external-source/.test(chapterRuntimeSource)) {
  fail('surface ownership regression: missing stable external-source return anchor');
}

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
    questionRows: diagnostics.questionRows,
    chengfengPrimarySurface: 'IPAD_MARGINNOTE_ORIGINAL_LECTURE',
    xiao1000PrimarySurface: 'ASTRO_KIANOS_WEB'
  }));
}

await import('./audit-politics-k03-pilot.mjs');
await import('./validate-politics-repair-memory.mjs');
