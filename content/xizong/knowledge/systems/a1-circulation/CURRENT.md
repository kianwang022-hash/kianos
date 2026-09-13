# Xizong A1 Circulation Current

Role: independently continued Xizong System Work Cursor + restart entry  
Parent: `content/xizong/CURRENT.md`

This file does not own medical Core, lane learning semantics, Acceptance Truth, or Kian's learner progress.

---

## Work Cursor

**Scope:** A1 — Circulation  
**Active engineering stage:** **CLOSED through Evidence**  
**Blocker:** none  
**Next action:** none in engineering. Wait for real learner use; U remains external and untested.

Current state:

```text
S        PASS
K        PASS
L        PASS
Content  CLOSED
P        PASS
R        PASS
E        PASS
U        UNTESTED / real learner only
```

> Engineering evidence must not manufacture learner progress. U is explicitly owned by real learner use.

---

## Final Runtime / Evidence closure

Fresh current-contract execution closed the remaining A1 engineering work on PR #100.

Accepted execution receipt:

- branch head: `97ec341f3fe510fd0cb4b5e2aeffa94a292fa6ff`;
- `Static Web Xizong QA #365` / run `34775611247` → **SUCCESS**;
- A1 learner / Projection / persistence-evidence contracts → PASS;
- Astro build → PASS;
- A1 headless browser Runtime journey → **PASS**;
- A1 Runtime evidence artifact upload → PASS;
- A1 Evidence validation → **PASS**;
- A1 headless browser Evidence journey → **PASS**;
- A1 Evidence artifact upload → PASS;
- evidence build / final static build → PASS.

The fresh Runtime failure immediately before closure was real, not a historical runner artifact. The browser journey proved every fine-grained learning transition was already correct but the final Block-completion check remained locked. The responsible defect was a hidden legacy `lectureRead` localStorage dependency still present in `XizongBlockV6.astro` after the duplicate Block-level Lecture confirmation had already been removed from the learner surface.

Final completion contract is now exactly:

```text
all Logic Group formal Lecture contacts
→ all owned KP Recall evidence
→ Block Recall
→ Block Complete
```

There is no separate Block-level `lectureRead` confirmation and no hidden `lectureRead` completion gate.

---

## What was actually fixed in the fresh R cycle

1. Logic Group closure fails closed until every owned KP in the group has Recall evidence.
2. Keyboard / stage transitions follow the current Logic Group Lecture handoff and return path.
3. Duplicate Block-level original-Lecture confirmation remains removed.
4. Learner validators explicitly enforce formal-contact + KP Recall + Block Recall semantics and reject reintroduction of legacy `lectureRead`.
5. Final `canComplete()` no longer depends on obsolete `circulationLectureRead:*` localStorage state.

Durable Runtime journey:

`static-web/scripts/test-xizong-a1-browser-journey.mjs`

Durable Evidence journey:

- `static-web/scripts/validate-xizong-a1-evidence.mjs`
- `static-web/scripts/test-xizong-a1-evidence-journey.mjs`

---

## Engineering closure rule — satisfied

The required closeout sequence has now executed on one fresh code revision:

```text
R browser Runtime journey PASS
→ Evidence validation PASS
→ E browser Evidence journey PASS
```

Therefore A1 engineering stops here:

```text
R PASS → E PASS → U UNTESTED
```

Do not reopen A1 for visual polish, simulated U, old-SHA red runs, or historical governance debt. Reopen only when fresh contradictory evidence identifies a concrete defect at the earliest responsible gate.

---

## U boundary

U is intentionally **UNTESTED** here.

A real learner session may later produce U evidence. CI, browser fixtures, validators, seeded localStorage, or engineering simulations cannot promote U to PASS and cannot be written as Kian's learner progress.

---

## Truth references

### Artifact Truth

- System owner → `content/xizong/knowledge/systems/a1-circulation/system.json`
- medical Core → `content/xizong/knowledge/systems/a1-circulation/blocks/`
- lane Learning constitution → `content/xizong/LEARNING_CONTRACT.md`
- shared policy → `content/xizong/knowledge/learner/study-policy.json`
- A1 Learning support → `content/xizong/knowledge/learner/a1-circulation-learning.json`
- Projection / Runtime / Evidence → Xizong surfaces under `static-web/`

### Acceptance Truth

`content/xizong/knowledge/systems/a1-circulation/ACCEPTANCE.md`

### Learner Truth

Private learner/browser/conversation evidence only.

---

## Fresh-chat target

```text
A1 ENGINEERING CLOSED
→ S/K/L/P/R/E accepted
→ U UNTESTED
→ no further A1 engineering action unless fresh contradictory evidence appears
```
