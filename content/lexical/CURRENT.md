# LexicalOS Current

Role: human Work Cursor / fresh-Chat restart. Artifact, Acceptance and private Learner Truth are separate.

## Current mainline

**COMPLETED scope:** LexicalOS vNext — bounded implementation closure for `o0325–o0474`.
**COMPLETED step:** mechanically implemented the completed `o0325–o0474` semantic-review handoff with stable-identity reconciliation, integrated readback, and validation.
Catalog execution: PAUSED — **the bounded mechanical implementation of `o0475–o0674` is complete; semantic authority was `semantic-review/o0475-o0674.md`; no next range is active and `o0675+` remains inactive. This does not reactivate the full Catalog, grant K/P/R/E/U acceptance, or authorize learner-state changes.**

The prior `o0025–o0324` implementation is complete and merged at `main@52f575307fda094c9a0d6335a6544bc61e194a00`. This activation covers exactly the already-completed semantic handoff `content/lexical/semantic-review/o0325-o0474.md`: **150 owners = 105 `NO_CHANGE` + 45 `UPGRADE` + 0 `BLOCKED`**. It does not reactivate the full Catalog, grant K/P/R/E/U acceptance, alter learner state, or authorize any later ordinal.

The latest discussion is split by responsibility:

- `LEARNING_CONTRACT.md` — learner-controlled Coverage / Fast Pass / Depth / rich Recall-Reveal / local `+` / narrow Repair / transfer;
- `EVIDENCE_MEMORY_CONTRACT.md` — event validity, routing vs admission, target identity, deduplication, lifecycle, dormancy/reactivation and session compilation;
- `CONTENT_ASSET_CONTRACT.md` — final semantic quality;
- `CONTENT_EXECUTION.md` — bounded bundle / patch / readback mechanics and loop escape;
- `ACCEPTANCE.md` — evidence-supported readiness, not promises;
- `semantic-review/o0325-o0474.md` — **sole semantic authority for this bounded implementation**.

## Exact next action

No next lexical range is active. Preserve the closed `o0325–o0474` implementation for independent review; do not activate `o0475+` from the executor side.

1. Read the latest Current Word Natural Owner before mutation.
2. `NO_CHANGE` owners are byte-preserved and skipped after exact baseline verification.
3. Apply only the 45 authorized `UPGRADE` decisions; do not add semantic content not present in the handoff.
4. Reconcile identity **before** creating or retiring any sense ID.
5. Reconcile all affected Relation / word-family / exam-mapping / Form references after identity decisions.
6. Run targeted validators during bounded mechanical shards; then full integrated owner readback + lexical tests + governance audit + Astro build once at package closure.
7. Push to this review branch / Draft PR for independent Sol review. Do not merge or activate another range from the executor side.

## Frozen identity rule — learned from PR #95

Semantic upgrade does **not** imply sense-identity replacement.

For every `UPGRADE`, classify each intended learner branch as exactly one of:

```text
REUSE_EXISTING_STABLE
NEW_SEMANTIC_BRANCH
ESCALATE_IDENTITY
```

Rules:

- **Reuse an existing stable sense ID whenever semantic continuity exists**, even when the handoff broadens, narrows, corrects, re-levels, or rewrites its learner-facing definition.
- A previously deprecated stable sense may be reactivated when the handoff restores that same semantic branch.
- Do **not** deprecate an existing active main sense merely because the handoff wording is cleaner or because a new generated ID is convenient.
- Create a new sense ID only for a genuinely new semantic branch with no legitimate existing stable identity.
- Split / merge / competing stable-ID ownership, uncertain Relation truth, or unclear Form/identity boundaries are semantic questions: isolate the exact ordinal and emit a narrow Sol escalation. Continue independent owners.
- Never use a generated `handoff-*` sense ID as a default replacement for an existing stable branch.
- After reconciliation, every active Relation / word-family / exam-mapping / Form reference must target the final active identity or an explicitly valid reference-only identity. Structural validator green alone is not semantic closure.

The `acceptance` resolution from PR #95 is the model: preserve reusable stable branches, create IDs only for truly new branches, and escalate rather than guess when split/merge identity is ambiguous.

## Execution boundary

- Semantic authority: `content/lexical/semantic-review/o0325-o0474.md`.
- Executor: Codex/Luna for repository mechanics only.
- Engineering ownership: JSON, IDs, hashes, shard placement, materialized owners, reference closure, validators, tests, Git/CI/PR.
- Semantic ownership: Sol. The executor may not reinterpret `NO_CHANGE`, invent a missing sense, or resolve an ambiguous sense split/merge on its own.
- Historical audit / Wave / Fresh branches remain provenance or defect-sentinel evidence only, never semantic authority.
- Scope may include necessary shared Relation/Form/canonical registry files required by these exact 45 upgrades; no sibling lane, learner Runtime, UI, Pack, or learner-state mutation.

## Closure condition

This batch closes only when all are true:

```text
150 / 150 owners read back
105 / 105 NO_CHANGE byte-preserved
45 / 45 UPGRADE semantically faithful
0 unexplained BLOCKED
0 pending semantic escalation
stable identity reconciliation PASS
Relation / word-family / exam / Form reference closure PASS
Natural Owner / JSON / governance validators PASS
lexical tests PASS
Astro build PASS
Current rewritten to bounded-complete + Catalog PAUSED
next range remains inactive
```

After closure, stop. Do not activate `o0475+` without explicit authorization and independent review.

## Historical routes

`execution/historical-routes.json` records bounded historical disposition. It is not a work queue or another Current. Old Issue #6 / Fresh-Rebuild / S-series / Wave03 routes are superseded or paused. No historical CURRENT/ACCEPTANCE may override this file.

## Restart boundary

`main@52f57530 → this Current → CONTENT_ASSET_CONTRACT + CONTENT_EXECUTION → semantic-review/o0325-o0474.md → current owners → identity reconciliation → canonical apply → integrated readback → Draft PR → independent Sol review`

Never infer the next action from an old Issue title, branch name, branch-local receipt, chat rollback or total files edited. Chat interruption does not roll back GitHub.
