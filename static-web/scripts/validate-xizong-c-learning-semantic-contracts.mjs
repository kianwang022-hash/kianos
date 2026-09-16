import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const learnerRoot = path.join(repoRoot, 'content/xizong/knowledge/learner');
const root = JSON.parse(fs.readFileSync(path.join(learnerRoot, 'c-hematology-immunity-infection-learning-candidate.json'), 'utf8'));

function fail(message) {
  throw new Error(`C_LEARNING_SEMANTIC_CONTRACT_FAIL:${message}`);
}

const requiredFields = ['kp_members','label','jobs','goal','closure','continuity_rationale','receipt_anchor'];
const declared = root.machine_semantics?.group_contract_required_fields || [];
if (requiredFields.some((field) => !declared.includes(field))) fail(`root-required-fields:${JSON.stringify(declared)}`);
if (root.acceptance?.independence !== 'SELF') fail(`independence:${root.acceptance?.independence}`);
if (root.acceptance?.L_pass_claimed !== false) fail('premature-L-pass');
if (root.projection_boundary?.status !== 'DOWNSTREAM_FROZEN_UNTIL_L_ACCEPTANCE') fail('projection-unfrozen');
if (root.construction_status !== 'FRESH_AUDIT_REPAIRED_AWAIT_REAUDIT') fail(`construction-status:${root.construction_status}`);

if (root.surface_handoff_contract?.source_contact_unit !== 'BLOCK_OR_CANONICAL_SOURCE_UNIT') fail('source-contact-unit-not-block-continuous');
if (root.surface_handoff_contract?.logic_group_role !== 'RETRIEVAL_AND_LOCAL_CLOSURE_UNIT_NOT_AUTOMATIC_SOURCE_CHUNK') fail('logic-group-promoted-to-source-chunk');
if (root.surface_handoff_contract?.lg_source_reentry_default !== false) fail('lg-source-reentry-default-must-be-false');
const handoff = (root.surface_handoff_contract?.normal_first_pass || []).join('\n');
if (!handoff.includes('continuous original Lecture contact')) fail('continuous-lecture-contact-missing');
if (!handoff.includes('without reopening Lecture by default')) fail('no-bounce-contract-missing');
const firstPass = (root.first_pass_chain || []).join('\n');
if (firstPass.includes('whole-LG original Lecture contact')) fail('stale-lg-by-lg-source-contact');
if (!firstPass.includes('continuous Block / canonical Source-unit Lecture contact')) fail('block-source-contact-chain-missing');

const blocks = new Map();
let groupCount = 0;
for (const relativePath of root.storage?.shards || []) {
  const shard = JSON.parse(fs.readFileSync(path.join(learnerRoot, relativePath), 'utf8'));
  for (const [blockId, block] of Object.entries(shard.blocks || {})) {
    blocks.set(blockId, block);
    for (const [groupId, group] of Object.entries(block.logic_groups || {})) {
      for (const field of requiredFields) {
        const value = group[field];
        if (Array.isArray(value) ? value.length === 0 : !String(value ?? '').trim()) fail(`missing-${field}:${groupId}`);
      }
      if (/can explain|能解释$/i.test(String(group.closure).trim())) fail(`generic-closure:${groupId}`);
      groupCount += 1;
    }
  }
}
if (groupCount !== 133) fail(`group-count:${groupCount}`);

function requireEdge(blockId, dependency) {
  const values = blocks.get(blockId)?.readiness?.requires || [];
  if (!values.includes(dependency)) fail(`missing-required-edge:${blockId}<-${dependency}`);
}
function rejectBenefit(blockId, dependency) {
  const values = blocks.get(blockId)?.readiness?.benefits_from || [];
  if (values.includes(dependency)) fail(`required-edge-left-soft:${blockId}<-${dependency}`);
}

// These are Current Knowledge/Core gates, not builder conveniences.
requireEdge('hematology-h10', 'hematology-h09');
rejectBenefit('hematology-h10', 'hematology-h09');
requireEdge('hematology-h14', 'hematology-h02');
requireEdge('hematology-h20', 'hematology-h12');
requireEdge('hematology-h20', 'hematology-h13');
requireEdge('hematology-h23', 'external:digestive-d12');
requireEdge('hematology-h24', 'hematology-h12');
requireEdge('hematology-h24', 'hematology-h21');
rejectBenefit('hematology-h24', 'hematology-h21');

const h6 = blocks.get('hematology-h06');
if (!String(h6?.first_pass_focus || '').includes('先判哪层止血失效')) fail('h6-orientation-lost');
if ((h6?.learner_order || [])[0] !== 'c-h06-lg01') fail('h6-source-continuity-order-unexpected');

const h24 = blocks.get('hematology-h24');
if (!String(h24?.first_pass_focus || '').includes('分别建立')) fail('h24-two-unit-orientation-lost');
if (!String(h24?.logic_groups?.['c-h24-lg05']?.continuity_rationale || '').includes('no single natural disease course') &&
    !String(h24?.logic_groups?.['c-h24-lg05']?.goal || '').includes('compress')) {
  fail('h24-false-common-course-risk');
}

const h26 = blocks.get('hematology-h26');
if (!String(h26?.stop_line || '').includes('SOFA/qSOFA')) fail('h26-modern-guideline-boundary-lost');
const h27 = blocks.get('hematology-h27');
if (!String(h27?.first_pass_focus || '').includes('两条紧急路径')) fail('h27-two-causal-movies-lost');

const phase3e = fs.readFileSync(path.join(learnerRoot, 'C_PHASE3E_LOGIC_GROUPS_H20_H27.md'), 'utf8');
if (!phase3e.includes('Scope: **8 Blocks, 106 stable KPs, 34 Logic Groups**')) fail('phase3e-group-accounting');
if (!phase3e.includes('Cumulative Phase-3: **27 / 27 Blocks, 423 / 423 KPs, 133 Logic Groups**')) fail('phase3e-cumulative-accounting');
if (/35 Logic Groups|134 Logic Groups/.test(phase3e)) fail('stale-phase3e-count');

const audit = root.acceptance?.self_adversarial_phase6a;
if (audit?.status !== 'REPAIRED_RED_POINTS_AWAIT_FRESH_AUDITOR') fail('phase6a-audit-state');
if (!String(audit?.resolved_challenge || '').includes('H6')) fail('h6-resolved-challenge-missing');
const freshRepair = root.acceptance?.fresh_audit_repair;
if (freshRepair?.status !== 'REPAIRED_AWAIT_REAUDIT') fail('fresh-repair-state');
if (!String(freshRepair?.red_point || '').includes('LG retrieval partitions')) fail('fresh-overload-red-point-missing');

console.log(JSON.stringify({
  pass: true,
  group_specific_contracts: groupCount,
  readiness_hard_edges_checked: 8,
  h6_source_continuity_challenge: 'RESOLVED',
  first_pass_source_continuity: 'BLOCK_OR_CANONICAL_SOURCE_UNIT_NO_DEFAULT_LG_BOUNCE',
  phase3e_accounting: '34 / cumulative 133',
  independence: root.acceptance.independence,
  L_pass_claimed: root.acceptance.L_pass_claimed,
  projection_status: root.projection_boundary.status
}, null, 2));
