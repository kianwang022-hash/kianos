# Cloze Module Contract

## Role

Cloze is the English I objective-task trainer for **best-fit decisions under slot constraints**.

Parent contracts:

- `content/english/LEARNING_CONTRACT.md`;
- `SYSTEM_CONTRACT.md` for shared Engineering / Runtime capability.

Cloze does not own a separate vocabulary system and must not become a twenty-question word-definition review page.

Its cognitive path is:

`context → slot demand → active constraints → candidate competition → decisive constraint → best fit`

---

## Attempt unit

> **One complete Cloze passage / full blank set is the learner-facing clean-attempt unit.**

A blank is an internal answer/evidence unit. The learner should experience one passage whose local choices interact with sentence and discourse context, not twenty detached cards.

This whole-attempt rule does **not** mean every problem blank requires a whole-passage Chat review.

---

## Clean attempt surface

The first attempt should preserve exam-like continuity.

Preferred interaction:

- passage remains visually primary;
- blanks stay in context;
- one active blank may expose its four candidates without hiding surrounding text;
- fast previous/next navigation is allowed;
- `Uncertain` may be captured with one low-friction action;
- timer/progress remain quiet;
- no explanation or constraint labels appear before submission.

Before submission do **not** expose formal answer, lexical explanation, construction hints, discourse labels, decisive constraint, teacher method, or prior diagnosis.

Do not require free recall of the exact missing word before seeing options. The useful action is forming a **slot demand**, not turning every blank into vocabulary dictation.

---

## Private attempt evidence

Useful internal evidence may include:

- selected answer per blank;
- unanswered state;
- uncertain state;
- answer trajectory when available;
- attempt duration;
- optional learner note after submission.

Do not require manual error taxonomy per blank.

Evidence granularity may be blank-level while attempt granularity remains passage-level.

---

## Submit and triage

Finish the full passage before revealing correctness.

### Stable clean result

If all blanks are correct and none are meaningfully uncertain:

`score → compact success → next`

No twenty explanations and no second pass.

### Problem signals

Wrong / unanswered and meaningful uncertainty trigger **fast triage**, not automatic deep review.

Fast triage asks only enough to decide:

- is this now obvious from the decisive constraint? → quick-resolved, move on;
- is there a real lexical object? → LexicalOS;
- is sentence/discourse representation unstable? → shared English Representation repair;
- is the best-fit procedure itself unstable, recurring, ambiguous, or high-cost? → optional deep review.

A correct-but-uncertain blank may fast-pass after a cheap check if no reusable weakness is supported.

---

## Optional deep review

When deep review is justified, Chat receives enough of the complete passage to detect shared sentence/discourse causes and dependent blanks.

Default diagnostic sequence:

```text
whole passage context
→ identify meaningful problem blanks
→ test shared lexical / representation / discourse cause
→ separate primary from dependent errors
→ choose the smallest independent repair set
```

Do not assume `3 wrong blanks = 3 weaknesses`, but do not force genuinely independent high-value misses into one thread either.

The whole passage is a **diagnostic context envelope**, not a mandatory learner ritual.

---

## Internal repair action

For a genuinely local Cloze repair, ask:

1. What did this slot require before considering candidates?
2. Which candidates were actually competitive?
3. Which constraint separated them?
4. Where does the root cause belong?

Constraint sources may include:

- lexical sense / semantic preference;
- collocation / phrase;
- syntax / construction / government;
- sentence proposition;
- inter-sentence relation;
- global discourse context.

Do not default to explaining all four options.

The smallest high-value local object is typically:

`minimum useful context + slot demand + real candidate contrast + decisive constraint`

---

## Root-cause routing

### LexicalOS

Route when the first meaningful failure is a word-local sense, familiar-new sense, phrase, construction, collocation, confusable, or other lexical semantic preference.

Do not create a duplicate Cloze word database.

### Shared English Representation

Route when the decisive failure is the representation of sentence meaning, attachment, negation/scope, reference, logical relation, or paragraph/discourse progression.

Current runtime code may still call this route `reading`; that label is a compatibility alias, not a second learner course.

### Cloze-specific

Keep the repair in Cloze only when the needed language/context representation was available but the learner failed the **best-fit decision procedure**, for example:

- compared candidates only by rough Chinese meaning;
- failed to test a decisive known construction/collocation;
- accepted a locally possible option without testing global fit.

---

## Chat bridge

The normal learner path does **not** require Chat after every problem.

When escalation is justified, one optional deep-review packet may include:

- the complete passage once;
- compact outcome rows for all blanks;
- expanded wrong/unanswered/meaningfully uncertain blanks with candidates and minimum local context;
- trajectory / uncertainty / optional note when useful.

Expected Chat behavior:

`whole context → cluster causes → choose smallest repair set → route LexicalOS / Representation / Cloze-specific failures → create only justified backend transfer state`

Do not generate twenty independent packets.

---

## Memory / future review admission

A wrong Cloze blank does **not** automatically enter future review.

Durable work is justified only when it reveals:

- a reusable LexicalOS object;
- a recurring Representation failure;
- a repeated high-value Cloze procedure failure whose later performance remains unstable.

A one-off miss that is cheaply understood may end with no durable object.

Task-specific transfer state, when justified, is backend observation state rather than scheduled learner debt.

---

## Transfer / closure

Evidence strength generally rises:

`known blank correction < targeted new contrast < later fresh Cloze success < repeated independent unseen transfer`

Rules:

- redoing the same blank is not mastery;
- memorized answer is weak evidence;
- later real use of the same lexical / representation / decision demand is stronger;
- do not keep old passages active merely because they once contained an error;
- a pending task-specific target must not summon a clean passage to Chat merely to close bookkeeping.

---

## UI non-isomorphism

Do not clone Reading A mechanically.

Reading A centers passage + current question + options. Cloze should center **continuous passage context + active slot**.

Shared components are allowed only when they preserve this cognitive action.

Any review control that survives must earn its time by improving score reliability, repair quality, or return speed to new performance.