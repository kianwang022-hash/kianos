# English Translation Acceptance

Status: CURRENT
Scope: English Translation learner-facing module
Standard: root `LEARNING_ACCEPTANCE.md`

This file owns current **Acceptance Truth** for Translation.

It does not own Translation learning content, runtime code, Work Cursor, or private learner state.

---

## Gate status

| Gate | Status | Current evidence / boundary |
| --- | --- | --- |
| S — Source | PASS_WITH_DEBT | Current Source boundary is machine-validated against `content/english/manifest.json`, canonical `content/english/source/question_bank.v1.json`, and `static-web/src/lib/englishTranslation.mjs`. Validation decision: `PASS_WITH_DEBT`; Translation resolves from one current-evidence section, 27 sets and 135 stable prompts; question-owner SHA-256 is `c82b8daa93962cc39a9a4f09a0ba16057914edb6f96a2888c3be455928784986`; 25 sets have complete reference coverage, 2 are partial, with exactly 3 explicit `pending_review` reference debts and `failures=[]`. Missing references remain unavailable to the learner/runtime and may not be fabricated. |
| K — Knowledge | UNTESTED | Canonical learner-facing ability asset exists at `content/english/modules/translation/learning.md`, with Representation / Preservation / Reconstruction / Exam Execution structure. Existence/content richness is not itself K acceptance. **K is now the current active gate under local `CURRENT.md`.** |
| L — Learning | UNTESTED | The asset explicitly defines whole-map → four Core Learning Blocks → later Skill Map/repair, and whole-set Productive learning semantics. Formal L acceptance under root standard has not yet been established. **Downstream-frozen until K passes.** |
| P — Projection | UNTESTED | Current Translation learner pages/components exist and validators inspect pre-attempt evidence protection and navigation. Formal P acceptance remains to be audited. **Downstream-frozen until L passes.** |
| R — Runtime | UNTESTED | Runtime implementation and deterministic journey validator exist, including whole-attempt lock, clean PASS, whole-set diagnosis, smallest repair, reconstruction, persistence fail-closed behavior, and return import. Implementation is Artifact Truth until acceptance is executed/audited. **Downstream-frozen until P passes.** |
| E — Evidence | UNTESTED | Runtime model/validator encode private transfer targets, same-task non-closure, later fresh SUPPORT/CLOSE, irrelevant evidence protection, idempotency, and fail-closed target identity. Formal E acceptance remains to be established. **Downstream-frozen until R passes.** |
| U — User Validation | UNTESTED | No repository engineering evidence may substitute for real Kian use. U is not eligible until S–E support `Module ready for learner test`. |

`UNTESTED` above is evidence status, not a parallel work queue. Gate activation is controlled by `content/english/modules/translation/CURRENT.md`.

---

## Current readiness claim

Allowed statement:

> **Translation is Source-ready with bounded explicit reference debt. S is PASS_WITH_DEBT; K is the active gate; L/P/R/E remain downstream-frozen; U remains UNTESTED.**

Do not say `Module ready for learner test` until S–E meet the root acceptance standard.

---

## Accepted Source evidence

The bounded Source validator is `static-web/scripts/validate-translation-source.mjs`, executed in `.github/workflows/static-web-translation-qa.yml` against the current PR head before this acceptance transition.

Machine evidence:

- schema: `kianos.english.translation.source-gate-validation.v1`
- gate: `S`
- decision: `PASS_WITH_DEBT`
- section resolution: `translation` via `current-evidence`
- sets: `27`
- prompts: `135`
- complete reference sets: `25`
- partial reference sets: `2`
- explicit pending reference debts: `3`
- failures: `0`
- canonical question owner SHA-256: `c82b8daa93962cc39a9a4f09a0ba16057914edb6f96a2888c3be455928784986`

The three bounded debts are:

1. `english1-2022-translation-main-q48` — `pending_review`
2. `english1-2022-translation-main-q49` — `pending_review`
3. `english1-2025-translation-main-q46` — `pending_review`

These debts are non-blocking at S because they are explicit, stable, fail-closed source gaps. They do **not** authorize generated/fabricated reference translations and do not imply any downstream gate acceptance.

Source policy validated by the gate:

- Current manifest required;
- canonical question bank required;
- canonical Translation learning owner required;
- legacy fallback forbidden;
- stable prompt identity required;
- clean-attempt projection must exclude answer/reference fields;
- missing reference is acceptable only as explicit `pending_review` debt;
- fabricated reference is forbidden.

---

## Candidate evidence for staged acceptance

### Knowledge candidates — active now

- `content/english/modules/translation/learning.md`
- `content/english/LEARNING_CONTRACT.md`

K must determine whether the canonical Translation ability asset is correct, complete enough for first learning, structurally faithful to the real capability, and free of duplicate/borrowed semantic ownership. Existing richness or runtime implementation cannot substitute for that audit.

### Learning candidates — preserved, downstream-frozen

The canonical learning asset currently states, among other things:

- first learning begins with the global ability map;
- four Core Learning Blocks are learned continuously rather than as isolated skill cards;
- later Skill Map addresses failures;
- real-task repair follows the earliest meaningful failure;
- independent generation and later fresh transfer are stronger evidence than same-item polishing.

These are candidate semantics to audit **after K passes**, not automatic L acceptance.

### Projection / Runtime / Evidence candidates — preserved, downstream-frozen

- `static-web/src/lib/englishTranslation.mjs`
- `static-web/src/lib/translationRuntimeModel.mjs`
- `static-web/src/components/TranslationWorkspace.astro`
- `static-web/src/components/TranslationEvidenceGuard.astro`
- `static-web/src/components/TranslationPersistenceGuard.astro`
- `static-web/src/pages/translation.astro`
- `static-web/src/pages/translation/[id].astro`
- `static-web/src/pages/translation-learn.astro`
- `static-web/scripts/validate-translation-runtime.mjs`
- `static-web/scripts/validate-translation-evidence-guard.mjs`
- `.github/workflows/static-web-translation-qa.yml`

These remain candidate downstream evidence and must not be used to leapfrog K/L/P/R/E ordering.

---

## Acceptance next action

Run a bounded **K-only** Translation knowledge audit:

1. read the canonical owner `content/english/modules/translation/learning.md` and only the parent English learning contract needed to judge ownership/boundary;
2. test whether the Translation ability hierarchy teaches the stable high-value concepts, relations, boundaries, and execution rules needed for first learning;
3. check that Translation does not duplicate semantics owned elsewhere and routes cross-ability dependencies appropriately;
4. classify concrete Knowledge defects as blockers or bounded non-blocking debt;
5. write K PASS / PASS_WITH_DEBT / BLOCKED only from that evidence;
6. if K passes, update local `CURRENT.md` so L becomes the next active gate;
7. do not audit L/P/R/E in the same step merely because their artifacts already exist;
8. keep U `UNTESTED` until real learner use.

If a concrete upstream Source defect appears, reopen S at the exact dependency rather than compensating downstream.

---

## Truth boundaries

### Artifact Truth
Actual Translation source/content/runtime owners listed above.

### Acceptance Truth
This file records S as `PASS_WITH_DEBT` from executed Source evidence and leaves K/L/P/R/E/U unaccepted unless explicitly stated otherwise.

### Learner Truth
Private learner/runtime state only. This file does not claim Kian has started Translation, attempted a task, repaired an error, or closed a transfer target.
