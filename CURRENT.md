# KianOS Current Registry

**Repository:** `kianwang022-hash/kianos`  
**Durable shared branch:** `main`

`main@HEAD` is the only normal shared Current repository state.

KianOS is intentionally federated:

```text
root CURRENT.md
→ content/<lane>/CURRENT.md
→ lane continuation / rules / owner map
→ first-class sub-lane Current when needed
→ natural semantic/content owner
→ learner runtime
```

Root Current answers **where to enter**. Lane Current answers **where that lane's live state and rules are owned**. Private learner state answers **what the learner personally should do next**.

## Current-only boundary

Normal KianOS work is Current-only.

Old repositories, old commits, retired branches, historical Issues, migration records, prior runtime implementations, compatibility snapshots, and other historical artifacts are outside the normal reasoning/read set even when they remain accessible.

They may be opened only when the learner explicitly requests a bounded recovery, rollback, historical comparison, or migration task. Historical material has no authority merely because it looks more complete or familiar.

When a bounded recovery task ends, accepted results must be represented in Current and normal operation immediately returns to `main@HEAD` only.

## Root standards

| Concern | Canonical owner |
| --- | --- |
| Repository bootstrap / read routing | `AGENTS.md` |
| Formal learning-asset construction order | `LEARNING_ASSET_STANDARD.md` |
| S/K/L/P/R/E/U readiness | `LEARNING_ACCEPTANCE.md` |
| Shared learner-surface capabilities | `SYSTEM_CONTRACT.md` |
| Concurrent branch landing / retirement | `BRANCH_LIFECYCLE.md` |
| Intentionally postponed work | `DEFERRED.md` + GitHub Issue #5 |

These are single owners. Lane files reference them rather than copy them.

## Lane entrypoints

| Lane | Current entrypoint |
| --- | --- |
| Xizong | `content/xizong/CURRENT.md` |
| English | `content/english/CURRENT.md` |
| LexicalOS | `content/lexical/CURRENT.md` |
| Politics | `content/politics/CURRENT.md` |
| Shared learner runtime | `static-web/` |

Fresh Chat rule:

```text
root CURRENT
→ target lane CURRENT
→ lane/sub-lane continuation
→ exact files named by that continuation
```

Do not scan unrelated lanes.

## Lane-Current contract

A lane `CURRENT.md` is deliberately small. It should identify:

- canonical owner map / manifest;
- stable lane rules / learning contract;
- continuation cursor;
- formal acceptance owner when one exists;
- source/provenance root when relevant;
- learner runtime entry;
- independently continued sub-lanes when they have their own Current entrypoint.

It must not duplicate detailed progress, semantic content, acceptance evidence, or historical narrative.

Normal progress updates belong in the lane/sub-lane continuation or canonical owner, not in root `CURRENT.md`.

## Shared runtime boundary

`static-web/` is the shared learner-facing execution layer. It may project Current semantics and provide genuinely shared interaction utilities, but it is not a parallel semantic owner.

A lane may use a different cognitive model, natural unit, error taxonomy, evidence model, scheduler, or UI. Shared platform code does not require semantic uniformity.

## Read-friction target

For ordinary continuation of one lane, a fresh Chat should normally recover enough state in roughly 2–4 targeted reads after repository routing is known.

If continuation repeatedly requires broad repository search or rereading large root documents, the routing/state ownership is too diffuse and should be simplified rather than normalized as routine.
