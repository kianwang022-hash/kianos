import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { resolvePoliticsUnitRepresentation } from './politicsRepresentationGate.mjs';

// Read-only consumer of the accepted Projection selector manifest. It selects
// exact Current values; it never compiles new knowledge or changes unit identity.
const root = process.env.KIANOS_REPO_ROOT ? path.resolve(process.env.KIANOS_REPO_ROOT) : path.resolve(process.cwd(), '..');
const projectionRoot = 'content/politics/projection';
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const manifest = read(`${projectionRoot}/manifest.json`);
const cache = new Map();
const present = value => value != null && value !== '' && (!Array.isArray(value) || value.length > 0);
const flattenPresent = values => values.flatMap(value => Array.isArray(value) ? value : [value]).filter(present);

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
  const units = new Map();
  for (const selected of projection.units || []) {
    if (selected.projection_disposition !== 'PASS') continue;
    const rawUnit = rawById.get(selected.unit_id);
    if (!rawUnit) throw new Error(`POLITICS_PROJECTION_UNIT_MISSING:${selected.unit_id}`);
    const resolve = ref => resolvePoliticsPresentationRef(ref, source, rawUnit);
    const objects = entries => (entries || []).map(entry => ({ role: entry.role, value: resolve(entry.content) })).filter(entry => present(entry.value));
    const selectedValues = entries => flattenPresent((entries || []).map(resolve));
    const handoff = selected.chengfeng_handoff || null;
    units.set(selected.unit_id, {
      unitId: selected.unit_id,
      shape: selected.projection_shape,
      representation: resolvePoliticsUnitRepresentation(selected, { stage: 'ORIENT' }),
      purposeFirst: true,
      // Compatibility marker for the already accepted C01 browser slice. It is
      // no longer the rollout gate; all PASS units now use purpose-first.
      purposeFirstPilot: directory === 'marxism' && code === 'ch01',
      problem: resolve(selected.current_problem),
      primary: objects(selected.primary_geometry),
      secondary: objects(selected.secondary_reasoning),
      boundaries: selectedValues(selected.boundaries),
      exact: selectedValues(selected.first_round_exact),
      takeaway: selectedValues(selected.takeaway),
      next: resolve(selected.next_bridge),
      handoff: handoff ? {
        surface: handoff.surface || null,
        sourceOwnerIds: Array.isArray(handoff.source_owner_ids) ? handoff.source_owner_ids : [],
        locator: resolve(handoff.source_locator),
        lookFor: selectedValues(handoff.look_for)
      } : null,
      closure: resolve(selected.optional_closure)
    });
  }
  cache.set(file, units);
  return units;
}
