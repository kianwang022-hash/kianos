# Xizong Current

This file is the stable entrypoint for fresh Chats working on Xizong. It routes to Current owners; it does not duplicate medical Core, learning-support data, acceptance evidence, or progress.

## Owners

- knowledge owner map: `content/xizong/knowledge/manifest.json`
- shared learning/support entry: `content/xizong/knowledge/learner/README.md`
- shared-work continuation: `content/xizong/knowledge/learner/continuation.json`
- formal acceptance status: `content/xizong/knowledge/learner/acceptance-status.json`
- canonical knowledge: `content/xizong/knowledge/`
- official questions: `content/xizong/questions/`
- question explanations: `content/xizong/question_explanations/`
- question relations: `content/xizong/question-relations/`
- supporting explanations: `content/xizong/explanations/`
- learner runtime: Xizong surfaces under `static-web/`

## Fresh-Chat read order

1. `content/xizong/knowledge/learner/continuation.json`
2. resolve the active System / Block / acceptance scope
3. read only the exact knowledge, learner-policy, question, acceptance, or runtime owners required by that next action

Do not reread all Systems, all Blocks, or the whole learner-support tree by default.

## Boundaries

- Canonical medical Core remains in its natural knowledge owner; learner-support files may define how/when to learn but must not silently change medical truth.
- Repository-wide construction order is owned by root `LEARNING_ASSET_STANDARD.md`.
- S/K/L/P/R/E/U acceptance semantics are owned by root `LEARNING_ACCEPTANCE.md`.
- Shared learner-surface capabilities are owned by root `SYSTEM_CONTRACT.md`.
- Detailed active status belongs in the continuation/acceptance owner, not here.
- Historical repositories/commits/issues/migration artifacts are not normal Xizong inputs.
