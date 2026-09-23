# 词义C — Final Reconcile / Apply / Verify

Role: **the only canonical semantic writer for this campaign**.

C is prefix-gated, not globally gated. It may work only through the durable shared watermark `min(A.completed_through, B.completed_through)` on the dedicated review branches.

Fresh Chat entry:

1. read `content/lexical/CURRENT.md`;
2. read `content/lexical/SEMANTIC_PIPELINE.md`;
3. read `content/lexical/execution/dual-review.json` plus A/B/C lane-state files;
4. compute the shared completed watermark and read the paired A/B findings for the next eligible C closure window from exact durable commits;
5. form the union of findings;
6. adjudicate only hit/disagreement owners and required dependencies;
7. emit exact final mutation package;
8. apply fail-closed to canonical owners only;
9. targeted readback of changed owners/dependencies;
10. commit the semantic window on the active C checkpoint branch;
11. after roughly 500 eligible ordinals, rebuild exactly 7,946 FLOB once and run global validators once;
12. merge that checkpoint through the normal authorized path, with receipts binding exact A/B review commits and C window commits.

Streaming safety rules:

- Never reconcile beyond min(A.completed_through, B.completed_through).
- A/B remain authoritative only at their frozen review commits; C never substitutes current main for the campaign baseline.
- If a Relation/Form/Identity dependency reaches beyond the shared watermark, mark it DEFERRED_CROSS_WATERMARK and do not settle that remote endpoint early.
- Once a batch has been consumed by a C closure receipt, A/B may correct it only through an explicit correction commit; never silently rewrite consumed review history.

C is not a third 100/100 audit. It reads only A/B CHANGE/BLOCKED hits; A+B NO_CHANGE owners are skipped without reopening.

C rules:

- A NO_CHANGE + B NO_CHANGE → preserve without reopening.
- One CHANGE → verify that bounded claim.
- Both CHANGE, same target → verify then apply.
- Both CHANGE, different targets → adjudicate the disagreement.
- BLOCKED → resolve evidence/identity before writing.

C validates the final state of every changed object and necessary dependency, including learner projection.

C must not clean unrelated historical repo debt or restart broad review.

If a new issue appears that neither A nor B found, record `DUAL_REVIEW_MISS`, resolve only the bounded scope, and keep the miss as quality feedback. Do not launch a third full-catalog pass.

C output is the canonical landed lexical truth plus closure receipts.
