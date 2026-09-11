# English Learning Contract

## Goal

- English I target: **80–85+**.
- Objective-section training target: **60/60**.
- The system is optimized for score reliability under real exam conditions, not for maximizing explanation volume, taxonomy coverage, course completion, or source-material consumption.

## Governing principle

> **Ask how the ability is formed first; reorganize materials second.**

The English system must not inherit its structure from the shape of the available materials.

Having a vocabulary book does not imply “finish the vocabulary book” is a learning path. Having exam papers does not imply “keep doing papers” is a learning path. Having a translation course or writing book does not imply the teacher’s chapter order is the learner’s cognitive order.

Materials are inputs and repair reservoirs. **Ability formation is the organizing authority.**

For every major English capability, design in this order:

1. define the capability;
2. define the effective learning process;
3. define what counts as evidence that it has been learned;
4. define which failures deserve future review / memory admission;
5. reorganize existing knowledge and materials around that process;
6. design the UI last.

Do not design a page first and then invent a learning rationale for it.

## Product principle

`Content → Display → Interaction`

Shared Current stores durable source truth and learning semantics. Astro turns those semantics into low-friction learner actions. Chat owns semantic and learning judgments and may update both content and interaction design from real learner feedback.

Private answers, progress, wrong/uncertain marks, comments, timing, first drafts, answer trajectories, revisions, and session history are interaction evidence. They are not shared semantic owners and must not be written into shared Current content by default.

## English capability architecture

The system is not primarily a collection of exam question-type pages.

It has **four major capability lines** plus **task-specific trainers**.

### 1｜Lexical

Core question:

> **Can the needed language unit be accessed rapidly and correctly in context?**

Lexical has its own complete learning loop, but it also supplies language access to Reading, Translation, Writing, Cloze, Part B, and other tasks.

LexicalOS is the canonical owner for lexical knowledge.

Reading / Translation / Writing must not create duplicate local word systems when the underlying failure is a lexical sense, phrase, construction, contrast, or confusable that belongs in LexicalOS.

### 2｜Reading

Core question:

> **Can input be turned into an accurate representation that supports a correct judgment?**

For Reading A, the operational path is:

`understand → locate decisive evidence → adjudicate options → execute`

Reading evidence is primarily about the relationship between text understanding, evidence location, option discrimination, and exam execution.

### 3｜Translation

Core question:

> **Can an understood English representation be reconstructed into Chinese without losing meaning or relations, while remaining natural enough to read?**

Translation is not simply “Reading plus Chinese.” It has a distinct output-reconstruction layer and therefore needs its own evidence, repair actions, and UI.

The first translation must be preserved because the final polished version alone cannot reveal where the original process broke.

### 4｜Writing

Core question:

> **Can the learner actively generate acceptable English from task constraints under exam conditions?**

Writing is not reverse Translation. It starts from task requirements and active generation rather than an existing English input.

Useful evidence may include:

`prompt → first content response → first structure → first language realization → revision trajectory`

A polished final essay alone is insufficient diagnostic evidence.

## Task-specific trainers

Some exam tasks deserve their own training surfaces because they impose a special decision problem, even though they draw on the four major capability lines.

### Cloze

Primary cognitive object:

> **best-fit decision under local slot constraints**

Operational path:

`slot demand → lexical / syntactic / discourse constraints → candidate best fit`

It is not merely “small Reading” and not merely a vocabulary quiz.

### Part B

Primary cognitive object:

> **recovering discourse structure and cohesion relationships**

Operational path:

`discourse structure → missing / required role → cohesion constraints → candidate fit`

It is not Reading A with a different question format.

Other task-specific trainers may exist later if an exam task has a genuinely distinct cognitive object. Do not create one only because the exam has a separate section heading.

## Shared learning philosophy

All capability lines and task trainers follow the same high-level loop:

`Clean Attempt → expose real ability → locate first meaningful failure → smallest sufficient repair → re-execute → later new-material validation`

This shared philosophy does **not** imply shared error categories, shared review cards, or shared page structure.

The evidence must follow the cognitive object of the module.

### Reading evidence may include

- what was understood;
- where decisive evidence was located;
- which options competed;
- answer trajectory / uncertainty;
- execution anomalies.

### Translation evidence may include

- the learner’s first translation;
- whether the English representation was established;
- whether logical / modification / reference relations were preserved;
- whether information was omitted, added, or distorted;
- whether Chinese reconstruction was faithful but unnatural, or both wrong and unnatural;
- the retranslation after repair.

### Writing evidence may include

- the prompt;
- first content response;
- first structure;
- first-draft language;
- revision trajectory;
- time / execution evidence when useful.

Do not force these into one generic “wrong reason” taxonomy.

## First meaningful failure

Repair should begin at the earliest layer that is sufficient to explain the observed performance.

Examples:

- Reading: if the sentence itself was misunderstood, do not start with option analysis.
- Translation: if the English proposition was wrong, do not start by polishing Chinese.
- Writing: if there was no usable content, do not start by replacing individual sentence expressions.

Expansion stops when the first meaningful failure is repaired well enough for the learner to perform the next action.

Do not turn one local failure into a full course unless repeated evidence justifies it.

## Evidence and mastery

`correct once ≠ mastery`

Evidence strength should generally rise with lower memory residue and more independent transfer.

A useful cross-module ordering is:

`known-item correction < later clean success < later success on a fresh task with the same underlying demand`

Module-specific examples:

- Lexical: isolated recall is weaker than successful access inside later unseen context.
- Reading: re-answering a remembered passage is weaker than correct reasoning on fresh material.
- Translation: producing a corrected version after seeing the repair is weaker than independently handling the same relation in a new sentence.
- Writing: fixing one sentence after feedback is weaker than generating the same structure correctly in a later new task.

Do not permanently label a weakness from one event.

## Memory admission / future review

Not every observed problem deserves future review.

Admit a failure into future review only when at least one of the following is true:

- it reveals a reusable language unit or construction;
- it exposes a recurring representation / reasoning failure;
- it causes repeated score loss across distinct material;
- it is high-cost and likely to recur;
- later transfer evidence remains weak or contradictory.

Do not create future work merely because the learner once hesitated.

### Lexical admission

Durable lexical knowledge belongs in LexicalOS.

### Reading admission

Prefer a small reusable future observation target over a permanent “weakness label.” For objective-task procedures, the tracked object is a justified repair thread / transfer claim under `modules/objective-evidence-runtime.md`, not a per-question WATCH signal. Reading-comprehension knowledge remains with the Reading ability owner.

### Translation admission

Future review should target reusable demands such as recurring scope, attachment, reference, or reconstruction failures—not the memorized Chinese wording of one old sentence.

### Writing admission

Future review may target reusable generation problems such as content scarcity, unstable structure, slow lexical retrieval, recurring grammar errors, or time-collapse patterns.

## Progressive disclosure

Backend content may be rich; the learner surface should remain precise.

Before a clean attempt, do not leak answers, evidence, canonical analysis, teacher methods, model translations, or model essays.

After the attempt:

- stable correct / strong work should pass quickly;
- wrong, uncertain, fragile, or diagnostically valuable work may expand;
- expose only the information required for the next useful cognitive action;
- prefer reconstruction and re-execution over passive explanation.

## Module-specific cognitive objects

### Reading A

Primary path:

`understand → locate evidence → adjudicate options → execute`

User-facing review object: **one complete passage and its full question set**.

Internal repair slice, selected only after whole-passage diagnosis:

`question + minimal decisive evidence + chosen/correct contrast`

Question type may describe an item, but it is not assumed to explain the failure. Shared root causes should absorb dependent errors when supported; genuinely independent failures must not be forced into one cause.

### Translation

Primary path:

`local context → English representation → relation preservation → Chinese reconstruction → self-check`

Preserve the learner’s first translation.

A useful diagnostic sequence is:

`English representation established?`
→ `relations preserved?`
→ `information omitted / added / distorted?`
→ `Chinese reconstruction natural and faithful?`

Do not inherit Reading A’s review UI or error categories.

### Writing

Primary path:

`task constraints → content generation → structure → English realization → error control → timed execution`

Preserve the first meaningful planning and drafting evidence.

Do not default to replacing the learner’s work with a model essay.

Repair the highest-value failed layer, then require re-generation.

### Cloze

Primary path:

`slot demand → lexical / syntactic / discourse constraints → candidate best fit`

User-facing review object: **one complete Cloze passage/set**.

Internal repair slice, selected only after whole-set diagnosis:

`local context + decisive constraints + high-value candidate contrast`

### Part B

Primary path:

`discourse structure → missing / required role → cohesion constraints → candidate fit`

User-facing review object: **one complete Part B material/set**, preserving its actual directions, task form, candidate inventory, and any fixed givens.

Internal repair slices depend on the source form. Gap matching and ordering may require before/after context, discourse roles, and a coupled placement map. Heading matching requires paragraph central claim and heading scope. Comment–statement matching requires speaker attribution, stance, and qualification. These are task-specific applications of the shared model, not permission to turn every form into a gap-filling UI.

## Vocabulary / LexicalOS

LexicalOS is both a major capability line and the shared lexical supply layer for other modules.

- Simple words remain L0-first.
- Preserve true polysemy, familiar-new senses, high-value phrases/constructions, contrasts, and confusables.
- Reading / Cloze / Part B / Translation / Writing lexical failures should route back to the canonical lexical object rather than create duplicate module-specific explanations.
- The practical target is fast, correct access in real context, not dictionary-style sense accumulation.
- A word does not enter long-term active review simply because it exists in the source inventory. Future review must earn its cost through evidence.

## Teacher and method material

Teacher material is a **repair reservoir**, not the default curriculum.

- Start from real learner performance where possible.
- Call teacher methods only when observed evidence shows a stable need.
- Validated personal methods should stay few, compact, and behaviorally useful.
- Reorganize teacher material around ability formation rather than preserving the teacher’s chapter order by default.
- Do not let technique labels replace direct evidence from the text or task.

## External / fresh material

Fresh material exists mainly to provide low-memory-residue input and transfer testing.

- TPO, IELTS, high-quality periodicals, synthetic training items, and other suitable texts may be added incrementally.
- Freshness and diagnostic value matter more than completing a fixed corpus.
- Treat genuinely unseen material as limited diagnostic capital. Do not expose holdout content before its first clean attempt.
- Once exposed, material can move into ordinary practice/review use.
- Use synthetic or already-exposed items when the goal is to teach a framework and there is no reason to consume a valuable unseen item.

## UI non-isomorphism rule

The four major capability lines must **not** become four copies of the same interface with different labels.

A shared visual shell is acceptable. The learning interaction must follow the capability.

Examples:

- Reading may center passage + question + evidence relocation.
- Translation should center original text + preserved first translation + layer-specific reconstruction.
- Writing should preserve planning / first draft / revision trajectory.
- Lexical should optimize fast retrieval, sense discrimination, construction access, and later contextual validation.

Do not share a component merely because it is technically convenient if doing so weakens the learning action.

## Interaction quality bar

Any new button, label, panel, field, persistent state, or review step must answer at least one of these questions:

1. Does it improve score reliability?
2. Does it reduce friction in a high-value learning action?
3. Does it preserve evidence needed for better diagnosis?
4. Does it enable a more precise repair or transfer test?
5. Does it help distinguish where the ability formation process actually failed?

If not, remove or avoid it.

The system should become **richer in backend learning value and smaller in learner-facing noise**.

## Complete-but-skippable learning and acceptance boundary

Static first-learning assets remain substantive even for proficient learners. Skipping changes navigation only: self-report, a skim, an explanation, a synthetic demonstration, or a passing software test must not create learner mastery or close a real transfer claim. Do not record a calibration PASS merely because the learner says the introductory framework is familiar.

Engineering continuation is not private learner progress. The next learner action must follow actual learning evidence and the learner's intent, not whichever test the repository can execute. During an authorized engineering/content acceptance task, do not require the learner to consume a fresh exam merely to compensate for missing software validation.

Root `LEARNING_ACCEPTANCE.md` governs S/K/L/P/R/E/U and readiness language. Evaluate Reading A, Cloze, and Reading B individually; a shared runtime or learning page does not grant their gates automatically. Simulated clean, repair, return, and transfer journeys may support S–E within the tested scope. U requires actual learner use and cannot be supplied by screenshots, build success, or synthetic QA. Module acceptance is separate from final Home/global integration.
