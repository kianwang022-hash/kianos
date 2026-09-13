# English Product Brief — discussion freeze

Status: ACTIVE DISCUSSION BRIEF  
Parent cursor: `static-web/CURRENT.md`  
Scope: learner-visible English family product decisions only.  

This file is a temporary durable product-discussion owner while Kian and Sol review the complete English family surface-by-surface. It does not change English learning/evidence semantics. After the full English family is accepted, reconcile the accepted decisions into the final Current/Codex handoff and retire any superseded wording.

## Shared boundary

- Primary environment: Mac wide landscape.
- English remains Digital Workbook + Adaptive Coach.
- Preserve each task's native cognitive geometry; do not force one template across Reading A / Cloze / Part B / Translation / Writing.
- Stable work stays quiet and fast; deeper help appears only after a real problem.
- Existing task state, answer gating, Uncertain, trajectory, attempt timing, whole-unit submit/review, optional Chat escalation, Resume semantics and owner boundaries must be preserved unless explicitly changed below.
- Lexical lookup is read-only routing to Current LexicalOS truth; lookup alone does not create Repair/evidence/mastery state.

---

## Reading A — accepted direction

Preserve existing whole-passage clean attempt, local state/trajectory/Uncertain, timer, continuous-practice behavior, answer gating, optional problem review and whole-passage Chat escalation.

Change learner projection from `Passage + one visible current question` to:

```text
Mac landscape
Passage left, independently scrollable
|
full question set right, all questions visible in natural order and independently scrollable
```

Active/focused question may remain only for keyboard targeting; it must not gate visibility of the other questions. Remove dependence on a top Q1–Q5 navigator / Previous–Next just to see questions.

Before submit, selected option uses a quiet outlined row and checkmark only; it means `my current choice`, never correctness.

```text
  1   option A

  2   option B

╭──────────────────────────────╮
│ 3   option C              ✓ │
╰──────────────────────────────╯

  4   option D
```

Preserve total attempt time in the deep-review packet together with score, Wrong/Uncertain, trajectory, optional cause and selected passage context.

Passage selection menu:
- exact single lexical token → `Lexical 查词` primary + `高亮` + `Chat 上下文`;
- phrase/span → `高亮` + `Chat 上下文`; only expose a Lexical construction action when exact Current resolution exists;
- sentence/paragraph → `高亮` + `Chat 上下文`.

No Reading-local dictionary and no learner-state mutation from lookup.

After submit, Wrong/Uncertain review expands in place while passage + full question set remain available.

---

## Cloze — accepted direction

### Preserve existing functions

Keep the existing Cloze semantics/runtime:
- complete passage remains visible;
- all 20 blanks belong to one clean-attempt unit;
- each blank supports Uncertain;
- selections may be changed and trajectory stays recorded;
- no correctness reveal before whole-passage submit;
- whole passage submits as one attempt;
- start/submission timestamps and total duration remain available;
- submitted result keeps whole-passage score/formal answers;
- optional `整篇给 Chat` deep review remains problem-only and retains passage, time, Wrong/Uncertain, all-blank outcome map and answer trajectories.

### Projection correction: full exam-paper layout on Mac

The previous projection assumption `complete passage + one visible active blank decision surface` is intentionally replaced for learner presentation. This is a Projection change only; Cloze learning/evidence logic stays unchanged.

Kian's required Mac-wide model is the natural **exam-paper typesetting**:

```text
complete Cloze passage left
|
ALL 20 blank rows right, visible in natural order inside one scrollable question sheet
```

Each blank row keeps its four candidates horizontally arranged like the printed paper, not four stacked full-width cards.

Target shape:

```text
┌────────────────────────────────────────┬──────────────────────────────────────────────────┐
│ Complete Passage                       │ 01  A ...      B ...      C ...      D ...       │
│                                        │                                                  │
│ ... ____1____ ...                      │ 02  A ...      B ...      C ...      D ...       │
│ ... ____2____ ...                      │                                                  │
│ ... ____3____ ...                      │ 03  A ...      B ...      C ...      D ...       │
│                                        │                                                  │
│ ... ____8____ ...                      │ 04  A ...      B ...      C ...      D ...       │
│                                        │                                                  │
│ ... ____9____ ...                      │ ...                                              │
│                                        │                                                  │
│                                        │ 08  A despite  B although  ╭──────────────╮ D ...│
│                                        │                            │ C therefore ✓│      │
│                                        │                            ╰──────────────╯      │
│                                        │                                                  │
│                                        │ 09  A ...      B ...      C ...      D ...       │
│                                        │ ...                                              │
│                                        │ 20  A ...      B ...      C ...      D ...       │
│             passage scroll ↓           │                         question sheet scroll ↓   │
└────────────────────────────────────────┴──────────────────────────────────────────────────┘
```

### Exam-paper behavior

- all 20 rows remain visible in the right question sheet; no blank is hidden merely because it is not active;
- passage and 20-row question sheet scroll independently;
- question number is the natural navigation; do not require a separate 01–20 navigator merely to reveal a hidden blank;
- clicking `____8____` in the passage scrolls/focuses row 08 on the right;
- clicking/focusing row 08 may lightly locate/highlight `____8____` in the passage;
- local `active blank` may still exist only for keyboard targeting / focus state, never for visibility gating;
- `1–4 = A/B/C/D` for the focused blank;
- answer selection never scores locally and must preserve easy backtracking;
- auto-focus to the next row after selection may be used as an accelerator if it does not force scroll jumps or wizard behavior.

### Option layout

Mac default = one row of four candidates:

```text
08    A despite      B although      C therefore      D however
```

Selected candidate uses a restrained exam-like treatment; it means only `my current choice` before submit.

```text
08    A despite      B although      ╭────────────────╮      D however
                                     │ C therefore  ✓ │
                                     ╰────────────────╯
```

If one candidate is long, its own cell may wrap to two lines. A 2×2 fallback is acceptable only when four columns become genuinely unreadable. Do not default to four vertically stacked cards.

### Submit / review

Whole-passage Submit remains one action. Before submit, no formal answers appear.

After submit:
- keep the same passage + full 20-row sheet;
- Wrong/Uncertain rows gain restrained in-place result/triage treatment;
- do not switch into a one-blank review wizard;
- optional whole-passage Chat escalation remains secondary after quick understanding fails or problems appear coupled/recurring.

### Lexical

Single-word passage selection may offer read-only `Lexical 查词`, plus highlight / Chat context, under the same owner boundary as Reading A.

---

## Next unresolved English surface

`Part B`

When discussing each next surface, always report in this order:
1. original learning/projection intent;
2. all important existing learner-visible functions;
3. what is preserved vs changed;
4. Mac-wide target sketch.
