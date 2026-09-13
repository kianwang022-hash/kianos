# English Learning Contract

Role: highest learner-facing learning logic for the **English** domain.

LexicalOS is a separate top-level domain. English may consume and return lexical evidence, but it does not own LexicalOS and must not count Vocabulary as one of its internal capability lanes.

## 0. Exam objective and optimization target

English I target: **80–85+**.

Paper-level score architecture:

- Reading family: **60 points** — Cloze 10 + Reading A 40 + Part B 10;
- Translation: **10 points**;
- Writing: **30 points**.

Objective-section training target remains **60/60**. This is a training ceiling, not permission to spend unlimited time pursuing cosmetic perfection.

The learner-facing optimization target is:

```text
expected exam points gained or protected
+ expected reduction in execution variance / latency
----------------------------------------------------
learner time
+ future review debt
+ fresh-material opportunity cost
+ switching / interaction friction
```

English therefore optimizes **future exam performance on new material**, not explanation volume, taxonomy coverage, course completion, source consumption, review completion, or the number of preserved evidence objects.

An action earns learner-facing time only when it is expected to improve at least one of:

1. answer / output accuracy;
2. retrieval, reading, judgment, translation, or generation speed;
3. reliability under uncertainty, fatigue, or time pressure;
4. transfer to later unseen material;
5. diagnosis or repair efficiency for a meaningful recurring failure.

If a page, review step, claim, stored state, or interaction cannot plausibly improve one of these enough to justify its cost, it must be removed, collapsed, made optional, or kept backend-only.

### Fresh material is scarce capital

Unseen true-exam, TPO, IELTS, and other intentionally held-out material has opportunity cost. Do not consume a fresh item merely to prove that a framework, repair, or feature works when synthetic or already-exposed material is sufficient.

### Hard stop / anti-overengineering

For learner value:

```text
real performance practice
> high-value repair
> reusable learning asset
> additional evidence machinery
> UI / taxonomy polish
```

A more complete cognitive model is not automatically a better learning system.

## 1. Governing principle

> **Performance formation first; materials, diagnosis, and UI serve it.**

Ask how the ability is formed and how it produces exam points before reorganizing materials.

Having exam papers does not imply “keep doing papers” is a learning path. Having a translation course or writing book does not imply the teacher’s chapter order is the learner’s cognitive order. Having a rich diagnostic taxonomy does not imply the learner should interact with every diagnostic layer.

Materials are inputs, calibration sets, repair reservoirs, and transfer tests. **Future performance is the organizing authority.**

For every English capability, design in this order:

1. define the exam performance to be produced;
2. define the fastest reliable way to expose current performance;
3. define what evidence is actually needed to decide the next action;
4. define the smallest repair that could change future performance;
5. define when deeper learning / future validation is worth its cost;
6. design the learner interaction last.

Do not design a page first and then invent a learning rationale for it.

## 2. Domain boundary: English and LexicalOS are two top-level systems

English has **three primary scoring capability lanes**:

1. **Reading family** — Reading A as the main reading-performance task, with Cloze and Part B as distinct trainers inside the same input/judgment family;
2. **Translation** — English representation → relation preservation → Chinese reconstruction;
3. **Writing** — task constraints → content / structure → English generation → timed delivery.

LexicalOS is an **independent top-level system** whose job is fast, correct contextual lexical access. It supplies Reading, Translation, Writing, Cloze, and Part B, and receives precise lexical failures back from them.

Boundary rule:

```text
English owns task performance evidence.
LexicalOS owns lexical semantics and lexical repair.
```

If a Reading / Cloze / Part B / Translation / Writing failure is fundamentally a lexical sense, phrase, construction, or confusable problem, route the smallest lexical target to LexicalOS and then return to the English task. Do not build duplicate local vocabulary systems.

## 3. Phase responsibilities

English is not one perpetual workflow. Different phases optimize different score problems.

### Phase A — Calibration / targeted first learning

Purpose: establish only the frameworks the learner does not already execute reliably.

- use synthetic or exposed material freely;
- use diagnostic clean attempts to decide which learning asset is needed;
- first-learning pages are rescue / calibration assets, not a curriculum checklist;
- skip stable material without manufacturing a mastery claim.

### Phase B — Performance building

Purpose: make correct execution on new material the mainline.

- clean task attempts dominate learner time;
- capture score, timing, uncertainty, first draft / answer trajectory only when useful;
- stable performance exits quickly;
- isolated errors receive fast triage, not automatic deep review.

### Phase C — Consolidation / recurring-failure repair

Purpose: spend extra time only where repeated or high-cost evidence justifies it.

- cluster recurring failures across different material;
- call teacher methods / learning assets only for the observed layer;
- admit only reusable, recurring, expensive, or still-unstable failures into future review;
- let strong later real-context success cancel weaker artificial review debt.

### Phase D — Exam execution / mock phase

Purpose: convert component ability into paper-level score under 180-minute conditions.

- full-paper pacing, task order, switching, fatigue, and time allocation become first-class evidence;
- a method that is elegant in isolated practice but too slow in a paper must be compressed or abandoned;
- final review favors compact execution rules and recurring high-cost failures, not reopening the whole learning system.

## 4. Default learner loop: performance first, review conditional

The default loop is:

```text
Perform cleanly
→ Fast triage
→ EXIT / smallest repair / LexicalOS handoff
→ continue performance
→ later fresh validation only when a justified claim exists
```

This replaces any interpretation that every task must complete a full ritual of diagnosis → repair → re-execution → transfer validation.

### Fast triage outcomes

**A. Stable / clean**

Leave immediately. Do not create review debt because the system has review features.

**B. Isolated, quickly understood error**

Expose the decisive evidence / contrast / correction needed to understand the miss. If the learner can now explain the decision and no recurring pattern is supported, move on. Do not require taxonomy completion, a permanent claim, or a later fresh test.

**C. Meaningful or recurring failure**

Locate the first meaningful failure, apply the smallest sufficient repair, then re-execute only the affected behavior when that adds useful evidence.

**D. Lexical failure**

Route the exact lexical object to LexicalOS, repair it there, and return to the task. The English task keeps the performance evidence; LexicalOS keeps the lexical repair state.

**E. Execution / timing failure**

Create a compact behavioral rule or pacing adjustment and validate it in later performance. Do not pretend an execution problem is a knowledge gap.

### Review budget rule

Review is a means, not a completion target.

- A one-off wrong answer should normally require much less time than the original task.
- Deep review is justified when a failure is ambiguous, recurring, high-value, high-cost, or likely to generalize.
- Backend diagnosis may be rich; learner interaction should expose only the next useful decision.
- “Mark reviewed”, taxonomy selection, evidence reveal, repair check, or transfer claim are never goals in themselves.

## 5. Evidence hierarchy and stopping rules

`correct once ≠ mastery`, but “not mastery” does not mean “must schedule another test.”

Evidence strength generally rises as memory residue falls and independent transfer rises:

```text
same-item correction
< later clean success
< later success on a fresh task with the same underlying demand
< stable performance across multiple fresh contexts under time pressure
```

Use this hierarchy to make decisions, not to manufacture an evidence ladder every time.

A repair creates a future transfer target only when the target is:

- reusable across material;
- recurring or supported by more than one weak event;
- high-cost / high-score-risk;
- still uncertain after repair;
- important enough that future confirmation could change study allocation.

Fresh validation should occur opportunistically when later real work genuinely tests that target. Do not hunt for a new item merely to close a database state unless the expected score value justifies consuming that material and time.

## 6. First meaningful failure

Repair begins at the earliest layer sufficient to explain the observed performance.

Examples:

- Reading: if the sentence was misunderstood, do not start with option taxonomy;
- Translation: if the English proposition / relation was wrong, do not start by polishing Chinese;
- Writing: if usable content / task fulfillment failed, do not start with sentence decoration;
- Cloze: if the slot demand was misread, do not build a vocabulary lecture around the chosen distractor;
- Part B: if the discourse role was wrong, do not analyze every candidate independently.

Expansion stops when the learner can perform the next relevant action. Repeated cross-material evidence, not system completeness, is what earns a deeper intervention.

## 7. Capability-specific logic

### Reading family

Reading A operational path:

```text
understand → locate decisive evidence → adjudicate options → execute
```

Cloze cognitive object:

```text
slot demand → lexical / syntactic / discourse constraints → candidate best fit
```

Part B cognitive object:

```text
discourse structure → required role → cohesion constraints → candidate fit
```

User-facing review unit remains a complete passage / set because local errors depend on global context. Internal diagnosis may use a smaller slice.

**Interaction rule:** after a wrong / uncertain item, the default repair surface should first make the decisive evidence and the real competing choice understandable. A learner who understands the miss may leave. Cause taxonomy, span capture, canonical diagnosis, detailed coach steps, or transfer claims are optional escalation tools, not mandatory closure steps.

Continuous practice may defer detailed review until the batch ends. Do not interrupt every passage merely because it contains one problem.

### Translation

Primary path:

```text
local context → English representation → relation preservation → Chinese reconstruction → self-check
```

Preserve the learner’s first translation because it contains useful process evidence.

Default behavior:

- complete a clean translation;
- if stable and the learner is already calibrated, PASS is a real exit;
- if uncertain or diagnostically valuable, use Chat / reference selectively;
- repair only the affected relation / segment / reconstruction;
- a same-sentence corrected translation proves repair efficacy, not transfer mastery.

Early calibration may justify frequent Chat review. Later phases should not require a full Chat review of every stable set if periodic calibration and real performance show that self-triage is reliable.

Reference translations are post-attempt comparison tools, not answers to imitate and not mandatory viewing.

### Writing

Primary path:

```text
task constraints → content → structure → English realization → control → timed delivery
```

Preserve first meaningful planning and first draft evidence. Direct mode is valid when planning is already automatic; do not force a planning ritual.

Writing feedback has high potential value because self-scoring is noisy and Writing is 30 points. Therefore Chat review may be frequent in calibration / skill-building phases, but the contract does **not** require every future essay to execute every internal state transition.

- PASS / acceptable is a real exit;
- repair only the highest-value failed layer;
- re-generation should target the affected scope;
- a second Chat “repair check” is justified when it can change the learner’s next action, not merely because the state machine has that node;
- reusable recurring failures may become future targets;
- later timed complete essays are stronger evidence than polishing one remembered prompt.

### Lexical handoff

English must display LexicalOS as an external supply / repair lane, not as “English capability 01”. A lexical failure should be small enough to repair quickly and return to the originating task.

## 8. Memory admission / future review

Not every problem deserves future attention.

Admit a failure only when at least one is true:

- reusable language / procedure is involved;
- failure recurs across distinct material;
- repeated score loss is observed;
- failure is expensive or likely to recur;
- later real-context evidence remains weak or contradictory.

Prefer a compact observation target over a permanent weakness label.

Stable later unseen-context success may retire weaker planned artificial review. A new real failure may reactivate the smallest affected target.

## 9. Teacher / learning material

Teacher methods and first-learning assets are a **repair reservoir**.

- Start from real performance where possible.
- Pull only the method that addresses the observed failure.
- Keep validated personal rules few, compact, and executable.
- Do not preserve a teacher’s chapter order as the learner path by default.
- Do not turn method labels into substitutes for text / task evidence.

## 10. Progressive disclosure and interaction quality

Before a clean attempt, protect answer and diagnostic capital.

After the attempt:

- stable work should collapse;
- problems may expand only as far as needed for the next action;
- reconstruction / re-execution outranks passive explanation when it adds useful evidence;
- internal S/K/L/P/R/E status, hashes, claim IDs, taxonomy codes, and ledger state remain backend unless they alter the learner’s next decision.

A learner-facing element earns its place only if it materially improves score reliability, speed, transfer, repair efficiency, or the quality of the next decision.

### Resume rule

“Resume” must mean **highest-value unfinished learner action**, not merely “most recently opened page”.

Priority should normally be:

1. unfinished clean attempt;
2. unresolved meaningful repair that is already active;
3. high-value scheduled / naturally encountered validation;
4. otherwise a new high-value clean task.

Passed work must not drag the learner backward just because it was the most recent page.

### No dashboard theater

The learner should not maintain backend evidence taxonomy manually. Evidence collection should be automatic where possible, and visible state should be plain next-action language.

## 11. UI non-isomorphism

The three English capability lanes must not become copies of one generic interface.

- Reading: passage / set + decision evidence;
- Translation: source + first translation + affected reconstruction;
- Writing: prompt + first generation + targeted re-generation.

LexicalOS keeps its own independent runtime.

Shared chrome is acceptable; shared learner interaction is not required.

## 12. Complete-but-skippable learning and acceptance boundary

Static first-learning assets remain substantive, but they are not a course-completion obligation. Skipping changes navigation only; it does not create a false mastery claim.

A proficient learner may enter through calibration / clean performance and call the learning asset only when evidence justifies it.

Engineering continuation is not private learner progress. Software QA may validate runtime semantics without consuming fresh learner material. U requires actual learner use.

Root `LEARNING_ACCEPTANCE.md` governs S/K/L/P/R/E/U and readiness language. Reading A, Cloze, Part B, Translation, and Writing must be judged on their own cognitive objects. A shared runtime or green build does not grant learner mastery.