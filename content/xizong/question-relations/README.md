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

## C2 throughput contract

C2 is a progressive content program, not a UI-development loop. The default operating unit is now a **25–40 accepted-relation batch**, usually reviewed from a larger candidate packet. Numeric batch size is a throughput target only; exact-owner quality remains the gate and smaller batches are legal when the candidate pool is weak.

The accepted transport is:

```text
large review packet
→ Chat exact-owner review
→ pending-reviewed-batches/*.json
→ materializer
→ canonical shards + manifest + continuation cursor
→ Crosswalk Fast QA
→ merge
```

`apply-xizong-crosswalk-reviewed-batches.mjs` automatically advances `continuation.json` from the pre-materialization manifest count and the exact staged question ids. A separate human cursor commit and a second clean-head QA run are therefore not part of the normal C2 batch cycle.

Relation-only PRs use `.github/workflows/xizong-crosswalk-fast-qa.yml`. The fast lane validates canonical materialization, manifest synchronization, Crosswalk behavior and review-queue behavior, builds a larger review packet plus a derived KP lookup index, and performs an Astro build. It does **not** rerun every unrelated A1/A2/A3/browser contract for every content increment.

A periodic full regression is automatically re-enabled when an accepted batch crosses a 50-relation coverage boundary. Any Knowledge, UI, runtime or broader Xizong contract change continues to use the full `Static Web Xizong QA` workflow regardless of relation count.

`static-web/scripts/build-xizong-kp-lookup-index.mjs` creates a derived review-acceleration index with KP id, Block/System identity, exact title/snippet, canonical path and current Git blob SHA. The index is **not semantic authority** and never authorizes a Mapping by itself; it only reduces mechanical lookup calls before Chat reads the exact Current owner.

When new reviewed rows are staged, do not hand-edit canonical shards. The materializer owns routing, duplicate rejection, canonical append/sort, staging deletion, manifest synchronization and continuation advance. The existing Crosswalk consumer should become more precise automatically without product/UI redevelopment.
