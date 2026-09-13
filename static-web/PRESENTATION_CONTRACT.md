# KianOS Static-Web Presentation Contract

Status: CURRENT

This file owns the shared **projection grammar** for `static-web/` learner surfaces.

It is downstream of:

- `LEARNING_ASSET_STANDARD.md` for construction order;
- `SYSTEM_CONTRACT.md` for shared learner-surface capabilities and surface boundaries;
- each domain `LEARNING_CONTRACT.md` for cognition, learner order, and surface ownership;
- domain interaction/presentation contracts for lane-specific semantic shapes.

It does **not** own domain knowledge, source truth, learner progress, question answers, or one universal page layout.

Its job is narrower:

> **Given an approved cognitive action, approved content semantics, and approved surface ownership, how should KianOS turn them into a learner-facing workspace without collapsing back into a document renderer or component pile?**

---

## 1｜Projection starts from cognition, not components

The shared projection chain is:

```text
Learning Logic
→ Content semantics
→ current cognitive state
→ semantic presentation object(s)
→ spatial / interaction representation
→ Astro component implementation
```

Forbidden shortcut:

```text
JSON fields / Markdown headings
→ cards / sections / buttons
→ page
```

Hard rule:

```text
Content structure ≠ page structure.
Semantic object ≠ UI component.
Component availability ≠ representation choice.
```

A component may implement a semantic role. It must not define the role merely because it already exists.

---

## 2｜Primary environment: Mac landscape workspace

The primary KianOS web learning environment is **Mac / wide landscape desktop** unless a domain contract explicitly assigns the active cognitive action elsewhere.

Responsive behavior for narrower windows remains required, but it is a degradation path, not the design origin for the main learner workspace.

Therefore the default projection model should exploit horizontal space rather than stretching a mobile/document flow across a large screen.

Core spatial principle:

> **Space expresses simultaneous relationships; state transitions express learning sequence.**

Do not encode the whole learner sequence mainly as vertical scroll depth when the same workspace can change state more clearly.

The default wide-workspace roles are:

1. **Location / State Bar** — thin context: lane / subject / unit / current cognitive state / minimal progress.
2. **Cognitive Stage** — dominant central region for the one thing the learner should think or do now.
3. **Contextual Inspector** — secondary right-side region for bounded framework detail, source locator, exact fact, evidence, or repair that is useful *now*.
4. **Navigation Rail** — conditional, not mandatory. Show only when broader navigation materially helps; collapse when a breadcrumb/location bar is enough.

These are spatial roles, not mandatory component names or fixed pixel columns.

---

## 3｜One dominant cognitive task

At any learner-visible moment, the surface should make one dominant cognitive task obvious.

Typical states include:

- `ORIENT` — understand where this unit sits and what problem matters;
- `LEARN` / `EXTERNAL_LEARN` — perform the approved first-learning action on its owning surface;
- `RECALL` / `CLOSE` — reconstruct or close the natural unit;
- `VERIFY` — attempt the current first-ready question/task cleanly;
- `REPAIR` — fix the smallest meaningful failure;
- `CONTINUE` — resume / move to the next approved learner action;
- later `REVIEW` / `TRANSFER` when the domain contract requires them.

A domain does not need every state and may name additional states. The invariant is not the enum; it is **one clear foregrounded cognitive action**.

Do not make Orientation, source reading, Recall, questions, repair, review debt, and navigation compete at equal visual weight on one long page.

---

## 4｜Semantic presentation grammar

KianOS should represent *knowledge shape* before choosing a visual component.

The following shared semantic roles are available where the domain content actually contains them:

### `Problem`
The central question the learner is trying to resolve now.

Use as a strong cognitive anchor, not merely a section title.

### `Map`
A hierarchy / topology / system-position model.

Use when the learner benefits from seeing where concepts sit relative to the whole.

### `Chain`
A causal, mechanistic, procedural, historical, or reasoning sequence.

Use when order and transition matter more than categorical grouping.

### `Compare`
A discrimination object for two or more confusable concepts, mechanisms, roles, or choices.

### `Boundary`
An explicit inclusion / exclusion / `A ≠ B` / scope edge that prevents a predictable misconception.

### `Anchor`
A small number of high-value learner takeaways or organizing relations.

Do not label everything important; an Anchor must remain scarce enough to guide attention.

### `Exact`
A precision object whose cognition is exact retention rather than broad reconstruction: number, threshold, identity, fixed formulation, timeline point, marker, procedure, etc.

Do not visually merge Exact retention with mechanism understanding.

### `Handoff / Locator`
A cross-surface instruction preserving position and next action without duplicating the other surface's primary learning experience.

### `Recall`
A retrieval object whose answer/model is hidden until an attempt or reveal condition is satisfied.

### `Question / Task`
A clean attempt surface for the currently approved verification task.

### `Repair`
A learner-visible correction targeted to the first meaningful failure. Its internal representation should match the failure shape: a broken relation may reopen a `Chain`; a confusion may open `Compare` / `Boundary`; an exact miss may open `Exact`; a whole-model failure may reopen `Map` or route back to the primary source.

### `Closure`
A compact end-state showing what was established, what remains unstable, and the next approved action.

### `Reference`
Useful material that should remain available without competing with the current cognitive task.

These are semantic roles, not a requirement to instantiate one component for every role or to use all roles in every lane.

A domain may define additional roles when its cognition genuinely differs.

---

## 5｜Progressive disclosure and stateful reuse

A rich Current asset may project to very little information at first.

Default rules:

- first show only what the current cognitive state needs;
- protect clean attempts from answer/model leakage;
- stable correct work should continue with minimal friction;
- wrong / uncertain evidence may reveal only the smallest sufficient repair;
- source metadata and deep reference stay demoted unless needed;
- secondary controls appear when their decision becomes relevant, not merely because the feature exists.

Prefer **stateful reuse** of a semantic object over duplicating content across stages.

Example:

```text
Map during ORIENT
→ complete relation scaffold

same Map during RECALL
→ selected nodes hidden

same Map during REPAIR
→ failed edge highlighted

same Map during CLOSURE
→ stable / unstable relation summarized
```

The underlying semantic owner remains one asset; visibility and interaction change with learner state.

---

## 6｜External-primary mode

When another surface owns the active learning action, the KianOS web workspace enters companion mode rather than trying to remain equally dominant.

The Cognitive Stage may show only the approved companion semantics, for example:

- current problem;
- a compact map / bridge / relation anchor;
- what to look for;
- source locator;
- one explicit handoff action;
- return / checkpoint control.

It must not render a competing continuous source merely to keep the learner inside Astro.

The contextual inspector may preserve bounded framework/support information, but it must not become a hidden second textbook.

---

## 7｜Wide-screen interaction grammar

For the primary Mac landscape surface:

- favor spatial comparison for simultaneously relevant information;
- favor in-place state transition for sequential learning actions;
- use side-by-side representation for meaningful contrasts when it improves discrimination;
- allow chains/maps to use horizontal room rather than forcing them into stacked cards;
- let a clean `Question` occupy a large stable region while the Inspector remains quiet;
- after a Wrong/Uncertain attempt, the Inspector may become the bounded `Repair` surface without forcing an unnecessary page change;
- collapse global navigation when it does not help the current task.

Do not treat browser width as permission to add more dashboards, counters, badges, or permanent sidebars.

Horizontal space exists to clarify cognition, not to maximize visible widgets.

---

## 7A｜High-frequency input grammar

KianOS should develop **stable muscle memory by semantic surface type**. Do not make every subject invent its own keyboard language, and do not force one global key meaning across genuinely different cognitive objects.

General rules:

- frequent learner actions should be reachable without pointer travel or confirmation ceremony;
- shortcuts must be visibly discoverable on the active surface, but the hint stays subordinate;
- `input`, `textarea`, `select`, editable text and other focused authoring controls suspend global learning shortcuts;
- a focused spatial interaction may temporarily own arrow keys; on exit, the enclosing surface regains them;
- a clean correct action should not require a second confirmation unless the task itself is multi-select or otherwise ambiguous;
- Wrong / meaningful Uncertain should interrupt auto-advance and open the smallest useful Repair / explanation surface;
- visual feedback may be brief; it must not become a modal checkpoint.

### Recall / KP / memory surface

Default shared grammar:

```text
Space      Reveal / hide the answer or model
1          1 · 没掌握
2          2 · 模糊
3          3 · 熟练 / 基本稳定
4          4 · 掌握
Enter      commit the selected score and continue
← / →      previous / next Recall or KP
```

Low-friction stable path:

- if no lower score has been explicitly selected and the current Recall/KP is eligible for a clean pass, `Enter` may act as **Mastered / pass + next**;
- if `1–4` was explicitly selected, `Enter` commits that learner judgment and advances;
- Reveal is optional when the learner already knows the answer confidently; the applicable domain Evidence contract still owns what that learner action means.

This input grammar does not create a universal numeric mastery model. `1–4` is learner interaction shorthand; domain Evidence/Memory semantics remain authoritative.

### Standard question surface

For ordinary exam-like A–D questions:

```text
1 / 2 / 3 / 4  = A / B / C / D
Enter           = confirm / submit when confirmation is required
```

Normal mode:

- single choice: `1–4` or click selects; `Enter` confirms;
- multiple choice: `1–4` toggles A–D; `Enter` confirms.

Fast mode:

- single choice: the first valid `1–4` keypress or option click **submits immediately**;
- stable correct → brief subordinate feedback → next question without another Enter;
- Wrong or meaningful Uncertain → stay on the question and open the bounded explanation / Repair surface;
- multiple choice still requires `Enter`, because selection is not complete until the learner says it is complete.

Fast mode must never turn a wrong answer into a blink-and-skip interaction merely to maximize throughput.

### Lexical whole-card routing

LexicalOS uses the same increasing-familiarity numeric direction, but this is **card routing**, not Recall scoring:

```text
1  Unknown  → Depth
2  Fuzzy    → Depth
3  Known    → Fast Pass / Next
4  Mastered → Fast Pass / Next
```

The card-level judgment controls whether the whole lexical object deserves Depth **now**. It must not by itself create future Repair debt.

This aligns with `content/lexical/LEARNING_CONTRACT.md`: Known/Mastered should be near-instant pass paths; Unknown/Fuzzy may open rich Depth; local instability is admitted separately.

### Lexical Depth

The current proven low-friction vocabulary grammar is retained as the direction for productization:

```text
Space      Recall → Reveal; after Reveal, when no nested control owns Space, continue / Next
↑ / ↓      move the local target focus
→ / +      add the focused exact local object to Repair
←          undo / remove that local Repair admission
S          pronunciation
```

`+` remains exact-object admission: sense / secondary sense / construction / collocation / phrase / relation / boundary / other learner-worthy local object. It must not silently promote the whole word into Repair.

### Lexical Challenge spatial exception

Lexical vNext may use a spatial forced-choice surface when spatial placement itself reduces decision friction:

```text
← / ↑ / → / ↓  answer the visible spatial option directly
Q              report a question defect
Space / Enter  continue after scored feedback or enter the required reconstruction
```

This is an explicit semantic exception, not permission for arbitrary key drift. It is valid only when the active Challenge visibly presents options in the matching spatial positions and does not masquerade as an A–D exam question.

If a Lexical Challenge is rendered as ordinary A–D choices, it should use the standard question grammar instead.

### Conflict rule

Shortcut ownership follows the **active semantic object**:

```text
Recall / KP active          → Recall grammar
A–D Question active         → Question grammar
Lexical Depth target active → Depth grammar
Spatial Challenge active    → spatial Challenge grammar
text field focused          → typing wins; learning shortcuts suspended
```

Do not solve conflicts by adding modifier-key rituals. Resolve them through clear active state and visible affordance.

---

## 7B｜Legacy reference firewall

Legacy may contain valuable interaction or recoverable content, but it is **not an implementation source that Codex is expected to interpret**.

Ownership rule:

```text
raw Legacy
→ Chat/Sol bounded archaeology + reconciliation
→ Current-facing interaction brief OR promoted Current asset
→ Codex implementation
```

Never:

```text
Codex
→ roam old repos / old localhost / historical branches
→ infer which old behavior or owner is still valid
→ wire learner UI directly to historical assets
```

Chat/Sol owns the migration boundary because it has the project-context responsibility needed to distinguish useful interaction from obsolete authority.

For a useful legacy **interaction**:

1. inspect the exact legacy implementation/tests;
2. extract the behavior worth preserving;
3. reconcile it against Current Learning / Interaction / Evidence contracts;
4. express the result as a clean Current-facing Product Brief or contract addition;
5. Codex implements that brief against Current runtime/data.

For useful legacy **content/data**:

1. recover exact identity / bytes / provenance;
2. reconcile against the correct Current canonical owner;
3. deliberately promote/materialize through that owner;
4. only the promoted Current asset may become learner-facing input.

Hard firewall:

1. learner-facing Current runtime must not depend on a legacy repository path, historical branch, old localhost path, or historical generated asset as a hidden fallback;
2. legacy scheduler/due logic, mastery semantics, routes, owner hierarchies or state machines do not return merely because an old UI used them;
3. no `Current missing → silently show old asset` behavior is allowed;
4. historical paths are allowed in governance/provenance/tests, not as learner-runtime APIs;
5. once useful behavior/content is reconciled into Current, Current becomes the durable source;
6. any compatibility migration must be one-way, explicit, testable and semantically bounded;
7. if legacy reconciliation is unresolved, implementation stops **before Codex Handoff** rather than asking Codex to guess.

The purpose of consulting Legacy is to preserve proven good interaction without reopening historical architecture or asset drift.

---

## 8｜Dense Calm visual behavior

The KianOS work/content surface should optimize for long, high-frequency cognitive work:

- comfortable readable type; do not achieve elegance through persistently tiny text;
- medium-to-high useful information density without crowding;
- strong hierarchy and relation visibility;
- restrained decoration and low visual noise;
- whitespace used for grouping/rhythm, not as a substitute for structure;
- state feedback clear but visually subordinate to the learner task;
- color used primarily for meaning/state, not decorative variety;
- prefer alignment, typography, indentation, connection, and spatial grouping before wrapping every object in a card;
- cards/borders should represent a real interaction or semantic boundary, not become the default unit of layout.

The target is not generic minimalism. It is **Dense Calm: rich information, obvious structure, low fatigue**.

---

## 9｜Domain variation is mandatory where cognition differs

Shared presentation grammar must not force identical pages across lanes.

Examples:

- Politics may project conceptual relation maps, historical stage strips, hierarchy, boundaries, and Xiao1000 attempts;
- Xizong may project mechanism chains, Block/System relations, clinical discrimination, Visual Gates, and precision objects;
- English may project task-first workbook surfaces where source material / prompt / learner output dominate and coaching remains conditional;
- LexicalOS may center sense competition, construction, contrast, and transfer challenge.

What is shared is the contract:

```text
current cognitive state
+ semantic role
+ surface ownership
→ representation
```

The domain determines the actual cognition and shape.

---

## 10｜Projection acceptance test

Before a learner-facing KianOS web path may claim mature Projection quality, verify at minimum:

1. the current cognitive task is obvious without reading the entire page;
2. the primary surface for that action matches the applicable Learning Contract;
3. the main Mac landscape composition uses space to clarify relationships rather than merely widening a document column;
4. the page does not expose all future states at equal visual weight;
5. clean attempts are protected from answer/model leakage;
6. stable correct work can pass quickly;
7. Wrong/Uncertain opens the smallest useful representation for repair;
8. external-primary learning is accompanied, not duplicated;
9. meaningful framework/relation content is visually represented rather than buried in undifferentiated prose when a structural representation is justified;
10. typography and density support sustained work without tiny-text / giant-whitespace pseudo-minimalism;
11. global navigation and status chrome do not dominate the Cognitive Stage;
12. the same domain semantics would remain correct if the specific Astro components were replaced;
13. any legacy-derived behavior/data has crossed the Chat-owned Migration Gate and is now expressed through Current-facing authority rather than a raw historical dependency.

A screenshot, pretty component set, or successful build cannot by itself satisfy this contract. Real learner U remains governed by `LEARNING_ACCEPTANCE.md`.
