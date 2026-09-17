import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), '..');
const politicsRoot = path.join(repoRoot, 'content/politics/learning');

const ALLOWED_STATUS = new Set(['CURRENT_CALIBRATION', 'CURRENT']);
const ALLOWED_DISPOSITIONS = new Set([
  'ABSORBED',
  'DUPLICATE',
  'CROSS_UNIT',
  'REPAIR_ONLY',
  'REFERENCE_ONLY',
  'REJECTED',
  'UNSUPPORTED',
  'REJECTED / UNSUPPORTED'
]);
const ALLOWED_PRECISION_PRIORITY = new Set([
  'PRECISION_NOT_ORIENTATION',
  'REFERENCE_OR_QUESTION_TRIGGERED',
  'FIRST_ROUND_EXACT',
  'REPAIR_ONLY',
  'LATER_PRECISION'
]);
const UI_ONLY_KEYS = new Set([
  'component', 'component_name', 'classname', 'class_name', 'css', 'style',
  'layout', 'columns', 'column_width', 'pixel_width', 'color', 'font_size'
]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function chapterFiles(root) {
  const out = [];
  for (const subject of fs.readdirSync(root, { withFileTypes: true })) {
    if (!subject.isDirectory()) continue;
    const dir = path.join(root, subject.name);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && /^ch\d+\.json$/i.test(entry.name)) out.push(path.join(dir, entry.name));
    }
  }
  return out.sort();
}

function units(raw) {
  if (Array.isArray(raw?.unit_projections)) return raw.unit_projections;
  if (Array.isArray(raw?.units)) return raw.units;
  if (raw?.unit && typeof raw.unit === 'object') return [raw.unit];
  return [];
}

function fail(errors, label, message) {
  errors.push(`${label}: ${message}`);
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function collectEvidence(value, bag = new Set(), seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return bag;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) collectEvidence(item, bag, seen);
    return bag;
  }
  if (Array.isArray(value.source_evidence)) {
    for (const id of value.source_evidence) if (nonEmptyString(id)) bag.add(id.trim());
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === 'suyi_dispositions') continue;
    collectEvidence(child, bag, seen);
  }
  return bag;
}

function checkNoUiImplementation(value, errors, label, trail = []) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => checkNoUiImplementation(item, errors, label, [...trail, String(index)]));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (UI_ONLY_KEYS.has(String(key).toLowerCase())) {
      fail(errors, label, `Content-stage learning_semantics contains UI-only key ${[...trail, key].join('.')}`);
    }
    checkNoUiImplementation(child, errors, label, [...trail, key]);
  }
}

function validateFramework(map, errors, label) {
  if (!map || typeof map !== 'object' || Array.isArray(map)) {
    fail(errors, label, 'framework_maps entries must be objects');
    return;
  }
  if (!nonEmptyString(map.id)) fail(errors, label, 'framework map id missing');
  if (!nonEmptyString(map.title)) fail(errors, label, 'framework map title missing');
  const nodes = list(map.nodes);
  if (nodes.length < 2) fail(errors, label, `${map.id || 'framework map'} requires at least 2 nodes`);
  const nodeIds = new Set();
  for (const node of nodes) {
    if (!nonEmptyString(node?.id)) {
      fail(errors, label, `${map.id || 'framework map'} node id missing`);
      continue;
    }
    if (nodeIds.has(node.id)) fail(errors, label, `duplicate framework node id ${node.id} in ${map.id || 'framework map'}`);
    nodeIds.add(node.id);
    if (!nonEmptyString(node?.label)) fail(errors, label, `framework node ${node.id} label missing`);
    if (!nonEmptyString(node?.meaning)) fail(errors, label, `framework node ${node.id} meaning missing`);
    if (!list(node?.source_evidence).length) fail(errors, label, `framework node ${node.id} source_evidence missing`);
  }
  const edges = list(map.edges);
  for (const edge of edges) {
    if (!nodeIds.has(edge?.from)) fail(errors, label, `framework edge from unknown node ${edge?.from || '<missing>'} in ${map.id || 'framework map'}`);
    if (!nodeIds.has(edge?.to)) fail(errors, label, `framework edge to unknown node ${edge?.to || '<missing>'} in ${map.id || 'framework map'}`);
    if (!nonEmptyString(edge?.relation)) fail(errors, label, `framework edge ${edge?.from || '?'}→${edge?.to || '?'} relation missing`);
  }

  if (Object.prototype.hasOwnProperty.call(map, 'collective_relations') && !Array.isArray(map.collective_relations)) {
    fail(errors, label, `${map.id || 'framework map'} collective_relations must be an array`);
  }

  const collectiveIds = new Set();
  for (const relation of list(map.collective_relations)) {
    const relationId = relation?.id;
    if (!nonEmptyString(relationId)) {
      fail(errors, label, `${map.id || 'framework map'} collective relation id missing`);
      continue;
    }
    if (collectiveIds.has(relationId)) fail(errors, label, `duplicate collective relation id ${relationId} in ${map.id || 'framework map'}`);
    collectiveIds.add(relationId);

    const members = list(relation?.member_ids);
    if (members.length < 2) fail(errors, label, `${relationId} requires at least 2 member_ids`);
    if (new Set(members).size !== members.length) fail(errors, label, `${relationId} member_ids must be unique`);
    for (const memberId of members) {
      if (!nodeIds.has(memberId)) fail(errors, label, `${relationId} member_id ${memberId || '<missing>'} is not a framework node`);
    }

    if (!nonEmptyString(relation?.target_id) || !nodeIds.has(relation.target_id)) {
      fail(errors, label, `${relationId} target_id must reference a framework node`);
    }
    if (members.includes(relation?.target_id)) fail(errors, label, `${relationId} target_id cannot also be a member`);
    if (!nonEmptyString(relation?.relation)) fail(errors, label, `${relationId} relation missing`);
    if (!nonEmptyString(relation?.text)) fail(errors, label, `${relationId} learner-readable text missing`);
    if (!list(relation?.source_evidence).length) fail(errors, label, `${relationId} source_evidence missing`);

    // Once Content explicitly owns a collective relation, keeping per-member
    // binary edges to the same target would reintroduce the forbidden atomization.
    for (const edge of edges) {
      if (members.includes(edge?.from) && edge?.to === relation?.target_id) {
        fail(errors, label, `${relationId} is atomized again as binary edge ${edge.from}→${edge.to}`);
      }
    }
  }
}

function validateFrameworks(semantics, errors, label) {
  if (Object.prototype.hasOwnProperty.call(semantics, 'framework_map')) {
    fail(errors, label, 'legacy singular framework_map is not allowed; use framework_maps[]');
  }
  const maps = list(semantics?.framework_maps);
  const ids = new Set();
  for (const map of maps) {
    validateFramework(map, errors, label);
    if (nonEmptyString(map?.id)) {
      if (ids.has(map.id)) fail(errors, label, `duplicate framework map id ${map.id}`);
      ids.add(map.id);
    }
  }
}

function validateChains(chains, errors, label) {
  for (const chain of list(chains)) {
    if (!nonEmptyString(chain?.id)) fail(errors, label, 'relation_chain.id missing');
    const steps = list(chain?.steps);
    if (steps.length < 2) fail(errors, label, `${chain?.id || 'relation_chain'} requires at least 2 steps`);
    for (const step of steps) {
      if (!nonEmptyString(step?.id) || !nonEmptyString(step?.text)) {
        fail(errors, label, `${chain?.id || 'relation_chain'} step requires id + text`);
      }
    }
    if (!list(chain?.source_evidence).length) fail(errors, label, `${chain?.id || 'relation_chain'} source_evidence missing`);
  }
}

function validateBoundaries(boundaries, errors, label) {
  for (const boundary of list(boundaries)) {
    if (!nonEmptyString(boundary?.id)) fail(errors, label, 'boundary.id missing');
    if (!nonEmptyString(boundary?.left) || !nonEmptyString(boundary?.right) || !nonEmptyString(boundary?.distinction)) {
      fail(errors, label, `${boundary?.id || 'boundary'} requires left + right + distinction`);
    }
    if (!list(boundary?.source_evidence).length) fail(errors, label, `${boundary?.id || 'boundary'} source_evidence missing`);
  }
}

function validateSemantics(semantics, errors, label) {
  if (semantics?.schema !== 'kianos.politics.learning_semantics.v1') {
    fail(errors, label, `unexpected schema ${semantics?.schema || '<missing>'}`);
  }
  if (!ALLOWED_STATUS.has(semantics?.status)) fail(errors, label, `invalid status ${semantics?.status || '<missing>'}`);
  if (semantics?.content_stage_only !== true) fail(errors, label, 'content_stage_only must be true during Content phase');

  if (!nonEmptyString(semantics?.problem?.id) || !nonEmptyString(semantics?.problem?.text)) {
    fail(errors, label, 'problem requires id + text');
  }
  if (!list(semantics?.problem?.source_evidence).length) fail(errors, label, 'problem.source_evidence missing');

  validateFrameworks(semantics, errors, label);
  validateChains(semantics?.relation_chains, errors, label);
  validateBoundaries(semantics?.boundaries, errors, label);

  for (const anchor of list(semantics?.anchors)) {
    if (!nonEmptyString(anchor?.id) || !nonEmptyString(anchor?.text)) fail(errors, label, 'anchor requires id + text');
  }

  for (const exact of list(semantics?.precision_objects)) {
    if (!nonEmptyString(exact?.id) || !nonEmptyString(exact?.fact)) fail(errors, label, 'precision_object requires id + fact');
    if (!ALLOWED_PRECISION_PRIORITY.has(exact?.learning_priority)) {
      fail(errors, label, `${exact?.id || 'precision_object'} invalid learning_priority ${exact?.learning_priority || '<missing>'}`);
    }
    if (!list(exact?.source_evidence).length) fail(errors, label, `${exact?.id || 'precision_object'} source_evidence missing`);
  }

  const handoff = semantics?.source_handoff;
  if (!handoff || handoff?.target_surface !== 'IPAD_MARGINNOTE_ORIGINAL_CHENGFENG') {
    fail(errors, label, 'source_handoff must target IPAD_MARGINNOTE_ORIGINAL_CHENGFENG');
  }
  if (!nonEmptyString(handoff?.locator) || !list(handoff?.source_owner_ids).length || !list(handoff?.look_for).length) {
    fail(errors, label, 'source_handoff requires locator + source_owner_ids + look_for');
  }

  const recall = semantics?.recall_seed;
  if (!recall || !nonEmptyString(recall?.id) || !nonEmptyString(recall?.prompt) || !list(recall?.expected_relations).length) {
    fail(errors, label, 'recall_seed requires id + prompt + expected_relations');
  }

  const dispositions = list(semantics?.suyi_dispositions);
  const dispositionById = new Map();
  for (const row of dispositions) {
    if (!nonEmptyString(row?.source_id) || !String(row.source_id).startsWith('POL27-SY-')) {
      fail(errors, label, `invalid Suyi disposition source_id ${row?.source_id || '<missing>'}`);
      continue;
    }
    if (dispositionById.has(row.source_id)) fail(errors, label, `duplicate Suyi disposition ${row.source_id}`);
    dispositionById.set(row.source_id, row);
    if (!ALLOWED_DISPOSITIONS.has(row?.disposition)) {
      fail(errors, label, `${row.source_id} invalid disposition ${row?.disposition || '<missing>'}`);
    }
    if (!nonEmptyString(row?.reason)) fail(errors, label, `${row.source_id} disposition reason missing`);
  }

  const evidence = collectEvidence(semantics);
  const suyiEvidence = [...evidence].filter((id) => id.startsWith('POL27-SY-'));
  for (const id of suyiEvidence) {
    if (!dispositionById.has(id)) fail(errors, label, `Suyi evidence ${id} has no explicit disposition`);
  }
  for (const [id, row] of dispositionById) {
    if (row.disposition === 'ABSORBED' && !evidence.has(id)) {
      fail(errors, label, `ABSORBED Suyi source ${id} is not actually referenced by a semantic object`);
    }
  }

  if (!nonEmptyString(semantics?.audit)) fail(errors, label, 'audit path missing');
  checkNoUiImplementation(semantics, errors, label);
}

const files = chapterFiles(politicsRoot);
const errors = [];
let semanticUnitCount = 0;
let calibrationCount = 0;

for (const file of files) {
  const raw = readJson(file);
  const relative = path.relative(repoRoot, file);
  for (const unit of units(raw)) {
    const semantics = unit?.learning_semantics;
    if (!semantics) continue;
    semanticUnitCount += 1;
    if (semantics.status === 'CURRENT_CALIBRATION') calibrationCount += 1;
    const label = `${relative}:${unit?.natural_unit_id || unit?.unit_id || '<unknown-unit>'}`;
    validateSemantics(semantics, errors, label);
  }
}

if (semanticUnitCount === 0) errors.push('No Politics learning_semantics calibration unit found.');

if (errors.length) {
  console.error(`POLITICS_LEARNING_SEMANTICS_AUDIT_FAIL (${errors.length})`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('POLITICS_LEARNING_SEMANTICS_AUDIT_PASS');
console.log(JSON.stringify({ semanticUnits: semanticUnitCount, calibrations: calibrationCount }, null, 2));
