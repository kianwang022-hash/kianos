import fs from 'node:fs';
import path from 'node:path';

const root = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const manifest = read('content/politics/projection/manifest.json');

const ALLOWED_STATES = new Set(['ORIENT', 'EXTERNAL_LEARN', 'CLOSE', 'VERIFY_POST', 'REPAIR', 'CONTINUE']);
const ALLOWED_ZONES = new Set(['PRIMARY', 'COMPANION', 'SUPPORT', 'HANDOFF', 'CLOSURE', 'REPAIR_ONLY']);
const ALLOWED_PRIMITIVES = new Set(['STATEMENT', 'PARALLEL_SET', 'DIRECTED_SEQUENCE', 'COMPARE', 'HIERARCHY', 'TIMELINE']);

const rows = [];
const errors = [];
let chapterCount = 0;
let ownerCount = 0;
let passCount = 0;
let referenceOnlyCount = 0;
let blockedCount = 0;
let mappedPassCount = 0;

function fail(code, detail) {
  errors.push(`${code}:${detail}`);
}

function validateMapping(unit, file) {
  const mapping = unit.surface_mapping;
  if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
    fail('MISSING_SURFACE_MAPPING', `${file}:${unit.unit_id}`);
    return false;
  }

  let groupCount = 0;
  for (const [state, groups] of Object.entries(mapping)) {
    if (!ALLOWED_STATES.has(state)) fail('INVALID_STATE', `${file}:${unit.unit_id}:${state}`);
    if (!Array.isArray(groups)) {
      fail('STATE_GROUPS_NOT_ARRAY', `${file}:${unit.unit_id}:${state}`);
      continue;
    }
    for (const [index, group] of groups.entries()) {
      groupCount += 1;
      const prefix = `${file}:${unit.unit_id}:${state}[${index}]`;
      if (!group || typeof group !== 'object' || Array.isArray(group)) {
        fail('GROUP_NOT_OBJECT', prefix);
        continue;
      }
      if (!ALLOWED_ZONES.has(group.zone)) fail('INVALID_ZONE', `${prefix}:${group.zone}`);
      if (!ALLOWED_PRIMITIVES.has(group.primitive)) fail('INVALID_PRIMITIVE', `${prefix}:${group.primitive}`);
      if (['DIRECTED_SEQUENCE', 'TIMELINE', 'HIERARCHY'].includes(group.primitive)) {
        const transitions = Array.isArray(group.transitions) ? group.transitions : [];
        if (group.primitive === 'DIRECTED_SEQUENCE' && transitions.length === 0) {
          fail('DIRECTED_SEQUENCE_WITHOUT_TRANSITIONS', prefix);
        }
      }
      if (group.primitive === 'PARALLEL_SET' && Array.isArray(group.transitions) && group.transitions.length) {
        fail('PARALLEL_SET_HAS_TRANSITIONS', prefix);
      }
    }
  }

  if (!Array.isArray(mapping.ORIENT) || mapping.ORIENT.length === 0) {
    fail('ORIENT_MAPPING_MISSING', `${file}:${unit.unit_id}`);
  }
  return groupCount > 0;
}

for (const subject of Object.values(manifest.subjects || {})) {
  for (const file of subject.files || []) {
    chapterCount += 1;
    const projection = read(`content/politics/projection/${file}`);
    for (const unit of projection.units || []) {
      ownerCount += 1;
      const disposition = unit.projection_disposition || 'UNKNOWN';
      if (disposition === 'PASS') passCount += 1;
      else if (disposition === 'REFERENCE_ONLY') referenceOnlyCount += 1;
      else if (disposition === 'BLOCKED') blockedCount += 1;

      let mapped = false;
      if (disposition === 'PASS') mapped = validateMapping(unit, file);
      if (mapped) mappedPassCount += 1;
      if (disposition === 'REFERENCE_ONLY' && unit.surface_mapping) {
        fail('REFERENCE_ONLY_HAS_TEACHING_MAPPING', `${file}:${unit.unit_id}`);
      }

      rows.push({ file, unit_id: unit.unit_id, disposition, mapped });
    }
  }
}

const report = {
  schema: 'kianos.politics.explicit_surface_mapping_audit.v1',
  chapters: chapterCount,
  owners: ownerCount,
  pass: passCount,
  reference_only: referenceOnlyCount,
  blocked: blockedCount,
  mapped_pass: mappedPassCount,
  unmapped_pass: passCount - mappedPassCount,
  errors,
  rows
};

console.log(JSON.stringify(report, null, 2));

if (chapterCount !== 53) fail('CHAPTER_ACCOUNTING_MISMATCH', `${chapterCount}`);
if (ownerCount !== 160) fail('OWNER_ACCOUNTING_MISMATCH', `${ownerCount}`);
if (passCount !== 151) fail('PASS_ACCOUNTING_MISMATCH', `${passCount}`);
if (referenceOnlyCount !== 9) fail('REFERENCE_ONLY_ACCOUNTING_MISMATCH', `${referenceOnlyCount}`);
if (blockedCount !== 0) fail('BLOCKED_ACCOUNTING_MISMATCH', `${blockedCount}`);

if (errors.length) process.exitCode = 1;
