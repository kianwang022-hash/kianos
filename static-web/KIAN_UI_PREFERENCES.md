# KianOS Learner UI Preferences

Status: CURRENT PREFERENCE OWNER  
Scope: learner-facing KianOS UI / interaction / product discussion  
Applies to: `static-web/` productization across English / Politics / Xizong / Lexical presentation  

This file records **Kian's personal UI / interaction preferences** separately from domain Learning Logic and separately from the shared visual system. It exists so new Chats and Codex do not have to reconstruct preferences from conversation history.

Hard distinction:

```text
explicit user preference
≠
assistant inference / working hypothesis
```

Explicit preferences may guide product decisions directly when they do not conflict with domain semantics. Inferences are only design hypotheses and must yield immediately to direct user feedback or real-use evidence.

---

## 1｜Explicit device / workspace preferences

- Primary web-learning device is **Mac in wide landscape**.
- Main desktop layouts should use horizontal space deliberately rather than behave like stretched mobile pages.
- iPad is an important companion learning device, especially for continuous source / lecture reading such as MarginNote.
- Cross-device design should assign each device the job it is best at instead of duplicating the same continuous content on both screens.
- Responsive narrow layouts should remain usable, but they are not the main design origin.

---

## 2｜Explicit visual taste

Kian consistently prefers:

- restrained, simple, logical interfaces;
- clear frameworks and visible structure;
- larger, comfortably readable type;
- stronger contrast;
- medium/high useful information density;
- low-friction interaction;
- visually calm pages that still contain enough information;
- polished desktop-product feel rather than study-app decoration;
- Apple-like interaction quality / predictability;
- Raycast-level restraint is broadly acceptable.

Kian dislikes:

- tiny text that makes sustained reading tiring;
- pages that are too empty and waste large amounts of space;
- interfaces that hide useful structure behind excessive whitespace;
- card/panel piles;
- visually loud, flashy, highly saturated Arc-like treatment;
- decorative color for its own sake;
- excessive animation / novelty;
- engineering/debug/status information competing with learner content.

These are taste constraints, not instructions to clone Apple, Raycast, Arc, or any named product.

### Preserve semantic density in intrinsically dense learning surfaces

- Do **not** simplify, thin out, or split apart a high-density learning asset merely to make a Guide, mockup, diagram, or one-screen composition look cleaner.
- Presentation compression is not semantic compression. Reorganization may change hierarchy, spatial placement, typography, grouping, or navigation; it must not silently reduce the accepted terminology, relations, distinctions, claims, or first-round useful detail of the source/Current learning asset.
- A diagram, role matrix, summary strip, or card is an orientation device, not a substitute for the complete useful content when that content is part of the learner-facing Guide.
- A Guide is allowed to be information-dense and may extend beyond one viewport. `Fits on one screen` is never a goal when achieving it requires deleting or flattening meaningful content.
- Use Mac width, strong hierarchy, nested structure, local scrolling, stable context, and selective emphasis to organize dense information before considering omission.
- Content may be deferred or hidden only when the domain Learning/Projection authority says it is genuinely secondary, later-phase, reference-only, or not needed for the current cognitive action — never merely for visual cleanliness.
- This applies especially to English Task Guides / First Learning assets and Xizong System / Block Guides, where the underlying information density is itself part of the learning value.

---

## 3｜Explicit interaction preferences

### High autonomy

- Do not force wizard-style step-by-step interaction when the task does not require it.
- Do not add confirmation rituals merely because a state machine exists.
- The learner should be able to jump, compare, scroll, backtrack and reopen context freely where the native task allows it.
- Stable/correct paths should be extremely fast.

### Reduce interaction used only to reveal information

- On the primary Mac-wide workspace, important structure and first-round useful content should preferably be **visible by default** instead of hidden behind repeated `click to expand` interactions.
- Progressive disclosure is still useful for genuinely secondary/deep material, but should not become the mechanism that keeps the whole page tidy.
- Do not make the learner repeatedly open cards, accordions, details panels or modal layers simply to reconstruct one coherent knowledge object.
- Prefer spatial organization, typography, grouping and simultaneous visibility over interaction-heavy disclosure when the Mac viewport can carry the information comfortably.
- This preference is especially important for high-density learning surfaces such as Politics cognitive workspaces and Xizong Block/KP learning, where excessive reveal interactions can become an additional learning barrier.

### Structure should be visible

- Important relations, maps, hierarchy, causal chains and task structure should be visually apparent rather than requiring the learner to reconstruct them from prose or repeated clicks.
- Rich backend content may exist, but the default surface should expose the structure needed for the current cognitive action without visually flattening the full useful content of that object.
- Do not flatten distinct cognitive objects into one generic card template.

### Failure may increase interface weight

- Stable work should remain visually quiet.
- Wrong / meaningful Uncertain may reveal more information because the added information is useful.
- Repair should happen in place when practical instead of ejecting the learner into a separate dashboard or wizard.
- Deep review / Chat escalation should be optional and earned by a real problem.

### Preserve context and return

- Cross-lane / cross-surface tool use should preserve the interrupted task and offer a clear return path.
- Examples: English → Lexical → return to the exact passage; Politics → Chengfeng / Chat → return to the exact Unit/question.
- A temporary tool handoff should not feel like abandoning the main task.

---

## 4｜Explicit exam-workspace preferences

Kian prefers exam-like tasks to retain their **native whole-object geometry** rather than being fragmented for component convenience.

Current accepted examples:

- Reading A: Passage left + the **full question set** right; both independently scrollable on Mac.
- Cloze: complete passage left + **all 20 blank rows together** right.
- Cloze A/B/C/D options should default to **horizontal exam-paper typesetting** on Mac, not four vertical app cards.
- Part B should preserve the full candidate pool / material / placement map needed for global reconciliation.
- Translation should keep source + translation simultaneously visible.
- Writing should keep prompt + a dominant authoring area simultaneously visible.

For exam work:

- scrolling is acceptable when it matches the real task; do not over-optimize for no-scroll wizard interaction;
- before submit, selected answer styling must mean only `my current choice`, not correctness;
- whole-task submit/answer-gating rules must remain intact;
- after submit, Wrong/Uncertain should preferably expand in place while the original task remains visible.

---

## 5｜Explicit content/tool boundaries

- Do not duplicate truth owners just to make a page self-contained.
- Example: Reading/Cloze/Translation may route a selected word to LexicalOS, but should not build a second dictionary locally.
- Chat should be used where semantic discussion is actually better in Chat instead of copying the same analysis back into the website.
- Example: Writing website owns the writing workspace; Chat owns semantic essay review/coaching. Structured JSON round-trip should not become a normal learner ritual merely so the webpage can redisplay Chat's analysis.
- Original source surfaces should remain primary when they are the approved learning owner (for example Chengfeng continuous study in MarginNote).

---

## 6｜Explicit discussion / design-process preferences

When discussing a KianOS UI surface with Kian:

1. **Read the full current chain first** — Logic / Projection / Runtime / Repair / Return / existing functions — before proposing a redesign.
2. Do not start from generic UX taste or from a single current component.
3. Discuss **one surface / task type at a time** rather than dumping the whole system at once.
4. Before proposing changes, clearly explain the **important existing functions** so Kian can judge what would be preserved or lost.
5. Use simple, visual, Mac-wide ASCII sketches when useful, but never treat a simplified sketch as permission to reduce the source asset's information density or detail level.
6. Keep explanations concrete and colloquial; do not bury the decision under architecture language.
7. Once a decision is accepted, write it to GitHub so later Chats/Codex do not reconstruct it from conversation history.
8. Finish the relevant family / subject product discussion before handing implementation to Codex.
9. Aesthetics are part of acceptance; `build PASS` is not enough. Review real screenshots.

---

## 7｜Explicit product feel

Desired overall feel:

> **A complete, coherent, beautiful desktop learning website whose task/content is more noticeable than the software itself.**

The learner-facing site should feel:

- mature;
- calm;
- efficient;
- intentional;
- coherent across subjects;
- aesthetically polished enough to enjoy daily use;
- structurally rich without feeling busy.

It should not feel like:

- an engineering console;
- a component demo;
- a course-management dashboard;
- a gamified study app;
- a mobile app stretched across a Mac;
- several disconnected Gold pages with no shared Home / navigation / return model.

---

## 8｜Working hypotheses from observed usage — NOT hard requirements

The following are **assistant inferences**, useful for proposing options but not authoritative user preferences until confirmed by Kian or supported by real-use evidence.

### H1｜Overview before guided micro-steps
Kian appears to work better when the system/relationship is visible first and he can then move quickly through details, rather than being guided through many small mandatory steps.

### H2｜High information tolerance, low disorder tolerance
Kian appears comfortable with substantial information density when hierarchy is strong, but dislikes having to reconstruct structure from scattered cards/prose. The explicit preference in §2 now additionally establishes that dense learner assets must not be semantically thinned merely for cleaner presentation.

### H3｜Low ceremony tolerance
Kian appears particularly sensitive to operations that exist for system completeness rather than learner value: repeated confirmations, duplicate Chat→web imports, mandatory checkpoints, exposed backend states, etc.

### H4｜Backend richness should disappear into front-end simplicity
Kian appears to value sophisticated underlying evidence/runtime behavior while preferring the learner-facing UI to remain simple, direct and low-friction. `Simplicity` here means interaction/chrome simplicity, not deletion of intrinsically dense learner content.

### H5｜Spatial relationships are high leverage
On Mac, Kian likely benefits from simultaneous side-by-side context when two objects must be compared or used together, rather than repeated page switching.

### H6｜Polish matters because this is a high-frequency personal tool
Aesthetics are not merely branding; visual fatigue, typography, spacing and interaction feel are likely to affect long-term willingness to use the system daily.

Rule for all hypotheses:

> **Kian's direct feedback > real-use evidence > these hypotheses.**

Never defend an inferred preference against explicit user correction.

---

## 9｜Relationship to other UI owners

- `static-web/PRESENTATION_CONTRACT.md` owns shared cognition → projection rules.
- this file owns **personal UI / interaction preference evidence**.
- `static-web/UI_STYLE_BRIEF.md` turns those preferences plus product constraints into a shared visual language.
- lane `*_PRODUCT_BRIEF.md` files own task-specific product choices.
- domain Learning / Interaction contracts remain semantic authority and outrank taste when a real conflict exists.

Codex must not reinterpret this file as permission to change learning semantics.

---

## 10｜Update rule

Update this file when Kian explicitly states a durable UI / interaction preference or explicitly rejects one.

- Preserve the distinction between explicit preference and inference.
- Do not silently promote one successful mockup into a universal rule.
- Do not infer a global preference from one task-specific decision unless Kian explicitly generalizes it.
- When a later explicit preference conflicts with an older one, update the Current preference rather than carrying both as equal truth.
