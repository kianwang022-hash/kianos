# Xizong Home — accepted surface design

Status: **ACTIVE SURFACE DESIGN — MAC-WIDE L3 ACCEPTED 2026-09-18**  
Parent: `static-web/XIZONG_PRODUCT_BRIEF.md`  
Review safety: `static-web/XIZONG_UI_REVIEW_PROTOCOL.md`

This file records the accepted learner-facing Xizong Home design only. It does not change medical Content, learner state, Runtime, Evidence, or System eligibility.

## 1｜Home responsibility

Home answers four learner questions:

```text
1. 我现在接着学什么？
2. 我想自由进入哪个 Current System？
3. 有没有真实需要我处理的问题？
4. 我在 A–F 全局知识地图的哪里？
```

It is not a repository dashboard, curriculum explainer, statistics page, or macro-domain card wall.

## 2｜Mac-wide composition — ACCEPTED

Mac wide landscape is the design origin.

Primary vertical order:

```text
Header
→ Continue
→ Current Systems
→ conditional Needs Attention
→ compact A–F Knowledge Map
```

Accepted geometry:

```text
西医综合        机制理解 · 主动重建 · 真题应用
────────────────────────────────────────────────────────────────

CONTINUE

A1 · 循环系统                                  KP LEARN
B07 · 当前 Block                               当前真实 learner stage
当前主要学习对象                               继续学习 →

────────────────────────────────────────────────────────────────
CURRENT SYSTEMS

A1 循环系统          A2 呼吸系统          A3 泌尿系统
Current-derived      Current-derived      Current-derived
System identity      System identity      System identity

────────────────────────────────────────────────────────────────
NEEDS ATTENTION              ← only when real learner state exists

Memory ...          Marked ...          Repair ...

────────────────────────────────────────────────────────────────
KNOWLEDGE MAP

A 心肺肾      B 消化·代谢·内分泌·肿瘤      C 血液·免疫·感染
D 神经·感觉·运动·骨科                       E 生殖·乳腺      F 其余临床整合
```

This is one continuous editorial workbench. Do not turn the four regions into equal rounded cards.

## 3｜Density rule — ACCEPTED

The Home must use Mac width and should not create a hero-sized empty Continue region.

Target behavior:

- Header is compact.
- Continue is visually dominant through typography, not excessive height.
- Current Systems should remain visible in the first viewport on normal Mac-wide use.
- When Needs Attention is absent, it consumes zero space.
- The Knowledge Map should normally begin within or close to the first viewport rather than being pushed far below by decorative whitespace.
- No persistent region may exist merely to make the page feel spacious.

Hard rule:

> **Useful density first; whitespace groups information but is not a visual goal.**

## 4｜Continue — ACCEPTED

`Continue` is the dominant Home object and restores the latest learner worksite.

Use existing browser-local last-location state plus exact local Block state where available.

It may translate real state into learner language such as:

```text
KP LEARN
KP RECALL
LOGIC GROUP
LG CLOSURE
BLOCK RECALL
BLOCK COMPLETE
SYSTEM GUIDE
```

The Home must fail closed when detail is unavailable. It must not invent an LG/KP position, percentage, mastery state, or fake progress merely to fill the composition.

Visual hierarchy:

```text
current System / Block location
→ current learner object
→ current stage / reliable position
→ one obvious continue action
```

Do not foreground:

- percentage progress;
- total hours;
- repository readiness;
- S/K/L/P/R/E/U;
- Block/KP counts as achievement metrics;
- generic study statistics.

Continue is a resume surface, not an analytics surface.

## 5｜Current Systems — ACCEPTED

Current learner-facing Systems are direct horizontal Home entries.

Only Systems that are honestly Current/projectable may become direct entries. Do not create fake disabled course cards for future domains.

Each entry prioritizes:

```text
canonical System ID
+ readable title
+ short Current-derived cognitive identity
+ entry/current status
```

A short identity may reuse Current System spine/mission material. Do not invent a slogan for visual symmetry.

Presentation:

- use one horizontal Mac index;
- typography, alignment and thin dividers before boxes;
- current System may receive a restrained positional emphasis;
- no System card wall;
- no large Block/KP counters as the primary choice signal.

## 6｜Needs Attention — ACCEPTED

Needs Attention appears only when real private learner state creates meaningful work.

Current eligible families include, when their owning Runtime actually has state:

- Memory / Today items;
- learner-requested Marked review;
- active Repair tasks;
- another explicitly owned pending return state.

The whole region disappears when empty.

Do not show congratulatory empty states and do not infer learner debt from engineering data.

## 7｜A–F Knowledge Map — ACCEPTED

The map is a compact global-position layer:

```text
A 心肺肾
B 消化·代谢·内分泌·肿瘤
C 血液·免疫·感染
D 神经·感觉·运动·骨科
E 生殖·乳腺
F 其余临床整合
```

A may additionally show its Current child Systems A1 / A2 / A3 when available.

The map is not:

- another mandatory learning step;
- six large course cards;
- a claim that every domain already has a learner-facing Runtime.

## 8｜Removed from repeated-use Home

Demote/remove from the normal Home:

- permanent `How it works`;
- permanent large Memory product promotion;
- learning-method explanation repeated every visit;
- repository-style counts/status;
- large cards for future/non-actionable domains;
- fixed companion/right explanation rail.

Help/onboarding may explain the learning method elsewhere when needed.

## 9｜Visual direction

Home inherits Shared Visual and Kian's current calibration:

- Mac-wide first;
- Chinese typography wide, solid and optically substantial;
- no negative tracking used to squeeze Chinese;
- high useful information density;
- strong hierarchy;
- continuous editorial workspace;
- restrained color;
- thin rules/alignment before containers;
- no SaaS/dashboard/card-wall feel;
- normal visible learner text comfortably above the minimum floor.

## 10｜Implementation / acceptance

Implementation may consume existing:

- last-location state;
- Block-local learner state;
- Memory learner state;
- Current System owner data.

Home does not own those semantics.

Acceptance path:

```text
accepted L3
→ bounded Home implementation
→ targeted build/runtime check
→ real Mac-wide screenshot
→ Kian Human Gate
```

Do not reopen Home responsibilities during implementation unless a real Rule/Content/Runtime conflict is found.
