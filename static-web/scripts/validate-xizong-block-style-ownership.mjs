import fs from 'node:fs';
import path from 'node:path';

const read = (relative) => fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');
const check = (condition, code, detail = '') => {
  if (!condition) throw new Error(`XIZONG_BLOCK_STYLE_OWNER:${code}${detail ? `:${detail}` : ''}`);
  console.log(`PASS ${code}${detail ? ` · ${detail}` : ''}`);
};
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '');

const route = read('src/pages/xizong/[system]/[block].astro');
const owner = read('src/styles/xizong-block-workspace.css');
const dense = read('src/styles/xizong-dense-calm.css');
const presentation = read('src/styles/xizong-presentation.css');
const viewport = read('src/styles/viewport-workspaces.css');
const tuning = read('src/styles/site-visual-tuning.css');
const block = read('src/components/XizongBlockV6.astro');
const cognitive = read('src/components/XizongCognitiveProjectionStage.astro');
const learner = read('src/components/XizongLearnerObjectBridge.astro');
const shell = read('src/components/XizongBlockWorkspaceShell.astro');
const enhancer = read('src/components/XizongStudyEnhancer.astro');
const typeFloor = read('src/components/XizongVisibleTypeFloor.astro');
const aux = read('src/components/XizongBlockAuxLayoutSync.astro');

check((route.match(/xizong-block-workspace\.css/g) || []).length === 1, 'route_imports_exact_owner_once');
check(block.includes('class="portedStudyRuntime portedStudyRuntimeV2 xv6Block xzBlockWorkspace"'), 'block_root_exposes_current_presentation_namespace');

for (const [name, source] of [
  ['BlockV6', block],
  ['CognitiveProjectionStage', cognitive],
  ['LearnerObjectBridge', learner],
  ['BlockWorkspaceShell', shell],
  ['StudyEnhancer', enhancer],
  ['VisibleTypeFloor', typeFloor]
]) {
  check(!/<style(?:\s|>)/i.test(source), `${name}_has_no_local_visual_owner`);
}

for (const token of [
  '.xzBlockWorkspace',
  '.portedStudyLayout',
  '.portedStudyChain',
  '.portedOutlineSectionList',
  '.xv6LogicStage',
  '.xv6BlockWorkspaceShell',
  '.xv6LearnerAuxSurface',
  '.xv6KpLearnCompanion',
  '[data-kp-recall-card]'
]) check(owner.includes(token), 'owner_contains_current_surface_family', token);

check(!/!\s*important\b/i.test(stripComments(owner)), 'owner_has_no_important_recovery');
check(owner.includes('font-size:max(15px,1em)'), 'owner_has_visible_text_floor_15');
check(owner.includes('font-size:max(16px,1em)'), 'owner_has_body_text_floor_16');

const blockFamily = /(?:\.xv6Block(?:\b|[A-Z_-])|\.portedStudy(?:Runtime|Header|ContextRow|ShellActions|Identity|IdentityMeta|Tabs|Layout|Outline|KpRail|Main|Lead|Article|StageAction|Chain)(?:\b|[A-Z_-])|\.portedOutlineSectionList\b|\.portedKp(?:Workspace|WorkspaceHeader|Cards|Card|RecallCard|Canonical)(?:\b|[A-Z_-])|\.portedRecall(?:Prompt|Answer|Rating)(?:\b|[A-Z_-])|\.portedBlock(?:Recall|Complete)(?:\b|[A-Z_-])|\.portedPrimaryAction\b|\.xv6(?:MinimalModel|Logic|Lecture|Group|VisualGate|LaterCue|Recall|Attention|PersonalDock|Learner|Kp)(?:\b|[A-Z_-])|\[data-study-stage|\[data-kp-recall-card|\[data-kp-answer)/;
const scopedBlockRule = /(?:\.surface-xizong\b|\.surfaceBody-xizong\b)[^{]*(?:\.xv6Block(?:\b|[A-Z_-])|\.portedStudy(?:Runtime|Header|ContextRow|ShellActions|Identity|IdentityMeta|Tabs|Layout|Outline|KpRail|Main|Lead|Article|StageAction|Chain)(?:\b|[A-Z_-])|\.portedOutlineSectionList\b|\.portedKp(?:Workspace|WorkspaceHeader|Cards|Card|RecallCard|Canonical)(?:\b|[A-Z_-])|\.portedRecall(?:Prompt|Answer|Rating)(?:\b|[A-Z_-])|\.portedBlock(?:Recall|Complete)(?:\b|[A-Z_-])|\.portedPrimaryAction\b|\.xv6(?:MinimalModel|Logic|Lecture|Group|VisualGate|LaterCue|Recall|Attention|PersonalDock|Learner|Kp)(?:\b|[A-Z_-])|\[data-study-stage|\[data-kp-recall-card|\[data-kp-answer)/;
for (const [name, source] of [
  ['xizong-dense-calm.css', dense],
  ['xizong-presentation.css', presentation],
  ['viewport-workspaces.css', viewport],
  ['site-visual-tuning.css', tuning]
]) {
  const clean = stripComments(source);
  check(!scopedBlockRule.test(clean), 'broad_style_has_no_xizong_scoped_block_owner', name);
  if (name === 'site-visual-tuning.css') check(!/\.xv6Block\b/.test(clean), 'site_tuning_has_no_mixed_xv6_block_owner');
}

// Cross-surface / after-Learn presentation is deliberately not pulled into this cutover.
for (const token of ['.portedStudyExtension', '.portedPrecisionShell', '.portedReviewWorkspace']) {
  check(dense.includes(token), 'after_learn_owner_preserved', token);
}
check(viewport.includes('.politicsUnitCognition') && viewport.includes('.portedVocabMeaningColumn'), 'cross_domain_viewport_rules_preserved');
check(tuning.includes('.politicsStudy') && tuning.includes('.xv6SystemShell'), 'non_block_site_tuning_preserved');

check(!aux.includes("style.setProperty('grid-template-columns'"), 'aux_sync_no_longer_writes_grid_presentation');
check(!/!\s*important\b/i.test(aux), 'aux_sync_has_no_important_recovery');
for (const token of [
  "root.addEventListener('kianos:xizong-aux-change'",
  'root.dataset.auxWeight',
  'layout.dataset.auxWeight',
  "new MutationObserver(apply).observe(layout"
]) check(aux.includes(token), 'aux_runtime_state_handoff_preserved', token);

for (const token of [
  'kianos-xizong-astro-v2:',
  'const canComplete = () =>',
  "[data-source-contact-done]",
  "[data-kp-reveal]",
  "[data-rating=",
  "[data-block-recall-complete]",
  "[data-block-complete]"
]) check(block.includes(token), 'block_runtime_contract_preserved', token);
for (const token of [
  'resolveXizongLearnerAssetRepresentation',
  'kianos:xizong-aux-change',
  'kp_recall_post_reveal'
]) check(learner.includes(token), 'learner_object_runtime_contract_preserved', token);
for (const token of [
  "root.classList.add('xv6BlockWorkspaceShell')",
  '[data-toggle-outline]',
  '[data-toggle-chain]',
  'new MutationObserver(syncStage)'
]) check(shell.includes(token), 'workspace_shell_behavior_preserved', token);
check(typeFloor.includes('data-xizong-visible-type-floor'), 'type_floor_evidence_marker_preserved');

// Make sure the broad check itself is actually capable of seeing a Block family.
check(blockFamily.test('.xv6BlockWorkspaceShell'), 'validator_block_family_sentinel');

console.log(JSON.stringify({
  pass: true,
  current_owner: 'src/styles/xizong-block-workspace.css',
  current_root: 'xzBlockWorkspace',
  local_component_style_owners: 0,
  aux_layout_handoff: 'runtime state -> data attributes -> exact CSS owner',
  visible_type_floor_px: 15,
  body_copy_floor_px: 16,
  after_learn_scope: 'preserved outside this cutover'
}, null, 2));
