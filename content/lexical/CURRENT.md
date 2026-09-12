# LexicalOS Current

This file is the stable entrypoint for fresh Chats working on LexicalOS. It routes to Current owners; it does not duplicate lexical semantics, audit history, or progress.

## Owners

- owner map: `content/lexical/manifest.json`
- stable lane learning rules: `content/lexical/LEARNING_CONTRACT.md`
- shared-work continuation: `content/lexical/continuation.json`
- ownership schema: `content/lexical/schema.json`
- natural word owners: `content/lexical/words/by-ordinal/`
- relation owners: `content/lexical/relations/by-id/`
- audits/evidence: `content/lexical/audit/`
- learner runtime: lexical surfaces under `static-web/`

## Fresh-Chat read order

1. `content/lexical/continuation.json`
2. read the exact Natural Owner / Relation / audit/runtime files required by the active batch
3. read `content/lexical/LEARNING_CONTRACT.md` only when the task depends on lane learning behavior rather than pure semantic-owner work

Do not scan the full lexical corpus or historical stores by default.

## Boundaries

- Word-local semantics live in Natural Owners; relation semantics live in Relation owners.
- Lookup/reference/evidence stores do not become parallel semantic owners.
- Repository-wide construction order is owned by root `LEARNING_ASSET_STANDARD.md`.
- S/K/L/P/R/E/U acceptance semantics are owned by root `LEARNING_ACCEPTANCE.md`.
- Shared learner-surface capabilities are owned by root `SYSTEM_CONTRACT.md`.
- Detailed active status belongs in the continuation/audit owner, not here.
- Historical repositories/commits/issues/migration artifacts are not normal LexicalOS inputs.
