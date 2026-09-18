# Xizong Visual Language — L2 subject visual owner

Status: **ACCEPTED L2 BASELINE — 2026-09-18**  
Scope: learner-facing Xizong subject family only  
Parent L1 owners: `static-web/KIAN_UI_PREFERENCES.md` + `static-web/UI_STYLE_BRIEF.md`  
Product owner: `static-web/XIZONG_PRODUCT_BRIEF.md`

This file defines the **subject-level visual language** for Xizong.

It does not own:
- medical Content;
- Learning Logic;
- Runtime / Evidence semantics;
- per-Surface L3 geometry;
- global KianOS shell / shared visual tokens.

Hierarchy:

```text
L1 Shared Visual / Preferences
→ L2 Xizong Visual Language
→ L3 exact Surface Blueprint
   Home / System / Block / Recall / Practice / Memory
```

A learner-facing Xizong L3 surface must satisfy L1 and this L2 before its local Human Gate can pass.

---

## 1｜Subject character

Xizong should feel like a **medical cognition workspace**.

It is not primarily:
- a course website;
- a SaaS/dashboard;
- an electronic textbook;
- a generic flashcard/study app;
- a question-bank app.

Desired character:

```text
medical content is visually primary
+ structure is explicit
+ information may be dense
+ software chrome stays quiet
+ typography is broad / stable / readable
+ Mac width is used intentionally
```

Compared with other lanes, Xizong may be structurally stronger because its native cognitive work often involves mechanism, localization, causal chains, discrimination and application. That does not authorize decorative diagrams or invented relations.

---

## 2｜Typography — Xizong-specific direction

### 2.1 Rendered character

Chinese learner text must feel:

```text
broad
stable
full-bodied
calm
not narrow
not lanky
not squeezed
not excessively heavy
```

The rendered screenshot outranks nominal CSS font-weight/family values.

Preferred robust Mac-first stack:

```css
-apple-system,
BlinkMacSystemFont,
"PingFang SC",
"Hiragino Sans GB",
"Microsoft YaHei",
"Noto Sans CJK SC",
"Noto Sans SC",
sans-serif
```

A fallback is unacceptable if the real Chinese glyph body becomes visibly condensed/narrow.

### 2.2 Working scale

Primary Mac-wide target ranges:

```text
secondary UI / quiet labels      15–16px / 500–550
normal learner body              17–18px / ~500
Core / explanation / options     17–18px / 500–550
question stem / Recall prompt    20–22px / 550–600
local section title              20–24px / 600–650
major page / object title        28–36px / ~650
```

These are optical targets, not rigid tokens for every component.

Hard rules:
- 15px is an absolute floor, not the body target;
- do not use negative letter-spacing on normal Chinese learner-facing text/headings;
- do not use pervasive 700/800 weight to manufacture hierarchy;
- secondary text must not become small + pale + thin simultaneously;
- prefer readable Regular/Medium text over “UI-bold everywhere”;
- metadata that is not worth reading should usually be hidden/demoted instead of miniaturized.

Legacy is positive evidence for broad comfortable typography and reading rhythm only. It is not semantic/runtime authority and should not be cloned wholesale.

---

## 3｜Composition before components

Xizong should organize content in this order:

```text
typography
→ alignment
→ indentation / hierarchy
→ column geometry
→ spacing
→ thin dividers
→ subtle background zones
→ cards only for real bounded objects
```

Hard anti-pattern:

```text
ordinary knowledge field
→ make a rounded card
→ repeat 6–10 times
```

Knowledge content should usually read as one continuous cognitive/editorial surface.

Prefer:

```text
机制主链
────────────────
content

Failure
────────────────
content

鉴别 / 边界
────────────────
content
```

over repeated peer cards.

Rounded containers remain appropriate for:
- answer options;
- inputs;
- explicit controls;
- temporary tools;
- popovers / overlays;
- truly bounded interactive objects.

Large decorative shadows and floating white-card stacks are not the default Xizong language.

---

## 4｜Shared spatial grammar

Complex Xizong workspaces use **roles**, not mandatory fixed columns:

```text
Structure | Main | Conditional Context
```

### Structure
Owns:
- location;
- map;
- local navigation;
- current cognitive position.

It must not become a second body-text column.

### Main
Owns:
- the current learner action;
- the primary medical/cognitive object.

It is always the dominant region.

### Conditional Context
Owns only context that is useful **now**, for example:
- Current Visual;
- Precision;
- explanation/review;
- exact source/context;
- reviewed repair return.

Hard rule:

> **If Context has no useful current object, Main gets the width back.**

Do not preserve empty rails merely for layout symmetry.

The same role grammar may produce two columns, three columns, or one dominant paper depending on the task.

---

## 5｜State-specific visual density

The learner should be able to feel the current learning state even before reading the page title.

### Learn

```text
richest state
structure stays visible
complete Current content remains available
Context appears when useful
scrolling is normal
```

Do not force Learn into one viewport by shrinking or deleting meaningful content.

### Recall

```text
quieter state
orientation skeleton remains
prompt / reconstruction becomes dominant
answer-bearing content stays protected
Reveal restores a compressed Current model
```

Recall should visibly feel like “I am reconstructing”, not Learn with different buttons.

### Practice

```text
tool-like
high throughput
stable geometry
low interaction tax
prefer one-screen Mac workbench
local scrolling
```

Question position, answer interaction and review should not jump around unnecessarily.

### Memory

```text
thin selective recovery
weak-object positioning
→ Recall
→ Reveal
→ rating
```

Memory must not become a second course or dashboard.

---

## 6｜One-screen rule

“One screen” is a task rule, not an all-Xizong aesthetic.

### Prefer one-screen / protected viewport

- Practice primary workbench;
- current KP Recall object when feasible without thinning Core;
- System Recall Front;
- Block Recall Front;
- Memory current Recall.

### Natural long-form / local scroll is valid

- System Framework;
- Block Framework / Guide;
- dense KP Core after Reveal;
- System Recall Reveal when Current cognition is large;
- deep explanation / review;
- other intrinsically dense accepted Current objects.

Hard rule:

> **Never reduce semantic density or shrink learner text merely to preserve a one-screen composition.**

---

## 7｜Color and tone

Xizong defaults to a neutral, slightly cool working surface.

Primary hierarchy:

```text
near-black / deep gray   = medical/content body
stable mid-gray          = secondary context
white / very light neutral gray = surfaces / zones
green                    = current / active / structural accent / primary action
warm red                 = Wrong / genuine failure
warm amber               = learner Marked or another explicit learner-owned state when needed
```

Hard rules:
- no large cream/yellow cast as the default Xizong canvas;
- no whole-page pale-green wash;
- green is not used simultaneously for every border, heading, background, badge and button;
- decorative color must not compete with medical content;
- state meaning never relies on color alone.

The subject should feel cleaner/cooler than the earlier warm/yellow-tinted prototypes.

---

## 8｜Borders, radius and elevation

Subject direction:

```text
continuous knowledge body   usually no rounded container
major bounded workspace     ~8–12px radius allowed
answer/input/control         ~6–9px
popover / true floating UI  ~10–12px + restrained shadow
ordinary grouping           alignment + divider first
```

Do not use high radius as a default “modern” treatment.

Shadows are mainly for true elevation, not ordinary knowledge sections.

---

## 9｜Controls and chrome

The task should be more noticeable than the software.

### Primary
One clear solid action is allowed when a stage genuinely needs a primary action.

### Secondary
Prefer white / neutral background with thin boundary.

### Quiet controls
Navigation, Fast, Mark, local toggles and utility actions should usually stay visually quiet.

Avoid:
- a toolbar made entirely of colorful pills;
- permanent keyboard-help banners;
- repeated badges for every state/data point;
- engineering/provenance chrome in learner focal regions.

Use text hierarchy and placement before adding button weight.

---

## 10｜Family coherence without template cloning

All Xizong surfaces should share:

- typography character;
- black/gray hierarchy;
- green usage semantics;
- divider language;
- control quality;
- Structure/Main/Conditional Context logic;
- readable density;
- restrained card/elevation policy.

They must **not** share one generic geometry.

Native roles remain different:

```text
Home      = workbench / routing
System    = cognitive map / framework
Block     = learning workspace
Recall    = reconstruction space
Practice  = high-throughput training tool
Memory    = selective recovery
```

“Looks like one product” comes from language, not copy-pasting one three-column component.

---

## 11｜L3 constraint

Before implementing or accepting an Xizong L3 surface:

```text
read L1
→ read this L2
→ read the exact Product / Learning / Runtime owner
→ define focal learner action
→ define Structure / Main / Context roles
→ decide whether one-screen applies
→ design local geometry
→ real Mac screenshot
→ Human Gate
```

An L3 surface may depart from a numeric size/column suggestion when its task genuinely requires it, but it must still satisfy the L2 principles or explicitly reopen this owner.

A local implementation prototype is not Visual Truth until its L3 Human Gate passes.

---

## 12｜Current L3 acceptance state

At the time this L2 is accepted:

- Home has prior Human-Gate evidence;
- System Framework has prior discussed/accepted product direction;
- Block Workspace / Block Recall has prior Human-Gate evidence;
- System Recall candidate has functional/runtime acceptance but requires visual re-review under this L2;
- Practice front/back L3 has accepted visual/runtime evidence for main: Front = Question + Progress; Back = quick learner feedback + Knowledge Review; shared L1 CJK typography remains authoritative;
- Memory retains its accepted learning/evidence role; future material visual changes must also follow this L2.

Do not infer that a green build/browser test means the new Recall/Practice visual composition is accepted.

---

## 13｜Compact rule

> **西综 = 医学认知工作台：字要宽稳，内容要主导，结构要清楚，卡片要克制；Learn 丰富、Recall 安静、Practice 紧凑、Memory 精简；L3 可以各有几何，但不能各有审美。**
