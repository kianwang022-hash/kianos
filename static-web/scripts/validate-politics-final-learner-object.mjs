import fs from 'node:fs';
import path from 'node:path';
import { loadPoliticsCompiledPresentation } from '../src/lib/politicsCompiledPresentation.mjs';

const root = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const manifest = read('content/politics/projection/manifest.json');
const failures = [];
const fail = (code, detail) => failures.push(`${code}:${detail}`);

const ALLOWED_ITEM_KEYS = new Set([
  'id', 'heading', 'lines', 'children', 'locator', 'lookFor', 'relationClaim', 'compare'
]);
const ALLOWED_GROUP_KEYS = new Set([
  'id', 'zone', 'primitive', 'title', 'items', 'transitions'
]);

let ownerCount = 0;
let finalCount = 0;

for (const [directory, subjectMeta] of Object.entries(manifest.subjects || {})) {
  const subject = directory === 'ethics-law' ? 'ethics_law' : directory;
  for (const file of subjectMeta.files || []) {
    const code = path.basename(file, '.projection.json');
    const compiled = loadPoliticsCompiledPresentation(subject, code);
    if (!(compiled instanceof Map)) {
      fail('COMPILED_CHAPTER_MISSING', `${subject}:${code}`);
      continue;
    }

    for (const row of compiled.values()) {
      ownerCount += 1;
      const finalObject = row.finalLearnerObject;
      if (!finalObject || finalObject.schema !== 'kianos.politics.final_learner_object.v1') {
        fail('FINAL_OBJECT_MISSING', row.unitId || `${subject}:${code}`);
        continue;
      }
      finalCount += 1;
      if (finalObject.unitId !== row.unitId) fail('FINAL_OBJECT_UNIT_MISMATCH', row.unitId);

      for (const [state, groups] of Object.entries(finalObject.states || {})) {
        if (!Array.isArray(groups)) {
          fail('FINAL_STATE_NOT_ARRAY', `${row.unitId}:${state}`);
          continue;
        }
        for (const group of groups) {
          for (const key of Object.keys(group || {})) {
            if (!ALLOWED_GROUP_KEYS.has(key)) fail('FINAL_GROUP_RAW_KEY', `${row.unitId}:${state}:${group?.id}:${key}`);
          }
          if (!Array.isArray(group.items)) fail('FINAL_GROUP_ITEMS_INVALID', `${row.unitId}:${group?.id}`);
          for (const item of group.items || []) {
            for (const key of Object.keys(item || {})) {
              if (!ALLOWED_ITEM_KEYS.has(key)) fail('FINAL_ITEM_RAW_KEY', `${row.unitId}:${group?.id}:${item?.id}:${key}`);
            }
            if (!Array.isArray(item.lines)) fail('FINAL_ITEM_LINES_INVALID', `${row.unitId}:${group?.id}:${item?.id}`);
            if (!Array.isArray(item.children)) fail('FINAL_ITEM_CHILDREN_INVALID', `${row.unitId}:${group?.id}:${item?.id}`);
            if (!Array.isArray(item.lookFor)) fail('FINAL_ITEM_LOOKFOR_INVALID', `${row.unitId}:${group?.id}:${item?.id}`);
          }
        }
      }
    }
  }
}

if (ownerCount !== 151) fail('FINAL_OBJECT_PASS_OWNER_ACCOUNTING', String(ownerCount));
if (finalCount !== ownerCount) fail('FINAL_OBJECT_COVERAGE_INCOMPLETE', `${finalCount}/${ownerCount}`);

const renderer = fs.readFileSync(path.join(root, 'static-web/src/components/PoliticsExplicitSurfacePlan.astro'), 'utf8');
for (const forbidden of ['learnerLines(', 'Object.entries(item', 'itemLabel(']) {
  if (renderer.includes(forbidden)) fail('RENDERER_SEMANTIC_ENUMERATION', forbidden);
}
const currentLoader = fs.readFileSync(path.join(root, 'static-web/src/lib/politicsCurrent.mjs'), 'utf8');
for (const forbidden of ['applyMaoProjection', 'applyXiProjection', 'applyEthicsProjection']) {
  if (currentLoader.includes(forbidden)) fail('SUBJECT_DISPLAY_ADAPTER_STILL_BOUND', forbidden);
}

console.log(JSON.stringify({
  schema: 'kianos.politics.final_learner_object_direct_consumption_audit.v1',
  owners: ownerCount,
  final_objects: finalCount,
  failures
}, null, 2));

if (failures.length) process.exitCode = 1;
