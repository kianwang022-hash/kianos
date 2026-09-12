# English Translation Current

Role: independent Translation Work Cursor + restart entry
Parent: `content/english/CURRENT.md`

This file does not own Translation content, acceptance evidence, or learner progress.

---

## Work Cursor

**Scope:** English Translation  
**Active / earliest unresolved gate:** `K — Knowledge acceptance`  
**Blocker:** none from Source. S is accepted as `PASS_WITH_DEBT` with three explicit `pending_review` reference gaps; K has not yet received a formal bounded audit. L/P/R/E remain downstream-frozen and are not parallel TODOs.  
**Next action:** run a bounded **K-only** audit of the canonical Translation ability owner against the root K standard and the minimal English learning-contract boundary. If K passes, update `ACCEPTANCE.md` and this Work Cursor so L becomes active before any P/R/E work.

---

## Stage discipline

```text
S  PASS_WITH_DEBT  ← accepted; 3 explicit pending_review reference gaps
K  UNTESTED        ← ACTIVE
L  UNTESTED        ← downstream-frozen
P  UNTESTED        ← downstream-frozen
R  UNTESTED        ← downstream-frozen
E  UNTESTED        ← downstream-frozen
U  UNTESTED        ← real learner use only; not yet eligible
```

`UNTESTED` does not mean all gates should be audited together.

The existing learning asset, runtime, projection and validators remain preserved Artifact/candidate evidence. They do not authorize leapfrogging K.

---

## Accepted Source boundary

S evidence is owned in `content/english/modules/translation/ACCEPTANCE.md`.

Current bounded result:

- Translation source section: `translation`
- sets: `27`
- stable prompts: `135`
- complete-reference sets: `25`
- partial-reference sets: `2`
- explicit `pending_review` debts: `3`
- Source failures: `0`
- canonical question-owner SHA-256: `c82b8daa93962cc39a9a4f09a0ba16057914edb6f96a2888c3be455928784986`

The missing references remain fail-closed and may not be fabricated. This is accepted bounded Source debt, not learner debt and not a reason to keep S active.

---

## Frozen / out of scope

During K acceptance:

- L/P/R/E remain downstream-frozen until their prerequisite gate becomes PASS or legitimate PASS_WITH_DEBT;
- do not redesign Projection/UI or Runtime to make Knowledge look complete;
- do not add new Translation features/taxonomy without a demonstrated K blocker;
- do not reopen Source merely because reference debt exists; reopen S only if the accepted source boundary becomes factually inconsistent or unsafe;
- do not change Objective / Writing / other English sibling scopes;
- do not infer or mutate Kian's Learner Truth;
- do not convert runtime-validator success into K acceptance.

If K execution exposes a real Source defect, reopen the exact Source dependency. If it exposes a later Learning/Projection issue, record it without advancing into that gate before K closes.

---

## Required reads

For ordinary re-entry into active K acceptance:

1. `content/english/modules/translation/ACCEPTANCE.md`
2. `content/english/modules/translation/learning.md`
3. `content/english/LEARNING_CONTRACT.md` only to judge Translation ownership, cross-ability boundaries, and parent-level learning constraints needed by K

Do not default-read Translation Runtime, Projection, Evidence owners, English continuation/history, legacy repo, or sibling scopes while K is active.

Read exact source/scanner evidence again only if K uncovers a concrete Source inconsistency.

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
- validators → `static-web/scripts/validate-translation-source.mjs`, `validate-translation-runtime.mjs`, `validate-translation-evidence-guard.mjs`

Only the canonical learning owner and minimal parent contract are startup reads while K is active.

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
→ canonical Translation learning owner
→ minimal English contract boundary if needed
→ K only
```

When K becomes PASS or legitimate PASS_WITH_DEBT, write the local durable transition first; the next fresh Chat should recover at L automatically.

Runtime/Projection/Evidence internals are diagnostic/later-stage reads, not startup reads for K.

No English-wide continuation/history read is required unless a concrete machine dependency is later proven.
