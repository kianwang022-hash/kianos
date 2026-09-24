# KianOS Project Management Contract

Status: **CURRENT**  
Scope: cross-lane execution management and delivery discipline

This contract exists to make the accepted KianOS architecture **easy to operate**.

It does not own project purpose, domain learning semantics, Artifact Truth, Acceptance Truth, Learner Truth, or lane Work Cursors.

Management objective:

> **Keep backend rigor; make normal use, modification and continuation simple.**

User-facing rule:

- Kian gives goals, feedback, constraints and real product choices.
- Engineer handles routing, owner resolution, project state, branch/PR/CI mechanics, cleanup, recovery and proof.
- Do not ask Kian to choose repository mechanics when the system can resolve them safely.
- If a real decision is needed, surface only that decision and its consequences.
- If Kian repeatedly has to remember backend state, treat that as a design defect to simplify.
- Upstream Personal requirement: `kianwang022-hash/kian-personal-os/LONG_TERM.md` owns Kian's adopted net-leverage rule. For KianOS tooling/automation/governance, include setup, verification, rework, failure recovery and maintenance in the cost; do not count moving that burden onto Kian as an improvement.

---

# 1｜Management success

A management rule is useful only when it lowers one or more of:

- continuation cost;
- change cost;
- coordination cost;
- learner friction;
- regression risk.

Engineering sophistication is not an outcome by itself.

KianOS should normally feel like:

```text
Kian says the desired effect
→ worker finds the correct owner
→ one bounded change
→ targeted proof
→ visible result
```

not:

```text
request
→ repository archaeology
→ multiple competing owners
→ broad coordination
→ repeated CI / rebase rituals
→ result eventually appears
```

---

# 2｜Three normal change paths

Most ordinary work should enter one of three paths.

## Content

```text
canonical Content / Learning owner
→ targeted validation / projection update when required
→ main
→ Current mirror
→ existing learner surface consumes the new Current
```

Ordinary content change must not require hand-editing a second copy inside page code.

## Visual

```text
shared visual primitive when truly global
OR subject/surface visual owner when local
→ representative screenshot
→ Human visual gate when taste is material
→ targeted regression
→ main
```

Do not solve visual change by editing every subject independently.

## Runtime / behavior

```text
exact behavior owner
→ preserve semantic contract
→ focused functional evidence
→ main
```

Do not encode content truth or visual policy inside runtime merely because implementation access is convenient.

---

# 3｜UI program: top-down only

The current learner-facing UI program is layered:

```text
L1 Shared Visual Foundation
→ L2 Shared Shell
→ L3 Home / cross-product surfaces
→ L4 Subject visual language
→ L5 Surface families
→ L6 page/state exceptions
```

Rules:

1. a lower layer inherits higher-layer visual decisions;
2. local task geometry may differ when cognition requires it;
3. local CSS must not silently redefine shared typography, global navigation or shared primitives;
4. a higher-layer visual defect is fixed upstream, not patched repeatedly downstream;
5. Functional/Structural PASS does not equal Visual/Human PASS;
6. a layer is not visually closed until representative real surfaces are reviewed.

The UI program does not reopen accepted Content / Learning / Runtime semantics merely for visual convenience.

---

# 4｜Change Cost Test

Every architecture/ownership cleanup must eventually make a real change cheaper.

Representative acceptance questions:

```text
“全站正文更厚一点”
→ should resolve to one shared visual owner

“改一个 KP / word sense / Politics learner payload”
→ should resolve to one canonical semantic owner

“Politics Natural Unit 右栏更窄”
→ should resolve to one Politics surface owner

“某一个 390px 页面溢出”
→ should resolve to the narrowest responsive/page owner
```

If an ordinary change still requires tracing many CSS files, editing duplicated content, or coordinating unrelated lanes, ownership is not finished even when CI is green.

Hard rule:

> **Architecture quality is measured partly by the cost of the next legitimate change.**

---

# 5｜Scope and blocker handoff

One Chat/worker owns one bounded acceptance question at a time.

When a scope discovers a blocker owned elsewhere:

```text
current scope
→ record exact blocker + required effect
→ stop local expansion
→ narrow owning scope fixes it
→ return only closure result / changed contract
→ original scope revalidates the affected slice
```

Do not make the blocked Chat follow another owner's debug process, CI logs, screenshots and branch history.

Unrelated `main` movement is not a blocker. Reconcile only for real dependency, shared-authority change or write-set overlap.

---

# 6｜Context budget

Context is a project resource.

Default known-scope entry is defined in `AGENTS.md` and should normally reach effective work after roughly 2–3 precise reads.

For substantial cross-layer work, compress upstream reading into:

```text
Goal
Owner / authority chain
Must preserve
Affected / not affected
Write-set
Success / stop condition
```

Then work from the compressed context.

Avoid putting multiple PR histories, large CI logs, browser artifacts and unrelated owner debugging into one long-running Chat. Split by real owner/slice, not by arbitrary file count.

---

# 7｜Control Tower

The Control Tower is a **read model**, not another project database.

For each relevant scope, report only:

```text
Stage
Next
Blocker
Owner
Human Gate (when relevant)
```

Detailed PR/SHA/CI information stays backend unless it changes the decision or Kian asks for it.

Whole-system status must distinguish:

```text
engineering readiness
learner progress
cross-subject scheduling/readiness
```

Never infer learner progress from engineering PASS.

---

# 8｜Delivery path

Accepted repository changes land on GitHub `main`.

The intended normal delivery path remains:

```text
Chat edits the correct canonical owner
→ accepted change lands on main
→ repository-wide Current mirror updates
→ Astro consumes the exact Current
→ Kian sees the change without manual Git work
```

The local Current mirror is a delivery projection, not a second Truth owner.

Kian should not normally need to choose branches, pull manually, restart Astro, or edit a duplicate webpage copy.

---

# 9｜Completion means requested effect

These are evidence, not automatic completion:

- file created;
- code refactored;
- PR merged;
- CI green;
- browser test green;
- visual owner consolidated.

Completion language must match the requested effect.

Examples:

- visual task → representative surface is genuinely visually acceptable;
- sync task → main change reaches the real learner site automatically;
- content task → canonical change is consumed without page-specific duplicate editing;
- ownership task → next legitimate modification is materially cheaper.

Stop once the bounded effect is good enough. Do not enter endless polish or architecture perfection.

---

# 10｜Governance growth is default-denied

Do not answer ordinary friction with another Contract, router, registry, Current class, validator, status layer or abstraction.

Before adding durable governance, prove:

1. a recurring real responsibility is not representable by an existing owner;
2. reuse/simplification would create ambiguity or duplicate Truth;
3. the new object lowers long-term continuation or change cost.

Otherwise, simplify the narrow existing owner.

---

# 11｜Engineering stop condition

KianOS is a learning product, not a permanent software-construction project.

Large-scale engineering should close when the system is:

- learning-correct enough for real use;
- visually acceptable for daily use;
- stable enough for normal work;
- cheap to change through clear owners.

After that, default behavior is:

```text
real learner use
→ observe real friction
→ reopen only the smallest responsible owner
```

Do not continue broad construction merely because further architectural neatness is possible.


---

# 12｜Detailed worker execution policy

These details are loaded for CONTROL / delegated execution / substantial engineering only. They stay off the ordinary LEARN / USE / narrow BUILD hot path.

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

### Cross-Chat implementation promotion

When another Chat has already resolved an accepted semantic/personal/research decision into an existing source owner, KianOS should receive only one thin pointer in the existing target Current/Mainline. It must not copy the conversation or source truth.

Minimum pointer:

```text
requested effect
source owner + relevant revision
target scope when known
must-preserve / unresolved choice only if decision-critical
```

Engineer resolves the live target owner and design chain from there. If the source changed materially, reconcile it before implementation. Closing implementation removes/advances the work cursor; the resulting KianOS owner becomes implementation truth while the upstream decision remains upstream.

### Autonomous engineering frontier

Engineer is not a passive ticket worker. **Only during an active, user-triggered engineering/project-management session**, it may proactively inspect the current project frontier and choose the highest-leverage system question without waiting for Kian to enumerate every defect. No active Chat/task means no autonomous maintenance; background or scheduled maintenance exists only when Kian explicitly creates a supported automation.

Default loop:

```text
persistent project anchor / current owner
→ inspect real use/change-cost/drift surface
→ self-attack the current design
→ identify one high-leverage finding
→ classify BLOCKER / UPSTREAM_CHANGE / DEFERRED / ABSORBED
→ fix or propose
→ targeted proof
→ update existing owner/Issue only if state materially changed
→ continue while marginal value remains high
```

High-value inspection targets include duplicate authority, manual synchronization, stale Current/history leakage, unexpectedly expensive legitimate changes, broken owner→consumer paths, repeated local patches, dead execution machinery, and real-use friction that reveals an architectural mismatch.

Standing delegation:
- correctness, drift, dead/stale machinery, owner cleanup and bounded maintainability repairs that preserve accepted product semantics may be fixed autonomously;
- a new capability already implied by an accepted requirement may be designed/implemented when the owner and effect are clear;
- changes that materially choose Kian's product behavior, workflow, visual taste, values or trade-offs must be surfaced for Kian's decision before they become accepted product truth.

Do not persist every observation as backlog. A finding earns durable state only when it changes Current/Next/Blocker, is a real deferred item, or has been accepted for implementation. Otherwise absorb it and keep the control plane small.

Within Engineer, an otherwise unqualified short continuation such as `继续`, `a`, `.` or `p` means autonomously advance the current persistent project/frontier. Do not ask Kian for the next microtask when the Current owner already provides one. The run stops with the reply/active task; do not imply continued background work.

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

**Quota-aware default: manual pickup.** Creating the Issue prepares durable execution context but does not spend Codex allowance by itself. Kian may open Codex and say:

`推进 GitHub 当前工程任务`

Codex must resolve the current execution Issue and canonical owners from GitHub; Kian does not copy/paste the task body, PR state, logs or prior Chat context.

Only when Kian explicitly wants unattended/automatic Codex dispatch should Chat add the watcher marker:

`<!-- kian-codex-task:v1 -->`

Without that marker, the installed watcher ignores the Issue and consumes no model call. Optional execution markers remain deliberately tiny:

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

After Codex works, Chat/Engineer reads GitHub directly (Issue, PR, commits, checks and compact proof) for review/acceptance. Kian is never the transport layer between Codex and Chat. If GitHub does not contain enough evidence, Chat asks Codex/the execution task to produce the missing bounded proof rather than asking Kian to summarize what happened.

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

### Remote Desktop Commander: batch mechanical work, keep judgment in Chat

Remote is a local execution transport, not a second semantic owner.

Use it only when the task needs local truth or local capability: worktrees, files, localhost/runtime, binary material, bulk mechanical transforms, validators, builds, or a bounded local executor. Public-web research should stay on Web when Web can do it; GitHub remains canonical for repository truth.

Default operating shape:

```text
Chat / Sol decides what must be understood or changed
→ one bounded Remote evidence/snapshot phase
→ Chat / Sol makes semantic decisions
→ one bounded Remote apply phase when needed
→ one bounded Remote verify/readback phase
```

Do not turn one bounded phase into a long series of tiny Remote calls when the same mechanical work can be safely bundled. In particular:

- prefer one repo snapshot over separate HEAD / branch / status / upstream / worktree queries;
- prefer one bounded evidence packet over repeated grep/read/grep/read loops;
- compose coherent content/mutation batches in Chat before writing instead of write-per-unit;
- reuse existing materializers, validators, QA and build commands instead of creating another runner framework;
- start a long local process once. Use a long blocking read or one later status read; do not busy-poll PID / `ps` / temp files every few seconds;
- keep full logs on disk and return compact status/tails first. Read full logs only for a failure or a real diagnostic need;
- after an interrupted Chat, inspect current Git/local state and recent Remote call history when available before repeating a mutating action.

Thin helpers exist only to reduce transport chatter:

```bash
npm run remote:snapshot -- --repo <worktree>
npm run remote:packet -- --repo <worktree> [--file PATH] [--range PATH:START:END] [--scope DIR --grep REGEX]
npm run remote:verify -- --repo <worktree> --cmd '<existing validator/build command>' [--cmd '...']
```

These helpers may collect, execute and summarize. They must not decide medical meaning, learner state, product policy, acceptance, task priority, or whether a semantic relation is safe.

Use a helper only when it is cheaper than the direct operation. One simple local command should remain one simple local command.

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


---

## Hot-path verification budget

Routine content production must optimize for bounded correctness, not repository-wide reassurance.

For canonical content changes:

```text
exact owner read
→ bounded mutation
→ changed-owner / dependency QA
→ durable commit
→ continue production
```

Hard rules:

- GitHub is the default repository truth and write surface; do not route ordinary GitHub reads/writes through Remote Desktop Commander.
- Remote is reserved for local-only capability: worktrees, localhost, builds, processes, binary/local files, or a bounded local executor.
- A routine semantic window must not run full-repository audits, full learner-object materialization, full Astro builds, or browser acceptance unless the exact current owner declares that window a checkpoint or a renderer/runtime defect requires it.
- Long validators run once at their declared checkpoint. Do not duplicate the same proof in Chat, Remote, PR CI, and post-merge CI.
- Website delivery follows merged `main` asynchronously through Current. Content production does not wait for Current/Astro completion before beginning the next independent semantic window.
- If a cheap targeted validator and a historical full validator disagree about whether the full validator belongs on the hot path, the current domain owner decides; historical workflow existence is not authority.
