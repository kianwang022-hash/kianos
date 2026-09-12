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

The accepted scheduler is dependency-driven:

```text
Hierarchy = ownership / routing / inheritance
Dependency = scheduling
Learner order = learner experience sequence
```

Independent scopes may progress concurrently at any justified depth. Within one real dependency chain, only the earliest unresolved eligible stage/gate advances.

---

# A1｜Fresh Chat Test — PASS

Requirement:

> known scope → effective work in roughly 2–4 precise reads, without prior-chat recall or repository-wide archaeology.

Accepted restart paths:

| Known scope | Normal startup path | Reads before exact work |
| --- | --- | ---: |
| English Writing | Writing `CURRENT` → Writing `ACCEPTANCE` → exact active owner only if U evidence/reopen requires it | 1–3 |
| English Objective | Objective `CURRENT` → Objective `ACCEPTANCE` → acceptance workflow / exact active gate | 3 |
| English Translation | Translation `CURRENT` → Translation `ACCEPTANCE` → exact Source owner(s) for active S | 3–4 |
| Xizong A1 | A1 `CURRENT` → A1 `ACCEPTANCE` → exact owner only if needed | 2–3 |
| Xizong A2 | A2 `CURRENT` → A2 `ACCEPTANCE` → exact owner(s) required by active gate | 2–4 |
| Lexical K reacceptance | Lexical `CURRENT` → Lexical `ACCEPTANCE` → current Issue #6 checkpoint → exact Natural/Relation owner | 4 |
| Politics History | History `CURRENT` → History `ACCEPTANCE` → stop unless real U evidence or concrete reopen evidence exists | 2 |
| Politics Marxism | Marxism `CURRENT` → Marxism `ACCEPTANCE` → failed content gate → exact failing owner only when identified | 3–4 |

Parent lane routers are used only when the narrower target scope is not already known. Retired continuation narratives are not normal reads.

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
- Politics implementation completeness cannot become learner progress;
- no-start CI is neither PASS nor product failure;
- module-ready claims keep U separate from engineering acceptance.

No shared repository Work Cursor owns private learner progress.

---

# A3｜Parallel Chat Test — PASS

The architecture now makes the scheduling rule explicit:

> **Hierarchy is ownership; dependency is scheduling.**

Therefore:

- independently continued scopes may advance concurrently at any justified hierarchy depth;
- Politics Marxism and History do not serialize one another merely because both belong to Politics;
- Xizong Systems do not serialize one another merely because both belong to Xizong;
- English Objective / Translation / Writing do not serialize one another merely because both belong to English;
- parent routers no longer select one child as the lane's global active child;
- a blocker freezes only the dependency chain it actually affects.

Two earlier real concurrency rounds were already exercised during governance construction:

1. `main` advanced by 18 commits while governance work continued. Politics was the true overlap. Governance routing/owners were preserved, exact newer Politics Artifact blobs were retained, and the old Politics continuation narrative was not restored. Merge commit: `2e4b7b978bc87a6514e472bed6684af73ba44909`.
2. While the execution blocker was being resolved, `main` advanced again by 8 Politics History commits. The bounded reconciliation retained the newer History Source review, content/first-ready audits and runtime projection while preserving the governance `CURRENT / ACCEPTANCE` split and retired continuation boundary. Reconciliation commit: `dc86645ff1069d67027e9743680dac8226822032`.

The dependency-scheduling governance branch was also created while unrelated Lexical/Writing/Xizong work continued on `main`; the changed governance write-set remained separate from those child Artifact write-sets. This is the intended normal operating condition, not a special exception.

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

## Lanes / independent child scopes

- English lane router → `content/english/CURRENT.md`; Objective / Translation / Writing each own local `CURRENT + ACCEPTANCE`;
- Xizong lane router/integration owner → `content/xizong/CURRENT.md` + lane `ACCEPTANCE.md`; A1/A2 own local `CURRENT + ACCEPTANCE`;
- LexicalOS → `content/lexical/CURRENT.md` + `ACCEPTANCE.md`;
- Politics lane router/integration owner → `content/politics/CURRENT.md` + lane `ACCEPTANCE.md`; Marxism/History own local `CURRENT + ACCEPTANCE`.

Parent routers do not duplicate child stage/gate state.

Retired compatibility paths are pointer/tombstone surfaces only and are not competing owners.

---

# A5｜Three-month Entropy Test — PASS

The redesign removes the observed entropy mechanisms:

- narrative continuation files are no longer startup authorities;
- root Current does not aggregate lane progress;
- parent routers do not aggregate one global active child;
- acceptance evidence is separate from Work Cursor;
- learner state is separate from engineering state;
- known scopes have bounded read paths;
- rules inherit from root rather than being copied into every lane;
- history remains recoverable without entering normal Current reasoning;
- downstream `UNTESTED` gates are not interpreted as simultaneous active TODOs.

## Minimal anti-entropy guard

- script → `tools/governance_current_audit.py`
- workflow → `.github/workflows/governance-anti-entropy.yml`

It checks only observed governance failure classes:

1. expected Current / Acceptance owners exist;
2. Current files remain bounded and do not regain narrative-status-log structures;
3. retired continuation / legacy acceptance paths remain `RETIRED`, `authority=NONE`, `normal_read=false`;
4. manifests do not point back to retired continuation / acceptance owners;
5. numbered Required-reads lists do not make continuation a mandatory hop;
6. parent lane routers do not regain an `Active child` status field that serializes independent child scopes.

It does not inspect domain semantics or learner mastery.

## Executed evidence

Earlier private-repository runs were blocked before runner allocation (`steps=[]`) because no hosted-runner entitlement remained. Those runs were correctly treated as no evidence rather than lint failure.

After hosted execution became available, the guard executed successfully on the accepted baseline. During the dependency-scheduling update, the first new lint iteration correctly surfaced a rule-definition bug: the regex also matched explanatory prose. The lint was narrowed to the actual status-field pattern, and the next exact-head run succeeded:

```text
Governance Anti-Entropy run: 34695616882
conclusion: success
```

This demonstrates both fail-closed execution and bounded repair of the governance guard itself.

The **GitHub check surface on the current commit/PR** remains the authoritative exact-head execution evidence; this Acceptance file does not copy its own changing head SHA back into itself.

A5 remains PASS while the required governance check remains green.

---

# A6｜Learning Closure Test — PASS

Governance simplification and concurrency have not weakened learning acceptance.

Observed safeguards:

- root `LEARNING_ASSET_STANDARD.md` still owns construction order, now explicitly scoped to real dependency chains;
- root `LEARNING_ACCEPTANCE.md` still owns S/K/L/P/R/E/U semantics and now distinguishes evidence status from gate activation;
- `UNTESTED` no longer implies that every unresolved downstream gate may be worked in parallel;
- English Objective keeps P active while R/E remain frozen;
- English Translation has been migrated from a bundled S/K/L/P/R/E audit to **S-only active**, with K/L/P/R/E preserved but downstream-frozen;
- Xizong A2 advances only its local earliest unresolved gate while unrelated Systems remain independent;
- Lexical downstream work remains bounded by upstream semantic fidelity;
- Politics History may sit at U while Marxism independently remains blocked earlier; neither scope's state manufactures the other's schedule;
- U remains real learner evidence and cannot be simulated by engineering.

The accepted invariant is:

> **Independent scopes may progress in parallel; dependent stages/gates progress in causal order.**

Therefore governance routing does not convert engineering completion into learning closure, and concurrency does not permit downstream leapfrogging.

---

# Post-acceptance boundary

Top-level governance is now a stable baseline, not an active feature project.

Lower-level lane/content/runtime upgrades proceed independently from their own local `CURRENT` and earliest unresolved eligible stage/gate on the relevant dependency chain. Parent lane routers do not serialize independent children.

Do not reopen root governance merely to record ordinary lane progress.

Future root changes require a demonstrated Project Requirement / Invariant that the current simpler architecture cannot satisfy reliably enough. New complexity without such an owner is rejected by default.

`main@HEAD` is the durable shared repository Current after accepted work lands; temporary branches remain execution surfaces only.
