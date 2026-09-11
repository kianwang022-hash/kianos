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

const sourceIds = sourceNodeIds();
const memoryFiles = jsonFiles('.memory.json');
const repairFiles = jsonFiles('.repair.json');

for (const file of memoryFiles) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rel = path.relative(repoRoot, file);
  if (data?.schema !== 'kianos.politics.memory_projection.v1') fail(`${rel} invalid schema`);
  if (data?.policy !== 'SOURCE_GROUNDED_SELECTIVE') fail(`${rel} must use SOURCE_GROUNDED_SELECTIVE`);
  if (data?.admission_gate?.requires_source_grounding !== true) fail(`${rel} must require source grounding`);

  for (const [unitId, unit] of Object.entries(data?.units || {})) {
    const candidates = Array.isArray(unit?.candidates) ? unit.candidates : [];
    if (!candidates.length) fail(`${rel}:${unitId} has no candidates`);
    for (const candidate of candidates) {
      const refs = Array.isArray(candidate?.source_refs) ? candidate.source_refs.filter(Boolean) : [];
      if (!refs.length) fail(`${rel}:${candidate?.id || unitId} has no source_refs`);
      for (const ref of refs) {
        if (!sourceIds.has(ref)) fail(`${rel}:${candidate?.id || unitId} unresolved source_ref ${ref}`);
      }
      if (candidate?.admission !== 'CANDIDATE_ONLY') {
        fail(`${rel}:${candidate?.id || unitId} shared Current may define a candidate, not private learner review debt`);
      }
      if (!candidate?.handbook_alignment) fail(`${rel}:${candidate?.id || unitId} missing handbook_alignment`);
    }
  }
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
    const resolved = questions.get(questionId);
    if (!resolved) {
      fail(`${rel}:${questionId} is not a resolved Current chapter question`);
      continue;
    }
    if (!repair?.owner_natural_unit_id) fail(`${rel}:${questionId} missing owner_natural_unit_id`);
    if (!resolved.unit.representedNaturalUnitIds.includes(repair.owner_natural_unit_id)) {
      fail(`${rel}:${questionId} owner ${repair.owner_natural_unit_id} is outside rendered Current Unit ownership`);
    }
    if (!resolved.q.repair?.current_unit_hits?.length) fail(`${rel}:${questionId} has no current_unit_hits after enrichment`);
    if (!repair?.tested_node) fail(`${rel}:${questionId} missing tested_node`);
    if (!repair?.lecture_return) fail(`${rel}:${questionId} missing lecture_return`);
    if (!Object.prototype.hasOwnProperty.call(repair, 'precision_candidate')) {
      fail(`${rel}:${questionId} must make an explicit precision admission decision`);
    }
  }
}

if (!process.exitCode) {
  console.log('POLITICS_REPAIR_MEMORY_QA_PASS');
  console.log(JSON.stringify({ memorySidecars: memoryFiles.length, repairSidecars: repairFiles.length }));
}
