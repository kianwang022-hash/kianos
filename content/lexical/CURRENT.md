# LexicalOS Current

Role: human Work Cursor / fresh-Chat restart. Artifact Truth, Acceptance Truth and private Learner Truth are separate.

## Current truth

```text
Production Fresh Semantic Review:      COMPLETE — 7946 / 7946
Independent Semantic Audit coverage:   COMPLETE — 7946 / 7946
mechanically implemented frontier:     o4874
post-audit closed implemented region:  o0001–o4874 COMPLETE ON MAIN
latest closed Content stage:           #234 — o4375–o4874 CLOSED via PR #241
active Content execution stage:        #245 — o4875–o5374 ACTIVE / 500 owners
active semantic authority:             o4875–o5374 reconciliation LANDED via PR #244
active semantic source union:          159 / 500 owners
authorized out-of-range Word writes:   8 exact endpoints
remaining catalog after active stage:  o5375–o7946 NOT_ACTIVATED
```

Catalog execution: **ACTIVE / FORWARD**.

Production review, Independent Audit, Sol reconciliation, branch-local execution, main integration and learner state are separate concepts. Only accepted integration on `main@HEAD` advances the canonical mechanical frontier.

## 1｜Production + Independent Audit are closed

- Production Fresh Semantic Review: **7946 / 7946 COMPLETE**.
- Independent Semantic Audit: **7946 / 7946 COMPLETE**, zero missing intervals.
- Audit coverage authority: `content/lexical/semantic-audit/reconciliation/CATALOG_COVERAGE_RECONCILIATION.md`.
- Do not restart broad Production Review or Independent Audit for this catalog generation.

## 2｜Mechanical / post-audit-closed frontier = o4874

Continuous closed history:

- `o0001–o0024` → PR #182.
- `o0025–o3124` → PR #179.
- `o3125–o3374` → PR #161.
- `o3375–o3624` → PR #188.
- `o3625–o3874` → PR #194 / merge `1806a603e12c33b085dc491de8b4a80134948293`.
- `o3875–o4124` → PR #208 / merge `b65b3590d97916d8a2e0cb1780476a41a91db3b9`.
- `o4125–o4374` → PR #228 / merge `04207abc64a43254aac9b3539008335c2c18d37b`.
- `o4375–o4874` → PR #241 / merge `b6681f598928c7e9cd81f4cb27a617574c566c33`.

Latest durable integrated package receipt:

`content/lexical/execution/o4375-o4874.package-receipt.json`

The region `o0001–o4874` is post-audit closed on main. Do not reopen it without a concrete Current defect or an exact dependency named by a later active reconciliation authority.

## 3｜#245 / o4875–o5374 is the active Work Cursor

Issue **#245** owns the bounded `o4875–o5374` execution package.

Canonical semantic authority:

`content/lexical/semantic-reconciliation/o4875-o5374.md`

Reconciliation landed via PR **#244** / merge `52a88cdfdf6bb525cb2d9bfa31b02f60958f81ed`.

Machine-compiled accounting truth:

`content/lexical/execution/preflight/o4875-o5374.reconciliation-compile.json`

Frozen package accounting:

```text
scope owners:                              500
Production UPGRADE before Audit:           102
Audit FLIP_TO_NO_CHANGE:                     4
retained Production semantic sources:       98
Audit additions beyond Production:          61
semantic source-owner union:               159
terminal semantic BLOCKED after Sol:         0
terminal IDENTITY_RISK after Sol:            0
authorized out-of-range Word writes:         8
mechanical execution:                    NOT YET CLOSED
```

The eight exact remote Word endpoints are `o1020,o1410,o2069,o2586,o2671,o4524,o4825,o5416`. They may be touched only for the exact reciprocal Relation/Form or stale-anchor closure frozen in the package reconciliation. `o5416` remains otherwise outside the active frontier.

The four terminal identity decisions are already frozen in the reconciliation and are **not** open review questions:

- `there@o4972`: survive the three-way horizontal their/there/they're confusable identity; retire the duplicate pair representation after evidence/anchors are preserved.
- `think@o4986`: restore existing ordinary stable senses; survive one think↔thought horizontal identity; preserve the existing think↔suppose Relation and retarget stale suppose payloads to the active stable sense.
- `turkey@o5159`: one Word owner; preserve common senses and the proper-name country sense through the existing case-sensitive Form/identity overlay.
- `verse@o5276`: preserve the historical verb stable ID as reference-only; keep modern verse on poetry/versify and represent `versed / well versed` as same-owner lexicalized Form truth.

## 4｜Execution runtime — package-level, continuous and resumable

The Chat-level work unit is a **whole bounded package**, not a 50-owner interval.

Accepted execution shape:

```text
frozen package reconciliation
→ compile package execution authority once
→ one continuous/resumable runner
→ internal 50-owner receipt / rollback checkpoints
→ package-wide readback + source accounting
→ identity/Form/Relation closure
→ Natural Owner + transport/shard/JSON verification
→ full Astro build
→ durable package receipt
→ package PR → main
```

Rules:

- 50-owner intervals are internal transport checkpoints only. They are not semantic-review units and are not Chat work units.
- Existing PASS receipts are resumed/skipped on retry, never replayed merely because a later mechanical step fails.
- CI/schema/hash/Git/materialization/readback defects stay executor-owned and should be solved with reusable mechanical primitives.
- Return to semantic judgment only for a genuinely new ambiguity not already resolved by the active reconciliation.
- Stable-ID correction shims may only map stale compiled literals to exact Current registry identities; they must not create or silently re-decide semantic identity.
- The exact 159-owner source union must be consumed from the compiled accounting artifact rather than copied into another manual source set.

This throughput rule does not weaken fail-closed identity, rollback, provenance, receipt, or verification requirements.

## Exact next action

Continue only from:

`main@HEAD → this Current → #245 → content/lexical/semantic-reconciliation/o4875-o5374.md`

Then:

`compile Current identity evidence once → compile execution sheet/manifest authority once → activate one survivor execution branch → one continuous/resumable 500-owner runner → package verification/build/receipt → merge main → advance frontier o4874 → o5374`

Do **not**:

- reopen `o0001–o4874` without a concrete Current defect or exact authorized dependency;
- restart Production/Audit;
- split #245 into Chat-owned 50-owner tasks;
- activate an overlapping Content package;
- mechanically mutate owners outside the 500-owner range except the eight exact remote endpoints;
- use #56 as a competing Content Work Cursor;
- advance the mechanical frontier before package integration on main;
- manufacture learner progress from engineering closure.

## 5｜#56 remains downstream only

Issue **#56** remains the deferred full-catalog integrated projection / integrity / K re-acceptance gate. It is not a Content Work Cursor and does not become active merely because another bounded Content package is executing.

## Frozen identity rule

Use only `REUSE_EXISTING_STABLE`, genuine `NEW_SEMANTIC_BRANCH` where explicitly justified by the active reconciliation, or exact identity decisions frozen there. Any genuinely new semantic ambiguity not already resolved returns narrowly to Sol; engineering/schema/hash/Git/CI blockers remain executor-owned.

## Learner-state boundary

Production Review, Audit, reconciliation, implementation, validators, CI and merged PRs do not manufacture learner progress, mastery, Memory debt or `U` evidence.

## Restart boundary

```text
main@HEAD
→ Production review = 7946/7946 COMPLETE
→ Independent Audit = 7946/7946 COMPLETE
→ mechanical frontier = o4874
→ o0001–o4874 post-audit closed on main
→ active Content stage = #245 / o4875–o5374 / 500 owners
→ active reconciliation = LANDED via PR #244
→ semantic source union = 159
→ exact remote Word endpoints = 8
→ 50-owner boundaries = internal receipts only
→ o5375–o7946 = NOT_ACTIVATED except exact o5416 dependency write
→ #56 = DEFERRED full-catalog gate, not Work Cursor
```

Never infer a new task from an old Issue title, branch alias, Audit count, receipt, workflow, or chat history.
