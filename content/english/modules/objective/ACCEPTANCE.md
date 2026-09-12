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
| P — Projection | **PASS** | Strict Chromium/WebKit task-page execution now confirms Reading A and Reading B learner-facing projection, including all four real Reading B forms and the ordering whole-set handoff. |
| R — Runtime | **UNTESTED — ACTIVE** | Earliest unresolved gate. Preserved shared-browser closure plus current task-page execution are candidate Runtime evidence; they must now be evaluated against the Runtime contract before R can PASS. |
| E — Evidence | UNTESTED — FROZEN | Downstream of R. Preserved evidence/transfer checks remain candidate evidence only until R closes. |
| U — User Validation | UNTESTED | Real Kian use only; engineering/browser evidence cannot replace learner validation. |

---

## Current readiness claim

Allowed statement:

> **Objective S/K/L/P are accepted. R is now the earliest unresolved and only active gate. E remains UNTESTED/FROZEN. U is UNTESTED. Objective is not yet `Module ready for learner test`.**

---

## Accepted P — Projection evidence

### Canonical P seal

- artifact head: `addb1c74cbe6ca756fd613bff7e634a3741c0995`
- workflow: `Objective Learner Journey`
- workflow run: `34695962533`
- successful rerun job: `103559543188`
- successful artifact: `objective-journey-addb1c74cbe6ca756fd613bff7e634a3741c0995`
- artifact id: `10297889295`

Primary P evidence surfaces:

1. `journey-task-smoke.json` — `pass: true`
2. `reading-b-forms.json` — `pass: true`, `88` checks

### What P now proves

Reading A, in both Chromium and WebKit:

- real task page loads under the strict browser seal;
- clean passage work can execute and PASS;
- clean PASS does not force Chat review;
- problem work remains passage-first rather than question-first;
- the retired local semantic coach is not projected back into the learner path.

Reading B, in both Chromium and WebKit:

- task form and single-use candidate policy are projected;
- directions and candidate text are visible;
- formal maps are executable;
- all four real forms execute cleanly:
  - `gap_match`;
  - `heading_match`;
  - `ordering`;
  - `comment_match`;
- ordering shows the real skeleton and fixed givens without a fake material panel;
- fixed givens are not selectable as movable candidates;
- comment matching projects the actual named target;
- clean PASS does not force Chat review.

Ordering negative-path handoff also proves that a source-faithful wrong ordering can still produce a **whole-set** Chat packet carrying:

- `Task form: ordering`;
- `ORDERING SKELETON`;
- `CANDIDATE INVENTORY`;
- exam slot context (`Slot 41`).

### P defect found and fixed during acceptance

The strict P seal exposed a real Reading A browser-initialization defect in `ReadingDeferredReviewShield.astro`: a `MutationObserver` called `sync()`, while `sync()` unconditionally rewrote the stop-button `textContent`, creating a self-triggering child-list mutation loop.

Product fix:

- commit `74e0f3655efec9feec976525bae00e4fc22e4706`
- `textContent` is now rewritten only when the label actually changes.

After that product fix, the strict `DOMContentLoaded + real interaction` task-page seal passed. The standard was not weakened to make CI green.

A later Reading B red light was traced to the acceptance fixture itself: ordering consumes every candidate exactly once, so an “unused extra candidate” cannot exist. The negative test was corrected to swap two valid movable formal answers, preserving the real single-use rule while intentionally producing a wrong order.

Test-fixture fix:

- commit `addb1c74cbe6ca756fd613bff7e634a3741c0995`

This fixture correction did not change Objective product semantics or lower the P standard.

---

## Active gate — R / Runtime

### R acceptance question

> Does the accepted learner-facing Objective projection actually execute the intended task lifecycle reliably — clean attempt, submission, whole-unit problem routing, repair return, state persistence, and task continuation — without hidden runtime contradictions or manufactured learning debt?

### Candidate R evidence already preserved

#### Shared Objective browser closure

- commit: `d1fd9e53238320678bd86b08146e3c8805249313`
- workflow run: `34661647477`
- artifact: `journey.json`
- checks: `15/15 PASS`

This candidate evidence exercised:

- clean PASS without forced Chat/debt;
- whole-unit problem handoff;
- completed repair before reusable claim admission;
- later fresh close;
- later contradictory fresh reopen.

#### Current P execution

The accepted P seal above also proves that the actual Reading A / Reading B task pages execute in Chromium and WebKit, including clean submission and the Reading B ordering problem handoff.

These are strong Runtime candidates, but **R is not PASS until they are checked against the current Runtime owner and any missing runtime acceptance path is identified or executed.**

---

## Preserved downstream Evidence candidates — not active acceptance

The same shared-browser closure contains useful Evidence-layer observations, but E remains frozen while R is unresolved.

Do not promote E from those observations until R PASS is written first.

---

## Gate progression rule

```text
S PASS
→ K PASS
→ L PASS
→ P PASS
→ R ACTIVE / UNTESTED
→ E FROZEN / UNTESTED
→ U UNTESTED by real learner path
```

Required transition behavior:

1. Only R is active now.
2. If R PASSes, write R PASS here first and move Objective `CURRENT.md` to E.
3. Only then evaluate E.
4. Only after S–E PASS may Objective be called `Module ready for learner test`.
5. U remains separate and path-specific to real learner use.

A single workflow run may contain evidence relevant to several gates, but Acceptance Truth still advances one earliest unresolved gate at a time.

---

## Acceptance execution owner

Current workflow owner:

`.github/workflows/static-web-objective-journey.yml`

Evidence surfaces currently available:

1. `journey-shared.json`
2. `journey-task-smoke.json`
3. `reading-b-forms.json`

Their existence alone is not Acceptance PASS; gate decisions come from executed assertions interpreted against the active gate owner.

---

## Reopen policy

Do not reopen S/K/L/P merely because a downstream assertion fails.

Reopen an upstream gate only when:

- a concrete assertion traces to that upstream owner;
- real learner use exposes repeatable upstream friction;
- a source/schema change invalidates accepted projection/content;
- a deliberate local audit finds a specific upstream contradiction.

If an R assertion fails, trace the earliest responsible layer and reopen only that layer. Do not relax the acceptance standard to make the run green.

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

This Acceptance file does not mean Kian has attempted Objective tasks, repaired any error, or reached transfer closure.