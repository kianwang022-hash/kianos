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

## Cloze — accepted direction so far

### Preserve existing functions

Keep the existing Cloze semantics/runtime:
- complete passage remains visible;
- one active blank owns the immediate A–D decision surface;
- 20-blank navigation remains useful;
- each blank supports Uncertain;
- selections may be changed and trajectory stays recorded;
- no correctness reveal before whole-passage submit;
- whole passage submits as one attempt;
- start/submission timestamps and total duration remain available;
- submitted result keeps whole-passage score/formal answers;
- optional `整篇给 Chat` deep review remains problem-only and retains passage, time, Wrong/Uncertain, all-blank outcome map and answer trajectories.

### Mac landscape projection

Do **not** stack A/B/C/D vertically by default on Mac. Use the wide screen like an exam paper: the active blank's four candidates are laid out horizontally in one row whenever text length allows.

Target shape:

```text
┌──────────────────────────────────────────┬────────────────────────────────────────────┐
│ Complete Passage                         │ Blank 08                                   │
│                                          │                                            │
│ ... ____7____ ...                        │  A despite   B although   C therefore   D however │
│ ... 【____8____】 ...                     │                            ──────────── ✓    │
│ ... ____9____ ...                        │                                            │
│                                          │                              ○ Uncertain   │
│                                          │ 01 02 03 04 05 06 07 08 ... 20            │
└──────────────────────────────────────────┴────────────────────────────────────────────┘
```

The exact visual selection treatment should remain restrained and exam-like. A selected candidate may use a quiet outline/underline/check treatment; submit-time correctness colors remain separate.

If an option label is too long for a usable four-column row, the fallback may wrap within its own horizontal cell or degrade to a 2×2 grid. Do not default back to four full-width vertical cards merely because the component is easier.

### Passage ↔ blank linkage

- clicking/selecting a blank in the passage activates that blank's decision surface;
- changing active blank should visually locate/highlight the corresponding blank in the passage;
- passage context stays visible and is never replaced by an isolated question card;
- 01–20 navigator remains a compact fast jump surface because Cloze has twenty slots.

### Input

- `1–4 = A/B/C/D` for the active blank;
- answer selection does not score locally;
- moving focus to the next blank after a selection is allowed as a low-friction accelerator, but must preserve easy backtracking and must not submit/reveal the blank.

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
