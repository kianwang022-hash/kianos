import fs from 'node:fs';
import path from 'node:path';
import { loadWritingLearningProjection, WRITING_LEARNING_SOURCE } from '../src/lib/englishWritingLearning.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const pagePath = path.join(repoRoot, 'static-web/src/pages/writing-learn.astro');
const homePath = path.join(repoRoot, 'static-web/src/pages/index.astro');
const englishHubPath = path.join(repoRoot, 'static-web/src/pages/english.astro');
const referencePath = path.join(repoRoot, 'content/english/modules/writing/learning.reference.md');
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

requireCheck(projection.status === 'ready', `PROJECTION_STATUS:${projection.status}:${projection.issues.join('|')}`);
requireCheck(projection.sourcePath === WRITING_LEARNING_SOURCE, `WRITING_OWNER:${projection.sourcePath}`);
requireCheck(projection.sourcePath === 'content/english/modules/writing/learning.md', `WRITING_OWNER_PATH:${projection.sourcePath}`);
requireCheck(fs.existsSync(referencePath), 'WRITING_REFERENCE_RESERVOIR_MISSING');

// Coverage floor: protect the six canonical writing primitives.
requireAny(projectionText, ['Task / Genre', 'TASK'], 'TASK_FULFILLMENT_MISSING');
requireAny(projectionText, ['Content Generation', 'GENERATE'], 'CONTENT_GENERATION_MISSING');
requireAny(projectionText, ['Organization / Development', 'ORGANIZE'], 'ORGANIZATION_DEVELOPMENT_MISSING');
requireAny(projectionText, ['English Realization', 'REALIZE'], 'ENGLISH_REALIZATION_MISSING');
requireAny(projectionText, ['Register + High-Value Error Control', 'REGISTER'], 'REGISTER_ERROR_CONTROL_MISSING');
requireAny(projectionText, ['Timed Delivery', 'DELIVER'], 'TIMED_DELIVERY_MISSING');
requireCheck(blockIds.join('|') === 'b1|b2|b3|b4|b5|b6', `CANONICAL_PRIMITIVE_ROUTE:${blockIds.join('|')}`);

// Task modes and practice remain discoverable without being promoted to base primitives.
requireAny(projection.modeSpecializations, ['Small Writing'], 'SMALL_WRITING_MODE_MISSING');
requireAny(projection.modeSpecializations, ['Big Writing'], 'BIG_WRITING_MODE_MISSING');
requireCheck(/Skill Map/.test(projection.skillMap), 'SKILL_MAP_OWNER_SECTION');
requireCheck(/Synthetic Practice/.test(projection.syntheticPractice), 'SYNTHETIC_PRACTICE_OWNER_SECTION');
requireCheck(/True-Exam Entry/.test(projection.trueExamEntryGate), 'TRUE_EXAM_GATE_OWNER_SECTION');

// Projection must stay skippable and must not turn teaching tools into mandatory progress gates.
requireCheck(page.includes("import { loadWritingLearningProjection } from '../lib/englishWritingLearning.mjs';"), 'PAGE_NOT_BOUND_TO_SEMANTIC_PROJECTION');
requireCheck(!page.includes('readFileSync') && !page.includes("content/english/modules/writing/learning.md'"), 'PAGE_READS_CANONICAL_MARKDOWN_DIRECTLY');
requireCheck(!page.includes('englishWriting.mjs'), 'FIRST_LEARNING_IMPORTS_TRUE_EXAM_CATALOG');
requireCheck(page.includes('data-writing-panel="global-map"'), 'GLOBAL_MAP_PANEL_MISSING');
requireCheck(page.indexOf('data-writing-panel="global-map"') < page.indexOf('data-writing-panel={block.id}'), 'GLOBAL_MAP_NOT_FIRST_PANEL');
requireCheck(!page.includes('data-writing-route="skill-map"'), 'SKILL_MAP_PROMOTED_TO_FIRST_ROUTE');
requireCheck(page.includes('<details class="writingLaterAsset">'), 'LATER_ASSETS_NOT_PROGRESSIVELY_DISCLOSED');
requireAny(page, ['Skill Map · 后续卡住时再用', 'Skill Map'], 'SKILL_MAP_NOT_DISCOVERABLE');
requireAny(page, ['True-Exam Entry', '保护 fresh material'], 'TRUE_EXAM_PROTECTION_COPY_MISSING');
requireCheck(page.includes('href={`${base}writing/`}'), 'PRODUCTIVE_RUNTIME_RETURN_MISSING');
requireCheck(!page.includes('data-check-required-action') && !page.includes('data-unlock-check'), 'MANDATORY_ACTIVE_CHECK_GATE_PRESENT');
requireCheck(!page.includes('data-synthetic-gate'), 'MANUAL_SYNTHETIC_MASTERY_CHECKBOX_PRESENT');
requireAny(page, ['真实 synthetic completion / exam-entry 状态由 Productive Runtime evidence 决定', 'Productive Runtime evidence'], 'RUNTIME_EVIDENCE_OWNER_NOT_EXPLICIT');

// First-learning state is only private navigation, never answer/mastery evidence.
requireCheck(!/localStorage\.setItem\([^\n]*(response\.value|textarea|first.?try|answer)/i.test(page), 'ACTIVE_CHECK_TEXT_PERSISTED');
requireCheck(page.includes('kianos:writing:first-learning:position:v2'), 'PRIVATE_ROUTE_CONTINUATION_MISSING');

// Discoverability is semantic, not an exact typesetting string. The 30 points
// must still belong to the actual Writing section and productive link.
function writingLaneDiscoverable(markup) {
  const lane = markup.match(/data-capability="writing"[^>]*>([\s\S]*?)<\/section>/)?.[1] || '';
  const text = lane.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return lane.includes('href={`${base}writing/`}') && /\bWriting\b/.test(text) && /\b30\s+pts\b/.test(text);
}
function firstLearningContext(markup) {
  return markup.includes('href={`${base}writing-learn/`}') && (
    markup.includes('First Learning / targeted intervention') ||
    markup.includes('First Learning') ||
    /首次建立框架[^<]*针对当前问题查阅/.test(markup)
  );
}
requireCheck(home.includes('href={`${base}english/`}'), 'HOME_ENGLISH_ENTRY_MISSING');
requireCheck(englishHub.includes("import { loadWritingLearningProjection } from '../lib/englishWritingLearning.mjs';"), 'ENGLISH_HUB_NOT_BOUND_TO_WRITING_PROJECTION');
requireCheck(writingLaneDiscoverable(englishHub), 'WRITING_SCORE_LANE_NOT_DISCOVERABLE');
requireCheck(englishHub.includes('href={`${base}writing-learn/`}'), 'WRITING_FIRST_LEARNING_NOT_DISCOVERABLE');
requireCheck(firstLearningContext(englishHub), 'TARGETED_FIRST_LEARNING_CONTEXT_MISSING');
requireCheck(!englishHub.includes('S/K/L · accepted') && !englishHub.includes('U · learner validation'), 'ACCEPTANCE_DASHBOARD_LEAKED_TO_ENGLISH_HUB');

// Negative probes retain the detection floor after accepting split typography.
const discoverabilityProbes = {
  rejectsWrongWritingScore: !writingLaneDiscoverable(englishHub.replace(/data-capability="writing"([\s\S]*?)<\/section>/, (section) => section.replace(/\b30\b/g, '29'))),
  rejectsMissingProductiveLink: !writingLaneDiscoverable(englishHub.replaceAll('href={`${base}writing/`}', 'href="#missing-writing"')),
  rejectsMissingGuideLink: !firstLearningContext(englishHub.replaceAll('href={`${base}writing-learn/`}', 'href="#missing-guide"')),
  rejectsMissingGuidePurpose: !firstLearningContext(englishHub.replaceAll('First Learning / targeted intervention', '').replaceAll('First Learning', '').replace(/首次建立框架[^<]*针对当前问题查阅/g, ''))
};
for (const [name, pass] of Object.entries(discoverabilityProbes)) requireCheck(pass, `DISCOVERABILITY_PROBE:${name}`);

// First-learning UI must not pretend to own Runtime/Evidence state semantics.
requireAny(page, ['Writing Runtime', 'Productive Runtime'], 'RUNTIME_BOUNDARY_NOT_EXPLICIT');
requireCheck(!page.includes('PASS/ACCEPTABLE') && !page.includes('TRANSFER_PENDING'), 'RUNTIME_STATE_MACHINE_LEAKED_INTO_FIRST_LEARNING_UI');

const report = {
  schema: 'kianos.english.writing.projection-gate-validation.v4',
  gate: 'P',
  pass: failures.length === 0,
  sourcePath: projection.sourcePath,
  sourceHash: projection.sourceHash,
  currentRoute: projection.route,
  currentBlockCount: projection.blocks.length,
  currentActiveCheckCount: activeChecks.length,
  currentGatedSegmentCount: gatedSegments.length,
  semantics: {
    sixPrimitiveCoverageProtected: true,
    exactHistoricalBlockCountCanonical: false,
    mandatoryActiveCheckCountCanonical: false,
    taskModesNotBasePrimitives: true,
    integratedWalkthroughIsPractice: true,
    firstLearningSkippableRepairReservoir: true,
    semanticReferenceReservoirPreserved: true,
    syntheticAndTrueExamBoundaryProtected: true,
    runtimeEvidenceOwnsCompletion: true,
    scoreLaneDiscoverability: true
  },
  discoverabilityProbes,
  failures,
  note: 'This validator protects semantic coverage and learner burden boundaries. It intentionally rejects B1–B8 and mandatory Active Check gates as canonical learning truth.'
};

const rendered = `${JSON.stringify(report, null, 2)}\n`;
const outPath = process.env.KIANOS_WRITING_PROJECTION_GATE_OUT;
if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, rendered, 'utf8');
}
console.log(rendered);
if (failures.length) process.exitCode = 1;
