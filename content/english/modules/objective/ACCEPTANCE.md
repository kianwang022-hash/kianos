# English Objective Acceptance

Status: CURRENT
Scope: English Objective tasks — Reading A / Cloze / Reading B
Standard: root `LEARNING_ACCEPTANCE.md`

This file owns current **Acceptance Truth** for the shared Objective learner-facing module.

It does not own Objective cognition/content, runtime implementation, Work Cursor, or Kian's private learner state.

---

## Gate status

| Gate | Status | Current evidence / boundary |
| --- | --- | --- |
| S — Source | PASS | Current source ownership/coverage remains accepted; no Source blocker is recorded. |
| K — Knowledge | PASS | Canonical Objective learning owner and task contracts remain accepted; no Knowledge blocker is recorded. |
| L — Learning | PASS | Whole passage/set remains the learner-facing unit; first learning remains complete-but-skippable; no Learning blocker is recorded. |
| P — Projection | PASS | Strict Chromium/WebKit task-page seal confirms Reading A and Reading B projection, all four real Reading B forms, and source-faithful ordering handoff. |
| R — Runtime | PASS | Browser evidence executes clean attempt/submission, whole-unit problem routing, safe repair return, idempotent state changes, task continuation into fresh material, and actual Reading A/B task pages without manufactured debt. |
| E — Evidence | **PASS** | Evidence admission, authorization, persistence, transfer closure, and conservative reopening were executed against the canonical evidence contract, including negative boundary tests. |
| U — User Validation | **UNTESTED** | Real Kian use only. Engineering/browser acceptance cannot replace learner validation, and U is recorded only for learner paths actually used. |

---

## Current readiness claim

Allowed statement:

> **Objective S/K/L/P/R/E are accepted. The module is ready for learner test. U remains UNTESTED; Objective is not yet learner-validated.**

Do not infer any Kian progress from this engineering readiness state.

---

## Accepted P — Projection evidence

Canonical P seal:

- artifact head: `addb1c74cbe6ca756fd613bff7e634a3741c0995`
- workflow run: `34695962533`
- successful rerun job: `103559543188`
- artifact id: `10297889295`
- `journey-task-smoke.json` → `pass: true`
- `reading-b-forms.json` → `pass: true`, `88` checks

What P proves:

- Reading A strict task pages load and execute in Chromium + WebKit;
- clean Reading A PASS does not force Chat;
- Reading A problem work remains passage-first;
- Reading B projects task form, directions, candidate policy/text and executable answer maps;
- all four real Reading B forms execute in Chromium + WebKit;
- ordering preserves skeleton/fixed givens and whole-set context;
- a source-faithful wrong ordering produces a whole-set Chat packet containing task form, ordering skeleton, candidate inventory, and exam-slot context.

Real P defect found/fixed during seal:

- `ReadingDeferredReviewShield.astro` had a self-triggering `MutationObserver` loop caused by unconditional stop-button `textContent` rewriting;
- product fix commit: `74e0f3655efec9feec976525bae00e4fc22e4706`;
- the strict `DOMContentLoaded + real interaction` seal then passed.

The later ordering red light was an acceptance-fixture error, not a product defect: all ordering candidates are correctly consumed exactly once, so an “unused extra candidate” cannot exist. The negative case was corrected to swap two valid movable answers without weakening the single-use rule.

- fixture fix commit: `addb1c74cbe6ca756fd613bff7e634a3741c0995`

---

## Accepted R — Runtime evidence

Current Runtime seal from workflow run `34695962533`:

- `journey-shared.json` → `pass: true`, Chromium full journey PASS, `15/15` checks;
- `journey-task-smoke.json` → `pass: true`, Chromium + WebKit;
- `reading-b-forms.json` → `pass: true`, `88` checks.

What R proves:

- clean attempt/submission executes;
- clean PASS does not manufacture review/transfer debt;
- problem work routes as a whole passage/set;
- failed return persistence does not partially corrupt claim state;
- completed repair return can create one justified pending claim;
- duplicate return import is idempotent;
- attempt/trajectory/result state survives through the executed browser lifecycle;
- pending procedure claims can continue into later fresh material;
- Reading A / Reading B actual task pages execute on Chromium + WebKit.

Therefore **R = PASS**.

---

## Accepted E — Evidence / Transfer evidence

### Canonical E seal

- artifact head: `3167ebaf6d6cb2402c728561ddb19a905be0dbda`
- workflow: `Objective Learner Journey`
- workflow run: `34696424413`
- successful job: `103560584877`
- artifact: `objective-journey-3167ebaf6d6cb2402c728561ddb19a905be0dbda`
- artifact id: `10299280963`
- `journey-shared.json` → `pass: true`
- Chromium full journey → PASS
- Evidence/runtime shared checks → **20/20 PASS**

### E contract mapping

The current executed evidence proves the important boundaries in `objective-evidence-runtime.md`:

- **Clean work is not debt:** clean PASS creates no claim and no forced Chat.
- **Diagnosis ≠ repair:** a diagnosis-only thread with `repairCompleted=false` cannot create a task claim.
- **Ability-owner routing stays canonical:** Lexical-routed and Reading-routed repairs cannot create duplicate Objective task claims.
- **Repair admission is explicit:** a completed task-specific repair with non-empty repair evidence can create exactly one `TRANSFER_PENDING` claim.
- **No duplicate debt:** repeated import of the same valid return is idempotent.
- **Handoff authorization matters:** a same-object/stale handoff cannot close a newly-created pending claim merely by naming its ID.
- **Fresh context travels with the claim:** a later clean transfer packet contains the active claim plus current item context.
- **Fresh evidence is required:** a closure update with empty evidence is rejected; relevant fresh evidence can close the claim.
- **CLOSED is not casually reopened:** a clean transfer handoff that did not expose the claim as a reopen candidate cannot authorize `REOPENED`.
- **Contradictory fresh evidence can reopen:** a later problem packet may conservatively expose the closed claim as a reopen candidate, and explicit fresh contradictory evidence reopens it to `TRANSFER_PENDING`.
- **Persistence failure is safe:** failed return persistence preserves the learner's pasted return and rolls back claim-state mutation rather than reporting false success or leaving avoidable partial state.

The browser never closes claims through an arbitrary “N passes = mastery” counter; semantic relevance remains Chat-mediated and evidence-bound.

Therefore **E = PASS**.

---

## Learner Validation — U

U is deliberately not an engineering gate that can be closed here.

Current state:

> **UNTESTED — ready for real learner use.**

When Kian naturally uses Objective, record validation only for the path actually exercised, for example:

- clean attempt path;
- problem → whole-unit review → repair path;
- later transfer closure/reopen path;
- specific Reading A / Cloze / Reading B task forms actually encountered.

One real path succeeding does not automatically validate every Objective path.

No synthetic “please test this now” session is required merely to make U green.

---

## Gate progression / readiness

```text
S PASS
→ K PASS
→ L PASS
→ P PASS
→ R PASS
→ E PASS
→ U UNTESTED by real learner path
```

Engineering readiness language:

> **Module ready for learner test.**

Forbidden until real U evidence exists:

> **Learner-validated.**

---

## Reopen policy

Do not reopen S–E casually after this closure.

Reopen the earliest responsible gate only when:

- a concrete executed assertion fails after an Artifact change;
- source/schema change invalidates an accepted boundary;
- real learner use exposes repeatable friction or a semantic contradiction;
- a deliberate local audit produces specific new evidence.

Real learner feedback may reopen P/R/E or even an upstream gate when the evidence genuinely traces there; U itself must not be used to hide an upstream defect.

---

## Truth boundaries

### Artifact Truth

- shared learning owner → `content/english/modules/objective-learning.md`
- shared runtime contract → `content/english/modules/objective-runtime.md`
- evidence/transfer contract → `content/english/modules/objective-evidence-runtime.md`
- task contracts → `reading-a.md`, `cloze.md`, `reading-b.md`
- Current source owners → `content/english/source/`
- learner runtime / validators → Objective/Reading/Cloze surfaces under `static-web/`

### Acceptance Truth

This file only.

### Learner Truth

Private learner/runtime state only.

This Acceptance file does not mean Kian has personally attempted Objective tasks, repaired any error, or reached transfer closure.