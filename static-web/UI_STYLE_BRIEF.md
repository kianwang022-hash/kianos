# KianOS UI Style Brief

Status: **CURRENT SHARED VISUAL DIRECTION — EXPLICIT KIAN CALIBRATION 2026-09-18**  
Scope: learner-facing `static-web/`  
Preference owner: `KIAN_UI_PREFERENCES.md`  
Semantic parent: `PRESENTATION_CONTRACT.md` + exact domain Product/Learning/Interaction owners

This file turns Kian's durable UI preferences into **shared visual rules**. It does not own subject cognition, learning semantics, question truth, learner state or task-specific geometry.

These are **site-wide defaults** for Home, English, Xizong, Politics, Lexical and shared shell surfaces. A lane may vary them only when its real task/learning geometry requires a different treatment; local preference alone is not a reason to fork the shared visual language.

---

## 1｜目标气质

KianOS should feel like a **high-density, mature desktop learning workspace with editorial reading quality**.

The software should recede behind the task/content. The visual result should be calm, intentional and information-rich — not empty, tiny, engineering-heavy, or built from a pile of generic cards.

Primary visual reference qualities:

- Mac-wide desktop first;
- substantial useful information per viewport;
- stable, comfortable typography with visible visual weight;
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
- thin/light typography used to manufacture sophistication;
- every section wrapped in a rounded white panel;
- decorative gradients / excessive shadows;
- mobile layouts stretched across desktop width;
- exposing backend/debug status simply because the data exists.

---

## 2｜Typography is a primary design system

Typography is not final polish. It is one of the first layout systems and must establish hierarchy before boxes, decoration or color do the work.

### Hard readability floor

On the primary Mac-wide learner surface:

- **15px is the hard lower bound for normal default-visible learner text. It is not the target size.**
- normal secondary/navigation/control text should usually be **16px+**;
- body copy, explanations, relationships, task instructions and learning prose should usually be **17–18px+**;
- major content titles scale upward from the real hierarchy, not from a desire to create visual drama.

`metadata`, `secondary`, `quiet`, `helper`, or `caption` must not automatically mean tiny. De-prioritize with placement, tone, grouping and spacing before reducing size.

If a datum is not worth comfortably reading, hide it, defer it, or move it into an on-demand detail surface.

### Weight / optical solidity

Kian explicitly rejects learner-facing typography that feels thin, weak, pale or visually underpowered.

Shared default direction:

- do **not** use Thin / ExtraLight / Light as the normal learner-facing voice;
- ordinary learner-facing body/UI text should normally render with a **Regular-to-Medium optical weight**, commonly around CSS `500` when the chosen font supports it well;
- important task labels, current object names and high-value controls should usually sit around **550–650**;
- primary titles / subject names / focal actions should usually sit around **650–750**;
- very heavy display weight is not a substitute for hierarchy and should remain selective;
- exact numeric values may vary by typeface because equal CSS numbers do not produce equal visual weight, but the rendered result must feel stable and substantial rather than thin.

Hard rule:

> **Secondary does not mean thin.**

Lower priority first through position, tone, grouping, spacing and selective contrast. Do not make useful learner text small + light + gray at the same time.

A normal learner-facing screen should have a clear optical weight ladder:

```text
primary / focal       strong
important content     medium-to-strong
normal content        regular-to-medium
secondary             quieter, but still readable and solid
```

### CJK width / proportion

Chinese learner-facing typography must feel **broad, full-bodied and stable**. This is a rendered visual requirement, not a numeric-font-weight rule.

Hard rules:

- do not accept a narrow/condensed-looking CJK fallback merely because `font-size` and `font-weight` pass;
- shared Chinese UI should resolve through the CJK-first family stack before generic system UI fonts;
- do not use negative letter-spacing on Chinese headings/labels as a default compression technique;
- actual browser screenshots must verify glyph body/proportion as well as size, weight and contrast;
- if a CI/browser environment cannot render an adequately full CJK face, that screenshot is not valid Visual evidence for typography acceptance.

### Typeface roles

Shared chrome and Chinese/UI copy should favor a clean system-sans stack with strong CJK rendering and enough weight/contrast for sustained use.

English content does **not** have to inherit UI sans merely for consistency. Where the task is truly lexical/editorial reading, a serif English layer is explicitly allowed and preferred when it improves reading character.

Current durable direction:

- Chinese explanation / controls / navigation → clean system sans with substantial Regular/Medium rendering;
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

### Protect vertical working height on Mac

When the main learner object naturally scrolls vertically, vertical viewport height is the scarce resource.

Prefer:

```text
left/right persistent context
+ dominant vertically scrolling learner surface
+ optional side tools only when useful
```

over:

```text
stacked persistent headers
+ method/status/action strips
+ a compressed main learner viewport
+ persistent bottom chrome
```

A top subject bar may remain shared navigation, but page-local chrome should not keep consuming vertical height. Move durable context/navigation/tooling laterally when that improves the main task, and return the space when the side region has no useful content.

---

## 4｜Composition and hierarchy before components

A learner-facing page must first establish **visual composition**, not merely place all available backend fields into styled components.

Before implementation, identify:

```text
primary learner action / focal object
→ secondary supporting objects
→ reading / scanning path
→ major column or spatial geometry
→ only then component/container treatment
```

Hard rule:

> **Do not design by `data exists → make a component/card for it`.**

For a normal screen, one object/action should usually have clear focal priority. Other information may remain visible and dense, but should not compete at equal visual strength.

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

### Dashboard-smell guard

Unless the task semantics genuinely require them, avoid combining several of these patterns on one learner surface:

- giant rounded white page container floating on a gray background;
- KPI/stat tiles as primary composition;
- full-width colored command banner;
- several equal-weight rows that read like database records;
- progress bars used merely because progress data exists;
- repeated rounded cards for ordinary text/content;
- excessive pale gray/green surfaces that flatten contrast.

When these patterns appear together, treat the result as a **SaaS/admin dashboard smell** and redesign the composition before adding more polish.

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
- do not combine light font weight with pale text color for normal useful information;
- the principal black/gray hierarchy should remain decisive enough that the page does not feel covered by a gray veil;
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

- type scale and weight philosophy;
- contrast quality;
- composition-first hierarchy;
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

## 6.1｜Global shell and navigation

The shared desktop shell should behave like a mature workspace, not like repeated page-level navigation.

### Collapsible global rail

- When a persistent global navigation shell is present on Mac, the default shared form is a **left rail**.
- The KianOS / `K` control toggles the rail between:
  - compact icon-only mode for maximum task width;
  - expanded icon + label mode for orientation and browsing.
- The last chosen rail state should persist across normal navigation instead of resetting on every page.
- Collapsing the rail changes only shell width / chrome. It must not reset learner state, task state, scroll position, answers, timers or current object.
- Pages that already need a local learning/navigation rail may keep the global rail compact so two side rails do not waste Mac width.

### One global navigation, not two

- A global destination should appear in **one primary global-navigation surface**.
- Do not repeat the same-level destinations in both the left rail and a full-width top navigation bar.
- A top strip is allowed only when it is genuinely local to the current surface: task mode, local tabs, filters, phase/view switch, or context controls.
- Page-local navigation may organize the current object or subject, but it must not recreate the whole KianOS global menu.
- If a second navigation row does not change the current task/context more specifically than the global rail, it is duplicate chrome and should be removed.

Legacy `4173` is positive interaction evidence for the collapsible rail behavior and dense desktop navigation feel; it is not semantic/runtime authority.

---

## 7｜Home / Hub / Search surfaces

Home-like surfaces are **workbenches**, not marketing pages or analytics dashboards.

They should prioritize:

- meaningful Continue / Resume;
- current task choices;
- high-value subject or tool entry;
- useful status / next action when it belongs there;
- optional Guide / companion tools without dominating the main work.

Avoid giant hero copy, decorative whitespace, method-explanation walls, duplicated navigation, generic dashboard cards, KPI-first composition, full-width decorative status banners and tiny labels scattered across empty panels.

A Home surface should make good use of the first viewport and let the learner understand what can be done next without reading software documentation.

The primary next action should normally be established through **position + type + hierarchy**, not by turning it into an oversized colored dashboard banner.

Subject rows/sections should read as **real learning workstreams**, not as database records with equal-weight metric columns.

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
4. check font **weight and actual rendered family/glyph proportion**, not only font size;
5. check effective information density and wasted space;
6. check focal priority / visual scan path;
7. check for SaaS/admin/dashboard smell;
8. check whether the page feels like learning/content rather than software/debug UI;
9. verify the task-native geometry and functionality remain intact;
10. fix obvious visual defects;
11. stop when the bounded surface is genuinely good enough — do not enter endless polish.

When Kian is actively calibrating taste, show representative screenshots before promoting the result into a shared rule.

A local page may be accepted without implying all subjects should copy its layout.

### Four independent gates

A learner-facing UI change must be tracked as four separate acceptance dimensions:

```text
Functional Gate  = behavior / runtime still works
Structural Gate  = visual ownership and implementation are coherent
Visual Gate      = composition, typography, hierarchy and finish are genuinely good
Human Gate       = Kian accepts the real representative surface for regular use
```

Hard rules:

- Functional PASS does not imply Visual PASS.
- Clean CSS / single-owner PASS does not imply Visual PASS.
- CI/build/browser mechanics do not substitute for screenshot inspection.
- A materially taste-driven surface does not reach final acceptance while the Human Gate is failed.

### Single visual owner

A learner-facing surface must have **one active visual owner for each presentation responsibility**.

- Do not control the same surface through a page-local style block plus lane CSS plus `*-polish.css` plus `*-qa-fixes.css` plus later `!important` recovery.
- Preferred structure is: shared shell/tokens + one clear lane/surface stylesheet + only genuine state/responsive rules owned inside that same layer.
- If changing a font, spacing rule, rail width or card treatment requires tracing several override files, treat that as an ownership defect and consolidate before further polish.
- Temporary compatibility CSS must have a deletion condition; it must not become a permanent second visual owner.

### UI-only fast lane

Pure visual work should be fast to iterate and heavy only at final acceptance.

Default workflow:

```text
agree target + preserve list
→ establish focal hierarchy / composition before component polish
→ make one coherent visual round in the local/temporary implementation surface
→ local build/browser check
→ capture representative screenshots
→ Kian reviews the real surface
→ revise as a batch if needed
→ only after visual acceptance, push one coherent GitHub PR
→ run targeted CI/regression once
→ merge
```

Hard rules:

- Do not trigger remote CI after every font/spacing/whitespace micro-adjustment.
- Do not split one visual round into many tiny GitHub commits merely because the connector can write one file at a time.
- UI-only work should not wait on unrelated domain/lane test suites; run the smallest relevant regression set unless shared runtime/semantics actually changed.
- During active visual calibration, screenshots are the primary review artifact; GitHub history should receive the accepted coherent result, not every intermediate experiment.
- Content/Truth changes keep their normal canonical GitHub path; this fast lane applies only to bounded visual implementation that does not change Learning/Runtime/Evidence semantics.

---

## 13｜Authority boundary

- `KIAN_UI_PREFERENCES.md` owns explicit personal UI/taste evidence.
- this file owns the **shared visual language derived from those preferences**.
- lane Product Briefs / exact surface owners own task-specific visual decisions.
- `PRESENTATION_CONTRACT.md` owns cognition → safe representation boundaries.
- domain Learning / Interaction / Runtime / Evidence owners outrank visual taste when a true semantic conflict exists.

This file must not create a second Learning Truth, task workflow, learner state or content owner.

Old visual references and legacy screenshots are evidence only. They may inspire typography/density/interaction quality but cannot restore retired semantics or runtime behavior.
