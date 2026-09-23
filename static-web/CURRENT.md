# KianOS Website Current

Role: thin website engineering router. Root [CURRENT](../CURRENT.md) owns cross-program routing; this file stores no subject progress, learner facts, duplicated acceptance ledger, or second control plane. Normal study does not start here.

## Current state

The shared shell and existing subject surfaces are landed. Broad UI construction remains closed; reopen only for a concrete learner-visible defect, platform change, or explicit new need.

Accepted shared-runtime provenance lives in [L1_SHARED_RUNTIME_CLOSURE.md](L1_SHARED_RUNTIME_CLOSURE.md) and Git history. Do not copy old PRs, workflow runs, candidate SHAs, or historical PASS narratives back into this cursor.

The managed macOS Current mirror, private checkpoint path, Daily Learning Packet relay, private control path, and External Reading source are active operational surfaces. Their live truth comes from [Current doctor](scripts/kianos-current-doctor.mjs) and the exact runtime owner, never a status copied here.

Content production remains independent: vocabulary, Xizong explanations/relations/visual assets, English sources, Politics sources, and Skills continue only through their exact content owners.

## Active Home / Steward / Radar UI preview — not shipped

Kian approved the Mac-landscape Home / Steward / Radar / global Dock upgrade on 2026-09-24 and UI work has moved from discussion into an isolated interactive preview.

Current implementation cursor:
- branch: `work/steward-ui-vnext-20260924`
- current remote head at this cursor update: `e27f6f5d92f045c217d75620622f80ffbd5b17cf`
- preview: `static-web/ui-preview/steward-vnext.html`
- `main`: **no integrated replacement UI from this preview**
- preview data: **sample only**, never learner/mail/Health truth

Current preview coverage:
- Home strategic three-subject view;
- Steward Today timeline;
- Nutrition combination + single-item + grams + deterministic macro arithmetic;
- Training actuals + future Apple Watch/Health display slot;
- Steward Week plan-vs-observed and seven-day allocation view;
- Steward Month phase / Gate / commitment / coarse-history view;
- Steward Review future-useful decision view without readiness/efficiency scoring;
- Radar `需要处理 / 值得知道`;
- floating draggable Dock and dense record/break popovers.

Still incomplete:
- final unified Mac-wide visual/interaction pass across all preview surfaces;
- explicit Kian UI Human Gate;
- exact native return/runtime integration and real data delivery.

Important Human-Gate decisions already made during preview:
- UI is high-density and clear; do not create density by shrinking ordinary visible text.
- Do not expose backend terms/field names when the user only needs the result.
- A local visual request changes only the named element; preserve unaffected typography/geometry unless Kian explicitly asks otherwise.
- Dock remains a floating/movable overlay and must not reserve a blank bottom row.
- Quick record/break surfaces stay compact; optional notes are one-line by default, not large forms.

[Surface split](https://github.com/kianwang022-hash/kian-personal-os/blob/main/HOME_PROJECTION.md), [execution contract](https://github.com/kianwang022-hash/kian-personal-os/blob/main/exam/STEWARD_CONSOLE_CONTRACT.md), and [Radar / mail semantics](https://github.com/kianwang022-hash/kian-personal-os/blob/main/exam/roles/INTAKE.md) remain the product owners. Reuse native learning, Timer, Resume, private control/checkpoint and Packet interfaces; do not create parallel state owners.

**Next:** finish the UI preview and obtain explicit Kian UI approval before runtime integration or merge to `main`. Full Steward plan/reality and Radar delivery still require registered validators/consumers and real browser/runtime acceptance; preview HTML does not make those capabilities shipped.

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
