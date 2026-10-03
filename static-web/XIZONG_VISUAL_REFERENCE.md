# Xizong Visual Reference

Status: **CURRENT VISUAL REFERENCE / NON-SEMANTIC**  
Scope: Xizong learner-facing UI convergence  
Authority: `static-web/PRESENTATION_CONTRACT.md` + `static-web/XIZONG_PRODUCT_BRIEF.md` + `static-web/XIZONG_VISUAL_LANGUAGE.md`. This file is non-semantic reference evidence only.

## 1｜Reference direction

The accepted direction is the current KianOS visual family after the recent convergence work, informed by the earlier KianOS desktop releases that Kian explicitly used as style references.

Do **not** redesign Xizong into a generic SaaS dashboard, a mobile-first card feed, a decorative glass/gradient product, or a sparse minimalist document site.

Target feeling:

> **Dense Calm · desktop-native · restrained · readable · information-rich without looking busy.**

## 2｜Visual language

- deep forest green is the structural / identity color;
- main learning surfaces remain white or very light neutral / pale green-gray;
- borders are thin, quiet and semantic; avoid heavy shadows;
- corner radius is restrained and consistent; do not make every object a floating card;
- green is used for active state, navigation, important learner actions and semantic emphasis, not decorative saturation;
- typography carries hierarchy before borders/backgrounds do;
- learner text is comfortably large; never recover density by shrinking text into tiny UI labels;
- secondary labels may be small, but important medical / learning content must remain immediately readable;
- controls are compact, clear and low-chrome.

## 3｜Density and spacing

Kian prefers **recent high-density Mac layouts**, not the older sparse home-page spacing.

- use horizontal room aggressively when simultaneous information is useful;
- normal Learn / Recall / Memory work should stay within one stable viewport where practical;
- if content exceeds the viewport, scroll the relevant local pane (Core, Logic Map, Visual/auxiliary panel, Memory list) rather than turning the whole product into a long vertical page;
- whitespace should separate logical regions, not create large empty deserts;
- avoid stacked full-width cards when columns / aligned rows / shared surfaces communicate the same structure more efficiently;
- preserve comfortable breathing room inside dense regions so density does not become crowding.

## 4｜Xizong Block workspace implication

Normal Mac-wide Block learning should visually read as one coherent workspace whose **Main** is dominant:

```text
thin System / Block locator
+ dominant integrated Block medical map or current KP Recall object
+ optional/collapsible LG/KP navigation
+ dynamic Context for MedicalVisual / Precision / Source when useful
```

- do not reserve a permanent wide left Logic-Map rail during integrated Block-map reading; local LG/KP position remains available as secondary/collapsible navigation and may become more visible in Recall/Source states;
- the main medical/cognitive region is visually dominant and receives unused width;
- the right/context area expands when a real MedicalVisual / table / Precision object earns space and shrinks/disappears when it does not;
- Source / Outline locators stay compact near the owning knowledge identity;
- no large persistent workflow dashboard competes with the learner object;
- the Block medical map is the first-pass/reconstruction cognitive surface; Framework/Guide material remains reachable without becoming a second competing body;
- Crosswalk / Memory / Repair must not stack underneath the Block workspace as an endless page.

## 5｜Memory workspace implication

Memory is a separate Xizong workspace, not an `After Learn` section appended below every Block.

Preferred top-level views:

```text
Today | Core | Precision | Marked | Repair
```

Use the same visual family and one-screen preference as the Block workspace: compact navigation, dominant current review object, local scrolling, no dashboard sprawl.

## 6｜Reference-vs-authority rule

Historical screenshots are **visual inspiration only**. They may contribute proven spacing, density, hierarchy, color restraint and desktop feel; they do not restore historical routes, state machines, learning semantics, sidebar architecture or obsolete components.

If an old visual conflicts with Current Learning / Projection / Runtime semantics, Current semantics win and the old visual is adapted rather than copied.

For future UI work, the required interpretation is:

```text
Current Learning / Product semantics
→ Presentation Contract
→ this current visual preference reference
→ implementation
```

Do not infer new learning rules from screenshots, and do not ignore this visual reference merely because a new component library makes another style easier to build.
