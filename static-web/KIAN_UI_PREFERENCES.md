# KianOS Visual Requirements & Preference Evidence

Status: **CURRENT KIANOS-SPECIFIC REQUIREMENT / EVIDENCE OWNER**
Scope: accepted user-facing requirements that materially constrain KianOS Visual / Interaction choices.

This file does **not** own Kian's general personal taste, shared CSS rules, presentation mechanics, task-specific Learning Logic or surface implementation.

Ownership:

```text
Personal
→ general durable personal preference when it matters beyond KianOS

this file
→ accepted KianOS-specific visual / interaction requirement + bounded evidence

UI_STYLE_BRIEF.md
→ shared visual rules / operational defaults

PRESENTATION_CONTRACT.md
→ representation / geometry / Blueprint / Human-Gate semantics

exact Product / Learning / surface owner
→ task-specific behavior and layout
```

Do not copy downstream style rules back into this file merely to keep them nearby.

## 1｜Primary environment

- Mac / wide landscape is the primary KianOS design origin.
- iPad is an important companion surface, especially where the approved Source action is continuous reading such as MarginNote.
- Use horizontal space deliberately; do not stretch a mobile composition across a desktop canvas.
- Protect vertical working height when the focal learner object scrolls. Persistent side context is preferable to stacked chrome when it genuinely helps the task.
- Narrow/responsive layouts must remain usable, but are fallback rather than the main design origin.

## 2｜Accepted visual direction

KianOS should feel:

- restrained, calm, mature and intentional;
- information-rich without disorder;
- readable for sustained use;
- visually substantial rather than thin/light/washed out;
- structurally clear with visible hierarchy;
- like a refined desktop knowledge/learning workspace rather than a SaaS/admin/dashboard or documentation site.

Shared KianOS direction:

- useful density over decorative whitespace;
- content/task more noticeable than software chrome;
- strong hierarchy and alignment before borders/cards;
- few cards and little decorative color/animation;
- broad, full-bodied Chinese rendering rather than condensed/squeezed glyphs;
- Chinese UI uses the accepted PingFang-first direction on Mac;
- English lexical/editorial content may use a stronger serif treatment when task-native.

Exact typography sizes/weights, token rules, navigation levels, density rules and screenshot acceptance live only in `UI_STYLE_BRIEF.md`.

## 3｜Positive / negative reference evidence

Positive evidence:

- legacy `4173` Politics Learn-mode Chinese UI is an accepted reference for full-bodied PingFang-based Chinese character and stronger active-state weight;
- legacy `4173` lexical English treatment is a positive reference for editorial serif character;
- Apple-like predictability and Raycast-like restraint are useful quality references, not clone targets;
- early Steward HTML has useful visual direction for a light, refined, clearly layered native-Mac feel; its exact controls/layout/backend were never blanket-approved.

Negative direction:

- tiny + light + gray useful text;
- narrow/condensed Chinese;
- excessive empty space;
- card/panel piles;
- generic admin/dashboard composition;
- flashy saturated decoration or novelty animation;
- backend/debug/status vocabulary competing with the actual task.

Historical screenshots and named products are evidence only. They never restore retired semantics/runtime.

## 4｜Accepted interaction requirements

- High autonomy: allow jump/compare/scroll/backtrack where the native task permits it; do not force wizard ceremony.
- Important first-round structure should usually be visible when Mac space can carry it; repeated reveal clicks should not be the default organization method.
- Stable/correct work should be fast and visually quiet.
- Wrong / meaningful Uncertain may reveal more information when that information is useful.
- Preserve interrupted context and a clear return path across approved surface/tool handoffs.
- Text is the safe default representation; use diagrams/arrows only when they reduce real reconstruction cost without inventing meaning.
- Rich backend state should disappear behind simple frontstage behavior; do not expose structure merely because it exists.

## 5｜Accepted exam-workspace geometry requirements

Exam-like tasks preserve their native whole object rather than being fragmented for component convenience.

Accepted examples:

- Reading A: passage + full question set simultaneously visible on Mac, with independent scrolling where appropriate;
- Cloze: complete passage + all 20 answer rows together; Mac options use exam-like horizontal typesetting where practical;
- Part B: preserve the complete candidate/material/placement context needed for global reconciliation;
- Translation: source + learner translation simultaneously visible;
- Writing: prompt/material + a dominant authoring workspace.

Scrolling is valid when native to the task. Before submit, selection means only the learner's current choice; it must not imply correctness. Wrong/Uncertain repair should preserve task context when practical.

## 6｜Content / tool boundary requirements

- Do not duplicate a truth owner merely to make a page self-contained.
- When another approved surface owns the cognitive action, KianOS web is a companion rather than a competing second course.
- Chat should keep semantic coaching/discussion where Chat is the better surface instead of forcing JSON round-trips or copying the same analysis into the website.
- Dense learner content must not be semantically thinned merely to make a mockup or first viewport look cleaner.

## 7｜Design-process requirement

For material UI change:

```text
recover current Rule / Learning / Interaction / existing consumer
→ explain the important behavior that must survive
→ establish focal composition
→ implement the smallest coherent visual change
→ real browser proof
→ Kian Human Gate when taste/product behavior is material
```

Do not redesign from one component in isolation. Do not treat build PASS as visual acceptance.

## 8｜Working hypotheses — not authority

Current useful hypotheses:

- overview/relationships often help before forced micro-steps;
- Kian tolerates high information density but not disorder;
- low-ceremony interaction is usually higher value;
- sophisticated backend behavior should collapse into simple frontstage behavior;
- Mac side-by-side relationships are often useful;
- polish matters because KianOS is a high-frequency personal tool.

Authority order:

```text
Kian's current explicit feedback
> real-use evidence
> these hypotheses
```

Never defend a hypothesis against direct user correction.

## 9｜Update rule

Update this file only when Kian explicitly changes/generalizes a durable KianOS visual/interaction requirement or when repeated real-use evidence materially changes the requirement.

Do not copy implementation details or downstream style rules here. When a downstream shared visual rule changes without changing the upstream user requirement, update only `UI_STYLE_BRIEF.md`.