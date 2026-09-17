# Xizong Current

Role: Xizong lane Work Cursor + task router  
Parent: root `CURRENT.md`

This file owns routing only. It does not own medical Core, lane Learning semantics, scoped Acceptance Truth, product semantics, or Kian's learner progress.

---

## Lane Work Cursor

**Active lane-level scope:** none — router-only baseline  
**Blocker:** none at lane-routing level  
**Next action:** route work to the narrowest Current owner for the actual task.

For overall Xizong content-program coordination, read `CONTENT_MAINLINE.md` after this file. It coordinates priorities/dependencies only; exact scoped owners remain authoritative.

| Scope | Work Cursor | Acceptance Truth |
| --- | --- | --- |
| A1 Circulation | `knowledge/systems/a1-circulation/CURRENT.md` | `knowledge/systems/a1-circulation/ACCEPTANCE.md` |
| A2 Respiratory | `knowledge/systems/a2-respiratory/CURRENT.md` | `knowledge/systems/a2-respiratory/ACCEPTANCE.md` |
| A3 Urinary | `knowledge/systems/a3-urinary/CURRENT.md` | `knowledge/systems/a3-urinary/ACCEPTANCE.md` |
| B Digestive / Metabolic / Endocrine / Tumor | `knowledge/systems/b-digestive-metabolic-endocrine-tumor/CURRENT.md` | `knowledge/systems/b-digestive-metabolic-endocrine-tumor/ACCEPTANCE.md` |
| C Hematology / Immunity / Infection | `knowledge/systems/c-hematology-immunity-infection/CURRENT.md` | `knowledge/systems/c-hematology-immunity-infection/ACCEPTANCE.md` |

System hierarchy, construction dependency, and Kian learner order are not automatically the same.

---

## Fresh-Chat router

Historical Frozen files, old Issues, PR summaries and prior Chats are provenance only unless a Current owner explicitly points to them.

### Overall content program

```text
CURRENT.md
→ CONTENT_MAINLINE.md
→ exact active lane owner
→ exact scoped CURRENT / ACCEPTANCE / canonical asset
```

Use for choosing/resuming parallel medical construction, Questions/Crosswalk, Visual/Extension, or later D/E/F work.

### Medical / content truth

```text
knowledge/manifest.json
→ exact System / Block canonical owner
→ local CURRENT / ACCEPTANCE when applicable
```

Use for Source boundary, System model, Block/KP identity, content repair, or new System construction.

### Learning / cognition / first-pass flow

```text
LEARNING_CONTRACT.md
→ LEARNER_OBJECT_CONTRACT.md when learner-object consumption matters
→ knowledge/learner/study-policy.json
→ exact System-specific *-learning.json when material
```

Important Current boundaries:

- `LEARNING_CONTRACT.md` §12 owns the locked learner-facing flow;
- original Lecture / MarginNote is external-primary for continuous first-pass Source learning;
- Logic Group is a retrieval/local-closure unit, not automatically a Source-contact segment;
- Lecture-attached TTSX is performed in the original Lecture/MarginNote; KianOS owns release/checkpoint/selected capture only;
- Visual / Precision / Extension / Connection are conditional support, not parallel curricula.

### Product / UI / Projection

```text
static-web/XIZONG_PRODUCT_STATUS.md
→ static-web/PRESENTATION_CONTRACT.md
→ LEARNER_OBJECT_CONTRACT.md when learner-object placement matters
→ projection/PROJECTION_CONTRACT.md when Projection semantics matter
→ exact Runtime/component only after semantic owners are understood
```

Do not infer Learning semantics from current DOM/CSS. A Runtime mismatch is an implementation defect, not a new Learning rule.

### Visual / Precision / Extension

```text
LEARNING_CONTRACT.md
→ LEARNER_OBJECT_CONTRACT.md
→ static-web/XIZONG_VISUAL_PRECISION_CAPABILITY.md
→ EXTENSION_ASSET_CONTRACT.md
→ exact cue / extension / source-visual / pathway owner
```

Sparse coverage is intentional; missing enrichment is not learner debt.

### Questions / explanations / second pass

```text
questions/
explanations/
question-relations/
knowledge/learner/study-policy.json
→ shared Xizong Question Runtime under static-web/
```

Keep distinct:

- Lecture-attached TTSX = first-pass local Lecture probe/checkpoint;
- official System sweep = first-pass coverage evidence after System Recall;
- SECOND_PASS = targeted discrimination / precision / application;
- reviewed Question→Knowledge relation = optional precise routing; missing relation does not block practice.

---

## Fresh independent re-acceptance

When Kian requests a fresh/independent audit, do not use old Current/Acceptance/PR summaries as the first-pass answer key.

Compact order:

```text
actual Source / Core / Learning / Runtime owners
→ independent provisional model + strongest failure hypotheses
→ negative-space / adversarial challenge
→ old scoped Acceptance only for reconciliation
```

A real defect reopens only the earliest responsible owner and its dependent chain. U still requires real Kian use.

---

## Stable lane owners

- program coordination → `CONTENT_MAINLINE.md`
- Knowledge map → `knowledge/manifest.json`
- medical Core → `knowledge/systems/**`
- lane Learning → `LEARNING_CONTRACT.md`
- learner-object aggregation / consumption boundary → `LEARNER_OBJECT_CONTRACT.md`
- shared execution policy → `knowledge/learner/study-policy.json`
- System learning support → `knowledge/learner/`
- Extension → `EXTENSION_ASSET_CONTRACT.md` + `knowledge/learner/*-extensions.json`
- questions / explanations / reviewed relations → dedicated Xizong roots
- product/status router → `static-web/XIZONG_PRODUCT_STATUS.md`
- learner Runtime → Xizong surfaces under `static-web/`
- lane-wide Acceptance → `ACCEPTANCE.md`
- learner truth → private learner/browser/conversation state only

Do not create System-level Learning contracts or duplicate parent status merely for symmetry.

---

## Ordinary continuation

System work:

```text
requested System CURRENT
→ requested System ACCEPTANCE
→ exact earliest unresolved owner
→ work
```

Program-level content work:

```text
Xizong CURRENT
→ CONTENT_MAINLINE
→ exact active lane owner
→ work
```

Lane-level learning/product work:

```text
Xizong CURRENT
→ router above
→ exact Current owner(s)
→ work
```
Multiple System Chats may proceed concurrently when write sets and dependencies are independent. Do not read retired snapshots, unrelated Systems, migration history, legacy repositories, or prior Chats by default.
