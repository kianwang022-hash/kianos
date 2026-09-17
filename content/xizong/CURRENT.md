# Xizong Current

Role: Xizong lane Work Cursor + task router  
Parent: root `CURRENT.md`

This file owns routing only. It does not own medical Core, lane Learning semantics, scoped Acceptance Truth, product semantics, shared-platform semantics, or Kian's learner progress.

## Lane Work Cursor

**Active lane-level scope:** Xizong learner-facing UI architecture migration in the current Chat  
**Current state:** Home / System / Memory / System Exit single-owner cutovers are landed; closed-surface cleanup through #379 is landed; fresh Current audit in `static-web/XIZONG_BLOCK_PRESENTATION_AUDIT.md` proves the remaining active Block workspace still has overlapping Xizong-specific presentation owners  
**Blocker:** none in Xizong itself; Shared Platform Shell changes remain owned by the registered shared owner, while Xizong consumes that owner from `main`  
**Next action:** execute the bounded **Block presentation single-owner convergence** defined by `static-web/XIZONG_BLOCK_PRESENTATION_AUDIT.md`. Preserve exact Block Learning / Runtime / learner-object / Evidence semantics; keep `runtime.css` and Shared Shell as upstream primitives; move only Xizong Block-specific presentation into one exact owner. Do not mix the cutover with the separately named dead pre-Shell / retired Home/System selector cleanup.

### UI ownership boundary

Xizong owns Xizong-specific learner surfaces and local geometry: Home / System / Block / Recall / Memory / Question / System Exit presentation, local density/typography/hierarchy, and exact Xizong route/component/style owners.

It does **not** own or fork:
- shared Base Shell;
- global `K` rail / expand-collapse behavior;
- shared global-navigation destinations;
- shared UI tokens/primitives when the change is cross-domain.

Durable shared ownership is defined by root `AUTHORITY_INHERITANCE_CONTRACT.md` + `AUTHORITY_OWNERSHIP.json`; a temporary writer assignment is not semantic ownership. Route real shared defects to the registered shared owner/current writer, land them on `main`, then continue from updated `main`.

`CONTENT_MAINLINE.md` coordinates overall content priorities/dependencies only; exact scoped owners remain authoritative.

| Scope | Work Cursor | Acceptance Truth |
| --- | --- | --- |
| A1 Circulation | `knowledge/systems/a1-circulation/CURRENT.md` | `knowledge/systems/a1-circulation/ACCEPTANCE.md` |
| A2 Respiratory | `knowledge/systems/a2-respiratory/CURRENT.md` | `knowledge/systems/a2-respiratory/ACCEPTANCE.md` |
| A3 Urinary | `knowledge/systems/a3-urinary/CURRENT.md` | `knowledge/systems/a3-urinary/ACCEPTANCE.md` |
| B Digestive / Metabolic / Endocrine / Tumor | `knowledge/systems/b-digestive-metabolic-endocrine-tumor/CURRENT.md` | `knowledge/systems/b-digestive-metabolic-endocrine-tumor/ACCEPTANCE.md` |
| C Hematology / Immunity / Infection | `knowledge/systems/c-hematology-immunity-infection/CURRENT.md` | `knowledge/systems/c-hematology-immunity-infection/ACCEPTANCE.md` |

System hierarchy, construction dependency and learner order are not automatically the same.

## Fresh-Chat Router

Historical Frozen files, old Issues, PR summaries and prior Chats are provenance only unless a Current owner explicitly points to them.

### Overall content program
```text
CURRENT.md
→ CONTENT_MAINLINE.md
→ exact active lane owner
→ exact scoped CURRENT / ACCEPTANCE / canonical asset
```

### Medical / content truth
```text
knowledge/manifest.json
→ exact System / Block canonical owner
→ local CURRENT / ACCEPTANCE when applicable
```

### Learning / cognition / first-pass
```text
LEARNING_CONTRACT.md
→ LEARNER_OBJECT_CONTRACT.md when learner-object consumption matters
→ knowledge/learner/study-policy.json
→ exact System-specific *-learning.json when material
```

Locked boundaries:
- original Lecture / MarginNote is external-primary for continuous first-pass Source learning;
- Logic Group is retrieval/local-closure, not automatically a Source-contact segment;
- Lecture-attached TTSX stays in original Lecture/MarginNote; KianOS owns release/checkpoint/selected capture only;
- Visual / Precision / Extension / Connection are conditional support, not parallel curricula.

### Product / UI / Projection
```text
static-web/XIZONG_PRODUCT_STATUS.md
→ static-web/XIZONG_UI_MIGRATION.md when migration is active
→ static-web/XIZONG_BLOCK_PRESENTATION_AUDIT.md when the Block cutover is active
→ static-web/PRESENTATION_CONTRACT.md
→ static-web/UI_STYLE_BRIEF.md
→ LEARNER_OBJECT_CONTRACT.md when placement matters
→ projection/PROJECTION_CONTRACT.md when Projection semantics matter
→ exact Xizong Runtime/component/style owner
```

For Shared Shell / global navigation / Current delivery / cross-lane ownership, read root `AUTHORITY_INHERITANCE_CONTRACT.md` + `AUTHORITY_OWNERSHIP.json` and consume the registered owner rather than creating a Xizong copy.

Do not infer Learning semantics from DOM/CSS. A Runtime mismatch is an implementation defect, not a new Learning rule.

### Visual / Precision / Extension
```text
LEARNING_CONTRACT.md
→ LEARNER_OBJECT_CONTRACT.md
→ static-web/XIZONG_VISUAL_PRECISION_CAPABILITY.md
→ EXTENSION_ASSET_CONTRACT.md
→ exact cue / extension / source-visual / pathway owner
```

Sparse enrichment is intentional; missing enrichment is not learner debt.

### Questions / explanations / second pass
```text
questions/ + explanations/ + question-relations/
→ knowledge/learner/study-policy.json
→ shared Xizong Question Runtime under static-web/
```

Keep distinct: Lecture-attached TTSX = first-pass local probe; official System sweep = first-pass coverage evidence after System Recall; SECOND_PASS = targeted discrimination/precision/application; reviewed Question→Knowledge relation = optional precise routing.

## Fresh Independent Re-acceptance

When Kian requests a fresh/independent audit, old Current/Acceptance/PR summaries are prior evidence, not the first-pass answer key.

```text
actual Source / Core / Learning / Runtime owners
→ independent provisional model + strongest failure hypotheses
→ negative-space / adversarial challenge
→ old scoped Acceptance only for reconciliation
```

A real defect reopens only the earliest responsible owner and dependent chain. U still requires real Kian use.

## Stable Lane Owners

- program coordination → `CONTENT_MAINLINE.md`
- Knowledge map → `knowledge/manifest.json`
- medical Core → `knowledge/systems/**`
- lane Learning → `LEARNING_CONTRACT.md`
- learner-object aggregation/consumption → `LEARNER_OBJECT_CONTRACT.md`
- shared execution policy → `knowledge/learner/study-policy.json`
- System learning support → `knowledge/learner/`
- Extension → `EXTENSION_ASSET_CONTRACT.md` + `knowledge/learner/*-extensions.json`
- questions / explanations / reviewed relations → dedicated Xizong roots
- product/status router → `static-web/XIZONG_PRODUCT_STATUS.md`
- active UI migration ledger → `static-web/XIZONG_UI_MIGRATION.md`
- learner Runtime → Xizong surfaces under `static-web/`
- lane-wide Acceptance → `ACCEPTANCE.md`
- Shared Platform owners → root `AUTHORITY_OWNERSHIP.json`
- learner truth → private learner/browser/conversation state only

Do not create System-level Learning contracts or duplicate parent/shared status merely for symmetry.

## Ordinary Continuation

```text
System work: requested System CURRENT → ACCEPTANCE → exact unresolved owner → work
Content:     Xizong CURRENT → CONTENT_MAINLINE → exact active lane owner → work
UI/product:  Xizong CURRENT → Product Status + UI Migration + exact active audit/owner → Presentation/UI rules → work
```

Multiple System Chats may proceed concurrently when write sets and dependencies are independent. Do not read retired snapshots, unrelated Systems, migration history, legacy repositories, or prior Chats by default.
