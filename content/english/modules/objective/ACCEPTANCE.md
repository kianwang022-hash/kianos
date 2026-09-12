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
| R — Runtime | **PASS** | Current browser evidence executes clean attempt/submission, whole-unit problem routing, safe repair return, idempotent state changes, task continuation into fresh material, and actual Reading A/B task pages without manufactured debt. |
| E — Evidence | **UNTESTED — ACTIVE** | Earliest unresolved gate. Existing shared-browser observations are candidate Evidence proof and must now be checked against the canonical evidence/transfer contract. |
| U — User Validation | UNTESTED | Real Kian use only; engineering/browser evidence cannot replace learner validation. |

---

## Current readiness claim

Allowed statement:

> **Objective S/K/L/P/R are accepted. E is now the earliest unresolved and only active gate. U remains UNTESTED. Objective is not yet `Module ready for learner test`.**

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

A later ordering red light was an acceptance-fixture error, not a product defect: all ordering candidates are correctly consumed exactly once, so an “unused extra candidate” cannot exist. The negative case was corrected to swap two valid movable answers without weakening the single-use rule.

- fixture fix commit: `addb1c74cbe6ca756fd613bff7e634a3741c0995`

---

## Accepted R — Runtime evidence

### Canonical current Runtime seal

The successful rerun of workflow run `34695962533` produced all three current evidence surfaces successfully.

`journey-shared.json`:

- `pass: true`;
- Chromium full journey PASS;
- `15/15` runtime/evidence lifecycle checks PASS.

`journey-task-smoke.json`:

- `pass: true`;
- Chromium + WebKit task-page integration PASS.

`reading-b-forms.json`:

- `pass: true`;
- `88` form/runtime checks PASS.

### R contract mapping

The current execution proves the Runtime contract rather than merely showing implementation existence:

- **Clean attempt / submission:** Cloze clean score executes; Reading A clean submission executes in Chromium + WebKit; Reading B formal maps execute in both browsers.
- **No manufactured debt:** clean PASS creates no forced Chat and no transfer debt.
- **Whole-unit problem routing:** Cloze problem packet is whole-unit; Reading A problem flow is passage-first; Reading B wrong ordering produces one complete set packet.
- **Safe return behavior:** failed return import preserves pasted return text and rolls back claim state rather than partially mutating learner state.
- **Repair return:** a completed repair can create exactly one justified pending claim.
- **Idempotence:** importing the same return twice does not duplicate debt/state.
- **State continuity:** attempt/trajectory/results are persisted and read back during the browser journey; transfer packets carry active claim + fresh item context forward.
- **Fresh-task continuation:** the journey uses multiple fresh Cloze sets and carries the claim into later fresh material instead of looping on the repaired historical item.
- **Cross-task execution:** Reading A and Reading B actual task pages execute on Chromium + WebKit; Reading B all real forms are executable.

No missing Runtime path required a new product feature or a lowered acceptance standard.

Therefore **R = PASS**.

---

## Active gate — E / Evidence

### E acceptance question

> Does Objective admit, preserve, update, close, and reopen learning evidence in a way that matches the canonical evidence/transfer semantics — without confusing diagnosis with repair, remembered-item success with transfer, one-off failure with durable weakness, or engineering state with learner mastery?

### Candidate E evidence already available

The current shared browser journey already executed evidence-relevant checks including:

- clean PASS creates no debt;
- completed repair creates one pending claim;
- duplicate return is idempotent;
- closure without fresh evidence is rejected;
- fresh relevant evidence closes the claim;
- a problem packet can surface a closed claim as a reopen candidate;
- fresh contradictory evidence reopens the closed claim.

These observations are strong candidate E evidence, but **E is not PASS until checked against `content/english/modules/objective-evidence-runtime.md`.**

---

## Gate progression rule

```text
S PASS
→ K PASS
→ L PASS
→ P PASS
→ R PASS
→ E ACTIVE / UNTESTED
→ U UNTESTED by real learner path
```

Required transition behavior:

1. Only E is active now.
2. If E PASSes, write E PASS here first and move Objective `CURRENT.md` to U / learner validation.
3. Only after S–E PASS may Objective be called `Module ready for learner test`.
4. U remains separate and path-specific to real learner use.

A single workflow run may contain evidence relevant to several gates, but Acceptance Truth advances one earliest unresolved gate at a time.

---

## Reopen policy

Do not reopen S/K/L/P/R merely because an E assertion fails.

Reopen an upstream gate only when a concrete failure traces to that upstream owner, a source/schema change invalidates it, or real learner use exposes a repeatable upstream defect.

Do not relax the Evidence standard to make existing automation green.

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