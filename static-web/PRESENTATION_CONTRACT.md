# KianOS Presentation Contract

Status: **CURRENT**  
Role: shared learner-facing Visual / Presentation authority

This file answers one question:

> **Given approved Rule + Content and an approved learner action, how should KianOS present it clearly without inventing semantics or redesigning accepted task geometry?**

It is downstream of:

- `ARCHITECTURE.md` — five durable responsibilities;
- domain `LEARNING_CONTRACT.md` — cognition, learner order and surface ownership;
- canonical Content — what the knowledge/task actually means;
- `KIAN_UI_PREFERENCES.md` — accepted KianOS-specific visual / interaction requirements and bounded preference evidence;
- `UI_STYLE_BRIEF.md` — shared visual language.

Engineering behavior such as shortcuts, persistence, answer gating and Runtime belongs to `SYSTEM_CONTRACT.md` and implementation owners.

---

## 1｜Visual has three levels

```text
Shared Visual
→ site-wide typography / weight / palette / spacing / radius / elevation / shared controls

Subject Visual
→ English / Politics / Xizong domain-native visual language where cognition genuinely differs

Accepted Surface Blueprint
→ stable learner-task geometry already accepted by Kian
```

These levels inherit downward.

A local surface may specialize shared Visual when its task genuinely requires it. It may not fork global visual language merely because a new Chat or component author prefers another style.

---

## 2｜Accepted Surface Blueprints are durable design assets

Once Kian accepts a learner-facing task layout, that geometry is frozen unless:

1. Kian explicitly asks for a redesign; or
2. upstream Learning Logic materially changes the task itself.

The following do **not** reopen design by themselves:

- Shared Shell changes;
- CSS ownership cleanup;
- typography-token refactors;
- a new implementation Chat;
- moving files/components;
- broad "visual convergence";
- replacing one renderer implementation with another.

Allowed maintenance after acceptance:

- inherit newer shared typography / contrast / spacing tokens;
- responsive / overflow fixes;
- accessibility fixes;
- implementation cleanup that preserves the accepted information architecture and interaction geometry.

Hard rule:

> **Accepted design is reused, not re-derived.**

### What an Accepted Surface Blueprint must preserve

A Surface Blueprint is a **code-independent layout/design asset**. It records the accepted page composition so later CSS cleanup, component refactors, renderer replacement or framework migration do not force design rediscovery.

A Blueprint should preserve only durable layout intent:

```text
Surface / learner action
Primary viewport / environment

Focal object
→ what visually dominates

Regions
→ which persistent / conditional spatial roles exist

Geometry
→ meaningful column/region relationships or approximate ratios
→ only when the ratio is part of the accepted design

First-view invariants
→ what must be simultaneously visible before scrolling

Scroll ownership
→ which region owns vertical / local scrolling
→ what may remain sticky

Conditional regions
→ when a rail / inspector / repair / context area appears or disappears

Responsive fallback
→ how the composition degrades on narrower screens

Must preserve
→ information architecture / geometry that later implementation cleanup may not change

May vary
→ incidental implementation details that may change without reopening design

Human-Gate evidence
→ accepted real-browser screenshot(s), when available
```

A Blueprint must **not** duplicate:

- canonical Content text, facts, KP / Natural Unit payloads or semantic relations;
- Projection / Surface Mapping semantic payloads;
- CSS selectors, component names or implementation file paths as design Truth;
- incidental pixel values such as one padding, border radius or temporary sticky offset unless that value itself is the durable shared token;
- historical design discussion once the accepted composition is clear.

Useful approximate proportions such as `passage ≈ 55% / questions ≈ 45%` may be recorded when they express accepted geometry. Incidental CSS such as `gap: 28px` normally stays Engineering-only.

### Screenshot relationship

```text
Accepted Surface Blueprint
= design intent / geometry Truth

Human-Gate screenshot
= visual acceptance evidence

Astro / CSS / JS
= current implementation
```

A screenshot does not replace the Blueprint. The Blueprint allows the same accepted design to survive implementation rewrites; screenshots calibrate whether the implementation still looks right.

---

## 3｜Content structure is not page structure

Forbidden shortcut:

```text
field exists
→ create card
→ repeat until every field is visible
```

Instead:

```text
approved learner action
+ accepted semantic shape
+ current state
→ representation
```

Hard distinctions:

```text
Content structure ≠ page structure.
Semantic object ≠ UI component.
Component availability ≠ representation choice.
```

Visual may choose hierarchy, grouping, layout, disclosure and emphasis.
Visual may not decide what the knowledge means, what a question tests or what the learner must learn.

---

## 4｜Mac-wide is the primary design origin

Primary learner environment is Mac / wide landscape unless upstream Learning Logic assigns the active action elsewhere.

Use desktop width to show simultaneously useful relationships, not to stretch a narrow document or add more dashboard chrome.

Preferred wide-screen uses include:

- passage + full question set;
- source + learner reconstruction;
- prompt/material + dominant writing area;
- relation / compare / hierarchy structures that genuinely benefit from parallel visibility;
- stable local navigation beside the main cognitive region.

Narrow responsiveness remains required, but it is a fallback—not the design origin.

---

## 5｜One focal cognitive task

A screen may contain rich information, but one learner action/object should have obvious focal priority.

Examples:

- orient to the current model;
- read/learn on the approved surface;
- recall;
- answer the current task;
- write;
- repair one real failure;
- continue/return.

Do not give Orientation, Recall, questions, repair, review debt, navigation and engineering metadata equal visual weight merely because they all exist.

Dense does not mean flat.

---

## 6｜Safe representation vocabulary

When Current semantics support them, Visual may use a small stable vocabulary:

- **Problem** — the current question/problem;
- **Map / Hierarchy** — genuine topology or parent/child structure;
- **Chain / Timeline** — genuine ordered causal/process/historical sequence;
- **Compare** — parallel discrimination;
- **Boundary** — explicit scope / inclusion / exclusion distinction;
- **Anchor** — scarce organizing takeaway;
- **Exact** — precision object requiring exact retention;
- **Locator / Handoff** — position + next action across surfaces;
- **Recall** — answer-protected retrieval object;
- **Question / Task** — clean attempt object;
- **Repair** — smallest representation needed to fix the actual failure;
- **Reference** — valid material available without competing with the main task.

These are representation roles, not mandatory component classes.

### Representation safety

Text is the safe default when structured text communicates the relation clearly.

Use diagrams/arrows only when the relation is explicit and visualization materially lowers reconstruction cost.

Do not let layout invent:

- hierarchy;
- causality;
- sequence;
- dependency;
- grouping;
- importance

that Current does not actually claim.

When uncertain, choose readable structured text over a clever diagram.

---

## 7｜Stateful presentation is optional and derived

The same canonical Content may appear differently when learner state genuinely changes what should be visible.

Example:

```text
Learn   → full accepted explanation
Recall  → answer-bearing material hidden
Repair  → failed relation foregrounded
Review  → compressed representation
```

This does **not** create a second semantic owner.

Presentation/Projection is derived and may be omitted entirely when the renderer can safely consume canonical Content directly.

```text
simple case:   Content → renderer
stateful case: Content → derived presentation → renderer
```

Projection must never invent missing Content merely to satisfy a visual template.

---

## 8｜External-primary actions use companion presentation

When MarginNote, Chat or another approved surface owns the current cognitive action, KianOS web becomes a companion rather than a competing second course.

Useful companion presentation may include:

- current problem / position;
- small relation scaffold;
- source locator;
- what to look for;
- checkpoint;
- return action.

Do not reproduce continuous source material just to keep the learner inside Astro.

---

## 9｜Dense Calm visual standard

Shared visual direction is owned in detail by `UI_STYLE_BRIEF.md` and `KIAN_UI_PREFERENCES.md`.

The durable summary is:

> **High useful information density + comfortable typography + strong hierarchy + restrained decoration + low fatigue.**

Prefer, in order:

```text
typography
→ alignment
→ geometry
→ spacing / indentation
→ thin rules / subtle zones
→ containers only when a real semantic or interactive boundary exists
```

Avoid generic dashboard composition, repeated rounded cards, tiny/light gray text, decorative empty space and engineering metadata competing with learner content.

Visible text must be worth reading and comfortable to read.

---

## 10｜Domain/task geometry remains native

Shared Visual does not make all subjects look structurally identical.

Examples:

- English exam tasks preserve whole-task geometry;
- Politics Natural Units preserve subject-native relation/history/hierarchy shapes;
- Xizong preserves System / Block / KP / Recall / Question cognitive geometry;
- Lexical, as an English learner-product function, preserves its word / Depth / Challenge geometry.

A shared task type should reuse the same blueprint/runtime when semantics are the same. Different data sources do not justify a duplicate surface.

Example:

```text
Reading A ───────┐
External Reading ├→ same Reading blueprint
compatible task ─┘
```

---

## 11｜Visual acceptance

A learner-facing Visual change is not accepted because CSS compiles or a screenshot exists.

Check at minimum:

1. the focal learner action is obvious;
2. accepted surface geometry has not drifted unintentionally;
3. Mac-wide space is used for useful information/relationships;
4. typography is comfortably readable and optically substantial;
5. hierarchy works before borders/cards do the work;
6. no semantic relation is invented by layout;
7. learner-facing chrome does not dominate the task;
8. narrow fallback has no obvious overflow/layout failure;
9. Kian reviews the real browser result when the visual change is material.

Human Gate remains required for material learner-facing visual changes.

---

## 12｜Change rule

Change Shared Visual once upstream when the desired effect is site-wide.

Change Subject Visual only for a real domain-wide need.

Change an Accepted Surface Blueprint only when Kian explicitly reopens it or upstream Learning Logic changes.

Do not redesign a surface to solve an implementation ownership problem.
