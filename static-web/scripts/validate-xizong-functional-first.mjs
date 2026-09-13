import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadXizongBlock } from '../src/lib/xizong.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const fail = (message) => { throw new Error(`XIZONG_FUNCTIONAL_FIRST_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

// Regression for a real Functional First defect: stable KP ordinal is identity,
// not learner position. B5 intentionally teaches KP07-12 before KP04-06.
const b5 = loadXizongBlock('circulation', 'b05');
const expectedOpening = [1, 2, 3, 7, 8, 9, 10, 11, 12, 4, 5, 6];
assert(
  JSON.stringify(b5.kpRecords.slice(0, 12).map((kp) => kp.ordinal)) === JSON.stringify(expectedOpening),
  'b5-canonical-reading-order-changed'
);

const groups = b5.logicGroups;
const kps = b5.kpRecords;
const groupIndexForKp = (index) => {
  const groupId = kps[index]?.groupId || '';
  const found = groups.findIndex((group) => group.groupId === groupId);
  return found >= 0 ? found : 0;
};
const firstIndexForGroup = (group) => {
  const firstKpId = Array.isArray(group?.kpIds) ? group.kpIds[0] : '';
  const found = kps.findIndex((kp) => kp.kpId === firstKpId);
  return found >= 0 ? found : 0;
};
const isGroupEnd = (index) => {
  const group = groups[groupIndexForKp(index)];
  const ids = Array.isArray(group?.kpIds) ? group.kpIds : [];
  const kpId = kps[index]?.kpId || '';
  return ids.indexOf(kpId) === ids.length - 1;
};

assert(groups[0]?.groupId === 'circulation-b05-lg01', 'b5-lg01-order');
assert(groups[1]?.groupId === 'circulation-b05-lg03', 'b5-lg03-order');
assert(groups[2]?.groupId === 'circulation-b05-lg02', 'b5-lg02-order');
assert(firstIndexForGroup(groups[0]) === 0, 'b5-lg01-first-index');
assert(firstIndexForGroup(groups[1]) === 3, 'b5-lg03-must-start-at-kp07-position');
assert(firstIndexForGroup(groups[2]) === 9, 'b5-lg02-must-start-at-kp04-position');
assert(groupIndexForKp(3) === 1 && kps[3]?.ordinal === 7, 'b5-kp07-wrong-group');
assert(!isGroupEnd(3), 'b5-kp07-premature-group-close');
assert(isGroupEnd(8) && kps[8]?.ordinal === 12, 'b5-lg03-real-end-not-kp12');
assert(isGroupEnd(11) && kps[11]?.ordinal === 6, 'b5-lg02-real-end-not-kp06');

const blockRuntime = read('static-web/src/components/XizongBlockV6.astro');
assert(blockRuntime.includes("const groupId = kpData[index]?.groupId || '';"), 'runtime-does-not-route-by-kp-group-id');
assert(blockRuntime.includes("const firstKpId = Array.isArray(group?.kpIds) ? group.kpIds[0] : '';"), 'runtime-group-entry-does-not-use-first-kp-id');
assert(blockRuntime.includes('const groupPosition = groupKpIds.indexOf(currentKpId);'), 'runtime-local-position-does-not-use-group-membership');
assert(blockRuntime.includes('const atGroupEnd = groupPosition >= 0 && groupPosition === groupKpIds.length - 1;'), 'runtime-group-close-does-not-use-group-membership');
assert(!blockRuntime.includes('const ordinal = index + 1;'), 'runtime-still-confuses-array-position-with-stable-kp-ordinal');
assert(!blockRuntime.includes('if ((state.kpIndex + 1) >= Number(group?.end || totalKp))'), 'runtime-still-closes-group-by-array-position');

// Resume is intentionally simple: homepage returns to the last real route;
// the Block itself restores stage + KP index from local evidence.
const lastLocation = read('static-web/src/components/XizongLastLocation.astro');
const homeTools = read('static-web/src/components/XizongHomeTools.astro');
assert(lastLocation.includes("localStorage.setItem('kianos-xizong-last-location-v1'"), 'last-location-not-persisted');
assert(lastLocation.includes('href: window.location.pathname'), 'last-location-missing-route');
assert(homeTools.includes("localStorage.getItem('kianos-xizong-last-location-v1')"), 'home-resume-does-not-read-last-location');
assert(homeTools.includes('link.href = last.href;'), 'home-resume-does-not-return-to-last-route');
assert(blockRuntime.includes("JSON.parse(localStorage.getItem(storageKey) || 'null')"), 'block-resume-does-not-restore-state');
assert(blockRuntime.includes("setKpIndex(state.kpIndex || 0); setStage(state.stage || 'block_learn');"), 'block-resume-does-not-restore-stage-and-kp');

console.log([
  'Xizong Functional First regression PASS',
  'B5=nonnumeric-order-routed-by-canonical-group-id',
  'Resume=last-route+block-stage+kp-state',
  'Evidence=DETERMINISTIC_RUNTIME_CONTRACT',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));
