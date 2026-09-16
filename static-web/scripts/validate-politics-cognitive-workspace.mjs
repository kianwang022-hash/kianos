import fs from 'node:fs';
import path from 'node:path';
import { loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';

const cwd = process.cwd();
const read = (relative) => fs.readFileSync(path.join(cwd, relative), 'utf8');
const fail = (message) => {
  console.error(`POLITICS_COGNITIVE_WORKSPACE_FAIL: ${message}`);
  process.exit(1);
};
const requireText = (text, needle, label) => {
  if (!text.includes(needle)) fail(`${label} missing ${needle}`);
};

const component = read('src/components/PoliticsCognitiveWorkspace.astro');
const bridge = read('src/components/PoliticsCognitiveWorkspaceBridge.astro');
const page = read('src/pages/politics/[subject]/[chapter].astro');
const presentation = read('PRESENTATION_CONTRACT.md');
const learning = read('../content/politics/LEARNING_CONTRACT.md');

for (const marker of [
  'data-politics-cognitive-workspace',
  'data-cognitive-stage',
  'data-contextual-inspector',
  'data-stage="ORIENT"',
  'data-stage="EXTERNAL_LEARN"',
  'data-stage="RECALL"',
  'data-stage="VERIFY"',
  'data-stage="CLOSE"',
  "state === 'REPAIR'",
  '去 iPad / MarginNote 学乘风',
  'data-politics-question',
  'data-politics-submit',
  'data-politics-repair',
  'data-politics-quiz'
]) requireText(component, marker, 'workspace component');

for (const semanticKey of [
  'framework_maps',
  'framework_map',
  'relation_chains',
  'boundaries',
  'anchors',
  'precision_objects',
  'source_handoff',
  'recall_seed'
]) requireText(component, semanticKey, 'workspace semantic projection');

if (component.includes('node.text') || component.includes('sourceNodes.map((node) => node.text')) {
  fail('workspace reintroduced continuous Chengfeng source text');
}

for (const scoreRule of [
  'Help Kian reach a reliable 70+ Politics score',
  'expected exam points gained or protected',
  'No mandatory ritual'
]) requireText(learning, scoreRule, 'Politics score-first learning contract');

for (const fastPath of [
  'learn-fastpath',
  '直接进入肖1000 →',
  '20 秒闭卷收口（可选）',
  "setWorkspaceState(unit, 'RECALL')",
  "setWorkspaceState(unit, 'VERIFY')"
]) requireText(bridge, fastPath, 'score-first workspace bridge');

// Golden-page calibration: first glance is a spatial graph, required reasoning
// remains visible below it, chapter context is reachable but compact, and the
// inspector is reserved for discrimination rather than repeating the stage.
for (const visualRule of [
  'directReasoningWorkspace',
  'goldenGraph',
  'goldenGraphColumn',
  'goldenNode',
  'goldenizeMap(panel)',
  "deck.querySelector('.mapTabs')?.remove()",
  'panel.hidden = false',
  '章地图 +',
  '.relationStrip',
  "inspectorTitle.textContent = '容易混'",
  '.workspaceState{display:none}',
  '.suyiNote{display:none!important}'
]) requireText(bridge, visualRule, 'golden topology workspace');

for (const forbiddenProjection of [
  'buildDirectReasoningFlow',
  'directReasoningColumn',
  'EDGE_DERIVED_LANDSCAPE_FLOW'
]) {
  if (bridge.includes(forbiddenProjection)) fail(`projection still coerces Map into generic flow: ${forbiddenProjection}`);
}

// Do not regress to the previous blanket rules that hid the chapter context or
// mechanically folded every relation chain regardless of its learning role.
if (bridge.includes('.chapterContext{display:none}')) fail('chapter context was hidden instead of kept as compact map entry');
if (bridge.includes('demoteRelationChain')) fail('required relation chain was mechanically folded');

requireText(page, "subject === 'marxism'", 'route calibration');
requireText(page, "chapter === 'ch00'", 'route calibration');
requireText(page, 'PoliticsCognitiveWorkspace', 'route calibration');
requireText(page, 'PoliticsChapterRuntime', 'fallback runtime');

for (const rule of [
  'Primary environment: Mac landscape workspace',
  'Cognitive Stage',
  'Contextual Inspector',
  'Space expresses simultaneous relationships; state transitions express learning sequence.',
  'cards/borders should represent a real interaction or semantic boundary',
  'comfortable readable type'
]) requireText(presentation, rule, 'presentation contract');

const chapter = loadPoliticsChapterCurrent('marxism', 'ch00');
if (!chapter?.units?.length) fail('Marxism C00 has no runtime units');
const semanticUnits = chapter.units.filter((unit) => unit?.raw?.learning_semantics?.schema === 'kianos.politics.learning_semantics.v1');
if (semanticUnits.length !== 2) fail(`expected 2 calibrated C00 semantic units, got ${semanticUnits.length}`);

for (const unit of semanticUnits) {
  const semantics = unit.raw.learning_semantics;
  if (semantics?.source_handoff?.target_surface !== 'IPAD_MARGINNOTE_ORIGINAL_CHENGFENG') {
    fail(`${unit.unitId} source handoff is not iPad/MarginNote Chengfeng`);
  }
  const maps = Array.isArray(semantics.framework_maps)
    ? semantics.framework_maps
    : semantics.framework_map ? [semantics.framework_map] : [];
  if (!maps.length) fail(`${unit.unitId} has no framework map`);
  if (!semantics?.problem?.text) fail(`${unit.unitId} has no learner problem`);
  if (!semantics?.recall_seed?.prompt) fail(`${unit.unitId} has no recall seed`);
}

const s02 = semanticUnits.find((unit) => unit.unitId === 'POL27-CF-MARX-C00-S02');
if (!s02) fail('C00 S02 calibration unit missing');
if ((s02.raw.learning_semantics.framework_maps || []).length !== 2) {
  fail('C00 S02 must preserve two distinct framework maps');
}

const valueMap = (s02.raw.learning_semantics.framework_maps || []).find((map) => map.id === 'MARX-C00-S02-MAP-VALUE-01');
if (!valueMap) fail('C00 S02 contemporary-value map missing');
const valueEdges = valueMap.edges || [];
if (valueEdges.length !== 3 || !valueEdges.every((edge) => edge.from === 'contemporary_value')) {
  fail('C00 S02 contemporary-value hub topology changed');
}

console.log('POLITICS_COGNITIVE_WORKSPACE_PASS');
console.log(JSON.stringify({
  chapter: chapter.title,
  semanticUnits: semanticUnits.length,
  states: ['ORIENT', 'EXTERNAL_LEARN', 'RECALL', 'VERIFY', 'REPAIR', 'CLOSE'],
  scoreFirstFastPath: 'EXTERNAL_LEARN -> VERIFY; RECALL optional',
  primaryReasoning: 'SPATIAL_TOPOLOGY_FIRST',
  mapProjection: 'TOPOLOGY_PRESERVED_GOLDEN_GRAPH',
  secondaryDepth: 'REQUIRED_RELATION_CHAIN_VISIBLE_LOWER_WEIGHT',
  chapterContext: 'COMPACT_OPTIONAL_ENTRY',
  surface: 'MAC_LANDSCAPE_COGNITIVE_WORKSPACE'
}, null, 2));
