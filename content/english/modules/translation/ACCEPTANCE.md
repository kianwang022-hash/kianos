# English Translation Acceptance

Status: CURRENT  
Scope: English Translation learner-facing module  
Standard: root `LEARNING_ACCEPTANCE.md`

This file owns current **Acceptance Truth** for Translation.

It does not own Translation learning content, Runtime code, Work Cursor, or private learner state.

---

## Gate status

| Gate | Status | Current evidence / boundary |
| --- | --- | --- |
| S — Source | PASS_WITH_DEBT | Current Translation resolves from the canonical Current question owner: 27 sets / 135 stable prompts. 25 sets have complete reference coverage; 2 are partial with exactly 3 explicit `pending_review` reference gaps and zero Source-validator failures. Missing references remain unavailable and may not be fabricated. |
| K — Knowledge | PASS | Canonical `learning.md` defines a capability-native Translation model: Representation → Preservation → Reconstruction → Exam Execution, with substantive mechanisms, active checks, LexicalOS routing, teacher material as repair reservoir, protected-unseen separation, and adaptive Chat for long-tail cases. No justified K debt. |
| L — Learning | PASS | Approved path is Global Map → four continuous Core Learning Blocks → integrated use → normal whole-set Translation. Skill Map/deep leaves are later repair/navigation; clean first output precedes diagnosis/reference; earliest meaningful failure receives smallest sufficient repair + learner reconstruction; later fresh transfer outranks same-item correction. No justified L debt. |
| P — Projection | PASS | Two learner-flow blockers were found and repaired before acceptance: pending-target details leaked during Clean Attempt, and `F｜HOW YOU LEARN IT` was folded while G tested its concepts. Dedicated post-build P gate passed: 161 checks, 27/27 task pages, 132 available canonical reference rows checked, 0 clean-attempt reference leaks, 0 issues. |
| R — Runtime | PASS | Two Runtime blockers were found and repaired before acceptance: missing `affected_segments` silently widened repair to the whole set, and failed return application could mutate the original transfer ledger through shared nested evidence arrays / pre-validation updates. Dedicated R gate passed: 40 checks, 0 issues; whole-attempt, clean PASS, immutable first evidence, wrong-task fail-close, required repair slice, atomic failed import, Reconstruction, same-task non-closure, persistence fail-close, and reference non-fabrication all passed. |
| E — Evidence | UNTESTED | Evidence / transfer / closure semantics have candidate implementation and regression tests, but formal E acceptance has not yet been executed. **E is the current active gate under local `CURRENT.md`.** |
| U — User Validation | UNTESTED | Real learner use only. Engineering/synthetic QA cannot supply U. |

---

## Current readiness claim

Allowed statement:

> **Translation has accepted S/K/L/P/R: S is PASS_WITH_DEBT; K/L/P/R are PASS; E is now active; U remains UNTESTED.**

Do not say `Module ready for learner test` until E also passes.

---

## S — Accepted Source evidence

Validator: `static-web/scripts/validate-translation-source.mjs`

Accepted Source boundary:

- decision: `PASS_WITH_DEBT`
- Translation section: `translation`
- sets: `27`
- stable prompts: `135`
- complete-reference sets: `25`
- partial-reference sets: `2`
- explicit pending reference debts: `3`
- failures: `0`
- canonical question owner SHA-256: `c82b8daa93962cc39a9a4f09a0ba16057914edb6f96a2888c3be455928784986`

Bounded Source debts:

1. `english1-2022-translation-main-q48` — `pending_review`
2. `english1-2022-translation-main-q49` — `pending_review`
3. `english1-2025-translation-main-q46` — `pending_review`

These are Source gaps, not learner debt. Runtime/reference projection must remain fail-closed.

---

## K — Accepted Knowledge boundary

Audited owners:

- `content/english/modules/translation/learning.md`
- `content/english/LEARNING_CONTRACT.md`

Accepted capability hierarchy:

```text
Global Map
→ English Representation
→ Preservation & Fidelity
→ Chinese Reconstruction
→ Exam Execution
→ integrated use
→ later Skill Map / selective deep content
```

Key ownership rules accepted at K:

- stable Translation mechanisms are taught rather than only named;
- lexical sense / phrase / construction knowledge routes to LexicalOS;
- teacher material is a Repair Reservoir, not default curriculum;
- protected unseen material remains diagnostic capital;
- private first translations / repair / transfer evidence are not shared semantic content;
- rare ambiguity and personalized drill remain Chat territory.

K decision: **PASS**.

---

## L — Accepted Learning boundary

Accepted first-learning / practice path:

```text
Global Map
→ B1 Representation
→ B2 Preservation
→ B3 Reconstruction
→ B4 Execution
→ integrated walkthrough
→ HOW YOU LEARN IT
→ normal Translation task
```

Accepted learning semantics:

- Skill Map/deep leaves are later repair/navigation, not compulsory first learning;
- proficient learners may skip familiar explanation without manufacturing mastery;
- synthetic/exposed material may teach mechanisms without spending protected unseen material;
- clean first output comes before diagnosis/reference;
- repair begins at the earliest meaningful failure;
- repair stops at the smallest amount needed for learner re-execution;
- learner Reconstruction is required after repair;
- same-item correction is weaker than later fresh transfer.

L decision: **PASS**.

---

## P — Accepted Projection evidence

### Blocker 1 — pending-target cue leak

Before P acceptance, old Transfer Pending labels / underlying demand could become visible while the current task was still in Clean Attempt, potentially cueing the demand that later fresh evidence was supposed to test.

Repair: task projection now keeps concrete pending-target detail hidden whenever the Clean Attempt stage is visible.

### Blocker 2 — first-learning teach/test inversion

Before P acceptance, `F｜HOW YOU LEARN IT` was folded inside system/runtime reference while `G｜第一次学习出口` tested why first translation must be preserved and why same-item correction is not mastery.

Repair: F is now on the visible first-learning main path before G; C/D Skill Map/deep content and E/H system/runtime reference remain progressively disclosed.

### Executed P gate

Validator: `static-web/scripts/validate-translation-projection.mjs`

Machine evidence:

- schema: `kianos.english.translation.projection-gate-validation.v1`
- decision: `PASS`
- checks: `161`
- built task pages: `27 / 27`
- available canonical reference rows checked: `132`
- clean-attempt reference leaks: `0`
- issues: `0`
- first-learning bridge before exit: `true`
- progressive disclosure: `true`
- initial reference payload empty: `true`
- pending-cue guard: `true`

P decision: **PASS**.

---

## R — Accepted Runtime evidence

R was audited against the Frozen Runtime v1 contract, the accepted K/L/P boundary, the executable Runtime model/workspace, persistence/reference guards, and a dedicated Runtime gate.

### Blocker 1 — missing repair slice silently widened to whole set

Previous behavior:

```text
REPAIR_NEEDED
+ no affected_segments
→ normalizedAffectedSegments()
→ all prompt ids
```

That violates smallest-repair semantics and can turn one local failure into unnecessary whole-set rework.

Repair:

- every `REPAIR_NEEDED` return must contain a non-empty `affected_segments` list;
- missing slices fail closed with `RETURN_PACKET_AFFECTED_SEGMENTS_MISSING`;
- invalid ids fail closed with `RETURN_PACKET_AFFECTED_SEGMENT_INVALID`.

### Blocker 2 — failed return application was not guaranteed atomic

Previous risk:

- `normalizeTransferLedger()` copied targets but reused nested `evidence` arrays;
- `applyTranslationReturn()` could apply transfer updates before validating repair segment addresses;
- a later repair-address failure could therefore leave mutated evidence behind even though import reported failure.

Repair:

- transfer evidence rows are independently cloned during ledger normalization;
- `REPAIR_NEEDED` segment addresses are validated before transfer updates are applied;
- failed return application leaves the original ledger unchanged.

### Executed R gate

Validator: `static-web/scripts/validate-translation-runtime-gate.mjs`  
Workflow run: `34699948489`  
Audited head: `8c74389283f67183310f6b329c2d4a0f57f3146a`

Machine evidence:

- schema: `kianos.english.translation.runtime-gate-validation.v1`
- gate: `R`
- decision: `PASS`
- checks: `40`
- issues: `0`
- whole attempt required: `true`
- clean PASS without manufactured debt: `true`
- immutable first attempt: `true`
- wrong-task fail closed: `true`
- repair slice required: `true`
- failed import atomic: `true`
- Reconstruction required: `true`
- same-task repair cannot close mastery: `true`
- persistence failure fails closed: `true`
- missing/mismatched Reference remains non-fabricated: `true`

The same PR head also kept the existing Translation regression QA, Astro build, and accepted Projection gate green.

R decision: **PASS**. No justified R debt remains.

---

## E — Active acceptance target

E must now judge whether the system preserves and uses **learning evidence correctly**, not whether the Runtime transitions merely execute.

Candidate owners:

- `static-web/src/lib/translationRuntimeModel.mjs` — transfer/evidence semantics
- `static-web/src/components/TranslationEvidenceGuard.astro`
- `static-web/scripts/validate-translation-evidence-guard.mjs`
- accepted Frozen Runtime evidence hierarchy / memory-admission semantics in `learning.md`

E must verify at minimum:

1. whole-set learner review can coexist with finer segment/clause evidence;
2. immutable first translation remains the diagnostic baseline;
3. earliest primary failure absorbs cascade effects rather than manufacturing multiple debts;
4. Reconstruction is repair evidence, not mastery;
5. source task / same task cannot count as fresh transfer evidence;
6. irrelevant later material cannot confirm/refute a pending target;
7. one later task cannot stack duplicate evidence by repeated import;
8. contradictory evidence can reopen a previously closed target when appropriate;
9. closure depends on semantically meaningful fresh evidence, not counters;
10. only reusable/high-value failures enter durable transfer debt;
11. private learner evidence stays local/private;
12. no lexical duplicate debt is created when LexicalOS owns the knowledge object.

Write E `PASS / PASS_WITH_DEBT / BLOCKED` only from bounded executed evidence.

If E passes, Translation reaches:

```text
S  PASS_WITH_DEBT
K  PASS
L  PASS
P  PASS
R  PASS
E  PASS
U  UNTESTED
```

and may then be called **Module ready for learner test**, not learner-validated.

---

## Truth boundaries

### Artifact Truth

Canonical Translation learning/source/projection/runtime/evidence owners.

### Acceptance Truth

This file: S `PASS_WITH_DEBT`; K/L/P/R `PASS`; E/U `UNTESTED` until explicitly accepted.

### Learner Truth

Private learner/runtime state only. Nothing in repository acceptance implies Kian has studied, attempted, repaired, transferred, or validated Translation.
