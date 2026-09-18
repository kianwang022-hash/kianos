import fs from 'node:fs';
import path from 'node:path';
import { listPoliticsChapterPathsCurrent, loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';
import { enrichPoliticsChapterCurrent } from '../src/lib/politicsRepairMemory.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const learningRoot = path.join(repoRoot, 'content/politics/learning');
const sourceRegistryPath = path.join(repoRoot, 'content/politics/source/source_node_registry.v2.jsonl');

function fail(message) {
  console.error(`POLITICS_REPAIR_MEMORY_QA_FAIL: ${message}`);
  process.exitCode = 1;
}

function jsonFiles(suffix) {
  const out = [];
  for (const entry of fs.readdirSync(learningRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(learningRoot, entry.name);
    for (const name of fs.readdirSync(dir)) {
      if (name.endsWith(suffix)) out.push(path.join(dir, name));
    }
  }
  return out.sort();
}

function sourceNodeIds() {
  const ids = new Set();
  for (const line of fs.readFileSync(sourceRegistryPath, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    const row = JSON.parse(line);
    for (const key of ['stable_node_id', 'node_id', 'id', 'stable_id', 'source_node_id']) {
      if (typeof row?.[key] === 'string' && row[key]) ids.add(row[key]);
    }
  }
  return ids;
}

function deferredFirstReady(chapter, questionId) {
  for (const checkpoint of chapter?.firstReadyProjection?.embedded_checkpoints || []) {
    const row = (checkpoint?.deferred_questions || []).find((entry) => String(entry?.question_id || '') === String(questionId));
    if (!row) continue;
    return {
      ...row,
      embedded_natural_unit_id: String(checkpoint?.embedded_natural_unit_id || ''),
      runtime_natural_unit_id: String(checkpoint?.runtime_natural_unit_id || '')
    };
  }
  return null;
}

const sourceIds = sourceNodeIds();
const memoryFiles = jsonFiles('.memory.json');
const repairFiles = jsonFiles('.repair.json');
let sidecarMemoryCount = 0;

for (const file of memoryFiles) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rel = path.relative(repoRoot, file);
  if (data?.schema !== 'kianos.politics.memory_projection.v1') fail(`${rel} invalid schema`);
  if (data?.policy !== 'SOURCE_GROUNDED_SELECTIVE') fail(`${rel} must use SOURCE_GROUNDED_SELECTIVE`);
  if (data?.admission_gate?.requires_source_grounding !== true) fail(`${rel} must require source grounding`);
  if (!data?.admission_gate?.memory_admission || !data?.admission_gate?.precision_admission) {
    fail(`${rel} must own separate memory_admission and precision_admission gates`);
  }
  for (const legacyKey of ['default', 'admit_when_any', 'do_not_admit_for']) {
    if (Object.prototype.hasOwnProperty.call(data?.admission_gate || {}, legacyKey)) {
      fail(`${rel} legacy combined admission gate still present: ${legacyKey}`);
    }
  }

  const handbook = data?.preferred_memory_reference || null;
  if (handbook) {
    if (handbook.role !== 'DESIGNATED_MEMORY_HANDBOOK') fail(`${rel} preferred_memory_reference must be DESIGNATED_MEMORY_HANDBOOK`);
    if (!handbook.binding_status) fail(`${rel} preferred_memory_reference missing binding_status`);
  }

  for (const [unitId, unit] of Object.entries(data?.units || {})) {
    const candidates = Array.isArray(unit?.candidates) ? unit.candidates : [];
    if (!candidates.length) fail(`${rel}:${unitId} has no candidates`);
    for (const candidate of candidates) {
      sidecarMemoryCount += 1;
      if (Object.prototype.hasOwnProperty.call(candidate || {}, 'admission') || Object.prototype.hasOwnProperty.call(candidate || {}, 'admission_blocker')) {
        fail(`${rel}:${candidate?.id || unitId} legacy combined admission fields remain`);
      }
      const refs = Array.isArray(candidate?.source_refs) ? candidate.source_refs.filter(Boolean) : [];
      if (!refs.length) fail(`${rel}:${candidate?.id || unitId} has no source_refs`);
      for (const ref of refs) {
        if (!sourceIds.has(ref)) fail(`${rel}:${candidate?.id || unitId} unresolved source_ref ${ref}`);
      }
      const memoryAdmission = String(candidate?.memory_admission || '');
      const precisionAdmission = String(candidate?.precision_admission || '');
      if (!['ADMITTED_STABLE', 'CANDIDATE_FRESHNESS', 'REFERENCE_ONLY'].includes(memoryAdmission)) {
        fail(`${rel}:${candidate?.id || unitId} invalid memory_admission ${memoryAdmission || 'MISSING'}`);
      }
      if (!['ADMITTED_STABLE', 'CANDIDATE_EXACTNESS', 'CANDIDATE_FRESHNESS', 'NOT_APPLICABLE'].includes(precisionAdmission)) {
        fail(`${rel}:${candidate?.id || unitId} invalid precision_admission ${precisionAdmission || 'MISSING'}`);
      }
      if (memoryAdmission === 'ADMITTED_STABLE' && !candidate?.memory_basis?.some?.((row) => String(row).includes('CURRENT_'))) {
        fail(`${rel}:${candidate?.id || unitId} stable Memory must retain Current grounding`);
      }
      if (precisionAdmission.startsWith('CANDIDATE_') && !candidate?.precision_blocker) {
        fail(`${rel}:${candidate?.id || unitId} candidate Precision must keep an explicit precision_blocker`);
      }

      const historicalRefs = Array.isArray(candidate?.historical_handbook_refs)
        ? candidate.historical_handbook_refs.filter(Boolean)
        : [];
      const historicalAlignment = String(candidate?.historical_handbook_alignment || '').trim();
      const legacyAlignment = String(candidate?.handbook_alignment || '').trim();

      if (historicalRefs.length && !handbook) {
        fail(`${rel}:${candidate?.id || unitId} has historical_handbook_refs without preferred_memory_reference`);
      }
      if ((historicalAlignment || legacyAlignment) && !historicalRefs.length) {
        fail(`${rel}:${candidate?.id || unitId} claims handbook alignment without historical_handbook_refs`);
      }
      // LEG26 may establish Memory priority only when Current-grounded Knowledge
      // supports the same semantic claim. Precision exactness/freshness is separate.
    }
  }
}

if (memoryFiles.length !== 23) fail(`memory sidecar file count ${memoryFiles.length}/23`);
if (sidecarMemoryCount !== 78) fail(`sidecar Memory count ${sidecarMemoryCount}/78`);

const historyHorizontalPath = path.join(learningRoot, 'history', 'later-stage-knowledge.json');
if (fs.existsSync(historyHorizontalPath)) {
  const history = JSON.parse(fs.readFileSync(historyHorizontalPath, 'utf8'));
  let horizontalCount = 0;
  for (const [lineKey, line] of Object.entries(history?.horizontal_lines || {})) {
    for (const candidate of line?.candidates || []) {
      horizontalCount += 1;
      if (candidate?.memory_admission !== 'ADMITTED_STABLE') {
        fail(`history:${lineKey}:${candidate?.id || 'UNKNOWN'} must be admitted stable Memory`);
      }
      if (!['CANDIDATE_EXACTNESS', 'ADMITTED_STABLE'].includes(candidate?.precision_admission)) {
        fail(`history:${lineKey}:${candidate?.id || 'UNKNOWN'} invalid precision_admission`);
      }
    }
  }
  if (horizontalCount !== 50) fail(`history horizontal Memory count ${horizontalCount}/50`);
}

const chapterIndex = new Map();
for (const row of listPoliticsChapterPathsCurrent()) {
  const chapter = enrichPoliticsChapterCurrent(loadPoliticsChapterCurrent(row.subject, row.chapter));
  chapterIndex.set(`${row.subject}/${row.chapter}`, chapter);
}

for (const file of repairFiles) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rel = path.relative(repoRoot, file);
  if (data?.schema !== 'kianos.politics.question_repair_projection.v1') fail(`${rel} invalid schema`);
  const priority = Array.isArray(data?.source_priority) ? data.source_priority : [];
  const legacyIndex = priority.findIndex((row) => String(row).includes('LEGACY_QUESTION_KNOWLEDGE_LINKS'));
  if (legacyIndex < 0 || legacyIndex !== priority.length - 1 || !String(priority[legacyIndex]).includes('PROVENANCE_ONLY')) {
    fail(`${rel} legacy question links must be final provenance-only source`);
  }
  if (!String(data?.semantic_authority_rule || '').includes('may not override Current Unit ownership')) {
    fail(`${rel} missing semantic authority guard`);
  }

  const base = path.basename(file, '.repair.json');
  const subject = path.basename(path.dirname(file));
  const chapter = chapterIndex.get(`${subject}/${base}`);
  if (!chapter) {
    fail(`${rel} cannot resolve owning chapter ${subject}/${base}`);
    continue;
  }
  const questions = new Map(chapter.units.flatMap((unit) => unit.questions.map((q) => [q.id, { q, unit }])));

  for (const [questionId, repair] of Object.entries(data?.repairs || {})) {
    if (!repair?.owner_natural_unit_id) fail(`${rel}:${questionId} missing owner_natural_unit_id`);
    if (!repair?.tested_node) fail(`${rel}:${questionId} missing tested_node`);
    if (!repair?.lecture_return) fail(`${rel}:${questionId} missing lecture_return`);
    if (!Object.prototype.hasOwnProperty.call(repair, 'precision_candidate')) {
      fail(`${rel}:${questionId} must make an explicit precision admission decision`);
    }

    const resolved = questions.get(questionId);
    if (!resolved) {
      const deferred = deferredFirstReady(chapter, questionId);
      if (!deferred) {
        fail(`${rel}:${questionId} is neither a rendered Current question nor an explicitly deferred first-ready question`);
        continue;
      }
      if (deferred.embedded_natural_unit_id !== repair.owner_natural_unit_id) {
        fail(`${rel}:${questionId} deferred owner ${deferred.embedded_natural_unit_id} disagrees with repair owner ${repair.owner_natural_unit_id}`);
      }
      if (!deferred.first_ready_natural_unit_id) {
        fail(`${rel}:${questionId} deferred repair is missing first_ready_natural_unit_id`);
      }
      continue;
    }

    if (!resolved.unit.representedNaturalUnitIds.includes(repair.owner_natural_unit_id)) {
      fail(`${rel}:${questionId} owner ${repair.owner_natural_unit_id} is outside rendered Current Unit ownership`);
    }
    if (!resolved.q.repair?.current_unit_hits?.length) fail(`${rel}:${questionId} has no current_unit_hits after enrichment`);
  }
}

if (!process.exitCode) {
  console.log('POLITICS_REPAIR_MEMORY_QA_PASS');
  console.log(JSON.stringify({ memorySidecars: memoryFiles.length, repairSidecars: repairFiles.length }));
}
