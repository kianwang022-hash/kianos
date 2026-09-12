# KianOS Current Instructions

KianOS is a federated learning system with one durable shared repository state and multiple independently evolving learning lanes.

The operating goal is simple:

> A Chat may end or be replaced. Current state, semantic owners, and continuation must remain recoverable from `main@HEAD` with minimal reading.

## 1. Authority

- `main@HEAD` is the only normal shared Current repository state.
- Source Truth is upstream factual evidence.
- Chat may make semantic/learning judgments and author shared Current content within the user's authorized scope.
- `content/` owns shared learning assets.
- `static-web/` owns learner-facing display and interaction.
- Private learner state such as answers, progress, wrong/uncertain history, notes, timing, scheduler state, and personal transfer history is not shared Current authority.
- `EXECUTION_AUTONOMY != SEMANTIC_AUTHORITY`.

Historical commits, retired branches, releases, old Issues, migration records, compatibility snapshots, prior runtime implementations, and old repositories are **outside the normal reasoning/read set**. They may be opened only when the learner explicitly requests a bounded recovery, rollback, historical comparison, or migration task. Missing Current must fail closed; history is never a silent fallback.

## 2. Root is router; lanes own local Current

KianOS uses a total/federated structure:

```text
root CURRENT.md
→ content/<lane>/CURRENT.md
→ lane continuation / rules / owner map
→ first-class sub-lane Current when needed
→ natural semantic/content owners
→ learner runtime
```

Root governance defines repository-wide invariants and routing only. It must not duplicate lane-specific cognition or detailed lane progress.

Every first-class lane has one predictable entrypoint:

```text
content/<lane>/CURRENT.md
```

That file is a **router**, not a second semantic/status owner. It points to the lane's existing owners for:

- owner map / manifest;
- stable lane rules / learning contract;
- compact continuation cursor;
- acceptance status/evidence when formal tracking exists;
- provenance only when source identity genuinely requires it.

Do not create duplicate content merely to normalize filenames. A lane `CURRENT.md` references existing owners rather than copying them.

A first-class sub-lane/module should get its own `CURRENT.md` only when it is independently entered/continued often enough that doing so reduces reads. Do not create Current files for every folder.

## 3. Fresh-Chat re-entry protocol

A new Chat continuing GitHub-backed work should recover state without reconstructing the previous conversation.

Read in this order:

1. `AGENTS.md` only when repository governance is not already known in the current Chat;
2. root `CURRENT.md` only far enough to resolve the target lane;
3. `content/<lane>/CURRENT.md`;
4. the lane/sub-lane continuation cursor;
5. only the exact rule/owner/evidence files named by that cursor or required by the active task;
6. current `main@HEAD` for the exact paths being changed before mutation.

Do not read every root standard, every lane file, repository history, or prior Chat by default.

A continuation cursor should answer compactly:

- active scope;
- active construction stage when relevant;
- next action;
- blockers;
- exact required reads;
- acceptance/evidence reference when relevant.

It must not become a historical narrative, second learning contract, or copy of the evidence ledger.

## 4. Single-owner rule routing

Use one owner for each repository-wide concern:

- `LEARNING_ASSET_STANDARD.md` — construction order for formal learning assets;
- `LEARNING_ACCEPTANCE.md` — S/K/L/P/R/E/U readiness and learner-validation claims;
- `SYSTEM_CONTRACT.md` — shared learner-surface/platform capabilities;
- `BRANCH_LIFECYCLE.md` — concurrent landing, temporary branches, and retirement;
- `DEFERRED.md` — repository-wide intentionally postponed work.

Do not copy these standards into lane contracts, lane Current files, or other root files. Reference the owner and add only genuinely lane-specific rules.

For formal learning-asset work, identify the active construction stage under `LEARNING_ASSET_STANDARD.md`. Construction order is not the S/K/L/P/R/E/U acceptance framework.

## 5. Engineering state is not learner state

Shared repository state answers:

> What is KianOS building, validating, or ready to expose?

Private learner state answers:

> What has the learner actually studied, attempted, passed, forgotten, deferred, or needs next?

Never infer the second from the first.

A continuation cursor saying `validate System Exit` does not mean the learner should perform System Recall. A runtime existing does not mean the learner has reached it.

## 6. Minimal-read rule

`NORMAL_READ_AUTHORITY = main@HEAD only`.

Use the smallest exact Current read set that can answer the task. Prefer deterministic routing over repository-wide search.

If a Current dependency is missing, fail closed and surface the missing dependency. Do not search history, legacy, old branches, or migration artifacts as a fallback.

Normal study/review may require zero GitHub reads when the needed learner context is already present outside repository engineering work.

## 7. Minimal-write and contention rule

Ordinary lane work modifies lane-local owners and lane-specific runtime paths only.

Do not update root governance or root `CURRENT.md` merely to record normal lane progress. Root files are high-contention control-plane files and change only for genuine repository-wide architecture/governance changes.

Before a GitHub mutation, the concrete intended scope must be authorized by the user. Authorization is bounded to that scope. Destructive cleanup, production deployment, and real private learner-state mutation require separate explicit authorization.

For concurrent branch work, follow `BRANCH_LIFECYCLE.md`. A branch becoming behind `main` is not itself a defect and is not a reason to restart or reread unrelated work.

## 8. Content and runtime invariants

- One fact/semantic object has one canonical Current owner.
- Update that owner in place; Git history preserves prior versions.
- Preserve stable identities and provenance where present.
- Do not create second semantic owners in UI, generated files, caches, releases, compatibility stores, runtime status tables, Current routers, or continuation prose.
- Exam/source material preserves supplied passages, questions, options, official answers, and source facts faithfully.
- Different lanes/sub-lanes may have different cognition, natural units, error taxonomies, evidence units, schedulers, and UI.
- Shared runtime helpers are appropriate only when the learner decision is genuinely shared.
- Astro may parse, validate, sort, project, render, and execute Current semantics. It must not invent missing domain semantics or silently repair source/content gaps.
- Missing or invalid Current dependencies fail closed.

## 9. Deferred and recovery

Intentionally postponed work with real future value uses `DEFERRED.md` + GitHub Issue #5. Active continuation steps stay in the relevant lane cursor.

Recovery/history access is bounded to the explicit recovery task. Once an accepted result is represented in Current, immediately resume Current-only operation. Historical evidence does not remain active context merely because it was inspected during recovery.

## 10. Compact operating rule

For substantial GitHub-backed work, determine internally:

```text
lane / scope
Current entrypoint
active construction stage when relevant
exact required reads
exact intended write-set
acceptance owner when relevant
branch base SHA
```

Then do the smallest correct work. Repository structure should make each fresh Chat faster, not force it to relearn how KianOS became what it is.
