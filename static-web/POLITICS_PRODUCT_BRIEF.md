# Politics Product Brief — discussion freeze

Status: ACTIVE DISCUSSION BRIEF  
Parent cursor: `static-web/CURRENT.md`  
Preference owner: `static-web/KIAN_UI_PREFERENCES.md`  
Style owner: `static-web/UI_STYLE_BRIEF.md`

This file records accepted learner-visible Politics product decisions while Kian and Sol review the Politics family surface-by-surface. It does not change Politics learning/evidence semantics.

---

## Shared Politics product boundary

Preserve the Current first-round chain:

```text
Orientation / current Natural Unit
→ Chengfeng continuous study on iPad / MarginNote
→ optional close / checkpoint
→ Xiao1000 verification in KianOS web
→ stable correct → continue
   OR Wrong / Uncertain → smallest repair → owning source / Chat → return
→ resume meaningful position/action
```

Politics is not one generic content template. Subject cognitive shapes remain distinct:

- Marxism: relation / reasoning / mechanism;
- History: chronology / stage / turning point / cause / evaluation;
- Mao: historical problem → theory response → positioning/boundary;
- Xi: hierarchy / role / goal / principle / path / fixed-formulation boundary;
- Ethics-Law: concept boundary / normative judgment / situational application.

The learner-facing UI must reduce cognitive friction in large-text / high-density learning. Text quantity alone is not the main problem: hierarchy, attention allocation, relation visibility, progressive disclosure and reading rhythm are product-critical. Do not treat Politics as a long article reader or as a pile of cards.

---

## KianOS Global Home — accepted directional note relevant to Politics

Kian accepted the current overall exam Home direction:

```text
KianOS Home
→ one meaningful Continue
→ three exam-subject entries: Xizong / English / Politics
→ Lexical as secondary tool/supply lane
```

Global Home should remain simple and should not expose Politics chapter directories, learning-architecture explanations, engineering status or fake progress dashboards. Deep Politics structure begins after entering Politics.

---

## Politics Home — accepted direction

Politics Home is a lane entry, not a course catalogue and not a learning-method explanation page.

### Responsibilities

Politics Home should answer only:

```text
where do I meaningfully continue?
→ which Politics subject do I want to enter?
→ is there meaningful Wrong / Uncertain evidence worth taking back to Chat today?
```

### Preserve

- Current Continue / last-location behavior;
- free entry into all five Politics subjects;
- daily Wrong / Uncertain handoff behavior;
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
│ <quiet when no repair; Wrong / Uncertain + Chat action only when useful>     │
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
- new repair cards/panels merely because Cognitive Projection exists elsewhere;
- extra learner confirmations before Next/Return;
- a generic subject-cognitive diagram on every question.

If existing Content already naturally appears inside the historical explanation/source fields, render it there; do not create a new process layer around it.

### Allowed modernization

Codex may apply the accepted shared visual system to this Workbench—typography, spacing, contrast, controls, focus states, responsive fallback and token consistency—provided the learner-visible information architecture, sequence and effort remain materially unchanged.

The acceptance test for this surface is therefore:

> **historical Workbench capability preserved + shared visual polish + zero new learner process burden.**

---

## Core unresolved Politics UI problem

The next design problem is not navigation. It is the main Politics learning workspace under **large text volume + multiple semantic layers**.

The product must deliberately reduce learning barriers through:

- text hierarchy;
- attention allocation;
- visible logic / relation structure;
- readable typography and line length;
- progressive disclosure of secondary detail;
- preservation of subject-specific cognitive geometry;
- clear handoff between Mac structure/verification and iPad continuous Chengfeng reading;
- minimal context loss across Orientation → source study → Verify → Repair → Return.

This must be solved before mass-projecting the existing Marxism C00 reference workspace to other chapters/subjects.

Do not treat "large text" as merely a CSS typography problem. The question is **what the learner sees first, what stays visible, what is deferred, and how the logic of the content is visually encoded**.

---

# Design Stage Goal｜Cognitive Projection Layer

Status: **ACTIVE DESIGN TARGET — no mass implementation yet**

The current design stage is not to hand-layout every Politics chapter and not to redesign Politics Learning Logic. The goal is to freeze a **data-driven Cognitive Projection Layer** that can turn accepted Current Content into lower-friction learner-facing cognitive structures while preserving the existing Runtime / Evidence / Repair / Return chain.

## Stage objective

```text
Current Content
→ subject-specific semantic projection
→ stable Cognitive ViewModel
→ reusable cognitive components
→ shared Mac-wide workspace shell
→ existing Runtime / Evidence / Repair / Return
```

The design is accepted only if the resulting system can render many chapters from Current data without page-by-page bespoke artwork and without flattening all Politics subjects into one generic template.

## Design-stage scope

### A｜Freeze the shared Attention Architecture

Define the default visual priority model for high-text Politics learning:

```text
L0  current learner problem / question
L1  decisive relation / causal / hierarchy structure
L2  explanation needed to understand that structure
L3  takeaway / boundary / next bridge
L4  exact wording / source / deeper detail / metadata
```

This is a hierarchy rule, not a requirement that every page contain all five layers. Subject semantics determine which layers exist.

Default behavior:

- L0–L1 dominate the first view;
- L2 is readable but subordinate to the main structure;
- L3 is contextual and may live in the Inspector;
- L4 is progressively disclosed unless Current explicitly requires first-round exact recognition;
- stable/correct work stays visually quiet;
- Wrong / meaningful Uncertain may increase interface weight because new information becomes useful.

### B｜Freeze the shared Workspace shell

Define one reusable Mac-wide workspace shell that can host different cognitive geometries without forcing identical content templates.

Expected structural regions:

```text
Location / Chapter / Natural Unit navigation
→ Chapter-level orientation/map when useful
→ Current Natural Unit cognitive stage
→ Contextual Inspector
→ existing stage actions / source handoff / verification / repair / return
```

The shell must avoid the current default of rendering every Unit in one continuously expanded Chapter document.

Natural Units remain freely navigable; stateful focus is not permission to turn the page into a restrictive wizard.

### C｜Freeze subject-specific Projection grammars

At design stage, define the semantic fields and visual primitives for all five Politics subjects at the **grammar level**, without manually designing every chapter.

Target grammars:

```text
Marxism
relation / mechanism / boundary / reasoning chain

History
stage / chronology / cause / cause layers / turning point / evaluation / takeaway / next / causal chain

Mao
historical problem / theory response / sequence position / route-program-position boundary

Xi
hierarchy / role / identity / goal / principle / path / confusable fixed-formulation boundary

Ethics-Law
concept boundary / normative judgment / identity / situational application
```

Shared architecture may be reused; cognitive geometry must remain subject-specific.

### D｜Define reusable cognitive component primitives

Design the minimum component vocabulary needed by the projection grammars, for example:

```text
CausalChain
ParallelCauses
StageTimeline
TurningPoint
RelationMap
MechanismChain
ProblemAnswer
TheoryPosition
HierarchyTree
RoleIdentity
BoundaryCompare
TakeawayList
NextBridge
ContextInspector
```

These are semantic/attention components, not decorative Card variants.

Exact implementation names remain open until Codex handoff; design stage freezes their responsibilities and composition rules, not incidental code structure.

### E｜Use History C01 as the first full pilot

History C01 is the design calibration object because Current already owns enough distinct structure to test the architecture:

- chapter stage story;
- four Natural Units;
- `cause`;
- `cause_layers`;
- `process`;
- `turning_point`;
- `evaluation`;
- `what_to_hold`;
- `next`;
- chapter `timeline`;
- chapter `causal_chain`.

The design must preserve these Current relations rather than silently dropping them through the generic adapter.

History C01 should be designed through the full learner-visible state chain:

```text
Chapter / Unit orientation
→ External Learn handoff
→ optional Recall / close
→ Xiao1000 clean verification
→ stable continuation
→ Wrong / Uncertain repair
→ exact return
→ Unit / Chapter close
```

The design stage does **not** change the semantics of any of these states.

### F｜Prove the design generalizes before implementation expansion

Before declaring the History grammar frozen, sample at least one materially different later History chapter / Unit and verify that the same grammar can express it without bespoke page artwork or loss of Current semantics.

The purpose is to reject a design that only looks good for History C01.

### G｜Map implementation boundaries before Codex

The design brief must identify:

- which Current fields are read by each subject projection;
- which existing generic adapter fields are preserved;
- which currently dropped subject-specific fields need Projection support;
- how ViewModel output connects to existing question / evidence / repair / return components;
- which parts of the current Runtime remain untouched;
- fallback behavior when a particular semantic structure is absent.

Codex should receive a bounded implementation brief, not be asked to rediscover the product architecture.

---

## Design-stage non-goals

Do **not** during this stage:

- rewrite Politics Content to make UI implementation easier;
- change Natural Unit ownership/order;
- change Chengfeng / Suyi / Xiao1000 roles;
- reinterpret first-ready question ownership;
- alter Evidence / mastery semantics;
- alter Wrong / Uncertain admission rules;
- redesign Unit Return semantics;
- mass-convert all Politics chapters before the pilot is accepted;
- hand-design one-off artwork per chapter;
- ask Codex to invent subject cognitive grammar from the data.

---

## Design-stage exit criteria

The Politics Cognitive Projection design stage is complete only when all of the following are true:

1. **Attention Architecture frozen** — default first-view / secondary / deferred hierarchy is explicit.
2. **Shared Workspace shell frozen** — Mac-wide geometry, Natural Unit navigation and Inspector responsibilities are accepted.
3. **History grammar frozen** — all high-value Current History fields used by learner cognition have an explicit Projection disposition.
4. **History C01 full-state design accepted** — Orientation through Verify / Repair / Return / Close has learner-visible text-frame designs.
5. **Generalization check passes** — at least one materially different History chapter can use the same grammar without one-off page design.
6. **Five-subject grammar map exists** — Marxism / History / Mao / Xi / Ethics-Law each has a defined cognitive projection shape, even if only History is first implemented.
7. **Component responsibility map frozen** — enough reusable cognitive primitives are defined to implement the pilot without decorative-card improvisation.
8. **Semantic boundary documented** — Content / Logic / Runtime / Evidence owners remain unchanged; Projection changes are explicitly bounded.
9. **Codex pilot brief ready** — implementation can begin with History C01 only, on one bounded Draft PR, without product rediscovery.

After these conditions are met, the next stage is **implementation pilot**, not whole-Politics rollout.

---

## First implementation stage after design freeze

The first Codex implementation should be intentionally narrow:

```text
History C01 only
→ create Cognitive Projection foundation
→ create History projection adapter / ViewModel
→ create minimum reusable cognitive components
→ connect to shared workspace shell
→ preserve existing Xiao1000 / Evidence / Repair / Return behavior
→ real Mac-wide screenshots
→ Sol + Kian product review
→ same-PR iteration
```

Only after real browser use and acceptance should the architecture expand to History C01–C10, then the other Politics subjects.
