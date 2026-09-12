# KianOS Current Instructions

KianOS is a federated learning system with one durable shared repository state and multiple independently evolving learning lanes.

The operating goal is simple:

> A Chat may end or be replaced. The Current state, semantic owners, and continuation path must remain recoverable from `main@HEAD` with minimal reading.

## 1. Authority

- `main@HEAD` is the only normal shared Current repository state.
- Source Truth is upstream factual evidence.
- Chat may make semantic/learning judgments and author shared Current content within the user's authorized scope.
- `content/` owns shared learning assets.
- `static-web/` owns learner-facing display and interaction.
- Private learner state such as answers, progress, wrong/uncertain history, notes, timing, scheduler state, and personal transfer history is not shared Current authority.
- `EXECUTION_AUTONOMY != SEMANTIC_AUTHORITY`.

Historical commits, retired branches, releases, old Issues, compatibility snapshots, and `kianos-legacy` are recovery/reference only unless the user explicitly requests historical recovery, comparison, rollback, or migration.

## 2. Root is router, lanes own local Current

KianOS uses a total/federated structure:

```text
KianOS root Current
→ lane Current
→ first-class sub-lane/module Current when needed
→ natural semantic/content owners
→ learner runtime
```

Root governance defines only repository-wide invariants and routing. It must not duplicate lane-specific cognition or detailed lane progress.

Each first-class lane should expose the following roles, using existing filenames where possible rather than creating duplicate files:

- **owner map / manifest** — what the lane owns and where canonical Current objects live;
- **lane rules / learning contract** — stable domain cognition and learner behavior;
- **continuation cursor** — compact dynamic shared-work state for the next Chat;
- **acceptance status/evidence reference** — readiness evidence for scopes that need formal S/K/L/P/R/E/U tracking;
- **provenance** only when source identity/history genuinely requires it.

These roles may be implemented by existing lane files such as `manifest.json`, `LEARNING_CONTRACT.md`, `continuation.json`, module acceptance files, and provenance assets. Do not create a second owner merely to normalize filenames.

`CURRENT.md` at repository root is a registry/router to these lane entrypoints. It is not a manually duplicated status report for every lane.

## 3. Fresh-Chat re-entry protocol

A new Chat continuing GitHub-backed work should recover state without reconstructing the previous conversation.

Read in this order:

1. `AGENTS.md` when repository governance is not already known in the current Chat;
2. root `CURRENT.md` only far enough to resolve the target lane entrypoint;
3. the lane's continuation cursor;
4. only the exact rule/owner/evidence files named by that cursor or required by the active task;
5. current `main@HEAD` for the exact paths being changed before mutation.

Do not read every root standard, every lane file, or prior Chat history by default.

A continuation cursor should answer, compactly:

- what scope is active;
- what construction stage is active, when relevant;
- what the next action is;
- what blocks it;
- which exact Current files must be read;
- where acceptance/evidence lives when relevant.

It should not become a historical narrative, a second learning contract, or a copy of the acceptance evidence ledger.

## 4. Rule routing

Use one owner for each repository-wide concern:

- `LEARNING_ASSET_STANDARD.md` — construction order for formal learning assets;
- `LEARNING_ACCEPTANCE.md` — S/K/L/P/R/E/U readiness and learner-validation claims;
- `SYSTEM_CONTRACT.md` — shared learner-surface/platform capabilities;
- `BRANCH_LIFECYCLE.md` — temporary branches, concurrent landing, and retirement;
- `DEFERRED.md` — repository-wide intentionally postponed work.

Do not copy these standards into lane contracts or other root files. Link to the owner and add only the lane-specific rule that cannot live at root.

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

When GitHub-backed work is needed, use the smallest exact Current read set that can answer the task.

If a Current dependency is missing, fail closed and surface the missing dependency. Do not search history or legacy as a silent fallback.

Normal study/review may require zero GitHub reads when the needed learner context is already present outside repository engineering work.

## 7. Minimal-write and contention rule

Ordinary lane work should modify lane-local owners and lane-specific runtime paths only.

Do not update root governance or root `CURRENT.md` merely to record normal lane progress. Root files are high-contention control-plane files and should change only for genuine repository-wide architecture/governance changes.

Before a GitHub mutation, the concrete intended scope must be authorized by the user. Authorization is bounded to that scope. Destructive cleanup, production deployment, and real private learner-state mutation require separate explicit authorization.

For concurrent branch work, follow `BRANCH_LIFECYCLE.md`. A branch becoming behind `main` is not by itself a reason to restart work.

## 8. Content and runtime invariants

- Each semantic knowledge object has one canonical Current owner/path.
- Update that owner in place; Git history preserves prior versions.
- Preserve stable identities and provenance where present.
- Do not create second semantic owners in UI, generated files, caches, releases, compatibility stores, runtime status tables, or continuation prose.
- Exam/source material must preserve supplied passages, questions, options, official answers, and source facts faithfully.
- Different lanes and sub-lanes may have different cognition, natural units, error taxonomies, evidence units, schedulers, and UI.
- Shared runtime helpers are appropriate only when the learner decision is genuinely shared.
- Astro may parse, validate, sort, project, render, and execute Current semantics. It must not invent missing domain semantics or silently repair source/content gaps.
- Missing or invalid Current dependencies must fail closed.

## 9. Deferred and recovery

Intentionally postponed work with real future value uses the repository-wide Deferred Queue defined in `DEFERRED.md` and GitHub Issue #5. Active continuation steps stay in the relevant lane cursor.

Recovery/history access is bounded to the explicit recovery task. Once accepted material is restored to Current, resume `main@HEAD`-only operation.

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

Then do the smallest correct work. The repository should make a fresh Chat faster, not force it to reread the history of how KianOS became what it is.
