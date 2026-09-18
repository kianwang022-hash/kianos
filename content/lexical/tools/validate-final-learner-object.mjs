import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileLexicalStudyObject } from './final-learner-object.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const lexicalRoot = path.resolve(here, '..');
const repoRoot = path.resolve(lexicalRoot, '../..');

const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(repoRoot, relative), 'utf8'));
const readText = (relative) => fs.readFileSync(path.join(repoRoot, relative), 'utf8');

const decisionsPath = 'content/lexical/final-learner-object-decisions.json';
const decisions = readJson(decisionsPath);
assert.equal(decisions.schema, 'kianos.lexical.final_learner_object_decisions.v1');
assert.equal(decisions.status, 'CURRENT_DERIVED_CONTENT');
assert.equal(decisions.semantic_authority, false);

const allowedDispositions = new Set(['DEFAULT_DEPTH', 'EXPLORE_ONLY']);

for (const [wordId, wordDecision] of Object.entries(decisions.words || {})) {
  assert.ok(Number.isInteger(wordDecision.ordinal) && wordDecision.ordinal > 0, `${wordId} must bind a stable ordinal`);
  const ownerPath = `content/lexical/words/by-ordinal/o${String(wordDecision.ordinal).padStart(4, '0')}.json`;
  const owner = readJson(ownerPath);
  assert.equal(owner.word_id, wordId, `${wordId} ordinal binding drift`);
  const senseIds = new Set((owner.record?.senses || []).map((sense) => String(sense?.sense_id || '')).filter(Boolean));
  for (const [senseId, decision] of Object.entries(wordDecision.sense_usage_notes || {})) {
    assert.ok(senseIds.has(senseId), `${wordId} decision points to unknown sense ${senseId}`);
    assert.ok(allowedDispositions.has(decision?.disposition), `${wordId} invalid disposition for ${senseId}`);
  }
}

const compiler = readText('content/lexical/tools/final-learner-object.mjs');
const forbiddenCompilerPatterns = [
  ['free-text helper', /noteIsFormOnly/],
  ['stress keyword inference', /includes\(['"]stress['"]\)/],
  ['syllable keyword inference', /includes\(['"]syllable['"]\)/],
  ['pronunciation keyword inference', /includes\(['"]pronunciation['"]\)/],
  ['priority threshold', /learning_value_score|priority\s*[><=]|tier\s*[><=]/]
];
for (const [label, pattern] of forbiddenCompilerPatterns) {
  assert.doesNotMatch(compiler, pattern, `Final Learner Object builder must not contain ${label}`);
}

const abstractOwner = readJson('content/lexical/words/by-ordinal/o0019.json');
const abstractDecision = decisions.words['word:abstract'];
const abstract = compileLexicalStudyObject(abstractOwner.record, abstractDecision);

const abstractNotes = Object.fromEntries((abstract.senses || []).map((sense) => [sense.sense_id, sense.usage_note || null]));
assert.equal(abstractNotes['sense:abstract:b7b8b05117f3527c'], null,
  'abstract adjective pronunciation-only note must be Explore-only by explicit Content decision');
assert.equal(abstractNotes['sense:abstract:d665d4c15aae5ea2'], null,
  'abstract verb pronunciation-only note must be Explore-only by explicit Content decision');
assert.equal(abstractNotes['sense:abstract:77cac107d5a45df4'], 'High-value academic noun: read/write/submit an abstract.',
  'non-form learner note must survive Final Object build');
assert.equal(abstractNotes['sense:abstract:101ad1c99ab15f03'], 'Lower-frequency verb use; do not confuse it with the much more common noun abstract.',
  'non-form frequency/boundary note must survive Final Object build');

assert.ok(abstract.form_identity, 'abstract must keep a structured Final Form object');
assert.equal(Object.hasOwn(abstract.form_identity, 'boundary'), false,
  'structured Final Form must not repeat prose boundary in default Depth');
for (const variant of abstract.form_identity.variants || []) {
  assert.equal(Object.hasOwn(variant, 'stress'), false,
    'structured Final Form must not repeat initial/final stress labels');
  assert.ok(Array.isArray(variant.pos) && variant.pos.length > 0, 'Final Form variant must preserve POS');
  assert.ok(variant.learner_key, 'Final Form variant must preserve learner key');
  assert.ok(variant.ipa, 'Final Form variant must preserve IPA');
}

const sanctionOwner = readJson('content/lexical/words/by-ordinal/o4248.json');
const sanction = compileLexicalStudyObject(sanctionOwner.record, decisions.words['word:sanction'] || {});
const sanctionPlural = sanction.senses.find((sense) => sense.sense_id === 'sense:sanction:4768079655e356a5');
assert.equal(sanctionPlural?.usage_note, 'economic/trade sanctions is usually plural',
  'normal learner-useful usage note must not be suppressed without an explicit Content decision');

console.log(JSON.stringify({
  status: 'PASS',
  decision_owner: decisionsPath,
  explicit_word_decisions: Object.keys(decisions.words || {}).length,
  heuristic_text_inference: false,
  abstract_form_projection: {
    note_suppressions: 2,
    variants: abstract.form_identity.variants.length,
    boundary_prose_in_default_depth: false,
    stress_labels_in_default_depth: false
  },
  sanction_usage_note_preserved: true
}, null, 2));
