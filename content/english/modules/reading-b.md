# Reading B / Part B Module Contract

## Role

Reading B / Part B is the English I objective-task trainer for **discourse reconstruction**.

Parent contracts:

- `content/english/LEARNING_CONTRACT.md`;
- `content/english/modules/objective-runtime.md`.

Its task surface may vary by exam format, but the stable cognitive object is:

`discourse skeleton → required role → candidate role → cohesion evidence → global reconciliation`

Reading B is not Reading A with a different question layout, and it is not a keyword-matching game.

---

## Attempt unit

> **One complete Part B material/set is the minimum learner-facing attempt and review unit.**

A placement / match / heading choice may be stored as an internal answer unit, but it is not an independent Chat review unit.

This rule is especially important because one early wrong placement may distort the remaining candidate relationships.

---

## Clean attempt surface

The learner should be able to maintain a whole-passage structural model while manipulating candidates.

Preferred interaction principles:

- keep the passage/material structure visible;
- keep the candidate inventory visible or one action away;
- make position/candidate assignment low-friction;
- allow easy revision before submission;
- capture uncertainty only when it costs almost nothing;
- keep timer/progress quiet;
- reveal no correctness until the complete set is submitted.

Before submission do **not** expose:

- formal placement/matching map;
- discourse-role labels;
- cohesion hints;
- keyword hints;
- teacher method;
- prior-attempt diagnosis.

Do not force the learner to annotate every paragraph with a formal discourse category. The needed model may remain coarse as long as it supports correct reconstruction.

---

## Private attempt evidence

Useful internal evidence may include:

- complete learner placement/matching map;
- answer trajectory / candidate swaps when available;
- uncertain positions;
- attempt duration;
- optional learner note after submission.

The final set map matters more than a collection of isolated per-position snapshots.

Do not require a manual error category for each placement.

---

## Submit behavior

Finish the complete set before revealing correctness.

### Stable clean result

If the complete map is correct and no position is uncertain:

`compact success → next`

Do not force a structural lecture or second pass.

### Set enters review when

- at least one position/match is wrong or unanswered;
- at least one position is uncertain even if ultimately correct;
- a later well-supported execution anomaly justifies review.

Stable correct placements remain compact evidence inside the full-set packet.

---

## Whole-set diagnosis first

Chat must diagnose the set before deciding how many repair objects exist.

Default sequence:

```text
whole passage/material
→ reconstruct rough discourse skeleton
→ inspect complete learner map
→ identify first meaningful structural/local failure
→ detect swaps, coupled errors, and cascades
→ choose local / coupled / structure-level repair
```

The system must not assume every wrong position is independent.

Example:

```text
Position 2 wrong
Position 4 wrong
↓
B and D were swapped because the learner reversed their discourse roles
↓
1 coupled repair, not 2 unrelated weaknesses
```

Another example:

```text
first transition into the “causes” section was misunderstood
↓
three later placements were forced into the wrong structure
↓
1 primary structure repair + dependent placements
```

---

## Repair scopes

### 1. Local repair

Use when one position is wrong but the global skeleton and other placements are stable.

Minimum repair object:

`before context + target position + after context + genuinely competing candidates + decisive fit`

### 2. Coupled repair

Use when two or more positions/candidates are interdependent, such as a swap or mutually exclusive role confusion.

Minimum repair object:

`relevant positions + competing candidates + role contrast + global consistency check`

Do not split a coupled error into artificial independent cards.

### 3. Structure-level repair

Use when the passage/discourse model itself is wrong and several downstream placements depend on it.

Minimum repair object:

`smallest sufficient discourse skeleton + key transition(s) + affected positions`

Do not review every downstream placement as a fresh root cause.

---

## Evidence hierarchy inside the task

Evidence can be tested in three directions:

### Backward fit

Does the candidate correctly attach to what comes before?

### Forward fit

Does it naturally set up what comes after?

### Global fit

Does the placement preserve the passage’s overall progression and leave the remaining candidate map coherent?

Cohesion evidence may include:

- pronoun/reference chains;
- connectives;
- lexical chains;
- repetition / synonymy;
- tense/topic continuity;
- examples and generalizations;
- cause/effect, problem/solution, claim/evidence, contrast, chronology, or other discourse relations.

These are evidence sources, not the task’s ultimate authority.

> **Discourse role and global coherence outrank superficial keyword overlap.**

---

## Root-cause routing

### Lexical

Route to LexicalOS when the first meaningful failure is an unknown or unstable sense, phrase, construction, contrast, or reference-triggering expression.

### Reading

Route to Reading when the learner failed to build the needed sentence/paragraph/discourse representation, including:

- sentence meaning;
- reference;
- paragraph function;
- logical relation;
- passage progression.

### Reading B-specific

Keep the repair in Reading B when the representation was available but the learner failed the reconstruction procedure, for example:

- over-weighted local keyword overlap;
- checked only backward fit and ignored forward/global fit;
- failed to reconcile the complete candidate map;
- treated placements independently when the candidate constraints were coupled.

---

## Chat bridge｜Reading B set packet v1

The normal Chat bridge is one complete Part B set.

Packet structure inherits Objective Review Packet v1 and specializes it as follows:

- include the complete passage/material needed to reconstruct the task;
- include the complete candidate inventory;
- include the learner's full placement/matching map;
- include the formal map;
- include uncertainty and trajectory/candidate swaps when captured;
- preserve a compact outcome record for all positions;
- expand local context only after whole-set diagnosis identifies the useful repair scope.

Expected Chat behavior:

`whole set → discourse skeleton → compare learner/formal maps → identify primary/coupled/dependent errors → choose repair scope → route Lexical/Reading/Reading-B-specific failures → create only justified transfer claims`

Do not produce one Chat packet per placement.

---

## Memory admission

A wrong historical ordering is not a durable memory object.

Admit future review only when evidence reveals:

- a reusable lexical object;
- a recurring Reading/discourse representation failure;
- a repeated Reading B procedure failure that remains weak across distinct material.

Dependent placements do not independently earn memory admission.

---

## Transfer / closure

Evidence strength follows:

`known set explanation < repaired known-set reconstruction < targeted new structure contrast < later fresh Part B success < repeated independent unseen discourse transfer`

Rules:

- memorizing one correct ordering is weak evidence;
- rebuilding the same passage after seeing the answer is repair, not mastery;
- later fresh success with the same structural demand is stronger;
- a procedure claim may move from `TRANSFER_PENDING` to `CLOSED` only when later evidence is sufficient.

---

## UI non-isomorphism

Do not clone Reading A’s one-current-question layout.

Reading B needs to preserve **simultaneous awareness of passage structure, open positions, and the candidate inventory**. A UI that hides the rest of the set while showing one placement at a time can destroy the very global constraints the task is meant to train.

The exact surface may vary with the exam format, but it must preserve:

- whole-structure visibility;
- candidate competition;
- easy reassignment;
- global reconciliation before submission.

Shared visual components are allowed only when they do not weaken those actions.
