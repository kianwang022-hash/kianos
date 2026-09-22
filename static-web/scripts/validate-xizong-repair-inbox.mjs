import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
const fail = (message) => { throw new Error(`XIZONG_REPAIR_INBOX_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

const repairReturn = read('static-web/src/components/XizongSystemRepairReturn.astro');
const systemWuReturn = read('static-web/src/lib/xizongSystemWuReturn.mjs');
const memoryWorkspace = read('static-web/src/components/XizongMemoryWorkspace.astro');
const memoryModel = read('static-web/src/lib/xizongMemoryModel.mjs');
const bridge = read('static-web/src/components/XizongRepairInboxBridge.astro');
const blockGuard = read('static-web/src/components/XizongBlockEvidenceGuard.astro');
const systemGuard = read('static-web/src/components/XizongSystemEvidenceGuard.astro');
const blockPage = read('static-web/src/pages/xizong/[system]/[block].astro');

assert(systemWuReturn.includes("inboxKey:'kianos-xizong-repair-inbox-v1:xizong:'"), 'system-return-does-not-write-inbox');
assert(!repairReturn.includes('kianos-xizong-memory-review-v2:${objectId}'), 'system-return-still-writes-block-evidence-store');
assert(systemWuReturn.includes('sourceQuestionIds:[...new Set(item.questionIds)]'), 'repair-inbox-loses-question-provenance');
assert(systemWuReturn.includes('!relation?.blockId || !relation?.primaryKpId || !route'), 'repair-inbox-route-not-reviewed-only');
assert(systemWuReturn.includes('XIZONG_MEMORY_STORAGE_KEY'), 'system-return-does-not-update-current-memory-repair');
assert(systemWuReturn.includes('setRepairTasks'), 'system-return-does-not-create-visible-repair-task');
assert(systemWuReturn.includes("origin:'SYSTEM_WU_CHAT_RETURN'"), 'visible-repair-origin-missing');
assert(repairReturn.includes('systemId,'), 'visible-repair-system-identity-missing');
assert(memoryModel.includes('systemId: text(task?.systemId'), 'repair-model-drops-system-identity');
assert(memoryWorkspace.includes('data-repair-complete'), 'memory-repair-cannot-be-completed');
assert(memoryWorkspace.includes('data-repair-block-link'), 'memory-repair-loses-block-return');
assert(memoryWorkspace.includes('data-repair-return-link'), 'memory-repair-loses-question-return');
assert(memoryModel.includes('export function completeRepairTask'), 'repair-completion-not-durable');

assert(blockPage.includes('<XizongRepairInboxBridge block={projection} />'), 'repair-inbox-bridge-not-mounted');
assert(bridge.includes('kianos-xizong-repair-inbox-v1:'), 'bridge-does-not-read-inbox');
assert(bridge.includes('XIZONG_MEMORY_STORAGE_KEY') && bridge.includes('setRepairTasks'), 'bridge-does-not-merge-current-memory-repair');
assert(bridge.includes("origin = blockChat ? 'BLOCK_CHAT_RETURN'"), 'bridge-import-origin-missing');
assert(bridge.includes('const next = setRepairTasks(memory, [...preserved, ...incoming]);'), 'bridge-import-promoted-beyond-repair');
assert(bridge.includes('sourceQuestionIds,'), 'bridge-import-loses-question-provenance');
assert(bridge.includes('if (!kpId || !allowed.has(kpId)) return null;'), 'bridge-does-not-scope-plan-to-current-block');
assert(bridge.includes("window.addEventListener('storage'"), 'open-block-tab-cannot-receive-inbox');
assert(bridge.includes("window.dispatchEvent(new CustomEvent('kianos:xizong-repair-inbox-migrated'"), 'bridge-does-not-announce-migrated-state');
assert(bridge.includes('const incomingIds = new Set(incoming.map((task) => task.id));'), 'bridge-import-not-idempotent-by-task-id');

const writeIndex = bridge.indexOf("if (!writeJson(XIZONG_MEMORY_STORAGE_KEY, next)) throw new Error('Repair save failed');");
const clearIndex = bridge.lastIndexOf('localStorage.removeItem(inboxKey)');
assert(writeIndex >= 0 && clearIndex > writeIndex, 'bridge-clears-inbox-before-evidence-write');

assert(blockGuard.includes('repair_inbox: oldRepairInbox'), 'block-version-archive-omits-pending-inbox');
assert(blockGuard.includes('localStorage.removeItem(repairInboxKey)'), 'block-version-change-does-not-invalidate-inbox');
assert(systemGuard.includes('stale_block_repair_inboxes'), 'system-version-archive-omits-pending-inbox');
assert(systemGuard.includes('localStorage.removeItem(inboxKey)'), 'system-version-change-does-not-invalidate-inbox');

console.log([
  'Xizong repair inbox contract PASS',
  'SystemReturn=inbox+visible-memory-repair',
  'BlockConsume=atomic+current-KP-scoped',
  'CrossTab=storage-event+reload',
  'WriteOrder=store-before-clear',
  'ImportEvidence=REPAIR_ONLY+question-provenance+idempotent',
  'VisibleRepair=block-return+question-return+durable-completion',
  'VersionChange=block+system fail-closed',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));