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
both complete
        ↓
C reconcile → apply → targeted verify → merge
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

Each lane advances only its own cursor after its durable batch artifact is committed. The other lane's cursor may be used only for completion status; its result files are off-limits for semantic reading until C.

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

C does not start until both A and B are COMPLETE.

C reads the union of A and B findings and works in bounded ordinal windows.

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

For each bounded C landing window:

```text
reconcile A ∪ B
→ exact final mutation package
→ fail-closed apply
→ rebuild exactly 7,946 FLOB
→ targeted final readback
→ validators
→ merge
```

Targeted final readback must verify:
- every changed Word/Relation/Form owner;
- required remote anchors/dependencies;
- final learner projection for changed objects;
- no unrelated semantic drift.

C does not clean unrelated historical repository debt.

If C discovers a genuinely new material semantic issue that neither A nor B found, record `DUAL_REVIEW_MISS` and resolve only that bounded owner/dependency scope. Do not trigger a third full-catalog review.

## 7. Ruler change

If the semantic ruler materially changes while A/B are still sweeping, do not silently continue with mixed standards.

Record the ruler change, identify affected completed ranges, and rerun only the affected modules/ranges when possible.
