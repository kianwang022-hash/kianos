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
| K — Knowledge | PASS | Bounded semantic audit executed against canonical `content/english/modules/translation/learning.md` (blob `69719c5d81fb577386bd4bc901b4d1c5aad0ce67`) and the minimal Translation boundary in `content/english/LEARNING_CONTRACT.md` (blob `7ad75e87fcec18fd2dec29b4f5de5155b09aa9ec`). The asset defines a capability-native hierarchy rather than a teacher/question taxonomy; teaches the stable high-value mechanisms needed for first learning; keeps LexicalOS as canonical lexical owner; separates teacher material, synthetic/exposed/protected material, and private learner evidence; includes active checks and integrated generation; and explicitly leaves long-tail ambiguity/personalized drill to Chat. No K blocker or justified K debt was found. Runtime semantics appended after the learning asset are not accepted by this K decision and remain for later R/E audit. |
| L — Learning | UNTESTED | The asset explicitly proposes Global Map → four continuous Core Learning Blocks → normal Translation task, with Skill Map/leaf content used later for repair rather than as the first-learning checklist. These are now the active Learning candidates, not automatic L acceptance. **L is the current active gate under local `CURRENT.md`.** |
| P — Projection | UNTESTED | Current Translation learner pages/components exist and validators inspect pre-attempt evidence protection and navigation. Formal P acceptance remains to be audited. **Downstream-frozen until L passes.** |
| R — Runtime | UNTESTED | Runtime implementation and deterministic journey validator exist, including whole-attempt lock, clean PASS, whole-set diagnosis, smallest repair, reconstruction, persistence fail-closed behavior, and return import. Implementation is Artifact Truth until acceptance is executed/audited. **Downstream-frozen until P passes.** |
| E — Evidence | UNTESTED | Runtime model/validator encode private transfer targets, same-task non-closure, later fresh SUPPORT/CLOSE, irrelevant evidence protection, idempotency, and fail-closed target identity. Formal E acceptance remains to be established. **Downstream-frozen until R passes.** |
| U — User Validation | UNTESTED | No repository engineering evidence may substitute for real Kian use. U is not eligible until S–E support `Module ready for learner test`. |

`UNTESTED` above is evidence status, not a parallel work queue. Gate activation is controlled by `content/english/modules/translation/CURRENT.md`.

---

## Current readiness claim

Allowed statement:

> **Translation has accepted Source and Knowledge boundaries: S is PASS_WITH_DEBT with three explicit fail-closed reference gaps, K is PASS, L is now the active gate, P/R/E remain downstream-frozen, and U remains UNTESTED.**

Do not say `Module ready for learner test` until S–E meet the root acceptance standard.

---

## Accepted Source evidence

The bounded Source validator is `static-web/scripts/validate-translation-source.mjs`, executed in `.github/workflows/static-web-translation-qa.yml` before the S acceptance transition.

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

---

## Accepted Knowledge evidence

K was audited semantically rather than inferred from file size, UI, or Runtime validators.

### Canonical owner and capability hierarchy

`content/english/modules/translation/learning.md` is the canonical Translation ability asset. Its hierarchy is capability-native:

```text
Global Map
→ English Representation
→ Preservation & Fidelity
→ Chinese Reconstruction
→ Exam Execution
→ integrated use
→ later Skill Map / selective Skill Content
```

This is consistent with the English parent contract's Translation cognitive object and does not inherit a teacher chapter order or exam-material inventory as curriculum.

### Stable high-value concepts are actually taught

The asset gives executable mental models, boundaries, examples and active checks for the major recurring demands, including:

- main proposition / clause hierarchy;
- attachment;
- reference;
- scope, negation, modality and degree;
- logical relation;
- contextual lexical access;
- information-unit and relation fidelity;
- omission / addition / distortion control;
- information order and modifier unloading;
- split / merge;
- nominalization → action;
- voice reconstruction;
- explicit ↔ implicit expression;
- local-context use;
- uncertainty triage;
- high-risk self-check;
- exam stop rule.

The four Core Learning Blocks are integrated again in a complete walkthrough instead of left as isolated labels.

### Ownership and anti-duplication boundary

- lexical sense/phrase/construction knowledge routes to **LexicalOS** rather than creating a Translation-local vocabulary system;
- teacher/method material is explicitly treated as a **Repair Reservoir**, not the default curriculum;
- synthetic, exposed exam material and protected unseen material have distinct roles;
- private first translations, wrong/uncertain state, timing, repair history and later transfer remain learner evidence rather than shared canonical content.

No concrete duplicate semantic owner was found in the K scope.

### First-learning sufficiency without encyclopedia drift

The asset includes synthetic examples, active checks, an integrated walkthrough and a clear first-learning exit. Long-tail ambiguity, competing parses, rare structures and personalized micro-drills are explicitly deferred to Chat when encountered. This meets the K requirement that the static asset be substantive enough for first learning without pre-expanding every rare edge case.

### Runtime appendix boundary

`learning.md` contains a later Frozen Runtime appendix. Its presence does not grant R/E acceptance and was not used as K evidence. The K decision concerns the canonical Translation ability model and knowledge needed for first learning; Runtime correctness remains downstream-frozen for its own gate.

K decision: **PASS**. No blocker or justified non-blocking K debt was found.

---

## Candidate evidence for staged acceptance

### Learning candidates — active now

- `content/english/modules/translation/learning.md`
- `content/english/LEARNING_CONTRACT.md`

The L audit must judge the actual formation path rather than merely the correctness of the content. Candidate semantics include:

- first learning starts with the Global Map;
- the four Core Learning Blocks are learned continuously rather than as isolated Skill cards;
- Skill Map and deeper Skill Content are later navigation/repair structures;
- real-task repair begins at the earliest meaningful failure;
- complete-but-skippable learning must not manufacture learner mastery;
- synthetic or already-exposed material should teach mechanisms when there is no reason to consume protected unseen material;
- independent regeneration and later fresh transfer are stronger evidence than same-item polishing.

These are not L PASS claims until the bounded Learning audit is executed.

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

These remain candidate downstream evidence and must not be used to leapfrog L/P/R/E ordering.

---

## Acceptance next action

Run a bounded **L-only** Translation learning-path audit:

1. judge whether first learning should actually run Global Map → four Core Learning Blocks continuously for this learner-facing module;
2. verify that Skill Map/deep leaves remain later repair/navigation rather than a compulsory first-learning checklist;
3. verify complete-but-skippable behavior: prior proficiency may reduce what the learner consumes, but may not manufacture mastery/evidence;
4. verify attempt/reveal timing conceptually: protected unseen material must not be spent merely to teach the framework, and reference/model output must follow the intended clean attempt;
5. verify repair order follows the earliest meaningful failure and requires learner regeneration rather than passive explanation;
6. classify concrete Learning defects as blocker, bounded debt, or absent;
7. write L PASS / PASS_WITH_DEBT / BLOCKED only from that evidence;
8. if L passes, advance local `CURRENT.md` to P without auditing P/R/E in the same step;
9. keep U `UNTESTED` until real learner use.

If L exposes a real Knowledge defect, reopen K at the exact dependency rather than compensating in Projection or Runtime.

---

## Truth boundaries

### Artifact Truth
Actual Translation source/content/runtime owners listed above.

### Acceptance Truth
This file records S as `PASS_WITH_DEBT` and K as `PASS`. L/P/R/E/U remain unaccepted unless explicitly stated otherwise.

### Learner Truth
Private learner/runtime state only. This file does not claim Kian has started Translation, completed first learning, attempted a task, repaired an error, or closed a transfer target.
