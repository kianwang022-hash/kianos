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
| S — Source | UNTESTED | Artifact candidates exist: `content/english/manifest.json`, `content/english/source/question_bank.v1.json`, and source scanner `static-web/src/lib/englishTranslation.mjs`. Current validator is designed to fail closed on unresolved source/reference gaps, but formal Translation S acceptance has not yet been established in this scoped owner. |
| K — Knowledge | UNTESTED | Canonical learner-facing ability asset exists at `content/english/modules/translation/learning.md`, with Representation / Preservation / Reconstruction / Exam Execution structure. Existence/content richness is not itself K acceptance. |
| L — Learning | UNTESTED | The asset explicitly defines whole-map → four Core Learning Blocks → later Skill Map/repair, and whole-set Productive learning semantics. Formal L acceptance under root standard has not yet been established in this owner. |
| P — Projection | UNTESTED | Current Translation learner pages/components exist and validators inspect pre-attempt evidence protection and navigation. Formal P acceptance remains to be audited. |
| R — Runtime | UNTESTED | Runtime implementation and deterministic journey validator exist, including whole-attempt lock, clean PASS, whole-set diagnosis, smallest repair, reconstruction, persistence fail-closed behavior, and return import. Implementation is Artifact Truth until acceptance is executed/audited. |
| E — Evidence | UNTESTED | Runtime model/validator encode private transfer targets, same-task non-closure, later fresh SUPPORT/CLOSE, irrelevant evidence protection, idempotency, and fail-closed target identity. Formal E acceptance remains to be established. |
| U — User Validation | UNTESTED | No repository engineering evidence may substitute for real Kian use. |

---

## Current readiness claim

Allowed statement:

> **Translation has substantial Current Artifact implementation and acceptance-oriented validators, but formal S/K/L/P/R/E acceptance has not yet been established from current scoped evidence; U is UNTESTED.**

Do not say `Module ready for learner test` until S–E meet the root acceptance standard.

---

## Candidate evidence for the acceptance audit

### Source / Artifact candidates

- `content/english/manifest.json`
- `content/english/source/question_bank.v1.json`
- `static-web/src/lib/englishTranslation.mjs`

`englishTranslation.mjs` resolves Translation from Current manifest/question-bank plus the canonical learning owner; it does not read English continuation state.

### Knowledge / Learning candidates

- `content/english/modules/translation/learning.md`
- `content/english/LEARNING_CONTRACT.md`

The canonical learning asset states:

- first learning begins with the global ability map;
- four Core Learning Blocks are learned continuously rather than as isolated skill cards;
- later Skill Map addresses failures;
- real-task repair follows the earliest meaningful failure;
- independent generation and later fresh transfer are stronger evidence than same-item polishing.

These are candidate semantics to audit, not automatic PASS claims.

### Projection / Runtime / Evidence candidates

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

The current validators are designed to check, among other things:

- complete whole-set attempt before decision;
- executable clean PASS with no manufactured transfer debt;
- whole-set diagnosis while evidence may stay segment-bound internally;
- smallest useful repair and learner reconstruction;
- only completed reusable repair may become `TRANSFER_PENDING`;
- source task cannot close its own transfer target;
- irrelevant later material cannot close a target;
- later fresh SUPPORT may close when semantics justify it;
- duplicate later-task import is idempotent;
- unknown/malformed transfer evidence fails closed;
- private persistence failure blocks formal attempt lock rather than silently losing evidence.

These checks must still be executed/audited before R/E are called PASS.

---

## Acceptance next action

Run a bounded Translation reacceptance against current Artifact owners without changing Translation semantics unless a concrete blocker is found:

1. audit S/K/L from current Source + canonical learning owner;
2. execute/review `npm run validate:translation` and current build in an available environment;
3. inspect any reported source/reference gaps and distinguish explicit bounded debt from blockers;
4. evaluate P/R/E under `LEARNING_ACCEPTANCE.md` rather than validator existence alone;
5. keep U `UNTESTED` until real learner use.

If a concrete upstream defect appears, reopen only the earliest responsible stage under `LEARNING_ASSET_STANDARD.md`.

---

## Truth boundaries

### Artifact Truth
Actual Translation source/content/runtime owners listed above.

### Learner Truth
Private learner/runtime state only. This file does not claim Kian has started Translation, attempted a task, repaired an error, or closed a transfer target.