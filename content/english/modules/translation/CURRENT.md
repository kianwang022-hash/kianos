# English Translation Current

Role: independent Translation Work Cursor + restart entry
Parent: `content/english/CURRENT.md`

This file does not own Translation content, acceptance evidence, or learner progress.

---

## Work Cursor

**Scope:** English Translation  
**Active / earliest unresolved gate:** `L — Learning acceptance`  
**Blocker:** none from Knowledge. S remains accepted as `PASS_WITH_DEBT` with three explicit `pending_review` reference gaps; K is `PASS`; L has not yet received a formal bounded audit. P/R/E remain downstream-frozen and are not parallel TODOs.  
**Next action:** run a bounded **L-only** audit of the approved Translation ability asset and parent English learning contract. If L passes, update `ACCEPTANCE.md` and this Work Cursor so P becomes active before any R/E work.

---

## Stage discipline

```text
S  PASS_WITH_DEBT  ← accepted; 3 explicit pending_review reference gaps
K  PASS            ← accepted semantic ability asset
L  UNTESTED        ← ACTIVE
P  UNTESTED        ← downstream-frozen
R  UNTESTED        ← downstream-frozen
E  UNTESTED        ← downstream-frozen
U  UNTESTED        ← real learner use only; not yet eligible
```

`UNTESTED` does not mean all gates should be audited together.

The existing Projection, Runtime and Evidence implementation remains preserved Artifact/candidate evidence. It does not authorize leapfrogging L.

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

Accepted K boundary:

- capability-native Global Map + four Core Learning Blocks;
- stable high-value Representation / Preservation / Reconstruction / Exam Execution mechanisms are actually taught;
- LexicalOS remains canonical lexical owner;
- teacher material is a Repair Reservoir, not the curriculum;
- protected unseen material and private learner evidence remain separate from shared canonical content;
- active checks / integrated generation exist;
- long-tail ambiguity and personalized drills remain Chat territory.

The Frozen Runtime appendix inside the same file was not accepted by K and remains downstream Runtime/Evidence candidate semantics.

---

## Frozen / out of scope

During L acceptance:

- P/R/E remain downstream-frozen until their prerequisite gate becomes PASS or legitimate PASS_WITH_DEBT;
- do not redesign Projection/UI or Runtime to make the learning path look correct;
- do not add Translation Knowledge content unless L uncovers a real upstream K defect;
- do not reopen Source merely because its explicit reference debt remains;
- do not change Objective / Writing / other English sibling scopes;
- do not infer or mutate Kian's Learner Truth;
- do not convert existing runtime-validator success into L acceptance.

If L execution exposes a real Knowledge defect, reopen K at the exact dependency. If it exposes a later Projection issue, record it without advancing into P before L closes.

---

## Required reads

For ordinary re-entry into active L acceptance:

1. `content/english/modules/translation/ACCEPTANCE.md`
2. `content/english/modules/translation/learning.md` — first-learning / Skill Map / material-routing / HOW YOU LEARN IT / exit semantics only as needed for L
3. `content/english/LEARNING_CONTRACT.md` — Translation path, shared learning philosophy, progressive disclosure, evidence/mastery, complete-but-skippable boundary

Do not default-read Translation Projection, Runtime, Evidence implementation, English continuation/history, legacy repo, or sibling scopes while L is active.

The Frozen Runtime appendix may be read only if the L audit identifies a concrete learning-path dependency that requires tracing; it is not automatic L evidence.

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

Only the approved learning owner and minimal parent contract are startup reads while L is active.

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
→ approved Translation learning owner
→ minimal English learning-contract boundary
→ L only
```

When L becomes PASS or legitimate PASS_WITH_DEBT, write the local durable transition first; the next fresh Chat should recover at P automatically.

Projection/Runtime/Evidence internals are diagnostic/later-stage reads, not startup reads for L.

No English-wide continuation/history read is required unless a concrete machine dependency is later proven.
