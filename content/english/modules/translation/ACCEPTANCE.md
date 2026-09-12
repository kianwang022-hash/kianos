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
| S — Source | PASS_WITH_DEBT | Current Source boundary is machine-validated from the Current manifest/question bank/scanner. Translation resolves from 1 section, 27 sets and 135 stable prompts. 25 sets have complete reference coverage; 2 are partial with exactly 3 explicit `pending_review` reference debts and zero validator failures. Missing references remain fail-closed and may not be fabricated. |
| K — Knowledge | PASS | Bounded semantic audit of canonical `content/english/modules/translation/learning.md` and the minimal Translation boundary in `content/english/LEARNING_CONTRACT.md` found a capability-native hierarchy, substantive high-value mechanisms, correct LexicalOS routing, active checks/integrated generation, proper material/evidence ownership, and no justified K blocker or debt. Runtime semantics appended later in the file are not accepted by K. |
| L — Learning | PASS | Bounded learning-path audit confirms that first learning is Global Map → four continuous Core Learning Blocks → normal Translation task; Skill Map/deep leaves remain later repair/navigation rather than compulsory curriculum; learning is complete-but-skippable without manufacturing mastery; synthetic/exposed material teaches mechanisms while protected unseen material is preserved; clean first output precedes diagnosis/reference use; repair follows the earliest meaningful failure, uses the smallest sufficient repair, then requires learner reconstruction; same-item correction is weaker than later fresh transfer. No justified L blocker or debt was found. |
| P — Projection | UNTESTED | Learner-facing Translation pages/components exist, but they have not yet been formally audited against the accepted K/L semantics. **P is the current active gate under local `CURRENT.md`.** |
| R — Runtime | UNTESTED | Runtime implementation and deterministic journey validators exist. Implementation remains Artifact Truth until R acceptance is executed/audited. **Downstream-frozen until P passes.** |
| E — Evidence | UNTESTED | Evidence/transfer/persistence semantics exist in candidate implementation. Formal E acceptance remains to be established. **Downstream-frozen until R passes.** |
| U — User Validation | UNTESTED | No repository engineering evidence may substitute for real Kian use. U is not eligible until S–E support `Module ready for learner test`. |

`UNTESTED` above is evidence status, not a parallel work queue. Gate activation is controlled by `content/english/modules/translation/CURRENT.md`.

---

## Current readiness claim

Allowed statement:

> **Translation has accepted Source, Knowledge and Learning boundaries: S is PASS_WITH_DEBT with three explicit fail-closed reference gaps; K and L are PASS; P is now the active gate; R/E remain downstream-frozen; U remains UNTESTED.**

Do not say `Module ready for learner test` until S–E meet the root acceptance standard.

---

## Accepted Source evidence

The bounded Source validator is `static-web/scripts/validate-translation-source.mjs` and its CI evidence is persisted by `.github/workflows/static-web-translation-qa.yml`.

Accepted S evidence:

- decision: `PASS_WITH_DEBT`
- section resolution: `translation` via `current-evidence`
- sets: `27`
- prompts: `135`
- complete reference sets: `25`
- partial reference sets: `2`
- explicit pending reference debts: `3`
- failures: `0`
- canonical question owner SHA-256: `c82b8daa93962cc39a9a4f09a0ba16057914edb6f96a2888c3be455928784986`

Bounded debts:

1. `english1-2022-translation-main-q48` — `pending_review`
2. `english1-2022-translation-main-q49` — `pending_review`
3. `english1-2025-translation-main-q46` — `pending_review`

These are Source gaps, not learner debt, and do not authorize generated/fabricated reference translations.

---

## Accepted Knowledge evidence

K was audited semantically against:

- `content/english/modules/translation/learning.md` blob `69719c5d81fb577386bd4bc901b4d1c5aad0ce67`
- `content/english/LEARNING_CONTRACT.md` blob `7ad75e87fcec18fd2dec29b4f5de5155b09aa9ec`

Accepted K boundary:

```text
Global Map
→ English Representation
→ Preservation & Fidelity
→ Chinese Reconstruction
→ Exam Execution
→ integrated use
→ later Skill Map / selective Skill Content
```

The asset actually teaches high-value mechanisms rather than only naming them: proposition hierarchy, attachment, reference, scope/modality/degree, logical relation, contextual lexical access, information/relationship fidelity, omission/addition/distortion control, information order, modifier unloading, split/merge, nominalization, voice, explicit/implicit expression, uncertainty triage, high-risk checking and stop rules.

Ownership is clean enough for K: lexical knowledge routes to LexicalOS; teacher material is a Repair Reservoir; synthetic/exposed/protected materials have distinct roles; private first translations and later learner evidence remain outside shared canonical content; long-tail ambiguity/personalized drill is deferred to Chat. No justified K debt was found.

The later Frozen Runtime appendix was not used to grant K and remains downstream candidate semantics.

---

## Accepted Learning evidence

L was audited against the same approved learning owner and parent English contract, but judged **how the ability is formed**, not whether the content is merely correct.

### First-learning order is causally sensible

The learner-facing first-learning design is:

```text
Global Map
→ B1 English Representation
→ B2 Preservation & Fidelity
→ B3 Chinese Reconstruction
→ B4 Exam Execution
→ integrated use
→ normal Translation task
```

This preserves the dependency chain: understand the proposition first, then preserve it, then reconstruct Chinese, then optimize execution. It does not start from teacher chapter order or a taxonomy of isolated errors.

### Skill Map is not compulsory curriculum

The Skill Map exists to give later failures stable addresses and to route repair/evidence. Deep leaf content is selective. The first-learning path does not require traversing every R/P/C/E node.

### Complete-but-skippable does not manufacture mastery

The parent English contract allows a proficient learner to skim or skip already-familiar learning content for navigation efficiency, but self-report, a skim, an explanation or software success does not create learner mastery or close transfer evidence. This is compatible with the Translation asset and does not require burning a real exam merely to prove familiarity.

### Active output is built into learning

Core Blocks include active checks, synthetic examples and integrated generation. Learning does not end at passive explanation. The first Translation output remains valuable evidence, and repair requires the learner to generate again.

### Fresh material is treated as diagnostic capital

Synthetic or already-exposed material may teach the framework and probe a mechanism. Protected unseen material is reserved for clean attempt/transfer value rather than consumed merely to demonstrate the system.

### Repair order follows the first meaningful failure

The approved learning philosophy is:

```text
Clean Attempt
→ preserve first output
→ locate earliest meaningful failure
→ smallest sufficient repair
→ learner reconstructs
→ later fresh transfer
```

If English representation is wrong, do not polish Chinese first. Explanation read-through is not repair; same-item correction is weaker than later independent handling of the same underlying demand.

### Static asset vs Chat boundary is appropriate

Stable, high-frequency capability formation lives in the asset. Competing parses, rare structures, multiple interacting mechanisms, real-sentence ambiguity and personalized micro-drills are expanded in Chat only when evidence makes them useful.

L decision: **PASS**. No learning-order, calibration, material-timing, repair-order or evidence-strength defect was found that justifies `PASS_WITH_DEBT` or `BLOCKED`.

---

## Candidate evidence for staged acceptance

### Projection candidates — active now

- `static-web/src/components/TranslationWorkspace.astro`
- `static-web/src/pages/translation.astro`
- `static-web/src/pages/translation/[id].astro`
- `static-web/src/pages/translation-learn.astro`
- Translation-specific styles/components needed to judge learner-facing density and progressive disclosure
- `static-web/src/lib/englishTranslation.mjs` only where exact rendered Source/reference projection must be traced
- accepted K/L semantics in `content/english/modules/translation/learning.md` and `content/english/LEARNING_CONTRACT.md`

P must test whether the learner actually sees the accepted path, whether clean attempts remain protected, whether reference/model output is delayed appropriately, whether first learning is complete-but-skippable rather than overwhelming, and whether page structure serves Translation cognition rather than mirroring Markdown headings.

### Runtime / Evidence candidates — preserved, downstream-frozen

- `static-web/src/lib/translationRuntimeModel.mjs`
- `static-web/src/components/TranslationEvidenceGuard.astro`
- `static-web/src/components/TranslationPersistenceGuard.astro`
- `static-web/scripts/validate-translation-runtime.mjs`
- `static-web/scripts/validate-translation-evidence-guard.mjs`
- `.github/workflows/static-web-translation-qa.yml`

These remain candidate downstream evidence and must not be used to leapfrog P/R/E ordering.

---

## Acceptance next action

Run a bounded **P-only** Translation Projection audit:

1. inspect the learner-facing first-learning and task pages against accepted K/L semantics;
2. verify the first view foregrounds the right action rather than exposing the whole backend content structure;
3. verify complete-but-skippable first learning can be navigated without manufacturing learner progress;
4. verify clean attempt surfaces do not leak references, canonical analysis or repair cues prematurely;
5. verify learner-facing task/review granularity and navigation fit Translation cognition;
6. verify density/typography/disclosure do not make the accepted learning path materially harder to execute;
7. classify concrete Projection defects as blocker, bounded debt, or absent;
8. write P PASS / PASS_WITH_DEBT / BLOCKED only from that evidence;
9. if P passes, advance local `CURRENT.md` to R without auditing R/E in the same step;
10. keep U `UNTESTED` until real learner use.

If P exposes a real upstream Knowledge/Learning defect, reopen the earliest responsible gate rather than compensating in UI.

---

## Truth boundaries

### Artifact Truth
Actual Translation source/content/runtime owners listed above.

### Acceptance Truth
This file records S as `PASS_WITH_DEBT`, K as `PASS`, and L as `PASS`. P/R/E/U remain unaccepted unless explicitly stated otherwise.

### Learner Truth
Private learner/runtime state only. This file does not claim Kian has started Translation, completed first learning, attempted a task, repaired an error, or closed a transfer target.
