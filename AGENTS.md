# KianOS Worker Instructions

This file owns **how a Chat / Agent / worker enters and operates inside KianOS**.

It does not own project requirements, architecture, domain learning semantics, Acceptance Truth, learner progress, or product content.

The operating goal is simple:

> **Kian says what he wants to do; the worker resolves the correct scope/owner and hides repository complexity unless it is actually needed.**

---

# 1｜Intent first

Before reading a Work Cursor, classify the user's request by what they are trying to do.

```text
LEARN    use the learning system / continue studying
BUILD    construct, audit or change content / learning assets / runtime semantics
UI       change learner-facing presentation / interaction / visual implementation
CONTROL  ask for cross-scope status, priorities, blockers or project management
```

Natural language is authoritative. Do not require Kian to name these modes.

Default rule:

> **A bare learner-facing continuation such as “继续英语 / 继续政治 / 继续循环 / 继续 Translation” means LEARN unless the current conversation clearly establishes an engineering/UI task.**

Engineering words such as `内容建设 / audit / PR / CI / runtime / contract / UI / 页面 / 视觉 / implementation` may resolve BUILD or UI.

`CURRENT.md` is an **engineering Work Cursor**. It must not silently override learner intent.

Therefore:

```text
“继续英语”        → learner continuation / learner state
“继续英语 UI”     → English UI scope
“继续英语内容建设” → English BUILD scope
“英语做到哪了”     → CONTROL / status
```

---

# 2｜Small read paths

Do not reread the governance hierarchy as ritual.

## LEARN

Use the smallest learner-facing path:

```text
known domain/task
→ actual learner/runtime state or Resume owner
→ domain Learning Contract only when needed to interpret the next action
→ learn
```

Do **not** enter an engineering `CURRENT.md` merely because one exists.

For a promoted non-exam Skill, use `content/skills/CURRENT.md` → exact Skill manifest / learner asset → learn. The generic Skill renderer is a learner surface, not a new strategy owner.

### Daily learner handoff

A message containing `KIANOS_DAILY_LEARNING_HANDOFF_V1` or a `kianos.daily-learning-packet.v1` object is itself **LEARN** state.

Use it as:

```text
Daily Learning Packet
→ read factual time / capacity / subject-owned evidence
→ preserve missing evidence as unknown
→ if Kian asks to start / continue / arrange today, apply EXAM_ORCHESTRATOR_CONTRACT planning policy
→ return one valid kianos.exam.chat-plan.v1 for the same study_day
→ deliver through the existing supported private control path and verify its receipt
→ study
```

Planning follows [Exam Orchestrator §0](EXAM_ORCHESTRATOR_CONTRACT.md). Exact private delivery and recovery follow Personal OS `EXAM_CHAT_ROUTER.md`; this entry does not define another delivery procedure. Manual export/import is a degraded recovery option only, never the normal learner handoff. An unavailable relay must be stated honestly; it neither proves successful delivery nor prevents useful learning from healthy available evidence.


Do not route through root engineering `CURRENT.md` by default just because GitHub is available. Read an exact subject Learning/Content owner only when the learner question actually requires semantic/source context. BUILD / UI / CONTROL requests remain separate.

Subject-specific diagnosis/repair still uses that subject's existing typed Return contract. The Daily Packet is evidence/planning input; it is not a universal mutation packet.

## BUILD

```text
target scope CURRENT
→ exact domain Contract / canonical owner required by that cursor
→ Acceptance owner only when the acceptance claim matters
→ work
```

## UI

```text
exact UI/surface scope
→ shared visual/presentation authority that actually applies
→ exact surface owner
→ preserve list from domain/runtime owner only when needed
→ work
```

Do not load unrelated subject content to change shared presentation, and do not load broad governance to change one bounded surface.

## CONTROL

Use root `CURRENT.md` as the **single control entrypoint**, then route into only the lane/orchestrator owners needed for the requested status or decision.

### Unified task dispatch

Natural-language control requests should resolve automatically.

Examples:

```text
“看看西综主线”
→ root CURRENT
→ content/xizong/CURRENT.md
→ content/xizong/CONTENT_MAINLINE.md
→ read exact active task cursors needed to report the current task set

“看看西综 UI”
→ root CURRENT
→ content/xizong/CURRENT.md
→ active Xizong UI owner / branch state

“开始 D”
or, after a task list, “开始第一个”
→ re-read the selected task's exact CURRENT/cursor
→ read only the minimum required Contract / Acceptance / canonical owner
→ execute the task
```

The user should not need to remember file names, branch names, issue numbers, stage codes, or repository paths.

### Task ownership and update propagation

Do not duplicate exact task state into Root Control.

```text
exact task CURRENT / cursor
→ owns exact “where are we / what next”

program mainline / orchestrator
→ owns lane priority, dependency and active-task set

root CURRENT
→ owns cross-program visibility and routing only
```

### Task creation is persistent

When Kian explicitly asks to create / add / queue a project task, the task does not exist merely because Chat acknowledged it.

```text
create task request
→ resolve the narrow program / lane owner
→ write the task into the existing program mainline / exact CURRENT owner
→ commit it
→ only then report “created”
```

Use the narrowest existing owner that can represent the task. Do not create a new task registry, issue type or governance layer merely to store it.

Typical routing:

```text
new task inside an existing active lane
→ exact lane CURRENT / cursor

new queued task that changes a program's active/next task set
→ program mainline / orchestrator

cross-program task or priority that genuinely changes the whole project
→ root CURRENT in addition to the exact/program owner
```

Do not create a GitHub Issue by default just because something is called a task. Use the existing Current/Mainline owner unless Issue tracking has a separate real purpose or Kian asks for an Issue.

If persistence fails, say the task was **not created**. Never claim a durable task from Chat memory alone.

### Chat → GitHub → Codex execution envelope

Use a GitHub Issue **only when an external Codex/local executor is genuinely useful** after Chat has already resolved the semantic/product decision. The Issue is an execution envelope, not a second task registry and not a new semantic owner.

Good uses:
- local/browser/binary work Chat cannot directly execute;
- a bounded implementation whose decisions are already fixed;
- repetitive mechanical repository work;
- one task that should continue without keeping the originating Chat alive.

Do not create an Issue merely because work exists. If Chat itself can complete the bounded repository change safely in the active turn, use the normal exact owner.

When delegating, Chat creates one Issue titled:

`Codex execution: <bounded task>`

The body must also contain the machine marker:

`<!-- kian-codex-task:v1 -->`

Optional execution markers are deliberately tiny:

```text
<!-- kian-codex-runtime:local -->          # only when the task must touch this Mac / localhost / LaunchAgent / private local state
<!-- kian-codex-model:sol -->              # reasoning-heavy task; Terra is the default
<!-- kian-codex-model:astra -->
<!-- kian-codex-astra-approved-by-kian:v1 -->  # required together; Chat must obtain Kian approval first
```

Do not silently escalate to Astra. Terra / Sol may be chosen by Chat from task difficulty and expected ROI; Astra requires an explicit Kian-facing notice and approval before the Issue is made actionable.

The body should contain only the execution-relevant context:

```text
Goal
Current start point / exact owner
Decisions already made by Chat
Write-set
Must preserve / must not change
Proof required
STOP / return-to-Chat conditions
Merge / Human-Gate boundary
Return receipt
```

The canonical semantic/task state still lives in the existing Current/Mainline owner. If creating the delegated task materially changes that owner's active/next task set, update that owner in the same Chat-side dispatch. The Issue does not replace it.

Codex execution lifecycle:

```text
GitHub Issue
→ re-read main@HEAD + AGENTS.md + static-web/CURRENT.md + exact owner
→ create temporary codex/issue<N>-<slug> branch/worktree
→ execute only the bounded write-set
→ update result + exact cursor atomically when durable state changes
→ open PR with machine/browser proof and "Closes #N"
→ merge only when current owner / Human Gate permits
→ verify accepted result on fresh main@HEAD
→ remote Branch Hygiene retires merged branch
→ local hygiene retires safe local codex branch/worktree
→ compact receipt
```

Codex must not:
- treat the Issue text as authority over newer Current truth;
- broaden scope because another defect is nearby;
- force-push over concurrent work;
- keep a completed temporary branch/worktree merely as history;
- delete a dirty/unmerged/local-only worktree to make cleanup look green.

Compact completion receipt:

```text
DONE / BLOCKED
final main state
PR
proof
deviation / remaining blocker (only if any)
```

No long implementation diary is required.

Local cleanup command after accepted merge:

`npm --prefix static-web run codex:hygiene:apply`

It may delete only local branches matching `codex/issue<digits>-*` when the remote branch is already gone, the exact Issue is `CLOSED/COMPLETED`, an exact-head PR for that branch is merged, and any attached worktree is clean. The local tip must either already be contained in `origin/main` or exactly match the merged PR head (safe squash-merge case). Everything else is skipped fail-closed.

#### Low-cost local trigger + Codex executor

Do **not** wake a model merely to discover that the GitHub queue is empty.

Normal trigger / executor routing:

```text
lightweight LaunchAgent watcher (default every 5 minutes; no model)
→ read open marked `Codex execution:` Issues + open PR heads
→ no new actionable task = quiet exit, zero model invocation
→ persist and read back the bounded execution claim
→ one local Codex attempt for one task body
→ validate the bound PR_READY / BLOCKED result and exact GitHub readback
→ stop; accepted merge/closure and safe hygiene remain owner-controlled
```

The watcher owns only execution claim/deduplication metadata. Chat owns which task exists, its scope and any decision to resume it. Automatic Cloud dispatch and Cloud-to-local fallback are disabled; a configured Cloud environment does not enable them.

Attention / model defaults:
- Terra / medium is the default local executor; Chat may choose Sol / medium for worthwhile reasoning-heavy work;
- Astra requires both the request marker and Kian's explicit approval marker; an unapproved request is blocked once and must not starve ordinary tasks;
- only one watcher/executor dispatch may run at a time; network commands and the owned executor process group have bounded deadlines;
- an unchanged task body receives at most **one model attempt**, with no automatic retry, cooldown reawakening or model escalation; comments and timestamp changes do not reset the budget, and `--force` does not bypass it;
- a changed task body may receive a new bounded attempt only after Chat has resolved the scope; mutation detected during execution and legacy attempted tasks require explicit reconciliation rather than silent retry;
- persist the claim before any dispatch. An orphaned claim whose owned process group is confirmed gone becomes BLOCKED once; the same task is not retried and unrelated work may proceed;
- a live process group or unknown dispatch remains protected. Chat/Engineering reconciles the existing state and receipts; Kian is not asked to operate locks, rearm markers or queue metadata;
- accept only the structured result bound to this issue, run ID and task digest. PR_READY requires the exact open PR head; it is not DONE, accepted work or learner completion. Exit zero, an existing branch and an issue timestamp change are not results;
- publish only bounded allowlisted result fields and exact proof links, never arbitrary stdout/stderr or credential material;
- if upkeep or allowance exceeds the waiting/attention saved, use on-demand execution instead of adding another controller.

Keep the retired hourly model-based queue poller disabled. Do not re-enable it as a fallback or create a second trigger.

On a STOP condition, return the bounded BLOCKED reason and existing proof pointers. The watcher persists/readbacks the result when possible; write failure remains unproven and must not trigger another model attempt. Do not invent a substitute, generate follow-up tasks or ask Kian to collect logs. Return control to Chat.

The executor does not decide which engineering work should exist, rewrite priority, auto-merge/deploy, mutate learner state or turn the backlog into automatic work.

### Task result / cursor atomicity

When work advances:

1. update the **task artifact/result and its exact CURRENT/cursor in the same active branch / PR**;
2. do not claim the stage complete if the result changed but the cursor still points to the old next action;
3. update the program mainline only when lane stage / priority / dependency materially changes;
4. update root `CURRENT.md` only when the cross-program snapshot materially changes.

If a program mainline names an active branch / PR for the selected task, read the exact task cursor from that active ref. Do not silently fall back to `main`.

If the active ref is missing or its expected cursor cannot be resolved, fail closed and report **task cursor unresolved** instead of reconstructing progress from Chat history.

Therefore a fresh control request should **read through the owner chain and active ref when one is named**, not trust a stale copied Root summary when a child cursor has moved.

Normal target after scope resolution:

> **roughly 2–3 precise reads before effective work; 4 only when the task genuinely crosses an authority boundary.**

If a known-scope task routinely needs broad repository search, history archaeology or many unrelated documents, treat that as a routing/ownership defect.

---

# 3｜Truth boundaries

Keep these distinct:

```text
Artifact Truth    what actually exists
Acceptance Truth  what current evidence proves
Learner Truth     what Kian has actually learned/done
Work Cursor       what an engineering worker should do next
```

Hard rule:

> **Artifact ≠ Acceptance ≠ Learner; Work Cursor manufactures none of them.**

A build PASS does not mean learning-ready. Engineering readiness does not mean Kian studied it. A learner Resume does not become repository engineering Current.

---

# 4｜Current-first applies to engineering continuation

For BUILD/UI work, current canonical authority outranks stale Chat narrative.

```text
engineering continuation
→ target CURRENT
→ exact Current owner(s)
→ work
```

If Current says the old blocker is closed or the scope moved, do not continue the old Chat narrative.

For LEARN, resume from real learner/runtime evidence instead. Do not reinterpret a bare “continue” as the latest engineering cursor.

History, retired branches, old Issues, old repositories and prior implementation snapshots are not normal Current fallback. Use them only for a bounded recovery/history/rollback task.

---

# 5｜Ownership, dependency and containment

One responsibility has one canonical owner. Lower scopes may refine inherited rules but must not duplicate or contradict them.

Scheduling follows real dependency, not hierarchy:

```text
no real dependency → proceed independently
real dependency    → name the narrow owner and freeze only the affected chain
```

A cross-scope defect may be reported or escalated. It is not permission to repair unrelated siblings.

When a subject task finds a shared-platform blocker:

```text
subject worker records the blocker
→ shared owner fixes it in its own bounded scope
→ subject receives only the closure result
→ subject revalidates the affected slice
```

Do not drag another owner's debug history, CI logs or artifact archaeology into the blocked subject Chat.

---

# 6｜Minimal writes

Ordinary work changes only the owner that actually owns the requested effect plus the smallest required acceptance/cursor update.

Examples:

```text
content wording / KP / relation
→ canonical content owner

shared typography / radius / color primitive
→ shared visual owner

Politics Natural Unit geometry
→ Politics surface owner

one-page exceptional overflow
→ exact page/surface owner
```

Do not update root governance or parent routers merely to record local progress.

`main` advancing for unrelated work is not a blocker. Reconcile only for real write-set overlap, authority change, inherited-rule change or newly discovered dependency.

---

# 7｜No new governance by default

Before adding a Contract, registry, router, Current type, validator, migration layer or permanent abstraction, first try to simplify or reuse an existing owner.

A new durable governance object is allowed only when the existing owner model cannot represent a recurring real responsibility without ambiguity or duplication.

Hard default:

> **Execution friction → simplify the narrow owner first; do not answer with another governance layer.**

---

# 8｜Substantial-work context pack

For genuinely cross-layer or risky work, compress the required context before implementation:

```text
Goal
Owner / authority chain
Must preserve
Affected / not affected
Write-set
Success / stop condition
```

Carry this compressed context, not the full text of every upstream document.

For ordinary known-scope work, do not manufacture a Context Pack ceremony.

---

# 9｜Plain-language reporting

Engineering complexity stays in the backend unless Kian asks for it.

Normal progress reporting answers only what matters:

```text
现在在哪
已经完成什么
真实 blocker（没有就说没有）
下一步
是否需要 Kian 做什么
```

Do not expose branch mechanics, CI archaeology, CSS specificity or long SHA lists unless they materially affect a decision.

For CONTROL/status reporting, prefer the compact shape:

```text
Stage
Next
Blocker
Owner
Human Gate (when relevant)
```

---

# 10｜Compact operating rule

```text
understand Kian's intent
→ resolve the narrow scope
→ read the minimum current owner set
→ preserve upstream semantics
→ do the smallest correct work
→ prove the requested real effect
→ stop
```

KianOS succeeds when fresh Chats restart quickly and normal changes are cheap—not when workers can recite the repository's governance history.

## Anti-stall batch execution discipline — ACTIVE

Marker: `KIANOS_ANTI_STALL_BATCH_EXECUTION_V1`

Long-running BUILD / CONTROL work must optimize for **few high-information repository operations**, not a diary of tiny reads/writes.

Default execution shape:

```text
current-first narrow read
→ compact batch extraction
→ one staging/write bundle
→ one derived rebuild / expensive CI trigger when possible
→ one bounded readback
→ final result
```

Hard rules:

1. **Batch remote reads.** Prefer one compact owner/matrix/manifest extraction over dozens of serial per-file round trips. If many owners must be inspected, return only the fields needed for the decision; do not dump full large JSON objects into Chat unless the full object is itself the task.
2. **Batch writes.** When a task changes many bounded files under one already-decided scope, stage the semantic decisions first and land them in as few commits/triggers as practical. Do not trigger an expensive derived build after each tiny edit.
3. **Do not use Chat context as a log sink.** Large machine outputs, full catalog rows, long diffs and repeated workflow payloads should stay in GitHub/artifacts. Surface only compact counts, findings, changed owners and exact blockers.
4. **No high-frequency CI polling.** After triggering a workflow, do not repeatedly request the same status while nothing has changed. Inspect the run once, then re-read only for a meaningful state transition, a specific failing job, or the final merge decision. Never create a tight status-poll loop.
5. **Separate semantic work from mechanical transport.** Once the semantic/product decision is fixed, prefer the repository's existing mechanical executor/materializer for repetitive JSON transport/rebuilds. Chat should not manually walk every derived file unless the executor is defective.
6. **One expensive derived rebuild per coherent batch by default.** Rebuild again only after a real reconciliation mutation, not after documentation/receipt-only commits.
7. **Compact verification.** Verify the smallest decisive surface: changed owners + shared dependencies + derived manifest/count + targeted gates. Do not re-read unchanged frozen inputs merely because the Chat is long.
8. **Long Chat is not permission to restart.** If context becomes heavy, re-ground from current GitHub truth and continue from the exact durable cursor. Do not repeat completed A/C review, accepted Human Gates, or previously closed batches just to reconstruct context.
9. **If a tool call is too large, reduce payload—not correctness.** Split by meaningful batch boundary or extract only needed fields; do not fall back to one-file-at-a-time chatter.
10. **User updates stay outcome-level.** Report real findings, phase transitions and blockers. Do not narrate every low-level fetch, commit, workflow status or retry.

Exception: a safety-critical or identity-sensitive mutation may require smaller fail-closed steps. Even then, minimize repeated remote calls and keep durable receipts in GitHub.
