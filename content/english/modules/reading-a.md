# Reading A Module Contract

## Role

Reading A is the exam-specific objective-reading module for English I.

Target: **40/40 in training, with exam execution stable enough to support the overall 80–85+ goal.**

Parent contracts:

- `content/english/LEARNING_CONTRACT.md` for cross-English learning philosophy;
- `content/english/modules/objective-runtime.md` for the frozen objective-task runtime, passage/set review unit, evidence/transfer semantics, and Chat review-packet rules.

Reading A is not organized around teacher question-type courses. Its learner path is:

`understand → locate decisive evidence → adjudicate options → execute`

Question type may describe the item, but it is not assumed to explain the failure.

---

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

---

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

The learner may record a **coarse, low-friction personal cause** because this can preserve the feeling of the moment. It is not the system's semantic diagnosis and must never be mandatory.

Preferred quick causes, when retained in UI, may include:

- 没读懂;
- 没定位准;
- 选项没辨清;
- 看错 / 改错.

Chat remains responsible for deeper diagnosis when needed.

Question-level evidence is permitted because evidence granularity may be smaller than review granularity. It must not turn the learner–Chat interaction into question-by-question review.

---

## Submit behavior

### Stable clean result

If all questions are correct, all answered, and none are marked uncertain:

`score → compact success → next`

Do not open a full explanation panel or force a second pass.

### Review queue

A passage enters review by default when it contains at least one high-value signal:

1. wrong / unanswered question;
2. uncertain question even if correct;
3. later, a meaningful execution anomaly when the captured evidence is strong enough to justify it.

Stable correct questions remain compressed **inside the passage-level review packet**. They do not become separate review work.

---

## Review timing

Attempt and review are separate phases. Do not interleave repair into the middle of the intended attempt unit.

For a single-passage session:

`finish the whole passage → submit → review the passage`

For continuous training across multiple passages:

`finish the planned passage set → then review the passages that actually need review`

Continuous training is a deliberate **sealed mode**. Once enabled, each submitted passage may be recorded privately, but until the learner ends the continuous session the learner-facing surface should reveal only that the passage has been submitted. It must not reveal:

- passage score;
- which questions were wrong;
- formal answers;
- canonical evidence;
- option diagnosis;
- repair prompts.

The learner can continue directly to the next passage. Ending the continuous session unlocks review only for passages that actually contain wrong, unanswered, uncertain, or later well-supported execution-anomaly items. Clean passages do not need to become review work merely because they were part of the session.

For ordinary single-passage training, submission itself ends the clean attempt, so review may open immediately after the whole passage has been submitted.

---

## Frozen learner–Chat review unit

> **The minimum normal learner–Chat review unit is one complete Reading A passage and its full question set.**

A single question is never the normal Chat review entrypoint.

Question objects remain valid internal evidence and repair slices. After Chat has inspected the whole passage attempt, it may decide that the smallest sufficient repair is local to one question, one sentence, or one option contrast. That local repair does not change the review unit.

Chat should first ask, implicitly or explicitly:

```text
What happened across this passage?
→ are the problem questions independent?
→ do several share one representation/evidence failure?
→ is any wrong answer dependent on an earlier misunderstanding?
→ what is the smallest repair scope that explains the pattern?
```

Completion language belongs at the passage or training-session level. A single question may be **handled as an internal repair slice**, but not declared independently mastered merely because it was corrected.

---

## Passage-level review principle

The review target is the **first meaningful failure**, not the largest available explanation and not one explanation per wrong question.

Default review object:

`complete passage attempt + compact all-question outcome map + expanded wrong/uncertain evidence`

Stable correct questions remain visible only as compact evidence unless their content becomes necessary to establish a shared cause.

The learner should reconstruct before receiving passive explanation whenever possible.

A passage review should normally resolve into a small number of **repair threads** rather than one card/thread per problem question.

Example:

```text
Q2 wrong
Q4 wrong
Q5 uncertain
↓
Chat discovers Q2/Q4 share one paragraph-level stance misunderstanding
↓
1 Reading repair thread covers Q2 + Q4
Q5 is independently an option-boundary repair
↓
2 repair threads, not 3 separate weaknesses
```

---

## Internal repair actions

These are repair scopes selected **after passage-level diagnosis**. They are not separate Chat entrypoints.

### UNDERSTAND / SENTENCE

Use when the decisive failure is the language representation itself.

Surface:

`necessary sentence/span → learner reconstructs proposition`

Do not reopen the whole passage unless local context is insufficient.

### LOCATE

Use when the text was basically understood but the decisive evidence was not located correctly.

Surface:

`question → passage → re-identify minimal decisive evidence`

Do not reveal the decisive evidence before the learner gets a chance to relocate it.

### JUDGE

Use when the evidence is available but the options were adjudicated incorrectly.

Surface:

`minimal evidence + chosen option + correct option → state the decisive difference`

Do not expand all four options unless the other distractors are themselves diagnostically useful.

### LEXICAL

If a word, phrase, construction, contrast, or familiar-new sense caused the first failure, route the repair to its canonical LexicalOS owner when one exists. Do not create a duplicate Reading-specific word explanation.

### DISCOURSE

Use when sentence-level repair is insufficient and paragraph / discourse structure is the first meaningful failure.

Surface only the minimum structure needed to reconstruct the relation.

One discourse repair may explain several question-level errors. Those errors should be attached to the same primary repair thread rather than counted as separate weaknesses.

### EXECUTION

Use only when observable attempt evidence supports a behavior-level failure, such as an avoidable answer switch or time-management problem.

Show the smallest relevant trajectory/timing evidence and derive one behavior rule. Do not convert ordinary uncertainty into an execution diagnosis.

---

## Chat bridge｜Reading A passage packet v1

Chat owns semantic diagnosis.

The normal Astro action is **copy one complete Reading A passage attempt to Chat**. Do not make per-question `copy to Chat` the default bridge.

The packet should be self-contained enough for ordinary review and compact enough not to duplicate unnecessary material.

### Required packet structure

#### 1. Identity

- `Reading A review packet v1`;
- reading object ID;
- paper/year/section identity when available.

#### 2. Attempt summary

- score / total;
- duration;
- wrong / unanswered ordinals;
- uncertain ordinals;
- continuous-session marker when relevant.

#### 3. Passage

Include the passage once.

A learner-selected passage span may be included as supplemental evidence, but must not replace the passage-level context.

#### 4. All-question outcome map

For every question preserve compactly:

- ordinal / stable question ID;
- learner final answer;
- formal answer;
- result;
- uncertain yes/no;
- answer path when captured;
- optional learner quick cause when present.

#### 5. Expanded diagnostic questions

For wrong, unanswered, or uncertain questions, additionally include:

- prompt;
- options.

Stable correct questions do not need full prompt/options in the default clipboard packet.

### Expected Chat behavior

Chat should process the packet as:

`whole passage → identify meaningful problem questions → merge shared causes/dependencies → choose repair threads → route Lexical/Reading/task-specific failures → set only justified transfer claims`

The learner should not need to manually retell each wrong question.

Personal diagnosis is not written into shared Current by default. If repeated evidence justifies a durable shared learning asset or interaction improvement, update the relevant canonical owner in GitHub.

---

## Retry / second pass

There is no mandatory standalone “二刷” workflow.

A retry exists to verify a repair, not to make the learner re-do a page because the system has a second-pass feature.

Preferred sequence:

`attempt unit → submit / seal → finish intended training unit → passage-level review → smallest repair threads → passage / session review complete → later unseen transfer`

Quick cause logging is optional and should take one click if kept. It supplements, rather than replaces, semantic diagnosis.

---

## Future validation / transfer

Handling a known problem item is not mastery evidence.

After a high-value passage review, private runtime may keep small **WATCH / TRANSFER_PENDING** signals describing what should be observed later. Such signals are future observation targets, not permanent weakness labels and not automatic new review work.

Evidence strength should rise roughly as follows:

`known-item repair < later clean success < later matching success on genuinely fresh / unseen material`

Rules:

- do not claim transfer from re-answering the same known question;
- do not promote a one-off failure into a durable weakness;
- repeated high-confidence failures on distinct passages matter more than one event;
- a stable success on fresh material is stronger than a remembered success on a reused exam passage;
- automatic transfer matching must remain conservative; if the runtime cannot establish the same underlying weakness reliably, leave the signal pending and let later evidence or Chat resolve it.

---

## Content assets

Canonical exam source remains factual authority for passage, questions, options, and formal answers.

High-value learner assets may be added only when they have future retrieval value, for example:

- minimal decisive evidence;
- decisive proposition;
- chosen-vs-correct option contrast;
- necessary sentence/discourse focus;
- validated high-value repair note.

These assets may exist richly in the backend but are revealed progressively according to the current repair action.

Do not create one durable asset merely because one question was once wrong.

---

## Relationship to external reading

Reading A measures **exam fitness**.

Fresh TPO / IELTS / periodical material measures **language transfer under low memory residue**.

The two pools are complementary. Reused exam passages remain valuable for exam mechanics and failure repair, but their correctness rate must not be treated as equivalent to unseen mastery once memory residue is substantial.

---

## UI deletion rule

A Reading control or panel should not survive merely because it existed in Local or an earlier runtime.

Keep it only if it materially improves one of:

- clean attempt quality;
- evidence capture for diagnosis;
- speed of high-value repair;
- score reliability;
- unseen transfer testing.

Specific consequence of Objective Runtime v1:

- a per-question `copy to Chat` control should be removed or demoted from the normal flow;
- the normal Chat bridge should be one passage-level packet;
- internal Q navigation and local repair slices may remain when they reduce repair friction, but must not make the learner perform question-by-question Chat review.

Otherwise remove the control.
