import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');
const readText = (relative) => fs.readFileSync(path.join(repoRoot, relative), 'utf8');
const readJson = (relative) => JSON.parse(readText(relative));
const sha256File = (relative) => crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(repoRoot, relative)))
  .digest('hex');

const lexicalManifest = readJson('content/lexical/manifest.json');
const finalConfig = lexicalManifest.final_learner_object || {};
assert.equal(finalConfig.builder, 'tools/lexical_build_final_learner_objects.py');
assert.equal(finalConfig.overrides, 'content/lexical/learner/final/overrides.json');
assert.equal(finalConfig.materialized_manifest, 'content/lexical/learner/final/manifest.json');
assert.equal(lexicalManifest.runtime_contract?.astro_reads_current_natural_owners, false);
assert.equal(lexicalManifest.runtime_contract?.astro_reads_final_learner_objects, true);

const finalManifest = readJson(finalConfig.materialized_manifest);
assert.equal(finalManifest.schema, 'kianos.lexical.final_learner_manifest.v1');
assert.equal(finalManifest.status, 'CURRENT_DERIVED_LEARNER_OBJECT');
assert.equal(finalManifest.semantic_authority, false);
assert.equal(finalManifest.builder, finalConfig.builder);
assert.equal(finalManifest.overrides, finalConfig.overrides);
assert.equal(finalManifest.object_count, 7946);

const overrides = readJson(finalConfig.overrides);
assert.equal(overrides.schema, 'kianos.lexical.final_learner_overrides.v1');
assert.match(String(overrides.rule || ''), /No heuristic suppression/);
assert.deepEqual(
  overrides.words?.['word:abstract']?.suppress_sense_usage_note_ids,
  ['sense:abstract:b7b8b05117f3527c', 'sense:abstract:d665d4c15aae5ea2']
);
assert.equal(overrides.words?.['word:abstract']?.suppress_form_boundary, true);
assert.deepEqual(overrides.words?.['word:abstract']?.suppress_form_variant_fields, ['stress']);

const builder = readText(finalConfig.builder);
for (const [label, pattern] of [
  ['free-text form-note classifier', /noteIsFormOnly/],
  ['priority learner filter', /learning_value_score|\bpriority\b/],
  ['publication learner filter', /publication_status/],
  ['verification learner filter', /verification_status/],
  ['stress-text inference', /if\s+["']stress["']\s+in\s+/i],
  ['pronunciation-text inference', /if\s+["']pronunciation["']\s+in\s+/i]
]) {
  assert.doesNotMatch(builder, pattern, `canonical Final Object materializer must not contain ${label}`);
}
assert.match(builder, /suppress_sense_usage_note_ids/);
assert.match(builder, /suppress_form_boundary/);
assert.match(builder, /suppress_form_variant_fields/);

const forbiddenFinalKeys = new Set([
  'verification_status',
  'publication_status',
  'presentation_merge',
  'learning_value_score',
  'priority',
  'tier',
  'relation_refs',
  'lookup_refs',
  'processing_status',
  'needs_delta_review',
  'verification_summary',
  'review_signature'
]);

function assertNoGovernanceLeak(value, trail = 'final') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoGovernanceLeak(item, `${trail}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert.equal(forbiddenFinalKeys.has(key), false, `Final Object governance leak: ${trail}.${key}`);
    assertNoGovernanceLeak(child, `${trail}.${key}`);
  }
}

const objects = new Map();
let count = 0;
let expectedOrdinal = 1;
for (const shard of finalManifest.shards || []) {
  assert.equal(sha256File(shard.path), shard.sha256, `Final Object shard hash drift: ${shard.path}`);
  const rows = readJson(shard.path);
  assert.ok(Array.isArray(rows), `Final Object shard must be an array: ${shard.path}`);
  for (const object of rows) {
    assert.equal(object.schema, 'kianos.lexical.final_learner_object.v1');
    assert.equal(object.ordinal, expectedOrdinal, `Final Object ordinal discontinuity at ${expectedOrdinal}`);
    assert.ok(object.word_id && object.word);
    assert.ok(object.word_feel && Array.isArray(object.senses) && Array.isArray(object.secondary_senses));
    assert.ok(Array.isArray(object.constructions));
    assert.ok(object.reference && Array.isArray(object.reference.confusables) && Array.isArray(object.reference.relations));
    assert.ok(Array.isArray(object.reference.family));
    assert.ok(object.recall_map && Array.isArray(object.recall_map.parts));
    assertNoGovernanceLeak(object);
    if ([19, 96, 209, 4248].includes(object.ordinal)) objects.set(object.ordinal, object);
    count += 1;
    expectedOrdinal += 1;
  }
}
assert.equal(count, 7946);
assert.equal(expectedOrdinal, 7947);

const abstract = objects.get(19);
assert.equal(abstract.word, 'abstract');
assert.equal(abstract.word_feel.summary_cn,
  '把具体细节拿开，只保留概念或关键信息；名词还表示论文/文章的摘要');
assert.equal(abstract.word_feel.decision_cn,
  'adj = 从具体实例抽离；noun = 把论文压成摘要；verb = 从材料中抽取/抽象出。');
const abstractNotes = Object.fromEntries(abstract.senses.map((sense) => [sense.id, sense.note || '']));
assert.equal(abstractNotes['sense:abstract:b7b8b05117f3527c'], '');
assert.equal(abstractNotes['sense:abstract:d665d4c15aae5ea2'], '');
assert.equal(abstractNotes['sense:abstract:77cac107d5a45df4'],
  'High-value academic noun: read/write/submit an abstract.');
assert.equal(abstractNotes['sense:abstract:101ad1c99ab15f03'],
  'Lower-frequency verb use; do not confuse it with the much more common noun abstract.');
assert.equal(abstract.reference.form?.boundary, '');
assert.deepEqual(
  abstract.reference.form?.variants?.map((variant) => ({
    pos: variant.pos,
    reading: variant.reading,
    ipa: variant.ipa,
    hasStress: Object.hasOwn(variant, 'stress')
  })),
  [
    { pos: ['adjective', 'noun'], reading: 'AB-stract', ipa: '/ˈæb.strækt/', hasStress: false },
    { pos: ['verb'], reading: 'ab-STRACT', ipa: '/əbˈstrækt/', hasStress: false }
  ]
);

const sanction = objects.get(4248);
assert.equal(sanction.word, 'sanction');
assert.equal(
  sanction.senses.find((sense) => sense.id === 'sense:sanction:4768079655e356a5')?.note,
  'economic/trade sanctions is usually plural'
);

const answer = objects.get(209);
assert.equal(answer.word, 'answer');
assert.ok(answer.reference.relations.length >= 2);
for (const relation of answer.reference.relations) {
  assert.ok(relation.title);
  assert.ok(Array.isArray(relation.lines));
  assert.ok(Array.isArray(relation.differences));
  assert.ok(relation.repair?.target_locator);
}

const loader = readText('static-web/src/lib/lexical.mjs');
assert.match(loader, /materialized_manifest/);
assert.match(loader, /CURRENT_DERIVED_LEARNER_OBJECT/);
assert.doesNotMatch(loader, /hydrateRelations|wordOwnerPath|relation_refs/,
  'Website loader must not reconstruct learner semantics from Natural Owners');

const renderer = readText('static-web/src/components/VocabularyWordRuntime.astro');
assert.match(renderer, /const card = answer\.record \|\| \{\}/);
for (const forbidden of [
  'verification_status',
  'publication_status',
  'presentation_merge',
  'learning_value_score',
  'relation_refs',
  'core_concept',
  'semantic_neighbors',
  'word_family'
]) {
  assert.equal(renderer.includes(forbidden), false,
    `Word renderer must not consume Natural Owner/backend field: ${forbidden}`);
}
assert.match(renderer, /card\.word_feel/);
assert.match(renderer, /card\.senses/);
assert.match(renderer, /card\.secondary_senses/);
assert.match(renderer, /card\.constructions/);
assert.match(renderer, /card\.reference/);
assert.match(renderer, /card\.recall_map/);

console.log(JSON.stringify({
  status: 'PASS',
  canonical_materializer: finalConfig.builder,
  explicit_overrides: finalConfig.overrides,
  materialized_objects: count,
  website_reads_natural_owners: false,
  renderer_semantic_inference: false,
  representative_objects: {
    abstract: 'PASS',
    advocate: objects.get(96)?.word === 'advocate' ? 'PASS' : 'FAIL',
    answer_relations: answer.reference.relations.length,
    sanction: 'PASS'
  }
}, null, 2));
