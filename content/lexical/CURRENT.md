# LexicalOS Current

Role: human Work Cursor / fresh-Chat restart. Artifact Truth, Acceptance Truth and private Learner Truth are separate.

## Current truth

```text
Production Fresh Semantic Review:      COMPLETE — 7946 / 7946
Independent Semantic Audit coverage:   COMPLETE — 7946 / 7946
mechanically implemented frontier:     o5374
post-audit closed implemented region:  o0001–o5374 COMPLETE ON MAIN
latest closed Content stage:           #245 — o4875–o5374 CLOSED via PR #249
active Content execution stage:        #251 — o5375–o5874 ACTIVE / 500 owners
active semantic authority:             o5375–o5874 reconciliation LANDED via PR #252
active semantic source union:          190 / 500 owners
frozen identity cases:                 15 / 15 resolved
exact authorized remote Word writes:   22 endpoints
remaining catalog after active stage:  o5875–o7946 NOT_ACTIVATED
```

Catalog execution: **ACTIVE / FORWARD**.

Production review, Independent Audit, Sol reconciliation, branch-local execution, main integration and learner state are separate concepts. Only accepted integration on `main@HEAD` advances the canonical mechanical frontier.

## 1｜Production + Independent Audit are closed

- Production Fresh Semantic Review: **7946 / 7946 COMPLETE**.
- Independent Semantic Audit: **7946 / 7946 COMPLETE**, zero missing intervals.
- Audit coverage authority: `content/lexical/semantic-audit/reconciliation/CATALOG_COVERAGE_RECONCILIATION.md`.
- Do not restart broad Production Review or Independent Audit for this catalog generation.

## 2｜Mechanical / post-audit-closed frontier = o5374

Continuous closed history:

- `o0001–o0024` → PR #182.
- `o0025–o3124` → PR #179.
- `o3125–o3374` → PR #161.
- `o3375–o3624` → PR #188.
- `o3625–o3874` → PR #194 / merge `1806a603e12c33b085dc491de8b4a80134948293`.
- `o3875–o4124` → PR #208 / merge `b65b3590d97916d8a2e0cb1780476a41a91db3b9`.
- `o4125–o4374` → PR #228 / merge `04207abc64a43254aac9b3539008335c2c18d37b`.
- `o4375–o4874` → PR #241 / merge `b6681f598928c7e9cd81f4cb27a617574c566c33`.
- `o4875–o5374` → PR #249 / merge `729cbf2a8cb1061c71bbbc27e3c596b7a9e6d0bf`.

Latest durable integrated package receipt:

`content/lexical/execution/o4875-o5374.package-receipt.json`

The region `o0001–o5374` is post-audit closed on main. Do not reopen it without a concrete Current defect or an exact dependency named by a later active reconciliation authority.

## 3｜#251 / o5375–o5874 is the active Work Cursor

Issue **#251** owns the bounded `o5375–o5874` execution package.

Canonical semantic authority:

`content/lexical/semantic-reconciliation/o5375-o5874.md`

Activation authority landed via PR **#252**. The package is now semantically frozen but **not mechanically closed**.

Machine-compiled accounting truth:

- `content/lexical/execution/preflight/o5375-o5874.reconciliation-compile.json`
- `content/lexical/execution/preflight/o5375-o5874.reconciliation-extras.json`
- `content/lexical/execution/preflight/o5375-o5874.remote-write-whitelist.json`
- `content/lexical/execution/preflight/o5375-o5874.activation-contract.json`

Frozen package accounting:

```text
scope owners:                              500
Production UPGRADE:                        163
Audit FLIP_TO_UPGRADE:                      27
Audit REFINE_UPGRADE:                       10
Audit FLIP_TO_NO_CHANGE:                     0
Audit IDENTITY_RISK before Sol:              1
semantic source-owner union:               190
Production explicit identity cases:         15
terminal semantic BLOCKED after Sol:          0
terminal IDENTITY_RISK after Sol:             0
authorized out-of-range Word writes:         22
mechanical execution:                    NOT YET CLOSED
```

### Frozen identity rule for this package

All 15 regional/spelling/number cases preserve both existing stable Word owners. Do not merge Word IDs and do not steal exact-spelling lookup ownership. Close them through reciprocal regional/style/sense-bounded/number Relations as frozen in the reconciliation.

The 15 cases are:

`airplane/aeroplane`, `disk/disc`, `enroll/enrol`, `fertilizer/fertiliser`, `inquire/enquire`, `inquiry/enquiry`, `kilometer/kilometre`, `liter/litre`, `organize/organise`, `outskirt/outskirts`, `realize/realise`, `recognize/recognise`, `analogue/analog`, `cozy/cosy`, `glamour/glamor`.

The sole Audit terminal identity risk (`glamour`) is already resolved by the same Production identity decision and is not an open review question.

### Exact remote Word write whitelist

Only these out-of-range Word owners may be mutated, and only for the exact reciprocal Relation/anchor closure named in the reconciliation:

`o0098,o0186,o1111,o1405,o1666,o1667,o1669,o1907,o2140,o2708,o2855,o3375,o3406,o3575,o3931,o3962,o3988,o4168,o4300,o4413,o5339,o6495`

`o6495` is `censure`; its ordinal was resolved from Current exact-spelling lookup for the accepted `censor ↔ censure` confusable boundary before activation landed.

Any other out-of-range ordinal mentioned by overlapping Audit source files is read-only unless a new canonical reconciliation explicitly authorizes it.

## 4｜Execution runtime — package-level, continuous and resumable

The Chat-level work unit is the **whole 500-owner package**, not a 50-owner interval.

Accepted execution shape:

```text
frozen package reconciliation
→ compile executable manifest from exact 190-owner source union
→ one continuous/resumable runner
→ internal 50-owner receipt / rollback checkpoints
→ package-wide 500/500 readback + 190/190 source accounting
→ 15 identity cases + exact 22 remote endpoints closure
→ Natural Owner + transport/shard/JSON verification
→ full Astro build
→ durable package receipt
→ package PR → main
→ only then frontier o5374 → o5874
```

Rules:

- 50-owner intervals are internal transport checkpoints only. They are not semantic-review units and are not Chat work units.
- Existing PASS receipts are resumed/skipped on retry, never replayed merely because a later mechanical step fails.
- CI/schema/hash/Git/materialization/readback defects stay executor-owned.
- Return to semantic judgment only for a genuinely new ambiguity not already resolved by `o5375-o5874.md`.
- Stable-ID correction shims may only map stale compiled literals to exact Current registry identities; they must not create or silently re-decide semantic identity.
- The exact 190-owner source union must be consumed from the compiled accounting artifact rather than copied into a competing hand-maintained source list.
- Cross-owner spelling variants remain separate stable Word owners in this package.

This throughput rule does not weaken fail-closed identity, rollback, provenance, receipt, or verification requirements.

## Exact next action

Continue only from:

`main@HEAD → this Current → #251 → content/lexical/semantic-reconciliation/o5375-o5874.md`

Then:

`compile executable manifest → run one continuous/resumable 500-owner executor → package verification/build/receipt → merge main → advance frontier o5374 → o5874`

Do **not**:

- reopen `o0001–o5374` without a concrete Current defect or an exact dependency authorized by #251;
- restart Production/Audit;
- split #251 into Chat-owned 50-owner tasks;
- activate an overlapping Content package;
- mutate out-of-range Word owners except the exact 22-owner whitelist;
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
→ mechanical frontier = o5374
→ o0001–o5374 post-audit closed on main
→ active Content stage = #251 / o5375–o5874 / 500 owners
→ active reconciliation = o5375-o5874.md / PR #252
→ semantic source union = 190
→ frozen identity cases = 15
→ exact remote Word endpoints = 22
→ 50-owner boundaries = internal receipts only
→ o5875–o7946 = NOT_ACTIVATED except exact #251 dependency endpoints
→ #56 = DEFERRED full-catalog gate, not Work Cursor
```

Never infer a new task from an old Issue title, branch alias, Audit count, receipt, workflow, or chat history.
