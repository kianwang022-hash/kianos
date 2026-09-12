# English Objective Current

Role: independent Objective Work Cursor + restart entry
Parent: `content/english/CURRENT.md`
Scope: Reading A / Cloze / Reading B shared Objective runtime

This file does not own Objective cognition/content, acceptance evidence, or learner progress.

---

## Work Cursor

**Active / earliest unresolved stage:** `P — Projection task-browser acceptance`  
**Blocker:** the current acceptance harness is encoded, but hosted jobs still fail before runner assignment / before any workflow step executes; no current Projection product assertion failure is known  
**Next action:** when an executable runner is available, re-run the existing Objective Learner Journey without changing Objective semantics; evaluate **P only** from the relevant task-browser evidence under `ACCEPTANCE.md`.

Active P evidence outputs:

1. `journey-task-smoke.json`
2. `reading-b-forms.json`

`journey-shared.json` remains preserved downstream candidate evidence for later R/E evaluation. It must not be used to leapfrog unresolved P.

If the P assertions execute and pass:

1. write **P PASS** into `content/english/modules/objective/ACCEPTANCE.md`;
2. update this Work Cursor so **R — Runtime** becomes the new earliest unresolved stage;
3. only then evaluate R using preserved shared-browser evidence plus the current executed task paths.

Do not promote P/R/E together from one run.

---

## Frozen / out of scope

Unless new evidence proves a defect:

- S / K / L remain frozen as PASS;
- R remains `UNTESTED — FROZEN` until P PASS;
- E remains `UNTESTED — FROZEN` until R PASS;
- U remains UNTESTED until real learner use;
- do not expand Objective taxonomy or static Skill Content;
- do not change frozen first-learning cognition;
- do not add new Objective product features during P acceptance;
- do not turn Reading A / Cloze / Reading B into question-by-question learner-facing Chat review;
- do not restore per-question WATCH as durable Reading A transfer truth;
- do not close claims through arbitrary pass counters;
- do not modify Translation / Writing / Lexical sibling scopes;
- do not infer or mutate Kian's Learner Truth.

Runner/execution failure before product assertions is not permission to reopen semantics or mark P FAIL.

---

## Required reads

For ordinary re-entry into the active P gate:

1. `content/english/modules/objective/ACCEPTANCE.md`
2. `.github/workflows/static-web-objective-journey.yml`

These two owners are sufficient to know the active acceptance question, what must execute, and what evidence must return.

Read `objective-runtime.md`, `objective-evidence-runtime.md`, task contracts, source owners, or implementation **only if an executed P assertion identifies a concrete defect and ownership tracing requires that exact owner**.

English `continuation.json`, parent Acceptance files, sibling scopes, historical Chat, and legacy repos are not required for ordinary Objective continuation.

---

## Preserved downstream evidence

The prior shared Objective browser closure remains durable evidence:

- commit `d1fd9e53238320678bd86b08146e3c8805249313`;
- workflow run `34661647477`;
- `15/15 PASS` on the shared clean → repair → transfer → close/reopen path.

Current interpretation:

> **Preserved candidate R/E evidence only.**

Do not discard it, but do not treat it as current R/E Acceptance Truth while P is unresolved.

---

## Truth references

### Artifact Truth

- learning cognition → `content/english/modules/objective-learning.md`
- runtime semantics → `content/english/modules/objective-runtime.md`
- evidence/transfer semantics → `content/english/modules/objective-evidence-runtime.md`
- task contracts → `content/english/modules/reading-a.md`, `cloze.md`, `reading-b.md`
- Current source → `content/english/source/`
- learner runtime → Objective / Reading / Cloze surfaces under `static-web/`
- acceptance harness → `.github/workflows/static-web-objective-journey.yml`

### Acceptance Truth

`content/english/modules/objective/ACCEPTANCE.md`

### Learner Truth

Private learner/runtime state only. Objective Artifact/Acceptance/Work state must not be interpreted as Kian's personal Objective progress.

---

## Fresh-Chat target

Known scope `English Objective` should normally recover as:

```text
Objective CURRENT
→ Objective ACCEPTANCE
→ Objective acceptance workflow
→ P only
```

When P becomes PASS, write the local durable transition first; the next fresh chat then recovers at R automatically.

Implementation internals are diagnostic reads, not startup reads.

No English-wide continuation/history read is required unless a concrete machine dependency is later proven.