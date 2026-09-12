# KianOS Worker Instructions

This file owns **how a Chat / Agent / worker should enter and operate inside KianOS**.

It does not own product requirements, architecture, domain cognition, acceptance evidence, or learner progress.

Authority order for governance questions:

```text
PROJECT_DEFINITION.md
→ ARCHITECTURE.md
→ repository-wide Standards / Contracts
→ lane / sub-lane Contracts
→ canonical Artifact / Acceptance / Learner owners
→ CURRENT Work Cursor
→ temporary worker / branch execution
```

For ordinary lane work, do not reread the whole hierarchy. Use the smallest deterministic read path that the task requires.

---

# 1｜Core operating model

KianOS is designed for replaceable Chats and concurrent lane work.

A worker is temporary execution capacity, not project memory.

`main@HEAD` is the normal durable shared repository state after accepted work lands. Temporary branches are execution surfaces and do not become truth owners.

Normal operation uses current canonical authority only. Historical commits, old repositories, retired branches, migration records, prior implementations, and old Issues are outside the normal reasoning/read set unless the user explicitly authorizes a bounded recovery / rollback / historical comparison / migration task.

Missing Current authority fails closed. History is never a silent fallback.

---

# 2｜Three Truths + One Cursor

Keep these responsibilities separate:

## Artifact Truth
What source/content/semantic/runtime/product asset actually exists.

Read the real canonical owner or implementation. Do not rely on a status summary when the task needs the artifact itself.

## Acceptance Truth
What readiness/quality claim is actually supported by evidence.

`LEARNING_ACCEPTANCE.md` defines the S/K/L/P/R/E/U standard; it is not itself every module's current evidence ledger.

## Learner Truth
What Kian has actually studied, attempted, repaired, transferred, forgotten, deferred, or demonstrated.

Private learner state is not shared engineering Current and cannot be inferred from Artifact or Acceptance Truth.

## Work Cursor
What this worker should do next in the current scope.

The human/Chat-facing Work Cursor is `CURRENT.md` at the relevant independently continued scope.

Hard rule:

> **Artifact Truth ≠ Acceptance Truth ≠ Learner Truth; CURRENT / Work Cursor cannot manufacture any of them.**

---

# 3｜Fresh-Chat entry protocol

## 3.1 Target scope already known

If the target lane/sub-lane is known and repository governance is already understood in the Chat:

```text
target scope CURRENT
→ exact required owner(s) named by Current
→ work
```

Do not read root Current merely as ritual.

## 3.2 Target lane known, governance not known

Read:

1. this `AGENTS.md` only far enough to understand routing/boundaries;
2. target lane/sub-lane `CURRENT.md`;
3. only the exact Contract / Artifact / Acceptance / machine owner required by that Work Cursor;
4. current branch/`main@HEAD` version of exact paths before mutation.

## 3.3 Target scope unknown or root-level work

Read root `CURRENT.md` to resolve the active root Work Cursor or lane entrypoint.

For genuine governance / architecture work, also read:

- `PROJECT_DEFINITION.md`;
- `ARCHITECTURE.md`;
- only the root Standard / Contract relevant to the proposed change.

## 3.4 Continuation is not a mandatory layer

Do **not** assume every lane continuation file must be read.

A `continuation.*` file is read only when the scope Current names it as an exact required owner and it still has a proven narrow machine/process responsibility.

A continuation must not be treated as a historical narrative, second Work Cursor, Acceptance owner, Artifact owner, or learner-state owner.

Normal read target:

> **known scope → 2–4 precise reads → effective work**

If routine continuation requires broad repository search or historical reconstruction, surface that as an architecture defect rather than normalizing it.

---

# 4｜Federated scope routing

First-class lanes have predictable local Work Cursor entrypoints:

```text
content/xizong/CURRENT.md
content/english/CURRENT.md
content/lexical/CURRENT.md
content/politics/CURRENT.md
```

An independently entered/continued sub-lane may have its own `CURRENT.md` only when doing so materially reduces ambiguity/read cost.

Do not create Current files for every directory.

Root governance defines shared invariants; lanes and sub-lanes add only genuine local differences.

---

# 5｜Single-owner and inheritance rules

Use one owner per responsibility.

Repository-wide owners include:

- `PROJECT_DEFINITION.md` — project purpose, requirements, invariants, non-goals, success tests;
- `ARCHITECTURE.md` — owner hierarchy, Three Truths + One Cursor, Current/continuation/concurrency structure;
- `LEARNING_ASSET_STANDARD.md` — formal learning-asset construction order;
- `LEARNING_ACCEPTANCE.md` — S/K/L/P/R/E/U readiness standard;
- `SYSTEM_CONTRACT.md` — shared mature learner-surface capabilities;
- `BRANCH_LIFECYCLE.md` — temporary branch landing/retirement mechanics;
- `DEFERRED.md` — intentionally postponed repository work.

Lane/sub-lane Contracts reference inherited root rules and contain only genuine cognition/behavior differences.

Do not copy root rules into every lane. Do not copy Artifact/Acceptance/Learner Truth into Current.

---

# 6｜Learning-asset work

For substantial formal learning-asset work, first resolve the active construction stage under `LEARNING_ASSET_STANDARD.md`:

```text
Truth / Knowledge Boundary
→ Learning Logic
→ Content Realization / Optimization
→ Projection / Interaction
→ Runtime Loop
→ Evidence / Acceptance
```

Only the earliest unresolved stage is ACTIVE by default. A downstream defect may reopen the earliest responsible upstream stage; affected downstream work then freezes.

Construction order is not the S/K/L/P/R/E/U acceptance framework.

Never use content volume, page existence, build success, or runtime maturity as a substitute for learning closure.

---

# 7｜Learner-state boundary

Shared repository construction answers:

> What exists / what is accepted / what are we building next?

Learner Truth answers:

> What has Kian actually learned or done?

Never infer the second from the first.

Examples:

- Runtime supports System Recall ≠ Kian should perform System Recall now.
- Module ready for learner test ≠ Kian has learned the module.
- Work Cursor says `validate transfer` ≠ learner transfer has occurred.

When real learner action is required, derive it from actual learner evidence/private learner state/conversation context, not engineering position.

---

# 8｜Minimal-write and concurrency rule

Ordinary work writes only within the authorized scope.

Lane/sub-lane work should normally modify only:

- the active scope's canonical Artifact owner(s);
- its local Acceptance owner when evidence changes;
- its local Work Cursor when next action changes;
- exact runtime paths inside the authorized scope.

Do not update root governance or root `CURRENT.md` merely to record lane progress.

`main` advancing for unrelated work does not invalidate another branch by itself. Reconcile when write-sets overlap, authority changed, or an inherited parent rule materially changed.

Follow `BRANCH_LIFECYCLE.md` for branch landing/retirement.

---

# 9｜Scope containment

A worker stays inside the authorized scope.

A cross-scope defect may be:

- reported;
- recorded in the appropriate owner/Deferred mechanism when authorized;
- used to block and escalate the current task.

It is not automatic permission to repair unrelated siblings/downstream layers.

For staged learning-asset work, continue to obey the earliest unresolved stage.

---

# 10｜Compact operating rule

Before substantial GitHub-backed work, determine internally:

```text
scope
CURRENT / Work Cursor entry
active / earliest unresolved stage
exact required reads
Artifact owner(s)
Acceptance owner when relevant
Learner Truth boundary
exact intended write-set
branch base/current SHA
```

Then do the smallest correct work.

KianOS should make each fresh Chat faster to restart, not require it to relearn how the repository became what it is.
