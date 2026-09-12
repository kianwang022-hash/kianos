# English Translation Current

Role: independent Translation Work Cursor + restart entry  
Parent: `content/english/CURRENT.md`

This file does not own Translation content, acceptance evidence, or learner progress.

---

## Work Cursor

**Scope:** English Translation  
**Active / earliest unresolved gate:** `R — Runtime acceptance`  
**Blocker:** none from Projection. S is `PASS_WITH_DEBT`; K/L/P are `PASS`; R is `UNTESTED`; E is downstream-frozen; U remains real learner use only.  
**Next action:** run a bounded **R-only** audit of the executable Translation journey. If R passes, write the durable transition first and make E active.

---

## Stage discipline

```text
S  PASS_WITH_DEBT  ← accepted; 3 explicit pending_review reference gaps
K  PASS            ← accepted
L  PASS            ← accepted
P  PASS            ← accepted after two Projection blockers were repaired
R  UNTESTED        ← ACTIVE
E  UNTESTED        ← downstream-frozen
U  UNTESTED        ← real learner use only
```

`UNTESTED` is evidence status, not a parallel TODO list.

---

## Accepted upstream boundary

### S

Current Translation resolves to 27 sets / 135 stable prompts. Three reference rows remain explicit `pending_review` Source debt; missing references stay fail-closed and may not be fabricated.

### K

The canonical ability asset is accepted: Global Map → Representation → Preservation → Reconstruction → Exam Execution → integrated use, with lexical ownership routed to LexicalOS and long-tail ambiguity left to adaptive Chat.

### L

The accepted learner path is continuous first learning → real whole-set Translation. Skill Map/deep leaves are later repair/navigation. Clean first output precedes diagnosis/reference; earliest meaningful failure receives the smallest sufficient repair and learner reconstruction; later fresh transfer outranks same-item correction.

### P

Projection is accepted after repairing two blockers:

- concrete Transfer Pending cues are hidden throughout Clean Attempt so fresh evidence is not cued;
- `F｜HOW YOU LEARN IT` is visible before `G｜第一次学习出口`; Skill Map and system/runtime reference remain progressively disclosed.

Executed P gate: `PASS` — 161 checks, 27/27 built task pages, 132 available canonical reference rows checked, 0 clean-attempt reference leaks, 0 issues.

Full acceptance evidence belongs in `content/english/modules/translation/ACCEPTANCE.md`, not here.

---

## R acceptance target

Verify the intended journey is actually executable:

```text
complete Clean Attempt
→ immutable whole-attempt freeze
→ PASS or Need Review
→ whole-set Chat diagnosis when needed
→ PASS or one primary failure + smallest repair
→ learner Reconstruction
→ repaired / TRANSFER_PENDING exit
```

R must establish at minimum:

- partial task cannot freeze as a complete attempt;
- stable clean work can PASS without manufactured debt;
- handoff preserves immutable first output and excludes Reference unless explicitly revealed;
- malformed / wrong-task return fails closed;
- valid repair return routes only affected segments into Reconstruction;
- incomplete Reconstruction cannot finish;
- same-task repair completion does not itself claim mastery;
- persistence / re-entry / reset / history preserve required runtime state;
- Source reference gaps remain non-fabricated.

Do not infer E acceptance from Runtime success.

---

## Required reads

1. `content/english/modules/translation/ACCEPTANCE.md`
2. Frozen Runtime v1 appendix in `content/english/modules/translation/learning.md`
3. `static-web/src/lib/translationRuntimeModel.mjs`
4. `static-web/src/components/TranslationWorkspace.astro`
5. `static-web/src/components/TranslationPersistenceGuard.astro`
6. `static-web/src/components/TranslationReferenceLoader.astro` only where reveal/load behavior matters
7. `static-web/scripts/validate-translation-runtime.mjs`
8. exact task-page wiring only when needed to trace a Runtime transition

Do not default-read Evidence owners/validator, English history, legacy repo, or sibling scopes while R is active.

---

## Frozen / out of scope

During R acceptance:

- E stays downstream-frozen;
- do not redesign accepted K/L/P merely to fit current code;
- do not convert existing candidate QA into R PASS without bounded Runtime evidence;
- do not reopen S merely because its explicit reference debt remains;
- do not touch Objective / Writing / other English sibling scopes;
- do not infer or mutate Kian's Learner Truth.

If R exposes a real upstream defect, reopen the earliest responsible gate. If it exposes an Evidence-only defect, record it without advancing into E.

---

## Truth references

**Artifact Truth:** Translation learning owner, Runtime model, Workspace, PersistenceGuard, delayed ReferenceLoader, task wiring, Runtime validator.  
**Acceptance Truth:** `content/english/modules/translation/ACCEPTANCE.md`.  
**Learner Truth:** private learner/runtime state only; repository state is not Kian's learning progress.

---

## Fresh-Chat target

```text
Translation CURRENT
→ Translation ACCEPTANCE
→ Frozen Runtime v1 contract
→ exact Runtime owners
→ R only
```

When R passes, write the local durable transition first so the next fresh Chat recovers at E automatically.
