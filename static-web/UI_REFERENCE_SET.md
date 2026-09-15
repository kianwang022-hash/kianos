# UI Reference Set

Status: ACTIVE VISUAL REFERENCE INDEX  
Scope: presentation-only reference for the current learner-facing site.  
Authority boundary: Current content / learning logic / runtime / evidence / return / state semantics remain authoritative. Legacy screenshots and legacy code are visual references only.

## Mandatory reference-first gate

Before changing a subject's learner-facing presentation:

1. retrieve that subject's screenshots from the ChatGPT Library path below;
2. compare them with the exact current-head screenshot for the corresponding Current surface;
3. name the visual grammar to inherit and the Current functions/interaction/state semantics that must not change;
4. implement presentation-only changes;
5. capture a fresh exact-head screenshot and perform Human Gate review.

Do not continue a subject UI lane from memory alone. Positive and negative references both matter.

## Shared visual preference distilled from Kian screenshots

- Mac-wide, full-screen knowledge workbench; use the available horizontal viewport deliberately.
- High information density is welcome when alignment, ownership and hierarchy are clear.
- Keep learner text comfortably readable; gain density by better geometry / smaller dead space, not by shrinking important type.
- Structural cards / ruled modules / top mode tabs are welcome when they clarify ownership and task flow; avoid random card walls.
- A workspace may constrain paragraph line length internally, but must not constrain the whole task surface into a narrow centered column with dead side whitespace.
- Legacy visual quality may be reused; legacy learning/runtime semantics may not be restored.

## Reference library

Persistent root: `/KianOS/UI Reference Set/`

### English

Library: `/KianOS/UI Reference Set/English/`

- `english-01-os-home.png` — **positive A reference**. EnglishOS home: dark OS rail + full-width learner workbench; strong E1 phase header; resume/learning lanes on left; Gate/stage structure on right; compact ruled sections; useful density without small learner type.

English work must preserve Current Objective / Translation / Writing native task geometry and Resume semantics. Use the screenshot for shell, hierarchy, density, navigation and module composition — not for obsolete scheduler/progress semantics.

### Lexical

Library: `/KianOS/UI Reference Set/Lexical/`

- `lexical-01-answer-front.png` — positive full-screen recall front.
- `lexical-02-say-reveal.png` — **positive A reference** for dense learner reveal.
- `lexical-03-say-sense-row.png` — **positive A reference** for one-sense left/right correspondence: POS + governing pattern + definition left; fixed structures / common collocations right; preserve 17–18px learner-scale type.
- `lexical-04-dictionary-issue.png` — positive dictionary/detail-pane workbench.
- `lexical-05-settings-pack-profile.png` — reference for ordered dense settings rows and top mode navigation.

### Politics

Library: `/KianOS/UI Reference Set/Politics/`

- `politics-01-overview.png` — **positive A reference** for subject overview: top mode tabs, current learning, today review, long-term Gate and coverage modules.
- `politics-02-natural-units.png` — positive NU/workbench reference: top tabs/chips, summary strip, chapter list left and next-step panel right.
- `politics-03-question-review.png` — **positive A reference** for review/question two-column workbench.
- `politics-04-review-today.png` — positive review page: stage tabs, compact summary strip and dominant current task block.

### Xizong

Library: `/KianOS/UI Reference Set/Xizong/`

- `xizong-01-kp-workspace-positive.png` — **positive A reference**. Three useful horizontal owners: Logic/KP rail left, main KP card center, Learning Chain right; full viewport utilization; top Learn/Outline/Memory/Review strip.
- `xizong-02-core-expanded-negative-geometry.png` — **negative geometry reference**. Core card styling may be useful, but the narrow centered content and large dead side whitespace are not acceptable. Rule: constrain text line length, not the whole workspace width.
- `xizong-03-old-outline-density-reference-only.png` — **reference-only** for high-density table/filter quality. Do not restore the retired Outline learning flow.

## Subject-lane rule

When a UI lane switches subjects, re-open that subject's reference images first. Do not carry visual decisions across subjects merely because they share the OS shell. Shared shell language may unify chrome; each subject keeps its native cognitive geometry.
