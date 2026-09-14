# LexicalOS Current

Role: human Work Cursor / fresh-Chat restart. Artifact Truth, Acceptance Truth and private Learner Truth are separate.

## Current mainline

**Latest completed bounded mechanical implementation:** `o3125–o3374`.

Merged landing:

- original semantic authority: `content/lexical/semantic-review/o3125-o3374.md`;
- implementation PR: **#134**;
- merge commit: `36cca65fb0910c00401c4b92a86417ec4ac5dffb`;
- exact scope: 250 owners;
- original package: `207 NO_CHANGE`, `43 UPGRADE`, `0 BLOCKED`;
- original identity reconciliation: 41 reused stable branches + 2 handoff-authorized new semantic branches + 0 identity escalations;
- original Relation/Form/reference closure, full final-object readback, Natural Owner audit, lexical transport/JSON/Astro/`git diff --check`: PASS.

Independent post-implementation audit later found bounded deltas inside that landed range. Sol has now reconciled those deltas into one executable corrective authority rather than reopening the full 250-owner Production review.

## Sol reconciliation

**COMPLETE — 39 / 39 audit deltas adjudicated.**

Single semantic authority for the correction:

`content/lexical/semantic-reconciliation/o3125-o3374.md`

Frozen reconciliation baseline: `main@a87cba5b7ba90bff0300d5116b0c8a9ed495a993`.

Reconciled accounting:

- `27` Audit `FLIP_TO_UPGRADE` findings;
- `7` Audit `REFINE_UPGRADE` findings;
- `5` implementation-readback drift findings;
- `7` explicitly authorized `NEW_SEMANTIC_BRANCH` targets;
- `0` terminal `ESCALATE_IDENTITY`;
- `0` new Relation IDs;
- two exact shared-owner reciprocal writes only: `compel@o0941`, `subjective@o4764`.

Relevant evidence remains:

- `content/lexical/semantic-audit/o3025-o3224.audit.md` — implemented overlap `o3125–o3224`;
- `content/lexical/semantic-audit/o3225-o3424.audit.md` — implemented overlap `o3225–o3374`; its `o3375–o3424` portion remains pre-implementation evidence only.

## Catalog execution

**READY_FOR_BOUNDED_CORRECTIVE_IMPLEMENTATION — corrective package authorized but not yet started.**

The contiguous mechanically implemented frontier remains exactly `o3374`.

The only executable semantic authority is:

`content/lexical/semantic-reconciliation/o3125-o3374.md`

Luna/Codex may now open one bounded corrective implementation package for those 39 reconciled deltas. Executor responsibilities are mechanical only: preserve/reuse/reactivate/merge the exact stable identities Sol resolved; generate stable IDs only for the seven explicitly authorized new semantic branches; perform only the two exact remote reciprocal writes; and return any material drift or unexpected identity ambiguity to Sol.

`o3375–o3624` is **NOT_ACTIVATED**. Completing this corrective package does not automatically advance the catalog frontier or authorize the next Production package.

## Exact next action

1. Refresh `main@HEAD` and verify this Current cursor still points to the same reconciliation authority.
2. Read `content/lexical/semantic-reconciliation/o3125-o3374.md`, `CONTENT_ASSET_CONTRACT.md`, and `CONTENT_EXECUTION.md`.
3. Compare the 39 target owners plus exact dependencies against the authority baseline; isolate any material drift instead of improvising.
4. Create one bounded corrective implementation branch/package for the 39 delta owners plus only the authorized remote dependency writes at `o0941` and `o4764`.
5. Apply the reconciled desired states mechanically. No semantic re-review and no opportunistic cleanup.
6. Run full final integrated learner-object readback of all 39 delta owners and exact shared dependencies, stable identity/reference closure, Relation/Form closure, Natural Owner audit, lexical tests/JSON, `git diff --check`, and Astro build as required by the execution contract.
7. Merge only after that bounded correction closes cleanly; then reread merged `main` and reconcile this Current cursor.
8. Do not activate `o3375+` from the executor side.

## Frozen identity rule

Semantic correction does **not** imply sense-identity replacement.

For every executable correction, use exactly one of:

```text
REUSE_EXISTING_STABLE
NEW_SEMANTIC_BRANCH
ESCALATE_IDENTITY
```

The current reconciliation authority has already resolved the known scope to seven `NEW_SEMANTIC_BRANCH` targets and zero `ESCALATE_IDENTITY` targets. Executor must not invent additional new branches or identity escalations silently.

Rules:

- reuse an existing stable sense ID whenever semantic continuity exists, even when learner-facing wording changes materially;
- deprecated stable senses may be reactivated when the reconciliation authority restores that same semantic branch;
- explicit survivor/merge/demotion decisions in the reconciliation authority are binding;
- do not deprecate an active stable sense merely because a generated replacement is convenient;
- create a new sense ID only for one of the seven genuinely new semantic branches explicitly authorized by Sol;
- unexpected split / merge / competing stable-ID ownership, uncertain Relation truth, or unclear Form/identity boundaries return to Sol rather than being guessed by the executor;
- never use a generated `handoff-*` sense ID as the default replacement for a reusable stable branch;
- every active Relation / word-family / exam-mapping / Form reference must close against final active identity or an explicitly valid reference-only identity.

## Responsibility split

- learner semantics → `content/lexical/LEARNING_CONTRACT.md`;
- Evidence / Memory semantics → `content/lexical/EVIDENCE_MEMORY_CONTRACT.md`;
- final semantic quality → `content/lexical/CONTENT_ASSET_CONTRACT.md`;
- bounded execution mechanics → `content/lexical/CONTENT_EXECUTION.md`;
- Acceptance Truth → `content/lexical/ACCEPTANCE.md`;
- independent semantic audit governance → `content/lexical/INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md` + Issue #106;
- Sol corrective semantic authority → `content/lexical/semantic-reconciliation/o3125-o3374.md`;
- current catalog Work Cursor → **this file only**.

Historical audit / Wave / Fresh branches, old Issues, retired execution receipts and branch-local Current files are provenance or defect-sentinel evidence only. They do not activate work.

## Learner-state boundary

Catalog implementation, semantic review, independent audit, Sol reconciliation, validators, CI and merged PRs do not manufacture learner progress, mastery, Memory debt or `U` evidence.

## Restart boundary

```text
main@HEAD
→ content/lexical/CURRENT.md
→ if WAITING_FOR_SOL_RECONCILIATION: executor stops
→ if READY_FOR_BOUNDED_CORRECTIVE_IMPLEMENTATION: exact reconciliation authority + CONTENT_ASSET_CONTRACT + CONTENT_EXECUTION
→ drift check on exact target/dependencies
→ bounded corrective canonical apply
→ integrated readback / validators
→ bounded PR
→ main readback
→ reconcile Current again
```

Never infer the next action from an old Issue title, branch name, PR receipt, audit count or chat history.
