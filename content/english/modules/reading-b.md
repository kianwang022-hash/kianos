# Reading B / Part B Module Contract

## Role

Reading B / Part B is the English I objective-task trainer for **discourse reconstruction**.

Parent contracts:

- `content/english/LEARNING_CONTRACT.md`;
- `content/english/modules/objective-runtime.md`.

Its task surface varies by exam form, but the stable cognitive object is:

`discourse skeleton → required role → candidate role → cohesion evidence → global reconciliation`

Part B is not Reading A with a different layout and not a keyword-matching game.

---

## Attempt unit

> **One complete Part B material/set is the clean-attempt unit.**

A placement / match / heading choice is an internal answer/evidence unit.

Whole-set continuity matters because one early placement can change the remaining candidate constraints. This does not mean every imperfect set requires a full Chat review.

---

## Clean attempt surface

The learner should maintain a whole-material structural model while manipulating candidates.

Preferred interaction principles:

- keep passage/material structure visible;
- keep candidate inventory visible or one action away;
- make assignment and reassignment low-friction;
- allow revision before submission;
- capture uncertainty only when cheap;
- keep timer/progress quiet;
- reveal no correctness until the complete set is submitted.

Before submission do not expose formal map, discourse-role labels, cohesion hints, keyword hints, teacher method, or prior diagnosis.

Do not force formal paragraph taxonomy. A coarse model is sufficient if it supports correct reconstruction.

---

## Private attempt evidence

Useful internal evidence may include:

- complete learner placement/matching map;
- candidate swaps / trajectory when available;
- uncertain positions;
- attempt duration;
- optional learner note after submission.

The final set map matters more than isolated per-position snapshots.

Do not require a manual error category for every placement.

---

## Submit and triage

Finish the complete set before revealing correctness.

### Stable clean result

If the complete map is correct and no uncertainty is meaningful:

`compact success → next`

No structural lecture and no second pass.

### Problem signals

Wrong / unanswered and meaningful uncertainty trigger **fast triage**.

Fast triage asks:

- can the learner now see the decisive role / cohesion / global-fit difference cheaply? → quick-resolved;
- is the root problem lexical? → LexicalOS;
- is sentence/paragraph/discourse representation unstable? → shared English Representation repair;
- is there a coupled/structural or recurring Part-B procedure problem? → optional deep review.

A correct-but-uncertain placement does not automatically require a full-set Chat session.

---

## Optional whole-set diagnosis

When deep review is justified, Chat should see the whole set before choosing repair scope.

Default sequence:

```text
whole material
→ rough discourse skeleton
→ complete learner map
→ first meaningful structural/local failure(s)
→ detect swaps, coupled errors, cascades
→ choose the smallest independent repair set
```

Do not assume every wrong position is independent.

Example:

```text
P2 wrong + P4 wrong
→ B/D were swapped because their discourse roles were reversed
→ 1 coupled repair
```

Another example:

```text
first transition into a new section was misunderstood
→ several later placements cascade
→ 1 structure repair + dependent positions
```

But if two mistakes are genuinely independent and score-relevant, preserve two repairs rather than forcing false singularity.

---

## Repair scopes

### Local

One position is wrong while the global skeleton is stable.

`before context + target + after context + real competing candidates + decisive fit`

### Coupled

Two or more positions/candidates are interdependent.

`relevant positions + competing candidates + role contrast + global consistency check`

### Structure-level

The discourse model itself is wrong and several placements depend on it.

`smallest sufficient discourse skeleton + key transitions + affected positions`

Dependent placements do not become fresh root causes.

---

## Evidence hierarchy inside the task

### Backward fit

Does the candidate correctly attach to what comes before?

### Forward fit

Does it naturally set up what comes after?

### Global fit

Does the placement preserve overall progression and leave the remaining map coherent?

Evidence may include:

- pronoun/reference chains;
- connectives;
- lexical chains;
- repetition / synonymy;
- tense/topic continuity;
- examples/generalizations;
- cause/effect, problem/solution, claim/evidence, contrast, chronology, and other discourse relations.

These are evidence sources, not independent mandatory annotations.

> **Discourse role and global coherence outrank superficial keyword overlap.**

---

## Root-cause routing

### LexicalOS

Route unknown/unstable sense, phrase, word-local construction, collocation, confusable, or lexical trigger.

### Shared English Representation

Route sentence meaning, reference, paragraph function, logical relation, or passage progression when the representation itself failed.

Current runtime code may still call this route `reading`; treat it as a compatibility alias.

### Part-B-specific

Keep repair here when the representation was available but the reconstruction procedure failed, for example:

- over-weighted local keyword overlap;
- checked only backward fit;
- failed global reconciliation;
- treated coupled placements as independent.

---

## Chat bridge

Chat is an escalation tool, not the default consequence of every problem.

When needed, one deep-review packet may include:

- full task directions / task form;
- full passage/material;
- candidate inventory;
- learner full map + formal map;
- uncertainty / swaps when useful;
- compact all-position outcomes.

Expected Chat behavior:

`whole set → skeleton → compare maps → primary/coupled/dependent errors → smallest repair set → route LexicalOS / Representation / Part-B-specific failures → optional backend transfer state`

Do not create one packet per placement.

---

## Memory / future review admission

A wrong historical ordering is not a durable memory object.

Admit future work only for:

- reusable lexical knowledge;
- recurring Representation failure;
- repeated high-value Part-B procedure failure that remains unstable on distinct material.

Dependent placements do not independently earn review debt.

A one-off quickly understood set may close with no durable object.

---

## Transfer / closure

Evidence strength generally rises:

`known-set explanation < repaired known-set reconstruction < targeted new contrast < later fresh Part-B success < repeated unseen discourse transfer`

Rules:

- memorizing one ordering is weak evidence;
- same-set reconstruction is repair, not mastery;
- later fresh success is stronger;
- pending procedure state is backend observation only and must not force a clean future set into Chat.

---

## UI non-isomorphism

Do not clone Reading A's one-current-question layout.

Part B must preserve **simultaneous awareness of material structure, open positions, and candidate inventory**.

Exact layout may vary by task form, but preserve:

- whole-structure visibility;
- candidate competition;
- easy reassignment;
- global reconciliation before submission.

Shared visual components are allowed only when they do not weaken those actions.