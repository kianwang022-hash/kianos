# KianOS Governance Acceptance

Status: ACCEPTED — top-level governance baseline  
Scope: Project Definition / Architecture / routing-governance  
Standards: `PROJECT_DEFINITION.md` §6 + `ARCHITECTURE.md` §12

This file owns **governance acceptance evidence** for the top-level architecture.

It does not own project requirements, architecture, lane Artifact Truth, lane Acceptance Truth, learner state, or the root Work Cursor.

---

## Current governance readiness

```text
A1 Fresh Chat            PASS
A2 Truth Separation      PASS
A3 Parallel Chat         PASS
A4 Owner Uniqueness      PASS
A5 Three-month Entropy   PASS
A6 Learning Closure      PASS

GOVERNANCE ACCEPTED      YES
```

This means the **top-level governance architecture is accepted**. It does not mean any lane's unresolved learning/content/runtime work has been completed, and it does not create learner progress.

---

# A1｜Fresh Chat Test — PASS

Requirement:

> known scope → effective work in roughly 2–4 precise reads, without prior-chat recall or repository-wide archaeology.

Accepted restart paths:

| Known scope | Normal startup path | Reads before exact work |
| --- | --- | ---: |
| English Writing | Writing `CURRENT` → Writing `ACCEPTANCE` → exact active runtime/evidence owner(s) | 3–4 |
| English Objective | Objective `CURRENT` → Objective `ACCEPTANCE` → acceptance workflow / exact pending gate | 3 |
| English Translation | Translation `CURRENT` → Translation `ACCEPTANCE` → canonical learning / QA entry needed by audit | 3 |
| Xizong A2 | Xizong `CURRENT` → Xizong `ACCEPTANCE` → A2 System → exact Block slice | 3–4 |
| Lexical K reacceptance | Lexical `CURRENT` → Lexical `ACCEPTANCE` → current Issue #6 checkpoint → exact Natural/Relation owner | 4 |
| Politics History | Politics `CURRENT` → Politics `ACCEPTANCE` → History content / first-ready gate → exact failing owner only if needed | 3–4 |
| Politics Marxism | Politics `CURRENT` → Politics `ACCEPTANCE` → current Politics QA / exact pending gate | 3 |

Retired continuation narratives are not normal reads.

---

# A2｜Truth Separation Test — PASS

Every migrated first-class lane exposes separate owners/boundaries for:

```text
Artifact Truth   → real natural/canonical source/content/runtime owners
Acceptance Truth → scoped ACCEPTANCE owner
Learner Truth    → private learner/browser/conversation state only
Work Cursor      → scoped CURRENT.md
```

Concrete safeguards include:

- English Objective / Translation / Writing have independent `CURRENT + ACCEPTANCE` owners;
- Xizong A1 `S–E PASS` explicitly cannot become “Kian should do System Recall”;
- Lexical runtime maturity cannot outrun reopened `K BLOCKED` semantic fidelity;
- Politics implementation completeness cannot become whole-subject PASS, and K03 acceptance cannot become learner progress;
- no-start CI is neither PASS nor product failure;
- module-ready claims keep U separate from engineering acceptance.

No shared repository Work Cursor owns private learner progress.

---

# A3｜Parallel Chat Test — PASS

The redesign treats concurrent `main` movement as normal and reconciles only real authority/write-set overlap.

Two real concurrency rounds were exercised during governance construction:

1. `main` first advanced by 18 commits while governance work continued. Politics was the true overlap. Governance routing/owners were preserved, 13 exact newer Politics Artifact blobs were retained, and the old Politics continuation narrative was not restored. Merge commit: `2e4b7b978bc87a6514e472bed6684af73ba44909`.
2. While the execution blocker was being resolved, `main` advanced again by 8 Politics History commits to `eebdffe30b94b178b1f65d14f35dd2e6c29dbdb8`. The bounded reconciliation retained the newer History Source review, content/first-ready audits and runtime projection while preserving the governance `CURRENT / ACCEPTANCE` split and retired continuation boundary. Reconciliation commit: `dc86645ff1069d67027e9743680dac8226822032`.

This demonstrates that unrelated or bounded parallel progress does not force project-wide restart.

---

# A4｜Owner Uniqueness Test — PASS

Current owner model:

## Root

- requirements / invariants → `PROJECT_DEFINITION.md`
- architecture → `ARCHITECTURE.md`
- worker operating rules → `AGENTS.md`
- governance acceptance → `GOVERNANCE_ACCEPTANCE.md`
- root Work Cursor → `CURRENT.md`
- learning construction standard → `LEARNING_ASSET_STANDARD.md`
- readiness standard → `LEARNING_ACCEPTANCE.md`
- mature shared learner-surface capabilities → `SYSTEM_CONTRACT.md`

## Lanes

- English lane + Objective / Translation / Writing → local `CURRENT + ACCEPTANCE` owners;
- Xizong → `content/xizong/CURRENT.md` + `ACCEPTANCE.md`;
- LexicalOS → `content/lexical/CURRENT.md` + `ACCEPTANCE.md`;
- Politics → `content/politics/CURRENT.md` + `ACCEPTANCE.md`.

Retired compatibility paths are pointer/tombstone surfaces only and are not competing owners.

---

# A5｜Three-month Entropy Test — PASS

The redesign removes the observed entropy mechanisms:

- narrative continuation files are no longer startup authorities;
- root Current does not aggregate lane progress;
- acceptance evidence is separate from Work Cursor;
- learner state is separate from engineering state;
- known scopes have bounded read paths;
- rules inherit from root rather than being copied into every lane;
- history remains recoverable without entering normal Current reasoning.

## Minimal anti-entropy guard

- script → `tools/governance_current_audit.py`
- workflow → `.github/workflows/governance-anti-entropy.yml`

It checks only the observed governance failure classes:

1. expected Current / Acceptance owners exist;
2. Current files remain bounded and do not regain narrative-status-log structures;
3. retired continuation / legacy acceptance paths remain `RETIRED`, `authority=NONE`, `normal_read=false`;
4. manifests do not point back to retired continuation / acceptance owners;
5. numbered Required-reads lists do not make continuation a mandatory hop.

It does not inspect domain semantics or learner mastery.

## Executed evidence

Earlier private-repository runs were blocked before runner allocation (`steps=[]`) because no hosted-runner entitlement remained. Those runs were correctly treated as no evidence rather than lint failure.

After hosted execution became available, the guard executed successfully, including after the latest Politics reconciliation. Representative reconciled execution:

```text
run: 34687047450
job: 103535741826
conclusion: success
checks: 192
errors: 0
```

Subsequent top-level writebacks also executed successfully. The **GitHub check surface on the current commit/PR** is the authoritative exact-head execution evidence; this Acceptance file does not copy its own changing head SHA back into itself.

A5 remains PASS while the required governance check remains green.

---

# A6｜Learning Closure Test — PASS

Governance simplification has not weakened learning acceptance.

Observed safeguards:

- root `LEARNING_ASSET_STANDARD.md` still owns construction order;
- root `LEARNING_ACCEPTANCE.md` still owns S/K/L/P/R/E/U semantics;
- Translation does not promote validator existence into formal PASS;
- Lexical downstream P/R/E remain bounded by upstream semantic fidelity;
- Politics whole-subject Artifact candidates remain separate from executed gate claims and U;
- Xizong A1 engineering acceptance keeps U separate from real learner use;
- English Objective keeps task/browser acceptance separate from learner progress.

Therefore governance routing does not convert engineering completion into learning closure.

---

# Post-acceptance boundary

Top-level governance is now a stable baseline, not an active feature project.

Lower-level lane/content/runtime upgrades proceed independently from their own local `CURRENT` and earliest unresolved stage. Do not reopen root governance merely to record ordinary lane progress.

Future root changes require a demonstrated Project Requirement / Invariant that the current simpler architecture cannot satisfy reliably enough. New complexity without such an owner is rejected by default.

`main@HEAD` is the durable shared repository Current after accepted work lands; temporary branches remain execution surfaces only.
