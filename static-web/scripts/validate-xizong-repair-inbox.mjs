import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
const fail = (message) => { throw new Error(`XIZONG_REPAIR_INBOX_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

const repairReturn = read('static-web/src/components/XizongSystemRepairReturn.astro');
const bridge = read('static-web/src/components/XizongRepairInboxBridge.astro');
const blockGuard = read('static-web/src/components/XizongBlockEvidenceGuard.astro');
const systemGuard = read('static-web/src/components/XizongSystemEvidenceGuard.astro');
const blockPage = read('static-web/src/pages/xizong/[system]/[block].astro');

assert(repairReturn.includes('kianos-xizong-repair-inbox-v1:'), 'system-return-does-not-write-inbox');
assert(!repairReturn.includes('kianos-xizong-memory-review-v2:${objectId}'), 'system-return-still-writes-block-evidence-store');
assert(repairReturn.includes('sourceQuestionIds: item.questionIds'), 'repair-inbox-loses-question-provenance');
assert(repairReturn.includes('!relation?.blockId || !relation?.primaryKpId'), 'repair-inbox-route-not-reviewed-only');

assert(blockPage.includes('<XizongRepairInboxBridge block={projection} />'), 'repair-inbox-bridge-not-mounted');
assert(bridge.includes('kianos-xizong-repair-inbox-v1:'), 'bridge-does-not-read-inbox');
assert(bridge.includes('kianos-xizong-memory-review-v2:'), 'bridge-does-not-merge-current-block-evidence');
assert(bridge.includes("type: 'SYSTEM_WU_PLAN_IMPORTED'"), 'bridge-import-event-missing');
assert(bridge.includes("evidence_role: 'REPAIR_ONLY'"), 'bridge-import-promoted-beyond-repair');
assert(bridge.includes('source_question_ids:'), 'bridge-import-loses-question-provenance');
assert(bridge.includes('allowed.has(row.kpId)'), 'bridge-does-not-scope-plan-to-current-block');
assert(bridge.includes("window.addEventListener('storage'"), 'open-block-tab-cannot-receive-inbox');
assert(bridge.includes('window.location.reload();'), 'bridge-does-not-rebuild-in-memory-state-after-import');
assert(bridge.includes('row?.inbox_id === inboxId'), 'bridge-import-not-idempotent-by-inbox');

const writeIndex = bridge.indexOf('if (!writeJson(extensionKey, ext)) return false;');
const clearIndex = bridge.lastIndexOf('localStorage.removeItem(inboxKey)');
assert(writeIndex >= 0 && clearIndex > writeIndex, 'bridge-clears-inbox-before-evidence-write');

assert(blockGuard.includes('repair_inbox: oldRepairInbox'), 'block-version-archive-omits-pending-inbox');
assert(blockGuard.includes('localStorage.removeItem(repairInboxKey)'), 'block-version-change-does-not-invalidate-inbox');
assert(systemGuard.includes('stale_block_repair_inboxes'), 'system-version-archive-omits-pending-inbox');
assert(systemGuard.includes('localStorage.removeItem(inboxKey)'), 'system-version-change-does-not-invalidate-inbox');

console.log([
  'Xizong repair inbox contract PASS',
  'SystemReturn=inbox-only',
  'BlockConsume=atomic+current-KP-scoped',
  'CrossTab=storage-event+reload',
  'WriteOrder=store-before-clear',
  'ImportEvidence=REPAIR_ONLY+question-provenance+idempotent',
  'VersionChange=block+system fail-closed',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));