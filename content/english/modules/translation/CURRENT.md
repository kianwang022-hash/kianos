# English Translation Current

Role: independent Translation Work Cursor + restart entry
Parent: `content/english/CURRENT.md`

This file does not own Translation content, acceptance evidence, or learner progress.

---

## Work Cursor

**Scope:** English Translation  
**Active / earliest unresolved gate:** `R — Runtime acceptance`  
**Blocker:** none from Projection. S remains accepted as `PASS_WITH_DEBT` with three explicit `pending_review` reference gaps; K, L and P are `PASS`; R has not yet received a formal bounded audit. E remains downstream-frozen and is not a parallel TODO.  
**Next action:** run a bounded **R-only** audit of the executable Translation journey against the accepted K/L/P semantics and Frozen Runtime contract. If R passes, update `ACCEPTANCE.md` and this Work Cursor so E becomes active before any User Validation claim.

---

## Stage discipline

```text
S  PASS_WITH_DEBT  ← accepted; 3 explicit pending_review reference gaps
K  PASS            ← accepted semantic ability asset
L  PASS            ← accepted learning path
P  PASS            ← accepted learner-facing projection
R  UNTESTED        ← ACTIVE
E  UNTESTED        ← downstream-frozen
U  UNTESTED        ← real learner use only; not yet eligible
```

`UNTESTED` does not mean all gates should be audited together.

Existing Evidence implementation remains preserved Artifact/candidate evidence. It does not authorize leapfrogging R.

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

K is `PASS` from a bounded semantic audit of the canonical Translation learning owner and minimal English contract boundary.

Accepted K boundary: capability-native Global Map + Representation / Preservation / Reconstruction / Exam Execution, substantive mechanisms and active checks, LexicalOS routing, teacher material as Repair Reservoir, protected unseen material and private learner evidence kept outside shared canonical semantics.

### L — Learning

L is `PASS` for the approved learner path:

```text
Global Map
→ four continuous Core Learning Blocks
→ integrated use
→ normal Translation task
```

with Skill Map/deep leaves reserved for later repair/navigation, clean first output before diagnosis/reference, earliest meaningful failure → smallest sufficient repair → learner reconstruction, and later fresh transfer stronger than same-item correction.

### P — Projection

P is `PASS` after a bounded audit found and repaired two learner-flow blockers:

1. concrete Transfer Pending labels / underlying demand could appear during Clean Attempt and cue fresh evidence;
2. `F｜HOW YOU LEARN IT` was folded while `G｜第一次学习出口` tested its concepts.

Accepted repaired boundary:

- pending-target detail remains hidden while Clean Attempt is visible;
- F is on the visible first-learning main path before G;
- C/D Skill Map + Deep Skills remain progressively disclosed;
- E Material Routing + H Runtime v1 remain folded system/reference content;
- task HTML starts with empty reference rows and canonical reference text is delayed until explicit post-attempt reveal/open behavior;
- whole task/set remains learner-facing while Segment-level first evidence is preserved internally.

Executed Projection gate evidence from PR-head run `34698611076`:

- decision: `PASS`
- checks: `161`
- sets / built task pages: `27 / 27`
- available canonical reference rows checked: `132`
- leaked reference rows in clean-attempt HTML: `0`
- issues: `0`

No justified P debt remains.

---

## Frozen / out of scope

During R acceptance:

- E remains downstream-frozen until R passes;
- do not redesign Knowledge/Learning/Projection merely to fit existing Runtime code;
- do not treat existing Runtime/Evidence candidate validator success as R acceptance without inspecting the intended executable journey;
- do not add Evidence closure rules merely to compensate for a Runtime defect;
- do not reopen Source merely because its explicit reference debt remains;
- do not change Objective / Writing / other English sibling scopes;
- do not infer or mutate Kian's Learner Truth.

If R exposes a real upstream P/L/K defect, reopen the earliest responsible gate. If it exposes an Evidence-specific issue, record it without advancing into E before R closes.

---

## Required reads

For ordinary re-entry into active R acceptance:

1. `content/english/modules/translation/ACCEPTANCE.md`
2. Frozen Runtime v1 appendix from `content/english/modules/translation/learning.md` only as the intended Runtime contract candidate
3. `static-web/src/lib/translationRuntimeModel.mjs`
4. `static-web/src/components/TranslationWorkspace.astro`
5. `static-web/src/components/TranslationPersistenceGuard.astro`
6. `static-web/src/components/TranslationReferenceLoader.astro` only where reveal/load behavior is a Runtime dependency
7. `static-web/scripts/validate-translation-runtime.mjs`
8. exact task-page wiring only where needed to trace executable state transitions

Do not default-read `TranslationEvidenceGuard.astro`, `validate-translation-evidence-guard.mjs`, English continuation/history, legacy repo, or sibling scopes while R is active.

Read an Evidence owner only if a concrete Runtime dependency cannot be judged without it; that read does not grant E acceptance.

---

## R acceptance target

The bounded Runtime audit must establish that the approved journey is actually executable:

```text
complete Clean Attempt
→ immutable whole-attempt freeze
→ PASS or Need Review
→ whole-set Chat diagnosis when needed
→ valid PASS or one primary failure + smallest repair
→ learner Reconstruction
→ repaired / TRANSFER_PENDING exit
```

Required checks include:

- partial task cannot masquerade as a completed whole-set attempt;
- stable clean work can PASS without manufactured review/repair debt;
- Chat handoff preserves immutable first output and does not add Reference unless the learner explicitly revealed it;
- malformed or wrong-task Chat return fails closed and cannot mutate another task;
- Reconstruction cannot finish with required affected segments missing;
- same-task repair completion does not by itself claim mastery;
- local persistence/re-entry preserves the required state;
- reset/history behavior does not silently overwrite required attempt evidence;
- missing Source references remain non-fabricated throughout Runtime use.

When these executable semantics pass, write R acceptance first and only then activate E.

---

## Truth references

### Artifact Truth

- canonical learning owner → `content/english/modules/translation/learning.md`
- source routing → `content/english/manifest.json` + `content/english/source/question_bank.v1.json`
- source scanner → `static-web/src/lib/englishTranslation.mjs`
- learner workspace → `static-web/src/components/TranslationWorkspace.astro`
- Translation learner pages → `static-web/src/pages/translation*`
- runtime model → `static-web/src/lib/translationRuntimeModel.mjs`
- persistence guard → `static-web/src/components/TranslationPersistenceGuard.astro`
- delayed reference loader → `static-web/src/components/TranslationReferenceLoader.astro`
- Runtime validator → `static-web/scripts/validate-translation-runtime.mjs`
- Evidence owners/validator remain downstream-frozen until E

Only the intended Runtime contract plus exact executable Runtime owners are startup reads while R is active.

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
→ Frozen Runtime v1 contract boundary
→ exact Translation Runtime owners
→ R only
```

When R becomes PASS or legitimate PASS_WITH_DEBT, write the local durable transition first; the next fresh Chat should recover at E automatically.

Evidence internals are later-stage reads, not startup reads for R.

No English-wide continuation/history read is required unless a concrete machine dependency is later proven.
