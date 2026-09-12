# English Current

Role: English lane Work Cursor + independently continued scope router  
Parent: root `CURRENT.md`

This file does not duplicate English content, learning semantics, scoped acceptance evidence, or learner progress.

---

## Lane Work Cursor

**Active lane-level scope:** none — router-only baseline  
**Blocker:** none at lane-rule level  
**Next action:** route work to the narrowest independently continued English scope.

English currently has three independently continued learner-facing scopes with their own Work Cursor and Acceptance Truth:

| Scope | Work Cursor | Acceptance Truth |
| --- | --- | --- |
| Objective — Reading A / Cloze / Reading B | `content/english/modules/objective/CURRENT.md` | `content/english/modules/objective/ACCEPTANCE.md` |
| Translation | `content/english/modules/translation/CURRENT.md` | `content/english/modules/translation/ACCEPTANCE.md` |
| Writing | `content/english/modules/writing/CURRENT.md` | `content/english/modules/writing/ACCEPTANCE.md` |

Their current stages belong only to those local `CURRENT.md` owners. Do not copy them into this lane router.

English has no lane-level `ACCEPTANCE.md` at present: current Acceptance Truth already belongs to the three independently continued scopes above. Do not add an aggregate Acceptance owner unless a future English-wide claim has its own distinct evidence responsibility.

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

Read `content/english/LEARNING_CONTRACT.md` only when the task actually concerns English-wide cognition, capability ownership or learning/evidence relationships.

Do not read retired English continuation, unrelated modules, history, legacy repositories, or prior Chats by default.
