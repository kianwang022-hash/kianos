# Exam Total Home Direct Workspace — CURRENT

Status: **CANDIDATE / DRAFT PR / DO NOT MERGE YET**  
Updated: 2026-09-20 (Asia/Shanghai)

## Current-first rule

New Chat must start from this file + current PR #559 head/status.

Do **not** inherit old Chat oral state when GitHub differs.

## Product contract fixed by Kian

Normal learner flow is:

```text
Chat / Steward decides
→ Total Home
→ one unique Next Action
→ exact subject Workspace
→ evidence
→ back to control
```

Subject Homes are **fallback / manual navigation only**.

They are **not** a required hop between Total Home and execution.

## Current integration owner

- branch: `work/exam-home-direct-workspace-20260920`
- PR: **#559** — `candidate(exam): make Total Home the only normal entry`
- base: `main`
- PR state: **Draft**
- current observed head: `3ba445197097a502c43470240f6fdfaed1e9f4e3`
- main has **not** been changed by this line.

Related bounded prototype evidence:
- #550 Xizong Chat-controlled review transport: **Human Gate READY / Draft / do not merge wholesale**
- #551 Politics Chat-controlled Memory prototype: **Human Gate READY / Draft / do not merge wholesale**
- English Chat-selected Resume/session control is already in `main`.

## What #559 is trying to reconcile

### Total Home
- learner-facing Home should show phase/Gate + allocation + **one Next Action**;
- old three-subject dashboard is not the normal execution surface;
- Subject Home links stay available only as quiet fallback.

### Shared browser control
Extend existing `kianos.control-command.v1`, not the old parallel #550 control framework.

Supported candidate operations:
- `english.session`
- `xizong.session`
- `xizong.chat_return`
- `xizong.system_wu_return`
- `politics.memory_plan`
- `exam.chat_plan`

Cross-object `session_ref` mismatch must fail closed.

### Exact routes
- Xizong Chat session → exact Memory / Practice / System Recall / Block Return route
- Xizong typed Return → exact Block/System continuation route
- English Chat session → exact Reading/Cloze/Part B/Translation/Writing/External Reading route
- Politics Chat Memory plan → exact Politics Memory workspace
- no valid Chat-selected task → native subject Resume fallback

## Important implementation decisions already made

1. **Headless route bridge**
   - Total Home must not mount full Subject Home/English Resume UIs as hidden duplicate owners.
   - use one headless subject-route bridge so each route owner is unique.

2. **Politics authority**
   - active Chat Memory plan must beat old/native Politics Resume.
   - native Politics Resume is fallback only.

3. **English off-Home transport**
   - ordinary English session validation must work even when Total Home is not open.
   - private control bridge now exposes a mechanical English session identity catalog; no answer/strategy data.

4. **Durability**
   - Xizong session/runtime/handoff/pending Return are included in existing Xizong private checkpoint owner.
   - Politics Memory current plan + Recall evidence are included in existing Politics private checkpoint owner.
   - do not resurrect the old #550 parallel private-control runtime checkpoint owner.

5. **Daily Review evidence**
   - Politics Memory Recall evidence must flow into the shared Daily Learning Packet.

6. **UI**
   - Total Home visible typography must preserve the existing macOS 16px readable floor.
   - politics Memory stylesheet was renamed to avoid being misidentified as a competing Xizong Memory visual owner.

## Real red lights already found and addressed

- Duplicate hidden `EnglishResume` DOM owner broke old Private Chat Control strict selectors.
  - repaired by headless route bridge.

- Politics old native Resume could preempt active Chat Memory.
  - route authority moved to headless bridge.

- old Xizong acceptance expected System W/U Repair ownership in component code.
  - #550 had moved real `setRepairTasks` ownership into `xizongSystemWuReturn.mjs`.
  - candidate acceptance was updated to the proven owner rather than adding a fake import.

- Xizong Memory single-style-owner audit treated `politics-memory-workspace.css` as a competing Memory stylesheet.
  - Politics style owner renamed to `politics-recall-workspace.css`.

- Home mac visual gate found visible 14px controls.
  - candidate raised Total Home visible control/fallback typography to >=16px.

- early live-control proof waited for `networkidle` even though private control polls periodically.
  - test was corrected to wait for actual Home ready state.

## Current exact red light at handoff

Latest observed `Total Home Direct Workspace Candidate` run **#35472148911** failed in:

`Prove shared control transport`

Exact assertion:

```text
actual:   'superseded'
expected: 'replaced_stale_day'
```

Location:
`static-web/scripts/test-shared-control-three-subjects.mjs` around the Politics cross-day Memory-plan staging proof.

Interpretation:
- this is currently a **test/runtime contract mismatch** around `stagePoliticsMemoryPlan()` cross-day replacement status;
- do **not** assume product logic is broken until current head is read;
- first next action is to inspect current `politicsMemoryRuntime.mjs` + exact test fixture on PR #559 head and decide whether:
  1. runtime should return `replaced_stale_day`, or
  2. the test expectation is stale and `superseded` is the intended current contract.

Do not patch blindly.

## CI state at handoff

At the time this cursor was written, several exact-head jobs were still queued/in progress.

Observed important runs around PR #559 current head:
- Total Home Direct Workspace Candidate: one run failed on the cross-day status assertion above.
- Private Chat Control: in progress.
- Final Cross-subject Regression: in progress.
- Static Web Xizong QA: in progress.
- Static Web Politics QA: in progress.
- Exam Orchestrator Current: in progress.
- Xizong Memory Workspace: queued.
- Xizong Golden Journey: queued.
- KianOS Mac Visual Gate: queued.
- Authority Consistency: pending.

**New Chat must refetch current PR head and current workflow results before acting.**

Do not reuse these statuses if GitHub has moved.

## Next Chat — first actions

1. Fetch PR #559 current head and all relevant workflow results.
2. Read this CURRENT file.
3. If direct-workspace red is still the Politics cross-day status mismatch:
   - inspect current `stagePoliticsMemoryPlan()`;
   - inspect current test fixture;
   - fix the earliest incorrect layer only.
4. Rerun/observe exact-head:
   - Total Home Direct Workspace Candidate
   - Private Chat Control
   - Final Cross-subject Regression
   - Xizong Memory Workspace
   - Xizong Golden Journey
   - KianOS Mac Visual Gate
   - Authority Consistency
5. Only after exact-head proof is green, capture/review Total Home screenshots and perform Human Gate.
6. Keep PR #559 Draft; do not merge or touch `main` before Human Gate.

## Human Gate question eventually

Judge only the learner experience:

> Chat decides → Total Home shows one Next Action → one click reaches exact Workspace → completion/evidence returns cleanly to control.

Do not judge based on repository internals or Subject Home screenshots.
