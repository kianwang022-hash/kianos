import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listLexicalOrdinals, loadLexicalWordByOrdinal } from '../src/lib/lexical.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const studyRuntimeSource = fs.readFileSync(path.resolve(here, '../src/components/VocabularyWordRuntime.astro'), 'utf8');
const counts = {
  owners: 0,
  rendered_core_targets: 0,
  rendered_senses: 0,
  rendered_fixed_collocations: 0,
  rendered_secondary_senses: 0,
  rendered_constructions: 0,
  rendered_relations: 0,
  rendered_form_identity_targets: 0,
  locator_only_rendered_targets: 0,
  core_objects: 0,
  identity_overlays: 0,
  nonfixed_collocations: 0,
  phraseology_assets: 0,
  word_family_assets: 0,
  exam_paraphrase_assets: 0
};
const unresolved = [];
const examples = {
  identity_overlays: [],
  nonfixed_collocations: [],
  phraseology_assets: [],
  word_family_assets: [],
  exam_paraphrase_assets: []
};
const remember = (key, ordinal, word, detail = '') => {
  if (examples[key].length < 8) examples[key].push({ ordinal, word, detail });
};
const requireLocatorRevision = (answer, ordinal, word, kind, locator) => {
  counts.locator_only_rendered_targets += 1;
  if (!answer.sourceHash) unresolved.push({ ordinal, word, kind, locator });
};

for (const ordinal of listLexicalOrdinals()) {
  const answer = loadLexicalWordByOrdinal(ordinal);
  const card = answer.record || {};
  const word = String(card.word || answer.word || '');
  counts.owners += 1;

  if (card.core_concept && typeof card.core_concept === 'object') {
    counts.core_objects += 1;
    counts.rendered_core_targets += 1;
    requireLocatorRevision(answer, ordinal, word, 'core', 'record.core_concept');
  }

  const senses = Array.isArray(card.senses) ? card.senses : [];
  const activeSenseIds = new Set(senses.map((sense) => String(sense?.sense_id || '')).filter(Boolean));
  senses.forEach((sense, senseIndex) => {
    counts.rendered_senses += 1;
    if (!sense?.sense_id) requireLocatorRevision(answer, ordinal, word, 'sense', `record.senses[${senseIndex}]`);
    if (sense?.lexical_identity_overlay) {
      counts.identity_overlays += 1;
      counts.rendered_form_identity_targets += 1;
      requireLocatorRevision(answer, ordinal, word, 'form_identity', `record.senses[${senseIndex}].lexical_identity_overlay`);
      remember('identity_overlays', ordinal, word, String(sense.lexical_identity_overlay.note || sense.lexical_identity_overlay.identity_type || ''));
    }
    (Array.isArray(sense?.collocations) ? sense.collocations : []).forEach((item, collocationIndex) => {
      if (item?.exam_value === 'fixed_pattern') {
        counts.rendered_fixed_collocations += 1;
        if (!item?.collocation_id) requireLocatorRevision(answer, ordinal, word, 'collocation', `record.senses[${senseIndex}].collocations[${collocationIndex}]`);
      } else {
        counts.nonfixed_collocations += 1;
        remember('nonfixed_collocations', ordinal, word, String(item?.phrase || ''));
      }
    });
  });

  const secondary = Array.isArray(card.secondary_senses) ? card.secondary_senses : [];
  secondary.forEach((branch, index) => {
    const rendered = ['verified', 'semantic_auditor_verified'].includes(String(branch?.verification_status || ''))
      && ['publishable', 'codex_reviewed', 'published'].includes(String(branch?.publication_status || ''))
      && (!branch?.source_sense_id || !activeSenseIds.has(String(branch.source_sense_id)));
    if (!rendered) return;
    counts.rendered_secondary_senses += 1;
    if (!(branch?.fact_id || branch?.source_sense_id)) requireLocatorRevision(answer, ordinal, word, 'secondary_sense', `record.secondary_senses[${index}]`);
  });

  const fixedIds = new Set(senses.flatMap((sense) => Array.isArray(sense?.collocations) ? sense.collocations : [])
    .filter((item) => item?.exam_value === 'fixed_pattern' && item?.collocation_id)
    .map((item) => String(item.collocation_id)));
  const constructions = Array.isArray(card.constructions) ? card.constructions : [];
  constructions.forEach((item, index) => {
    const rendered = (!item?.verification_status || ['verified', 'semantic_auditor_verified'].includes(String(item.verification_status)))
      && !fixedIds.has(String(item?.presentation_merge?.surviving_object_id || ''));
    if (!rendered) return;
    counts.rendered_constructions += 1;
    if (!(item?.fact_id || item?.construction_id)) requireLocatorRevision(answer, ordinal, word, 'construction', `record.constructions[${index}]`);
  });

  const relations = [
    ...(Array.isArray(card.semantic_neighbors) ? card.semantic_neighbors : []),
    ...(Array.isArray(card.confusables) ? card.confusables : [])
  ];
  relations.forEach((item, index) => {
    counts.rendered_relations += 1;
    if (!(item?.fact_id || item?.relation_id)) requireLocatorRevision(answer, ordinal, word, 'relation', `relation[${index}]`);
  });

  const phraseology = Array.isArray(card.phraseology) ? card.phraseology : [];
  if (phraseology.length) {
    counts.phraseology_assets += phraseology.length;
    remember('phraseology_assets', ordinal, word, String(phraseology[0]?.phrase || phraseology[0]?.text || ''));
  }
  const wordFamily = Array.isArray(card.word_family) ? card.word_family : [];
  if (wordFamily.length) {
    counts.word_family_assets += wordFamily.length;
    remember('word_family_assets', ordinal, word, String(wordFamily[0]?.word || wordFamily[0]?.form || ''));
  }
  const paraphrases = Array.isArray(card.exam_paraphrases) ? card.exam_paraphrases : [];
  if (paraphrases.length) {
    counts.exam_paraphrase_assets += paraphrases.length;
    remember('exam_paraphrase_assets', ordinal, word, String(paraphrases[0]?.text || paraphrases[0]?.phrase || ''));
  }
}

assert.ok(counts.owners > 0, 'Current lexical owner inventory must not be empty');
assert.match(studyRuntimeSource, /data-target-kind="core"/, 'Study runtime must expose Core / Word Feel as an optional exact Repair surface');
assert.match(studyRuntimeSource, /data-target-kind="form_identity"/, 'Study runtime must expose material form / identity distinctions as optional exact Repair surfaces');
assert.match(studyRuntimeSource, /target_revision:\s*target\.id\s*\?\s*null\s*:\s*\(sourceHash/, 'Locator-only local Repair state must retain owner revision for portable exact identity');
assert.equal(counts.rendered_core_targets, counts.core_objects, 'Every present Core object must expose one Repair-capable target surface');
assert.equal(counts.rendered_form_identity_targets, counts.identity_overlays, 'Every present lexical identity overlay must expose one form_identity Repair-capable target surface');
assert.equal(unresolved.length, 0, `Every currently rendered Repair target must have stable ID or owner revision: ${JSON.stringify(unresolved.slice(0, 10))}`);

console.log(JSON.stringify({
  status: 'PASS',
  claim: 'current Study repair surfaces are durably addressable, including Core and form/identity distinctions; unprojected asset counts are inventory only, not automatic defects',
  counts,
  unprojected_inventory_examples: examples,
  unresolved
}, null, 2));
