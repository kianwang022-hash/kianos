import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {
  resolvePoliticsChapterGeometry,
  resolvePoliticsUnitRepresentation
} from './politicsRepresentationGate.mjs';

// Read-only consumer of the accepted Projection selector manifest. It selects
// exact Current values; it never compiles new knowledge or changes unit identity.
const root = process.env.KIANOS_REPO_ROOT ? path.resolve(process.env.KIANOS_REPO_ROOT) : path.resolve(process.cwd(), '..');
const projectionRoot = 'content/politics/projection';
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const manifest = read(`${projectionRoot}/manifest.json`);
const cache = new Map();
const present = value => value != null && value !== '' && (!Array.isArray(value) || value.length > 0);

export function resolvePoliticsPresentationRef(ref, chapter, unit) {
  if (!ref) return null;
  if (!['unit', 'chapter'].includes(ref.scope) || typeof ref.field !== 'string') throw new Error('POLITICS_PROJECTION_INVALID_REF');
  let value = ref.scope === 'chapter' ? chapter : unit;
  for (const part of ref.field.split('.')) {
    if (['__proto__', 'prototype', 'constructor'].includes(part)) throw new Error('POLITICS_PROJECTION_UNSAFE_PATH');
    value = value && typeof value === 'object' ? value[part] : null;
  }
  if (ref.match) {
    if (!Array.isArray(value)) throw new Error('POLITICS_PROJECTION_MATCH_EXPECTS_ARRAY');
    value = value.filter(item => Object.entries(ref.match).every(([k, v]) => item?.[k] === v));
    if (value.length !== 1) throw new Error(`POLITICS_PROJECTION_MATCH_NOT_EXACT:${unit?.natural_unit_id}:${ref.field}`);
  }
  if (ref.ids) {
    if (!Array.isArray(value)) throw new Error('POLITICS_PROJECTION_IDS_EXPECT_ARRAY');
    value = ref.ids.map(id => {
      const matches = value.filter(item => item?.id === id);
      if (matches.length !== 1) throw new Error(`POLITICS_PROJECTION_ID_NOT_EXACT:${id}`);
      return matches[0];
    });
  }
  return present(value) ? value : null;
}

function resolvedShapeEntries(entries, resolve) {
  return (entries || [])
    .map(entry => ({
      shape: entry.shape,
      value: resolve(entry.content),
      representation: resolvePoliticsChapterGeometry(entry, { stage: 'ORIENT' })
    }))
    .filter(entry => entry.shape && present(entry.value));
}

function resolvedObjects(entries, resolve) {
  return (entries || [])
    .map(entry => ({ role: entry.role, value: resolve(entry.content) }))
    .filter(entry => entry.role && present(entry.value));
}

function resolvedHandoff(handoff, resolve) {
  if (!handoff) return null;
  const value = {
    surface: handoff.surface || null,
    sourceOwnerIds: Array.isArray(handoff.source_owner_ids) ? handoff.source_owner_ids.map(String).filter(Boolean) : [],
    sourceLocator: handoff.source_locator ? resolve(handoff.source_locator) : null,
    lookFor: (handoff.look_for || []).map(resolve).filter(present)
  };
  return value.surface || value.sourceOwnerIds.length || present(value.sourceLocator) || value.lookFor.length ? value : null;
}

export function loadPoliticsCompiledPresentation(subject, code) {
  const directory = subject === 'ethics_law' ? 'ethics-law' : subject;
  const file = `${directory}/${code}.projection.json`;
  if (!manifest.subjects[directory]?.files.includes(file)) return null;
  if (cache.has(file)) return cache.get(file);

  const projection = read(`${projectionRoot}/${file}`);
  const sourcePath = projection.source?.path;
  if (sourcePath !== `content/politics/learning/${directory}/${code}.json`) throw new Error('POLITICS_PROJECTION_SOURCE_PATH_MISMATCH');

  const bytes = fs.readFileSync(path.join(root, sourcePath));
  const sha = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (sha !== projection.source.blob_sha) throw new Error(`POLITICS_PROJECTION_SOURCE_REVISION_MISMATCH:${file}`);

  const source = JSON.parse(bytes.toString('utf8'));
  const rawUnits = source.units || source.unit_projections || (source.unit ? [source.unit] : []);
  const rawById = new Map(rawUnits.map(unit => [unit.natural_unit_id, unit]));
  const chapterResolve = ref => resolvePoliticsPresentationRef(ref, source, null);
  const chapterContextSource = projection.chapter_context || {};
  const chapterContext = {
    location: chapterResolve(chapterContextSource.location),
    problem: chapterResolve(chapterContextSource.current_problem),
    stage: resolvedShapeEntries(chapterContextSource.stage_context, chapterResolve),
    geometries: resolvedShapeEntries(chapterContextSource.chapter_geometries, chapterResolve)
  };

  const units = new Map();
  const referenceOnlyUnitIds = [];

  for (const selected of projection.units || []) {
    if (selected.projection_disposition === 'REFERENCE_ONLY') {
      referenceOnlyUnitIds.push(selected.unit_id);
      continue;
    }
    if (selected.projection_disposition !== 'PASS') continue;

    const rawUnit = rawById.get(selected.unit_id);
    if (!rawUnit) throw new Error(`POLITICS_PROJECTION_UNIT_MISSING:${selected.unit_id}`);
    const resolve = ref => resolvePoliticsPresentationRef(ref, source, rawUnit);

    units.set(selected.unit_id, {
      unitId: selected.unit_id,
      disposition: selected.projection_disposition,
      shape: selected.projection_shape,
      representation: resolvePoliticsUnitRepresentation(selected, { stage: 'ORIENT' }),
      externalRepresentation: resolvePoliticsUnitRepresentation(selected, { stage: 'EXTERNAL_LEARN' }),
      problem: resolve(selected.current_problem),
      primary: resolvedObjects(selected.primary_geometry, resolve),
      secondary: resolvedObjects(selected.secondary_reasoning, resolve),
      boundaries: (selected.boundaries || []).map(resolve).filter(present),
      exact: (selected.first_round_exact || []).map(resolve).filter(present),
      takeaway: (selected.takeaway || []).map(resolve).filter(present),
      next: resolve(selected.next_bridge),
      chengfengHandoff: resolvedHandoff(selected.chengfeng_handoff, resolve),
      optionalClosure: resolve(selected.optional_closure)
    });
  }

  // Keep the historical Map API (`compiled.get(unitId)`) so existing Runtime
  // remains stable while exposing complete Projection metadata to the next
  // workspace renderer. These properties are server-side read-only metadata.
  Object.defineProperties(units, {
    chapterContext: { value: chapterContext, enumerable: false },
    referenceOnlyUnitIds: { value: Object.freeze(referenceOnlyUnitIds), enumerable: false },
    meta: {
      value: Object.freeze({
        schema: projection.schema,
        status: projection.status,
        subject: projection.subject,
        chapterId: projection.chapter_id,
        file,
        sourcePath
      }),
      enumerable: false
    }
  });

  cache.set(file, units);
  return units;
}
