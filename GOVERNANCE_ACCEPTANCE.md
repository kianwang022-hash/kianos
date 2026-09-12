# KianOS Governance Acceptance

Status: CURRENT on `governance/federated-current-v2-20260912`  
Scope: Project Definition / Architecture / routing-governance redesign  
Standards: `PROJECT_DEFINITION.md` §6 + `ARCHITECTURE.md` §12

This file owns **governance acceptance evidence and merge-readiness claims** for the redesign.

It does not own project requirements, architecture, lane Artifact Truth, lane Acceptance Truth, learner state, or the root Work Cursor.

---

## Current governance readiness

```text
A1 Fresh Chat            PASS
A2 Truth Separation      PASS
A3 Parallel Chat         PASS_WITH_DEBT
A4 Owner Uniqueness      PASS
A5 Three-month Entropy   BLOCKED
A6 Learning Closure      PASS

MERGE TO MAIN            NOT_READY
```

Current blockers to governance landing:

1. add the smallest anti-entropy lint justified by the observed continuation / duplicate-owner failures;
2. reconcile the governance branch against latest `main`, with a real overlapping Politics write-set;
3. rerun this acceptance after reconciliation before any merge.

---

# A1｜Fresh Chat Test — PASS

Requirement:

> known scope → effective work in roughly 2–4 precise reads, without prior-chat recall or repository-wide archaeology.

Current restart paths after migration:

| Known scope | Normal startup path | Reads before exact work |
| --- | --- | ---: |
| English Writing | Writing `CURRENT` → Writing `ACCEPTANCE` → exact active runtime/evidence owner(s) | 3–4 |
| English Objective | Objective `CURRENT` → Objective `ACCEPTANCE` → acceptance workflow / exact pending gate | 3 |
| English Translation | Translation `CURRENT` → Translation `ACCEPTANCE` → canonical learning / QA entry needed by audit | 3 |
| Xizong A2 | Xizong `CURRENT` → Xizong `ACCEPTANCE` → A2 System → exact Block slice | 3–4 |
| Lexical K reacceptance | Lexical `CURRENT` → Lexical `ACCEPTANCE` → current Issue #6 checkpoint → exact Natural/Relation owner | 4 |
| Politics History | Politics `CURRENT` → Politics `ACCEPTANCE` → History content audit → exact review exception | 4 |
| Politics Marxism seal | Politics `CURRENT` → Politics `ACCEPTANCE` → Politics QA / exact pending gate | 3 |

The Lexical re-entry was explicitly reduced from five routine reads by making the knowledge-reacceptance README a method reference rather than a mandatory startup hop.

Retired lane continuation narratives are not normal reads.

Evidence owners:

- `content/english/CURRENT.md` + sub-lane Currents;
- `content/xizong/CURRENT.md`;
- `content/lexical/CURRENT.md`;
- `content/politics/CURRENT.md`.

---

# A2｜Truth Separation Test — PASS

Every migrated first-class lane now exposes four separate answers:

```text
Artifact Truth   → real natural/canonical source/content/runtime owners
Acceptance Truth → scoped ACCEPTANCE owner
Learner Truth    → private learner/browser/conversation state only
Work Cursor      → scoped CURRENT.md
```

Concrete safeguards now present:

- English Objective / Translation / Writing have independent `CURRENT + ACCEPTANCE` owners;
- Xizong A1 `S–E PASS` explicitly cannot become “Kian should do System Recall”; A2 K is a worker acceptance task, not learner progress;
- Lexical full-catalog runtime existence cannot outrun reopened `K BLOCKED` semantic fidelity;
- Politics teaching-projection completeness cannot become whole-subject acceptance, and K03 acceptance cannot become learner progress;
- no-start CI is neither PASS nor product failure;
- module-ready claims keep U separate from engineering acceptance.

No shared repository Work Cursor owns private learner progress.

---

# A3｜Parallel Chat Test — PASS_WITH_DEBT

Structural result: **PASS**.

The redesign permits lane-local work and does not require root status writes for ordinary lane progress. A branch being behind `main` is not itself a defect.

Observed real concurrency case during this migration:

```text
governance branch: ahead 38 / behind 18 relative to main
```

Reverse compare of governance branch → latest `main` shows the new main-side file set is concentrated in Politics:

- Politics QA workflow;
- Politics continuation;
- Marxism/History audit and learning evidence;
- Politics Unit Return runtime/evidence implementation.

English / Xizong / Lexical do not appear in that current main-side overlap set.

This demonstrates the intended rule:

> unrelated main progress does not invalidate the whole governance branch; reconcile only real overlapping owners/write-sets.

### Remaining debt before merge

Politics is a **real overlap** because governance also changes Politics Current/Acceptance/manifest/continuation ownership while latest `main` advanced Politics implementation and continuation state.

The governance owners have already been refreshed from latest-main Politics state without copying its implementation into this branch. Final landing still requires an explicit conflict/reconciliation step so that:

- latest-main Politics Artifact work survives unchanged;
- governance `CURRENT / ACCEPTANCE` ownership survives;
- the old narrative continuation retires only after its latest-main current facts are represented in the new owners.

Therefore A3 is `PASS_WITH_DEBT`, not merge-ready PASS.

---

# A4｜Owner Uniqueness Test — PASS

Current owner model after migration:

## Root

- project requirements → `PROJECT_DEFINITION.md`
- architecture → `ARCHITECTURE.md`
- worker operating rules → `AGENTS.md`
- governance acceptance evidence → `GOVERNANCE_ACCEPTANCE.md`
- root Work Cursor → `CURRENT.md`

## English

- lane Work Cursor → `content/english/CURRENT.md`
- Objective / Translation / Writing Work Cursors → local `CURRENT.md`
- corresponding readiness → local `ACCEPTANCE.md`
- old English continuation → retired tombstone, `authority=NONE`, removed from manifest owner map

## Xizong

- Work Cursor → `content/xizong/CURRENT.md`
- Acceptance Truth → `content/xizong/ACCEPTANCE.md`
- old `learner/continuation.json` → retired tombstone
- old mixed `learner/acceptance-status.json` → retired tombstone
- medical Core / learning support remain in natural owners

## LexicalOS

- Work Cursor → `content/lexical/CURRENT.md`
- Acceptance Truth → `content/lexical/ACCEPTANCE.md`
- semantic owners → Natural Word / Relation owners
- active K audit evidence → Issue #6 + knowledge-reacceptance audit tree
- old continuation → retired tombstone and removed from manifest owner map

## Politics

- Work Cursor → `content/politics/CURRENT.md`
- Acceptance Truth → `content/politics/ACCEPTANCE.md`
- source/learning/runtime remain natural Artifact owners
- old continuation → retired tombstone and removed from manifest owner map on the governance branch

Retired compatibility paths are pointers only and are not competing owners.

---

# A5｜Three-month Entropy Test — BLOCKED

The structural redesign directly removes the observed entropy mechanisms:

- 10–20 KB narrative continuation files are no longer startup authorities;
- root Current no longer aggregates lane progress;
- acceptance evidence no longer lives inside Work Cursor narratives;
- learner state is explicitly separated from engineering Current;
- known scopes have bounded read paths;
- rules inherit from root rather than being copied into each lane;
- Git history preserves retired narrative without keeping it hot in normal reasoning.

However Architecture migration step 9 explicitly requires the **smallest anti-entropy lint justified by observed failures** before final governance acceptance.

That lint does not yet exist on this branch.

Minimum justified checks should defend only observed failure classes, such as:

1. lane/root `CURRENT.md` growing into a historical/completed-work narrative;
2. a `continuation.*` returning as a normal owner / mandatory Fresh-Chat hop without explicit narrow machine responsibility;
3. a retired continuation being listed again by a Current manifest;
4. required Current/Acceptance target paths being missing;
5. obvious engineering→learner-state wording leakage in Current owners.

Do not build a governance platform or schema registry merely to pass A5.

---

# A6｜Learning Closure Test — PASS

Governance simplification has not weakened learning acceptance.

Observed safeguards:

- root `LEARNING_ASSET_STANDARD.md` still owns construction order;
- root `LEARNING_ACCEPTANCE.md` still owns S/K/L/P/R/E/U semantics;
- Translation refuses to promote rich implementation/validators into formal PASS without reacceptance;
- Lexical downstream P/R/E are blocked by upstream K semantic-fidelity defects despite mature runtime Artifact;
- Politics whole-subject gates remain UNTESTED despite complete teaching projection and implemented acceptance candidates;
- Xizong A1 engineering acceptance preserves U as path-scoped UNTESTED;
- English Objective distinguishes known shared-browser evidence from still-pending task-browser seal.

Therefore governance routing did not convert engineering completion into learning closure.

---

# Merge rule

Do **not** merge this governance branch merely because A1/A2/A4/A6 pass.

Required sequence:

```text
implement smallest A5 anti-entropy lint
→ rerun static governance audit
→ reconcile latest main (Politics overlap is real)
→ reread exact conflict owners
→ rerun A1–A6 on reconciled candidate
→ only then consider merge
```

`main@HEAD` remains the durable shared Current after accepted landing. This draft branch is an execution surface only.
