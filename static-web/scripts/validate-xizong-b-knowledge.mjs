import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const rel = (...parts) => path.join(repoRoot, ...parts);
const systemDir = rel('content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor');
const systemPath = path.join(systemDir, 'system.json');
const system = JSON.parse(fs.readFileSync(systemPath, 'utf8'));

function assert(condition, code, detail = '') {
  if (!condition) throw new Error(`${code}${detail ? `:${detail}` : ''}`);
}

function fm(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*([^\\n]+)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

function inferOrder(text, filename) {
  const order = fm(text, 'order');
  if (order && /^[DMG]\d{1,2}$/i.test(order)) return order.toUpperCase();
  const blockId = fm(text, 'block_id');
  if (blockId) {
    const direct = blockId.match(/^([DMG])(\d{1,2})$/i);
    if (direct) return `${direct[1].toUpperCase()}${Number(direct[2])}`;
    const normalized = blockId.match(/(?:^|-)([dmg])(\d{1,2})$/i);
    if (normalized) return `${normalized[1].toUpperCase()}${Number(normalized[2])}`;
  }
  const fromName = filename.match(/(?:^|_)([DMG])(\d{1,2})(?:_|\b)/i);
  return fromName ? `${fromName[1].toUpperCase()}${Number(fromName[2])}` : null;
}

const groups = [
  ['d-d1-d23', 'D', 23],
  ['m-m1-m10', 'M', 10],
  ['g-g1-g5', 'G', 5],
];
const expectedOrders = groups.flatMap(([, prefix, count]) => Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`));
const records = [];
const markerIds = [];

for (const [dir] of groups) {
  for (const filename of fs.readdirSync(path.join(systemDir, dir)).filter((name) => name.endsWith('.md')).sort()) {
    const full = path.join(systemDir, dir, filename);
    const text = fs.readFileSync(full, 'utf8');
    const order = inferOrder(text, filename);
    const headings = [...text.matchAll(/^##\s+KP(\d+)[｜|]/gm)].map((match) => Number(match[1]));
    const markers = [...text.matchAll(/<!--\s*kianos:kp\s+id="([^"]+)"\s*-->/g)].map((match) => match[1]);
    markerIds.push(...markers);
    records.push({ order, headings, markers, file: path.relative(repoRoot, full).split(path.sep).join('/') });
  }
}
records.sort((a, b) => expectedOrders.indexOf(a.order) - expectedOrders.indexOf(b.order));

assert(system.schema === 'kianos.xizong.system.v1', 'B_K_SCHEMA_INVALID');
assert(['FREEZE_CANDIDATE', 'CURRENT'].includes(system.status), 'B_K_STATUS_INVALID', system.status);
assert(String(system.semantic_authority || '').startsWith('CHAT_APPROVED'), 'B_K_AUTHORITY_INVALID');
assert(system.system_id === 'digestive-metabolic-endocrine-tumor', 'B_K_SYSTEM_ID_INVALID');
assert(system.canonical_id === 'B', 'B_K_CANONICAL_ID_INVALID');
assert(system?.identity?.block_count === 38, 'B_K_DECLARED_BLOCK_COUNT_INVALID');
assert(system?.identity?.canonical_kp_count === 600, 'B_K_DECLARED_KP_COUNT_INVALID');
assert(system?.identity?.block_identity_change === false && system?.identity?.kp_identity_change === false, 'B_K_IDENTITY_MUTATION_FORBIDDEN');

assert(records.length === 38, 'B_K_BLOCK_COUNT_MISMATCH', records.length);
assert(records.every((row, i) => row.order === expectedOrders[i]), 'B_K_BLOCK_ORDER_MISMATCH');
assert(records.every((row) => row.headings.length === row.markers.length), 'B_K_MARKER_HEADING_MISMATCH', records.filter((row) => row.headings.length !== row.markers.length).map((row) => row.order).join(','));
assert(records.every((row) => row.headings.every((n, i) => n === i + 1)), 'B_K_KP_ORDINAL_GAP');
const headingTotal = records.reduce((sum, row) => sum + row.headings.length, 0);
assert(headingTotal === 600, 'B_K_KP_HEADING_TOTAL_MISMATCH', headingTotal);
assert(markerIds.length === 600, 'B_K_KP_MARKER_TOTAL_MISMATCH', markerIds.length);
assert(new Set(markerIds).size === 600, 'B_K_DUPLICATE_KP_MARKER');

const route = Array.isArray(system.block_route) ? system.block_route : [];
assert(route.length === 38, 'B_K_ROUTE_COUNT_MISMATCH', route.length);
assert(route.every((row, i) => row.id === expectedOrders[i] && row.label === expectedOrders[i]), 'B_K_ROUTE_IDENTITY_MISMATCH');
assert(route.reduce((sum, row) => sum + Number(row.kp || 0), 0) === 600, 'B_K_ROUTE_KP_TOTAL_MISMATCH');
for (let i = 0; i < route.length; i += 1) {
  assert(Number(route[i].kp) === records[i].headings.length, 'B_K_ROUTE_BLOCK_KP_MISMATCH', route[i].id);
}

assert(String(system?.mental_model?.mother_model || '').length > 80, 'B_K_MOTHER_MODEL_MISSING');
assert(Array.isArray(system?.mental_model?.spine) && system.mental_model.spine.length >= 8, 'B_K_SPINE_INCOMPLETE');
assert(Array.isArray(system.core_relations) && system.core_relations.length >= 8, 'B_K_RELATIONS_INCOMPLETE');
assert(Array.isArray(system.failure_modes) && system.failure_modes.length === 13, 'B_K_FAILURE_MODE_COUNT_MISMATCH');
assert(Array.isArray(system.judgment_axes) && system.judgment_axes.length >= 10, 'B_K_JUDGMENT_AXES_INCOMPLETE');
assert(Array.isArray(system.dependency_dag) && system.dependency_dag.length >= 8, 'B_K_DEPENDENCY_DAG_INCOMPLETE');
assert(Array.isArray(system?.scope_boundary?.not_owned_here) && system.scope_boundary.not_owned_here.length >= 6, 'B_K_NEGATIVE_SPACE_MISSING');
assert(system?.source_state?.official_question_membership === 'CURRENT_SEPARATE_OWNER_ACCEPTED', 'B_K_SOURCE_DEPENDENCY_BOUNDARY_INVALID');
const qScope=JSON.parse(fs.readFileSync(rel('content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-question-scope.json'),'utf8'));
assert(qScope?.status === 'CURRENT', 'B_K_QUESTION_SCOPE_OWNER_NOT_CURRENT');
assert(system?.source_state?.official_question_owner === 'content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-question-scope.json', 'B_K_QUESTION_SCOPE_OWNER_MISMATCH');
assert(system?.source_state?.question_count_target_forbidden === true, 'B_K_1072_TARGET_GUARD_MISSING');
assert(system?.source_state?.question_to_kp_inference_forbidden === true, 'B_K_QUESTION_KP_GUARD_MISSING');
assert(!system.logic_index, 'B_K_PREMATURE_LOGIC_INDEX_CLAIM');

console.log(`B Knowledge PASS candidate | Blocks=${records.length} | KPs=${headingTotal} | UniqueMarkers=${new Set(markerIds).size} | FailureModes=${system.failure_modes.length} | SQuestionScope=${system.source_state.official_question_membership}`);
