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
const readable = read('src/components/PoliticsCognitiveWorkspaceReadable.astro');
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

// Golden calibration keeps diagrams only where they reduce cognitive cost.
// S01 may keep a simple converging chain; S02 proves the text-default path.
for (const visualRule of [
  'directReasoningWorkspace',
  'goldenGraph',
  'goldenizeMap(panel)',
  '章地图 +',
  '.relationStrip',
  "inspectorTitle.textContent = '容易混'",
  '.workspaceState{display:none}',
  '.suyiNote{display:none!important}'
]) requireText(bridge, visualRule, 'golden workspace shell');

for (const readableRule of [
  'readability wins over diagram density',
  'TEXT_DEFAULT',
  'textFirstMap',
  'readableConcepts',
  'readableConcept',
  'readableRelations',
  '这几个特征怎么联系',
  '人民性、实践性、发展性',
  '集中体现马克思主义的革命性',
  'font-size:19px',
  'font-size:16px'
]) requireText(readable, readableRule, 'purpose-first readable layer');

for (const forbiddenProjection of [
  'buildDirectReasoningFlow',
  'directReasoningColumn',
  'EDGE_DERIVED_LANDSCAPE_FLOW'
]) {
  if (bridge.includes(forbiddenProjection)) fail(`projection still coerces Map into generic flow: ${forbiddenProjection}`);
}

if (bridge.includes('.chapterContext{display:none}')) fail('chapter context was hidden instead of kept as compact map entry');
if (bridge.includes('demoteRelationChain')) fail('required relation chain was mechanically folded');

requireText(page, "subject === 'marxism'", 'route calibration');
requireText(page, "chapter === 'ch00'", 'route calibration');
requireText(page, 'PoliticsCognitiveWorkspace', 'route calibration');
requireText(page, 'PoliticsCognitiveWorkspaceReadable', 'route calibration');
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
  fail('C00 S02 must preserve two distinct framework maps in Current even when UI renders them as readable text');
}

const valueMap = (s02.raw.learning_semantics.framework_maps || []).find((map) => map.id === 'MARX-C00-S02-MAP-VALUE-01');
if (!valueMap) fail('C00 S02 contemporary-value map missing');
const valueEdges = valueMap.edges || [];
if (valueEdges.length !== 3 || !valueEdges.every((edge) => edge.from === 'contemporary_value')) {
  fail('C00 S02 contemporary-value hub semantics changed');
}

console.log('POLITICS_COGNITIVE_WORKSPACE_PASS');
console.log(JSON.stringify({
  chapter: chapter.title,
  semanticUnits: semanticUnits.length,
  states: ['ORIENT', 'EXTERNAL_LEARN', 'RECALL', 'VERIFY', 'REPAIR', 'CLOSE'],
  scoreFirstFastPath: 'EXTERNAL_LEARN -> VERIFY; RECALL optional',
  representationRule: 'PURPOSE_FIRST_TEXT_DEFAULT_VISUAL_ONLY_WHEN_CLEARER',
  s01: 'SIMPLE_SPATIAL_CHAIN_WHEN_IT_REDUCES_RECONSTRUCTION_COST',
  s02: 'LARGE_TYPE_STRUCTURED_TEXT_PLUS_EXPLICIT_RELATION_SENTENCES',
  secondaryDepth: 'REQUIRED_RELATION_CHAIN_VISIBLE_LOWER_WEIGHT',
  chapterContext: 'COMPACT_OPTIONAL_ENTRY',
  surface: 'MAC_LANDSCAPE_COGNITIVE_WORKSPACE'
}, null, 2));
