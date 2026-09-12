# English Translation Current

Role: independent Translation Work Cursor + restart entry
Parent: `content/english/CURRENT.md`

This file does not own Translation content, acceptance evidence, or learner progress.

---

## Work Cursor

**Scope:** English Translation  
**Active / earliest unresolved gate:** `S — Source acceptance`  
**Blocker:** formal Translation S acceptance has not yet been established from current scoped Source evidence; downstream K/L/P/R/E remain UNTESTED and are not parallel TODOs  
**Next action:** run a bounded **S-only** Translation source-boundary audit from current manifest/question-bank/source scanner evidence; update `ACCEPTANCE.md` only from executed/audited evidence. If S passes, update this Work Cursor so K becomes the next active gate before any L/P/R/E work.

---

## Stage discipline

```text
S  UNTESTED  ← ACTIVE
K  UNTESTED  ← downstream-frozen
L  UNTESTED  ← downstream-frozen
P  UNTESTED  ← downstream-frozen
R  UNTESTED  ← downstream-frozen
E  UNTESTED  ← downstream-frozen
U  UNTESTED  ← real learner use only; not yet eligible
```

`UNTESTED` does not mean all gates should be audited together.

The existing learning asset, runtime, projection and validators remain preserved Artifact/candidate evidence. They do not authorize leapfrogging S.

---

## Frozen / out of scope

During S acceptance:

- K/L/P/R/E remain downstream-frozen until their prerequisite gate becomes PASS;
- do not redesign Translation learning cognition;
- do not add new Translation features/taxonomy;
- do not rewrite Source facts merely to satisfy a validator;
- do not change Objective / Writing / other English sibling scopes;
- do not infer or mutate Kian's Learner Truth;
- do not convert validator existence into PASS claims.

If S execution exposes a concrete Knowledge/Learning/implementation defect, record the exact evidence but keep the active gate at the earliest responsible dependency rather than repairing several layers at once.

---

## Required reads

For ordinary re-entry into active S acceptance:

1. `content/english/modules/translation/ACCEPTANCE.md`
2. `content/english/manifest.json`
3. exact Translation source/scanner owner required to establish the Source boundary

Read `content/english/modules/translation/learning.md`, validator/runtime implementation, Projection or Evidence owners **only after S passes and the local Work Cursor advances**, or if S execution identifies a concrete defect requiring exact ownership tracing.

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

These downstream owners are references, not startup reads while S is active.

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
→ exact Source owner(s)
→ S only
```

When S becomes PASS, write the local durable transition first; the next fresh Chat should recover at K automatically.

Implementation internals are diagnostic/later-stage reads, not startup reads for S.

No English-wide continuation/history read is required unless a concrete machine dependency is later proven.
