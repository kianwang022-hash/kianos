# Xizong Current

Role: Xizong lane Work Cursor + task router  
Parent: root `CURRENT.md`

This file owns routing only. It does not own medical Core, lane Learning semantics, scoped Acceptance Truth, product semantics, or Kian's learner progress.

---

## Lane Work Cursor

**Active lane-level scope:** Xizong learner-facing UI architecture migration in the current Chat  
**Blocker:** none in Xizong itself; shared Base Shell / collapsible global `K` rail is currently owned by the parallel English UI Chat and must be consumed from `main`, not reimplemented here  
**Next action:** execute `static-web/XIZONG_UI_MIGRATION.md` **Slice 3 — System Exit / official Question ownership convergence** from current `main`. PR #368 closed System Framework, PR #370 closed Home, and PR #371 closed standalone Memory with exact Runtime semantics preserved. Audit the current System Exit / Question visual ownership graph first; preserve System Recall → official System sweep → Repair/Return, Question Truth, Crosswalk, attempt history and Evidence semantics. Treat draft PR #351 only as bounded evidence and do not inherit its peripheral override stylesheet or route-level duplicate Recall fallback unless a real Runtime-owner defect is independently proven.

### UI ownership boundary for the current parallel program

This Xizong UI lane owns only Xizong-specific learner surfaces and Xizong-native geometry.

It may change, when justified:

- Xizong Home / System / Block / Recall / Memory / Question / System Exit presentation;
- Xizong-specific density, typography, hierarchy and local navigation under the shared UI rules;
- exact Xizong route/component/style owner where the responsibility is genuinely local.

It must **not** independently change or fork:

- shared Base Shell;
- global `K` rail / expand-collapse behavior;
- shared global-navigation destinations;
- shared UI tokens/primitives when the needed change is not Xizong-specific.

If Xizong reveals a real shared-shell defect, route it to the current shared-shell owner, let that change land on `main`, then continue from the updated main.

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
→ static-web/XIZONG_UI_MIGRATION.md when the UI migration is active
→ static-web/PRESENTATION_CONTRACT.md
→ static-web/UI_STYLE_BRIEF.md for shared visual rules
→ LEARNER_OBJECT_CONTRACT.md when learner-object placement matters
→ projection/PROJECTION_CONTRACT.md when Projection semantics matter
→ exact Xizong Runtime/component/style owner only after semantic owners are understood
```

For the current parallel UI program, shared Base Shell / global `K` rail implementation is not a Xizong write target; consume it from `main` after the shared-shell owner lands it.

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
- active UI migration ledger → `static-web/XIZONG_UI_MIGRATION.md`
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

Lane-level UI/product work:

```text
Xizong CURRENT
→ XIZONG_PRODUCT_STATUS + XIZONG_UI_MIGRATION + PRESENTATION_CONTRACT + UI_STYLE_BRIEF
→ exact Xizong-owned surface
→ work
```

Multiple System Chats may proceed concurrently when write sets and dependencies are independent. Do not read retired snapshots, unrelated Systems, migration history, legacy repositories, or prior Chats by default.
