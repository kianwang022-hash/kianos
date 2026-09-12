# Xizong Current

Role: Xizong lane Work Cursor + independently continued System router  
Parent: root `CURRENT.md`

This file does not own medical Core, lane learning semantics, scoped Acceptance Truth, or Kian's learner progress.

---

## Lane Work Cursor

**Active lane-level scope:** none — router-only baseline  
**Blocker:** none at lane-routing level  
**Next action:** route work directly to the requested independently continued System `CURRENT.md`. Do not appoint one System as Xizong's global active child merely because it was worked on most recently.

Current independently continued Systems:

| Scope | Work Cursor | Acceptance Truth |
| --- | --- | --- |
| A1 Circulation | `content/xizong/knowledge/systems/a1-circulation/CURRENT.md` | `content/xizong/knowledge/systems/a1-circulation/ACCEPTANCE.md` |
| A2 Respiratory | `content/xizong/knowledge/systems/a2-respiratory/CURRENT.md` | `content/xizong/knowledge/systems/a2-respiratory/ACCEPTANCE.md` |

A1/A2 current stages and gate claims belong only to those local owners. Do not copy their detailed state back into this lane router.

A1 and A2 may be worked on concurrently when their current tasks are independent. If a future shared Xizong owner/runtime creates a real dependency, name that dependency explicitly and coordinate only the affected scopes.

Hard scheduling boundary:

```text
System hierarchy
= ownership / learning-domain structure

System construction dependency
= whether one System's current artifact/decision is required by another

Kian learner order
= the sequence Kian should actually study
```

These are not automatically the same.

---

## Systems that are not first-class governance scopes yet

The medical hierarchy contains additional Systems, Blocks and KPs, but hierarchy alone does not justify a local `CURRENT / ACCEPTANCE` pair.

Create a future System sub-lane only when:

- workers routinely enter/continue it independently;
- it owns a distinct Work Cursor or acceptance boundary;
- local routing materially lowers normal read cost or ambiguity;
- the new owner replaces duplication rather than adding another summary.

Until then, those Systems remain canonical medical/learning objects under the lane without extra governance files.

Do not create System-level `LEARNING_CONTRACT.md` files merely for symmetry. Lane cognition remains owned by `content/xizong/LEARNING_CONTRACT.md`; System-specific learner order/closure remains in justified `*-learning.json` support.

Learner order in those owners does not automatically serialize engineering/construction work across Systems.

---

## Stable lane owners

### Artifact / learning owners

- knowledge owner map → `content/xizong/knowledge/manifest.json`
- canonical medical Core → `content/xizong/knowledge/systems/**`
- lane learning constitution → `content/xizong/LEARNING_CONTRACT.md`
- detailed shared learning policy → `content/xizong/knowledge/learner/study-policy.json`
- System-specific learning support → `content/xizong/knowledge/learner/`
- official questions / explanations / reviewed relations → dedicated Xizong roots
- learner runtime → Xizong surfaces under `static-web/`

### Lane Acceptance

`content/xizong/ACCEPTANCE.md` owns only genuine Xizong-wide integration/readiness claims. A1/A2 readiness belongs to their local Acceptance owners.

A lane-wide integration claim may depend on multiple Systems, but that does not turn the parent lane into a serial scheduler for child construction.

### Learner Truth

Private learner/browser/conversation evidence only. System readiness or lane Work state cannot manufacture Kian's study progress or next learner action.

---

## Fresh-Chat routing

Known A1:

```text
A1 CURRENT
→ A1 ACCEPTANCE
→ exact owner only if needed
→ work
```

Known A2:

```text
A2 CURRENT
→ A2 ACCEPTANCE
→ A2 System / exact Block
→ work
```

Xizong lane known but exact System not yet resolved:

```text
Xizong CURRENT
→ choose requested independently continued System when applicable
→ local CURRENT
→ exact required owner(s)
```

Multiple System Chats may use these local paths concurrently. Each System advances only its own earliest unresolved eligible stage/gate along its real dependency chain.

Read the lane Learning Contract only when the task actually concerns Xizong cognition, learner order, phase linkage or System/Block/KP learning boundaries.

Do not read retired continuation/acceptance snapshots, unrelated Systems, history, legacy repositories or prior Chats by default.
