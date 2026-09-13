import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const projectionRoot = path.join(repoRoot, 'content/politics/projection');
const manifestPath = path.join(projectionRoot, 'manifest.json');

const failures = [];
const fail = (message) => failures.push(message);

function readJson(absPath, label = absPath) {
  try {
    return JSON.parse(fs.readFileSync(absPath, 'utf8'));
  } catch (error) {
    fail(`${label}: cannot read/parse JSON (${error.message})`);
    return null;
  }
}

function gitBlobSha(buffer) {
  return crypto
    .createHash('sha1')
    .update(`blob ${buffer.length}\0`)
    .update(buffer)
    .digest('hex');
}

function getByPath(object, fieldPath) {
  return String(fieldPath || '')
    .split('.')
    .filter(Boolean)
    .reduce((value, key) => (value == null ? undefined : value[key]), object);
}

function isOwnedValue(value) {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function unitCandidates(source) {
  const candidates = [];
  for (const key of ['units', 'unit_projections', 'natural_units']) {
    if (Array.isArray(source?.[key])) candidates.push(...source[key]);
  }
  if (source?.unit && typeof source.unit === 'object') candidates.push(source.unit);
  return candidates;
}

function findUnit(source, unitId) {
  const direct = unitCandidates(source).filter((item) => item?.natural_unit_id === unitId);
  if (direct.length === 1) return direct[0];
  if (direct.length > 1) {
    fail(`${source?.chapter_id || 'chapter'}/${unitId}: duplicate primary unit objects`);
    return direct[0];
  }
  return null;
}

function resolveRef(ref, source, unit, label) {
  const base = ref.scope === 'chapter' ? source : ref.scope === 'unit' ? unit : null;
  if (!base) {
    fail(`${label}: unsupported/unresolved scope ${JSON.stringify(ref.scope)}`);
    return;
  }

  const value = getByPath(base, ref.field);
  if (!isOwnedValue(value)) {
    fail(`${label}: Current does not own non-empty ${ref.scope}.${ref.field}`);
    return;
  }

  if (ref.match) {
    if (!Array.isArray(value)) {
      fail(`${label}: match selector requires array at ${ref.field}`);
      return;
    }
    const matches = value.filter((item) =>
      item && typeof item === 'object' &&
      Object.entries(ref.match).every(([key, expected]) => item[key] === expected)
    );
    if (matches.length !== 1) {
      fail(`${label}: selector ${JSON.stringify(ref.match)} matched ${matches.length} items at ${ref.field}`);
    }
  }

  if (ref.ids) {
    if (!Array.isArray(value)) {
      fail(`${label}: ids selector requires array at ${ref.field}`);
      return;
    }
    for (const id of ref.ids) {
      const matches = value.filter((item) => item && typeof item === 'object' && item.id === id);
      if (matches.length !== 1) {
        fail(`${label}: id ${id} matched ${matches.length} items at ${ref.field}`);
      }
    }
  }
}

function walkRefs(node, callback, pathLabel = 'projection') {
  if (Array.isArray(node)) {
    node.forEach((item, index) => walkRefs(item, callback, `${pathLabel}[${index}]`));
    return;
  }
  if (!node || typeof node !== 'object') return;

  if (typeof node.scope === 'string' && typeof node.field === 'string') {
    callback(node, pathLabel);
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    walkRefs(value, callback, `${pathLabel}.${key}`);
  }
}

function sameArray(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => value === b[index]);
}

function sameMembers(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  const aSet = new Set(a);
  const bSet = new Set(b);
  if (aSet.size !== a.length || bSet.size !== b.length || aSet.size !== bSet.size) return false;
  return [...aSet].every((value) => bSet.has(value));
}

function assertReferenceOnly(unit, label) {
  if (unit.current_problem !== null) fail(`${label}: REFERENCE_ONLY current_problem must be null`);
  for (const key of ['primary_geometry', 'secondary_reasoning', 'boundaries', 'first_round_exact', 'takeaway']) {
    if (!Array.isArray(unit[key]) || unit[key].length !== 0) fail(`${label}: REFERENCE_ONLY ${key} must be []`);
  }
  if (unit.next_bridge !== null) fail(`${label}: REFERENCE_ONLY next_bridge must be null`);
  if (unit.optional_closure !== null) fail(`${label}: REFERENCE_ONLY optional_closure must be null`);
  if (unit.chengfeng_handoff?.source_locator !== null) fail(`${label}: REFERENCE_ONLY source_locator must be null`);
  if (!Array.isArray(unit.chengfeng_handoff?.look_for) || unit.chengfeng_handoff.look_for.length !== 0) {
    fail(`${label}: REFERENCE_ONLY Chengfeng look_for must be []`);
  }
  if (!unit.parent_projection_unit_id) fail(`${label}: REFERENCE_ONLY requires parent_projection_unit_id`);
}

const manifest = readJson(manifestPath, 'projection manifest');
if (!manifest) process.exit(1);

if (manifest.schema !== 'kianos.politics.cognitive_projection.manifest.v1') fail(`manifest schema ${manifest.schema}`);
if (manifest.status !== 'DERIVED_CURRENT') fail(`manifest status ${manifest.status}`);
if (manifest.content_authority !== 'content/politics/learning/**/ch*.json') fail('manifest content_authority changed');
if (manifest.binding_semantics?.handoff_policy !== 'Chengfeng continuous learning remains IPAD_MARGINNOTE; Projection stores owner ids/locator only') {
  fail('manifest Chengfeng handoff policy changed');
}

const allowedDispositions = new Set(['PASS', 'REFERENCE_ONLY', 'BLOCKED']);
const report = {};
let totalChapters = 0;
let totalUnits = 0;
let totalPass = 0;
let totalReferenceOnly = 0;
let totalBlocked = 0;

for (const [subjectKey, subjectMeta] of Object.entries(manifest.subjects || {})) {
  const sourceDir = path.join(repoRoot, 'content/politics/learning', subjectKey);
  const currentChapterFiles = fs.existsSync(sourceDir)
    ? fs.readdirSync(sourceDir).filter((name) => /^ch\d+\.json$/.test(name)).sort()
    : [];

  if (!Array.isArray(subjectMeta.files)) {
    fail(`${subjectKey}: manifest files missing`);
    continue;
  }
  if (subjectMeta.chapters !== subjectMeta.files.length) {
    fail(`${subjectKey}: manifest chapters ${subjectMeta.chapters} != files ${subjectMeta.files.length}`);
  }
  if (subjectMeta.chapters !== currentChapterFiles.length) {
    fail(`${subjectKey}: manifest chapters ${subjectMeta.chapters} != Current chapter files ${currentChapterFiles.length}`);
  }

  const projectionSourcePaths = [];
  const seenUnitIds = new Set();
  let pass = 0;
  let referenceOnly = 0;
  let blocked = 0;
  let units = 0;

  for (const relativeProjectionPath of subjectMeta.files) {
    const projectionPath = path.join(projectionRoot, relativeProjectionPath);
    const projection = readJson(projectionPath, relativeProjectionPath);
    if (!projection) continue;

    if (projection.schema !== 'kianos.politics.cognitive_projection.chapter.v1') fail(`${relativeProjectionPath}: schema ${projection.schema}`);
    if (projection.status !== 'DERIVED_CURRENT') fail(`${relativeProjectionPath}: status ${projection.status}`);
    if (projection.source?.semantic_authority !== 'CURRENT_CONTENT') fail(`${relativeProjectionPath}: semantic_authority must be CURRENT_CONTENT`);

    const sourceRel = projection.source?.path;
    if (!sourceRel || !sourceRel.startsWith(`content/politics/learning/${subjectKey}/`)) {
      fail(`${relativeProjectionPath}: invalid source.path ${JSON.stringify(sourceRel)}`);
      continue;
    }
    projectionSourcePaths.push(sourceRel);

    const sourceAbs = path.join(repoRoot, sourceRel);
    if (!fs.existsSync(sourceAbs)) {
      fail(`${relativeProjectionPath}: source missing ${sourceRel}`);
      continue;
    }

    const sourceBuffer = fs.readFileSync(sourceAbs);
    const actualBlob = gitBlobSha(sourceBuffer);
    if (projection.source?.blob_sha !== actualBlob) {
      fail(`${relativeProjectionPath}: stale source blob ${projection.source?.blob_sha} != ${actualBlob}`);
    }

    const source = readJson(sourceAbs, sourceRel);
    if (!source) continue;
    if (projection.chapter_id !== source.chapter_id) {
      fail(`${relativeProjectionPath}: chapter_id ${projection.chapter_id} != Current ${source.chapter_id}`);
    }

    const currentUnitIds = source.source_bindings?.natural_unit_ids;
    if (!Array.isArray(currentUnitIds)) {
      fail(`${relativeProjectionPath}: Current source_bindings.natural_unit_ids missing`);
      continue;
    }
    const projectedUnitIds = Array.isArray(projection.units) ? projection.units.map((unit) => unit.unit_id) : [];
    if (!sameMembers(projectedUnitIds, currentUnitIds)) {
      fail(`${relativeProjectionPath}: projected Natural Unit owner set differs from Current source_bindings`);
    }

    walkRefs(projection.chapter_context, (ref, label) => resolveRef(ref, source, null, `${relativeProjectionPath}:${label}`), 'chapter_context');

    for (const projectedUnit of projection.units || []) {
      units += 1;
      const unitLabel = `${relativeProjectionPath}/${projectedUnit.unit_id}`;
      if (seenUnitIds.has(projectedUnit.unit_id)) fail(`${subjectKey}: duplicate projected unit ${projectedUnit.unit_id}`);
      seenUnitIds.add(projectedUnit.unit_id);

      if (!allowedDispositions.has(projectedUnit.projection_disposition)) {
        fail(`${unitLabel}: unknown disposition ${projectedUnit.projection_disposition}`);
      }
      if (!projectedUnit.projection_shape) fail(`${unitLabel}: projection_shape missing`);
      if (projectedUnit.chengfeng_handoff?.surface !== 'IPAD_MARGINNOTE') {
        fail(`${unitLabel}: Chengfeng surface must be IPAD_MARGINNOTE`);
      }

      if (projectedUnit.projection_disposition === 'PASS') pass += 1;
      if (projectedUnit.projection_disposition === 'REFERENCE_ONLY') {
        referenceOnly += 1;
        assertReferenceOnly(projectedUnit, unitLabel);
      }
      if (projectedUnit.projection_disposition === 'BLOCKED') blocked += 1;

      for (const exactRef of projectedUnit.first_round_exact || []) {
        if (!exactRef || typeof exactRef !== 'object' || typeof exactRef.scope !== 'string' || typeof exactRef.field !== 'string') {
          fail(`${unitLabel}: first_round_exact must contain Current references only`);
        }
      }

      const currentUnit = findUnit(source, projectedUnit.unit_id);
      walkRefs(projectedUnit, (ref, label) => resolveRef(ref, source, currentUnit, `${unitLabel}:${label}`), 'unit');
    }
  }

  const currentSourcePaths = currentChapterFiles.map((name) => `content/politics/learning/${subjectKey}/${name}`).sort();
  if (!sameArray([...projectionSourcePaths].sort(), currentSourcePaths)) {
    fail(`${subjectKey}: projection source chapter set differs from Current chapter set`);
  }

  if (subjectMeta.natural_units_accounted !== units) fail(`${subjectKey}: manifest units ${subjectMeta.natural_units_accounted} != ${units}`);
  if (subjectMeta.pass !== pass) fail(`${subjectKey}: manifest PASS ${subjectMeta.pass} != ${pass}`);
  if (subjectMeta.reference_only !== referenceOnly) fail(`${subjectKey}: manifest REFERENCE_ONLY ${subjectMeta.reference_only} != ${referenceOnly}`);
  if (subjectMeta.blocked !== blocked) fail(`${subjectKey}: manifest BLOCKED ${subjectMeta.blocked} != ${blocked}`);
  if (blocked !== 0) fail(`${subjectKey}: compiled Current contains ${blocked} BLOCKED units`);

  report[subjectKey] = { chapters: subjectMeta.files.length, units, pass, reference_only: referenceOnly, blocked };
  totalChapters += subjectMeta.files.length;
  totalUnits += units;
  totalPass += pass;
  totalReferenceOnly += referenceOnly;
  totalBlocked += blocked;
}

if (failures.length) {
  console.error('POLITICS_COGNITIVE_PROJECTION_ASSETS_FAIL');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log('POLITICS_COGNITIVE_PROJECTION_ASSETS_PASS');
console.log(JSON.stringify({
  subjects: report,
  total: {
    chapters: totalChapters,
    natural_units_accounted: totalUnits,
    pass: totalPass,
    reference_only: totalReferenceOnly,
    blocked: totalBlocked,
  },
}, null, 2));
