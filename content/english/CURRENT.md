# English Current

Role: English lane Work Cursor + sub-lane router
Parent: root `CURRENT.md`

This file does not duplicate English content, acceptance evidence, or learner progress.

---

## Lane Work Cursor

**Active governance task:** validate the new Current/Truth ownership model through the Writing pilot.  
**Next governance action:** run Fresh Chat + Truth Separation checks for Writing before migrating other English scopes.  
**Global English product work:** remains owned by each product/sub-lane Work Cursor; this governance pilot does not authorize sibling semantic/runtime changes.

---

## Independently continued scopes

### Writing

Entry:

`content/english/modules/writing/CURRENT.md`

Writing now owns its local Work Cursor and Acceptance reference. A fresh Chat continuing Writing should route there directly and does **not** need English `continuation.json` by default.

### Other English scopes

Objective / Translation / other English work has not yet been migrated under this governance pilot.

`content/english/continuation.json` remains a **transitional owner for non-migrated English work only** until each responsibility is audited.

Do not expand that continuation with new historical narrative during this pilot. Do not delete it until machine/process dependencies have been checked.

---

## Stable English owners

- source / owner map → `content/english/manifest.json`
- lane learning rules → `content/english/LEARNING_CONTRACT.md`
- canonical source root → `content/english/source/`
- provenance → `content/english/provenance.json`
- module Artifact owners → `content/english/modules/`
- learner-facing runtime → English surfaces under `static-web/`

Repository-wide inherited rules:

- project requirements → root `PROJECT_DEFINITION.md`
- architecture → root `ARCHITECTURE.md`
- learning-asset construction → root `LEARNING_ASSET_STANDARD.md`
- S/K/L/P/R/E/U acceptance → root `LEARNING_ACCEPTANCE.md`
- shared mature learner-surface capabilities → root `SYSTEM_CONTRACT.md`

These are referenced, not copied into English module owners.

---

## Truth boundary

For any English scope distinguish:

- **Artifact Truth** → actual source/content/module/runtime owners;
- **Acceptance Truth** → scope-specific acceptance owner when one exists;
- **Learner Truth** → private learner/runtime state, never inferred from shared repository work;
- **Work Cursor** → scope `CURRENT.md`.

A module being built/accepted does not mean Kian has studied it.

---

## Fresh-Chat routing

Known independently continued scope:

```text
scope CURRENT
→ exact required owner(s)
→ work
```

Known English lane but sub-scope unresolved:

```text
English CURRENT
→ resolve sub-scope
→ local CURRENT when present
→ otherwise transitional exact owner(s)
```

Do not scan unrelated English modules, history, legacy repositories, or prior Chats by default.
