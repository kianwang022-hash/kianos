# Politics Visual / Surface Blueprint

Status: **CURRENT — ACCEPTED POLITICS VISUAL / SURFACE BLUEPRINT OWNER**  
Parent Visual authority: `static-web/PRESENTATION_CONTRACT.md` + `static-web/UI_STYLE_BRIEF.md` + `static-web/KIAN_UI_PREFERENCES.md`
Surface split parent: `static-web/PRODUCT_SURFACE_CONTRACT.md`
Parent cursor: `static-web/CURRENT.md`

This file records accepted learner-visible Politics product decisions while Kian and Sol review the Politics family surface-by-surface. It does not change Politics learning/evidence semantics.

---

## Shared Politics product boundary

Preserve the Current first-round chain:

```text
Orientation / current Natural Unit
→ Chengfeng continuous study on iPad / MarginNote
→ optional close / checkpoint
→ single Xiao1000 Workbench
→ submitted backside = prebuilt refined Content
→ record W/U + learner cause/note/signals when useful
→ continue questions by default
→ learner-triggered Review batch → export one learning packet to Chat when wanted
```

Politics is not one generic content template. Subject cognitive shapes remain distinct:

- Marxism: relation / reasoning / mechanism;
- History: chronology / stage / turning point / cause / evaluation;
- Mao: historical problem → theory response → positioning/boundary;
- Xi: hierarchy / role / goal / principle / path / fixed-formulation boundary;
- Ethics-Law: concept boundary / normative judgment / situational application.

The learner-facing UI must reduce cognitive friction in large-text / high-density learning. Text quantity alone is not the main problem: hierarchy, attention allocation, relation visibility, progressive disclosure and reading rhythm are product-critical. Do not treat Politics as a long article reader or as a pile of cards.

---

## Global Home boundary

Global Home information architecture is owned by `static-web/PRODUCT_SURFACE_CONTRACT.md`, not by Politics.

Politics contributes only its subject-native read-only entry/Resume projection and any genuinely actionable Politics attention supported by private learner evidence. Politics must not redefine global L1 navigation, whole-exam composition, cross-subject priority or Home progress semantics inside this Product Brief.

Deep Politics structure begins after entering Politics.

---

## Politics Home — accepted direction

Politics Home is a lane entry, not a course catalogue and not a learning-method explanation page.

### Responsibilities

Politics Home should answer only:

```text
where do I meaningfully continue?
→ which Politics subject do I want to enter?
→ is there accumulated Wrong / Uncertain evidence worth reviewing when I choose?
```

### Preserve

- Current Continue / last-location behavior;
- free entry into all five Politics subjects;
- Review entry for accumulated Wrong / Uncertain evidence; Chat export happens only from learner-triggered Review;
- stable/correct work does not create visible review debt;
- original Chengfeng / iPad-MarginNote handoff remains authoritative when continuous study is the next action.

### Remove / demote from normal Home

Do not foreground:

- `Current 已接通` / source health;
- subject/chapter engineering counts;
- content/runtime language;
- repeated explanation of Suyi / Chengfeng / Xiao1000 architecture;
- all chapter links expanded at once;
- fake learner progress inferred from repository readiness.

### Mac-wide direction

Use a quiet desktop-workspace composition rather than five large cards.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Politics                                                                     │
│                                                                              │
│ Continue                                                                     │
│ <subject · chapter · Natural Unit / meaningful next action>                  │
│                                                           Continue →         │
│                                                                              │
│ Today                                                                        │
│ <quiet counts / Review entry; no automatic Chat action>                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ 马原            史纲             毛中特           习思想          思修法基     │
│ 关系·推理·机制   阶段·转折·因果    问题·回答·定位    层级·身份·边界   概念·规范·情境│
│ 进入 →           进入 →            进入 →           进入 →          进入 →      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

Subject cognitive-shape labels are navigation/orientation aids, not five new learner courses.

### Progress boundary

Do not show Politics percentage progress unless a later product decision defines a trustworthy learner-progress owner. Engineering readiness / chapter count / repository closure must never be rendered as personal learning progress.

---

## Xiao1000 Question Workbench — accepted preservation decision

This surface is **not a redesign target**.

Kian explicitly rejected adding new learner-facing `structure / 易混` blocks because they would increase process weight. The accepted direction is to preserve the historical Politics Workbench interaction and information architecture **as-is**, rather than recompose it into a new repair layout.

### Historical UI reference for this surface only

Use the historical learner-facing Workbench as the presentation/interaction reference:

- `kianos-legacy/runtime/frontend/src/learning/PoliticsWorkbench.jsx`
- `kianos-legacy/runtime/frontend/src/learning/PoliticsWorkbench.css`

This is a bounded Projection/UI reference only. It does **not** make Legacy the semantic authority for Politics Content, Evidence, learner state or learning logic.

### Clean attempt — preserve

Preserve the existing full-width question workbench behavior, including:

- full-width stem;
- 2×2 option layout on Mac when the option length permits;
- verified text question face with optional original-image check;
- favorite;
- Uncertain;
- mark-for-discussion;
- existing single/multiple-choice submission behavior;
- existing answer gating and no correctness leak before submission;
- current session / question progression semantics.

Do not introduce a new left/right split during clean attempt.

### Submitted result — preserve

Preserve the historical bounded result workspace and its existing information structure:

```text
left summary/evidence pane
→ correct/wrong result
→ 一句话带走
→ learner answer vs formal answer
→ missing/extra choice detail when relevant
→ optional learner cause mark
→ learner note

right knowledge-review pane
→ 理解这道题（AI 精修解析）
→ 对应乘风考点 / 原讲义定位
→ 下一题 / 返回当前 Unit / 返回原入口
```

The historical approximate 32/68 Mac-wide result composition is an accepted reference. Do not create a new empty left region and do not move the existing knowledge-review content into a new workflow.

### Xiao1000 explanation boundary

**AI refined explanation is prebuilt Content.** It is generated/audited before study, stored as a question-bound learner-facing asset, and rendered after submit. The Workbench does not call Chat to generate or diagnose the current question during the attempt.

Chat is a later batch-review surface: the learner intentionally exports accumulated Wrong/Uncertain evidence plus causes/notes from Review when a deeper diagnosis is wanted.

Learner-facing explanation has exactly two derived semantic fields:

- `takeaway` — 一句话带走（AI 精修）;
- `chat_explanation` — 理解这道题（AI 精修解析）.

The historical / OCR Xiao1000 source explanation is evidence/provenance only. It must **not** be rendered as learner-facing content, must **not** appear behind a “查看原解析” disclosure, and must **not** be used as a fallback when the refined learner explanation is missing. Answer truth may still be verified against the authenticated source package.

The learner-facing `对应来源` region refers to the exact Current learning owner / Chengfeng source locator and source text needed for return-to-study, not the Xiao1000 historical explanation.

### Explicit non-goals

For this Workbench, do **not** add:

- a new `结构` review step;
- a new `易混` review step;
- new mandatory diagnosis stages;
- per-question Chat escalation as the default Wrong/Uncertain path;
- a second inline Xiao1000 attempt surface inside learning pages;
- new repair cards/panels merely because Cognitive Projection exists elsewhere;
- extra learner confirmations before Next/Return;
- a generic subject-cognitive diagram on every question.

If existing Content already naturally appears inside the historical explanation/source fields, render it there; do not create a new process layer around it.

### Allowed modernization

Codex may apply the accepted shared visual system to this Workbench—typography, spacing, contrast, controls, focus states, responsive fallback and token consistency—provided the learner-visible information architecture, sequence and effort remain materially unchanged.

The acceptance test for this surface is therefore:

> **historical Workbench capability preserved + shared visual polish + zero new learner process burden.**

---

## Politics Learn — accepted Current model

The former Cognitive Projection design/pilot stage is **historical construction context, not Current work**. Current Politics first-round learner-facing integration has been implemented and accepted for its tested boundaries; current readiness details live in `content/politics/ACCEPTANCE.md`, and active engineering analysis lives only in `content/politics/CURRENT.md` / its bound Issue when one exists.

The accepted learner-facing chain is:

~~~text
Current Politics Content / Learning Logic
→ explicit Surface Mapping
→ resolved learner state payload
→ Politics Learn / Workbench Runtime
→ private Evidence / Review / Return
~~~

Product requirements that remain durable:

- the five subjects keep distinct cognitive shapes rather than collapsing into one generic article/card template;
- the renderer consumes explicit Surface Mapping and must not infer political relations from raw fields, Projection shape names or DOM structure;
- high-text learning reduces friction through attention allocation, relation visibility, readable hierarchy and progressive disclosure rather than by deleting meaningful Content;
- Chengfeng remains the continuous first-round original-surface mainline where owned; KianOS remains orientation/selective cognition/verification/repair companion rather than a second full lecture reader;
- Natural Unit identity, clean Xiao1000 attempt, Wrong/Uncertain evidence, Review, exact Return and Resume remain behaviorally preserved;
- stable/correct work stays cheap and visually quiet;
- learner-facing engineering/projection vocabulary stays backstage.

### Current representation boundary

Semantic composition belongs upstream in `content/politics/SURFACE_MAPPING_CONTRACT.md` and exact Projection owners.

The Website owns only faithful product presentation of the resolved mapping:

~~~text
owned learner payload / relation type / grouping
→ responsive composition
→ readable typography / spacing / geometry
→ real-browser interaction
~~~

If mapped learner meaning is missing or wrong, reopen the exact Surface Mapping / Content owner. Do not patch new meaning into CSS/components.

### Current UI optimization boundary

For any local Politics UI optimization, use `POLITICS_UI_REVIEW_PROTOCOL.md`:

~~~text
whole learner loop
→ exact Current mapped owner/state
→ KEEP / OPTIMIZE / RESTORE_FROM_SURFACE_MAPPING / DEMOTE
→ smallest product/visual delta
→ real-browser proof
→ applicable Acceptance / Human Gate
~~~

A local optimization may improve hierarchy, geometry, responsive layout, scroll behavior or attention weight. It may not silently change Learning Logic, Source ownership, relation semantics, Evidence meaning, Repair admission or Return identity.

### Current work boundary

Do not derive active work from historical design-stage prose.

- engineering/work phase → `content/politics/CURRENT.md`;
- learner-facing readiness → `content/politics/ACCEPTANCE.md`;
- semantic display ownership → `content/politics/SURFACE_MAPPING_CONTRACT.md`;
- UI optimization safety → `POLITICS_UI_REVIEW_PROTOCOL.md`;
- exact visual implementation → current Website consumer/styles.

The current rapid-mastery work is analysis-only unless Kian explicitly adopts a product/behavior change. Analysis does not silently reopen this accepted first-round product model.

## Compact rule

> **Politics Product owns the accepted learner-visible product boundary. Current work state lives in CURRENT; semantic composition lives in Surface Mapping; UI renders it faithfully and does not revive historical design pilots.**
