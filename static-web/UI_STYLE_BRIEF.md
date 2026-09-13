# KianOS UI Style Brief

Status: ACTIVE DISCUSSION / SHARED VISUAL OWNER  
Scope: all learner-facing `static-web/` surfaces  
Parent: `static-web/PRESENTATION_CONTRACT.md` + `static-web/CURRENT.md`

This file owns the shared visual-language and aesthetic constraints for KianOS learner-facing UI. It does **not** own domain learning logic, task geometry, evidence/mastery semantics, source truth, or learner progress.

The purpose is to prevent each lane / Codex implementation from inventing its own visual language while still allowing task-native layouts to differ.

---

## 1｜Primary environment

Design origin is **Mac wide landscape desktop**.

- Use horizontal space intentionally for simultaneous context / work.
- Do not design mobile-first and then stretch the result across a Mac screen.
- Narrower responsive layouts are fallback/degradation paths only.
- Main learner workspaces may use most of the available viewport width when cognition benefits from it; avoid a narrow centered document column surrounded by wasted whitespace.

---

## 2｜Visual character｜Dense Calm

Target character:

> **Dense Calm — restrained, readable, high-information, structurally clear, low-fatigue.**

KianOS should feel closer to a refined professional workbook / native desktop productivity tool than a dashboard, marketing site, or decorative study app.

Required qualities:

- minimal but not empty;
- visually calm but not low-information;
- large / comfortable learner text;
- strong hierarchy and contrast;
- useful density without crowding;
- clear spatial relationships;
- restrained decoration;
- interactions should feel direct and obvious;
- the task/content should dominate over KianOS chrome.

Avoid:

- persistently tiny text;
- giant blank whitespace used as “minimalism”;
- card/panel piles;
- every object boxed into a rounded rectangle;
- flashy gradients / saturated multi-color decoration;
- playful SaaS dashboard aesthetics;
- over-animated transitions;
- excessive badges, pills, counters and status chips;
- large engineering/runtime banners;
- visual novelty that slows repeated daily use.

---

## 3｜Hierarchy before decoration

Prefer these tools, in this order:

1. typography;
2. alignment;
3. spacing/rhythm;
4. indentation / grouping;
5. divider / line / subtle background;
6. border or card only when a real semantic / interaction boundary exists;
7. color only when it carries meaning.

Do not use a card simply because a component already exists.

A learner should first notice:

```text
what I am doing
→ the material / prompt / question / answer space
→ the next meaningful action
```

and only then notice KianOS navigation/chrome.

---

## 4｜Typography direction

Exact font family remains to be selected before final Codex handoff; do not freeze a specific typeface yet.

However, the typographic behavior is already constrained:

- body text must be comfortably readable for long sessions;
- English long-form reading gets generous line-height and a readable measure;
- question/options must not drop into tiny 8–10px learner text;
- metadata may be smaller, but cannot become the primary way the page communicates;
- headings should be compact and structural, not oversized marketing hero text;
- numbers / timers / progress should be quiet and stable;
- exam-like surfaces should preserve paper-like scanability rather than look like app cards.

Default principle:

> **Readable first, compact second, decorative last.**

---

## 5｜Color direction

Exact palette remains open for final visual selection.

Frozen behavior:

- use a restrained neutral base;
- one primary accent family is preferred over multiple competing brand colors;
- color should mainly communicate interaction/state, not decorate empty space;
- selected-before-submit must not look “correct”;
- correct / wrong / uncertain need distinct but restrained treatments;
- do not rely on color alone for correctness or state;
- avoid saturated Arc-like visual noise.

The current green family may be retained, refined, or replaced during final palette choice; its existence in current CSS is not itself design authority.

---

## 6｜Surface geometry

Shared visual language does **not** mean identical layouts.

Task geometry follows cognition:

- Reading A: passage + full question sheet;
- Cloze: complete passage + full 20-row exam-paper answer sheet;
- Part B: full material / candidate inventory / complete map;
- Translation: source + learner translation;
- Writing: prompt + dominant authoring area;
- Xizong / Politics: maps, chains, recall, question workbench, external-source companion surfaces as defined by their product briefs.

The visual system should unify:

- typography;
- spacing;
- controls;
- selected / focus / correct / wrong / uncertain states;
- header / breadcrumb / return behavior;
- buttons / inputs / textareas;
- secondary details;

It must **not** flatten different cognitive objects into one component template.

---

## 7｜Controls and interaction styling

Controls should feel lightweight, desktop-native and repeatable.

- primary action is obvious but not oversized;
- secondary actions are visually quieter;
- destructive/reset/debug actions stay out of the main action line;
- keyboard shortcuts may be shown as subtle hints, not large badges;
- focused/selected state should be crisp and visible;
- selected answer before submit uses a quiet outline/check treatment and never correctness color;
- buttons should not all look equally important;
- text inputs / textareas should feel like writing/answer surfaces, not form-builder widgets.

For high-frequency exam work, prefer direct click / key interaction over modal confirmation rituals.

---

## 8｜Borders / radius / shadows

Use restraint.

- border radius should be modest and consistent;
- large rounded “floating cards” are not the default visual unit;
- shadows should be subtle and rare, mainly for true elevation / overlay;
- flat alignment/dividers are preferred for exam sheets and dense workspaces;
- in-place repair/review should expand naturally within the existing sheet rather than spawn floating cards everywhere.

---

## 9｜Motion

Motion is supportive, not expressive.

Allowed:

- short focus/selection transitions;
- small in-place reveal/expand;
- smooth but not theatrical scroll-to-linked-object when useful.

Avoid:

- decorative entrance animations;
- large sliding panels for ordinary task changes;
- motion that delays answer/next-item throughput;
- bouncy / playful interaction language.

---

## 10｜Home / shell aesthetic

KianOS Home and lane Homes should look like a coherent desktop learning workspace, not an analytics dashboard.

Prioritize:

```text
Continue / Resume
→ lane / task entry
→ secondary tools
```

Avoid foregrounding:

- build SHA;
- runtime health;
- engineering status;
- large progress dashboards without real learner evidence;
- decorative KPI cards.

Navigation should be thin, stable and predictable.

---

## 11｜Reference taste boundary

General taste direction from Kian's prior feedback:

- likes restrained / simple / logical interfaces;
- prefers larger readable type and stronger contrast;
- values Apple-like low-friction interaction quality;
- Raycast-level restraint is acceptable;
- dislikes visually loud, overly colorful, flashy Arc-like treatment;
- dislikes interfaces that are either too empty or too tiny/dense to read comfortably.

These are taste constraints, not instructions to clone any named product.

---

## 12｜Unresolved visual choices before Codex implementation

Must be deliberately chosen/frozen before first production UI PR:

1. exact font stack / typography scale;
2. exact neutral + accent palette;
3. border-radius / divider / elevation token set;
4. global spacing scale;
5. shared top navigation / breadcrumb visual treatment;
6. primary / secondary / quiet button treatment;
7. selected / focus / correct / wrong / uncertain state tokens;
8. form / textarea styling;
9. final Home visual composition;
10. dark mode: explicitly in-scope or deferred.

Do not ask Codex to invent these independently per page.

---

## 13｜Codex acceptance

A learner-facing implementation is not visually accepted merely because it is functional.

For each bounded UI PR, require:

- real Mac-wide browser screenshots;
- clean-attempt screenshot;
- problem/review screenshot where applicable;
- narrow fallback screenshot;
- comparison against this Style Brief + the lane Product Brief;
- Sol/Kian product review before merge.

Aesthetics are part of product acceptance, but never permission to alter learning semantics.
