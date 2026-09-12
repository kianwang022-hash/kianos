# English Translation Acceptance

Status: CURRENT  
Scope: English Translation learner-facing module  
Standard: root `LEARNING_ACCEPTANCE.md`

This file owns current **Acceptance Truth** for Translation.

It does not own Translation content, Work Cursor, or private learner state.

---

## Gate status

| Gate | Status | Current evidence / boundary |
| --- | --- | --- |
| S — Source | PASS | Canonical Current source resolves to 27 sets / 135 stable prompts / 27 complete-reference sets / 0 partial sets / 0 pending reference debt. The former 2022 Q48/Q49 and 2025 Q46 gaps were closed only after exact prompt identity plus independent public semantic cross-check; normalized references are explicitly `official: false`. |
| K — Knowledge | PASS | Canonical learning asset uses a capability-native Translation model: Representation → Preservation → Reconstruction → Exam Execution, with substantive mechanisms, active checks, LexicalOS routing, protected-unseen separation, and adaptive Chat for long-tail cases. |
| L — Learning | PASS | Approved path is Global Map → four continuous Core Learning Blocks → integrated use → normal whole-set Translation. Clean first output precedes diagnosis/reference; smallest repair requires learner Reconstruction; later fresh transfer outranks same-item correction. |
| P — Projection | PASS | Two Projection blockers were repaired before acceptance: pending-target cues leaking during Clean Attempt, and `HOW YOU LEARN IT` being folded while the first-learning exit tested its concepts. Dedicated P gate passed; Translation QA remains the regression owner after Source changes. |
| R — Runtime | PASS | Two Runtime blockers were repaired before acceptance: missing `affected_segments` silently widening repair to the whole set, and failed return application risking partial ledger mutation. Dedicated R gate: 40 checks, 0 issues. |
| E — Evidence | PASS | Two Evidence blockers were repaired before acceptance: old/repeated tasks could masquerade as fresh transfer closure, and LexicalOS-owned durable knowledge could be duplicated into the Translation transfer ledger. Dedicated E gate: 27 checks, 0 issues; old/repeated task non-closure, irrelevant non-confirmation, same-task idempotency, fresh semantic closure, contradiction reopen, non-reusable no-debt, lexical canonical routing, and private-evidence locality all passed. |
| U — User Validation | UNTESTED | Real Kian use only. Engineering, synthetic QA, build success, and model review cannot supply U. |

---

## Current readiness claim

Allowed statement:

> **Translation is Module ready for learner test. S/K/L/P/R/E are PASS; U remains UNTESTED.**

Do **not** call Translation learner-validated until Kian actually uses the relevant path.

---

## S — Accepted Source evidence

Validator: `static-web/scripts/validate-translation-source.mjs`  
Closure apply run: `34702810732`

Accepted boundary:

- decision: `PASS`
- section: `translation`
- sets: `27`
- stable prompts: `135`
- complete-reference sets: `27`
- partial-reference sets: `0`
- explicit pending reference debts: `0`
- Source failures: `0`
- canonical question owner SHA-256: `406fe860626539acc9a433a3bcfb48be29f683674b32d432ac87b60272df814e`

The three former bounded gaps are now closed:

1. `english1-2022-translation-main-q48`
2. `english1-2022-translation-main-q49`
3. `english1-2025-translation-main-q46`

Closure rule:

- repository prompt identity had to match the independently published exam sentence exactly enough to rule out transcription drift;
- core semantics had to agree across multiple independent public analyses;
- KianOS stores a normalized Chinese reference rather than copying one provider's wording;
- verification status is `cross_verified_public_reference`;
- `official: false` is explicit: these references are not represented as Ministry/official unique translations;
- the original canonical `answer` field remains `null` for these rows, preserving the distinction between missing local answer-source material and an independently cross-verified reference.

This closes Source reference debt without fabricating provenance or rewriting missing answer-source history.

S decision: **PASS**.

---

## K — Accepted Knowledge boundary

Canonical owners:

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

Key ownership rules:

- stable Translation mechanisms are taught rather than merely named;
- lexical sense / phrase / construction / collocation / contrast / confusable knowledge routes to LexicalOS;
- teacher material is a Repair Reservoir, not the default curriculum;
- protected unseen material remains diagnostic capital;
- private learner evidence is not shared canonical content;
- rare ambiguity and personalized drill remain adaptive Chat territory.

K decision: **PASS**.

---

## L — Accepted Learning boundary

Accepted learner path:

```text
Global Map
→ B1 Representation
→ B2 Preservation
→ B3 Reconstruction
→ B4 Execution
→ integrated walkthrough
→ HOW YOU LEARN IT
→ normal whole-set Translation
```

Accepted semantics:

- Skill Map/deep leaves are later repair/navigation, not compulsory first learning;
- complete-but-skippable navigation does not manufacture mastery;
- synthetic/exposed material may teach mechanisms without spending protected unseen material;
- clean first output precedes diagnosis/reference;
- repair begins at the earliest meaningful failure;
- smallest sufficient repair is followed by learner Reconstruction;
- same-item correction is weaker than later fresh transfer.

L decision: **PASS**.

---

## P — Accepted Projection evidence

Two real blockers were found and repaired:

1. **Fresh-transfer cue leak** — concrete pending-target labels / underlying demand could appear during Clean Attempt. The task projection now keeps those details hidden until the immutable first attempt has been locked.
2. **First-learning teach/test inversion** — `F｜HOW YOU LEARN IT` was folded while `G｜第一次学习出口` tested its concepts. F is now on the visible first-learning path before G; Skill Map/deep/system/runtime reference remains progressively disclosed.

Dedicated validator: `static-web/scripts/validate-translation-projection.mjs`

Accepted historical machine evidence before the final Source-reference closure:

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

The Translation QA workflow reruns Projection against Current Source after Source changes; merge requires that regression run to remain green.

P decision: **PASS**.

---

## R — Accepted Runtime evidence

Two real blockers were found and repaired:

1. **Missing repair slice widened silently** — `REPAIR_NEEDED` without `affected_segments` used to expand to all prompts. Missing slices now fail closed with `RETURN_PACKET_AFFECTED_SEGMENTS_MISSING`; invalid ids fail closed with `RETURN_PACKET_AFFECTED_SEGMENT_INVALID`.
2. **Failed return application was not guaranteed atomic** — nested evidence arrays were reused and transfer updates could precede repair-address validation. Evidence rows are now independently cloned and repair addresses are validated before any transfer update.

Dedicated validator: `static-web/scripts/validate-translation-runtime-gate.mjs`  
Accepted run: `34699948489`  
Audited head: `8c74389283f67183310f6b329c2d4a0f57f3146a`

Machine evidence:

- schema: `kianos.english.translation.runtime-gate-validation.v1`
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
- Reference non-fabrication: `true`

R decision: **PASS**.

---

## E — Accepted Evidence evidence

E was audited separately from Runtime executability. It judges whether the system preserves and uses learning evidence without creating false mastery or false debt.

### Blocker 1 — old/repeated task could masquerade as fresh closure

Previous behavior treated a different task id as enough to permit `support + close=true`. That did not prove the task was genuinely fresh relative to target creation.

Repair:

- closure eligibility requires `taskHistoryCount === 0`;
- the current task's immutable `firstSubmittedAt` must be later than the target's `createdAt`;
- `applyTranslationReturn()` derives these facts from private task state rather than trusting Chat/UI self-report;
- stale/repeated closure attempts fail closed with `RETURN_PACKET_TRANSFER_CLOSE_REQUIRES_FRESH_TASK`;
- evidence rows persist `freshForClosure`, `firstSubmittedAt`, and `taskHistoryCount`.

This preserves the hierarchy:

```text
same-item repair
<
old / exposed task success
<
genuinely fresh independent transfer
```

### Blocker 2 — Lexical durable debt could duplicate into Translation

Translation may diagnose a `Lexical` primary failure for the current task, but durable lexical knowledge belongs to LexicalOS.

Repair:

- `Lexical` primary failure + `transfer_target.admit=true` now fails closed with `RETURN_PACKET_TRANSFER_TARGET_LEXICAL_OWNER`;
- Translation may still repair the current lexical failure, but it cannot create a second canonical long-term lexical ledger.

### Other accepted Evidence semantics

- whole-set learner-facing review coexists with finer segment/clause evidence;
- immutable first translation remains the diagnostic baseline;
- earliest primary failure absorbs explainable cascade effects;
- Reconstruction proves repair execution, not mastery;
- source task / same task cannot count as fresh transfer closure;
- irrelevant later material remains explicit but cannot confirm/refute a target;
- repeated import from the same later task replaces its evidence instead of stacking counts;
- a genuinely fresh first attempt after target creation may close only when Chat semantically returns `support + close=true`;
- contradictory later evidence reopens a closed target and clears stale closure provenance;
- `admit=false` repair creates no durable transfer debt;
- private learner evidence remains browser-local and is not written into shared Current.

Dedicated validator: `static-web/scripts/validate-translation-evidence-gate.mjs`  
Workflow run: `34700382509`  
Audited head: `6c13655607ca29f8757bca950b383f79f84c27b0`

Machine evidence:

- schema: `kianos.english.translation.evidence-gate-validation.v1`
- gate: `E`
- decision: `PASS`
- checks: `27`
- issues: `0`
- whole-set review / fine evidence: `true`
- immutable first evidence: `true`
- cascade collapse: `true`
- Reconstruction not mastery: `true`
- old task cannot close: `true`
- repeated task cannot close: `true`
- irrelevant does not confirm: `true`
- same-task evidence idempotent: `true`
- fresh semantic closure: `true`
- contradiction reopens: `true`
- non-reusable repair creates no debt: `true`
- lexical routes to canonical owner: `true`
- private evidence local: `true`

The same audited head also kept Source QA, prior Runtime gate, Astro build, and prior Projection gate green.

E decision: **PASS**. No justified E debt remains.

---

## U — Learner Validation boundary

U remains **UNTESTED**.

Do not manufacture a special Translation exercise merely to close U. When Kian's normal English study naturally reaches Translation, that real path becomes U evidence.

Typical U paths may later include:

- First Learning → real Translation;
- clean attempt → PASS;
- Need Review → Chat diagnosis → smallest repair → Reconstruction;
- later genuinely fresh transfer closure;
- reopen after later contradictory evidence.

A real-use defect should reopen the exact responsible gate, not trigger a full Translation re-audit by default.

---

## Truth boundaries

### Artifact Truth

Canonical Translation learning/source/projection/runtime/evidence owners.

### Acceptance Truth

This file: S/K/L/P/R/E `PASS`; U `UNTESTED`.

### Learner Truth

Private learner/runtime state only. Repository acceptance does not imply Kian has studied, attempted, repaired, transferred, or validated Translation.
