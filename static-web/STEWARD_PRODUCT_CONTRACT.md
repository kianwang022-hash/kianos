# Steward Product Contract

Status: APPROVED PRODUCT REQUIREMENTS · UI AND INTEGRATED RUNTIME NOT YET ACCEPTED
Updated: 2026-09-24
Semantic owner: KianOS Steward product interaction, reality-capture behavior and product acceptance boundary. It does not own Personal recovery meaning, cross-subject Chat judgment, native Health facts or learner truth.
Reasoning upstream: `kianwang022-hash/kian-personal-os/exam/roles/STEWARD.md`; planning upstream: `kianwang022-hash/kian-personal-os/EXAM_CONTROL.md`; information upstream: `kianwang022-hash/kian-personal-os/exam/roles/INTAKE.md`.
Surface split: `static-web/PRODUCT_SURFACE_CONTRACT.md`; current implementation/delivery truth: `static-web/CURRENT.md`.
The existing `kianwang022-hash/kian-personal-os/runtime/steward-console/` remains a standalone implementation/reference until the integrated replacement passes its journeys. An approved requirement is not a shipped feature.

## 0. Purpose and scope

Help Kian know what was planned, what is actually happening, what comes next, and record useful reality without leaving learning. Home, Steward, Radar, subject pages and the shared Dock are views with different jobs, not competing planners.

Preserve the full accepted scope: Today / Week / Month plus on-demand Review; schedule and actual allocation; life checklist; meals/nutrition; training/recovery; morning weight; water/coffee; optional energy/focus/notes; customizable break notes; native learning return; source-linked Radar/email attention. The **frontstage interaction shape below is now an approved requirement**; implementation may refine spacing/visual polish but must not replace the user-approved Today / Week / Month models with a different information architecture.

Chat makes judgments and resolved plans. The website executes explicit choices, records facts, calculates and renders. It does not infer a strategy merely because data or a button exists. Natural-language interaction remains valid; the website replaces repetitive presentation/reporting, not discussion or human choice.

## 1. One owner per fact

| Fact | Authority / permitted use |
|---|---|
| Subject work, attempts, scores, learning progress and native Resume | KianOS subject Runtime; never derived from a checklist or engineering production counts |
| Recorded study time and time corrections | Existing StudyTimer / native time evidence; no second timer/ledger |
| Current resolved allocation | Existing Chat Plan / Exam Control decision |
| Day/week placement, life actions and actual reality events | Steward plan/reality in the private runtime once supported |
| Raw sleep, HRV, activity and synced workout observations | Health; joined transiently, not copied into subject evidence |
| External event/invitation | Native Calendar; projection is not a second Calendar |
| Mail thread/body/read/reply state | Native Gmail/Outlook; filtered attention under INTAKE |
| Durable earned preferences / calibration conclusions | Existing Personal owners, not raw daily event history |

A task may appear by reference in a stage view, timeline and native learning page. Those are linked projections, not independent completion records. Local save, private backup, Chat-readable publication, plan application and learner completion are different states.

## 2. Plan, actual, result and time

A three-hour schedule block is an occupancy/priority WINDOW, not a mandatory continuous countdown. Several learning segments and breaks may occur within it. Finishing early, extending, resting, switching or having no plan is legitimate.

Keep these quantities distinct:
- planned clock occupancy, including transitions and breaks where budgeted;
- intended whole-day subject study minutes (`target_minutes` in the existing machine owner);
- observed timer segments and explicit corrections;
- native task results / evidence of learning.

Compare like with like. A 180-minute window and 150 recorded study minutes are not automatically a 30-minute deficit or an efficiency percentage. `target_minutes` remains a whole-study-day total, never an extra-from-now budget. Do not spend already elapsed capacity again. Meal preparation/eating/cleanup, training/change/shower and external travel also occupy time.

Timer evidence is recorded activity time, not proof of attention, comprehension or mastery. Pausing excludes future time; a checkbox cannot create time. Native timing-review/correction remains available for suspicious gaps. Off-site MarginNote/iPad study can continue under an explicitly selected native context; browser visibility alone does not determine whether study happened.

## 3. Today and timeline

Today presents one plan plus its actual trace. The currently scheduled block and actually active activity are distinct. Show both when they disagree. Never reassign an event to the scheduled subject merely because its clock slot has arrived.

Selecting a block shows its plan, actual segments, relevant notes/state and native evidence links. It exposes the appropriate action: enter/resume a supported learning task; open meal details; open the exact training prescription; or record a life activity. Past blocks are inspectable/correctable; selecting a historical block never starts its timer.

Existing Home `today_tasks` checkmarks remain UI-only under the current machine contract; the new explicit Steward actual reports must use separately validated reality semantics, never promote old check state into learner evidence.

Scheduled tasks do not reappear as independently checkable copies in a life checklist. The checklist holds untimed life items. Study-block 'finish' means ending that execution window; native task submission/completion remains native. Preserve skipped/modified/unfinished/reported-complete distinctions without inventing debt.

Unscheduled work is supported. Explicitly starting another task closes/transitions the actual activity through its owner and preserves the unchanged intended plan for comparison. An empty schedule does not block learning, capture, meals or native Resume.

A next-block reminder is quiet, deduplicated by occurrence/relevant plan revision, and never steals focus or navigates. It offers continuing the current task, starting a supported next task, or requesting adjustment. Dismissing it suppresses repeated reminders for the unchanged occurrence, not a materially changed deadline.

## 4. Global Dock and return continuity

Reuse the existing StudyTimer and shared shell. The compact Dock exposes actual activity/time, next planned item, pause/resume, quick record and access to Today. Expansion contains only short actions: energy/focus, optional note, water/coffee and break details. Meals, training editors, week/month and Radar remain full views.

Quick capture does not navigate away, reload the question, change the active subject or submit an answer. A Today peek/recording interaction must not steal the learning writer/context. A deliberate longer planning/activity switch can pause or change activity explicitly; navigation alone must not guess the intention.

One-click return requires the SUBJECT-NATIVE resume identity: task/session/attempt, object/material revision and within-task position when provided, plus route. A timer URL alone cannot guarantee the same question or unsaved draft. Preserve the pre-break/return anchor separately from a subsequently focused route. Do not add a competing resume database: use the native owner; fail safely to its supported Resume and explain the narrow loss if an exact anchor is unavailable or invalidated.

Acceptance must include question answers, draft text and scroll/location where the native surface supports them, not only returning to the same URL. Never recreate a sealed/submitted attempt or expose hidden answers to manufacture Resume success.

### Compact Dock / capture design reference

The first-approved compact Dock is the current strongest reference:
- floating overlay, draggable, remembers position, reserves **no blank layout row**;
- two-line current context: current activity/time + next planned item;
- compact actions: **暂停 / 记录 / 今日**; inside Steward, Today becomes the return action to the preserved native learning position where available;
- keep the same low-friction, compact character unless a better design clearly preserves the same mental model.

Quick record:
- compact popover;
- energy row + focus row;
- one-line optional note in the bottom action row, to the left of cancel/save;
- no visible auto-binding/backend explanation.

Pause/rest:
- timer pauses first;
- 5 / 10 / 15 / no-end options;
- optional multi-select rest-method chips plus custom method;
- one-line optional note in the bottom action row;
- title placement may be visually compact, but preserve readable typography;
- no backend/helper explanation text.

## 5. Pause, rest and optional break note

Pause takes effect immediately. Choosing a duration or writing a note happens AFTER the timer stops and is optional; cancelling the picker leaves study paused. Offer 5 / 10 / 15 minutes or no end time.

Record break identity, start/end, the pre-break native context and plan reference when known, optional reminder duration, and optional free-form description in Kian's own words. Walking, eyes closed, phone, gaming, food or doing nothing are examples, not a required taxonomy or a moral ranking. Multiple activities and custom descriptions are allowed. Notes can be added during or after the break; leaving them empty is valid.

Break expiry only makes continuation available; it never resumes study or declares recovery. Resume requires an explicit choice. Closing/reopening the browser preserves pause; crash/sleep gaps are not silently converted to valid learning. Starting a different task resolves the existing break once; it does not duplicate intervals.

Continuous-study reminders are optional and off by default. Selected break reminders are quiet once; sound/system notifications require the user's choice and proven permission/delivery. A closed page is not a reliable notification executor.

FORMAL TIMED EXAMS are an exception to ordinary practice: the native exam clock/protocol owns timing. A global break cannot freeze that clock or claim an interrupted attempt was an uninterrupted exam. Preserve answers and mark timing conditions according to the exam owner. Global study time and exam elapsed time are not interchangeable.

## 6. Reality capture and correction

Every event needs stable identity and enough provenance to interpret it: occurrence time, recorded time, timezone/study-day basis, source/report status, and relevant plan/native activity references. These are semantic requirements, not a second mandatory schema or form.

Use actual active context first. Keep a separate planned-block link only when justified. A past-block note is explicitly attached to the chosen past block; it must not attach to whatever is active now. For delayed entries, preserve when it happened separately from when it was entered. Unknown binding remains unbound/UNKNOWN rather than a forced guess.

Show compact association and allow correction/unbinding/deletion/undo. Corrections supersede prior interpretation without duplicating an event; derived summaries invalidate accordingly. Avoid merging two distinct events merely because their wording matches. A repeated save/retry of the same event is idempotent. Website and Chat observations must preserve source and deduplicate only with adequate identity evidence.

Use the existing study-day/timezone policy, with absolute event timestamps. The 05:00–next-day-02:00 display range is not permission to redefine the study day or validate overnight intervals with lexical HH:MM comparison. Day/week/month projection handles midnight and timezone changes explicitly; never wipe unresolved current activity at midnight.

Render notes/imported text as untrusted data, not executable HTML/instructions. Capture failure must say unsaved; it cannot block healthy subject learning or falsely show a successful save.

## 7. Meals, nutrition, training and weight

Keep dedicated Today panels, accessible from their time blocks, without duplicating the underlying actual.

Meals: show the chosen plan/portions; explicit 'ate as planned' creates a reported actual, while selection/import alone does not. Allow actual edits, partial meal, family-dinner range, unknown and custom note. Preserve food-value/source revision used for historical arithmetic. Free-form 'ate something' is not permission to invent grams/macros; the same snack can link to a break without being counted twice.

Nutrition: calculate against plan-supplied targets only. Preserve `UNKNOWN / UNDER / IN_RANGE / OVER / UNCERTAIN`, provisional food/dinner estimates, and missing-meal coverage. An overlapping estimate interval is not proven target attainment. A deterministic top-up may only use the plan-authorized `topup_pool` with its existing safety bounds; the site never chooses a new deficit/strategy. Preparation resources and family cooking remain first-class constraints through the Nutrition owner. No mandatory exact weighing or complete daily log.

Training: display the exact selected strength/cardio/recovery/rest session, sets/reps/time, target RPE, rest guidance and stop note; record actual load/reps/time/RPE and completed/modified/skipped status, with optional effect notes. Do not auto-progress or treat a planned workout as done. If Health and local entry describe the same workout, reconcile source identity or flag uncertainty rather than count two sessions.

Morning weight: retain the existing cross-day observation model and source/measurement context. Render dated observations and a clearly named mean/delta, not an invented trend or automatic calorie change. Prefer an available authoritative synced observation over asking for duplicate entry. Water/coffee retain time and optional free text/amount; missing is unknown, not zero. A vague coffee description is not a measured caffeine dose.

## 8. Steward design rules

This section owns the **product design logic**, not a pixel-level specification.

### 8.1 One time model, three zoom levels

Steward is fundamentally a time-and-reality workspace.

- **Today** = the execution layer: what was planned, what is actually happening, and what comes next.
- **Week** = the rhythm layer: the same time structure viewed across seven days.
- **Month** = the orientation layer: the same life/exam system viewed at calendar scale.

These are not three unrelated dashboards. They should feel like zooming the same model in and out.

The earlier Steward HTML is the strongest interaction reference for this mental model:
- Today uses a vertical day timeline;
- Week uses a shared clock with seven day columns;
- Month uses a real calendar grid.

The integrated UI may improve spacing, density, hierarchy, color, navigation, responsiveness and detail disclosure. It does **not** need to copy the old HTML literally.

### 8.2 Frontstage is for understanding and action

Backend completeness does not imply foreground completeness.

The system may internally track:
- provenance / source identity;
- confidence / UNKNOWN / coverage;
- plan revisions;
- validation state;
- recovery hypotheses;
- evidence joins.

Ordinary UI should expose only what helps Kian understand the situation or take an action.

Prefer:
- clear current state;
- next useful action;
- compact context;
- progressive disclosure on click/expand.

Avoid:
- implementation vocabulary;
- validator/status plumbing;
- diagnostic bookkeeping;
- empty panels that exist only because the backend has a field.

### 8.3 Dense Calm

Kian prefers a high-density Mac landscape workspace.

Density should come from:
- compact spacing;
- strong alignment;
- consistent row rhythm;
- using horizontal space well;
- collapsing detail until requested.

Density should **not** come from:
- tiny text;
- excessive abbreviation;
- visually noisy chips/badges;
- many decorative cards;
- permanent blank layout space reserved for floating controls.

Typography and control proportions should remain stable across related surfaces. A local visual change should not casually alter unrelated components.

### 8.4 Continuity beats navigation

The user may move between study, Today, meals, training and Radar without losing context.

Design for:
- a persistent floating Dock;
- quick pause / record without leaving the learning page;
- low-friction Today access;
- return to the native learning position when supported;
- no forced re-description of reality already recorded by the system.

The website should feel like one continuous workspace, not a collection of pages that reset context.

### 8.5 Related facts stay distinct

The UI may align these visually, but must not collapse their meanings:

- planned schedule;
- actual elapsed study time;
- native learner progress/evidence;
- subjective state;
- Health/Watch observations;
- meals/training actuals.

Example: a three-hour block, 150 recorded study minutes and a strong learning outcome are three different facts.

### 8.6 Progressive disclosure

Use the smallest useful foreground by default.

Examples:
- Today opens to the day schedule; meal/training detail is one step deeper.
- Week shows the week as time; deeper analysis belongs in on-demand review.
- Month shows a calendar orientation; clicking a date reveals its detail.
- Review appears when requested or genuinely useful, not because a permanent tab needs content.
- Radar filters external attention instead of mirroring inbox/feed volume.

### 8.7 Reference implementations, not constraints

Reference artifacts are **design evidence**, not authority over every pixel:

1. `kianwang022-hash/kian-personal-os/runtime/steward-console/index.html` and earlier Steward HTML variants — standalone interaction reference, especially Today / Week / Month; physical hosting in Personal does not transfer product ownership.
2. Other exploratory visual variants remain historical design evidence off the Current path; accepted behavior/design logic must live in this contract rather than requiring a historical branch read.
3. Human Gate screenshots/feedback — strongest evidence for density, wording and interaction feel when available to the implementing session.

Codex may redesign implementation details when it improves the product while preserving the design logic above.

### 8.8 Small set of hard semantic boundaries

Keep only these as true constraints:

- reuse native StudyTimer / learner evidence / Resume owners; do not create parallel truth systems;
- do not present planned occupancy as actual study or mastery;
- do not surface backend analysis merely to prove completeness;
- floating controls must not reserve dead layout space;
- state-changing UI must recover safely and never claim save/sync/application without real success;
- before Human Gate, run representative browser journeys and visually inspect the Mac landscape result so Kian is not used as a basic regression tester.

Review combines selected plan revisions, actual work, native learning results, state, breaks/meals/training and relevant Health when useful. Evaluation/personalization logic remains owned by `kianwang022-hash/kian-personal-os/exam/roles/REVIEW.md` and `kianwang022-hash/kian-personal-os/health/recovery/EVIDENCE.md`.

## 9. Plans, revision and shared delivery

Reuse the existing private control/checkpoint infrastructure, not a second backend, scheduler, relay or branch. A same resolved decision must produce consistent Home/Steward/Dock projections and native task bindings.

EXISTING standalone formats remain `kian.steward-plan.v2`, `kian.steward-plan-patch.v1`, `kian.steward-handoff.v2`, `kian.steward-week-review.v1`. Preserve their validators during migration: a patch names the exact base plan ID/generated_at, has a unique immutable patch ID/newer time, accepts only supported changes, rejects stale/conflicting replay; a full replacement currently requires a NEW plan_id and newer timestamp. 'Keep one plan_id and just increment revision' is not the existing contract. A future adapter can normalize versions only with an explicit tested migration.

Plans/blocks need stable correspondence to their source revision and native tasks. Where an exact task route cannot be validated, show native Resume/selection rather than inventing a task URL. Weekly/monthly planning is a reference; a future executable day plan cannot borrow today's learner basis or silently re-date old evidence.

Replanning preserves past factual execution. The still-future remainder of a started window may be changed by a new revision that retains its original intent and actual segments; never require the whole obsolete window to remain immutable, and never rewrite past work. Repeated identical plans are no-ops. Only real changes replace future guidance. Concurrent plans reconcile against the latest revision and relevant changed evidence; no force overwrite.

The current KianOS validator owns allowed command kinds. `steward.day_plan`, `radar.snapshot` and any other proposed name are NOT current supported operations. Requirements do not register them. Extend the existing owner with validated payload/basis/receipt/checkpoint/migration and corresponding tests before using a new payload.

Semantically coupled plan projections must apply as one consistent accepted version; stage/validate before publish and preserve the last complete valid version on failure. Independent Radar refresh or Calendar/mail actions are not part of that local transaction. Report partial outcomes explicitly.

Submission/readback proves a submitted payload, not a website update. The matching command ID AND hash plus APPLIED/IDEMPOTENT and the relevant applied version/effect are required. Retry lost responses by reconciliation, not blind resubmission or a fresh ID for the same action. A newer accepted plan must not be overwritten by a late old receipt. Byte-perfect delivery is not learner completion.

## 10. Readback, privacy and retention

The target is automatic private reality readback when Kian asks for 日报 / 调整 / 复盘, not manual JSON transfer. Until an actual admitted exporter/consumer exists, manual import/Handoff remains a clearly identified fallback and natural-language help remains available. File or GitHub presence alone does not prove the browser has the newest plan or Chat has the newest reality.

Expose meaningful freshness/coverage from the underlying observations, not merely a newly generated packet timestamp. Separate saved locally / backed up / available to Chat / plan applied. A truncated snapshot names its scope and retrieval path; important ongoing context must not silently disappear behind a last-N limit.

Approved target: a bounded private Steward reality area, using existing runtime persistence primitives, for Kian's intentionally entered state/notes/breaks/meal/training facts. Default raw inspection window is about 28 days. This is NOT authorization to copy raw Health, full mail bodies, transcripts, screenshots or unrelated browsing into Git. Share only the minimized authorized current projection through an existing private channel once implemented. Rich raw notes do not become permanent Git history.

A rolling window is not proof of deletion: specify and test expiry across local state, snapshots and backups before claiming purge. Corrections/deletion must not be resurrected by an older backup. Keep only necessary identity/tombstone metadata, protect live sessions/unresolved obligations and never delete another native owner's evidence to satisfy Steward retention. Expired data makes the affected analysis unavailable; no invented historical precision. No deletion or retention job is enabled by this document change.

Raw runtime collection and durable Personal calibration are separate permissions. The existing derived-calibration delegation covers earned decision-changing conclusions with provenance/uncertainty, not every event. No personal payload goes into public KianOS content, static builds, browser-visible public assets, public logs or new external accounts. Subject evidence and its basis stay unchanged. Export/backup and permission failures must be honest.

## 11. Decision and attention loop

At morning 日报, Chat reads the smallest current basis, respects the current calibration-mode boundary in `kianwang022-hash/kian-personal-os/exam/STEWARD_CURRENT.md`, resolves today and applies only supported outputs. A morning capacity hypothesis is provisional, not a medical/readiness score.

During use, local deterministic actions handle pause/resume, capture, next-item display, arithmetic and quiet reminders. A recorded 'tired' is not an instruction to automatically replan. Chat handles a requested or genuinely decision-changing adjustment using the freshest relevant evidence and only the remaining day. Keep a short reason, expected benefit, changed scope and later outcome when useful, inside existing plan/review provenance.

A website button does not invoke native ChatGPT by itself. `调整今天` must use a real authorized request/response executor or clearly bring Kian to Chat to say `调整一下`, with existing data readback supplying context. No silent model calls, automatic retries or unproved after-turn analysis. Data capture may be automatic; judgment is active-turn or separately authorized execution. No nightly analysis is promised merely because a Review page exists.

For Radar/email triggers, unbounded Needs You safety, source freshness and action lifecycle, use `kianwang022-hash/kian-personal-os/exam/roles/INTAKE.md`. Radar is not omitted from the loop and is not stuffed into the Dock. No new recurring job is authorized here.

## 12. Acceptance / migration

Before claiming the integrated version usable, prove each affected journey against actual code/browser/runtime: native learning continues with/without plan; readback identity/freshness; consistent plan apply; exact native return including draft/position; immediate pause + optional note + manual resume; formal-exam timing preservation; planned-vs-actual mismatch and unplanned activity; edit/delete/undo and delayed entry; meals/training actual-vs-plan and deduplication; midnight/week/month history; stale/conflict/replay/partial delivery; writer ownership across tabs; refresh/sleep/crash/offline/backup recovery; private-data egress; Radar/email lifecycle; requested adjustment and later evaluation.

First verify safely with isolated fixtures. Real-use calibration and actual delivery are separate proof; neither is closed by a static test, document readback or a screenshot. Do not create real mail, Calendar events, personal health records or learner attempts just to pass tests. Keep the previous supported path until its replacement is proven. Stop feature expansion after the accepted jobs are covered; UI discussion follows this behavioral contract.
