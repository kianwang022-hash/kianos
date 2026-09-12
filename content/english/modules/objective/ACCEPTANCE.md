# English Objective Acceptance

Status: CURRENT on governance pilot branch
Scope: English Objective tasks — Reading A / Cloze / Reading B
Standard: root `LEARNING_ACCEPTANCE.md`

This file owns current **Acceptance Truth** for the shared Objective learner-facing module.

It does not own Objective cognition/content, runtime implementation, Work Cursor, or Kian's private learner state.

---

## Gate status

| Gate | Status | Current evidence / boundary |
| --- | --- | --- |
| S — Source | PASS | Prior root-acceptance work established Current source ownership/coverage for Objective; current Artifact owners remain `content/english/source/*` + task contracts. Governance branch has not modified Objective Artifact files relative to the compared `main` tip. |
| K — Knowledge | PASS | Canonical shared Objective learning owner `content/english/modules/objective-learning.md` and task contracts for Reading A / Cloze / Reading B were previously accepted; no current Knowledge blocker is recorded and governance work has not changed those Artifact owners. |
| L — Learning | PASS | Accepted learner-facing unit remains one complete passage/set; item-level evidence stays internal; first learning is complete-but-skippable and direct practice remains available. No current Learning blocker is recorded. |
| P — Projection | UNTESTED | Static/source projection evidence is strong and previously passed; final task-browser seal is still not executed in the current acceptance harness because the latest hosted job failed before step assignment. Overall P cannot be called PASS until the intended task-browser path is observed. |
| R — Runtime | UNTESTED | Shared Objective browser closure has prior direct PASS evidence; task-page Chromium/WebKit seal remains unexecuted due runner-layer failure before steps. No product assertion failure is currently known, but missing execution evidence remains UNTESTED rather than PASS. |
| E — Evidence | UNTESTED | Shared browser closure proved key clean/repair/transfer semantics; task-page/four-form acceptance evidence remains unexecuted. Overall E stays UNTESTED for the claimed module-ready scope. |
| U — User Validation | UNTESTED | Engineering/browser acceptance is not learner validation. Real Kian use is required. |

---

## Current readiness claim

Allowed statement:

> **Objective S/K/L are accepted. P/R/E have meaningful partial acceptance evidence, including a passed shared browser closure, but the final task-browser/four-form seal remains UNTESTED because the current harness has not executed its steps. U is UNTESTED. Objective is not yet `Module ready for learner test`.**

Do not reinterpret a runner/job failure before step assignment as a product semantic failure.

---

## Accepted / preserved evidence

### Shared Objective browser closure — PASS

- commit: `d1fd9e53238320678bd86b08146e3c8805249313`
- workflow run: `34661647477`
- artifact: `journey.json`
- checks: `15/15 PASS`

What this evidence supports:

- clean stable work can PASS without forced Chat/debt;
- whole-unit problem handoff is preserved;
- completed repair creates exactly one reusable claim when justified;
- later relevant fresh success can close that claim;
- later contradictory fresh evidence can reopen it.

This is strong R/E evidence for the shared closure path, but not proof that every task-page/form path is sealed.

### Reading B Source / static Projection — PASS for audited boundary

Accepted inventory/evidence recorded by the prior acceptance work:

- 22 sets total;
- 8 gap matching;
- 3 heading matching;
- 9 paragraph ordering;
- 2 comment matching;
- 9/9 ordering skeletons present;
- source audit issue count: 0.

This supports the audited Source/static Projection boundary. It does not replace browser execution of the real forms.

---

## Remaining acceptance seal

The current harness is encoded to produce three evidence surfaces:

1. `journey-shared.json`
2. `journey-task-smoke.json`
3. `reading-b-forms.json`

Current workflow owner:

`.github/workflows/static-web-objective-journey.yml`

The latest recorded attempt in the migrated acceptance evidence was:

- workflow run: `34663161373`
- result: failure before any step assignment;
- `steps = null` / no executable product assertions observed.

Therefore current blocker is **acceptance execution environment**, not a known Objective product/cognition defect.

Required remaining evidence:

- Reading A clean/problem whole-passage task-page integration in Chromium and WebKit;
- Reading B task-page integration in Chromium and WebKit;
- all four real Reading B forms: gap_match / heading_match / ordering / comment_match;
- wrong-ordering whole-set Chat handoff carrying skeleton + candidate inventory;
- preservation of shared clean PASS → whole-unit review → completed repair → later fresh CLOSE → later REOPEN semantics.

If these assertions execute and pass on current Artifact owners, P/R/E may be re-evaluated for PASS. U remains UNTESTED.

---

## Reopen policy

Do **not** reopen S/K/L or add Objective features merely because the acceptance runner cannot execute.

Reopen an upstream gate only when:

- a deliberate audit finds a concrete Source/Knowledge/Learning defect;
- a product assertion actually fails and traces to an upstream defect;
- real learner use exposes repeatable friction or missing stable high-value cognition;
- source/schema change invalidates Current projection/validation.

---

## Truth boundaries

### Artifact Truth

- shared learning owner → `content/english/modules/objective-learning.md`
- shared runtime contract → `content/english/modules/objective-runtime.md`
- evidence/transfer contract → `content/english/modules/objective-evidence-runtime.md`
- task contracts → `reading-a.md`, `cloze.md`, `reading-b.md`
- Current source owners → `content/english/source/`
- learner runtime / validators → Objective/Reading/Cloze surfaces under `static-web/`

### Learner Truth

Private learner/runtime state only.

This Acceptance file does not mean Kian has attempted Objective tasks, repaired any error, or reached transfer closure.

---

## Migration note

This scoped Acceptance owner extracts concrete prior evidence from the previously combined English `continuation.json` and preserves only evidence that has an identifiable commit/run/check boundary.

Narrative completion history is not promoted into acceptance truth.
