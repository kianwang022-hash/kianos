# KianOS UI Style Brief

Status: **CURRENT SHARED VISUAL DIRECTION — EXPLICIT KIAN CALIBRATION 2026-09-17**  
Scope: learner-facing `static-web/`  
Preference owner: `KIAN_UI_PREFERENCES.md`  
Semantic parent: `PRESENTATION_CONTRACT.md` + exact domain Product/Learning/Interaction owners

This file turns Kian's durable UI preferences into **shared visual rules**. It does not own subject cognition, learning semantics, question truth, learner state or task-specific geometry.

---

## 1｜目标气质

KianOS should feel like a **high-density, mature desktop learning workspace with editorial reading quality**.

The software should recede behind the task/content. The visual result should be calm, intentional and information-rich — not empty, tiny, engineering-heavy, or built from a pile of generic cards.

Primary visual reference qualities:

- Mac-wide desktop first;
- substantial useful information per viewport;
- stable, comfortable typography;
- strong hierarchy and alignment;
- restrained color;
- low chrome;
- little wasted space;
- subject-native learning geometry;
- editorial/knowledge-tool feel rather than SaaS/admin/documentation-site feel.

Avoid:

- giant empty hero stages;
- sparse pages with tiny text;
- generic card dashboards;
- thin gray engineering metadata;
- every section wrapped in a rounded white panel;
- decorative gradients / excessive shadows;
- mobile layouts stretched across desktop width;
- exposing backend/debug status simply because the data exists.

---

## 2｜Typography is a primary design system

### Hard readability floor

On the primary Mac-wide learner surface:

- **15px is the hard lower bound for normal default-visible learner text. It is not the target size.**
- normal secondary/navigation/control text should usually be **16px+**;
- body copy, explanations, relationships, task instructions and learning prose should usually be **17–18px+**;
- major content titles scale upward from the real hierarchy, not from a desire to create visual drama.

`metadata`, `secondary`, `quiet`, `helper`, or `caption` must not automatically mean tiny. De-prioritize with placement, tone, weight and grouping before reducing size.

If a datum is not worth comfortably reading, hide it, defer it, or move it into an on-demand detail surface.

### Typeface roles

Shared chrome and Chinese/UI copy should favor a clean system-sans stack with strong CJK rendering and enough weight/contrast for sustained use.

English content does **not** have to inherit UI sans merely for consistency. Where the task is truly lexical/editorial reading, a serif English layer is explicitly allowed and preferred when it improves reading character.

Current durable direction:

- Chinese explanation / controls / navigation → clean system sans;
- Lexical English word heads / definitions / phraseology / lexical prose → editorial serif is preferred, using the legacy `4173` feel as positive visual evidence;
- long exam passages may preserve their own reading typography when task-native and readable;
- do not force one font family onto every subject/surface.

No external font dependency is required to satisfy this direction; use robust available stacks first.

---

## 3｜Density and screen-space rule

A large Mac viewport must earn its area.

### Effective information density

Every persistent region should do at least one of these:

1. show information worth seeing now;
2. support the current learner action;
3. provide a high-value control or return path.

Large empty regions, decorative spacing, duplicate headings and software self-description do not count as useful density.

### Hard anti-pattern

> **Low density + small text is unacceptable.**

If the page is sparse, use the available screen better and keep text comfortably readable. Do not create an empty page and then make the few visible words 10–14px.

When a surface is genuinely dense, modest size reduction may be considered for non-body text, but never below the readability floor just to keep a composition intact.

Whitespace is a tool for grouping and scanning, not an aesthetic target. A deliberately open recall/reveal stage is allowed only when the cognitive action benefits from it, and should not be larger than that purpose requires.

Use horizontal space deliberately: side-by-side context, comparison, full task sets, stable local navigation and information rails are preferred over unused margins.

---

## 4｜Hierarchy before containers

Organize content in this order:

```text
typography
→ alignment
→ column geometry
→ spacing / indentation
→ thin rules
→ subtle background zones
→ borders/cards only when a real semantic or interactive boundary exists
```

Cards are not the default organizational primitive.

### Card / border / shadow policy

- continuous learning content should usually read as one editorial surface;
- use thin dividers and alignment before wrapping each object in a rounded card;
- rounded containers are appropriate for real controls, answer options, focused interaction areas, small bounded widgets, popovers and temporary tools;
- shadows are reserved mainly for genuine floating layers / overlays;
- large rounded white boxes with shadow should not be used merely to make ordinary text look like a component;
- one page should not become a stack of visually unrelated panels unless the learner task truly consists of separate objects.

---

## 5｜Color and contrast

Use a neutral base with restrained accent.

- body text should remain dark enough for sustained reading;
- secondary text may be quieter but not washed out;
- green is a shared KianOS structural/accent family, not a paint bucket for every border, heading and background;
- blue or other local accents may remain when they carry a real task-native meaning, such as current selection;
- state meaning must not rely on color alone;
- before submit, selected means only `my current choice`, never `correct`;
- Wrong / meaningful Uncertain / failure / saved states should be distinct but visually restrained.

Do not use pale-on-pale styling to manufacture sophistication.

---

## 6｜Shared language, different native surfaces

KianOS should look related across subjects without forcing every task into one layout.

Shared across subjects:

- type scale philosophy;
- contrast quality;
- spacing rhythm;
- control quality;
- focus / keyboard states;
- return / handoff quality;
- border / radius / shadow restraint;
- density discipline;
- real screenshot acceptance.

Task-specific geometry stays with its owner.

Examples:

- Reading A → passage + full question set, both independently scrollable;
- Cloze → full passage + all 20 items together;
- Part B → complete material / candidate / placement context;
- Translation task → source + authored translation simultaneously visible;
- Writing task → prompt + dominant authoring workspace;
- Objective / Translation Guide → high-density long-form learning document with local navigation;
- Writing Guide → interactive generation/primitive workspace, not forced into long-form document geometry;
- Lexical → vocabulary-specific editorial typography and sense/usage structure;
- Politics / Xizong → their own cognition-safe structures and source/runtime boundaries.

Do not generalize one successful page into a universal template.

---

## 7｜Home / Hub / Search surfaces

Home-like surfaces are **workbenches**, not marketing pages.

They should prioritize:

- meaningful Continue / Resume;
- current task choices;
- high-value subject or tool entry;
- useful status / next action when it belongs there;
- optional Guide / companion tools without dominating the main work.

Avoid giant hero copy, decorative whitespace, method-explanation walls, duplicated navigation, generic dashboard cards and tiny labels scattered across empty panels.

A Home surface should make good use of the first viewport and let the learner understand what can be done next without reading software documentation.

---

## 8｜Guide / First-Learning surfaces

A Guide is allowed to be long, dense and scrollable.

- default-visible useful content should be readable and substantial;
- local navigation is welcome when it reduces search cost;
- important first-round structure should not be hidden behind repeated accordions merely to make the page look clean;
- genuinely deep/reference/later-phase content may remain collapsed when domain authority says it is secondary;
- Guide presentation must not delete semantic detail just to fit one screen;
- use editorial rhythm, headings, side navigation and thin rules before cards.

The user should feel they are reading/learning, not inspecting an internal design system.

---

## 9｜Exam / Perform surfaces

Exam-like workspaces preserve whole-task geometry and useful simultaneous context.

Scrolling is acceptable when it matches the real task. Do not split a native whole object into a wizard because components are easier to implement that way.

After submit, Wrong/Uncertain may reveal more information in place while preserving the original task context.

Do not shrink question/body text to fit more chrome around the task.

---

## 10｜Interaction quality

Controls should feel predictable, low-friction and desktop-native.

- primary / secondary / quiet actions should be visually distinct without being loud;
- focus states must be visible;
- pointer and keyboard should preserve the same meaning;
- Chinese IME input must outrank learning shortcuts while composing;
- stable work should not jump layout unexpectedly;
- save/loading/error/disabled states should be clear and recoverable;
- destructive reset may keep necessary confirmation boundaries;
- important structure should be visible by default when Mac width can carry it comfortably.

---

## 11｜Motion

Allow subtle motion only when it helps state understanding:

- hover/focus;
- local expand/collapse;
- submit/reveal;
- useful linked-object focus.

Avoid spring/bounce, large page entrances, staggered card choreography, scroll spectacle and animation that delays the next learning action.

Respect reduced motion and avoid post-load layout jumps.

---

## 12｜Visual acceptance

`build PASS` is not visual acceptance.

For meaningful learner-facing visual changes:

1. render a real representative Mac-wide page;
2. inspect the real screenshot;
3. check the smallest default-visible learner text;
4. check effective information density and wasted space;
5. check whether the page feels like learning/content rather than software/debug UI;
6. verify the task-native geometry and functionality remain intact;
7. fix obvious visual defects;
8. stop when the bounded surface is genuinely good enough — do not enter endless polish.

When Kian is actively calibrating taste, show representative screenshots before promoting the result into a shared rule.

A local page may be accepted without implying all subjects should copy its layout.

---

## 13｜Authority boundary

- `KIAN_UI_PREFERENCES.md` owns explicit personal UI/taste evidence.
- this file owns the **shared visual language derived from those preferences**.
- lane Product Briefs / exact surface owners own task-specific visual decisions.
- `PRESENTATION_CONTRACT.md` owns cognition → safe representation boundaries.
- domain Learning / Interaction / Runtime / Evidence owners outrank visual taste when a true semantic conflict exists.

This file must not create a second Learning Truth, task workflow, learner state or content owner.

Old visual references and legacy screenshots are evidence only. They may inspire typography/density/interaction quality but cannot restore retired semantics or runtime behavior.
