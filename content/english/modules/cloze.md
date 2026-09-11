# Cloze Module Contract

## Role

Cloze is the English I objective-task trainer for **best-fit decisions under slot constraints**.

Parent contracts:

- `content/english/LEARNING_CONTRACT.md`;
- `content/english/modules/objective-runtime.md`.

Cloze does not own a separate vocabulary system and must not become a twenty-question word-definition review page.

Its cognitive path is:

`context → slot demand → active constraints → candidate competition → decisive constraint → best fit`

---

## Attempt unit

> **One complete Cloze passage / full blank set is the minimum learner-facing attempt and review unit.**

A blank is an internal answer/evidence unit, not an independent Chat review unit.

The learner should experience the task as reading one passage whose local decisions interact with sentence and discourse context—not as twenty detached multiple-choice cards.

---

## Clean attempt surface

The first attempt should preserve exam-like continuity.

Preferred interaction:

- the passage remains the visual center;
- blanks are visible in context;
- one active blank may expose its four candidates without removing surrounding text;
- fast previous/next-blank navigation is allowed;
- `Uncertain` may be captured with one low-friction action;
- timer/progress remain quiet;
- no explanation or constraint labels appear before submission.

Before submission do **not** expose:

- formal answer;
- lexical explanation;
- collocation/construction hints;
- discourse relation labels;
- decisive constraint;
- teacher method;
- prior-attempt diagnosis.

Do not require the learner to predict or type the exact missing word before seeing options. The learning requirement is to form a useful **slot demand**, not to turn every blank into free recall.

---

## Private attempt evidence

Useful internal evidence may include:

- selected answer per blank;
- unanswered state;
- uncertain state;
- answer trajectory when available;
- attempt duration;
- optional learner note after submission.

Do not require a manual error taxonomy per blank.

Evidence granularity may be blank-level while review granularity remains passage-level.

---

## Submit behavior

Finish the full passage before revealing correctness.

### Stable clean result

If all blanks are answered correctly and none are uncertain:

`score → compact success → next`

Do not force twenty explanations or a second pass.

### Passage enters review when

- at least one blank is wrong/unanswered;
- at least one blank is uncertain even if correct;
- a later well-supported execution anomaly justifies review.

Stable correct blanks remain compact evidence inside the passage review packet.

---

## Passage-level diagnosis

Chat first inspects the whole attempt, then decides whether problem blanks are independent or share a cause.

Default diagnostic sequence:

```text
whole passage
→ identify problem blanks
→ test for shared lexical / sentence / discourse cause
→ separate primary from dependent errors
→ create the smallest number of repair threads
```

Do not assume `3 wrong blanks = 3 weaknesses`.

One misunderstood sentence relation may explain multiple blanks. One missing construction may explain repeated competition. These should be merged under the primary cause.

---

## Internal repair action

For a genuinely local Cloze repair, ask:

1. **What did this slot require before considering the candidates?**
2. **Which candidates were actually competitive?**
3. **Which constraint separated them?**
4. **Where does the root cause belong?**

Constraint sources may include:

- lexical sense / semantic preference;
- collocation / phrase;
- syntax / construction / government;
- sentence proposition;
- inter-sentence relation;
- global discourse context.

Do not default to explaining all four options.

The smallest high-value repair object is typically:

`minimum useful context + slot demand + real candidate contrast + decisive constraint`

---

## Root-cause routing

### Lexical

Route to LexicalOS when the first meaningful failure is:

- unknown sense;
- familiar-new sense;
- phrase;
- construction;
- collocation;
- confusable / contrast;
- semantic preference that belongs to the lexical object.

Do not create a duplicate Cloze word database.

### Reading

Route to Reading when the decisive failure is the representation of:

- sentence meaning;
- negation/scope;
- logical relation;
- paragraph/discourse progression;
- local context required to know what the slot demands.

### Cloze-specific

Keep the repair in Cloze only when the needed language/context representation was available but the learner failed the **best-fit decision procedure**, for example:

- compared candidates only by rough Chinese meaning;
- failed to check the decisive collocational/constructional constraint despite knowing it;
- accepted a locally possible option without testing global fit.

---

## Chat bridge｜Cloze passage packet v1

The normal Chat bridge is one full Cloze passage/set.

Packet structure inherits Objective Review Packet v1 and specializes it as follows:

- include the complete passage once;
- include a compact outcome row for every blank;
- expand wrong/unanswered/uncertain blanks with candidates and the minimum local context needed to identify the slot;
- preserve answer trajectory / uncertainty / optional note when captured;
- keep stable correct blanks compressed;
- never generate twenty independent Chat packets from one passage.

Expected Chat behavior:

`whole passage → cluster causes → select local/shared repair threads → route Lexical/Reading/Cloze-specific failures → create only justified transfer claims`

---

## Memory admission

A wrong Cloze blank does **not** automatically enter future review.

Admit durable work only when it reveals:

- a reusable LexicalOS object;
- a recurring Reading representation failure;
- a repeated Cloze procedure failure that remains weak on distinct material.

Task-specific procedure failures should normally live as temporary `TRANSFER_PENDING` claims, not permanent mistake cards.

---

## Transfer / closure

Evidence strength follows:

`known blank correction < targeted new contrast < later fresh Cloze success < repeated independent unseen transfer`

Rules:

- redoing the same blank is not mastery;
- memorizing the answer is weak evidence;
- later unseen use of the same construction/relation is stronger;
- close temporary Cloze claims when later independent evidence is sufficient;
- do not keep old passages in active review merely because they once contained an error.

---

## UI non-isomorphism

Do not clone Reading A mechanically.

Reading A naturally centers `passage + current question + options`.

Cloze should center **continuous passage context + active slot**. A UI that turns each blank into a full separate card weakens the core action because it strips the slot from the flow that constrains it.

Shared visual components are allowed only when they preserve this cognitive action.
