# English Writing Current

Role: independent Writing Work Cursor + restart entry
Parent: `content/english/CURRENT.md`

This file does not own Writing content, acceptance evidence, or learner progress.

---

## Work Cursor

**Scope:** English Writing  
**Active / earliest unresolved stage:** U — real learner validation  
**Blocker:** no known S/K/L/P/R/E engineering blocker after the 2026-09-12 architecture re-audit; U requires actual learner use and cannot be manufactured from repository state  
**Next action:** when Kian actually reaches Writing, use the accepted learner path and observe real friction. Do not trigger learner testing merely because the module is engineering-ready.

### Latest re-audit disposition

The latest architecture review found one concrete P/R scope mismatch and repaired it:

```text
First Learning / B1–B8
→ Synthetic Small + Big
→ both reach a terminal qualification state
→ release exactly one clean protected true-exam task
→ same whole-essay Runtime / Evidence path
```

`validate-writing-exam-entry.mjs` now makes that bridge executable acceptance evidence. PR #25 `Static Web Writing QA` run 102 passed both Writing acceptance validation and Astro build.

Therefore P/R return to PASS; the cursor returns to U. This does not mean Kian has completed either synthetic task or opened a true exam.

### U-stage boundary

- S / K / L / P / R / E are accepted and frozen unless new concrete evidence proves an earlier defect;
- private Writing attempts, diagnoses, repairs, true-exam exposure, transfer targets, SUPPORT/CLOSE/REOPEN events remain learner-local only;
- repository state must not imply that Kian has started Writing, completed the synthetic gate, opened the protected true exam, or accumulated transfer evidence;
- real friction during use outranks speculative polish;
- protected true-exam material remains protected by the learning/runtime policy and must not be consumed as engineering learner evidence.

---

## Frozen / out of scope

Unless real learner evidence reopens an earlier responsibility layer:

- do not redesign Writing first-learning cognition;
- do not expand Writing taxonomy/content for convenience;
- do not create a second true-exam Runtime;
- do not expose a protected true-exam catalog before the qualification gate;
- do not add transfer counters or manufactured review debt;
- do not modify Objective / Translation / other English sibling scopes.

---

## Required reads

For ordinary continuation from this U-stage cursor, read only:

1. `content/english/modules/writing/ACCEPTANCE.md`
2. `static-web/src/lib/englishWritingRuntimeTask.mjs`
3. `static-web/src/components/WritingWorkspace.astro`
4. `static-web/src/components/WritingEvidencePanel.astro`

Read `WritingProtectedExamGate.astro` only when the real path reaches or fails at true-exam entry. Read `content/english/LEARNING_CONTRACT.md`, `content/english/modules/writing/learning.md`, or upstream source owners only if real learner evidence provides a concrete reason to reopen L/K/S semantics.

---

## Truth references

### Artifact Truth
Canonical / implementation owners include:

- learning asset → `content/english/modules/writing/learning.md`
- synthetic cold-start tasks → `content/english/modules/writing/synthetic-tasks.v1.json`
- true-exam source → `content/english/source/question_bank.v1.json`
- released true-exam adapter → `static-web/src/lib/englishWritingRuntimeTask.mjs`
- true-exam qualification gate → `static-web/src/components/WritingProtectedExamGate.astro`
- whole-essay runtime → `static-web/src/components/WritingWorkspace.astro`
- runtime model → `static-web/src/lib/writingRuntimeModel.mjs`
- private transfer evidence UI → `static-web/src/components/WritingEvidencePanel.astro`
- private transfer evidence model → `static-web/src/lib/writingEvidenceModel.mjs`
- validators → `validate-writing-source.mjs`, `validate-writing-learning.mjs`, `validate-writing-runtime.mjs`, `validate-writing-exam-entry.mjs`, `validate-writing-evidence.mjs`

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
→ exact real learner path / failing owner only if U evidence exists
```

No English-wide continuation/history read is required unless a concrete machine dependency is later proven.
