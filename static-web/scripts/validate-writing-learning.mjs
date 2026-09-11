import fs from 'node:fs';
import path from 'node:path';
import { loadWritingLearningProjection, WRITING_LEARNING_SOURCE } from '../src/lib/englishWritingLearning.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const pagePath = path.join(repoRoot, 'static-web/src/pages/writing-learn.astro');
const homePath = path.join(repoRoot, 'static-web/src/pages/index.astro');
const page = fs.readFileSync(pagePath, 'utf8');
const home = fs.readFileSync(homePath, 'utf8');
const projection = loadWritingLearningProjection();
const failures = [];

function requireCheck(condition, code) {
  if (!condition) failures.push(code);
}

const blockIds = projection.blocks.map((block) => block.id);
const activeChecks = projection.blocks.flatMap((block) => block.segments.filter((segment) => segment.type === 'active_check'));
const gatedSegments = projection.blocks.flatMap((block) => block.segments.filter((segment) => segment.requires));
const terminalChecks = projection.blocks.flatMap((block) => block.terminalCheckId ? [block.terminalCheckId] : []);
const postActionCoverage = new Set([
  ...gatedSegments.map((segment) => segment.requires).filter(Boolean),
  ...terminalChecks
]);
const uncoveredChecks = activeChecks.map((check) => check.id).filter((checkId) => !postActionCoverage.has(checkId));
const perBlockCheckCoverage = projection.blocks.map((block) => ({
  block: block.id,
  checks: block.segments.filter((segment) => segment.type === 'active_check').map((segment) => segment.id),
  gatedContentAfter: block.segments.filter((segment) => segment.requires).map((segment) => segment.requires),
  terminalProgressionGate: block.terminalCheckId || null
}));

requireCheck(projection.status === 'ready', `PROJECTION_STATUS:${projection.status}:${projection.issues.join('|')}`);
requireCheck(projection.sourcePath === WRITING_LEARNING_SOURCE, `WRITING_OWNER:${projection.sourcePath}`);
requireCheck(projection.sourcePath === 'content/english/modules/writing/learning.md', `WRITING_OWNER_PATH:${projection.sourcePath}`);
requireCheck(projection.globalMap.includes('TASK') && projection.globalMap.includes('GENERATE') && projection.globalMap.includes('ORGANIZE') && projection.globalMap.includes('REALIZE') && projection.globalMap.includes('CONTROL') && projection.globalMap.includes('DELIVER'), 'GLOBAL_MAP_CHAIN');
requireCheck(JSON.stringify(blockIds) === JSON.stringify(['b1','b2','b3','b4','b5','b6','b7','b8']), `CORE_ROUTE:${blockIds.join('|')}`);
requireCheck(activeChecks.length === 6, `ACTIVE_CHECK_COUNT:${activeChecks.length}`);
requireCheck(uncoveredChecks.length === 0, `ACTIVE_CHECK_POST_ACTION_UNCOVERED:${uncoveredChecks.join('|')}`);
requireCheck(projection.syntheticFullGate.includes('one synthetic Small Writing'), 'SYNTHETIC_SMALL_GATE');
requireCheck(projection.syntheticFullGate.includes('one synthetic Big Writing'), 'SYNTHETIC_BIG_GATE');
requireCheck(/Skill Map/.test(projection.skillMap), 'SKILL_MAP_OWNER_SECTION');
requireCheck(/True-Exam Entry Gate/.test(projection.trueExamEntryGate), 'TRUE_EXAM_GATE_OWNER_SECTION');
requireCheck(projection.route[0] === 'global-map', `FIRST_ROUTE:${projection.route[0]}`);
requireCheck(projection.route.at(-1) === 'synthetic-gate', `LAST_ROUTE:${projection.route.at(-1)}`);

// Projection semantics: do not accept a full-Markdown dump or a copied task runtime.
requireCheck(page.includes("import { loadWritingLearningProjection } from '../lib/englishWritingLearning.mjs';"), 'PAGE_NOT_BOUND_TO_SEMANTIC_PROJECTION');
requireCheck(!page.includes("readFileSync") && !page.includes("content/english/modules/writing/learning.md'"), 'PAGE_READS_CANONICAL_MARKDOWN_DIRECTLY');
requireCheck(!page.includes("englishWriting.mjs"), 'FIRST_LEARNING_IMPORTS_TRUE_EXAM_CATALOG');
requireCheck(page.includes('data-writing-panel="global-map"'), 'GLOBAL_MAP_PANEL_MISSING');
requireCheck(page.indexOf('data-writing-panel="global-map"') < page.indexOf('data-writing-panel={block.id}'), 'GLOBAL_MAP_NOT_FIRST_PANEL');
requireCheck(page.includes("const layerCards = [") && page.includes("['TASK'") && page.includes("['DELIVER'"), 'GLOBAL_MAP_VISUAL_CHAIN_MISSING');
requireCheck(page.includes('data-writing-route={block.id}') && page.includes('data-writing-route="synthetic-gate"'), 'CONTINUOUS_ROUTE_WIRING_MISSING');
requireCheck(!page.includes('data-writing-route="skill-map"'), 'SKILL_MAP_PROMOTED_TO_FIRST_ROUTE');
requireCheck(page.includes('<details class="writingLaterAsset">') && page.includes('Skill Map · 后续卡住时再用'), 'SKILL_MAP_NOT_DEMOTED');
requireCheck(page.includes('True-Exam Entry Gate · 只看入口标准，不打开真题'), 'TRUE_EXAM_PROTECTION_COPY_MISSING');
requireCheck(!/href=\{?[^\n]*writing\//.test(page), 'TRUE_EXAM_RUNTIME_LINK_EXPOSED_DURING_COLD_START');

// Active Check must require an actual first response before post-check content or terminal progression becomes available.
requireCheck(page.includes('data-check-response'), 'ACTIVE_CHECK_RESPONSE_INPUT_MISSING');
requireCheck(page.includes('data-unlock-check disabled'), 'ACTIVE_CHECK_UNLOCK_NOT_DISABLED_FIRST');
requireCheck(page.includes("unlockButton.disabled = response.value.trim().length === 0"), 'ACTIVE_CHECK_NONEMPTY_GATE_MISSING');
requireCheck(page.includes("unlocked.add(checkId)"), 'ACTIVE_CHECK_UNLOCK_STATE_MISSING');
requireCheck(page.includes("node.hidden = Boolean(required) && !unlocked.has(required)"), 'POST_CHECK_CONTENT_NOT_HIDDEN');
requireCheck(page.includes('data-check-required-action={block.terminalCheckId || undefined}'), 'TERMINAL_CHECK_ACTION_BINDING_MISSING');
requireCheck(page.includes('disabled={Boolean(block.terminalCheckId)}'), 'TERMINAL_CHECK_ACTION_NOT_DISABLED_FIRST');
requireCheck(page.includes("node.disabled = Boolean(required) && !unlocked.has(required)"), 'TERMINAL_CHECK_ACTION_NOT_UNLOCKED');
requireCheck(page.includes('response.readOnly = true'), 'FIRST_TRY_NOT_LOCKED_IN_SESSION');

// First-try text must remain ephemeral in this P-only projection; navigation booleans may be private browser state.
requireCheck(!/localStorage\.setItem\([^\n]*(response\.value|textarea|first.?try|answer)/i.test(page), 'ACTIVE_CHECK_TEXT_PERSISTED');
requireCheck(page.includes("kianos:writing:first-learning:position:v1"), 'PRIVATE_ROUTE_CONTINUATION_MISSING');
requireCheck(page.includes("kianos:writing:first-learning:synthetic-gate:v1"), 'PRIVATE_SYNTHETIC_GATE_STATE_MISSING');
requireCheck(page.includes('它们不是 mastery evidence，也不会自动开放真题'), 'SYNTHETIC_CHECKBOX_EVIDENCE_WARNING_MISSING');

// The learner must be able to find First Learning without the home surface pretending the whole Writing module is Ready.
requireCheck(home.includes("import { loadWritingLearningProjection } from '../lib/englishWritingLearning.mjs';"), 'HOME_NOT_BOUND_TO_WRITING_PROJECTION');
requireCheck(home.includes('href={`${base}writing-learn/`}'), 'WRITING_FIRST_LEARNING_NOT_DISCOVERABLE');
requireCheck(home.includes('English · Writing First Learning'), 'HOME_WRITING_LABEL_MISSING');
requireCheck(home.includes('synthetic-first') && !home.includes('Writing · Ready'), 'HOME_FALSE_WRITING_READINESS_CLAIM');

// P should expose the owner material needed to learn, but must not falsely claim Runtime/Evidence closure.
requireCheck(page.includes('Whole-Essay Productive Runtime'), 'RUNTIME_BOUNDARY_NOT_EXPLICIT');
requireCheck(!page.includes('PASS/ACCEPTABLE') && !page.includes('TRANSFER_PENDING'), 'RUNTIME_STATE_MACHINE_LEAKED_INTO_FIRST_LEARNING_UI');

const report = {
  schema: 'kianos.english.writing.projection-gate-validation.v1',
  gate: 'P',
  pass: failures.length === 0,
  sourcePath: projection.sourcePath,
  sourceHash: projection.sourceHash,
  route: projection.route,
  blockCount: projection.blocks.length,
  activeCheckCount: activeChecks.length,
  gatedSegmentCount: gatedSegments.length,
  terminalCheckCount: terminalChecks.length,
  activeCheckPostActionCoverage: activeChecks.length - uncoveredChecks.length,
  perBlockCheckCoverage,
  semantics: {
    globalMapFirst: true,
    continuousB1B8: true,
    activeCheckBeforeRevealOrProgression: true,
    blockRouteSkippableByLearnerChoice: true,
    syntheticFirst: true,
    skillMapLaterDiagnostic: true,
    trueExamCatalogProtected: true,
    answerTextEphemeral: true,
    discoverableWithoutFalseReadiness: true,
    runtimeNotClaimed: true
  },
  failures,
  note: 'This validator supplies Projection-gate evidence only. Build success remains engineering evidence, and R/E/U must be accepted separately.'
};

const rendered = `${JSON.stringify(report, null, 2)}\n`;
const outPath = process.env.KIANOS_WRITING_PROJECTION_GATE_OUT;
if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, rendered, 'utf8');
}
console.log(rendered);
if (failures.length) process.exitCode = 1;
