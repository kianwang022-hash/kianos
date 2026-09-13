# Xizong A1 Circulation Current

Role: independently continued Xizong System Work Cursor + restart entry  
Parent: `content/xizong/CURRENT.md`

This file does not own medical Core, lane learning semantics, Acceptance Truth, or Kian's learner progress.

---

## Work Cursor

**Scope:** A1 — Circulation  
**Active engineering stage:** fresh **Runtime Loop** re-acceptance  
**Blocker:** none upstream; browser journey must finish after two real Runtime repairs and one test-only DOM reconciliation  
**Next action:** run the standard Xizong QA browser journey. If the full executed path passes, close R and activate E. Do not perform U.

Current fresh progress:

```text
S        RE-ACCEPTED
K        RE-ACCEPTED after semantic repair
L        RE-ACCEPTED
Content  CLOSED
P        RE-ACCEPTED after Projection repair
R        ACTIVE — two real defects repaired; browser verification continuing
E        downstream-frozen behind R
U        real learner only / external workflow
```

> Engineering evidence must not manufacture learner progress. This Chat stops before U.

---

## Current R evidence

Durable executable journey:

`static-web/scripts/test-xizong-a1-browser-journey.mjs`

It launches Astro preview + headless Chrome through CDP and writes `.qa/xizong-a1-browser-runtime.json`.

### QA #352 / `34769191043` — real defect R1

Passed clean start, Logic Group lecture handoff, early Recall/Reveal rejection, current-group-only formal learning evidence, refresh/resume and early Block Recall rejection.

Found:

> Logic Group closure could occur after rating the final-position KP even if a middle KP had no Recall evidence.

Fixed in `83b2ffbd313557451e4ec8fb454236d331b160d4`:

```text
rate current KP
→ find first current-group KP without Recall evidence
→ if found: return to that gap
→ only if none remain: group_close
```

### QA #353 / `34769447361` — real defect R2

Proved after R1 repair:

- B2 formal learning contact **19/19**;
- B2 Recall evidence **19/19**;
- no missing Recall IDs;
- Block Recall gate correct.

Found:

> Block runtime and enhancer separately controlled the completion button, allowing a transient false-ready affordance while `lectureRead=false`.

Fixed in `2e5cde38fee9d78f9a0841fa766b6d3e3696d05f`:

```text
all KP formal learning contact
+ all KP Recall evidence
+ Block Recall complete
+ original Lecture one-pass confirmation
→ Block complete may become available
```

### QA #354 / `34769646325` — test-only mismatch, no product rollback

The journey then passed through:

- all 19/19 learning + Recall evidence;
- Block Recall completion;
- Lecture-confirmation lock/unlock;
- Block completion persistence;
- refresh of completed state;
- Home Continue returning to the last real A1 Block.

It stopped at the **test assertion** for early System Recall. The test referenced old nonexistent selectors (`data-system-recall-prompt` / `data-system-recall-answer`). The actual System Recall UI is a closed `<dialog data-recall-dialog>` whose prompt text is allowed to exist in DOM while the dialog remains unopened.

The Runtime guard already intercepts the start/reveal action before the dialog handler when all A1 Blocks are not complete. Therefore the correct executed assertions are:

```text
before all 12 Blocks complete:
click System Recall
→ dialog.open = false
→ no System Recall evidence written

after engineering fixture marks all 12 complete:
click System Recall
→ dialog.open = true
→ neutral front visible
→ Reveal allowed
```

Only the browser test was reconciled to these real DOM semantics. No learner-facing product behavior was weakened.

---

## R acceptance target remaining

The next normal browser run must still prove the complete remaining path:

1. all prior Block/Logic Group checks remain green;
2. early System Recall dialog remains closed and creates no evidence;
3. all-12-Blocks engineering fixture releases System Recall;
4. System Recall reveal/completion persists;
5. explicit whole-paper holdout is required before official System sweep;
6. saved holdout unlocks the sweep and question workspace executes;
7. malformed browser-local Block state falls back to clean orientation without manufactured progress.

If this passes, R fresh closes and E becomes active. If another concrete Runtime defect appears, repair only the smallest responsible owner and rerun.

---

## Frozen while R is active

- no medical Content rewrite without a runtime-discovered semantic contradiction;
- no visual-polish expansion;
- no Question→KP inference;
- no learner-progress claims;
- no U execution;
- no sibling-System mutation except shared-runtime regression fixes required by the same shared contract.

---

## Truth references

### Artifact Truth

- System owner → `content/xizong/knowledge/systems/a1-circulation/system.json`
- medical Core → `content/xizong/knowledge/systems/a1-circulation/blocks/`
- lane Learning constitution → `content/xizong/LEARNING_CONTRACT.md`
- shared policy → `content/xizong/knowledge/learner/study-policy.json`
- A1 Learning support → `content/xizong/knowledge/learner/a1-circulation-learning.json`
- learner-facing Projection/Runtime → Xizong surfaces under `static-web/`

### Acceptance Truth

`content/xizong/knowledge/systems/a1-circulation/ACCEPTANCE.md`

### Learner Truth

Private learner/browser/conversation evidence only.

---

## Fresh-Chat target

```text
A1 CURRENT
→ standard Xizong QA browser Runtime journey
→ PASS: R close → E active
→ FAIL: smallest responsible Runtime owner
```
