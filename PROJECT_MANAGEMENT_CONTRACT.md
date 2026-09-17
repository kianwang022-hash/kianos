# KianOS Project Management Contract

Status: CURRENT candidate — root execution / management contract
Scope: cross-lane project management, implementation discipline, user-facing project status, and durable Chat-to-GitHub operating rules

This contract exists because repeated real use exposed a management failure that the accepted top-level architecture did not itself execute away:

- the same shared rule or UI expectation drifted across subjects;
- implementation and migration work became too broad before real effects were proven;
- status/progress was difficult for Kian to see without repository archaeology;
- Chat decisions could remain only in conversation instead of becoming durable project authority;
- GitHub, local website state, and learner-facing output could diverge;
- workers sometimes read too little to understand upstream constraints, or too much and lost focus.

This file does **not** replace `PROJECT_DEFINITION.md`, `ARCHITECTURE.md`, domain Contracts, lane `CURRENT.md`, Acceptance owners, learner state, or Artifact owners. It owns **how KianOS work is managed and delivered so those existing owners remain coherent over time**.

Hard principle:

> **Do not redesign the accepted top-level architecture to solve an execution problem. Make the existing architecture executable first.**

---

# 1｜Durable project memory

KianOS does not trust one Chat transcript as project memory.

For any substantial project-management rule, cross-lane operating decision, migration discipline, delivery rule, or long-lived implementation convention:

```text
Chat discussion / decision
→ write the accepted rule to its canonical GitHub owner
→ then implement against that durable authority
```

Do not rely on a worker remembering an earlier conversation.

A Chat may reason, propose, diagnose, compare and execute. It does not become durable authority merely because the conversation was long or detailed.

If an accepted rule is expected to matter in a fresh Chat, it must exist in GitHub before broad implementation depends on it.

---

# 2｜Top-level freeze boundary

The accepted root governance remains the default baseline.

Do **not** reopen or redesign root architecture merely because:

- a UI is ugly;
- one migration is inconvenient;
- one lane has a local exception;
- a worker prefers a cleaner abstraction;
- a new component pattern is available;
- an implementation has accumulated debt.

A root architecture change is justified only when a demonstrated Project Requirement cannot be satisfied reliably by the current architecture.

Default response to recurring implementation friction:

```text
identify the failing execution boundary
→ fix the narrow owner / platform capability / management mechanism
→ preserve existing canonical truth
→ prove the real user effect
```

not:

```text
invent a new top-level architecture
→ migrate every lane
→ keep compatibility indefinitely
```

---

# 3｜One truth, derived views

KianOS keeps the existing single-owner invariant.

The management layer must never create a second truth for:

- domain content;
- domain learning semantics;
- Acceptance status;
- learner progress;
- lane Work Cursor;
- material/source truth;
- runtime capability.

User-facing management surfaces are **derived read models**.

Conceptually:

```text
canonical owners
+ Acceptance owners
+ Work Cursors
+ Exam Orchestrator
+ explicit update/watch tasks
+ private learner evidence when authorized
→ Mission Control / Home / status projection
```

If the same fact must be manually synchronized in two places, the design is wrong.

---

# 4｜Shared platform vs domain cognition

Unify infrastructure only where the learner/system decision is genuinely shared.

Shared platform responsibilities include, where justified:

- GitHub Current delivery / local sync;
- common navigation infrastructure;
- common Return/Handoff transport;
- common evidence transport primitives;
- shared browser/runtime plumbing;
- design tokens and typography primitives;
- shared validation infrastructure;
- Mission Control compilation / projection;
- shared current/status visibility.

Domain lanes continue to own their real cognition and genuine differences, including:

- natural learning units;
- learning order;
- source/surface ownership;
- repair semantics;
- evidence meaning;
- question/task semantics;
- domain-specific presentation geometry;
- special interaction where cognition requires it.

Hard rule:

> **Share infrastructure; do not force one shared brain across subjects.**

---

# 5｜Mission Control / Task Plane

Kian needs one learner-facing place that answers, in plain language:

- where each subject is now;
- what Kian should do next;
- what engineering work is still active;
- what is blocked;
- what material/update is waiting for the future;
- what phase/Gate is approaching;
- what the current learning flow is for each subject;
- whether the website is synced to Current.

This surface is called **Mission Control** conceptually. The concrete UI name may differ.

Mission Control is a read model, not a competing project database.

It should derive status from existing owners whenever possible. Only facts that are intrinsically task/watch facts may have dedicated task owners.

Allowed task kinds:

```text
STUDY   = a real learner action
BUILD   = active engineering/construction work
UPDATE  = a future material/content ingestion task
GATE    = a dated phase/result checkpoint
WATCH   = a condition that should become active when a real trigger occurs
```

Suggested watch/update states:

```text
WATCHING
WAITING
AVAILABLE
INGESTING
CURRENT
EXPIRED
```

Do not use Mission Control to manufacture learner mastery or duplicate lane `CURRENT.md`.

---

# 6｜Standard Chat → GitHub → Website path

For normal accepted content/rule changes, the intended learner experience is:

```text
Kian + Chat agree on a change
→ Chat edits the correct canonical GitHub owner
→ accepted change lands on main
→ the whole KianOS Current mirror updates automatically
→ the learner website refreshes to that exact Current
→ Kian sees the change without manual Git work
```

This is a **whole-repository platform capability**, not a Lexical-only or subject-specific feature.

Kian should not need, during normal learning, to:

- choose a Git branch;
- run `git pull`;
- decide which local checkout is current;
- restart Astro manually;
- move content between files and UI by hand;
- ask Chat to edit both canonical content and a duplicate webpage copy.

GitHub `main` remains the durable shared Current for accepted work. A local Current mirror is a delivery projection, not a new truth owner.

---

# 7｜Change classes

Before substantial work, classify the requested change by the highest level it actually touches.

## L0｜Content change

Examples: one word, one KP, one explanation, one source correction, one reviewed relation.

Default behavior:

```text
edit canonical owner
→ targeted validation
→ land
```

No platform/UI rewrite unless the content change exposes a real unsupported semantic shape.

## L1｜Task / schedule / update change

Examples: material watch, Gate timing, Orchestrator allocation rule, explicit future ingestion task.

Edit the responsible task/orchestrator owner; Mission Control derives the new view.

## L2｜Domain behavior change

Examples: a Politics learning loop changes; a Lexical Repair semantic changes; surface ownership changes.

Reopen the earliest responsible domain stage and re-walk only affected downstream work.

## L3｜Platform change

Examples: whole-site sync, shared navigation plumbing, design-system primitives, common runtime transport.

Require an impact analysis and cross-lane regression only for the actual shared surface affected.

## L4｜Architecture change

Truth ownership, hierarchy, fundamental layer boundaries or project invariants.

Default: **reject / avoid**.

Allow only when the current architecture demonstrably cannot satisfy an existing or newly accepted Project Requirement.

---

# 8｜Impact Cone + Authority Spine reading protocol

Workers must avoid both failure extremes:

```text
read too little → misunderstand upstream constraints
read everything → context overload / drift / weak execution
```

For cross-layer or low-level changes, use:

> **Read vertically through the complete affected authority chain; read horizontally only across real dependencies.**

## 8.1 Structure Pass

Before deep reading, identify:

```text
goal
change class
scope
canonical owner
upstream authority
actual downstream consumers
affected lanes
explicitly unaffected lanes
acceptance path
intended write-set
```

This produces an **Impact Cone**.

## 8.2 Work Pass

Then read only the exact owners inside the Impact Cone.

Typical cross-layer path:

```text
relevant root invariant
→ exact platform/domain contract
→ target lane override if applicable
→ exact implementation owner
→ exact acceptance/test owner
```

Do not read unrelated lane content merely because it shares the repository.

## 8.3 Context Pack

Before implementation, compress what was learned into a temporary working context:

```text
Goal
Authority chain
Must preserve
Affected
Not affected
Write-set
Acceptance / success test
Rollback / stop condition when relevant
```

Implementation should carry this compressed context rather than the full text of every governance document.

The Context Pack is temporary working memory, not a new canonical truth owner.

## 8.4 Read-cost alarm

If a known-scope task still requires broad repository search or many unrelated documents before effective work, treat that as a routing/ownership defect rather than normal behavior.

---

# 9｜Small vertical slices, not big-bang migration

KianOS migrations must use incremental replacement.

Default sequence:

```text
observe current behavior
→ build one narrow new path
→ prove the real effect
→ switch that path
→ observe
→ delete the superseded path
→ expand only after proof
```

Do not migrate all lanes merely for symmetry.

Before a migration begins, record at minimum:

```text
OLD
NEW
SUCCESS TEST
CUTOVER CONDITION
DELETE CONDITION
ROLLBACK / FAIL-CLOSED PATH
```

A compatibility bridge is allowed only when necessary and must have an explicit deletion condition before it enters main.

No permanent `temporary` fallback stacks.

Do not claim migration complete while old and new paths still compete for the same responsibility.

---

# 10｜Effect before architecture / completion by evidence

Engineering completion language must match the requested real effect.

The following are evidence, not automatic DONE:

- a file exists;
- a PR is merged;
- CI is green;
- a page renders;
- a migration script exists;
- a component has been rewritten.

A task is complete only when its success test is demonstrated.

Examples:

### Whole-site Current delivery

```text
accepted GitHub main advances
→ Mac requires no manual Git action
→ Current mirror reaches exact main SHA
→ site restarts/reloads as needed
→ already-open learner page reaches the new Current
→ applies to all lanes/content, not one subject
```

### Learner UI quality change

Completion requires the intended typography/layout/interaction effect on representative real pages plus functional regression evidence. For changes materially driven by Kian's visual preference, real surface review remains part of acceptance.

### Learning assets

Continue to use the repository's formal S/K/L/P/R/E/U rules; engineering proxies do not manufacture learning readiness or learner mastery.

---

# 11｜UI / implementation anti-patch rule

Do not solve repeated UI problems by indefinitely adding another override layer.

When a learner-facing surface repeatedly requires specificity wars, `!important` recovery, duplicated style owners, or several sequential `*-polish.css` files for the same responsibility, treat it as an ownership defect.

Preferred direction:

```text
shared design primitives/tokens
+ one clear lane/surface presentation owner
+ genuine domain-specific overrides only
```

Visual regression should be protected with representative browser evidence where valuable, not only build success.

The website remains a Projection/Execution surface. It must not become a hidden second domain-content owner.

---

# 12｜Branch / PR scope discipline

One PR should have one coherent acceptance question.

Avoid coupling unrelated concerns merely because they touch the same website or happen in the same Chat.

Examples of concerns that should normally be separate:

- whole-site delivery/sync;
- Lexical visual redesign;
- Mission Control compiler;
- one domain Learning change.

A branch is temporary execution state. Accepted durable result returns to `main`; branch retirement follows `BRANCH_LIFECYCLE.md`.

When a PR expands beyond its original acceptance question, stop and split before adding further unrelated scope.

---

# 13｜Plain-language interaction with Kian

Engineering complexity belongs in the backend unless Kian asks for it.

Normal progress reports to Kian should answer, in ordinary language:

1. **现在在做什么？**
2. **已经做完什么？**
3. **现在卡在哪里？**
4. **下一步是什么？**
5. **需要 Kian 做什么？** — only when genuinely required.

Do not flood the learner with:

- internal file archaeology;
- long commit/SHA lists;
- CSS specificity details;
- CI implementation internals;
- framework jargon;
- branch mechanics;

unless those details materially help the decision or Kian explicitly asks.

When a technical term is necessary, explain it in plain Chinese immediately.

The frontend should follow the same principle: Kian sees learning/task meaning; implementation metadata stays subordinate.

---

# 14｜Implementation program for the current management failure

The current repair program is deliberately bounded and incremental:

```text
1. Freeze accepted root architecture
2. Land this management contract
3. Separate whole-site Current delivery from Lexical UI work
4. Prove whole-site Chat/GitHub → local website delivery
5. Build a read-only Mission Control compiler from existing owners
6. Project Mission Control into Home without creating a second truth
7. Establish a small shared UI foundation only where current debt proves need
8. Use Lexical as the first visual vertical slice and obtain real surface acceptance
9. Adopt proven platform patterns lane-by-lane only where applicable
10. Remove superseded compatibility/style paths
11. Declare management-system construction closed and return to normal learning/content work
```

Do not turn this program into a new multi-month architecture migration. Each numbered step has to produce a usable effect before the next dependent step expands scope.

---

# 15｜What this file must not become

This contract must stay stable and relatively short.

Do not add:

- lane progress logs;
- individual content status;
- learner mastery;
- PR history;
- per-page CSS rules;
- implementation changelogs;
- ordinary Todo items;
- duplicated Project Definition / Architecture text.

If a new rule is local to one lane or implementation, put it in that narrower owner.

If this contract itself starts changing frequently, that is evidence that management concerns are being placed at the wrong level.
