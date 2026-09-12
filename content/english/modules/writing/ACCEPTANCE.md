# English Writing Acceptance

Status: CURRENT on governance pilot branch
Scope: English Writing learner-facing module
Standard: root `LEARNING_ACCEPTANCE.md`

This file owns the current **Acceptance Truth** for Writing.

It does not own Writing content, runtime semantics, Work Cursor, or private learner state.

---

## Gate status

| Gate | Status | Current evidence / boundary |
| --- | --- | --- |
| S — Source | PASS | Current writing source boundary is 49 stable complete-essay prompts: Small Writing 2005–2026 (22) + Big Writing 2000–2026 (27); Current source owner `content/english/source/question_bank.v1.json`; source validation `static-web/scripts/validate-writing-source.mjs`. |
| K — Knowledge | PASS | Current accepted Writing knowledge/capability owner is `content/english/modules/writing/learning.md`; no current Knowledge blocker is recorded in the migrated English Current state. |
| L — Learning | PASS | Writing remains an independent Productive lane using one complete essay as the learner-facing unit; learning semantics are owned by `content/english/LEARNING_CONTRACT.md` + `content/english/modules/writing/learning.md`. |
| P — Projection | PASS | Accepted projection: Global Map → B1–B8 continuous/skippable route → synthetic output before protected true exams; projection validator `static-web/scripts/validate-writing-learning.mjs`. |
| R — Runtime | PASS | Whole-essay runtime exists through `static-web/src/components/WritingWorkspace.astro` + `static-web/src/lib/writingRuntimeModel.mjs`; accepted path includes first evidence → whole-essay Chat judgment → PASS or smallest repair → learner re-generation → repair check / TRANSFER_PENDING. Runtime validator: `static-web/scripts/validate-writing-runtime.mjs`. |
| E — Evidence | UNTESTED | Evidence/transfer construction is still the active unresolved stage. Existing runtime preserves first evidence and repair evidence, but later fresh Writing transfer closure / support / conservative reopen is not yet accepted as complete Evidence behavior. |
| U — User Validation | UNTESTED | No real learner-use claim is permitted from repository engineering state alone. |

---

## Current readiness claim

Allowed statement:

> **Writing S/K/L/P/R are accepted for the currently audited scope; E and U remain UNTESTED. Writing is not yet `Module ready for learner test` under the root acceptance standard.**

Do not upgrade this claim from build success, page existence, synthetic task availability, or same-prompt repair success.

---

## E gate exit target

Evidence may become eligible for acceptance only when the implementation and evidence path can support the intended semantics without manufacturing mastery/debt:

1. preserve original root diagnosis and completed repair evidence;
2. same-prompt regeneration remains repair evidence only;
3. only explicitly admitted reusable high-value targets become `TRANSFER_PENDING`;
4. a later relevant fresh/new Writing task can provide stronger transfer evidence;
5. return/update is evidence-bound and idempotent enough to support `SUPPORT / CLOSE`;
6. later contradictory fresh evidence can conservatively `REOPEN` the same target;
7. private learner evidence remains private and is not committed to shared repository Current;
8. protected true-exam tasks are not consumed merely to manufacture engineering evidence.

After implementation, audit E under `LEARNING_ACCEPTANCE.md`; do not mark PASS merely because the code path exists.

---

## Truth boundaries

### Artifact Truth
Read actual owners/implementation, including:

- `content/english/modules/writing/learning.md`
- `content/english/modules/writing/synthetic-tasks.v1.json`
- `content/english/source/question_bank.v1.json`
- `static-web/src/components/WritingWorkspace.astro`
- `static-web/src/lib/writingRuntimeModel.mjs`
- Writing validators under `static-web/scripts/`

### Learner Truth
Private Writing attempt/repair/transfer state belongs to learner-local/runtime-private state.

This Acceptance file does not claim that Kian has started, attempted, repaired, or transferred Writing merely because the module/runtime exists.

---

## Migration note

The gate positions above were extracted from the previously combined English `continuation.json` Current state on this governance branch so that Acceptance Truth no longer depends on a narrative Work Cursor.

This is a governance ownership migration only. It does not change Writing learning semantics, source facts, runtime behavior, or Kian's learner state.
