# Xizong Current

Role: Xizong lane Work Cursor + independently continued System router  
Parent: root `CURRENT.md`

This file does not own medical Core, lane learning semantics, scoped Acceptance Truth, or Kian's learner progress.

---

## Lane Work Cursor

**Active lane-level scope:** none — router-only baseline  
**Blocker:** none at lane-routing level  
**Next action:** route work directly to the requested independently continued System `CURRENT.md`. Do not appoint one System as Xizong's global active child merely because it was worked on most recently.

Current independently continued Systems:

| Scope | Work Cursor | Acceptance Truth |
| --- | --- | --- |
| A1 Circulation | `content/xizong/knowledge/systems/a1-circulation/CURRENT.md` | `content/xizong/knowledge/systems/a1-circulation/ACCEPTANCE.md` |
| A2 Respiratory | `content/xizong/knowledge/systems/a2-respiratory/CURRENT.md` | `content/xizong/knowledge/systems/a2-respiratory/ACCEPTANCE.md` |
| A3 Urinary | `content/xizong/knowledge/systems/a3-urinary/CURRENT.md` | `content/xizong/knowledge/systems/a3-urinary/ACCEPTANCE.md` |
| B Digestive / Metabolic / Endocrine / Tumor | `content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/CURRENT.md` | `content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/ACCEPTANCE.md` |
| C Hematology / Immunity / Infection | `content/xizong/knowledge/systems/c-hematology-immunity-infection/CURRENT.md` | `content/xizong/knowledge/systems/c-hematology-immunity-infection/ACCEPTANCE.md` |
| D Neuro / Sensory / Motor / Orthopedics | `content/xizong/knowledge/systems/d-neuro-sensory-motor-orthopedics/CURRENT.md` | `content/xizong/knowledge/systems/d-neuro-sensory-motor-orthopedics/ACCEPTANCE.md` |

A1/A2/A3/B/C/D current stages and gate claims belong only to those local owners. Do not copy their detailed state back into this lane router.

These Systems may be worked on concurrently when their current tasks are independent. If a shared Xizong owner/runtime creates a real dependency, name that dependency explicitly and coordinate only the affected scopes.

Hard scheduling boundary:

```text
System hierarchy
= ownership / learning-domain structure

System construction dependency
= whether one System's current artifact/decision is required by another

Kian learner order
= the sequence Kian should actually study
```

These are not automatically the same.

---

## Independent re-acceptance directive｜anti-cocoon

When Kian asks to **重新验收 / fresh acceptance / independent audit**, use this directive for the requested System. It does not add an eighth gate or automatically revoke existing PASS claims.

**Anti-anchoring:** old scoped `CURRENT.md` / `ACCEPTANCE.md` / PR summaries / green validators are claims and prior evidence, not the first-pass answer key. A fresh auditor should first inspect actual Source/Core/learning/runtime owners plus inherited contracts, form a provisional S–E verdict, expected model/route, negative-space check and strongest failure hypotheses, and only then read the old Acceptance to reconcile deltas. A builder Chat remains `SELF` evidence even if it later reviews its own work critically.

For every re-accepted gate, name the evidence rather than reporting a naked PASS:

```text
Evidence mode: STRUCTURAL / EXECUTED / ADVERSARIAL / REAL_USE / TRANSFER
Independence:  SELF / FRESH_AUDITOR / AUTHORITATIVE_EXTERNAL / REAL_USER
```

`REAL_USE` / `TRANSFER` cannot be simulated and remain U / later real-evidence territory. If a material R/E claim has only `SELF + STRUCTURAL` evidence, independent re-acceptance is incomplete.

Minimum falsification floor:

- **S/K:** independently challenge provenance/completeness and inspect **negative space**; do not derive completeness only from current counts, hashes, KP taxonomy or question mappings.
- **L:** generate at least one plausible alternative learner route/surface allocation and challenge why the accepted route is better for Kian.
- **P:** inspect material learner-facing behavior/rendering where practical; source-string presence alone is structural evidence.
- **R:** execute material state transitions under realistic browser/private state.
- **E:** adversarially test overwrite/stale state, repeated evidence, root-cause vs cascade debt, repair≠mastery, holdout/fresh protection and return/handoff; critical validators should prove detection power with a targeted negative/mutation case.
- **U:** real Kian use only.

Xizong-specific challenge focus: independently reconstruct the expected medical/concept map; look for Source + Question Truth blind spots shared by current taxonomy; challenge System→Block→Logic Group→KP causality versus teacher/file/question order; re-test `iPad / MarginNote original Lecture = external-primary` versus accidental second-textbook behavior in Astro; black-box Recall/completion/holdout/W-U repair/version-invalidation paths.

Required re-audit output per gate:

```text
previous claim → independent provisional verdict
Evidence mode + Independence
strongest falsification attempted
material delta / blocker / debt
```

If a real defect appears, reopen only the earliest responsible gate/object and freeze only its dependent chain. Do not create a second permanent acceptance system.

---

## Systems that are not first-class governance scopes yet

The medical hierarchy contains additional Systems, Blocks and KPs, but hierarchy alone does not justify a local `CURRENT / ACCEPTANCE` pair.

Create a future System sub-lane only when:

- workers routinely enter/continue it independently;
- it owns a distinct Work Cursor or acceptance boundary;
- local routing materially lowers normal read cost or ambiguity;
- the new owner replaces duplication rather than adding another summary.

Until then, those Systems remain canonical medical/learning objects under the lane without extra governance files.

Do not create System-level `LEARNING_CONTRACT.md` files merely for symmetry. Lane cognition remains owned by `content/xizong/LEARNING_CONTRACT.md`; System-specific learner order/closure remains in justified `*-learning.json` support.

Learner order in those owners does not automatically serialize engineering/construction work across Systems.

---

## Stable lane owners

### Artifact / learning owners

- knowledge owner map → `content/xizong/knowledge/manifest.json`
- canonical medical Core → `content/xizong/knowledge/systems/**`
- lane learning constitution → `content/xizong/LEARNING_CONTRACT.md`
- detailed shared learning policy → `content/xizong/knowledge/learner/study-policy.json`
- System-specific learning support → `content/xizong/knowledge/learner/`
- official questions / explanations / reviewed relations → dedicated Xizong roots
- learner runtime → Xizong surfaces under `static-web/`

### Lane Acceptance

`content/xizong/ACCEPTANCE.md` owns only genuine Xizong-wide integration/readiness claims. System readiness belongs to each local Acceptance owner.

A lane-wide integration claim may depend on multiple Systems, but that does not turn the parent lane into a serial scheduler for child construction.

### Learner Truth

Private learner/browser/conversation evidence only. System readiness or lane Work state cannot manufacture Kian's study progress or next learner action.

---

## Fresh-Chat routing

Known A1/A2/A3/B/C/D — ordinary continuation:

```text
requested System CURRENT
→ requested System ACCEPTANCE
→ exact owner required by its earliest unresolved gate
→ work
```

Known A1/A2/A3/B/C/D — independent re-acceptance:

```text
Xizong CURRENT anti-cocoon directive
→ target actual owners + inherited contracts
→ provisional S–E challenge verdict
→ only then old scoped ACCEPTANCE for reconciliation
```

Xizong lane known but exact System not yet resolved:

```text
Xizong CURRENT
→ choose requested independently continued System when applicable
→ local CURRENT
→ exact required owner(s)
```

Multiple System Chats may use these local paths concurrently. Each System advances only its own earliest unresolved eligible stage/gate along its real dependency chain.

Read the lane Learning Contract only when the task actually concerns Xizong cognition, learner order, phase linkage or System/Block/KP learning boundaries.

Do not read retired continuation/acceptance snapshots, unrelated Systems, history, legacy repositories or prior Chats by default.
