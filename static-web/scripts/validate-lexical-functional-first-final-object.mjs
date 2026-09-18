import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  listLexicalOrdinals,
  loadLexicalFinalWordByOrdinal
} from '../src/lib/lexical.mjs';
import {
  LEXICAL_FINAL_WORD_OBJECT_SCHEMA,
  validateLexicalFinalWordObject
} from '../src/lib/lexicalFinalLearnerObject.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(webRoot, rel), 'utf8');
const fail = (code, detail = '') => {
  throw new Error(`${code}${detail ? `:${detail}` : ''}`);
};

const forbiddenFinalKeys = new Set([
  'verification_status',
  'publication_status',
  'presentation_merge',
  'learning_value_score',
  'priority',
  'tier',
  'relation_refs',
  'owner_path',
  'identity_refs',
  'lookup_refs',
  'provenance',
  'verification_summary',
  'review_signature',
  'processing_status',
  'needs_delta_review'
]);

function assertNoForbiddenKeys(value, trail = 'final') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenKeys(item, `${trail}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenFinalKeys.has(key)) fail('LEXICAL_FINAL_OBJECT_GOVERNANCE_LEAK', `${trail}.${key}`);
    assertNoForbiddenKeys(child, `${trail}.${key}`);
  }
}

function assertTarget(target, trail) {
  if (!target || typeof target !== 'object') fail('LEXICAL_FINAL_OBJECT_TARGET_MISSING', trail);
  if (!target.kind || !target.label) fail('LEXICAL_FINAL_OBJECT_TARGET_INCOMPLETE', trail);
  if (!target.id && !target.locator) fail('LEXICAL_FINAL_OBJECT_TARGET_IDENTITY_MISSING', trail);
}

const ordinals = listLexicalOrdinals();
if (ordinals.length !== 7946) fail('LEXICAL_FINAL_OBJECT_CATALOG_COUNT', String(ordinals.length));

let relationWordCount = 0;
let expansionWordCount = 0;
let deepBranchWordCount = 0;
let repairTargetCount = 0;

for (const ordinal of ordinals) {
  const envelope = loadLexicalFinalWordByOrdinal(ordinal);
  if (envelope?.schema !== 'kianos.lexical.final_word_envelope.v1') fail('LEXICAL_FINAL_ENVELOPE_SCHEMA', String(ordinal));
  if (envelope?.ordinal !== ordinal || !envelope?.objectId || !envelope?.sourceHash) fail('LEXICAL_FINAL_ENVELOPE_IDENTITY', String(ordinal));

  const object = envelope.learnerObject;
  validateLexicalFinalWordObject(object);
  if (object.schema !== LEXICAL_FINAL_WORD_OBJECT_SCHEMA || object.ordinal !== ordinal || object.objectId !== envelope.objectId) {
    fail('LEXICAL_FINAL_OBJECT_IDENTITY', String(ordinal));
  }
  assertNoForbiddenKeys(object);

  assertTarget(object.core?.target, `${ordinal}.core`);
  repairTargetCount += 1;
  object.senses.forEach((sense, index) => {
    assertTarget(sense.target, `${ordinal}.senses[${index}]`);
    repairTargetCount += 1;
    if (sense.identityOverlay) {
      assertTarget(sense.identityOverlay.target, `${ordinal}.senses[${index}].identityOverlay`);
      repairTargetCount += 1;
    }
    sense.collocations.filter((item) => item.fixedPattern).forEach((item, cIndex) => {
      assertTarget(item.target, `${ordinal}.senses[${index}].collocations[${cIndex}]`);
      repairTargetCount += 1;
    });
  });
  object.secondarySenses.forEach((branch, index) => {
    assertTarget(branch.target, `${ordinal}.secondarySenses[${index}]`);
    repairTargetCount += 1;
  });
  object.expansion.constructions.forEach((item, index) => {
    assertTarget(item.target, `${ordinal}.expansion.constructions[${index}]`);
    repairTargetCount += 1;
  });
  object.expansion.relations.forEach((item, index) => {
    assertTarget(item.target, `${ordinal}.expansion.relations[${index}]`);
    repairTargetCount += 1;
  });
  if (object.expansion.formIdentity) {
    assertTarget(object.expansion.formIdentity.target, `${ordinal}.expansion.formIdentity`);
    repairTargetCount += 1;
  }

  if (object.expansion.relations.length) relationWordCount += 1;
  if (object.expansion.hasImportant) expansionWordCount += 1;
  if (object.secondarySenses.length) deepBranchWordCount += 1;
}

const runtime = read('src/components/VocabularyWordRuntime.astro');
const page = read('src/pages/vocabulary/[ordinal].astro');
const forbiddenRuntimeTokens = [
  'verification_status',
  'publication_status',
  'presentation_merge',
  'learning_value_score',
  'relation_refs',
  'answer.record',
  'card.secondary_senses',
  'card.semantic_neighbors',
  'card.confusables'
];
for (const token of forbiddenRuntimeTokens) {
  if (runtime.includes(token)) fail('LEXICAL_RENDERER_SEMANTIC_INFERENCE_REGRESSION', token);
}
if (!runtime.includes('answer?.learnerObject')) fail('LEXICAL_RENDERER_FINAL_OBJECT_NOT_CONSUMED');
if (!page.includes('loadLexicalFinalWordByOrdinal')) fail('LEXICAL_PAGE_FINAL_OBJECT_LOADER_MISSING');
if (page.includes('loadLexicalWordByOrdinal')) fail('LEXICAL_PAGE_RAW_OWNER_LOADER_REGRESSION');

console.log(JSON.stringify({
  status: 'PASS',
  schema: LEXICAL_FINAL_WORD_OBJECT_SCHEMA,
  words: ordinals.length,
  relation_word_count: relationWordCount,
  expansion_word_count: expansionWordCount,
  deep_branch_word_count: deepBranchWordCount,
  repair_target_count: repairTargetCount,
  renderer_raw_semantic_inference: false
}, null, 2));
