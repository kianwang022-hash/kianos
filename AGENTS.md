# KianOS Worker Instructions

This file owns only **how a Chat / Agent / worker enters KianOS and finds the right owner**.

It does not own project requirements, architecture, domain semantics, Acceptance Truth, learner progress, branch policy, or detailed execution machinery.

Goal:

> **Kian says what he wants; the worker resolves the smallest correct scope, reads only the owners that can change the answer, does the bounded work, proves the real effect, and stops.**

---

# 1｜Intent first

Classify the user's actual job before reading an engineering cursor:

```text
LEARN    use / continue a learning capability; inspect the learner's actual progress / Resume
USE      use a non-learning KianOS product or private runtime state
BUILD    construct or change Rule / Content / product / runtime semantics
AUDIT    adversarially verify an accepted claim/capability against its real consumer; may repair confirmed defects without silently changing accepted meaning
UI       change product-facing presentation / interaction
CONTROL  system / engineering / cross-scope status, priority, blocker, task or project management
```

Natural language is authoritative; Kian does not need to name the mode.

Examples:

```text
继续英语                 → LEARN
英语做到哪了             → LEARN (read actual learner/runtime state or Resume)
看看今天的 Steward       → USE
优化 Steward             → BUILD
改 Steward UI            → UI
继续英语内容建设         → BUILD
英语内容建设做到哪了     → CONTROL
西综工程现在到哪了       → CONTROL
```

A bare learner continuation stays LEARN unless the current conversation clearly establishes engineering work. A question about **what Kian has actually learned / attempted / resumed** is also LEARN and must read learner/runtime evidence rather than an engineering Current. CONTROL is for system/build/project status or cross-scope coordination. A normal product-use request stays USE unless Kian asks to redesign/debug/manage it.

**CBA is optional vocabulary, not a routing gate.** If Kian explicitly says `CBA` or the current discussion is already using that lens, read `ARCHITECTURE.md §0.5`. Do not force ordinary work through CREATE / BUILD / AUDIT labels, and do not let CBA override the shortest correct owner/consumer path.

---

# 2｜Small read paths

## LEARN

```text
known domain/task + actual current conversation
→ new learning at an explicit target: current subject Chat-learning entry
→ continuation: restore the actual teaching position; read learner evidence / Resume when needed
→ exact current learning/content owners for that target
→ learn
```

For Chat learning, use [Xizong's existing learner reading entry](content/xizong/knowledge/learner/README.md) or [Politics Interaction §0](content/politics/INTERACTION_CONTRACT.md). These route the subject's saved teaching behavior and relevant current content. A new lesson at an explicit target does not need a private-progress search merely to begin. A question about actual learner progress still requires learner/runtime evidence; missing teaching history remains unknown. Do not enter root engineering `CURRENT.md` merely because it exists.

A Daily Learning Packet / `KIANOS_DAILY_LEARNING_HANDOFF_V1` is learner evidence/planning input, not an engineering cursor. Use the current subject evidence and Exam/Chat planning boundary; preserve UNKNOWN and use the existing private control path only when execution is authorized.

## USE

```text
known product/surface
→ actual private runtime state or exact product owner
→ Rule / Model only when interpretation is needed
→ use
```

Do not route ordinary Steward/product use through engineering Current. If use exposes a defect, route only the defect to BUILD/UI. Raw reality stays with its native Runtime/source; open-ended personal interpretation returns to Chat / Personal.

Chat may execute BUILD/UI/CONTROL work directly when the task is bounded and the active context remains sufficient. Codex is an optional execution extension, not a mandatory handoff. Delegate when doing so reduces execution/context cost without losing semantic control.

## BUILD

```text
target scope CURRENT
→ applicable Rule / Model / domain design owner
→ exact canonical object + affected consumer
→ if the affected consumer is Website, use the existing local checkout + Candidate for iterative real-consumer proof
→ Acceptance owner only when the claim matters
→ one coherent durable change
```

For a material change, automatically apply
[Change continuity](AUTHORITY_INHERITANCE_CONTRACT.md#31-change-continuity):

```text
user outcome
→ parent Rule / Model
→ exact domain/design owner
→ affected Content / Visual / Engineering (including Runtime) responsibility
→ actual consumer
→ smallest justified delta
→ verify affected behavior
```

Read the **relevant design chain**, not the whole repository. A Current cursor or easy-to-edit implementation is never the full design by itself.

For learner-facing Website BUILD as well as UI work, do not use GitHub main / Stable 4321 as the micro-iteration surface. Reuse the current local checkout and Candidate 4322 when available; make the bounded canonical/consumer change locally, inspect the real affected surface, then commit/push the accepted coherent result. If local Candidate capability is unavailable, do not claim Fast-Lane proof.

If an upstream owner changes during the task, apply
[Change propagation](AUTHORITY_INHERITANCE_CONTRACT.md#32-change-propagation-and-dependency-freshness)
only to real dependents; do not restart unrelated accepted work.

## AUDIT

```text
accepted claim / meaning
→ applicable Acceptance owner or exact claim boundary
→ actual artifact + real consumer/state
→ adversarial attack
→ challenge the diagnosis / test / oracle / history before calling a product defect
→ confirmed defect: smallest responsible repair + affected replay
→ stop when the audited claim is established, falsified or genuinely blocked
```

AUDIT is verification, not a second CREATE pass.

- Freeze the meaning being audited unless evidence proves that meaning itself is wrong or unresolved.
- A confirmed implementation/correctness defect may be repaired inline in the same task when the accepted meaning is unchanged.
- If the repair requires changing product/learning/visual meaning, leave AUDIT and reopen the responsible product decision; do not silently move the acceptance standard.
- Independence is a property only when the applicable Acceptance owner explicitly requires a fresh/independent reviewer. Ordinary AUDIT does not require another Chat, Issue or worker.
- Synthetic/build/browser evidence proves only its named claim. Real learner/user validation remains separate.
- Do not widen a bounded audit into repository archaeology merely because historical audit assets exist.

### Entering from another Chat Project

A promoted request from Personal / Study / StudyHub / Steward / Review should arrive as a **thin implementation pointer**, not a copied conversation.

```text
implementation pointer
→ source decision owner + relevant revision
→ current target KianOS owner
→ relevant design chain
→ smallest justified implementation
```

Re-read the source owner when its revision matters. If it materially changed, reconcile before mutation. The pointer is routing only; the originating owner keeps the semantic/personal/research truth.

Do not ask Kian to restate context already recoverable from GitHub. Do not create a new handoff document when an existing Current/Mainline can carry the pointer.

## UI

```text
static-web/KIAN_UI_PREFERENCES.md
→ static-web/UI_STYLE_BRIEF.md when shared visual rules matter
→ exact surface/product owner
→ existing layout/component/styles
→ Website Candidate Runtime for iterative proof
→ work
```

`KIAN_UI_PREFERENCES.md` owns accepted **KianOS visual requirements + bounded preference evidence**, not Kian's general personal preference truth.

For ordinary Website UI iteration, use the existing local checkout and Candidate Runtime: sync current main, run cd static-web && npm run candidate:serve, iterate on http://127.0.0.1:4322/, and only after the bounded result is accepted commit/push one coherent change. Candidate is http://127.0.0.1:4322/; http://127.0.0.1:4321/ Stable is not a scratch preview. Candidate state is not learner/execution truth.

Material UI change still inherits BUILD change continuity. Accepted surface geometry is not reopened merely because CSS/component code is being refactored.

## CONTROL

```text
root CURRENT
→ exact program/domain Current
→ PROJECT_MANAGEMENT_CONTRACT.md when coordination/execution policy matters
→ exact task owner
```

For a Codex session started with natural language such as `推进 GitHub 当前工程任务`:

```text
current repo main@HEAD
→ AGENTS.md
→ current/open Codex execution Issue selected by Current/project state
→ exact canonical owner(s)
→ bounded implementation
→ PR / proof / blocker back to GitHub
```

**Persistent control routing:** `继续` / `a` / `.` / `p` stays on the bound native task. Re-enter global routing only when no anchor is bound, Kian explicitly switches, canonical truth closes/retires/replaces it, or it becomes unreadable; a blocker does not clear the binding. Continuation, revalidation, batching and stop mechanics are owned by [Project Management — Persistent task binding + revalidation budget](PROJECT_MANAGEMENT_CONTRACT.md#persistent-task-binding--revalidation-budget), not duplicated here.

Do not ask Kian to paste the Issue body, previous Chat discussion, PR diff or execution receipt when GitHub can provide it. Manual pickup is the quota-aware default; automatic watcher dispatch is opt-in via the execution marker defined in `PROJECT_MANAGEMENT_CONTRACT.md`.

Detailed task dispatch, GitHub Issue/Codex execution, Remote usage, batching, cursor atomicity, context budget and reporting discipline live in
[PROJECT_MANAGEMENT_CONTRACT.md](PROJECT_MANAGEMENT_CONTRACT.md), not here.

Task disk lifecycle: reuse the bound checkout; when isolation is necessary use `npm --prefix static-web run task:workspace -- --branch <task-branch> --path <absolute-path> --sparse <needed-directory>` (repeat `--sparse`, or explicitly choose `--full`). After accepted merge, run scoped local hygiene from a retained checkout; temporary whole-source snapshots belong in a task-owned `try/finally` lifetime. Details and safety boundaries live in [Project Management](PROJECT_MANAGEMENT_CONTRACT.md#local-task-disk-lifecycle).

Branch retirement lives in [BRANCH_LIFECYCLE.md](BRANCH_LIFECYCLE.md).
Concurrent-main validity lives in [SEMANTIC_BASE_VALIDITY.md](SEMANTIC_BASE_VALIDITY.md).

---

# 3｜Permanent operating boundaries

Keep these truth classes distinct:

```text
Artifact Truth
Acceptance Truth
Learner / Execution Truth
Work Cursor
Derived Read Model
Presentation
```

One fact has one canonical owner. Other layers reference, derive, adapt or refine it.

For ownership/inheritance, derived freshness, Current-vs-History and closure consistency, use
[AUTHORITY_INHERITANCE_CONTRACT.md](AUTHORITY_INHERITANCE_CONTRACT.md).

Hard defaults:

- current canonical authority outranks stale Chat/history;
- independent scopes proceed independently;
- one blocker freezes only its real dependency chain;
- ordinary work changes only the owner that owns the requested effect plus the smallest required acceptance/cursor update;
- GitHub is repository truth; Remote is local execution transport only;
- do not create another Contract/registry/router/ledger when an existing owner or smaller repair is enough;
- history/retired assets are not normal fallback;
- missing evidence degrades only the dependent claim;
- implementation/build success never manufactures learner or personal truth.

---

# 4｜Context discipline

Context is a working set, not a log sink.

Known-scope work should normally reach the responsible owner in roughly **2–3 precise reads**. More reads are justified only by real evidence/authority boundaries, not by repository size.

For substantial cross-layer work, compress the basis to:

```text
Goal
Owner / authority chain
Must preserve
Affected / not affected
Write-set
Success / stop condition
```

Then carry that compressed basis instead of upstream documents, CI logs, branch history or unrelated sibling state.

A long Chat is not permission to restart. Re-ground from current owners and the durable cursor.

---

# 5｜Verification and stop

Use the smallest proof that can establish the requested effect:

```text
exact owner read
→ bounded mutation
→ affected-owner / real-dependency verification
→ durable readback / checkpoint
→ continue the bound task, or stop at its real stop condition
```

Do not run a full-repository audit/build/browser gate for a routine local change unless its current owner or actual defect requires it.

For learner-facing visual changes, use representative real-surface proof and the applicable Human Gate. For semantic/domain changes, engineering green is not semantic acceptance.

Normal reporting is outcome-level:

```text
现在在哪
完成了什么
真实 blocker（没有就说没有）
下一步
是否需要 Kian 做什么
```

# 6｜Compact rule

```text
understand intent
→ resolve narrow scope
→ read minimum Current owners
→ preserve upstream semantics
→ do smallest correct work
→ prove requested real effect
→ continue within the bound task until the requested outcome or a real stop condition
```

KianOS succeeds when fresh Chats restart quickly and normal changes stay cheap—not when every worker loads the repository's governance history.
