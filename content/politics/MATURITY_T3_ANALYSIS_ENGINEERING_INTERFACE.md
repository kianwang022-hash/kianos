# Politics Maturity T3 — Analysis Engineering Interface

Status: **TASK/RUBRIC SEMANTICS RESOLVED · DURABLE EVIDENCE IMPLEMENTATION NEXT**  
Parent: `MATURITY_STAGE_PLAN.md`

## Finding

Current Politics private durability is deliberately whitelist-based.

The private checkpoint currently captures only validated:

- Practice state/evidence;
- typed Politics Review Chat Return;
- Politics Memory plan/evidence/profile.

There is no generic “store arbitrary Politics JSON” escape hatch.

That is correct and should remain true.

## Consequence for Analysis

The highest-bar maturity standard requires durable Analysis evidence for:

- IDENTIFY;
- SKELETON;
- MATERIAL BINDING;
- exact/source-grounded formulation retrieval;
- repaired output;
- fresh-material transfer;
- timed full answer;
- whole-paper execution.

Because Analysis is Chat-primary by default, future cross-day maturity cannot rely on transient Chat context alone.

Therefore a real later engineering gap exists:

> validated Analysis evidence must eventually enter the existing Politics private checkpoint and bounded Daily Packet.

This does **not** justify building it before the evidence semantics are exact.

## Semantic prerequisites — RESOLVED

`MATURITY_T3_ANALYSIS_TASK_RUBRIC.md` now owns the reusable task/rubric semantics.

It defines:

1. stable task identity / revision basis;
2. source-basis and freshness classes;
3. attempt roles `FIRST / REPAIR / TRANSFER`;
4. task modes `IDENTIFY / SKELETON / BIND / FORMULATION / DELIVER / TRANSFER`;
5. persisted rubric vector `I / S / B / F / D` with `0 / 1 / 2 / NA`;
6. critical failure flags;
7. bounded fresh-Chat summary needs;
8. stale/current-year authority boundaries.

Historical 2026 materials authorize task geometry and rubric structure only. They do not authorize 2027 exact annual wording.

## Smallest future engineering patch

Once the prerequisites exist, the expected implementation is bounded:

```text
validated Analysis evidence module
→ one additional allowed Politics private checkpoint family
→ bounded Analysis summary in existing Politics study packet
→ existing Daily Learning Packet composition
→ fresh Chat
```

No new:

- Politics learner ledger;
- scheduler;
- Home;
- universal packet;
- Analysis dashboard;
- autonomous mastery score.

## Website decision

Default remains **no dedicated Analysis Website**.

A learner-facing surface may be opened only after real friction proves a structured UI is better than Chat for a concrete action such as timed/handwritten capture.

## Current T3 verdict

```text
private durability extension path   RESOLVED
new Analysis website                REJECTED BY DEFAULT
storage schema implementation       READY · NEXT
current learner blocker             NO
```

T3 no longer has a semantic blocker. The next bounded engineering action is to add validated Analysis evidence to the existing Politics private checkpoint and existing Daily Packet without creating a second transport.
