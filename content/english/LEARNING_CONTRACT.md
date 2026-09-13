# English Learning Contract

Role: highest learner-facing learning logic for the **English** domain.

LexicalOS is a separate top-level domain. English may consume and return lexical evidence, but it does not own LexicalOS.

## 0. Exam objective

English I target: **80–85+**.

Score channels:

```text
Objective tasks = 60
  Cloze = 10
  Reading A = 40
  Part B = 10

Translation = 10
Writing = 30
```

The optimization target is:

```text
expected exam points gained / protected
+ reduced execution variance / latency
-------------------------------------
learner time
+ future review debt
+ fresh-material opportunity cost
+ switching / interaction friction
```

English therefore optimizes **future performance on new material**, not explanation volume, framework completion, review completion, or the number of stored evidence objects.

## 1. Knowledge truth versus learner burden

Two rules are both hard constraints:

```text
Minimize learner burden, not knowledge truth.
Projection may be selective; canonical knowledge may not silently become lossy.
```

A learner-facing path may omit, defer, collapse, or hide valid content when it is low-value for the current action. The underlying valid semantics must remain owned somewhere explicit: current task owner, LexicalOS, shared English logic, backend-only reference, repair-only content, or later-phase content.

Deleting a page or interaction is not semantic deletion.

## 2. English architecture: score channels are not automatically semantic parents

English has three learner-facing score channels:

1. **Objective 60** — Cloze / Reading A / Part B;
2. **Translation 10**;
3. **Writing 30**.

`Objective` is a scoring/runtime family. It owns the thin shared decision kernel and shared attempt/evidence mechanics; it does **not** own every child task's knowledge.

Cloze, Reading A, and Part B remain distinct task owners because their decision objects differ.

Do not force a semantic parent merely because three tasks share a page family or score channel.

### Objective shared decision kernel

```text
represent the relevant input
→ identify the current demand
→ form the real candidate space
→ test candidates against decisive evidence / constraints
→ adjudicate
→ execute and leave
```

Task specialization:

- Cloze: slot demand + lexical / syntactic / discourse constraints → best fit;
- Reading A: question demand + decisive passage evidence + option propositions → adjudication;
- Part B: discourse skeleton + required role + candidate role + global reconciliation.

The kernel is a composition aid, not a compulsory learner checklist.

## 3. Shared English Representation primitive

English has one genuine cross-task primitive that must not disappear merely because there is no separate learner course:

> **Representation = recover the proposition / relation structure needed for the current task.**

Its reusable sub-primitives include, when relevant:

- clause / proposition hierarchy;
- attachment;
- reference;
- negation / quantifier / modality / degree scope;
- logical relation;
- paragraph / discourse relation and progression.

This contract owns the **shared semantic role and boundary** of Representation. Task owners own their task-specific use and examples.

Representation is not a new top-level learner lane and does not require a permanent page. It becomes visible only when a real task failure shows that the input model is unstable.

Current runtime route labels that say `reading` may be treated as an implementation alias for shared Representation repair until runtime naming is reconciled; they must not imply a mandatory second Reading course.

Lexical sense / phrase / word-local construction / collocation / confusable failures remain owned by LexicalOS.

## 4. Phase responsibilities

### A. Calibration / targeted first learning

Use synthetic or already-exposed material to discover which frameworks are actually needed.

First-learning assets are **complete-but-skippable repair reservoirs**, not a checklist that every proficient learner must finish.

### B. Performance building

Clean tasks dominate learner time.

Stable performance exits quickly. Evidence capture stays small and automatic where possible.

### C. Consolidation / recurring-failure repair

Spend extra time only where evidence supports a reusable, recurring, expensive, or still-unstable failure.

Collapse dependent/cascading errors into their root cause. Do not collapse genuinely independent high-cost errors merely to preserve a one-thread aesthetic.

### D. Whole-paper execution / mock

Later preparation must train the full 180-minute paper: task order, pacing, switching, fatigue, completion, answer-sheet / delivery risk, and time-allocation tradeoffs.

This is a later phase, not a new permanent course. Per-task skill is necessary but does not prove whole-paper execution.

## 5. Default learner loop: performance first, review conditional

```text
Perform cleanly
→ Fast triage
→ EXIT / quick local correction / smallest repair / LexicalOS handoff
→ continue performance
```

Later fresh validation is created only when a justified reusable target exists. It is not a mandatory final node after every repair.

### Fast triage outcomes

**Stable / clean** → exit.

**One-off error that becomes clear quickly** → understand the decisive evidence / contrast / correction and move on. No mandatory taxonomy, Chat packet, repair thread, or transfer claim.

**Meaningful recurring / ambiguous / high-cost failure** → deep review; find the smallest sufficient repair and re-execute when that adds useful evidence.

**Lexical failure** → send the smallest lexical target to LexicalOS, then return to the originating task.

**Representation failure** → repair only the minimum proposition / relation structure needed, not an entire grammar course.

**Execution failure** → derive a compact behavior / pacing rule only when observable evidence supports it.

## 6. Wrong / Uncertain are signals, not automatic debt

`Wrong`, `Unanswered`, and `Uncertain` preserve evidence. They do not by themselves determine review depth.

- wrong / unanswered usually deserves at least quick triage;
- uncertain-correct is useful fragility evidence but may still fast-pass after a cheap check;
- repeated or high-cost uncertainty deserves deeper repair;
- stable correct / confident work should not expand.

Do not use `Uncertain` as a hidden rule that every fragile-correct item must become a full review session.

## 7. Attempt unit, diagnostic context, and repair scope are different things

For objective tasks, keep the **clean attempt unit** whole:

- Cloze: complete passage/set;
- Reading A: complete passage + its questions;
- Part B: complete material/set.

When deep Chat review is justified, the complete passage/set is the **diagnostic context envelope** because local errors may share causes or dependencies.

That does **not** mean every wrong / uncertain item requires a Chat handoff, nor that learner repair must remain whole-unit.

After diagnosis, repair scope may be local, coupled, shared, or structure-level.

## 8. Root-cause compression without false singularity

Prefer the smallest set of independent failures that explains the meaningful score loss.

```text
many dependent errors
→ one upstream repair
```

but also:

```text
two genuinely independent high-value failures
→ two repairs
```

“first meaningful failure” is a useful causal heuristic, not a ritual requiring repeated Chat loops until every later layer is rediscovered one at a time.

## 9. Evidence and transfer

Evidence strength generally rises as memory residue falls:

```text
same-item correction
< later clean success
< fresh task success on the same demand
< repeated stable performance under normal time pressure
```

`correct once ≠ mastery`, but `not mastery` does not mean `must schedule another test`.

A transfer target is justified only when future evidence could realistically change study allocation or confidence in a reusable behavior.

Pending targets are **backend observation state**. Their existence must not summon a learner task, panel, or fresh-material consumption by itself. Later normal work may validate them opportunistically when it genuinely tests the same demand.

## 10. Translation logic

Minimal Translation model:

```text
Represent the English meaning / relations
→ Reconstruct the same meaning in natural Chinese
→ Deliver under exam constraints
```

**Fidelity / preservation is an invariant across reconstruction**, not necessarily a separate sequential cognitive stage the learner must visit.

Useful diagnostic dimensions include omitted / added / distorted information, attachment, reference, scope, relation, degree/modality, and Chinese reconstruction quality.

Preserve the first translation because it exposes process failure. Stable calibrated work may PASS without full Chat review. Reference translations are optional post-attempt tools.

## 11. Writing logic

Minimal Writing primitives:

```text
1. Task / genre fulfillment
2. Content generation
3. Organization / development
4. English realization
5. Register + high-value error control
6. Timed delivery
```

Small Writing and Big Writing are **task-mode specializations**, not additional base primitives.

An integrated walkthrough is practice, not a primitive.

Therefore no exact number of teaching Blocks, checkpoints, or Active Checks is canonical merely because a current learning asset uses that decomposition.

Writing feedback should choose the smallest set of high-value independent failures, weighted by score impact and reuse. Do not repair cosmetic sophistication while more important task/content/control problems remain.

Chat review may be frequent during calibration because self-scoring is noisy and Writing is 30 points, but every future essay does not owe every internal review / repair-check state.

## 12. Teacher material and first-learning assets

Teacher / framework content is a repair reservoir.

- use it when performance exposes a real need;
- keep validated rules compact and executable;
- do not preserve chapter order as learner order by default;
- do not create a second course merely because rich material exists;
- do not delete valid knowledge when a learner-facing route is shortened.

## 13. Fresh material

Unseen true-exam, TPO, IELTS, and other held-out material is limited diagnostic capital.

Use synthetic / exposed material for teaching and software validation when sufficient. Consume fresh material for real performance, calibration, or high-value transfer — not to close a database state.

## 14. Interaction quality rule

A learner-facing action earns its place only if it materially improves:

- expected score;
- speed / reliability;
- repair quality;
- future transfer judgment;
- or return speed from failure to real performance.

No mandatory ritual unless it earns its place.

Recall, Orientation, Closure, Handoff, Memory, Framework, Active Check, repair check, and UI transitions are tools, not ceremonies.

## 15. Resume rule

Resume means **highest-value unfinished learner action**, not the most recently opened page.

Priority normally favors:

1. unfinished clean attempt;
2. already-active meaningful repair;
3. naturally relevant high-value validation;
4. otherwise a new high-value performance task.

Passed work and dormant pending claims must not drag the learner backward.

## 16. Acceptance boundary

Structural presence is not learner success.

```text
STRUCTURAL ≠ EXECUTED ≠ ADVERSARIAL ≠ REAL learner evidence
```

A validator may protect invariants, but it must not define a decomposition as correct merely because it can count exact Blocks, pages, strings, or state-machine nodes.

When a simpler implementation preserves knowledge truth and the same learning value with lower learner burden, the simpler implementation wins.