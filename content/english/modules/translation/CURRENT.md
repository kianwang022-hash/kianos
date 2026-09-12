# English Translation Current

Role: independent Translation Work Cursor + restart entry
Parent: `content/english/CURRENT.md`

This file does not own Translation content, acceptance evidence, or learner progress.

---

## Work Cursor

**Scope:** English Translation  
**Active / earliest unresolved gate:** `P — Projection acceptance`  
**Blocker:** none from Learning. S remains accepted as `PASS_WITH_DEBT` with three explicit `pending_review` reference gaps; K and L are `PASS`; P has not yet received a formal bounded audit. R/E remain downstream-frozen and are not parallel TODOs.  
**Next action:** run a bounded **P-only** audit of the learner-facing Translation first-learning/task projection against accepted K/L semantics. If P passes, update `ACCEPTANCE.md` and this Work Cursor so R becomes active before any E work.

---

## Stage discipline

```text
S  PASS_WITH_DEBT  ← accepted; 3 explicit pending_review reference gaps
K  PASS            ← accepted semantic ability asset
L  PASS            ← accepted learning path
P  UNTESTED        ← ACTIVE
R  UNTESTED        ← downstream-frozen
E  UNTESTED        ← downstream-frozen
U  UNTESTED        ← real learner use only; not yet eligible
```

`UNTESTED` does not mean all gates should be audited together.

Existing Runtime/Evidence implementation remains preserved Artifact/candidate evidence. It does not authorize leapfrogging P.

---

## Accepted upstream boundary

### S — Source

- Translation source section: `translation`
- sets: `27`
- stable prompts: `135`
- complete-reference sets: `25`
- partial-reference sets: `2`
- explicit `pending_review` debts: `3`
- Source failures: `0`
- canonical question-owner SHA-256: `c82b8daa93962cc39a9a4f09a0ba16057914edb6f96a2888c3be455928784986`

The missing references remain fail-closed and may not be fabricated. This is accepted bounded Source debt, not learner debt.

### K — Knowledge

K is `PASS` from a bounded semantic audit of:

- `content/english/modules/translation/learning.md` blob `69719c5d81fb577386bd4bc901b4d1c5aad0ce67`
- `content/english/LEARNING_CONTRACT.md` blob `7ad75e87fcec18fd2dec29b4f5de5155b09aa9ec`

Accepted K boundary: capability-native Global Map + Representation / Preservation / Reconstruction / Exam Execution, substantive mechanisms and active checks, LexicalOS routing, teacher material as Repair Reservoir, protected unseen material and private learner evidence kept outside shared canonical semantics.

### L — Learning

L is `PASS` from a bounded audit of the approved learning owner and parent English learning philosophy.

Accepted L boundary:

```text
Global Map
→ four continuous Core Learning Blocks
→ integrated use
→ normal Translation task
```

with these constraints:

- Skill Map/deep leaves are later repair/navigation, not compulsory first learning;
- complete-but-skippable navigation does not create mastery/evidence;
- synthetic/exposed material may teach mechanisms while protected unseen material remains diagnostic capital;
- clean first output precedes diagnosis/reference use;
- repair starts from the earliest meaningful failure;
- smallest sufficient repair must be followed by learner reconstruction;
- same-item correction is weaker than later fresh transfer;
- long-tail ambiguity and personalized micro-drills remain Chat territory.

No justified L debt was found.

---

## Frozen / out of scope

During P acceptance:

- R/E remain downstream-frozen until P passes;
- do not redesign Knowledge or Learning semantics merely to fit the current page;
- do not add Runtime/Evidence behavior to compensate for a Projection defect;
- do not reopen Source merely because its explicit reference debt remains;
- do not change Objective / Writing / other English sibling scopes;
- do not infer or mutate Kian's Learner Truth;
- do not convert existing runtime-validator success into P acceptance.

If P execution exposes a real upstream K/L defect, reopen the earliest responsible gate. If it exposes a Runtime defect, record it without advancing into R before P closes.

---

## Required reads

For ordinary re-entry into active P acceptance:

1. `content/english/modules/translation/ACCEPTANCE.md`
2. accepted projection-relevant semantics from `content/english/modules/translation/learning.md` and `content/english/LEARNING_CONTRACT.md`
3. `static-web/src/components/TranslationWorkspace.astro`
4. `static-web/src/pages/translation.astro`
5. `static-web/src/pages/translation/[id].astro`
6. `static-web/src/pages/translation-learn.astro`
7. exact Translation-specific styles/components required to judge density, disclosure and navigation
8. `static-web/src/lib/englishTranslation.mjs` only if the rendered Source/reference boundary requires tracing

Do not default-read `translationRuntimeModel.mjs`, Evidence/Persistence guards, Runtime validators, English continuation/history, legacy repo, or sibling scopes while P is active.

Read a downstream Runtime owner only if P execution exposes a concrete behavior whose projection/runtime ownership cannot otherwise be determined.

---

## Truth references

### Artifact Truth

- canonical learning owner → `content/english/modules/translation/learning.md`
- source routing → `content/english/manifest.json` + `content/english/source/question_bank.v1.json`
- source scanner → `static-web/src/lib/englishTranslation.mjs`
- learner workspace → `static-web/src/components/TranslationWorkspace.astro`
- Translation learner pages → `static-web/src/pages/translation*`
- runtime model → `static-web/src/lib/translationRuntimeModel.mjs`
- evidence/persistence guards → Translation components under `static-web/src/components/`
- validators → `static-web/scripts/validate-translation-source.mjs`, `validate-translation-runtime.mjs`, `validate-translation-evidence-guard.mjs`

Only the accepted learning boundary plus exact learner-facing projection owners are startup reads while P is active.

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
→ accepted K/L projection boundary
→ exact Translation learner-facing page/component owners
→ P only
```

When P becomes PASS or legitimate PASS_WITH_DEBT, write the local durable transition first; the next fresh Chat should recover at R automatically.

Runtime/Evidence internals are diagnostic/later-stage reads, not startup reads for P.

No English-wide continuation/history read is required unless a concrete machine dependency is later proven.
