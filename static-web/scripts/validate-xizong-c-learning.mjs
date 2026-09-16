import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), process.cwd().endsWith('static-web') ? '..' : '.');
const learnerRoot = path.join(repoRoot, 'content/xizong/knowledge/learner');
const systemRoot = path.join(repoRoot, 'content/xizong/knowledge/systems/c-hematology-immunity-infection');
const manifestPath = path.join(learnerRoot, 'c-hematology-immunity-infection-learning.json');
const retiredCandidatePath = path.join(learnerRoot, 'c-hematology-immunity-infection-learning-candidate.json');
const systemPath = path.join(systemRoot, 'system.json');
const blocksDir = path.join(systemRoot, 'blocks');
const acceptancePath = path.join(systemRoot, 'ACCEPTANCE.md');
const currentPath = path.join(systemRoot, 'CURRENT.md');

function fail(message) {
  throw new Error(`C_LEARNING_INVALID:${message}`);
}
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
function expectedRange(n) {
  return Array.from({ length: n }, (_, i) => i + 1);
}
function sameArray(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => value === b[index]);
}
function parseBlockMarkdowns() {
  const records = new Map();
  for (const name of fs.readdirSync(blocksDir).filter((name) => name.endsWith('.md'))) {
    const text = fs.readFileSync(path.join(blocksDir, name), 'utf8');
    const blockId = text.match(/^block_id:\s*(\S+)$/m)?.[1];
    const kpCount = Number(text.match(/^kp_count:\s*(\d+)$/m)?.[1] || 0);
    if (!blockId || !kpCount) continue;
    if (records.has(blockId)) fail(`duplicate-canonical-block:${blockId}`);
    const prefix = `${blockId}-kp`;
    const kpIds = [...text.matchAll(/<!--\s*kianos:kp\s+id="([^"]+)"\s*-->/g)]
      .map((match) => match[1])
      .filter((id) => id.startsWith(prefix));
    const ordinals = kpIds.map((id) => Number(id.slice(prefix.length))).sort((a, b) => a - b);
    if (!sameArray(ordinals, expectedRange(kpCount))) fail(`canonical-kp-identity-mismatch:${blockId}`);
    records.set(blockId, { name, kpCount, ordinals });
  }
  return records;
}

if (!fs.existsSync(manifestPath)) fail('missing-canonical-learning-owner');
if (fs.existsSync(retiredCandidatePath)) fail('parallel-candidate-owner-still-live');
if (!fs.existsSync(acceptancePath) || !fs.existsSync(currentPath)) fail('missing-c-scoped-governance-owner');

const root = readJson(manifestPath);
if (root.schema !== 'kianos.xizong.system_learning_support.v2') fail(`root-schema:${root.schema}`);
if (root.system_id !== 'hematology-immunity-infection' || root.canonical_id !== 'C') fail('root-identity');
if (root.status !== 'CURRENT') fail(`root-status:${root.status}`);
if (root.authority !== 'CHAT_APPROVED_LEARNING_ACCEPTANCE') fail(`root-authority:${root.authority}`);
if (/CANDIDATE|PENDING/i.test(String(root.construction_status || ''))) fail(`stale-construction-status:${root.construction_status}`);
if (root.identity?.stable_block_count !== 27) fail(`root-block-count:${root.identity?.stable_block_count}`);
if (root.identity?.stable_kp_count !== 423) fail(`root-kp-count:${root.identity?.stable_kp_count}`);
if (root.identity?.logic_group_count !== 133) fail(`root-lg-count:${root.identity?.logic_group_count}`);
if (root.identity?.logic_group_member_encoding !== 'EXPLICIT_ORDINAL_LIST') fail('root-member-encoding');
if (root.acceptance?.independence !== 'INDEPENDENT') fail(`acceptance-independence:${root.acceptance?.independence}`);
if (root.acceptance?.fresh_auditor_required !== false) fail('fresh-auditor-flag-not-closed');
if (root.acceptance?.L_pass_claimed !== true) fail('L-pass-not-claimed-after-acceptance');
if (root.acceptance?.verdict !== 'FRESH_L_PASS_AFTER_REPAIR') fail(`verdict:${root.acceptance?.verdict}`);
if (root.projection_boundary?.status !== 'ELIGIBLE_NOT_STARTED_AFTER_L_ACCEPTANCE') fail(`projection-status:${root.projection_boundary?.status}`);
if (root.machine_semantics?.logic_group_member_encoding !== 'EXPLICIT_ORDINAL_LIST') fail('machine-member-encoding');
if (!String(root.machine_semantics?.receipt_role || '').includes('Historical construction evidence only')) fail('receipt-role-not-demoted');

const system = readJson(systemPath);
if (system.logic_index) fail('system-json-must-not-own-logic-index');

const shardPaths = root.storage?.shards;
if (!Array.isArray(shardPaths) || shardPaths.length !== 5) fail(`shard-list:${JSON.stringify(shardPaths)}`);
const blocks = new Map();
const groupIds = new Set();
const receiptAnchors = new Set();
const knownJobs = new Set(Object.keys(root.machine_semantics?.job_contracts || {}));
let groupCount = 0;
let kpCount = 0;

for (const relativePath of shardPaths) {
  const filePath = path.join(learnerRoot, relativePath);
  if (!fs.existsSync(filePath)) fail(`missing-shard:${relativePath}`);
  const shard = readJson(filePath);
  if (shard.schema !== 'kianos.xizong.system_learning_support.block_shard.v2') fail(`shard-schema:${relativePath}`);
  if (shard.system_id !== root.system_id || shard.canonical_id !== root.canonical_id) fail(`shard-identity:${relativePath}`);
  // Shards are storage members of the canonical owner; construction-era shard labels are not gate authority.
  for (const [blockId, block] of Object.entries(shard.blocks || {})) {
    if (blocks.has(blockId)) fail(`duplicate-learning-block:${blockId}`);
    const match = blockId.match(/^hematology-h(\d{2})$/);
    if (!match) fail(`block-id:${blockId}`);
    const kpTotal = Number(block.kp_count || 0);
    if (!Number.isInteger(kpTotal) || kpTotal < 1) fail(`block-kp-count:${blockId}`);
    const groups = block.logic_groups || {};
    const order = block.learner_order;
    const keys = Object.keys(groups);
    if (!Array.isArray(order) || order.length !== keys.length || new Set(order).size !== order.length) fail(`learner-order-shape:${blockId}`);
    if (order.some((id) => !Object.hasOwn(groups, id)) || keys.some((id) => !order.includes(id))) fail(`learner-order-keys:${blockId}`);
    const members = [];
    for (const groupId of order) {
      const group = groups[groupId];
      if (groupIds.has(groupId)) fail(`duplicate-group-id:${groupId}`);
      groupIds.add(groupId);
      if (!groupId.startsWith(`c-h${match[1]}-lg`)) fail(`group-block-mismatch:${groupId}:${blockId}`);
      if (!Array.isArray(group.kp_members) || group.kp_members.length < 1) fail(`group-members:${groupId}`);
      if (Object.hasOwn(group, 'kp')) fail(`legacy-contiguous-range-field-forbidden:${groupId}`);
      if (new Set(group.kp_members).size !== group.kp_members.length) fail(`group-internal-duplicate:${groupId}`);
      for (const ordinal of group.kp_members) {
        if (!Number.isInteger(ordinal) || ordinal < 1 || ordinal > kpTotal) fail(`group-member-range:${groupId}:${ordinal}`);
        members.push(ordinal);
      }
      if (!group.label || !Array.isArray(group.jobs) || group.jobs.length < 1) fail(`group-learning-contract:${groupId}`);
      for (const job of group.jobs) if (!knownJobs.has(job)) fail(`unknown-job:${groupId}:${job}`);
      if (!group.goal || !group.closure || !group.continuity_rationale) fail(`group-semantic-contract:${groupId}`);
      if (!/^C-H\d{2}-LG\d{2}$/.test(group.receipt_anchor || '')) fail(`receipt-anchor-format:${groupId}:${group.receipt_anchor}`);
      if (receiptAnchors.has(group.receipt_anchor)) fail(`duplicate-receipt-anchor:${group.receipt_anchor}`);
      receiptAnchors.add(group.receipt_anchor);
      groupCount += 1;
    }
    const sortedMembers = [...members].sort((a, b) => a - b);
    if (!sameArray(sortedMembers, expectedRange(kpTotal))) fail(`kp-partition:${blockId}`);
    blocks.set(blockId, block);
    kpCount += kpTotal;
  }
}

if (blocks.size !== 27) fail(`actual-block-count:${blocks.size}`);
if (kpCount !== 423) fail(`actual-kp-count:${kpCount}`);
if (groupCount !== 133) fail(`actual-lg-count:${groupCount}`);
if (groupIds.size !== 133 || receiptAnchors.size !== 133) fail(`group-identity-cardinality:${groupIds.size}/${receiptAnchors.size}`);

const expectedBlockIds = Array.from({ length: 27 }, (_, i) => `hematology-h${String(i + 1).padStart(2, '0')}`);
if (!sameArray([...blocks.keys()].sort(), [...expectedBlockIds].sort())) fail('block-set-mismatch');
if (!sameArray(root.system_route?.default_route || [], expectedBlockIds)) fail('default-route-mismatch');
if (root.system_route?.default_is_not_hard_prerequisite_chain !== true) fail('default-route-ontology-overclaim');

const canonical = parseBlockMarkdowns();
if (canonical.size !== 27) fail(`canonical-block-count:${canonical.size}`);
for (const blockId of expectedBlockIds) {
  const block = blocks.get(blockId);
  const source = canonical.get(blockId);
  if (!source) fail(`canonical-block-missing:${blockId}`);
  if (block.kp_count !== source.kpCount) fail(`canonical-learning-kp-count-mismatch:${blockId}:${block.kp_count}/${source.kpCount}`);
}

const nonContiguousExpectations = {
  'c-h01-lg06': [1, 12, 13],
  'c-h09-lg03': [10, 11, 12, 13, 19],
  'c-h14-lg01': [1, 2, 3, 12],
  'c-h16-lg02': [2, 3, 4, 5, 8, 9],
  'c-h19-lg03': [8, 9, 10, 11, 17],
  'c-h19-lg05': [16, 18]
};
for (const [groupId, expected] of Object.entries(nonContiguousExpectations)) {
  const blockId = groupId.replace(/^c-/, '').replace(/-lg\d+$/, '').replace(/^h/, 'hematology-h');
  const actual = blocks.get(blockId)?.logic_groups?.[groupId]?.kp_members;
  if (!sameArray(actual, expected)) fail(`noncontiguous-membership-lost:${groupId}:${JSON.stringify(actual)}`);
}

const acceptance = fs.readFileSync(acceptancePath, 'utf8');
if (!acceptance.includes('FRESH_L_PASS_AFTER_REPAIR')) fail('scoped-acceptance-verdict-missing');
if (!acceptance.includes('P — Projection | **NOT_STARTED / ELIGIBLE**')) fail('projection-not-recorded-as-not-started');
if (!acceptance.includes('K PASS + L PASS does not mean Kian has learned C')) fail('learner-truth-guard-missing');

console.log(JSON.stringify({
  pass: true,
  system: 'C Hematology / Immunity / Infection',
  canonical_owner: path.relative(repoRoot, manifestPath),
  candidate_leak: 0,
  blocks: blocks.size,
  stable_kps: kpCount,
  logic_groups: groupCount,
  shard_count: shardPaths.length,
  explicit_noncontiguous_groups_checked: Object.keys(nonContiguousExpectations).length,
  verdict: root.acceptance.verdict,
  projection_status: root.projection_boundary.status
}, null, 2));
