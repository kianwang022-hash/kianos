# KianOS Semantic Base Validity

Status: **CURRENT execution contract**  
Parent authority: `PROJECT_MANAGEMENT_CONTRACT.md` + `AUTHORITY_INHERITANCE_CONTRACT.md`  
Scope: active PR / branch invalidation when `main` advances

This contract exists to remove repeated low-value reconciliation work during parallel development.

The governing rule is:

> **A new `main` SHA does not invalidate a branch by itself. Only a relevant semantic or write-set change does.**

This file does not create a new project truth. It defines how workers decide whether an already-open branch must inspect newer `main`.

---

## 1 | Three results

Every open PR should be treated as one of three states:

```text
SAFE_TO_CONTINUE
RECONCILE_REQUIRED
STACKED
```

### SAFE_TO_CONTINUE

`main` advanced, but the change is outside the PR's effective Impact Cone.

The worker continues without rebase, merge-from-main, broad reread, or repeated CI solely because the base SHA changed.

### RECONCILE_REQUIRED

A newer `main` change touches at least one of:

- the PR's own write-set;
- a root authority inherited by the PR;
- the same lane's Current / contract boundary;
- a registered shared owner consumed by the PR;
- a real dependency such as Timer → Home.

The worker inspects only the reported relevant paths, makes the smallest required reconciliation, then explicitly acknowledges the new semantic base.

Reconciliation does **not** automatically mean rebase. If the branch remains correct without copying new blobs, review + acknowledgement is sufficient.

### STACKED

The PR is intentionally based on another active work branch rather than `main`.

Example:

```text
Authority
↓
Timer
↓
Home
```

The child does not independently chase `main`. Its upstream base branch owns reconciliation with `main`; the child follows that base until the dependency lands.

---

## 2 | Automatic Impact Cone

The Semantic Base Guard derives the normal Impact Cone instead of requiring every Chat to maintain duplicate metadata.

It uses:

- actual PR changed paths as the write-set;
- `AUTHORITY_OWNERSHIP.json` as the shared-owner registry;
- lane path identity for English / Xizong / Politics / Lexical;
- known shared/product capability boundaries such as Shell, Orchestrator, Timer, Home, Steward, External Reading and Current delivery;
- the PR base branch for explicit stack dependency.

The guard must not duplicate domain semantics or guess learner meaning.

---

## 3 | Semantic base receipt

A direct-to-`main` PR may carry one hidden execution marker in its PR body:

```text
<!-- kianos-semantic-base:<40-char-main-sha> -->
```

This marker means:

> the branch has been checked against `main` through this commit for the dependencies that matter to its current scope.

It is temporary PR execution metadata, not repository Truth.

When newer `main` changes are irrelevant, automation advances the marker automatically.

When newer `main` changes are relevant, automation leaves the marker unchanged and reports `RECONCILE_REQUIRED`.

After a worker actually reconciles the reported changes, it may acknowledge current `main`; acknowledgement must never be used to skip inspection.

---

## 4 | Machine behavior

Implementation:

```text
tools/semantic_base_guard.py
.github/workflows/semantic-base-validity.yml
```

The guard reports the commit status context:

```text
KianOS Semantic Base
```

Expected outcomes:

```text
SAFE_TO_CONTINUE
  main changed only outside this PR's semantic impact cone

RECONCILE_REQUIRED
  exact relevant reason(s) and path class identified

STACKED
  upstream base branch owns reconciliation with main
```

The workflow runs:

- when an active PR opens / synchronizes / reopens;
- whenever `main` advances, scanning open PRs;
- on explicit acknowledgement after real reconciliation.

---

## 5 | Hard rules

1. **Do not rebase merely because `main` changed.**
2. **Do not broad-read the repository merely because `main` changed.**
3. **Do not suppress a real authority/write-set/dependency hit to keep a PR green.**
4. **Do not make every downstream stacked PR reconcile the same upstream main change.**
5. **Do not use semantic-base acknowledgement as proof that product/runtime tests pass.**
6. **Normal domain CI still owns domain correctness; this guard only owns branch-base relevance.**

The optimization target is simple:

> **Unrelated parallel work should stay parallel. Shared dependency changes should reconcile once, at the narrowest responsible layer.**
