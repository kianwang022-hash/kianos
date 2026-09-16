# Xizong Current

Role: Xizong lane Work Cursor + Current task router  
Parent: root `CURRENT.md`

This file owns routing only. It does not own medical Core, lane learning semantics, scoped Acceptance Truth, product semantics or Kian's learner progress.

---

## Lane Work Cursor

**Active lane-level scope:** none — router-only baseline  
**Blocker:** none at lane-routing level  
**Next action:** route work to the narrowest Current owner for the actual task.

| Scope | Work Cursor | Acceptance Truth |
| --- | --- | --- |
| A1 Circulation | `knowledge/systems/a1-circulation/CURRENT.md` | `knowledge/systems/a1-circulation/ACCEPTANCE.md` |
| A2 Respiratory | `knowledge/systems/a2-respiratory/CURRENT.md` | `knowledge/systems/a2-respiratory/ACCEPTANCE.md` |
| A3 Urinary | `knowledge/systems/a3-urinary/CURRENT.md` | `knowledge/systems/a3-urinary/ACCEPTANCE.md` |
| B Digestive / Metabolic / Endocrine / Tumor | `knowledge/systems/b-digestive-metabolic-endocrine-tumor/CURRENT.md` | `knowledge/systems/b-digestive-metabolic-endocrine-tumor/ACCEPTANCE.md` |
| C Hematology / Immunity / Infection | `knowledge/systems/c-hematology-immunity-infection/CURRENT.md` | `knowledge/systems/c-hematology-immunity-infection/ACCEPTANCE.md` |

System hierarchy, construction dependency and Kian learner order are not automatically the same.

---

## Fresh-Chat task router｜use before history

Historical Frozen files, old Issues, PR summaries and prior Chats are provenance only unless a Current owner explicitly points to them.

### Medical / content truth

```text
knowledge/manifest.json
→ exact System / Block canonical owner
→ local CURRENT / ACCEPTANCE when applicable
```

Use for medical Core, Source boundary, System model, Block/KP identity, content repair or new System construction.

### Learning / cognition / first-pass flow

```text
LEARNING_CONTRACT.md
→ knowledge/learner/study-policy.json
→ exact System-specific *-learning.json when material
```

Use for learner order, Logic Groups, Source-contact granularity, TTSX, Recall/completion, Attention Projection, Memory/Precision timing and phase linkage.

Current reminders only:

- original Lecture / MarginNote is external-primary for continuous first-pass Source learning;
- Logic Group = retrieval/local-closure unit, not automatically a Source-contact segment;
- Lecture-attached TTSX is done in the original Lecture/MarginNote; KianOS only owns Boundary/Binding release, completion checkpoint and optional selected-question/note capture;
- `Boundary = WHEN`; reviewed binding = `WHICH`;
- Visual / Extension is conditional support, not a parallel curriculum.

### Product / UI / Projection

```text
static-web/XIZONG_PRODUCT_STATUS.md
→ static-web/PRESENTATION_CONTRACT.md
→ projection/PROJECTION_CONTRACT.md when P semantics are material
→ exact Runtime/component only after semantic owners are understood
```

Do not infer learning semantics from the current DOM or CSS.

### Visual / Precision / Extension

```text
LEARNING_CONTRACT.md
→ static-web/XIZONG_VISUAL_PRECISION_CAPABILITY.md
→ EXTENSION_ASSET_CONTRACT.md
→ exact cue / extension / source-visual owner
```

Sparse coverage is intentional; missing Extension content is not learner debt or a reason for system-wide screenshot production.

### Questions / explanations / Crosswalk / second pass

```text
questions/
explanations/
question-relations/
knowledge/learner/study-policy.json
→ current shared Question Runtime under static-web/
```

Keep distinct:

- Lecture-attached TTSX = first-pass local Lecture probe/checkpoint;
- official System sweep = first-pass coverage evidence after System Recall;
- SECOND_PASS = targeted discrimination / precision / application in the same official Question Runtime;
- reviewed Question→Knowledge relation = optional precise routing; missing relation does not block practice.

Do not use stale Issue checkboxes as capability truth.

---

## Independent re-acceptance｜anti-cocoon

When Kian asks for **重新验收 / fresh acceptance / independent audit**, old `CURRENT` / `ACCEPTANCE` / PR summaries / green validators are claims and prior evidence, not the first-pass answer key.

Fresh auditor sequence:

```text
actual Source / Core / Learning / Runtime owners
→ provisional S–E model + strongest failure hypotheses
→ negative-space challenge
→ only then old scoped Acceptance for reconciliation
```

Evidence labels:

```text
Evidence mode: STRUCTURAL / EXECUTED / ADVERSARIAL / REAL_USE / TRANSFER
Independence: SELF / FRESH_AUDITOR / AUTHORITATIVE_EXTERNAL / REAL_USER
```

Minimum challenge floor:

- **S/K:** provenance/completeness + negative space;
- **L:** at least one plausible alternative learner route/surface allocation;
- **P:** material learner-facing rendering where practical;
- **R:** realistic browser/private-state transitions;
- **E:** overwrite/stale/repeat/repair≠mastery/holdout/fresh-protection + at least one negative/mutation check;
- **U:** real Kian use only.

A real defect reopens only the earliest responsible owner and its dependent chain.

---

## Stable lane owners

- Knowledge map → `knowledge/manifest.json`
- medical Core → `knowledge/systems/**`
- lane Learning → `LEARNING_CONTRACT.md`
- shared execution policy → `knowledge/learner/study-policy.json`
- System learning support → `knowledge/learner/`
- Extension contract / assets → `EXTENSION_ASSET_CONTRACT.md` + `knowledge/learner/*-extensions.json`
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

Lane-level learning/product/capability work:

```text
Xizong CURRENT
→ Fresh-Chat task router above
→ exact Current owner(s)
→ work
```

Multiple System Chats may proceed concurrently when their write sets and dependencies are independent. Do not read retired snapshots, unrelated Systems, migration history, legacy repositories or prior Chats by default.
