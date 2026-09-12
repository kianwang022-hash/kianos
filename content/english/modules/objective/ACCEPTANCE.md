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
| S — Source | PASS | Prior root-acceptance work established Current source ownership/coverage for Objective; current Artifact owners remain `content/english/source/*` + task contracts. No current Source blocker is recorded. |
| K — Knowledge | PASS | Canonical shared Objective learning owner `content/english/modules/objective-learning.md` and task contracts for Reading A / Cloze / Reading B were previously accepted; no current Knowledge blocker is recorded. |
| L — Learning | PASS | Accepted learner-facing unit remains one complete passage/set; item-level evidence stays internal; first learning is complete-but-skippable and direct practice remains available. No current Learning blocker is recorded. |
| P — Projection | UNTESTED — ACTIVE | **Earliest unresolved gate.** Static/source projection evidence is strong, but the required learner-facing task-browser paths have not executed in the current acceptance harness because the hosted job failed before runner assignment. P cannot be called PASS until those paths are observed. |
| R — Runtime | UNTESTED — FROZEN | Downstream of P. Prior shared browser closure is preserved as candidate Runtime evidence, but R is not an active acceptance gate until P becomes PASS. |
| E — Evidence | UNTESTED — FROZEN | Downstream of R. Prior shared browser closure is preserved as candidate Evidence evidence, but E is not an active acceptance gate until R becomes PASS. |
| U — User Validation | UNTESTED | Engineering/browser acceptance is not learner validation. Real Kian use is required, and validation is recorded only for the learner paths actually used. |

---

## Current readiness claim

Allowed statement:

> **Objective S/K/L are accepted. P is the earliest unresolved and only active acceptance gate. R and E remain UNTESTED/FROZEN downstream even though useful candidate evidence already exists. U is UNTESTED. Objective is not yet `Module ready for learner test`.**

Do not reinterpret a runner/job failure before step assignment as a Projection failure, and do not use downstream evidence to leapfrog P.

---

## Active gate — P / Projection

### P acceptance question

> Can the accepted Objective learning model and task contracts be projected into the actual learner-facing Reading A / Cloze / Reading B surfaces without losing required task information, leaking answers, changing the review unit, or forcing an interaction that contradicts the accepted cognition?

### Already accepted within P's audited static boundary

- Current source/static projection validators pass for the audited Objective boundary;
- Reading B inventory is preserved as 22 real sets:
  - 8 gap matching;
  - 3 heading matching;
  - 9 paragraph ordering;
  - 2 comment matching;
- 9/9 ordering skeletons are present;
- source audit issue count is 0;
- real task form/directions, candidate text, fixed givens, candidate-use policy, and ordering skeleton are represented in Current projection owners.

This static evidence is necessary but not sufficient to close P.

### Remaining P execution evidence

The existing acceptance workflow must execute the learner-facing task paths and produce trustworthy browser evidence for:

- Reading A clean task-page path in Chromium and WebKit;
- Reading A problem path preserving whole-passage diagnosis before local repair;
- Reading B task-page integration in Chromium and WebKit;
- all four real Reading B forms:
  - `gap_match`;
  - `heading_match`;
  - `ordering`;
  - `comment_match`;
- wrong-ordering whole-set Chat handoff carrying the task form, ordering skeleton, candidate inventory, and exam slot context;
- no pre-attempt answer leakage or invalid task-form projection on those exercised paths.

Primary P evidence outputs:

1. `journey-task-smoke.json`
2. `reading-b-forms.json`

`journey-shared.json` is still produced by the workflow, but it is preserved primarily as downstream Runtime/Evidence candidate evidence and must not be used to skip P.

### Current P blocker

Latest hosted attempts fail before runner assignment / before any workflow step executes. No current P product assertion has failed.

Therefore:

- P remains **UNTESTED — ACTIVE**;
- do not change Objective product semantics merely to make CI green;
- when the runner can execute, re-run the existing workflow without widening the audit or consuming learner evidence.

---

## Preserved downstream evidence — not active acceptance

The following evidence is real and must not be discarded, but it does **not** close downstream gates while P is unresolved.

### Shared Objective browser closure — preserved candidate R/E evidence

- commit: `d1fd9e53238320678bd86b08146e3c8805249313`
- workflow run: `34661647477`
- artifact: `journey.json`
- checks: `15/15 PASS`

What this evidence supports for later gate evaluation:

- clean stable work can PASS without forced Chat/debt;
- whole-unit problem handoff is preserved;
- completed repair creates exactly one reusable claim when justified;
- later relevant fresh success can close that claim;
- later contradictory fresh evidence can reopen it.

Current interpretation:

> **candidate evidence for R/E, not current R/E Acceptance Truth.**

Once P becomes PASS, re-evaluate R using the preserved evidence plus the current executed task paths. Only after R becomes PASS may E become active.

---

## Gate progression rule

Objective acceptance now follows strict earliest-unresolved-stage containment:

```text
S PASS
→ K PASS
→ L PASS
→ P ACTIVE / UNTESTED
→ R FROZEN / UNTESTED
→ E FROZEN / UNTESTED
→ U UNTESTED by real learner path
```

Required transition behavior:

1. **While P is unresolved:** only P is active. R/E evidence may be preserved but cannot be promoted.
2. **If P executes and PASSes:** write P PASS here first, then update Objective `CURRENT.md` so R becomes the earliest unresolved gate.
3. **When R is active:** evaluate Runtime using preserved shared-browser evidence plus any newly executed task-page evidence. Do not assume PASS from implementation existence.
4. **Only after R PASS:** activate E and evaluate whether the evidence/transfer loop itself is trustworthy and correctly bound.
5. **Only after S–E PASS:** the module may be called `Module ready for learner test`.
6. **U remains separate:** only real learner use can validate the learner paths actually exercised.

A single workflow run may return evidence relevant to several gates, but Acceptance Truth still advances **one earliest unresolved gate at a time**.

---

## Acceptance execution owner

Current workflow owner:

`.github/workflows/static-web-objective-journey.yml`

The workflow currently produces three evidence surfaces:

1. `journey-shared.json`
2. `journey-task-smoke.json`
3. `reading-b-forms.json`

Its existence or successful setup/build steps are not Acceptance PASS. Gate decisions come from the relevant executed assertions and this local Acceptance owner.

---

## Reopen policy

Do **not** reopen S/K/L or add Objective features merely because the acceptance runner cannot execute.

Reopen an upstream gate only when:

- a deliberate local audit finds a concrete Source/Knowledge/Learning defect;
- an executed product assertion fails and traces to an upstream defect;
- real learner use exposes repeatable friction or missing stable high-value cognition;
- source/schema change invalidates Current projection/validation.

If an executed P assertion fails, trace the earliest responsible layer and reopen only that layer. Do not relax the acceptance standard to make the run green.

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