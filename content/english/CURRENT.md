# English Current

This file is the stable entrypoint for fresh Chats working on the English lane. It routes to Current owners; it does not duplicate their content or progress.

## Owners

- owner/readiness map: `content/english/manifest.json`
- stable lane learning rules: `content/english/LEARNING_CONTRACT.md`
- shared-work continuation: `content/english/continuation.json`
- canonical source: `content/english/source/`
- provenance: `content/english/provenance.json`
- module owners: `content/english/modules/`
- learner runtime: English surfaces under `static-web/`

## Fresh-Chat read order

1. `content/english/continuation.json`
2. resolve the active module/sub-lane
3. read only the exact module/rule/source/evidence owners named by the continuation or required by the task

Do not reread all English modules by default.

## Sub-lane rule

Reading, Cloze, Reading B, Translation, Writing, or another first-class English module may receive its own `CURRENT.md` only when it is independently continued often enough that a dedicated entrypoint reduces reads. Parent English Current should then route to it rather than duplicate its state.

## Boundaries

- Repository-wide construction order is owned by root `LEARNING_ASSET_STANDARD.md`.
- S/K/L/P/R/E/U acceptance semantics are owned by root `LEARNING_ACCEPTANCE.md`.
- Shared learner-surface capabilities are owned by root `SYSTEM_CONTRACT.md`.
- Detailed active status belongs in the continuation/module acceptance owner, not here.
- Historical repositories/commits/issues/migration artifacts are not normal English inputs.
