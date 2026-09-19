# Exam Total Home Direct Workspace — CURRENT

Status: **MERGED / CURRENT**  
Updated: 2026-09-20 (Asia/Shanghai)

## Current-first rule

New Chat must start from this file + current PR #559 head/status.

Do **not** inherit old Chat oral state when GitHub differs.

## Product contract fixed by Kian

Normal learner flow is:

```text
Chat / Steward decides
→ existing Total Home
→ existing right-side「下一步」
→ exact existing subject function page
→ evidence
→ back to control
```

The key boundary is:

> **Do not redesign Total Home. Only connect the existing right-side scheduler / Next Action to Chat-controlled exact routes.**

## Learner-facing UI boundary

These learner-facing owners remain exactly the same as `main`:

- `static-web/src/pages/index.astro`
- `static-web/src/styles/home-workbench.css`
- `static-web/src/layouts/BaseFrame.astro`
- `static-web/src/components/XizongHomeTools.astro`
- `static-web/src/components/PoliticsHomeTools.astro`

Therefore:

- left Xizong / English / Politics surfaces remain visible and native;
- Subject Homes remain available for manual browsing/navigation;
- Chat does **not** repurpose the left Xizong or Politics Continue cards;
- there is no replacement Home UI;
- there is no parallel/headless route owner.

## Right-side integration owner

The Total Home integration is intentionally narrow:

### `ExamOrchestratorHome.astro`

- keeps the existing visible right-side UI;
- adds only hidden mechanical identity data needed to validate Politics Memory routing.

### `examOrchestratorClient.mjs`

- reads the current Chat Plan;
- resolves the exact Chat-selected route for the right-side Next Action;
- binds Xizong / Politics routes to the exact `session_ref`;
- fails closed on stale/mismatched session identity;
- falls back to the native subject Continue route when no valid Chat-controlled route exists;
- refreshes the already-open Home when live Chat control arrives.

## Shared browser control

The candidate extends existing `kianos.control-command.v1`.

Supported operations:

- `english.session`
- `xizong.session`
- `xizong.chat_return`
- `xizong.system_wu_return`
- `politics.memory_plan`
- `exam.chat_plan`

This is shared transport only. It does not unify the three subjects' learning semantics.

## Exact route behavior

### Xizong

Chat-selected Xizong work can resolve directly to existing:

- Memory Review
- Practice Set
- System Recall
- Repair Task
- typed Block Return / System W-U Return

The left Xizong Continue card remains native.

### English

Existing English session control resolves the exact current task, including:

- Reading A
- Cloze
- Part B
- Translation
- Writing
- External Reading

### Politics

A valid active Politics Memory plan resolves the right-side Next Action directly to the existing Politics Memory function page.

The left Politics Continue card remains native.

## Evidence / durability

The candidate preserves the already-proved subject-native evidence paths and adds only the minimum shared control/daily-packet wiring needed for Chat-controlled execution.

Important retained boundaries:

- Xizong session/runtime/typed Return durability stays in Xizong-owned checkpoint logic;
- Politics Memory plan + recall evidence stays in Politics-owned checkpoint logic;
- Politics Memory recall evidence can flow into the shared Daily Learning Packet;
- no parallel private-control checkpoint owner is introduced.

## Human Gate result

Kian reviewed the real Current Home at:

```text
http://127.0.0.1:4321/
```

and explicitly approved the product direction on 2026-09-20.

Human Gate PASS means:

> Keep the current Home UI. Connect only the existing right-side function interface so Chat can set the exact Next Action and one click enters an already-built function page.

## Exact-head proof

Last code-tested head before this documentation-only cursor commit:

`3ff6c7795b1c7bb360261be88ee2b1c301ed77be`

PASS on that exact code head:

- Total Home Direct Workspace Candidate
  - shared control transport PASS
  - build PASS
  - Xizong exact direct route PASS
  - Xizong typed Return exact direct route PASS
  - English exact direct route PASS
  - Politics Memory exact direct route PASS
  - existing three-subject Home preserved PASS
  - no replacement fallback Home UI PASS
  - one right-side Next Action PASS
  - no parallel headless route owner PASS
  - left Xizong Continue not repurposed by Chat PASS
  - left Politics Continue not repurposed by Chat PASS
  - live Chat control updates the already-open Home PASS
- Private Chat Control PASS
- Final Cross-subject Regression PASS
- Exam Orchestrator Current PASS
- Xizong Memory Workspace PASS
- Semantic Base Validity PASS
- Authority Consistency PASS
- Home Mac visual capture PASS

The repository-wide Mac Visual workflow remains red only at the pre-existing downstream Xizong Block visual capture; the Home visual step itself is PASS.

Known unrelated broad reds remain outside this integration scope:

- Xizong A1 evidence acceptance: `stable-question-forced-to-repair`
- Xizong A2 runtime acceptance: `block-initial-state`
- Politics Ethics content closure: `ROOT_MANIFEST_NOT_CONTENT_CLOSED`

Do not expand this Total Home integration to repair those subject-learning/content debts.

## Merge result

PR: **#559**  
Human Gate: **PASS**  
Merged into `main`: **2026-09-20 (Asia/Shanghai)**  
Merge commit: `f25d6438ea4c160374e2ba50ea7ec44e3881f7d5`

Current product contract:

- GitHub `main` is the canonical Current source;
- Kian's `~/KianOS-current` mirror auto-syncs from `main`;
- learner-facing Home remains visually unchanged;
- the existing right-side Next Action now gains the Chat-controlled exact-route behavior;
- do not reopen #559 or rebuild the Home UI unless a new concrete defect is found.
