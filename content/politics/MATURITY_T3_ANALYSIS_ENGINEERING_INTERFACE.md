# Politics Maturity T3 — Analysis Engineering Interface

Status: **BLOCKED ON EXACT TASK/RUBRIC SEMANTICS; ENGINEERING PATH RESOLVED**  
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

## Required semantic prerequisites

Before storage code is allowed, the Politics Analysis owner must define:

1. stable task identity / task revision;
2. source-basis identity and freshness rules;
3. attempt role:
   - first;
   - repair;
   - transfer;
4. rubric / assessment dimensions that are legitimate to persist;
5. uncertainty representation;
6. what bounded summary a fresh Chat needs;
7. which evidence becomes stale when source/task revision changes.

Without these, a storage schema would manufacture semantics.

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
storage schema implementation       BLOCKED ON TASK/RUBRIC SEMANTICS
current learner blocker             NO
```

T3 therefore does not block T4 future-source ingestion preparation.
