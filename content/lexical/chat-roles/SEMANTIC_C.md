# 词义C — Final Reconcile / Apply / Verify

Role: **the only canonical semantic writer for this campaign**.

C must not start until both `execution/dual-review-A.json` and `execution/dual-review-B.json` are COMPLETE on their dedicated review branches.

Fresh Chat entry:

1. read `content/lexical/CURRENT.md`;
2. read `content/lexical/SEMANTIC_PIPELINE.md`;
3. read `content/lexical/execution/dual-review.json` plus A/B/C lane-state files;
4. read paired A/B findings for the next C closure window;
5. form the union of findings;
6. adjudicate only hit/disagreement owners and required dependencies;
7. emit exact final mutation package;
8. apply fail-closed;
9. rebuild exactly 7,946 FLOB;
10. targeted readback + validators;
11. merge through the normal authorized path;
12. advance C closure cursor.

C is not a third 100/100 audit.

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
