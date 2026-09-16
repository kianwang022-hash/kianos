# LexicalOS Current

Role: human Work Cursor / fresh-Chat restart. Artifact Truth, Acceptance Truth and private Learner Truth are separate.

## Current truth

```text
Production Fresh Semantic Review:      COMPLETE — 7946 / 7946
Independent Semantic Audit coverage:   COMPLETE — 7946 / 7946
mechanically implemented frontier:     o5874
post-audit closed implemented region:  o0001–o5874 COMPLETE ON MAIN
latest closed Content stage:           #251 — o5375–o5874 CLOSED via PR #254
active Content execution stage:        #256 — o5875–o6374 ACTIVE / 500 owners
active semantic authority:             o5875–o6374 reconciliation LANDED; audit accounting corrected
active semantic source union:          257 / 500 owners
cross-owner identity/Form cases:       12 frozen
exact authorized remote Word writes:   10 endpoints
remaining catalog after active stage:  o6375–o7946 NOT_ACTIVATED
```

Catalog execution: **ACTIVE / FORWARD**.

Production review, Independent Audit, Sol reconciliation, implementation, main integration and learner state are separate concepts. Only accepted integration on `main@HEAD` advances the canonical mechanical frontier.

## 1｜Production + Independent Audit are closed

- Production Fresh Semantic Review: **7946 / 7946 COMPLETE**.
- Independent Semantic Audit: **7946 / 7946 COMPLETE**, zero missing intervals.
- Audit coverage authority: `content/lexical/semantic-audit/reconciliation/CATALOG_COVERAGE_RECONCILIATION.md`.
- Do not restart broad Production Review or Independent Audit for this catalog generation.

## 2｜Mechanical / post-audit-closed frontier = o5874

Continuous closed history:

- `o0001–o0024` → PR #182.
- `o0025–o3124` → PR #179.
- `o3125–o3374` → PR #161.
- `o3375–o3624` → PR #188.
- `o3625–o3874` → PR #194.
- `o3875–o4124` → PR #208.
- `o4125–o4374` → PR #228.
- `o4375–o4874` → PR #241.
- `o4875–o5374` → PR #249.
- `o5375–o5874` → PR #254.

Latest durable integrated package receipt:

`content/lexical/execution/o5375-o5874.package-receipt.json`

The region `o0001–o5874` is post-audit closed on main. Do not reopen it without a concrete Current defect or an exact dependency named by a later active reconciliation authority.

## 3｜#256 / o5875–o6374 is the active Work Cursor

Issue **#256** owns the bounded `o5875–o6374` execution package.

Canonical semantic authority:

`content/lexical/semantic-reconciliation/o5875-o6374.md`

Machine accounting:

- `content/lexical/execution/preflight/o5875-o6374.reconciliation-compile.json`
- `content/lexical/execution/preflight/o5875-o6374.reconciliation-extras.json`
- `content/lexical/execution/preflight/o5875-o6374.remote-write-whitelist.json`
- `content/lexical/execution/preflight/o5875-o6374.activation-contract.json`

The first activation compile undercounted the middle Audit table because its verdict cells were plain text rather than backticked. The compiler now accepts both accepted table forms. This correction restores **16 omitted Audit `FLIP_TO_UPGRADE` owners** and the middle-pack Audit refinements without reopening review.

Frozen package accounting:

```text
scope owners:                              500
Production UPGRADE:                        219
Audit FLIP_TO_UPGRADE:                      38
Audit REFINE_UPGRADE:                        3
Audit FLIP_TO_NO_CHANGE:                     0
Audit IDENTITY_RISK rows before Sol:          9
semantic source-owner union:               257
terminal semantic BLOCKED after Sol:          0
terminal IDENTITY_RISK after Sol:             0
cross-owner identity/Form cases:             12
authorized out-of-range Word writes:         10
mechanical execution:                    NOT YET CLOSED
```

### Frozen cross-owner cases

Competing regional/Form pairs:

`installment/instalment`, `marvellous/marvelous`, `minimize/minimise`, `northward/northwards`, `nought/naught`, `onward/onwards`, `paralyze/paralyse`, `skeptical/sceptical`, `vigour/vigor`, `appall/appal`.

Additional identity-sensitive ownership boundaries:

`jean ↔ jeans` (fabric vs lexicalized trousers) and `lighter ↔ light` (lexicalized noun vs comparative Form).

All preserve existing stable Word IDs and exact-spelling ownership. No blind merge and no lookup theft.

### Exact remote Word write whitelist

Only these out-of-range Word owners may be mutated, and only for the exact endpoint closure named in the reconciliation:

`o0227,o2567,o2827,o2967,o3063,o3472,o4281,o5558,o7182,o7671`

Any other out-of-range reference is read-only unless a later canonical reconciliation explicitly authorizes it.

## 4｜Execution runtime — package-level, continuous and resumable

The Chat-level work unit is the **whole 500-owner package**, not a 50-owner interval.

Accepted execution shape:

```text
frozen package reconciliation
→ compile executable manifest from exact 257-owner source union
→ one continuous/resumable runner
→ internal 50-owner receipt / rollback checkpoints
→ package-wide 500/500 readback + 257/257 source accounting
→ 12 cross-owner identity/Form cases + exact 10 remote endpoints closure
→ Natural Owner + transport/shard/JSON verification
→ full Astro build
→ durable package receipt
→ package PR → main
→ only then frontier o5874 → o6374
```

Rules:

- 50-owner intervals are internal transport checkpoints only, never Chat work units.
- Existing PASS receipts are resumed/skipped on retry.
- CI/schema/hash/Git/materialization/readback defects stay executor-owned.
- Return to semantic judgment only for genuinely new ambiguity not already resolved by `o5875-o6374.md`.
- Stable-ID correction shims may only map stale compiled literals to exact Current registry identities.
- Exact source union must be consumed from compiled accounting truth rather than copied into a competing hand-maintained source list.
- Learner progress is never manufactured from engineering closure.

## Exact next action

`main@HEAD → this Current → #256 → exact 257-owner executable manifest → one continuous/resumable 500-owner executor → package verification/build/receipt → merge main → advance frontier o5874 → o6374`

Do **not**:

- reopen `o0001–o5874` without a concrete Current defect or exact #256 dependency;
- restart Production/Audit;
- split #256 into Chat-owned 50-owner tasks;
- activate overlapping Content packages;
- mutate out-of-range Word owners except the exact 10-owner whitelist;
- use #56 as a competing Content Work Cursor;
- advance the mechanical frontier before package integration on main;
- manufacture learner progress from engineering closure.

## 5｜#56 remains downstream only

Issue **#56** remains the deferred full-catalog integrated projection / integrity / K re-acceptance gate. It is not a Content Work Cursor.

## Frozen identity rule

Use only `REUSE_EXISTING_STABLE`, genuine `NEW_SEMANTIC_BRANCH` where explicitly justified by the active reconciliation, or exact identity decisions frozen there. Any genuinely new semantic ambiguity not already resolved returns narrowly to Sol; engineering/schema/hash/Git/CI blockers remain executor-owned.

## Learner-state boundary

Production Review, Audit, reconciliation, implementation, validators, CI and merged PRs do not manufacture learner progress, mastery, Memory debt or `U` evidence.

## Restart boundary

```text
main@HEAD
→ Production review = 7946/7946 COMPLETE
→ Independent Audit = 7946/7946 COMPLETE
→ mechanical frontier = o5874
→ o0001–o5874 post-audit closed on main
→ active Content stage = #256 / o5875–o6374 / 500 owners
→ semantic source union = 257
→ cross-owner identity/Form cases = 12
→ exact remote Word endpoints = 10
→ o6375–o7946 = NOT_ACTIVATED except exact #256 dependency endpoints
→ 50-owner boundaries = internal receipts only
→ #56 = DEFERRED full-catalog gate, not Work Cursor
```

Never infer a new task from an old Issue title, branch alias, Audit count, receipt, workflow, or chat history.
