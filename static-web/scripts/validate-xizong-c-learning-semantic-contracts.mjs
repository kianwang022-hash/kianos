import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const learnerRoot = path.join(repoRoot, 'content/xizong/knowledge/learner');
const systemRoot = path.join(repoRoot, 'content/xizong/knowledge/systems/c-hematology-immunity-infection');
const manifestPath = path.join(learnerRoot, 'c-hematology-immunity-infection-learning.json');
const candidatePath = path.join(learnerRoot, 'c-hematology-immunity-infection-learning-candidate.json');
const acceptancePath = path.join(systemRoot, 'ACCEPTANCE.md');
const freshAcceptancePath = path.join(learnerRoot, 'C_PHASE6_FRESH_L_INDEPENDENT_ACCEPTANCE.md');

function fail(message) {
  throw new Error(`C_LEARNING_SEMANTIC_CONTRACT_FAIL:${message}`);
}
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

if (!fs.existsSync(manifestPath)) fail('canonical-owner-missing');
if (fs.existsSync(candidatePath)) fail('candidate-authority-leak');
if (!fs.existsSync(acceptancePath) || !fs.existsSync(freshAcceptancePath)) fail('acceptance-evidence-missing');

const root = readJson(manifestPath);
const requiredFields = ['kp_members','label','jobs','goal','closure','continuity_rationale','receipt_anchor'];
const declared = root.machine_semantics?.group_contract_required_fields || [];
if (requiredFields.some((field) => !declared.includes(field))) fail(`root-required-fields:${JSON.stringify(declared)}`);
if (root.status !== 'CURRENT') fail(`status:${root.status}`);
if (root.authority !== 'CHAT_APPROVED_LEARNING_ACCEPTANCE') fail(`authority:${root.authority}`);
if (root.acceptance?.independence !== 'INDEPENDENT') fail(`independence:${root.acceptance?.independence}`);
if (root.acceptance?.fresh_auditor_required !== false) fail('fresh-auditor-flag-open');
if (root.acceptance?.L_pass_claimed !== true) fail('L-pass-not-accepted');
if (root.acceptance?.verdict !== 'FRESH_L_PASS_AFTER_REPAIR') fail(`verdict:${root.acceptance?.verdict}`);
if (root.acceptance?.fresh_audit_repair?.status !== 'REPAIRED_AND_REAUDITED_PASS') fail('fresh-repair-not-closed');
if (root.projection_boundary?.status !== 'ELIGIBLE_NOT_STARTED_AFTER_L_ACCEPTANCE') fail('projection-state-not-L-only');

if (root.surface_handoff_contract?.source_contact_unit !== 'BLOCK_OR_CANONICAL_SOURCE_UNIT') fail('source-contact-unit-not-block-continuous');
if (root.surface_handoff_contract?.logic_group_role !== 'RETRIEVAL_AND_LOCAL_CLOSURE_UNIT_NOT_AUTOMATIC_SOURCE_CHUNK') fail('logic-group-promoted-to-source-chunk');
if (root.surface_handoff_contract?.lg_source_reentry_default !== false) fail('lg-source-reentry-default-must-be-false');
const handoff = (root.surface_handoff_contract?.normal_first_pass || []).join('\n');
if (!handoff.includes('continuous original Lecture contact')) fail('continuous-lecture-contact-missing');
if (!handoff.includes('without reopening Lecture by default')) fail('no-bounce-contract-missing');
const firstPass = (root.first_pass_chain || []).join('\n');
if (firstPass.includes('whole-LG original Lecture contact')) fail('stale-lg-by-lg-source-contact');
if (!firstPass.includes('continuous Block / canonical Source-unit Lecture contact')) fail('block-source-contact-chain-missing');
if (!String(root.compression?.memory_admission || '').includes('canonical KP existence alone creates no permanent review debt')) fail('permanent-review-debt-regression');

const blocks = new Map();
let groupCount = 0;
for (const relativePath of root.storage?.shards || []) {
  const shard = readJson(path.join(learnerRoot, relativePath));
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

// These edges were independently challenged and then retained because Current C Core owns them.
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

// H9 must preserve evidence roles, not merely contain particular Chinese wording.
const h9 = blocks.get('hematology-h09');
const h9g3 = h9?.logic_groups?.['c-h09-lg03'];
const h9g4 = h9?.logic_groups?.['c-h09-lg04'];
if (!Array.isArray(h9g3?.kp_members) || ![10,11,12,13,19].every((ordinal) => h9g3.kp_members.includes(ordinal))) fail('h9-first-line-evidence-membership-lost');
if (!h9g3?.jobs?.includes('EVIDENCE_STACK')) fail('h9-first-line-evidence-role-lost');
if (!String(h9g3?.goal || '').includes('cytochemistry') || !String(h9g3?.goal || '').includes('NAP')) fail('h9-morph-cytochemistry-NAP-role-lost');
if (!h9g4?.jobs?.includes('EVIDENCE_STACK')) fail('h9-flow-genetic-evidence-role-lost');
if (!String(h9g4?.goal || '').includes('immunophenotype') || !String(h9g4?.goal || '').includes('cytogenetics/fusions')) fail('h9-flow-genetic-role-lost');
if (!String(h9g4?.closure || '').includes('lineage') || !String(h9g4?.closure || '').includes('subtype/prognosis')) fail('h9-layer-closure-lost');

const h11 = blocks.get('hematology-h11');
const h11Focus = String(h11?.first_pass_focus || '');
if (!h11Focus.includes('活检') || !h11Focus.includes('结构')) fail('h11-structure-first-lost');
const h11g1 = h11?.logic_groups?.['c-h11-lg01'];
if (!h11g1?.jobs?.includes('EVIDENCE_STACK') || !String(h11g1?.closure || '').includes('tissue architecture')) fail('h11-biopsy-architecture-role-lost');

// H12 boundary is semantic: bounded interfaces + explicit unsupported normal-immunology stop lines.
const h12 = blocks.get('hematology-h12');
const h12g1 = h12?.logic_groups?.['c-h12-lg01'];
const h12g4 = h12?.logic_groups?.['c-h12-lg04'];
const h12Stop = String(h12?.stop_line || '');
if (!h12Stop.includes('补体') || !h12Stop.includes('APC') || !h12Stop.includes('细胞因子') || !h12Stop.includes('淋巴细胞发育')) fail('h12-normal-immunology-boundary-lost');
if (!h12g1?.jobs?.includes('BOUNDARY_RECALL') || !h12g4?.jobs?.includes('BOUNDARY_RECALL')) fail('h12-boundary-recall-role-lost');
if (!String(h12g1?.closure || '').includes('outside Current Source')) fail('h12-minimum-language-source-boundary-lost');
if (!String(h12g4?.closure || '').includes('unsupported tolerance-loss mechanisms')) fail('h12-tolerance-gap-boundary-lost');

for (const blockId of ['hematology-h15','hematology-h16','hematology-h17','hematology-h18','hematology-h19']) {
  const text = JSON.stringify(blocks.get(blockId));
  if (!text.includes('证据') && !text.includes('抗体')) fail(`rheum-evidence-role-model-lost:${blockId}`);
}

const h21 = blocks.get('hematology-h21');
if (!String(h21?.stop_line || '').includes('不扩')) fail('h21-owner-boundary-lost');

const h24 = blocks.get('hematology-h24');
if (!String(h24?.first_pass_focus || '').includes('分别建立')) fail('h24-two-unit-orientation-lost');
const h24g5 = h24?.logic_groups?.['c-h24-lg05'];
if (!String(h24g5?.continuity_rationale || '').includes('no single natural disease course') && !String(h24g5?.goal || '').includes('compress')) fail('h24-false-common-course-risk');

const h25 = blocks.get('hematology-h25');
const h25Text = JSON.stringify(h25);
for (const token of ['压力','坏死','源控制']) if (!h25Text.includes(token)) fail(`h25-source-control-axis-lost:${token}`);

const h26 = blocks.get('hematology-h26');
if (!String(h26?.stop_line || '').includes('SOFA/qSOFA')) fail('h26-modern-guideline-boundary-lost');

const h27 = blocks.get('hematology-h27');
if (!String(h27?.first_pass_focus || '').includes('两条紧急路径')) fail('h27-two-causal-movies-lost');

const phase3e = fs.readFileSync(path.join(learnerRoot, 'C_PHASE3E_LOGIC_GROUPS_H20_H27.md'), 'utf8');
if (!phase3e.includes('Scope: **8 Blocks, 106 stable KPs, 34 Logic Groups**')) fail('phase3e-group-accounting');
if (!phase3e.includes('Cumulative Phase-3: **27 / 27 Blocks, 423 / 423 KPs, 133 Logic Groups**')) fail('phase3e-cumulative-accounting');
if (/35 Logic Groups|134 Logic Groups/.test(phase3e)) fail('stale-phase3e-count');

const acceptance = fs.readFileSync(acceptancePath, 'utf8');
const freshAcceptance = fs.readFileSync(freshAcceptancePath, 'utf8');
for (const text of [acceptance, freshAcceptance]) {
  if (!text.includes('FRESH_L_PASS_AFTER_REPAIR')) fail('fresh-verdict-evidence-missing');
}
if (!acceptance.includes('P — Projection | **NOT_STARTED / ELIGIBLE**')) fail('projection-started-or-acceptance-ambiguous');
if (!freshAcceptance.includes('mandatory LG-by-LG Source bouncing') && !freshAcceptance.includes('LG-by-LG KianOS ↔ Lecture bouncing')) fail('true-red-point-not-recorded');
if (!freshAcceptance.includes('Crosswalk remains outside this task')) fail('crosswalk-boundary-not-recorded');
if (!freshAcceptance.includes('NOT MANUFACTURED')) fail('learner-state-boundary-not-recorded');

console.log(JSON.stringify({
  pass: true,
  group_specific_contracts: groupCount,
  readiness_hard_edges_checked: 8,
  h6_source_continuity_challenge: 'RESOLVED',
  h9_evidence_roles: 'MORPH_CYTOCHEMISTRY_THEN_FLOW_GENETICS',
  h11_structure_first: 'BIOPSY_ARCHITECTURE_BEFORE_MARKERS',
  h12_source_boundary: 'MINIMUM_LANGUAGE_NO_FULL_NORMAL_IMMUNOLOGY_BACKFILL',
  first_pass_source_continuity: 'BLOCK_OR_CANONICAL_SOURCE_UNIT_NO_DEFAULT_LG_BOUNCE',
  phase3e_accounting: '34 / cumulative 133',
  verdict: root.acceptance.verdict,
  projection_status: root.projection_boundary.status,
  candidate_authority_leak: 0
}, null, 2));
