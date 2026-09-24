# Xizong Question to Knowledge Relations — Current Owner

Owner path: `content/xizong/question-relations/`

This owner stores only explicit Chat-reviewed Question→Knowledge relations, keyed by the immutable Question Truth `question_id`. Storage uses the same fixed 25-number year/range routing as Question Truth: `shards/YYYY/qNNN-NNN.json`.

Every stored relation must have `review_status = REVIEWED` plus explicit review and provenance identity. Title similarity, page proximity, source section, Block membership, runtime routes, old mapping artifacts and model priors are not mapping authority.

## Current coverage

Coverage counts are owned by `manifest.json`; do not copy a hand-maintained fixed number into this README.

Current rules:

- positive mapping review evidence exists only as a `REVIEWED` row under this owner;
- `REVIEWED` records the semantic judgment against a specific Knowledge revision; it is not by itself a claim that the row is still Current;
- Current consumers recompute revision freshness from `knowledge_path` + the effective reviewed-against blob witness (`knowledge_revalidated_blob_sha` when present, otherwise `knowledge_blob_sha`);
- a revision mismatch becomes `STALE_REVIEW_WITNESS` / needs re-review and is excluded from Current learner-facing Crosswalk consumption until revalidated;
- the manifest reviewed count is a storage/review-evidence count, not Current-admissible coverage;
- inferred relations: 0;
- unresolved / no-safe mappings remain outside this owner;
- missing or stale mapping is a legal fail-closed state and does not block practice;
- reverse lookup is derived only from freshness-admissible reviewed rows and is never separately authored.

## Compilation stages

- `CALIBRATION.md` records C0 relation-model calibration and the boundary between relation truth, Question Truth and Explanation.
- `static-web/scripts/build-xizong-crosswalk-review-queue.mjs` builds **anti-anchored** C1 review packets. For the default backlog it may use approved Explanation routing state only as a hidden mechanical eligibility hint; the reviewer packet itself contains Question Truth and withholds old Explanation semantics, old `mapping_decision`, and prior relation targets until an independent provisional judgment exists. Explicit qids bypass backlog selection. It intentionally emits no suggested System/Block/KP target.
- No standing broad continuation cursor is Current. Broad corpus construction is closed; exact stale/new relations reopen on demand through this owner. A future explicit broad program may create its own bounded work cursor if genuinely needed.

## C2 throughput contract — only when explicitly reopened

Broad C2 construction is currently closed. If a real new corpus or explicit broad content program reopens it, C2 is a progressive content program, not a UI-development loop. The default operating unit is now a **25–40 accepted-relation batch**, usually reviewed from a larger candidate packet. Numeric batch size is a throughput target only; exact-owner quality remains the gate and smaller batches are legal when the candidate pool is weak.

The accepted transport is:

```text
large review packet
→ Chat exact-owner review
→ pending-reviewed-batches/*.json
→ materializer
→ canonical shards + manifest/freshness verification
→ Crosswalk Fast QA
→ merge
```

`apply-xizong-crosswalk-reviewed-batches.mjs` materializes only the approved canonical relation rows. Aggregate count/freshness stays with the manifest + freshness resolver; no separate historical cursor is written. A second cursor commit is not part of the batch cycle.

Relation-only PRs use `.github/workflows/xizong-crosswalk-fast-qa.yml`. The fast lane validates canonical materialization, manifest synchronization, Crosswalk behavior and review-queue behavior, builds a larger review packet plus a derived KP lookup index, and performs an Astro build. It does **not** rerun every unrelated A1/A2/A3/browser contract for every content increment.

A periodic full regression is automatically re-enabled when an accepted batch crosses a 50-relation coverage boundary. Any Knowledge, UI, runtime or broader Xizong contract change continues to use the full `Static Web Xizong QA` workflow regardless of relation count.

`static-web/scripts/build-xizong-kp-lookup-index.mjs` creates a derived review-acceleration index with KP id, Block/System identity, exact title/snippet, canonical path and current Git blob SHA. The index is **not semantic authority** and never authorizes a Mapping by itself; it only reduces mechanical lookup calls before Chat reads the exact Current owner.

When new reviewed rows are staged, do not hand-edit canonical shards. The materializer owns routing, duplicate rejection, canonical append/sort, staging deletion, manifest synchronization and continuation advance, and rejects a staged row whose reviewed Knowledge witness is already stale against Current. The existing Crosswalk consumer should become more precise automatically without product/UI redevelopment.

Knowledge revisions do not rewrite old review evidence. The freshness resolver used by audit + materializer + Current Crosswalk consumer supplies the current review status. Broad historical REVIEWED storage may therefore coexist with a smaller Current-admissible set without silently treating stale decisions as Current.
