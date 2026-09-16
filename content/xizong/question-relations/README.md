# Xizong Question to Knowledge Relations — Current Owner

Owner path: `content/xizong/question-relations/`

This owner stores only explicit Chat-reviewed Question→Knowledge relations, keyed by the immutable Question Truth `question_id`. Storage uses the same fixed 25-number year/range routing as Question Truth: `shards/YYYY/qNNN-NNN.json`.

Every stored relation must have `review_status = REVIEWED` plus explicit review and provenance identity. Title similarity, page proximity, source section, Block membership, runtime routes, old mapping artifacts and model priors are not mapping authority.

## Current coverage

Coverage counts are owned by `manifest.json`; do not copy a hand-maintained fixed number into this README.

Current rules:

- positive mapping truth exists only as a `REVIEWED` row under this owner;
- inferred relations: 0;
- unresolved / no-safe mappings remain outside this owner;
- missing mapping is a legal state and does not block practice;
- reverse lookup is derived from these rows and is never separately authored.

## Compilation stages

- `CALIBRATION.md` records C0 relation-model calibration and the boundary between relation truth, Question Truth and Explanation.
- `static-web/scripts/build-xizong-crosswalk-review-queue.mjs` builds C1 review packets from approved Explanation routing hints or explicit qids. It intentionally emits no suggested System/Block/KP target.
- `continuation.json` is a work-cursor policy only; it does not define semantic truth or imply a linear catalog frontier.

When new reviewed rows are added, update the affected shard and `manifest.json`. The existing Crosswalk consumer should become more precise automatically without product/UI redevelopment.
