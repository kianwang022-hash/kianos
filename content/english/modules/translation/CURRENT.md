# English Translation Current

Role: independent Translation Work Cursor + restart entry
Parent: `content/english/CURRENT.md`

This file does not own Translation content, acceptance evidence, or learner progress.

---

## Work Cursor

**Scope:** English Translation  
**Active / earliest unresolved stage:** scoped Acceptance establishment — S/K/L/P/R/E formalization  
**Blocker:** formal S/K/L/P/R/E acceptance has not yet been re-established from current Artifact evidence; implementation exists but must not be mistaken for PASS  
**Next action:** run a bounded Translation acceptance audit from current Source + canonical learning owner + existing `qa:translation`; update `ACCEPTANCE.md` only from evidence.

---

## Frozen / out of scope

Until the acceptance audit finds a concrete defect:

- do not redesign Translation learning cognition;
- do not add new Translation features/taxonomy;
- do not rewrite Source facts;
- do not change Objective / Writing / other English sibling scopes;
- do not infer or mutate Kian's Learner Truth;
- do not convert validator existence into PASS claims.

If acceptance discovers a real upstream defect, reopen only the earliest responsible stage under root `LEARNING_ASSET_STANDARD.md`.

---

## Required reads

For ordinary re-entry into the active acceptance audit:

1. `content/english/modules/translation/ACCEPTANCE.md`
2. `content/english/modules/translation/learning.md`
3. `static-web/package.json` — only to resolve the existing `qa:translation` / `validate:translation` execution entry

Do **not** read validator/runtime implementation code up front. Read the exact failing validator/owner only if execution or the S/K/L audit exposes a concrete issue.

English `continuation.json` is not required for normal Translation continuation.

---

## Truth references

### Artifact Truth

- canonical learning owner → `content/english/modules/translation/learning.md`
- source routing → `content/english/manifest.json` + `content/english/source/question_bank.v1.json`
- source scanner → `static-web/src/lib/englishTranslation.mjs`
- runtime model → `static-web/src/lib/translationRuntimeModel.mjs`
- learner workspace → `static-web/src/components/TranslationWorkspace.astro`
- evidence/persistence guards → Translation components under `static-web/src/components/`
- Translation learner pages → `static-web/src/pages/translation*`
- validators → `static-web/scripts/validate-translation-runtime.mjs`, `validate-translation-evidence-guard.mjs`

### Acceptance Truth

`content/english/modules/translation/ACCEPTANCE.md`

### Learner Truth

Private learner/runtime state only. Repository Artifact or Acceptance state must not be interpreted as Kian's Translation progress.

---

## Fresh-Chat target

Known scope `English Translation` should normally recover as:

```text
Translation CURRENT
→ Translation ACCEPTANCE
→ canonical learning owner / existing QA entry
→ work
```

Implementation internals are diagnostic reads, not startup reads.

No English-wide continuation/history read is required unless a concrete machine dependency is later proven.