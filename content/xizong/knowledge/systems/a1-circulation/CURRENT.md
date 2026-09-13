# Xizong A1 Circulation Current

Role: independently continued Xizong System Work Cursor + restart entry  
Parent: `content/xizong/CURRENT.md`

This file does not own medical Core, lane learning semantics, Acceptance Truth, or Kian's learner progress.

---

## Work Cursor

**Scope:** A1 — Circulation  
**Active engineering stage:** fresh **Runtime Loop revalidation** after a shared Runtime contract change  
**Blocker:** latest Runtime must be re-executed before E can continue  
**Next action:** run the standard Xizong QA against the current Runtime after retiring the redundant Block-level Lecture confirmation. Require the real A1 browser journey to pass on the current code, then restore R fresh PASS and resume E. Stop before U.

Current fresh progress:

```text
S        RE-ACCEPTED
K        RE-ACCEPTED after semantic repair
L        RE-ACCEPTED
Content  CLOSED
P        RE-ACCEPTED after Projection repair
R        REVALIDATION ACTIVE after post-P Runtime simplification
E        PAUSED behind current-R execution
U        real learner only / external workflow
```

> Engineering evidence must not manufacture learner progress. U is explicitly owned elsewhere.

---

## Why R is temporarily re-opened

A prior real-browser journey closed R on the then-current Runtime:

- QA #355 / run `34769821351` → SUCCESS;
- `xizong-a1-browser-runtime` artifact passed 39 executed checks.

That evidence remains valid for the version it tested, but the shared Runtime has since changed in one material way:

> Logic Group Lecture contact already records formal contact for every owned KP, so the old extra Block-level `原讲义一轮 · 已确认` checkbox was redundant and has been retired.

Current Block completion remains fail-closed on the actual evidence chain:

```text
all Logic Group formal Lecture contacts
→ all KP Recall evidence
→ Block Recall
→ Block Complete
```

There is no longer a second manual Block-level Lecture confirmation for the same learning event.

Because this changes a completion prerequisite, the old QA #355 green result cannot by itself certify the new Runtime. Fresh R is therefore re-opened only for execution on the current code; S/K/L/Content/P are not reopened.

---

## R defects already repaired during this fresh cycle

1. **Logic Group premature closure**  
   Rating the final-position KP could previously close a Logic Group while an intermediate KP remained unrecalled. Runtime now finds the first missing Recall ID and refuses closure until every KP in the current Logic Group has Recall evidence.

2. **stale keyboard transition**  
   The old Enter shortcut still targeted the retired per-KP learning button. It now follows the current Logic Group Lecture handoff/return transition.

3. **duplicate Block-level Lecture confirmation**  
   Each Logic Group already requires explicit original-Lecture contact before Recall. Requiring a second Block-level Lecture confirmation duplicated the same evidence and added friction. The duplicate checkbox/guard was removed; completion still requires complete formal-contact + Recall + Block Recall evidence.

Durable executable journey:

`static-web/scripts/test-xizong-a1-browser-journey.mjs`

The current journey must verify at least:

- clean start and zero manufactured progress;
- Logic Group → external original Lecture → group Recall/closure;
- early Recall/Reveal/Block Recall failure;
- all-group formal contact and complete KP Recall before Block Recall;
- Block completion directly after valid Block Recall, with no duplicate Lecture checkbox;
- refresh/resume and Home Continue;
- System Recall gating before/after all 12 Blocks;
- holdout requirement before official sweep;
- malformed state fail-closed.

---

## E boundary after R revalidates

Fresh E then resumes immediately and must prove:

1. repeated real Recall attempts are preserved rather than overwritten;
2. repair evidence is repair-only, never mastery;
3. stable-correct question work creates no repair debt;
4. only Wrong / Uncertain enters repair routing;
5. precise Question→Block/KP repair uses reviewed relations only;
6. full-paper holdout stays excluded from ordinary System sweep evidence;
7. stale Block/System versions invalidate or quarantine incompatible evidence;
8. System→Block repair inbox is write-before-clear, idempotent and cross-tab safe;
9. repair return does not rewrite original Recall/question evidence;
10. malformed evidence/state fails closed.

Existing A1/A2/A3 evidence validators and prior runs are evidence inputs, not automatic fresh-E PASS.

---

## Frozen until current R execution passes

- no medical Content rewrite;
- no visual polish expansion;
- no Question→KP inference;
- no U execution or U claim;
- no synthetic learner progress;
- no sibling-System edits except a strictly necessary shared Runtime/Evidence regression fix.

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
→ current Runtime owners + browser journey
→ execute latest Runtime
→ R PASS: resume E
→ E PASS: stop before U
```
