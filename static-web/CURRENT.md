# KianOS Static-Web Current

Role: learner-facing website / UI Work Cursor + fresh-Chat restart entry  
Parent: root `CURRENT.md`  
Navigation issue: #90 `KianOS UI Productization — Gold Pages & Design System`

This file owns the UI-productization cursor. Domain cognition/content/evidence stay with their canonical owners.

---

## UI lifecycle｜FROZEN

```text
Preference + Authority Sync
→ Projection Audit
→ Product Brief / Migration Output
→ Codex implementation on ONE bounded branch / Draft PR
→ browser/screenshots
→ Sol product review
→ Codex iterates SAME PR
→ Kian accepts genuine structural choice
→ zero-semantic-diff gate
→ merge + advance Current + retire branch
```

**Sol / Chat owns:** Kian preference interpretation, Current Logic reading, Projection Audit, all Legacy archaeology/reconciliation/migration, Product Brief, screenshot/journey review, acceptance and Current reconciliation.

**Codex owns:** production Astro/CSS/JS, layout/components/tokens/responsiveness, browser iteration/screenshots, build/tests/cleanup and implementation PR lifecycle.

**Codex is not the project historian. Raw Legacy is never its research assignment.**

---

## Kian baseline

**Dense Calm**: comfortable readable type, medium/high useful density, strong visible structure, low noise. Draw the logic instead of forcing reconstruction from prose. No tiny-text + giant-whitespace minimalism. No default card/panel pile. Primary action obvious; secondary capability progressively disclosed. Stable/correct paths extremely fast; Wrong/meaningful Uncertain may become heavier only because new information is useful.

Protected interaction grammar:

```text
Recall / KP
Space = reveal
1–4 = learner judgment
Enter = mastered / clean commit + next when semantically valid
← / → = previous / next

Standard A–D question
1–4 = A/B/C/D
Enter = submit when confirmation is needed
Fast single-choice = click/key immediate submit
correct = near-immediate next
wrong = stay + explanation/repair
multiple-choice = Enter confirms

Lexical
whole-card routing near-instant
Known/Mastered = fast pass
Fuzzy/Unknown = Depth
local + = exact Repair admission
keyboard-first Depth / Reveal / targeting / Challenge
```

Owning domain contracts still define evidence/mastery meaning.

---

## Complete website boundary｜FROZEN

KianOS learner UI is **one coherent website**, not a collection of disconnected Gold pages.

A functional site shell is required from the beginning:

```text
KianOS Home
→ lane Home / meaningful Continue
→ task / learning workspace
→ problem-only repair / cross-lane handoff when useful
→ return to the interrupted mainline
```

Important distinction:

- **functional Home / navigation / Resume / shared shell = required now**;
- **final brand/identity/hero visual polish = may remain last**.

Therefore “Global Home last” never means “no Home until the end.” The current `index.astro` is only an engineering/runtime-oriented baseline, not the accepted final product Home. It must eventually stop foregrounding build/runtime health and instead foreground meaningful Continue, four learner lanes, current task identity and low-friction entry.

Gold pages must compose into the website hierarchy rather than becoming isolated microsites. Shared shell decisions may be defined before implementation when they materially affect every English surface; domain semantics must remain local.

For English specifically, finish the **whole English product family** before opening the first production UI PR:

```text
English Home / Resume / navigation
→ Reading A
→ Cloze
→ Part B
→ Translation
→ Writing
→ First Learning / targeted coaching surfaces
→ Lexical handoff / return behavior
```

The family should feel like one English Digital Workbook + Adaptive Coach system while preserving each task's native geometry.

---

## Projection Audit｜CLOSED

```text
English
  Writing                  OPTIMIZE
  Translation              OPTIMIZE
  Reading A                OPTIMIZE
  Cloze                    OPTIMIZE
  Part B                   KEEP
  English shell / Resume   OPTIMIZE

Politics
  learning projection      CLOSED / OPTIMIZE compiled Projection
  question workbench       KEEP interaction core + visual OPTIMIZE
  refined explanation      BLOCKED only on bounded durable-role proof

Xizong
  System / Block           OPTIMIZE
  KP / Recall              KEEP interaction core + OPTIMIZE projection

Lexical
  Fast Pass / Depth        KEEP interaction core + OPTIMIZE projection
  Challenge                KEEP interaction core + OPTIMIZE projection

Global
  Base shell/nav           KEEP / light OPTIMIZE
  functional Home          REBUILD entry projection
  final identity polish    LAST
```

Key receipts:
- **English = Digital Workbook + Adaptive Coach.** Task/passage/prompt/output foreground; First Learning is skippable coaching/repair reservoir. Part B IA is protected.
- **English preserves exam-native object integrity.** A real task/set stays visibly whole unless its native format requires staged disclosure. Reading A is one Passage + its full question set; Cloze remains one complete passage + all blanks; Reading B preserves its full matching/order structure; Translation and Writing preserve whole-source / whole-output workspaces. UI convenience must not fragment the authentic exam object into flashcards or a wizard flow.
- **Politics = closed Projection → Mac-wide productization.** UI/product design is frozen; 53 chapter / 160 NU derived Projection assets are compiled and guarded. Implementation must consume those assets, preserve `ORIENT → EXTERNAL_LEARN → RETURN/CLOSE → VERIFY → CONTINUE/REPAIR`, and must not re-infer subject grammar from raw Current.
- **Politics Workbench:** preserve prior 4173 Normal/Fast, `1–4`, fast-single correct→next, wrong→stay, `一句话带走`, answer delta, optional cause/note, AI-refined `理解这道题`, Current refs, collapsible Xiao original explanation, fixed/easy Next. Visual modernization only; no new learner process.
- **Xizong:** keep System→Block→Logic Group→MarginNote Lecture→KP Recall→Block Recall and current `←/→ + Space + 1–4` KP core. Optimize typography/chrome; add `Enter = Mastered + next` after Reveal; do not allow hidden-answer keyboard rating.
- **Lexical:** keep current low-friction routing/Depth/Challenge grammar. Optimize only learner-facing presentation; demote packet/evidence/debug language.
- **Global Home:** keep simple four-lane navigation, but rebuild the entry around meaningful Continue / identity / learner action rather than Runtime/build health. Functional Home is part of the website baseline; only final brand/identity polish waits until the end.

### Bounded Politics data blocker

Historical 1148-record refined explanation asset is pinned by SHA256 `e48d2b06ec1747f97451d147dc172a9b2acf9219d19c5f274c539dc400efbdec`; old runtime exposes it as `question_explanation`. Existing Recovery Contract requires bounded real Local/Study durable-role proof before Current promotion.

This does **not** block unrelated UI work. Current may never hidden-fetch/fallback to old snapshot/recovery/local runtime. Old due/mastery/scheduler/owner semantics do not return.

Politics UI/product implementation must follow `static-web/POLITICS_PRODUCT_STATUS.md` and `static-web/POLITICS_UI_REVIEW_PROTOCOL.md`.

### Lexical concurrency boundary

Open PR #86 remains Lexical Functional First Evidence/Memory work, not merged Current. UI work must not bypass it or reinterpret its semantics. Do not open a competing Lexical UI PR while that would create overlapping ownership.

---

## Work Cursor

**Program:** KianOS learner-surface productization  
**Active stage:** `2 · PRODUCT BRIEF — COMPLETE SITE + ENGLISH FAMILY`  
**Active scope:** functional Site Shell / Home + complete English product family  
**Implementation owner:** none until this family brief is frozen  
**Active UI implementation PR:** none yet  
**Blocker:** none.

**Next action:** finish the learner-visible design of English Home/Resume, Reading A, Cloze, Part B, Translation, Writing, targeted First Learning and cross-lane Lexical handoff as one coherent subsystem. At the same time freeze the minimum site shell/Home behavior that makes KianOS a complete website. Only then reopen Stage 3 Codex handoff.

Reading A remains the first Gold work surface after this family brief closes, because it is already the clearest example of English as a Digital Workbook—real Passage left, the full question set right, comfortable long-reading typography, clean attempt, optional continuous practice and problem-only review.

---

## English family｜shared product rules

English is one coherent **Digital Workbook + Adaptive Coach**, not a dashboard and not a course catalogue.

Shared shell:

```text
English Home
→ highest-value Continue if one exists
→ Objective / Translation / Writing task entry
→ task-native workspace
→ stable = exit / continue cheaply
→ problem = smallest useful local triage
→ deeper First Learning / Chat / Lexical only when earned
→ return to the interrupted task
```

Shared rules:

- real exam task / passage / prompt / learner output is foreground;
- task-native object integrity outranks component convenience;
- large comfortable learner text; engineering metadata stays out of the main surface;
- stable work is quiet and fast;
- Wrong / meaningful Uncertain may progressively disclose more help;
- no task becomes a flashcard/wizard merely to share components;
- First Learning is complete but skippable targeted coaching, not a competing course dashboard;
- LexicalOS is a separate truth owner and appears through minimal read-only lookup / handoff when a real lexical object blocks English performance;
- Resume represents unfinished/high-value learner work, never generic due debt.

### English Home / Resume｜product direction

Current `english.astro` is an architecture-rich baseline, not final presentation. Preserve the three score lanes and distinct task owners, but reduce explanatory framework/chrome.

Normal entry should prioritize:

```text
English

Continue
<highest-value unfinished task, if any>

Objective 60
Reading A · Cloze · Part B

Translation 10
Writing 30

First Learning / targeted coaching     secondary
LexicalOS                              secondary supply lane
```

Resume must eventually consider all five real English task surfaces, including Cloze and Part B, while ignoring passed/dormant work.

---

## First Gold brief｜Reading A

### Authority reads

Codex must eventually start from current `main@HEAD` and read only the relevant Current owners:

```text
AGENTS.md
SYSTEM_CONTRACT.md
static-web/PRESENTATION_CONTRACT.md
static-web/CURRENT.md
content/english/LEARNING_CONTRACT.md
content/english/modules/objective/CURRENT.md
static-web/src/pages/reading/[id].astro
static-web/src/components/ReadingWorkspace.astro
static-web/src/components/ReadingPassageHandoff.astro
static-web/src/styles/reading*.css
```

No Legacy archaeology. No English semantic/content edits.

### Preserve exactly

- Reading A remains **passage/set-first**, not one-question-at-a-time knowledge cards.
- The learner-visible task object is **one Passage + its entire question set**. All questions for the passage remain present together; a local active/focused question may exist for keyboard handling, but it must never gate visibility of the other questions.
- Mac landscape split: readable Passage left, **full question set right**. Both columns may scroll naturally and independently; sustained scrolling is expected because Reading A is a slow, careful task rather than rapid serial review.
- current passage content, questions, answers, source ownership and held-out behavior.
- whole-passage clean attempt and existing local state/trajectory/Uncertain evidence.
- continuous-practice mode may keep result/review hidden until the intended review stage.
- optional passage highlight stays secondary.
- quick local triage and optional whole-passage Chat escalation remain available only after a real problem.
- no forced repair/transfer ritual for stable clean work.

### Optimize

1. **Reading comfort**
   - retain the strong long-reading treatment; use it as the English typography reference.
   - question prompts/options must be comfortably readable too; remove unnecessary 8–10px learner text.
   - the right column should read as a continuous question sheet, not a stack of hidden/revealed cards.

2. **Dense Calm hierarchy**
   - Passage + **full question set** dominate the viewport.
   - remove the current top-level Q1/Q2/Q3… navigation strip as a primary interaction. The page itself is the navigation; at most retain a quiet answered/progress indicator if it materially helps orientation.
   - simplify permanent header chrome; move Reset/debug/history-like actions out of the primary action line when possible.
   - progress/timer/Uncertain remain visible but subordinate.
   - use borders/cards only where they express a real interaction boundary; avoid visually boxing every question as if it were a separate mini-app.

3. **Full-set interaction model**
   - render Q1…Q5 (or the set's actual count) simultaneously in natural order inside the right column.
   - selecting/focusing a question may set a lightweight active question for keyboard targeting, but **active ≠ only visible**.
   - preserve free visual comparison between questions and easy return to earlier answers without mode switching.
   - do not auto-hide previous questions or require Previous/Next controls to inspect the set.
   - a separate question navigator is unnecessary unless later real use proves that the full sheet becomes hard to navigate.

4. **Low-friction keyboard grammar**
   - `1–4 = A/B/C/D` for the currently focused/active question; pointer/focus interaction may establish that local target.
   - `A–D` may remain as a compatibility alias if this can be preserved without complexity.
   - `U` toggles Uncertain for the focused/active question.
   - choosing an answer must **not** reveal correctness before whole-passage submission.
   - `Enter` may submit the whole passage only when the existing attempt contract makes that unambiguous; never turn Reading A into Politics Fast mode.
   - do not add keyboard machinery merely to avoid natural scrolling. Reading A is a sustained workspace; keyboard is an accelerator, not the governing interaction model.

5. **After submit**
   - stable clean result: make the next meaningful action obvious and cheap.
   - Wrong/Uncertain: reveal answer delta and smallest local triage **in place on the relevant questions** while preserving the full set and passage context.
   - problem review may jump/scroll to a problem, but must not collapse the rest of the set into a one-question wizard.
   - whole-passage Chat escalation stays optional and secondary; do not manufacture a deep-review workflow for every miss.

6. **Continuity**
   - preserve independent Passage/right-question scroll positions through ordinary answering and review whenever practical.
   - no visibility-mode switch that loses the learner's place in the question sheet.
   - responsive fallback required, but Mac landscape is design origin.
   - on narrower screens, stacking Passage and full question set is acceptable; preserve the whole-set model rather than reverting to one-question paging.

### Accepted interaction details｜frozen for first implementation

**Answer selection**

Before submit, a selected option is shown as a quiet outlined choice with a checkmark inside the selection row. It means only **my current choice**; it must not use correctness color or reveal correctness.

```text
  1   option A

  2   option B

╭──────────────────────────────╮
│ 3   option C              ✓ │
╰──────────────────────────────╯

  4   option D
```

Changing the answer moves this quiet selected treatment to the new option while existing answer trajectory remains preserved in state. After submit, an incorrect selected option and the formal answer may receive restrained distinct result treatments in place; do not turn the question into a separate result card.

**Attempt time + deep-review packet**

- preserve attempt start/submission timestamps and total duration;
- timer stays subordinate during work;
- the existing whole-passage deep-review packet must retain **total doing time** together with score, Wrong/Uncertain set, answer trajectory, optional cause and selected passage context;
- timing is diagnostic context, not mastery/debt by itself.

**Passage text selection → contextual tools**

Do not keep a permanent highlight toolbar. Selection itself summons the smallest useful contextual menu.

- exact **single lexical token**: primary action `Lexical 查词`, plus secondary `高亮` and `Chat 上下文`;
- multiword phrase / short span: `高亮` + `Chat 上下文`; expose a Lexical construction action only when Current LexicalOS can resolve that exact object without guessing;
- sentence / paragraph: `高亮` + `Chat 上下文`, no fake word lookup.

`Lexical 查词` must route to **Current LexicalOS truth**, never render a duplicate mini-dictionary inside Reading. The current Vocabulary surface already owns Search + Depth Card. For the Reading Gold PR, use read-only exact Current owner resolution when possible: exact match may open the corresponding current Depth Card. If no exact owner match exists, fail softly into the current Vocabulary search surface rather than inventing a meaning. Do not mutate Lexical evidence, Repair, mastery or learner state merely because the learner looked up a word.

Because PR #86 currently touches Lexical Evidence/Memory and vocabulary routing, the Reading Gold implementation must not modify Lexical runtime/pages to obtain this bridge. Keep the Reading-side bridge read-only and non-overlapping; if a richer prefilled search requires a Lexical-side change, leave that enhancement until the Lexical owner is safe.

**Header / secondary controls**

Primary work chrome should remain approximately:

```text
← Reading       paper · passage identity       answered/total · time       Submit
```

Reset / History / provenance / debug do not compete with the learner task. Reset/history may live behind secondary controls; provenance/debug stay off the normal learner surface.