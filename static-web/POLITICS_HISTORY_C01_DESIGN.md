# Politics History C01 — Cognitive Projection Pilot

Status: ACTIVE DESIGN PILOT  
Parent: `static-web/POLITICS_PRODUCT_BRIEF.md`  
Preference owner: `static-web/KIAN_UI_PREFERENCES.md`  
Current content owner: `content/politics/learning/history/ch01.json`

This file owns the learner-visible design decisions for the History C01 Cognitive Projection pilot. It does not change Politics Learning Logic, Current Content, Natural Unit ownership/order, Xiao1000 ownership, Evidence, Repair, or Return semantics.

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
- main stage uses the larger left area for understanding / relations;
- right Inspector is secondary: takeaway + next bridge, not a second lecture;
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

## Accepted Mac-wide frame

```text
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ← 史纲                 第一章｜近代中国为什么被迫进入民族救亡                               │
│                                                                                            │
│  01 鸦片战争前后      02 列强侵略      03 反侵略斗争      04 失败与民族意识觉醒            │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│  鸦片战争 → 社会性质变化 → 列强多层侵略 → 持续反抗 → 失败原因暴露 → 民族意识觉醒         │
│  国情变了 → 主要矛盾和历史任务变了 → 后面的探索都在回应这个新局面                       │
├──────────────────────────────────────────────────────────────┬─────────────────────────────┤
│                                                              │                             │
│  01 · 鸦片战争前后的中国与世界                              │  这一节带走                 │
│                                                              │                             │
│  为什么 1840 不是普通年份，                                 │  半殖民地半封建社会         │
│  而是中国历史性质发生转折的入口？                            │  是后续政治探索共同背景     │
│                                                              │                             │
│  国内封建社会衰落              西方资本主义扩张              │  民族独立、人民解放         │
│           ╲                         ╱                         │  国家富强、人民幸福         │
│            ╲                       ╱                          │  是近代中国必须解决的任务   │
│             └────── 正面碰撞 ──────┘                          │                             │
│                        ↓                                     │─────────────────────────────│
│                 列强以战争打开市场                           │  接下来                     │
│                        ↓                                     │                             │
│               中国社会性质发生变化                           │  社会性质改变以后，         │
│                        ↓                                     │  看列强怎样把控制具体化。   │
│          基本国情 / 主要矛盾 / 历史任务形成                  │                             │
│                                                              │                             │
│  这里真正要理解的是：一次战争为什么改变了                    │                             │
│  后续整个近代史的问题结构。                                  │                             │
├──────────────────────────────────────────────────────────────┴─────────────────────────────┤
│  去乘风时重点找：                                                                          │
│  ① 为什么社会性质发生变化？   ② 为什么这个变化进一步改变主要矛盾和历史任务？              │
│                                                                                            │
│                                                         [ 去 iPad / MarginNote 学这一节 → ] │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

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

In other words, normal first-round learner interaction is intentionally short:

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

# C01 Intra-chapter Projection Generalization Check — NEXT

Before considering the History Natural Unit shell frozen, project C01-S02 / S03 / S04 through the **same shell** without bespoke page artwork.

Expected Current shapes:

```text
S01  Cause → Turning Point
S02  Cause → Process
S03  Process → Evaluation
S04  Cause Layers → Turning Point
```

The shell may change the geometry of the cognitive stage to match the Current semantic shape, but it must not change navigation, source handoff, action placement, or the overall workspace contract.

Pass condition:

- S02 / S03 / S04 remain understandable without bespoke layouts;
- no high-value Current field is silently dropped;
- no generic “card pile” flattening is introduced;
- no extra learner process is introduced just to accommodate a different semantic shape.

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
