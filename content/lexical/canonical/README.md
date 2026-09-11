# Lexical Canonical Owner

`manifest.json` is the compact owner entry.

## Current physical representation during migration

Until Natural Owner cutover is proven and accepted, Current lexical records still live in the existing seven bounded stores:

- `words/`
- `senses/`
- `facts/`
- `exam-mappings/`
- `collocations/`
- `relations/`
- `packs/`

Start exact spelling reads in `lookup/spelling/`. Each candidate supplies the immutable `word_id`, frozen ordinal, primary word shard and the stable-ID lookup bucket that contains optional per-word auxiliary shard references.

The seven root JSONL files are non-authoritative, byte-rebuildable compatibility projections. They are not an alternate semantic owner and Fresh Chat must not bulk-read them for one word or a bounded review batch.

## Frozen target: Natural Owner + Reference, Not Copy

The migration target is defined by `natural-owner-schema.v1.json`.

- **Word** is the natural owner of word-local semantics: L0/Core, learner senses, word-local constructions/collocations/phraseology, word family and exam paraphrases.
- **Relation** is the independent owner of genuine two-word or multi-word semantic relationships. Participating Words keep stable relation references rather than copied editable relation bodies.
- Exam mappings remain evidence/reference objects, packs remain membership/routing metadata, and lookup/index/release files remain deterministic non-authoritative projections.
- A truly shared phrase/object gets its own owner only when no single Word is the natural owner and independent learner value is explicit.

Normal post-cutover maintenance must resolve as:

`manifest/lookup -> Word -> referenced Relation/shared object only when needed`

An ordinary word edit must not require reconstructing meaning from unrelated stores, Runtime fallbacks, compatibility projections or history.

## Migration safety

Structural migration is strictly `semantic_delta = 0`.

Existing accepted semantic values, stable word IDs, sense/fact/collocation/relation IDs, frozen ordinals and source/provenance links are preserved during movement. Embedded/store duplicates may be collapsed only when stable identity and payload equivalence are proven. Any mismatch or ambiguous ownership blocks that object for Chat review.

A content defect discovered during migration is not silently fixed as part of the move. It is handled later as a separate Chat-approved semantic repair.

The existing seven-store representation remains Current until full-corpus equivalence, reference closure, dependency proof and cutover acceptance succeed. No parallel natural-owner copy becomes semantic Current merely because it has been generated.

The live migration/review position is stored only in `continuation.json`; learner mastery, attempts, due state and scheduling remain Local-only.
