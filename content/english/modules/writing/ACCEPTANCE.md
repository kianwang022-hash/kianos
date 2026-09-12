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
| K — Knowledge | PASS | Current accepted Writing knowledge/capability owner is `content/english/modules/writing/learning.md`; the latest architecture re-audit found no concrete Knowledge defect. |
| L — Learning | PASS | Writing remains an independent Productive lane using one complete essay as the learner-facing unit; `content/english/modules/writing/learning.md` explicitly requires synthetic qualification before the first clean true-exam transfer check. No Learning rewrite was required by the latest re-audit. |
| P — Projection | PASS | Accepted projection now closes the full audited entry chain: Global Map → B1–B8 continuous/skippable route → Synthetic Small + Big → both synthetic tasks reach terminal qualification → release exactly one source-ready protected true-exam task from canonical Current source order. The protected catalog is not shown before that gate. Validators: `validate-writing-learning.mjs` + `validate-writing-exam-entry.mjs`. |
| R — Runtime | PASS | The same whole-essay Runtime serves synthetic and released exam-shaped tasks. The released true-exam task preserves learner-safe official prompt/material/context, enters with a clean first attempt, and then follows first evidence → whole-essay Chat judgment → PASS or smallest repair → learner re-generation → repair check / TRANSFER_PENDING. No second exam Runtime was created. Validators: `validate-writing-runtime.mjs` + `validate-writing-exam-entry.mjs`. |
| E — Evidence | PASS | Private later-fresh transfer evidence remains executable through `writingEvidenceModel.mjs` + `WritingEvidencePanel.astro`. Same-prompt repair cannot close transfer; later different Writing first-draft evidence can SUPPORT / KEEP_PENDING / CLOSE; CLOSED may REOPEN only on later contradictory fresh evidence; irrelevant material does not manufacture mastery/failure. `validate-writing-evidence.mjs` remains synthetic-only for engineering evidence. |
| U — User Validation | UNTESTED | No real learner-use claim is permitted from repository engineering state alone. No claim is made that Kian has started Writing, completed either synthetic gate, opened the protected exam, or produced transfer evidence. |

---

## Current readiness claim

Allowed statement:

> **Writing S/K/L/P/R/E are accepted for the currently audited learner path. The module is ready for learner test; U remains UNTESTED.**

Do not upgrade this to learner-validated from CI, build success, synthetic fixtures, page existence, or another model's judgment.

---

## 2026-09-12 architecture re-audit

The latest architecture/routing review did **not** invalidate the earlier synthetic Runtime or Evidence work. It found one narrower scope mismatch:

- the accepted learning owner already required `Synthetic Small + Big → first clean true-exam attempt`;
- earlier P/R execution evidence closed the synthetic cold-start path but the learner-facing home only changed the protected-exam shield state and did not provide an executable true-exam entry;
- therefore the earlier implementation evidence was valid, but the whole-module P/R claim was broader than the exercised route.

The earliest responsible layer was reopened at **P/R only**. S/K/L/E stayed frozen because no concrete evidence reopened them.

Accepted repair:

1. `englishWritingRuntimeTask.mjs` adapts exactly one source-ready Current true-exam task into the existing whole-essay Runtime contract;
2. `writing.astro` reveals the entry only after both synthetic tasks are in `PASS_ACCEPTABLE`, `REPAIR_COMPLETE`, or `TRANSFER_PENDING`;
3. `WritingProtectedExamGate.astro` independently enforces the same local qualification before showing the learner-facing runtime;
4. `[id].astro` routes the released exam through the same `WritingWorkspace` and `WritingEvidencePanel` rather than a duplicate Runtime;
5. official prompt/material/context are preserved in the clean learner projection, while answer/analysis/model-answer semantics remain forbidden;
6. `validate-writing-exam-entry.mjs` checks canonical selection, one-task release, clean projection, source-context preservation, shared Runtime exam-shape compatibility, and the double synthetic gate;
7. engineering validation reads Current source/projection metadata but does **not** submit or simulate a learner attempt on the protected true-exam prompt.

Executed evidence on PR #25 / `Static Web Writing QA` run 102:

- `Validate Writing acceptance evidence` — PASS;
- `Build Astro` — PASS.

This closes the concrete P/R scope mismatch found by the re-audit. It does not create U.

---

## E acceptance evidence

The accepted Evidence path satisfies the current exit target:

1. origin first evidence, diagnosis/repair history, final diagnosis, regeneration, and completed repair return are preserved when a reusable target is admitted;
2. same-task / same-prompt evidence is rejected as transfer evidence;
3. only the Runtime's explicit reusable `TRANSFER_PENDING` candidate enters the private ledger;
4. eligible evidence must come from a later different Writing task with preserved fresh first-draft evidence;
5. Chat returns are bound to `targetId + freshTaskId + evidenceId + FRESH_FIRST_DRAFT`, and duplicate application is idempotent while conflicting reuse is rejected;
6. pending targets may receive SUPPORT / KEEP_PENDING / CLOSE without counter-based mastery rules;
7. CLOSED targets may REOPEN only through later contradictory fresh evidence on the same target identity;
8. IRRELEVANT fresh material is recorded without confirming or refuting the target;
9. the evidence ledger remains browser-local/private and is not written into shared Current;
10. the engineering Evidence gate uses synthetic Writing tasks and does not consume protected true-exam learner evidence.

Validation owner: `static-web/scripts/validate-writing-evidence.mjs`.

---

## U boundary

U is path-scoped and must come from Kian's actual use. Possible real-use paths include:

- first learning / synthetic output;
- stable whole-essay PASS;
- repair → regeneration → repair check;
- Synthetic Small + Big qualification → first clean protected true-exam attempt;
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
- `static-web/src/lib/englishWritingRuntimeTask.mjs`
- `static-web/src/components/WritingProtectedExamGate.astro`
- `static-web/src/components/WritingWorkspace.astro`
- `static-web/src/lib/writingRuntimeModel.mjs`
- `static-web/src/components/WritingEvidencePanel.astro`
- `static-web/src/lib/writingEvidenceModel.mjs`
- Writing validators under `static-web/scripts/`

### Learner Truth
Private Writing attempt/repair/transfer state belongs to learner-local/runtime-private state.

This Acceptance file does not claim that Kian has started, attempted, repaired, transferred, closed, reopened, or consumed any Writing task merely because the module/runtime exists.
