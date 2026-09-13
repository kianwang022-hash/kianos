# Xizong A1 Circulation Current

Role: independently continued Xizong System Work Cursor + restart entry  
Parent: `content/xizong/CURRENT.md`

This file does not own medical Core, lane learning semantics, Acceptance Truth, or Kian's learner progress.

---

## Work Cursor

**Scope:** A1 — Circulation  
**Active engineering stage:** fresh **Runtime + Evidence execution** on the current shared contract  
**Blocker:** none known; current code must complete standard executed QA before closure  
**Next action:** execute the standard Xizong QA now that the legacy A1 learner validator has been aligned to Logic Group formal-contact semantics. Require both the real A1 browser Runtime journey and browser Evidence journey to pass; then close R/E and stop before U.

Current fresh progress:

```text
S        RE-ACCEPTED
K        RE-ACCEPTED after semantic repair
L        RE-ACCEPTED
Content  CLOSED
P        RE-ACCEPTED after Projection repair
R        REVALIDATION EXECUTING
E        EXECUTES IMMEDIATELY AFTER R IN SAME QA
U        real learner only / external workflow
```

> Engineering evidence must not manufacture learner progress. U is explicitly owned elsewhere.

---

## Why R was re-opened

A prior browser run closed R on an older Runtime:

- QA #355 / run `34769821351` → SUCCESS;
- `xizong-a1-browser-runtime` passed 39 executed checks.

Afterward the shared Runtime retired a redundant Block-level `原讲义一轮 · 已确认` checkbox. Logic Group original-Lecture contact already records formal contact for every owned KP, so the duplicate confirmation was not a distinct learning event.

Current completion chain is now:

```text
all Logic Group formal Lecture contacts
→ all KP Recall evidence
→ Block Recall
→ Block Complete
```

The Runtime still fails closed on missing formal contact, missing KP Recall, or missing Block Recall; it simply does not ask for the same Lecture contact twice.

Because this changed a completion prerequisite, the latest code requires a new executed R result rather than inheriting QA #355.

---

## R defects repaired during this fresh cycle

1. **Logic Group premature closure** — closure now checks for the first missing Recall inside the current group and refuses to close until every owned KP has Recall evidence.
2. **stale keyboard transition** — Enter now follows the current Logic Group Lecture handoff/return path rather than a retired per-KP learn button.
3. **duplicate Block-level Lecture confirmation** — removed after Logic Group contact became the canonical formal-learning evidence.
4. **stale learner validator expectation** — `validate-xizong-learning.mjs` now checks the current formal-contact + Recall + Block Recall completion contract and explicitly rejects reintroduction of the legacy `lectureRead` gate.

Durable Runtime journey:

`static-web/scripts/test-xizong-a1-browser-journey.mjs`

It must prove clean start, Logic Group handoff, early-stage guards, complete group Recall, refresh/resume, Block completion, Continue, System Recall gating, holdout gating and malformed-state containment on the current code.

---

## E execution boundary

The same standard QA now includes:

- `static-web/scripts/validate-xizong-a1-evidence.mjs`;
- `static-web/scripts/test-xizong-a1-evidence-journey.mjs`.

Fresh E must prove:

1. repeated real Recall attempts are append-preserved, including repeated identical ratings;
2. latest convenience state can change without erasing historical Recall evidence;
3. Memory / Chat repair evidence is repair-only and never rewrites original Recall/mastery;
4. stable-correct question evidence creates no repair debt;
5. only Wrong / Uncertain enters repair routing;
6. precise repair requires REVIEWED Question→Block/KP relation; unresolved relations remain unresolved;
7. private full-paper holdout is excluded from ordinary sweep evidence;
8. stale Block/System versions invalidate or quarantine incompatible evidence;
9. System→Block repair inbox is write-before-clear, idempotent and cross-tab safe;
10. repair return preserves original question/Recall evidence;
11. malformed evidence/state fails closed.

Existing A2/A3 evidence architecture is regression evidence, not a substitute for the A1 executed journey.

---

## Closure rule

If standard QA passes both A1 browser journeys on this exact contract:

```text
R → fresh PASS
E → fresh PASS
U → untouched / external real learner workflow
```

Then this engineering fresh re-acceptance stops. No visual-polish expansion, no U simulation, no further medical rewrite without contradictory evidence.

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
→ standard Xizong QA
→ both A1 browser journeys PASS
→ write final R/E Acceptance receipt
→ stop before U
```
