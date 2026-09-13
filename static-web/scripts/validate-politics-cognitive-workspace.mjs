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
const page = read('src/pages/politics/[subject]/[chapter].astro');
const presentation = read('PRESENTATION_CONTRACT.md');

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

requireText(page, "subject === 'marxism'", 'route calibration');
requireText(page, "chapter === 'ch00'", 'route calibration');
requireText(page, 'PoliticsCognitiveWorkspace', 'route calibration');
requireText(page, 'PoliticsChapterRuntime', 'fallback runtime');

for (const rule of [
  'Primary environment: Mac landscape workspace',
  'Cognitive Stage',
  'Contextual Inspector',
  'Space expresses simultaneous relationships; state transitions express learning sequence.'
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

console.log('POLITICS_COGNITIVE_WORKSPACE_PASS');
console.log(JSON.stringify({
  chapter: chapter.title,
  semanticUnits: semanticUnits.length,
  states: ['ORIENT', 'EXTERNAL_LEARN', 'RECALL', 'VERIFY', 'REPAIR', 'CLOSE'],
  surface: 'MAC_LANDSCAPE_COGNITIVE_WORKSPACE'
}, null, 2));
