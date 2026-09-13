# Politics History C01 — Cognitive Projection Pilot

Status: HISTORY GRAMMAR FROZEN / IMPLEMENTATION NOT STARTED  
Parent: `static-web/POLITICS_PRODUCT_BRIEF.md`  
Preference owner: `static-web/KIAN_UI_PREFERENCES.md`  
Current content owner: `content/politics/learning/history/ch01.json`

This file owns the learner-visible design decisions for the History C01 Cognitive Projection pilot and the accepted History grammar inferred from cross-chapter generalization. It does not change Politics Learning Logic, Current Content, Natural Unit ownership/order, Xiao1000 ownership, Evidence, Repair, or Return semantics.

---

## Accepted global interaction constraint

Design origin is Mac wide landscape. Important first-round structure should be visible by default when the viewport can carry it comfortably. Do not use repeated accordions/details/cards merely to keep the page visually tidy. Interaction should primarily switch the current cognitive object / task state, not reveal information that should already be visible.

Chapter-level long scrolling is not the target. One Natural Unit owns the main stage at a time. A genuinely dense Unit may use bounded/local scrolling, but the UI must not reconstruct the current generic “whole chapter as one long document” behavior.

---

# History Natural Unit Main Workspace — ACCEPTED BASELINE

Kian accepted one continuous Mac-wide Natural Unit workspace as the History first-round baseline.

The prior idea of treating `ORIENT` and `EXTERNAL_LEARN` as separate learner-facing pages is superseded. They are semantic states within the same workspace. Entering Chengfeng study may change emphasis / action copy, but it should not replace the page or make the learner relocate.

## Core geometry

```text
Chapter / Natural Unit location
→ compact chapter historical line / attention rule
→ current Natural Unit cognitive stage
→ current takeaway / next bridge
→ Chengfeng reading questions / current action
```

Rules:

- one Chapter / Natural Unit workspace, not one continuously expanded Chapter document;
- chapter-level historical map remains visible enough to preserve position;
- only one Natural Unit owns the main stage at a time;
- all Natural Units remain directly navigable; focus is not a restrictive wizard;
- main stage uses the largest region for understanding / relations;
- first-round decisive structure is visible by default;
- source provenance / exact metadata / engineering state stay out of the main first view;
- the page should carry the minimum sufficient information to understand the structure, not minimize text for its own sake.

## History C01 / Unit 01 Current fields projected

```text
stage_question
cause
turning_point
what_to_hold
next
```

Chapter context may use Current:

```text
chapter_orientation.starting_point
chapter_orientation.core_problem
chapter_orientation.stage_story
chapter_orientation.attention_rule
chapter_compression.timeline
chapter_compression.causal_chain
```

No learner-facing political content is invented. Projection reorganizes Current fields only.

## Mac-wide density / width rule — ACCEPTED

Kian explicitly rejected a low-density layout that preserves narrow-screen vertical composition on a wide Mac viewport.

Mac-wide is the design origin, not a stretched mobile/tablet layout.

Default first-round workspace should actively use horizontal width to display simultaneously useful relationships. Prefer:

```text
current problem / why this matters
│
├── largest central cognitive geometry
│   relation / cause / process / evaluation / hierarchy
│
└── takeaway / next bridge
```

A useful baseline proportion is approximately:

```text
22–25%  current problem / orientation
50–55%  decisive cognitive structure
22–25%  takeaway / next bridge
```

This is a composition heuristic, not a fixed CSS contract. A Unit may rebalance columns when its semantic shape demands it.

### Width-use principles

- consume the actual desktop workspace width; do not place a narrow ~1100px article column in the middle of a large display without a semantic reason;
- prefer horizontal parallelism, horizontal causal flow and side-by-side comparison when the Current relation is genuinely parallel or comparative;
- use vertical flow only when the semantic relation is truly sequential or hierarchical;
- do not add decorative cards merely to fill width;
- increased density means more simultaneously useful relationships, not more chrome or more words;
- preserve readable line length inside explanatory text even while the overall workspace uses full width;
- aim for “high information density, low disorder.”

Examples:

```text
bad wide-screen carryover
A
↓
B
↓
C
↓
D

better when relation permits
A + B → C → D
```

and:

```text
                ┌ political control
military breach ├ economic extraction → deeper semi-colonial control
                └ cultural penetration
```

For evaluation-shaped Units, use the wide viewport for simultaneous comparison where Current supports it, e.g.:

```text
what it achieved | what it did not achieve | why it could not
```

Do not force every History Unit into one arrow-diagram grammar. The shell is stable; the cognitive geometry changes with Current semantics.

## Accepted Mac-wide frame direction

The accepted frame remains one Natural Unit workspace, but its implementation should use the high-density horizontal composition above rather than the earlier low-density vertical sketch.

The learner should be able to see in one desktop view, when content size allows:

```text
chapter position / line
+ current historical problem
+ decisive relation structure
+ key takeaway
+ next bridge
+ Chengfeng reading focus / action
```

without repeated reveal interactions.

## External Learn behavior — ACCEPTED

Clicking `去 iPad / MarginNote 学这一节` does **not** navigate to a new learner page.

Mac remains the desk-side cognitive map. The current Unit structure stays visible while the source-learning state may lightly emphasize:

```text
乘风 · 当前学习
<chapter / section locator>

带着这些问题读：
<Current-derived reading questions>
```

The iPad / MarginNote Chengfeng source remains the continuous mainline. Astro does not copy continuous Chengfeng prose into a second textbook.

## Return / optional close — ACCEPTED

Returning from Chengfeng does not require a new Recall page.

The bottom action area may simply change to a lightweight optional mental close, e.g.:

```text
学完了？

脑中过一遍：
<one or two Current-derived closure questions>

[直接做本 Unit 肖1000 →]
```

The closure is optional and should not add a confirmation step. It may be read and mentally answered without clicking anything.

Normal first-round learner interaction is intentionally short:

```text
switch Natural Unit
→ read the cognitive structure
→ go to Chengfeng
→ return
→ optionally close mentally
→ Xiao1000
```

Do not add a separate ORIENT page, External Learn page, Recall page, or mandatory “学完” confirmation merely to represent semantic state changes.

## Visibility rule — ACCEPTED

Default visible on Mac when Current provides it and the viewport can carry it:

```text
chapter position / line
current question
core cause / process / turning / evaluation structure
what_to_hold / key takeaway
next bridge
reading attention questions
```

Do not create unnecessary controls such as:

```text
展开因果
展开重点
展开下一步
查看学习目标
```

Progressive disclosure is reserved for genuinely secondary/deep material such as detailed provenance, unusually long supplements, low-frequency exact detail, or engineering metadata.

## Height / scrolling rule — ACCEPTED

History C01-S01 should be capable of fitting essentially within one Mac-wide viewport at the target typography / density.

This is a design target, not a rule that every Natural Unit must have zero scroll. For a materially denser Unit:

- preserve the same shell;
- allow bounded/local main-stage scrolling when necessary;
- do not fall back to chapter-level long-document scrolling;
- do not solve density by hiding baseline useful information behind many reveal interactions.

---

# History Projection Grammar — FROZEN

## C01 intra-chapter generalization — PASS

C01-S01 / S02 / S03 / S04 use the same Natural Unit shell without extra learner steps or bespoke page artwork.

Current cognitive shapes remain distinct:

```text
S01  parallel cause → turning point
S02  cause → multi-layer process
S03  process → evaluation
S04  cause layers → turning point
```

Accepted rule:

> the shell stays stable; the cognitive geometry changes with the Current semantic shape.

The Projection must not normalize all four into the same vertical chain or generic card grid.

## Cross-chapter generalization — C06 PASS

History C06 (`content/politics/learning/history/ch06.json`) is materially denser than C01 and introduces additional semantic shapes:

```text
process
boundary
mechanism
cause_layers
historical_gain
turning_point
```

The accepted Mac-wide grammar still carries these without a new learner workflow or bespoke page artwork.

Representative dispositions:

```text
C06-S04
parallel mechanisms
→ shared long-war / organizational capability
→ turning point
+ explicit boundary

C06-S05
cause layers | historical gains | postwar turning point
```

The Mac viewport should expose genuinely parallel mechanisms side by side rather than serializing them into a false sequence.

Example semantic principle:

```text
全面抗战路线
持久战判断
敌后战场 / 根据地
统一战线中的团结 + 独立自主
群众工作 / 根据地建设 / 党的建设
            ↓
共同形成长期抗战能力
```

Do not render this as `机制1 → 机制2 → 机制3...` unless Current actually expresses sequence.

For `cause_layers + historical_gain + turning_point`, wide composition may use simultaneous columns rather than vertical stacking when this preserves the Current relation more clearly.

## Frozen History grammar vocabulary

History Projection may express Current through a bounded vocabulary of semantic geometries such as:

```text
chronology / stage line
parallel causes
causal chain
multi-layer process
turning point
cause hierarchy
evaluation comparison
boundary compare
parallel mechanisms
historical gains / significance
next-stage bridge
```

This is not a requirement that each Unit use every geometry. Projection chooses only structures actually supported by Current.

History grammar is now sufficiently generalized for implementation planning. Do not continue bespoke polishing of History before the other Politics subject grammars are reviewed.

---

# Xiao1000 Question Workbench — PRESERVE HISTORICAL ASSET

This surface is not a Cognitive Projection redesign target.

Kian explicitly chose to **fully preserve the recovered historical Politics Workbench interaction and information architecture** rather than add new `结构 / 易混` review blocks or a new question-repair layout.

Historical learner-facing UI reference for this surface only:

- `kianos-legacy/runtime/frontend/src/learning/PoliticsWorkbench.jsx`
- `kianos-legacy/runtime/frontend/src/learning/PoliticsWorkbench.css`

This does not make Legacy the semantic authority for Politics Content, Evidence, learner state, or learning logic.

## Preserve clean attempt

- full-width question stem;
- 2×2 options on Mac when option length permits;
- verified text question face with optional original-image check;
- Favorite;
- Uncertain;
- mark-for-discussion;
- existing Normal / Fast and single/multiple-choice behavior;
- no correctness leak before submission;
- current session / question progression semantics.

## Preserve submitted result

Preserve the historical bounded result workspace and information architecture:

```text
left summary/evidence pane
→ correct/wrong result
→ 一句话带走
→ learner answer vs formal answer
→ missing/extra choice detail when relevant
→ optional learner cause mark
→ learner note

right knowledge-review pane
→ 理解这道题
→ 对应来源 / source text
→ 肖1000原解析 or bounded supplemental reference
→ 下一题 / 返回当前 Unit / 返回原入口
```

The historical approximate 32/68 Mac-wide result composition is the presentation reference.

Do **not** add:

- a new `结构` review block;
- a new `易混` review block;
- a new mandatory diagnosis stage;
- a new repair-card workflow;
- a generic cognitive diagram on every question;
- extra learner confirmations before Next / Return.

Visual implementation may later unify typography, spacing, contrast, control treatment and responsive behavior with the new static site, but the Workbench information architecture and interaction process are preserved.

## Question identity / parity rule

Kian states that the underlying Politics questions have not been intentionally modified during this productization work. Treat this as a strong expectation of parity, not proof by itself.

Before binding historical Workbench enrichments or refined explanations to Current questions, reconcile identity using the strongest stable keys, preferably:

```text
canonical question_id
+ normalized stem
+ option set/order
+ formal answer
```

If exact parity is demonstrated, reuse the Current Xiao1000 question object. Do not fork or duplicate the question bank merely to recover the old UI.

If a historical enrichment cannot be proven to belong to the exact Current question, fail closed: keep the Current question and omit that enrichment.

## Historical refined-explanation boundary

The historical 1148-record refined explanation asset remains a separate bounded migration issue. Known pinned SHA256:

`e48d2b06ec1747f97451d147dc172a9b2acf9219d19c5f274c539dc400efbdec`

It may be used only after its durable role is proven and the asset is legally promoted into Current. Until then, do not hidden-fetch or fallback to Legacy/local snapshots.
