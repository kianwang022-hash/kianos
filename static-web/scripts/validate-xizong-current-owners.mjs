import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertDependencyFreshness,
  assertReviewedAgainst,
  semanticSha256,
  textSha256
} from './xizongDependencyFreshness.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const systemsRoot = path.join(repoRoot, 'content/xizong/knowledge/systems');
const manifestPath = path.join(repoRoot, 'content/xizong/knowledge/manifest.json');

const fail = (message) => {
  throw new Error(`XIZONG_CURRENT_OWNER_FAIL:${message}`);
};

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function blockCodeFromFilename(filename) {
  const base = path.basename(filename, path.extname(filename));
  const match = base.match(/(?:^|_)(Block\d+|[A-Z]{1,3}\d+)(?:_|$)/);
  return match?.[1] || null;
}

function normalizeBlockCode(code) {
  const match = String(code).match(/^(Block|[A-Z]{1,3})(\d+)$/);
  if (!match) return null;
  return `${match[1].toUpperCase()}:${Number(match[2])}`;
}

function currentBlockOwnerRecords() {
  const allMarkdown = walk(systemsRoot).filter((file) => /\.md$/i.test(file));
  const records = [];

  for (const file of allMarkdown) {
    const relative = path.relative(systemsRoot, file).split(path.sep).join('/');
    const basename = path.basename(file);
    const code = blockCodeFromFilename(basename);
    const looksLikeBlockOwner = Boolean(code) || /学习阅读版|最终执行版/.test(basename);

    if (!looksLikeBlockOwner) continue;
    if (!code) fail(`BLOCK_IDENTITY_UNRESOLVED:${relative}`);

    const normalizedCode = normalizeBlockCode(code);
    if (!normalizedCode) fail(`BLOCK_IDENTITY_INVALID:${relative}:${code}`);

    const systemDir = relative.split('/')[0];
    records.push({
      identity: `${systemDir}:${normalizedCode}`,
      path: relative,
      code
    });
  }

  return records;
}

function validateUniqueOwners(records, expectedCount) {
  const seen = new Map();
  for (const record of records) {
    const previous = seen.get(record.identity);
    if (previous) {
      fail(`DUPLICATE_BLOCK_OWNER:${record.identity}:${previous}:${record.path}`);
    }
    seen.set(record.identity, record.path);
  }

  if (records.length !== expectedCount) {
    fail(`BLOCK_OWNER_COUNT:${records.length}:EXPECTED:${expectedCount}`);
  }

  return seen;
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const expectedCount = Number(manifest?.identity?.numbered_blocks);
if (!Number.isInteger(expectedCount) || expectedCount <= 0) {
  fail('INVALID_MANIFEST_BLOCK_COUNT');
}

const owners = currentBlockOwnerRecords();
validateUniqueOwners(owners, expectedCount);

// Detection-power proof: the validator itself must fail when a second live owner
// is injected for the same stable Block identity. This is in-memory only and does
// not mutate repository content.
let duplicateWasRejected = false;
try {
  const first = owners[0];
  validateUniqueOwners(
    [...owners, { ...first, path: `${first.path}.synthetic-duplicate` }],
    expectedCount + 1
  );
} catch (error) {
  duplicateWasRejected = String(error?.message || error).includes('DUPLICATE_BLOCK_OWNER');
}
if (!duplicateWasRejected) fail('NEGATIVE_DUPLICATE_TEST_DID_NOT_FAIL');

const bySystem = owners.reduce((acc, owner) => {
  const system = owner.path.split('/')[0];
  acc[system] = (acc[system] || 0) + 1;
  return acc;
}, {});

console.log([
  'Xizong Current owner validation PASS',
  `BlockOwners=${owners.length}/${expectedCount}`,
  `Systems=${Object.keys(bySystem).length}`,
  'DuplicateStableIdentity=FAIL_CLOSED',
  'LegacyFilenameVersion=NON_AUTHORITY',
  'DetectionPower=NEGATIVE_DUPLICATE_REJECTED'
].join(' | '));

// 27 Source task lifecycle ownership: exact task slots own lifecycle;
// routers/maps may reference or derive, but must not maintain a second live enum.
const readRepoJson = (relative) => JSON.parse(fs.readFileSync(path.join(repoRoot, relative), 'utf8'));
const readRepoText = (relative) => fs.readFileSync(path.join(repoRoot, relative), 'utf8');

const systemDirByCanonical = new Map();
for (const domain of Object.values(manifest?.macro_domain_taxonomy?.domains || {})) {
  for (const ownerPath of domain?.system_owners || []) {
    const dirName = String(ownerPath).match(/^systems\/([^/]+)\/?$/)?.[1];
    if (!dirName) fail('SYSTEM_OWNER_PATH_INVALID:' + ownerPath);
    const system = readRepoJson(`content/xizong/knowledge/systems/${dirName}/system.json`);
    const canonicalId = String(system?.canonical_id || system?.identity?.canonical_id || '');
    if (!canonicalId) fail('SYSTEM_CANONICAL_ID_MISSING:' + dirName);
    if (systemDirByCanonical.has(canonicalId)) fail('SYSTEM_CANONICAL_ID_DUPLICATE:' + canonicalId);
    systemDirByCanonical.set(canonicalId, dirName);
  }
}

function surgeryBindingOwner(systemCanonicalId, blockId) {
  const dirName = systemDirByCanonical.get(systemCanonicalId);
  if (!dirName) fail('SURGERY_BINDING_SYSTEM_UNKNOWN:' + systemCanonicalId);
  const candidates = owners.filter((owner) => owner.path.startsWith(dirName + '/'));
  if (['A1', 'A2', 'A3'].includes(systemCanonicalId)) {
    const ordinal = Number(String(blockId).match(/(\d+)$/)?.[1]);
    const matches = candidates.filter((owner) => Number(String(owner.code).match(/(\d+)$/)?.[1]) === ordinal);
    if (matches.length !== 1) fail(`SURGERY_BINDING_OWNER_AMBIGUOUS:${systemCanonicalId}:${blockId}:${matches.length}`);
    return matches[0];
  }
  const direct = String(blockId).match(/^([A-Z]{1,3})(\d+)$/) || String(blockId).match(/-([a-z]{1,3})(\d+)$/i);
  if (!direct) fail('SURGERY_BINDING_BLOCK_ID_INVALID:' + systemCanonicalId + ':' + blockId);
  const normalizedCode = normalizeBlockCode(direct[1].toUpperCase() + direct[2]);
  const identity = `${dirName}:${normalizedCode}`;
  const match = candidates.find((owner) => owner.identity === identity);
  if (!match) fail('SURGERY_BINDING_OWNER_MISSING:' + identity);
  return match;
}

function surgeryKnowledgeBasis(sourceMap) {
  const rows = [];
  const reviewedAgainst = {};
  for (const unit of sourceMap?.units || []) {
    const bindings = unit?.architecture_v3?.bindings || [];
    if (!bindings.length) fail('SURGERY_UNIT_BINDING_MISSING:' + unit?.id);
    if (!unit?.semantic_delta_receipt) fail('SURGERY_UNIT_REVIEW_RECEIPT_MISSING:' + unit?.id);
    for (const binding of bindings) {
      const owner = surgeryBindingOwner(String(binding?.system || ''), String(binding?.block || ''));
      const ownerPath = 'content/xizong/knowledge/systems/' + owner.path;
      const revisionSha256 = textSha256(readRepoText(ownerPath));
      const stableKey = String(binding.system) + ':' + String(binding.block);
      const prior = reviewedAgainst[stableKey];
      if (prior && (prior.owner_path !== ownerPath || prior.revision_sha256 !== revisionSha256)) {
        fail('SURGERY_BINDING_OWNER_CONFLICT:' + stableKey);
      }
      reviewedAgainst[stableKey] = { owner_path: ownerPath, revision_sha256: revisionSha256 };
      rows.push({
        unit_id: unit.id,
        unit_title: unit.title,
        pdf_pages: unit.pdf_pages,
        review: unit.review,
        semantic_delta_receipt: unit.semantic_delta_receipt,
        binding,
        owner_path: ownerPath,
        owner_revision_sha256: revisionSha256
      });
    }
  }
  return { rows, reviewedAgainst, signature: semanticSha256({ source_identity: sourceMap.source_identity, bindings: rows }) };
}

function surgeryLearningBasis(sourceMap, targets) {
  if (!Array.isArray(targets) || !targets.length) fail('SURGERY_LEARNING_TARGETS_MISSING');
  const reviewedAgainst = {};
  const rows = targets.map((target) => {
    const system = String(target?.system || '');
    const block = String(target?.block || '');
    const dirName = systemDirByCanonical.get(system);
    if (!dirName) fail('SURGERY_LEARNING_SYSTEM_UNKNOWN:' + system);
    const learningPath = `content/xizong/knowledge/learner/${dirName}-learning.json`;
    const learning = readRepoJson(learningPath);
    const value = learning?.blocks?.[block] ?? learning?.logic_groups?.[block];
    if (!value) fail('SURGERY_LEARNING_TARGET_MISSING:' + system + ':' + block);
    const stableKey = system + ':' + block;
    reviewedAgainst[stableKey] = { path: learningPath, semantic_sha256: semanticSha256(value) };
    return { system, block, path: learningPath, value };
  });
  return { rows, reviewedAgainst, signature: semanticSha256({ source_identity: sourceMap.source_identity, targets: rows }) };
}

const BIO_LIFECYCLE = 'content/xizong/knowledge/learner/xizong-2027-biochemistry-delta-slot.json';
const SURGERY_LIFECYCLE = 'content/xizong/knowledge/learner/xizong-2027-surgery-rebase-slot.json';
const SURGERY_MAP = 'content/xizong/knowledge/learner/surgery-27-source-map.json';

const bioLifecycle = readRepoJson(BIO_LIFECYCLE);
const surgeryLifecycle = readRepoJson(SURGERY_LIFECYCLE);
const surgeryMap = readRepoJson(SURGERY_MAP);
const xizongCurrent = readRepoText('content/xizong/CURRENT.md');
const contentMainline = readRepoText('content/xizong/CONTENT_MAINLINE.md');

if (!/^CLOSED_CURRENT/.test(String(bioLifecycle.status || ''))) fail('BIOCHEMISTRY_LIFECYCLE_NOT_CLOSED_CURRENT');
if (!/^CLOSED_CURRENT/.test(String(surgeryLifecycle.status || ''))) fail('SURGERY_LIFECYCLE_NOT_CLOSED_CURRENT');

const bioClosedAction = String(bioLifecycle.current_state?.action_now || '');
const surgeryClosedAction = String(surgeryLifecycle.current_state?.action_now || '');
const surgeryResidualCloseout = String(surgeryLifecycle.current_state?.residual_rebase_2026_09_26?.closeout || '');
if (!/not a project blocker/i.test(bioClosedAction)) fail('BIOCHEMISTRY_REAL_U_MISCLASSIFIED_AS_CLOSURE_GATE');
if (!/not a project blocker/i.test(surgeryClosedAction)) fail('SURGERY_REAL_U_MISCLASSIFIED_AS_CLOSURE_GATE');
if (!/passive calibration only/i.test(surgeryResidualCloseout)) fail('SURGERY_RESIDUAL_REAL_U_NOT_PASSIVE_CALIBRATION');
if (/proceed only to real-use human validation/i.test(bioClosedAction + ' ' + surgeryClosedAction)) {
  fail('XIZONG_CLOSED_LIFECYCLE_REQUIRES_DEDICATED_HUMAN_VALIDATION');
}
if (surgeryLifecycle.owner_boundary?.lifecycle_owner !== SURGERY_LIFECYCLE) fail('SURGERY_LIFECYCLE_OWNER_POINTER');
if (surgeryLifecycle.current_state?.source_map_owner !== SURGERY_MAP) fail('SURGERY_SOURCE_MAP_POINTER');
if (surgeryLifecycle.governance?.status !== 'CONTRACT_CURRENT') fail('SURGERY_GOVERNANCE_STATUS');

for (const key of ['first_batch', 'second_batch', 'third_batch', 'fourth_batch']) {
  const row = surgeryLifecycle.current_state?.[key] || {};
  if ('status' in row) fail('SURGERY_LIVE_BATCH_STATUS:' + key);
  if ('next_action' in row) fail('SURGERY_LIVE_BATCH_NEXT:' + key);
}
if ('status' in (surgeryLifecycle.current_state?.correction_2026_09_24 || {})) fail('SURGERY_LIVE_CORRECTION_STATUS');
if (/"next_action"\s*:/.test(JSON.stringify(surgeryLifecycle.current_state || {}))) fail('SURGERY_CLOSED_HAS_LIVE_NEXT_ACTION');
if ('active_biochemistry_rebase' in (surgeryLifecycle.current_state?.concurrency || {})) fail('SURGERY_ACTIVE_BIOCHEMISTRY_MIRROR');
if (surgeryLifecycle.current_state?.concurrency?.biochemistry_revision_owner !== BIO_LIFECYCLE) fail('SURGERY_BIOCHEMISTRY_OWNER_POINTER');

if (surgeryMap.status !== 'CURRENT_38_UNIT_DIRECT_ARCHITECTURE_RECONCILIATION') fail('SURGERY_MAP_STATUS_NOT_ROUTING_ONLY');
if (surgeryMap.lifecycle_owner !== SURGERY_LIFECYCLE) fail('SURGERY_MAP_LIFECYCLE_POINTER');
if ('biochemistry_revision_state' in (surgeryMap.shared_owner_coordination || {})) fail('SURGERY_MAP_BIOCHEMISTRY_STATE_MIRROR');
if (surgeryMap.shared_owner_coordination?.biochemistry_revision_owner !== BIO_LIFECYCLE) fail('SURGERY_MAP_BIOCHEMISTRY_OWNER_POINTER');
if ('downstream_pending' in (surgeryMap.reprocess_v2?.content_acceptance || {})) fail('SURGERY_MAP_LIVE_DOWNSTREAM_PENDING');
if (surgeryMap.architecture_v3?.progress?.next !== 'NONE_CLOSED') fail('SURGERY_MAP_LIVE_NEXT');
if ('acceptance_status' in (surgeryMap.architecture_v3?.downstream_revalidation || {})) fail('SURGERY_MAP_ACCEPTANCE_STATUS_MIRROR');
if (surgeryMap.architecture_v3?.downstream_revalidation?.acceptance_owner !== SURGERY_LIFECYCLE) fail('SURGERY_MAP_ACCEPTANCE_OWNER');

const surgeryFreshness = surgeryLifecycle.current_state?.dependency_freshness;
const surgeryKnowledge = surgeryKnowledgeBasis(surgeryMap);
if (surgeryKnowledge.rows.length !== 59) fail('SURGERY_BINDING_COUNT:' + surgeryKnowledge.rows.length + ':EXPECTED:59');
const surgeryBoundBlocks = new Set(surgeryKnowledge.rows.map((row) => row.binding.system + ':' + row.binding.block));
if (surgeryBoundBlocks.size !== 52) fail('SURGERY_BOUND_BLOCK_COUNT:' + surgeryBoundBlocks.size + ':EXPECTED:52');
const surgeryLearning = surgeryLearningBasis(
  surgeryMap,
  surgeryFreshness?.consumers?.reviewed_learning_bindings?.targets
);
if (surgeryLearning.rows.length !== 7) fail('SURGERY_LEARNING_TARGET_COUNT:' + surgeryLearning.rows.length + ':EXPECTED:7');
assertReviewedAgainst({
  scope: 'SURGERY_KNOWLEDGE',
  stored: surgeryFreshness?.consumers?.reviewed_knowledge_bindings?.reviewed_against,
  current: surgeryKnowledge.reviewedAgainst
});
assertReviewedAgainst({
  scope: 'SURGERY_LEARNING',
  stored: surgeryFreshness?.consumers?.reviewed_learning_bindings?.reviewed_against,
  current: surgeryLearning.reviewedAgainst
});
const surgeryDownstreamSignature = semanticSha256({
  knowledge: surgeryKnowledge.signature,
  learning: surgeryLearning.signature
});
assertDependencyFreshness({
  scope: 'SURGERY_27',
  receipt: surgeryFreshness,
  sourceRevisionSha256: surgeryMap.source_identity?.sha256,
  consumers: {
    reviewed_knowledge_bindings: { mode: 'REVIEWED_DERIVATION', path: SURGERY_MAP, receiptSha256: surgeryKnowledge.signature },
    reviewed_learning_bindings: { mode: 'REVIEWED_DERIVATION', receiptSha256: surgeryLearning.signature },
    downstream_review: { mode: 'REVIEWED_DERIVATION', receiptSha256: surgeryDownstreamSignature },
    source_visuals: { mode: 'DERIVED_PROJECTION' }
  }
});
if (surgeryFreshness?.consumers?.downstream_review?.freshness !== 'TARGETED_Q_X_EVIDENCE_RECONCILIATION') fail('SURGERY_DOWNSTREAM_FRESHNESS_MODE');
if (surgeryFreshness?.consumers?.source_visuals?.freshness !== 'RECOMPUTE_WITH_VALIDATE_XIZONG_SOURCE_VISUALS') fail('SURGERY_SOURCE_VISUAL_FRESHNESS_MODE');
let staleSurgeryReceiptRejected = false;
try {
  const stale = structuredClone(surgeryFreshness);
  stale.consumers.reviewed_knowledge_bindings.receipt_sha256 = 'stale';
  assertDependencyFreshness({
    scope: 'SURGERY_27_NEGATIVE', receipt: stale, sourceRevisionSha256: surgeryMap.source_identity?.sha256,
    consumers: { reviewed_knowledge_bindings: { mode: 'REVIEWED_DERIVATION', path: SURGERY_MAP, receiptSha256: surgeryKnowledge.signature } }
  });
} catch (error) {
  staleSurgeryReceiptRejected = String(error?.message || error).includes('STALE_CONSUMER:reviewed_knowledge_bindings');
}
if (!staleSurgeryReceiptRejected) fail('SURGERY_DEPENDENCY_FRESHNESS_NEGATIVE_TEST');
let exactSurgeryWitnessRejected = false;
try {
  const staleWitness = structuredClone(surgeryFreshness?.consumers?.reviewed_knowledge_bindings?.reviewed_against || {});
  staleWitness['B:D21'].revision_sha256 = 'stale';
  assertReviewedAgainst({ scope: 'SURGERY_KNOWLEDGE', stored: staleWitness, current: surgeryKnowledge.reviewedAgainst });
} catch (error) {
  exactSurgeryWitnessRejected = String(error?.message || error).includes('STALE_REVIEW_WITNESS:SURGERY_KNOWLEDGE:B:D21');
}
if (!exactSurgeryWitnessRejected) fail('SURGERY_EXACT_WITNESS_NEGATIVE_TEST');

if (!xizongCurrent.includes('27 Biochemistry lifecycle owner:') || !xizongCurrent.includes(BIO_LIFECYCLE)) fail('CURRENT_BIOCHEMISTRY_LIFECYCLE_ROUTE');
if (!xizongCurrent.includes('27 Surgery lifecycle owner:') || !xizongCurrent.includes(SURGERY_LIFECYCLE)) fail('CURRENT_SURGERY_LIFECYCLE_ROUTE');
if (/27 (?:Biochemistry|Surgery).*is CLOSED \/ CURRENT/.test(xizongCurrent)) fail('CURRENT_LIFECYCLE_ENUM_MIRROR');
if (!contentMainline.includes('Biochemistry and Surgery Source-revision work route to their exact lifecycle owners')) fail('MAINLINE_LIFECYCLE_ROUTE_MISSING');
if (/Status: \*\*CLOSED \/ CURRENT · S\/K\/L\/Content/.test(contentMainline)) fail('MAINLINE_LIFECYCLE_ENUM_MIRROR');

console.log([
  'Xizong Surgery dependency freshness PASS',
  'SourceUnits=38',
  'Bindings=59',
  'BoundBlocks=52',
  'ReviewedLearningTargets=7',
  'ExactWitnessNegativeTest=FAIL_CLOSED'
].join(' | '));
