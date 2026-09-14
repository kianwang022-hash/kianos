# KianOS Stage Execution Quickstart

Use with `STAGED_PRODUCT_ACCEPTANCE_PROTOCOL.md` and the v3 Astra master.

## Global rule

A Stage Issue is a **scope boundary, not an implementation recipe**. Astra must restore the whole #113 Program position first, then autonomously inspect code/browser/tests and choose implementation details inside the current Stage.

## Required opening line for each Astra Stage

```text
Restore the full #113 program context before acting. Read latest main, static-web/CURRENT.md,
CODEX_ASTRA_THREE_SUBJECT_SITE_EXECUTION.md, STAGED_PRODUCT_ACCEPTANCE_PROTOCOL.md,
and the current Stage Issue. Treat the Stage as scope/invariants/exit, not a step-by-step SOP.
Preserve accepted evidence; do not redo PASS work. Proactively find and fix in-scope defects,
run real browser checks, and make bounded product/visual judgments. Record out-of-scope issues
without expanding into them. Stop at the Stage exit and return evidence plus what Kian should
personally inspect before merge.
```

## Human checkpoints

Astra's final Stage receipt must always contain a short `KIAN HUMAN GATE` section with:
- exactly which live route/build Kian should open;
- 3–6 concrete interactions to perform;
- what subjective/product question each interaction is checking;
- what would count as reject vs accept;
- no shell commands unless Kian specifically asks for engineering inspection.

The human gate is not a substitute for CI or independent review, and CI is not a substitute for the human gate.
