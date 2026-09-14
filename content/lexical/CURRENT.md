# LexicalOS Current

Role: human Work Cursor / fresh-Chat restart. Artifact Truth, Acceptance Truth and private Learner Truth are separate.

## Current mainline

**Latest completed bounded mechanical implementation:** `o3125–o3374`.

Merged landing:

- semantic authority used by the original implementation: `content/lexical/semantic-review/o3125-o3374.md`;
- implementation PR: **#134**;
- merge commit: `36cca65fb0910c00401c4b92a86417ec4ac5dffb`;
- exact scope: 250 owners;
- `NO_CHANGE`: 207 / 207 byte-preserved in that implementation package;
- `UPGRADE`: 43 / 43 mechanically applied in that implementation package;
- `BLOCKED`: 0;
- original implementation identity reconciliation: 41 reused stable branches + 2 handoff-authorized new semantic branches + 0 identity escalations;
- original implementation Relation/Form/reference closure and full final-object readback: PASS;
- Natural Owner audit / lexical transport / JSON / Astro build / `git diff --check`: PASS for PR #134.

This mechanical landing is **not the current semantic stopping authority**. Independent post-implementation audit subsequently found bounded semantic and implementation-readback deltas inside `o3125–o3374`; those findings are waiting for Sol final reconciliation before any corrective canonical execution.

Relevant independent Audit Packs:

- `content/lexical/semantic-audit/o3025-o3224.audit.md` — current implemented overlap `o3125–o3224`;
- `content/lexical/semantic-audit/o3225-o3424.audit.md` — current implemented overlap `o3225–o3374`; `o3375–o3424` is pre-implementation audit evidence only.

Prior bounded implementation packages through `o3124` are historical landed substrate. Do not use their old PR bodies or branch-local cursors as the current next-action owner.

## Catalog execution

**WAITING_FOR_SOL_RECONCILIATION — no active implementation package.**

The current implemented frontier is exactly `o3374`.

Frozen workflow for the current correction cycle:

```text
Production semantic handoff
→ Independent Audit
→ Audit Pack
→ Sol Final Reconciliation
→ Luna/Codex bounded corrective implementation
→ final integrated readback
```

The Audit Packs do not directly authorize executor edits. Sol must reconcile the bounded deltas into one implementation authority first. Luna/Codex must then execute that authority mechanically and must not independently reinterpret, discard, expand, split/merge, or resolve identity questions.

`o3375–o3624` is **not activated**. Its Production handoff and any pre-implementation Audit evidence remain non-executable until the same Audit → Sol reconciliation gate explicitly authorizes a bounded implementation package.

## Exact next action

1. Sol reads the integrated Current owners for `o3125–o3374`, the original Production handoff, and the overlapping Independent Audit Packs.
2. Sol adjudicates only the recorded delta surface; do not rerun Production review over all 250 owners.
3. Persist one bounded reconciled implementation authority with explicit final desired states and any exact shared-owner / identity handling.
4. Only after that authority exists may Luna/Codex activate a bounded corrective implementation for `o3125–o3374`.
5. After corrective merge, read back merged main and reconcile this Current cursor again.
6. Do not activate `o3375+` from the executor side.

## Frozen identity rule

Semantic upgrade does **not** imply sense-identity replacement.

For every executable semantic correction, classify each intended learner branch as exactly one of:

```text
REUSE_EXISTING_STABLE
NEW_SEMANTIC_BRANCH
ESCALATE_IDENTITY
```

Rules:

- reuse an existing stable sense ID whenever semantic continuity exists, even when learner-facing wording changes materially;
- a deprecated stable sense may be reactivated when the reconciled authority restores that same semantic branch;
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
→ if WAITING_FOR_SOL_RECONCILIATION: stop executor work and run only the explicitly bounded Sol reconciliation task
→ if PAUSED: stop
→ if explicitly ACTIVE: exact reconciled implementation authority + CONTENT_ASSET_CONTRACT + CONTENT_EXECUTION
→ current owners
→ stable-identity reconciliation already authorized by Sol
→ bounded canonical apply
→ integrated readback / validators
→ bounded PR
→ main readback
→ reconcile Current again
```

Never infer the next action from an old Issue title, branch name, PR receipt, audit count or chat history.
