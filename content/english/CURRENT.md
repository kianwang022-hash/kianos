# English Current

Role: English lane Work Cursor + independently continued scope router  
Parent: root `CURRENT.md`

This file does not duplicate English content, scoped Acceptance Truth, or learner progress.

---

## Lane Work Cursor

**Active lane-level scope:** none — Functional First integration and the 2026-09-17 learner Source Truth repair are closed.  
**Module engineering state:** Objective / Translation / Writing each have `S/K/L/P/R/E PASS`.  
**Learner state:** each module `U` remains real-use-only / `UNTESTED`; the 2026-09-17 real-use defect report is a valid product signal, not a blanket U PASS.  
**Blocker:** none known for English Functional First use after the Source Truth repair.  
**Next action:** stop engineering expansion. Normal learner use may continue when scheduled. A real learner-use defect may reopen only the earliest responsible existing owner.

English is back to router-only baseline.

---

## Learner Source Truth repair closure｜2026-09-17

Real learner use exposed a material learner-facing source defect: Current English task pages could surface garbled / duplicated / stale exam text even though the refined source asset still existed in Current.

### Root cause

The Current Astro learner paths for Reading A / Cloze / Reading B / Translation / Writing had regressed to projecting `question_bank.v1.json` and related raw/current structures directly. They did **not** consume the already-current `content/english/source/global_source_truth.v1.json` learner-facing source overlay.

Bounded historical recovery against the retired Local `4173` runtime established the missing projection responsibility: the old builder applied `global_source_truth` to all English sets before learner projection, including source text plus question prompt / option overlays. Historical runtime code is evidence only; no legacy runtime dependency or fallback is restored.

### Current authority split after repair

```text
stable object identity / answers / current translation references / analysis
→ Current canonical question_bank / reading_corpus / scoped owners

learner-facing official source presentation
→ Current global_source_truth
   - source_text / paragraphs
   - question prompt / option overlays when present
   - shared option pools / images / format source fields when present
```

`global_source_truth` is therefore used as learner-facing **Source Truth projection**, not as Current answer authority. This preserves later Current answer/reference repairs while restoring the refined exam presentation.

### Repaired learner paths

- Reading A;
- Cloze;
- Reading B;
- Translation;
- protected true-exam Writing.

All five routes use one shared Current-only Source Truth adapter. Missing/mismatched Source Truth fails closed; there is no legacy fallback.

### Exact-head execution evidence

PR #353 pre-documentation head `9ed043e086d68e11f34a0648c171825175b70dd2`:

- Objective Learner Journey run `35184065083` → **PASS**;
- Static Web Translation QA run `35184065149` → **PASS**;
- Static Web Writing QA run `35184065042` → **PASS**;
- English Family Coherence run `35184065160` → **PASS**.

The shared Source Truth regression gate checks Current Source Truth readiness, requires mapped Source Truth for all Current exam sets, and exercises representative learner projections across all five task families. Existing build / Runtime / Evidence / browser journeys remain green on the repaired implementation.

This repair does not promote learner mastery or module U. It closes the concrete source/projection defect reported by real learner use.

---

## Functional First closure｜2026-09-13

FFV stop line:

```text
English entry
→ highest-value Resume OR new productive task
→ clean attempt
→ PASS / EXIT

problem
→ triage / optional semantic Chat
→ smallest repair
→ learner re-execution when useful
→ return to performance

leave / refresh
→ Resume to highest-value unfinished action
```

Fresh module reconciliation before composed execution:

- **Objective:** whole passage/set performance first; pending claims opportunistic only; Runtime/Evidence executed and frozen.
- **Translation:** Representation → Reconstruction under Fidelity → Delivery; Fidelity is invariant, not a fourth course; pending backend state stays silent on home/clean work.
- **Writing:** six true primitives; Small/Big specializations; whole-essay Runtime; transfer UI stays silent unless completed current work naturally supplies eligible evidence.

### Executed composed evidence

PR #52 head `4db901c73d80dc25589c99bcc801a4760f4a0966`  
`Static Web Writing QA` run `34752705880`  
artifact `writing-ffv-3d99953d8c0ac628a304eec659bd8925187208b7`  
`writing-ffv-journey.json` → **24/24 PASS**.

Synthetic/browser execution proved:

- clean Writing opens with no transfer attention;
- direct mode does not manufacture a plan;
- first draft persists through semantic review;
- PASS is a real exit, creates no transfer debt, survives refresh, and leaves Resume;
- problem → smallest repair preserves the first meaningful failure;
- English Resume returns to the exact active Writing repair;
- learner re-generation → repair return can end `REPAIR_COMPLETE` with no durable debt;
- completed repair survives refresh and leaves Resume;
- dormant Writing / Translation pending states do not summon Resume;
- Translation `RECONSTRUCT` outranks lower-value Writing review;
- unfinished clean Writing attempt receives the highest Resume priority.

Protected true-exam material was not consumed. Objective retains its accepted deep browser journey; Translation retains dedicated Source/Runtime/Evidence/Projection execution, so FFV did not duplicate child tests just for symmetry.

---

## Functional First stop rule

A defect blocks FFV only if it materially breaks:

- semantic correctness / next-action comprehension;
- task completion or state transition;
- repair / return;
- evidence ownership / integrity;
- Resume correctness;
- protected-material boundary.

Non-blocking polish unless real learner use proves otherwise:

- typography / spacing / card refinement;
- animation / hover / decorative hierarchy;
- richer desktop composition;
- rare-state bespoke UI;
- exposing backend information merely because it exists.

Post-FFV visual / interaction implementation belongs to Codex and must have **zero semantic diff** against current canonical contracts.

Codex does **not** own learning flow/review unit, repair admission, evidence/mastery/transfer semantics, owner boundaries, Resume priority, state meaning, or canonical knowledge truth. If implementation seems to require changing one of those, Codex returns the blocker to the canonical owner.

---

## Current module router

| Scope | Work Cursor | Acceptance Truth | Engineering state |
| --- | --- | --- | --- |
| Objective — Reading A / Cloze / Reading B | `content/english/modules/objective/CURRENT.md` | `content/english/modules/objective/ACCEPTANCE.md` | `S/K/L/P/R/E PASS · U UNTESTED` |
| Translation | `content/english/modules/translation/CURRENT.md` | `content/english/modules/translation/ACCEPTANCE.md` | `S/K/L/P/R/E PASS · U UNTESTED` |
| Writing | `content/english/modules/writing/CURRENT.md` | `content/english/modules/writing/ACCEPTANCE.md` | `S/K/L/P/R/E PASS · U UNTESTED` |

A blocker in one child does not freeze siblings without a real shared dependency. LexicalOS remains a separate top-level domain; English routes lexical failures there but does not duplicate its durable knowledge truth.

---

## Re-acceptance boundary

When Kian explicitly asks for fresh re-acceptance, old PASS labels / validators / UI are prior evidence, not the answer key. Inspect real owners first, attack completeness + minimality, test the strongest realistic failure, then reconcile previous evidence.

```text
STRUCTURAL ≠ EXECUTED ≠ ADVERSARIAL ≠ REAL_USE
```

Real learner `U` cannot be simulated. Do not restart a fresh audit merely because visual polish remains.

---

## Stable boundaries

`content/english/continuation.json` remains retired (`status=RETIRED`, `authority=NONE`, `normal_read=false`).

Stable owners:

- lane learning semantics → `content/english/LEARNING_CONTRACT.md`
- source/content map → `content/english/manifest.json`
- Objective → `content/english/modules/objective/`
- Translation → `content/english/modules/translation/`
- Writing → `content/english/modules/writing/`
- learner-facing runtime / Resume integration → English surfaces under `static-web/`

No English-wide `ACCEPTANCE.md` is created merely for FFV; child Acceptance Truth stays with the narrowest scoped owner.

Truth boundary:

- **Artifact Truth** → actual source/content/module/runtime owners;
- **Acceptance Truth** → narrowest scoped `ACCEPTANCE.md`;
- **Learner Truth** → private learner/runtime state only;
- **Work Cursor** → relevant scoped `CURRENT.md`; this English file is router-only.

Engineering readiness never implies Kian has studied or attempted a module.

---

## Fresh-Chat routing

```text
English CURRENT
→ choose Objective / Translation / Writing
→ scoped CURRENT
→ scoped ACCEPTANCE / exact owner only when needed
```

Visual/interactions after FFV route to Codex under the frozen semantic boundary rather than reopening English learning architecture.
