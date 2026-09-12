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

---

## Lane rule layer

Stable English learning semantics are owned by:

`content/english/LEARNING_CONTRACT.md`

It defines the four major capability lines, task-specific cognitive objects, Clean Attempt / first-meaningful-failure / smallest-repair / later-fresh-validation philosophy, evidence boundaries, lexical routing and UI non-isomorphism rule.

English does **not** currently have a lane-level `ACCEPTANCE.md` by design.

Acceptance Truth is owned at the narrowest independently continued learner scope above. Creating a lane aggregate would duplicate scoped truth without adding a distinct acceptance claim. Add a lane-level Acceptance owner only if a future English-wide integration/readiness claim genuinely needs durable evidence that cannot be owned by Objective / Translation / Writing separately.

---

## Sub-lane qualification

A future English scope becomes first-class only when it has both:

- a genuinely distinct cognitive / learner decision object; and
- enough independent entry/continuation that a local Work Cursor materially reduces reads or ambiguity.

A separate exam section heading or directory is not sufficient by itself.

Do not create `CURRENT / ACCEPTANCE / CONTRACT` sets merely for symmetry.

---

## Retired continuation boundary

`content/english/continuation.json` is a retired tombstone only:

```text
status = RETIRED
authority = NONE
normal_read = false
```

It is not a Work Cursor, Acceptance owner, Artifact owner, learner-state store, or normal startup read. Git history preserves retired narrative if an explicitly bounded historical recovery is ever authorized.

Do not add new progress/history to it.

---

## Stable English Artifact owners

- source / content owner map → `content/english/manifest.json`
- lane learning rules → `content/english/LEARNING_CONTRACT.md`
- canonical source root → `content/english/source/`
- provenance → `content/english/provenance.json`
- module Artifact owners → `content/english/modules/`
- learner-facing runtime → English surfaces under `static-web/`

Repository-wide inherited owners:

- project requirements → root `PROJECT_DEFINITION.md`
- architecture → root `ARCHITECTURE.md`
- learning-asset construction → root `LEARNING_ASSET_STANDARD.md`
- S/K/L/P/R/E/U acceptance standard → root `LEARNING_ACCEPTANCE.md`
- shared mature learner-surface capabilities → root `SYSTEM_CONTRACT.md`

These are referenced, not copied into English sub-lane owners.

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

Read the lane `LEARNING_CONTRACT.md` only when the task concerns English-wide cognition, capability ownership, learning/evidence relationships or sub-lane boundaries.

Do not read retired English continuation, unrelated modules, history, legacy repositories, or prior Chats by default.
