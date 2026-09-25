# KianOS Website Current

Role: **website implementation / delivery Work Cursor and symptom router only**.

Root [CURRENT](../CURRENT.md) owns cross-program routing. Product semantics live in exact product owners; visual rules live in exact visual owners; Acceptance lives in exact Acceptance owners. This file stores no learner truth, subject progress, product-design duplicate, acceptance ledger or historical closure narrative.

## Current implementation surface

The shared shell, existing subject surfaces, managed macOS Current delivery, private checkpoint path, Daily Learning Packet relay, private control path and External Reading runtime are active implementation surfaces on `main`.

Live operational truth comes from the exact runtime owner and [Current doctor](scripts/kianos-current-doctor.mjs), not from copied status here.

### Steward

Implementation entrypoints:

- product surface split → `PRODUCT_SURFACE_CONTRACT.md`;
- Steward behavior / reality-capture semantics / product acceptance → `STEWARD_PRODUCT_CONTRACT.md`;
- visual requirements → `KIAN_UI_PREFERENCES.md` + `UI_STYLE_BRIEF.md`;
- page → `src/pages/steward/index.astro`;
- client → `src/lib/stewardWorkspaceClient.mjs`;
- styles → `src/styles/steward-workspace.css`;
- shared navigation/shell → registered Shared Platform owners.

The integrated Steward time workspace is implemented on `main`. Current implementation uses the existing Chat Plan / StudyTimer inputs and shared StudyTimerDock. The Dock supports bounded Recovery reality capture — immediate Pause, optional rest duration/method/note, explicit Resume, optional re-entry outcome — and that same private reality is available to Steward Today and the existing private Daily Packet. PR #959 adds the bounded Capacity Projection on the existing Chat Plan and a real Steward Today consumer: current capacity → plain-language evidence basis → current load → action → recheck, joined visually with the same break/re-entry reality. Raw Health remains Health-owned and long-run calibration remains Personal-owned; KianOS owns only this current product projection and execution evidence. Readiness/recovery/debt scores remain invalid and there is no automatic replanning. Nutrition / Training and other richer reality inputs remain honest missing/empty states rather than invented data.

Do not copy product requirements, layout rules or Human-Gate verdicts into this cursor. Read those claims from their exact owners.

### Remaining website implementation work

Only explicit current product/runtime needs reopen website construction. Bounded Steward Recovery reality already has a proven native consumer path through the private Daily Packet; broader Steward/Radar/meal/training/reality-delivery requirements remain claim-scoped and reopen implementation only when their exact product owner still lacks a real consumer. Enter the applicable product owner first, then change only the real consumer/runtime dependency.

Content production remains independent and continues through the exact English / Xizong / Politics / Lexical / Skills owners.

## Route from symptom

| Need | Exact first owner | Read further only if needed |
| --- | --- | --- |
| Site did not update / will not open | [Current doctor](scripts/kianos-current-doctor.mjs) | [sync/build](scripts/kianos-current-sync.mjs) → [static server](scripts/kianos-static-server.mjs) |
| Chat cannot see learner facts | [private Packet builder](scripts/privateDailyLearningPacket.mjs) | Packet relay → affected subject adapter |
| Chat instruction did not apply | [control runtime](src/lib/privateControlRuntime.mjs) | control relay → exact command/native operation |
| State did not recover / one subject corrupt | [checkpoint runtime](src/lib/privateCheckpointRuntime.mjs) | affected subject checkpoint adapter / browser write owner |
| Steward behavior/design is wrong | `STEWARD_PRODUCT_CONTRACT.md` | exact page/client/runtime owner |
| Steward visual/layout is wrong | `KIAN_UI_PREFERENCES.md` + `UI_STYLE_BRIEF.md` | exact page/styles + representative browser proof |
| Plan/orchestration policy seems wrong | [Exam Orchestrator](../EXAM_ORCHESTRATOR_CONTRACT.md) | actual subject Packet / exact subject owner |
| English Source / Resume differs | [English session owner](src/lib/englishSessionControl.mjs) | source identity → Resume surface |
| English whole-paper score/progress differs | [native exam session](src/lib/englishExamSession.mjs) | exact exam surface |
| Xizong attempts became stale | [native question evidence](src/lib/xizongQuestionAttempts.mjs) | semantic source revision → affected consumer |
| Bounded Codex task did not run | [watcher](scripts/codex-issue-watcher.mjs) | exact Issue + AGENTS execution boundary |

## Runtime boundaries

- GitHub `main` is the durable shared asset/Current source; the Mac Current mirror is delivery state, not semantic authority.
- Current separates the mutable control mirror from the immutable served release. Static/content/runtime-impacting changes build and validate a candidate before atomic promotion; a failed build/readiness attempt preserves last-known-good delivery.
- A proven control-only change may advance the mirror without rebuilding or switching the active release. Status exposes the newer `control_sha` separately while browser/runtime freshness remains pinned to the unchanged served-release `sha`. Impact classification is based on the currently active served release identity, never a stale legacy `dist` artifact in the mutable control checkout.
- Exact runtime-owner changes may perform only their admitted controlled reload/restart behavior.
- Private learner/control transport remains separate from public canonical Content.
- Relay failure must not roll back local learner saving.
- A receipt proves the named application/result only; it does not prove learning, product acceptance or user success.
- Live SHA, process health, relay state and private-source readiness come from runtime readback/doctor.

## Stop / reopen

Normal learning/use bypasses this file.

For BUILD/CONTROL, enter the smallest owner named above, repair the bounded user-visible/runtime defect, run the smallest decisive proof, update only the implementation cursor if the implementation state materially changed, then stop.

Do not restart broad UI audits, historical Freeze programs, old candidate branches or acceptance archaeology merely because they exist. If normal diagnosis requires broad history or many unrelated reads, repair the owner/routing defect instead of adding another tracker.
