# KianOS Worker Instructions

This file owns only **how a Chat / Agent / worker enters KianOS and finds the right owner**.

It does not own project requirements, architecture, domain semantics, Acceptance Truth, learner progress, branch policy, or detailed execution machinery.

Goal:

> **Kian says what he wants; the worker resolves the smallest correct scope, reads only the owners that can change the answer, does the bounded work, proves the real effect, and stops.**

---

# 1｜Intent first

Classify the user's actual job before reading an engineering cursor:

```text
LEARN    use / continue a learning capability
USE      use a non-learning KianOS product or private runtime state
BUILD    construct, audit or change Rule / Content / product / runtime semantics
UI       change product-facing presentation / interaction
CONTROL  cross-scope status, priority, blocker, task or project management
```

Natural language is authoritative; Kian does not need to name the mode.

Examples:

```text
继续英语             → LEARN
看看今天的 Steward   → USE
优化 Steward         → BUILD
改 Steward UI        → UI
继续英语内容建设     → BUILD
英语做到哪了         → CONTROL
```

A bare learner continuation stays LEARN unless the current conversation clearly establishes engineering work. A normal product-use request stays USE unless Kian asks to redesign/debug/manage it.

---

# 2｜Small read paths

## LEARN

```text
known domain/task
→ actual learner/runtime state or Resume owner
→ domain Learning owner only when needed
→ learn
```

Do not enter root engineering `CURRENT.md` merely because it exists.

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
→ Acceptance owner only when the claim matters
→ work
```

For a material change, automatically apply
[Change continuity](AUTHORITY_INHERITANCE_CONTRACT.md#31-change-continuity):

```text
user outcome
→ parent Rule / Model
→ exact domain/design owner
→ affected Content / Visual / Runtime responsibility
→ actual consumer
→ smallest justified delta
→ verify affected behavior
```

Read the **relevant design chain**, not the whole repository. A Current cursor or easy-to-edit implementation is never the full design by itself.

If an upstream owner changes during the task, apply
[Change propagation](AUTHORITY_INHERITANCE_CONTRACT.md#32-change-propagation-and-dependency-freshness)
only to real dependents; do not restart unrelated accepted work.

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
→ work
```

`KIAN_UI_PREFERENCES.md` owns accepted **KianOS visual requirements + bounded preference evidence**, not Kian's general personal preference truth.

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

Do not ask Kian to paste the Issue body, previous Chat discussion, PR diff or execution receipt when GitHub can provide it. Manual pickup is the quota-aware default; automatic watcher dispatch is opt-in via the execution marker defined in `PROJECT_MANAGEMENT_CONTRACT.md`.

Detailed task dispatch, GitHub Issue/Codex execution, Remote usage, batching, cursor atomicity, context budget and reporting discipline live in
[PROJECT_MANAGEMENT_CONTRACT.md](PROJECT_MANAGEMENT_CONTRACT.md), not here.

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
→ durable readback
→ stop
```

Do not run a full-repository audit/build/browser gate for a routine local change unless its current owner or actual defect requires it.

For learner-facing visual changes, use representative real-surface proof and the applicable Human Gate. For semantic/domain changes, engineering green is not semantic acceptance.

Human Gate starts only after obvious defects are repaired. For UI/product work, the worker must first verify the accepted Rule/Model, required content/state/interaction logic, representative navigation/state transitions, and the actual rendered surface; then self-attack obvious incompleteness, awkwardness and backend/debug leakage. Kian reviews meaningful product/interaction/visual choices, not unfinished implementation.

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
→ stop
```

KianOS succeeds when fresh Chats restart quickly and normal changes stay cheap—not when every worker loads the repository's governance history.
