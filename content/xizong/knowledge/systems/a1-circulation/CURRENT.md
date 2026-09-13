# Xizong A1 Circulation Current

Role: independently continued Xizong System Work Cursor + restart entry  
Parent: `content/xizong/CURRENT.md`

This file does not own medical Core, lane learning semantics, Acceptance Truth, or Kian's learner progress.

---

## Work Cursor

**Scope:** A1 — Circulation  
**Active engineering stage:** fresh **Evidence / Acceptance** re-acceptance  
**Blocker:** none through Runtime  
**Next action:** fresh-audit A1 evidence semantics and storage behavior: repeated Recall attempts, repair≠mastery, Wrong/Uncertain routing, reviewed-only precise repair, holdout protection, stale/version invalidation, repair inbox return, and malformed-state containment. Stop before U.

Current fresh progress:

```text
S        RE-ACCEPTED
K        RE-ACCEPTED after semantic repair
L        RE-ACCEPTED
Content  CLOSED
P        RE-ACCEPTED after Projection repair
R        RE-ACCEPTED by executed browser journey
E        ACTIVE fresh attack
U        real learner only / external workflow
```

> Engineering evidence must not manufacture learner progress. U is explicitly owned elsewhere.

---

## R closure receipt

Durable executable journey:

`static-web/scripts/test-xizong-a1-browser-journey.mjs`

It starts Astro preview + headless Chrome through CDP and exercises real DOM/localStorage transitions.

Two real Runtime defects were found before closure:

1. **Logic Group premature closure** — rating the final-position KP could close a group despite an unrecalled middle KP. Fixed by returning to the first Recall gap and allowing closure only when every current-group KP has Recall evidence (`83b2ffbd313557451e4ec8fb454236d331b160d4`).
2. **Block completion transient false-ready state** — Block runtime and enhancer competed over the completion button. `XizongBlockV6.canComplete()` now directly requires all KP formal contact + all KP Recall + Block Recall + original-Lecture one-pass confirmation (`2e5cde38fee9d78f9a0841fa766b6d3e3696d05f`).

QA #354 exposed a test-only obsolete System Recall selector; the browser assertion was reconciled to the actual closed-dialog semantics without weakening product guards.

### Final executed Runtime evidence

**QA #355 / run `34769821351` → SUCCESS**.  
Artifact: `xizong-a1-browser-runtime`, digest `sha256:ecf94930ba888e8cafca1fc8f7b8ab89f6feb8a24aa768dc38dcdcacbd2d3e00`.

Executed Chrome journey passed **39 checks**, including:

- clean Block start with no manufactured completion;
- Block → Logic Group → continuous original-Lecture stage;
- no implicit learning evidence merely from entering a group;
- early KP Recall and early `Reveal Core` rejection;
- current-group-only formal learning contact (`4/19` for first B2 group);
- first Recall persistence and mid-group refresh/resume;
- all-KP requirement before Logic Group closure;
- B2 **19/19 learned + 19/19 recalled** before Block Recall;
- Block-complete lock before Block Recall and before original-Lecture confirmation;
- Block completion persistence across refresh;
- Home Continue returning to `/xizong/circulation/b02/`;
- early System Recall dialog remains closed and writes no evidence;
- all-12-Blocks engineering fixture releases System Recall;
- System Recall reveal/completion persists;
- A1 official sweep resolves **376 questions**;
- explicit whole-paper holdout required before sweep;
- saved holdout unlocks question workspace;
- malformed Block state falls back to clean orientation and manufactures no progress.

Evidence class: `EXECUTED_HEADLESS_CHROME_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U`.

Fresh R verdict: **PASS**.

---

## Active E fresh-audit contract

Fresh E must prove evidence semantics, not merely that Runtime can click through.

Required invariants:

1. every real KP Recall attempt can be preserved as evidence, including repeated attempts / repeated same rating;
2. the latest convenience state may update, but it must not erase the historical attempt record when that history is required;
3. repair evidence is **repair-only**, never mastery;
4. stable-correct question work must not manufacture repair debt;
5. only Wrong / Uncertain question evidence enters repair routing;
6. precise Question→Block/KP repair uses reviewed relations only; absent reviewed relation must remain unresolved rather than guessed;
7. full-paper holdout remains excluded from ordinary System sweep evidence;
8. stale Block/System content versions invalidate or quarantine incompatible evidence rather than silently reusing it;
9. System→Block repair inbox is write-before-clear, idempotent, and works for already-open Block tabs;
10. repair return must not rewrite original Recall/question evidence;
11. malformed evidence/state must fail closed without creating mastery/progress.

Use existing shared A2/A3 evidence architecture as prior evidence only; fresh A1 must inspect/execute the relevant current owners before E closes.

---

## Frozen while E is active

- no medical Content rewrite without an evidence-discovered semantic contradiction;
- no UI polish expansion;
- no Question→KP inference;
- no U execution or U claim;
- no synthetic learner progress;
- no sibling-System edits except strictly necessary shared evidence-contract regression repair.

---

## Truth references

### Artifact Truth

- System owner → `content/xizong/knowledge/systems/a1-circulation/system.json`
- medical Core → `content/xizong/knowledge/systems/a1-circulation/blocks/`
- lane Learning constitution → `content/xizong/LEARNING_CONTRACT.md`
- shared policy → `content/xizong/knowledge/learner/study-policy.json`
- A1 Learning support → `content/xizong/knowledge/learner/a1-circulation-learning.json`
- Projection/Runtime/Evidence → Xizong surfaces under `static-web/`

### Acceptance Truth

`content/xizong/knowledge/systems/a1-circulation/ACCEPTANCE.md`

### Learner Truth

Private learner/browser/conversation evidence only.

---

## Fresh-Chat target

```text
A1 CURRENT
→ exact Evidence owners + existing evidence validators
→ adversarial / executed A1 evidence audit
→ PASS: stop engineering before U
→ FAIL: repair smallest responsible Evidence owner
```
