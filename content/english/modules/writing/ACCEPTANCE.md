# English Writing Acceptance

Status: CURRENT
Scope: English Writing learner-facing module
Standard: root `LEARNING_ACCEPTANCE.md`

This file owns the current **Acceptance Truth** for Writing.

It does not own Writing content, runtime semantics, Work Cursor, or private learner state.

---

## Gate status

| Gate | Status | Current evidence / boundary |
| --- | --- | --- |
| S — Source | PASS | Current writing source boundary is 49 stable complete-essay prompts: Small Writing 2005–2026 (22) + Big Writing 2000–2026 (27); Current source owner `content/english/source/question_bank.v1.json`; source validation `static-web/scripts/validate-writing-source.mjs`. |
| K — Knowledge | PASS | Current accepted Writing knowledge/capability owner is `content/english/modules/writing/learning.md`; no current Knowledge blocker is recorded. |
| L — Learning | PASS | Writing remains an independent Productive lane using one complete essay as the learner-facing unit; learning semantics are owned by `content/english/LEARNING_CONTRACT.md` + `content/english/modules/writing/learning.md`. |
| P — Projection | PASS | Accepted projection: Global Map → B1–B8 continuous/skippable route → synthetic output before protected true exams; projection validator `static-web/scripts/validate-writing-learning.mjs`. |
| R — Runtime | PASS | Whole-essay runtime exists through `static-web/src/components/WritingWorkspace.astro` + `static-web/src/lib/writingRuntimeModel.mjs`; accepted path includes first evidence → whole-essay Chat judgment → PASS or smallest repair → learner re-generation → repair check / TRANSFER_PENDING. Runtime validator: `static-web/scripts/validate-writing-runtime.mjs`. |
| E — Evidence | PASS | Private later-fresh transfer evidence is executable through `static-web/src/lib/writingEvidenceModel.mjs` + `static-web/src/components/WritingEvidencePanel.astro`. Admission requires an explicit existing `TRANSFER_PENDING` reusable target; same-prompt repair cannot close it; later different Writing first-draft evidence can SUPPORT / KEEP_PENDING / CLOSE; a CLOSED target can REOPEN only from later contradictory fresh evidence; irrelevant material does not manufacture mastery/failure; evidence application is idempotent/conflict-guarded. `static-web/scripts/validate-writing-evidence.mjs` passed in Static Web Writing QA using synthetic-only engineering evidence, with no protected true exam consumed. |
| U — User Validation | UNTESTED | No real learner-use claim is permitted from repository engineering state alone. No claim is made that Kian has started Writing, used the runtime, or produced transfer evidence. |

---

## Current readiness claim

Allowed statement:

> **Writing S/K/L/P/R/E are accepted for the currently audited scope. The module is ready for learner test; U remains UNTESTED.**

Do not upgrade this to learner-validated from CI, build success, synthetic E2E, page existence, or another model's judgment.

---

## E acceptance evidence

The accepted Evidence path satisfies the current exit target:

1. origin first evidence, diagnosis/repair history, final diagnosis, regeneration, and completed repair return are preserved when a reusable target is admitted;
2. same-task / same-prompt evidence is rejected as transfer evidence;
3. only the existing Runtime's explicit reusable `TRANSFER_PENDING` candidate enters the private ledger;
4. eligible evidence must come from a later different Writing task with preserved fresh first-draft evidence;
5. Chat returns are bound to `targetId + freshTaskId + evidenceId + FRESH_FIRST_DRAFT`, and duplicate application is idempotent while conflicting reuse is rejected;
6. pending targets may receive SUPPORT / KEEP_PENDING / CLOSE without counter-based mastery rules;
7. CLOSED targets may REOPEN only through later contradictory fresh evidence on the same target identity;
8. IRRELEVANT fresh material is recorded without confirming or refuting the target;
9. the evidence ledger remains browser-local/private and is not written into shared Current;
10. the engineering gate uses synthetic Writing tasks and does not consume protected true-exam material.

Validation owner: `static-web/scripts/validate-writing-evidence.mjs`. It is part of `npm run validate:writing`, alongside the existing Source / Learning / Runtime validators.

---

## U boundary

U is path-scoped and must come from Kian's actual use. Possible real-use paths include:

- first learning / synthetic output;
- stable whole-essay PASS;
- repair → regeneration → repair check;
- TRANSFER_PENDING → later fresh SUPPORT/CLOSE;
- CLOSED → later contradictory fresh REOPEN.

None of those paths may be marked learner-validated until they actually occur. Real learner friction may reopen the earliest responsible S/K/L/P/R/E gate if concrete evidence supports doing so.

---

## Truth boundaries

### Artifact Truth
Read actual owners/implementation, including:

- `content/english/modules/writing/learning.md`
- `content/english/modules/writing/synthetic-tasks.v1.json`
- `content/english/source/question_bank.v1.json`
- `static-web/src/components/WritingWorkspace.astro`
- `static-web/src/lib/writingRuntimeModel.mjs`
- `static-web/src/components/WritingEvidencePanel.astro`
- `static-web/src/lib/writingEvidenceModel.mjs`
- Writing validators under `static-web/scripts/`

### Learner Truth
Private Writing attempt/repair/transfer state belongs to learner-local/runtime-private state.

This Acceptance file does not claim that Kian has started, attempted, repaired, transferred, closed, or reopened any Writing target merely because the module/runtime exists.
