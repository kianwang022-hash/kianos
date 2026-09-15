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
