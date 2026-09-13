# Lexical Semantic Audit Finding Severity

Audit verdict and severity are separate.

- `LOCAL` — bounded learner-facing defect such as malformed production string, local wrong attachment, duplicate residue, or local ranking issue without branch-inventory change.
- `MATERIAL` — missing/wrong/over-broad/mis-ranked sense, construction, Core branch, or learner-use boundary that can materially alter comprehension, discrimination, translation, or useful production.
- `IDENTITY` — stable sense continuity, Form/Relation ownership, split/merge, capitalization/pronunciation identity, deprecation/reactivation, or reciprocal-anchor failure.

Every non-PASS Audit finding must carry one of these severities plus a frozen risk-family label.
