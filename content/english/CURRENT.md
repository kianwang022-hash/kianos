# English Current

Role: English lane Work Cursor + sub-lane router
Parent: root `CURRENT.md`

This file does not duplicate English content, acceptance evidence, or learner progress.

---

## Lane Work Cursor

**Active governance task:** migrate independently continued English scopes under the new Current / Three Truths ownership model.  
**Writing pilot:** structural routing complete; Writing no longer requires English `continuation.json` for normal continuation.  
**Next governance action:** migrate Translation as the second independently continued productive scope, then re-run Fresh Chat + Truth Separation checks.  
**Global English product work:** remains owned by each product/sub-lane Work Cursor; this governance migration does not authorize sibling semantic/runtime changes.

---

## Independently continued scopes

### Writing

Entry:

`content/english/modules/writing/CURRENT.md`

Writing owns its local Work Cursor and Acceptance reference.

Normal Writing re-entry:

```text
Writing CURRENT
→ exact required owner(s)
→ work
```

English `continuation.json` is not required for Writing.

### Translation

Not yet migrated. It is the next governance pilot scope.

### Objective / other English scopes

Not yet migrated under this governance branch.

---

## Transitional continuation boundary

`content/english/continuation.json` remains temporarily present only because non-migrated English scopes still need their current work position extracted before retirement.

Current repo-contained dependency audit checked:

- English Writing / Translation / Objective CI workflows;
- root and `static-web` package scripts;
- `static-web/src/lib/current.mjs`;
- English Writing validator/runtime entrypoints;
- repository `tools/` machine entrypoints.

**No current repo-contained machine/runtime/validator consumer of `content/english/continuation.json` was discovered in those audited entrypoints.**

This is a bounded finding, not proof that an external/manual consumer can never exist.

Therefore the continuation is **not retained because of a proven machine requirement**. During migration it acts only as a temporary extraction source for non-migrated Work Cursor / Acceptance facts.

Rules during transition:

- do not add new historical narrative;
- do not add new acceptance summaries that belong in scoped Acceptance owners;
- do not make it a required read for migrated scopes;
- do not delete it until Objective / Translation / other remaining responsibilities have been extracted and final dependency review is complete.

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
