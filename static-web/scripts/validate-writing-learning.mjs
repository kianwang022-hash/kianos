import fs from 'node:fs';
import path from 'node:path';
import { loadWritingLearningProjection, WRITING_LEARNING_SOURCE } from '../src/lib/englishWritingLearning.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const pagePath = path.join(repoRoot, 'static-web/src/pages/writing-learn.astro');
const homePath = path.join(repoRoot, 'static-web/src/pages/index.astro');
const englishHubPath = path.join(repoRoot, 'static-web/src/pages/english.astro');
const page = fs.readFileSync(pagePath, 'utf8');
const home = fs.readFileSync(homePath, 'utf8');
const englishHub = fs.readFileSync(englishHubPath, 'utf8');
const projection = loadWritingLearningProjection();
const failures = [];

function requireCheck(condition, code) {
  if (!condition) failures.push(code);
}
function requireAny(text, needles, code) {
  requireCheck(needles.some((needle) => text.includes(needle)), code);
}

const projectionText = JSON.stringify(projection);
const blockIds = projection.blocks.map((block) => block.id);
const activeChecks = projection.blocks.flatMap((block) => block.segments.filter((segment) => segment.type === 'active_check'));
const gatedSegments = projection.blocks.flatMap((block) => block.segments.filter((segment) => segment.requires));
const terminalChecks = projection.blocks.flatMap((block) => block.terminalCheckId ? [block.terminalCheckId] : []);

requireCheck(projection.status === 'ready', `PROJECTION_STATUS:${projection.status}:${projection.issues.join('|')}`);
requireCheck(projection.sourcePath === WRITING_LEARNING_SOURCE, `WRITING_OWNER:${projection.sourcePath}`);
requireCheck(projection.sourcePath === 'content/english/modules/writing/learning.md', `WRITING_OWNER_PATH:${projection.sourcePath}`);

// Coverage floor: protect the six canonical writing primitives, not one historical block count.
requireAny(projectionText, ['Task Model', 'TASK'], 'TASK_FULFILLMENT_MISSING');
requireAny(projectionText, ['Content Generation', 'GENERATE'], 'CONTENT_GENERATION_MISSING');
requireAny(projectionText, ['Structure & Development', 'ORGANIZE', 'Organization'], 'ORGANIZATION_DEVELOPMENT_MISSING');
requireAny(projectionText, ['Language Realization', 'REALIZE'], 'ENGLISH_REALIZATION_MISSING');
requireAny(projectionText, ['Error Control', 'Register', 'CONTROL'], 'REGISTER_ERROR_CONTROL_MISSING');
requireAny(projectionText, ['Exam Execution', 'DELIVER', 'timed'], 'TIMED_DELIVERY_MISSING');

// Task forms and integrated walkthrough may exist, but are not promoted to base primitives by validation.
requireAny(projectionText, ['Small Writing'], 'SMALL_WRITING_MODE_MISSING');
requireAny(projectionText, ['Big Writing'], 'BIG_WRITING_MODE_MISSING');
requireCheck(/Skill Map/.test(projection.skillMap), 'SKILL_MAP_OWNER_SECTION');
requireCheck(/True-Exam Entry Gate/.test(projection.trueExamEntryGate), 'TRUE_EXAM_GATE_OWNER_SECTION');

// Projection must be semantic, skippable, and protected from true-exam leakage.
requireCheck(page.includes("import { loadWritingLearningProjection } from '../lib/englishWritingLearning.mjs';"), 'PAGE_NOT_BOUND_TO_SEMANTIC_PROJECTION');
requireCheck(!page.includes("readFileSync") && !page.includes("content/english/modules/writing/learning.md'"), 'PAGE_READS_CANONICAL_MARKDOWN_DIRECTLY');
requireCheck(!page.includes("englishWriting.mjs"), 'FIRST_LEARNING_IMPORTS_TRUE_EXAM_CATALOG');
requireCheck(page.includes('data-writing-panel="global-map"'), 'GLOBAL_MAP_PANEL_MISSING');
requireCheck(page.indexOf('data-writing-panel="global-map"') < page.indexOf('data-writing-panel={block.id}'), 'GLOBAL_MAP_NOT_FIRST_PANEL');
requireCheck(!page.includes('data-writing-route="skill-map"'), 'SKILL_MAP_PROMOTED_TO_FIRST_ROUTE');
requireCheck(page.includes('<details class="writingLaterAsset">'), 'LATER_ASSETS_NOT_PROGRESSIVELY_DISCLOSED');
requireAny(page, ['Skill Map · 后续卡住时再用', 'Skill Map'], 'SKILL_MAP_NOT_DISCOVERABLE');
requireAny(page, ['True-Exam Entry Gate', '只看入口标准，不打开真题'], 'TRUE_EXAM_PROTECTION_COPY_MISSING');
requireCheck(!/href=\{?[^\n]*writing\//.test(page), 'TRUE_EXAM_RUNTIME_LINK_EXPOSED_DURING_COLD_START');

// Active checks are optional teaching tools. If present, they must not leak first-try text into shared/durable state.
requireCheck(!/localStorage\.setItem\([^\n]*(response\.value|textarea|first.?try|answer)/i.test(page), 'ACTIVE_CHECK_TEXT_PERSISTED');
requireCheck(page.includes("kianos:writing:first-learning:position:v1"), 'PRIVATE_ROUTE_CONTINUATION_MISSING');
requireAny(page, ['它们不是 mastery evidence', '不会自动开放真题'], 'FIRST_LEARNING_NOT_MASTERY_WARNING_MISSING');

// Discoverability is semantic: English exposes a 30-point Writing lane and a targeted first-learning route.
requireCheck(home.includes('href={`${base}english/`}'), 'HOME_ENGLISH_ENTRY_MISSING');
requireCheck(englishHub.includes("import { loadWritingLearningProjection } from '../lib/englishWritingLearning.mjs';"), 'ENGLISH_HUB_NOT_BOUND_TO_WRITING_PROJECTION');
requireCheck(englishHub.includes('data-capability="writing"') && englishHub.includes('href={`${base}writing/`}') && englishHub.includes('Writing · 30 pts'), 'WRITING_SCORE_LANE_NOT_DISCOVERABLE');
requireCheck(englishHub.includes('href={`${base}writing-learn/`}'), 'WRITING_FIRST_LEARNING_NOT_DISCOVERABLE');
requireAny(englishHub, ['First Learning / targeted intervention', 'First Learning'], 'TARGETED_FIRST_LEARNING_CONTEXT_MISSING');
requireCheck(!englishHub.includes('S/K/L · accepted') && !englishHub.includes('U · learner validation'), 'ACCEPTANCE_DASHBOARD_LEAKED_TO_ENGLISH_HUB');

// First-learning projection must not falsely claim runtime/evidence closure.
requireAny(page, ['Whole-Essay Productive Runtime', 'Runtime'], 'RUNTIME_BOUNDARY_NOT_EXPLICIT');
requireCheck(!page.includes('PASS/ACCEPTABLE') && !page.includes('TRANSFER_PENDING'), 'RUNTIME_STATE_MACHINE_LEAKED_INTO_FIRST_LEARNING_UI');

const report = {
  schema: 'kianos.english.writing.projection-gate-validation.v3',
  gate: 'P',
  pass: failures.length === 0,
  sourcePath: projection.sourcePath,
  sourceHash: projection.sourceHash,
  currentRoute: projection.route,
  currentBlockCount: projection.blocks.length,
  currentActiveCheckCount: activeChecks.length,
  currentGatedSegmentCount: gatedSegments.length,
  currentTerminalCheckCount: terminalChecks.length,
  semantics: {
    sixPrimitiveCoverageProtected: true,
    exactBlockCountCanonical: false,
    exactActiveCheckCountCanonical: false,
    taskModesNotBasePrimitives: true,
    firstLearningSkippableRepairReservoir: true,
    syntheticAndTrueExamBoundaryProtected: true,
    answerTextEphemeral: true,
    scoreLaneDiscoverability: true,
    runtimeNotClaimed: true
  },
  failures,
  note: 'This validator protects semantic coverage and projection boundaries. It intentionally does not make B1–B8, six Active Checks, or any exact page decomposition a learning truth.'
};

const rendered = `${JSON.stringify(report, null, 2)}\n`;
const outPath = process.env.KIANOS_WRITING_PROJECTION_GATE_OUT;
if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, rendered, 'utf8');
}
console.log(rendered);
if (failures.length) process.exitCode = 1;