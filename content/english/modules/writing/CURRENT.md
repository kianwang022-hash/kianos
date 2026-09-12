# English Writing Current

Role: independent Writing Work Cursor + restart entry
Parent: `content/english/CURRENT.md`

This file does not own Writing content, acceptance evidence, or learner progress.

---

## Work Cursor

**Scope:** English Writing  
**Active / earliest unresolved stage:** U — real learner validation  
**Blocker:** no known S/K/L/P/R/E engineering blocker; U requires actual learner use and cannot be manufactured from repository state  
**Next action:** when Kian actually reaches and uses Writing, observe the real learner path and record path-scoped U evidence; do not trigger learner testing merely because the module is engineering-ready.

### U-stage boundary

- S / K / L / P / R / E are accepted and frozen unless new concrete evidence proves an earlier defect;
- private Writing attempts, diagnoses, repairs, transfer targets, SUPPORT/CLOSE/REOPEN events remain learner-local only;
- repository state must not imply that Kian has started Writing, completed a synthetic task, or accumulated transfer evidence;
- real friction during use outranks speculative polish;
- protected true-exam material remains protected by the existing learning/runtime policy and must not be consumed for engineering demonstration.

---

## Frozen / out of scope

Unless real learner evidence reopens an earlier responsibility layer:

- do not redesign Writing first-learning cognition;
- do not expand Writing taxonomy/content for convenience;
- do not reopen the accepted whole-essay Runtime;
- do not add transfer counters or manufactured review debt;
- do not change protected true-exam policy;
- do not modify Objective / Translation / other English sibling scopes.

---

## Required reads

For ordinary continuation from this U-stage cursor, read only:

1. `content/english/modules/writing/ACCEPTANCE.md`
2. `static-web/src/components/WritingWorkspace.astro`
3. `static-web/src/components/WritingEvidencePanel.astro`
4. `static-web/src/lib/writingEvidenceModel.mjs`

Read `content/english/LEARNING_CONTRACT.md`, `content/english/modules/writing/learning.md`, or upstream source owners only if real learner evidence provides a concrete reason to reopen L/K/S semantics.

---

## Truth references

### Artifact Truth
Canonical / implementation owners include:

- learning asset → `content/english/modules/writing/learning.md`
- synthetic cold-start tasks → `content/english/modules/writing/synthetic-tasks.v1.json`
- true-exam source → `content/english/source/question_bank.v1.json`
- whole-essay runtime → `static-web/src/components/WritingWorkspace.astro`
- runtime model → `static-web/src/lib/writingRuntimeModel.mjs`
- private transfer evidence UI → `static-web/src/components/WritingEvidencePanel.astro`
- private transfer evidence model → `static-web/src/lib/writingEvidenceModel.mjs`
- validators → `static-web/scripts/validate-writing-source.mjs`, `validate-writing-learning.mjs`, `validate-writing-runtime.mjs`, `validate-writing-evidence.mjs`

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
→ WritingWorkspace + WritingEvidencePanel
→ writingEvidenceModel
→ real learner evidence only if it exists
```

No English-wide continuation/history read is required unless a concrete machine dependency is later proven.
