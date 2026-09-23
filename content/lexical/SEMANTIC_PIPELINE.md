# Lexical Dual Independent Review + Final Closure

Status: **CURRENT execution protocol — 2026-09-23**

This protocol supersedes the old per-batch A→B→materialize loop for the current unfinished catalog range.

## 1. Frozen semantic scope

- frozen semantic baseline: read from `execution/dual-review.json`;
- review scope: o2551–o7946;
- o0001–o2550 remain previously closed and are not reopened by this sweep;
- A and B must read the same frozen baseline;
- A and B never mutate canonical Word / Relation / Form / FLOB truth.

The goal is two genuinely independent semantic judgments followed by one bounded landing pass.

```text
same frozen baseline
├─ A independent review
└─ B independent review
        ↓
shared durable completed prefix
        ↓
streaming C reconcile → apply → targeted verify → merge
```

## 2. A and B independence

A and B are peers, not producer and auditor.

Both perform 100/100 review of every assigned ~100-owner batch against the same semantic ruler.

A must not read B findings.
B must not read A findings.
Neither may read the other lane's result directory, summaries, or Chat conclusions before both lanes are complete.

Each lane may use the same canonical contracts, dictionaries, source evidence, scripts and frozen owner data.

Each lane performs its own bounded Self Attack before freezing a batch result.

A/B outputs are durable review evidence only. They are not canonical lexical mutations.

## 3. Batch artifacts

A results live under:

`content/lexical/semantic-review/dual/A/`

B results live under:

`content/lexical/semantic-review/dual/B/`

Normal batch size is 100 ordinals, with the final batch shorter.

Batch filename is exactly `oNNNN-oMMMM.review.md` inside the lane result directory.

Every batch result must contain:

- exact baseline SHA and ordinal range;
- 100/100 reviewed count;
- per-owner operation: `NO_CHANGE | CHANGE | BLOCKED`;
- exact proposed final semantic state for every CHANGE;
- necessary remote dependencies / anchors;
- evidence escalation only where needed;
- Self Attack removals, additions and re-layerings;
- no canonical writes.

A/B should prioritize learner-value semantics:
familiar-new meanings, polysemy, sense attachment, construction/phraseology, confusable decisions, anchor correctness, register/stance and productive use.

Routine pronunciation/stress/regional spelling stays background Form unless materially decision-relevant.

## 4. Sweep state

`execution/dual-review.json` is the immutable campaign baseline/scope owner.

A and B have separate cursor files: `execution/dual-review-A.json` and `execution/dual-review-B.json`. C has `execution/dual-review-C.json`. This separation is required so A/B can commit concurrently without touching the same state file.

Each lane advances only its own cursor after its durable batch artifact is committed. The other lane's cursor may be used only for completion status while A/B independence still applies. C may read paired result artifacts only for windows that are already inside the durable shared completed prefix.

A and B may run concurrently all the way to o7946.

A and B use the fixed dedicated branches recorded in their lane-state files. They push durable review artifacts and their own cursor to those branches only; they do not merge review evidence to `main` during the sweep.

### Remote transport fast path

When a connected Remote Desktop has a local clone containing the campaign's frozen baseline object, A and B should prefer local immutable Git-object reads for the review data path when this materially reduces transport overhead.

Required invariants:

- authority remains the exact frozen SHA from `dual-review.json`, never the Remote working tree or its current branch;
- verify the frozen commit object exists locally before use;
- read each Word owner with an immutable form such as `git show <frozen_sha>:<owner_path>`;
- read required Relation / Form / reference dependencies from that same frozen SHA;
- transport chunking or local batch parsing may change, but the semantic atomic unit remains 100/100 Fresh Read followed by Self Attack;
- Remote must never be used to read the peer lane's result directory or Chat findings; independence rules are unchanged;
- do not reuse or mutate a dirty user worktree for lane writes; use an isolated worktree or equivalent clean checkout;
- before any lane push, fetch the remote lane, verify expected cursor/HEAD, and push fast-forward only;
- GitHub connector/API reads remain the fallback and may be used for final durable-state verification.


## 5. C — the only canonical writer

C uses prefix-gated streaming reconciliation. It may start when both A and B have durably completed the same leading campaign prefix.

The eligibility watermark is:

C frontier <= min(A.completed_through, B.completed_through)

A C window is eligible only when the exact A and B review artifacts covering that window are durably committed on their dedicated branches. C reads the union of those paired findings and works in bounded ordinal windows.

For every C closure receipt, freeze the exact A review commit SHA, B review commit SHA, and final C mutation commit. Once C has consumed a review batch, A/B must not silently rewrite that consumed history; any correction requires an explicit correction artifact/commit and bounded C re-reconciliation.

Cross-watermark shared owners fail closed: if a Relation/Form/Identity owner touches any campaign owner beyond the current shared watermark, C may make only the already-safe Word-local mutation and must record the shared-owner action as DEFERRED_CROSS_WATERMARK until the remote endpoint is independently reviewed by both lanes.

C decision rule:

- A NO_CHANGE + B NO_CHANGE → preserve, do not reopen;
- one lane CHANGE → C verifies that bounded claim;
- both CHANGE to same target → accept after dependency/readback check;
- both CHANGE differently → C adjudicates the disagreement;
- BLOCKED → resolve evidence/identity before mutation.

C is not a third 100/100 audit.

C may inspect only findings-hit owners plus the smallest dependencies required for a correct final state.

C is the only role allowed to mutate canonical Word / Relation / Form truth during this campaign.

## 6. C closure and verification

For each bounded C semantic window:

```text
read only A/B CHANGE or BLOCKED hits
→ reconcile A ∪ B findings
→ exact final mutation package
→ fail-closed canonical apply
→ targeted readback of changed owners/dependencies
→ durable window commit on the active C checkpoint branch
```

Default execution is ~100 ordinals per semantic window. A checkpoint may use a batched-apply fast path: each window first freezes an immutable C decision manifest covering every A/B CHANGE/BLOCKED hit; canonical mutations for those decided windows may then be applied together at the checkpoint boundary. This is allowed only within the same active C checkpoint branch, with exact A/B commits frozen per manifest, cross-watermark shared owners deferred, and no semantic decision left implicit.

C semantic closure is complete when the pending manifests are applied, changed Natural Owners/dependencies read back correctly, the Natural Owner audit passes, bounded canonical validators pass, and the checkpoint receipt is durable. Final Learner Objects are derived website assets and are **not** a C merge/cursor gate.

After canonical merge, the website build pipeline materializes exactly 7,946 Final Learner Objects from current Natural Owners before Astro build. A projection/build failure is an engineering/deployment defect to repair without rolling back or freezing already-valid C semantic truth.

Targeted final readback must verify:
- every changed Word/Relation/Form owner;
- required remote anchors/dependencies;
- no unrelated semantic drift.

C does not clean unrelated historical repository debt.

If C discovers a genuinely new material semantic issue that neither A nor B found, record `DUAL_REVIEW_MISS` and resolve only that bounded owner/dependency scope. Do not trigger a third full-catalog review.


### 6A. Hot-path verification budget

A normal ~100-owner C window is a semantic production unit, not a full-system acceptance event.

Per window, run only bounded Natural Owner/dependency readback plus changed-owner QA. Do not run a full Direct Render audit, full Current-owner lineage scan, full duplicate scan, full Final Learner Object rebuild, Astro build, or browser acceptance.

A C checkpoint (normally the grouped multi-window landing boundary) changes `content/lexical/execution/dual-review-C.json`. That checkpoint PR triggers exactly one consolidated `Lexical Checkpoint Audit`, which owns the repository-wide lexical consistency scan for that checkpoint. The same full scans are not repeated after merge.

Website/FLOB delivery remains downstream engineering: merged semantic truth is authoritative even while Current performs its background projection/build.

## 7. Ruler change

If the semantic ruler materially changes while A/B are still sweeping, do not silently continue with mixed standards.

Record the ruler change, identify affected completed ranges, and rerun only the affected modules/ranges when possible.
