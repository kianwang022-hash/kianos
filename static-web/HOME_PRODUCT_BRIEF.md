# KianOS Home Product Brief

Status: **CURRENT HOME IMPLEMENTATION BRIEF**  
Scope: learner-facing `/kianos/` Home only  
Branch owner: `work/home-workbench-20260917`

## Authority

Home is a cross-subject learner workbench. It consumes, but does not redefine:

- `EXAM_ORCHESTRATOR_CONTRACT.md` for cross-subject scheduling;
- `static-web/UI_STYLE_BRIEF.md` for shared visual language;
- `static-web/HOME_SUBJECT_PROJECTION_CONTRACT.md` for the exact three-subject Home integration boundary;
- subject-owned Runtime / Learning / Evidence truth for Xizong, English and Politics;
- the shared Base Shell from the current shared-shell owner.

Home does **not** own the global rail, Base shell, subject-local top navigation, or subject semantics.

## Canonical learner product tree

The learner-facing product has exactly four top-level destinations:

```text
Home
├─ 西综
├─ 政治
└─ English
   ├─ Reading A
   ├─ Cloze
   ├─ Part B
   ├─ Translation
   ├─ Writing
   ├─ External Reading
   └─ Vocabulary
```

Equivalently, the subject set consumed by Home is exactly:

```text
Xizong + Politics + English
```

Hard rule:

> Backend/canonical ownership may remain more granular than the learner-facing product tree. LexicalOS, External Reading, Orchestrator and other internal owners do not become first-level learner subjects merely because they have independent canonical truth or implementation ownership.

Home is the single learner-facing cross-subject aggregation surface for these three subjects. It links to and summarizes them; it does not create a fourth subject model.

## Home ↔ subject integration contract

For each of the three subjects, Home may consume only the smallest learner-facing projection needed for orchestration and resume:

```text
subject identity / entry
+ Resume / Continue target
+ bounded current-task or demand signal
+ scheduler-relevant workload / availability signal where owned upstream
+ optional quiet secondary entry
```

The exact allowed projection shape and closed three-subject set are owned by `HOME_SUBJECT_PROJECTION_CONTRACT.md`.

Home must not copy subject Learning / Runtime / Evidence truth into a second owner.

Subject changes should flow:

```text
Subject owner
→ stable learner-facing projection / Resume contract
→ Home aggregation
```

Cross-subject changes should flow:

```text
Three subject projections
→ Exam Orchestrator arbitration
→ Home Today / allocation / next action
```

## Product job

The first viewport should answer, with minimal reading:

1. What should I do next today?
2. How is today's usable time distributed across the three subjects?
3. Where do I resume each subject?
4. What is the next meaningful exam/phase gate?

Home is a **learning command workbench**, not a marketing page, project dashboard, engineering status page, or second copy of subject navigation.

## Learner-facing hierarchy

Preferred information order:

```text
Today / next action
→ three-subject allocation and remaining capacity
→ Continue / Resume for Xizong, Politics, English
→ near-term gate / bounded attention item
→ quiet secondary tools
```

The shared left rail already owns first-level navigation. Home must not recreate Home / Xizong / Politics / English as a second global menu.

Vocabulary and External Reading remain learner-facing under **English**. Neither may appear as an independent first-level subject on Home.

## Preserve

- existing Exam Orchestrator local-state semantics and dialogs;
- real subject Resume/Continue state;
- dynamic capacity recalculation;
- subject-owned links and runtime behavior;
- Current/provenance access as a quiet utility where useful.

## Remove or demote from default Home

- engineering construction status / Mission Control details;
- repository next-step text;
- readiness/build metadata that does not change the learner's next action;
- duplicated subject navigation;
- generic card-dashboard styling;
- tiny labels or helper text used to compensate for empty layout.

Engineering status belongs on `/current/` or another explicit debug/provenance surface, not in the primary learner Home viewport.

## Visual architecture

Home gets one clear surface owner:

```text
shared-shell.css / Base Shell  (external dependency)
+ home-workbench.css           (Home presentation owner)
```

Home-specific presentation should be migrated out of generic `global.css` / `product-closure.css` overrides when the cutover is accepted. Do not add a new `home-polish.css` or `home-qa-fixes.css` layer.

Target feel:

- Mac-wide, dense, calm, editorial/workbench-like;
- 15px absolute floor for default learner text, normally 16px+ controls and 17px+ useful prose;
- hierarchy through typography, alignment, columns and thin rules before cards;
- no giant hero, no decorative whitespace, no generic SaaS dashboard grid;
- the first viewport must earn its space.

## Integration boundary

This Home branch is stacked on the shared-shell branch during implementation.

It may edit Home-owned files/components/styles, but must not edit `Base.astro`, the global rail, or subject-local implementations to make Home fit. Shared-shell needs are routed upstream; subject data/interaction needs are routed to their lane owners.

## Acceptance

Home is accepted only when all are true:

1. real Mac-wide screenshot is visually reviewed;
2. first viewport makes Today + Continue obvious without documentation;
3. Home consumes exactly three subject projections: Xizong / Politics / English;
4. no duplicate global navigation is present;
5. Mission Control / engineering progress is absent from default learner Home;
6. Vocabulary and External Reading are visibly nested under English rather than treated as additional subjects;
7. Exam Orchestrator behavior and all three subject Resume links still work;
8. Home has one active presentation owner rather than layered CSS recovery;
9. build plus smallest relevant Home/Orchestrator regression passes.
