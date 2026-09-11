# Lexical Canonical Reference Plane

Natural Owner cutover is complete. `content/lexical/manifest.json` is the Current lexical owner entry.

## Current semantic owners

Normal Current resolution is:

`content/lexical/manifest.json / lookup -> Word natural owner -> referenced Relation only when needed`

- **Word** owners live under `content/lexical/words/by-ordinal/` and are the only editable owners of word-local semantics: L0/Core, learner senses, word-local constructions/collocations/phraseology, word family, exam paraphrases and word-local reference senses.
- **Relation** owners live under `content/lexical/relations/by-id/` and independently own genuine cross-word semantic relationships such as semantic contrasts and confusables.
- Astro reads Current Natural Owners and may hydrate referenced Relations for display/interaction. Astro is not a semantic owner.

## Role of this `canonical/` tree after cutover

The former seven bounded stores are retained for identity, provenance, audit evidence and deterministic routing/reference only:

- `words/`
- `senses/`
- `facts/`
- `exam-mappings/`
- `collocations/`
- `relations/`
- `packs/`

They are **not normal semantic edit targets after cutover** and must not compete with Natural Owners as Current truth.

`lookup/` remains a deterministic non-semantic routing projection. Exact spelling lookup may route a spelling to an immutable `word_id` and ordinal, but it never chooses or changes meaning.

The seven root JSONL compatibility files remain non-authoritative, rebuildable projections.

## Cutover proof

The accepted full-corpus audit is `content/lexical/audit/natural-owner-cutover.json`.

The cutover preserved:

- all 7,946 Word identities and frozen ordinals;
- stable sense/fact/collocation/relation identities and provenance references;
- exact reconstruction of every pre-cutover Current Word record when Relation views are hydrated;
- full spelling-lookup closure;
- `semantic_delta = 0`.

Semantic defects discovered before or during migration are repaired only after cutover against the Current Natural Owner at `main@HEAD`.

## Normal maintenance

For ordinary lexical content work:

1. resolve the current Word owner;
2. edit that Word in place for word-local semantic changes;
3. edit a Relation owner only for a genuine cross-word relation;
4. let Astro read those Current owners directly, with only non-semantic parsing/hydration;
5. do not manually synchronize old bounded stores as parallel semantic truth.

Private answers, progress, wrong/uncertain state, comments, timing and scheduler/history may support interaction but are outside shared Current content and are not semantic owners.
