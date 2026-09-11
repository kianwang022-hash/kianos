# Reading A Module Contract

## Role

Reading A is the exam-specific objective-reading module for English I.

Target: **40/40 in training, with exam execution stable enough to support the overall 80–85+ goal.**

Reading A is not organized around teacher question-type courses. Its learner path is:

`understand → locate decisive evidence → adjudicate options → execute`

Question type may describe the item, but it is not assumed to explain the failure.

## Attempt surface

The first attempt must remain clean and exam-like.

Default learner surface:

- passage on the left;
- one current question on the right;
- A–D answer controls;
- `Uncertain` as the only optional learner mark during the clean attempt;
- quiet timer / progress;
- fast keyboard navigation;
- optional low-friction passage marking when useful.

Before submission, do **not** expose:

- formal answer;
- decisive evidence;
- option diagnosis;
- teacher method;
- prior-attempt answer or analysis;
- repair hints.

Do not make annotation, tagging, or note-taking mandatory. Native text selection may remain available; custom marking should stay lightweight and optional.

## Private attempt evidence

Astro may keep private browser/device evidence needed for interaction and diagnosis. This is not shared Current content.

Useful evidence is intentionally small:

- selected answer per question;
- uncertain state;
- attempt start / submit time;
- answer changes when available;
- current question / navigation state;
- final correctness;
- optional learner quick-cause note after submission.

The learner may record a **coarse, low-friction personal cause** because this is useful memory of the moment. It is not the system's semantic diagnosis and must never be mandatory.

Preferred quick causes:

- 没读懂;
- 没定位准;
- 选项没辨清;
- 看错 / 改错.

Chat remains responsible for deeper diagnosis when needed.

## Submit behavior

### Stable clean result

If all questions are correct, all answered, and none are marked uncertain:

`score → compact success → next`

Do not open a full explanation panel or force a second pass.

### Review queue

Only high-value items enter review by default:

1. wrong / unanswered;
2. uncertain even if correct;
3. later, a meaningful execution anomaly when the captured evidence is strong enough to justify it.

Stable correct questions stay compressed.

## Review timing

Attempt and review are separate phases. Do not interleave repair into the middle of the intended attempt unit.

For a single-passage session:

`finish the whole passage → submit → review the passage`

For continuous training across multiple passages:

`finish the planned passage set → then review the set`

Continuous training is a deliberate **sealed mode**. Once enabled, each submitted passage may be recorded privately, but until the learner ends the continuous session the learner-facing surface should reveal only that the passage has been submitted. It must not reveal:

- passage score;
- which questions were wrong;
- formal answers;
- canonical evidence;
- option diagnosis;
- repair prompts.

The learner can continue directly to the next passage. Ending the continuous session unlocks review only for passages that actually contain wrong, unanswered, uncertain, or later well-supported execution-anomaly items. Clean passages do not need to become review work merely because they were part of the session.

For ordinary single-passage training, submission itself ends the clean attempt, so review may open immediately after the whole passage has been submitted.

Question-level repair remains local and lightweight, but a single question is only marked **handled for this review**, not “closed” or “mastered.” Completion language belongs at the passage or training-session level.

## Review principle

The review target is the **first meaningful failure**, not the largest available explanation.

Default review object:

`question + learner choice + formal answer + minimum context needed for the next cognitive action`

The learner should reconstruct before receiving passive explanation whenever possible.

### Repair actions

#### UNDERSTAND / SENTENCE

Use when the decisive failure is the language representation itself.

Surface:

`necessary sentence/span → learner reconstructs proposition`

Do not reopen the whole passage unless local context is insufficient.

#### LOCATE

Use when the text was basically understood but the decisive evidence was not located correctly.

Surface:

`question → passage → re-identify minimal decisive evidence`

Do not reveal the decisive evidence before the learner gets a chance to relocate it.

#### JUDGE

Use when the evidence is available but the options were adjudicated incorrectly.

Surface:

`minimal evidence + chosen option + correct option → state the decisive difference`

Do not expand all four options unless the other distractors are themselves diagnostically useful.

#### LEXICAL

If a word, phrase, construction, contrast, or familiar-new sense caused the first failure, route the repair to its canonical LexicalOS owner when one exists. Do not create a duplicate Reading-specific word explanation.

#### DISCOURSE

Use only when sentence-level repair is insufficient and paragraph / discourse structure is the first meaningful failure.

Surface only the minimum paragraph structure needed to reconstruct the relation.

#### EXECUTION

Use only when observable attempt evidence supports a behavior-level failure, such as an avoidable answer switch or time-management problem.

Show the smallest relevant trajectory/timing evidence and derive one behavior rule. Do not convert ordinary uncertainty into an execution diagnosis.

## Chat bridge

Chat owns semantic diagnosis.

When a question needs deeper diagnosis, Astro should be able to produce a **compact review packet** for copy/paste into Chat instead of requiring the learner to manually describe the whole attempt.

Minimum packet:

- reading object ID;
- question ID / ordinal;
- prompt and options;
- learner final answer;
- formal answer;
- uncertain state;
- learner quick-cause note if present;
- answer trajectory if captured;
- only the necessary passage context when selected by the learner or runtime.

Chat may then decide the first meaningful failure and the smallest repair. Personal diagnosis is not written into shared Current by default. If repeated evidence justifies a durable shared learning asset or interaction improvement, update the relevant canonical owner in GitHub.

## Retry / second pass

There is no mandatory standalone “二刷” workflow.

A retry exists to verify a repair, not to make the learner re-do a page because the system has a second-pass feature.

Preferred sequence:

`attempt unit → submit / seal → finish intended training unit → review queue → local repairs → passage / session review complete → later unseen transfer`

Quick cause logging is optional and should take one click. It supplements, rather than replaces, semantic diagnosis.

## Content assets

Canonical exam source remains factual authority for passage, questions, options, and formal answers.

High-value learner assets may be added only when they have future retrieval value, for example:

- minimal decisive evidence;
- decisive proposition;
- chosen-vs-correct option contrast;
- necessary sentence/discourse focus;
- validated high-value repair note.

These assets may exist richly in the backend but are revealed progressively according to the current repair action.

## Relationship to external reading

Reading A measures **exam fitness**.

Fresh TPO / IELTS / periodical material measures **language transfer under low memory residue**.

The two pools are complementary. Reused exam passages remain valuable for exam mechanics and failure repair, but their correctness rate must not be treated as equivalent to unseen mastery once memory residue is substantial.

## UI deletion rule

A Reading control or panel should not survive merely because it existed in Local or an earlier runtime.

Keep it only if it materially improves one of:

- clean attempt quality;
- evidence capture for diagnosis;
- speed of high-value repair;
- score reliability;
- unseen transfer testing.

Otherwise remove it.
