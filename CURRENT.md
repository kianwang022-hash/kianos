# KianOS Root Current

**Repository:** `kianwang022-hash/kianos`  
**Branch:** `governance/federated-current-v2-20260912`  
**Role:** root Work Cursor + scope router

`CURRENT.md` is a navigation/control surface, not a Truth owner and not a project history.

---

## Root Work Cursor

**Active scope:** KianOS governance redesign  
**Current stage:** top-level governance landing readiness  
**Blocker:** none inside the accepted governance design; Governance Anti-Entropy has executed successfully on the latest reconciled branch head  
**Next action:** keep all lane-level content/runtime upgrades frozen on this branch. Confirm exact landing head still has no new overlapping `main` movement, require the governance gate to remain green after this final evidence writeback, then treat PR #21 as merge-ready. Actual merge to `main` still requires explicit user authorization.

### Current landing evidence

```text
latest reconciled main: eebdffe30b94b178b1f65d14f35dd2e6c29dbdb8
latest bounded reconciliation: dc86645ff1069d67027e9743680dac8226822032
branch vs reconciled main: ahead 51 / behind 0 before final evidence writeback
PR #21: mergeable = true
Governance Anti-Entropy run: 34687047450
Governance job: 103535741826
result: PASS
checks: 192
errors: 0
```

The reconciliation retained newer Politics History Artifact work while preserving the governance Current / Acceptance ownership split and retired continuation boundary.

### Top-level completion boundary

This governance branch is responsible only for:

- Project Definition;
- Architecture;
- worker/routing rules;
- Three Truths + One Cursor;
- federated Current / Acceptance ownership;
- continuation retirement boundaries;
- concurrency / bounded reconciliation behavior;
- minimal anti-entropy protection;
- governance acceptance evidence.

It is **not** the place to finish unresolved English / Xizong / Lexical / Politics learning-content/runtime work.

### Post-landing sequence

After the governance layer lands, lower-level upgrades should be handled as separate bounded scopes using the new hierarchy:

```text
known lane / sub-lane
→ local CURRENT
→ local ACCEPTANCE + exact Artifact owner(s)
→ earliest unresolved construction / acceptance stage
→ implement / accept / real learner use
```

Do not aggregate all lane upgrades into a second root mega-migration. Shared infrastructure is changed only when multiple lane-level needs prove a real common requirement.

### Frozen / out of scope for this root task

- no additional governance abstraction without a new root requirement;
- no domain content/source semantic rewrite under governance authority;
- no private learner-state mutation;
- no broad lane feature work;
- no reopening accepted domain cognition merely to simplify governance;
- no CI optimization project merely because public hosted runners are now available;
- no merge to `main` before exact landing-head governance PASS and explicit merge authorization.

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
