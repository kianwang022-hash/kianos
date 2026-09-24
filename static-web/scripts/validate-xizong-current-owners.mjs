import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

if (!xizongCurrent.includes('27 Biochemistry lifecycle owner:') || !xizongCurrent.includes(BIO_LIFECYCLE)) fail('CURRENT_BIOCHEMISTRY_LIFECYCLE_ROUTE');
if (!xizongCurrent.includes('27 Surgery lifecycle owner:') || !xizongCurrent.includes(SURGERY_LIFECYCLE)) fail('CURRENT_SURGERY_LIFECYCLE_ROUTE');
if (/27 (?:Biochemistry|Surgery).*is CLOSED \/ CURRENT/.test(xizongCurrent)) fail('CURRENT_LIFECYCLE_ENUM_MIRROR');
if (!contentMainline.includes(BIO_LIFECYCLE) || !contentMainline.includes(SURGERY_LIFECYCLE)) fail('MAINLINE_LIFECYCLE_ROUTE_MISSING');
if (/Status: \*\*CLOSED \/ CURRENT · S\/K\/L\/Content/.test(contentMainline)) fail('MAINLINE_LIFECYCLE_ENUM_MIRROR');
