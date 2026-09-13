# English Objective Runtime v2

**Status:** RE-ACCEPTED LOGIC CANDIDATE  
**Scope:** shared objective-task runtime for Cloze, Reading A, and Part B.  
**Parent authority:** `content/english/LEARNING_CONTRACT.md`.

This owner defines only cross-task runtime semantics. Cloze, Reading A, and Part B keep their own task cognition.

## 1. Architecture

`Objective` is a scoring/runtime family, not a semantic super-course.

Shared kernel:

```text
represent relevant input
→ identify demand
→ identify real candidates
→ test against decisive evidence / constraints
→ adjudicate
→ execute
```

Task objects remain distinct:

- Cloze — slot-constraint best fit;
- Reading A — passage-evidence option adjudication;
- Part B — discourse reconstruction / assignment.

Lexical failures route to LexicalOS. Reusable non-lexical input-model failures route to shared English **Representation repair**. Current runtime key `reading` may remain a compatibility alias until the implementation is reconciled; it is not permission to create a second Reading course.

## 2. Attempt unit is whole; review is conditional

Clean attempts preserve task continuity:

- Cloze: complete passage/set;
- Reading A: complete passage + its question set;
- Part B: complete material/set.

Do not reveal correctness mid-unit.

After submission:

```text
clean stable → PASS → next
problem signal → fast triage
  → quick local understanding → next
  or
  → optional deep review
```

Wrong / unanswered normally deserves quick triage. Uncertain-correct is fragility evidence, not an automatic deep-review command.

## 3. Context envelope ≠ mandatory review ritual

When deep Chat review is justified, send enough of the complete passage/set for root-cause and dependency diagnosis.

This is the **diagnostic context envelope**. It is not a rule that every wrong or uncertain item must create a whole-unit Chat session.

The learner should not need to review Q1, Q2, Q3 as separate conversations, but neither should one obvious isolated miss force an elaborate whole-passage workflow.

## 4. Deep-review packet

An optional deep-review packet should preserve:

- unit identity;
- attempt score/timing when useful;
- compact full outcome map;
- complete passage/material once;
- expanded context for meaningful problem items;
- answer trajectory / uncertainty only when captured and useful.

Stable correct items remain compact.

The packet exists to let Chat answer:

```text
what actually caused score risk?
→ are errors independent, shared, coupled, or cascading?
→ what is the smallest useful repair set?
```

Do not create a packet merely because backend transfer state exists.

## 5. Repair-thread rule

A repair thread is a diagnostic / repair object, not a mandatory artifact for every miss.

When deep review is used:

- merge dependent/cascading items when one cause explains them;
- preserve genuinely independent high-value failures as separate threads;
- use the smallest sufficient scope: local / shared / coupled / structure;
- passive explanation alone does not count as completed repair when re-execution is needed to establish that the learner can now perform the action.

## 6. Runtime states are implementation tools

Minimal learner semantics are:

```text
ATTEMPT
→ PASS
or
→ TRIAGE
   → QUICK_RESOLVED
   or
   → REPAIR
      → return to performance
```

A backend transfer target may optionally exist after a repaired reusable task procedure, but `TRANSFER_PENDING` is **not a learner-facing required state** and does not create a scheduled action by itself.

Same-item correction is repair evidence, not mastery. Later normal fresh work is stronger evidence when it genuinely tests the same demand.

## 7. Cloze specialization

```text
context
→ slot demand
→ active lexical / syntactic / semantic / discourse constraints
→ real candidate competition
→ decisive constraint
→ best fit
```

Do not explain all four options by default.

Root-cause boundary:

- word-local sense / phrase / construction / collocation / confusable → LexicalOS;
- proposition / scope / relation / discourse representation → shared English Representation repair;
- representation available but best-fit procedure failed → Cloze-specific repair.

A wrong blank does not automatically become future review.

## 8. Reading A specialization

```text
question demand
→ decisive evidence
→ option propositions
→ decisive boundary / contrast
→ adjudicate
→ execute
```

Full passage remains available for deep diagnosis because several questions may share one representation / evidence failure. Quick one-off misses may be resolved locally without Chat.

## 9. Part B specialization

```text
rough discourse skeleton
→ required role / position
→ candidate role
→ backward / forward fit
→ cohesion evidence
→ global reconciliation
```

Because placements can be coupled, whole-set context is particularly valuable when deep review is needed. Repair may be local, coupled, or structure-level.

## 10. Evidence hierarchy

```text
remembered answer
< repaired known-item explanation
< targeted new contrast
< later fresh clean success
< repeated stable unseen transfer under normal time pressure
```

Use this hierarchy to make decisions, not to force a fixed evidence ladder.

## 11. Transfer is opportunistic

Only a reusable task-specific procedure that was actually repaired and still has meaningful uncertainty may become backend transfer state.

Rules:

- no permanent wrong-question bank;
- no automatic claim from one hesitation;
- no clean-task `TRANSFER_CHECK` merely because a pending claim exists;
- no consumption of fresh material solely to close a claim;
- a later problem may conservatively reopen a previously closed target only when the same procedure is genuinely implicated.

## 12. UI consequence

Learner-facing objective review should optimize:

```text
understand the miss cheaply
→ escalate only when needed
→ return to new performance
```

Question-level evidence may exist internally. Manual error taxonomy, evidence-span saving, handoff, repair-complete buttons, and transfer-state operations are optional tools, never completion requirements.

## 13. Reopen rule

This runtime may be changed when fresh learner evidence or a fresh logic/content audit shows that a frozen primitive or interaction creates avoidable burden or misses a real score-relevant mechanism.

A green validator is not sufficient reason to preserve a decomposition.