# Lexical continuity / transport validation

Date: 2026-09-13. Scope: semantic design review, restart routing and bounded transport tooling. This is not full-catalog K, learner Runtime/Evidence acceptance or real learner U.

## Observed local evidence

- `python tools/test_lexical_shard.py`: 22 synthetic transport tests passed before publication of the initial tool tree; execution took 0.489 seconds in the local Python environment.
- Tests exercised complete compact views, budget boundaries, Relation resolution, current read-set locks, no-change judgments, staged edits, final readback, paused publication and no source mutation on a failed stage.
- No local repository-wide Astro build was run. The working container could not resolve GitHub for cloning, so the unchanged transport was not retried repeatedly; connected GitHub and repository-side CI are the verification path.

## Evidence still required at initial publication

The `Lexical Shard Tools` workflow executes the tests again and a transport-only pilot on 50 real Current owners. A run that has not yet executed is not PASS. Record the exact run/head and observed results before claiming the pilot completed.

A transport-only pilot performs zero fresh semantic judgments, adds zero accepted catalog owners and changes zero learner state. It measures payload/range behavior only. Word-local mutation/readback safety is tested with synthetic fixtures; real semantic production and shared Relation/Form reconciliation require the later explicitly activated bounded shard.

## History cleanup boundary

`historical-routes.json` records 17 old lexical refs: four exact duplicate aliases eligible for retirement while their shared primary head is preserved, and 13 refs retained solely for bounded reconciliation. Classification is not proof of deletion or semantic salvage. Issue retirement is supersession, not a claim that every old content defect has been repaired.

## Preserved truth

Catalog execution remains PAUSED, accepted contiguous content remains 24/7,946, and unrestricted K/P/R/E remain blocked. The active next action is the contract-to-runtime Evidence/Memory reconciliation named by Current. Normative design scenarios are not fabricated test outcomes.
