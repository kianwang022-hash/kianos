# LexicalOS Current

Role: human Work Cursor / fresh-Chat restart. Artifact Truth, Acceptance Truth and private Learner Truth are separate.

## Current mainline

**Latest completed bounded implementation:** `o1875–o2124`.

Accepted landing:

- semantic authority: `content/lexical/semantic-review/o1875-o2124.md`;
- implementation PR: **#129**;
- merge commit: `42953f630fea1cbef34bcd5d8da8e8f3c1db844b`;
- exact scope: 250 owners;
- `NO_CHANGE`: 206 / 206 byte-preserved;
- `UPGRADE`: 44 / 44 mechanically applied;
- `BLOCKED`: 0;
- semantic escalations: 0;
- identity reconciliation: 26 `REUSE_EXISTING_STABLE` + 4 `NEW_SEMANTIC_BRANCH` + 0 `ESCALATE_IDENTITY`;
- Relation closure: PASS;
- Form closure: PASS;
- full final-object readback: PASS;
- Natural Owner audit / lexical transport / JSON / Astro build / `git diff --check`: PASS.

Prior bounded implementation packages through `o0474` are already historical landed substrate. Do not use their old PR bodies or branch-local cursors as the current next-action owner.

## Catalog execution

**ACTIVE — bounded implementation and integration only for `o2125–o2374`.**

Semantic authority is exactly:

`content/lexical/semantic-review/o2125-o2374.md`

This activation is authorized for the current continuous mechanical lane only. It does not reactivate the full Catalog, grant K/P/R/E/U acceptance, alter learner state, or authorize `o2375+`.

The prior package is integrated at `main@42953f63`; this activation is limited to the next 250-owner handoff. It does not activate `o2375+`.

Local bounded implementation is closed pending integration: `210 NO_CHANGE` owners are byte-preserved, `40 UPGRADE` decisions are mechanically applied, `BLOCKED = 0`, and semantic escalations = `0`. The final-object, identity/reference, Natural Owner, tests, JSON, diff, and Astro build checks passed. This does not mark the package complete on `main` or activate `o2375+`.

## Exact next action

The active lexical range is exactly `o2125–o2374`; do not activate `o2375+` from the executor side.

1. Read the latest Current Word Natural Owner before mutation.
2. Preserve the 210 byte-preserved `NO_CHANGE` owners and apply only the 40 authorized `UPGRADE` decisions.
3. Push this bounded package for CI/integration; after merge, refresh `main` before any later activation and do not activate `o2375+` from this package.

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
