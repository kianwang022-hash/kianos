# Lexical continuity / transport validation

Date: 2026-09-13. Scope: semantic design review, restart routing and bounded transport tooling. This is not full-catalog K, learner Runtime/Evidence acceptance or real learner U.

## Observed repository evidence

PR #83 initial code head: `0b3c99f4952851ed0c66a268beb146540dcee9ac`.

`Lexical Shard Tools` run **34762755220**, job **103738341297**, completed successfully. The PR workflow actually checked out test-merge commit `ac8f531e6d133276309ed0ddd04217ee04d2c722` (code head above plus main `a86ada9e1a72a72089ce2517ca7e709ead7c696f`). Do not confuse the code head with the tested merge SHA.

Observed steps:
- 24 synthetic safety tests PASS, 0.169 seconds in the runner;
- real Current owner transport pilot, o0001–o0050, PASS;
- `git diff --exit-code`, PASS (no tracked source mutation);
- evidence artifact upload, PASS.

Artifact ID: `10319267507`; ZIP SHA256: `8cc9ff6d7d3dbe5bc4960ea66925a0062245f004f937a0a0bab5ff45adf16535`.

### Actual bounded payloads

| Ordinals | Words | Compact UTF-8 bytes | Relation owners |
| --- | ---: | ---: | ---: |
| 1–10 | 10 | 46,038 | 0 |
| 11–17 | 7 | 40,139 | 0 |
| 18–24 | 7 | 47,165 | 0 |
| 25–29 | 5 | 44,251 | 2 |
| 30–38 | 9 | 45,134 | 0 |
| 39–45 | 7 | 47,012 | 2 |
| 46–50 | 5 | 26,208 | 0 |

The exporter and exact-view verifier processed these 50 owners in **0.137 seconds inside the runner**. This is mechanical processing time, not Chat semantic review time, end-to-end GitHub latency or a promised speedup ratio.

The real data demonstrates why word-count assumptions must remain subordinate to byte/semantic budget: at the initial 48,000-byte conservative cap, these rich early owners fit **5–10 per payload**, not 25–50. Never promise a fixed per-turn count or delete semantic/evidence fields merely to hit a target. A later measured budget change may allow more; package allocation can still be ~200 without one giant turn or per-word remote operations.

The workflow also exposes `workflow_dispatch` with start/end/byte-budget inputs to export exactly one bounded inspection bundle. The automatic pilot above did not exercise that dispatch branch; it uses the same tested exporter and verifier, but a successful automatic pilot is not a claim of an observed manual dispatch run.

## Safety coverage

Tests cover loss-aware complete views; count and byte limits; explicit oversized failure; Relation resolution/deduplication; genuine decision bookkeeping; missing/duplicate/out-of-range judgment refusal; stale word/contract/dependency refusal; unrelated-change tolerance; metadata preservation; no source mutation while staging; identity/lifecycle guards; tampered bundle/candidate replay rejection; all-owner final-view acknowledgment; pause enforcement; explicit publication directive; and refusal to overwrite source files or existing checkpoints via CLI output.

The test workflow uses explicit Bash pipefail so piping output to a log cannot conceal a failed test process. This is a harness hardening change after observing the initial successful run; it does not retroactively change that run's evidence.

## Local evidence and transport fallback

The initial 22 local tests passed in 0.489 seconds; the two output/publication guards also passed locally with the 24-scenario suite in 0.593 seconds. No local repository-wide Astro build was run. The working container could not resolve GitHub for cloning, so that unchanged transport was not retried repeatedly; connected GitHub and repository-side CI were used instead.

## History cleanup

`historical-routes.json` records 17 old lexical refs: four exact duplicate aliases explicitly retired in `.github/retired-branches.txt` while their shared primary is preserved, and 13 refs retained solely for bounded reconciliation. Retirement policy is not proof that a branch has already been deleted; Branch Hygiene / live ref readback determines that.

Issue #6 was closed as **not_planned / superseded**, with 29 historical comments preserved, not reported as successfully completed. #50 is now navigation only, #54 explicitly PAUSED, and #56 explicitly deferred full-catalog acceptance rather than a global dependency wall. These Issue updates were read back from GitHub during this reconciliation.

## Preserved truth / remaining proof

Transport pilot semantic judgments: **0**. New accepted catalog owners: **0**. Learner-state mutation: **0**.

Catalog remains PAUSED; accepted contiguous content remains 24/7,946. Full K/P/R/E remain blocked and real learner U untested. The active next action is the contract-to-runtime Evidence/Memory reconciliation named by Current. Normative design scenarios are not fabricated runtime test outcomes.

Word-local patch/readback behavior is proven here with synthetic fixtures. A production semantic shard, exact integration acceptance, shared Relation/Form handoff and real learner-loop implementation are not claimed complete. Unique historical semantic candidates have not all been salvaged or repaired. This bounded result fixes routing and mechanical transport without disguising remaining work as PASS.
