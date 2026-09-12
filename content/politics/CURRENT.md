# Politics Current

This file is the stable entrypoint for fresh Chats working on Politics. It routes to Current owners; it does not duplicate teaching content, source evidence, or active progress.

## Owners

- owner map: `content/politics/manifest.json`
- stable lane learning rules: `content/politics/LEARNING_CONTRACT.md`
- interaction rules: `content/politics/INTERACTION_CONTRACT.md`
- shared-work continuation: `content/politics/continuation.json`
- source: `content/politics/source/`
- provenance: `content/politics/provenance.json`
- Chat-approved learning projections: `content/politics/learning/`
- learner runtime: Politics surfaces under `static-web/`

## Fresh-Chat read order

1. `content/politics/continuation.json`
2. resolve the active subject / Natural Unit / validation scope
3. read only the exact contract, learning projection, source, or evidence owners required by that next action

Do not reread every Politics subject or source store by default.

## Boundaries

- Source, learning semantics, interaction semantics, teaching projection, and runtime are separate roles; do not collapse them into one owner.
- Repository-wide construction order is owned by root `LEARNING_ASSET_STANDARD.md`.
- S/K/L/P/R/E/U acceptance semantics are owned by root `LEARNING_ACCEPTANCE.md`.
- Shared learner-surface capabilities are owned by root `SYSTEM_CONTRACT.md`.
- Detailed active status belongs in the continuation/evidence owner, not here.
- Historical repositories/commits/issues/migration artifacts are not normal Politics inputs.
