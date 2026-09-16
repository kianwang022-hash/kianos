import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const learnerRoot = path.join(repoRoot, 'content/xizong/knowledge/learner');
const rootPath = path.join(learnerRoot, 'c-hematology-immunity-infection-learning-candidate.json');
const write = process.argv.includes('--write');

const receiptNames = [
  'C_PHASE3_LOGIC_GROUP_REACCEPTANCE.md',
  'C_PHASE3B_LOGIC_GROUPS_H07_H11.md',
  'C_PHASE3C_LOGIC_GROUPS_H12_H14.md',
  'C_PHASE3D_LOGIC_GROUPS_H15_H19.md',
  'C_PHASE3E_LOGIC_GROUPS_H20_H27.md'
];

function fail(message) {
  throw new Error(`C_PHASE6_REPAIR_FAIL:${message}`);
}
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
function extractField(body, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = body.match(new RegExp(`^- \\*\\*${escaped}:\\*\\*\\s*(.+)$`, 'm'));
  return match?.[1]?.trim() || '';
}
function extractContracts(markdown, sourceName, map) {
  const source = `${markdown}\n# H99 EOF\n`;
  const re = /^##\s+(C-H\d{2}-LG\d{2})[｜|].*\n([\s\S]*?)(?=^##\s+C-H\d{2}-LG\d{2}[｜|]|^#\s+H\d+\b)/gm;
  for (const match of source.matchAll(re)) {
    const anchor = match[1];
    const body = match[2];
    const contract = {
      goal: extractField(body, 'Goal'),
      closure: extractField(body, 'Closure'),
      continuity_rationale: extractField(body, 'Continuity rationale'),
      source: sourceName
    };
    if (!contract.goal || !contract.closure || !contract.continuity_rationale) {
      fail(`incomplete-receipt-contract:${anchor}:${sourceName}`);
    }
    if (map.has(anchor)) fail(`duplicate-receipt-anchor:${anchor}`);
    map.set(anchor, contract);
  }
}

const root = readJson(rootPath);
if (root.status !== 'FREEZE_CANDIDATE') fail(`unexpected-root-status:${root.status}`);
if (root.acceptance?.independence !== 'SELF' || root.acceptance?.L_pass_claimed !== false) {
  fail('premature-acceptance-state');
}

// A prior in-flight CI run can have written the old Phase6A status after the fresh auditor
// had already repaired the source-handoff contract. Detect the semantic repair itself so a
// stale status flag cannot erase or hide fresh-audit truth on the next deterministic run.
const freshAuditContractPresent =
  root.surface_handoff_contract?.source_contact_unit === 'BLOCK_OR_CANONICAL_SOURCE_UNIT' &&
  root.surface_handoff_contract?.logic_group_role === 'RETRIEVAL_AND_LOCAL_CLOSURE_UNIT_NOT_AUTOMATIC_SOURCE_CHUNK' &&
  root.surface_handoff_contract?.lg_source_reentry_default === false &&
  root.acceptance?.fresh_audit_repair?.status === 'REPAIRED_AWAIT_REAUDIT';
const freshAuditRepairActive = root.construction_status === 'FRESH_AUDIT_REPAIRED_AWAIT_REAUDIT' || freshAuditContractPresent;
if (freshAuditRepairActive) {
  if (root.surface_handoff_contract?.source_contact_unit !== 'BLOCK_OR_CANONICAL_SOURCE_UNIT') fail('fresh-source-contact-unit-lost');
  if (root.surface_handoff_contract?.lg_source_reentry_default !== false) fail('fresh-lg-bounce-guard-lost');
  root.construction_status = 'FRESH_AUDIT_REPAIRED_AWAIT_REAUDIT';
}

const contracts = new Map();
for (const name of receiptNames) {
  const receiptPath = path.join(learnerRoot, name);
  if (!fs.existsSync(receiptPath)) fail(`missing-receipt:${name}`);
  extractContracts(fs.readFileSync(receiptPath, 'utf8'), name, contracts);
}
if (contracts.size !== 133) fail(`receipt-contract-count:${contracts.size}`);

let groupCount = 0;
for (const relativePath of root.storage?.shards || []) {
  const shardPath = path.join(learnerRoot, relativePath);
  const shard = readJson(shardPath);
  for (const block of Object.values(shard.blocks || {})) {
    for (const group of Object.values(block.logic_groups || {})) {
      const contract = contracts.get(group.receipt_anchor);
      if (!contract) fail(`missing-contract:${group.receipt_anchor}`);
      group.goal = contract.goal;
      group.closure = contract.closure;
      group.continuity_rationale = contract.continuity_rationale;
      groupCount += 1;
    }
  }

  if (shard.blocks?.['hematology-h10']) {
    const readiness = shard.blocks['hematology-h10'].readiness;
    readiness.requires = [...new Set([...(readiness.requires || []), 'hematology-h09'])];
    readiness.benefits_from = (readiness.benefits_from || []).filter((item) => item !== 'hematology-h09');
  }
  if (shard.blocks?.['hematology-h23']) {
    const readiness = shard.blocks['hematology-h23'].readiness;
    readiness.requires = [...new Set([...(readiness.requires || []), 'external:digestive-d12'])];
  }
  if (shard.blocks?.['hematology-h24']) {
    const readiness = shard.blocks['hematology-h24'].readiness;
    readiness.requires = [...new Set([...(readiness.requires || []), 'hematology-h21'])];
    readiness.benefits_from = (readiness.benefits_from || []).filter((item) => item !== 'hematology-h21');
  }
  if (write) writeJson(shardPath, shard);
}
if (groupCount !== 133) fail(`candidate-group-count:${groupCount}`);

root.machine_semantics.group_contract_required_fields = [
  'kp_members',
  'label',
  'jobs',
  'goal',
  'closure',
  'continuity_rationale',
  'receipt_anchor'
];
root.machine_semantics.jobs_compose = 'Group-specific goal/closure/continuity_rationale are authoritative. Generic job contracts describe reusable cognitive operators only and may not substitute for a local Logic-Group closure.';

if (!freshAuditRepairActive) {
  root.construction_status = 'PHASE6A_SELF_ADVERSARIAL_REPAIRED_AWAIT_FRESH_AUDITOR';
  root.acceptance.self_adversarial_phase6a = {
    status: 'REPAIRED_RED_POINTS_AWAIT_FRESH_AUDITOR',
    premodel: 'content/xizong/knowledge/learner/C_PHASE6A_FRESH_STYLE_PREMODEL.md',
    repairs: [
      'RESTORE_EXPLICIT_GROUP_SPECIFIC_GOAL_CLOSURE_CONTINUITY',
      'H10_REQUIRE_H9_TO_KEEP_ACUTE_LEUKEMIA_AS_RECALL',
      'H23_REQUIRE_DIGESTIVE_D12_TO_KEEP_TB_UC_CD_COMPARISON_AS_RECALL',
      'H24_REQUIRE_H21_TO_KEEP_TB_GRANULOMA_COMPARISON_AS_RECALL',
      'CORRECT_PHASE3E_34_GROUP_AND_CUMULATIVE_133_ACCOUNTING'
    ],
    resolved_challenge: 'H6 keeps ITP-first LG retrieval order because Block Orientation supplies the bleeding-localization coordinate before continuous Source contact and reordering the original Lecture would break Source continuity.'
  };
}
if (write) writeJson(rootPath, root);

const phase3ePath = path.join(learnerRoot, 'C_PHASE3E_LOGIC_GROUPS_H20_H27.md');
let phase3e = fs.readFileSync(phase3ePath, 'utf8');
phase3e = phase3e
  .replace('Scope: **8 Blocks, 106 stable KPs, 35 Logic Groups**', 'Scope: **8 Blocks, 106 stable KPs, 34 Logic Groups**')
  .replace('Cumulative Phase-3: **27 / 27 Blocks, 423 / 423 KPs, 134 Logic Groups**', 'Cumulative Phase-3: **27 / 27 Blocks, 423 / 423 KPs, 133 Logic Groups**');
if (write) fs.writeFileSync(phase3ePath, phase3e);

const output = {
  pass: true,
  mode: write ? 'write' : 'check-source-availability',
  fresh_audit_repair_preserved: freshAuditRepairActive,
  fresh_audit_contract_present: freshAuditContractPresent,
  group_contracts: contracts.size,
  candidate_groups: groupCount,
  readiness_repairs: ['H10<-H9', 'H23<-digestive-d12', 'H24<-H21'],
  phase3e_expected_groups: 34,
  cumulative_expected_groups: 133,
  L_pass_claimed: root.acceptance.L_pass_claimed,
  independence: root.acceptance.independence
};
console.log(JSON.stringify(output, null, 2));
