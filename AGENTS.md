# KianOS Current Instructions

This repository is the clean Current workspace. Do not reconstruct normal work from `kianos-legacy`, old Issues, old commits, retired releases, compatibility snapshots, or historical runtime code.

## Authority

- Source Truth is upstream evidence.
- Chat owns semantic/content judgments and approves shared learning content.
- GitHub `main@HEAD` is the single editable and readable shared Current repository state.
- Root `CURRENT.md` is the Current overview for the entire KianOS learning system. Lane manifests/continuations are child Current objects, not parallel top-level Current systems.
- `SYSTEM_CONTRACT.md` defines the KianOS-wide minimum learner-surface capabilities for both domain lanes and independently entered learner sub-lanes.
- `content/` owns shared learning assets.
- `static-web/` owns the Astro learner-facing display and interaction runtime.
- Private interaction state such as answers, progress, wrong/uncertain, comments, timing, scheduler/history, and temporary browser session state is an implementation detail of learning interaction. It is not shared Current authority and must not be written into shared Current content.
- `EXECUTION_AUTONOMY != SEMANTIC_AUTHORITY`.

## Normal chain

`Source Truth → Chat semantic/learning judgment → GitHub Current content → Astro display/interaction → learner`

Private browser or device state may support the final interaction step, but it is not a semantic owner and is not part of the shared Current chain.

Astro may transform representation and provide interaction. It must not invent, merge, silently repair, or override domain semantics.

## Shared learner-surface baseline

Every first-class learner lane and every independently entered learner sub-lane inherits the KianOS-wide capability baseline in `SYSTEM_CONTRACT.md`:

1. Current;
2. Continue;
3. Navigate / Explore;
4. Repair / Review;
5. Verify / Challenge / Transfer;
6. Return / Handoff;
7. Deferred;
8. Validation.

The capability contract is shared, but domain cognition, error taxonomy, evidence unit, scheduler, and UI shape are not required to be identical.

Examples of independently entered sub-lanes include English Reading, Cloze, Reading B, Translation, Writing, or any later task/module that receives its own learner runtime. A domain-level home satisfying a capability does not automatically make every sub-lane Ready.

When a lane or independently entered sub-lane is added or materially rebuilt, audit these capabilities. If a genuinely necessary capability is absent, do not call the surface fully learner-ready merely because its content exists or its page builds. Either make the gap active work or, when the learner explicitly postpones it, park it in the global Deferred Queue.

Shared runtime helpers/components are appropriate only when the learner decision is genuinely shared. Do not make one subject or task imitate another merely for frontend consistency.

## Current read boundary

`NORMAL_READ_AUTHORITY = main@HEAD only`.

During normal study, review, content editing, engineering, QA, and Astro operation:

- Read only the current `main@HEAD` state of this repository.
- Do not consult, search, infer from, or use old commits, tags, branches, deleted prior versions, releases, compatibility snapshots, historical Issues, historical runtime, or `kianos-legacy`.
- If a Current asset is missing, fail closed and surface the missing asset. Never fall back to history or legacy.
- A historical asset remaining in Git does not participate in Current semantics.

Normal study/review is 0 GitHub reads unless the user asks to work with GitHub-backed engineering/content state. When a GitHub read is needed, use the smallest exact Current path required.

## Recovery plane

Git history and `kianos-legacy` are recovery/reference only and are outside the normal read authority.

Historical access is permitted only when the user explicitly requests recovery, rollback, historical comparison, or historical inspection. Access only the explicitly identified historical object, extract the needed evidence or asset, return any accepted result to Current, and then resume `main@HEAD`-only operation.

Do not continue using historical material as semantic context after the explicit recovery task ends.

## Migration exception

A user-approved migration may temporarily read both:

- this repository at current `main@HEAD`; and
- the explicitly designated legacy snapshot/source.

Migration is a bounded exception, not a new normal authority. Knowledge assets may be transferred without semantic re-review when the migration scope says to preserve them. On a path/content conflict, existing/newer Current wins unless the user explicitly directs otherwise. Legacy runtime, private learner state, governance, caches, releases, generated infrastructure, and fallback mechanisms are excluded unless explicitly approved.

When migration closes, the dual-read exception closes with it.

## GitHub writes

GitHub is read-only by default. Before any mutation, present the concrete intended scope and obtain explicit user authorization. Authorization is bounded to the approved scope. Destructive cleanup, production deployment, and real private learner-state mutation require separate explicit authorization.

## Deferred work

KianOS has one repository-wide lightweight parking lot for intentionally postponed work:

- `DEFERRED.md` defines the rule;
- GitHub Issue #5, **KianOS Deferred Queue**, stores the live checklist.

This applies to every current or future KianOS lane and sub-lane, including Xizong, English, Politics, LexicalOS, Astro/runtime, Reading, Cloze, Translation, Writing, and later modules.

When the learner explicitly postpones a concrete item with real future value (`later`, `not now`, `after the mainline`, `keep for future`, or equivalent), record it briefly in Issue #5 so it cannot be lost. Group or prefix by lane when useful. Do not create separate backlog systems per lane unless the learner later asks for one.

Do not put ordinary continuation steps, speculative ideas, implementation noise, or private learner state into the Deferred Queue. Active work remains in the relevant Current owner / continuation. When deferred work becomes active again, move it back into the active lane and check the queue item off.

The learner has explicitly authorized this lightweight queue behavior repository-wide. A clear postponement instruction is sufficient authorization to add or update the corresponding Issue #5 checklist entry; do not ask for a second confirmation just to record it. This standing authorization does not permit unrelated GitHub mutations.

Rule of thumb: **if postponing it could make us accidentally lose it later, park it in Issue #5.**

## Content rules

- Each semantic knowledge object has one canonical Current owner/path.
- Update the canonical owner in place rather than keeping parallel `v1` / `v2` / `final2` Current copies merely as version history. Git history preserves prior states.
- Preserve stable object identities and provenance where present.
- Do not create a second semantic owner in UI, generated files, releases, caches, compatibility layers, or runtime status tables.
- Runtime readiness should be derived from actual Current assets and validation, not duplicated manual migration-state declarations.
- Deleting a Current owner removes it from Current authority; its continued existence in Git history does not authorize reuse.
- Exam content must preserve supplied/original passage, questions, options, and official answers as factual authority.
- LexicalOS uses L0-first governance for simple words while preserving true polysemy, familiar-new senses, high-value phrases/constructions/contrasts/confusables.
- Different English modules have different learning objects; do not reduce every error to vocabulary.
- Shared Current may define interaction semantics and learning contracts, but never store one learner's private answers, progress, notes, or history as shared content.

## Runtime boundary

Astro reads Current assets only. It may parse, validate, sort, project, render, and execute interaction flows defined by Current learning semantics, but it must not:

- read Git history, tags, branches, or legacy;
- silently substitute a historical/deleted asset;
- maintain a second semantic truth;
- invent or repair missing domain content;
- promote private learner state into shared Current content.

Missing or invalid Current dependencies must fail closed.

## Legacy boundary

`kianos-legacy` is frozen recovery/reference. It is not a dependency, continuation authority, semantic fallback, build input, or governance source for this repository.
