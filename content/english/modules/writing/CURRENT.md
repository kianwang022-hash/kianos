# English Writing Current

Role: independent Writing Work Cursor + restart entry
Parent: `content/english/CURRENT.md`

This file does not own Writing content, acceptance evidence, or learner progress.

---

## Work Cursor

**Scope:** English Writing  
**Active / earliest unresolved stage:** Evidence / Acceptance — later fresh transfer semantics  
**Blocker:** no known upstream S/K/L/P/R blocker; E is not yet accepted  
**Next action:** complete the private Evidence/Transfer path on top of the accepted whole-essay Runtime, then audit E under root `LEARNING_ACCEPTANCE.md`.

### Required semantics for the active E stage

- preserve root diagnosis + completed repair evidence;
- same-prompt success remains repair evidence only;
- admit `TRANSFER_PENDING` only for explicit reusable high-value targets;
- later relevant fresh/new Writing provides stronger transfer evidence;
- support evidence-bound SUPPORT/CLOSE and conservative REOPEN;
- keep private learner evidence out of shared repository Current;
- do not consume protected true-exam tasks merely to manufacture engineering evidence.

---

## Frozen / out of scope

Unless new evidence proves an upstream defect:

- S / K / L / P / R are not to be reopened during this E-stage work;
- do not redesign Writing first-learning cognition;
- do not expand Writing taxonomy/content for convenience;
- do not change protected true-exam policy;
- do not infer or mutate Kian's Learner Truth;
- do not modify Objective / Translation / other English sibling scopes.

---

## Required reads

For ordinary continuation of the active E-stage work, read only:

1. `content/english/modules/writing/ACCEPTANCE.md`
2. `static-web/src/lib/writingRuntimeModel.mjs`
3. `static-web/src/components/WritingWorkspace.astro`

Read `content/english/LEARNING_CONTRACT.md` or `content/english/modules/writing/learning.md` only if new evidence genuinely reopens L/K semantics or a contract boundary must be checked.

---

## Truth references

### Artifact Truth
Canonical / implementation owners include:

- learning asset → `content/english/modules/writing/learning.md`
- synthetic cold-start tasks → `content/english/modules/writing/synthetic-tasks.v1.json`
- true-exam source → `content/english/source/question_bank.v1.json`
- learner runtime → `static-web/src/components/WritingWorkspace.astro`
- runtime model → `static-web/src/lib/writingRuntimeModel.mjs`
- validators → `static-web/scripts/validate-writing-source.mjs`, `validate-writing-learning.mjs`, `validate-writing-runtime.mjs`

### Acceptance Truth
`content/english/modules/writing/ACCEPTANCE.md`

### Learner Truth
Private learner/runtime state only. Repository engineering state must not be interpreted as Kian's Writing progress.

---

## Fresh-Chat target

Known scope `English Writing` should normally recover as:

```text
Writing CURRENT
→ Writing ACCEPTANCE
→ writingRuntimeModel + WritingWorkspace
→ work
```

No English-wide continuation/history read is required for this active scope unless a concrete machine dependency is later proven.
