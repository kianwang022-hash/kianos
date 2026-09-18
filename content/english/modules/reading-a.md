# Reading A Module Contract

## Role

Reading A is the English I objective-reading trainer for **evidence-based option adjudication**.

Target: **40/40 in training**, with execution stable enough to support the overall English 80–85+ goal.

Parent contracts:

- `content/english/LEARNING_CONTRACT.md`;
- `content/english/modules/objective-runtime.md`.

Learner path:

`understand relevant text → identify question demand → locate decisive evidence → adjudicate real competing options → execute`

Question type may describe an item, but it is not assumed to explain the failure.

---

## Attempt surface

The first attempt must remain clean and exam-like.

Default surface:

- passage visible;
- complete question set in natural order; one focused question may own A–D keyboard controls, never visibility;
- `Uncertain` as an optional low-friction mark;
- quiet timer/progress;
- fast keyboard navigation;
- optional lightweight passage marking.

Before submission, do not expose formal answer, decisive evidence, option diagnosis, teacher method, prior-attempt analysis, or repair hints.

Annotation and note-taking are optional.

---

## Private attempt evidence

Useful private evidence is intentionally small:

- final answer per question;
- uncertain state;
- attempt timing;
- answer changes when available;
- final correctness;
- optional coarse learner note after submission.

A quick-cause mark such as `没读懂 / 没定位准 / 选项没辨清 / 看错或改错` may preserve the learner's momentary feeling. It is not semantic truth and must never be mandatory.

Question-level evidence is allowed because evidence granularity can be smaller than attempt / diagnostic context.

---

## Submit and fast triage

### Stable clean result

If all questions are correct, answered, and no uncertainty is meaningful:

`score → compact success → next`

Do not open full explanation or force a second pass.

### Problem signals

Wrong / unanswered and meaningful uncertainty trigger **fast triage**, not automatic deep Chat review.

Triage should decide cheaply:

- can the learner now identify the decisive evidence / option difference and explain the miss? → quick-resolved, move on;
- is the failure lexical? → LexicalOS;
- is the relevant proposition / scope / relation representation unstable? → shared English Representation repair;
- is the problem ambiguous, recurring, high-cost, or likely to generalize? → optional deep review.

A correct-but-uncertain item may fast-pass after a cheap check if no reusable weakness is supported.

---

## Review timing

Attempt and repair stay separate. Do not interrupt the middle of a planned attempt unit.

For continuous multi-passage training, review may be deferred until the planned batch ends so one miss does not destroy reading continuity.

Clean passages do not become review work merely because they were part of a batch.

---

## Diagnostic context envelope

When deep Chat review is justified, the complete passage + its question set is the normal **diagnostic context envelope**.

Why: several question-level problems may share one sentence, paragraph, stance, evidence-boundary, or discourse failure.

This is **not** a rule that every wrong or uncertain question must create a whole-passage Chat ritual.

Question objects remain valid internal evidence and local repair slices.

Chat should ask:

```text
what happened across this passage?
→ are problem questions independent?
→ do several share one upstream failure?
→ are some dependent/cascading?
→ what is the smallest independent repair set?
```

---

## Deep-review principle

Prefer the smallest set of meaningful independent failures, not the largest explanation and not one explanation per wrong question.

Example:

```text
Q2 wrong + Q4 wrong
→ one paragraph-level stance misunderstanding
→ one shared repair

Q5 uncertain for an unrelated option-boundary reason
→ one separate local repair
```

This yields two repairs, not three and not an artificial one-thread-only story.

---

## Repair actions

### REPRESENT / SENTENCE

Use when the decisive failure is the language representation itself.

Surface only the necessary sentence/span and reconstruct proposition / relation.

Shared semantic primitives may include clause hierarchy, attachment, reference, scope, modality/degree, and logical relation.

Do not reopen the whole passage unless context requires it.

### LOCATE

Use when the text was basically understood but decisive evidence was not located correctly.

`question → passage → re-identify minimum sufficient evidence`

Do not reveal the decisive evidence before giving the learner a chance to relocate it when reconstruction value exists.

### JUDGE

Use when evidence is available but options were adjudicated incorrectly.

`minimum evidence + real competing option(s) → state the decisive difference`

Do not analyze all four options unless needed.

### LEXICAL

Route word-local sense, phrase, construction, collocation, contrast/confusable, or familiar-new-sense failure to LexicalOS.

### DISCOURSE / REPRESENTATION

Use when sentence-level repair is insufficient and paragraph/discourse structure is the first meaningful failure.

One discourse repair may explain several questions.

### EXECUTION

Use only when observable attempt evidence supports a behavior-level failure such as an avoidable answer switch or time collapse.

Derive one compact behavior rule. Do not turn ordinary uncertainty into an execution diagnosis.

---

## Optional Chat bridge

Chat owns deep semantic diagnosis, but Chat is not mandatory after every problem.

When escalation is justified, one self-contained passage packet may include:

1. identity;
2. score / duration / problem ordinals;
3. passage once;
4. compact all-question outcome map;
5. expanded prompt/options for meaningful problem questions;
6. uncertainty / answer trajectory / optional note when useful.

Stable correct questions stay compact.

Expected Chat behavior:

`whole context → meaningful problems → merge shared/dependent causes → choose smallest repair set → route LexicalOS / Representation / Reading-A-specific failures → optional backend transfer state`

The learner should not need to retell every question.

---

## Retry / same-item correction

There is no mandatory second-pass workflow.

A known-item retry exists only when it gives useful repair evidence. Same-question correction proves that the repair may have worked; it is not mastery.

The preferred end state is to return to new performance, not to prove completion of a page.

---

## Future validation / transfer

A repaired reusable task-specific behavior may become a small backend observation target only when later evidence could change confidence or study allocation.

Rules:

- no durable weakness from one event;
- no automatic future task from a pending target;
- no clean-passage Chat requirement caused by pending state;
- later fresh success is stronger than remembered success;
- repeated high-confidence failures on distinct passages matter more than one miss;
- if later normal work genuinely tests a pending behavior, Chat may update it opportunistically during an already-justified review.

---

## Content assets

Canonical exam source remains factual authority for passage, questions, options, and formal answers.

High-value backend learner assets may include:

- minimum decisive evidence;
- decisive proposition;
- chosen-vs-correct contrast;
- necessary sentence/discourse focus;
- validated repair note.

Backend richness does not require learner-facing display. Do not create a durable asset merely because one question was once wrong.

---

## External reading

Reading A measures exam fitness. Fresh TPO / IELTS / periodical material can provide lower-memory-residue transfer, language breadth, and reading-speed evidence.

These pools are complementary. Reused exam passages are useful for mechanics/repair, but remembered correctness must not be treated as unseen mastery.

---

## UI deletion rule

A Reading control or panel survives only if it materially improves:

- clean-attempt quality;
- useful evidence capture;
- speed/quality of high-value repair;
- score reliability;
- or return to new performance.

Consequences:

- per-question `copy to Chat` is not a normal bridge;
- passage-level deep handoff is optional escalation, not mandatory closure;
- quick-cause / evidence-span / diagnosis controls remain optional;
- pending backend state must not surface simply because it exists;
- stable correct work should collapse.