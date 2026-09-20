# Politics Maturity T3 — Analysis Engineering Interface

Status: **TASK/RUBRIC SEMANTICS CLOSED · DURABLE EVIDENCE LANDED · TARGETED PROOF PASSED**  
Parent: `MATURITY_STAGE_PLAN.md`

## Finding

Current Politics private durability remains deliberately whitelist-based.

Analysis now uses the same bounded durability path rather than a second learner-state system:

- `politicsAnalysisEvidence.mjs` validates exact task/revision, attempt role, source authority, rubric vector and critical flags;
- `politicsAnalysisRegistry.mjs` binds accepted legacy drills and future current-year source authority;
- the Politics private checkpoint whitelist accepts validated Analysis evidence;
- the existing Politics study packet exposes only a bounded Analysis summary;
- the existing Daily Learning Packet carries that summary into fresh Chat.

There is still no generic “store arbitrary Politics JSON” escape hatch.

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

## Landed engineering patch

The bounded implementation is now:

```text
validated Analysis evidence module
→ one additional allowed Politics private checkpoint family
→ bounded Analysis summary in existing Politics study packet
→ existing Daily Learning Packet composition
→ fresh Chat
```

Targeted executable proof covers both the legacy drill-bank contract and the durable Analysis evidence path. The proof is intentionally placed before unrelated legacy Politics audits so Analysis can be verified independently of stale branch failures elsewhere.

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
task/rubric semantics               CLOSED
legacy drill geometry               BOUND · LEGACY-ONLY
private durability extension path   LANDED
bounded Daily Packet summary        LANDED
targeted Analysis proof             PASSED
new Analysis website                REJECTED BY DEFAULT
current learner blocker             NO
2027 exact/current-affairs content  SOURCE-GATED
```

T3 is closed at the correct boundary. No additional Analysis architecture is justified now. The next semantic expansion happens only when accepted 2027 Source or real learner friction creates a concrete need.
