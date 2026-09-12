# English Current

Role: English lane Work Cursor + independently continued scope router
Parent: root `CURRENT.md`

This file does not duplicate English content, acceptance evidence, or learner progress.

---

## Lane Work Cursor

**Governance migration state:** Objective / Translation / Writing now have independent Work Cursor + scoped Acceptance owners.  
**Continuation state:** retired from normal authority; no discovered repo-contained machine/runtime/validator dependency remains.  
**Next governance action:** run/inspect Fresh Chat + Truth Separation behavior for the three migrated scopes, then move the governance pilot to another lane.  
**Product semantics:** unchanged by this routing migration.

---

## Independently continued scopes

### Objective — Reading A / Cloze / Reading B

Entry:

`content/english/modules/objective/CURRENT.md`

Current work: acceptance seal only; S/K/L frozen unless new evidence proves a defect.

### Translation

Entry:

`content/english/modules/translation/CURRENT.md`

Current work: re-establish formal S/K/L/P/R/E Acceptance Truth from current Artifact evidence; do not convert validator existence into PASS.

### Writing

Entry:

`content/english/modules/writing/CURRENT.md`

Current work: Evidence / later-fresh-transfer semantics on top of accepted S/K/L/P/R scope; U remains separate.

---

## Retired continuation boundary

`content/english/continuation.json` is **not a Current owner and not a normal read**.

Governance audit found no repo-contained consumer in the checked machine/runtime entrypoints:

- English Objective / Translation / Writing CI workflows;
- root and `static-web` package scripts;
- `static-web/src/lib/current.mjs`;
- inspected English validators/runtime entrypoints;
- repository `tools/` entrypoints.

The old continuation's active Objective / Translation / Writing responsibilities have now been extracted into local `CURRENT` / `ACCEPTANCE` owners.

The file remains only as a small retired compatibility/tombstone path on this draft branch so any stale manual link fails visibly into the new routing rather than silently reviving the old 20KB narrative.

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
- **Acceptance Truth** → scoped `ACCEPTANCE.md` / exact evidence owner;
- **Learner Truth** → private learner/runtime state, never inferred from shared repository work;
- **Work Cursor** → scoped `CURRENT.md`.

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

Do not read retired English continuation, unrelated modules, history, legacy repositories, or prior Chats by default.
