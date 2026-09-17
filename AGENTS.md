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

Use root `CURRENT.md` plus only the lane/orchestrator owners needed for the requested status or decision.

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
