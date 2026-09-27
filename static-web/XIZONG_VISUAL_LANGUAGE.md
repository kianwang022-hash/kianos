# Xizong Visual Language — L2 subject visual owner

Status: **ACCEPTED L2 BASELINE — 2026-09-18**
Scope: learner-facing Xizong subject family only
Parent L1 owners: static-web/KIAN_UI_PREFERENCES.md + static-web/UI_STYLE_BRIEF.md
Presentation parent: static-web/PRESENTATION_CONTRACT.md
Product owner: static-web/XIZONG_PRODUCT_BRIEF.md

This file owns only the **Xizong-specific visual specialization** that remains after inheriting the shared KianOS Visual system.

It does not own:
- medical Content;
- Learning Logic;
- Runtime / Evidence semantics;
- per-Surface L3 geometry;
- global KianOS shell, typography tokens, shared size floors, generic card policy or shared visual acceptance.

Hierarchy:

~~~text
L1 Shared Visual / Preferences / Presentation
→ L2 Xizong Visual Language
→ L3 exact Surface Blueprint
   Home / System / Block / Recall / Practice / Memory
~~~

A learner-facing Xizong L3 surface inherits L1 automatically and adds only the subject-specific rules below.

---

## 1｜Subject character

Xizong should feel like a **medical cognition workspace**.

It is not primarily:
- a course website;
- a SaaS/dashboard;
- an electronic textbook;
- a generic flashcard/study app;
- a question-bank app.

Xizong-specific emphasis:

~~~text
medical content is visually primary
+ mechanism / localization / discrimination structure is explicit when owned
+ software chrome stays subordinate
+ dense medical objects may remain dense
+ Mac width may expose useful simultaneous relations
~~~

The exact shared typography, readability floor, card/border/shadow policy, general density rule and Mac-wide visual direction are inherited from UI_STYLE_BRIEF.md; do not restate or fork them here.

Visual structure may clarify an already-owned medical relation. It may never invent causality, hierarchy, localization or grouping merely because a diagram/layout is convenient.

---

## 2｜Xizong spatial grammar

Complex Xizong workspaces use **roles**, not mandatory fixed columns:

~~~text
Structure | Main | Conditional Context
~~~

### Structure
Owns:
- current System / Block / Logic Group / KP position;
- local map/navigation;
- orientation needed to preserve the medical model.

It must not become a second body-text column.

### Main
Owns:
- the current learner action;
- the primary medical/cognitive object.

It is always the dominant region.

### Conditional Context
Owns only support that is useful **now**, for example:
- Current reviewed Visual / table;
- Precision;
- exact Source / Outline locator;
- reviewed Connection;
- bounded explanation / repair-return context.

Hard rule:

> **If Context has no useful current object, Main gets the width back.**

Do not preserve empty rails for symmetry. The role grammar may become one, two or three regions depending on the exact task and state.

---

## 3｜State-specific visual behavior

The current learning state should be visually legible without turning state into engineering chrome.

### Learn

~~~text
richest state
→ current medical model dominates
→ Structure preserves orientation
→ Conditional Context appears only when earned
→ natural/local scrolling is valid
~~~

Do not force dense Learn content into one viewport by deleting or shrinking meaningful medical content.

### Recall

~~~text
quieter state
→ orientation skeleton remains
→ reconstruction prompt dominates
→ canonical answer-bearing Core stays protected
→ Reveal restores the Current model appropriate to the recall scope
~~~

Recall should feel like reconstruction, not like Learn with different buttons.

### Practice

~~~text
tool-like
→ high throughput
→ stable question/review geometry
→ low interaction tax
→ local scrolling when needed
~~~

Question position, answer interaction and submitted review should not jump unnecessarily.

### Memory

~~~text
selective recovery
→ weak/current object
→ Recall
→ Reveal
→ rating / bounded next action
~~~

Memory is not a second course, dashboard or duplicate Content browser.

---

## 4｜Viewport / scroll specialization

"One screen" is a **task-specific preference**, not a global Xizong aesthetic.

Prefer a protected/stable viewport when it supports the cognitive action without thinning content, especially:
- Practice workbench;
- current KP Recall front;
- Block/System Recall front;
- current Memory recall object.

Natural long-form or local pane scrolling is valid for:
- System / Block framework material;
- dense KP Core after Reveal;
- rich reviewed Visual / tables;
- deep explanation/review;
- other intrinsically dense Current objects.

Hard rule:

> **Never reduce semantic density or shrink learner text merely to preserve a one-screen composition.**

Exact scroll ownership for a mature surface belongs in its L3 Surface Blueprint / product design owner and must be verified in the real browser.

---

## 5｜Attention / auxiliary specialization

Xizong often has useful optional medical support, but support must never become a second mainline.

Priority:

~~~text
current learner action / Core
> orientation needed for that action
> earned Visual / Precision / Connection / locator context
> low-priority provenance or metadata
~~~

Rules:
- a rich Visual may earn substantial Context area when it materially reduces reconstruction cost;
- Precision is exactness support, not a generic badge or new mastery stage;
- Connection is a relation notice, not automatic debt;
- Source / Outline locator stays compact and task-serving;
- absent enrichment remains absent; do not manufacture symmetry across Systems/KPs;
- engineering/runtime status must not compete with medical content.

Timing/eligibility of these objects remains owned by Current Learning / Representation / asset owners, not by this visual file.

---

## 6｜Tone specialization

Xizong inherits the shared KianOS palette and contrast rules.

Subject-specific direction is only:
- keep the medical workspace neutral and calm rather than warm/decorative;
- use structural accent sparingly so mechanisms and Current state remain legible;
- Wrong / failure and learner-owned marks may be distinct, but medical meaning must not rely on color alone.

Exact shared palette, typography, contrast and control styling remain upstream in UI_STYLE_BRIEF.md.

---

## 7｜L3 ownership / acceptance

This L2 file does not define exact Home/System/Block/Memory/Practice geometry.

Exact surfaces are owned by their Product / Design files, for example:
- XIZONG_HOME_DESIGN.md;
- XIZONG_BLOCK_WORKSPACE_DESIGN.md;
- XIZONG_PRACTICE_DESIGN.md;
- XIZONG_MEMORY_PRODUCT.md;
- System/Recall design owners where applicable.

A local implementation prototype is not Visual Truth until the applicable real-browser/Human Gate passes under PRESENTATION_CONTRACT.md and the current Acceptance owner.

## Compact rule

> **共享 Visual 决定 KianOS 的共同字体、密度、卡片与视觉质量；Xizong L2 只决定医疗认知空间怎样保持主次、结构、Context 和学习状态差异。**
