# Skill Unit Contract

Status: CURRENT
Role: minimum design contract for a material learner unit.

A unit is not a chapter. It is the smallest coherent capability slice that can be learned, demonstrated and either exited or repaired.

## Required design questions

Before learner content is considered ready, resolve:

```text
Target capability:
Why now:
Prerequisites:
Baseline gate: CLEAN | SOFT | SKIP
Learner asset:
Practice geometry:
Allowed assistance: NATIVE | TOOL_ALLOWED | AI_ASSISTED | EXPERT_GATED
Verification mode:
Exit evidence:
Changed-context transfer target:
Real-use manifestation:
Maintenance need: YES | NO | EVIDENCE_GATED
```

## Rules

- Do not create a unit merely because a topic deserves a heading.
- Prefer one real performance family over broad topical coverage.
- Guide / Framework may orient, but it cannot satisfy Exit evidence.
- Verification should look less like the teaching material as evidence strength rises.
- Same-item correction triggers Repair, not promotion.
- When stable evidence already exists, skip redundant practice.
- When the bottleneck becomes real practice, stop improving the learner asset.
- High-consequence units may require EXPERT_GATED real use.

## Difficulty routing

```text
too easy
→ increase variation / delay / realism

productive errors
→ smallest useful feedback
→ another attempt

mostly guessing
→ narrow task / restore prerequisite

unsafe
→ simulation / source / expert gate
```

## Completion semantics

A learner may mark a page "read" for Resume convenience.

That is Runtime navigation evidence only.

Capability promotion belongs to Evidence / Chat judgment and follows:

```text
ORIENTED
< DIRECTLY_DEMONSTRATED
< CHANGED_CONTEXT_TRANSFER
< REAL_USE
< STABLE
```

The success condition decides how high the ladder must go.
