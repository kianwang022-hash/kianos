import fs from 'node:fs';
import path from 'node:path';
import {
  inspectWritingExamRuntimeSources,
  listWritingExamRuntimeTasks,
  loadWritingExamRuntimeTask
} from '../src/lib/englishWritingExamRuntime.mjs';
import { listWritingSyntheticTasks } from '../src/lib/englishWritingSynthetic.mjs';
import {
  WRITING_REVIEW_RETURN_SCHEMA,
  WRITING_STATES,
  createInitialWritingRecord,
  lockFirstAttempt,
  buildWritingReviewPacket,
  validateWritingReviewReturn,
  applyWritingReviewReturn
} from '../src/lib/writingRuntimeModel.mjs';

const failures = [];
function check(condition, code) {
  if (!condition) failures.push(code);
}

const forbidden = new Set([
  'answer', 'answers', 'analysis', 'explanation', 'solution', 'reference',
  'reference_answer', 'sample_answer', 'model_answer', 'taxonomy',
  'qa_state', 'seal_state', 'chat_source_decision_binding'
]);
function forbiddenPaths(value, prefix = '') {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap((child, index) => forbiddenPaths(child, `${prefix}[${index}]`));
  const hits = [];
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (forbidden.has(String(key).toLowerCase())) hits.push(next);
    hits.push(...forbiddenPaths(child, next));
  }
  return hits;
}

function scalarText(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  return '';
}

function sourceLocatorMode(src, root) {
  if (/^https?:\/\//i.test(src)) return { mode: 'external-url', supported: true, resolvedPath: null };
  if (/^data:image\//i.test(src)) return { mode: 'data-image', supported: true, resolvedPath: null };

  let relativePublicPath = '';
  if (src.startsWith('static-web/public/')) relativePublicPath = src.slice('static-web/public/'.length);
  else if (src.startsWith('public/')) relativePublicPath = src.slice('public/'.length);
  else if (src.startsWith('/')) relativePublicPath = src.slice(1);

  if (relativePublicPath) {
    const resolvedPath = path.resolve(root, 'public', relativePublicPath);
    return {
      mode: fs.existsSync(resolvedPath) ? 'repo-public-asset' : 'missing-public-asset',
      supported: fs.existsSync(resolvedPath),
      resolvedPath: path.relative(root, resolvedPath)
    };
  }

  return { mode: 'unresolved-relative-src', supported: false, resolvedPath: null };
}

function auditImageDescriptor(value, root) {
  const rawType = Array.isArray(value) ? 'array' : typeof value;
  if (typeof value === 'string') {
    const text = value.trim();
    const looksLikeSrc = /^(https?:\/\/|\/|\.\/|\.\.\/|data:image\/)|\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(text);
    if (!looksLikeSrc) {
      return {
        rawType,
        shapeKeys: ['string'],
        mode: text ? 'textual-fallback' : 'empty-string',
        supported: Boolean(text),
        src: '',
        textLength: text.length,
        textPreview: text.slice(0, 240),
        raw: value
      };
    }
    const locator = sourceLocatorMode(text, root);
    return {
      rawType,
      shapeKeys: ['string'],
      ...locator,
      src: text,
      textLength: 0,
      textPreview: '',
      raw: value
    };
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {
      rawType,
      shapeKeys: [],
      mode: 'unsupported-nonobject',
      supported: false,
      src: '',
      textLength: 0,
      textPreview: '',
      raw: value
    };
  }

  const srcKeys = ['src', 'url', 'path', 'asset_path', 'asset', 'file', 'href'];
  const altKeys = ['alt', 'caption', 'description', 'title', 'text'];
  const src = srcKeys.map((key) => scalarText(value[key])).find(Boolean) || '';
  const text = altKeys.map((key) => scalarText(value[key])).find(Boolean) || '';
  if (src) {
    const locator = sourceLocatorMode(src, root);
    return {
      rawType,
      shapeKeys: Object.keys(value).sort(),
      ...locator,
      src,
      textLength: text.length,
      textPreview: text.slice(0, 240),
      raw: value
    };
  }
  if (text) {
    return {
      rawType,
      shapeKeys: Object.keys(value).sort(),
      mode: 'textual-fallback',
      supported: true,
      src: '',
      textLength: text.length,
      textPreview: text.slice(0, 240),
      raw: value
    };
  }
  return {
    rawType,
    shapeKeys: Object.keys(value).sort(),
    mode: 'unsupported-object-shape',
    supported: false,
    src: '',
    textLength: 0,
    textPreview: '',
    raw: value
  };
}

const source = inspectWritingExamRuntimeSources();
const catalog = listWritingExamRuntimeTasks();
const syntheticIds = listWritingSyntheticTasks().map((task) => task.id);
check(source.status === 'ready', `EXAM_SOURCE:${source.status}`);
check(source.sourceGate === 'S_PASS', `EXAM_SOURCE_GATE:${source.sourceGate}`);
check(source.taskCount === 49, `EXAM_TASK_COUNT:${source.taskCount}`);
check(source.sourceReadyTaskCount === 49, `EXAM_SOURCE_READY:${source.sourceReadyTaskCount}`);
check(source.kindCounts?.small === 22, `EXAM_SMALL_COUNT:${source.kindCounts?.small}`);
check(source.kindCounts?.big === 27, `EXAM_BIG_COUNT:${source.kindCounts?.big}`);
check(catalog.length === 49, `EXAM_CATALOG_COUNT:${catalog.length}`);
check(new Set(catalog.map((task) => task.id)).size === 49, 'EXAM_CATALOG_ID_DUPLICATE');
check(catalog.every((task) => task.sourceKind === 'exam'), 'EXAM_SOURCE_KIND_DRIFT');
check(catalog.filter((task) => task.kind === 'small').length === 22, 'EXAM_CATALOG_SMALL_DRIFT');
check(catalog.filter((task) => task.kind === 'big').length === 27, 'EXAM_CATALOG_BIG_DRIFT');
check(syntheticIds.length === 2 && new Set(syntheticIds).size === 2, `SYNTHETIC_GATE_IDS:${syntheticIds.length}`);

const loaded = catalog.map((row) => loadWritingExamRuntimeTask(row.id));
for (const task of loaded) {
  check(task.sourceKind === 'exam', `EXAM_RUNTIME_KIND:${task.id}`);
  check(['small', 'big'].includes(task.kind), `EXAM_RUNTIME_WRITING_KIND:${task.id}:${task.kind}`);
  check(task.learnerTask?.mode === 'exam', `EXAM_RUNTIME_MODE:${task.id}`);
  check(Array.isArray(task.learnerTask?.prompts) && task.learnerTask.prompts.length === 1, `EXAM_RUNTIME_PROMPT_CARDINALITY:${task.id}`);
  check(Boolean(task.learnerTask?.prompts?.[0]?.id), `EXAM_RUNTIME_PROMPT_ID:${task.id}`);
  check(Boolean(task.learnerTask?.prompts?.[0]?.instruction || task.learnerTask?.prompts?.[0]?.promptText), `EXAM_RUNTIME_PROMPT_EMPTY:${task.id}`);
  const leaked = forbiddenPaths(task);
  check(leaked.length === 0, `EXAM_RUNTIME_LEAK:${task.id}:${leaked.join('|')}`);
  check(task.navigation?.previousId === null && task.navigation?.nextId === null, `EXAM_RUNTIME_BYPASSES_GATED_CATALOG:${task.id}`);
}

const root = process.cwd();
const imageAuditRecords = loaded.flatMap((task) => {
  const images = task.learnerTask?.context?.images;
  const values = Array.isArray(images) ? images : images ? [images] : [];
  return values.map((value, imageIndex) => ({
    taskId: task.id,
    year: task.year,
    kind: task.kind,
    imageIndex,
    ...auditImageDescriptor(value, root)
  }));
});
const unsupportedImages = imageAuditRecords.filter((row) => !row.supported);
for (const row of unsupportedImages) check(false, `EXAM_IMAGE_UNSUPPORTED:${row.taskId}:${row.imageIndex}:${row.mode}`);
const imageShapeKeys = [...new Set(imageAuditRecords.flatMap((row) => row.shapeKeys))].sort();
const imageModes = imageAuditRecords.reduce((acc, row) => {
  acc[row.mode] = (acc[row.mode] || 0) + 1;
  return acc;
}, {});

const representative = loaded.find((task) => task.kind === 'big') || loaded[0];
let record = createInitialWritingRecord(representative, [], '2026-09-12T13:00:00.000Z');
record = lockFirstAttempt(record, {
  planMode: 'direct',
  firstPlan: '',
  firstDraft: 'This is a complete clean true-exam first draft used only to validate state semantics.'
}, '2026-09-12T13:05:00.000Z');
check(record.state === WRITING_STATES.REVIEW_PENDING, `EXAM_FIRST_ATTEMPT_STATE:${record.state}`);
const packet = buildWritingReviewPacket(representative, record);
check(packet.sourceKind === 'exam', `EXAM_REVIEW_PACKET_SOURCE:${packet.sourceKind}`);
check(packet.taskId === representative.id, 'EXAM_REVIEW_PACKET_TASK_BINDING');
check(packet.reviewContract?.learnerUnit === 'one complete essay', 'EXAM_REVIEW_UNIT_NOT_WHOLE_ESSAY');
check(forbiddenPaths(packet).length === 0, `EXAM_REVIEW_PACKET_LEAK:${forbiddenPaths(packet).join('|')}`);
const pass = validateWritingReviewReturn({
  schema: WRITING_REVIEW_RETURN_SCHEMA,
  taskId: representative.id,
  reviewOf: 'FIRST_DRAFT',
  verdict: 'PASS_ACCEPTABLE',
  firstFailureLayer: null,
  repairScope: null,
  smallestRepair: null,
  reason: 'Synthetic validator return proving that exam tasks use the same explicit PASS path.'
}, representative.id);
record = applyWritingReviewReturn(record, pass, '2026-09-12T13:10:00.000Z');
check(record.state === WRITING_STATES.PASS_ACCEPTABLE, `EXAM_PASS_STATE:${record.state}`);
check(record.transferCandidate === null, 'EXAM_PASS_CREATED_REPAIR_OR_TRANSFER_DEBT');

const files = {
  home: path.resolve(root, 'src/pages/writing.astro'),
  catalog: path.resolve(root, 'src/pages/writing/exam.astro'),
  route: path.resolve(root, 'src/pages/writing/exam/[id].astro'),
  wrapper: path.resolve(root, 'src/components/WritingExamWorkspace.astro'),
  sharedWorkspace: path.resolve(root, 'src/components/WritingWorkspace.astro')
};
for (const [name, file] of Object.entries(files)) check(fs.existsSync(file), `EXAM_${name.toUpperCase()}_MISSING`);

const home = fs.existsSync(files.home) ? fs.readFileSync(files.home, 'utf8') : '';
const catalogPage = fs.existsSync(files.catalog) ? fs.readFileSync(files.catalog, 'utf8') : '';
const routePage = fs.existsSync(files.route) ? fs.readFileSync(files.route, 'utf8') : '';
const wrapper = fs.existsSync(files.wrapper) ? fs.readFileSync(files.wrapper, 'utf8') : '';

check(home.includes('data-true-exam-entry') && home.includes('writing/exam/'), 'EXAM_HOME_POST_GATE_ENTRY_MISSING');
check(home.includes("PASS_ACCEPTABLE', 'REPAIR_COMPLETE', 'TRANSFER_PENDING"), 'EXAM_HOME_GATE_NOT_BOUND_TO_FULL_RUNTIME_STATE');
check(!home.includes('writing-learning-v1') && !home.includes('synthetic-gate-small') && !home.includes('synthetic-gate-big'), 'EXAM_HOME_GATE_USES_CONVENIENCE_CHECKBOX_STATE');
check(catalogPage.includes('data-exam-catalog-lock') && catalogPage.includes('data-exam-catalog-content'), 'EXAM_CATALOG_PRIVATE_GATE_MISSING');
check(catalogPage.includes("PASS_ACCEPTABLE', 'REPAIR_COMPLETE', 'TRANSFER_PENDING"), 'EXAM_CATALOG_GATE_NOT_BOUND_TO_FULL_RUNTIME_STATE');
check(!/holdoutYears|protectedYears|selectedYears|excludedYears/.test(catalogPage), 'EXAM_CATALOG_HARDCODES_PRIVATE_HOLDOUT');
check(routePage.includes('WritingExamWorkspace') && routePage.includes('listWritingExamRuntimeTasks'), 'EXAM_ROUTE_NOT_BOUND_TO_CURRENT_CATALOG');
check(wrapper.includes("import WritingWorkspace from './WritingWorkspace.astro'"), 'EXAM_RUNTIME_DUPLICATES_WHOLE_ESSAY_FLOW');
check(wrapper.includes('data-writing-exam-lock') && wrapper.includes('data-writing-exam-content'), 'EXAM_TASK_PRIVATE_GATE_MISSING');
check(wrapper.includes('Official task prompt'), 'EXAM_PROMPT_PROJECTION_MISSING');
check(wrapper.includes('context.images') && wrapper.includes('writingExamImages'), 'EXAM_IMAGE_PROJECTION_PATH_MISSING');
check(!/model_answer|sample_answer|reference_answer/.test(wrapper), 'EXAM_WRAPPER_REFERENCES_FORBIDDEN_MODEL_FIELDS');

const imageProjectionAudit = {
  tasksWithImages: new Set(imageAuditRecords.map((row) => row.taskId)).size,
  descriptorCount: imageAuditRecords.length,
  observedImageShapeKeys: imageShapeKeys,
  modes: imageModes,
  unsupportedCount: unsupportedImages.length,
  records: imageAuditRecords
};

const result = {
  schema: 'kianos.english.writing.exam-runtime-gate-validation.v1',
  gate: 'R',
  pass: failures.length === 0,
  source: {
    taskCount: source.taskCount,
    sourceReadyTaskCount: source.sourceReadyTaskCount,
    small: source.kindCounts?.small,
    big: source.kindCounts?.big,
    questionBankHash: source.sourceHash
  },
  imageProjectionAudit,
  semantics: {
    primaryColdStartEntryRemainsFirstLearning: true,
    syntheticCompletionGateUsesPrivateWholeEssayRuntimeState: true,
    convenienceCheckboxDoesNotUnlockExam: true,
    sharedCatalogDoesNotChoosePrivateHoldoutYears: true,
    exactCurrentCleanTaskCoverage: '49/49',
    sharedWholeEssayStateModelReused: true,
    formalAnswerAnalysisLeak: false,
    explicitPassWithoutDebt: true
  },
  failures,
  note: 'This validates the post-synthetic true-exam Runtime path. It does not close Writing Evidence or User Validation.'
};

const auditPath = path.resolve(root, 'writing-exam-runtime-audit.json');
fs.writeFileSync(auditPath, `${JSON.stringify({
  schema: 'kianos.english.writing.exam-runtime-image-audit.v1',
  source: result.source,
  imageProjectionAudit
}, null, 2)}\n`, 'utf8');
console.log(`${JSON.stringify(result, null, 2)}\n`);
if (failures.length) process.exitCode = 1;
