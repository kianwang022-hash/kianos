# LexicalOS Current

Role: human Work Cursor / fresh-Chat restart. Artifact Truth, Acceptance Truth and private Learner Truth are separate.

## Current mainline

**Latest completed bounded implementation:** `o1125–o1374`.

Accepted landing:

- semantic authority: `content/lexical/semantic-review/o1125-o1374.md`;
- implementation PR: **#122**;
- merge commit: `81abe3ca297649c99f27ed32992f17e366dba95c`;
- exact scope: 250 owners;
- `NO_CHANGE`: 183 / 183 byte-preserved;
- `UPGRADE`: 67 / 67 mechanically applied;
- `BLOCKED`: 0;
- semantic escalations: 0;
- identity reconciliation: 34 `REUSE_EXISTING_STABLE` + 8 `NEW_SEMANTIC_BRANCH` + 0 `ESCALATE_IDENTITY`;
- Relation closure: PASS;
- Form closure: PASS;
- full final-object readback: PASS;
- Natural Owner audit / lexical transport / JSON / Astro build / `git diff --check`: PASS.

Prior bounded implementation packages through `o0474` are already historical landed substrate. Do not use their old PR bodies or branch-local cursors as the current next-action owner.

## Catalog execution

**ACTIVE — bounded implementation only for `o1375–o1624`.**

Semantic authority is exactly:

`content/lexical/semantic-review/o1375-o1624.md`

This activation is authorized for the current continuous mechanical lane only. It does not reactivate the full Catalog, grant K/P/R/E/U acceptance, alter learner state, or authorize `o1625+`.

Local bounded implementation is mechanically closed and pending integration: 172 `NO_CHANGE` owners are byte-preserved, 78 `UPGRADE` owners are applied, full-object readback is PASS, and no semantic escalation is open. This does not activate `o1625+`.

The prior package is integrated at `main@81abe3ca`; this activation is limited to the next 250-owner handoff. It does not activate `o1625+`.

## Exact next action

The active lexical range is exactly `o1375–o1624`; do not activate `o1625+` from the executor side.

1. Read the latest Current Word Natural Owner before mutation.
2. Preserve the 172 byte-preserved `NO_CHANGE` owners and the 78 applied `UPGRADE` owners through final review.
3. Push this bounded package for CI/integration; after merge, refresh `main` before any later activation and do not activate `o1625+` from this package.

## Frozen identity rule

Semantic upgrade does **not** imply sense-identity replacement.

For every `UPGRADE`, classify each intended learner branch as exactly one of:

```text
REUSE_EXISTING_STABLE
NEW_SEMANTIC_BRANCH
ESCALATE_IDENTITY
```

Rules:

- reuse an existing stable sense ID whenever semantic continuity exists, even when learner-facing wording changes materially;
- a deprecated stable sense may be reactivated when the handoff restores that same semantic branch;
- do not deprecate an active stable sense merely because a generated replacement is convenient;
- create a new sense ID only for a genuinely new semantic branch with no legitimate existing stable identity;
- split / merge / competing stable-ID ownership, uncertain Relation truth, or unclear Form/identity boundaries are semantic questions: isolate the exact owner and escalate rather than guess;
- never use a generated `handoff-*` sense ID as the default replacement for a reusable stable branch;
- every active Relation / word-family / exam-mapping / Form reference must close against the final active identity or an explicitly valid reference-only identity.

## Responsibility split

- learner semantics → `content/lexical/LEARNING_CONTRACT.md`;
- Evidence / Memory semantics → `content/lexical/EVIDENCE_MEMORY_CONTRACT.md`;
- final semantic quality → `content/lexical/CONTENT_ASSET_CONTRACT.md`;
- bounded execution mechanics → `content/lexical/CONTENT_EXECUTION.md`;
- Acceptance Truth → `content/lexical/ACCEPTANCE.md`;
- independent semantic audit governance → `content/lexical/INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md` + Issue #106;
- current catalog Work Cursor → **this file only**.

Historical audit / Wave / Fresh branches, old Issues, retired execution receipts and branch-local Current files are provenance or defect-sentinel evidence only. They do not activate work.

## Learner-state boundary

Catalog implementation, semantic review, independent audit, validators, CI and merged PRs do not manufacture learner progress, mastery, Memory debt or `U` evidence.

## Restart boundary

```text
main@HEAD
→ content/lexical/CURRENT.md
→ if PAUSED: stop
→ if explicitly ACTIVE: exact semantic handoff + CONTENT_ASSET_CONTRACT + CONTENT_EXECUTION
→ current owners
→ stable-identity reconciliation
→ bounded canonical apply
→ integrated readback / validators
→ bounded PR
→ main readback
→ PAUSED
```

Never infer the next action from an old Issue title, branch name, PR receipt, audit count or chat history.
