# KianOS Root Current

**Repository:** `kianwang022-hash/kianos`  
**Branch:** `governance/federated-current-v2-20260912`  
**Role:** root Work Cursor + scope router

`CURRENT.md` is a navigation/control surface, not a Truth owner and not a project history.

---

## Root Work Cursor

**Active scope:** KianOS governance redesign  
**Current stage:** final governance acceptance  
**Blocker:** A5 anti-entropy gate has not executed because GitHub-hosted jobs fail before runner allocation (`steps=[]`); one bounded rerun produced the same no-start result, and exact local checkout is unavailable because the current container cannot resolve GitHub DNS  
**Next action:** do not add more governance features. When an execution environment can actually run `.github/workflows/governance-anti-entropy.yml` / `tools/governance_current_audit.py`, require a real PASS, reread the exact governance owners at that head, then update `GOVERNANCE_ACCEPTANCE.md`. If `main` moves before then, reconcile only real owner/write-set overlap.

### Reconciliation state

Latest-main concurrency debt is currently closed:

```text
main reconciled at 3409db7acfe74fdd8205927f6d39c285970811a7
governance merge commit 2e4b7b978bc87a6514e472bed6684af73ba44909
branch vs main: ahead / behind = 46 / 0 at reconciliation
PR #21: mergeable = true, draft = true
```

The reconciliation retained latest-main Politics Artifact changes while preserving the new Politics Current / Acceptance ownership and retired continuation boundary.

### Completed migration boundary

The governance redesign has migrated the normal Current / Acceptance ownership model for:

- English Objective / Translation / Writing;
- Xizong;
- LexicalOS;
- Politics.

Narrative continuation files in those audited paths are retired from normal authority. This line is a migration boundary only, not a lane-progress summary.

### Frozen / out of scope for this root task

- no new governance abstraction merely to bypass the execution blocker;
- no learning-content/source semantic rewrite under governance authority;
- no private learner-state mutation;
- no broad lane feature work;
- no reopening of accepted domain cognition merely to simplify governance;
- no merge to `main` before `GOVERNANCE_ACCEPTANCE.md` is merge-ready on an actually executed anti-entropy gate.

---

## Authority

Highest-level owners:

- project requirements / invariants → `PROJECT_DEFINITION.md`
- project architecture → `ARCHITECTURE.md`
- worker routing / operating rules → `AGENTS.md`
- governance acceptance / merge-readiness evidence → `GOVERNANCE_ACCEPTANCE.md`

Repository-wide learning/platform standards:

- formal learning-asset construction order → `LEARNING_ASSET_STANDARD.md`
- S/K/L/P/R/E/U readiness → `LEARNING_ACCEPTANCE.md`
- shared mature learner-surface capabilities → `SYSTEM_CONTRACT.md`
- temporary branch lifecycle → `BRANCH_LIFECYCLE.md`
- intentionally postponed work → `DEFERRED.md`

These owners are referenced, not copied into lane Current files.

---

## Lane entrypoints

| Scope | Work Cursor entry |
| --- | --- |
| Xizong | `content/xizong/CURRENT.md` |
| English | `content/english/CURRENT.md` |
| LexicalOS | `content/lexical/CURRENT.md` |
| Politics | `content/politics/CURRENT.md` |

Known target scope may go directly to its local Current once governance is understood. Root Current is not a mandatory ritual read for ordinary lane continuation.

---

## Three Truths boundary

For any scope, keep separate:

- **Artifact Truth** — what canonical source/content/runtime/product assets actually exist;
- **Acceptance Truth** — what quality/readiness has actually been demonstrated;
- **Learner Truth** — what Kian has actually learned/done;
- **Work Cursor** — what the worker should do next.

Hard rule:

> **Artifact Truth ≠ Acceptance Truth ≠ Learner Truth; this Current cannot manufacture any of them.**

The relevant local Current should point to their owners/boundaries when the active work needs them.

---

## Fresh-Chat routing

When the target scope is known:

```text
target scope CURRENT
→ exact required owner(s)
→ work
```

A `continuation.*` file is not a mandatory layer. Read it only when the local Current names it as a required owner and it still has a proven narrow machine/process responsibility.

Normal target: **roughly 2–4 precise reads after scope resolution**.

Do not search repository history, legacy repositories, retired branches, migration records, or unrelated lanes as normal fallback.

---

## Current-only boundary

Normal work uses current canonical authority.

History may be inspected only for an explicit bounded recovery / rollback / historical comparison / migration task. Once an accepted recovery result exists in Current authority, normal operation returns to current-only reasoning.

This file should remain small. Root progress history belongs in Git history / explicit evidence owners, not here.
