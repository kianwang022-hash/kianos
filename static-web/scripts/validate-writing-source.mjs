import fs from 'node:fs';
import path from 'node:path';
import {
  inspectWritingSources,
  listWritingTasks,
  loadWritingById,
  WRITING_SOURCE_BOUNDARY
} from '../src/lib/englishWriting.mjs';
import { projectWritingExamRuntimeTask } from '../src/lib/englishWritingExamRuntime.mjs';
import { inspectWritingVisualSource } from '../src/lib/englishWritingVisualSource.mjs';

const report = inspectWritingSources();
const tasks = listWritingTasks();
const failures = [];
const repoRoot = path.resolve(process.cwd(), '..');
const globalTruthPath = path.join(repoRoot, 'content/english/source/global_source_truth.v1.json');

function requireCheck(condition, code) {
  if (!condition) failures.push(code);
}

function preview(value, max = 320) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim().slice(0, max);
  if (Array.isArray(value)) return value.map((item) => preview(item, max)).filter(Boolean).join(' | ').slice(0, max);
  if (typeof value === 'object') {
    for (const key of ['text', 'content', 'raw_text', 'description', 'alt', 'title', 'caption']) {
      if (value[key] !== undefined) {
        const text = preview(value[key], max);
        if (text) return text;
      }
    }
  }
  return '';
}

function canonicalVisualAssets(value) {
  if (Array.isArray(value?.images)) return value.images;
  if (Array.isArray(value?.visual_assets)) return value.visual_assets;
  return [];
}

function canonicalVisualField(value) {
  if (Array.isArray(value?.images)) return 'images';
  if (Array.isArray(value?.visual_assets)) return 'visual_assets';
  return null;
}

function collectWritingBTruth(value, out = new Map(), seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return out;
  seen.add(value);
  if (!Array.isArray(value)) {
    const unitId = String(value.unit_id || value.set_id || value.id || value.fixture_id || '');
    if (/^english1-\d{4}-writing-b-main$/.test(unitId)) {
      const current = out.get(unitId);
      const currentVisuals = canonicalVisualAssets(current).length;
      const candidateVisuals = canonicalVisualAssets(value).length;
      if (!current || candidateVisuals > currentVisuals) out.set(unitId, value);
    }
  }
  const children = Array.isArray(value) ? value : Object.values(value);
  for (const child of children) collectWritingBTruth(child, out, seen);
  return out;
}

function normalizedAssetPath(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.trim().replace(/^\/+/, '');
  if (typeof value !== 'object') return '';
  for (const key of ['asset_path', 'path', 'src', 'url', 'asset', 'file', 'href']) {
    const candidate = String(value?.[key] || '').trim();
    if (candidate) return candidate.replace(/^\/+/, '');
  }
  return '';
}

function assetExistence(assetPath) {
  const relative = String(assetPath || '').replace(/^\/+/, '');
  if (!relative) return { root: false, webPublic: false };
  return {
    root: fs.existsSync(path.join(repoRoot, relative)),
    webPublic: fs.existsSync(path.join(repoRoot, 'static-web/public', relative))
  };
}

let globalWritingB = new Map();
let globalTruthLoadError = null;
try {
  const truth = JSON.parse(fs.readFileSync(globalTruthPath, 'utf8'));
  globalWritingB = collectWritingBTruth(truth);
} catch (error) {
  globalTruthLoadError = String(error?.message || error);
}
const exactVisualSource = inspectWritingVisualSource();

requireCheck(!globalTruthLoadError, `GLOBAL_SOURCE_TRUTH_LOAD:${globalTruthLoadError || 'ok'}`);
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
requireCheck(exactVisualSource.mappingReady === true, `WRITING_BIG_CANONICAL_MAPPING:${exactVisualSource.recordCount}/27`);

const setIds = new Set();
const promptIds = new Set();
const learnerProjectionKeys = new Set([
  'task', 'objectId', 'title', 'paperId', 'year', 'code', 'section', 'kind',
  'material', 'prompts', 'sourceReady', 'context', 'navigation', 'sourcePaths',
  'sourceHashes', 'manifestStatus'
]);
const visualAudit = [];

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

  if (task.kind === 'big') {
    const examProjection = projectWritingExamRuntimeTask(loaded);
    const rawImages = examProjection?.learnerTask?.context?.images;
    const images = Array.isArray(rawImages) ? rawImages : rawImages ? [rawImages] : [];
    const directionText = `${prompt.instruction || ''}\n${prompt.promptText || ''}\n${loaded.context?.directions || ''}`.trim();
    const visualLanguage = /\b(drawing|picture|pictures|photo|photos|cartoon|chart|charts|graph|graphs|table|tables|diagram|illustration)\b/i.test(directionText);
    const truthRow = globalWritingB.get(task.id) || null;
    const truthVisuals = canonicalVisualAssets(truthRow);
    const truthVisualField = canonicalVisualField(truthRow);
    const normalizedTruthVisuals = truthVisuals.map((asset) => ({
      ...asset,
      asset_path: String(asset?.asset_path || asset?.path || '').replace(/^\/+/, ''),
      exists: assetExistence(asset?.asset_path || asset?.path)
    }));
    const projectedAssetPaths = images.map(normalizedAssetPath).filter(Boolean);
    const canonicalAssetPaths = normalizedTruthVisuals.map((asset) => asset.asset_path).filter(Boolean);
    const projectionMatchesCanonical = JSON.stringify(projectedAssetPaths) === JSON.stringify(canonicalAssetPaths);
    const row = {
      taskId: task.id,
      year: Number(task.year),
      section: task.section,
      visualRequiredByLane: true,
      visualLanguageDetected: visualLanguage,
      imageDescriptorCount: images.length,
      projectedAssetPaths,
      canonicalAssetPaths,
      projectionMatchesCanonical,
      contextKeys: Object.keys(examProjection?.learnerTask?.context || {}).sort(),
      materialBlockCount: Array.isArray(loaded.material) ? loaded.material.length : 0,
      directionPreview: preview(directionText),
      materialPreview: preview(loaded.material),
      imageDescriptors: images,
      globalSourceTruth: truthRow ? {
        found: true,
        status: truthRow.status || null,
        runtime_status: truthRow.runtime_status || null,
        source_file: truthRow.source_file || null,
        source_file_sha256: truthRow.source_file_sha256 || null,
        canonical_visual_field: truthVisualField,
        visual_assets: normalizedTruthVisuals
      } : { found: false, canonical_visual_field: null, visual_assets: [] }
    };
    visualAudit.push(row);
    requireCheck(images.length > 0, `WRITING_BIG_VISUAL_MISSING:${task.id}`);
    requireCheck(Boolean(truthRow), `WRITING_BIG_GLOBAL_TRUTH_MISSING:${task.id}`);
    requireCheck(truthVisuals.length > 0, `WRITING_BIG_GLOBAL_VISUAL_MISSING:${task.id}`);
    requireCheck(projectionMatchesCanonical, `WRITING_BIG_VISUAL_PROJECTION_DRIFT:${task.id}:projected=${projectedAssetPaths.join('|')}:canonical=${canonicalAssetPaths.join('|')}`);
  }
}

const missingBigVisuals = visualAudit.filter((row) => row.imageDescriptorCount === 0);
const projectionDrift = visualAudit.filter((row) => !row.projectionMatchesCanonical);
const missingGlobalTruth = visualAudit.filter((row) => !row.globalSourceTruth.found);
const missingGlobalVisuals = visualAudit.filter((row) => row.globalSourceTruth.visual_assets.length === 0);
const expectedAssetCount = visualAudit.reduce((sum, row) => sum + row.globalSourceTruth.visual_assets.length, 0);
const expectedAssetsPresentInRepo = visualAudit.reduce((sum, row) => sum + row.globalSourceTruth.visual_assets.filter((asset) => asset.exists.root || asset.exists.webPublic).length, 0);
const exactRuntimePublicAssetCount = exactVisualSource.exactAssetCount || 0;
const visualClosure = {
  expectedBigWritingTasks: 27,
  auditedBigWritingTasks: visualAudit.length,
  tasksWithImageDescriptors: visualAudit.filter((row) => row.imageDescriptorCount > 0).length,
  tasksMissingImageDescriptors: missingBigVisuals.length,
  missingTaskIds: missingBigVisuals.map((row) => row.taskId),
  tasksWithCanonicalProjection: visualAudit.filter((row) => row.projectionMatchesCanonical).length,
  tasksWithProjectionDrift: projectionDrift.map((row) => row.taskId),
  globalSourceTruthRecords: globalWritingB.size,
  tasksMissingGlobalTruth: missingGlobalTruth.map((row) => row.taskId),
  tasksMissingGlobalVisualAssets: missingGlobalVisuals.map((row) => row.taskId),
  expectedVisualAssetCountFromGlobalTruth: expectedAssetCount,
  expectedVisualAssetsPresentSomewhereInRepo: expectedAssetsPresentInRepo,
  exactVisualAssetsInRuntimePublic: exactRuntimePublicAssetCount,
  exactBinaryClosure: exactVisualSource.binaryReady,
  binaryClosureIssue: exactVisualSource.issue || null,
  policy: 'Writing Part B is a visual-observation task lane. Clean true-exam learner projection must derive its image descriptors from canonical Global Source Truth, and Runtime stays blocked until the original binary bytes in static-web/public match canonical byte counts and SHA256 values.',
  records: visualAudit
};
requireCheck(visualAudit.length === 27, `WRITING_BIG_VISUAL_AUDIT_COUNT:${visualAudit.length}`);
requireCheck(globalWritingB.size === 27, `WRITING_BIG_GLOBAL_TRUTH_COUNT:${globalWritingB.size}/27`);
requireCheck(missingGlobalTruth.length === 0, `WRITING_BIG_GLOBAL_TRUTH_CLOSURE:${27 - missingGlobalTruth.length}/27`);
requireCheck(missingGlobalVisuals.length === 0, `WRITING_BIG_GLOBAL_VISUAL_CLOSURE:${27 - missingGlobalVisuals.length}/27`);
requireCheck(missingBigVisuals.length === 0, `WRITING_BIG_VISUAL_DESCRIPTOR_CLOSURE:${27 - missingBigVisuals.length}/27`);
requireCheck(projectionDrift.length === 0, `WRITING_BIG_VISUAL_PROJECTION_CLOSURE:${27 - projectionDrift.length}/27`);
requireCheck(expectedAssetCount > 0 && exactRuntimePublicAssetCount === expectedAssetCount && exactVisualSource.binaryReady === true, `WRITING_BIG_VISUAL_BINARY_CLOSURE:${exactRuntimePublicAssetCount}/${expectedAssetCount}`);

const validation = {
  schema: 'kianos.english.writing.source-gate-validation.v4',
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
  visualClosure,
  failures,
  learnerProjectionPolicy: {
    completeEssayTaskObject: true,
    promptTextIncludedForRuntime: true,
    formalAnswerExcluded: true,
    analysisExcluded: true,
    taxonomyExcluded: true,
    requiredSetContextPreserved: true,
    canonicalVisualProjectionForBigWriting: projectionDrift.length === 0 && missingBigVisuals.length === 0,
    originalVisualObservationPreservedForBigWriting: projectionDrift.length === 0 && expectedAssetCount > 0 && exactRuntimePublicAssetCount === expectedAssetCount && exactVisualSource.binaryReady === true
  },
  note: 'A green validation is evidence for the Writing Source gate only. Big Writing learner descriptors are joined from canonical Global Source Truth rather than duplicated into the question bank. S remains red until every runtime-public original binary matches canonical bytes + SHA256; this does not imply Projection, Runtime, Evidence, or Learner Validation acceptance.'
};

const rendered = `${JSON.stringify(validation, null, 2)}\n`;
const outPath = process.env.KIANOS_WRITING_SOURCE_GATE_OUT;
if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, rendered, 'utf8');
}
fs.writeFileSync(path.resolve(process.cwd(), 'writing-source-visual-audit.json'), `${JSON.stringify({
  schema: 'kianos.english.writing.visual-source-audit.v3',
  gate: 'S',
  sourceHash: report.sourceHash,
  visualClosure
}, null, 2)}\n`, 'utf8');
console.log(rendered);

if (failures.length) process.exitCode = 1;
