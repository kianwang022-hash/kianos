# English Translation Acceptance

Status: CURRENT  
Scope: English Translation learner-facing module  
Standard: root `LEARNING_ACCEPTANCE.md`

This file owns current **Acceptance Truth** for Translation. It does not own content, Work Cursor, or private learner state.

---

## Gate status

| Gate | Status | Current evidence / boundary |
| --- | --- | --- |
| S — Source | **PASS** | 27 sets / 135 stable prompts / 27 complete-reference sets / 0 partial sets / 0 pending reference debt. Cross-verified bounded replacements remain explicitly `official: false`. |
| K — Knowledge | **PASS** | Knowledge truth is conserved across `learning.md` plus the verbatim deep reservoir `learning.reference.md`. Current learner model is Representation / Reconstruction / Execution with Fidelity as a cross-cutting invariant; Lexical durable knowledge remains owned by LexicalOS. |
| L — Learning | **PASS** | Performance first. First Learning is targeted/skippable; stable work may enter real Translation directly. Wrong/Uncertain do not automatically create deep review or transfer debt. Repair does not automatically require a later test. |
| P — Projection | **PASS** | Current projection exposes three productive cores, keeps Fidelity as an invariant rather than a compulsory stage, protects clean-attempt reference text, and keeps backend pending claims off the learner home. Current Translation QA passed Source → Runtime → Evidence → build → Projection on PR #52 head `c6c248e20ceb01071639e5a06b376ff11b77d883`. |
| R — Runtime | **PASS** | Whole-task attempt/review context, explicit repair slices, atomic return application, clean PASS, Reconstruction, persistence, and same-task non-mastery semantics remain accepted. |
| E — Evidence | **PASS** | Immutable first evidence, cascade/root-cause compression, fresh close requirements, contradiction reopen, non-reusable no-debt, lexical ownership, idempotence, and browser-local evidence remain accepted. Pending evidence does not summon learner work. |
| U — User Validation | **UNTESTED** | Real Kian use only. Engineering/browser/model evidence cannot replace learner validation. |

---

## Current readiness claim

Allowed statement:

> **Translation is Functional-First engineering ready for learner test. S/K/L/P/R/E PASS; U remains UNTESTED.**

Do not call Translation learner-validated until Kian actually uses the path.

---

# Fresh Logic → Content → Projection reconciliation｜2026-09-13

The fresh audit did not inherit the old four-stage decomposition as truth.

## K / L — semantic delta

**Previous claim:**

```text
Representation
→ Preservation
→ Reconstruction
→ Execution
```

with four peer Core Learning Blocks.

**Fresh verdict:** `CHANGE / MERGE / DEMOTE`, not semantic deletion.

Current smallest sufficient learner model:

```text
Representation
→ Reconstruction under Fidelity
→ Timed Delivery
```

`Preservation / Fidelity` remains fully valid, but its correct role is a cross-cutting invariant and repair/check owner rather than a mandatory learner stage.

Semantic destination of the old rich B2 material:

- high-value fidelity rules remain in Current `learning.md`;
- the full previous asset is preserved verbatim in `learning.reference.md`;
- detailed examples / micro-drills / edge cases remain repair/reference material.

This reduces learner burden without deleting knowledge truth.

## P — projection delta

First Learning now projects the three productive cores and lets the learner return to Runtime at any time. Fidelity remains visible as a guard but is not a fourth course.

A real Projection blocker was also removed: Translation home previously surfaced backend pending-transfer information as learner attention debt. Current home no longer reads/displays pending claim counts merely because the backend can store them.

Current execution evidence:

- PR #52 head: `c6c248e20ceb01071639e5a06b376ff11b77d883`;
- `Static Web Translation QA` run: `34752384519`;
- Source gate: PASS;
- Runtime gate: PASS;
- Evidence gate: PASS;
- Astro build: PASS;
- Projection gate: PASS.

## R — accepted runtime boundary

Current Runtime semantics:

```text
whole clean attempt
→ PASS / quick correction / meaningful repair
→ smallest useful repair slice
→ learner Reconstruction when useful
→ optional durable claim only when admission is justified
```

Accepted invariants include:

- incomplete/invalid repair addresses fail closed;
- failed return application cannot leave partial mutation;
- first translation remains immutable evidence;
- clean PASS manufactures no transfer debt;
- same-task repair cannot close mastery;
- reference text is not fabricated or leaked into the clean attempt.

## E — accepted evidence boundary

The following remain canonical after simplification:

- **Evidence granularity may be smaller than Review granularity.**
- diagnosis is not repair; repair is not mastery;
- first meaningful failure absorbs explainable downstream effects;
- old/repeated material cannot masquerade as fresh closure;
- irrelevant later material does not confirm/refute;
- same later task evidence is idempotent;
- genuinely fresh semantically relevant evidence may close;
- later contradiction may reopen;
- `admit=false` creates no durable target;
- Lexical durable knowledge stays in LexicalOS;
- learner evidence stays private/local.

Crucially:

```text
fresh evidence truth
≠ forced fresh-review ritual

pending claim
≠ learner owes an action
```

---

## Source provenance boundary

The former 2022 Q48, 2022 Q49, and 2025 Q46 bounded reference gaps remain closed only through exact prompt identity plus independent public semantic cross-check. Their stored normalized references are not represented as official unique wording.

Canonical question owner SHA-256 remains:

`406fe860626539acc9a433a3bcfb48be29f683674b32d432ac87b60272df814e`

---

## U boundary

U must come from actual learner use. Useful future real-use paths may include clean PASS, meaningful repair → Reconstruction, naturally encountered later transfer, and contradiction reopen.

A real-use defect should reopen only the exact responsible gate, not restart the whole module by default.

---

## Truth boundaries

**Artifact Truth:** Current Translation learning/source/projection/runtime/evidence owners, including `learning.reference.md` for deep preserved semantics.  
**Acceptance Truth:** this file.  
**Learner Truth:** private learner/runtime state only.
