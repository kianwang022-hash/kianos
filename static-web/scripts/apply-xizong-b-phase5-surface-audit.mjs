import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generatorPath = path.join(webRoot, 'scripts', 'build-xizong-b-learning-candidate.mjs');
let text = fs.readFileSync(generatorPath, 'utf8');

if (text.includes('const surfaceHandoffContract =')) {
  throw new Error('B_PHASE5_ALREADY_APPLIED');
}

const marker = 'function fm(text, key) {';
if (!text.includes(marker)) throw new Error('B_PHASE5_INSERT_MARKER_MISSING');

const contract = `const surfaceHandoffContract = {
  primary_sequence:[
    'KianOS bounded System/Block/Logic-Group orientation and selective cue',
    'one bounded whole-Logic-Group original Lecture contact in iPad / MarginNote',
    'one normal return to KianOS after the relevant formal Lecture contact',
    'active KP retrieval in accepted learner order',
    'cognition-specific Logic Group closure',
    'Block Recall only after all Block Logic Groups close'
  ],
  normal_switching_rule:'Do not bounce KP-by-KP between KianOS and MarginNote during normal first learning. One whole-LG Lecture contact followed by one normal return is the default; extra source returns are only for learner-requested source checks, visuals or smallest-sufficient repair.',
  lecture_owns:['continuous explanation','figures and tables','source-local examples','annotation context','Lecture-attached questions'],
  kianos_owns:['orientation','current causal target','attention boundary','selective cue','active retrieval','Logic Group closure','Block/System compression','Wrong/Uncertain routing','later review'],
  chat_owns:['adaptive explanation when the model is unclear','mechanism linking','smallest-sufficient repair','personalized clarification','cross-System reasoning when needed'],
  recall_timing:{kp:'AFTER_RELEVANT_FORMAL_LECTURE_CONTACT',logic_group:'AFTER_WHOLE_LG_LECTURE_CONTACT',block:'AFTER_ALL_BLOCK_LGS_CLOSE',psr:'NATURAL_CHECKPOINT_ONLY_AND_SKIPPABLE',system:'ONLY_AFTER_ALL_38_BLOCKS_ARE_ACTUALLY_LEARNED'},
  context_visibility:{always:['what is being learned now','current mechanism / causal question','main prompt','forward/back movement'],conditional:['Precision','Visual Gate / source locator','Reserve learning','Connection Hook / Boundary','Lecture or attached-question locator'],backend_only:['readiness relations','construction_receipts','semantic_acceptance','partition_rationale','cognitive_job codes','system_truth_refs','coverage/audit/migration/status metadata']},
  repair_return:{trigger:'model unclear, learner request, or meaningful Wrong/Uncertain gap',scope:'smallest sufficient object or boundary',chat_evidence_is_mastery:false,return_rule:'after repair, return to the interrupted B mainline; do not open a whole future Block unless that Block is the accepted owner'},
  memory_interruption:{rule:'first Recall instability or Weak/Uncertain evidence may be recorded without automatically stopping the mainline indefinitely',connection_hook_memory:'Connection Hooks do not enter normal Memory before formal target-owner learning',precision_rule:'important current-owner Precision may start memory on first pass, but Precision must not become a permanent always-visible panel'}
};

const crossSystemHandoff = {
  rule:'Readiness labels are backend routing metadata. They may not become learner-facing Connection Hooks unless a formal Current target owner is named below; assumed-baseline concepts are reactivated or minimally repaired, not scheduled as invented future owners.',
  formal_target_owners:{
    circulation:'content/xizong/knowledge/systems/a1-circulation/',
    respiratory:'content/xizong/knowledge/systems/a2-respiratory/',
    urinary:'content/xizong/knowledge/systems/a3-urinary/',
    hematology_immunity_infection:'content/xizong/knowledge/systems/c-hematology-immunity-infection/',
    reproductive_breast:'content/xizong/knowledge/systems/e-reproductive-breast/',
    tumor_general:'content/xizong/knowledge/overlays/o9-tumor-general/'
  },
  explicit_routes:[
    {from:'D12',concept:'tuberculosis common model',target_owner:'content/xizong/knowledge/systems/a2-respiratory/',granularity:'SYSTEM_LEVEL_UNTIL_REVIEWED_FINER_OWNER'},
    {from:'D13',concept:'shock / hemodynamic-stability interface',target_owner:'content/xizong/knowledge/systems/a1-circulation/',granularity:'SYSTEM_LEVEL_UNTIL_REVIEWED_FINER_OWNER'},
    {from:'D17',concept:'pressure-flow / portal-hemodynamic interface',target_owner:'content/xizong/knowledge/systems/a1-circulation/',granularity:'SYSTEM_LEVEL_UNTIL_REVIEWED_FINER_OWNER'},
    {from:'D22',concept:'circulation interface',target_owner:'content/xizong/knowledge/systems/a1-circulation/',granularity:'SYSTEM_LEVEL_UNTIL_REVIEWED_FINER_OWNER'},
    {from:'D22,D23',concept:'renal / volume / VitD-CKD interface',target_owner:'content/xizong/knowledge/systems/a3-urinary/',granularity:'SYSTEM_LEVEL_UNTIL_REVIEWED_FINER_OWNER'},
    {from:'D4,M3,M8,M10',concept:'anemia / hemolysis / megaloblastic interface',target_owner:'content/xizong/knowledge/systems/c-hematology-immunity-infection/',granularity:'SYSTEM_LEVEL_UNTIL_REVIEWED_FINER_OWNER'},
    {from:'G5 and tumor-bearing organ Logic Groups',concept:'tumor-general morphology and behavior',target_owner:'content/xizong/knowledge/overlays/o9-tumor-general/',granularity:'OVERLAY_OWNER'},
    {from:'B endocrine exclusions',concept:'reproductive / pregnancy endocrine management',target_owner:'content/xizong/knowledge/systems/e-reproductive-breast/',granularity:'SYSTEM_LEVEL_UNTIL_REVIEWED_FINER_OWNER'}
  ],
  assumed_baseline:[
    {concept:'membrane / electrical / common signal-transduction language',learner_behavior:'reactivate if already learned; otherwise Chat smallest-sufficient repair; do not create a deferred owner, mastery gate or Memory debt'},
    {concept:'general injury / inflammation / repair-fibrosis language',learner_behavior:'reactivate if already learned; otherwise Chat smallest-sufficient repair; do not invent a Block/KP owner or future learner schedule'}
  ],
  fine_grain_rule:'When a finer reviewed external Block/KP owner is absent, the System/Overlay target above is the maximum routing precision allowed. Runtime/Projection must not infer a finer mapping from titles, proximity or model intuition.',
  connection_hook_rule:'A learner-facing deferred Connection Hook requires one formal target owner and must be re-surfaced when that owner is entered. Assumed-baseline concepts are not Connection Hooks and create no future review debt.'
};

`;
text = text.replace(marker, contract + marker);

const replacements = [
  ["construction_status:'PHASE4_COMPRESSION_CLOSED_PENDING_CROSS_SURFACE_AUDIT'", "construction_status:'PHASE5_CROSS_SURFACE_CLOSED_PENDING_INDEPENDENT_L_ACCEPTANCE'"],
  ["authority:'CURRENT_PHASE0_4_COMPILED_LEARNING_CONSTRUCTION'", "authority:'CURRENT_PHASE0_5_COMPILED_LEARNING_CONSTRUCTION'"],
  ["'content/xizong/knowledge/learner/B_PHASE4_PROGRESSIVE_COMPRESSION.md']", "'content/xizong/knowledge/learner/B_PHASE4_PROGRESSIVE_COMPRESSION.md','content/xizong/knowledge/learner/B_PHASE5_CROSS_SURFACE_NEGATIVE_SPACE.md']"],
  ["  first_pass_chain:", "  surface_handoff_contract:surfaceHandoffContract,\n  cross_system_handoff:crossSystemHandoff,\n  first_pass_chain:"],
  ["extra_compulsory_hierarchy_required:false,note:'This is still not L PASS. Cross-surface/negative-space audit and fresh independent L acceptance remain downstream.'", "extra_compulsory_hierarchy_required:false,phase5_status:'PASS_BY_CROSS_SURFACE_NEGATIVE_SPACE_AUDIT',cross_surface_audit:{surface_ownership:'PASS',whole_lg_handoff:'PASS',conditional_context_visibility:'PASS',backend_metadata_visibility:'BACKEND_ONLY',chat_repair_return:'PASS',cross_system_owner_routing:'SYSTEM_LEVEL_FAIL_CLOSED_FINE_GRAIN'},negative_space_violations_remaining:0,note:'This is still not L PASS. Fresh independent L acceptance remains downstream.'"],
  ["console.log(`B Learning Phase-4 compression candidate built", "console.log(`B Learning Phase-5 surface-safe candidate built"]
];

for (const [from,to] of replacements) {
  if (!text.includes(from)) throw new Error(`B_PHASE5_REPLACEMENT_MISSING:${from.slice(0,80)}`);
  text = text.replace(from,to);
}

fs.writeFileSync(generatorPath, text, 'utf8');
console.log('B Phase 5 surface / negative-space contract applied to generator');
