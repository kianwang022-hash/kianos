import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const learnerRoot = path.join(repoRoot, 'content/xizong/knowledge/learner');

const fail = (message) => {
  throw new Error(`XIZONG_LEARNING_OWNER_LIFECYCLE_FAIL:${message}`);
};

const files = fs.readdirSync(learnerRoot)
  .filter((name) => name.endsWith('-learning.json'))
  .sort();

if (files.length === 0) fail('NO_SYSTEM_LEARNING_OWNERS');

const owners = files.map((name) => {
  const full = path.join(learnerRoot, name);
  const data = JSON.parse(fs.readFileSync(full, 'utf8'));
  const id = String(data?.canonical_id || data?.system_id || name);
  const status = String(data?.status || '');
  const authority = String(data?.authority || '');
  const construction = String(data?.construction_status || '');

  if (status !== 'CURRENT') {
    fail(`NON_CURRENT_LIVE_OWNER:${name}:${status || 'MISSING'}`);
  }
  if (!authority || /UPGRADE_WORK|COMPILED_LEARNING_CONSTRUCTION|CANDIDATE|PENDING/i.test(authority)) {
    fail(`STALE_AUTHORITY:${name}:${authority || 'MISSING'}`);
  }
  if (/CANDIDATE|PENDING/i.test(construction)) {
    fail(`STALE_CONSTRUCTION_STATUS:${name}:${construction}`);
  }

  return { id, name, status, authority, construction };
});

const duplicateIds = owners
  .map((owner) => owner.id)
  .filter((id, index, all) => all.indexOf(id) !== index);
if (duplicateIds.length) fail(`DUPLICATE_SYSTEM_LEARNING_OWNER:${[...new Set(duplicateIds)].join(',')}`);

console.log([
  'Xizong Learning-owner lifecycle validation PASS',
  `LiveOwners=${owners.length}`,
  `IDs=${owners.map((owner) => owner.id).join(',')}`,
  'Status=CURRENT',
  'ConstructionCandidateLeak=0'
].join(' | '));
