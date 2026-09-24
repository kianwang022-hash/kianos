# KianOS Website Current

Role: thin website engineering router. Root [CURRENT](../CURRENT.md) owns cross-program routing; this file stores no subject progress, learner facts, duplicated acceptance ledger, or second control plane. Normal study does not start here.

## Current state

The shared shell and existing subject surfaces are landed. Broad UI construction remains closed; reopen only for a concrete learner-visible defect, platform change, or explicit new need.

Historical shared-runtime provenance remains in Git history. Do not copy old PRs, workflow runs, candidate SHAs, or historical PASS narratives back into this cursor.

The managed macOS Current mirror, private checkpoint path, Daily Learning Packet relay, private control path, and External Reading source are active operational surfaces. Their live truth comes from [Current doctor](scripts/kianos-current-doctor.mjs) and the exact runtime owner, never a status copied here.

Content production remains independent: vocabulary, Xizong explanations/relations/visual assets, English sources, Politics sources, and Skills continue only through their exact content owners.

## Home / Steward / Radar UI work — active, not yet accepted

Kian reopened the integrated UI work on 2026-09-24 after clarifying the current website architecture.

Current architecture basis:
- product surface / information architecture owner: `PRODUCT_SURFACE_CONTRACT.md`;
- Steward interaction / reality-capture product owner: `STEWARD_PRODUCT_CONTRACT.md`;
- upstream day-of judgment / Personal models remain referenced from `kian-personal-os`; they are not copied into KianOS product truth;
- the website is built from GitHub `static-web/` source and uses the existing Current delivery path;
- L1 / L2 / L3 are ownership levels, not three mandatory visible navigation rows;
- Steward is an L1 destination in the shared global rail;
- Steward has no invented L2 bar;
- Today / Week / Month are Steward-local views of one time model;
- Today-local 日程 / 饮食与营养 / 训练 are workspace modes, not new global/subject navigation;
- formal implementation must inherit `Base.astro → BaseFrame.astro → sharedNavigation.mjs → shared visual tokens`.

### Current formal implementation on `main`

Formal files:
- `src/pages/steward/index.astro`
- `src/styles/steward-workspace.css`
- `src/lib/stewardWorkspaceClient.mjs`
- Steward entry in `src/lib/sharedNavigation.mjs`
- full-height shared-shell support through `BaseFrame.astro`

Current behavior:
- Today is the default view and opens to 日程;
- Today reads the existing Chat Plan presentation when available and StudyTimer actuals; it does not fabricate learner data;
- Week uses one shared time axis + seven day columns, with real StudyTimer history and current-day plan when available;
- Month is a real Monday–Sunday calendar with real study-history marks and current-day schedule detail when available;
- Nutrition / Training remain honest empty states until their existing canonical data path is integrated;
- the existing shared StudyTimerDock is reused; no parallel timer or learner ledger was created.

### Visual direction

Follow `KIAN_UI_PREFERENCES.md` + `UI_STYLE_BRIEF.md`:
- Mac landscape / Dense Calm;
- PingFang-first Chinese UI;
- readable substantial text; 15px is a visible-text floor, not a target;
- density from geometry/alignment, not tiny text;
- few cards, little decorative chrome, no backend/debug vocabulary in the ordinary foreground;
- Today / Week / Month should feel like zoom levels of one time workspace.

### Verification status

A dedicated `Steward UI Browser` workflow now exercises `/steward/` through the Astro dev server independently of the repository-wide static build. It checks L1 ownership, no fake L2, Today→Week→Month exclusivity, Today reset to 日程, Week x7 time geometry, Month calendar geometry, visible-text floor and backend-copy leakage, and saves 1512×820 screenshots.

This isolated Steward gate is the relevant functional/geometry proof for Steward. The repository-wide Astro build currently passes; the prior Xizong G1 KP-marker drift is no longer a Current blocker and must not be copied back into this router as stale status.

**Human Gate remains OPEN.** Do not claim the integrated Steward UI is visually accepted until Kian reviews a real representative Mac surface. Radar and deeper Nutrition/Training/reality-capture delivery remain later UI/runtime work after Steward's primary time workspace is stable.

## Route from the reported symptom

| Need | Exact first owner | Read further only if needed |
| --- | --- | --- |
| Site did not update / will not open | [Current doctor](scripts/kianos-current-doctor.mjs) | [sync/build](scripts/kianos-current-sync.mjs) → [static server](scripts/kianos-static-server.mjs) |
| Chat cannot see learner facts | [private Packet builder](scripts/privateDailyLearningPacket.mjs) | Packet relay → affected subject adapter |
| Plan/prediction seems wrong | [Exam Orchestrator](../EXAM_ORCHESTRATOR_CONTRACT.md) | actual subject Packet → exact Forecast owner only when used |
| Chat instruction did not apply | [control runtime](src/lib/privateControlRuntime.mjs) | control relay → exact command/native operation |
| State did not recover / one subject corrupt | [checkpoint runtime](src/lib/privateCheckpointRuntime.mjs) | affected subject checkpoint adapter / browser write owner |
| English Source / Resume differs | [English session owner](src/lib/englishSessionControl.mjs) | source identity → Resume surface |
| English whole-paper score/progress | [native exam session](src/lib/englishExamSession.mjs) | exact exam surface |
| Xizong attempts became stale | [native question evidence](src/lib/xizongQuestionAttempts.mjs) | semantic source revision → affected consumer |
| Bounded Codex task did not run | [watcher](scripts/codex-issue-watcher.mjs) | exact Issue + AGENTS execution boundary |
| Material learner-facing layout change | exact surface owner | Presentation/CSS authority → representative browser proof |

## Subject and ownership boundary

| Subject | Current owner | Engineering boundary |
| --- | --- | --- |
| English | [English Current](../content/english/CURRENT.md) | preserve native surfaces; no broad rebuild |
| Xizong | [Xizong Current](../content/xizong/CURRENT.md) | follow its live content authority; no second evidence model |
| Politics | [Politics Current](../content/politics/CURRENT.md) | reopen only for a concrete defect/new Source |
| Vocabulary | [Lexical Current](../content/lexical/CURRENT.md) | preserve active content frontier; do not mirror its cursor |
| Skills | [Skills Current](../content/skills/CURRENT.md) | generic renderer; ordinary new Skills are Content-only |

Chat interprets and plans. GitHub owns canonical content and durable rules. Subject-native Runtime owns evidence semantics; private Runtime preserves learner facts and transports instructions/receipts. Shared transport must not become scoring or strategy authority.

## Runtime boundaries

- Current builds into immutable static slots at background priority; ordinary updates switch `dist` atomically without restarting the learner server.
- One previous slot is retained for old hashed `/_astro/` assets.
- The build-impact gate may reuse the active static slot only for explicitly non-static changes, and only when that slot proves the exact pre-update base SHA. Unknown paths or an unproven/stale base fail closed to a full build.
- Exact Current runtime-owner changes may perform one controlled process/server reload so new process code actually takes effect.
- Heavy checkpoint→Daily Packet projection/publish runs in an isolated child process; Packet work must not block the learner HTTP event loop.
- Relay failure must not roll back local learner saving. A receipt proves an instruction applied, not that learning occurred.
- Live SHA, health, relay state, and source readiness come from runtime readback/doctor, not this file.

## Remaining boundaries / stop

Real-U, missing/unpublished Source, current-year authority, and authentic-modality limits remain with their native owners. Engineering proof never manufactures learner progress or missing Source truth.

Project instruction deployment and fresh-Chat teaching behavior remain owned by Personal OS; do not mirror them here.

Stop after the bounded user-visible/runtime defect is repaired and its affected interface is proven. Do not restart broad UI audits, old Freeze programs, or historical acceptance work merely because provenance exists.

Keep this router thin. If normal diagnosis starts requiring history archaeology or many unrelated reads, repair the routing/owner defect instead of adding another tracker.
