# English Current

Role: English lane Work Cursor + independently continued scope router  
Parent: root `CURRENT.md`

This file does not duplicate English content, learning semantics, scoped acceptance evidence, or learner progress.

---

## Lane Work Cursor

**Active lane-level scope:** none — router-only baseline  
**Blocker:** none at lane-rule level  
**Next action:** route work to the narrowest independently continued English scope. Do not appoint one module as English's global active child merely because it was worked on most recently.

English currently has three independently continued learner-facing scopes with their own Work Cursor and Acceptance Truth:

| Scope | Work Cursor | Acceptance Truth |
| --- | --- | --- |
| Objective — Reading A / Cloze / Reading B | `content/english/modules/objective/CURRENT.md` | `content/english/modules/objective/ACCEPTANCE.md` |
| Translation | `content/english/modules/translation/CURRENT.md` | `content/english/modules/translation/ACCEPTANCE.md` |
| Writing | `content/english/modules/writing/CURRENT.md` | `content/english/modules/writing/ACCEPTANCE.md` |

Their current stages belong only to those local `CURRENT.md` owners. Do not copy them into this lane router.

Objective, Translation and Writing may progress concurrently when their current work is independent. A blocker in one module does not freeze the others unless a genuine shared English/runtime/integration dependency links them.

English has no lane-level `ACCEPTANCE.md` at present: current Acceptance Truth already belongs to the three independently continued scopes above. Do not add an aggregate Acceptance owner unless a future English-wide claim has its own distinct evidence responsibility.

Hard scheduling boundary:

```text
English capability hierarchy
= ownership / routing

Construction dependency
= what one module actually needs from another to proceed correctly

Kian learner order
= the sequence Kian should actually study/use
```

These are not automatically the same.

---

## Retired continuation boundary

`content/english/continuation.json` remains a retired tombstone with `status=RETIRED`, `authority=NONE`, `normal_read=false`.

It is not a Work Cursor, Acceptance owner, Artifact owner, learner-state store, or normal startup read. Do not add new progress/history to it.

---

## Stable English owners

- source / content owner map → `content/english/manifest.json`
- lane learning semantics → `content/english/LEARNING_CONTRACT.md`
- canonical source root → `content/english/source/`
- provenance → `content/english/provenance.json`
- module Artifact owners → `content/english/modules/`
- learner-facing runtime → English surfaces under `static-web/`

Repository-wide requirements, architecture, construction order, acceptance semantics and shared mature platform capability remain inherited from root owners rather than copied here.

Learner sequence defined by English cognition does not automatically serialize independent module construction.

---

## Truth boundary

For any English scope distinguish:

- **Artifact Truth** → actual source/content/module/runtime owners;
- **Acceptance Truth** → the narrowest scoped `ACCEPTANCE.md` / exact evidence owner;
- **Learner Truth** → private learner/runtime state, never inferred from shared repository work;
- **Work Cursor** → the relevant scoped `CURRENT.md`.

A module being implemented/accepted does not mean Kian has studied it.

---

## Fresh-Chat routing

Known independently continued scope:

```text
scope CURRENT
→ scoped ACCEPTANCE / exact required owner(s)
→ work
```

English lane known but sub-scope not yet named:

```text
English CURRENT
→ choose Objective / Translation / Writing
→ local CURRENT
→ exact required owner(s)
```

Multiple English module Chats may use these local paths concurrently. Each scope advances only its own earliest unresolved eligible stage/gate along its real dependency chain.

Read `content/english/LEARNING_CONTRACT.md` only when the task actually concerns English-wide cognition, capability ownership or learning/evidence relationships.

Do not read retired English continuation, unrelated modules, history, legacy repositories, or prior Chats by default.
